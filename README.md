## Install

```bash
yarn add mordred
```

## Guide

### With Next.js

#### Configuration

In `next.config.js`:

```js
const withMordred = require('mordred/next')

module.exports = withMordred({})({
  // Your next.js config
})
```

#### Use Data

In any page, fetch data with `getStaticProps`:

```js
import query from 'mordred/query'

export const getStaticProps = () => {
  const { allMarkdownPosts } = await query(`
  {
    allMarkdownPosts {
      nodes {
        id
        date
        updated
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
      allMarkdownPosts
    }
  }
}

export default ({ allMarkdownPosts }) => {
  return <>
  <ul>
    {allMarkdownPosts.map(post => {
      return <li key={post.id}>
      {post.frontmatter.title}
      </li>
    })}
  </ul>
  </>
}
```

### With Nuxt.js

[TODO]

## License

MIT &copy; [EGOIST (Kevin Titor)](https://github.com/sponsors/egoist)