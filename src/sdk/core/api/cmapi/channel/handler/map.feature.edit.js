/* global cmapi */

// Register a channel handler for MAP_FEATURE_EDIT
cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_EDIT] = {

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
        //schema = cmapi.channel.schema[cmapi.channel.names.MAP_FEATURE_EDIT];

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

            oItem = new emp.typeLibrary.Edit(payload);
            oItem.transactionId = message.messageId;
            oItems.push(oItem);
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.EDIT_BEGIN,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_FEATURE_EDIT,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_FEATURE_EDIT,
            items: oItems
        });

        oTransaction.queue();
    }
};
