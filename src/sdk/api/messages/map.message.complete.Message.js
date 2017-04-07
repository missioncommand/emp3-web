(function() {
  "use strict";

  /**
   * @extends emp3.api.Message
   *
   * Attempts to complete a transaction before user does.  If the transaction has already been processed, no action
   * occurs.  If the map cannot complete the transaction,  no action occurs.  If the map can complete the transaction
   * the calling function associated with the transaction should handle any complete responses in a callback.
   *
   * @ignore
   * @class
   * @param {object} message
   * @param {emp3.api.Transaction} message.transaction
   * @param {object} callInfo Unused for this message
   * @param {string} transactionId
   */
  function MapMessageCompleteMessage(message, callInfo, transactionId) {
    emp3.api.Message.call(this, emp3.api.enums.channel.transactionComplete, transactionId);

    if (message && message.transaction && message.transaction.id) {
      this.payload = {
        messageId: message.transaction.id
      };
    }
  }

  // Extend emp3.api.Message
  MapMessageCompleteMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.transactionComplete
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, MapMessageCompleteMessage);
}());
