(function() {
  "use strict";

  /**
   * @extends emp3.api.Message
   *
   * Create a payload to set the lookAt
   *
   * @ignore
   * @class
   * @param {object} message
   * @param {emp3.api.LookAt} message.lookAt
   * @param {boolean} [message.animate=false]
   * @param {object} callInfo
   * @param {string} transactionId
   */
  function MapViewLookAtMessage(message, callInfo, transactionId) {
    emp3.api.Message.call(this, emp3.api.enums.channel.lookAtLocation, transactionId);

    this.payload = {
      messageId: transactionId,
      animate: message.animate || false,
      range: message.lookAt.range,
      tilt: message.lookAt.tilt,
      heading: message.lookAt.heading,
      latitude: message.lookAt.latitude,
      longitude: message.lookAt.longitude,
      altitude: message.lookAt.altitude,
      altitudeMode: message.lookAt.altitudeMode
    };
  }

  // Extend emp3.api.Message
  MapViewLookAtMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.lookAtLocation
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, MapViewLookAtMessage);
}());
