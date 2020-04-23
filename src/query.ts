import { join } from 'path'
import glob from 'fast-glob'
import { graphql, GraphQLSchema, buildSchema } from 'graphql'
import { GraphQLJSON } from 'graphql-type-json'
import { Node, fileToNode, getFileNodeId } from './to-node'
import localContentPlugin from './plugins/local-content'
import { Plugin, PluginContext } from './plugin'

export type State = {
  initialized: boolean
  frontmatterKeys: Set<string>
  schema?: GraphQLSchema
  resolvers?: any
  nodes: Map<string, Node>
  createSchema: () => void
  createResolvers: () => void
}

const createSchema = () => {
  const schema = `
  scalar JSON

  type Query {
    hello: String
  }
  ` + (plugins.map((plugin) => plugin.context.schema).join('\n\n'))
  state.schema = buildSchema(
    schema
  )
}

const createResolvers = () => {
  state.resolvers = plugins.reduce((resolvers, plugin) => {
    return {
      ...resolvers,
      ...plugin.context.resolvers,
    }
  }, {
    JSON: GraphQLJSON
  })
}

export const state: State = {
  initialized: false,
  frontmatterKeys: new Set(),
  nodes: new Map(),
  createSchema,
  createResolvers,
}

const plugins = [localContentPlugin].map((pluginFactory) => {
  const context = new PluginContext(state)
  const plugin = pluginFactory(context)
  return {
    context,
    plugin,
  }
})

export async function query(query: string) {
  await init()
  const response = await graphql(state.schema!, query, state.resolvers!)
  return response
}

export async function init() {
  if (state.initialized) {
    return
  }

  if (!process.env.__MORDRED_CONTEXT) {
    throw new Error(
      `Please use the Next.js plugin "withNext" in your "next.config.js" first`
    )
  }

  for (const plugin of plugins) {
    await plugin.plugin.onInit()
  }

  state.createSchema()
  state.createResolvers()
}

export { gql } from './gql'