/* global L, leafLet, emp, armyc2 */

leafLet.internalPrivateClass.AOIFeature = function(){
    var publicInterface = {
        initialize: function (args) 
        {
            var options = {
                oOriginalData: emp.helpers.copyObject(args.item.data),
                iBuffer: undefined,
                sAOIType: undefined,
                sSymbolCode: undefined,
                oModifiers: {}
            };
            L.Util.setOptions(this, options);

            leafLet.typeLibrary.Feature.prototype.initialize.call(this, args);
        },
        _createFeature: function(args)
        {
            var sDescription = args.properties.description || "";
            var oGeoJson = args.data;

            this.setAOIType(oGeoJson.properties.aoi.type);
            this.setAOIBuffer(oGeoJson.properties.aoi.buffer);
            this.setAOISymbolCode();
            this.setModifiers();

            return leafLet.utils.milstd.renderMPGraphic({
                instanceInterface: this.getEngineInstanceInterface(),
                isSelected: args.selected,
                sID: args.coreId,
                sName: args.name,
                sDescription: sDescription,
                sSymbolCode: this.getAOISymbolCode(),
                oCoordData: args.data.geometry,
                oModifiers: emp.helpers.copyObject(this.getModifiers()),
                i2525Version: 0,
                oFeature: this
            });
        },
        _updateFeature: function(oArgs)
        {
            return this._createFeature(oArgs);
        },
        getPopupText: function()
        {
            var eAOIType = emp.typeLibrary.AOIType;
            var sText;
            
            sText = "<center><b>AOI&nbsp;";
            
            switch (this.getAOIType())
            {
                case eAOIType.POINT_RADIUS:
                    sText += "Point Radius";
                    break;
                case eAOIType.LINE:
                    sText += "Line";
                    break;
                case eAOIType.POLYGON:
                    sText += "Polygon";
                    break;
                case eAOIType.BBOX:
                    sText += "Rectangle";
                    break;
            }
            sText += "</b></center>";
            sText += "<center><b>Buffer</b>:&nbsp;" + this.getAOIBuffer() + "</center><br/>";
            sText += this._getPopupDescription();

            return sText;
        },
        getUnits: function()
        {
            return leafLet.utils.Units.METERS;
        },
        getAOIType: function()
        {
            return this.options.sAOIType;
        },
        setAOIType: function(sType)
        {
            this.options.sAOIType = sType;
        },
        getAOIBuffer: function()
        {
            return this.options.iBuffer;
        },
        setAOIBuffer: function(iBuffer)
        {
            this.options.iBuffer = iBuffer;
        },
        setAOIBufferProperty: function(iBuffer)
        {
            this.options.data.properties.aoi.buffer = iBuffer;
        },
        getAOISymbolCode: function()
        {
            return this.options.sSymbolCode;
        },
        setAOISymbolCode: function()
        {
            var eAOIType = emp.typeLibrary.AOIType;
            
            switch (this.getAOIType())
            {
                case eAOIType.POINT_RADIUS:
                    this.options.sSymbolCode = "BBS_POINT------";
                    break;
                case eAOIType.LINE:
                    this.options.sSymbolCode = "BBS_LINE-------";
                    break;
                case eAOIType.POLYGON:
                    this.options.sSymbolCode = "BBS_AREA-------";
                    break;
                case eAOIType.BBOX:
                    this.options.sSymbolCode = "BBS_RECTANGLE--";
                    break;
            }
        },
        getModifiers: function()
        {
            return this.options.oModifiers;
        },
        setModifiers: function()
        {
            var oGeoJson = this.getData();
            var eMilStdModifiers =  leafLet.utils.milstd.Modifiers;
            var oProperties = this.getProperties();
            
            this.options.oModifiers[eMilStdModifiers.UNIQUE_DESIGNATOR_1] = this.getName();
            this.options.oModifiers[eMilStdModifiers.DISTANCE] = [this.getAOIBuffer()];
            
            if (oProperties)
            {
                if (oProperties.hasOwnProperty('fillColor'))
                {
                    this.options.oModifiers["fillColor"] = oProperties.fillColor;
                }
                if (oProperties.hasOwnProperty('lineColor'))
                {
                    this.options.oModifiers["lineColor"] = oProperties.lineColor;
                }
            }
            
            if (!this.options.oModifiers["fillColor"])
            {
                if (oGeoJson && oGeoJson.properties.hasOwnProperty('fillColor'))
                {
                    this.options.oModifiers["fillColor"] = oGeoJson.properties.fillColor;
                }
            }
            
            if (!this.options.oModifiers["lineColor"])
            {
                if (oGeoJson && oGeoJson.properties.hasOwnProperty('lineColor'))
                {
                    this.options.oModifiers["lineColor"] = oGeoJson.properties.lineColor;
                }
            }
            
            if (!this.options.oModifiers["fillColor"])
            {
                // If fill color is still not set, set our default.
                // I would prefer the default to be set by the renderer but it fails
                // if one is not provided.
                this.options.oModifiers["fillColor"] = '99AAAAAA';
            }
        },
        getGeometryType: function()
        {
            return leafLet.utils.geoJson.getGeometryType(this.getData());
        },
        render: function()
        {
            if (this.isVisible())
            {
                var oNewLeafletObject = this._createFeature(this.options);

                this.setLeafletObject(oNewLeafletObject);
            }
        }
    };
    return publicInterface;
};

leafLet.typeLibrary.AOIFeature = leafLet.typeLibrary.Feature.extend(leafLet.internalPrivateClass.AOIFeature());
