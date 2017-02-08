module.exports = {
  prepUnitTests: ['copy:vendorFilesToUnitTests', 'injector:unitTests'],
  prepUnitTestsRelease: ['copy:vendorFilesToUnitTests', 'injector:unitTestsRelease'],
  prepValidation: ['copy:vendorFilesToValidation', 'injector:validation'],
  prepValidationRelease: ['copy:vendorFilesToValidation', 'injector:validationRelease'],
  minify: ['uglify:sdk', 'uglify:cesium', 'uglify:leaflet', 'uglify:worldwind', 'cssmin'],
  copyMinifiedEngines: ['copy:cesium', 'copy:leaflet', 'copy:worldwind'],
  compress: ['compress:docs', 'compress:devguide', 'compress:emp3', 'compress:app'],
  lintAndMocha: ['eslint:all', 'mocha_phantomjs'],
  build: ['webpack:build', 'jsdoc'],
  copyExtras: ['copy:validationToDist', 'copy:devguide']
};
