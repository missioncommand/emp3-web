/* global leafLet, emp, NaN */

leafLet.typeLibrary.MilStdModifiers = function(oFeature, args)
{
    var oMilStdFeature = oFeature;
    var o2525Modifiers = leafLet.utils.milstd.Modifiers;
    var oStringModifiers = leafLet.utils.milstd.longModifiers;
    var oLongToShortModifierName = leafLet.utils.milstd.stringToModifiers;
    var o2525ModifierToLong = leafLet.utils.milstd.o2525ModifierToLong;

    var publicInterface = {
        oModifiers: {},
        getAMValueCount: function()
        {
            if (this.oModifiers[o2525Modifiers.DISTANCE] === undefined)
            {
                this.oModifiers[o2525Modifiers.DISTANCE] = [];
            }

            return this.oModifiers[o2525Modifiers.DISTANCE].length;
        },
        getAMValue: function(iIndex)
        {
            if (iIndex >= this.getAMValueCount())
            {
                return NaN;
            }

            var dValue = this.oModifiers[o2525Modifiers.DISTANCE][iIndex];

            switch (oMilStdFeature.getUnits())
            {
                case leafLet.utils.Units.FEET:
                    dValue = Math.round(dValue * leafLet.utils.METERS_PER_FEET);
                    break;
            }
            return dValue;
        },
        setAMValue: function(iIndex, dValue)
        {
            switch (oMilStdFeature.getUnits())
            {
                case leafLet.utils.Units.FEET:
                    dValue = Math.round(dValue * leafLet.utils.FEET_PER_METERS);
                    break;
            }

            if (iIndex < this.getAMValueCount())
            {
                this.oModifiers[o2525Modifiers.DISTANCE][iIndex] = dValue;
            }
            else
            {
                this.oModifiers[o2525Modifiers.DISTANCE].push(dValue);
            }
        },
        getANValueCount: function()
        {
            if (this.oModifiers[o2525Modifiers.AZIMUTH] === undefined)
            {
                this.oModifiers[o2525Modifiers.AZIMUTH] = [];
            }

            return this.oModifiers[o2525Modifiers.AZIMUTH].length;
        },
        getANValue: function(iIndex)
        {
            if (iIndex >= this.getANValueCount())
            {
                return NaN;
            }

            var dValue = this.oModifiers[o2525Modifiers.AZIMUTH][iIndex];

            switch (oMilStdFeature.getAzimuthUnits())
            {
                case leafLet.utils.AngleUnits.MILS:
                    dValue = dValue * leafLet.utils.DEGREE_PER_MILS;
                    break;
            }

            return dValue;
        },
        setANValue: function(iIndex, dValue)
        {
            switch (oMilStdFeature.getAzimuthUnits())
            {
                case leafLet.utils.AngleUnits.MILS:
                    dValue = dValue * leafLet.utils.MILS_PER_DEGREE;
                    break;
            }

            if (iIndex < this.getANValueCount())
            {
                this.oModifiers[o2525Modifiers.AZIMUTH][iIndex] = dValue;
            }
            else
            {
                this.oModifiers[o2525Modifiers.AZIMUTH].push(dValue);
            }
        },
        getXValueCount: function()
        {
            if (this.oModifiers[o2525Modifiers.ALTITUDE_DEPTH] === undefined)
            {
                this.oModifiers[o2525Modifiers.ALTITUDE_DEPTH] = [];
            }

            return this.oModifiers[o2525Modifiers.ALTITUDE_DEPTH].length;
        },
        getXValue: function(iIndex)
        {
            if (iIndex >= this.getXValueCount())
            {
                return NaN;
            }

            var dValue = this.oModifiers[o2525Modifiers.ALTITUDE_DEPTH][iIndex];

            switch (oMilStdFeature.getAltitudeUnits())
            {
                case leafLet.utils.Units.FEET:
                    dValue = Math.round(dValue * leafLet.utils.FEET_PER_METERS);
                    break;
            }

            return dValue;
        },
        setXValue: function(iIndex, dValue)
        {
            switch (oMilStdFeature.getAltitudeUnits())
            {
                case leafLet.utils.Units.FEET:
                    dValue = Math.round(dValue * leafLet.utils.METERS_PER_FEET);
                    break;
            }

            if (iIndex < this.getXValueCount())
            {
                this.oModifiers[o2525Modifiers.ALTITUDE_DEPTH][iIndex] = dValue;
            }
            else
            {
                this.oModifiers[o2525Modifiers.ALTITUDE_DEPTH].push(dValue);
            }
        },
        toModifiers: function()
        {
            var oNewModifiers = {};

            for (var sModifier in this.oModifiers)
            {
                if (!this.oModifiers.hasOwnProperty(sModifier)) {
                    continue;
                }
                if (this.oModifiers[sModifier] !== undefined)
                {
                    oNewModifiers[sModifier] = emp.helpers.copyObject(this.oModifiers[sModifier]);
                }
            }

            return oNewModifiers;
        },
        toLongModifiers: function()
        {
            var sLongModifier;
            var oNewModifiers = {};

            for (var sModifier in this.oModifiers) {
                if (!this.oModifiers.hasOwnProperty(sModifier)) {
                    continue;
                }
                if (this.oModifiers[sModifier] !== undefined)
                {
                    sLongModifier = (o2525ModifierToLong[sModifier])?o2525ModifierToLong[sModifier]: sModifier;

                    switch (sModifier)
                    {
                        case o2525Modifiers.STANDARD:
                            oNewModifiers[sLongModifier] = emp.typeLibrary.featureMilStdVersionType.convertToString(this.oModifiers[sModifier]);
                            break;
                        default:
                            oNewModifiers[sLongModifier] = emp.helpers.copyObject(this.oModifiers[sModifier]);
                            break;
                    }
                }
            }

            return oNewModifiers;
        }
    };

    var sShortName;

    for (var sProp in args)
    {
        if (!args.hasOwnProperty(sProp)) {
            continue;
        }
        sShortName = sProp;
        switch (sProp)
        {
            case oStringModifiers.FILL_COLOR:
            case oStringModifiers.LINE_COLOR:
            case oStringModifiers.X_OFFSET:
            case oStringModifiers.X_UNITS:
            case oStringModifiers.Y_OFFSET:
            case oStringModifiers.Y_UNITS:
            case oStringModifiers.LINE_THICKNESS:
                // These do not get added. They are used by the renderer.
                break;
            default:
                if (oLongToShortModifierName[sProp] !== undefined)
                {
                    sShortName = oLongToShortModifierName[sProp];
                }

                switch (sProp)
                {
                    case oStringModifiers.STANDARD:
                        publicInterface.oModifiers[sShortName] = emp.typeLibrary.featureMilStdVersionType.convertToNumeric(args[oStringModifiers.STANDARD]);
                        break;
                    default:
                        publicInterface.oModifiers[sShortName] = args[sProp];
                        break;
                }
                break;
        }
    }
/*
    publicInterface.oModifiers[o2525Modifiers.QUANTITY] = args[o2525Modifiers.QUANTITY] || args[oStringModifiers.QUANTITY];
    publicInterface.oModifiers[o2525Modifiers.REDUCED_OR_REINFORCED] = args[o2525Modifiers.REDUCED_OR_REINFORCED] || args[oStringModifiers.REDUCED_OR_REINFORCED];
    publicInterface.oModifiers[o2525Modifiers.STAFF_COMMENTS] = args[o2525Modifiers.STAFF_COMMENTS] || args[oStringModifiers.STAFF_COMMENTS];
    publicInterface.oModifiers[o2525Modifiers.ADDITIONAL_INFO_1] = args[o2525Modifiers.ADDITIONAL_INFO_1] || args[oStringModifiers.ADDITIONAL_INFO_1];
    publicInterface.oModifiers[o2525Modifiers.ADDITIONAL_INFO_2] = args[o2525Modifiers.ADDITIONAL_INFO_2] || args[oStringModifiers.ADDITIONAL_INFO_2];
    publicInterface.oModifiers[o2525Modifiers.ADDITIONAL_INFO_3] = args[o2525Modifiers.ADDITIONAL_INFO_3] || args[oStringModifiers.ADDITIONAL_INFO_3];
    publicInterface.oModifiers[o2525Modifiers.EVALUATION_RATING] = args[o2525Modifiers.EVALUATION_RATING] || args[oStringModifiers.EVALUATION_RATING];
    publicInterface.oModifiers[o2525Modifiers.COMBAT_EFFECTIVENESS] = args[o2525Modifiers.COMBAT_EFFECTIVENESS] || args[oStringModifiers.COMBAT_EFFECTIVENESS];
    publicInterface.oModifiers[o2525Modifiers.SIGNATURE_EQUIPMENT] = args[o2525Modifiers.SIGNATURE_EQUIPMENT] || args[oStringModifiers.SIGNATURE_EQUIPMENT];
    publicInterface.oModifiers[o2525Modifiers.HIGHER_FORMATION] = args[o2525Modifiers.HIGHER_FORMATION] || args[oStringModifiers.HIGHER_FORMATION];
    publicInterface.oModifiers[o2525Modifiers.HOSTILE] = args[o2525Modifiers.HOSTILE] || args[oStringModifiers.HOSTILE];
    publicInterface.oModifiers[o2525Modifiers.IFF_SIF] = args[o2525Modifiers.IFF_SIF] || args[oStringModifiers.IFF_SIF];
    publicInterface.oModifiers[o2525Modifiers.DIRECTION_OF_MOVEMENT] = args[o2525Modifiers.DIRECTION_OF_MOVEMENT] || args[oStringModifiers.DIRECTION_OF_MOVEMENT];
    publicInterface.oModifiers[o2525Modifiers.OFFSET_INDICATOR] = args[o2525Modifiers.OFFSET_INDICATOR] || args[oStringModifiers.OFFSET_INDICATOR];
    publicInterface.oModifiers[o2525Modifiers.UNIQUE_DESIGNATOR_1] = args[o2525Modifiers.UNIQUE_DESIGNATOR_1] || args[oStringModifiers.UNIQUE_DESIGNATOR_1];
    publicInterface.oModifiers[o2525Modifiers.UNIQUE_DESIGNATOR_2] = args[o2525Modifiers.UNIQUE_DESIGNATOR_2] || args[oStringModifiers.UNIQUE_DESIGNATOR_2];
    publicInterface.oModifiers[o2525Modifiers.EQUIPMENT_TYPE] = args[o2525Modifiers.EQUIPMENT_TYPE] || args[oStringModifiers.EQUIPMENT_TYPE];
    publicInterface.oModifiers[o2525Modifiers.DATE_TIME_GROUP] = args[o2525Modifiers.DATE_TIME_GROUP] || args[oStringModifiers.DATE_TIME_GROUP];
    publicInterface.oModifiers[o2525Modifiers.DATE_TIME_GROUP_2] = args[o2525Modifiers.DATE_TIME_GROUP_2] || args[oStringModifiers.DATE_TIME_GROUP_2];
    publicInterface.oModifiers[o2525Modifiers.ALTITUDE_DEPTH] = args[o2525Modifiers.ALTITUDE_DEPTH] || args[oStringModifiers.ALTITUDE_DEPTH];
    publicInterface.oModifiers[o2525Modifiers.LOCATION] = args[o2525Modifiers.LOCATION] || args[oStringModifiers.LOCATION];
    publicInterface.oModifiers[o2525Modifiers.SPEED] = args[o2525Modifiers.SPEED] || args[oStringModifiers.SPEED];
    publicInterface.oModifiers[o2525Modifiers.SPECIAL_C2_HEADQUARTERS] = args[o2525Modifiers.SPECIAL_C2_HEADQUARTERS] || args[oStringModifiers.SPECIAL_C2_HEADQUARTERS];
    publicInterface.oModifiers[o2525Modifiers.DISTANCE] = args[o2525Modifiers.DISTANCE] || args[oStringModifiers.DISTANCE];
    publicInterface.oModifiers[o2525Modifiers.AZIMUTH] = args[o2525Modifiers.AZIMUTH] || args[oStringModifiers.AZIMUTH];
    publicInterface.oModifiers[o2525Modifiers.STANDARD] = args[o2525Modifiers.STANDARD] || emp.typeLibrary.featureMilStdVersionType.convertToNumeric(args[oStringModifiers.STANDARD]);
*/
    return publicInterface;
};
