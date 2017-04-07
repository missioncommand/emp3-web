describe('map.view.center.overlay', function() {
  it('creates an view center overlay payload with a range', function() {
    var range = 1e6;
    var message = {
      cmd: emp3.api.enums.channel.centerOnOverlay,
      range: range,
      overlayId: emp3.api.createGUID()
    };

    var callInfo = {};

    var transactionId = emp3.api.createGUID();
    var centerOnOverlayPayload = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    centerOnOverlayPayload.channel.should.equal(emp3.api.enums.channel.centerOnOverlay);
    centerOnOverlayPayload.payload.should.have.property('zoom', range);
  });

  it('creates an view center overlay payload without a range', function() {
    var message = {
      cmd: emp3.api.enums.channel.centerOnOverlay,
      overlayId: emp3.api.createGUID()
    };

    var callInfo = {};

    var transactionId = emp3.api.createGUID();
    var centerOnOverlayPayload = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    centerOnOverlayPayload.channel.should.equal(emp3.api.enums.channel.centerOnOverlay);
    centerOnOverlayPayload.payload.should.have.property('zoom', "auto");
  });
});
