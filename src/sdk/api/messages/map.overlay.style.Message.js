(function() {
  "use strict";

  /**
   * @extends emp3.api.Message
   *
   * @ignore
   * @class
   * @param {object} message
   * @param {object} callInfo Unused for this message
   * @param {string} transactionId
   */
  function MapOverlayStyleMessage(message, callInfo, transactionId) {
    var tmpPayload = {
      properties: {}
    };

    var _setFillColorFromStyle = function(style, properties) {
      try {
        properties.fillColor = style.mark.fill.color;
      } catch (err) {
        // Do nothing
      }
    };

    var _setLinePropertiesFromStyle = function(style, properties) {
      try {
        properties.lineColor = style.mark.stroke.color;
        properties.lineWidth = style.mark.stroke.width;
      } catch (err) {
        // Do nothing
      }
    };

    var _setIconUrlFromStyle = function(style, properties) {
      try {
        properties.iconUrl = style.mark.wellKnownName;
      } catch (err) {
        // Do nothing
      }
    };

    var _setGraphicHeightFromStyle = function(style, properties) {
      try {
        properties.graphicHeight = style.mark.graphicHeight;
      } catch (err) {
        // Do nothing
      }
    };

    var _setGraphicWidthFromStyle = function(style, properties) {
      try {
        properties.graphicWidth = style.mark.graphicWidth;
      } catch (err) {
        // Do nothing
      }
    };

    var convertStyleToProperties = function(style) {
      var properties = {};

      _setFillColorFromStyle(style, properties);
      _setLinePropertiesFromStyle(style, properties);
      _setIconUrlFromStyle(style, properties);
      _setGraphicWidthFromStyle(style, properties);
      _setGraphicHeightFromStyle(style, properties);

      return properties;
    };

    var styleGenerators = {
      "styleMultiPoints": function() {
        tmpPayload.properties = convertStyleToProperties(message.multiPointStyle);
        tmpPayload.type = "multigeometry";
        tmpPayload.messageId = transactionId;
        tmpPayload.overlayId = message.overlayId;

        return tmpPayload;
      },
      "stylePolygons": function() {
        tmpPayload.properties = convertStyleToProperties(message.polygonStyle);
        tmpPayload.type = "polygon";
        tmpPayload.messageId = transactionId;
        tmpPayload.overlayId = message.overlayId;

        return tmpPayload;
      },
      "styleLines": function() {
        tmpPayload.properties = convertStyleToProperties(message.lineStyle);
        tmpPayload.type = "line";
        tmpPayload.messageId = transactionId;
        tmpPayload.overlayId = message.overlayId;

        return tmpPayload;
      },
      "stylePoints": function() {
        tmpPayload.properties = convertStyleToProperties(message.pointStyle);
        tmpPayload.type = "point";
        tmpPayload.messageId = transactionId;
        tmpPayload.overlayId = message.overlayId;

        return tmpPayload;
      },
      "styleOverlay": function() {
        var tmpPayload = [],
          multiPointStyle = {},
          pointStyle = {},
          lineStyle = {},
          polygonStyle = {};

        multiPointStyle.properties = convertStyleToProperties(message.multiPointStyle);
        multiPointStyle.type = "multigeometry";

        pointStyle.properties = convertStyleToProperties(message.pointStyle);
        pointStyle.type = "point";

        lineStyle.properties = convertStyleToProperties(message.lineStyle);
        lineStyle.type = "line";

        polygonStyle.properties = convertStyleToProperties(message.polygonStyle);
        polygonStyle.type = "polygon";

        multiPointStyle.overlayId = message.overlayId;
        pointStyle.overlayId = message.overlayId;
        lineStyle.overlayId = message.overlayId;
        polygonStyle.overlayId = message.overlayId;

        pointStyle.messageId = transactionId;
        lineStyle.messageId = transactionId;
        polygonStyle.messageId = transactionId;
        multiPointStyle.messageId = transactionId;

        tmpPayload.push(pointStyle);
        tmpPayload.push(lineStyle);
        tmpPayload.push(polygonStyle);
        tmpPayload.push(multiPointStyle);

        return tmpPayload;
      }
    };

    emp3.api.Message.call(this, emp3.api.enums.channel.styleOverlay, transactionId);

    if (callInfo.method in styleGenerators) {
      this.payload = styleGenerators[callInfo.method]();
    } else {
      // TODO alert failure
    }
  }

  // Extend emp3.api.Message
  MapOverlayStyleMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.styleOverlay
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, MapOverlayStyleMessage);
}());
