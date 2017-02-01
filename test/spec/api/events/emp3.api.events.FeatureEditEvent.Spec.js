describe('emp3.api.events.FeatureEditEvent', function() {
  var event, feature, map, updateData;
  beforeEach(function() {
    feature = new emp3.api.Circle();
    map = new emp3.api.Map({
      container: "containerId",
      engine: {
        "mapEngineId": 'leafletMapEngine',
        "engineBasePath": "/emp3/leaflet/"          
      }
    });
    updateData = [{radius: 50}];
    event = new emp3.api.events.FeatureEditEvent({
      target: feature,
      map: map,
      event: emp3.api.enums.FeatureEditEventEnum.EDIT_START,
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
    it('returns the list of objects which were updated', function() {
      event.updateList.should.be.an.instanceOf(Array);
      event.updateList.should.eql(updateData);
    });
  });
});
