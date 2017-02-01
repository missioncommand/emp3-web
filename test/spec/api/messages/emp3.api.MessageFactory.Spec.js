describe('map.feature.plot.Message', function () {
  describe('constructPayload', function () {
    it('creates a new Message object based on the CMAPI channel given', function () {
      var message = {
        cmd: emp3.api.enums.channel.plotFeature,
        features: [new emp3.api.Circle()]
      };
      var callInfo = {};
      var transactionId = emp3.api.createGUID();

      expect(emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId)).to.exist;
    });
  });

  describe('registerMessage', function () {
    it('adds new message handlers for a channel', function () {
      var SnickerdoodleMessage = function () { };
      var channel = 'oven.bake.cookies.snickerdoodles';

      expect(emp3.api.MessageFactory.constructPayload({cmd: channel})).not.to.exist;
      emp3.api.MessageFactory.registerMessage(channel, SnickerdoodleMessage);
      expect(emp3.api.MessageFactory.constructPayload({cmd: channel})).to.exist;
    });
  });
});
