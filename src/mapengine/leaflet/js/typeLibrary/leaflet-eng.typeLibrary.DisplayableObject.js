/* global L, leafLet, emp */
leafLet.internalPrivateClass.DisplayableObject = function(){
    var publicInterface = {
        initialize: function (args) 
        {
            var options = {
                visible: args.item.visible,
                leafletObject: undefined //set where needed
            };
            L.Util.setOptions(this, options);
            leafLet.typeLibrary.empObject.prototype.initialize.call(this, args);
        },
        destroy: function()
        {
            var oLeafletObject = this.getLeafletObject();

            if (oLeafletObject !== undefined)
            {
                if (typeof (oLeafletObject.closePopup) === 'function')
                {
                    oLeafletObject.closePopup();
                }

                if (this.hasLayer(oLeafletObject))
                {
                    this.removeLayer(oLeafletObject);
                }
                this.options.leafletObject = undefined;
            }
            leafLet.typeLibrary.empObject.prototype.destroy.call(this);
        },
        getLeafletObject: function()
        {
            return this.options.leafletObject;
        },
        isVisible: function()
        {
            return this.options.visible;
        },
        setVisibility: function(oItem)
        {
            this.options.visible = oItem.visible;
            if (this.getLeafletObject() !== undefined)
            {
                if (oItem.visible && !this.hasLayer(this.getLeafletObject()))
                {
                    var oMapBounds = this.getLeafletMap().getBounds();
                    this._updateLeafletObject(oMapBounds, this.getLeafletObject(), false);
                    this.addLayer(this.getLeafletObject());
                }
                else if (!oItem.visible && this.hasLayer(this.getLeafletObject()))
                {
                    this.removeLayer(this.getLeafletObject());
                }
            }
            // We don't have to process its children because the core will send everything that get affected.
        },
        setStyle: function(sType, oProperties)
        {
            var oChild;
            var aKeyList = this.getChildKeyList();
            
            if (this.getObjectType() === leafLet.typeLibrary.objectType.FEATURE)
            {
                this.setFeatureStyle(sType, oProperties);
            }
            
            for (var iIndex = 0; iIndex < aKeyList.length; iIndex++)
            {
                oChild = this.getChild(aKeyList[iIndex]);
                
                switch (oChild.getObjectType())
                {
                    case leafLet.typeLibrary.objectType.FEATURE:
                    case leafLet.typeLibrary.objectType.OVERLAY:
                        oChild.setStyle(sType, oProperties);
                        break;
                    case leafLet.typeLibrary.objectType.WMS:
                    default:
                        break;
                }
            }
        }
    };
    
    return publicInterface;
};

leafLet.typeLibrary.DisplayableObject = leafLet.typeLibrary.empObject.extend(leafLet.internalPrivateClass.DisplayableObject());
