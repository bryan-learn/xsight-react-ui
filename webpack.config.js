var webpack = require('webpack');
var bower_dir = __dirname + '/bower_components';

var config = {
  addVendor: function (name, path) {
    this.resolve.alias[name] = path;
    this.module.noParse.push(new RegExp(path));
  },
  entry: {
      app: ['./app/main.js'],
      vendors: ['react']
  },
  resolve: { alias: {} },
  output: {
    path: process.env.NODE_ENV === 'production' ? './dist' : './build',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
  ],
  module: {
    noParse: [],
    loaders: [
      { test: /\.js$/, loader: 'jsx-loader' },
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  }
};

config.addVendor('react', bower_dir + '/react/react.min.js');

module.exports = config;
