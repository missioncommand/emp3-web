
/* global L, leafLet */

leafLet.internalPrivateClass.MilStdDCAutoShapeEditor = function()
{
    var publicInterface = {
        initialize: function (args) {
            var oCoordList;
            var dDistC1, dDistC2, dDistC3;
            var Temp;
            var oBasicCodes = leafLet.utils.milstd.basicSymbolCode;

            leafLet.editor.MilStd.prototype.initialize.call(this, args);
            
            switch (this.getBasicSymbolCode()) {
                case oBasicCodes.MINIMUM_SAFE_DISTANCE_ZONES:
                    // The distance between the center (pt0) and
                    // Pt1 must be less than the distance to pt2 and this
                    // less than the distance to pt3.
                    oCoordList = this.getCoordinateList();
                    dDistC1 = oCoordList[0].distanceTo(oCoordList[1]);
                    dDistC2 = oCoordList[0].distanceTo(oCoordList[2]);
                    dDistC3 = oCoordList[0].distanceTo(oCoordList[3]);
                    if (dDistC1 > dDistC2) {
                        Temp = oCoordList[1];
                        oCoordList[1] = oCoordList[2];
                        oCoordList[2] = Temp;
                        Temp = dDistC2;
                        dDistC2 = dDistC1;
                        dDistC1 = Temp;
                    }
                    if (dDistC2 > dDistC3) {
                        Temp = oCoordList[2];
                        oCoordList[2] = oCoordList[3];
                        oCoordList[3] = Temp;
                        Temp = dDistC3;
                        dDistC3 = dDistC2;
                        dDistC2 = Temp;
                    }
                    if (dDistC1 > dDistC2) {
                        Temp = oCoordList[1];
                        oCoordList[1] = oCoordList[2];
                        oCoordList[2] = Temp;
                        Temp = dDistC2;
                        dDistC2 = dDistC1;
                        dDistC1 = Temp;
                    }

                    break;
            }
        },
        assembleControlPoints: function() {
            var oCP;
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            
            if (oCoordList.length === 0)
            {
                return;
            }

            for (var iIndex = 0; iIndex < oCoordList.length; iIndex++)
            {
                oCP = new leafLet.editor.ControlPoint(oFeature,
                    leafLet.ControlPoint.Type.POSITION_CP,
                    oCoordList[iIndex], iIndex, 0);

                this.addControlPoint(oCP);
            }
        },
        doAddControlPoint: function(oLatLng)
        {
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            var oSymbolDef = this.getSymbolDef();

            if (oCoordList.length >= oSymbolDef.maxPoints)
            {
                return undefined;
            }
            
            oCoordList.push(oLatLng);
            this.setCoordinates(oCoordList);

            var oCP = new leafLet.editor.ControlPoint(oFeature,
                leafLet.ControlPoint.Type.POSITION_CP,
                oLatLng, oCoordList.length - 1, 0);
                
            this.updateLeafletObject(oCoordList);

            return oCP;
        },
        doDeleteControlPoint: function(oCP)
        {
            return false;
        },
        doControlPointMoved: function(oCP, oEvent)
        {
            var oCPPt2, oCPt;
            var dBearing;
            var dDist;
            var iIndex2;
            var iIndex = oCP.getIndex();
            var oCoordList = this.getCoordinateList();
            var oRet = undefined;
            var oBasicCodes = leafLet.utils.milstd.basicSymbolCode;
            
            switch (oCP.getType())
            {
                case leafLet.ControlPoint.Type.POSITION_CP:
                    // We need to update the position of the control point
                    // and the new control points before and after it.
                    oRet = [];
                    
                    switch (this.getBasicSymbolCode()) {
                        case oBasicCodes.MINIMUM_SAFE_DISTANCE_ZONES:
                            if (iIndex === 0) {
                                // Its the center point.
                                // We must move all points.
                                dBearing = oCoordList[0].bearingTo(oEvent.latlng);
                                dDist = oCoordList[0].distanceTo(oEvent.latlng);
                                for (iIndex2 = 0; iIndex2 < oCoordList.length; iIndex2++) {
                                    oRet.push(iIndex2);
                                    oCoordList[iIndex2].moveCoordinate(dBearing, dDist);
                                    oCPt = this.getCP(iIndex2);
                                    oCPt.setCPPosition(oCoordList[iIndex2]);
                                }
                            } else if (iIndex === 1) {
                                // Its pt1. We need to make sure that it does not go beyond pt2.
                                dDist = oCoordList[0].distanceTo(oEvent.latlng);
                                if (dDist < oCoordList[0].distanceTo(oCoordList[2])) {
                                    oRet.push(iIndex);
                                    oCoordList[iIndex] = oEvent.latlng;
                                    oCP.setCPPosition(oCoordList[iIndex]);
                                }
                            } else if (iIndex === 2) {
                                // Its pt2. We need to make sure that it does not go beyond pt3 or
                                // less the pt1.
                                dDist = oCoordList[0].distanceTo(oEvent.latlng);
                                if ((dDist < oCoordList[0].distanceTo(oCoordList[3])) &&
                                        (dDist > oCoordList[0].distanceTo(oCoordList[1]))) {
                                    oRet.push(iIndex);
                                    dBearing = oCoordList[0].bearingTo(oEvent.latlng);
                                    oCoordList[iIndex] = oEvent.latlng;
                                    oCP.setCPPosition(oCoordList[iIndex]);
                                }
                            } else {
                                // Its pt3. We need to make sure that it does not go less than pt2.
                                dDist = oCoordList[0].distanceTo(oEvent.latlng);
                                if (dDist > oCoordList[0].distanceTo(oCoordList[2])) {
                                    oRet.push(iIndex);
                                    dBearing = oCoordList[0].bearingTo(oEvent.latlng);
                                    oCoordList[iIndex] = oEvent.latlng;
                                    oCP.setCPPosition(oCoordList[iIndex]);
                                }
                            }
                            break;
                        default:
                            oRet.push(iIndex);
                            if ((iIndex === 0) && (oCoordList.length === 2))
                            {
                                // If Pt1 is moved we need to move Pt2 relative to Pt1.
                                oCPPt2 = this.getCP(1);
                                dBearing = oCoordList[0].bearingTo(oEvent.latlng);
                                dDist = oCoordList[0].distanceTo(oEvent.latlng);
                                // Now move Pt1
                                oCoordList[iIndex].lat = oEvent.latlng.lat;
                                oCoordList[iIndex].lng = oEvent.latlng.lng;
                                // And now move Pt2 relative to Pt1
                                oCoordList[1].moveCoordinate(dBearing, dDist);
                                oCPPt2.setCPPosition(oCoordList[1]);
                                oRet.push(1);
                            }
                            else
                            {
                                oCoordList[iIndex].lat = oEvent.latlng.lat;
                                oCoordList[iIndex].lng = oEvent.latlng.lng;
                            }

                            oCP.setCPPosition(oCoordList[iIndex]);
                            break;
                    }
                    this.setCoordinates(oCoordList);
                    this.updateLeafletObject(oCoordList);

                    break;
            }
            return oRet;
        }
   };

    return publicInterface;
};

leafLet.editor.MilStdDCAutoShape = leafLet.editor.MilStd.extend(leafLet.internalPrivateClass.MilStdDCAutoShapeEditor());
