/*global armyc2, cmapi */
var emp = window.emp || {};

/**
 * @private
 * @class
 * Map instance manager
 */
emp.instanceManager = (function () {
  var bInitialLoadInProgress = false,
    bMapSwapInProgress = false,
    oPendingMapInstanceCreateList = [],
    instances = {},
    oRegisteredMapEngines = {},
    cmapiInterface = emp.api.cmapiInterface(),
    hCheckPendingTimer;

  var initialize = function (args) {
    var environment = args.environment,
      clientCallback = args.callback,
      clientShutdownCB = args.shutdownCallback,
      map = args.map,
      readyCallback = function () {

        cmapiInterface.createMapInstance({
          mapInstanceId: map.mapInstanceId
        });
        if (clientCallback) {
          clientCallback(map.mapInstanceId);
        }
      },
      shutdownCallback = function () {
        var payload = {
          status: emp.map.states.TEARDOWN
        };
        var oTransaction = new emp.typeLibrary.Transaction({
          mapInstanceId: map.instanceId,
          intent: emp.intents.control.STATUS_RESPONSE_INIT,
          source: emp.core.sources.CORE,
          items: [payload]
        });
        oTransaction.run();
        if (clientShutdownCB) {
          clientShutdownCB();
        }
      };

    if (args) {
      // These three may not be needed anymore. The original config
      // parameters in the emp.util.config.js did not have these listed
      if (args.hasOwnProperty("relayPath")) {
        emp.environment.owf.properties.rpcRelayPath = args.rpcRelayPath;
      }
      if (args.hasOwnProperty("logLevel")) {
        emp.errorHandler.set(args.logLevel);
      }
      if (args.hasOwnProperty("validate")) {
        if (args.validate === true) {
          emp.validate = true;
        } else if (args.validate === false) {
          emp.validate = false;
        }
      }
    }

    emp.environment.setCallbacks(readyCallback, shutdownCallback);
    if (environment !== emp.environment.browser) {
      emp.environment.set({
        environments: [environment, emp.environment.browser],
        mapInstanceId: args.map.mapInstanceId,
        messageId: args.messageId
      });
    } else {
      emp.environment.set({
        environments: [emp.environment.browser],
        mapInstanceId: args.map.mapInstanceId,
        messageId: args.messageId
      });
    }
  };

  /**
   * For creating a new instance of a map with a unique id and dom element to render into.
   * @method
   * @memberof emp.instanceManager#
   * @public
   * @param  {object} args
   * @param  {string} args.instanceId GUID representing the unique identity of this map instance
   * @param  {string} args.instanceDomId GUID representing the unique DOM div element for the map instance to render its UI into
   * @param  {object} args.config config object containing the values for the map to use for initialization and connections to services
   * @param {object} args.extent
   * @param {string} args.engine
   * @param {string} args.environment
   * @param {string} args.messageId
   * @return {emp.map}
   */
  var buildInstance = function (args) {
    var instanceDomId = args.instanceDomId,
      instanceId = args.instanceId,
      initEngine,
      environment,
      map;

    // needs the args.domContainer and args.instanceId;
    // Sets up the html and adds the divs for the map.  Show the loading screen.
    instanceDomId = emp.ui.renderContainer({
      instanceId: instanceId,
      domContainer: instanceDomId,
      recorder: args.recorder
    });

    map = emp.map({
      mapInstanceId: instanceId,
      extent: args.extent
    });    

    instances[instanceId] = {
      map: map,
      domContainer: instanceDomId
    };
    // This sets up the transaction queue for the new map.
    emp.transactionQueue.newMapInstance({
      mapInstanceId: instanceId
    });
    emp.storage.newMapInstance({
      mapInstanceId: instanceId
    });
    emp.wms.manager.newMapInstance({
      mapInstanceId: instanceId
    });
    // subscribes the map to listening for the transaction queue,
    // adds default overlays like Layers.
    map.init();
    map.uiComponents = {};
    initEngine = function () {
      setTimeout(function () {
        try {
          // Send out INITIALIZING map status event.
          new map.eventing.StatusChange({
            status: emp.map.states.INITIALIZING
          });
          map.engines.load(args.engine);
        } catch (err) {
          console.error("Map instance startup failed." + "\n  name:" + err.name + "\n  message:" + err.message + "\n  stack:" + err.stack);
          emp.instanceManager.mapInstanceStartupFailed(instanceId);
        }
      }, 0);
    };
    environment = emp.util.validateEnvironment(args.environment);
    // Initialize emp core
    initialize({
      callback: initEngine,
      environment: environment,
      map: map,
      instanceId: instanceId,
      instanceDomId: instanceDomId,
      messageId: args.messageId
    });

    return map;
  };

  cmapiInterface.init();
  emp.storage.init();

  var storageReloadStart = function () {
    bMapSwapInProgress = true;
  };

  var storageReloadComplete = function () {
    bMapSwapInProgress = false;
  };

  var attempts = 10;

  var checkRendererFontsLoaded = function () {
    if ((armyc2 === undefined) ||
      (armyc2.c2sd === undefined) ||
      (armyc2.c2sd.renderer === undefined) ||
      (armyc2.c2sd.renderer.utilities === undefined) ||
      (armyc2.c2sd.renderer.utilities.RendererUtilities === undefined)) {
      setTimeout(checkRendererFontsLoaded, 1000);
      return;
    }

    if (armyc2.c2sd.renderer.utilities.RendererUtilities.fontsLoaded()) {
      return true;
    } else if (attempts > 0) {
      attempts -= 1;
      setTimeout(checkRendererFontsLoaded, 1000);
      //sometimes font won't register until after a render attempt
      armyc2.c2sd.renderer.MilStdIconRenderer.Render("SHAPWMSA-------", {});
    } else {
      console.error("MIL-SYM-JS 2525 Rendering fonts failed to load.  Please ensure that the mil-symjs JavaScript and CSS files are included on the application correctly");
    }
  };

  function cleanupInstance(mapInstanceId, bDumpQ) {
    var oInstance;
    var oKeyList;
    var iIndex;
    var oUIComponent;
    var domContainerId;

    oInstance = instances[mapInstanceId].map;
    domContainerId = instances[mapInstanceId].domContainer;

    if (bDumpQ) {
      emp.transactionQueue.dumpMapQueue(mapInstanceId);
    } else {
      emp.transactionQueue.purgeMapQueue(mapInstanceId);
    }

    emp.transactionQueue.listener.remove({
      type: emp.intents.control.MAP_ENGINE_SWAP_START,
      mapInstanceId: mapInstanceId,
      callback: storageReloadStart
    });

    emp.transactionQueue.listener.remove({
      type: emp.intents.control.MAP_ENGINE_SWAP_COMPLETE,
      mapInstanceId: mapInstanceId,
      callback: storageReloadComplete
    });

    if (oInstance.uiComponents !== undefined) {
      // Destroy the UI components of the instance.
      oKeyList = emp.helpers.associativeArray.getKeys(oInstance.uiComponents);

      for (iIndex = 0; iIndex < oKeyList.length; iIndex += 1) {
        oUIComponent = oInstance.uiComponents[oKeyList[iIndex]];

        if (oUIComponent && (typeof(oUIComponent.destroy) === 'function')) {
          oUIComponent.destroy();
        }

        delete oInstance.uiComponents[oKeyList[iIndex]];
      }
    }

    emp.wms.manager.removeMapInstance({
      mapInstanceId: mapInstanceId
    });

    new oInstance.eventing.StatusChange({
      status: emp.map.states.TEARDOWN
    });
    oInstance.discardInstance();

    cmapiInterface.destroyMapInstance({
      instanceId: mapInstanceId
    });

    emp.storage.removeMapInstance({
      mapInstanceId: mapInstanceId
    });

    emp.transactionQueue.removeMapInstance(mapInstanceId);

    delete instances[mapInstanceId];

    var container = document.getElementById(domContainerId);
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  var publicInterface = {
    /**
     * Gets the instance with the specified id
     * @param {string} instanceId
     * @returns {emp.map}
     */
    getInstance: function (instanceId) {
      if (!instances[instanceId]) {
        return undefined;
      }
      return instances[instanceId].map;
    },
    /**
     *
     * @param {Object} args
     * @param {String} args.instanceDomId The ID of the HTML div the map instance is to be placed in.
     * @param {String} args.messageId The message ID of the create instance message.
     * @param {Object} args.engine A map engine configuration object.
     * @param {Object} args.extent The extent of the default view the map should start at.
     * @returns {String} The map instance ID.
     */
    createInstance: function (args) {

      if (emp.helpers.associativeArray.size(instances) === 0) {
        checkRendererFontsLoaded();
      }
      args.instanceId = emp.helpers.id.newGUID();
      oPendingMapInstanceCreateList.push(args);
      this.startNextPendingMapInstance();

      emp.transactionQueue.listener.add({
        type: emp.intents.control.MAP_ENGINE_SWAP_START,
        mapInstanceId: args.instanceId,
        callback: storageReloadStart
      });

      emp.transactionQueue.listener.add({
        type: emp.intents.control.MAP_ENGINE_SWAP_COMPLETE,
        mapInstanceId: args.instanceId,
        callback: storageReloadComplete
      });
      return args.instanceId;
    },
    destroyInstance: function (args) {

      if (!instances.hasOwnProperty(args.mapInstanceId)) {
        return;
      }

      // Check to make sure that while we are destroying the map,
      // we are not loading another map.  If we are we want to wait
      // a bit until that finishes loading.  Try again in a bit.
      if (this.isMapEngineLoading()) {
        setTimeout(function () {
          publicInterface.destroyInstance(args);
        }, 50);
      } else {

        // Send out a SHUTDOWN_IN_PROGRESS.  This is part of the map
        // status events.  Eventually, the map will indicate that it is
        // fully shut down.
        new publicInterface.getInstance(args.mapInstanceId).eventing.StatusChange({
          status: emp.map.states.SHUTDOWN_IN_PROGRESS
        });
        cleanupInstance(args.mapInstanceId, false);

        // This will respond to the request to remove the map
        // with a message complete so the user knows it has received
        // the request to shutdown.
        setTimeout(function () {
          var transactionMessage = {
            messageId: args.messageId,
            originatingChannel: cmapi.channel.names.MAP_SHUTDOWN,
            status: "success",
            details: {},
            failures: []
          };

          emp.environment.get().pubSub.publish({
            channel: cmapi.channel.names.MAP_MESSAGE_COMPLETE,
            message: transactionMessage,
            sender: {
              id: args.mapInstanceId
            }
          });

        }, 50);
      }
    },
    isMapEngineLoading: function () {
      return bMapSwapInProgress || bInitialLoadInProgress;
    },
    startNextPendingMapInstance: function () {
      var oInstanceArgs;

      if (hCheckPendingTimer) {
        clearTimeout(hCheckPendingTimer);
        hCheckPendingTimer = undefined;
      }
      if (oPendingMapInstanceCreateList.length > 0) {
        if (!this.isMapEngineLoading()) {
          bInitialLoadInProgress = true;
          oInstanceArgs = oPendingMapInstanceCreateList.shift();
          // This function is used to initialize the configuration
          // object which gets referenced in various places. All
          // existing properties are global as of right now. Meaning
          // every instance references the same global configuration
          // object. However, in the future this will change at which
          // point this function will be modified to return a
          // specific configuration object for each unique instance
          // in order to allow for instance specific configuration
          // objects. When this change occurs this function will get
          // moved back to the buildInstance() function where it
          // originally resided.
          emp.util.config.getConfigObject();
          buildInstance(oInstanceArgs);
        } else {
          hCheckPendingTimer = setTimeout(function () {
            hCheckPendingTimer = undefined;
            emp.instanceManager.startNextPendingMapInstance();
          }, 1000);
        }
      }
    },
    statusChangeHdlr: function (oTrans) {
      var oMapEngine;
      var oTransaction;
      var oSettings;
      var asLabels;

      if (instances.hasOwnProperty(oTrans.mapInstanceId)) {
        oMapEngine = instances[oTrans.mapInstanceId].map;
        oSettings = oMapEngine.uiComponents.settings;
      }

      switch (oTrans.items[0].status) {
        case emp.map.states.INITIALIZING:
          break;
        case emp.map.states.READY:
        case emp.map.states.MAP_SWAP_IN_PROGRESS:
          if (oMapEngine &&
            oMapEngine.engines.isMapSwapInProgress()) {
            // We want to issue icon size and label options
            // if and only if we are swapping map engines.

            if (oSettings !== undefined) {
              // We need to run them and not queue them so
              // the reload icons are the right size to begin with
              // and not having to redraw them once they are loaded.
              oTransaction = new emp.typeLibrary.Transaction({
                intent: emp.intents.control.MIL_ICON_SIZE_SET,
                mapInstanceId: oTrans.mapInstanceId,
                source: emp.core.sources.CORE,
                items: [oSettings.iconSizeOption]
              });

              oTransaction.run();

              asLabels = oSettings.getMilStdLabelList();
              oTransaction = new emp.typeLibrary.Transaction({
                intent: emp.intents.control.MIL_ICON_LABELS_SET,
                mapInstanceId: oTrans.mapInstanceId,
                source: emp.core.sources.CORE,
                items: [asLabels]
              });

              oTransaction.run();

              if (oMapEngine && oMapEngine.engine.capabilities.projection.flat) {
                // This we send if and only if its supported by the engine.
                oTransaction = new emp.typeLibrary.Transaction({
                  intent: emp.intents.control.PROJECTION_ENABLE_FLAT,
                  mapInstanceId: oTrans.mapInstanceId,
                  items: [oSettings.mapProjectionFlat]
                });
                oTransaction.run();
              }
            }
          } else if (oMapEngine && bInitialLoadInProgress) {
            if (oSettings !== undefined) {
              if (oMapEngine && oMapEngine.engine.capabilities.projection.flat) {
                // This we send if and only if its supported by the engine.
                oTransaction = new emp.typeLibrary.Transaction({
                  intent: emp.intents.control.PROJECTION_ENABLE_FLAT,
                  mapInstanceId: oTrans.mapInstanceId,
                  items: [oSettings.mapProjectionFlat]
                });
                oTransaction.queue();
              }
            }
            bInitialLoadInProgress = false;
          }
          hCheckPendingTimer = setTimeout(function () {
            emp.instanceManager.startNextPendingMapInstance();
          }, 50);
          break;
        case emp.map.states.MAP_INSTANCE_INIT_FAILED:
          if (oMapEngine) {
            // The map instance fail to initialize.
            emp.instanceManager.mapInstanceStartupFailed(oTrans.mapInstanceId);
          }
          break;
      }
    },
    /**
     * @description This function must be called by each map manifest file when its loaded.
     * It registers the map engine with the cores instance manager.
     * @param {object} args
     * @param {string} args.name Must contain the name of the map engine.
     * @param {string} args.mapEngineId Must contains the map engine's unique identifier.
     * The unique Id can be added to emp.constant.mapEngineId in /lib/emp.constant.js
     * @param {mapEngineInitializecb} args.fnInitialize Must contain a function reference to
     * the maps initialization function. The function is called with one argument.
     * The argument is defines as follows:
     * args = {
         *      config: {@see @link emp.util.configType},
         *      mapInstance: {
         *          mapInstanceId: xyz, // The map instance ID
         *          configProperties: {}, // As provided in the properties.
         *          engines: {
         *          }
         *          eventing: {
         *              SelectionChange: function(args){},
         *              ViewChange: function(args) {},
         *              Pointer: function(args) {},
         *              SelectionBox: function(args) {},
         *              StaticContent: function(args) {},
         *              Error: function(args) {},
         *              StatusChange: function(args) {},
         *              DrawStart: function(args) {},
         *              DrawEnd: function(args) {},
         *              EditStart: function(args) {},
         *              EditEnd: function(args) {}
         *          },
         *          engine: map instance, // The map instance must be placed here.
         *      }
         * }
     *
     * The maps initialization function MUST return
     *
     * @param {Array} args.resources An array of string indicating the relative URL of the resources need by the map engine.
     * @param {function} args.fnCreateInstance A function of the for function(args)
     * which is called to create a map instance. Where the args is defined as follows.
     */
    registerMapEngine: function (args) {
      var currentEngineConfiguration = emp.util.config.getCurrentEngineConfiguration();
      oRegisteredMapEngines[emp.util.config.getCurrentMapEngineId()] = {
        fnInitialize: args.fnInitialize,
        engineConfiguration: currentEngineConfiguration
      };
    },
    getMapEngineRegistration: function (mapEngineId) {
      return oRegisteredMapEngines[mapEngineId];
    },
    getPreviousMapEngineId: function () {
      return oRegisteredMapEngines.previousMapEngineId;
    },
    getCurrentMapEngineId: function () {
      return oRegisteredMapEngines.currentMapEngineId;
    },
    mapInstanceStartupFailed: function (mapInstanceId) {
      if (bInitialLoadInProgress) {
        // The map instance fail to initialize.
        setTimeout(function () {
          cleanupInstance(mapInstanceId, true);
          bInitialLoadInProgress = false;
          emp.instanceManager.startNextPendingMapInstance();
        }, 50);
      }
    }
  };

  return publicInterface;
}());

/**
 * @callback mapEngineInitializecb
 * @param {Object} args This parameter is an object containing all initialization parameters
 * @param {Object} args.config Object containing the main configuration parameters.
 * @param {boolean} args.config.debug If true the map engine should load a debug version of itself.
 * If false it should load a release version of itself.
 * @param {String} args.config.urlProxy Contains the url of the emp proxy.
 * @returns {mapEngineResourceType} The returned object must contains the list of resources required by the map engine.
 */

/**
 * @typedef {Object} mapEngineResourceType
 * @property {Array<String>} resourceList An array of url of the required resources.
 * @property {createInstanceCB} fnCreateInstance A reference to the map engine create instance function.
 */

/**
 * @callback createInstanceCB
 * @param {Object} args.configProperties This parameter contains the map instance
 * configuration parameters provided in the properties of the mapEngines config structure.
 * @param {Object} args.mapInstance An EMP map instance structure.
 * @param {String} args.mapInstance.mapInstanceId Value which uniquely identifies the map instances.
 * @param {Object} args.mapInstance.eventing Object contain all eventing functions.
 * @param {function} args.mapInstance.eventing.SelectionChange Function to generate a selection change event from the map instance.
 * @param {function} args.mapInstance.eventing.ViewChange Function to generate a view change event from the map instance.
 * @param {function} args.mapInstance.eventing.Pointer Function to generate a pointer event from the map instance.
 * @param {function} args.mapInstance.eventing.SelectionBox Function to generate a SelectionBox event from the map instance.
 * @param {function} args.mapInstance.eventing.StaticContent Function to generate a StaticContent event from the map instance.
 * @param {function} args.mapInstance.eventing.Error Function to generate an Error event from the map instance.
 * @param {function} args.mapInstance.eventing.StatusChange Function to generate a Status Change event from the map instance.
 * @param {function} args.mapInstance.eventing.DrawStart Function to generate a Draw Start event from the map instance.
 * @param {function} args.mapInstance.eventing.DrawEnd Function to generate a Draw End event from the map instance.
 * @param {function} args.mapInstance.eventing.EditStart Function to generate a Edit Start event from the map instance.
 * @param {function} args.mapInstance.eventing.EditEnd Function to generate a Edit End event from the map instance.
 * @param {function} args.mapInstance.engine Location where the function MUST place a reference to the newly created map instance.
 */
