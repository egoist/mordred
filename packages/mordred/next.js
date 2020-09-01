export const withMordred = (config = {}) => {
  const webpack = config.webpack

  config.webpack = (webpackConfig, options) => {
    const { MordredWebpackPlugin } = require('./webpack')

    const mordredPlugin = new MordredWebpackPlugin()
    webpackConfig.plugins.push(mordredPlugin)

    if (webpack) {
      webpackConfig = webpack(webpackConfig, options)
    }

    return webpackConfig
  }

  return config
}
