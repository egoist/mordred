import { Compiler } from 'webpack'
import JoyCon from 'joycon'
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
  loadConfig(cwd: string): MordredConfig {
    const joycon = new JoyCon()
    const { path, data } = joycon.loadSync(['mordred.config.js'], cwd)
    if (!path) {
      throw new Error(`Cannot find mordred.config.js in your project`)
    }
    return data || {}
  }

  apply(compiler: Compiler) {
    if (initialized) {
      return
    }

    initialized = true

    const webpackContext = compiler.context || process.cwd()

    const config = this.loadConfig(webpackContext)

    const mordred = new Mordred(config, {
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
