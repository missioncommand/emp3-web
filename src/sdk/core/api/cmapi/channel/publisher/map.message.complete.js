// Register a channel publisher for map.status.MAP_MESSAGE_COMPLETE
cmapi.channel.publisher[cmapi.channel.names.MAP_MESSAGE_COMPLETE] = {

  // oTransaction will have a transaction property
  process: function(oTransaction) {
    try {
      var oMessage;
      var oMsgBuilder;


      if (oTransaction.sendTransactionComplete === true) {
        // This transaction wants a TC.
        oMsgBuilder = cmapi.map.message.complete.builder[oTransaction.intent];
        if (oMsgBuilder) {
          oMessage = oMsgBuilder.build(oTransaction);
        } else {
          // If there is no builder we create the default
          // completion message.
          oMessage = new cmapi.typeLibrary.MessageComplete(oTransaction);
        }
        emp.environment.get().pubSub.publish({
          message: oMessage,
          sender: {
            id: oTransaction.mapInstanceId
          },
          channel: cmapi.channel.names.MAP_MESSAGE_COMPLETE
        });
      }
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + oTransaction.intent + " on channel " + cmapi.channel.names.MAP_MESSAGE_COMPLETE + " failed due to an error.",
        jsError: e
      });
    }
  }
};
