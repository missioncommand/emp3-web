if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

/**
 * This default constructor creates an Overlay and its encapsulated GeoContainer.
 *
 * @extends {emp3.api.Container}
 * @constructor
 * @classdesc This class handles all operations on a Geo Container object or Overlay.
 *
 * @param [args] Arguments object
 * @param {string} [args.name]
 * @param {string} [args.description]
 * @param {string} [args.geoId] This default constructor creates an Overlay and its encapsulated GeoContainer and assigns it
 * the id provided. If args.geoId is specified to not specify args.container.
 *
 * @example <caption>A basic overlay using defaults</caption>
 * var overlay = new emp3.api.Overlay();
 *
 * @example <caption>With a name and definite geoId</caption>
 * var unitsOverlay = new emp3.api.Overlay({
 *   name: "Hostile Ground Units",
 *   geoId: "hgu_1_12271500Z2016",
 *   description: "Hostile ground units positions on 12/27/2016 as of 1500Z"
 * });
 */
emp3.api.Overlay = function (args) {

  // Initialize the args object to the default.
  args = args || {};

  this.type = "overlay";

  // The ID of the overlay set by the Map API
  this.geoId = args.geoId || emp3.api.createGUID();
  /**
   * The name of the overlay.
   * @type String
   */
  this.name = args.name || "untitled overlay";

  /**
   * The properties of the overlay.
   * @type Object
   */
  this.properties = args.properties || {};
};

emp3.api.Overlay.prototype = new emp3.api.Container();
// =====================================================================================================================
/**
 * @callback emp3.api.Overlay~addFeaturesCallback
 * @param {object} cbArgs
 * @param {emp3.api.Feature[]} cbArgs.features Array of features added to the overlay
 * @param {emp3.api.Feature[]} cbArgs.failures Array of features which failed to be added
 */

/**
 * @callback emp3.api.Overlay~addOverlaysCallback
 * @param {object} cbArgs
 * @param {emp3.api.Overlay[]} cbArgs.overlays Array of overlays added to the overlay
 * @param {emp3.api.Overlay[]} cbArgs.failures Array of overlays which failed to be added
 */

/**
 * @callback emp3.api.Overlay~applyCallback
 * @param {object} cbArgs
 * @param {emp3.api.Overlay} cbArgs.overlay The updated overlay
 * @param {emp3.api.Overlay[]} cbArgs.failures Array of overlays which failed to update
 */

/**
 * @callback emp3.api.Overlay~getChildrenCallback
 * @param {object} cbArgs Arguments object
 * @param {emp3.api.Feature[]} cbArgs.features List of the child features
 * @param {emp3.api.Overlay[]} cbArgs.overlays List of the child overlays
 * @param {emp3.api.Feature[]|emp3.api.Overlay[]} cbArgs.failures List of failures
 * @param {emp3.api.Feature} cbArgs.source The feature which invoked the call
 */

/**
 * @callback emp3.api.Overlay~getFeaturesCallback
 * @param {object} cbArgs
 * @param {emp3.api.Feature[]} cbArgs.features List of child features
 */

/**
 * @callback emp3.api.Overlay~getOverlaysCallback
 * @param {object} cbArgs
 * @param {emp3.api.Overlay[]} cbArgs.overlays List of child overlays
 */

/**
 * @callback emp3.api.Overlay~removeFeaturesCallback
 * @param {object} cbArgs
 * @param {FeatureIdentifier[]} args.featureIds
 * @param {FeatureIdentifier[]} args.failures
 */

/**
 * @callback emp3.api.Overlay~removeOverlaysCallback
 *
 * @param {object} cbArgs
 * @param {emp3.api.Overlay[]} cbArgs.overlays
 * @param {emp3.api.Overlay[]} cbArgs.failures
 */

/**
 * Called when the overlay has been cleared
 * @callback emp3.api.Overlay~clearContainerCallback
 *
 * @param {object} cbArgs
 * @param {emp3.api.Feature[]|emp3.api.Overlay[]} cbArgs.failures Any features or overlays that failed to be removed
 */

/**
 * Returns with the parents of the overlay
 * @callback emp3.api.Overlay~getParentsCallback
 *
 * @param {object} cbArgs
 * @param {emp3.api.Overlay} cbArgs.overlay List of overlays which are direct parents of the overlay
 */

/**
 * @callback emp3.api.Overlay~errorCallback
 */
// =====================================================================================================================

/**
 * This method adds a feature to this overlay.
 *
 * @param {object} args
 * @param {emp3.api.Feature} args.feature The feature to add
 * @param {boolean} [args.visible=true] Whether the feature will be visible on the overlay
 * @param {emp3.api.Overlay~addFeaturesCallback} [args.onSuccess] Any successful adds will invoke this callback
 * @param {emp3.api.Overlay~errorCallback} [args.onError] If all adds fail this will be invoked
 *
 * @example <caption>Adding a single feature</caption>
 * overlay.addFeature({
 *   feature: myFeature,
 *   onSuccess: function() {
 *     alert();
 *   }
 * });
 *
 * @example <caption>Adding a feature with it being hidden</caption>
 * overlay.addFeature({
 *   feature: myFeature,
 *   visible: false,
 *   onSuccess: function() {
 *     alert();
 *   }
 * });
 */
emp3.api.Overlay.prototype.addFeature = function (args) {
  args = args || {};

  if (!args.feature) {
    throw new Error("Missing argument: feature");
  }

  if (Array.isArray(args.feature)) {
    args.features = args.feature;
  } else {
    args.features = [args.feature];
  }

  // Simply call the plural version of this method.
  this.addFeatures({
    features: args.features,
    visible: args.visible,
    onSuccess: args.onSuccess,
    onError: args.onError
  });
};

/**
 * This method adds one or more features to this overlay.
 * @param {Object} args Parameters are provided as members of the args object
 * @param {emp3.api.Feature[]} args.features The features to add
 * @param {boolean} [args.visible=true] Whether the features are visible
 * @param {emp3.api.Overlay~addFeaturesCallback} [args.onSuccess] Any successful adds will invoke this callback
 * @param {emp3.api.Overlay~errorCallback} [args.onError] If all adds fail this will be invoked
 *
 * @example <caption>Adding many features</caption>
 * var featuresArray = [];
 * ...
 * featuresArray.push(feature9872)
 * ...
 * overlay.addFeatures({
 *   features: featuresArray,
 *   onSuccess: function(cbArgs) {
 *     cbArgs.features.forEach(function(feat) {
 *       window.console.log(feat.name, feat.geoId);
 *     })
 *   }
 * });
 */
emp3.api.Overlay.prototype.addFeatures = function (args) {
  var cmd;

  args = args || {};
  if (!args.features) {
    throw new Error("Missing argument: features");
  } else if (!Array.isArray(args.features)) {
    throw new TypeError("Invalid Argument: expected features to be an array");
  }

  if (args.features.length > 0) {
    cmd = {
      cmd: emp3.api.enums.channel.plotFeature,
      overlayId: this.geoId,
      visible: args.visible,
      features: args.features,
      onSuccess: args.onSuccess,
      onError: args.onError
    };

    emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
      source: this,
      method: "Overlay.addFeatures",
      args: args
    });
  }
};

/**
 * This method adds a child overlay to this overlay.
 * @param {Object} args Parameters are provided as members of the args object
 * @param {emp3.api.Overlay} args.overlay The overlay to add
 * @param {emp3.api.Overlay~addOverlaysCallback} [args.onSuccess] Callback to be invoked if any overlays are successfully added
 * @param {emp3.api.Overlay~errorCallback} [args.onError] Callback to be invoked if all adds fail
 */
emp3.api.Overlay.prototype.addOverlay = function (args) {
  args = args || {};
  if (!args.overlay) {
    throw new Error("Missing argument: overlay");
  }

  if (Array.isArray(args.overlay)) {
    args.overlays = args.overlay;
  } else {
    args.overlays = [args.overlay];
  }

  this.addOverlays(args);
};

/**
 * This method adds one or more child overlays to this overlay.
 * @param {object} args
 * @param {emp3.api.Overlay[]} args.overlays The overlays to add
 * @param {emp3.api.Overlay~addOverlaysCallback} [args.onSuccess] Callback to be invoked if any overlays are successfully added
 * @param {emp3.api.Overlay~errorCallback} [args.onError] Callback to be invoked if all adds fail
 */
emp3.api.Overlay.prototype.addOverlays = function (args) {
  var cmd;

  args = args || {};
  if (!args.overlays) {
    throw new Error("Missing argument: overlays");
  } else if (!Array.isArray(args.overlays)) {
    throw new TypeError("Invalid Argument: expected overlays to be an array");
  }

  cmd = {
    cmd: emp3.api.enums.channel.createOverlay,
    overlays: args.overlays,
    parentId: this.geoId,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    source: this,
    method: "Overlay.addOverlays",
    args: args
  });
};

/**
 * This method triggers an update of the overlay.
 * The only properties which may be updated in the fashion are the name and description.
 * Changing the properties locally without calling apply will cause updates to be lost.
 *
 * @deprecated Use emp3.api.Overlay.prototype.update
 *
 * @param {object} [args]
 * @param {emp3.api.Overlay~applyCallback} [args.onSuccess]
 * @param {emp3.api.Overlay~errorCallback} [args.onError]
 *
 * @example <caption>Renaming an overlay</caption>
 * var weatherOverlay = new emp3.api.Overlay({name: 'wetter map', geoId: 'weatherMap'});
 * map.addOverlay({
 *   overlay: weatherOverlay,
 *   onSuccess: function() {
 *     // fix spelling of name
 *     weatherOverlay.name = "weather map";
 *     weatherOverlay.apply();
 *   }
 * });
 */
emp3.api.Overlay.prototype.apply = function (args) {
  console.warn("Overlay.apply is deprecated. Apply is reserved word in javascript. Use Overlay.update.");

  this.update(args);
};

/**
 * This method triggers an update of the overlay.
 * The only properties which may be updated in the fashion are the name and description.
 * Changing the properties locally without calling update will cause updates to be lost.
 *
 * @param {object} [args]
 * @param {emp3.api.Overlay~updateCallback} [args.onSuccess]
 * @param {emp3.api.Overlay~errorCallback} [args.onError]
 *
 * @example <caption>Renaming an overlay</caption>
 * var weatherOverlay = new emp3.api.Overlay({name: 'wetter map', geoId: 'weatherMap'});
 * map.addOverlay({
 *   overlay: weatherOverlay,
 *   onSuccess: function() {
 *     // fix spelling of name
 *     weatherOverlay.name = "weather map";
 *     weatherOverlay.update();
 *   }
 * });
 */
emp3.api.Overlay.prototype.update = function (args) {
  args = args || {};

  var cmd = {
    cmd: emp3.api.enums.channel.updateOverlay,
    overlay: this,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    source: this,
    method: "Overlay.update",
    args: args
  });
};

/**
 * This method retrieves the immediate children of the overlay.
 *
 * @param {object} args
 * @param {emp3.api.Overlay~getChildrenCallback} args.onSuccess
 * @param {emp3.api.Overlay~errorCallback} [args.onError]
 *
 * @example
 * overlay.getChildren({
 *   onSuccess: function(cbArgs) {
 *     cbArgs.features.forEach(function(feature) {
 *       window.console.log(feature);
 *     });
 *     cbArgs.overlays.forEach(function(overlay) {
 *       window.console.log(overlay);
 *     });
 *   }
 * });
 */
emp3.api.Overlay.prototype.getChildren = function (args) {
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
        property: "parentId",
        term: this.geoId
      }
    ],
    recursive: false,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  var callInfo = {
    method: "Overlay.getChildren",
    source: this,
    args: args
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, callInfo);
};

/**
 * This method retrieves all child features of this overlay.
 *
 * @param {object} args
 * @param {boolean} [args.includeVisibleFeaturesOnly=false]
 * @param {emp3.api.Overlay~getFeaturesCallback} args.onSuccess
 * @param {emp3.api.Overlay~errorCallback} [args.onError]
 *
 * @example
 * overlay.getFeatures({
 *   onSuccess: function(args) {
 *     args.features.forEach(function(feature) {
 *       window.console.debug(feature);
 *     }
 *   }
 * });
 */
emp3.api.Overlay.prototype.getFeatures = function (args) {
  args = args || {};

  var includeVisibleFeaturesOnly = false,
    cmd;

  if (typeof args.onSuccess !== "function") {
    throw new Error("onSuccess argument is required, and must be a function.");
  }

  // Check to see if user passed in the includeVisibleFeaturesOnly parameter.
  // If not defined it will be set to false so all features are returned.
  if (typeof args.includeVisibleFeaturesOnly !== 'undefined' &&
    args.includeVisibleFeaturesOnly !== null) {
    includeVisibleFeaturesOnly = args.includeVisibleFeaturesOnly;
  }

  cmd = {
    cmd: emp3.api.enums.channel.get,
    recursive: false,
    types: ["feature"],
    select: ["featureId", "overlayId", "parentId", "name", "properties", "format", "feature"],
    filter: [{
      property: "overlayId",
      term: this.geoId
    }],
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  if (includeVisibleFeaturesOnly) {
    cmd.filter.push({
      property: "visible",
      term: true
    });
  }

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    source: this,
    method: "Overlay.getFeatures",
    args: args
  });
};

/**
 * This method retrieves a list of this overlay's immediate child overlays.
 * @param {object} args
 * @param {emp3.api.Overlay~getOverlaysCallback} args.onSuccess Success callback
 * @param {emp3.api.Overlay~errorCallback} [args.onError] Error callback
 *
 * @example
 * overlay.getOverlays({
 *   onSuccess: function(args) {
 *     args.overlays.forEach(function(overlay) {
 *       window.console.debug(overlay);
 *     }
 *   }
 * });
 */
emp3.api.Overlay.prototype.getOverlays = function (args) {
  args = args || {};

  if (typeof args.onSuccess !== "function") {
    throw new Error("onSuccess argument is required, and must be a function.");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.get,
    recursive: false,
    types: ["overlay"],
    select: ["overlayId", "parentId", "name", "properties"],
    filter: [{
      property: "parentId",
      term: this.geoId
    }],
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    source: this,
    method: "Overlay.getOverlays",
    args: args
  });
};

/**
 * This method removes a child feature from this overlay.
 *
 * @param {object} args
 * @param {emp3.api.Feature} args.feature
 * @param {emp3.api.Overlay~removeFeaturesCallback} [args.onSuccess]
 * @param {emp3.api.Overlay~errorCallback} [args.onError]
 */
emp3.api.Overlay.prototype.removeFeature = function (args) {
  args = args || {};

  if (!args.feature) {
    throw new Error('Missing argument: feature');
  } else if (!(args.feature instanceof emp3.api.Feature)) {
    throw new TypeError('Invalid argument: expected feature to be of type emp3.api.Feature');
  }

  // Call the plural of this method
  args.features = [args.feature];
  this.removeFeatures(args);
};

/**
 * This method an array of child features from this overlay
 *
 * @param {object} args
 * @param {emp3.api.Feature[]} args.features
 * @param {string[]} args.featureIds
 * @param {emp3.api.Overlay~removeFeaturesCallback} [args.onSuccess]
 * @param {emp3.api.Overlay~errorCallback} [args.onError]
 */
emp3.api.Overlay.prototype.removeFeatures = function (args) {
  args = args || {};
  if (!args.features && !args.featureIds) {
    throw new Error("missing argument: featureIds or features must be set");
  }

  if (!Array.isArray(args.features)) {
    throw new TypeError("Invalid argument: featureId is not an array");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.unplotFeatureBatch,
    overlayId: this.geoId,
    features: args.features,
    onSuccess: args.onSuccess,
    onError: args.onError
  };
  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    source: this,
    method: "Overlay.removeFeatures",
    args: args
  });
};

/**
 * This method removes a child overlay from this overlay
 *
 * @param {object} args
 * @param {emp3.api.Overlay} args.overlay The overlay to remove
 * @param {emp3.api.Overlay~removeOverlaysCallback} [args.onSuccess] Success callback
 * @param {emp3.api.Overlay~errorCallback} [args.onError] Error callback
 */
emp3.api.Overlay.prototype.removeOverlay = function (args) {
  args = args || {};
  if (!args.overlay) {
    throw new Error('Missing argument: overlay');
  } else if (!(args.overlay instanceof emp3.api.Overlay)) {
    throw new TypeError('Invalid argument: overlay should be of type emp3.api.Overlay');
  }

  // Use the plural of this method
  this.removeOverlays({
    overlays: [args.overlay],
    onSuccess: args.onSuccess || function () {
    },
    onError: args.onError || function () {
    }
  });
};

/**
 * This method removes an array of overlays
 *
 * @param {object} args
 * @param {emp3.api.Overlay[]} args.overlays
 * @param {emp3.api.Overlay~removeOverlaysCallback} [args.onSuccess]
 * @param {emp3.api.Overlay~errorCallback} [args.onError]
 */
emp3.api.Overlay.prototype.removeOverlays = function (args) {
  args = args || {};
  if (!args.overlays) {
    throw new Error("Missing argument: overlays");
  } else if (!Array.isArray(args.overlays)) {
    throw new TypeError("Invalid argument: overlays is not an array");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.removeOverlay,
    parentId: this.geoId,
    overlays: args.overlays,
    onSuccess: args.onSuccess,
    onError: args.onError
  };
  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    source: this,
    method: "Overlay.removeOverlays",
    args: args
  });
};

/**
 * Removes all immediate children from the overlay
 *
 * @param {object} args
 * @param {emp3.api.Overlay~clearContainerCallback} [args.onSuccess]
 * @param {emp3.api.Overlay~errorCallback} [args.onError]
 */
emp3.api.Overlay.prototype.clearContainer = function (args) {
  args = args || {};

  // Format the request
  var cmd = {
    cmd: emp3.api.enums.channel.clearFeatures,
    overlay: this,
    onSuccess: args.onSuccess,
    onError: args.onError
  };
  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    source: this,
    method: "Overlay.clearContainer",
    args: args
  });
};

/*
 // TODO leave this in
 emp3.api.Overlay.prototype.clusterActivate = function (args) {
 var newName,
 cmd;

 args = args || {};
 if (!this.geoId || this.geoId.length < 1) {
 throw new Error("This overlay does not have an ID. Has it been added " +
 "to the map yet?");
 }

 args.overlay = this;

 // Format the request
 cmd = {
 cmd: emp3.api.enums.channel.overlayClusterActivate,
 overlay: this,
 onSuccess: args.onSuccess,
 onError: args.onError
 };

 emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
 source: this,
 method: "Overlay.clusterActivate",
 args: args
 });
 };
 */

/*
 // TODO leave this in
 emp3.api.Overlay.prototype.clusterDeactivate = function (args) {
 var newName,
 cmd;

 args = args || {};
 if (!this.geoId || this.geoId.length < 1) {
 throw new Error("This overlay does not have an ID. Has it been added " +
 "to the map yet?");
 }

 args.overlay = this;

 // Format the request
 cmd = {
 cmd: emp3.api.enums.channel.overlayClusterDeactivate,
 overlay: this,
 onSuccess: args.onSuccess,
 onError: args.onError
 };

 emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
 source: this,
 method: "Overlay.clusterDeactivate",
 args: args
 });
 };
 */

/*
 // TODO leave this in
 emp3.api.Overlay.prototype.clusterRemove = function (args) {
 var newName,
 cmd;

 args = args || {};
 if (!this.geoId || this.geoId.length < 1) {
 throw new Error("This overlay does not have an ID. Has it been added " +
 "to the map yet?");
 }

 args.overlay = this;

 // Format the request
 cmd = {
 cmd: emp3.api.enums.channel.overlayClusterRemove,
 overlay: this,
 onSuccess: args.onSuccess,
 onError: args.onError
 };

 emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
 source: this,
 method: "Overlay.clusterRemove",
 args: args
 });
 };
 */

/**
 * @param {object} args
 * @param {emp3.api.Overlay~getParentsCallback} args.onSuccess
 * @param {emp3.api.Overlay~errorCallback} [args.onError]
 */
emp3.api.Overlay.prototype.getParents = function (args) {
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
    method: "Overlay.getParents",
    source: this,
    args: args
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, callInfo);
};
