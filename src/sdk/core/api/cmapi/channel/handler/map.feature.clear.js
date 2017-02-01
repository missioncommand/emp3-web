/* global cmapi */

// Register a channel handler for MAP_FEATURE_CLEAR
cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_CLEAR] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction;
        var message = args.message,
            sender = args.sender,
            payload,
            oItem,
            oStorageItem,
            oItems = [];


        // get schema for this channel
        // can use for channel specific validation
        //schema = cmapi.channel.schema[cmapi.channel.names.MAP_FEATURE_CLEAR];

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

            oStorageItem = emp.storage.get.byIds(payload);

            if (oStorageItem === undefined) {
                // The object is not in storage.
                // Pass it as a feature and let the engine fail it.
                oItem = new emp.typeLibrary.Feature({
                    overlayId: payload.overlayId,
                    parentId: payload.parentId,
                    featureId: payload.featureId
                });
                oItems.push(oItem);
            } else {
                switch (oStorageItem.globalType) {
                case emp.typeLibrary.types.WMS:
                    // A WMS service does not have a parentId.
                    oItem = oStorageItem.createDuplicate();
                    oItems.push(oItem);
                    break;
                case emp.typeLibrary.types.FEATURE:
                default:
                    oItem = oStorageItem.createDuplicate();
                    oItems.push(oItem);
                    break;
                }
            }
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.OVERLAY_CLEAR,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_FEATURE_CLEAR,
            items: oItems
        });
        oTransaction.queue();
    }
};
