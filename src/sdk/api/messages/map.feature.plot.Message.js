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
function MapFeaturePlotMessage(message, callInfo, transactionId) {
  message = message || {};
  var payload, multiPayload = [], i, length,
    convertedFeature, feature,
    featureCount;

  if (message.features) {
    featureCount = message.features.length;
  } else if (message.feature) {
    featureCount = 1;
    message.features = [message.feature];
  }

  // This message dynamically determines its channel based on the given features
  if (featureCount > 1) {
    emp3.api.Message.call(this, emp3.api.enums.channel.plotFeatureBatch, transactionId);
  } else {
    emp3.api.Message.call(this, emp3.api.enums.channel.plotFeature, transactionId);
  }

  // create the channel payload for each of the features.
  for (i = 0; i < featureCount; i++ ) {
    feature = message.features[i];
    switch (feature.featureType) {
      case emp3.api.enums.FeatureTypeEnum.KML:
        convertedFeature = emp3.api.convertFeatureToKML(feature);
        break;
      default:
        convertedFeature = emp3.api.convertFeatureToGeoJSON(feature);
        break;
    }

    payload = {
      overlayId: message.overlayId,
      featureId: feature.geoId,
      visible: message.visible,
      parentId: message.parentId,
      format: feature.featureType,
      feature: convertedFeature,
      name: feature.name,
      readOnly: feature.readOnly,
      properties:emp3.api.getProperties(feature)
    };
    payload.properties.modifiers = payload.properties.modifiers || {};
    payload.properties.modifiers.standard = feature.symbolStandard;
    multiPayload.push(payload);
  }

  // If the length of the payload is greater than 500, then
  // break up the messages into smaller payloads as to prevent messages
  // that are too large and break the Ozone framework.
  length = multiPayload.length;
  if (length > 1) {
    this.payload = {
      messageId: transactionId,
      features: multiPayload
    };
  } else {
    this.payload = multiPayload[0];
    this.payload.messageId = transactionId;
  }
}

// Extend emp3.api.Message
MapFeaturePlotMessage.prototype = Object.create(emp3.api.Message.prototype);

//======================================================================================================================
var channels = [
  emp3.api.enums.channel.plotFeature,
  emp3.api.enums.channel.plotFeatureBatch
];

// Register with the MessageFactory
emp3.api.MessageFactory.registerMessage(channels, MapFeaturePlotMessage);
