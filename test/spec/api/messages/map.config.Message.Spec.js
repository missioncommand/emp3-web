describe('map.config.Message', function () {
  describe('serialize', function () {

    it ('correctly serializes message for set midDistanceThreshold', function() {
      var callInfo = {
        method: "Map.setMidDistanceThreshold"
      };

      var message = {
        cmd: 'cmapi2.map.config',
        midDistanceThreshold: 50000
      };

      var transactionId = emp3.api.createGUID();
      var config = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);
      var parsedPayload = JSON.parse(config.serialize());

      parsedPayload.should.have.property('midDistanceThreshold', message.midDistanceThreshold);
    });


    it ('correctly serializes message for set farDistanceThreshold', function() {
      var callInfo = {
        method: "Map.setFarDistanceThreshold"
      };

      var message = {
        cmd: emp3.api.enums.channel.config,
        farDistanceThreshold: 50000
      };

      var transactionId = emp3.api.createGUID();
      var config = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

      var parsedPayload = JSON.parse(config.serialize());

      parsedPayload.should.have.property('farDistanceThreshold', message.farDistanceThreshold);
    });


    it ('correctly serializes message for set iconSize', function() {
      var callInfo = {
        method: "Map.setIconSize"
      };

      var message = {
        cmd: emp3.api.enums.channel.config,
        iconSize: 'small'
      };

      var transactionId = emp3.api.createGUID();
      var config = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

      var parsedPayload = JSON.parse(config.serialize());

      parsedPayload.should.have.property('iconSize', message.iconSize);
    });

    it ('correctly serializes message for setting milsStdLabels', function() {
      var callInfo = {
        method: "Map.setMilStdLabels"
      };

      var message = {
        cmd: emp3.api.enums.channel.config,
        milStdLabels: 'common'
      };

      var transactionId = emp3.api.createGUID();
      var config = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

      var parsedPayload = JSON.parse(config.serialize());

      parsedPayload.should.have.property('milStdLabels', message.milStdLabels);
    });

    it ('correctly serializes message for setting selectionStyle', function() {
      var callInfo = {
        method: "Map.setSelectionStyle"
      };

      var message = {
        cmd: emp3.api.enums.channel.config,
        color: '00FF0000',
        scale: 1.5
      };

      var transactionId = emp3.api.createGUID();
      var config = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

      var parsedPayload = JSON.parse(config.serialize());

      parsedPayload.should.have.property('selectionColor', message.color);
      parsedPayload.should.have.property('selectionScale', message.scale);

    });
  });
});
