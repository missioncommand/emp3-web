(function() {
  "use strict";

  /**
   * @extends emp3.api.Message
   *
   * Attempts to cancel a transaction before it finishes.  If the transaction has already been processed, no action
   * occurs.  If the map cannot cancel it, not action occurs.  If the map can cancel the transaction the calling function
   * associated with the transaction should handle any cancel responses in a callback.
   *
   * @ignore
   * @class
   * @param {object} message
   * @param {emp3.api.Transaction} message.transaction
   * @param {object} callInfo Unused for this message
   * @param {string} transactionId
   */
  function MapMessageCancelMessage(message, callInfo, transactionId) {
    emp3.api.Message.call(this, emp3.api.enums.channel.cancel, transactionId);

    if (message && message.transaction && message.transaction.id) {
      this.payload = {
        messageId: message.transaction.id
      };
    }
  }

  // Extend emp3.api.Message
  MapMessageCancelMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.cancel
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, MapMessageCancelMessage);
}());
