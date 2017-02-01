describe('emp3.api.Transaction', function() {
  var transaction, mapId, geoId, transactionId, sandbox;

  beforeEach(function() {
    mapId = emp3.api.createGUID();
    geoId = emp3.api.createGUID();
    transactionId = emp3.api.createGUID();

    transaction = new emp3.api.Transaction({
      id: transactionId,
      geoId: geoId,
      mapId: mapId
    });

    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('cancel', function() {
    it('sends a message to cancel the transaction', function() {
      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      transaction.cancel();

      var cmd = {
        cmd: emp3.api.enums.channel.cancel,
        transaction: transaction
      };

      var message = {
        mapId: transaction.mapId,
        source: transaction,
        method: 'Transaction.cancel',
        args: {}
      };

      sendMessageStub.should.have.been.calledWith(cmd, message);
    });
  });

  describe('complete', function() {
    it('sends a message to complete the transaction', function() {
      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      transaction.complete();

      var cmd = {
        cmd: emp3.api.enums.channel.transactionComplete,
        transaction: transaction
      };

      var message = {
        mapId: transaction.mapId,
        source: transaction,
        method: 'Transaction.complete',
        args: {}
      };

      sendMessageStub.should.have.been.calledWith(cmd, message);
    });
  });
});