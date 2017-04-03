var emp = window.emp || {};

/**
 * @namespace
 */
emp.util = emp.util || {};

/**
 * @description This function test if the parameters is an empty string. An undefined,
 * null, non string type, or "" value is considered empty.
 * @param {String} str The string on which the test is to be performed.
 * @returns {Boolean}
 */
emp.util.isEmptyString = function(str) {
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
 * @description This function return the value contained in the Value parameter to a boolean value. It return the value of bDefault if the Value can't be converted.
 * @param {String|Boolean} value
 * @param {Boolean} bDefault
 * @throws {String} This function throw an error if the bDefault parameters is NOT a boolean value.
 * @returns {Boolean}
 */
emp.util.getBooleanValue = function(value, bDefault) {

  var ret;

  if (typeof bDefault !== 'boolean') {
    throw 'Invalid boolean default value.';
  }

  if (typeof value === 'boolean') {
    ret = value;
  } else if (typeof value === 'string') {
    value = value.toLowerCase();
    if (value === 'true') {
      ret = true;
    } else if (value === 'false') {
      ret = false;
    } else {
      ret = bDefault;
    }
  } else {
    ret = bDefault;
  }

  return ret;
};

/**
 * Returns true if the symbol code represents a valid Airspace Symbol
 * @param sSymbolCode
 * @returns {boolean}
 */
emp.util.isAirspaceSymbol = function(sSymbolCode) {
  return (sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_CAKE ||
  sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_ROUTE ||
  sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_CYLINDER ||
  sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_ORBIT ||
  sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_POLYGON ||
  sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_RADARC ||
  sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_POLYARC ||
  sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_TRACK ||
  sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_CURTAIN);

};

/**
 * Parses the URL for passed parameters
 * @param name
 * @param url
 * @returns {*}
 */
emp.util.getParameterByName = function(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

/**
 * Returns the enumeration version of the environment
 * @param {string} environment
 * @returns {string}
 */
emp.util.validateEnvironment = function(environment) {
  switch (environment) {
    case "starfish":
      environment = emp.environment.starfish;
      break;
    case "owf":
      environment = emp.environment.owf;
      break;
    case "iwc":
      environment = emp.environment.iwc;
      break;
    default:
      environment = emp.environment.browser;
      break;
  }
  return environment;
};

/**
 * @param {ColorObject} color
 * @returns {string} AARRGGBB
 */
emp.util.convertColorToHexColor = function(color) {
  var red,
    green,
    blue,
    alpha;

  red = color.red.toString(16);
  if (red.length === 1) {
    red = '0' + red;
  }
  green = color.green.toString(16);
  if (green.length === 1) {
    green = '0' + green;
  }
  blue = color.blue.toString(16);
  if (blue.length === 1) {
    blue = '0' + blue;
  }
  alpha = Math.round(255 * color.alpha).toString(16);
  if (alpha.length === 1) {
    alpha = '0' + alpha;
  }

  return (alpha + red + green + blue).toUpperCase();
};

/**
 * @param {string} hex AARRGGBB
 * @returns {ColorObject}
 */
emp.util.convertHexToColor = function(hex) {
  var color = {},
    alpha,
    red,
    blue,
    green;

  if (hex.length === 8) {
    alpha = hex.substr(0, 2);
    red = hex.substr(2, 2);
    green = hex.substr(4, 2);
    blue = hex.substr(6, 2);

    color.red = parseInt(red, 16);
    color.blue = parseInt(blue, 16);
    color.green = parseInt(green, 16);
    color.alpha = (parseInt(alpha, 16)) / 255;

    return color;
  } else {
    return undefined;
  }
};

/**
 * @typedef {object} ColorObject
 * @property {number} red
 * @property {number} green
 * @property {number} blue
 * @property {number} alpha
 */

/**
 *
 * @param xmlStr
 * @returns {Document}
 */
emp.util.parseXML = function(xmlStr) {
  return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
};

/**
 *
 * @param {Array.<*>|HTMLCollection|NodeList|NamedNodeMap} collection
 * @param {emp.util.each~Callback} func
 * @throws TypeError
 */
emp.util.each = function(collection, func) {
  if (!collection) {
    return;
  }

  // Convert some expected types to Array
  if (collection instanceof HTMLCollection || collection instanceof NodeList) {
    collection = Array.prototype.slice.call(collection);
  }

  if (Array.isArray(collection)) {
    // use standard array logic
    Array.prototype.forEach.call(collection, function(el, i) {
      func(el, i);
    });
  } else if (collection instanceof NamedNodeMap) {
    var i,
      len = collection.length;

    for (i = 0; i < len; i++) {
      func(collection[i], i);
    }
  }
};

/**
 * Retrieves the drawCategory of a feature id if it is a MIL-STD-2525 feature.
 */
emp.util.getDrawCategory = function(feature) {

  // get the symbolCode of the MIL Std feature
  var symbolCode = feature.data.symbolCode;
  var standard,
    basicCode,
    symbolDef,
    unitDef,
    drawCategory;

  if (symbolCode) {

    // Get which standard the symbol is using, by default it is MIL-STD-2525C.
    if (feature.properties && feature.properties.modifiers) {

      if (feature.properties.modifiers === "2525b") {
        standard = 0;
      } else {
        standard = 1;
      }
    }

    basicCode = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(symbolCode, standard);

    // Determine the draw category.  We do this using our renderer's utility
    // methods.  The draw category tells us what type of editor to use.
    if (armyc2.c2sd.renderer.utilities.SymbolDefTable.hasSymbolDef(basicCode, standard)) {
      symbolDef = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(basicCode, standard);
      if (symbolDef) {
        drawCategory = symbolDef.drawCategory;
      }
    } else {
      unitDef = armyc2.c2sd.renderer.utilities.UnitDefTable.getUnitDef(basicCode, standard);
      if (unitDef) {
        drawCategory = unitDef.drawCategory;
      }
    }
  }

  return drawCategory;
};

/**
 * Retrieves the drawCategory of a MIL-STD-2525 symbol id. If no milstd
 * is passed in it uses MIL-STD-2525C as default.
 */
emp.util.getDrawCategoryBySymbolId = function(symbolId, milstd) {
  var feature = {
    data: {
      symbolCode: symbolId
    },
    properties: {
      modifiers: {
        standard: (milstd !== undefined) ? milstd : 1
      }
    }
  };

  return emp.util.getDrawCategory(feature);
};

/**
 * This callback handles the each function.
 * @callback emp.util.each~Callback
 * @param {*} elem
 * @param {number} index
 */

/**
 * @namespace
 */
emp.util.enums = {};
/**
 * @enum {number}
 * @readonly
 */
emp.util.enums.DOMNodeTypes = {
  /**
   * nodeName: element name
   * nodeValue: null
   */
  "Element": 1,
  /**
   * nodeName: attribute name
   * nodeValue: attribute value
   */
  "Attr": 2,
  /**
   * nodeName: #text
   * nodeValue: content of node
   */
  "Text": 3,
  /**
   * nodeName: #cdata-section
   * nodeValue: content of node
   */
  "CDATASection": 4,
  /**
   * nodeName: entity reference name
   * nodeValue: null
   */
  "EntityReference": 5,
  /**
   * nodeName: entity name
   * nodeValue: null
   */
  "Entity": 6,
  /**
   * nodeName: target
   * nodeValue: content of node
   */
  "ProcessingInstruction": 7,
  /**
   * nodeName: #comment
   * nodeValue: comment text
   */
  "Comment": 8,
  /**
   * nodeName: #document
   * nodeValue: null
   */
  "Document": 9,
  /**
   * nodeName: doctype name
   * nodeValue: null
   */
  "DocumentType": 10,
  /**
   * nodeName: #document fragment
   * nodeValue: null
   */
  "DocumentFragment": 11,
  /**
   * nodeName: notation name
   * nodeValue: null
   */
  "Notation": 12
};
