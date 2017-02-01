/* global cmapi */

// Register a channel handler for MAP_FEATURE_PLOT
cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_PLOT_BATCH] = {

    // args will have a message and sender property
    process: function (args) {
        var oTransaction;
        var message = args.message,
            sender = args.sender,
            payload = message.payload,
            feature,
            oItem,
            iLength,
            iIndex,
            oItems = [];
        var sOverlayId = payload.overlayId;
        var sParentId = payload.parentId;
        var sFormat = payload.format;
        var bZoom = (payload.zoom === true)? true: false;
        var bReadOnly = (payload.readOnly === true)? true: false;
        var sMenuId = payload.menuId;


        oTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.FEATURE_ADD,
            mapInstanceId: args.mapInstanceId,
            transactionId: payload.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_FEATURE_PLOT_BATCH,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT_BATCH,
            items: oItems
        });

        for (iIndex = 0, iLength = payload.features.length;
                iIndex < iLength; iIndex++) {
            feature = payload.features[iIndex];

            if (emp.helpers.isEmptyString(feature.overlayId))
            {
                if (sOverlayId)
                {
                    feature.overlayId = sOverlayId;
                }
                else
                {
                    feature.overlayId = sender.id;
                }
            }

            if (emp.helpers.isEmptyString(feature.parentId))
            {
                if (sParentId)
                {
                    feature.parentId = sParentId;
                }
            }

            if (emp.helpers.isEmptyString(feature.format))
            {
                if (sFormat)
                {
                    feature.format = sFormat;
                }
            }

            if ((feature.zoom === undefined) || (feature.zoom === null))
            {
                feature.zoom = bZoom;
            }

            if ((feature.readOnly === undefined) || (feature.readOnly === null))
            {
                feature.readOnly = bReadOnly;
            }

            if (emp.helpers.isEmptyString(feature.menuId))
            {
                if (sMenuId)
                {
                    feature.menuId = sMenuId;
                }
            }

            oItem = new emp.typeLibrary.Feature({
                overlayId: feature.overlayId,
                parentId: feature.parentId,
                featureId: feature.featureId,
                name: feature.name,
                format: feature.format,
                data: feature.feature,
                zoom: feature.zoom,
                readOnly: feature.readOnly,
                menuId: feature.menuId,
                properties: feature.properties,
                visible: feature.visible
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
                cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_PLOT].mergeGeoJSONStyles(oItem);
            }

            oItem.validate();
            oItems.push(oItem);
        }

        oTransaction.queue();
    }
};
