import axios from 'axios'

export const GithubIssueNodeType = 'GithubIssue'

export const fetchIssues = async ({
  token,
  user,
  repo,
}: {
  token?: string
  user: string
  repo: string
}) => {
  const { data } = await axios.get(
    `https://api.github.com/repos/${user}/${repo}/issues?per_page=100`,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : null,
      },
    },
  )
  return data.map((item: any) => ({
    id: item.id,
    type: GithubIssueNodeType,
    mime: 'text/markdown',
    title: item.title,
    content: item.body,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    comments: item.comments,
    labels: item.labels,
  }))
}
