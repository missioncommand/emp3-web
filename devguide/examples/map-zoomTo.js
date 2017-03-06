// Adds an overlay and a polygon to the map and zooms to the new polygon.

var overlay1 = new emp3.api.Overlay({
  name: "My Overlay",
  geoId: "myOverlay"
});


// Adds the overlay to the map, and after the overlay is
// added, the feature.   The feature is immediately placed
// in "edit mode"
function afterAddOverlay(args) {
  var feature1 = new emp3.api.Polygon({
    geoId: "myPolygon",
    name: "My Polygon",
    positions: [{
      latitude: 40,
      longitude: 40
    }, {
      latitude: 41,
      longitude: 41
    }, {
      latitude: 40,
      longitude: 42
    }]
  });

  // Add the feature to the overlay.
  overlay1.addFeature({
    feature: feature1,
    onSuccess: function() {

      // Once the feature is added, this code immediately puts the feature
      // in edit mode.
      map1.zoomTo({
        feature: feature1
      });
    }
  });
}

map1.addOverlay({
  overlay: overlay1,
  onSuccess: afterAddOverlay
});
