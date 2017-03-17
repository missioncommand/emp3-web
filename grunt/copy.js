module.exports = {
  appToDist: {
    files:[{
      expand: true,
      cwd: 'src/app/',
      src: ['**'],
      dest: 'dist/emp3-map'
    }, {
      expand: true,
      cwd: 'dist/emp3/',
      src: ['**'],
      dest: 'dist/emp3-map/emp3/'
    }]
  },
  urlProxyToEMP: {
    expand: true,
    cwd: 'src/app/',
    src: ['urlproxy.jsp'],
    dest: 'dist/emp3'
  },
  leafletSrc: {
    expand: true,
    cwd: 'src/mapengine/leaflet/',
    src: ['**'],
    dest: 'dist/emp3/emp3-leaflet'
  },
  cesiumSrc: {
    expand: true,
    cwd: 'src/mapengine/cesium/',
    src: ['**'],
    src: ['manifest.js', 'emp3-cesium.min.js', 'emp3-cesium.min.js.map','emp3-cesium.min.css', 'emp3-cesium.min.css.map', 'js/**', '!**js/lib/cesium/Assets/Textures/maki/**', '!**js/lib/cesium/Assets/Textures/NaturalEarthII/**', '!**js/lib/cesium/Assets/IAU2006_XYS/**' ,'!**/test/**'],
    dest: 'dist/emp3/emp3-cesium'
  },
  worldwindRequired: {
    expand: true,
    cwd: 'src/mapengine/worldwind/',
    src: ['manifest.js', 'emp3-worldwind.min.js', 'emp3-worldwind.min.js.map', 'worldwind.min.js', 'images/**'],
    dest: 'dist/emp3/emp3-worldwind'
  },
  min: {
    expand: true,
    cwd: 'dist/emp3/',
    src: ['**'],
    dest: 'dist/emp3-map/'
  },
  vendorFilesToUnitTests: {
    expand: true,
    cwd: 'src/app/vendor/',
    src: ['mil-sym/**'],
    dest: 'test/vendor/'
  },
  vendorFilesToValidation: {
    files: [{
      expand: true,
      cwd: 'src/app/vendor',
      src: ['mil-sym/**', 'jquery*'],
      dest: 'src/validation/vendor/'
    }, {
      expand: true,
      cwd: 'src/app/vendor',
      src: ['mil-sym/**', 'jquery*'],
      dest: 'dist/validation/vendor/'
    }]
  },
  cesiumV2: {
    expand: true,
    cwd: 'dist/',
    src: 'emp3-cesium.war',
    rename: function() {
      return 'dist/emp-engine-cesium.war';
    }
  },
  validationToDist: {
    files: [{
      expand: true,
      cwd: 'src/validation',
      src: ['config.json', 'images/**', 'resources/**'],
      dest: 'dist/validation/'
    }]
  },
  devguide: {
    files: [{
      expand: true,
      cwd: 'devguide/',
      src: ['**'],
      dest: 'dist/devguide'
    }, {
      expand: true,
      cwd: 'dist/emp3/',
      src: ['**'],
      dest: 'dist/devguide/emp3/'
    }, {
      expand: true,
      cwd: 'dist/docs/',
      src: ['**'],
      dest: 'dist/devguide/docs/web'
    }]
  },
  licenses: {
    files: [{
      expand: true,
      src: ['LICENSE', 'LICENSE-3RD-PARTY'],
      dest: 'dist/emp3'
    }]
  },
  emp3ToValidation: {
    expand: true,
    cwd: 'dist/',
    src: ['emp3/**'],
    dest: 'dist/validation/'
  }
};
