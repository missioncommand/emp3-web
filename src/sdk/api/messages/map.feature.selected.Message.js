/**
 * Function packages the payload to be sent over the map.feature.selected.batch cmapi channel.
 * @extends emp3.api.Message
 *
 * @ignore
 * @class
 * @param {object} message
 * @param {emp3.api.Feature | emp3.api.Feature[]} message.features
 * @param {object} callInfo Unused for this message
 * @param {string} transactionId
 */
function MapFeatureSelected(message, callInfo, transactionId) {
  emp3.api.Message.call(this, emp3.api.enums.channel.featureSelectedBatch, transactionId);

  var features = [];

  if (Array.isArray(message.features)) {
    emp.util.each(message.features, function(feature) {
      features.push({
        featureId: feature.geoId
      });
    });
  } else if (message.features instanceof emp3.api.Feature) {
    features = [message.features.geoId];
  }

  this.payload = {
    features: features,
    messageId: transactionId
  };
}

// Extend emp3.api.Message
MapFeatureSelected.prototype = Object.create(emp3.api.Message.prototype);

//======================================================================================================================
var channels = [
  emp3.api.enums.channel.featureSelectedBatch,
  emp3.api.enums.channel.featureSelected
];

// Register with the MessageFactory
emp3.api.MessageFactory.registerMessage(channels, MapFeatureSelected);
