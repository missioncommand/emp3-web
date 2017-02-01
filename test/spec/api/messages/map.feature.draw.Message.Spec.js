describe('map.feature.draw.Message', function () {
  describe('transaction', function () {
    it('returns a transaction item corresponding to the core transaction', function() {
      var feature = new emp3.api.Circle({
        name: 'testCircle',
        geoId: 'testCircle'
      });

      var message = {
        cmd: emp3.api.enums.channel.draw,
        feature: feature,
        featureType: 'path'
      };

      var callInfo = {
        method: 'Map.draw',
        mapId: emp3.api.createGUID()
      };

      var transactionId = emp3.api.createGUID();

      var trans = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

      trans.transaction().should.have.property('id', transactionId);
      trans.transaction().should.have.property('geoId', feature.geoId);
      trans.transaction().should.have.property('mapId', callInfo.mapId);
    });
  });
});
