var EMPWorldWind = EMPWorldWind || {};
EMPWorldWind.data = EMPWorldWind.data || {};

/**
 * @classdesc Container class for establishing mappings between empFeatures and the WorldWind representations.
 * A Feature may consist of any number of WorldWind Surface shapes. Any direct interaction with the WorldWind features
 * will occur in this class.
 *
 * @class
 * @param {emp.typeLibrary.Feature} feature
 */
EMPWorldWind.data.EmpFeature = function (feature){
  /**
   * The storage of all the shapes composing the primary shape
   * @type {WorldWind.SurfaceShape[]}
   */
  this.shapes = [];

  /**
   * The native EMP Feature
   * @type {emp.typeLibrary.Feature}
   */
  this.feature = feature;

  var _id = feature.coreId;
  /**
   * @readonly
   * @name EMPWorldWind.data.EmpFeature#id
   */
  Object.defineProperty(this, 'id', {
    enumerable: true,
    value: _id
  });

  var _altitudeMode = WorldWind.CLAMP_TO_GROUND;
  /**
   * @name EMPWorldWind.data.EmpFeature#altitudeMode
   */
  Object.defineProperty(this, 'altitudeMode', {
    enumerable: true,
    get: function() { return _altitudeMode; },
    set: function(altMode) {
      var shapesCount = this.shapesCount();
      for (var i = 0; i < shapesCount; i++) {
        this.shapes[i].altitudeMode = altMode;
      }
      _altitudeMode = altMode;
    }
  });

  var _selected = false;
  /**
   * @name EMPWorldWind.data.EmpFeature#selected
   */
  Object.defineProperty(this, 'selected', {
    enumerable: true,
    get: function() { return _selected},
    set: function(value) {
      var shapesCount = this.shapesCount();
      for (var i = 0; i < shapesCount; i++) {
        this.shapes[i].highlighted = value;
      }
      _selected = value;
    }
  })
};

EMPWorldWind.data.EmpFeature.prototype.shapesCount = function() {
  return this.shapes.length;
};

/**
 *
 * @param {WorldWind.SurfaceShape|WorldWind.SurfaceShape[]} primitives
 */
EMPWorldWind.data.EmpFeature.prototype.addShapes = function(primitives) {
  if (!Array.isArray(primitives)) {
    primitives.userProperties.id = this.id;
    this.shapes.push(primitives);
  } else {
    emp.util.each(primitives, function(primitive) {
      primitive.userProperties.id = this.id;
      this.shapes.push(primitive);
    }.bind(this));
  }
};

/**
 * Clears all primitives from the feature. It does not remove them from any layers they are rendered on so that must be
 * done first.
 */
EMPWorldWind.data.EmpFeature.prototype.clearShapes = function() {
  this.shapes = [];
};

/**
 *
 * @param {boolean} visible
 */
EMPWorldWind.data.EmpFeature.prototype.setVisible = function(visible) {
  emp.util.each(this.shapes, function(shape) {
    shape.enabled = visible;
  });
};