/* global cmapi */

// Register a channel handler for MAP_OVERLAY_REMOVE
cmapi.channel.handler[cmapi.channel.names.MAP_OVERLAY_REMOVE] = {

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
        //schema = cmapi.channel.schema[cmapi.channel.names.MAP_OVERLAY_REMOVE];

        if (!Array.isArray(message.payload)) {
            message.payload = [message.payload];
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.OVERLAY_REMOVE,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_OVERLAY_REMOVE,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_OVERLAY_REMOVE,
            items: oItems
        });

        for (var iIndex = 0, iLength = message.payload.length;
                iIndex < iLength; iIndex++) {
            payload = message.payload[iIndex];

            if ((payload.overlayId === undefined) || (payload.overlayId === null))
            {
                payload.overlayId = sender.id;
            }

            oItem = new emp.typeLibrary.Overlay({
                overlayId: payload.overlayId,
                parentId: payload.parentId
            });
            oItems.push(oItem);
        }

        oTransaction.queue();
    }
};
