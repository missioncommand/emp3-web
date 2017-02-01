
/* global cmapi */

// Register a channel publisher for map.status.selected
cmapi.channel.publisher[cmapi.channel.names.MAP_STATUS_SELECTED] = {

    // args will have a transaction property
    process: function(transaction) {
        try {

            var feature;
            var selection;
            var selectedFeatures = [];
            var payload;
            var selectedList = emp.storage.selection.getSelectedList(transaction.mapInstanceId); // Get list of selected features from storage engine.

            for (var iIndex = 0; iIndex < selectedList.length; iIndex++) {
                selection = selectedList[iIndex];
                feature = emp.storage.findObject(selection.coreId);

                if (feature) {
                  selectedFeatures.push({
                    name: feature.options.name,
                    featureId: feature.options.featureId,
                    feature: feature.options.data,
                    format: feature.options.format,
                    properties: feature.options.properties
                  });
                }
            }

            payload = {
              messageId: transaction.items[0].transactionId,
              selectedFeatures: selectedFeatures
            };

            emp.environment.get().pubSub.publish({
                message: payload,
                sender: {
                  id: transaction.mapInstanceId
                },
                channel: cmapi.channel.names.MAP_STATUS_SELECTED
            });
        } catch (e) {
            emp.typeLibrary.Error({
              message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_FEATURE_CLICKED + " failed due to an error.",
              jsError: e
            });
        }
    }
};
