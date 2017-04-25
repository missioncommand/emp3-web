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
  validation: {
    options: {
      war_verbose: true,
      war_dist_folder: 'dist/wars',
      war_name: 'emp3-validation',
      webxml_welcome: 'index.html',
      webxml_display_name: 'EMP3 Test and Validation',
      webxml_mime_mapping: [{
        extension: 'woff',
        mime_type: 'application/font-woff'
      }]
    },
    files: [{
      expand: true,
      cwd: 'dist/validation',
      src: ['**'],
      dest: ''
    }, {
      expand: true,
      src: ['favicon.ico']
    }]
  }
};
