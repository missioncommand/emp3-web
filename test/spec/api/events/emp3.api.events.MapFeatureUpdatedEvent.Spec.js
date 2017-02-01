describe('emp3.api.events.MapFeatureUpdateEvent', function() {
  var event, map, features;
  beforeEach(function() {
    features = [
      new emp3.api.MilStdSymbol(),
      new emp3.api.MilStdSymbol(),
      new emp3.api.Circle()
    ];

    map = new emp3.api.Map({
      container: "containerId",
      engine: {
        "mapEngineId": 'leafletMapEngine',
        "engineBasePath": "/emp3/leaflet/"          
      }
    });
    event = new emp3.api.events.MapFeatureUpdatedEvent({
      target: map,
      features: features
    });
  });

  it('inherits from emp3.api.events.Event', function() {
    event.should.be.an.instanceof(emp3.api.events.Event);
  });

  describe('getFeatures', function() {
    it('returns the array of features that were updated', function() {
      event.features.should.equal(features);
    });
  });
});
