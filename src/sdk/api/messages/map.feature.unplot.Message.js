/**
 * @classdesc Sends the Features over the map.feature.plot channel..
 * @extends emp3.api.Message
 *
 * @see emp3.api.ResponseBroker.plotFeatureTransactionComplete
 *
 * @ignore
 * @class
 * @param {object} message
 * @param {emp3.api.Feature[]} message.features
 * @param {object} callInfo Unused for this message
 * @param {string} transactionId
 */
function MapFeatureUnplotMessage(message, callInfo, transactionId) {

  var i,
    featureCount = 0,
    payload,
    features = [];

  message = message || {};

  if (message.features) {
    featureCount = message.features.length;
  }

  emp3.api.Message.call(this, emp3.api.enums.channel.unplotFeatureBatch, transactionId);

  for (i = 0; i < featureCount; i += 1) {
    payload = {
      featureId: message.features[i].geoId
    };

    if (message.overlayId) {
      payload.overlayId = message.overlayId;
    }

    if (message.overlayId !== undefined) {
      payload.overlayId = message.overlayId;
    }
    else if (message.parentId) {
      payload.parentId = message.parentId;
    }

    features.push(payload);
  }

  this.payload = {
    features: features,
    messageId: transactionId
  };

}

// Extend emp3.api.Message
MapFeatureUnplotMessage.prototype = Object.create(emp3.api.Message.prototype);

//======================================================================================================================
var channels = [
  emp3.api.enums.channel.unplotFeatureBatch,
  emp3.api.enums.channel.unplotFeature
];

// Register with the MessageFactory
emp3.api.MessageFactory.registerMessage(channels, MapFeatureUnplotMessage);
