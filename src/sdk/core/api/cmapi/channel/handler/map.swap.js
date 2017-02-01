/* global cmapi */

// Register a channel handler for MAP_SWAP
cmapi.channel.handler[cmapi.channel.names.MAP_SWAP] = {
  // args will have a message and sender property
  process: function (args) {
    var oTransaction,
      message = args.message,
      sender = args.sender,
      oItems = [];

    if (!Array.isArray(message.payload)) {
      message.payload = [message.payload];
    }
    oItems.push({
      mapId: message.payload[0].mapId,
      engine: message.payload[0].engine
    });
    oTransaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.MAP_SWAP,
      mapInstanceId: args.mapInstanceId,
      transactionId: message.messageId,
      sender: sender.id,
      originChannel: cmapi.channel.names.MAP_SWAP,
      source: emp.api.cmapi.SOURCE,
      originalMessage: args.originalMessage,
      messageOriginator: sender.id,
      originalMessageType: cmapi.channel.names.MAP_SWAP,
      items: oItems
    });
    oTransaction.queue();
  }
};
