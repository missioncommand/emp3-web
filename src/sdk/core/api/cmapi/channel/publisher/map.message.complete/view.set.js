/* global cmapi */

// Register a message completion builder for VIEW_SET
cmapi.map.message.complete.builder[emp.intents.control.VIEW_SET] = {

    // oTransaction will have a transaction property
    build: function (oTransaction) {
        var oView;
        var oBounds;
        var oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction);

        if (oMsgCompletion.failures.length > 0)
        {
            return oMsgCompletion;
        }

        oView = oTransaction.items[0];

        if (oView.bounds) {
            oBounds = {
                northEast: {
                    lat: oView.bounds.north,
                    lon: oView.bounds.east
                },
                southWest: {
                    lat: oView.bounds.south,
                    lon: oView.bounds.west
                }
            };
            oMsgCompletion.details.bounds = oBounds;
        }

        oMsgCompletion.details.range = oView.range;
        oMsgCompletion.details.center = oView.location;
        oMsgCompletion.details.tilt = oView.tilt;
        oMsgCompletion.details.heading = oView.heading;
        oMsgCompletion.details.roll = oView.roll;
        oMsgCompletion.details.overlayId = oView.overlayId;
        oMsgCompletion.details.parentId = oView.parentId;
        oMsgCompletion.details.featureId = oView.featureId;

        return oMsgCompletion;
    }
};
