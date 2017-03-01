var bypass = new emp3.api.MilStdSymbol({
    name: "Enemy Bypass",
    positions: [{
      latitude: 39,
      longitude: 39
    }, {
      latitude: 39.5,
      longitude: 39.5
    }, {
      latitude: 39,
      longitude: 41
    }],
    symbolCode: "GHTPY---------X" // Enemy Bypass
});

var circularTarget = new emp3.api.MilStdSymbol({
    name: "Circular Target",
    positions: [{
        latitude: 40,
        longitude: 40
    }],
    symbolCode: "GFFPATC-------X",
    modifiers: {
        distance: [20000] // The radius of the ciruclar target uses the distance (AM) modifier as per MIL-STD-2525C doctrine.
    }
});

var boundary = new emp3.api.MilStdSymbol({
    name: "Division Boundary",
    positions: [{
      latitude: 40,
      longitude: 42
    }, {
      latitude: 41,
      longitude: 43
    }, {
      latitude: 40,
      longitude: 44
    }],
    symbolCode: "GFGPGLB----I--X", // Division Boundary line
    modifiers: {
      uniqueDesignation1: "1BDE",
      uniqueDesignation2: "2BDE"
    }
});

// create an Overlay to contain the MilStdSymbol Features.  Overlays are used to group features.  Features cannot be added directly to a map, they must be on an overlay.
var overlay1 = new emp3.api.Overlay({
    name: "overlay1",
    geoId: "w834mne-sdg5467-sdf-we45"
});

// Add the overlay to the map. 
map1.addOverlay({
    overlay: overlay1,
    onSuccess: function() {
        // Zoom to the newly added feature
        // Add the MilStdSymbol to the overlay
        overlay1.addFeatures({
            features: [bypass, boundary, circularTarget], // adds multiple features at once.  Faster than adding one at a time.
            visible: true,
            onSuccess: function() {
              map1.zoomTo({
                overlay: overlay1
              });
            }
        });
    },
    onError: function(error) {
        alert(JSON.stringify(error));
    }
});
