const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    main: path.resolve(__dirname, 'src/js/index.js')
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(glb|gltf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'model/'
            }
          }
        ]
      }
    ]
  }
}