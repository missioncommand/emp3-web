/* globals emp */

/**
 * Storage Mechanisms for Core
 * @namespace
 * @memberof emp
 */
emp.storage = (function () {
  /** Hash of instantiated map */
  var instances;

  var removeMapInstanceFromStorage = function (oInstanceData) {
    var oRootStorageEntry = emp.storage._storage.store[oInstanceData.rootGUID];

    if (oRootStorageEntry) {
      emp.storage.removeParentFromChildren(oRootStorageEntry);
      emp.storage.deleteObject(oRootStorageEntry);
    }
  };

  var publicInterface = {
    /**
     * @memberof emp.storage
     * @name emp.storage
     */
    init: function () {
      instances = {};
    },
    /**
     * Where everything is actually stored
     * @memberOf emp.storage
     * @protected
     * @type {Object}
     */
    _storage: {
      /**
       * THE place where everything is stored
       * @type {Object}
       * @memberof emp.storage._storage
       */
      store: {},
      /**
       * Used to directly retrieve stuff from storage
       * @method
       * @param  {object} args
       * @param  {string} args.coreId
       * @return {emp.classLibrary.EmpRenderableObject}
       */
      get: function (args) {
        if (args.coreId) {
          return this.store[args.coreId];
        }

        return undefined;
      },
      /**
       * Used to put stuff directly in the engine
       * @protected
       * @param {emp.classLibrary.EmpRenderableObject} empObject
       */
      set: function (empObject) {
        if (empObject.getCoreId()) {
          this.store[empObject.getCoreId()] = empObject;
        }
      }
    },
    /**
     * @memberof emp.storage
     */
    getRootGuid: function (instanceId) {
      if (instances.hasOwnProperty(instanceId)) {
        return instances[instanceId].rootGUID;
      }
      return undefined;
    },
    /**
     * Returns whether the given string is the root overlay for any of the instantiated maps
     * False if not found
     * @param {string} coreId
     * @memberof emp.storage
     * @returns {boolean | object}
     */
    isRoot: function (coreId) {
      for (var instance in instances) {
        if (instances.hasOwnProperty(instance)) {
           if (instances[instance].rootGUID === coreId) {
            return instance;
          }
        }
      }

      return false;
    },
    /**
     * Adds a new map instance to the instances hash and constructs a new root {@link emp.classLibrary.EmpOverlay}
     * to the {@link emp.storage._storage.store}
     *
     * This method will also add the new listeners for {@link emp.transactionQueue}
     *
     * @memberof emp.storage
     *
     * @param {object} args
     * @param {string} args.mapInstanceId
     */
    newMapInstance: function (args) {
      var oRootOverlay = new emp.typeLibrary.Overlay({
        name: "Root Overlay for Map " + args.mapInstanceId,
        overlayId: args.mapInstanceId
      });

      oRootOverlay = new emp.classLibrary.EmpOverlay(oRootOverlay);
      oRootOverlay.setVisibleOnMap(args.mapInstanceId, true);

      if (instances.hasOwnProperty(args.mapInstanceId)) {
        new emp.typeLibrary.Error({
          level: emp.typeLibrary.Error.level.MAJOR,
          message: "Storage map instance exists. (" + args.mapInstanceId + ")"
        });
        return;
      }

      var oInstanceData = {
        mapInstanceId: args.mapInstanceId,
        rootGUID: oRootOverlay.getCoreId()
      };

      instances[args.mapInstanceId] = oInstanceData;
      emp.storage._storage.store[oRootOverlay.getCoreId()] = oRootOverlay;

      emp.transactionQueue.listener.add({
        type: emp.intents.control.EDIT_UPDATE,
        mapInstanceId: args.mapInstanceId,
        callback: emp.storage.feature.editUpdate
      });

      emp.transactionQueue.listener.add({
        type: emp.intents.control.OVERLAY_CLUSTER_SET,
        mapInstanceId: args.mapInstanceId,
        callback: emp.storage.overlay.clusterSet
      });

      emp.transactionQueue.listener.add({
        type: emp.intents.control.OVERLAY_CLUSTER_ACTIVATE,
        mapInstanceId: args.mapInstanceId,
        callback: emp.storage.overlay.clusterActivate
      });

      emp.transactionQueue.listener.add({
        type: emp.intents.control.OVERLAY_CLUSTER_DEACTIVATE,
        mapInstanceId: args.mapInstanceId,
        callback: emp.storage.overlay.clusterDeactivate
      });

      emp.transactionQueue.listener.add({
        type: emp.intents.control.OVERLAY_CLUSTER_REMOVE,
        mapInstanceId: args.mapInstanceId,
        callback: emp.storage.overlay.clusterRemove
      });
    },
    /**
     * @memberof emp.storage
     */
    removeMapInstance: function (args) {
      var oInstanceData;

      if (!instances.hasOwnProperty(args.mapInstanceId)) {
        return;
      }

      oInstanceData = instances[args.mapInstanceId];

      removeMapInstanceFromStorage(oInstanceData);

      emp.transactionQueue.listener.remove({
        type: emp.intents.control.EDIT_UPDATE,
        mapInstanceId: args.mapInstanceId,
        callback: emp.storage.feature.editUpdate
      });

      emp.transactionQueue.listener.remove({
        type: emp.intents.control.OVERLAY_CLUSTER_SET,
        mapInstanceId: args.mapInstanceId,
        callback: emp.storage.overlay.clusterSet
      });

      emp.transactionQueue.listener.remove({
        type: emp.intents.control.OVERLAY_CLUSTER_ACTIVATE,
        mapInstanceId: args.mapInstanceId,
        callback: emp.storage.overlay.clusterActivate
      });

      emp.transactionQueue.listener.remove({
        type: emp.intents.control.OVERLAY_CLUSTER_DEACTIVATE,
        mapInstanceId: args.mapInstanceId,
        callback: emp.storage.overlay.clusterDeactivate
      });

      emp.transactionQueue.listener.remove({
        type: emp.intents.control.OVERLAY_CLUSTER_REMOVE,
        mapInstanceId: args.mapInstanceId,
        callback: emp.storage.overlay.clusterRemove
      });

      emp.contextMenuStorageManager.removeMapInstance(args.mapInstanceId);
      delete instances[args.mapInstanceId];
      emp.storage.selection.removeSelectedList(args.mapInstanceId);
    },
    /**
     * @memberof emp.storage
     */
    readOnlyPermission: function (mapInstanceId, oStorageItem) {
      var mapRootGUID = this.getRootGuid(mapInstanceId);

      var recurseUp = function (oStorageItem, bContinueRecursion) {
        var oParent;
        var sCoreId;
        var oParentList = oStorageItem.getParentRelationshipList();

        if (oStorageItem.getCoreId() !== mapRootGUID) {
          for (sCoreId in oParentList) {
            if (!oParentList.hasOwnProperty(sCoreId)) {
              continue;
            }
            oParent = oParentList[sCoreId].getParent();

            if (!oParent.isReadOnly()) {
              return false;
            }
            else if (oParent.hasParents() && bContinueRecursion) {
              return recurseUp(oParent, false);
            }
          }
        }

        return false;
      };

      switch (oStorageItem.getCoreObjectType()) {
        case emp.typeLibrary.types.OVERLAY:
          // For overlays we don't look at it self.
          // Its only readOnly if its parent is readOnly.
          if (oStorageItem.hasParents()) {
            return recurseUp(oStorageItem, false);
          }
          break;
        case emp.typeLibrary.types.FEATURE:
          if (oStorageItem.hasParents()) {
            return recurseUp(oStorageItem, false);
          }
          break;
      }
      return false;
    }
  };

  return publicInterface;
}());
