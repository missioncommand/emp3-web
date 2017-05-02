var EMPWorldWind = EMPWorldWind || {};
EMPWorldWind.data = EMPWorldWind.data || {};

/**
 * @classdesc This represents an EMP layer. Any interaction with the WorldWind layer itself will occur here.
 *
 * @class
 * @param {string} overlayName
 */
EMPWorldWind.data.EmpLayer = function(overlayName) {
  /** @type {Object.<string, EMPWorldWind.data.EmpFeature>} */
  this.features = {};

  /** @member {string} */
  this.name = overlayName;

  var _layer = new WorldWind.RenderableLayer(overlayName);
  /**
   * @name EMPWorldWind.data.EmpLayer#layer
   * @type {WorldWind.RenderableLayer}
   */
  Object.defineProperty(this, 'layer', {
    enumerable: true,
    value: _layer
  });

  /**
   * @param {EMPWorldWind.data.EmpFeature} feature
   * @private
   */
  var _featureIsPresent = function(feature) {
    if (feature) {
      return (feature.id || feature.coreId) in this.features;
    }
    return false;

  }.bind(this);


  /**
   * @param {EMPWorldWind.data.EmpFeature} feature
   * @private
   */
  var _getFeature = function(id) {
      return this.features[id];
  }.bind(this);

  /**
   *
   * @param {EMPWorldWind.data.EmpFeature} feature
   */
  this.addFeature = function(feature) {
    if (!_featureIsPresent(feature)) {
      emp.util.each(feature.shapes, function(shape) {
        this.layer.addRenderable(shape);
      }.bind(this));

      this.features[feature.id || feature.coreId] = feature;
    }
  };

  /**
   *
   * @param features
   */
  this.addFeatures = function(features) {
    emp.util.each(features, function(feature) {
      this.addFeature(feature);
    }.bind(this));
  };

  /**
   *
   */
  this.removeFeatures = function(features) {
    emp.util.each(features, function(feature) {
      this.removeFeature(feature);
    }.bind(this));
  };

  /**
   *
   * @param feature
   */
  this.removeFeature = function(feature) {
    if (_featureIsPresent(feature)) {
      var wwFeature = _getFeature(feature.id || feature.coreId);
      emp.util.each(wwFeature.shapes, function(shape) {
        this.layer.removeRenderable(shape);
      }.bind(this));
      delete this.features[wwFeature.id];
    }
  };

  /**
   *
   * @param id
   */
  this.removeFeatureById = function(id) {
    if (id in this.features) {
      this.removeFeature(this.features[id]);
    }
  };
};
