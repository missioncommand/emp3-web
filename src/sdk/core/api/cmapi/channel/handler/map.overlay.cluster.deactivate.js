/*global emp, cmapi */

// Register a channel handler for MAP_OVERLAY_CLUSTER_DEACTIVATE
cmapi.channel.handler[cmapi.channel.names.MAP_OVERLAY_CLUSTER_DEACTIVATE] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction,
            oItems = [],
            message = args.message,
            sender = args.sender,
            payload,
            oItem,
            i,
            len;

        if (!Array.isArray(message.payload)) {
            message.payload = [message.payload];
        }

        for (i = 0, len = message.payload.length;
                i < len; i++) {
            payload = message.payload[i];

            oItem = new emp.typeLibrary.Overlay.Cluster({
                overlayId: payload.overlayId || sender.id
            });
            oItems.push(oItem);
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.OVERLAY_CLUSTER_DEACTIVATE,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            originChannel: cmapi.channel.names.MAP_OVERLAY_CLUSTER_DEACTIVATE,
            sender: sender.id,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_OVERLAY_CLUSTER_DEACTIVATE,
            items: oItems
        });
        oTransaction.queue();
    }
};
