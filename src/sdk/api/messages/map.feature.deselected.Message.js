/**
 * Function packages the payload to be sent over the map.feature.deselected.batch cmapi channel.
 * @extends emp3.api.Message
 *
 * @ignore
 * @class
 * @param {object} message
 * @param {emp3.api.Feature[]} [message.features]
 * @param {string} [message.mapId]
 * @param {CallInfo} callInfo
 * @param {string} transactionId
 */
function MapFeatureDeselected(message, callInfo, transactionId) {
  emp3.api.Message.call(this, emp3.api.enums.channel.featureDeselectedBatch, transactionId);

  var toDeselect,
    features = [];

  if (callInfo.method === "Map.clearSelected") {
    toDeselect = emp3.api.MessageHandler.getInstance().getSelected(message.mapId);
  } else {
    toDeselect = message.features;
  }

  emp.util.each(toDeselect, function(feature) {
    features.push({featureId: feature.geoId});
  });

  this.payload = {
    features: features,
    messageId: transactionId
  };
}

// Extend emp3.api.Message
MapFeatureDeselected.prototype = Object.create(emp3.api.Message.prototype);

//======================================================================================================================
var channels = [
  emp3.api.enums.channel.featureDeselectedBatch,
  emp3.api.enums.channel.featureDeselected
];

// Register with the MessageFactory
emp3.api.MessageFactory.registerMessage(channels, MapFeatureDeselected);
