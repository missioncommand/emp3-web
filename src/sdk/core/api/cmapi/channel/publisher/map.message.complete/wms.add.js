// Register a message completion builder for WMS_ADD
cmapi.map.message.complete.builder[emp.intents.control.WMS_ADD] = {
    
    build: function (oTransaction) {
        var oWMS;
        var oDetail;
        var oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction);
        var oWMSs = oTransaction.items;
        var oDetails = {
            features: []
        };

        for (var iIndex = 0; iIndex < oWMSs.length; iIndex++)
        {
            oWMS = oWMSs[iIndex];
            
            switch (oTransaction.originChannel)
            {
                case cmapi.channel.names.MAP_FEATURE_PLOT_URL:
                    oDetail = {
                        overlayId: oWMS.overlayId,
                        featureId: oWMS.id,
                        name: oWMS.name, 
                        format: emp.typeLibrary.featureFormatType.WMS,
                        url: oWMS.url,
                        params: oWMS.params
                    };
            
                    oDetails.features.push(oDetail);
                    break;
            }
        }
        
        oMsgCompletion.details = oDetails;
        
        return oMsgCompletion;
    }
};
