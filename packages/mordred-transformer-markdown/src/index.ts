import { join, relative } from 'path'
import { PluginFactory } from 'mordred'
import grayMatter from 'gray-matter'
import { markdownPluginHeadings } from './markdown-plugin-headings'

const plugin: PluginFactory<{
  inputNodeTypes?: string[]
  [k: string]: any
}> = (ctx, options) => {
  const frontmatterKeys: Set<string> = new Set()
  const inputNodeTypes: Set<string> = new Set()
  const gql = ctx.gql

  return {
    name: 'transformer-markdown',

    getSchema(typeDefs) {
      const types = typeDefs.join('\n')
      const extraNodeFields: Array<string | null> = []

      for (const type of inputNodeTypes) {
        const re = new RegExp(`type\\s+${type}\\s+{([^}]+)}`)
        const m = re.exec(types)
        if (m) {
          extraNodeFields.push(m[1])
        } else {
          extraNodeFields.push(null)
        }
      }

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

      return gql`
      ${MarkdownFrontMatter}

      enum MarkdownNodeOrderBy {
        createdAt
        updatedAt
        ${[...frontmatterKeys].map((key) => {
          return 'frontmatter__' + key
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
        html: String!
        headings: [MarkdownNodeHeading!]!
        frontmatter: ${
          frontmatterKeys.size === 0 ? 'JSON' : 'MarkdownFrontMatter'
        }
      }

      ${extraNodeFields
        .map((fields) => {
          return `
          extend type MarkdownNode {
            ${fields}
          }`
        })
        .join('\n')}


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

    getResolvers: () => relative(ctx.outDir, join(__dirname, 'resolvers')),

    createNodes() {
      frontmatterKeys.clear()
      inputNodeTypes.clear()

      const nodes = [...ctx.nodes.values()]
        .filter((node) => {
          return node.mime === 'text/markdown'
        })
        .map((node) => {
          const { data, content } = grayMatter(node.content)
          for (const key of Object.keys(data)) {
            frontmatterKeys.add(key)
          }
          inputNodeTypes.add(`${node.type}Node`)
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
          const env = { headings: [] }
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
