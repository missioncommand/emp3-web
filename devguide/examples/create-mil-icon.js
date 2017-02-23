var lat = Math.random() * 10;
var lon = Math.random() * 100;
var sym = new emp3.api.MilStdSymbol({
    name: "Example Unit - " + lon + " : " + lat,
    position: {
        latitude: lat,
        longitude: lon
    },
    symbolCode: "SFGPUCI----K---", // Friendly Infantry symbol code from MIL-STD-2525
    fillStyle: {
        fillColor: {
            red: 0,
            green: 255,
            blue: 0,
            alpha: 1
        } // optional, no color is needed
    },
    modifiers: {
        uniqueDesignation1: '1BCT', // see MIL-STD-2525 for meaning of modifiers
        higherFormation: '3ID'
    }
});

function processAdd(cbArgs) {
    overlay1.addFeature({
        feature: sym,
        visible: true
    });
    var camera = new emp3.api.Camera({
        latitude: lat,
        longitude: lon
    });
    map1.setCamera({camera: camera});
}

function processError(error) {
    alert(JSON.stringify(error));
}

var overlay1 = new emp3.api.Overlay({
    name: "overlay1",
    geoId: "w834mne-sdg5467-sdf-we45"
});

map1.addOverlay({
    overlay: overlay1,
    onSuccess: processAdd,
    onError: processError
});
