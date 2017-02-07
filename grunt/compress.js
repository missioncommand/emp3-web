module.exports = {
  app: {
    options: {
      archive: 'dist/zips/emp3-map.zip',
      pretty: true
    },
    expand: true,
    cwd: 'dist/emp3-map/',
    src: ['**']
  },
  docs: {
    options: {
      archive: 'dist/zips/emp3-jsdocs.zip',
      pretty: true
    },
    expand: true,
    cwd: 'dist/docs/',
    src: ['**']
  },
  devguide: {
    options: {
      archive: 'dist/zips/EMP3 Developer Guide.zip',
      pretty: true
    },
    expand: true,
    cwd: 'dist/devguide/',
    src: ['**']
  },
  emp3: {
    options: {
      archive: 'dist/zips/emp3.zip',
      pretty: true
    },
    expand: true,
    cwd: 'dist/emp3',
    src: ['**', '../emp3-map/urlproxy.jsp']
  }
};
