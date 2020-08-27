const { PubSub, withFilter } = require("apollo-server")
const { User, Message, Room } = require('./models')
const mongoose = require('mongoose');
const uri = "mongodb+srv://admin:033660468@cluster0.ulm8l.mongodb.net/chat_app?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});


const pubsub = new PubSub()


module.exports = {
    Query: {
        users: () => User.find(),
        messages: () => Message.find()
    },

    User: {
        messages: async ({ email }) => {
            return Message.find({ senderMail: email })
        }
    },

    Room: {
        messages: async ({ roomName }) => {
            return Room.find({ roomName: roomName })
        }
    },

    Message: {
        user: async ({ user }) => {
            return Room.find({ messages: user })
        }
    },

    Mutation: {
        createUser: async (_, { name, email }) => {
            const user = new User({ name, email })
            await user.save()
            pubsub.publish("newUser", { newUser: user })
            return user
        },

        updateUser: async (_, { id, name }) => {
            const user = await User.findOneAndUpdate(
                { _id: id },
                { name },
                { new: true }
            );
            return user
        },

        deleteUser: async (_, {email} ) => {
            await Promise.all([
                User.findOneAndDelete({email: email}),
                Message.deleteMany({ senderMail: email})
            ])
            pubsub.publish("oldUser", { oldUser: email })
            return true
        },

        userTyping: (_, { email, receiverMail }) => {
            pubsub.publish("userTyping", { userTyping: email, receiverMail })   
            return true
        },

        createMessage: async (
            _,
            { user, roomName , message }
        ) => {  
                const newMessRoom = await Room.countDocuments({roomName}, (err, count) => {
                    console.log(count);
                    if(count > 0) {
                        Room.findOneAndUpdate(
                            { roomName },
                            {
                                $push: {
                                    messages: {"userName": user.userName, message}
                            }
                        }, function (err, doc){
                            // doc is a Document
                            console.log('push  ok');
                            const room = {
                                roomName: doc.roomName,
                                messages: doc.messages
                            }
                            return room
                        })
                    } else {
                        Room.create(
                            {
                                roomName,
                                messages : { "userName": user.userName, message }
                            }, function (err, doc){
                                // doc is a Document
                                const room = {
                                        roomName: doc.roomName,
                                        messages: doc.messages
                                }
                                return room
                            }   
                        )
                        console.log('create ok');
                    }
                }) 

                console.log(newMessRoom);
                return newMessRoom  
        },

        updateMessage: async (_, {id , message}) => {
            const userText = await Message.findOneAndUpdate(
                { _id: id },
                { message },
                { new: true }
            )
            return userText
        },

        deleteMessage: async (_, {id}) => {
            await Message.findOneAndDelete({ _id: id })
            return true
        }
    },

    Subscription: {
        newMessage: {
            subscribe: withFilter(
                () => pubsub.asyncIterator("newMessage"),
                (payload, variables) => {
                    return payload.user === variables.user
                }
            )
        },

        newUser: {
            subscribe: (_, {}, { pubsub }) => {
                return pubsub.asyncIterator("newUser")
            }
        },

        oldUser: {
            subscribe: (_, {}, { pubsub }) => {
                return pubsub.asyncIterator("oldUser")
            }
        },

        userTyping: {
            subscribe: withFilter(
                () => pubsub.asyncIterator("userTyping"),
                (payload, variables) => {
                    return payload.receiverMail === variables.receiverMail
                }
            )
        }
    }
}


