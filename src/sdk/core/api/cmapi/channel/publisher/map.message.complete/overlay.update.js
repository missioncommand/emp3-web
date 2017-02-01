// Register a message completion builder for OVERLAY_UPDATE
cmapi.map.message.complete.builder[emp.intents.control.OVERLAY_UPDATE] = {
    
    // oTransaction will have a transaction property
    build: function (oTransaction) {

        var oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction);
        var oOverlay = oTransaction.items[0];
        
        if (oOverlay)
        {
            var oDetails = {
                name: oOverlay.name,
                overlayId: oOverlay.overlayId,
                parentId: oOverlay.parentId,
                properties: oOverlay.properties,
                menuId: oOverlay.menuId
            };

            oMsgCompletion.details = oDetails;
        }

        return oMsgCompletion;
    }
};
