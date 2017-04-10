(function() {
  "use strict";

  /**
   * @extends emp3.api.Message
   *
   * Creates a payload to set the map view to bounds
   *
   * @ignore
   * @class
   * @param {object} message
   * @param {number} message.north
   * @param {number} message.south
   * @param {number} message.east
   * @param {number} message.west
   * @param {number} [message.range]
   * @param {boolean} [message.animate=false]
   * @param {object} callInfo
   * @param {string} transactionId
   */
  function MapViewCenterBoundsMessage(message, callInfo, transactionId) {
    var zoom,
      bounds = {};

    emp3.api.Message.call(this, emp3.api.enums.channel.centerOnBounds, transactionId);

    bounds.northEast = {
      lat: message.north,
      lon: message.east
    };

    bounds.southWest = {
      lat: message.south,
      lon: message.west
    };

    zoom = typeof message.range === "number" ? message.range : "auto";

    this.payload = {
      bounds: bounds,
      zoom: zoom,
      animate: message.animate || false,
      messageId: transactionId
    };
  }

  // Extend emp3.api.Message
  MapViewCenterBoundsMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.centerOnBounds
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, MapViewCenterBoundsMessage);
}());
