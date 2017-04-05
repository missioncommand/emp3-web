// Create the WMS services
// This WMS has 2 layers selected, comma separated
var earthAtNightWMS = new emp3.api.WMS({
  name: 'Dark Earth',
  geoId: 'darkEarth1',
  url: 'http://worldwind25.arc.nasa.gov/wms',
  layers: 'earthatnight,FAAChart'
});

// This WMS has only 1 layer chosen
var conusReflectivityWMS = new emp3.api.WMS({
  url: "https://idpgis.ncep.noaa.gov/arcgis/services/NWS_Observations/radar_base_reflectivity/MapServer/WMSServer",
  layers: "1"
});


var _addEarthAtNight = function() {
  map1.addMapService({
    mapService: earthAtNightWMS
  });
};

var _addWeatherWMS = function() {
  map1.addMapService({
    mapService: conusReflectivityWMS
  });
};

// Center the map over the US to show the weather layer data
map1.setCamera({
  camera: new emp3.api.Camera({
    latitude: 37,
    longitude: -100,
    altitude: 5e6
  })
});

// Add WMS services to map.  NOTE: Map services are layered in the order they are added to the map.  Last is on top
_addEarthAtNight();
_addWeatherWMS();
