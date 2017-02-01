/**
 * @classdesc Sends the Features over the map.feature.update channel..
 * @extends emp3.api.Message
 *
 * @ignore
 * @class
 * @param {object} message
 * @param {emp3.api.Feature[]} message.features
 * @param {string} message.oldOverlayId
 * @param {string} message.newOverlayId
 * @param {string} message.oldParentId
 * @param {string} message.newParentId
 * @param {object} callInfo Unused for this message
 * @param {string} transactionId
 */
function MapFeatureUpdateMessage(message, callInfo, transactionId) {
  emp3.api.Message.call(this, emp3.api.enums.channel.updateFeature, transactionId);

  switch (callInfo.method) {
    case "Feature.move":
      this.payload = {
        featureId: message.features[0].geoId,
        overlayId: message.oldOverlayId,
        newOverlayId: message.newOverlayId,
        parentId: message.oldParentId,
        newParentId: message.newParentId,
        messageId: transactionId
      };
      break;
    default:
      this.payload = {
        features: Array.isArray(message.features) ? message.features : [],
        messageId: transactionId
      };
  }
}

// Extend emp3.api.Message
MapFeatureUpdateMessage.prototype = Object.create(emp3.api.Message.prototype);

//======================================================================================================================
var channels = [
  emp3.api.enums.channel.updateFeature
];

// Register with the MessageFactory
emp3.api.MessageFactory.registerMessage(channels, MapFeatureUpdateMessage);
