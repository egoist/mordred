import { client } from '../../mordred/graphql'

export { getStaticProps, default } from '../'

export const getStaticPaths = async () => {
  const { allMarkdown } = await client.query({
    allMarkdown: [
      {
        limit: 1,
      },
      {
        pageInfo: {
          pageCount: true,
        },
      },
    ],
  })
  const paths = new Array(allMarkdown.pageInfo.pageCount)
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
