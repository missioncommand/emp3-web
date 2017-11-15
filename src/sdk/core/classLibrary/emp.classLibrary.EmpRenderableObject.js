emp.classLibrary.privateClass = function () {
  var publicInterface = {
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @param {object} args
     */
    initialize: function (args) {
      /**
       * @memberof emp.classLibrary.EmpRenderableObject#
       */
      var options = {
        name: args.name,
        description: args.description,
        disabled: (args.disabled === true) || false,
        /**
         * visibleOnMap contains an associative array keyed by map instance id.
         * Each value is a boolean value indicating if the object is visible (= true)
         * or not visible ( = false) on the specific map instance.
         */
        visibleOnMap: {},
        /**
         * parentObjects contains an associative array keyed by core id of this
         * objects parents.
         * Each value is an emp.classLibrary.ObjectRelationship object that defines the
         * relationship with this object.
         */
        parentObjects: {},
        /**
         * childObjects contains an associative array keyed by core id of this objects children.
         * Each value is a ref to the child object as it exists in storage.
         */
        childObjects: {},
        properties: (args.properties ? emp.helpers.copyObject(args.properties) : {})
      };
      emp.classLibrary.Util.setOptions(this, options);

      if (this.options.properties.hasOwnProperty('readOnly')) {
        this.options.properties.readOnly = (this.options.properties.readOnly === true);
      }
      else {
        this.options.properties.readOnly = false;
      }

      emp.classLibrary.EmpObject.prototype.initialize.call(this, args);
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    destroy: function () {
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getProperties: function () {
      return this.options.properties;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    setProperties: function (oValue) {
      this.options.properties = oValue;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    setPropertyValue: function (sProperty, Value) {
      this.options.properties[sProperty] = Value;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    setReadOnly: function (bValue) {
      this.options.properties.readOnly = (bValue === true);
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    isReadOnly: function () {
      return this.options.properties.readOnly;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    isDisabled: function () {
      return this.options.disabled;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    setDisabled: function (bValue) {
      this.options.disabled = (bValue === true);
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    removeFromMap: function (mapInstanceId) {
      if (this.options.visibleOnMap.hasOwnProperty(mapInstanceId)) {
        delete this.options.visibleOnMap[mapInstanceId];
        this.removeObjectFromMapRoot(mapInstanceId);
      }
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getMapInstanceList: function () {
      return emp.helpers.associativeArray.getKeys(this.options.visibleOnMap);
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getParentRelationshipList: function () {
      return this.options.parentObjects;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getChildrenList: function () {
      return this.options.childObjects;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getParentRelationship: function (parentCoreId) {
      return this.options.parentObjects[parentCoreId];
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getName: function () {
      return this.options.name;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    setName: function (sName) {
        if (sName !== undefined && sName !== null ) {
          //allow empty string for name. issue 343 GitHub emp3-web
          this.options.name = sName;
      }
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getDescription: function () {
      return this.options.description;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    setDescription: function (sDesc) {
      if (!emp.helpers.isEmptyString(sDesc)) {
        this.options.description = sDesc;
      }
    },
    /**
     * @private
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @description This function must be override by all sub classes. It is
     * called to generate an object suitable for the map engines to consume.
     * I.E. emp.classLibrary.EmpOverlay should return an {@link emp.typeLibrary.Overlay} object.
     */
    getObjectData: function () {
      return {};
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    isVisibleOnMap: function (mapInstanceId) {
      return ((typeof this.options.visibleOnMap[mapInstanceId] === 'boolean') ? this.options.visibleOnMap[mapInstanceId] : false);
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    setVisibleOnMap: function (mapInstanceId, bVisible) {
      this.options.visibleOnMap[mapInstanceId] = bVisible;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    isOnMap: function (mapInstanceId) {
      return this.options.visibleOnMap.hasOwnProperty(mapInstanceId);
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @returns {number}
     */
    getVisibilityCount: function (mapInstanceId) {
      var iCount = 0;
      var oRelationship;
      var sCoreId;

      for (sCoreId in this.options.parentObjects) {
        if (!this.options.parentObjects.hasOwnProperty(sCoreId)) {
          continue;
        }
        oRelationship = this.options.parentObjects[sCoreId];

        if (oRelationship.getVisibilityWithParent(mapInstanceId)) {
          iCount++;
        }
      }

      return iCount;
    },
    /**
     * @private
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @description This function checks to see if the visibility of an object
     * on a specific map is affected if the visibility of the parent identified by
     * sParentCoreId is set to bVisible.
     * @param {string} mapInstanceId The is of the map instance.
     * @param {string} sParentCoreId The parents coreId.
     * @param {boolean} bVisible The new visible setting of the relationship.
     */
    isVisibilityAffected: function (mapInstanceId, sParentCoreId, bVisible) {
      var oRelationship;
      var bSend = false;
      var iPrevVisibilityCount = this.getVisibilityCount(mapInstanceId);

      if (!this.options.parentObjects.hasOwnProperty(sParentCoreId)) {
        return bSend;
      }
      oRelationship = this.options.parentObjects[sParentCoreId];

      if ((iPrevVisibilityCount === 1)
        && !bVisible
        && oRelationship.getVisibleUnderParentOnMap(mapInstanceId)) {
        // There is only one visible
        // and we are turning off visibility
        // and this is the one that is on.
        // We send it.
        bSend = true;
      } else if ((iPrevVisibilityCount === 0)
        && bVisible
        && oRelationship.getVisibilitySettingOnMap(mapInstanceId)) {
        // There are none visible
        // and we are turing the it on,
        // and the parent has at least one ancestor on.
        // and the current setting is off.
        // Send it.
        bSend = true;
      } else if (!bVisible
        && oRelationship.getVisibleUnderParentOnMap(mapInstanceId)) {
        // Its parent is being turn off and this one is on.
        // We must turn it off but not send it.
        oRelationship.setVisibleUnderParentOnMap(mapInstanceId, bVisible);
      } else if (bVisible
        && !oRelationship.getVisibleUnderParentOnMap(mapInstanceId)
        && oRelationship.getVisibilitySettingOnMap(mapInstanceId)) {
        // Its parent is being turn on and this one is off.
        // But the user wants it on.
        // We must turn it on but not send it.
        oRelationship.setVisibleUnderParentOnMap(mapInstanceId, bVisible);
      }

      if (bSend) {
        oRelationship.setVisibleUnderParentOnMap(mapInstanceId, bVisible);
        this.setVisibleOnMap(mapInstanceId, bVisible);
      }

      return bSend;
    },
    /**
     * @private
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @description This function goes thru all the objects children and finds
     * all the objects that are affected by its change of visibility.
     * All those affected are added to the transaction items.
     * @param {boolean} bVisible
     * @param {emp.typeLibrary.Transaction} oTransaction
     */
    addAffectedChildren: function (oTransaction, bVisible) {
      var sChildCoreId;
      var oChild;
      var oDupChild;
      var mapInstanceId = oTransaction.mapInstanceId;
      var oaItems = oTransaction.items;
      var bAffected = false;


      for (sChildCoreId in this.options.childObjects) {
        if (!this.options.childObjects.hasOwnProperty(sChildCoreId)) {
          continue;
        }
        oChild = this.options.childObjects[sChildCoreId];
        if (oTransaction.isOnItemsList({coreId: oChild.getCoreId()})) {
          // Its on the list already. Skip it.
          continue;
        }

        bAffected = oChild.isVisibilityAffected(mapInstanceId, this.getCoreId(), bVisible);

        if (bAffected) {
          oDupChild = oChild.getObjectData(mapInstanceId, this.getCoreId());
          oDupChild.coreParent = this.getCoreId();
          oDupChild.parentCoreId = mapInstanceId;
          oaItems.push(oDupChild);

          switch (oChild.getCoreObjectType()) {
            case emp.typeLibrary.types.OVERLAY:
              // Emp V3 does not send overlays to the maps.
              // So we must put it on the dup list.
              oTransaction.duplicate(oChild.getCoreId());
              break;
            case emp.typeLibrary.types.WMS:
              if (!bVisible) {
                // Its being turn off and its a WMS.
                // We must clear out the active layer list.
                oDupChild.activeLayers = [];
              }
              break;
            default:
              //everything else gets sent to the map engine.
              break;
          }

          oChild.addAffectedChildren(oTransaction, bVisible);
        } else if (bVisible && oChild.getVisibilityWithParent(this.getCoreId())) {
          oChild.addAffectedChildren(oTransaction, bVisible);
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @desc designed as a fast way for DE or SE to flip visibility.
     * @param {string} sParentCoreId - The coreId of the parent the visibility is being set.
     * @param {emp.typeLibrary.Transaction} oTransaction This parameters must be a transaction.
     * @param {boolean} bVisible - Visibility Flag
     * @param {boolean} bGoDeep - True if the visibility should affect children.
     * @return {void}
     */
    visibility: function (oTransaction, sParentCoreId, bVisible, bGoDeep) {
      var oItem,
        mapInstanceId = oTransaction.mapInstanceId,
        oaItems = oTransaction.items;

      switch (this.getCoreObjectType()) {
        case emp.typeLibrary.types.OVERLAY:
        case emp.typeLibrary.types.FEATURE:
        case emp.typeLibrary.types.STATIC:
        case emp.typeLibrary.types.WMS:
          break;
        default:
          // visibility called on wrong object
          emp.errorHandler.log(emp.typeLibrary.Error({
            level: 1,
            message: "Visibility called on incompatible object",
            jsError: "",
            coreId: this.getCoreId()
          }));
          return;
      }

      if (typeof bVisible !== 'boolean') {
        // It must be true or false.
        return;
      }

      if (this.setVisibilityWithParent(mapInstanceId, sParentCoreId, bVisible)) {
        oItem = this.getObjectData(mapInstanceId, sParentCoreId);
        oItem.visible = bVisible;
        oaItems.push(oItem);

        switch (this.getCoreObjectType()) {
          case emp.typeLibrary.types.OVERLAY:
            // Emp V3 does not send overlays to the maps.
            // So we must put it on the dup list.
            oTransaction.duplicate(this.getCoreId());
            break;
          case emp.typeLibrary.types.STATIC:
            oItem.parentCoreId = sParentCoreId;
            break;
          default:
            //oItem.parentCoreId = emp.storage.getRootGuid(mapInstanceId);
            //everything else gets sent to the map engine.
            break;
        }

        if (bGoDeep) {
          this.addAffectedChildren(oTransaction, bVisible);
        }
      } else {
        // This is not being sent so we add it and dump it to the duplicates.
        oItem = this.getObjectData(mapInstanceId, sParentCoreId);
        oItem.visible = bVisible;
        switch (this.getCoreObjectType()) {
          case emp.typeLibrary.types.OVERLAY:
          case emp.typeLibrary.types.STATIC:
            oItem.parentCoreId = sParentCoreId;
            break;
          default:
            oItem.parentCoreId = emp.storage.getRootGuid(mapInstanceId);
            //everything else gets sent to the map engine.
            break;
        }
        oaItems.push(oItem);
        oTransaction.duplicate(this.getCoreId());
      }
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    locate: function (args) {
      var transaction,
        oMapExtent,
        payload,
        sCoreId,
        oChild;

      switch (this.getCoreObjectType()) {
        case emp.typeLibrary.types.FEATURE:
        case emp.typeLibrary.types.OVERLAY:
          break;
        default:
          // We can only locate features and overlays.
          return;
      }

      args = args || {};
      args.component = args.component || "";

      payload = {
        zoom: true,
        visible: true
      };

      switch (this.getCoreObjectType()) {
        case emp.typeLibrary.types.FEATURE:
          if (this.childrenCount() > 0) {
            // This feature has children so get the extents.
            oMapExtent = this.getMapExtent();
          }
          if (oMapExtent && !oMapExtent.isEmpty()) {
            payload.bounds = {
              west: oMapExtent.getWest(),
              east: oMapExtent.getEast(),
              south: oMapExtent.getSouth(),
              north: oMapExtent.getNorth()
            };
          } else {
            payload.featureId = this.getFeatureId();
            payload.coreId = this.getCoreId();
          }
          break;
        case emp.typeLibrary.types.OVERLAY:
          switch (this.childrenCount()) {
            case 0:
              // This overlay has no children.
              return;
            case 1:
              // This overlay has only 1 child.
              // So run the locate on that child.
              sCoreId = this.getChildrenCoreIds()[0];
              oChild = this.getChild(sCoreId);
              return oChild.locate(args);
            default:
              oMapExtent = this.getMapExtent();
              break;
          }

          if (oMapExtent && !oMapExtent.isEmpty()) {
            payload.bounds = {
              west: oMapExtent.getWest(),
              east: oMapExtent.getEast(),
              south: oMapExtent.getSouth(),
              north: oMapExtent.getNorth()
            };
          } else {
            return;
          }
          break;
      }

      transaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.VIEW_SET,
        mapInstanceId: args.mapInstanceId,
        source: emp.core.sources.CORE,
        items: [new emp.typeLibrary.View(payload)]
      });
      if (args.component === "de") {
        transaction.run();
      } else {
        return transaction;
      }
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getRootCoreId: function (mapInstanceId) {
      return mapInstanceId;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getRootParent: function (mapInstanceId) {
      var oRootCoreId = this.getRootCoreId(mapInstanceId);
      return emp.storage.get.id({
        id: oRootCoreId
      });
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    hasChildren: function () {
      return !emp.helpers.associativeArray.isEmpty(this.options.childObjects);
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    hasParents: function () {
      return !emp.helpers.associativeArray.isEmpty(this.options.parentObjects);
    },
    /**
     * @description This function removes this object from all of its parents.
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    removeFromAllParent: function () {
      var iIndex;
      var oParent;
      var aParentCoreIdList = this.getParentCoreIds();

      // Go thru all the parents and remove this object.
      for (iIndex = 0; iIndex < aParentCoreIdList.length; iIndex++) {
        oParent = this.getParent(aParentCoreIdList[iIndex]);
        oParent.removeChild(this);
      }
    },
    /**
     * This function checks to see if this is a descendant of the object identified by the given coreId
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @param {string} sCoreId
     */
    isDescendantOf: function (sCoreId) {
      var oRelationship;
      var sParentCoreId;
      var bRet = false;

      if (this.getCoreId() === sCoreId) {
        bRet = true;
      }
      else {
        for (sParentCoreId in this.options.parentObjects) {
          if (!this.options.parentObjects.hasOwnProperty(sParentCoreId)) {
            continue;
          }
          oRelationship = this.options.parentObjects[sParentCoreId];
          if (oRelationship.getParent().isDescendantOf(sCoreId)) {
            bRet = true;
            break;
          }
        }
      }

      return bRet;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @description This function checks if the object identified by coreId
     * is in the parent object list of this object.
     * @param {string} coreId
     */
    isChildOf: function (coreId) {
      return this.options.parentObjects.hasOwnProperty(coreId);
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @description This function checks if the object identified by coreId
     * is in the child object list of this object.
     * @param {string} coreId
     */
    isParentOf: function (coreId) {
      return this.options.childObjects.hasOwnProperty(coreId);
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @description This function returns an array containing all (distinct) map instance id's
     * that its parents are on.
     */
    getParentMapInstanceList: function () {
      var aMapList;
      var iIndex;
      var parentCoreId;
      var aRetList = [];
      var oRelationship;
      var oParentRelationshipList = this.getParentRelationshipList();

      for (parentCoreId in oParentRelationshipList) {

        // Go thru all its parent relationships.
        if (!oParentRelationshipList.hasOwnProperty(parentCoreId)) {
          continue;
        }

        oRelationship = oParentRelationshipList[parentCoreId];

        // Get the map instance list of the relationship.
        aMapList = oRelationship.getMapInstanceList();

        for (iIndex = 0; iIndex < aMapList.length; iIndex++) {
          // If the map instance id is not on the return list add it.
          if (aRetList.indexOf(aMapList[iIndex]) === -1) {
            aRetList.push(aMapList[iIndex]);
          }
        }
      }

      // if we didn't find a map that it's on, the parent my be
      // a root.   Check to find out which map this root is on.
      if (aRetList.length === 0) {
        var mapInstanceId = emp.storage.isRoot(this.getCoreId());

        if (mapInstanceId) {
          aRetList.push(mapInstanceId);
        }
      }

      return aRetList;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    removeMapInstanceFromRelationship: function (oParent, mapInstanceId) {
      var oChild;
      var sCoreId;
      var aParentMapList;
      var oRelationship = this.getParentRelationship(oParent.getCoreId());

      if (oRelationship) {
        oRelationship.removeMapInstance(mapInstanceId);
      }

      // Get the list of map all the parents are on.
      aParentMapList = this.getParentMapInstanceList();
      if (aParentMapList.indexOf(mapInstanceId) === -1) {
        // This object is no longer on the map with Id = mapInstanceId.
        this.removeFromMap(mapInstanceId);

        if (this.hasChildren()) {
          for (sCoreId in this.options.childObjects) {
            if (!this.options.childObjects.hasOwnProperty(sCoreId)) {
              continue;
            }
            oChild = this.options.childObjects[sCoreId];
            oChild.removeMapInstanceFromRelationship(this, mapInstanceId);
          }
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    deleteParentEntry: function (parentCoreId) {
      var oChild;
      var sCoreId;
      //var oParentRelationship;
      //var oParent;
      var iIndex;
      var aPrevMapList;
      var aNewMapList;

      if (this.isChildOf(parentCoreId)) {
        // First find the relationship.
        //oParentRelationship = this.getParentRelationship(parentCoreId);
        //oParent = oParentRelationship.getParent();
        // Get The list of maps all the parents are on.
        aPrevMapList = this.getParentMapInstanceList();
        // Now remove this relationship.
        delete this.options.parentObjects[parentCoreId];
        // Now get the maps the remaining parents are on.
        aNewMapList = this.getParentMapInstanceList();

        if (aPrevMapList.length !== aNewMapList.length) {
          // The list are of diff length, so
          // The new one should be smaller.
          for (iIndex = 0; iIndex < aPrevMapList.length; iIndex++) {
            // Find the map the object is no longer on.
            if (aNewMapList.indexOf(aPrevMapList[iIndex]) === -1) {
              // This is a map instance that this object is no longer on.
              this.removeFromMap(aPrevMapList[iIndex]);
              for (sCoreId in this.options.childObjects) {
                if (!this.options.childObjects.hasOwnProperty(sCoreId)) {
                  continue;
                }
                oChild = this.options.childObjects[sCoreId];
                oChild.removeMapInstanceFromRelationship(this, aPrevMapList[iIndex]);
              }
            }
          }
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    deleteChildEntry: function (childCoreId) {
      if (this.isParentOf(childCoreId)) {
        delete this.options.childObjects[childCoreId];
      }
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    removeChild: function (oChild) {
      if (this.isParentOf(oChild.getCoreId())) {
        //oChild.removeFromOverlayFeatureList(this);

        // Delete the parent from the childs parent list.
        oChild.deleteParentEntry(this.getCoreId());

        // Now delete the child from the parents child list.
        this.deleteChildEntry(oChild.getCoreId());
      }
    },
    // /**
    //  * @description This function removes the feature from its closest parent
    //  * overlay feature list.
    //  *
    //  * @param {emp.classLibrary.EmpRenderableObject} oParent
    //  */
    // removeFromOverlayFeatureList: function (oParent) {
    //   var oCurrentParent;
    //   var sParentCoreId;
    //   var oParentParentList;
    //
    //   if ((this.getCoreObjectType() === emp.typeLibrary.types.FEATURE)
    //     || (this.getCoreObjectType() === emp.typeLibrary.types.WMS)) {
    //     if (oParent.getCoreObjectType() === emp.typeLibrary.types.OVERLAY) {
    //       // Its an overlay so remove it.
    //       oParent.removeFromFeatureList(this);
    //       this.removeAllChildrenFromOverlayFeatureList(oParent);
    //     }
    //     else {
    //       oParentParentList = oParent.getParentRelationshipList();
    //
    //       for (sParentCoreId in oParentParentList) {
    //         if (oParentParentList.hasOwnProperty(sParentCoreId)) {
    //           oCurrentParent = oParentParentList[sParentCoreId].parent;
    //           this.removeFromOverlayFeatureList(oCurrentParent);
    //         }
    //       }
    //     }
    //   }
    // },
    // /**
    //  * @description This function removes all this feature children from
    //  * the overlay's feature list.
    //  *
    //  * @param {emp.classLibrary.EmpOverlay} oOverlay
    //  */
    // removeAllChildrenFromOverlayFeatureList: function (oOverlay) {
    //   var oChild;
    //   var sCoreId;
    //   var oChildList;
    //
    //   if ((this.getCoreObjectType() !== emp.typeLibrary.types.FEATURE)
    //     && (this.getCoreObjectType() !== emp.typeLibrary.types.WMS)) {
    //     return;
    //   }
    //
    //   oChildList = this.getChildrenList();
    //   for (sCoreId in oChildList) {
    //     if (oChildList.hasOwnProperty(sCoreId)) {
    //       oChild = oChildList[sCoreId];
    //       oChild.removeAllChildrenFromOverlayFeatureList(oOverlay);
    //       oOverlay.removeFromFeatureList(oChild);
    //     }
    //   }
    // },
    // addAllChildrenToOverlayFeatureList: function (oOverlay) {
    //   var oChild;
    //   var sCoreId;
    //   var oChildList;
    //
    //   if ((this.getCoreObjectType() !== emp.typeLibrary.types.FEATURE)
    //     && (this.getCoreObjectType() !== emp.typeLibrary.types.WMS)) {
    //     return;
    //   }
    //
    //   oChildList = this.getChildrenList();
    //   for (sCoreId in oChildList) {
    //     if (oChildList.hasOwnProperty(sCoreId)) {
    //       oChild = oChildList[sCoreId];
    //
    //       if (!oOverlay.isOnFeatureList(oChild)) {
    //         oOverlay.addToFeatureList(oChild);
    //         oChild.addAllChildrenToOverlayFeatureList(oOverlay);
    //       }
    //     }
    //   }
    // },
    // addToOverlayFeatureList: function (oParent) {
    //   var oCurrentParent;
    //   var sParentCoreId;
    //   var oParentParentList;
    //
    //   if ((this.getCoreObjectType() === emp.typeLibrary.types.FEATURE)
    //     || (this.getCoreObjectType() === emp.typeLibrary.types.WMS)) {
    //     if (oParent.getCoreObjectType() === emp.typeLibrary.types.OVERLAY) {
    //       oParent.addToFeatureList(this);
    //       this.addAllChildrenToOverlayFeatureList(oParent);
    //     }
    //     else {
    //       oParentParentList = oParent.getParentRelationshipList();
    //       for (sParentCoreId in oParentParentList) {
    //         if (oParentParentList.hasOwnProperty(sParentCoreId)) {
    //           oCurrentParent = oParentParentList[sParentCoreId].parent;
    //
    //           if (oCurrentParent.getCoreObjectType() !== emp.typeLibrary.types.OVERLAY) {
    //             // This parent is not an overlay, keep going up.
    //             this.addToOverlayFeatureList(oCurrentParent);
    //           } else {
    //             // This one is an overlay so add it.
    //             oCurrentParent.addToFeatureList(this);
    //             this.addAllChildrenToOverlayFeatureList(oCurrentParent);
    //           }
    //         }
    //       }
    //     }
    //   }
    // },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    removeObjectFromMapRoot: function (mapInstanceId) {
      var rootCoreId;
      var oRootOverlay;

      // Now features and WMS need to be added to the map instances root overlay.
      switch (this.getCoreObjectType()) {
        case emp.typeLibrary.types.FEATURE:
        case emp.typeLibrary.types.WMS:
          rootCoreId = emp.storage.getRootGuid(mapInstanceId);
          oRootOverlay = emp.storage.findOverlay(rootCoreId);

          if (oRootOverlay === undefined) {
            new emp.typeLibrary.Error({
              level: emp.typeLibrary.Error.level.MAJOR,
              message: 'removeObjectFromMapRoot: Root overlay for map instance not found.'
            });
            return;
          }

          oRootOverlay.removeFromFeatureList(this);
          break;
        default:
          break;
      }
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    addObjectToMapRoot: function (mapInstanceId) {
      var rootCoreId;
      var oRootOverlay;

      // Now features and WMS need to be added to the map instances root overlay.
      switch (this.getCoreObjectType()) {
        case emp.typeLibrary.types.FEATURE:
        case emp.typeLibrary.types.WMS:
          rootCoreId = emp.storage.getRootGuid(mapInstanceId);
          oRootOverlay = emp.storage.findOverlay(rootCoreId);

          if (oRootOverlay === undefined) {
            new emp.typeLibrary.Error({
              level: emp.typeLibrary.Error.level.MAJOR,
              message: 'addObjectToMapRoot: Root overlay for map instance not found.'
            });
            return;
          }

          oRootOverlay.addToFeatureList(this);
          break;
        default:
          break;
      }
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @param oParent
     * @param mapInstanceId
     * @param bParentVisible
     * @param bVisibleSetting
     */
    addMapInstanceToRelationship: function (oParent, mapInstanceId, bParentVisible, bVisibleSetting) {
      var oChild;
      var sCoreId;
      var oRelationship = this.options.parentObjects[oParent.getCoreId()];

      if (oRelationship) {
        this.options.visibleOnMap[mapInstanceId] = bParentVisible && bVisibleSetting;
        oRelationship.setVisibilitySettingOnMap(mapInstanceId, bVisibleSetting);
        oRelationship.setVisibleUnderParentOnMap(mapInstanceId, bParentVisible);

        this.addObjectToMapRoot(mapInstanceId);
      }

      if (this.hasChildren()) {
        for (sCoreId in this.options.childObjects) {
          if (!this.options.childObjects.hasOwnProperty(sCoreId)) {
            continue;
          }
          oChild = this.options.childObjects[sCoreId];
          oChild.addMapInstanceToRelationship(this, mapInstanceId, bParentVisible, bVisibleSetting);
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @description This function add this object as a child of oParent.
     * @param {emp.classLibrary.EmpRenderableObject} oParent
     * @param {boolean} bVisibleSetting
     */
    addParent: function (oParent, bVisibleSetting) {
      var oRelationship;
      var oMapList;
      var iIndex;
      var bParentVisible;
      var oChild;
      var sCoreId;

      if (!this.isChildOf(oParent.getCoreId())) {
        oRelationship = new emp.classLibrary.ObjectRelationship({
          parentStorageEntry: oParent,
          childStorageEntry: this
        });

        oMapList = oParent.getMapInstanceList();

        for (iIndex = 0; iIndex < oMapList.length; iIndex++) {
          bParentVisible = oParent.isVisibleOnMap(oMapList[iIndex]);
          this.setVisibleOnMap(oMapList[iIndex], bParentVisible && bVisibleSetting);
          oRelationship.setVisibilitySettingOnMap(oMapList[iIndex], bVisibleSetting);
          oRelationship.setVisibleUnderParentOnMap(oMapList[iIndex], bParentVisible);

          this.addObjectToMapRoot(oMapList[iIndex]);

          for (sCoreId in this.options.childObjects) {
            if (!this.options.childObjects.hasOwnProperty(sCoreId)) {
              continue;
            }
            oChild = this.options.childObjects[sCoreId];
            oChild.addMapInstanceToRelationship(this, oMapList[iIndex], bParentVisible, bVisibleSetting);
          }
        }

        this.options.parentObjects[oParent.getCoreId()] = oRelationship;
        oParent.addChild(this, bVisibleSetting);
      }
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @param {emp.classLibrary.EmpRenderableObject} oChild
     * @param {boolean} bVisibleSetting
     */
    addChild: function (oChild, bVisibleSetting) {
      if (!this.isParentOf(oChild.getCoreId())) {
        // Add it.
        this.options.childObjects[oChild.getCoreId()] = oChild;
        oChild.addParent(this, bVisibleSetting);
      }
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getAllFeatureChildren: function (oRetAssoArray) {
      var oAssoArray = oRetAssoArray || {};
      var sCoreId;

      for (sCoreId in this.options.childObjects) {
        if (this.options.childObjects.hasOwnProperty(sCoreId)) {
          if (this.options.childObjects[sCoreId].getCoreObjectType() !== emp.typeLibrary.types.OVERLAY) {
            oAssoArray[sCoreId] = this.options.childObjects[sCoreId];
          }
          this.options.childObjects[sCoreId].getAllFeatureChildren(oAssoArray);
        }
      }

      return oAssoArray;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @returns {string[]}
     */
    getChildrenCoreIds: function () {
      return emp.helpers.associativeArray.getKeys(this.options.childObjects);
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @returns {string[]}
     */
    getParentCoreIds: function () {
      return emp.helpers.associativeArray.getKeys(this.options.parentObjects);
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getParentCoreIdsOnMap: function (sMapInstanceId) {
      var aParentCoreIds = [];
      var sParentCoreId;
      var oRelationship;

      for (sParentCoreId in this.options.parentObjects) {
        if (!this.options.parentObjects.hasOwnProperty(sParentCoreId)) {
          continue;
        }

        oRelationship = this.options.parentObjects[sParentCoreId];
        if (oRelationship.isOnMap(sMapInstanceId)) {
          aParentCoreIds.push(sParentCoreId);
        }
      }
      return aParentCoreIds;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @return {number}
     */
    mapCount: function () {
      return emp.helpers.associativeArray.size(this.options.visibleOnMap);
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @return {number}
     */
    childrenCount: function () {
      return emp.helpers.associativeArray.size(this.options.childObjects);
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @return {number}
     */
    parentCount: function () {
      return emp.helpers.associativeArray.size(this.options.parentObjects);
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getChild: function (sCoreId) {
      return this.options.childObjects[sCoreId];
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getParent: function (sCoreId) {
      if (this.options.parentObjects.hasOwnProperty(sCoreId)) {
        return this.options.parentObjects[sCoreId].getParent();
      }
      return undefined;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getParentByIndex: function (iIndex) {
      var aCoreIds = this.getParentCoreIds();

      if (aCoreIds.length > iIndex) {
        return this.getParent(aCoreIds[iIndex]);
      }
      return undefined;
    },
    /*
     hasChildNodes: function()
     {
     return !emp.helpers.associativeArray.isEmpty(this.childNodes);
     },
     getChildNodesCoreIds: function()
     {
     return emp.helpers.associativeArray.getKeys(this.childNodes);
     },
     */
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getVisibilitySettingWithParent: function (mapInstanceId, sParentCodeId) {
      var sParentID = (sParentCodeId ? sParentCodeId : emp.storage.getRootGuid(mapInstanceId));

      if (this.isChildOf(sParentID)) {
        return this.getParentRelationship(sParentID).getVisibilitySettingOnMap(mapInstanceId);
      }

      return false;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getVisibilityWithParent: function (mapInstanceId, sParentCodeId) {
      var sParentID = (sParentCodeId ? sParentCodeId : emp.storage.getRootGuid(mapInstanceId));

      if (this.isChildOf(sParentID)) {
        return this.getParentRelationship(sParentID).getVisibleUnderParentOnMap(mapInstanceId);
      }

      return false;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    setVisibilityWithParent: function (mapInstanceId, sParentCodeId, bSetting) {
      var iCurrentVisibilityCount;
      var oRelationship;
      var sParentID = (sParentCodeId ? sParentCodeId : emp.storage.getRootGuid(mapInstanceId));
      var bSend = false;
      var iPrevVisibilityCount = this.getVisibilityCount(mapInstanceId);

      if (this.isChildOf(sParentID)) {
        oRelationship = this.getParentRelationship(sParentID);
        oRelationship.setVisibleUnderParentOnMap(mapInstanceId, bSetting);
        oRelationship.setVisibilitySettingOnMap(mapInstanceId, bSetting);
      }

      iCurrentVisibilityCount = this.getVisibilityCount(mapInstanceId);

      if (bSetting
        && (iPrevVisibilityCount === 0)
        && (iCurrentVisibilityCount === 1)) {
        // This is the first visibility sent to the object
        bSend = true;
      }
      else if (!bSetting
        && (iPrevVisibilityCount === 1)
        && (iCurrentVisibilityCount === 0)) {
        // This is the last visibility hide sent to the object.
        bSend = true;
      }

      if (bSend) {
        this.setVisibleOnMap(mapInstanceId, bSetting);
      }
      return bSend;
    },
    /**
     * @description This function traverses all parents looking for at least
     * one path to the root that is totally visible.
     * @memberof emp.classLibrary.EmpRenderableObject#
     * @returns {Boolean}
     */
    isVisible: function (mapInstanceId) {
      var sCoreId;
      var oParent;
      var oParentRelationshipList = this.getParentRelationshipList();
      var bRet = false;

      if (this.getCoreId() === emp.storage.getRootGuid(mapInstanceId)) {
        return true;
      }

      for (sCoreId in oParentRelationshipList) {
        if (oParentRelationshipList.hasOwnProperty(sCoreId)) {
          if (oParentRelationshipList[sCoreId].getVisibleUnderParentOnMap(mapInstanceId)) {
            if (sCoreId === emp.storage.getRootGuid(mapInstanceId)) {
              // It reached the root.
              return true;
            }
            oParent = oParentRelationshipList[sCoreId].getParent();
            if (oParent.isVisible()) {
              return true;
            }
          }
        }
      }

      return bRet;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    getMapExtent: function (oMapExtent) {
      var sCoreId;
      var oChild;
      var mapExtent = oMapExtent;
      var oChildList = this.getChildrenList();

      if (!(mapExtent instanceof emp.classLibrary.MapExtent)) {
        mapExtent = new emp.classLibrary.MapExtent();
      }

      for (sCoreId in oChildList) {
        if (!oChildList.hasOwnProperty(sCoreId)) {
          continue;
        }
        oChild = oChildList[sCoreId];

        switch (oChild.getCoreObjectType()) {
          case emp.typeLibrary.types.FEATURE:
          case emp.typeLibrary.types.OVERLAY:
            oChild.getMapExtent(mapExtent);
            break;
        }
      }

      return mapExtent;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    compareValues: function (Value1, Value2) {
      var bRet = false;

      if (Value2 instanceof RegExp) {
        // Regular expressions apply to string properties only.
        if (typeof (Value1) === 'string') {
          bRet = Value2.test(Value1);
        }
      } else {
        bRet = (Value1 === Value2);
      }
      return bRet;
    },
    /**
     * @memberof emp.classLibrary.EmpRenderableObject#
     */
    compareProperty: function (mapInstanceId, sProperty, Value) {
      var bRet = false;

      if (!emp.util.isEmptyString(sProperty)) {
        switch (sProperty.toLowerCase()) {
          case 'name':
            bRet = this.compareValues(this.getName(), Value);
            break;
          case 'description':
            bRet = this.compareValues(this.getDescription(), Value);
            break;
          case 'readonly':
            bRet = this.compareValues(this.isReadOnly(), Value);
            break;
          case 'visible':
            bRet = (this.isVisibleOnMap(mapInstanceId) === Value);
            break;
        }
      }
      return bRet;
    }
  };

  return publicInterface;
};

/**
 * @constructor
 * @extends emp.classLibrary.EmpObject
 */
emp.classLibrary.EmpRenderableObject = emp.classLibrary.EmpObject.extend(emp.classLibrary.privateClass());
