if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

/**
 * Constructs a new emp3.api.Circle object.
 * @class
 * @augments {cmapi.IGeoCircle}
 * @augments {emp3.api.Feature}
 *
 * @classdesc This class implements a Circle feature. It requires a single coordinate that indicates the geographic
 * position of the center of the circle with a radius in meters to determine size
 *
 * @param {Object} [args] Parameters are provided as members of the arg object and may contain any properties listed
 * here or inherited from {@link cmapi.IGeoCircle}.
 * @param {cmapi.IGeoPosition} [args.position] Position of the center of the circle.
 *
 * @example
 * var circle = new emp3.api.Circle({
 *    position: {
 *       latitude: 41,
 *       longitude: -71
 *    },
 *    radius: 31415,
 *    name: "My Circle"
 * });
 *
 * @mixes Feature
 */
emp3.api.Circle = function (args) {
  cmapi.inherit(new cmapi.IGeoCircle(), this);

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

  if (typeof args.radius !== 'number') {
    args.radius = new cmapi.IGeoCircle().radius;
  }

  // provide the positions property inherited from cmapi.IGeoPoint with a default location of 0,0
  this.positions = [new cmapi.IGeoPosition()];

  /**
   * Center of the circle
   * @property {cmapi.IGeoPosition}
   * @name emp3.api.Circle#position
   */
  Object.defineProperty(this, "position", {
    enumerable: true,
    get: function () { return this.positions[0]; },
    set: function (value) { this.positions[0] = value; }
  });

  /**
   * @name emp3.api.Circle#featureType
   * @const
   * @default emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE
   * @type {emp3.api.enums.FeatureTypeEnum}
   */
  Object.defineProperty(this, "featureType", {
    enumerable: true,
    writable: false,
    value: emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE
  });


  this.patchProps(args);

};

// Extend emp3.api.Feature
emp3.api.Circle.prototype = new emp3.api.Feature({
  format: 'geojson',
  data: {
    type: 'Point',
    symbolCode: emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE
  }
});
