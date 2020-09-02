import { join, relative } from 'path'
import { outputFile } from 'fs-extra'
import serialize from 'serialize-javascript'
import mime from 'mime'
import { mergeTypeDefs } from '@graphql-tools/merge'
import { print } from 'graphql'
import { Parser, TreeToTS } from 'graphql-zeus'
import { graphqlTemplate, graphqlDefinitionTemplate } from './templates'
import { Plugin } from './plugin'
import { gql } from './gql'

export { PluginFactory } from './plugin'

type PluginConfigObject = {
  resolve: string
  options?: any
}

type MordredConfigPlugins = PluginConfigObject[]

export type MordredConfig = {
  plugins?: MordredConfigPlugins
}
export class Mordred {
  config: MordredConfig
  cwd: string
  plugins: Plugin[]
  outDir: string

  gql = gql
  mime = mime

  nodes: Map<string, any>

  constructor(config: MordredConfig, { cwd }: { cwd: string }) {
    this.config = config
    this.cwd = cwd
    this.nodes = new Map()

    this.outDir = join(cwd, 'mordred')

    this.plugins = (this.config.plugins || []).map(({ resolve, options }) => {
      const pluginDefaultExport = require(resolve).default || require(resolve)
      const plugin: Plugin = pluginDefaultExport(this, options)
      return plugin
    })
  }

  get graphqlClientPath() {
    return join(this.outDir, 'graphql.js')
  }

  async writeGraphQL() {
    try {
      const outContent = graphqlTemplate({
        typeDefs: this.typeDefs,
        plugins: this.plugins,
      })

      await outputFile(this.graphqlClientPath, outContent, 'utf8')
      await outputFile(
        join(this.outDir, 'graphql.d.ts'),
        graphqlDefinitionTemplate,
        'utf8',
      )
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async writeNodes() {
    const outPath = join(this.outDir, 'nodes.json')
    const outContent = `${serialize([...this.nodes.values()], {
      isJSON: true,
    })}`
    await outputFile(outPath, outContent, 'utf8')
  }

  get typeDefs() {
    const types: string[] = this.plugins
      .filter((plugin) => plugin.getSchema)
      .reduce(
        (result, plugin) => {
          result.push(plugin.getSchema ? plugin.getSchema(result) : '')
          return result
        },
        [
          `
      scalar JSON
    
      type Query {
        hello: String
      }
    `,
        ],
      )

    const typeDefs = print(mergeTypeDefs(types))
    return typeDefs
  }

  async writeZeus() {
    const tree = Parser.parse(this.typeDefs)
    const jsDefinition = TreeToTS.javascript(tree)
    await Promise.all([
      outputFile(
        join(this.outDir, 'zeus.d.ts'),
        jsDefinition.definitions,
        'utf8',
      ),
      outputFile(join(this.outDir, 'zeus.js'), jsDefinition.javascript, 'utf8'),
    ])
  }

  async writeAll() {
    console.log(
      `Updating GraphQL client at ${relative(
        process.cwd(),
        this.graphqlClientPath,
      )}..`,
    )
    await Promise.all([
      this.writeNodes(),
      this.writeZeus(),
      this.writeGraphQL(),
    ])
  }

  async init() {
    for (const plugin of this.plugins) {
      if (plugin.onInit) {
        await plugin.onInit()
      }
    }

    await this.createNodes()
    await this.writeAll()
  }

  async createNodes() {
    this.nodes.clear()
    for (const plugin of this.plugins) {
      if (plugin.createNodes) {
        const nodes = await plugin.createNodes()
        for (const node of nodes) {
          this.nodes.set(node.id, node)
        }
      }
    }
  }
}
