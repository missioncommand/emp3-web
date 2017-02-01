
/* global L, leafLet, emp */

leafLet.internalPrivateClass.AirspaceTrackEditor = function()
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
            var oMidCoord;
            var iIndex;
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();

            if (oCoordList.length === 0)
            {
                return;
            }
            
            if (oCoordList.length >= oFeature.getMinPoints())
            {
                var Pt1;
                var Pt2;
                var dBearing;
                var dDist;
                var oAttributes;
                var dLeftWidth;
                var dRightWidth;
                var oNewCoord;

                for (iIndex = 1; iIndex < oCoordList.length; iIndex++)
                {
                    oAttributes = oFeature.getAttributes(iIndex - 1);
                    dLeftWidth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LEFT_WIDTH);
                    dRightWidth = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_RIGHT_WIDTH);
                    Pt1 = oCoordList[iIndex - 1];
                    Pt2 = oCoordList[iIndex];
                    dBearing = Pt1.bearingTo(Pt2);
                    
                    oMidCoord = Pt1.pointAt3QtrDistanceTo(Pt2);
                    oNewCoord = oMidCoord.destinationPoint((dBearing + 270.0) % 360, dLeftWidth);

                    oCP = new leafLet.editor.ControlPoint(oFeature,
                            leafLet.ControlPoint.Type.LEFT_WIDTH_CP,
                            oNewCoord, iIndex - 1, iIndex, dLeftWidth);
                    this.addControlPoint(oCP);

                    oNewCoord = oMidCoord.destinationPoint((dBearing + 90.0) % 360, dRightWidth);

                    oCP = new leafLet.editor.ControlPoint(oFeature,
                            leafLet.ControlPoint.Type.RIGHT_WIDTH_CP,
                            oNewCoord, iIndex - 1, iIndex, dRightWidth);
                    this.addControlPoint(oCP);
                }
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
                this.removeAllCPByType(leafLet.ControlPoint.Type.LEFT_WIDTH_CP);
                this.removeAllCPByType(leafLet.ControlPoint.Type.RIGHT_WIDTH_CP);
                this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                this._addWidthCP();
                this._addNewCP();
            }
        },
        doAddControlPoint: function(oLatLng)
        {
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            var oAttributeList = oFeature.getAttributeList();
            var oAttributes;
            var iIndex = oCoordList.length;
            
            if (oCoordList.length >= oFeature.getMaxPoints())
            {
                return undefined;
            }
            
            oCoordList.push(oLatLng);
            this.setCoordinates(oCoordList);

            var oCP = new leafLet.editor.ControlPoint(oFeature,
                leafLet.ControlPoint.Type.POSITION_CP,
                oLatLng, iIndex, 0);

            if (oCoordList.length >= oFeature.getMinPoints())
            {
                oAttributes = oAttributeList.get(iIndex - 1);

                if (!oAttributes)
                {
                    if (iIndex === 1)
                    {
                        oAttributes = new leafLet.typeLibrary.airspace.Attributes(oFeature.getProperties(), {});
                        oAttributes.setRequiredAttributes(emp.typeLibrary.airspaceSymbolCode.SHAPE3D_TRACK);
                    }
                    else
                    {
                        oAttributes = oAttributeList.get(iIndex - 2);
                        oAttributes = oAttributes.duplicateAttribute();
                    }
                    
                    oAttributeList.add(oAttributes);
                }
                
                if (this.updateLeafletObject(oCoordList))
                {
                    this.removeAllCPByType(leafLet.ControlPoint.Type.LEFT_WIDTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RIGHT_WIDTH_CP);
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
            var oAttributeList = oFeature.getAttributeList();
            
            if (oCP.getType() !== leafLet.ControlPoint.Type.POSITION_CP)
            {
                return false;
            }
            
            if (oCoordList.length >= oFeature.getMinPoints())
            {
                oCoordList.splice(iIndex, 1);
                this.setCoordinates(oCoordList);
                
                if (iIndex === oAttributeList.length() - 1)
                {
                    oAttributeList.remove(iIndex - 1);
                }
                else
                {
                    oAttributeList.remove(iIndex);
                }

                if (this.updateLeafletObject(oCoordList))
                {
                    this.removeAllCPByType(leafLet.ControlPoint.Type.LEFT_WIDTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RIGHT_WIDTH_CP);
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
            var oAttributes;
            var oNewCoord;
            var iIndex = oCP.getIndex();
            var iIndex2 = oCP.getSubIndex();
            var oCoordList = this.getCoordinateList();
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            var oFeature = this.getFeature();
            var oAttributeList = oFeature.getAttributeList();
            
            switch (oCP.getType())
            {
                case leafLet.ControlPoint.Type.LEFT_WIDTH_CP:
                case leafLet.ControlPoint.Type.RIGHT_WIDTH_CP:
                    var dWidth;
                    var Pt1 = oCoordList[iIndex];
                    var Pt2 = oCoordList[iIndex2];
                    var dBearing = Pt1.bearingTo(Pt2);
                    var dDist;
                    var oMidCoord = Pt1.pointAt3QtrDistanceTo(Pt2);
                    var oCPPos = oCP.getPosition();
                    var dMouseBearing = oMidCoord.bearingTo(oEvent.latlng);

                    oAttributes = oFeature.getAttributes(iIndex);
                    
                    dBearing = oMidCoord.bearingTo(oCPPos);
                    dDist = oMidCoord.distanceTo(oEvent.latlng);
                    
                    var dDelatAngle = Math.abs(dMouseBearing - dBearing);
                    dDist = Math.round(Math.abs(dDist * Math.cos(dDelatAngle.toRad())));

                    oNewCoord = oMidCoord.destinationPoint(dBearing, dDist);
                    dWidth = dDist;
                    
                    oCP.setCPPosition(oNewCoord);
                    oCP.setValue(dWidth);
                    
                    if (oCP.getType() === leafLet.ControlPoint.Type.LEFT_WIDTH_CP)
                    {
                        oAttributes.setValue(cAirspaceAttribute.AIRSPACE_LEFT_WIDTH, dWidth);
                    }
                    else
                    {
                        oAttributes.setValue(cAirspaceAttribute.AIRSPACE_RIGHT_WIDTH, dWidth);
                    }
                    
                    this.setCoordinates(oCoordList);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                    this.updateLeafletObject(oCoordList);
                    this._addNewCP();
                    return [];
                case leafLet.ControlPoint.Type.NEW_POSITION_CP:
                    // We need to convert the new control point to a position control point
                    // and add new control points before and after it.
                    // We need to add the coordiante to our list in the correct position.
                    this.removeAllCPByType(leafLet.ControlPoint.Type.LEFT_WIDTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RIGHT_WIDTH_CP);

                    this.updateCPIndex(iIndex, 1);
                    oCoordList.splice(iIndex, 0, oEvent.latlng);
                    this.setCoordinates(oCoordList);
                    oCP.setCPPosition(oEvent.latlng);
                    oCP.setType(leafLet.ControlPoint.Type.POSITION_CP);
                    
                    // We need to add a set of attributes for the new segment.
                    oAttributes = oFeature.getAttributes(iIndex - 1);
                    oAttributes = oAttributes.duplicateAttribute();
                    oAttributeList.insert(iIndex, oAttributes);
                    
                    this.updateLeafletObject(oCoordList);
                    this._addWidthCP();
                    this._issueCPAddEvent(iIndex);
                    break;
                case leafLet.ControlPoint.Type.POSITION_CP:
                    // We need to update the position of the control point
                    // and the new control points beore and after it..
                    oCoordList[iIndex].lat = oEvent.latlng.lat;
                    oCoordList[iIndex].lng = oEvent.latlng.lng;
                    this.setCoordinates(oCoordList);
                    oCP.setCPPosition(oCoordList[iIndex]);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.LEFT_WIDTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RIGHT_WIDTH_CP);
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

leafLet.editor.AirspaceTrack = leafLet.editor.Airspace.extend(leafLet.internalPrivateClass.AirspaceTrackEditor());
