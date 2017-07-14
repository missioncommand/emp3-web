
/* global leafLet, L, emp */

leafLet.utils = leafLet.utils || {};

leafLet.utils.geoJson = (function () {

    var privateInterface = {
    };

    var publicInterface = {
        convertCoordinatesToString: function (oGeoJson) {
            var sStr = "";
            if (!oGeoJson.hasOwnProperty('type')) {
                throw new Error("GeoJSON object with no type property.");
            }

            switch (oGeoJson.type.toLowerCase()) {
                case 'point':
                    sStr = oGeoJson.coordinates[0] + "," + oGeoJson.coordinates[1];

                    if (oGeoJson.coordinates.length === 3) {
                        sStr += "," + oGeoJson.coordinates[2];
                    }
                    break;
                case 'linestring':
                    for (var iIndex = 0; iIndex < oGeoJson.coordinates.length; iIndex++) {
                        if (sStr.length > 0) {
                            sStr += " ";
                        }
                        sStr += oGeoJson.coordinates[iIndex][0] + "," + oGeoJson.coordinates[iIndex][1];

                        if (oGeoJson.coordinates[iIndex].length === 3) {
                            sStr += "," + oGeoJson.coordinates[iIndex][2];
                        }
                    }
                    break;
                case 'polygon':
                    // we get the coordinates of the outter polygon.
                    for (var iIndex = 0; iIndex < oGeoJson.coordinates[0].length; iIndex++) {
                        if (sStr.length > 0) {
                            sStr += " ";
                        }
                        sStr += oGeoJson.coordinates[0][iIndex][0] + "," + oGeoJson.coordinates[0][iIndex][1];

                        if (oGeoJson.coordinates[0][iIndex].length === 3) {
                            sStr += "," + oGeoJson.coordinates[0][iIndex][2];
                        }
                    }
                    break;
                default:
                    throw new Error("Invalid type for coordinate parsing.");
            }

            return sStr;
        },
        convertCoordinateToLatLng: function (oCoord) {
            var oCoordinates;

            if (oCoord.length === 3) {
                oCoordinates = new L.LatLng(oCoord[1], oCoord[0], oCoord[2]);
            } else {
                oCoordinates = new L.LatLng(oCoord[1], oCoord[0]);
            }

            return oCoordinates;
        },
        convertCoordinatesToLatLng: function (oGeoJson) {
            var oCoordinates = [];
            var oCoord;

            if (!oGeoJson.hasOwnProperty('type')) {
                throw new Error("GeoJSON object with no type property.");
            }

            switch (oGeoJson.type.toLowerCase()) {
                case 'point':
                    if (oGeoJson.coordinates.length > 0) {
                        oCoordinates.push(publicInterface.convertCoordinateToLatLng(oGeoJson.coordinates));
                    }
                    break;
                case 'linestring':
                    for (var iIndex = 0; iIndex < oGeoJson.coordinates.length; iIndex++) {
                        oCoord = publicInterface.convertCoordinateToLatLng(oGeoJson.coordinates[iIndex]);
                        oCoordinates.push(oCoord);
                    }
                    break;
                case 'polygon':
                    // we get the coordinates of the outter polygon.
                    for (var iIndex = 0; iIndex < oGeoJson.coordinates[0].length; iIndex++) {
                        oCoord = publicInterface.convertCoordinateToLatLng(oGeoJson.coordinates[0][iIndex]);
                        oCoordinates.push(oCoord);
                    }
                    break;
                case 'feature':
                    switch (oGeoJson.geometry.type.toLowerCase()) {
                        case 'point':
                            if (oGeoJson.geometry.coordinates.length > 0) {
                                oCoordinates.push(publicInterface.convertCoordinateToLatLng(oGeoJson.geometry.coordinates));
                            }
                            break;
                        case 'linestring':
                            for (var iIndex = 0; iIndex < oGeoJson.geometry.coordinates.length; iIndex++) {
                                oCoord = publicInterface.convertCoordinateToLatLng(oGeoJson.geometry.coordinates[iIndex]);
                                oCoordinates.push(oCoord);
                            }
                            break;
                        case 'polygon':
                            // we get the coordinates of the outter polygon.
                            for (var iIndex = 0; iIndex < oGeoJson.geometry.coordinates[0].length; iIndex++) {
                                oCoord = publicInterface.convertCoordinateToLatLng(oGeoJson.geometry.coordinates[0][iIndex]);
                                oCoordinates.push(oCoord);
                            }
                            break;
                        default:
                            throw new Error("Invalid type for coordinate parsing.");
                    }
                    break;
                default:
                    throw new Error("Invalid type for coordinate parsing.");
            }

            return oCoordinates;
        },
        convertLatLngToGeoJson: function (oLatLng) {
            var oGeoJsonCoord = [];

            oGeoJsonCoord.push(oLatLng.lng);
            oGeoJsonCoord.push(oLatLng.lat);

            if (!isNaN(oLatLng.alt)) {
                oGeoJsonCoord.push(oLatLng.alt);
            }

            return oGeoJsonCoord;
        },
        convertLatLngListToGeoJson: function (oGeoJson, oLatLngList) {
            switch (oGeoJson.type.toLowerCase()) {
                case 'point':
                    oGeoJson.coordinates = publicInterface.convertLatLngToGeoJson(oLatLngList[0]);
                    break;
                case 'linestring':
                    oGeoJson.coordinates = [];

                    for (var iIndex = 0; iIndex < oLatLngList.length; iIndex++) {
                        oGeoJson.coordinates.push(publicInterface.convertLatLngToGeoJson(oLatLngList[iIndex]));
                    }
                    break;
                case 'polygon':
                    oGeoJson.coordinates = [[]];

                    for (var iIndex = 0; iIndex < oLatLngList.length; iIndex++) {
                        oGeoJson.coordinates[0].push(publicInterface.convertLatLngToGeoJson(oLatLngList[iIndex]));
                    }
                    break;
                case 'feature':
                    publicInterface.convertLatLngListToGeoJson(oGeoJson.geometry, oLatLngList);
                    break;
            }
        },
        mergeGeoJSONProperties: function (instanceInterface, oFeatureProperties, oGeoJSONProperties) {
            var oDefaultIcon = emp.utilities.icon.getDefaultIcon();
            var oProperties = {};
            var iXOffset = oDefaultIcon.offset.x;
            var iYOffset = oDefaultIcon.offset.y;
            var sXUnits = oDefaultIcon.offset.xUnits;
            var sYUnits = oDefaultIcon.offset.yUnits;
            var sDefaultIconUrl = oDefaultIcon.iconUrl;
            var sURL = (instanceInterface.bUseProxy ?
                    instanceInterface.getProxyURL() + "?" + "mime=image/*&url=" + escape(sDefaultIconUrl) : sDefaultIconUrl);

            //fix offset for the case of default iconUrl
            if ( oFeatureProperties.iconUrl && oFeatureProperties.iconUrl.indexOf(emp.utilities.getDefaultIcon().iconUrl) > -1  )
            {
                iXOffset = 12.5;
                iYOffset = -41;
                sXUnits = "pixels";
                sYUnits = "pixels";
            }


            if (oGeoJSONProperties) {
                if (oGeoJSONProperties.hasOwnProperty('id')) {
                    oProperties.sSubItemID = oGeoJSONProperties.id;
                }
                if (oGeoJSONProperties.hasOwnProperty('lineColor')) {
                    oProperties.color = '#' + oGeoJSONProperties.lineColor.substr(2);
                    var dOpacity = parseInt("0x" + oGeoJSONProperties.lineColor.substr(0, 2)) / 255.0;
                    oProperties.opacity = dOpacity;
                }
                if (oGeoJSONProperties.hasOwnProperty('fillColor')) {
                    oProperties.fillColor = '#' + oGeoJSONProperties.fillColor.substr(2);
                    var dOpacity = parseInt("0x" + oGeoJSONProperties.fillColor.substr(0, 2)) / 255.0;
                    oProperties.fillOpacity = dOpacity;
                }
                if (oGeoJSONProperties.hasOwnProperty('lineWidth')) {
                    oProperties.weigh = parseInt(oGeoJSONProperties.lineWidth);
                }
                if (oGeoJSONProperties.hasOwnProperty('iconUrl')) {
                    sURL = (instanceInterface.bUseProxy ?
                            instanceInterface.getProxyURL() + "?" + "mime=image/*&url=" + escape(oGeoJSONProperties.iconUrl) :
                            oGeoJSONProperties.iconUrl);
                }

                if (oGeoJSONProperties.hasOwnProperty('iconXOffset')) {
                    iXOffset = oGeoJSONProperties.iconXOffset;
                }

                if (oGeoJSONProperties.hasOwnProperty('iconYOffset')) {
                    iYOffset = oGeoJSONProperties.iconYOffset;
                }

                if (oGeoJSONProperties.hasOwnProperty('xUnits')) {
                    sXUnits = oGeoJSONProperties.xUnits;
                }

                if (oGeoJSONProperties.hasOwnProperty('yUnits')) {
                    sYUnits = oGeoJSONProperties.yUnits;
                }
            }

            if (oFeatureProperties) {
                if (oFeatureProperties.hasOwnProperty('lineColor')) {
                    oProperties.color = '#' + oFeatureProperties.lineColor.substr(2);
                    var dOpacity = parseInt("0x" + oFeatureProperties.lineColor.substr(0, 2)) / 255.0;
                    oProperties.opacity = dOpacity;
                }
                if (oFeatureProperties.hasOwnProperty('fillColor')) {
                    oProperties.fillColor = '#' + oFeatureProperties.fillColor.substr(2);
                    var dOpacity = parseInt("0x" + oFeatureProperties.fillColor.substr(0, 2)) / 255.0;
                    oProperties.fillOpacity = dOpacity;
                }
                if (oFeatureProperties.hasOwnProperty('lineWidth') && oFeatureProperties.lineWidth & oFeatureProperties.lineWidth !== null ) {
                    oProperties.weight = parseInt(oFeatureProperties.lineWidth);
                }
                else{
                    oProperties.weight = 3 ;
                }
                if (oFeatureProperties.hasOwnProperty('iconUrl')) {
                    sURL = (instanceInterface.bUseProxy ?
                            instanceInterface.getProxyURL() + "?" + "mime=image/*&url=" + escape(oFeatureProperties.iconUrl) :
                            oFeatureProperties.iconUrl);
                }

                if (oFeatureProperties.hasOwnProperty('iconXOffset')) {
                    iXOffset = oFeatureProperties.iconXOffset;
                }

                if (oFeatureProperties.hasOwnProperty('iconYOffset')) {
                    iYOffset = oFeatureProperties.iconYOffset;
                }

                if (oFeatureProperties.hasOwnProperty('xUnits')) {
                    sXUnits = oFeatureProperties.xUnits;
                }

                if (oFeatureProperties.hasOwnProperty('yUnits')) {
                    sYUnits = oFeatureProperties.yUnits;
                }
            }

            oProperties.iconOptions = {
                iconUrl: sURL,
                iconAnchor: new L.Point(iXOffset, iYOffset),
                iconAnchorType: {x: sXUnits, y: sYUnits}
            };

            return oProperties;
        },
        getGeometryType: function (oGeoJson) {
            var sType;

            switch (oGeoJson.type.toLowerCase()) {
                case 'point':
                    sType = 'Point';
                    break;
                case 'linestring':
                    sType = 'LineString';
                    break;
                case 'polygon':
                    sType = 'Polygon';
                    break;
                case 'feature':
                    sType = publicInterface.getGeometryType(oGeoJson.geometry);
                    break;
                default:
                    sType = oGeoJson.type;
                    break;
            }

            return sType;
        },
        isAOI: function (oItem) {
            var bRet = false;
            var oGeoJson = oItem.data;

            if (oGeoJson.hasOwnProperty('type') &&
                    (oGeoJson.type.toLowerCase() === 'feature')) {
                if (oGeoJson.hasOwnProperty('properties') &&
                        oGeoJson.properties.hasOwnProperty('aoi')) {
                    bRet = true;
                }
            }
            return bRet;
        }
    };

    return publicInterface;
}());
