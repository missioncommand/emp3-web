describe('map.view.center.feature', function() {
  it('handles a single feature with a range', function() {
    var featureId = emp3.api.createGUID();
    var range = 3e1;

    var message = {
      cmd: emp3.api.enums.channel.centerOnFeature,
      featureId: featureId,
      range: range
    };

    var callInfo = {};
    var transactionId = emp3.api.createGUID();

    var centerOnFeaturePayload = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    centerOnFeaturePayload.channel.should.equal(emp3.api.enums.channel.centerOnFeature);
    centerOnFeaturePayload.payload.should.have.property('zoom', range);
    centerOnFeaturePayload.payload.should.have.property('featureId', featureId);
  });

  it('handles a single feature without a range', function() {
    var featureId = emp3.api.createGUID();
    var range = undefined;

    var message = {
      cmd: emp3.api.enums.channel.centerOnFeature,
      featureId: featureId,
      range: range
    };

    var callInfo = {};
    var transactionId = emp3.api.createGUID();

    var centerOnFeaturePayload = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    centerOnFeaturePayload.channel.should.equal(emp3.api.enums.channel.centerOnFeature);
    centerOnFeaturePayload.payload.should.have.property('zoom', "auto");
    centerOnFeaturePayload.payload.should.have.property('featureId', featureId);
  });

  it('handles multiple features with a range', function() {
    var featureIds = [
      emp3.api.createGUID(),
      emp3.api.createGUID(),
      emp3.api.createGUID()
    ];
    var range = 3e1;

    var message = {
      cmd: emp3.api.enums.channel.centerOnFeature,
      featureIds: featureIds,
      range: range
    };

    var callInfo = {};
    var transactionId = emp3.api.createGUID();

    var centerOnFeaturePayload = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    centerOnFeaturePayload.channel.should.equal(emp3.api.enums.channel.centerOnFeature);
    centerOnFeaturePayload.payload.should.have.length(3);
    centerOnFeaturePayload.payload[0].should.have.property('zoom', range);
    centerOnFeaturePayload.payload[0].should.have.property('featureId', featureIds[0]);
  });

  it('handles multiple features without a range', function() {
    var featureIds = [
      emp3.api.createGUID(),
      emp3.api.createGUID(),
      emp3.api.createGUID()
    ];
    var message = {
      cmd: emp3.api.enums.channel.centerOnFeature,
      featureIds: featureIds
    };

    var callInfo = {};
    var transactionId = emp3.api.createGUID();

    var centerOnFeaturePayload = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    centerOnFeaturePayload.channel.should.equal(emp3.api.enums.channel.centerOnFeature);
    centerOnFeaturePayload.payload.should.have.length(3);
    centerOnFeaturePayload.payload[0].should.have.property('zoom', "auto");
    centerOnFeaturePayload.payload[0].should.have.property('featureId', featureIds[0]);
  });
});