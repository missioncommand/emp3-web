
/* global L, leafLet */

leafLet.internalPrivateClass.MilStdDC2PointRectAutoShapeEditor = function()
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
                var dDist = oCoordList[0].distanceTo(oCoordList[1]) / 2.0;
                var dAngle = oCoordList[0].bearingTo(oCoordList[1]);
                var oMidPoint = oCoordList[0].destinationPoint(dAngle, dDist);
                var dWidth = oModifiers.getAMValue(0);

                dAngle -= 90.0;
                dAngle = (dAngle + 360) % 360;
                oWidthPoint = oMidPoint.destinationPoint(dAngle, dWidth / 2.0);
                
                var oCP = new leafLet.editor.ControlPoint(oFeature,
                    leafLet.ControlPoint.Type.WIDTH_CP,
                    oWidthPoint, 0, 0, dWidth);

                this.addControlPoint(oCP);
            }
        },
        assembleControlPoints: function()
        {
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
            
            this._addWidthCP(oCoordList);
        },
        doAddControlPoint: function(oLatLng)
        {
            var oCoordList = this.getCoordinateList();
            var oSymbolDef = this.getSymbolDef();
            var oFeature = this.getFeature();

            if (oCoordList.length >= oSymbolDef.maxPoints)
            {
                return undefined;
            }

            oCoordList.push(oLatLng);
            this.setCoordinates(oCoordList);

            var oCP = new leafLet.editor.ControlPoint(oFeature,
                leafLet.ControlPoint.Type.POSITION_CP,
                oLatLng, oCoordList.length - 1, 0);
                
            if (this.updateLeafletObject(oCoordList))
            {
                this.removeAllCPByType(leafLet.ControlPoint.Type.WIDTH_CP);
                this._addWidthCP(oCoordList)
            }

            return oCP;
        },
        doDeleteControlPoint: function(oCP)
        {
            return false;
        },
        doControlPointMoved: function(oCP, oEvent)
        {
            var iIndex = oCP.getIndex();
            var oCoordList = this.getCoordinateList();
            
            switch (oCP.getType())
            {
                case leafLet.ControlPoint.Type.POSITION_CP:
                    // We need to update the position of the control point
                    // and the new control points beore and after it..
                    oCoordList[iIndex].lat = oEvent.latlng.lat;
                    oCoordList[iIndex].lng = oEvent.latlng.lng;
                    this.setCoordinates(oCoordList);
                    oCP.setCPPosition(oCoordList[iIndex]);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.WIDTH_CP);
                    this.updateLeafletObject(oCoordList);
                    this._addWidthCP(oCoordList);
                    return [iIndex];
                case leafLet.ControlPoint.Type.WIDTH_CP:
                    var oWidthPoint;
                    var oFeature = this.getFeature();
                    var oModifiers = oFeature.getMilStdModifiers();
                    var dDist = oCoordList[0].distanceTo(oCoordList[1]) / 2.0;
                    var dAngle = oCoordList[0].bearingTo(oCoordList[1]);
                    var oMidPoint = oCoordList[0].destinationPoint(dAngle, dDist);
                    var dWidth = Math.round(oMidPoint.distanceTo(oEvent.latlng));
                    //var dDraggedAngle = oMidPoint.bearingTo(oEvent.latlng);

                    dAngle -= 90.0;
                    dAngle = (dAngle + 360) % 360;

                    oWidthPoint = oMidPoint.destinationPoint(dAngle, dWidth);
                    oModifiers.setAMValue(0, dWidth * 2.0);
                    oCP.setCPPosition(oWidthPoint);
                    this.updateLeafletObject(oCoordList);
                    return [];
            }
            return undefined;
        }
   };

    return publicInterface;
};

leafLet.editor.MilStdDC2PointRectAutoShape = leafLet.editor.MilStd.extend(leafLet.internalPrivateClass.MilStdDC2PointRectAutoShapeEditor());
