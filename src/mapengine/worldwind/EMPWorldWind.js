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
   * @memberof EMPWorldWind.map#
   * @type {WorldWind.WorldWindow}
   */
  this.worldWind = wwd;
  this.empLayers = {};
  this.features = {};
  this.services = {};

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

  /** @type EMPWorldWind.data.EmpLayer */
  this.layer = undefined;
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
 * @param {emp.map} map
 */
EMPWorldWind.map.prototype.initialize = function(map) {
  /**
   * @memberof EMPWorldWind.map#
   * @type {emp.map}
   */
  this.empMapInstance = map;

  // Create the contrast layers
  var blackContrastLayer = new WorldWind.SurfaceSector(WorldWind.Sector.FULL_SPHERE, null);
  blackContrastLayer.attributes.interiorColor = new WorldWind.Color(0, 0, 0, 0.0);
  blackContrastLayer.attributes.drawOutline = false;

  var whiteContrastLayer = new WorldWind.SurfaceSector(WorldWind.Sector.FULL_SPHERE, null);
  whiteContrastLayer.attributes.interiorColor = new WorldWind.Color(1, 1, 1, 0.0);
  whiteContrastLayer.attributes.drawOutline = false;

  this.contrastLayer = new WorldWind.RenderableLayer('contrast layer');
  this.worldWind.addLayer(this.contrastLayer);

  this.contrastLayer.addRenderable(whiteContrastLayer);
  this.contrastLayer.addRenderable(blackContrastLayer);

  // Create the goTo manipulator
  /** @member {WorldWind.GoToAnimator */
  this.goToAnimator = new WorldWind.GoToAnimator(this.worldWind);

  // Register drag event handlers
  /** @member {WorldWind.DragRecognizer} */
  this.dragRecognizer = new WorldWind.DragRecognizer(this.worldWind.canvas, function(event) {
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
          this.worldWind.addEventListener(eventHandler, eventClass[eventHandler].bind(this));
        }
      }
    }
  }

  EMPWorldWind.eventHandlers.notifyViewChange.call(this, emp3.api.enums.CameraEventEnum.CAMERA_MOTION_STOPPED);
};

/**
 *
 * @param {string} layerName
 * @param {string} id
 * @param {string} parentOverlayId
 * @param {EMPWorldWind.constants.LayerType} type
 * @param {WorldWind.Layer} layer
 * @returns {EMPWorldWind.data.EmpLayer}
 */
EMPWorldWind.map.prototype.addLayer = function(layerName, id, parentOverlayId, type, layer) {
  var empLayer = new EMPWorldWind.data.EmpLayer(layerName, id, type);
  empLayer.layer = layer;

  var parentOverlay;
  if (parentOverlayId) {
    parentOverlay = this.getLayer(parentOverlayId);
    if (parentOverlay) {
      parentOverlay.subLayers[id] = empLayer;
    }
  }

  this.empLayers[id] = empLayer;
  this.worldWind.addLayer(empLayer.layer);
  this.worldWind.redraw();

  return empLayer;
};

/**
 *
 * @param {EMPWorldWind.data.EmpLayer} layer
 * @returns {{success: boolean, message: string}}
 */
EMPWorldWind.map.prototype.removeLayer = function(layer) {
  var featureKey,
    result = {success: true, message: "layer was successfully deleted"};

  for (featureKey in layer.featureKeys) {
    if (layer.featureKeys.hasOwnProperty(featureKey)) {
      this.removeFeatureSelection(featureKey);
    }
  }

  layer.clearLayer();
  this.worldWind.removeLayer(layer.layer);
  this.worldWind.redraw();

  delete this.empLayers[layer.id];

  return result;
};

/**
 * Removes all graphics and folders within the folder provided.
 * @param id
 */
EMPWorldWind.map.prototype.clearLayer = function(id) {
  var result, layer;
  if (id !== undefined) {
    layer = this.getLayer(id);
    if (layer) {
      layer.removeFeatureSelections();
      layer.removeFeatures();
      //clear all sub overlays
      if (layer.subLayersLength > 0) {
        for (var subLayerId in layer.subLayers) {
          if (layer.subLayers.hasOwnProperty(subLayerId)) {
            this.clearLayer(subLayerId);
          }
        }
        this.layer.removeAllSubOverlays();
      }
      result = {
        success: true,
        message: "layer was successfully cleared"
      };
    }
  }
  else {
    result = {
      success: false,
      message: "Missing id parameter"
    };
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

  this.worldWind.navigator.heading = args.heading;
  this.worldWind.navigator.roll = args.roll;
  this.worldWind.navigator.tilt = args.tilt;

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
 * @param {boolean} args.animate
 * @param {function} args.animateCB
 */
EMPWorldWind.map.prototype.lookAt = function(args) {
  // substituting range for altitude for now

  if (args.range !== 0) {
    args.range = args.range || this.worldWind.navigator.range;
  }

  var position = new WorldWind.Position(args.latitude, args.longitude, args.range);

  function _completeLookAtMotion() {
    this.worldWind.navigator.lookAtLocation.latitude = args.latitude;
    this.worldWind.navigator.lookAtLocation.longitude = args.longitude;

    // lookAt does not support altitude in WorldWind yet
    // this.worldWind.navigator.lookAtLocation.altitude = args.altitude;

    this.worldWind.navigator.range = args.range;
    this.worldWind.navigator.tilt = args.tilt;
    this.worldWind.navigator.heading = args.heading;

    if (args.animateCB) {
      args.animateCB();
    }

    this.worldWind.redraw();
  }

  if (args.animate) {
    this.goToAnimator.travelTime = EMPWorldWind.constants.globeMoveTime;
    this.goToAnimator.goTo(position, _completeLookAtMotion.bind(this));
  } else {
    this.goToAnimator.travelTime = 0;
    this.goToAnimator.goTo(position, _completeLookAtMotion.bind(this));
  }
};

/**
 * @param {emp.typeLibrary.Feature} feature
 * @returns {{success: boolean, message: string, jsError: string}}
 */
EMPWorldWind.map.prototype.plotFeature = function(feature) {
  var rc = {
    success: false,
    message: "",
    jsError: ""
  };

  try {
    if (this.features[feature.featureId]) {
      rc = EMPWorldWind.editors.EditorController.updateFeature.call(this, this.features[feature.featureId], feature);
      rc.message = "Failed to update feature";
    } else {
      rc = EMPWorldWind.editors.EditorController.plotFeature.call(this, feature);
    }

    if (rc.success) {
      if (!(rc.feature.id in this.features)) {
        this.features[rc.feature.id] = rc.feature;
      }

      this.worldWind.redraw();
    }
  } catch (err) {
    rc.jsError = err.message;
  }

  return rc;
};

/**
 *
 * @param args
 * @param {string} args.coreId
 * @param {string} args.parentCoreId
 */
EMPWorldWind.map.prototype.unplotFeature = function(args) {
  var rc = {
    success: false,
    message: "",
    jsError: ""
  }, layer;

  layer = this.getLayer(args.parentCoreId);
  if (layer) {
    layer.removeFeatureById(args.coreId);
  } else {
    throw "EMPWorldWind.map.prototype.removeFeature: overlay with Id = " + args.parentCoreId + " do not exist in worldwind engine";
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
      selected.push(feature);
    } else {
      failed.push(selectedFeature.featureId);
    }
  }.bind(this));

  this.worldWind.redraw();

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
  if (this.empLayers.hasOwnProperty(id)) {
    return this.empLayers[id];
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
        this.worldWind.removeLayer(layer);
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
  return this.empLayers.hasOwnProperty(layer.id);
};

/**
 *
 * @param {emp.typeLibrary.WMS} item
 */
EMPWorldWind.map.prototype.addWmsToMap = function(item) {
  try {
    var layer = this.getLayer(item.coreId);
    if (layer) {
      this.removeLayer(layer);
    }

    var layerNames = "";

    if (this.isV2Core && item.activeLayers) {
      layerNames = item.activeLayers.join();
    } else if (!this.isV2Core && item.layers) {
      layerNames = item.layers.join();
    }

    var wmsLayerConfig = {
      service: item.url,
      layerNames: layerNames,
      sector: WorldWind.Sector.FULL_SPHERE,
      levelZeroDelta: new WorldWind.Location(36, 36),
      numLevels: 15,
      format: "image/png",
      size: 256
    };

    // Purposely null for now
    var timeString = '';
    var wmsLayer = new WorldWind.WmsLayer(wmsLayerConfig, timeString);

    this.addLayer(item.name, item.coreId, item.parentCoreId, EMPWorldWind.constants.LayerType.WMS_LAYER, wmsLayer);
  } catch (err) {
    console.error("Adding WMS to WorldWind failed! ", err);
  }
};

/**
 *
 * @param {emp.typeLibrary.WMS} item
 */
EMPWorldWind.map.prototype.removeWmsFromMap = function(item) {
  try {
    var id = item.coreId,
      layer = this.getLayer(id);
    if (layer) {
      this.removeLayer(layer);
    }
  }
  catch (err) {
    console.error("Removing WMS from World Wind failed! ", err);
  }
};

/**
 *
 * @param item
 */
EMPWorldWind.map.prototype.setWmsVisibility = function(item) {
  var id, layer,
    providers, providerIndex;
  try {
    id = item.coreId;
    layer = this.getLayer(id);

    // Layer enabled is the current imagery selected from  the drop down.
    if (layer) {
      providers = layer.providers;
      if (providers && providers.length > 0) {
        for (providerIndex = 0; providerIndex < providers.length; providerIndex++) {
          //remove provider and respective  imageryLayer layer
          this.imageryLayerCollection.remove(providers[providerIndex].imageryLayer, true);
          providers[providerIndex].imageryLayer = undefined;
        }
      }
      layer.providers = [];

      var sLayers = "";
      if (this.isV2Core && item.activeLayers) {
        sLayers = item.activeLayers.join();
      } else if (!this.isV2Core && item.layers) {
        sLayers = item.layers.join();
      }

      var cesiumWMSImageryProvider = new this.WebMapServiceImageryProvider({
        url: item.url,
        credit: 'wms service description goes here,',
        parameters: {
          transparent: item.params.transparent,
          format: item.params.format,
          width: 512,
          height: 512,
          version: item.params.version,
          crs: 'CRS:84'
        },
        layers: sLayers,
        proxy: (item.useProxy) ? new this.DefaultProxy(this.getProxyUrl()) : undefined
      });

      layer.providers.push({
        layerName: sLayers,
        provider: cesiumWMSImageryProvider,
        imageryLayer: undefined,
        enable: false
      });

      this.enableLayer(layer, (item.activeLayers.length > 0));
    }
  } catch (err) {
    console.error("Setting WMS visibility in World Wind failed! ", err);
  }
};

/**
 *
 * @param id
 * @returns {boolean}
 */
EMPWorldWind.map.prototype.isFeatureSelected = function(id) {
  return !!this.empSelections.hasOwnProperty(id);
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
 * @param deselectProperties
 */
EMPWorldWind.map.prototype.storeFeatureSelection = function(id, deselectProperties) {
  this.empSelections[id] = deselectProperties;
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
  this.worldWind.redraw();
};

/**
 * Expose a refresh
 */
EMPWorldWind.map.prototype.refresh = function() {
  //var featureId, feature;

  // for (featureId in this.features) {
  //   if (this.features.hasOwnProperty(featureId)) {
  //     feature = this.features[featureId];
  //
  //     // TODO check if it is visible first1
  //     //EMPWorldWind.editors.EditorController.updateRender.call(this, feature);
  //   }
  // }

  // TODO trigger redraw if necessary only
  this.worldWind.redraw();
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

  this.worldWind.redraw();
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

  var step = this.worldWind.navigator.range / (WorldWind.EARTH_RADIUS);

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
    this.worldWind.navigator.lookAtLocation.latitude + vertical,
    this.worldWind.navigator.lookAtLocation.longitude + horizontal,
    this.worldWind.navigator.range);
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
 * @returns {string}
 */
EMPWorldWind.map.prototype.screenshot = function() {
  return this.worldWind.canvas.toDataURL();
};

/**
 * Calculate the current bounds of the WorldWindow
 * @returns {Bounds}
 */
EMPWorldWind.map.prototype.getBounds = function() {
  var topRight, bottomLeft, clientRect;

  clientRect = this.worldWind.canvas.getBoundingClientRect();

  // TODO get rid of magic numbers, make this more bullet proof
  topRight = this.worldWind.pick(this.worldWind.canvasCoordinates(clientRect.right - 70, clientRect.top + 20)).terrainObject();
  bottomLeft = this.worldWind.pick(this.worldWind.canvasCoordinates(clientRect.left + 30, clientRect.bottom - 45)).terrainObject();

  // TODO calculate corners from center in the case of full globe showing
  if (!topRight) {
    topRight = {
      position: {
        latitude: 90,
        longitude: 0
      }
    };
  }

  if (!bottomLeft) {
    bottomLeft = {
      position: {
        latitude: -90,
        longitude: 0
      }
    };
  }

  return {
    north: topRight.position.latitude,
    south: bottomLeft.position.latitude,
    east: topRight.position.longitude,
    west: bottomLeft.position.longitude
  };
};
