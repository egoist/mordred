## 🤺 Mordred 

__Source data from anywhere, for Next.js, Nuxt.js, Eleventy and many more.__

## Features

- ✅ Query any data (Markdown, API, database, CMS) with GraphQL
- ✅ Framework agnostic, works with any framework that has SSG support
- ✅ Tons of plugins for popular headless CMS (not yet, we need your contribution!) 

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Install](#install)
- [Usage with Next.js](#usage-with-nextjs)
  - [Configuration](#configuration)
  - [Using Data](#using-data)
  - [Exploring Data with GraphiQL](#exploring-data-with-graphiql)
- [Usage With Nuxt.js](#usage-with-nuxtjs)
- [Plugin List](#plugin-list)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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

    const mordredPlugin = new MordredWebpackPlugin()
    config.plugins.push(mordredPlugin)
    return config
  },
}
```

Then create a `mordred.config.js` in the same directory and use some plugins:

```js
module.exports = {
  plugins: [
    {
      resolve: 'mordred-source-filesystem',
      options: {
        // This is where you'll be creating Markdown files
        path: __dirname + '/content',
      },
    },
    {
      resolve: 'mordred-transformer-markdown',
    },
  ],
}
```

You also need to install these plugins:

```bash
yarn add mordred-source-filesystem mordred-transformer-markdown
```

### Using Data

Create a Markdown file in `content` folder (in your project root), like `content/my-first-posts.md`:

```markdown
---
title: My First Post
date: 2020-04-24
---

This is my **first** post!
````

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

### Exploring Data with GraphiQL

You can create an API at `/api/graphql` to explore data via GraphiQL:

```js
import express from 'express'
import graphqlHTTP from 'express-graphql'
import { schema } from '../../mordred/graphql'

const app = express()

app.use(
  graphqlHTTP({
    schema,
    graphiql: true,
  })
)

export default app
```

## Usage With Nuxt.js

We're waiting for Nuxt's full-static mode, it's already possible to use Mordred with Nuxt's `asyncData` though. We'll document this soon.

## Plugin List

- [mordred-source-filesystem](/packages/mordred-source-filesystem)
- [mordred-transformer-markdown](/packages/mordred-source-markdown)

## License

MIT &copy; [EGOIST (Kevin Titor)](https://github.com/sponsors/egoist)
