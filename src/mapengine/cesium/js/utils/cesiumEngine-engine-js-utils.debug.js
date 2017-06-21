/*globals navigator, document, window, mapEngineExposed*/
/* global Cesium, NaN */

// Ensure the namespace has been created
var cesiumEngine = cesiumEngine || {};

cesiumEngine.utils = {
    createGUID: function ()
    {
        var S4 = function ()
        {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };

        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    },
    /**
     This function asyncronously loads a javascript file and adds it to the head
     section of the html page
     @function
     @param string url - URL to the scipt file
     @param funtion callback - Calllback function that is invoked when the script loads
     @returns {void}
     */
    loadScript: function (url, callback)
    {
        var head = document.getElementsByTagName('head')[0],
                script = document.createElement('script');

        script.type = 'text/javascript';
        if (callback)
        {
            script.onreadystatechange = function ()
            {
                if (this.readyState === 'complete')
                {
                    callback();
                }
            };
            script.onload = callback;
        }
        script.src = url;
        head.appendChild(script);
    },
    /*
     Modifies an ARGB color string to ABGR for use Google.
     @function
     @param string url - URL to the scipt file
     @returns {void}
     */
    adjustColor: function (color)
    {
        var alpha = "CC",
                red = "",
                green = "",
                blue = "",
                adjustedColor = "CC000000";

        if (color !== undefined && color !== null)
        {
            if (color.length === 8)
            {
                alpha = color.substr(0, 2);
                red = color.substr(2, 2);
                green = color.substr(4, 2);
                blue = color.substr(6, 2);
                adjustedColor = alpha + blue + green + red;
            }
            else if (color.length === 6)
            {
                red = color.substr(0, 2);
                green = color.substr(2, 2);
                blue = color.substr(4, 2);
                adjustedColor = alpha + blue + green + red;
            }
        }

        return adjustedColor;
    },
    getPointKml: function (name, id, description, latitude, longitude, altitude, altitudeMode, iconUrl, modifiers)
    {
        var hotSpotX,
                hotSpotY,
                xUnits = "pixels",
                yUnits = "pixels",
                kmlString,
                useDefaultIcon = false,
                fillColor,
                heading ;

        if (iconUrl === undefined || iconUrl === null || iconUrl === "null" || iconUrl === "undefined" || iconUrl === "")
        {
            iconUrl = emp.imagesUrls.whtBlank;
            useDefaultIcon = true;
        }
        if (altitude === undefined || altitude === null)
        {
            altitude = 0;
            altitudeMode = mapEngineExposed.ALTITUDE_CLAMP_TO_GROUND;
        }
        if (altitudeMode === undefined || altitudeMode === null)
        {
            altitudeMode = mapEngineExposed.ALTITUDE_CLAMP_TO_GROUND;
        }
        if (useDefaultIcon)
        {
            hotSpotY = 1;
            hotSpotX = 32;
            yUnits = "pixels";
            xUnits = "pixels";
        }
        if (modifiers !== undefined && modifiers !== null)
        {
            if (modifiers.yOffset !== undefined && modifiers.yOffset !== null)
            {
                hotSpotY = modifiers.yOffset;
            }
            if (modifiers.xOffset !== undefined && modifiers.xOffset !== null)
            {
                hotSpotX = modifiers.xOffset;
            }
            if (modifiers.yUnits !== undefined && modifiers.yUnits !== null)
            {
                yUnits = modifiers.yUnits;
            }
            if (modifiers.xUnits !== undefined && modifiers.xUnits !== null)
            {
                xUnits = modifiers.xUnits;
            }
            if (modifiers.fillColor !== undefined && modifiers.fillColor !== null)
            {
                fillColor = cesiumEngine.utils.adjustColor(modifiers.fillColor);
            }
            if (modifiers.heading !== undefined && modifiers.heading !== null)
            {
                if (modifiers.heading > 360 || modifiers.heading < -360 || modifiers.heading === 0)
                {
                    heading = 360;
                }
                else
                {
                    heading = modifiers.heading;
                }
            }
        }
        kmlString = '<Placemark id="' + id + '">' +
                '<name>' + name + '</name>' +
                '<description><![CDATA[' + description + ']]></description>' +
                '<Style>' + '<IconStyle>' +
                '<scale>' + emp.settings.iconSize + '</scale>' +
                '<Icon>' +
                '<href>' + iconUrl + '</href>' +
                '</Icon>';
        if (!isNaN(hotSpotX) && !isNaN(hotSpotY))
        {
            kmlString += '<hotSpot x="' + hotSpotX + '" y="' + hotSpotY + '" xunits="' + xUnits + '" yunits="' + yUnits + '"/>';
        }
        if (fillColor !== null)
        {
            kmlString += '<color>' + fillColor + '</color>';
        }
        if (heading !== undefined)
        {
            kmlString += '<heading>' + heading + '</heading>';
        }
        kmlString += '</IconStyle>' +
                '<LabelStyle>' +
                '<scale>' + emp.settings.labelSize + '</scale>' +
                '</LabelStyle>' +
                '</Style>' +
                '<Point>' +
                '<extrude>1</extrude>' +
                '<altitudeMode>' + altitudeMode + '</altitudeMode>' +
                '<coordinates>' + longitude + ',' + latitude + ',' + altitude + '</coordinates>' +
                '</Point>' +
                '</Placemark>';

        return kmlString;
    },
    getLineKml: function (coordinates, name, id, description, lineColor, lineWidth, altitudeMode, extrude, modifiers)
    {
        var kmlString,
                extrudeValue;

        extrude = extrude || 0;
        altitudeMode = altitudeMode || 'clampToGround';
        lineColor = lineColor || "FF000000";
        lineWidth = lineWidth || 5;
        description = description || "";
        if (extrude === true)
        {
            extrudeValue = 1;
        }
        else
        {
            extrudeValue = 0;
        }
        kmlString = '<Placemark id="' + id + '">' +
                '<name>' + name + '</name>' +
                '<description><![CDATA[' + description + ']]></description>' +
                '<Style>' +
                '<LineStyle>' +
                '<color>' + cesiumEngine.utils.adjustColor(lineColor) + '</color>' +
                '<width>' + lineWidth + '</width>' +
                '</LineStyle>' +
                '<LabelStyle>' +
                '<scale>' + emp.settings.labelSize + '</scale>' +
                '</LabelStyle>' +
                '</Style>' +
                '<LineString>' +
                '<extrude>' + extrudeValue + '</extrude>' +
                '<altitudeMode>' + altitudeMode + '</altitudeMode>' +
                '<coordinates>' + coordinates + '</coordinates>' +
                '</LineString>' +
                '</Placemark>';

        return kmlString;
    },
    getPolygonKml: function (coordinates, name, id, description, lineColor, fillColor, lineWidth, altitudeMode, extrude, modifiers)
    {
        var kmlString,
                firstCoordinate,
                extrudeValue;

        altitudeMode = altitudeMode || 'clampToGround';
        description = description || "";
        lineColor = lineColor || "FF000000";
        fillColor = fillColor || "88000000";
        lineWidth = lineWidth || 5;
        extrude = extrude || 0;
        if (extrude === true)
        {
            extrudeValue = 1;
        }
        else
        {
            extrudeValue = 0;
        }
        firstCoordinate = coordinates.substr(0, coordinates.indexOf(' '));
        kmlString = '<Placemark id="' + id + '">' +
                '<name>' + name + '</name>' +
                '<description><![CDATA[' + description + ']]></description>' +
                '<Style>' +
                '<PolyStyle>' +
                '<color>' + cesiumEngine.utils.adjustColor(fillColor) + '</color>' +
                '<outline>1</outline>' +
                '</PolyStyle>' +
                '<LineStyle>' +
                '<color>' + cesiumEngine.utils.adjustColor(lineColor) + '</color>' +
                '<width>' + lineWidth + '</width>' +
                '</LineStyle>' +
                '<LabelStyle>' +
                '<scale>' + emp.settings.labelSize + '</scale>' +
                '</LabelStyle>' +
                '</Style>' +
                '<Polygon>' +
                '<extrude>' + extrudeValue + '</extrude>' +
                '<altitudeMode>' + altitudeMode + '</altitudeMode>' +
                '<outerBoundaryIs>' +
                '<LinearRing>' +
                '<coordinates>' + coordinates + " " + firstCoordinate + '</coordinates>' +
                '</LinearRing>' +
                '</outerBoundaryIs>' +
                '</Polygon>' +
                '</Placemark>';

        return kmlString;
    }
};

cesiumEngine.utils.parseWMSUrlVars = function (url)
{
    var result = {},
            match = new RegExp("&LAYERS=([^&]+)").exec(url);

    result.params = {};
    if (match && match.length > 1)
    {
        result.params.layers = match[1].replace(/, /g, ','); // can mess up the proxy encode/decode uri
    }
    match = new RegExp("&FORMAT=([^&]+)").exec(url);
    if (match && match.length > 1)
    {
        result.params.format = match[1];
    }
    match = new RegExp("&WIDTH=([^&]+)").exec(url);
    if (match && match.length > 1)
    {
        result.params.width = match[1];
    }
    match = new RegExp("&HEIGHT=([^&]+)").exec(url);
    if (match && match.length > 1)
    {
        result.params.height = match[1];
    }
    match = new RegExp("&TRANSPARENT=([^&]+)").exec(url);
    if (match && match.length > 1)
    {
        result.params.transparent = match[1];
    }
    match = new RegExp("&STYLES=([^&]+)").exec(url);
    if (match && match.length > 1)
    {
        result.params.styles = match[1];
    }
    match = new RegExp("&SRS=([^&]+)").exec(url);
    if (match && match.length > 1)
    {
        result.params.srs = match[1];
    }
    match = new RegExp("&BGCOLOR=([^&]+)").exec(url);
    if (match && match.length > 1)
    {
        result.params.bgcolor = match[1];
    }
    match = new RegExp("&VERSION=([^&]+)").exec(url);
    if (match && match.length > 1)
    {
        result.params.version = match[1];
    }
    match = new RegExp("&EXCEPTIONS=([^&]+)").exec(url);
    if (match && match.length > 1)
    {
        result.params.exceptions = match[1];
    }
    // The BBOX and REQUEST params are probably not needed and may
    // cause more harm than good without extensive testing.
    match = new RegExp("&TIME=([^&]+)").exec(url);
    if (match && match.length > 1)
    {
        result.params.time = match[1];
    }
    match = new RegExp("&ELEVATION=([^&]+)").exec(url);
    if (match && match.length > 1)
    {
        result.params.elevation = match[1];
    }
    //WMS 1.3 variables below
    match = new RegExp("&SLD=([^&]+)").exec(url);
    if (match && match.length > 1)
    {
        result.params.sld = match[1];
    }
    match = new RegExp("&WFS=([^&]+)").exec(url);
    if (match && match.length > 1)
    {
        result.params.wfs = match[1];
    }

    return result;
};

cesiumEngine.utils.Hash = function ()
{
    var i;

    this.length = 0;
    this.items = [];
    for (i = 0; i < arguments.length; i += 2)
    {
        if (typeof (arguments[i + 1]) !== 'undefined')
        {
            this.items[arguments[i]] = arguments[i + 1];
            this.length += 1;
        }
    }
    this.removeItem = function (in_key)
    {
        var tmp_previous;

        if (typeof (this.items[in_key]) !== 'undefined')
        {
            this.length -= 1;
            tmp_previous = this.items[in_key];
            delete this.items[in_key];
        }

        return tmp_previous;
    };
    this.getItem = function (in_key)
    {
        return this.items[in_key];
    };
    this.setItem = function (in_key, in_value)
    {
        var tmp_previous;

        if (typeof (in_value) !== 'undefined')
        {
            if (typeof (this.items[in_key]) === 'undefined')
            {
                this.length += 1;
            }
            else
            {
                tmp_previous = this.items[in_key];
            }
            this.items[in_key] = in_value;
        }

        return tmp_previous;
    };
    this.hasItem = function (in_key)
    {
        return typeof (this.items[in_key]) !== 'undefined';
    };
    this.clear = function ()
    {
        var i;

        for (i in this.items)
        {
            if (this.items.hasOwnProperty(i))
            {
                delete this.items[i];
            }
        }
        this.length = 0;
    };
    this.toArray = function ()
    {
        var array = [],
                i;

        for (i in this.items)
        {
            if (this.items.hasOwnProperty(i))
            {
                array.push(this.items[i]);
            }
        }

        return array;
    };
};

/**
 * Allow a deep equal test where it compares all
 * the values in the object.  It does not extend prototype because null
 * could be one of the values that it needs to compare.
 * @param {type} x The first object to compare to
 * @param {type} y The second object you are comparing
 * @returns {Boolean} true if values of all the properties of the object are
 * equal.
 */
Object.equals = function (x, y)
{
    if (x === y)
        return true;
    // if both x and y are null or undefined or exactly the same
    if (!(x instanceof Object) || !(y instanceof Object))
        return false;
    // if they are not strictly equal they both need to be objects
    if (x.constructor !== y.constructor)
        return false;
    // They must have the exact same prototype chain, the least we can do
    // is test their constructor
    for (var p in x)
    {
        if (!x.hasOwnProperty(p))
            continue;
        // other properties were tested using x.constructor === y.constructor
        if (!y.hasOwnProperty(p))
            return false;
        // allows to test x[p] and y[p] when set to undefined
        if (x[p] === y[p])
            continue;
        // if they have the same strict value or identity they then they are equal.
        if (typeof (x[p]) !== "object")
            return false;
        // Numbers, Strings, Functions, Booleans must be strictly equal
        if (!Object.equals(x[p], y[p]))
            return false;
        // Objects and array must be tested recursively
    }
    for (p in y)
    {
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p))
            return false;
        // allows x[p] to be set to undefined
    }

    return true;
};


cesiumEngine.utils.isGeojsonCoordinateValid = function (args)
{
    var coordArray = [],
            i,
            pointArray,
            coordDegrees,
            isValid = true;

    if (args.type)
    {
        if (args.type === "Point")
        {
            if (args.coordinates)
            {
                 coordDegrees = args.coordinates;
                if (isNaN(parseFloat(coordDegrees[0])) || isNaN(parseFloat(coordDegrees[1])))// index 0 if for longitude, 1 for latitude
                {
                    return false;
                }
                if (!(coordDegrees[0] <= 180 && coordDegrees[0] >= -180) || !(coordDegrees[1] <= 90 && coordDegrees[1] >= -90))
                {
                    return false;
                }
            }
        }
        else if (args.type === "LineString")
        {
            for (i = 0; i < args.coordinates.length; i += 1)
            {
                 coordDegrees = args.coordinates[i];
                if (isNaN(parseFloat(coordDegrees[0])) || isNaN(parseFloat(coordDegrees[1])))
                {
                    return false;
                }
                if (!(coordDegrees[0] <= 180 && coordDegrees[0] >= -180) || !(coordDegrees[1] <= 90 && coordDegrees[1] >= -90))
                {
                    return false;
                }
            }
        }
        else if (args.type === "Polygon")
        {
            if (args.coordinates.length > 0)
            {
                pointArray = args.coordinates[0];
                for (i = 0; i < pointArray.length; i += 1)
                {
                    var coordDegrees = pointArray[i];
                    if (isNaN(parseFloat(coordDegrees[0])) || parseFloat(isNaN(coordDegrees[1])))
                    {
                        return false;
                    }
                    if (!(coordDegrees[0] <= 180 && coordDegrees[0] >= -180) || !(coordDegrees[1] <= 90 && coordDegrees[1] >= -90))
                    {
                        return false;
                    }
                }
            }
        }
    }
    else
    {
        return false;
    }

    return isValid;
};


cesiumEngine.utils.convertCoordsDegreesToCartographicArray = function (args)
{
    var coordArray = [],
            i,
            pointArray;

    if (args.type)
    {
        if (args.type === "Point")
        {
            if (args.coordinates)
            {
                var coordDegrees = args.coordinates;
                var pointCartographic = Cesium.Cartographic.fromDegrees(coordDegrees[0], coordDegrees[1], 0);
                coordArray.push(pointCartographic);
            }
        }
        else if (args.type === "LineString")
        {
            for (i = 0; i < args.coordinates.length; i += 1)
            {
                var coordDegrees = args.coordinates[i];
                var pointCartographic = Cesium.Cartographic.fromDegrees(coordDegrees[0], coordDegrees[1], 0);
                coordArray.push(pointCartographic);
            }
        }
        else if (args.type === "Polygon")
        {
            if (args.coordinates.length > 0)
            {
                pointArray = args.coordinates[0];
                for (i = 0; i < pointArray.length; i += 1)
                {
                    var coordDegrees = pointArray[i];
                    var pointCartographic = Cesium.Cartographic.fromDegrees(coordDegrees[0], coordDegrees[1], 0);
                    coordArray.push(pointCartographic);
                }
            }
        }
    }

    return coordArray;
};

cesiumEngine.utils.convertCartographicsToCoordinatesRange = function (coordinates)
{
    for (var index = 0; index < coordinates.length; index++)
    {
        var coordinate = coordinates[index];
        coordinate.longitude = Cesium.Math.convertLongitudeRange(coordinate.longitude);
        coordinate.latitude = Math.atan(Math.sin(coordinate.latitude) / Math.abs(Math.cos(coordinate.latitude)));
    }

    return coordinates;
};

cesiumEngine.utils.convertMilStdMultiPointCoordsToString = function (args)
{
    var coordString = "",
            i,
            j,
            point,
            pointArray,
            pointInt;

    if (args.type)
    {
        if (args.type === "Point")
        {
            if (args.coordinates instanceof Array)
            {
                if (args.coordinates.length >= 1)
                {
                    coordString = args.coordinates[0];
                }
                if (args.coordinates.length >= 2)
                {
                    coordString = coordString + "," + args.coordinates[1];
                }
                if (args.coordinates.length >= 3)
                {
                    coordString = coordString + "," + args.coordinates[2];
                }
            }
        }
        else if (args.type === "LineString")
        {
            for (i = 0; i < args.coordinates.length; i += 1)
            {
                point = args.coordinates[i];
                //traverse values in a point
                for (j = 0; j < point.length; j += 1)
                {
                    pointInt = point[j];
                    if (j === 0)
                    {
                        if (coordString === "")
                        {
                            coordString = pointInt;
                        }
                        else
                        {
                            coordString = coordString + " " + pointInt;
                        }
                    }
                    else
                    {
                        coordString = coordString + "," + pointInt;
                    }
                }
            }
        }
        else if (args.type === "Polygon")
        {
            if (args.coordinates.length > 0)
            {
                pointArray = args.coordinates[0];
                for (i = 0; i < pointArray.length; i += 1)
                {
                    point = pointArray[i];
                    //traverse values in a point
                    for (j = 0; j < point.length; j += 1)
                    {
                        pointInt = point[j];
                        if (j === 0)
                        {
                            if (coordString === "")
                            {
                                coordString = pointInt;
                            }
                            else
                            {
                                coordString = coordString + " " + pointInt;
                            }
                        }
                        else
                        {
                            coordString = coordString + "," + pointInt;
                        }
                    }
                }
            }
        }
    }

    return coordString;
};

cesiumEngine.utils.isEmpPrimitive = function (format)
{

    if (format === "circle" ||
            format === "square" ||
            format === "ellipse" ||
            format === "rectangle")
    {
        return true;
    }
    else
    {
        return false;
    }
};


cesiumEngine.utils.convertEmpPrimitiveItemToMilStandardItem = function (item, format)
{
    var isPrimitive = false, convertedItem = {};

    if (cesiumEngine.utils.isEmpPrimitive(format))
    {
        convertedItem = emp.helpers.copyObject(item);
        convertedItem.update = item.update;
          if (Cesium.defined(item.originFeature))
          {
              convertedItem.properties = item.originFeature.properties;
          }
        convertedItem.properties.modifiers = (Cesium.defined(convertedItem.properties.modifiers)) ? convertedItem.properties.modifiers : {};
        convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE] = [];
        convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH] = [];
        switch (format)
        {
            case "circle":
            {

                if (Cesium.defined(convertedItem.properties.buffer))
                {
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0] = parseFloat(convertedItem.properties.radius);
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][1] = parseFloat(convertedItem.properties.radius);
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][2] = parseFloat(convertedItem.properties.buffer);
                    convertedItem.hasBuffer = true;
                }
                else
                {
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0] = parseFloat(convertedItem.properties.radius);
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][1] = parseFloat(convertedItem.properties.radius);
                }
                convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH][0] = parseFloat(convertedItem.properties.azimuth);
                convertedItem.symbolCode = "PBS_CIRCLE-----";
                break;
            }
            case "square":
            {

                if (Cesium.defined(convertedItem.properties.buffer))
                {
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0] = parseFloat(convertedItem.properties.width);
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][1] = parseFloat(convertedItem.properties.width);
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][2] = parseFloat(convertedItem.properties.buffer);
                    convertedItem.hasBuffer = true;
                }
                else
                {
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0] = parseFloat(convertedItem.properties.width);
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][1] = parseFloat(convertedItem.properties.width);
                }
                convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH][0] = parseFloat(convertedItem.properties.azimuth);
                convertedItem.symbolCode = "PBS_SQUARE-----";
                break;
            }
            case  "ellipse":
            {
                //convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][1] = parseFloat(convertedItem.properties.semiMajor);
                //convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0] = parseFloat(convertedItem.properties.semiMinor);
                if (Cesium.defined(convertedItem.properties.buffer))
                {
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0] = parseFloat(convertedItem.properties.semiMajor);
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][1] = parseFloat(convertedItem.properties.semiMinor);
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][2] = parseFloat(convertedItem.properties.buffer);
                    convertedItem.hasBuffer = true;
                }
                else
                {
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0] = parseFloat(convertedItem.properties.semiMajor);
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][1] = parseFloat(convertedItem.properties.semiMinor);

                }
                convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH][0] = parseFloat(convertedItem.properties.azimuth) - 90;
                convertedItem.symbolCode = "PBS_ELLIPSE----";
                break;
            }
            case  "rectangle":
            {

                if (Cesium.defined(convertedItem.properties.buffer))
                {
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][1] = parseFloat(convertedItem.properties.height);
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0] = parseFloat(convertedItem.properties.width);
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][2] = parseFloat(convertedItem.properties.buffer);
                    convertedItem.hasBuffer = true;
                }
                else
                {
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][1] = parseFloat(convertedItem.properties.height);
                    convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0] = parseFloat(convertedItem.properties.width);
                }
                convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH][0] = parseFloat(convertedItem.properties.azimuth);
                convertedItem.symbolCode = "PBS_RECTANGLE--";
                break;
            }
        }
        if (Cesium.defined(convertedItem.originFeature))
        {
            convertedItem.originFeature.data.symbolCode = convertedItem.symbolCode;
        }
        return convertedItem;
    }
    else
    {
        // no conversion.
        return item;
    }
};


cesiumEngine.utils.convertMilStandardItemToEmpPrimitiveItem = function (item, format)
{
    if (cesiumEngine.utils.isEmpPrimitive(format))
    {
        var convertedItem = emp.helpers.copyObject(item);
        convertedItem.update = item.update;
        switch (format)
        {
            case "circle":
            {
                convertedItem.properties.radius = convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0];
                if (convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE].length > 2)
                {
                    convertedItem.properties.buffer = convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][2];
                }
                if (Cesium.defined(convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH]) &&
                        Array.isArray(convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH]) &&
                        convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH].length > 0)
                {
                    convertedItem.properties.azimuth = convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH][0];
                }
                else
                {
                    convertedItem.properties.azimuth = 0;
                }
                break;
            }
            case "square":
            {
                convertedItem.properties.width = convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0];
                if (convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE].length > 2)
                {
                    convertedItem.properties.buffer = convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][2];
                }
                if (Cesium.defined(convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH]) &&
                        Array.isArray(convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH]) &&
                        convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH].length > 0)
                {
                    convertedItem.properties.azimuth = convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH][0];
                }
                else
                {
                    convertedItem.properties.azimuth = 0;
                }
                break;
            }
            case  "ellipse":
            {
                convertedItem.properties.semiMajor = convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0];
                convertedItem.properties.semiMinor = convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][1];
                if (convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE].length > 2)
                {
                    convertedItem.properties.buffer = convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][2];
                }
                if (Cesium.defined(convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH]) &&
                        Array.isArray(convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH]) &&
                        convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH].length > 0)
                {
                    convertedItem.properties.azimuth = convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH][0] + 90;
                }
                else
                {
                    convertedItem.properties.azimuth = 0;
                }
                break;
            }
            case  "rectangle":
            {
                convertedItem.properties.height = convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][1];
                convertedItem.properties.width = convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0];
                if (convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE].length > 2)
                {
                    convertedItem.properties.buffer = convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][2];
                }
                if (Cesium.defined(convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH]) &&
                        Array.isArray(convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH]) &&
                        convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH].length > 0)
                {
                    convertedItem.properties.azimuth = convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH][0];
                }
                else
                {
                    convertedItem.properties.azimuth = 0;
                }
                break;
            }
        }
        convertedItem.properties.modifiers = undefined;
        convertedItem.symbolCode = undefined;
        if (Cesium.defined(convertedItem.originFeature))
        {
            convertedItem.originFeature.data.symbolCode = undefined;
        }
        if (Cesium.defined(convertedItem.plotFeature))
        {
            convertedItem.plotFeature.format = format;
        }
        return convertedItem;
    }
    else
    {
        // no conversion
        return item;
    }
};


cesiumEngine.utils.convertMilStandardPropertiesToEmpPrimitiveProperties = function (properties, format)
{
    var convertedProperty = {};
    if (cesiumEngine.utils.isEmpPrimitive(format))
    {
        convertedProperty = emp.helpers.copyObject(properties);
        //convertedItem.properties.modifiers = (Cesium.defined(convertedItem.properties.modifiers)) ? convertedItem.properties.modifiers : {};
        //convertedItem.properties.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE] = [];
        switch (format)
        {
            case "circle":
            {
                convertedProperty.radius = convertedProperty.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0];
                break;
            }
            case "square":
            {
                convertedProperty.width = convertedProperty.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0];
                break;
            }
            case "ellipse":
            {
                convertedProperty.semiMajor = convertedProperty.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][1];
                convertedProperty.semiMinor = convertedProperty.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0];
                convertedProperty.azimuth = convertedProperty.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH][0];
                break;
            }
            case  "rectangle":
            {
                convertedProperty.height = convertedProperty.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][1];
                convertedProperty.width = convertedProperty.modifiers[mil.symbology.renderer.modifierLookup.DISTANCE][0];
                break;
            }
        }
        convertedProperty.modifiers = undefined;
        return convertedProperty;
    }
    else
    {
        // no conversion
        return properties;
    }
};


cesiumEngine.utils.getSinglePointAltitudeRangeMode = function (CameraAltitude, singlePointAltitudeRanges)
{
    if (CameraAltitude < singlePointAltitudeRanges.mid)
    {
        return EmpCesiumConstants.SinglePointAltitudeRangeMode.LOW_RANGE;
    }
    else if (CameraAltitude >= singlePointAltitudeRanges.mid && CameraAltitude < singlePointAltitudeRanges.high)
    {
        return EmpCesiumConstants.SinglePointAltitudeRangeMode.MID_RANGE;
    }
    else if (CameraAltitude >= singlePointAltitudeRanges.high)
    {
        return EmpCesiumConstants.SinglePointAltitudeRangeMode.HIGHEST_RANGE;
    }
};



cesiumEngine.utils.isValidMilStdMultiPointCoords = function (args)
{
    var coordString = "",
            i,
            j,
            point,
            pointArray,
            pointInt, isValid = false;

    if (args.type)
    {
        if (args.type === "Point")
        {
            if (args.coordinates instanceof Array)
            {
                if (args.coordinates.length >= 1)
                {
                    coordString = args.coordinates[0];
                }
                if (args.coordinates.length >= 2)
                {
                    coordString = coordString + "," + args.coordinates[1];
                }
                if (args.coordinates.length >= 3)
                {
                    coordString = coordString + "," + args.coordinates[2];
                }
            }
        }
        else if (args.type === "LineString")
        {
            for (i = 0; i < args.coordinates.length; i += 1)
            {
                point = args.coordinates[i];
                //traverse values in a point
                for (j = 0; j < point.length; j += 1)
                {
                    pointInt = point[j];
                    if (j === 0)
                    {
                        if (coordString === "")
                        {
                            coordString = pointInt;
                        }
                        else
                        {
                            coordString = coordString + " " + pointInt;
                        }
                    }
                    else
                    {
                        coordString = coordString + "," + pointInt;
                    }
                }
            }
        }
        else if (args.type === "Polygon")
        {
            if (args.coordinates.length > 0)
            {
                pointArray = args.coordinates[0];
                for (i = 0; i < pointArray.length; i += 1)
                {
                    point = pointArray[i];
                    //traverse values in a point
                    for (j = 0; j < point.length; j += 1)
                    {
                        pointInt = point[j];
                        if (j === 0)
                        {
                            if (coordString === "")
                            {
                                coordString = pointInt;
                            }
                            else
                            {
                                coordString = coordString + " " + pointInt;
                            }
                        }
                        else
                        {
                            coordString = coordString + "," + pointInt;
                        }
                    }
                }
            }
        }
    }
    if ((coordString.indexOf("null") === -1) && (coordString.length > 0))
    {
        isValid = true;
    }
    return isValid;
};

cesiumEngine.utils.convertGeoJsonCoordToCartographic = function (oCoord)
{
    var oCoordinates,
            dLon,
            dLat,
            dAlt = NaN;

    if (oCoord[0])
    {
        if (typeof (oCoord[0]) === 'string')
        {
            dLon = parseFloat(oCoord[0]);
        }
        else if (typeof (oCoord[0]) === 'number')
        {
            dLon = oCoord[0];
        }
        else
        {
            return null;
        }
    }
    else
    {
        return null;
    }
    if (oCoord[1])
    {
        if (typeof (oCoord[1]) === 'string')
        {
            dLat = parseFloat(oCoord[1]);
        }
        else if (typeof (oCoord[1]) === 'number')
        {
            dLat = oCoord[1];
        }
        else
        {
            return null;
        }
    }
    else
    {
        return null;
    }
    if (oCoord.length === 3)
    {
        if (typeof (oCoord[2]) === 'string')
        {
            dAlt = Math.floor(parseFloat(oCoord[2]));
        }
        else if (typeof (oCoord[2]) === 'number')
        {
            dAlt = Math.floor(oCoord[2]);
        }
        else
        {
            return null;
        }
    }
    if (isNaN(dAlt))
    {
        oCoordinates = new Cesium.Cartographic(dLon.toRad(), dLat.toRad(), 0);
    }
    else
    {
        oCoordinates = new Cesium.Cartographic(dLon.toRad(), dLat.toRad(), dAlt);
    }

    return oCoordinates;
};

cesiumEngine.utils.convertGeoJsonCoordToCartographicList = function (oGeoJson)
{
    var oCoordinates = [],
            oCoord;

    if (!oGeoJson)
    {
        return null;
    }
    if (!oGeoJson.hasOwnProperty('type'))
    {
        return null;
    }
    switch (oGeoJson.type.toLowerCase())
    {
        case 'point':
            if (oGeoJson.coordinates.length > 0)
            {
                oCoord = cesiumEngine.utils.convertGeoJsonCoordToCartographic(oGeoJson.coordinates);
                if (!oCoord)
                {
                    return null;
                }
                oCoordinates.push(oCoord);
            }
            break;
        case 'linestring':
            for (var iIndex = 0; iIndex < oGeoJson.coordinates.length; iIndex++)
            {
                oCoord = cesiumEngine.utils.convertGeoJsonCoordToCartographic(oGeoJson.coordinates[iIndex]);
                if (!oCoord)
                {
                    return null;
                }
                oCoordinates.push(oCoord);
            }
            break;
        case 'polygon':
            // we get the coordinates of the outter polygon.
            for (var iIndex = 0; iIndex < oGeoJson.coordinates[0].length; iIndex++)
            {
                oCoord = cesiumEngine.utils.convertGeoJsonCoordToCartographic(oGeoJson.coordinates[0][iIndex]);
                if (!oCoord)
                {
                    return null;
                }
                oCoordinates.push(oCoord);
            }
            break;
        case 'feature':
            switch (oGeoJson.geometry.type.toLowerCase())
            {
                case 'point':
                    if (oGeoJson.geometry.coordinates.length > 0)
                    {
                        oCoord = cesiumEngine.utils.convertGeoJsonCoordToCartographic(oGeoJson.geometry.coordinates);
                        if (!oCoord)
                        {
                            return null;
                        }
                        oCoordinates.push(oCoord);
                    }
                    break;
                case 'linestring':
                    for (var iIndex = 0; iIndex < oGeoJson.geometry.coordinates.length; iIndex++)
                    {
                        oCoord = cesiumEngine.utils.convertGeoJsonCoordToCartographic(oGeoJson.geometry.coordinates[iIndex]);
                        if (!oCoord)
                        {
                            return null;
                        }
                        oCoordinates.push(oCoord);
                    }
                    break;
                case 'polygon':
                    // we get the coordinates of the outter polygon.
                    for (var iIndex = 0; iIndex < oGeoJson.geometry.coordinates[0].length; iIndex++)
                    {
                        oCoord = cesiumEngine.utils.convertGeoJsonCoordToCartographic(oGeoJson.geometry.coordinates[0][iIndex]);
                        if (!oCoord)
                        {
                            return null;
                        }
                        oCoordinates.push(oCoord);
                    }
                    break;
                default:
                    return null;
            }
            break;
        default:
            return null;
    }

    return oCoordinates;
};

cesiumEngine.utils.convertCartographicCoord2String = function (oCoord)
{
    var sCoordainte = "";

    if (oCoord)
    {
        sCoordainte = oCoord.longitude.toDeg() + "," + oCoord.latitude.toDeg();
        if (!isNaN(oCoord.height) && (Math.floor(oCoord.height) > 0))
        {
            sCoordainte += "," + Math.floor(oCoord.height);
        }
    }

    return sCoordainte;
};

cesiumEngine.utils.convertCartographicCoordList2String = function (oCoordList)
{
    var sCoordinates = "",
            iIndex;

    if (!oCoordList || (oCoordList.length === 0))
    {
        return "";
    }
    for (iIndex = 0; iIndex < oCoordList.length; iIndex++)
    {
        if (sCoordinates.length > 0)
        {
            sCoordinates += " ";
        }
        sCoordinates += cesiumEngine.utils.convertCartographicCoord2String(oCoordList[iIndex]);
    }

    return sCoordinates;
};

// do not use for rectangleGraphics
cesiumEngine.utils.isCesiumRectangleValid = function (rectangle)
{
    var isValid = true;

    try
    {
        // check if rectangle is valid before rendering on the map. The map crashes if the rectangle is invalid.
        Cesium.Rectangle.validate(new Cesium.Rectangle(rectangle.west, rectangle.south, rectangle.east, rectangle.north));
    }
    catch (err)
    {
        isValid = false;
    }

    return isValid;
};

cesiumEngine.utils.convertCartographicCoord2GeoJson = function (oCoord)
{
    var oCoordainte = null;

    if (oCoord)
    {
        oCoordainte = [oCoord.longitude.toDeg(), oCoord.latitude.toDeg()];
        if (!isNaN(oCoord.height) && (Math.floor(oCoord.height) > 0))
        {
            oCoordainte.push(Math.floor(oCoord.height));
        }
    }

    return oCoordainte;
};

cesiumEngine.utils.convertCartographicCoordList2GeoJson = function (oCoordList)
{
    var oData = {
        type: 'Point',
        coordinates: []
    },
    iIndex;

    if (!oCoordList || (oCoordList.length === 0))
    {
        return oData;
    }
    if (oCoordList.length === 1)
    {
        oData.coordinates = cesiumEngine.utils.convertCartographicCoord2GeoJson(oCoordList[0]);
    }
    else
    {
        oData.type = 'LineString';
        for (iIndex = 0; iIndex < oCoordList.length; iIndex++)
        {
            oData.coordinates.push(cesiumEngine.utils.convertCartographicCoord2GeoJson(oCoordList[iIndex]));
        }
    }

    return oData;
};


cesiumEngine.utils.validateStringModifierValues = function (modifiers)
{
    if (modifiers)
    {
        //check for empty strings
        for (var property in modifiers)
        {
            if (modifiers.hasOwnProperty(property))
            {
                if (modifiers[property] && typeof modifiers[property] === 'string' && modifiers[property].trim() == "")
                {
                    delete modifiers[property];
                }
            }
        }


        //fix string standard
//        if (modifiers.standard)
//        {
//            switch (modifiers.standard.toLowerCase())
//            {
//                case emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C.toLowerCase():
//                case emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B.toLowerCase():
//                    break;
//                default:
//                    modifiers.standard = emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C;
//            }
//        }
//        else
//        {
//            modifiers.standard = emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C;
//        }
        //fix the heading value
        if (isNaN(parseFloat(modifiers.heading)))
        {
            modifiers.heading = 0;
        }
        else
        {
            modifiers.heading = parseFloat(modifiers.heading, 10);
        }
        //fix depth if it comes as a string instead of a numeric array.
        if (modifiers.altitudeDepth && (typeof modifiers.altitudeDepth === 'string') && !isNaN(parseFloat(modifiers.altitudeDepth.replace("[", "").replace("]", ""))))
        {
            modifiers.altitudeDepth = modifiers.altitudeDepth.replace("[", "");
            modifiers.altitudeDepth = modifiers.altitudeDepth.replace("]", "");
            modifiers.altitudeDepth = modifiers.altitudeDepth.split(',').map(function (item)
            {
                return parseFloat(item, 10);
            });
        }
        //fix dfistance if it comes as a string instead of a numeric array.
        if (modifiers.distance && !isNaN(parseFloat(modifiers.distance)) && (typeof modifiers.distance === 'string'))
        {
            modifiers.distance = modifiers.distance.replace("[", "");
            modifiers.distance = modifiers.distance.replace("]", "");
            modifiers.distance = modifiers.distance.split(',').map(function (item)
            {
                return parseFloat(item, 10);
            });
        }
        //fix azimuth if it comes as a string instead of a numeric array.
        if (modifiers && modifiers.azimuth && !isNaN(parseFloat(modifiers.azimuth)) && (typeof modifiers.azimuth === 'string'))
        {
            modifiers.azimuth = modifiers.azimuth.replace("[", "");
            modifiers.azimuth = modifiers.azimuth.replace("]", "");
            modifiers.azimuth = modifiers.azimuth.split(',').map(function (item)
            {
                return parseFloat(item, 10);
            });
        }
    }
};

/**
 * Determines whether or not the feature is something that should
 * display as a 3d airspace or a simple MIL-STD symbol.
 *
 * @param  {Feature} item A feature to test to see if it can be converted to 3D.  If true,
 * its properties will be modified to contain the attributes needed to display.
 * @return {boolean} Returns true if the symbol can be displayed as a 3D airspace, false if
 * it cannot display as a 3D airspace because either it does not support 3D or it does not have
 * enough information to display.     */
cesiumEngine.utils.is3dSymbol = function (item)
{
    var symbolId,
            result = false,
            coordinatesLength,
            altitudesLength,
            distancesLength,
            symbolCode;

    // Retrieve the symbolCode from the item.
    symbolCode = item.data.symbolCode || item.symbolCode;
    // Get characters 4-9
    symbolId = symbolCode.substring(4, 10);
    //cesiumEngine.utils.validateStringModifierValues(item.properties.modifiers);
    // Compare the symbolId it against a pre-canned list of graphics.  The symbolId is
    // unique to MIL-STD-2525B and MIL-STD-2525C, so we can know for certain that know other
    // symbols use these ids.  Furthermore, the list of symbols here is compatible both
    // between B and C.
    if (symbolId === "ACAI--" || // Airspace Coordination Area Irregular
            symbolId === "ACAR--" || // Airspace Coordination Area Rectangular
            symbolId === "ACAC--" || // Airspace Coordination Area Circular
            symbolId === "AKPC--" || // Kill box circular
            symbolId === "AKPR--" || // Kill box rectangular
            symbolId === "AKPI--" || // Kill box irregular
            symbolId === "ALC---" || // Air corridor  track
            symbolId === "ALM---" || //  track
            symbolId === "ALS---" || // SAAFR track
            symbolId === "ALU---" || // UAV  track
            symbolId === "ALL---" || // Low level transit route  track
            symbolId === "AAR---" || //AAR---
            symbolId === "AAF---" || //AAF---
            symbolId === "AAH---" || //  polygon
            symbolId === "AAM---" || // MEZ polygon
            symbolId === "AAML--" || // LOMEZ polygon
            symbolId === "AAMH--") // polygon
    { // HIMEZ
        // if the symbolId is correct, we also need to check if they have the necessary
        // data availble to make it 3D.  Check the properties.modifiers to see if they have
        // minAlt and maxAlt set.
        if (item.properties && item.properties.modifiers && item.properties.modifiers.altitudeDepth)
        {
            // Check to make sure there are at least 2 items in altitudeDepth field to indicate min and max
            // values for altitude. index 0 is min, index 1 is max.  If there is more than one segment every even
            // index is min, every max value is odd index.
            altitudesLength = item.properties.modifiers.altitudeDepth.length;
            if (altitudesLength > 1)
            {
                // Now check for other requirements for indivdual graphics such as width for
                // air corridors.
                if ((symbolId === "ALC---" || symbolId === "ALM---" || symbolId === "ALS---" ||
                        symbolId === "ALU---" || symbolId === "ALL---") && item.properties.modifiers.distance)
                {
                    distancesLength = item.properties.modifiers.distance.length;
                    // now check to see how many segments this graphic has and see if there
                    // are enough values to render it.  A graphic needs to have  2(n - 1) altitudes w
                    // where n is the number of points.  It must have (n - 1) distances.
                    if (item.data.coordinates)
                    {
                        coordinatesLength = item.data.coordinates.length;
                        if (altitudesLength >= (2 * (coordinatesLength - 1)) &&
                                distancesLength >= (coordinatesLength - 1))
                        {
                            result = true;
                        }
                        else if ((altitudesLength === 2) && (coordinatesLength >= 2) && (distancesLength === 1))
                        {
                            // apply same altitude depth and width to all segments
//                           //Tais takes care of applying the altitudes and distances for this case, so do nothing here and just return true.
                            result = true;
                        }
                    }
                }
                else if ((symbolId === "ACAC--" || symbolId === "AKPC--") && item.properties.modifiers.distance)
                {
                    result = true;
                }
                else if ((symbolId === "ACAR--" || symbolId === "AKPR--") && item.properties.modifiers.distance)
                {
                    result = true;
                }
                else
                {
                    result = true;
                }
            }
        }
    }

    return result;
};

cesiumEngine.utils.MilStdBasicSymbol = {
    MILSTD_AIR_CORRIDOR: "G*G*ALC---****X",
    MILSTD_STANDARD_ARMY_AIRCRAFT_FLIGHT_ROUTE: "G*G*ALS---****X",
    MILSTD_MINIMUM_RISK_ROUTE: "G*G*ALM---****X",
    MILSTD_UBMANNED_AERIAL_VEHICLE_ROUTE: "G*G*ALU---****X",
    MILSTD_LOW_LEVEL_TRANSIT_ROUTE: "G*G*ALL---****X",
    MILSTD_AIRSPACE_COORDINATION_AREA_IRREGULAR: "G*F*ACAI--****X",
    MILSTD_AIRSPACE_COORDINATION_AREA_RECTANGULAR: "G*F*ACAR--****X",
    MILSTD_AIRSPACE_COORDINATION_AREA_CIRCULAR: "G*F*ACAC--****X",
    MILSTD_RESTRICTED_OPERATIONS_ZONE: "G*G*AAR---****X",
    MILSTD_HIGH_DENSITY_AIRSPACE_CONTROL_ZONE: "G*G*AAH---****X",
    MILSTD_MISSILE_ENGAGEMENT_ZONE: "G*G*AAM---****X",
    MILSTD_MISSILE_ENGAGEMENT_ZONE_LOW_ALTITUDE: "G*G*AAML--****X",
    MILSTD_MISSILE_ENGAGEMENT_ZONE_HIGH_ALTITUDE: "G*G*AAMH--****X",
    MILSTD_CRITICAL_FRIENDLY_ZONE_IRREGULAR: "G*F*AZFI--****X",
    MILSTD_CRITICAL_FRIENDLY_ZONE_RECTANGULAR: "G*F*AZFR--****X",
    MILSTD_RELIEF_IN_PLACE: "G*T*R-----****X",
    // Only in 2525B
    MILSTD_FORWARD_AREA_AIR_DEFENSE_ZONE: "G*G*AAF---****X",
    // Same Symbol Code with diff name in 2525C
    MILSTD_SHORT_RANGE_AIR_DEFENSE_ENGAGEMENT_ZONE: "G*G*AAF---****X",
    // Only in 2525B
    MILSTD_KILL_BOX_PURPLE_CIRCULAR: "G*F*AKPC--****X",
    MILSTD_KILL_BOX_PURPLE_RECTANGULAR: "G*F*AKPR--****X",
    MILSTD_KILL_BOX_PURPLE_IRREGULAR: "G*F*AKPI--****X"
};

/**
 * Determines if the symbol is a weather graphic
 *
 * @param strSymbolID
 * @return true if symbolID starts with a "W"
 */
cesiumEngine.utils.isWeather = function (strSymbolID)
{
    try
    {
        var blRetVal = strSymbolID.substring(0, 1).equals("W");
        return blRetVal;
    }
    catch (ex)
    {
    }
    return false;
};

/**
 * Determines if the symbol is a tactical graphic
 *
 * @param strSymbolID
 * @return true if symbol starts with "G", or is a weather graphic, or a
 * bridge graphic
 */
cesiumEngine.utils.isTacticalGraphic = function (strSymbolID)
{
    try
    {
        if (strSymbolID == null) // Error handling
        {
            return false;
        }
        if ((strSymbolID.substring(0, 1).equals("G")) || (isWeather(strSymbolID)) || isEMSNaturalEvent(strSymbolID))
        {
            return true;
        }
    }
    catch (ex)
    {
    }
    return false;
};

/**
 * Determines if a symbol is an EMS Natural Event
 *
 * @param strSymbolID
 * @return
 */
cesiumEngine.utils.isEMSNaturalEvent = function (strSymbolID)
{
    var blRetVal = false;

    try
    {
        if (strSymbolID.charAt(0) == 'E' && strSymbolID.charAt(2) == 'N')
        {
            blRetVal = true;
        }
    }
    catch (ex)
    {
    }

    return blRetVal;
};

/**
 * @name getBasicSymbolID
 *
 * @desc Returns a formatted string that has only the necessary static
 * characters needed to draw a symbol. For instance
 * GetBasicSymbolID("GFTPGLB----K---") returns "G*T*GLB---****X" NOTE: only
 * works for tactical graphics
 *
 * @param strSymbolID - IN - A 15 character MilStd code
 * @return A properly formated basic symbol ID
 */
cesiumEngine.utils.getBasicSymbolID = function (strSymbolID)
{
    try
    {
        var strRetSymbolID = undefined;
        if ((strSymbolID != null) && (strSymbolID.length == 15))
        {
            // Check to make sure it is a tacitcal graphic symbol.
            if (cesiumEngine.utils.isWeather(strSymbolID))
            {
                return strSymbolID;
            }
            else if (cesiumEngine.utils.isTacticalGraphic(strSymbolID) == true)
            {
                strRetSymbolID = strSymbolID.substring(0, 1)
                        + "*"
                        + strSymbolID.substring(2, 3)
                        + "*"
                        + strSymbolID.substring(4, 10)
                        + "****"
                        + "X";
                if (cesiumEngine.utils.isEMSNaturalEvent(strSymbolID) == true)
                {
                    strRetSymbolID = strRetSymbolID.substring(0, 14) + "*";
                }
                return strRetSymbolID;
            }
            else
                    // Don't do anything for bridge symbols
                    {
                        return strSymbolID;
                    }
        }
        else
        {
            return strSymbolID;
        }
    }
    catch (ex)
    {
    }

    return "";
};

cesiumEngine.utils.AirspaceShapeEnumType = {
    SHAPE3D_CYLINDER: "CYLINDER-------",
    SHAPE3D_ORBIT: "ORBIT----------",
    SHAPE3D_ROUTE: "ROUTE----------",
    SHAPE3D_POLYGON: "POLYGON--------",
    SHAPE3D_RADARC: "RADARC---------",
    SHAPE3D_POLYARC: "POLYARC--------",
    SHAPE3D_CAKE: "CAKE-----------",
    SHAPE3D_TRACK: "TRACK----------",
    SHAPE3D_SPHERE: "SPHERE---------",
    SHAPE3D_CURTAIN: "CURTAIN--------"
};

cesiumEngine.utils.AltitudeModeEnumType = {
    /**
     * Altitude mode that clamps object to ground regardless of the elevation at that given point
     */
    ALTITUDE_CLAMP_TO_GROUND: "clampToGround",
    /**
     * Altitude mode that measures elevation above the underlying terrain (AGL)
     */
    ALTITUDE_RELATIVE_TO_GROUND: "relativeToGround",
    /**
     * Altitude mode that measures elevation above mean sea level (MSL)
     */
    ALTITUDE_ABSOLUTE: "absolute"
};

cesiumEngine.utils.OrbitType = {
    EFT: "Left",
    CENTER: "Center",
    RIGHT: "Right"
};

cesiumEngine.utils.AirspaceParameterEnumType = {
    AIRSPACE_FILL_COLOR: "fillColor",
    AIRSPACE_LINE_COLOR: "lineColor",
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
    AIRSPACE_ORBIT_TURN: "turn",
    AIRSPACE_FILL_COLOR_DFLT: "FFAAFFAA",
    AIRSPACE_LINE_COLOR_DFLT: "FFAAAAAA",
    AIRSPACE_LEFT_WIDTH_DFLT: 2500.0,
    AIRSPACE_RIGHT_WIDTH_DFLT: 2500.0,
    AIRSPACE_WIDTH_DFLT: 5000.0,
    AIRSPACE_HEIGHT_DFLT: 5000.0,
    AIRSPACE_ALTITUDE_DFLT: 5000.0,
    AIRSPACE_ALTITUDE_MODE_DFLT: cesiumEngine.utils.AltitudeModeEnumType.ALTITUDE_RELATIVE_TO_GROUND,
    AIRSPACE_MIN_ALTITUDE_DFLT: 0.0,
    AIRSPACE_MAX_ALTITUDE_DFLT: 5000.0,
    AIRSPACE_INNER_RADIUS_DFLT: 2500.0,
    AIRSPACE_RADIUS_DFLT: 5000.0,
    AIRSPACE_LEFT_AZIMUTH_DFLT: 0.0,
    AIRSPACE_RIGHT_AZIMUTH_DFLT: 90.0,
    AIRSPACE_ORBIT_TURN_DFLT: cesiumEngine.utils.OrbitType.CENTER
};

cesiumEngine.utils.FeatureType = {
    GEOJSON: "geojson",
    KML: "kml",
    AIRSPACE: "airspace",
    MILSTD: "milstd",
    URL: "URL",
    COMPOUND_OBJECT_LAYER: "compound_object_layer",
    IMAGE: "image",
    CIRCLE: "circle",
    WMS: "wms",
    WFS: "wfs",
    GOOGLE: "google",
    ARCGIS: "arcgis",
    KML_URL: "kml_url",
    WMS_LAYER: "wms_layer",
    WMS_ELEVATION_LAYER: "wms_elevation_layer",
    UNKNOWN: "unknown"
};

cesiumEngine.utils.getAirspaceTypeBasedOnSymbolCode = function (symbolCode)
{
    var airspaceType = null;

    switch (cesiumEngine.utils.getBasicSymbolID(symbolCode))
    {
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_AIRSPACE_COORDINATION_AREA_IRREGULAR:
            //                        TACTICAL GRAPHICS
            //FIRE SUPPORT
            //AREAS
            //COMMAND & CONTROL AREAS
            //AIRSPACE COORDINATION AREA (ACA)
            //IRREGULAR
            // at least 3 points required (irtregular shape)
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_POLYGON;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_AIRSPACE_COORDINATION_AREA_RECTANGULAR:
            //TACTICAL GRAPHICS
            //FIRE SUPPORT
            //AREAS
            //COMMAND & CONTROL AREAS
            //AIRSPACE COORDINATION AREA (ACA)
            //RECTANGULAR
            //This graphic requires two anchor points and a width,
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_ROUTE;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_AIRSPACE_COORDINATION_AREA_CIRCULAR:
            //                        TACTICAL GRAPHICS
            //                        FIRE SUPPORT
            //                        AREAS
            //                        COMMAND & CONTROL AREAS
            //                        AIRSPACE COORDINATION AREA
            //                        (ACA)
            //                        CIRCULAR
            //                      Anchor Points. This graphic requires one (1)
            //                      anchor point and a radius. Point 1 defines the
            //                      center point of the graphic. (CIRCLE)
            //This graphic requires one (1) anchor oint and a radius
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_CYLINDER;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_AIR_CORRIDOR:
            //                         TACTICAL GRAPHICS
            //                         COMMAND AND CONTROL AND
            //                         GENERAL MANEUVER
            //                         AVIATION
            //                         LINES
            //                         AIR CORRIDOR
            //                        Anchor Points. This graphic may contain
            //                        multiple segments. Each segment requires 2
            //                        anchor points. Point numbers that define the
            //                        trace of the segment are sequential beginning
            //                        with point # 1, in increments of 1, up to a max of
            //                        99 points.
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_TRACK;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_MINIMUM_RISK_ROUTE:
            //                        TACTICAL GRAPHICS
            //                        COMMAND AND CONTROL AND
            //                        GENERAL MANEUVER
            //                        AVIATION
            //                        LINES
            //                        MINIMUM RISK ROUTE (MRR)
            //                        This graphic may contain
            //                        multiple segments. Each segment requires 2
            //                        anchor points. Point numbers that define the
            //                        trace of the segment are sequential beginning
            //                        with point # 1, in increments of 1, up to a max of
            //                        99 points. Each anchor point defines the
            //                        endpoint of a segmentâ€™s centerline. The anchor
            //                        points are Air Control Points
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_TRACK;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_STANDARD_ARMY_AIRCRAFT_FLIGHT_ROUTE:
            //                        TACTICAL GRAPHICS
            //                        COMMAND AND CONTROL AND
            //                        GENERAL MANEUVER
            //                        AVIATION
            //                        LINES
            //                        STANDARD-USE ARMY AIRCRAFT
            //                        FLIGHT ROUTE (SAAFR)
            ////                      Anchor Points. This graphic may contain
            //                        multiple segments. Each segment requires 2
            //                        anchor points. Point numbers that define the
            //                        trace of the segment are sequential beginning
            //                        with point # 1, in increments of 1, up to a max of
            //                        99 points.
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_TRACK;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_UBMANNED_AERIAL_VEHICLE_ROUTE:
            //                        TACTICAL GRAPHICS
            //                        COMMAND AND CONTROL AND
            //                        GENERAL MANEUVER
            //                        AVIATION
            //                        LINES
            //                        UNMANNED AIRCRAFT (UA)
            //                        ROUTE
            ////                      Anchor Points. This graphic may contain
            //                        multiple segments. Each segment requires 2
            //                        anchor points. Point numbers that define the
            //                        trace of the segment are sequential beginning
            //                        with point # 1, in increments of 1, up to a max of
            //                        99 points.
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_TRACK;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_LOW_LEVEL_TRANSIT_ROUTE:
            ////                      TACTICAL GRAPHICS
            //                        COMMAND AND CONTROL AND
            //                        GENERAL MANEUVER
            //                        AVIATION
            //                        LINES
            //                        LOW LEVEL TRANSIT ROUTE
            //                        (LLTR)
            ////                      Anchor Points. This graphic may contain
            //                        multiple segments. Each segment requires 2
            //                        anchor points. Point numbers that define the
            //                        trace of the segment are sequential beginning
            //                        with point # 1, in increments of 1, up to a max of
            //                        99 points.
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_TRACK;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_RESTRICTED_OPERATIONS_ZONE:
            //                        TACTICAL GRAPHICS
            //                        COMMAND AND CONTROL AND
            //                        GENERAL MANEUVER
            //                        AVIATION
            //                        AREAS
            //                        RESTRICTED OPERATIONS ZONE
            //                        (ROZ)
            //                        Anchor Points. This graphic requires at least
            //                        three anchor points to define the boundary of the
            //                        area. Add as many points as necessary to
            //                        accurately reflect the areaâ€™s size and shape.
            // 2 points required (rectangle)
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_POLYGON;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_SHORT_RANGE_AIR_DEFENSE_ENGAGEMENT_ZONE:
            //                      TACTICAL GRAPHICS
            //                        COMMAND AND CONTROL AND
            //                        GENERAL MANEUVER
            //                        AVIATION
            //                        AREAS
            //                        SHORT-RANGE AIR DEFENSE
            //                        ENGAGEMENT ZONE (SHORADEZ)
            //                        Anchor Points. This graphic requires at least
            //                        three anchor points to define the boundary of the
            //                        area. Add as many points as necessary to
            //                        accurately reflect the areaâ€™s size and shape.
            // 2 points required (rectangle)
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_POLYGON;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_HIGH_DENSITY_AIRSPACE_CONTROL_ZONE:
            ////                      TACTICAL GRAPHICS
            //                        COMMAND AND CONTROL AND
            //                        GENERAL MANEUVER
            //                        AVIATION
            //                        AREAS
            //                        HIGH DENSITY AIRSPACE
            //                        CONTROL ZONE (HIDACZ)
            //                        Anchor Points. This graphic requires at least
            //                        three anchor points to define the boundary of the
            //                        area. Add as many points as necessary to
            //                        accurately reflect the areaâ€™s size and shape.
            // 2 points required (rectangle)
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_POLYGON;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_MISSILE_ENGAGEMENT_ZONE:
            //                    TACTICAL GRAPHICS
            //                    COMMAND AND CONTROL AND
            //                    GENERAL MANEUVER
            //                    AVIATION
            //                    AREAS
            //                    MISSILE ENGAGEMENT ZONE
            //                    (MEZ)
            //                        Anchor Points. This graphic requires at least
            //                        three anchor points to define the boundary of the
            //                        area. Add as many points as necessary to
            //                        accurately reflect the areaâ€™s size and shape.
            // 2 points required (rectangle)
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_POLYGON;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_MISSILE_ENGAGEMENT_ZONE_LOW_ALTITUDE:
            //                    TACTICAL GRAPHICS
            //                        COMMAND AND CONTROL AND
            //                        GENERAL MANEUVER
            //                        AVIATION
            //                        AREAS
            //                        MISSILE ENGAGEMENT ZONE (MEZ)
            //                        LOW ALTITUDE MEZ
            //                        Anchor Points. This graphic requires at least
            //                        three anchor points to define the boundary of the
            //                        area. Add as many points as necessary to
            //                        accurately reflect the areaâ€™s size and shape.
            // 2 points required (rectangle)
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_POLYGON;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_MISSILE_ENGAGEMENT_ZONE_HIGH_ALTITUDE:
            //                    TACTICAL GRAPHICS
            //                        COMMAND AND CONTROL AND
            //                        GENERAL MANEUVER
            //                        AVIATION
            //                        AREAS
            //                        MISSILE ENGAGEMENT ZONE (MEZ)
            //                        HIGH ALTITUDE MEZ
            //                        Anchor Points. This graphic requires at least
            //                        three anchor points to define the boundary of the
            //                        area. Add as many points as necessary to
            //                        accurately reflect the areaâ€™s size and shape.
            // 2 points required (rectangle)
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_POLYGON;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_KILL_BOX_PURPLE_CIRCULAR:
            //                       TACTICAL GRAPHICS
            //                        FIRE SUPPORT
            //                        AREAS
            //                        KILL BOX
            //                        PURPLE
            //                        CIRCULAR
            //                     Anchor Points. This graphic requires one (1)
            //                     anchor point and a radius. Point 1 defines the
            //                     center point of the graphic.
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_CYLINDER;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_KILL_BOX_PURPLE_RECTANGULAR:
            // 2 points required (rectangle)
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_ROUTE;
            break;
        case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_KILL_BOX_PURPLE_IRREGULAR:
            //                   TACTICAL GRAPHICS
            //                    FIRE SUPPORT
            //                    AREAS
            //                    KILL BOX
            //                    PURPLE
            //                    IRREGULAR
            //                        Anchor Points. This graphic requires at least
            //                        three anchor points to define the boundary of the
            //                        area. Add as many points as necessary to
            //                        accurately reflect the areaâ€™s size and shape.
            // 2 points required (rectangle)
            airspaceType = cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_POLYGON;
            break;
        default:
            break;
    }
    return airspaceType;
};

cesiumEngine.utils.RendererSettings = {
    Symbology_2525Bch2_USAS_13_14: 0,
    Symbology_2525C: 1
};

cesiumEngine.utils.MilStdSymbologyModifiers = {
    QUANTITY: "quantity",
    REDUCED_OR_REINFORCED: "reinforcedOrReduced",
    STAFF_COMMENTS: "staffComments",
    ADDITIONAL_INFO_1: "additionalInfo1",
    ADDITIONAL_INFO_2: "additionalInfo2",
    ADDITIONAL_INFO_3: "additionalInfo3",
    EVALUATION_RATING: "evaluationRating",
    COMBAT_EFFECTIVENESS: "combatEffectiveness",
    SIGNATURE_EQUIPMENT: "signatureEquipment",
    HIGHER_FORMATION: "higherFormation",
    HOSTILE: "hostile",
    IFF_SIF: "iffSif",
    DIRECTION_OF_MOVEMENT: "directionOfMovement",
    OFFSET_INDICATOR: "offsetIndicator",
    UNIQUE_DESIGNATOR_1: "uniqueDesignation1",
    UNIQUE_DESIGNATOR_2: "uniqueDesignation2",
    EQUIPMENT_TYPE: "equipmentType",
    DATE_TIME_GROUP: "dateTimeGroup1",
    DATE_TIME_GROUP_2: "dateTimeGroup2",
    ALTITUDE_DEPTH: "altitudeDepth",
    LOCATION: "location",
    SPEED: "speed",
    SPECIAL_C2_HEADQUARTERS: "specialC2Headquarters",
    DISTANCE: "distance",
    AZIMUTH: "azimuth",
    FILL_COLOR: "fillColor",
    LINE_COLOR: "lineColor",
    X_OFFSET: "xOffset",
    X_UNITS: "xUnits",
    Y_OFFSET: "yOffset",
    Y_UNITS: "yUnits",
    SIZE: "size",
    LINE_THICKNESS: "lineThickness",
    HEADING: "heading"
};

cesiumEngine.utils.convertCartographicsToSECRendererCoordsString = function (cartographics)
{
    var coordString = "",
            index;

    for (index = 0; index < cartographics.length; index += 1)
    {
        var cartographic = cartographics[index];
        if (coordString === "")
        {
            coordString = cartographic.longitude.toDeg() + "," + cartographic.latitude.toDeg() + "," + cartographic.height;
        }
        else
        {
            coordString = coordString + " " + cartographic.longitude.toDeg() + "," + cartographic.latitude.toDeg() + "," + cartographic.height;
        }
    }

    return coordString;
};

cesiumEngine.utils.convertTaisCoordsDegreesToCartographicArray = function (AirspacePoints)
{
    var cartographics = [],
            AirspacePoint,
            index;

    for (index = 0; index < AirspacePoints.length; index++)
    {
        var AirspacePoint = AirspacePoints[index];
        cartographics.push(new Cesium.Cartographic.fromDegrees(AirspacePoint.Longitude, AirspacePoint.Latitude, 0));
    }

    return cartographics;
};

cesiumEngine.utils.convertTaisTurnTypeToEmp = function (taisTurnType)
{
    var empTurnMode = 'Right'; // right by default or (TAIS: Above Ground Level),

    if (Cesium.defined(taisTurnType))
    {
        switch (taisTurnType)
        {
            case 0 :
                empTurnMode = 'Center';
                break;
            case 1 :
                empTurnMode = 'Right';
                break;
            case 2 :
                empTurnMode = 'Left';
                break;
            default:
                empTurnMode = 'Right';
        }
    }

    return empTurnMode;
};

cesiumEngine.utils.convertTaisAltitudeTypeToEmp = function (taisAltitudeType)
{
    var empAltitudeMode = 'relativeToGround'; // relativeToGround by default or (TAIS: Above Ground Level),

    if (Cesium.defined(taisAltitudeType))
    {
        switch (taisAltitudeType)
        {
            case 2 :
                empAltitudeMode = 'relativeToGround';// TAIS: Above Ground Level
                break;
            case 1 :
                empAltitudeMode = 'clampToGround'; //TAIS: Flight Level
                break;
            case 0 :
                empAltitudeMode = 'absolute'; // TAIS: Above Mean Sea Level (AMSL)
                break;
            default:
                empAltitudeMode = 'relativeToGround';
        }
    }

    return empAltitudeMode;
};

cesiumEngine.utils.convertEmpToTaisAirspace = function (empArg)
{
    var legs = [],
            airspacePoints = [],
            airspaceTaisShapeTypeValue = 0,
            rgbaFillColor,
            minAlt = 0,
            maxAlt = 0; // cylinder as default

    airspaceTaisShapeTypeValue = cesiumEngine.utils.getEmpToTaisAirspaceShapeTypeValue(empArg.symbolCode);
    legs = cesiumEngine.utils.getEmpToTaisAirspaceLegs(empArg, airspaceTaisShapeTypeValue);
    airspacePoints = cesiumEngine.utils.convertCoordsDegreesToTaisCoordinateArray(empArg);
    if (empArg.properties && empArg.properties.attributes)
    {
        if (empArg.properties.attributes[0].minAlt && empArg.properties.attributes[0].maxAlt)
        {
            minAlt = empArg.properties.attributes[0].minAlt;
            maxAlt = empArg.properties.attributes[0].maxAlt;
        }
    }
    //Modifies an ARGB color string to ABGR for use Google
    if (empArg.properties.fillColor)
    {
        rgbaFillColor = cesiumEngine.utils.hexToRGB(empArg.properties.fillColor);
    }
    else
    {
        rgbaFillColor = cesiumEngine.utils.hexToRGB("FF" + EmpCesiumConstants.propertyDefaults.FILL_COLOR_HEX);
    }

    return {
        Name: empArg.name,
        Id: empArg.coreId,
        isUserDefineColor: true,
        Purpose: null,
        Instructions: null,
        ControlAuthority: null,
        RadioiFRequency: null,
        RadioFrequencyUnits: null,
        FrequencyDesignator: null,
        AirspaceState: 4, //approved
        AirspaceStatus: 3, // ? missing enum
        History: [], // "History":[{"Id":"209c3586-b188-4ff6-b7e6-5df10f296004","WhenModified":"2015-06-19T18:47:12.7831786Z","WhoModified":"TAIS","Description":"Airspace updated"}],
        AncestryInfo: [],
        SymbolCode: empArg.symbolCode,
        MinTerrainAltitude: minAlt, //ojo - EMP is not specifiying an overal min and max for the airspace. THis value here is from a leg.
        MaxTerrainAltitude: maxAlt, //ojo - EMP is not specifiying an overal min and max for the airspace. THis value here is from a leg.
        AirspaceShapeType: airspaceTaisShapeTypeValue,
        LastModifiedTime: null, // "2015-06-19T18:47:09.9907786Z"
        AirspaceTrackConflicts: 0,
        AirspaceTypeUsage: {UserDefinedUsage: "", AirspaceType: 6, AirspaceUsage: 600}, // {"UserDefinedUsage":"","AirspaceType":6,"AirspaceUsage":600}
        ActiveTimes: [], // [{"StartTime":"2015-06-19T18:44:00Z","EndTime":"2015-07-02T19:44:00Z"}]
        Color: rgbaFillColor, // from enum - Aqua
        Declassification: null,
        AirspaceLegs: legs,
        ExerciseOrOperationData: null, // {"ExerciseData":null,"OperationData":{"Codeword":"ASDF","Plan":"","Option1":"","Option2":""},"ExerciseOrOperationIndicator":0}
        PointOfContact: null, // {"Name":"","Rank":"","Unit":"","UnitCallSign":null,"Location":null,"LocationName":"","NonSecurePhoneNumber":"","SecurePhoneNumber":"","RadioFrequency":null,"RadioFrequencyUnits":null,"RadioDesignator":"","FrequencyNumber":null,"EmailAddress":"","FrequencyMode":0,"UnitType":0,"LocationType":1}
        AirspacePoints: airspacePoints,
        AirspaceContainers: [], // ["7319cd8c-6325-4b26-9eba-2c30c6b11ce7","be771d62-fbf5-4407-b82a-4ee372a9cd5a"]
        Geometry: null,
        AirspaceAirTrackConflictSetting: 0,
        AirspaceConflict: null,
        AirspaceActiveTime: null,
        ContainedBy: null,
        UserGroups: [],
        TemplateName: null,
        visible: empArg.visible,
        empArg: empArg
    };
};

cesiumEngine.utils.hexToRGB = function (h)
{
    var a, r, g, b;

    if (!h)
    {
        return [1, 1, 1];
    }
    var cutHex = function (h)
    {
        return (h.charAt(0) === "#") ? h.substring(1, 7) : h;
    };
    var hModified = cutHex(h);
    if (hModified.length > 6)
    {
        a = parseInt((hModified).substring(0, 2), 16) / 255.0;
        r = parseInt((hModified).substring(2, 4), 16) / 255.0;
        g = parseInt((hModified).substring(4, 6), 16) / 255.0;
        b = parseInt((hModified).substring(6, 8), 16) / 255.0;
    }
    else
    {
        a = parseInt('FF', 16) / 255.0;
        r = parseInt((cutHex(h)).substring(0, 2), 16) / 255.0;
        g = parseInt((cutHex(h)).substring(2, 4), 16) / 255.0;
        b = parseInt((cutHex(h)).substring(4, 6), 16) / 255.0;
    }

    return {
        r: r,
        g: g,
        b: b,
        a: a
    };
};

cesiumEngine.utils.convertCoordsDegreesToTaisCoordinateArray = function (args)
{
    var coordArray = [],
            i;

    if (args.data && args.data.type)
    {
        if (args.data.type === "Point")
        {
            if (args.coordinates)
            {
                var coordDegrees = args.coordinates;
                var airspacePoint = new AirspacePoint();
                airspacePoint.Latitude = coordDegrees[1];
                airspacePoint.Longitude = coordDegrees[0];
                coordArray.push(airspacePoint);
            }
        }
        else if (args.data.type === "LineString")
        {
            for (i = 0; i < args.coordinates.length; i += 1)
            {
                var coordDegrees = args.coordinates[i];
                var airspacePoint = new AirspacePoint();
                airspacePoint.Latitude = coordDegrees[1];
                airspacePoint.Longitude = coordDegrees[0];
                coordArray.push(airspacePoint);
            }
        }
        else if (args.data.type === "Polygon")
        {
            for (i = 0; i < args.coordinates.length; i += 1)
            {
                var coordDegrees = args.coordinates[i];
                var airspacePoint = new AirspacePoint();
                airspacePoint.Latitude = coordDegrees[1];
                airspacePoint.Longitude = coordDegrees[0];
                coordArray.push(airspacePoint);
            }
        }
    }

    return coordArray;
};

cesiumEngine.utils.convertEmpAltitudeTypeToTais = function (empAltitudeType)
{
    var taisAltitudeMode = 2; // relativeToGround by default or (TAIS: Above Ground Level),

    if (Cesium.defined(empAltitudeType))
    {
        switch (empAltitudeType)
        {
            case "relativetoGround" :
                taisAltitudeMode = 2;// TAIS: Above Ground Level
                break;
            case "clampToGround" :
                taisAltitudeMode = 1; //TAIS: Flight Level
                break;
            case "absolute" :
                taisAltitudeMode = 0; // TAIS: Above Mean Sea Level (AMSL)
                break;
            default:
                taisAltitudeMode = 2;
        }
    }

    return taisAltitudeMode;
};

cesiumEngine.utils.convertEmpTurnTypeToTais = function (empTurnType)
{
    var taisTurnMode = 1; // right by default or (TAIS: Above Ground Level),

    if (Cesium.defined(empTurnType))
    {
        switch (empTurnType.toLowerCase())
        {
            case "center" :
                taisTurnMode = 0;// TAIS: center
                break;
            case "right" :
                taisTurnMode = 1; //TAIS: right
                break;
            case "left" :
                taisTurnMode = 2; // TAIS: left
                break;
            default:
                taisTurnMode = 1;
        }
    }

    return taisTurnMode;
};

cesiumEngine.utils.getEmpToTaisAirspaceLegs = function (empArg, airspaceTaisShapeTypeValue)
{
    var legs = [],
            lowerAltitudeType = 2, // relativeToGround by default or (TAIS: Above Ground Level),
            upperAltitudeType = 2, // relativeToGround by default (TAIS: Above Ground Level),
            airspaceTurnType = 1;// right by default;,

    if (empArg.properties && empArg.properties.attributes)
    {
        for (var index = 0; index < empArg.properties.attributes.length; index++)
        {
            if (empArg.properties.attributes[index].minAltitudeMode)
            {
                lowerAltitudeType = cesiumEngine.utils.convertEmpAltitudeTypeToTais(empArg.properties.attributes[index].minAltitudeMode);
            }
            else
            {
                lowerAltitudeType = cesiumEngine.utils.convertEmpAltitudeTypeToTais(empArg.properties.attributes[index].altitudeMode);
            }
            upperAltitudeType = cesiumEngine.utils.convertEmpAltitudeTypeToTais(empArg.properties.attributes[index].altitudeMode);
            //turn type
            airspaceTurnType = cesiumEngine.utils.convertEmpTurnTypeToTais(empArg.properties.attributes[index].turn);
            switch (airspaceTaisShapeTypeValue)
            {
                case 0: // cylinnder
                    legs.push(
                    {
                        AltitudeRange: {
                            LowerAltitudeType: upperAltitudeType, //2, // Above Ground Level(AGL)
                            UpperAltitudeType: lowerAltitudeType, //2,
                            LowerAltitude: empArg.properties.attributes[index].minAlt,
                            UpperAltitude: empArg.properties.attributes[index].maxAlt
                        },
                        WidthLeft: null,
                        WidthRight: null,
                        Radius: empArg.properties.attributes[index].radius,
                        OuterRadius: null,
                        AzimuthLeft: null,
                        AzimuthRight: null,
                        AirspaceTurnType: 0, // Center
                        AirspaceSubLeg: [],
                        HasTerrainConflict: 4 //? there is no 4 value in CONFLICT_TYPE enum.
                    });
                    break;
                case 2:// ORBIT
                case 7:// ROUTE
                    legs.push(
                    {
                        AltitudeRange: {
                            LowerAltitudeType: upperAltitudeType, //2, // Above Ground Level(AGL)
                            UpperAltitudeType: lowerAltitudeType, //2,
                            LowerAltitude: empArg.properties.attributes[index].minAlt,
                            UpperAltitude: empArg.properties.attributes[index].maxAlt
                        },
                        WidthLeft: empArg.properties.attributes[index].width,
                        WidthRight: null,
                        Radius: null,
                        OuterRadius: null,
                        AzimuthLeft: null,
                        AzimuthRight: null,
                        AirspaceTurnType: airspaceTurnType, //1, // right
                        AirspaceSubLeg: [],
                        HasTerrainConflict: 4 //? there is no 4 value in CONFLICT_TYPE enum.
                    });
                    break;
                case 4:// POLYARC
                    legs.push(
                    {
                        AltitudeRange: {
                            LowerAltitudeType: upperAltitudeType, //2, // Above Ground Level(AGL)
                            UpperAltitudeType: lowerAltitudeType, //2,
                            LowerAltitude: empArg.properties.attributes[index].minAlt,
                            UpperAltitude: empArg.properties.attributes[index].maxAlt
                        },
                        WidthLeft: null,
                        WidthRight: null,
                        Radius: empArg.properties.attributes[index].radius,
                        OuterRadius: null,
                        AzimuthLeft: empArg.properties.attributes[index].leftAzimuth,
                        AzimuthRight: empArg.properties.attributes[index].rightAzimuth,
                        AirspaceTurnType: 0, // Center
                        AirspaceSubLeg: [],
                        HasTerrainConflict: 4 //? there is no 4 value in CONFLICT_TYPE enum.
                    });
                    break;
                case 1: // CURTAIN
                case 5: // POLYGON
                    legs.push(
                    {
                        AltitudeRange: {
                            LowerAltitudeType: upperAltitudeType, //2, // Above Ground Level(AGL)
                            UpperAltitudeType: lowerAltitudeType, //2,
                            LowerAltitude: empArg.properties.attributes[index].minAlt,
                            UpperAltitude: empArg.properties.attributes[index].maxAlt
                        },
                        WidthLeft: null,
                        WidthRight: null,
                        Radius: null,
                        OuterRadius: null,
                        AzimuthLeft: null,
                        AzimuthRight: null,
                        AirspaceTurnType: 0, // Center
                        AirspaceSubLeg: [],
                        HasTerrainConflict: 4 //? there is no 4 value in CONFLICT_TYPE enum.
                    });
                    break;
                case 6:// radarc
                    legs.push(
                    {
                        AltitudeRange: {
                            LowerAltitudeType: upperAltitudeType, //2, // Above Ground Level(AGL)
                            UpperAltitudeType: lowerAltitudeType, //2,
                            LowerAltitude: empArg.properties.attributes[index].minAlt,
                            UpperAltitude: empArg.properties.attributes[index].maxAlt
                        },
                        WidthLeft: null,
                        WidthRight: null,
                        Radius: empArg.properties.attributes[index].innerRadius,
                        OuterRadius: empArg.properties.attributes[index].radius,
                        AzimuthLeft: empArg.properties.attributes[index].leftAzimuth,
                        AzimuthRight: empArg.properties.attributes[index].rightAzimuth,
                        AirspaceTurnType: 0, // Center
                        AirspaceSubLeg: [],
                        HasTerrainConflict: 4//? there is no 4 value in CONFLICT_TYPE enum.
                    });
                    break;
                case 8:// track
                    legs.push(
                    {
                        AltitudeRange: {
                            LowerAltitudeType: upperAltitudeType, //2, // Above Ground Level(AGL)
                            UpperAltitudeType: lowerAltitudeType, //2,
                            LowerAltitude: empArg.properties.attributes[index].minAlt,
                            UpperAltitude: empArg.properties.attributes[index].maxAlt
                        },
                        WidthLeft: empArg.properties.attributes[index].leftWidth,
                        WidthRight: empArg.properties.attributes[index].rightWidth,
                        Radius: null,
                        OuterRadius: null,
                        AzimuthLeft: null,
                        AzimuthRight: null,
                        AirspaceTurnType: 1, // right
                        AirspaceSubLeg: [],
                        HasTerrainConflict: 4//? there is no 4 value in CONFLICT_TYPE enum.
                    });
                    break;
            }
        }
    }
    else
    {
        // New draw case. add a default leg
        switch (airspaceTaisShapeTypeValue)
        {
            case 0: // cylinnder
                legs.push(
                {
                    AltitudeRange: {
                        LowerAltitudeType: 2, // Above Ground Level(AGL)
                        UpperAltitudeType: 2,
                        LowerAltitude: 0,
                        UpperAltitude: 10000
                    },
                    WidthLeft: null,
                    WidthRight: null,
                    Radius: 5000,
                    OuterRadius: null,
                    AzimuthLeft: null,
                    AzimuthRight: null,
                    AirspaceTurnType: 0, // Center
                    AirspaceSubLeg: [],
                    HasTerrainConflict: 4 //? there is no 4 value in CONFLICT_TYPE enum.
                });
                break;
            case 2:// ORBIT
            case 7:// ROUTE
                legs.push(
                {
                    AltitudeRange: {
                        LowerAltitudeType: 2, // Above Ground Level(AGL)
                        UpperAltitudeType: 2,
                        LowerAltitude: 0,
                        UpperAltitude: 10000
                    },
                    WidthLeft: 500,
                    WidthRight: null,
                    Radius: null,
                    OuterRadius: null,
                    AzimuthLeft: null,
                    AzimuthRight: null,
                    AirspaceTurnType: 1, // right
                    AirspaceSubLeg: [],
                    HasTerrainConflict: 4 //? there is no 4 value in CONFLICT_TYPE enum.
                });
                break;
            case 4:// POLYARC
                legs.push(
                {
                    AltitudeRange: {
                        LowerAltitudeType: 2, // Above Ground Level(AGL)
                        UpperAltitudeType: 2,
                        LowerAltitude: 0,
                        UpperAltitude: 10000
                    },
                    WidthLeft: null,
                    WidthRight: null,
                    Radius: 5000,
                    OuterRadius: null,
                    AzimuthLeft: 500,
                    AzimuthRight: 500,
                    AirspaceTurnType: 0, // Center
                    AirspaceSubLeg: [],
                    HasTerrainConflict: 4 //? there is no 4 value in CONFLICT_TYPE enum.
                });
                break;
            case 1: // CURTAIN
            case 5: // POLYGON
                legs.push(
                {
                    AltitudeRange: {
                        LowerAltitudeType: 2, // Above Ground Level(AGL)
                        UpperAltitudeType: 2,
                        LowerAltitude: 0,
                        UpperAltitude: 10000
                    },
                    WidthLeft: null,
                    WidthRight: null,
                    Radius: null,
                    OuterRadius: null,
                    AzimuthLeft: null,
                    AzimuthRight: null,
                    AirspaceTurnType: 0, // Center
                    AirspaceSubLeg: [],
                    HasTerrainConflict: 4 //? there is no 4 value in CONFLICT_TYPE enum.
                });
                break;
            case 6:// radarc
                legs.push(
                {
                    AltitudeRange: {
                        LowerAltitudeType: 2, // Above Ground Level(AGL)
                        UpperAltitudeType: 2,
                        LowerAltitude: 0,
                        UpperAltitude: 10000
                    },
                    WidthLeft: null,
                    WidthRight: null,
                    Radius: 5000,
                    OuterRadius: 10000,
                    AzimuthLeft: 30,
                    AzimuthRight: 90,
                    AirspaceTurnType: 0, // Center
                    AirspaceSubLeg: [],
                    HasTerrainConflict: 4 //? there is no 4 value in CONFLICT_TYPE enum.
                });
                break;
            case 8:// track
                legs.push(
                {
                    AltitudeRange: {
                        LowerAltitudeType: 2, // Above Ground Level(AGL)
                        UpperAltitudeType: 2,
                        LowerAltitude: 0,
                        UpperAltitude: 10000
                    },
                    WidthLeft: 500,
                    WidthRight: 500,
                    Radius: null,
                    OuterRadius: null,
                    AzimuthLeft: null,
                    AzimuthRight: null,
                    AirspaceTurnType: 1, // right
                    AirspaceSubLeg: [],
                    HasTerrainConflict: 4 //? there is no 4 value in CONFLICT_TYPE enum.
                });
                break;
        }
    }

    return legs;
};

cesiumEngine.utils.getEmpToTaisAirspaceShapeTypeValue = function (symbolCode)
{
    var taisAirspaceShapeTypeValue = -99; // means an invalid symbol code

    switch (symbolCode)
    {
        case "CYLINDER-------":
            taisAirspaceShapeTypeValue = 0;
            break;
        case "RADARC---------":
            taisAirspaceShapeTypeValue = 6;
            break;
        case "CURTAIN--------":
            taisAirspaceShapeTypeValue = 1;
            break;
        case "ROUTE----------":
            taisAirspaceShapeTypeValue = 7;
            break;
        case "TRACK----------":
            taisAirspaceShapeTypeValue = 8;
            break;
        case "ORBIT----------":
            taisAirspaceShapeTypeValue = 2;
            break;
        case "POLYGON--------":
            taisAirspaceShapeTypeValue = 5;
            break;
        case "POINT--------":
            taisAirspaceShapeTypeValue = 3;
            break;
        case "POLYARC--------":
            taisAirspaceShapeTypeValue = 4;
            break;
    }

    return taisAirspaceShapeTypeValue;
};

cesiumEngine.utils.getMilStandardGeometryTypeFromAirspaceSymbolCode = function (symbolCode)
{
    var geometryType = "LineString";

    switch (symbolCode)
    {
        case "CYLINDER-------":
            geometryType = "Point";
            break;
        case "RADARC---------":
            //geometryType = 6;
            break;
        case "CURTAIN--------":
            // geometryType = 1;
            break;
        case "ROUTE----------":
            //geometryType = 7;
            break;
        case "TRACK----------":
            //geometryType = 8;
            break;
        case "ORBIT----------":
            // geometryType = 2;
            break;
        case "POLYGON--------":
            //geometryType = 5;
            break;
        case "POINT--------":
            geometryType = "Point";
            break;
        case "POLYARC--------":
            // geometryType = 4;
            break;
    }

    return geometryType;
};

cesiumEngine.utils.convertSymbolStandardToRendererFormat = function (modifiers, isV2Core)
{
    var standard = (isV2Core) ? 0 : 1,
            modValue;

    if (Cesium.defined(modifiers))
    {
        if (Cesium.defined(modifiers.standard))
        {
            modValue = modifiers.standard;
            if (modValue.toLowerCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C.toLowerCase())
            {
                standard = cesiumEngine.utils.RendererSettings.Symbology_2525C;
            }
            else
            {
                standard = cesiumEngine.utils.RendererSettings.Symbology_2525Bch2_USAS_13_14;
            }
        }
    }

    return standard;
};


cesiumEngine.utils.convertSymbolStandardToStringFormat = function (modifiers)
{
    var standard = cesiumEngine.utils.RendererSettings.Symbology_2525C,
            modValue;

    if (modifiers)
    {
        if (Cesium.defined(modifiers.SYMSTD))
        {
            modValue = modifiers.SYMSTD;
            standard = emp.typeLibrary.featureMilStdVersionType.convertToString(modValue);
        }
    }
    return standard;
};

cesiumEngine.utils.convertCartographicArrayToArrayOfObjectsInDegrees = function (args)
{
    var coordArray = [],
            i,
            coordObject = {},
            pointCartographic;

    if (!args.coordinates)
    {
        return  coordArray;
    }
    if (args.type && args.type === "Point")
    {
        if (args.coordinates instanceof Array)
        {
            pointCartographic = args.coordinates[0];
        }
        else
        {
            pointCartographic = args.coordinates;
        }
        var coordObject = {};
        coordObject.lon = Cesium.Math.toDegrees(pointCartographic.longitude);
        coordObject.lat = Cesium.Math.toDegrees(pointCartographic.latitude);
        coordObject.alt = Cesium.Math.toDegrees(pointCartographic.height);
        coordArray.push(coordObject);
        return coordArray;
    }
    else if ((args.type === "LineString") || (args.type === "Polygon"))
    {
        for (i = 0; i < args.coordinates.length; i += 1)
        {
            pointCartographic = args.coordinates[i];
            var coordObject = {};
            coordObject.lon = Cesium.Math.toDegrees(pointCartographic.longitude);
            coordObject.lat = Cesium.Math.toDegrees(pointCartographic.latitude);
            coordObject.alt = Cesium.Math.toDegrees(pointCartographic.height);
            coordArray.push(coordObject);
        }
        return coordArray;
    }
    else if (args.type === "Polygon")
    {
        for (i = 0; i < args.coordinates.length; i += 1)
        {
            pointCartographic = args.coordinates[i];
            var coordObject = {};
            coordObject.lon = Cesium.Math.toDegrees(pointCartographic.longitude);
            coordObject.lat = Cesium.Math.toDegrees(pointCartographic.latitude);
            coordObject.alt = Cesium.Math.toDegrees(pointCartographic.height);
            coordArray.push(coordObject);
        }
        return [coordArray];
    }

    return coordArray;
};

cesiumEngine.utils.convertCoordsDegreesToCartesianArray = function (args)
{
    var coordArray = [],
            i,
            pointArray;

    if (args.type)
    {
        if (args.type === "Point")
        {
            if (args.coordinates)
            {
                var coordDegrees = args.coordinates;
                var pointCartesian3 = Cesium.Cartesian3.fromDegrees(coordDegrees[0], coordDegrees[1], 0);
                coordArray.push(pointCartesian3);
            }
        }
        else if (args.type === "LineString")
        {
            for (i = 0; i < args.coordinates.length; i += 1)
            {
                var coordDegrees = args.coordinates[i];
                var pointCartesian3 = Cesium.Cartesian3.fromDegrees(coordDegrees[0], coordDegrees[1], 0);
                coordArray.push(pointCartesian3);
            }
        }
        else if (args.type === "Polygon")
        {
            if (args.coordinates.length > 0)
            {
                pointArray = args.coordinates[0];
                for (i = 0; i < pointArray.length; i += 1)
                {
                    var coordDegrees = pointArray[i];
                    var pointCartesian3 = Cesium.Cartesian3.fromDegrees(coordDegrees[0], coordDegrees[1], 0);
                    coordArray.push(pointCartesian3);
                }
            }
        }
    }

    return coordArray;
};

cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees = function (args)
{
    var coordArray = [],
            i;

    if (args.type && args.coordinates)
    {
        if (args.type === "Point")
        {
            if (!Array.isArray(args.coordinates))
            {
                var pointCartographic = args.coordinates;
                if (pointCartographic)
                {
                    coordArray.push(Cesium.Math.toDegrees(pointCartographic.longitude));
                    coordArray.push(Cesium.Math.toDegrees(pointCartographic.latitude));
                    coordArray.push(pointCartographic.height);
                }
            }
            else
            {
                for (i = 0; i < args.coordinates.length; i += 1)
                {
                    var pointCartographic = args.coordinates[i];
                    if (pointCartographic)
                    {
                        coordArray.push(Cesium.Math.toDegrees(pointCartographic.longitude));
                        coordArray.push(Cesium.Math.toDegrees(pointCartographic.latitude));
                        coordArray.push(pointCartographic.height);
                    }
                }
            }
        }
        else if (args.type === "LineString" || args.type === "milstd")
        {
            for (i = 0; i < args.coordinates.length; i += 1)
            {
                var pointCartogrtaphicArray = [];
                var pointCartographic = args.coordinates[i];
                if (pointCartographic)
                {
                    pointCartogrtaphicArray.push(Cesium.Math.toDegrees(pointCartographic.longitude));
                    pointCartogrtaphicArray.push(Cesium.Math.toDegrees(pointCartographic.latitude));
                    pointCartogrtaphicArray.push(pointCartographic.height);
                    coordArray.push(pointCartogrtaphicArray);
                }
            }
        }
        else if (args.type === "Polygon")
        {
            for (i = 0; i < args.coordinates.length; i += 1)
            {
                var pointCartogrtaphicArray = [];
                var pointCartographic = args.coordinates[i];
                if (pointCartographic)
                {
                    pointCartogrtaphicArray.push(Cesium.Math.toDegrees(pointCartographic.longitude));
                    pointCartogrtaphicArray.push(Cesium.Math.toDegrees(pointCartographic.latitude));
                    pointCartogrtaphicArray.push(pointCartographic.height);
                    coordArray.push(pointCartogrtaphicArray);
                }
            }
            coordArray = [coordArray];
        }
    }

    return coordArray;
};

cesiumEngine.utils.getMilStandardWidth = function (oModifiers, sBasic3DSymbolCode, iIndex)
{
    var dValue = Number.NaN;

    switch (oModifiers.version)
    {
        case cesiumEngine.utils.RendererSettings.Symbology_2525Bch2_USAS_13_14:
            switch (sBasic3DSymbolCode)
            {
                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_AIR_CORRIDOR:
                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_MINIMUM_RISK_ROUTE:
                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_STANDARD_ARMY_AIRCRAFT_FLIGHT_ROUTE:
                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_UBMANNED_AERIAL_VEHICLE_ROUTE:
                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_LOW_LEVEL_TRANSIT_ROUTE:
                    if (oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.ADDITIONAL_INFO_3])
                    {
                        dValue = oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.ADDITIONAL_INFO_3];
                    }
                    if (Number.isNaN(dValue))
                    {
                        if (oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE])//am value
                        {
                            dValue = oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE][iIndex];
                        }
                    }
                    break;
                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_AIRSPACE_COORDINATION_AREA_RECTANGULAR:
                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_AIRSPACE_COORDINATION_AREA_CIRCULAR:
                    if (oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE])//am value
                    {
                        dValue = oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE][iIndex];
                    }
                    break;
            }
            break;
        case cesiumEngine.utils.RendererSettings.Symbology_2525C:
            if (oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE])//am value
            {
                dValue = oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE][iIndex];
            }
            break;
    }

    return Number(dValue); //(Double.isNaN(dValue)? AirspaceParameterEnumType.AIRSPACE_WIDTH_DFLT: dValue);
};


cesiumEngine.utils.getMilStandardWidthTrack = function (oModifiers, sBasic3DSymbolCode, iIndex, isSymmetricWidth)
{
    var widths = [Number.NaN, Number.NaN];
    var rightWidth = Number.NaN;
    var leftWidth = Number.NaN;

    // switch (oModifiers.version)
    //{
    //  case cesiumEngine.utils.RendererSettings.Symbology_2525Bch2_USAS_13_14:
    //switch (sBasic3DSymbolCode)
    /// {
//                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_AIR_CORRIDOR:
//                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_MINIMUM_RISK_ROUTE:
//                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_STANDARD_ARMY_AIRCRAFT_FLIGHT_ROUTE:
//                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_UBMANNED_AERIAL_VEHICLE_ROUTE:
//                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_LOW_LEVEL_TRANSIT_ROUTE:
//                    if (oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.ADDITIONAL_INFO_3])
//                    {
//                        dValue = oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.ADDITIONAL_INFO_3];
//                    }
//                    if (Number.isNaN(dValue))
//                    {
    if (oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE])//am value
    {
        if (!isSymmetricWidth && oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE].length >= iIndex + 1)
        {
            // sending both right and left widths per segment
            rightWidth = oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE][iIndex];
            leftWidth = oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE][iIndex + 1];
            widths[0] = rightWidth;
            widths[1] = leftWidth;
        }
        else if (isSymmetricWidth && oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE].length >= iIndex)
        {
            // sending only 1 width per segment so both right and left widths are the same size
            rightWidth = oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE][iIndex] / 2;
            leftWidth = oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE][iIndex] / 2;
            widths[0] = rightWidth;
            widths[1] = leftWidth;
        }
    }
    //}
    //break;
    //case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_AIRSPACE_COORDINATION_AREA_RECTANGULAR:
    //case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_AIRSPACE_COORDINATION_AREA_CIRCULAR:
//                    if (oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE])//am value
//                    {
//                        dValue = oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE][iIndex];
//                    }
    //break;
    //}
    //break;
//        case cesiumEngine.utils.RendererSettings.Symbology_2525C:
//            if (oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE])//am value
//            {
//                dValue = oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE][iIndex];
//            }
//            break;


    return  widths; //(Double.isNaN(dValue)? AirspaceParameterEnumType.AIRSPACE_WIDTH_DFLT: dValue);
};

/**
 * @desc Check the symbol standard.
 *
 * @param {type} modifiers - The modifers string
 * @returns {undefined} stadard - The symbology standard
 */
cesiumEngine.utils.checkSymbolStandard = function (modifiers)
{
    var standard = 1,
            modifiersCopy,
            modValue;

    try
    {
        if (modifiers !== undefined && modifiers !== null && modifiers !== "")
        {
            modifiersCopy = typeof (modifiers) === "string" ? JSON.parse(modifiers) : emp.helpers.copyObject(modifiers);
            if (modifiersCopy.hasOwnProperty("modifiers"))
            {
                modifiersCopy = modifiersCopy.modifiers;
            }
            if (modifiersCopy.hasOwnProperty("renderer"))
            {
                modValue = modifiersCopy.renderer;
                if (modValue !== undefined && modValue !== null && modValue !== 0)
                {
                    if (modValue.toLowerCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C.toLowerCase())
                    {
                        standard = cesiumEngine.utils.RendererSettings.Symbology_2525C;
                    }
                    else if (modValue.toLowerCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B.toLowerCase())
                    {
                        standard = cesiumEngine.utils.RendererSettings.Symbology_2525Bch2_USAS_13_14;
                    }
                    else
                    {
                        standard = modValue;
                    }
                }
            }
            else if (modifiersCopy.hasOwnProperty("standard"))
            {
                modValue = modifiersCopy.standard;
                if (modValue !== undefined && modValue !== null && modValue !== 0)
                {
                    if (modValue.toLowerCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C.toLowerCase())
                    {
                        standard = cesiumEngine.utils.RendererSettings.Symbology_2525C;
                    }
                    else if (modValue.toLowerCase().indexOf(emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C.toLowerCase()) > -1)
                    {
                        standard = cesiumEngine.utils.RendererSettings.Symbology_2525C;
                    }
                    else if (modValue.toLowerCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B.toLowerCase())
                    {
                        standard = cesiumEngine.utils.RendererSettings.Symbology_2525Bch2_USAS_13_14;
                    }
                    else if (modValue.toLowerCase().indexOf(emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B.toLowerCase()) > -1)
                    {
                        standard = cesiumEngine.utils.RendererSettings.Symbology_2525Bch2_USAS_13_14;
                    }
                    else
                    {
                        standard = modValue;
                    }
                }
            }
        }
    }
    catch (err)
    {
        console.log("Error getting symbol standard");
    }

    return standard;
};



cesiumEngine.utils.isSymbolStandardSpecified = function (modifiers)
{
    var standard = undefined,
            modifiersCopy,
            modValue;

    try
    {
        if (modifiers !== undefined && modifiers !== null && modifiers !== "")
        {
            modifiersCopy = typeof (modifiers) === "string" ? JSON.parse(modifiers) : emp.helpers.copyObject(modifiers);
            if (modifiersCopy.hasOwnProperty("modifiers"))
            {
                modifiersCopy = modifiersCopy.modifiers;
            }
            if (modifiersCopy.hasOwnProperty("renderer"))
            {
                modValue = modifiersCopy.renderer;
                if (modValue !== undefined && modValue !== null && modValue !== 0)
                {
                    if (modValue.toLowerCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C.toLowerCase())
                    {
                        standard = cesiumEngine.utils.RendererSettings.Symbology_2525C;
                    }
                    else if (modValue.toLowerCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B.toLowerCase())
                    {
                        standard = cesiumEngine.utils.RendererSettings.Symbology_2525Bch2_USAS_13_14;
                    }
                    else
                    {
                        standard = modValue;
                    }
                }
            }
            else if (modifiersCopy.hasOwnProperty("standard"))
            {
                modValue = modifiersCopy.standard;
                if (modValue !== undefined && modValue !== null && modValue !== 0)
                {
                    if (modValue.toLowerCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C.toLowerCase())
                    {
                        standard = cesiumEngine.utils.RendererSettings.Symbology_2525C;
                    }
                    else if (modValue.toLowerCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B.toLowerCase())
                    {
                        standard = cesiumEngine.utils.RendererSettings.Symbology_2525Bch2_USAS_13_14;
                    }
                    else
                    {
                        standard = modValue;
                    }
                }
            }
        }
    }
    catch (err)
    {
        console.log("Error getting symbol standard");
    }

    return (standard !== undefined) ? true : false;
};


cesiumEngine.utils.getMinAltitude = function (oModifiers, iIndex)
{
    var dValue = Number.NaN;

    switch (oModifiers.version)
    {
        case cesiumEngine.utils.RendererSettings.Symbology_2525Bch2_USAS_13_14:
        case cesiumEngine.utils.RendererSettings.Symbology_2525C:
        default:
            if ((oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.ALTITUDE_DEPTH].length % 2) == 0)
            {
                // There is an even number of altitudes.
                dValue = oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.ALTITUDE_DEPTH][iIndex];
            }
            else if (iIndex == 0)
            {
                // There is an odd # of altitudes,
                // The first is implied as 0.
                dValue = 0.0;
            }
            else
            {
                dValue = oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.ALTITUDE_DEPTH][iIndex - 1];
            }
            break;
    }

    return Number(dValue);
};

cesiumEngine.utils.getMaxAltitude = function (oModifiers, iIndex)
{
    var dValue = Number.NaN;

    switch (oModifiers.version)
    {
        case cesiumEngine.utils.RendererSettings.Symbology_2525Bch2_USAS_13_14:
        case cesiumEngine.utils.RendererSettings.Symbology_2525C:
        default:
            if ((oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.ALTITUDE_DEPTH].length % 2) == 0)
            {
                // There is an even number of altitudes.
                dValue = oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.ALTITUDE_DEPTH][iIndex];
            }
            else
            {
                dValue = oModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.ALTITUDE_DEPTH][iIndex - 1];
            }
            break;
    }

    return Number(dValue);
};






/**
 * Sorts an array of coords by distance from a reference coordinate
 *
 * @param        object      reference coordinate e.g. {latitude: 51.5023, longitude: 7.3815}
 * @param        mixed       array or object with coords [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
 * @return       array       ordered array
 */
cesiumEngine.utils.orderCartographicArrayByDistance = function (cartographic, cartographics)
{

    var coordsArray = [];
    if (!cartographic)
    {
        return cartographics;
    }
    if (!cartographics)
    {
        return [];
    }
    for (var coord in cartographics)
    {
        var distance = 0;
        if (!cartographic.equals(cartographics[coord]))
        {
            distance = cartographic.distanceTo(cartographics[coord]);
        }
        else
        {
            distance = 0;
        }
        var augmentedCoord = Object(cartographics[coord]);
        augmentedCoord.distance = distance;
        augmentedCoord.key = coord;

        coordsArray.push(augmentedCoord);

    }

    return coordsArray.sort(function (a, b)
    {
        return a.distance - b.distance;
    });

};





cesiumEngine.utils.transformAirspace3DDrawDataToMilStd3DDrawData = function (oAirspaceDrawData)
{
    var originalFeatureItem,
            milStdSymbologyModifiers,
            originalMilStdSymbologyModifiers,
            sBasic3DSymbolCode,
            attributes,
            milStd3DDrawData = {},
            originalFeatureItem;

    milStd3DDrawData.properties = emp.helpers.copyObject(oAirspaceDrawData.properties);
    if (oAirspaceDrawData.originFeature)
    {
        milStd3DDrawData.originFeature = emp.helpers.copyObject(oAirspaceDrawData.originFeature);
    }
    else
    {
        milStd3DDrawData.originFeature = {};
    }
    milStd3DDrawData.overlayId = oAirspaceDrawData.layerId || oAirspaceDrawData.overlayId;
    milStd3DDrawData.isAirspace = oAirspaceDrawData.isAirspace;
    milStd3DDrawData.editingFeature = oAirspaceDrawData.editingFeature;
    milStd3DDrawData.airspace = oAirspaceDrawData.airspace;
    milStd3DDrawData.coordinates = oAirspaceDrawData.coordinates;
    milStd3DDrawData.geometryType = oAirspaceDrawData.geometryType;
    milStdSymbologyModifiers = milStd3DDrawData.properties.modifiers;
    //original mil std 3d.
    originalFeatureItem = oAirspaceDrawData.airspace.empArg.originalFeatureItem;
    originalMilStdSymbologyModifiers = originalFeatureItem.properties.modifiers;
    milStdSymbologyModifiers.version = cesiumEngine.utils.checkSymbolStandard(milStdSymbologyModifiers);
    originalMilStdSymbologyModifiers.version = milStdSymbologyModifiers.version;
    sBasic3DSymbolCode = cesiumEngine.utils.getBasicSymbolID(originalFeatureItem.symbolCode);
    attributes = oAirspaceDrawData.properties.attributes;
    var altitudeDepths = [];
    var widths = [];
    for (var iIndex = 0; iIndex < attributes.length; iIndex++)
    {
        var attribute = attributes[iIndex];
        if (attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_MIN_ALTITUDE])
        {
            altitudeDepths.push(attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_MIN_ALTITUDE]);
        }
        if (attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_MAX_ALTITUDE])
        {
            altitudeDepths.push(attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_MAX_ALTITUDE]);
        }
        //widths
        if (attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_WIDTH])
        {
            widths.push(attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_WIDTH]);
        }
        if (attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_LEFT_WIDTH])
        {
            widths.push(attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_LEFT_WIDTH] * 2);
        }
        else if (attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_RIGHT_WIDTH])
        {
            widths.push(attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_RIGHT_WIDTH] * 2);
        }
        if (attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_RADIUS])
        {
            widths.push(attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_RADIUS]);
        }
    }
    originalMilStdSymbologyModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.ALTITUDE_DEPTH] = altitudeDepths;
    //widths
    switch (originalMilStdSymbologyModifiers.version)
    {
        case cesiumEngine.utils.RendererSettings.Symbology_2525Bch2_USAS_13_14:
            switch (sBasic3DSymbolCode)
            {
                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_AIR_CORRIDOR:
                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_MINIMUM_RISK_ROUTE:
                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_STANDARD_ARMY_AIRCRAFT_FLIGHT_ROUTE:
                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_UBMANNED_AERIAL_VEHICLE_ROUTE:
                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_LOW_LEVEL_TRANSIT_ROUTE:
                    originalMilStdSymbologyModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.ADDITIONAL_INFO_3] = widths;
                    originalMilStdSymbologyModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE] = widths;
                    break;
                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_AIRSPACE_COORDINATION_AREA_RECTANGULAR:
                case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_AIRSPACE_COORDINATION_AREA_CIRCULAR:
                    originalMilStdSymbologyModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE] = widths;
                    break;
            }
            break;
        case cesiumEngine.utils.RendererSettings.Symbology_2525C:
            originalMilStdSymbologyModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE] = widths;
            break;
    }
    milStd3DDrawData.properties.modifiers = originalMilStdSymbologyModifiers;
    milStd3DDrawData.properties.attributes = undefined;

    return milStd3DDrawData;
};

cesiumEngine.utils.transformMilStdTransactionItemToAirspace3D = function (item)
{
    var airspaceItem,
            originalFeatureItem,
            // bComputeWidth = false,
            dWidth,
            dTemp,
            milStdSymbologyModifiers,
            sBasic3DSymbolCode,
            airspaceItem,
            airspaceSymbolCode,
            isSymmetricWidth = true;

    //cesiumEngine.utils.validateStringModifierValues(item.properties.modifiers);

    originalFeatureItem = item;
    airspaceItem = emp.helpers.copyObject(item);
    airspaceItem.originalFeatureItem = originalFeatureItem;

    if (!cesiumEngine.utils.is3dSymbol(item))
    {
        return airspaceItem;
    }
    milStdSymbologyModifiers = airspaceItem.properties.modifiers;
    milStdSymbologyModifiers.version = cesiumEngine.utils.checkSymbolStandard(milStdSymbologyModifiers);
    sBasic3DSymbolCode = cesiumEngine.utils.getBasicSymbolID(airspaceItem.symbolCode);
    airspaceSymbolCode = cesiumEngine.utils.getAirspaceTypeBasedOnSymbolCode(airspaceItem.symbolCode);
    if (Number.isNaN(cesiumEngine.utils.getMilStandardWidth(milStdSymbologyModifiers, sBasic3DSymbolCode, 0)))
    {
        switch (sBasic3DSymbolCode)
        {
            case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_AIR_CORRIDOR:
            case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_MINIMUM_RISK_ROUTE:
            case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_STANDARD_ARMY_AIRCRAFT_FLIGHT_ROUTE:
            case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_UBMANNED_AERIAL_VEHICLE_ROUTE:
            case cesiumEngine.utils.MilStdBasicSymbol.MILSTD_LOW_LEVEL_TRANSIT_ROUTE:
                // todo: Figure out if this entire if statement is needed
                // bComputeWidth = true;
                break;
        }
    }
    airspaceItem.symbolCode = airspaceSymbolCode;
    airspaceItem.data.symbolCode = airspaceSymbolCode;
    airspaceItem.format = cesiumEngine.utils.FeatureType.AIRSPACE;
    //convert to airspace attributes is next
    if (airspaceItem.properties)
    {
        var iCoordCnt = airspaceItem.data.coordinates.length;
        var iSegCnt = iCoordCnt - 1;
        var dTemp;
        var dWidthRight = cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_WIDTH_DFLT;
        var dWidthLeft = cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_WIDTH_DFLT;
        var dWidth = cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_WIDTH_DFLT;
        var dMinAlt = cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_MIN_ALTITUDE_DFLT;
        var dMaxAlt = cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_MAX_ALTITUDE_DFLT;
        switch (airspaceSymbolCode)
        {
            case cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_POLYGON:
            case cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_ROUTE:
            case cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_CYLINDER:
                iSegCnt = 1;
                break;
            case cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_TRACK:
                iSegCnt = iCoordCnt - 1;
                break;
        }
        airspaceItem.properties.attributes = [];
        for (var iIndex = 0; iIndex < iSegCnt; iIndex++)
        {
            var attribute = {};
            dTemp = cesiumEngine.utils.getMinAltitude(milStdSymbologyModifiers, iIndex * 2);
            if (!Number.isNaN(dTemp))
            {
                dMinAlt = dTemp;
            }
            else if (iIndex === 0)
            {
                dMinAlt = cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_MIN_ALTITUDE_DFLT;
            }
            attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_MIN_ALTITUDE] = Number(dMinAlt);
            dTemp = cesiumEngine.utils.getMaxAltitude(milStdSymbologyModifiers, (iIndex * 2) + 1);
            if (!Number.isNaN(dTemp))
            {
                dMaxAlt = dTemp;
            }
            else if (iIndex === 0)
            {
                dMaxAlt = cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_MAX_ALTITUDE_DFLT;
            }
            attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_MAX_ALTITUDE] = Number(dMaxAlt);
            attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_ALTITUDE_MODE] = airspaceItem.properties[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_ALTITUDE_MODE];
            switch (airspaceSymbolCode)
            {
                case cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_ROUTE:
                case cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_CYLINDER:
                    dTemp = cesiumEngine.utils.getMilStandardWidth(milStdSymbologyModifiers, sBasic3DSymbolCode, iIndex);
                    if (!Number.isNaN(dTemp))
                    {
                        dWidth = dTemp;
                    }
                    switch (airspaceSymbolCode)
                    {
                        case cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_ROUTE:
                            attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_WIDTH] = Number(dWidth);
                            break;
//                        case cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_TRACK:
//                            attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_LEFT_WIDTH] = Number(dWidth / 2.0);
//                            attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_RIGHT_WIDTH] = Number(dWidth / 2.0);
//                            break;
                        case cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_CYLINDER:
                            attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_RADIUS] = Number(dWidth);
                            break;
                    }
                case cesiumEngine.utils.AirspaceShapeEnumType.SHAPE3D_TRACK:
                    isSymmetricWidth = true;
                    var widthArrayLength = milStdSymbologyModifiers[cesiumEngine.utils.MilStdSymbologyModifiers.DISTANCE].length;
                    if (widthArrayLength === iSegCnt * 2)
                    {
                        // there are left and right widths
                        isSymmetricWidth = false;
                    }

                    dTemp = cesiumEngine.utils.getMilStandardWidthTrack(milStdSymbologyModifiers, sBasic3DSymbolCode, iIndex, isSymmetricWidth);
                    if (!Number.isNaN(dTemp[0]))
                    {
                        dWidthLeft = dTemp[0];
                    }
                    if (!Number.isNaN(dTemp[1]))
                    {
                        dWidthRight = dTemp[1];
                    }
                    attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_LEFT_WIDTH] = dWidthLeft;
                    attribute[cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_RIGHT_WIDTH] = dWidthRight;
                    break;
            }
            airspaceItem.isSymmetricWidth = isSymmetricWidth;
            airspaceItem.properties.attributes.push(attribute);
        }
    }
    airspaceItem.isMilStandardToAirspace3DTransformation = true;

    return airspaceItem;
};

cesiumEngine.utils.convertEmpAltitudeTypeToCesium = function (empAltitudeType)
{
    var cesiumAltitudeMode = Cesium.HeightReference.CLAMP_TO_GROUND; // CLAMP_TO_GROUND by default
    if (Cesium.defined(empAltitudeType))
    {
        switch (empAltitudeType)
        {
            case cesiumEngine.utils.AltitudeModeEnumType.ALTITUDE_RELATIVE_TO_GROUND :
                cesiumAltitudeMode = Cesium.HeightReference.RELATIVE_TO_GROUND;
                break;

            case cesiumEngine.utils.AltitudeModeEnumType.ALTITUDE_CLAMP_TO_GROUND :
                cesiumAltitudeMode = Cesium.HeightReference.CLAMP_TO_GROUND;
                break;
            case cesiumEngine.utils.AltitudeModeEnumType.ALTITUDE_ABSOLUTE :
                cesiumAltitudeMode = Cesium.HeightReference.NONE;
                break;
            default:
                cesiumAltitudeMode = Cesium.HeightReference.CLAMP_TO_GROUND;
        }
    }
    return cesiumAltitudeMode;
};


/**
 * @desc Checks if the required modifiers are present. Adds them if autopopulate is true.
 *
 * @param {object} item parameters are passed as members of the items object.
 * @param {string} item.data.symbolCode - a 15 character MIL-STD-2525 symbol code.
 * @param {properties} [item.properties] - a properties object containing the modifiers of the symbol.
 *
 * @returns {object} An object that contains key-object pairs of the names and values of the properties
 * that need to be modified for the object to draw correctly.
 */
cesiumEngine.utils.checkForRequiredModifiers = function (item, viewDistance)
{
    var result = {},
            symbolCode,
            properties = {},
            modifiers = {},
            oAM = [],
            oAN = [],
            basicSymbolCode,
            standard,
            symbolDef,
            i,
            lonDistance,
            overrides = {},
            rectangle, hasBuffer = false;

    // Check to see if the properties and modifiers have not yet been set.
    // If they don't exist, this will default them to empty objects.
    if (item.data & item.data.symbolCode)
    {
        symbolCode = item.data.symbolCode;
    }
    else if (item.symbolCode)
    {
        symbolCode = item.symbolCode;
    }
    if (Cesium.defined(item.hasBuffer))
    {
        hasBuffer = true;
    }


    if (item.properties)
    {
        properties = item.properties;
        if (properties.modifiers)
        {
            modifiers = properties.modifiers;
        }
        else
        {
            properties.modifiers = {};
            modifiers = properties.modifiers;
        }
    }
    else
    {
        item.properties = {
            modifiers: {}
        };
        properties = item.properties;
        modifiers = item.properties.modifiers;
    }
    // convert the map view into distance in meters from left to right.
    // We use this calculation to determine how many meters the map currently
    // shows on screen.  When we draw the symbol, some symbols require a width.
    // If we hardcode the width, it is either too small or too large.  By
    // figuring out the current map width in meters we can create a new
    // symbol that is proportional to the current view.
    lonDistance = viewDistance / 5; // a 1/4 of the current view
    // Get the basic symbol code.  We need the basic code because we need to look it up with
    // getSymbolDef.  This requires the basic code.
    basicSymbolCode = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(symbolCode);
    // Get the standard we are using.  We need to convert it to what the function getSymbolDef uses.
    standard = cesiumEngine.utils.checkSymbolStandard(item.properties.modifiers);
    // Retrieve the symbol definition object.  This contains information about the required
    // symbol modifiers.  We will use this to determine which modifiers are not sufficiently
    // populated.
    symbolDef = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(basicSymbolCode, standard);
    if ((symbolDef === undefined) || (symbolDef === null))
    {
        return result;
    }
    // The only modifiers that are sometimes required in MIL-STD-2525B and C are
    // distance and azimuth.
    //
    // First check if distance and azimuth has already been set.  If they are, we
    // still may not have enough entries for them (as both are arrays), so we still need to
    // verify that they are good.

    // If distance already exists retrieve the values in it.
    if (modifiers.hasOwnProperty("distance"))
    {
        // Lets make sure that if it is there that it is an array.
        if (modifiers.distance instanceof Array)
        {
            oAM = modifiers.distance;
        }
    }
    // If azimuth already exists retrieve the values of it.
    if (modifiers.hasOwnProperty("azimuth"))
    {
        // Lets make sure that if it is there that it is an array.
        if (modifiers.azimuth instanceof Array)
        {
            oAN = modifiers.azimuth;
        }
    }
    // Based on the symbol draw category, we can determine if the symbol has
    // has the required parameters or not.  For each draw category, we do a different
    // check.
    switch (symbolDef.drawCategory)
    {
        // These are circle graphics represented by a single point and a radius.
        case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE: //16
            if (hasBuffer)
            {
                if (oAM !== null && oAM.length > 2)
                {
                    oAM = oAM.slice(0, 3); // Make sure that there is only 2.
                }
                else   if (oAM !== null && oAM.length > 1)
                {
                    oAM[0] = oAM[0]; // buffer value is always the first in the array
                    oAM[1] = oAM[1];
                    oAM[2] = 0;
                }
                else   if (oAM !== null && oAM.length > 0)
                {
                    oAM[0] = oAM[0]; // buffer value is always the first in the array
                    oAM[1] = 0;
                    oAM[2] = 0;
                }
                overrides = {
                    distance: oAM
                };
            }
            else
            {
                if (oAM !== null && oAM.length > 0)
                {
                    oAM = oAM.slice(0, 1); // Make sure that there is only 1.
                }
                else
                {
                    oAM[0] = 5000;
                }
                overrides = {
                    distance: oAM
                };
            }
            break;
            // These are 1-point rectangles with an azimuth that determine the angle, and a distance that determines width
        case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE: //17
            if (hasBuffer)
            {
                if ((oAM !== null) && (oAM.length >= 3) &&
                        (typeof (oAM[0]) === "number") &&
                        (typeof (oAM[1]) === "number") &&
                        (typeof (oAM[2]) === "number"))
                {
                    oAM = oAM.slice(0, 3); // Make sure that there is only 2.
                }
                else
                {
                    // Check to see if the [0] value is present and its a number.
                    // If not set a value.
                    if ((oAM[0] === undefined) || (typeof (oAM[0]) !== "number"))
                    {
                        oAM[0] = 1000;
                    }
                    // Check to see if the [1] value is present and its a number.
                    // If not set a value.
                    if ((oAM[1] === undefined) || (typeof (oAM[1]) !== "number"))
                    {
                        oAM[1] = 10000;
                    }
                    if ((oAM[2] === undefined) || (typeof (oAM[2]) !== "number"))
                    {
                        oAM[2] = 0;
                    }
                    oAM = oAM.slice(0, 3); // Make sure that there is only 2.
                }
            }
            else
            {
                if ((oAM !== null) && (oAM.length >= 2) &&
                        (typeof (oAM[0]) === "number") &&
                        (typeof (oAM[1]) === "number"))
                {
                    oAM = oAM.slice(0, 2); // Make sure that there is only 2.
                }
                else
                {
                    // Check to see if the [0] value is present and its a number.
                    // If not set a value.
                    if ((oAM[0] === undefined) || (typeof (oAM[0]) !== "number"))
                    {
                        oAM[0] = 10000;
                    }
                    // Check to see if the [1] value is present and its a number.
                    // If not set a value.
                    if ((oAM[1] === undefined) || (typeof (oAM[1]) !== "number"))
                    {
                        oAM[1] = 5000;
                    }
                    oAM = oAM.slice(0, 2); // Make sure that there is only 2.
                }
            }
            if ((oAN !== null) && (oAN.length >= 1) &&
                    (typeof (oAN[1]) === "number"))
            {
                oAN = oAN.slice(0, 1); // Makes ure that there is only 1.
            }
            else
            {
                // Check to see if the [0] value is present and its a number.
                // If not set a value.
                if ((oAN[0] === undefined) || (typeof (oAN[0]) !== "number"))
                {
                    oAN[0] = 0;
                }
                oAN = oAN.slice(0, 1); // Makes ure that there is only 1.
            }
            overrides = {
                distance: oAM,
                azimuth: oAN
            };
            break;
            // This is a sector range fan, requires a point, a min and max distance for each sector, and left
            // and right azimuths for each sector.
        case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_SECTOR_PARAMETERED_AUTOSHAPE: //18
            if (hasBuffer)
            {
                if ((oAM !== null) && (oAM.length >=3))
                {
                    for (i = 0; i < oAM.length; )
                    {
                        if (typeof (oAM[i]) !== "number")
                        {
                            oAM.splice(i, 1);
                        }
                        else
                        {
                            i++;
                        }
                    }
                }
                if (oAM.length > 1)
                {
                    // Check to see if the each value is present.
                    for (i = 0; i < oAM.length; i++)
                    {
                        if (oAM[i] === undefined)
                        {
                            oAM[i] = ((i === 0) ? 5000 : oAM[i - 1] + 5000);
                        }
                    }
                }
                else
                {
                    if (oAM[0] === undefined)
                    {
                        oAM[0] = 5000;
                    }
                }
            }
            else
            {
                if ((oAM !== null) && (oAM.length >= 2))
                {
                    for (i = 0; i < oAM.length; )
                    {
                        if (typeof (oAM[i]) !== "number")
                        {
                            oAM.splice(i, 1);
                        }
                        else
                        {
                            i++;
                        }
                    }
                }
                if (oAM.length > 1)
                {
                    // Check to see if the each value is present.
                    for (i = 0; i < oAM.length; i++)
                    {
                        if (oAM[i] === undefined)
                        {
                            oAM[i] = ((i === 0) ? 2000 : oAM[i - 1] + 2000);
                        }
                    }
                }
                else
                {
                    if (oAM[0] === undefined)
                    {
                        oAM[0] = 2000;
                    }
                }
            }
            // You need at least 2 azimuth values for this to be a drawable graphic
            // If it doesn't have it, create it.
            if (oAN.length === 0)
            {
                oAN.push(315);
                oAN.push(45);
            }
            else if (oAN.length === 1)
            {
                var newVal = oAN[0] + 90;
                if (newVal > 360)
                {
                    newVal = newVal - 360;
                }
                oAN.push(newVal);
            }
            overrides = {
                distance: oAM,
                azimuth: oAN
            };
            break;
            // A circular range fan that is a point and multiple distances for each ring.
        case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_RANGEFAN_AUTOSHAPE: //19
            if ((oAM !== null) && (oAM.length > 0))
            {
                for (i = 0; i < oAM.length; )
                {
                    if (typeof (oAM[i]) !== "number")
                    {
                        oAM.splice(i, 1);
                    }
                    else
                    {
                        i++;
                    }
                }
            }
            if (oAM.length < 1)
            {
                // Check to see if the each value is present.
                for (i = 0; i < 2; i++)
                {
                    if (oAM[i] === undefined)
                    {
                        oAM[i] = ((i === 0) ? 2000 : oAM[i - 1] + 2000);
                    }
                }
            }
            overrides = {
                distance: oAM
            };
            break;
            // These are 2-point rectangles that determine the angle, and a distance that requires width
        case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_TWO_POINT_RECT_PARAMETERED_AUTOSHAPE: //20
            if (oAM !== null && oAM.length > 0)
            {
                if (typeof (oAM[0]) !== "number")
                {
                    oAM[0] = 5000;
                }
                oAM = oAM.slice(0, 1); // Make sure that there is only 1.
            }
            else
            {
                oAM[0] = 5000;
            }
            overrides = {
                distance: oAM
            };
            break;
            // Any air corridor.
        case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_LINE:
            // This really only applies to air corridors.  As far as
            // I know the only line that requires distance is air corridors.

            // If we do not have the distance field set, or it is set
            // and the array length is 0, then we want to set it to a default
            // width.  We want to make the width in relation to the current
            // scale of the map, otherwise the air corridor won't look like
            // an air corridor; it will look like a line.
            if ((oAM === null || oAM.length === 0) || (oAM.length > 0 && (isNaN(oAM[0]) || oAM[0] === null)))
            {
                if (item.data && item.data.coordinates && item.data.coordinates.length > 1)
                {
                    var coord0 = item.data.coordinates[0];
                    var coord1 = item.data.coordinates[1];
                    var pointCartographic0 = Cesium.Cartographic.fromDegrees(coord0[0], coord0[1], 0);
                    var pointCartographic1 = Cesium.Cartographic.fromDegrees(coord1[0], coord1[1], 0);
                    var dist = pointCartographic0.distanceTo(pointCartographic1);
                    lonDistance = dist / 4;
                }
                else
                {
                    lonDistance = lonDistance / 34;
                }
                oAM[0] = lonDistance;
                overrides = {
                    distance: oAM
                };
            }
            else
            {
                overrides = {
                    distance: oAM
                };
            }
            break;
    }

    return overrides;
};

/**
 * @desc Generates an object containing the local URL for the symbol.
 *
 * @param {string} symbolCode - The symbol code.
 * @param {object} properties - The properties object.
 * @param {string} name - The symbol name.
 * @param {boolean} showLabels - Whether the labels should be shown.
 * @param {string} iconPixelSize - The pixel size of the symbol to be displayed.
 * @returns {object} urls - An object containing URLS.
 * @returns {string} urls.local - The local URL for the symbol image.
 */
cesiumEngine.utils.generateSymbolURL = function (symbolCode, properties, name, showLabels, iconPixelSize)
{
    var modifiersArray = [],
            mod,
            modifiersString = "",
            showModLabels = false, //TODO: should be changed to showLabels laterrrr
            urls = {},
            property;

    if (iconPixelSize === undefined || iconPixelSize === null)
    {
        iconPixelSize = 32;
    }
    // loop through all the properties, add a parameter for each property
    // that will modify the symbol
    for (property in properties)
    {
        switch (property)
        {
            case "fillColor":
                modifiersArray.push("fillColor=0x" + encodeURIComponent(properties[property]));
                break;
            case "lineColor":
                modifiersArray.push("lineColor=0x" + encodeURIComponent(properties[property]));
                break;
            case "modifiers":
                // modifiers contains an object that has other properties in it.
                // loop through each of the properties and add parameters to those
                // that are relevant.
                for (mod in properties[property])
                {
                    switch (mod)
                    {
                        case "quantity":
                            if (showModLabels > 1)
                            {
                                modifiersArray.push("C=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "reinforcedOrReduced":
                            if (showModLabels > 1)
                            {
                                modifiersArray.push("F=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "staffComments":
                            if (showModLabels > 1)
                            {
                                modifiersArray.push("G=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "additionalInfo1":
                            if (showModLabels > 0)
                            {
                                modifiersArray.push("H=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "additionalInfo2":
                            if (showModLabels > 1)
                            {
                                modifiersArray.push("H1=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "additionalInfo3":
                            if (showModLabels > 1)
                            {
                                modifiersArray.push("H2=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "evaluationRating":
                            if (showModLabels > 1)
                            {
                                modifiersArray.push("J=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "combatEffectiveness":
                            if (showModLabels > 1)
                            {
                                modifiersArray.push("K=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "signatureEquipment":
                            modifiersArray.push("L=" + encodeURIComponent(properties[property][mod]));
                            break;
                        case "higherFormation":
                            if (showModLabels > 0)
                            {
                                modifiersArray.push("M=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "hostile":
                            modifiersArray.push("N=" + encodeURIComponent(properties[property][mod]));
                            break;
                        case "iffSif":
                            if (showModLabels > 1)
                            {
                                modifiersArray.push("P=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "offsetIndicator":
                            modifiersArray.push("S=" + encodeURIComponent(properties[property][mod]));
                            break;
                        case "uniqueDesignation1":
                            if (showModLabels > 0)
                            {
                                modifiersArray.push("T=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "uniqueDesignation2":
                            if (showModLabels > 0)
                            {
                                modifiersArray.push("T1=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "equipmentType":
                            modifiersArray.push("V=" + encodeURIComponent(properties[property][mod]));
                            break;
                        case "dateTimeGroup1":
                            if (showModLabels > 1)
                            {
                                modifiersArray.push("W=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "dateTimeGroup2":
                            if (showModLabels > 1)
                            {
                                modifiersArray.push("W1=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "altitudeDepth":
                            if (showModLabels > 1)
                            {
                                modifiersArray.push("X=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "location":
                            if (showModLabels > 1)
                            {
                                modifiersArray.push("Y=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "speed":
                            if (showModLabels > 1)
                            {
                                modifiersArray.push("Z=" + encodeURIComponent(properties[property][mod]));
                            }
                            break;
                        case "specialC2Headquarters":
                            modifiersArray.push("AA=" + encodeURIComponent(properties[property][mod]));
                            break;
                        case "distance":
                            modifiersArray.push("AM=" + encodeURIComponent(properties[property][mod]));
                            break;
                        case "azimuth":
                            modifiersArray.push("AN=" + encodeURIComponent(properties[property][mod]));
                            break;
                        case "standard":
                            modifiersArray.push("symstd=" + encodeURIComponent(properties[property][mod]));
                            break;
                        default:
                            modifiersArray.push(mod + "=" + encodeURIComponent(properties[property][mod]));
                            break;
                    }
                }
                break;
        }
    }
    if (showModLabels > 0 && name !== undefined && name !== null && name.length > 0)
    {
        modifiersArray.push("CN=" + encodeURIComponent(name));
    }
    modifiersArray.push("size=" + iconPixelSize);
    if (modifiersArray.length > 0)
    {
        modifiersString = modifiersArray.join("&");
        modifiersString = "?" + modifiersString;
    }
    //Use baseURL for http protocol, baseSURL for https protocol
    //for current version of web service (mil-symbology-renderer) sprint 16 and earlier
    //urls.local = baseURL + "mil-symbology-renderer/renderer/image/" + symbolCode + modifiersString;
    //for new version of web service (mil-sym-service) sprint 17 and later
    urls.local = "/mil-sym-service/renderer/image/" + symbolCode + modifiersString;
    return urls;
};

cesiumEngine.utils.getSymbolIconCurrentScale = function (iconPixelSize)
{
    var iconScale = 1;

    switch (iconPixelSize)
    {
        case 16 :
            iconScale = .5;
            break;
        case 24 :
            iconScale = .75;
            break;
        case 32 :
            iconScale = 1;
            break;
        case 36 :
            iconScale = 1.10;
            break;
        case 48 :
            iconScale = 1.15;
            break;
        case 72 :
            iconScale = 1.2;
            break;
        default:
            iconScale = 1;
    }
    return iconScale;
};

/**
 Convert KML color (abgr) or argb to #rgb format ()
 */
cesiumEngine.utils.colorABGRToObjectRGBAndAlpha = function (style, argbFormat)
{
    var rgb;
            style = style.trim(); //KML uses ABGR hex

    if (style.charAt(0) === "#")
    {
        style = style.substring(1);
    }
    var alphaHex = style.charAt(0) + style.charAt(1);
    var alphaDec = parseInt(alphaHex, 16); // sec renderer requires the value in hex.
    if (argbFormat)
    {
        rgb = "#" + style.charAt(2) + style.charAt(3) +
                style.charAt(4) + style.charAt(5) +
                style.charAt(6) + style.charAt(7);
    }
    else
    {
        rgb = "#" + style.charAt(6) + style.charAt(7) +
                style.charAt(4) + style.charAt(5) +
                style.charAt(2) + style.charAt(3);
    }
    return {
        "color": rgb,
        "opacity": alphaDec
    };
};


//update modifiers based on core pallette's  options
cesiumEngine.utils.updateModifierLabels = function (properties, name, iconLabels)
{
    var mod,
            modifiedModifiers = {},
            property,
            size;

    // loop through all the properties, add a parameter for each property
    // that will modify the symbol
    for (property in properties)
    {
        switch (property)
        {
            case "fillColor":
                modifiedModifiers["fillColor"] = properties[property];  //("fillColor=0x" + encodeURIComponent(properties[property]));
                break;
            case "lineColor":
                modifiedModifiers["lineColor"] = properties[property];
                break;
            case "modifiers":
                // modifiers contains an object that has other properties in it.
                // loop through each of the properties and add parameters to those
                // that are relevant.
                for (mod in properties[property])
                {
                    switch (mod)
                    {
                        case "quantity":
                            if (iconLabels.C && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["quantity"] = properties[property][mod];
                            }
                            break;
                        case "reinforcedOrReduced":
                            if (iconLabels.F && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["reinforcedOrReduced"] = properties[property][mod];
                            }
                            break;
                        case "staffComments":
                            if (iconLabels.G && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["staffComments"] = properties[property][mod];
                            }
                            break;
                        case "additionalInfo1":
                            if (iconLabels.H && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["additionalInfo1"] = properties[property][mod];
                            }
                            break;
                        case "additionalInfo2":
                            if (iconLabels.H1 && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["additionalInfo2"] = properties[property][mod];
                            }
                            break;
                        case "additionalInfo3":
                            if (iconLabels.H2 && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["additionalInfo3"] = properties[property][mod];
                            }
                            break;
                        case "evaluationRating":
                            if (iconLabels.J && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["evaluationRating"] = properties[property][mod];
                            }
                            break;
                        case "combatEffectiveness":
                            if (iconLabels.K && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["combatEffectiveness"] = properties[property][mod];
                            }
                            break;
                        case "signatureEquipment":
                            if (properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["signatureEquipment"] = properties[property][mod];
                            }
                            break;
                        case "higherFormation":
                            if (iconLabels.M && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["higherFormation"] = properties[property][mod];
                            }
                            break;
                        case "hostile":
                            if (iconLabels.N && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["hostile"] = properties[property][mod];
                            }
                            break;
                        case "iffSif":
                            if (iconLabels.P && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["iffSif"] = properties[property][mod];
                            }
                            break;
                        case "offsetIndicator":
                            if (properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["offsetIndicator"] = properties[property][mod];
                            }
                            break;
                        case "uniqueDesignation1":
                            if (iconLabels.T && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["uniqueDesignation1"] = properties[property][mod];
                            }
                            break;
                        case "uniqueDesignation2":
                            if (iconLabels.T1 && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["uniqueDesignation2"] = properties[property][mod];
                            }
                            break;
                        case "equipmentType":
                            if (properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["equipmentType"] = properties[property][mod];
                            }
                            break;
                        case "dateTimeGroup1":
                            if (iconLabels.W && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["dateTimeGroup1"] = properties[property][mod];
                            }
                            break;
                        case "dateTimeGroup2":
                            if (iconLabels.W1 && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["dateTimeGroup2"] = properties[property][mod];
                            }
                            break;
                        case "altitudeDepth":
                            if (iconLabels.X)
                            {
                                modifiedModifiers["altitudeDepth"] = properties[property][mod];
                            }
                            break;
                        case "location":
                            if (iconLabels.Y && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["location"] = properties[property][mod];
                            }
                            break;
                        case "speed":
                            if (iconLabels.Z && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["speed"] = properties[property][mod];
                            }
                            break;
                        case "specialC2Headquarters":
                            if (iconLabels.AA && properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers["specialC2Headquarters"] = properties[property][mod];
                            }
                            break;
                        case "distance":
                            modifiedModifiers["distance"] = properties[property][mod];
                            break;
                        case "azimuth":
                            modifiedModifiers["azimuth"] = properties[property][mod];
                            break;
                        case "standard":
                            modifiedModifiers["standard"] = properties[property][mod];
                            break;
                        case "size":
                            size = properties[property][mod];
                            if (!size)
                            {
                                size = iconPixelSize;
                            }
                            modifiedModifiers["size"] = size;
                            break;
                        default:
                            if (properties[property][mod] && (properties[property][mod] !== ""))
                            {
                                modifiedModifiers[mod] = properties[property][mod];
                            }
                            break;
                    }
                }
                break;
        }
    }
    // If we are supposed to show the name of the graphic
    // show it.
    if (iconLabels.CN && name)
    {
        modifiedModifiers["CN"] = name;
    }

    return modifiedModifiers;
};

cesiumEngine.utils.inheritsFromCesium = function (child)
{
    child.prototype = Object.create(Cesium);
    child.prototype.constructor = child;
};


cesiumEngine.utils.inRange = function (min, number, max)
{
    if (!isNaN(number) && (number >= min) && (number <= max))
    {
        return true;
    }
    else
    {
        return false;
    }
    ;
};

cesiumEngine.utils.valid_coords = function (number_lat, number_lng)
{
    if (cesiumEngine.utils.inRange(-90, number_lat, 90) && cesiumEngine.utils.inRange(-180, number_lng, 180))
    {
        return true;
    }
    else
    {
        return false;
    }
};



cesiumEngine.utils.getEyeOffsetControlPoint = function (currentCameraHeight, lastCameraHeight)
{
    var zIndex = -1;
    //var currCameraHeight = empCesium.viewer.camera.positionCartographic.height;
    //var cameraHeight = empCesium.lastCamera.positionCartographic.height;
    if (currentCameraHeight > 100000)
    {
        zIndex = -15000;
    }
    else if (currentCameraHeight <= 100000 && currentCameraHeight >= 50000)
    {
        zIndex = -10000;
    }
    else if (currentCameraHeight <= 85000 && currentCameraHeight >= 30000)
    {
        zIndex = -5000;
    }
    else if (currentCameraHeight <= 30000 && currentCameraHeight >= 10000)
    {
        zIndex = -3000;
    }
    else if (currentCameraHeight <= 10000 && currentCameraHeight >= 5000)
    {
        zIndex = -1500;
    }
    else if (currentCameraHeight <= 5000 && currentCameraHeight >= 1000)
    {
        zIndex = -1000;
    }
    else if (currentCameraHeight <= 1000 && currentCameraHeight >= 500)
    {
        zIndex = -500;
    }
    else if (currentCameraHeight <= 500 && currentCameraHeight >= 200)
    {
        zIndex = -100;
    }
    else if (currentCameraHeight <= 200 && currentCameraHeight >= 100)
    {
        zIndex = -25;
    }
    else if (currentCameraHeight <= 100 && currentCameraHeight >= 50)
    {
        zIndex = -10;
    }
    else if (currentCameraHeight <= 50)
    {
        zIndex = -5;
    }
    if (zIndex === -1)
    {
        zIndex = 0;
    }

//    if (currentCameraHeight > 85000 && lastCameraHeight <= 85000)
//    {
//        zIndex = -10000;
//    }
//    if (currentCameraHeight <= 85000 && currentCameraHeight >= 500 && (lastCameraHeight <= 500 || lastCameraHeight > 85000))
//    {
//        zIndex = -500;
//    }
//    if (currentCameraHeight <= 500 && lastCameraHeight > 500)
//    {
//        zIndex = -100;
//    }
//    if (zIndex == -1)
//    {
//        zIndex = 0;
//    }
    return new Cesium.Cartesian3(0.0, 0.0, zIndex);
};

cesiumEngine.utils.getEyeOffsetBillboard = function (currentCameraHeight, lastCameraHeight)
{
    var zIndex = -1;
    //var currCameraHeight = empCesium.viewer.camera.positionCartographic.height;
    //var cameraHeight = empCesium.lastCamera.positionCartographic.height;
    if (currentCameraHeight > 100000)
    {
        zIndex = -300;
    }
    else if (currentCameraHeight <= 100000 && currentCameraHeight >= 50000)
    {
        zIndex = -200;
    }
    else if (currentCameraHeight <= 85000 && currentCameraHeight >= 30000)
    {
        zIndex = -150;
    }
    else if (currentCameraHeight <= 30000 && currentCameraHeight >= 10000)
    {
        zIndex = -100;
    }
    else if (currentCameraHeight <= 10000 && currentCameraHeight >= 5000)
    {
        zIndex = -100;
    }
    else if (currentCameraHeight <= 5000 && currentCameraHeight >= 1000)
    {
        zIndex = -50;
    }
    else if (currentCameraHeight <= 1000 && currentCameraHeight >= 500)
    {
        zIndex = -20;
    }
    else if (currentCameraHeight <= 500 && currentCameraHeight >= 200)
    {
        zIndex = 0;
    }
    else if (currentCameraHeight <= 200 && currentCameraHeight >= 100)
    {
        zIndex = 0;
    }
    else if (currentCameraHeight <= 100 && currentCameraHeight >= 50)
    {
        zIndex = 0;
    }
    else if (currentCameraHeight <= 50)
    {
        zIndex = 0;
    }
    if (zIndex === -1)
    {
        zIndex = 0;
    }

//    if (currentCameraHeight > 85000 && lastCameraHeight <= 85000)
//    {
//        zIndex = -10000;
//    }
//    if (currentCameraHeight <= 85000 && currentCameraHeight >= 500 && (lastCameraHeight <= 500 || lastCameraHeight > 85000))
//    {
//        zIndex = -500;
//    }
//    if (currentCameraHeight <= 500 && lastCameraHeight > 500)
//    {
//        zIndex = -100;
//    }
//    if (zIndex == -1)
//    {
//        zIndex = 0;
//    }
    return new Cesium.Cartesian3(0.0, 0.0, zIndex);
};


cesiumEngine.utils.getRectangleWithBufferFromCartographicArray = function (cartographics)
{
    var rectangle;
    rectangle = Cesium.Rectangle.fromCartographicArray(cartographics);
    rectangle = cesiumEngine.utils.getRectangleWithBufferFromRectangle(rectangle);
    return rectangle;
};

cesiumEngine.utils.getRectangleWithBufferFromRectangle = function (rectangle)
{
    var bufferedRectangle;
    var rectangleTopWestCarto = new Cesium.Cartographic(rectangle.west, rectangle.north, 0);
    var rectangleBottomEastCarto = new Cesium.Cartographic(rectangle.east, rectangle.south, 0);
    var distanceCornerToCorner = rectangleTopWestCarto.distanceTo(rectangleBottomEastCarto);
    var bufferedRectangleTopWestCarto = rectangleTopWestCarto.destinationPoint(-45, distanceCornerToCorner * .5);
    var bufferedRectangleBottomEastCarto = rectangleBottomEastCarto.destinationPoint(-225, distanceCornerToCorner * .5);
    bufferedRectangle = new Cesium.Rectangle(
            bufferedRectangleTopWestCarto.longitude,
            bufferedRectangleBottomEastCarto.latitude,
            bufferedRectangleBottomEastCarto.longitude,
            bufferedRectangleTopWestCarto.latitude
            );
    return bufferedRectangle;
};

//takes radians
cesiumEngine.utils.getAnglesDifference = function (angle1, angle2)
{
    return Math.abs((Math.abs(angle1 - angle2) + Cesium.Math.PI) % (2 * Cesium.Math.PI) - Cesium.Math.PI);
};

cesiumEngine.utils.fillArrayWithNumbers = function (n)
{
    var arr = Array.apply(null, Array(n));
    return arr.map(function (x, i)
    {
        return i;
    });
};

cesiumEngine.utils.normalizeAngleInDegrees = function (value)
{
    var normalizedValue = value.toRad();
    normalizedValue = (normalizedValue + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    return normalizedValue.toDeg();
};

//true if single point   keeps  track of  the map heading.
// false otherwise.
cesiumEngine.utils.isMilStandardSinglePointDirectional = function (symbolCode)
{
    var isMilStandardDirectional = false,
            basicSymbolId;

    basicSymbolId = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(symbolCode);
    switch (basicSymbolId)
    {
        case "G*M*OME---****X"://ANTITANK MINE (DIRECTIONAL)
        case "G*M*OMD---****X":// ANTITANK MINE ANTIHANDLING DEVICE
        case "G*M*OMW---****X":// WIDE AREA MINES
        case "G*M*OMP---****X"://ANTIPERSONNEL (AP) MINES
        case " G * G * GPUYP - * * * * X": //SONOBUOY PATTERN CENTER
        case "G*G*GPUYD-****X"://SONOBUOY DIRECTIONAL FREQUENCY ANALYZING AND RECORDING (DIFAR)
        case "G*G*GPUYL-****X":// SONOBUOY LOW FREQUENCY ANALYZING AND RECORDING (LOFAR)
        case "G*G*GPUYC-****X":// SONOBUOY COMMAND ACTIVE SONOBUOY SYSTEM (CASS)
        case "G*G*GPUYS-****X":// SONOBUOY DIRECTIONAL COMMAND ACTIVE SONOBUOY SYSTEM (DICASS)
        case "G*G*GPUYB-****X"://SONOBUOY BATHYTHERMOGRAPH TRANSMITTING (BT)
        case "G*G*GPUYA-****X"://SONOBUOY ANM
        case "G*G*GPUYV-****X"://SONOBUOY VERTICAL LINE ARRAY DIFAR (VLAD)
        case "G*G*GPUYT-****X"://SONOBUOY ATAC
        case "G*G*GPUYR-****X"://SONOBUOY RANGE ONLY (RO)
        case "G*G*GPUYK-****X"://SONOBUOY KINGPIN
        case "G*G*GPUYX-****X"://SONOBUOY EXPIRED
            isMilStandardDirectional = true;
            break;
        default:
            isMilStandardDirectional = false;
            break;
    }
    return isMilStandardDirectional;
};


cesiumEngine.utils.getFontInfo = function (name, size, style)
{
    var _ModifierFontName = name;
    var _ModifierFontSize = size;
    if (style !== 'bold' || style !== 'normal')
    {
        _ModifierFontStyle = style;
    }
    else
    {
        _ModifierFontStyle = 'bold';
    }
    _ModifierFont = style + " " + size + "pt " + name;

    var measurements = armyc2.c2sd.renderer.utilities.RendererUtilities.measureFont(_ModifierFont);
    return {name: name, size: size, style: style, measurements: measurements};
};

// compare 2 objects's values for equality. Only for objects with no functions. No equality on reference.
cesiumEngine.utils.jsonEqual = function (a, b)
{
    return JSON.stringify(a) === JSON.stringify(b);
};



//EmpDictionary hash
(function ()
{
    var Item = function (key, value)
    {
        this.key = key;
        this.value = value;
    };
    Item.prototype.key = null;
    Item.prototype.value = null;
    Item.prototype.is = function (key)
    {
        return (this.key === key);
    };
    Item.prototype.toString = function ()
    {
        return this.key.toString() + ":" + this.value.toString();
    };
    function EmpDictionary(hash)
    {
        this._map = [];
        this.adopt(hash);
    }
    ;
    EmpDictionary.prototype._map = null;
    /**
     * Adopts all members from another EmpDictionary or Object instance
     */
    EmpDictionary.prototype.adopt = function (hash)
    {
        if (hash)
        {
            if (hash instanceof EmpDictionary)
            {
                hash.each(this.addItem, this);
            }
            else if (typeof hash == 'object')
            {
                for (var key in hash)
                {
                    this.addItem(key, hash[key]);
                }
                ;
            }
            ;
        }
        ;

        return this;
    };
    EmpDictionary.prototype.addItem = function (key, value)
    {
        var item;

        for (var i = 0, l = this._map.length; i < l; i++)
        {
            item = this._map[i];
            if (item.is(key))
            {
                return item.value = value;
            }
            ;
        }
        ;
        this._map.push(new Item(key, value));

        return value;
    };
    EmpDictionary.prototype.contains = function (key)
    {
        for (var i = 0, l = this._map.length; i < l; i++)
        {
            var item = this._map[i];
            if (item.is(key))
            {
                return true;
            }
            ;
        }
        ;

        return false;
    };
    EmpDictionary.prototype.getItem = function (key)
    {
        for (var i = 0, l = this._map.length; i < l; i++)
        {
            var item = this._map[i];
            if (item.is(key))
            {
                return item.value;
            }
            ;
        }
        ;

        return null;
    };
    EmpDictionary.prototype.removeItem = function (key)
    {
        for (var i = 0, l = this._map.length; i < l; i++)
        {
            var item = this._map[i];
            if (item.is(key))
            {
                this._map.splice(i, 1);
                break;
            }
            ;
        }
        ;
    };
    EmpDictionary.prototype.removeAll = function ()
    {
        this._map.length = 0;
    };
    EmpDictionary.prototype.count = EmpDictionary.prototype.length = function ()
    {
        return this._map.length;
    };
    EmpDictionary.prototype.clone = function ()
    {
        return new EmpDictionary().copy(this);
    };
    EmpDictionary.prototype.copy = function (source)
    {
        if (!(source instanceof EmpDictionary))
        {
            throw new Error('Source must be a EmpDictionary object');
        }
        ;
        this._map = source._map.slice();

        return this;
    };
    EmpDictionary.prototype.each = function (iterator, scope)
    {
        for (var i = 0, l = this._map.length; i < l; i++)
        {
            var item = this._map[i];
            iterator.call(scope, item.value, item.key, i, this);
        }
        ;
    };
    EmpDictionary.prototype.sort = EmpDictionary.prototype.sortOnKeys = function (iterator)
    {
        this._map.sort(function (a, b)
        {
            return iterator(a.key, b.key);
        });
    };
    EmpDictionary.prototype.sortOnValues = function (iterator)
    {
        this._map.sort(function (a, b)
        {
            return iterator(a.value, b.value);
        });
    };
    EmpDictionary.prototype.map = function (iterator, scope)
    {
        var r = new EmpDictionary();

        for (var i = 0, l = this._map.length; i < l; i++)
        {
            var item = this._map[i];
            r.addItem(item.key, iterator.call(scope, item.value, item.key, i, this));
        }
        ;

        return r;
    };
    EmpDictionary.prototype.filter = function (iterator, scope)
    {
        var r = new EmpDictionary();

        for (var i = 0, l = this._map.length; i < l; i++)
        {
            var item = this._map[i];
            var ok = iterator.call(scope, item.value, item.key, i, this);
            if (ok)
            {
                r.addItem(item.key, item.value);
            }
            ;
        }
        ;

        return r;
    };
    EmpDictionary.prototype.keys = function ()
    {
        var k = [];

        for (var i = 0, l = this._map.length; i < l; i++)
        {
            var item = this._map[i];
            k[i] = item.key;
        }
        ;

        return k;
    };
    EmpDictionary.prototype.values = function ()
    {
        var v = [];

        for (var i = 0, l = this._map.length; i < l; i++)
        {
            var item = this._map[i];
            v[i] = item.value;
        }
        ;

        return v;
    };
    EmpDictionary.prototype.all = function (iterator, scope)
    {
        for (var i = 0, l = this._map.length; i < l; i++)
        {
            var item = this._map[i];
            if (!iterator.call(scope, item.value, item.key, this))
            {
                return false;
            }
            ;
        }
        ;

        return true;
    };
    EmpDictionary.prototype.any = function (iterator, scope)
    {
        for (var i = 0, l = this._map.length; i < l; i++)
        {
            var item = this._map[i];
            if (iterator.call(scope, item.value, item.key, this))
            {
                return true;
            }
            ;
        }
        ;

        return false;
    };
    EmpDictionary.prototype.subset = function ()
    {
        var r = new EmpDictionary(),
                keys = Array.apply(null, arguments);

        for (var i = 0, l = keys.length; i < l; i++)
        {
            var key = keys[i];
            if (this.contains(key))
            {
                var value = this.getItem(key);
                if (value)
                {
                    r.addItem(key, value);
                }
                ;
            }
            ;
        }
        ;

        return r;
    };
    EmpDictionary.prototype.toString = function ()
    {
        var o = [];

        for (var i = 0, l = this._map.length; i < l; i++)
        {
            var item = this._map[i];
            o.push(item.toString());
        }
        ;

        return "{" + o.join(",") + "}";
    };

    return this.EmpDictionary = window.EmpDictionary = EmpDictionary;
})();
