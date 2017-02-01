describe('map.feature.update.Message', function () {
  describe('Feature.move', function() {
    it('handles Feature.move', function() {
      var feature = new emp3.api.MilStdSymbol({
        geoId: "test",
        name: "test",
        symbolCode: "SFGPUCI--------"
      });

      var message = {
        cmd: emp3.api.enums.channel.updateFeature,
        features: [feature],
        overlayId: emp3.api.createGUID()
      };

      var callInfo = {
        method: 'Feature.move'
      };
      var transactionId = emp3.api.createGUID();
      var updateFeature = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

      updateFeature.payload.should.have.property('featureId', feature.geoId);
      updateFeature.channel.should.equal(emp3.api.enums.channel.updateFeature);
    });
  });
});
