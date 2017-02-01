/**
 * @memberOf cmapi.typeLibrary
 * @class
 * @desc Used to create a message completion.
 */
cmapi.typeLibrary.MessageComplete = function (oTransaction) {

    var publicInterface = {
        messageId: oTransaction.transactionId,
        status: cmapi.typeLibrary.msgComplete.status.SUCCESS,
        originatingChannel: oTransaction.originChannel,
        details: {},
        failures: []
    };
    
    if (oTransaction.failures.length > 0)
    {
        if (oTransaction.items.length > 0)
        {
            publicInterface.status = cmapi.typeLibrary.msgComplete.status.MIXED;
        }
        else
        {
            publicInterface.status = cmapi.typeLibrary.msgComplete.status.FAILURE;
        }
    }

    var oFailure;
    var oFailRec;
    
    for (var iIndex = 0; iIndex < oTransaction.failures.length; iIndex++)
    {
        oFailure = oTransaction.failures[iIndex];
        
        oFailRec = {
            payload: {},
            message: ""
        };
        
        if (iIndex === 0)
        {
            oFailRec.payload = oTransaction.originalMessage;
        }

        oFailRec.message = oFailure.message;

        publicInterface.failures.push(oFailRec);
    }

    return publicInterface;
};
