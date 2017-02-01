// Register a channel publisher for map.status.coordinatesystem
cmapi.channel.publisher[cmapi.channel.names.MAP_STATUS_COORDINATESYSTEM] = {

  // args will have a transaction property
  process: function(transaction) {
    try {
      var payload = {};

      //payload.messageId = oData.transactionId;
      payload.displayedCoordinateSystem = emp.ui.coordinates.currentFormat();
      payload.coordinateSystem = emp.ui.coordinates.currentFormat();

      emp.environment.get().pubSub.publish({
        message: payload,
        sender: {
          id: transaction.mapInstanceId
        },
        channel: cmapi.channel.names.MAP_STATUS_COORDINATESYSTEM
      });
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_FEATURE_CLICKED + " failed due to an error.",
        jsError: e
      });
    }
  }
};
