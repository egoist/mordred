import { relative, join } from 'path'
import { PluginFactory } from 'mordred'
import { fetchIssues } from './api'

const plugin: PluginFactory<{ token?: string; user: string; repo: string }> = (
  ctx,
  { token, user, repo },
) => {
  const gql = ctx.gql
  return {
    name: 'source-github-issues',

    getSchema() {
      return gql`
        type GithubIssueNode {
          id: ID!
          mime: String!
          title: String
          content: String!
          createdAt: String!
          updatedAt: String!
          comments: Int
          labels: [GithubIssueNodeLabel!]
        }

        type GithubIssueNodeLabel {
          id: ID!
          name: String!
          color: String!
          description: String
        }

        type GithubIssueConnection {
          nodes: [GithubIssueNode!]!
        }

        extend type Query {
          allGithubIssue: GithubIssueConnection
        }
      `
    },

    createNodes() {
      return fetchIssues({ token, user, repo })
    },

    getResolvers: () => relative(ctx.outDir, join(__dirname, 'resolvers')),
  }
}

export default plugin
