var overlay1 = new emp3.api.Overlay({
    name: "overlay1",
    id: "w834mne-sdg5467-sdf-we45"
});

// This is the handler for the map click event.  We are
// going to look for double clicks.
var mapClickHandler = function(eventArgs) {
  // in the event of a double-click event, complete the draw.  The method
  // Map.drawFeature should be called prior to calling Map.completeDraw.
  if (eventArgs.event === emp3.api.enums.UserInteractionEventEnum.DOUBLE_CLICKED) {
    map1.completeDraw();
  }
};

map1.addEventListener({
  eventType: emp3.api.enums.EventType.MAP_INTERACTION,
  callback: mapClickHandler
});

// After we know an overlay has been added, we can draw the symbol.
// You don't need an overlay to draw, but when the draw is complete,
// we want to add the returned feature to the map.
var processAdd = function() {

  alert("Click on the map to begin drawing - double click to end.");

  var path = new emp3.api.Path({
    name: "myPath1"
  });

  // This just puts the map in draw mode, so the map begins
  // animating the draw.  It does not actually add data to the map.
  map1.drawFeature({
    feature: path,
    onDrawUpdate: function() {
      // This is to show you that the map will notifiy you when it is updating.
      // This occurs each time you add a point to the feature.
      console.log("draw update occurred!");
    },
    onDrawComplete: function(args) {
      // occurs after Map.completeDraw is called.
      // this is what actually adds the feature to the map.
      overlay1.addFeature({
        feature: args.feature,
        onSuccess: function(){
          // to complete the edit, call map1.completeEdit.
          // to cancel edit, call, map1.cancelEdit.
          map1.editFeature({
            feature: args.feature
          });
        }
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
