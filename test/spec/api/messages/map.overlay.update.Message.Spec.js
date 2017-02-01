describe('map.overlay.update.Message', function() {
  it('sends updates to an overlay to the core', function() {
    var overlay = new emp3.api.Overlay({name: 'o1', geoId: 'o1'});

    var message = {
      cmd: emp3.api.enums.channel.updateOverlay,
      overlay: overlay
    };

    var callInfo = {};

    var transactionId = emp3.api.createGUID();
    var updateOverlay = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    updateOverlay.channel.should.equal(emp3.api.enums.channel.updateOverlay);
  });
});
