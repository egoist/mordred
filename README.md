# 🤺 Mordred

[![npm version](https://flat.badgen.net/npm/v/mordred?scale=1.5)](https://npm.im/mordred) [![community](https://flat.badgen.net/badge/icon/discord?icon=discord&label=community&scale=1.5)](https://chat.egoist.sh)

**Source data from anywhere, for Next.js, Nuxt.js, Eleventy and many more.**

## Features

✅ Inspired by [Gatsby](https://gatsbyjs.org), you can query any data (Markdown, API, database, CMS) with GraphQL<br>
✅ Automatically generate JavaScript client for better dev experience<br>
✅ Framework agnostic, works with any framework that has SSG support<br>
✅ Tons of plugins for popular headless CMS (not yet, we need your contribution!)

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Install](#install)
- [Usage with Next.js](#usage-with-nextjs)
  - [Configuration](#configuration)
  - [Using Data](#using-data)
  - [Execute Raw Query](#execute-raw-query)
  - [Module Alias](#module-alias)
  - [Exploring Data with GraphiQL](#exploring-data-with-graphiql)
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
const { withMordred } = require('mordred/next')

module.exports = withMordred({
  // Extra Next.js config..
})
```

Then create a `mordred.config.js` in the same directory and use some plugins:

```js
module.exports = {
  plugins: [
    // Load markdown files from file system
    {
      resolve: 'mordred-source-filesystem',
      options: {
        // This is where you'll be creating Markdown files
        path: __dirname + '/content',
      },
    },
    // Transform files to markdown nodes
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
```

When you run `next` or `next build`, Mordred will generate a GraphQL client at `mordred/graphql.js`, then you can use the generated client to query data.

**You should add this folder to `.gitignore`:**

```
mordred/
```

Now in any page, query data in `getStaticProps`:

```js
import { client } from '../mordred/graphql'

export const getStaticProps = async () => {
  const { allMarkdown } = await client.query({
    allMarkdown: [
      {
        limit: 20
      },
      {
        nodes: {
          id: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
          html: true,
          frontmatter {
            title: true
          }
        }
      }
    ]
  })
  return {
    props: {
      allMarkdown
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

The `client.query` syntax is very similar to GraphQL SDL except that it also provides type hints as you write, we use [graphql-zeus](https://github.com/graphql-editor/graphql-zeus) to generate the client code.

### Execute Raw Query

If you prefer GraphQL SDL over the JavaScript client, you can execute raw query too:

```js
import { executeQuery, gql } from './path/to/mordred/graphql'

const { data, errors } = await executeQuery(
  gql`
    query($limit: Int!) {
      allMarkdown(limit: $limit) {
        id
      }
    }
  `,
  {
    limit: 20,
  },
)
```

Note that we use the `gql` tag here only for syntax highlighting in supported editors like VS Code, it's completely optional.

### Module Alias

When your project has a deep nested folder structure, you might run into _import hell_:

```js
import { client } from '../../mordred/graphql'
```

To simplify the import path, you can use `paths` option in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "mordred-graphql": ["./mordred/graphql"]
    }
  }
}
```

Now you can import form `mordred-graphql` instead.

Note that Next.js supports `paths` by default, but if you're using other tools which don't support this, you might find [alias-hq](https://github.com/davestewart/alias-hq) helpful.

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
  }),
)

export default app
```

## Plugin List

- [mordred-source-filesystem](/packages/mordred-source-filesystem)
- [mordred-transformer-markdown](/packages/mordred-transformer-markdown)

## License

MIT &copy; [EGOIST (Kevin Titor)](https://github.com/sponsors/egoist)
