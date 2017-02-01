// Register a message completion builder for FEATURE_HIDE
cmapi.map.message.complete.builder[emp.intents.control.FEATURE_HIDE] = {
    
    // oTransaction will have a transaction property
    build: function (oTransaction) {
        var oFeature;
        var oDetail;
        var oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction);
        var oFeatures = oTransaction.items;
        var payload;
        var oDetails = {
            features: []
        };

        for (var iIndex = 0; iIndex < oFeatures.length; iIndex++)
        {
            oFeature = oFeatures[iIndex];
            payload = oTransaction.message.payload[iIndex];
            oDetail = {
                overlayId: oFeature.overlayId,
                parentId: oFeature.parentId,
                featureId: oFeature.featureId || oFeature.id,
                recurse: payload.recurse
            };
            
            oDetails.features.push(oDetail);
        }
        
        oMsgCompletion.details = oDetails;

        return oMsgCompletion;
    }
};
