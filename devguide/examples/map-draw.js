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

  alert("Click on the map to begin drawing");

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
      // this is what actually adds the feature to the map.
      overlay1.addFeature({
        feature: args.feature,
        onSuccess: function() {
          map1.editFeature({
            feature: args.feature
          });
        }
      });
    }
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
