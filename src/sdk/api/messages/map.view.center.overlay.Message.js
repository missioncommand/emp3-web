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
   * @param {string} message.overlayId
   * @param {number} [message.range]
   * @param {object} callInfo
   * @param {string} transactionId
   */
  function MapViewCenterOverlayMessage(message, callInfo, transactionId) {
    var zoom;

    emp3.api.Message.call(this, emp3.api.enums.channel.centerOnOverlay, transactionId);

    zoom = typeof message.range === "number" ? message.range : "auto";

    this.payload = {
      overlayId: message.overlayId,
      zoom: zoom,
      messageId: transactionId
    };
  }

  // Extend emp3.api.Message
  MapViewCenterOverlayMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.centerOnOverlay
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, MapViewCenterOverlayMessage);
}());
