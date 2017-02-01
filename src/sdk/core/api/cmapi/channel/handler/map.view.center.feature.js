/*global emp, cmapi */
// Register a channel handler for MAP_VIEW_CENTER_FEATURE
cmapi.channel.handler[cmapi.channel.names.MAP_VIEW_CENTER_FEATURE] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction,
          message = args.message,
          sender = args.sender,
          bounds,
          feature,
          maxExtent,
          featureExtent,
          item;

        if (!Array.isArray(message.payload)) {
          message.payload = [message.payload];
        }

        for (var i = 0, len = message.payload.length; i < len; i++) {
          // For the first parameter we pass null, findFeature no longer
          // uses the first parameter, so it's ok.
          feature = emp.storage.findFeature(null, message.payload[i].featureId);

          if (!maxExtent) {
            maxExtent = feature.getMapExtent();
          } else {
            featureExtent = feature.getMapExtent();
          }

          if (featureExtent && !featureExtent.isEmpty()) {
            maxExtent.addCoordinate(featureExtent.getNorthEast());
            maxExtent.addCoordinate(featureExtent.getSouthWest());
          }
        }

        bounds = {
            west: maxExtent.getWest(),
            east: maxExtent.getEast(),
            south: maxExtent.getSouth(),
            north: maxExtent.getNorth()
        };

        // if the bounds are a single point, just pass the feature to the
        // transaction and let the map engine do the calculations.
        if (bounds.west === bounds.east &&
          bounds.north === bounds.south) {

          feature = emp.storage.findFeature(null, message.payload[0].featureId);
          item = new emp.typeLibrary.Feature({
            featureId: feature.options.featureId,
            coreId: feature.options.coreId,
            overlayId: feature.options.overlayId,
            parentId: feature.options.parentId,
            data: feature.options.data,
            properties: feature.options.properties,
            format: feature.options.format
          });

        } else {
          item = new emp.typeLibrary.View({
                  bounds: bounds,
                  zoom: message.payload[0].zoom
          });
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.VIEW_SET,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_VIEW_CENTER_FEATURE,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_VIEW_CENTER_FEATURE,
            items: []
        });

        oTransaction.items.push(item);
        oTransaction.queue();
    }
};
