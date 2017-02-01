describe('map.feature.unplot.Message', function () {
  describe('serialize', function () {
    it('correctly serializes messages', function () {
      var feature = new emp3.api.MilStdSymbol({
        geoId: "test",
        name: "test",
        symbolCode: "SFGPUCI--------"
      });

      var message = {
        cmd: emp3.api.enums.channel.unplotFeatureBatch,
        features: [feature],
        overlayId: emp3.api.createGUID()
      };
      var callInfo = {
        method: 'Overlay.removeFeatures'
      };
      var transactionId = emp3.api.createGUID();
      var unplotFeature = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

      var parsedPayload = JSON.parse(unplotFeature.serialize());

      parsedPayload.should.have.property('features');
      parsedPayload.should.have.property('messageId', transactionId);

    });
  });
});
