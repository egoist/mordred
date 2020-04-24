module.exports = {
  plugins: [
    {
      resolve: 'mordred-source-filesystem',
      options: {
        path: __dirname + '/content',
      },
    },
    {
      resolve: 'mordred-transformer-markdown',
      options: {},
    },
  ],
}
