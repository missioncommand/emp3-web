describe('map.feature.select.Message', function() {
  it('handles single features', function() {
    var feature = new emp3.api.MilStdSymbol({
      geoId: "test",
      name: "test",
      symbolCode: "SFGPUCI--------"
    });

    var message = {
      cmd: emp3.api.enums.channel.featureSelected,
      features: [feature]
    };

    var callInfo = {
      method: 'Map.selectFeatures'
    };
    var transactionId = emp3.api.createGUID();
    var selectFeature = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    selectFeature.payload.features.should.be.instanceof(Array);
    selectFeature.payload.features[0].featureId.should.equal(feature.geoId);
    selectFeature.channel.should.equal(emp3.api.enums.channel.featureSelectedBatch);
  });

  it('handles multiple features', function() {
    var feature1 = new emp3.api.MilStdSymbol({
      geoId: "test1",
      name: "test1",
      symbolCode: "SFGPUCI--------"
    });

    var feature2 = new emp3.api.MilStdSymbol({
      geoId: "test2",
      name: "test2",
      symbolCode: "SFGPUCI--------"
    });

    var message = {
      cmd: emp3.api.enums.channel.featureSelectedBatch,
      features: [feature1, feature2]
    };

    var callInfo = {
      method: 'Map.selectFeatures'
    };
    var transactionId = emp3.api.createGUID();
    var selectFeature = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    selectFeature.payload.features.should.be.instanceof(Array);
    selectFeature.payload.features[0].featureId.should.equal(feature1.geoId);
    selectFeature.payload.features[1].featureId.should.equal(feature2.geoId);
    selectFeature.channel.should.equal(emp3.api.enums.channel.featureSelectedBatch);
  });
});