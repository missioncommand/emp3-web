cmapi.channel.handler[cmapi.channel.names.MAP_CONVERT] = {

  process: function(args) {
    var xyTransaction,
      latlonTransaction,
      message = args.message,
      sender = args.sender,
      payload,
      oItem,
      //oStorageItem,
      xyToLatlonItems = [],
      latlonToXYItems = [];


    // get schema for this channel
    // can use for channel specific validation
    if (!Array.isArray(message.payload)) {
      message.payload = [message.payload];
    }

    for (var iIndex = 0, iLength = message.payload.length; iIndex < iLength; iIndex++) {

      payload = message.payload[iIndex];

      if (!payload.conversionType) {
        payload.conversionType = "offsetPixelToDecimalDegrees";
      }

      switch (payload.conversionType) {
        case "offsetPixelToDecimalDegrees":
          oItem = new emp.typeLibrary.Convert({
            y: payload.y,
            x: payload.x
          });

          xyToLatlonItems.push(oItem);
          break;
        case "decimalDegreesToOffsetPixel":
          oItem = new emp.typeLibrary.Convert({
            lat: payload.y,
            lon: payload.x
          });

          latlonToXYItems.push(oItem);
          break;
      }
    }

    if (xyToLatlonItems.length > 0) {
      xyTransaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.GET_LATLON_FROM_XY,
        mapInstanceId: args.mapInstanceId,
        transactionId: message.messageId,
        sender: sender.id,
        source: emp.api.cmapi.SOURCE,
        originChannel: cmapi.channel.names.MAP_CONVERT,
        originalMessage: args.originalMessage,
        messageOriginator: sender.id,
        originalMessageType: cmapi.channel.names.MAP_CONVERT,
        items: xyToLatlonItems
      });
      xyTransaction.queue();
    }

    if (latlonToXYItems.length > 0) {
      latlonTransaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.GET_XY_FROM_LATLON,
        mapInstanceId: args.mapInstanceId,
        transactionId: message.messageId,
        sender: sender.id,
        source: emp.api.cmapi.SOURCE,
        originChannel: cmapi.channel.names.MAP_CONVERT,
        originalMessage: args.originalMessage,
        messageOriginator: sender.id,
        originalMessageType: cmapi.channel.names.MAP_CONVERT,
        items: latlonToXYItems
      });
      latlonTransaction.queue();
    }
  }
};
