import express from 'express'
import graphqlHTTP from 'express-graphql'
import { init, state } from './query'

export function createServerHandler(options: { graphiql?: boolean } = {}) {
  const { graphiql } = options
  return async (req: any, res: any) => {
    await init()
    const app = express()
    app.use(
      graphqlHTTP({
        schema: state.schema!,
        rootValue: state.resolvers,
        graphiql,
      })
    )
    return app(req, res)
  }
}
