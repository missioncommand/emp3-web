/*global emp, cmapi */
// Register a channel handler for MAP_GET
cmapi.channel.handler[cmapi.channel.names.MAP_GET] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction;
        var message = args.message;
        var sender = args.sender;

        // get schema for this channel
        // can use for channel specific validation
        //var schema = cmapi.channel.schema[cmapi.channel.names.MAP_GET];

        if (!Array.isArray(message.payload)) {
          message.payload = [message.payload];
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.GET,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_GET,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_GET,
            items: [new emp.typeLibrary.Status(message.payload[0])]
        });
        oTransaction.queue();
    }
};
