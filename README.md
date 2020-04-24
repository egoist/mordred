## Mordred

## Table of Contents

<!-- toc -->

- [Install](#install)
- [Usage with Next.js](#usage-with-nextjs)
  - [Configuration](#configuration)
  - [Using Data](#using-data)
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
module.exports = {
  webpack(config) {
    const { MordredWebpackPlugin } = require('mordred/webpack')

    const mordredPlugin = new MordredWebpackPlugin({
      plugins: [
        {
          resolve: 'mordred-source-filesystem',
          options: {
            // This is where you'll be creating Markdown files
            path: __dirname + '/content',
          },
        },
        {
          resolve: 'mordred-source-markdown',
        },
      ],
    })

    config.plugins.push(mordredPlugin)
    return config
  },
}
```

### Using Data

Create a Markdown file in `content` folder (in your project root), like `content/my-first-posts.md`:

```markdown
---
title: My First Post
date: 2020-04-24
---

This is my **first** post!
```

When you run `next` or `next build`,Mordred will generate a GraphQL client in `mordred/` folder, then you can use the generated client to query data.

Now in any page, query data in `getStaticProps`:

```js
import { query, gql } from '../mordred/query'

export const getStaticProps = async () => {
  const { data, errors } = await query(gql`
    {
      allMarkdown {
        nodes {
          id
          slug
          createdAt
          updatedAt
          html
          frontmatter {
            # ... or any frontmatter
            # like:
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
    <ul>
      {allMarkdown.nodes.map((post) => {
        return (
          <li key={post.id}>
            <Link href={`/post/${post.slug}`}>{post.title}</Link>
          </li>
        )
      })}
    </ul>
  )
}
```

## Usage With Nuxt.js

We're waiting for Nuxt's full-static mode, it's already possible to use Mordred with Nuxt's `asyncData` though. We'll document this soon.

## License

MIT &copy; [EGOIST (Kevin Titor)](https://github.com/sponsors/egoist)
