/* global leafLet, L, emp */

leafLet.internalPrivateClass.AOIEditor = function()
{
    var publicInterface = {
        initialize: function (args) 
        {
            var oOptions = {
                geoJsonType: (args.geoJsonType? args.geoJsonType.toLowerCase(): undefined)
            };
            L.Util.setOptions(this, oOptions);
            
            leafLet.editor.GeoJson.prototype.initialize.call(this, args);
        },
        preapareForEditOperation: function()
        {
            var oCoordList;
            var dNorth;
            var dSouth;
            var dWest;
            var dEast;
            var iIndex;
            
            switch(this.getFeature().getAOIType())
            {
                case emp.typeLibrary.AOIType.POINT_RADIUS:
                    break;
                case emp.typeLibrary.AOIType.LINE:
                    break;
                case emp.typeLibrary.AOIType.POLYGON:
                    break;
                case emp.typeLibrary.AOIType.BBOX:
                    
                    // force the BBox to be a rectangle aligned with logitude and lat.
                    oCoordList = this.getCoordinateList();
                    dNorth = -90.0;
                    dSouth = 90.0;
                    dWest = 180.0;
                    dEast = -180.0;

                    for (iIndex = 0; iIndex < oCoordList.length; iIndex++)
                    {
                        if (oCoordList[iIndex].lat > dNorth)
                        {
                            dNorth = oCoordList[iIndex].lat;
                        }
                        if (oCoordList[iIndex].lat < dSouth)
                        {
                            dSouth = oCoordList[iIndex].lat;
                        }
                        if (oCoordList[iIndex].lng < dWest)
                        {
                            dWest = oCoordList[iIndex].lng;
                        }
                        if (oCoordList[iIndex].lng > dEast)
                        {
                            dEast = oCoordList[iIndex].lng;
                        }
                    }

                    oCoordList[0].lat = dNorth;
                    oCoordList[0].lng = dWest;
                    oCoordList[1].lat = dNorth;
                    oCoordList[1].lng = dEast;
                    oCoordList[2].lat = dSouth;
                    oCoordList[2].lng = dEast;
                    oCoordList[3].lat = dSouth;
                    oCoordList[3].lng = dWest;
                    this.setCoordinates(oCoordList);
                    break;
            }
        },
        _addNewCP: function()
        {
            var oCP;
            var oBufferCoord;
            var oMidPointCoord;
            var dBrng = 90.0;
            var iIndex;
            var iMostEastCoord;
            var oMostEastCoord;
            var oNextCoord;
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();

            if (oCoordList.length === 0)
            {
                return;
            }

            switch(this.getFeature().getAOIType())
            {
                case emp.typeLibrary.AOIType.POINT_RADIUS:
                    oBufferCoord = oCoordList[0].destinationPoint(dBrng, oFeature.getAOIBuffer());
                    oMidPointCoord = oCoordList[0];
                    break;
                case emp.typeLibrary.AOIType.LINE:
                    leafLet.editor.GeoJson.prototype._addNewCP.call(this);
                    oMidPointCoord = oCoordList[0].midPointTo(oCoordList[1]);
                    dBrng = oCoordList[0].bearingTo(oCoordList[1]);
                    dBrng = (dBrng + 270) % 360;
                    oBufferCoord = oMidPointCoord.destinationPoint(dBrng, oFeature.getAOIBuffer());
                    break;
                case emp.typeLibrary.AOIType.POLYGON:
                    leafLet.editor.GeoJson.prototype._addNewCP.call(this);
                    iMostEastCoord = 0;
                    
                    // Find the coordinate furthest to the east.
                    for (iIndex = 1; iIndex < oCoordList.length; iIndex++)
                    {
                        if (oCoordList[iIndex].lng > oCoordList[iMostEastCoord].lng)
                        {
                            iMostEastCoord = iIndex;
                        }
                    }
                    // Get the coordinates of the furthest east and it's next point.
                    oMostEastCoord = oCoordList[iMostEastCoord];
                    oNextCoord = oCoordList[((iMostEastCoord + 1) % oCoordList.length)];
                    
                    // Now find the mid point between them
                    oMidPointCoord = oMostEastCoord.midPointTo(oNextCoord);
                    dBrng = oMostEastCoord.bearingTo(oNextCoord);
                    
                    // Now rotate the bearing.
                    if (leafLet.utils.dateLineInFeature(oCoordList))
                    {
                        // Rotate +90.
                        dBrng = (dBrng + 90) % 360;
                    }
                    else
                    {
                        // Rotate -90.
                        dBrng = (dBrng + 270) % 360;
                    }
                    oBufferCoord = oMidPointCoord.destinationPoint(dBrng, oFeature.getAOIBuffer());
                    break;
                case emp.typeLibrary.AOIType.BBOX:
                    oMidPointCoord = oCoordList[1].midPointTo(oCoordList[2]);
                    dBrng = oCoordList[1].bearingTo(oCoordList[2]);
                    dBrng = (dBrng + 270) % 360;
                    oBufferCoord = oMidPointCoord.destinationPoint(dBrng, oFeature.getAOIBuffer());
                    break;
            }
            //oCP = new leafLet.editor.ControlPoint(oFeature,
            //        leafLet.ControlPoint.Type.AOI_BUFFER,
            //        oBufferCoord, oMidPointCoord, dBrng, oFeature.getAOIBuffer());
            //this.addControlPoint(oCP);
        },
        removeAllCPByType: function(type)
        {
            leafLet.editor.GeoJson.prototype.removeAllCPByType.call(this, type);
            
            if (type === leafLet.ControlPoint.Type.NEW_POSITION_CP)
            {
                leafLet.editor.GeoJson.prototype.removeAllCPByType.call(this, leafLet.ControlPoint.Type.AOI_BUFFER);
            }
        },
        updateLeafletObject: function()
        {
            var oFeature = this.getFeature();
            
            oFeature.render();
        },
        doAddControlPoint: function(oLatLng)
        {
            var oCP;

            switch(this.getFeature().getAOIType())
            {
                case emp.typeLibrary.AOIType.BBOX:
                    // Can not add points to a BBox.
                    break;
                default:
                    oCP = leafLet.editor.GeoJson.prototype.doAddControlPoint.call(this, oLatLng);
                    break;
            }
            
            return oCP;
        },
        doControlPointMoved: function(oCP, oEvent)
        {
            var aRet;
            var oRefCoord;
            var dAngle;
            var dMouseAngle;
            var dDist;
            var oNewCoord;
            var iCoordIndex;
            var oCoordList;
            var oTempCP;
            var oFeature = this.getFeature();
            
            
            switch (oCP.getType())
            {
                case leafLet.ControlPoint.Type.AOI_BUFFER:
                    // For AOI buufer CPs the index stores the ref point the
                    // the buffer CP is angled off of.
                    oRefCoord = oCP.getIndex();
                    
                    // The bearing is stored in the sub index.
                    dAngle = oCP.getSubIndex();
                    // Get the bearing from the ref point to the mouse position.
                    dMouseAngle = oRefCoord.bearingTo(oEvent.latlng);
                    
                    // Calculate the distance of the ref point to the mouse
                    // projected it in the direction of dAngleFromRef.
                    dDist = oRefCoord.distanceTo(oEvent.latlng);
                    dDist = Math.abs(Math.round(dDist * Math.cos((dMouseAngle - dAngle).toRad())));

                    oNewCoord = oRefCoord.destinationPoint(dAngle, dDist);
                    oCP.setCPPosition(oNewCoord);
                    oCP.setValue(dDist);
                    oFeature.setAOIBufferProperty(dDist);
                    
                    this.updateLeafletObject();
                    
                    aRet = [];
                    break;
                case leafLet.ControlPoint.Type.POSITION_CP:
                    switch(oFeature.getAOIType())
                    {
                        case emp.typeLibrary.AOIType.POINT_RADIUS:
                            break;
                        case emp.typeLibrary.AOIType.LINE:
                        case emp.typeLibrary.AOIType.POLYGON:
                            aRet = leafLet.editor.GeoJson.prototype.doControlPointMoved.call(this, oCP, oEvent);
                            break;
                        case emp.typeLibrary.AOIType.BBOX:
                            oCoordList = this.getCoordinateList();
                            iCoordIndex = oCP.getIndex();
                            oCoordList[iCoordIndex] = oEvent.latlng;
                            oCP.setCPPosition(oCoordList[iCoordIndex]);
                            
                            switch (iCoordIndex)
                            {
                                case 0:
                                    // The Top left was moved.
                                    // So we set the long of the bottom left,
                                    // and the lat of the top right.
                                    oCoordList[3].lng = oCoordList[0].lng;
                                    oTempCP = this.getCP(3);
                                    oTempCP.setCPPosition(oCoordList[3]);
                                    
                                    oCoordList[1].lat = oCoordList[0].lat;
                                    oTempCP = this.getCP(1);
                                    oTempCP.setCPPosition(oCoordList[1]);
                                    
                                    aRet = [0, 1, 3];
                                    break;
                                case 1:
                                    // The Top right was moved.
                                    // So we set the long of the bottom right,
                                    // and the lat of the top left.
                                    oCoordList[2].lng = oCoordList[1].lng;
                                    oTempCP = this.getCP(2);
                                    oTempCP.setCPPosition(oCoordList[2]);
                                    
                                    oCoordList[0].lat = oCoordList[1].lat;
                                    oTempCP = this.getCP(0);
                                    oTempCP.setCPPosition(oCoordList[0]);
                                    
                                    aRet = [0, 1, 2];
                                    break;
                                case 2:
                                    // The bottom right was moved.
                                    // So we set the long of the top right,
                                    // and the lat of the bottom left.
                                    oCoordList[1].lng = oCoordList[2].lng;
                                    oTempCP = this.getCP(1);
                                    oTempCP.setCPPosition(oCoordList[1]);
                                    
                                    oCoordList[3].lat = oCoordList[2].lat;
                                    oTempCP = this.getCP(3);
                                    oTempCP.setCPPosition(oCoordList[3]);
                                    
                                    aRet = [1, 2, 3];
                                    break;
                                case 3:
                                    // The bottom left was moved.
                                    // So we set the long of the top left,
                                    // and the lat of the bottom right.
                                    oCoordList[0].lng = oCoordList[3].lng;
                                    oTempCP = this.getCP(0);
                                    oTempCP.setCPPosition(oCoordList[0]);
                                    
                                    oCoordList[2].lat = oCoordList[3].lat;
                                    oTempCP = this.getCP(2);
                                    oTempCP.setCPPosition(oCoordList[2]);
                                    
                                    aRet = [0, 2, 3];
                                    break;
                            }
                            this.setCoordinates(oCoordList);
                            this.updateLeafletObject();
                            this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                            this._addNewCP();
                            break;
                    }
                    break;
                default:
                    aRet = leafLet.editor.GeoJson.prototype.doControlPointMoved.call(this, oCP, oEvent);
                    break;
            }
            return aRet;
        },
        doDeleteControlPoint: function(oCP)
        {
            var bRet = false;
            
            switch(this.getFeature().getAOIType())
            {
                case emp.typeLibrary.AOIType.BBOX:
                    // Can not delete points from a BBox.
                    break;
                default:
                    bRet = leafLet.editor.GeoJson.prototype.doDeleteControlPoint.call(this, oCP);
                    break;
            }
            return bRet;
        }
   };

    return publicInterface;
};

leafLet.editor.AOI = leafLet.editor.GeoJson.extend(leafLet.internalPrivateClass.AOIEditor());
