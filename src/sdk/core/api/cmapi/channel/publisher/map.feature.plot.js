/* global cmapi */

// Register a channel publisher for map.status.MAP_FEATURE_PLOT
cmapi.channel.publisher[cmapi.channel.names.MAP_FEATURE_PLOT] = {

  // args will have a transaction property
  process: function(transaction) {
    try {
        var oFeature = transaction.items[0],
          payload = {};

        if (transaction.source === emp.api.cmapi.SOURCE) {
            // Dont generate message if it came from the cmapi channel.
            return;
        }

        payload.overlayId = oFeature.overlayId;
        payload.featureId = oFeature.featureId;
      
        if (!emp.helpers.isEmptyString(oFeature.parentId))
        {
            payload.parentId = oFeature.parentId;
        }
        payload.name = oFeature.name;
        payload.format = oFeature.format;
        payload.feature = oFeature.data;
        payload.properties = oFeature.properties;
        payload.messageId = transaction.transactionId;
        payload.menuId = oFeature.menuId;

        emp.environment.get().pubSub.publish({
            message: payload,
            sender: {
              id: transaction.mapInstanceId
            },
            channel: cmapi.channel.names.MAP_FEATURE_PLOT
        });
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_FEATURE_PLOT + " failed due to an error.",
        jsError: e
      });
    }
  }
};
