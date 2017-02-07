module.exports = {
  options: {
    shorthandCompacting: false,
    roundingPrecision: -1,
    sourceMap: true
  },
  target: {
    files: {
      'dist/emp3-map/emp3-leaflet/emp3-leaflet.min.css': [
        "src/mapengine/leaflet/css/leaflet.css",
        "src/mapengine/leaflet/css/MarkerCluster.css",
        "src/mapengine/leaflet/css/MarkerCluster.Default.css",
        "src/mapengine/leaflet/css/leaflet-eng.css"
      ],
      'dist/emp3-map/emp3-cesium/emp3-cesium.min.css': [
        "src/mapengine/cesium/js/lib/cesium/Cesium.css",
        "src/mapengine/cesium/js/lib/cesium/Widgets/widgets.css",
        "src/mapengine/cesium/js/lib/cesium/editors/drawHelper/DrawHelper.css",
        "src/mapengine/cesium/js/lib/cesium/Widgets/BaseLayerPicker/BaseLayerPicker.css"
      ]
    }
  }
};
