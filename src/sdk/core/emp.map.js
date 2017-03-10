/*global confirm */
var emp = window.emp || {};

/**
 * @class
 * @memberOf emp
 * @desc Interface to the geospatial rendering component of EMP.
 */
emp.map = function (args) {

  var activeEngine = null,
    oViewBounds = {
      north: 0.0,
      south: 0.0,
      east: 0.0,
      west: 0.0
    },
    oViewCenter = {
      lat: 0.0,
      lon: 0.0
    },
    dViewRange = 5000000.0,
    resources = [],
    resourceLen = 0,
    completed = 0,
    loadComplete,
    previousSwapFailed,
    bLoadInProgress = false,
    bReloadInProgress = false,
    bDoReload = false,
    bExecuteRemove = false,
    sDrawEditIntent,
    oDrawEditOperation,
    sDrawEditTransactionID,
    sManifestFile,
    engineConfig = emp.util.config,
    oRemoveTransaction,
    currentStatus,
    sDefaultLayerOverlayID,
    container,
    oEditDrawTransaction = null,
    sMapSwapSetViewTransactionId,
    engDirectDefault = {
      name: "undefined",
      ref: null
    },

    mapInstanceId = args.mapInstanceId,
    editingManager,
    defaultExtent = args.extent,
    // This config parameter may be used in the future when
    // a unique map instance config object is created which
    // will contain instance specific configurations.
    //    config,
    freehandMode = false,
    freehandModeDrawStart = false,
    freehandLineColor = 'FFFFFF00',
    freehandLineWidth = 8,
    freehandLineColorOverride,
    freehandLineWidthOverride,
    freehandFeature = new emp.typeLibrary.Feature({
      featureId: "freehandX",
      coreId: "freehandX",
      name: '',
      format: emp3.api.enums.FeatureTypeEnum.GEO_PATH,
      data: {
        type: 'LineString',
        coordinates: []
      },
      readOnly: true,
      properties: {
        lineColor: freehandLineColor,
        lineWidth: freehandLineWidth
      }
    });

  // assume it is a javascript file unless it ends with .css
  function checkResourceType(resource) {
    var type = "js";
    if (resource.substr(resource.length - 4, 4).toLowerCase() === ".css") {
      type = "css";
    }
    return type;
  }

  function loadCSS(args) {
    var fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", args.url);

    document.getElementsByTagName("head")[0].appendChild(fileref);
  }

  function isScriptLoaded(sURL) {
    var iIndex;
    var sAbsUrl = emp.helpers.relToAbs(sURL);
    var script = document.querySelectorAll('script');

    for (iIndex = 0; iIndex < script.length; iIndex += 1) {
      if (script[iIndex].src === sAbsUrl) {
        return true;
      }
    }

    return false;
  }

  /**
   * @memberOf emp.map
   * @private
   * @desc This function is used to load a resource such as a javascript file needed for a given map engine.
   * It is for internal map use only and is private by closure.
   * @method
   */
  function loadScript(args) {
    var script = document.createElement("script");

    script.type = "text/javascript";
    script.src = args.url;
    if (isScriptLoaded(script.src)) {
      setTimeout(function () {
        args.callback();
      }, 0);
    }
    else {
      if (script.readyState) { //IE
        script.onreadystatechange = function () {
          if (script.readyState === "loaded" ||
            script.readyState === "complete") {
            script.onreadystatechange = null;
            args.callback();
          }
        };
      }
      else { //Others
        script.onload = function () {
          args.callback();
        };
      }
      document.getElementsByTagName("head")[0].appendChild(script);
    }
  }

  function getStartupExtent() {
    var initialExtent;

    if (defaultExtent) {
      if ((defaultExtent.hasOwnProperty('centerLat') && (typeof(defaultExtent.centerLat) === 'number')) &&
        (defaultExtent.hasOwnProperty('centerLon') && (typeof(defaultExtent.centerLon) === 'number')) &&
        ((defaultExtent.hasOwnProperty('range') && (typeof(defaultExtent.range) === 'number')) ||
        (defaultExtent.hasOwnProperty('scale') && (typeof(defaultExtent.scale) === 'number')))) {
        initialExtent = {
          centerLat: defaultExtent.centerLat,
          centerLon: defaultExtent.centerLon
        };
        if (defaultExtent.hasOwnProperty('range') && (typeof(defaultExtent.range) === 'number')) {
          initialExtent.range = defaultExtent.range;
        }
        else {
          initialExtent.scale = defaultExtent.scale;
        }
      }
      else if ((defaultExtent.hasOwnProperty('north') && (typeof(defaultExtent.north) === 'number')) &&
        (defaultExtent.hasOwnProperty('south') && (typeof(defaultExtent.south) === 'number')) &&
        (defaultExtent.hasOwnProperty('east') && (typeof(defaultExtent.east) === 'number')) &&
        (defaultExtent.hasOwnProperty('west') && (typeof(defaultExtent.west) === 'number'))) {
        initialExtent = {
          north: defaultExtent.north,
          south: defaultExtent.south,
          east: defaultExtent.east,
          west: defaultExtent.west
        };
      }
    }

    return initialExtent;
  }

  /**
   * @memberOf emp.map
   * @private
   * @desc This function is used to iterate through loading resources needed for a given map engine.
   * It is for internal map use only and is private by closure.
   * @method
   */

  function loadNextResource() {
    var currentEngineConfiguration = engineConfig.getCurrentEngineConfiguration();

    completed += 1;
    if (completed < resourceLen) {
      document.getElementById(mapInstanceId + '_loadingStatus').innerHTML = completed + " of " + resourceLen + " Loaded...";
      var resource = currentEngineConfiguration.engineBasePath + resources.shift();

      if (resource) {
        var type = checkResourceType(resource);
        if (type === "css") {
          loadCSS({
            url: resource
          });
          // Currently no success event for dynamically loading css, just request and move on
          loadNextResource();
        }
        else {
          loadScript({
            url: resource,
            callback: loadNextResource
          });
        }
      }
    }
    else {
      document.getElementById(mapInstanceId + '_loadingStatus').innerHTML = "All resources have loaded";
      // Send an args object with the properties object from the engines configuration
      // This will be an empty object if not provided by the configuration
      var initialExtent = getStartupExtent();

      loadComplete({
        configProperties: currentEngineConfiguration.properties,
        mapInstance: publicInterface,
        extent: initialExtent
      });
      document.getElementById(mapInstanceId + '_loadingPanel').style.visibility = "hidden";
    }
  }

  function loadResource(args) {
    var type = checkResourceType(args.url);
    if (type === "css") {
      loadCSS({
        url: args.url
      });
      // Currently no success event for dynamically loading css, just request and move on
      args.callback();
    }
    else {
      loadScript({
        url: args.url,
        callback: args.callback
      });
    }

  }

  /**
   * The manifest file has loaded successfully.  This will occur once per engine.  The
   * manifest file does not get loaded a second time.  Once loaded, the success will
   * call the fnInitialize callback method as set in the manifest when it registered the map
   * engine.  The fnInitialize method should have the javascript resources to load for that engine.
   */
  function manifestSuccess() {
    var oResources,
      currentEngineConfiguration = engineConfig.getCurrentEngineConfiguration(),
      currentMapEngineId = engineConfig.getCurrentMapEngineId(),
      oMapRegistration = emp.instanceManager.getMapEngineRegistration(currentMapEngineId);

    if (oMapRegistration) {
      oResources = oMapRegistration.fnInitialize({
        engine: currentEngineConfiguration
        // This config parameter may be used in the future when
        // a unique map instance config object is created which
        // will contain instance specific configurations.
        //        config: config,
      });
      publicInterface.engineId = currentMapEngineId;
      if (oResources) {
        //        if (oMapRegistration) {
        oMapRegistration.fnCreateInstance = oResources.fnCreateInstance;
        //        }
        resources = oResources.resourceList;
        resourceLen = resources.length;
        loadComplete = oResources.fnCreateInstance;
        var resource = resources.shift();
        loadResource({
          url: currentEngineConfiguration.engineBasePath + resource,
          callback: loadNextResource
        });
      }
      else {
        new emp.typeLibrary.Error({
          level: emp.typeLibrary.Error.level.CATASTROPHIC,
          message: "Map engine did NOT return resources from its initialize function."
        });
      }
    }
    else {
      new emp.typeLibrary.Error({
        level: emp.typeLibrary.Error.level.CATASTROPHIC,
        message: "Map engine registration not found."
      });
    }
  }

  function handlerStatusChange(oTransaction) {
    switch (oTransaction.items[0].status) {
      case emp.map.states.INITIALIZING:
        break;
      case emp.map.states.READY:
        if (bReloadInProgress) {
          publicInterface.eventing.voice.silence(true);
          // Start the set view.
          setMapView();
        }
        else if (bLoadInProgress) {
          // Given that it is the first time we load
          bLoadInProgress = false;
          emp.transactionQueue.run(oTransaction.mapInstanceId);
        }

        break;
      case emp.map.states.MAP_INSTANCE_INIT_FAILED:
        bLoadInProgress = false;
        break;
      default:
        break;
    }
  }

  function handleTCDrawEditBegin(oTransaction) {
    if (bReloadInProgress) {
      return;
    }

    if (sDrawEditTransactionID === oTransaction.transactionId) {
      switch (oTransaction.intent) {
        case emp.intents.control.DRAW_BEGIN:
        case emp.intents.control.EDIT_BEGIN:
          switch (publicInterface.status.get()) {
            case emp.map.states.DRAW:
            case emp.map.states.EDIT:
              sDrawEditIntent = undefined;
              oDrawEditOperation = undefined;
              sDrawEditTransactionID = undefined;
              // Switch state success of failure.
              new publicInterface.eventing.StatusChange({
                status: emp.map.states.READY
              });
              break;
            default:
              break;
          }
          break;
      }
    }
  }

  function handleDrawEditStart(oStartEventTransaction) {
    var oTransaction = oStartEventTransaction.items[0];
    sDrawEditIntent = oTransaction.intent;

    if (oTransaction.items.length > 0) {
      oDrawEditOperation = oTransaction.items[0];
    }
    sDrawEditTransactionID = oTransaction.transactionId;

    switch (sDrawEditIntent) {
      case emp.intents.control.DRAW_BEGIN:
        // Set the  new state.
        new publicInterface.eventing.StatusChange({
          status: emp.map.states.DRAW
        });
        break;
      case emp.intents.control.EDIT_BEGIN:
        // Set the  new state.
        new publicInterface.eventing.StatusChange({
          status: emp.map.states.EDIT
        });
        break;
    }
  }

  function mapSwapSetViewcomplete(oTransaction) {
    if (oTransaction && sMapSwapSetViewTransactionId) {
      if (oTransaction.transactionId === sMapSwapSetViewTransactionId) {
        sMapSwapSetViewTransactionId = undefined;

        emp.transactionQueue.listener.remove({
          type: emp.intents.control.VIEW_SET,
          mapInstanceId: mapInstanceId,
          callback: mapSwapSetViewcomplete
        });
        emp.storage.reload(mapInstanceId);
      }
    }
  }

  function setMapView() {
    publicInterface.eventing.voice.silence(false);

    sMapSwapSetViewTransactionId = emp.helpers.id.newGUID();

    emp.transactionQueue.listener.add({
      type: emp.intents.control.VIEW_SET,
      mapInstanceId: mapInstanceId,
      callback: mapSwapSetViewcomplete
    });

    var oView = new emp.typeLibrary.View({
      transactionId: sMapSwapSetViewTransactionId,
      center: oViewCenter,
      range: dViewRange
    });

    var oTransaction = new emp.typeLibrary.Transaction({
      mapInstanceId: mapInstanceId,
      transactionId: sMapSwapSetViewTransactionId,
      sender: "CORE",
      intent: emp.intents.control.VIEW_SET,
      items: [oView]
    });
    oTransaction.run();
  }

  function storageReloadComplete(oTrans) {
    var oTransaction = new emp.typeLibrary.Transaction({
      mapInstanceId: oTrans.mapInstanceId,
      intent: emp.intents.control.MAP_ENGINE_SWAP_COMPLETE,
      source: emp.core.sources.STORAGE,
      items: []
    });
    oTransaction.run();
    emp.transactionQueue.run(oTrans.mapInstanceId);
    bReloadInProgress = false;
  }

  function processEngineSwapRequest(mapInstanceId) {
    // First Check if There is a transaction pending.
    // If there is we must wait.
    bDoReload = false;
    if (emp.instanceManager.isMapEngineLoading()) {
      // We start a timer to check again latter.
      setTimeout(function () {
        processEngineSwapRequest(mapInstanceId);
      }, 100);
      return;
    }
    if (emp.transactionQueue.isTransactionOutStanding(mapInstanceId)) {
      // We start a timer to check again latter.
      setTimeout(function () {
        processEngineSwapRequest(mapInstanceId);
      }, 100);
      return;
    }
    new publicInterface.eventing.StatusChange({
      status: emp.map.states.MAP_SWAP_IN_PROGRESS
    });
    emp.transactionQueue.pause(mapInstanceId);
    bReloadInProgress = true;

    var oTransaction = new emp.typeLibrary.Transaction({
      mapInstanceId: mapInstanceId,
      intent: emp.intents.control.MAP_ENGINE_SWAP_START,
      source: emp.core.sources.STORAGE,
      items: []
    });
    oTransaction.run();
    // perform cleanup of current map engine
    try {
      if (publicInterface.engine.hasOwnProperty('state')) {
        // If a previous swap failed, publicInterface.engine is === {}
        publicInterface.engine.state.destroy();
      }

      emp.storage.prepForMapSwap(mapInstanceId);
    }
    catch (err) {
      emp.typeLibrary.Error({
        jsError: err,
        message: "An exception occurred while calling engine.state.destroy before performing a map swap",
        level: emp.typeLibrary.Error.level.MINOR
      });
      emp.transactionQueue.run(mapInstanceId);
    }

    // Empty out the map.
    publicInterface.engine = null;
    loadMapEngine();
  }

  function verifyManifestLoaded() {
    var previousMapEngineId,
      previousMapEngineConfiguration,
      currentMapEngineId = engineConfig.getCurrentMapEngineId(),
      currentEngineConfiguration,
      oMapRegistration = emp.instanceManager.getMapEngineRegistration(currentMapEngineId);

    if (oMapRegistration) {
      // The manifest loaded.
      publicInterface.engineId = currentMapEngineId;
    }
    else {
      currentEngineConfiguration = engineConfig.getCurrentEngineConfiguration();
      // The manifest did not load.
      if (publicInterface.engines.isMapSwapInProgress()) {
        previousMapEngineId = engineConfig.getPreviousMapEngineId();
        previousMapEngineConfiguration = emp.instanceManager.getMapEngineRegistration(previousMapEngineId).engineConfiguration;
        window.console.error('Map manifest failed to load with config. Attempting to reload previous map.', currentEngineConfiguration);
        document.getElementById(mapInstanceId + '_loadSpinner').style.visibility = "hidden";
        document.getElementById(mapInstanceId + '_loadingMessage').style.visibility = "visible";
        document.getElementById(mapInstanceId + '_loadingMessage').innerHTML = "<h3 style='color:coral'>Swap Failed</h3>";
        document.getElementById(mapInstanceId + '_loadingStatus').innerHTML = '' +
          '<div>The selected map\'s manifest file failed to load. Attempting to reload previous map.</div>' +
          '<div><span font-size:0.75em>See console for details...</span></div>';

        var oTransaction = new emp.typeLibrary.Transaction({
          mapInstanceId: mapInstanceId,
          intent: emp.intents.control.MAP_ENGINE_SWAP_COMPLETE,
          source: emp.core.sources.STORAGE,
          items: []
        });
        oTransaction.run();
        // Turn the queue back on.
        emp.transactionQueue.run(mapInstanceId);
        bReloadInProgress = false;
        // Assign something so its not null.
        publicInterface.engine = {};
        setTimeout(function () {
          previousSwapFailed = true;
          publicInterface.engines.load(previousMapEngineConfiguration);
        }, 5000);
      }
      else {
        window.console.error('Map manifest failed to load with config', currentEngineConfiguration);
        document.getElementById(mapInstanceId + '_loadSpinner').style.visibility = "hidden";
        document.getElementById(mapInstanceId + '_loadingMessage').innerHTML = "<h3 style='color:coral'>Map Load Failed</h3>";
        document.getElementById(mapInstanceId + '_loadingStatus').innerHTML = '' +
          '<div>The selected map\'s manifest file failed to load.</div>' +
          '<div>Contact your administrator</div>' +
          '<div><span style="font-size:0.75em">See console for details...</span></div>';
      }
    }
  }

  function loadMapEngine() {
    var currentMapEngineId = engineConfig.getCurrentMapEngineId(),
      currentEngineConfiguration = engineConfig.getCurrentEngineConfiguration();

    if (!bReloadInProgress) {
      bLoadInProgress = true;
    }

    if (previousSwapFailed) {
      document.getElementById(mapInstanceId + '_loadingMessage').innerHTML = "Loading Map";
      document.getElementById(mapInstanceId + '_loadingSpinner').style.visiblity = "visible";
      previousSwapFailed = false;
    }
    document.getElementById(mapInstanceId + '_loadingStatus').innerHTML = "Fetching map resources...";
    var mapNode = document.getElementById(mapInstanceId + '_map');
    while (mapNode.firstChild) {
      mapNode.removeChild(mapNode.firstChild);
    }

    var date = new Date();
    var id = mapInstanceId + "_" + date.getTime();
    // set the emp.map private variable to the id for later use
    container = id;
    var d = document.createElement('div');
    d.id = id;
    d.style.width = "100%";
    d.style.height = "100%";

    document.getElementById(mapInstanceId + '_map').appendChild(d);

    setTimeout(function () {
      var oMapRegistration = emp.instanceManager.getMapEngineRegistration(currentMapEngineId);

      try {
        if (oMapRegistration) {
          var initialExtent = getStartupExtent();

          // The map engine is already registered.
          // so we can create a new instance.
          document.getElementById(mapInstanceId + '_loadingStatus').innerHTML = "All resources have loaded!";
          oMapRegistration.fnCreateInstance({
            configProperties: currentEngineConfiguration.properties,
            mapInstance: publicInterface,
            extent: initialExtent
          });
          publicInterface.engineId = currentMapEngineId;
          document.getElementById(mapInstanceId + '_loadingPanel').style.visibility = "hidden";
        }
        else {
          // The map engine has not been loaded yet.
          // So we load the manifest
          completed = 0;
          loadComplete = null;
          loadScript({
            url: currentEngineConfiguration.manifestUrl,
            callback: manifestSuccess
          });
          setTimeout(verifyManifestLoaded, 10000);
        }
      }
      catch (err) {
        emp.instanceManager.mapInstanceStartupFailed(mapInstanceId);
      }
    }, 0);

    if (bReloadInProgress) {
      document.getElementById(mapInstanceId + '_loadingPanel').style.visiblity = "visible";
    }
  }

  function handleDrawEditEnded() {
  }

  function handleDrawEditCanceled(oTransaction) {
    if (bDoReload) {
      // Start a timer which will kick off the reload.
      setTimeout(function () {
        processEngineSwapRequest(oTransaction.mapInstanceId);
      }, 1000);
    }
    else if (bExecuteRemove) {
      // Now we can continue the remove.
      var oRTran = oRemoveTransaction;
      // We need to fire this in a timer to ensure that it happens after
      // the feature add generated by the cancel.
      setTimeout(function () {
        oRTran.run();
      }, 50);
      oRemoveTransaction = undefined;
      bExecuteRemove = false;
    }
    else if (oEditDrawTransaction !== null) {
      oEditDrawTransaction.run();
      oEditDrawTransaction = null;
    }
  }

  function removeListeners(mapInstanceId) {
    emp.transactionQueue.listener.remove({
      type: emp.intents.control.STATUS_CHANGE,
      mapInstanceId: mapInstanceId,
      callback: handlerStatusChange
    });

    emp.transactionQueue.listener.remove({
      type: emp.intents.control.DRAW_BEGIN,
      mapInstanceId: mapInstanceId,
      callback: handleTCDrawEditBegin
    });

    emp.transactionQueue.listener.remove({
      type: emp.intents.control.EDIT_BEGIN,
      mapInstanceId: mapInstanceId,
      callback: handleTCDrawEditBegin
    });

    emp.transactionQueue.listener.remove({
      type: emp.intents.control.DRAW_START,
      mapInstanceId: mapInstanceId,
      callback: handleDrawEditStart
    });

    emp.transactionQueue.listener.remove({
      type: emp.intents.control.EDIT_START,
      mapInstanceId: mapInstanceId,
      callback: handleDrawEditStart
    });

    emp.transactionQueue.listener.remove({
      type: emp.intents.control.DRAW_ENDED,
      mapInstanceId: mapInstanceId,
      callback: handleDrawEditEnded
    });

    emp.transactionQueue.listener.remove({
      type: emp.intents.control.EDIT_ENDED,
      mapInstanceId: mapInstanceId,
      callback: handleDrawEditEnded
    });

    emp.transactionQueue.listener.remove({
      type: emp.intents.control.DRAW_CANCEL,
      mapInstanceId: mapInstanceId,
      callback: handleDrawEditCanceled
    });

    emp.transactionQueue.listener.remove({
      type: emp.intents.control.EDIT_CANCEL,
      mapInstanceId: mapInstanceId,
      callback: handleDrawEditCanceled
    });

    emp.transactionQueue.listener.remove({
      type: emp.intents.control.STORAGE_RELOAD_COMPLETE,
      mapInstanceId: mapInstanceId,
      callback: storageReloadComplete
    });
  }

  var publicInterface = {
    engineId: "",
    mapInstanceId: mapInstanceId,


    /**
     * Puts the map instance in freehand mode.  In freehand mode, mouse interaction
     * events will no longer occur.  Instead, when a user mouse downs, it begins
     * creating a line, the mouse moves updates the lines, and the mouse up updateSelectedMap
     * the line.  Events are passed back to the users notifying the positions
     * of the line as it is created, updated and complete.  On the mouse up the
     * line is remove from the map.
     */
    freehandStart: function (args) {
      // lock the map so it is in smart mode.
      var transaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.VIEW_LOCK,
        mapInstanceId: mapInstanceId,
        transactionId: "",
        sender: "",
        source: emp.api.cmapi.SOURCE,
        originChannel: cmapi.channel.names.FREEHAND_START,
        originalMessage: {},
        messageOriginator: "",
        originalMessageType: cmapi.channel.names.FREEHAND_START,
        items: [{
          lock: emp3.api.enums.MapMotionLockEnum.SMART_MOTION
        }]
      });

      this.engine.navigation.enable(transaction);
      freehandMode = true;

      // override the default freehand style if necessary.
      if (args.freehandStrokeStyle) {
        if (args.freehandStrokeStyle.strokeColor) {
          freehandLineColorOverride = emp.util.convertColorToHexColor(args.freehandStrokeStyle.strokeColor);
        }
        if (args.freehandStrokeStyle.strokeWidth) {
          freehandLineWidthOverride = args.freehandStrokeStyle.strokeWidth;
        }
      }
    },

    /**
     * Gets the map out of freehand mode.
     */
    freehandStop: function () {
      // lock the map so it is in smart mode.
      var transaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.VIEW_LOCK,
        mapInstanceId: mapInstanceId,
        transactionId: "",
        sender: "",
        source: emp.api.cmapi.SOURCE,
        originChannel: cmapi.channel.names.FREEHAND_STOP,
        originalMessage: {},
        messageOriginator: "",
        originalMessageType: cmapi.channel.names.FREEHAND_STOP,
        items: [{
          lock: emp3.api.enums.MapMotionLockEnum.UNLOCKED
        }]
      });

      this.engine.navigation.enable(transaction);
      freehandMode = false;
      // reset any overrides.
      freehandLineColorOverride = undefined;
      freehandLineWidthOverride = undefined;
    },

    setFreehandStrokeStyle: function (strokeStyle) {

      if (strokeStyle.strokeColor) {
        freehandLineColor = emp.util.convertColorToHexColor(strokeStyle.strokeColor);
      }

      if (strokeStyle.strokeWidth) {
        freehandLineWidth = strokeStyle.strokeWidth;
      }
    },


    /**
     * @memberOf emp.map
     * @public
     * @namespace
     * @description This namespace encapsulates the emp.map eventing capabilities defined in publicInterface.
     */
    eventing: {

      mapDrag: false,
      mapDragStart: null,

      /**
       * used for core event suppression for toggling map engines
       * @private
       */
      voice: {
        silent: false,
        silence: function (args) {
          this.silent = args;
        }
      },
      /**
       * @public
       * @description This event generates a selection change transaction which will process through core and send out a message to API Handlers and UI components. It must
       * be called by the map engine implementation when a features selection
       * status changes.
       * @param {emp.typeLibrary.Selection.ParameterType[]} args An array of selection parameter objects.
       */
      SelectionChange: function (args) {
        var i,
          len,
          features = [],
          success = false,
          transaction;
        try {

          if (args.length < 1) {
            features.push(new emp.typeLibrary.Selection({
              "type": "empty"
            }));
          }
          else {
            len = args.length;
            for (i = 0; i < len; i += 1) {
              features.push(new emp.typeLibrary.Selection(args[i]));
            }
          }

          transaction = new emp.typeLibrary.Transaction({
            mapInstanceId: mapInstanceId,
            intent: emp.intents.control.SELECTION_CHANGE,
            intentParams: "selected",
            originChannel: "map.feature.selected",
            source: emp.core.sources.MAP,
            transactionId: emp.helpers.id.newGUID(),
            items: features
          });
          transaction.run();
          success = true;
        }
        catch (e) {
          success = false;
          // generate en error which will be logged
          emp.typeLibrary.Error({
            message: "A SelectionChange event created by the map engine threw an error",
            jsError: e,
            level: 0
          });
        }
        return success;
      },
      /**
       * @public
       * @description This call generates a view change event. It must be called by a map engine implementation each
       * time the maps view is changed.
       * @param {emp.typeLibrary.View.ParameterType} viewArgs This parameter contains the data needed to generate the event.
       * @param {emp.typeLibrary.LookAt.ParameterType} lookAtArgs This parameter contains the data needed to generate the lookAt
       * @param {emp3.api.enums.CameraEventEnum} mapViewEventEnum
       */
      ViewChange: function (viewArgs, lookAtArgs, mapViewEventEnum) {

        if (!bReloadInProgress) {
          var view = new emp.typeLibrary.View(viewArgs);
          // reverse the enum value
          view.animate = (mapViewEventEnum === emp3.api.enums.CameraEventEnum.CAMERA_IN_MOTION ? 1 : 0);

          var lookAt = new emp.typeLibrary.LookAt(lookAtArgs);
          // reverse the enum value
          lookAt.animate = (mapViewEventEnum === emp3.api.enums.CameraEventEnum.CAMERA_IN_MOTION ? 1 : 0);

          // Set the stored map view for map swaps
          oViewCenter.lat = view.location.lat;
          oViewCenter.lon = view.location.lon;
          dViewRange = view.range;
          oViewBounds.north = view.bounds.north;
          oViewBounds.south = view.bounds.south;
          oViewBounds.east = view.bounds.east;
          oViewBounds.west = view.bounds.west;

          // Create the transaction for the view change
          var transaction = new emp.typeLibrary.Transaction({
            mapInstanceId: mapInstanceId,
            originChannel: "map.status.view",
            intent: emp.intents.control.VIEW_CHANGE,
            source: emp.core.sources.MAP,
            transactionId: emp.helpers.id.newGUID(),
            items: [view, lookAt]
          });
          transaction.run();
        }

      },
      /**
       * @public
       * @description This call generates a pointer event. It must be called by
       * a map engine implementation each time the maps mouse (Pointer) state changes.
       * @param {emp.typeLibrary.Pointer.ParameterType} args This parameter contain data needed to create the event.
       */
      Pointer: function (args) {
        var pointer = new emp.typeLibrary.Pointer(args),
          intent = emp.intents.control.POINTER,
          transaction,
          fTransaction,
          mapInstance = emp.instanceManager.getInstance(mapInstanceId),
          dragPointer;

        // retrieve the editingManager in case we are in edit mode.
        var editingManager = mapInstance.editingManager.get();

        // If we are not in freehand mode.
        if (!freehandMode) {

          // If the caller does not indicate the type ignore it and exit.
          if (!args.type) {
            return;
          }

          // First we are going to monitor if any drag events are occurring.
          //   Check to see if this is a mouse down.
          if (args.type === emp.typeLibrary.Pointer.EventType.MOUSEDOWN) {

            //     Memorize location, if next event comes as a move with button still
            //     down, then this is a drag.
            if (mapInstance.status.get() === emp.map.states.EDIT) {

              this.mapDragStart = {
                featureId: pointer.featureId,
                startX: pointer.clientX,
                startY: pointer.clientY
              };

              editingManager.editMouseDown(pointer.featureId);
            } else {
              this.mapDragStart = {};
            }

          //  Check to see if this is a mouse move
          } else if (args.type === emp.typeLibrary.Pointer.EventType.MOVE) {

            // if mouse button is still down, start drag
            if (this.mapDragStart && this.mapDrag !== true) {

              // Were we over a feature when we started dragging?
              if (this.mapDragStart.featureId && mapInstance.status.get() === emp.map.states.EDIT) {

                this.mapDrag = true;

                // create a feature drag event.
                args.featureId = this.mapDragStart.featureId;
                args.target = "feature";
                args.type = emp.typeLibrary.Pointer.EventType.DRAG;

                dragPointer = new emp.typeLibrary.Pointer(args);

                // pass the transaction to the editingManager to determine if this
                // transaction should be run.

                editingManager.editDragStart(this.mapDragStart.featureId, dragPointer);

              // We weren't over a feature we were over the map.
              } else {
                this.mapDrag = true;

                args.type = emp.typeLibrary.Pointer.EventType.DRAG;
                args.coreId = undefined;
                args.featureId = undefined;
                args.target = 'globe';

                dragPointer = new emp.typeLibrary.Pointer(args);

                fTransaction = new emp.typeLibrary.Transaction({
                  mapInstanceId: mapInstanceId,
                  intent: intent,
                  originChannel: "cmapi2.map.view.drag",
                  source: emp.core.sources.MAP,
                  transactionId: emp.helpers.id.newGUID(),
                  items: [dragPointer]
                });
                fTransaction.run();
              }
            } else if (this.mapDragStart && this.mapDrag === true &&
                this.mapDragStart.featureId && mapInstance.status.get() === emp.map.states.EDIT &&
                this.mapDrag === true) {
              // pass the pointer to editor manager. to decide if
              mapInstance.editingManager.get().editDragMove(
                this.mapDragStart.featureId,
                this.mapDragStart.startX,
                this.mapDragStart.startY,
                pointer);
            }
          //   Check to see if this is a mouse up
          } else if (args.type === emp.typeLibrary.Pointer.EventType.MOUSEUP) {
            //     if this is a mouse up and there was a previous drag,
            //       send the drag complete event.
            if (this.mapDrag) {

              if (this.mapDragStart.featureId) {
                args.type = emp.typeLibrary.Pointer.EventType.DRAG_COMPLETE;
                args.target = "feature";
                args.featureId = this.mapDragStart.featureId;
                dragPointer = new emp.typeLibrary.Pointer(args);

                // let the editingManager decide if event should be raised.
                mapInstance.editingManager.get().editDragComplete(
                  this.mapDragStart.featureId,
                  this.mapDragStart.startX,
                  this.mapDragStart.startY,
                  dragPointer);

                this.mapDragStart = null;
                this.mapDrag = false;
              } else {
                args.type = emp.typeLibrary.Pointer.EventType.DRAG_COMPLETE;
                args.coreId = undefined;
                args.featureId = undefined;
                args.target = 'globe';
                dragPointer = new emp.typeLibrary.Pointer(args);
                fTransaction = new emp.typeLibrary.Transaction({
                  mapInstanceId: mapInstanceId,
                  intent: intent,
                  originChannel: "cmapi2.map.view.dragComplete",
                  source: emp.core.sources.MAP,
                  transactionId: emp.helpers.id.newGUID(),
                  items: [dragPointer]
                });
                fTransaction.run();
                this.mapDragStart = null;
                this.mapDrag = false;
              }
            }
          }

          // For transactions we need to separate pointer move events from click events
          // Use the transaction intent for this
          if ((args.type === emp.typeLibrary.Pointer.EventType.SINGLE_CLICK) ||
            (args.type === emp.typeLibrary.Pointer.EventType.DBL_CLICK)) {
            intent = emp.intents.control.CLICK;
            // Check to see if this is a feature click.
            // We will dispatch an additional event for feature clicks
            // in addition to a map click if the click event contains a feature
            if (pointer.target.toLowerCase() === "feature") {
              fTransaction = new emp.typeLibrary.Transaction({
                mapInstanceId: mapInstanceId,
                intent: emp.intents.control.FEATURE_CLICK,
                originChannel: "map.feature.clicked",
                source: emp.core.sources.MAP,
                transactionId: emp.helpers.id.newGUID(),
                items: [pointer]
              });
              fTransaction.run();
            }
          }

          transaction = new emp.typeLibrary.Transaction({
            mapInstanceId: mapInstanceId,
            intent: intent,
            originChannel: "map.view.clicked",
            source: emp.core.sources.MAP,
            transactionId: emp.helpers.id.newGUID(),
            items: [pointer]
          });
          transaction.run();
        }
        else {
          // We are in freehand mode

          // If this is a mouse down start drawing. We need to send out an
          // event that notifies the API that the line draw started.  When
          // the mouse up event occurs, the line draw completes.
          if (args.type === emp.typeLibrary.Pointer.EventType.MOUSEDOWN) {
            freehandModeDrawStart = true;

            freehandFeature.data.coordinates.push([pointer.lon, pointer.lat]);
            // Assign a parent to the feature.  Why mapInstanceId?  It was
            // available on Cesium as an overlay that was already added, and
            // we did not have to wait for it to be created.   Make this much
            // simpler.
            freehandFeature.overlayId = mapInstanceId;
            freehandFeature.parentCoreId = mapInstanceId;

            if (freehandLineColorOverride) {
              freehandFeature.properties.lineColor = freehandLineColorOverride;
            } else {
              freehandFeature.properties.lineColor = freehandLineColor;
            }

            if (freehandLineWidthOverride) {
              freehandFeature.properties.lineWidth = freehandLineWidthOverride;
            } else {
              freehandFeature.properties.lineWidth = freehandLineWidth;
            }

            // Send out an event that says we started the line draw.
            transaction = new emp.typeLibrary.Transaction({
              mapInstanceId: mapInstanceId,
              intent: emp.intents.control.FREEHAND_LINE_DRAW_START,
              originChannel: "cmapi2.map.freehand",
              source: emp.core.sources.MAP,
              transactionId: emp.helpers.id.newGUID(),
              items: [freehandFeature]
            });
            transaction.run();

          }
          else if (args.type === emp.typeLibrary.Pointer.EventType.MOUSEUP) {

            // End the line draw.  Remove the line that we put on the map.
            // We call the engines remove call, specifically not sending it
            // through the queue as to prevent events bubbling up to the API.
            freehandModeDrawStart = false;
            freehandFeature.data.coordinates.push([pointer.lon, pointer.lat]);


            // remove the freehand graphic from the map.
            transaction = new emp.typeLibrary.Transaction({
              intent: emp.intents.control.FEATURE_REMOVE,
              mapInstanceId: mapInstanceId,
              originChannel: cmapi.channel.names.FEATURE_REMOVE,
              source: emp.core.sources.MAP,
              items: [freehandFeature]
            });

            if (mapInstance && mapInstance.engine) {
              mapInstance.engine.feature.remove(transaction);
            }

            // Create a freehand line draw end event.
            transaction = new emp.typeLibrary.Transaction({
              mapInstanceId: mapInstanceId,
              intent: emp.intents.control.FREEHAND_LINE_DRAW_END,
              originChannel: "cmapi2.map.freehand",
              source: emp.core.sources.MAP,
              transactionId: emp.helpers.id.newGUID(),
              items: [freehandFeature]
            });
            transaction.run();

            // reset the freehandFeature so that it resets its points.
            freehandFeature.data.coordinates = [];

          }
          else if (args.type === emp.typeLibrary.Pointer.EventType.MOVE &&
            freehandModeDrawStart) {

            // add the freehand feature to the map if this is the first time,
            // otherwise this add transaction will update the feature.
            freehandFeature.data.coordinates.push([pointer.lon, pointer.lat]);

            transaction = new emp.typeLibrary.Transaction({
              intent: emp.intents.control.FEATURE_ADD,
              mapInstanceId: mapInstanceId,
              originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
              source: emp.core.sources.MAP,
              items: [freehandFeature]
            });

            if (mapInstance && mapInstance.engine) {
              mapInstance.engine.feature.add(transaction);
            }

            // now send an event out that notifies of a freenad line draw upate.
            transaction = new emp.typeLibrary.Transaction({
              mapInstanceId: mapInstanceId,
              intent: emp.intents.control.FREEHAND_LINE_DRAW_UPDATE,
              originChannel: "cmapi2.map.freehand",
              source: emp.core.sources.MAP,
              transactionId: emp.helpers.id.newGUID(),
              items: [freehandFeature]
            });
            transaction.run();
          }
        }
      },
      /**
       * @public
       * @description This call generates a SelectionBox event. It must be called by
       * a map engine implementation at the end of the area selection event.
       * @param {emp.typeLibrary.SelectionBox.ParameterType} args This parameter contain data needed to create the event.
       */
      SelectionBox: function (args) {
        var viewArea = new emp.typeLibrary.SelectionBox(args),
          transaction;
        transaction = new emp.typeLibrary.Transaction({
          mapInstanceId: mapInstanceId,
          source: "CORE-EVENTING",
          intent: emp.intents.control.SELECTION_BOX,
          originChannel: "map.view.area.selected",
          sender: "EMP_MAP_CORE",
          transactionId: emp.helpers.id.newGUID(),
          items: [viewArea]
        });
        transaction.run();
      },
      StaticContent: function (args) {

        var transaction = new emp.typeLibrary.Transaction({
          mapInstanceId: mapInstanceId,
          intent: emp.intents.control.STATIC_CONTENT,
          transactionId: emp.helpers.id.newGUID(),
          source: emp.core.sources.MAP,
          items: args
        });
        transaction.run();
      },
      /**
       * @public
       * @description This call generates an error event. It must be called by
       * a map engine implementation each time the maps encounters an error condition.
       * @param {emp.typeLibrary.Error.ParameterType} args This parameter contain the data needed to generate the event.
       */
      Error: function (args) {
        var error = emp.typeLibrary.Error(args),
          transaction = new emp.typeLibrary.Transaction({
            mapInstanceId: mapInstanceId,
            intent: emp.intents.control.ERROR,
            transactionId: emp.helpers.id.newGUID(),
            source: emp.core.sources.MAP,
            items: [error]
          });
        transaction.run();
      },
      /**
       * @public
       * @description Sends a message that the map engine has changed status.
       *  Engines can have any of the states defined in emp.map.states.
       * @param {emp.typeLibrary.Status.ParameterType} args This parameter contains all the data needed to generate the event.
       */
      StatusChange: function (args) {
        var newStatus = new emp.typeLibrary.Status(args),
          transaction = new emp.typeLibrary.Transaction({
            mapInstanceId: mapInstanceId,
            intent: emp.intents.control.STATUS_CHANGE,
            intentParams: "initialization",
            originChannel: "map.status.request",
            source: emp.core.sources.MAP,
            transactionId: emp.helpers.id.newGUID(),
            items: [newStatus]
          });

        if ((newStatus.status !== undefined) && (newStatus.status !== null)) {
          publicInterface.status.set(newStatus.status);
        }
        transaction.run();
      },
      /**
       * @public
       * @description This call generates a draw start event. It indicates that a draw
       * operation has been started. It must be called by
       * a map engine implementation at the start of the draw operation.
       * @param {object} args This parameter contain the draw start transaction.
       * @param {emp.typeLibrary.Transaction} args.transaction It must contain a reference to the instance of the draw start transaction passed to the map engine.
       */
      DrawStart: function (args) {
        if (args.hasOwnProperty("failures")) {
          args.transaction.fail(args.failures);
        }
        if (publicInterface.eventing.voice.silent) {
          args.transaction.success = [];
        }
        var transaction = new emp.typeLibrary.Transaction({
          mapInstanceId: mapInstanceId,
          intent: emp.intents.control.DRAW_START,
          transactionId: emp.helpers.id.newGUID(),
          source: emp.core.sources.MAP,
          items: [args.transaction]
        });

        transaction.run();
      },
      /**
       * @public
       * @description This call generates a draw end event. It indicates that a draw
       * operation has finished. It must be called by
       * a map engine implementation at the end of the draw operation.
       * @param {object} args This parameter contain the draw start transaction.
       * @param {emp.typeLibrary.Transaction} args.transaction It must contain a reference to the instance of the draw start transaction passed to the map engine.
       * @param {emp.typeLibrary.Error} args.failures Contain a reference to an array of error if the draw is being canceled.
       */
      DrawEnd: function (args) {

        var oDraw = args.transaction.items[0];

        if (args.hasOwnProperty("failures")) {
          args.transaction.fail([{
            coreId: oDraw.coreId,
            level: emp.typeLibrary.Error.level.INFO,
            message: "Operation Canceled."
          }]);

          if (oDraw !== undefined) {
            args.transaction.duplicateItems.push(oDraw);
            oDraw.cancel({
              mapInstanceId: mapInstanceId
            });
          }
        }
        else if (oDraw !== undefined) {
          oDraw.end({
            mapInstanceId: mapInstanceId,
            source: args.transaction.source
          });
        }

        if (publicInterface.eventing.voice.silent) {
          args.transaction.success = [];
        }

        var transaction = new emp.typeLibrary.Transaction({
          mapInstanceId: mapInstanceId,
          intent: emp.intents.control.DRAW_ENDED,
          source: emp.core.sources.MAP,
          items: [args.transaction]
        });

        transaction.run();
      },
      /**
       * @public
       * @description This call generates a edit start event. It indicates that an edit
       * operation has been started. It must be called by
       * a map engine implementation at the start of the edit operation.
       * @param {object} args This parameter contain the edit start transaction.
       * @param {emp.typeLibrary.Transaction} args.transaction It must contain a reference to the instance of the edit start transaction passed to the map engine.
       */
      EditStart: function (args) {
        if (args.hasOwnProperty("failures")) {
          args.transaction.fail(args.failures);
        }
        if (publicInterface.eventing.voice.silent) {
          args.transaction.success = [];
        }

        var transaction = new emp.typeLibrary.Transaction({
          mapInstanceId: mapInstanceId,
          intent: emp.intents.control.EDIT_START,
          transactionId: emp.helpers.id.newGUID(),
          source: emp.core.sources.MAP,
          items: [args.transaction]
        });

        transaction.run();
      },
      /**
       * @public
       * @description This call generates a edit end event. It indicates that an edit
       * operation has finished. It must be called by
       * a map engine implementation at the end of the edit operation.
       * @param {object} args This parameter contain the edit start transaction.
       * @param {emp.typeLibrary.Transaction} args.transaction It must contain a reference to the instance of the edit start transaction passed to the map engine.
       * @param {emp.typeLibrary.Error} args.failures Contain a reference to an array of error if the edit is being canceled.
       */
      EditEnd: function (args) {

        var oEdit = args.transaction.items[0];
        if (args.hasOwnProperty("failures")) {
          args.transaction.fail([{
            coreId: oEdit.coreId,
            level: emp.typeLibrary.Error.level.INFO,
            message: "Operation Canceled."
          }]);
        }
        if (publicInterface.eventing.voice.silent) {
          args.transaction.success = [];
        }

        if (args.hasOwnProperty("failures")) {
          args.transaction.duplicateItems.push(oEdit);
          oEdit.cancel({
            mapInstanceId: mapInstanceId
          });
        }
        else {
          oEdit.end({
            mapInstanceId: mapInstanceId
          });
        }

        var transaction = new emp.typeLibrary.Transaction({
          mapInstanceId: mapInstanceId,
          intent: emp.intents.control.EDIT_ENDED,
          source: emp.core.sources.MAP,
          items: [args.transaction]
        });

        transaction.run();
      }
    },

    status: {
      get: function () {
        // When a map engine emits a status change event, the dispatchEvent function
        // catches it and sets the publicInterface.status object to the current engine status
        return currentStatus.status;
      },
      set: function (args) {
        // When a map engine emits a status change event, the dispatchEvent function
        // catches it and sets the publicInterface.status object to the current engine status
        currentStatus.status = args;
      },
      getViewBounds: function () {
        return oViewBounds;
      },
      getViewCenter: function () {
        return oViewCenter;
      },
      getViewRange: function () {
        return dViewRange;
      },
      getMapLockStatus: function() {
        return currentStatus.mapLockStatus;
      },
      setMapLockStatus: function(status) {
        currentStatus.mapLockStatus = status;
      },
      validateState: function (oTransaction) {
        var bSuccess = true,
          sErrorMsg = "",
          //sNewState,
          bConfirmResponse,
          confirmationMessage = "";

        if (oTransaction.intent === emp.intents.control.DRAW_BEGIN) {
          switch (publicInterface.status.get()) {
            case emp.map.states.EDIT:
              confirmationMessage = 'A new draw command has started while in edit mode. Click "OK" to cancel the current edit operation and begin drawing a new feature.  Click "Cancel" to ignore the new draw command and continue editing the current feature.';
              break;
            case emp.map.states.DRAW:
              confirmationMessage = 'A new draw command has started while in draw mode. Click "OK" to cancel the current draw operation and begin drawing a new feature.  Click "Cancel" to ignore the new draw command and continue drawing the current feature.';
              break;
            default:
              //sNewState = emp.map.states.DRAW;
              break;
          }
        }
        else if (oTransaction.intent === emp.intents.control.EDIT_BEGIN) {
          switch (publicInterface.status.get()) {
            case emp.map.states.EDIT:
              confirmationMessage = 'A new edit command has started while in edit mode. Click "OK" to cancel the current edit operation and begin editing a different feature.  Click "Cancel" to ignore the new edit command and continue editing the current feature.';
              break;
            case emp.map.states.DRAW:
              confirmationMessage = 'A new edit command has started while in draw mode. Click "OK" to cancel the current draw operation and begin editing a different feature.  Click "Cancel" to ignore the new edit command and continue drawing the current feature.';
              break;
            default:
              //sNewState = emp.map.states.EDIT;
              break;
          }
        }
        // check to see if we need to display confirmation window
        // in fo confirmation is needed, the message will be an empty string
        if (confirmationMessage !== "") {
          bConfirmResponse = confirm(confirmationMessage);
          if (bConfirmResponse) {
            oEditDrawTransaction = oTransaction;
            oTransaction.pause();
            // Start the cancel on a timer so we have time to return to the paused transaction.
            setTimeout(publicInterface.engines.drawEditCancel(), 100);
          }
          else {
            bSuccess = false;
            sErrorMsg = "Draw or Edit command cancelled by user due to an existing draw or edit already in progress.";
          }
        }
        if (!bSuccess) {
          // Fail the request.
          while (oTransaction.items.length > 0) {
            oTransaction.fail([{
              coreId: oTransaction.items[0].coreId,
              level: emp.typeLibrary.Error.level.MINOR,
              message: sErrorMsg
            }]);
          }
        }

        return true;
      },
      cancelDrawEditForOverlayRemove: function (oTransaction) {
        var oOverlay,
          oParent,
          sParentKey,
          bExecuteCancel = false,
          iIndex;

        switch (publicInterface.status.get()) {
          case emp.map.states.EDIT:
          case emp.map.states.DRAW:
            // We are in Draw or Edit mode.
            // Check to see if the remove will affect the feature.
            // And if so, cancel the Draw/Edit.
            sParentKey = emp.helpers.id.get.coreParent(oDrawEditOperation);

            while (!bExecuteCancel && (sParentKey !== emp.storage.getRootGuid(this.mapInstanceId))) {
              for (iIndex = 0; iIndex < oTransaction.items.length; iIndex++) {
                oOverlay = oTransaction.items[iIndex];

                if (sParentKey === oOverlay.coreId) {
                  // This overlay is a parent of the one being edit/draw.
                  bExecuteCancel = true;
                  break;
                }
              }

              if (!bExecuteCancel) {
                // Get the features parent
                oParent = emp.storage._storage.get({
                  coreId: sParentKey
                });

                if (oParent) {
                  sParentKey = oParent.coreParent;
                }
                else {
                  break;
                }
              }
            }

            if (bExecuteCancel) {
              oTransaction.pause();
              oRemoveTransaction = oTransaction;
              bExecuteRemove = true;
              // Start the cancel on a timer so we have time to return to the paused transaction.
              setTimeout(publicInterface.engines.drawEditCancel(), 100);
            }
            else {
              bExecuteRemove = false;
            }
            break;
          default:
            break;
        }

        return true;
      },
      cancelDrawEditForFeatureRemove: function (oTransaction) {
        var sDrawEditKey,
          bExecuteCancel = false,
          iIndex = 0;

        switch (publicInterface.status.get()) {
          case emp.map.states.EDIT:
          case emp.map.states.DRAW:
            // We are in Draw or Edit mode.
            // Check to see if the remove will affect the feature.
            // And if so, cancel the Draw/Edit.

            // Get the key of the feature in Draw/Edit.
            sDrawEditKey = oDrawEditOperation.coreId;

            for (iIndex = 0; iIndex < oTransaction.items.length; iIndex++) {

              if (oTransaction.items[iIndex].coreId === sDrawEditKey) {
                // The Feature in Draw/Edit is being removed.
                bExecuteCancel = true;
                break;
              }
            }

            if (bExecuteCancel) {
              oTransaction.pause();
              oRemoveTransaction = oTransaction;
              bExecuteRemove = true;
              // Start the cancel on a timer so we have time to return to the paused transaction.
              setTimeout(publicInterface.engines.drawEditCancel, 50);
            }
            else {
              bExecuteRemove = false;
            }
            break;
        }

        return true;
      }
    },

    configuration: {
      formats: [],
      burstSoftLimit: 200
    },
    engines: {
      isMapSwapInProgress: function () {
        return bReloadInProgress;
      },
      isInitialLoadInProgress: function () {
        return bLoadInProgress;
      },
      validateOverlayRemoval: function (oTransaction) {
        var oOverlay,
          iIndex;

        for (iIndex = 0; iIndex < oTransaction.items.length; iIndex++) {
          oOverlay = oTransaction.items[iIndex];

          if (oOverlay.overlayId === publicInterface.engines.getDefaultLayerOverlayID(oTransaction.mapInstanceId)) {
            oTransaction.fail(emp.typeLibrary.Error({
              coreId: oOverlay.coreId,
              level: emp.typeLibrary.Error.level.MINOR,
              message: "The default layer overlay can not be removed."
            }));
          }
          else if (oOverlay.overlayId === emp.wms.manager.getWmsOverlayId(oTransaction.mapInstanceId)) {
            oTransaction.fail(emp.typeLibrary.Error({
              coreId: oOverlay.coreId,
              level: emp.typeLibrary.Error.level.MINOR,
              message: "The WMS Service overlay can not be removed."
            }));
          }
        }
      },
      validateOverlayClear: function (oTransaction) {
        var oOverlay,
          iIndex;

        for (iIndex = 0; iIndex < oTransaction.items.length; iIndex++) {
          oOverlay = oTransaction.items[iIndex];

          if (oOverlay.overlayId === publicInterface.engines.getDefaultLayerOverlayID(oTransaction.mapInstanceId)) {
            oTransaction.fail(emp.typeLibrary.Error({
              coreId: oOverlay.coreId,
              level: emp.typeLibrary.Error.level.MINOR,
              message: "The default layer overlay can not be cleared."
            }));
          }
          else if (oOverlay.overlayId === emp.wms.manager.getWmsOverlayId(oTransaction.mapInstanceId)) {
            oTransaction.fail(emp.typeLibrary.Error({
              coreId: oOverlay.coreId,
              level: emp.typeLibrary.Error.level.MINOR,
              message: "The WMS Service overlay can not be cleared."
            }));
          }
        }
      },
      getDefaultLayerOverlayID: function () {
        return sDefaultLayerOverlayID;
      },
      /**
       * @memberOf publicInterface.engines
       * @public
       * @description This function must be called to cancel an outstanding draw or
       * edit operation.
       */
      drawEditCancel: function () {
        emp.transactionQueue.cancel(sDrawEditTransactionID);
      },

      /**
       * @memberOf publicInterface.engines
       * @public
       * @description This function must be called to complete an outstanding draw or
       * edit operation.
       */
      drawEditComplete: function () {
        emp.transactionQueue.end(sDrawEditTransactionID);
      },

      /**
       * @memberOf publicInterface.engines
       * @public
       */
      load: function (args) {
        var sTempText = "",
          bProceedWithSwap;

        if (args.hasOwnProperty("mapEngineId") && !emp.helpers.isEmptyString(args.mapEngineId) &&
          args.hasOwnProperty("engineBasePath") && !emp.helpers.isEmptyString(args.engineBasePath)) {
          // Check to make sure manifestName field is populated
          args.manifestName = args.manifestName || "manifest.js";
          args.properties = args.properties || {};
          // Check engineBasePath for "/" ending character
          args.engineBasePath = args.engineBasePath.substr(args.engineBasePath.length - 1) !== "/" ? args.engineBasePath + "/" : args.engineBasePath;
        }
        else {
          throw new Error("Required engine configuration properties missing.");
        }
        args.manifestUrl = args.engineBasePath + args.manifestName;
        engineConfig.setCurrentEngineConfiguration(args);
        if (publicInterface.engine !== null) {
          if (publicInterface.status.get() === emp.map.states.DRAW) {
            sTempText = "Draw";
          }
          else if (publicInterface.status.get() === emp.map.states.EDIT) {
            sTempText = "Edit";
          }
          if ((publicInterface.status.get() === emp.map.states.DRAW) ||
            (publicInterface.status.get() === emp.map.states.EDIT)) {
            bProceedWithSwap = confirm("Swapping map engines at this time will cancel the " +
              sTempText + " operation.\nDo you want to cancel the operation and swap the map engines?");
            if (bProceedWithSwap) {
              // The user said yes. Store the index of the engine to load,
              // set the reload and
              // cancel the operation.
              // Once we get the ended event we continue
              // with the swap.
              bDoReload = true;
              publicInterface.engines.drawEditCancel();
            }
            return;
          }
          // If there is an engine we are swapping.
          processEngineSwapRequest(mapInstanceId);
          publicInterface.engineDirect = engDirectDefault;
        }
        else {
          publicInterface.engineDirect = engDirectDefault;
          loadMapEngine();
        }
      },
      //loadResources() is not used in V3 environment only V2. Maybe delete this code?
      /**
       * @memberOf publicInterface.engines
       * @public
       * @param Manifest - The manifest is a javascript object contained in the map engines manifest.js file.
       * See Tutorial...
       * begin drawing a feature.
       * @desc This function is called by the manifest.js file for a map engine.  When the script loads and parses it should have a call to publicInterface.engines.loadResources(manifest)
       * passing the manifest object so the widget can load the script resources for the given map engine.  Once all scripts are loaded the map will
       * @method
       */
      /* It should be formatted as follows:
       {resources: ["path to script file here","path to script file here"], callback: function(){
       initialization code here which calls publicInterface.engines.set(engine) with a new map engine
       }}*/

      loadResources: function (manifest) {
        var sManifestURL = emp.helpers.relToAbs(sManifestFile);
        var oMapRegistration = emp.instanceManager.getMapEngineRegistration(sManifestURL);

        if (oMapRegistration) {
          oMapRegistration.fnCreateInstance = manifest.fnCreateInstance;
          publicInterface.engineName = oMapRegistration.name;
        }
        resources = manifest.resourceList;
        resourceLen = resources.length;
        loadComplete = manifest.fnCreateInstance;
        var resource = resources.shift();
        loadResource({
          url: resource,
          callback: loadNextResource
        });
      },
      // Allows the engine provider to be changed to a different map
      // The status of map engine changes to loading
      // Once the load complete event fires the map should be repopulated with data
      set: function (engine) {
        // set to a new map engine
        activeEngine = engine;
        activeEngine.init();
      }

    },
    editingManager: {
      get:  function() {
        return editingManager;
      }
    },
    container: {
      get: function () {
        return container;
      }
    },
    // backdoor access to the map engines underlying sdk like google earth api, cesium, etc
    // This value must be assigned by map engine in the initSuccess function
    engineDirect: engDirectDefault,
    engine: activeEngine,
    init: function () {
      var oRootOverlay;

      editingManager = new emp.editingManager({
        mapInstance: this
      });

      // This config parameter may be used in the future when
      // a unique map instance config object is created which
      // will contain instance specific configurations.
      //      config = args.config;
      //setup our callback for status changes.
      emp.transactionQueue.listener.add({
        type: emp.intents.control.STATUS_CHANGE,
        mapInstanceId: this.mapInstanceId,
        callback: handlerStatusChange
      });

      emp.transactionQueue.listener.add({
        type: emp.intents.control.DRAW_BEGIN,
        mapInstanceId: this.mapInstanceId,
        callback: handleTCDrawEditBegin
      });

      emp.transactionQueue.listener.add({
        type: emp.intents.control.EDIT_BEGIN,
        mapInstanceId: this.mapInstanceId,
        callback: handleTCDrawEditBegin
      });

      emp.transactionQueue.listener.add({
        type: emp.intents.control.DRAW_START,
        mapInstanceId: this.mapInstanceId,
        callback: handleDrawEditStart
      });

      emp.transactionQueue.listener.add({
        type: emp.intents.control.EDIT_START,
        mapInstanceId: this.mapInstanceId,
        callback: handleDrawEditStart
      });

      emp.transactionQueue.listener.add({
        type: emp.intents.control.DRAW_ENDED,
        mapInstanceId: this.mapInstanceId,
        callback: handleDrawEditEnded
      });

      emp.transactionQueue.listener.add({
        type: emp.intents.control.EDIT_ENDED,
        mapInstanceId: this.mapInstanceId,
        callback: handleDrawEditEnded
      });

      emp.transactionQueue.listener.add({
        type: emp.intents.control.DRAW_CANCEL,
        mapInstanceId: this.mapInstanceId,
        callback: handleDrawEditCanceled
      });

      emp.transactionQueue.listener.add({
        type: emp.intents.control.EDIT_CANCEL,
        mapInstanceId: this.mapInstanceId,
        callback: handleDrawEditCanceled
      });

      emp.transactionQueue.listener.add({
        type: emp.intents.control.STORAGE_RELOAD_COMPLETE,
        mapInstanceId: this.mapInstanceId,
        callback: storageReloadComplete
      });

      oRootOverlay = emp.storage.findObject(emp.storage.getRootGuid(this.mapInstanceId));
      oTransaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.MI_OVERLAY_ADD,
        mapInstanceId: this.mapInstanceId,
        items: [oRootOverlay.getObjectData(this.mapInstanceId, undefined)]
      });
      oTransaction.queue();

      sDefaultLayerOverlayID = emp.helpers.id.newGUID();

      var oDefaultLayerOverlay = new emp.typeLibrary.Overlay({
        overlayId: sDefaultLayerOverlayID,
        name: "Layers",
        description: "This overlay groups all KML, GEOJSON, Image feature urls plotted with no overlay defined.",
        permissions: true,
        hidden: true
      });

      var oTransaction = new emp.typeLibrary.Transaction({
        mapInstanceId: this.mapInstanceId,
        intent: emp.intents.control.OVERLAY_ADD,
        source: emp.core.sources.CORE,
        items: [oDefaultLayerOverlay]
      });

      oTransaction.queue();
    },
    discardInstance: function () {
      removeListeners(this.mapInstanceId);

      if (publicInterface.engine) {
        publicInterface.engine.state.destroy();
        delete publicInterface.engine;
        publicInterface.engine = undefined;
      }
    }
  }; // End public interface

  currentStatus = {
    status: emp.map.states.IDLE
  };
  return publicInterface;

};

/**
 * @memberOf emp.map
 * @public
 * @readonly
 * @enum
 * @desc This enumeration contains the constants that represent the different states defined for publicInterface.
 */
emp.map.states = {
  /**
   * @constant
   * @type {string}
   * @desc Constant value representing the initialization state of the map.
   */
  INITIALIZING: "init",
  /**
   * @constant
   * @type {string}
   * @desc Constant value representing the state in which the map has been initialized and is prepared to process requests.
   */
  READY: "ready",
  /**
   * @constant
   * @type {string}
   * @desc Constant value representing an error state.
   */
  ERROR: "error",
  /**
   * @constant
   * @type {string}
   * @desc Constant value representing the state in which the map has been initialized and is not processing any requests.
   */
  IDLE: "idle",
  /**
   * @constant
   * @type {string}
   * @desc Constant value representing the state in which the map is currently in an edit state.
   */
  EDIT: "edit",
  /**
   * @constant
   * @type {string}
   * @desc Constant value representing the state in which the map is currently in draw mode.
   */
  DRAW: "draw",

  /**
   * @constant
   * @type {string}
   * @desc Constant value representing the state in which the map is currently in freehand draw mode.
   */
  FREEHAND: "freehand",
  /**
   * @constant
   * @type {string}
   * @desc Constant value representing the state in which the map is shutting down.
   */
  TEARDOWN: "teardown",
  /**
   * @constant
   * @type {string}
   * @desc Constant value representing the state in which the map swap is in progress.
   */
  MAP_SWAP_IN_PROGRESS: 'mapswapinprogress',
  /**
   * @constant
   * @type {string}
   * @desc Constant value representing the state in which the map has begun the process of shutting down.
   */
  SHUTDOWN_IN_PROGRESS: 'shutdowninprogress',
  /**
   * @constant
   * @type {string}
   * @desc Constant value representing the state in which the map instance initialization failed.
   */
  MAP_INSTANCE_INIT_FAILED: 'mapInstanceInitFailed'
};

/**
 * @memberOf emp.map
 * @public
 * @readonly
 * @enum
 * @desc This enumeration contains the constants that represent the different states for the map engine cursor that can be set via engineInterface.cursor.mode.set.
 */
emp.map.cursor = {
  /**
   * @constant
   * @type {string}
   * @desc Constant value representing the value to tell a map engine to enable the cursor interaction with the map via engineInterface.cursor.mode.set.
   */
  ENABLED: "enabled",
  /**
   * @constant
   * @type {string}
   * @desc Constant value representing the value to tell a map engine to enable the cursor interaction with the map via engineInterface.cursor.mode.set.
   */
  DISABLED: "disabled"
};
