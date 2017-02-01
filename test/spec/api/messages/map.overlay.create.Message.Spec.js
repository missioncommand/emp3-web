describe('map.overlay.create.Message', function() {
  it('create an array of overlay descriptors', function() {
    var o1 = new emp3.api.Overlay({name: 'o1', geoId: 'o1'});
    var o2 = new emp3.api.Overlay({name: 'o2', geoId: 'o2'});
    var o3 = new emp3.api.Overlay({name: 'o3', geoId: 'o3'});

    var message = {
      cmd: emp3.api.enums.channel.createOverlay,
      overlays: [o1, o2, o3],
      parent: emp3.api.createGUID()
    };

    var callInfo = {
      method: 'Feature.move'
    };
    var transactionId = emp3.api.createGUID();
    var createOverlay = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    createOverlay.channel.should.equal(emp3.api.enums.channel.createOverlay);

    createOverlay.payload.should.be.instanceof(Array);
    createOverlay.payload[0].should.have.property('name', 'o1');
    createOverlay.payload[1].should.have.property('name', 'o2');
    createOverlay.payload[2].should.have.property('name', 'o3');
  });
});
