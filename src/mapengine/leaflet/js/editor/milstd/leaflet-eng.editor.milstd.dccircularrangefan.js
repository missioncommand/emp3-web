
/* global L, leafLet, emp */

leafLet.internalPrivateClass.MilStdDCCircularRangeFanEditor = function()
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
            var oCP;
            var oCPPosition;
            var dRange;
            var iANIndex = 0;
            
            if (oCoordList.length >= oSymbolDef.minPoints)
            {
                for (var iIndex = 0; iIndex < oAMList.length; iIndex++)
                {
                    dRange = oAMList[iIndex];

                    // Place the Range CP.
                    oCPPosition = oCoordList[0].destinationPoint(0, dRange);
                    oCP = new leafLet.editor.ControlPoint(oFeature,
                        leafLet.ControlPoint.Type.RANGE_CP,
                        oCPPosition, iIndex, 0, dRange);
                    this.addControlPoint(oCP);
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
        },
        doAddControlPoint: function(oLatLng)
        {
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
                var dDist = oCoordList[0].distanceTo(oLatLng);
                var iIndex;
                var iAMCnt = oModifiers.getAMValueCount();

                if (iAMCnt === 3)
                {
                    return undefined;
                }
                
                for (iIndex = 0; iIndex < iAMCnt; iIndex++)
                {
                    if (dDist < oModifiers.getAMValue(iIndex))
                    {
                        break;
                    }
                }

                oAMList.splice(iIndex, 0, dDist);
                
                this.removeAllCPByType(leafLet.ControlPoint.Type.RANGE_CP);
                this.updateLeafletObject(oCoordList);
                this._addRangeCPs(oCoordList);
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
            }

            return oCP;
        },
        doDeleteControlPoint: function(oCP) {
/*
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            var oModifiers = oFeature.getMilStdModifiers();
            var oAMList = oModifiers.oModifiers[leafLet.utils.milstd.Modifiers.DISTANCE];
            var iIndex = oCP.getIndex();
            
            // We only delete range CPs and azimuth that create a minimum range.
            switch (oCP.getType())
            {
                case leafLet.ControlPoint.Type.RANGE_CP:
                    if (oAMList.length > 1)
                    {
                        oAMList.splice(iIndex, 1);
                        
                        this.removeAllCPByType(leafLet.ControlPoint.Type.RANGE_CP);
                        this.updateLeafletObject(oCoordList);
                        this._addRangeCPs(oCoordList);
                        this._issueCPUpdateEvent([], emp.typeLibrary.UpdateEventType.UPDATE);
                    }
                    break;
            }
            return false;
*/
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
                    this._addRangeCPs(oCoordList);
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
                        this._issueCPUpdateEvent([], emp.typeLibrary.UpdateEventType.UPDATE);
                    }
                    break;
            }
            return oRet;
        }
   };

    return publicInterface;
};

leafLet.editor.MilStdDCCircularRangeFan = leafLet.editor.MilStd.extend(leafLet.internalPrivateClass.MilStdDCCircularRangeFanEditor());
