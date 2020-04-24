module.exports = {
  webpack(config) {
    const { MordredWebpackPlugin } = require('mordred/webpack')

    const mordredPlugin = new MordredWebpackPlugin({
      plugins: [
        {
          resolve: 'mordred-source-filesystem',
          options: {
            path: __dirname + '/content',
          },
        },
        {
          resolve: 'mordred-transformer-markdown',
          options: {}
        }
      ],
    })

    config.plugins.push(mordredPlugin)

    return config
  },
}
