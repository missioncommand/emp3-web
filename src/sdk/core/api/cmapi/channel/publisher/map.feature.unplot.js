/*global emp, cmapi */
// Register a channel publisher for MAP_FEATURE_UNPLOT
cmapi.channel.publisher[cmapi.channel.names.MAP_FEATURE_UNPLOT] = {

  // args will have a transaction property
  process: function(transaction) {
    var oFeatures = transaction.items,
      payload = [],
      i,
      oData;
    try {
      oFeatures = transaction.items;
      payload = [];

      if (transaction.source === emp.api.cmapi.SOURCE) {
        // Dont generate message if it came from the cmapi channel.
        return;
      }

      for (i = 0; i < oFeatures.length; i++) {
        oData = {
          overlayId: oFeatures[i].overlayId,
          featureId: oFeatures[i].featureId          
        };
        
        if (!emp.util.isEmptyString(oFeatures[i].parentId)) {
            oData.parentId = oFeatures[i].parentId;
        }
        payload.push(oData);
      }

      if (payload.length === 0) {
        //No features where deleted.
        return;
      }

      emp.environment.get().pubSub.publish({
        message: payload,
        sender: {
          id: transaction.mapInstanceId
        },
        channel: cmapi.channel.names.MAP_FEATURE_UNPLOT
      });
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_FEATURE_UNPLOT + " failed due to an error.",
        jsError: e
      });
    }
  }
};
