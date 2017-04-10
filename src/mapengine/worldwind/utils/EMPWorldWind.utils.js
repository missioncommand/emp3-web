var EMPWorldWind = EMPWorldWind || {};

/**
 * @namespace
 */
EMPWorldWind.utils = {};

/**
 * @typedef {object} RGBAColor
 * @property {number} red
 * @property {number} green
 * @property {number} blue
 * @property {number} alpha 0-1
 */

/**
 *
 * @param {MouseEvent} event
 * @returns {{lat: undefined, lon: undefined, clientX: *, clientY: *, screenX: *, screenY: *}}
 */
EMPWorldWind.utils.getEventCoordinates = function(event) {
  var pickPoint = this.worldWindow.canvasCoordinates(event.clientX, event.clientY);
  var terrainObject = this.worldWindow.pickTerrain(pickPoint).terrainObject();

  return {
    lat: terrainObject ? terrainObject.position.latitude : undefined,
    lon: terrainObject ? terrainObject.position.longitude : undefined,
    clientX: event.clientX,
    clientY: event.clientY,
    screenX: event.screenX,
    screenY: event.screenY
  };
};

/**
 *
 * @param value
 * @returns {boolean}
 */
EMPWorldWind.utils.defined = function(value) {
  return value !== undefined && value !== null;
};


/**
 * @namespace
 */
EMPWorldWind.utils.milstd = {};

/**
 *
 * @param properties
 * @param name
 * @param iconLabels
 * @param iconPixelSize
 * @returns {{}}
 */
EMPWorldWind.utils.milstd.updateModifierLabels = function(properties, name, iconLabels, iconPixelSize) {
  var mod,
    modifiedModifiers = {},
    property,
    size;

  // loop through all the properties, add a parameter for each property
  for (property in properties) {
    if (properties.hasOwnProperty(property)) {
      switch (property) {
        case "labelColor":
          // Convert labelColor to textColor
          modifiedModifiers["textColor"] = properties[property];
          break;
        case "fillColor":
          modifiedModifiers["fillColor"] = properties[property];
          break;
        case "lineColor":
          modifiedModifiers["lineColor"] = properties[property];
          break;
        case "modifiers":
          // modifiers contains an object that has other properties in it.
          // loop through each of the properties and add parameters to those
          // that are relevant.
          for (mod in properties[property]) {
            if (properties[property].hasOwnProperty(mod)) {
              switch (mod) {
                case "quantity":
                  if (iconLabels.C && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["quantity"] = properties[property][mod];
                  }
                  break;
                case "reinforcedOrReduced":
                  if (iconLabels.F && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["reinforcedOrReduced"] = properties[property][mod];
                  }
                  break;
                case "staffComments":
                  if (iconLabels.G && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["staffComments"] = properties[property][mod];
                  }
                  break;
                case "additionalInfo1":
                  if (iconLabels.H && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["additionalInfo1"] = properties[property][mod];
                  }
                  break;
                case "additionalInfo2":
                  if (iconLabels.H1 && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["additionalInfo2"] = properties[property][mod];
                  }
                  break;
                case "additionalInfo3":
                  if (iconLabels.H2 && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["additionalInfo3"] = properties[property][mod];
                  }
                  break;
                case "evaluationRating":
                  if (iconLabels.J && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["evaluationRating"] = properties[property][mod];
                  }
                  break;
                case "combatEffectiveness":
                  if (iconLabels.K && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["combatEffectiveness"] = properties[property][mod];
                  }
                  break;
                case "signatureEquipment":
                  if (properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["signatureEquipment"] = properties[property][mod];
                  }
                  break;
                case "higherFormation":
                  if (iconLabels.M && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["higherFormation"] = properties[property][mod];
                  }
                  break;
                case "hostile":
                  if (iconLabels.N && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["hostile"] = properties[property][mod];
                  }
                  break;
                case "iffSif":
                  if (iconLabels.P && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["iffSif"] = properties[property][mod];
                  }
                  break;
                case "offsetIndicator":
                  if (properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["offsetIndicator"] = properties[property][mod];
                  }
                  break;
                case "uniqueDesignation1":
                  if (iconLabels.T && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["uniqueDesignation1"] = properties[property][mod];
                  }
                  break;
                case "uniqueDesignation2":
                  if (iconLabels.T1 && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["uniqueDesignation2"] = properties[property][mod];
                  }
                  break;
                case "equipmentType":
                  if (properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["equipmentType"] = properties[property][mod];
                  }
                  break;
                case "dateTimeGroup1":
                  if (iconLabels.W && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["dateTimeGroup1"] = properties[property][mod];
                  }
                  break;
                case "dateTimeGroup2":
                  if (iconLabels.W1 && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["dateTimeGroup2"] = properties[property][mod];
                  }
                  break;
                case "altitudeDepth":
                  if (iconLabels.X) {
                    modifiedModifiers["altitudeDepth"] = properties[property][mod];
                  }
                  break;
                case "location":
                  if (iconLabels.Y && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["location"] = properties[property][mod];
                  }
                  break;
                case "speed":
                  if (iconLabels.Z && properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers["speed"] = properties[property][mod];
                  }
                  break;
                case "specialC2Headquarters":
                  if (iconLabels.AA && properties[property][mod] && (properties[property][mod] !== "")) {
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
                  if (!size) {
                    size = iconPixelSize;
                  }
                  modifiedModifiers["size"] = size;
                  break;
                default:
                  if (properties[property][mod] && (properties[property][mod] !== "")) {
                    modifiedModifiers[mod] = properties[property][mod];
                  }
                  break;
              }
            }
          }
          break;
      }
    }
  }

  if (iconLabels.CN) {
    modifiedModifiers["name"] = name;
  }
  return modifiedModifiers;
};


/**
 *
 * @param modifiers
 * @param showModLabels
 * @returns {object}
 */
EMPWorldWind.utils.milstd.convertModifierStringTo2525 = function(modifiers, showModLabels) {
  var standardModifiers = {};

  if (modifiers !== undefined && modifiers !== null) {
    for (var sModifier in modifiers) {
      if (modifiers.hasOwnProperty(sModifier)) {
        var modValue = modifiers[sModifier];
        if (modValue !== null && modValue !== "null" && modValue !== 0) {
          switch (sModifier) {
            case EMPWorldWind.constants.RendererSettings.modifierLookup.QUANTITY:
              if (showModLabels) {
                standardModifiers["C"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.REDUCED_OR_REINFORCED:
              if (showModLabels) {
                standardModifiers["F"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.STAFF_COMMENTS:
              if (showModLabels) {
                standardModifiers["G"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.ADDITIONAL_INFO_1:
              if (showModLabels) {
                standardModifiers["H"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.ADDITIONAL_INFO_2:
              if (showModLabels) {
                standardModifiers["H1"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.ADDITIONAL_INFO_3:
              if (showModLabels) {
                standardModifiers["H2"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.EVALUATION_RATING:
              if (showModLabels) {
                standardModifiers["J"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.COMBAT_EFFECTIVENESS:
              if (showModLabels) {
                standardModifiers["K"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.SIGNATURE_EQUIPMENT:
              if (showModLabels) {
                standardModifiers["L"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.HIGHER_FORMATION:
              if (showModLabels) {
                standardModifiers["M"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.HOSTILE:
              if (showModLabels) {
                standardModifiers["N"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.IFF_SIF:
              if (showModLabels) {
                standardModifiers["P"] = modValue;
              }
              break;
            // Direction of movement cannot work on 3D because the view can rotate
            // case EMPWorldWind.constants.RendererSettings.modifierLookup.DIRECTION_OF_MOVEMENT:
            //    modifiersArray.push("Q=" + modValue);
            //    break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.OFFSET_INDICATOR:
              standardModifiers["S"] = modValue;
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.UNIQUE_DESIGNATOR_1:
              if (showModLabels) {
                standardModifiers["T"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.UNIQUE_DESIGNATOR_2:
              if (showModLabels) {
                standardModifiers["T1"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.EQUIPMENT_TYPE:
              if (showModLabels) {
                standardModifiers["V"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.DATE_TIME_GROUP:
              if (showModLabels) {
                standardModifiers["W"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.DATE_TIME_GROUP_2:
              if (showModLabels) {
                standardModifiers["W1"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.ALTITUDE_DEPTH:
              if (showModLabels) {
                standardModifiers["X"] = JSON.parse(JSON.stringify(modValue));
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.LOCATION:
              if (showModLabels) {
                standardModifiers["Y"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.SPEED:
              if (showModLabels) {
                standardModifiers["Z"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.SPECIAL_C2_HEADQUARTERS:
              if (showModLabels) {
                standardModifiers["AA"] = modValue;
              }
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.DISTANCE:
              standardModifiers["AM"] = JSON.parse(JSON.stringify(modValue));
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.AZIMUTH:
              standardModifiers["AN"] = JSON.parse(JSON.stringify(modValue));
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.FILL_COLOR:
              standardModifiers["FILLCOLOR"] = modValue;
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.LINE_COLOR:
              standardModifiers["LINECOLOR"] = modValue;
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.TEXT_COLOR:
              standardModifiers["TEXTCOLOR"] = modValue;
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.STANDARD:
              // convert standard string value  to modifier numeric
              standardModifiers[emp.typeLibrary.utils.milstd.Modifiers.STANDARD] = EMPWorldWind.utils.convertSymbolStandardToRendererFormat(modifiers);
              break;
            case EMPWorldWind.constants.RendererSettings.modifierLookup.NAME:
            case "CN":
              if (showModLabels) {
                standardModifiers["CN"] = modValue;
              }
              break;
            default:
              standardModifiers[sModifier] = modValue;
              break;
          }
        }
      }
    }
  }

  return standardModifiers;
};

/**
 * Borrowed from the Cesium Implementation
 *
 * @param item
 * @returns {object}
 */
EMPWorldWind.utils.milstd.checkForRequiredModifiers = function(item) {
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
    overrides = {};

  // Check to see if the properties and modifiers have not yet been set.
  // If they don't exist, this will default them to empty objects.
  if (item.data && item.data.symbolCode) {
    symbolCode = item.data.symbolCode;
  }
  else if (item.symbolCode) {
    symbolCode = item.symbolCode;
  }

  if (item.properties) {
    properties = item.properties;
    if (properties.modifiers) {
      modifiers = properties.modifiers;
    }
    else {
      properties.modifiers = {};
      modifiers = properties.modifiers;
    }
  }
  else {
    item.properties = {
      modifiers: {}
    };

    modifiers = item.properties.modifiers;
  }

  // Get the basic symbol code.  We need the basic code because we need to look it up with
  // getSymbolDef.  This requires the basic code.
  basicSymbolCode = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(symbolCode);
  // Get the standard we are using.  We need to convert it to what the function getSymbolDef uses.
  standard = EMPWorldWind.utils.milstd.checkSymbolStandard(item.properties.modifiers);
  // Retrieve the symbol definition object.  This contains information about the required
  // symbol modifiers.  We will use this to determine which modifiers are not sufficiently
  // populated.
  symbolDef = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(basicSymbolCode, standard);
  if ((symbolDef === undefined) || (symbolDef === null)) {
    return result;
  }
  // The only modifiers that are sometimes required in MIL-STD-2525B and C are
  // distance and azimuth.
  //
  // First check if distance and azimuth has already been set.  If they are, we
  // still may not have enough entries for them (as both are arrays), so we still need to
  // verify that they are good.

  // If distance already exists retrieve the values in it.
  if (modifiers.hasOwnProperty("distance")) {
    // Lets make sure that if it is there that it is an array.
    if (modifiers.distance instanceof Array) {
      oAM = modifiers.distance;
    }
  }
  // If azimuth already exists retrieve the values of it.
  if (modifiers.hasOwnProperty("azimuth")) {
    // Lets make sure that if it is there that it is an array.
    if (modifiers.azimuth instanceof Array) {
      oAN = modifiers.azimuth;
    }
  }
  // Based on the symbol draw category, we can determine if the symbol has
  // has the required parameters or not.  For each draw category, we do a different
  // check.
  switch (symbolDef.drawCategory) {
    // These are circle graphics represented by a single point and a radius.
    case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE: //16
      if (oAM !== null && oAM.length > 0) {
        oAM = oAM.slice(0, 1); // Make sure that there is only 1.
      }
      else {
        oAM[0] = 5000;
      }

      overrides = {
        distance: oAM
      };
      break;
    // These are 1-point rectangles with an azimuth that determine the angle, and a distance that determines width
    case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE: //17
      if ((oAM !== null) && (oAM.length >= 2) &&
        (typeof (oAM[0]) === "number") &&
        (typeof (oAM[1]) === "number")) {
        oAM = oAM.slice(0, 2); // Make sure that there is only 2.
      }
      else {
        // Check to see if the [0] value is present and its a number.
        // If not set a value.
        if ((oAM[0] === undefined) || (typeof (oAM[0]) !== "number")) {
          oAM[0] = 10000;
        }
        // Check to see if the [1] value is present and its a number.
        // If not set a value.
        if ((oAM[1] === undefined) || (typeof (oAM[1]) !== "number")) {
          oAM[1] = 5000;
        }
        oAM = oAM.slice(0, 2); // Make sure that there is only 2.
      }

      if ((oAN !== null) && (oAN.length >= 1) &&
        (typeof (oAN[1]) === "number")) {
        oAN = oAN.slice(0, 1); // Makes ure that there is only 1.
      }
      else {
        // Check to see if the [0] value is present and its a number.
        // If not set a value.
        if ((oAN[0] === undefined) || (typeof (oAN[0]) !== "number")) {
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
      if ((oAM !== null) && (oAM.length >= 2)) {
        for (i = 0; i < oAM.length;) {
          if (typeof (oAM[i]) !== "number") {
            oAM.splice(i, 1);
          }
          else {
            i++;
          }
        }
      }
      if (oAM.length > 1) {
        // Check to see if the each value is present.
        for (i = 0; i < oAM.length; i++) {
          if (oAM[i] === undefined) {
            oAM[i] = ((i === 0) ? 2000 : oAM[i - 1] + 2000);
          }
        }
      }
      else {
        if (oAM[0] === undefined) {
          oAM[0] = 2000;
        }
      }
      // You need at least 2 azimuth values for this to be a drawable graphic
      // If it doesn't have it, create it.
      if (oAN.length === 0) {
        oAN.push(315);
        oAN.push(45);
      }
      else if (oAN.length === 1) {
        var newVal = oAN[0] + 90;
        if (newVal > 360) {
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
      if ((oAM !== null) && (oAM.length > 0)) {
        for (i = 0; i < oAM.length;) {
          if (typeof (oAM[i]) !== "number") {
            oAM.splice(i, 1);
          }
          else {
            i++;
          }
        }
      }
      if (oAM.length < 2) {
        // Check to see if the each value is present.
        for (i = 0; i < 2; i++) {
          if (oAM[i] === undefined) {
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
      if (oAM !== null && oAM.length > 0) {
        if (typeof (oAM[0]) !== "number") {
          oAM[0] = 5000;
        }
        oAM = oAM.slice(0, 1); // Make sure that there is only 1.
      }
      else {
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

      if ((oAM === null || oAM.length === 0) || (oAM.length > 0 && (isNaN(oAM[0]) || oAM[0] === null))) {
        if (item.data && item.data.coordinates && item.data.coordinates.length > 1) {
          var coord0 = item.data.coordinates[0];
          var coord1 = item.data.coordinates[1];

          // var pointCartographic0 = Cesium.Cartographic.fromDegrees(coord0[0], coord0[1], 0);
          // var pointCartographic1 = Cesium.Cartographic.fromDegrees(coord1[0], coord1[1], 0);
          // var dist = pointCartographic0.distanceTo(pointCartographic1);
          // lonDistance = dist / 4;

          var pointCartographic0 = new WorldWind.Location(coord0[0], coord0[1]);
          var pointCartographic1 = new WorldWind.Location(coord1[0], coord1[1]);

          var dist = WorldWind.Location.greatCircleDistance(pointCartographic0, pointCartographic1);

          lonDistance = dist / 4;
        }
        else {
          lonDistance = lonDistance / 34;
        }

        oAM[0] = lonDistance;
        overrides = {
          distance: oAM
        };
      }
      else {
        overrides = {
          distance: oAM
        };
      }

      break;
  }

  return overrides;
};

/**
 *
 * @param modifiers
 * @returns {number}
 */
EMPWorldWind.utils.milstd.checkSymbolStandard = function(modifiers) {
  var standard = 1,
    modifiersCopy,
    modValue;

  try {
    if (modifiers !== undefined && modifiers !== null && modifiers !== "") {
      modifiersCopy = typeof (modifiers) === "string" ? JSON.parse(modifiers) : emp.helpers.copyObject(modifiers);

      if (modifiersCopy.hasOwnProperty("modifiers")) {
        modifiersCopy = modifiersCopy.modifiers;
      }

      if (modifiersCopy.hasOwnProperty("renderer")) {
        modValue = modifiersCopy.renderer;
        if (modValue !== undefined && modValue !== null && modValue !== 0) {
          if (modValue.toLowerCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C.toLowerCase()) {
            standard = EMPWorldWind.constants.RendererSettings.standard.Symbology_2525C;
          }
          else if (modValue.toLowerCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B.toLowerCase()) {
            standard = EMPWorldWind.constants.RendererSettings.standard.Symbology_2525Bch2_USAS_13_14;
          }
          else {
            standard = modValue;
          }
        }
      }
      else if (modifiersCopy.hasOwnProperty("standard")) {
        modValue = modifiersCopy.standard;
        if (modValue !== undefined && modValue !== null && modValue !== 0) {
          if (modValue.toLowerCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C.toLowerCase()) {
            standard = EMPWorldWind.constants.RendererSettings.standard.Symbology_2525C;
          }
          else if (modValue.toLowerCase().indexOf(emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C.toLowerCase()) > -1) {
            standard = EMPWorldWind.constants.RendererSettings.standard.Symbology_2525C;
          }
          else if (modValue.toLowerCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B.toLowerCase()) {
            standard = EMPWorldWind.constants.RendererSettings.standard.Symbology_2525Bch2_USAS_13_14;
          }
          else if (modValue.toLowerCase().indexOf(emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B.toLowerCase()) > -1) {
            standard = EMPWorldWind.constants.RendererSettings.standard.Symbology_2525Bch2_USAS_13_14;
          }
          else {
            standard = modValue;
          }
        }
      }
    }
  }
  catch (err) {
    window.console.log("Error getting symbol standard");
  }

  return standard;
};


/**
 *
 * @param modifiers
 */
EMPWorldWind.utils.convertSymbolStandardToRendererFormat = function(modifiers) {
  var standard,
    modValue;

  modValue = modifiers.standard;
  if (modValue.toLowerCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C.toLowerCase()) {
    standard = EMPWorldWind.constants.RendererSettings.standard.Symbology_2525C;
  }
  else {
    standard = EMPWorldWind.constants.RendererSettings.standard.Symbology_2525Bch2_USAS_13_14;
  }

  return standard;
};

/**
 * Parses a 6 character color string, assumes full opacity
 * @param hex #RRGGBB
 * @returns {RGBAColor}
 * @private
 */
function _hex6ToRGBA(hex) {
  hex = hex.replace('#', '');
  var r, g, b;

  r = parseInt(hex.substring(0, 2), 16);
  g = parseInt(hex.substring(2, 4), 16);
  b = parseInt(hex.substring(4, 6), 16);

  return {
    red: r,
    green: g,
    blue: b,
    alpha: 1
  };
}

/**
 * Parses an 8 character color string
 * @param hex AARRGGBB format
 * @returns {RGBAColor}
 * @private
 */
function _hex8ToRGBA(hex) {
  var r, g, b, a;

  a = parseInt(hex.substring(0, 2), 16) / 256.0;
  r = parseInt(hex.substring(2, 4), 16);
  g = parseInt(hex.substring(4, 6), 16);
  b = parseInt(hex.substring(6, 8), 16);

  return {
    red: r,
    green: g,
    blue: b,
    alpha: a
  };
}

/**
 * @example
 * hexToRGBA("#00FF83")
 *
 * @param {string} hex
 * @param {float} [alpha=1] 0-1 expected range
 * @param {boolean} [normalize=true] True produce float values between 0 and 1, otherwise integers between 0 and 255
 * @returns {RGBAColor}
 */
EMPWorldWind.utils.hexToRGBA = function(hex, alpha, normalize) {
  var newHex;

  if (!hex) {
    return {
      red: 0,
      green: 0,
      blue: 0,
      alpha: 1
    };
  }
  normalize = EMPWorldWind.utils.defined(normalize) ? normalize : true;
  alpha = EMPWorldWind.utils.defined(alpha) ? alpha : 1;

  if (hex.length === 8) {
    newHex = _hex8ToRGBA(hex);
  }
  else {
    newHex = _hex6ToRGBA(hex);
    newHex.alpha = alpha;
  }

  if (normalize) {
    newHex.red = newHex.red / 256.0;
    newHex.green = newHex.green / 256.0;
    newHex.blue = newHex.blue / 256.0;
  }

  return newHex;
};

/**
 * Will normalize an {@link RGBAColor} object, will return the same object if already normalized
 * (contains a decimal in the value)
 *
 * WorldWind.Color requires 0-1 values for color
 *
 * @param {RGBAColor} color
 * @returns {RGBAColor}
 */
EMPWorldWind.utils.normalizeRGBAColor = function(color) {
  var normalize,
    normalColor = Object.assign({}, color);

  normalize = color.red.toString().indexOf('.') === -1 ||
    color.green.toString().indexOf('.') === -1 ||
    color.blue.toString().indexOf('.') === -1;

  if (normalize) {
    normalColor.red = color.red / 256.0;
    normalColor.green = color.green / 256.0;
    normalColor.blue = color.blue / 256.0;
  }

  return normalColor;
};

/**
 * Returns the east-west distance of the bounds
 * @param {Bounds} bounds
 * @returns {number}
 */
EMPWorldWind.utils.boundsWidth = function(bounds) {
  return WorldWind.EARTH_RADIUS * WorldWind.Location.greatCircleDistance(
      new WorldWind.Location(0, bounds.west),
      new WorldWind.Location(0, bounds.east));
};

/**
 * Returns the north-south distance of the bounds
 * @param {Bounds} bounds
 * @returns {number}
 */
EMPWorldWind.utils.boundsHeight = function(bounds) {
  return WorldWind.EARTH_RADIUS * WorldWind.Location.greatCircleDistance(
      new WorldWind.Location(bounds.south, 0),
      new WorldWind.Location(bounds.north, 0));
};


/**
 * Dot color based on the symbol code affiliation
 * @param symbolCode
 * @returns {*}
 */
EMPWorldWind.utils.selectHighAltitudeRangeImage = function(symbolCode) {
  var affiliationLetter,
    highAltitudeRangeImage;

  if (!EMPWorldWind.utils.defined(symbolCode)) {
    return EMPWorldWind.constants.highAltitudeRangeImage.highScaleImageYellow; // unknown
  }

  affiliationLetter = symbolCode.substring(1, 2);
  switch (affiliationLetter.toLowerCase()) {
    case "h":
      highAltitudeRangeImage = EMPWorldWind.constants.highAltitudeRangeImage.highRangeImageRed;
      break;
    case "f":
      highAltitudeRangeImage = EMPWorldWind.constants.highAltitudeRangeImage.highRangeImageBlue;
      break;
    case "n":
      highAltitudeRangeImage = EMPWorldWind.constants.highAltitudeRangeImage.highRangeImageGreen;
      break;
    case "u":
      highAltitudeRangeImage = EMPWorldWind.constants.highAltitudeRangeImage.highRangeImageYellow;
      break;
    default:
      highAltitudeRangeImage = EMPWorldWind.constants.highAltitudeRangeImage.highRangeImageYellow;
      break;
  }
  return highAltitudeRangeImage;
};

/**
 *
 * @param CameraAltitude
 * @param singlePointAltitudeRanges
 * @returns {EMPWorldWind.constants.SinglePointAltitudeRangeMode|number}
 */
EMPWorldWind.utils.getSinglePointAltitudeRangeMode = function(CameraAltitude, singlePointAltitudeRanges) {
  if (CameraAltitude < singlePointAltitudeRanges.mid) {
    return EMPWorldWind.constants.SinglePointAltitudeRangeMode.LOW_RANGE;
  }
  else if (CameraAltitude >= singlePointAltitudeRanges.mid && CameraAltitude < singlePointAltitudeRanges.high) {
    return EMPWorldWind.constants.SinglePointAltitudeRangeMode.MID_RANGE;
  }
  else if (CameraAltitude >= singlePointAltitudeRanges.high) {
    return EMPWorldWind.constants.SinglePointAltitudeRangeMode.HIGHEST_RANGE;
  }
  else {
    //default
    return EMPWorldWind.constants.SinglePointAltitudeRangeMode.LOW_RANGE;
  }
};


EMPWorldWind.utils.getFontInfo = function (name, size, style)
{
    var _ModifierFont;
    var _ModifierFontStyle = size;
    if (style !== 'bold' || style !== 'normal')
    {
        _ModifierFontStyle = style;
    }
    else
    {
        _ModifierFontStyle = 'bold';
    }
    _ModifierFont = _ModifierFontStyle + " " + size + "pt " + name;

    var measurements = armyc2.c2sd.renderer.utilities.RendererUtilities.measureFont(_ModifierFont);
    return {name: name, size: size, style: style, measurements: measurements};
};


// EMPWorldWind.utils.MultiPointRateLimit = function(fn, delay, context) {
//     var queue = [],
//         timer = null;
//     //context.newAddRateLimitQueue = queue;
//
//     function processQueue() {
//         var index = 0;
//         var items = [];
//         while (index < 200) {
//             var item = queue.shift();
//             if (item && item.context.isFeaturePresent(item.arguments[0].id || item.arguments[0].coreId)) {
//                 // condition checks the case when the multi point was deleted while this request was in this queue.
//                 items.push(item.arguments[0]);
//             }
//             if (queue.length === 0) {
//                 break;
//             }
//             index = index + 1;
//         }
//         if (items.length > 0) {
//             fn.apply(item.context, [items]);
//         }
//         if (items.length > 0) {
//             // item.context.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
//         }
//         if (queue.length === 0)
//             clearInterval(timer), timer = null;
//     }
//
//     return function limited() {
//         queue.push({
//             context: context || this,
//             arguments: [].slice.call(arguments)
//         });
//         if (!timer) {
//             processQueue(); // start immediately on the first invocation
//             //                if (queue.length > 20)
//             //                {
//             //                    processQueue();
//             //                }
//             //                else
//             //                {
//             timer = setInterval(processQueue, delay);
//             //}
//             //timer = setInterval(processQueue, (queue.length > 20) ? delay * 2 : delay);
//
//         }
//     };
//
// };


EMPWorldWind.Math = {};

/**
 * Determines if two values are equal using an absolute or relative tolerance test. This is useful
 * to avoid problems due to roundoff error when comparing floating-point values directly. The values are
 * first compared using an absolute tolerance test. If that fails, a relative tolerance test is performed.
 * Use this test if you are unsure of the magnitudes of left and right.
 *
 * @param {Number} left The first value to compare.
 * @param {Number} right The other value to compare.
 * @param {Number} relativeEpsilon The maximum inclusive delta between <code>left</code> and <code>right</code> for the relative tolerance test.
 * @param {Number} [absoluteEpsilon=relativeEpsilon] The maximum inclusive delta between <code>left</code> and <code>right</code> for the absolute tolerance test.
 * @returns {Boolean} <code>true</code> if the values are equal within the epsilon; otherwise, <code>false</code>.
 *
 * @example
 * var a = Cesium.Math.equalsEpsilon(0.0, 0.01, Cesium.Math.EPSILON2); // true
 * var b = Cesium.Math.equalsEpsilon(0.0, 0.1, Cesium.Math.EPSILON2);  // false
 * var c = Cesium.Math.equalsEpsilon(3699175.1634344, 3699175.2, Cesium.Math.EPSILON7); // true
 * var d = Cesium.Math.equalsEpsilon(3699175.1634344, 3699175.2, Cesium.Math.EPSILON9); // false
 */
EMPWorldWind.Math.equalsEpsilon = function(left, right, relativeEpsilon, absoluteEpsilon) {
  absoluteEpsilon = EMPWorldWind.Math.defaultValue(absoluteEpsilon, relativeEpsilon);
  var absDiff = Math.abs(left - right);
  return absDiff <= absoluteEpsilon || absDiff <= relativeEpsilon * Math.max(Math.abs(left), Math.abs(right));
};


/**
 * Returns the first parameter if not undefined, otherwise the second parameter.
 * Useful for setting a default value for a parameter.
 *
 * @exports defaultValue
 *
 * @param {*} a
 * @param {*} b
 * @returns {*} Returns the first parameter if not undefined, otherwise the second parameter.
 *
 * @example
 * param = Cesium.defaultValue(param, 'default');
 */
EMPWorldWind.Math.defaultValue = function(a, b) {
  if (a !== undefined) {
    return a;
  }
  return b;
};


/**
 * 0.1
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON1 = 0.1;

/**
 * 0.01
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON2 = 0.01;

/**
 * 0.001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON3 = 0.001;

/**
 * 0.0001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON4 = 0.0001;

/**
 * 0.00001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON5 = 0.00001;

/**
 * 0.000001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON6 = 0.000001;

/**
 * 0.0000001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON7 = 0.0000001;

/**
 * 0.00000001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON8 = 0.00000001;

/**
 * 0.000000001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON9 = 0.000000001;

/**
 * 0.0000000001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON10 = 0.0000000001;

/**
 * 0.00000000001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON11 = 0.00000000001;

/**
 * 0.000000000001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON12 = 0.000000000001;

/**
 * 0.0000000000001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON13 = 0.0000000000001;

/**
 * 0.00000000000001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON14 = 0.00000000000001;

/**
 * 0.000000000000001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON15 = 0.000000000000001;

/**
 * 0.0000000000000001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON16 = 0.0000000000000001;

/**
 * 0.00000000000000001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON17 = 0.00000000000000001;

/**
 * 0.000000000000000001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON18 = 0.000000000000000001;

/**
 * 0.0000000000000000001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON19 = 0.0000000000000000001;

/**
 * 0.00000000000000000001
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.EPSILON20 = 0.00000000000000000001;

/**
 * 3.986004418e14
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.GRAVITATIONALPARAMETER = 3.986004418e14;

/**
 * Radius of the sun in meters: 6.955e8
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.SOLAR_RADIUS = 6.955e8;

/**
 * The mean radius of the moon, according to the "Report of the IAU/IAG Working Group on
 * Cartographic Coordinates and Rotational Elements of the Planets and satellites: 2000",
 * Celestial Mechanics 82: 83-110, 2002.
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.LUNAR_RADIUS = 1737400.0;

/**
 * 64 * 1024
 * @type {Number}
 * @constant
 */
EMPWorldWind.Math.SIXTY_FOUR_KILOBYTES = 64 * 1024;

/**
 * Returns the sign of the value; 1 if the value is positive, -1 if the value is
 * negative, or 0 if the value is 0.
 *
 * @param {Number} value The value to return the sign of.
 * @returns {Number} The sign of value.
 */
EMPWorldWind.Math.sign = function(value) {
  if (value > 0) {
    return 1;
  }
  if (value < 0) {
    return -1;
  }

  return 0;
};

/**
 * Returns 1.0 if the given value is positive or zero, and -1.0 if it is negative.
 * This is similar to {@link CesiumMath#sign} except that returns 1.0 instead of
 * 0.0 when the input value is 0.0.
 * @param {Number} value The value to return the sign of.
 * @returns {Number} The sign of value.
 */
EMPWorldWind.Math.signNotZero = function(value) {
  return value < 0.0 ? -1.0 : 1.0;
};
