// Register a message completion builder for GET
cmapi.map.message.complete.builder[emp.intents.control.GET] = {
    
    // oTransaction will have a transaction property
    build: function (oTransaction) {

        var oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction);

        if (oTransaction.items && (oTransaction.items.length > 0))
        {
            // Latter we may want to clean up whats returned.
            oMsgCompletion.details.successes = {
                feature: oTransaction.items[0].feature,
                overlay: oTransaction.items[0].overlay
            };
        }
        
        return oMsgCompletion;
    }
};
