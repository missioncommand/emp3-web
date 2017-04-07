describe('map.message.cancel', function() {
  it('Constructs a cancel payload', function() {
    var message = {
      cmd: emp3.api.enums.channel.cancel,
      transaction: new emp3.api.Transaction({id: 'cancel_mocha', mapId: 'a', geoId: 'b'})
    };

    var callInfo = {};

    var completePayload = emp3.api.MessageFactory.constructPayload(message, callInfo, '1234');

    completePayload.channel.should.equal(emp3.api.enums.channel.cancel);
    completePayload.payload.messageId.should.equal('cancel_mocha');
  });
});
