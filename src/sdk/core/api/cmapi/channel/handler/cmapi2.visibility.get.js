/**
 * Handles message sent over the CMAPI2_VISIBILITY_GET channel and creates
 * the appropriate transaction for the core map.  getVisibility messages
 * are not sent to the engine, as all checks need to be done to the storage
 * engine.
 *
 * (this channel does not exist in CMAPI 1.3 and is called out as such,
 *  eventually should be moved to a CMAPI 2.0 set of handlers.)
 *
 */
cmapi.channel.handler[cmapi.channel.names.CMAPI2_VISIBILITY_GET] = {
  // args will have a message and sender property
  process: function (args) {
      var oTransaction;
      var message = args.message;
      var sender = args.sender;

      // If the message is not an array, create an array out of it
      // so we can blanket handle all messages sent that way.
      if (!Array.isArray(message.payload)) {
        message.payload = [message.payload];
      }

      // Create a VISIBILITY_GET transaction,  There is no type in the
      // typeLibrary that corresponds to VISIBILITY_GET, so we just make up
      // the object on the fly and send it to the transactionQueue.
      oTransaction = new emp.typeLibrary.Transaction({
          intent: emp.intents.control.VISIBILITY_GET,
          mapInstanceId: args.mapInstanceId,
          transactionId: message.messageId,
          sender: sender.id,
          originChannel: cmapi.channel.names.CMAPI2_VISIBILITY_GET,
          source: emp.api.cmapi.SOURCE,
          originalMessage: args.originalMessage,
          messageOriginator: sender.id,
          originalMessageType: cmapi.channel.names.CMAPI2_VISIBILITY_GET,
          items: [{
            coreId: message.payload[0].targetId,
            parentId: message.payload[0].parentId,
            visible: undefined
          }]
      });
      oTransaction.queue();
  }
};
