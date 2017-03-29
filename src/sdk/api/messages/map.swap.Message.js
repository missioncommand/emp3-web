/**
 * @extends emp3.api.Message
 *
 * Sends the message required to swap a map engine.
 *
 * @ignore
 * @class
 * @param {object} message
 * @param {object} message.engine
 * @param {object} callInfo
 * @param {string} callInfo.mapId The geoId of the map to be swapped
 * @param {string} transactionId
 */
function MapSwapMessage(message, callInfo, transactionId) {
  emp3.api.Message.call(this, emp3.api.enums.channel.swap, transactionId);

  this.payload = {
    mapId: callInfo.mapId,
    engine: message.engine,
    messageId: transactionId
  };
}

// Extend emp3.api.Message
MapSwapMessage.prototype = Object.create(emp3.api.Message.prototype);

//======================================================================================================================
var channels = [
  emp3.api.enums.channel.swap
];

// Register with the MessageFactory
emp3.api.MessageFactory.registerMessage(channels, MapSwapMessage);
