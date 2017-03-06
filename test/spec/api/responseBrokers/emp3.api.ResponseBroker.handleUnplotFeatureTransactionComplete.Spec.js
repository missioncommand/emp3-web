describe('emp3.api.ResponseBroker.handleUnplotFeatureTransactionComplete', function() {
  var broker, sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    broker = emp3.api.ResponseBrokerFactory.getBroker(emp3.api.enums.channel.unplotFeature);
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('channels', function() {
    var channels = [
      emp3.api.enums.channel.unplotFeature,
      emp3.api.enums.channel.unplotFeatureBatch
    ];

    for (var i = 0; i < channels.length; i++) {
      var channel = channels[i];
      it('handles channel ' + channel, function() {
        emp3.api.ResponseBrokerFactory.getBroker(channel).should.exist;
      });
    }
  });

  describe('process', function() {
    it('calls onSuccess', function() {
      var callbacks = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy(),
        data: {
          features: []
        },
        callInfo: {
          method: 'Overlay.removeFeatures' // anything but Map.removeMapService
        }
      };

      //actual features sucess
      var details = {
        features:[]
      };

      var failures = [];

      broker.process(callbacks, details, failures);

      callbacks.onSuccess.should.have.been.called;
      callbacks.onError.should.not.have.been.called;
    });
  });
});
