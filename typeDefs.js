const { gql } = require('apollo-server');

module.exports = gql`
  type Query {
    users: [User]
    messages: [Message]
  }

  type User {
    userName: String!
    email: String!
    hash_password: String!
    messages: [Message]
  }

  type Message {
    _id: ID
    user: User
    userName: String
    roomName: String!
    message: String!
    created: Float! 
  }

  type Room {
    roomName: String,
    messages: [Message]
  }


  input UserInput {
    userName: String,
    email: String,
    hash_password: String
  }

  type Mutation {
    createUser(name: String! email: String!): User!
    updateUser(id: ID! name: String!): User!
    deleteUser(email: String!): Boolean!
    userTyping(email: String! receiverMail: String!): Boolean!

    createMessage(user: UserInput! roomName: String! message: String!): Room
    updateMessage(id: ID! message: String!): Message!
    deleteMessage(id: String!): Boolean!
  }

  type Subscription {
    newMessage(receiverMail: String!): Message
    newUser: User
    oldUser: String
    userTyping (receiverMail: String!): String
  }
`