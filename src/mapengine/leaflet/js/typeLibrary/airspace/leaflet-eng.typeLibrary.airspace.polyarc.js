/* global L, leafLet, emp, armyc2 */

leafLet.internalPrivateClass.PolyArcAirspace = function(){
    var publicInterface = {
        initialize: function (args) 
        {
            var options = {
            };
            L.Util.setOptions(this, options);

            leafLet.typeLibrary.AirspaceFeature.prototype.initialize.call(this, args, 3, Number.MAX_VALUE);
        },
        getPopupText: function()
        {
            var sPopupText = "";
            var oAttributes = this.getAttributes(0);
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            var oLatLng = this.getCoordinateList()[0];
            
            sPopupText = "<center>" +
                    "<b>Lat</b>:&nbsp;" + oLatLng.lat.toFixed(5) +
                    "<br/><b>Lon</b>:&nbsp;" + oLatLng.lng.toFixed(5) +
                    "<br/><b>Left Azimuth</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LEFT_AZIMUTH) + this.getAngleUnits() +
                    "<br/><b>Right Azimuth</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH) + this.getAngleUnits() +
                    "<br/><b>Radius</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RADIUS) + this.getUnits() +
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
            var oCoord;
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            var oLeafletObject;
            var oCoordList = leafLet.utils.geoJson.convertCoordinatesToLatLng(oArgs.data);;
            var oAttributes = oArgs.oAirspaceAttributeList.get(0);
            
            if (oCoordList.length < this.getMinPoints())
            {
                return undefined;
            }
            
            oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_POLYARC);
            var dLeftAzimuth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LEFT_AZIMUTH);
            var dRightAzimuth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH);
            var dRadius = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RADIUS);
            var oCenterLatLng = oCoordList[0];
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
                var oSelectAttributes = this.getEngineInstanceInterface().selectAttributes;
                
                oPolygonOptions.tempColor = oPolygonOptions.color;
                oPolygonOptions.tempWeight = oPolygonOptions.weight;
                
                oPolygonOptions.color = '#' + oSelectAttributes.color;
                oPolygonOptions.weight = oSelectAttributes.width;
            }

            //oCoord = oCenterLatLng.destinationPoint(dLeftAzimuth, dRadius);
            //oLatLngList.push(oCoord);
            
            oPartialCoordList = leafLet.utils.getArcCoordinates(this.options.instanceInterface.leafletInstance,
                oCenterLatLng, dRadius, dLeftAzimuth, dRightAzimuth, true);
                
            oLatLngList = oLatLngList.concat(oPartialCoordList);

            oCoord = oCenterLatLng.destinationPoint(dRightAzimuth, dRadius);
            oLatLngList.push(oCoord);
            
            //for (var iIndex = oCoordList.length - 1; iIndex > 0 ; iIndex--)
            for (var iIndex = 1; iIndex < oCoordList.length; iIndex++)
            {
                oLatLngList.push(oCoordList[iIndex]);
            }
            
//console.log("PolyArc Points: " + oLatLngList.length);

            oLeafletObject = new L.Polygon(oLatLngList, oPolygonOptions);
            
            this.setAttributeList(oArgs.oAirspaceAttributeList);

            return oLeafletObject;
        },
        _updateFeature: function(oArgs)
        {
            var oPartialCoordList;
            var oLatLngList = [];
            var oCoord;
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            var oAttributeList = new leafLet.typeLibrary.airspace.AttributeList(oArgs.properties);
            var oLeafletObject = this.getLeafletObject();
            var oCoordList = leafLet.utils.geoJson.convertCoordinatesToLatLng(oArgs.data);
            var oAttributes = oAttributeList.get(0);


            oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_POLYARC);
            var dLeftAzimuth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LEFT_AZIMUTH);
            var dRightAzimuth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH);
            var dRadius = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RADIUS);
            var oCenterLatLng = oCoordList[0];
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
                var oSelectAttributes = this.getEngineInstanceInterface().selectAttributes;
                
                oPolygonOptions.tempColor = oPolygonOptions.color;
                oPolygonOptions.tempWeight = oPolygonOptions.weight;
                
                oPolygonOptions.color = '#' + oSelectAttributes.color;
                oPolygonOptions.weight = oSelectAttributes.width;
            }
            
            if (oCoordList.length >= this.getMinPoints())
            {
                //oCoord = oCenterLatLng.destinationPoint(dLeftAzimuth, dRadius);
                //oLatLngList.push(oCoord);

                oPartialCoordList = leafLet.utils.getArcCoordinates(this.options.instanceInterface.leafletInstance,
                    oCenterLatLng, dRadius, dLeftAzimuth, dRightAzimuth, true);

                oLatLngList = oLatLngList.concat(oPartialCoordList);

                oCoord = oCenterLatLng.destinationPoint(dRightAzimuth, dRadius);
                oLatLngList.push(oCoord);

                for (var iIndex = 1; iIndex < oCoordList.length; iIndex++)
                {
                    oLatLngList.push(oCoordList[iIndex]);
                }

                oLeafletObject.setLatLngs(oLatLngList);
                oLeafletObject.setStyle(oPolygonOptions);
            }
             
            this.setAttributeList(oAttributeList);
            this.setProperties(oArgs.properties);
            this.setData(oArgs.data);
            
            return oLeafletObject;
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.airspace.PolyArc = leafLet.typeLibrary.AirspaceFeature.extend(leafLet.internalPrivateClass.PolyArcAirspace());
