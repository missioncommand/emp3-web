describe('cmapi.channel.handler[MAP_OVERLAY_CLEAR]#map.overlay.clear', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('process', function() {
    it('constructs and queues a new transaction to clear an overlay', function() {
      var overlayId = '1234-5678-9ABC-DEF0';
      var args = {
        mapInstanceId: '0FED-CBA9-8765-4321',
        message: {
          messageId: 'messageId',
          payload: [{overlayId: overlayId}]
        },
        sender: {
          id: 'sender'
        }
      };
      var transactionQueueAdd = sandbox.stub(emp.transactionQueue, 'add');
      sandbox.stub(emp.storage, 'findOverlay').returns(new emp.typeLibrary.Overlay({overlayId: overlayId}));

      cmapi.channel.handler[cmapi.channel.names.MAP_OVERLAY_CLEAR].process(args);

      transactionQueueAdd.should.have.been.calledWithMatch({
        intent: emp.intents.control.OVERLAY_CLEAR,
        originChannel: cmapi.channel.names.MAP_OVERLAY_CLEAR,
        items: sinon.match([
          sinon.match.instanceOf(emp.typeLibrary.Overlay)
        ])
      });
    });
  });
});
