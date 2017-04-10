describe('map.view.zoom', function() {
  it('constructs a zoom payload with an altitude', function() {
    var altitude = 1e6;
    var message = {
      cmd: emp3.api.enums.channel.zoom,
      altitude: altitude
    };

    var callInfo = {};

    var transactionId = emp3.api.createGUID();
    var swapMapPayload = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    swapMapPayload.channel.should.equal(emp3.api.enums.channel.zoom);
    swapMapPayload.payload.should.have.property('range', altitude);
  });

  it('constructs a zoom payload without an altitude', function() {
    var altitude = undefined;
    var message = {
      cmd: emp3.api.enums.channel.zoom,
      altitude: altitude
    };

    var callInfo = {};

    var transactionId = emp3.api.createGUID();
    var viewZoomPayload = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    viewZoomPayload.channel.should.equal(emp3.api.enums.channel.zoom);
    viewZoomPayload.payload.should.have.property('range', altitude);
  });
});
