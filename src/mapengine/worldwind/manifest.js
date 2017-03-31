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

  var resourceList = [];

  function createWorldWindInstance(instArgs) {
    var i;

    try {
      instArgs.mapInstance.engine = new emp.engineDefs.worldWindMapEngine({
        mapInstance: instArgs.mapInstance
      });

      var container = document.getElementById(instArgs.mapInstance.container.get());

      var wwCanvas = document.createElement("canvas");
      wwCanvas.setAttribute("id", instArgs.mapInstance.mapInstanceId + "_canvas");
      wwCanvas.style.height = "100%";
      wwCanvas.style.width = "100%";
      container.appendChild(wwCanvas);

      // TODO pass in an elevationModel that uses local dat
      var wwd = new WorldWind.WorldWindow(wwCanvas.id);

      // Tell the World Window that we want deep picking.
      wwd.deepPicking = true;

      // Always add a default layer
      var blueMarbleDefault = new WorldWind.BMNGOneImageLayer();
      blueMarbleDefault.minActiveAltitude = 0; // Don't let it disappear in case no other layers exist
      wwd.addLayer(blueMarbleDefault);

      // Add some image layers to the World Window"s globe.
      var numLayers = args.engine.properties.defaultLayers.length;

      for (i = 0; i < numLayers; i++) {
        var layer,
          descriptor = args.engine.properties.defaultLayers[i];

        if (!descriptor.type) {
          window.console.warn('No type specified for layer data; skipping it');
          continue;
        }

        switch (descriptor.type.toLowerCase()) {
          case "wms":
            // Handle defaults
            descriptor.sector = descriptor.sector || WorldWind.Sector.FULL_SPHERE;
            descriptor.levelZeroDelta = descriptor.levelZeroDelta || new WorldWind.Location(45, 45);
            descriptor.numLevels = descriptor.numLevels || 15;
            descriptor.format = descriptor.format || "image/png";
            descriptor.size = descriptor.size || 256;

            layer = new WorldWind.WmsLayer(descriptor);
            break;
          case "arcgis93rest":
          case "wmts":
          default:
          // Not yet supported
        }

        // Add the layer
        if (layer) {
          wwd.addLayer(layer);
        }
      }

      // Add a compass, a coordinates display and some view controls to the World Window.
      if (args.engine.properties.layers.compass) {
        wwd.addLayer(new WorldWind.CompassLayer());
      }
      if (args.engine.properties.layers.coordinates) {
        wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
      }
      if (args.engine.properties.layers.controls) {
        wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));
      }

      var empWorldWind = new EMPWorldWind.Map(wwd);
      empWorldWind.initialize(instArgs);
      instArgs.mapInstance.engine.initialize.succeed(empWorldWind);
    } catch (err) {
      instArgs.mapInstance.engine.initialize.fail(err);
      window.console.log("+++++++++++++error initializing engine: " + err);
    }
  }

  if (args.engine.properties.debug === true) {
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
      "controllers/eventHandlers/EMPWorldWind.eventHandlers.pointer.js"
    ];
  } else {
    resourceList = [
      "worldwind.min.js",
      "emp3-worldwind.min.js"
    ];
  }

  return {
    resourceList: resourceList,
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
