/* global cmapi */

// Register a message completion builder for VIEW_SET
cmapi.map.message.complete.builder[emp.intents.control.VISIBILITY_SET] = {
  // oTransaction will have a transaction property
  build: function (oTransaction) {
    var oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction),
        item,
        i;

    if (oMsgCompletion.failures.length > 0) {
        return oMsgCompletion;
    }
    oMsgCompletion.details = [];
    for (i = 0; i < oTransaction.items.length; i = i + 1) {
      item = oTransaction.items[i];
      oMsgCompletion.details.push({
        // emp.storage.controller.visibility.getState() doesn't need to be called
        // to get the visibilityState because during a setVisibility() operation 
        // the target's instance visibility can never be ANCESTOR_HIDDEN. Only
        // VISIBLE or HIDDEN could occur and these values would be assigned based
        // on the visible value sent in to the setVisibility() operation. Therefore,
        // the transaction item's "visible" property is also the visibility state for
        // the visibility events.
        visibilityState: item.visible ? emp3.api.enums.VisibilityStateEnum.VISIBLE : emp3.api.enums.VisibilityStateEnum.HIDDEN,
        targetAttributes: item.targetAttributes,
        parentTargetAttributes: item.parentTargetAttributes
      });
    }
    return oMsgCompletion;
  }
};