
/* global L, leafLet, emp */

leafLet.internalPrivateClass.AirspaceRouteEditor = function()
{
    var publicInterface = {
        initialize: function (args) 
        {
            //var oOptions = {
            //};
            //L.Util.setOptions(this, oOptions);
            
            leafLet.editor.Airspace.prototype.initialize.call(this, args);
        },
        _addWidthCP: function()
        {
            var oCP;
            var oNewCoord;
            var iIndex;
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            var oAttributes = oFeature.getAttributes(0);
            var dWidth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_WIDTH);

            if (oCoordList.length === 0)
            {
                return;
            }
            
            if (oCoordList.length >= oFeature.getMinPoints())
            {
                var Pt1 = oCoordList[0];
                var Pt2 = oCoordList[1];
                var dBearing = Pt1.bearingTo(Pt2);
                var dDist = Pt1.distanceTo(Pt2);

                oNewCoord = Pt1.destinationPoint(dBearing, dDist / 2.0);
                oNewCoord.moveCoordinate((dBearing + 270.0) % 360, dWidth / 2.0);
                
                oCP = new leafLet.editor.ControlPoint(oFeature,
                        leafLet.ControlPoint.Type.WIDTH_CP,
                        oNewCoord, iIndex, 0, dWidth);
                this.addControlPoint(oCP);
            }
        },
        _addNewCP: function()
        {
            var oCP;
            var oNewCoord;
            var iIndex;
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();

            if (oCoordList.length === 0)
            {
                return;
            }
            
            if (oCoordList.length >= oFeature.getMinPoints())
            {
                for (iIndex = 1; iIndex < oCoordList.length; iIndex++)
                {
                    // Lets add the new CP.
                    oNewCoord = oCoordList[iIndex - 1].midPointTo(oCoordList[iIndex]);
                    oCP = new leafLet.editor.ControlPoint(oFeature,
                            leafLet.ControlPoint.Type.NEW_POSITION_CP,
                            oNewCoord, iIndex, 0);
                    this.addControlPoint(oCP);
                }
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
            
            if (oCoordList.length >= oFeature.getMinPoints())
            {
                this.removeAllCPByType(leafLet.ControlPoint.Type.WIDTH_CP);
                this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                this._addWidthCP();
                this._addNewCP();
            }
        },
        doAddControlPoint: function(oLatLng)
        {
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            
            if (oCoordList.length >= oFeature.getMaxPoints())
            {
                return undefined;
            }
            
            oCoordList.push(oLatLng);
            this.setCoordinates(oCoordList);

            var oCP = new leafLet.editor.ControlPoint(oFeature,
                leafLet.ControlPoint.Type.POSITION_CP,
                oLatLng, oCoordList.length - 1, 0);
                
            if (oCoordList.length >= oFeature.getMinPoints())
            {
                if (this.updateLeafletObject(oCoordList))
                {
                    this.removeAllCPByType(leafLet.ControlPoint.Type.WIDTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                    this._addWidthCP();
                    this._addNewCP();
                }
            }

            return oCP;
        },
        doDeleteControlPoint: function(oCP)
        {
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            var iIndex = oCP.getIndex();
            
            if (oCP.getType() !== leafLet.ControlPoint.Type.POSITION_CP)
            {
                return false;
            }
            
            if (oCoordList.length >= oFeature.getMinPoints())
            {
                oCoordList.splice(iIndex, 1);
                this.setCoordinates(oCoordList);
                if (this.updateLeafletObject(oCoordList))
                {
                    this.removeAllCPByType(leafLet.ControlPoint.Type.WIDTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                    this._addWidthCP();
                    this._addNewCP();
                }
                
                return true;
            }
            return false;
        },
        doControlPointMoved: function(oCP, oEvent)
        {
            var iIndex = oCP.getIndex();
            var oCoordList = this.getCoordinateList();
            
            switch (oCP.getType())
            {
                case leafLet.ControlPoint.Type.WIDTH_CP:
                    var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
                    var oFeature = this.getFeature();
                    var oAttributes = oFeature.getAttributes(0);
                    var dWidth;
                    var sTurn = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_ORBIT_TURN);
                    var Pt1 = oCoordList[0];
                    var Pt2 = oCoordList[1];
                    var dBearing = Pt1.bearingTo(Pt2);
                    var dDist = Pt1.distanceTo(Pt2);
                    var oNewCoord = Pt1.destinationPoint(dBearing, dDist / 2.0);
                    var oCPPos = oCP.getPosition();
                    var dMouseBearing = oNewCoord.bearingTo(oEvent.latlng);
                    
                    dBearing = oNewCoord.bearingTo(oCPPos);
                    dDist = oNewCoord.distanceTo(oEvent.latlng);
                    
                    var dDelatAngle = Math.abs(dMouseBearing - dBearing);
                    dDist = Math.round(Math.abs(dDist * Math.cos(dDelatAngle.toRad())));

                    oNewCoord = oNewCoord.destinationPoint(dBearing, dDist);
                    dWidth = dDist * 2.0;
                    
                    oCP.setCPPosition(oNewCoord);
                    oCP.setValue(dWidth);
                    oAttributes.setValue(cAirspaceAttribute.AIRSPACE_WIDTH, dWidth);
                    this.setCoordinates(oCoordList);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                    this.updateLeafletObject(oCoordList);
                    this._addNewCP();
                    return [];
                case leafLet.ControlPoint.Type.NEW_POSITION_CP:
                    // We need to convert the new control point to a position control point
                    // and add new control points before and after it.
                    // We need to add the coordiante to our list in the correct position.
                    var iNewIndex = oCP.getIndex();

                    this.updateCPIndex(iNewIndex, 1);
                    oCoordList.splice(iNewIndex, 0, oEvent.latlng);
                    this.setCoordinates(oCoordList);
                    oCP.setCPPosition(oEvent.latlng);
                    oCP.setType(leafLet.ControlPoint.Type.POSITION_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.WIDTH_CP);
                    this.updateLeafletObject(oCoordList);
                    this._addWidthCP();
                    this._addNewCP();
                    this._issueCPAddEvent(iNewIndex);
                    break;
                case leafLet.ControlPoint.Type.POSITION_CP:
                    // We need to update the position of the control point
                    // and the new control points beore and after it..
                    oCoordList[iIndex].lat = oEvent.latlng.lat;
                    oCoordList[iIndex].lng = oEvent.latlng.lng;
                    this.setCoordinates(oCoordList);
                    oCP.setCPPosition(oCoordList[iIndex]);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.WIDTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                    this.updateLeafletObject(oCoordList);
                    this._addNewCP();
                    this._addWidthCP();
                    return [iIndex];
            }
            return undefined;
        }
   };

    return publicInterface;
};

leafLet.editor.AirspaceRoute = leafLet.editor.Airspace.extend(leafLet.internalPrivateClass.AirspaceRouteEditor());
