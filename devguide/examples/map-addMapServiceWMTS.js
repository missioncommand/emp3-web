// define a new WMTS service
var wmts = new emp3.api.WMTS({
  url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS',
  name: 'ESRI World imagery',
  description: 'World Wide Satellite Imagery provided by ArcGIS Online',
  layer: 'World_Imagery'
});

// note: map1 needs to be changed to whatever your instance of emp3.api.Map is
map1.addMapService({
  mapService: wmts,
  onSuccess: function() {
    // callbacks or notification of complete
  }
});
