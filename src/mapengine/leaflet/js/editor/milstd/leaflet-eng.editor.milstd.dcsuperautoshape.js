
/* global L, leafLet, armyc2, Infinity */

leafLet.internalPrivateClass.MilStdDCSuperAutoShapeEditor = function()
{
    var publicInterface = {
        initialize: function (args) 
        {
            //var oOptions = {
            //};
            //L.Util.setOptions(this, oOptions);
            
            leafLet.editor.MilStd.prototype.initialize.call(this, args);
        },
        _createWidthCP: function(oCoordList)
        {
            var oCP;
            var oFeature = this.getFeature();
            var sBasicSymbolCode = this.options.sBasicSymbolCode;
            var oBasicSymbolCodes = leafLet.utils.milstd.basicSymbolCode;
            var dBearingPt1Pt2 = oCoordList[0].bearingTo(oCoordList[1]);
            var dBearingWLine = (dBearingPt1Pt2 + 270.0) % 360;
            var oIntPoint = oCoordList[0].intersectLines(dBearingPt1Pt2, oCoordList[2], dBearingWLine);

            if (!oIntPoint)
            {
                dBearingWLine = (dBearingWLine + 180.0) % 360;
                oIntPoint = oCoordList[0].intersectLines(dBearingPt1Pt2, oCoordList[2], dBearingWLine);
            }
            if (!oIntPoint)
            {
                dBearingPt1Pt2 = (dBearingPt1Pt2 + 180.0) % 360;
                oIntPoint = oCoordList[0].intersectLines(dBearingPt1Pt2, oCoordList[2], dBearingWLine);
            }
            if (!oIntPoint)
            {
                dBearingWLine = (dBearingWLine + 180.0) % 360;
                oIntPoint = oCoordList[0].intersectLines(dBearingPt1Pt2, oCoordList[2], dBearingWLine);
            }
            if (oIntPoint)
            {
                // oIntPoint should never be undefined.
                var dWidth = Math.round(oCoordList[2].distanceTo(oIntPoint));

                if (sBasicSymbolCode === oBasicSymbolCodes.ROADBLOCK_COMPLETE_EXECUTED)
                {
                    dWidth *= 2;
                }

                oCP = new leafLet.editor.ControlPoint(oFeature,
                    leafLet.ControlPoint.Type.WIDTH_CP,
                    oCoordList[2], 2, 0, dWidth);
            }
            
            return oCP;
        },
        assembleControlPoints: function()
        {
            var oCP;
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            var sBasicSymbolCode = this.options.sBasicSymbolCode;
            var oBasicSymbolCodes = leafLet.utils.milstd.basicSymbolCode;
            
            if (oCoordList.length === 0)
            {
                return;
            }

            for (var iIndex = 0; iIndex < oCoordList.length; iIndex++)
            {
                if ((iIndex === 2) &&
                    (
                        (sBasicSymbolCode === oBasicSymbolCodes.FORD_EASY) ||
                        (sBasicSymbolCode === oBasicSymbolCodes.FORD_DIFFICULT) ||
                        (sBasicSymbolCode === oBasicSymbolCodes.ROADBLOCK_COMPLETE_EXECUTED)
                    ))
                {
                    oCP = this._createWidthCP(oCoordList);
                }
                else
                {
                    oCP = new leafLet.editor.ControlPoint(oFeature,
                        leafLet.ControlPoint.Type.POSITION_CP,
                        oCoordList[iIndex], iIndex, 0);
                }

                this.addControlPoint(oCP);
            }
        },
        doAddControlPoint: function(oLatLng)
        {
            var oCP;
            var oCoordList = this.getCoordinateList();
            var oSymbolDef = this.getSymbolDef();
            var oFeature = this.getFeature();
            var sBasicSymbolCode = this.options.sBasicSymbolCode;
            var oBasicSymbolCodes = leafLet.utils.milstd.basicSymbolCode;

            if (oCoordList.length >= oSymbolDef.maxPoints)
            {
                return undefined;
            }
            
            oCoordList.push(oLatLng);
            this.setCoordinates(oCoordList);
            
            if ((oCoordList.length === 3) &&
                (
                    (sBasicSymbolCode === oBasicSymbolCodes.FORD_EASY) ||
                    (sBasicSymbolCode === oBasicSymbolCodes.FORD_DIFFICULT) ||
                    (sBasicSymbolCode === oBasicSymbolCodes.ROADBLOCK_COMPLETE_EXECUTED)
                ))
            {
                oCP = this._createWidthCP(oCoordList);
            }
            else
            {
                oCP = new leafLet.editor.ControlPoint(oFeature,
                    leafLet.ControlPoint.Type.POSITION_CP,
                    oLatLng, oCoordList.length - 1, 0);
            }
            
            this.updateLeafletObject();

            return oCP;
        },
        doDeleteControlPoint: function(oCP)
        {
            var oCoordList = this.getCoordinateList();
            var oSymbolDef = this.getSymbolDef();
            var iIndex = oCP.getIndex();
            
            if (oCP.getType() !== leafLet.ControlPoint.Type.POSITION_CP)
            {
                return false;
            }

            if (oCoordList.length <= oSymbolDef.minPoints)
            {
                return false;
            }

            oCoordList.splice(iIndex, 1);
            this.setCoordinates(oCoordList);
            this.updateLeafletObject(oCoordList);
            
            return true;
        },
        _moveFordCP: function(oCP, oEvent)
        {
            var oMidPoint;
            var dDist;
            var dBearingMidPt3;
            var dNewBearingMidPt3;
            var dBearingPt1Pt2;
            var dNewBearingPt1Pt2;
            var oCP3;
            var Pt3Coord;
            var oRet = undefined;
            var iIndex = oCP.getIndex();
            var oCoordList = this.getCoordinateList();
            var sBasicSymbolCode = this.options.sBasicSymbolCode;
            var oBasicSymbolCodes = leafLet.utils.milstd.basicSymbolCode;
            
            switch (iIndex)
            {
                case 0:
                case 1:
                    oRet = [iIndex];

                    if (oCoordList.length > 2)
                    {
                        // Get the bearing between pt1 pt2, and the mid point.
                        dBearingPt1Pt2 = oCoordList[0].bearingTo(oCoordList[1]);
                        oMidPoint = this.getCenterPT(oCoordList[0], oCoordList[1]);
                        // Get the distance from the mid point to pt3 (the arrow).
                        dDist = oMidPoint.distanceTo(oCoordList[2]);
                        if ((dDist < 20.0) || isNaN(dDist) || (dDist === Infinity)) {
                            return [];
                        }
                        // Get the bearing from the mid point and pt3.
                        dBearingMidPt3 = oMidPoint.bearingTo(oCoordList[2]);
                        // Update the coordinates of th CP that was moved.
                        oCoordList[iIndex].lat = oEvent.latlng.lat;
                        oCoordList[iIndex].lng = oEvent.latlng.lng;
                        oCP.setCPPosition(oCoordList[iIndex]);
                        // Now get the new bearing of pt1 pt2. And the new mid point.
                        dNewBearingPt1Pt2 = oCoordList[0].bearingTo(oCoordList[1]);
                        oMidPoint = this.getCenterPT(oCoordList[0], oCoordList[1]);
                        // Compute the new bearing of pt3. And get the coordinates.
                        dNewBearingMidPt3 = dBearingMidPt3 + (dNewBearingPt1Pt2 - dBearingPt1Pt2);
                        Pt3Coord = oMidPoint.destinationPoint(dNewBearingMidPt3, dDist);
                        // Update the CP, the coordinates and the object.
                        oCoordList[2].lat = Pt3Coord.lat;
                        oCoordList[2].lng = Pt3Coord.lng;
                        oCP3 = this.getCP(2);
                        oCP3.setCPPosition(oCoordList[2]);
                        oRet.push(2);
                    }
                    else
                    {
                        // Update the coordinates of th CP that was moved.
                        oCoordList[iIndex].lat = oEvent.latlng.lat;
                        oCoordList[iIndex].lng = oEvent.latlng.lng;
                        oCP.setCPPosition(oCoordList[iIndex]);
                    }
                    this.setCoordinates(oCoordList);
                    this.updateLeafletObject(oCoordList);
                    break;
                case 2:
                    // Get the mid point.
                    oMidPoint = this.getCenterPT(oCoordList[0], oCoordList[1]);
                    // Get the bearing from the mid point and pt3.
                    dBearingMidPt3 = oMidPoint.bearingTo(oCoordList[2]);
                    var dBearingMidMouse = oMidPoint.bearingTo(oEvent.latlng);
                    // Get the distance from the mid point to the mouse.
                    dDist = oMidPoint.distanceTo(oEvent.latlng);
                    // Project the MP-Mouse line onto the Mid Pt Pt3 line;
                    dDist = Math.round(dDist * (Math.cos((dBearingMidMouse - dBearingMidPt3).toRad())));
                    // Calculate the new position of Pt3.
                    Pt3Coord = oMidPoint.destinationPoint(dBearingMidPt3, dDist);

                    oCoordList[iIndex].lat = Pt3Coord.lat;
                    oCoordList[iIndex].lng = Pt3Coord.lng;

                    if (sBasicSymbolCode === oBasicSymbolCodes.ROADBLOCK_COMPLETE_EXECUTED)
                    {
                        dDist *= 2;
                    }
                    
                    oCP.setValue(dDist);

                    oCP.setCPPosition(oCoordList[iIndex]);
                    this.setCoordinates(oCoordList);
                    this.updateLeafletObject(oCoordList);
                    oRet = [iIndex];
                    break;
            }

            return oRet;
        },
        _moveBlockCP: function(oCP, oEvent)
        {
            var oMidPoint;
            var dDist;
            var dBearingMidPt3;
            var dNewBearingMidPt3;
            var dBearingPt1Pt2;
            var dNewBearingPt1Pt2;
            var oCP3;
            var Pt3Coord;
            var oRet = undefined;
            var iIndex = oCP.getIndex();
            var oCoordList = this.getCoordinateList();
            
            switch (iIndex)
            {
                case 0:
                case 1:
                    oRet = [iIndex];

                    if (oCoordList.length > 2)
                    {
                        // Get the bearing between pt1 pt2, and the mid point.
                        dBearingPt1Pt2 = oCoordList[0].bearingTo(oCoordList[1]);
                        oMidPoint = this.getCenterPT(oCoordList[0], oCoordList[1]);
                        // Get the distance from the mid point to pt3 (the arrow).
                        dDist = oMidPoint.distanceTo(oCoordList[2]);
                        
                        if ((dDist < 20.0) || isNaN(dDist) || (dDist === Infinity)) {
                            return [];
                        }
                        // Get the bearing from the mid point and pt3.
                        dBearingMidPt3 = oMidPoint.bearingTo(oCoordList[2]);
                        // Update the coordinates of th CP that was moved.
                        oCoordList[iIndex].lat = oEvent.latlng.lat;
                        oCoordList[iIndex].lng = oEvent.latlng.lng;
                        oCP.setCPPosition(oCoordList[iIndex]);
                        // Now get the new bearing of pt1 pt2. And the new mid point.
                        dNewBearingPt1Pt2 = oCoordList[0].bearingTo(oCoordList[1]);
                        oMidPoint = this.getCenterPT(oCoordList[0], oCoordList[1]);
                        // Compute the new bearing of pt3. And get the coordinates.
                        dNewBearingMidPt3 = dBearingMidPt3 + (dNewBearingPt1Pt2 - dBearingPt1Pt2);
                        Pt3Coord = oMidPoint.destinationPoint(dNewBearingMidPt3, dDist);
                        // Update the CP, the coordinates and the object.
                        oCoordList[2].lat = Pt3Coord.lat;
                        oCoordList[2].lng = Pt3Coord.lng;
                        oCP3 = this.getCP(2);
                        oCP3.setCPPosition(oCoordList[2]);
                        oRet.push(2);
                    }
                    else
                    {
                        oCoordList[iIndex].lat = oEvent.latlng.lat;
                        oCoordList[iIndex].lng = oEvent.latlng.lng;
                        oCP.setCPPosition(oCoordList[iIndex]);
                    }
                    
                    this.setCoordinates(oCoordList);
                    this.updateLeafletObject(oCoordList);
                    break;
                case 2:
                    // Get the bearing between Pt1 and Pt2.
                    dBearingPt1Pt2 = oCoordList[0].bearingTo(oCoordList[1]);
                    dBearingPt1Pt2 = ((dBearingPt1Pt2 > 180)? dBearingPt1Pt2 - 360: dBearingPt1Pt2);
                    // Get the mid point.
                    oMidPoint = this.getCenterPT(oCoordList[0], oCoordList[1]);
                    // Get the bearing from the mid point and pt3.
                    dBearingMidPt3 = oMidPoint.bearingTo(oCoordList[2]);
                    dBearingMidPt3 = ((dBearingMidPt3 > 180)? dBearingMidPt3 - 360: dBearingMidPt3);
                    
                    // Set the bearing to  +90 or -90.
                    if ((dBearingMidPt3 - dBearingPt1Pt2) >= 0.0)
                    {
                        dBearingMidPt3 = dBearingPt1Pt2 + 90.0;
                    }
                    else
                    {
                        dBearingMidPt3 = dBearingPt1Pt2 + 270;
                    }
                    dBearingMidPt3 = (dBearingMidPt3 + 360) % 360;
                    
                    var dBearingMidMouse = oMidPoint.bearingTo(oEvent.latlng);
                    // Get the distance from the mid point to the mouse.
                    dDist = oMidPoint.distanceTo(oEvent.latlng);
                    // Project the MP-Mouse line onto the Mid Pt Pt3 line;
                    dDist = dDist * (Math.cos((dBearingMidMouse - dBearingMidPt3).toRad()));
                    // Calculate the new position of Pt3.
                    Pt3Coord = oMidPoint.destinationPoint(dBearingMidPt3, dDist);

                    oCoordList[iIndex].lat = Pt3Coord.lat;
                    oCoordList[iIndex].lng = Pt3Coord.lng;
                    
                    oCP.setCPPosition(oCoordList[iIndex]);
                    this.setCoordinates(oCoordList);
                    this.updateLeafletObject(oCoordList);
                    oRet = [iIndex];
                    break;
            }

            return oRet;
        },
        _moveAmbushCP: function(oCP, oEvent)
        {
            var oMidPoint;
            var dDist;
            var dBearingMidPt1;
            var dNewBearingMidPt1;
            var dBearingPt2Pt3;
            var dNewBearingPt2Pt3;
            var oCP1;
            var Pt1Coord;
            var oRet = undefined;
            var iIndex = oCP.getIndex();
            var oCoordList = this.getCoordinateList();
            
            switch (iIndex)
            {
                case 0:
                    // Get the mid point.
                    oMidPoint = this.getCenterPT(oCoordList[1], oCoordList[2]);
                    // Get the bearing from the mid point and pt1.
                    dBearingMidPt1 = oMidPoint.bearingTo(oCoordList[0]);
                    var dBearingMidMouse = oMidPoint.bearingTo(oEvent.latlng);
                    // Get the distance from the mid point to the mouse.
                    dDist = oMidPoint.distanceTo(oEvent.latlng);
                    // Project the MP-Mouse line onto the Mid Pt Pt1 line;
                    dDist = dDist * (Math.cos((dBearingMidMouse - dBearingMidPt1).toRad()));
                    // Calculate the new position of Pt1.
                    Pt1Coord = oMidPoint.destinationPoint(dBearingMidPt1, dDist);

                    oCoordList[iIndex].lat = Pt1Coord.lat;
                    oCoordList[iIndex].lng = Pt1Coord.lng;
                    oCP.setCPPosition(oCoordList[iIndex]);
                    this.setCoordinates(oCoordList);
                    this.updateLeafletObject(oCoordList);
                    oRet = [iIndex];
                    break;
                case 1:
                case 2:
                    // Get the bearing between pt1 pt2, and the mid point.
                    dBearingPt2Pt3 = oCoordList[1].bearingTo(oCoordList[2]);
                    oMidPoint = this.getCenterPT(oCoordList[1], oCoordList[2]);
                    // Get the distance from the mid point to pt1 (the arrow).
                    dDist = oMidPoint.distanceTo(oCoordList[0]);
                        
                    if ((dDist < 20.0) || isNaN(dDist) || (dDist === Infinity)) {
                        return [];
                    }
                    // Get the bearing from the mid point and pt13.
                    dBearingMidPt1 = oMidPoint.bearingTo(oCoordList[0]);
                    // Update the coordinates of th CP that was moved.
                    oCoordList[iIndex].lat = oEvent.latlng.lat;
                    oCoordList[iIndex].lng = oEvent.latlng.lng;
                    oCP.setCPPosition(oCoordList[iIndex]);
                    // Now get the new bearing of pt2 pt3. And the new mid point.
                    dNewBearingPt2Pt3 = oCoordList[1].bearingTo(oCoordList[2]);
                    oMidPoint = this.getCenterPT(oCoordList[1], oCoordList[2]);
                    // Compute the new bearing of pt1. And get the coordinates.
                    dNewBearingMidPt1 = dBearingMidPt1 + (dNewBearingPt2Pt3 - dBearingPt2Pt3);
                    Pt1Coord = oMidPoint.destinationPoint(dNewBearingMidPt1, dDist);
                    // Update the CP, the coordinates and the object.
                    oCoordList[0].lat = Pt1Coord.lat;
                    oCoordList[0].lng = Pt1Coord.lng;
                    oCP1 = this.getCP(0);
                    oCP1.setCPPosition(oCoordList[0]);
                    this.setCoordinates(oCoordList);
                    this.updateLeafletObject(oCoordList);
                    oRet = [0, iIndex];
                    break;
            }

            return oRet;
        },
        _moveSeizeCP: function(oCP, oEvent)
        {
            var oCPPt2;
            var dBearing;
            var dDist;
            var oRet = undefined;
            var iIndex = oCP.getIndex();
            var oCoordList = this.getCoordinateList();
            //var oSymbolDef = this.getSymbolDef();
            var oFeature = this.getFeature();
            var i2525Version = oFeature.get2525Version();
            var oRendererSettings = armyc2.c2sd.renderer.utilities.RendererSettings;
            
            if (i2525Version === oRendererSettings.Symbology_2525Bch2_USAS_13_14)
            {
                oRet = this._moveCP(oCP, oEvent);
            }
            else if ((i2525Version === oRendererSettings.Symbology_2525C ) &&
                    (oCoordList.length === 3))
            {
                oRet = this._moveCP(oCP, oEvent);
            }
            else if (oCoordList.length === 4)
            {
                switch (iIndex)
                {
                    case 0:
                        oRet = [iIndex];
                        // If Pt1 is moved we need to move Pt2 relative to Pt1.
                        oCPPt2 = this.getCP(1);
                        dBearing = oCoordList[0].bearingTo(oEvent.latlng);
                        dDist = oCoordList[0].distanceTo(oEvent.latlng);
                        if ((dDist < 20.0) || isNaN(dDist) || (dDist === Infinity)) {
                            return [];
                        }
                        // Now move Pt1
                        oCoordList[iIndex].lat = oEvent.latlng.lat;
                        oCoordList[iIndex].lng = oEvent.latlng.lng;
                        // And now move Pt2 relative to Pt1
                        oCoordList[1].moveCoordinate(dBearing, dDist);
                        oCPPt2.setCPPosition(oCoordList[1]);
                        oRet.push(1);
                        
                        var oCPPt3 = this.getCP(2);
                        oCoordList[2].moveCoordinate(dBearing, dDist);
                        oCPPt3.setCPPosition(oCoordList[2]);
                        oRet.push(2);

                        this.setCoordinates(oCoordList);
                        oCP.setCPPosition(oCoordList[iIndex]);
                        this.updateLeafletObject(oCoordList);
                        break;
                    case 1:
                    case 2:
                    case 3:
                        oRet = this._moveCP(oCP, oEvent);
                        break;
                }
            }
            else
            {
                oRet = this._moveCP(oCP, oEvent);
            }
            
            return oRet;
        },
        _moveCP: function(oCP, oEvent)
        {
            var iIndex = oCP.getIndex();
            var oCoordList = this.getCoordinateList();
            
            // We need to update the position of the control point
            oCoordList[iIndex].lat = oEvent.latlng.lat;
            oCoordList[iIndex].lng = oEvent.latlng.lng;
            this.setCoordinates(oCoordList);
            oCP.setCPPosition(oCoordList[iIndex]);
            this.updateLeafletObject(oCoordList);

            return [iIndex];
        },
        doControlPointMoved: function(oCP, oEvent)
        {
            var oRet = undefined;
            //var oCoordList = this.getCoordinateList();
            //var oSymbolDef = this.getSymbolDef();
            var sBasicSymbolCode = this.options.sBasicSymbolCode;
            var oBasicSymbolCodes = leafLet.utils.milstd.basicSymbolCode;

            switch (sBasicSymbolCode)
            {
                case oBasicSymbolCodes.AMBUSH:
                    oRet = this._moveAmbushCP(oCP, oEvent);
                    break;
                case oBasicSymbolCodes.FORD_EASY:
                case oBasicSymbolCodes.FORD_DIFFICULT:
                case oBasicSymbolCodes.ROADBLOCK_COMPLETE_EXECUTED:
                    oRet = this._moveFordCP(oCP, oEvent);
                    break;
                case oBasicSymbolCodes.BLOCK_TASK:
                    oRet = this._moveBlockCP(oCP, oEvent);
                    break;
                case oBasicSymbolCodes.SEIZE:
                    oRet = this._moveSeizeCP(oCP, oEvent);
                    break;
                default:
                    oRet = this._moveCP(oCP, oEvent);
                    break;
            }
            return oRet;
        },
        doFeatureMove: function(dBearing, dDistance) {
            var oCoordList = this.getCoordinateList();
            var oCPList = this.options.oControlPointList;
            var oCoord;
            var iCoordIndex;
                    
            for (var iIndex = 0; iIndex < oCPList.length; iIndex++) {
                iCoordIndex = oCPList[iIndex].getIndex();
                oCoord = oCPList[iIndex].getPosition();
                oCoord.moveCoordinate(dBearing, dDistance);
                oCPList[iIndex].setCPPosition(oCoord);
                oCoordList[iCoordIndex] = oCoord;
            }
            this.setCoordinates(oCoordList);
            this.updateLeafletObject();

            return true;
        }
   };

    return publicInterface;
};

leafLet.editor.MilStdDCSuperAutoShape = leafLet.editor.MilStd.extend(leafLet.internalPrivateClass.MilStdDCSuperAutoShapeEditor());
