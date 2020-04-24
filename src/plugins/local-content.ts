import { join } from 'path'
import glob from 'fast-glob'
import { PluginFactory } from '../plugin'
import { fileToNode, FILE_NODE_TYPE, getFileNodeId } from '../to-node'
import { State } from '../query'

const plugin: PluginFactory = (ctx) => {
  const gql = ctx.gql
  return {
    name: 'local-content',

    async onInit() {
      const fileGlobs = '**/*.md'
      const contentDir = join(process.env.__MORDRED_CONTEXT!, 'content')
      const files = await glob(fileGlobs, {
        cwd: contentDir,
      })

      await Promise.all(
        files.map(async (filename) => {
          await setNode(ctx.state, filename, contentDir)
        })
      )

      ctx.setResolvers({
        allMarkdownPosts() {
          const nodes = [...ctx.state.nodes.values()].filter(
            (node) => node.type === FILE_NODE_TYPE
          )
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
      })

      const frontmatterKeys = ctx.state.frontmatterKeys

      const frontmatterTypes =
        frontmatterKeys.size > 0
          ? [...frontmatterKeys]
              .filter((key) => {
                return !['title', 'date', 'updated'].includes(key)
              })
              .map((key) => {
                return `${key}: JSON`
              })
              .join('\n')
          : ``

      ctx.setSchema(gql`  
    type MarkdownPost {
      id: String!
      title: String
      date: String!
      updated: String!
      content: String!
      contentHTML: String!
      ${frontmatterTypes}
    }
  
    type MarkdownPostConnection {
      nodes: [MarkdownPost!]!
    }
  
    extend type Query {
      allMarkdownPosts: MarkdownPostConnection!
    }
    `)

      if (process.env.NODE_ENV === 'development') {
        const { watch } = await import('chokidar')
        watch(fileGlobs, {
          cwd: contentDir,
          ignoreInitial: true,
        })
          .on('add', async (filename) => {
            await setNode(ctx.state, filename, contentDir)
            ctx.refreshSchema()
          })
          .on('unlink', (filename) => {
            const nodeId = getFileNodeId(filename)
            ctx.state.nodes.delete(nodeId)
            ctx.refreshSchema()
          })
          .on('change', async (filename) => {
            await setNode(ctx.state, filename, contentDir)
            ctx.refreshSchema()
          })
      }
    },
  }
}

export default plugin

async function setNode(state: State, filename: string, cwd: string) {
  const node = await fileToNode(filename, cwd)
  state.nodes.set(node.id, node)
  for (const key of node.frontmatterKeys) {
    state.frontmatterKeys.add(key)
  }
  return node
}
