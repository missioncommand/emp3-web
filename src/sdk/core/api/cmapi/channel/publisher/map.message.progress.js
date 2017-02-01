// Register a channel publisher for map.status.MAP_MESSAGE_PROGRESS
cmapi.channel.publisher[cmapi.channel.names.MAP_MESSAGE_PROGRESS] = {

  // oTransaction will have a transaction property
  process: function(oTransaction) {
    try {
      var oMessage;
      var oMsgBuilder;

      oMsgBuilder = cmapi.map.message.progress.builder[oTransaction.intent];
      if (oMsgBuilder) {
        oMessage = oMsgBuilder.build(oTransaction);
        emp.environment.get().pubSub.publish({
          message: oMessage,
          sender: {
            id: oTransaction.mapInstanceId
          },
          channel: cmapi.channel.names.MAP_MESSAGE_PROGRESS
        });
      } else {
        emp.typeLibrary.Error({
          message: "No cmapi.map.message.progress.builder for intent " + oTransaction.intent + "."
        });
      }
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing progress for intent " + oTransaction.intent + " on channel " + cmapi.channel.names.MAP_MESSAGE_PROGRESS + " failed due to an error.",
        jsError: e
      });
    }
  }
};
