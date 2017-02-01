/* globals emp, cmapi */

// Register a channel handler for map.feature.unplot
cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_UNPLOT] = {

    // args will have a message and sender property
    process: function (args) {
        var featureTransaction,
            i,
            len,
            featureItems = [],
            message = args.message,
            sender = args.sender,
            payload;
            //item,
            //itemInStorage;


        // get schema for this channel
        // can use for channel specific validation
        //schema = cmapi.channel.schema[cmapi.channel.names.MAP_FEATURE_UNPLOT];

        if (!Array.isArray(message.payload)) {
            message.payload = [message.payload];
        }

        len = message.payload.length;

        for (i = 0; i < len; i = i + 1) {
            payload = message.payload[i];
            //item = {};

            if ((payload.overlayId === undefined) || (payload.overlayId === null))
            {
                payload.overlayId = sender.id;
            }

            featureItems.push({
                    overlayId: payload.overlayId,
                    parentId: payload.parentId,
                    featureId: payload.featureId
                });
        }

        featureTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.CMAPI_GENERIC_FEATURE_REMOVE,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_FEATURE_UNPLOT,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_FEATURE_UNPLOT,
            items: featureItems
        });

        featureTransaction.queue();
    }
};
