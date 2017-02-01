
/* global L, leafLet, emp */

leafLet.internalPrivateClass.MilStdDCSectorParamAutoShapeEditor = function()
{
    var publicInterface = {
        initialize: function (args) 
        {
            //var oOptions = {
            //};
            //L.Util.setOptions(this, oOptions);
            
            leafLet.editor.MilStd.prototype.initialize.call(this, args);
        },
        _addRangeCPs: function(oCoordList)
        {
            var oSymbolDef = this.getSymbolDef();
            var oFeature = this.getFeature();
            var oModifiers = oFeature.getMilStdModifiers();
            var oAMList = oModifiers.oModifiers[leafLet.utils.milstd.Modifiers.DISTANCE];
            var oANList = oModifiers.oModifiers[leafLet.utils.milstd.Modifiers.AZIMUTH];
            var oCP;
            var oCPPosition;
            var dRange;
            var iANIndex = 0;
            var bMinimumRange = false;
            var dLeftAzimuth;
            var dRightAzimuth;
            var dMidAzimuth;
            
            if (oCoordList.length >= oSymbolDef.minPoints)
            {
                if ((oAMList.length * 2) > oANList.length)
                {
                    // There is a minimum range.
                    bMinimumRange = true;
                }
                
                for (var iIndex = 0; (iIndex < oAMList.length) && (iANIndex < oANList.length); iIndex++)
                {
                    dRange = oAMList[iIndex];
                    dLeftAzimuth = oANList[iANIndex];
                    dRightAzimuth = oANList[iANIndex + 1];

                    // Place the Range CP.
                    dMidAzimuth = (dLeftAzimuth + dRightAzimuth) / 2.0;
                    
                    if (dLeftAzimuth > dRightAzimuth)
                    {
                        dMidAzimuth = (dMidAzimuth + 180) % 360;
                    }
                    
                    oCPPosition = oCoordList[0].destinationPoint(dMidAzimuth, dRange);
                    oCP = new leafLet.editor.ControlPoint(oFeature,
                        leafLet.ControlPoint.Type.RANGE_CP,
                        oCPPosition, iIndex, dMidAzimuth, dRange);
                    this.addControlPoint(oCP);

                    // See if there are azimuth CP in this range.
                    if (!bMinimumRange || (iIndex !== 0))
                    {
                        // There are no azimuth CP in minimum range.
                        iANIndex += 2;
                    }
                }
            }
        },
        _addAzimuthCPs: function(oCoordList)
        {
            var oSymbolDef = this.getSymbolDef();
            var oFeature = this.getFeature();
            var oModifiers = oFeature.getMilStdModifiers();
            var oAMList = oModifiers.oModifiers[leafLet.utils.milstd.Modifiers.DISTANCE];
            var oANList = oModifiers.oModifiers[leafLet.utils.milstd.Modifiers.AZIMUTH];
            var oCP;
            var oCPPosition;
            var dRange;
            var dPrevRange = 0;
            var dAzimuthCPDist;
            var iANIndex = 0;
            var bMinimumRange = false;
            var dLeftAzimuth;
            var dRightAzimuth;
            
            if (oCoordList.length >= oSymbolDef.minPoints)
            {
                if ((oAMList.length * 2) > oANList.length)
                {
                    // There is a minimum range.
                    bMinimumRange = true;
                }
                
                for (var iIndex = 0; (iIndex < oAMList.length) && (iANIndex < oANList.length); iIndex++)
                {
                    dRange = oAMList[iIndex];
                    dLeftAzimuth = oANList[iANIndex];
                    dRightAzimuth = oANList[iANIndex + 1];

                    // See if there are azimuth CP in this range.
                    if (bMinimumRange && (iIndex === 0))
                    {
                        // There are no azimuth CP in minimum range.
                        dPrevRange = dRange;
                        continue;
                    }

                    dAzimuthCPDist = ((dRange - dPrevRange) / 2.0) + dPrevRange;

                    // Place The left Azimuth point.
                    oCPPosition = oCoordList[0].destinationPoint(dLeftAzimuth, dAzimuthCPDist);
                    oCP = new leafLet.editor.ControlPoint(oFeature,
                        leafLet.ControlPoint.Type.AZIMUTH_CP,
                        oCPPosition, iANIndex, dAzimuthCPDist, dLeftAzimuth);
                    this.addControlPoint(oCP);


                    // Place The right Azimuth point.
                    oCPPosition = oCoordList[0].destinationPoint(dRightAzimuth, dAzimuthCPDist);
                    oCP = new leafLet.editor.ControlPoint(oFeature,
                        leafLet.ControlPoint.Type.AZIMUTH_CP,
                        oCPPosition, iANIndex + 1, dAzimuthCPDist, dRightAzimuth);
                    this.addControlPoint(oCP);
                    
                    iANIndex += 2;
                    dPrevRange = dRange;
                }
            }
        },
        assembleControlPoints: function()
        {
            var oFeature = this.getFeature();
            var oCoordList = this.getCoordinateList();
            
            if (oCoordList.length === 0)
            {
                return;
            }
            
            var oCP = new leafLet.editor.ControlPoint(oFeature,
                leafLet.ControlPoint.Type.POSITION_CP,
                oCoordList[0], 0, 0);
                
            this.addControlPoint(oCP);
            
            this._addRangeCPs(oCoordList);
            this._addAzimuthCPs(oCoordList);
        },
        doAddControlPoint: function(oLatLng)
        {
            var iAzimuthIndex;
            var oCP;
            var oCoordList = this.getCoordinateList();
            var oSymbolDef = this.getSymbolDef();
            var oFeature = this.getFeature();
            var oModifiers = oFeature.getMilStdModifiers();
            //var sBasicSymbolCode = this.options.sBasicSymbolCode;
            //var oBasicSymbolCodes = leafLet.utils.milstd.basicSymbolCode;

            if (oCoordList.length >= oSymbolDef.maxPoints)
            {
                // With these we add new ranges.
                var oAMList = oModifiers.oModifiers[leafLet.utils.milstd.Modifiers.DISTANCE];
                var oANList = oModifiers.oModifiers[leafLet.utils.milstd.Modifiers.AZIMUTH];
                var dDist = oCoordList[0].distanceTo(oLatLng);
                var iIndex;
                var iAMCnt = oModifiers.getAMValueCount();
                var dLeftAzimuth;
                var dRightAzimuth;
                var bMinimumRange = false;

                if ((oAMList.length * 2) > oANList.length)
                {
                    // There is a minimum range.
                    bMinimumRange = true;
                }

                for (iIndex = 0; iIndex < iAMCnt; iIndex++)
                {
                    if (dDist < oModifiers.getAMValue(iIndex))
                    {
                        break;
                    }
                }

                iAzimuthIndex = 0;

                oAMList.splice(iIndex, 0, dDist);
                dLeftAzimuth = oModifiers.getANValue(iAzimuthIndex);
                dRightAzimuth = oModifiers.getANValue(iAzimuthIndex + 1);
                
                if ((iAzimuthIndex + 2) < oModifiers.getANValueCount())
                {
                    iAzimuthIndex += 2;
                }
                
                oANList.splice(iAzimuthIndex, 0, dLeftAzimuth);
                oANList.splice(iAzimuthIndex + 1, 0, dRightAzimuth);
                
                this.removeAllCPByType(leafLet.ControlPoint.Type.RANGE_CP);
                this.removeAllCPByType(leafLet.ControlPoint.Type.AZIMUTH_CP);
                this.updateLeafletObject(oCoordList);
                this._addRangeCPs(oCoordList);
                this._addAzimuthCPs(oCoordList);
                this._issueCPUpdateEvent([], emp.typeLibrary.UpdateEventType.UPDATE);
                return undefined;
            }
            
            oCoordList.push(oLatLng);
            this.setCoordinates(oCoordList);
            
            oCP = new leafLet.editor.ControlPoint(oFeature,
                leafLet.ControlPoint.Type.POSITION_CP,
                oLatLng, oCoordList.length - 1, 0);
            
            if (this.updateLeafletObject(oCoordList))
            {
                this._addRangeCPs(oCoordList);
                this._addAzimuthCPs(oCoordList);
            }

            return oCP;
        },
        doDeleteControlPoint: function(oCP)
        {
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            var oModifiers = oFeature.getMilStdModifiers();
            var oAMList = oModifiers.oModifiers[leafLet.utils.milstd.Modifiers.DISTANCE];
            var oANList = oModifiers.oModifiers[leafLet.utils.milstd.Modifiers.AZIMUTH];
            var iIndex = oCP.getIndex();
            var bMinimumRange = false;
            var iAzimuthIndex;
            
            if ((oAMList.length * 2) > oANList.length)
            {
                // There is a minimum range.
                bMinimumRange = true;
            }
                
            // We only delete range CPs and azimuth that create a minimum range.
            switch (oCP.getType())
            {
                case leafLet.ControlPoint.Type.RANGE_CP:
                    if (oAMList.length > 1)
                    {
                        oAMList.splice(iIndex, 1);
                        
                        if (!bMinimumRange)
                        {
                            // Remove the azimuth for the range.
                            iAzimuthIndex = iIndex * 2;
                            oANList.splice(iAzimuthIndex, 1);
                            oANList.splice(iAzimuthIndex, 1);
                        }
                        else if ((iIndex !== 0) && (oANList.length > 2))
                        {
                            iAzimuthIndex = (iIndex - 1) * 2;
                            oANList.splice(iAzimuthIndex, 1);
                            oANList.splice(iAzimuthIndex, 1);
                        }
                        
                        this.removeAllCPByType(leafLet.ControlPoint.Type.RANGE_CP);
                        this.removeAllCPByType(leafLet.ControlPoint.Type.AZIMUTH_CP);
                        this.updateLeafletObject(oCoordList);
                        this._addRangeCPs(oCoordList);
                        this._addAzimuthCPs(oCoordList);
                        this._issueCPUpdateEvent([], emp.typeLibrary.UpdateEventType.UPDATE);
                    }
                    break;
                case leafLet.ControlPoint.Type.AZIMUTH_CP:
                    if ((oANList.length > 2) && !bMinimumRange)
                    {
                        // We can only delete the first two azimuth if there are more azimuth
                        // and the feature does not have a minimum range.
                        if (iIndex < 2)
                        {
                            oANList.splice(0, 1);
                            oANList.splice(0, 1);
                            this.removeAllCPByType(leafLet.ControlPoint.Type.RANGE_CP);
                            this.removeAllCPByType(leafLet.ControlPoint.Type.AZIMUTH_CP);
                            this.updateLeafletObject(oCoordList);
                            this._addRangeCPs(oCoordList);
                            this._addAzimuthCPs(oCoordList);
                            this._issueCPUpdateEvent([], emp.typeLibrary.UpdateEventType.UPDATE);
                        }
                    }
                    break;
            }
            return false;
        },
        doControlPointMoved: function(oCP, oEvent)
        {
            var dMouseAngle;
            var dAngle;
            var dNextRange = Number.MAX_VALUE;
            var dDist;
            var oCPPos;
            var dPrevRange = 0;
            var oRet = undefined;
            var oCoordList = this.getCoordinateList();
            var oSymbolDef = this.getSymbolDef();
            var oFeature = this.getFeature();
            var oModifiers = oFeature.getMilStdModifiers();
            var iCPIndex = oCP.getIndex();
            //var sBasicSymbolCode = this.options.sBasicSymbolCode;
            //var oBasicSymbolCodes = leafLet.utils.milstd.basicSymbolCode;

            if (oCoordList.length < oSymbolDef.minPoints)
            {
                return undefined;
            }

            switch (oCP.getType())
            {
                case leafLet.ControlPoint.Type.POSITION_CP:
                    // We need to update the position of the control point
                    oCoordList[0].lat = oEvent.latlng.lat;
                    oCoordList[0].lng = oEvent.latlng.lng;
                    this.setCoordinates(oCoordList);
                    oCP.setCPPosition(oCoordList[0]);
                    this.updateLeafletObject(oCoordList);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RANGE_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.AZIMUTH_CP);
                    this._addRangeCPs(oCoordList);
                    this._addAzimuthCPs(oCoordList);
                    oRet = [0];
                    break;
                case leafLet.ControlPoint.Type.RANGE_CP:
                    dAngle = oCP.getSubIndex();
                    dMouseAngle = oCoordList[0].bearingTo(oEvent.latlng);
                    dDist = oCoordList[0].distanceTo(oEvent.latlng);
                    dDist = Math.abs(Math.round(dDist * Math.cos((dMouseAngle - dAngle).toRad())));
                    
                    // Get the previous range
                    if (iCPIndex > 0)
                    {
                        dPrevRange = oModifiers.getAMValue(iCPIndex - 1);
                    }
                    
                    // Get the next range
                    if ((iCPIndex + 1) < oModifiers.getAMValueCount())
                    {
                        dNextRange = oModifiers.getAMValue(iCPIndex + 1);
                    }
                    
                    if ((dPrevRange < dDist) && (dDist < dNextRange))
                    {
                        oModifiers.setAMValue(iCPIndex, dDist);
                        oCPPos = oCoordList[0].destinationPoint(dAngle, dDist);
                        oCP.setCPPosition(oCPPos);
                        oCP.setValue(dDist);
                        
                        this.setCoordinates(oCoordList);
                        this.updateLeafletObject(oCoordList);
                        this.removeAllCPByType(leafLet.ControlPoint.Type.AZIMUTH_CP);
                        this._addAzimuthCPs(oCoordList);
                        oRet = [0];
                    }
                    break;
                case leafLet.ControlPoint.Type.AZIMUTH_CP:
                    dDist = oCP.getSubIndex();
                    dMouseAngle = oCoordList[0].bearingTo(oEvent.latlng);
                    oCPPos = oCoordList[0].destinationPoint(dMouseAngle, dDist);
                    oCP.setCPPosition(oCPPos);
                    oCP.setValue(dMouseAngle);
                    oModifiers.setANValue(iCPIndex, dMouseAngle);

                    this.setCoordinates(oCoordList);
                    this.updateLeafletObject(oCoordList);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RANGE_CP);
                    this._addRangeCPs(oCoordList);
                    oRet = [0];
                    break;
            }
            return oRet;
        }
   };

    return publicInterface;
};

leafLet.editor.MilStdDCSectorParamAutoShape = leafLet.editor.MilStd.extend(leafLet.internalPrivateClass.MilStdDCSectorParamAutoShapeEditor());
