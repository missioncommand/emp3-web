/*global emp, cmapi */
// Register a channel handler for MAP_FEATURE_UPDATE
cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_UPDATE] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction;
        var oaItems = [];
        var message = args.message;
        var oSender = args.sender;
        var oItem;
        //var oStorageItem;
        //var bFoundMultiParent = false;
        var oPayload;

        // get schema for this channel
        // can use for channel specific validation
        // schema = cmapi.channel.schema["map.feature.update"];

        if (!Array.isArray(message.payload)) {
          message.payload = [message.payload];
        }

        oTransaction = new emp.typeLibrary.Transaction({
                intent: emp.intents.control.FEATURE_UPDATE,
                mapInstanceId: args.mapInstanceId,
                transactionId: message.messageId,
                sender: oSender.id,
                originChannel: cmapi.channel.names.MAP_FEATURE_UPDATE,
                source: emp.api.cmapi.SOURCE,
                originalMessage: args.originalMessage,
                messageOriginator: oSender.id,
                originalMessageType: cmapi.channel.names.MAP_FEATURE_UPDATE,
                items: oaItems
            });

        // Build the tranasction
        for (var iIndex = 0, iLength = message.payload.length; iIndex < iLength; iIndex++)
        {
            oPayload = message.payload[iIndex];

            if ((oPayload.overlayId === undefined) || (oPayload.overlayId === null))
            {
                oPayload.overlayId = oSender.id;
            }

            oItem = new emp.typeLibrary.Feature({
                featureId: oPayload.featureId,
                parentId: oPayload.parentId,
                overlayId: oPayload.overlayId,
                name: oPayload.name
            });
            oItem.parentId = oPayload.parentId;

            if (oPayload.hasOwnProperty("name"))
            {
                oItem.name = oPayload.name;
            }
            else
            {
                oItem.name = undefined;
            }

            if (oPayload.hasOwnProperty("newOverlayId"))
            {
                oItem.destOverlayId = oPayload.newOverlayId;
            }

            if (oPayload.hasOwnProperty("newParentId"))
            {
                oItem.destParentId = oPayload.newParentId;
            }
            oaItems.push(oItem);
        }

        oTransaction.queue();
    }
};
