describe('cmapi.channel.handler[MAP_FEATURE_UNPLOT_BATCH]#map.feature.unplot.batch', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('process', function() {
    it('constructs and queues a new transaction to unplot multiple features', function() {
      var overlayId = '1234-5678-9ABC-DEF0';
      var featureId ='9ABC-DEF0-1234-5678';
      var mapInstanceId = '5678-9ABC-DEF0-1234';
      var messageId = '1234-DEF0-9ABC-5678';
      var senderId = '1234-DEF0-5678-9ABC';
      var parentId = 'DEF0-1234-5678-9ABC';

      var args = {
        mapInstanceId: mapInstanceId,
        message: {
          messageId: messageId,
          payload: {
            messageId: messageId,
            features: [
              { featureId: featureId, overlayId: overlayId , parentId: parentId}
            ]
          }
        },
        sender: {
          id: senderId
        }
      };
      var transactionQueueAdd = sandbox.stub(emp.transactionQueue, 'add');
      sandbox.stub(emp.storage, 'findOverlay').returns(new emp.typeLibrary.Overlay({overlayId: overlayId}));

      cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_UNPLOT_BATCH].process(args);

      transactionQueueAdd.should.have.been.calledWithMatch({
        intent: emp.intents.control.CMAPI_GENERIC_FEATURE_REMOVE,
        originChannel: cmapi.channel.names.MAP_FEATURE_UNPLOT_BATCH,
        mapInstanceId: mapInstanceId,
        transactionId: messageId,
        items: sinon.match.array
      });

      transactionQueueAdd.firstCall.args[0].items[0].should.eql({
        overlayId: overlayId,
        parentId: parentId,
        featureId: featureId
      });
    });
  });
});
