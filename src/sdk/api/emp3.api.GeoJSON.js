if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}
/**
 * @class
 * @extends {emp3.api.Feature}
 * @constructor
 * @classdesc This class implements a GeoJSON feature. It requires a valid GeoJSON data structure.
 *
 * @param {Object} [args] Parameters are provided as members of the arg object and may contain any properties listed
 * here.
 * @param {Object} [args.GeoJSONData] Object containing a valid GeoJSON data structure.
 *
 * @example
 * var GeoJSONFeature = new emp3.api.GeoJSON({
    GeoJSONData: {
      "type": "FeatureCollection",
      "features": [
        { "type": "Feature",
           "geometry": {
             "type": "Polygon",
             "coordinates": [[[99.0, 0.0], [45.0, 0.0], [44.0, 1.0], [67.0, 1.0], [50.0, 0.0]]]
           },
           "properties": {
             "first": "firstValue",
             "second": "secondValue"
           }
        }
        { "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [54.0, 0.75]},
          "properties": {"first": "firstValue",}
        },
        { "type": "Feature",
          "geometry": {
            "type": "LineString",
            "coordinates": [[34.0, 0.0], [32.0, 1.0], [35.0, 0.0], [36.0, 1.0]]
          },
          "properties": {
            "first": "firstValue",
            "second": "secondValue"
          }
        },
      ]
    } 
*});
*/
emp3.api.GeoJSON = function (args) {
  args = args || {};
  emp3.api.Feature.call(this, args);

  var _GeoJSONData = args.GeoJSONData;
  /**
   * @name emp3.api.GeoJSON#GeoJSONData
   * @type {string}
   */
  Object.defineProperty(this, "GeoJSONData", {
    enumerable: true,
    get: function () {
      return _GeoJSONData;
    },
    set: function (value) {
      _GeoJSONData = value;
    }
  });

  /**
   * @const
   * @type {emp3.api.enums.FeatureTypeEnum}
   * @default emp3.api.enums.FeatureTypeEnum.GEOJSON
   */
  this.featureType = emp3.api.enums.FeatureTypeEnum.GEOJSON;
};

// Extend emp3.api.Feature
emp3.api.GeoJSON.prototype = Object.create(emp3.api.Feature.prototype);