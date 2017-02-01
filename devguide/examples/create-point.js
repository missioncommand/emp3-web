var lat = Math.random() * 90;
var lon = Math.random() * 180;

var point = new emp3.api.Point({
  position: {
    latitude: lat,
    longitude: lon
  }
  // iconUrl:
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
    onSuccess: processAdd,
    onError: processError
});
