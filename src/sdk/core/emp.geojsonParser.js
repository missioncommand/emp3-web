/*globals emp, geEngine*/

/**
 * Geo Json Parser
 * @private
 * @return {Object}
 * @namespace geojsonParser
 */
emp.geojsonParser = (function() {

    function adjustColor(color) {
        var alpha = "CC",
            red = "",
            green = "",
            blue = "",
            adjustedColor = "CC000000";
        if (color !== undefined && color !== null) {
            if (color.length === 8) {
                alpha = color.substr(0, 2);
                red = color.substr(2, 2);
                green = color.substr(4, 2);
                blue = color.substr(6, 2);
                adjustedColor = alpha + blue + green + red;
            } else if (color.length === 6) {
                red = color.substr(0, 2);
                green = color.substr(2, 2);
                blue = color.substr(4, 2);
                adjustedColor = alpha + blue + green + red;
            }
        }
        return adjustedColor;

    }

    /** 
    Gets the geometry KML object from a geojson point coordinate.

    @param {array} coordinates - the point coordinates of a geojson object.
    */

    function getPointKml(coordinates) {
        var lat,
            lon,
            altitude,
            kml,
            result;

        // Check to make sure there is a valid number of coordinate sub components
        if (coordinates.length >= 2) {
            // Get the lat/lon values
            lat = coordinates[1];
            lon = coordinates[0];

            // Check to see if the coordinate has an altitude.
            if (coordinates.length === 3) {
                altitude = coordinates[2];
            }

            // Create the kml for this geometry.
            kml = '<Point>' +
                '<coordinates>' + lon + ',' + lat + (altitude !== undefined ? ',' + altitude : '') + '</coordinates>' +
                '</Point>';

            // return the kml in an object.
            result = {
                success: true,
                message: "",
                data: kml
            };
        } else {
            result = {
                success: false,
                message: "geojson does not have a valid coordinate."
            };
        }

        return result;
    }

    /** 
    Create the KML for a geojson point.
    */

    function addGeoJsonPoint(geojson, name, id, overlayId, modifiers, zoom) {
        var coordinates,
            iconUrl,
            xOffset,
            yOffset,
            xUnits,
            yUnits,
            fillColor,
            kml,
            obj,
            result,
            description,
            style,
            iconObj;

        // set defaults in case there aren't any parameters        
        modifiers = modifiers || {};

        // retrieve the style elements from the geojson if availble.
        style = emp.geojsonParser.getStyle(geojson);

        if (modifiers.iconUrl) {
            modifiers.iconUrl = modifiers.iconUrl.replace('&', '&amp;');
        }

        iconUrl = modifiers.iconUrl || style.iconUrl;

        // If no icon has been specified try to pull the default icon
        // from the map environment.
        if (!iconUrl) {

            iconObj = emp.utilities.getDefaultIcon();

            iconUrl = iconObj.iconUrl;
            xOffset = iconObj.offset.x;
            yOffset = 1 - iconObj.offset.y;
            xUnits = iconObj.offset.xUnits;
            yUnits = iconObj.offset.yUnits;
        } else {
            xOffset = modifiers.iconXOffset || 0;
            yOffset = modifiers.iconYOffset || 0;
            xUnits = modifiers.xUnits || "pixels";
            yUnits = modifiers.yUnits || "pixels";
        }

        fillColor = modifiers.fillColor || style.fillColor || "FF000000";
        name = style.name || name || "";

        if (style.description) {
            description = style.description;
        } else if (modifiers.description) {
            description = modifiers.description;
        }

        fillColor = adjustColor(fillColor);

        if (geojson.coordinates !== undefined || geojson.coordinates !== null) {
            coordinates = geojson.coordinates;

            kml = '<Placemark>' +
                '<name><![CDATA[' + name + ']]></name>';

            if (description) {
                kml += '<description><![CDATA[' + description + ']]></description>';
            }

            kml += '<Style id="user-icon">' +
                '<IconStyle>' +
                '<scale>1.0</scale>' +
                '<Icon>' +
                '<href>' + iconUrl + '</href>' +
                '</Icon>' +
                '<hotSpot x="' + xOffset + '" y="' + yOffset + '" xunits="' + xUnits + '" yunits="' + yUnits + '"/>' +
                '</IconStyle>' +
                '</Style>';

            result = getPointKml(coordinates);
            if (result.success) {
                kml += result.data;
                kml += '</Placemark>';

                obj = {
                    kml: kml,
                    name: name,
                    id: id,
                    overlayId: overlayId,
                    data: geojson,
                    format: 'geojson',
                    properties: modifiers,
                    zoom: zoom
                };

                return {
                    success: true,
                    message: "",
                    data: obj
                };
            }

        } else {
            result = {
                success: false,
                message: "geojson does not have a valid coordinate."
            };
        }

        return result;
    }

    function getLineStringKml(coordinates) {
        var coordinateString = "",
            i,
            latlon,
            lat,
            lon,
            endChar,
            result = null,
            altitude,
            kml;

        // Loop through each coordinate and get the lat/lons
        // to build a line string we pass to our renderer
        for (i = 0; i < coordinates.length; i += 1) {
            // Make sure we have at least 2 points for a line, if not
            // it is not a valid line.
            if (coordinates.length >= 2) {

                latlon = coordinates[i];

                if (latlon !== undefined && latlon !== null) {
                    // Make sure we have at least a lat and a lon, if not
                    // it is not a valid point.
                    if (latlon.length >= 2) {
                        lat = latlon[1];
                        lon = latlon[0];

                        // If we have 3 points, then we need to note this
                        // line has altitude. (3rd point is z value) This
                        // line will have to be extruded from the globe.
                        if (latlon.length === 3) {
                            altitude = latlon[2];
                            coordinateString = coordinateString + lon + "," + lat + "," + altitude;
                            endChar = (i !== (coordinates.length - 1)) ? " " : "";
                            coordinateString = coordinateString + endChar;
                        } else {
                            coordinateString = coordinateString + lon + "," + lat;
                            endChar = (i !== (coordinates.length - 1)) ? " " : "";
                            coordinateString = coordinateString + endChar;
                        }

                    } else {
                        result = {
                            success: false,
                            message: "geojson does not have a valid coordinate."
                        };
                        break;
                    }
                } else {
                    result = {
                        success: false,
                        message: "geojson does not have a valid coordinate.  Point is null."
                    };
                    break;
                }
            } else {
                result = {
                    success: false,
                    message: "geojson does not have enough coordinates to make a line."
                };
                break;
            }
        }

        if (result === null) {
            kml = '<LineString>' +
                '<tessellate>1</tessellate>' +
                '<coordinates>' + coordinateString + '</coordinates>' +
                '</LineString>';

            result = {
                success: true,
                message: "",
                data: kml
            };
        }

        return result;
    }

    function addGeoJsonLineString(geojson, name, id, overlayId, modifiers, zoom) {
        var result = "",
            coordinates,
            kml,
            lineColor,
            lineThickness,
            obj,
            description,
            style;


        style = emp.geojsonParser.getStyle(geojson);

        modifiers = modifiers || {};
        lineColor = modifiers.lineColor || style.lineColor || 'FF000000';
        lineThickness = modifiers.lineThickness || 3.0;

        lineColor = adjustColor(lineColor);

        name = style.name || name || "";

        if (style.description) {
            description = style.description;
        } else if (modifiers.description) {
            description = modifiers.description;
        }

        // The type of GeoJson is a Line. Parse the Line and add it to the
        // map.
        if (geojson.coordinates !== undefined || geojson.coordinates !== null) {

            // A line string is contained in a 2 dimensional array.
            // Once we get the coordinates, we will need to pull
            // each one out which resides in it's own array.
            coordinates = geojson.coordinates;

            if (coordinates !== undefined && coordinates !== null) {

                //coordinateString = result.data;

                kml = '<Placemark>' +
                    '<name><![CDATA[' + name + ']]></name>';

                if (description) {
                    kml += '<description><![CDATA[' + description + ']]></description>';
                }

                kml += '<Style id="user-line">' +
                    '<LineStyle>' +
                    '<color>' + lineColor + '</color>' +
                    '<width>' + lineThickness + '</width>' +
                    '</LineStyle>' +
                    '</Style>';

                result = getLineStringKml(coordinates);

                // Make sure that there weren't any errors processing the JSON prior to 
                // creating the kml.
                if (result !== undefined && result.success !== false) {
                    kml += result.data;
                    kml += '</Placemark>';

                    obj = {
                        kml: kml,
                        name: name,
                        id: id,
                        overlayId: overlayId,
                        data: geojson,
                        format: 'geojson',
                        properties: modifiers,
                        zoom: zoom
                    };

                    result = {
                        success: true,
                        message: "",
                        data: obj
                    };
                }

            } else {
                result = {
                    success: false,
                    message: "geojson does not have a valid coordinates.  Coordinates are null. "
                };
            }
        } else {
            result = {
                success: false,
                message: "geojson does not have a valid coordinate"
            };
        }

        return result;
    }

    function getPolygonKml(polygon) {
        var latlon,
            lat,
            lon,
            endChar,
            coordinateString = "",
            kml = '<Polygon>' + '<tessellate>1</tessellate>',
            coordinates,
            numRings,
            coordIdx,
            ringIdx;

        // The first polygon is the outline, thereafter the following are holes
        // First get the coordinates for the linear ring that defines the outline (outer boundary).
        coordinates = polygon[0];
        numRings = polygon.length;

        if (numRings > 0) {
            // Loop through the polygon outline and create a linear ring from all
            // its points.

            // Make sure we have at least 4 points to build a polygon.
            if (coordinates.length <= 3) {
                // Add a 4th point equalling the first point
                polygon[0][3] = polygon[0][0];
                return getPolygonKml(polygon);
            }

            for (coordIdx = 0; coordIdx < coordinates.length; coordIdx += 1) {
                latlon = coordinates[coordIdx];

                if (latlon !== undefined && latlon !== null) {
                    // Make sure we have at least a lat and a lon, if not
                    // it is not a valid point.
                    if (latlon.length >= 2) {
                        lat = latlon[1];
                        lon = latlon[0];

                        // If we have 3 points, then we need to note this
                        // line has altitude. (3rd point is z value)
                        if (latlon.length === 3) {
                            coordinateString = coordinateString + lon + "," + lat + "," + latlon[2];
                            endChar = (coordIdx !== (coordinates.length - 1)) ? " " : "";
                            coordinateString = coordinateString + endChar;
                        } else {
                            coordinateString = coordinateString + lon + "," + lat;
                            endChar = (coordIdx !== (coordinates.length - 1)) ? " " : "";
                            coordinateString = coordinateString + endChar;
                        }
                    } else {
                        return {
                            success: false,
                            message: "geojson does not have a valid coordinate."
                        };
                    }
                } else {
                    return {
                        success: false,
                        message: "geojson does not have a valid coordinate.  Point is null."
                    };
                }
            }

            // Verify that the polygon closes itself out.  Some people do this, some people don't, but
            // KML requires the first and last points to be the same.
            var firstCoordinate = coordinates[0];
            var lastCoordinate = coordinates[coordinates.length - 1];

            if (firstCoordinate.length === 3 && lastCoordinate.length === 3) {
                // If lat lon are different make the first and last points the same.
                if (firstCoordinate[0] !== lastCoordinate[0] ||
                    firstCoordinate[1] !== lastCoordinate[1] ||
                    firstCoordinate[2] !== lastCoordinate[2]) {
                    coordinateString = coordinateString + " " + firstCoordinate[0] + "," + firstCoordinate[1] + "," + firstCoordinate[2];
                }
            } else {
                if (firstCoordinate.length === 2 && lastCoordinate.length === 2) {

                    // If lat lon are different make the first and last points the same.
                    if (firstCoordinate[0] !== lastCoordinate[0] ||
                        firstCoordinate[1] !== lastCoordinate[1]) {
                        coordinateString = coordinateString + " " + firstCoordinate[0] + "," + firstCoordinate[1];
                    }

                } else {

                    if (firstCoordinate.length > 2) {
                        coordinateString = coordinateString + " " + firstCoordinate[0] + "," + firstCoordinate[1] + "," + firstCoordinate[2];
                    } else {
                        coordinateString = coordinateString + " " + firstCoordinate[0] + "," + firstCoordinate[1];
                    }
                }
            }

            kml += '<outerBoundaryIs>' +
                '<LinearRing>' +
                '<coordinates>' + coordinateString + '</coordinates>' +
                '</LinearRing>' +
                '</outerBoundaryIs>';

            // If there is more than one linear ring, then add the interior rings.
            if (numRings > 1) {

                for (ringIdx = 1; ringIdx < numRings; ringIdx += 1) {
                    coordinates = polygon[ringIdx];
                    coordinateString = "";

                    // Make sure we have at least 3 points to build a linear ring.
                    if (coordinates.length < 3) {
                        return {
                            success: false,
                            message: "geojson does not have enough coordinates to build a polygon."
                        };
                    }

                    for (coordIdx = 0; coordIdx < coordinates.length; coordIdx += 1) {
                        latlon = coordinates[coordIdx];
                        if (latlon !== undefined && latlon !== null) {
                            // Make sure we have at least a lat and a lon, if not
                            // it is not a valid point.
                            if (latlon.length >= 2) {
                                lat = latlon[1];
                                lon = latlon[0];

                                // If we have 3 points, then we need to note this
                                // line has altitude. (3rd point is z value)
                                if (latlon.length === 3) {
                                    coordinateString = coordinateString + lon + "," + lat + "," + latlon[2];
                                    endChar = (coordIdx !== (coordinates.length - 1)) ? " " : "";
                                    coordinateString = coordinateString + endChar;
                                } else {
                                    coordinateString = coordinateString + lon + "," + lat;
                                    endChar = (coordIdx !== (coordinates.length - 1)) ? " " : "";
                                    coordinateString = coordinateString + endChar;
                                }
                            } else {
                                return {
                                    success: false,
                                    message: "geojson does not have a valid coordinate."
                                };
                            }
                        } else {
                            return {
                                success: false,
                                message: "geojson does not have a valid coordinate.  Point is null."
                            };
                        }
                    }
                    // We successfully got an interior ring.  Add the kml for the
                    // interior ring.
                    kml += '<innerBoundaryIs>' +
                        '<LinearRing>' +
                        '<coordinates>' + coordinateString + '</coordinates>' +
                        '</LinearRing>' +
                        '</innerBoundaryIs>';
                }
            }

            kml += '</Polygon>';
            return {
                success: true,
                message: "",
                data: kml
            };

        } else {
            return {
                success: false,
                message: "geojson does not have enough coordinates to build a polygon."
            };
        }
    }

    function addGeoJsonPolygon(geojson, name, id, overlayId, modifiers, zoom) {

        var result = "",
            coordinates,
            fillColor,
            lineColor,
            lineThickness,
            kml,
            obj,
            description,
            style;

        style = emp.geojsonParser.getStyle(geojson);

        // The type of GeoJson is a Polygon. Parse the Polygon and add it to the
        // map. A Polygon is expressed as a 3 dimensional array. We need to make
        // sure
        // before going in we have at least 2 dimensions before starting. A polygon
        // 2nd dimension is first the border of the polygon followed by any interior
        // rings of the polygon.
        if ((geojson.coordinates !== undefined || geojson.coordinates !== null) && geojson.coordinates.length > 0) {

            modifiers = modifiers || {};
            fillColor = style.fillColor || modifiers.fillColor || "88FFFFFF";
            lineColor = style.lineColor || modifiers.lineColor || "FF000000";
            lineThickness = modifiers.lineThickness || 3.0;

            lineColor = adjustColor(lineColor);
            fillColor = adjustColor(fillColor);

            if (style.description) {
                description = style.description;
            } else if (modifiers.description) {
                description = modifiers.description;
            }

            name = style.name || name || "";

            // get the polygon
            coordinates = geojson.coordinates;

            if (coordinates !== undefined && coordinates !== null) {

                result = getPolygonKml(coordinates);

                // Make sure that there weren't any errors processing the JSON prior to 
                // creating the kml.
                if (result !== undefined && result.success !== false) {
                    kml = '<Placemark>' +
                        '<name><![CDATA[' + name + ']]></name>';

                    if (description) {
                        kml += '<description><![CDATA[' + description + ']]></description>';
                    }

                    kml += '<Style id="user-polygon">' +
                        '<LineStyle>' +
                        '<color>' + lineColor + '</color>' +
                        '<width>' + lineThickness + '</width>' +
                        '</LineStyle>' +
                        '<PolyStyle>' +
                        '<color>' + fillColor + '</color>' +
                        '</PolyStyle>' +
                        '</Style>';

                    kml += result.data;
                    kml += '</Placemark>';

                    obj = {
                        kml: kml,
                        name: name,
                        id: id,
                        overlayId: overlayId,
                        data: geojson,
                        format: 'geojson',
                        properties: modifiers,
                        zoom: zoom
                    };

                    result = {
                        success: true,
                        message: "",
                        data: obj
                    };

                }

            } else {
                result = {
                    success: false,
                    message: "geojson does not have a valid coordinates.  Coordinates are null. "
                };
            }
        } else {
            result = {
                success: false,
                message: "geojson does not have a valid coordinate"
            };
        }

        return result;
    }

    /**
    From a set of geojson coordinates in a multi point configuration, get the geometry
    KML needed to build the graphic.
    */

    function getMultiPointKml(coordinates) {
        var kml,
            point,
            lat,
            lon,
            result,
            overallResult = null,
            coordinateString,
            i,
            altitude;

        kml = '<MultiGeometry>';

        // Loop through each coordinate and get the lat/lons
        // to build a line string we pass to our renderer
        for (i = 0; i < coordinates.length; i += 1) {

            point = coordinates[i];

            if (point !== null) {
                if (point.length >= 2) {
                    lat = point[1];
                    lon = point[0];

                    if (point.length === 3) {
                        altitude = point[2];
                        coordinateString = lon + "," + lat + "," + altitude;
                    } else {
                        coordinateString = lon + "," + lat;
                    }

                    kml += '<Point>' +
                        '<coordinates>' + coordinateString + '</coordinates>' +
                        '</Point>';
                } else {
                    result = {
                        success: false,
                        message: "A portion of this geojson does not have a valid coordinate."
                    };
                }
            } else {
                result = {
                    success: false,
                    message: "A portion of this geojson does not have a valid coordinate."
                };
            }

            if (overallResult === null && result !== undefined && result.success === false) {
                overallResult = result;
            }
        }

        kml += '</MultiGeometry>';

        if (overallResult === null) {
            overallResult = {
                success: true,
                message: "",
                data: kml
            };
        }

        return overallResult;
    }

    /**
    Converts a geojson multi point to KML.
    */

    function addGeoJsonMultiPoint(geojson, name, id, overlayId, modifiers, zoom) {
        var iconUrl,
            coordinates,
            kml,
            fillColor,
            xOffset,
            yOffset,
            xUnits,
            yUnits,
            result,
            obj,
            iconObj,
            description,
            style;



        if (geojson.coordinates !== undefined || geojson.coordinates !== null) {
            coordinates = geojson.coordinates;

            style = emp.geojsonParser.getStyle(geojson);

            modifiers = modifiers || {};
            fillColor = style.fillColor || modifiers.fillColor || "FFFFFFFF";
            name = style.name || name || "";
            iconUrl = modifiers.iconUrl || style.iconUrl;

            // If no icon has been specified try to pull the default icon
            // from the map environment.
            if (!iconUrl) {

                iconObj = emp.utilities.getDefaultIcon();

                iconUrl = iconObj.iconUrl;
                xOffset = iconObj.offset.x;
                yOffset = 1 - iconObj.offset.y;
                xUnits = iconObj.offset.xUnits;
                yUnits = iconObj.offset.yUnits;
            } else {
                xOffset = modifiers.iconXOffset || 0;
                yOffset = modifiers.iconYOffset || 0;
                xUnits = modifiers.xUnits || "pixels";
                yUnits = modifiers.yUnits || "pixels";
            }

            if (style.description) {
                description = style.description;
            } else if (modifiers.description) {
                description = modifiers.description;
            }

            fillColor = adjustColor(fillColor);

            if (coordinates !== undefined && coordinates !== null) {

                fillColor = adjustColor(fillColor);
                kml = '<Placemark>' +
                    '<name><![CDATA[' + name + ']]></name>';

                if (description) {
                    kml += '<description><![CDATA[' + description + ']]></description>';
                }

                kml += '<Style id="s_clr-pushpin">' +
                    '<IconStyle>' +
                    '<color>' + fillColor + '</color>' +
                    '<scale>1.0</scale>' +
                    '<Icon>' +
                    '<href>' + iconUrl + '</href>' +
                    '</Icon>' +
                    '<hotSpot x="' + xOffset + '" y="' + yOffset + '" xunits="' + xUnits + '" yunits="' + yUnits + '"/>' +
                    '</IconStyle>' +
                    '</Style>';

                result = getMultiPointKml(coordinates);

                if (result.success) {
                    kml += result.data;
                    kml += '</Placemark>';

                    obj = {
                        kml: kml,
                        name: name,
                        id: id,
                        overlayId: overlayId,
                        data: geojson,
                        format: 'geojson',
                        properties: modifiers,
                        zoom: zoom
                    };

                    result = {
                        success: true,
                        message: "",
                        data: obj
                    };
                }

            } else {
                result = {
                    success: false,
                    message: "geojson does not have any coordinates."
                };
            }
        } else {
            result = {
                success: false,
                message: "geojson does not have a valid coordinate"
            };
        }

        return result;
    }

    /** 
    From a set of geojson coordinates configured in a multi line string pattern, get the
    geometry KML that corresponds to the multi linen string.
    */

    function getMultiLineStringKml(lines) {
        var kml,
            i,
            j,
            result,
            coordinates,
            coordinateString = "",
            point,
            altitude,
            endChar,
            lat,
            lon,
            overallResult = null;

        kml = '<MultiGeometry>';

        for (i = 0; i < lines.length; i += 1) {
            result = {};
            coordinates = lines[i];
            coordinateString = "";

            if (coordinates !== null) {
                // Loop through each coordinate and get the lat/lons
                // to build a line string we pass to our renderer
                for (j = 0; j < coordinates.length; j += 1) {
                    point = coordinates[j];

                    if (point !== null) {
                        lat = point[1];
                        lon = point[0];

                        if (point.length >= 2) {
                            // If we have 3 points, then we need to note
                            // this
                            // line has altitude. (3rd point is z value)
                            // This
                            // line will have to be extruded from the globe.
                            if (point.length === 3) {
                                altitude = point[2];
                                coordinateString = coordinateString + lon + "," + lat + "," + altitude;
                                endChar = (j !== (coordinates.length - 1)) ? " " : "";
                                coordinateString = coordinateString + endChar;
                            } else {
                                coordinateString = coordinateString + lon + "," + lat;
                                endChar = (j !== (coordinates.length - 1)) ? " " : "";
                                coordinateString = coordinateString + endChar;
                            }
                        } else {
                            result = {
                                success: false,
                                message: "A portion of this geojson does not have a valid coordinate."
                            };
                        }
                    } else {
                        result = {
                            success: false,
                            message: "A portion of this geojson does not have a valid coordinate."
                        };
                    }

                    if (overallResult === null && result !== undefined && result.success === false) {
                        overallResult = result;
                    }
                }

                if (result !== undefined && result.success !== false) {
                    kml += '<LineString>' +
                        '<tessellate>1</tessellate>' +
                        '<coordinates>' + coordinateString + '</coordinates>' +
                        '</LineString>';
                }

            } else {
                result = {
                    success: false,
                    message: "geojson does not have any coordinates."
                };
            }

            if (overallResult === null && result !== undefined && result.success === false) {
                overallResult = result;
            }
        }

        kml = kml + '</MultiGeometry>';

        if (overallResult === null) {
            overallResult = {
                success: true,
                message: "",
                data: kml
            };
        }

        return overallResult;
    }

    function addGeoJsonMultiLineString(geojson, name, id, overlayId, modifiers, zoom) {

        var result,
            lines,
            kml,
            lineColor,
            obj,
            description,
            style;


        if (geojson.coordinates !== undefined || geojson.coordinates !== null) {

            style = emp.geojsonParser.getStyle(geojson);
            modifiers = modifiers || {};
            lineColor = style.lineColor || modifiers.lineColor || "FF000000";
            //lineThickness = modifiers.lineThickness || 3.0;

            lines = geojson.coordinates;

            lineColor = adjustColor(lineColor);

            name = style.name || name || "";

            if (style.description) {
                description = style.description;
            } else if (modifiers.description) {
                description = modifiers.description;
            }

            if (lines !== null) {

                kml = '<Placemark>' +
                    '<name><![CDATA[' + name + ']]></name>' +
                    '<description><![CDATA[' + description + ']]></description>' +
                    '<Style id="bufferLineStyle">' +
                    '<LineStyle>' +
                    '<color>' + lineColor + '</color>' +
                    '<width>' + 4 + '</width>' +
                    '</LineStyle>' +
                    '</Style>';

                result = getMultiLineStringKml(lines);

                if (result.success) {
                    kml += result.data;
                    kml += '</Placemark>';

                    obj = {
                        kml: kml,
                        name: name,
                        id: id,
                        overlayId: overlayId,
                        data: geojson,
                        format: 'geojson',
                        properties: modifiers,
                        zoom: zoom
                    };

                    result = {
                        success: true,
                        message: "",
                        data: obj
                    };
                }


            } else {
                result = {
                    success: false,
                    message: "There are no lines within this MultiLineString."
                };
            }

        } else {
            result = {
                success: false,
                message: "This MultiLineString geojson does not have an coordinates"
            };
        }

        return result;
    }

    function getMultiPolygonKml(polygons) {
        var kml = '<MultiGeometry>',
            i,
            len = polygons.length,
            result;
        for (i = 0; i < len; i += 1) {
            result = getPolygonKml(polygons[i]);
            if (!result.success) {
                return result;
            }
            kml += result.data;
        }
        kml += "</MultiGeometry>";
        return {
            success: true,
            message: "",
            data: kml
        };
    }

    function addGeoJsonMultiPolygon(geojson, name, id, overlayId, description, modifiers, zoom) {

        var result,
            polygons,
            fillColor,
            lineColor,
            lineThickness,
            kml,
            obj,
            style;

        // The type of GeoJson is a Polygon. Parse the Polygon and add it to the
        // map. A Polygon is expressed as a 3 dimensional array. We need to make
        // sure
        // before going in we have at least 2 dimensions before starting. A polygon
        // 2nd dimension is first the border of the polygon followed by any interior
        // rings of the polygon.
        if ((geojson.coordinates !== undefined || geojson.coordinates !== null) && geojson.coordinates.length > 0) {

            style = emp.geojsonParser.getStyle(geojson);
            modifiers = modifiers || {};
            fillColor = style.fillColor || modifiers.fillColor || "88000000";
            lineColor = style.lineColor || modifiers.lineColor || "FF000000";
            lineThickness = modifiers.lineThickness || 3.0;

            if (style.description) {
                description = style.description;
            } else if (modifiers.description) {
                description = modifiers.description;
            }

            name = style.name || name || "";

            kml = "<Placemark>";
            kml += '<name><![CDATA[' + name + ']]></name>';
            kml += "<description><![CDATA[" + description + "]]></description>";
            kml += "<Style id='bufferLineStyle'>";
            kml += "<LineStyle>";
            kml += "<color>" + lineColor + "</color>";
            kml += "<width>" + lineThickness + "</width>";
            kml += "</LineStyle>";
            kml += "<PolyStyle>";
            kml += "<color>" + fillColor + "</color>";
            kml += "</PolyStyle>";
            kml += "</Style>";

            polygons = geojson.coordinates;
            result = getMultiPolygonKml(polygons);

            if (result.success) {
                kml += result.data;
                kml += "</Placemark>";

                obj = {
                    kml: kml,
                    name: name,
                    id: id,
                    overlayId: overlayId,
                    data: geojson,
                    format: 'geojson',
                    properties: modifiers,
                    zoom: zoom
                };

                result = {
                    success: true,
                    message: "",
                    data: obj
                };
            }

        } else {
            result = {
                success: false,
                message: "geojson does not have a valid coordinate"
            };
        }

        return result;

    }

    /**
    Produces the KML Geometry needed from geoJSON coordinates and a geoJSON type.  
    */

    function getGeomtryCollectionKml(type, coordinates) {
        var result,
            kml;

        if (type !== null) {

            switch (type.toLowerCase()) {
                case "point":
                    result = getPointKml(coordinates);
                    if (result.success) {
                        kml = result.data;
                    }
                    break;
                case "linestring":
                    result = getLineStringKml(coordinates);
                    if (result.success) {
                        kml = result.data;
                    }
                    break;
                case "polygon":
                    result = getPolygonKml(coordinates);
                    if (result.success) {
                        kml = result.data;
                    }
                    break;
                case "multipoint":
                    result = getMultiPointKml(coordinates);
                    if (result.success) {
                        kml = result.data;
                    }
                    break;
                case "multilinestring":
                    result = getMultiLineStringKml(coordinates);
                    if (result.success) {
                        kml = result.data;
                    }
                    break;
                case "multipolygon":
                    result = getMultiPolygonKml(coordinates);
                    if (result.success) {
                        kml = result.data;
                    }
                    break;
                case "geometrycollection":
                    kml = '<MultiGeometry>';
                    result = getGeomtryCollectionKml(coordinates);
                    if (result.success) {
                        kml += result.data;
                    }
                    kml += '</MultiGeometry>';
                    break;
                default:
                    result = {
                        success: false,
                        message: "Unssupported GeoJson type. Skipping Geometry."
                    };
                    break;
            }

        } else {
            result = {
                success: false,
                message: "Undefined type in GeometryCollection. Skipping Geometry."
            };
        }

        return result;
    }

    function addGeoJsonFeature(geojson, name, id, overlayId, modifiers, zoom) {

        var geometry,
            properties,
            coloredRow,
            result,
            kml,
            coordinates,
            fillColor,
            lineColor,
            lineThickness,
            iconUrl,
            xOffset,
            yOffset,
            xUnits,
            yUnits,
            obj,
            iconObj,
            propertyName,
            description,
            style;

        style = emp.geojsonParser.getStyle(geojson);
        modifiers = modifiers || {};
        fillColor = style.fillColor || modifiers.fillColor || "88000000";
        lineColor = style.lineColor || modifiers.lineColor || "FF000000";
        lineThickness = modifiers.lineThickness || 3.0;

        iconUrl = modifiers.iconUrl || style.iconUrl;

        // If no icon has been specified try to pull the default icon
        // from the map environment.
        if (!iconUrl) {

            iconObj = emp.utilities.getDefaultIcon();

            iconUrl = iconObj.iconUrl;
            xOffset = iconObj.offset.x;
            yOffset = 1 - iconObj.offset.y;
            xUnits = iconObj.offset.xUnits;
            yUnits = iconObj.offset.yUnits;
        } else {
            xOffset = modifiers.iconXOffset || 0;
            yOffset = modifiers.iconYOffset || 0;
            xUnits = modifiers.xUnits || "pixels";
            yUnits = modifiers.yUnits || "pixels";
        }

        lineColor = geEngine.utils.adjustColor(lineColor);
        fillColor = geEngine.utils.adjustColor(fillColor);

        if (style.description) {
            description = style.description;
        } else if (modifiers.description) {
            description = modifiers.description;
        }

        name = style.name || name || "";

        // Make sure the type is a feature which is what we are checking
        // for.  
        if (geojson !== undefined && geojson !== null) {


            // Get the geometry inside the feature.  This is what will be drawn.            
            geometry = geojson.geometry;

            // Get the properties inside this feature.  This will go into the description.
            properties = geojson.properties; //properties populated in emp.validation



            if (modifiers.popupContentHTML) {
                description = modifiers.popupContentHTML;
            } else if (properties !== null) {
                // Build a table from the description.
                if (description) {
                    description = description + "<br/><table border=\"1\" cellpadding=\"2\" cellspacing=\"0\" width=100%>";
                } else {
                    description = "<br/><table border=\"1\" cellpadding=\"2\" cellspacing=\"0\" width=100%>";
                }

                coloredRow = false;

                for (propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) {
                        description = description + "<tr " + (coloredRow ? " bgcolor=\"#F0F0F0\">" : ">");
                        description = description + "<td>";
                        description = description + "<b>";
                        description = description + propertyName;
                        description = description + "</b>";
                        description = description + "</td>";
                        description = description + "<td>";
                        description = description + properties[propertyName];
                        description = description + "</td>";
                        description = description + "</tr>";
                        coloredRow = !coloredRow;
                    }
                }
                description = description + "</table>";
            }

            // Get the coordinates of the geometry;
            coordinates = geometry.coordinates;

            switch (geometry.type.toLowerCase()) {
                case "point":
                    result = getPointKml(coordinates);
                    break;
                case "linestring":
                    result = getLineStringKml(coordinates);
                    break;
                case "polygon":
                    result = getPolygonKml(coordinates);
                    break;
                case "multipoint":
                    result = getMultiPointKml(coordinates);
                    break;
                case "multilinestring":
                    result = getMultiLineStringKml(coordinates);
                    break;
                case "multipolygon":
                    result = getMultiPolygonKml(coordinates);
                    break;
                case "geometrycollection":
                    result = getGeomtryCollectionKml(coordinates);
                    break;
                default:
                    result = {
                        success: false,
                        message: "Unsupported GeoJson type. Skipping Geometry."
                    };
                    break;
            }

            if (result.success) {
                kml = '<Placemark>' +
                    '<name><![CDATA[' + name + ']]></name>' +
                    '<description><![CDATA[' + description + ']]></description>' +
                    '<Style id="geomcollection">' +
                    '<LineStyle>' +
                    '<color>' + lineColor + '</color>' +
                    '<width>' + lineThickness + '</width>' +
                    '</LineStyle>' +
                    '<PolyStyle>' +
                    '<color>' + fillColor + '</color>' +
                    '</PolyStyle>' +
                    '<IconStyle>' +
                    '<scale>1.0</scale>' +
                    '<Icon>' +
                    '<href>' + iconUrl + '</href>' +
                    '</Icon>' +
                    '<hotSpot x="' + xOffset + '" y="' + yOffset + '" xunits="' + xUnits + '" yunits="' + yUnits + '"/>' +
                    '</IconStyle>' +
                    '</Style>';
                kml += result.data;
                kml += '</Placemark>';

                obj = {
                    kml: kml,
                    name: name,
                    id: id,
                    overlayId: overlayId,
                    data: geojson,
                    format: 'geojson',
                    properties: modifiers,
                    zoom: zoom
                };

                result = {
                    success: true,
                    message: "",
                    data: obj
                };
            }

        } else {
            result = {
                success: false,
                message: "GeoJson is either null or not of the correct type."
            };
        }

        return result;
    }

    /**
     * Adds a GeoJson FeatureCollection object to the map.  Feature collection is a
     * logically grouped container of Features.  A FeatureCollection only contains Features,
     * so there has to be a number of Features defined and populated for the Json to parse
     * correctly.
     *
     * @param geojson the FeatureCollection Json formatted to the GeoJson 1.0 specification
     * @param name The name of the containing effort id used to group the Features.  The Features
     * will be named after this indexed by the order they appear in the FeatureCollection.
     * @param description The data that will appear in the bubble when clicked on in Google Maps.
     * @param modifiers Can contain line, fill, colors, offsets, iconUrls.
     * @returns {String}
     */

    function addGeoJsonFeatureCollection(geojson, name, id, overlayId, modifiers, zoom) {

        var result,
            len,
            feature,
            features,
            i,
            obj,
            kml,
            lineColor,
            lineThickness,
            fillColor,
            iconUrl,
            iconObj,
            xOffset,
            yOffset,
            xUnits,
            yUnits,
            style;

        if (geojson !== null && geojson.type === "FeatureCollection") {

            style = emp.geojsonParser.getStyle(geojson);

            modifiers = modifiers || {};
            fillColor = style.fillColor || modifiers.fillColor || "88000000";
            lineColor = style.lineColor || modifiers.lineColor || "FF000000";
            lineThickness = modifiers.lineThickness || 3.0;

            iconUrl = modifiers.iconUrl || style.iconUrl;

            // If no icon has been specified try to pull the default icon
            // from the map environment.
            if (!iconUrl) {

                iconObj = emp.utilities.getDefaultIcon();

                iconUrl = iconObj.iconUrl;
                xOffset = iconObj.offset.x;
                yOffset = 1 - iconObj.offset.y;
                xUnits = iconObj.offset.xUnits;
                yUnits = iconObj.offset.yUnits;
            } else {
                xOffset = modifiers.iconXOffset || 0;
                yOffset = modifiers.iconYOffset || 0;
                xUnits = modifiers.xUnits || "pixels";
                yUnits = modifiers.yUnits || "pixels";
            }

            lineColor = adjustColor(lineColor);
            fillColor = adjustColor(fillColor);

/*
            if (style.description) {
                description = style.description;
            } else if (modifiers.description) {
                description = modifiers.description;
            }
*/

            name = style.name || name || "";

            // Retrieve all the features in the feature collection
            features = geojson.features;

            if (features !== null) {


                kml = "<Folder>" +
                    "<name><![CDATA[" + name + "]]></name>" +
                    "<Style id='geomcollection'>" +
                    "<LineStyle>" +
                    "<color>" + lineColor + "</color>" +
                    "<width>" + lineThickness + "</width>" +
                    "</LineStyle>" +
                    "<PolyStyle>" +
                    "<color>" + fillColor + "</color>" +
                    "</PolyStyle>" +
                    "<IconStyle>" +
                    "<scale>1.0</scale>" +
                    "<Icon>" +
                    "<href>" + iconUrl + "</href>" +
                    "</Icon>" +
                    "<hotSpot x='" + xOffset + "' y='" + yOffset + "' xunits='" + xUnits + "' yunits='" + yUnits + "'/>" +
                    "</IconStyle>" +
                    "</Style>";


                // Add the features to the overlay just created.
                len = features.length;
                for (i = 0; i < len; i += 1) {
                    result = {};
                    feature = features[i];

                    // If the feature has properties, use them
                    if (Object.keys(feature.properties).length !== 0) {
                        modifiers = feature.properties;
                    }

                    result = addGeoJsonFeature(feature, name, id, overlayId, modifiers, zoom);

                    if (result.success) {
                        kml += result.data.kml;
                    }
                }

                kml += "</Folder>";

                obj = {
                    kml: kml,
                    name: name,
                    id: id,
                    overlayId: overlayId,
                    data: geojson,
                    format: "geojson",
                    properties: modifiers,
                    zoom: zoom
                };

                result = {
                    success: true,
                    message: "",
                    data: obj
                };
            } else {
                result = "FeatureCollection contains no features.";
            }


        } else {
            result = "GeoJson is either null or not of the correct type.";
        }

        return result;
    }

    /**
     * Adds a GeoJson GeometryCollection.  A GeometryCollection can be any type
     * of GeoJson geometry, point, line, polygon, multi-point, multi-linestring, multi-
     * polygon, or another geometryCollection.  All graphics within the geometry
     * Collection are related and grouped under an containing effort.  Names of each
     * graphic are incremented by an index number in the order they are written
     * in the Json.  Ids are renamed similarly.
     *
     * @param geojson
     * @param name
     * @param description
     * @param modifiers
     * @returns {String}
     */

    function addGeoJsonGeometryCollection(geojson, name, id, overlayId, modifiers, zoom) {
        // Contains any error messages.  Returned at end of function.
        var len,
            i,
            geometry,
            type,
            kml,
            lineColor,
            fillColor,
            iconUrl,
            iconObj,
            xOffset,
            yOffset,
            xUnits,
            yUnits,
            coordinates,
            result,
            obj,
            description,
            style;

        // Make sure geojson contains valid data for this type.
        if (geojson !== null && geojson.type === 'GeometryCollection' &&
            geojson.geometries !== undefined && geojson.geometries !== null) {

            style = emp.geojsonParser.getStyle(geojson);
            modifiers = modifiers || {};
            fillColor = style.fillColor || modifiers.fillColor || "88000000";
            lineColor = style.lineColor || modifiers.lineColor || "FF000000";
            //lineThickness = modifiers.lineThickness || 3.0;
            iconUrl = modifiers.iconUrl || style.iconUrl;

            // If no icon has been specified try to pull the default icon
            // from the map environment.
            if (!iconUrl) {

                iconObj = emp.utilities.getDefaultIcon();

                iconUrl = iconObj.iconUrl;
                xOffset = iconObj.offset.x;
                yOffset = 1 - iconObj.offset.y;
                xUnits = iconObj.offset.xUnits;
                yUnits = iconObj.offset.yUnits;
            } else {
                xOffset = modifiers.iconXOffset || 0;
                yOffset = modifiers.iconYOffset || 0;
                xUnits = modifiers.xUnits || "pixels";
                yUnits = modifiers.yUnits || "pixels";
            }

            lineColor = geEngine.utils.adjustColor(lineColor);
            fillColor = geEngine.utils.adjustColor(fillColor);

            if (style.description) {
                description = style.description;
            } else if (modifiers.description) {
                description = modifiers.description;
            }

            name = style.name || name || "";

            // Loop through all the geometries add add them to a multi-geometry kml.
            // We interpret a geometry collection to be a group of related graphics
            // That contain unique properties for a main container. All graphics are
            // part of that main container.
            len = geojson.geometries.length;

            kml = '<Placemark>' +
                '<name><![CDATA[' + name + ']]></name>' +
                '<description><![CDATA[' + description + ']]></description>' +
                '<Style id="geomcollection">' +
                '<LineStyle>' +
                '<color>' + lineColor + '</color>' +
                '<width>' + 3.0 + '</width>' +
                '</LineStyle>' +
                '<PolyStyle>' +
                '<color>' + fillColor + '</color>' +
                '</PolyStyle>' +
                '<IconStyle>' +
                '<scale>1.0</scale>' +
                '<Icon>' +
                '<href>' + iconUrl + '</href>' +
                '</Icon>' +
                '<hotSpot x="' + xOffset + '" y="' + yOffset + '" xunits="' + xUnits + '" yunits="' + yUnits + '"/>' +
                '</IconStyle>' +
                '</Style>' +
                '<MultiGeometry>';

            for (i = 0; i < len; i += 1) {
                geometry = geojson.geometries[i];
                type = geometry.type;
                coordinates = geojson.geometries[i].coordinates;
                result = getGeomtryCollectionKml(type, coordinates);
                if (result.success) {
                    kml += result.data;
                }
            }
            kml = kml + '</MultiGeometry>' +
                '</Placemark>';

            obj = {
                kml: kml,
                name: name,
                id: id,
                overlayId: overlayId,
                data: geojson,
                format: 'geojson',
                properties: modifiers,
                zoom: zoom
            };

            result = {
                success: true,
                message: "",
                data: obj
            };

        } else {
            result = {
                success: false,
                message: "GeoJson is either null or not of the correct type."
            };
        }

        return result;
    }

    return {

        /**
         * @memberOf emp.geojsonParser
         * @description Converts an array of geojson objects to kml.  The returned object that can
         * be passed to the data manager to be added to an overlay.
         *
         * @param {Array.object} batch an array of geojson objects that are of the format:
         * @param {string} geojson geojson object
         * @param {string} name the display name of the object
         * @param {string} featureId the id of the object
         * @param {parentId} parentId the folder the object should be in
         * @param {string} description a description of the object, possibly in html
         * @param {emp.typeLibrary.Feature.modifiersType} modifiers a Modifiers object that can have color, line, point and polygon information
         * @return {object} The result of the operation in the following format.
         *      {
         *          success - true | false
         *          message - If the success field is false this field contains the error message.
         *          data - the converted kml data if the success field === true.
         *      }
         */
        geojsonToKmlBatch: function(batch) {
            var result,
                type,
                overallResult = null,
                i,
                length,
                geojson,
                name,
                featureId,
                parentId,
                modifiers,
                newBatch = [],
                zoom;



            // loop through each of the geojson objects and parse into kml, so that our engines
            // can handle it.
            length = batch.length;
            for (i = 0; i < length; i += 1) {
                try {

                    name = batch[i].name || "";
                    featureId = batch[i].featureId;
                    parentId = batch[i].parentId || "";
                    modifiers = batch[i].modifiers || {}; //changed modifier to properties
                    zoom = batch[i].zoom || false;


                    // get the Json from the batch.
                    geojson = batch[i].data;

                    // Check the type of geo Json and parse it into kml.
                    if (geojson.type !== undefined || geojson.type !== null) {
                        type = geojson.type;

                        switch (type.toLowerCase()) {
                            case "point":
                                result = addGeoJsonPoint(geojson, name, featureId, parentId,
                                    modifiers, zoom);
                                break;
                            case "linestring":
                                result = addGeoJsonLineString(geojson, name, featureId, parentId,
                                    modifiers, zoom);
                                break;
                            case "polygon":
                                result = addGeoJsonPolygon(geojson, name, featureId, parentId,
                                    modifiers, zoom);
                                break;
                            case "multipoint":
                                result = addGeoJsonMultiPoint(geojson, name, featureId, parentId,
                                    modifiers, zoom);
                                break;
                            case "multilinestring":
                                result = addGeoJsonMultiLineString(geojson, name, featureId, parentId,
                                    modifiers, zoom);
                                break;
                            case "multipolygon":
                                result = addGeoJsonMultiPolygon(geojson, name, featureId, parentId,
                                    modifiers, zoom);
                                break;
                            case "geometrycollection":
                                result = addGeoJsonGeometryCollection(geojson, name, featureId, parentId,
                                    modifiers, zoom);
                                break;
                            case "feature":
                                result = addGeoJsonFeature(geojson, name, featureId, parentId,
                                    modifiers, zoom);
                                break;
                            case "featurecollection":
                                result = addGeoJsonFeatureCollection(geojson, name, featureId, parentId,
                                    modifiers, zoom);
                                break;
                            default:
                                result = {
                                    success: false,
                                    message: "Unsupported GeoJson type"
                                };
                                break;
                        }

                        // Check to make sure the geojson was parsed correctly, and
                        // the parameters were good.  If not do not add to the map, return an error.
                        if (result.success === true) {
                            newBatch.push(result.data);
                            // Since this is a batch call, only report the first error that was found. Maintain
                            // a separate variable for overall result
                        } else if (overallResult === null) {
                            overallResult = result;
                        }
                    } else {
                        result = {
                            success: false,
                            message: "Incorrectly formatted GeoJson"
                        };
                        // Since this is a batch call, only report the first error that was found. Maintain
                        // a separate variable for overall result
                        if (overallResult === null) {
                            overallResult = result;
                        }
                    }
                } catch (err) {
                    result = {
                        success: false,
                        message: err.message
                    };
                    // Since this is a batch call, only report the first error that was found. Maintain
                    // a separate variable for overall result
                    if (overallResult === null) {
                        overallResult = result;
                    }
                }
            }

            // Since this is a batch call, only report the first error that was found. Maintain
            // a separate variable for overall result, which will not if anything failed.
            if (overallResult === null) {
                overallResult = {
                    success: true,
                    message: "",
                    data: newBatch
                };
            }

            return overallResult;
        },

        /**
        Converts geojson to kml.  The returned object that can be passed to the data manager.
        The returned object is in the format as follows:

        { 
            success: (bool),
            message: (string),
            data: {[
                kml: (string),
                id: (string),
                                                
                                                
                overlayId: (string),
                name: (string)]
            }
        }
        */
        geojsonToKml: function(geojson, name, id, overlayId, modifiers) {
            var batch = [],
                obj = {},
                result;

            try {
                obj = {
                    data: geojson,
                    format: 'geojson',
                    name: name,
                    id: id,
                    overlayId: overlayId,
                    properties: modifiers
                };
                batch.push(obj);
                result = this.geojsonToKmlBatch(batch);

            } catch (err) {
                result = {
                    success: false,
                    message: err.message
                };
            }

            return result;
        },

        getStyle: function(geojson) {
            var style = {},
                argb;

            if (geojson.properties) {
                if (geojson.properties.style) {

                    if (geojson.properties.style.lineStyle) {
                        if (geojson.properties.style.lineStyle.color &&
                            geojson.properties.style.lineStyle.color.r !== undefined &&
                            geojson.properties.style.lineStyle.color.g !== undefined &&
                            geojson.properties.style.lineStyle.color.b !== undefined &&
                            geojson.properties.style.lineStyle.color.a !== undefined) {

                            argb = armyc2.c2sd.renderer.utilities.Color.rgbToHexString(
                                geojson.properties.style.lineStyle.color.r,
                                geojson.properties.style.lineStyle.color.g,
                                geojson.properties.style.lineStyle.color.b,
                                geojson.properties.style.lineStyle.color.a).replace('#', '');

                            style.lineColor = argb;
                        }
                    }

                    if (geojson.properties.style.polyStyle) {
                        if (geojson.properties.style.polyStyle.color &&
                            geojson.properties.style.polyStyle.color.r !== undefined &&
                            geojson.properties.style.polyStyle.color.g !== undefined &&
                            geojson.properties.style.polyStyle.color.b !== undefined &&
                            geojson.properties.style.polyStyle.color.a !== undefined) {

                            argb = armyc2.c2sd.renderer.utilities.Color.rgbToHexString(
                                geojson.properties.style.polyStyle.color.r,
                                geojson.properties.style.polyStyle.color.g,
                                geojson.properties.style.polyStyle.color.b,
                                geojson.properties.style.polyStyle.color.a).replace('#', '');

                            style.fillColor = argb;
                        }
                    }

                    if (geojson.properties.style.iconStyle) {
                        if (geojson.properties.style.iconStyle.url) {
                            style.url = geojson.properties.style.iconStyle.url;
                        }
                    }
                }

                if (geojson.properties.name) {
                    style.name = geojson.properties.name;
                }

                if (geojson.properties.id) {
                    style.id = geojson.properties.id;
                }

                if (geojson.properties.description) {
                    style.description = geojson.properties.description;
                }

                // Don't do anything here.  This is just in for future work.
                if (geojson.properties.timePrimitive) {
                    if (geojson.properties.timePrimitive.timeSpan) {
                        if (geojson.properties.timePrimitive.timeSpan.begin &&
                            geojson.properties.timePrimitive.timeSpan.end) {
                            // Placeholder
                        }
                    }

                    if (geojson.properties.timePrimitive.timestamp) { /*Placeholder*/ }
                }
            }

            return style;
        }
    };
}());