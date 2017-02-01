
/* global L, leafLet, emp */

leafLet.internalPrivateClass.MilStdDCCircularAutoShapeEditor = function()
{
    var publicInterface = {
        initialize: function (args) 
        {
            //var oOptions = {
            //};
            //L.Util.setOptions(this, oOptions);
            
            leafLet.editor.MilStd.prototype.initialize.call(this, args);
        },
        _addRadiusCP: function(oCoordList)
        {
            var oSymbolDef = this.getSymbolDef();
            var oFeature = this.getFeature();
            var oModifiers = oFeature.getMilStdModifiers();
            var oCP;
            var oCPPosition;
            var dRange;
            
            if (oCoordList.length >= oSymbolDef.minPoints)
            {
                if (oModifiers.getAMValueCount() > 0)
                {
                    dRange = oModifiers.getAMValue(0);

                    // Place the Range CP.
                    oCPPosition = oCoordList[0].destinationPoint(90, dRange);
                    oCP = new leafLet.editor.ControlPoint(oFeature,
                        leafLet.ControlPoint.Type.RADIUS_CP,
                        oCPPosition, 0, 90, dRange);
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
            
            this._addRadiusCP(oCoordList);
        },
        doAddControlPoint: function(oLatLng)
        {
            var oCP;
            var oCoordList = this.getCoordinateList();
            var oSymbolDef = this.getSymbolDef();
            var oFeature = this.getFeature();
            //var oModifiers = oFeature.getMilStdModifiers();
            //var sBasicSymbolCode = this.options.sBasicSymbolCode;
            //var oBasicSymbolCodes = leafLet.utils.milstd.basicSymbolCode;

            if (oCoordList.length >= oSymbolDef.maxPoints)
            {
                return undefined;
            }
            
            oCoordList.push(oLatLng);
            this.setCoordinates(oCoordList);
            
            oCP = new leafLet.editor.ControlPoint(oFeature,
                leafLet.ControlPoint.Type.POSITION_CP,
                oLatLng, oCoordList.length - 1, 0);
            
            if (this.updateLeafletObject(oCoordList))
            {
                this._addRadiusCP(oCoordList);
            }

            return oCP;
        },
        doDeleteControlPoint: function(oCP)
        {
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
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RADIUS_CP);
                    this._addRadiusCP(oCoordList);
                    oRet = [0];
                    break;
                case leafLet.ControlPoint.Type.RADIUS_CP:
                    dAngle = oCP.getSubIndex();
                    dMouseAngle = oCoordList[0].bearingTo(oEvent.latlng);
                    dDist = oCoordList[0].distanceTo(oEvent.latlng);
                    dDist = Math.abs(Math.round(dDist * Math.cos((dMouseAngle - dAngle).toRad())));
                    
                    oModifiers.setAMValue(iCPIndex, dDist);
                    oCPPos = oCoordList[0].destinationPoint(dAngle, dDist);
                    oCP.setCPPosition(oCPPos);
                    oCP.setValue(dDist);

                    this.setCoordinates(oCoordList);
                    this.updateLeafletObject(oCoordList);
                    this._issueCPUpdateEvent([], emp.typeLibrary.UpdateEventType.UPDATE);
                    break;
            }
            return oRet;
        }
   };

    return publicInterface;
};

leafLet.editor.MilStdDCCircularAutoShape = leafLet.editor.MilStd.extend(leafLet.internalPrivateClass.MilStdDCCircularAutoShapeEditor());
