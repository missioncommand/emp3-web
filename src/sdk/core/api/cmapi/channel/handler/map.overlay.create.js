/* global cmapi */

// Register a channel handler for MAP_OVERLAY_CREATE
cmapi.channel.handler[cmapi.channel.names.MAP_OVERLAY_CREATE] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction;
        var message = args.message,
            sender = args.sender,
            payload,
            oItem,
            oItems = [];
        var sDescription;
        //var sIconUrl;
        var bReadOnly;
        var bVisible;


        // get schema for this channel
        // can use for channel specific validation
        //schema = cmapi.channel.schema[cmapi.channel.names.MAP_OVERLAY_CREATE];

        if (!Array.isArray(message.payload)) {
            message.payload = [message.payload];
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.OVERLAY_ADD,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_OVERLAY_CREATE,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_OVERLAY_CREATE,
            items: oItems
        });

        for (var iIndex = 0, iLength = message.payload.length; iIndex < iLength; iIndex++) {
            payload = message.payload[iIndex];

            if ((payload.overlayId === undefined) || (payload.overlayId === null))
            {
                payload.overlayId = sender.id;
            }

            sDescription = undefined;
            //sIconUrl = undefined;
            bReadOnly = false;
            bVisible = true;

            if (payload.hasOwnProperty('description'))
            {
                sDescription = payload.description;
            }
            if (payload.hasOwnProperty('readOnly'))
            {
                bReadOnly = (payload.readOnly === true);
            }
            if (payload.hasOwnProperty('visible'))
            {
                bVisible = (payload.visible !== false);
            }

            oItem = new emp.typeLibrary.Overlay({
                overlayId: payload.overlayId,
                parentId: payload.parentId,
                name: payload.name,
                properties: payload.properties,
                description: sDescription,
                readOnly: bReadOnly,
                visible: bVisible
            });
            oItems.push(oItem);
        }

        oTransaction.queue();
    }
};
