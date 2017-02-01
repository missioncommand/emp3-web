/* global L, leafLet, emp, armyc2 */

leafLet.internalPrivateClass.RadArcAirspace = function(){
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
            
            sPopupText = "<center>" +
                    "<b>Lat</b>:&nbsp;" + oLatLng.lat.toFixed(5) +
                    "<br/><b>Lon</b>:&nbsp;" + oLatLng.lng.toFixed(5) +
                    "<br/><b>Left Azimuth</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LEFT_AZIMUTH) + this.getAngleUnits() +
                    "<br/><b>Right Azimuth</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH) + this.getAngleUnits() +
                    "<br/><b>Outter Radius</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RADIUS) + this.getUnits() +
                    "<br/><b>Inner Radius</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_INNER_RADIUS) + this.getUnits() +
                    "<br/><b>Min Alt</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_MIN_ALTITUDE) + this._getAltUnitsAndModeText() + 
                    "<br/><b>Max Alt</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_MAX_ALTITUDE) + this._getAltUnitsAndModeText() + 
                    "</center><br/>" +
                    this._getPopupDescription();
            return sPopupText;
        },
        _createFeature: function(oArgs)
        {
            var oPartialCoordList;
            var oLatLngList = [];
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            var oLeafletObject;
            var oCenterLatLng = leafLet.utils.geoJson.convertCoordinatesToLatLng(oArgs.data)[0];
            var oAttributes = oArgs.oAirspaceAttributeList.get(0);
            
            if (oCenterLatLng === undefined)
            {
                return undefined;
            }
            oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_RADARC);
            var dLeftAzimuth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LEFT_AZIMUTH);
            var dRightAzimuth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH);
            var dInnerRadius = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_INNER_RADIUS);
            var dOutterRadius = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RADIUS);
            var oLineColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_COLOR));
            var oFillColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_FILL_COLOR));
            var oPolygonOptions = {
                stroke: true,
                color: oLineColor.sColor,
                opacity: oLineColor.opacity,
                fill: true,
                fillColor: oFillColor.sColor,
                fillOpacity: oFillColor.opacity,
                weight: oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_WIDTH),
                oFeature: this
            };

            if (this.isSelected())
            {
                var oSelectAttributes = this.getEngineInstanceInterfacee().selectAttributes;
                
                oPolygonOptions.tempColor = oPolygonOptions.color;
                oPolygonOptions.tempWeight = oPolygonOptions.weight;
                
                oPolygonOptions.color = '#' + oSelectAttributes.color;
                oPolygonOptions.weight = oSelectAttributes.width;
            }

            oPartialCoordList = leafLet.utils.getArcCoordinates(this.options.instanceInterface.leafletInstance,
                oCenterLatLng, dInnerRadius, dLeftAzimuth, dRightAzimuth, true);
                
            oLatLngList = oLatLngList.concat(oPartialCoordList);

            oPartialCoordList = leafLet.utils.getArcCoordinates(this.options.instanceInterface.leafletInstance,
                oCenterLatLng, dOutterRadius, dRightAzimuth, dLeftAzimuth, false);
                
            oLatLngList = oLatLngList.concat(oPartialCoordList);
//console.log("RadArc Points: " + oLatLngList.length);

            oLeafletObject = new L.Polygon(oLatLngList, oPolygonOptions);
             
            this.setAttributeList(oArgs.oAirspaceAttributeList);

            return oLeafletObject;
        },
        _updateFeature: function(oArgs)
        {
            var oPartialCoordList;
            var oLatLngList = [];
            var oCoordList = leafLet.utils.geoJson.convertCoordinatesToLatLng(oArgs.data);
            var oAttributeList = new leafLet.typeLibrary.airspace.AttributeList(oArgs.properties);
            var oLeafletObject = this.getLeafletObject();
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            var oAttributes = oAttributeList.get(0);
            var oCenterLatLng = oCoordList[0];
            
            if (oCenterLatLng === undefined)
            {
                return undefined;
            }
            oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_RADARC);
            var dLeftAzimuth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LEFT_AZIMUTH);
            var dRightAzimuth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH);
            var dInnerRadius = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_INNER_RADIUS);
            var dOutterRadius = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RADIUS);
            var oLineColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_COLOR));
            var oFillColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_FILL_COLOR));
            var oPolygonOptions = {
                stroke: true,
                color: oLineColor.sColor,
                opacity: oLineColor.opacity,
                fill: true,
                fillColor: oFillColor.sColor,
                fillOpacity: oFillColor.opacity,
                weight: oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_WIDTH)
            };

            if (this.isSelected())
            {
                var oSelectAttributes = this.getEngineInstanceInterfacee().selectAttributes;
                
                oPolygonOptions.tempColor = oPolygonOptions.color;
                oPolygonOptions.tempWeight = oPolygonOptions.weight;
                
                oPolygonOptions.color = '#' + oSelectAttributes.color;
                oPolygonOptions.weight = oSelectAttributes.width;
            }

            oPartialCoordList = leafLet.utils.getArcCoordinates(this.options.instanceInterface.leafletInstance,
                oCenterLatLng, dInnerRadius, dLeftAzimuth, dRightAzimuth, true);
                
            oLatLngList = oLatLngList.concat(oPartialCoordList);

            oPartialCoordList = leafLet.utils.getArcCoordinates(this.options.instanceInterface.leafletInstance,
                oCenterLatLng, dOutterRadius, dRightAzimuth, dLeftAzimuth, false);
                
            oLatLngList = oLatLngList.concat(oPartialCoordList);

            oLeafletObject.setLatLngs(oLatLngList);
            oLeafletObject.setStyle(oPolygonOptions);
             
            this.setAttributeList(oAttributeList);
            this.setProperties(oArgs.properties);
            this.setData(oArgs.data);
            
            return oLeafletObject;
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.airspace.RadArc = leafLet.typeLibrary.AirspaceFeature.extend(leafLet.internalPrivateClass.RadArcAirspace());
