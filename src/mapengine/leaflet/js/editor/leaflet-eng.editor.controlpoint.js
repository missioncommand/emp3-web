
/* global leafLet, L, emp */
leafLet.ControlPoint = {
    Type: {
        NEW_POSITION_CP: 'newCP',
        POSITION_CP: 'positionCP',
        ALTITUDE_CP: 'altitudeCP',
        RADIUS_CP: 'radiusCP',
        INNER_RADIUS_CP: 'innerRadiusCP',
        WIDTH_CP: 'widthCP',
        LEFT_WIDTH_CP: 'leftWidthCP',
        RIGHT_WIDTH_CP: 'rightWidthCP',
        RANGE_CP: 'rangeCP',
        LENGTH_CP: 'lengthCP',
        AZIMUTH_CP: 'azimuthCP',
        LEFT_AZIMUTH_CP: 'leftAzimuthCP',
        RIGHT_AZIMUTH_CP: 'rightAzimuthCP',
        ATTITUDE_CP: 'attitudeCP',
        SEGMENT_CP: 'segmentCP',
        AOI_BUFFER: 'aoiBufferCP'
    }
};

leafLet.internalPrivateClass.CPIcon = function()
{
    var publicInterface = {
        statics:{
            CP_ICON_DEF: {
                newCP: {
                    iRadius: 7,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#00FF00",
                    sFillColor: "#55FF55"
                },
                positionCP: {
                    iRadius: 11,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#0000FF",
                    sFillColor: "#5555FF"
                },
                altitudeCP: {
                    iRadius: 10,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#FF0000",
                    sFillColor: "#FF5555"
                },
                radiusCP: {
                    iRadius: 10,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#555555",
                    sFillColor: "#888888"
                },
                innerRadiusCP: {
                    iRadius: 10,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#555555",
                    sFillColor: "#888888"
                },
                widthCP: {
                    iRadius: 10,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#000000",
                    sFillColor: "#555555"
                },
                leftWidthCP: {
                    iRadius: 10,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#000000",
                    sFillColor: "#555555"
                },
                rightWidthCP: {
                    iRadius: 10,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#000000",
                    sFillColor: "#555555"
                },
                rangeCP: {
                    iRadius: 10,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#000000",
                    sFillColor: "#555555"
                },
                lengthCP: {
                    iRadius: 10,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#000000",
                    sFillColor: "#555555"
                },
                azimuthCP: {
                    iRadius: 10,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#AAAA00",
                    sFillColor: "#AAAA55"
                },
                leftAzimuthCP: {
                    iRadius: 10,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#AAAA00",
                    sFillColor: "#AAAA55"
                },
                rightAzimuthCP: {
                    iRadius: 10,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#AAAA00",
                    sFillColor: "#AAAA55"
                },
                attitudeCP: {
                    iRadius: 10,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#AAAA00",
                    sFillColor: "#AAAA55"
                },
                segmentCP: {
                    iRadius: 10,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#AAAAFF",
                    sFillColor: "#AAAAFF"
                },
                aoiBufferCP: {
                    iRadius: 10,
                    iLineWidth: 1,
                    dOpacity: 0.7,
                    sStrokeColor: "#000000",
                    sFillColor: "#555555"
                }
            }
        },
        initialize: function (oArgs)
        {
            var oIconDef = leafLet.editor.CPIcon.CP_ICON_DEF[oArgs.cpType];
            var oImage = emp.helpers.createCircleCanvas(oIconDef);

            var options = {
                oIconDef: oIconDef,
                iRadius: oIconDef.iRadius,
                iIconWidth: oImage.width,
                iIconHeight: oImage.height
            };
            L.Util.setOptions(this, options);


            var options = {
                iconUrl: oImage.toDataURL()
//                iconSize: new L.Point(oImage.width, oImage.height)
            };
            
            L.Icon.prototype.initialize.call(this, options);
        },
        _setIconStyles: function (img, name) {
            var options = this.options,
                size = L.point(options[name + 'Size']),
                anchor;

            if (name === 'shadow') {
                anchor = L.point(options.shadowAnchor || options.iconAnchor);
            } else {
                anchor = L.point(options.iconAnchor);
            }

            if (!anchor && size) {
                anchor = size.divideBy(2, true);
            }

            img.className = 'leaflet-marker-' + name + ' ' + options.className;

            if (anchor) {
                img.style.marginLeft = (-anchor.x) + 'px';
                img.style.marginTop  = (-anchor.y) + 'px';
            }

            if (size) {
                img.style.width  = size.x + 'px';
                img.style.height = size.y + 'px';
            }
        }
    };
    
    return publicInterface;
};
leafLet.editor.CPIcon = L.Icon.extend(leafLet.internalPrivateClass.CPIcon());

leafLet.internalPrivateClass.ControlPoint = function()
{
    var publicInterface = {
        statics:{
            oCPIcons:{
                newCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.NEW_POSITION_CP}),
                positionCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.POSITION_CP}),
                altitudeCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.ALTITUDE_CP}),
                radiusCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.RADIUS_CP}),
                innerRadiusCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.INNER_RADIUS_CP}),
                widthCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.WIDTH_CP}),
                leftWidthCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.LEFT_WIDTH_CP}),
                rightWidthCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.RIGHT_WIDTH_CP}),
                rangeCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.RANGE_CP}),
                lengthCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.LENGTH_CP}),
                azimuthCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.AZIMUTH_CP}),
                leftAzimuthCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.LEFT_AZIMUTH_CP}),
                rightAzimuthCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.RIGHT_AZIMUTH_CP}),
                attitudeCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.ATTITUDE_CP}),
                segmentCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.SEGMENT_CP}),
                aoiBufferCP: new leafLet.editor.CPIcon({cpType: leafLet.ControlPoint.Type.AOI_BUFFER})
            }
        },
        initialize: function (oFeature, cpType, oPosition, iIndex, iSubIndex, iValue, oIcon) 
        {
            var options = {
                oFeature: oFeature,
                oIcon: oIcon,
                cpType: cpType,
                cpIndex: iIndex,
                cpSubIndex: iSubIndex,
                cpValue: iValue,
                cpPopup: undefined,
                parent: undefined
            };
            L.Util.setOptions(this, options);
            
            options = {
                icon: leafLet.editor.ControlPoint.oCPIcons[this.getType()],
                zIndexOffset: 1000,
                clickable: true
            };
            
            L.CircleMarker.prototype.initialize.call(this, oPosition, options);
            this._updateCoordinate();
        },
        _updateCoordinate: function()
        {
            var oMapBounds = this.getFeature().getLeafletMap().getBounds();
            var oCoordList = [this.getPosition()];

            if (leafLet.utils.wrapCoordinates(oMapBounds, oCoordList, false))
            {
                this.setLatLng(oCoordList[0]);
            }
        },
        getFeature: function()
        {
            return this.options.oFeature;
        },
        getRadius: function()
        {
            return leafLet.editor.CPIcon.CP_ICON_DEF[this.getType()].iRadius;
        },
        setParent: function(oParent)
        {
            this.options.parent = oParent;
        },
        getType: function()
        {
            return this.options.cpType;
        },
        setType: function(cpType)
        {
            this.options.cpType = cpType;
            this.setIcon(leafLet.editor.ControlPoint.oCPIcons[this.getType()]);
        },
        getIndex: function()
        {
            return this.options.cpIndex;
        },
        setIndex: function(iValue)
        {
            this.options.cpIndex = iValue;
        },
        getSubIndex: function()
        {
            return this.options.cpSubIndex;
        },
        setSubIndex: function(iValue)
        {
            this.options.cpSubIndex = iValue;
        },
        getPosition: function()
        {
            return this.getLatLng();
        },
        setCPPosition: function(oValue)
        {
            this.setLatLng(oValue);
            this._updateCoordinate();
            this.bringToFront();
            if (this.options.cpPopup)
            {
                this.options.cpPopup.setContent(this.getPopupText());
                this.options.cpPopup.setLatLng(this.getPosition());
            }
        },
        getValue: function()
        {
            return this.options.cpValue;
        },
        setValue: function(Value)
        {
            this.options.cpValue = Value;
        },
        _getAngleValue: function()
        {
            var oFeature = this.options.oFeature;
            var sValue;
            
            switch (oFeature.getAzimuthUnits())
            {
                case leafLet.utils.AngleUnits.MILS:
                    sValue = (this.getValue() * leafLet.utils.MILS_PER_DEGREE).toFixed(1) + " " +
                            leafLet.utils.AngleUnits.MILS;
                    break;
                case leafLet.utils.AngleUnits.DEGREES:
                    sValue = this.getValue().toFixed(2) +
                            leafLet.utils.AngleUnits.DEGREES;
                    break;
            }
            
            return sValue;
        },
        _getUnitValue: function()
        {
            var oFeature = this.options.oFeature;
            var sValue;
            
            switch (oFeature.getUnits())
            {
                case leafLet.utils.Units.FEET:
                    sValue = (this.getValue() * leafLet.utils.FEET_PER_METERS).toFixed(0) + " " +
                            leafLet.utils.Units.FEET;
                    break;
                case leafLet.utils.Units.METERS:
                    sValue = this.getValue().toFixed(0) + " " +
                            leafLet.utils.Units.METERS;
                    break;
            }
            
            return sValue;
        },
        _getAltitudeValue: function(dValue)
        {
            var oFeature = this.options.oFeature;
            var sAltMode = oFeature.getAltitudeModeAbbr();
            var sValue;
            
            if (sAltMode.length > 0)
            {
                sAltMode = " " + sAltMode;
            }
            else
            {
                sAltMode = "";
            }
            
            switch (oFeature.getAltitudeUnits())
            {
                case leafLet.utils.Units.FEET:
                    sValue = (dValue * leafLet.utils.FEET_PER_METERS).toFixed(0) + " " +
                            leafLet.utils.Units.FEET + sAltMode;
                    break;
                case leafLet.utils.Units.METERS:
                    sValue = dValue.toFixed(0) + " " +
                            leafLet.utils.Units.METERS + sAltMode;
                    break;
            }
            
            return sValue;
        },
        getPopupText: function()
        {
            var sPopupText = "";
            var oLatLng = this.getPosition().wrap();
            
            switch (this.getType())
            {
                case leafLet.ControlPoint.Type.POSITION_CP:
                    sPopupText = "<center>Pt " + (this.options.cpIndex + 1) + "<br/>" +
                            "Lat:" + oLatLng.lat.toFixed(5) + "<br/>Lon:" + oLatLng.lng.toFixed(5);
                    
                    if (!isNaN(oLatLng.alt))
                    {
                        sPopupText += "<br/>Alt:" + this._getAltitudeValue(oLatLng.alt);
                    }
                    
                    sPopupText += "</center>";
                    break;
                case leafLet.ControlPoint.Type.ALTITUDE_CP:
                    sPopupText = "<center>Alt: " + this._getAltitudeValue(this.getValue()) + "</center>";
                    break;
                case leafLet.ControlPoint.Type.RADIUS_CP:
                    sPopupText = "<center>Radius: " + this._getUnitValue() + "</center>";
                    break;
                case leafLet.ControlPoint.Type.INNER_RADIUS_CP:
                    sPopupText = "<center>Inner Radius: " + this._getUnitValue() + "</center>";
                    break;
                case leafLet.ControlPoint.Type.RANGE_CP:
                    sPopupText = "<center>Range: " + this._getUnitValue() + "</center>";
                    break;
                case leafLet.ControlPoint.Type.WIDTH_CP:
                    sPopupText = "<center>Width: " + this._getUnitValue() + "</center>";
                    break;
                case leafLet.ControlPoint.Type.LEFT_WIDTH_CP:
                    sPopupText = "<center>Left Width: " + this._getUnitValue() + "</center>";
                    break;
                case leafLet.ControlPoint.Type.RIGHT_WIDTH_CP:
                    sPopupText = "<center>Right Width: " + this._getUnitValue() + "</center>";
                    break;
                case leafLet.ControlPoint.Type.LENGTH_CP:
                    sPopupText = "<center>Length: " + this._getUnitValue() + "</center>";
                    break;
                case leafLet.ControlPoint.Type.AZIMUTH_CP:
                    sPopupText = "<center>Azimuth: " + this._getAngleValue() + "</center>";
                    break;
                case leafLet.ControlPoint.Type.LEFT_AZIMUTH_CP:
                    sPopupText = "<center>Left Azimuth: " + this._getAngleValue() + "</center>";
                    break;
                case leafLet.ControlPoint.Type.RIGHT_AZIMUTH_CP:
                    sPopupText = "<center>Right Azimuth: " + this._getAngleValue() + "</center>";
                    break;
                case leafLet.ControlPoint.Type.ATTITUDE_CP:
                    sPopupText = "<center>Attitude: " + this._getAngleValue() + "</center>";
                    break;
                case leafLet.ControlPoint.Type.SEGMENT_CP:
                    sPopupText = "<center>Segment P" + (this.getIndex() + 1) + "-P" + (this.getSubIndex() + 1) + "<br/>Move</center>";
                    break;
                case leafLet.ControlPoint.Type.AOI_BUFFER:
                    sPopupText = "<center>Buffer: " + this._getUnitValue() + "</center>";
                    break;
            }
            
            return sPopupText;
        },
        showPopup: function()
        {
            var sPopupText = this.getPopupText();
            
            if (this.options.cpPopup === undefined)
            {
                var oPopup = new L.Popup({
                    closeButton: false,
                    closeOnClick: false,
                    autoPan: false,
                    className: 'mdl-color-text--grey-900',
                    offset: new L.Point(0, this.getRadius() * -1)
                });

                this.options.cpPopup = oPopup;
            }
            
            this.options.cpPopup.setContent(sPopupText);
            this.options.cpPopup.setLatLng(this.getPosition());
            this.options.parent.addLayer(this.options.cpPopup);
            //this.bindPopup(oPopup);
            //this.openPopup();
            this.bringToFront();
        },
        hidePopup: function()
        {
            //this.closePopup();
            //this.unbindPopup();
            this.options.parent.removeLayer(this.options.cpPopup);
            //this.options.cpPopup = undefined;
            this.bringToFront();
        },
        updatePopup: function()
        {
            if (this.options.cpPopup)
            {
                var sPopupText = this.getPopupText();
                this.options.cpPopup.setContent(sPopupText);
                this.options.cpPopup.setLatLng(this.getPosition());
            }
        },
        bringToFront: function()
        {
//            this.setZIndexOffset(Number.MAX_VALUE);
        },
        setPosition: function (el, point, disable3D) { // (HTMLElement, Point[, Boolean])
            var iRadius = this.options.icon.options.oIconDef.iRadius;
            var oOffsetPoint = new L.Point(point.x - iRadius, point.y - iRadius);

            // jshint camelcase: false
            el._leaflet_pos = point;

            if (!disable3D && L.Browser.any3d) {
                el.style[L.DomUtil.TRANSFORM] =  L.DomUtil.getTranslateString(oOffsetPoint);
            } else {
                el.style.left = oOffsetPoint.x + 'px';
                el.style.top = oOffsetPoint.y + 'px';
            }
        },
        _setPos: function (pos) {
            this.setPosition(this._icon, pos);

            if (this._shadow) {
                this.setPosition(this._shadow, pos);
            }

            this._zIndex = pos.y + this.options.zIndexOffset;

            this._resetZIndex();
        }
    };
    
    return publicInterface;
};

leafLet.editor.ControlPoint = L.Marker.extend(leafLet.internalPrivateClass.ControlPoint());
