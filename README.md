## Mordred

## Table of Contents

<!-- toc -->

- [Install](#install)
- [Usage with Next.js](#usage-with-nextjs)
  * [Configuration](#configuration)
  * [Using Data](#using-data)
- [Usage With Nuxt.js](#usage-with-nuxtjs)
- [License](#license)

<!-- tocstop -->

## Install

```bash
yarn add mordred
```

## Usage with Next.js

### Configuration

In `next.config.js`:

```js
const withMordred = require('mordred/next')

module.exports = withMordred({})({
  // ..rest of your next.js config
})
```

### Using Data

Create a Markdown file in `content` folder (in your project root), like `content/my-first-posts.md`:

```markdown
---
title: My First Post
date: 2020-04-24
---

This is my __first__ post!
```

In any page, fetch data with `getStaticProps`:

```js
import { query, gql } from 'mordred/query'

export const getStaticProps = async () => {
  const { allMarkdownPosts } = await query(gql`
  {
    allMarkdownPosts {
      nodes {
        id
        # frontmatter.date
        # fallback to file creation time
        date
        # frontmatter.updated
        # fallback to file modification time
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

## Usage With Nuxt.js

[TODO]

## License

MIT &copy; [EGOIST (Kevin Titor)](https://github.com/sponsors/egoist)