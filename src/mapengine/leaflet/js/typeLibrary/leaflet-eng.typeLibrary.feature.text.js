/* global L, leafLet, emp, cmapi */

leafLet.internalPrivateClass.GeoTextFeature = function () {
    var publicInterface = {
        initialize: function (args) {
            var options = {
            };
            L.Util.setOptions(this, options);
            leafLet.typeLibrary.Feature.prototype.initialize.call(this, args);
        },
        getPopupText: function () {
            var sPopupText = "";

            if (this.options.leafletObject instanceof L.Marker) {
                var oLatLng = this.options.leafletObject.getLatLng();
                if (oLatLng !== undefined) {
                    oLatLng = oLatLng.wrap();
                    sPopupText +=
                            "<center><b>Lat</b>:&nbsp;" + oLatLng.lat.toFixed(5) +
                            "<br/><b>Lon</b>:&nbsp;" + oLatLng.lng.toFixed(5) +
                            ((oLatLng.alt) ? "<br/><b>Alt</b>:&nbsp;" + oLatLng.alt + this._getAltUnitsAndModeText() : "") + "</center><br/>";
                }
            }

            sPopupText += this._getPopupDescription();

            return sPopupText;
        },
        _createFeature: function (args) {
            var oLeafletFeature = undefined;
            var oProperties;
            var sLabelText = ((args.name)? args.name: " ");
            var iXOffset = 0;
            var iYOffset = 0;
            var halfWidth;
            var myIcon;
            var oLatLon = leafLet.utils.geoJson.convertCoordinatesToLatLng(args.data)[0];
            var iTextPixelDim;
            var htmlFontStyle = 'normal';
            var htmlFontWeight = 'normal';
            var sCSSTextShadow = '';
            var azimuth = ((args.properties && args.properties.azimuth) ? args.properties.azimuth: 0);
            var labelStyle = ((args.properties && args.properties.labelStyle) ? args.properties.labelStyle: this.getEngineInstanceInterface().defaultLabelStyle);

            if (oLatLon === undefined) {
                return undefined;
            }

            if (this.isSelected()) {
                labelStyle = this.getEngineInstanceInterface().selectLabelStyle;
            }

            if (labelStyle.typeface) {
                switch (labelStyle.typeface.toUpperCase()) {
                    case cmapi.enums.typeface.REGULAR:
                        break;
                    case cmapi.enums.typeface.BOLD:
                        htmlFontWeight = 'bold';
                        break;
                    case cmapi.enums.typeface.ITALIC:
                        htmlFontStyle = 'italic';
                        ret = 'italic';
                        break;
                    case cmapi.enums.typeface.BOLDITALIC:
                        htmlFontStyle = 'italic';
                        htmlFontWeight = 'bold';
                        break;
                }
            }

            oProperties = leafLet.utils.geoJson.mergeGeoJSONProperties(this.getEngineInstanceInterface(), args.properties);
            iTextPixelDim = emp.helpers.getStringPixelDimensions(sLabelText,
                labelStyle.family,
                labelStyle.size + 'pt',
                htmlFontWeight);

            oProperties.title = args.name;

            iYOffset = Math.floor(iTextPixelDim.height / 2);

            if (labelStyle.justification) {
                switch (labelStyle.justification.toUpperCase()) {
                    case cmapi.enums.justification.CENTER:
                        iXOffset = Math.floor(iTextPixelDim.width / 2);
                        break;
                    case cmapi.enums.justification.LEFT:
                        iXOffset = 0;
                        if (azimuth) {
                            // We need to move the offset because the rotation always rotates at the center.
                            halfWidth = Math.floor(iTextPixelDim.width / 2);
                            iXOffset += Math.floor(halfWidth * (1 - Math.cos(azimuth.toRad())));
                            iYOffset -= Math.floor(halfWidth * Math.sin(azimuth.toRad()));
                        }
                        break;
                    case cmapi.enums.justification.RIGHT:
                        iXOffset = iTextPixelDim.width;
                        if (azimuth) {
                            // We need to move the offset because the rotation always rotates at the center.
                            halfWidth = Math.floor(iTextPixelDim.width / 2);
                            iXOffset -= Math.floor(halfWidth * (1 - Math.cos(azimuth.toRad())));
                            iYOffset += Math.floor(halfWidth * Math.sin(azimuth.toRad()));
                        }
                        break;
                }
            }

            if (labelStyle.outlineColor) {
                sCSSTextShadow = 'text-shadow: 4px 4px 2px rgb(' + labelStyle.outlineColor.red + ', ' + labelStyle.outlineColor.green + ', ' + labelStyle.outlineColor.blue + '); ';
            }

            myIcon = new L.DivIcon({
                className: '',
                html: "<p " +
                        "style='font-family:" + labelStyle.family + "; " +
                        "font-size:" + labelStyle.size + "pt; " +
                        "line-height: " + iTextPixelDim.height + "px; " +
                        "white-space: nowrap; " +
                        "font-style: " + htmlFontStyle + '; ' +
                        "font-weight:" + htmlFontWeight + "; " +
                        "color: rgb(" + labelStyle.color.red + ", " + labelStyle.color.green + ", " + labelStyle.color.blue + "); " +
                        sCSSTextShadow +
                        "background: transparent; " +
                        "border: none; " +
                        "-webkit-transform: rotate(" + azimuth + "deg); " +
                        "-moz-transform: rotate(" + azimuth + "deg); " +
                        "-o-transform: rotate(" + azimuth + "deg); " +
                        "transform: rotate(" + azimuth + "deg);'>" +
                        sLabelText + "</p>",
                iconSize: new L.Point(iTextPixelDim.width, iTextPixelDim.height),
                iconAnchor: new L.Point(iXOffset, iYOffset)
            });
            oLeafletFeature =  new L.Marker(oLatLon, {
                icon: myIcon,
                oFeature: this
            });

            return oLeafletFeature;
        },
        _updateFeature: function (oArgs) {
            return this._createFeature(oArgs);
        },
        render: function () {
            this.updateFeature(this.options);
        },
        setFeatureStyleProperties: function (sType, oProperties) {
        }
    };
    return publicInterface;
};

leafLet.typeLibrary.GeoTextFeature = leafLet.typeLibrary.Feature.extend(leafLet.internalPrivateClass.GeoTextFeature());
