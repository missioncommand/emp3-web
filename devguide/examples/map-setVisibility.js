var polygon = new emp3.api.Polygon({
    name: "Polygon",
    positions: [{
      latitude: 40,
      longitude: 39
    }, {
      latitude: 40.5,
      longitude: 39.5
    }, {
      latitude: 40,
      longitude: 40
    }]
});

var armor = new emp3.api.MilStdSymbol({
    name: "Armor",
    positions: [{
        latitude: 40,
        longitude: 40.5
    }],
    symbolCode: "SFGPUCA----K---"
});

var boundary = new emp3.api.MilStdSymbol({
    name: "Boundary",
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

// create an Overlay to contain the features.
var overlay1 = new emp3.api.Overlay({
    name: "overlay1",
    geoId: "w834mne-sdg5467-sdf-we45"
});

var visibility = emp3.api.enums.VisibilityActionEnum.TOGGLE_ON;

var changeOverlayVisibility = function() {
  // turn off/on the overlay every 2 seconds.
  setInterval(function() {
      map1.setVisibility({
        target: overlay1,
        action: visibility
      });

      if (visibility === emp3.api.enums.VisibilityActionEnum.TOGGLE_ON) {
        visibility = emp3.api.enums.VisibilityActionEnum.TOGGLE_OFF;
      } else {
        visibility = emp3.api.enums.VisibilityActionEnum.TOGGLE_ON;
      }
  }, 2000);
};

var addFeatures = function() {

  // Zoom to the newly added feature
  // Add the MilStdSymbol to the overlay
  overlay1.addFeatures({
      features: [polygon, armor, boundary], // adds multiple features at once.  Faster than adding one at a time.
      onSuccess: function() {
        map1.zoomTo({
          overlay: overlay1
        });

        changeOverlayVisibility();
      }
  });
};

// Add the overlay to the map.
map1.addOverlay({
    overlay: overlay1,
    onSuccess: function() {
      addFeatures();
    },
    onError: function(error) {
        alert(JSON.stringify(error));
    }
});
