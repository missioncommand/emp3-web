/* global sec */
var emp = window.emp || {};

/**
 *
 * EMP Helpers is a set of common functions used to facilitate action amongst the core.
 * @namespace emp.helpers
 */
emp.helpers = {};

/**
 *
 * @method
 * @description This function makes a copy of an object by stringifying and parsing it.
 */
emp.helpers.copyObject = function(oFrom) {
  if ((oFrom instanceof Array) || (typeof(oFrom) === 'object')) {
    var sStr = JSON.stringify(oFrom);
    return JSON.parse(sStr);
  }

  return oFrom;
};

/**
 * Simple helper to break up coreId's and reset them.
 * @type {Object}
 * @namespace  emp.helpers.id
 */
emp.helpers.id = {};

/**
 * Various methods used to extract or generate Id's
 * @namespace emp.helpers.id.get
 * @memberof  emp.helpers.id
 * @inner
 */
emp.helpers.id.get = {}; // stub


/**
 * This function is no longer used. It is deprecated.
 *
 * @param  {object} args
 * @public
 * @return {string|undefined}
 * @inner
 * @deprecated
 */
emp.helpers.id.get.coreId = function(args) {

  var sOverlayId = args.overlayId;
  var sFeatureId = args.featureId || args.id;

  var oStorageEntry = emp.storage.get.byIds({
    overlayId: sOverlayId,
    featureId: sFeatureId
  });

  if (oStorageEntry) {
    return oStorageEntry.coreId;
  }

  return undefined;
};

/**
 * Returns coreParent of the item identified in args
 * @param  {object} args
 * @return {string}
 */
emp.helpers.id.get.coreParent = function(args) {

  if (args !== undefined && args !== null) {
    if (args.coreId !== undefined && args.coreId !== null) {
      var oStorageItem = emp.storage.get.id({
        id: args.coreId
      });

      if (oStorageItem) {
        return oStorageItem.coreParent;
      }
    }
  }

  return undefined;
};

/**
 * Returns setId verifies the value to be an id or undefined.
 * @param  {string} sId
 * @return {undefined|string}
 */
emp.helpers.id.get.setId = function(sId) {
  if (sId === undefined) {
    return;
  } else if (sId === null) {
    return;
  } else if (sId === "") {
    return;
  }
  return sId;
};

/**
 * Returns isId return true if it is an ID.
 * @param  {string} sId
 * @return {boolean}
 */
emp.helpers.id.get.isId = function(sId) {
  if (sId === undefined) {
    return false;
  } else if (sId === null) {
    return false;
  } else if (sId === "") {
    return false;
  }
  return true;
};

/**
 *
 * @returns {string}
 */
emp.helpers.id.newGUID = function() {
  //this needs to be checked against table of used ID's to avoid collisions
  var lut = emp.helpers.id.newGUID.lut;
  var d0 = Math.random() * 0xffffffff | 0;
  var d1 = Math.random() * 0xffffffff | 0;
  var d2 = Math.random() * 0xffffffff | 0;
  var d3 = Math.random() * 0xffffffff | 0;

  return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
    lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
    lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] + '-' +
    lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
};

/**
 *
 */
emp.helpers.id.newGUID.lut = function() {
  var lut = [];
  for (var i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
  }
  return lut;
}();

/**
 * @borrows emp.util.isAirspaceSymbol as emp.helpers.isAirspaceSymbol
 */
emp.helpers.isAirspaceSymbol = emp.util.isAirspaceSymbol;

/**
 *
 * @param oData
 * @returns {string}
 */
emp.helpers.coordinatesToString = function(oData) {
  var sCoord = "",
    iIndex,
    iPolygonIndex;


  switch (oData.type) {
    case "Point":
      sCoord = oData.coordinates[0] + "," + oData.coordinates[1];

      if (oData.coordinates.length > 2) {
        sCoord += "," + oData.coordinates[2];
      }
      break;
    case "LineString":
      for (iIndex = 0; iIndex < oData.coordinates.length; iIndex++) {
        if (sCoord.length > 0) {
          sCoord += " ";
        }

        sCoord += oData.coordinates[iIndex][0] + "," + oData.coordinates[iIndex][1];

        if (oData.coordinates[iIndex].length > 2) {
          sCoord += "," + oData.coordinates[iIndex][2];
        }
      }
      break;
    case "Polygon":
      for (iPolygonIndex = 0; iPolygonIndex < oData.coordinates.length; iPolygonIndex++) { // TODO figure out this oddity
        for (iIndex = 0; iIndex < oData.coordinates[iPolygonIndex].length; iIndex++) {
          if (sCoord.length > 0) {
            sCoord += " ";
          }

          sCoord += oData.coordinates[iPolygonIndex][iIndex][0] + "," + oData.coordinates[iPolygonIndex][iIndex][1];

          if (oData.coordinates[iPolygonIndex][iIndex].length > 2) {
            sCoord += "," + oData.coordinates[iPolygonIndex][iIndex][2];
          }
        }
        break; // Only do one.
      }
      break;
  }

  return sCoord;
};

/**
 *
 * @param oItem
 * @returns {boolean}
 */
emp.helpers.isAOI = function(oItem) {
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
};

/**
 *
 * @param mapInstanceId
 * @param oEmpFeature
 * @returns {boolean}
 */
emp.helpers.canMapEngineEditFeature = function(mapInstanceId, oEmpFeature) {
  var bRet = false;
  var oProperties;
  var mapInstance = emp.instanceManager.getInstance(mapInstanceId);

  try {
    switch (oEmpFeature.getFormat()) {
      case emp.typeLibrary.featureFormatType.KML:
        if (mapInstance.engine.capabilities.formats.KML_BASIC.edit ||
          mapInstance.engine.capabilities.formats.KML_COMPLEX.edit) {
          bRet = true;
        }
        break;
      case emp.typeLibrary.featureFormatType.GEOJSON:
        if (oEmpFeature.isAOI()) {
          if (mapInstance.engine.capabilities.formats.AOI.edit) {
            bRet = true;
          }
        } else if (mapInstance.engine.capabilities.formats.GEOJSON_BASIC.edit ||
          mapInstance.engine.capabilities.formats.GEOJSON_FULL.edit) {
          bRet = true;
        }
        break;
      case emp.typeLibrary.featureFormatType.WMS:
        break;
      case emp.typeLibrary.featureFormatType.IMAGE:
        if (mapInstance.engine.capabilities.formats.IMAGE.edit) {
          bRet = true;
        }
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
        oProperties = oEmpFeature.getProperties();
        if (oProperties && oProperties.hasOwnProperty('radius')) {
          bRet = true;
        }
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
        oProperties = oEmpFeature.getProperties();
        if (oProperties && oProperties.hasOwnProperty('semiMajor') &&
          oProperties.hasOwnProperty('semiMinor')) {
          bRet = true;
        }
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
        oProperties = oEmpFeature.getProperties();
        if (oProperties && oProperties.hasOwnProperty('width') &&
          oProperties.hasOwnProperty('height')) {
          bRet = true;
        }
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
        oProperties = oEmpFeature.getProperties();
        if (oProperties && oProperties.hasOwnProperty('width')) {
          bRet = true;
        }
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
      case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
      case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
      case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
        bRet = true;
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
        oProperties = oEmpFeature.getProperties();
        if (oProperties && (oProperties.standard)) {
          switch (oProperties.standard.toUpperCase()) {
            case emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B:
              if (mapInstance.engine.capabilities.formats.MILSTD.version2525B.edit) {
                bRet = true;
              }
              break;
            case emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C:
              if (mapInstance.engine.capabilities.formats.MILSTD.version2525C.edit) {
                bRet = true;
              }
              break;
          }
        } else if (mapInstance.engine.capabilities.formats.MILSTD.version2525B.edit ||
          mapInstance.engine.capabilities.formats.MILSTD.version2525C.edit) {
          bRet = true;
        }

        if (bRet) {
          if (!oProperties.hasOwnProperty("modifiers")) {
            // Has no modifiers
            break;
          } else {
            var symbolId = oEmpFeature.getSymbolCode().substring(4, 10);
            var oModifiers = oProperties.modifiers;

            // If it can edit this milstd, we need to see if its one that gets
            // rendered as 3D.
            if (!sec.web.renderer.utilities.JavaRendererUtilities.is3dSymbol(oEmpFeature.getSymbolCode(), oModifiers)) {
              // Its not a 3D graphic
              break;
            } else if (!oModifiers.hasOwnProperty("altitudeDepth")) {
              // Has no altitude
              break;
            } else if (!(oModifiers.altitudeDepth instanceof Array)) {
              // Altitude is not an array
              break;
            } else if (oModifiers.altitudeDepth.length < 2) {
              // Not enough altitudes
              break;
            }

            if ((symbolId === "ALC---") ||
              (symbolId === "ALM---") ||
              (symbolId === "ALS---") ||
              (symbolId === "ALU---") ||
              (symbolId === "ALL---")) {
              if (!oModifiers.hasOwnProperty("distance")) {
                // It should have a distnace and it does not.
                break;
              }

              var iCoordinateCnt = oEmpFeature.getData().coordinates.length - 1;

              if (oModifiers.altitudeDepth.length < (2 * iCoordinateCnt)) {
                // Not enough altitudes
                // It need 2 per segment.
                break;
              } else if (oModifiers.distance.length < iCoordinateCnt) {
                // It does not have at least iCoordinateCnt # of distances.
                // It need one per segment.
                break;
              } else if (!mapInstance.engine.capabilities.formats.AIRSPACE.edit) {
                // This map can't edit this 3D MilStd airspaces.
                bRet = false;
              }
            } else if ((symbolId === "ACAC--") || (symbolId === "AKPC--") ||
              (symbolId === "ACAR--") || (symbolId === "AKPR--")) {
              if (!oModifiers.hasOwnProperty("distance")) {
                // It should have a distnace and it does not.
                break;
              } else if (oModifiers.distance.length < 1) {
                // It does not have a distance.
                break;
              } else if (!mapInstance.engine.capabilities.formats.AIRSPACE.edit) {
                // This map can't edit this 3D MilStd airspaces.
                bRet = false;
              }
            }
            // All of the other symbols only need the altitude
            else if (!mapInstance.engine.capabilities.formats.AIRSPACE.edit) {
              // This map can't edit this 3D MilStd airspaces.
              bRet = false;
            }
          }
        }
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
        if (mapInstance.engine.capabilities.formats.AIRSPACE.edit) {
          bRet = true;
        }
        break;
    }
  } catch (e) {
    // just in case
    bRet = true;
  }
  return bRet;
};

/**
 *
 * @param mapInstanceId
 * @param oEmpFeature
 * @returns {boolean}
 */
emp.helpers.canMapEnginePlotFeature = function(mapInstanceId, oEmpFeature) {
  var bRet = false;
  var oProperties;
  var mapInstance = emp.instanceManager.getInstance(mapInstanceId);

  try {
    switch (oEmpFeature.getCoreObjectType()) {
      case emp.typeLibrary.types.OVERLAY:
        break;
      case emp.typeLibrary.types.FEATURE:
        switch (oEmpFeature.getFormat()) {
          case emp.typeLibrary.featureFormatType.KML:
            if (mapInstance.engine.capabilities.formats.KML_BASIC.plot ||
              mapInstance.engine.capabilities.formats.KML_COMPLEX.plot) {
              bRet = true;
            }
            break;
          case emp.typeLibrary.featureFormatType.GEOJSON:
          case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
          case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
          case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
          case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
          case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
          case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
          case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
          case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
            if (oEmpFeature.isAOI()) {
              if (mapInstance.engine.capabilities.formats.AOI.plot) {
                bRet = true;
              }
            } else if (mapInstance.engine.capabilities.formats.GEOJSON_BASIC.plot ||
              mapInstance.engine.capabilities.formats.GEOJSON_FULL.plot) {
              bRet = true;
            }
            break;

          case emp.typeLibrary.featureFormatType.IMAGE:
            if (mapInstance.engine.capabilities.formats.IMAGE.plot) {
              bRet = true;
            }
            break;
          case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
            oProperties = oEmpFeature.getProperties();
            if (oProperties && (oProperties.standard)) {
              switch (oProperties.standard.toUpperCase()) {
                case emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B:
                  if (mapInstance.engine.capabilities.formats.MILSTD.version2525B.plot) {
                    bRet = true;
                  }
                  break;
                case emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C:
                  if (mapInstance.engine.capabilities.formats.MILSTD.version2525C.plot) {
                    bRet = true;
                  }
                  break;
              }
            } else if (mapInstance.engine.capabilities.formats.MILSTD.version2525B.plot ||
              mapInstance.engine.capabilities.formats.MILSTD.version2525C.plot) {
              bRet = true;
            }

            if (bRet) {
              if (!oProperties.hasOwnProperty("modifiers")) {
                // Has no modifiers
                break;
              } else {
                var symbolId = oEmpFeature.getSymbolCode().substring(4, 10);
                var oModifiers = oProperties.modifiers;

                // If it can edit this milstd, we need to see if its one that gets
                // rendered as 3D.
                if (!sec.web.renderer.utilities.JavaRendererUtilities.is3dSymbol(oEmpFeature.getSymbolCode(), oModifiers)) {
                  // Its not a 3D graphic
                  break;
                } else if (!oModifiers.hasOwnProperty("altitudeDepth")) {
                  // Has no altitude
                  break;
                } else if (!(oModifiers.altitudeDepth instanceof Array)) {
                  // Altitude is not an array
                  break;
                } else if (oModifiers.altitudeDepth.length < 2) {
                  // Not enough altitudes
                  break;
                }

                if ((symbolId === "ALC---") ||
                  (symbolId === "ALM---") ||
                  (symbolId === "ALS---") ||
                  (symbolId === "ALU---") ||
                  (symbolId === "ALL---")) {
                  if (!oModifiers.hasOwnProperty("distance")) {
                    // It should have a distnace and it does not.
                    break;
                  }

                  var iCoordinateCnt = oEmpFeature.getData().coordinates.length - 1;

                  if (oModifiers.altitudeDepth.length < (2 * iCoordinateCnt)) {
                    // Not enough altitudes
                    // It need 2 per segment.
                    break;
                  } else if (oModifiers.distance.length < iCoordinateCnt) {
                    // It does not have at least iCoordinateCnt # of distances.
                    // It need one per segment.
                    break;
                  } else if (!mapInstance.engine.capabilities.formats.AIRSPACE.plot) {
                    // This map can't edit this 3D MilStd airspaces.
                    bRet = false;
                  }
                } else if ((symbolId === "ACAC--") || (symbolId === "AKPC--") ||
                  (symbolId === "ACAR--") || (symbolId === "AKPR--")) {
                  if (!oModifiers.hasOwnProperty("distance")) {
                    // It should have a distance and it does not.
                    break;
                  } else if (oModifiers.distance.length < 1) {
                    // It does not have a distance.
                    break;
                  } else if (!mapInstance.engine.capabilities.formats.AIRSPACE.plot) {
                    // This map can't edit this 3D MilStd airspaces.
                    bRet = false;
                  }
                }
                // All of the other symbols only need the altitude
                else if (!mapInstance.engine.capabilities.formats.AIRSPACE.plot) {
                  // This map can't edit this 3D MilStd airspaces.
                  bRet = false;
                }
              }
            }
            break;
          case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
            if (mapInstance.engine.capabilities.formats.AIRSPACE.plot) {
              bRet = true;
            }
            break;
        }
        break;
      case emp.typeLibrary.types.WMS:
        if ((mapInstance.engine.capabilities.formats.WMS.version_1_1 &&
          (oEmpFeature.getVersion().substr(0, 3) === '1.1')) ||
          (mapInstance.engine.capabilities.formats.WMS.version_1_3 &&
          (oEmpFeature.getVersion().substr(0, 3) === '1.3'))) {
          bRet = true;
        }
        break;
      case emp.typeLibrary.types.WMTS:
        if (mapInstance.engine.capabilities.formats.WMTS) {
          bRet = true;
        }
        break;
      case emp.typeLibrary.types.KML:
        if (mapInstance.engine.capabilities.formats.KML_LAYER) {
          bRet = true;
        }
        break;
    }
  } catch (e) {
    // just in case
    bRet = true;
  }
  return bRet;
};

/**
 * @method
 * @description This function searches an array of objects for an entry that
 * contains a property name equal to the content of fieldName that has a value equal to the content of
 * fieldValue.
 * @param {type} oArray This parameters must contain the array of objects to search thru.
 * @param {type} fieldName This parameter contains the name of the property to compare.
 * @param {type} fieldValue This parameters contains the value to match with the property.
 * @returns {Number} It return the 0 base index of the elements found or -1 if a match is not found.
 */
emp.helpers.findIndexOf = function(oArray, fieldName, fieldValue) {
  for (var iIndex = 0; iIndex < oArray.length; iIndex++) {
    if (oArray[iIndex].hasOwnProperty(fieldName) &&
      (oArray[iIndex][fieldName] === fieldValue))
      return iIndex;
  }

  return -1;
};

/**
 * @namespace
 */
emp.helpers.associativeArray = {};

/**
 *
 * @param aArray
 * @returns {number}
 */
emp.helpers.associativeArray.size = function(aArray) {
  var size = 0,
    key;
  for (key in aArray) {
    if (aArray.hasOwnProperty(key)) {
      size++;
    }
  }
  return size;
};

/**
 *
 * @param aArray
 * @returns {boolean}
 */
emp.helpers.associativeArray.isEmpty = function(aArray) {
  var key;
  for (key in aArray) {
    if (aArray.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

/**
 *
 * @param aArray
 * @returns {Array}
 */
emp.helpers.associativeArray.getKeys = function(aArray) {
  var aKeys = [];
  var key;
  for (key in aArray) {
    if (aArray.hasOwnProperty(key)) {
      // Push it only if its a property.
      aKeys.push(key);
    }
  }
  return aKeys;
};
// Append the window location to a relative path to turn it into an absolute path
emp.helpers.relToAbs = function(url) {
  /* Only accept commonly trusted protocols:
   * Only data-image URLs are accepted, Exotic flavours (escaped slash,
   * html-entitied characters) are not supported to keep the function fast */
  if (/^(https?:|file:|ftps?:|mailto:|javascript:|data:image\/[^;]{2,9})/i.test(url))
    return url; //Url is already absolute

  var base_url = location.href.match(/^(.+)\/?(?:#.+)?$/)[0] + "/";
  if (url.substring(0, 2) === "//")
    return location.protocol + url;
  else if (url.charAt(0) === "/")
    return location.protocol + "//" + location.host + url;
  else if (url.substring(0, 2) === "./")
    url = "." + url;
  else if (/^\s*$/.test(url))
    return ""; //Empty = Return nothing
  else url = "../" + url;

  url = base_url + url;
  while (/\/\.\.\//.test(url)) {
    url = url.replace(/[^\/]+\/+\.\.\//i, "");
  }

  /* Escape certain characters to prevent XSS */
  url = url.replace(/\.$/, "").replace(/\/\./g, "").replace(/"/g, "%22")
    .replace(/'/g, "%27").replace(/</g, "%3C").replace(/>/g, "%3E");
  return url;

};

/**
 * @function
 * @description This function pareses a string for replacement parameters.
 * For each replacement parameter found the callback is called to obtain
 * the value.
 * @param {String} sStr The string with or without replacements parameters.
 * @param {function} fnCallback The function which is called to obtain the value.
 * The function must be of the form function(sParam) and must return a string.
 * @returns {String}
 */
emp.helpers.getReplacementString = function(sStr, fnCallback) {
  var sStrCopy = sStr;
  var sParam;
  var sValue;
  var bContinue = true;
  var iParamStart = 0;
  var iParamEnd;
  var oRegExp;

  if (typeof(fnCallback) !== 'function') {
    throw new Error("fnCallback parameter is not a function.");
  }

  if (typeof(sStr) !== 'string') {
    throw new Error("sStr parameter is not a string.");
  }

  while (bContinue) {
    iParamStart = sStrCopy.indexOf("${");

    if (iParamStart === -1) {
      bContinue = false;
      continue;
    }

    iParamEnd = sStrCopy.indexOf("}");
    if (iParamEnd === -1) {
      bContinue = false;
      continue;
    }

    sParam = sStrCopy.substring(iParamStart + 2, iParamEnd);

    if (sParam.length === 0) {
      oRegExp = new RegExp("\\$\\{\\}", "g");
      sStrCopy = sStrCopy.replace(oRegExp, "[REPLACEMENT PARAMETER NOT PROVIDED]");
    } else {
      sValue = fnCallback(sParam);

      if (typeof(sValue) !== 'string') {
        throw new Error("replacement value returned for " + sParam + " is not a string.");
      }

      oRegExp = new RegExp("\\$\\{" + sParam + "\\}", "g");
      sStrCopy = sStrCopy.replace(oRegExp, sValue);
    }
  }

  return sStrCopy;
};

/**
 * @function
 * @description Function that creates a circles in a canvas element and returns
 * the canvas.
 * @argument {object} oArgs An object with the following structure.
 * @argument {Integer} oArgs.iRadius Required parameter containing the radius of
 * the circle in pixels.
 * @argument {Number} oArgs.dOpacity Required parameter containing the opacity
 * value for the circle.
 * @argument {String=} oArgs.sStrokeColor Optional parameter which if provided the
 * circle is drawn with a border of this color.
 * @argument {Integer=} oArgs.iLineWidth Optional parameters used for the line
 * width of the circumference if drawn. Default value 1.
 * @argument {String=} oArgs.sFillColor Optional circle fill color.
 * @argument {String=} oArgs.sGradientColor Optional color used to create a radial
 * gradient. If this property is provided the fill color must be provided.
 * @argument {String=} sTextColor Optional text color. The Default is black.
 * @argument {String=} oArgs.sText Optional text, which if provided will be centered
 * in the circle.
 */
emp.helpers.createCircleCanvas = function(oArgs) {
  var iRadius = oArgs.iRadius;
  var dOpacity = oArgs.dOpacity;
  var sStrokeColor = oArgs.sStrokeColor;
  var sFillColor = oArgs.sFillColor;
  var sGradientColor = oArgs.sGradientColor;
  var sTextColor = oArgs.sTextColor;
  var sText = oArgs.sText;
  var iLineWidth = oArgs.iLineWidth || 1;

  var iWidth = (iRadius * 2);
  var iHeight = iWidth;
  var iX = iRadius;
  var iY = iRadius;
  var oCanvas = document.createElement('canvas');
  var oCtx;

  if (typeof(iRadius) !== "number") {
    throw new Error("Invalid radius.");
  }

  if (typeof(dOpacity) !== "number") {
    throw new Error("Invalid opacity.");
  }

  if (sGradientColor && !sFillColor) {
    throw new Error("If a gradient color is provided a fill color must be provided.");
  }

  if (sGradientColor && (typeof(sGradientColor) !== "string")) {
    throw new Error("Invalid gradient color. It must be a string.");
  }

  if (sStrokeColor && (typeof(sStrokeColor) !== "string")) {
    throw new Error("Invalid stroke color. It must be a string.");
  }

  if (sFillColor && (typeof(sFillColor) !== "string")) {
    throw new Error("Invalid fill color. It must be a string.");
  }

  if (sTextColor && (typeof(sTextColor) !== "string")) {
    throw new Error("Invalid text color. It must be a string.");
  } else if (!sTextColor) {
    sTextColor = "black";
  }

  oCanvas.width = iWidth;
  oCanvas.height = iHeight;
  oCtx = oCanvas.getContext("2d");

  oCtx.beginPath();
  oCtx.globalAlpha = dOpacity;

  if (sGradientColor) {
    var oGradient = oCtx.createRadialGradient(iRadius, iRadius, Math.round(iRadius * 0.7), iRadius, iRadius, iRadius);
    oGradient.addColorStop(0, sFillColor);
    oGradient.addColorStop(1, sGradientColor);

    oCtx.fillStyle = oGradient;
  } else if (sFillColor) {
    oCtx.fillStyle = sFillColor;
  }

  if (sFillColor) {
    oCtx.arc(iX, iY, iRadius, 0, 2 * Math.PI);
    oCtx.fill();
  }

  if (sStrokeColor) {
    oCtx.lineWidth = iLineWidth;
    oCtx.strokeStyle = sStrokeColor;
    oCtx.arc(iX, iY, (iRadius - iLineWidth), 0, 2 * Math.PI);
    oCtx.stroke();
  }

  function wrapText(context, text, x, y, lineHeight, iMaxWidth) {
    var iTextHeight = 0;
    var iCharIndex = 0;
    var sCurrLine = "";
    var oLines = [];
    var sTxt = text.replace("<br/>", "\n");

    while ((sTxt.length > 0) && (sTxt.charAt(0) === '\n')) {
      // Get rid of \n at the beginning.
      sTxt = sTxt.substr(1);
    }

    while (sTxt.length > 0) {
      if (iTextHeight > iMaxWidth) {
        break;
      }

      if (sTxt.charAt(iCharIndex) === '\n') {
        oLines.push(sCurrLine);
        sCurrLine = "";
        iTextHeight += lineHeight;
        sTxt = sTxt.substr(1);
      } else {
        sCurrLine += sTxt.charAt(iCharIndex);
        if (context.measureText(sCurrLine).width > iMaxWidth) {
          sCurrLine = sCurrLine.substr(0, sCurrLine.length - 1);
          oLines.push(sCurrLine);
          sCurrLine = "";
          iTextHeight += lineHeight;
        } else {
          sTxt = sTxt.substr(1);
        }
      }
    }

    if (sCurrLine.length > 0) {
      oLines.push(sCurrLine);
    }

    // x, y are in the center.
    if (oLines.length > 1) {
      // If there is more than one line we need to
      // move the y up by the correct amount.
      var yOffset = Math.floor(oLines.length / 2 * lineHeight);
      y -= yOffset;
    }

    for (var iIndex = 0; iIndex < oLines.length; iIndex++) {
      context.fillText(oLines[iIndex], x, y);
      y += lineHeight;
    }
  }

  if ((typeof(sText) === 'string') && (sText.length > 0)) {
    oCtx.globalAlpha = 1.0;
    oCtx.font = "12px Arial";
    oCtx.textAlign = "center";
    oCtx.fillStyle = sTextColor;
    var lineHeight = 12;

    wrapText(oCtx, sText, iRadius, iRadius + (lineHeight / 2), lineHeight, iWidth);
  }

  return oCanvas;
};

/**
 * This will validate an absolute URL.
 * Relative URL will fail.
 */
emp.helpers.isUrl = function(s) {
  var regexp = /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return regexp.test(s);
};

emp.helpers.oHiddenSpan = null;

/**
 *
 * @param sText
 * @param sFontFamily
 * @param sFontSize
 * @param sFontWeight
 * @returns {{width, height}}
 */
emp.helpers.getStringPixelDimensions = function(sText, sFontFamily, sFontSize, sFontWeight) {
  var iWidth = 0;
  var iHeight = 0;

  if (emp.helpers.oHiddenSpan === null) {
    var style = "position: absolute; visibility: hidden; white-space: nowrap; top: -100px; font-family: " +
      sFontFamily + "; " + "font-size: " + sFontSize + "; font-weight: " + sFontWeight + ";";

    var textMeasuringSpan = document.createElement("span");
    textMeasuringSpan.id = "empTextMeasuringSpan";
    textMeasuringSpan.setAttribute("style", style);
    document.body.insertBefore(textMeasuringSpan, null);

    emp.helpers.oHiddenSpan = document.getElementById("empTextMeasuringSpan");
  } else {
    emp.helpers.oHiddenSpan.style.fontFamily = sFontFamily;
    emp.helpers.oHiddenSpan.style.fontSize = sFontSize;
    emp.helpers.oHiddenSpan.style.fontWeight = sFontWeight;
  }

  if (emp.helpers.oHiddenSpan !== null) {
    emp.helpers.oHiddenSpan.innerHTML = sText;

    iWidth = emp.helpers.oHiddenSpan.width;
    iHeight = emp.helpers.oHiddenSpan.height;
  }

  return {
    width: iWidth,
    height: iHeight
  };
};

/**
 *
 * @param sSymbolCode
 * @returns {string}
 */
emp.helpers.getAffiliationColor = function(sSymbolCode) {
  var sColor = '000000';
  var sAffiliation = sSymbolCode.charAt(1);

  switch (sAffiliation.toUpperCase()) {
    case 'P': // PENDING
    case 'U': //UNKNOWN
    case 'G': //EXERCISE PENDING
    case 'W': //EXERCISE UNKNOWN
      sColor = 'FFFF00'; //(YELLOW)
      break;
    case 'F': //FRIEND
    case 'A': //ASSUMED FRIEND
    case 'D': //EXERCISE FRIEND
    case 'M': //EXERCISE ASSUMED FRIEND
      sColor = '00FFFF'; //(CYAN)
      break;
    case 'N': //NEUTRAL
    case 'L': //EXERCISE NEUTRAL
      sColor = '00FF00'; //(GREEN)
      break;
    case 'H': //HOSTILE
    case 'S': //SUSPECT
    case 'J': //JOKER
    case 'K': //FAKER
      sColor = 'FF0000'; //(RED)
      break;
  }

  return sColor;
};

/**
 *
 * @param sSymbolCode
 * @returns {string}
 */
emp.helpers.get3DMilStdAffiliationColor = function(sSymbolCode) {
  var sColor = '000000';
  var sAffiliation = sSymbolCode.charAt(1);

  switch (sAffiliation.toUpperCase()) {
    case 'P': // PENDING
    case 'U': //UNKNOWN
    case 'G': //EXERCISE PENDING
    case 'W': //EXERCISE UNKNOWN
      sColor = 'FFFF00'; //(YELLOW)
      break;
    case 'F': //FRIEND
    case 'A': //ASSUMED FRIEND
    case 'D': //EXERCISE FRIEND
    case 'M': //EXERCISE ASSUMED FRIEND
      sColor = '000000'; //(Black)
      break;
    case 'N': //NEUTRAL
    case 'L': //EXERCISE NEUTRAL
      sColor = '00FF00'; //(GREEN)
      break;
    case 'H': //HOSTILE
    case 'S': //SUSPECT
    case 'J': //JOKER
    case 'K': //FAKER
      sColor = 'FF0000'; //(RED)
      break;
  }

  return sColor;
};

/**
 * Checks if a string contains only whitespace return true is only spaces,the text null, undefined, false if it
 * contains any other character
 * @param str
 * @returns {boolean}
 */
emp.helpers.isEmptyString = function(str) {
  var isEmpty = false;
  if (str === undefined ||
    str === null ||
    typeof str !== "string" ||
    str === "" ||
    str === "undefined" ||
    str === "null" || !str.replace(/\s/g, '').length) {
    isEmpty = true;
  }
  return isEmpty;
};

/**
 *
 */
emp.helpers.GeoJsonHasAltitude = (function() {
  var coordinateHasAltitude = function(oGeoJsonCoord) {
    var bRet = false;

    if (Array.isArray(oGeoJsonCoord) && (oGeoJsonCoord.length > 2)) {
      bRet = true;
    }
    return bRet;
  };

  var coordinateArrayHasAltitude = function(oGeoJsonCoord) {
    var iIndex;
    var bRet = false;

    if (Array.isArray(oGeoJsonCoord)) {
      for (iIndex = 0; iIndex < oGeoJsonCoord.length; iIndex++) {
        bRet = coordinateHasAltitude(oGeoJsonCoord[iIndex]);

        if (bRet) {
          // If we find 1 altitude we can stop looking.
          break;
        }
      }
    }
    return bRet;
  };

  var polygonCoordinateHasAltitude = function(oGeoJsonCoord) {
    var iIndex;
    var bRet = false;

    if (Array.isArray(oGeoJsonCoord)) {
      for (iIndex = 0; iIndex < oGeoJsonCoord.length; iIndex++) {
        bRet = coordinateArrayHasAltitude(oGeoJsonCoord[iIndex]);

        if (bRet) {
          // If we find 1 altitude we can stop looking.
          break;
        }
      }
    }
    return bRet;
  };

  var multiPolygonCoordinateHasAltitude = function(oGeoJsonCoord) {
    var iIndex;
    var bRet = false;

    if (Array.isArray(oGeoJsonCoord)) {
      for (iIndex = 0; iIndex < oGeoJsonCoord.length; iIndex++) {
        bRet = polygonCoordinateHasAltitude(oGeoJsonCoord[iIndex]);

        if (bRet) {
          // If we find 1 altitude we can stop looking.
          break;
        }
      }
    }
    return bRet;
  };

  var publicInterface = function(oGeoJsonData) {
    var iIndex;
    var bRet = false;

    if (!oGeoJsonData.hasOwnProperty('type')) {
      emp.typeLibrary.Error({
        level: emp.typeLibrary.Error.level.CATASTROPHIC,
        message: "emp.helpers.GeoJsonHasAltitude: GeoJson with no type property. (" + oGeoJsonData + ")"
      });
    } else {
      switch (oGeoJsonData.type.toLowerCase()) {
        case 'point':
          bRet = coordinateHasAltitude(oGeoJsonData.coordinates);
          break;
        case 'multipoint':
        case 'linestring':
          bRet = coordinateArrayHasAltitude(oGeoJsonData.coordinates);
          break;
        case 'multilinestring':
        case 'polygon':
          bRet = polygonCoordinateHasAltitude(oGeoJsonData.coordinates);
          break;
        case 'multipolygon':
          bRet = multiPolygonCoordinateHasAltitude(oGeoJsonData.coordinates);
          break;
        case 'feature':
          bRet = emp.helpers.GeoJsonHasAltitude(oGeoJsonData.geometry);
          break;
        case 'featurecollection':
          if (Array.isArray(oGeoJsonData.features)) {
            for (iIndex = 0; iIndex < oGeoJsonData.features.length; iIndex++) {
              bRet = emp.helpers.GeoJsonHasAltitude(oGeoJsonData.features[iIndex]);
              if (bRet) {
                // We only need to find 1.
                break;
              }
            }
          }
          break;
        case 'geometrycollection':
          if (Array.isArray(oGeoJsonData.geometries)) {
            for (iIndex = 0; iIndex < oGeoJsonData.geometries.length; iIndex++) {
              bRet = emp.helpers.GeoJsonHasAltitude(oGeoJsonData.geometries[iIndex]);
              if (bRet) {
                // We only need to find 1.
                break;
              }
            }
          }
          break;
      }
    }

    return bRet;
  };

  return publicInterface;
}());

/**
 *
 */
emp.helpers.isCompoundGeoJson = (function() {
  var publicInterface = function(oGeoJsonData) {
    var bRet = false;

    if (!oGeoJsonData.hasOwnProperty('type')) {
      emp.typeLibrary.Error({
        level: emp.typeLibrary.Error.level.CATASTROPHIC,
        message: "emp.helpers.isCompoundGeoJson: GeoJson with no type property. (" + oGeoJsonData + ")"
      });
    } else {
      switch (oGeoJsonData.type.toLowerCase()) {
        case 'point':
        case 'linestring':
        case 'polygon':
          break;
        case 'multipoint':
        case 'multilinestring':
        case 'multipolygon':
          bRet = true;
          break;
        case 'feature':
          bRet = emp.helpers.isCompoundGeoJson(oGeoJsonData.geometry);
          break;
        case 'featurecollection':
          if (Array.isArray(oGeoJsonData.features)) {
            if (oGeoJsonData.features.length === 1) {
              bRet = emp.helpers.isCompoundGeoJson(oGeoJsonData.features[0]);
            } else {
              bRet = true;
            }
          }
          break;
        case 'geometrycollection':
          if (Array.isArray(oGeoJsonData.geometries)) {
            if (oGeoJsonData.geometries.length === 1) {
              bRet = emp.helpers.isCompoundGeoJson(oGeoJsonData.geometries[0]);
            } else {
              bRet = true;

            }
          }
          break;
      }
    }

    return bRet;
  };

  return publicInterface;
}());

/**
 * Returns true if multiple `coordinates` nodes are found
 * @returns {boolean}
 */
emp.helpers.isCompoundKML = (function() {

  var publicInterface = function(sKMLData) {
    var bRet = false;

    try {
      var xmlDoc = emp.util.parseXML(sKMLData);
      var coordNodes = xmlDoc.getElementsByTagName("coordinates");

      if (coordNodes.length !== 1) {
        bRet = true;
      }
    } catch (Ex) {
      bRet = true;
    }

    return bRet;
  };

  return publicInterface;
}());
