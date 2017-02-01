module.exports = {
  dist: {
    src: ['README.md', 'src/sdk/api/**/*.js'],
    options: {
      destination: "dist/docs",
      template: "node_modules/ink-docstrap/template",
      configure: "jsdoc.conf.json"
    }
  }
};
