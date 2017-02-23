
// Adds an overlay and a polygon to the map in "edit mode".
// To complete editing, double-click.

var editOverlay = new emp3.api.Overlay({
  name: "Overlay I want to edit features on",
  geoId: "editOverlay"
});


// Adds the overlay to the map, and after the overlay is
// added, the feature.   The feature is immediately placed
// in "edit mode"
function afterAddOverlay(args) {
  var feature = new emp3.api.Polygon({
    geoId: "editPolygon",
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
  editOverlay.addFeature({
    feature: feature,
    onSuccess: function() {

      // Once the feature is added, this code immediately puts the feature
      // in edit mode.
      map1.editFeature({
        feature: feature
      });
    }
  });
}

// If the user double clicks the map, compelte the edit.
function myListener(args) {
  if (args.event === emp3.api.enums.UserInteractionEventEnum.DOUBLE_CLICKED) {
    map1.completeEdit();
  }
}

// Move to the area we are going to add a feature
map1.setExtent({
    north: 45,
    east: 45,
    south: 35,
    west: 35
});

// Add an event listener to the map for mouse interaction.
map1.addEventListener({
  eventType: emp3.api.enums.EventType.MAP_INTERACTION,
  callback: myListener
});

map1.addOverlay({
  overlay: editOverlay,
  onSuccess: afterAddOverlay
});
