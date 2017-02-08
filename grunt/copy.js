module.exports = {
  appToDist: {
    expand: true,
    cwd: 'src/app/',
    src: ['**'],
    dest: 'dist/emp3-map'
  },
  urlProxyToEMP: {
    expand: true,
    cwd: 'src/app/',
    src: ['urlproxy.jsp', 'README.md'],
    dest: 'dist/emp3'
  },
  leaflet: {
    expand: true,
    cwd: 'src/mapengine/leaflet/',
    src: ['**'],
    dest: 'dist/emp3/emp3-leaflet'
  },
  cesium: {
    expand: true,
    cwd: 'src/mapengine/cesium/',
    src: ['**'],
    dest: 'dist/emp3/emp3-cesium'
  },
  worldwind: {
    expand: true,
    cwd: 'src/mapengine/worldwind/',
    src: ['**'],
    dest: 'dist/emp3/emp3-worldwind'
  },
  min: {
    files: [
      {
        expand: true,
        cwd: 'dist/emp3/',
        src: ['**'],
        dest: 'dist/emp3-map/'
      }
    ]
  },
  vendorFilesToUnitTests: {
    expand: true,
    cwd: 'src/app/vendor/',
    src: ['mil-sym/**', 'jquery*'],
    dest: 'test/vendor/'
  },
  vendorFilesToValidation: {
    expand: true,
    cwd: 'src/app/vendor',
    src: ['**'],
    dest: 'src/validation/vendor/'
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
    expand: true,
    cwd: 'src/validation',
    src: ['**'],
    dest: 'dist/emp3-map/validation'
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
      dest: 'dist/devguide/emp3'
    }, {
      expand: true,
      cwd: 'dist/emp3-map',
      src: ['**'],
      dest: 'dist/devguide/emp3'
    }, {
      expand: true,
      cwd: 'dist/docs/',
      src: ['**'],
      dest: 'dist/devguide/docs/web'
    }]
  }
};
