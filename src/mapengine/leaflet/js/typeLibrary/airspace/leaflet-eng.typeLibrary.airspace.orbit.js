/* global L, leafLet, emp, armyc2 */

leafLet.internalPrivateClass.OrbitAirspace = function(){
    var publicInterface = {
        initialize: function (args) 
        {
            var options = {
            };
            L.Util.setOptions(this, options);

            leafLet.typeLibrary.AirspaceFeature.prototype.initialize.call(this, args, 2, 2);
        },
        getPopupText: function()
        {
            var sPopupText = "";
            var oAttributes = this.getAttributes(0);
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            
            sPopupText = "<center>" +
                    "<b>Turn</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_ORBIT_TURN) + 
                    "<br/><b>Width</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_WIDTH) +  this.getUnits() +
                    "<br/><b>Min Alt</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_MIN_ALTITUDE) + this._getAltUnitsAndModeText() + 
                    "<br/><b>Max Alt</b>:&nbsp;" + oAttributes.getValue(cAirspaceAttribute.AIRSPACE_MAX_ALTITUDE) + this._getAltUnitsAndModeText() + 
                    "</center><br/>" +
                    this._getPopupDescription();
            return sPopupText;
        },
        _createFeature: function(oArgs)
        {
            var sTurn;
            var oLatLngList = leafLet.utils.geoJson.convertCoordinatesToLatLng(oArgs.data);;
            var oNewLatLngList = oLatLngList;
            var oAttributes = oArgs.oAirspaceAttributeList.get(0);
            
            if (oLatLngList.length < 2)
            {
                return undefined;
            }
            
            oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_ORBIT);
            sTurn = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_ORBIT_TURN);
            
            if (sTurn !== emp.typeLibrary.orbitTurnType.CENTER)
            {
                var dDist = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_WIDTH) / 2;
                var dAnglePt1Pt2 = oLatLngList[0].bearingTo(oLatLngList[1]);
                var dBearing;
                oNewLatLngList = [];

                switch (sTurn)
                {
                    case emp.typeLibrary.orbitTurnType.RIGHT:
                        dBearing = (dAnglePt1Pt2 + 90.0) % 360;
                        break;
                    case emp.typeLibrary.orbitTurnType.LEFT:
                        dBearing = (dAnglePt1Pt2 + 270.0) % 360;
                        break;
                }
                oNewLatLngList.push(oLatLngList[0].destinationPoint(dBearing, dDist));
                oNewLatLngList.push(oLatLngList[1].destinationPoint(dBearing, dDist));
            }

            var oLeafletObject = new leafLet.utils.OvalObject({
                    leafletMap: this.options.instanceInterface.leafletInstance,
                    width: oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_WIDTH),
                    attributes: oAttributes,
                    isSelected: this.isSelected(),
                    selectAttributes: this.getEngineInstanceInterface().selectAttributes,
                    coordinates: oNewLatLngList,
                    oFeature: this
                });
            
            this.setAttributeList(oArgs.oAirspaceAttributeList);

            return oLeafletObject;
        },
        _updateFeature: function(oArgs)
        {
            var oAttributeList = new leafLet.typeLibrary.airspace.AttributeList(oArgs.properties);

            oArgs.oAirspaceAttributeList = oAttributeList;
            return this._createFeature(oArgs);
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.airspace.Orbit = leafLet.typeLibrary.AirspaceFeature.extend(leafLet.internalPrivateClass.OrbitAirspace());
