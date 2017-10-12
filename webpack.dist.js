var path = require('path');
var webpack = require('webpack');

module.exports = {
  cache: false,
  debug: false,
  devtool: 'source-map',
  context: __dirname,
  entry: {
    validation: './src/validation/validation.entry'
  },
  output: {
    path: path.join(__dirname, 'dist/validation/dist'),
    filename: '[name].bundle.js',
    publicPath: 'dist/'
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
      _: 'lodash',
      toastr: 'toastr',
      assign: 'object-assign'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: {presets: ['react', 'es2015', 'stage-0']},
        include: [
          path.join(__dirname, 'src/validation')
        ]
      },
      {test: /\.scss$/, loader: 'style!css!sass'},
      {test: /\.less$/, loader: 'style!css!less'},
      {test: /\.css$/, loader: 'style!css'},
      {
        test: /.*\.(gif|png|jpg)$/,
        loaders: [
          'file?hash=sha512&digest=hex&size=16&name=[hash].[ext]',
          'image-webpack-loader?optimizationLevel=7&interlaced=false'
        ]
      },
      {test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff'},
      {test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=[name].[ext]'},
      {test: /\.json$/, loader: 'json'},
      {test: /\.xml$/i, loader: 'xml'}
    ]
  },
  externals: [{
    xmlhttprequest: '{XMLHttpRequest:XMLHttpRequest}'
  }]
};
