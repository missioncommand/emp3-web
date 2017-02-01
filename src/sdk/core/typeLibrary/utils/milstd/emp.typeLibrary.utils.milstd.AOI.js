/* global emp */

emp.typeLibrary.utils.milstd.AOI = emp.typeLibrary.utils.milstd.AOI || {};

emp.typeLibrary.utils.milstd.AOI.isAOI = function(oItem) {
    var bRet = false;
    var oGeoJson = oItem.data;

    if (oGeoJson.hasOwnProperty('type') &&
        (oGeoJson.type.toLowerCase() === 'feature'))
    {
        if (oGeoJson.hasOwnProperty('properties') &&
            oGeoJson.properties.hasOwnProperty('aoi'))
        {
            bRet = true;
        }
    }
    return bRet;
};

emp.typeLibrary.utils.milstd.AOI.getAOISymbolCode = function (aoiType) {
    var eAOIType = emp.typeLibrary.AOIType,
        result;

    switch (aoiType)
    {
        case eAOIType.POINT_RADIUS:
            result = "BBS_POINT------";
            break;
        case eAOIType.LINE:
            result = "BBS_LINE-------";
            break;
        case eAOIType.POLYGON:
            result = "BBS_AREA-------";
            break;
        case eAOIType.BBOX:
            result = "BBS_RECTANGLE--";
            break;
    }
    return result;
};

emp.typeLibrary.utils.milstd.AOI.getModifiers = function (oItem) {
    var oGeoJson = emp.helpers.copyObject(oItem.data);
    //var eMilStdModifiers = emp.typeLibrary.utils.milstd.Modifiers;
    var oProperties = oGeoJson.properties;
    var newModifiers = emp.helpers.copyObject(oItem.properties.modifiers) || {};

    newModifiers["T"] = oItem.name;
    newModifiers["AM"] = oItem.data.properties.aoi.buffer;

    if (oProperties)
    {
        if (oProperties.hasOwnProperty('fillColor'))
        {
            newModifiers["fillColor"] = oProperties.fillColor;
        }
        if (oProperties.hasOwnProperty('lineColor'))
        {
            newModifiers["lineColor"] = oProperties.lineColor;
        }
    }

    if (!newModifiers["fillColor"])
    {
        if (oGeoJson && oGeoJson.properties.hasOwnProperty('fillColor'))
        {
            newModifiers["fillColor"] = oGeoJson.properties.fillColor;
        }
    }

    if (!newModifiers["lineColor"])
    {
        if (oGeoJson && oGeoJson.properties.hasOwnProperty('lineColor'))
        {
            newModifiers["lineColor"] = oGeoJson.properties.lineColor;
        }
    }

    if (!newModifiers["fillColor"])
    {
        // If fill color is still not set, set our default.
        // I would prefer the default to be set by the renderer but it fails
        // if one is not provided.
        newModifiers["fillColor"] = '99AAAAAA';
    }
    
    return newModifiers;
};