// Register a message completion builder for FEATURE_UPDATE
cmapi.map.message.complete.builder[emp.intents.control.FEATURE_UPDATE] = {
    
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
            oFeature = emp.storage.get.id({id: oFeatures[iIndex].coreId});
            
            if (oFeature.url !== undefined)
            {
                oDetail = {
                    overlayId: oFeature.overlayId,
                    parentId: oFeature.parentId,
                    featureId: oFeature.featureId,
                    name: oFeature.name, 
                    format: oFeature.format,
                    feature: oFeature.data, 
                    properties: oFeature.properties, 
                    menuId: oFeature.menuId
                };
            }
            else
            {
                oDetail = {
                    overlayId: oFeature.overlayId,
                    parentId: oFeature.parentId,
                    featureId: oFeature.featureId,
                    name: oFeature.name, 
                    format: oFeature.format,
                    url: oFeature.url,
                    params: oFeature.params
                };
            }
            
            oDetails.features.push(oDetail);
        }
        
        oMsgCompletion.details = oDetails;
        
        return oMsgCompletion;
    }
};
