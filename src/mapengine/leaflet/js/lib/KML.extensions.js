/* global L, emp, leafLet */

leafLet.internalPrivateClass.EmpKMLIcon = function(){
    var publicInterface = {
        createIcon: function (oldIcon) {
            var oThis = this;
            var img = this._createIcon('icon', oldIcon);
            this.options.oIconImag = img;
            
            img.onload = function () {
                //this.width = this.naturalWidth;
                //this.height = this.naturalHeight;
                oThis.options.oMarker.update();
            };

            img.onerror = function(){
                var oDefaultIcon = emp.utilities.icon.getDefaultIcon(oThis.options.basePath);
                
                oThis.options.iconSize = new L.Point(oDefaultIcon.size.width, oDefaultIcon.size.height);
                oThis.options.iconAnchorRef = {x: oDefaultIcon.offset.x, y: oDefaultIcon.offset.y};
                oThis.options.iconAnchorType =	{x: oDefaultIcon.offset.xUnits, y: oDefaultIcon.offset.yUnits};

                img.src = oDefaultIcon.iconUrl;
            };
            return img;
        },
        _getRealScale: function()
        {
            var dKMLScale = 1.0;
            var dScale = 1.0;
            
            if (!emp.helpers.isEmptyString(this.options.scale))
            {
                dKMLScale = parseFloat(this.options.scale);
            }

            if ((this.options.oIconImag.naturalWidth > this.options.oIconImag.naturalHeight) &&
                    (this.options.oIconImag.naturalWidth > 32))
            {
                dScale = 32 / this.options.oIconImag.naturalWidth;
            }
            else if ((this.options.oIconImag.naturalHeight > this.options.oIconImag.naturalWidth) &&
                    (this.options.oIconImag.naturalHeight > 32))
            {
                dScale = 32 / this.options.oIconImag.naturalHeight;
            }
            else if ((this.options.oIconImag.naturalHeight === this.options.oIconImag.naturalWidth) &&
                    (this.options.oIconImag.naturalHeight > 32))
            {
                dScale = 32 / this.options.oIconImag.naturalHeight;
            }

            return dKMLScale * dScale;
        },
        _calculatXOffset: function(iIconWidth, sOffset, sOffsetType, dScale)
        {
            var iOffset = 0;

            switch (sOffsetType.toLowerCase())
            {
                case 'fraction':
                    var dFraction = parseFloat(sOffset);

                    iOffset = Math.floor(iIconWidth * dFraction * -1.0);
                    break;
                case 'pixels':
                    var iOffsetValue = parseInt(sOffset);

                    iOffset = iOffsetValue * -1;
                    break;
                case 'insetpixels':
                    var iOffsetValue = parseInt(sOffset);

                    iOffset = (iIconWidth - iOffsetValue) * -1;
                    break;
            }

            return Math.floor(iOffset * dScale);
        },
        _calculatYOffset: function(iIconHeight, sOffset, sOffsetType, dScale)
        {
            var iOffset = 0;

            switch (sOffsetType.toLowerCase())
            {
                case 'fraction':
                    var dFraction = parseFloat(sOffset);

                    iOffset = Math.floor(iIconHeight * dFraction) - iIconHeight;
                    break;
                case 'pixels':
                    var iOffsetValue = parseInt(sOffset);

                    iOffset = iOffsetValue - iIconHeight;
                    break;
                case 'insetpixels':
                    var iOffsetValue = parseInt(sOffset);

                    iOffset = iOffsetValue * -1;
                    break;
            }

            return Math.floor(iOffset * dScale);
        },
        _applyAnchorRef: function()
        {
            var oImg = this.options.oIconImag;
            var marginLeft;
            var marginTop;
            var iIconWidth;
            var iIconHeight;
            var dAngle;
            var dTempX;
            var dTempY;
            var fHeading;
            var iCenterX;
            var iCenterY;
            var dScale = this._getRealScale();

            if (this.options.iconAnchorRef)
            {
                var oOffset = this.options.iconAnchorRef;
                var oUnits = this.options.iconAnchorType;
                var sXUnits = 'fraction';
                var sYUnits = 'fraction';

                if (oUnits && (typeof (oUnits.x) === 'string'))
                {
                    sXUnits = oUnits.x;
                }

                if (oUnits && (typeof (oUnits.y) === 'string'))
                {
                    sYUnits = oUnits.y;
                }

                marginLeft = this._calculatXOffset(oImg.naturalWidth, oOffset.x, sXUnits, dScale);
                marginTop = this._calculatYOffset(oImg.naturalHeight, oOffset.y, sYUnits, dScale);
                
                iIconWidth = Math.floor(oImg.naturalWidth * dScale);
                iIconHeight = Math.floor(oImg.naturalHeight * dScale);
            }
            else
            {
                var oIconUtils = emp.typeLibrary.utils.icon;
                var oDefaultIcon = oIconUtils.getDefaultIcon(this.options.basePath);
                var iXOffset = oIconUtils.calculateXOffset(oDefaultIcon.size.width, oDefaultIcon.offset.x, oDefaultIcon.offset.xUnits);
                var iYOffset = oIconUtils.calculateYOffset(oDefaultIcon.size.height, oDefaultIcon.offset.y, oDefaultIcon.offset.yUnits, emp.utilities.icon.referencePoin.BOTTOM_LEFT);
                
                marginLeft = iXOffset;
                marginTop = iYOffset;
                
                iIconWidth = Math.floor(oDefaultIcon.size.width * dScale);
                iIconHeight = Math.floor(oDefaultIcon.size.height * dScale);
            }

            if (!emp.helpers.isEmptyString(this.options.heading))
            {
                fHeading = parseFloat(this.options.heading);
                iCenterX = marginLeft + (iIconWidth / 2);
                iCenterY = marginTop + (iIconHeight / 2);
                
                dTempX = 0 - iCenterX;
                dTempY = 0 - iCenterY;

                dAngle = fHeading * Math.PI / 180.0;
                var dSin = Math.sin(dAngle);
                var dCos = Math.cos(dAngle);

                var dNewX = Math.round((dTempX * dCos) - (dTempY * dSin));
                var dNewY = Math.round((dTempX * dSin) + (dTempY * dCos));

                dTempX = dNewX + iCenterX;
                dTempY = dNewY + iCenterY;

                marginLeft -= dTempX;
                marginTop -= dTempY;
            }

            oImg.style.marginLeft = Math.ceil(marginLeft) + 'px';
            oImg.style.marginTop = Math.ceil(marginTop) + 'px';
            
            oImg.style.width = iIconWidth + 'px';
            oImg.style.height = iIconHeight + 'px';
            
            return Math.floor(dScale * 1000) / 1000;
        }
    };
    
    return publicInterface;
};

leafLet.typeLibrary.EmpKMLIcon = L.KMLIcon.extend(leafLet.internalPrivateClass.EmpKMLIcon());

leafLet.internalPrivateClass.EmpKMLMarker = function(){
    var publicInterface = {
	initialize: function (latlng, options) {
            options.draggable = false;

            options.icon.options.oMarker = this;
            L.Marker.prototype.initialize.call(this, latlng, options);
	},
        setLatLng: function (latlng) {
            this._latlng = L.latLng(latlng);

            if (this._icon)
            {
                var pos = this._map.latLngToLayerPoint(this._latlng).round();

                this._setPos(pos);
            }

            return this.fire('move', { latlng: this._latlng });
        },
        update: function () {
            if (this._icon) {
                var pos = this._map.latLngToLayerPoint(this._latlng).round();

                this._setPos(pos);
            }

            return this;
        },

	_setPos: function (pos) {
            var oImg;
            var sTemp;
            var dScale = this.options.icon._applyAnchorRef();
            
            L.Marker.prototype._setPos.call(this, pos);
            
            oImg = this._icon;

            sTemp = emp.helpers.isEmptyString(oImg.style[L.DomUtil.TRANSFORM])? '': oImg.style[L.DomUtil.TRANSFORM];
            
            //sTemp += ' scale(' + dScale + ',' + dScale + ')';
            
            if (!emp.helpers.isEmptyString(this.options.icon.options.heading))
            {
                sTemp += ' rotate(' + this.options.icon.options.heading + 'deg)';
            }
            
            oImg.style[L.DomUtil.TRANSFORM] = sTemp;
	}
    };
    
    return publicInterface;
};

leafLet.typeLibrary.EmpKMLMarker = L.Marker.extend(leafLet.internalPrivateClass.EmpKMLMarker());

leafLet.internalPrivateClass.KMLPluginExtension = function(){
    var publicInterface = {
        initialize: function(kml, options) {
            L.Util.setOptions(this, options);
            this._kml = kml;
            this._layers = {};

            if (kml)
            {
                if (typeof (kml) !== 'string')
                {
                    throw new Error('KML or URL must be a string.');
                }
                
                if (emp.helpers.isUrl(kml))
                {
                    this.addKML(kml, options, this.options.async);
                }
                else
                {
                    this._addKML(emp.$.parseXML(kml), options);
                }
            }
        },
        getIconUrl: function(sKmlUrl)
        {
            var sURL = sKmlUrl;
            if (this.options.oFeatureProperties.hasOwnProperty('iconUrl'))
            {
                sURL = this.options.oFeatureProperties.iconUrl;
            }
            
            if (emp.util.config.getUseProxySetting())
            {
                sURL = emp.util.config.getProxyUrl() + "?" + "mime=image/*&url=" + escape(sURL);
            }

            return sURL;
        },
        _addKML: function(xml, options)
        {
                this.options.kmlDoc = xml;
                var layers = this.parseKML(xml);
                if (!layers || !layers.length) return;
                for (var i = 0; i < layers.length; i++) {
                    this.fire('addlayer', {
                            layer: layers[i]
                    });
                    this.addLayer(layers[i]);
                }
                this.latLngs = this.getLatLngs(xml);
                this.fire('loaded');
        },
        parseStyle: function (xml) {
            var style = {};
            var sl = xml.getElementsByTagName('Style');

            //for (var i = 0; i < sl.length; i++) {
            var attributes = {color: true, width: true, Icon: true, href: true,
                              hotSpot: true, scale: true, heading:true};

            function _parse(xml) {
                var options = {};
                for (var i = 0; i < xml.childNodes.length; i++) {
                    var e = xml.childNodes[i];
                    var key = e.tagName;
                    if (!attributes[key]) { continue; }
                    if (key === 'hotSpot')
                    {
                        for (var j = 0; j < e.attributes.length; j++) {
                            options[e.attributes[j].name] = e.attributes[j].nodeValue;
                        }
                    } else {
                        var value = e.childNodes[0].nodeValue;
                        if (key === 'color') {
                            options.opacity = parseInt(value.substring(0, 2), 16) / 255.0;
                            options.color = '#' + value.substring(6, 8) + value.substring(4, 6) + value.substring(2, 4);
                        } else if (key === 'width') {
                            options.weight = value;
                        } else if (key === 'Icon') {
                            ioptions = _parse(e);
                            if (ioptions.href) { options.href = ioptions.href; }
                        } else if (key === 'href') {
                            options.href = value;
                        } else if (key === 'scale') {
                            options.scale = value;
                        } else if (key === 'heading') {
                            options.heading = value;
                        }
                    }
                }
                return options;
            }

            for (var i = 0; i < sl.length; i++) {
                var e = sl[i],
                    el;
                var options = {},
                    poptions = {},
                    ioptions = {};

                el = e.getElementsByTagName('LineStyle');
                if (el && el[0]) { options = _parse(el[0]); }

                el = e.getElementsByTagName('PolyStyle');

                if (el && el[0]) { poptions = _parse(el[0]); }

                if (poptions.color) { options.fillColor = poptions.color; }

                if (poptions.opacity) { options.fillOpacity = poptions.opacity; }

                el = e.getElementsByTagName('IconStyle');
                if (el && el[0]) { ioptions = _parse(el[0]); }

                if (ioptions.href) {
                    // save anchor info until the image is loaded
                    
                    var oIconOptions = {
                        iconUrl: this.getIconUrl(ioptions.href),
                        shadowUrl: null,
                        iconAnchorRef: {x: ioptions.x, y: ioptions.y},
                        iconAnchorType:	{x: ioptions.xunits, y: ioptions.yunits}
                    };
                    
                    if (!emp.helpers.isEmptyString(ioptions.scale))
                    {
                        oIconOptions.scale = ioptions.scale;
                    }
                    
                    if (!emp.helpers.isEmptyString(ioptions.heading))
                    {
                        oIconOptions.heading = ioptions.heading;
                    }
                    
                    oIconOptions.basePath = this.options.basePath;
                    
                    options.icon = new leafLet.typeLibrary.EmpKMLIcon(oIconOptions);
                }
                style['#' + e.getAttribute('id')] = options;
            }
            return style;
        },
        parsePlacemark: function (place, xml, style) {
            var h, i, j, el, options = {};

            var multi = ['MultiGeometry', 'gx:MultiTrack'];
            for (h in multi) {
                if (!multi.hasOwnProperty(h)) {
                    continue;
                }
                el = place.getElementsByTagName(multi[h]);
                for (i = 0; i < el.length; i++) {
                    return this.parsePlacemark(el[i], xml, style);
                }
            }

            el = place.getElementsByTagName('Style');
            
            if (el && (el.length > 0))
            {
                for (i = 0; i < el.length; i++) {
                    var sIndex = '#' + el[i].getAttribute('id');
                    for (var a in style[sIndex]) {
                        if (!style[sIndex].hasOwnProperty(a)) {
                            continue;
                        }
                        options[a] = style[sIndex][a];
                    }
                }
            }
            else
            {
                el = place.getElementsByTagName('styleUrl');

                for (i = 0; i < el.length; i++) {
                    var url = el[i].childNodes[0].nodeValue;
                    for (var a in style[url]) {
                        if (!style[url].hasOwnProperty(a)) {
                            continue;
                        }
                        options[a] = style[url][a];
                    }
                }
            }

            var layers = [];

            var parse = ['LineString', 'Polygon', 'Point', 'gx:Track'];
            for (j in parse) {
                if (!parse.hasOwnProperty(j)) {
                    continue;
                }
                var tag = parse[j];
                el = place.getElementsByTagName(tag);
                for (i = 0; i < el.length; i++) {
                    var l = this['parse' + tag.replace(/gx:/, '')](el[i], xml, options);
                    if (l) { layers.push(l); }
                }
            }

            if (!layers.length) {
                return;
            }
            var layer = layers[0];
            if (layers.length > 1) {
                layer = new L.FeatureGroup(layers);
            }

            var sID, name, descr = '';
            
            if (place.id) {
                sID = place.id;
            }

            el = place.getElementsByTagName('name');
            if (el.length && el[0].childNodes.length) {
                name = el[0].childNodes[0].nodeValue;
            }
            el = place.getElementsByTagName('description');
            for (i = 0; i < el.length; i++) {
                for (j = 0; j < el[i].childNodes.length; j++) {
                    descr = descr + el[i].childNodes[j].nodeValue;
                }
            }
            
            if ((typeof (name) === 'string') && (name.length > 0))
            {
                layer.options.kmlName = name;
            }
            
            if ((typeof (descr) === 'string') && (descr.length > 0))
            {
                layer.options.kmlDescription = descr;
            }
            
            if ((typeof (sID) === 'string') && (sID.length > 0))
            {
                layer.options.sSubItemID = sID;
            }

            //if (name) {
            //    layer.bindPopup('<h2>' + name + '</h2>' + descr, {
            //        closeButton: false
            //    });
            //}

            return layer;
        },
        _read_coords: function (el) {
            var text = '', coords = [], i;
            for (i = 0; i < el.childNodes.length; i++) {
                text = text + el.childNodes[i].nodeValue;
            }
            text = text.split(/[\s\n]+/);
            for (i = 0; i < text.length; i++) {
                var ll = text[i].split(',');
                if (ll.length < 2) {
                    continue;
                }
                coords.push(new L.LatLng(ll[1], ll[0], ll[2]));
            }
            return coords;
        },
        _read_gxcoords: function (el) {
            var text = '', coords = [];
            text = el.firstChild.nodeValue.split(' ');
            coords.push(new L.LatLng(text[1], text[0], text[2]));
            return coords;
        },
        getOptions: function(sType, oOptions)
        {
            var oColor;
            var oProperties = this.options.oFeatureProperties;
            
            if (sType === 'point') {
                var sURL;
                var iXOffset,
                    iYOffset,
                    sXUnits,
                    sYUnits;

                if (oProperties.hasOwnProperty('iconUrl'))
                {
                    sURL = this.getIconUrl(oProperties.iconUrl);
                }

                if (oProperties.hasOwnProperty('iconXOffset'))
                {
                    iXOffset = oProperties.iconXOffset;
                    if (oProperties.hasOwnProperty('xUnits'))
                    {
                        sXUnits = oProperties.xUnits;
                    }
                }

                if (oProperties.hasOwnProperty('iconYOffset'))
                {
                    iYOffset = oProperties.iconYOffset;
                    if (oProperties.hasOwnProperty('yUnits'))
                    {
                        sYUnits = oProperties.yUnits;
                    }
                }

                if (!iXOffset)
                {
                    if (oOptions.icon && oOptions.icon.options.iconAnchorRef)
                    {
                        iXOffset = oOptions.icon.options.iconAnchorRef.x;
                    }
                    else
                    {
                        iXOffset = 0;
                    }
                }

                if (!sXUnits)
                {
                    if (oOptions.icon && oOptions.icon.options.iconAnchorType)
                    {
                        sXUnits = oOptions.icon.options.iconAnchorType.x;
                    }
                    else
                    {
                        sXUnits = 'fraction';
                    }
                }

                if (!iYOffset)
                {
                    if (oOptions.icon && oOptions.icon.options.iconAnchorRef)
                    {
                        iYOffset = oOptions.icon.options.iconAnchorRef.y;
                    }
                    else
                    {
                        iYOffset = 0;
                    }
                }

                if (!sYUnits)
                {
                    if (oOptions.icon && oOptions.icon.options.iconAnchorType)
                    {
                        sYUnits = oOptions.icon.options.iconAnchorType.y;
                    }
                    else
                    {
                        sYUnits = 'fraction';
                    }
                }

                if (!oOptions.icon)
                {
                    if (!sURL)
                    {
                        var oDefaultIcon = emp.utilities.icon.getDefaultIcon(this.options.basePath);
                        
                        sURL = oDefaultIcon.iconUrl;
                        iYOffset = oDefaultIcon.offset.y;
                        iXOffset = oDefaultIcon.offset.x;
                        sXUnits = oDefaultIcon.offset.xUnits;
                        sYUnits = oDefaultIcon.offset.yUnits;
                    }
                    
                    if (this.options.oFeature.isSelected())
                    {
                        oOptions.icon = new leafLet.typeLibrary.EmpKMLIcon({
                            iconUrl: sURL,
                            shadowUrl: null,
                            iconAnchorRef: {x: iXOffset, y: iYOffset},
                            iconAnchorType: {x: sXUnits, y: sYUnits},
                            className: 'icon-selected',
                            basePath: this.options.basePath
                        });
                    }
                    else
                    {
                        oOptions.icon = new leafLet.typeLibrary.EmpKMLIcon({
                            iconUrl: sURL,
                            shadowUrl: null,
                            iconAnchorRef: {x: iXOffset, y: iYOffset},
                            iconAnchorType: {x: sXUnits, y: sYUnits},
                            basePath: this.options.basePath
                        });
                    }
                }
                else
                {
                    if ((typeof (sURL) === 'string') && (sURL.length > 0))
                    {
                        oOptions.icon.options.iconUrl = sURL;
                    }
                    oOptions.icon.options.iconAnchorRef = {x: iXOffset, y: iYOffset};
                    oOptions.icon.options.iconAnchorType = {x: sXUnits, y: sYUnits};

                    if (this.options.oFeature.isSelected())
                    {
                        oOptions.icon.options.className = 'icon-selected';
                    }
                    else
                    {
                        oOptions.icon.options.className = '';
                    }
                }
            }
            
            if (this.options.oFeature.isSelected()) {
                oOptions.color = '#' + this.options.oFeature.options.instanceInterface.selectAttributes.color;
                oOptions.weight = this.options.oFeature.options.instanceInterface.selectAttributes.width;
                
                if ((sType === 'line') || (sType === 'polygon')) {
                    if (oProperties.hasOwnProperty('lineColor')) {
                        oOptions.tempColor = leafLet.utils.convertColor(oProperties.lineColor).sColor;
                    } else {
                        oOptions.tempColor = L.LEAFLET_DEFAULT_LINE_COLOR;
                    }
                    if (oProperties.hasOwnProperty('lineWidth'))
                    {
                        if (typeof (oProperties.lineWidth) === 'string')
                        {
                            oOptions.tempWeight = parseInt(oProperties.lineWidth);
                        }
                        else
                        {
                            oOptions.tempWeight = oProperties.lineWidth;
                        }
                    } else {
                        oOptions.tempWeight = L.LEAFLET_DEFAULT_LINE_WEIGHT;
                    }
                }
            } else if (oProperties.hasOwnProperty('lineColor') && ((sType === 'line') || (sType === 'polygon'))) {
                oColor = leafLet.utils.convertColor(oProperties.lineColor);
                
                oOptions.color = oColor.sColor;
                oOptions.opacity = oColor.opacity;
                
                if (oProperties.hasOwnProperty('lineWidth'))
                {
                    if (typeof (oProperties.lineWidth) === 'string')
                    {
                        oOptions.weight = parseInt(oProperties.lineWidth);
                    }
                    else
                    {
                        oOptions.weight = oProperties.lineWidth;
                    }
                }                    
            }

            if (oProperties.hasOwnProperty('fillColor') && (sType === 'polygon'))
            {
                oColor = leafLet.utils.convertColor(oProperties.fillColor);
                
                oOptions.fill = true;
                oOptions.fillColor = oColor.sColor;
                oOptions.fillOpacity = oColor.opacity;
            }
            
            oOptions.oFeature = this.options.oFeature;
            
            return oOptions;
        },
        parsePoint: function (line, xml, options) {
            var el = line.getElementsByTagName('coordinates');
            if (!el.length) {
                return;
            }
            var ll = el[0].childNodes[0].nodeValue.split(',');
            return new leafLet.typeLibrary.EmpKMLMarker(new L.LatLng(ll[1], ll[0], ll[2]), this.getOptions('point', options));
        },
	parseLineString: function (line, xml, options) {
            var coords = this.parseCoords(line);
            if (!coords.length) { return; }
            return new L.Polyline(coords, this.getOptions('line', options));
	},
	parseTrack: function (line, xml, options) {
            var el = xml.getElementsByTagName('gx:coord');
            var coords = [];
            for (var j = 0; j < el.length; j++) {
                    coords = coords.concat(this._read_gxcoords(el[j]));
            }
            if (!coords.length) { return; }
            return new L.Polyline(coords, this.getOptions('line', options));
	},
	parsePolygon: function (line, xml, options) {
            var el, polys = [], inner = [], i, coords;
            
            el = line.getElementsByTagName('outerBoundaryIs');
            
            for (i = 0; i < el.length; i++) {
                coords = this.parseCoords(el[i]);
                if (coords) {
                    polys.push(coords);
                }
            }
            el = line.getElementsByTagName('innerBoundaryIs');
            for (i = 0; i < el.length; i++) {
                coords = this.parseCoords(el[i]);
                if (coords) {
                    inner.push(coords);
                }
            }
            if (!polys.length) {
                return;
            }
            if (options.fillColor) {
                options.fill = true;
            }
            if (polys.length === 1) {
                return new L.Polygon(polys.concat(inner), this.getOptions('polygon', options));
            }
            return new L.MultiPolygon(polys, this.getOptions('polygon', options));
	}
/*	getBounds: function () {
		var bounds = new L.LatLngBounds();

		this.eachLayer(function (layer) {
			bounds.extend(layer instanceof leafLet.typeLibrary.EmpKMLMarker ? layer.getLatLng() : layer.getBounds());
		});

		return bounds;
	}
*/
    };
    
    return publicInterface;
};

leafLet.typeLibrary.EmpKmlObject = L.KML.extend(leafLet.internalPrivateClass.KMLPluginExtension());
