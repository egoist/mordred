import { query, gql } from '../../mordred/graphql'

export { getStaticProps, default } from '../'

export const getStaticPaths = async () => {
  const { data, errors } = await query(gql`
    query {
      allMarkdown(limit: 1) {
        pageInfo {
          pageCount
        }
      }
    }
  `)
  if (errors) {
    throw errors[0]
  }
  const paths = new Array(data.allMarkdown.pageInfo.pageCount)
    .fill(null)
    .map((_, i) => {
      return {
        params: {
          page: String(i + 2),
        },
      }
    })
  return {
    fallback: false,
    paths,
  }
}
