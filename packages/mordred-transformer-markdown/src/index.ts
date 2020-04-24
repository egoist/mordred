import { PluginFactory } from 'mordred'
import grayMatter from 'gray-matter'

const plugin: PluginFactory = (ctx) => {
  const frontmatterKeys: Set<string> = new Set()

  return {
    name: 'transformer-markdown',

    getSchema() {
      const fileSchema = ctx.getPluginSchema('source-filesystem')
      const matched = /type\s+FileNode\s+{([^}]+)}/.exec(fileSchema)
      const FileNode = matched && matched[1]

      const MarkdownFrontMatter =
        frontmatterKeys.size === 0
          ? ''
          : `type MarkdownFrontMatter {
        ${[...frontmatterKeys]
          .map((key) => {
            return `${key}: JSON`
          })
          .join('\n')}
      }`

      return `
      ${MarkdownFrontMatter}

      enum MarkdownNodeOrderBy {
        createdAt
        updatedAt
        ${[...frontmatterKeys].map(key => {
          return `frontmatter_${key}`
        })}
      }

      enum MarkdownNodeOrder {
        ASC
        DESC
      }

      type MarkdownNode {
        ${FileNode}
        html: String!
        frontmatter: ${
          frontmatterKeys.size === 0 ? 'JSON' : `MarkdownFrontMatter`
        }
      }

      type MarkdownConnection {
        nodes: [MarkdownNode]
      }

      extend type Query {
        markdownBySlug(slug: String!): MarkdownNode

        allMarkdown(orderBy: MarkdownNodeOrderBy, order: MarkdownNodeOrder, limit: Int, skip: Int): MarkdownConnection
      }
      `
    },

    getResolvers() {
      return `{
        Query: {
          markdownBySlug(parent, args) {
            const node = nodes.find(node => node.type === 'Markdown' && node.slug === args.slug)
            return node
          },

          allMarkdown(parent, args) {
            const orderBy = args.orderBy || 'createdAt'
            const order = args.order || 'DESC'
            const skip = args.skip || 0
            const getValue = (obj, path) => {
              if (path.startsWith('frontmatter_')) {
                return obj.frontmatter[path.replace('frontmatter_', '')]
              }
              return obj[path]
            } 

            let result = nodes.filter(node => {
              return node.type === 'Markdown'
            }).sort((a, b) => {
              const aValue = getValue(a, orderBy)
              const bValue = getValue(b, orderBy)
              if (order === 'ASC') {
                return aValue > bValue ? 1 : -1
              }
              return aValue > bValue ? -1 : 1
            })
            result = result.slice(skip, args.limit ? (skip + args.limit) : result.length)
            return {
              nodes: result
            }
          }
        },
        MarkdownNode: {
          html(parent) {
            const Markdown = require('markdown-it')
            const md = new Markdown({
              html: true
            })

            const html = md.render(parent.content, {})
            return html
          }
        }
      }`
    },

    createNodes() {
      const nodes = [...ctx.nodes.values()]
        .filter((node) => {
          return node.mime === 'text/markdown'
        })
        .map((node) => {
          const { data, content } = grayMatter(node.content)
          for (const key of Object.keys(data)) {
            frontmatterKeys.add(key)
          }
          return {
            ...node,
            id: `Markdown::${node.id}`,
            type: 'Markdown',
            content,
            frontmatter: data,
          }
        })

      return nodes
    },
  }
}

export default plugin
