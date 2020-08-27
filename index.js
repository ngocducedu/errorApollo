const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');
const { PubSub } = require('apollo-server');
const uri = "mongodb+srv://admin:033660468@cluster0.ulm8l.mongodb.net/chat_app?retryWrites=true&w=majority";
const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')

const pubsub = new PubSub();

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const server = new ApolloServer({ typeDefs, resolvers, context: { pubsub }
});

// Launch the server
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
  // User.find().then( user => console.log(user))
});
