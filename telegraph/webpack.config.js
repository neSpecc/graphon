module.exports = {
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