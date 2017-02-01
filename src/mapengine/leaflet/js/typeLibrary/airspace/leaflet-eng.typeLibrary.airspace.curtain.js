/* global L, leafLet, emp, armyc2 */

leafLet.internalPrivateClass.CurtainAirspace = function(){
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
            
            oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_CURTAIN);
            
            var oLineColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_COLOR));
            var iWidth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_WIDTH);

            var oOptions = {
                stroke: true,
                color: oLineColor.sColor,
                opacity: oLineColor.opacity,
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
            
            var oLeafletObject = new L.Polyline(oLatLngList, oOptions);
            
            this.setAttributeList(oArgs.oAirspaceAttributeList);

            return oLeafletObject;
        },
        _updateFeature: function(oArgs)
        {
            var oLeafletObject = this.options.leafletObject;
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            var oAttributeList = new leafLet.typeLibrary.airspace.AttributeList(oArgs.properties);
            var oCoordList = leafLet.utils.geoJson.convertCoordinatesToLatLng(oArgs.data);
            var oAttributes = oAttributeList.get(0);
            
            oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_CURTAIN);
            var oLineColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_COLOR));
            var iWidth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_WIDTH);

            var oOptions = {
                stroke: true,
                color: oLineColor.sColor,
                opacity: oLineColor.opacity,
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

            oLeafletObject.setLatLngs(oCoordList);
            oLeafletObject.setStyle(oOptions);
             
            this.setAttributeList(oAttributeList);
            this.setProperties(oArgs.properties);
            this.setData(oArgs.data);
            
            return oLeafletObject;
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.airspace.Curtain = leafLet.typeLibrary.AirspaceFeature.extend(leafLet.internalPrivateClass.CurtainAirspace());
