describe('cmapi.channel.handler[CMAPI2_VISIBILITY_GET]#cmapi2.visibility.get', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('process', function() {
    it('constructs and queues a new transaction to retreive the visibility of a Container', function() {
      var args = {
        sender: {
          id: 'sender'
        },
        message: {
          payload: {
            parentId: "overlay1",
            targetId: "target1"
          }
        }
      };

      var transactionQueueAdd = sandbox.stub(emp.transactionQueue, 'add');
      cmapi.channel.handler[cmapi.channel.names.CMAPI2_VISIBILITY_GET].process(args);

      transactionQueueAdd.should.have.been.calledWithMatch({
        intent: emp.intents.control.VISIBILITY_GET,
        originChannel: cmapi.channel.names.CMAPI2_VISIBILITY_GET,
        items: sinon.match.array
      });
    });
  });
});
