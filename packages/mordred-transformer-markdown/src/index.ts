import { PluginFactory } from 'mordred'
import grayMatter from 'gray-matter'
import { markdownPluginHeadings } from './markdown-plugin-headings'

const plugin: PluginFactory = (ctx, options) => {
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
        ${[...frontmatterKeys].map((key) => {
          return `frontmatter_${key}`
        })}
      }

      enum MarkdownNodeOrder {
        ASC
        DESC
      }

      type MarkdownNodeHeading {
        depth: Int!
        text: String!
      }

      type MarkdownNode {
        ${FileNode}
        html: String!
        headings: [MarkdownNodeHeading!]!
        frontmatter: ${
          frontmatterKeys.size === 0 ? 'JSON' : `MarkdownFrontMatter`
        }
      }

      type MarkdownPageInfo {
        hasPrevPage: Boolean!
        hasNextPage: Boolean!
        pageCount: Int!
      }

      type MarkdownConnection {
        nodes: [MarkdownNode]
        pageInfo: MarkdownPageInfo!
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

            const markdownNodes = nodes.filter(node => {
              return node.type === 'Markdown'
            }).sort((a, b) => {
              const aValue = getValue(a, orderBy)
              const bValue = getValue(b, orderBy)
              if (order === 'ASC') {
                return aValue > bValue ? 1 : -1
              }
              return aValue > bValue ? -1 : 1
            })
            const endIndex = args.limit ? (skip + args.limit) : markdownNodes.length
            const result = markdownNodes.slice(skip, endIndex)
            const pageCount = args.limit ?  Math.ceil(markdownNodes.length / args.limit) : 1
            const hasNextPage = endIndex < markdownNodes.length
            const hasPrevPage = skip > 0
            return {
              nodes: result,
              pageInfo: {
                hasPrevPage,
                hasNextPage,
                pageCount
              }
            }
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
          const Markdown = require('markdown-it')
          const md = new Markdown({
            html: options.html !== false,
            breaks: options.breaks,
            linkify: options.linkify,
            typographer: options.typographer,
            highlight: options.highlight,
            quotes: options.quotes,
            langPrefix: options.langPrefix,
          })
          md.use(markdownPluginHeadings)
          const env = {headings: []}
          const html = md.render(content, env)
          return {
            ...node,
            id: `Markdown::${node.id}`,
            type: 'Markdown',
            content,
            html,
            headings: env.headings,
            frontmatter: data,
          }
        })

      return nodes
    },
  }
}

export default plugin
