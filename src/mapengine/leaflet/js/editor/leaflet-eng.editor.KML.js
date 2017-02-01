
/* global leafLet, armyc2, L, emp */

leafLet.internalPrivateClass.KMLEditor = function()
{
    var publicInterface = {
        initialize: function (args) 
        {
            var oOptions = {
            };
            L.Util.setOptions(this, oOptions);
            
            leafLet.editor.AbstractEditor.prototype.initialize.call(this, args);
        },
        getCoordinateList: function()
        {
            return leafLet.utils.kml.convertCoordinatesToLatLng(this.getFeature().getData());
        },
        setCoordinates: function(oLatLngList)
        {
            var sKML = leafLet.utils.kml.convertLatLngListToKML(this.getFeature().getData(), oLatLngList);
            this.getFeature().setData(sKML);
        },
        _addNewCP: function()
        {
            var oCP;
            var oNewCoord;
            var iIndex;
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            var oLeafletObject = this.getLeafletObject();

            if (oCoordList.length === 0)
            {
                return;
            }
            
            if (oLeafletObject instanceof L.LayerGroup)
            {
                oLeafletObject = oLeafletObject.getLayers()[0];
            }
            
            if (oLeafletObject instanceof L.Polygon)
            {
                if (oCoordList.length > 2)
                {
                    for (iIndex = 1; iIndex < oCoordList.length; iIndex++)
                    {
                        // Lets add the new CP.
                        oNewCoord = oCoordList[iIndex - 1].midPointTo(oCoordList[iIndex]);
                        oCP = new leafLet.editor.ControlPoint(oFeature,
                                leafLet.ControlPoint.Type.NEW_POSITION_CP,
                                oNewCoord, iIndex, 0, "");
                        this.addControlPoint(oCP);
                    }

                    // Lets add the new CP.
                    oNewCoord = oCoordList[0].midPointTo(oCoordList[oCoordList.length - 1]);
                    oCP = new leafLet.editor.ControlPoint(oFeature,
                            leafLet.ControlPoint.Type.NEW_POSITION_CP,
                            oNewCoord, oCoordList.length, 0);
                    this.addControlPoint(oCP);
                }
            }
            else if (oLeafletObject instanceof L.Polyline)
            {
                if (oCoordList.length > 1)
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
            }
        },
        assembleControlPoints: function()
        {
            var oCP;
            var iIndex;
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            var oLeafletObject = this.getLeafletObject();

            if (oCoordList.length === 0)
            {
                return;
            }
            
            if (oLeafletObject instanceof L.LayerGroup)
            {
                oLeafletObject = oLeafletObject.getLayers()[0];
            }
            
            if (oLeafletObject instanceof L.Marker)
            {
                // Markers have no control points.
            }
            else if ((oLeafletObject instanceof L.Polygon) ||
                (oLeafletObject instanceof L.Polyline))
            {
                for (iIndex = 0; iIndex < oCoordList.length; iIndex++)
                {
                    oCP = new leafLet.editor.ControlPoint(oFeature,
                            leafLet.ControlPoint.Type.POSITION_CP,
                            oCoordList[iIndex], iIndex, 0);
                    this.addControlPoint(oCP);
                }
                this._addNewCP();
            }
        },
        doAddControlPoint: function(oLatLng)
        {
            var oCP;
            var oCoordList = this.getCoordinateList();
            var oLeafletObject = this.getLeafletObject();
            
            if (oLeafletObject instanceof L.LayerGroup)
            {
                oLeafletObject = oLeafletObject.getLayers()[0];
            }
            
            if (oLeafletObject instanceof L.Marker)
            {
                if (oCoordList.length > 0)
                {
                    return undefined;
                }
            }
            else if (oLeafletObject instanceof L.Polygon)
            {
            }
            else if (oLeafletObject instanceof L.Polyline)
            {
            }

            if (!(oLeafletObject instanceof L.Marker))
            {
                oCP = new leafLet.editor.ControlPoint(this.getFeature(),
                        leafLet.ControlPoint.Type.POSITION_CP,
                        oLatLng, oCoordList.length, 0);
            }

            oCoordList.push(oLatLng);
            this.setCoordinates(oCoordList);
            this.updateLeafletObject();
            this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
            this._addNewCP();
            
            return oCP;
        },
        doDeleteControlPoint: function(oCP)
        {
            var bRet = false;
            var oCoordList = this.getCoordinateList();
            var iIndex = oCP.getIndex();
            var oLeafletObject = this.getLeafletObject();
            
            if (oLeafletObject instanceof L.LayerGroup)
            {
                oLeafletObject = oLeafletObject.getLayers()[0];
            }

            if (oLeafletObject instanceof L.Polygon)
            {
                if (oCoordList.length > 3)
                {
                    oCoordList.splice(iIndex, 1);
                    bRet = true;
                }
            }
            else if (oLeafletObject instanceof L.Polyline)
            {
                if (oCoordList.length > 2)
                {
                    oCoordList.splice(iIndex, 1);
                    bRet = true;
                }
            }
            
            if (bRet)
            {
                this.setCoordinates(oCoordList);
                this.updateLeafletObject();
                this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                this._addNewCP();
            }
            return bRet;
        },
        doControlPointMoved: function(oCP, oEvent)
        {
            var oRet = undefined;
            var iIndex = oCP.getIndex();
            var oCoordList = this.getCoordinateList();
            
            switch (oCP.getType())
            {
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
                    this._issueCPAddEvent(iNewIndex);
                    break;
                case leafLet.ControlPoint.Type.POSITION_CP:
                    // We need to update the position od the control point
                    // and the new control points beore and after it..
                    oCoordList[iIndex].lat = oEvent.latlng.lat;
                    oCoordList[iIndex].lng = oEvent.latlng.lng;
                    this.setCoordinates(oCoordList);
                    oCP.setCPPosition(oCoordList[iIndex]);
                    oRet = [iIndex];
                    break;
            }
            this.updateLeafletObject();
            this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
            this._addNewCP();
            return oRet;
        },
        doFeatureMove: function(dBearing, dDistance)
        {
            var oCoordList = this.getCoordinateList();
            var oCPList = this.options.oControlPointList;
            var oCoord;
            var iCoordIndex;
            var oLeafletObject = this.getLeafletObject();

            if (oLeafletObject instanceof L.LayerGroup)
            {
                oLeafletObject = oLeafletObject.getLayers()[0];
            }
            
            if (oLeafletObject instanceof L.Marker)
            {
                oCoord = oCoordList[0];
                oCoord.moveCoordinate(dBearing, dDistance);
            }
            else
            {
                for (var iIndex = 0; iIndex < oCPList.length; iIndex++)
                {
                    iCoordIndex = oCPList[iIndex].getIndex();
                    oCoord = oCPList[iIndex].getPosition();
                    oCoord.moveCoordinate(dBearing, dDistance);
                    oCPList[iIndex].setCPPosition(oCoord);
                    if (oCPList[iIndex].getType() === leafLet.ControlPoint.Type.POSITION_CP)
                    {
                        oCoordList[iCoordIndex] = oCoord;
                    }
                }
            }
                    
            this.setCoordinates(oCoordList);
            this.updateLeafletObject();
            return true;
        },
        updateLeafletObject: function(oCoord)
        {
            var oCoordList = oCoord || this.getCoordinateList();
            var oLeafletObject = this.getLeafletObject();
            var oMapBounds = this.getLeafletMap().getBounds();

            leafLet.utils.wrapCoordinates(oMapBounds, oCoordList, false);
            if (oLeafletObject instanceof L.LayerGroup)
            {
                oLeafletObject = oLeafletObject.getLayers()[0];
            }
            
            if (oLeafletObject instanceof L.Marker)
            {
                oLeafletObject.setLatLng(oCoordList[0]);
            }
            else if ((oLeafletObject instanceof L.Polygon) ||
                (oLeafletObject instanceof L.Polyline))
            {
                oLeafletObject.setLatLngs(oCoordList);
            }
        },
        convertToUpdateCoordinates: function(oCoordList)
        {
            var oUpdateCoordList = leafLet.editor.AbstractEditor.prototype.convertToUpdateCoordinates.call(this, oCoordList);
            var oLeafletObject = this.getLeafletObject();
            
            if (oLeafletObject instanceof L.LayerGroup)
            {
                oLeafletObject = oLeafletObject.getLayers()[0];
            }
            
            if (oLeafletObject instanceof L.Polygon)
            {
                // For polygon we need to add the first one to the end.
                if (!isNaN(oCoordList[0].alt))
                {
                    oUpdateCoordList.push({
                        lat: oCoordList[0].lat,
                        lon: oCoordList[0].lng,
                        alt: oCoordList[0].alt
                    });
                }
                else
                {
                    oUpdateCoordList.push({
                        lat: oCoordList[0].lat,
                        lon: oCoordList[0].lng
                    });
                }
            }
            
            return oUpdateCoordList;
        }
   };

    return publicInterface;
};

leafLet.editor.KML = leafLet.editor.AbstractEditor.extend(leafLet.internalPrivateClass.KMLEditor());
