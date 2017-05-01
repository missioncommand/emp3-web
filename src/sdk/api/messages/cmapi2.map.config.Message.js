(function() {
  "use strict";
  
  /**
   * @classdesc Sets map configuration settings over the cmapi2.map.config.
   * @extends emp3.api.Message
   *
   * @memberof emp3.api.messages
   * @ignore
   * @class
   * @param {object} message
   * @param {object} callInfo
   * @param {string} transactionId
   */
  function ConfigMessage(message, callInfo, transactionId) {
    message = message || {};

    emp3.api.Message.call(this, emp3.api.enums.channel.config, transactionId);

    var payload = {};


    switch (callInfo.method) {
      case "Map.setMidDistanceThreshold":
        payload.midDistanceThreshold = message.midDistanceThreshold;
        break;
      case "Map.setFarDistanceThreshold":
        payload.farDistanceThreshold = message.farDistanceThreshold;
        break;
      case "Map.setIconSize":
        payload.iconSize = message.iconSize;
        break;
      case "Map.setMilStdLabels":
        payload.milStdLabels = message.milStdLabels;
        break;
      case "Map.setSelectionStyle":
        payload.selectionScale = message.scale;
        payload.selectionColor = message.color;
        break;
      case "Map.setFreehandStyle":
        payload.freehandStrokeStyle = message.freehandStrokeStyle;
        break;
      case "Map.setBackgroundBrightness":
        payload.brightness = message.brightness;
        break;
      case "Map.setGridType":
        payload.gridType = message.gridType;
        break;
    }

    payload.messageId = transactionId;

    this.payload = payload;
  }

  // Extend emp3.api.Message
  ConfigMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.config
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, ConfigMessage);
}());