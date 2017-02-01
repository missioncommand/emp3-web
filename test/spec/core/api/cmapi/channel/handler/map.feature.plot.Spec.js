describe('cmapi.channel.handler[MAP_FEATURE_PLOT]#map.feature.plot', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('process', function() {
    it('constructs and queues a new transaction to plot a single feature', function() {
      var args = {
        sender: {
          id: 'sender'
        },
        message: {
          payload: {
            features: [
              new emp3.api.MilStdSymbol()
            ]
          }
        }
      };
      var transactionQueueAdd = sandbox.stub(emp.transactionQueue, 'add');
      cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_PLOT].process(args);

      transactionQueueAdd.should.have.been.calledWithMatch({
        intent: emp.intents.control.FEATURE_ADD,
        originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
        items: sinon.match([
          sinon.match.instanceOf(emp.typeLibrary.Feature)
        ])
      });
    });
  });

  describe('mergeGeoJSONStyles', function() {

  });
});
