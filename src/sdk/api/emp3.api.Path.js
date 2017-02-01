if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}
/**
 * @class
 * @extends {emp3.api.Feature}
 * @extends {cmapi.IGeoPath}
 * @classdesc This class implements the Path (Multi segment line) feature. It accepts a list of coordinates where each
 * adjacent pair of coordinates identifies a line segment.
 *
 * @param {Object} [args] Parameters are provided as members of the arg object and may contain any properties listed
 * here or inherited from {@link cmapi.IGeoPositionGroup}.
 *
 * @mixes Feature
 *
 * @example
 * var path = new emp3.api.Path({
 *   name: 'A path',
 *   geoId: 'testPath',
 *   positions: [
 *     {latitude: 23.62, longitude: 12.232},
 *     {latitude: 24.62, longitude: 12.255},
 *     {latitude: 23.92, longitude: 13.132},
 *     {latitude: 24.41, longitude: 13.103}
 *   ]
 * });
 */
emp3.api.Path = function (args) {
  cmapi.inherit(new cmapi.IGeoPath(), this);

  if (typeof args === 'undefined' || args === null || typeof args !== 'object') {
    args = {
      positions: [],
      timeStamp: new Date(),
      timeSpans: []
    };
  } else {
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

    if (typeof args.timeStamp !== 'string') {
      args.timeStamp = new Date();
    }

    if (typeof args.timeSpans === 'undefined' || typeof args.timeSpans !== 'object' || !Array.isArray(args.timeSpans)) {
      args.timeSpans = [];
    }
  }

  /**
   * @name emp3.api.Path#featureType
   * @const
   * @default emp3.api.enums.FeatureTypeEnum.GEO_PATH
   * @type {emp3.api.enums.FeatureTypeEnum}
   */
  Object.defineProperty(this, "featureType",{
    enumerable: true,
    writable: false,
    value: emp3.api.enums.FeatureTypeEnum.GEO_PATH
  });

  this.patchProps(args);
};

// Extend emp3.api.Feature
emp3.api.Path.prototype = new emp3.api.Feature({
  format: 'geojson',
  data: {
    type: 'LineString'
  }
});
