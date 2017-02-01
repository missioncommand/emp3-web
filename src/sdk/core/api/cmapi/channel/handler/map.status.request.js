/*global emp, cmapi */
// Register a channel handler for map.status.request
cmapi.channel.handler[cmapi.channel.names.MAP_STATUS_REQUEST] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction;
        var message = args.message;
        var sender = args.sender;
        var asTypes = [];
        var payload;
        var sIntent;
        var sTrasnID;

        // get schema for this channel
        // can use for channel specific validation
        //var schema = cmapi.channel.schema[cmapi.channel.names.MAP_STATUS_REQUEST];

        if (!Array.isArray(message.payload)) {
          message.payload = [message.payload];
        }

        asTypes = message.payload[0].types;

        if (message.messageId)
        {
            sTrasnID = message.messageId;
        }

        if (!asTypes || asTypes.length === 0)
        {
            asTypes = [
                cmapi.channel.mapStatusRequest.requestTypes.STATUS_REQUEST_INIT,
                cmapi.channel.mapStatusRequest.requestTypes.STATUS_REQUEST_ABOUT,
                cmapi.channel.mapStatusRequest.requestTypes.STATUS_REQUEST_FORMAT,
                cmapi.channel.mapStatusRequest.requestTypes.STATUS_REQUEST_VIEW,
                cmapi.channel.mapStatusRequest.requestTypes.STATUS_REQUEST_SELECTED,
                cmapi.channel.mapStatusRequest.requestTypes.STATUS_REQUEST_COORD_SYSTEM
            ];
        }

        for (var iIndex = 0; iIndex < asTypes.length; iIndex++) {
            payload = {};
            switch (asTypes[iIndex]) {
            case cmapi.channel.mapStatusRequest.requestTypes.STATUS_REQUEST_ABOUT:
                sIntent = emp.intents.control.STATUS_RESPONSE_ABOUT;
                break;
            case cmapi.channel.mapStatusRequest.requestTypes.STATUS_REQUEST_FORMAT:
                sIntent = emp.intents.control.STATUS_RESPONSE_FORMAT;
                break;
            case cmapi.channel.mapStatusRequest.requestTypes.STATUS_REQUEST_VIEW:
                sIntent = emp.intents.control.VIEW_GET;
                payload = new emp.typeLibrary.View({
                        sender: sender.id
                    });
                break;
            case cmapi.channel.mapStatusRequest.requestTypes.STATUS_REQUEST_SELECTED:
                sIntent = emp.intents.control.STATUS_RESPONSE_SELECTED;
                break;
            case cmapi.channel.mapStatusRequest.requestTypes.STATUS_REQUEST_SCREENSHOT:
                sIntent = emp.intents.control.STATUS_REQUEST_SCREENSHOT;
                payload = new emp.typeLibrary.View({
                        screenshot: true
                    });
                break;
            case cmapi.channel.mapStatusRequest.requestTypes.STATUS_REQUEST_INIT:
                sIntent = emp.intents.control.STATUS_RESPONSE_INIT;
                break;
            case cmapi.channel.mapStatusRequest.requestTypes.STATUS_REQUEST_COORD_SYSTEM:
                sIntent = emp.intents.control.STATUS_RESPONSE_COORD_SYSTEM;
                break;
            default:
                continue;
            }

            payload.transactionId = sTrasnID;
            oTransaction = new emp.typeLibrary.Transaction({
                intent: sIntent,
                mapInstanceId: args.mapInstanceId,
                transactionId: sTrasnID,
                sender: sender.id,
                intentParams: asTypes[iIndex],
                source: emp.api.cmapi.SOURCE,
                originChannel: cmapi.channel.names.MAP_STATUS_REQUEST,
                originalMessage: args.originalMessage,
                messageOriginator: sender.id,
                originalMessageType: cmapi.channel.names.MAP_STATUS_REQUEST,
                items: [payload]
            });
            oTransaction.queue();

            sTrasnID = undefined;
        }
    }
};
