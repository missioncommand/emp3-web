/* globals emp, cmapi */

/* global cmapi */

// Register a channel handler for MAP_FEATURE_HIDE
cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_HIDE] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction,
            oItems = [],
            oItem,
            message = args.message,
            sender = args.sender,
            payload;
            //schema;


        // get schema for this channel
        // can use for channel specific validation
        //schema = cmapi.channel.schema[cmapi.channel.names.MAP_FEATURE_HIDE];

        if (!Array.isArray(message.payload)) {
            message.payload = [message.payload];
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.VISIBILITY_SET,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_FEATURE_HIDE,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_FEATURE_HIDE,
            items: oItems
        });

        for (var iIndex = 0, iLength = message.payload.length;
                iIndex < iLength; iIndex++) {
            payload = message.payload[iIndex];

            if (emp.helpers.isEmptyString(payload.overlayId))
            {
                payload.overlayId = sender.id;
            }

            oItem = {
                overlayId: payload.overlayId,
                featureId: payload.featureId,
                visible: false,
                zoom: false
            };

            if (!emp.helpers.isEmptyString(payload.parentId))
            {
                oItem.parentId = payload.parentId;
            }

            oItems.push(oItem);
        }

        oTransaction.queue();
    }
};
