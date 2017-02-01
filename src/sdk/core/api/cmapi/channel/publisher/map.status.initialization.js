/* global cmapi */

// Register a channel publisher for map.status.initialization
cmapi.channel.publisher[cmapi.channel.names.MAP_STATUS_INITIALIZATION] = {

  // args will have a transaction property
  process: function(transaction) {
    try {
      var payload = {},
        sField,
        mapInstance = emp.instanceManager.getInstance(transaction.mapInstanceId);

      payload = {
        status: "ready",
        engineId: mapInstance.engineId,
        types: []
      };

      if (transaction.items.length > 0) {
        //payload.messageId = transaction.items[0].transactionId;

        if (transaction.items[0].hasOwnProperty("status")) {
          payload.status = transaction.items[0].status;
        }
      }

      if (payload.status === "ready") {
        for (sField in cmapi.channel.mapStatusRequest.requestTypes) {
          payload.types.push(cmapi.channel.mapStatusRequest.requestTypes[sField]);
        }

        payload.defaultWMSOverlayId = emp.wms.manager.getWmsOverlayId(transaction.mapInstanceId);
        payload.defaultLayerOverlayId = mapInstance.engines.getDefaultLayerOverlayID(transaction.mapInstanceId);
      }

      emp.environment.get().pubSub.publish({
        message: payload,
        sender: {
            id: transaction.mapInstanceId
        },
        channel: cmapi.channel.names.MAP_STATUS_INITIALIZATION
      });
      if (payload.status === "teardown") {
        emp.environment.get().pubSub.publish({
          message: {
            type: "MAP_CLOSE"
          },
          channel: "MapChannel"
        });
      }
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_STATUS_INITIALIZATION + " failed due to an error.",
        jsError: e
      });
    }
  }
};
