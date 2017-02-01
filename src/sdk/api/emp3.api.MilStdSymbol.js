if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

/**
 * Constructs a new emp3.api.MilStdSymbol object.
 *
 * @class
 * @extends {emp3.api.Feature}
 * @extends cmapi.IGeoMilSymbol
 * @classdesc The MilStdSymbol class represents a military symbology map feature.
 * Symbols are based on the MIL-STD-2525Bch2 (USAS)
 * or MIL-STD-2525C specifications. Use {@link emp3.api.Overlay} addFeatures method
 * to add the symbol onto the map that has that overlay assigned to it.
 *
 * @mixes Feature
 *
 * @param {Object} args Parameters are provided as members of the args object and may contain any properties listed
 * here or inherited from {@link cmapi.IGeoMilSymbol}.
 *
 * @param {cmapi.IGeoPosition} [args.position] Position of the MilStdSymbol if it is a single icon.  this will be
 * ignored in the case of a multi position  symbol such as a tactical graphic
 *
 * @return A new emp3.api.MilStdSymbol object
 *
 * @example
 *
 * // Creating a new single point MilStdSymbol with some symbol modifiers.
 *
 * var sym = new emp3.api.MilStdSymbol({
 *     name: "Example Unit",
 *     position: {
 *         latitude: 40,
 *         longitude: 40
 *     },
 *    symbolCode: "SFGPUCI----K---", // Friendly Infantry symbol code from MIL-STD-2525
 *    fillStyle: {
 *         fillColor: { // green - optional, no color is needed, but this can override the default affiliation color
 *            red: 0,
 *            green: 255,
 *            blue: 0,
 *            alpha: 1
 *         }
 *     },
 *     modifiers: {
 *        uniqueDesignation1: '1BCT', // see MIL-STD-2525 for meaning of modifiers
 *        higherFormation: '3ID'
 *    }
 * });
 *
 * @example
 *
 * // Creating a boundary line with some modifiers
 *
 * var sym = new emp3.api.MilStdSymbol({
 *     name: "Example Boundary",
 *     positions:[ {
 *         latitude: 31,
 *         longitude: -97
 *     },
 *     {
 *         latitude: 32,
 *         longitude: -97
 *     },
 *     {
 *         latitude: 32,
 *         longitude: -98
 *     }],
 *    symbolCode: "SFFPGLB----K---"  // Boundary line symbol code from MIL-STD-2525
 *    strokeStyle: {
 *         strokeColor: { // blue - optional no color is needed, but this can override the default affiliation color
 *             red: 0,
 *             green: 0,
 *             blue: 255,
 *             alpha: 1
 *         }
 *     },
 *     modifiers: {
 *        uniqueDesignation1: '1BCT', // see MIL-STD-2525 for meaning of modifiers
 *        higherFormation: '3ID'
 *    }
 * });
 *
 */
emp3.api.MilStdSymbol = function(args) {

  cmapi.inherit(new cmapi.IGeoMilSymbol(), this);


  // Sterilize the inputs
  if (typeof args === 'undefined' || args === null || typeof args !== 'object') {
    args = {
      position: new emp3.api.GeoPosition({
        latitude: 0,
        longitude: 0})
    };
  } else {
    if (typeof args.positions === 'undefined' &&
       (typeof args.position === 'undefined' || args.position === null || typeof args.position !== 'object')) {
      args.position = new emp3.api.GeoPosition({
        latitude: 0,
        longitude: 0
      });
    } else {
      if (args.hasOwnProperty('position')) {
        if (typeof args.position.latitude !== 'number') {
          args.position.latitude = new emp3.api.GeoPosition().latitude;
        }
        if (typeof args.position.longitude !== 'number') {
          args.position.longitude = new emp3.api.GeoPosition().longitude;
        }
        if (typeof args.position.altitude !== 'number') {
          args.position.altitude = new emp3.api.GeoPosition().altitude;
        }
      } else {
        // TODO sterilize positions
      }
    }
  }

  // provide the positions property inherited from cmapi.IGeoPoint with a default location of 0,0
  this.positions = [new cmapi.IGeoPosition()];
  if (args.hasOwnProperty('positions')) {
    this.positions = args.positions;
  }

  /**
   * @name emp3.api.MilStdSymbol#position
   * @type {emp3.api.GeoPosition}
   */
  Object.defineProperty(this, "position", {
    enumerable: true,
    get: function () { return this.positions[0]; },
    set: function (value) { this.positions[0] = value; }
  });

  /**
   * @name emp3.api.MilStdSymbol#featureType
   * @const
   * @default emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL
   * @type {emp3.api.enums.FeatureTypeEnum}
   */
  Object.defineProperty(this, "featureType",{
    enumerable: true,
    writable: false,
    value: emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL
  });

  this.patchProps(args);
};

// Extend emp3.api.Feature
emp3.api.MilStdSymbol.prototype = new emp3.api.Feature({
  format: 'geojson',
  data: {
    type: 'Point'
  }
});
