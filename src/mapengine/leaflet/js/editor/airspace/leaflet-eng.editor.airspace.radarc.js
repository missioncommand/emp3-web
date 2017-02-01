
/* global L, leafLet, emp */

leafLet.internalPrivateClass.AirspaceRadArcEditor = function()
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
            var dOutterRadius;
            var dInnerRadius;
            var dLeftAzimuth;
            var dRightAzimuth;
            var dMidAzimuth;
            
            if (oCoordList.length >= oFeature.getMinPoints())
            {
                dOutterRadius = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RADIUS);
                dInnerRadius = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_INNER_RADIUS);
                dLeftAzimuth = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_LEFT_AZIMUTH);
                dRightAzimuth = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH);
                
                dMidAzimuth = (dRightAzimuth + dLeftAzimuth) / 2.0;
                
                if (dRightAzimuth < dLeftAzimuth)
                {
                    dMidAzimuth = (dMidAzimuth + 180) % 360;
                }

                // Place the outter CP.
                oCPPosition = oCoordList[0].destinationPoint(dMidAzimuth, dOutterRadius);
                oCP = new leafLet.editor.ControlPoint(oFeature,
                    leafLet.ControlPoint.Type.RADIUS_CP,
                    oCPPosition, 0, dMidAzimuth, dOutterRadius);
                this.addControlPoint(oCP);

                // Place the inner CP.
                oCPPosition = oCoordList[0].destinationPoint(dMidAzimuth, dInnerRadius);
                oCP = new leafLet.editor.ControlPoint(oFeature,
                    leafLet.ControlPoint.Type.INNER_RADIUS_CP,
                    oCPPosition, 0, dMidAzimuth, dInnerRadius);
                this.addControlPoint(oCP);
            }
        },
        _addAzimuthCP: function(oCoordList)
        {
            var oFeature = this.getFeature();
            var oAttributes = oFeature.getAttributes(0);
            var oCP;
            var oCPPosition;
            var dOutterRadius;
            var dInnerRadius;
            var dAvgRadius;
            var dLeftAzimuth;
            var dRightAzimuth;
            
            if (oCoordList.length >= oFeature.getMinPoints())
            {
                dOutterRadius = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RADIUS);
                dInnerRadius = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_INNER_RADIUS);
                dLeftAzimuth = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_LEFT_AZIMUTH);
                dRightAzimuth = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RIGHT_AZIMUTH);
                
                dAvgRadius = (dOutterRadius + dInnerRadius) / 2.0;
                
                // Place the outter CP.
                oCPPosition = oCoordList[0].destinationPoint(dLeftAzimuth, dAvgRadius);
                oCP = new leafLet.editor.ControlPoint(oFeature,
                    leafLet.ControlPoint.Type.LEFT_AZIMUTH_CP,
                    oCPPosition, 0, dAvgRadius, dLeftAzimuth);
                this.addControlPoint(oCP);

                // Place the inner CP.
                oCPPosition = oCoordList[0].destinationPoint(dRightAzimuth, dAvgRadius);
                oCP = new leafLet.editor.ControlPoint(oFeature,
                    leafLet.ControlPoint.Type.RIGHT_AZIMUTH_CP,
                    oCPPosition, 0, dAvgRadius, dRightAzimuth);
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
            
            this._addRadiusCP(oCoordList);
            this._addAzimuthCP(oCoordList);
        },
        doAddControlPoint: function(oLatLng)
        {
            var oCP;
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            //var oModifiers = oFeature.getMilStdModifiers();
            //var sBasicSymbolCode = this.options.sBasicSymbolCode;
            //var oBasicSymbolCodes = leafLet.utils.milstd.basicSymbolCode;

            if (oCoordList.length >= oFeature.getMaxPoints())
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
                this._addAzimuthCP(oCoordList);
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
            var dDist;
            var oCPPos;
            var dOutterRadius;
            var dInnerRadius;
            var oRet = undefined;
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            var iCPIndex = oCP.getIndex();
            var oAttributes = oFeature.getAttributes(0);

            if (oCoordList.length < oFeature.getMinPoints())
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
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RADIUS_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.INNER_RADIUS_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.LEFT_AZIMUTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RIGHT_AZIMUTH_CP);
                    this.updateLeafletObject(oCoordList);
                    this._addRadiusCP(oCoordList);
                    this._addAzimuthCP(oCoordList);
                    oRet = [0];
                    break;
                case leafLet.ControlPoint.Type.RADIUS_CP:
                    dInnerRadius = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_INNER_RADIUS);
                    dAngle = oCP.getSubIndex();
                    dMouseAngle = oCoordList[0].bearingTo(oEvent.latlng);
                    dDist = oCoordList[0].distanceTo(oEvent.latlng);
                    dDist = Math.abs(Math.round(dDist * Math.cos((dMouseAngle - dAngle).toRad())));
                    
                    if (dDist <= dInnerRadius)
                    {
                        // The outter radius can't be equal or smaller that the inner.
                        break;
                    }
                    
                    oAttributes.setValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RADIUS, dDist);
                    oCPPos = oCoordList[0].destinationPoint(dAngle, dDist);
                    oCP.setCPPosition(oCPPos);
                    oCP.setValue(dDist);

                    this.setCoordinates(oCoordList);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.LEFT_AZIMUTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RIGHT_AZIMUTH_CP);
                    this.updateLeafletObject(oCoordList);
                    this._addAzimuthCP(oCoordList);
                    this._issueCPUpdateEvent([], emp.typeLibrary.UpdateEventType.UPDATE);
                    break;
                case leafLet.ControlPoint.Type.INNER_RADIUS_CP:
                    dOutterRadius = oAttributes.getValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_RADIUS);
                    dAngle = oCP.getSubIndex();
                    dMouseAngle = oCoordList[0].bearingTo(oEvent.latlng);
                    dDist = oCoordList[0].distanceTo(oEvent.latlng);
                    dDist = Math.abs(Math.round(dDist * Math.cos((dMouseAngle - dAngle).toRad())));
                    
                    if (dDist >= dOutterRadius)
                    {
                        // The inner radius can't be equal or greaterr than the outter.
                        break;
                    }
                    
                    oAttributes.setValue(leafLet.typeLibrary.AirspaceAttribute.AIRSPACE_INNER_RADIUS, dDist);
                    oCPPos = oCoordList[0].destinationPoint(dAngle, dDist);
                    oCP.setCPPosition(oCPPos);
                    oCP.setValue(dDist);

                    this.setCoordinates(oCoordList);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.LEFT_AZIMUTH_CP);
                    this.removeAllCPByType(leafLet.ControlPoint.Type.RIGHT_AZIMUTH_CP);
                    this.updateLeafletObject(oCoordList);
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
                    this.updateLeafletObject(oCoordList);
                    this._addRadiusCP(oCoordList);
                    break;
            }
            return oRet;
        }
   };

    return publicInterface;
};

leafLet.editor.AirspaceRadArc = leafLet.editor.Airspace.extend(leafLet.internalPrivateClass.AirspaceRadArcEditor());
