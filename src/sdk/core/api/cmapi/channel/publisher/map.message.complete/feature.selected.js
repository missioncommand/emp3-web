// Register a message completion builder for SELECTION_SET
cmapi.map.message.complete.builder[emp.intents.control.SELECTION_SET] = {

    // oTransaction will have a transaction property
    build: function (oTransaction) {
        var oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction);
        var oFeatures = oTransaction.items;
        var oDetails = {
            features: []
        };
        var feature;

        for (var iIndex = 0; iIndex < oFeatures.length; iIndex++)
        {
            if (oFeatures[iIndex].featureId) {
              feature = emp.storage.findObject(oFeatures[iIndex].coreId);

              if (feature) {
                oDetails.features.push({
                  featureId: feature.options.featureId,
                  name: feature.options.name,
                  format: feature.options.format,
                  feature: feature.options.data,
                  properties: feature.options.properties,
                  symbolCode: feature.options.symbolCode
                });
              }
            }
        }

        oMsgCompletion.details = oDetails;

        return oMsgCompletion;
    }
};
