/* global EMPWorldWind */

/**
 *
 * @param {object} args
 * @param {object} args.engine
 * @param {object} args.engine.properties
 * @param {boolean} [args.engine.properties.debug]
 * @param {object} args.engine.properties.layers
 * @param {string} args.engine.properties.elevationData
 * @param {string} args.engine.properties.defaultLayer URL of the base layer
 * @returns {{resourceList: Array, fnCreateInstance: createWorldWindInstance}}
 */
function initializeWorldwind(args) {
  args.engine = args.engine || {};
  args.engine.properties = args.engine.properties || {};
  args.engine.properties.layers = args.engine.properties.layers || {};
  args.engine.properties.defaultLayer = args.engine.properties.defaultLayer || '';

  var resourceList = [];

  function createWorldWindInstance(instArgs) {
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

      var elevationModel;
      // TODO generate an elevationModel with default data if none is specified
      // if (args.engine.properties.elevationData) {
      //   elevationModel = new WorldWind.EarthElevationModel(null, args.engine.properties.elevationData, 'Earth Elevations');
      // }

      var wwd = new WorldWind.WorldWindow(wwCanvas.id, elevationModel);

      // Tell the World Window that we want deep picking.
      wwd.deepPicking = true;

      // Add some image layers to the World Window"s globe.
      if (args.engine.properties.defaultLayer) {
        // TODO pass in config object
        var config = args.engine.properties.defaultLayer.config || {};
        config.sector = WorldWind.Sector.FULL_SPHERE;
        config.numLevels = 5;
        config.levelZeroTileData = new WorldWind.Location(45,45);
        config.imageFormat = 'image/png';
        config.tileWidth = 256;
        config.tileHeight = 256;

        wwd.addLayer(new WorldWind.RestTiledImageLayer(args.engine.properties.defaultLayer, null, 'default layer', config));
      } else {
        wwd.addLayer(new WorldWind.BMNGLayer());
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

      var empWorldWind = new EMPWorldWind.map(wwd);
      empWorldWind.initialize(instArgs.mapInstance);
      empWorldWind.isV2Core = false;

      instArgs.mapInstance.engine.initialize.succeed(empWorldWind);
    } catch (err) {
      instArgs.mapInstance.engine.initialize.fail(err);
    }
  }

  if (args.engine.properties.debug === true) {
    resourceList = [
      "worldwind.min.js",
      "worldwind-map-engine.debug.js",
      "EMPWorldWind.js",
      "data/EMPWorldWind.data.js",
      "data/EMPWorldWind.data.EmpLayer.js",
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
