/**
 * @extends emp3.api.Message
 *
 * @ignore
 * @class
 * @param {object} message
 * @param {emp3.api.Overlay} message.overlay
 * @param {object} callInfo Unused for this message
 * @param {string} transactionId
 */
function MapOverlayUpdateMessage(message, callInfo, transactionId) {
  emp3.api.Message.call(this, emp3.api.enums.channel.updateOverlay, transactionId);

  this.payload = {
    overlayId: message.overlay.geoId,
    name: message.overlay.name,
    properties: message.overlay.properties,
    messageId: transactionId
  };
}

// Extend emp3.api.Message
MapOverlayUpdateMessage.prototype = Object.create(emp3.api.Message.prototype);

//======================================================================================================================
var channels = [
  emp3.api.enums.channel.updateOverlay
];

// Register with the MessageFactory
emp3.api.MessageFactory.registerMessage(channels, MapOverlayUpdateMessage);
