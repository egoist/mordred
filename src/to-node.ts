import { join } from 'path'
import hashsum from 'hash-sum'
import Markdown from 'markdown-it'
import grayMatter from 'gray-matter'
import { stat, readFile, Stats } from 'fs-extra'

export const getFileNodeId = (filename: string) => {
  return hashsum(`file::${filename}`)
}

export type Node = {
  id: string
  type: string
  title?: string
  date: Date
  updated: Date
  content: string
  contentHTML: string
  frontmatterKeys: string[]
  frontmatter: {
    [k: string]: any
  }
}

export async function fileToNode(filename: string, cwd: string): Promise<Node> {
  const absolutePath = join(cwd, filename)
  const fileContent = await readFile(absolutePath, 'utf8')
  const { ctime, mtime } = await stat(absolutePath)
  const { content, data } = grayMatter(fileContent)
  const md = new Markdown()
  const env = {}
  const contentHTML = md.render(content, env)
  const frontmatterKeys = Object.keys(data)
  return {
    id: getFileNodeId(filename),
    type: FILE_NODE_TYPE,
    title: data.title,
    date: data.date ? new Date(data.date) : ctime,
    updated: data.updated ? new Date(data.updated) : mtime,
    content,
    contentHTML,
    frontmatter: data,
    frontmatterKeys,
  }
}

export const FILE_NODE_TYPE = 'File'