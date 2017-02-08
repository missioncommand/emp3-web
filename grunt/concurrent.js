module.exports = {
  minify: ['uglify:sdk', 'uglify:cesium', 'uglify:leaflet', 'uglify:worldwind', 'cssmin'],
  copyEnginesToEMP: ['copy:cesiumSrc', 'copy:leafletSrc', 'copy:worldwindRequired'],
  prepUnitTests: ['copy:vendorFilesToUnitTests', 'injector:unitTests'],
  prepUnitTestsRelease: ['copy:vendorFilesToUnitTests', 'injector:unitTestsRelease'],
  lintAndMocha: ['eslint:all', 'mocha_phantomjs'],
  prepValidation: ['copy:vendorFilesToValidation', 'injector:validation'],
  prepValidationRelease: ['copy:vendorFilesToValidation', 'copy:emp3ToValidation', 'injector:validationRelease', 'copy:validationToDist'],
  build: ['webpack:build', 'jsdoc'],
  compress: ['compress:docs', 'compress:devguide', 'compress:app'],
  copyExtras: ['copy:devguide']
};
