var overlay1 = new emp3.api.Overlay({
  name: "overlay1",
  id: "w834mne-sdg5467-sdf-we45"
});

var point = new emp3.api.Point({
  name: "myPoint",
  geoId: "myPoint",
  position: {
    latitude: 23,
    longitude: -84.5
  },
  iconURI: "https://cdn2.iconfinder.com/data/icons/starwars/icons/48/R2-D2.png"
});

var path = new emp3.api.Path({
  name: "myPath",
  geoId: "myPath",
  positions: [{
    latitude: 23,
    longitude: -85.5
  },{
    latitude: 23.2,
    longitude: -85.3
  },{
    latitude: 23.4,
    longitude: -85.7
  },{
    latitude: 23.1,
    longitude: -85.5
  }]
});

var polygon = new emp3.api.Polygon({
  name: "myPolygon",
  geoId: "myPolygon",
  positions: [{
    latitude: 23,
    longitude: -86.5
  },{
    latitude: 23.2,
    longitude: -86.3
  },{
    latitude: 23.4,
    longitude: -86.7
  },{
    latitude: 23.1,
    longitude: -86.5
  },{
    latitude: 22.8,
    longitude: -86.6
  }]
});

var editing = false;

// event listener for the feature interaction event.  We must filter out the
// "click" event.
var myListener = function(args) {
  if (args.event === emp3.api.enums.UserInteractionEventEnum.CLICKED) {
    if (!editing) {
      map1.editFeature({
        feature: args.target[0]
      });
      editing = true;
    } else {
      map1.completeEdit();
      editing = false;
    }
  }
};

// Add a map event listener so we know when to enter and exit editing mode.
map1.addEventListener({
  eventType: emp3.api.enums.EventType.FEATURE_INTERACTION,
  callback: myListener
});

// After we know an overlay has been added, we add our features.
var processOverlayAdd = function() {
  var count = 0;

  overlay1.addFeatures({
    features: [point, path, polygon],
    onSuccess: function() {
      // This is just an example.  Customize drawing and editing however you like!
      alert("Click on a feature to begin editing.  Click on a feature to exit edit mode.");
      map1.zoomTo({
        overlay: overlay1
      })
    }
  });
};

var processError = function(error) {
  alert(JSON.stringify(error));
};

// add an overlay to the map.
map1.addOverlay({
  overlay: overlay1,
  onSuccess: processOverlayAdd,
  onError: processError
});
