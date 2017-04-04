/* global cmapi */

// Register a channel handler for MAP_FEATURE_PLOT
cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_PLOT] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction;
        var message = args.message,
            sender = args.sender,
            payload,
            oItem,
            iLength,
            iIndex,
            oItems = [];


        // get schema for this channel
        // can use for channel specific validation
        //schema = cmapi.channel.schema[cmapi.channel.names.MAP_FEATURE_PLOT];

        if (!Array.isArray(message.payload)) {
            message.payload = [message.payload];
        }

        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.FEATURE_ADD,
            mapInstanceId: args.mapInstanceId,
            transactionId: message.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
            items: oItems
        });

        for (iIndex = 0, iLength = message.payload.length;
                iIndex < iLength; iIndex++) {
            payload = message.payload[iIndex];

            if ((payload.overlayId === undefined) || (payload.overlayId === null))
            {
                payload.overlayId = sender.id;
            }

            oItem = new emp.typeLibrary.Feature({
                overlayId: payload.overlayId,
                parentId: payload.parentId,
                featureId: payload.featureId,
                name: payload.name,
                format: payload.format,
                data: payload.feature,
                zoom: payload.zoom,
                readOnly: payload.readOnly,
                menuId: payload.menuId,
                properties: payload.properties,
                visible: payload.visible
            });

            if (oItem.format === emp.typeLibrary.featureFormatType.GEOJSON ||
              oItem.format === emp3.api.enums.FeatureTypeEnum.GEO_POINT ||
              oItem.format === emp3.api.enums.FeatureTypeEnum.GEO_POLYGON ||
              oItem.format === emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE ||
              oItem.format === emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE ||
              oItem.format === emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE ||
              oItem.format === emp3.api.enums.FeatureTypeEnum.GEO_SQUARE ||
              oItem.format === emp3.api.enums.FeatureTypeEnum.GEO_TEXT)
            {
                this.mergeGeoJSONStyles(oItem);
            }

            oItem.validate();
            oItems.push(oItem);
        }

        oTransaction.queue();
    },

    mergeGeoJSONStyles: function(oFeature) {

      // remove symbolCode if it has one.  This prevents issues where
      // engine chokes up if it checks for a symbolCode on any symbolCode
      // and doesn't know what to do with it.
      oFeature.symbolCode = undefined;
      oFeature.data.symbolCode = undefined;

      if (oFeature.hasOwnProperty('properties')) {
        if (oFeature.properties.hasOwnProperty('iconUrl')) {
          //It has an icon url defined.
          return;
        }
      } else {
        oFeature.properties = {};
      }

      if (!oFeature.hasOwnProperty('data')) {
        return;
      }

      var geojson = oFeature.data;
      if (typeof oFeature.data === "string") {
        try {
          geojson = JSON.parse(oFeature.data);
        } catch (oError) {
          // Its not geojson data.
          return;
        }
      }
      // The type must be feature.
      if (!geojson.hasOwnProperty('type')) {
        return;
      }

      if (geojson.type.toLowerCase() !== 'feature') {
        return;
      }

      // The feature must have a properties attribute.
      if (!geojson.hasOwnProperty('properties')) {
        return;
      }

      // See if the properties has a style attribute.
      if (!geojson.properties.hasOwnProperty('style')) {
        return;
      }

      // See if the style has a iconStyle attribute.
      if (!geojson.properties.style.hasOwnProperty('iconStyle')) {
        return;
      }

      // See if the iconStyle has a url attribute.
      if (!geojson.properties.style.iconStyle.hasOwnProperty('url')) {
        return;
      }

      oFeature.properties.iconUrl = geojson.properties.style.iconStyle.url;
    }

};
