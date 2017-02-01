/*global emp, cmapi */
// Register a channel handler for MAP_VIEW_CENTER_OVERLAY
cmapi.channel.handler[cmapi.channel.names.MAP_VIEW_CENTER_OVERLAY] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction;
        var message = args.message;
        var sender = args.sender;
        var oPayload;
        var oOverlay;
        var oMapExtent;

        // get schema for this channel
        // can use for channel specific validation
        //var schema = cmapi.channel.schema[cmapi.channel.names.MAP_VIEW_CENTER_OVERLAY];

        if (!Array.isArray(message.payload)) {
          message.payload = [message.payload];
        }

        oPayload = message.payload[0];

        if ((oPayload.overlayId === undefined) || (oPayload.overlayId === null))
        {
            oPayload.overlayId = sender.id;
        }

        oOverlay = emp.storage.findOverlay(oPayload.overlayId);

        if (oOverlay) {
            oMapExtent = oOverlay.getMapExtent();

            if (oMapExtent && !oMapExtent.isEmpty()) {
                oPayload.bounds = {
                    west: oMapExtent.getWest(),
                    east: oMapExtent.getEast(),
                    south: oMapExtent.getSouth(),
                    north: oMapExtent.getNorth()
                };
            }
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.VIEW_SET,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_VIEW_CENTER_OVERLAY,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_VIEW_CENTER_OVERLAY,
            items: [new emp.typeLibrary.View({
                    bounds: oPayload.bounds,
                    zoom: oPayload.zoom
            })]
        });
        oTransaction.queue();
    }
};
