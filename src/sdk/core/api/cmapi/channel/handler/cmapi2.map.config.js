/**
 * Handles message sent over the CMAPI2_MAP_CONFIG channel and creates
 * the appropriate transaction for the core map.
 *
 * (this channel does not exist in CMAPI 1.3 and is called out as such,
 *  eventually should be moved to a CMAPI 2.0 set of handlers.)
 *
 */
cmapi.channel.handler[cmapi.channel.names.CMAPI2_MAP_CONFIG] = {

  /**
   * @param args
   * @param args.message
   * @param {Number} args.message.midDistanceThreshold The altitude at which
   * non-labeled MIL-STD-2525 symbols start displaying labels.
   * @param {Number} args.message.farDistanceThreshold The altitude MIL-STD-2525
   * warfighting symbols stop displaying as dots and start displaying as symbols.
   * @param {emp3.api.enums.IconSizeEnum} args.message.iconSize The size of
   * all single point icons.
   * @param {emp3.api.enums.MilStdLabelSettingEnum} args.message.milStdLabels
   * Which labels should be turned on for MIL-STD-2525 warfighting symbols
   * @param {Object} selectionStyle - what selection should look like when
   * feature have been selected.
   * @param {IGeoStrokeStyle} freehandStrokeStyle - The style of the lines drawn
   * when in freehand mode.
   *
   * @param {Object} args.sender
   * @param {string} args.sender.id  The id of the map that sent the message.
   */
  process: function (args) {
      var configTransaction;
      var labelTransaction;
      var message = args.message;
      var sender = args.sender;
      var labels;
      var labelItem;
      var configItem = {};

      // If the message is not an array, create an array out of it
      // so we can blanket handle all messages sent that way.
      if (!Array.isArray(message.payload)) {
        message.payload = [message.payload];
      }

      // Create a MAP_CONFIG transaction,  There is no type in the
      // typeLibrary that corresponds to MAP_CONFIG, so we just make up
      // the object on the fly and send it to the transactionQueue.
      configTransaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.MAP_CONFIG,
        mapInstanceId: args.mapInstanceId,
        transactionId: message.messageId,
        sender: sender.id,
        originChannel: cmapi.channel.names.CMAPI2_MAP_CONFIG,
        source: emp.api.cmapi.SOURCE,
        originalMessage: args.originalMessage,
        messageOriginator: sender.id,
        items: [],
        originalMessageType: cmapi.channel.names.CMAPI2_MAP_CONFIG
      });

      // Also create a labelTransaction.  EMPv2 had a very different way of
      // handling global config settings.  In order to keep v2 working, parse
      // out all label settings into a separate transaction.  If we don't
      // have a label setting we do not use this transaction.
      labelTransaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.MIL_ICON_LABELS_SET,
        mapInstanceId: args.mapInstanceId,
        transactionId: message.messageId,
        sender: sender.id,
        originChannel: cmapi.channel.names.CMAPI2_MAP_CONFIG,
        source: emp.api.cmapi.SOURCE,
        originalMessage: args.originalMessage,
        messageOriginator: sender.id,
        items: [],
        originalMessageType: cmapi.channel.names.CMAPI2_MAP_CONFIG
      });

      // copy all the properties from the config object and just pass
      // it to the engine.  The engine will know what to do with it.
      // If it is a label transaction, retrieve the labels used for that
      // transaction.  Send over the labels.
      for (var prop in message.payload[0]) {
        if (prop === "milStdLabels") {
          labels = this.getMilStdLabelList(message.payload[0][prop]);
          labelItem = labels;
        } else {
          configItem[prop] = message.payload[0][prop];
        }
      }
      
      //add the label item to the configTransaction for v3
      if (labelItem) {
        labelTransaction.items.push(labelItem);
        configTransaction.items.push(labelItem);
        labelTransaction.queue();
        configTransaction.queue();
      }

      if (configItem) {
        configTransaction.items.push(configItem);
        configTransaction.queue();
      }
  },

  getMilStdLabelList: function (labelOption) {
    var labels = [];

    // Base Labels
    labels.push("V");
    labels.push("L");
    labels.push("S");
    labels.push("AA");
    labels.push("AB");
    labels.push("AC");
    // Common Labels
    if (labelOption === emp3.api.enums.MilStdLabelSettingEnum.COMMON_LABELS) {
      labels.push("H");
      labels.push("M");
      labels.push("T");
      labels.push("T1");
      labels.push("CN");
    }
    // All Labels
    if (labelOption === emp3.api.enums.MilStdLabelSettingEnum.ALL_LABELS) {
      labels.push("H");
      labels.push("M");
      labels.push("T");
      labels.push("T1");
      labels.push("CN");
      labels.push("C");
      labels.push("F");
      labels.push("G");
      labels.push("H1");
      labels.push("H2");
      labels.push("J");
      labels.push("K");
      labels.push("N");
      labels.push("P");
      labels.push("W");
      labels.push("W1");
      labels.push("X");
      labels.push("Y");
      labels.push("Z");
    }

    return labels;
  }
};
