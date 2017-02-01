describe('map.feature.plot.Message', function () {
  describe('serialize', function () {
    it('correctly serializes messages', function () {
      var feature = new emp3.api.Circle();
      var message = {
        cmd: emp3.api.enums.channel.plotFeature,
        features: [feature],
        overlayId: emp3.api.createGUID(),
        parentId: emp3.api.createGUID()
      };
      var callInfo = {
        method: 'Overlay.addFeature'
      };
      var transactionId = emp3.api.createGUID();
      var plotFeature = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

      var parsedPayload = JSON.parse(plotFeature.serialize());

      parsedPayload.should.have.property('overlayId', message.overlayId);
      parsedPayload.should.have.property('featureId', feature.geoId);
      parsedPayload.should.have.property('name', feature.name);
    });
  });
});
