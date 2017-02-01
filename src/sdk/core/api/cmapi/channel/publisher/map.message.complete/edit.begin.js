/* global cmapi, emp */

// Register a message completion builder for EDIT_BEGIN
cmapi.map.message.complete.builder[emp.intents.control.EDIT_BEGIN] = {
    
    // oTransaction will have a transaction property
    build: function (oTransaction) {

        var oFeature;
        var oDetail;
        var oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction);

        if (oTransaction.failures.length > 0)
        {
            if (oTransaction.failures[0].level === emp.typeLibrary.Error.level.INFO)
            {
                // Its being cancelled.
                oMsgCompletion.status = cmapi.typeLibrary.msgComplete.status.CANCELLED;
                oFeature = oTransaction.items[0].originFeature;
            }
        }
        else
        {
            oFeature = oTransaction.items[0].updatedFeature;
        }
        
        if (oFeature)
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
            
            oMsgCompletion.details = oDetail;
        }
        return oMsgCompletion;
    }
};
