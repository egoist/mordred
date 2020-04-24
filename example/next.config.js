module.exports = {
  webpack(config) {
    const { MordredWebpackPlugin } = require('mordred/webpack')

    const mordredPlugin = new MordredWebpackPlugin()
    config.plugins.push(mordredPlugin)

    return config
  },
}
