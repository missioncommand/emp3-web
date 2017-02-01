
/* global L, leafLet */

leafLet.internalPrivateClass.MilStdDCRectParamAutoShapeEditor = function()
{
    var publicInterface = {
        initialize: function (args) 
        {
            //var oOptions = {
            //};
            //L.Util.setOptions(this, oOptions);
            
            leafLet.editor.MilStd.prototype.initialize.call(this, args);
        },
        _addWidthCP: function(oCoordList)
        {
            var oSymbolDef = this.getSymbolDef();
            
            if (oCoordList.length >= oSymbolDef.minPoints)
            {
                var oWidthPoint;
                var oFeature = this.getFeature();
                var oModifiers = oFeature.getMilStdModifiers();
                var dWidth = oModifiers.getAMValue(1);
                var dAngle = (oModifiers.getANValue(0) + 0) % 360;

                oWidthPoint = oCoordList[0].destinationPoint(dAngle, dWidth / 2.0);
                
                var oCP = new leafLet.editor.ControlPoint(oFeature,
                    leafLet.ControlPoint.Type.WIDTH_CP,
                    oWidthPoint, 0, 0, dWidth);

                this.addControlPoint(oCP);
            }
        },
        _addLengthCP: function(oCoordList)
        {
            var oSymbolDef = this.getSymbolDef();
            
            if (oCoordList.length >= oSymbolDef.minPoints)
            {
                var oLengthPoint;
                var oFeature = this.getFeature();
                var oModifiers = oFeature.getMilStdModifiers();
                var dLength = oModifiers.getAMValue(0);
                var dAngle = (oModifiers.getANValue(0) + 90) % 360;

                oLengthPoint = oCoordList[0].destinationPoint(dAngle, dLength / 2.0);
                
                var oCP = new leafLet.editor.ControlPoint(oFeature,
                    leafLet.ControlPoint.Type.LENGTH_CP,
                    oLengthPoint, 0, 0, dLength);

                this.addControlPoint(oCP);
            }
        },
        _addAttitudeCP: function(oCoordList)
        {
            var oSymbolDef = this.getSymbolDef();
            
            if (oCoordList.length >= oSymbolDef.minPoints)
            {
                var oAttitudePoint;
                var oFeature = this.getFeature();
                var oModifiers = oFeature.getMilStdModifiers();
                var dWidth = Math.round(oModifiers.getAMValue(0) / 2.0);
                var dAngle = oModifiers.getANValue(0);
                oAttitudePoint = oCoordList[0].destinationPoint((dAngle + 270) % 360, dWidth);
                
                var oCP = new leafLet.editor.ControlPoint(oFeature,
                    leafLet.ControlPoint.Type.ATTITUDE_CP,
                    oAttitudePoint, 0, 0, dAngle);

                this.addControlPoint(oCP);
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
            
            this._addWidthCP(oCoordList);
            this._addLengthCP(oCoordList);
            this._addAttitudeCP(oCoordList);
        },
        doAddControlPoint: function(oLatLng)
        {
            var oCP;
            var oCoordList = this.getCoordinateList();
            var oSymbolDef = this.getSymbolDef();
            var oFeature = this.getFeature();
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
                this._addWidthCP(oCoordList);
                this._addLengthCP(oCoordList);
                this._addAttitudeCP(oCoordList);
            }

            return oCP;
        },
        doDeleteControlPoint: function(oCP)
        {
            return false;
        },
        doControlPointMoved: function(oCP, oEvent)
        {
            var oWidthPoint;
            var dWidth;
            var dAngle;
            var dMouseAngle;
            var oAttitudePoint;
            var oLengthPoint;
            var dLength;
            var oRet = undefined;
            var oCoordList = this.getCoordinateList();
            var oSymbolDef = this.getSymbolDef();
            var oFeature = this.getFeature();
            var oModifiers = oFeature.getMilStdModifiers();
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
                    this.removeAllCPByType(leafLet.ControlPoint.Type.WIDTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.LENGTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.ATTITUDE_CP);
                    this._addWidthCP(oCoordList);
                    this._addLengthCP(oCoordList);
                    this._addAttitudeCP(oCoordList);
                    oRet = [0];
                    break;
                case leafLet.ControlPoint.Type.WIDTH_CP:
                    dAngle = (oModifiers.getANValue(0) + 0) % 360;
                    dMouseAngle = oCoordList[0].bearingTo(oEvent.latlng);
                    dWidth = oCoordList[0].distanceTo(oEvent.latlng) * 2;
                    dWidth = Math.abs(Math.round(dWidth * Math.cos((dMouseAngle - dAngle).toRad())));
                    oWidthPoint = oCoordList[0].destinationPoint(dAngle, dWidth / 2.0);
                    oModifiers.setAMValue(1, dWidth);
                    oCP.setValue(dWidth);
                    oCP.setCPPosition(oWidthPoint);
                    this.setCoordinates(oCoordList);
                    this.updateLeafletObject(oCoordList);
                    oRet = [0];
                    break;
                case leafLet.ControlPoint.Type.LENGTH_CP:
                    dAngle = (oModifiers.getANValue(0) + 90) % 360;
                    dMouseAngle = oCoordList[0].bearingTo(oEvent.latlng);
                    dLength = oCoordList[0].distanceTo(oEvent.latlng) * 2;
                    dLength = Math.abs(Math.round(dLength * Math.cos((dMouseAngle - dAngle).toRad())));
                    oLengthPoint = oCoordList[0].destinationPoint(dAngle, dLength / 2.0);
                    oModifiers.setAMValue(0, dLength);
                    oCP.setValue(dLength);
                    oCP.setCPPosition(oLengthPoint);
                    this.setCoordinates(oCoordList);
                    this.updateLeafletObject(oCoordList);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.ATTITUDE_CP);
                    this._addAttitudeCP(oCoordList);
                    oRet = [0];
                    break;
                case leafLet.ControlPoint.Type.ATTITUDE_CP:
                    dLength = oModifiers.getAMValue(0) / 2.0;
                    dAngle = oCoordList[0].bearingTo(oEvent.latlng);
                    oAttitudePoint = oCoordList[0].destinationPoint(dAngle, dLength);
                    dAngle = (dAngle + 90) % 360;
                    oModifiers.setANValue(0, dAngle);
                    oCP.setValue(dAngle);
                    oCP.setCPPosition(oAttitudePoint);
                    this.setCoordinates(oCoordList);
                    this.updateLeafletObject(oCoordList);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.WIDTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.LENGTH_CP);
                    this._addWidthCP(oCoordList);
                    this._addLengthCP(oCoordList);
                    oRet = [0];
                    break;
            }
            return oRet;
        }
   };

    return publicInterface;
};

leafLet.editor.MilStdDCRectParamAutoShape = leafLet.editor.MilStd.extend(leafLet.internalPrivateClass.MilStdDCRectParamAutoShapeEditor());
