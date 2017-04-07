(function() {
  "use strict";

  /**
   * @extends emp3.api.Message
   *
   * Sends the message required to swap a map engine.
   *
   * @ignore
   * @class
   * @param {object} message
   * @param {number} [message.altitude]
   * @param {object} callInfo
   * @param {string} transactionId
   */
  function MapViewZoomMessage(message, callInfo, transactionId) {
    var range;

    emp3.api.Message.call(this, emp3.api.enums.channel.zoom, transactionId);

    range = typeof message.altitude === "number" ? message.altitude : undefined;

    this.payload = {
      range: range,
      messageId: transactionId
    };
  }

  // Extend emp3.api.Message
  MapViewZoomMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.zoom
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, MapViewZoomMessage);
}());
