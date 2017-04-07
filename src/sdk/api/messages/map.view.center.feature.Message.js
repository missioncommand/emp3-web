(function() {
  "use strict";

  /**
   * @extends emp3.api.Message
   *
   * Sends the message required to zoom to a feature or features
   *
   * @ignore
   * @class
   * @param {object} message
   * @param {[string]} [message.featureIds]
   * @param {string} [message.featureId]
   * @param {number} [message.range]
   * @param {object} callInfo
   * @param {string} transactionId
   */
  function MapViewCenterFeatureMessage(message, callInfo, transactionId) {
    var range;
    emp3.api.Message.call(this, emp3.api.enums.channel.centerOnFeature, transactionId);

    range = typeof message.range === "number" ? message.range : "auto";

    function _handleMultipleFeatures() {
      var i,
        len = message.featureIds.length,
        multiPayload = [];

      for (i = 0; i < len; i += 1) {
        var payload = {
          featureId: message.featureIds[i],
          zoom: range,
          messageId: transactionId
        };
        multiPayload.push(payload);
      }

      return multiPayload;
    }

    function _handleSingleFeature() {
      return {
        featureId: message.featureId,
        zoom: range,
        messageId: transactionId
      };
    }

    if (message.featureIds) {
      this.payload = _handleMultipleFeatures();
    } else {
      this.payload = _handleSingleFeature();
    }
  }

  // Extend emp3.api.Message
  MapViewCenterFeatureMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.centerOnFeature
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, MapViewCenterFeatureMessage);
}());
