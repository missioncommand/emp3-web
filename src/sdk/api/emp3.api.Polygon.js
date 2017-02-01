if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}
/**
 * @class
 * @extends {emp3.api.Feature}
 * @augments cmapi.IGeoPolygon
 * @classdesc This class implements a polygon. It requires 3 or more geographic coordinates.
 *
 * @param {Object} [args] Parameters are provided as members of the arg object and may contain any properties listed
 * here or inherited from {@link cmapi.IGeoPolygon}.
 *
 * @example
 * var polygon = new emp3.api.Polygon({
 *   positions: [{
 *      latitude: 41,
 *      longitude: -71,
 *      altitude: 500
 *   },{
 *      latitude: 42,
 *      longitude: -69.9,
 *      altitude: 500
 *   },{
 *      latitude: 39.2,
 *      longitude: -70.3,
 *      altitude: 500
 *   }]
 * });
 *
 * @mixes Feature
 */
emp3.api.Polygon = function (args) {
  cmapi.inherit(new cmapi.IGeoPolygon(), this);

  // Sterilize the inputs
  if (!(typeof args === 'undefined' || args === null || typeof args !== 'object')) {
    if (typeof args.positions === 'undefined' || args.positions === null || !Array.isArray(args.positions)) {
      args.positions = [];
    } else {
      //TODO determine how strictly fail
      var badArgFound = false;
      for (var idx = 0; idx < args.positions.length; idx++) {
        if (typeof args.positions[idx].latitude !== 'undefined' && typeof args.positions[idx].latitude !== 'number') {
          badArgFound = true;
          break;
        }
        if (typeof args.positions[idx].longitude !== 'undefined' && typeof args.positions[idx].longitude !== 'number') {
          badArgFound = true;
          break;
        }
        if (typeof args.positions[idx].altitude !== 'undefined' && typeof args.positions[idx].altitude !== 'number') {
          badArgFound = true;
          break;
        }
      }
      if (badArgFound) {
        args.positions = [];
      }
    }
  } else {
    args = {
      positions: []
    };
  }

  /**
   * @name emp3.api.Polygon#featureType
   * @const
   * @default emp3.api.enums.FeatureTypeEnum.GEO_POLYGON
   * @type {emp3.api.enums.FeatureTypeEnum}
   */
  Object.defineProperty(this, "featureType",{
    enumerable: true,
    writable: false,
    value: emp3.api.enums.FeatureTypeEnum.GEO_POLYGON
  });

  this.patchProps(args);
};

// Extend emp3.api.Feature
emp3.api.Polygon.prototype = new emp3.api.Feature({
  format: 'geojson',
  data: {
    type: 'Polygon'
  }
});
