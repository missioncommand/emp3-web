
/* global L, leafLet, emp */

leafLet.internalPrivateClass.AirspacePolyArcEditor = function()
{
    var publicInterface = {
        initialize: function (args) 
        {
            //var oOptions = {
            //};
            //L.Util.setOptions(this, oOptions);
            
            leafLet.editor.Airspace.prototype.initialize.call(this, args);
        },
        _addRadiusCP: function(oCoordList)
        {
            var oFeature = this.getFeature();
            var oAttributes = oFeature.getAttributes(0);
            var oCP;
            var oCPPosition;
            var dRadius;
            var dLeftAzimuth;
            var dRightAzimuth;
            var dMidAzimuth;
            
            if (oCoordList.length >= oFeature.getMinPoints())
            {
                dRadius = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RADIUS);
                dLeftAzimuth = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_LEFT_AZIMUTH);
                dRightAzimuth = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH);
                
                dMidAzimuth = (dRightAzimuth + dLeftAzimuth) / 2.0;
                
                if (dRightAzimuth < dLeftAzimuth)
                {
                    dMidAzimuth = (dMidAzimuth + 180) % 360;
                }

                // Place the outter CP.
                oCPPosition = oCoordList[0].destinationPoint(dMidAzimuth, dRadius);
                oCP = new leafLet.editor.ControlPoint(oFeature,
                    leafLet.ControlPoint.Type.RADIUS_CP,
                    oCPPosition, 0, dMidAzimuth, dRadius);
                this.addControlPoint(oCP);
            }
        },
        _addAzimuthCP: function(oCoordList)
        {
            var oFeature = this.getFeature();
            var oAttributes = oFeature.getAttributes(0);
            var oCP;
            var oCPPosition;
            var dRadius;
            var dLeftAzimuth;
            var dRightAzimuth;
            
            if (oCoordList.length >= oFeature.getMinPoints())
            {
                dRadius = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RADIUS);
                dLeftAzimuth = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_LEFT_AZIMUTH);
                dRightAzimuth = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH);
                
                // Place the left azimuth  CP.
                oCPPosition = oCoordList[0].destinationPoint(dLeftAzimuth, dRadius);
                oCP = new leafLet.editor.ControlPoint(oFeature,
                    leafLet.ControlPoint.Type.LEFT_AZIMUTH_CP,
                    oCPPosition, 0, dRadius, dLeftAzimuth);
                this.addControlPoint(oCP);

                // Place the right azimuth CP.
                oCPPosition = oCoordList[0].destinationPoint(dRightAzimuth, dRadius);
                oCP = new leafLet.editor.ControlPoint(oFeature,
                    leafLet.ControlPoint.Type.RIGHT_AZIMUTH_CP,
                    oCPPosition, 0, dRadius, dRightAzimuth);
                this.addControlPoint(oCP);
            }
        },
        _addNewCP: function()
        {
            var dRadius;
            var dLeftAzimuth;
            var dRightAzimuth;
            var oCP;
            var oNewCoord;
            var iIndex;
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            var oAttributes = oFeature.getAttributes(0);

            if (oCoordList.length === 0)
            {
                return;
            }
            
            if (oCoordList.length >= oFeature.getMinPoints())
            {
                for (iIndex = 1; iIndex < oCoordList.length; iIndex++)
                {
                    // Lets add the new CP.
                    if (iIndex === 1)
                    {
                        dRadius = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RADIUS);
                        dRightAzimuth = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH);
                        oNewCoord = oCoordList[0].destinationPoint(dRightAzimuth, dRadius);
                        oNewCoord = oNewCoord.midPointTo(oCoordList[iIndex]);
                    }
                    else
                    {
                        oNewCoord = oCoordList[iIndex - 1].midPointTo(oCoordList[iIndex]);
                    }
                    
                    oCP = new leafLet.editor.ControlPoint(oFeature,
                            leafLet.ControlPoint.Type.NEW_POSITION_CP,
                            oNewCoord, iIndex, 0);
                    this.addControlPoint(oCP);
                }

                // Lets add the new CP.
                dRadius = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RADIUS);
                dLeftAzimuth = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_LEFT_AZIMUTH);
                oNewCoord = oCoordList[0].destinationPoint(dLeftAzimuth, dRadius);
                oNewCoord = oNewCoord.midPointTo(oCoordList[oCoordList.length - 1]);

                oCP = new leafLet.editor.ControlPoint(oFeature,
                        leafLet.ControlPoint.Type.NEW_POSITION_CP,
                        oNewCoord, oCoordList.length, 0);
                this.addControlPoint(oCP);
            }
        },
        assembleControlPoints: function()
        {
            var oFeature = this.getFeature();
            var oCoordList = this.getCoordinateList();
            var oCP;
            
            if (oCoordList.length < oFeature.getMinPoints())
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
            
            this._addRadiusCP(oCoordList);
            this._addAzimuthCP(oCoordList);
            this._addNewCP();
        },
        doAddControlPoint: function(oLatLng)
        {
            var oCP;
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            //var oModifiers = oFeature.getMilStdModifiers();
            //var sBasicSymbolCode = this.options.sBasicSymbolCode;
            //var oBasicSymbolCodes = leafLet.utils.milstd.basicSymbolCode;

            if (oCoordList.length >= oFeature.getMinPoints())
            {
                return undefined;
            }
            
            oCoordList.push(oLatLng);
            this.setCoordinates(oCoordList);
            
            oCP = new leafLet.editor.ControlPoint(oFeature,
                leafLet.ControlPoint.Type.POSITION_CP,
                oLatLng, oCoordList.length - 1, 0);
            
            this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
            this.removeAllCPByType(leafLet.ControlPoint.Type.LEFT_AZIMUTH_CP);
            this.removeAllCPByType(leafLet.ControlPoint.Type.RIGHT_AZIMUTH_CP);
            this.removeAllCPByType(leafLet.ControlPoint.Type.RADIUS_CP);

            if (this.updateLeafletObject(oCoordList))
            {
                this._addRadiusCP(oCoordList);
                this._addAzimuthCP(oCoordList);
                this._addNewCP();
            }

            return oCP;
        },
        doDeleteControlPoint: function(oCP)
        {
            var iIndex = oCP.getIndex();
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            
            if (oCP.getType() !== leafLet.ControlPoint.Type.POSITION_CP)
            {
                return false;
            }
            
            if (oCoordList.length <= oFeature.getMinPoints())
            {
                return false;
            }
            
            oCoordList.splice(iIndex, 1);
            this.setCoordinates(oCoordList);
            this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
            this.removeAllCPByType(leafLet.ControlPoint.Type.LEFT_AZIMUTH_CP);
            this.removeAllCPByType(leafLet.ControlPoint.Type.RIGHT_AZIMUTH_CP);
            this.removeAllCPByType(leafLet.ControlPoint.Type.RADIUS_CP);
            this.updateLeafletObject(oCoordList);
            this._addNewCP();
            this._addRadiusCP(oCoordList);
            this._addAzimuthCP(oCoordList);
            
            return true;
        },
        doControlPointMoved: function(oCP, oEvent)
        {
            var dMouseAngle;
            var dAngle;
            var dDist;
            var oCPPos;
            var iIndex = oCP.getIndex();
            var oRet = undefined;
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            var oAttributes = oFeature.getAttributes(0);

            if (oCoordList.length < oFeature.getMinPoints())
            {
                return undefined;
            }

            switch (oCP.getType())
            {
                case leafLet.ControlPoint.Type.NEW_POSITION_CP:
                    // We need to convert the new control point to a position control point
                    // and add new control points before and after it.
                    // We need to add the coordiante to our list in the correct position.
                    this.updateCPIndex(iIndex, 1);
                    oCoordList.splice(iIndex, 0, oEvent.latlng);
                    this.setCoordinates(oCoordList);
                    oCP.setCPPosition(oEvent.latlng);
                    oCP.setType(leafLet.ControlPoint.Type.POSITION_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RADIUS_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.LEFT_AZIMUTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RIGHT_AZIMUTH_CP);
                    this.updateLeafletObject(oCoordList);
                    this._addNewCP();
                    this._addRadiusCP(oCoordList);
                    this._addAzimuthCP(oCoordList);
                    this._issueCPAddEvent(iIndex);
                    break;
                case leafLet.ControlPoint.Type.POSITION_CP:
                    // We need to update the position of the control point
                    oCoordList[iIndex].lat = oEvent.latlng.lat;
                    oCoordList[iIndex].lng = oEvent.latlng.lng;
                    this.setCoordinates(oCoordList);
                    oCP.setCPPosition(oCoordList[iIndex]);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RADIUS_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.LEFT_AZIMUTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RIGHT_AZIMUTH_CP);
                    this.updateLeafletObject(oCoordList);
                    this._addNewCP();
                    this._addRadiusCP(oCoordList);
                    this._addAzimuthCP(oCoordList);
                    oRet = [0];
                    break;
                case leafLet.ControlPoint.Type.RADIUS_CP:
                    dAngle = oCP.getSubIndex();
                    dMouseAngle = oCoordList[0].bearingTo(oEvent.latlng);
                    dDist = oCoordList[0].distanceTo(oEvent.latlng);
                    dDist = Math.abs(Math.round(dDist * Math.cos((dMouseAngle - dAngle).toRad())));
                    
                    oAttributes.setValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RADIUS, dDist);
                    oCPPos = oCoordList[0].destinationPoint(dAngle, dDist);
                    oCP.setCPPosition(oCPPos);
                    oCP.setValue(dDist);

                    this.setCoordinates(oCoordList);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.LEFT_AZIMUTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RIGHT_AZIMUTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                    this.updateLeafletObject(oCoordList);
                    this._addNewCP();
                    this._addAzimuthCP(oCoordList);
                    this._issueCPUpdateEvent([], emp.typeLibrary.UpdateEventType.UPDATE);
                    break;
                case leafLet.ControlPoint.Type.LEFT_AZIMUTH_CP:
                case leafLet.ControlPoint.Type.RIGHT_AZIMUTH_CP:
                    dDist = oCP.getSubIndex();
                    dMouseAngle = oCoordList[0].bearingTo(oEvent.latlng);

                    oCPPos = oCoordList[0].destinationPoint(dMouseAngle, dDist);
                    oCP.setCPPosition(oCPPos);
                    oCP.setValue(dMouseAngle);

                    if (oCP.getType() === leafLet.ControlPoint.Type.LEFT_AZIMUTH_CP)
                    {
                        oAttributes.setValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_LEFT_AZIMUTH, dMouseAngle);
                    }
                    else
                    {
                        oAttributes.setValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH, dMouseAngle);
                    }

                    this.setCoordinates(oCoordList);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RADIUS_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.INNER_RADIUS_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                    this.updateLeafletObject(oCoordList);
                    this._addNewCP();
                    this._addRadiusCP(oCoordList);
                    break;
            }
            return oRet;
        }
   };

    return publicInterface;
};

leafLet.editor.AirspacePolyArc = leafLet.editor.Airspace.extend(leafLet.internalPrivateClass.AirspacePolyArcEditor());
