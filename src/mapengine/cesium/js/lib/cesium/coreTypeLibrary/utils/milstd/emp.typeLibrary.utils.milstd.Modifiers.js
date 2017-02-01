/* global emp, armyc2 */

/**
 * @description This type enumerates the MilStd modifiers as defined in 2525 and the ones 
 * used by the renderer.
 */
//armyc2.c2sd.renderer.utilities.ModifiersTG;
emp.typeLibrary.utils.milstd.Modifiers = {
    C_QUANTITY: armyc2.c2sd.renderer.utilities.ModifiersTG.C_QUANTITY,
    H_ADDITIONAL_INFO_1: armyc2.c2sd.renderer.utilities.ModifiersTG.H_ADDITIONAL_INFO_1,
    H1_ADDITIONAL_INFO_2: armyc2.c2sd.renderer.utilities.ModifiersTG.H1_ADDITIONAL_INFO_2,
    H2_ADDITIONAL_INFO_3: armyc2.c2sd.renderer.utilities.ModifiersTG.H2_ADDITIONAL_INFO_3,
    N_HOSTILE: armyc2.c2sd.renderer.utilities.ModifiersTG.N_HOSTILE,
    Q_DIRECTION_OF_MOVEMENT: armyc2.c2sd.renderer.utilities.ModifiersTG.Q_DIRECTION_OF_MOVEMENT,
    S_OFFSET_INDICATOR: armyc2.c2sd.renderer.utilities.ModifiersTG.S_OFFSET_INDICATOR,
    T_UNIQUE_DESIGNATION_1: armyc2.c2sd.renderer.utilities.ModifiersTG.T_UNIQUE_DESIGNATION_1,
    T1_UNIQUE_DESIGNATION_2: armyc2.c2sd.renderer.utilities.ModifiersTG.T1_UNIQUE_DESIGNATION_2,
    V_EQUIP_TYPE: armyc2.c2sd.renderer.utilities.ModifiersTG.V_EQUIP_TYPE,
    W_DTG_1: armyc2.c2sd.renderer.utilities.ModifiersTG.W_DTG_1,
    W1_DTG_2: armyc2.c2sd.renderer.utilities.ModifiersTG.W1_DTG_2,
    X_ALTITUDE_DEPTH: armyc2.c2sd.renderer.utilities.ModifiersTG.X_ALTITUDE_DEPTH,
    Y_LOCATION: armyc2.c2sd.renderer.utilities.ModifiersTG.Y_LOCATION,
    AM_DISTANCE: armyc2.c2sd.renderer.utilities.ModifiersTG.AM_DISTANCE,
    AN_AZIMUTH: armyc2.c2sd.renderer.utilities.ModifiersTG.AN_AZIMUTH,
    F_REDUCED_OR_REINFORCED: "F",
    G_STAFF_COMMENTS: "G",
    J_EVALUATION_RATING: "J",
    K_COMBAT_EFFECTIVENESS: "K",
    L_SIGNATURE_EQUIPMENT: "L",
    M_HIGHER_FORMATION: "M",
    P_IFF_SIF: "P",
    Z_SPEED: "Z",
    AA_SPECIAL_C2_HEADQUARTERS: "AA",
    STANDARD: "SYMSTD"
};

/**
 * @description This type enumerates the MilStd modifiers sent by the API client.
 */
emp.typeLibrary.utils.milstd.StringModifiers = {
    C_QUANTITY: "quantity",
    F_REDUCED_OR_REINFORCED: "reinforcedOrReduced",
    G_STAFF_COMMENTS: "staffComments",
    H_ADDITIONAL_INFO_1: "additionalInfo1",
    H1_ADDITIONAL_INFO_2: "additionalInfo2",
    H2_ADDITIONAL_INFO_3: "additionalInfo3",
    J_EVALUATION_RATING: "evaluationRating",
    K_COMBAT_EFFECTIVENESS: "combatEffectiveness",
    L_SIGNATURE_EQUIPMENT: "signatureEquipment",
    M_HIGHER_FORMATION: "higherFormation",
    N_HOSTILE: "hostile",
    P_IFF_SIF: "iffSif",
    Q_DIRECTION_OF_MOVEMENT: "directionOfMovement",
    S_OFFSET_INDICATOR: "offsetIndicator",
    T_UNIQUE_DESIGNATION_1: "uniqueDesignation1",
    T1_UNIQUE_DESIGNATION_2: "uniqueDesignation2",
    V_EQUIP_TYPE: "equipmentType",
    W_DTG_1: "dateTimeGroup1",
    W1_DTG_2: "dateTimeGroup2",
    X_ALTITUDE_DEPTH: "altitudeDepth",
    Y_LOCATION: "location",
    Z_SPEED: "speed",
    AA_SPECIAL_C2_HEADQUARTERS: "specialC2Headquarters",
    AM_DISTANCE: "distance",
    AN_AZIMUTH: "azimuth",
    FILL_COLOR: "fillColor",
    LINE_COLOR: "lineColor",
    X_OFFSET: "xOffset",
    X_UNITS: "xUnits",
    Y_OFFSET: "yOffset",
    Y_UNITS: "yUnits",
    SIZE: "size",
    LINE_THICKNESS: "lineThickness",
    HEADING: "heading",
    STANDARD: "standard"
};

emp.typeLibrary.utils.milstd.StringToModifier = (function ()
{
    var mapping = {};
    var longModifiers = emp.typeLibrary.utils.milstd.StringModifiers;
    var s2525Modifiers = emp.typeLibrary.utils.milstd.Modifiers;

    mapping[longModifiers.C_QUANTITY] = s2525Modifiers.C_QUANTITY;
    mapping[longModifiers.F_REDUCED_OR_REINFORCED] = s2525Modifiers.F_REDUCED_OR_REINFORCED;
    mapping[longModifiers.G_STAFF_COMMENTS] = s2525Modifiers.G_STAFF_COMMENTS;
    mapping[longModifiers.H_ADDITIONAL_INFO_1] = s2525Modifiers.H_ADDITIONAL_INFO_1;
    mapping[longModifiers.H1_ADDITIONAL_INFO_2] = s2525Modifiers.H1_ADDITIONAL_INFO_2;
    mapping[longModifiers.H2_ADDITIONAL_INFO_3] = s2525Modifiers.H2_ADDITIONAL_INFO_3;
    mapping[longModifiers.J_EVALUATION_RATING] = s2525Modifiers.J_EVALUATION_RATING;
    mapping[longModifiers.K_COMBAT_EFFECTIVENESS] = s2525Modifiers.K_COMBAT_EFFECTIVENESS;
    mapping[longModifiers.L_SIGNATURE_EQUIPMENT] = s2525Modifiers.L_SIGNATURE_EQUIPMENT;
    mapping[longModifiers.M_HIGHER_FORMATION] = s2525Modifiers.M_HIGHER_FORMATION;
    mapping[longModifiers.N_HOSTILE] = s2525Modifiers.N_HOSTILE;
    mapping[longModifiers.P_IFF_SIF] = s2525Modifiers.P_IFF_SIF;
    mapping[longModifiers.Q_DIRECTION_OF_MOVEMENT] = s2525Modifiers.Q_DIRECTION_OF_MOVEMENT;
    mapping[longModifiers.S_OFFSET_INDICATOR] = s2525Modifiers.S_OFFSET_INDICATOR;
    mapping[longModifiers.T_UNIQUE_DESIGNATION_1] = s2525Modifiers.T_UNIQUE_DESIGNATION_1;
    mapping[longModifiers.T1_UNIQUE_DESIGNATION_2] = s2525Modifiers.T1_UNIQUE_DESIGNATION_2;
    mapping[longModifiers.V_EQUIP_TYPE] = s2525Modifiers.V_EQUIP_TYPE;
    mapping[longModifiers.W_DTG_1] = s2525Modifiers.W_DTG_1;
    mapping[longModifiers.W1_DTG_2] = s2525Modifiers.W1_DTG_2;
    mapping[longModifiers.X_ALTITUDE_DEPTH] = s2525Modifiers.X_ALTITUDE_DEPTH;
    mapping[longModifiers.Y_LOCATION] = s2525Modifiers.Y_LOCATION;
    mapping[longModifiers.Z_SPEED] = s2525Modifiers.Z_SPEED;
    mapping[longModifiers.AA_SPECIAL_C2_HEADQUARTERS] = s2525Modifiers.AA_SPECIAL_C2_HEADQUARTERS;
    mapping[longModifiers.AM_DISTANCE] = s2525Modifiers.AM_DISTANCE;
    mapping[longModifiers.AN_AZIMUTH] = s2525Modifiers.AN_AZIMUTH;
    mapping[longModifiers.FILLCOLOR] = longModifiers.FILL_COLOR;
    mapping[longModifiers.LINECOLOR] = longModifiers.LINE_COLOR;
    mapping[longModifiers.X_OFFSET] = longModifiers.X_OFFSET;
    mapping[longModifiers.X_UNITS] = longModifiers.X_UNITS;
    mapping[longModifiers.Y_OFFSET] = longModifiers.Y_OFFSET;
    mapping[longModifiers.Y_UNITS] = longModifiers.Y_UNITS;
    mapping[longModifiers.SIZE] = longModifiers.SIZE;
    mapping[longModifiers.LINE_THICKNESS] = longModifiers.LINE_THICKNESS;
    mapping[longModifiers.HEADING] = s2525Modifiers.Q_DIRECTION_OF_MOVEMENT;
    mapping[longModifiers.STANDARD] = s2525Modifiers.STANDARD;

    return mapping;
}());

emp.typeLibrary.utils.milstd.ModifierToString = (function ()
{
    var mapping = {};
    var longModifiers = emp.typeLibrary.utils.milstd.StringModifiers;
    var s2525Modifiers = emp.typeLibrary.utils.milstd.Modifiers;

    mapping[s2525Modifiers.C_QUANTITY] = longModifiers.C_QUANTITY;
    mapping[s2525Modifiers.F_REDUCED_OR_REINFORCED] = longModifiers.F_REDUCED_OR_REINFORCED;
    mapping[s2525Modifiers.G_STAFF_COMMENTS] = longModifiers.G_STAFF_COMMENTS;
    mapping[s2525Modifiers.H_ADDITIONAL_INFO_1] = longModifiers.H_ADDITIONAL_INFO_1;
    mapping[s2525Modifiers.H1_ADDITIONAL_INFO_2] = longModifiers.H1_ADDITIONAL_INFO_2;
    mapping[s2525Modifiers.H2_ADDITIONAL_INFO_3] = longModifiers.H2_ADDITIONAL_INFO_3;
    mapping[s2525Modifiers.J_EVALUATION_RATING] = longModifiers.J_EVALUATION_RATING;
    mapping[s2525Modifiers.K_COMBAT_EFFECTIVENESS] = longModifiers.K_COMBAT_EFFECTIVENESS;
    mapping[s2525Modifiers.L_SIGNATURE_EQUIPMENT] = longModifiers.L_SIGNATURE_EQUIPMENT;
    mapping[s2525Modifiers.M_HIGHER_FORMATION] = longModifiers.M_HIGHER_FORMATION;
    mapping[s2525Modifiers.N_HOSTILE] = longModifiers.N_HOSTILE;
    mapping[s2525Modifiers.P_IFF_SIF] = longModifiers.P_IFF_SIF;
    mapping[s2525Modifiers.Q_DIRECTION_OF_MOVEMENT] = longModifiers.Q_DIRECTION_OF_MOVEMENT;
    mapping[s2525Modifiers.S_OFFSET_INDICATOR] = longModifiers.S_OFFSET_INDICATOR;
    mapping[s2525Modifiers.T_UNIQUE_DESIGNATION_1] = longModifiers.T_UNIQUE_DESIGNATION_1;
    mapping[s2525Modifiers.T1_UNIQUE_DESIGNATION_2] = longModifiers.T1_UNIQUE_DESIGNATION_2;
    mapping[s2525Modifiers.V_EQUIP_TYPE] = longModifiers.V_EQUIP_TYPE;
    mapping[s2525Modifiers.W_DTG_1] = longModifiers.W_DTG_1;
    mapping[s2525Modifiers.W1_DTG_2] = longModifiers.W1_DTG_2;
    mapping[s2525Modifiers.X_ALTITUDE_DEPTH] = longModifiers.X_ALTITUDE_DEPTH;
    mapping[s2525Modifiers.Y_LOCATION] = longModifiers.Y_LOCATION;
    mapping[s2525Modifiers.Z_SPEED] = longModifiers.Z_SPEED;
    mapping[s2525Modifiers.AA_SPECIAL_C2_HEADQUARTERS] = longModifiers.AA_SPECIAL_C2_HEADQUARTERS;
    mapping[s2525Modifiers.AM_DISTANCE] = longModifiers.AM_DISTANCE;
    mapping[s2525Modifiers.AN_AZIMUTH] = longModifiers.AN_AZIMUTH;
    mapping[longModifiers.FILL_COLOR] = longModifiers.FILL_COLOR;
    mapping[longModifiers.LINE_COLOR] = longModifiers.LINE_COLOR;
    mapping[longModifiers.X_OFFSET] = longModifiers.X_OFFSET;
    mapping[longModifiers.X_UNITS] = longModifiers.X_UNITS;
    mapping[longModifiers.Y_OFFSET] = longModifiers.Y_OFFSET;
    mapping[longModifiers.Y_UNITS] = longModifiers.Y_UNITS;
    mapping[longModifiers.SIZE] = longModifiers.SIZE;
    mapping[longModifiers.LINE_THICKNESS] = longModifiers.LINE_THICKNESS;
    mapping[s2525Modifiers.HEADING] = longModifiers.Q_DIRECTION_OF_MOVEMENT;
    mapping[s2525Modifiers.STANDARD] = longModifiers.STANDARD;

    return mapping;
}());

emp.typeLibrary.utils.milstd.convertModifiersToStrings = function (oModifiers)
{
    var aStringModifiers = {};

    for (var sModifier in oModifiers)
    {
        if (emp.typeLibrary.utils.milstd.ModifierToString.hasOwnProperty(sModifier))
        {
            if (sModifier === emp.typeLibrary.utils.milstd.Modifiers.STANDARD)
            {
                // convert standard string value  to modifier numeric
                aStringModifiers[emp.typeLibrary.utils.milstd.StringModifiers.STANDARD] = cesiumEngine.utils.convertSymbolStandardToStringFormat (oModifiers);
            }
            else
            {
                aStringModifiers[emp.typeLibrary.utils.milstd.ModifierToString[sModifier]] = oModifiers[sModifier];
            }
        }
    }

    return aStringModifiers;
};

emp.typeLibrary.utils.milstd.convertStringsToModifiers = function (oStringModifiers)
{
    var oModifiers = {};

    for (var sModifier in oStringModifiers)
    {
        if (emp.typeLibrary.utils.milstd.StringToModifier.hasOwnProperty(sModifier))
        {
            if (sModifier === emp.typeLibrary.utils.milstd.StringModifiers.STANDARD)
            {
                // convert standard string value  to modifier numeric
                oModifiers[emp.typeLibrary.utils.milstd.Modifiers.STANDARD] = cesiumEngine.utils.convertSymbolStandardToRendererFormat(oStringModifiers);
            }
            else
            {
                oModifiers[emp.typeLibrary.utils.milstd.StringToModifier[sModifier]] = oStringModifiers[sModifier];
            }
        }
    }
    return oModifiers;
};


emp.typeLibrary.utils.milstd.convertModifierStringTo2525 = function (modifiers, showModLabels)
{
    var standardModifiers = {};

    if (modifiers !== undefined && modifiers !== null)
    {
        for (var sModifier in modifiers)
        {
            if (modifiers.hasOwnProperty(sModifier))
            {
                var modValue = modifiers[sModifier];
                if (modValue !== null && modValue !== "null" && modValue !== 0)
                {
                    switch (sModifier)
                    {
                        case mil.symbology.renderer.modifierLookup.QUANTITY:
                            if (showModLabels)
                            {
                                standardModifiers["C"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.REDUCED_OR_REINFORCED:
                            if (showModLabels)
                            {
                                standardModifiers["F"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.STAFF_COMMENTS:
                            if (showModLabels)
                            {
                                standardModifiers["G"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.ADDITIONAL_INFO_1:
                            if (showModLabels)
                            {
                                standardModifiers["H"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.ADDITIONAL_INFO_2:
                            if (showModLabels)
                            {
                                standardModifiers["H1"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.ADDITIONAL_INFO_3:
                            if (showModLabels)
                            {
                                standardModifiers["H2"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.EVALUATION_RATING:
                            if (showModLabels)
                            {
                                standardModifiers["J"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.COMBAT_EFFECTIVENESS:
                            if (showModLabels)
                            {
                                standardModifiers["K"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.SIGNATURE_EQUIPMENT:
                            if (showModLabels)
                            {
                                standardModifiers["L"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.HIGHER_FORMATION:
                            if (showModLabels)
                            {
                                standardModifiers["M"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.HOSTILE:
                            if (showModLabels)
                            {
                                standardModifiers["N"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.IFF_SIF:
                            if (showModLabels)
                            {
                                standardModifiers["P"] = modValue;
                            }
                            break;
                            // Direction of movement cannot work on 3D because the view can rotate                                                              
                            // case mil.symbology.renderer.modifierLookup.DIRECTION_OF_MOVEMENT:                                                              
                            //    modifiersArray.push("Q=" + modValue);                                                              
                            //    break;                                                              
                        case mil.symbology.renderer.modifierLookup.OFFSET_INDICATOR:
                            standardModifiers["S"] = modValue;
                            break;
                        case mil.symbology.renderer.modifierLookup.UNIQUE_DESIGNATOR_1:
                            if (showModLabels)
                            {
                                standardModifiers["T"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.UNIQUE_DESIGNATOR_2:
                            if (showModLabels)
                            {
                                standardModifiers["T1"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.EQUIPMENT_TYPE:
                            if (showModLabels)
                            {
                                standardModifiers["V"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.DATE_TIME_GROUP:
                            if (showModLabels)
                            {
                                standardModifiers["W"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.DATE_TIME_GROUP_2:
                            if (showModLabels)
                            {
                                standardModifiers["W1"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.ALTITUDE_DEPTH:
                            if (showModLabels)
                            {
                                standardModifiers["X"] = JSON.parse(JSON.stringify(modValue));
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.LOCATION:
                            if (showModLabels)
                            {
                                standardModifiers["Y"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.SPEED:
                            if (showModLabels)
                            {
                                standardModifiers["Z"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.SPECIAL_C2_HEADQUARTERS:
                            if (showModLabels)
                            {
                                standardModifiers["AA"] = modValue;
                            }
                            break;
                        case mil.symbology.renderer.modifierLookup.DISTANCE:
                            standardModifiers["AM"] = JSON.parse(JSON.stringify(modValue));
                            break;
                        case mil.symbology.renderer.modifierLookup.AZIMUTH:
                            standardModifiers["AN"] = JSON.parse(JSON.stringify(modValue));
                            break;
                        case mil.symbology.renderer.modifierLookup.FILL_COLOR:
                            standardModifiers["FILLCOLOR"] = modValue;
                            break;
                        case mil.symbology.renderer.modifierLookup.LINE_COLOR:
                            standardModifiers["LINECOLOR"] = modValue;
                            break;
                        case mil.symbology.renderer.modifierLookup.STANDARD:
                            // convert standard string value  to modifier numeric
                            standardModifiers[emp.typeLibrary.utils.milstd.Modifiers.STANDARD] = cesiumEngine.utils.convertSymbolStandardToRendererFormat(modifiers);
                            break;
                        case mil.symbology.renderer.modifierLookup.NAME:
                        case "CN":
                            if (showModLabels)
                            {
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



//update modifiers based on core pallette's  options
emp.typeLibrary.utils.milstd.updateModifierLabels = function (properties, name, iconLabels, iconPixelSize)
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

    if (iconLabels.CN)
    {
        modifiedModifiers["name"] = name;
    }//("fillColor=0x" + encodeURIComponent(properties[property]));
    return modifiedModifiers;
};


emp.typeLibrary.utils.milstd.convertModifier2525ToString = function (sModifier)
{
    if (sModifier.toUpperCase() === ("C"))
    {
        sModifier = QUANTITY;
    }
    else if (sModifier.toUpperCase() === ("F"))
    {
        sModifier = REDUCED_OR_REINFORCED;
    }
    else if (sModifier.toUpperCase() === ("G"))
    {
        sModifier = STAFF_COMMENTS;
    }
    else if (sModifier.toUpperCase() === ("H"))
    {
        sModifier = ADDITIONAL_INFO_1;
    }
    else if (sModifier.toUpperCase() === ("H1"))
    {
        sModifier = ADDITIONAL_INFO_2;
    }
    else if (sModifier.toUpperCase() === ("H2"))
    {
        sModifier = ADDITIONAL_INFO_3;
    }
    else if (sModifier.toUpperCase() === ("J"))
    {
        sModifier = EVALUATION_RATING;
    }
    else if (sModifier.toUpperCase() === ("K"))
    {
        sModifier = COMBAT_EFFECTIVENESS;
    }
    else if (sModifier.toUpperCase() === ("L"))
    {
        sModifier = SIGNATURE_EQUIPMENT;
    }
    else if (sModifier.toUpperCase() === ("M"))
    {
        sModifier = HIGHER_FORMATION;
    }
    else if (sModifier.toUpperCase() === ("N"))
    {
        sModifier = HOSTILE;
    }
    else if (sModifier.toUpperCase() === ("P"))
    {
        sModifier = IFF_SIF;
    }
    else if (sModifier.toUpperCase() === ("Q"))
    {
        sModifier = DIRECTION_OF_MOVEMENT;
    }
    else if (sModifier.toUpperCase() === ("S"))
    {
        sModifier = OFFSET_INDICATOR;
    }
    else if (sModifier.toUpperCase() === ("T"))
    {
        sModifier = UNIQUE_DESIGNATOR_1;
    }
    else if (sModifier.toUpperCase() === ("T1"))
    {
        sModifier = UNIQUE_DESIGNATOR_2;
    }
    else if (sModifier.toUpperCase() === ("V"))
    {
        sModifier = EQUIPMENT_TYPE;
    }
    else if (sModifier.toUpperCase() === ("W"))
    {
        sModifier = DATE_TIME_GROUP;
    }
    else if (sModifier.toUpperCase() === ("W1"))
    {
        sModifier = DATE_TIME_GROUP_2;
    }
    else if (sModifier.toUpperCase() === ("X"))
    {
        sModifier = ALTITUDE_DEPTH;
    }
    else if (sModifier.toUpperCase() === ("Y"))
    {
        sModifier = LOCATION;
    }
    else if (sModifier.toUpperCase() === ("Z"))
    {
        sModifier = SPEED;
    }
    else if (sModifier.toUpperCase() === ("AA"))
    {
        sModifier = SPECIAL_C2_HEADQUARTERS;
    }
    else if (sModifier.toUpperCase() === ("AM"))
    {
        sModifier = DISTANCE;
    }
    else if (sModifier.toUpperCase() === ("AN"))
    {
        sModifier = AZIMUTH;
    }
    else if (sModifier.toUpperCase() === (emp.typeLibrary.utils.milstd.Modifiers.STANDARD))
    {
        sModifier = "standard";
    }

    return sModifier;
};

/*
 * This function should be added to the emp-map emp.typeLibrary.featureMilStdVersionType
 */
emp.typeLibrary.featureMilStdVersionType.convertToString = function (iValue)
{
    var sRet = emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B;
    switch (iValue)
    {
        case 0:
            sRet = emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B;
            break;
        case 1:
            sRet = emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C;
            break;
    }

    return sRet;
};
