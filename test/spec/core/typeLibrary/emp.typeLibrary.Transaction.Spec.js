describe('emp.typeLibrary.Transaction', function() {
  describe('queue', function() {
    it('adds itself to the transaction queue and sets its state to `queued`', function() {
      var transaction = new emp.typeLibrary.Transaction({
          intent: emp.intents.control.GET_VIEW,
          mapInstanceId: '1234-5678-9ABC-DEF0',
          transactionId: '',
          sender: '0FED-CBA9-8765-4321',
          source: emp.api.cmapi.SOURCE,
          originChannel: 'stub.channel',
          originalMessage: 'stub message',
          messageOriginator: '1234-5678-9ABC-DEF0',
          originalMessageType: 'stub',
          items: []
      });

      transaction.state.should.equal('init');
      var transactionQueueStub = sinon.stub(emp.transactionQueue, 'add');

      transaction.queue();
      transaction.state.should.equal('queued');
      transactionQueueStub.should.have.been.calledWith(transaction);
    });
  });
});
