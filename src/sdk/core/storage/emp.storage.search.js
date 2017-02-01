/**
 * @constructs emp.storage.searchEngine
 * @param sMapInstanceId
 * @param {object} oSearchCriteria
 * @param {number} oSearchCriteria.maxResults
 * @returns {object}
 */
emp.storage.searchEngine = function(sMapInstanceId, oSearchCriteria) {
    var mapInstanceId = sMapInstanceId;
    var sRootCoreId = emp.storage.getRootGuid(mapInstanceId);
    var oCriteria = oSearchCriteria;

    /** This associative array will hold all object that have been searched. This avoids infinite loops. */
    var searchedEntries = {};

    /**
     * @description This function does a type match search on the children of the storage entry object passed in.
     * @param {Array<emp.classLibrary.EmpRenderableObject>} oCurrentResultSet This
     * parameter is an array of object that satisfy the search.
     * @param {Array<String>} oTypes is an array of strings containing the types to match.
     * @param {number} iMaxResults The maximum number of results the caller wants.
     * @param {emp.classLibrary.EmpRenderableObject} oStorageEntry The parent object to search.
     */
    var searchChildren = function(oCurrentResultSet, oTypes, iMaxResults, oStorageEntry) {
        var sCoreId;
        /** @type {emp.classLibrary.EmpRenderableObject} */
        var oChild;
        var oChildList;

        if (searchedEntries[oStorageEntry.getCoreId()] !== undefined) {
            // This Entry has been searched.
            return;
        }

        searchedEntries[oStorageEntry.getCoreId()] = oStorageEntry;

        if (oStorageEntry.hasChildren()) {
            oChildList = oStorageEntry.getChildrenList();

            for (sCoreId in oChildList) {
                if (!oChildList.hasOwnProperty(sCoreId)) {
                    continue;
                }
                oChild = oChildList[sCoreId];

                if (oChild) {
                    if (globalTypeMatch(oChild, oTypes)) {
                        // Its a match, add it if its not on the list.
                        if (oCurrentResultSet.indexOf(oChild) === -1) {
                            if (!emp.storage.isRoot(oChild.options.coreId)) {
                                oCurrentResultSet.push(oChild);
                            }
                        }
                    }

                    if (iMaxResults !== undefined) {
                        // Check to see if we have a max results and if so
                        // Exit the storage loop if we have reached the max requested.
                        if (oCurrentResultSet.length >= iMaxResults) {
                            break;
                        }
                    }

                    searchChildren(oCurrentResultSet, oTypes, iMaxResults, oChild);
                }
            }
        }
    };

    /**
     * @description This function does a type match search on the children of the storage entry object passed in.
     * @param {Array<emp.classLibrary.EmpRenderableObject>} oCurrentResultSet This
     * parameter is an array of object that satisfy the search.
     * @param {Array<String>} oTypes is an array of strings containing the types to match.
     * @param {number} iMaxResults The maximum number of results the caller wants.
     * @param {emp.classLibrary.EmpRenderableObject} oStorageEntry The parent object to search.
     * @param {boolean} bRecursive True if the search is to be recursive into the children of the children.
     */
    var findChildrenNoFilter = function(oCurrentResultSet, oTypes, iMaxResults, oStorageEntry, bRecursive) {
        var sCoreId;
        var oChild;
        var oChildList;

        if (searchedEntries[oStorageEntry.getCoreId()] !== undefined) {
            // This Entry has been searched.
            return;
        }

        searchedEntries[oStorageEntry.getCoreId()] = oStorageEntry;

        if (oStorageEntry.hasChildren()) {
            oChildList = oStorageEntry.getChildrenList();

            for (sCoreId in oChildList) {
                if (!oChildList.hasOwnProperty(sCoreId)) {
                    continue;
                }
                oChild = oChildList[sCoreId];

                if (oChild){
                    if (globalTypeMatch(oChild, oTypes)) {
                        // Its a match, add it if its not on the list.
                        if (oCurrentResultSet.indexOf(oChild) === -1) {
                            if (!emp.storage.isRoot(oChild.options.coreId) &&
                                !emp.wms.manager.isRootWMS(oChild.options.coreId) &&
                                !oChild.options.hidden) {
                                oCurrentResultSet.push(oChild);
                            }

                            if (iMaxResults !== undefined) {
                                // Check to see if we have a max results and if so
                                // Exit the storage loop if we have reached the max requested.
                                if (oCurrentResultSet.length >= iMaxResults) {
                                    break;
                                }
                            }
                        }

                        if (bRecursive) {
                            findChildrenNoFilter(oCurrentResultSet, oTypes, iMaxResults, oChild, bRecursive);
                        }
                    } else if (bRecursive) {
                        findChildrenNoFilter(oCurrentResultSet, oTypes, iMaxResults, oChild, bRecursive);
                    }
                }
            }
        }
    };

    /**
     * @description This function does a type and filter match search on the children of the storage entry object passed in.
     * @param {Array<emp.classLibrary.EmpRenderableObject>} oCurrentResultSet This
     * parameter is an array of object that satisfy the search.
     * @param {Array<String>} oTypes is an array of strings containing the types to match.
     * @param {Array<object>} oFilter An array of {property, term} objects to filter the search.
     * @param {number} iMaxResults The maximum number of results the caller wants.
     * @param {emp.classLibrary.EmpRenderableObject} oStorageEntry The parent object to search.
     */
    var searchChildrenWithFilter = function(oCurrentResultSet, oTypes, oFilter, iMaxResults, oStorageEntry) {
        var sCoreId;
        var oChild;
        var oChildList;

        if (searchedEntries[oStorageEntry.getCoreId()] !== undefined) {
            // This Entry has been searched.
            return;
        }

        searchedEntries[oStorageEntry.getCoreId()] = oStorageEntry;

        if (oStorageEntry.hasChildren()) {
            oChildList = oStorageEntry.getChildrenList();

            for (sCoreId in oChildList) {
                if (!oChildList.hasOwnProperty(sCoreId)) {
                    continue;
                }
                oChild = oChildList[sCoreId];

                if (oChild) {
                    if (globalTypeMatch(oChild, oTypes)) {
                        if (oFilter.length > 0) {
                            if (passesFilters(oChild, oFilter)) {
                                // Its a match, add it if its not on the list.
                                if (oCurrentResultSet.indexOf(oChild) === -1) {
                                    if (!emp.storage.isRoot(oChild.options.coreId)) {
                                        oCurrentResultSet.push(oChild);
                                    }
                                }
                            }
                        } else {
                            // Its a match, add it if its not on the list.
                            if (oCurrentResultSet.indexOf(oChild) === -1) {
                                if (!emp.storage.isRoot(oChild.options.coreId)) {
                                    oCurrentResultSet.push(oChild);
                                }
                            }
                        }
                    }

                    if (iMaxResults !== undefined) {
                        // Check to see if we have a max results and if so
                        // Exit the storage loop if we have reached the max requested.
                        if (oCurrentResultSet.length >= iMaxResults) {
                            break;
                        }
                    }

                    searchChildrenWithFilter(oCurrentResultSet, oTypes, oFilter, iMaxResults, oChild);
                }
            }
        }
    };

    /**
     * @description This function searches the parents of the feature looking for a parent feature with the given featureId.
     * @param {emp.classLibrary.EmpFeature} oStorageEntry A feature object we need to search the parents.
     * @param {String} sFeatureId The feature Id to compare with.
     * @returns {Boolean}
     */
    var passesFeatureIdFilter = function(oStorageEntry, sFeatureId) {
        var oParent;
        var sParentCoreId;
        var oParentRelationshipList = oStorageEntry.getParentRelationshipList();

        // Cycle thru all the parents.
        for (sParentCoreId in oParentRelationshipList) {
            if (!oParentRelationshipList.hasOwnProperty(sParentCoreId)) {
                continue;
            }
            oParent = emp.storage.findObject(sParentCoreId);

            // We are looking for a feature that has the given featureId.
            // This is in case a feature is the child of more than one feature.
            if (oParent.getCoreObjectType() === emp.typeLibrary.types.FEATURE) {
                if (oParent.getFeatureId() === sFeatureId) {
                    return true;
                }
            }
        }

        return false;
    };

    /**
     * @description This function searches for a parents of the Entry for a parent overlay with the given overlay Id.
     * @param {emp.classLibrary.EmpRenderableObject} oStorageEntry an  object we need to search its parents.
     * @param {String} sOverlayId
     * @returns {Boolean}
     */
    var passesOverlayIdFilter = function(oStorageEntry, sOverlayId) {
        var oParent;
        var sParentCoreId;
        var oParentRelationshipList = oStorageEntry.getParentRelationshipList();

        // Cycle thru all the parents
        for (sParentCoreId in oParentRelationshipList) {
            if (!oParentRelationshipList.hasOwnProperty(sParentCoreId)) {
                continue;
            }
            oParent = emp.storage.findObject(sParentCoreId);

            // We are looking for an overlay with the given overlayId
            if (oParent.getCoreObjectType() === emp.typeLibrary.types.OVERLAY) {
                if (sOverlayId === undefined) {
                    // If its undefined we are looking for the root.
                    if (oParent.getOverlayId() === sRootCoreId) {
                        return true;
                    }
                } else if (oParent.getOverlayId() === sOverlayId) {
                    return true;
                }
            } else if (oParent.getCoreObjectType() === emp.typeLibrary.types.FEATURE) {
                // If this parent is a feature (which will only happen if the
                // original was a feature, we need to continue up all parents
                // to compare with the first overlay we find up the tree.
                if (passesOverlayIdFilter(oParent, sOverlayId)) {
                    return true;
                }
            }
        }

        return false;
    };

    var passesFilter = function(oStorageEntry, oFilter) {
        switch (oStorageEntry.getCoreObjectType()) {
            case emp.typeLibrary.types.FEATURE:
                switch (oFilter.property) {
                    case 'overlayId':
                        return passesOverlayIdFilter(oStorageEntry, oFilter.term);
                    case 'parentId':
                        if (oFilter.term === undefined) {
                            return true;
                        }
                        return passesFeatureIdFilter(oStorageEntry, oFilter.term);
                }
                break;
            case emp.typeLibrary.types.OVERLAY:
                switch (oFilter.property) {
                    case 'parentId':
                        if (oFilter.term === undefined) {
                            return true;
                        }
                        return passesOverlayIdFilter(oStorageEntry, oFilter.term);
                }
                break;
        }

        return oStorageEntry.compareProperty(mapInstanceId, oFilter.property, oFilter.term);
    };

    var passesFilters = function(oStorageEntry, aoFilters) {
        var iIndex;

        if (aoFilters.length === 0) {
            return true;
        }

        for (iIndex = 0; iIndex < aoFilters.length; iIndex++) {
            if (!passesFilter(oStorageEntry, aoFilters[iIndex])) {
                return false;
            }
        }

        return true;
    };

    /**
     *
     * @param {emp.classLibrary.EmpRenderableObject[]} oCurrentResultSet
     * @param {string[]} oTypes
     * @param oaPropertyFilter
     * @param {number} iMaxResults
     * @param {emp.classLibrary.EmpRenderableObject} oStorageEntry
     * @param {boolean} bRecurse
     */
    var searchEntry = function(oCurrentResultSet, oTypes, oaPropertyFilter, iMaxResults, oStorageEntry, bRecurse) {
        var aParentList,
            i;

        if (globalTypeMatch(oStorageEntry, oTypes)) {
            if (oaPropertyFilter.length > 0) {
                // if there are property filters check if its passes them.
                if (passesFilters(oStorageEntry, oaPropertyFilter)) {
                    if (!emp.storage.isRoot(oStorageEntry.options.coreId)) {
                        oCurrentResultSet.push(oStorageEntry);
                    }
                }
                if (bRecurse) {
                    // Now we check its children.
                    searchChildrenWithFilter(oCurrentResultSet, oTypes, oaPropertyFilter, iMaxResults, oStorageEntry);
                }
            } else {

                // verify this storage entry is on a specified map.  We can do this by verifying if a map instance was passed
                // into the search

                if (mapInstanceId) {
                    aParentList = oStorageEntry.getParentMapInstanceList();

                    for (i = 0; i < aParentList.length; i += 1) {
                        if (aParentList[i] === mapInstanceId) {
                            oCurrentResultSet.push(oStorageEntry);
                            break;
                        }
                    }

                } else {
                    if (!emp.storage.isRoot(oStorageEntry.options.coreId)) {
                        oCurrentResultSet.push(oStorageEntry);
                    }
                }

                if (bRecurse) {
                    // Now we check its children.
                    searchChildren(oCurrentResultSet, oTypes, iMaxResults, oStorageEntry);
                }
            }
        } else if (bRecurse) {
            // Now we check its children.
            searchChildrenWithFilter(oCurrentResultSet, oTypes, oaPropertyFilter, iMaxResults, oStorageEntry);
        }
    };

    var globalTypeMatch = function (oStorageEntry, oTypes) {
        var iIndex;

        if (oStorageEntry.getCoreId() === sRootCoreId) {
            return false;
        }

        for (iIndex = 0; iIndex < oTypes.length; iIndex++)
        {
            if (oStorageEntry.getCoreObjectType() === oTypes[iIndex]) {
                return true;
            }
        }
        return false;
    };

    //==================================================================================================================
    // Public Interface
    //==================================================================================================================
    return {
        /**
         * Executes a search based off of the search engine params
         * @memberof emp.storage.searchEngine#
         * @returns {Array}
         */
        execute: function () {
            var sCoreId;
            var oChild;
            var oChildList;
            var iIndex;
            var oStorageEntry;
            var oStorageRoot;
            var bLookingForOverlay = false;
            var bLookingForFeature = false;
            var sOverlayId;
            var sFeatureId;
            var sParentId;
            var sChildId;

            //@todo : SELECT isn't here yet...

            var filter = oCriteria.filter || []; //Filter is not required.
            //var select = oCriteria.select;
            var types = (oCriteria.types ? oCriteria.types.concat([]) : []);
            var recurse = ((oCriteria.recursive !== false));
            var iMaxResults = oCriteria.maxResults || undefined;
            var currentResultSet = [];
            var oaPropertyFilter = [];

            searchedEntries = {};

            // 1 types is required.
            if ((types === undefined) || (types === null) || (types.length === 0)) {
                return currentResultSet;
            }

            oCriteria.types = types;
            // Search types and translates to singular.
            for (iIndex = 0; iIndex < types.length; iIndex++) {
                switch (types[iIndex]) {
                    case 'overlays':
                        types[iIndex] = 'overlay';
                        bLookingForOverlay = true;
                        break;
                    case 'features':
                        types[iIndex] = 'feature';
                        bLookingForFeature = true;
                        break;
                    case 'overlay':
                        bLookingForOverlay = true;
                        break;
                    case 'feature':
                        bLookingForFeature = true;
                        break;
                }
            }

            if ((types.indexOf(emp.typeLibrary.types.FEATURE) >= 0) &&
              (types.indexOf(emp.typeLibrary.types.WMS) === -1)) {
                // If there is a feature in the type but there is no WMS.
                // We add the WMS to the list.
                types.push(emp.typeLibrary.types.WMS);
            }

            if ((types.indexOf(emp.typeLibrary.types.FEATURE) >= 0) &&
              (types.indexOf(emp.typeLibrary.types.WMTS) === -1)) {
                // If there is a feature in the type but there is no WMTS.
                // We add the WMTS to the list.
                types.push(emp.typeLibrary.types.WMTS);
            }

            if (filter.length > 0) {
                for (iIndex = 0; iIndex < filter.length; iIndex++) {
                    switch (filter[iIndex].property) {
                        case 'overlayId':
                            sOverlayId = filter[iIndex].term;
                            break;
                        case 'featureId':
                            sFeatureId = filter[iIndex].term;
                            break;
                        case 'parentId':
                            sParentId = filter[iIndex].term;
                            break;
                        case 'childId':
                            sChildId = filter[iIndex].term;
                            break;
                        default:
                            oaPropertyFilter.push(filter[iIndex]);
                            break;
                    }
                }
            }

            if (bLookingForOverlay && sOverlayId !== undefined) {
                // We are looking for a specific overlay.
                oStorageEntry = emp.storage.findOverlay(sOverlayId);
                if (oStorageEntry) {
                    searchEntry(currentResultSet, types, oaPropertyFilter, iMaxResults, oStorageEntry, recurse);
                }
            } else if (bLookingForOverlay && sParentId !== undefined) {
                // We are looking for overlays under the parentId overlay.
                oStorageEntry = emp.storage.findOverlay(sParentId);
                if (oStorageEntry) {
                    searchedEntries[oStorageEntry.getCoreId()] = oStorageEntry;
                    oChildList = oStorageEntry.getChildrenList();

                    for (sCoreId in oChildList) {
                        if (!oChildList.hasOwnProperty(sCoreId)) {
                            continue;
                        }
                        oChild = oChildList[sCoreId];

                        searchEntry(currentResultSet, types, oaPropertyFilter, iMaxResults, oChild, recurse);
                    }
                }
            } else if (bLookingForFeature && sFeatureId !== undefined) {
                // We are looking for a specific feature.
                oStorageEntry = emp.storage.findFeature(sOverlayId, sFeatureId);
                if (oStorageEntry) {
                    searchEntry(currentResultSet, types, oaPropertyFilter, iMaxResults, oStorageEntry, recurse);
                }
            } else if (bLookingForFeature && sParentId !== undefined) {
                // We are looking for features under a specific feature.
                oStorageEntry = emp.storage.findFeature(sOverlayId, sParentId);
                if (oStorageEntry) {
                    searchedEntries[oStorageEntry.getCoreId()] = oStorageEntry;
                    oChildList = oStorageEntry.getChildrenList();

                    for (sCoreId in oChildList) {
                        if (!oChildList.hasOwnProperty(sCoreId)) {
                            continue;
                        }
                        oChild = oChildList[sCoreId];

                        searchEntry(currentResultSet, types, oaPropertyFilter, iMaxResults, oChild, recurse);
                    }
                }
            } else if (bLookingForFeature && sOverlayId !== undefined) {
                // We are looking for features under a specific overlay.
                oStorageEntry = emp.storage.findOverlay(sOverlayId);
                if (oStorageEntry) {
                    searchedEntries[oStorageEntry.getCoreId()] = oStorageEntry;
                    oChildList = oStorageEntry.getChildrenList();

                    for (sCoreId in oChildList) {
                        if (!oChildList.hasOwnProperty(sCoreId)) {
                            continue;
                        }
                        oChild = oChildList[sCoreId];

                        searchEntry(currentResultSet, types, oaPropertyFilter, iMaxResults, oChild, recurse);
                    }
                }
            } else if (sChildId) {
                var storageObject = emp.storage.get.id({id: sChildId});
                for (sCoreId in storageObject.options.parentObjects) {
                    if (storageObject.options.parentObjects.hasOwnProperty(sCoreId)) {
                        if (!emp.storage.isRoot(sCoreId)) {
                            currentResultSet.push(emp.storage.get.id({id: sCoreId}));
                        }
                    }
                }
            } else if (filter.length > 0) {
                // There is at least 1 property filter.
                // Cycle thru the storage to find objects that match the type and the filter.
                oStorageRoot = emp.storage.findOverlay(sRootCoreId);
                oChildList = oStorageRoot.getChildrenList();

                for (sCoreId in oChildList) {
                    if (!oChildList.hasOwnProperty(sCoreId)) {
                        continue;
                    }
                    oChild = oChildList[sCoreId];

                    searchEntry(currentResultSet, types, oaPropertyFilter, iMaxResults, oChild, recurse);

                    if (iMaxResults !== undefined) {
                        // Check to see if we have a max results and if so
                        // Exit the storage loop if we have reached the max requested.
                        if (currentResultSet.length >= iMaxResults) {
                            break;
                        }
                    }
                }
            } else {
                // No filter so we start from the Storage Root.
                // Cycle thru the storage root to find objects that match the type.
                oStorageRoot = emp.storage.findOverlay(sRootCoreId);
                findChildrenNoFilter(currentResultSet, types, iMaxResults, oStorageRoot, recurse);
            }

            if (types.indexOf(emp.typeLibrary.types.WMS) > -1) {
                // Remove WMS from the type list if it is there.
                types.splice(types.indexOf(emp.typeLibrary.types.WMS), 1);
            }

            if (types.indexOf(emp.typeLibrary.types.WMTS) > -1) {
                // Remove WMS from the type list if it is there.
                types.splice(types.indexOf(emp.typeLibrary.types.WMTS), 1);
            }

            return currentResultSet;
        }
    };
};
