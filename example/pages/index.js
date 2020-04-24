import { query } from '../mordred/graphql'

export const getStaticProps = async () => {
  const { data, errors } = await query(`
    {
      allMarkdown {
        nodes {
          id
          html
          createdAt
          frontmatter {
            title
          }
        }
      }
    }
  `)
  if (errors) {
    throw errors[0]
  }
  return {
    props: {
      ...data,
    },
  }
}

export default ({ allMarkdown }) => {
  return (
    <>
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
    </>
  )
}
