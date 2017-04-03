(function() {
  "use strict";

  /**
   * @extends emp3.api.Message
   *
   * @ignore
   * @class
   * @param {object} message
   * @param {emp3.api.Overlay[]} message.overlays
   * @param {string} message.parentId
   * @param {object} callInfo Unused for this message
   * @param {string} transactionId
   */
  function MapOverlayRemoveMessage(message, callInfo, transactionId) {
    emp3.api.Message.call(this, emp3.api.enums.channel.removeOverlay, transactionId);

    this.payload = [];
    emp.util.each(message.overlays, function(overlay) {
      this.payload.push({
        overlayId: overlay.geoId,
        parentId: message.parentId,
        messageId: transactionId
      });
    }.bind(this));
  }

  // Extend emp3.api.Message
  MapOverlayRemoveMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.removeOverlay
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, MapOverlayRemoveMessage);
}());
