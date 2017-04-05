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

  /** @type {emp.typeLibrary.KmlLayer} */
  this.kml = kml;

  /**
   * @param {emp.typeLibrary.KmlLayer} kml
   * @private
   */
  function _buildURL(kml) {
    // Set the URL to the service
    if (kml.useProxy) {
      return emp3.api.global.configuration.urlProxy + "?url=" + kml.url;
    }
    return kml.url;
  }

  /** @type {string} */
  this.url = _buildURL(kml);

  /**
   * @type {WorldWind.KmlFile}
   */
  this.layer = new WorldWind.RenderableLayer(this.id);
};
