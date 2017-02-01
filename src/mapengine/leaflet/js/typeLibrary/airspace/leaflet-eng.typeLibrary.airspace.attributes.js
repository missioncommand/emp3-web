/* global L, leafLet, emp, armyc2 */

leafLet.typeLibrary.AirspaceAttribute = {
    AIRSPACE_FILL_COLOR: "fillColor",
    AIRSPACE_LINE_COLOR: "lineColor",
    AIRSPACE_LINE_WIDTH: "lineWidth",
    AIRSPACE_LEFT_WIDTH: "leftWidth",
    AIRSPACE_RIGHT_WIDTH: "rightWidth",
    AIRSPACE_WIDTH: "width",
    AIRSPACE_HEIGHT: "height",
    AIRSPACE_ALTITUDE: "altitude",
    AIRSPACE_MIN_ALTITUDE: "minAlt",
    AIRSPACE_MAX_ALTITUDE: "maxAlt",
    AIRSPACE_ALTITUDE_MODE: "altitudeMode",
    AIRSPACE_INNER_RADIUS: "innerRadius",
    AIRSPACE_RADIUS: "radius",
    AIRSPACE_LEFT_AZIMUTH: "leftAzimuth",
    AIRSPACE_RIGHT_AZIMUTH: "rightAzimuth",
    AIRSPACE_ORBIT_TURN: "turn"
};

leafLet.internalPrivateClass.AirspaceAttributes = function(){
    var publicInterface = {
        initialize: function (oProperties, oAttributes) 
        {
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            var options = {};
            
            for (var sAttr in oAttributes)
            {
                if (!oAttributes.hasOwnProperty(sAttr)) {
                    continue;
                }
                if (sAttr === leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_ORBIT_TURN)
                {
                    options[sAttr] = oAttributes[sAttr].toLowerCase();
                }
                else
                {
                    options[sAttr] = oAttributes[sAttr];
                }
            }
            
            if (oProperties.hasOwnProperty(cAirspaceAttribute.AIRSPACE_FILL_COLOR))
            {
                options[cAirspaceAttribute.AIRSPACE_FILL_COLOR] = oProperties[cAirspaceAttribute.AIRSPACE_FILL_COLOR];
            }
            
            if (oProperties.hasOwnProperty(cAirspaceAttribute.AIRSPACE_LINE_COLOR))
            {
                options[cAirspaceAttribute.AIRSPACE_LINE_COLOR] = oProperties[cAirspaceAttribute.AIRSPACE_LINE_COLOR];
            }
            
            if (oProperties.hasOwnProperty(cAirspaceAttribute.AIRSPACE_LINE_WIDTH))
            {
                options[cAirspaceAttribute.AIRSPACE_LINE_WIDTH] = oProperties[cAirspaceAttribute.AIRSPACE_LINE_WIDTH];
            }
            
            L.Util.setOptions(this, options);
        },
        getValue: function(sAttr)
        {
            return this.options[sAttr];
        },
        setValue: function(sAttr, Value)
        {
            this.options[sAttr] = Value;
        },
        getAttributes: function()
        {
            return this.options;
        },
        setRequiredAttributes: function(sAirspaceType)
        {
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            var cAirspaceType = emp.typeLibrary.airspaceSymbolCode;
            
            switch (sAirspaceType)
            {
                case cAirspaceType.SHAPE3D_CURTAIN:
                    break;
                case cAirspaceType.SHAPE3D_CYLINDER:
                    if (isNaN(this.getValue(cAirspaceAttribute.AIRSPACE_RADIUS)))
                    {
                        this.setValue(cAirspaceAttribute.AIRSPACE_RADIUS, 2000);
                    }
                    break;
                case cAirspaceType.SHAPE3D_ORBIT:
                    if (isNaN(this.getValue(cAirspaceAttribute.AIRSPACE_WIDTH)))
                    {
                        this.setValue(cAirspaceAttribute.AIRSPACE_WIDTH, 2000);
                    }
                    if (this.getValue(cAirspaceAttribute.AIRSPACE_ORBIT_TURN) === undefined)
                    {
                        this.setValue(cAirspaceAttribute.AIRSPACE_ORBIT_TURN, emp.typeLibrary.orbitTurnType.CENTER);
                    }
                    break;
                case cAirspaceType.SHAPE3D_POLYARC:
                    if (isNaN(this.getValue(cAirspaceAttribute.AIRSPACE_RADIUS)))
                    {
                        this.setValue(cAirspaceAttribute.AIRSPACE_RADIUS, 2000);
                    }
                    if (isNaN(this.getValue(cAirspaceAttribute.AIRSPACE_LEFT_AZIMUTH)))
                    {
                        this.setValue(cAirspaceAttribute.AIRSPACE_LEFT_AZIMUTH, 315.0);
                    }
                    if (isNaN(this.getValue(cAirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH)))
                    {
                        this.setValue(cAirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH, 45.0);
                    }
                    break;
                case cAirspaceType.SHAPE3D_POLYGON:
                    break;
                case cAirspaceType.SHAPE3D_RADARC:
                    if (isNaN(this.getValue(cAirspaceAttribute.AIRSPACE_RADIUS)))
                    {
                        this.setValue(cAirspaceAttribute.AIRSPACE_RADIUS, 2000);
                    }
                    if (isNaN(this.getValue(cAirspaceAttribute.AIRSPACE_INNER_RADIUS)))
                    {
                        this.setValue(cAirspaceAttribute.AIRSPACE_INNER_RADIUS, 1000);
                    }
                    if (isNaN(this.getValue(cAirspaceAttribute.AIRSPACE_LEFT_AZIMUTH)))
                    {
                        this.setValue(cAirspaceAttribute.AIRSPACE_LEFT_AZIMUTH, 315.0);
                    }
                    if (isNaN(this.getValue(cAirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH)))
                    {
                        this.setValue(cAirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH, 45.0);
                    }
                    break;
                case cAirspaceType.SHAPE3D_ROUTE:
                    if (isNaN(this.getValue(cAirspaceAttribute.AIRSPACE_WIDTH)))
                    {
                        this.setValue(cAirspaceAttribute.AIRSPACE_WIDTH, 5000);
                    }
                    break;
                case cAirspaceType.SHAPE3D_TRACK:
                    if (isNaN(this.getValue(cAirspaceAttribute.AIRSPACE_LEFT_WIDTH)))
                    {
                        this.setValue(cAirspaceAttribute.AIRSPACE_LEFT_WIDTH, 2500);
                    }
                    if (isNaN(this.getValue(cAirspaceAttribute.AIRSPACE_RIGHT_WIDTH)))
                    {
                        this.setValue(cAirspaceAttribute.AIRSPACE_RIGHT_WIDTH, 2500);
                    }
                    break;
            }
            
            var dMinAlt = this.getValue(cAirspaceAttribute.AIRSPACE_MIN_ALTITUDE);
            if (isNaN(dMinAlt))
            {
                dMinAlt = 0;
                this.setValue(cAirspaceAttribute.AIRSPACE_MIN_ALTITUDE, dMinAlt);
            }
            if (isNaN(this.getValue(cAirspaceAttribute.AIRSPACE_MAX_ALTITUDE)))
            {
                this.setValue(cAirspaceAttribute.AIRSPACE_MAX_ALTITUDE, dMinAlt + 5000);
            }
            else if (dMinAlt > this.getValue(cAirspaceAttribute.AIRSPACE_MAX_ALTITUDE))
            {
                this.setValue(cAirspaceAttribute.AIRSPACE_MIN_ALTITUDE, this.getValue(cAirspaceAttribute.AIRSPACE_MAX_ALTITUDE));
                this.setValue(cAirspaceAttribute.AIRSPACE_MAX_ALTITUDE, dMinAlt);
            }
            
            if (this.getValue(cAirspaceAttribute.AIRSPACE_FILL_COLOR) === undefined)
            {
                this.setValue(cAirspaceAttribute.AIRSPACE_FILL_COLOR, "0xAAAAFFAA");
            }
            
            if (this.getValue(cAirspaceAttribute.AIRSPACE_LINE_COLOR) === undefined)
            {
                this.setValue(cAirspaceAttribute.AIRSPACE_LINE_COLOR, "0xFF00AA00");
            }
            
            if (isNaN(this.getValue(cAirspaceAttribute.AIRSPACE_LINE_WIDTH)))
            {
                this.setValue(cAirspaceAttribute.AIRSPACE_LINE_WIDTH, 3);
            }
        },
        getAirspaceAttributes: function()
        {
            var oAttr = {};
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            
            for (var sAttr in this.options)
            {
                if (!this.options.hasOwnProperty(sAttr)) {
                    continue;
                }
                switch (sAttr)
                {
                    case cAirspaceAttribute.AIRSPACE_FILL_COLOR:
                    case cAirspaceAttribute.AIRSPACE_LINE_COLOR:
                    case cAirspaceAttribute.AIRSPACE_LINE_WIDTH:
                        break;
                    default:
                        oAttr[sAttr] = this.options[sAttr];
                        break;
                }
            }
            
            return oAttr;
        },
        duplicateAttribute: function()
        {
            return new leafLet.typeLibrary.airspace.Attributes({}, this.options);
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.airspace.Attributes = L.Class.extend(leafLet.internalPrivateClass.AirspaceAttributes());

leafLet.internalPrivateClass.AirspaceAttributeList = function(){
    var publicInterface = {
        initialize: function (oProperties) 
        {
            var oAttrList = oProperties.attributes;
            var options = {
                oAttributeList: []
            };
            L.Util.setOptions(this, options);
            
            if (!(oAttrList instanceof Array))
            {
                if ((typeof (oAttrList) === 'object') && (oAttrList.length > 0))
                {
                    this.add(new leafLet.typeLibrary.airspace.Attributes(oProperties, oAttrList));
                }
                else
                {
                    this.add(new leafLet.typeLibrary.airspace.Attributes(oProperties, {}));
                }
            }
            else
            {
                for (var iIndex = 0; iIndex < oAttrList.length; iIndex++)
                {
                    this.add(new leafLet.typeLibrary.airspace.Attributes(oProperties, oAttrList[iIndex]));
                }
            }
        },
        length: function()
        {
            return this.options.oAttributeList.length;
        },
        get: function(iIndex)
        {
            return this.options.oAttributeList[iIndex];
        },
        add: function(oAttr)
        {
            this.options.oAttributeList.push(oAttr);
        },
        insert: function(iIndex, oAttr)
        {
            this.options.oAttributeList.splice(iIndex, 0, oAttr);
        },
        remove: function(iIndex)
        {
            if (iIndex < this.options.oAttributeList.length)
            {
                this.options.oAttributeList.splice(iIndex, 1);
            }
        },
        getAirspaceAttributeList: function()
        {
            var oAttrList = [];
            
            for (var iIndex = 0; iIndex < this.options.oAttributeList.length; iIndex++)
            {
                oAttrList.push(this.options.oAttributeList[iIndex].getAirspaceAttributes());
            }
            
            return oAttrList;
        },
        getMinAltitude: function()
        {
            var dMin = Number.MAX_VALUE;
            var oAttributeList = this.options.oAttributeList;
            var cAttributeConst = leafLet.typeLibrary.AirspaceAttribute;
            var oAttributes;
            var dValue;
            
            for (var iIndex = 0; iIndex < oAttributeList.length; iIndex++)
            {
                oAttributes = oAttributeList[iIndex];
                dValue = oAttributes.getValue(cAttributeConst.AIRSPACE_MIN_ALTITUDE);
                
                if ((typeof (dValue) === 'number') && (dValue < dMin))
                {
                    dMin = dValue;
                }
            }
            
            return Math.round(dMin);
        },
        getMaxAltitude: function()
        {
            var dMax = Number.MIN_VALUE;
            var oAttributeList = this.options.oAttributeList;
            var cAttributeConst = leafLet.typeLibrary.AirspaceAttribute;
            var oAttributes;
            var dValue;
            
            for (var iIndex = 0; iIndex < oAttributeList.length; iIndex++)
            {
                oAttributes = oAttributeList[iIndex];
                dValue = oAttributes.getValue(cAttributeConst.AIRSPACE_MAX_ALTITUDE);
                
                if ((typeof (dValue) === 'number') && (dValue > dMax))
                {
                    dMax = dValue;
                }
            }
            
            return Math.round(dMax);
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.airspace.AttributeList = L.Class.extend(leafLet.internalPrivateClass.AirspaceAttributeList());

