import { join, relative } from 'path'
import { outputFile } from 'fs-extra'
import serialize from 'serialize-javascript'
import mime from 'mime'
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

  gql = gql
  mime = mime

  nodes: Map<string, any>

  constructor(config: MordredConfig, { cwd }: { cwd: string }) {
    this.config = config
    this.cwd = cwd
    this.nodes = new Map()

    this.plugins = (this.config.plugins || []).map(({ resolve, options }) => {
      const pluginDefaultExport = require(resolve).default || require(resolve)
      const plugin: Plugin = pluginDefaultExport(this, options)
      return plugin
    })
  }

  get graphqlClientPath() {
    return join(this.cwd, 'mordred/graphql.js')
  }

  async writeGraphQL() {
    try {
      const outContent = graphqlTemplate({
        plugins: this.plugins,
      })

      await outputFile(this.graphqlClientPath, outContent, 'utf8')
      await outputFile(
        join(this.cwd, 'mordred/graphql.d.ts'),
        graphqlDefinitionTemplate,
        'utf8'
      )
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async writeNodes() {
    const outPath = join(this.cwd, 'mordred/nodes.json')
    const outContent = `${serialize([...this.nodes.values()], {
      isJSON: true,
    })}`
    await outputFile(outPath, outContent, 'utf8')
  }

  async writeAll() {
    console.log(`Updating GraphQL client at ${relative(process.cwd(), this.graphqlClientPath)}..`)
    await Promise.all([this.writeNodes(), this.writeGraphQL()])
  }

  getPluginSchema(name: string) {
    const plugin = this.plugins.find((plugin) => plugin.name === name)

    return plugin && plugin.getSchema ? plugin.getSchema() : ''
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
