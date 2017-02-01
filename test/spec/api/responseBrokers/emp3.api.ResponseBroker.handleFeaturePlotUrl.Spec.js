describe('emp3.api.ResponseBroker.handleFeaturePlotUrl', function() {
  var broker, sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    broker = emp3.api.ResponseBrokerFactory.getBroker(emp3.api.enums.channel.plotUrl);
  });
  afterEach(function() {
    sandbox.reset();
  });

  describe('channels', function() {
    var i, channels = [
      emp3.api.enums.channel.plotUrl
    ];
    for (i = 0; i < channels.length; i++) {

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
          layer: {

          }
        }
      };
      var details  = {

      };

      var failures = [];
      broker.process(callbacks, details, failures);

      callbacks.onSuccess.should.have.been.called;
      callbacks.onError.should.not.have.been.called;
    });
  });
});
