var emp = window.emp || {};

/**
 * @classdesc Helper class for performing calculations for basic shapes in the core instead of within map engines.
 * @class
 */
emp.shapeHelper = (function() {

  return {
    /**
     * @param {emp.classLibrary.Feature} feature
     */
    lineString: function(feature) {
      return feature.data.coordinates;
    }
  };
})();
