var overlay1 = new emp3.api.Overlay({
  name: 'selectionOverlay',
  geoId: 'selectionOverlay'
});

function addFeatures(args) {
  var symbol1 = new emp3.api.MilStdSymbol({
    name: 'symbol1',
    geoId: 'symbol1',
    positions: [{
      latitude: 40,
      longitude: 40
    }],
    symbolCode: 'SFGPUCI----I---',
    modifiers: {
      uniqueDesignation1: "4ID"
    }
  });

  var symbol2 = new emp3.api.MilStdSymbol({
    name: 'boundary1',
    geoId: 'boundary1',
    positions: [{
      latitude: 40,
      longitude: 40
    }, {
      latitude: 42,
      longitude: 42
    }],
    symbolCode: 'SFGPGLB----I--X',
    modifiers: {
      uniqueDesignation1: "4ID"
    }
  });

  args.overlay.addFeatures({
    features: [symbol1, symbol2]
  });
}

map1.addOverlay({
  overlay: overlay1,
  onSuccess: addFeatures
})
