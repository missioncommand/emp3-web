emp.classLibrary.privateClass = function () {
  var publicInterface = {
    /**
     * @memberof emp.classLibrary.EmpWMS#
     * @param {object} args
     */
    initialize: function (args) {
      /**
       * @memberof emp.classLibrary.EmpWMS#
       */
      var options = {
        id: args.id,
        url: args.url,
        useProxy: args.useProxy,
        transparent: true,
        format: "image/png",
        version: "1.3.0",
        layers: args.layers || [],
        activeLayers: {},
        layerHierarchy: args.layerHierarchy,
        /**
         * @field
         * @type {string}
         * @description This field contains the unescaped xml capabilities document.
         * It is made available to map implementation in the event that their WMS implementation requires it.
         */
        capabilities: args.capabilities || "",
        visibleLayers: args.visibleLayers || [],
        source: args.source,
        oaFoldersSelected: {},
        oaLayersSelected: {}
      };
      if (args.hasOwnProperty('params')) {
        if (args.params.hasOwnProperty('transparent')) {
          if (typeof (args.params.transparent) === "boolean") {
            options.transparent = args.params.transparent;
          }
          else if (typeof (args.params.transparent) === "string") {
            options.transparent = (this.params.transparent.toUpperCase() !== "FALSE");
          }
        }

        if (args.params.hasOwnProperty('format')
          && (typeof (args.params.format) === "string")) {
          options.format = args.params.format;
        }

        if (args.params.hasOwnProperty('version')
          && (typeof (args.params.version) === "string")) {
          options.version = args.params.version;
        }
      }

      emp.classLibrary.Util.setOptions(this, options);

      if (emp.helpers.isEmptyString(args.name)) {
        args.name = 'WMS: ' + args.url;
      }

      args.coreObjectType = emp.typeLibrary.types.WMS;
      emp.classLibrary.EmpRenderableObject.prototype.initialize.call(this, args);
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    destroy: function () {
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    getId: function () {
      return this.options.id;
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    getVersion: function () {
      return this.options.version;
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    setVisibleOnMap: function (mapInstanceId, bVisible) {
      var iIndex;
      var parentFolder;
      var visibleLayerList;
      var bNewMapInstance = false;

      emp.classLibrary.EmpRenderableObject.prototype.setVisibleOnMap.call(this, mapInstanceId, bVisible);

      if (!this.options.activeLayers.hasOwnProperty(mapInstanceId)) {
        this.options.activeLayers[mapInstanceId] = [];
        bNewMapInstance = true;
      }
      if (!this.options.oaFoldersSelected.hasOwnProperty(mapInstanceId)) {
        this.options.oaFoldersSelected[mapInstanceId] = [];
      }
      if (!this.options.oaLayersSelected.hasOwnProperty(mapInstanceId)) {
        this.options.oaLayersSelected[mapInstanceId] = [];
      }

      if (bNewMapInstance && bVisible) {
        if (this.options.layers.length > 0) {
          this.setActiveLayers(mapInstanceId, this.getLayers());
        }
        else if (this.options.visibleLayers.length > 0) {
          visibleLayerList = this.options.visibleLayers;

          this.clearActiveLayers(mapInstanceId);
          for (iIndex = 0; iIndex < visibleLayerList.length; iIndex++) {
            this.add2ActiveLayers(mapInstanceId, visibleLayerList[iIndex]);
            this.selectLayer(mapInstanceId, visibleLayerList[iIndex]);
            parentFolder = this.getParentFolderOfLayer(visibleLayerList[iIndex]);

            while (parentFolder !== undefined) {
              this.selectFolder(mapInstanceId, parentFolder.title);
              parentFolder = this.getParentFolderOfFolder(parentFolder.title);
            }
          }
        }
        else if (this.options.source === emp.core.sources.CONFIG) {
          // The WMS came from the config mgr and it has no visible layers set.
          // So we don't make any of them visible.
        }
        else {
          // Only do this if the visibleLayers list is empty.
          //this.setActiveLayers(mapInstanceId, this.getAllLayer());
          //this.options.oaLayersSelected[mapInstanceId] = this.options.activeLayers[mapInstanceId].slice(0);
          //this.options.oaFoldersSelected[mapInstanceId] = this.getAllNamedFolders();
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    removeFromMap: function (mapInstanceId) {
      if (this.options.activeLayers.hasOwnProperty(mapInstanceId)) {
        delete this.options.activeLayers[mapInstanceId];
      }
      if (this.options.oaFoldersSelected.hasOwnProperty(mapInstanceId)) {
        delete this.options.oaFoldersSelected[mapInstanceId];
      }
      if (this.options.oaLayersSelected.hasOwnProperty(mapInstanceId)) {
        delete this.options.oaLayersSelected[mapInstanceId];
      }

      emp.classLibrary.EmpRenderableObject.prototype.removeFromMap.call(this, mapInstanceId);
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    hasVisibleLayers: function () {
      return (this.options.visibleLayers.length > 0);
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    getVisibleLayers: function () {
      return this.options.visibleLayers;
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    hasLayers: function () {
      return (this.options.layers.length > 0);
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    getLayers: function () {
      return this.options.layers;
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    getActiveLayers: function (mapInstanceId) {
      return this.options.activeLayers[mapInstanceId];
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    add2ActiveLayers: function (mapInstanceId, sLayer) {
      if (this.options.activeLayers.hasOwnProperty(mapInstanceId)) {
        this.options.activeLayers[mapInstanceId].push(sLayer);
      }
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    setActiveLayers: function (mapInstanceId, oaLayers) {
      var iIndex;

      this.clearActiveLayers(mapInstanceId);
      for (iIndex = 0; iIndex < oaLayers.length; iIndex++) {
        this.add2ActiveLayers(mapInstanceId, oaLayers[iIndex]);
      }
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    clearActiveLayers: function (mapInstanceId) {
      if ((this.options.activeLayers[mapInstanceId] instanceof Array)
        && (this.options.activeLayers[mapInstanceId].length > 0)) {
        this.options.activeLayers[mapInstanceId].splice(0, this.options.activeLayers[mapInstanceId].length);
      }
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    getLayerHierarchy: function () {
      return this.options.layerHierarchy;
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    getParentFolderOfLayer: function (layerName) {
      var findFoldersOfLayer = function (sLayerName, oFolder) {
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

      var oFolder = findFoldersOfLayer(layerName, this.options.layerHierarchy);

      // If it was found but no parent folder has a title return undefined.
      if (oFolder === null) {
        oFolder = undefined;
      }

      return oFolder;
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    getParentFolderOfFolder: function (folderTitle) {
      var findParentOfFolder = function (sTitle, oFolder) {
        var oFolderFound;
        var iIndex = emp.helpers.findIndexOf(oFolder.folders, 'title', sTitle);

        if (iIndex > -1) {
          if (oFolder.hasOwnProperty('title') &&
            (oFolder.title !== null) &&
            (oFolder.title !== '')) {
            return oFolder;
          } else {
            return null;
          }
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
              (oFolder.title !== '')) {
              return oFolder;
            } else {
              return null;
            }
          }
          else {
            return oFolderFound;
          }
        }

        return undefined;
      };

      var oFolder = findParentOfFolder(folderTitle, this.options.layerHierarchy);

      // If it was found but no parent folder has a title return undefined.
      if (oFolder === null) {
        oFolder = undefined;
      }

      return oFolder;
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    locate: function (args) {
      var transaction,
        payload;
      args = args || {};

      args.component = args.component || "";

      if (args.bounds) {
        payload = {
          bounds: args.bounds,
          zoom: true,
          visible: true
        };
      }
      else {
        payload = {
          featureId: this.id,
          overlayId: this.overlayId,
          zoom: true,
          visible: true
        };
      }
      transaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.VIEW_SET,
        mapInstanceId: args.mapInstanceId,
        items: [new emp.typeLibrary.View(payload)]
      });
      if (args.component === "de") {
        transaction.run();
      } else {
        return transaction;
      }
    },
    /*
     visibility: function (oTransaction, sParentCoreId, bVisibility) {
     var oItem,
     mapInstanceId = oTransaction.mapInstanceId;

     this.visible = bVisibility;
     this.visibilitySetting = bVisibility;
     oItem = this.createDuplicate();

     oTransaction.items.push(oItem);
     },
     */
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    getAllLayer: function () {
      var oaLayers = [];

      var getLayers = function (oLayerList) {
        var oaLayerList = [];

        for (var iIndex = 0; iIndex < oLayerList.length; iIndex++) {
          oaLayerList.push(oLayerList[iIndex].name);
        }

        return oaLayerList;
      };

      var getLayersFromFolders = function (oFolders) {
        var oaLayerList = [];

        for (var iIndex = 0; iIndex < oFolders.length; iIndex++) {
          oaLayerList = oaLayerList.concat(getLayersFromFolders(oFolders[iIndex].folders));
          oaLayerList = oaLayerList.concat(getLayers(oFolders[iIndex].layers));
        }

        return oaLayerList;
      };
      var oaTemp = getLayersFromFolders(this.options.layerHierarchy.folders);
      oaLayers = oaLayers.concat(oaTemp);
      oaTemp = getLayers(this.options.layerHierarchy.layers);
      oaLayers = oaLayers.concat(oaTemp);

      return oaLayers;
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    getAllNamedFolders: function () {
      var getNamedFolders = function (oFolders) {
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

      return getNamedFolders(this.options.layerHierarchy.folders);
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    selectFolder: function (mapInstanceId, sFolderName) {
      if (this.options.oaFoldersSelected.hasOwnProperty(mapInstanceId)) {
        if (this.options.oaFoldersSelected[mapInstanceId].indexOf(sFolderName) === -1) {
          this.options.oaFoldersSelected[mapInstanceId].push(sFolderName);
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    isFolderSelected: function (mapInstanceId, sFolderName) {
      if (this.options.oaFoldersSelected.hasOwnProperty(mapInstanceId)) {
        return (this.options.oaFoldersSelected[mapInstanceId].indexOf(sFolderName) !== -1);
      }
      return false;
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    unselectFolder: function (mapInstanceId, sFolderName) {
      if (this.options.oaFoldersSelected.hasOwnProperty(mapInstanceId)) {
        var iIndex = this.options.oaFoldersSelected[mapInstanceId].indexOf(sFolderName);
        if (iIndex !== -1) {
          this.options.oaFoldersSelected[mapInstanceId].splice(iIndex, 1);
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    selectAllFolders: function (mapInstanceId) {
      this.options.oaFoldersSelected[mapInstanceId] = this.getAllNamedFolders();
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    unselectAllFolders: function (mapInstanceId) {
      if (this.options.oaFoldersSelected.hasOwnProperty(mapInstanceId)) {
        if (this.options.oaFoldersSelected[mapInstanceId].length > 0) {
          this.options.oaFoldersSelected[mapInstanceId].splice(0, this.oaFoldersSelected[mapInstanceId].length);
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    selectLayer: function (mapInstanceId, sLayerName) {
      if (this.options.oaLayersSelected.hasOwnProperty(mapInstanceId)) {
        if (this.options.oaLayersSelected[mapInstanceId].indexOf(sLayerName) === -1) {
          this.options.oaLayersSelected[mapInstanceId].push(sLayerName);
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    isLayerSelected: function (mapInstanceId, sLayerName) {
      if (this.options.oaLayersSelected.hasOwnProperty(mapInstanceId)) {
        return (this.options.oaLayersSelected[mapInstanceId].indexOf(sLayerName) !== -1);
      }
      return false;
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    unselectLayer: function (mapInstanceId, sLayerName) {
      if (this.options.oaLayersSelected.hasOwnProperty(mapInstanceId)) {
        var iIndex = this.options.oaLayersSelected[mapInstanceId].indexOf(sLayerName);
        if (iIndex !== -1) {
          this.options.oaLayersSelected[mapInstanceId].splice(iIndex, 1);
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    selectAllLayers: function (mapInstanceId) {
      this.options.oaLayersSelected[mapInstanceId] = this.getAllLayer();
      this.clearActiveLayers(mapInstanceId);
      this.options.activeLayers[mapInstanceId] = emp.helpers.copyObject(this.options.oaLayersSelected[mapInstanceId]);
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    unselectAllLayers: function (mapInstanceId) {
      if (this.options.oaLayersSelected.hasOwnProperty(mapInstanceId)) {
        if (this.options.oaLayersSelected[mapInstanceId].length > 0) {
          this.options.oaLayersSelected[mapInstanceId].splice(0, this.options.oaLayersSelected[mapInstanceId].length);
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    getObjectData: function (mapInstanceId, coreParentId) {
      var oParent = this.getParentByIndex(0);

      var oObj = {
        coreId: this.getCoreId(),
        coreParent: coreParentId,
        parentCoreId: emp.storage.getRootGuid(mapInstanceId),
        id: this.options.id,
        overlayId: (oParent ? oParent.getOverlayId() : undefined),
        name: this.options.name,
        url: this.options.url,
        useProxy: this.options.useProxy,
        params: {
          transparent: this.options.transparent,
          format: this.options.format,
          version: this.options.version
        },
        activeLayers: emp.helpers.copyObject(this.options.activeLayers[mapInstanceId]),
        capabilities: emp.helpers.copyObject(this.options.capabilities),
        visible: this.isVisibleOnMap(mapInstanceId)
      };

      if (this.options.layers.length > 0) {
        oObj.layers = emp.helpers.copyObject(this.options.layers);
      }
      return new emp.typeLibrary.WMS(oObj);
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    update: function (args) {
      if (args.hasOwnProperty('params')) {
        if (args.params.hasOwnProperty('transparent')) {
          if (typeof (args.params.transparent) === "boolean") {
            this.options.transparent = args.params.transparent;
          }
          else if (typeof (args.params.transparent) === "string") {
            this.options.transparent = (this.params.transparent.toUpperCase() !== "FALSE");
          }
        }

        if (args.params.hasOwnProperty('format')
          && (typeof (args.params.format) === "string")) {
          this.options.format = args.params.format;
        }

        if (args.params.hasOwnProperty('version')
          && (typeof (args.params.version) === "string")) {
          this.options.version = args.params.version;
        }
      }

      if (args.hasOwnProperty('url')) {
        this.options.url = args.url;
      }

      if (args.hasOwnProperty('name')) {
        this.setName(args.name);
      }

      if (emp.helpers.isEmptyString(this.getName())) {
        this.setName('WMS: ' + this.options.url);
      }

      if ((args.layers !== undefined) && (args.layers !== null)) {
        this.options.layers = emp.helpers.copyObject(args.layers);
        this.options.activeLayers = emp.helpers.copyObject(args.layers);
      }
      else if (args.hasOwnProperty('activeLayers')) {
        this.options.activeLayers = emp.helpers.copyObject(args.activeLayers);
      }
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    compareProperty: function (mapInstanceId, sProperty, Value) {
      var bRet = false;

      if (!emp.util.isEmptyString(sProperty)) {
        switch (sProperty.toLowerCase()) {
          case 'name':
          case 'description':
          case 'readonly':
          case 'visible':
            bRet = emp.classLibrary.EmpRenderableObject.prototype.compareProperty.call(this, mapInstanceId, sProperty, Value);
            break;
          case 'featureid':
            bRet = this.compareValues(this.getId(), Value);
            break;
          case 'format':
            bRet = this.compareValues(this.options.format, Value);
            break;
          case 'transparent':
            bRet = this.compareValues(this.options.transparent, Value);
            break;
          case 'version':
            bRet = this.compareValues(this.options.version, Value);
            break;
          case 'url':
            bRet = this.compareValues(this.options.url, Value);
            break;
        }
      }
      return bRet;
    },
    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    canMapEnginePlot: function (mapInstanceId) {
      return emp.helpers.canMapEnginePlotFeature(mapInstanceId, this);
    }
  };

  return publicInterface;
};

/**
 * @constructor
 * @extends emp.classLibrary.EmpRenderableObject
 */
emp.classLibrary.EmpWMS = emp.classLibrary.EmpRenderableObject.extend(emp.classLibrary.privateClass());
