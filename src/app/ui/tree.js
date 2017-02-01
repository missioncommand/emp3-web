(function() {


    emp_ui_TREE_INTENT_ITEM_CLICKED = "emp.ui.tree.item.clicked";
    emp_ui_TREE_SOURCE = "emp-core-ui-tree";
var domContainer = "content";
    var emp_ui_tree = function(args) {
        // This variable is used in the expand timer function.
        var oThis;

        var publicInterface = {
            mapInstance: args.mapInstance,
            mapInstanceId: args.mapInstanceId,
            domContainer: args.domContainer,
            config: args.config,
            oTreeRootNode: null,
            oTree: null,
            isCanvasSupported: false,
            storageItemTreeNodeMapper: tree_storageItemTreeNodeMapper(args),
            _hLazyTimer: undefined,
            _iLazyLoadIndex: undefined,
            _oParentNodeExpanding: undefined,
            _iLoadStartTime: undefined,
            _selfVis: false,
            _processingRqst: false,
            _mapCantPlotToolTip: "This feature can not be rendered by the current map engine. Switch to the diffrent map engine to view it on the map.",
            oNodeToLocate: [],
            selectWhenFound: false,
            init: function() {
                "use strict";
                oThis = this;
                //Get root guid for setup.
                this.ROOT_GUID = emp.storage.getRootGuid(this.mapInstanceId);

                this.checkIfCanvasSupported();

                //init dynatree.
                $("#" + this.domContainer + "_tree").dynatree({
                    checkbox: true,
                    generateIds: true,
                    selectMode: 2,
                    clickFolderMode: 1,
                    autoCollapse: true,
                    onDblClick: function(node, event) {
                        if (node.getEventTargetType(event) === "checkbox") {
                            return false; // Prevent default processing
                        }

                        oThis.view(node);
                    },
                    onSelect: function(select, node) {
                        oThis.visible(select, node);
                    },
                    onLazyRead: function(oParentNode) {
                        oThis._lazyLoadNode(oParentNode);
                    },
                    onExpand: function(bExpand, oNode) {
                        oThis._nodeExpanded(bExpand, oNode);
                    },
                    debugLevel: 0,
                    imagePath: " " // had to set default imagePath.

                });

                

                $("#" + this.domContainer + "_tree").mouseup(function(e) {
                    var node, parentNode, newEvent = {};
                    var oTransaction;
                    var oPointer;
                    var aoItems = [];

                    e.preventDefault();
                    e.stopPropagation();
                    if (e.button === 2) { //for now only right click.
                        node = $.ui.dynatree.getNode(e.target);
                        if (node && node.data.storageEntry) { // is valid node...
                            oPointer = new emp.typeLibrary.Pointer({
                                type: emp.typeLibrary.Pointer.EventType.MOUSEUP,
                                button: emp.typeLibrary.Pointer.ButtonType.RIGHT_BUTTON,
                                clientX: e.clientX, //e.pageX,
                                clientY: e.clientY, //e.pageY,
                                screenX: e.pageX, //e.screenX,
                                screenY: e.pageY //e.screenY
                            });
                            aoItems.push(oPointer);
                            aoItems.push(node.data.storageEntry);
                            parentNode = node.parent;

                            if (parentNode && parentNode.data && parentNode.data.storageEntry) {
                                // push the parent if it exists.
                                aoItems.push(parentNode.data.storageEntry);

                                if (!(parentNode.data.storageEntry instanceof emp.classLibrary.EmpOverlay)) {
                                    while (parentNode && parentNode.data && parentNode.data.storageEntry && !(parentNode.data.storageEntry instanceof emp.classLibrary.EmpOverlay)) {
                                        // If the parent is not an overlay, go up the tree looking for the overlay.
                                        parentNode = parentNode.parent;
                                    }
                                    if (parentNode && parentNode.data && parentNode.data.storageEntry) {
                                        // push the parent overlay of the parent.
                                        aoItems.push(parentNode.data.storageEntry);
                                    }
                                }
                            }
                            oTransaction = new emp.typeLibrary.Transaction({
                                mapInstanceId: oThis.mapInstanceId,
                                source: emp_ui_TREE_SOURCE,
                                intent: emp_ui_TREE_INTENT_ITEM_CLICKED,
                                originChannel: "none",
                                sender: emp_ui_TREE_SOURCE,
                                items: aoItems
                            });
                            oTransaction.run();
                        } 
                    } 

                    return newEvent;
                });

                var oStorageRoot = emp.storage.get.id({ id: emp.storage.getRootGuid(this.mapInstanceId) });
                this.oTree = $('#' + this.domContainer + '_tree').dynatree('getTree');
                this.oTreeRootNode = $('#' + this.domContainer + '_tree').dynatree('getRoot');
                this.oTreeRootNode.data.key = emp.storage.getRootGuid(this.mapInstanceId);
                this.oTreeRootNode.data.storageEntry = oStorageRoot;
                this.storageItemTreeNodeMapper.addMapping(oStorageRoot, this.oTreeRootNode);

            },
            destroy: function() {
                this.storageItemTreeNodeMapper.clear();
                this.oTree = undefined;
                this.oTreeRootNode.data.storageEntry = undefined;
                this.oTreeRootNode = undefined;

            },
            _nodeExpanded: function(bExpand, oNode) {
                if (!bExpand) {
                    switch (oNode.data.type) {
                        case emp.typeLibrary.types.FEATURE:
                        case emp.typeLibrary.types.OVERLAY:
                        case emp.typeLibrary.types.STATIC:
                            var oChildNode;
                            var oChildList = oNode.getChildren();

                            if ((oChildList !== undefined) && (oChildList !== null)) {
                                // We need to go thru its children to remove them from the mapping.
                                for (var iIndex = 0; iIndex < oChildList.length; iIndex++) {
                                    oChildNode = oChildList[iIndex];
                                    this._nodeExpanded(bExpand, oChildNode);
                                    this.storageItemTreeNodeMapper.removeMapping(oChildNode.data.storageEntry, oChildNode.data.parentCoreId);
                                }
                            }
                            break;
                    }

                    if (oNode.isLazy()) {
                        // Now we reset its laszyness.
                        oNode.resetLazy();
                    }
                }
            },
            _treeNodeHasChildrenInStorage: function(oNode) {
                if (oNode === this.oTreeRootNode) {
                    return true;
                } else if ((oNode.data.storageEntry !== undefined) &&
                    ((oNode.data.storageEntry !== null))) {
                    return oNode.data.storageEntry.hasChildren();
                }

                return false;
            },
            getItemName: function(oStorageEntry) {
                var sTitle = "Unknown";

                if (oStorageEntry instanceof emp.classLibrary.EmpRenderableObject) {
                    sTitle = oStorageEntry.getName();

                    if (emp.helpers.isEmptyString(sTitle)) {
                        switch (oStorageEntry.getCoreObjectType()) {
                            case emp.typeLibrary.types.FEATURE:
                                if (!emp.helpers.isEmptyString(oStorageEntry.getURL())) {
                                    sTitle = "URL: " + oStorageEntry.getURL();
                                } else
                                    switch (oStorageEntry.format) {
                                        case emp.typeLibrary.featureFormatType.KML:
                                            sTitle = "KML: " + oStorageEntry.getFeatureId();
                                            break;
                                        case emp.typeLibrary.featureFormatType.AIRSPACE:
                                            sTitle = "Airspace: " + oStorageEntry.getFeatureId();
                                            break;
                                        case emp.typeLibrary.featureFormatType.GEOJSON:
                                            sTitle = "GEOJSON: " + oStorageEntry.getFeatureId();
                                            break;
                                        case emp.typeLibrary.featureFormatType.MILSTD:
                                            if (oStorageEntry.getProperties().hasOwnProperty('modifiers') && oStorageEntry.getProperties().modifiers.hasOwnProperty('uniqueDesignation1') && !emp.helpers.isEmptyString(oStorageEntry.getProperties().modifiers.uniqueDesignation1)) {
                                                sTitle = oStorageEntry.getProperties().modifiers.uniqueDesignation1;
                                            } else {
                                                sTitle = "MilStd: " + oStorageEntry.getFeatureId();
                                            }
                                            break;
                                    }
                                break;
                            case emp.typeLibrary.types.OVERLAY:
                                sTitle = "Overlay: " + oStorageEntry.getOverlayId();
                                break;
                            case emp.typeLibrary.types.WMS:
                                sTitle = "WMS: " + oStorageEntry.getURL();
                                break;
                            case emp.typeLibrary.types.STATIC:
                                sTitle = "Map: " + oStorageEntry.getFeatureId();
                                break;
                        }
                    }
                }

                return sTitle;
            },
            _getNodeData: function(oStorageEntry, sParentCoreId) {
                var oActualStorageItem;

                if (oStorageEntry instanceof emp.classLibrary.EmpRenderableObject) {
                    oActualStorageItem = oStorageEntry;
                } else {
                    oActualStorageItem = emp.storage.get.id({
                        id: oStorageEntry.coreId
                    });
                }

                if (oActualStorageItem === undefined) {
                    emp.typeLibrary.Error({
                        coreId: oStorageEntry.coreId,
                        level: emp.typeLibrary.Error.level.MAJOR,
                        message: "Lazy Loading failed. " + oStorageEntry.name + ' Not found in storage.'
                    });
                    return {};
                }

                var icon = this.node_icon(oActualStorageItem);

                var oItemData = {
                    title: this.getItemName(oActualStorageItem),
                    key: emp.helpers.id.newGUID(),
                    isLazy: (oActualStorageItem.getCoreObjectType() === emp.typeLibrary.types.WMS) ? false : oActualStorageItem.hasChildren(),
                    select: oActualStorageItem.getVisibilitySettingWithParent(this.mapInstanceId, sParentCoreId),
                    unselectable: oActualStorageItem.isDisabled(),
                    hideCheckbox: oActualStorageItem.isDisabled() ||
                        ((oActualStorageItem.getCoreObjectType() === emp.typeLibrary.types.FEATURE) ? oActualStorageItem.isInEditMode() : false),
                    type: oActualStorageItem.getCoreObjectType(),
                    readOnly: oActualStorageItem.isReadOnly(),
                    editable: !oActualStorageItem.isReadOnly(),
                    icon: icon,
                    parentCoreId: sParentCoreId,
                    storageEntry: oActualStorageItem
                };

                if ((oActualStorageItem.getCoreObjectType() === emp.typeLibrary.types.FEATURE) && !oActualStorageItem.canMapEnginePlot(this.mapInstanceId)) {
                    oItemData.tooltip = this._mapCantPlotToolTip;
                    oItemData.select = false;
                    oItemData.unselectable = true;
                    oItemData.hideCheckbox = true;
                    oItemData.readOnly = true;
                    oItemData.editable = false;
                }

                return oItemData;
            },
            _getTreeNode: function(oItem) {
                var oNode;

                if (oItem.coreId === emp.storage.getRootGuid(this.mapInstanceId)) {
                    oNode = this.oTreeRootNode;
                } else {
                    oNode = this.storageItemTreeNodeMapper.getItemNodeUnderParent(oItem.coreId, oItem.coreParent);
                }

                return oNode;
            },
            _WMS_LoadFolders: function(oActualStorageItem, sParentCoreId, oParentNode, oaFolders, iFolderCount) {
                var oNewNode;

                for (var iIndex = 0; iIndex < oaFolders.length; iIndex++) {
                    if (oParentNode.children === null) {
                        oParentNode.children = [];
                    }
                    if ((oaFolders[iIndex].folders.length > 0) ||
                        (oaFolders[iIndex].layers.length > 0)) {
                        // Only add folders that have children and title.
                        if (!emp.helpers.isEmptyString(oaFolders[iIndex].title)) {
                            oNewNode = {
                                title: oaFolders[iIndex].title,
                                key: oActualStorageItem.getCoreId() + "-Folder-" + iFolderCount,
                                serviceKey: sParentCoreId + "." + oActualStorageItem.getCoreId(),
                                type: "WMS_FOLDER",
                                isLazy: false,
                                select: oActualStorageItem.isFolderSelected(this.mapInstanceId, oaFolders[iIndex].title),
                                folderInfo: oaFolders[iIndex],
                                readOnly: true,
                                editable: false,
                                isFolder: true,
                                icon: { material_icon: 'folder' },
                                children: null,
                                storageEntry: oActualStorageItem
                            };

                            oParentNode.children.push(oNewNode);

                            iFolderCount++;

                            this._WMS_LoadFolders(oActualStorageItem, sParentCoreId, oNewNode, oaFolders[iIndex].folders, iFolderCount);
                            this._WMS_LoadLayers(oActualStorageItem, sParentCoreId, oNewNode, oaFolders[iIndex].layers, iFolderCount);
                        } else {
                            //If the folder does not have a title just add its children to
                            // the folder's parent.
                            this._WMS_LoadFolders(oActualStorageItem, sParentCoreId, oParentNode, oaFolders[iIndex].folders, iFolderCount);
                            this._WMS_LoadLayers(oActualStorageItem, sParentCoreId, oParentNode, oaFolders[iIndex].layers, iFolderCount);
                        }
                    }
                }
            },
            _WMS_LoadLayers: function(oActualStorageItem, sParentCoreId, oParentNode, oaLayers, iFolderCount) {
                var sTitle;
                var oNewNode;

                for (var iIndex = 0; iIndex < oaLayers.length; iIndex++) {
                    if (oParentNode.children === null) {
                        oParentNode.children = [];
                    }

                    sTitle = oaLayers[iIndex].title || "";

                    if (sTitle.length === 0) {
                        sTitle = oaLayers[iIndex].name;
                    }

                    oNewNode = {
                        title: sTitle,
                        key: oActualStorageItem.getCoreId() + oaLayers[iIndex].name,
                        serviceKey: sParentCoreId + "." + oActualStorageItem.getCoreId(),
                        select: oActualStorageItem.isLayerSelected(this.mapInstanceId, oaLayers[iIndex].name),
                        type: "WMS_LAYER",
                        layerInfo: oaLayers[iIndex],
                        readOnly: true,
                        editable: false,
                        icon: { material_icon: 'image' },
                        children: null,
                        storageEntry: oActualStorageItem
                    };

                    oParentNode.children.push(oNewNode);

                    this._WMS_LoadFolders(oActualStorageItem, sParentCoreId, oNewNode, oaLayers[iIndex].folders, iFolderCount);
                    this._WMS_LoadLayers(oActualStorageItem, sParentCoreId, oNewNode, oaLayers[iIndex].layers, iFolderCount);
                }
            },
            _addWMSItem: function(oItem, sParentCoreId) {
                var icon,
                    iFolderCount = 1,
                    oLayerHierarchy;

                var oActualStorageItem;

                if (oItem instanceof emp.classLibrary.EmpRenderableObject) {
                    oActualStorageItem = oItem;
                } else {
                    oActualStorageItem = emp.storage.get.id({
                        id: oItem.coreId
                    });
                }

                if (oActualStorageItem === undefined) {
                    emp.typeLibrary.Error({
                        coreId: oItem.coreId,
                        level: emp.typeLibrary.Error.level.MAJOR,
                        message: "Lazy Loading failed. " + oItem.getName() + ' Not found in storage.'
                    });
                    return {};
                }

                // @todo EMP-79 UI-TREE icon clean up.
                icon = this.node_icon(oActualStorageItem);

                var oItemNode = {
                    title: this.getItemName(oActualStorageItem),
                    key: sParentCoreId + "." + oActualStorageItem.getCoreId(),
                    type: oActualStorageItem.getCoreObjectType(),
                    isLazy: false,
                    select: oActualStorageItem.getVisibilityWithParent(this.mapInstanceId, sParentCoreId),
                    readOnly: true,
                    editable: false,
                    icon: icon,
                    children: null,
                    parentCoreId: sParentCoreId,
                    storageEntry: oActualStorageItem
                };

                if (!oActualStorageItem.canMapEnginePlot(this.mapInstanceId)) {
                    oItemNode.tooltip = this._mapCantPlotToolTip;
                    oItemNode.select = false;
                    oItemNode.unselectable = true;
                    oItemNode.hideCheckbox = true;
                    oItemNode.readOnly = true;
                    oItemNode.editable = false;
                } else if ((oActualStorageItem.getDefaultLayers().length === 0) &&
                    (oActualStorageItem.getLayerHierarchy() !== undefined)) {
                    oLayerHierarchy = oActualStorageItem.getLayerHierarchy();

                    if ((oLayerHierarchy.folders.length === 1) && (oLayerHierarchy.layers.length === 0)) {
                        oLayerHierarchy = oLayerHierarchy.folders[0];
                        this._WMS_LoadFolders(oActualStorageItem, sParentCoreId, oItemNode, oLayerHierarchy.folders, iFolderCount);
                        this._WMS_LoadLayers(oActualStorageItem, sParentCoreId, oItemNode, oLayerHierarchy.layers, iFolderCount);
                    } else {
                        this._WMS_LoadFolders(oActualStorageItem, sParentCoreId, oItemNode, oLayerHierarchy.folders, iFolderCount);
                        this._WMS_LoadLayers(oActualStorageItem, sParentCoreId, oItemNode, oLayerHierarchy.layers, iFolderCount);
                    }
                }

                return oItemNode;
            },
            _fnLazyLoadTimer: function() {
                var iMaxIndex = 0;
                var iCurrentLoaded = 0;
                //var iStartTime = Date.now();
                //var iCurrentTime = Date.now();
                var oStorageItem;
                var oChildNode;
                var iStartIterationTime = Date.now();
                var oaNodeData = [];
                var parentCoreId = oThis._oParentNodeExpanding.data.storageEntry.getCoreId();
                var oParentItem = emp.storage.get.id({
                    id: parentCoreId
                });

                if (oParentItem && oParentItem.hasChildren()) {
                    // If this item has children we load them 10000 at a time.
                    var aChildList = oParentItem.getChildrenCoreIds();
                    iMaxIndex = aChildList.length;
                    while (oThis._iLazyLoadIndex < iMaxIndex) {
                        oStorageItem = oParentItem.getChild(aChildList[oThis._iLazyLoadIndex]);

                        if (oStorageItem) {
                            if (oStorageItem.getCoreObjectType() === emp.typeLibrary.types.WMS) {
                                oaNodeData.push(oThis._addWMSItem(oStorageItem, parentCoreId));
                            } else {
                                oaNodeData.push(oThis._getNodeData(oStorageItem, parentCoreId));
                            }
                        }
                        oThis._iLazyLoadIndex++;
                        iCurrentLoaded++;

                        if ((Date.now() - iStartIterationTime) > 100) {
                            break;
                        }
                    }
                }

                if (oaNodeData.length > 0) {
                    var bPrevValue = oThis.oTree.enableUpdate(false);

                    try {
                        oThis._oParentNodeExpanding.addChild(oaNodeData);

                        var oChildList = oThis._oParentNodeExpanding.getChildren();
                        for (var iIndex = 0; iIndex < oChildList.length; iIndex++) {
                            oChildNode = oChildList[iIndex];
                            oThis.storageItemTreeNodeMapper.addMapping(oChildNode.data.storageEntry, parentCoreId, oChildNode);
                        }
                    } catch (Err) {
                        console.log("An error occured while loading tree nodes.");
                    }
                    oThis.oTree.enableUpdate(bPrevValue, oThis._oParentNodeExpanding);
                } else {
                    oThis._oParentNodeExpanding.resetLazy();
                    oThis._oParentNodeExpanding.data.isLazy = false;
                    oThis._oParentNodeExpanding.render();
                }

                //iCurrentTime = Date.now();
                if (oThis._iLazyLoadIndex < iMaxIndex) {
                    //console.log("Parcial Load: " + this._iLazyLoadIndex + " in:" + (iCurrentTime - iStartTime) + " ms");
                    oThis._hLazyTimer = setTimeout(oThis._fnLazyLoadTimer, 50);
                } else {
                    oThis._hLazyTimer = null;
                    if (oThis.oTreeRootNode !== oThis._oParentNodeExpanding) {
                        oThis._oParentNodeExpanding.setLazyNodeStatus(DTNodeStatus_Ok);
                    }
                    //console.log("Loaded: " + this._iLazyLoadIndex + " in:" + (iCurrentTime - this._iLoadStartTime) + " ms");
                }
            },
            _lazyLoadNode: function(oParentNode) {
                oThis = this;
                if (this._hLazyTimer) {
                    clearTimeout(this._hLazyTimer);
                }
                //console.log("Starting lazy load for " + oParentNode.data.title);
                if (this.oTreeRootNode !== oParentNode) {
                    oParentNode.setLazyNodeStatus(DTNodeStatus_Loading);
                }

                this._iLazyLoadIndex = 0;
                this._oParentNodeExpanding = oParentNode;
                this._iLoadStartTime = Date.now();
                this._hLazyTimer = setTimeout(function() {
                    oThis._fnLazyLoadTimer();
                }, 50);
                return false;
            },
            _addItem: function(oItem) {
                var dStart = Date.now();
                var parentTreeNode;
                var oHighestNode;
                var parentNodeList;
                var oItemNode = this._getTreeNode(oItem);

                if (this.storageItemTreeNodeMapper.isItemOnTree(oItem.coreId)) {
                    // the item exists, its an update.
                    return this._updateItem(oItem);
                }
                //console.log("Add " + oItem.globalType + " " + oItem.name + " to tree.");

                // This is a specific add to a parent.
                // So we need to see if the parent is on the tree.
                if (!this.storageItemTreeNodeMapper.isItemOnTree(oItem.coreParent)) {
                    // The parent is NOT on the tree.
                    // So we don't have to add this item.
                    return undefined;
                }

                // The parent is on the tree.
                // Now we create and add it.
                if (emp.storage.getRootGuid(this.mapInstanceId) === oItem.coreParent) {
                    // its being added to the root and the root is always expanded.
                    if ((oItem.globalType === emp.typeLibrary.types.STATIC) &&
                        (this.oTreeRootNode.getChildren() !== undefined) &&
                        (this.oTreeRootNode.getChildren() !== null)) {
                        // If its static data and its being added to the root,
                        // put it up top.
                        oItemNode = this.oTreeRootNode.addChild(this._getNodeData(oItem, oItem.coreParent),
                            this.oTreeRootNode.getChildren()[0]);
                    } else {
                        oItemNode = this.oTreeRootNode.addChild(this._getNodeData(oItem, oItem.coreParent));

                        if (oItem.disabled) {
                            this._disable(oItemNode, oItem.disabled);
                        }
                    }
                    // The item was added to the tree, add it to the mapper.
                    this.storageItemTreeNodeMapper.addMapping(oItemNode.data.storageEntry, oItem.coreParent, oItemNode);
                    //console.log("Add to root done in: " + (Date.now() - dStart) + " ms.");
                    oHighestNode = oItemNode;
                } else {
                    // We need to know if any parent instance is expanded anywhere.
                    if (!this.storageItemTreeNodeMapper.isAnyNodeExpanded(oItem.coreParent)) {
                        // None of its parent tree node are expanded so we don't need to add this item.
                        // But we must set them to have children (lazy).

                        parentNodeList = this.storageItemTreeNodeMapper.getParentList(oItem.coreParent);
                        for (var sCoreId in parentNodeList) {
                            parentTreeNode = parentNodeList[sCoreId];
                            if (!parentTreeNode.isLazy()) {
                                parentTreeNode.data.isLazy = true;
                                oHighestNode = this._pickHighestInTree(oHighestNode, parentTreeNode);
                            }
                        }
                        return oHighestNode;
                    }

                    // The parent node is on the tree and has been expanded.
                    // So if the timer is NOT running, the load finished.
                    // So this new item must be added to the tree.
                    if (this._hLazyTimer !== null) {
                        return undefined;
                    }

                    oHighestNode = this._addItemToAllParentNode(oItem);
                }

                return oHighestNode;
            },
            _addItemToAllParentNode: function(oItem) {
                var oItemNode;
                var parentTreeNode;
                var oHighestNode;
                var parentNodeList = this.storageItemTreeNodeMapper.getParentList(oItem.coreParent);
                // Add it to all parent tree nodes.

                for (var sCoreId in parentNodeList) {
                    parentTreeNode = parentNodeList[sCoreId];

                    if (parentTreeNode.isExpanded()) {
                        if (oItem.globalType === emp.typeLibrary.types.WMS) {
                            oItemNode = parentTreeNode.addChild(this._addWMSItem(oItem, oItem.coreParent));
                        } else {
                            oItemNode = parentTreeNode.addChild(this._getNodeData(oItem, oItem.coreParent));

                            if (oItem.disabled) {
                                this._disable(oItemNode, oItem.disabled);
                            }
                        }
                        // The item was added to the tree, add it to the mapper.
                        this.storageItemTreeNodeMapper.addMapping(oItemNode.data.storageEntry, oItem.coreParent, oItemNode);

                        oHighestNode = this._pickHighestInTree(oHighestNode, oItemNode);
                    } else if (!parentTreeNode.isLazy()) {
                        parentTreeNode.data.isLazy = true;
                        //parentTreeNode.render();

                        oHighestNode = this._pickHighestInTree(oHighestNode, parentTreeNode);
                    }
                }

                return oHighestNode;
            },
            _pickHighestInTree: function(oNodeA, oNodeB) {
                var oTempNode = oNodeB;

                if (oNodeA === undefined) {
                    if (oNodeB === undefined) {
                        return undefined;
                    }
                    return oNodeB;
                } else if (oNodeB === undefined) {
                    return oNodeA;
                } else if (oNodeA.isDescendantOf(oNodeB)) {
                    return oNodeB;
                } else if (oNodeB.isDescendantOf(oNodeA)) {
                    return oNodeA;
                } else
                    while (oTempNode !== this.oTreeRootNode) {
                        if (oNodeA.isDescendantOf(oTempNode)) {
                            return oTempNode;
                        }
                        oTempNode = oTempNode.getParent();
                    }

                return this.oTreeRootNode;
            },
            add: function(args) {

                'use strict';
                var bPrevValue;
                //var bSetUpdateEnabled = false;
                var oNodeChanged;
                var oHighestNode;
                //var iChangeCount = 0;
                //var iStartTime = Date.now();

                if (this._hLazyTimer) {
                    // If the timer is still running then we wait until the load is over.
                    return;
                }

                // For now lets assume that there is a change.
                //for (var i = 0; i < args.items.length; i = i + 1) {
                //    iChangeCount += this._checkForTreeChanges(args.items[i]);
                //}

                //if (iChangeCount > 0)
                //{
                //    bSetUpdateEnabled = true;
                //}
                if (args.items.length > 0) {
                    bPrevValue = this.oTree.enableUpdate(false);
                }

                for (var i = 0; i < args.items.length; i = i + 1) {
                    oNodeChanged = this._addItem(args.items[i]);

                    // We are looking for the highest point in the tree
                    // that need rendering.
                    oHighestNode = this._pickHighestInTree(oHighestNode, oNodeChanged);
                }
                //console.log("Tree Add of " + args.items.length + " Items in " + (Date.now() - iStartTime) + " msec.");
                //iStartTime = Date.now();

                if (args.items.length > 0) {
                    this.oTree.enableUpdate(bPrevValue, oHighestNode);
                }
            },
            /**
             * Remove object to the dynaTree
             * @param {object} args Transaction object {@link global/Transaction}
             * @method
             * @memberof emp.dataExplorer
             */
            remove: function(args) {
                'use strict';
                var dyExport;
                var oParentNode;
                var aParentNodeList;
                var oHighestNode;

                //var bPrevValue = this.oTree.enableUpdate(false);

                try {
                    for (var i = 0; i < args.items.length; i = i + 1) {
                        dyExport = this.storageItemTreeNodeMapper.getItemNodeUnderParent(args.items[i].coreId, args.items[i].coreParent);
                        if (dyExport) {
                            oHighestNode = this._pickHighestInTree(oHighestNode, dyExport.getParent());
                            // If it is expanded we must collapse it.
                            if (dyExport.isExpanded()) {
                                dyExport.expand(false);
                            }
                            // Now remove the mapping.
                            this.storageItemTreeNodeMapper.removeMapping(dyExport.data.storageEntry, args.items[i].coreParent);
                            dyExport.removeChildren();
                            dyExport.remove();
                            oHighestNode = this._pickHighestInTree(oHighestNode, dyExport);
                        }

                        // Now we get the list of parents
                        aParentNodeList = this.storageItemTreeNodeMapper.getParentList(args.items[i].coreParent);
                        if (aParentNodeList) {
                            // We cycle thru its parents in case this was the only child.
                            for (var sParentCoreId in aParentNodeList) {
                                oParentNode = aParentNodeList[sParentCoreId];

                                if (oParentNode === this.oTreeRootNode) {
                                    oHighestNode = this.oTreeRootNode;
                                }
                                if (!oParentNode.data.storageEntry.hasChildren()) {
                                    // This parent is not the root and has no more children.
                                    oParentNode.expand(false);
                                    oParentNode.data.isLazy = false;
                                    //oParentNode.render();
                                    oHighestNode = this._pickHighestInTree(oHighestNode, oParentNode);
                                } else {
                                    oHighestNode = this._pickHighestInTree(oHighestNode, oParentNode);
                                }
                            }
                        }
                    }
                } catch (Err) {}

                if (oHighestNode === this.oTreeRootNode) {
                    this.oTree.redraw();
                } else if (oHighestNode) {
                    oHighestNode.render();
                }
            },
            /**
             * Clear object to the dynaTree
             * @param {object} args Transaction object {@link global/Transaction}
             * @method
             * @memberof emp.dataExplorer
             */
            clear: function(args) {
                'use strict';
                var oOverlay;
                var oTreeNode;

                //var bPrevValue = this.oTree.enableUpdate(false);

                try {
                    for (var i = 0; i < args.items.length; i = i + 1) {
                        oOverlay = args.items[i];
                        oTreeNode = this.storageItemTreeNodeMapper.getItemNodeUnderParent(oOverlay.coreId, oOverlay.coreParent);
                        if (oTreeNode !== undefined && oTreeNode !== null) {
                            if (oTreeNode.isExpanded()) {
                                oTreeNode.expand(false);
                            }
                            if (oTreeNode.isLazy()) {
                                oTreeNode.data.isLazy = false;
                            }
                            oTreeNode.removeChildren();
                        }
                    }
                } catch (Err) {}

                //this.oTree.enableUpdate(bPrevValue);
            },
            _updateOverlay: function(oItem) {
                var aParentNodeList;
                var sParentCoreId;
                var oParentTreeNode;
                var oTempItemNode;
                var oOverlayTreeNode;
                var oOverlayParentList;
                var bOverlayRender;
                var oStorageEntry;
                var oHighestNode;
                var oItemNode
                var oExistingItem;

                try {
                    if (oItem.previousParent) {
                        // If previousParent is defined the storage engine is letting us know that
                        // the overlay has been moved to a new parent.

                        // Now we see if the overlay is on the tree under the previous parent.
                        oOverlayTreeNode = this.storageItemTreeNodeMapper.getItemNodeUnderParent(oItem.coreId, oItem.previousParent);

                        if (oOverlayTreeNode) {
                            // So we remove it from the previous parent.
                            this.storageItemTreeNodeMapper.removeMapping(oItem, oItem.previousParent);
                            if (oOverlayTreeNode.isExpanded()) {
                                oOverlayTreeNode.expand(false);
                            }
                            oOverlayTreeNode.remove();
                        }

                        // Now we get the old parents list of nodes.
                        aParentNodeList = this.storageItemTreeNodeMapper.getParentList(oItem.previousParent);
                        if (aParentNodeList) {
                            var bHasChildren;
                            for (sParentCoreId in aParentNodeList) {
                                oParentTreeNode = aParentNodeList[sParentCoreId];
                                bHasChildren = this._treeNodeHasChildrenInStorage(oParentTreeNode);

                                if (!bHasChildren) {
                                    if (oParentTreeNode !== this.oTreeRootNode) {
                                        oParentTreeNode.resetLazy();
                                        oParentTreeNode.data.isLazy = false;
                                    }
                                    oHighestNode = this._pickHighestInTree(oHighestNode, oParentTreeNode);
                                    //oParentTreeNode.render();
                                }
                            }
                        }

                        // Now lets see if the new parent is on the tree.
                        if (this.storageItemTreeNodeMapper.isItemOnTree(oItem.coreParent)) {
                            // The new parent is on the tree.
                            if (oItem.coreParent === emp.storage.getRootGuid(this.mapInstanceId)) {
                                // The new parent is the root node.
                                oTempItemNode = this.oTreeRootNode.addChild(this._getNodeData(oItem, oItem.coreParent));
                                this.storageItemTreeNodeMapper.addMapping(oTempItemNode.data.storageEntry, oItem.coreParent, oTempItemNode);
                                //this.oTreeRootNode.render();
                                return this.oTreeRootNode;
                            }
                            // Now we cycle thru all its tree node to see if any is expanded.
                            aParentNodeList = this.storageItemTreeNodeMapper.getParentList(oItem.coreParent);
                            for (sParentCoreId in aParentNodeList) {
                                oParentTreeNode = aParentNodeList[sParentCoreId];
                                if (oParentTreeNode.isExpanded()) {
                                    oStorageEntry = oParentTreeNode.data.storageEntry;
                                    var oNewParentUnderCurrent = this.storageItemTreeNodeMapper.getItemNodeUnderParent(oStorageEntry.getCoreId(), sParentCoreId);
                                    if (oNewParentUnderCurrent && oNewParentUnderCurrent.isExpanded()) {
                                        // This one is expanded.
                                        // So we need to add the item node.
                                        oTempItemNode = oNewParentUnderCurrent.addChild(this._getNodeData(oItem, oItem.coreParent));
                                        this.storageItemTreeNodeMapper.addMapping(oTempItemNode.data.storageEntry, oItem.coreParent, oTempItemNode);
                                        oHighestNode = this._pickHighestInTree(oHighestNode, oNewParentUnderCurrent);
                                    }
                                } else if (!oParentTreeNode.isLazy() && (oParentTreeNode !== this.oTreeRootNode)) {
                                    // This one is not expanded and is not set to lazy.
                                    oParentTreeNode.data.isLazy = true;
                                    //oParentTreeNode.render();
                                    oParentTreeNode.expand();
                                    oHighestNode = this._pickHighestInTree(oHighestNode, oParentTreeNode);
                                }
                            }
                        }

                        // Once the move is process we don't need to do anything else.
                        return oHighestNode;
                    }

                    // If the overlay is being updated, and is already on the map it still might be
                    // added to the parent of an existing overlay.  We need to check for a few
                    // new cases...
                    // 
                    // 1.  Is the overlay being updated to also be on a parent overlay that is
                    // already on the map, but is not expanded.  The parent overlay may be in multiple
                    // places because the parent itself could have multiple instances on the map.  If
                    // so, we need to add the little expansion "carrot" to indicate data is under that
                    // parent (in case it was empty before).
                    if (!this.storageItemTreeNodeMapper.isAnyNodeExpanded(oItem.coreParent)) {

                        // None of its parent tree node are expanded so we don't need to add this item.
                        // But we must set them to have children (lazy).
                        aParentNodeList = this.storageItemTreeNodeMapper.getParentList(oItem.coreParent);
                        for (var sCoreId in aParentNodeList) {
                            oParentTreeNode = aParentNodeList[sCoreId];
                            if (!oParentTreeNode.isLazy()) {
                                oParentTreeNode.data.isLazy = true;
                                oHighestNode = this._pickHighestInTree(oHighestNode, oParentTreeNode);
                            }
                        }
                        // 2. Is the overlay being updated to also be on a parent overlay that is already on the 
                        // map and is expanded.  In this case, we need to add the node to the tree, but only if it 
                        // doesn't already exist.
                    } else {
                        // Add it to all parent tree nodes.
                        aParentNodeList = this.storageItemTreeNodeMapper.getParentList(oItem.coreParent);
                        for (var sCoreId in aParentNodeList) {
                            oParentTreeNode = aParentNodeList[sCoreId];

                            // some nodes may be expanded, some nodes may not be.  we need to handle both cases.
                            if (oParentTreeNode.isExpanded()) {
                                oExistingItem = this.storageItemTreeNodeMapper.getItemNodeUnderParent(oItem.coreId, oItem.coreParent);

                                // If the node for this item is not already under the parent, add it, then add to the 
                                // tree node mapper.
                                if (!oExistingItem) {
                                    oItemNode = oParentTreeNode.addChild(this._getNodeData(oItem, oItem.coreParent));

                                    if (oItem.disabled) {
                                        this._disable(oItemNode, oItem.disabled);
                                    }

                                    // The item was added to the tree, add it to the mapper.
                                    this.storageItemTreeNodeMapper.addMapping(oItemNode.data.storageEntry, oItem.coreParent, oItemNode);

                                    oHighestNode = this._pickHighestInTree(oHighestNode, oItemNode);
                                }

                            } else if (!oParentTreeNode.isLazy()) {
                                oParentTreeNode.data.isLazy = true;
                                oHighestNode = this._pickHighestInTree(oHighestNode, oParentTreeNode);
                            }
                        }
                    }

                    // Now we must update all the overlays tree nodes.
                    oOverlayParentList = this.storageItemTreeNodeMapper.getParentList(oItem.coreId);
                    if (oOverlayParentList === undefined) {
                        // The overlay is not on the tree.
                        return undefined;
                    }

                    // Now lets cycle thru the tree nodes.  Update the properties with any new data.
                    for (sParentCoreId in oOverlayParentList) {
                        var sTitle;
                        bOverlayRender = false;
                        oOverlayTreeNode = oOverlayParentList[sParentCoreId];
                        oStorageEntry = oOverlayTreeNode.data.storageEntry;
                        sTitle = this.getItemName(oStorageEntry);

                        if (sTitle !== oOverlayTreeNode.data.title) {
                            oOverlayTreeNode.data.title = sTitle;
                            bOverlayRender = true;
                        }

                        var sIconURL = this.node_icon(oStorageEntry);

                        if (sIconURL !== oOverlayTreeNode.data.icon) {
                            oOverlayTreeNode.data.icon = sIconURL;
                            bOverlayRender = true;
                        }

                        if (oOverlayTreeNode.data.isLazy !== oStorageEntry.hasChildren()) {
                            oOverlayTreeNode.data.isLazy = oStorageEntry.hasChildren();
                            bOverlayRender = true;
                        }

                        if (oOverlayTreeNode.data.unselectable !== oItem.disabled) {
                            this._disable(oOverlayTreeNode, oItem.disabled);
                            bOverlayRender = true;
                        }

                        if (oStorageEntry.getVisibilitySettingWithParent(this.mapInstanceId, sParentCoreId) !== oOverlayTreeNode.data.select) {
                            oOverlayTreeNode.data.select = oStorageEntry.getVisibilitySettingWithParent(this.mapInstanceId, sParentCoreId);
                            bOverlayRender = true;
                        }

                        if (bOverlayRender) {
                            //oOverlayTreeNode.render();
                            oHighestNode = this._pickHighestInTree(oHighestNode, oOverlayTreeNode);
                            if (sParentCoreId === emp.storage.getRootGuid(this.mapInstanceId)) {
                                oHighestNode = this._pickHighestInTree(oHighestNode, this.oTreeRootNode);
                            }
                        }

                        oHighestNode = undefined;
                    }
                } catch (err) {
                    emp.typeLibrary.Error({
                        coreId: oItem.coreId,
                        level: emp.typeLibrary.Error.level.MAJOR,
                        message: "Error occured while updating an overlay on the tree. " + err.message,
                        jsError: err.stack
                    });
                }
                return this.oHighestNode;
            },
            _updateItem: function(oItem) {
                var oParentTreeNode;
                var oItemTreeNode;
                var aParentNodeList;
                var sParentCoreId;
                var bRenderItem;
                var oStorageEntry;
                var oHighestNode;

                if (oItem.globalType === emp.typeLibrary.types.OVERLAY) {
                    return this._updateOverlay(oItem);
                }

                try {
                    if (oItem.destCoreParent) {
                        oItemTreeNode = this.storageItemTreeNodeMapper.getItemNodeUnderParent(oItem.coreId, oItem.coreParent);
                        if (oItemTreeNode) {
                            // The items is on the tree.
                            // So we remove it from the previous parent.
                            this.storageItemTreeNodeMapper.removeMapping(oItem, oItem.coreParent);
                            if (oItemTreeNode.isExpanded()) {
                                oItemTreeNode.expand(false);
                            }
                            oItemTreeNode.remove();
                        }

                        // Now we get the old parents list of nodes.
                        aParentNodeList = this.storageItemTreeNodeMapper.getParentList(oItem.coreParent);
                        if (aParentNodeList) {
                            var bHasChildren;
                            for (sParentCoreId in aParentNodeList) {
                                oParentTreeNode = aParentNodeList[sParentCoreId];
                                bHasChildren = this._treeNodeHasChildrenInStorage(oParentTreeNode);

                                if (oParentTreeNode !== this.oTreeRootNode) {
                                    if (!bHasChildren) {
                                        oParentTreeNode.data.isLazy = false;
                                    }
                                    //oParentTreeNode.render();
                                    oHighestNode = this._pickHighestInTree(oHighestNode, oParentTreeNode);
                                }
                            }
                        }

                        oItem.coreParent = oItem.destCoreParent;
                        // Now lets see if the new parent is on the tree.
                        if (this.storageItemTreeNodeMapper.isItemOnTree(oItem.coreParent)) {
                            // The new parent is on the tree.
                            if (oItem.coreParent === emp.storage.getRootGuid(this.mapInstanceId)) {
                                // The new parent is the root node.
                                oItemTreeNode = this.oTreeRootNode.addChild(this._getNodeData(oItem, oItem.coreParent));
                                this.storageItemTreeNodeMapper.addMapping(oItemTreeNode.data.storageEntry, oItem.coreParent, oItemTreeNode);
                                //this.oTreeRootNode.render();
                                return this.oTreeRootNode;
                            }
                            // Now we cycle thru all its tree node to see if any is expanded.
                            aParentNodeList = this.storageItemTreeNodeMapper.getParentList(oItem.coreParent);
                            for (sParentCoreId in aParentNodeList) {
                                oParentTreeNode = aParentNodeList[sParentCoreId];
                                if (oParentTreeNode.isExpanded()) {
                                    oStorageEntry = oParentTreeNode.data.storageEntry;
                                    var oNewParentUnderCurrent = this.storageItemTreeNodeMapper.getItemNodeUnderParent(oStorageEntry.getCoreId(), sParentCoreId);
                                    if (oNewParentUnderCurrent && oNewParentUnderCurrent.isExpanded()) {
                                        // This one is expanded.
                                        // So we need to add the item node.
                                        oItemTreeNode = oNewParentUnderCurrent.addChild(this._getNodeData(oItem, oItem.coreParent));
                                        this.storageItemTreeNodeMapper.addMapping(oItemTreeNode.data.storageEntry, oItem.coreParent, oItemTreeNode);
                                        oHighestNode = this._pickHighestInTree(oHighestNode, oNewParentUnderCurrent);
                                    }
                                } else if (oParentTreeNode !== this.oTreeRootNode) {
                                    // This one is not expanded.
                                    if (!oParentTreeNode.isLazy()) {
                                        // Its not lazy so we set it.
                                        oParentTreeNode.data.isLazy = true;
                                    }
                                    //oParentTreeNode.render();
                                    oParentTreeNode.expand();
                                    oHighestNode = this._pickHighestInTree(oHighestNode, oParentTreeNode);
                                }
                            }
                        } else {
                            this.oNodeToLocate = [];
                            this.oNodeToLocate.push(oItem.coreId);
                            this._expandParent(oItem.coreId, false);
                        }

                        // Once the move is process we don't need to do anything else.
                        return oHighestNode;
                    }

                    // Now we must update all the items tree nodes.
                    aParentNodeList = this.storageItemTreeNodeMapper.getParentList(oItem.coreId);
                    if (aParentNodeList === undefined) {
                        // The item parent must have atleast 1 item on it.
                        // This would be a bug. We are updating the item because it was found.
                        // It must have atleast one parent on the tree.
                        return undefined;
                    } else if (!emp.util.isEmptyString(oItem.coreParent)) {
                        // The item has a coreParent. We need to see if this coreParent is on the tree.
                        if (this.storageItemTreeNodeMapper.isItemOnTree(oItem.coreParent)) {
                            // It is on the tree.
                            // We need to see if its already on the oItem's aParentNodeList
                            if (!aParentNodeList.hasOwnProperty(oItem.coreParent)) {
                                // We need to add it to the tree.
                                oHighestNode = this._addItemToAllParentNode(oItem);
                            }
                        }
                    }

                    // Now lets cycle thru the tree nodes.
                    for (sParentCoreId in aParentNodeList) {
                        var sTitle;
                        bRenderItem = false;
                        oItemTreeNode = aParentNodeList[sParentCoreId];
                        oStorageEntry = oItemTreeNode.data.storageEntry;
                        sTitle = this.getItemName(oStorageEntry);

                        if (sTitle !== oItemTreeNode.data.title) {
                            oItemTreeNode.data.title = sTitle;
                            bRenderItem = true;
                        }

                        var sIconURL = this.node_icon(oStorageEntry);

                        if (sIconURL !== oItemTreeNode.data.icon) {
                            oItemTreeNode.data.icon = sIconURL;
                            bRenderItem = true;
                        }

                        if (oItemTreeNode.data.isLazy !== oStorageEntry.hasChildren()) {
                            oItemTreeNode.data.isLazy = oStorageEntry.hasChildren();
                            bRenderItem = true;
                        }

                        if (oItemTreeNode.data.unselectable !== oItem.disabled) {
                            this._disable(oItemTreeNode, oItem.disabled);
                            bRenderItem = true;
                        }

                        var bVisibilityWithParent = oStorageEntry.getVisibilitySettingWithParent(this.mapInstanceId, sParentCoreId);
                        if (bVisibilityWithParent !== oItemTreeNode.isSelected()) {
                            //oItemTreeNode.data.select = bVisibilityWithParent;
                            this._processingRqst = true;
                            oItemTreeNode.select(bVisibilityWithParent);
                            this._processingRqst = false;
                            bRenderItem = true;
                        }

                        //if (oItem.visible !== oItemTreeNode.isSelected())
                        //{
                        //    //console.log("Visibility of " + oItemTreeNode.data.title + " is now " + (oItem.visible? "on.":"off."));
                        //    oItemTreeNode.select(oItem.visible);
                        //    bRenderItem = true;
                        //}

                        if (bRenderItem) {
                            //oHighestNode = this._pickHighestInTree(oHighestNode, oItemTreeNode);
                            oItemTreeNode.render();
                        }
                    }
                } catch (err) {
                    emp.typeLibrary.Error({
                        coreId: oItem.coreId,
                        level: emp.typeLibrary.Error.level.MAJOR,
                        message: "Error occured while updating item on the tree. " + err.message,
                        jsError: err.stack
                    });
                }

                return oHighestNode;
            },
            /**
             * Updates object to the dynaTree
             * @param {object} args Transaction object {@link global/Transaction}
             * @method
             * @memberof emp.dataExplorer
             */
            update: function(args) {
                'use strict';
                var oHighestNode;
                var oTreeNode;

                var bPrevValue = this.oTree.enableUpdate(false);

                for (var i = 0; i < args.items.length; i = i + 1) {
                    oTreeNode = this._updateItem(args.items[i]);
                    oHighestNode = this._pickHighestInTree(oHighestNode, oTreeNode);
                }

                if ((oHighestNode !== undefined) && (oHighestNode !== null)) {
                    oHighestNode.render();
                }

                this.oTree.enableUpdate(bPrevValue, oHighestNode);
            },
            _disable: function(oTreeNode, disabled) {
                'use strict';
                var parentNode = oTreeNode.getParent();

                if (oTreeNode && disabled) {

                    oTreeNode.data.hideCheckbox = true;
                    oTreeNode.data.unselectable = true;
                    if (oTreeNode && oTreeNode.span) {
                        $(oTreeNode.span).addClass("disabled-node");
                        oTreeNode.data.addClass = "disabled-node";
                    }
                } else if (oTreeNode && !disabled && parentNode && !parentNode.data.unselectable) {
                    // enabled feature only when the parent feature is also enabled.
                    oTreeNode.data.hideCheckbox = false;
                    oTreeNode.data.unselectable = false;
                    if (oTreeNode && oTreeNode.span) {
                        $(oTreeNode.span).removeClass("disabled-node");
                        oTreeNode.data.addClass = "";
                    }
                }

                if (oTreeNode && oTreeNode.getChildren()) {
                    oTreeNode.getChildren().forEach(function(childNode) {
                        // var parentNode = childNode.getParent();
                        if (childNode) {
                            this._disable(childNode, oTreeNode.data.unselectable);
                        }
                    });
                }
            },
            _visibilityWMS: function(oTreeNode, oItem) {
                if (!oTreeNode.hasChildren()) {
                    return;
                }

                var oChildrenList = oTreeNode.getChildren();
                var oChild;

                for (var iIndex = 0; iIndex < oChildrenList.length; iIndex++) {
                    oChild = oChildrenList[iIndex];
                    switch (oChild.data.type) {
                        case "WMS_FOLDER":
                            if (oItem.isFolderSelected(oChild.data.folderInfo.title)) {
                                oChild.select(true);
                            } else {
                                oChild.select(false);
                            }
                            break;
                        case "WMS_LAYER":
                            if (oItem.isLayerSelected(oChild.data.layerInfo.name)) {
                                oChild.select(true);
                            } else {
                                oChild.select(false);
                            }
                            break;
                    }

                    this._visibilityWMS(oChild, oItem);
                }
            },
            /**
             * Changes checkmark on tree.
             * @param {object} args Transaction object {@link global/Transaction}
             * @method
             * @memberof emp.dataExplorer
             */
            visibility: function(args) {

                'use strict';
                var oTreeNode;
                var oItem;
                var sCoreId;
                var oParentList;

                //if (args.source === emp.core.sources.CORE)
                //{
                //    return; // if we sent the transaction ignore it.
                //}

                if (this._processingRqst) {
                    return;
                }
                this._processingRqst = true;
                //var bPrevVal = this.oTree.enableUpdate(false);

                try {
                    for (var iIndex = 0; iIndex < args.items.length; iIndex++) {
                        oItem = args.items[iIndex];

                        if (oItem.hasOwnProperty('coreParent')) {
                            // The parent was provided.
                            oTreeNode = this.storageItemTreeNodeMapper.getItemNodeUnderParent(oItem.coreId, oItem.coreParent);

                            if (oTreeNode) {
                                oTreeNode.select(oTreeNode.data.storageEntry.getVisibilitySettingWithParent(this.mapInstanceId, oItem.coreParent));

                                if (oItem.globalType === emp.typeLibrary.types.WMS) {
                                    // If its a WMS service we must set the layers and folders.
                                    this._visibilityWMS(oTreeNode, oItem);
                                }
                            }
                        } else {
                            // The parent was not provided so we afftect the visibility with
                            // all its parents.
                            oParentList = this.storageItemTreeNodeMapper.getParentList(oItem.coreId);

                            if (oParentList !== undefined) {
                                for (sCoreId in oParentList) {
                                    if (oParentList.hasOwnProperty(sCoreId)) {
                                        oTreeNode = this.storageItemTreeNodeMapper.getItemNodeUnderParent(oItem.coreId, sCoreId);

                                        if (oTreeNode) {
                                            oTreeNode.select(oTreeNode.data.storageEntry.getVisibilitySettingWithParent(this.mapInstanceId, sCoreId));

                                            if (oItem.globalType === emp.typeLibrary.types.WMS) {
                                                // If its a WMS service we must set the layers and folders.
                                                this._visibilityWMS(oTreeNode, oItem);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (Err) {}

                //this.oTree.enableUpdate(bPrevVal);
                this._processingRqst = false;
            },
            _expandParent: function(args, bSelect) {
                var oCoreIds;
                var sParentCoreId;
                var aParentCoreIds;
                var oParentNode;
                var oParentStorageEntry;
                var oThis = this;
                var oStorageEntry = emp.storage.findObject(args.coreId);

                if (!oStorageEntry)
                    return;

                if (bSelect === undefined) {
                    bSelect = true;
                }
                this.selectWhenFound = bSelect;

                sParentCoreId = args.parentCoreId;

                if (sParentCoreId === emp.storage.getRootGuid(this.mapInstanceId)) {
                    // We reached the root. Now we start waiting for the node to expand.
                    // We must expand in a timer because the lazy loading is async.
                    setTimeout(function() {
                        oThis._checkForNode();
                    }, 100);
                    return;
                }

                oParentNode = this.storageItemTreeNodeMapper.getItemNodeUnderParent(args.coreId, sParentCoreId);

                if (!oParentNode) {
                    // The parent is not on the tree. We must expand its parent.
                    oParentStorageEntry = emp.storage.findObject(sParentCoreId);
                    aParentCoreIds = oParentStorageEntry.getParentCoreIdsOnMap(this.mapInstanceId);
                    oCoreIds = {
                        coreId: sParentCoreId,
                        parentCoreId: aParentCoreIds[0]
                    };
                    this.oNodeToLocate.push(oCoreIds);
                    this._expandParent(oCoreIds, bSelect);
                } else if (!oParentNode.isExpanded()) {
                    // His parent is on the tree, but not expanded. So we expand it.
                    oParentNode.expand(true);
                }

                // We must wait because the lazy loading is async.
                setTimeout(function() {
                    oThis._checkForNode();
                }, 100);
                return;
            },
            _checkForNode: function(args) {
                var oThis = this;
                var iLastElementIndex = this.oNodeToLocate.length - 1;
                var oCoreIds = this.oNodeToLocate[iLastElementIndex];
                //var oStorageEntry = emp.storage.findObject(oCoreIds.coreId);
                var oNode = this.storageItemTreeNodeMapper.getItemNodeUnderParent(oCoreIds.coreId, oCoreIds.parentCoreId);

                if (!oNode) {
                    // The node is still not on the tree, so wait.
                    setTimeout(function() {
                        oThis._checkForNode();
                    }, 100);
                    return;
                }
                if (iLastElementIndex === 0) {
                    oNode.activate();
                    //oNode.select();
                    if (this.selectWhenFound) {
                        oNode.focus();
                    }
                    var activeNode = oNode.li;
                    $('#' + this.domContainer + '_tree ul').animate({
                        scrollTop: $(activeNode).offset().top - $('#' + this.domContainer + '_tree ul').offset().top + $('#' + this.domContainer + '_tree ul').scrollTop()
                    }, 'slow');
                } else {
                    // Its a parent node and it is now on the tree.
                    // Pop it of the list.
                    this.oNodeToLocate.pop();
                    // We must expand it and wait again.
                    oNode.expand(true);
                    setTimeout(function() {
                        oThis._checkForNode();
                    }, 100);
                }
            },
            select: function(args) {
                'use strict';

                var node;

                try {
                    node = this.storageItemTreeNodeMapper.getItemNodeUnderParent(args.coreId, args.parentCoreId);

                    if (!node) {
                        // If the node is not on the tree we need to expand its parents.
                        this.oNodeToLocate = [];
                        this.oNodeToLocate.push({
                            coreId: args.coreId,
                            parentCoreId: args.parentCoreId
                        });
                        this._expandParent(args, true);
                        return;
                    }
                    node.activate();
                    node.select();
                    node.focus();
                    var activeNode = node.li;
                    $('#' + this.domContainer + '_tree ul').animate({
                        scrollTop: $(activeNode).offset().top - $('#' + this.domContainer + '_tree ul').offset().top + $('#' + this.domContainer + '_tree ul').scrollTop()
                    }, 'slow');
                } catch (err) {
                    console.log('silentActivateNode: ' + err.message);
                }
            },
            view: function(args) {
                'use strict';
                try {

                    if (!args.data.unselectable) {
                        //locate node only if not disabled. disabled == unselectable
                        // If the entry is not visible make it visible.
                        if (!args.bSelected) {
                            args.select(true);
                            this.visible(true, args);
                        }

                        switch (args.data.type) {
                            case emp.typeLibrary.types.FEATURE:
                                args.data.storageEntry.locate({
                                    component: 'de',
                                    mapInstanceId: this.mapInstanceId
                                });
                                break;
                            case emp.typeLibrary.types.OVERLAY:
                                args.data.storageEntry.locate({
                                    component: 'de',
                                    mapInstanceId: this.mapInstanceId
                                });
                                break;
                            case emp.typeLibrary.types.STATIC:
                                args.data.storageEntry.locate({
                                    component: 'de',
                                    mapInstanceId: this.mapInstanceId
                                });
                                break;
                            case emp.typeLibrary.types.WMS:
                                args.data.storageEntry.locate({
                                    component: 'de',
                                    mapInstanceId: this.mapInstanceId
                                });
                                break;
                            case "WMS_FOLDER":
                                args.data.storageEntry.locate({
                                    bounds: args.data.folderInfo.bounds,
                                    component: 'de',
                                    mapInstanceId: this.mapInstanceId
                                });
                                break;
                            case "WMS_LAYER":
                                args.data.storageEntry.locate({
                                    bounds: args.data.layerInfo.bounds,
                                    component: 'de',
                                    mapInstanceId: this.mapInstanceId
                                });
                                break;
                        }
                    }
                } catch (err) {
                    emp.typeLibrary.Error({
                        level: 1,
                        message: '[CORE][DE] View invocation failed.'
                    });
                }
            },
            visible: function(selected, oNode) {
                'use strict';
                var oStorageEntry;
                var oTransaction;

                if (this._processingRqst) {
                    return;
                }

                this._processingRqst = true;

                oTransaction = new emp.typeLibrary.Transaction({
                    intent: emp.intents.control.MI_VISIBILITY_SET,
                    mapInstanceId: this.mapInstanceId,
                    source: emp.core.sources.CORE,
                    items: []
                });

                try {
                    if (selected) {
                        var oCurrentNode = oNode;

                        while (oCurrentNode !== this.oTreeRootNode) {
                            switch (oCurrentNode.data.type) {
                                case emp.typeLibrary.types.FEATURE:
                                case emp.typeLibrary.types.OVERLAY:
                                case emp.typeLibrary.types.STATIC:
                                    oStorageEntry = oCurrentNode.data.storageEntry;
                                    if (oCurrentNode === oNode) {
                                        oStorageEntry.visibility(oTransaction, oCurrentNode.data.parentCoreId, true, true);
                                    } else {
                                        if (!oCurrentNode.isSelected()) {
                                            oCurrentNode.select(true);
                                        }
                                        oStorageEntry.visibility(oTransaction, oCurrentNode.data.parentCoreId, true, true);
                                    }
                                    break;
                                case emp.typeLibrary.types.WMS:
                                    var oWMSItem = oCurrentNode.data.storageEntry;

                                    if (oNode === oCurrentNode) {
                                        var oaDefaultLayers = oWMSItem.getDefaultLayers();

                                        // Process WMS service only if its is the one clicked.
                                        // Check to see if it has default Layers.
                                        if (oaDefaultLayers.length > 0) {
                                            // It has default layers.
                                            // So they must be all on or all off.
                                            oWMSItem.setActiveLayers(this.mapInstanceId, oaDefaultLayers);
                                        } else {
                                            oWMSItem.setActiveLayers(this.mapInstanceId, this._getActiveLayers(oNode));
                                        }

                                        oWMSItem.visibility(oTransaction, oCurrentNode.data.parentCoreId, true, false);
                                    } else {
                                        oWMSItem.visible = true;
                                        oCurrentNode.select(true);
                                    }
                                    break;
                                case "WMS_FOLDER":
                                case "WMS_LAYER":
                                    var oWMSItem = oCurrentNode.data.storageEntry;

                                    if (oNode === oCurrentNode) {
                                        // Process WMS layers and folders only if its is the one clicked.
                                        // We should never hit this if there are defaut layers.
                                        // But just in case we end up displaying deafult layers.
                                        var oWMSNode = this.oTree.getNodeByKey(oCurrentNode.data.serviceKey);
                                        var oaDefaultLayers = oWMSItem.getDefaultLayers();

                                        if (oaDefaultLayers.length > 0) {
                                            oWMSItem.setActiveLayers(this.mapInstanceId, oaDefaultLayers);
                                        } else {
                                            var oTempNode = oCurrentNode.getParent();

                                            while (oTempNode !== oWMSNode.getParent()) {
                                                if (!oTempNode.isSelected()) {
                                                    oTempNode.select(true);
                                                }
                                                oTempNode = oTempNode.getParent();
                                            }

                                            oWMSItem.setActiveLayers(this.mapInstanceId, this._getActiveLayers(oWMSNode));
                                        }

                                        oWMSItem.visibility(oTransaction, oWMSNode.data.parentCoreId, true, false);
                                    } else {
                                        oStorageEntry = null;
                                        oCurrentNode.select(true);
                                    }

                                    if (oCurrentNode.data.type === "WMS_FOLDER") {
                                        oWMSItem.selectFolder(this.mapInstanceId, oCurrentNode.data.title);
                                    } else {
                                        oWMSItem.selectLayer(this.mapInstanceId, oCurrentNode.data.layerInfo.name);
                                    }

                                    break;
                            }

                            oCurrentNode = oCurrentNode.getParent();
                        }
                    } else {
                        switch (oNode.data.type) {
                            case emp.typeLibrary.types.FEATURE:
                            case emp.typeLibrary.types.OVERLAY:
                            case emp.typeLibrary.types.STATIC:
                                oStorageEntry = oNode.data.storageEntry;
                                oStorageEntry.visibility(oTransaction, oNode.data.parentCoreId, selected, true);
                                break;
                            case emp.typeLibrary.types.WMS:
                                {
                                    var oWMSItem = oNode.data.storageEntry;
                                    var oaDefaultLayers = oWMSItem.getDefaultLayers();

                                    // Check to see if it has default Layers.
                                    if (oaDefaultLayers.length > 0) {
                                        // It has default layers.
                                        // So they must be all on or all off.
                                        oWMSItem.clearActiveLayers(this.mapInstanceId);
                                    } else {
                                        oWMSItem.setActiveLayers(this.mapInstanceId, this._getActiveLayers(oNode));
                                    }

                                    oWMSItem.visibility(oTransaction, oNode.data.parentCoreId, false, false);
                                }
                                break;
                            case "WMS_FOLDER":
                            case "WMS_LAYER":
                                {
                                    // We should never hit this if there are defaut layers.
                                    // But just in case we end up displaying deafult layers.
                                    var oWMSItem = oNode.data.storageEntry;
                                    var oWMSNode = this.oTree.getNodeByKey(oNode.data.serviceKey);
                                    var oaDefaultLayers = oWMSItem.getDefaultLayers();


                                    if (oaDefaultLayers.length > 0) {
                                        oWMSItem.clearActiveLayers(this.mapInstanceId);
                                    } else {
                                        oWMSItem.setActiveLayers(this.mapInstanceId, this._getActiveLayers(oWMSNode));
                                    }

                                    if (oNode.data.type === "WMS_FOLDER") {
                                        oWMSItem.unselectFolder(this.mapInstanceId, oNode.data.title);
                                    } else {
                                        oWMSItem.unselectLayer(this.mapInstanceId, oNode.data.layerInfo.name);
                                    }

                                    oWMSItem.visibility(oTransaction, oWMSNode.data.parentCoreId, false, false);
                                }
                                break;
                        }
                    }
                    oTransaction.run();
                } catch (err) {
                    emp.typeLibrary.Error({
                        level: 1,
                        message: 'Visibility invocation failed.',
                        jsError: err
                    });
                }
                this._processingRqst = false;
            },
            _getActiveLayers: function(oWMSNode) {
                var oaActiveLayer = [];

                if (oWMSNode.isSelected() && (oWMSNode.countChildren() > 0)) {
                    var oChildren = oWMSNode.getChildren();
                    for (var iIndex = 0; iIndex < oChildren.length; iIndex++) {
                        if ((oChildren[iIndex].data.type === "WMS_LAYER") && oChildren[iIndex].isSelected()) {
                            // Add it to the list only if its a layer and its selected.
                            oaActiveLayer.push(oChildren[iIndex].data.layerInfo.name);
                        }

                        if (oChildren[iIndex].countChildren() > 0) {
                            var oaTemp = this._getActiveLayers(oChildren[iIndex]);

                            if (oaTemp.length > 0)
                                oaActiveLayer = oaActiveLayer.concat(oaTemp);
                        }
                    }
                }
                return oaActiveLayer;
            },
            _flush: function(args) {
                $('#' + this.domContainer + '_tree').dynatree('getRoot').removeChildren();
            },
            _dropStatic: function(oParentNode) {
                var oChildren = oParentNode.getChildren();

                if ((oChildren === null) || (oChildren === undefined))
                    return;

                // This is the recursive process to get rid of
                // Static items on the explorer.
                for (var iIndex = 0; iIndex < oChildren.length;) {
                    if (oChildren[iIndex].data.type === emp.typeLibrary.types.STATIC) {
                        oParentNode.removeChild(oChildren[iIndex]);
                        // We  do not increament index because we removed the entry.
                    } else {
                        this._dropStatic(oChildren[iIndex]);
                        iIndex++;
                    }
                }
            },
            prepareForReload: function() {
                var bPrevValue = this.oTree.enableUpdate(false);
                this._dropStatic(this.oTreeRootNode);
                this.oTree.enableUpdate(bPrevValue);
            },
            _updateNodes: function(oNode) {
                var oChildren = oNode.getChildren();

                if (oNode !== this.oTreeRootNode) {
                    if (oNode.data.storageEntry) {
                        var oStorageEntry = oNode.data.storageEntry;
                        if ((oStorageEntry.getCoreObjectType() === emp.typeLibrary.types.FEATURE) && !oStorageEntry.canMapEnginePlot(this.mapInstanceId)) {
                            oNode.data.tooltip = this._mapCantPlotToolTip;
                            oNode.data.select = false;
                            oNode.data.unselectable = true;
                            oNode.data.hideCheckbox = true;
                            oNode.data.readOnly = true;
                            oNode.data.editable = false;
                            oNode.data.icon = this.node_icon(oStorageEntry);
                        } else {
                            oNode.data.tooltip = null;
                            oNode.data.select = (oStorageEntry.getVisibilitySettingWithParent(this.mapInstanceId, oNode.data.parentCoreId) !== false);
                            oNode.data.unselectable = oStorageEntry.isDisabled();
                            oNode.data.hideCheckbox = oStorageEntry.isDisabled() ||
                                ((oStorageEntry.getCoreObjectType() === emp.typeLibrary.types.FEATURE) ? oStorageEntry.isInEditMode() : false);
                            oNode.data.readOnly = oStorageEntry.isReadOnly();
                            oNode.data.editable = !oStorageEntry.isReadOnly();
                            oNode.data.icon = this.node_icon(oStorageEntry);
                        }
                    }
                }

                if ((oChildren !== null) && (oChildren !== undefined)) {
                    for (var iIndex = 0; iIndex < oChildren.length; iIndex++) {
                        this._updateNodes(oChildren[iIndex]);
                    }
                }
            },
            storageReloadComplete: function() {
                var bPrevValue = this.oTree.enableUpdate(false);
                var oNode = this.oTreeRootNode;
                this._updateNodes(oNode);
                this.oTree.enableUpdate(bPrevValue);
            },
            checkIfCanvasSupported: function() {
                var canvas = document.createElement("canvas");
                this.isCanvasSupported = false;

                if (canvas && canvas.getContext) {
                    this.isCanvasSupported = true;
                }

                return this.isCanvasSupported;
            },
            node_current: "",
            node_editHold: {},
            node_get: function(args) {
                return $("#" + this.mapInstanceId + "_tree").dynatree("getTree").getNodeByKey(args);
            },
            node_lock: function(args) {
                var oTreeNode;
                var oParentList;
                var oEditTransaction = args.items[0];
                var oFeature = oEditTransaction.items[0].originFeature;

                if (!oFeature) {
                    return;
                }

                oParentList = this.storageItemTreeNodeMapper.getParentList(oFeature.coreId);

                // Go thru all the tree node containg the feature.
                for (var sParentCoreId in oParentList) {
                    oTreeNode = oParentList[sParentCoreId];

                    if (oTreeNode !== undefined) {
                        //node.data.unselectable = true; //make it unselectable
                        oTreeNode.data.hideCheckbox = true; //hide the checkbox (more for UI purposes)
                        oTreeNode.data.icon = { material_icon: 'edit' };
                        oTreeNode.render(true);
                    }
                }
            },
            node_unlock: function(args) {
                var oTreeNode,
                    oParentList,
                    i,
                    items,
                    oFeature,
                    oStorageEntry,
                    len;

                if (args.items && (args.items.length > 0)) {
                    oFeature = args.items[0];
                    oStorageEntry = emp.storage.get.id({ id: oFeature.coreId });
                    oParentList = this.storageItemTreeNodeMapper.getParentList(oFeature.coreId);

                    // Go thru all the tree node containg the feature.
                    for (var sParentCoreId in oParentList) {
                        oTreeNode = oParentList[sParentCoreId];

                        if (oTreeNode !== undefined) {
                            //node.data.unselectable = false; //make it unselectable
                            oTreeNode.data.hideCheckbox = false; //hide the checkbox (more for UI purposes)
                            oTreeNode.data.icon = this.node_icon(oStorageEntry);
                            oTreeNode.render(true);
                        }
                    }
                }
                if (args.failures && (args.failures.length > 0)) {
                    items = args.failures;
                    for (i = 0, len = items.length; i !== len; i = i + 1) {
                        oFeature = emp.storage.get.id({ id: items[i].coreId });
                        if (oFeature !== undefined && oFeature !== null) {
                            oStorageEntry = emp.storage.get.id({ id: oFeature.coreId });
                            oParentList = this.storageItemTreeNodeMapper.getParentList(oFeature.coreId);

                            // Go thru all the tree node containg the feature.
                            for (var sParentCoreId in oParentList) {
                                oTreeNode = oParentList[sParentCoreId];

                                if (oTreeNode !== undefined) {
                                    //node.data.unselectable = false; //make it unselectable
                                    oTreeNode.data.hideCheckbox = false; //hide the checkbox (more for UI purposes)
                                    oTreeNode.data.icon = this.node_icon(oStorageEntry);
                                    oTreeNode.render(true);
                                }
                            }
                        }
                    }
                }
            },
            node_icon: function(oStorageEntry) {
                var sLineColor;
                var sFillColor;
                var iStandard;
                var icon,
                    standard = "2525b";

                if ((oStorageEntry.getCoreObjectType() === emp.typeLibrary.types.FEATURE) && oStorageEntry.isInEditMode()) {
                    return { material_icon: 'edit' };
                }

                if (oStorageEntry.getProperties().hasOwnProperty('modifiers') && oStorageEntry.getProperties().modifiers.hasOwnProperty('standard')) {
                    standard = oStorageEntry.getProperties().modifiers.standard.toLowerCase();
                    if (!(standard === "2525b" || standard === "2525c")) {
                        standard = "2525b";
                    }
                }

                switch (oStorageEntry.getCoreObjectType()) {
                    case emp.typeLibrary.types.WMS:
                        icon = { material_icon: 'map' };
                        break;
                    case emp.typeLibrary.types.STATIC:
                        icon = { material_icon: 'lock_outline' };
                        break;
                    case emp.typeLibrary.types.FEATURE:
                        if (!oStorageEntry.canMapEnginePlot(this.mapInstanceId)) {
                            icon = { material_icon: 'warning' };
                        } else if (oStorageEntry.getURL()) {
                            switch (oStorageEntry.getFormat()) {
                                case emp.typeLibrary.featureFormatType.IMAGE:
                                    icon = { material_icon: 'image' };
                                    break;
                                default:
                                    icon = { material_icon: 'cloud_download' };
                                    break;
                            }
                        } else if (!emp.helpers.isEmptyString(oStorageEntry.getProperties().iconUrl)) {
                            icon = oStorageEntry.getProperties().iconUrl;
                        } else if (!emp.helpers.isEmptyString(oStorageEntry.getSymbolCode()) && (oStorageEntry.getFormat() === emp.typeLibrary.featureFormatType.MILSTD)) {
                            sLineColor = oStorageEntry.getProperties().lineColor;
                            sFillColor = oStorageEntry.getProperties().fillColor;
                            iStandard = (oStorageEntry.getMilStdVersion() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B) ? 0 : 1;

                            if ((sLineColor !== undefined) && (sLineColor.length > 5)) {
                                sLineColor = sLineColor.substr(sLineColor.length - 6, 6);
                            }

                            if ((sFillColor !== undefined) && (sFillColor.length > 5)) {
                                sFillColor = sFillColor.substr(sFillColor.length - 6, 6);
                            }

                            if (this.isCanvasSupported) {
                                var modifiers = {},
                                    msa = armyc2.c2sd.renderer.utilities.MilStdAttributes,
                                    image;

                                modifiers[msa.PixelSize] = 32;
                                modifiers[msa.Icon] = true;
                                modifiers[msa.SymbologyStandard] = iStandard;

                                if (sLineColor !== undefined) {
                                    modifiers[msa.LineColor] = "#" + sLineColor;
                                }

                                if (sFillColor !== undefined) {
                                    modifiers[msa.FillColor] = "#" + sFillColor;
                                }
                                image = armyc2.c2sd.renderer.MilStdIconRenderer.Render(oStorageEntry.getSymbolCode(), modifiers);
                                icon = image.toDataUrl();
                            } else {
                                icon = "/mil-sym-service/renderer/image/" + oStorageEntry.getSymbolCode() + "?size=32&symstd=" + standard + "&icon=true";

                                if (sLineColor !== undefined) {
                                    icon += "&linecolor=" + sLineColor;
                                }

                                if (sFillColor !== undefined) {
                                    icon += "&fillcolor=" + sFillColor;
                                }
                            }
                        } else {
                            icon = { material_icon: 'location_on' };
                        }
                        break;
                    case emp.typeLibrary.types.OVERLAY:
                        if (emp.helpers.isEmptyString(oStorageEntry.getProperties().iconUrl)) {
                            icon = { material_icon: 'collections_bookmark' };
                        } else {
                            icon = oStorageEntry.getProperties().iconUrl;
                        }

                        break;
                }

                return icon;
            }
        };

        return publicInterface;
    };



    var tree_storageItemTreeNodeMapper = function(args) {
        var privateInterface = {
            oStorageItemParentList: {},
            oStorageItemChildList: {},
            mapInstanceId: args.mapInstanceId
        };

        var publicInterface = {
            addMapping: function(oStorageEntry, sParentId, oTreeNode) {
                var sParentCoreId = (sParentId ? sParentId : emp.storage.getRootGuid(privateInterface.mapInstanceId));
                if (oStorageEntry.getCoreId() !== emp.storage.getRootGuid(privateInterface.mapInstanceId)) {
                    // Add it to the StorageItemParent list.
                    if (privateInterface.oStorageItemParentList[oStorageEntry.getCoreId()] === undefined) {
                        // The storage item is not on the list, we need to add it.
                        privateInterface.oStorageItemParentList[oStorageEntry.getCoreId()] = {};
                    }
                    if (privateInterface.oStorageItemParentList[oStorageEntry.getCoreId()][sParentCoreId] === undefined) {
                        privateInterface.oStorageItemParentList[oStorageEntry.getCoreId()][sParentCoreId] = oTreeNode;
                    }

                    // Now add it to the oStorageItemChildList.
                    if (privateInterface.oStorageItemChildList[sParentCoreId] === undefined) {
                        privateInterface.oStorageItemChildList[sParentCoreId] = {};
                    }

                    if (privateInterface.oStorageItemChildList[sParentCoreId][oStorageEntry.getCoreId()] === undefined) {
                        privateInterface.oStorageItemChildList[sParentCoreId][oStorageEntry.getCoreId()] = oTreeNode;
                    }
                }
            },
            removeMapping: function(oStorageEntry, sParentId) {
                var sParentCoreId = (sParentId ? sParentId : emp.storage.getRootGuid(privateInterface.mapInstanceId));

                if (oStorageEntry.getCoreId() !== emp.storage.getRootGuid(privateInterface.mapInstanceId)) {
                    if (privateInterface.oStorageItemParentList[oStorageEntry.getCoreId()] !== undefined) {
                        if (privateInterface.oStorageItemParentList[oStorageEntry.getCoreId()][sParentCoreId] !== undefined) {
                            delete privateInterface.oStorageItemParentList[oStorageEntry.getCoreId()][sParentCoreId];

                            if (emp.helpers.associativeArray.isEmpty(privateInterface.oStorageItemParentList[oStorageEntry.getCoreId()])) {
                                // if its empty delete it.
                                delete privateInterface.oStorageItemParentList[oStorageEntry.getCoreId()];
                            }
                        }
                    }

                    if (privateInterface.oStorageItemChildList[sParentCoreId] !== undefined) {
                        if (privateInterface.oStorageItemChildList[sParentCoreId][oStorageEntry.getCoreId()] !== undefined) {
                            delete privateInterface.oStorageItemChildList[sParentCoreId][oStorageEntry.getCoreId()];

                            if (emp.helpers.associativeArray.isEmpty(privateInterface.oStorageItemChildList[sParentCoreId])) {
                                // if its empty delete it.
                                delete privateInterface.oStorageItemChildList[sParentCoreId];
                            }
                        }
                    }
                }
            },
            getParentList: function(sCoreId) {
                return privateInterface.oStorageItemParentList[sCoreId];
            },
            getChildList: function(sCoreId) {
                return privateInterface.oStorageItemChildList[sCoreId];
            },
            getParentCoreIdList: function(sCoreId) {
                if (privateInterface.oStorageItemParentList[sCoreId] !== undefined) {
                    return emp.helpers.associativeArray.getKeys(privateInterface.oStorageItemParentList[sCoreId]);
                }

                return [];
            },
            getChildCoreIdList: function(sCoreId) {
                if (privateInterface.oStorageItemChildList[sCoreId] !== undefined) {
                    return emp.helpers.associativeArray.getKeys(privateInterface.oStorageItemChildList[sCoreId]);
                }

                return [];
            },
            isAnyNodeExpanded: function(sCoreId) {
                if (privateInterface.oStorageItemParentList[sCoreId] === undefined) {
                    return false;
                }

                for (var sParentCoreId in privateInterface.oStorageItemParentList[sCoreId]) {
                    if (privateInterface.oStorageItemParentList[sCoreId][sParentCoreId].isExpanded()) {
                        return true;
                    }
                }

                return false;
            },
            setLazy: function(sCoreId, bSetting) {
                if (sCoreId === emp.storage.getRootGuid(privateInterface.mapInstanceId)) {
                    // The root can't be lazy.
                    return;
                }
                if (privateInterface.oStorageItemParentList[sCoreId] === undefined) {
                    return;
                }
                var oTreeNode;
                for (var sParentCoreId in privateInterface.oStorageItemParentList[sCoreId]) {
                    oTreeNode = privateInterface.oStorageItemParentList[sCoreId][sParentCoreId];

                    switch (oTreeNode.data.type) {
                        case emp.typeLibrary.types.FEATURE:
                        case emp.typeLibrary.types.OVERLAY:
                            if (oTreeNode.isLazy() !== bSetting) {
                                oTreeNode.data.isLazy = bSetting;
                                //oTreeNode.render();
                            }
                            break;
                    }
                }
            },
            isItemOnTree: function(sCoreId) {
                if (sCoreId === emp.storage.getRootGuid(privateInterface.mapInstanceId)) {
                    // The root is always on the tree.
                    return true;
                }
                return (privateInterface.oStorageItemParentList[sCoreId] === undefined) ? false : true;
            },
            getItemNodeUnderParent: function(sChildCoreId, sParentCoreId) {
                var sParentID = (sParentCoreId ? sParentCoreId : emp.storage.getRootGuid(privateInterface.mapInstanceId));
                if (privateInterface.oStorageItemParentList[sChildCoreId] === undefined) {
                    return undefined;
                }

                return privateInterface.oStorageItemParentList[sChildCoreId][sParentID];

            },
            clear: function() {
                privateInterface.oStorageItemChildList = {};
                privateInterface.oStorageItemParentList = {};
            }
        };

        return publicInterface;
    };

    var emp_ui_treeManager = (function() {
        var oTreeInstanceList = {};

        var privateInterface = {
            lockNode: function(oTrans) {
                var oTreeInstance = oTreeInstanceList[oTrans.mapInstanceId];

                if (oTreeInstance) {
                    oTreeInstance.node_lock(oTrans);
                }
            },

            unlockNode: function(oTrans) {
                var oTreeInstance = oTreeInstanceList[oTrans.mapInstanceId];

                if (oTreeInstance) {
                    oTreeInstance.node_unlock(oTrans);
                }
            },

            addNode: function(oTrans) {
                var oTreeInstance = oTreeInstanceList[oTrans.mapInstanceId];

                if (oTrans.source === emp.core.sources.STORAGE) {
                    //Its a reload so ignore it.
                    return;
                }
                if (oTreeInstance) {
                    oTreeInstance.add(oTrans);
                }
            },

            removeNode: function(oTrans) {
                var oTreeInstance = oTreeInstanceList[oTrans.mapInstanceId];

                if (oTreeInstance) {
                    oTreeInstance.remove(oTrans);
                }
            },

            updateNode: function(oTrans) {
                var oTreeInstance = oTreeInstanceList[oTrans.mapInstanceId];

                if (oTreeInstance) {
                    oTreeInstance.update(oTrans);
                }
            },

            clearNode: function(oTrans) {
                var oTreeInstance = oTreeInstanceList[oTrans.mapInstanceId];

                if (oTreeInstance) {
                    oTreeInstance.clear(oTrans);
                }
            },

            visibilityNode: function(oTrans) {
                var oTreeInstance = oTreeInstanceList[oTrans.mapInstanceId];

                if (oTreeInstance) {
                    oTreeInstance.visibility(oTrans);
                }
            },

            prepareForReload: function(oTrans) {
                var oInstanceData = oTreeInstanceList[oTrans.mapInstanceId];

                if (oInstanceData) {
                    oInstanceData.prepareForReload(oTrans);
                }
            },

            storageReloadComplete: function(oTrans) {
                var oTreeInstance = oTreeInstanceList[oTrans.mapInstanceId];

                if (oTreeInstance) {
                    oTreeInstance.storageReloadComplete(oTrans);
                }
            }
        };

        var publicInterface = {
            newMapInstance: function(args) {
                var oInstanceData = new emp_ui_tree(args);

                oTreeInstanceList[args.mapInstanceId] = oInstanceData;

                // Listent to intents for set the icon for drawing / editing in tree
                emp.transactionQueue.listener.add({
                    type: emp.intents.control.EDIT_START,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.lockNode
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.EDIT_BEGIN,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.unlockNode
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.DRAW_START,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.lockNode
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.DRAW_BEGIN,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.unlockNode
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.MI_FEATURE_ADD,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.addNode
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.MI_WMS_ADD,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.addNode
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.STORAGE_OBJECT_ADDED,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.addNode
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.LAYER_ADD,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.addNode
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.STATIC_CONTENT,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.addNode
                });

                // Listen to all the removes.
                emp.transactionQueue.listener.add({
                    type: emp.intents.control.MI_WMS_REMOVE,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.removeNode
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.MI_FEATURE_REMOVE,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.removeNode
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.STORAGE_OBJECT_REMOVED,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.removeNode
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.LAYER_REMOVE,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.removeNode
                });

                // Listen to all the updates.
                emp.transactionQueue.listener.add({
                    type: emp.intents.control.FEATURE_UPDATE,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.updateNode
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.OVERLAY_UPDATE,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.updateNode
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.STORAGE_OBJECT_UPDATED,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.updateNode
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.LAYER_UPDATE,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.updateNode
                });

                // Listen to all the clears.
                emp.transactionQueue.listener.add({
                    type: emp.intents.control.OVERLAY_CLEAR,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.clearNode
                });

                // Listen to the visibility.
                emp.transactionQueue.listener.add({
                    type: emp.intents.control.MI_VISIBILITY_SET,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.visibilityNode
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.MAP_ENGINE_SWAP_START,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.prepareForReload
                });

                emp.transactionQueue.listener.add({
                    type: emp.intents.control.MAP_ENGINE_SWAP_COMPLETE,
                    mapInstanceId: args.mapInstanceId,
                    callback: privateInterface.storageReloadComplete
                });

                return oInstanceData;
            },
            removeMapInstance: function(mapInstanceId) {
                var oInstanceData = oTreeInstanceList[mapInstanceId];

                if (oInstanceData) {
                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.EDIT_START,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.lockNode
                    });

                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.EDIT_BEGIN,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.unlockNode
                    });

                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.DRAW_START,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.lockNode
                    });

                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.DRAW_BEGIN,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.unlockNode
                    });

                    // Listen to ll the adds.
                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.MI_FEATURE_ADD,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.addNode
                    });

                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.MI_WMS_ADD,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.addNode
                    });

                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.OVERLAY_ADD,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.addNode
                    });

                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.LAYER_ADD,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.addNode
                    });

                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.STATIC_CONTENT,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.addNode
                    });

                    // Listen to all the removes.
                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.MI_WMS_REMOVE,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.removeNode
                    });

                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.MI_FEATURE_REMOVE,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.removeNode
                    });

                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.OVERLAY_REMOVE,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.removeNode
                    });

                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.LAYER_REMOVE,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.removeNode
                    });

                    // Listen to all the updates.
                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.FEATURE_UPDATE,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.updateNode
                    });

                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.OVERLAY_UPDATE,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.updateNode
                    });

                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.STORAGE_OBJECT_UPDATED,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.updateNode
                    });

                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.LAYER_UPDATE,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.updateNode
                    });

                    // Listen to all the clears.
                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.OVERLAY_CLEAR,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.clearNode
                    });

                    // Listen to the visibility.
                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.MI_VISIBILITY_SET,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.visibilityNode
                    });

                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.MAP_ENGINE_SWAP_START,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.prepareForReload
                    });

                    emp.transactionQueue.listener.remove({
                        type: emp.intents.control.MAP_ENGINE_SWAP_COMPLETE,
                        mapInstanceId: mapInstanceId,
                        callback: privateInterface.storageReloadComplete
                    });

                    delete oTreeInstanceList[mapInstanceId];
                }
            },
            locateOnTree: function(args) {
                var oInstanceData = oTreeInstanceList[args.mapInstanceId];

                if (oInstanceData) {
                    oInstanceData.select(args);
                }
            }
        };

        return publicInterface;
    }());
 emp_ui_treeManager.newMapInstance({});
}())
