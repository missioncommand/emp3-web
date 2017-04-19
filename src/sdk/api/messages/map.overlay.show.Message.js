(function() {
  "use strict";

  /**
   * @extends emp3.api.Message
   *
   * @ignore
   * @class
   * @param {object} message
   * @param {string[]} message.overlays overlay Ids
   * @param {string} [message.parent]
   * @param {boolean} [message.recurse]
   * @param {object} callInfo Unused for this message
   * @param {string} transactionId
   */
  function MapOverlayShowMessage(message, callInfo, transactionId) {
    emp3.api.Message.call(this, emp3.api.enums.channel.showOverlay, transactionId);

    this.payload = [];
    emp.util.each(message.overlays, function(overlay) {
      this.payload.push({
        overlayId: overlay, //TODO investigate if overlay or overlayId is required
        parentId: message.parent || emp.constant.parentIds.ALL_PARENTS,
        recurse: message.recurse || false,
        messageId: transactionId
      });
    }.bind(this));
  }

  // Extend emp3.api.Message
  MapOverlayShowMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.showOverlay
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, MapOverlayShowMessage);
}());
