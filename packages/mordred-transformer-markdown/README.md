<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [mordred-transformer-markdown](#mordred-transformer-markdown)
  - [Install](#install)
  - [How to use](#how-to-use)
  - [How to query](#how-to-query)
  - [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# mordred-transformer-markdown

Parse markdown files using [markdown-it](https://github.com/markdown-it/markdown-it).

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
      options: {}
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
        depth
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

## License

MIT &copy; [EGOIST (Kevin Titor)](https://github.com/sponsor/egoist)