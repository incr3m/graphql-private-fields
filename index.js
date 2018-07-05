const express = require('express');
const graphqlHTTP = require('express-graphql');
const { makeExecutableSchema, forEachField, FilterTypes } = require('graphql-tools');
const { transformSchema } =  require('graphql-transform-schema')

const get = require('lodash/get');

const app = express();

const typeDefs = `

  type Post {
    id: Int!
    title: String
    votes: Int
  }

  # the schema allows the following query:
  type Query {
    posts: [Post]
    _coolPosts: [Post]
  }

  # this schema allows the following mutation:
  type Mutation {
    upvotePost (
      postId: Int!
    ): Post
  }
`;

const resolvers = {
    Query: {
      posts: () => [{id:12,title:'hehe'}],
      _coolPosts: () => [{id:12,title:'hehe'}],
    },
}

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const privateRootTypes = {};
const rootTypes = ["Query","Mutation","Subscription"];
rootTypes.forEach(rootType=>{
  Object.keys(schema[`get${rootType}Type`]()?schema[`get${rootType}Type`]().getFields():[])
    .forEach(field=>{
      if(field.startsWith('_')){
        privateRootTypes[rootType] = privateRootTypes[rootType] || {};
        privateRootTypes[rootType][field] = false
      }
    })
})

console.log('privateRootTypes');
console.log(privateRootTypes);

const transformedSchema = transformSchema(schema,{...privateRootTypes});

app.use('/graphql', graphqlHTTP({
  schema: transformedSchema,
  graphiql: true
}));

app.listen(4000);