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
EMPWorldWind.Map = function(wwd) {
  /**
   * @type {WorldWind.WorldWindow}
   */
  this.worldWindow = wwd;

  /** @type {WorldWind.RenderableLayer} */
  this.rootLayer = undefined;

  /** @type {Object.<string, EMPWorldWind.data.EmpFeature>} */
  this.features = {};

  /** @type {Object.<string, *>} */
  this.services = {};

  /**
   * This holds the state of the instance
   * @memberof EMPWorldWind.Map#
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
      state: String(EMPWorldWind.constants.PAN_STATE.HALTED),
      step: 0.5,
      up: false,
      down: false,
      left: false,
      right: false
    },
    /**
     * Defaults to 1:1 scale
     */
    iconSize: EMPWorldWind.constants.IconSize.medium,
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
  this.optimizationMapMoveEpsilon = EMPWorldWind.Math.EPSILON5;
  this.lastNavigator = {};
  this.shapesInViewArea = undefined;
  this.bounds = undefined;

  /** SEC renderer worker for multi-points */
  this.secRendererWorker = {};
  this.secRendererWorker.A = undefined;
  this.secRendererWorker.B = undefined;
  this.secRendererWorker.lastSelected = EMPWorldWind.constants.RendererWorker.B;

  this.throttleAddMultiPointRedraws = undefined;
};

// typedefs ============================================================================================================
/**
 * @typedef {object} SelectionStyle
 * @property {number} scale
 * @property {string|undefined} lineColor
 * @property {string|undefined} fillColor
 */

/**
 * @callback EMPWorldWind.map~WMTSCallback
 */

/**
 * @typedef {object} AutoPanParams
 * @property {boolean} up
 * @property {boolean} down
 * @property {boolean} left
 * @property {boolean} right
 */

/**
 * @callback PlotFeatureCB
 * @param {object} cbArgs
 * @param {EMPWorldWind.data.Feature} cbArgs.feature
 * @param {boolean} cbArgs.success
 * @param {string} [cbArgs.message]
 * @param {string} [cbArgs.jsError]
 */
//======================================================================================================================
/**
 *
 */
EMPWorldWind.Map.prototype = function() {

  // Private Functions =================================================================================================
  /**
   * Redraws all features on the map, useful when updating selectionStyle
   */
  function _redrawAllFeatures() {
    emp.util.each(Object.keys(this.features), function(featureKey) {
      var feature = this.features[featureKey];
      this.plotFeature(feature);
    }.bind(this));
  }

  // Public interface ==================================================================================================
  return {
    /**
     * Creates the initial layers
     * @param {object} args
     * @param {Bounds} [args.extent]
     * @param {object} [args.configProperties]
     * @param {emp.map} args.mapInstance
     */
    initialize: function(args) {
      /**
       * @memberof EMPWorldWind.Map#
       * @type {emp.map}
       */
      this.empMapInstance = args.mapInstance;

      /**
       * Creates the two contrast layers
       * @private
       */
      var _createContrastLayers = function() {
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
      }.bind(this);

      /**
       * Registers event handlers
       * @private
       */
      var _addEventHandlers = function() {
        // Register DOM event handlers
        // var throttleValue = 50; // throttle on event calls in ms
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
      }.bind(this);

      /**
       * Sets the view to an initial extent or default of 44,44
       * @param extent
       * @private
       */
      var _setInitialExtent = function(extent) {
        var alt;
        extent = extent || {
            centerLat: 44,
            centerLon: 44
          };

        if (!isNaN(extent.north) && !isNaN(extent.south) && !isNaN(extent.east) && !isNaN(extent.west)) {
          // Get approximate height from the width of the extent
          alt = Math.PI * WorldWind.EARTH_RADIUS * WorldWind.Location.greatCircleDistance(
              new WorldWind.Location(extent.north, extent.west),
              new WorldWind.Location(extent.south, extent.east));

          this.centerOnLocation({
            latitude: (extent.north + extent.south) / 2,
            longitude: (extent.east + extent.west) / 2,
            altitude: alt
          });
        } else if (!isNaN(extent.centerLat) && !isNaN(extent.centerLon)) {
          // Arbitrarily use 1e7 as altitude
          this.centerOnLocation({
            latitude: extent.centerLat,
            longitude: extent.centerLon,
            altitude: 1e7
          });
        }
      }.bind(this);

      /**
       * Sets configs for the engine from initial params
       * @param config
       * @private
       */
      var _applyConfigProperties = function(config) {
        config = config || {};

        if (EMPWorldWind.utils.defined(config.midDistanceThreshold)) {
          this.singlePointAltitudeRanges.mid = config.midDistanceThreshold;
        }

        if (EMPWorldWind.utils.defined(config.farDistanceThreshold)) {
          this.singlePointAltitudeRanges.far = config.farDistanceThreshold;
        }

        if (EMPWorldWind.utils.defined(config.brightness)) {
          this.setContrast(config.brightness);
        }
      }.bind(this);

      /**
       * Initializes the web workers for rendering
       * @private
       */
      var _initializeWebWorkers = function() {
        this.secRendererWorker.A = new Worker(WorldWind.configuration.baseUrl + 'renderer/MPCWorker.js');
        this.secRendererWorker.B = new Worker(WorldWind.configuration.baseUrl + 'renderer/MPCWorker.js');

        this.secRendererWorker.A.onerror = function(error) {
          //logs error to console
          armyc2.c2sd.renderer.utilities.ErrorLogger.LogException("MPWorker A", "postMessage", error);
        };

        // Overwrite the interface function
        this.secRendererWorker.onMessage = function(e) {
          var rendererData = [];

          if (e.data.id) { // Not a batch call
            rendererData.push = e.data.result;
          } else {
            rendererData = e.data.result;
          }

          emp.util.each(rendererData, function(rendererItem) {
            if (!EMPWorldWind.utils.defined(rendererItem) || typeof rendererItem === 'string') {
              return;
            }

            var i,
              wwFeature = this.features[rendererItem.id],
              shapes = [],
              data = rendererItem.geojson;

            emp.util.each(data.features, function(componentFeature) {
              var lineCount;

              // TODO have the renderer return the proper width, manually overwriting the line width for now
              componentFeature.properties.strokeWidth = 1;
              componentFeature.properties.strokeWeight = 1;

              switch (componentFeature.geometry.type) {
                case "MultiLineString":
                  lineCount = componentFeature.geometry.coordinates.length;

                  for (i = 0; i < lineCount; i++) {
                    var subGeoJSON = {
                      properties: componentFeature.properties,
                      coordinates: componentFeature.geometry.coordinates[i]
                    };

                    shapes.push(EMPWorldWind.editors.primitiveBuilders.constructSurfacePolylineFromGeoJSON(subGeoJSON, this.state.selectionStyle));
                  }
                  break;
                case "LineString":
                  shapes.push(EMPWorldWind.editors.primitiveBuilders.constructSurfacePolylineFromGeoJSON(componentFeature, this.state.selectionStyle));
                  break;
                case "Point":
                  shapes.push(EMPWorldWind.editors.primitiveBuilders.constructTextFromGeoJSON(componentFeature, this.state.selectionStyle));
                  break;
                case "Polygon":
                  shapes.push(EMPWorldWind.editors.primitiveBuilders.constructSurfacePolygonFromGeoJSON(componentFeature, this.state.selectionStyle));
                  break;
                default:
                  window.console.error("Unable to render symbol with type " + componentFeature.geometry.type);
              }
            }.bind(this));

            if (wwFeature) {

              this.rootLayer.removeFeature(wwFeature);
              wwFeature.clearShapes();
              wwFeature.addShapes(shapes);
              this.rootLayer.addFeature(wwFeature);

              wwFeature.feature.range = this.worldWindow.navigator.range;
              wwFeature.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
              wwFeature.selected = this.isFeatureSelected(wwFeature.id);
            }
          }.bind(this));

          this.worldWindow.redraw();
        }.bind(this);

        this.secRendererWorker.A.onmessage = this.secRendererWorker.onMessage;


        this.secRendererWorker.B.onerror = function(error) {
          //logs error to console
          armyc2.c2sd.renderer.utilities.ErrorLogger.LogException("MPWorker B", "postMessage", error);
        };
        this.secRendererWorker.B.onmessage = this.secRendererWorker.onMessage;
      }.bind(this);

      // Create the contrast Layers
      _createContrastLayers();

      // Create the root layer for all shapes
      this.rootLayer = new EMPWorldWind.data.EmpLayer("RootLayer for " + args.mapInstance.mapInstanceId);
      this.worldWindow.addLayer(this.rootLayer.layer);

      // Create the goTo manipulator
      /** @member {WorldWind.GoToAnimator} */
      this.goToAnimator = new WorldWind.GoToAnimator(this.worldWindow);

      // Register drag event handlers
      /** @member {WorldWind.DragRecognizer} */
      this.dragRecognizer = new WorldWind.DragRecognizer(this.worldWindow.canvas, function(event) {
        if (event.state in EMPWorldWind.eventHandlers.drag) {
          EMPWorldWind.eventHandlers.drag[event.state].call(this, event);
        }
      }.bind(this));

      // Register event handlers
      _addEventHandlers();

      // Set initial extent
      _setInitialExtent(args.extent);

      // Store initial navigator settings
      if (this.worldWindow.navigator) {
        this.lastNavigator.range = this.worldWindow.navigator.range;
        this.lastNavigator.tilt = this.worldWindow.navigator.tilt;
        this.lastNavigator.roll = this.worldWindow.navigator.roll;
        this.lastNavigator.heading = this.worldWindow.navigator.heading;
        this.lastNavigator.lookAtLocation = emp.helpers.copyObject(this.worldWindow.navigator.lookAtLocation);
      }

      // Update any other config properties passed in
      _applyConfigProperties(args.configProperties);

      // Trigger an initial camera update to update EMP
      EMPWorldWind.eventHandlers.notifyViewChange.call(this, emp3.api.enums.CameraEventEnum.CAMERA_MOTION_STOPPED);

      // Initialize sec worker
      _initializeWebWorkers();

      this.throttleAddMultiPointRedraws = EMPWorldWind.utils.MultiPointRateLimit(EMPWorldWind.editors.EditorController.redrawMilStdSymbols, 1);
    },
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
    centerOnLocation: function(args) {
      var position;

      /**
       *
       * @param args
       * @returns {*}
       * @private
       */
      function _getLocation(args) {
        if (typeof args.altitude === "number") {
          return new WorldWind.Position(args.latitude, args.longitude, args.altitude);
        } else {
          return new WorldWind.Location(args.latitude, args.longitude);
        }
      }

      // Get the location
      position = _getLocation(args);

      // Set the navigator options
      this.worldWindow.navigator.heading = args.heading || 0;
      this.worldWindow.navigator.roll = args.roll || 0;
      this.worldWindow.navigator.tilt = args.tilt || 0;

      var _goToCompleteCallback = function() {
        // Notify the view has changed, this also triggers a re-render of any graphics in view
        EMPWorldWind.eventHandlers.notifyViewChange.call(this, emp3.api.enums.CameraEventEnum.CAMERA_MOTION_STOPPED);

        // Fire the original callback
        if (typeof args.animateCB === "function") {
          return args.animateCB();
        }
      }.bind(this);

      // Fire the move
      this.goToAnimator.travelTime = args.animate ? EMPWorldWind.constants.globeMoveTime : 0;
      this.goToAnimator.goTo(position, _goToCompleteCallback);
    },
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
    lookAt: function(args) {
      // substituting range for altitude for now
      if (args.range !== 0) {
        args.range = args.range || this.worldWindow.navigator.range;
      }

      var position = new WorldWind.Position(args.latitude, args.longitude, args.range);

      /**
       * @this {EMPWorldWind.Map}
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
    },
    /**
     * @param {emp.typeLibrary.Feature|EMPWorldWind.data.EmpFeature} feature
     * @param {PlotFeatureCB} [callback]
     */
    plotFeature: function(feature, callback) {
      /**
       * Handle the async plotFeature method
       * @private
       */
      var _callback = function(cbArgs) {
        if (cbArgs.success) {

          // Add the feature to the root layer
          this.rootLayer.addFeature(cbArgs.feature);

          // Add the new feature to the global list of features
          if (!(cbArgs.feature.id in this.features)) {
            this.features[cbArgs.feature.id] = cbArgs.feature;
          }

          // Trigger an update for the display
          this.worldWindow.redraw();
        }

        if (typeof callback === "function") {
          return callback(cbArgs);
        }
      }.bind(this);

      // Check if we are using a EMPWorldWind feature internally
      if (feature instanceof EMPWorldWind.data.EmpFeature) {
        feature = feature.feature;
      }

      if (!(feature.featureId in this.features)) {
        // Plot a new feature
        EMPWorldWind.editors.EditorController.plotFeature.call(this, feature, _callback);
      } else {
        // Update an existing feature
        EMPWorldWind.editors.EditorController.updateFeature.call(this, this.features[feature.featureId], feature, _callback);
      }
    },
    /**
     *
     * @param {emp.typeLibrary.Feature} feature
     */
    unplotFeature: function(feature) {
      var rc = {
        success: false,
        message: ""
      };

      /**
       * KML features are actually layers in WorldWind
       * @private
       */
      var _handleKMLFeature = function() {
        if (feature.coreId in this.layers) {
          // Remove it from the map
          this.worldWindow.removeLayer(this.layers[feature.coreId]);

          // Remove our record of the KML feature
          delete this.layers[feature.coreId];
          delete this.features[feature.coreId];

          // Update the map
          this.worldWindow.redraw();

          rc.success = true;
        }
        return rc;
      }.bind(this);

      /**
       * Remove the features normally
       * @private
       */
      var _handleDefaultFeature = function() {

        // Remove it from the layer
        this.rootLayer.removeFeature(feature);

        // Clear it from the selection hash
        this.removeFeatureSelection(feature.coreId);

        // Remove it from the global list of features
        delete this.features[feature.coreId];

        rc.success = true;

        // Update the map
        this.worldWindow.redraw();

        return rc;
      }.bind(this);


      if (feature.format === "kml") { // KML features are actually layers
        return _handleKMLFeature();
      }
      return _handleDefaultFeature();
    },
    /**
     *
     * @param {emp.typeLibrary.Selection[]} empSelections
     */
    selectFeatures: function(empSelections) {
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
    },
    /**
     * Adds a WMS layer to the map
     * @param {emp.typeLibrary.WMS} wms
     */
    addWMS: function(wms) {
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
    },
    /**
     * Removes a WMS layer from the map
     * @param {emp.typeLibrary.WMS|EMPWorldWind.data.EmpWMSLayer} wms
     */
    removeWMS: function(wms) {
      var layer,
        id = wms.coreId || wms.id;

      layer = this.getLayer(id);
      if (layer) {
        this.worldWindow.removeLayer(layer.layer);
        delete this.layers[layer.id];
        this.worldWindow.redraw();
      }
    },
    /**
     *
     * @param {emp.typeLibrary.KmlLayer} kml
     * @param {function} cb
     */
    addKML: function(kml, cb) {
      var kmlFilePromise,
        kmlLayer = new EMPWorldWind.data.EmpKMLLayer(kml);

      // // Build the KML file promise
      kmlFilePromise = new WorldWind.KmlFile(kmlLayer.url);
      kmlFilePromise
        .then(function(kmlFile) {
          // Construct the KML layer to hold the document
          var kmlRenderableLayer = new WorldWind.RenderableLayer(kmlLayer.id);
          kmlLayer.layer = kmlRenderableLayer;

          // Add the KML layer to the map
          kmlRenderableLayer.addRenderable(kmlFile);
          this.worldWindow.addLayer(kmlRenderableLayer);

          // Update the map
          this.worldWindow.redraw();

          // Record the layer so we can remove/modify it later
          this.layers[kmlLayer.id] = kmlLayer;
          if (typeof cb === "function") {
            return cb({
              success: true
            });
          }
        }.bind(this))
        .catch(function() {
          return cb({
            success: false,
            message: 'Failed to add KML Layer'
          });
        });
    },
    /**
     *
     * @param {emp.typeLibrary.KmlLayer} kml
     * @param {function} [cb]
     */
    removeKML: function(kml, cb) {
      if (kml.coreId in this.layers) {
        this.worldWindow.removeLayer(this.layers[kml.coreId].layer);
        delete this.layers[kml.coreId];
        this.worldWindow.redraw();
      }

      if (typeof cb === "function") {
        return cb({
          success: true
        });
      }
    },
    /**
     *
     * @param id
     * @returns {boolean}
     */
    isFeatureSelected: function(id) {
      return Boolean(this.empSelections.hasOwnProperty(id));
    },
    /**
     *
     * @param id
     * @returns {*}
     */
    getFeatureSelection: function(id) {
      if (this.isFeatureSelected(id)) {
        return this.empSelections[id];
      }

      return null;
    },
    /**
     * @param {emp.typeLibrary.WMTS} empWMTS
     * @param {EMPWorldWind.map~WMTSCallback} callback
     */
    addWmtsToMap: function(empWMTS, callback) {
      var rc = {
        success: false,
        message: ''
      };

      var xhr, url,
        async = true;

      var _createWMTSLayer = function(xmlDom) {
        var wmtsCapabilities, wmtsLayerCapabilities, wmtsConfig;

        wmtsCapabilities = new WorldWind.WmtsCapabilities(xmlDom);
        wmtsLayerCapabilities = wmtsCapabilities.getLayer(empWMTS.layer);
        wmtsConfig = WorldWind.WmtsLayer.formLayerConfiguration(wmtsLayerCapabilities);

        return new WorldWind.WmtsLayer(wmtsConfig);
      };


      // Handle getting capabilities
      var xhrSuccess = function() {
        var wmtsLayer;

        if (xhr.status === 200) {
          try {
            wmtsLayer = _createWMTSLayer(xhr.responseXML);

            this.worldWindow.addLayer(wmtsLayer);
            this.services[empWMTS.coreId] = wmtsLayer;

            this.worldWindow.redraw();

            rc.success = true;
          } catch (err) {
            rc.message = err.message;
          }

          if (typeof callback === "function") {
            return callback(rc);
          }
        }
      }.bind(this);

      // Handle getting error
      var xhrError = function() {
        callback({
          success: false,
          message: xhr.statusText
        });
      };

      try {
        url = empWMTS.url + "?SERVICE=WMTS&REQUEST=GetCapabilities&VERSION=1.0.0";

        // Configure the request
        xhr = new XMLHttpRequest();
        xhr.open("GET", url, async);
        xhr.callback = callback;
        xhr.onload = xhrSuccess;
        xhr.onerror = xhrError;

        // Make the request
        xhr.send();

        rc.success = true;
      } catch (err) {
        rc.message = err.message;
      }

      return rc;
    },
    /**
     * @param {emp.typeLibrary.WMTS} empWMTS
     */
    removeWmtsFromMap: function(empWMTS) {
      var rc = {
        success: false,
        message: ''
      };

      if (empWMTS.coreId in this.services) {
        this.worldWindow.removeLayer(this.services[empWMTS.coreId]);

        rc.success = true;
        this.worldWindow.redraw();
      } else {
        rc.message = 'No such service exists on the map';
      }

      return rc;
    },
    /**
     *
     * @param id
     */
    storeFeatureSelection: function(id) {
      this.empSelections[id] = id;
    },
    /**
     *
     * @param id
     * @returns {boolean}
     */
    removeFeatureSelection: function(id) {
      if (this.empSelections.hasOwnProperty(id)) {
        delete this.empSelections[id];
        return true;
      }

      return false;
    },
    /**
     *
     * @returns {*|null}
     */
    getSelections: function() {
      return this.empSelections;
    },
    /**
     *
     * @param id
     * @returns {boolean}
     */
    isFeaturePresent: function(id) {
      return Boolean(this.features.hasOwnProperty(id));
    },
    /**
     *
     * @param id
     * @returns {boolean}
     */
    isMultiPointPresent: function(id) {
      return Boolean(this.multiPointCollection.hasOwnProperty(id));
    },
    /**
     *
     * @param id
     * @returns {*}
     */
    getMultiPoint: function(id) {
      if (this.isMultiPointPresent(id)) {
        return this.multiPointCollection[id];
      }

      return null;
    },
    /**
     *
     * @param multiPoint
     */
    storeMultiPoint: function(multiPoint) {
      this.multiPointCollection[multiPoint.id] = multiPoint;
    },
    /**
     *
     * @param id
     * @returns {boolean}
     */
    removeMultiPoint: function(id) {
      if (this.multiPointCollection.hasOwnProperty(id)) {
        delete this.multiPointCollection[id];
        return true;
      }

      return false;
    },
    /**
     *
     * @param id
     * @returns {boolean}
     */
    isAirspacePresent: function(id) {
      return Boolean(this.airspaceCollection.hasOwnProperty(id));
    },
    /**
     *
     * @param id
     * @returns {*}
     */
    getAirspace: function(id) {
      if (this.isAirspacePresent(id)) {
        return this.airspaceCollection[id];
      }

      return null;
    },
    /**
     *
     * @param airspace
     */
    storeAirspace: function(airspace) {
      this.airspaceCollection[airspace.id || airspace.coreId] = airspace;
    },
    /**
     *
     * @param id
     * @returns {boolean}
     */
    removeAirspace: function(id) {
      if (this.airspaceCollection.hasOwnProperty(id)) {
        delete this.airspaceCollection[id];
        return true;
      }

      return false;
    },
    /**
     *
     * @returns {*|null}
     */
    getSinglePoints: function() {
      return this.singlePointCollection;
    },
    /**
     *
     * @param id
     * @returns {boolean}
     */
    isSinglePointPresent: function(id) {
      return Boolean(this.singlePointCollection.hasOwnProperty(id));
    },
    /**
     *
     * @param id
     * @returns {*}
     */
    getSinglePoint: function(id) {
      if (this.isSinglePointPresent(id)) {
        return this.singlePointCollection[id];
      }

      return null;
    },
    /**
     *
     * @param singlePoint
     */
    storeSinglePoint: function(singlePoint) {
      this.singlePointCollection[singlePoint.id] = singlePoint;
    },
    /**
     *
     * @param id
     * @returns {boolean}
     */
    removeSinglePoint: function(id) {
      if (this.isSinglePointPresent(id)) {
        delete this.singlePointCollection[id];
        return true;
      }

      return false;
    },
    /**
     *
     * @returns {number}
     */
    getSinglePointCount: function() {
      if (this.defined(this.singlePointCollection)) {
        return Object.keys(this.singlePointCollection).length;
      } else {
        return 0;
      }
    },
    /**
     *
     * @param id
     * @returns {boolean}
     */
    isSinglePointIdOnHoldPresent: function(id) {
      return Boolean(this.singlePointCollectionIdOnHold.hasOwnProperty(id));
    },
    /**
     *
     * @param id
     * @returns {*}
     */
    getSinglePointIdOnHold: function(id) {
      if (this.isSinglePointIdOnHoldPresent(id)) {
        return this.singlePointCollectionOnHold[id];
      }

      return null;
    },
    /**
     *
     * @param singlePointId
     */
    storeSinglePointIdOnHold: function(singlePointId) {
      this.singlePointCollectionIdOnHold[singlePointId] = singlePointId;
    },
    /**
     *
     * @param id
     * @returns {boolean}
     */
    removeSinglePointIdOnHold: function(id) {
      if (this.isSinglePointIdOnHoldPresent(id)) {
        delete this.singlePointCollectionIdOnHold[id];
        return true;
      }

      return false;
    },
    /**
     *
     * @returns {*}
     */
    getSinglePointsIdOnHold: function() {
      return this.singlePointCollectionIdOnHold;
    },
    /**
     *
     * @returns {*}
     */
    getSinglePointsIdOnHoldCount: function() {
      if (this.defined(this.singlePointCollectionIdOnHold)) {
        return Object.keys(this.singlePointCollectionIdOnHold).length;
      } else {
        return 0;
      }
    },
    /**
     *
     * @param {Array} styles
     */
    setLabelStyle: function(styles) {
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
    },
    /**
     * Expose a refresh
     */
    refresh: function() {
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
    },
    /**
     * Adjust the background contrast
     * @param {number} contrast Value from 0-100, 50 is default
     */
    setContrast: function(contrast) {
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
    },
    /**
     *
     * @param {emp.typeLibrary.Lock} lockState
     */
    setLockState: function(lockState) {
      if (lockState.lock === this.state.lockState) {
        // The same already, do nothing
        return;
      } else if (lockState.lock !== emp3.api.enums.MapMotionLockEnum.SMART_MOTION) {
        // We have changed lock states, make sure to stop auto-panning
        this.spinGlobe(false);
      }
      // Update the lock state
      this.state.lockState = lockState.lock;
    },
    /**
     * Spins the globe if autoPanning is enabled
     * @param {AutoPanParams|boolean} [pan]
     */
    spinGlobe: function(pan) {
      var step = this.worldWindow.navigator.range / (WorldWind.EARTH_RADIUS);

      /**
       *
       * @this EMPWorldWind.Map
       * @private
       */
      var _getVerticalPan = function() {
        if (this.state.autoPanning.up) {
          return step;
        } else if (this.state.autoPanning.down) {
          return -step;
        } else {
          return 0;
        }
      }.bind(this);

      /**
       *
       * @this EMPWorldWind.Map
       * @private
       */
      var _getHorizontalPan = function() {
        if (this.state.autoPanning.left) {
          return -step;
        } else if (this.state.autoPanning.right) {
          return step;
        } else {
          return 0;
        }
      }.bind(this);

      /**
       *
       * @param {AutoPanParams} pan
       * @private
       */
      var _cleanPanArgs = function(pan) {
        if (pan && pan.hasOwnProperty('state')) {
          delete pan['state'];
        }
        return pan;
      };

      /**
       * @this EMPWorldWind.Map
       * @private
       */
      var _allowPan = function() {
        return this.state.autoPanning.up ||
          this.state.autoPanning.left ||
          this.state.autoPanning.down ||
          this.state.autoPanning.right;
      }.bind(this);

      /**
       *
       * @private
       */
      var _notifyEMPPointer = function() {
        var coords = EMPWorldWind.utils.getEventCoordinates.call(this, this.state.lastInteractionEvent);
        coords.type = emp.typeLibrary.Pointer.EventType.MOVE;

        if (coords.lat !== undefined) {
          this.empMapInstance.eventing.Pointer(coords);
        }
      }.bind(this);

      /**
       *
       * @private
       */
      var _panMap = function() {
        var vertical, horizontal, goToPosition,
          travelTime = 250; // 250 ms

        // Get the pan directions
        vertical = _getVerticalPan();
        horizontal = _getHorizontalPan();

        // Get the location to pan to
        goToPosition = new WorldWind.Position(
          this.worldWindow.navigator.lookAtLocation.latitude + vertical,
          this.worldWindow.navigator.lookAtLocation.longitude + horizontal,
          this.worldWindow.navigator.range);

        // Set the travel time
        this.goToAnimator.travelTime = travelTime;

        // Update the state
        this.state.autoPanning.state = EMPWorldWind.constants.PAN_STATE.PANNING;

        // Notify EMP we are moving the camera
        EMPWorldWind.eventHandlers.notifyViewChange.call(this, emp3.api.enums.CameraEventEnum.CAMERA_IN_MOTION);

        // Fire the animation
        this.goToAnimator.goTo(goToPosition, function() {
          // Update EMP pointer location for moving control points
          _notifyEMPPointer();

          // Update the state to compete
          this.state.autoPanning.state = EMPWorldWind.constants.PAN_STATE.COMPLETE;

          // Check if we still need to pan
          if (_allowPan()) {
            _panMap();
          } else {
            // Our exit route, update the state
            this.state.autoPanning.state = EMPWorldWind.constants.PAN_STATE.HALTED;
            // Notify EMP we have stopped moving
            EMPWorldWind.eventHandlers.notifyViewChange.call(this, emp3.api.enums.CameraEventEnum.CAMERA_MOTION_STOPPED);
          }
        }.bind(this));
      }.bind(this);

      // Explicitly halting the animation and restoring the pan state to no motion
      if (pan === false) {
        this.goToAnimator.cancel();
        this.state.autoPanning = Object.assign({}, EMPWorldWind.constants.NO_PANNING);
        return;
      }

      // Make sure we don't overwrite the state internals
      pan = _cleanPanArgs(pan);

      // Update the panning state directions
      this.state.autoPanning = Object.assign({}, this.state.autoPanning, pan);

      // If we are still running a previous auto-pan animation return, the pan callback will use the updated state when it completes
      if (this.state.autoPanning.state === EMPWorldWind.constants.PAN_STATE.PANNING ||
        this.state.lockState !== emp3.api.enums.MapMotionLockEnum.SMART_MOTION) {
        return;
      }

      // Start the pan if the state is set to
      if (_allowPan()) {
        _panMap();
      }
    },
    /**
     * Returns a data URI of the current view of the canvas
     * @todo Handle iconURL within Placemarks
     * @returns {string}
     */
    screenshot: function() {
      // This forces webgl to render which exposes current context for the canvas.toDataURL function
      // Note: this is still lacking functionality as Placemarks are not rendered
      this.worldWindow.drawFrame();
      return this.worldWindow.canvas.toDataURL();
    },
    /**
     * Calculate the current bounds of the WorldWindow
     * @returns {Bounds}
     */
    getBounds: function() {
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
            this.worldWindow.navigator.heading + 45, -Math.PI / 3,
            new WorldWind.Location())
        };
      }

      return {
        north: topRight.position.latitude,
        south: bottomLeft.position.latitude,
        east: topRight.position.longitude,
        west: bottomLeft.position.longitude
      };
    },
    /**
     * Returns the center of focus of the map
     * @returns {{latitude: number, longitude:number}}
     */
    getCenter: function() {
      return this.worldWindow.navigator.lookAtLocation;
    },
    /**
     * Deletes and removes all features and layers on the map
     */
    shutdown: function() {
      this.features = {};
      this.layers = {};
      this.worldWindow = undefined;
    },
    /**
     * checks is map is moving outside an epsilon. This function is used
     * to reduce the calls to update the features of the map.
     */
    isMapMoving: function() {
      return (!EMPWorldWind.Math.equalsEpsilon(this.worldWindow.navigator.lookAtLocation.latitude, this.lastNavigator.lookAtLocation.latitude, this.optimizationMapMoveEpsilon)) ||
        (!EMPWorldWind.Math.equalsEpsilon(this.worldWindow.navigator.lookAtLocation.longitude, this.lastNavigator.lookAtLocation.longitude, this.optimizationMapMoveEpsilon)) ||
        (!EMPWorldWind.Math.equalsEpsilon(this.worldWindow.navigator.range, this.lastNavigator.range, EMPWorldWind.Math.EPSILON1)) ||
        (!EMPWorldWind.Math.equalsEpsilon(this.worldWindow.navigator.tilt, this.lastNavigator.tilt, this.optimizationMapMoveEpsilon)) ||
        (!EMPWorldWind.Math.equalsEpsilon(this.worldWindow.navigator.roll, this.lastNavigator.roll, this.optimizationMapMoveEpsilon)) ||
        (!EMPWorldWind.Math.equalsEpsilon(this.worldWindow.navigator.heading, this.lastNavigator.heading, this.optimizationMapMoveEpsilon));
    },
    /**
     *
     * @returns {PickedObjectList|*}
     */
    pickShapesInViewRegion: function() {
      var shapes;
      //var bound = this.getBounds();
      //var boundRectangle = new this.worldwind.Rectangle(new WorldWind.Location(this.worldWindow.navigator.lookAtLocation.latitude, this.worldWindow.navigator.lookAtLocation.longitude), this.worldWindow.viewport.width -1 , this.worldWindow.viewport.height - 1);
      // this.worldWindow.viewport
      var canvasCoordinates = this.worldWindow.canvasCoordinates(0, 0);
      //var screenLocation = new WorldWind.Location(this.worldWindow.navigator.lookAtLocation.latitude, this.worldWindow.navigator.lookAtLocation.longitude);
      var boundRectangle = new WorldWind.Rectangle(canvasCoordinates[0], canvasCoordinates[1], 5000, 4000);
      //var boundRectangle  = new WorldWind.Rectangle(0, 0 ,this.worldWindow.viewport.width -1 , this.worldWindow.viewport.height - 1);
      //var boundRectangle  = new WorldWind.Rectangle(this.worldWindow.canvas.width/2, this.worldWindow.canvas.height/2 ,this.worldWindow.viewport.width -1 , this.worldWindow.viewport.height - 1);

      shapes = this.worldWindow.pickShapesInRegion(boundRectangle);
      return shapes;
    },
    /**
     * checks if feature is within view area of map.
     * @param {emp.typeLibrary.Feature} empFeature object representing a feature (not a ww feature).
     */
    isMilStdMultiPointShapeInViewRegion: function(empFeature) {
      var p,
        coordinate,
        coords = empFeature.coordinates.length;

      // Highlight the items picked.
      if (!this.bounds) {
        this.bounds = this.getBounds();
      }

      /**
       *
       * @param coordinate
       * @param bounds
       * @returns {boolean}
       * @private
       */
      var _boundsContainsPoint = function(coordinate, bounds) {
        return (coordinate[0] <= bounds.east && coordinate[0] >= bounds.west) &&
          (coordinate[1] > bounds.south && coordinate[1] < bounds.north);
      };


      // TODO wait for fix for pickShapesInRegion to use this method
      // var _boundsContainLine = function(feature) {
      //   var pickList,
      //     clientRect = this.worldWindow.canvas.getBoundingClientRect(),
      //     canvasCoords = this.worldWindow.canvasCoordinates(clientRect.left, clientRect.top),
      //     region = new WorldWind.Rectangle(
      //       canvasCoords[0],
      //       canvasCoords[1],
      //       clientRect.width,
      //       clientRect.height);
      //
      //   pickList = this.worldWindow.pickShapesInRegion(region);
      //
      //   //window.console.debug(pickList, feature);
      //
      //   return false;
      // }.bind(this);
      //
      // if (_boundsContainLine(empFeature)) {
      //   return true;
      // }

      for (p = 0; p < coords; p++) {
        coordinate = empFeature.coordinates[p];
        if (_boundsContainsPoint(coordinate, this.bounds)) {
          return true;
        }
      }
      return false;
    },
    /**
     *
     * @param {string} color
     */
    setSelectionColor: function(color) {
      function _validateColor(color) {
        return color || this.state.selectionStyle.lineColor;
      }

      function _prefixColorString(color) {
        if (!color.startsWith("#")) {
          return "#" + color;
        }
        return color;
      }

      color = _validateColor(color);
      color = _prefixColorString(color);

      this.state.selectionStyle.lineColor = color;

      // Update all features
      _redrawAllFeatures.call(this);
    },
    /**
     *
     * @param {number} scale
     */
    setSelectionScale: function(scale) {
      this.state.selectionStyle.scale = scale;

      // Update all features
      _redrawAllFeatures.call(this);
    },
    /**
     *
     * @param {string|number} size
     */
    setIconSize: function(size) {
      if (typeof size === "string") {
        if (size in EMPWorldWind.constants.IconSize) {
          size = EMPWorldWind.constants.IconSize[size];
        } else {
          size = 1.0;
        }
      } else if (typeof size !== "number") {
        size = 1.0;
      }

      this.state.iconSize = size;

      _redrawAllFeatures.call(this);
    }
  };
}();
