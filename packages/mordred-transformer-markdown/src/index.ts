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
        allMarkdown: MarkdownConnection
      }
      `
    },

    getResolvers() {
      return `{
        Query: {
          allMarkdown() {
            const result = nodes.filter(node => {
              return node.type === 'Markdown'
            })
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
