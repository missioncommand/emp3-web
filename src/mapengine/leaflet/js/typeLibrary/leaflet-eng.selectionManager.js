
/* global leafLet, emp, L */

leafLet.internalPrivateClass.SelectionManager = function(args){
    var publicInterface = {
        initialize: function (args) 
        {
            var options = {
                eventData: [],
                featureSelectedList: {},
                mapInstance: args.mapInstance
            };
            L.Util.setOptions(this, options);
        },
        destroy: function()
        {
            var iIndex;
            var oKeyList = emp.helpers.associativeArray.getKeys(this.options.featureSelectedList);
            
            for (iIndex = 0; iIndex < oKeyList.length; iIndex++) {
                delete this.options.featureSelectedList[oKeyList[iIndex]];
            }
            
            this.options.eventData = [];
        },
        getKey: function(oFeature, sSubFeatureID)
        {
            var sKey = oFeature.getCoreId();
            
            if (!emp.helpers.isEmptyString(sSubFeatureID))
            {
                sKey += '-' + sSubFeatureID;
            }
            
            return sKey;
        },
        _createSelectionObject: function(oFeature, sSubFeatureID)
        {
            var sKey = this.getKey(oFeature, sSubFeatureID);
            var oSelectedListObject = {
                sKey : sKey,
                oFeature: oFeature,
                oSelectionData: {
                    coreId: oFeature.getCoreId(),
                    overlayId: oFeature.getOverlayId(),
                    parentId: oFeature.getParentId(),
                    featureId: oFeature.getFeatureId(),
                    select: true
                }
            };
            
            if ((typeof (sSubFeatureID) === 'string') && (sSubFeatureID.length > 0))
            {
                oSelectedListObject.oSelectionData.selectedId = sSubFeatureID;
            }
            
            return oSelectedListObject;
        },
        deselectAllFeatures: function()
        {
            var iIndex;
            var oFeatureSelection;
            var oKeyList = emp.helpers.associativeArray.getKeys(this.options.featureSelectedList);

            for (iIndex = 0; iIndex < oKeyList.length; iIndex++) {
                oFeatureSelection = this.options.featureSelectedList[oKeyList[iIndex]];
                
                if (!oFeatureSelection.oFeature.isInEditMode())
                {
                    oFeatureSelection.oSelectionData.select = false;

                    this.options.eventData.push(oFeatureSelection.oSelectionData);
                    delete this.options.featureSelectedList[oKeyList[iIndex]];
                    this.applyHighlight2LeafletObject(oFeatureSelection.oFeature, oFeatureSelection.oSelectionData.selectedId, false);
                }
            }
        },
        _removeFeatureFromSelectedList: function(oFeature, sSubFeatureID)
        {
            var sKey = this.getKey(oFeature, sSubFeatureID);

            if (this.options.featureSelectedList[sKey] !== undefined)
            {
                delete this.options.featureSelectedList[sKey];
            }
        },
        _addFeatureToSelectedList: function(oSelectedListObject)
        {
            if (this.options.featureSelectedList[oSelectedListObject.sKey] === undefined)
            {
                this.options.featureSelectedList[oSelectedListObject.sKey] = oSelectedListObject;
            }
        },
        isSelected: function(oFeature, sSubFeatureID)
        {
            var bSelected = false;
            var sKey = this.getKey(oFeature);
            
            // First check if the entire feature is selected.
            if (this.options.featureSelectedList[sKey] !== undefined)
            {
                return true;
            }
            
            if (!emp.helpers.isEmptyString(sSubFeatureID))
            {
                sKey = this.getKey(oFeature, sSubFeatureID);
                bSelected = ((this.options.featureSelectedList[sKey] === undefined)? false: true);
            }
            
            return bSelected;
        },
        selectFeature: function(oFeature, sSubFeatureID)
        {
            var oSelectedListObject = this._createSelectionObject(oFeature, sSubFeatureID);

            this.applyHighlight2LeafletObject(oFeature, sSubFeatureID, true);
            this._addFeatureToSelectedList(oSelectedListObject);
            this.options.eventData.push(oSelectedListObject.oSelectionData);
        },
        deselectFeature: function(oFeature, sSubFeatureID)
        {
            var sKey = this.getKey(oFeature, sSubFeatureID);
            var oSelectedListObject = this.options.featureSelectedList[sKey];

            if (emp.helpers.isEmptyString(sSubFeatureID))
            {
                this._removeFeaturesEntries(oFeature);
            }
            else if (oSelectedListObject)
            {
                this._removeFeatureFromSelectedList(oFeature, sSubFeatureID);
                this.applyHighlight2LeafletObject(oFeature, sSubFeatureID, false);
                oSelectedListObject.oSelectionData.select = false;
                this.options.eventData.push(oSelectedListObject.oSelectionData);
            }
        },
        generateEvent: function()
        {
            if (this.options.eventData.length > 0)
            {
                this.options.mapInstance.eventing.SelectionChange(this.options.eventData);
            }
            
            this.resetEventData();
        },
        resetEventData: function()
        {
            if (this.options.eventData.length > 0)
            {
                this.options.eventData = [];
            }
        },
        _applyHighlight: function(oLeafletObj, oFeature, sSubFeatureID, bSelected)
        {
            var iIndex;
            
            if (oLeafletObj instanceof L.LayerGroup)
            {
                var oItemList = oLeafletObj.getLayers();
                
                for (iIndex = 0; iIndex < oItemList.length; iIndex++)
                {
                    this._applyHighlight(oItemList[iIndex], oFeature, sSubFeatureID, bSelected);
                }
            }
            else
            {
                if (typeof (oLeafletObj.empSelect) === 'function')
                {
                    if (emp.helpers.isEmptyString(sSubFeatureID))
                    {
                        if (bSelected && !this.isSelected(oFeature, sSubFeatureID))
                        {
                            oLeafletObj.empSelect();
                        }
                        else if (!bSelected && !this.isSelected(oFeature, sSubFeatureID))
                        {
                            oLeafletObj.empDeselect();
                        }
                    }
                    else if (oLeafletObj && oLeafletObj.options && !emp.helpers.isEmptyString(oLeafletObj.options.sSubItemID))
                    {
                        if (oLeafletObj.options.sSubItemID === sSubFeatureID)
                        {
                            if (bSelected && !this.isSelected(oFeature, sSubFeatureID))
                            {
                                oLeafletObj.empSelect();
                            }
                            else if (!bSelected && !this.isSelected(oFeature, sSubFeatureID))
                            {
                                oLeafletObj.empDeselect();
                            }
                        }
                    }
                }
            }
        },
        applyHighlight2LeafletObject: function(oFeature, sSubFeatureID, bSelected)
        {
            var oLeafletObj = oFeature.getLeafletObject();
            
            this._applyHighlight(oLeafletObj, oFeature, sSubFeatureID, bSelected);
        },
        _removeFeaturesEntries: function(oFeature)
        {
            var oFeatureSelection;
            var sCoreID = oFeature.getCoreId();
            var oKeyList = emp.helpers.associativeArray.getKeys(this.options.featureSelectedList);

            for (var iIndex in oKeyList)
            {
                oFeatureSelection = this.options.featureSelectedList[oKeyList[iIndex]];

                if (oFeatureSelection.oSelectionData.coreId === sCoreID)
                {
                    oFeatureSelection.oSelectionData.select = false;

                    this.options.eventData.push(oFeatureSelection.oSelectionData);

                    delete this.options.featureSelectedList[oKeyList[iIndex]];
                    this.applyHighlight2LeafletObject(oFeatureSelection.oFeature, oFeatureSelection.oSelectionData.selectedId, false);
                }
            }
        },
        removeFeature: function(oFeature)
        {
            this._removeFeaturesEntries(oFeature);
            this.generateEvent();
        }
    };
    
    return publicInterface;
};


leafLet.SelectionManager = L.Class.extend(leafLet.internalPrivateClass.SelectionManager());
