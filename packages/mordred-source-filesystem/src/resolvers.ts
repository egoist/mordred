import { FILE_NODE_TYPE } from './to-node'

export default ({ nodes }: { nodes: any[] }) => {
  return {
    Query: {
      allFile(parent: any, args: any) {
        const result = nodes.filter((node) => node.type === FILE_NODE_TYPE)
        return {
          nodes: result,
        }
      },
    },
  }
}
