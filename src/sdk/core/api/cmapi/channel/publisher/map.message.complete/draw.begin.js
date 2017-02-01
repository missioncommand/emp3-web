/* global cmapi, emp */

// Register a message completion builder for DRAW_BEGIN
cmapi.map.message.complete.builder[emp.intents.control.DRAW_BEGIN] = {

    // oTransaction will have a transaction property
    build: function (oTransaction) {
        var oDetail;
        var oFeature;
        var sFormat;
        var oDraw = oTransaction.items[0];
        var oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction);

        if (oTransaction.failures.length > 0)
        {
            if (oTransaction.failures[0].level === emp.typeLibrary.Error.level.INFO)
            {
                // Its being cancelled.
                oMsgCompletion.status = cmapi.typeLibrary.msgComplete.status.CANCELLED;
            }
        }

        if (oDraw)
        {
            oFeature = oDraw.plotFeature;

            if (oFeature)
            {
                oDetail = {
                    overlayId: oFeature.overlayId,
                    parentId: oFeature.parentId,
                    featureId: oFeature.featureId,
                    type: oDraw.type,
                    name: oFeature.name,
                    format: oFeature.format,
                    feature: oFeature.data,
                    properties: oFeature.properties,
                    menuId: oFeature.menuId,
                    coordinates: ((oDraw.updates && oDraw.updates.coordinates)? oDraw.updates.coordinates: [])
                };
            }
            else
            {
                sFormat = '';

                switch (oDraw.type.toLowerCase())
                {
                    case 'point':
                    case 'line':
                    case 'polygon':
                        sFormat = emp.typeLibrary.featureFormatType.GEOJSON;
                        break;
                    case 'milstd':
                        sFormat = emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL;
                        break;
                    case 'airspace':
                        sFormat = emp3.api.enums.FeatureTypeEnum.GEO_ACM;
                        break;
                }
                oDetail = {
                    overlayId: oDraw.overlayId,
                    parentId: oDraw.parentId,
                    featureId: oDraw.featureId,
                    type: oDraw.type,
                    format: sFormat,
                    name: oDraw.name,
                    properties: oDraw.properties,
                    coordinates: ((oDraw.updates && oDraw.updates.coordinates)? oDraw.updates.coordinates: [])
                };
            }
            oMsgCompletion.details = oDetail;
        }
        return oMsgCompletion;
    }
};
