import MarkdownIt from 'markdown-it'

export function markdownPluginHeadings(md: MarkdownIt) {
  const heading_open = md.renderer.rules.heading_open
  md.renderer.rules.heading_open = (tokens, idx, options, env, renderer) => {
    const token = tokens[idx]
    const nextToken = tokens[idx + 1]
    env.headings = env.headings || []
    env.headings.push({
      text: nextToken.content,
      depth: Number(token.tag.slice(1)),
    })
    return renderer.renderToken(tokens, idx, options)
  }
}
