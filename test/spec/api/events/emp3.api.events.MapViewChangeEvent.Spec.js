describe('emp3.api.events.MapViewChangeEvent', function () {
  var event, map, camera, lookAt, bounds;
  beforeEach(function () {
    map = new emp3.api.Map({
      container: "containerId",
      engine: {
        "mapEngineId": 'leafletMapEngine',
        "engineBasePath": "/emp3/leaflet/"          
      }
    });
    camera = new emp3.api.Camera();
    lookAt = new emp3.api.LookAt();
    bounds = {
      centerLat: 40,
      centerLon: 44,
      range: 50000,
      scale: 2000
    };

    sinon.stub(map, 'getBounds').returns(bounds);
    sinon.stub(map, 'getCamera').returns(camera);
    sinon.stub(map, 'getLookAt').returns(lookAt);

    event = new emp3.api.events.MapViewChangeEvent({
      event: emp3.api.enums.MapViewEventEnum.VIEW_IN_MOTION,
      target: map
    });
  });

  it('inherits from emp3.api.events.Event', function () {
    event.should.be.an.instanceof(emp3.api.events.Event);
  });

  describe('getMap', function() {
    it('returns the map the view event occurred on', function() {
      event.target.should.eql(map);
    });
  });

  describe('getBounds', function () {
    it('returns the bounds after the map move event', function () {
      event.bounds.should.eql(bounds);
    });
  });

  describe('getCamera', function() {
    it('returns the updated camera object after the event', function() {
      event.camera.should.eql(camera);
    });
  });

  describe('getLookAt', function() {
    it('returns the updated lookAt object after the event', function() {
      event.lookAt.should.eql(lookAt);
    });
  });
});
