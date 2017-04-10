var overlay1 = new emp3.api.Overlay({
  name: "overlay1",
  id: "w834mne-sdg5467-sdf-we45"
});

var path = new emp3.api.Path({
  name: "myPath1"
});

// After we know an overlay has been added, we can draw the symbol.
// You don't need an overlay to draw, but when the draw is complete,
// we want to add the returned feature to the map.
function processAdd() {
  var count = 0;

  // This is just an example.  Customize drawing and editing however you like!
  alert("Click on the map to begin drawing.  Click 3 times to end drawing and go into edit mode.  Right-click to exit edit mode.");

  // This just puts the map in draw mode, so the map begins
  // animating the draw.  It does not actually add data to the map.
  map1.drawFeature({
    feature: path,
    onDrawUpdate: function() {
      // once we hit three, end the draw.  (this is not necessarily what you
      // do--just a way to end the draw)
      count++;
      if (count >= 3) {
        map1.completeDraw();
      }
    },
    onDrawComplete: function(args) {
      console.log("draw complete");
      // this is what actually adds the feature to the map.
      overlay1.addFeature({
        feature: args.feature,
        onSuccess: function() {
          console.log("feature add complete");
          // Right click to end the edit
          function myListener(cbArgs) {
            if (cbArgs.event === emp3.api.enums.UserInteractionEventEnum.CLICKED &&
              cbArgs.button === emp3.api.enums.UserInteractionMouseButtonEventEnum.RIGHT) {
              map1.completeEdit();
            }
          }

          // Add a map event listener so we know when to finish the edit.  In this case
          // we will finish the edit on a right click.
          map1.addEventListener({
            eventType: emp3.api.enums.EventType.MAP_INTERACTION,
            callback: myListener
          });

          map1.editFeature({
            feature: args.feature
          });
        }
      });
    }.bind(this)
  });
}


function processError(error) {
  alert(JSON.stringify(error));
}

// add an overlay to the map.
map1.addOverlay({
  overlay: overlay1,
  onSuccess: processAdd,
  onError: processError
});
