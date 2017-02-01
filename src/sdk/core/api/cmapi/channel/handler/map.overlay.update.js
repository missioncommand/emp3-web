/*global emp, cmapi */
// Register a channel handler for MAP_OVERLAY_UPDATE
cmapi.channel.handler[cmapi.channel.names.MAP_OVERLAY_UPDATE] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction;
        var oaItems = [];
        var message = args.message;
        var oSender = args.sender;
        var oItem;
        //var oStorageItem;
        var oPayload;

        // get schema for this channel
        // can use for channel specific validation
        // schema = cmapi.channel.schema["map.feature.update"];

        if (!Array.isArray(message.payload)) {
          message.payload = [message.payload];
        }

        oTransaction = new emp.typeLibrary.Transaction({
                intent: emp.intents.control.OVERLAY_UPDATE,
                mapInstanceId: args.mapInstanceId,
                transactionId: message.messageId,
                sender: oSender.id,
                originChannel: cmapi.channel.names.MAP_OVERLAY_UPDATE,
                source: emp.api.cmapi.SOURCE,
                originalMessage: args.originalMessage,
                messageOriginator: oSender.id,
                originalMessageType: cmapi.channel.names.MAP_OVERLAY_UPDATE,
                items: oaItems
            });

        // Build the tranasction
        for (var iIndex = 0, iLength = message.payload.length; iIndex < iLength; iIndex++)
        {
            oPayload = message.payload[iIndex];

            // All the validation will happen prior to execution.
            oItem = {
                coreId: oPayload.overlayId,
                overlayId: oPayload.overlayId,
                name: oPayload.name
            };

            if (oPayload.hasOwnProperty('parentId'))
            {
                oItem.parentId = oPayload.parentId;
            }

            if (oPayload.hasOwnProperty('properties'))
            {
                oItem.properties = oPayload.properties;
            }

            oaItems.push(oItem);
        }

        oTransaction.queue();
    }
};
