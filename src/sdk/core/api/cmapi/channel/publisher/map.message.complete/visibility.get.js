/* global cmapi */

// Register a message completion builder for VIEW_GET
cmapi.map.message.complete.builder[emp.intents.control.VISIBILITY_GET] = {

    // oTransaction will have a transaction property
    build: function (oTransaction) {

        var oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction);
        var item;

        if (oMsgCompletion.failures.length > 0)
        {
            return oMsgCompletion;
        }

        item = oTransaction.items[0];

        oMsgCompletion.details = {
          visible: item.visible,
          targetId: item.coreId,
          parentId: item.parentId
        };

        return oMsgCompletion;
    }
};
