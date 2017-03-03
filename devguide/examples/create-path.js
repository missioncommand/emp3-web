// Create an new orange Path feature
var path = new emp3.api.Path({
    positions: [{
        latitude: 38,
        longitude: -84
    }, {
        latitude: 39,
        longitude: -84.5
    }, {
        latitude: 39.5,
        longitude: -85
    }, {
        latitude: 38.5,
        longitude: -86
    }, {
        latitude: 38,
        longitude: -87
    }],
    strokeStyle: {
        strokeColor: {
            red: 255,
            green: 128,
            blue: 0,
            alpha: 1.0  // sets the transparency.  1.0 is solid.
        }
    }
});


// Create an overlay to contain the feature
var overlay1 = new emp3.api.Overlay({
    name: "overlay1",
    id: "w834mne-sdg5467-sdf-we45"
});

// Add overlay to map
map1.addOverlay({
    overlay: overlay1,
    onSuccess: function() {
        overlay1.addFeature({
            feature: path,
            onSuccess: function() {
                // Set maps view to the Point features location
                map1.zoomTo({ feature: path });
            }
        });
    },
    onError: function() {
        alert(JSON.stringify(error));
    }
});
