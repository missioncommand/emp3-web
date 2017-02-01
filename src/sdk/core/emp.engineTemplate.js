var emp = window.emp || {};
emp.map = emp.map || {};

/**
 * @version 2.1
 * @description This function returns an object with all the namespaces and abstract functions required for a map engine.
 * When developing a map engine, the first part of the js file for your map engine should be a call to get a new template for the engine.
 * This template is for the public interface that your map engine will expose.
 * All of the internal functions and properties of your map engine should not be added to this template
 *
 * @return {engineInterface}
 */
emp.map.createEngineTemplate = function() {

  var ENGINE_INTERFACE_CN = "MAP_CORE_ENGINE_INTERFACE";
  /**
   * @namespace engineInterface
   * @description A public interface is returned as an engineInterface instance when
   * emp.map.createEngineTemplate() is invoked. This is designed to use functional inheritance.
   * Do not use the "new" keyword.
   */
  var engineInterface = {};

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Namespace that contains all the implementation information.
   */
  engineInterface.implementation = {};

  /**
   * @memberOf engineInterface
   * @constant
   * @field
   * @description The implementation should provide a proper string
   * that visually identifies the implementation.
   */
  engineInterface.implementation.displayName = "Map Engine";

  /**
   * @memberOf engineInterface
   * @constant
   * @field
   * @description The implementation should provide the
   * map engine's implementation version.
   */
  engineInterface.implementation.version = "1.0";

  /**
   * @memberOf engineInterface.implementation
   * @namespace
   * @description Namespace that contains all the implementation help text.
   */
  engineInterface.implementation.help = {};

  /**
   * @memberOf engineInterface.implementation.help
   * @constant
   * @field
   * @description The implementation should provide the
   * map engine's Edit mode help screen. The string shall be displayed
   * in a help window that allows full html. However the engine
   * must escape the text if html is present.
   */
  engineInterface.implementation.help.edit = "This map engine does not provide a help screen at this time.";

  /**
   * @memberOf engineInterface.implementation.help
   * @constant
   * @field
   * @description The implementation should provide the
   * map engine's Draw mode help screen. The string shall be displayed
   * in a help window that allows full html. However the engine
   * must escape the text if html is present.
   */
  engineInterface.implementation.help.draw = "This map engine does not provide a help screen at this time.";

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Namespace that contains all the implementation capabilities.
   */
  engineInterface.capabilities = {};

  /**
   * @memberOf engineInterface.capabilities
   * @namespace
   * @description Namespace that contains all the implementation map type.
   */
  engineInterface.capabilities.mapType = {};

  /**
   * @memberOf engineInterface.capabilities
   * @namespace
   * @description Namespace that contains all the maps projection
   * capabilities.
   */
  engineInterface.capabilities.projection = {};

  /**
   * @memberOf engineInterface.capabilities.projection
   * @constant
   * @type boolean
   * @description The map engine implementation that provides map flat projection
   * map must overwrite this field with a value of true.
   */
  engineInterface.capabilities.projection.flat = false;

  /**
   * @memberOf engineInterface.capabilities.mapType
   * @constant
   * @type boolean
   * @description The map engine implementation that provides a two dimension
   * map must overwrite this field with a value of true.
   */
  engineInterface.capabilities.mapType.type2D = false;

  /**
   * @memberOf engineInterface.capabilities.mapType
   * @constant
   * @type boolean
   * @description The map engine implementation that provides a 2.5 dimension
   * map must overwrite this field with a value of true.
   * 2.5D refers to a flat map that can be tilted and rotated
   */
  engineInterface.capabilities.mapType.type2_5D = false;

  /**
   * @memberOf engineInterface.capabilities.mapType
   * @constant
   * @type boolean
   * @description The map engine implementation that provides a three dimension
   * map must overwrite this field with a value of true.
   */
  engineInterface.capabilities.mapType.type3D = false;

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Namespace that contains all the format capabilities supported
   * by the map implementation.
   */
  engineInterface.capabilities.formats = {};

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Support for geojson single Point, LineString, and Polygon.
   */
  engineInterface.capabilities.formats.GEOJSON_BASIC = {};

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports plotting simple
   * GEOJSON Point, LineString, and Polygon
   */
  engineInterface.capabilities.formats.GEOJSON_BASIC.plot = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports drawing of simple
   * GEOJSON Point, LineString, and Polygon
   */
  engineInterface.capabilities.formats.GEOJSON_BASIC.draw = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports editting of simple
   * GEOJSON Point, LineString, and Polygon
   */
  engineInterface.capabilities.formats.GEOJSON_BASIC.edit = false;

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Support for full geojson Point, LineString, Polygon, MultiPolygon,
   * Feature, Geometry, "FeatureCollection", GeometryCollection, properties, etc...
   */
  engineInterface.capabilities.formats.GEOJSON_FULL = {};

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports plotting
   * full GEOJSON spec.
   */
  engineInterface.capabilities.formats.GEOJSON_FULL.plot = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports drawing of
   * full GEOJSON spec.
   */
  engineInterface.capabilities.formats.GEOJSON_FULL.draw = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports editting of
   * full GEOJSON spec.
   */
  engineInterface.capabilities.formats.GEOJSON_FULL.edit = false;

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Support for displaying maps hosted on a WMS server.
   */
  engineInterface.capabilities.formats.WMS = {};

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports WMS version 1.1.
   */
  engineInterface.capabilities.formats.WMS.version_1_1 = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports WMS version 1.3.
   */
  engineInterface.capabilities.formats.WMS.version_1_3 = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports WMS elevation data
   */
  engineInterface.capabilities.formats.WMS.elevationData = false;

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Support for displaying maps hosted on a WMTS server.
   */
  engineInterface.capabilities.formats.WMTS = {};

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports WMTS version 1.0.0
   */
  engineInterface.capabilities.formats.WMTS.version_1_0_0 = false;

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Support for displaying maps with a KML or KMZ link.
   */
  engineInterface.capabilities.formats.KML_LAYER = {};

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Support for simple geometry KML data
   */
  engineInterface.capabilities.formats.KML_BASIC = {};

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports plotting
   * simple KML data
   */
  engineInterface.capabilities.formats.KML_BASIC.plot = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports drawing of
   * simple KML data
   */
  engineInterface.capabilities.formats.KML_BASIC.draw = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports editting of
   * simple KML data
   */
  engineInterface.capabilities.formats.KML_BASIC.edit = false;

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Support for complex KML data
   */
  engineInterface.capabilities.formats.KML_COMPLEX = {};

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports plotting
   * complex KML data
   */
  engineInterface.capabilities.formats.KML_COMPLEX.plot = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports drawing
   * complex KML data
   */
  engineInterface.capabilities.formats.KML_COMPLEX.draw = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports editing
   * complex KML data
   */
  engineInterface.capabilities.formats.KML_COMPLEX.edit = false;

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Support for image data
   */
  engineInterface.capabilities.formats.IMAGE = {};

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports plotting
   * image data
   */
  engineInterface.capabilities.formats.IMAGE.plot = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports editing
   * image data
   */
  engineInterface.capabilities.formats.IMAGE.edit = false;

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Support for MilStd feature data.
   */
  engineInterface.capabilities.formats.MILSTD = {};

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Support for MilStd 2525B feature data.
   */
  engineInterface.capabilities.formats.MILSTD.version2525B = {};

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports plotting
   * MilStd 2525B data.
   */
  engineInterface.capabilities.formats.MILSTD.version2525B.plot = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports drawing of
   * MilStd 2525B data.
   */
  engineInterface.capabilities.formats.MILSTD.version2525B.draw = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports editing of
   * MilStd 2525B data.
   */
  engineInterface.capabilities.formats.MILSTD.version2525B.edit = false;

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Support for MilStd 2525C feature data.
   */
  engineInterface.capabilities.formats.MILSTD.version2525C = {};

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports plotting
   * MilStd 2525C data.
   */
  engineInterface.capabilities.formats.MILSTD.version2525C.plot = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports drawing of
   * MilStd 2525C data.
   */
  engineInterface.capabilities.formats.MILSTD.version2525C.draw = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports editing
   * MilStd 2525C data.
   */
  engineInterface.capabilities.formats.MILSTD.version2525C.edit = false;

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Support for 3D airspace feature data.
   */
  engineInterface.capabilities.formats.AIRSPACE = {};

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports plotting
   * 3D airspace data.
   */
  engineInterface.capabilities.formats.AIRSPACE.plot = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports drawing
   * 3D airspace data.
   */
  engineInterface.capabilities.formats.AIRSPACE.draw = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports editing
   * 3D airspace data.
   */
  engineInterface.capabilities.formats.AIRSPACE.edit = false;

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Support for Area of Interest (AOI) feature data.
   */
  engineInterface.capabilities.formats.AOI = {};

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports plotting
   * Area of Interest (AOI) data.
   */
  engineInterface.capabilities.formats.AOI.plot = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports drawing of
   * Area of Interest (AOI) data.
   */
  engineInterface.capabilities.formats.AOI.draw = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports editing of
   * Area of Interest (AOI) data.
   */
  engineInterface.capabilities.formats.AOI.edit = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports plotting
   * dynamic ArcGIS rest services.
   */
  engineInterface.capabilities.formats.ArcGIS = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports
   * overlay clustering.
   */
  engineInterface.capabilities.overlayClustering = false;

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Support setting default parameters.
   */
  engineInterface.capabilities.settings = {};

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Support setting default parameters.
   */
  engineInterface.capabilities.settings.milstd = {};

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports setting
   * a default icon size.
   */
  engineInterface.capabilities.settings.milstd.iconSize = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports setting
   * a default icon labels.
   */
  engineInterface.capabilities.settings.milstd.labelOption = false;

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description An implementation must overwrite this value if it supports setting
   * the .
   */
  engineInterface.capabilities.settings.iconSize = false;

  /**
   * @memberOf engineInterface
   * @namespace
   * @description Namespace that contains all the engine implementation requirements.
   */
  engineInterface.requirements = {};

  /**
   * @memberOf engineInterface
   * @constant
   * @type boolean
   * @description The engine implementation that requires the capabilities of a WMS
   * service must set this value to true.
   */
  engineInterface.requirements.wmsCapabilities = false;

  /**
   * @memberOf engineInterface
   * @namespace
   * @desc This namespace encapsulates the initialization processing.
   */
  engineInterface.initialize = {};
  /**
   * @memberOf engineInterface.initialize
   * @abstract
   * @public
   * @param {Object} args - The args represent what the particular map engine needs or success it raised.  We will not define this.
   * @desc This methods purpose is to provide a location in which a map implementation can perform post start up
   * processing such as setting default location, loading default layers, and other things that should happen after the
   * map has loaded.  This function should be called internally by the map engine implementation after it knows the map is ready.  If the map
   * engine fails during initialization the function map.engine.initialize.fail should be called instead.
   * <p>
   * Once any post processing is done the implementation should issue a emp.map.eventing.StatusChange event indicating the map is
   * ready.  See {@link emp.map.eventing.StatusChange} for details on generating the status change event.
   *
   * @param {object} [args] A custom parameter that can contain anything needed for post-map-initialization processing. Since the engine
   * is responsible for executing the initialize, this will be populated by the engine.
   *
   * @example An implementation of engineInterface.initialize
   *
   * // This function is launched by the manifest file
   * function mapInitializing() {
   *
   *     // Do some map initialization stuff...
   *
   *     // call the succeed function to indicate the map is ready to
   *     emp.map.engine.initialize.succeed({
   *         map: getMap()    // this can be whatever you want it to pass into succeed.
   *     });
   * }
   *
   * engineInterface.initialize.succeed = function (args) {
   *     // map has finished successfully initializing, set default values for
   *     // view.
   *
   *     // call private function that sets map view.
   *     setDefaultMapView();
   *
   *     // notify the map core that the map is now ready.
   *     new emp.map.eventing.StatusChange({
   *         status: emp.map.states.READY
   *     });
   * }
   *
   *
   */
  engineInterface.initialize.succeed = function(args) { // eslint-disable-line no-unused-vars
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to create an error event indicating this method has not be overridden from its abstract state
    new emp.map.eventing.Error({
      coreId: ENGINE_INTERFACE_CN,
      level: 2,
      message: "Error: The fail method has not been overridden and is not supported by this map engine instance"
    });

  };

  /**
   * @memberOf engineInterface.initialize
   * @abstract
   * @public
   * @param {Object} [args] A custom parameter that can contain anything needed for handling an issue that occurred
   * during initialization. Since the engine is responsible for executing the initialization, this parameter is
   * populated by the engine.
   *
   * @desc The purpose of this method is to provide a location in which a map implementation can perform post start up
   * processing in the event that the map fails to initialize. It should be called by the map engine implementation if the engine
   * fails while initializing. The method should send a new emp.map.eventing.StatusChange event with the newStatus being
   * emp.map.states.ERROR.
   * @method
   *
   * @example
   *
   * function initializeMap() {
   *     try {
   *
   *          // do some map initialization
   *          // if it passes call emp.map.engine.initialize.succeed()
   *
   *     } catch(e) {
   *         // map initialization failed
   *         emp.map.engine.initialize.fail({
   *             exception: e
   *         });
   *     }
   * }
   *
   * engineInterface.initialize.fail = function (args) {
   *
   * }
   */
  engineInterface.initialize.fail = function(args) { // eslint-disable-line no-unused-vars
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to create an error event indicating this method has not be overridden from its abstract state
    new emp.map.eventing.Error({
      coreId: ENGINE_INTERFACE_CN,
      level: 2,

      message: "Error: The fail method has not been overridden and is not supported by this map engine instance"
    });
  };

  /**
   * @memberOf engineInterface
   * @namespace
   * @desc This namespace encapsulates all the map engines map preferences.
   */
  engineInterface.map = {};

  /**
   * @memberOf engineInterface.map
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The transaction object is required to
   * set the cursor mode
   * @param {Object[]} transaction.items - An array of configuration settings.
   *
   * @param {Array} transaction.items - An array containing a single {@link emp.map.cursor} enumeration string value at position 0.
   * @desc Sets global configuration preferences for the map.  Preferences include
   * the default behavior for MIL-STD-2525 warfighting symbols (labels, size, point vs symbol),
   * to default image sizes for icons.
   *
   */
  engineInterface.map.config = function(transaction) {
    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface
   * @namespace
   * @desc This namespace encapsulates all the map engines cursor functionality.
   */
  engineInterface.cursor = {};

  /**
   * @memberOf engineInterface.cursor
   * @namespace
   * @desc This namespace encapsulates the cursor mode processing functionality.
   */
  engineInterface.cursor.mode = {};

  /**
   * @memberOf engineInterface.cursor.mode
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The transaction object is required to
   * set the cursor mode
   * @param {Array} transaction.items - An array containing a single {@link emp.map.cursor} enumeration string value at position 0.
   * @desc This function sets the cursor modes (highlighting verses navigation / selection) functionality.
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   * @method
   */
  engineInterface.cursor.mode.set = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface.cursor.mode
   * @abstract
   * @public
   * @param {emp.typeLibrary.Transaction} transaction - The transaction object is required to
   * get the cursor's mode.
   * @desc This function gets the current mode of the cursor.
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   * @method
   */
  engineInterface.cursor.mode.get = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface
   * @namespace
   * @desc This namespace encapsulates all screen capture capabilities.
   */
  engineInterface.capture = {};

  /**
   * @memberOf engineInterface.capture
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The transaction object is required to
   * get the map status.
   * @desc This function is called to capture a base64 data URI string of a PNG of JPEG of the map if supported.
   * <p>
   * If all processing is completed within this method. In
   * the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   * @method
   */
  engineInterface.capture.screenshot = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface
   * @namespace
   * @desc This namespace encapsulates all status capabilities of the map engine.
   */
  engineInterface.status = {};

  /**
   * @memberOf engineInterface.status
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {Array} transaction.items - The items contains an array of {@link Status} objects that was
   * retrieved from the map
   * @desc This function gets the map status.If this function is
   * overrode, the {@link Status} object should be created and pushed to the transaction.items prior to
   * completing the transaction.
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   * @method
   */
  engineInterface.status.get = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.
    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface
   * @namespace
   * @desc This namespace encapsulates all state processing.
   */
  engineInterface.state = {};

  /**
   * @memberOf engineInterface.state
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The transaction object is required to
   * reset the map.
   * @desc This function removes all map data and puts the map in its initial state.
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   * @method
   */
  engineInterface.state.reset = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface.state
   * @abstract
   * @public
   * @returns {boolean}
   * destroy the state
   * @desc This is the function called when this map is being replaced by a different map engine to do any cleanup required by that engine.
   * This will run synchronously and the map engine swap code will execute immediately following the return of this function.
   * All memory allocations must be freed and the engine implementation left in a known state. This is required
   * due to the javascript files utilized by the implementation are NOT unloaded and can be restarted if the
   * user swaps back to the engine.
   * @method
   */
  engineInterface.state.destroy = function() {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to do nothing.
    new emp.map.eventing.Error({
      coreId: ENGINE_INTERFACE_CN,
      level: 2,
      message: "Error: The state.destroy method has not been overridden and is not supported by this map engine instance.  This may lead to issues during map swapping."
    });
  };

  /**
   * @memberOf engineInterface
   * @namespace
   * @desc This namespace encapsulates the visibility operation for the engine implementation.
   */
  engineInterface.visibility = {};

  /**
   * @memberOf engineInterface.visibility
   * @public
   * @abstract
   * @description This method is called by the core to instruct the map engine to set the visibility of objects.
   * A map engine implementation must implement this method to handle the visibility set operations.
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * @param {Array} transaction.items - The items contains an array of object instances that can be Overlay, Feature,
   * WMS, or Static.
   */
  engineInterface.visibility.set = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.
    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface
   * @namespace
   * @desc This namespace encapsulates all overlay processing capabilities
   */
  engineInterface.overlay = {};

  /**
   * @desc Adds overlays to the map.
   *
   * Transaction.items of type {@link Overlay} are added to the map. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * @example
   * engineInterface.overlay.add = function(transaction{
   *
   *      for (var i = 0; i < transaction.items.length; i += 1) {
   *          var item = transaction.items[i];
   *
   *
   *
   *          if(!success){
   *              // If the error is due to a try catch block the error provided by the catch should be added as the jsError property of the Error
   *              // If there is no error object from a try catch block the jsError property can be omitted or set to null
   *              transaction.fail([{coreId: item.coreId, level: <i>error level</i> see {@link emp.typeLibrary.Error.level}, message: "Optional custom error message", jsError: null}]);
   *          }
   *      }//end for loop
   *      return true;
   * }//end function
   *
   * @memberOf engineInterface.overlay
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {Array} transaction.items - The items contains an array of {@link Overlay} objects to
   * add to the map.
   *
   *
   * @method
   */
  engineInterface.overlay.add = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @desc Removes overlays from the map.
   *
   * ~Transaction.items~ of type {@link Overlay} are removed from the map. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.
   *
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * @example
  engineInterface.overlay.remove = function(transaction{

      for (var i = 0; i < transaction.items.length; i += 1) {
          var item = transaction.items[i];



          if(!success){
              // If the error is due to a try catch block the error provided by the catch should be added as the jsError property of the Error
              // If there is no error object from a try catch block the jsError property can be omitted or set to null
              transaction.fail([{coreId: item.coreId, level: <i>error level</i> see {@link emp.typeLibrary.Error.level}, message: "Optional custom error message", jsError: null}]);
          }
      }//end for loop
  }//end function
   *
   * @memberOf engineInterface.overlay
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {Array} transaction.items - The items contains an array of {@link Overlay} objects to  be
   * removed from the map
   * @method
   */
  engineInterface.overlay.remove = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @desc Updates overlays on the map such as its name, parent.
   *
   * Transaction.items of type {@link Overlay} are updated on the map. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.
   *
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * @example
  engineInterface.overlay.update = function(transaction{

      for (var i = 0; i < transaction.items.length; i += 1) {
          var item = transaction.items[i];



          if(!success){
              // If the error is due to a try catch block the error provided by the catch should be added as the jsError property of the Error
              // If there is no error object from a try catch block the jsError property can be omitted or set to null
              transaction.fail([{coreId: item.coreId, level: <i>error level</i> see {@link emp.typeLibrary.Error.level}, message: "Optional custom error message", jsError: null}]);
          }
      }//end for loop
  }//end function
   *
   *
   * @memberOf engineInterface.overlay
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {Array} transaction.items - The items contains an array of {@link Overlay} objects to
   * updated on this map
   * @method
   */
  engineInterface.overlay.update = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @desc Clears contents of existing overlays on the map.
   *
   * Transaction.items of type {@link Overlay} are cleared of their contents on the map. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.
   *
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * @example
  engineInterface.overlay.clear = function(transaction{

      for (var i = 0; i < transaction.items.length; i += 1) {
          var item = transaction.items[i];



          if(!success){
              // If the error is due to a try catch block the error provided by the catch should be added as the jsError property of the Error
              // If there is no error object from a try catch block the jsError property can be omitted or set to null
              transaction.fail([{coreId: item.coreId, level: <i>error level</i> see {@link emp.typeLibrary.Error.level}, message: "Optional custom error message", jsError: null}]);
          }
      }//end for loop
  }//end function
   *
   * @memberOf engineInterface.overlay
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {Array} transaction.items - The items contains an array of {@link Overlay} objects to
   * be cleared.
   * @method
   */
  engineInterface.overlay.clear = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };
  /**
   *
   * @memberOf engineInterface.overlay
   * @namespace
   * @desc Namspace for overlay clustering functions.
   */
  engineInterface.overlay.cluster = {};
  /**
   * @desc Sets the clustering stratgey of an existing overlay on the map.
   *
   * Transaction.items of type {@link Cluster} are applied to the given overlay. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.
   *
   * <p>
   * If all processing is completed within this method, it should return true to allow the transaction to terminate. In
   * the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pause a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * @example
  engineInterface.overlay.cluster.set = function(transaction{

      for (var i = 0; i < transaction.items.length; i += 1) {
          var item = transaction.items[i];



          if(!success){
              // If the error is due to a try catch block the error provided by the catch should be added as the jsError property of the Error
              // If there is no error object from a try catch block the jsError property can be omitted or set to null
              transaction.fail([{coreId: item.coreId, level: <i>error level</i> see {@link emp.typeLibrary.Error.level}, message: "Optional custom error message", jsError: null}]);
          }
      }//end for loop
      return true;
  }//end function
   *
   * @memberOf engineInterface.overlay.cluster
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {Array} transaction.items - The items contains an array with a single {@link Cluster} object at position 0 of the items array to
   * be applied to the given overlay.
   * @method
   */
  engineInterface.overlay.cluster.set = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.
    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "The engineInterface.overlay.cluster.set function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @desc Hides or disables the clustering stratgey of an existing overlay on the map.
   *
   * Transaction.items of type {@link Cluster} are applied to the given overlay. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.
   *
   * <p>
   * If all processing is completed within this method, it should return true to allow the transaction to terminate. In
   * the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pause a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * @example
  engineInterface.overlay.cluster.deactivate = function(transaction{

      for (var i = 0; i < transaction.items.length; i += 1) {
          var item = transaction.items[i];



          if(!success){
              // If the error is due to a try catch block the error provided by the catch should be added as the jsError property of the Error
              // If there is no error object from a try catch block the jsError property can be omitted or set to null
              transaction.fail([{coreId: item.coreId, level: <i>error level</i> see {@link emp.typeLibrary.Error.level}, message: "Optional custom error message", jsError: null}]);
          }
      }//end for loop
      return true;
  }//end function
   *
   * @memberOf engineInterface.overlay.cluster
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {Array} transaction.items - The items contains an array with a single overlayId at position 0 of the items array.
   * @method
   */
  engineInterface.overlay.cluster.deactivate = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.
    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "The engineInterface.overlay.cluster.deactivate function is not supported by the map implementation."
      }]);
    }
  };
  /**
   * @desc Shows or activates the clustering stratgey of an existing overlay on the map.
   *
   * Transaction.items of type {@link Cluster} are applied to the given overlay. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.
   *
   * <p>
   * If all processing is completed within this method, it should return true to allow the transaction to terminate. In
   * the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pause a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * @example
  engineInterface.overlay.cluster.activate = function(transaction{

      for (var i = 0; i < transaction.items.length; i += 1) {
          var item = transaction.items[i];



          if(!success){
              // If the error is due to a try catch block the error provided by the catch should be added as the jsError property of the Error
              // If there is no error object from a try catch block the jsError property can be omitted or set to null
              transaction.fail([{coreId: item.coreId, level: <i>error level</i> see {@link emp.typeLibrary.Error.level}, message: "Optional custom error message", jsError: null}]);
          }
      }//end for loop
      return true;
  }//end function
   *
   * @memberOf engineInterface.overlay.cluster
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {Array} transaction.items - The items contains an array with a single overlayId at position 0 of the items array.
   * @method
   */
  engineInterface.overlay.cluster.activate = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.
    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "The engineInterface.overlay.cluster.activate function is not supported by the map implementation."
      }]);
    }
  };
  /**
   * @desc Shows or activates the clustering stratgey of an existing overlay on the map.
   *
   * Transaction.items of type {@link Cluster} are applied to the given overlay. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.
   *
   * <p>
   * If all processing is completed within this method, it should return true to allow the transaction to terminate. In
   * the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pause a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * @example
  engineInterface.overlay.cluster.show = function(transaction{

      for (var i = 0; i < transaction.items.length; i += 1) {
          var item = transaction.items[i];



          if(!success){
              // If the error is due to a try catch block the error provided by the catch should be added as the jsError property of the Error
              // If there is no error object from a try catch block the jsError property can be omitted or set to null
              transaction.fail([{coreId: item.coreId, level: <i>error level</i> see {@link emp.typeLibrary.Error.level}, message: "Optional custom error message", jsError: null}]);
          }
      }//end for loop
      return true;
  }//end function
   *
   * @memberOf engineInterface.overlay.cluster
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {Array} transaction.items - The items contains an array with a single overlayId at position 0 of the items array.
   * @method
   */
  engineInterface.overlay.cluster.remove = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.
    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "The engineInterface.overlay.cluster.remove function is not supported by the map implementation."
      }]);
    }
  };
  /**
   *
   * @memberOf engineInterface.overlay
   * @namespace
   * @desc This this function has been deprecated.
   */
  engineInterface.overlay.visibility = {};

  /**
   * @desc Sets the visibility an existing overlay on the map.
   *
   * Transaction.items of type {@link Overlay} change visibility on the map. Items that fail
   * should be stored in an array of objects in the format:
   *
   *     {
   *         cpceId: item.cpceId, //cpceId is a property of the {@link Overlay}
   *         code: "000x234987" //a {@link Code} defined by the map engine.
   *         }
   *
   *
   * The end of the function should call transaction.fail with an array of failed objects.
   * If no items failed, transaction.fail should be called with an empty array.
   * A TransactionComplete event should then be issued.
   *
   * @example
   * engineInterface.overlay.visibility.set = function(transaction{
   * var failList = [];//create a list of failed items
   *
   * for (var i = 0; i < transaction.items.length; i += 1) {
   *  var item = transaction.items[i];
   *
   *
   *
   *  if(!success){
   *      failList.push(emp.typeLibrary.Error({cpceId: item.cpceId, code: "000x234987"});
   *  }
   * }//end for loop
   * emp.map.eventing.TrasactionComplete({transaction: transaction, failures: failList})
   * }//end function
   *
   * @memberOf engineInterface.overlay.visibility
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {Array} transaction.items - The items contains an array of {@link Overlay} objects to
   * have their visibility set.
   * @method
   */
  engineInterface.overlay.visibility.set = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface.overlay
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * @param {Array} transaction.items - The items contains an array of {@link OverlayStyle} objects.
   * @method
   * @desc called to set the styles of all objects currently contained in the overlays indicated.
   *
   * Transaction.items of type {@link Overlay} are cleared of their contents on the map. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.
   *
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * @example
  engineInterface.overlay.style = function(transaction{

      for (var i = 0; i < transaction.items.length; i += 1) {
          var item = transaction.items[i];



          if(!success){
              // If the error is due to a try catch block the error provided by the catch should be added as the jsError property of the Error
              // If there is no error object from a try catch block the jsError property can be omitted or set to null
              transaction.fail([{coreId: item.coreId, level: <i>error level</i> see {@link emp.typeLibrary.Error.level}, message: "Optional custom error message", jsError: null}]);
          }
      }//end for loop
      return true;
  }//end function
   */
  engineInterface.overlay.style = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };


  /**
   * @namespace
   */
  engineInterface.navigation = {};

  /**
   * Locks or unlocks the map view, preventing the user from interacting with the
   * map.  When the view is locked, nothing can move the map except for an api
   * call to the engine.
   *
   * @param {emp.typeLibrary.Transaction} transaction - Contains a Lock that indicates if the
   * view should be locked or unlocked.
   *
   * @example
   *
   * engineInterface.navigation.enable = function(transaction) {
   *
   *    // typically you will not get more than one item in this transaction.
   *    var item = transaction.items[0];
   *
   *    if (item.lock) {
   *      myMapEngine.lockView();
   *    } else {
   *      myMapEngine.unlockView();
   *    }
   *
   * }
   */
  engineInterface.navigation.enable = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   *
   * @memberOf engineInterface
   * @namespace
   * @desc This namespace encapsulates all map view functionality.
   */
  engineInterface.view = {};

  /**
   * @desc Sets the view of a view, feature, layer, overlay, or symbol.
   *
   * Transaction.items of type {@link View} are added to the map. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.
   *
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * @example
  engineInterface.view.set = function(transaction{

      for (var i = 0; i < transaction.items.length; i += 1) {
          var item = transaction.items[i];



          if(!success){
              // If the error is due to a try catch block the error provided by the catch should be added as the jsError property of the Error
              // If there is no error object from a try catch block the jsError property can be omited or set to null
              transaction.fail([{coreId: item.coreId, level: <i>error level</i> see {@link emp.typeLibrary.Error.level}, message: "Optional custom error message", jsError: null}]);
          }
      }//end for loop
  }//end function
   *
   * @memberOf engineInterface.view
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {Array} transaction.items - The items contains an array of {@link View} objects
   * @method
   */
  engineInterface.view.set = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * Converts a geographic location in decimal degrees to a pixel location relative
   * to the top left corner of the map.
   *
   * @example
   * engineInterface.view.getXYFromLatLon = function(transaction) {
   *
   *    var item;
   *
   *    for (var i = 0; i < transaction.items.length; i += 1) {
   *        item = transaction.items[i];
   *        var lat = item.lat;
   *        var lon = item.lon;
   *
   *        var result = someConversionMethod(lat, lon);
   *
   *        item.x = result.x;
   *        item.y = result.y;
   *    }
   *
   * };
   *
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   *
   * @param {emp.typeLibrary.Convert[]} transaction.items - The items contains an array of {@link emp.typeLibrary.Convert} objects
   */
  engineInterface.view.getXYFromLatLon = function(transaction) {
    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * Converts a pixel relative to the top left corner of the map to the
   * geographical location on the map.  If the pixel does not represent an area
   * on a map, the conversion will not return anything.
   *
   * @example
   * engineInterface.view.getLatLonFromXY = function(transaction) {
   *
   *    var item;
   *
   *    for (var i = 0; i < transaction.items.length; i += 1) {
   *        item = transaction.items[i];
   *        var x = item.x;
   *        var y = item.y;
   *
   *        var result = someConversionMethod(x, y);
   *
   *        item.lon = result.x;
   *        item.lat = result.y;
   *    }
   *
   * };
   *
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {emp.typeLibrary.Convert[]} transaction.items - The items contains an array of {@link emp.typeLibrary.Convert} objects
   */
  engineInterface.view.getLatLonFromXY = function(transaction) {
    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
     * @desc Gets the current view on the map.
     *
     * A new {@link View} object should be created.
     *
     *
     *     var view = new emp.typeLibrary.View({
     *         overlayId:
     *         featureId:
     *         parentId:
     *         range:
     *         zoom:
     *         location:
     *         pan:
     *         heading:
     *         bounds:
     *         });//these properties are defined in the {@link View} object
     *
     *
     * If creating the view succeeds, the new {@link View} should be pushed to transaction.items array.
     *
     *     transaction.items.push(view);
     *
     *
     * If creating the view fails, a new {@link Error} transaction.fail handling should take place.
     *
     * <p>
     * In the event that the actual processing is done async, this method must call transaction.pause() to
     * halt the processing of the transaction. Once the processing is complete the implementation must
     * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
     * unpredictable behavior of the core components.</p>
     *
     *
     * @example
    engineInterface.view.get = function(transaction){
        var view,
            failures = [],
            error;


        view = new emp.typeLibrary.View({
            overlayId: overlayId,
            featureId: featureId,
            parentId: parentId,
            range: range,
            zoom: zoom,
            location: location,
            pan: pan,
            heading: heading,
            bounds: bounds
        });

        if(success){
            transaction.items.push(view);
        }else if (!success){
            transaction.fail([{coreId: item.coreId, level: <i>error level</i> see {@link emp.typeLibrary.Error.level}, message: "Optional custom error message", jsError: null}]);
        }
   }//end function
     *
     * @memberOf engineInterface.view
     * @abstract
     * @public
     * @returns {boolean}
     * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
     * The transaction should be included in the TransactionComplete event.
     * @param {Array} transaction.items - The items array will be empty coming into the function. In this function,
     * the items array should be populated with a new {@link View} object.
     */
  engineInterface.view.get = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  engineInterface.lookAt = {};

  /**
   * Centers the view on a feature or location on the map
   * @memberOf engineInterface.lookAt
   * @abstract
   * @public
   */
  engineInterface.lookAt.set = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.
    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   *
   * @memberOf engineInterface
   * @namespace
   * @desc This namespace encapsulates the feature processing capabilities of the engine.
   */
  engineInterface.feature = {};

  /**
   * @desc Adds features to the map.
   *
   * Transaction.items of type {@link Feature} are added to the map. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.
   *
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * @example
   * engineInterface.feature.add = function(transaction{
   *
   *  for (var i = 0; i < transaction.items.length; i += 1) {
   *      var item = transaction.items[i];
   *
   *
   *
   *      if(!success){
   *          // If the error is due to a try catch block the error provided by the catch should be added as the jsError property of the Error
              // If there is no error object from a try catch block the jsError property can be omited or set to null
   *          transaction.fail([{coreId: item.coreId, level: <i>error level</i> see {@link emp.typeLibrary.Error.level}, message: "Optional custom error message", jsError: null}]);
   *      }
   *  }//end for loop
   * }//end function
   *
   *
   * @memberOf engineInterface.feature
   * @abstract
   * @public
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {Array} transaction.items - The items contains an array of {@link emp.typeLibrary.Feature}
   * objects
   * @method
   * @description The engine implementation MUST NOT alter any feature in the transactions
   * items list. Doing so will yield unpredictable results.
   */
  engineInterface.feature.add = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @desc Removes features from the map.
   *
   * Transaction.items of type {@link Feature} are removed from the map. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.
   *
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * @example
   * engineInterface.feature.remove = function(transaction{
   *
   *  for (var i = 0; i < transaction.items.length; i += 1) {
   *      var item = transaction.items[i];
   *
   *
   *
   *      if(!success){
   *          // If the error is due to a try catch block the error provided by the catch should be added as the jsError property of the Error
   *          // If there is no error object from a try catch block the jsError property can be omitted or set to null
   *          transaction.fail([{coreId: item.coreId, level: <i>error level</i> see {@link emp.typeLibrary.Error.level}, message: "Optional custom error message", jsError: null}]);
   *      }
   *  }//end for loop
   * }//end function
   *
   * @memberOf engineInterface.feature
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {Array} transaction.items - The items contains an array of {@link Feature}
   * or {@link Symbol} objects
   * @method
   */
  engineInterface.feature.remove = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @desc Updates features to the map, such as its name or parent.
   *
   * Transaction.items of type {@link Feature} are updated on the map. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.
   *
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * @example
   * engineInterface.feature.update = function(transaction{
   *
   *  for (var i = 0; i < transaction.items.length; i += 1) {
   *      var item = transaction.items[i];
   *
   *
   *
   *      if(!success){
   *          // If the error is due to a try catch block the error provided by the catch should be added as the jsError property of the Error
   *          // If there is no error object from a try catch block the jsError property can be omitted or set to null
   *          transaction.fail([{coreId: item.coreId, level: <i>error level</i> see {@link emp.typeLibrary.Error.level}, message: "Optional custom error message", jsError: null}]);
   *      }
   *  }//end for loop
   * }//end function
   *
   * @memberOf engineInterface.feature
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {Array} transaction.items - The items contains an array of {@link Feature}
   * or {@link Symbol} objects
   * @method
   */
  engineInterface.feature.update = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   *
   * @memberOf engineInterface.feature
   * @namespace
   * @desc This object is the container for feature visibility methods.
   */
  engineInterface.feature.visibility = {};

  /**
   * @desc Changes the visibility of features on the map.
   *
   * Transaction.items of type {@link Feature} have visibility changed on the map. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.
   *
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * @example
   * engineInterface.feature.visibility.set = function(transaction{
   *
   * for (var i = 0; i < transaction.items.length; i += 1) {
   *  var item = transaction.items[i];
   *
   *
   *
   *  if(!success){
   *    // If the error is due to a try catch block the error provided by the catch should be added as the jsError property of the Error
   *     // If there is no error object from a try catch block the jsError property can be omitted or set to null
   *          transaction.fail([{coreId: item.coreId, level: <i>error level</i> see {@link emp.typeLibrary.Error.level}, message: "Optional custom error message", jsError: null}]);
   *  }
   * }//end for loop
   * }//end function
   *
   * @memberOf engineInterface.feature.visibility
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * The transaction should be included in the TransactionComplete event.
   * @param {Array} transaction.items - The items contains an array of {@link Feature}or
   * {@link Symbol} objects
   * @method
   */
  engineInterface.feature.visibility.set = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface
   * @namespace
   * @description This namespace encapsulates all the settings capabilities.
   */
  engineInterface.settings = {};

  /**
   * @memberOf engineInterface.settings
   * @namespace
   * @description This namespace encapsulates all the MIL-STD-2525 settings capabilities.
   */
  engineInterface.settings.mil2525 = {};

  /**
   * @memberOf engineInterface.settings.mil2525
   * @namespace
   * @description This namespace encapsulates all the MIL-STD-2525 icon settings
   * capabilities.
   */
  engineInterface.settings.mil2525.icon = {};
  /**
   * @memberOf engineInterface.settings.mil2525
   * @namespace
   * @description This namespace encapsulates all the MIL-STD-2525 icon size
   * settings capabilities.
   */
  engineInterface.settings.mil2525.icon.size = {};
  /**
   * @memberOf engineInterface.settings.mil2525.icon
   * @description Set the desired icon size fof MIL-STD-2525 icons in pixel dimensions
   * <p>
   * Transaction.items should be a an array with a single integer value representing the pixel size desired such as [32]
   * <p>
   * If all processing is completed within this method, it should return true to allow the transaction to terminate. In
   * the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   * @abstract
   * @public
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains
   * a number of properties.
   * @param {Array} transaction.items - The items[0] contains an integer value
   * representing the pixel size desired such as [32] or [48]
   * @method
   */
  engineInterface.settings.mil2525.icon.size.set = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface.settings.mil2525.icon
   * @namespace
   * @description This namespace encapsulates all the MIL-STD-2525 icon label settings capabilities.
   */
  engineInterface.settings.mil2525.icon.labels = {};
  /**
   * @memberOf engineInterface.settings.mil2525.icon
   * @description Set the desired icon labels to be displayed for MIL-STD-2525 icons
   * <p>
   * Transaction.items[0] contains an array of string values representing ALL of the
   * labels to be displayed
   * <p>
   * If all processing is completed within this method, it should return true to allow the transaction to terminate. In
   * the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   * @abstract
   * @public
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * @param {Array} transaction.items[0] - The items[0] contains an array of strings
   * representing the labels names to display
   * @method
   */
  engineInterface.settings.mil2525.icon.labels.set = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface
   * @namespace
   * @description This namespace encapsulates all the WMS service capabilities.
   */
  engineInterface.wms = {};

  /**
   * @memberOf engineInterface.wms
   * @description Add a new WMS service.  The transactions Items will contain emp.typeLibrary.WMS objects.
   * If the same WMS URL has already been added to the map, the core code will call remove
   * Then call add.  this will account for wanting to "refresh" the WMS service and make sure the most update to date capabilities
   * has been loaded.
   * <p>
   * Transaction.items of type {@link WMS} have visibility changed on the map. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.</p>
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   * @abstract
   * @public
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * @param {Array} transaction.items - The items contains an array of {@link emp.typeLibrary.WMS}
   * @method
   */
  engineInterface.wms.add = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface.wms
   * @description Remove a WMS service from the map.  The transactions Items will contain emp.typeLibrary.WMS objects.
   * @abstract
   * @public
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * @param {Array} transaction.items - The items contains an array of {@link WMS}or
   * @method
   */
  engineInterface.wms.remove = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface
   * @namespace
   * @description This namespace encapsulates all the WMTS service capabilities.
   */
  engineInterface.wmts = {};

  /**
   * @memberOf engineInterface.wmts
   * @description Add a new WMTS service.  The transactions Items will contain emp.typeLibrary.WMTS objects.
   * If the same WMTS URL has already been added to the map, the core code will call remove
   * then call add.
   * <p>
   * Transaction.items of type {@link WMTS} have visibility changed on the map. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.</p>
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   * @abstract
   * @public
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * @param {Array} transaction.items - The items contains an array of {@link emp.typeLibrary.WMTS}
   * @method
   */
  engineInterface.wmts.add = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface.wmts
   * @description Remove a WMTS service from the map.  The transactions Items will contain emp.typeLibrary.WMTS objects.
   * @abstract
   * @public
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * @param {Array} transaction.items - The items contains an array of {@link WMTS}
   * @method
   */
  engineInterface.wmts.remove = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface
   * @namespace
   * @description This namespace encapsulates all the KML link capabilities.
   */
  engineInterface.kmllayer = {};

  /**
   * @memberOf engineInterface.kmllayer
   * @description Add a new KML or KMZ link.  The transactions items will contain emp.typeLibrary.KmlLayer objects.
   * If the same KML link has already been added to the map, the core code will call remove
   * then call add.
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   * @abstract
   * @public
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * @param {Array} transaction.items - The items contains an array of {@link emp.typeLibrary.KmlLayer}
   * @method
   */
  engineInterface.kmllayer.add = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface.kmllayer
   * @description Remove a KML or KMZ link from the map. The transactions Items will contain emp.typeLibrary.KmlLayer objects.
   * @abstract
   * @public
   * @param {emp.typeLibrary.Transaction} transaction - The {@link emp.typeLibrary.Transaction} object contains a number of properties.
   * @param {Array} transaction.items - The items contains an array of {@link KmlLayer}
   * @method
   */
  engineInterface.kmllayer.remove = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /*
   * These will be removed when the new visibility is implemented.
   */
  engineInterface.wms.visibility = {};
  engineInterface.wms.visibility.set = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   *
   * @memberOf engineInterface
   * @namespace
   * @desc This object is the container for feature draw methods
   */
  engineInterface.draw = {};

  /**
   * @memberOf engineInterface.draw
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The transaction class instance identifies the operation.
   * @param {Array} transaction.items This transaction member contains an array of one (1) {@link emp.typeLibrary.Draw}
   * which defines the type of feature which needs drawing.
   * @desc This function is called to start a draw operation. The engine implementation must use
   * the properties provided and place the item on the map in edit mode. Therefore allowing the
   * user to modify the item on the map. The implementation must also issue the DrawStart event (see {@link emp.map.eventing.DrawStart}).
   * <p>
   * The implementation must pause the transaction until the draw is completed via a DrawEnd, Draw Cancel,
   * edit begin transaction or another draw begin.</p>
   * <p>
   * Once the processing is complete the implementation must
   * call transaction.run() to un-pause and complete the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   * @method
   * @example
   * engineInterface.draw.begin = function (oTransaction) {
   *
   *      var oItem = oTransaction.items[0];
   *
   *      if (//Is there another Edit or Draw in progress)
   *      {
   *          // Cancel Edit/Draw in progress.
   *      }
   *
   *      // Use the Draw class instance in oTransaction.items[0] to identify the type of feature.
   *      if (//Drawing of that Feature Type is not supported)
   *      {
   *          oTransaction.fail([{coreId: oItem.coreId, level: {@link emp.typeLibrary.Error.level.MAJOR}, message: "Draw operation not support for features of this type.", jsError: null}]);
   *          return;
   *      }
   *
   *      // Save the draw.begin transaction for later use.
   *      oEngineTransactionList.setItem(oTransaction.transactionId, oTransaction);
   *      oTransaction.pause(); // Pause the transaction until draw is done.
   *
   *      // Use the Draw class instance to draw the feature on the map and place it in edit mode.
   *
   *      // Issue the DrawStart event.
   *      new emp.map.eventing.DrawStart({transaction: oTransaction});
   *
   *      // Issue an update event.
   *      oItem.update({
   *          updateEventType = emp.typeLibrary.UpdateEventType.START,
   *          :
   *          :
   *          //see {@link emp.typeLibrary.Draw.update}
   *      });
   *
   * }; // end method
   *
   *  // Each time the feature is changed from user interaction on the map the implementation must
   *  // issue an update.
   *  generateDrawUpdate = function (oDrawBeginTransaction) {
   *
   *      var oItem = oDrawBeginTransaction.items[0];
   *
   *      // Issue an update event.
   *      oItem.update({
   *          updateEventType = emp.typeLibrary.UpdateEventType.UPDATE,
   *          :
   *          // Place new data in the structure.
   *          :
   *          //see {@link emp.typeLibrary.Draw.update}
   *      });
   *
   *  };
   */
  engineInterface.draw.begin = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface.draw
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The transaction class instance identifies the operation.
   * @param {Array} transaction.items This transaction member contains an array of one (1) {@link emp.typeLibrary.Draw}
   * which identifies the draw that that must be completed.
   * @desc This function ends the drawing of a feature. The implementation must remove the newly
   * drawn feature from the map. The core will later issue a feature.add to add the newly drawn feature
   * permanently to the map.
   * <p> The implementation must issue the final update and issue the DrawEnd event (see {@link emp.map.eventing.DrawEnd}) prior to
   * completing this transaction.</p>
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * <p>
   * Once the draw is terminated, the original draw.begin transaction must be completed.</p>
   * @method
   * @example
   * engineInterface.draw.end = function (oDrawEndTransaction) {
   *
   *      var oBeginDrawTransaction = //Find original draw.begin transaction.
   *      var oItem = oBeginDrawTransaction.items[0];
   *
   *      // Terminate the edit session on the map.
   *
   *      // Issue final update event.
   *      oItem.update({
   *          updateEventType = emp.typeLibrary.UpdateEventType.COMPLETE,
   *          :
   *          // Place final feature data in the structure.
   *          :
   *          //see {@link emp.typeLibrary.Draw.update}
   *      });
   *
   *      oItem.plotFeature = new emp.typeLibrary.Feature({
   *          :
   *          // Populate the arguments to create the new feature.
   *          // see {@link emp.typeLibrary.Feature}
   *          :
   *      });
   *
   *      // Delete the feature from the map
   *
   *      // Issue the DrawEnd event.
   *      new emp.map.eventing.DrawEnd({
   *          transaction: oBeginDrawTransaction
   *      });
   *
   *      // Allow the original transaction to terminate.
   *      oBeginDrawTransaction.run();
   *
   *      // Return true to complete the oDrawEndTransaction.
   * }; // end method
   */
  engineInterface.draw.end = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface.draw
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The transaction class instance identifies the operation.
   * @param {Array} transaction.items This transaction member contains an array of one (1) {@link emp.typeLibrary.Draw}
   * which identifies the draw that that must be canceled.
   * @desc This function cancels the drawing of a feature.
   * <p>
   * The implementation must remove the newly drawn feature from the map. Then call transaction.fail() on the original draw begin transaction for the item
   * indicating a level = emp.typeLibrary.Error.level.INFO and an error message = "Draw canceled".
   * The implementation must issue the DrawEnd event (see {@link emp.map.eventing.DrawEnd}) prior to
   * completing this transaction.</p>
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * <p>
   * Once this transaction has been completed, the original draw.begin transaction must be completed.</p>
   * @method
   * @example
   * engineInterface.draw.cancel = function (oDrawCancelTransaction) {
   *
   *      var oBeginDrawTransaction = //Find original draw.begin transaction.
   *      var oItem = oBeginDrawTransaction.items[0];
   *
   *      // Terminate the edit session on the map.
   *
   *      // Delete the feature from the map
   *
   *      // Fail the original transaction
   *      oBeginDrawTransaction.fail({
   *          coreId: oItem.coreId,
   *          level: {@link emp.typeLibrary.Error.level.INFO},
   *          message: "Draw canceled.",
   *          jsError: null
   *      });
   *
   *      // Issue the DrawEnd event.
   *      new emp.map.eventing.DrawEnd({
   *          transaction: oBeginDrawTransaction
   *      });
   *
   *      // Allow the original transaction to terminate.
   *      oBeginDrawTransaction.run();
   * }; // end method
   */
  engineInterface.draw.cancel = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   *
   * @memberOf engineInterface
   * @namespace
   * @desc This namespace is the container for feature edit methods.
   */
  engineInterface.edit = {};

  /**
   * @memberOf engineInterface.edit
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The transaction class instance identifies the operation.
   * @param {Array} transaction.items This transaction member contains an array of one (1) {@link emp.typeLibrary.Edit}
   * which identifies the feature to edit.
   * @desc This function is called to start an edit operation. The engine implementation must use
   * the properties provided in the items and place the item on the map in edit mode. Therefore allowing the
   * user to modify the item on the map. The implementation must also issue the EditStart event (see {@link emp.map.eventing.EditStart}).
   * <p>
   * The implementation must pause the transaction until the edit is completed via a Edit End, Edit Cancel,
   * draw begin transaction or another edit begin transaction arrives or the feature is removed while in edit mode.</p>
   * <p>
   * Once the processing is complete the implementation must
   * call transaction.run() to un-pause and complete the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   * @method
   * @example
   * engineInterface.edit.begin = function (oTransaction) {
   *
   *      var oItem = oTransaction.items[0];
   *
   *      if (//Is there another Edit or Draw in progress)
   *      {
   *          // Cancel Edit/Draw in progress.
   *      }
   *
   *      // Use the edit class instance in oTransaction.items[0] to identify the feature.
   *      if (//Edit of that Feature is not supported)
   *      {
   *          oTransaction.fail([{coreId: oItem.coreId, level: {@link emp.typeLibrary.Error.level.MAJOR}, message: "Edit operation not support for features of this type.", jsError: null}]);
   *            return;
   *      }
   *
   *      // Save the edit.begin transaction for later use.
   *      oEngineTransactionList.setItem(oTransaction.transactionId, oTransaction);
   *      oTransaction.pause(); // Pause the transaction until edit is done.
   *
   *      // Use the Edit class instance to place the feature in edit mode.
   *
   *      // Issue the EditStart event.
   *      new emp.map.eventing.EditStart({transaction: oTransaction});
   *
   *      // Issue an update event.
   *      oItem.update({
   *          updateEventType = emp.typeLibrary.UpdateEventType.START,
   *          :
   *          :
   *          //see {@link emp.typeLibrary.Edit.update}
   *      });
   *
   * }; // end method
   *
   *  // Each time the feature is changed from user interaction on the map the implementation must
   *  // issue an update.
   *  generateEditUpdate = function (oEditBeginTransaction) {
   *
   *      var oItem = oEditBeginTransaction.items[0];
   *
   *      // Issue an update event.
   *      oItem.update({
   *          updateEventType = emp.typeLibrary.UpdateEventType.UPDATE,
   *          :
   *          // Place new data in the structure.
   *          :
   *          //see {@link emp.typeLibrary.Edit.update}
   *      });
   *
   *  };
   */
  engineInterface.edit.begin = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface.edit
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The transaction class instance identifies the operation.
   * @param {Array} transaction.items This transaction member contains an array of one (1) {@link emp.typeLibrary.Edit}
   * which identifies the edit that that must be completed.
   * @desc This function ends the editing of a feature.
   * <p> The implementation must issue the final update and issue the EditEnd event (see {@link emp.map.eventing.EditEnd}) prior to
   * completing this transaction.</p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * <p>
   * Once this transaction has been completed, the original edit.begin transaction must be completed.</p>
   * @method
   * @example
   * engineInterface.Edit.end = function (oEditEndTransaction) {
   *
   *      var oEditBeginTransaction = //Find original edit.begin transaction.
   *      var oItem = oEditBeginTransaction.items[0];
   *
   *      // Terminate the edit session on the map.
   *
   *      // Issue final update event.
   *      oItem.update({
   *          updateEventType = emp.typeLibrary.UpdateEventType.COMPLETE,
   *          :
   *          // Place final feature data in the structure.
   *          :
   *          //see {@link emp.typeLibrary.Edit.update}
   *      });
   *
   *      // Issue the EditEnd event.
   *      new emp.map.eventing.EditEnd({
   *          transaction: oEditBeginTransaction
   *      });
   *
   *      // Allow the original transaction to terminate.
   *      oEditBeginTransaction.run();
   * }; // end method
   */
  engineInterface.edit.end = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   * @memberOf engineInterface.edit
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The transaction class instance identifies the operation.
   * @param {Array} transaction.items This transaction member contains an array of one (1) {@link emp.typeLibrary.Edit}
   * which identifies the edit that that must be canceled.
   * @desc This function cancels the editing of a feature.
   * <p>
   * The implementation must use the originalFeature parameter of the item contained in the original edit.begin transaction
   * to revert the feature to its original state.
   * <p>Once the feature is in its original state the implementation must call transaction.fail() on the original edit begin transaction for the item
   * indicating a level = emp.typeLibrary.Error.level.INFO and an error message = "Edit canceled".
   * The implementation must issue the EditEnd event (see {@link emp.map.eventing.EditEnd}) prior to
   * completing this transaction.</p>
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   *
   * <p>
   * Once this transaction has been completed, the original edit.begin transaction must be completed.</p>
   * @method
   * @example
   * engineInterface.edit.cancel = function (oEditCancelTransaction) {
   *
   *      var oEditBeginTransaction = //Find original edit.begin transaction.
   *      var oItem = oEditBeginTransaction.items[0];
   *
   *      // Terminate the edit session on the map.
   *
   *      // Use oItem.originalFeature to revert the feature back to its pre-edit state on the map.
   *
   *      // Fail the original transaction
   *      oEditBeginTransaction.fail({
   *          coreId: oItem.coreId,
   *          level: {@link emp.typeLibrary.Error.level.INFO},
   *          message: "Edit canceled.",
   *          jsError: null
   *      });
   *
   *      // Issue the EditEnd event.
   *      new emp.map.eventing.EditEnd({
   *          transaction: oEditBeginTransaction
   *      });
   *
   *      // Allow the original transaction to terminate.
   *      oEditBeginTransaction.run();
   * }; // end method
   */
  engineInterface.edit.cancel = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   *
   * @memberOf engineInterface
   * @namespace
   * @desc This namespace is the container for feature selection methods.
   */
  engineInterface.selection = {};

  /**
   * @memberOf engineInterface.selection
   * @abstract
   * @public
   * @returns {boolean}
   * @param {emp.typeLibrary.Transaction} transaction - The transaction object containing selected features as defined in the type library is required.
   * @desc This function sets which features are selected. Items that fail
   * should be processed with transaction.fail() call. see {@link Transaction.fail}.</p>
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   * @method
   */
  engineInterface.selection.set = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    while (transaction.items.length > 0) {

      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };

  /**
   *
   * @memberOf engineInterface
   * @namespace
   * @desc This namespace is the container for projection  methods.
   */
  engineInterface.projection = {};
  engineInterface.projection.enable = {};



  /**
   * @memberOf engineInterface.projection.enable
   * @abstract
   * @public
   * @param {emp.typeLibrary.Transaction} transaction - The transaction object is required to
   * set the projection mode.
   * @param {boolean} transaction.items - The transaction.items[0] contains a boolean
   * value indicating if true to enable a flat map. And false to enable a 3D map.
   * @desc This function sets the current mode of the projection.
   * <p>
   * In the event that the actual processing is done async, this method must call transaction.pause() to
   * halt the processing of the transaction. Once the processing is complete the implementation must
   * call transaction.run() to un-pause the transaction. Failure to un-pausing a transaction can lead to
   * unpredictable behavior of the core components.</p>
   * @method
   */
  engineInterface.projection.enable.flat = function(transaction) {
    // This is an abstract method
    // override this function if supported by your map engine
    // Default behavior is to fail the request.

    var iIndex;
    for (iIndex = 0; iIndex < transaction.items.length; iIndex++) {
      transaction.fail([{
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "This function is not supported by the map implementation."
      }]);
    }
  };



  // return the engineInterface object as a new engineTemplate instance
  return engineInterface;
};
