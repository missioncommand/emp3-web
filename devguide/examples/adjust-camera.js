
// Get the map's current camera
var camera = map1.getCamera();

camera.latitude = 40;
camera.longitude = 40;
camera.heading = 0;

// Apply the new camera updates
map1.setCamera({
    camera: camera,
    onSuccess: function(args) {
        // print out the new camera settings to the console.
        console.log(JSON.stringify(args));
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
