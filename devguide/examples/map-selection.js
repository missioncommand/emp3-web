var overlay = new emp3.api.Overlay({
  name: 'selectionOverlay',
  geoId: 'selectionOverlay'
});

var _addFeatures = function() {
  var symbol1 = new emp3.api.MilStdSymbol({
    name: 'symbol1',
    geoId: 'symbol1',
    position: {latitude: 40, longitude: 40},
    symbolCode: 'SFGPUCI----I---',
    modifiers: {
      uniqueDesignation1: "4ID"
    }
  });

  var symbol2 = new emp3.api.MilStdSymbol({
    name: 'boundary1',
    geoId: 'boundary1',
    positions: [
      {latitude: 40, longitude: 40},
      {latitude: 42, longitude: 42}
    ],
    symbolCode: 'GFGPGLB----K--X',
    modifiers: {
      uniqueDesignation1: "4ID"
    }
  });

  overlay.addFeatures({
    features: [symbol1, symbol2],
    onSuccess: function() {
      map1.zoomTo({
        overlay: overlay
      });
    }
  });
};

// This handler is configured to allow multiple features to be selected
var _handleFeatureInteractions = function(e) {
  if (e.event === emp3.api.enums.UserInteractionEventEnum.CLICKED) {
    if (map1.isSelected({feature: e.target[0]})) {
      map1.deselectFeature({feature: e.target[0]});
    } else {
      map1.selectFeature({feature: e.target[0]});
    }
  }
};

map1.addEventListener({
  eventType: emp3.api.enums.EventType.FEATURE_INTERACTION,
  callback: _handleFeatureInteractions
});

map1.addOverlay({
  overlay: overlay,
  onSuccess: _addFeatures
});

alert('Click a feature to select it. Click again to deselect');
