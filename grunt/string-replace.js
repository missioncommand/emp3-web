module.exports = {
  dist: {
    files: {
      'dist/': 'dist/validation/config.json'
    },
    options: {
      replacements: [{
        pattern: /\.\.\/mapengine\//g,
        replacement: 'emp3/emp3-'
      }, {
        pattern: /"debug": true/g,
        replacement: '"debug": false'
      }]
    }
  }
};
