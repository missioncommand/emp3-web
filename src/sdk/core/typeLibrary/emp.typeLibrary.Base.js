/*global emp, tv4 */
/**
 * @memberOf emp.typeLibrary
 * @class
 *
 * @desc Used as prototype for other types includes validation, visibility and locate methods.
 * Methods in this base class should never be called by a map engine.
 */
emp.typeLibrary.base = {
  /**
   * @method
   * @desc Validates EMP {@link global} Types against the schema using TinyValidator 4 with the JSON Schema Specification
   * @returns {boolean} valid - Whether or not the object is valid
   * @returns {object} validationErrors - What is not validating correctly
   * @returns {object} validationMissing - What is missing per schema
   */
  validate: function () {
    if (emp.validate === true) {
      var message,
        i,
        valid = tv4.validateMultiple(this, this.schema);

      if (valid.valid) {
        this.valid = true;

      } else {
        message = "An emp.typeLibrary " + this.globalType + " Object has failed to validate: ";
        message += " ";
        for (i = 0; i < valid.errors.length; i++) {
          message += "\n " + valid.errors[i].message + " " + valid.errors[i].schemaPath + " " + valid.errors[i].dataPath;
        }

        emp.typeLibrary.Error({
          sender: this.sender,
          message: message,
          transactionId: this.transactionId,
          coreId: this.coreId,
          level: emp.typeLibrary.Error.level.INFO
        });

        this.valid = false;

        return false;
      }

      return true;
    }
  },
  /**
   * Returns the number of parents the object is listed as visible for
   * @returns {number}
   */
  getVisibilityCount: function () {
    var iCount = 0;

    if (this.isMultiParentRequired()) {
      var oRelationship;

      for (var sCoreId in this.parentNodes) {
        oRelationship = this.parentNodes[sCoreId];

        if (oRelationship.visible) {
          iCount++;
        }
      }
    } else {
      iCount = this.visible ? 1 : 0;
    }

    return iCount;
  },
  /**
   * @private
   * @param {type} bVisible
   * @param {type} sParentCoreId
   */
  isVisibilityAffected: function (sParentCoreId, bVisible) {
    var bSend = false;

    if (this.isMultiParentRequired()) {
      var iPrevVisibilityCount = this.getVisibilityCount();

      if (this.parentNodes.hasOwnProperty(sParentCoreId)) {
        if ((iPrevVisibilityCount === 1) && !bVisible &&
          this.parentNodes[sParentCoreId].visible) {
          // There is only one visible
          // and we are turning off visibility
          // and this is the one that is on.
          // We send it.
          bSend = true;
        } else if ((iPrevVisibilityCount === 0) &&
          bVisible &&
          this.parentNodes[sParentCoreId].visibilitySetting) {
          // There are none visible
          // and we are turing the parent on.
          // and the user wants this one on.
          // Send it.
          bSend = true;
        } else if (!bVisible && this.parentNodes[sParentCoreId].visible) {
          // Its parent is being turn off and this one is on.
          // We must turn it off but not send it.
          this.parentNodes[sParentCoreId].visible = bVisible;
        } else if (bVisible && !this.parentNodes[sParentCoreId].visible &&
          this.parentNodes[sParentCoreId].visibilitySetting) {
          // Its parent is being turn on and this one is off.
          // But the user wants it on.
          // We must turn it on but not send it.
          this.parentNodes[sParentCoreId].visible = bVisible;
        }

        if (bSend) {
          this.parentNodes[sParentCoreId].visible = bVisible;
        }
      }
    } else {
      // Its not MP.
      if (this.visible !== bVisible) {
        if (bVisible) {
          // Its being turned on
          if (this.visibilitySetting) {
            // The user wants it on.
            // So we send it.
            bSend = true;
          }
        } else {
          // Its being turn off
          // We send it.
          bSend = true;
        }
      }
    }

    if (bSend) {
      this.visible = bVisible;
    }

    return bSend;
  },
  /**
   * @private
   * @param {Boolean} bVisible
   * @param {emp.typeLibrary.Transaction} oTransaction
   */
  addAffectedChildren: function (oTransaction, bVisible) {
    var oaItems = oTransaction.items;
    var oChild;
    var oDupChild;
    var bAffected = false;

    for (var sChildCoreId in this.nodes) {
      oChild = this.nodes[sChildCoreId];

      bAffected = oChild.isVisibilityAffected(this.coreId, bVisible);

      if (bAffected) {
        if (oTransaction.isOnItemsList(oChild)) {
          // Its on the list already. Skip it.
          continue;
        }
        oDupChild = oChild.createDuplicate();
        oDupChild.coreParent = this.coreId;
        oaItems.push(oDupChild);

        switch (oChild.globalType) {
          case emp.typeLibrary.types.OVERLAY:
            if (this.isMultiParentRequired()) {
              // But we only send multi-parent overlays to the map engine if and only if
              // its the root overlay.
              // So given that its not the root we add it to the duplicates.
              oTransaction.duplicate(oChild.coreId);
            }
            break;
          default:
            //everything else gets sent to the map engine.
            break;
        }

        oChild.addAffectedChildren(oTransaction, bVisible);
      } else if (bVisible && oChild.getVisibilityWithParent(this.coreId)) {
        oChild.addAffectedChildren(oTransaction, bVisible);
      }
    }
  },
  /**
   * @desc designed as a fast way for DE or SE to flip visibility.
   * @param {emp.typeLibrary.Transaction} oTransaction
   * @param {string} sParentCoreId - The coreId of the parent the visibility is being set.
   * @param {boolean} bVisible - Visibility Flag
   * @param {boolean} bGoDeep - True if the visibility should affect children.
   */
  visibility: function (oTransaction, sParentCoreId, bVisible, bGoDeep) {
    var //oTransaction,
        //oAffectedTransaction,
      oItem,
      oaItems = oTransaction.items;


    switch (this.globalType) {
      case emp.typeLibrary.types.OVERLAY:
      case emp.typeLibrary.types.FEATURE:
      case emp.typeLibrary.types.STATIC:
        break;
      default:
        // visibility called on wrong object
        emp.errorHandler.log(emp.typeLibrary.Error({
          level: 1,
          message: "Visibility called on incompatible object",
          jsError: "",
          coreId: this.coreId
        }));
        return;
    }

    if (typeof bVisible !== 'boolean') {
      // It must be true or false.
      return;
    }

    if (this.setVisibilityWithParent(sParentCoreId, bVisible)) {
      oItem = this.createDuplicate();
      oItem.coreParent = sParentCoreId;
      oaItems.push(oItem);
      switch (this.globalType) {
        case emp.typeLibrary.types.OVERLAY:
          if (this.isMultiParentRequired()) {
            if (this.coreParent !== emp.storage.getRootGuid(oTransaction.mapInstanceId)) {
              // But we only send multi-parent overlays to the map engine if and only if
              // its the root overlay.
              // So given that its not the root we add it to the duplicates.
              oTransaction.duplicate(oItem.coreId);
            }
          }
          break;
        default:
          //everything else gets sent to the map engine.
          break;
      }

      if (bGoDeep) {
        this.addAffectedChildren(oTransaction, bVisible);
      }
    } else {
      // This is not being sent so we add it and dump it to the duplicates.
      oItem = this.createDuplicate();
      oItem.coreParent = sParentCoreId;
      oaItems.push(oItem);
      oTransaction.duplicate(oItem.coreId);
    }
  },
  /**
   * Creates a transaction to move the map to this object
   * @param {Object} args
   * @param {string} [args.component=""]
   * @param {string} args.mapInstanceId
   * @returns {emp.typeLibrary.Transaction}
   */
  locate: function (args) {
    var transaction,
      payload;

    args = args || {};
    args.component = args.component || "";

    payload = {
      coreId: this.coreId,
      overlayId: this.overlayId,
      parentId: this.parentId,
      featureId: this.featureId || this.id,
      zoom: true,
      visible: true
    };

    transaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.VIEW_SET,
      mapInstanceId: args.mapInstanceId,
      source: emp.core.sources.CORE,
      items: function () {
        var r = [];
        r.push(new emp.typeLibrary.View(payload));
        return r;
      }
    });
    if (args.component === "de") {
      transaction.run();
    } else {
      return transaction;
    }

  },
  /**
   *
   * @returns {string}
   */
  getRootCoreId: function () {
    var oRootCoreId = emp.storage.getRootGuid();

    if (this.isMultiParentRequired()) {
      if (this.parentNodes[oRootCoreId] !== undefined) {
        // If the storage root is a parent of this entry its the multi-parent root.
        oRootCoreId = this.coreId;
      } else {
        oRootCoreId = this.multiParentRootId;
      }
    }
    return oRootCoreId;
  },
  /**
   * @returns {emp.classLibrary.EmpRenderableObject}
   */
  getRootParent: function () {
    if (this.isMultiParentRequired()) {
      var oRootCoreId = this.getRootCoreId();
      return emp.storage.get.id({
        id: oRootCoreId
      });
    }
    return undefined;
  },
  /**
   * @returns {boolean}
   */
  hasChildren: function () {
    return !emp.helpers.associativeArray.isEmpty(this.nodes);
  },
  /**
   * @returns {boolean}
   */
  hasParents: function () {
    return !emp.helpers.associativeArray.isEmpty(this.parentNodes);
  },
  /**
   *
   */
  removeFromAllParent: function () {
    var oParent;

    if (this.isMultiParentRequired()) {
      var oMultiParentRoot;
      var aParentCoreIdList = this.getParentCoreIds();

      // If this is a multi parent object find
      // its root parent just in case we need to
      // remove it.
      oMultiParentRoot = this.getRootParent();

      // Go thru all the parents and remove this object.
      for (var iIndex = 0; iIndex < aParentCoreIdList.length; iIndex++) {
        oParent = this.parentNodes[aParentCoreIdList[iIndex]].parent;
        oParent.removeChild(this);
      }

      if (oMultiParentRoot && (this.coreId !== oMultiParentRoot.coreId)) {
        // If this object its not the root parent,
        // we need to remove it from its root parent's childNodes.
        if (oMultiParentRoot.childNodes.hasOwnProperty(this.coreId)) {
          delete oMultiParentRoot.childNodes[this.coreId];
        }
      }
    } else {
      oParent = emp.storage.get.id({
        id: this.coreParent
      });
      if (oParent !== undefined) {
        oParent.removeChild(this);
      }
    }
  },
  /**
   * This function checks to see if the object identified by sCoreId, is an ancestor of this.
   * This function should have been called isAnAncestor
   * @param {string} sCoreId
   * @returns {boolean}
   */
  isUnderParent: function (sCoreId) {
    var oParent;
    var bRet = false;
    if (this.coreId === sCoreId) {
      bRet = true;
    } else if (this.isMultiParentRequired()) {
      var oRelationship;
      for (var sParentCoreId in this.parentNodes) {
        oRelationship = this.parentNodes[sParentCoreId];
        if (oRelationship.parent.isUnderParent(sCoreId)) {
          bRet = true;
          break;
        }
      }
    } else {
      oParent = emp.storage.get.id({
        id: this.coreParent
      });

      if (oParent) {
        bRet = oParent.isUnderParent(sCoreId);
      }
    }

    return bRet;
  },
  /**
   * @param oChild
   */
  removeChild: function (oChild) {
    if (this.nodes.hasOwnProperty(oChild.coreId)) {
      oChild.removeFromOverlayFeatureList(this);
      if (this.isMultiParentRequired() ||
        ((this.coreId === emp.storage.getRootGuid()) &&
          oChild.isMultiParentRequired())) {
        // If this is a multi parent object find
        // its root parent just in case we need to
        // remove it.
        var oMultiParentRoot;

        if (this.coreId === emp.storage.getRootGuid()) {
          oMultiParentRoot = oChild.getRootParent();
        } else {
          oMultiParentRoot = this.getRootParent();
        }

        if (oChild.parentNodes[this.coreId]) {
          // Delete the parent from the childs parent list.
          delete oChild.parentNodes[this.coreId];
          //console.log("Remove child " + oChild.name + " from " + this.name + ". Which now has " + oChild.parentCount() + " parents.");
        }
        if (!oChild.hasParents() &&
          (oChild.globalType === emp.typeLibrary.types.FEATURE) &&
          (oMultiParentRoot) &&
          (oChild.coreId !== oMultiParentRoot.coreId)) {
          // If this object has a multi parent requirement
          // and it has no more parents left, and
          // its not the root parent,
          // we need to remove it from its root parent's childNodes.
          if (oMultiParentRoot.childNodes.hasOwnProperty(this.coreId)) {
            delete oMultiParentRoot.childNodes[this.coreId];
          }
        }
      }
      // Now delete the child from the parents child list.
      delete this.nodes[oChild.coreId];

    }
  },
  /**
   * @param oParent
   */
  removeFromOverlayFeatureList: function (oParent) {
    if ((this.globalType === emp.typeLibrary.types.FEATURE) ||
      (this.globalType === emp.typeLibrary.types.WMS)) {
      var oCurrentParent;

      if (oParent.globalType === emp.typeLibrary.types.OVERLAY) {
        // Its an overlay so remove it.
        oParent.removeFromFeatureList(this);
        this.removeAllChildrenFromOverlayFeatureList(oParent);
      } else {
        if (this.isMultiParentRequired()) {
          for (var sParentCoreId in oParent.parentNodes) {
            oCurrentParent = oParent.parentNodes[sParentCoreId].parent;
            this.removeFromOverlayFeatureList(oCurrentParent);
          }
        } else {
          oCurrentParent = emp.storage.get.id({
            id: oParent.coreParent
          });
          this.removeFromOverlayFeatureList(oCurrentParent);
          this.removeAllChildrenFromOverlayFeatureList(oCurrentParent);
        }
      }
    }
  },
  /**
   * @param oOverlay
   */
  removeAllChildrenFromOverlayFeatureList: function (oOverlay) {
    if ((this.globalType !== emp.typeLibrary.types.FEATURE) &&
      (this.globalType !== emp.typeLibrary.types.WMS)) {
      return;
    }

    var oChild;
    for (var sCoreId in this.nodes) {
      oChild = this.nodes[sCoreId];
      oChild.removeAllChildrenFromOverlayFeatureList(oOverlay);
      oOverlay.removeFromFeatureList(oChild);
    }
  },
  /**
   * @param oOverlay
   */
  addAllChildrenToOverlayFeatureList: function (oOverlay) {
    if ((this.globalType !== emp.typeLibrary.types.FEATURE) &&
      (this.globalType !== emp.typeLibrary.types.WMS)) {
      return;
    }

    var oChild;
    for (var sCoreId in this.nodes) {
      oChild = this.nodes[sCoreId];

      if (!oOverlay.isOnFeatureList(oChild)) {
        oOverlay.addToFeatureList(oChild);
        oChild.addAllChildrenToOverlayFeatureList(oOverlay);
      }
    }
  },
  /**
   * @param oParent
   */
  addToOverlayFeatureList: function (oParent) {
    if ((this.globalType === emp.typeLibrary.types.FEATURE) ||
      (this.globalType === emp.typeLibrary.types.WMS)) {
      var oCurrentParent;

      if (oParent.globalType === emp.typeLibrary.types.OVERLAY) {
        oParent.addToFeatureList(this);
        this.addAllChildrenToOverlayFeatureList(oParent);
      } else if (this.isMultiParentRequired()) {
        for (var sParentCoreId in oParent.parentNodes) {
          oCurrentParent = oParent.parentNodes[sParentCoreId].parent;

          if (oCurrentParent.globalType !== emp.typeLibrary.types.OVERLAY) {
            // This parent is not an overlay, keep going up.
            this.addToOverlayFeatureList(oCurrentParent);
          } else {
            // This one is an overlay so add it.
            oCurrentParent.addToFeatureList(this);
            this.addAllChildrenToOverlayFeatureList(oCurrentParent);
          }
        }
      } else {
        oCurrentParent = emp.storage.findOverlay(oParent.overlayId);
        oCurrentParent.addToFeatureList(this);
        this.addAllChildrenToOverlayFeatureList(oCurrentParent);
      }
    }
  },
  /**
   * @param oParent
   * @param {boolean} bVisible
   * @param {boolean} bVisibleSetting
   */
  addParent: function (oParent, bVisible, bVisibleSetting) {

    if (this.isMultiParentRequired()) {
      if (!this.parentNodes.hasOwnProperty(oParent.coreId)) {
        var oMultiParentRoot = oParent.getRootParent();
        var oRelationship = new emp.typeLibrary.parentRelationship({
          parent: oParent,
          visible: (oParent.visible ? bVisible : false),
          visibilitySetting: bVisibleSetting
        });
        this.parentNodes[oParent.coreId] = oRelationship;
        oParent.addChild(this, bVisible, bVisibleSetting);

        //console.log("Add parent " + oParent.name + " to " + this.name + ". Which now has " + this.parentCount() + " parents.");
        if (this.globalType === emp.typeLibrary.types.FEATURE) {
          // We must make sure that features get added to its root parents childNodes.
          if (!oMultiParentRoot.childNodes.hasOwnProperty(this.coreId)) {
            oMultiParentRoot.childNodes[this.coreId] = this;
            // Now set the overlay and parentCoreId so the map engines
            // place it on the correct root overlay.
            this.parentCoreId = oMultiParentRoot.coreId;
          }
        }

        this.multiParentRootId = (oMultiParentRoot ? oMultiParentRoot.coreId : undefined);
      }
    } else {
      this.coreParent = oParent.coreId;
      this.parentCoreId = oParent.coreId;
      this.visible = (oParent.visible ? bVisible : false);
      this.visibilitySetting = bVisibleSetting;
      oParent.addChild(this, bVisible, bVisibleSetting);
    }
  },
  /**
   * @param oChild
   * @param bVisible
   * @param bVisibleSetting
   */
  addChild: function (oChild, bVisible, bVisibleSetting) {
    if (!this.nodes.hasOwnProperty(oChild.coreId)) {
      // Add it.
      this.nodes[oChild.coreId] = oChild;
      oChild.addToOverlayFeatureList(this);
      oChild.addParent(this, bVisible, bVisibleSetting);
    }
  },
  /**
   * @returns {string[]}
   */
  getChildrenCoreIds: function () {
    return emp.helpers.associativeArray.getKeys(this.nodes);
  },
  /**
   * @returns {string[]}
   */
  getParentCoreIds: function () {
    return emp.helpers.associativeArray.getKeys(this.parentNodes);
  },
  /**
   * @returns {number}
   */
  childrenCount: function () {
    return emp.helpers.associativeArray.size(this.nodes);
  },
  /**
   * @returns {number}
   */
  parentCount: function () {
    return emp.helpers.associativeArray.size(this.parentNodes);
  },
  /**
   * @param {string} sCoreId
   * @returns {emp.classLibrary.EmpRenderableObject}
   */
  getChild: function (sCoreId) {
    return this.nodes[sCoreId];
  },
  /**
   * @param {string} sCoreId
   * @returns {emp.classLibrary.EmpRenderableObject}
   */
  getParent: function (sCoreId) {
    if (this.parentNodes[sCoreId]) {
      return this.parentNodes[sCoreId].parent;
    }
    return undefined;
  },
  /**
   * @returns {boolean}
   */
  isMultiParentRequired: function () {
    if (this.hasOwnProperty('properties') && this.properties.hasOwnProperty('multiParentRequired')) {
      return (this.properties.multiParentRequired === true);
    }

    return false;
  },
  /**
   * @returns {boolean}
   */
  hasChildNodes: function () {
    return !emp.helpers.associativeArray.isEmpty(this.childNodes);
  },
  /**
   * @returns {string[]}
   */
  getChildNodesCoreIds: function () {
    return emp.helpers.associativeArray.getKeys(this.childNodes);
  },
  /**
   * @param {string} sParentCodeId
   * @returns {boolean}
   */
  getVisibilitySettingWithParent: function (sParentCodeId) {
    var sParentID = (sParentCodeId ? sParentCodeId : emp.storage.getRootGuid());

    if (this.isMultiParentRequired()) {
      if (this.parentNodes.hasOwnProperty(sParentID)) {
        return this.parentNodes[sParentID].visibilitySetting;
      }

      return false;
    }

    return this.visibilitySetting;
  },
  /**
   * @param {string} sParentCodeId
   * @returns {boolean}
   */
  getVisibilityWithParent: function (sParentCodeId) {
    var sParentID = (sParentCodeId ? sParentCodeId : emp.storage.getRootGuid());

    if (this.isMultiParentRequired()) {
      if (this.parentNodes.hasOwnProperty(sParentID)) {
        return this.parentNodes[sParentID].visible;
      }

      return false;
    }

    return this.visible;
  },
  /**
   * @param {string} sParentCodeId
   * @param {boolean} bSetting
   * @returns {boolean}
   */
  setVisibilityWithParent: function (sParentCodeId, bSetting) {
    var sParentID = (sParentCodeId ? sParentCodeId : emp.storage.getRootGuid());
    var bSend = false;

    if (this.isMultiParentRequired()) {
      var iPrevVisibilityCount = this.getVisibilityCount();

      if (this.parentNodes.hasOwnProperty(sParentID)) {
        this.parentNodes[sParentID].visible = bSetting;
        this.parentNodes[sParentID].visibilitySetting = bSetting;
      }
      var iCurrentVisibilityCount = this.getVisibilityCount();

      if (bSetting && (iPrevVisibilityCount === 0) && (iCurrentVisibilityCount === 1)) {
        // This is the first visibility set to the object
        bSend = true;
      } else if (!bSetting && (iPrevVisibilityCount === 1) && (iCurrentVisibilityCount === 0)) {
        // This is the last visibility hide set to the object.
        bSend = true;
      }
    } else {
      if (this.visible !== bSetting) {
        bSend = true;
      }
    }

    if (bSend) {
      this.visible = bSetting;
      this.visibilitySetting = bSetting;
    }
    return bSend;
  },
  /**
   * This function traverses all parents looking for at least
   * one path to the root that is totally visible.
   * @returns {Boolean}
   */
  isVisible: function () {
    var oParent;
    var bRet = false;

    if (this.isMultiParentRequired()) {
      for (var sCoreId in this.parentNodes) {
        if (this.parentNodes[sCoreId].visible) {
          if (sCoreId === emp.storage.getRootGuid()) {
            // It reached the root.
            return true;
          }
          oParent = this.parentNodes[sCoreId].parent;
          if (oParent.isVisible()) {
            return true;
          }
        }
      }
    } else if (this.visible) {
      if (this.coreParent === emp.storage.getRootGuid()) {
        return true;
      } else {
        oParent = emp.storage.get.id({
          id: this.coreParent
        });

        if (oParent) {
          return oParent.isVisible();
        }
      }
    }

    return bRet;
  }
};
