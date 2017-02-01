/* globals emp */

/**
 * @namespace
 * @memberOf emp.storage
 * @type {Object}
 */
emp.storage.get = {};

/**
 * Used to get id straight from storage
 * @param  {object} args
 * @returns {emp.typeLibrary.base}
 */
emp.storage.get.id = function (args) {

    return emp.storage._storage.store[args.id];
};

/**
 * Used to get by id straight from storage
 * @param  {object} args
 * @return {object}
 */
emp.storage.get.byIds = function (args) {

    var sOverlayId = args.overlayId;
    var sFeatureId = args.featureId;

    if (sFeatureId !== undefined)
    {
        return emp.storage.findFeature(sOverlayId, sFeatureId);
    }
    else
    {
        return emp.storage.findOverlay(sOverlayId);
    }
};

/**
 * Used to get selection from storage engine
 * @param  {emp.typeLibrary.Transaction} oTransaction
 * @return {void}
 */
emp.storage.get.selected = function (oTransaction) {
    var iIndex;
    var oaSelectionList = emp.storage.selection.getSelectedList(oTransaction.mapInstanceId);
    var returnVar = {
        features: []
    };
    if (oaSelectionList.length > 0) {
        for (iIndex = 0; iIndex < oaSelectionList.length; iIndex++) {
            returnVar.features.push(oaSelectionList[iIndex]);
        }
    }

    oTransaction.items[0].features = returnVar.features;
};

/**
 * @param {emp.classLibrary.EmpFeature} oFeature
 * @param sFeatureId
 * @returns {*}
 */
emp.storage.findFeatureUnderFeature = function(oFeature, sFeatureId)
{
    var oChild;

    for(var sCoreId in oFeature.nodes)
    {
        oChild = oFeature.nodes[sCoreId];
        switch (oChild.globalType)
        {
            case emp.typeLibrary.types.FEATURE:
                if (oChild.featureId === sFeatureId)
                {
                    // We found it.
                    return oChild;
                }
                else
                {
                    oChild = emp.storage.findFeatureUnderFeature(oChild, sFeatureId);
                    if (oChild)
                    {
                        // We found it.
                        return oChild;
                    }
                }
                break;
        }
    }

    return undefined;
};

/**
 * @param {emp.classLibrary.EmpOverlay} oOverlay
 * @param {string} sFeatureId
 * @returns {*}
 */
emp.storage.findFeatureUnderOverlay = function(oOverlay, sFeatureId)
{
/*
    if (oOverlay.featureList[sFeatureId] !== undefined)
    {
        return oOverlay.featureList[sFeatureId].feature;
    }
    return undefined;
*/
    return emp.storage._storage.store[sFeatureId];
};

/**
 * Retrieves the feature stored in the {@link emp.storage._storage.store} by its coreId
 * @param {string} sOverlayId unused
 * @param {string} sFeatureId coreId of the feature
 * @returns {emp.classLibrary.EmpRenderableObject}
 */
emp.storage.findFeature = function(sOverlayId, sFeatureId)
{
/*
    var oOverlay = emp.storage.findOverlay(sOverlayId);

    if (oOverlay)
    {
        var oFeature = emp.storage.findFeatureUnderOverlay(oOverlay, sFeatureId);
        return oFeature;
    }
*/
    return emp.storage._storage.store[sFeatureId];
};

/**
 * Retrieves the overlay stored in the {@link emp.storage._storage.store} by its coreId
 * @param {string} sOverlayId coreId to search for
 * @returns {emp.classLibrary.EmpRenderableObject}
 */
emp.storage.findOverlay = function(sOverlayId)
{
    return emp.storage._storage.store[sOverlayId];
};

/**
 * Retrieves the object stored in the {@link emp.storage._storage.store} by its coreId
 * @param {string} sCoreId coreId to search for
 * @returns {emp.classLibrary.EmpRenderableObject}
 */
emp.storage.findObject = function(sCoreId)
{
    return emp.storage._storage.store[sCoreId];
};

/**
 * Stores an object in the {@link emp.storage._storage.store}, indexed by its coreId
 * @param {emp.classLibrary.EmpRenderableObject} oEmpObject
 */
emp.storage.storeObject = function(oEmpObject)
{
    emp.storage._storage.store[oEmpObject.getCoreId()] = oEmpObject;
};

/**
 * Deletes an entry in the {@link emp.storage._storage.store}. You must clean up parent and child references in other
 * objects before using this method.
 * @param {emp.classLibrary.EmpRenderableObject} oEmpObject
 */
emp.storage.deleteObject = function(oEmpObject)
{
    if (emp.storage._storage.store.hasOwnProperty(oEmpObject.getCoreId()))
    {
        delete emp.storage._storage.store[oEmpObject.getCoreId()];
    }
};

/**
 *
 * @param sMapInstanceId
 * @param {emp.classLibrary.EmpRenderableObject} oStorageEntry
 * @returns {*}
 */
emp.storage.findParentOnMap = function(sMapInstanceId, oStorageEntry) {
    var oParent;
    var iParentIndex = 0;
    var iParentCnt = oStorageEntry.parentCount();

    oParent = oStorageEntry.getParentByIndex(iParentIndex);
    while (iParentIndex < iParentCnt) {
        if  (oParent.isOnMap(sMapInstanceId)) {
            return oParent;
        }
        iParentIndex++;
        oParent = oStorageEntry.getParentByIndex(iParentIndex);
    }

    return undefined;
};

/**
 * @param {string} sMapInstanceId
 * @param {emp.classLibrary.EmpRenderableObject} oStorageEntry
 * @returns {*}
 */
emp.storage.findParentOverlayOnMap = function(sMapInstanceId, oStorageEntry) {
    var oParent;
    var iParentIndex = 0;
    var iParentCnt = oStorageEntry.parentCount();
    var oEntry = oStorageEntry;

    while (iParentIndex < iParentCnt) {
        oParent = oEntry.getParentByIndex(iParentIndex);
        // Find a parent that is on this map instance.
        if (!oParent.isOnMap(sMapInstanceId)) {
            iParentIndex++;
            continue;
        }
        // Find a parent that is an overlay.
        if (oParent.getCoreObjectType() === emp.typeLibrary.types.OVERLAY) {
            return oParent;
        } else {
            // Its not an overlay.
            // Get its parent and check again.
            oEntry = oParent;
            iParentCnt = oEntry.parentCount();
            iParentIndex = 0;
        }
    }

    return undefined;
};
