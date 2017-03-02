var sym = new emp3.api.MilStdSymbol({
  name: "Example Unit",
  position: {
    latitude: 35.6586,
    longitude: 139.7454,
    altitude: 0
  },
  symbolCode: "SFGPUCI--------", // Friendly Infantry symbol code from MIL-STD-2525
  // Modifiers are optional and documented in the MIL-STD-2525 document
  modifiers: {
    uniqueDesignation1: '1BCT',
    higherFormation: '3ID'
  }
});

// create an Overlay to contain the MilStdSymbol Feature.  Overlays are used to group features.  Features cannot be added directly to a map, they must be on an overlay.
var overlay1 = new emp3.api.Overlay({
  name: "overlay1",
  geoId: "w834mne-sdg5467-sdf-we45"
});

var appearanceIndex = 0;

var changeAppearance = function() {

  if (appearanceIndex < 5) {

    switch (appearanceIndex) {
      case 0:
        // change color:

        sym.fillStyle = {
          fillColor: {
            red: 0,
            blue: 125,
            green: 223,
            alpha: 1.0
          }
        };

        break;
      case 1:
        // change frame color
        sym.strokeStyle = {
          strokeColor: {
            red: 0,
            blue: 125,
            green: 223,
            alpha: 1.0
          }
        };
        break;
      case 2:
        // change opacity
        //sym.fillStyle.fillColor.alpha = 0.5;
        break;
      case 3:
        // change Echelon -- just change the symbol id to include echelon code
        // as per MIL-STD-2525C
        sym.symbolCode = "SFGPUCI----I---";
        break;
      case 4:
        // change Affiliation --- just change the symbol id to different affiliation code
        // as per MIL-STD-2525C
        sym.symbolCode = "SHGPUCI----I---";
        break;
    }

    appearanceIndex++;

  } else {
    // reset the symbol.
    sym.symbolCode = "SFGPUCI--------";
    sym.fillStyle = undefined;
    sym.strokeStyle = undefined;

    appearanceIndex = 0;

  }

  sym.apply();

};

// Add the overlay to the map.
map1.addOverlay({
  overlay: overlay1,
  onSuccess: function() {
    // Zoom to the newly added feature
    // Add the MilStdSymbol to the overlay
    overlay1.addFeature({
      feature: sym,
      visible: true,
      onSuccess: function() {
        map1.zoomTo({
          feature: sym
        });
        setInterval(function() {
          changeAppearance();
        }, 2000);
      }
    });
  },
  onError: function(error) {
    alert(JSON.stringify(error));
  }
});
