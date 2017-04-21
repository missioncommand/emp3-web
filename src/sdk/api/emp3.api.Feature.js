if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

/**
 * @interface
 * @augments {emp3.api.Container}
 * @augments {cmapi.IGeoRenderable}
 *
 * @classdesc This class represents the root class for all inherited feature classes in EMP3
 *
 * Implemented by:
 * - {@link emp3.api.AirControlMeasure}
 * - {@link emp3.api.Circle}
 * - {@link emp3.api.Ellipse}
 * - {@link emp3.api.MilStdSymbol}
 * - {@link emp3.api.Path}
 * - {@link emp3.api.Point}
 * - {@link emp3.api.Polygon}
 * - {@link emp3.api.Rectangle}
 * - {@link emp3.api.Square}
 * - {@link emp3.api.Text}
 */
emp3.api.Feature = function (args) {
  var _featureType = null;
  cmapi.inherit(new cmapi.IGeoRenderable(), this);

  // Make sure that there is an args object.
  args = args || {};

  // The geoJSON type of the feature.  This is always "Feature".  The type must be specified
  // so that these objects are valid geoJSON.
  this.type = "Feature";

  this.data = args.data;

  this.properties = args.properties || {};

  this.readOnly = args.readOnly;

  // Validate position coordinates
  if (args.position) {
    if (typeof args.position.latitude === 'number' &&
      (args.position.latitude > 90.0 || args.position.latitude < -90.0)) {
      throw new Error('Invalid latitude: latitude must be between 90.0 and -90.0');
    }

    if (typeof args.position.longitude === 'number' &&
      (args.position.longitude > 180.0 || args.position.longitude < -180.0)) {
      throw new Error('Invalid longitude: longitude must be between 180.0 and -180.0');
    }
  } else if (args.positions) {
    var coords = args.positions.length;
    for (var idx = 0; idx < coords; idx++) {
      if (args.positions[idx].latitude > 90.0 || args.positions[idx].latitude < -90.0) {
        throw new Error('Invalid latitude: latitude must be between 90.0 and -90.0');
      }

      if (args.positions[idx].longitude > 180.0 || args.positions[idx].longitude < -180.0) {
        throw new Error('Invalid longitude: longitude must be between 180.0 and -180.0');
      }
    }
  }

  /**
   * The type of feature this represents.
   * @name emp3.api.Feature#featureType
   * @type {emp3.api.enums.FeatureTypeEnum}
   */
  Object.defineProperty(this, "featureType", {
    enumerable: true,
    get: function () {
      return _featureType;
    },
    set: function (value) {
      _featureType = value;
    }
  });

  this.patchProps(args);
};

emp3.api.Feature.prototype = new emp3.api.Container();

// =====================================================================================================================
// Function Callbacks ==================================================================================================

/**
 * This callback is invoked after any successful addFeature or addFeatures call
 * @callback emp3.api.Feature~addFeaturesSuccessCallback
 *
 * @param {object} cbArgs Arguments object
 * @param {emp3.api.Feature[]} cbArgs.features The feature that was added
 * @param {emp3.api.Feature[]} cbArgs.failures Any failures that occurred
 * @param {emp3.api.Feature} cbArgs.source The feature which invoked the call
 */

/**
 * This callback is invoked once all child features have been returned
 * @callback emp3.api.Feature~getChildrenSuccessCallback
 *
 * @param {object} cbArgs Arguments object
 * @param {emp3.api.Feature[]} cbArgs.features List of the child features
 * @param {emp3.api.Feature[]} cbArgs.failures List of failures
 * @param {emp3.api.Feature} cbArgs.source The feature which invoked the call
 */

/**
 * This callback is invoked after successfully removing a child feature
 * This function will be replaced in future versions to return objects instead of strings
 *
 * @callback emp3.api.Feature~removeFeaturesSuccessCallback
 *
 * @param {object} cbArgs Arguments object
 * @param {FeatureIdentifier[]} cbArgs.featureIds List of features that were removed
 * @param {string[]} cbArgs.failures Any failures which resulted in features not being removed
 * @param {emp3.api.Feature} cbArgs.source The feature which invoked the call
 */

/**
 * @typedef {object} FeatureIdentifier
 * Collection of unique identifiers for removing features
 *
 * @property {string} featureId ID of the feature
 * @property {string} overlayId ID of the overlay the feature was on
 * @property {string} parentId ID of the parent of the feature
 */

/**
 * This callback is invoked after successfully retrieving all parents of the feature
 * @callback emp3.api.Feature~getParentsSuccessCallback
 *
 * @param {object} cbArgs Arguments object
 * @param {emp3.api.Feature[]} cbArgs.features All parent features of the feature
 * @param {emp3.api.Overlay[]} cbArgs.overlays All parent overlays of the feature
 * @param {emp3.api.Overlay[]|emp3.api.Feature[]} cbArgs.failures Combined list of any failures
 * @param {emp3.api.Feature} cbArgs.source The feature which invoked the call
 */

/**
 * This callback is invoked after successfully retrieving all parent features of the feature
 * @callback emp3.api.Feature~getParentFeaturesSuccessCallback
 *
 * @param {object} cbArgs Arguments object
 * @param {emp3.api.Feature[]} cbArgs.features All parent features of the feature
 * @param {emp3.api.Feature[]} cbArgs.failures List of any failures
 * @param {emp3.api.Feature} cbArgs.source The feature which invoked the call
 */

/**
 * This callback is invoked after successfully retrieving all parent features of the feature
 * @callback emp3.api.Feature~getParentOverlaysSuccessCallback
 *
 * @param {object} cbArgs Arguments object
 * @param {emp3.api.Overlay[]} cbArgs.overlays All parent overlays of the feature
 * @param {emp3.api.Overlay[]} cbArgs.failures List of any failures
 * @param {emp3.api.Feature} cbArgs.source The feature which invoked the call
 */

/**
 * A callback indicating the method did not execute as intended.
 * @callback emp3.api.Feature~onErrorCallback
 *
 * @param {object} cbArgs Arguments object
 * @param {string} cbArgs.errorMessage Message detailing the error
 */

// =====================================================================================================================
// Feature prototypical functions ======================================================================================

/**
 * Updates this feature on the map.  To update this feature you can set the
 * properties of the feature first (such as feature.name and feature.strokeStyle). The change
 * will not be registered until apply is called;
 *
 * Certain properties will not be affected by apply depending on the feature type.
 *
 * @deprecated Use Feature.update
 *
 * @example <caption>Change the name and position of a feature</caption>
 * var circle = new emp3.api.Circle({
 *   name: 'circle',
 *   position: {latitude: 0, longitude: 0},
 *   radius: 10000
 * });
 *
 * circle.name = 'updatedCircle';
 * circle.position = {latitude: 5, longitude, 0};
 * circle.apply();
 */
emp3.api.Feature.prototype.apply = function () {
  console.warn("Feature.apply is deprecated. Apply is reserved word in javascript. Use Feature.update.");
  
  this.update();
};

/**
 * Updates this feature on the map.  To update this feature you can set the
 * properties of the feature first (such as feature.name and feature.strokeStyle). The change
 * will not be registered until update is called;
 *
 * Certain properties will not be affected by update depending on the feature type.
 *
 *
 * @example <caption>Change the name and position of a feature</caption>
 * var circle = new emp3.api.Circle({
 *   name: 'circle',
 *   position: {latitude: 0, longitude: 0},
 *   radius: 10000
 * });
 *
 * circle.name = 'updatedCircle';
 * circle.position = {latitude: 5, longitude, 0};
 * circle.update();
 */
emp3.api.Feature.prototype.update = function () {
  // Validate properties
  if (this.positions) {
    var numPositions = this.positions.length;
    for (var idx = 0; idx < numPositions; idx++) {
      if (this.positions[idx].latitude > 90.0 || this.positions[idx].latitude < -90.0) {
        throw new Error('Invalid latitude: latitude must be between 90.0 and -90.0');
      }
      if (this.positions[idx].longitude > 180.0 || this.positions[idx].longitude < -180.0) {
        throw new Error('Invalid longitude: longitude must be between 180.0 and -180.0');
      }
    }
  }

  emp3.api.MessageHandler.getInstance().update(this);
};

/**
 * This will group features together on the map as if this feature is an overlay.  When this feature's visibility is
 * changed the map will set the visibility of its children.  This function allows users to build composite
 * graphics from a collection of Features.
 *
 * The parent feature must already exist on an overlay before children can be added.
 *
 * <p>
 * Not supported in CMA 1.2
 *
 * @see emp3.api.Feature#addFeatures
 *
 * @param {Object} args Parameters are provided as members of the arg object.
 * @param {emp3.api.Feature} args.feature A emp3.api.Feature object to associate with this Feature.
 * @param {boolean} [args.visible=true] Sets if the feature should be visible initially when added to the map.
 * @param {emp3.api.Feature~addFeaturesSuccessCallback} [args.onSuccess] Function to be called if the add is successful.
 * @param {emp3.api.Feature~onErrorCallback} [args.onError] Function to be called if an error occurs.
 *
 * @example <caption>One nested child</caption>
 * var circle = new emp3.api.Circle({
 * name: 'parent',
 *  position: {latitude: 45, longitude: 44},
 *  radius: 100000
 * });
 *
 * var childCircle = new emp3.api.Circle({
 *  name: 'child',
 *  position: {latitude: 45, longitude: 44},
 *  radius: 500000
 * });
 *
 * overlay.addFeatures({
 *  features: [circle, childCircle],
 *  onSuccess: function () {
 *    circle.addFeature({
 *     feature: childCircle,
 *     onSuccess: function (cbArgs) {
 *       window.console.log(cbArgs.source.name + ' added child ' + cbArgs.features[0].name);
 *     }
 *   });
 *  }
 * });
 */
emp3.api.Feature.prototype.addFeature = function (args) {
  args = args || {};
  if (!args.feature) {
    throw new Error('Missing argument: feature');
  } else if (Array.isArray(args.feature)) {
    args.features = args.feature;
  } else {
    args.features = [args.feature];
  }
  if (!args.visible) {
    args.visible = true;
  }

  this.addFeatures(args);
};

/**
 * @summary Adds a feature or a group of features as children.
 *
 * This will group features together on the map as if this feature is an overlay.  When this feature's visibility is
 * changed the map will set the visibility of its children.  This function allows users to build composite
 * graphics from a collection of Features.
 *
 * @see emp3.api.Feature#addFeature
 *
 * @param {Object} args Parameters are provided as members of the arg object.
 * @param {emp3.api.Feature[]} args.features An array of Feature objects to associate with this Feature.
 * @param {boolean} [args.visible=true] Sets if the features should be visible initially when added to the map.
 * @param {emp3.api.Feature~addFeaturesSuccessCallback} [args.onSuccess] Function to be called if the add is successful.i
 * @param {emp3.api.Feature~onErrorCallback} [args.onError] Function to be called if an error occurs.
 */
emp3.api.Feature.prototype.addFeatures = function (args) {
  var cmd;

  args = args || {};
  if (!args.features && Object.prototype.toString.call(args.features) === "[object Array]") {
    throw new Error("Missing argument: features");
  }

  args.visible = (typeof args.visible === 'boolean') ? args.visible : true;
  args.zoom = (typeof args.zoom === 'boolean') ? args.zoom : false;

  if (args.features.length > 0) {
    cmd = {
      cmd: emp3.api.enums.channel.plotFeature,
      parentId: this.geoId,
      features: args.features,
      visible: args.visible,
      onSuccess: args.onSuccess,
      onError: args.onError
    };

    emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
      source: this,
      method: "Feature.addFeatures",
      args: args
    });
  }
};

/**
 * Retrieves a list of all the feature's child features.
 * @param {Object} args
 * @param {emp3.api.Feature~getChildrenSuccessCallback} args.onSuccess All features contained by this feature.
 * @param {emp3.api.Feature~onErrorCallback} [args.onError] Function to be called if an error occurs.
 */
emp3.api.Feature.prototype.getChildFeatures = function (args) {
  this.getChildren(args);
};

/**
 * Removes a single feature from this feature.
 *
 * @see emp3.api.Feature#removeFeatures
 *
 * @param {Object} args Parameters are provided as members of the arg object.
 * @param {emp3.api.Feature} args.feature A Feature object to remove from this Feature.
 * @param {emp3.api.Feature~removeFeaturesSuccessCallback} [args.onSuccess] Function to be called if the add is successful.
 * @param {emp3.api.Feature~onErrorCallback} [args.onError] Function to be called if an error occurs.
 *
 * @example
 * var parent = new emp3.api.Square(...);
 * var child = new emp3.api.Text(...);
 *
 * var removeFeatureCB = function() {
 *   parent.removeFeature({
 *     feature: child,
 *     onSuccess: function() {
 *       alert();
 *     }
 * };
 *
 * var addChildCB = function() {
 *   parent.addFeature({
 *     feature: child,
 *     onSuccess: removeFeatureCB
 *   });
 * };
 *
 * overlay.addFeatures({
 *   features: [parent, child],
 *   onSuccess: addChildCB
 * });
 */
emp3.api.Feature.prototype.removeFeature = function (args) {
  args = args || {};

  if (!args.feature) {
    throw new Error('Missing argument: feature');
  } else if (Array.isArray(args.feature)) {
    args.features = args.feature;
  } else {
    args.features = [args.feature];
  }

  this.removeFeatures(args);
};

/**
 * Removes an array of features from this feature.
 *
 * @see emp3.api.Feature#removeFeature
 *
 * @param {Object} args Parameters are provided as members of the arg object.
 * @param {emp3.api.Feature[]} args.features An array of Feature objects to remove from this Feature.
 * @param {emp3.api.Feature~removeFeaturesSuccessCallback} [args.onSuccess] Function to be called if the add is successful.
 * @param {emp3.api.Feature~onErrorCallback} [args.onError] Function to be called if an error occurs.
 */
emp3.api.Feature.prototype.removeFeatures = function (args) {
  var cmd;

  args = args || {};
  if (!args.features || !Array.isArray(args.features)) {
    throw new Error("Missing argument: features");
  }

  cmd = {
    cmd: emp3.api.enums.channel.unplotFeatureBatch,
    parentId: this.geoId,
    features: args.features,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    source: this,
    method: "Feature.removeFeatures",
    args: args
  });
};

/**
 * This method removes all children from this container.
 *
 * @param {object} args
 * @param {emp3.api.Feature~removeFeaturesSuccessCallback} [args.onSuccess]
 * @param {emp3.api.Feature~onErrorCallback} [args.onError]
 *
 * @example <caption>With a callback</caption>
 * parentFeature.clearContainer({
 *   onSuccess: function() { alert(); }
 * });
 *
 * @example <caption>No callback</caption>
 * parentFeature.clearContainer();
 */
emp3.api.Feature.prototype.clearContainer = function (args) {
  args = args || {};

  var parent = this;
  this.getChildFeatures({
    onSuccess: function (cbArgs) {
      var cmd = {
        cmd: emp3.api.enums.channel.unplotFeatureBatch,
        features: cbArgs.features,
        parentId: parent.geoId,
        onSuccess: args.onSuccess,
        onError: args.onError
      };
      emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
        method: 'Feature.clearContainer',
        source: this,
        args: args
      });
    }.bind(this)
  });
};

/**
 * This method retrieves the immediate children of the feature.
 *
 * @param {object} args
 * @param {emp3.api.Feature~getChildrenSuccessCallback} args.onSuccess
 * @param {emp3.api.Feature~onErrorCallback} [args.onError]
 *
 * @example
 * myFeature.getChildren({
 *   onSuccess: function(cbArgs) {
 *     for (var idx in cbArgs.features) {
 *       window.console.log(cbArgs.features[idx]);
 *     }
 *   }
 * });
 */
emp3.api.Feature.prototype.getChildren = function (args) {
  args = args || {};

  if (typeof args.onSuccess === 'undefined') {
    throw new Error("Missing Argument: onSuccess");
  } else if (typeof args.onSuccess !== "function") {
    throw new TypeError("Invalid Argument: expected onSuccess to be a function");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.get,
    types: ["feature"],
    select: ["parentId", "overlayId", "name", "properties"],
    filter: [
      {
        property: "parentId",
        term: this.geoId
      }
    ],
    recursive: false,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  var callInfo = {
    method: "Feature.getChildren",
    source: this,
    args: args
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, callInfo);
};

/**
 * This retrieves the parents of a feature. These can be either {@link emp3.api.Feature} or {@link emp3.api.Overlay}
 * @param {object} args
 * @param {emp3.api.Feature~getParentsSuccessCallback} args.onSuccess Success callback
 * @param {emp3.api.Feature~onErrorCallback} [args.onError] Error callback
 *
 * @example <caption>Add a feature to two parents</caption>
 * var parent1Feature = new emp3.api.Circle(...)
 * var parent2Feature = new emp3.api.Rectangle(...);
 * var childFeature = new emp3.api.Square(...);
 *
 * // Callback to get the parent
 * var getParentsCB = function() {
 *   childFeature.getParents({
 *     onSuccess: function(cbArgs) {
 *       window.console.log(cbArgs.features, cbArgs.overlays);
 *     }
 *   })
 * };
 *
 * // Add the child to both parents
 * var addChild = function () {
 *   parent1Feature.addFeature({
 *     feature: childFeature,
 *     onSuccess: function() {
 *       parent2Feature.addFeature({
 *         feature: childFeature,
 *         onSuccess: getParentsCB
 *       });
 *     }
 *   });
 * }
 *
 * // Add the parents to the overlay and invoke the other callbacks
 * overlay.addFeatures({
 *   features: [parent1Feature, parent2Feature],
 *   onSuccess: addChild
 * });
 *
 */
emp3.api.Feature.prototype.getParents = function (args) {
  args = args || {};

  if (typeof args.onSuccess === 'undefined') {
    throw new Error("Missing Argument: onSuccess");
  } else if (typeof args.onSuccess !== "function") {
    throw new TypeError("Invalid Argument: expected onSuccess to be a function");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.get,
    types: ["overlay", "feature"],
    select: ["overlayId", "featureId", "name", "properties", "parentId"],
    filter: [
      {
        property: "childId",
        term: this.geoId
      }
    ],
    recursive: false,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  var callInfo = {
    method: "Feature.getParents",
    source: this,
    args: args
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, callInfo);
};

/**
 * This retrieves the parent {@link emp3.api.Feature} features of a feature.
 * @param {object} args
 * @param {emp3.api.Feature~getParentFeaturesSuccessCallback} args.onSuccess Success callback
 * @param {emp3.api.Feature~onErrorCallback} [args.onError] Error callback
 */
emp3.api.Feature.prototype.getParentFeatures = function (args) {
  args = args || {};

  if (typeof args.onSuccess === 'undefined') {
    throw new Error("Missing Argument: onSuccess");
  } else if (typeof args.onSuccess !== "function") {
    throw new TypeError("Invalid Argument: expected onSuccess to be a function");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.get,
    types: ["feature"],
    select: ["featureId", "name", "properties", "parentId"],
    filter: [
      {
        property: "childId",
        term: this.geoId
      }
    ],
    recursive: false,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  var callInfo = {
    method: "Feature.getParentFeatures",
    source: this,
    args: args
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, callInfo);
};

/**
 * This retrieves the parent {@link emp3.api.Overlay} overlays of a feature.
 * @param {object} args
 * @param {emp3.api.Feature~getParentOverlaysSuccessCallback} args.onSuccess Success callback
 * @param {emp3.api.Feature~onErrorCallback} [args.onError] Error callback
 */
emp3.api.Feature.prototype.getParentOverlays = function (args) {
  args = args || {};

  if (typeof args.onSuccess === 'undefined') {
    throw new Error("Missing Argument: onSuccess");
  } else if (typeof args.onSuccess !== "function") {
    throw new TypeError("Invalid Argument: expected onSuccess to be a function");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.get,
    types: ["overlay"],
    select: ["overlayId", "name", "properties", "parentId"],
    filter: [
      {
        property: "childId",
        term: this.geoId
      }
    ],
    recursive: false,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  var callInfo = {
    method: "Feature.getParentOverlays",
    source: this,
    args: args
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, callInfo);
};

// =====================================================================================================================
// Feature Mixins and other virtual docs ===============================================================================
/**
 * This is the list of classes which inherit from {@link emp3.api.Feature}
 *
 * @see {@link emp3.api.AirControlMeasure}
 * @see {@link emp3.api.Circle}
 * @see {@link emp3.api.Ellipse}
 * @see {@link emp3.api.MilStdSymbol}
 * @see {@link emp3.api.Path}
 * @see {@link emp3.api.Point}
 * @see {@link emp3.api.Polygon }
 * @see {@link emp3.api.Rectangle}
 * @see {@link emp3.api.Square}
 * @see {@link emp3.api.Text}
 *
 * @mixin Feature
 */
