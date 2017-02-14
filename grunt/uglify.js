var manifest = require('../manifest');

module.exports = {
  options: {
    banner: '/*! <%= package.name %> <%= package.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
    sourceMap: true,
    compress: true,
    wrap: false,
    mangle: false,
    screwIE8: true,
    reserveDOMProperties: true,
    sourceMapIncludeSources: true
  },
  sdk: {
    files: {
      'dist/emp3/emp3.min.js': manifest.emp3
    }
  },
  leaflet: {
    files: {
      'dist/emp3/emp3-leaflet/emp3-leaflet.min.js': manifest.leaflet
    }
  },
  cesium: {
    options: {
      banner: '/*! <%= package.name %> <%= package.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
      sourceMap: true,
      compress: false,
      wrap: false,
      mangle: false,
      screwIE8: true,
      reserveDOMProperties: true
    },
    files: {
      'dist/emp3/emp3-cesium/emp3-cesium.min.js': manifest.cesium
    }
  },
  worldwind: {
    options: {
      banner: '/*! <%= package.name %> <%= package.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
      sourceMap: true,
      compress: false,
      wrap: false,
      mangle: false,
      screwIE8: true,
      reserveDOMProperties: true
    },
    files: {
      'dist/emp3/emp3-worldwind/emp3-worldwind.min.js': manifest.worldwind
    }
  }
};
