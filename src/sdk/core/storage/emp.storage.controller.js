/* globals emp, armyc2 */

/**
 * Gets total count of storage engine objects minus root
 * @return {number}
 */
emp.storage.getPrimaryCount = function() {
  var c = 0;
  for (var k in emp.storage._storage.store) {
    if (emp.storage._storage.store.hasOwnProperty(k)) {
      ++c;
    }

  }
  return c - 1; // people don't need to know about root.
};

/**
 * This function removes this object from all of its parents by calling {@link emp.classLibrary.EmpRenderableObject#removeFromAllParent}
 * @param {string} sCoreId
 */
emp.storage.removeFromParent = function(sCoreId) {

  var oItem = emp.storage._storage.store[sCoreId];

  if (oItem !== undefined) {
    // Make sure the items is in storage.
    // And remove it from all parents.
    oItem.removeFromAllParent();
  }
};

/**
 * This function adds an object to a parent node by invoking {@link emp.classLibrary.EmpRenderableObject#addChild}
 * This establishes the link on the parent object.
 * @param {string} sCoreId
 */
emp.storage.addToParent = function(sCoreId) {

  var oParentNode;
  var oItem = emp.storage._storage.store[sCoreId];

  if (oItem !== undefined) {
    // Make sure the items is in storage.
    // Get the items parent.
    oParentNode = emp.storage._storage.store[oItem.coreParent];

    if (oParentNode !== undefined) {
      oParentNode.addChild(oItem, oItem.visibilitySetting);
    }
  }
};

/**
 *
 * @param {string} sCoreId
 */
emp.storage.removeChild = function(coreId) {

  /** @type emp.classLibrary.EmpRenderableObject */
  var item = emp.storage._storage.store[coreId];

  if (item !== undefined) {
    //console.log("SE Removing " + item.name + " (" + item.coreId + ").");
    // Make sure the items is in storage.
    // Loop while it has children

    if (item.hasChildren()) {
      var coreIdList = item.getChildrenCoreIds();
      var numChildren = coreIdList.length;
      for (var i = 0; i < numChildren; i++) {
        emp.storage.removeChild(coreIdList[i]);
      }
    }

    //Take it off its parents child list.
    item.removeFromAllParent();
    // Now delete the child.
    delete emp.storage._storage.store[coreId];
    //console.log("     DELETED " + item.name + " (" + item.coreId + ").");
  }
};

/**
 * Feature actions
 *
 * @namespace
 * @property {function} add Add feature to storage
 * @property {function} remove Remove feature from storage
 * @property {function} update Update feature from storage
 */
emp.storage.feature = {};

/**
 * @param {emp.typeLibrary.Transaction} transaction
 */
emp.storage.feature.add = function(transaction) {
  var empFeature;
  var parent;
  var item;
  var parentCount;
  var i, j;
  var items = transaction.items;
  var mapList;
  var prevMapList; // A list of maps that a feature was already on.
  var transactions = {}; // A list of transactions being sent out to the
  // map instances

  for (i = 0; i < items.length; i++) {
    item = items[i];
    prevMapList = [];

    // See if the feature already exists.
    empFeature = emp.storage.findFeature(item.overlayId, item.featureId);

    // If the feature exists retrieve the map instances it was on, and
    // update item
    // If the feature doesn't exist, create a new storage entry, EmpFeature,
    // and store it in the storage manager.
    if (empFeature) {
      prevMapList = empFeature.getParentMapInstanceList();
      if (!emp.storage.feature.updateItem(transactions, transaction, empFeature, item)) {
        continue;
      }
    }
    else {
      // This feature is new, so store the feature in the storage manager.
      empFeature = new emp.classLibrary.EmpFeature(item);
      emp.storage.storeObject(empFeature);
    }

    // if the item has a coreParent, then it came from a addFeature call from
    // an overlay or another feature.  If coreParent has not been defined
    // Feature.apply is being called.  Feature.apply does not notify
    // which parent it is on so some more work needs to be done.
    if (!emp.helpers.isEmptyString(item.coreParent)) {
      parent = emp.storage.get.id({
        id: item.coreParent
      });
      if (parent === undefined) {
        transaction.fail({
          coreId: item.coreId,
          level: emp.typeLibrary.Error.level.MAJOR,
          message: 'Unable to create parent overlay of ' + item.name + '.'
        });
        continue;
      }

      // Check to see if the feature is already on the parent.  If
      // this feature is being added for a second time, like an update,
      // then this would happen.  If it is not already on the parent,
      // add it.
      if (!parent.isParentOf(empFeature.getCoreId())) {
        parent.addChild(empFeature, item.visible);
      }

      // Get the map instances that the feature's parents are on.
      mapList = empFeature.getParentMapInstanceList();
      emp.storage.processRequest(transactions, prevMapList, mapList, parent, empFeature, item.zoom);
    }
    else {
      // feature plots as an update do not have a parent.
      // so we need to update all of them.
      parentCount = empFeature.parentCount();

      // Get the map instances that the feature's parents are on.
      mapList = empFeature.getParentMapInstanceList();

      for (j = 0; j < parentCount; j++) {
        parent = empFeature.getParentByIndex(j);
        emp.storage.processRequest(transactions, prevMapList, mapList, parent, empFeature, item.zoom);
      }
    }

  }

  emp.storage.executeTransactions(transactions);
};

/**
 * @param {emp.classLibrary.EmpFeature} oFeature
 * @param sOverlayId
 * @private
 */
emp.storage.feature._setChildrenOverlay = function(oFeature, sOverlayId) {
  var store = emp.storage._storage.store;
  var oChildItem;
  var oListCopy = oFeature.getChildrenCoreIds();

  for (var iIndex = 0; iIndex < oListCopy.length; iIndex++) {
    oChildItem = store[oListCopy[iIndex]];
    if (oChildItem) {
      // Change the overlay ID of its children.
      emp.storage.feature._setChildrenOverlay(oChildItem, sOverlayId);

      // Set the new overlay.
      oChildItem.overlayId = sOverlayId;
    }
  }
};

/**
 *
 * @param oTransactions
 * @param {emp.typeLibrary.Transaction} oTransaction
 * @param oStorageEntry
 * @param oNewItem
 * @returns {boolean}
 */
emp.storage.feature.updateItem = function(oTransactions, oTransaction, oStorageEntry, oNewItem) {
  var oParent;
  var aParentMapList;
  var iMapIndex;
  var oNewParent;
  var sBasicSC1, sBasicSC2;

  if (oNewItem.hasOwnProperty('format') && (oNewItem.format !== oStorageEntry.getFormat())) {
    oTransaction.fail({
      coreId: oNewItem.coreId,
      level: emp.typeLibrary.Error.level.MAJOR,
      message: "Feature " + oStorageEntry.getName() + " can not be updated from a " + oStorageEntry.getFormat() + " to a " + oNewItem.format + "."
    });
    return false;
  }

  if (oStorageEntry.isInEditMode() &&
    oNewItem.hasOwnProperty('data') &&
    (oStorageEntry.getFormat() === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL)) {
    // Its a milstd. Make sure that the basic Symbol Code does not change.
    sBasicSC1 = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(oStorageEntry.getSymbolCode());
    sBasicSC2 = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(oNewItem.data.symbolCode);
    if (sBasicSC1 !== sBasicSC2) {
      oTransaction.fail({
        coreId: oNewItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Feature " + oStorageEntry.getName() + " can not be updated from one symbol type to another while being edited."
      });
      return false;
    }
  }

  if (!emp.helpers.isEmptyString(oNewItem.parentId)) {
    // If it has a parent feature, get it.
    switch (oNewItem.parentId) {
      case emp.constant.parentIds.ALL_PARENTS:
      case emp.constant.parentIds.MAP_ROOT:
        break;
      default:
        oParent = emp.storage.findFeature(oNewItem.overlayId, oNewItem.parentId);
        if (oParent === undefined) {
          oTransaction.fail({
            coreId: oNewItem.coreId,
            level: emp.typeLibrary.Error.level.MAJOR,
            message: "Unable to find parent feature of feature " + oStorageEntry.getName() + "."
          });
          return false;
        }
        break;
    }
  }
  else if (!emp.helpers.isEmptyString(oNewItem.overlayId)) {
    switch (oNewItem.overlayId) {
      case emp.constant.parentIds.ALL_PARENTS:
        break;
      case emp.constant.parentIds.MAP_ROOT:
        break;
      default:
        oParent = emp.storage.findOverlay(oNewItem.overlayId);
        if (oParent === undefined) {
          if (oNewItem.hasOwnProperty('destOverlayId') ||
            oNewItem.hasOwnProperty('destParentId')) {
            // This is a feature move. But the current parent is not found.
            oTransaction.fail({
              coreId: oNewItem.coreId,
              level: emp.typeLibrary.Error.level.MAJOR,
              message: "Unable to find parent overlay of feature " + oStorageEntry.getName() + ". Feature move failed."
            });
            return false;
          }
          else {
            // The feature is being added to an overlay that does not yet exists.
            // So we need to create it.
            emp.storage.overlay.createOverlay(oTransaction.mapInstanceId, oNewItem.overlayId, oTransaction.sender);
            oParent = emp.storage.findOverlay(oNewItem.overlayId);
            if (!oParent) {
              oTransaction.fail({
                coreId: oNewItem.coreId,
                level: emp.typeLibrary.Error.level.MAJOR,
                message: "Unable to create new parent overlay of feature " + oStorageEntry.getName() + "."
              });
              return false;
            }
          }
        }
        break;
    }
  }

  if (oNewItem.destOverlayId || oNewItem.destParentId) {
    if (!oParent) {
      oTransaction.fail({
        coreId: oNewItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Invalid parent of feature " + oStorageEntry.getName() + "."
      });
      return false;
    }
    if (!emp.helpers.isEmptyString(oNewItem.destParentId)) {
      oNewParent = emp.storage.findFeature(oNewItem.destOverlayId, oNewItem.destParentId);
      if (oNewParent === undefined) {
        oTransaction.fail({
          coreId: oNewItem.coreId,
          level: emp.typeLibrary.Error.level.MAJOR,
          message: "Unable to find new parent feature of feature " + oStorageEntry.getName() + "."
        });
        return false;
      }
    }
    else if (!emp.helpers.isEmptyString(oNewItem.destOverlayId)) {
      oNewParent = emp.storage.findOverlay(oNewItem.destOverlayId);
      if (oNewParent === undefined) {
        oTransaction.fail({
          coreId: oNewItem.coreId,
          level: emp.typeLibrary.Error.level.MAJOR,
          message: "Unable to find new parent overlay of feature " + oStorageEntry.getName() + "."
        });
        return false;
      }
    }
    // Now remove it from the parent.
    oParent.removeChild(oStorageEntry);
    // Get the map list of the parent.
    aParentMapList = oParent.getParentMapInstanceList();

    // Now we must send a remove to all the maps the parent is on so they can update their UI.
    for (iMapIndex = 0; iMapIndex < aParentMapList.length; iMapIndex++) {
      emp.storage.addToObjectRemoveTransaction(oTransactions, aParentMapList[iMapIndex], oParent, oStorageEntry);
    }
    oParent = oNewParent;

  }

  if (oParent && !oParent.isParentOf(oStorageEntry.getCoreId())) {
    // we have a new parent
    // So we add it to the parent.
    oParent.addChild(oStorageEntry, true);
  }

  // Now we copy all other fields.
  oStorageEntry.updateFeature(oNewItem);
  return true;
};

/**
 *
 * @param  {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.feature.update = function(oTransaction) {
  var oEmpFeature;
  var oItem;
  var iIndex;
  var aMapList, aPrevMapList;
  var oTransactions = {};
  var oParent;

  for (iIndex = 0; iIndex < oTransaction.items.length;) {
    aMapList = [];
    aPrevMapList = [];
    oItem = oTransaction.items[iIndex];
    oEmpFeature = emp.storage.findFeature(oItem.overlayId, oItem.featureId);
    if (oEmpFeature === undefined) {
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Feature no found. Update canceled."
      });
      continue;
    }
    else {
      aPrevMapList = oEmpFeature.getParentMapInstanceList();
      if (!emp.storage.feature.updateItem(oTransactions, oTransaction, oEmpFeature, oItem)) {
        continue;
      }
    }
    aMapList = oEmpFeature.getParentMapInstanceList();
    oParent = emp.storage.findObject(oItem.coreParent);
    if (oParent === undefined) {
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Parent not found. Update canceled."
      });
      continue;
    }

    emp.storage.processRequest(oTransactions, aPrevMapList, aMapList, oParent, oEmpFeature);

    iIndex++;
  }

  emp.storage.executeTransactions(oTransactions);
};

emp.storage.executeTransactions = function(oTransactions) {
  var mapInstanceId;

  if (oTransactions.hasOwnProperty('oFeatureRemoveFromMapTransactions')) {
    for (mapInstanceId in oTransactions.oFeatureRemoveFromMapTransactions) {
      if (oTransactions.oFeatureRemoveFromMapTransactions.hasOwnProperty(mapInstanceId)) {
        oTransactions.oFeatureRemoveFromMapTransactions[mapInstanceId].run();
      }
    }
  }

  if (oTransactions.hasOwnProperty('oWMSRemoveFromMapTransactions')) {
    for (mapInstanceId in oTransactions.oWMSRemoveFromMapTransactions) {
      if (oTransactions.oWMSRemoveFromMapTransactions.hasOwnProperty(mapInstanceId)) {
        oTransactions.oWMSRemoveFromMapTransactions[mapInstanceId].run();
      }
    }
  }

  if (oTransactions.hasOwnProperty('oWMTSRemoveFromMapTransactions')) {
    for (mapInstanceId in oTransactions.oWMTSRemoveFromMapTransactions) {
      if (oTransactions.oWMTSRemoveFromMapTransactions.hasOwnProperty(mapInstanceId)) {
        oTransactions.oWMTSRemoveFromMapTransactions[mapInstanceId].run();
      }
    }
  }

  if (oTransactions.hasOwnProperty('oKmlLayerRemoveFromMapTransactions')) {
    for (mapInstanceId in oTransactions.oKmlLayerRemoveFromMapTransactions) {
      if (oTransactions.oKmlLayerRemoveFromMapTransactions.hasOwnProperty(mapInstanceId)) {
        oTransactions.oKmlLayerRemoveFromMapTransactions[mapInstanceId].run();
      }
    }
  }

  if (oTransactions.hasOwnProperty('oObjectRemoveTransaction')) {
    for (mapInstanceId in oTransactions.oObjectRemoveTransaction) {
      if (oTransactions.oObjectRemoveTransaction.hasOwnProperty(mapInstanceId)) {
        oTransactions.oObjectRemoveTransaction[mapInstanceId].run();
      }
    }
  }

  if (oTransactions.hasOwnProperty('oObjectAddTransaction')) {
    for (mapInstanceId in oTransactions.oObjectAddTransaction) {
      if (oTransactions.oObjectAddTransaction.hasOwnProperty(mapInstanceId)) {
        oTransactions.oObjectAddTransaction[mapInstanceId].run();
      }
    }
  }

  if (oTransactions.hasOwnProperty('oFeatureAddToMapTransactions')) {
    for (mapInstanceId in oTransactions.oFeatureAddToMapTransactions) {
      if (oTransactions.oFeatureAddToMapTransactions.hasOwnProperty(mapInstanceId)) {
        oTransactions.oFeatureAddToMapTransactions[mapInstanceId].run();
      }
    }
  }

  if (oTransactions.hasOwnProperty('oWMSAddToMapTransactions')) {
    for (mapInstanceId in oTransactions.oWMSAddToMapTransactions) {
      if (oTransactions.oWMSAddToMapTransactions.hasOwnProperty(mapInstanceId)) {
        oTransactions.oWMSAddToMapTransactions[mapInstanceId].run();
      }
    }
  }

  if (oTransactions.hasOwnProperty('oWMTSAddToMapTransactions')) {
    for (mapInstanceId in oTransactions.oWMTSAddToMapTransactions) {
      if (oTransactions.oWMTSAddToMapTransactions.hasOwnProperty(mapInstanceId)) {
        oTransactions.oWMTSAddToMapTransactions[mapInstanceId].run();
      }
    }
  }

  if (oTransactions.hasOwnProperty('oKmlLayerAddToMapTransactions')) {
    for (mapInstanceId in oTransactions.oKmlLayerAddToMapTransactions) {
      if (oTransactions.oKmlLayerAddToMapTransactions.hasOwnProperty(mapInstanceId)) {
        oTransactions.oKmlLayerAddToMapTransactions[mapInstanceId].run();
      }
    }
  }

  if (oTransactions.hasOwnProperty('featureUpdateTransactions')) {
    for (mapInstanceId in oTransactions.featureUpdateTransactions) {
      if (oTransactions.featureUpdateTransactions.hasOwnProperty(mapInstanceId)) {
        oTransactions.featureUpdateTransactions[mapInstanceId].run();
      }
    }
  }

  if (oTransactions.hasOwnProperty('oObjectUpdatedTransaction')) {
    for (mapInstanceId in oTransactions.oObjectUpdatedTransaction) {
      if (oTransactions.oObjectUpdatedTransaction.hasOwnProperty(mapInstanceId)) {
        oTransactions.oObjectUpdatedTransaction[mapInstanceId].run();
      }
    }
  }
};

/**
 * Removes a features from the store. Any children of the feature will be recursively removed if they no longer have
 * any other parent.
 *
 * @param {emp.typeLibrary.Transaction} transaction
 */
emp.storage.feature.remove = function(transaction) {
  var storageEntry;
  var items = transaction.items;
  var mapList, previousMapList;
  var transactions = {};
  var i;
  var item;
  var parent;

  for (i = 0; i < items.length; i++) {

    item = items[i];

    storageEntry = emp.storage.get.id({
      id: item.coreId
    });

    // See if the item actually exists.   If not, fail the transaction.
    if (storageEntry === undefined) {
      transaction.fail({
        coreId: item.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Feature remove: feature " + item.coreId + " not found."
      });
      continue;
    }

    // Check the parent id of the item being passed in
    if (!emp.helpers.isEmptyString(item.parentId)) {
      // If it has a parent feature, get it.
      parent = emp.storage.findFeature(item.overlayId, item.parentId);
      if (parent === undefined) {
        transaction.fail({
          coreId: item.coreId,
          level: emp.typeLibrary.Error.level.MAJOR,
          message: "Unable to find parent feature of feature " + storageEntry.getName() + "."
        });
        continue;
      }
    }
    else {
      parent = emp.storage.findOverlay(item.overlayId);

      if (parent === undefined) {
        transaction.fail({
          coreId: item.coreId,
          level: emp.typeLibrary.Error.level.MAJOR,
          message: "Unable to find parent overlay of feature " + storageEntry.getName() + "."
        });
        continue;
      }
    }

    if (!parent.isParentOf(storageEntry.getCoreId())) {
      // The identified parent is not a parent of the storage object.
      transaction.fail({
        coreId: item.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: parent.getName() + " is not a parent of feature " + storageEntry.getName() + "."
      });
      continue;
    }
    previousMapList = storageEntry.getParentMapInstanceList();

    if (storageEntry.parentCount() === 1) {
      // The storage entry will have no more parents.
      // Delete all children with no other parents.
      emp.storage.removeParentFromChildren(storageEntry);
    }

    parent.removeChild(storageEntry);

    mapList = storageEntry.getParentMapInstanceList();

    emp.storage.processRequest(transactions, previousMapList, mapList, parent, storageEntry);

    emp.storage.deleteObject(storageEntry);

  }
  emp.storage.executeTransactions(transactions);
};

/**
 *
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.feature.editUpdate = function(oTransaction) {
  var oEditItem = oTransaction.items[0];
  var store = emp.storage._storage.store;
  var oStorageItem;

  if (oEditItem.complete ||
    (oEditItem.updateEventType === emp.typeLibrary.UpdateEventType.COMPLETE)) {
    // We only store the data if its finished.
    oStorageItem = store[oEditItem.coreId];
    if (oStorageItem) {
      oStorageItem.updateFeature(oEditItem);
    }
    else {
      new emp.typeLibrary.Error({
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Edited features not found in storage."
      });
    }
  }
};

/**
 *
 * @param  {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.removeItems = function(transaction) {

  var item;
  var store = emp.storage._storage.store;
  var items = transaction.items;
  var i;

  for (i = 0; i < items.length; i = i + 1) {
    item = store[items[i].coreId];

    if (item === undefined)
      continue;

    //console.log("SE Removing " + item.name + " (" + item.coreId + ").");
    if (item.hasChildren()) {
      // Go thru the children.
      var coreIdList = item.getChildrenCoreIds();

      for (i = 0; i < coreIdList.length; i++) {
        emp.storage.removeChild(coreIdList[i]);
      }
    }

    //Take it off its parents child list.
    item.removeFromAllParent();
    // Now delete the item
    delete store[item.coreId];
    //console.log("   DELETED " + item.name + " (" + item.coreId + ").");
  }
};
/**
 * Overlay actions
 *
 * @type {Object}
 * @property {method} add Add overlay to storage
 * @property {method} remove Remove overlay from storage
 * @property {method} update Update overlay in storage
 * @property {method} clear Clear children from overlay
 */
emp.storage.overlay = {};

emp.storage.overlay.createOverlay = function(mapInstanceId, overlayId, sender) {
  var oTempTransaction = new emp.typeLibrary.Transaction({
    intent: emp.intents.control.OVERLAY_ADD,
    mapInstanceId: mapInstanceId,
    originChannel: "map.overlay.create",
    items: [new emp.typeLibrary.Overlay({
      name: "Overlay " + sender,
      overlayId: overlayId
    })]
  });

  oTempTransaction.run();
};

/**
 *
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.overlay.add = function(oTransaction) {
  var bVisibleSetting;
  var oEmpOverlay;
  var oParentOverlay;
  var oItem;
  var iIndex;
  var oaItems = oTransaction.items;
  var aMapList, aPrevMapList;
  var oTransactions = {};

  for (iIndex = 0; iIndex < oaItems.length;) {
    oItem = oaItems[iIndex];
    bVisibleSetting = oItem.visible;
    aPrevMapList = [];
    oEmpOverlay = emp.storage.findOverlay(oItem.overlayId);
    oParentOverlay = emp.storage.findObject(oItem.coreParent);

    if (oEmpOverlay !== undefined) {
      aPrevMapList = oEmpOverlay.getParentMapInstanceList();
      if (!emp.storage.overlay.updateItem(oTransactions, oTransaction, oEmpOverlay, oItem, false)) {
        continue;
      }
    }
    else {
      oEmpOverlay = new emp.classLibrary.EmpOverlay(oItem);
      emp.storage.storeObject(oEmpOverlay);
    }

    if (!oParentOverlay.isParentOf(oEmpOverlay.getCoreId())) {
      oParentOverlay.addChild(oEmpOverlay, bVisibleSetting);
    }

    aMapList = oEmpOverlay.getParentMapInstanceList();

    emp.storage.processRequest(oTransactions, aPrevMapList, aMapList, oParentOverlay, oEmpOverlay);

    iIndex++;
  }

  // Now we run all the transaction we created.
  emp.storage.executeTransactions(oTransactions);
};

/**
 *
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.overlay.clear = function(oTransaction) {
  var oOverlay;
  var oChild;
  var iIndex, iMapIndex;
  var aMapList, aPrevMapList;
  var oTransactionList = {
    oObjectUpdatedTransaction: {},
    oObjectRemoveTransaction: {},
    oFeatureRemoveFromMapTransactions: {},
    oWMSRemoveFromMapTransactions: {}
  };

  for (var i = 0; i < oTransaction.items.length; i = i + 1) {
    oOverlay = emp.storage.findOverlay(oTransaction.items[i].overlayId);

    if (oOverlay !== undefined) {
      var aChildrenCoreIdList = oOverlay.getChildrenCoreIds();

      for (iIndex = 0; iIndex < aChildrenCoreIdList.length; iIndex++) {
        oChild = emp.storage.findObject(aChildrenCoreIdList[iIndex]);
        if (oChild) {
          // Get the maps the child is currently on.
          aPrevMapList = oChild.getParentMapInstanceList();
          oOverlay.removeChild(oChild);

          // Now get the maps that child is still on.
          aMapList = oChild.getParentMapInstanceList();

          // The map on aPrevMapList that are not on aMapList are the
          // maps the Child must be removed from.
          for (iMapIndex = 0; iMapIndex < aPrevMapList.length; iMapIndex++) {
            if (aMapList.indexOf(aPrevMapList[iMapIndex]) === -1) {
              // Add the remove to the proper transaction.
              emp.storage.processChildrenRemoves(oTransactionList, aPrevMapList[iMapIndex], oChild);
              emp.storage.addToRemoveTransaction(oTransactionList, aPrevMapList[iMapIndex], oOverlay, oChild);
            }
          }

          // If the child has no more parents delete it from storage.
          if (oChild.parentCount() === 0) {
            emp.storage.deleteObject(oChild);
          }
        }
      }
    }
  }

  emp.storage.executeTransactions(oTransactionList);
};

emp.storage.overlay.updateItem = function(oTransactions, oTransaction, oStorageEntry, oNewItem, bFromUpdate) {
  var mapInstanceId = oTransaction.mapInstanceId;
  var oParent, oOldParent;
  var aMapList;
  var iMapIndex;
  var oParentValid;
  var sPropertyField;

  if (!emp.helpers.isEmptyString(oNewItem.parentId)) {
    // Find the new parent first.
    switch (oNewItem.parentId) {
      case emp.constant.parentIds.ALL_PARENTS:
        oTransaction.fail({
          coreId: oStorageEntry.getCoreId(),
          level: emp.typeLibrary.Error.level.MAJOR,
          message: 'Invalid parent Id for overlay ' + oStorageEntry.getName() + '.'
        });

        return false;
      case emp.constant.parentIds.MAP_ROOT:
        oParent = emp.storage.findOverlay(emp.storage.getRootGuid(mapInstanceId));
        break;
      default:
        oParent = emp.storage.findOverlay(oNewItem.parentId);
        break;
    }

    if (!oParent) {
      oTransaction.fail({
        coreId: oStorageEntry.getCoreId(),
        level: emp.typeLibrary.Error.level.MAJOR,
        message: 'New parent overlay for overlay ' + oStorageEntry.getName() + ' was not found.'
      });

      return false;
    }

    if (bFromUpdate) {
      // Only messages that come from the update channel can do a move.
      // Else its a new parent.
      //
      // If the new parentId is diff,
      // Its being moved.
      if (oStorageEntry.parentCount() > 1) {
        // The overlay has more than 1 parent so we can't move it.
        oTransaction.fail({
          coreId: oStorageEntry.getCoreId(),
          level: emp.typeLibrary.Error.level.MAJOR,
          message: 'Overlay ' + oStorageEntry.getName() + ' has more than 1 parent. Move of a multi-parent overlay is not supported.'
        });
        return false;
      }

      oOldParent = oStorageEntry.getParentByIndex(0);

      if (!oOldParent) {
        oTransaction.fail({
          coreId: oStorageEntry.getCoreId(),
          level: emp.typeLibrary.Error.level.MAJOR,
          message: 'Unable to find current parent of overlay ' + oStorageEntry.getName() + '.'
        });
        return false;
      }

      // Check to see if its a valid parent.
      oParentValid = emp.storage.overlay.validateParent(oStorageEntry.getCoreId(), oParent.getCoreId());
      if (oParentValid !== true) {
        oTransaction.fail({
          coreId: oNewItem.coreId,
          level: emp.typeLibrary.Error.level.MAJOR,
          message: oParentValid.errorMsg
        });
        return false;
      }

      if (oOldParent.getOverlayId() !== oNewItem.parentId) {
        oOldParent.removeChild(oStorageEntry);
        aMapList = oOldParent.getMapInstanceList();

        for (iMapIndex = 0; iMapIndex < aMapList.length; iMapIndex++) {
          emp.storage.addToObjectUpdateTransaction(oTransactions, aMapList[iMapIndex], oOldParent.getCoreId(), oStorageEntry.getCoreId());
        }


      }
    }

    if (!oParent.isParentOf(oStorageEntry.getCoreId())) {
      // Add it to the parent if and only if is not already AND is a valid parent.

      if (!bFromUpdate) {
        // Check to see if its a valid parent.
        oParentValid = emp.storage.overlay.validateParent(oStorageEntry.getCoreId(), oParent.getCoreId());
        if (oParentValid !== true) {
          oTransaction.fail({
            coreId: oNewItem.coreId,
            level: emp.typeLibrary.Error.level.MAJOR,
            message: oParentValid.errorMsg
          });
          return false;
        }
      }

      oParent.addChild(oStorageEntry, (oNewItem.visible !== false));
    }
  }

  if (!emp.helpers.isEmptyString(oNewItem.name) && (oStorageEntry.getName() !== oNewItem.name)) {
    oStorageEntry.setName(oNewItem.name);
  }

  if (oNewItem.hasOwnProperty('disabled')) {
    oStorageEntry.setDisabled(oNewItem.disabled);
  }

  if (oNewItem.hasOwnProperty('properties') && (typeof(oNewItem.properties) === 'object')) {
    for (sPropertyField in oNewItem.properties) {
      if (oNewItem.properties.hasOwnProperty(sPropertyField)) {
        oStorageEntry.setPropertyValue(sPropertyField, oNewItem.properties[sPropertyField]);
      }
    }
  }

  //if ((oNewItem.properties.disabled !== undefined) &&
  //        (oStoredItem.properties.disabled !== oNewItem.properties.disabled))
  //{
  //    oStoredItem.properties.disabled = oNewItem.properties.disabled;
  //}

  if (!emp.helpers.isEmptyString(oNewItem.menuId)) {
    oStorageEntry.setMenuId(oNewItem.menuId);
  }

  return true;
};

emp.storage.addToObjectAddTransaction = function(oTransactionList, mapInstanceId, oParent, oStorageEntry) {
  var oDupItem;

  // If the transaction list does not exists create it.
  if (!oTransactionList.hasOwnProperty('oObjectAddTransaction')) {
    oTransactionList.oObjectAddTransaction = {};
  }

  if (!oTransactionList.oObjectAddTransaction.hasOwnProperty(mapInstanceId)) {
    oTransactionList.oObjectAddTransaction[mapInstanceId] =
      new emp.typeLibrary.Transaction({
        intent: emp.intents.control.STORAGE_OBJECT_ADDED,
        mapInstanceId: mapInstanceId,
        items: []
      });
  }
  // Add this feature to the add transaction items list.
  oDupItem = oStorageEntry.getObjectData(mapInstanceId, oParent.getCoreId());
  oTransactionList.oObjectAddTransaction[mapInstanceId].items.push(oDupItem);
};

emp.storage.addToObjectRemoveTransaction = function(oTransactionList, mapInstanceId, oParent, oStorageEntry) {
  var oDupItem;

  // If the transaction list does not exists create it.
  if (!oTransactionList.hasOwnProperty('oObjectRemoveTransaction')) {
    oTransactionList.oObjectRemoveTransaction = {};
  }

  if (!oTransactionList.oObjectRemoveTransaction.hasOwnProperty(mapInstanceId)) {
    oTransactionList.oObjectRemoveTransaction[mapInstanceId] =
      new emp.typeLibrary.Transaction({
        intent: emp.intents.control.STORAGE_OBJECT_REMOVED,
        mapInstanceId: mapInstanceId,
        items: []
      });
  }
  // Add this feature to the remove transaction items list.
  oDupItem = oStorageEntry.getObjectData(mapInstanceId, oParent.getCoreId());
  oTransactionList.oObjectRemoveTransaction[mapInstanceId].items.push(oDupItem);
};

emp.storage.addToObjectUpdateTransaction = function(oTransactionList, mapInstanceId, parentCoreId, childCoreId) {
  if (!oTransactionList.hasOwnProperty('oObjectUpdatedTransaction')) {
    oTransactionList.oObjectUpdatedTransaction = {};
  }

  // A child needs to be removed from the parent.  Create a transaction with intent
  // to remove a child (STORAGE_OBJECT_CHILD_REMOVED).
  if (!oTransactionList.oObjectUpdatedTransaction.hasOwnProperty(mapInstanceId)) {
    oTransactionList.oObjectUpdatedTransaction[mapInstanceId] =
      new emp.typeLibrary.Transaction({
        intent: emp.intents.control.STORAGE_OBJECT_CHILD_REMOVED,
        mapInstanceId: mapInstanceId,
        items: []
      });
  }

  // Now add the parent and child of the item that needs to be removed.
  //oDupItem = oStorageEntry.getObjectData(mapInstanceId, oStorageEntry.getCoreId());
  oTransactionList.oObjectUpdatedTransaction[mapInstanceId].items.push({
    parentCoreId: parentCoreId,
    childCoreId: childCoreId
  });
};

emp.storage.addToUpdateTransaction = function(transactionList, mapInstanceId, parent, child) {
  var dupItem;

  switch (child.getCoreObjectType()) {
    case emp.typeLibrary.types.FEATURE:
      // If the transaction list does not exists create it.
      if (!transactionList.hasOwnProperty('featureUpdateTransactions')) {
        transactionList.featureUpdateTransactions = {};
      }

      // If the map instance does not yet exist on the update transaction, create it.
      if (!transactionList.featureUpdateTransactions.hasOwnProperty(mapInstanceId)) {
        transactionList.featureUpdateTransactions[mapInstanceId] =
          new emp.typeLibrary.Transaction({
            intent: emp.intents.control.MI_FEATURE_UPDATE,
            mapInstanceId: mapInstanceId,
            items: []
          });
      }

      // Add this feature to the update transaction items list.
      dupItem = child.getObjectData(mapInstanceId, parent.getCoreId());
      dupItem.visible = child.isVisibleOnMap(mapInstanceId);
      transactionList.featureUpdateTransactions[mapInstanceId].items.push(dupItem);
      break;
  }
};

emp.storage.addToAddTransaction = function(oTransactionList, mapInstanceId, oParent, oChild, bZoom) {
  var oDupItem;
  var sErrorMsg;

  switch (oChild.getCoreObjectType()) {
    case emp.typeLibrary.types.FEATURE:
      // The child is a feature.
      // Check to see if the map engine supports plotting the feature.
      if (oChild.canMapEnginePlot(mapInstanceId)) {
        // If the transaction list does not exists create it.
        if (!oTransactionList.hasOwnProperty('oFeatureAddToMapTransactions')) {
          oTransactionList.oFeatureAddToMapTransactions = {};
        }
        // If the transaction does not exists, create it.
        if (!oTransactionList.oFeatureAddToMapTransactions.hasOwnProperty(mapInstanceId)) {
          oTransactionList.oFeatureAddToMapTransactions[mapInstanceId] =
            new emp.typeLibrary.Transaction({
              intent: emp.intents.control.MI_FEATURE_ADD,
              mapInstanceId: mapInstanceId,
              items: []
            });
        }
        // Add this feature to the add transaction items list.
        oDupItem = oChild.getObjectData(mapInstanceId, oParent.getCoreId());
        oDupItem.zoom = (bZoom === true);
        oDupItem.visible = oChild.isVisibleOnMap(mapInstanceId);
        oTransactionList.oFeatureAddToMapTransactions[mapInstanceId].items.push(oDupItem);
      }
      else {
        sErrorMsg = emp.instanceManager.getInstance(mapInstanceId).engineName;
        sErrorMsg += " can't plot a " + oChild.getFormat() + " feature (" + oChild.getName() + ").";
        new emp.typeLibrary.Error({
          level: emp.typeLibrary.Error.level.INFO,
          message: sErrorMsg
        });
      }
      break;
    case emp.typeLibrary.types.WMS:
      // The child is a WMS.
      // Check to see if the map engine supports plotting the feature.
      if (oChild.canMapEnginePlot(mapInstanceId)) {
        // If the transaction list does not exists create it.
        if (!oTransactionList.hasOwnProperty('oWMSAddToMapTransactions')) {
          oTransactionList.oWMSAddToMapTransactions = {};
        }
        // Check to see if the transaction exists and create it if not.
        if (!oTransactionList.oWMSAddToMapTransactions.hasOwnProperty(mapInstanceId)) {
          oTransactionList.oWMSAddToMapTransactions[mapInstanceId] =
            new emp.typeLibrary.Transaction({
              intent: emp.intents.control.MI_WMS_ADD,
              mapInstanceId: mapInstanceId,
              items: []
            });
        }
        oDupItem = oChild.getObjectData(mapInstanceId, oParent.getCoreId());
        oDupItem.parentCoreId = emp.storage.getRootGuid(mapInstanceId);
        oTransactionList.oWMSAddToMapTransactions[mapInstanceId].items.push(oDupItem);
      }
      else {
        sErrorMsg = emp.instanceManager.getInstance(mapInstanceId).engineName;
        sErrorMsg += " can't plot a WMS version " + oChild.getVersion() + " map (" + oChild.getName() + ").";
        new emp.typeLibrary.Error({
          level: emp.typeLibrary.Error.level.INFO,
          message: sErrorMsg
        });
      }
      break;
    case emp.typeLibrary.types.KML:
      // The child is a KML link.
      // Check to see if the map engine supports plotting the feature.
      if (oChild.canMapEnginePlot(mapInstanceId)) {
        // If the transaction list does not exists create it.
        if (!oTransactionList.hasOwnProperty('oKmlLayerAddToMapTransactions')) {
          oTransactionList.oKmlLayerAddToMapTransactions = {};
        }
        // Check to see if the transaction exists and create it if not.
        if (!oTransactionList.oKmlLayerAddToMapTransactions.hasOwnProperty(mapInstanceId)) {
          oTransactionList.oKmlLayerAddToMapTransactions[mapInstanceId] =
            new emp.typeLibrary.Transaction({
              intent: emp.intents.control.MI_KML_LAYER_ADD,
              mapInstanceId: mapInstanceId,
              items: []
            });
        }
        oDupItem = oChild.getObjectData(mapInstanceId, oParent.getCoreId());
        oDupItem.parentCoreId = emp.storage.getRootGuid(mapInstanceId);
        oTransactionList.oKmlLayerAddToMapTransactions[mapInstanceId].items.push(oDupItem);
      }
      else {
        sErrorMsg = emp.instanceManager.getInstance(mapInstanceId).engine.implementation.displayName;
        sErrorMsg += " can't plot a KML " + oChild.getVersion() + " link on map (" + oChild.getName() + ").";
        new emp.typeLibrary.Error({
          level: emp.typeLibrary.Error.level.INFO,
          message: sErrorMsg
        });
      }
      break;
    case emp.typeLibrary.types.WMTS:
      // The child is a WMTS.
      // Check to see if the map engine supports plotting the feature.
      if (oChild.canMapEnginePlot(mapInstanceId)) {
        // If the transaction list does not exists create it.
        if (!oTransactionList.hasOwnProperty('oWMTSAddToMapTransactions')) {
          oTransactionList.oWMTSAddToMapTransactions = {};
        }
        // Check to see if the transaction exists and create it if not.
        if (!oTransactionList.oWMTSAddToMapTransactions.hasOwnProperty(mapInstanceId)) {
          oTransactionList.oWMTSAddToMapTransactions[mapInstanceId] =
            new emp.typeLibrary.Transaction({
              intent: emp.intents.control.MI_WMTS_ADD,
              mapInstanceId: mapInstanceId,
              items: []
            });
        }
        oDupItem = oChild.getObjectData(mapInstanceId, oParent.getCoreId());
        oDupItem.parentCoreId = emp.storage.getRootGuid(mapInstanceId);
        oTransactionList.oWMTSAddToMapTransactions[mapInstanceId].items.push(oDupItem);
      }
      else {
        sErrorMsg = emp.instanceManager.getInstance(mapInstanceId).engine.implementation.displayName;
        sErrorMsg += " can't plot a WMTS version " + oChild.getVersion() + " map (" + oChild.getName() + ").";
        new emp.typeLibrary.Error({
          level: emp.typeLibrary.Error.level.INFO,
          message: sErrorMsg
        });
      }
      break;
    case emp.typeLibrary.types.OVERLAY:
      // This child is an overlay
      // If the transaction list does not exists create it.
      if (!oTransactionList.hasOwnProperty('oObjectAddTransaction')) {
        oTransactionList.oObjectAddTransaction = {};
      }
      if (!oTransactionList.oObjectAddTransaction.hasOwnProperty(mapInstanceId)) {
        oTransactionList.oObjectAddTransaction[mapInstanceId] =
          new emp.typeLibrary.Transaction({
            intent: emp.intents.control.STORAGE_OBJECT_ADDED,
            mapInstanceId: mapInstanceId,
            items: []
          });
      }
      oDupItem = oChild.getObjectData(mapInstanceId, oParent.getCoreId());
      oTransactionList.oObjectAddTransaction[mapInstanceId].items.push(oDupItem);
      break;
  }
};

/**
 *
 * @param {Object} transactionList
 * @param {string} mapInstanceId
 * @param {emp.classLibrary.EmpRenderableObject} oParent
 * @param {emp.classLibrary.EmpRenderableObject} oChild
 */
emp.storage.addToRemoveTransaction = function(transactionList, mapInstanceId, oParent, oChild) {
  var oDupItem;

  switch (oChild.getCoreObjectType()) {
    case emp.typeLibrary.types.FEATURE:
      // The child is a feature.
      // If the transaction list does not exists create it.
      if (!transactionList.hasOwnProperty('oFeatureRemoveFromMapTransactions')) {
        transactionList.oFeatureRemoveFromMapTransactions = {};
      }
      // If the remove transaction does not exists, create it.
      if (!transactionList.oFeatureRemoveFromMapTransactions.hasOwnProperty(mapInstanceId)) {
        transactionList.oFeatureRemoveFromMapTransactions[mapInstanceId] =
          new emp.typeLibrary.Transaction({
            intent: emp.intents.control.MI_FEATURE_REMOVE,
            mapInstanceId: mapInstanceId,
            items: []
          });
      }
      // Add this feature to the remove transaction items list.
      oDupItem = oChild.getObjectData(mapInstanceId, oParent.getCoreId());
      transactionList.oFeatureRemoveFromMapTransactions[mapInstanceId].items.push(oDupItem);
      break;
    case emp.typeLibrary.types.WMS:
      // The child is a WMS.
      // If the transaction list does not exists create it.
      if (!transactionList.hasOwnProperty('oWMSRemoveFromMapTransactions')) {
        transactionList.oWMSRemoveFromMapTransactions = {};
      }
      // Check to see if the remove transaction exists and create it if not.
      if (!transactionList.oWMSRemoveFromMapTransactions.hasOwnProperty(mapInstanceId)) {
        transactionList.oWMSRemoveFromMapTransactions[mapInstanceId] =
          new emp.typeLibrary.Transaction({
            intent: emp.intents.control.MI_WMS_REMOVE,
            mapInstanceId: mapInstanceId,
            items: []
          });
      }
      oDupItem = oChild.getObjectData(mapInstanceId, oParent.getCoreId());
      oDupItem.parentCoreId = emp.storage.getRootGuid(mapInstanceId);
      transactionList.oWMSRemoveFromMapTransactions[mapInstanceId].items.push(oDupItem);
      break;

    case emp.typeLibrary.types.WMTS:
      // The child is a WMS.
      // If the transaction list does not exists create it.
      if (!transactionList.hasOwnProperty('oWMTSRemoveFromMapTransactions')) {
        transactionList.oWMTSRemoveFromMapTransactions = {};
      }
      // Check to see if the remove transaction exists and create it if not.
      if (!transactionList.oWMTSRemoveFromMapTransactions.hasOwnProperty(mapInstanceId)) {
        transactionList.oWMTSRemoveFromMapTransactions[mapInstanceId] =
          new emp.typeLibrary.Transaction({
            intent: emp.intents.control.MI_WMTS_REMOVE,
            mapInstanceId: mapInstanceId,
            items: []
          });
      }
      oDupItem = oChild.getObjectData(mapInstanceId, oParent.getCoreId());
      oDupItem.parentCoreId = emp.storage.getRootGuid(mapInstanceId);
      transactionList.oWMTSRemoveFromMapTransactions[mapInstanceId].items.push(oDupItem);
      break;
    case emp.typeLibrary.types.KML:
        // The child is a WMS.
        // If the transaction list does not exists create it.
        if (!transactionList.hasOwnProperty('oKmlLayerRemoveFromMapTransactions')) {
          transactionList.oKmlLayerRemoveFromMapTransactions = {};
        }
        // Check to see if the remove transaction exists and create it if not.
        if (!transactionList.oKmlLayerRemoveFromMapTransactions.hasOwnProperty(mapInstanceId)) {
          transactionList.oKmlLayerRemoveFromMapTransactions[mapInstanceId] =
            new emp.typeLibrary.Transaction({
              intent: emp.intents.control.MI_MAP_LAYER_REMOVE,
              mapInstanceId: mapInstanceId,
              items: []
            });
        }
        oDupItem = oChild.getObjectData(mapInstanceId, oParent.getCoreId());
        oDupItem.parentCoreId = emp.storage.getRootGuid(mapInstanceId);
        transactionList.oKmlLayerRemoveFromMapTransactions[mapInstanceId].items.push(oDupItem);
        break;
    case emp.typeLibrary.types.OVERLAY:
      // This child is an overlay
      // If the transaction list does not exists create it.
      if (!transactionList.hasOwnProperty('oObjectRemoveTransaction')) {
        transactionList.oObjectRemoveTransaction = {};
      }
      if (!transactionList.oObjectRemoveTransaction.hasOwnProperty(mapInstanceId)) {
        transactionList.oObjectRemoveTransaction[mapInstanceId] =
          new emp.typeLibrary.Transaction({
            intent: emp.intents.control.STORAGE_OBJECT_REMOVED,
            mapInstanceId: mapInstanceId,
            items: []
          });
      }
      oDupItem = oChild.getObjectData(mapInstanceId, oParent.getCoreId());
      transactionList.oObjectRemoveTransaction[mapInstanceId].items.push(oDupItem);
      break;
  }
};

/**
 * This function processes all children removes for the entry. Children
 * are only removed frm the map instance if they do not have other parents on the map instance.
 *
 * @param {object} oTransactions The transaction list object where all the transactions are created.
 * @param {string} mapInstanceId The map instance Id the remove will be addressed to.
 * @param {emp.classLibrary.EmpRenderableObject} oStorageEntry The entry the operation was performed on.
 */
emp.storage.processChildrenRemoves = function(oTransactions, mapInstanceId, oStorageEntry) {
  var iIndex;
  var oChild;
  var aChildrenCoreIdList = oStorageEntry.getChildrenCoreIds();
  var iChildrenCount = aChildrenCoreIdList.length;

  for (iIndex = 0; iIndex < iChildrenCount; iIndex++) {
    oChild = emp.storage.findObject(aChildrenCoreIdList[iIndex]);

    if (oChild.parentCount() === 0) {
      // We only remove the child if the parent has no other parents.
      oStorageEntry.removeChild(oChild.getCoreId());
    }

    if (!oChild.isOnMap(mapInstanceId)) {
      // This child is no longer on that map instance.
      // So we must send the remove to the map instance.

      // But first process its children.
      if (oChild.hasChildren()) {
        emp.storage.processChildrenRemoves(oTransactions, mapInstanceId, oChild);
      }
      emp.storage.addToRemoveTransaction(oTransactions, mapInstanceId, oStorageEntry, oChild);
    }
  }
};

/**
 * This function processes all children adds for the entry.
 *
 * @param {object} oTransactions The transaction list object where all the transactions are created.
 * @param {string} mapInstanceId The map instance Id the adds will be addressed to.
 * @param {emp.classLibrary.EmpRenderableObject} oStorageEntry The entry the operation was performed on.
 */
emp.storage.processChildrenAdds = function(oTransactions, mapInstanceId, oStorageEntry) {
  var sCoreId;
  var oChild, oChildFeatures;

  oChildFeatures = oStorageEntry.getChildrenList();

  for (sCoreId in oChildFeatures) {
    if (oChildFeatures.hasOwnProperty(sCoreId)) {
      oChild = oChildFeatures[sCoreId];
      if (oChild.isOnMap(mapInstanceId)) {
        // This child is on that map instance.
        // So we must send it to the map instance.
        emp.storage.addToAddTransaction(oTransactions, mapInstanceId, oStorageEntry, oChild);

        if (oChild.hasChildren()) {
          emp.storage.processChildrenAdds(oTransactions, mapInstanceId, oChild);
        }
      }
    }
  }
};

/**
 * This function processes a request adding to and/or removing from the proper map instances. It processes all children
 * along with the storage entry.
 *
 * @param {Object.<emp.typeLibrary.Transaction>} transactions The transaction list object where all the transactions
 * are created.
 * @param {string[]} prevMapList The list of map instance Id's the entry was on prior to the operation.
 * @param {string[]} mapList The list of map instance Id's the entry is on after the operation.
 * @param {emp.classLibrary.EmpRenderableObject} parent A parent of the entry.
 * @param {emp.classLibrary.EmpRenderableObject} storageEntry The actual entry the operation was performed on.
 * @param {boolean} [zoom] If its an add operation, this indicates if the zoom is to be set.
 */
emp.storage.processRequest = function(transactions, prevMapList, mapList, parent, storageEntry, zoom) {
  var i, iTempIndex;
  var removeFromMapList = [];
  var addToMapList = [];
  var parentMapList;

  for (i = 0; i < prevMapList.length; i++) {
    // This loop adds map instance that are in prevMapList and not in mapList to removeFromMapList.
    // These are the map instances that the parent is no longer on.
    iTempIndex = mapList.indexOf(prevMapList[i]);
    if (iTempIndex === -1) {
      removeFromMapList.push(prevMapList[i]);
    }
  }

  if (removeFromMapList.length > 0) {
    // removeFromMapList contains the map instances that the storageEntry is no longer on.
    // So we need to add it to the remove transaction for the maps.

    for (i = 0; i < removeFromMapList.length; i++) {
      emp.storage.addToRemoveTransaction(transactions, removeFromMapList[i], parent, storageEntry);
      emp.storage.processChildrenRemoves(transactions, removeFromMapList[i], storageEntry);
    }

    // Get the map list of the parent.
    parentMapList = parent.getParentMapInstanceList();

    // Now we must send a remove to all the maps the parent is on so they can update their UI.
    for (i = 0; i < parentMapList.length; i++) {
      emp.storage.addToObjectRemoveTransaction(transactions, parentMapList[i], parent, storageEntry);
    }
  }

  for (i = 0; i < mapList.length; i++) {
    // This loop will find the map instance the storageEntry needs to be added to (if any)
    if (prevMapList.indexOf(mapList[i]) === -1) {
      // This parent needs to be added to the the map instance.
      addToMapList.push(mapList[i]);
    }
  }

  if (addToMapList.length > 0) {
    // There is at least one new map instance for the storageEntry.
    // So we need to add it to the add transaction for the maps.

    for (i = 0; i < addToMapList.length; i++) {
      emp.storage.addToAddTransaction(transactions, addToMapList[i], parent, storageEntry, zoom);
      emp.storage.processChildrenAdds(transactions, addToMapList[i], storageEntry);
    }
    // Get the map list of the parent.
    parentMapList = parent.getParentMapInstanceList();

    // Now we must send an add to all the maps the parent is on so they can update their UI.
    for (i = 0; i < parentMapList.length; i++) {
      emp.storage.addToObjectAddTransaction(transactions, parentMapList[i], parent, storageEntry);
    }
  }

  if ((removeFromMapList.length === 0) && (addToMapList.length === 0)) {
    // Only do this if there are no removes and no adds.
    // Get the map list of the parent.
    parentMapList = parent.getParentMapInstanceList();

    // Now we must send an add to all the maps the parent is on so they can update their UI and the maps.
    for (i = 0; i < parentMapList.length; i++) {
      if (parent.isParentOf(storageEntry.getCoreId())) {
        // essentially this is an update.
        emp.storage.addToUpdateTransaction(transactions, parentMapList[i], parent, storageEntry);
      }
      else {
        emp.storage.addToObjectRemoveTransaction(transactions, parentMapList[i], parent, storageEntry);
      }
    }
  }
};

/**
 *
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.overlay.update = function(oTransaction) {
  var oOverlayItem, oStorageEntry;
  var iIndex;
  var oaItems = oTransaction.items;
  var oTransactions = {};
  var aPrevMapList, aMapList;
  var iParentCount;
  var iParentIndex;
  var oParent;

  for (iIndex = 0; iIndex < oaItems.length;) {
    oOverlayItem = oaItems[iIndex];
    oStorageEntry = emp.storage.findOverlay(oOverlayItem.overlayId);

    if (oStorageEntry === undefined) {
      // The overlay does not exists.
      oTransaction.fail({
        coreId: oStorageEntry.getCoreId(),
        level: emp.typeLibrary.Error.level.MAJOR,
        message: 'Overlay ' + oOverlayItem.overlayId + ' not found.'
      });
      continue;
    }

    aPrevMapList = oStorageEntry.getParentMapInstanceList();
    if (!emp.storage.overlay.updateItem(oTransactions, oTransaction, oStorageEntry, oOverlayItem, true)) {
      // The update failed.
      continue;
    }

    aMapList = oStorageEntry.getParentMapInstanceList();

    iParentCount = oStorageEntry.parentCount();
    for (iParentIndex = 0; iParentIndex < iParentCount; iParentIndex++) {
      oParent = oStorageEntry.getParentByIndex(iParentIndex);
      emp.storage.processRequest(oTransactions, aPrevMapList, aMapList, oParent, oStorageEntry, false);
    }
    iIndex++;
  }

  // Now we run all the transaction we created.
  emp.storage.executeTransactions(oTransactions);
};

emp.storage.overlay.clusterSet = function(oTransaction) {
  var oClusterDef;
  var oOverlay;

  for (var i = 0; i < oTransaction.items.length; i = i + 1) {
    oClusterDef = oTransaction.items[i];

    if (oClusterDef) {
      oOverlay = emp.storage.findOverlay(oClusterDef.getOverlayId());

      if (oOverlay) {
        oOverlay.properties.cluster = oClusterDef;
        oOverlay.properties.bClusterActive = true;
      }
    }
  }
};

emp.storage.overlay.clusterActivate = function(oTransaction) {
  var oClusterDef;
  var oOverlay;

  for (var i = 0; i < oTransaction.items.length; i = i + 1) {
    oClusterDef = oTransaction.items[i];

    if (oClusterDef) {
      oOverlay = emp.storage.findOverlay(oClusterDef.getOverlayId());

      if (oOverlay) {
        oOverlay.properties.bClusterActive = true;
      }
    }
  }
};

emp.storage.overlay.clusterDeactivate = function(oTransaction) {
  var oClusterDef;
  var oOverlay;

  for (var i = 0; i < oTransaction.items.length; i = i + 1) {
    oClusterDef = oTransaction.items[i];

    if (oClusterDef) {
      oOverlay = emp.storage.findOverlay(oClusterDef.getOverlayId());

      if (oOverlay) {
        oOverlay.properties.bClusterActive = false;
      }
    }
  }
};

emp.storage.overlay.clusterRemove = function(oTransaction) {
  var oClusterDef;
  var oOverlay;

  for (var i = 0; i < oTransaction.items.length; i = i + 1) {
    oClusterDef = oTransaction.items[i];

    if (oClusterDef) {
      oOverlay = emp.storage.findOverlay(oClusterDef.getOverlayId());

      if (oOverlay) {
        if (oOverlay.properties.hasOwnProperty('cluster')) {
          delete oOverlay.properties.cluster;
        }
        if (oOverlay.properties.hasOwnProperty('bClusterActive')) {
          delete oOverlay.properties.bClusterActive;
        }
      }
    }
  }
};


/**
 * Static Actions
 * @type {Object}
 * @property {method} add
 * @property {method} remove
 *
 */
emp.storage.staticContent = {};
emp.storage.staticContent.add = function(oTransaction) {
  var i;
  var item;
  var EmpStaticContent;
  var oEmpParent;
  var store = emp.storage._storage.store;
  var mapInstanceId = oTransaction.mapInstanceId;
  var sRootGUID = emp.storage.getRootGuid(mapInstanceId);

  for (i = 0; i < oTransaction.items.length; i = i + 1) {
    item = oTransaction.items[i];
    EmpStaticContent = store[item.coreId];

    if (EmpStaticContent) {
      //store[item.coreId].visible = item.visible;
    }
    else {
      EmpStaticContent = new emp.classLibrary.EmpStaticContent(item);

      if (item.coreParent === undefined) {
        if (emp.helpers.isEmptyString(item.parentId)) {
          if (!emp.helpers.isEmptyString(item.overlayId)) {
            item.coreParent = item.overlayId;
          }
          else {
            item.coreParent = sRootGUID;
          }
        }
        else {
          item.coreParent = item.parentId;
        }
      }

      oEmpParent = store[item.coreParent];

      if (oEmpParent === undefined) {
        oTransaction.fail({
          coreId: item.coreId,
          level: emp.typeLibrary.Error.level.MAJOR,
          message: 'Static content parent of ' + item.name + ' not found in storage.'
        });
      }
      else {
        store[EmpStaticContent.getCoreId()] = EmpStaticContent;
        oEmpParent.addChild(EmpStaticContent, item.visible);
      }
    }
  }
};

/**
 * Visibility Actions
 * @type {Object}
 * @property {function} set
 * @property {function} get
 */
emp.storage.visibility = {};

/**
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.visibility.set = function(oTransaction) {
  var iIndex;
  var oItem;
  var oStorageItem;
  var aoItems = oTransaction.items;
  var oNewItems = [];
  var sCoreId;
  var oParent;
  var oParentList;
  var oStatus;
  var oNewTrans = new emp.typeLibrary.Transaction({
    intent: emp.intents.control.MI_VISIBILITY_SET,
    mapInstanceId: oTransaction.mapInstanceId,
    source: emp.core.sources.CORE,
    items: oNewItems
  });

  var setChildVisibilityRecursive = function(oParentEntry) {
    var oChild, oChildList;

    if (oParentEntry.isOnMap(oTransaction.mapInstanceId)) {
      oChildList = oParentEntry.getChildrenList();
      for (sCoreId in oChildList) {
        if (oChildList.hasOwnProperty(sCoreId)) {
          oChild = emp.storage.get.id({
            id: sCoreId
          });
          if (oChild) {
            oChild.visibility(oNewTrans, oParentEntry.getCoreId(), oItem.visible, true);
            if (setChildVisibilityRecursive(oChild)) {
              return true;
            }
          }
          else {
            return false;
          }

        }
      }
    }
  };

  var setVisibilityTrans = function(oObject, oParentEntry, bVisibility, bTraceUp) {
    var oParentList;
    var sParentCoreId = oParentEntry.getCoreId();

    if (oParentEntry.isOnMap(oTransaction.mapInstanceId)) {

      oObject.visibility(oNewTrans, sParentCoreId, bVisibility, true);

      if (sParentCoreId === emp.storage.getRootGuid(oTransaction.mapInstanceId)) {
        return true;
      }

      if (bVisibility && bTraceUp) {
        // Its being made visible so we go up the tree.
        oParentList = oParentEntry.getParentRelationshipList();
        for (sCoreId in oParentList) {
          if (oParentList.hasOwnProperty(sCoreId)) {
            if (setVisibilityTrans(oParentEntry, emp.storage.get.id({
                id: sCoreId
              }), oItem.visible, bTraceUp)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  };

  if (oTransaction.source === emp.core.sources.CORE) {
    return;
  }

  for (iIndex = 0; iIndex < aoItems.length;) {
    oItem = aoItems[iIndex];

    if (emp.helpers.isEmptyString(oItem.featureId)) {
      oStorageItem = emp.storage.findOverlay(oItem.overlayId);
    }
    else {
      oStorageItem = emp.storage.findFeature(oItem.overlayId, oItem.featureId);
    }

    if (oStorageItem) {
      // Property created for messageComplete message population.
      oItem.targetAttributes = oStorageItem.getObjectData();
      oItem.coreId = oStorageItem.getCoreId();
      if (!oStorageItem.isOnMap(oTransaction.mapInstanceId)) {
        // The item is not on the map instance, so fail it.
        oTransaction.fail({
          coreId: oItem.coreId,
          level: emp.typeLibrary.Error.level.MAJOR,
          message: "Feature " + oStorageItem.getName() + " is not on the map instance provided."
        });
        continue;
      }

      oStatus = emp.storage.findParent(oTransaction.mapInstanceId, oStorageItem.getCoreObjectType(), oItem);

      if (!oStatus.success) {
        oTransaction.fail({
          coreId: oStatus.oError.coreId,
          level: oStatus.oError.level,
          message: oStatus.oError.message + " Visibility not set."
        });
        continue;
      }
      else {
        oParent = oStatus.parent;
      }

      if (!oParent) {
        // The parent was not provided so we set the visibility of the
        // object with all its parents.
        oParentList = oStorageItem.getParentRelationshipList();
        for (sCoreId in oParentList) {
          if (oParentList.hasOwnProperty(sCoreId)) {
            oParent = oStorageItem.getParent(sCoreId);
            setVisibilityTrans(oStorageItem, oParent, oItem.visible, true);
          }
        }
        // Property created for messageComplete message population.
        oItem.parentTargetAttributes = null;
        // In this case should the entire list of parents be used?
        oParent = oStorageItem.getParent(Object.keys(oStorageItem.options.parentObjects)[0]);
        // Check for root overlay
        if (!emp.storage.isRoot(oParent.options.coreId) &&
          !emp.wms.manager.isRootWMS(oParent.options.coreId)) {
          oItem.parentTargetAttributes = oParent.getObjectData();
        }
      }
      else {
        // The parent was identified change the visibility
        // of the relationship only.
        if (oParent.isParentOf(oStorageItem.getCoreId())) {
          setVisibilityTrans(oStorageItem, oParent, oItem.visible, false);
          oItem.coreParent = oParent.getCoreId();
          // Property created for messageComplete message population.
          oItem.parentTargetAttributes = oParent.getObjectData();
        }
        else {
          oTransaction.fail({
            coreId: oItem.coreId,
            level: emp.typeLibrary.Error.level.MAJOR,
            message: oParent.getName() + " is not a parent of " + oStorageItem.getName() + ". Visibility not set."
          });
          continue;
        }
      }

      if (oItem.recurse) {
        setChildVisibilityRecursive(oStorageItem);
      }
    }
    else if (emp.helpers.isEmptyString(oItem.featureId)) {
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Overlay does not exists."
      });
      continue;
    }
    else {
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Feature does not exists."
      });
      continue;
    }
    iIndex++;
  }
  oNewTrans.run();
};

/**
 * @param {emp.classLibrary.EmpRenderableObject} oParent
 * @param {boolean} bVisible
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.visibility.checkChildrenVisibility = function(oParent, bVisible, oTransaction) {
  var oChild;
  var oItem;
  var oaItems = oTransaction.items;
  var store = emp.storage._storage.store;

  if (oParent.hasChildren()) {
    for (var sCoreId in oParent.nodes) {
      // We need to make sure that this child is not on the list already.
      // To avoid an infinite loop do to parent loops.
      if (emp.helpers.findIndexOf(oaItems, 'coreId', sCoreId) === -1) {
        oChild = store[sCoreId];
        if (oChild.setVisibilityWithParent(oParent.coreId, bVisible)) {
          // Make a duplicate of the storage item.
          switch (oChild.getCoreObjectType()) {
            case emp.typeLibrary.types.FEATURE:
              oItem = oChild.getObjectData(oTransaction.mapInstanceId, oParent.getCoreId());
              oaItems.push(oItem);
              break;
            case emp.typeLibrary.types.OVERLAY:
              oItem = oChild.getObjectData(oTransaction.mapInstanceId, oParent.getCoreId());
              oaItems.push(oItem);
              if (oItem.coreParent !== emp.storage.getRootGuid(oTransaction.mapInstanceId)) {
                // We only send the root parent. All others
                // get placed on the duplicate list.
                oTransaction.duplicate(oItem.coreId);
              }
              break;
            case emp.typeLibrary.types.WMS:
            default:
              // This should never happen.
              continue;
          }
          oItem.visible = bVisible;
          oItem.coreParent = oParent.coreId;
          emp.storage.visibility.checkChildrenVisibility(oChild, bVisible, oTransaction);
        }
      }
    }
  }
};

/**
 * No longer used.
 * @deprecated
 * @param {object} args
 */
emp.storage.visibility.get = function(args) {
  var i;
  var store = emp.storage._storage.store;
  for (i = 0; i < args.items.length; i = i + 1) {
    args.items[i].visible = store[args.items[i].coreId].visible;
  }
};

/**
 * Retrieve the visibility state of the requested item or item instance.
 * An item instance will also carry the parentId in the transaction.  The
 * visibility state differs from visibility in that it may also indicate for
 * an instance that it is visible, but the parent has been turned off.  At
 * the end of the function the visibility state will be set in the transaction
 * response.
 *
 * @param {emp.typeLibrary.Transaction} transaction
 */
emp.storage.visibility.getState = function(transaction) {
  var store = emp.storage._storage.store,
    visible,
    parentObjects,
    visibilitySetting,
    visibilityState,
    target,
    parent;

  // retrieve if the item being queried is visible or not.
  target = store[transaction.items[0].coreId];

  // if we can't find the target in the storage engine, fail the transaction.
  if (target === undefined) {
    transaction.fail(new emp.typeLibrary.Error({
      coreId: transaction.items[0].coreId,
      level: emp.typeLibrary.Error.level.MINOR,
      message: "Could not find target on map"
    }));
  }
  else {
    visible = target.options.visibleOnMap[transaction.mapInstanceId];

    // if we can't find the target on the map, fail the transaction.
    if (visible === undefined) {
      transaction.fail(new emp.typeLibrary.Error({
        coreId: transaction.items[0].coreId,
        level: emp.typeLibrary.Error.level.MINOR,
        message: "Could not find target on map"
      }));
    }
    else {
      // Check to see if the transaction has a parentId parameter.  If it
      // does, then it is checking the visibility state of an instance.
      if (transaction.items[0].parentId) {

        // retrieve if the item being queried is visible or not.
        parent = store[transaction.items[0].parentId];

        // if the parent is not on the map raise an error, otherwise
        // check the visibility.
        if (parent) {

          // If it is not visible, we need to check the visibilitySetting.  the
          // visibilitySetting determines the actual state of the visibility under
          // a specific parent.  You can have an item's visibilityState to true,
          // but the parent is hidden so the feature turns off on the map.
          if (!visible) {

            parentObjects = store[transaction.items[0].coreId].options.parentObjects;
            visibilitySetting = parentObjects[transaction.items[0].parentId].options.visibilitySetting[transaction.mapInstanceId];

            // if the visibilitySetting is true, then this item was hidden its parents.
            // if the visibilitySetting is false the item was intentionally hidden.
            if (visibilitySetting === undefined) {
              transaction.fail(new emp.typeLibrary.Error({
                coreId: transaction.items[0].coreId,
                level: emp.typeLibrary.Error.level.MINOR,
                message: "Could not find parent on map"
              }));
            }
            else if (visibilitySetting === true) {
              visibilityState = emp3.api.enums.VisibilityStateEnum.VISIBLE_ANCESTOR_HIDDEN;
            }
            else {
              visibilityState = emp3.api.enums.VisibilityStateEnum.HIDDEN;
            }
          }
          else {
            visibilityState = emp3.api.enums.VisibilityStateEnum.VISIBLE;
          }
          transaction.items[0].visible = visibilityState;
        }
        else {
          transaction.fail(new emp.typeLibrary.Error({
            coreId: transaction.items[0].coreId,
            level: emp.typeLibrary.Error.level.MINOR,
            message: "Could not find parent on map"
          }));
        }
      }
      else {
        // The query is not asking for instance visibility, so simply check
        // to see if visibility is true or false and return the correct enumeration.
        if (visible) {
          visibilityState = emp3.api.enums.VisibilityStateEnum.VISIBLE;
        }
        else {
          visibilityState = emp3.api.enums.VisibilityStateEnum.HIDDEN;
        }
        transaction.items[0].visible = visibilityState;
      }
    }
  }
};

/**
 * Selection Actions
 * @type {Object}
 * @property {Array} _storage Local storage for selection
 * @property {method} set
 * @property {method} get
 */
emp.storage.selection = {};
emp.storage.selection._selectedList = {};

emp.storage.selection.getSelectedList = function(mapInstanceId) {
  if (!emp.storage.selection._selectedList.hasOwnProperty(mapInstanceId)) {
    emp.storage.selection._selectedList[mapInstanceId] = [];
  }

  return emp.storage.selection._selectedList[mapInstanceId];
};

emp.storage.selection.removeSelectedList = function(mapInstanceId) {
  if (emp.storage.selection._selectedList.hasOwnProperty(mapInstanceId)) {
    delete emp.storage.selection._selectedList[mapInstanceId];
  }
};

emp.storage.selection.getSelectionIndex = function(mapInstanceId, oSelection) {
  var iIndex;
  var oaSelectionList = emp.storage.selection.getSelectedList(mapInstanceId);
  var bNoSelectedId = emp.helpers.isEmptyString(oSelection.selectedId);

  for (iIndex = 0; iIndex < oaSelectionList.length; iIndex++) {
    if (oSelection.coreId === oaSelectionList[iIndex].coreId) {
      if (bNoSelectedId && emp.helpers.isEmptyString(oaSelectionList[iIndex].selectedId)) {
        return iIndex;
      }
      if (oSelection.selectedId === oaSelectionList[iIndex].selectedId) {
        return iIndex;
      }
    }
  }

  return -1;
};

emp.storage.selection.set = function(oTransaction) {

  var oaSelectionList = emp.storage.selection.getSelectedList(oTransaction.mapInstanceId);
  var oaItems = oTransaction.items;
  var sCoreID;
  var oSelectionItem;
  var oStorageItem;
  var iIndex;
  var iSelectionIndex;

  for (iIndex = 0; iIndex < oaItems.length; iIndex++) {
    oSelectionItem = oaItems[iIndex];
    sCoreID = oSelectionItem.coreId;

    if (sCoreID !== emp.typeLibrary.Selection._NOSELECT) {
      oStorageItem = emp.storage.findObject(sCoreID);

      if (oStorageItem && (oStorageItem.getCoreObjectType() === emp.typeLibrary.types.FEATURE)) {
        iSelectionIndex = emp.storage.selection.getSelectionIndex(oTransaction.mapInstanceId, oSelectionItem);
        if (oSelectionItem.select) {
          // Its being selected.
          if (iSelectionIndex === -1) {
            // Its not on the selection list.
            oaSelectionList.push(oSelectionItem);
          }
        }
        else {
          // Its being deselected.
          if (iSelectionIndex > -1) {
            // Its on the selection list. So we need to remove it.
            oaSelectionList.splice(iSelectionIndex, 1);
          }
        }
      }
    }
  }
};

/**
 *
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.selection.selectionChange = function(oTransaction) {

  var oaSelectionList = emp.storage.selection.getSelectedList(oTransaction.mapInstanceId);
  var oaItems = oTransaction.items;
  var sCoreID;
  var oSelectionItem;
  var oStorageItem;
  var oSelectList = [];
  var oDeselectList = [];
  var oSelectionTransaction;
  var oDeselectionTransaction;
  var iSelectionIndex;

  for (var iIndex = 0; iIndex < oaItems.length; iIndex++) {
    oSelectionItem = oaItems[iIndex];
    sCoreID = oSelectionItem.coreId;

    if (sCoreID !== emp.typeLibrary.Selection._NOSELECT) {
      oStorageItem = emp.storage.findObject(sCoreID);

      if (oStorageItem !== undefined) {
        iSelectionIndex = emp.storage.selection.getSelectionIndex(oTransaction.mapInstanceId, oSelectionItem);
        if (oSelectionItem.select) {
          // Its being selected.
          if (iSelectionIndex === -1) {
            // Its not on the selection list.
            oaSelectionList.push(oSelectionItem);
          }
          oSelectList.push(oSelectionItem);
        }
        else {
          // Its being deselected.
          if (iSelectionIndex > -1) {
            // Its on the selection list. So we need to remove it.
            oaSelectionList.splice(iSelectionIndex, 1);
          }
          oDeselectList.push(oSelectionItem);
        }
      }
    }
  }

  if (oSelectList.length > 0) {
    oSelectionTransaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.SELECTION_OUTBOUND,
      mapInstanceId: oTransaction.mapInstanceId,
      source: "CORE-EVENTING",
      sender: "EMP_MAP_CORE",
      items: oSelectList
    });
    oSelectionTransaction.run();
  }

  if (oDeselectList.length > 0) {
    oDeselectionTransaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.DESELECTION_OUTBOUND,
      mapInstanceId: oTransaction.mapInstanceId,
      source: "CORE-EVENTING",
      sender: "EMP_MAP_CORE",
      items: oDeselectList
    });
    oDeselectionTransaction.run();
  }
};

/**
 * Map Action
 * @type {Object}
 * @property {method} status
 */
emp.storage.map = {};
emp.storage.map.status = function() {};

/**
 * View Action
 * @type {Object}
 * @property {method} set
 * @property {method} get
 */
emp.storage.view = {};
emp.storage.view.set = function(args) {
  emp.storage._storage.currentView = args.items[0];
};
emp.storage.view.get = function() {};

/**
 * Status Action
 * @type {Object}
 * @property {method} set
 */
emp.storage._status = {};

emp.storage._status.set = function(args) {

  if (args === "replay") {
    emp.storage.replay();
  }

};

/**
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.editBegin = function(oTransaction) {
  var sCoreId;
  var oStorageEntry;

  if (oTransaction.items && (oTransaction.items.length > 0)) {
    sCoreId = oTransaction.items[0].coreId;
    oStorageEntry = emp.storage.get.id({
      id: sCoreId
    });

    if (oStorageEntry) {
      oStorageEntry.setEditMode(true);
    }
  }
};

/**
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.feature.validateUpdate = function(oTransaction) {
  var sDestOverlay;
  var sDestParentId;
  var oStorageEntry;
  var iIndex;
  var oItem;
  var oNewItem;
  var sErrorMsg;

  // Remember that this only applies to feature moves.
  // Overlay moves are handled in the validateOverlayUpdate.
  function isMoveValid(oFeature) {
    var oParent;
    var oChild;
    var sDestParentID = oFeature.destCoreParent;
    var oDestParent = emp.storage._storage.get({
      coreId: sDestParentID
    });

    sErrorMsg = "";

    if (sDestParentID === emp.storage.getRootGuid(oTransaction.mapInstanceId)) {
      if (oFeature.globalType === emp.typeLibrary.types.WMS) {
        oDestParent = emp.storage._storage.get({
          coreId: emp.wms.manager.getWmsOverlayId()
        });
      }
      else {
        sErrorMsg = "A feature item can not be moved to the root.";
        return false;
      }
    }
    else if (oDestParent === undefined) {
      // The destination parent does not exists.
      // However if their is a destOverlayId and no destParentId,
      // We can create the new parent overlay.
      if (oFeature.destParentId) {
        sErrorMsg = "Destination parent does not exists.";
        return false;
      }
      else {
        oFeature.createDestinationParent();
        oDestParent = emp.storage._storage.get({
          coreId: sDestParentID
        });
      }
      if (oDestParent === undefined) {
        sErrorMsg = "Destination parent overlay creation failed.";
        return false;
      }
    }

    // Now check to see if the feature is a WMS.
    // Its new parent MUST be an overlay.
    if ((oFeature.globalType === emp.typeLibrary.types.WMS) &&
      (oDestParent.globalType !== emp.typeLibrary.types.OVERLAY)) {
      sErrorMsg = "The parent of a WMS service MUST be an overlay.";
      return false;
    }

    // Make sure that the parent does not have a child with the same Id.
    var sCoreId;
    switch (oFeature.globalType) {
      case emp.typeLibrary.types.FEATURE:
        for (sCoreId in oDestParent.nodes) {
          oChild = oDestParent.nodes[sCoreId];

          if ((oChild.globalType === emp.typeLibrary.types.FEATURE) &&
            (oChild.featureId === oFeature.featureId)) {
            sErrorMsg = "Move would create a duplicate ID under destination parent.";
            return false;
          }
          else if ((oChild.globalType === emp.typeLibrary.types.WMS) &&
            (oChild.id === oFeature.featureId)) {
            sErrorMsg = "Move would create a duplicate ID under destination parent.";
            return false;
          }
        }
        break;
      case emp.typeLibrary.types.WMS:
        for (sCoreId in oDestParent.nodes) {
          oChild = oDestParent.nodes[sCoreId];

          if ((oChild.globalType === emp.typeLibrary.types.WMS) &&
            (oChild.id === oFeature.id)) {
            sErrorMsg = "Move would create a duplicate ID under destination parent.";
            return false;
          }
          else if ((oChild.globalType === emp.typeLibrary.types.FEATURE) &&
            (oChild.featureId === oFeature.id)) {
            sErrorMsg = "Move would create a duplicate ID under destination parent.";
            return false;
          }

        }
        break;
    }

    // Make sure that this move does not create a "paradox".
    // I.E. the feature does not end up being his own ancestor.

    oParent = oDestParent;
    switch (oFeature.globalType) {
      case emp.typeLibrary.types.FEATURE:
        while (oParent && (oParent.coreId !== emp.storage.getRootGuid(oTransaction.mapInstanceId))) {
          if ((oParent.globalType === emp.typeLibrary.types.FEATURE) &&
            (oParent.featureId === oFeature.featureId) &&
            (oParent.overlayId === oFeature.destOverlayId)
          ) {
            sErrorMsg = "Move would cause a parent child loop.";
            return false;
          }
          oParent = emp.storage._storage.get({
            coreId: oParent.coreParent
          });
        }
        break;
      case emp.typeLibrary.types.WMS:
        while (oParent && (oParent.coreId !== emp.storage.getRootGuid(oTransaction.mapInstanceId))) {
          if ((oParent.globalType === emp.typeLibrary.types.WMS) &&
            (oParent.id === oFeature.id) &&
            (oParent.overlayId === oFeature.destOverlayId)) {
            // This should never happen.
            sErrorMsg = "Move would cause a parent child loop.";
            return false;
          }
          oParent = emp.storage._storage.get({
            coreId: oParent.coreParent
          });
        }
        break;
    }

    return true;
  }

  if (oTransaction.items && (oTransaction.items.length > 0)) {
    for (iIndex = 0; iIndex < oTransaction.items.length;) {
      oItem = oTransaction.items[iIndex];

      oStorageEntry = emp.storage.get.byIds(oItem);

      if (oStorageEntry === undefined) {
        oTransaction.fail({
          coreId: oItem.coreId,
          level: emp.typeLibrary.Error.level.MAJOR,
          message: "Feature does not exists."
        });
        continue;
      }
      else {
        sDestOverlay = oItem.destOverlayId;
        sDestParentId = oItem.destParentId;
        switch (oStorageEntry.getCoreObjectType()) {
          case emp.typeLibrary.types.FEATURE:
            if (oStorageEntry.isMultiParentRequired()) {
              oTransaction.fail({
                coreId: oItem.coreId,
                level: emp.typeLibrary.Error.level.MAJOR,
                message: "Operation not supported on multi parented objects."
              });
              continue;
            }
            oNewItem = oStorageEntry.getObjectData(oTransaction.mapInstanceId, oItem.coreParent);

            var oPayload = {
              newOverlayId: oItem.destOverlayId,
              newParentId: oItem.destParentId
            };

            if (oItem.name) {
              oPayload.name = oItem.name;
            }

            oNewItem.applyUpdate(oPayload);

            break;
          case emp.typeLibrary.types.WMS:
            if (sDestParentId) {
              // The user wanted to place this under a feature.
              // We must fail it.
              oTransaction.fail({
                coreId: oItem.coreId,
                level: emp.typeLibrary.Error.level.MAJOR,
                message: "A WMS can not be a child of a feature."
              });
              continue;
            }
            oNewItem = oStorageEntry.getObjectData(oTransaction.mapInstanceId, oItem.coreParent);

            if (oItem.name !== undefined) {
              oNewItem.name = oItem.name;
            }

            break;
          default:
            oTransaction.fail({
              coreId: oItem.coreId,
              level: emp.typeLibrary.Error.level.MAJOR,
              message: "Invalid object type retrieved from storage engine."
            });
            continue;
        }
        oTransaction.items[iIndex] = oNewItem;
      }

      if (oStorageEntry && (sDestOverlay || sDestParentId)) {
        // This one is being re-parented.
        // Check to see if its invalid.
        if (oStorageEntry.isInEditMode()) {
          oTransaction.fail([{
            coreId: oNewItem.coreId,
            level: emp.typeLibrary.Error.level.MAJOR,
            message: "Update failed, the Feature is being edited."
          }]);
        }
        else if (!isMoveValid(oNewItem)) {
          oTransaction.fail({
            coreId: oNewItem.coreId,
            level: emp.typeLibrary.Error.level.MAJOR,
            message: sErrorMsg
          });
        }
        else {
          iIndex++;
        }
      }
      else {
        iIndex++;
      }
    }
  }
};

/**
 * @param {string} sCoreId
 * @param {string} coreParentId
 * @returns {*}
 */
emp.storage.overlay.validateParent = function(sCoreId, coreParentId) {
  // Remember that this only applies to overlay moves.
  // Feature moves are handled in the feature.update.
  var oParentCheck;
  var aParentList;
  var iIndex;
  var oRetStatus = true;
  var oParent = emp.storage.findObject(coreParentId);

  if (sCoreId === coreParentId) {
    // The overlay can't be its own ancestor.
    return {
      success: false,
      errorMsg: "An overlay cannot be its own ancestor."
    };
  }


  if (emp.helpers.isEmptyString(coreParentId)) {
    // We reached the root.
    return true;
  }

  oParentCheck = oParent.getParent(sCoreId);

  if (oParentCheck) {
    // The overlay can't be its own ancestor.
    return {
      success: false,
      errorMsg: "An overlay cannot be its own ancestor."
    };
  }

  aParentList = oParent.getParentCoreIds();

  for (iIndex = 0; iIndex < aParentList.length; iIndex++) {
    oRetStatus = emp.storage.overlay.validateParent(sCoreId, aParentList[iIndex]);
    if (oRetStatus !== true) {
      break;
    }
  }

  return oRetStatus;
};

/**
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.overlay.validateUpdate = function(oTransaction) {
  var oItem;
  var oNewItem;
  var oStorageItem;
  var oParentValid;
  var oaItems = oTransaction.items;
  var mapInstanceId = oTransaction.mapInstanceId;

  for (var iIndex = 0; iIndex < oaItems.length;) {
    // Go thru all the items and see if any of them are being
    // re-parented.
    oItem = oaItems[iIndex];
    oStorageItem = emp.storage.findOverlay(oItem.overlayId);

    if (oStorageItem === undefined) {
      // We got an update for something that does not exists.
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Overlay does not exists."
      });
      continue;
    }
    else if (oStorageItem.getCoreObjectType() !== emp.typeLibrary.types.OVERLAY) {
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Storage contains an object with the same ID that is not an overlay."
      });
      continue;
    }
    else if (!emp.helpers.isEmptyString(oItem.parentId) && (oStorageItem.parentCount() > 1)) {
      // This one is being moved but it has more that 1 parent.
      // Fail it.
      // we do not support re-parenting multi-parent overlays.
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Move operation on an overlay with more than 1 parent is not supported."
      });
      continue;
    }
    else {
      if (!emp.helpers.isEmptyString(oItem.parentId)) {
        switch (oItem.parentId) {
          case emp.constant.parentIds.ALL_PARENTS:
          case emp.constant.parentIds.MAP_LAYER_PARENT:
            oTransaction.fail({
              coreId: oItem.coreId,
              level: emp.typeLibrary.Error.level.MAJOR,
              message: "Invalid parentId for overlay move. Overlay update canceled."
            });
            continue;
          case emp.constant.parentIds.MAP_ROOT:
            oItem.parentId = emp.storage.getRootGuid(mapInstanceId);
            oItem.coreParent = oItem.parentId;
            break;
          default:
            oItem.coreParent = oItem.parentId;
            break;
        }

        // Check to see if its a valid parent.
        oParentValid = emp.storage.overlay.validateParent(oStorageItem.getCoreId(), oItem.coreParent);
        if (oParentValid !== true) {
          oTransaction.fail({
            coreId: oItem.coreId,
            level: emp.typeLibrary.Error.level.MAJOR,
            message: oParentValid.errorMsg
          });
          continue;
        }
      }

      oNewItem = oStorageItem.getObjectData(mapInstanceId, oItem.coreParent);
      if (oItem.name) {
        oNewItem.name = oItem.name;
      }

      if (oItem.hasOwnProperty('properties')) {
        oNewItem.properties = oItem.properties;

        if (oStorageItem.getProperties().hasOwnProperty('cluster')) {
          oNewItem.properties.cluster = oStorageItem.getProperties().cluster;
          oNewItem.properties.bClusterActive = oStorageItem.getProperties().bClusterActive;
        }
      }

      if (oItem.hasOwnProperty('menuId')) {
        oNewItem.menuId = oItem.menuId;
      }

      oaItems[iIndex] = oNewItem;
      oItem = oNewItem;
    }

    iIndex++;
  }
};

/**
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.editTransCplt = function(oTransaction) {
  var sCoreId, iIndex;
  var oStorageEntry;

  if (oTransaction.items && (oTransaction.items.length > 0)) {
    for (iIndex = 0; iIndex < oTransaction.items.length; iIndex++) {
      sCoreId = oTransaction.items[iIndex].coreId;
      oStorageEntry = emp.storage.get.id({
        id: sCoreId
      });

      if (oStorageEntry) {
        oStorageEntry.setEditMode(false);
      }
    }
  }

  if (oTransaction.failures && (oTransaction.failures.length > 0)) {
    for (iIndex = 0; iIndex < oTransaction.failures.length; iIndex++) {

      sCoreId = oTransaction.failures[iIndex].coreId;
      oStorageEntry = emp.storage.get.id({
        id: sCoreId
      });

      if (oStorageEntry) {
        oStorageEntry.setEditMode(false);
      }
    }
  }
};

/**
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.validateEdit = function(oTransaction) {
  var oStorageEntry;
  var oEditItem;
  var oParent;

  // We must validate the edit structure.  If the originalFeature is not present,
  // The feature does not exists.
  for (var iIndex = 0; iIndex < oTransaction.items.length;) {
    oEditItem = oTransaction.items[iIndex];

    oStorageEntry = emp.storage.findFeature(oEditItem.overlayId, oEditItem.featureId);

    if (oStorageEntry === undefined) {
      oTransaction.fail([{
        coreId: oEditItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Feature does not exist."
      }]);
      continue;
    }
    else if (oStorageEntry.isInEditMode()) {
      oTransaction.fail([{
        coreId: oEditItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Feature is already being edited."
      }]);
      continue;
    }
    else if (!oStorageEntry.canMapEngineEdit(oTransaction.mapInstanceId)) {
      // The current map can't edit this feature.
      oTransaction.fail([{
        coreId: oEditItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Current map does not support editing a feature of this type."
      }]);
      continue;
    }
    oParent = emp.storage.findParentOnMap(oTransaction.mapInstanceId, oStorageEntry);
    oEditItem.originFeature = oStorageEntry.getObjectData(oTransaction.mapInstanceId, oParent.getCoreId());

    iIndex++;
  }
};

/**
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.validateDraw = function(oTransaction) {
  for (var iIndex = 0; iIndex < oTransaction.items.length; iIndex++) {
    var oDrawItem = oTransaction.items[iIndex];
    var oFeature = emp.storage.findFeature(oDrawItem.overlayId, oDrawItem.featureId);

    if (oFeature) {
      // There is a feature with this overlay, feature Id.
      switch (oFeature.getFormat()) {
        case emp.typeLibrary.featureFormatType.GEOJSON:
        case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
        case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
        case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
        case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
        case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
        case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
        case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
        case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
        case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
        case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
          // We must set the draw coreId to the features coreId.
          oDrawItem.coreId = oFeature.coreId;
          oDrawItem.parentCoreId = oFeature.parentCoreId;
          break;
        default:
          oTransaction.fail([{
            coreId: oDrawItem.coreId,
            level: emp.typeLibrary.Error.level.MAJOR,
            message: "A draw operation is not supported on feature " + oFeature.featureId + " due to it having a format of: " + oFeature.format + ". Please see documentation for a list of feature formats that support drawing."
          }]);
          iIndex--;
          continue;
      }
    }
    else if (!((oDrawItem.overlayId === undefined) ||
        (oDrawItem.overlayId === null))) {
      // They provided an overlayId.
      var oOverlay = emp.storage.findOverlay(oDrawItem.overlayId);

      if (oOverlay !== undefined) {
        oDrawItem.parentCoreId = oOverlay.coreId;

        /*
        if (oOverlay.isMultiParentRequired())
        {
            // If the overlay is multi-parent set it to MP.
            oDrawItem.properties.multiParentRequired = true;
            // Its a multi-parent draw make sure that the overlay Id
            // is set to the root MP overlay.
            // And we need to store the original overlay and parent ID.
            oDrawItem.originalOverlayId = oDrawItem.overlayId;
            oDrawItem.parentCoreId = oOverlay.getRootCoreId();
            oDrawItem.overlayId = oDrawItem.parentCoreId;
        }
        else if (oDrawItem.properties.hasOwnProperty('multiParentRequired'))
        {
            // Else remove the property so its not MP.
            delete oDrawItem.properties.multiParentRequired;
        }
        */
      }
      /**
      else if (oDrawItem.properties.hasOwnProperty('multiParentRequired'))
      {
          // Else remove the property so its not MP.
          delete oDrawItem.properties.multiParentRequired;
          oDrawItem.parentCoreId = oFeature.overlayId;
      }
      **/
      else {
        oDrawItem.parentCoreId = oFeature.overlayId;
      }
    }
    /**
    else if (oDrawItem.properties.hasOwnProperty('multiParentRequired'))
    {
        // Else if it has MP remove the property so its not MP.
        delete oDrawItem.properties.multiParentRequired;
    }
    **/
  }
};

/**
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.overlay.remove = function(oTransaction) {

  var oStorageEntry;
  var oaItems = oTransaction.items;
  var aMapList, aPrevMapList;
  var mapInstanceId = oTransaction.mapInstanceId;
  var iIndex;
  var oItem;
  var oParent;
  var oTransactions = {};

  for (iIndex = 0; iIndex < oaItems.length;) {
    oItem = oaItems[iIndex];
    oStorageEntry = emp.storage.findOverlay(oItem.overlayId);

    if (oStorageEntry === undefined) {
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Overlay remove: overlay " + oItem.overlayId + " not found."
      });
      continue;
    }

    if (!emp.helpers.isEmptyString(oItem.parentId)) {
      // If it has a parent overlay, get it.
      oParent = emp.storage.findOverlay(oItem.parentId);
      if (oParent === undefined) {
        oTransaction.fail({
          coreId: oItem.coreId,
          level: emp.typeLibrary.Error.level.MAJOR,
          message: "Unable to find parent overlay of overlay " + oStorageEntry.getName() + "."
        });
        continue;
      }
    }
    else {
      oParent = emp.storage.findOverlay(emp.storage.getRootGuid(mapInstanceId));

      if (oParent === undefined) {
        new emp.typeLibrary.Error({
          level: emp.typeLibrary.Error.level.CATASTROPHIC,
          message: "Unable to find map instance root (" + emp.storage.getRootGuid(mapInstanceId) + ") for overlay " + oStorageEntry.getName() + "."
        });
        oTransaction.fail({
          coreId: oItem.coreId,
          level: emp.typeLibrary.Error.level.MAJOR,
          message: "Unable to find map root of overlay " + oStorageEntry.getName() + "."
        });
        continue;
      }
    }

    if (!oParent.isParentOf(oStorageEntry.getCoreId())) {
      // The identified parent is not a parent of the storage object.
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: oParent.getName() + " is not a parent of feature " + oStorageEntry.getName() + "."
      });
      continue;
    }
    aPrevMapList = oStorageEntry.getParentMapInstanceList();

    oParent.removeChild(oStorageEntry);

    aMapList = oStorageEntry.getParentMapInstanceList();

    emp.storage.processRequest(oTransactions, aPrevMapList, aMapList, oParent, oStorageEntry, false);
    /*
            // This next loop will eliminate from aPrevMapList the instances
            // that are in aMapList. Therefore the remaining ones are
            // those map instances that the feature must be removed from.
            for (iMapIndex = 0; iMapIndex < aMapList.length; iMapIndex++) {
                iTempIndex = aPrevMapList.indexOf(aMapList[iMapIndex]);
                if (iTempIndex !== -1) {
                    // Remove the element.
                    aPrevMapList.splice(iTempIndex, 1);
                }
            }

            // The following loop creates the remove transaction.
            for (iMapIndex = 0; iMapIndex < aPrevMapList.length; iMapIndex++) {
                emp.storage.addToRemoveTransaction(oTransactions, aPrevMapList[iMapIndex], oParent, oStorageEntry);
            }
    */
    if (aMapList.length === 0) {
      // The storage entry has no more parents.
      // Delete all children with no other parents.
      emp.storage.removeParentFromChildren(oStorageEntry);
      // Now delete the item
      emp.storage.deleteObject(oStorageEntry);
    }

    aMapList = oParent.getParentMapInstanceList();

    // Loop thru the maps of the parent to send an update so the UI
    // can update.  <--- took this out because remove is already updating the item now.
    /*
    for (iMapIndex = 0; iMapIndex < aMapList.length; iMapIndex++) {
        emp.storage.addToObjectUpdateTransaction(oTransactions, aMapList[iMapIndex], oParent);
    }
    */

    //console.log("   DELETED " + oItem.name + " (" + oItem.coreId + ").");
    iIndex++;
  }

  emp.storage.executeTransactions(oTransactions);
};

/**
 * @param {emp.classLibrary.EmpRenderableObject} oParent
 */
emp.storage.removeParentFromChildren = function(oParent) {
  var oChild;

  if (oParent.hasChildren()) {
    // This parent is being removed, so we must take it off of the
    // parent list of all its children.
    var coreIdList = oParent.getChildrenCoreIds();

    for (var iIndex = 0; iIndex < coreIdList.length; iIndex++) {
      oChild = oParent.getChild(coreIdList[iIndex]);
      oParent.removeChild(oChild);

      if (!oChild.hasParents()) {
        // This child has no more parents.
        // So before we remove it we must remove all its children.
        emp.storage.removeParentFromChildren(oChild);
        emp.storage.deleteObject(oChild);
      }
    }
  }
};

/**
 * This function validates features adds before they are sent to the map.
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.feature.validateAdd = function(oTransaction) {
  var oItems = oTransaction.items;
  var oStorageEntry;
  var oItem;
  var oParent;
  var mapInstanceId = oTransaction.mapInstanceId;

  for (var iIndex = 0; iIndex < oItems.length;) {
    oItem = oItems[iIndex];

    // Find the parent.
    oParent = emp.storage.get.id({
      id: oItem.coreParent
    });

    if (oItem.parentId && (oItem.coreParent === undefined)) {
      // This feature is being add to a parent feature that does not exists.
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "The parent feature (" + oItem.parentId + ") of feature " + oItem.name + " does not exists."
      });
      continue;
    }
    else if ((oParent !== undefined) && oParent.options.coreId === oItem.coreId) {
      // Attempting to add feature as it's own child
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Cannot set a feature as a child of itself: " + oItem.name + "."
      });
      return false;
    }
    else if ((oParent === undefined) && (oItem.parentId === undefined)) {
      // Specific parent identification was not provided.
      switch (oItem.overlayId) {
        case emp.constant.parentIds.ALL_PARENTS:
        case undefined:
          // This is an update if all parents are being addressed, therefore the feature MUST exists.
          // So we must find the feature in storage or fail the item.
          oStorageEntry = emp.storage.findFeature(undefined, oItem.featureId);
          if (!oStorageEntry) {
            oTransaction.fail({
              coreId: oItem.coreId,
              level: emp.typeLibrary.Error.level.MAJOR,
              message: "Invalid parent for new feature (" + oItem.name + ")."
            });
            continue;
          }
          delete oItem['overlayId'];
          delete oItem['parentId'];
          delete oItem['coreParent'];
          break;
        case emp.constant.parentIds.MAP_ROOT:
          oTransaction.fail({
            coreId: oItem.coreId,
            level: emp.typeLibrary.Error.level.MAJOR,
            message: "Features can not be added to the root of the map."
          });
          continue;
        default:
          // Its a feature added to an overlay that does not exists.
          emp.storage.overlay.createOverlay(mapInstanceId, oItem.overlayId, oTransaction.sender);
          oParent = emp.storage.findObject(oItem.coreParent);

          if (oParent === undefined) {
            // Failed to create the parent overlay.
            oTransaction.fail({
              coreId: oItem.coreId,
              level: emp.typeLibrary.Error.level.MAJOR,
              message: "Unable to create parent overlay of this feature (" + oItem.name + ")."
            });
            continue;
          }
          break;
      }
    }
    iIndex++;
  }
};

/**
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.overlay.validateAdd = function(oTransaction) {
  // This function validates overlay adds before they are sent to th map.
  var oItems = oTransaction.items;
  var mapInstanceId = oTransaction.mapInstanceId;
  var oItem;
  var oParent;
  var rootCoreId = emp.storage.getRootGuid(mapInstanceId);

  for (var iIndex = 0; iIndex < oItems.length;) {
    oItem = oItems[iIndex];

    if (oItem.parentId !== undefined) {
      // If it has a parentId set it.
      oItem.coreParent = oItem.parentId;
      oItem.parentCoreId = oItem.coreParent;
    }
    else {
      oItem.coreParent = rootCoreId;
      oItem.parentCoreId = undefined;
    }

    if (oItem.coreParent !== rootCoreId) {
      oParent = emp.storage.findObject(oItem.coreParent);

      if (oParent !== undefined) {
        // The parent exists. Now see if it is visible
        // If the parent is not visible the feature cant be.
        //oItem.visible = (oParent.visible? oItem.visible: false);
      }
      else {
        switch (oItem.overlayId) {
          case emp.constant.parentIds.MAP_ROOT:
            break;
          case emp.constant.parentIds.ALL_PARENTS:
          case undefined:
            break;
          default:
            // The parent does not exists.
            emp.storage.overlay.createOverlay(mapInstanceId, oItem.parentId, oTransaction.sender);

            // Now it should exists. If not fail.
            oParent = emp.storage.findObject(oItem.parentId);

            if (oParent === undefined) {
              oTransaction.fail({
                coreId: oItem.coreId,
                level: emp.typeLibrary.Error.level.MAJOR,
                message: "Unable to create parent of this overlay (" + oItem.name + ")."
              });
              continue;
            }
            break;
        }
      }
    }
    iIndex++;
  }
};

/**
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.overlay.validateCluster = function(oTransaction) {
  // This function validates overlay adds before they are sent to th map.
  var oItems = oTransaction.items;
  var oItem;
  var oOverlay;

  for (var iIndex = 0; iIndex < oItems.length; iIndex++) {
    oItem = oItems[iIndex];
    oOverlay = emp.storage.get.id({
      id: oItem.coreId
    });

    if (!oOverlay) {
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Cluster Set failed. Overlay does NOT exists."
      });
      iIndex--;
    }
    else if (oOverlay.isMultiParentRequired()) {
      if (oOverlay.coreParent !== emp.storage.getRootGuid(oTransaction.mapInstanceId)) {
        oTransaction.fail({
          coreId: oItem.coreId,
          level: emp.typeLibrary.Error.level.MAJOR,
          message: "Only the root multi-parent overlay can be clustered."
        });
        iIndex--;
      }
    }
  }
};

/**
 * @param mapInstanceId
 * @param objectType
 * @param oItem
 * @returns {{success: boolean, parent: undefined, oError: {coreId: *, level: (emp.typeLibrary.Error.level|number), message: string}}}
 */
emp.storage.findParent = function(mapInstanceId, objectType, oItem) {
  var oReturnStatus = {
    success: false,
    parent: undefined,
    oError: {
      coreId: oItem.coreId,
      level: emp.typeLibrary.Error.level.MAJOR,
      message: "Parent not found."
    }
  };

  if (oItem.hasOwnProperty('parentId')) {
    if (objectType === emp.typeLibrary.types.OVERLAY) {
      switch (oItem.parentId) {
        case emp.constant.parentIds.ALL_PARENTS:
          // For all parents we leave the oParent undefined.
          oReturnStatus.success = true;
          break;
        case emp.constant.parentIds.MAP_ROOT:
          oReturnStatus.success = true;
          oReturnStatus.parent = emp.storage.findOverlay(emp.storage.getRootGuid(mapInstanceId));
          break;
        default:
          if (!emp.helpers.isEmptyString(oItem.parentId)) {
            oReturnStatus.parent = emp.storage.findOverlay(oItem.parentId);
            if (oReturnStatus.parent === undefined) {
              oReturnStatus.oError = {
                coreId: oItem.coreId,
                level: emp.typeLibrary.Error.level.MAJOR,
                message: "Parent overlay " + oItem.parentId + " not found."
              };
            }
            else {
              oReturnStatus.success = true;
            }
          }
          else {
            oReturnStatus.oError = {
              coreId: oItem.coreId,
              level: emp.typeLibrary.Error.level.MAJOR,
              message: "Invalid parent Id for overlay."
            };
          }
          break;
      }
    }
    else if (objectType === emp.typeLibrary.types.FEATURE) {
      switch (oItem.parentId) {
        case emp.constant.parentIds.ALL_PARENTS:
        case emp.constant.parentIds.MAP_ROOT:
          oReturnStatus.success = true;
          break;
        default:
          if (!emp.helpers.isEmptyString(oItem.parentId)) {
            oReturnStatus.parent = emp.storage.findFeature(oItem.overlayId, oItem.parentId);

            if (oReturnStatus.parent === undefined) {
              oReturnStatus.oError = {
                coreId: oItem.coreId,
                level: emp.typeLibrary.Error.level.MAJOR,
                message: "Parent feature " + oItem.parentId + " not found."
              };
            }
            else {
              oReturnStatus.success = true;
            }
          }
          break;
      }
    }
  }
  else if (oItem.hasOwnProperty('overlayId')) {
    if (objectType === emp.typeLibrary.types.FEATURE) {

      switch (oItem.overlayId) {
        case emp.constant.parentIds.ALL_PARENTS:
          oReturnStatus.success = true;
          break;
        case emp.constant.parentIds.MAP_ROOT:
          oReturnStatus.oError = {
            coreId: oItem.coreId,
            level: emp.typeLibrary.Error.level.MAJOR,
            message: "Feature " + oItem.featureId + " is not at the map root."
          };
          break;
        default:
          if (!emp.helpers.isEmptyString(oItem.overlayId)) {
            oReturnStatus.parent = emp.storage.findOverlay(oItem.overlayId);
            if (!oReturnStatus.parent) {
              oReturnStatus.oError = {
                coreId: oItem.coreId,
                level: emp.typeLibrary.Error.level.MAJOR,
                message: "Parent Overlay " + oItem.overlayId + " not found."
              };
            }
            else {
              oReturnStatus.success = true;
            }
          }
          break;
      }
    }
  }

  return oReturnStatus;
};

/**
 * @namespace
 * @memberof emp.storage
 */
emp.storage.mapservice = {};

/**
 *
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.mapservice.validateAdd = function(oTransaction) {
  var oItem;
  var iIndex;
  var oStorageEntry;
  var oaItems = oTransaction.items;

  for (iIndex = 0; iIndex < oaItems.length;) {
    oItem = oaItems[iIndex];

    oStorageEntry = emp.storage.get.id({
      id: oItem.coreId
    });

    if (oStorageEntry &&
      (oStorageEntry.getCoreObjectType() !== emp.typeLibrary.types.WMS)) {
      // The item has an ID which is a duplicate of an item in storage that is not a WMS.
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "MapService feature id is duplicate."
      });
      continue;
    }

    switch (oItem.overlayId) {
      case emp.constant.parentIds.ALL_PARENTS:
        if (!oStorageEntry) {
          // The WMS does not exists so change the overlay ID
          oItem.overlayId = emp.constant.parentIds.MAP_LAYER_PARENT;
        }
        break;
      case emp.constant.parentIds.MAP_ROOT:
        oTransaction.fail({
          coreId: oItem.coreId,
          level: emp.typeLibrary.Error.level.MAJOR,
          message: "Invalid overlay Id for WMS feature."
        });
        continue;
      case emp.constant.parentIds.MAP_LAYER_PARENT:
        break;
      case undefined:
        if (!oStorageEntry) {
          // The WMS does not exists so change the overlay ID
          oItem.overlayId = emp.constant.parentIds.MAP_LAYER_PARENT;
        }
        else {
          // It does exists so we process it as an update.
          oItem.overlayId = emp.constant.parentIds.ALL_PARENTS;
        }
        break;
      default:
        break;
    }

    iIndex++;
  }
};

/**
 *
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.mapservice.add = function(oTransaction) {
  var oItem;
  var iIndex;
  var oParent;
  var oStorageEntry;
  var oMapIdList, oPrevMapList;
  var oaItems = oTransaction.items;
  var mapInstanceId = oTransaction.mapInstanceId;
  var oTransactions = {};

  for (iIndex = 0; iIndex < oaItems.length;) {
    oItem = oaItems[iIndex];

    oStorageEntry = emp.storage.get.id({
      id: oItem.coreId
    });

    switch (oItem.overlayId) {
      case emp.constant.parentIds.ALL_PARENTS:
        // Its an update.
        break;
      case emp.constant.parentIds.MAP_LAYER_PARENT:
        oItem.coreParent = emp.wms.manager.getWmsOverlayId(mapInstanceId);
        oParent = emp.storage.findOverlay(emp.wms.manager.getWmsOverlayId(mapInstanceId));
        break;
      default:
        oParent = emp.storage.findOverlay(oItem.overlayId);

        if (!oParent) {
          // The overlay indicated does not exists.
          // We must create it.
          emp.storage.overlay.createOverlay(mapInstanceId, oItem.overlayId, oTransaction.sender);
          oParent = emp.storage.get.id({
            id: oItem.overlayId
          });

          if (oParent === undefined) {
            // Failed to create the parent overlay.
            oTransaction.fail({
              coreId: oItem.coreId,
              level: emp.typeLibrary.Error.level.MAJOR,
              message: "Unable to create parent overlay of WMS feature (" + oItem.url + ")."
            });
            continue;
          }

        }
        oItem.coreParent = oItem.overlayId;
        break;
    }

    oPrevMapList = [];

    if (oStorageEntry) {
      oStorageEntry.update(oItem);
      oPrevMapList = oStorageEntry.getParentMapInstanceList();
    }
    else {
      switch (oItem.type) {
        case 'wms':
          oStorageEntry = new emp.classLibrary.EmpWMS(oItem);
          emp.storage._storage.set(oStorageEntry);
          break;
        case 'wmts':
          oStorageEntry = new emp.classLibrary.EmpWMTS(oItem);
          emp.storage._storage.set(oStorageEntry);
          break;
        case 'kml':
          oStorageEntry = new emp.classLibrary.EmpKmlLayer(oItem);
          emp.storage._storage.set(oStorageEntry);
          break;
      }

    }

    if (oParent && !oParent.isParentOf(oStorageEntry)) {

      switch (oItem.type) {
        case 'wms':
          oParent.addChild(oStorageEntry, oItem.visible &&
            (oStorageEntry.hasLayers() || oStorageEntry.hasVisibleLayers()));
          break;
        case 'wmts':
        case 'kml':
          oParent.addChild(oStorageEntry, oItem.visible);
          break;
      }

    }

    oMapIdList = oStorageEntry.getParentMapInstanceList();

    emp.storage.processRequest(oTransactions, oPrevMapList, oMapIdList, oParent, oStorageEntry);

    iIndex++;
  }

  emp.storage.executeTransactions(oTransactions);
};

/**
 *
 * @param {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.mapservice.remove = function(oTransaction) {
  var oItem;
  var iIndex;
  var oMapIdList, oPrevMapIdList;
  var oStorageEntry;
  var oParent;
  var oaItems = oTransaction.items;
  var mapInstanceId = oTransaction.mapInstanceId;
  var oTransactions = {};

  for (iIndex = 0; iIndex < oaItems.length;) {
    oItem = oaItems[iIndex];

    oStorageEntry = emp.storage.get.id({
      id: oItem.coreId
    });

    if (!oStorageEntry) {
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "WMS feature not found."
      });
      continue;
    }

    switch (oItem.overlayId) {
      case emp.constant.parentIds.ALL_PARENTS:
        oTransaction.fail({
          coreId: oItem.coreId,
          level: emp.typeLibrary.Error.level.MAJOR,
          message: "Invalid overlay id. WMS feature not removed."
        });
        continue;
      case emp.constant.parentIds.MAP_LAYER_PARENT:
        oItem.coreParent = emp.wms.manager.getWmsOverlayId(mapInstanceId);
        oParent = emp.storage.findOverlay(oItem.coreParent);
        break;
      default:
        oParent = emp.storage.findOverlay(oItem.overlayId);
        oItem.coreParent = oItem.overlayId;
        break;
    }

    if (!oParent) {
      // Failed to find the parent overlay.
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MAJOR,
        message: "Parent overlay not found. WMS feature not removed."
      });
      continue;
    }

    if (!oParent.isParentOf(oStorageEntry.getCoreId())) {
      oTransaction.fail({
        coreId: oItem.coreId,
        level: emp.typeLibrary.Error.level.MINOR,
        message: "Overlay " + oParent.getName() + " is not a parent of WMS " + oStorageEntry.getName() + ". WMS feature not removed."
      });
      continue;
    }

    oPrevMapIdList = oStorageEntry.getParentMapInstanceList();
    oParent.removeChild(oStorageEntry);
    oMapIdList = oStorageEntry.getParentMapInstanceList();

    emp.storage.processRequest(oTransactions, oPrevMapIdList, oMapIdList, oParent, oStorageEntry);

    if (oStorageEntry.parentCount() === 0) {
      // The storage entry has no more parents.
      // Delete all children with no other parents.
      emp.storage.removeParentFromChildren(oStorageEntry);
      // Now delete the item
      emp.storage.deleteObject(oStorageEntry);
    }

    iIndex++;
  }

  emp.storage.executeTransactions(oTransactions);
};
