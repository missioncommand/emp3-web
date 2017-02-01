/*global emp, cmapi */
// Register a channel handler for MAP_VIEW_CENTER_BOUNDS
cmapi.channel.handler[cmapi.channel.names.MAP_VIEW_CENTER_BOUNDS] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction;
        var message = args.message;
        var sender = args.sender;

        // get schema for this channel
        // can use for channel specific validation
        //var schema = cmapi.channel.schema[cmapi.channel.names.MAP_VIEW_CENTER_BOUNDS];

        if (!Array.isArray(message.payload)) {
          message.payload = [message.payload];
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.VIEW_SET,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_VIEW_CENTER_BOUNDS,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_VIEW_CENTER_BOUNDS,
            items: [new emp.typeLibrary.View({
                    //overlayId: message.payload[0].overlayId,
                    //featureId: message.payload[0].featureId,
                    //parentId: message.payload[0].parentId,
                    //range: message.payload[0].range,
                    zoom: message.payload[0].zoom,
                    //tilt: message.payload[0].tilt,
                    //pan: message.payload[0].pan,
                    //heading: message.payload[0].heading,
                    //location: {
                    //    lat: message.payload[0].location.lat,
                    //    lon: message.payload[0].location.lon
                    //},
                    bounds: message.payload[0].bounds,
                    animate: message.payload[0].animate
                })]
        });
        oTransaction.queue();
    }
};
