describe('cmapi.channel.handler[MAP_FEATURE_DRAW]#map.feature.draw', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('process', function() {

    it('constructs and queues a new transaction to draw a point', function() {
      var args = {
        sender: {
          id: 'sender'
        },
        message: {
          payload: {
            featureId: 'featureId',
            name: 'name',
            type: 'point',
            properties: {
              featureType: 'point',
              iconUrl: '',
              readOnly: false,
              azimuth:0,
              buffer:0,
              timeStamp: '',
              extrude: false,
              v3: true
            },
            coordinates:[],
            messageId: 'messageId'
          }
        }
      };

      var transactionQueueAdd = sandbox.stub(emp.transactionQueue, 'add');

      cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_DRAW].process(args);

      transactionQueueAdd.should.have.been.calledWithMatch({
        intent: emp.intents.control.DRAW_BEGIN,
        originChannel: cmapi.channel.names.MAP_FEATURE_DRAW,
        items: sinon.match([
          sinon.match.instanceOf(emp.typeLibrary.Draw)
        ])
      });
    });
  });
});
