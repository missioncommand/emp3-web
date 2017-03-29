describe('map.swap', function() {
  it('creates a mapSwap payload', function() {
    var message = {
      cmd: emp3.api.enums.channel.swap,
      engine: {
        mapEngineId: 'mochaEngine'
      }
    };

    var callInfo = {
      mapId: 'swapMapEngineId'
    };

    var transactionId = emp3.api.createGUID();
    var swapMapPayload = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    swapMapPayload.channel.should.equal(emp3.api.enums.channel.swap);
    swapMapPayload.payload.engine.should.have.property('mapEngineId', 'mochaEngine');
  });
});
