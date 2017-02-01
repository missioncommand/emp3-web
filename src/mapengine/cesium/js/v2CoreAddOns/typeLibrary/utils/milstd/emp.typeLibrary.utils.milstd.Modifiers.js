/* global emp, armyc2 */

/**
 * @description This type enumerates the MilStd modifiers as defined in 2525 and the ones 
 * used by the renderer.
 */
//armyc2.c2sd.renderer.utilities.ModifiersTG;
emp.typeLibrary.utils.milstd.Modifiers = {
    C_QUANTITY : armyc2.c2sd.renderer.utilities.ModifiersTG.C_QUANTITY,
    H_ADDITIONAL_INFO_1 : armyc2.c2sd.renderer.utilities.ModifiersTG.H_ADDITIONAL_INFO_1,
    H1_ADDITIONAL_INFO_2 : armyc2.c2sd.renderer.utilities.ModifiersTG.H1_ADDITIONAL_INFO_2,
    H2_ADDITIONAL_INFO_3 : armyc2.c2sd.renderer.utilities.ModifiersTG.H2_ADDITIONAL_INFO_3,
    N_HOSTILE : armyc2.c2sd.renderer.utilities.ModifiersTG.N_HOSTILE,
    Q_DIRECTION_OF_MOVEMENT : armyc2.c2sd.renderer.utilities.ModifiersTG.Q_DIRECTION_OF_MOVEMENT,
    S_OFFSET_INDICATOR : armyc2.c2sd.renderer.utilities.ModifiersTG.S_OFFSET_INDICATOR,
    T_UNIQUE_DESIGNATION_1 : armyc2.c2sd.renderer.utilities.ModifiersTG.T_UNIQUE_DESIGNATION_1,
    T1_UNIQUE_DESIGNATION_2 : armyc2.c2sd.renderer.utilities.ModifiersTG.T1_UNIQUE_DESIGNATION_2,
    V_EQUIP_TYPE : armyc2.c2sd.renderer.utilities.ModifiersTG.V_EQUIP_TYPE,
    W_DTG_1 : armyc2.c2sd.renderer.utilities.ModifiersTG.W_DTG_1,
    W1_DTG_2 : armyc2.c2sd.renderer.utilities.ModifiersTG.W1_DTG_2,
    X_ALTITUDE_DEPTH : armyc2.c2sd.renderer.utilities.ModifiersTG.X_ALTITUDE_DEPTH,
    Y_LOCATION : armyc2.c2sd.renderer.utilities.ModifiersTG.Y_LOCATION,
    AM_DISTANCE : armyc2.c2sd.renderer.utilities.ModifiersTG.AM_DISTANCE,
    AN_AZIMUTH : armyc2.c2sd.renderer.utilities.ModifiersTG.AN_AZIMUTH,
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

emp.typeLibrary.utils.milstd.String2Modifier = (function(){
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
    //mapping[longModifiers.FILL_COLOR] = longModifiers.FILL_COLOR;
    //mapping[longModifiers.LINE_COLOR] = longModifiers.LINE_COLOR;
    //mapping[longModifiers.X_OFFSET] = longModifiers.X_OFFSET;
    //mapping[longModifiers.X_UNITS] = longModifiers.X_UNITS;
    //mapping[longModifiers.Y_OFFSET] = longModifiers.Y_OFFSET;
    //mapping[longModifiers.Y_UNITS] = longModifiers.Y_UNITS;
    //mapping[longModifiers.SIZE] = longModifiers.SIZE;
    //mapping[longModifiers.LINE_THICKNESS] = longModifiers.LINE_THICKNESS;
    mapping[longModifiers.HEADING] = s2525Modifiers.Q_DIRECTION_OF_MOVEMENT;
    //mapping[longModifiers.STANDARD] = s2525Modifiers.STANDARD;
    
    return mapping;
}());

emp.typeLibrary.utils.milstd.Modifier2String = (function(){
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
    //mapping[longModifiers.FILL_COLOR] = longModifiers.FILL_COLOR;
    //mapping[longModifiers.LINE_COLOR] = longModifiers.LINE_COLOR;
    //mapping[longModifiers.X_OFFSET] = longModifiers.X_OFFSET;
    //mapping[longModifiers.X_UNITS] = longModifiers.X_UNITS;
    //mapping[longModifiers.Y_OFFSET] = longModifiers.Y_OFFSET;
    //mapping[longModifiers.Y_UNITS] = longModifiers.Y_UNITS;
    //mapping[longModifiers.SIZE] = longModifiers.SIZE;
    //mapping[longModifiers.LINE_THICKNESS] = longModifiers.LINE_THICKNESS;
    mapping[s2525Modifiers.HEADING] = longModifiers.Q_DIRECTION_OF_MOVEMENT;
    //mapping[s2525Modifiers.STANDARD] = longModifiers.STANDARD;
    
    return mapping;
}());

emp.typeLibrary.utils.milstd.convertModifiers2Strings = function(oModifiers)
{
    var aStringModifiers = {};
    
    for (var sModifier in oModifiers)
    {
        if (emp.typeLibrary.utils.milstd.Modifier2String.hasOwnProperty(sModifier))
        {
            aStringModifiers[emp.typeLibrary.utils.milstd.Modifier2String[sModifier]] = oModifiers[sModifier];
        }
    }
    
    return aStringModifiers;
};

emp.typeLibrary.utils.milstd.convertStrings2Modifiers = function(oStringModifiers)
{
    var oModifiers = {};
    
    for (var sModifier in oStringModifiers)
    {
        if (emp.typeLibrary.utils.milstd.String2Modifier.hasOwnProperty(sModifier))
        {
            oModifiers[emp.typeLibrary.utils.milstd.String2Modifier[sModifier]] = oStringModifiers[sModifier];
        }
    }
    
    return oModifiers;
};

/*
 * This function should be added to the emp-map emp.typeLibrary.featureMilStdVersionType
 */
emp.typeLibrary.featureMilStdVersionType.convertToString = function(iValue)
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
