/* global EMPWorldWind */

/**
 *
 * @param {object} args
 * @param {object} args.engine
 * @param {object} args.engine.properties
 * @param {boolean} [args.engine.properties.debug]
 * @param {object} args.engine.properties.layers
 * @returns {{resourceList: Array, fnCreateInstance: createWorldWindInstance}}
 */
function initializeWorldwind(args) {
  args.engine.properties.layers = args.engine.properties.layers || {};

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

      var wwd = new WorldWind.WorldWindow(wwCanvas.id);

      // Tell the World Window that we want deep picking.
      wwd.deepPicking = true;

      // Add some image layers to the World Window"s globe.
      wwd.addLayer(new WorldWind.BMNGLayer()); // wms
      //wwd.addLayer(new WorldWind.BMNGOneImageLayer());

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
      "worldwindlib.js",
      "worldwind-map-engine.debug.js",
      "EMPWorldWind.js",
      "data/EMPWorldWind.data.js",
      "data/EMPWorldWind.data.EmpLayer.js",
      "data/EMPWorldWind.data.EmpFeature.js",
      "utils/EMPWorldWind.constants.js",
      "utils/EMPWorldWind.utils.js",
      "controllers/editors/EMPWorldWind.editors.EditorController.js",
      "controllers/eventHandlers/EMPWorldWind.eventHandlers.js",
      "controllers/eventHandlers/EMPWorldWind.eventHandlers.mouse.js",
      "controllers/eventHandlers/EMPWorldWind.eventHandlers.touch.js",
      "controllers/eventHandlers/EMPWorldWind.eventHandlers.drag.js",
      "controllers/eventHandlers/EMPWorldWind.eventHandlers.pointer.js"
    ];
  } else {
    resourceList = [
      "worldwindlib.js",
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
