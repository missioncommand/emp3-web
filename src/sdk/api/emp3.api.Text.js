if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}
/**
 * Constructs a new emp3.api.Text object. The name of the object is the text that will appear
 *
 * @class
 * @extends {emp3.api.Feature}
 * @extends cmapi.IGeoText
 * @classdesc This class positions text on the map at a specific coordinate. The name of the object is the text that
 * will appear. To update the text update the name and use the apply method.
 *
 * @param {Object} [args] Parameters are provided as members of the arg object and may contain any properties listed
 * here or inherited from {@link cmapi.IGeoText}.
 * @param {cmapi.GeoPosition} [args.position] Position of the text.
 *
 * @example
 * var text = new emp3.api.Text({
 *   name:"George Washington Bridge",
 *   location: {
 *     latitude: 40.8517,
 *     longitude: -73.9527
 *   }
 * });
 *
 * @mixes Feature
 */
emp3.api.Text = function (args) {
  cmapi.inherit(new cmapi.IGeoText(), this);

  var _fontSize = '';
  /**
   * @name emp3.api.Text#fontSize
   * @type {number}
   */
  Object.defineProperty(this,"fontSize",{
    enumerable: true,
    get: function() { return _fontSize; },
    set: function(value) { _fontSize = value; }
  });
  
  var _fontFamily = '';
  /**
   * @name emp3.api.Text#fontFamily
   * @type {string}
   */
  Object.defineProperty(this,"fontFamily",{
    enumerable: true,
    get: function() { return _fontFamily; },
    set: function(value) { _fontFamily = value; }
  });
  
  var _typeFaceStyle = '';
  /**
   * @name emp3.api.Text#typeFaceStyle
   * @type {string}
   */
  Object.defineProperty(this,"typeFaceStyle",{
    enumerable: true,
    get: function() { return _typeFaceStyle; },
    set: function(value) { _typeFaceStyle = value; }
  });

  // provide the positions property inherited from cmapi.IGeoPoint with a default location of 0,0
  this.positions = [new cmapi.IGeoPosition()];
  /**
   * @name emp3.api.Text#position
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

  if (typeof args.text !== 'string') {
    args.text = '';
  }


  /**
   * @const
   * @type {emp3.api.enums.FeatureTypeEnum}
   * @default emp3.api.enums.FeatureTypeEnum.GEO_TEXT
   * @name emp3.api.Text#featureType
   */
  Object.defineProperty(this, "featureType",{
    enumerable: true,
    writable: false,
    value: emp3.api.enums.FeatureTypeEnum.GEO_TEXT
  });

  this.patchProps(args);
};

// Extend emp3.api.Feature
emp3.api.Text.prototype = new emp3.api.Feature({
  format: 'geojson',
  data: {
    type: 'Point'
  }
});
