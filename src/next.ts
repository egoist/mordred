export function withNext() {
  return (nextConfig: any = {}) => {
    const originalWebpack = nextConfig.webpack
    nextConfig.webpack = (config: any) => {
      const { DefinePlugin } = require('webpack')
      config.plugins.push(
        new DefinePlugin({
          'process.env.__MORDRED_CONTEXT': JSON.stringify(config.context),
        })
      )
      if (originalWebpack) {
        return originalWebpack(config)
      }
      return config
    }
    return nextConfig
  }
}
