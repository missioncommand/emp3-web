describe('emp3.api.events.FeatureDrawEvent', function() {
  var event, map, feature, updateData, engine, containerId;
  beforeEach(function() {
    engine = {
      "mapEngineId": 'leafletMapEngine',
      "engineBasePath": "/emp3/leaflet/"
    };
    containerId = "containerId";
    map = new emp3.api.Map({
      engine: engine,
      container: containerId
    });
    feature = new emp3.api.Circle();
    updateData = [{radius: 50}];
    event = new emp3.api.events.FeatureDrawEvent({
      target: feature,
      event: emp3.api.enums.FeatureDrawEventEnum.DRAW_START,
      map: map,
      updateList: updateData
    });
  });

  it('inherits from emp3.api.events.Event', function() {
    event.should.be.an.instanceof(emp3.api.events.Event);
  });

  describe('getMap', function() {
    it('returns the map the event occurred on', function() {
      event.map.should.eql(map);
    });
  });

  describe('getUpdateData', function() {
    it('returns a list of the properties that were updated', function() {
      event.updateList.should.be.an.instanceOf(Array);
      event.updateList.should.eql(updateData);
    });
  });
});
