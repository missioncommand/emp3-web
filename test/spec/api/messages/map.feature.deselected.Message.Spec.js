describe('map.feature.deselected.Message', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  })

  describe('Map.clearSelected', function() {
    it('looks up the list of selected features and uses that list', function() {
      var message = {
        cmd: emp3.api.enums.channel.featureDeselected,
        mapId: emp3.api.createGUID()
      };

      var callInfo = {
        method: 'Map.clearSelected'
      };

      var transactionId = emp3.api.createGUID();

      sandbox.stub(emp3.api.MessageHandler.getInstance(), 'getSelected').returns([
        new emp3.api.MilStdSymbol({geoId: 'selectedFeature'})
      ]);

      var clearSelectedFeatures = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

      clearSelectedFeatures.payload.features.should.be.instanceof(Array);
      clearSelectedFeatures.payload.features.should.have.length(1);
      clearSelectedFeatures.payload.features[0].featureId.should.equal('selectedFeature');
      clearSelectedFeatures.channel.should.equal(emp3.api.enums.channel.featureDeselectedBatch);
    });
  });

  describe('Map.deselectFeatures', function() {
    it('uses a given list of features to pass to deselect', function() {
      var message = {
        cmd: emp3.api.enums.channel.featureDeselected,
        features: [new emp3.api.Circle()]
      };

      var callInfo = {
        method: 'Map.deselectFeatures'
      };

      var transactionId = emp3.api.createGUID();
      var deselectFeatures = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

      deselectFeatures.payload.features.should.be.instanceof(Array);
      deselectFeatures.payload.features.should.have.length(1);
      deselectFeatures.channel.should.equal(emp3.api.enums.channel.featureDeselectedBatch);
    });
  });
});