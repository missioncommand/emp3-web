// Create an overlay to contain the MilStdSymbol
// If no geoId is provided, a UUID is auto generated for the overlay
var overlay1 = new emp3.api.Overlay({
  name: "overlay1"
});

// Generate a random latitude for the symbol
var lat = Math.random() * 10;
// Generate a random longitude for the symbol
var lon = Math.random() * 100;
// Create a MilStdSymbol instance which can be added to the overlay
var sym = new emp3.api.MilStdSymbol({
  name: "Example Unit - " + lon + " : " + lat,
  position: {
    latitude: lat,
    longitude: lon
  },
  symbolCode: "SFGPUCI----K---", // Friendly Infantry symbol code from MIL-STD-2525
  modifiers: {
    uniqueDesignation1: '1BCT', // see MIL-STD-2525 for meaning of modifiers
    higherFormation: '3ID'
  }
});

// Add the symbol to the overlay
overlay1.addFeature({
  feature: sym
});

// Center camera at the location the symbol was added
var camera = new emp3.api.Camera({
  latitude: lat,
  longitude: lon
});
map1.setCamera({camera: camera});

// Add the overlay to the map
// Assume an emp3.api.Map has been assigned to variable named map1
// The order of adding a symbol to an overlay before or after adding the overlay to the map does not matter
map1.addOverlay({
  overlay: overlay1
});

setInterval(function() {
  lat += 0.5;
  if (lat > 90) {
    lat = -90;
  }

  lon += 0.5;
  if (lon > 180) {
    lon = -180;
  }

  sym.position = {
    latitude: lat,
    longitude: lon
  };
  sym.apply();
}, 150);
