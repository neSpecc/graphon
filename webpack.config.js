module.exports = {
  output: {
    libraryExport: 'default'
  },
  module: {
    rules: [
      {
        test: /\.pcss$/,
        exclude: /node_modules/,
        use: [
          'postcss-loader'
        ]
      },
    ]
  },
  devtool: 'source-map'
};