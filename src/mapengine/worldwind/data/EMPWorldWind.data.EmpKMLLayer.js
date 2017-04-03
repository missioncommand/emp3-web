var EMPWorldWind = EMPWorldWind || {};
EMPWorldWind.data = EMPWorldWind.data || {};

/**
 * @classdesc This represents an EMP layer. Any interaction with the WorldWind layer itself will occur here.
 *
 * @class
 * @param {emp.typeLibrary.KmlLayer} kml
 */
EMPWorldWind.data.EmpKMLLayer = function(kml) {
  this.id = kml.coreId;

  var _kml = kml;

  /**
   * @name EMPWorldWind.data.EmpWMSLayer#kml
   * @type {emp.typeLibrary.KmlLayer}
   */
  Object.defineProperty(this, 'kml', {
    enumerable: true,
    value: _kml
  });

  // Set the URL to the service
  if (kml.useProxy) {
    this.url = emp3.api.global.configuration.urlProxy + "?url=" + kml.url;
  } else {
    this.url = kml.url;
  }

  var _kmlLayer = new WorldWind.KmlFile(this.url);
  /**
   * @name EMPWorldWind.data.EmpWMS#layer
   * @type {WorldWind.KmlFile}
   */
  Object.defineProperty(this, 'layer', {
    enumerable: true,
    value: _kmlLayer
  });
};
