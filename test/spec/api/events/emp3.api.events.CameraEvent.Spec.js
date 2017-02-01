describe('emp3.api.events.CameraEvent', function() {
  var event;
  var camera;
  beforeEach(function() {
    camera = new emp3.api.Camera();
    event = new emp3.api.events.CameraEvent({
      event: emp3.api.enums.CameraEventEnum.CAMERA_IN_MOTION,
      target: camera
    });
  });

  it('inherits from emp3.api.events.Event', function() {
    event.should.be.an.instanceof(emp3.api.events.Event);
  });

  it('has a type property of emp3.api.enums.EventType.CAMERA_EVENT', function() {
    event.type.should.equal(emp3.api.enums.EventType.CAMERA_EVENT);
  });

  describe('getCamera', function() {
    it('returns the camera the event occurred on', function() {
      event.target.should.eql(camera);
    });
  });
});
