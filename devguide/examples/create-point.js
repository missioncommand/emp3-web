var lat = Math.random() * 90;
var lon = Math.random() * 180;

var point = new emp3.api.Point({
  position: {
    latitude: 35.6586,
    longitude: 139.7454,
    altitude: 0
  },
  // This can be a URL to image, or dataURI
  iconURI: "https://cdn2.iconfinder.com/data/icons/starwars/icons/48/R2-D2.png"
});

var overlay1 = new emp3.api.Overlay({
  name: "overlay1",
  id: "w834mne-sdg5467-sdf-we45"
});

function processAdd(cbArgs) {
    overlay1.addFeature({
        feature: point
    });

    var camera = new emp3.api.Camera({
        latitude: lat,
        longitude: lon
    });

    map1.setCamera({
      camera: camera
    });
}

function processError(error) {
    alert(JSON.stringify(error));
}

map1.addOverlay({
  overlay: overlay1,
  onSuccess: function() {
    overlay1.addFeature({
      feature: point,
      onSuccess: function() {
        // Set maps view to the Point features location
        map1.zoomTo({feature: point});
      }
    });
  },
  onError: function(error) {
    alert(JSON.stringify(error));
  }
});
