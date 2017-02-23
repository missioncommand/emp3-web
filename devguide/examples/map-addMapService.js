var wms = new emp3.api.WMS({
  name: 'Dark Earth',
  geoId: 'darkEarth1',
  url: 'http://worldwind25.arc.nasa.gov/wms',
  layers: 'earthatnight,FAAChart'
});

map1.addMapService({
  mapService: wms
});
