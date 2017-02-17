// Create an new camera Instance
var camera = new emp3.api.Camera({
    latitude: 47.6062,
    longitude: -122.3321,
    heading: 10,
    tilt: 0,
    altitude: 10000
});

// Set the map's camera
map1.setCamera({
    camera: camera,
    onSuccess: function(args) {
        // Update the camera to see the map view change
        setTimeout(function() {
            camera.altitude = 400;
            map1.setCamera({ camera: camera, animate: true });
        }, 10000);

    }
});
