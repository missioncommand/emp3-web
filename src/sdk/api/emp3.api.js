/*globals window, console, mil*/

/**
 * The main process for the CPCE Map Api
 * This is where we construct and define all the different pieces of the CPCE Map Api
 * @private
 */

/* eslint-disable no-console */
// If no console object is present, create one that does nothing.
if (!console) {
  window.console = {};
}
if (!console.info) {
  console.info = function () {
  };
}
if (!console.error) {
  console.error = function () {
  };
}
if (!console.warn) {
  console.warn = function () {
  };
}
/* eslint-enable no-console */

/**
 * Namespace Root namespace for the Extensible Mapping Platform v3.
 * @namespace emp3
 */
if (!window.emp3) {
  window.emp3 = {};
}

/**
 * Namespace Contains the classes used to create and manipulate at map.
 * @namespace emp3.api
 * @memberOf  emp3
 */
if (!window.emp3.api) {
  window.emp3.api = {};
}

/**
 * window.emp3.api.enums Contains all enumerations and constants for the EMPv3 API.
 * @namespace emp3.api.enums
 * @memberOf emp3.api
 */
if (!window.emp3.api.enums) {
  emp3.api.enums = {};
}

/**
 * emp3.api.events Contains classes for all the events.
 * @namespace emp3.api.events
 * @memberOf emp3.api
 */
if (!window.emp3.api.events) {
  emp3.api.events = {};
}

/**
 * Used to create pseudo random GUID's for use in the CPCE Api - Used internally and can be used externally
 * @return {String}  GUID - 5 block seq of numbers
 * @ignore
 */
emp3.api.createGUID = function () {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
};

/**
 *  A simple javascript-based hash map.
 *  @ignore
 */
emp3.api.Hash = function () {

  var i;

  this.length = 0;
  this.items = [];
  for (i = 0; i < arguments.length; i += 2) {
    if (typeof(arguments[i + 1]) !== 'undefined') {
      this.items[arguments[i]] = arguments[i + 1];
      this.length += 1;
    }
  }

  /**
   *  @name emp3.api.Hash#removeItem
   *  @param {string} in_key String used to ID hash table Items
   *  @memberof emp3.api.Hash
   *  @method removeItem
   *  @returns {object} Object that was destroyed
   * */
  this.removeItem = function (in_key) {
    var tmp_previous;
    if (typeof(this.items[in_key]) !== 'undefined') {
      this.length -= 1;
      tmp_previous = this.items[in_key];
      delete this.items[in_key];
    }

    return tmp_previous;
  };
  /**
   *  @name emp3.api.Hash#getItem
   *  @param {string} in_key String used to ID hash table Items
   *  @memberof emp3.api.Hash
   *  @method getItem
   *  @example exampleHash.getItem(keyGUID);
   *  @returns {object} Object that is stored in the Hash Table for the specified GUID
   * */
  this.getItem = function (in_key) {
    return this.items[in_key];
  };
  /** @private
   *  @name emp3.api.Hash#setItem
   *  @param {string} in_key String used to ID hash table Items
   *  @param {object} in_value (Can be any type) value to set in the hash table
   *  @memberof emp3.api.Hash
   *  @method setItem
   *  @return {object} Returns passed value
   * */
  this.setItem = function (in_key, in_value) {
    var tmp_previous;
    if (typeof(in_value) !== 'undefined') {
      if (typeof(this.items[in_key]) === 'undefined') {
        this.length += 1;
      } else {
        tmp_previous = this.items[in_key];
      }

      this.items[in_key] = in_value;
    }

    return tmp_previous;
  };

  /** @private
   *  @name emp3.api.Hash#hasItem
   *  @param {string} in_key String used to ID hash table Items
   *  @memberof emp3.api.Hash
   *  @method hasItem
   *  @returns {boolean} Returns true if object exists
   * */
  this.hasItem = function (in_key) {
    return typeof(this.items[in_key]) !== 'undefined';
  };

  /**
   * @private
   *  @name emp3.api.Hash#clear
   *
   *  @memberof emp3.api.Hash
   *  @method clear
   *  @returns {void}
   * */
  this.clear = function () {
    var i;

    for (i in this.items) {
      if (this.items.hasOwnProperty(i)) {
        delete this.items[i];
      }
    }

    this.length = 0;
  };
  /**
   * @private
   *  @name emp3.api.Hash#toArray
   *
   *  @memberof emp3.api.Hash
   *  @method toArray
   *  @returns {Array} Returns array of hashtable
   * */
  this.toArray = function () {
    var array = [],
      i;
    for (i in this.items) {
      if (this.items.hasOwnProperty(i)) {
        array.push(this.items[i]);
      }
    }

    return array;
  };
};

/**
 *
 *  Converts a measurement from one unit to kilometers.
 *  Source values may be meters, kilometers, miles, nautical miles,
 *  yards, or feet.  Set the units parameter to 'm', 'km', 'mi', 'nm', 'yd',
 *  or 'ft' respectively.
 *
 * @param {int} measurement Length of measurement to be converted
 * @param {string} units Units for the measurement to be converted to.
 * @returns {int} Returns the converted measurement
 * @ignore
 */
emp3.api.convertToKilometers = function (measurement, units) {
  var returnValue;

  switch (units) {
    case 'km':
      returnValue = measurement;
      break;
    case 'mi':
      returnValue = measurement / 0.62137;
      break;
    case 'nmi':
      returnValue = measurement / 0.53996;
      break;
    case 'yd':
      returnValue = measurement / 1093.6;
      break;
    case 'ft':
      returnValue = measurement / 3280.8;
      break;
    case 'm':
      returnValue = measurement / 1000;
      break;
    default:
      throw new Error('Unsupported unit type: use either "m", "km", "nmi", "mi", "yd" or "ft"');
  }
  return returnValue;
};

/**
 * Takes a geojson object and converts it into a kml coordinate string.  Does not support
 * the multipoint, multilinestring, multipolygon or geometryCollection geojson types. This function
 * will only return the outer ring of a polygon, and not interior polygons. An
 * error will return an empty string.
 * @private
 * @param  {object} geojson Any geojson object.
 * @return {string} A space delimited string of coordinates of the format x0,y0[,z0] [xn,yn[,zn]]
 * @ignore
 */
function convertGeoJsonToCoordinateString(geojson) { // eslint-disable-line no-unused-vars
  var coordString = '',
    i;

  if (geojson && geojson.type && geojson.coordinates) {
    switch (geojson.type.toLowerCase()) {
      case 'point':
        if (geojson.coordinates.length >= 2) {
          coordString = geojson.coordinates[0] + ',' + geojson.coordinates[1];

          if (geojson.coordinates.length >= 3) {
            coordString += geojson.coordinates[2];
          }
        }
        break;
      case 'linestring':

        for (i = 0; i < geojson.coordinates.length; i += 1) {
          if (geojson.coordinates[i].length >= 2) {
            coordString += geojson.coordinates[i][0] + ',' + geojson.coordinates[i][1];

            if (geojson.coordinates[i].length >= 3) {
              coordString += geojson.coordinates[i][2];
            }

            coordString += ' ';
          }
        }
        break;
      case 'polygon':
        if (geojson.coordinates.length >= 1) {

          for (i = 0; i < geojson.coordinates[0].length; i += 1) {
            if (geojson.coordinates[0][i].length >= 2) {
              coordString += geojson.coordinates[0][i][0] + ',' + geojson.coordinates[0][i][1];

              if (geojson.coordinates[i].length >= 3) {
                coordString += geojson.coordinates[0][i][2];
              }

              coordString += ' ';
            }
          }
        }
        break;
    }
  }

  return coordString;
}


/**
 *
 * @param coordinates
 * @returns {{type: *, coordinates: Array}|*}
 * @ignore
 */
function convertCoordinateStringToGeoJson(coordinates) { // eslint-disable-line no-unused-vars
                                                         // convert the coordinates into geojson and use the data field.
                                                         // like a feature.

  var coordinateArray,
    geoJsonCoordinateArray,
    geojsontype,
    splitcoordinates,
    point,
    k,
    j,
    geojsonObject;

  // trim beginning and trailing spaces of the coordinates.
  coordinates = coordinates.replace(/^\s|\s$/g, '');

  coordinateArray = coordinates.split(' ');
  geoJsonCoordinateArray = [];

  if (coordinateArray.length > 1) {
    geojsontype = 'LineString';
    for (k = 0; k < coordinateArray.length; k += 1) {
      if (coordinateArray[k] !== '') {
        splitcoordinates = coordinateArray[k].split(',');
        point = [];
        for (j = 0; j < splitcoordinates.length; j += 1) {
          point.push(splitcoordinates[j]);
        }
        geoJsonCoordinateArray.push(point);
      }
    }
  } else {
    geojsontype = 'Point';
    splitcoordinates = coordinateArray[0].split(',');
    for (k = 0; k < splitcoordinates.length; k += 1) {
      geoJsonCoordinateArray.push(splitcoordinates[k]);
    }
  }

  geojsonObject = {
    type: geojsontype,
    coordinates: geoJsonCoordinateArray
  };

  return geojsonObject;
}

/**
 * Converts an array of location objects such as the ones
 * returned by cmw-a draw/edit callbacks into a KML location
 * string.
 *
 * @param  {Array} locations an array of location objects of the format {lat, lon, alt}
 * @return {string} a string of space separated coordinates in the format "x0,y0,z0 x1,y1,z1,...xn,yn,zn"
 * @ignore
 */

function convertLocationArrayToString(locations) { // eslint-disable-line no-unused-vars
  var coordString = '',
    i,
    len = locations.length;

  //loop through the array and start converting each coordinate to a string
  for (i = 0; i < len; i += 1) {
    // make sure this coordinate has a lat and a lon.  Without that it is
    // invalid, and skip to the next one.
    if (locations[i].lat && locations[i].lon) {
      coordString += locations[i].lon + ',' + locations[i].lat;

      // if it has an altitude, add that onto the string
      if (locations[i].alt) {
        coordString += ',' + locations[i].alt;
      }

      if (i < locations.length - 1) {
        // add the separator.
        coordString += ' ';
      }
    }
  }

  // return the final coordinate string.
  return coordString;
}

/**
 *
 * @param obj
 * @returns {boolean}
 * @ignore
 */
emp3.api.isArray = function (obj) {
  return Object.prototype.toString.call(obj) === "[object Array]";
};

/**
 * @param obj
 * @returns {boolean}
 * @ignore
 */
emp3.api.isString = function (obj) {
  return Object.prototype.toString.call(obj) === "[object String]";
};

/**
 * @param obj
 * @returns {boolean}
 * @ignore
 */
emp3.api.isOverlay = function (obj) {
  var result = false;

  if (obj) {
    if (obj.type === 'overlay') {
      result = true;
    }
  }

  return result;
};

/**
 *
 * @param obj
 * @returns {boolean}
 * @ignore
 */
emp3.api.isFeature = function (obj) {
  var result = false;

  if (obj.featureType) {
    if (obj.featureType === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL ||
      obj.featureType === emp3.api.enums.FeatureTypeEnum.GEO_POINT ||
      obj.featureType === emp3.api.enums.FeatureTypeEnum.GEO_PATH ||
      obj.featureType === emp3.api.enums.FeatureTypeEnum.GEO_POLYGON ||
      obj.featureType === emp3.api.enums.FeatureTypeEnum.GEO_ACM ||
      obj.featureType === emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE ||
      obj.featureType === emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE ||
      obj.featureType === emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE ||
      obj.featureType === emp3.api.enums.FeatureTypeEnum.GEO_SQUARE ||
      obj.featureType === emp3.api.enums.FeatureTypeEnum.GEO_TEXT) {
      result = true;
    }
  }

  return result;
};

/**
 * Returns the approximate memory usage, in bytes, of the specified object.
 * @private
 *
 * @param {Object} object the object whose size should be determined
 * @return {Number} A close approximation of the size of the object.
 * @ignore
 */
function sizeof(object) { // eslint-disable-line no-unused-vars

  // initialise the list of objects and size
  var objects = [object];
  var size = 0,
    key,
    index,
    len = objects.length;

  // loop over the objects
  for (index = 0; index < len; index++) {

    // determine the type of the object
    switch (typeof objects[index]) {

      // the object is a boolean
      case 'boolean':
        size += 4;
        break;

      // the object is a number
      case 'number':
        size += 8;
        break;

      // the object is a string
      case 'string':
        size += 2 * objects[index].length;
        break;

      // the object is a generic object
      case 'object':

        // if the object is not an array, add the sizes of the keys
        if (Object.prototype.toString.call(objects[index]) != '[object Array]') {
          for (key in objects[index]) size += 2 * key.length;
        }

        // loop over the keys
        for (key in objects[index]) {

          // determine whether the value has already been processed
          var processed = false;
          for (var search = 0; search < objects.length; search++) {
            if (objects[search] === objects[index][key]) {
              processed = true;
              break;
            }
          }

          // queue the value to be processed if appropriate
          if (!processed) objects.push(objects[index][key]);

        }
    }
  }

  // return the calculated size
  return size;
}

/**
 * Retrieves an old properties object from a v3 Feature to work
 * with CMAPI 1.3.
 *
 * @param {emp3.api.Feature} feature The feature we are obtaining the properties
 * from.
 * @return {Properties} A legacy properties object from v2/early v3.
 * @ignore
 */
emp3.api.getProperties = function (feature) {

  var properties = {};

  // Handle generic properties
  properties.featureType = feature.featureType;
  properties.readOnly = feature.readOnly;
  properties.azimuth = feature.azimuth;
  properties.buffer = feature.buffer;
  properties.timeStamp = feature.timeStamp;
  properties.extrude = feature.extrude;
  properties.tessellate = feature.tessellate;
  properties.altitudeMode = emp3.api.convertAltitudeMode(feature.altitudeMode);
  properties.useProxy = feature.useProxy;

  if (feature.labelStyle) {
    properties.labelStyle = feature.labelStyle;
    if (typeof feature.labelStyle.color === "object") {
      properties.labelColor = emp.util.convertColorToHexColor(feature.labelStyle.color);
    } else {
      properties.labelColor = feature.labelStyle.color;
    }
    if (typeof feature.labelStyle.outlineColor === "object") {
      properties.outlineColor = emp.util.convertColorToHexColor(feature.labelStyle.outlineColor);
    } else {
      properties.outlineColor = feature.labelStyle.outlineColor;
    }
    properties.labelScale = feature.labelStyle.labelScale;
    properties.labelStyle.family = feature.labelStyle.fontFamily; // Handles legacy family property
  }

  if (feature.fillStyle) {
    properties.fillStyle = feature.fillStyle;
    if (typeof feature.fillStyle.fillColor === "object") {
      properties.fillColor = emp.util.convertColorToHexColor(feature.fillStyle.fillColor);
    } else {
      properties.fillColor = feature.fillStyle.fillColor;
    }
    properties.fillPattern = feature.fillStyle.fillPattern;
  }

  if (feature.strokeStyle) {
    properties.strokeStyle = feature.strokeStyle;
    properties.lineWidth = feature.strokeStyle.strokeWidth;
    if (typeof feature.strokeStyle.strokeColor === "object") {
      properties.lineColor = emp.util.convertColorToHexColor(feature.strokeStyle.strokeColor);
    } else {
      properties.lineColor = feature.strokeStyle.strokeColor;
    }
    properties.strokeDashstyle = feature.strokeStyle.strokePattern;
  }

  // Handle type specific properties
  switch (feature.featureType) {
    case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
      properties.attributes = feature.attributes;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
      properties.radius = feature.radius;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
      properties.semiMinor = feature.semiMinor;
      properties.semiMajor = feature.semiMajor;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
      properties.modifiers = feature.modifiers || {};
      properties.modifiers.standard = feature.symbolStandard;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
      // No extra properties
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
      properties.stippleFactor = feature.stippleFactor;
      properties.stipplePattern = feature.stipplePattern;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
      properties.iconUrl = feature.iconURI;
      properties.iconYOffset = feature.offsetY;
      properties.iconXOffset = feature.offsetX;
      properties.iconSize = feature.iconSize;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
      properties.width = feature.width;
      properties.height = feature.height;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
      properties.width = feature.width;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
    default:
      // Nothing extra required
  }

  return properties;
};

/**
 * @param newAltitudeMode
 * @returns {cmapi.enums.altitudeMode}
 * @ignore
 */
emp3.api.convertAltitudeMode = function (newAltitudeMode) {
  var val;

  switch (newAltitudeMode) {
    case cmapi.enums.altitudeMode.CLAMP_TO_GROUND:
      val = "clampToGround";
      break;
    case cmapi.enums.altitudeMode.RELATIVE_TO_GROUND:
      val = "relativeToGround";
      break;
    case cmapi.enums.altitudeMode.ABSOLUTE:
      val = "absolute";
      break;
    default:
      val = undefined;
  }

  return val;
};

/**
 * Sets the properties onto the feature.
 * @ignore
 */
emp3.api.convertCMAPIPropertiesToFeature = function (feature, properties) {

  // Handle generic properties
  feature.fillColor = properties.fillColor;
  feature.strokeColor = properties.lineColor;
  feature.strokeWidth = properties.lineWidth;
  feature.altitudeMode = emp3.api.convertAltitudeMode(properties.altitudeMode);
  feature.strokePattern = properties.strokeDashstyle;
  feature.readOnly = properties.readOnly;
  feature.labelColor = properties.labelColor;
  feature.labelScale = properties.labelScale;
  feature.azimuth = properties.azimuth;
  feature.buffer = properties.buffer;
  feature.timeStamp = properties.timeStamp;
  feature.extrude = properties.extrude;
  feature.tessellate = properties.tessellate;
  feature.useProxy = properties.useProxy;

  // Handle type specific properties
  switch (properties.featureType) {
    case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
      feature.attributes = properties.attributes;
      feature.labelStyle = properties.labelStyle;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
      feature.radius = properties.radius;
      feature.strokeWidth = properties.lineThickness; // TODO is the proper value lineWidth or lineThickness
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
      feature.semiMajor = properties.semiMajor;
      feature.semiMinor = properties.semiMinor;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
      feature.modifiers = properties.modifiers || {};
      feature.modifiers.standard = feature.symbolStandard;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
      feature.labelStyle = properties.labelStyle;
      feature.iconURI = properties.iconUrl;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
      feature.stippleFactor = properties.stippleFactor;
      feature.stipplePattern = properties.stipplePattern;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
      feature.width = properties.width;
      feature.height = properties.height;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
      feature.width = properties.width;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
      break;
  }
};

/**
 * Convert a location array used to pass coordinates from drawing
 * to a CMAPI GeoPositionGroup.
 * @param {Array} locations
 *
 * @ignore
 */
emp3.api.convertLocationArrayToCMAPI = function (locations) {
  var newLocations = [],
    i, k,
    len = locations.length;

  for (i = 0, k = len; i < k; i += 1) {
    newLocations.push({
      latitude: locations[i].lat,
      longitude: locations[i].lon,
      altitude: locations[i].alt
    });
  }

  return newLocations;
};

/**
 * Converts a IGeoPositionGroup to a GeoJSON coordinates array.  This does
 * not return a geoJSON object but the coordinates that will go in the
 * coordinates field of a GeoJSON object.
 *
 * @param {emp3.api.GeoPosition[]} positions
 * @param {String} type - The GeoJSON type that we are targeting.
 *
 * @return {Array} An array as specified by the GeoJSON specification for
 * the coordinates field.  The array format returned depends on the type passed
 * in
 * @ignore
 */
emp3.api.convertCMAPIPositionsToGeoJson = function (positions, type) {
  var coords = [],
    j, len;

  type = type || "LineString";

  if (type === "Point") {
    // Point is a
    coords.push(positions[0].longitude);
    coords.push(positions[0].latitude);
    if (positions[0].altitude) {
      coords.push(positions[0].altitude);
    }
  } else if (type === "LineString") {
    len = positions.length;
    for (j = 0; j < len; j++) {
      if (positions[j].altitude) {
        coords.push([positions[j].longitude, positions[j].latitude, positions[j].altitude]);
      } else {
        coords.push([positions[j].longitude, positions[j].latitude]);
      }
    }
  } else if (type === "Polygon") {
    //Polygons are 3 dimensional arrays.  Make sure to add the 3rd dimension.
    coords.push([]);
    len = positions.length;
    for (j = 0; j < len; j++) {
      if (positions[j].altitude) {
        coords[0].push([positions[j].longitude, positions[j].latitude, positions[j].altitude]);
      } else {
        coords[0].push([positions[j].longitude, positions[j].latitude]);
      }
    }
  }

  return coords;
};

/**
 * Converts a geojson object into GeoPositionGroup.
 * @ignore
 * @return {cmapi.IGeoPositionGroup} a GeoPositionGroup that can be used as
 * positions for any feature object.
 */
emp3.api.convertGeoJsonToCMAPIPositions = function (geojson) {
  var positions = [],
    position,
    i;

  // only handling point, linestring and polygon for now.  All data should
  // be these 3.
  if (geojson.type) {
    if (geojson.type === "Point") {
      position = {
        longitude: geojson.coordinates[0],
        latitude: geojson.coordinates[1]
      };
      positions.push(position);
    } else if (geojson.type === "LineString") {
      for (i = 0; i < geojson.coordinates.length; i += 1) {
        position = {
          longitude: geojson.coordinates[i][0],
          latitude: geojson.coordinates[i][1]
        };
        positions.push(position);
      }
    } else if (geojson.type === "Polygon") {
      // Our polygon cannot handle holes, ignore first dimension
      // of coordinates.
      for (i = 0; i < geojson.coordinates[0].length; i += 1) {
        position = {
          longitude: geojson.coordinates[0][i][0],
          latitude: geojson.coordinates[0][i][1]
        };
        positions.push(position);
      }
    }
  }

  return positions;
};

/**
 * Converts a Feature into GeoJSON so that it can be processed by the
 * CMAPI 1.3 handlers.
 *
 * @param {emp3.api.Feature} feature
 *
 * @return {Object} A GeoJSON object that is usable to pass to the
 * CMAPI 1.3 handler.
 *
 * @ignore
 */
emp3.api.convertFeatureToGeoJSON = function (feature) {

  var convertedFeature = {};

  // First determine the type of GeoJSON this symbolCode
  // will be.  This is determined by the Feature type.
  // Once we do this we can figure out how the coordinates should
  // be translated.
  switch (feature.featureType) {
    case emp3.api.enums.FeatureTypeEnum.GEOJSON:
      return feature.GeoJSONData;
    case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
    case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
      convertedFeature.type = "Point";
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
      convertedFeature.type = "Point";
      //convertedFeature.symbolCode = "PBS_CIRCLE-----";
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
      convertedFeature.type = "Point";
      //convertedFeature.symbolCode = "PBS_ELLIPSE----";
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
      convertedFeature.type = "Point";
      //convertedFeature.symbolCode = "PBS_RECTANGLE--";
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
      convertedFeature.type = "Point";
      //convertedFeature.symbolCode = "PBS_SQUARE-----";
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
      convertedFeature.type = "LineString";
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
      convertedFeature.type = "Polygon";
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
      if (armyc2.c2sd.renderer.utilities.SymbolUtilities.isMultiPoint(feature.symbolCode, 0)) {
        convertedFeature.type = "LineString";
      } else {
        convertedFeature.type = "Point";
      }
      convertedFeature.symbolCode = feature.symbolCode;
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
      if (feature.acmType === cmapi.enums.acmType.CYLINDER ||
        feature.acmType === cmapi.enums.acmType.RADARC) {
        convertedFeature.type = "Point";
      } else {
        convertedFeature.type = "LineString";
      }
      convertedFeature.symbolCode = feature.acmType;
      break;
    default:
      convertedFeature.type = "Point";
      break;
  }

  // We have the type, we can get the coordinate string now.
  convertedFeature.coordinates = emp3.api.convertCMAPIPositionsToGeoJson(feature.positions, convertedFeature.type);

  return convertedFeature;
};

/**
 * Converts a Feature into KML so that it can be processed by the
 * CMAPI 1.3 handlers.
 *
 * @param {emp3.api.Feature} feature
 *
 * @return {Object} A KML string that is usable to pass to the
 * CMAPI 1.3 handler.
 *
 * @ignore
 */
emp3.api.convertFeatureToKML = function (feature) {
  return feature.KMLString;
};

/**
 * Converts the map status types from CMAPI to emp3 api enumeration values.
 * @returns {emp3.api.enums.MapStateEnum}
 * @ignore
 */
emp3.api.convertStatusType = function (status) {
  var result;

  switch (status) {
    case "init":
      result = emp3.api.enums.MapStateEnum.INIT_IN_PROGRESS;
      break;
    case "ready":
      result = emp3.api.enums.MapStateEnum.MAP_READY;
      break;
    case "teardown":
      result = emp3.api.enums.MapStateEnum.SHUTDOWN;
      break;
    case "mapswapinprogress":
      result = emp3.api.enums.MapStateEnum.MAP_SWAP_IN_PROGRESS;
      break;
    case "shutdowninprogress":
      result = emp3.api.enums.MapStateEnum.SHUTDOWN_IN_PROGRESS;
      break;
    default:
      result = status;
      break;
  }

  return result;
};

/**
 * From base information from a CMAPI 1.3 message, produce a CMAPI 2.0 feature.
 * @param {object} args
 * @param {emp3.api.enums.FeatureTypeEnum} args.type
 * @param {string} args.name
 * @param {string} args.geoId
 * @param {object} args.coordinates
 * @param {string} [args.symbolCode]
 * @param {object} args.properties
 *
 * @ignore
 */
emp3.api.buildFeature = function (args) {
  var feature,
    standardArgs = {
      name: args.name,
      geoId: args.geoId,
      positions: args.coordinates
    };

  switch (args.type) {
    case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
      feature = new emp3.api.Point(standardArgs);
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
      feature = new emp3.api.Path(standardArgs);
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
      feature = new emp3.api.Polygon(standardArgs);
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
      feature = new emp3.api.Square(standardArgs);
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
      feature = new emp3.api.Rectangle(standardArgs);
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
      feature = new emp3.api.Circle(standardArgs);
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
      feature = new emp3.api.Ellipse(standardArgs);
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
      standardArgs.symbolCode = args.symbolCode;
      feature = new emp3.api.MilStdSymbol(standardArgs);
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
      feature = new emp3.api.Text(standardArgs);
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
      feature = new emp3.api.AirControlMeasure(standardArgs);
      break;
    case emp3.api.enums.FeatureTypeEnum.KML:
      delete standardArgs.positions;
      standardArgs.KMLString = args.KMLString;
      feature = new emp3.api.KML(standardArgs);
      break;
    case emp3.api.enums.FeatureTypeEnum.GEOJSON:
      delete standardArgs.positions;
      standardArgs.GeoJSONData = JSON.stringify(args.GeoJSONData);
      feature = new emp3.api.GeoJSON(standardArgs);
      break;
    default:
    // TODO warn on unhandled/invalid type
  }

  emp3.api.convertCMAPIPropertiesToFeature(feature, args.properties);

  return feature;
};

/**
 * From base information from a CMAPI 1.3 message, produce a CMAPI 2.0 overlay.
 * @returns {emp3.api.Overlay}
 * @ignore
 */
emp3.api.buildOverlay = function (args) {
  var overlay;

  overlay = new emp3.api.Overlay({
    name: args.name,
    geoId: args.geoId,
    dataProviderId: args.dataProviderId,
    description: args.description,
    properties: args.properties,
    children: args.children,
    readOnly: args.readOnly
  });

  return overlay;
};
