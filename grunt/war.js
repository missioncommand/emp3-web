module.exports = {
  empmap: {
    options: {
      war_verbose: true,
      war_dist_folder: 'dist/wars', // Folder path separator added at runtime.
      war_name: 'emp3-map', // .war will be appended if omitted
      webxml_welcome: 'widget.html',
      webxml_display_name: 'Extensible Map Platform',
      webxml_mime_mapping: [{
        extension: 'woff',
        mime_type: 'application/font-woff'
      }]
    },
    files: [{
      expand: true,
      cwd: 'dist/emp3-map',
      src: ['**'],
      dest: ''
    }]
  },
  cesium: {
    options: {
      war_verbose: true,
      war_dist_folder: 'dist/wars', // Folder path separator added at runtime.
      war_name: 'emp3-cesium', // .war will be appended if omitted
      webxml_display_name: 'Extensible Map Platform Cesium Map Engine'
    },
    files: [{
      expand: true,
      cwd: 'dist/emp3/emp3-cesium',
      src: ["**"],
      dest: ''
    }]
  },
  leaflet: {
    options: {
      war_verbose: true,
      war_dist_folder: 'dist/wars', // Folder path separator added at runtime.
      war_name: 'emp3-leaflet', // .war will be appended if omitted
      webxml_display_name: 'Extensible Map Platform Leaflet Map Engine'
    },
    files: [{
      expand: true,
      cwd: 'dist/emp3/emp3-leaflet',
      src: ['**'],
      dest: ''
    }]
  },
  worldwind: {
    options: {
      war_verbose: true,
      war_dist_folder: 'dist/wars',
      war_name: 'emp3-worldwind',
      webxml_display_name: 'Extensible Map Platform WorldWind Map Engine'
    },
    files: [{
      expand: true,
      cwd: 'dist/emp3/emp3-worldwind',
      src: ['**'],
      dest: ''
    }]
  }
};
