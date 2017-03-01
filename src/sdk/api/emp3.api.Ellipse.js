if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

/**
 * Constructs a new emp3.api.Ellipse feature.
 * @class
 * @augments {emp3.api.Feature}
 * @augments {cmapi.IGeoEllipse}
 * @classdesc This class implements an ellipse feature. It requires a single coordinate that indicates the geographic
 * position of the center of the ellipse.
 *
 * @param {Object} [args] Parameters are provided as members of the arg object and may contain any properties listed
 * here or inherited from {@link cmapi.IGeoEllipse}.
 * @param {cmapi.IGeoPosition} [args.position]
 *
 * @example
 * var ellipse = new emp3.api.Ellipse({
 *    position: {
 *       latitude: 41,
 *       longitude: -71
 *    },
 *    semiMajor: 25,
 *    semiMinor: 33
 * });
 *
 * @mixes Feature
 */
emp3.api.Ellipse = function (args) {
  cmapi.inherit(new cmapi.IGeoEllipse(args), this);

  // provide the positions property inherited from cmapi.IGeoPoint with a default location of 0,0
  this.positions = [new cmapi.IGeoPosition()];
  /**
   * The geospatial position representing the center of the ellipse
   * @name emp3.api.Ellipse#position
   * @type {emp3.api.GeoPosition}
   */
  Object.defineProperty(this, "position",{
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

  if (typeof args.semiMajor !== 'number') {
    args.semiMajor = new cmapi.IGeoEllipse().semiMajor;
  }
  if (typeof args.semiMinor !== 'number') {
    args.semiMinor = new cmapi.IGeoEllipse().semiMinor;
  }

  /**
   * @name emp3.api.Ellipse#featureType
   * @const
   * @default emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE
   * @type {emp3.api.enums.FeatureTypeEnum}
   */
  Object.defineProperty(this, "featureType",{
    enumerable: true,
    writable: false,
    value: emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE
  });

  this.patchProps(args);
};

// Extend emp3.api.Feature
emp3.api.Ellipse.prototype = new emp3.api.Feature({
  format: 'geojson',
  data: {
    type: 'Point'
  }
});
