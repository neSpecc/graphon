module.exports = {
  optimization: {
    minimize: false
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
  }
};