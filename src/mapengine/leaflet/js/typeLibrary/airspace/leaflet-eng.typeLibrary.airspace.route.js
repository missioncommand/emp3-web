/* global L, leafLet, emp, armyc2 */

leafLet.internalPrivateClass.RouteAirspace = function(){
    var publicInterface = {
        initialize: function (args) 
        {
            var options = {
            };
            L.Util.setOptions(this, options);

            leafLet.typeLibrary.AirspaceFeature.prototype.initialize.call(this, args, 2, Number.MAX_VALUE);
        },
        getPopupText: function()
        {
            var sPopupText;
            var oAttributeList = this.getAttributeList();
            
            sPopupText = "<center>" +
                    "<b>Min Alt</b>:&nbsp;" + oAttributeList.getMinAltitude() + this._getAltUnitsAndModeText() + 
                    "<br/><b>Max Alt</b>:&nbsp;" + oAttributeList.getMaxAltitude() + this._getAltUnitsAndModeText() + 
                    "</center><br/>" +
                    this._getPopupDescription();
            return sPopupText;
        },
        _createFeature: function(oArgs)
        {
            var oOvalLeafletObject;
            var oLatLngList = leafLet.utils.geoJson.convertCoordinatesToLatLng(oArgs.data);;
            var oAttributes = oArgs.oAirspaceAttributeList.get(0);
            var bIsSelected = this.isSelected();
           
            oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_ROUTE);
            
            var oLeafletObject = new L.FeatureGroup();
            
            for (var iIndex = 1; iIndex < oLatLngList.length; iIndex++)
            {
                var oLegCoords = [oLatLngList[iIndex - 1], oLatLngList[iIndex]];
                
                oOvalLeafletObject = new leafLet.utils.OvalObject({
                        leafletMap: this.options.instanceInterface.leafletInstance,
                        width: oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_WIDTH),
                        attributes: oAttributes,
                        isSelected: bIsSelected,
                        selectAttributes: this.getEngineInstanceInterface().selectAttributes,
                        coordinates: oLegCoords,
                        oFeature: this
                    });
                oLeafletObject.addLayer(oOvalLeafletObject);
            }
            
            this.setAttributeList(oArgs.oAirspaceAttributeList);

            return oLeafletObject;
        },
        _updateFeature: function(oArgs)
        {
            var oAttributeList = new leafLet.typeLibrary.airspace.AttributeList(oArgs.properties);
            var oAttributes = oAttributeList.get(0);
            var oOvalLeafletObject;
            var oLatLngList = leafLet.utils.geoJson.convertCoordinatesToLatLng(oArgs.data);
            var bIsSelected = this.isSelected();
            
            oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_ROUTE);
            
            var oLeafletObject = this.getLeafletObject();
            
            oLeafletObject.clearLayers();
            
            for (var iIndex = 1; iIndex < oLatLngList.length; iIndex++)
            {
                var oLegCoords = [oLatLngList[iIndex - 1], oLatLngList[iIndex]];
                
                oOvalLeafletObject = new leafLet.utils.OvalObject({
                        leafletMap: this.options.instanceInterface.leafletInstance,
                        width: oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_WIDTH),
                        attributes: oAttributes,
                        isSelected: bIsSelected,
                        selectAttributes: this.getEngineInstanceInterface().selectAttributes,
                        coordinates: oLegCoords,
                        oFeature: this
                    });
                oLeafletObject.addLayer(oOvalLeafletObject);
            }
            
            this.setAttributeList(oAttributeList);
            this.setData(oArgs.data);
            this.setProperties(oArgs.properties);
            return oLeafletObject;
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.airspace.Route = leafLet.typeLibrary.AirspaceFeature.extend(leafLet.internalPrivateClass.RouteAirspace());
