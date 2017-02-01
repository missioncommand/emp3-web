/* global cmapi */

// Register a channel handler for MAP_VIEW_LOCK
cmapi.channel.handler[cmapi.channel.names.MAP_VIEW_LOCK] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction;
        var message = args.message,
            sender = args.sender,
            payload,
            oItem,
            oItems = [],
            iIndex,
            iLength;

        if (!Array.isArray(message.payload)) {
            message.payload = [message.payload];
        }

        for (iIndex = 0, iLength = message.payload.length;
                iIndex < iLength; iIndex++) {

            payload = message.payload[iIndex];

            oItem = new emp.typeLibrary.Lock({
                lock: payload.lock
            });

            oItems.push(oItem);
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.VIEW_LOCK,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_VIEW_LOCK,
            items: oItems
        });
        oTransaction.queue();
    }
};
