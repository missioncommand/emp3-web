describe('emp3.api.events.MapCursorMoveEvent', function() {
  var event, map, point, position;
  beforeEach(function() {
    map = new emp3.api.Map({
      container: "containerId",
      engine: {
        "mapEngineId": 'leafletMapEngine',
        "engineBasePath": "/emp3/leaflet/"          
      }
    });
    point = {x: 0, y: 0};
    position = new emp3.api.GeoPosition({latitude: 12.234, longitude: -31.991});

    event = new emp3.api.events.MapCursorMoveEvent({
      position: position,
      point: point,
      event: emp3.api.enums.UserInteractionEventEnum.MOUSE_DOWN,
      target: map
    });
  });

  it('inherits from emp3.api.events.Event', function() {
    event.should.be.an.instanceof(emp3.api.events.Event);
  });

  it('inherits from emp3.api.events.MapUserInteractionEvent', function() {
    event.should.be.an.instanceof(emp3.api.events.MapUserInteractionEvent);
  });

  describe('getMap', function() {
    it('returns the map the event occurred on', function() {
      event.target.should.eql(map);
    });
  });

  describe('getCoordinate', function() {
    it('returns the coordinate the event occurred at', function() {
      event.position.should.eql(position);
    });
  });

  describe('getPoint', function() {
    it('returns the screen coordinate the event occurred at', function() {
      event.point.should.eql(point);
    });
  });
});
