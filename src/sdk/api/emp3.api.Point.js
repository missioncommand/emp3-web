if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}
/**
 * @class
 * @extends {emp3.api.Feature}
 * @implements cmapi.IGeoPoint
 * @classdesc This class implements the Point feature that encapsulates a GeoPoint object.
 *
 * @param {Object} [args] Parameters are provided as members of the args object and may contain any properties listed
 * here or inherited from {@link cmapi.IGeoPoint}.
 * @param {cmapi.IGeoPosition} [args.position] Position of the point
 *
 * @example <caption>A generic point</caption>
 * var point1 = new emp3.api.Point({
 * 	position: {
 *    latitude: 41,
 *    longitude: -71
 *  }
 * });
 *
 * @example <caption>Point using your own icon, and elevated above the earth at 300 meters sea level.</caption>
 *
 * var point2 = new emp3.api.Point({
 * 	position: {
 *    latitude: 57.3,
 *    longitude: 36.8,
 *    altitude: 300
 *  },
 *  altitudeMode: cmapi.enums.ABSOLUTE,
 *  iconURI: 'http://mydomain.com/myicon.png'
 * });
 *
 * @mixes Feature
 */
emp3.api.Point = function (args) {

  cmapi.inherit(new cmapi.IGeoPoint(), this);

  // provide the positions property inherited from cmapi.IGeoPoint with a default location of 0,0
  this.positions = [new cmapi.IGeoPosition()];
  /**
   * The geospatial position representing the location of the point
   * @name emp3.api.Point#position
   * @type {emp3.api.GeoPosition}
   */
  Object.defineProperty(this, "position", {
    enumerable: true,
    get: function () { return this.positions[0]; },
    set: function (value) { this.positions[0] = value; }
  });

  // Sterilize the inputs
  if (typeof args === 'undefined' || args === null || typeof args !== 'object') {
    args = {
      position: new emp3.api.GeoPosition({
        latitude: 0,
        longitude: 0
      })
    };
  } else {

    // verify that position or positions have been set.  If they have not been set, create a default position
    // for them.
    if ((typeof args.position === 'undefined' || args.position === null || typeof args.position !== 'object') &&
      (typeof args.positions === 'undefined' || args.positions === null)) {

      args.position = new emp3.api.GeoPosition({
        latitude: 0,
        longitude: 0
      });
    } else if (args.position) {
      // If the position has been set, verify that lat/lon/alt are all correct
      // type, if not set default values.
      if (typeof args.position.latitude !== 'number') {
        args.position.latitude = new emp3.api.GeoPosition().latitude;
      }
      if (typeof args.position.longitude !== 'number') {
        args.position.longitude = new emp3.api.GeoPosition().longitude;
      }
      if (typeof args.position.altitude !== 'number') {
        args.position.altitude = new emp3.api.GeoPosition().altitude;
      }
    }
  }

  /**
   * @name emp3.api.Point#featureType
   * @const
   * @default emp3.api.enums.FeatureTypeEnum.GEO_POINT
   * @type {emp3.api.enums.FeatureTypeEnum}
   */
  Object.defineProperty(this, "featureType", {
    enumerable: true,
    writable: false,
    value: emp3.api.enums.FeatureTypeEnum.GEO_POINT
  });

  this.patchProps(args);
};

// Extend emp3.api.Feature
emp3.api.Point.prototype = new emp3.api.Feature();
