/* global L, leafLet, emp, armyc2 */

leafLet.internalPrivateClass.TrackAirspace = function(){
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
            //var oAttributes = this.getAttributes(0);
            //var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            
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
            var oAttributes;
            var dLeftWidth;
            var dRightWidth;
            var oLatLngList = leafLet.utils.geoJson.convertCoordinatesToLatLng(oArgs.data);
            var oAttributeList = oArgs.oAirspaceAttributeList;
            var oLeafletObject = new L.FeatureGroup();
            var bIsSelected = this.isSelected();

            for (var iIndex = 1; iIndex < oLatLngList.length; iIndex++)
            {
                var oLegCoords = [oLatLngList[iIndex - 1], oLatLngList[iIndex]];
                
                if (iIndex > oAttributeList.length())
                {
                    // We need another attribute element.
                    oAttributes = oAttributeList.get(iIndex - 1);
                    oAttributes = new leafLet.typeLibrary.airspace.Attributes(this.getProperties(), oAttributes.getAttributes());
                    oAttributeList.add(oAttributes);
                }
                
                oAttributes = oAttributeList.get(iIndex - 1);
                oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_TRACK);

                dLeftWidth = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_LEFT_WIDTH);
                dRightWidth = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RIGHT_WIDTH);
                
                if (dRightWidth !== dLeftWidth)
                {
                    // tracks have diff left and right width and if they are not
                    // equal we need to offset the coordinates to account for it.
                    var Bearing;
                    var dDist = Math.abs(dRightWidth - dLeftWidth) / 2.0;
                    var dBearingPt1Pt2 = oLatLngList[iIndex - 1].bearingTo(oLatLngList[iIndex]);
                    
                    if (dRightWidth > dLeftWidth)
                    {
                        Bearing = (dBearingPt1Pt2 + 90.0) % 360;
                    }
                    else
                    {
                        Bearing = (dBearingPt1Pt2 + 270.0) % 360;
                    }
                    
                    oLegCoords = [oLatLngList[iIndex - 1].destinationPoint(Bearing, dDist), oLatLngList[iIndex].destinationPoint(Bearing, dDist)];
                }
                
                oOvalLeafletObject = new leafLet.utils.OvalObject({
                        leafletMap: this.options.instanceInterface.leafletInstance,
                        width: dLeftWidth + dRightWidth,
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
            var oOvalLeafletObject;
            var oAttributes;
            var dLeftWidth;
            var dRightWidth;
            var oLatLngList = leafLet.utils.geoJson.convertCoordinatesToLatLng(oArgs.data);
            var oAttributeList = new leafLet.typeLibrary.airspace.AttributeList(oArgs.properties);
            var oLeafletObject = this.getLeafletObject();
            var bIsSelected = this.isSelected();
            
            oLeafletObject.clearLayers();
            
            for (var iIndex = 1; iIndex < oLatLngList.length; iIndex++)
            {
                var oLegCoords = [oLatLngList[iIndex - 1], oLatLngList[iIndex]];
                
                if (iIndex > oAttributeList.length())
                {
                    // We need another attribute element.
                    oAttributes = oAttributeList.get(iIndex - 1);
                    oAttributes = new leafLet.typeLibrary.airspace.Attributes(oArgs.properties, oAttributes.getAttributes());
                    oAttributeList.add(oAttributes);
                }
                
                oAttributes = oAttributeList.get(iIndex - 1);
                oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_TRACK);

                dLeftWidth = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_LEFT_WIDTH);
                dRightWidth = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RIGHT_WIDTH);
                
                if (dRightWidth !== dLeftWidth)
                {
                    // tracks have diff left and right width and if they are not
                    // equal we need to offset the coordinates to account for it.
                    var Bearing;
                    var dDist = Math.abs(dRightWidth - dLeftWidth) / 2.0;
                    var dBearingPt1Pt2 = oLatLngList[iIndex - 1].bearingTo(oLatLngList[iIndex]);
                    
                    if (dRightWidth > dLeftWidth)
                    {
                        Bearing = (dBearingPt1Pt2 + 90.0) % 360;
                    }
                    else
                    {
                        Bearing = (dBearingPt1Pt2 + 270.0) % 360;
                    }
                    
                    oLegCoords = [oLatLngList[iIndex - 1].destinationPoint(Bearing, dDist), oLatLngList[iIndex].destinationPoint(Bearing, dDist)];
                }
                
                oOvalLeafletObject = new leafLet.utils.OvalObject({
                        leafletMap: this.options.instanceInterface.leafletInstance,
                        width: dLeftWidth + dRightWidth,
                        attributes: oAttributes,
                        isSelected: bIsSelected,
                        selectAttributes: this.getEngineInstanceInterface().selectAttributes,
                        coordinates: oLegCoords,
                        oFeature: this
                    });
                oLeafletObject.addLayer(oOvalLeafletObject);
            }
             
            this.setAttributeList(oAttributeList);
            this.setProperties(oArgs.properties);
            this.setData(oArgs.data);
           
            return oLeafletObject;
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.airspace.Track = leafLet.typeLibrary.AirspaceFeature.extend(leafLet.internalPrivateClass.TrackAirspace());
