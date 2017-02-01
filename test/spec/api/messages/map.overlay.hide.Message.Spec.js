describe('map.overlay.hide.Message', function() {
  it('creates a payload to hide an array of overlays', function() {
    var overlay = new emp3.api.Overlay({name: 'o1', geoId: 'o1'});

    var message = {
      cmd: emp3.api.enums.channel.hideOverlay,
      overlays: [overlay],
      parentId: emp3.api.createGUID(),
      recurse: false
    };

    var callInfo = {};

    var transactionId = emp3.api.createGUID();
    var showOverlay = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    showOverlay.channel.should.equal(emp3.api.enums.channel.hideOverlay);
    showOverlay.payload.should.be.instanceof(Array);
    showOverlay.payload[0].should.have.property('overlayId', overlay);
  });
});
