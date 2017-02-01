/* global L, leafLet, emp, armyc2 */

leafLet.internalPrivateClass.AirspaceFeature = function(){
    var publicInterface = {
        initialize: function (args, iMinPoint, iMaxPoints) 
        {
            var options = {
                iMinPoints: iMinPoint,
                iMaxPoints: iMaxPoints,
                oAirspaceAttributeList: {}
            };
            L.Util.setOptions(this, options);
            
            this.options.oAirspaceAttributeList = new leafLet.typeLibrary.airspace.AttributeList(args.item.properties);

            leafLet.typeLibrary.Feature.prototype.initialize.call(this, args);
        },
        getMinPoints: function()
        {
            return this.options.iMinPoints;
        },
        getMaxPoints: function()
        {
            return this.options.iMaxPoints;
        },
        getUnits: function()
        {
            return leafLet.utils.Units.METERS;
        },
        getAltitudeModeAbbr: function()
        {
            var oAttributes = this.getAttributes(0);
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;

            return leafLet.utils.AltitudeModeAbbr(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_ALTITUDE_MODE));
        },
        getAttributeList: function()
        {
            return this.options.oAirspaceAttributeList;
        },
        setAttributeList: function(oList)
        {
            this.options.oAirspaceAttributeList = oList;
        },
        getAttributes: function(iIndex)
        {
            return this.getAttributeList().get(iIndex);
        },
        getCoordinateList: function()
        {
            return leafLet.utils.geoJson.convertCoordinatesToLatLng(this.getData());
        },
        setCoordinates: function(oLatLngList)
        {
            leafLet.utils.geoJson.convertLatLngListToGeoJson(this.getData(), oLatLngList);
        },
        render: function()
        {
            if (this.isVisible())
            {
                var oNewLeafletObject = this._createFeature(this.options);

                if (oNewLeafletObject)
                {
                    this.setLeafletObject(oNewLeafletObject);
                }
            }
        },
        _updateFeature: function(oArgs)
        {
            oArgs.oAirspaceAttributeList = new leafLet.typeLibrary.airspace.AttributeList(oArgs.properties);
            return this._createFeature(oArgs);
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.AirspaceFeature = leafLet.typeLibrary.Feature.extend(leafLet.internalPrivateClass.AirspaceFeature());
