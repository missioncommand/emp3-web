if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

/**
 * The constructor arguments are mutually exclusive. If an object is set, type will be ignored.
 * @class
 * @augments {emp3.api.Feature}
 * @augments {cmapi.IGeoAirControlMeasure}
 *
 * @classdesc This class Implements an air control measure or airspace.
 *
 * @param {Object} [args] Parameters are provided as members of the arg object and may contain any properties listed
 * here or inherited from {@link cmapi.IGeoAirControlMeasure}.
 *
 * @example
 * var acm = new emp3.api.AirControlMeasure({
 *   acmType: cmapi.enums.acmType.TRACK,
 *   name: "acm_track",
 *   fillStyle: {
 *     fillColor: {
 *       red: 255,
 *       green: 0,
 *       blue: 0,
 *       alpha: 1
 *     }
 *   },
 *   positions: [
 *     {latitude: 0, longitude: -30},
 *     {latitude: 30, longitude: -30},
 *     {latitude: 30, longitude: 0}
 *   ],
 *   attributes: [{
 *     minAlt: 1000,
 *     maxAlt: 50000,
 *     leftWidth: 5000,
 *     rightWidth: 98000
 *   }, {
 *     minAlt: 10000,
 *     maxAlt: 50000,
 *     leftWidth: 15000,
 *     rightWidth: 8000
 *   }]
 * });
 *
 * overlay.addFeature({
 *   feature: acm,
 *   onSuccess: function () {
 *     window.console.log('ACM added');
 *   }
 * });
 *
 * @mixes Feature
 */
emp3.api.AirControlMeasure = function (args) {

  args = args || {};

  cmapi.inherit(new cmapi.IGeoAirControlMeasure(), this);

  /**
   * @private
   */
  var _acmType = cmapi.enums.acmType.CYLINDER;

  /**
   * @property {string}
   * @name emp3.api.AirControlMeasure#acmType
   */
  Object.defineProperty(this, "acmType", {
    enumerable: true,
    get: function () {
      return _acmType;
    },
    set: function (value) {
      _acmType = value;
    }
  });

  /**
   * Holder for the attributes
   * @private
   */
  var _attributes = [{
    minAlt: 10000,
    maxAlt: 20000,
    radius: 5000
  }];

  /**
   * Array of attributes. Associated attributes will vary depending on the acmType
   * @property {Object[]}
   * @name emp3.api.AirControlMeasure#attributes
   */
  Object.defineProperty(this, "attributes", {
    enumerable: true,
    get: function () {
      return _attributes;
    },
    set: function (value) {

      if (!emp3.api.isArray(_attributes)) {
        throw new Error("Type Error: attributes is not an array of emp3.api.enums.IGeoAirControlMeasure.Attribute");
      }
      _attributes = value;
    }
  });

  if (!args.positions) {
    args.positions = [{
      latitude: 0,
      longitude: 0
    }];
  }

  /**
   * Feature Type for AirControlMeasures
   * @name emp3.api.AirControlMeasure#featureType
   * @const
   * @default emp3.api.enums.FeatureTypeEnum.GEO_ACM
   * @type {emp3.api.enums.FeatureTypeEnum}
   */
  Object.defineProperty(this, "featureType", {
    enumerable: true,
    writable: false,
    value: emp3.api.enums.FeatureTypeEnum.GEO_ACM
  });

  this.patchProps(args);
};

// Extend emp3.api.Feature
emp3.api.AirControlMeasure.prototype = new emp3.api.Feature({
  format: 'geojson',
  data: {
    type: 'Point'
  }
});
