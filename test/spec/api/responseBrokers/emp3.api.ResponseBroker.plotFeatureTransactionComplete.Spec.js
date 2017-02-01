describe('emp3.api.ResponseBroker.plotFeatureTransactionComplete', function () {
  var sandbox, broker;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    broker = emp3.api.ResponseBrokerFactory.getBroker(emp3.api.enums.channel.plotFeature);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('process', function () {
    describe('Feature.update', function () {
      it('calls the onSuccess callback for all appropriate features', function () {
        var callbacks = {
          data: {
            features: []
          },
          onSuccess: sandbox.spy(),
          onError: sandbox.spy(),
          callInfo: {
            method: 'Feature.update'
          }
        };

        var details = {
          features: []
        };

        var failures = {};

        broker.process(callbacks, details, failures);

        callbacks.onSuccess.should.have.been.called;
      });
    });

    describe('Unspecified method', function () {
      it('still calls the onSuccess', function () {
        var callbacks = {
          data: {
            features: []
          },
          onSuccess: sandbox.spy(),
          onError: sandbox.spy(),
          callInfo: {
            method: 'Churn.butter'
          }
        };

        var details = {
          features: []
        };

        var failures = {};

        broker.process(callbacks, details, failures);

        callbacks.onSuccess.should.have.been.called;
      });
    });
  });
});
