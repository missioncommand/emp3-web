describe('emp3.api.ResponseBroker.handleOverlayTransactionComplete', function () {
  var sandbox, broker;
  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    broker = emp3.api.ResponseBrokerFactory.getBroker(emp3.api.enums.channel.updateOverlay);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('channels', function () {
    var channels = [
      emp3.api.enums.channel.showOverlay,
      emp3.api.enums.channel.hideOverlay,
      emp3.api.enums.channel.clearFeatures,
      emp3.api.enums.channel.centerOnOverlay,
      emp3.api.enums.channel.updateOverlay,
      emp3.api.enums.channel.overlayClusterSet,
      emp3.api.enums.channel.overlayClusterActivate,
      emp3.api.enums.channel.overlayClusterDeactivate,
      emp3.api.enums.channel.overlayClusterRemove
    ];

    for (var i = 0; i < channels.length; i++) {
      var channel = channels[i];
      it('handles ' + channels[i], function() {
        emp3.api.ResponseBrokerFactory.getBroker(channel).should.exist;
      });
    }
  });

  describe('process', function() {
    it('sends back appropriate callbacks for onSuccess and onError', function() {
      var successSpy = sandbox.spy();
      var errorSpy = sandbox.spy();

      var callbacks = {
        callInfo: {
          method: 'Overlay.setVisible'
        },
        source: 'mocha',
        args: {},
        onSuccess: successSpy,
        onError: errorSpy
      };

      var details = {
        "name": "Quick Overlay",
        "overlayId": "7f08cf3c-aef9-87d2-cc2e-419d2b07556f",
        "properties": {}
      };

      var failures = [];
      broker.process(callbacks, details, failures);

      successSpy.should.have.been.called;
      errorSpy.should.not.have.been.called;
    });
  });
});
