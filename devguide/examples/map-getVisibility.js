// Adds an overlay and a feature to the map,
// and checks the visibility of each one.

var overlay1 = new emp3.api.Overlay({
  name: "overlay1",
  id: "w834mne-sdg5467-sdf-we45"
});

// add an overlay to the map.
map1.addOverlay({
  overlay: overlay1,
  onSuccess: processAdd
});

// After the overlay is added, add the point
// feature to the map.  Once the point feature
// has been added, check the visibility state
// for both the overlay and the feature.
function processAdd() {

  // Create a point feature
  var point = new emp3.api.Point({
    geoId: "myPoint",
    name: "myPoint",
    position: {
      latitude: 40,
      longitude: 40
    }
  });

  // Add the point feature to the overlay we created.
  overlay1.addFeature({
    feature: point,
    onSuccess: function() {
      // retrieve the visibility state for the overlay
      map1.getVisibility({
        target: overlay1,
        onSuccess: function() {
          alert("Overlay1 is visible!");
        }
      });

      // retrieve the visibility state for the feature
      map1.getVisibility({
        target: point,
        onSuccess: function() {
          alert("point is visible!");
        }
      });
    }
  });
}
