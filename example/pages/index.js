import { query } from '../mordred/graphql'

export const getStaticProps = async () => {
  const { data, errors } = await query(`
    {
      allFile {
        nodes {
          id
          content
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

export default ({ allFile }) => {
  return (
    <>
      <ul>
        {allFile.nodes.map((post) => {
          return (
            <li key={post.id}>
              <h2>{post.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
