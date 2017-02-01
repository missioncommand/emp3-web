// Register a message completion builder for OVERLAY_SHOW
cmapi.map.message.complete.builder[emp.intents.control.OVERLAY_SHOW] = {
    
    // oTransaction will have a transaction property
    build: function (oTransaction) {

        var oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction);
        var oOverlay = oTransaction.items[0];
        
        if (oOverlay)
        {
            var oDetails = {
                overlayId: oOverlay.overlayId
            };

            oMsgCompletion.details = oDetails;
        }

        return oMsgCompletion;
    }
};
