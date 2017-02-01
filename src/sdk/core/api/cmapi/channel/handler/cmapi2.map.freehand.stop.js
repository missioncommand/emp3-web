/**
 * Handles message sent over the CMAPI2_FREEHAND_STOP channel and creates
 * the appropriate transaction for the core map.
 *
 * (this channel does not exist in CMAPI 1.3 and is called out as such,
 *  eventually should be moved to a CMAPI 2.0 set of handlers.)
 *
 */
cmapi.channel.handler[cmapi.channel.names.CMAPI2_FREEHAND_STOP] = {

  /**
   * @param args
   * @param args.message
   * @param {String} args.message.messageId The transaction id used for
   * tracking who sent the message and used to match responses to requests.
   * @param {Object} args.sender
   * @param {string} args.sender.id  The id of the map that sent the message.
   */
  process: function (args) {
      var transaction;
      var message = args.message;
      var sender = args.sender;

      // Create a transaction,  There is no items for CMAPI2_FREEHAND_STOP, so
      // we just queue this transaction.
      transaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.FREEHAND_STOP,
        mapInstanceId: args.mapInstanceId,
        transactionId: message.messageId,
        sender: sender.id,
        originChannel: cmapi.channel.names.CMAPI2_FREEHAND_STOP,
        source: emp.api.cmapi.SOURCE,
        originalMessage: args.originalMessage,
        messageOriginator: sender.id,
        items: [{}], // need at least one item or it doesn't get processed by intents.
        originalMessageType: cmapi.channel.names.CMAPI2_FREEHAND_STOP
      });

      transaction.queue();
  }
};
