/* global L, leafLet, emp, armyc2 */

leafLet.internalPrivateClass.CylinderAirspace = function(){
    var publicInterface = {
        initialize: function (args) 
        {
            var options = {
            };
            L.Util.setOptions(this, options);

            leafLet.typeLibrary.AirspaceFeature.prototype.initialize.call(this, args, 1, 1);
        },
        getPopupText: function()
        {
            var sPopupText = "";
            var oAttributes = this.getAttributes(0);
            var oLatLng = this.getCoordinateList()[0];
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            
            sPopupText = "<center>" + (oLatLng? 
                    "<b>Lat</b>:&nbsp;" + oLatLng.lat.toFixed(5) +
                    "<br/><b>Lon</b>:&nbsp;" + oLatLng.lng.toFixed(5): "") + 
                    "<br/><b>Radius</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RADIUS) + this.getUnits() +
                    "<br/><b>Min Alt</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_MIN_ALTITUDE) + this._getAltUnitsAndModeText() + 
                    "<br/><b>Max Alt</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_MAX_ALTITUDE) + this._getAltUnitsAndModeText() + 
                    "</center><br/>" +
                    this._getPopupDescription();
            return sPopupText;
        },
        _createFeature: function(oArgs)
        {
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            var oLatLngList = leafLet.utils.geoJson.convertCoordinatesToLatLng(oArgs.data);;
            var oAttributes = oArgs.oAirspaceAttributeList.get(0);
            var oLatLng = oLatLngList[0];
            
            if (oLatLng === undefined)
            {
                return undefined;
            }
            
            oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_CYLINDER);
            
            var oLineColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_COLOR));
            var oFillColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_FILL_COLOR));
            var iWidth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_WIDTH);

            var oOptions = {
                stroke: true,
                color: oLineColor.sColor,
                opacity: oLineColor.opacity,
                fill: true,
                fillColor: oFillColor.sColor,
                fillOpacity: oFillColor.opacity,
                weight: iWidth,
                oFeature: this
            };

            if (this.isSelected())
            {
                var oSelectAttributes = this.getEngineInstanceInterface().selectAttributes;
                
                oOptions.tempColor = oOptions.color;
                oOptions.tempWeight = oOptions.weight;
                
                oOptions.color = '#' + oSelectAttributes.color;
                oOptions.weight = oSelectAttributes.width;
            }
            var oLeafletObject = new L.Circle(oLatLng, oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RADIUS), oOptions);

            this.setAttributeList(oArgs.oAirspaceAttributeList);

            return oLeafletObject;
        },
        getFeatureBounds: function()
        {
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            var oLatLng = this.getCoordinateList()[0];
            var oAttributes = this.getAttributes(0);
            var oNorthEast = new L.LatLng(oLatLng.lat, oLatLng.lng);
            var oSouthWest = new L.LatLng(oLatLng.lat, oLatLng.lng);
            var dDist = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RADIUS) * 2.0;

            oNorthEast.moveCoordinate(45.0, dDist);
            oSouthWest.moveCoordinate(225.0, dDist);

            return new leafLet.typeLibrary.EmpBoundary(oSouthWest, oNorthEast);
        },
        _updateFeature: function(oArgs)
        {
            var oLeafletObject = this.options.leafletObject;
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            var oAttributeList = new leafLet.typeLibrary.airspace.AttributeList(oArgs.properties);
            var oCoordList = leafLet.utils.geoJson.convertCoordinatesToLatLng(oArgs.data);
            var oLatLng = oCoordList[0];
            var oAttributes = oAttributeList.get(0);
            
            oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_CYLINDER);
            var oLineColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_COLOR));
            var oFillColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_FILL_COLOR));
            var iWidth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_WIDTH);

            var oOptions = {
                stroke: true,
                color: oLineColor.sColor,
                opacity: oLineColor.opacity,
                fill: true,
                fillColor: oFillColor.sColor,
                fillOpacity: oFillColor.opacity,
                weight: iWidth
            };

            if (this.isSelected())
            {
                var oSelectAttributes = this.getEngineInstanceInterface().selectAttributes;
                
                oOptions.tempColor = oOptions.color;
                oOptions.tempWeight = oOptions.weight;
                
                oOptions.color = '#' + oSelectAttributes.color;
                oOptions.weight = oSelectAttributes.width;
            }

            oLeafletObject.setLatLng(oLatLng);
            oLeafletObject.setRadius(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RADIUS));
            oLeafletObject.setStyle(oOptions);
             
            this.setAttributeList(oAttributeList);
            this.setProperties(oArgs.properties);
            this.setData(oArgs.data);
            
            return oLeafletObject;
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.airspace.Cylinder = leafLet.typeLibrary.AirspaceFeature.extend(leafLet.internalPrivateClass.CylinderAirspace());
