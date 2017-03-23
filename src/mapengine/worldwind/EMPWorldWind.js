/* global WorldWind */

/**
 * @namespace
 */
var EMPWorldWind = {};
EMPWorldWind.isV2Core = false;

/**
 * @classdesc The main interface for interacting with NASA WebWorldWind. Any interaction with the WorldWindow will occur
 * in this class.
 *
 * @class
 * @param {WorldWind.WorldWindow} wwd
 */
EMPWorldWind.map = function(wwd) {
  /**
   * @type {WorldWind.WorldWindow}
   */
  this.worldWindow = wwd;

  /** @type {Object.<string, EMPWorldWind.data.EmpLayer>} */
  this.layers = {};

  /** @type {Object.<string, EMPWorldWind.data.EmpFeature>} */
  this.features = {};

  /**
   * This holds the state of the instance
   * @memberof EMPWorldWind.map#
   */
  this.state = {
    /**
     * Pixel size
     */
    pixelSize: 1,
    /**
     * Whether the map is in drawing mode
     */
    drawing: false,
    /**
     * Whether the map is in editing mode
     */
    editing: false,
    /**
     * Whether we are dragging
     */
    dragging: false,
    /**
     * Placeholder for the last detected mouse move/touch/pointer event
     */
    lastInteractionEvent: undefined,
    /**
     * Lock state
     */
    lockState: emp3.api.enums.MapMotionLockEnum.UNLOCKED,
    /**
     * Object for holding state to compute when MilStdSymbols should be re-rendered
     */
    lastRender: {
      bounds: {
        north: 0,
        south: 0,
        east: 0,
        west: 0
      },
      altitude: 0
    },
    /**
     * Default selection style
     * @type SelectionStyle
     */
    selectionStyle: {
      scale: 1,
      lineColor: "#FFFF00",
      fillColor: undefined
    },
    /**
     * Object for describing autoPanning behavior
     */
    autoPanning: {
      step: 0.5,
      up: false,
      down: false,
      left: false,
      right: false
    },
    /**
     * Label styles for the renderer
     */
    labelStyles: {
      "V": false,
      "L": false,
      "S": false,
      "AA": false,
      "AB": false,
      "AC": true,
      "H": false,
      "M": false,
      "T": false,
      "T1": false,
      "CN": false,
      "C": false,
      "F": false,
      "G": false,
      "H1": false,
      "H2": false,
      "J": false,
      "K": false,
      "N": false,
      "P": false,
      "W": false,
      "W1": false,
      "X": false,
      "Y": false,
      "Z": false
    }
  };

  // Optimization for mil standard  single points.
  /**
   * Object for holding render optimization params
   */
  this.singlePointAltitudeRanges = {};
  /**
   * Mid-range optimization altitude
   * @default
   */
  this.singlePointAltitudeRanges.mid = 600000; // default
  /**
   * High-range optimization altitude
   * @default
   */
  this.singlePointAltitudeRanges.high = 1200000; // default
  /**
   * Current range mode
   */
  this.singlePointAltitudeRangeMode = EMPWorldWind.constants.SinglePointAltitudeRangeMode.LOW_RANGE;

  /**
   * Current set of selected objects
   */
  this.empSelections = {};
};

// typedefs ============================================================================================================
/**
 * @typedef {object} SelectionStyle
 * @property {number} scale
 * @property {string|undefined} lineColor
 * @property {string|undefined} fillColor
 */
//======================================================================================================================

/**
 * Creates the initial layers
 * @param {object} args
 * @param {Bounds} [args.bounds]
 * @param {emp.map} args.empMapInstance
 */
EMPWorldWind.map.prototype.initialize = function(args) {
  /**
   * @memberof EMPWorldWind.map#
   * @type {emp.map}
   */
  this.empMapInstance = args.empMapInstance;

  // Create the contrast layers
  var blackContrastLayer = new WorldWind.SurfaceSector(WorldWind.Sector.FULL_SPHERE, null);
  blackContrastLayer.attributes.interiorColor = new WorldWind.Color(0, 0, 0, 0.0);
  blackContrastLayer.attributes.drawOutline = false;

  var whiteContrastLayer = new WorldWind.SurfaceSector(WorldWind.Sector.FULL_SPHERE, null);
  whiteContrastLayer.attributes.interiorColor = new WorldWind.Color(1, 1, 1, 0.0);
  whiteContrastLayer.attributes.drawOutline = false;

  this.contrastLayer = new WorldWind.RenderableLayer('contrast layer');
  this.contrastLayer.pickEnabled = false;
  this.worldWindow.addLayer(this.contrastLayer);

  this.contrastLayer.addRenderable(whiteContrastLayer);
  this.contrastLayer.addRenderable(blackContrastLayer);

  // Create the goTo manipulator
  /** @member {WorldWind.GoToAnimator */
  this.goToAnimator = new WorldWind.GoToAnimator(this.worldWindow);

  // Register drag event handlers
  /** @member {WorldWind.DragRecognizer} */
  this.dragRecognizer = new WorldWind.DragRecognizer(this.worldWindow.canvas, function(event) {
    if (event.state in EMPWorldWind.eventHandlers.drag) {
      EMPWorldWind.eventHandlers.drag[event.state].call(this, event);
    }
  }.bind(this));

  // Register DOM event handlers
  var eventClass, eventHandler;
  for (eventClass in EMPWorldWind.eventHandlers) {
    if (EMPWorldWind.eventHandlers.hasOwnProperty(eventClass)) {
      eventClass = EMPWorldWind.eventHandlers[eventClass];
      for (eventHandler in eventClass) {
        if (eventClass.hasOwnProperty(eventHandler)) {
          this.worldWindow.addEventListener(eventHandler, eventClass[eventHandler].bind(this));
        }
      }
    }
  }

  if (args.extent) {
    this.centerOnLocation({
      latitude: (args.extent.north + args.extent.south) / 2,
      longitude: (args.extent.east + args.extent.west) / 2
    });
  }

  EMPWorldWind.eventHandlers.notifyViewChange.call(this, emp3.api.enums.CameraEventEnum.CAMERA_MOTION_STOPPED);
};

/**
 *
 * @param {emp.typeLibrary.Overlay} empOverlay
 * @returns {{success: boolean, message: string}}
 */
EMPWorldWind.map.prototype.addLayer = function(empOverlay) {
  var layer,
    rc = {
      success: false,
      message: ''
    };

  if (empOverlay.overlayId in this.layers) {
    rc = {
      success: false,
      message: "An overlay with this id (" + empOverlay.overlayId + ") already exists"
    };
    return rc;
  }

  // Create the layer
  layer = new EMPWorldWind.data.EmpLayer(empOverlay);
  this.rootOverlayId = empOverlay.overlayId;
  this.worldWindow.addLayer(layer.layer);

  // Register the layer
  this.layers[layer.id] = layer;

  // Update the display
  this.worldWindow.redraw();

  rc.success = true;

  return rc;
};

/**
 *
 * @param {emp.typeLibrary.Overlay | EMPWorldWind.data.EmpLayer} layer
 * @returns {{success: boolean, message: string}}
 */
EMPWorldWind.map.prototype.removeLayer = function(layer) {
  var featureKey, id,
    result = {
      success: false,
      message: ""
    };

  id = layer.id || layer.coreId;
  layer = this.getLayer(id);
  if (layer) {
    for (featureKey in layer.featureKeys) {
      if (layer.featureKeys.hasOwnProperty(featureKey)) {
        this.removeFeatureSelection(featureKey);
      }
    }

    // Update the display
    this.worldWindow.removeLayer(layer.layer);
    this.worldWindow.redraw();

    // Remove the record of the layer
    delete this.layers[layer.id];

    result.success = true;
  } else {
    result.message = "No layer found with the id " + id;
  }

  return result;
};

/**
 *
 * @param {object} args
 * @param {number} args.latitude
 * @param {number} args.longitude
 * @param {number} [args.altitude]
 * @param {number} [args.tilt]
 * @param {number} [args.roll]
 * @param {number} [args.heading]
 * @param {boolean} [args.animate = false]
 * @param {function} [args.animateCB]
 */
EMPWorldWind.map.prototype.centerOnLocation = function(args) {
  var position;
  if (typeof args.altitude === "number") {
    position = new WorldWind.Position(args.latitude, args.longitude, args.altitude);
  } else {
    position = new WorldWind.Location(args.latitude, args.longitude);
  }

  this.worldWindow.navigator.heading = args.heading || 0;
  this.worldWindow.navigator.roll = args.roll || 0;
  this.worldWindow.navigator.tilt = args.tilt || 0;

  if (args.animate) {
    this.goToAnimator.travelTime = EMPWorldWind.constants.globeMoveTime;
    this.goToAnimator.goTo(position, args.animateCB || function() {
      });
  } else {
    this.goToAnimator.travelTime = 0;
    this.goToAnimator.goTo(position);
  }
};

/**
 *
 * @param {object} args
 * @param {number} args.latitude
 * @param {number} args.longitude
 * @param {number} [args.altitude] Currently unused by WorldWind
 * @param {number} args.range
 * @param {number} args.tilt
 * @param {number} args.heading
 * @param {boolean} [args.animate]
 * @param {function} [args.animateCB]
 */
EMPWorldWind.map.prototype.lookAt = function(args) {
  // substituting range for altitude for now
  if (args.range !== 0) {
    args.range = args.range || this.worldWindow.navigator.range;
  }

  var position = new WorldWind.Position(args.latitude, args.longitude, args.range);

  /**
   * @this {EMPWorldWind.map}
   * @private
   */
  function _completeLookAtMotion() {
    this.worldWindow.navigator.lookAtLocation.latitude = args.latitude;
    this.worldWindow.navigator.lookAtLocation.longitude = args.longitude;

    // lookAt does not support altitude in WorldWind yet
    // this.worldWindow.navigator.lookAtLocation.altitude = args.altitude;

    this.worldWindow.navigator.range = args.range;
    this.worldWindow.navigator.tilt = args.tilt;
    this.worldWindow.navigator.heading = args.heading;

    if (args.animateCB) {
      args.animateCB();
    }

    this.worldWindow.redraw();
  }

  this.goToAnimator.travelTime = args.animate ? EMPWorldWind.constants.globeMoveTime : 0;
  this.goToAnimator.goTo(position, _completeLookAtMotion.bind(this));
};

/**
 * @param {emp.typeLibrary.Feature|EMPWorldWind.data.EmpFeature} feature
 * @param {PlotFeatureCB} [callback]
 */
EMPWorldWind.map.prototype.plotFeature = function(feature, callback) {
  /**
   * Handle the async plotFeature method
   * @private
   */
  var _callback = function(cbArgs) {
    // Trigger an update for the display
    this.worldWindow.redraw();

    if (cbArgs.success) {
      // Add the new feature to the global list of features
      if (!(cbArgs.feature.id in this.features)) {
        this.features[cbArgs.feature.id] = cbArgs.feature;
      }
    }

    if (callback) {
      callback(cbArgs);
    }
  }.bind(this);

  // Check if we are using a EMPWorldWind feature internally
  if (feature instanceof EMPWorldWind.data.EmpFeature) {
    feature = feature.feature;
  }

  if (feature.featureId in this.features) {
    // Update an existing feature
    EMPWorldWind.editors.EditorController.updateFeature.call(this, this.features[feature.featureId], feature, _callback);
  } else {
    // Plot a new feature
    EMPWorldWind.editors.EditorController.plotFeature.call(this, feature, _callback);
  }
};
/**
 * @callback PlotFeatureCB
 * @param {object} cbArgs
 * @param {EMPWorldWind.data.Feature} cbArgs.feature
 * @param {boolean} cbArgs.success
 * @param {string} [cbArgs.message]
 * @param {string} [cbArgs.jsError]
 */

/**
 *
 * @param {emp.typeLibrary.Feature} feature
 */
EMPWorldWind.map.prototype.unplotFeature = function(feature) {
  var layer,
    rc = {
      success: false,
      message: ""
    };

  layer = this.getLayer(feature.parentCoreId);
  if (layer) {
    layer.removeFeatureById(feature.coreId);
    this.removeFeatureSelection(feature.coreId);
    this.worldWindow.redraw();
    rc.success = true;
  } else {
    rc.messge = 'Could not find the parent overlay';
  }

  return rc;
};

/**
 *
 * @param {emp.typeLibrary.Selection[]} empSelections
 */
EMPWorldWind.map.prototype.selectFeatures = function(empSelections) {
  var selected = [],
    failed = [];

  emp.util.each(empSelections, function(selectedFeature) {
    var feature = this.features[selectedFeature.featureId];
    if (feature) {
      feature.selected = selectedFeature.select;
      (feature.selected) ? this.storeFeatureSelection(selectedFeature.featureId) : this.removeFeatureSelection(selectedFeature.featureId);
      //selected.push(feature);   
    } else {
      failed.push(selectedFeature.featureId);
    }
  }.bind(this));

  this.worldWindow.redraw();

  return {
    success: selected.length !== 0,
    selected: selected,
    failed: failed
  };
};

/**
 *
 * @param {string} id
 * @returns {EMPWorldWind.data.EmpLayer}
 */
EMPWorldWind.map.prototype.getLayer = function(id) {
  if (this.layers.hasOwnProperty(id)) {
    return this.layers[id];
  }
};

/**
 *
 * @param layer
 * @param enable
 */
EMPWorldWind.map.prototype.enableLayer = function(layer, enable) {
  var id, subLayer;
  if (this.layerExists(layer)) {
    layer.enabled = enable;
    for (id in layer.subLayers) {
      if (layer.subLayers.hasOwnProperty(id)) {
        subLayer = layer.getSubLayer(id);
        if (subLayer) {
          this.enableLayer(subLayer, enable);
        }
      }
    }

    if ((layer.globalType === EMPWorldWind.constants.layerType.ARCGIS_93_REST_LAYER) || (layer.globalType === EMPWorldWind.constants.layerType.BING_LAYER) ||
      (layer.globalType === EMPWorldWind.constants.layerType.IMAGE_LAYER) || (layer.globalType === EMPWorldWind.constants.layerType.OSM_LAYER) ||
      (layer.globalType === EMPWorldWind.constants.layerType.TMS_LAYER) || (layer.globalType === EMPWorldWind.constants.layerType.WMS_LAYER)
      || (layer.globalType === EMPWorldWind.constants.layerType.WMTS_LAYER)) {
      if (!enable) {
        this.worldWindow.removeLayer(layer);
      }
    }
  }
};

/**
 *
 * @param layer
 * @returns {boolean}
 */
EMPWorldWind.map.prototype.layerExists = function(layer) {
  return this.layers.hasOwnProperty(layer.id);
};

/**
 * Adds a WMS layer to the map
 * @param {emp.typeLibrary.WMS} wms
 */
EMPWorldWind.map.prototype.addWMS = function(wms) {
  var wmsLayer;

  // Remove existing WMS if it already exists, we shall re-add it
  wmsLayer = this.getLayer(wms.coreId);
  if (wmsLayer) {
    this.removeWMS(wmsLayer);
  }

  // Create the new layer
  wmsLayer = new EMPWorldWind.data.EmpWMSLayer(wms);

  this.layers[wmsLayer.id] = wmsLayer;
  this.worldWindow.addLayer(wmsLayer.layer);
  this.worldWindow.redraw();
};

/**
 * Removes a WMS layer from the map
 * @param {emp.typeLibrary.WMS|EMPWorldWind.data.EmpWMSLayer} wms
 */
EMPWorldWind.map.prototype.removeWMS = function(wms) {
  var layer,
    id = wms.coreId || wms.id;

  layer = this.getLayer(id);
  if (layer) {
    this.worldWindow.removeLayer(layer.layer);
    delete this.layers[layer.id];
    this.worldWindow.redraw();
  }
};

/**
 *
 * @param id
 * @returns {boolean}
 */
EMPWorldWind.map.prototype.isFeatureSelected = function(id) {
  return this.empSelections.hasOwnProperty(id);
};

/**
 *
 * @param id
 * @returns {*}
 */
EMPWorldWind.map.prototype.getFeatureSelection = function(id) {
  if (this.isFeatureSelected(id)) {
    return this.empSelections[id];
  }

  return null;
};

/**
 *
 * @param id
 */
EMPWorldWind.map.prototype.storeFeatureSelection = function(id) {
  this.empSelections[id] = id;
};

/**
 *
 * @param id
 * @returns {boolean}
 */
EMPWorldWind.map.prototype.removeFeatureSelection = function(id) {
  if (this.empSelections.hasOwnProperty(id)) {
    delete this.empSelections[id];
    return true;
  }

  return false;
};

/**
 *
 * @returns {*|null}
 */
EMPWorldWind.map.prototype.getSelections = function() {
  return this.empSelections;
};

/**
 *
 * @param id
 * @returns {boolean}
 */
EMPWorldWind.map.prototype.isMultiPointPresent = function(id) {
  return !!this.multiPointCollection.hasOwnProperty(id);
};

/**
 *
 * @param id
 * @returns {*}
 */
EMPWorldWind.map.prototype.getMultiPoint = function(id) {
  if (this.isMultiPointPresent(id)) {
    return this.multiPointCollection[id];
  }

  return null;
};

/**
 *
 * @param multiPoint
 */
EMPWorldWind.map.prototype.storeMultiPoint = function(multiPoint) {
  this.multiPointCollection[multiPoint.id] = multiPoint;
};

/**
 *
 * @param id
 * @returns {boolean}
 */
EMPWorldWind.map.prototype.removeMultiPoint = function(id) {
  if (this.multiPointCollection.hasOwnProperty(id)) {
    delete this.multiPointCollection[id];
    return true;
  }

  return false;
};

/**
 *
 * @param id
 * @returns {boolean}
 */
EMPWorldWind.map.prototype.isAirspacePresent = function(id) {
  return !!this.airspaceCollection.hasOwnProperty(id);
};

/**
 *
 * @param id
 * @returns {*}
 */
EMPWorldWind.map.prototype.getAirspace = function(id) {
  if (this.isAirspacePresent(id)) {
    return this.airspaceCollection[id];
  }

  return null;
};

/**
 *
 * @param airspace
 */
EMPWorldWind.map.prototype.storeAirspace = function(airspace) {
  this.airspaceCollection[airspace.id || airspace.coreId] = airspace;
};

/**
 *
 * @param id
 * @returns {boolean}
 */
EMPWorldWind.map.prototype.removeAirspace = function(id) {
  if (this.airspaceCollection.hasOwnProperty(id)) {
    delete this.airspaceCollection[id];
    return true;
  }

  return false;
};

/**
 *
 * @returns {*|null}
 */
EMPWorldWind.map.prototype.getSinglePoints = function() {
  return this.singlePointCollection;
};

/**
 *
 * @param id
 * @returns {boolean}
 */
EMPWorldWind.map.prototype.isSinglePointPresent = function(id) {
  return !!this.singlePointCollection.hasOwnProperty(id);
};

/**
 *
 * @param id
 * @returns {*}
 */
EMPWorldWind.map.prototype.getSinglePoint = function(id) {
  if (this.isSinglePointPresent(id)) {
    return this.singlePointCollection[id];
  }

  return null;
};

/**
 *
 * @param singlePoint
 */
EMPWorldWind.map.prototype.storeSinglePoint = function(singlePoint) {
  this.singlePointCollection[singlePoint.id] = singlePoint;
};

/**
 *
 * @param id
 * @returns {boolean}
 */
EMPWorldWind.map.prototype.removeSinglePoint = function(id) {
  if (this.isSinglePointPresent(id)) {
    delete this.singlePointCollection[id];
    return true;
  }

  return false;
};

/**
 *
 * @returns {*|null}
 */
EMPWorldWind.map.prototype.getSinglePoints = function() {
  return this.singlePointCollection;
};

/**
 *
 * @returns {number}
 */
EMPWorldWind.map.prototype.getSinglePointCount = function() {
  if (this.defined(this.singlePointCollection)) {
    return Object.keys(this.singlePointCollection).length;
  } else {
    return 0;
  }
};

/**
 *
 * @param id
 * @returns {boolean}
 */
EMPWorldWind.map.prototype.isSinglePointIdOnHoldPresent = function(id) {
  return !!this.singlePointCollectionIdOnHold.hasOwnProperty(id);
};

/**
 *
 * @param id
 * @returns {*}
 */
EMPWorldWind.map.prototype.getSinglePointIdOnHold = function(id) {
  if (this.isSinglePointIdOnHoldPresent(id)) {
    return this.singlePointCollectionOnHold[id];
  }

  return null;
};

/**
 *
 * @param singlePointId
 */
EMPWorldWind.map.prototype.storeSinglePointIdOnHold = function(singlePointId) {
  this.singlePointCollectionIdOnHold[singlePointId] = singlePointId;
};

/**
 *
 * @param id
 * @returns {boolean}
 */
EMPWorldWind.map.prototype.removeSinglePointIdOnHold = function(id) {
  if (this.isSinglePointIdOnHoldPresent(id)) {
    delete this.singlePointCollectionIdOnHold[id];
    return true;
  }

  return false;
};

/**
 *
 * @returns {*}
 */
EMPWorldWind.map.prototype.getSinglePointsIdOnHold = function() {
  return this.singlePointCollectionIdOnHold;
};

/**
 *
 * @returns {*}
 */
EMPWorldWind.map.prototype.getSinglePointsIdOnHoldCount = function() {
  if (this.defined(this.singlePointCollectionIdOnHold)) {
    return Object.keys(this.singlePointCollectionIdOnHold).length;
  }
  else {
    return 0;
  }
};

/**
 *
 * @param {Array} styles
 */
EMPWorldWind.map.prototype.setLabelStyle = function(styles) {
  var style, featureId, feature;
  for (style in this.state.labelStyles) {
    if (this.state.labelStyles.hasOwnProperty(style)) {
      this.state.labelStyles[style] = styles.includes(style);
    }
  }

  // TODO refresh only visible points and mark the rest as update when requested
  for (featureId in this.features) {
    if (this.features.hasOwnProperty(featureId)) {
      feature = this.features[featureId];
      EMPWorldWind.editors.EditorController.updateFeatureLabelStyle.call(this, feature);
    }
  }
  this.worldWindow.redraw();
};

/**
 * Expose a refresh
 */
EMPWorldWind.map.prototype.refresh = function() {
  EMPWorldWind.eventHandlers.triggerRenderUpdate.call(this);
  //var featureId, feature;

  // for (featureId in this.features) {
  //   if (this.features.hasOwnProperty(featureId)) {
  //     feature = this.features[featureId];
  //
  //     // TODO check if it is visible first
  //     //EMPWorldWind.editors.EditorController.updateRender.call(this, feature);
  //   }
  // }

  // TODO trigger redraw if necessary only
  this.worldWindow.redraw();
};

/**
 * Adjust the background contrast
 * @param {number} contrast Value from 0-100, 50 is default
 */
EMPWorldWind.map.prototype.setContrast = function(contrast) {
  if (contrast > 100) {
    contrast = 100;
  } else if (contrast < 0) {
    contrast = 0;
  }

  if (contrast >= 50) {
    this.contrastLayer.renderables[EMPWorldWind.constants.WHITE_CONTRAST].attributes.interiorColor = new WorldWind.Color(1, 1, 1, (contrast - 50) / 50);
    this.contrastLayer.renderables[EMPWorldWind.constants.BLACK_CONTRAST].attributes.interiorColor = new WorldWind.Color(0, 0, 0, 0);
  } else {
    this.contrastLayer.renderables[EMPWorldWind.constants.WHITE_CONTRAST].attributes.interiorColor = new WorldWind.Color(1, 1, 1, 0);
    this.contrastLayer.renderables[EMPWorldWind.constants.BLACK_CONTRAST].attributes.interiorColor = new WorldWind.Color(0, 0, 0, (50 - contrast) / 50);
  }

  this.worldWindow.redraw();
};

/**
 *
 * @param {emp.typeLibrary.Lock} lockState
 */
EMPWorldWind.map.prototype.setLockState = function(lockState) {
  this.state.lockState = lockState.lock;
};

/**
 * Spins the globe if autoPanning is enabled
 */
EMPWorldWind.map.prototype.spinGlobe = function() {
  var vertical = 0,
    horizontal = 0;

  var step = this.worldWindow.navigator.range / (WorldWind.EARTH_RADIUS);

  if (this.state.autoPanning.up) {
    vertical = step;
  } else if (this.state.autoPanning.down) {
    vertical = -step;
  }

  if (this.state.autoPanning.left) {
    horizontal = -step;
  } else if (this.state.autoPanning.right) {
    horizontal = step;
  }

  var position = new WorldWind.Position(
    this.worldWindow.navigator.lookAtLocation.latitude + vertical,
    this.worldWindow.navigator.lookAtLocation.longitude + horizontal,
    this.worldWindow.navigator.range);
  this.goToAnimator.travelTime = 500; // TODO smooth the transition if this is getting called too often

  if (this.state.autoPanning.up ||
    this.state.autoPanning.left ||
    this.state.autoPanning.down ||
    this.state.autoPanning.right) {
    this.goToAnimator.goTo(position);
    EMPWorldWind.eventHandlers.notifyViewChange.call(this, emp3.api.enums.CameraEventEnum.CAMERA_IN_MOTION);
    setTimeout(this.spinGlobe.bind(this), 250);
  } else {
    EMPWorldWind.eventHandlers.notifyViewChange.call(this, emp3.api.enums.CameraEventEnum.CAMERA_MOTION_STOPPED);
  }
};

/**
 * Returns a data URI of the current view of the canvas
 * @todo Handle iconURL within Placemarks
 * @returns {string}
 */
EMPWorldWind.map.prototype.screenshot = function() {
  // This forces webgl to render which exposes current context for the canvas.toDataURL function
  // Note: this is still lacking functionality as Placemarks are not rendered
  this.worldWindow.drawFrame();
  return this.worldWindow.canvas.toDataURL();
};

/**
 * Calculate the current bounds of the WorldWindow
 * @returns {Bounds}
 */
EMPWorldWind.map.prototype.getBounds = function() {
  var topRight, bottomLeft;

  // Check the viewport corners
  topRight = this.worldWindow.pickTerrain(new WorldWind.Vec2(this.worldWindow.viewport.width - 1, 1)).terrainObject();
  bottomLeft = this.worldWindow.pickTerrain(new WorldWind.Vec2(1, this.worldWindow.viewport.height - 1)).terrainObject();

  // If the corners don't contain the globe assume we are zoomed very far out, estimate an arbitrary rectangle
  if (!topRight) {
    topRight = {
      position: WorldWind.Location.linearLocation(
        this.worldWindow.navigator.lookAtLocation,
        this.worldWindow.navigator.heading + 45,
        Math.PI / 3,
        new WorldWind.Location())
    };
  }

  if (!bottomLeft) {
    bottomLeft = {
      position: WorldWind.Location.linearLocation(
        this.worldWindow.navigator.lookAtLocation,
        this.worldWindow.navigator.heading + 45,
        -Math.PI / 3,
        new WorldWind.Location())
    };
  }

  return {
    north: topRight.position.latitude,
    south: bottomLeft.position.latitude,
    east: topRight.position.longitude,
    west: bottomLeft.position.longitude
  };
};

/**
 * Returns the center of focus of the map
 * @returns {{latitude: number, longitude:number}}
 */
EMPWorldWind.map.prototype.getCenter = function() {
  return this.worldWindow.navigator.lookAtLocation;
};

/**
 * Deletes and removes all features and layers on the map
 */
EMPWorldWind.map.prototype.shutdown = function() {
  this.features = {};
  this.layers = {};
  this.worldWindow = undefined;
};
