describe('emp3.api.events.MapUserInteractionEvent', function() {
  var event, map, position, point;

  beforeEach(function() {
    map = new emp3.api.Map({
      container: "containerId",
      engine: {
        "mapEngineId": 'leafletMapEngine',
        "engineBasePath": "/emp3/leaflet/"          
      }
    });
    position = new emp3.api.GeoPosition({latitude: -1.2345, longitude: 6.789});
    point = {x: 0, y: 0};
    event = new emp3.api.events.MapUserInteractionEvent({
      event: emp3.api.enums.UserInteractionEventEnum.MOUSE_DOWN,
      target: map,
      point: point,
      position: position,
      button: emp3.api.enums.UserInteractionMouseButtonEventEnum.LEFT,
      keys: [emp3.api.enums.UserInteractionKeyEventEnum.CTRL]
    });
  });

  it('inherits from emp3.api.events.Event', function() {
    event.should.be.an.instanceof(emp3.api.events.Event);
  });

  it('inherits from emp3.api.events.UserInteractionEvent', function() {
    event.should.be.an.instanceof(emp3.api.events.UserInteractionEvent);
  });

  describe('getKeyPress', function() {
    it('returns the keys pressed when the event occurred', function() {
      event.keys.should.eql([emp3.api.enums.UserInteractionKeyEventEnum.CTRL]);
    });
  });

  describe('getMouseButton', function() {
    it('returns the button pressed when the event occurred', function() {
      event.button.should.equal(emp3.api.enums.UserInteractionMouseButtonEventEnum.LEFT);
    });
  });

  describe('getCoordinate', function() {
    it('returns the coordinates of the location where the event occurred', function() {
      event.position.should.equal(position);
    });
  });

  describe('getPoint', function() {
    it('returns the screen position of the where the event occurred', function() {
      event.point.should.equal(point);
    });
  });
});
