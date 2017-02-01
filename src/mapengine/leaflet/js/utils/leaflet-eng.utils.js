
/* global leafLet, L, emp */

leafLet.utils = leafLet.utils || {};

leafLet.utils.Units = {
    FEET: 'ft',
    METERS: 'm'
};

leafLet.utils.AngleUnits = {
    DEGREES: '&deg;',
    MILS: 'mils'
};

leafLet.utils.METERS_PER_FEET = 0.3048;
leafLet.utils.FEET_PER_METERS = 3.28084;
leafLet.utils.MILS_PER_DEGREE = (6400.0 / 360.0);
leafLet.utils.DEGREE_PER_MILS = (360.0 / 6400.0);

leafLet.utils.AltitudeModeAbbr = function(sMode)
{
    var sText = "";

    switch (sMode)
    {
        case emp.typeLibrary.featureAltitudeModeType.RELATIVE_TO_GROUND:
            sText = "AGL";
            break;
        case emp.typeLibrary.featureAltitudeModeType.ABSOLUTE:
            sText = "MSL";
            break;
    }

    return sText;
};


leafLet.utils.normilizeLongitude = function(dLon)
{
    if (dLon < -180)
    {
        while (dLon < -180)
        {
            dLon += 360;
        }
    }
    else if (dLon > 180)
    {
        dLon = ((dLon + 180) % 360) - 180;
    }

    return dLon;
};

leafLet.utils.convertViewBound = function(oBounds, oData)
{
    var oView = oData || {};

    oView.west = leafLet.utils.normilizeLongitude(oBounds.getWest());
    oView.south = oBounds.getSouth();
    oView.east = leafLet.utils.normilizeLongitude(oBounds.getEast());
    oView.north = oBounds.getNorth();

    return oView;
};

leafLet.utils.isInt = function(sStr)
{
   var y = parseInt(sStr, 10);
   return !isNaN(y) && (sStr == y) && (sStr.toString() == y.toString());
};

leafLet.utils.anyCoordinateInBounds = function(oBounds, oCoordinates)
{
    var oCoord;
    var bRet = false;
    var oaCoordList = oCoordinates.coordinates;

    switch (oCoordinates.type.toLowerCase())
    {
        case 'point':
            oCoord = new L.LatLng(oaCoordList[1], oaCoordList[0]);
            bRet = oBounds.contains(oCoord);
            break;
        case 'linestring':
            for(var iIndex = 0; iIndex < oaCoordList.length; iIndex++)
            {
                oCoord = new L.LatLng(oaCoordList[iIndex][1], oaCoordList[iIndex][0]);
                bRet = oBounds.contains(oCoord);

                if (bRet)
                {
                    break;
                }
            }
            break;
        case 'polygon':
            oaCoordList = oaCoordList[0];
            for(var iIndex = 0; iIndex < oaCoordList.length; iIndex++)
            {
                oCoord = new L.LatLng(oaCoordList[iIndex][1], oaCoordList[iIndex][0]);
                bRet = oBounds.contains(oCoord);

                if (bRet)
                {
                    break;
                }
            }
            break;
    }

    return bRet;
};

leafLet.utils.wrapLongitude = function(oMapBoundry, oLatLng)
{
    var oMapCenter = oMapBoundry.getCenter();
    var oNewLatLng = oLatLng.wrap();

    if (oMapBoundry)
    {
        if (oMapCenter.lng > 0)
        {
            // The map is on the right side
            if (oMapBoundry.getEast() > 180)
            {
                // The right side went beyond the date line.
                var oNorthEastBoundry = oMapBoundry.getNorthEast().wrap();

                if (oNewLatLng.lng <= oNorthEastBoundry.lng)
                {
                    oNewLatLng.lng = oNewLatLng.lng + 360;
                }
            }
        }
        else
        {
            // The map is on the left side
            if (oMapBoundry.getWest() < -180)
            {
                // The left side went beyond the date line.
                var oNorthWestBoundry = oMapBoundry.getNorthWest().wrap();

                if (oNewLatLng.lng >= oNorthWestBoundry.lng)
                {
                    oNewLatLng.lng = oNewLatLng.lng - 360;
                }
            }
        }
    }

    return oNewLatLng;
};

leafLet.utils.wrapCoordinates = function(oMapBoundry, oLatLngList, bWrappedAlready)
{
    var bCoordWrapped = bWrappedAlready || false;
    var iCoorCnt = oLatLngList.length;
    var oMapCenter = oMapBoundry.getCenter();
    var oNorthEastBoundry = oMapBoundry.getNorthEast().wrap();
    var oNorthWestBoundry = oMapBoundry.getNorthWest().wrap();

    for (var iIndex = 0; iIndex < iCoorCnt; iIndex++)
    {
        oLatLngList[iIndex] = oLatLngList[iIndex].wrap();
        if (bCoordWrapped)
        {
            if (oMapBoundry.getEast() > 180)
            {
                if (oLatLngList[iIndex].lng <= oNorthWestBoundry.lng)
                {
                    oLatLngList[iIndex].lng = oLatLngList[iIndex].lng + 360;
                }
            }
            else if (oMapBoundry.getWest() < -180)
            {
                if (oLatLngList[iIndex].lng >= oNorthEastBoundry.lng)
                {
                    oLatLngList[iIndex].lng = oLatLngList[iIndex].lng - 360;
                }
            }
        }
        else if (oMapBoundry.getEast() > 180)
        {
            // The right side went beyond the date line.
            if (oLatLngList[iIndex].lng <= oNorthWestBoundry.lng)
            {
                iIndex = -1; // Reset the index to start over;
                // Once we find 1 that needs wrapping we must wrap all of them.
                bCoordWrapped = true;
                continue;
            }
        }
        else if (oMapBoundry.getWest() < -180)
        {
            // The left side went beyond the date line.
            if (oLatLngList[iIndex].lng >= oNorthEastBoundry.lng)
            {
                iIndex = -1; // Reset the index to start over;
                // Once we find 1 that needs wrapping we must wrap all of them.
                bCoordWrapped = true;
                continue;
            }
        }
    }

    if (!bCoordWrapped && leafLet.utils.dateLineInFeature(oLatLngList))
    {
        // If it didn't wrap we need to ensure that is not on the date line.
        // If it is wrap it.
        for (var iIndex = 0; iIndex < iCoorCnt; iIndex++)
        {
            if (oMapCenter.lng > 0)
            {
                oLatLngList[iIndex].lng = oLatLngList[iIndex].lng + 360;
            }
            else
            {
                oLatLngList[iIndex].lng = oLatLngList[iIndex].lng - 360;
            }
        }

        bCoordWrapped = true;
    }

    return bCoordWrapped;
};

leafLet.utils.dateLineInFeature = function(oLatLngList)
{
    if (oLatLngList.length === 0)
    {
        return false;
    }

    var bDataLineInFeature = false;
    var oCurrentLatLon;
    var iCount = oLatLngList.length;
    var iCountMinus1 = iCount - 1;
    var oFeatureBounds = new L.LatLngBounds(oLatLngList);
    var dAngularDist = Math.abs(oFeatureBounds.getEast() - oFeatureBounds.getWest());

    for (var iIndex = 0; (iIndex < iCountMinus1) && !bDataLineInFeature; iIndex++)
    {
        oCurrentLatLon = oLatLngList[iIndex];

        for (var iIndex2 = iIndex + 1; (iIndex2 < iCount) && !bDataLineInFeature; iIndex2++)
        {
            if (((oCurrentLatLon.lng > 0) && (oLatLngList[iIndex2].lng < 0)) ||
                    ((oCurrentLatLon.lng < 0) && (oLatLngList[iIndex2].lng > 0)))
            {
                bDataLineInFeature = true;
            }
        }
    }

    return bDataLineInFeature && (dAngularDist > 180);
};

leafLet.utils.convertToColorString = function(dOpacity, sColor)
{
    var sNewColor = sColor.replace("#", "0x");
    var iColor = (Math.round(dOpacity * 255) * 4096) + parseInt(sNewColor);

    sNewColor = iColor.toString(16);

    return sNewColor;
};

leafLet.utils.mergeProperties = function(oProperties1, oProperties2)
{
    var oProperties = emp.helpers.copyObject(oProperties1);

    for (var sProp in oProperties2)
    {
        if (!oProperties2.hasOwnProperty(sProp)) {
            continue;
        }
        oProperties[sProp] = emp.helpers.copyObject(oProperties2[sProp]);
    }

    return oProperties;
};

leafLet.utils.metersToFeet = function(iMeters)
{
    return iMeters * 3.28084;
};

leafLet.utils.feetToMeters = function(iFeet)
{
    return iFeet * 0.3048;
};

leafLet.utils.convertColor = function(sColor)
{
    var dValue = 255;
    var oRet = {
        sColor: "",
        opacity: 1.0
    };

    if (sColor.indexOf("0x") === 0)
    {
        sColor = sColor.substr(2);
    }

    if (sColor.length > 7)
    {
        // There is an alpha value;
        dValue = parseInt("0x" + sColor.substr(0,2));
        sColor = sColor.substr(2);
    }
    else if (sColor.length > 6)
    {
        // There is an alpha value;
        dValue = parseInt("0x" + sColor.substr(0,1));
        sColor = sColor.substr(1);
    }
    oRet.opacity = dValue / 255;
    oRet.sColor = "#" + sColor;

    return oRet;
};

leafLet.utils.angleBetween = function(oVertice, oPt1, oPt2)
{
    var dAngleVPt1 = oVertice.bearingTo(oPt1);
    var dAngleVPt2 = oVertice.bearingTo(oPt2);
    var dAngle = dAngleVPt2 - dAngleVPt1;

    //if (dAngle > 180.0)
    //{
    //    dAngle = 360.0 - dAngle;
    //}

    return dAngle;
};

leafLet.utils.getArcCoordinates = function(oMap, oCenter, dRadius, dStartAzimuth, dEndAzimuth, bClockwise)
{
    var oLatLngList = [];
    var oNewPt;
    var dNewAngleDelta;
    var dAngleInc;
    var oPt1 = oCenter.destinationPoint(dStartAzimuth, dRadius);
    var oPt2 = oCenter.destinationPoint(dEndAzimuth, dRadius);
    var oPoint1 = oMap.latLngToContainerPoint(oPt1);
    var oPoint2 = oMap.latLngToContainerPoint(oPt2);
    var dAngleVPt1Pt2 = Math.abs(dEndAzimuth - dStartAzimuth);
    var dPointDist = Math.round(oPoint1.distanceTo(oPoint2));

    if (bClockwise && (dEndAzimuth < dStartAzimuth))
    {
        dAngleVPt1Pt2 = 360 - dAngleVPt1Pt2;
    }
    else if (!bClockwise && (dStartAzimuth < dEndAzimuth))
    {
        dAngleVPt1Pt2 = 360 - dAngleVPt1Pt2;
    }

    if (!bClockwise)
    {
        dAngleVPt1Pt2 *= -1.0;
    }

    dAngleInc = dAngleVPt1Pt2 / dPointDist;

    oLatLngList.push(oPt1);

    // Now make the semi-circle arounf Pt2.
    for (var iIndex = 0, dNewAngleDelta = dAngleInc;
        iIndex < dPointDist;
        iIndex++)
    {
        oNewPt = oCenter.destinationPoint((dStartAzimuth + dNewAngleDelta + 360) % 360, dRadius);
        oLatLngList.push(oNewPt);
        dNewAngleDelta += dAngleInc;
    }

    oLatLngList.push(oPt2);

    return oLatLngList;
};

leafLet.utils.geoColorToHexColorString = function(geoColor) {
    var sColor;

    sColor = ('00' + geoColor.red.toString(16)).substr(-2);
    sColor += ('00' + geoColor.green.toString(16)).substr(-2);
    sColor += ('00' + geoColor.blue.toString(16)).substr(-2);

    return sColor;
}
