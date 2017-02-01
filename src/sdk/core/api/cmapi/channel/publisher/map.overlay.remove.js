/* global cmapi */

// Register a channel publisher for MAP_OVERLAY_REMOVE
cmapi.channel.publisher[cmapi.channel.names.MAP_OVERLAY_REMOVE] = {

  // args will have a transaction property
  process: function(transaction) {
    try {
      var oOveralys = transaction.items,
        payload = [],
        oData;

      if (transaction.source === emp.api.cmapi.SOURCE) {
        // Dont generate message if it came from the cmapi channel.
        return;
      }

      for (var iIndex = 0; iIndex < oOveralys.length; iIndex++) {
        oData = {
          overlayId: oOveralys[iIndex].overlayId
        };
        
        if (!emp.util.isEmptyString(oOveralys[iIndex].parentId)) {
            oData.parentId = oOveralys[iIndex].parentId;
        }
        payload.push(oData);
      }

      if (payload.length === 0) {
        //No overlays where deleted.
        return;
      }

      emp.environment.get().pubSub.publish({
        message: payload,
        sender: {
          id: transaction.mapInstanceId
        },
        channel: cmapi.channel.names.MAP_OVERLAY_REMOVE
      });
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_OVERLAY_REMOVE + " failed due to an error.",
        jsError: e
      });
    }
  }
};
