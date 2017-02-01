/**
 * @classdesc Sends the Features over the map.feature.plot.url channel.
 * @extends emp3.api.Message
 *
 * @ignore
 * @class
 * @param {object} message
 * @param {emp3.api.MapService} message.mapService
 * @param {object} callInfo Unused for this message
 * @param {string} transactionId
 */
function MapFeaturePlotUrlMessage(message, callInfo, transactionId) {
  emp3.api.Message.call(this, emp3.api.enums.channel.plotUrl, transactionId);

  var payload;
  payload = {
    format: message.mapService.format,
    featureId: message.mapService.geoId,
    overlayId: emp.constant.parentIds.MAP_LAYER_PARENT,
    name: message.mapService.name,
    description: message.mapService.description,
    messageId: transactionId,
    url: message.mapService.url,
    useProxy: message.mapService.useProxy
  };

  // Based on the format, the service may have different
  // params.
  switch (message.mapService.format) {
      case 'wms':
        payload.params = {
          layers: message.mapService.layers,
          format: message.mapService.tileFormat,
          version: message.mapService.version
        };
        break;
      case 'wmts':
        payload.params = {
          layer: message.mapService.layer,
          format: message.mapService.tileFormat,
          version: message.mapService.version,
          style: message.mapService.style,
          sampleDimensions: message.mapService.sampleDimensions
        };
        break;
      case 'kmlLayer':
        payload.kmlString = message.mapService.kmlString;
        break;
  }

  this.payload = payload;
}

// Extend emp3.api.Message
MapFeaturePlotUrlMessage.prototype = Object.create(emp3.api.Message.prototype);

//======================================================================================================================
var channels = [
  emp3.api.enums.channel.plotUrl
];

// Register with the MessageFactory
emp3.api.MessageFactory.registerMessage(channels, MapFeaturePlotUrlMessage);
