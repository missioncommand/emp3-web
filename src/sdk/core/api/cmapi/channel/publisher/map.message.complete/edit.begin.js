/* global cmapi, emp */

// Register a message completion builder for EDIT_BEGIN
cmapi.map.message.complete.builder[emp.intents.control.EDIT_BEGIN] = {

    // transaction will have a transaction property
    build: function (transaction) {

        var feature;
        var detail;
        var messageComplete = new cmapi.typeLibrary.MessageComplete(transaction);

        if (transaction.failures.length > 0)
        {
            if (transaction.failures[0].level === emp.typeLibrary.Error.level.INFO)
            {
                // Its being cancelled.
                messageComplete.status = cmapi.typeLibrary.msgComplete.status.CANCELLED;
                feature = transaction.items[0].originFeature;
            }
        }
        else
        {
            feature = transaction.items[0].updatedFeature;
        }

        if (feature)
        {
            detail = {
                overlayId: feature.overlayId,
                parentId: feature.parentId,
                featureId: feature.featureId,
                name: feature.name,
                format: feature.format,
                feature: feature.data,
                properties: feature.properties,
                menuId: feature.menuId
            };

            messageComplete.details = detail;
        }
        return messageComplete;
    }
};
