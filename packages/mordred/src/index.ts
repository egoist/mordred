import { join } from 'path'
import { PluginContext, Plugin } from './plugin'
import { outputFile } from 'fs-extra'
import devalue from 'devalue'
import { graphqlTemplate, graphqlDefinitionTemplate } from './templates'

export {
  PluginFactory
} from './plugin'

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
  plugins: Array<{
    context: PluginContext
    plugin: Plugin
  }>

  nodes: Map<string, any>

  constructor(config: MordredConfig, { cwd }: { cwd: string }) {
    this.config = config
    this.cwd = cwd
    this.nodes = new Map()

    this.plugins = (this.config.plugins || []).map(({ resolve, options }) => {
      const context = new PluginContext(this)
      const pluginDefaultExport = require(resolve).default || require(resolve)
      const plugin: Plugin = pluginDefaultExport(context, options)
      return {
        plugin,
        context,
      }
    })
  }

  async writeGraphQL() {
    const outPath = join(this.cwd, 'mordred/graphql.js')

    try {
      const outContent = graphqlTemplate({
        pluginContextArray: this.plugins.map((plugin) => plugin.context),
      })
  
      await outputFile(outPath, outContent, 'utf8')
      await outputFile(join(this.cwd, 'mordred/graphql.d.ts'), graphqlDefinitionTemplate, 'utf8')
    } catch (err) {
      console.error(err)
      throw err
    }
  } 

  async writeNodes() {
    const outPath = join(this.cwd, 'mordred/nodes.js')
    const outContent = `module.exports = ${devalue(this.nodes)}`
    await outputFile(outPath, outContent, 'utf8')
  }

  async writeAll() {
    console.log(`Updating GraphQL client..`)
    await Promise.all([
      this.writeNodes(),
      this.writeGraphQL()
    ])
  }

  async init() {
    for (const plugin of this.plugins) {
      await plugin.plugin.onInit()
    }

    await this.writeAll()
  }
}
