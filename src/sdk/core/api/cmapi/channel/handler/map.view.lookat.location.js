/*global emp, cmapi */
// Register a channel handler for MAP_VIEW_LOOKAT_LOCATION
cmapi.channel.handler[cmapi.channel.names.MAP_VIEW_LOOKAT_LOCATION] = {

  // args will have a message and sender property
  process: function(args) {
    var transaction;
    var message = args.message;
    var sender = args.sender;
    var payload = message.payload;

    if (!payload.overlayId) {
      payload.overlayId = sender.id;
    }

    transaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.LOOKAT_SET,
      mapInstanceId: args.mapInstanceId,
      transactionId: message.messageId,
      sender: sender.id,
      originChannel: cmapi.channel.names.MAP_VIEW_LOOKAT_LOCATION,
      source: emp.api.cmapi.SOURCE,
      originalMessage: args.originalMessage,
      messageOriginator: sender.id,
      originalMessageType: cmapi.channel.names.MAP_VIEW_LOOKAT_LOCATION,
      items: [new emp.typeLibrary.LookAt({
        overlayId: payload.overlayId,
        latitude: payload.latitude,
        longitude: payload.longitude,
        altitude: payload.altitude,
        range: payload.range,
        tilt: payload.tilt,
        heading: payload.heading,
        animate: payload.animate
      })]
    });
    transaction.queue();
  }
};
