describe('map.overlay.remove.Message', function() {
  it('creates a payload to remove an array of overlays', function() {
    var overlay = new emp3.api.Overlay({name: 'o1', geoId: 'o1'});

    var message = {
      cmd: emp3.api.enums.channel.removeOverlay,
      overlays: [overlay],
      parentId: emp3.api.createGUID()
    };

    var callInfo = {};

    var transactionId = emp3.api.createGUID();
    var removeOverlay = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    removeOverlay.channel.should.equal(emp3.api.enums.channel.removeOverlay);
    removeOverlay.payload.should.be.instanceof(Array);
    removeOverlay.payload[0].should.have.property('overlayId', overlay.geoId);
  });
});
