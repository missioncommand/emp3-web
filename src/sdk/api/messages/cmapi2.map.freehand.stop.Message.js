(function() {
  "use strict";

  /**
   * @ignore
   * @classdesc Stops freehand draw over the cmapi2.map.freehandDraw.stop channel.
   * @extends emp3.api.Message
   *
   * @class
   * @param {object} message Unused for this message.
   * @param {object} callInfo Unused for this message
   * @param {string} transactionId
   */
  function FreehandStopMessage(message, callInfo, transactionId) {
    emp3.api.Message.call(this, emp3.api.enums.channel.freehandDrawExit, transactionId);

    // this is a very simple message.  It just indicates to map to start
    // drawing.  Only parameter is stroke style.
    this.payload = {
      messageId: transactionId
    };
  }

  // Extend emp3.api.Message
  FreehandStopMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.freehandDrawExit
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, FreehandStopMessage);
}());
