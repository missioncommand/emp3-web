module.exports = {
  files: ['sdk/api/*.js', 'sdk/core/*.js'],
  options: {
    // options here to override JSHint defaults
    globals: {
      jQuery: true,
      console: true,
      module: true,
      document: true
    },
	reporterOutput: ""
  }
};
