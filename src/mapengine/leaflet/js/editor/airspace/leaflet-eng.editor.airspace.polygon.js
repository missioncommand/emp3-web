
/* global L, leafLet, emp */

leafLet.internalPrivateClass.AirspacePolygonEditor = function()
{
    var publicInterface = {
        initialize: function (args) 
        {
            //var oOptions = {
            //};
            //L.Util.setOptions(this, oOptions);
            
            leafLet.editor.Airspace.prototype.initialize.call(this, args);
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

                // Lets add the new CP.
                oNewCoord = oCoordList[0].midPointTo(oCoordList[oCoordList.length - 1]);
                oCP = new leafLet.editor.ControlPoint(oFeature,
                        leafLet.ControlPoint.Type.NEW_POSITION_CP,
                        oNewCoord, oCoordList.length, 0);
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
            
            if (oCoordList.length >= oFeature.getMinPoints())
            {
                this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                this._addNewCP();
            }
        },
        doAddControlPoint: function(oLatLng)
        {
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();
            
            if (oCoordList.length >= oFeature.getMinPoints())
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
                    this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                    this._addNewCP();
                }
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
            this.updateLeafletObject(oCoordList);
            this._addNewCP();
            
            return true;
        },
        doControlPointMoved: function(oCP, oEvent)
        {
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
                    this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                    this.updateLeafletObject(oCoordList);
                    //this.updateLeafletObject(oCoordList);
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
                    this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                    this.updateLeafletObject(oCoordList);
                    //this.updateLeafletObject(oCoordList);
                    this._addNewCP();
                    return [iIndex];
            }
            return undefined;
        }
   };

    return publicInterface;
};

leafLet.editor.AirspacePolygon = leafLet.editor.Airspace.extend(leafLet.internalPrivateClass.AirspacePolygonEditor());
