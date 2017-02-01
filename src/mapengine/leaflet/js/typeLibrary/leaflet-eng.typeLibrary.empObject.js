/* global L, leafLet, emp */

leafLet.internalPrivateClass.empObject = function()
{
    var publicInterface = {
        initialize: function (args) 
        {
            L.FeatureGroup.prototype.initialize.call(this);
            var options = {
                objectType:  args.item.globalType,
                name: args.item.name,
                description: args.item.description,
                coreId: args.item.coreId || emp.helpers.id.newGUID(),
                parentCoreId: args.item.parentCoreId,
                parentId: args.item.parentId,
                instanceInterface: args.instanceInterface,
                oClusteredParent: undefined,
                objectChildren: {}
            };
            L.Util.setOptions(this, options);
        },
        destroy: function()
        {
            var oParent = this.getParentObject();
            
            this.clearChildren();

            if (oParent)
            {
                oParent.removeChildObject(this);
            }

            this.getEngineInstanceInterface().removeEmpObject(this);
        },
        clearChildren: function()
        {
            var aKeys = emp.helpers.associativeArray.getKeys(this.options.objectChildren);

            for (var sKey in aKeys)
            {
                if (this.options.objectChildren[aKeys[sKey]].options.objectType ===
                        leafLet.typeLibrary.objectType.FEATURE)
                {
                    if (this.options.objectChildren[aKeys[sKey]].isInEditMode())
                    {
                        var instanceInterface = this.getEngineInstanceInterface();
                        instanceInterface.oCurrentEditor.cancelEdit();
                        instanceInterface.oCurrentEditor.destroy();
                        instanceInterface.bInEditMode = false;
                        instanceInterface.bInDrawMode = false;
                        instanceInterface.oCurrentEditor = undefined;
                        instanceInterface.oEditTransaction.run();
                        instanceInterface.oEditTransaction = undefined;
                    }
                }
                this.options.objectChildren[aKeys[sKey]].destroy();
                this.removeChildObjectById(aKeys[sKey]);
            }

            this.clearLayers();
        },
        getRootOverlay: function()
        {
            return this.getEngineInstanceInterface().rootOverlay;
        },
        getEngineInstanceInterface: function()
        {
            return this.options.instanceInterface;
        },
        getLeafletMap: function()
        {
            return this.getEngineInstanceInterface().leafletInstance;
        },
        getEngObject: function(sCoreId)
        {
            return this.getEngineInstanceInterface().mapEngObjectList[sCoreId];
        },
        getCoreId: function()
        {
            return this.options.coreId;
        },
        getParentCoreId: function()
        {
            return this.options.parentCoreId;
        },
        getOverlayId: function()
        {
            return undefined;
        },
        getFeatureId: function()
        {
            return undefined;
        },
        getParentId: function()
        {
            return this.options.parentId;
        },
        getName: function()
        {
            return this.options.name;
        },
        getDescription: function()
        {
            return this.options.description;
        },
        setName: function(sValue)
        {
            this.options.name = sValue;
        },
        getObjectType: function()
        {
            return this.options.objectType;
        },
        getChild: function(sCoreId)
        {
            return this.options.objectChildren[sCoreId];
        },
        getChildList: function()
        {
            return this.options.objectChildren;
        },
        getChildKeyList: function()
        {
            return emp.helpers.associativeArray.getKeys(this.options.objectChildren);
        },
        getParentObject: function()
        {
            var oParent = this.getEngObject(this.getParentCoreId());

            if (!oParent)
            {
                oParent = this.getRootOverlay();
            }
            
            return oParent;
        },
        getClusteredOverlay: function()
        {
            var oParent;
            var oOverlay = undefined;
            
            switch (this.getObjectType())
            {
                case leafLet.typeLibrary.objectType.FEATURE:
                case leafLet.typeLibrary.objectType.WMS:
                    oParent = this.getEngObject(this.getParentCoreId());

                    if (oParent)
                    {
                        oOverlay = oParent.getClusteredOverlay();
                    }
                    break;
                case leafLet.typeLibrary.objectType.OVERLAY:
                    if (this.isCurrentlyClustered())
                    {
                        oOverlay = this;
                    }
                    else
                    {
                        oParent = this.getEngObject(this.getParentCoreId());
                        
                        if (oParent)
                        {
                            oOverlay = oParent.getClusteredOverlay();
                        }
                    }
                    break;
            }
            return oOverlay;
        },
        deactivateParentCluster: function()
        {
            var oParent = this.getParentObject();

            if (oParent)
            {
                this.options.oClusteredParent = oParent.getClusteredOverlay();

                if (this.options.oClusteredParent)
                {
                    this.options.oClusteredParent.clusterDeactivate();
                }
            }
        },
        activateParentCluster: function()
        {
            if (this.options.oClusteredParent)
            {
                this.options.oClusteredParent.clusterActivate();
                this.options.oClusteredParent = undefined;
            }
        },
        addChildObject: function(oChild)
        {
            if (this.options.objectChildren[oChild.getCoreId()] === undefined)
            {
                this.options.objectChildren[oChild.getCoreId()] = oChild;
                this.addLayer(oChild);
                
                var oClusteredOverlay = this.getClusteredOverlay();

                if (oClusteredOverlay)
                {
                    oClusteredOverlay.getClusterObject().addLayer(oChild);
                }
            }
        },
        removeChildObject: function(oFeature)
        {
            this.removeChildObjectById(oFeature.getCoreId());
        },
        removeChildObjectById: function(sCoreId)
        {
            var oChild = this.getChild(sCoreId);

            if (oChild !== undefined)
            {
                if (this.hasLayer(oChild))
                {
                    this.removeLayer(oChild);
                }
                delete this.options.objectChildren[sCoreId];
                
                var oClusteredOverlay = this.getClusteredOverlay();

                if (oClusteredOverlay)
                {
                    oClusteredOverlay.getClusterObject().removeLayer(oChild);
                }
            }
        },
        hasChildren: function()
        {
            return !emp.helpers.associativeArray.isEmpty(this.options.objectChildren);
        }
    };
    
    return publicInterface;
};

leafLet.typeLibrary.empObject = L.FeatureGroup.extend(leafLet.internalPrivateClass.empObject());
