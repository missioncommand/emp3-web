/*global cmapi, emp */
// Register a channel publisher for map.status.MAP_FEATURE_SELECTED
cmapi.channel.publisher[cmapi.channel.names.MAP_FEATURE_SELECTED] = {

  // args will have a transaction property
  process: function(transaction) {
    var oSelectItems,
      i,
      payload;
    try {
      oSelectItems = transaction.items;
      payload = [];

      for (i = 0; i < oSelectItems.length; i++) {
        payload.push({
          featureId: oSelectItems[i].featureId,
          selectedId: oSelectItems[i].selectedId,
          selectedName: oSelectItems[i].selectedName
        });
      }

      emp.environment.get().pubSub.publish({
        message: payload,
        sender: {
          id: transaction.mapInstanceId
        },
        channel: cmapi.channel.names.MAP_FEATURE_SELECTED
      });
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_FEATURE_SELECTED + " failed due to an error. ",
        jsError: e
      });
    }
  }
};
