/*global emp, cmapi */
// Register a channel handler for MAP_VIEW_CENTER_LOCATION
cmapi.channel.handler[cmapi.channel.names.MAP_VIEW_CENTER_LOCATION] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction;
        var message = args.message;
        var sender = args.sender;

        // get schema for this channel
        // can use for channel specific validation
        //var schema = cmapi.channel.schema[cmapi.channel.names.MAP_VIEW_CENTER_LOCATION];

        if (!Array.isArray(message.payload)) {
          message.payload = [message.payload];
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.VIEW_SET,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_VIEW_CENTER_LOCATION,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_VIEW_CENTER_LOCATION,
            items: [new emp.typeLibrary.View({
                    //range: message.payload[0].range,
                    zoom: message.payload[0].zoom,
                    tilt: message.payload[0].tilt,
                    roll: message.payload[0].roll,
                    heading: message.payload[0].heading,
                    location: {
                        lat: message.payload[0].location.lat,
                        lon: message.payload[0].location.lon
                    },
                    animate: message.payload[0].animate
                })]
        });
        oTransaction.queue();
    }
};
