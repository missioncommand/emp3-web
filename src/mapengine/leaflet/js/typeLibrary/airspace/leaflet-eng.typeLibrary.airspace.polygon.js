/* global L, leafLet, emp, armyc2 */

leafLet.internalPrivateClass.PolygonAirspace = function(){
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
            
            sPopupText = "<center>" +
                    "<b>Min Alt</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_MIN_ALTITUDE) + this._getAltUnitsAndModeText() + 
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
            
            if (oLatLngList.length < this.getMinPoints())
            {
                return undefined;
            }
            
            oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_POLYGON);
            
            var oLineColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_COLOR));
            var oFillColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_FILL_COLOR));
            var iWidth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_WIDTH);
            var oPolygonOptions = {
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
                
                oPolygonOptions.tempColor = oPolygonOptions.color;
                oPolygonOptions.tempWeight = oPolygonOptions.weight;
                
                oPolygonOptions.color = '#' + oSelectAttributes.color;
                oPolygonOptions.weight = oSelectAttributes.width;
            }
            
            var oLeafletObject = new L.Polygon(oLatLngList, oPolygonOptions);
            
            this.setAttributeList(oArgs.oAirspaceAttributeList);

            return oLeafletObject;
        },
        _updateFeature: function(oArgs)
        {
            var oAttributes;
            var oLatLngList = leafLet.utils.geoJson.convertCoordinatesToLatLng(oArgs.data);
            var oAttributeList = new leafLet.typeLibrary.airspace.AttributeList(oArgs.properties);
            var oLeafletObject = this.getLeafletObject();
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            
            oAttributes = oAttributeList.get(0);
            oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_POLYGON);
            var oLineColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_COLOR));
            var oFillColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_FILL_COLOR));
            var iWidth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_WIDTH);
            var oPolygonOptions = {
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

                oPolygonOptions.tempColor = oPolygonOptions.color;
                oPolygonOptions.tempWeight = oPolygonOptions.weight;
                
                oPolygonOptions.color = '#' + oSelectAttributes.color;
                oPolygonOptions.weight = oSelectAttributes.width;
            }

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

leafLet.typeLibrary.airspace.Polygon = leafLet.typeLibrary.AirspaceFeature.extend(leafLet.internalPrivateClass.PolygonAirspace());
