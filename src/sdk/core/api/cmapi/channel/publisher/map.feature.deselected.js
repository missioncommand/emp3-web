/* global cmapi */

// Register a channel publisher for map.status.MAP_FEATURE_DESELECTED
cmapi.channel.publisher[cmapi.channel.names.MAP_FEATURE_DESELECTED] = {

  // args will have a transaction property
  process: function(transaction) {
    try {
      var oSelectItems = transaction.items,
        payload = [];

      for (var iIndex = 0; iIndex < oSelectItems.length; iIndex++) {
        payload.push({
          featureId: oSelectItems[iIndex].featureId,
          deSelectedId: oSelectItems[iIndex].selectedId,
          deSelectedName: oSelectItems[iIndex].selectedName
        });
      }

      emp.environment.get().pubSub.publish({
        message: payload,
        sender: {
          id: transaction.mapInstanceId
        },
        channel: cmapi.channel.names.MAP_FEATURE_DESELECTED
      });
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_FEATURE_DESELECTED + " failed due to an error.",
        jsError: e
      });
    }
  }
};
