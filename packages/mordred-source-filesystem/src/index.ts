import { resolve } from 'path'
import glob from 'fast-glob'
import { fileToNode, FILE_NODE_TYPE, getFileNodeId } from './to-node'
import { PluginFactory, Mordred } from 'mordred'

const plugin: PluginFactory = (
  ctx,
  { path = 'content', include = '**/*.md' }
) => {
  const gql = ctx.gql
  const contentDir = resolve(process.env.__MORDRED_CONTEXT!, path)
  const contentGlobs = [...(Array.isArray(include) ? include : [include])]

  return {
    name: 'source-filesystem',

    getSchema() {
      return gql`
        type FileNode {
          id: String!
          type: String!
          mime: String
          createdAt: String!
          updatedAt: String!
          content: String!
          relativePath: String!
          absolutePath: String!
          slug: String!
        }

        type FileConnection {
          nodes: [FileNode!]!
        }

        extend type Query {
          allFile: FileConnection!
        }
      `
    },

    getResolvers() {
      return `{
        Query: {
          allFile() {
            const result = nodes.filter(
              (node) => node.type === "${FILE_NODE_TYPE}"
            )
            return {
              nodes: result,
            }
          }
        }
      }`
    },

    async createNodes() {
      const files = await glob(contentGlobs, {
        cwd: contentDir,
      })

      const nodes = await Promise.all(
        files.map((filename) => {
          return fileToNode(filename, contentDir, ctx.mime.getType)
        })
      )

      return nodes
    },

    async onInit() {
      if (process.env.NODE_ENV === 'development') {
        const { watch } = await import('chokidar')
        watch(contentGlobs, {
          cwd: contentDir,
          ignoreInitial: true,
        })
          .on('all', async () => {
            await ctx.createNodes()
            await ctx.writeAll()
          })
      }
    },
  }
}

export default plugin
