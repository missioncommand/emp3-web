/*global emp, cmapi */

// Register a channel handler for MAP_OVERLAY_CLUSTER_SET
cmapi.channel.handler[cmapi.channel.names.MAP_OVERLAY_CLUSTER_SET] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction,
            oItems = [],
            message = args.message,
            sender = args.sender,
            payload,
            i,
            len;


        if (!Array.isArray(message.payload)) {
            message.payload = [message.payload];
        }

        for (i = 0, len = message.payload.length;
                i < len; i++) {
            payload = message.payload[i];

            oItems.push(new emp.typeLibrary.Overlay.Cluster({
                overlayId: payload.overlayId || sender.id,
                threshold: payload.threshold,
                distance: payload.distance,
                clusterStyle: payload.clusterStyle
            }));
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.OVERLAY_CLUSTER_SET,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_OVERLAY_CLUSTER_SET,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_OVERLAY_CLUSTER_SET,
            items: oItems
        });
        oTransaction.queue();
    }
};
