import Link from 'next/link'
import { query } from '../mordred/graphql'

export const getStaticProps = async ({ params = {} }) => {
  const limit = 1
  const page = Number(params.page || 1)
  const skip = (page - 1) * limit
  const { data, errors } = await query(
    `
    query ($skip: Int!, $limit: Int!){
      allMarkdown(skip: $skip, limit: $limit) {
        nodes {
          id
          html
          createdAt
          frontmatter {
            title
          }
        }
        pageInfo {
          hasNextPage
          hasPrevPage
        }
      }
    }
  `,
    {
      variables: {
        skip,
        limit,
      },
    }
  )
  if (errors) {
    throw errors[0]
  }
  return {
    props: {
      page,
      ...data,
    },
  }
}

export default ({ allMarkdown, page }) => {
  return (
    <>
      <Link href="/about">
        <a>About</a>
      </Link>
      <ul>
        {allMarkdown.nodes.map((post) => {
          return (
            <li key={post.id}>
              <h2>{post.frontmatter.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
            </li>
          )
        })}
      </ul>
      <div>
        {allMarkdown.pageInfo.hasPrevPage && (
          <Link href={page === 2 ? `/` : `/page/${page - 1}`}>
            <a>Prev Page</a>
          </Link>
        )}
        {' '}
        {allMarkdown.pageInfo.hasNextPage && (
          <Link href={`/page/${page + 1}`}>
            <a>Next Page</a>
          </Link>
        )}
      </div>
    </>
  )
}
