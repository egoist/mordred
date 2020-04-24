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

    async onInit() {
      const files = await glob(contentGlobs, {
        cwd: contentDir,
      })

      await Promise.all(
        files.map(async (filename) => {
          await setNode(ctx.mordred, filename, contentDir)
        })
      )

      ctx.setResolvers(`{
        allFile() {
          const result = [...nodes.values()].filter(
            (node) => node.type === "${FILE_NODE_TYPE}"
          )
          return {
            nodes: result,
          }
        },
      }`)

      ctx.setSchema(gql`
        type File {
          id: String!
          type: String!
          createdAt: String!
          updatedAt: String!
          content: String!
          relativePath: String!
          absolutePath: String!
          slug: String!
        }

        type FileConnection {
          nodes: [File!]!
        }

        extend type Query {
          allFile: FileConnection!
        }
      `)

      if (process.env.NODE_ENV === 'development') {
        const { watch } = await import('chokidar')
        watch(contentGlobs, {
          cwd: contentDir,
          ignoreInitial: true,
        })
          .on('add', async (filename) => {
            await setNode(ctx.mordred, filename, contentDir)
            ctx.writeAll()
          })
          .on('unlink', (filename) => {
            const nodeId = getFileNodeId(filename)
            ctx.mordred.nodes.delete(nodeId)
            ctx.writeAll()
          })
          .on('change', async (filename) => {
            await setNode(ctx.mordred, filename, contentDir)
            ctx.writeAll()
          })
      }
    },
  }
}

export default plugin

async function setNode(mordred: Mordred, filename: string, cwd: string) {
  const node = await fileToNode(filename, cwd)
  mordred.nodes.set(node.id, node)
  return node
}
