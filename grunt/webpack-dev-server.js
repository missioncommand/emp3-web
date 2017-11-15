var webpackDevConfig = require('../webpack.dev');

module.exports = {
  options: {
    port: 3000,
    host: "0.0.0.0",
    webpack: webpackDevConfig,
    publicPath: webpackDevConfig.output.publicPath,
    stats: {
      colors: true,
      reasons: true
    },
    quiet: true,
    hot: true
  },
  start: {
    keepAlive: true
  }
};
