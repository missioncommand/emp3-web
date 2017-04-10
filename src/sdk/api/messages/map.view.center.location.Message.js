(function() {
  "use strict";

  /**
   * @extends emp3.api.Message
   *
   * Creates a payload to center the map view on a location
   *
   * @ignore
   * @class
   * @param {object} message
   * @param {emp3.api.Camera} message.camera
   * @param {boolean} [message.animate=false]
   * @param {object} callInfo
   * @param {string} transactionId
   */
  function MapViewCenterLocationMessage(message, callInfo, transactionId) {
    emp3.api.Message.call(this, emp3.api.enums.channel.centerOnLocation, transactionId);

    this.payload = {
      location: {
        lat: message.camera.latitude,
        lon: message.camera.longitude
      },
      zoom: message.camera.altitude,
      altitudeMode: message.camera.altitudeMode,
      heading: message.camera.heading,
      tilt: message.camera.tilt,
      roll: message.camera.roll,
      animate: message.animate || false,
      messageId: transactionId
    };
  }

  // Extend emp3.api.Message
  MapViewCenterLocationMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.centerOnLocation
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, MapViewCenterLocationMessage);
}());
