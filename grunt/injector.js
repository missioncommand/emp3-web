var manifest = require('../manifest');

module.exports = {
  unitTests: {
    options: {
      cwd: 'test',
      relative: true,
      template: 'test/index_template.html',
      transform: function (path) {
        if (path.startsWith('spec') || path.startsWith('../src/sdk/vendor')) {
          return "<script src=\"" + path + "\"></script>";
        } else {
          return "<script src=\"" + path + "\" data-cover></script>";
        }
      }
    },
    files: {
      'test/index.html': [manifest.emp3, 'test/spec/**/*.js']
    }
  },
  unitTestsRelease: {
    options: {
      cwd: 'test',
      relative: true,
      template: 'test/index_template.html'
    },
    files: {
      'test/index.html': ['dist/emp3-map/emp3.min.js', 'test/spec/**/*.js']
    }
  },
  cesium: {
    options: {
      cwd: 'mapengine/cesium',
      relative: true,
      template: 'mapengine/cesium/test/index_template.html',
      transform: function (filepath) {
        if (filepath.startsWith('spec') || filepath.startsWith('../sdk/vendor')) {
          return "<script src=\"" + filepath + "\"></script>";
        } else {
          return "<script src=\"" + filepath + "\" data-cover></script>";
        }
      }
    },
    files: {
      'src/mapengine/cesium/test/index.html': [manifest.emp3, manifest.cesium, 'src/mapengine/cesium/test/spec/**/*.js']
    }
  },
  validation: {
    options: {
      cwd: 'src/validation',
      relative: true,
      template: 'src/validation/index_template.html'
    },
    files: {
      'src/validation/index.html': manifest.emp3
    }
  },
  validationRelease: {
    options: {
      ignorePath: 'dist/emp3-map/',
      prefix: '..',
      template: 'src/validation/index_template.html'
    },
    files: {
      'src/validation/index.html': 'dist/emp3-map/emp3.min.js'
    }
  }
};
