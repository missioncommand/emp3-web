/* global leafLet, L, emp */
/* 
 *
 */
leafLet.internalPrivateClass.Overlay = function(){
    var publicInterface = {
        initialize: function (args) 
        {
            var options = {
                overlayId: args.item.overlayId,
                oProperties: args.item.properties,
                oClusterDef: (args.item.properties.cluster? new emp.typeLibrary.Overlay.Cluster(args.item.properties.cluster): undefined),
                bClusterActive: (args.item.properties.bClusterActive === true) || false,
                oLeafletClusterObject: undefined
            };
            L.Util.setOptions(this, options);

            leafLet.typeLibrary.DisplayableObject.prototype.initialize.call(this, args);
        },
        destroy: function()
        {
            if (this.hasClusterDef())
            {
                this.clusterRemove();
            }
            leafLet.typeLibrary.DisplayableObject.prototype.destroy.call(this);
        },
        getOverlayId: function()
        {
            return this.options.overlayId;
        },
        getDescription: function()
        {
            return (this.options.oProperties.hasOwnProperty('description')? this.options.oProperties.description: "");
        },
        hasFeatures: function()
        {
            for(var sCoreId in this.options.objectChildren)
            {
                if (!this.options.objectChildren.hasOwnProperty(sCoreId)) {
                    continue;
                }
                var oChild = this.options.objectChildren[sCoreId];

                switch (oChild.getObjectType())
                {
                    case leafLet.typeLibrary.objectType.FEATURE:
                        return true;
                    default:
                        break;
                }

                if (oChild.hasFeatures())
                {
                    return true;
                }
            }

            return false;
        },
        getFeatureBounds: function()
        {
            var oBounds = undefined;
            var oChildBounds;
            var oChildList = this.getChildList();
            
            if (this.hasChildren())
            {
                var sKeys = emp.helpers.associativeArray.getKeys(oChildList);
                
                for (var iIndex = 0; iIndex < sKeys.length; iIndex++)
                {
                    oChildBounds = oChildList[sKeys[iIndex]].getFeatureBounds();
                    
                    if (oChildBounds)
                    {
                        if (!oBounds)
                        {
                            oBounds = new leafLet.typeLibrary.EmpBoundary(oChildBounds.getSouthWest(), oChildBounds.getNorthEast());
                        }
                        else
                        {
                            oBounds.addCoordinate(oChildBounds.getSouthWest());
                            oBounds.addCoordinate(oChildBounds.getNorthEast());
                        }
                    }
                }
            }

            return oBounds;
        },
        _setClusterDef: function(oClusterDef)
        {
            if (!(oClusterDef instanceof emp.typeLibrary.Overlay.Cluster))
            {
                throw new Error("Invalid overlay cluster object.");
            }
            
            this.options.oClusterDef = new emp.typeLibrary.Overlay.Cluster(oClusterDef);
        },
        getClusterObject: function()
        {
            return this.options.oLeafletClusterObject;
        },
        setName: function(sValue)
        {
            leafLet.typeLibrary.DisplayableObject.prototype.setName.call(this, sValue);

            if (this.isCurrentlyClustered())
            {
                // we need to reset the cluster popup.
                this.clusterDeactivate();
                this.clusterActivate();
            }
        },
        isCurrentlyClustered: function()
        {
            return this.hasClusterDef() && this.isClusterActive();
        },
        hasClusterDef: function()
        {
            return (this.options.oClusterDef instanceof emp.typeLibrary.Overlay.Cluster);
        },
        getClusterDef: function()
        {
            return this.options.oClusterDef;
        },
        isClusterActive: function()
        {
            return this.options.bClusterActive;
        },
        activateCluster: function()
        {
            this.options.bClusterActive = false;
            this.clusterActivate();
        },
        clusterSet: function(oClusterDef)
        {
            if (this.hasClusterDef())
            {
                this.clusterRemove();
            }
            
            this._setClusterDef(oClusterDef);
            this.clusterActivate();
        },
        _doClusterActivate: function()
        {
            var oKeyList = this.getChildKeyList();
            var oChild;

            this.options.oLeafletClusterObject = new leafLet.typeLibrary.EmpClusterGroup(
                {
                    overlay: this,
                    instanceInterface: this.getEngineInstanceInterface()
                }
            );
            
            this.getLeafletMap().addLayer(this.getClusterObject());
            
            for (var iIndex = 0; iIndex < oKeyList.length; iIndex++)
            {
                oChild = this.getChild(oKeyList[iIndex]);

                //this.removeLayer(oChild);
                if (oChild instanceof leafLet.typeLibrary.Overlay)
                {
                    if (oChild.isCurrentlyClustered())
                    {
                        // If we run into an overlay that is currently clusterred we skip it.
                        continue;
                    }
                }
                this.getClusterObject().addLayer(oChild);
            }
        },
        clusterActivate: function()
        {
            if (this.hasClusterDef() && !this.isClusterActive())
            {
                this.deactivateParentCluster();
                this._doClusterActivate();
                this.options.bClusterActive = true;
                this.activateParentCluster();
            }
        },
        clusterDeactivate: function()
        {
            if (this.hasClusterDef() && this.isClusterActive())
            {
                var oChild;
                var oKeyList = this.getChildKeyList();
                //var oParent = this.getParentObject();

                this.deactivateParentCluster();
                //this.getClusterObject().clearLayers();
                
                for (var iIndex = 0; iIndex < oKeyList.length; iIndex++)
                {
                    oChild = this.getChild(oKeyList[iIndex]);

                    if (oChild instanceof leafLet.typeLibrary.Overlay)
                    {
                        if (oChild.isCurrentlyClustered())
                        {
                            // If we run into an overlay that is currently clusterred we skip it.
                            continue;
                        }
                    }
                    this.getClusterObject().removeLayer(oChild);
                }

                this.getLeafletMap().removeLayer(this.getClusterObject());

                this.options.oLeafletClusterObject = undefined;
                this.options.bClusterActive = false;
            
                //oParent.addLayer(this);
                this.activateParentCluster();
            }
        },
        clusterRemove: function()
        {
            if (this.hasClusterDef())
            {
                this.clusterDeactivate();
                this.options.oClusterDef = undefined;
                this.options.bClusterActive = false;
            }
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.Overlay = leafLet.typeLibrary.DisplayableObject.extend(leafLet.internalPrivateClass.Overlay());
