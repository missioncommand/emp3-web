// Register a message completion builder for DRAW_UPDATE
cmapi.map.message.progress.builder[emp.intents.control.DRAW_UPDATE] = {
    
    build: function (oTransaction) {

        var oFeature = oTransaction.items[0];
        var oMsgProgress = new cmapi.typeLibrary.MessageProgress(oTransaction);
        
        var oDetails = {
            overlayId: oFeature.overlayId,
            parentId: oFeature.parentId,
            featureId: oFeature.featureId,
            name: oFeature.name,
            type: oFeature.type,
            properties: oFeature.properties,
            format: oFeature.format,
            feature: oFeature.data,
            menuId: oFeature.menuId
        };
        
        switch (oFeature.updateEventType)
        {
            case emp.typeLibrary.UpdateEventType.START:
                oDetails.status = "start";
                break;
            case emp.typeLibrary.UpdateEventType.UPDATE:
                oDetails.status = "update";
                oDetails.updates = {
                    type: oFeature.updates.type,
                    indices: oFeature.updates.indices,
                    coordinates: oFeature.updates.coordinates
                };
                break;
            case emp.typeLibrary.UpdateEventType.COMPLETE:
                oDetails.status = "complete";
                oDetails.updates = {
                    type: oFeature.updates.type,
                    indices: oFeature.updates.indices,
                    coordinates: oFeature.updates.coordinates
                };
                break;
            default:
                return;
        }
        
        oMsgProgress.details = oDetails;
        oMsgProgress.messageId = oFeature.transactionId;
        oMsgProgress.originatingChannel = cmapi.channel.names.MAP_FEATURE_DRAW;
        
        return oMsgProgress;
    }
};
