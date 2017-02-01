describe('emp3.api.events.MapFreehandEvent', function() {
  var event, map;
  beforeEach(function() {
    map = new emp3.api.Map({
      container: "containerId",
      engine: {
        "mapEngineId": 'leafletMapEngine',
        "engineBasePath": "/emp3/leaflet/"          
      }
    });
    event = new emp3.api.events.MapFreehandEvent({
      target: map,
      event: emp3.api.enums.MapFreehandEventEnum.MAP_FREEHAND_LINE_DRAW_START
    });
  });

  it('inherits from emp3.api.events.Event', function() {
    event.should.be.an.instanceof(emp3.api.events.Event);
  });

  describe('getMap', function() {
    it('returns the map the event occurred on', function() {
      event.target.should.eql(map);
    });
  });

  describe('getPositionGroup', function() {
    it('returns the position group from the Freehand Draw Event');
  });

  describe('getStyle', function() {
    it('returns the stroke style used during the event');
  });
});
