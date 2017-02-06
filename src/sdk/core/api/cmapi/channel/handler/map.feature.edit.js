/* global cmapi */

// Register a channel handler for MAP_FEATURE_EDIT
cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_EDIT] = {

  // args will have a message and sender property
  process: function(args) {
    var transaction;
    var message = args.message,
      sender = args.sender,
      payload,
      item,
      items = [];


    if (!Array.isArray(message.payload)) {
      message.payload = [message.payload];
    }

    for (var i = 0, length = message.payload.length; i < length; i++) {
      payload = message.payload[i];

      if ((payload.overlayId === undefined) || (payload.overlayId === null)) {
        payload.overlayId = sender.id;
      }

      item = new emp.typeLibrary.Edit(payload);
      item.transactionId = message.messageId;
      items.push(item);
    }

    transaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.EDIT_BEGIN,
      mapInstanceId: args.mapInstanceId,
      transactionId: message.messageId,
      sender: sender.id,
      originChannel: cmapi.channel.names.MAP_FEATURE_EDIT,
      source: emp.api.cmapi.SOURCE,
      originalMessage: args.originalMessage,
      messageOriginator: sender.id,
      originalMessageType: cmapi.channel.names.MAP_FEATURE_EDIT,
      items: items
    });

    transaction.queue();
  }
};
