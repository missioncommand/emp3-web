// define a new WMTS service
var wmts = new emp3.api.WMTS({
  url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/WMTS',
  name: 'USGS Shaded Relief',
  layer: 'USGSShadedReliefOnly'
});

// note: map1 needs to be changed to whatever your instance of emp3.api.Map is
map1.addMapService({
  mapService: wmts,
  onSuccess: function() {
    // callbacks or notification of complete
  }
});
