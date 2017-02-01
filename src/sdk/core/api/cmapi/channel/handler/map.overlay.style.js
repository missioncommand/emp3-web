// Register a channel handler for MAP_OVERLAY_STYLE
cmapi.channel.handler[cmapi.channel.names.MAP_OVERLAY_STYLE] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction;
        var message = args.message,
            sender = args.sender,
            payload,
            oItem,
            oItems = [];


        // get schema for this channel
        // can use for channel specific validation
        //schema = cmapi.channel.schema[cmapi.channel.names.MAP_OVERLAY_STYLE];

        if (!Array.isArray(message.payload)) {
            message.payload = [message.payload];
        }

        for (var iIndex = 0, iLength = message.payload.length;
                iIndex < iLength; iIndex++) {
            payload = message.payload[iIndex];

            if ((payload.overlayId === undefined) || (payload.overlayId === null))
            {
                payload.overlayId = sender.id;
            }

            oItem = new emp.typeLibrary.OverlayStyle(payload);
            oItems.push(oItem);
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.OVERLAY_STYLE,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_OVERLAY_STYLE,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_OVERLAY_STYLE,
            items: oItems
        });

        oTransaction.queue();
    }
};
