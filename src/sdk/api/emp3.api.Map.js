if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

/**
 * @extends emp3.api.Container
 * @classdesc Creates and displays Map instance.  Creating a map will initialize and
 * display the map engine.  The Map object allows you to control the view,
 * add features, overlays, and map services, draw, edit
 * existing data, query available data as well as number of other things.
 * <p>
 * A map displays features, overlays, and map services.  To add features to the map
 * you must first create and add an overlay. Overlays allow users to create groups of related
 * features together.  Overlays can be turned on or off to display or hide
 * its contained features.  Once the overlay is on the map, features can be added
 * into the overlay.  Overlays can contain features or other overlays. Features
 * cannot be added to the map directly, they must be added directly to an
 * overlay object.
 * <p>
 * To create a map you will first need to know which map engine you want to load.
 * There are a number of map engines included with this distribution.
 * The map currently is packaged with Cesium, Leaflet, and
 * WebWorldwind. The map engine displayed is entirely up to you.  When
 * you create the map you are required to enter an 'engine' parameter. The engine
 * parameter takes a emp3.api.MapEngine object.  For the engine parameter you will need to
 * make sure the map engine source code was deployed on your web server.  Depending on
 * your distribution, you may have a directory called emp3-cesium or a war file
 * called emp3-cesium.war (or emp3-leaflet or emp3-worldwind).  In the map constructor, set the
 * engine.engineBasePath to the relative location of the engine you are using. For instance, if
 * emp3-cesium directory is inside your application, set the engineBasePath to './emp3-cesium'.
 * You are also required to give your map engine a unique id.  This can be something
 * as simple as 'cesium'.  You will use this id only if you ever switch to
 * a different map engine.
 * <p>
 * The engine parameter also has two additional optional properties: 'manifestFileName' and 'properties'.
 * The 'manifestFileName' parameter allows you to configure which file is initially
 * loaded when the engine is called. The manifest file should bootstrap the loading
 * of the javascript files which loads up the map engine.
 * By default, this will loads the file 'manifest.js'.  Normally, you will not
 * have to set this, but there are a few edge cases you may want to change manifests.
 * <p>
 * Finally engine.properties sets some unique map engine specific properties.  These
 * properties differ from engine to engine.
 * <p>
 * The default behavior of the map, is to add the map as an embedded component
 * into a web application. This default
 * behavior is known as the "environment" of the map.  The default environment for map
 * is "browser". When using the "browser" environment, you need to
 * create an HTML div element and give it an id.  The id of that div should be
 * entered into the 'container' parameter of the constructor.
 * <p>
 * The map will also let you bypass the default environment settings and rather than
 * displaying the map as an embedded component it can be a stand-alone app
 * in some third party frameworks.  To change the default environment settings,
 * set the 'environment' parameter of the constructor to 'iwc' (OZP inter widget
 * communication), 'owf' (Ozone Widget Framework), 'starfish'.  Some environments
 * may require additional constructor parameters to be set.  For example, if the
 * environment is 'iwc' you must set the 'iwchost'.
 * <p>
 * The map's methods will not operate until it has negotiated a handshake
 * with its underlying map engine. Once it detects the map is "ready" (emp3.api.enums.MapStateEnum.MAP_READY),
 * you may begin calling the map object's methods.  If a call
 * is made prior to the map being ready, you will receive an exception.
 * Use the onSuccess callback to determine that the map has finished
 * initializing and is ready to start receiving commands.
 * <p>
 * The map object created should not be destroyed or go out of scope. Without
 * the map object you cannot control the map.
 * <p>
 *
 * @example <caption>Embedded HTML</caption>
 *
 * // Create a new Map and embed it on your web page.
 * // Start by configuring EMP.
 * emp3.api.global.configuration.urlProxy = "../../urlproxy.jsp";
 *
 * // Then construct a map with the cesium map engine.
 * var map1 = new emp3.api.Map({
 *    container: "map-container",
 *    engine: {
 *      "engineBasePath": "./emp3-cesium",
 *      "mapEngineId": 'cesiumMapEngine'
 *      }
 *    },
 *    onSuccess: function() {
 *      // load initial data...
 *    }
 * });
 *
 *
 * <p>
 *
 * @constructor
 *
 * @param {Object} args The constructor arguments for the map.
 *
 * @param {MapEngine} args.engine A map engine configuration object.
 *
 * @param {String} [args.environment='browser'] The environment for which the
 * map instance will interact with.  Either 'browser', 'iwc', 'owf', or 'starfish'
 *
 * @param {String} [args.container] The id of a div element in the HTML.  This is for embedding
 * the map directly in HTML.  This is a required parameter if the environment is set to
 * 'browser' which is the default value.
 *
 * @param {String} [args.iwcHost] The iwc host for which the map instance will communicate with.  Required
 * if the environment parameter is set to 'iwc'.
 *
 * @param {Bounds} [args.bounds] The location the map will start at.  Can be specified by passing in max north,
 * south, east, west bounds or by a center and a range or scale value. The map will do its best to center
 * on the bounds provided but it may not be the exact bounds.  This is because the map's aspect ration may
 * be different then the aspect ration of the map, or because the map may be 3D and the view may not easily
 * conform to exact specifications of bounds and scales.  If not set, the map will default to
 * the engines default position.
 *
 * @param {emp3.api.enums.IconSizeEnum} [args.iconSize = {@link emp3.api.enums.IconSizeEnum|SMALL}]
 * Default size for MIL-STD-2525 icons.
 *
 * @param {Number} [args.backgroundBrightness = 50] Lightens or darkens the background map.  Value can be
 * 0-100 with 50 as default. At 50, the map background is displayed without any
 * modifications.  Below 50 the map background will get darker and above 50 the
 * map background will get lighter. At zero the map background is fully black.  At 100
 * the map is fully white.
 *
 * @param {emp3.api.enums.MilStdLabelSettingEnum} [args.milStdLabels = {@link emp3.api.enums.MilStdLabelSettingEnum|COMMON_LABELS}]
 * Sets which labels will display for single point MIL-STD-2525 symbols.  By default,
 * the map will only display the common labels: unique designation, higher formation,
 * additional information and common name.
 *
 * @param {Number} [args.farDistanceThreshold = 600000] Sets the altitude (in meters)
 * at which point MIL-STD-2525 warfighting symbols
 * will display as dots. Below this
 * altitude the warfighting symbols will show normally (without labels) until
 * it hits the mid-distance threshold. At the mid-distance threshold,
 * the MIL-STD-2525 symbols will display with
 * labels according to {@link emp3.api.Map#getMilStdLabels|Map.getMilStdLabels}.
 *
 * @param {Number} [args.midDistanceThreshold = 20000] Sets the altitude in
 * meters at which point MIL-STD-2525 warfighting symbols
 * will show labels.
 * Above this altitude the MIL-STD-2525 symbols will not show labels.
 * To always
 * show labels, set the mid-distance threshold {@link emp3.api.Map#setMidDistanceThreshold|Map.setMidDistanceThreshold}
 * to be equal to {@link emp3.api.Map#setFarDistanceThreshold|Map.setFarDistanceThreshold}.
 *
 * @param {bool} [args.recorder = false] A debugging tool that records all the messages
 * coming into the map.  The recording can be saved and sent to the map developers.
 * When recorder is set to true, the map will display recording tools (record, stop, save and clear).
 *
 * @param {SuccessCallback} [args.onSuccess]
 * Function to call after the map has been initialized.
 *
 * @param {ErrorCallback} [args.onError] Function to call when an error occurs.
 */
emp3.api.Map = function(args) {
  var callInfo,
    mhInstance,
    urlEnv;

  /* eslint-disable no-console*/
  console.log("EMP3 web %s", emp3.api.global.version);
  /*eslint-enable no-console*/
  args = args || {};

  // Use args parameter or if it is not present set it to browser
  this.environment = args.environment || "browser";

  // Check for an override of the environment in the URL query string
  urlEnv = emp.util.getParameterByName('empenv');
  if (urlEnv !== null) {
    switch (urlEnv) {
      case "iwc":
        this.environment = "iwc";
        break;
      case "starfish":
        this.environment = "starfish";
        break;
      case "owf":
        this.environment = "owf";
        break;
      default:
        break;
    }
  }


  // Verify container/environment is correct.
  if (!args.container && this.environment === "browser" && args.container !== '') {
    throw new Error("The container argument must be populated if environment is set to 'browser'");
  }

  // Check for an override of the IWC Host URL in the URL query string. If not present, use args parameter.
  args.iwcHost = emp.util.getParameterByName('iwchost') || args.iwcHost;
  // This needs to stay here so it is properly set before trying to initialize the environment
  emp.environment.iwc.iwcHost = args.iwcHost;


  // Verify iwc/environment is correct.
  if (!args.iwcHost && this.environment === "iwc") {
    throw new Error("No iwcHost attribute was provided in emp3.api.Map args object nor an iwchost parameter present " +
      "in the URL querystring. EMP cannot use the IWC environment without a specified iwchost pointing to the " +
      "IWC location to be used by all participating applications.");
  }

  // The readiness state of the map.  If not set to ready, then the map cannot
  // be used yet.
  this.status = emp3.api.enums.MapStateEnum.MAP_NEW;

  // The instance ID of the map set by the Map API, will be populated after the map is
  // instantiated.
  this.geoId = undefined;

  /**
   * The current map bounds. Do not set the bounds by changing this field.
   * @member {Bounds}
   */
  this.bounds = {
    north: undefined,
    south: undefined,
    east: undefined,
    west:undefined
  };

  // Stores the engine information to be used with this map instance.
  this.engine = args.engine;

  // Stores the callbacks for success and failure.
  args.onSuccess = args.onSuccess || function() {};
  args.onError = args.onError || function() {};

  // holds current transactions for editing,  drawing, and freehand draw.  When
  // not drawing , editing, or freehand  these should be null.
  this.drawTransaction = null;
  this.editTransaction = null;
  //this.freehandTransaction = null;

  // If a default bounds was passed in, verify the values.
  if (args.bounds) {
    if (args.bounds.north === undefined || args.bounds.south === undefined || args.bounds.east === undefined || args.bounds.west === undefined) {
      throw new Error("Invalid parameter bounds: bounds must contain at least north, east, south, and west");
    }
  }

  // Verify engine argument is correct.
  if (!args.engine) {
    throw new Error("An 'engine' argument must be populated");
  }
  if (!args.engine.engineBasePath) {
    throw new Error("An 'engineBasePath' argument must be populated");
  }
  if (!args.engine.mapEngineId) {
    throw new Error("An 'mapEngineId' argument must be populated");
  }

  // if engine instance properties have not been created, set them.
  if (!args.engine.properties) {
    args.engine.properties = {};
  }

  // if engine is defined, pass the map engine properties to the engine
  // if not already set.
  // set the default icon size
  if (args.iconSize !== undefined) {
    this.iconSize = args.iconSize;
  } else {
    this.iconSize = emp3.api.enums.defaultIconSize;
  }
  args.engine.properties.iconSize = this.iconSize;

  // set the default MIL-STD-2525 label settings.
  if (args.milStdLabels !== undefined) {
    this.milStdLabels = args.milStdLabels;
  } else {
    this.milStdLabels = emp3.api.enums.defaultMilStdLabelSetting;
  }
  args.engine.properties.milStdLabels = this.milStdLabels;


  if (args.backgroundBrightness !== undefined) {
    this.brightness = args.backgroundBrightness;
  } else {
    this.brightness = 50;
  }
  args.engine.properties.brightness = this.brightness;

  // Turn on or off rendering optimization for MIL-STD-2525 warfighting symbols.
  if (args.renderingOptimization !== undefined) {
    this.renderingOptimization = args.renderingOptimization;
  } else {
    this.renderingOptimization = true;
  }
  args.engine.properties.renderingOptimization = this.renderingOptimization;

  // set the default threshold values for MIL-STD-2525 warfighting symbols
  if (args.midDistanceThreshold !== undefined) {
    this.midDistanceThreshold = args.midDistanceThreshold;
  } else {
    this.midDistanceThreshold = emp3.api.enums.defaultMidDistanceThreshold;
  }
  args.engine.properties.midDistanceThreshold = this.midDistanceThreshold;

  if (args.farDistanceThreshold !== undefined) {
    this.farDistanceThreshold = args.farDistanceThreshold;
  } else {
    this.farDistanceThreshold = emp3.api.enums.defaultFarDistanceThreshold;
  }
  args.engine.properties.farDistanceThreshold = args.farDistanceThreshold;

  // Set the default string for the manifestName property if needed.
  args.engine.manifestName = args.engine.manifestName || "manifest.js";

  var oThis = this;

  // Retrieve the message handler
  mhInstance = emp3.api.MessageHandler.getInstance({
    environment: this.environment,
    iwcHost: args.iwcHost,
    container: args.container
  });

  // This callback will be called after the map is instantiated.
  // After it is instantiated we want to determine if the map is ready. to
  // be added.
  var mapInstantiatedSuccess = function(cbArgs) {
    // Retrieve the map's instance id from the arguments.  This will
    // be passed back and can only be generated by the map.
    oThis.geoId = cbArgs.id;
    oThis.status = emp3.api.enums.MapStateEnum.MAP_READY;
    // Notify the user when the map returns.
    callInfo = {
      mapId: oThis.geoId,
      source: oThis,
      method: "Map",
      args: args
    };
    // SHOULD NOT HAVE TO DO THIS HERE --- ISN'T THERE A BETTER WAY?
    // register the map with the message handler.
    mhInstance.registerMap(oThis);
    args.onSuccess({
      callInfo: callInfo,
      source: callInfo.source,
      args: callInfo.args,
      failures: cbArgs.failures
    });
    // TODO need to get the initial bounds
  };

  // If a container is provided, load the map into the container.
  if (args.container && args.container !== "") {
    //  The div that will contain the map.
    this.container = args.container;
    // setTimeout() is used to allow the map to finish construction before spawnMap() executes
    setTimeout(function() {
      mhInstance.spawnMap({
        map: oThis,
        defaultExtent: args.bounds,
        container: args.container,
        engine: oThis.engine,
        environment: oThis.environment,
        recorder: args.recorder,
        onSuccess: mapInstantiatedSuccess,
        onError: function(args) {
          window.console.error(args);
        }
      });
    }, 0);
  }
  else if (args.spawnMap) {
    // if spawn map has been set, then we are in an Ozone environment,
    // containerId will contain the name of the widget we want to launch.
    // setTimeout() is used to allow the map to finish construction before spawnMap() executes
    setTimeout(function() {
      mhInstance.spawnMap({
        map: this,
        defaultExtent: args.bounds,
        container: args.mapWidgetName || 'CPCE Map',
        engine: this.engine,
        environment: oThis.environment,
        onSuccess: mapInstantiatedSuccess,
        onError: function(args) {
          window.console.error(args);
        }
      });
    }.bind(this), 0);
  }
  else {
    // Set the map's id to "broadcast".
    // This indicates the map is not meant for a specific
    // map instance and broadly will add to any map
    // that is also a broadcast map.  This is how the
    // Map API behaved prior to v3.
    //
    // For backwards compatibility for CPCE
    // v2 behavior.
    this.geoId = "broadcast";
    // this.status = emp3.api.enums.MapStateEnum.MAP_READY;
    mhInstance.registerMap(this);
    // just wait for the map ready event.
    // Notify the user when the map returns.
    callInfo = {
      mapId: this.geoId,
      source: this,
      method: "Map",
      args: args
    };

    mhInstance.notifyOnReady({
      callInfo: callInfo,
      args: {
        id: this.geoId,
        onSuccess: function() {
          oThis.status = emp3.api.enums.MapStateEnum.MAP_READY;
          args.onSuccess({
            callInfo: callInfo,
            source: callInfo.source,
            args: callInfo.args,
            failures: []
          });
        },
        onError: function(args) {
          window.console.error(args);
        }
      }
    });
    this.status = emp3.api.enums.MapStateEnum.MAP_READY;
  }
};

// Extend container
emp3.api.Map.prototype = new emp3.api.Container();

/**
 * @typedef {Object} MapEngine Configuration settings for a map engine.
 *
 * @property {String} engineBasePath A relative or full URL specifying the location
 * of a map engine.
 * @property {String} mapEngineId Unique identifier for the map engine to be loaded.
 * @property {String} [manifestName] The name of the map engine's manifest file. Each
 * map engine has a manifest file associated with it. This manifest file
 * bootstraps the engine.
 * @property {CesiumProperties | LeafletProperties | WorldwindProperties} [properties]
 * A JSON object containing additional configuration
 * properties for the map engine to be loaded. These properties may vary from engine to engine.
 */

/**
 * @typedef {Object} CesiumProperties The configurable properties for the
 * Cesium map engine. This should be used for the the MapEngine.properties field.
 *
 * @property {String} [defaultImageryUrl] A URL to a WMS server that will provide
 * the default globe background for Cesium.  If no url is provided, Cesium
 * provides its own.
 * @property {Object} [cesiumNavigation] Contains the options to display the
 * Cesium navigation tools.
 * @property {boolean} [cesiumNavigation.enableCompass] Displays the compass
 * that shows the which direction the map is aligned.  Clicking on north will
 * reset the globe's direction back to north.
 * @property {boolean} [cesiumNavigation.enableZoomControls] Displays the
 * "plus" and "minus" zoom out and zoom in buttons that zoom at a fixed distance.
 * @property {boolean} [cesiumNavigation.distanceLegend] Shows the distance legend
 * that estimates the measurements of the distance on the map for a fixed width
 * @property {boolean} [renderingOptimization] Turns on or off rendering optimization
 * for drawing MIL-STD-2525 single point graphics.  When rendering optimization is
 * turned on, MIL-STD-2525 single points will render as dots when the camera goes
 * higher than a specified altitude.  Below the far threshold, the single points
 * will display in their correct appearance, but with no labels.  When they zoom
 * past the midpoint threshold, they will display normal with labels.  This
 * greatly increases the number of symbols and ability for the map to
 * Rendering optimization
 * @property {number} [midDistanceThreshold] The
 * altitude at which below single point MIL-STD-2525 symbols will display with
 * labels, and above, they will display without labels.
 * @property {number} [farDistanceThreshold] The
 * altitude at which above single point MIL-STD-2525 symbols will display as colored
 * dots.
 * @property {boolean} [debug] Set to true to avoid using the minified version
 * of the Cesium engine files.
 */

/**
 * @typedef {Object} LeafletProperties
 *
 * @property {Object} [data] Specifies the default background for Leaflet.
 * Without specifying the default background Leaflet will show a plain grey
 * background.
 * @property {String} [data.Default_Tile_Map_Server_URL] A Tile Layer URL in the
 * format of a Leaflet URL template object ({@link http://leafletjs.com/reference.html#url-template}).
 * Details of tile layer format can be found at {@link http://doc.arcgis.com/EN/ARCGIS-ONLINE/REFERENCE/tile-layers.htm}.
 * @property {number} [data.Minimum_Zoom_Level] Minimum zoom level of the map.
 * @property {number} [data.Maximum_Zoom_Level] Maximum zoom level of the map.
 * @property {boolean} [data.Use_Proxy_For_Default_Map_Request = false] Determines
 * if the map's proxy will be used to request the map specified in Default_Tile_Map_Server_URL.
 * You would only use this if the map was not reachable because it is cross domain
 * and there isn't a viable proxy that can be used.
 * @property {boolean} [renderingOptimization] Turns on or off rendering optimization
 * for drawing MIL-STD-2525 single point graphics.  When rendering optimization is
 * turned on, MIL-STD-2525 single points will render as dots when the camera goes
 * higher than a specified altitude.  Below the far threshold, the single points
 * will display in their correct appearance, but with no labels.  When they zoom
 * past the midpoint threshold, they will display normal with labels.  This
 * greatly increases the number of symbols and ability for the map to
 * Rendering optimization
 * @property {number} [midDistanceThreshold] The
 * altitude at which below single point MIL-STD-2525 symbols will display with
 * labels, and above, they will display without labels.
 * @property {number} [farDistanceThreshold] The
 * altitude at which above single point MIL-STD-2525 symbols will display as colored
 * dots.
 * @property {boolean} [debug] Set to true to avoid using the minified version
 * of the Leaflet engine files.
 *
 */

/**
 * @typedef {Object} WorldwindProperties
 *
 * @property {Object} layers Contains the options to display the Web
 * Worldwind navigation tools.
 * @property {boolean} [layers.controls = false] Set to true to display the
 * navigation controls for the map.
 * @property {boolean} [layers.compass = false] Displays the compass
 * that shows the which direction the map is aligned.  Clicking on north will
 * reset the globe's direction back to north.
 * @property {boolean} [layers.coordinates = false] Displays the coordinates
 * of where the mouse is.
 * @property {boolean} [debug] Set to true to avoid using the minified version
 * of the Web Worldwind engine files.
 */

/**
 * @typedef {Object} Bounds Represents the view of a map.  The map bounds can be represented
 * by either specifying the max bounds of the view, or by specifying the center and range or scale.
 *
 * @property {Number} north The north-most bounds of the extent
 * @property {Number} south The south-most bounds of the extent
 * @property {Number} east The east-most bounds of the extent
 * @property {Number} west The west-most bounds of the extent
 */

/**
 * A callback indicating success in an operation involving a {@link emp3.api.MapService|MapService}
 * @callback onSuccessMapServiceCallback
 *
 * @param {Object} cbArgs - The parameters are passed in as members of the args
 * object.
 * @param {emp3.api.MapService} cbArgs.mapService The map service that was added
 * or removed.
 *
 */

/**
 * A callback indicating success in returning a group of Overlays.
 *
 * @callback onSuccessOverlaysCallback
 *
 * @param {Object} cbArgs - The parameters are passed in as members of the args
 * object.
 *
 * @param {emp3.api.Overlay[]} cbArgs.overlays - An array of emp3.api.Overlay objects.
 *
 * @param {Array} cbArgs.failures - Any failures that occurred while executing the call.
 *
 */

/**
 * A callback indicating success in returning a group of Features.
 *
 * @callback onSuccessFeaturesCallback
 *
 * @param {Object} cbArgs - The parameters are passed in as members of the args
 * object.
 *
 * @param {emp3.api.Feature[]} cbArgs.features - An array of emp3.api.Feature objects.
 *
 * @param {Array} cbArgs.failures - Any failures that occurred while executing the call.
 *
 */

/**
 * @callback emp3.api.Map~clearContainerCallback
 */

/**
 * A callback indicating success in returning a group of Layers.
 *
 * @callback onSuccessMapServicesCallback
 *
 * @param {Object} cbArgs - The parameters are passed in as members of the args
 * object.
 *
 * @param {emp3.api.MapService[]} cbArgs.services - An array of emp3.api.MapService objects.
 */

/**
 * A callback indicating a function successfully altered the Map's camera position.
 *
 * @callback onSuccessCameraCallback
 *
 * @param {Object} cbArgs - The parameters are passed in as members of the args
 * object.
 *
 * @param {emp3.api.Camera} cbArgs.camera The camera containing the settings after
 * it has been changed.
 */


/**
 * A callback indicating a function successfully executed and returned an extent.
 *
 * @callback onSuccessBoundsCallback
 *
 * @param {Object} cbArgs - The parameters are passed in as members of the args
 * object.
 *
 * @param {Bounds} cbArgs.newBounds The new bounds of the map.
 */

/**
 * A callback indicating a screenshot was successfully taken by the map.
 * The callback will contain a base64 image of the map as encoded by the HTML canvas.getDataURL
 * function.
 *
 * @callback onGetScreenshotSuccessCallback
 *
 * @param {Object} cbArgs The parameters are passed in as members of the args
 * object.
 *
 * @param {Object} cbArgs.dataUrl A base64 encoded image of the map.
 */

/**
 * A callback returning the visibility status of a Container or the visibility status of
 * an instance.
 * @callback onSuccessVisibilityCallback
 *
 * @param {Object} cbArgs - The parameters are passed in as members of the args
 * object.
 *
 * @param {Container} cbArgs.target The container to which the visibility status pertains to.
 * @param {Container} [cbArgs.parent] A parent container if the target pertains to a specific instance
 * @param {emp3.api.enums.VisibilityStateEnum} cbArgs.visible The current visibility
 * state of the specified feature if no parent has been specified, this can be
 * either HIDDEN or VISIBLE.  If cbArgs.parent
 * has been specified, returns the visibility state in relation to that specified
 * parent.  This can be HIDDEN, VISIBLE or VISIBLE_ANCESTOR_HIDDEN.  VISIBLE_ANCESTOR_HIDDEN
 * indicates that the symbol itself has not been set to be invisible, but one of its
 * ancestors has been set to not be visible.
 */

/**
 * A callback indicating a function successfully executed its call.
 *
 * @callback SuccessCallback
 */

/**
 * @typedef {Object} Failure A identifier for an object that fails
 * to execute correctly on the map.  A failure is generated at the result of
 * operating on a number of items, but failing the entire operation would be
 * the wrong thing to do.   A failure will identify which item failed.
 *
 * @param {String} featureId The id of the item if a Feature.
 * @param {String} overlayId The id of the item if an Overlay or the parent Overlay
 * if featureId is not defined.
 * @param {String} parentId The parent Container id of the Overlay or Feature.
 * For a Feature this may be the same as overlayId.
 */

/**
 *
 * A callback indicating a function successfully executed its call, but
 * 0 or more items could have failed.  The list of items is included in
 * the callback parameters.

 * @callback BatchSuccessCallback
 *
 * @param {Failure[]} failures - A list of ids of the items that failed.
 */

/**
 * A callback to be invoked when the selection operation has been completed.
 * @callback emp3.api.Map~selectFeaturesCallback
 * @param {object} cbArgs
 * @param {emp3.api.Feature[]} cbArgs.target Array of features that were selected
 */

/**
 * A callback to be invoked when th deselection operation has been completed
 * @callback emp3.api.Map~deselectFeaturesCallback
 */

/**
 * A callback indicating the method did not execute as intended.  The
 * reason for the error can be found in cbArgs.errorMessage.
 *
 * @callback ErrorCallback
 *
 * @param {Object} cbArgs - The parameters are passed in as members of the args
 * object.
 *
 * @param {String} cbArgs.errorMessage - A message describing the error that
 * occurred.
 *
 * @param {Object} cbArgs.callInfo - An object that contains information about the
 * API object and arguments that were used to call this method.
 *
 * @param {Object} cbArgs.source - The API object on which this method was invoked.
 *
 * @param {Object} cbArgs.args - The arguments that were provided to this method when
 * it was invoked.
 */

/**
 * Adds a {@link emp3.api.MapService|MapService} to this map. mapServices
 * are treated like map backgrounds.  The only interaction you can have with a
 * map services is whether or not they are visible.  Items on a map service
 * are not selectable, nor do they raise user interaction events.
 * <p>
 * Use this method to add additional background data to the map.  A typical use
 * case for a map service is to add a WMS service to the map immediately after
 * the map has loaded.
 *
 * @example <caption>Loading a WMS background after the map has loaded</caption>
 *
 * var map1 = new emp3.api.Map({
 *   container: "map-container",
 *   engine: {
 *      "engineBasePath": "./emp3-cesium",
 *      "mapEngineId": 'cesium'
 *   },
 *   onSuccess: function() {
 *     var wms = new emp3.api.WMS({
 *       name: 'Dark Earth',
 *       geoId: 'darkEarth1',
 *       url: 'http://worldwind25.arc.nasa.gov/wms',
 *       layers: 'earthatnight'
 *     });
 *     map1.addMapService({
 *       mapService: wms
 *     });
 *   }
 * });
 *
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param  {emp3.api.MapService} args.mapService A web service that provides
 * remote map data.
 * @param {onSuccessMapServiceCallback} args.onSuccess
 * @param {ErrorCallback} [args.onError]
 */
emp3.api.Map.prototype.addMapService = function(args) {

  var cmd;

  args = args || {};

  this.readyCheck();

  if (!args.mapService) {
    throw new Error("Missing argument: mapService");
  }

  cmd = {
    cmd: emp3.api.enums.channel.plotUrl,
    mapService: args.mapService,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.addMapService",
    args: args
  });
};

/**
 * Adds an overlay to the root level of the Map. onError will be called if the
 * overlay fails to add.
 * <p>
 * An overlay is a folder, used to group emp3.api.Feature objects that are
 * related together.  Overlays can be added into other overlays to build a hierarchy.
 * Overlays can be added multiple times to a map, provided they have different
 * parents.
 * <p>
 * Adding an overlay to the map does not usually display anything on the map,
 * unless the overlay was already created on a different map and is not being
 * added to this one.  That will be the only time the map will show something
 * after an overlay add.
 * <p>
 * Add data to overlays only after they have been added to
 * the map.  Currently, overlays do not support calling Overlay.addFeature without first
 * being on the map.
 *
 * @example
 * var map = new emp3.api.Map();
 * var myOverlay = new emp3.api.Overlay({
 *   name: "myOverlay"
 * });
 *
 * var processAdd = function(cbArgs) {
 *   alert( "overlay ID " + cbArgs.overlays[0].geoId + " was added to the map" );
 * }
 *
 * map.addOverlay({
 *    overlay: myOverlay,
 *    onSuccess: processAdd
 * });
 *
 * @param {Object} args Parameters are provided as members of the args object.
 *
 * @param {emp3.api.Overlay} args.overlay The emp3.api.Overlay Object to add to
 * the map.
 *
 * @param {Boolean} args.visible The visibility state of the overlay when
 * added to the map.
 *
 * @param {onSuccessOverlaysCallback} [args.onSuccess]
 * Function to call when the overlay
 * has been added to the Map Widget.
 *
 * @param {ErrorCallback} [args.onError]  Function to
 * call when an error occurs.
 *
 */
emp3.api.Map.prototype.addOverlay = function(args) {
  args = args || {};

  this.readyCheck();

  if (!args.overlay) {
    throw new Error("Missing argument: overlay");
  }

  this.addOverlays({
    overlays: [args.overlay],
    onSuccess: args.onSuccess,
    onError: args.onError
  });
};

/**
 * Adds overlays to the root level of the Map. If at least one add is successful,
 * the onSuccess callback will be called. onError will be called if all the
 * overlays failed to add.
 * <p>
 * An overlay is a folder, used to group emp3.api.Feature objects that are
 * related together.  Overlays can be added into other overlays to build a hierarchy.
 * Overlays can be added multiple times to a map, provided they have different
 * parents.
 * <p>
 * Adding an overlay to the map does not usually display anything on the map,
 * unless the overlay was already created on a different map and is not being
 * added to this one.  That will be the only time the map will show something
 * after an overlay add.
 * <p>
 * Add data to the overlays only after they have been added to
 * the map.  Currently, overlays do not support Overlay.addFeature without first
 * being on the map.
 *
 * @example
 * var map = new emp3.api.Map();
 * var myOverlay = new emp3.api.Overlay({
 *   geoId: "myOverlay",
 *   name: "myOverlay"
 * });
 * var myOverlay2 = new emp3.api.Overlay({
 *   geoId: "myOverlay2",
 *   name: "myOverlay2"
 * });
 *
 * map.addOverlays({
 *    overlays: [myOverlay, myOverlay2],
 *    onSuccess: processAdd
 * });
 *
 * function processAdd( cbArgs ) {
 *   for (var i = 0; i < cbArgs.overlays.length; i++) {
 *     console.log( "overlay ID " + cbArgs.overlays[i].geoId + " was added to the map");
 *   }
 * }
 *
 * @param {Object} args Parameters are provided as members of the args object.
 *
 * @param {emp3.api.Overlay[]} args.overlays An array of emp3.api.Overlay
 * objects to add to the map.
 *
 * @param {onSuccessOverlaysCallback} [args.onSuccess]
 * Function to call when the overlays
 * have been added to the Map Widget.
 *
 * @param {ErrorCallback} [args.onError]  Function to
 * call when an error occurs.
 *
 */
emp3.api.Map.prototype.addOverlays = function(args) {
  var cmd;

  args = args || {};

  this.readyCheck();

  if (!args.overlays) {
    throw new Error("Missing argument: overlays");
  }

  cmd = {
    cmd: emp3.api.enums.channel.createOverlay,
    overlays: args.overlays,
    parentId: this.geoId,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.addOverlays",
    args: args
  });
};


/**
 * Cancels any current draw operation. (See {@link emp3.api.Map#drawFeature|Map.drawFeature})
 * When a draw is cancelled, clicks on the map will no longer add vertices to
 * the feature that was being drawn, and it will end the draw without calling the
 * Map.drawFeature onDrawComplete callback. The onDrawCancel callback
 * will be called instead.
 * <p>
 * If no draw operation is occurring the map ignores this call.
 *
 * @example
 *
 * // Draw a Path
 *
 * // Create the feature that you want to draw, give it any default properties
 * // you want it to have.
 * var path = new emp3.api.Path({
 *   name: "my path"
 * });
 *
 * // Issue the command to draw on the map.  At this point you need to click
 * // on the map to begin drawing.
 * map.drawFeature({
 *  feature: path,
 *  onDrawCancel: function(args) {   // called when the draw is cancelled.
 *    console.log("Draw cancelled.");
 *  }
 * });
 * .
 * . // do some other stuff.
 * .
 * map.cancelDraw();  // this will trigger the onDrawCancel callback of the drawFeature call.
 *
 */
emp3.api.Map.prototype.cancelDraw = function() {

  if (this.drawTransaction) {
    this.drawTransaction.cancel();
    this.drawTransaction = null;
  }

};

/**
 * Cancels any current edit operation. (See {@link emp3.api.Map#editFeature|Map.editFeature})
 * The feature that being edited will return to the original positions prior
 * to the Map.editFeature operation.  The map will be taken out of edit mode.
 * After the edit has been cancelled, the Map.editFeature onEditCancel callback
 * will be called.
 * <p>
 * If no edit operation is occurring the Map will ignore this call.
 *
 * @example
 *
 * var feature1 = new emp3.api.MilStdSymbol({
 *   geoId: 'myBoundary',
 *   name: 'myBoundary',
 *   positions: [{
 *     latitude: 40,
 *     longitude: 40
 *   },{
 *     latitude: 41,
 *     longitude: 41
 *   }],
 *   symbolCode: 'GFGPGLB----I--X'
 * });
 *
 * // assume overlay1 has already been added to the map.
 * overlay1.addFeatures({
 *   features: [feature1],
 *   onSuccess: function() {
 *     map0.editFeature({feature: feature1});  // This puts the feature in edit mode
 *                                             // after it is added to the map.
 *   }
 * });
 * .
 * .
 * .
 * . // do some stuff
 * .
 * map0.cancelEdit(); // This will cancel the current edit.
 *
 */
emp3.api.Map.prototype.cancelEdit = function() {
  if (this.editTransaction) {
    this.editTransaction.cancel();
    this.editTransaction = null;
  }
};

/**
 * Completes any current draw operation.  (See {@link emp3.api.Map#drawFeature|Map.drawFeature})
 * Completing the draw operation will take the map out of draw mode, removing the
 * drawn graphic.  After the draw is complete, the Map.drawFeature onDrawComplete
 * callback will fire.  The onDrawComplete
 * callback will contain the completed Feature needed to show on the map.
 * To permanently display the drawing,
 * you must add the completed drawing returned in the onDrawComplete callback
 * to an Overlay as a Feature.
 * <p>
 * Sometimes double-clicking or clicking on the map during a draw operation will
 * also complete the drawing depending on the Feature type of the max number of
 * points the drawn Feature is allowed to have.
 * <p>
 * If no draw operation is occurring it the map will ignore this call.
 *
 * @example
 *
 * // Draw a Path
 *
 * // Create the feature that you want to draw, give it any default properties
 * // you want it to have.
 * var path = new emp3.api.Path({
 *   name: "my path"
 * });
 *
 * var overlay = new emp3.api.Overlay({
 *   name: "overlay1",
 *   id: "ov1"
 * });
 *
 * map.addOverlay({
 *   overlay: overlay,
 *   onSuccess: overlayAdded
 * });
 *
 *
 * function overlayAdded() {
 *   // Issue the command to draw on the map.  At this point you need to click
 *   // on the map to begin drawing.
 *   map.drawFeature({
 *     feature: path,
 *     onDrawComplete: function(args) {   // called when the draw is completed.
 *        overlay.addFeature({
 *          feature: args.feature
 *        });
 *     }
 *   });
 * }
 * .
 * .
 * . // do some stuff
 * .
 * map.drawComplete();  // this will call the onCompleteCallback specified
 *                      // in the map.drawFeature call.  Remember, a double-click
 *                      // on the map will also issue a Map.drawComplete
 *
 *
 */
emp3.api.Map.prototype.completeDraw = function() {
  if (this.drawTransaction) {
    this.drawTransaction.complete();
    this.drawTransaction = null;
  }
};

/**
 * Completes the current edit operation.   (See {@link emp3.api.Map#editFeature|Map.editFeature})
 * This will permanently save the changes made during the edit.  After the changes
 * are made the Map.editFeature onEditComplete callback will be called.  Calling
 * completeEdit is the only way to end an edit operation.
 * <p>
 * If no edit operation is occurring it ignores this call.
 *
 * @example
 *
 * var feature1 = new emp3.api.Path({
 *   geoId: 'myPath',
 *   name: 'myPath',
 *   positions: [{
 *     latitude: 40,
 *     longitude: 40
 *   },{
 *     latitude: 41,
 *     longitude: 41
 *   }]
 * });
 *
 * // assume overlay1 has already been added to the map.
 * overlay1.addFeatures({
 *   features: [feature1],
 *   onSuccess: function() {
 *     map0.editFeature({
 *       feature: feature1, // This puts the feature in edit mode after it is added to the map.
 *       onEditComplete: function() {
 *         console.log("Editing complete"); // This will get called after completeEdit is called.
 *       }
 *     });
 *   }
 * });
 * .
 * .
 * .
 * . // do some stuff
 * .
 * map0.completeEdit(); // This will complete the current edit and end the editing.
 *
 */
emp3.api.Map.prototype.completeEdit = function() {
  if (this.editTransaction) {
    this.editTransaction.complete();
    this.editTransaction = null;
  }
};

/**
 * Callback made when the drawing first begins on the map.
 * This will occur when the user first interacts with the map, but prior to
 * any Map.drawFeature onDrawUpdate callbacks.  Subsequent interactions on the
 * map in draw mode will call the Map.drawFeature onDrawUpdate.
 *
 * @callback DrawStartCallback
 *
 * @param {object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Map) args.map The map the draw occurred on.
 */

/**
 * Callback made when the editFeature begins on the map.  This occurs after
 * the map finishes adding any handles onto the map for the feature that is
 * being edited.
 *
 * @callback EditStartCallback
 *
 * @param {object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Map) args.map The map the edit occurred on.
 * @param {emp3.api.Feature} args.feature The feature that was passed into the
 * Map.drawFeature call, updated with the first coordinate clicked.
 */

/**
 * Callback occurs after each time the user
 * updates the item being drawn.  This can occur during property changes
 * as well.  For instance, for MilStdSymbol, a circular target range could
 * get updated by modifying the MilStdSymbol.distance property.  If that
 * occurs, this will fire.
 *
 * @callback DrawUpdateCallback
 *
 * @param {object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Map} args.map The map the draw occurred on.
 * @param {emp3.api.Feature} args.feature The feature containing the current
 * positions and other properties at the time of this callback.
 * @param {EditUpdateData[]} args.updateList An array of changes that occurred.
 */

/**
 * Callback occurs after each time the user
 * updates the item during an edit.  This can occur during property changes
 * as well.  Certain MIL-STD-2525 symbols can be edited by modifying the
 * altitude/depth, azimuth, or distance fields.  Air control measures can
 * be edited by changing attributes.
 *
 * @callback EditUpdateCallback
 *
 * @param {object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Map} args.map The map the edit occurred on.
 * @param {emp3.api.Feature} args.feature The feature containing the current
 * positions and other properties at the time of this callback.
 * @param {EditUpdateData[]} args.updateList An array of changes that occurred.
 */

/**
 * Occurs after the draw has been completed by the emp3.api.Map.completeDraw
 * method.  The callback returns an
 * emp3.api.Feature which can be added to an Overlay to complete the draw.
 *
 * @callback DrawCompleteCallback
 *
 * @param {object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Map} args.map The map the draw occurred on.
 * @param {emp3.api.Feature} args.feature The completed feature that was drawn.
 * This feature is passed in on the original emp3.api.Map.drawFeature call
 * and returned with the updated positions and attributes that occurred after
 * the draw.  The feature should be ready to add to the map.
 */

/**
 * Occurs after the edit has been completed by the emp3.api.Map.completeEdit
 * method.  The callback returns an
 * emp3.api.Feature which represents the changed Feature.  After the completeEdit
 * occurs, the Feature is already modified on the map and does not need to
 * be updated.
 *
 * @callback EditCompleteCallback
 *
 * @param {object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Map} args.map The map the edit occurred on.
 * @param {emp3.api.Feature} args.feature The completed feature that was edited.
 * This feature is passed in on the original emp3.api.Map.editFeature call
 * and returned with the updated positions and attributes that occurred after
 * the edit.  The feature will already be modified on the map and does not need
 * an update.
 */

/**
 * Occurs if a cancel occurs during drawing a Feature on the map, usually
 * as a result of the emp3.api.Map.cancelDraw method.  The map will return
 * the feature as it originally was sent in the emp3.api.Map.drawFeature
 * method.
 *
 * @callback DrawCancelCallback
 *
 * @param {object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Map} args.map The map the draw occurred on.
 * @param {emp3.api.Feature} args.feature The emp3.api.Feature that was passed
 * to the emp3.api.Map.drawFeature method.  The feature will be returned in the
 * state that it was prior to the draw.
 */

/**
 * Occurs if a cancel occurs during editing a Feature on the map,
 * as a result of the emp3.api.Map.cancelEdit method.  The map will return
 * the feature as it originally was sent prior to the in the
 * emp3.api.Map.editFeature method.
 *
 * @callback EditCancelCallback
 *
 * @param {object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Map} args.map The map the edit occurred on.
 * @param {emp3.api.Feature} args.feature The emp3.api.Feature that was passed
 * to the emp3.api.Map.editFeature method.  The feature will be returned in the
 * state that it was prior to the edit.
 */

/**
 * @typedef {Object} EditUpdateData A change that can occur to a feature during a
 * draw or an edit operation.  Each change indicates what type of change it is:
 * an add, update, or delete to the coordinates or a change to one of its
 * properties or the original feature.
 *
 * @property {cmapi.enums.geoAirControlMeasure.Attribute} changedAttribute
 * An attribute that was changed specifically for an Air Control Measure.
 * Only usable by emp3.api.AirControlMeasure.
 * @property {cmapi.enums.geoMilSymbol.Modifier} changedModifier A symbol
 * modifier that was updated on a emp3.api.MilStdSymbol object.  Only usable
 * on emp3.api.MilStdSymbol object.
 * @property {number[]} coordinateIndexes The indices of the coordinate that
 * were modified.  Used in conjunction with the updateType property which
 * explains how it was modified.
 * @property {emp3.api.enums.FeatureEditUpdateType} updateType Indicates what
 * type of change this is.
 */


/**
 * Puts the map in draw mode and draws the type of feature passed in.  If the
 * feature contains coordinates in the feature, the draw will begin with those
 * coordinates already added on the map.  The feature will draw according to the
 * style settings found in the feature.  After the draw is complete the feature
 * does not remain on the map.  It is passed back to the caller, via the
 * onDrawComplete callback, and the caller
 * should add their feature to the map.
 * <p>
 * Map.drawFeature contains a number of callbacks that will be issued during
 * the draw.  onDrawStart is called after the first click is made.  It indicates
 * the user's first interaction with the map since Map.drawFeature was called.
 * Subsequent map clicks will call the onDrawUpdate callback; once for each
 * point added for a feature, or when the feature's position or properties
 * change.  The onDrawComplete method will be called either
 * when Map.drawComplete has been called, when a user double-clicks, or when
 * some features have reached their maximum allowable points.  onDrawCancel is
 * issued when Map.drawCancel is called.  Once a drawCancel has been called,
 * a onDrawComplete will not be called.
 *
 *
 * @example
 *
 * // Draw a Path -- assume "map" is a emp3.api.Map and "overlay" is an emp3.api.Overlay
 * // already added to the map.
 *
 * // Create the feature that you want to draw, give it any default properties
 * // you want it to have.
 * var path = new emp3.api.Path({
 *   name: "my path"
 * });
 *
 * // Issue the command to draw on the map.  At this point you need to click
 * // on the map to begin drawing.
 * map.drawFeature({
 *  feature: path,
 *  onDrawComplete: function(args) {   // called when the draw is complete.
 *    // add the returned drawn feature to the map.
 *    overlay.addFeature({
 *      feature: args.feature
 *    });
 *  }
 * });
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Feature} args.feature A feature that will be drawn.  If
 * the feature contains coordinates, the feature will draw starting those
 * coordinates.
 * @param {DrawCancelCallback} [args.onDrawCancel] The callback function to be executed if a
 * drawing is cancelled
 * @param {DrawCompleteCallback} [args.onDrawComplete] The callback function to be executed if a
 * drawing is finished
 * @param {ErrorCallback} [args.onDrawError] The callback function to call if an error occurs
 * during the draw
 * @param {DrawStartCallback} [args.onDrawStart] The callback function to be executed when the
 * drawing starts.
 * @param {DrawUpdateCallback} [args.onDrawUpdate] The callback function called when the drawing
 * symbols updates with an add or removal of a point.
 *
 */
emp3.api.Map.prototype.drawFeature = function(args) {

  var type;

  this.readyCheck();

  args = args || {};

  // verify if required parameters are available.
  if (!args.feature) {
    throw new Error("Missing argument: feature");
  }

  type = args.feature.featureType;
  if (!type) {
    throw new Error("Cannot draw a feature of type emp3.map.Feature");
  }

  // Pass in the style from the arguments as an object literal
  var cmd = {
    cmd: emp3.api.enums.channel.draw,
    feature: args.feature,
    onError: args.onDrawError,
    startCallback: args.onDrawStart || "",
    updateCallback: args.onDrawUpdate || "",
    completeCallback: args.onDrawComplete || "",
    cancelCallback: args.onDrawCancel || ""

  };

  this.drawTransaction = emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.drawFeature",
    args: args
  });
};

/**
 * Called when the map enters freehand mode, updates a line in freehand mode,
 * finishes drawing a line in freehand mode, or exits freehand mode.  you
 * can determine the event type by calling args.
 *
 * @callback MapFreehandCallback
 *
 * @param {emp3.api.events.MapFreehandEvent} event The freehand draw event that occurred
 * on the map.  Call event.type to retrieve what type of freehand event
 * occurred.
 */

/**
 * Puts the map in "freehand" draw mode, where you can draw on top of the
 * map like you are using a pen.  A line will begin drawing when you mouse down,
 * and when you mouse up, the line will be disappear.  The line does not persist
 * on the map.  If you would like the line to persist, you may
 * create a feature and add it to an overlay. Instead of persisting to the map,
 * a MapFreehandEvent will be raised notifying that a line
 * has been drawn on the map.  This event can be subscribe to by calling
 * {@link emp3.api.Map.addEventListener|Map.addEventListener} or by using the
 * onFreehandEvent callback parameter of this method.
 *
 * <p>
 * The line style for the lines displayed by the map for freehand draw mode may
 * be set by calling {@link emp3.api.Map#setFreehandStyle|Map.setFreehandStyle} or
 * by setting the initialStyle parameter of this method.
 * <p>
 * Map.drawFreehandExit must be called to take the map out of "freehand" draw mode.
 * <p>
 * The order of events for drawFreehand are the following:
 *
 * When entering freehand mode:
 * 1) - The map is locked in "smart lock" mode.  The map will not pan in this mode,
 * nor will it generate {@link emp3.api.events.MapUserInteractionEvent} or {@link emp3.api.events.FeatureUserInteractionEvent} events
 * 2) - A {@link emp3.api.events.MapFreehandEvent} with event set to {@link emp3.api.enums.MapFreehandEventEnum|MAP_ENTERED_FREEHAND_DRAW_MODE}
 * is generated. (get args.event to determine the type of MapFreehandEvent)
 * 3) - At the first drag gesture a MapFreehandEvent with event
 * {@link emp3.api.enums.MapFreehandEventEnum|MAP_FREEHAND_LINE_DRAW_START} is generated when the user does a mouse down on the map. As the
 * mouse moves while the mouse button is down, a line is displayed on the map.
 * 4) - A MapFreehandEvent with event {@link emp3.api.enums.MapFreehandEventEnum|MAP_FREEHAND_LINE_DRAW_UPDATE}
 * is generated as the user continues the drag gesture.
 * 5) - When the user ends the drag gesture (on mouse up), a MapFreehandEvent
 * with event {@link emp3.api.enums.MapFreehandEventEnum|MAP_FREEHAND_LINE_DRAW_END} is generated. The event
 * contains a list of geospatial coordinates of the line drawn. Once the
 * event returns, the line is removed from the map and the list of coordinates
 * are deleted.  At this point, to make the line persist, a feature must be created and added to an
 * overlay.
 * 6) - The user may choose to initiate a new drag gesture to generate a new
 * line therefore returning to step # 3.
 * 7) - When {@link emp3.api.Map.drawFreehandExit|Map.drawFreehandExit} is called a MapFreehandEvent with event type
 * {@link emp3.api.enums.MapFreehandEventEnum|MAP_EXIT_FREEHAND_DRAW_MODE} is generated, the map is unlocked,
 * and the map exits freehand draw mode.
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {cmapi.IGeoStrokeStyle} [args.strokeStyle] Determines the color, transparency,
 * and width of the lines.  This overrides, but does not set the freehand stroke style
 * settings for the map. To set the stroke style settings call the method
 * Map.setFreehandStyle.
 * @param {MapFreehandCallback} [args.onFreehandEvent] An optional callback used to handle MapFreehandEvents.
 * Use this as an alternative to calling Map.addEventListener.
 *
 * @example
 *
 * map0.addEventListener({
 *  eventType: emp3.api.enums.EventType.MAP_FREEHAND_DRAW_EVENT,
 *  callback: function(args) {
 *    console.log("Freehand lines are drawing!");
 *  }
 * });
 *
 * map0.drawFreehand();  // at this point, click and drag on the map.
 *
 */
emp3.api.Map.prototype.drawFreehand = function(args) {
  this.readyCheck();

  args = args || {};

  var cmd = {
    cmd: emp3.api.enums.channel.freehandDrawStart,
    strokeStyle: args.strokeStyle,
    freehandCallback: args.onFreehandEvent
  };

    emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.drawFreehand",
    args: args
  });
};

/**
 * Takes the map out of "freehand" draw mode. See {@link emp3.api.Map#drawFreehand}  When a map is taken out of
 * freehand draw mode, a {@link emp3.api.event.MapFreehandEvent|MapFreehandEvent} is raised with event
 * {@link emp3.api.enums.MapFreehandEventEnum|MAP_EXIT_FREEHAND_DRAW_MODE}.  At this point, the map will begin
 * sending MapUserInteractionEvents and FeatureUserInteractionEvent events again
 * as well as responding to user input to pan the map.
 * <p>
 * Map.drawFreehandExit must be called to take the map out of "freehand" draw mode.
 *
 * @example
 *
 *
 * map.drawFreehand();  // at this point, click and drag on the map.  We
 *                      // will be able to do this for 5 seconds once we set the timer
 *
 * setTimeout(function() {   // after 5 seconds take ourselves out of freehand mode.
 *   map.drawFreehandExit();
 * }, 5000);
 */
emp3.api.Map.prototype.drawFreehandExit = function() {
  this.readyCheck();

  var cmd = {
    cmd: emp3.api.enums.channel.freehandDrawExit
  };

    emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.drawFreehandExit"
  });
};

/**
 * Sets the line style for the {@link emp3.api.Map#drawFreehand|Map.drawFreehand}
 * call.  This allows you to change the default line style when drawing lines in
 * freehand mode.  To enter freehand
 * mode, call {@link emp3.api.Map#drawFreehand|Map.drawFreehand}.  To exit freehand mode,
 * call {@link emp3.api.Map#drawFreehandExit|Map.drawFreehandExit}.
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {cmapi.org.IGeoStrokeStyle} [args.initialStyle] Determines the color, transparency,
 * and width of the lines.
 *
 * @example
 *
 * // change the default settings for freehand lines to a
 * // thick red line.
 * map.setFreehandStyle({
 *   initialStyle: {
 *     strokeColor: {
 *       red: 255,
 *       green: 0,
 *       blue: 0
 *     },
 *     strokeWidth: 10
 *   }
 * });
 *
 * // enter into freehand mode.
 * map.drawFreehand();  // at this point, click and drag on the map.  We
 *                      // will be able to do this for 10 seconds once we set the timer
 *
 *
 * setTimeout(function() {   // after 10 seconds take ourselves out of freehand mode.
 *   map.drawFreehandExit();
 * }, 10000);
 */
emp3.api.Map.prototype.setFreehandStyle = function(args) {
  this.readyCheck();

  var cmd = {
    cmd: emp3.api.enums.channel.config,
    freehandStrokeStyle: args.initialStyle
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.setFreehandStyle"
  });
};

/**
 * Places the given feature in edit mode on the map.  When the map goes into
 * edit mode, the map
 * will show editing handles for the feature being edited.  The feature's
 * vertices can then be moved. The map will not zoom to the location prior to
 * the edit, so make sure to place the feature in focus
 * prior to calling edit.  The feature will remain in edit mode until
 * Map.completeEdit or Map.cancelEdit is called.  Calling Map.completeEdit
 * will commit the changes to the map.  Map.cancelEdit will undo any changes
 * to the feature in edit mode.
 * <p>
 * Changes can be received by using the callback parameters to the Map.editFeature
 * method.  onEditStart is called immediately after calling editFeature after
 * the map acknowledges it is in edit mode.  For each change that occurs, onEditUpdate
 * will get called, returning an updated Feature along with information about
 * what changed.  onEditComplete is called when {@link emp3.api.Map.completeEdit|Map.completeEdit}
 * is called.  If {@link emp3.api.Map.cancelEdit|Map.cancelEdit} is called, then
 * the onEditCancel callback with be invoked.
 *
 * @example
 * // adds a polygon, puts it in edit mode and allows you
 * // to edit for 10 seconds, then completes the edit.
 *
 * function editStart(args) {
 *   console.log("Editing started");
 * }
 *
 * function editUpdate(args) {
 *   console.log("Feature updated during an edit");
 * }
 *
 * function editComplete(args) {
 *   console.log("Finished editing the feature.");
 * }
 *
 * var overlay = new emp3.api.Overlay({
 *   geoId: 'yo'
 * });
 *
 * var addFeature = function() {
 *   var polygon = new emp3.api.Polygon({
 *     geoId: "polygon",
 *     positions: [{
 *       latitude: 40,
 *       longitude: 40
 *     }, {
 *       latitude: 41,
 *       longitude: 41
 *     }, {
 *       latitude: 40,
 *       longitude: 42
 *     }]
 *   });
 *
 *   // This a callback used for the onSuccess call for adding the feature.
 *   var editFeature = function() {
 *     map0.editFeature({
 *       feature: polygon,
 *       onEditStart: editStart,
 *       onEditUpdate: editUpdate,
 *       onEditComplete: editComplete,
 *       onEditError: function(err) {
 *         alert(err.errorMessage);
 *         window.console.error(err);
 *       }
 *     });
 *
 *     // Set a timer for 10 seconds, allow editing during that
 *     // period.  After 10 seconds expires we complete the edit.
 *     // You typically would not do it this way, this is just a demo.
 *     setTimeout(function() {
 *        map0.completeEdit();
 *     }, 10000);
 *  };
 *
 *  // Add the polygon to the overlay, and put it into edit mode.
 *  overlay.addFeature({
 *    feature: polygon,
 *    onSuccess: editFeature
 *  });
 * };
 *
 * map0.addOverlay({
 *   overlay: overlay,
 *   onSuccess: addFeature
 * });
 *
 * @param {Object} args Parameters are provided as members of the args object.
 *
 * @param {Feature} args.feature The feature that will be put into edit mode.
 * @param {EditStartCallback} [args.onEditStart] A callback that will be called prior to the feature going into edit mode.
 * @param {EditUpdateCallback} [args.onEditUpdate] A callback that is called each time the feature is modified during editing.
 * @param {EditCompleteCallback} [args.onEditComplete] A callback that is called when the user has completed editing by calling Map.completeEdit.
 * @param {EditCancelCallback} [args.onEditCancel] A callback that is called if the feature cancels the edit by calling Map.cancelCallback.
 * @param {ErrorCallback} [args.onEditError] The method that will be called if an error occurs
 * during the transaction.
 */
emp3.api.Map.prototype.editFeature = function(args) {

  args = args || {};

  // Throw an error if we do not have feature passed in.
  if (!args.feature) {
    throw new Error("Missing argument: feature");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.featureEdit,
    feature: args.feature,
    startCallback: args.onEditStart || "",
    updateCallback: args.onEditUpdate || "",
    completeCallback: args.onEditComplete || "",
    cancelCallback: args.onEditCancel || "",
    onError: args.onEditError
  };

  var callInfo = {
    mapId: this.geoId,
    source: this,
    method: "Map.editFeature",
    args: args
  };

  // If the feature is already being edited, we don't want to do anything
  // except call the errorCallback.
  if (this.editTransaction && this.editTransaction.geoId === args.feature.geoId) {
    // Make sure the user actually defined an error callback.
    if (args.onEditError) {
      var msg = "Feature is already in edit mode";

      args.onEditError({
        errorMessage: msg,
        callInfo: callInfo,
        source: this,
        args: args
      });
    }
  }
  else {
    // if this is a different feature being edited, proceed with the edit.
    this.editTransaction = emp3.api.MessageHandler.getInstance().sendMessage(cmd, callInfo);
  }
};

/**
 * Retrieves the altitude in meters at which point above MIL-STD-2525 warfighting symbols
 * will display as dots to declutter the map.
 * Above this altitude the MIL-STD-2525 warfighting symbols will show as dots.
 * Below this altitude the warfighting symbols will show normally (but without labels).
 * This function is meant to help
 * fine tune performance systems with large numbers of warfighting symbols.
 *
 * @return {number} The altitude at which MIL-STD-2525 warfighting symbols will
 * no longer display as dots.
 */
emp3.api.Map.prototype.getFarDistanceThreshold = function() {
  return this.farDistanceThreshold;
};

/**
 * Retrieves the current icon size for single point MIL-STD-2525 symbols.  See
 * {@link emp3.api.Map#setIconSize|Map.setIconSize}.
 *
 * @return {emp3.api.enums.IconSizeEnum} The size of the icons.
 */
emp3.api.Map.prototype.getIconSize = function() {

  return this.iconSize;
};


/**
 * Retrieves the altitude in meters at which point below MIL-STD-2525 warfighting symbols begin to
 * show labels according to the settings specified in {@link emp3.api.Map#getMilStdLabels|Map.getMilStdLabels}.
 * Above this altitude the MIL-STD-2525 symbols will not show labels. To always
 * show labels, set {@link emp3.api.Map#setMidDistanceThreshold|Map.setMidDistanceThreshold}
 * to be equal to {@link emp3.api.Map#setFarDistanceThreshold|Map.setFarDistanceThreshold}.
 * Remember that showing labels costs additional performance.  This function is meant to help
 * fine tune performance systems with large numbers of warfighting symbols.
 *
 * @return {number} The altitude at which MIL-STD-2525 warfighting symbols will
 * begin to display labels.
 */
emp3.api.Map.prototype.getMidDistanceThreshold = function() {
  return this.midDistanceThreshold;
};

/**
 * Sets the altitude (in meters)
 * at which point MIL-STD-2525 warfighting symbols
 * will display as dots. Below this
 * altitude the warfighting symbols will show normally (without labels) until
 * it hits the mid-distance threshold. At the mid-distance threshold,
 * the MIL-STD-2525 symbols will display with
 * labels according to {@link emp3.api.Map#getMilStdLabels|Map.getMilStdLabels}.
 * <p>
 * This function is meant to help fine tune performance for systems displaying a
 * large numbers of warfighting symbols.
 * <p>
 * <i>Note: This capability is disabled by default for the Cesium map engine. It
 * must be first turned on using renderingOptimization.enabled=true when creating
 * the map. See {@link CesiumProperties}</i>
 *
 * @param {number} threshold The altitude in meters at which above MIL-STD-2525
 * warfighting symbols will display as dots.
 */
emp3.api.Map.prototype.setFarDistanceThreshold = function(threshold) {

  if (typeof(threshold) !== 'number') {
    throw new Error("Type Error: Cannot set threshold to non-number.");
  }

  if (threshold < this.midDistanceThreshold) {
    throw new Error("Range Error: Cannot set far-distance threshold lower than the mid-distance threshold.");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.config,
    farDistanceThreshold: threshold
  };

  var callInfo = {
    mapId: this.geoId,
    source: this,
    method: "Map.setFarDistanceThreshold",
    args: {
      threshold: threshold
    }
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, callInfo);

  this.farDistanceThreshold = threshold;
};

/**
 * Sets the base size the map should display MIL-STD-2525 icons.  This will
 * not affect regular emp3.api.Point icons.  Icon size is specified by using
 * {@link emp3.api.enums.IconSizeEnum} which lists four preset sizes.  actual
 * sizes may differ depending on which map engine you are looking at.
 *
 * @param {emp3.api.enums.IconSizeEnum} size The size of the base icon.
 *
 * @example
 *
 * map.setIconSize(emp3.api.enums.IconSizeEnum.LARGE);
 */
emp3.api.Map.prototype.setIconSize = function(size) {

  if (size !== emp3.api.enums.IconSizeEnum.TINY &&
    size !== emp3.api.enums.IconSizeEnum.SMALL &&
    size !== emp3.api.enums.IconSizeEnum.MEDIUM &&
    size !== emp3.api.enums.IconSizeEnum.LARGE) {
    throw new Error("Type Error: Cannot set icon size to be anything other than emp3.api.enums.IconSizeEnum.");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.config,
    iconSize: size
  };

  var callInfo = {
    mapId: this.geoId,
    source: this,
    method: "Map.setIconSize",
    args: {
      size: size
    }
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, callInfo);

  this.iconSize = size;
};


/**
 * Sets the altitude in meters at which point MIL-STD-2525 warfighting symbols
 * will show labels.
 * Above this altitude the MIL-STD-2525 symbols will not show labels.
 * To always
 * show labels, set the mid-distance threshold {@link emp3.api.Map#setMidDistanceThreshold|Map.setMidDistanceThreshold}
 * to be equal to {@link emp3.api.Map#setFarDistanceThreshold|Map.setFarDistanceThreshold}.
 * <p>
 * Remember, showing labels costs additional performance.  This function is meant to help
 * fine tune performance systems with large numbers of warfighting symbols.
 * <p>
 * <i>Note: This capability is disabled by default for the Cesium map engine. It
 * must be first turned on using renderingOptimization.enabled=true when creating
 * the map. See {@link CesiumProperties}</i>
 *
 * @param {number} threshold An altitude in meters which will serve as the threshold
 * for turning on labels for MIL-STD-2525 warfighting symbols.
 */
emp3.api.Map.prototype.setMidDistanceThreshold = function(threshold) {

  if (typeof(threshold) !== 'number') {
    throw new Error("Type Error: Cannot set threshold to non-number.");
  }

  if (threshold > this.farDistanceThreshold) {
    throw new Error("Range Error: Cannot set mid-distance threshold greater than the far-distance threshold.");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.config,
    midDistanceThreshold: threshold
  };

  var callInfo = {
    mapId: this.geoId,
    method: "Map.setMidDistanceThreshold",
    args: {
      threshold: threshold
    }
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, callInfo);

  this.midDistanceThreshold = threshold;
};

/**
 * Retrieves the current MIL-STD-2525 label settings.  See {emp3.api.Map#setMilStdLabels|Map.setMilStdLabels}
 *
 * @return {emp3.api.enums.MilStdLabelSettingEnum} Returns a setting that indicates
 * which set of labels are turned off.
 *
 * @example
 *
 * // retrieves the label settings and shows a dialog that tells you
 * // which settings are being used.
 * var labelSettings = map.getMilStdLabels();
 *
 * if (labelSettings === emp3.api.enums.MilStdLabelSettingEnum.COMMON_LABELS) {
 *   alert("common");
 * } else if (labelSettings === emp3.api.enums.MilStdLabelSettingEnum.REQUIRED_LABELS) {
 *   alert("required");
 * } else if (labelSettings === emp3.api.enums.MilStdLabelSettingEnum.ALL_LABELS) {
 *   alert("all");
 * }
 */
emp3.api.Map.prototype.getMilStdLabels = function() {
  return this.milStdLabels;
};

/**
 * Retrieves the visibility state or instance visibility state of a target
 * object on a map instance.  Two types of visibility requests can be made:
 * visibility and instance visibility. A basic visibility check is a binary check
 * if the item can be seen by the user or not. An instance visibility is a bit more
 * complicated. An item can appear on the map in multiple places and each time it
 * appears under a {@link emp3.api.Container|Container} it is called an "instance."
 * When doing an instance visibility check, you need to provide the parent container
 * of the item you are checking.  This will tell you not only if the item is considered visible, but
 * it also indicates if it was hidden because a parent has hidden it.  For instance,
 * if a Feature fell under an Overlay, but the Overlay's visibility was set to false,
 * checking the instance visibility of that feature under that overlay would indicate
 * that the feature was hidden by its ancestor.  This state is called VISIBLE_ANCESTOR_HIDDEN.
 * See the returned visibility enum sent by the callback. {@link emp3.api.enums.VisibilityStateEnum}
 * <p>
 * If either the target or parent (for instance visibility checks) cannot be
 * found on the map, the onError callback is called.
 *
 * @param {Object} args Parameters are provided as members of the args object.
 *
 * @param {IGeoContainer} args.target The object of which the visibility state is
 * requested.
 * @param {IGeoContainer} [args.parent] A parent of the target object.  Optional, used
 * for determining the visibility state of an object instance.
 * @param {onSuccessVisibilityCallback} args.onSuccess called after getVisibility returns with
 * the result.
 * @param {ErrorCallback} [args.onError] Function to call when an error occurs.
 *
 * @example <caption>Get the visibility of a Feature</caption>
 *
 * // Get the visibility of a feature on the map.
 *
 * map0.getVisibility({
 *  target: feature,
 *  onSuccess: function(cbArgs) {
 *    console.log(cbArgs.visible);  // show whether or not it's HIDDEN or VISIBLE.
 *  }
 * });
 *
 * @example <caption>Get the visibility of an Overlay instance</caption>
 * // Assume overlay is a child of overlayParent.
 * map0.getVisibility({
 *  target: overlay,
 *  parent: overlayParent,
 *  onSuccess: function(cbArgs) {
 *    console.log(cbArgs.visible);  // show whether or not it's HIDDEN, VISIBLE, or VISIBLE_ANCESTOR_HIDDEN
 *  }
 * });
 *
 */
emp3.api.Map.prototype.getVisibility = function(args) {
  args = args || {};

  this.readyCheck();

  if (!args.target) {
    throw new Error("Missing argument: target");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.getVisibility,
    target: args.target,
    parent: args.parent,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  var callInfo = {
    mapId: this.geoId,
    source: this,
    method: "Map.getVisibility",
    args: args
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, callInfo);
};

/**
 * Indicates which MIL-STD-2525 labels to display for the single point warfighting
 * symbols as per Appendix A of the MIL-STD-2525. See TABLE IV in MIL-STD-2525C
 * for explanation of MIL-STD-2525 label modifiers.
 * <p>
 * {@link emp3.api.enums.MilStdLabelSettingEnum|REQUIRED_LABELS} will only turn on
 * Signature Equipment (l), Type (V), Special C2 Headquarters (AA), plus graphic
 * modifiers Symbol Icon (A), Echelon (B), Task Force Indicator (D), Frame Shape
 * Modifier (E), Staff Comments (G), Headquarters Staff Indicator (S), Feint/Dummy
 * Indicator (AB), Installation (AC), Auxiliary Equipment Indicator (AG).
 * <p>
 * {@link emp3.api.enums.MilStdLabelSettingEnum|COMMON_LABELS} will turn on all REQUIRED_LABELS
 * plus Additional Information (H), Higher Formation (M), Unique Designation (T),
 * and the common name (Feature.name property, not part of MIL-STD-2525.  This
 * displays to the right of the unique designation label, or replaces it if no unique
 * designation label is found).
 * <p>
 * {@link emp3.api.enums.MilStdLabelSettingEnum|ALL_LABELS} will show all the remaining labels.
 * <i>There are some labels that may not supported in 3D due to technical issues.
 * Direction of movement (Q) is currently on of them.</i>
 * <p>
 * If rendering optimization is turned on, labels will only be seen if you are
 * below the mid distance threshold altitude. See {@link emp3.api.Map#setMidDistanceThreshold|Map.setMidDistanceThreshold}
 *
 * @param {emp3.api.enums.MilStdLabelSettingEnum} labelSetting The label preferences for single point
 * MIL-STD-2525 graphics.
 *
 * @example
 * // this will turn all labels on.
 * map.setMilStdLabels(emp3.api.enums.MilStdLabelSettingEnum.ALL_LABELS);
 */
emp3.api.Map.prototype.setMilStdLabels = function(labelSetting) {

  if (labelSetting !== emp3.api.enums.MilStdLabelSettingEnum.COMMON_LABELS &&
    labelSetting !== emp3.api.enums.MilStdLabelSettingEnum.REQUIRED_LABELS &&
    labelSetting !== emp3.api.enums.MilStdLabelSettingEnum.ALL_LABELS) {
    throw new Error("Type Error: Cannot set MilStdLabels to be anything other than emp3.api.enums.MilStdLabelSettingEnum.");
  }


  var cmd = {
    cmd: emp3.api.enums.channel.config,
    milStdLabels: labelSetting
  };

  var callInfo = {
    mapId: this.geoId,
    source: this,
    method: "Map.setMilStdLabels",
    args: {
      labelSetting: labelSetting
    }
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, callInfo);

  this.milStdLabels = labelSetting;
};

/**
 * Modifies the visibility state of a container.  Works with Features and Overlays.
 * Set the action parameter to determine if the target should be hidden or visible.  The action
 * passed in can either simply toggle the visibility of the target, or set the visibility
 * of the target and any contained children, making it a recursive visibility set.
 * <p>
 * There are four enumerations for action: HIDE_ALL, SHOW_ALL, TOGGLE_ON, and TOGGLE_OFF.
 * There is a slight difference between "TOGGLE" and "HIDE".  When you TOGGLE_OFF,
 * you are only turning the visibility state for the target. The visibility "state"
 * of the children will remain what they were before they were hidden although any of the target's children
 * would still be hidden on the map.  When you TOGGLE_ON, only the state of the target is
 * turned on--it's children's state remained the same as they were when they were toggled off.
 * However, when set the action to HIDE_ALL, the visibility
 * state for each of the children will also be set as well.  The target get set to hidden, and
 * also all of it's children.  Like TOGGLE_OFF, the target and
 * children will not show on the map. If you were to set the action to TOGGLE_ON
 * instead of SHOW_ALL, then the target would show, but the children's state
 * would be set to hidden so they wouldn't show. If you called SHOW_ALL, the target
 * and children's visibility state would be set to display and all would show.
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {IGeoContainer | IGeoContainer[] | String | String[]} args.target The object(s), a or id(s)
 * of the object to perform the action on.
 * @param {IGeoContainer | String } [args.parent] The parent object of the target that the action will
 * If not set it will apply to all the instances of the object.
 * be applied to.
 * @param {emp3.api.enums.VisibilityActionEnum} args.action The action to perform.
 * @param {BatchSuccessCallback} [args.onSuccess] Function to call after action occurs
 * @param {ErrorCallback} [args.onError] Function to call when error occurs
 *
 * @example <caption>Hiding a single feature</caption>
 *
 * // This example hides the feature that is added to the map.
 * var overlay = new emp3.api.Overlay({
 *  geoId: 'overlay1'
 * });
 *
 * // Add the overlay to the map.
 * map0.addOverlay({
 *   overlay: overlay,
 *   onSuccess: addFeature
 * });
 *
 * // After we add this overlay, call this method
 * // to add the polygon to the map.
 * var addFeature = function() {
 *   var polygon = new emp3.api.Polygon({
 *     geoId: "polygon",
 *     positions: [{
 *       latitude: 40,
 *       longitude: 40
 *     }, {
 *       latitude: 41,
 *       longitude: 41
 *     }, {
 *       latitude: 40,
 *       longitude: 42
 *     }]
 *   });
 *
 *   overlay.addFeature({
 *     feature: polygon,
 *     onSuccess: addFeatureSuccess
 *   });
 * };
 *
 * // After the feature is added, set the feature's visibility to hidden.
 * var addFeatureSuccess = function(args) {
 *   // get the first feature, it will be the only feature returned
 *   var feature = args.features[0];
 *
 *   map0.setVisibility({
 *     target: feature,
 *     action: emp3.api.enums.VisibilityActionEnum.TOGGLE_OFF
 *   });
 * };
 *
 * @example <caption>Hides the Overlay and any of its children</caption>
 * // assume overlay has been added to map already.
 *
 * map.setVisibility({
 *   target: overlay,
 *   action: emp3.api.enums.VisibilityActionEnum.HIDE_ALL
 * });
 *
 * @example <caption>Makes multiple features viewable</caption>
 *
 * map0.setVisibility({
 *   target: [feature1, feature2, feature3],
 *   action: emp3.api.enums.VisibilityActionEnum.TOGGLE_ON
 * });
 */
emp3.api.Map.prototype.setVisibility = function(args) {
  var featureIds = [],
    overlayIds = [],
    parentId,
    cmd;

  args = args || {};

  // Make sure map is created before trying to
  // attempt to set visibility.
  this.readyCheck();

  // First we need to check what types have been passed in by user
  // We ultimately need to create a separate list of overlayIds and featureIds,
  // because there are 2 separate channels that are called for changing
  // the visibility of a feature or an overlay.
  //
  // Check to see if this is an array first
  if (typeof args.target === 'undefined') {
    args.target = [];
  }

  if (emp3.api.isArray(args.target)) {
    for (var target in args.target) {
      if (args.target.hasOwnProperty(target)) {
        if (emp3.api.isOverlay(args.target[target])) {
          overlayIds.push(args.target[target].geoId);
        } else {
          featureIds.push(args.target[target].geoId);
        }
      }
    }
  }
  else if (emp3.api.isOverlay(args.target)) {
    overlayIds.push(args.target.geoId);
  }
  else {
    featureIds.push(args.target.geoId);
  }

  // Determine if parent is set.  If it is
  // we will need to determine if user passed in a string
  // or an object.
  if (args.parent) {
    // If this is a string, store it as the id of the parent container.
    if (emp3.api.isString(args.parent)) {
      parentId = args.parent;
    }
    else {
      // the parent property, if it is set, it probably is an geoContainer.
      // Check geoId property.  If it has it, it most likely is
      // the correct id of the parent.
      parentId = args.parent.geoId;
    }
  }

  //TODO: This code is no good -- need to not follow CMAPI here -- otherwise
  // we have to send two separate requests; one only after the response of
  // the first one.    Better if CMAPI channel changed to be agnostic of
  // features, map services, overlays.
  // ALSO CMAPI does not support the different enumerations for toggling.

  if (!args.onSuccess) {
    args.onSuccess = function() {};
  }

  if (!args.onError) {
    args.onError = function() {};
  }

  var featureCallbacks = {
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  var overlayCallbacks = {
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  // If there is a mix, ensure the callbacks are not fired twice. Precedence goes to the overlay visibility callback
  if (overlayIds.length > 0 && featureIds.length > 0) {
    featureCallbacks = {
      onSuccess: function() {},
      onError: function() {}
    };
  }

  var recurse = (args.action === emp3.api.enums.VisibilityActionEnum.SHOW_ALL) || (args.action === emp3.api.enums.VisibilityActionEnum.HIDE_ALL);

  if (featureIds.length > 0) {
    // Since we may be changing overlays or features and each
    // are controlled by different channels, we need to combine messages.
    // First turn on/off all features.  After we receive that response, then
    // we turn on/off each overlay.  Combine transaction responses.

    cmd = {
      features: featureIds,
      parent: parentId,
      recurse: recurse,
      onSuccess: featureCallbacks.onSuccess,
      onError: featureCallbacks.onError
    };

    if (args.action === emp3.api.enums.VisibilityActionEnum.SHOW_ALL ||
      args.action === emp3.api.enums.VisibilityActionEnum.TOGGLE_ON) {
      cmd.cmd = emp3.api.enums.channel.showFeature;
    }
    else if (args.action === emp3.api.enums.VisibilityActionEnum.HIDE_ALL ||
      args.action === emp3.api.enums.VisibilityActionEnum.TOGGLE_OFF) {
      cmd.cmd = emp3.api.enums.channel.hideFeature;
    }

    emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
      mapId: this.geoId,
      source: this,
      method: "Map.setVisibility",
      args: args
    });
  }

  if (overlayIds.length > 0) {
    // Since we may be changing overlays or features and each
    // are controlled by different channels, we need to combine messages.
    // First turn on/off all features.  After we receive that response, then
    // we turn on/off each overlay.  Combine transaction responses.

    cmd = {
      overlays: overlayIds,
      parent: parentId,
      recurse: recurse,
      onSuccess: overlayCallbacks.onSuccess,
      onError: overlayCallbacks.onError
    };

    if (args.action === emp3.api.enums.VisibilityActionEnum.SHOW_ALL ||
      args.action === emp3.api.enums.VisibilityActionEnum.TOGGLE_ON) {
      cmd.cmd = emp3.api.enums.channel.showOverlay;
    }
    else if (args.action === emp3.api.enums.VisibilityActionEnum.HIDE_ALL ||
      args.action === emp3.api.enums.VisibilityActionEnum.TOGGLE_OFF) {
      cmd.cmd = emp3.api.enums.channel.hideOverlay;
    }
    else {
      throw new Error('Invalid Visibility Action ' + args.action);
    }

    emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
      mapId: this.geoId,
      source: this,
      method: "Map.setVisibility",
      args: args
    });
  }
};

/**
 * Retrieves all the overlays of a given map.  This includes any children
 * overlays of the overlays at the root level of the map.
 *
 * @example
 *
 * // Get the overlays
 * map.getAllOverlays({
 *      onSuccess: processOverlays
 * });
 *
 * // In the response, print the names of the overlays.
 * function processOverlays(cbArgs) {
 *
 *      console.log( cbArgs.overlays.length + ' overlays returned' );
 *
 *      console.log("These are the overlay names");
 *
 *      for (var i = 0; i < cbArgs.overlays.length; i++) {
 *          console.log(cbArgs.overlays[i].name);
 *      }
 *
 * }
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {onSuccessOverlaysCallback} [args.onSuccess] Function to call when overlays have been
 * successfully retrieved from the map widget.
 * @param {ErrorCallback} [args.onError] Function to call when an error occurs.
 */
emp3.api.Map.prototype.getAllOverlays = function(args) {
  args = args || {};

  var recursive = true;

  this.readyCheck();

  if (typeof args.onSuccess !== "function") {
    throw new Error("onSuccess argument is required, and must be a function.");
  }

  // Create a get query that retrieves all overlays.
  // We'll check to see if we need to start searching from a parent overlay later.
  var cmd = {
    cmd: emp3.api.enums.channel.get,
    types: ["overlay"],
    select: ["overlayId", "name", "properties", "parentId"],
    recursive: recursive,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.getOverlays",
    args: args
  });
};

/**
 * Retrieves a list of map services that are being used by the map.  Map services
 * are used as backgrounds for the map.  See {@link emp3.api.MapService}
 *
 *
 * @example
 *
 * map.getMapServices({
 *   onSuccess: processServices
 * });
 *
 * // prints out the name of all the services on the map.
 * function processServices( cbArgs ){
 *   alert( cbArgs.services.length + " services returned" );
 *   ...
 *   for( var i in cbArgs.mapServices ) {
 *      var mapService = cbArgs.services[i];
 *      alert(mapService.name);
 *      ...
 *   }
 * }
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {onSuccessMapServicesCallback} args.onSuccess Function to call when
 * layers are successfully retrieved from the Map Widget.
 * @param {ErrorCallback} [args.onError] Function to call when an error
 * occurs.
 */
emp3.api.Map.prototype.getMapServices = function(args) {
  args = args || {};

  this.readyCheck();

  if (typeof args.onSuccess !== "function") {
    throw new Error("onSuccess argument is required, and must be a function.");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.get,
    types: ["feature"],
    select: ["name", "description", "featureId", "url", "format", "params"],
    recursive: true,
    filter: [{
      property: "overlayId",
      // passing the wms overlayId instead of the default WMS overlayId.
      term: emp.wms.manager.getWmsOverlayId(this.geoId)
    }],
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.getMapServices",
    args: args
  });
};

/**
 * Retrieves all the features currently plotted on the map.  This includes
 * features that are hidden through visibility, and features embedded within
 * other features.
 *
 * @example
 *
 * // print the ids of all the features on the map.
 * map.getAllFeatures({
 *  onSuccess: processFeatures
 * });
 *
 * function processFeatures( cbArgs ) {
 *   alert( cbArgs.features.length + 'features are on the map ' );
 *   var ids = [];
 *   for (var i = 0; i < cbArgs.features.length; i++) {
 *    ids.push(cbArgs.features[i].geoId);
 *   }
 *   console.log(ids);
 * }
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {onSuccessFeaturesCallback} args.onSuccess Function to call when the
 * features have been retrieved
 * @param {ErrorCallback} [args.onError] Function to call when an error
 * occurs.
 */
emp3.api.Map.prototype.getAllFeatures = function(args) {
  var cmd;
  //var includeVisibleFeaturesOnly;

  args = args || {};

  this.readyCheck();

  if (typeof args.onSuccess !== "function") {
    throw new Error("Missing argument: onSuccess");
  }

  cmd = {
    cmd: emp3.api.enums.channel.get,
    types: ["feature"],
    select: ["featureId", "format", "overlayId", "name", "properties"],
    recursive: true,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.getFeatures",
    args: args
  });
};


/**
 * Gets the map bounds which represents the current map viewport. Note: some engines
 * may return a bounds slightly larger than the actual map shown, especially in a
 * 3D engine where distinguishing a bounds is somewhat ambiguous.
 *
 * @example
 *
 * var map = new emp3.api.Map();
 * var bounds = map.getBounds();
 *
 * @return {Bounds} Retrieves the current bounds of the map viewport.
 */
emp3.api.Map.prototype.getBounds = function() {
  return {
    north: this.bounds.north,
    south: this.bounds.south,
    east: this.bounds.east,
    west: this.bounds.west
  };
};


/**
 * Retrieves the position of the camera for a 3D map.  The camera
 * specifies the 3D location in space and the current alignment.  See
 * {@link emp3.api.Camera} for details.
 * @return {emp3.api.Camera} retrieves the map's current camera.
 */
emp3.api.Map.prototype.getCamera = function() {
  return emp3.api.CameraManager.getCameraForMap({
    map: this
  });
};

/**
 * Requests a screen capture from the map and returns a base64 image of the
 * map.  The image will be a snapshot of what was displayed on the map at
 * the time it was received.
 *
 * @param {Object} args Parameters are provided as members of the args object.
 *
 * @param {onGetScreenshotSuccessCallback} [args.onSuccess] Function to call
 * when a screenshot of the current view displayed on the map has been captured.
 * @param {ErrorCallback} [args.onError] Function to call when an error occurs.
 */
emp3.api.Map.prototype.getScreenCapture = function(args) {
  var cmd;

  args = args || {};

  this.readyCheck();

  if (typeof args.onSuccess !== "function") {
    throw new Error("onSuccess argument is required, and must be a function.");
  }

  cmd = {
    cmd: emp3.api.enums.channel.statusRequest,
    onSuccess: args.onSuccess,
    onError: args.onError
  };
  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.getScreenshot",
    args: args
  });
};

/**
 * Retrieves the current status of the map that determines its readiness.
 * Map state
 * will either be MAP_NEW, INIT_IN_PROGRESS, MAP_READY,
 * MAP_SWAP_IN_PROGRESS, SHUTDOWN, or SHUTDOWN_IN_PROGRESS.
 * <p>The Map starts out with the MAP_NEW status.  MAP_NEW indicates
 * the map object has just been instantiated but the process of loading the map
 * has not started yet.  This is the default state of the map.  Since map loading
 * occurs the minute the constructor is called, you will probably never receive this state.
 * <p>From MAP_NEW, the map will then go into the INIT_IN_PROGRESS state.  INIT_IN_PROGRESS
 * indicates the map engine is loading.  During this period
 * the map engine is initializing.  The map is not usable in this state.  The map
 * goes into this state almost immediately after the constructor is called.
 * <p>After the map engine initializes, the map engine will notify that it is ready.
 * When this occurs the map is in the MAP_READY state and at this point it is
 * ready to receive commands.  Calling any of the methods on the Map object
 * prior to it being ready will result in an exception being thrown.  The
 * Map will stay in the MAP_READY state until it is either purged or the map
 * engine is swapped out.
 * <p>If you want to destroy the map and remove it from the application you
 * can call the {@link emp3.api.Map#purge|Map.purge} method.  When purge is called,
 * the map changes state to SHUTDOWN_IN_PROGRESS as it releases its resources.
 * Once released, the map will go into SHUTDOWN state.  At this point the map
 * should no longer be used.
 * <p>If you are using a map engine and want to swap engines while running, the
 * map will go from MAP_READY to MAP_SWAP_IN_PROGRESS while it releases the resources
 * of the old map engine, and readies the resources for the new map engine.  Again,
 * after this occurs the map goes back into the MAP_READY state.
 *
 *
 * @example
 * var map = new emp3.api.Map(); {
 * var status = map.getStatus();
 *
 * @returns {emp3.api.enums.MapStateEnum} An enumeration containing the current
 * status of the map.  Will be either INIT_IN_PROGRESS, MAP_NEW, MAP_READY,
 * MAP_SWAP_IN_PROGRESS, SHUTDOWN, or SHUTDOWN_IN_PROGRESS.
 */
emp3.api.Map.prototype.getState = function() {
  // replaces getStatus
  return this.status;
};

/**
 * When running in the browser environment, purge properly removes the map from
 * the DOM container.  The map is considered destroyed at the end state the object
 * should not be used again.
 * <p>
 * This method can only be used when the map is created with
 * the environment parameter set to "browser".  If this method is called in any
 * other map environment, this method will raise an exception.
 *
 * @example
 *
 * // Make sure you've created the map in browser environment.
 * var map1 = new emp3.api.Map({
 *   container: "map-container",
 *   environment: "browser", // this is the default value for 'environment'
 *   engine: {
 *      "engineBasePath": "./emp3-cesium",
 *      "mapEngineId": 'cesium'
 *   }
 * });
 * // do some stuff
 * .
 * .
 * .
 * map1.purge({
 *   onSuccess: function() {
 *     console.log("Map destroyed");
 *   }
 * });
 *
 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {SuccessCallback} args.onSuccess - Occurs when the map has successfully
 * been removed.
 * @param {ErrorCallback} args.onError - Occurs if an error occurred during
 * shutdown of the map.
 */
emp3.api.Map.prototype.purge = function(args) {
  var cmd;

  if ((typeof(this.geoId) !== 'string') || (this.geoId.length === 0)) {
    //throw new Error("This map has already been purged.");
    return;
  }

  if (this.environment !== 'browser') {
    throw new Error("Wrong environment: The map must be in the browser environment to call this method.  You are in environment " + this.environment);
  }

  args = args || {};

  args.onSuccess = args.onSuccess || function() {};
  args.onError = args.onError || function() {};

  cmd = {
    cmd: emp3.api.enums.channel.mapShutdown,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    map: this,
    source: this,
    method: "Map.shutdown",
    args: args
  });

  emp3.api.CameraManager.removeCameraForMap({
    map: this
  });
};

/**
 * Performs a check to ensure the map is ready to receive requests.
 * @private
 * @throws An error if the map status is not emp3.api.enums.MapStateEnum.MAP_READY
 */
emp3.api.Map.prototype.readyCheck = function() {
  if (this.status !== emp3.api.enums.MapStateEnum.MAP_READY) {
    throw new Error("Map is not ready. The Map object has not received a notification that it is ready to begin accepting requests");
  }
};

/**
 * Sets the map bounds which represents the current map viewport. You can set
 * either the bounds of an area or by using a center lat/lon pair and a scale.  Setting the center
 * will keep the current zoom level unless changed by the range parameter. Whether or not the exact bounds provided can be set
 * will depend on the aspect ratio of the map widget and the aspect ratio of the bounds
 * passed in.  In most cases, it will
 * not be possible to set the bounds as requested and the map will use best fit. In these cases the smallest
 * bounds that contains the requested bounds will be set.  The actual bounds used
 * will be returned in the onSuccess callback.
 * @example
 *
 * var map = new emp3.api.Map();
 * map.setBounds({
 *      north: 40,
 *      south: 30,
 *      east: 50,
 *      west: 40,
 *      onSuccess: mapBoundsSet
 *  });
 *
 * function mapBoundsSet ( cbArgs ) {
 *   // read the map bounds that was actually set
 *   var upperLeftLatitude = cbArgs.north;
 *   var upperLeftLongitude = cbArgs.west;
 *   var lowerRightLatitude = cbArgs.south;
 *   var lowerRightLongitude = cbArgs.east;
 *   ...
 * }
 *
 * @param {Bounds} args The new bounds of the map.
 *
 * @param {Boolean} [args.animate=true] Tells the map whether the map should fly to the new location or if it should
 * just "teleport" there.
 *
 * @param {onSuccessBoundsCallback} [args.onSuccess]
 * Function to call when the map bounds have been set by the Map Widget.  Reports
 * the new bounds which may not necessarily be the same as the bounds passed in.
 *
 * @param {ErrorCallback} [args.onError] Function to call when an error occurs.
 */
emp3.api.Map.prototype.setBounds = function(args) {

  var cmd;

  this.readyCheck();

  args = args || {};

  // Check bounds were set correctly
  if (typeof args.north !== 'number') {
    throw new TypeError('Invalid bounds: expected north to be a number');
  }
  if (typeof args.south !== 'number') {
    throw new TypeError('Invalid bounds: expected south to be a number');
  }
  if (typeof args.east !== 'number') {
    throw new TypeError('Invalid bounds: expected east to be a number');
  }
  if (typeof args.west !== 'number') {
    throw new TypeError('Invalid bounds: expected west to be a number');
  }

  // Validate the bounds
  if (args.north > 90.0 || args.north < -90.0) {
    throw new Error('Invalid bounds: north must be between 90.0 and -90.0');
  } else if (args.south > 90.0 || args.south < -90.0) {
    throw new Error('Invalid bounds: south must be between 90.0 and  -90.0');
  } else if (args.south > args.north) {
    throw new Error('Invalid bounds: southern bounds must be below northern bounds');
  } else if (args.east > 180.0 || args.east < -180.0) {
    throw new Error('Invalid bounds: east must be be between -180.0 and 180.0');
  } else if (args.west > 180.0 || args.west < -180.0) {
    throw new Error('Invalid bounds: west must be be between -180.0 and 180.0');
  } else if (args.east < args.west) {
    // Possibly on the IDL, ignore
  }

  cmd = {
    cmd: emp3.api.enums.channel.centerOnBounds,
    north: args.north,
    south: args.south,
    east: args.east,
    west: args.west,
    animate: args.animate,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.setBounds",
    args: args
  });
};

/**
 * Sets the map "camera" (only used in 3D maps) which represents the positioning
 * of the camera above a globe in 3D space.
 *
 * @param {Object} args Parameters are provided as members of the args object.
 *
 * @param {emp3.api.Camera} args.camera A camera object specifying the new location
 * of the camera.
 *
 * @param {boolean} [args.animate = false] Animate the move or not, defaults to false
 *
 * @param {onSuccessCameraCallback} [args.onSuccess]
 * Function to call when the map camera have been set by the Map.
 *
 * @param {ErrorCallback} [args.onError] Function to call when an error occurs.
 */
emp3.api.Map.prototype.setCamera = function(args) {
  var cmd;

  this.readyCheck();

  if (!args.camera) {
    throw new Error("Missing argument(s): camera");
  }

  cmd = {
    cmd: emp3.api.enums.channel.centerOnLocation,
    camera: args.camera,
    animate: args.animate || false,
    onSuccess: args.onSuccess,
    onError: args.onError
  };
  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.setCamera",
    args: args
  });

  emp3.api.CameraManager.setCameraForMap({
    camera: args.camera,
    map: this.geoId
  });
};

/**
 * This will change the map center to focus on a new location. Normal movement will of the map will now center around
 * the new location, which will be kept in the center of the view.
 *
 * If normal movement is desired after centering the map on a LookAt call getCamera after the move and call setCamera with the
 * new camera object. However, due to the asynchronous behavior of the map you must only do this in the onSuccess callback
 * passed in with a setLookAt command.
 *
 * @param {object} args
 * @param {emp3.api.LookAt} args.lookAt LookAt describing the location and camera angle to set the Map view to
 * @param {boolean} [args.animate=false] Animate the map while updating the view
 * @param {SuccessCallback} [args.onSuccess]
 * @param {ErrorCallback} [args.onError]
 *
 * @example <caption>Look at a LAX on the map</caption>
 * var laxLookAt = new emp3.api.LookAt({
 *   latitude: 33.9416,
 *   longitude: -118.4085,
 *   altitude: 100,
 *   range 5000,
 *   tilt: 34
 * });
 *
 * map.setLookAt({
 *   lookAt: laxLookAt,
 *   animate: true,
 *   onSuccess: function() {
 *     var camera = map.getCamera();
 *     map.setCamera({camera:camera});
 *   }
 * });
 */
emp3.api.Map.prototype.setLookAt = function(args) {
  args = args || {};

  this.readyCheck();

  if (!args.lookAt) {
    throw new Error('Missing argument: lookAt');
  }

  var cmd = {
    cmd: emp3.api.enums.channel.lookAtLocation,
    lookAt: args.lookAt,
    animate: args.animate,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.setLookAt",
    args: args
  });

  emp3.api.LookAtManager.setLookAtForMap({
    lookAt: args.lookAt,
    map: this
  });
};

/**
 * Returns the current emp3.api.LookAt for the map
 * @returns {emp3.api.LookAt}
 */
emp3.api.Map.prototype.getLookAt = function() {
  return emp3.api.LookAtManager.getLookAtForMap({
    map: this
  });
};

/**
 * Removes an overlay instance from the root of the map.
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Overlay} args.overlay An Overlay object that will be removed from the root of the map.
 * @param {onSuccessOverlaysCallback} args.onSuccess Function to call when the
 * map succeeds at removing the overlay.
 * @param {ErrorCallback} [args.onError] Function to call when an error
 * occurs.
 *
 */
emp3.api.Map.prototype.removeOverlay = function(args) {
  args = args || {};

  this.readyCheck();

  if (!args.overlay) {
    throw new Error("Missing required parameter: overlay");
  }

  this.removeOverlays({
    overlays: [args.overlay],
    onSuccess: args.onSuccess,
    onError: args.onError
  });
};

/**
 * Removes multiple overlay instances from the root of the map.
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Overlay[]} args.overlays An array of Overlay objects.  The Overlays will be removed in the sequence
 * they are arranged in the array.
 * @param {onSuccessOverlaysCallback} args.onSuccess Function to call when the map succeeds at removing the overlay.
 * @param {ErrorCallback} [args.onError] Function to call when an error occurs.
 */
emp3.api.Map.prototype.removeOverlays = function(args) {
  var cmd;

  args = args || {};

  this.readyCheck();

  if (!args.overlays) {
    throw new Error("Missing required parameter: overlays");
  }

  cmd = {
    cmd: emp3.api.enums.channel.removeOverlay,
    parentId: this.geoId,
    overlays: args.overlays,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.removeOverlays",
    args: args
  });
};

/**
 * Removes a map service from the map.
 *
 * @param {Object} args Parameters are provided as members of the args object.
 *
 * @param {emp3.api.MapService} args.mapService The map service to be removed.
 * @param {onSuccessMapServiceCallback} [args.onSuccess] Called after the MapService
 * is removed from the map.
 * @param {ErrorCallback} [args.onError] Function to call when an error occurs.
 */
emp3.api.Map.prototype.removeMapService = function(args) {
  args = args || {};

  if (!args.mapService) {
    throw new Error("missing argument: mapService");
  }

  var services = [];
  if (Array.isArray(args.mapService)) {
    for (var service in args.mapService) {
      if (args.mapService.hasOwnProperty(service)) {
        services.push(args.mapService[service].geoId);
      }
    }
  }
  else {
    services = [args.mapService];
  }

  var cmd = {
    cmd: emp3.api.enums.channel.unplotFeature,
    // passing the wms overlayId instead of the default WMS overlayId.
    overlayId: emp.wms.manager.getWmsOverlayId(this.geoId),
    features: services,
    onSuccess: args.onSuccess,
    onError: args.onError
  };
  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.removeMapService",
    args: args
  });
};

/**
 * Calculates the bounding box of an overlay, a feature, or set of features and alters the
 * map's viewing area to contain the bounding box.  The zoomTo method takes
 * one of three parameters: feature, overlay, or featureList.  One of the three
 * parameters must be populated, otherwise zoomTo will not work.  When the map
 * zooms and it is a 3D map, the map will be oriented directly over top of the
 * bounding area with heading set to north.  This method will do nothing if the
 * feature does not contain any coordinates, or the overlay contains no features.
 *
 * @example <caption>Zooming to an overlay.</caption>
 *
 * // Adds 3 features to an overlay, then zooms to the overlay
 * // bounds.
 * overlay1.addFeatures({
 *  features: [feature1, feature2, feature3]
 *  onSuccess: function() {
 *    map1.zoomTo({
 *      overlay: overlay1
 *    });
 *  }
 * });
 *
 * @example <caption>Zooming to a feature.</caption>
 *
 * // Adds a feature to the overlay, then zooms to the feature added.
 * overlay1.addFeatures({
 *  features: [feature1]
 *  onSuccess: function() {
 *    map1.zoomTo({
 *      feature: feature1
 *    });
 *  }
 * });
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Feature} [args.feature] Zooms the map to the bounding area of this feature.
 * @param {emp3.api.Overlay} [args.overlay] Zooms the map the the bounding area of this overlay.
 * @param {emp3.api.Feature[]} [args.featureList] Zooms the map to the bounding area of this feature array.
 */
emp3.api.Map.prototype.zoomTo = function(args) {
  var cmd,
    featureIds = [];
  args = args || {};

  this.readyCheck();

  if (!args.feature && !args.overlay && !args.featureList) {
    throw new Error("Missing parameter: feature, overlay or featureList");
  }

  if (args.featureList) {
    if (emp3.api.isArray(args.featureList)) {
      // verify that each item is a feature, and make an array of ids.
      for (var i = 0, j = args.featureList.length; i < j; i += 1) {
        if (!emp3.api.isFeature(args.featureList[i])) {
          window.console.error("Type error: args.featureList contains an object that is not a feature.");
        }
        featureIds.push(args.featureList[i].geoId);
      }

      cmd = {
        cmd: emp3.api.enums.channel.centerOnFeature,
        featureIds: featureIds
      };
    }
  }
  else if (args.overlay) {
    if (emp3.api.isOverlay(args.overlay)) {
      cmd = {
        cmd: emp3.api.enums.channel.centerOnOverlay,
        overlayId: args.overlay.geoId
      };
    }
    else {
      window.console.error("Type error: args.featureList contains an object that is not an overlay.");
    }
  }
  else if (args.feature) {

    if (emp3.api.isFeature(args.feature)) {
      cmd = {
        cmd: emp3.api.enums.channel.centerOnFeature,
        featureId: args.feature.geoId
      };
    }
    else {
      console.error("Type error: args.feature contains an object that is not a feature.");
    }
  }

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.zoomTo",
    args: args
  });
};

/**
 * Give an x/y pixel location, retrieve the lat/lon location of the map.
 * The top left pixel of the map is considered to be 0, 0.
 *
 * _This is a synchronous call._
 *
 * @param  {Object} args Parameters are provided as members of the args object.
 * @param  {Number} args.x The x coordinate of the pixel
 * @param  {Number} args.y The y coordinate of the pixel
 * @returns {emp3.api.GeoPosition}
 */
emp3.api.Map.prototype.containerToGeo = function(args) {

  args = args || {};

  var cmd = {
    cmd: emp3.api.enums.channel.convert,
    conversionType: "offsetPixelToDecimalDegrees",
    x: args.x,
    y: args.y
  };

  var callInfo = {
    mapId: this.geoId,
    source: this,
    method: "map.convert",
    args: args
  };

  return emp3.api.MessageHandler.getInstance().convert(callInfo, cmd);
};

/**
 * Give a pixel location relative to the top left of the map (being 0,0), retrieve the lat/lon
 * in decimal degrees that corresponds to that location.  If on a 3D map, and the pixel location
 * is over sky or space, the value returned will be null.
 *
 * _This is a synchronous call._
 *
 * @param {Object|emp3.api.GeoPosition} args Parameters are provided as members of the args object.
 * @param {number} args.latitude
 * @param {number} args.longitude
 * @returns {{x:number, y:number}}
 */
emp3.api.Map.prototype.geoToContainer = function(args) {

  args = args || {};

  if (typeof args.latitude !== 'number') {
    throw new TypeError('Invalid argument: expected latitude to be a number');
  }
  if (typeof args.longitude !== 'number') {
    throw new TypeError('Invalid argument: expected longitude to be a number');
  }

  var cmd = {
    cmd: emp3.api.enums.channel.convert,
    conversionType: "decimalDegreesToOffsetPixel",
    x: args.longitude,
    y: args.latitude
  };

  var callInfo = {
    mapId: this.geoId,
    source: this,
    method: "Map.getXYFromLatLon",
    args: args
  };

  var containerOffset = emp3.api.MessageHandler.getInstance().convert(callInfo, cmd);

  // Pixels can only be whole numbers
  containerOffset.x = Math.round(containerOffset.x);
  containerOffset.y = Math.round(containerOffset.y);

  return containerOffset;
};


/**
 * Give an x/y pixel location, retrieve the lat/lon location of the map.
 * The top left pixel of the screen is considered to be 0, 0.
 *
 * _This is a synchronous call._
 *
 * @param {object} args
 * @param {number} args.x Absolute screen x-position
 * @param {number} args.y Absolute screen y-position
 * @returns {emp3.api.GeoPosition}
 */
emp3.api.Map.prototype.screenToGeo = function(args) {
  args = args || {};

  if (typeof args.x !== 'number') {
    throw new TypeError('Invalid argument: expected x to be a number');
  }

  if (typeof args.y !== 'number') {
    throw new TypeError('Invalid argument: expected y to be a number');
  }

  var container = document.getElementById(this.container),
    box = container.getBoundingClientRect();

  var offset = {
    top: box.top + (window.pageYOffset || container.scrollTop) - (container.clientTop || 0),
    left: box.left + (window.pageXOffset || container.scrollLeft) - (container.clientLeft || 0)
  };

  var cmd = {
    cmd: emp3.api.enums.channel.convert,
    conversionType: "offsetPixelToDecimalDegrees",
    x: args.x - offset.left,
    y: args.y - offset.top
  };

  var callInfo = {
    mapId: this.geoId,
    source: this,
    method: "map.convert",
    args: args
  };

  return emp3.api.MessageHandler.getInstance().convert(callInfo, cmd);
};

/**
 * Give a latitude and longitude, retrieve the x/y offset of the screen.
 * The top left pixel of the screen is considered to be 0, 0.
 *
 * _This is a synchronous call._
 *
 * @param {Object|emp3.api.GeoPosition} args
 * @param {number} args.latitude
 * @param {number} args.longitude
 * @returns {{x:Number, y: Number}}
 */
emp3.api.Map.prototype.geoToScreen = function(args) {
  args = args || {};

  if (typeof args.latitude !== 'number') {
    throw new TypeError('Invalid argument: expected latitude to be a number');
  }

  if (typeof args.longitude !== 'number') {
    throw new TypeError('Invalid argument: expected longitude to be a number');
  }

  var container = document.getElementById(this.container),
    box = container.getBoundingClientRect();

  var offset = {
    top: box.top + (window.pageYOffset || container.scrollTop) - (container.clientTop || 0),
    left: box.left + (window.pageXOffset || container.scrollLeft) - (container.clientLeft || 0)
  };

  var cmd = {
    cmd: emp3.api.enums.channel.convert,
    conversionType: "decimalDegreesToOffsetPixel",
    x: args.longitude,
    y: args.latitude
  };

  var callInfo = {
    mapId: this.geoId,
    source: this,
    method: "map.convert",
    args: args
  };

  // Get the container offset
  var containerOffset = emp3.api.MessageHandler.getInstance().convert(callInfo, cmd);

  // Adjust for the container within the parent window
  containerOffset.x += offset.left;
  containerOffset.y += offset.top;

  // Can only give pixels in whole numbers
  containerOffset.x = Math.round(containerOffset.x);
  containerOffset.y = Math.round(containerOffset.y);

  return containerOffset;
};

/**
 * Locks or unlocks the map's view in place so the user can or cannot change the bounds of the map. You can change the
 * degree to which the view can be controlled, allowing or disallowing api calls to change the bounds.
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {emp3.api.enums.MapMotionLockEnum} args.mode The degree of control the map has on changing the map bounds.
 */
emp3.api.Map.prototype.setMotionLockMode = function(args) {
  args = args || {};
  this.readyCheck();

  if (args.mode === undefined) {
    throw new Error('Missing Argument: mode');
  }

  var cmd = {
    cmd: emp3.api.enums.channel.lockView,
    lock: args.mode
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.setMotionLockMode",
    args: args
  });
};

/**
 * Swaps the current map engine with a new one. This is for maps that have been set up with multiple map engines like Cesium and Leaflet. If you
 * default your map to start using the Cesium engine in 3D and your user wants to view the map in a 2D mode you can call swapMapEngine to change
 * which engine is viewed.
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {MapEngine} args.engine A map engine configuration object.
 * @param {SuccessCallback} [args.onSuccess] Called after the map has successfully swapped map engines, and the map is ready.
 * @param {ErrorCallback} [args.onError] Called after the map has failed to swap map engines.
 */
emp3.api.Map.prototype.swapMapEngine = function(args) {
  this.readyCheck();
  args = args || {};

  if (!args.engine) {
    throw new Error("An 'engine' argument must be populated");
  }
  if (!args.engine.engineBasePath) {
    throw new Error("An 'engineBasePath' argument must be populated");
  }
  if (!args.engine.mapEngineId) {
    throw new Error("An 'mapEngineId' argument must be populated");
  }
  args.engine.manifestName = args.engine.manifestName || "manifest.js";
  var cmd = {
    cmd: emp3.api.enums.channel.swap,
    engine: args.engine,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  var callInfo = {
    method: "Map.swapMapEngine",
    mapId: this.geoId,
    map: this,
    source: this,
    args: args
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, callInfo);
};

/**
 * Retrieves the direct children of the map. Maps cannot have features as direct children so this will only return
 * overlays and WMS layers.
 *
 * @param {object} args Arguments object
 * @param {emp3.api.Map~getChildrenSuccess} args.onSuccess Success callback
 * @param {ErrorCallback} [args.onError] Error callback
 */
emp3.api.Map.prototype.getChildren = function(args) {
  this.readyCheck();
  args = args || {};

  if (typeof args.onSuccess === 'undefined') {
    throw new Error("Missing Argument: onSuccess");
  }
  else if (typeof args.onSuccess !== "function") {
    throw new TypeError("Invalid Argument: expected onSuccess to be a function");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.get,
    types: ["overlay"],
    select: ["overlayId", "name", "properties", "parentId"],
    recursive: false,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  var callInfo = {
    mapId: this.geoId,
    method: "Map.getChildren",
    source: this,
    args: args
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, callInfo);
};
/**
 * This callback is called when getChildren successfully retrieves children from the storage engine
 * @callback Map~getChildrenSuccess
 * @param {emp3.api.Overlay[]} children
 */

/**
 * Maps do not have parents and this function will not return anything.
 * @returns undefined
 */
emp3.api.Map.prototype.getParents = function() {
  // This returns nothing on purpose
};

/**
 * Returns the visibility state of child. This is specific to the map instance
 * Note: {@link emp3.api.Overlay} may not be children of {@link emp3.api.Feature}.
 * This is a synchronous call.
 *
 * The parent referenced must be a direct parent of the child, nested visibility is not supported in this call.
 *
 * @throws {Error} Will throw if the parent-child relationship is invalid
 * @param {emp3.api.Map|emp3.api.Overlay|emp3.api.Feature} parent
 * @param {emp3.api.Overlay|emp3.api.Feature} child
 * @returns {emp3.api.enums.VisibilityStateEnum}
 *
 * @example <caption>Adding to a UI widget</caption>
 * var visibilityState = map.getInstanceVisibility(overlay, child);
 * if (visibilityState === emp3.api.enums.VisibilityStateEnum.SHOWN) {
 *   myTreeChildren.append(child);
 * }
 */
emp3.api.Map.prototype.getInstanceVisibility = function(parent, child) {
  this.readyCheck();
  var mapGeoId = this.geoId;

  if (!(parent instanceof emp3.api.Map) && !(parent instanceof emp3.api.Overlay) && !(parent instanceof emp3.api.Feature)) {
    throw new TypeError('Invalid argument: parent should be a map, overlay, or feature');
  }
  if (!(child instanceof emp3.api.Overlay) && !(child instanceof emp3.api.Feature)) {
    throw new TypeError('Invalid argument: child should be an overlay or feature');
  }

  // Don't bother checking an impossible relationship
  if (parent instanceof emp3.api.Feature && child instanceof emp3.api.Overlay) {
    throw new Error('Invalid argument: a feature may not be the parent of an overlay');
  }

  var getVisibilityTransaction = new emp.typeLibrary.Transaction({
    intent: emp.intents.control.VISIBILITY_GET,
    mapInstanceId: mapGeoId,
    transactionId: emp3.api.createGUID(),
    sender: mapGeoId,
    originChannel: cmapi.channel.names.CMAPI2_VISIBILITY_GET,
    source: emp.api.cmapi.SOURCE,
    messageOriginator: mapGeoId,
    originalMessageType: cmapi.channel.names.CMAPI2_VISIBILITY_GET,
    items: [{
      coreId: child.geoId,
      parentId: parent.geoId,
      visible: undefined
    }]
  });

  // Note: directly accessing the core here
  var state;
  try {
    emp.storage.visibility.getState(getVisibilityTransaction);
    state = getVisibilityTransaction.items[0].visible;
  }
  catch (err) {
    console.error(err);
  }
  return state;
};

/**
 * Determines the look of a Feature when a it is selected.  The color affects
 * all multipoint graphics, and will be applied as a mask to single point graphics,
 * while the scale only apples to any single point graphics.  When selected, the
 * single point graphics will grow according to the scale passed in.  For example,
 * 1.5 will increase the size of a symbol by 50% (1 keeps the scale at its original
 * size).

 * You do not have to set both values when calling setSelectionStyle.  You can
 * change the color, the scale, or both.
 *
 * Setting the selection style will take affect for anything selected af
 *
 * @example
 * // Change the style of selected items to green, and change the size of
 * // selected icons to be 1.5 times larger than they should be.
 * map.setSelectionStyle({
 *   color: 'FF00FF00',
 *   scale: 1.5
 * });
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {String} [args.color] The color of the highlight of the feature
 * @param {Number} [args.scale] The scale of a selected icon.  Only valid
 * for single point Features.
 */
emp3.api.Map.prototype.setSelectionStyle = function(args) {
  var color,
    scale;

  color = args.color;
  scale = args.scale;

  var cmd = {
    cmd: emp3.api.enums.channel.config,
    color: color,
    scale: scale
  };
  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.setSelectionStyle",
    args: args
  });
};

/**
 * Gets the id objects of the features that are currently are selected on the map.  Selected features are any
 * highlighted features on the map that have been denoted as selected by calling the {@link emp3.api.Map#selectFeature|selectFeature}
 * or {@link emp3.api.Map#selectFeatures|selectFeatures}.
 *
 * _This function is synchronous_
 *
 * @returns {emp3.api.Feature[]} An array of selected features
 *
 * @example
 *
 *  var selectedFeatures = map.getSelected();
 *
 *  console.log( "These are the ids of the features that are selected: "
 *  for (var i = 0; i < selectedFeatures.length; i++) {
 *    window.console.log( selectedFeatures[i].geoId );
 *  }
 */
emp3.api.Map.prototype.getSelected = function() {
  this.readyCheck();
  return emp3.api.MessageHandler.getInstance().getSelected(this.geoId);
};

/**
 * Determines if a feature is selected on the map.  A feature is selected if a developer has called
 * {@link emp3.api.Map#selectFeature|selectFeature(s)} on it.  Selected features appear highlighted on the map.
 *
 * _This function is synchronous_
 *
 * @example
 *
 * var feature = new emp3.api.Point({
 *   geoId: 'point1',
 *   name: 'point1',
 *   position: {
 *    latitude: 40,
 *    longitude: 40
 *   }
 * });
 *
 * var selected = map.isSelected({
 *   feature: feature
 * });
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Feature} args.feature The feature being queried.
 * @return {boolean} true if the feature is selected, false if it is not selected or it cannot be found.
 */
emp3.api.Map.prototype.isSelected = function(args) {
  args = args || {};

  this.readyCheck();

  if (!args.feature) {
    throw new Error('Missing argument: feature');
  }

  return emp3.api.MessageHandler.getInstance().isSelected(this.geoId, args.feature.geoId);
};

/**
 * Removes the highlight from a selected Feature on the map.  The feature's
 * selection style is removed and the feature will return to its ordinary look
 * prior to selection.  If feature is not found, map will ignore the call.
 *
 * @example
 *
 * // adds feature1 to overlay1.
 * overlay1.addFeature({
 *  feature: feature1,
 *  onSuccess: function() {
 *    map1.selectFeature({
 *      feature: feature1
 *    });
 *
 *    // after 5 seconds, this timeout will deselect the feature.
 *    setTimeout(function() {
 *        // deselects the feature that was selected
 *        map1.deselectFeature({
 *          feature: feature1
 *        });
 *    }, 5000);
 *  }
 * });
 *
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Feature} args.feature The feature that is being deselected.
 *    exist on map and be selected.
 * @param {emp3.api.Map~deselectFeaturesCallback} [args.onSuccess]
 * @param {ErrorCallback} [args.onError]
 */
emp3.api.Map.prototype.deselectFeature = function(args) {
  args = args || {};

  this.readyCheck();

  if (!args.feature) {
    throw new Error("Missing argument: feature");
  }

  this.deselectFeatures({
    features: [args.feature],
    onSuccess: args.onSuccess,
    onError: args.onError
  });
};

/**
 * Removes the highlight from a selected Feature on the map.  The feature's
 * selection style is removed and the feature will return to its ordinary look
 * prior to selection.  If feature is not found, the map ignores the call.
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Feature[]} args.features The feature that is being deselected.
 *    exist on map and be selected.
 * @param {emp3.api.Map~deselectFeaturesCallback} [args.onSuccess]
 * @param {ErrorCallback} [args.onError]
 */
emp3.api.Map.prototype.deselectFeatures = function(args) {
  args = args || {};

  this.readyCheck();

  if (!args.features) {
    throw new Error("Missing argument: features");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.featureDeselectedBatch,
    features: args.features,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.deselectFeatures",
    args: args
  });
};


/**
 * Selects a feature on the map. Any selected features will show on the map as a highlighted graphic.  Selected features are used to give a
 * user context for future actions.  For example, you can select a number of features on the map, and at a later time (say maybe in response to a context
 * menu click) program the map to delete the selected features.
 *
 * To remove the highlight from a feature you can use {@link emp3.api.Map#clearSelected|clearSelected},
 * {@link emp3.api.Map#deselectFeature|deselectFeature} or {@link emp3.api.Map#deselectFeatures|deselectFeatures}.
 *
 * {@link emp3.api.Map#clearSelected|clearSelected} de-selects all selected Features, while {@link emp3.api.Map#deselectFeature|deselectFeatures(s)}
 * de-selects given features.
 *
 * The default selection highlight will change line colors to yellow, additionally if the feature is a single point (Points, single point MilStdFeature)
 * it will increase the scale by 1.2. The selection style can be altered by calling Map.setSelectionStyle.
 *
 * It is important to note that selection is not automatically enabled by
 *
 * the map user interface.  Clicking on a feature does not select the feature automatically. To allow users to select
 * on a feature-click you must add the selectFeature(s) call in response to a {@link emp3.api.events.FeatureUserInteractionEvent|FeatureUserInteractionEvent}.
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Feature} args.feature The features to select.
 * @param {emp3.api.Map~selectFeaturesCallback} [args.onSuccess]
 * @param {ErrorCallback} [args.onError]
 *
 * @example <caption>Select a symbol when it is clicked by a user.</caption>
 *
 * map1.addEventListener({
 *  eventType: emp3.api.enums.EventType.FEATURE_INTERACTION,
 *  callback: featureClickListener
 * });
 *
 * function featureClickListener ( cbArgs ) {
 *   if (cbArgs.event === emp3.api.enums.UserInteractionEventEnum.CLICKED) {
 *     map.selectFeature({
 *       feature: cbArgs.target[0]
 *     });
 *   }
 * }
 */
emp3.api.Map.prototype.selectFeature = function(args) {
  args = args || {};

  this.readyCheck();

  if (!args.feature) {
    throw new Error("Missing argument: feature");
  }

  this.selectFeatures({
    features: [args.feature],
    onSuccess: args.onSuccess,
    onError: args.onError
  });
};

/**
 * Selects multiple features on the map. Any selected features will show on the map as a highlighted graphic.  Selected
 * features are used to give a user context for future actions.  For example, you can select a number of features on
 * the map, and at a later time (say maybe in response to a context menu click) program the map to delete the selected
 * features.
 *
 * To de-select a feature you can use {@link emp3.api.Map#clearSelected|clearSelected},
 * {@link emp3.api.Map#deselectFeature|deselectFeature} or {@link emp3.api.Map#deselectFeatures|deselectFeatures}.
 * {emp3.api.Map#clearSelected|clearSelected} de-select any selected Features, while Map.deselectFeature(s) de-select
 * one or more features.
 *
 * The default selection highlight will change line colors to yellow.
 * The selection style can be altered by calling {@link emp3.api.Map#setSelectionStyle|setSelectionStyle}
 *
 * It is important to note that selection is not automatically enabled by the map user interface.
 * To allow users to highlight on a feature-click you must add the selectFeature(s) call in response to a {@link emp3.api.events.FeatureUserInteractionEvent}.
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {emp3.api.Feature[]} args.features The features to select.
 * @param {emp3.api.Map~selectFeaturesCallback} args.onSuccess
 * @param {ErrorCallback} [args.onError]
 *
 * @example <caption>Select features</caption>
 * map0.selectFeatures({
 *   features: [feature1, feature2, feature3],
 *   onSuccess: function() {
 *     // Further notification or alerting other parts of the application
 *   }
 * });
 */
emp3.api.Map.prototype.selectFeatures = function(args) {
  args = args || {};

  this.readyCheck();

  if (!args.features) {
    throw new Error("Missing argument: features");
  }

  var cmd = {
    cmd: emp3.api.enums.channel.featureSelectedBatch,
    features: args.features,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.selectFeatures",
    args: args
  });
};

/**
 * Clears the current feature selection on the map. This function universally deselects all features, whether they were
 * selected by you or by another program.
 *
 * @example
 *
 * map.selectFeatures({
 *   features: [feature1, feature2, feature3]
 * });
 *
 * // Later after completing any tasks with the selection clear the selection
 * map.clearSelected();
 */
emp3.api.Map.prototype.clearSelected = function() {
  this.readyCheck();

  var cmd = {
    cmd: emp3.api.enums.channel.featureDeselected,
    mapId: this.geoId
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.geoId,
    source: this,
    method: "Map.clearSelected",
    args: {}
  });
};

/**
 * Lightens or darkens the background map.  Value can be
 * 0-100 with 50 as default. At 50, the map background is displayed without any
 * modifications.  Below 50 the map background will get darker and above 50 the
 * map background will get lighter. At zero the map background is fully black.  At 100
 * the map is fully white.
 * <p>
 * Values above 100 will set the value of 100 and below 0 will set the value to 0.
 *
 * @param {Number} brightness A value between 0 and 100.
 *
 */
emp3.api.Map.prototype.setBackgroundBrightness = function(brightness) {
  if (brightness === undefined) {
    brightness = 50;
  }

  if (brightness > 100) {
    brightness = 100;
  } else if (brightness < 0) {
    brightness = 0;
  }

  var cmd = {
    cmd: emp3.api.enums.channel.config,
    brightness: brightness
  };

  var callInfo = {
    mapId: this.geoId,
    source: this,
    method: "Map.setBackgroundBrightness",
    args: {
      brightness: brightness
    }
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, callInfo);

  this.brightness = brightness;
};

/**
 * This function should not be called to clear all classes. It is preferable to remove individual overlays as necessary.
 *
 * @param args
 * @param {emp3.api.Map~clearContainerCallback} [args.onSuccess]
 * @param {ErrorCallback} [args.onError]
 */
emp3.api.Map.prototype.clearContainer = function(args) {
  args = args || {};

  // Format the request
  var cmd = {
    cmd: emp3.api.enums.channel.clearMap,
    overlay: this,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    source: this,
    method: "Map.clearContainer",
    args: args
  });
};

/**
 * Retrieves the background brightness setting from the map.  See {@link emp3.api.Map#setBackgroundBrightness|Map.setBackgroundBrightness}
 *
 * @return {Number} The brightness of the map.  A number between 0-100.
 */
emp3.api.Map.prototype.getBackgroundBrightness = function() {
  return this.brightness;
};
