'use strict'
const mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema

const UserSchema = new Schema({
    userName: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
    },
    hash_password: {
        type: String,
        required: true
    },
    is_active: {
        type: Boolean,
        default: false
    },
    created: {
        type: Date,
        default: Date.now
    }
})

const RoomSchema = new Schema({
    roomName: {type: String, lowercase: true},
    messages: [
        {
        userName: {type: String},
        message: {type: String}
        }
    ],
    created: {
        type: Date,
        default: Date.now
    }
})

const MessageSchema = new Schema({
    user: UserSchema,
    roomName: {type: String, unique: true, lowercase: true},
    message: String,
    created: {
        type: Date,
        default: Date.now
    }
})


// ham so sanh password truyen vao voi hash password luu trong csdl
UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.hash_password)
}


// const MessageSchema = new Schema({
//     message: String,
//     senderMail: String,
//     receiverMail: String,
//     timestamp: Number
// })

const User = mongoose.model('User', UserSchema)
const Message = mongoose.model('Message', MessageSchema)
const Room = mongoose.model('Room', RoomSchema)

module.exports = { User, Message, Room }