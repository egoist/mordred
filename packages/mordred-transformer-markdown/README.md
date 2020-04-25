# mordred-transformer-markdown

Parse markdown files using [markdown-it](https://github.com/markdown-it/markdown-it).

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Install](#install)
- [How to use](#how-to-use)
- [How to query](#how-to-query)
  - [Query Markdown Headings](#query-markdown-headings)
  - [Pagination](#pagination)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
yarn add mordred-transformer-markdown
```

## How to use

In your `mordred.config.js`:

```js
module.exports = {
  plugins: [
    // Typically after `mordred-source-filesystem`
    {
      resolve: 'mordred-transformer-markdown',
      options: {
        // All markdown-it options are supported
      }
    }
  ]
}
```

## How to query

A simple query:

```graphql
{
  allMarkdown {
    node {
      html
      headings {
        level
        text
      }
      frontmatter {
        # Assumes you're using title in your frontmatter.
        title
      }
    }
  }
}
```

### Query Markdown Headings

```graphql
{
  allMarkdown {
    nodes {
      headings {
        depth
        text
      }
    }
  }
}
```

### Pagination

By default markdown nodes are ordered by `createdAt` in `DESC`, but you can also order them by any frontmatter key:

```graphql
{
  allMarkdown(orderBy: frontmatter__title, skip: 5, limit: 5) {
    nodes {
      slug
    }
    pageInfo {
      hasNextPage
      hasPrevPage
      pageCount
    }
  }
}
```

## License

MIT &copy; [EGOIST (Kevin Titor)](https://github.com/sponsor/egoist)