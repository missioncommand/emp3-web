// Register a channel publisher for map.status.MAP_ERROR
cmapi.channel.publisher[cmapi.channel.names.MAP_ERROR] = {

  // args will have a transaction property
  process: function(transaction) {
    try {
      var sErrorMessage = "";
      var bErrorsPresent = false;

      for (var iIndex = 0; iIndex < transaction.failures.length; iIndex++) {
        if (transaction.failures[iIndex].hasOwnProperty("level") &&
          (transaction.failures[iIndex].level === emp.typeLibrary.Error.level.INFO)) {
          // Its not an error so skip it.
          continue;
        }

        bErrorsPresent = true;

        if (transaction.failures[iIndex].hasOwnProperty("message")) {
          if (sErrorMessage.length > 0) {
            sErrorMessage += "\n";
          }
          sErrorMessage += transaction.failures[iIndex].message;
        }
      }

      if (!bErrorsPresent) {
        // There were no errors > emp.typeLibrary.Error.level.INFO
        // so don't send the error message.
        return;
      }

      var payload = {
        sender: transaction.messageOriginator,
        type: transaction.originalMessageType,
        msg: transaction.originalMessage,
        error: sErrorMessage
      };

      emp.environment.get().pubSub.publish({
        message: payload,
        sender: {
          id: transaction.mapInstanceId
        },
        channel: cmapi.channel.names.MAP_ERROR
      });
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_ERROR + " failed due to an error.",
        jsError: e
      });
    }
  }
};
