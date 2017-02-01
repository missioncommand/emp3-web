describe('emp3.api.events.FeatureUserInteractionEvent', function() {
  var event, feature, map, position, point;
  beforeEach(function() {
    feature = new emp3.api.Ellipse();
    map = new emp3.api.Map({
      container: "containerId",
      engine: {
        "mapEngineId": 'leafletMapEngine',
        "engineBasePath": "/emp3/leaflet/"          
      }
    });
    position = new emp3.api.GeoPosition({latitude: 40, longitude: 32});
    point = {x: 0, y: 0};
    event = new emp3.api.events.FeatureUserInteractionEvent({
      map: map,
      event: emp3.api.enums.UserInteractionEventEnum.CLICKED,
      target: [feature],
      point: point,
      position: position,
      button: emp3.api.enums.UserInteractionMouseButtonEventEnum.LEFT,
      keys: [emp3.api.enums.UserInteractionKeyEventEnum.SHIFT]
    });
  });

  it('inherits from emp3.api.events.Event', function() {
    event.should.be.an.instanceof(emp3.api.events.Event);
  });

  describe('getKeyPress', function() {
    it('returns the keys pressed when the event occurred', function() {
      event.keys.should.eql([emp3.api.enums.UserInteractionKeyEventEnum.SHIFT]);
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
