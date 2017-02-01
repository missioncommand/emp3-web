/**
 * Handles message sent over the CMAPI2_FREEHAND_START channel and creates
 * the appropriate transaction for the core map.
 *
 * (this channel does not exist in CMAPI 1.3 and is called out as such,
 *  eventually should be moved to a CMAPI 2.0 set of handlers.)
 *
 */
cmapi.channel.handler[cmapi.channel.names.CMAPI2_FREEHAND_START] = {

  /**
   * @param args
   * @param args.message
   * @param {Number} args.message.strokeStyle The style for the lines
   * that will draw in freehand mode.
   * @param {String} args.message.messageId The transaction id used for
   * tracking who sent the message and used to match responses to requests.
   * @param {Object} args.sender
   * @param {string} args.sender.id  The id of the map that sent the message.
   */
  process: function (args) {
      var transaction;
      var message = args.message;
      var sender = args.sender;
      var item;

      // Create a transaction,  There is no type in the
      // typeLibrary that corresponds to CMAPI2_FREEHAND_START, so we just make up
      // the object on the fly and send it to the transactionQueue.
      transaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.FREEHAND_START,
        mapInstanceId: args.mapInstanceId,
        transactionId: message.messageId,
        sender: sender.id,
        originChannel: cmapi.channel.names.CMAPI2_FREEHAND_START,
        source: emp.api.cmapi.SOURCE,
        originalMessage: args.originalMessage,
        messageOriginator: sender.id,
        items: [],
        originalMessageType: cmapi.channel.names.CMAPI2_FREEHAND_START
      });

      item = {
        freehandStrokeStyle: args.message.payload.strokeStyle
      };

      transaction.items.push(item);

      transaction.queue();
  }
};
