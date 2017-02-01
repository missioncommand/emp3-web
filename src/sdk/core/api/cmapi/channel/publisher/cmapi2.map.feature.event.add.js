// Register a channel publisher for the feature add event
cmapi.channel.publisher[cmapi.channel.names.CMAPI2_FEATURE_EVENT_ADD] = {

  process: function(transaction) {
    try {
      var message = {
          features: []
        },
        features = transaction.items,
        feature;

      // create a message to send back to CMAPI.
      // {features: [{
      //   geoId:
      //   name:
      //
      // }]}

      for (var i = 0, len = transaction.items.length; i < len; i++) {
        feature = features[i];
        var featureToAdd = {
            featureId: feature.featureId,
            name: feature.name,
            feature: feature.data,
            properties: feature.properties
        };

        // some features may have a symbolCode.   Add this if it is available.
        if (feature.symbolCode) {
          featureToAdd.symbolCode = feature.symbolCode;
        }

        message.features.push(featureToAdd);
      }
      emp.environment.get().pubSub.publish({
        message: message,
        sender: {
          id: transaction.mapInstanceId
        },
        channel: cmapi.channel.names.CMAPI2_FEATURE_EVENT_ADD
      });

    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.CMAPI2_FEATURE_EVENT_ADD + " failed due to an error.",
        jsError: e
      });
    }
  }
};
