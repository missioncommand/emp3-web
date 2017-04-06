/* global EMPWorldWind */

/**
 *
 * @param {object} args
 * @param {object} args.engine
 * @param {object} args.engine.properties
 * @param {boolean} [args.engine.properties.debug]
 * @param {object} [args.engine.properties.layers]
 * @param {string} [args.engine.properties.elevationData]
 * @param {WMSDescriptor[]|TileServiceDescriptor[]} [args.engine.properties.defaultLayers] List of URL of the base layers
 * @returns {{resourceList: Array, fnCreateInstance: createWorldWindInstance}}
 */
function initializeWorldwind(args) {
  args.engine = args.engine || {};
  args.engine.properties = args.engine.properties || {};
  args.engine.properties.layers = args.engine.properties.layers || {};
  args.engine.properties.defaultLayers = args.engine.properties.defaultLayers || [];

  /**
   * Generates the correct list of resource files
   * @param args
   * @private
   */
  function _generateResourceList(args) {
    var debug, resourceList;

    try {
      debug = args.engine.properties.debug;
    } catch (err) {
      debug = false;
    }

    if (debug) {
      resourceList = [
        "worldwind.js",
        "worldwind-map-engine.js",
        "EMPWorldWind.js",
        "data/EMPWorldWind.data.js",
        "data/EMPWorldWind.data.EmpLayer.js",
        "data/EMPWorldWind.data.EmpWMSLayer.js",
        "data/EMPWorldWind.data.EmpFeature.js",
        "utils/EMPWorldWind.constants.js",
        "utils/EMPWorldWind.utils.js",
        "controllers/editors/EMPWorldWind.editors.primitiveBuilders.js",
        "controllers/editors/EMPWorldWind.editors.EditorController.js",
        "controllers/eventHandlers/EMPWorldWind.eventHandlers.js",
        "controllers/eventHandlers/EMPWorldWind.eventHandlers.mouse.js",
        "controllers/eventHandlers/EMPWorldWind.eventHandlers.touch.js",
        "controllers/eventHandlers/EMPWorldWind.eventHandlers.drag.js",
        "controllers/eventHandlers/EMPWorldWind.eventHandlers.pointer.js",
        "renderer/MPCWorker.js",
        "renderer/savm-bc.js",
        "renderer/savm-bc.min.js"
      ];
    } else {
      resourceList = [
        "worldwind.min.js",
        "emp3-worldwind.min.js",
        "renderer/MPCWorker.js",
        "renderer/savm-bc.js",
        "renderer/savm-bc.min.js"
      ];
    }
    return resourceList;
  }

  function createWorldWindInstance(instArgs) {
    var empWorldWind, container, wwCanvas, wwd, layers, uiComponents;

    function _addDefaultLayer(wwd) {
      // Always add a default layer
      var blueMarbleDefault = new WorldWind.BMNGOneImageLayer();
      blueMarbleDefault.minActiveAltitude = 0; // Don't let it disappear in case no other layers exist
      wwd.addLayer(blueMarbleDefault);
    }

    function _addConfigLayers(wwd, layers) {
      var i,
        layerDict = {
          "wms": function(descriptor) {
            descriptor.sector = descriptor.sector || WorldWind.Sector.FULL_SPHERE;
            descriptor.levelZeroDelta = descriptor.levelZeroDelta || new WorldWind.Location(45, 45);
            descriptor.numLevels = descriptor.numLevels || 15;
            descriptor.format = descriptor.format || "image/png";
            descriptor.size = descriptor.size || 256;

            return new WorldWind.WmsLayer(descriptor);
          }
        };

      // Add some image layers to the World Window"s globe.
      var numLayers = layers.length;

      for (i = 0; i < numLayers; i++) {
        var layer,
          descriptor = layers[i];

        if (!descriptor.type) {
          window.console.warn('No type specified for layer data; skipping it');
          continue;
        }

        if (layerDict.hasOwnProperty(descriptor.type.toLowerCase())) {
          layer = layerDict[descriptor.type.toLowerCase()](descriptor);
          wwd.addLayer(layer);
        }
      }
    }

    function _addUIComponents(wwd, args) {
      if (args.compass) {
        wwd.addLayer(new WorldWind.CompassLayer());
      }
      if (args.coordinates) {
        wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
      }
      if (args.controls) {
        wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));
      }
    }

    // Create WorldWind
    try {
      instArgs.mapInstance.engine = new emp.engineDefs.worldWindMapEngine({
        mapInstance: instArgs.mapInstance
      });

      container = document.getElementById(instArgs.mapInstance.container.get());

      wwCanvas = document.createElement("canvas");
      wwCanvas.setAttribute("id", instArgs.mapInstance.mapInstanceId + "_canvas");
      wwCanvas.style.height = "100%";
      wwCanvas.style.width = "100%";
      container.appendChild(wwCanvas);

      // TODO pass in an elevationModel that uses local dat
      wwd = new WorldWind.WorldWindow(wwCanvas.id);

      // Tell the World Window that we want deep picking.
      wwd.deepPicking = true;

      // Add default and configured layers
      _addDefaultLayer(wwd);

      // Add layers from the config
      try {
        layers = args.engine.properties.defaultLayers;
      } catch (err) {
        layers = [];
      }
      _addConfigLayers(wwd, layers);

      // Add a compass, a coordinates display and some view controls to the World Window.
      try {
        uiComponents = args.engine.properties.layers;
      } catch (err) {
        uiComponents = {
          compass: false,
          coordinates: false,
          controls: false
        };
      }
      _addUIComponents(wwd, uiComponents);

      // Register WorldWind with EMP
      empWorldWind = new EMPWorldWind.Map(wwd);
      empWorldWind.initialize(instArgs);
      instArgs.mapInstance.engine.initialize.succeed(empWorldWind);
    } catch (err) {
      instArgs.mapInstance.engine.initialize.fail(err);
      window.console.log("+++++++++++++error initializing engine: " + err);
    }
  }

  return {
    resourceList: _generateResourceList(args),
    fnCreateInstance: createWorldWindInstance
  };
}

emp.instanceManager.registerMapEngine({
    mapEngineId: emp.constant.mapEngineId.WORLD_WIND,
    fnInitialize: initializeWorldwind
  }
);

/**
 * @typedef {object} WMSDescriptor
 * @property {string} service
 * @property {string} layerNames comma separated list
 * @property {WorldWind.Sector} sector
 * @property {WorldWind.Location} levelZeroDelta
 * @property {number} numLevels
 * @property {string} format example 'image/png'
 * @property {number} size
 * @property {string} [coordinateSystem]
 * @property {string} [styleNames]
 */

/**
 * @typedef {object} TileServiceDescriptor
 * @property {WorldWind.Sector} [sector=WorldWind.Sector.FULL_SPHERE]
 * @property {WorldWind.Location} [levelZeroTileData = '45,45']
 * @property {number} [numLevels=5]
 * @property {string} [imageFormat ='image/jpeg']
 * @property {number} [tileWidth=256]
 * @property {number} [tileHeight=256]
 */
