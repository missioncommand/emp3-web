/* global emp, cmapi */

cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_UNPLOT_BATCH] = {

    // args will have a message and sender property
    process: function (args) {
        var featureTransaction,
            i,
            len,
            featureItems = [],
            message = args.message.payload,
            oaFeatures = message.features,
            sender = args.sender,
            payload,
            //item,
            sOverlayId;

        if (message.hasOwnProperty('overlayId'))
        {
            // Check to see if there is a global overlayId.
            sOverlayId = message.overlayId;
        }

        len = oaFeatures.length;

        for (i = 0; i < len; i = i + 1) {
            payload = oaFeatures[i];
            //item = {};

            if ((payload.overlayId === undefined) || (payload.overlayId === null))
            {
                // If it has no overlayId see if there is a global one else use the sender id.
                if (sOverlayId)
                {
                    payload.overlayId = sOverlayId;
                }
                else
                {
                    payload.overlayId = sender.id;
                }
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
            originChannel: cmapi.channel.names.MAP_FEATURE_UNPLOT_BATCH,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_FEATURE_UNPLOT_BATCH,
            items: featureItems
        });

        featureTransaction.queue();
    }
};
