// Create an new camera Instance
var camera = new emp3.api.Camera({
  latitude: 47.6062,
  longitude: -122.3321,
  heading: 10,
  tilt: 0,
  altitude: 10000
});

// Get the map's current camera
var camera = map1.getCamera();

camera.latitude = 40;
camera.longitude = 40;
camera.heading = 0;

// Apply the new camera updates
map1.setCamera({
  camera: camera,
  onSuccess: function(args) {
    // Update the camera to see the map view change
    setTimeout(function() {
      camera.altitude = 400;
      map1.setCamera({camera: camera, animate: true});
    }, 10000);
  }
});

// Add a timer to make the camera rotates around globe
setInterval(function() {
        camera = map1.getCamera();
        camera.heading += 5;

        map1.setCamera({
            camera: camera,
            onSuccess: function(args) {
                // print out the new camera settings to the console.
                console.log(JSON.stringify(args));
            }
        });
    },
    2000);
