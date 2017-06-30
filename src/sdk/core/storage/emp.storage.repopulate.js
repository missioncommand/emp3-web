/* globals emp */
/**
 * Used to replay storage to the engine after a swap has occurred.
 *
 * @type {Object}
 * @protected
 * @property {method} structure Used to generate the right order of objects
 * @property {method} fire Start lobbing objects at the engine
 * @property {method} start Used to swap target on intent workflows
 * @property {method} stop Used to swap target back on replay end
 *
 */
emp.storage._replay = {};

emp.storage.MapReload = function(InstanceId) {
    var _struct = [];
    var mapInstanceId = InstanceId;
    var iItemsSent = 0;
    var iItemsCompleted = 0;
    var iMaxItemsPerIteration = 100;
    var hReloadTimer = null;

    var publicInterface = {
        /**
         * @memberof emp.storage.MapReload#
         */
        startFireTimer: function() {
            var oThis = this;

            setTimeout(function(){ oThis.fire();}, 50);
        },
        /**
         * @memberof emp.storage.MapReload#
         */
        structure: function() {
            var oaLevels = [],
                currentCoreId,
                iCurrentLevel = 0;
            var oDupItem;
            var rootCoreId = emp.storage.getRootGuid(mapInstanceId);
            var oRootOverlay = emp.storage.findObject(rootCoreId);
            var oRootFeatureList = oRootOverlay.getChildrenList();

            oaLevels[iCurrentLevel] = {
                    overlays: [],
                    features: [],
                    wms:[],
                    wmts:[]
            };
            oDupItem = oRootOverlay.getObjectData(mapInstanceId, undefined);
            oDupItem.parentCoreId = undefined;
            oaLevels[iCurrentLevel].overlays.push(oDupItem);

            iCurrentLevel++;

            var buildStructure = function (iLevel, oFeatureList) {
                var oStorageEntry;

                if (!oaLevels[iLevel]) {
                    oaLevels[iLevel] = {
                        overlays: [],
                        features: [],
                        wms:[],
                        wmts:[]
                    };
                }

                for (currentCoreId in oFeatureList) {
                    if (!oFeatureList.hasOwnProperty(currentCoreId))
                    {
                        continue;
                    }

                    oStorageEntry = oFeatureList[currentCoreId];

                    if (!oStorageEntry.isDisabled()) {
                        switch (oStorageEntry.getCoreObjectType()) {
                            case emp.typeLibrary.types.OVERLAY:
                                // Only the top level overlay is sent to the map instance.
                                break;
                            case emp.typeLibrary.types.FEATURE:
                                if (emp.helpers.canMapEnginePlotFeature(mapInstanceId, oStorageEntry))
                                {
                                    // Send it to the map if it can plot it.
                                    oDupItem = oStorageEntry.getObjectData(mapInstanceId, rootCoreId);
                                    oDupItem.parentCoreId = rootCoreId;
                                    oaLevels[iLevel].features.push(oDupItem);
                                }
                                break;
                            case emp.typeLibrary.types.WMS:
                                if (emp.helpers.canMapEnginePlotFeature(mapInstanceId, oStorageEntry))
                                {
                                    // Send it to the map if it can plot it.
                                    var sWMSParentID = rootCoreId;
                                    var oWMSParent = oStorageEntry.getParentByIndex(0);
                                    var sWMSOverlayId = emp.wms.manager.getWmsOverlayId(mapInstanceId);

                                    if (sWMSOverlayId === oWMSParent.getCoreId()) {
                                        sWMSParentID = sWMSOverlayId;
                                    }
                                    oDupItem = oStorageEntry.getObjectData(mapInstanceId, sWMSParentID);
                                    oDupItem.parentCoreId = rootCoreId;
                                    oaLevels[iLevel].wms.push(oDupItem);
                                }
                                break;
                                case emp.typeLibrary.types.WMTS:
                                    if (emp.helpers.canMapEnginePlotFeature(mapInstanceId, oStorageEntry))
                                    {
                                        // Send it to the map if it can plot it.
                                        var sWMTSParentID = rootCoreId;
                                        var oWMTSParent = oStorageEntry.getParentByIndex(0);
                                        var sWMTSOverlayId = emp.wms.manager.getWmsOverlayId(mapInstanceId);

                                        if (sWMTSOverlayId === oWMTSParent.getCoreId()) {
                                            sWMTSParentID = sWMTSOverlayId;
                                        }
                                        oDupItem = oStorageEntry.getObjectData(mapInstanceId, sWMTSParentID);
                                        oDupItem.parentCoreId = rootCoreId;
                                        oaLevels[iLevel].wmts.push(oDupItem);
                                    }
                                    break;
                        }
                        buildStructure(iLevel + 1, oStorageEntry.getChildrenList());
                    }
                }

                if ((oaLevels[iLevel].overlays.length === 0) &&
                          (oaLevels[iLevel].features.length === 0) &&
                          (oaLevels[iLevel].wms.length === 0) &&
                      (oaLevels[iLevel].wmts.length === 0)) {
                    oaLevels.splice(iLevel, 1);
                }
            };

            buildStructure(iCurrentLevel, oRootFeatureList);
            _struct = oaLevels;
        },
        /**
         * @memberof emp.storage.MapReload#
         */
        fire: function () {
            var oTransaction;
            var oFeatures;
            var oItem;
            var data = _struct;
            var itemCount = 0;
            var sPreviousType = "";
            var sCurrentType;
            var sTransID = emp.helpers.id.newGUID();
            var rootId = emp.storage.getRootGuid(mapInstanceId);
            var oThis = this;

            if ((data === undefined) || (data === null) || (data.length === 0))
            {
                if (iItemsSent === iItemsCompleted)
                {
                    clearTimeout(hReloadTimer);
                    this.stop();
                }
                else
                {
                    hReloadTimer = setTimeout(function(){ oThis.fire();}, 100);
                }
                return;
            }
            else
            {
                for (var i = 0; i < data.length;) {
                    var oOverlays = [],
                        wmsServices = [],
                        wmtsServices = [];
                    oFeatures = [];

                    while (((data[i].overlays.length > 0) ||
                            (data[i].features.length > 0) ||
                            (data[i].wms.length > 0) ||
                            (data[i].wmts.length > 0)) &&
                            (itemCount < iMaxItemsPerIteration)) {
                        if (data[i].overlays.length > 0) {
                            oItem = data[i].overlays[0];
                            sCurrentType = emp.typeLibrary.types.OVERLAY;
                        } else if (data[i].features.length > 0) {
                            oItem = data[i].features[0];
                            sCurrentType = emp.typeLibrary.types.FEATURE;
                        } else if (data[i].wmts.length > 0){
                            oItem = data[i].wmts[0];
                            sCurrentType = emp.typeLibrary.types.WMTS;
                        }
                        else {
                            oItem = data[i].wms[0];
                            sCurrentType = emp.typeLibrary.types.WMS;
                        }

                        if ((sPreviousType !== "") &&
                                (sPreviousType !== sCurrentType))
                        {
                            // If the previous one we sent is not of the same type
                            // stop and wait for the completion.
                            // we can only have 1 transaction outstanding.
                            break;
                        }

                        sPreviousType = sCurrentType;
                        itemCount++;

                        switch (sCurrentType) {
                            case  emp.typeLibrary.types.FEATURE:
                                oItem.zoom = false;
                                oFeatures.push(oItem);
                                oItem.parentCoreId = rootId;
                                data[i].features.splice(0, 1); // Remove the first value
                                break;
                            case emp.typeLibrary.types.OVERLAY:
                                oOverlays.push(oItem);
                                data[i].overlays.splice(0, 1); // Remove the first value
                                break;
                            case emp.typeLibrary.types.WMS:
                                wmsServices.push(oItem);
                                data[i].wms.splice(0, 1); // Remove the first value
                                break;
                            case emp.typeLibrary.types.WMTS:
                                wmtsServices.push(oItem);
                                data[i].wmts.splice(0, 1); // Remove the first value
                                break;
                        }
                    }

                    if (oOverlays.length > 0) {
                        oTransaction = new emp.typeLibrary.Transaction({
                            intent: emp.intents.control.MI_OVERLAY_ADD,
                            mapInstanceId: mapInstanceId,
                            source: emp.core.sources.STORAGE,
                            transactionId: sTransID,
                            items: oOverlays
                        });
                        iItemsSent += oOverlays.length;
                        //console.log("SE reload Overlays " + itemCount + " fire Sent:" + emp.storage._replay.iItemsSent + ". Completed:" + emp.storage._replay.iItemsCompleted);
                        oTransaction.run();
                    }

                    if (oFeatures.length > 0)
                    {
                        oTransaction  = new emp.typeLibrary.Transaction({
                            intent: emp.intents.control.MI_FEATURE_ADD,
                            mapInstanceId: mapInstanceId,
                            source: emp.core.sources.STORAGE,
                            transactionId: sTransID,
                            items: oFeatures
                        });
                        iItemsSent += oFeatures.length;
                        //console.log("SE reload Feature " + itemCount + " fire Sent:" + emp.storage._replay.iItemsSent + ". Completed:" + emp.storage._replay.iItemsCompleted);
                        oTransaction.run();
                    }

                    if (wmsServices.length > 0)
                    {
                        oTransaction  = new emp.typeLibrary.Transaction({
                            intent: emp.intents.control.MI_WMS_ADD,
                            mapInstanceId: mapInstanceId,
                            source: emp.core.sources.STORAGE,
                            transactionId: sTransID,
                            items: wmsServices
                        });
                        iItemsSent += wmsServices.length;
                        //console.log("SE reload WMS " + itemCount + " fire Sent:" + emp.storage._replay.iItemsSent + ". Completed:" + emp.storage._replay.iItemsCompleted);
                        oTransaction.run();
                    }

                    if (wmtsServices.length > 0)
                    {
                        oTransaction  = new emp.typeLibrary.Transaction({
                            intent: emp.intents.control.MI_WMTS_ADD,
                            mapInstanceId: mapInstanceId,
                            source: emp.core.sources.STORAGE,
                            transactionId: sTransID,
                            items: wmtsServices
                        });
                        iItemsSent += wmtsServices.length;
                        //console.log("SE reload WMS " + itemCount + " fire Sent:" + emp.storage._replay.iItemsSent + ". Completed:" + emp.storage._replay.iItemsCompleted);
                        oTransaction.run();
                    }

                    if ((data[i].overlays.length === 0) &&
                            (data[i].features.length === 0) &&
                            (data[i].wms.length === 0) &&
                            (data[i].wmts.length === 0))
                    {
                        //console.log("Drop a level");
                        data.splice(i, 1); //Remove the index.
                        if (itemCount === 0)
                        {
                            if ((iItemsSent === iItemsCompleted) && (i >= data.length))
                            {
                                clearTimeout(hReloadTimer);
                                this.stop();
                            }
                            continue;
                        }
                    }
                    break; // exit and wait for transaction completes.
                }
            }
        },
        /**
         * @memberof emp.storage.MapReload#
         */
        start: function () {
            // Reset the transaction count.
            iItemsCompleted = 0;
            iItemsSent = 0;

            emp.transactionQueue.listener.add({
                type: emp.intents.control.MI_OVERLAY_ADD,
                mapInstanceId: mapInstanceId,
                callback: emp.storage.processTransactionComplete
            });
            emp.transactionQueue.listener.add({
                type: emp.intents.control.MI_FEATURE_ADD,
                mapInstanceId: mapInstanceId,
                callback: emp.storage.processTransactionComplete
            });
            emp.transactionQueue.listener.add({
                type: emp.intents.control.MI_WMS_ADD,
                mapInstanceId: mapInstanceId,
                callback: emp.storage.processTransactionComplete
            });
            emp.transactionQueue.listener.add({
                type: emp.intents.control.MI_WMTS_ADD,
                mapInstanceId: mapInstanceId,
                callback: emp.storage.processTransactionComplete
            });
        },
        /**
         * @memberof emp.storage.MapReload#
         */
        stop: function () {
            emp.transactionQueue.listener.remove({
                type: emp.intents.control.MI_OVERLAY_ADD,
                mapInstanceId: mapInstanceId,
                callback: emp.storage.processTransactionComplete
            });
            emp.transactionQueue.listener.remove({
                type: emp.intents.control.MI_FEATURE_ADD,
                mapInstanceId: mapInstanceId,
                callback: emp.storage.processTransactionComplete
            });
            emp.transactionQueue.listener.remove({
                type: emp.intents.control.MI_WMS_ADD,
                mapInstanceId: mapInstanceId,
                callback: emp.storage.processTransactionComplete
            });
            emp.transactionQueue.listener.remove({
                type: emp.intents.control.MI_WMTS_ADD,
                mapInstanceId: mapInstanceId,
                callback: emp.storage.processTransactionComplete
            });

            var oTransaction = new emp.typeLibrary.Transaction({
                intent: emp.intents.control.STORAGE_RELOAD_COMPLETE,
                mapInstanceId: mapInstanceId,
                source: emp.core.sources.STORAGE,
                items: []
            });
            oTransaction.run();

            delete emp.storage._replay[mapInstanceId];
        },
        /**
         * @memberof emp.storage.MapReload#
         */
        processTransactionComplete: function (oTransaction) {
            var oErrorInfo;
            var oStorageEntry;
            var oThis = this;

            switch (oTransaction.intent) {
                case emp.intents.control.MI_FEATURE_ADD:
                case emp.intents.control.MI_OVERLAY_ADD:
                case emp.intents.control.MI_WMTS_ADD:
                case emp.intents.control.MI_WMS_ADD:
                    clearTimeout(hReloadTimer);
                    if ((oTransaction.failures !== undefined) &&
                            (oTransaction.failures !== null) &&
                            (oTransaction.failures.length > 0))
                    {
                        while (oTransaction.failures.length > 0)
                        {
                            // if the map returns a failure (which should be in our array)
                            // we take that failure and put it back in the list and mark it as
                            // disabled.
                            oErrorInfo = oTransaction.failures.splice(0,1)[0];
                            if (oErrorInfo.coreId) {
                                oStorageEntry = emp.storage.get.id({id: oErrorInfo.coreId});
                                oStorageEntry.setDisabled(true);
                                iItemsCompleted++;
                            }
                        }
                    }
                    iItemsCompleted += (oTransaction.items.length);
                    //console.log("SE TC Sent:" + emp.storage._replay.iItemsSent + ". Completed:" + emp.storage._replay.iItemsCompleted);

                    if (iItemsSent === iItemsCompleted)
                    {
                        hReloadTimer = setTimeout(function(){oThis.fire();}, 100);
                    }
                    break;
            }
        }
    };

    return publicInterface;
};


/**
 * Used to catch all transaction completes during
 * reload.
 * @param  {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.processTransactionComplete = function (oTransaction) {
    if (emp.storage._replay.hasOwnProperty(oTransaction.mapInstanceId))
    {
        emp.storage._replay[oTransaction.mapInstanceId].processTransactionComplete(oTransaction);
    }
};

/**
 * Main entry for replay
 * @public
 */
emp.storage.reload = function (instanceId) {
    if (!emp.storage._replay.hasOwnProperty(instanceId))
    {
        emp.storage._replay[instanceId] = new emp.storage.MapReload(instanceId);
    }

    emp.storage._replay[instanceId].start();
    emp.storage._replay[instanceId].structure();
    emp.storage._replay[instanceId].startFireTimer();
};

emp.storage._dropStaticContent = function(oStorageEntry) {
    var oChildEntry;
    var iIndex;
    var aChildCoreIdList = oStorageEntry.getChildrenCoreIds();

    for (iIndex = 0; iIndex < aChildCoreIdList.length; iIndex++)
    {
        oChildEntry = emp.storage.findObject(aChildCoreIdList[iIndex]);

        if (oChildEntry)
        {
            emp.storage._dropStaticContent(oChildEntry);

            if (oChildEntry.getCoreObjectType() === emp.typeLibrary.types.STATIC)
            {
                //Take it off its parents child list.
                oChildEntry.removeFromAllParent();
                // Now delete the item
                emp.storage.deleteObject(oChildEntry);
            }
        }
    }
};

emp.storage.prepForMapSwap = function(instanceId) {

    var oStore = emp.storage._storage.store;
    var oStorageEntry = oStore[emp.storage.getRootGuid(instanceId)];

    emp.storage._dropStaticContent(oStorageEntry);
};
