import { join } from 'path'
import hashsum from 'hash-sum'
import { stat, readFile } from 'fs-extra'

export const getFileNodeId = (filename: string) => {
  return hashsum(`file::${filename}`)
}

export type FileNode = {
  id: string
  type: typeof FILE_NODE_TYPE
  createdAt: Date
  updatedAt: Date
  content: string
  absolutePath: string
  relativePath: string
  slug: string
}

export async function fileToNode(filename: string, cwd: string): Promise<FileNode> {
  const absolutePath = join(cwd, filename)
  const content = await readFile(absolutePath, 'utf8')
  const { ctime, mtime } = await stat(absolutePath)
  return {
    id: getFileNodeId(filename),
    type: FILE_NODE_TYPE,
    createdAt: ctime,
    updatedAt: mtime,    
    content,
    relativePath: filename,
    absolutePath,
    slug: filename.replace(/\.[a-zA-Z0-9]+$/, '')
  }
}

export const FILE_NODE_TYPE = 'File'