import { join } from 'path'
import glob from 'fast-glob'
import { graphql, GraphQLSchema, buildSchema } from 'graphql'
import { readFile } from 'fs-extra'
import { GraphQLJSON } from 'graphql-type-json'
import { Node, fileToNode, getFileNodeId } from './to-node'

export const state: {
  initialized: boolean
  frontmatterKeys: Set<string>
  schema?: GraphQLSchema
  resolvers?: any
  nodes: Map<string, Node>
} = {
  initialized: false,
  frontmatterKeys: new Set(),
  nodes: new Map(),
}

export async function query(query: string) {
  await init()
  const response = await graphql(state.schema!, query, state.resolvers!)
  return response.data
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

  const fileGlobs = '**/*.md'
  const contentDir = join(process.env.__MORDRED_CONTEXT, 'content')
  const files = await glob(fileGlobs, {
    cwd: contentDir,
  })

  await Promise.all(
    files.map(async (filename) => {
      await setNode(filename, contentDir)
    })
  )

  state.schema = createSchema()

  const resolvers = {
    allMarkdownPosts() {
      const nodes = [...state.nodes.values()]
      return {
        nodes,
        pageInfo: {
          hasNext: false,
          hasPrev: false,
          nextLink: '',
          prevLink: '',
        },
      }
    },
    JSON: GraphQLJSON,
  }

  state.resolvers = resolvers

  if (process.env.NODE_ENV === 'development') {
    const { watch } = await import('chokidar')
    watch(fileGlobs, {
      cwd: contentDir,
      ignoreInitial: true,
    })
      .on('add', async (filename) => {
        await setNode(filename, contentDir)
        state.schema = createSchema()
      })
      .on('unlink', (filename) => {
        const nodeId = getFileNodeId(filename)
        state.nodes.delete(nodeId)
        state.schema = createSchema()
      })
      .on('change', async (filename) => {
        await setNode(filename, contentDir)
        state.schema = createSchema()
      })
  }
}

export function gql(literals: string[], ...variables: any[]) {
  return literals
    .map((l, i) => {
      const variable = variables[i]
      return `${l}${variable ? variable : ''}`
    })
    .join('')
}

async function setNode(filename: string, cwd: string) {
  const node = await fileToNode(filename, cwd)
  state.nodes.set(node.id, node)
  for (const key of node.frontmatterKeys) {
    state.frontmatterKeys.add(key)
  }
  return node
}

function createSchema() {
  return buildSchema(`
  scalar JSON

type FrontMatter {
  ${[...state.frontmatterKeys]
    .map((key) => {
      return `${key}: JSON`
    })
    .join('\n')}
}

type MarkdownPost {
  id: String!
  title: String
  createdAt: String!
  updatedAt: String!
  content: String!
  contentHTML: String!
  frontmatter: FrontMatter!
}

type MarkdownPostConnection {
  nodes: [MarkdownPost!]!
}

  type Query {
    allMarkdownPosts: MarkdownPostConnection!
  }
`)
}
