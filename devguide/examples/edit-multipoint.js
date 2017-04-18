var millauViaductCam = new emp3.api.Camera({
  latitude: 44.0775, longitude: 3.0228, altitude: 5e3
});

map1.setCamera({camera: millauViaductCam});

var features = [];

var bridgeSymbol = new emp3.api.MilStdSymbol({
  name: 'Millau Viaduct',
  symbolCode: 'GFMPBCB-------X',
  positions: [
    {latitude: 44.069091, longitude: 3.023221},
    {latitude: 44.091945, longitude: 3.020396},
    {latitude: 44.069182, longitude: 3.025673},
    {latitude: 44.091655, longitude: 3.021667}
  ]
});

features.push(bridgeSymbol);

var text = new emp3.api.Text({
  name: 'Millau Viaduct',
  position: {latitude: 44.069091, longitude: 3.026221}
});

features.push(text);

var overlay = new emp3.api.Overlay();

var flotStarter = new emp3.api.MilStdSymbol({
  name: 'Forward Line of Own Troops',
  symbolCode: 'GFGPGLF-------X'
});

var drawing = false,
  editing = false;

var _startDrawing = function() {
  drawing = true;
  map1.drawFeature({
    feature: flotStarter, // This is not the same feature that will be returned from inside the callback and can be discarded
    onDrawComplete: function(args) {
      drawing = false;
      overlay.addFeature({
        feature: args.feature // Note the use of the feature returned in the callback
      });
    }
  });
};

var _addSymbols = function() {
  overlay.addFeatures({
    features: features,
    onSuccess: _startDrawing
  });
};

// Add a mechanism for detecting an end-draw/end-edit command, we are using double click in this example
map1.addEventListener({
  eventType: emp3.api.enums.EventType.MAP_INTERACTION,
  callback: function(e) {
    if (e.event === emp3.api.enums.UserInteractionEventEnum.DOUBLE_CLICKED) {
      if (drawing) {
        map1.completeDraw();
      } else if (editing) {
        map1.completeEdit();
      }
    }
  }
});

map1.addEventListener({
  eventType: emp3.api.enums.EventType.FEATURE_INTERACTION,
  callback: function(e) {
    window.console.debug(e);
    if (e.event === emp3.api.enums.UserInteractionEventEnum.CLICKED) {
      if (drawing) {
        return;
      }

      if (!editing) {
        editing = true;
        map1.editFeature({
          feature: e.target[0]
        });
      } else {
        editing = false;
        map1.completeEdit();
      }
    }
  }
});

alert('Click around the map to draw a FLOT feature. Double click to end drawing.\nClick a feature to begin editing; double click to stop.');

map1.addOverlay({
  overlay: overlay,
  onSuccess: _addSymbols
});