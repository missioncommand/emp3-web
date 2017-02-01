/* globals emp, cmapi */

/* global cmapi */

// Register a channel handler for MAP_OVERLAY_SHOW
cmapi.channel.handler[cmapi.channel.names.MAP_OVERLAY_SHOW] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction,
            oItems = [],
            message = args.message,
            sender = args.sender,
            payload,
            //schema,
            oItem;


        // get schema for this channel
        // can use for channel specific validation
        //schema = cmapi.channel.schema[cmapi.channel.names.MAP_OVERLAY_SHOW];

        if (!Array.isArray(message.payload)) {
            message.payload = [message.payload];
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.VISIBILITY_SET,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_OVERLAY_SHOW,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_OVERLAY_SHOW,
            items: oItems
        });

        for (var iIndex = 0, iLength = message.payload.length;
                iIndex < iLength; iIndex++) {
            payload = message.payload[iIndex];

            oItem = {
                overlayId: payload.overlayId,
                visible: true,
                zoom: false,
                recurse: payload.recurse
            };

            if (!emp.helpers.isEmptyString(payload.parentId))
            {
                oItem.parentId = payload.parentId;
            }
            else
            {
                oItem.parentId = emp.constant.parentIds.ALL_PARENTS;
            }

            oItems.push(oItem);
        }

        oTransaction.queue();
    }
};
