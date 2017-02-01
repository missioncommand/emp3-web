
emp = emp || {};
emp.util = emp.util || {};

/**
 * @description This function test if the parameters is an empty string. An undefined, 
 * null, non string type, or "" value is considered empty.
 * @param {String} str The string on which the test is to be performed.
 * @returns {Boolean}
 */
emp.util.isEmptyString = emp.helpers.isEmptyString;

/**
 * @description This function return the value contained in the Value parameter to a boolean value. It return the value of bDefault if the Value can't be converted.
 * @param {String|Boolean} Value
 * @param {Boolean} bDefault
 * @throws {String} This function throw an error if the bDefault parameters is NOT a boolean value.
 * @returns {Boolean}
 */
emp.util.getBooleanValue = function(Value, bDefault) {
    var bRet = bDefault;
    var sNotDefaultStringValue = (bDefault === true)? 'false': 'true';

    if (typeof (bDefault) !== 'boolean') {
        throw 'Invalid boolean default value.';
    }

    if (Value === !bDefault) {
        bRet = !bDefault;
    } else if ((typeof (Value) === 'string') && (Value === sNotDefaultStringValue)) {
        bRet = !bDefault;
    }

    return bRet;
};

emp.util.isAirspaceSymbol = function(sSymbolCode) {
    if (sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_CAKE ||
      sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_ROUTE ||
      sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_CYLINDER ||
      sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_ORBIT ||
      sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_POLYGON ||
      sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_RADARC ||
      sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_POLYARC ||
      sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_TRACK ||
      sSymbolCode === emp.constant.airspaceSymbolCode.SHAPE3D_CURTAIN) {
        return true;
    }
    return false;
};
