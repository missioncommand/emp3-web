(function() {
  "use strict";

  /**
   * @extends emp3.api.Message
   *
   * @ignore
   * @class
   * @param {object} message
   * @param {object} callInfo
   * @param {string} transactionId
   */
  function MapFeatureDrawMessage(message, callInfo, transactionId) {
    emp3.api.Message.call(this, emp3.api.enums.channel.draw, transactionId);

    message = message || {};
    if (!message.feature) {
      throw new Error('Missing argument: feature');
    }

    this.feature = message.feature;

    var properties = emp3.api.getProperties(this.feature);
    // TODO: this is wrong for CMAPI 1.3.  We need to revisit this.
    var coordinates = emp3.api.convertCMAPIPositionsToGeoJson(this.feature.positions, this.feature.featureType);

    this.payload = {
      featureId: this.feature.geoId,
      name: this.feature.name,
      type: this.feature.featureType,
      symbolCode: this.feature.symbolCode,
      properties: properties,
      coordinates: coordinates,
      messageId: transactionId
    };

    this.mapId = callInfo.mapId;
  }
  
  // Extend emp3.api.Message
  MapFeatureDrawMessage.prototype = Object.create(emp3.api.Message.prototype);

  /**
   * @inheritDoc
   */
  MapFeatureDrawMessage.prototype.transaction = function() {
    return new emp3.api.Transaction({
      id: this.transactionId,
      geoId: this.feature.geoId,
      mapId: this.mapId
    });
  };

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(emp3.api.enums.channel.draw, MapFeatureDrawMessage);

}());
