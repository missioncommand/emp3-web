/* global leafLet, L, emp */

leafLet.internalPrivateClass.GeoJsonEditor = function () {
    var publicInterface = {
        initialize: function (args) {
            var oOptions = {
                geoJsonType: (args.geoJsonType ? args.geoJsonType.toLowerCase() : undefined)
            };
            L.Util.setOptions(this, oOptions);

            leafLet.editor.AbstractEditor.prototype.initialize.call(this, args);
        },
        preapareForDrawOperation: function () {
            if (this.getFeature() === undefined) {
                var oGeoJsonData = {
                    type: 'Point',
                    coordinates: []
                };

                switch (this.options.geoJsonType) {
                    case 'point':
                        oGeoJsonData = {
                            type: 'Point',
                            coordinates: []
                        };
                        break;
                    case 'linestring':
                        oGeoJsonData = {
                            type: 'LineString',
                            coordinates: []
                        };
                        break;
                    case 'polygon':
                        oGeoJsonData = {
                            type: 'Polygon',
                            coordinates: [[]]
                        };
                        break;
                }

                this.options.feature = new leafLet.typeLibrary.GeoJsonFeature({
                    item: {
                        name: this.options.oEmpDrawEditItem.name,
                        coreId: this.options.oEmpDrawEditItem.coreId,
                        parentCoreId: this.options.oEmpDrawEditItem.parentCoreId,
                        visible: true,
                        featureId: this.options.oEmpDrawEditItem.featureId,
                        overlayId: this.options.oEmpDrawEditItem.overlayId,
                        parentId: this.options.oEmpDrawEditItem.parentId,
                        format: emp.typeLibrary.featureFormatType.GEOJSON,
                        data: oGeoJsonData,
                        properties: this.options.oEmpDrawEditItem.properties
                    },
                    instanceInterface: this.getEngineInstanceInterface()
                });
                this.addLayer(this.options.feature);
                this.options.bDestroyFeature = true;
            }
        },
        preapareForEditOperation: function () {
        },
        getCoordinateList: function () {
            return leafLet.utils.geoJson.convertCoordinatesToLatLng(this.getFeature().getData());
        },
        setCoordinates: function (oLatLngList) {
            leafLet.utils.geoJson.convertLatLngListToGeoJson(this.getFeature().getData(), oLatLngList);
        },
        _addNewCP: function () {
            var oCP;
            var oNewCoord;
            var iIndex;
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();

            if (oCoordList.length === 0) {
                return;
            }

            switch (oFeature.getGeometryType().toLowerCase()) {
                case 'point':
                    break;
                case 'linestring':
                    for (iIndex = 1; iIndex < oCoordList.length; iIndex++) {
                        // Lets add the new CP.
                        oNewCoord = oCoordList[iIndex - 1].midPointTo(oCoordList[iIndex]);
                        oCP = new leafLet.editor.ControlPoint(oFeature,
                                leafLet.ControlPoint.Type.NEW_POSITION_CP,
                                oNewCoord, iIndex, 0);
                        this.addControlPoint(oCP);
                    }
                    break;
                case 'polygon':
                    if (oCoordList.length > 2) {
                        for (iIndex = 1; iIndex < oCoordList.length; iIndex++) {
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
                    break;
            }
        },
        assembleControlPoints: function () {
            var oCP;
            var iIndex;
            var oCoordList = this.getCoordinateList();
            var oFeature = this.getFeature();

            if (oCoordList.length === 0) {
                return;
            }

            switch (this.getFeature().getGeometryType().toLowerCase()) {
                case 'point':
                    break;
                case 'linestring':
                case 'polygon':
                    for (iIndex = 0; iIndex < oCoordList.length; iIndex++) {
                        oCP = new leafLet.editor.ControlPoint(oFeature,
                                leafLet.ControlPoint.Type.POSITION_CP,
                                oCoordList[iIndex], iIndex, 0);
                        this.addControlPoint(oCP);
                    }
                    break;
            }

            this._addNewCP();
        },
        _createLeafletObject: function () {
            var oLeafletObject;
            var oCoordList = this.getCoordinateList();
            var oProperties = leafLet.utils.geoJson.mergeGeoJSONProperties(this.options.instanceInterface, this.options.oEmpDrawEditItem.properties);

            switch (this.getFeature().getGeometryType().toLowerCase()) {
                case 'point':

                    if (oCoordList.length > 0) {
                        oProperties.iconOptions.basePath = this.getEngineInstanceInterface().getBasePath();
                        oProperties.icon = new leafLet.typeLibrary.EmpIcon(oProperties.iconOptions);
                        oLeafletObject = new L.Marker(oCoordList[0], oProperties);
                        this.setCPEvents(oLeafletObject);
                    }
                    break;
                case 'linestring':
                    if (oCoordList.length > 1) {
                        oLeafletObject = new L.Polyline(oCoordList, oProperties);
                    }
                    break;
                case 'polygon':
                    if (oCoordList.length > 2) {
                        oLeafletObject = new L.Polygon(oCoordList, oProperties);
                    }
                    break;
            }

            if (oLeafletObject) {
                this.setLeafletObject(oLeafletObject);
            }
        },
        updateLeafletObject: function () {
            var oLeafletObject = this.getLeafletObject();

            if (oLeafletObject === undefined) {
                this._createLeafletObject();
            } else {
                var oCoordList = this.getCoordinateList();
                switch (this.getFeature().getGeometryType().toLowerCase()) {
                    case 'point':
                        oLeafletObject.setLatLng(oCoordList[0]);
                        break;
                    case 'linestring':
                    case 'polygon':
                        oLeafletObject.setLatLngs(oCoordList);
                        break;
                }
                leafLet.editor.AbstractEditor.prototype.updateLeafletObject.call(this);
            }
        },
        doAddControlPoint: function (oLatLng) {
            var oCP;
            var oCoordList = this.getCoordinateList();

            switch (this.getFeature().getGeometryType().toLowerCase()) {
                case 'point':
                    if (oCoordList.length > 0) {
                        oCoordList[0].lat = oLatLng.lat;
                        oCoordList[0].lng = oLatLng.lng;
                    } else {
                        oCoordList.push(oLatLng);
                    }
                    break;
                case 'linestring':
                    oCP = new leafLet.editor.ControlPoint(this.getFeature(),
                            leafLet.ControlPoint.Type.POSITION_CP,
                            oLatLng, oCoordList.length, 0);
                    oCoordList.push(oLatLng);
                    break;
                case 'polygon':
                    oCP = new leafLet.editor.ControlPoint(this.getFeature(),
                            leafLet.ControlPoint.Type.POSITION_CP,
                            oLatLng, oCoordList.length, 0);
                    oCoordList.push(oLatLng);
                    break;
            }

            this.setCoordinates(oCoordList);
            this.updateLeafletObject();
            this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
            this._addNewCP();

            return oCP;
        },
        doDeleteControlPoint: function (oCP) {
            var bRet = false;
            var oCoordList = this.getCoordinateList();
            var iIndex = oCP.getIndex();

            if (oCP.getType() !== leafLet.ControlPoint.Type.POSITION_CP) {
                return false;
            }

            switch (this.getFeature().getGeometryType().toLowerCase()) {
                case 'point':
                    break;
                case 'linestring':
                    if (oCoordList.length > 2) {
                        oCoordList.splice(iIndex, 1);
                        bRet = true;
                    }
                    break;
                case 'polygon':
                    if (oCoordList.length > 3) {
                        oCoordList.splice(iIndex, 1);
                        bRet = true;
                    }
                    break;
            }

            if (bRet) {
                this.setCoordinates(oCoordList);
                this.updateLeafletObject();
                this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
                this._addNewCP();
            }
            return bRet;
        },
        doControlPointMoved: function (oCP, oEvent) {
            var iIndex = oCP.getIndex();
            var oCoordList = this.getCoordinateList();

            switch (oCP.getType()) {
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
                    break;
                case leafLet.ControlPoint.Type.POSITION_CP:
                    // We need to update the position od the control point
                    // and the new control points beore and after it..
                    oCoordList[iIndex].lat = oEvent.latlng.lat;
                    oCoordList[iIndex].lng = oEvent.latlng.lng;
                    this.setCoordinates(oCoordList);
                    oCP.setCPPosition(oCoordList[iIndex]);
                    break;
            }
            this.updateLeafletObject();
            this.removeAllCPByType(leafLet.ControlPoint.Type.NEW_POSITION_CP);
            this._addNewCP();
            return [iIndex];
        },
        doFeatureMove: function (dBearing, dDistance) {
            var oCoordList = this.getCoordinateList();
            var oCPList = this.options.oControlPointList;
            var oCoord;
            var iCoordIndex;

            if (this.getFeature().getGeometryType().toLowerCase() === 'point') {
                oCoordList[0].moveCoordinate(dBearing, dDistance);
            } else {
                for (var iIndex = 0; iIndex < oCPList.length; iIndex++) {
                    iCoordIndex = oCPList[iIndex].getIndex();
                    oCoord = oCPList[iIndex].getPosition();
                    oCoord.moveCoordinate(dBearing, dDistance);
                    oCPList[iIndex].setCPPosition(oCoord);
                    if (oCPList[iIndex].getType() === leafLet.ControlPoint.Type.POSITION_CP) {
                        oCoordList[iCoordIndex] = oCoord;
                    }
                }
            }
            this.setCoordinates(oCoordList);
            this.updateLeafletObject();
            return true;
        }
    };

    return publicInterface;
};

leafLet.editor.GeoJson = leafLet.editor.AbstractEditor.extend(leafLet.internalPrivateClass.GeoJsonEditor());
