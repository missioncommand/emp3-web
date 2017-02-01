describe('cmapi.channel.handler[MAP_FEATURE_PLOT_BATCH]#map.feature.plot.batch', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('process', function() {
    it('constructs and queues a new transaction to plot multiple features', function() {
      var args = {
        sender: {
          id: 'sender'
        },
        message: {
          payload: {
            features: [
              {featureId: 'feature1', overlayId: 'overlay'},
              {featureId: 'feature2', overlayId: 'overlay'}
            ]
          }
        }
      };
      var transactionQueueAdd = sandbox.stub(emp.transactionQueue, 'add');
      cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_PLOT_BATCH].process(args);

      transactionQueueAdd.should.have.been.calledWithMatch({
        intent: emp.intents.control.FEATURE_ADD,
        originChannel: cmapi.channel.names.MAP_FEATURE_PLOT_BATCH,
        items: sinon.match.array
      });
      transactionQueueAdd.firstCall.args[0].items[0].should.be.an.instanceOf(emp.typeLibrary.Feature);
    });
  });
});
