module.exports = {
  sdk: {
    files: ['src/sdk/**/*.js'],
    tasks: ['jshint', 'jsdoc', 'remove', 'uglify', 'copy:tests', 'injector:unit_tests:', 'mocha']
  },
  jsdoc: {
    files: ['src/sdk/**/*.js'],
    tasks: ['jsdoc']
  },
  eslint: {
    files: ['src/sdk/**/*.js', 'test/Spec/**/*.Spec.js', 'src/validation/**/*.js'],
    tasks: ['eslint']
  }
};
