(function() {
  "use strict";

  /**
   * @classdesc Starts freehand drawing over the cmapi2.map.freehandDraw.start channel.
   * @extends emp3.api.Message
   *
   * @memberof emp3.api.messages
   *
   * @ignore
   * @class
   * @param {object} message
   * @param {IGeoStrokeStyle} message.strokeStyle
   * @param {object} callInfo Unused for this message
   * @param {string} transactionId
   */
  function FreehandStartMessage(message, callInfo, transactionId) {
    message = message || {};

    emp3.api.Message.call(this, emp3.api.enums.channel.freehandDrawStart, transactionId);

    // this is a very simple message.  It just indicates to map to start
    // drawing.  Only parameter is stroke style.
    this.payload = {
      messageId: transactionId,
      strokeStyle: message.strokeStyle
    };
  }

  // Extend emp3.api.Message
  FreehandStartMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.freehandDrawStart
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, FreehandStartMessage);
}());