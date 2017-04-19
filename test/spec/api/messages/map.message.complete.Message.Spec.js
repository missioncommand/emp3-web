describe('map.message.complete', function() {
  it('Attempts to complete a transaction before user does', function() {
    var message = {
      cmd: emp3.api.enums.channel.transactionComplete,
      transaction: new emp3.api.Transaction({id: 'mocha', mapId: 'a', geoId: 'b'})
    };

    var callInfo = {};

    var completePayload = emp3.api.MessageFactory.constructPayload(message, callInfo, '1234');

    completePayload.channel.should.equal(emp3.api.enums.channel.transactionComplete);
    completePayload.payload.messageId.should.equal('mocha');
  });
});
