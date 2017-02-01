/*global emp, cmapi */
// Register a channel handler for MAP_VIEW_COORDINATESYSTEM
cmapi.channel.handler[cmapi.channel.names.MAP_VIEW_COORDINATESYSTEM] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction;
        var message = args.message;
        var sender = args.sender;
        var asTypes = [];
        var sTrasnID;
        var sCoordsystem = "dd";

        // get schema for this channel
        // can use for channel specific validation
        //var schema = cmapi.channel.schema[cmapi.channel.names.MAP_VIEW_COORDINATESYSTEM];

        if (!Array.isArray(message.payload)) {
          message.payload = [message.payload];
        }

        if (message.payload[0] && message.payload[0].coordinateSystem)
        {
            sCoordsystem = message.payload[0].coordinateSystem;
            emp.ui.coordinates.setFormat(sCoordsystem);
        }

        if (message.messageId)
        {
            sTrasnID = message.messageId;
        }

        asTypes = [
            cmapi.channel.mapStatusRequest.requestTypes.STATUS_REQUEST_COORD_SYSTEM
        ];

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.VIEW_COORDINATESYSTEM,
            mapInstanceId: args.mapInstanceId,
            transactionId: sTrasnID,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_VIEW_COORDINATESYSTEM,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_VIEW_COORDINATESYSTEM,
            items: [new emp.typeLibrary.Status(message.payload[0])]
        });
        oTransaction.queue();

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.STATUS_RESPONSE_COORD_SYSTEM,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_VIEW_COORDINATESYSTEM,
            source: emp.api.cmapi.SOURCE,
            items: asTypes
        });
        oTransaction.queue();
    }
};
