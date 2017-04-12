describe('map.view.center.location', function() {
  it('creates a payload to center the view based on a camera object', function() {
    var camera = new emp3.api.Camera({
      latitude: 0,
      longitude: 0,
      altitude: 1e5,
      roll: 0,
      tilt: 0,
      heading: 0
    });

    var message = {
      cmd: emp3.api.enums.channel.centerOnLocation,
      camera: camera,
      animate: true
    };

    var callInfo = {};

    var transactionId = emp3.api.createGUID();
    var centerOnLocation = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    centerOnLocation.channel.should.equal(emp3.api.enums.channel.centerOnLocation);
    centerOnLocation.payload.should.have.property('location');
    centerOnLocation.payload.location.should.have.property('lat', camera.latitude);
    centerOnLocation.payload.location.should.have.property('lon', camera.longitude);
    centerOnLocation.payload.should.have.property('heading', camera.heading);
    centerOnLocation.payload.should.have.property('tilt', camera.tilt);
    centerOnLocation.payload.should.have.property('roll', camera.roll);
    centerOnLocation.payload.should.have.property('animate', message.animate);
  });
});
