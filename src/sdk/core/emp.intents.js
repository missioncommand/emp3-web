/*global emp, cmapi */
var emp = window.emp || {};

/**
 * emp.intents Name Space
 * @namespace emp.intents
 * @memberOf emp
 * @type {Object}
 */
emp.intents = {};

/**
 * Enum emp.intents.control
 * @readonly
 * @memberOf emp.intents
 * @enum {object}
 */

emp.intents.control = {
  /**
   * @constant
   * @desc Intent used when requesting the map's status.
   */
  STATUS: "status",
  STATUS_RESET: "status.reset",
  STATUS_DESTROY: "status.destroy",
  MODE_GET: "mode.get",
  MODE_SET: "mode.set",
  CAPTURE_SCREENSHOT: "capture.screenshot",
  FEATURE_ADD: "feature.add",
  MP_FEATURE_ADD: "multiparent.feature.add",
  FREEHAND_START: "freehand.start",
  FREEHAND_STOP: "freehand.stop",
  FREEHAND_LINE_DRAW_START: "freehand.linedraw.start",
  FREEHAND_LINE_DRAW_END: "freehand.linedraw.end",
  FREEHAND_LINE_DRAW_UPDATE: "freehand.linedraw.update",
  MAP_SERVICE_ADD: "mapservice.add",
  MAP_SERVICE_REMOVE: "mapservice.remove",
  WMS_ADD: "wms.add",
  WMS_REMOVE: "wms.remove",
  WMTS_ADD: "wmts.add",
  WMTS_REMOVE: "wmts.remove",
  KML_LAYER_ADD: "kmllayer.add",
  KML_LAYER_REMOVE: "kmllayer.remove",
  FEATURE_OUTBOUND_PLOT: "feature.outbound.plot",
  FEATURE_REMOVE: "feature.remove",
  MP_FEATURE_REMOVE: "multiparent.feature.remove",
  FEATURE_UPDATE: "feature.update",
  MAP_CONFIG: "map.config",
  DRAW_BEGIN: "draw.begin",
  DRAW_CANCEL: "draw.cancel",
  DRAW_COMPLETE: "draw.complete",
  EDIT_BEGIN: "edit.begin",
  EDIT_CANCEL: "edit.cancel",
  EDIT_END: "edit.end",
  EDIT_ENDED: "edit.ended",
  SELECTION_GET: "selection.get",
  SELECTION_SET: "selection.set",
  SELECTION_CLEAR: "selection.clear",
  GET_LATLON_FROM_XY: "getLatLonFromXY",
  GET_XY_FROM_LATLON: "getXYFromLatLon",
  /**
   * @description Internal constant used to directed selection events out the selection channel.
   */
  SELECTION_OUTBOUND: "selection-outbound",
  /**
   * @description Internal constant used to directed deselection events out the deselection channel.
   */
  DESELECTION_OUTBOUND: "deselection-outbound",
  OVERLAY_ADD: "overlay.add",
  OVERLAY_REMOVE: "overlay.remove",
  OVERLAY_UPDATE: "overlay.update",
  OVERLAY_CLEAR: "overlay.clear",
  OVERLAY_STYLE: "overlay.style",
  MP_OVERLAY_ADD: "multiparent.overlay.add",
  MP_OVERLAY_REMOVE: "multiparent.overlay.remove",
  VISIBILITY_SET: "visibility.set",
  MI_VISIBILITY_SET: "map.instance.visibility.set",
  VISIBILITY_GET: "visibility.get",
  LAYER_ADD: "layer.add",
  LAYER_REMOVE: "layer.remove",
  LAYER_UPDATE: "layer.update",
  LAYER_GET: "layer.get",
  VIEW_LOCK: "view.lock",
  VIEW_SET: "view.set",
  VIEW_GET: "view.get",
  LOOKAT_SET: "lookAt.set",
  //STATIC_ADD: "staticContent.add",
  GET: "map.get",
  EDIT_UPDATE: "edit.update",
  DRAW_UPDATE: "draw.update",
  EVENT_MAP_CLICK: "map.click",
  MIL_ICON_SIZE_SET: "mil.icon.size",
  MIL_ICON_LABELS_SET: "mil.icon.labels.set",
  PROJECTION_ENABLE_FLAT: "projection.enable.Flat",
  /**
   * @description Constant used to register for emp.map.eventing.Error events.
   */
  ERROR: "error",
  /**
   * @description Register for emp.map.eventing.MapStateChangeEvent events.
   * Anytime the state of the map engine changes an event to indicate the current status will be dispatched.
   * Status indicate if the map is initializing, failed to initialize (catastrophic failure, ready to receive data
   */
  STATUS_CHANGE: "status-change",
  /**
   * @description Constant used to register for emp.map.eventing.CLICK events.
   */
  CLICK: "click",
  /**
   * @description Constant used to register for emp.map.eventing.CLICK events.
   */
  FEATURE_CLICK: "feature.click",
  /**
   * @description Constant used to register for emp.map.eventing.POINTER events.
   */
  POINTER: "pointer",
  /**
   * @description Constant used to register for emp.map.eventing.SELECTION_BOX events.
   */
  SELECTION_BOX: "selection.box",
  /**
   * @description Constant used to register for emp.map.eventing.VIEW_CHANGE events.
   */
  VIEW_CHANGE: "view-change",
  /**
   * @description Constant used to register for emp.map.eventing.SELECTION_CHANGE events.
   */
  SELECTION_CHANGE: "selection-change",
  /**
   * @description Constant used to register for emp.map.eventing.STATIC_CONTENT events.
   */
  STATIC_CONTENT: "static-content",
  /**
   * @description Constant used to register for emp.map.eventing.DRAW_ENDED events.
   */
  DRAW_ENDED: "draw.ended",
  /**
   * @description Constant used to have the ME end the drawing.
   */
  DRAW_END: "draw.end",
  /**
   * @description Constant used to register for emp.map.eventing.DRAW_START events.
   */
  DRAW_START: "draw.start",

  /**
   * @description Constant used to register for emp.map.eventing.EDIT_START events.
   */
  EDIT_START: "edit.start",
  /**
   * @description Constant used to register for notification when the underlying environment is ready.
   */
  ENVIRONMENT_READY: "environment.ready",
  /**
   * @private
   * @description his is a catch all intent only used of the transactionQueue to event out every transaction that completes.
   * This value SHALL NOT be used for an actual transaction intent
   */
  TRANSACTION_COMPLETE: "transaction.complete",
  /**
   * @private
   * @description this is a catch all intent only used for the transactionQueue to event out every transaction that has progress events like drawing and editing.
   * This value SHALL NOT be used for an actual transaction intent
   */
  TRANSACTION_PROGRESS: "transaction.progress",
  /**
   * @private
   * @description This intent is used internally to generate the response of the
   * map status request about.
   * This value SHALL NOT be used for an actual transaction intent
   */
  STATUS_RESPONSE_ABOUT: "status.response.about",
  /**
   * @private
   * @description This intent is used internally to generate the response of the
   * map status request format.
   * This value SHALL NOT be used for an actual transaction intent
   */
  STATUS_RESPONSE_FORMAT: "status.response.format",
  /**
   * @private
   * @description This intent is used internally to generate the response of the
   * map status request selected.
   * This value SHALL NOT be used for an actual transaction intent
   */
  STATUS_RESPONSE_SELECTED: "status.response.selected",
  /**
   * @private
   * @description This intent is used internally to generate the response of the
   * map status request init.
   * This value SHALL NOT be used for an actual transaction intent
   */
  STATUS_RESPONSE_INIT: "status.response.init",
  /**
   * @private
   * @description This intent is used to generate a screen shot request to the mpa engine..
   */
  STATUS_REQUEST_SCREENSHOT: "status.request.screenshot",
  /**
   * @private
   * @description This intent is used internally to generate the response of the
   * map status request coordinate system.
   * This value SHALL NOT be used for an actual transaction intent
   */
  STATUS_RESPONSE_COORD_SYSTEM: "status.response.coordinatesystem",
  VIEW_COORDINATESYSTEM: "view.coordinatesystem",
  OVERLAY_CLUSTER_SET: "overlay.cluster.set",
  OVERLAY_CLUSTER_ACTIVATE: "overlay.cluster.activate",
  OVERLAY_CLUSTER_DEACTIVATE: "overlay.cluster.deactivate",
  OVERLAY_CLUSTER_REMOVE: "overlay.cluster.remove",
  MAP_CURSOR_MODE_SET: "map.cursor.mode.set",


  /**
   * @private
   * @description This intent is used to indicate that a map engine swap has started.
   */
  MAP_ENGINE_SWAP_START: "map.engine.swap.start",
  /**
   * @private
   * @description This intent is used to indicate that a map engine swap has completed.
   */
  MAP_ENGINE_SWAP_COMPLETE: "map.engine.swap.complete",
  /**
   * @private
   * @description This intent is used to indicate that a map engine swap has been requested.
   */
  MAP_SWAP: "map.swap",
  /**
   * @private
   * @description This intent is used to indicate that he storage engine reload has completed.
   */
  STORAGE_RELOAD_COMPLETE: "storage.reload.complete",
  /**
   *
   * @private
   */
  CMAPI_GENERIC_FEATURE_REMOVE: "cmapi.generic.feature.remove",
  EMP_UI_INSTANCE_INIT: "emp.ui.instance.init",

  MI_OVERLAY_ADD: "map.instance.overlay.add",

  MI_FEATURE_ADD: "map.instance.feature.add",
  MI_FEATURE_UPDATE: "map.instance.feature.update",
  MI_FEATURE_REMOVE: "map.instance.feature.remove",

  MI_WMS_ADD: "map.instance.wms.add",
  MI_WMS_REMOVE: "map.instance.wms.remove",

  MI_WMTS_ADD: "map.instance.wmts.add",
  MI_WMTS_REMOVE: "map.instance.wmts.remove",

  MI_KML_LAYER_ADD: "map.instance.kml.add",
  MI_KML_LAYER_REMOVE: "map.instance.kml.remove",

  STORAGE_OBJECT_ADDED: "storage.object.added",
  STORAGE_OBJECT_REMOVED: "storage.object.removed",
  STORAGE_OBJECT_UPDATED: "storage.object.updated",
  STORAGE_OBJECT_CHILD_REMOVED: "storage.object.child.removed"
};

/**
 * Control handler for Map swapping
 * @protected
 * @memberOf emp.intents.control
 * @type {Object}
 */
emp.intents.control._func = {
  SE: "store",
  API: "normal"
};
/**
 * Used to modify control components
 * @param  {object} args
 * @return {void}
 */
emp.intents.control.register = function(args) {
  emp.intents.control._func[args.component] = args.func;
};

emp.intents.control.storageHandleSuccess = function(args) {
  var fnStorageHandler = emp.storage[emp.intents.control._func.SE];

  if (fnStorageHandler) {
    fnStorageHandler(args);
  }
};

emp.intents.control.transactionComplete = function(args) {
  switch (emp.intents.control._func.API) {
    case "normal":
      //emp.transactionQueue._complete(args);
      emp.transactionQueue._complete(args);
      break;
    case "reload":
      emp.storage.processTransactionComplete(args);
      break;
  }
};

/**
 * This is a temporary function used to determine if we should use new core
 * editing or the old editing.  Once the full transition to the new editing is
 * done remove this.
 */
emp.intents.control.useNewEditing = function(args) {
  var result = false;

  // At this point we need to decide if we are doing this the
  // old way or new way.  Until all the editors or done, we must
  // support both.
  //
  // In this case we need the format and drawCategory (if it's a MILSymbol)
  // This will tell me if this is something the new core editors
  // handle
  //
  // remove this code after all core editors have been complete.
  var originalFeature = args.items[0].originFeature;
  var symbol;
  var drawCategory;

  // Determine if this is a MIL Symbol.  The mil symbol categories can greatly
  // vary, so we need to know the symbol code and standard for this.
  if (originalFeature.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
    symbol = true;

    drawCategory = emp.util.getDrawCategory(originalFeature);
    }

  if (originalFeature.format === emp3.api.enums.FeatureTypeEnum.GEO_POINT ||
    (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_POINT)) {
    result = true;
  } else if (originalFeature.format === emp3.api.enums.FeatureTypeEnum.GEO_PATH ||
    (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_LINE)) {
    result = true;
  } else if (originalFeature.format === emp3.api.enums.FeatureTypeEnum.GEO_POLYGON ||
    (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_POLYGON)) {
    result = true;
  } else if (originalFeature.format === emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE ||
    (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE)) {
    result = true;
  } else if (originalFeature.format === emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE ||
    (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE)) {
    result = true;
}else if (originalFeature.format === emp3.api.enums.FeatureTypeEnum.GEO_SQUARE ||
    (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.SQUARE)) {
    result = true;

  } else if (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_ROUTE) {
    result = true;
  } else if (symbol && (drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_AUTOSHAPE ||
    drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_ARROW ||
    drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_TWOPOINTLINE ||
    drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_TWOPOINTARROW ||
    drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_SUPERAUTOSHAPE)) {
    result = true;
  }

  return result;
};

/**
 * Determine if we will use the old drawing from v2 or the new.  The new
 * drawing is controlled by the map core code, the old drawing is done in
 * each engine.
 */
emp.intents.control.useNewDrawing = function(args) {
  var result = false,
    symbol = false,
    milstd,
    drawCategory;

  // At this point we need to decide if we are doing this the
  // old way or new way.  Until all the editors or done, we must
  // support both.
  //
  // In this case we need the format and drawCategory (if it's a MILSymbol)
  // This will tell me if this is something the new core editors
  // handle
  //
  // remove this code after all core editors have been complete.
  var item = args.items[0];

  // Determine if this is a MIL Symbol.  The mil symbol categories can greatly
  // vary, so we need to know the symbol code and standard for this.
  if (item.type === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
    symbol = true;

    if (item.properties && item.properties.modifiers) {
      milstd = item.properties.modifiers.standard;
    }

    drawCategory = emp.util.getDrawCategoryBySymbolId(item.symbolCode, milstd);

  }

  if (item.type === emp3.api.enums.FeatureTypeEnum.GEO_POINT ||
    (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_POINT)) {
    result = true;
  } else if (item.type === emp3.api.enums.FeatureTypeEnum.GEO_PATH ||
    (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_LINE)) {
    result = true;
  } else if (item.type === emp3.api.enums.FeatureTypeEnum.GEO_POLYGON ||
    (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_POLYGON)) {
    result = true;
  }

  return result;
};

emp.intents.control.intentSequenceMapper = (function() {
  /*
   * This var contains the intent sequence mapping.
   */
  var intentSequenceMapper = [];

  intentSequenceMapper[emp.intents.control.ERROR] = function() {
    return {
      forward: [],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Error]
    };
  };
  intentSequenceMapper[emp.intents.control.SELECTION_OUTBOUND] = function() {
    return {
      forward: [],
      exit: [
        emp.intents.control.transactionComplete
      ]
    };
  };
  intentSequenceMapper[emp.intents.control.DESELECTION_OUTBOUND] = function() {
    return {
      forward: [],
      exit: [
        emp.intents.control.transactionComplete
      ]
    };
  };
  intentSequenceMapper[emp.intents.control.EDIT_UPDATE] = function() {
    return {
      forward: [],
      exit: [
        emp.transactionQueue._custom
      ]
    };
  };
  intentSequenceMapper[emp.intents.control.DRAW_UPDATE] = function() {
    return {
      forward: [],
      exit: [
        emp.transactionQueue._custom
      ]
    };
  };
  intentSequenceMapper[emp.intents.control.MAP_CURSOR_MODE_SET] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance) {
            if (oMapInstance.engines.isMapSwapInProgress()) {
              args.queue();
            }
            else if (oMapInstance.engine) {
              oMapInstance.engine.cursor.mode.set(args);
            }
          }
        }
      ],
      exit: [
        emp.intents.control.transactionComplete
      ]
    };
  };

  intentSequenceMapper[emp.intents.control.GET_LATLON_FROM_XY] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance) {
            if (oMapInstance.engine) {
              oMapInstance.engine.view.getLatLonFromXY(args);
            }
          }
          return undefined;
        }
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: []
    };
  };

  intentSequenceMapper[emp.intents.control.GET_XY_FROM_LATLON] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance) {
            if (oMapInstance.engine) {
              oMapInstance.engine.view.getXYFromLatLon(args);
            }
          }
          return undefined;
        }
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: []
    };
  };

  intentSequenceMapper[emp.intents.control.FREEHAND_START] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          var item = args.items[0];

          if (oMapInstance) {
            oMapInstance.freehandStart(item);
          }
        }
      ],
      exit: [
        emp.intents.control.transactionComplete
      ]
    };
  };

  intentSequenceMapper[emp.intents.control.FREEHAND_STOP] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance) {
            if (oMapInstance.engine) {
              oMapInstance.freehandStop();
            }
          }
        }
      ],
      exit: [
        emp.intents.control.transactionComplete
      ]
    };
  };

  intentSequenceMapper[emp.intents.control.MAP_CONFIG] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance) {
            if (oMapInstance.engine) {
              oMapInstance.engine.map.config(args);
            }

            // some properties are not handled by the engines.
            // check for these properties and route them appropriately.
            var item = args.items[0];
            if (item && item.freehandStrokeStyle) {
              oMapInstance.setFreehandStrokeStyle(item.freehandStrokeStyle);
            }
          }
        }
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: []
    };
  };

  intentSequenceMapper[emp.intents.control.SELECTION_CHANGE] = function() {
    return {
      forward: [
        emp.storage.selection.selectionChange
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Selection]
    };
  };
  intentSequenceMapper[emp.intents.control.CLICK] = function() {
    return {
      forward: [],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Click]
    };
  };
  /*
   LEGACY, remove if this comment does not cause issue
   intentSequenceMapper[emp.intents.control.STATUS] = function(args)
   {
   return {
   forward: [
   emp.status.get
   ],
   exit: [
   emp.intents.control.transactionComplete
   ],
   constructor: [emp.typeLibrary.Status]
   };
   };
   intentSequenceMapper[emp.intents.control.STATUS_RESET] = function(args)
   {
   return {
   forward: [
   emp.status.get
   ],
   exit: [
   emp.intents.control.transactionComplete
   ]
   };
   };
   intentSequenceMapper[emp.intents.control.STATUS_DESTROY] = function(args)
   {
   return {
   forward: [
   emp.status.get
   ],
   exit: [
   emp.intents.control.transactionComplete
   ]
   };
   };
   */
  intentSequenceMapper[emp.intents.control.CAPTURE_SCREENSHOT] = function() {
    return {
      forward: [],
      exit: [
        emp.intents.control.transactionComplete
      ]
    };
  };
  intentSequenceMapper[emp.intents.control.MI_FEATURE_ADD] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance) {
            if (oMapInstance.engine) {
              oMapInstance.engine.feature.add(args);
            }
          }
          return undefined;
        },
        function(transaction) {
          // This raises a feature added event to the API.  Notifies callers
          // a map instance has successfully added a number of items.
          var oMapInstance = emp.instanceManager.getInstance(transaction.mapInstanceId);

          if (oMapInstance) {
            var publisher = cmapi.channel.publisher[cmapi.channel.names.CMAPI2_FEATURE_EVENT_ADD];
            if (publisher) {
              publisher.process(transaction);
            }
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: []
    };
  };
  intentSequenceMapper[emp.intents.control.MI_FEATURE_UPDATE] = function() {
    return {
      forward: [
        function(args) {
          // Updates features on the map engine.
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);
          if (oMapInstance) {
            if (oMapInstance.engine) {
              oMapInstance.engine.feature.add(args);
            }
          }
          return undefined;
        },
        function(transaction) {
          // This raises a feature updated event to the API.  Notifies callers
          // a map instance has successfully updated a number of items.
          var oMapInstance = emp.instanceManager.getInstance(transaction.mapInstanceId);

          if (oMapInstance) {
            var publisher = cmapi.channel.publisher[cmapi.channel.names.CMAPI2_FEATURE_EVENT_UPDATE];
            if (publisher) {
              publisher.process(transaction);
            }
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: []
    };
  };
  intentSequenceMapper[emp.intents.control.MI_FEATURE_REMOVE] = function() {
    return {
      forward: [
        function(args) {
          // removes features from map engine.
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance) {
            oMapInstance.status.cancelDrawEditForFeatureRemove(args);
          }
        },
        function(args) {
          // Sends out an event back to the api that items have been removed
          // from the map.
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance) {
            if (oMapInstance.engine) {
              oMapInstance.engine.feature.remove(args);
            }
          }
        },
        function(transaction) {
          var oMapInstance = emp.instanceManager.getInstance(transaction.mapInstanceId);

          if (oMapInstance) {
            var publisher = cmapi.channel.publisher[cmapi.channel.names.CMAPI2_FEATURE_EVENT_REMOVE];
            if (publisher) {
              publisher.process(transaction);
            }
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: []
    };
  };
  intentSequenceMapper[emp.intents.control.FEATURE_ADD] = function() {
    return {
      forward: [
        emp.storage.feature.validateAdd,
        emp.storage.feature.add
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: []
    };
  };

  intentSequenceMapper[emp.intents.control.MAP_SERVICE_ADD] = function() {
    return {
      forward: [
        emp.storage.mapservice.validateAdd,
        emp.storage.mapservice.add
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Feature]
    };
  };

  intentSequenceMapper[emp.intents.control.MAP_SERVICE_REMOVE] = function() {
    return {
      forward: [
        emp.storage.mapservice.remove
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Feature]
    };
  };

  intentSequenceMapper[emp.intents.control.MI_WMS_ADD] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance) {
            if (oMapInstance.engine) {
              oMapInstance.engine.wms.add(args);
            }
          }

          // Since this is processed by only the map instance
          // console.error all the failures that occur so the developer
          // will have
          if (args.failures.length > 0) {
            for (var i = 0; i < args.failures.length; i++) {
              console.error(args.failures[i].message);
            }
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: []
    };
  };
  intentSequenceMapper[emp.intents.control.MI_WMTS_ADD] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance) {
            if (oMapInstance.engine) {
              oMapInstance.engine.wmts.add(args);
            }
          }

          // Since this is processed by only the map instance
          // console.error all the failures that occur so the developer
          // will have
          if (args.failures.length > 0) {
            for (var i = 0; i < args.failures.length; i++) {
              console.error(args.failures[i].message);
            }
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: []
    };
  };

  intentSequenceMapper[emp.intents.control.MI_WMS_REMOVE] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance) {
            if (oMapInstance.engine) {
              oMapInstance.engine.wms.remove(args);
            }
          }

          // Since this is processed by only the map instance
          // console.error all the failures that occur so the developer
          // will have
          if (args.failures.length > 0) {
            for (var i = 0; i < args.failures.length; i++) {
              console.error(args.failures[i].message);
            }
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: []
    };
  };

  intentSequenceMapper[emp.intents.control.MI_KML_LAYER_ADD] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance) {
            if (oMapInstance.engine) {
              oMapInstance.engine.kmllayer.add(args);
            }
          }

          // Since this is processed by only the map instance
          // console.error all the failures that occur so the developer
          // will have
          if (args.failures.length > 0) {
            for (var i = 0; i < args.failures.length; i++) {
              console.error(args.failures[i].message);
            }
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: []
    };
  };

  intentSequenceMapper[emp.intents.control.MI_KML_LAYER_REMOVE] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance) {
            if (oMapInstance.engine) {
              oMapInstance.engine.kmllayer.remove(args);
            }
          }

          // Since this is processed by only the map instance
          // console.error all the failures that occur so the developer
          // will have
          if (args.failures.length > 0) {
            for (var i = 0; i < args.failures.length; i++) {
              console.error(args.failures[i].message);
            }
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: []
    };
  };

  intentSequenceMapper[emp.intents.control.MI_WMTS_REMOVE] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance) {
            if (oMapInstance.engine) {
              oMapInstance.engine.wmts.remove(args);
            }
          }

          // Since this is processed by only the map instance
          // console.error all the failures that occur so the developer
          // will have
          if (args.failures.length > 0) {
            for (var i = 0; i < args.failures.length; i++) {
              console.error(args.failures[i].message);
            }
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: []
    };
  };

  intentSequenceMapper[emp.intents.control.FEATURE_REMOVE] = function() {
    return {
      forward: [
        emp.storage.feature.remove
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Feature]
    };
  };
  intentSequenceMapper[emp.intents.control.FEATURE_UPDATE] = function() {
    return {
      forward: [
        emp.storage.feature.validateUpdate,
        emp.storage.feature.update
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Feature]
    };
  };
  intentSequenceMapper[emp.intents.control.VISIBILITY_GET] = function() {
    return {
      forward: [
        emp.storage.visibility.getState
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Feature]
    };
  };
  intentSequenceMapper[emp.intents.control.VISIBILITY_SET] = function() {
    return {
      forward: [
        emp.storage.visibility.set
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Feature]
    };
  };
  intentSequenceMapper[emp.intents.control.MI_VISIBILITY_SET] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engine.visibility.set(args);
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: [emp.typeLibrary.Feature]
    };
  };
  intentSequenceMapper[emp.intents.control.DRAW_BEGIN] = function() {
    return {
      forward: [
        emp.storage.validateDraw,
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.status.validateState(args);
          }
        },
        emp.storage.editBegin,
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);
          var useNewEditing;

          // Check to see if we are using the new editing for this feature.
          useNewEditing = emp.intents.control.useNewDrawing(args);

          if (useNewEditing) {
            // new editing.
            if (oMapInstance && oMapInstance.editingManager) {
              oMapInstance.editingManager.get().draw(args);
            }
          } else {
              // old editing.
            if (oMapInstance && oMapInstance.engine) {
              oMapInstance.engine.draw.begin(args);
            }
          }

          if (args.failures.length > 0) {
            for (var i = 0; i < args.failures.length; i++) {
              window.console.error(args.failures[i].message);
            }
          }
        }
      ],
      exit: [
        emp.storage.editTransCplt,
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Draw]
    };
  };
  intentSequenceMapper[emp.intents.control.DRAW_END] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          // Check to see if we are using the new editing for this feature.
          var useNewEditing = emp.intents.control.useNewDrawing(args);

          if (useNewEditing) {
            if (oMapInstance && oMapInstance.status) {
              oMapInstance.editingManager.get().complete(args);
            }
          } else {
            if (oMapInstance && oMapInstance.engine) {
              oMapInstance.engine.draw.end(args);
            }
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: [emp.typeLibrary.Draw]
    };
  };
  intentSequenceMapper[emp.intents.control.DRAW_CANCEL] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          // Check to see if we are using the new editing for this feature.
          var useNewEditing = emp.intents.control.useNewDrawing(args);

          if (useNewEditing) {
            if (oMapInstance && oMapInstance.status) {
              oMapInstance.editingManager.get().cancel(args);
            }
          } else {
            if (oMapInstance && oMapInstance.engine) {
              oMapInstance.engine.draw.cancel(args);
            }
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: [emp.typeLibrary.Draw]
    };
  };
  intentSequenceMapper[emp.intents.control.EDIT_BEGIN] = function() {
    return {
      forward: [
        emp.storage.validateEdit,
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.status) {
            oMapInstance.status.validateState(args);
          }
        },
        emp.storage.editBegin,
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);
          var useNewEditing;

          // Check to see if we are using the new editing for this feature.
          useNewEditing = emp.intents.control.useNewEditing(args);

          if (useNewEditing) {
            // new editing.
            if (oMapInstance && oMapInstance.editingManager) {
              oMapInstance.editingManager.get().edit(args);
            }
          } else {
            // old editing.
            if (oMapInstance && oMapInstance.engine) {
              oMapInstance.engine.edit.begin(args);
            }
          }
        }
      ],
      exit: [
        emp.storage.editTransCplt,
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Edit]
    };
  };
  intentSequenceMapper[emp.intents.control.EDIT_END] = function() {
    return {
      forward: [

        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          // Check to see if we are using the new editing for this feature.
          var useNewEditing = emp.intents.control.useNewEditing(args);

          if (useNewEditing) {
            if (oMapInstance && oMapInstance.status) {
              oMapInstance.editingManager.get().complete(args);
            }
          } else {
            if (oMapInstance && oMapInstance.engine) {
              oMapInstance.engine.edit.end(args);
            }
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: [emp.typeLibrary.Edit]
    };
  };
  intentSequenceMapper[emp.intents.control.EDIT_CANCEL] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          // Check to see if we are using the new editing for this feature.
          var useNewEditing = emp.intents.control.useNewEditing(args);

          if (useNewEditing) {
            if (oMapInstance && oMapInstance.status) {
              oMapInstance.editingManager.get().cancel(args);
            }
          } else {
            if (oMapInstance && oMapInstance.engine) {
              oMapInstance.engine.edit.cancel(args);
            }
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: [emp.typeLibrary.Edit]
    };
  };
  intentSequenceMapper[emp.intents.control.SELECTION_GET] = function() {
    return {
      forward: [
        emp.storage.get.selected
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Selection]
    };
  };
  intentSequenceMapper[emp.intents.control.SELECTION_SET] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engine.selection.set(args);
          }
        },
        emp.storage.selection.set
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Selection]
    };
  };
  intentSequenceMapper[emp.intents.control.SELECTION_CLEAR] = function() {
    return {
      forward: [],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Selection]
    };
  };
  intentSequenceMapper[emp.intents.control.MI_OVERLAY_ADD] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engine.overlay.add(args);
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: [emp.typeLibrary.Overlay]
    };
  };
  intentSequenceMapper[emp.intents.control.OVERLAY_ADD] = function() {
    return {
      forward: [
        emp.storage.overlay.validateAdd,
        emp.storage.overlay.add
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Overlay]
    };
  };

  intentSequenceMapper[emp.intents.control.OVERLAY_REMOVE] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engines.validateOverlayRemoval(args);
          }
        },
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.status) {
            oMapInstance.status.cancelDrawEditForOverlayRemove(args);
          }
        },
        emp.storage.overlay.remove
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Overlay]
    };
  };

  intentSequenceMapper[emp.intents.control.OVERLAY_UPDATE] = function() {
    return {
      forward: [
        emp.storage.overlay.validateUpdate,
        emp.storage.overlay.update
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Overlay]
    };
  };
  intentSequenceMapper[emp.intents.control.OVERLAY_CLEAR] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engines.validateOverlayClear(args);
          }
        },
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.status.cancelDrawEditForOverlayRemove(args);
          }
        },
        emp.storage.overlay.clear
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.Overlay]
    };
  };
  intentSequenceMapper[emp.intents.control.VIEW_LOCK] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engine.navigation.enable(args);
          }
        }
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: []
    };
  };
  intentSequenceMapper[emp.intents.control.VIEW_SET] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engine.view.set(args);
          }
        },
        emp.storage.view.set
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.View]
    };
  };
  intentSequenceMapper[emp.intents.control.VIEW_GET] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engine.view.get(args);
          }
        }
      ],
      exit: [
        emp.transactionQueue._custom
      ],
      constructor: [emp.typeLibrary.View]
    };
  };

  intentSequenceMapper[emp.intents.control.LOOKAT_SET] = function() {
    return {
      forward: [
        function(args) {
          var mapInstance = emp.instanceManager.getInstance(args.mapInstanceId);
          if (mapInstance && mapInstance.engine) {
            mapInstance.engine.lookAt.set(args);
          }
        }
      ],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: []
    };
  };

  intentSequenceMapper[emp.intents.control.VIEW_COORDINATESYSTEM] = function() {
    return {
      forward: [],
      exit: [
        emp.intents.control.transactionComplete
      ],
      constructor: [emp.typeLibrary.View]
    };
  };

  intentSequenceMapper[emp.intents.control.GET] = function() {
    return {
      forward: [emp.storage.query],
      exit: [emp.intents.control.transactionComplete],
      constructor: [emp.typeLibrary.Status]
    };
  };
  intentSequenceMapper[emp.intents.control.OVERLAY_STYLE] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engine.overlay.style(args);
          }
        }
      ],
      exit: [emp.intents.control.transactionComplete],
      constructor: [emp.typeLibrary.Overlay]
    };
  };
  intentSequenceMapper[emp.intents.control.MIL_ICON_LABELS_SET] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engine.settings.mil2525.icon.labels.set(args);
          }
        }
      ],
      exit: [emp.transactionQueue._custom]
    };
  };
  intentSequenceMapper[emp.intents.control.MIL_ICON_SIZE_SET] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engine.settings.mil2525.icon.size.set(args);
          }
        }
      ],
      exit: [emp.transactionQueue._custom]
    };
  };
  intentSequenceMapper[emp.intents.control.OVERLAY_CLUSTER_SET] = function() {
    return {
      forward: [
        emp.storage.overlay.validateCluster,
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engine.overlay.cluster.set(args);
          }
        }
      ],
      exit: [emp.intents.control.transactionComplete]
    };
  };
  intentSequenceMapper[emp.intents.control.OVERLAY_CLUSTER_ACTIVATE] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engine.overlay.cluster.activate(args);
          }
        }
      ],
      exit: [emp.intents.control.transactionComplete]
    };
  };
  intentSequenceMapper[emp.intents.control.OVERLAY_CLUSTER_DEACTIVATE] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engine.overlay.cluster.deactivate(args);
          }
        }
      ],
      exit: [emp.intents.control.transactionComplete]
    };
  };
  intentSequenceMapper[emp.intents.control.OVERLAY_CLUSTER_REMOVE] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engine.overlay.cluster.remove(args);
          }
        }
      ],
      exit: [emp.intents.control.transactionComplete]
    };
  };
  intentSequenceMapper[emp.intents.control.PROJECTION_ENABLE_FLAT] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engine.projection.enable.flat(args);
          }
        }
      ],
      exit: [emp.intents.control.transactionComplete]
    };
  };
  intentSequenceMapper[emp.intents.control.STATUS_REQUEST_SCREENSHOT] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance && oMapInstance.engine) {
            oMapInstance.engine.capture.screenshot(args);
          }
        }
      ],
      exit: [emp.transactionQueue._custom]
    };
  };

  intentSequenceMapper[emp.intents.control.CMAPI_GENERIC_FEATURE_REMOVE] = function() {
    return {
      forward: [        
        cmapi.channel.support.genericFeatureRemove
      ],
      exit: [emp.transactionQueue._custom]
    };
  };
  intentSequenceMapper[emp.intents.control.EMP_UI_INSTANCE_INIT] = function() {
    return {
      forward: [],
      exit: [emp.transactionQueue._custom]
    };
  };
  intentSequenceMapper[emp.intents.control.STATIC_CONTENT] = function() {
    return {
      forward: [
        emp.storage.staticContent.add
      ],
      exit: [emp.transactionQueue._custom]
    };
  };
  intentSequenceMapper[emp.intents.control.STATUS_CHANGE] = function() {
    return {
      forward: [
        emp.instanceManager.statusChangeHdlr
      ],
      exit: [emp.transactionQueue._custom]
    };
  };
  intentSequenceMapper[emp.intents.control.MAP_SWAP] = function() {
    return {
      forward: [
        function(args) {
          var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

          if (oMapInstance) {
            if (oMapInstance.engines.isMapSwapInProgress()) {
              args.fail({
                coreId: args.items[0].mapId,
                level: emp.typeLibrary.Error.level.MAJOR,
                message: 'Previous map engine swap execution is still in progress.'
              });
            }
            else {
              oMapInstance.engines.load(args.items[0].engine);
            }
          }
        }
      ],
      exit: [emp.intents.control.transactionComplete]
    };
  };
  intentSequenceMapper[emp.intents.control.POINTER] = function() {
    return {
      forward: [/*
       function(transaction) {

       // check to see if we are in edit mode, if not exit.
       var oMapInstance = emp.instanceManager.getInstance(args.mapInstanceId);
       var pointer = transaction.items[0];

       if (oMapInstance && oMapInstance.editingManager) {
       if (pointer.type === emp.typeLibrary.Pointer.EventType.DRAG) {

       }
       }

       // is it a feature drag event?
       //
       //   if so is it an editing feature?
       //
       //
       }*/
      ],
      exit: [emp.transactionQueue._custom]
    };
  };
  return intentSequenceMapper;
}());

/**
 * Used to retrieve the work flow for specific intent enumeration from emp.intents.control
 * @param {object} args
 * @param {string} args.intent
 */
emp.intents.getSequence = function(args) {
  var response;
  var fnResponse = emp.intents.control.intentSequenceMapper[args.intent];

  if (fnResponse === undefined) {
    // emp.intents.control.DRAW_START:
    // emp.intents.control.DRAW_ENDED:
    // emp.intents.control.EDIT_START:
    // emp.intents.control.STATUS_RESPONSE_ABOUT:
    // emp.intents.control.STATUS_RESPONSE_FORMAT:
    // emp.intents.control.STATUS_RESPONSE_SELECTED:
    // emp.intents.control.STATUS_RESPONSE_INIT:
    // emp.intents.control.STATUS_RESPONSE_COORD_SYSTEM:
    // emp.intents.control.VIEW_COORDINATESYSTEM:
    // emp.intents.control.FEATURE_OUTBOUND_PLOT:
    // emp.intents.control.FEATURE_CLICK
    // emp.intents.control.CLICK
    // emp.intents.control.VIEW_CHANGE
    // emp.intents.control.MAP_ENGINE_SWAP_STARTED
    // emp.intents.control.MAP_ENGINE_SWAP_COMPLETE
    // emp.intents.control.STORAGE_RELOAD_COMPLETE
    // emp.intents.control.STORAGE_OBJECT_ADDED
    // emp.intents.control.STORAGE_OBJECT_REMOVED
    // emp.intents.control.STORAGE_OBJECT_UPDATED
    // emp.intents.control.STORAGE_OBJECT_CHILD_REMOVED
    // emp.intents.control.FREEHAND_LINE_DRAW_START
    // emp.intents.control.FREEHAND_LINE_DRAW_END
    // emp.intents.control.FREEHAND_LINE_DRAW_UPDATE

    response = {
      forward: [],
      exit: [emp.transactionQueue._custom]
    };
  }
  else {
    response = fnResponse(args);
  }

  return response;
};
