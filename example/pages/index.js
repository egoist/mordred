import { query, gql } from '../../query'

export const getStaticProps = async () => {
  const { data } = await query(gql`
    {
      allMarkdownPosts {
        nodes {
          id
          contentHTML
          frontmatter {
            title
          }
        }
      }
    }
  `)

  return {
    props: {
      ...data,
    },
  }
}

export default ({ allMarkdownPosts }) => {
  return (
    <>
      <ul>
        {allMarkdownPosts.nodes.map((post) => {
          return (
            <li key={post.id}>
              <h2>{post.frontmatter.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: post.contentHTML }}></div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
