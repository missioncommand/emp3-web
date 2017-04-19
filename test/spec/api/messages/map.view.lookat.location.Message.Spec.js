describe('map.view.lookat.location', function() {
  it('creates a payload to set a lookAt', function() {
    var lookAt = new emp3.api.LookAt({
      latitude: 0,
      longitude: 0,
      altitude: 10,
      range: 1e5,
      tilt: 0,
      heading: 0
    });

    var message = {
      cmd: emp3.api.enums.channel.lookAtLocation,
      lookAt: lookAt,
      animate: true
    };

    var callInfo = {};

    var transactionId = emp3.api.createGUID();
    var lookAtLocation = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    lookAtLocation.channel.should.equal(emp3.api.enums.channel.lookAtLocation);
    lookAtLocation.payload.should.have.property('range', lookAt.range);
    lookAtLocation.payload.should.have.property('tilt', lookAt.tilt);
    lookAtLocation.payload.should.have.property('heading', lookAt.heading);
    lookAtLocation.payload.should.have.property('latitude', lookAt.latitude);
    lookAtLocation.payload.should.have.property('longitude', lookAt.longitude);
    lookAtLocation.payload.should.have.property('altitude', lookAt.altitude);
  });
});
