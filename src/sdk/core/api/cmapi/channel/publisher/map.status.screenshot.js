// Register a channel publisher for map.status.coordinatesystem
cmapi.channel.publisher[cmapi.channel.names.MAP_STATUS_SCREENSHOT] = {

  // args will have a transaction property
  process: function(transaction) {
    try {
      var oData = transaction.items[0],
        payload = {};

      //payload.messageId = transaction.transactionId;

      if (oData) {
        payload.dataUrl = oData.dataUrl;
      }

      emp.environment.get().pubSub.publish({
        message: payload,
        sender: {
          id: transaction.mapInstanceId
        },
        channel: cmapi.channel.names.MAP_STATUS_SCREENSHOT
      });
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_FEATURE_CLICKED + " failed due to an error.",
        jsError: e
      });
    }
  }
};
