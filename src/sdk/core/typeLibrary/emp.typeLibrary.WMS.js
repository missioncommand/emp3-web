var emp = window.emp || {};
emp.typeLibrary = emp.typeLibrary || {};

/**
 * @class
 * @description This class defines a WMS service. A map implementation should never create
 * an instance of this class.
 */
emp.typeLibrary.WMS = function(args) {
  /**
   * @private
   * @description An associative array containing a list of its children.
   */
  this.nodes = {};

  /**
   * @private
   * @description An associative array containing a list of its parents.
   */
  this.parentNodes = {};

  /**
   * @private
   */
  this.globalType = emp.typeLibrary.types.WMS;

  /**
   * @private
   */
  this.disabled = false;

  // If name remains an empty String, it may be overridden with
  // a name form the capabilities file

  /**
   * @field
   * @type {string}
   * @description This field contains a readable name used to identify the service on the layers window.
   */
  this.name = args.name || "";


  /**
   * @field
   * @type {string}
   * @description This field contains the transaction ID the operation came under.
   */
  this.transactionId = args.transactionId;

  /**
   * @field
   * @type {string}
   * @description This field contains the message ID the operation came under.
   */
  this.messageId = args.messageId;

  /**
   * @field
   * @type {object}
   * @description This field contains the service parameters to use for the WMS request.
   */
  this.params = args.params || {};

  // Make sure the deafults are present.
  if (!this.params.hasOwnProperty('transparent')) {
    this.params.transparent = true;
  }
  else if (typeof(this.params.transparent) !== "boolean") {
    if ((typeof(this.params.transparent) === "string") &&
      (this.params.transparent.toUpperCase() === "FALSE")) {
      this.params.transparent = false;
    }
    else {
      this.params.transparent = true;
    }
  }

  if (!this.params.hasOwnProperty('format')) {
    this.params.format = escape("image/png");
  }
  else if (typeof(this.params.format) !== "string") {
    this.params.format = "image/png";
  }

  if (!this.params.hasOwnProperty('version')) {
    this.params.version = "1.3.0";
  }
  else if (typeof(this.params.version) !== "string") {
    this.params.version = "1.3.0";
  }

  /**
   * @field
   * @type {string}
   * @description This field contains the unique identifier of the instance.
   */
  this.id = args.id;

  /**
   * @field
   * @type {string}
   * @description This field contains the unescaped URL of the WMS service.
   */
  this.url = args.url;

  /**
   * @field
   * @type Boolean
   * @description This property indicates if the request for the WMS are issued via the proxy (if true,) or not (if false).
   */
  this.useProxy = emp.util.getBooleanValue(args.useProxy, emp.util.config.getUseProxySetting());

  // OverlayId is optional.  If no overlayId is provided for the WMS service
  // It will be added to root

  /**
   * @field
   * @type {string}
   * @description This optional field contains the unique identifier of the overlay
   * the WMS service is to be created under.
   */
  this.overlayId = emp.helpers.id.get.setId(args.overlayId) || emp.constant.parentIds.MAP_LAYER_PARENT;

  /**
   * @field
   * @type {string[]}
   * @description This field, if present, contains a list of layer the map must
   * request. The list must contain the layer name, not the title. if a default layer list is
   * provided, the WMS service will never display its layers in the layers window. And
   * the WMS service will be treated as one object by the core components.
   */
  this.layers = args.layers || [];

  /**
   * @field
   * @type {string[]}
   * @description This field contains a list of layer that the map must
   * make active (visible).
   */
  this.activeLayers = args.activeLayers || (function(args) {
      var aTemp = [];

      if ((args.layers === undefined) || (args.layers === null)) {
        return aTemp;
      }

      for (var iIndex = 0; iIndex < args.layers.length; iIndex++) {
        aTemp.push(args.layers[iIndex]);
      }

      return aTemp;
    })(this);

  /**
   * @private
   */
  this.layers = args.layers;

  /**
   * @private
   */
  this.layerHierarchy = args.layerHierarchy;

  /**
   * @private
   */
  this.version = this.params.version || "";
  // capabilities will only be provided for wms adds where no default layers are provided

  /**
   * @field
   * @type {string=}
   * @description This field contains the unescaped xml capabilities document.
   * It is made available to map implementation in the event that their WMS implementation requires it.
   */
  this.capabilities = args.capabilities || "";

  /**
   * @private
   */
  this.transparent = this.params.transparent || false;
  // format of the getMap image request

  /**
   * @private
   */
  this.format = this.params.format || "image/png";

  /**
   * @field
   * @type {boolean}
   * @description This field indicates if the WMS as a whole should be made visible (TRUE) or hidden (FALSE).
   * The map implementation must create the WMS service with the indicated visibility.
   */
  this.visible = args.visible;

  /**
   * @field
   * @type boolean
   * @description This field indicates if the feature is to be displayed as visible.
   * The visibile indicator may be different if the parent has been made none visible.
   * visible.
   */
  this.visibilitySetting = args.visibilitySetting || this.visible;

  /**
   * @private
   */
  this.type = "wms";

  /**
   * @private
   */
  this.intent = args.intent || "wms.add";
  // Callback function for succesful cpabilities load

  /**
   * @private
   */
  this.loadSuccess = null;
  // callback function if an error occurs while loading or parsing cpabilities document

  /**
   * @private
   */
  this.loadFail = null;

  /**
   * @private
   */
  this.visibleLayers = args.visibleLayers || [];

  /**
   * @private
   */
  this.source = args.source;

  /**
   * @private
   */
  this.onCapabilitiesLoad = function(args) {
    // This executes in window's scope so we cannot use "this"
    // args.scope represents this WMS instance passed through
    // the chain of WMS loading.
    args.scope.capabilities = args.xmlCapabilities;
    args.scope.layerHierarchy = args.hierarchy;

    args.scope.loadSuccess();
  };

  /**
   * @private
   */
  this.getParentFolderOfLayer = function(layerName) {
    var findFoldersOfLayer = function(sLayerName, oFolder) {
      var oFolderFound;
      var iIndex = emp.helpers.findIndexOf(oFolder.layers, 'name', sLayerName);

      if (iIndex > -1) {
        if (oFolder.hasOwnProperty('title') &&
          (oFolder.title !== null) &&
          (oFolder.title !== ''))
          return oFolder;
        else
          return null;
      }
      for (iIndex = 0; iIndex < oFolder.folders.length; iIndex++) {
        oFolderFound = findFoldersOfLayer(sLayerName, oFolder.folders[iIndex]);

        if (oFolderFound === undefined) {
          // It was not found, continue looking
          continue;
        }
        else if (oFolderFound === null) {
          // It was found but the folder has no title
          // so we use this one if it has a title.

          if (oFolder.hasOwnProperty('title') &&
            (oFolder.title !== null) &&
            (oFolder.title !== ''))
            return oFolder;
          else
            return null;
        }
        else {
          return oFolderFound;
        }
      }

      return undefined;
    };

    var oFolder = findFoldersOfLayer(layerName, this.layerHierarchy);

    // If it was found but no parent folder has a title return undefined.
    if (oFolder === null)
      oFolder = undefined;

    return oFolder;
  };

  /**
   * @private
   */
  this.getParentFolderOfFolder = function(folderTitle) {
    var findParentOfFolder = function(sTitle, oFolder) {
      var oFolderFound;
      var iIndex = emp.helpers.findIndexOf(oFolder.folders, 'title', sTitle);

      if (iIndex > -1) {
        if (oFolder.hasOwnProperty('title') &&
          (oFolder.title !== null) &&
          (oFolder.title !== ''))
          return oFolder;
        else
          return null;
      }
      for (iIndex = 0; iIndex < oFolder.folders.length; iIndex++) {
        oFolderFound = findParentOfFolder(sTitle, oFolder.folders[iIndex]);

        if (oFolderFound === undefined) {
          // It was not found, continue looking
          continue;
        }
        else if (oFolderFound === null) {
          // It was found but the folder has no title
          // so we use this one if it has a title.

          if (oFolder.hasOwnProperty('title') &&
            (oFolder.title !== null) &&
            (oFolder.title !== ''))
            return oFolder;
          else
            return null;
        }
        else {
          return oFolderFound;
        }
      }

      return undefined;
    };

    var oFolder = findParentOfFolder(folderTitle, this.layerHierarchy);

    // If it was found but no parent folder has a title return undefined.
    if (oFolder === null)
      oFolder = undefined;

    return oFolder;
  };

  /**
   * @private
   */
  this.onCapabilitiesFail = function(args) {
    // This executes in window's scope so we cannot use "this"
    // args.scope represents this WMS instance passed through
    // the chain of WMS loading.

    args.scope.loadFail(args);
  };

  /**
   * @description Create a parent overlay for a WMS if it doesn't exist
   */
  this.createParent = function() {
    var transaction,
      payload;

    payload = {
      name: "[Unnamed Overlay(CORE)]",
      overlayId: this.overlayId,
      parentId: ""
    };

    transaction = new emp.typeLibrary.Transaction({
      length: 1,
      intent: emp.intents.control.OVERLAY_ADD,
      transactionId: this.transactionId + ".parent",
      originChannel: "map.overlay.create",
      sender: this.sender,
      transactionType: "overlay",
      type: "transaction",
      items: function() {
        var r = [];
        r.push(new emp.typeLibrary.Overlay(payload));
        return r;
      }
    });
    transaction.run();
  };

  /**
   * @field
   * @type {string}
   * @description This field contains the primary key of the instance.
   */
  this.coreId = (function(args) {
    if ((args.coreId !== undefined) && (args.coreId !== null)) {
      return args.coreId;
    }

    return args.id;
  })(args);


  /**
   * @field
   * @type {string}
   * @description This field contains the primary key of the parent object.
   */
  this.coreParent = args.coreParent || (function(args) {
      if (emp.helpers.id.get.isId(args.overlayId)) {
        return args.overlayId;
      }
      else if (emp.hasOwnProperty('storage')) {
        return emp.storage.getRootGuid();
      }

      return undefined;
    })(this);

  this.parentCoreId = args.parentCoreId || this.coreParent;

  /**
   * @private
   */
  this.locate = function(args) {
    var transaction,
      payload;
    args = args || {};
    args.component = args.component || "";

    if (args.bounds) {
      payload = {
        channel: "map.view.center.bounds",
        bounds: args.bounds,
        zoom: true,
        visible: true
      };
    }
    else {
      payload = {
        channel: "map.view.center.bounds",
        featureId: this.id,
        overlayId: this.overlayId,
        zoom: true,
        visible: true
      };
    }
    transaction = new emp.typeLibrary.Transaction({
      intent: "view.set",
      transactionId: emp.helpers.id.newGUID(),
      sender: "core",
      originChannel: "map.view.center.bounds",
      originSchema: "map.view.center.bounds",
      transactionType: "view",
      items: function() {
        var r = [];
        r.push(new emp.typeLibrary.View(payload));
        return r;
      }
    });
    if (args.component === "de") {
      transaction.run();
    }
    else {
      return transaction;
    }
  };


  /**
   * @private
   */
  this.visibility = function(oTransaction, sParentCoreId, bVisibility) {
    var //transaction,
      oItem;

    this.visible = bVisibility;
    this.visibilitySetting = bVisibility;
    oItem = this.createDuplicate();

    oTransaction.items.push(oItem);
  };

  /**
   *
   * @returns {Array}
   */
  this.getAllLayer = function() {
    var oaLayers = [];

    var getLayers = function(oLayerList) {
      var oaLayerList = [];

      for (var iIndex = 0; iIndex < oLayerList.length; iIndex++) {
        oaLayerList.push(oLayerList[iIndex].name);
      }

      return oaLayerList;
    };

    var getLayersFromFolders = function(oFolders) {
      var oaLayerList = [];

      for (var iIndex = 0; iIndex < oFolders.length; iIndex++) {
        oaLayerList = oaLayerList.concat(getLayersFromFolders(oFolders[iIndex].folders));
        oaLayerList = oaLayerList.concat(getLayers(oFolders[iIndex].layers));
      }

      return oaLayerList;
    };
    var oaTemp = getLayersFromFolders(this.layerHierarchy.folders);
    oaLayers = oaLayers.concat(oaTemp);
    oaTemp = getLayers(this.layerHierarchy.layers);
    oaLayers = oaLayers.concat(oaTemp);

    return oaLayers;
  };

  /**
   *
   */
  this.getAllNamedFolders = function() {

    var getNamedFolders = function(oFolders) {
      var oaFolderList = [];

      for (var iIndex = 0; iIndex < oFolders.length; iIndex++) {
        if ((oFolders[iIndex].layers.length > 0) ||
          (oFolders[iIndex].folders.length > 0)) {
          if (oFolders[iIndex].title) {
            oaFolderList.push(oFolders[iIndex].title);
          }
          oaFolderList = oaFolderList.concat(getNamedFolders(oFolders[iIndex].folders));
        }
      }

      return oaFolderList;
    };

    return getNamedFolders(this.layerHierarchy.folders);
  };

  /**
   * @private
   */
  this.oaFoldersSelected = [];
  /**
   * @private
   */
  this.oaLayersSelected = [];

  /**
   *
   * @param sFolderName
   */
  this.selectFolder = function(sFolderName) {
    if (this.oaFoldersSelected.indexOf(sFolderName) === -1) {
      this.oaFoldersSelected.push(sFolderName);
    }
  };

  /**
   *
   * @param sFolderName
   * @returns {boolean}
   */
  this.isFolderSelected = function(sFolderName) {
    return (this.oaFoldersSelected.indexOf(sFolderName) !== -1);
  };

  /**
   *
   * @param sFolderName
   */
  this.unselectFolder = function(sFolderName) {
    var iIndex = this.oaFoldersSelected.indexOf(sFolderName);
    if (iIndex !== -1) {
      this.oaFoldersSelected.splice(iIndex, 1);
    }
  };

  /**
   *
   */
  this.selectAllFolders = function() {
    this.oaFoldersSelected = this.getAllNamedFolders();
  };

  /**
   *
   */
  this.unselectAllFolders = function() {
    if (this.oaFoldersSelected.length > 0) {
      this.oaFoldersSelected.splice(0, this.oaFoldersSelected.length);
    }
  };

  /**
   *
   * @param sLayerName
   */
  this.selectLayer = function(sLayerName) {
    if (this.oaLayersSelected.indexOf(sLayerName) === -1) {
      this.oaLayersSelected.push(sLayerName);
    }
  };

  /**
   *
   * @param sLayerName
   * @returns {boolean}
   */
  this.isLayerSelected = function(sLayerName) {
    return (this.oaLayersSelected.indexOf(sLayerName) !== -1);
  };

  /**
   *
   * @param sLayerName
   */
  this.unselectLayer = function(sLayerName) {
    var iIndex = this.oaLayersSelected.indexOf(sLayerName);
    if (iIndex !== -1) {
      this.oaLayersSelected.splice(iIndex, 1);
    }
  };

  /**
   *
   */
  this.selectAllLayers = function() {
    this.oaLayersSelected = this.getAllLayer();
    this.activeLayers = this.oaLayersSelected;
  };

  /**
   *
   */
  this.unselectAllLayers = function() {
    if (this.oaLayersSelected.length > 0) {
      this.oaLayersSelected.splice(0, this.oaLayersSelected.length);
    }
  };

  /**
   *
   * @returns {{id: *, overlayId: *, name: *, url: *, format: *}}
   */
  this.getObjectData = function() {
    var oObj = {
      id: this.id,
      overlayId: this.overlayId,
      name: this.name,
      url: this.url,
      format: this.format
    };
    oObj.params = emp.helpers.copyObject(this.params);

    if (this.layers.length > 0) {
      oObj.params.layers = this.layers.toString();
    }
    return oObj;
  };

  /**
   *
   * @returns {emp.typeLibrary.WMS}
   */
  this.createDuplicate = function() {
    var oNewWMS;
    var oNodes = this.nodes;
    var oParentNodes = this.parentNodes;
    var oChildNodes = this.childNodes;

    this.nodes = {};
    this.parentNodes = {};
    this.childNodes = {};

    var stringFeature = JSON.stringify(this);
    var objectFeature = JSON.parse(stringFeature);

    this.nodes = oNodes;
    this.parentNodes = oParentNodes;
    this.childNodes = oChildNodes;

    oNewWMS = new emp.typeLibrary.WMS(objectFeature);
    oNewWMS.activeLayers = [];
    for (var iIndex = 0; iIndex < this.activeLayers.length; iIndex++) {
      oNewWMS.activeLayers.push(this.activeLayers[iIndex]);
    }
    return oNewWMS;
  };

  /**
   *
   */
  this.prepForExecution = function() {
    // We dont need to do anything.
  };

  /**
   * @private
   */
  this.schema = {
    "title": "EMP-WMS Schema",
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "name": {
        "type": ["string", "null"]
      },
      "overlayId": {
        "type": "string"
      },
      "url": {
        "type": "string"
      },
      "params": {
        "type": "object"
      },
      "visible": {
        "type": "boolean"
      },
      "disable": {
        "type": "boolean"
      }
    },
    "required": ["id", "url"]
  };
};

emp.typeLibrary.WMS.prototype.validate = emp.typeLibrary.base.validate;
/*
 emp.typeLibrary.WMS.prototype.hasChildren = emp.typeLibrary.base.hasChildren;
 emp.typeLibrary.WMS.prototype.hasParents = emp.typeLibrary.base.hasParents;
 emp.typeLibrary.WMS.prototype.removeChild = emp.typeLibrary.base.removeChild;
 emp.typeLibrary.WMS.prototype.addParent = emp.typeLibrary.base.addParent;
 emp.typeLibrary.WMS.prototype.addChild = emp.typeLibrary.base.addChild;
 emp.typeLibrary.WMS.prototype.getChildrenCoreIds = emp.typeLibrary.base.getChildrenCoreIds;
 emp.typeLibrary.WMS.prototype.getParentCoreIds = emp.typeLibrary.base.getParentCoreIds;
 emp.typeLibrary.WMS.prototype.childrenCount = emp.typeLibrary.base.childrenCount;
 emp.typeLibrary.WMS.prototype.parentCount = emp.typeLibrary.base.parentCount;
 emp.typeLibrary.WMS.prototype.getChild = emp.typeLibrary.base.getChild;
 emp.typeLibrary.WMS.prototype.getParent = emp.typeLibrary.base.getParent;
 emp.typeLibrary.WMS.prototype.isMultiParentRequired = emp.typeLibrary.base.isMultiParentRequired;
 emp.typeLibrary.WMS.prototype.hasChildNodes = emp.typeLibrary.base.hasChildNodes;
 emp.typeLibrary.WMS.prototype.getChildNodesCoreIds = emp.typeLibrary.base.getChildNodesCoreIds;
 emp.typeLibrary.WMS.prototype.removeFromAllParent = emp.typeLibrary.base.removeFromAllParent;
 emp.typeLibrary.WMS.prototype.getVisibilityWithParent = emp.typeLibrary.base.getVisibilityWithParent;
 emp.typeLibrary.WMS.prototype.setVisibilityWithParent = emp.typeLibrary.base.setVisibilityWithParent;
 emp.typeLibrary.WMS.prototype.getRootParent = emp.typeLibrary.base.getRootParent;
 emp.typeLibrary.WMS.prototype.getVisibilityCount = emp.typeLibrary.base.getVisibilityCount;
 emp.typeLibrary.WMS.prototype.getRootCoreId = emp.typeLibrary.base.getRootCoreId;
 emp.typeLibrary.WMS.prototype.addAffectedChildren = emp.typeLibrary.base.addAffectedChildren;
 emp.typeLibrary.WMS.prototype.isVisible = emp.typeLibrary.base.isVisible;
 emp.typeLibrary.WMS.prototype.isUnderParent = emp.typeLibrary.base.isUnderParent;
 emp.typeLibrary.WMS.prototype.addToOverlayFeatureList = emp.typeLibrary.base.addToOverlayFeatureList;
 emp.typeLibrary.WMS.prototype.removeFromOverlayFeatureList = emp.typeLibrary.base.removeFromOverlayFeatureList;
 emp.typeLibrary.WMS.prototype.removeAllChildrenFromOverlayFeatureList = emp.typeLibrary.base.removeAllChildrenFromOverlayFeatureList;
 emp.typeLibrary.WMS.prototype.addAllChildrenToOverlayFeatureList = emp.typeLibrary.base.addAllChildrenToOverlayFeatureList;
 emp.typeLibrary.WMS.prototype.isVisibilityAffected = emp.typeLibrary.base.isVisibilityAffected;
 emp.typeLibrary.WMS.prototype.getVisibilitySettingWithParent = emp.typeLibrary.base.getVisibilitySettingWithParent;
 */
