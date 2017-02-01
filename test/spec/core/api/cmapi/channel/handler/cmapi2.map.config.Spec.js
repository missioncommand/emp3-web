describe('cmapi.channel.handler[CMAPI2_MAP_CONFIG]#map.config', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('process', function() {
    it('constructs and queues a new transaction to configure a map', function() {
      var args = {
        sender: {
          id: 'sender'
        },
        message: {
          payload: {
            midDistanceThreshold: 5000
          }
        }
      };

      var transactionQueueAdd = sandbox.stub(emp.transactionQueue, 'add');
      cmapi.channel.handler[cmapi.channel.names.CMAPI2_MAP_CONFIG].process(args);

      transactionQueueAdd.should.have.been.calledWithMatch({
        intent: emp.intents.control.MAP_CONFIG,
        originChannel: cmapi.channel.names.CMAPI2_MAP_CONFIG,
        items: sinon.match.array
      });
    });
  });
});
