// Register a message completion builder for WMS_REMOVE
cmapi.map.message.complete.builder[emp.intents.control.WMS_REMOVE] = {
    
    // oTransaction will have a transaction property
    build: function (oTransaction) {
        var oFeature;
        var oDetail;
        var oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction);
        var oFeatures = oTransaction.items;
        var oDetails = {
            features: []
        };

        for (var iIndex = 0; iIndex < oFeatures.length; iIndex++)
        {
            oFeature = oFeatures[iIndex];
            
            oDetail = {
                overlayId: oFeature.overlayId,
                featureId: oFeature.id
            };
            
            oDetails.features.push(oDetail);
        }
        
        oMsgCompletion.details = oDetails;
        
        return oMsgCompletion;
    }
};
