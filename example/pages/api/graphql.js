import express from 'express'
import graphqlHTTP from 'express-graphql'
import { schema, resolvers } from '../../mordred/graphql'

export default express().use(graphqlHTTP({
  graphiql: true,
  schema,
  rootValue: resolvers
}))