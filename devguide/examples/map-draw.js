var overlay1 = new emp3.api.Overlay({
  name: "overlay1",
  id: "w834mne-sdg5467-sdf-we45"
});

var path = new emp3.api.Path({
  name: "myPath1"
});


// This is the event handler for mouse events.  We are looking for the double-clicking
// event.  If that occurs, complete the draw.
var completeDraw = function(args) {
  if (args.event === emp3.api.enums.UserInteractionEventEnum.DOUBLE_CLICKED) {
    map1.completeDraw();
  }
};

// Set up an event listener for double-clicking using the MAP_INTERACTION event.
// MAP_INTERACTION events occur for all user interactions with the map.  Inside
// the event we will filter out double-click events.
map1.addEventListener({
  eventType: emp3.api.enums.EventType.MAP_INTERACTION,
  callback: completeDraw
});

// After we know an overlay has been added, we can draw the symbol.
// You don't need an overlay to draw, but when the draw is complete,
// we want to add the returned feature to the map.
var processAdd = function() {
  var count = 0;

  alert("Click on the map to begin drawing; double-click to end.");

  // This just puts the map in draw mode, so the map begins
  // animating the draw.  It does not actually add data to the map.
  map1.drawFeature({
    feature: path,
    onDrawComplete: function(args) {
      // this is what actually adds the feature to the map.
      overlay1.addFeature({
        feature: args.feature
      });
    }
  });
};

var processError = function(error) {
  alert(JSON.stringify(error));
};

// add an overlay to the map.
map1.addOverlay({
  overlay: overlay1,
  onSuccess: processAdd,
  onError: processError
});
