// Create the WMS service
var wms = new emp3.api.WMS({
  name: 'Dark Earth',
  geoId: 'darkEarth1',
  url: 'http://worldwind25.arc.nasa.gov/wms',
  layers: 'earthatnight,FAAChart'
});
// Add WMS service to map.  NOTE: Map services are layered in the order they are added to the map.  Last in on top
map1.addMapService({
  mapService: wms
});
