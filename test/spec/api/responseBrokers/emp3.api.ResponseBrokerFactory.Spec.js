describe('emp3.api.ResponseBrokerFactory', function () {
  describe('getBroker', function () {
    it('returns a valid broker for a handled CMAPI channel', function () {
      emp3.api.ResponseBrokerFactory.getBroker(emp3.api.enums.channel.plotFeature).should.exist;
      emp3.api.ResponseBrokerFactory.getBroker(emp3.api.enums.channel.get).should.exist;

      should.not.exist(emp3.api.ResponseBrokerFactory.getBroker('non.existent.cmapi.channel'));
    });
  });

  describe('registerBroker', function() {
    it('adds a new response broker for a channel', function() {
      var channel = 'oven.bake.cookie.snickerdoodle';
      should.not.exist(emp3.api.ResponseBrokerFactory.getBroker(channel));

      function SnickerdoodleBroker() {}
      SnickerdoodleBroker.prototype = Object.create(emp3.api.ResponseBroker.prototype);

      var broker = new SnickerdoodleBroker();
      emp3.api.ResponseBrokerFactory.registerBroker(channel, broker);
      emp3.api.ResponseBrokerFactory.getBroker(channel).should.exist;
    });
  });
});
