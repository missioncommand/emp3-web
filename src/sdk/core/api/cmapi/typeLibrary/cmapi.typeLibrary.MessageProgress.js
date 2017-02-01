/**
 * @memberOf cmapi.typeLibrary
 * @class
 * @desc Used to create a message progress.
 */
cmapi.typeLibrary.MessageProgress = function (oTransaction) {

    var publicInterface = {
        messageId: oTransaction.transactionId,
        originatingChannel: oTransaction.originChannel,
        details: {}
    };

    return publicInterface;
};
