import { GithubIssueNodeType } from './api'

export default ({ nodes }: { nodes: any[] }) => {
  return {
    Query: {
      allGithubIssue() {
        const result = nodes.filter((node) => node.type === GithubIssueNodeType)
        return {
          nodes: result,
        }
      },
    },
  }
}
