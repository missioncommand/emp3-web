/* global leafLet, L, emp */

leafLet.editor.StateType = {
    IDLE: 'idle',
    ADDING_CP: 'add',
    DELETE_CP: 'delete',
    DRAGGING_CP: 'dragging',
    FEATURE_DRAG: 'featuredrag'
};

leafLet.internalPrivateClass.AbstractEditor = function()
{
    var publicInterface = {
        initialize: function (args) 
        {
            L.FeatureGroup.prototype.initialize.call(this);
            var oOptions = {
                bDestroyFeature: false,
                editorState: leafLet.editor.StateType.IDLE,
                isDrawing: ((args.EmpDrawEditItem instanceof emp.typeLibrary.Draw)? true: false), // False if editing.
                oTransaction: args.transaction,
                oEmpDrawEditItem: args.EmpDrawEditItem,
                oCurrentCP: undefined,
                feature: args.feature,
                properties: undefined,
                //leafletObject: (args.feature? args.feature.getLeafletObject(): undefined),
                leafletMap: args.instanceInterface.leafletInstance,
                instanceInterface: args.instanceInterface,
                oControlPointList: [],
                featureStartLocation: undefined,
                updateIndex: undefined,
                oMarkerPopUp: undefined,
                bCPDragged: false
            };
            L.Util.setOptions(this, oOptions);
            this.options.leafletMap.addLayer(this);

            if (args.feature)
            {
                this.options.properties = leafLet.utils.mergeProperties(this.options.feature.options.properties, this.options.oEmpDrawEditItem.properties);
            }
            else
            {
                this.options.properties = leafLet.utils.mergeProperties(this.options.oEmpDrawEditItem.properties, {});
            }
            if (this.isDrawMode())
            {
                this.preapareForDrawOperation();
            }
            else
            {
                this.preapareForEditOperation();
                
                if (this.getFeature().getParentCoreId() !== undefined)
                {
                    var oParent = this.getFeature().getParentObject();
                    oParent.removeChildObject(this.getFeature());
                }
                
                this.addLayer(this.getFeature());
            }
            
            this.getFeature().setEditMode();
            this.assembleControlPoints();
            
            this.options.leafletMap.on('click', this.onClickEvent, this);
            this.options.leafletMap.on('mouseup', this.onFeatureMouseUpEvent, this);
            //this.on('mousedown', this.onMouseDown, this);
            //this.on('dblclick', this.onDblClick, this);

            this.setLeafletObjectEvents();
            
            this._issueStartEvent();
        },
        destroy:function()
        {
            if (this.options.oMarkerPopUp)
            {
                this.removeLayer(this.options.oMarkerPopUp);
            }
            
            this.removeLayer(this.getFeature());

            this.removeLeafletObjectEvents();

            if (this.options.bDestroyFeature)
            {
                this.options.feature.destroy();
                this.options.feature = undefined;
            }
            this.options.leafletMap.off('click', this.onClickEvent, this);
            this.options.leafletMap.off('mouseup', this.onFeatureMouseUpEvent, this);
            this.options.leafletMap.off('mouseup', this.onCPMouseUpEvent, this);
            this.clearAllEventListeners();
            this.removeAllControlPoints();
            this.options.leafletMap.removeLayer(this);
            
            if (this.getFeature())
            {
                if (this.getFeature().getParentCoreId() !== undefined)
                {
                    var oParent = this.getFeature().getParentObject();
                    oParent.addChildObject(this.getFeature());
                }
            }
        },
        getEngineInstanceInterface: function()
        {
            return this.options.instanceInterface;
        },
        getMarkerObject: function()
        {
            var oLeafletObject = this.getLeafletObject();
            
            if (oLeafletObject)
            {
                if (oLeafletObject instanceof L.LayerGroup)
                {
                    oLeafletObject = oLeafletObject.getLayers()[0];
                }

                if (oLeafletObject instanceof L.Marker)
                {
                    return oLeafletObject;
                }
            }
            
            return undefined;
        },
        isMarker: function()
        {
            return (this.getMarkerObject()? true: false);
        },
        setMarkerEvents: function()
        {
            var oLeafletObject = this.getMarkerObject();
            
            if (oLeafletObject)
            {
                oLeafletObject.on('mousedown', this.onFeatureMouseDown, this);
                //oLeafletObject.on('mouseup', this.onFeatureMouseUpEvent, this);
            }
        },
        removeMarkerEvents: function()
        {
            var oLeafletObject = this.getMarkerObject();
            
            if (oLeafletObject)
            {
                oLeafletObject.off('mousedown', this.onFeatureMouseDown, this);
                //oLeafletObject.off('mouseup', this.onFeatureMouseUpEvent, this);
            }
        },
        setLeafletObjectEvents: function()
        {
            var oLeafletObject = this.getLeafletObject();
            
            if (oLeafletObject)
            {
                if (this.isMarker())
                {
                    this.setMarkerEvents();
                }
                else if (oLeafletObject instanceof L.LayerGroup)
                {
                    var oChildren = oLeafletObject.getLayers();
                    
                    for (var iIndex = 0; iIndex < oChildren.length; iIndex++)
                    {
                        oChildren[iIndex].on('mousedown', this.onFeatureMouseDown, this);
                        //oChildren[iIndex].on('mouseup', this.onFeatureMouseUpEvent, this);
                    }
                }
                else
                {
                    oLeafletObject.on('mousedown', this.onFeatureMouseDown, this);
                    //oLeafletObject.on('mouseup', this.onFeatureMouseUpEvent, this);
                }
            }
        },
        removeLeafletObjectEvents: function()
        {
            var oLeafletObject = this.getLeafletObject();
            
            if (oLeafletObject)
            {
                if (this.isMarker())
                {
                    this.removeMarkerEvents();
                }
                else if (oLeafletObject instanceof L.LayerGroup)
                {
                    var oChildren = oLeafletObject.getLayers();
                    
                    for (var iIndex = 0; iIndex < oChildren.length; iIndex++)
                    {
                        oChildren[iIndex].off('mousedown', this.onFeatureMouseDown, this);
                        //oChildren[iIndex].off('mouseup', this.onFeatureMouseUpEvent, this);
                    }
                }
                else
                {
                    oLeafletObject.off('mousedown', this.onFeatureMouseDown, this);
                    //oLeafletObject.off('mouseup', this.onFeatureMouseUpEvent, this);
                }
            }
        },
        getLeafletMap: function()
        {
            return this.options.leafletMap;
        },
        removeAllControlPoints: function()
        {
            var oControlPointList = this.options.oControlPointList;
            
            while (oControlPointList.length > 0)
            {
                this.removeCP(oControlPointList[0]);
            }
        },
        _getAltitudeValue: function(dValue)
        {
            var oFeature = this.getFeature();
            
            return dValue.toFixed(0) + " " + oFeature.getAltitudeUnits() + " " + oFeature.getAltitudeModeAbbr();
        },
        getMarkerPopupText: function()
        {
            var sPopupText;
            var oLeafletObject = this.getLeafletObject();
            
            if (oLeafletObject instanceof L.LayerGroup)
            {
                oLeafletObject = oLeafletObject.getLayers()[0];
            }
            
            if (oLeafletObject instanceof L.Marker)
            {
                var oCoordList = this.getCoordinateList();
                var oLatLng = oCoordList[0];
                
                sPopupText = "<center>Lat:" + oLatLng.lat.toFixed(5) + "<br/>Lon:" + oLatLng.lng.toFixed(5);

                if (!isNaN(oLatLng.alt))
                {
                    sPopupText += "<br/>Alt:" + this._getAltitudeValue(oLatLng.alt);
                }

                sPopupText += "</center>";
            }
            
            return sPopupText;
        },
        setMarkerPopup: function()
        {
/*
            var sPopupText;
            var oLeafletObject = this.getLeafletObject();
            
            if (oLeafletObject)
            {
                sPopupText = this.getMarkerPopupText();

                if (this.options.oMarkerPopUp)
                {
                    this.options.oMarkerPopUp.setContent(sPopupText);
                    this.options.oMarkerPopUp.setLatLng(oLeafletObject.getLatLng());
                    this.options.oMarkerPopUp.update();
                }
                else
                {
                    this.options.oMarkerPopUp = new L.Popup({
                        closeButton: false,
                        autoPan: false,
                        className: 'mdl-color--grey-800 mdl-shadow--12dp',
                        offset: new L.Point(0, (this.options.instanceInterface.iMilStdIconSize * -1))
                    });
                    this.options.oMarkerPopUp.setLatLng(oLeafletObject.getLatLng());
                    this.addLayer(this.options.oMarkerPopUp);
                }
            }
*/
        },
        getLeafletObject: function()
        {
            var oFeature = this.getFeature();
            
            if (oFeature)
            {
                return oFeature.getLeafletObject();
            }
            return undefined;
        },
        setLeafletObject: function(oObject)
        {
            var oFeature = this.getFeature();

            if (oFeature)
            {
                this.removeLeafletObjectEvents();
                oFeature.setLeafletObject(oObject);
            }
            
            var oMarkerObject = this.getMarkerObject();
            
            if (oMarkerObject)
            {
                oMarkerObject.unbindPopup();
            }
            
            this.setLeafletObjectEvents();
            this.setMarkerPopup();
            this.bringCPForward();
        },
        getFeature: function()
        {
            return this.options.feature;
        },
        setFeature: function(oFeature)
        {
            if (this.options.feature)
            {
                this.getFeature().clearAllEventListeners();
                this.removeLayer(this.getFeature());
                if (this.options.bDestroyFeature)
                {
                    this.getFeature().destroy();
                }
                this.options.feature = undefined;
            }
            
            if (oFeature)
            {
                this.options.feature = oFeature;
                this.addLayer(this.getFeature());
                this.setLeafletObjectEvents();
            }
        },
        getDrawEditItem: function()
        {
            return this.options.oEmpDrawEditItem;
        },
        isDrawMode: function()
        {
            return this.options.isDrawing;
        },
        preapareForDrawOperation: function()
        {
            // The subclass can implement this function.
            // It is called once at the start of a draw operation, before the assembleControlPoints.
        },
        preapareForEditOperation: function()
        {
            // The subclass can implement this function.
            // It is called once at the start of an edit operation,
            // before the assembleControlPoints is called.
        },
        assembleControlPoints: function()
        {
            throw new Error("The editor has not implemented the assembleControlPoint method.");
        },
        createEMPFeature: function()
        {
            var oEMPFeature;
            var oFeature = this.getFeature();
            
            oEMPFeature = new emp.typeLibrary.Feature({
                coreId: oFeature.getCoreId(),
                overlayId: oFeature.getOverlayId(),
                parentId: oFeature.getParentId(),
                featureId: oFeature.getFeatureId(),
                name: oFeature.getName(),
                format: oFeature.getFormat(),
                data: oFeature.getData(),
                properties: oFeature.getProperties()
            });
            
            return oEMPFeature;
        },
        getCenterPT: function(oPt1, oPt2)
        {
            var dDist = oPt1.distanceTo(oPt2);
            var dBearing = oPt1.bearingTo(oPt2);
            
            return oPt1.destinationPoint(dBearing, dDist / 2.0);
        },
        getCP: function(iCPIndex)
        {
            var oCPList = this.options.oControlPointList;
            
            for (var iIndex = 0; iIndex < oCPList.length; iIndex++)
            {
                if (oCPList[iIndex].getIndex() === iCPIndex)
                {
                    return oCPList[iIndex];
                }
            }
            
            return undefined;
        },
        doAddControlPoint: function(oLatLng)
        {
            return undefined;
        },
        doDeleteControlPoint: function(oCP)
        {
            return false;
        },
        doControlPointMoved: function(oCP, oEvent)
        {
            return undefined;
        },
        doFeatureMove: function(dBearing, dDistance)
        {
            return false;
        },
        getState: function()
        {
            return this.options.editorState;
        },
        isIdle: function()
        {
            return (this.getState() === leafLet.editor.StateType.IDLE);
        },
        isAddingCP: function()
        {
            return (this.getState() === leafLet.editor.StateType.ADDING_CP);
        },
        isDeletingCP: function()
        {
            return (this.getState() === leafLet.editor.StateType.DELETE_CP);
        },
        isDraggingCP: function()
        {
            return (this.getState() === leafLet.editor.StateType.DRAGGING_CP);
        },
        isDraggingFeature: function()
        {
            return (this.getState() === leafLet.editor.StateType.FEATURE_DRAG);
        },
        _setState: function(eState) {
            this.options.editorState = eState;
        },
        isCPAddEvent: function(oEvent)
        {
            // An add is a mouse Click
            // with the left button with no Alt, shift nor ctrl keys press.
            // And it can't occure on a control point.
            if (this.isIdle() &&
                (oEvent.originalEvent.button === 0) &&
                !oEvent.originalEvent.altKey &&
                !oEvent.originalEvent.ctrlKey &&
                !oEvent.originalEvent.shiftkey)
            {
                if (oEvent.type === 'click')
                {
                    if (!(oEvent.target instanceof leafLet.editor.ControlPoint))
                    {
                        return true;
                    }
                }
            }
            return false;
        },
        isCPDeleteEvent: function(oEvent)
        {
            // A  delete is a mouse DblClick
            // with the left button with no Alt, shift nor ctrl keys press.
            // But it must occure on a control point that is not new
            if (this.isIdle() &&
                    (oEvent.originalEvent.button === 0) &&
                    !oEvent.originalEvent.altKey &&
                    !oEvent.originalEvent.ctrlKey &&
                    !oEvent.originalEvent.shiftkey)
            {
                if (oEvent.type === 'dblclick')
                {
                    if ((oEvent.target instanceof leafLet.editor.ControlPoint) &&
                            (oEvent.target.getType() !== leafLet.ControlPoint.Type.NEW_POSITION_CP))
                    {
                        return true;
                    }
                }
            }
            return false;
        },
        isCPDragStartEvent: function(oEvent)
        {
            // A CP drag starts with a mouse down
            // with the left button with no Alt, shift nor ctrl keys press.
            // But it must occure on a control point.
            if (this.isIdle() &&
                    (oEvent.originalEvent.button === 0) &&
                    !oEvent.originalEvent.altKey &&
                    !oEvent.originalEvent.ctrlKey &&
                    !oEvent.originalEvent.shiftkey)
            {
                if (oEvent.type === 'mousedown')
                {
                    if (oEvent.target instanceof leafLet.editor.ControlPoint)
                    {
                        return true;
                    }
                }
            }
            return false;
        },
        isFeatureDragStartEvent: function(oEvent)
        {
            // A CP drag starts with a mouse down
            // with the left button with no Alt, shift nor ctrl keys press.
            // But it must occure on a control point.
            if (this.isIdle() &&
                    (oEvent.originalEvent.button === 0) &&
                    !oEvent.originalEvent.altKey &&
                    !oEvent.originalEvent.ctrlKey &&
                    !oEvent.originalEvent.shiftkey)
            {
                if (oEvent.type === 'mousedown')
                {
                    if (!(oEvent.target instanceof leafLet.editor.ControlPoint))// &&
//                            ((oEvent.target === this.getLeafletObject()) ||
//                            (oEvent.target instanceof L.Marker)))
                    {
                        return true;
                    }
                }
            }
            return false;
        },
        onClickEvent: function(oEvent)
        {
//console.log("Got " + oEvent.type);
            if ((this.isCPAddEvent(oEvent)) &&
                (oEvent.latlng instanceof L.LatLng) &&
                !this.options.bCPDragged)
            {
                this._setState(leafLet.editor.StateType.ADDING_CP);

                var oCP = this.doAddControlPoint(oEvent.latlng.wrap());
                if (oCP)
                {
                    this.updateCPIndex(oCP.getIndex(), 1);
                    this.addControlPoint(oCP);
                    this._issueCPAddEvent(oCP.getIndex());
                }
                this._setState(leafLet.editor.StateType.IDLE);
            }
        },
        onDblClick: function(oEvent)
        {
//console.log("Got " + oEvent.type);
            if (this.isCPDeleteEvent(oEvent) &&
                    !this.options.bCPDragged) {
                var oCP = oEvent.target;
                
                this._setState(leafLet.editor.StateType.DELETE_CP);
                if (this.doDeleteControlPoint(oCP))
                {
                    // The editor indicated that the CP can be deleted.
                    this.removeCP(oCP);
                    this.updateCPIndex(oCP.getIndex(), -1);
                    this._issueCPDeleteEvent(oCP.getIndex());
                }
                this._setState(leafLet.editor.StateType.IDLE);
            }
        },
        onCPMouseUpEvent: function(oEvent)
        {
//console.log("Got CP " + oEvent.type);
            if (this.isDraggingCP())
            {
                var oCP = this.options.oCurrentCP;

                if (typeof (oEvent.originalEvent.target.releaseCapture) === 'function')
                {
                    oEvent.originalEvent.target.releaseCapture();
                }
                this.getLeafletMap().off('mousemove', this.onCPMouseMoveEvent, this);
                this.getLeafletMap().off('mouseup', this.onCPMouseUpEvent, this);
                this.getLeafletMap().dragging.enable();
                oCP.hidePopup();
                this._setState(leafLet.editor.StateType.IDLE);
                this.options.oCurrentCP = undefined;
                this._issueCPUpdateEvent(this.options.updateIndex, emp.typeLibrary.UpdateEventType.UPDATE);
                if (typeof (oEvent.originalEvent.stopPropagation) === 'function') {
                    oEvent.originalEvent.stopPropagation();
                }
                if (typeof (oEvent.originalEvent.preventDefault) === 'function') {
                    oEvent.originalEvent.preventDefault();
                }
            }
        },
        onCPMouseMoveEvent: function(oEvent)
        {
//console.log("Got CP " + oEvent.type);
            var aiIndex;
            
            if (this.isDraggingCP()) {
                var oCP = this.options.oCurrentCP;
                this.options.bCPDragged = true;
                aiIndex = this.doControlPointMoved(oCP, oEvent);

                if (aiIndex instanceof Array) {
                    oCP.updatePopup();
                }
                this.options.updateIndex = aiIndex;
            }
        },
        onCPMouseDown: function(oEvent)
        {
//console.log("Got CP " + oEvent.type);
            if (this.isCPDragStartEvent(oEvent)) {
                this.options.bCPDragged = false;
                var iIndex = this.options.oControlPointList.indexOf(oEvent.target);
                
                if (iIndex !== -1) {
                    var oCP = this.options.oControlPointList[iIndex];

                    oCP.showPopup();
                    this._setState(leafLet.editor.StateType.DRAGGING_CP);
                    this.options.oCurrentCP = oCP;
                    this.getLeafletMap().dragging.disable();
                    this.getLeafletMap().on('mousemove', this.onCPMouseMoveEvent, this);
                    if (typeof (oEvent.originalEvent.target.setCapture) === 'function') {
                        oEvent.originalEvent.target.setCapture();
                    }
                    this.getLeafletMap().on('mouseup', this.onCPMouseUpEvent, this);
                }
            }
        },
        onFeatureMouseUpEvent: function(oEvent)
        {
//console.log("Got Feature " + oEvent.type);
            if (this.isDraggingFeature())
            {
                var oCPList = this.options.oControlPointList;

                for (var iIndex = 0; iIndex < oCPList.length; iIndex++)
                {
                    if (oCPList[iIndex].getType() === leafLet.ControlPoint.Type.POSITION_CP)
                    {
                        oCPList[iIndex].hidePopup();
                    }
                }
                
                if (typeof (oEvent.originalEvent.target.releaseCapture) === 'function')
                {
                    oEvent.originalEvent.target.releaseCapture();
                }
                this.getLeafletMap().off('mousemove', this.onFeatureMouseMoveEvent, this);
                this.getLeafletMap().dragging.enable();
                this._setState(leafLet.editor.StateType.IDLE);
                this._issueCPUpdateEvent(this.options.updateIndex, emp.typeLibrary.UpdateEventType.UPDATE);
            }
        },
        onFeatureMouseMoveEvent: function(oEvent)
        {
//console.log("Got Feature " + oEvent.type);
            var aiIndex;
            
            if (this.isDraggingCP())
            {
                var oCP = this.options.oCurrentCP;
                var oOrgLL = oEvent.latlng;
                var oEventCoord = oOrgLL.wrap();
                
                oEvent.latlng = oEventCoord;
                aiIndex = this.doControlPointMoved(oCP, oEvent);
                oEvent.latlng = oOrgLL;

                if (aiIndex instanceof Array)
                {
                    oCP.updatePopup();
                }
                this.options.updateIndex = aiIndex;
            }
            else if (this.isDraggingFeature())
            {
                var oEventCoord = oEvent.latlng.wrap();
                var dBearing = this.options.featureStartLocation.bearingTo(oEventCoord);
                var dDistance = this.options.featureStartLocation.distanceTo(oEventCoord);
                
                if (this.doFeatureMove(dBearing, dDistance))
                {
                    var oCPList = this.options.oControlPointList;
                    
                    aiIndex = [];
                    for (var iIndex = 0; iIndex < oCPList.length; iIndex++)
                    {
                        if (oCPList[iIndex].getType() === leafLet.ControlPoint.Type.POSITION_CP)
                        {
                            aiIndex.push(oCPList[iIndex].getIndex());
                            oCPList[iIndex].updatePopup();
                        }
                    }
                    this.options.featureStartLocation = oEvent.latlng;
                    this.options.updateIndex = aiIndex;
                }
            }
        },
        onFeatureMouseDown: function(oEvent)
        {
//console.log("Got Feature " + oEvent.type);
            if (this.isFeatureDragStartEvent(oEvent))
            {
                var oCPList = this.options.oControlPointList;

                for (var iIndex = 0; iIndex < oCPList.length; iIndex++)
                {
                    if (oCPList[iIndex].getType() === leafLet.ControlPoint.Type.POSITION_CP)
                    {
                        oCPList[iIndex].showPopup();
                    }
                }
                
                this.options.featureStartLocation = oEvent.latlng;
                this._setState(leafLet.editor.StateType.FEATURE_DRAG);

                this.getLeafletMap().dragging.disable();
                this.getLeafletMap().on('mousemove', this.onFeatureMouseMoveEvent, this);
                if (typeof (oEvent.originalEvent.target.setCapture) === 'function')
                {
                    oEvent.originalEvent.target.setCapture();
                }
            }
        },
        setCPEvents: function(oCP)
        {
            oCP.on('dblclick', this.onDblClick, this);
            oCP.on('mousedown', this.onCPMouseDown, this);
            //oCP.on('mouseup', this.onCPMouseUpEvent, this);
        },
        removeCPEvents: function(oCP)
        {
            oCP.off('dblclick', this.onDblClick, this);
            oCP.off('mousedown', this.onCPMouseDown, this);
            //oCP.off('mouseup', this.onCPMouseUpEvent, this);
        },
        addControlPoint: function(oCP)
        {
            this.options.oControlPointList.push(oCP);
            this.addLayer(oCP);
            this.setCPEvents(oCP);
            oCP.bringToFront();
            oCP.setParent(this);
        },
        bringCPForward: function()
        {
            var oCPList = this.options.oControlPointList;
            
            this.bringToFront();
            for (var iIndex = 0; iIndex < oCPList.length; iIndex++)
            {
                oCPList[iIndex].bringToFront();
            }
        },
        removeCP: function(oCP)
        {
            var iIndex = this.options.oControlPointList.indexOf(oCP);

            if (iIndex > -1)
            {
                this.removeCPEvents(oCP);
                this.removeLayer(oCP);
                this.options.oControlPointList.splice(iIndex, 1);
            }
        },
        removeAllCPByType: function(type)
        {
            var oCPList = this.options.oControlPointList;
            
            for (var iIndex = 0; iIndex < oCPList.length;)
            {
                if (oCPList[iIndex].getType() === type)
                {
                    this.removeCP(oCPList[iIndex]);
                }
                else
                {
                    iIndex++;
                }
            }
        },
        getCoordinateList: function()
        {
            throw new Error("getCoordinateList function nor impletmented in editor.");
        },
        updateCPIndex: function(iStartIndex, iDelta)
        {
            var oCPList = this.options.oControlPointList;

            for (var iIndex = 0; iIndex < oCPList.length; iIndex++)
            {
                if ((oCPList[iIndex].getType() === leafLet.ControlPoint.Type.POSITION_CP) &&
                        (oCPList[iIndex].getIndex() >= iStartIndex))
                {
                    oCPList[iIndex].setIndex(oCPList[iIndex].getIndex() + iDelta);
                }
            }
        },
        convertToUpdateCoordinates: function(oCoordList)
        {
            var oUpdateCoordList = [];
            
            for (var iIndex = 0; iIndex < oCoordList.length; iIndex++)
            {
                if (!isNaN(oCoordList[iIndex].alt))
                {
                    oUpdateCoordList.push({
                        lat: oCoordList[iIndex].lat,
                        lon: oCoordList[iIndex].lng,
                        alt: oCoordList[iIndex].alt
                    });
                }
                else
                {
                    oUpdateCoordList.push({
                        lat: oCoordList[iIndex].lat,
                        lon: oCoordList[iIndex].lng
                    });
                }
            }
            
            return oUpdateCoordList;
        },
        _issueStartEvent: function()
        {
            if (this.isDrawMode())
            {
                this.getEngineInstanceInterface().empMapInstance.eventing.DrawStart({transaction: this.options.oTransaction});
            }
            else
            {
                // Else it an edit.
                this.getEngineInstanceInterface().empMapInstance.eventing.EditStart({transaction: this.options.oTransaction});
            }
            this._issueCPUpdateEvent([], emp.typeLibrary.UpdateEventType.START);
            this._issueCPUpdateEvent([], emp.typeLibrary.UpdateEventType.UPDATE);
        },
        _issueCPUpdateEvent: function(oIndexArray, updateEventType)
        {
            var oFeature = this.getFeature();
            var oCoordList = this.getCoordinateList();
            var oUpdateCoordList = this.convertToUpdateCoordinates(oCoordList);
            
            var oUpdateEvent = {
                name: oFeature.getName(),
                plotFeature: this.createEMPFeature(),
                updates:{
                    type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                    indices: oIndexArray,
                    coordinates: oUpdateCoordList
                },
                properties: oFeature.getProperties(),
                updateEventType: updateEventType,
                mapInstanceId: this.getEngineInstanceInterface().empMapInstance.mapInstanceId
            };
            
            this.options.oEmpDrawEditItem.update(oUpdateEvent);
        },
        _issueCPAddEvent: function(iIndex)
        {
            var oFeature = this.getFeature();
            var oCoordList = this.getCoordinateList();
            var oUpdateCoordList = this.convertToUpdateCoordinates(oCoordList);
            
            var oUpdateEvent = {
                name: oFeature.getName(),
                plotFeature: this.createEMPFeature(),
                updates:{
                    type: emp.typeLibrary.CoordinateUpdateType.ADD,
                    indices: [iIndex],
                    coordinates: oUpdateCoordList
                },
                properties: oFeature.getProperties(),
                updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                mapInstanceId: this.getEngineInstanceInterface().empMapInstance.mapInstanceId
            };
            
            this.options.oEmpDrawEditItem.update(oUpdateEvent);
        },
        _issueCPDeleteEvent: function(iIndex)
        {
            var oFeature = this.getFeature();
            var oCoordList = this.getCoordinateList();
            var oUpdateCoordList = this.convertToUpdateCoordinates(oCoordList);
            
            var oUpdateEvent = {
                name: oFeature.getName(),
                plotFeature: this.createEMPFeature(),
                updates:{
                    type: emp.typeLibrary.CoordinateUpdateType.REMOVE,
                    indices: [iIndex],
                    coordinates: oUpdateCoordList
                },
                properties: oFeature.getProperties(),
                updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                mapInstanceId: this.getEngineInstanceInterface().empMapInstance.mapInstanceId
            };
            
            this.options.oEmpDrawEditItem.update(oUpdateEvent);
        },
        _issueEndEvent: function()
        {
            if (this.isDrawMode())
            {
                this.options.oEmpDrawEditItem.plotFeature = this.createEMPFeature();
                this._issueCPUpdateEvent([], emp.typeLibrary.UpdateEventType.COMPLETE);
                this.getEngineInstanceInterface().empMapInstance.eventing.DrawEnd({transaction: this.options.oTransaction});
            }
            else
            {
                // Else it an edit.
                this._issueCPUpdateEvent([], emp.typeLibrary.UpdateEventType.COMPLETE);
                // We need to update the feature.
                this.getEngineInstanceInterface().empMapInstance.eventing.EditEnd({transaction: this.options.oTransaction});
            }
        },
        _issueCancelEvent: function()
        {
            var oErrArray = [];

            oErrArray.push({
                coreId: this.options.oEmpDrawEditItem.coreId,
                message: "Operation canceled.",
                level: 0
            });

            if (this.isDrawMode())
            {
                this.getEngineInstanceInterface().empMapInstance.eventing.DrawEnd({
                    transaction: this.options.oTransaction,
                    failures: oErrArray
                });
            }
            else
            {
                // Else it an edit.
                this.getEngineInstanceInterface().empMapInstance.eventing.EditEnd({
                    transaction: this.options.oTransaction,
                    failures: oErrArray
                });
            }
        },
        endEdit: function()
        {
            this._issueEndEvent();
            this.getFeature().resetEditMode();
            this.removeLeafletObjectEvents();
        },
        cancelEdit: function()
        {
            this._issueCancelEvent();
            this.getFeature().resetEditMode();
            this.removeLeafletObjectEvents();
        },
        updateLeafletObject: function()
        {
            var oFeature = this.getFeature();
            var oMapBounds = this.getLeafletMap().getBounds();
            
            oFeature.updateCoordinates(oMapBounds);
        },
        render: function()
        {
            this.updateLeafletObject();
            this.removeAllControlPoints();
            this.assembleControlPoints();
        }
    };

    return publicInterface;
};

leafLet.editor.AbstractEditor = L.FeatureGroup.extend(leafLet.internalPrivateClass.AbstractEditor());
