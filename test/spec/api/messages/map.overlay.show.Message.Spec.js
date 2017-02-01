describe('map.overlay.show.Message', function() {
  it('creates a payload to show an array of overlays', function() {
    var overlay = new emp3.api.Overlay({name: 'o1', geoId: 'o1'});

    var message = {
      cmd: emp3.api.enums.channel.showOverlay,
      overlays: [overlay],
      parentId: emp3.api.createGUID(),
      recurse: false
    };

    var callInfo = {};

    var transactionId = emp3.api.createGUID();
    var showOverlay = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    showOverlay.channel.should.equal(emp3.api.enums.channel.showOverlay);
    showOverlay.payload.should.be.instanceof(Array);
    showOverlay.payload[0].should.have.property('overlayId', overlay);
  });
});
