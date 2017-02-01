describe('emp3.api.events.MapStateChangeEvent', function() {
  var event, map;
  beforeEach(function() {
    map = new emp3.api.Map({
      container: "containerId",
      engine: {
        "mapEngineId": 'leafletMapEngine',
        "engineBasePath": "/emp3/leaflet/"          
      }
    });
    event = new emp3.api.events.MapStateChangeEvent({
      event: emp3.api.enums.MapEventEnum.STATE_CHANGE,
      target: map,
      previousState: emp3.api.enums.MapStateEnum.MAP_NEW
    });
  });

  it('inherits from emp3.api.events.Event', function() {
    event.should.be.an.instanceof(emp3.api.events.Event);
  });

  describe('getNewState', function() {
    it('returns the new state of the map after the event', function() {
      event.newState.should.equal(map.getState());
    });
  });

  describe('getPreviousState', function() {
    it('returns the previous state of the map prior to the event', function() {
      event.previousState.should.equal(emp3.api.enums.MapStateEnum.MAP_NEW);
    });
  });
});
