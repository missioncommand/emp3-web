module.exports = {
  dist: {
    files: {
      'dist/': 'dist/emp3-map/validation/config.json'
    },
    options: {
      replacements: [
        {
          pattern: /mapengine\//g,
          replacement: '../emp3-'
        },
        {
          pattern: /"debug": true/g,
          replacement: '"debug": false'
        }
      ]
    }
  }
};
