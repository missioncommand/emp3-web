/*global emp, cmapi */
// Register a channel handler for MAP_FEATURE_PLOT_URL.
cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_PLOT_URL] = {

  // args will have a message and sender property
    process: function (args) {
        var featureTransaction,
          mapServiceTransaction,
          i,
          len,
          mapServiceItems = [],
          featureItems = [],
          message = args.message,
          sender = args.sender,
          payload,
          //schema,
          item,
          visible,
          layers,
          bUseProxy;


        // get schema for this channel
        // can use for channel specific validation
        // schema = cmapi.channel.schema["map.feature.plot.url"];

        if (!Array.isArray(message.payload)) {
            message.payload = [message.payload];
        }

        len = message.payload.length;
        // plot.url can load kml, geojson, and WMS.
        //
        // We need to handle WMS differently that kml and geojson
        // kml and geoJSON will use the typeLibrary.Feature
        // WMS will use typeLibrary.WMS
        // If the message has an array of payload we will check to see if it is mixed between
        // WMS and others.  This is an edge case, but is valid according to CMAPI
        //
        for (i = 0; i < len; i = i + 1) {
            payload = message.payload[i];
            item = {};
            visible = true;
            layers = [];

            // determine if we need to use the proxy.
            bUseProxy = payload.useProxy;

            if ((payload.overlayId === undefined) || (payload.overlayId === null))
            {
                payload.overlayId = sender.id;
            }

            visible = true;
            if (payload.visible !== undefined && payload.visible === false) {
              visible = false;
            }

            if (!payload.hasOwnProperty('format'))
            {
                payload.format = 'kml';
            }

            switch (payload.format.toLowerCase()) {
            case "wms":

              if (payload.hasOwnProperty("params")) {
                if (payload.params.hasOwnProperty("layers")) {
                  if (!emp.util.isEmptyString(payload.params.layers)) {
                    layers = payload.params.layers.split(",");
                    // We  need to remove the layers parameter.
                    delete payload.params["layers"];
                  } else if (Array.isArray(payload.params.layers)) {
                    layers = payload.params.layers;
                    delete payload.params.layers;
                  }
                }
              }

              item = new emp.typeLibrary.WMS({
                id: payload.featureId,
                overlayId: payload.overlayId,
                visible: visible,
                layers: layers,
                zoom: payload.zoom,
                name: payload.name,
                format: payload.format,
                url: payload.url,
                useProxy: bUseProxy,
                params: payload.params,
                transactionId: message.messageId,
                messageId: payload.messageId,
                intent: emp.intents.control.MAP_SERVICE_ADD
              });
              mapServiceItems.push(item);

              break;
            case "wmts":

              item = new emp.typeLibrary.WMTS({
                id: payload.featureId,
                overlayId: payload.overlayId,
                visible: visible,
                name: payload.name,
                layer: payload.layer,
                format: payload.format,
                url: payload.url,
                useProxy: bUseProxy,
                params: payload.params,
                transactionId: message.messageId,
                messageId: payload.messageId,
                intent: emp.intents.control.MAP_SERVICE_ADD
              });

              mapServiceItems.push(item);
              break;
            case "kmllayer":
              item = new emp.typeLibrary.KmlLayer({
                id: payload.featureId,
                overlayId: payload.overlayId,
                visible: visible,
                name: payload.name,
                kmlData: payload.kmlString,
                format: payload.format,
                url: payload.url,
                useProxy: bUseProxy,
                transactionId: message.messageId,
                messageId: payload.messageId,
                intent: emp.intents.control.MAP_SERVICE_ADD
              });

              mapServiceItems.push(item);
              break;
            case "geojson":
            default:
              item = new emp.typeLibrary.Feature({
                featureId: payload.featureId,
                parentId: payload.parentId,
                overlayId: payload.overlayId,
                visible: visible,
                zoom: payload.zoom,
                name: payload.name,
                format: payload.format,
                url: payload.url,
                params: payload.params,
                properties: payload.properties
              });
              item.validate();
              featureItems.push(item);
              break;
            }
        }
        if (featureItems.length > 0) {
            featureTransaction = new emp.typeLibrary.Transaction({
              intent: emp.intents.control.FEATURE_ADD,
              mapInstanceId: args.mapInstanceId,
              transactionId: message.messageId,
              sender: sender.id,
              originChannel: cmapi.channel.names.MAP_FEATURE_PLOT_URL,
              source: emp.api.cmapi.SOURCE,
              originalMessage: args.originalMessage,
              messageOriginator: sender.id,
              originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT_URL,
              items: featureItems
            });
            featureTransaction.queue();
        }

        if (mapServiceItems.length > 0) {
          mapServiceTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.MAP_SERVICE_ADD,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_FEATURE_PLOT_URL,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT_URL,
            items: mapServiceItems
          });

          mapServiceTransaction.queue();
        }
    }
};
