if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}
/**
 * @class
 * @extends {emp3.api.Feature}
 * @augments cmapi.IGeoRectangle
 * @classdesc This class implements the EMP rectangle feature. It accepts one (1) geographic coordinate that places
 * the center of the rectangle. The rectangle's width and height are centered at the coordinate.
 *
 * @param {Object} [args] Parameters are provided as members of the arg object and may contain any properties listed
 * here or inherited from {@link cmapi.IGeoRectangle}.
 * @param {cmapi.IGeoPosition} [args.position] Position of the center of the rectangle.
 *
 * @example
 * var rectangle = new emp3.api.Rectangle({
 *    position: {
 *      latitude: 40,
 *      longitude: 31
 *    },
 *    height: 100,
 *    width: 40
 * });
 *
 * @mixes Feature
 */
emp3.api.Rectangle = function (args) {
  cmapi.inherit(new cmapi.IGeoRectangle(), this);

  // provide the positions property inherited from cmapi.IGeoPoint with a default location of 0,0
  this.positions = [new cmapi.IGeoPosition()];
  /**
   * The geospatial position representing the center of the rectangle
   * @name emp3.api.Rectangle#position
   * @type {emp3.api.GeoPosition}
   */
  Object.defineProperty(this,"position",{
    enumerable: true,
    get: function() { return this.positions[0]; },
    set: function(value) { this.positions[0] = value; }
  });

  // Sterilize the inputs
  args = args || {};
  // Sterilize the inputs
  // If args.position is null or not an object, make it the
  // default position.  This is so args.position doesn't overwrite this.positions.
  if (args.position !== undefined && (args.position === null || typeof args.position !== 'object')) {
     args.position = new cmapi.IGeoPosition();
  // If args.position is defined, and it is an object, check each value of the object
  // to make sure it is valid.  If it isn't defined, that's ok, it's already set.
  } else if (args.position !== undefined && typeof args.position === 'object') {

      if (typeof args.position.latitude !== 'number') {
        args.position.latitude = new cmapi.IGeoPosition().latitude;
      }
      if (typeof args.position.longitude !== 'number') {
        args.position.longitude = new cmapi.IGeoPosition().longitude;
      }
      if (typeof args.position.altitude !== 'number') {
        args.position.altitude = new cmapi.IGeoPosition().altitude;
      }
  }

  if (typeof args.height !== 'number') {
    args.height = new cmapi.IGeoRectangle().height;
  }
  if (typeof args.width !== 'number') {
    args.width = new cmapi.IGeoRectangle().width;
  }


  /**
   * @name emp3.api.Rectangle#featureType
   * @const
   * @default emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE
   * @type {emp3.api.enums.FeatureTypeEnum}
   */
  Object.defineProperty(this, "featureType",{
    enumerable: true,
    writable: false,
    value: emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE
  });

  this.patchProps(args);
};

// Extend emp3.api.Feature
emp3.api.Rectangle.prototype = new emp3.api.Feature({
  format: 'geojson',
  data: {
    type: 'Point',
    symbolCode: emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE
  }
});
