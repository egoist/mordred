const getValue = (obj: any, path: string) => {
  if (path.startsWith('frontmatter__')) {
    return obj.frontmatter[path.replace('frontmatter__', '')]
  }
  return obj[path]
}

export default ({ nodes }: { nodes: any[] }) => {
  return {
    Query: {
      markdownBySlug(_: any, args: any) {
        const node = nodes.find(
          (node) => node.type === 'Markdown' && node.slug === args.slug,
        )
        return node
      },

      allMarkdown(_: any, args: any) {
        const orderBy = args.orderBy || 'createdAt'
        const order = args.order || 'DESC'
        const skip = args.skip || 0

        const markdownNodes = nodes
          .filter((node) => {
            return node.type === 'Markdown'
          })
          .sort((a, b) => {
            const aValue = getValue(a, orderBy)
            const bValue = getValue(b, orderBy)
            if (order === 'ASC') {
              return aValue > bValue ? 1 : -1
            }
            return aValue > bValue ? -1 : 1
          })
        const endIndex = args.limit ? skip + args.limit : markdownNodes.length
        const result = markdownNodes.slice(skip, endIndex)
        const pageCount = args.limit
          ? Math.ceil(markdownNodes.length / args.limit)
          : 1
        const hasNextPage = endIndex < markdownNodes.length
        const hasPrevPage = skip > 0
        return {
          nodes: result,
          pageInfo: {
            hasPrevPage,
            hasNextPage,
            pageCount,
          },
        }
      },
    },
  }
}
