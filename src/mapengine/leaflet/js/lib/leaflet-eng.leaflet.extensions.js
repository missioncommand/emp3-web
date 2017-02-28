/* global L, emp, LatLon, leafLet */
L.LEAFLET_DEFAULT_LINE_COLOR = '#0033ff';
L.LEAFLET_DEFAULT_LINE_WEIGHT = 5;

// Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
L.LatLng.fromEmpLatLon = function (oEmpLatLon) {
    return new L.LatLng(oEmpLatLon._lat, oEmpLatLon._lon);
};

// Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
L.LatLng.prototype.toEmpLatLon = function () {
    return new LatLon(this.lat, this.lng);
};

// Using test values of (50,55),(70,55)
// - Leaflet version 0.7.3 native produced -> 2226389.8158654714
// - Leaflet version 0.7.3 extended produced -> 2223898.533 (rounds to 2224000)
// - Leaflet version 1.0.3 native produced -> 2223898.532891174
// From this test it seems the version 1.0.3 calculation can be used.

// L.LatLng.prototype.distanceTo = function (oCoord) {
//     var oThis = this.toEmpLatLon();
//     var oThat = oCoord.toEmpLatLon();
//
//     return oThis.distanceTo(oThat) * 1000.0;
// };

// Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
L.LatLng.prototype.bearingTo = function (oCoord) {
    var oThis = this.toEmpLatLon();
    var oThat = oCoord.toEmpLatLon();

    return oThis.bearingTo(oThat);
};

// Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
L.LatLng.prototype.destinationPoint = function (brng, dist) {
    var oThis = this.toEmpLatLon();
    var oThat = oThis.destinationPoint(brng, dist / 1000.0);

    return new L.LatLng(oThat._lat, oThat._lon, this.alt);
};

// Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
L.LatLng.prototype.moveCoordinate = function (brng, dist) {
    var oThis = this.toEmpLatLon();
    var oThat = oThis.destinationPoint(brng, dist / 1000.0);

    this.lat = oThat._lat;
    this.lng = oThat._lon;
};

// Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
L.LatLng.prototype.intersectLines = function (dBrng1, oCoord2, dBrng2) {
    var oThis = this.toEmpLatLon();
    var oThat = oCoord2.toEmpLatLon();
    var oResult = undefined;

    try {
        oResult = LatLon.intersection(oThis, dBrng1, oThat, dBrng2);
    } catch (error) {
    }

    if (oResult) {
        return new L.LatLng(oResult._lat, oResult._lon);
    }

    return oResult;
};

// Overrides.
// - Leaflet version 0.7.3 native did not return a wrapped L.LatLng with an altitude
// - Leaflet version 0.7.3 extension and 1.0.3 native return a wrapped L.LatLng with
// an altitude populated. Version 1.0.3 function can be used.

// L.LatLng.prototype.wrap = function (a, b) { // (Number, Number) -> LatLng
//     var lng = this.lng;
//
//     a = a || -180;
//     b = b || 180;
//
//     lng = (lng + b) % (b - a) + (lng < a || lng === b ? b : a);
//
//     return new L.LatLng(this.lat, lng, this.alt);
// };


// Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
L.LatLng.prototype.midPointTo = function (oCoord) {
    var dBrng = this.bearingTo(oCoord);
    var dDist = this.distanceTo(oCoord) / 2.0;

    return this.destinationPoint(dBrng, dDist);
};

// Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
L.LatLng.prototype.pointAtFractionOfDistanceTo = function (oCoord, dFraction) {
    var dBrng = this.bearingTo(oCoord);
    var dDist = this.distanceTo(oCoord) * dFraction;

    return this.destinationPoint(dBrng, dDist);
};

// Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
L.LatLng.prototype.pointAt3QtrDistanceTo = function (oCoord) {
    var dBrng = this.bearingTo(oCoord);
    var dDist = this.distanceTo(oCoord) * 0.75;

    return this.destinationPoint(dBrng, dDist);
};

leafLet.internalPrivateClass.EmpIcon = function () {
    var publicInterface = {
        createIcon: function (oldIcon) {
            var oThis = this;
            var img = this._createIcon('icon');

            this.options.oIconImag = img;

            img.onload = function () {
                var i = img;
                this.style.width = i.width + 'px';
                this.style.height = i.height + 'px';
                oThis._applyAnchorRef();
                this.style.display = '';
            };

            img.onerror = function () {
                var oDefaultIcon = emp.utilities.icon.getDefaultIcon(oThis.options.basePath);

                oThis.options.iconSize = new L.Point(oDefaultIcon.size.width, oDefaultIcon.size.height);
                oThis.options.iconAnchorRef = {x: oDefaultIcon.offset.x, y: oDefaultIcon.offset.y};
                oThis.options.iconAnchorType = {x: oDefaultIcon.offset.xUnits, y: oDefaultIcon.offset.yUnits};

                img.src = oDefaultIcon.iconUrl;
            };
            return img;
        },
        _applyAnchorRef: function () {
            var oIconUtils = emp.utilities.icon;
            var oImg = this.options.oIconImag;

            if (this.options.iconAnchor) {
                var oOffset = this.options.iconAnchor;
                var oUnits = this.options.iconAnchorType;
                var sXUnits = 'pixels';
                var sYUnits = 'pixels';

                if (oUnits && (typeof (oUnits.x) === 'string')) {
                    sXUnits = oUnits.x;
                }

                if (oUnits && (typeof (oUnits.y) === 'string')) {
                    sYUnits = oUnits.y;
                }

                oImg.style.marginLeft = oIconUtils.calculateXOffset(oImg.width, oOffset.x, sXUnits) + 'px';
                oImg.style.marginTop = oIconUtils.calculateYOffset(oImg.height, oOffset.y, sYUnits, oIconUtils.referencePoint.TOP_LEFT) + 'px';
            } else {
                var oDefaultIcon = emp.utilities.icon.getDefaultIcon(this.options.basePath);
                var iXOffset = oIconUtils.calculateXOffset(oDefaultIcon.offset.width, oDefaultIcon.offset.x.toString(), oDefaultIcon.offset.xUnits);
                var iYOffset = oIconUtils.calculateYOffset(oDefaultIcon.offset.height, oDefaultIcon.offset.y.toString(), oDefaultIcon.offset.yUnits, oIconUtils.referencePoint.TOP_LEFT);

                oImg.style.marginLeft = iXOffset + 'px';
                oImg.style.marginTop = iYOffset + 'px';
            }
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.EmpIcon = L.Icon.extend(leafLet.internalPrivateClass.EmpIcon());


L.Icon.Default = L.Icon.Default.extend({
    options: {
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    },
    // Overrides
    // Because this function is calling a specific utility class to get the icon defaults,
    // it should remain intact.
    _getIconUrl: function (name) {
        if (name === 'shadow') {
            return undefined;
        }
        var oDefaultIcon = emp.utilities.icon.getDefaultIcon(this.options.basePath);
        var iXOffset = emp.utilities.icon.calculateXOffset(oDefaultIcon.offset.width, oDefaultIcon.offset.x, oDefaultIcon.offset.xUnits);
        var iYOffset = emp.utilities.icon.calculateYOffset(oDefaultIcon.offset.height, oDefaultIcon.offset.y, oDefaultIcon.offset.yUnits, emp.utilities.icon.referencePoint.BOTTOM_LEFT);

        this.options.iconSize = new L.Point(oDefaultIcon.size.width, oDefaultIcon.size.height);
        this.options.iconAnchor = new L.Point(iXOffset, iYOffset);

        return oDefaultIcon.iconUrl;
    }
});

L.Marker = L.Marker.extend({
    options: {
        icon: new L.Icon.Default()
    },
    // Overrides.
    // Leaflet version 1.0.3 seems to have implemented its eventing in a more centrally structured
    // manner. L.Map and L.Canvas both assign specific events to listen for including
    // 'mousedown mouseup'. During 'mousedown mouseup' events on L.Canvas a calculation is occuring
    // in which the layer underneath the point is extracted allowing that clicked layer to be sent
    // to the appropriate handler. Because this change already includes 'mouseup' this overide shouldn't
    // be needed.

    // _initInteraction: function () {
    //     if (!this.options.clickable) {
    //         return;
    //     }
    //
    //     // TODO refactor into something shared with Map/Path/etc. to DRY it up
    //
    //     var icon = this._icon,
    //             events = ['dblclick', 'mouseup', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];
    //
    //     L.DomUtil.addClass(icon, 'leaflet-clickable');
    //     L.DomEvent.on(icon, 'click', this._onMouseClick, this);
    //     L.DomEvent.on(icon, 'keypress', this._onKeyPress, this);
    //
    //     for (var i = 0; i < events.length; i++) {
    //         L.DomEvent.on(icon, events[i], this._fireMouseEvent, this);
    //     }
    //
    //     if (L.Handler.MarkerDrag) {
    //         this.dragging = new L.Handler.MarkerDrag(this);
    //
    //         if (this.options.draggable) {
    //             this.dragging.enable();
    //         }
    //     }
    // },

    // Overrides in Leaflet 0.7.3. Adds the additional mouseup in conditional.
    // Function is not present in 1.0.3 most likely because of the centralized eventing structure
    // put in place.

    // _fireMouseEvent: function (e) {
    //
    //     this.fire(e.type, {
    //         originalEvent: e,
    //         latlng: this._latlng
    //     });
    //
    //     // TODO proper custom event propagation
    //     // this line will always be called if marker is in a FeatureGroup
    //     if (e.type === 'contextmenu' && this.hasEventListeners(e.type)) {
    //         L.DomEvent.preventDefault(e);
    //     }
    //     if ((e.type !== 'mousedown') && (e.type !== 'mouseup')) {
    //         L.DomEvent.stopPropagation(e);
    //     } else {
    //         L.DomEvent.preventDefault(e);
    //     }
    // },

    // Overrides. Leaflet 0.7.3 and 1.0.3 contain identical functions, no change. However, this
    // override contains EMP specific calls.
    _setPos: function (pos) {
        var oImg;
        var sTemp;

        L.DomUtil.setPosition(this._icon, pos);

        if (this._shadow) {
            L.DomUtil.setPosition(this._shadow, pos);
        }

        this._zIndex = pos.y + this.options.zIndexOffset;
        this._resetZIndex();

        oImg = this._icon;
        sTemp = oImg.style[L.DomUtil.TRANSFORM];

        sTemp = emp.helpers.isEmptyString(oImg.style[L.DomUtil.TRANSFORM]) ? '' : oImg.style[L.DomUtil.TRANSFORM];

        if (!emp.helpers.isEmptyString(this.options.icon.options.heading)) {
            sTemp += ' rotate(' + this.options.icon.options.heading + 'deg)';
        }
        if (!emp.helpers.isEmptyString(this.options.icon.options.scale)) {
            sTemp += ' scale(' + this.options.icon.options.scale + ',' + this.options.icon.options.scale + ')';
        }

        oImg.style[L.DomUtil.TRANSFORM] = sTemp;
    },
    // Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
    empSelect: function () {
        var labelStyle = this.options.oFeature.getEngineInstanceInterface().selectLabelStyle;

        if (this.options.oFeature &&
                (this.options.oFeature.getFormat() === emp.typeLibrary.featureFormatType.MILSTD) &&
                this.options.oFeature.isMultiPointTG()) {
            return;
        }

        if (this.options.icon instanceof L.DivIcon) {
            if (labelStyle) {
                emp.$(this._icon).find('p').css('color', 'rgb(' + labelStyle.color.red + ', ' + labelStyle.color.green + ', ' + labelStyle.color.blue + ')');
            }
        } else if (this.options.icon instanceof L.Icon) {
            emp.$(this._icon).addClass('icon-selected');
        }
    },
    // Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
    empDeselect: function () {
        var labelStyle = this.options.oFeature.getLabelStyle();

        if (this.options.oFeature &&
                (this.options.oFeature.getFormat() === emp.typeLibrary.featureFormatType.MILSTD) &&
                this.options.oFeature.isMultiPointTG()) {
            return;
        }

        if (this.options.icon instanceof L.DivIcon) {
            if (labelStyle) {
                emp.$(this._icon).find('p').css('color', 'rgb(' + labelStyle.color.red + ', ' + labelStyle.color.green + ', ' + labelStyle.color.blue + ')');
            }
        } else if (this.options.icon instanceof L.Icon) {
            emp.$(this._icon).removeClass('icon-selected');
        }
    }
});

// L.Path = L.Path.extend({
    // Overrides fcuntion present in 0.7.3. Function is not present in 1.0.3 because of the
    // centralized eventing structure which also accounts for 'mouseup' eventing.
    // _initEvents: function () {
    //     if (this.options.clickable) {
    //         if (L.Browser.svg || !L.Browser.vml) {
    //             L.DomUtil.addClass(this._path, 'leaflet-clickable');
    //         }
    //
    //         L.DomEvent.on(this._container, 'click', this._onMouseClick, this);
    //
    //         var events = ['dblclick', 'mouseup', 'mousedown', 'mouseover',
    //             'mouseout', 'mousemove', 'contextmenu'];
    //         for (var i = 0; i < events.length; i++) {
    //             L.DomEvent.on(this._container, events[i], this._fireMouseEvent, this);
    //         }
    //     }
    // },

    // Overrides in Leaflet 0.7.3. This is part of the SVG class in 1.0.3. All paths and maybe other
    // vector graphics use the SVG class and it includes all attributes.
//     _updateStyle: function () {
//         if (this.options.stroke) {
//             this._path.setAttribute('stroke', this.options.color);
//             this._path.setAttribute('stroke-opacity', this.options.opacity);
//             this._path.setAttribute('stroke-width', this.options.weight + 2);
//             if (this.options.dashArray) {
//                 this._path.setAttribute('stroke-dasharray', this.options.dashArray);
//             } else {
//                 this._path.removeAttribute('stroke-dasharray');
//             }
//             if (this.options.lineCap) {
//                 this._path.setAttribute('stroke-linecap', this.options.lineCap);
//             }
//             if (this.options.lineJoin) {
//                 this._path.setAttribute('stroke-linejoin', this.options.lineJoin);
//             }
//         } else {
//             this._path.setAttribute('stroke', 'none');
//         }
//         if (this.options.fill) {
//             this._path.setAttribute('fill', this.options.fillColor || this.options.color);
//             this._path.setAttribute('fill-opacity', this.options.fillOpacity);
//         } else {
//             this._path.setAttribute('fill', 'none');
//         }
//     }
// });

L.Polyline = L.Polyline.extend({
    // Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
    empSelect: function () {
        var oSelectAttributes = this.options.oFeature.options.instanceInterface.selectAttributes;
        this.options.tempColor = this.options.color;
        this.options.tempWeight = this.options.weight;

        //this.options.color = '#' + oSelectAttributes.color;
        //this.options.weight = oSelectAttributes.width;
        this.setStyle({
            color: '#' + oSelectAttributes.color,
            weight: oSelectAttributes.width
        });
    },
    // Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
    empDeselect: function () {
        var oStyle = {};

        if (this.options.hasOwnProperty('tempColor') && (!emp.util.isEmptyString(this.options.tempColor))) {
            oStyle.color = this.options.tempColor;
            if (oStyle.color === null) {
                oStyle.stroke = false;
            }
            delete this.options['tempColor'];
        }

        if (this.options.hasOwnProperty('tempWeight') && (!isNaN(this.options.tempWeight))) {
            oStyle.weight = this.options.tempWeight;
            delete this.options['tempWeight'];
        }

        if (oStyle.hasOwnProperty('color') || oStyle.hasOwnProperty('weight')) {
            this.setStyle(oStyle);
        }
    }
});

L.Polygon = L.Polygon.extend({
    // Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
    empSelect: function () {
        var oSelectAttributes = this.options.oFeature.options.instanceInterface.selectAttributes;
        this.options.tempColor = this.options.color;
        this.options.tempWeight = this.options.weight;

        //this.options.color = '#' + oSelectAttributes.color;
        //this.options.weight = oSelectAttributes.width;
        this.setStyle({
            color: '#' + oSelectAttributes.color,
            weight: oSelectAttributes.width
        });
    },
    // Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
    empDeselect: function () {
        //this.options.color = this.options.tempColor;
        //this.options.weight = this.options.tempWeight;
        this.setStyle({
            color: this.options.tempColor,
            weight: this.options.tempWeight
        });
    }
});

L.Circle = L.Circle.extend({
    // Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
    empSelect: function () {
        var oSelectAttributes = this.options.oFeature.options.instanceInterface.selectAttributes;
        this.options.tempColor = this.options.color;
        this.options.tempWeight = this.options.weight;

        //this.options.color = '#' + oSelectAttributes.color;
        //this.options.weight = oSelectAttributes.width;
        this.setStyle({
            color: '#' + oSelectAttributes.color,
            weight: oSelectAttributes.width
        });
    },
    // Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
    empDeselect: function () {
        //this.options.color = this.options.tempColor;
        //this.options.weight = this.options.tempWeight;
        this.setStyle({
            color: this.options.tempColor,
            weight: this.options.tempWeight
        });
    }
});

// Leaflet 1.0.3 provides support for this class's purpose in L.Polyline because L.MultiPolyline
// no longer exists. An array of LatLng points can be sent in to L.Polyline.
// L.MultiPolyline = L.FeatureGroup.extend({
//     // Overrides. Leaflet 0.7.3 contain identical function, no change.
//     initialize: function (latlngs, options) {
//         this._layers = {};
//         this._options = options;
//         this.setLatLngs(latlngs);
//     },
//     // Overrides. Adds 'L.Polyline' in while statement.
//     setLatLngs: function (latlngs) {
//         var i = 0,
//                 len = latlngs.length;
//
//         this.eachLayer(function (layer) {
//             if (i < len) {
//                 layer.setLatLngs(latlngs[i++]);
//             } else {
//                 this.removeLayer(layer);
//             }
//         }, this);
//
//         while (i < len) {
//             this.addLayer(new L.Polyline(latlngs[i++], this._options));
//         }
//
//         return this;
//     },
//     // Overrides. Leaflet 0.7.3 contain identical function, no change.
//     getLatLngs: function () {
//         var latlngs = [];
//
//         this.eachLayer(function (layer) {
//             latlngs.push(layer.getLatLngs());
//         });
//
//         return latlngs;
//     }
// });

// Leaflet 1.0.3 may provide support for this class's purpose in L.Polygon because L.MultiPolygon
// no longer exists. An array of LatLng points can be sent in to L.Polygon.
// L.MultiPolygon = L.FeatureGroup.extend({
//     // Overrides. Leaflet 0.7.3 contain identical function, no change.
//     initialize: function (latlngs, options) {
//         this._layers = {};
//         this._options = options;
//         this.setLatLngs(latlngs);
//     },
//     // Overrides. Adds 'L.Polygon' in while statement.
//     setLatLngs: function (latlngs) {
//         var i = 0,
//                 len = latlngs.length;
//
//         this.eachLayer(function (layer) {
//             if (i < len) {
//                 layer.setLatLngs(latlngs[i++]);
//             } else {
//                 this.removeLayer(layer);
//             }
//         }, this);
//
//         while (i < len) {
//             this.addLayer(new L.Polygon(latlngs[i++], this._options));
//         }
//
//         return this;
//     },
//     // Overrides. Leaflet 0.7.3 contain identical function, no change.
//     getLatLngs: function () {
//         var latlngs = [];
//
//         this.eachLayer(function (layer) {
//             latlngs.push(layer.getLatLngs());
//         });
//
//         return latlngs;
//     }
// });

// Leaflet 1.0.3 may provide support for this class's purpose in L.Polygon because L.MultiPolyline
// no longer exists.
// L.multiPolyline = function (latlngs, options) {
//     return new L.MultiPolyline(latlngs, options);
// };

// Leaflet 1.0.3 may provide support for this class's purpose in L.Polygon because L.MultiPolygon
// no longer exists.
// L.multiPolygon = function (latlngs, options) {
//     return new L.MultiPolygon(latlngs, options);
// };


L.TileLayer = L.TileLayer.extend({
    // Overrides Leaflet 0.7.3. This needs to stay intact for proxy.
    getTileUrl: function (tilePoint) {
        var sURL = L.Util.template(this._url, L.extend({
            s: this._getSubdomain(tilePoint),
            z: tilePoint.z,
            x: tilePoint.x,
            y: tilePoint.y
        }, this.options));

        if (this.options.isDefaultMap) {
            if (this.options.instanceInterface.useProxyForDefault) {
                sURL = emp.util.config.getProxyUrl() + "?" + "mime=image/*&url=" + encodeURIComponent(sURL);
            }
        } else {
            if (this.options.useProxy) {
                sURL = emp.util.config.getProxyUrl() + "?" + "mime=image/*&url=" + encodeURIComponent(sURL);
            }
        }

        return sURL;
    }
});

L.TileLayer.WMS = L.TileLayer.WMS.extend({
    // Overrides Leaflet 0.7.3. Function changed a bit. It was copied from Leaflet 1.0.3 and the
    // proxy section was added. Need to make sure parameter is same type.
    getTileUrl: function (coords) { // (Point, Number) -> String

      var sURL;
      var tileBounds = this._tileCoordsToBounds(coords),
        nw = this._crs.project(tileBounds.getNorthWest()),
        se = this._crs.project(tileBounds.getSouthEast()),
        bbox = (this._wmsVersion >= 1.3 && this._crs === L.CRS.EPSG4326 ?
          [se.y, nw.x, nw.y, se.x] :
          [nw.x, se.y, se.x, nw.y]).join(','),
        url = L.TileLayer.prototype.getTileUrl.call(this, coords);

      sURL = url + L.Util.getParamString(this.wmsParams, url, this.options.uppercase) +
            (this.options.uppercase ? '&BBOX=' : '&bbox=') + bbox;

      if (this.options.useProxy) {
        sURL = emp.util.config.getProxyUrl() + "?" + "mime=image/*&url=" + encodeURIComponent(sURL);
      }

      return sURL;
    }
});

L.Control.Zoom = L.Control.Zoom.extend({
    // Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
    getCoreId: function () {
        return this.options.coreId;
    },
    // Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
    getObjectType: function () {
        return this.options.objectType;
    }
});

L.Control.Scale = L.Control.Scale.extend({
    // Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
    getCoreId: function () {
        return this.options.coreId;
    },
    // Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
    getObjectType: function () {
        return this.options.objectType;
    }
});

L.TileLayer = L.TileLayer.extend({
    // Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
    getCoreId: function () {
        return this.options.coreId;
    },
    // Utility function. Doesn't override in Leaflet 0.7.3 or 1.0.3.
    getObjectType: function () {
        return this.options.objectType;
    }
});
