import { Compiler } from 'webpack'
import { Mordred } from './'

type PluginConfigObject = {
  resolve: string
  options?: any
}

type MordredConfigPlugins = PluginConfigObject[]

export type MordredConfig = {
  plugins?: MordredConfigPlugins
}

let initialized = false

export class MordredWebpackPlugin {
  config: MordredConfig

  constructor(config: MordredConfig = {}) {
    this.config = config
  }

  apply(compiler: Compiler) {
    if (initialized) {
      return 
    }

    initialized = true

    const webpackContext = compiler.context

    const mordred = new Mordred(this.config, {
      cwd: webpackContext,
    })

    let started = false
    compiler.hooks.watchRun.tapPromise('mordred', async () => {
      if (started) {
        return
      }
      started = true
      await mordred.init()
    })
    compiler.hooks.run.tapPromise('mordred', async () => {
      await mordred.init()
    })
  }
}
