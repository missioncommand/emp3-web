
/* global L, leafLet, emp */

leafLet.internalPrivateClass.Feature = function () {
    var publicInterface = {
        initialize: function (args) {
            var options = {
                objectType: leafLet.typeLibrary.objectType.FEATURE,
                featureId: args.item.featureId,
                overlayId: args.item.overlayId,
                parentId: args.item.parentId,
                format: args.item.format,
                url: args.item.url,
                data: (args.item.data ? emp.helpers.copyObject(args.item.data) : undefined),
                properties: (args.item.properties ? emp.helpers.copyObject(args.item.properties) : {}),
                azimuth: ((args.item.properties && args.item.properties.azimuth) ? args.item.properties.azimuth: 0),
                labelStyle: ((args.item.properties && args.item.properties.labelStyle) ? args.item.properties.labelStyle: args.instanceInterface.defaultLabelStyle),
                selected: false,
                bEditable: true,
                isEditMode: false,
                originalStyle: {} // Used to store the style of the feature before highlighting.
            };
            L.Util.setOptions(this, options);

            leafLet.typeLibrary.DisplayableObject.prototype.initialize.call(this, args);

            this.setLeafletObject(this._createFeature(this.options));

            this.on('click', function (oEvent) {
                if (oEvent.target.getEngineInstanceInterface()) {
                    oEvent.target.getEngineInstanceInterface().handleFeatureClicked(oEvent);
                }
            }, this);

            this.on('contextmenu', function (oEvent) {
                if (oEvent.target.getEngineInstanceInterface()) {
                    oEvent.target.getEngineInstanceInterface().handleFeatureClicked(oEvent);
                }
            }, this);
        },
        destroy: function () {
            this.getEngineInstanceInterface().oSelectionManager.removeFeature(this);
            leafLet.typeLibrary.DisplayableObject.prototype.destroy.call(this);
        },
        getAzimuth: function() {
            return this.options.azimuth;
        },
        getLabelStyle: function() {
            return this.options.labelStyle;
        },
        isInEditMode: function () {
            return this.options.isEditMode;
        },
        setEditMode: function () {
            this.options.isEditMode = true;
            if (this.isSelected()) {
                this.render();
                //this._unSelectFeature(this.getLeafletObject());
            }
        },
        resetEditMode: function () {
            this.options.isEditMode = false;
            if (this.isSelected()) {
                this.render();
            }
        },
        setLeafletObject: function (oObject) {
            //if (!oObject) {
            //    return;
            //}
            
            if (this.options.leafletObject && (this.options.leafletObject !== oObject)) {
                //this.options.leafletObject.clearAllEventListeners();
                this.removeLayer(this.options.leafletObject);
            }

            if (this.isVisible() && oObject) {
                var oMapBounds = this.getLeafletMap().getBounds();
                this._updateLeafletObject(oMapBounds, oObject, false);

                if (oObject && (this.options.leafletObject !== oObject)) {
                    this.addLayer(oObject);
                }
            }
            this.options.leafletObject = oObject;
        },
        getOverlayId: function () {
            return this.options.overlayId;
        },
        getFeatureId: function () {
            return this.options.featureId;
        },
        getParentId: function () {
            return this.options.parentId;
        },
        getData: function () {
            return this.options.data;
        },
        setData: function (oData) {
            this.options.data = oData;
        },
        getProperties: function () {
            return this.options.properties;
        },
        setProperties: function (oProp) {
            this.options.properties = oProp;
        },
        getFormat: function () {
            return this.options.format;
        },
        isEditable: function () {
            return this.options.bEditable;
        },
        isSelected: function (sSubItemID) {
            var oSelectionManager = this.getEngineInstanceInterface().oSelectionManager;

            return oSelectionManager.isSelected(this, sSubItemID);
        },
        isMilStd: function () {
            return (this.options.format === emp.typeLibrary.featureFormatType.MILSTD);
        },
        isGeoJson: function () {
            return (this.options.format === emp.typeLibrary.featureFormatType.GEOJSON);
        },
        isKML: function () {
            return (this.options.format === emp.typeLibrary.featureFormatType.KML);
        },
        isAirspace: function () {
            return (this.options.format === emp.typeLibrary.featureFormatType.AIRSPACE);
        },
        isImage: function () {
            return (this.options.format === emp.typeLibrary.featureFormatType.IMAGE);
        },
        isAOI: function () {
            return (this instanceof leafLet.typeLibrary.AOIFeature);
        },
        isGeoEllipse: function() {
            return (this instanceof leafLet.typeLibrary.GeoEllipseFeature);
        },
        getFeatureBounds: function () {
            var oBounds = undefined;
            var oLeafletObject = this.getLeafletObject();
            //var oMapBoundary = this.getEngineInstanceInterface().leafletInstance.getBounds();

            if (oLeafletObject) {
                if (typeof (oLeafletObject.getBounds) === 'function') {
                    oBounds = new leafLet.typeLibrary.EmpBoundary(oLeafletObject.getBounds());
                } else if (oLeafletObject instanceof L.Marker) {
                    oBounds = new leafLet.typeLibrary.EmpBoundary(oLeafletObject.getLatLng().wrap(), oLeafletObject.getLatLng().wrap());
                } else {
                    throw new Error("Unable to get bounds of leaflet type.");
                }
            }

            return oBounds;
        },
        _createFeature: function (args) {
            throw new Error("Class for feature of type " + args.format + " has not implemented a _createFeature function.");
        },
        getAngleUnits: function () {
            return leafLet.utils.AngleUnits.DEGREES;
        },
        getAzimuthUnits: function () {
            return leafLet.utils.AngleUnits.DEGREES;
        },
        getAltitudeUnits: function () {
            var sText = leafLet.utils.Units.FEET;

            switch (this.options.format) {
                case emp.typeLibrary.featureFormatType.GEOJSON:
                case emp.typeLibrary.featureFormatType.AIRSPACE:
                    sText = leafLet.utils.Units.METERS;
                    break;
                case emp.typeLibrary.featureFormatType.MILSTD:
                    if (this.options.oMilStdModifiers.SYMSTD === 0) {
                        sText = leafLet.utils.Units.FEET;
                    } else {
                        sText = leafLet.utils.Units.METERS;
                    }
                    break;
                case emp.typeLibrary.featureFormatType.KML:
                case emp.typeLibrary.featureFormatType.IMAGE:
                    break;
                default:
                    // All Geo Spatial features are meters.
                    sText = leafLet.utils.Units.METERS;
                    break;
            }

            return sText;
        },
        getUnits: function () {
            return leafLet.utils.Units.FEET;
        },
        getAltitudeModeAbbr: function () {
            return leafLet.utils.AltitudeModeAbbr(this.options.properties.altitudeMode);
        },
        _getAltUnitsAndModeText: function () {
            var sText = this.getAltitudeUnits();
            var aAltMode = this.getAltitudeModeAbbr();

            if (sText.length === 0) {
                return "";
            }

            if (aAltMode.length > 0) {
                sText += " " + aAltMode;
            }

            return sText;
        },
        _getPopupDescription: function () {
            var sDescription = this.options.properties.description;

            if (sDescription && (sDescription !== "")) {
                //sDescription = "<b>Description</b>:&nbsp;" + sDescription + "<br/>";
            } else {
                sDescription = "";
            }

            return sDescription;
        },
        getPopupHeading: function () {
            // Each feature class can override this function.
            if (!this.options.name || (typeof (this.options.name) !== 'string') || (this.options.name === "")) {
                return "";
            }
            return this.options.name;
        },
        getPopupText: function () {
            // Each feature class can override this function.
            return this._getPopupDescription();
        },
        updateFeature: function (args) {
            var oNewLeafletObject;
            var oArgs = {};
            var oCoreFeature = args || {};

            if (args.hasOwnProperty('bUpdateGraphic')) {
                oArgs.bUpdateGraphic = args.bUpdateGraphic;
            }

            if (oCoreFeature.hasOwnProperty('format') && (oCoreFeature.format !== this.options.format)) {
                throw new Error("A " + this.options.format + " feature can not be updated to a " + oCoreFeature.format + ".");
            }

            if (oCoreFeature.hasOwnProperty('name') && (oCoreFeature.name !== this.options.name)) {
                oArgs.name = oCoreFeature.name;
            } else {
                oArgs.name = this.options.name;
            }

            if (oCoreFeature.hasOwnProperty('url') && (oCoreFeature.url !== this.options.url)) {
                oArgs.url = oCoreFeature.url;
            } else {
                oArgs.url = this.options.url;
            }

            if (oCoreFeature.hasOwnProperty('data')) {
                oArgs.data = emp.helpers.copyObject(oCoreFeature.data);
            } else {
                oArgs.data = this.options.data;
            }

            if (oCoreFeature.hasOwnProperty('properties')) {
                oArgs.properties = emp.helpers.copyObject(oCoreFeature.properties);
                if (oArgs.properties.lineColor !== this.getProperties().lineColor) {
                    oArgs.bUpdateGraphic = true;
                } else if (oArgs.properties.fillColor !== this.getProperties().fillColor) {
                    oArgs.bUpdateGraphic = true;
                }
            } else {
                oArgs.properties = this.options.properties;
            }

            oArgs.leafletObject = this.options.leafletObject;
            //oArgs.instanceInterface = this.getEngineInstanceInterface();
            oArgs.bEditable = this.options.bEditable;

            oNewLeafletObject = this._updateFeature(oArgs);

            this.setLeafletObject(oNewLeafletObject);

            //this.options.featureId = oCoreFeature.featureId;
            //this.options.overlayId = oCoreFeature.overlayId;
            //this.options.parentId = oCoreFeature.parentId;
            this.options.url = oArgs.url;
            this.options.data = oArgs.data;
            this.options.properties = oArgs.properties;
            this.options.bEditable = oArgs.bEditable;
            if (oCoreFeature.hasOwnProperty('name') && (oCoreFeature.name !== this.options.name)) {
                this.setName(oArgs.name);
            }
        },
        setSelection: function (bValue) {
            if (bValue === this.options.selected) {
                return;
            }

            this.options.selected = bValue;
            if (!this.isInEditMode()) {
                this.render();
            }
        },
        render: function () {
        },
        _updateLeafletObject: function (oMapBounds, oLeafletObject, bWrappedAlready, iLevel) {
            var oLatLngList;
            var oNewLatLngList;
            var bCoordWrapped = bWrappedAlready;
            var iCurrentLevel = iLevel || 0;

            if (!oLeafletObject) {
                return bCoordWrapped;
            }

            if ((oLeafletObject instanceof L.Marker) ||
                    (oLeafletObject instanceof L.Popup)) {
                if (oLeafletObject.getLatLng()) {
                    oLatLngList = [oLeafletObject.getLatLng()];
                    bCoordWrapped = leafLet.utils.wrapCoordinates(oMapBounds, oLatLngList, bCoordWrapped);
                    oLeafletObject.setLatLng(oLatLngList[0]);
                }
            } else if (oLeafletObject instanceof L.Polygon) {
                oLatLngList = oLeafletObject.getLatLngs();

                if (oLatLngList[0] && (oLatLngList[0][0] instanceof Array)) {
                    for (var iList = 0; iList < oLatLngList.length; iList++) {
                        bCoordWrapped = bCoordWrapped || leafLet.utils.wrapCoordinates(oMapBounds, oLatLngList[iIndex], bCoordWrapped);
                    }
                } else if (oLatLngList.length > 0) {
                    bCoordWrapped = leafLet.utils.wrapCoordinates(oMapBounds, oLatLngList, bCoordWrapped);
                }

                if (bCoordWrapped) {
                    oLeafletObject.setLatLngs(oLatLngList);
                }
            } else if (oLeafletObject instanceof L.Polyline) {
                oNewLatLngList = [];
                oLatLngList = oLeafletObject.getLatLngs();

                if (oLatLngList.length > 0) {
                    bCoordWrapped = leafLet.utils.wrapCoordinates(oMapBounds, oLatLngList, bCoordWrapped);
                }

                if (bCoordWrapped) {
                    oLeafletObject.setLatLngs(oLatLngList);
                }
            } else if (oLeafletObject instanceof L.LayerGroup) {
                var oItemList = oLeafletObject.getLayers();
                var bHasNotWrapped = !bCoordWrapped;

                for (var iIndex = 0; iIndex < oItemList.length; iIndex++) {
                    bCoordWrapped = this._updateLeafletObject(oMapBounds, oItemList[iIndex], bCoordWrapped, iCurrentLevel + 1);
                    if (bCoordWrapped && bHasNotWrapped) {
                        bHasNotWrapped = false;
                        if (iCurrentLevel === 0) {
                            // We need the loop to start again.
                            iIndex = -1;
                        } else {
                            // We need to break out so the top iteration starts over.
                            break;
                            ;
                        }
                    }
                }
            }

            return bCoordWrapped;
        },
        updateCoordinates: function (oMapBounds) {
            if (this.isVisible()) {
                // We only update coordinates to the visible.
                this._updateLeafletObject(oMapBounds, this.getLeafletObject(), false);
            }
        },
        getLineStyle: function (sEMPStyle) {

            var sLeaftletStyle;

            switch (sEMPStyle) {
                case emp.typeLibrary.OutlineStyleType.DOT:
                    sLeaftletStyle = "1, 5";
                    break;
                case emp.typeLibrary.OutlineStyleType.DASH:
                    sLeaftletStyle = "10, 5";
                    break;
                case emp.typeLibrary.OutlineStyleType.DASH_DOT:
                    sLeaftletStyle = "10, 5, 1, 5";
                    break;
                case emp.typeLibrary.OutlineStyleType.LONG_DASH:
                    sLeaftletStyle = "20, 5";
                    break;
                case emp.typeLibrary.OutlineStyleType.LONG_DASH_DOT:
                    sLeaftletStyle = "20, 5, 1, 5";
                    break;
                case emp.typeLibrary.OutlineStyleType.SOLID:
                default:
                    break;
            }

            return sLeaftletStyle;
        },
        setFeatureStyle: function (sType, oProperties) {
            switch (this.getFormat()) {
                case emp.typeLibrary.featureFormatType.KML:
                case emp.typeLibrary.featureFormatType.GEOJSON:
                    this.setFeatureStyleProperties(sType, oProperties);
                    break;
                default:
                    break;
            }
        },
        _propagateEvent: function (e) {
            if (e.target instanceof leafLet.typeLibrary.Feature) {
                // If its a feature don't propagate.
                return;
            }

            e = L.extend({
                layer: e.target,
                target: this
            }, e);
            this.fire(e.type, e);
        },
        _getPolygonProperties: function(args) {
            var argsProperties = leafLet.utils.geoJson.mergeGeoJSONProperties(this.getEngineInstanceInterface(), args.properties);
            var oProperties = {
                smoothFactor: 1.0,
                noClip: false,
                oFeature: this
            };
            var strokeColor = (argsProperties.color? argsProperties.color: undefined);
            var fillColor = (argsProperties.fillColor? argsProperties.fillColor: undefined);

            // If they are both missing set the default stroke.
            if ((strokeColor === undefined) && (fillColor === undefined)) {
                strokeColor = '#' + this.getEngineInstanceInterface().defaultStrokeStyle.color;
            }

            if (strokeColor) {
                oProperties['stroke'] = true;
                oProperties['color'] = strokeColor;
                oProperties['opacity'] = (argsProperties.opacity? argsProperties.opacity: this.getEngineInstanceInterface().defaultStrokeStyle.opacity);
                oProperties['weight'] = (argsProperties.weight? argsProperties.weight: this.getEngineInstanceInterface().defaultStrokeStyle.width);
            } else {
                oProperties['stroke'] = false;
                oProperties['color'] = null;
            }

            if (this.isSelected()) {
                oProperties['tempColor'] = oProperties['color'];
                oProperties['tempWeight'] = oProperties['weight'];
                oProperties['color'] = '#' + this.getEngineInstanceInterface().selectAttributes.color;
                oProperties['weight'] = this.getEngineInstanceInterface().selectAttributes.width;
                oProperties['stroke'] = true;
            }

            if (fillColor) {
                oProperties['fill'] = true;
                oProperties['fillColor'] = fillColor;
                oProperties['fillOpacity'] = (argsProperties.fillOpacity? argsProperties.fillOpacity: 0.8);
            } else {
                oProperties['fill'] = false;
            }

            return oProperties;
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.Feature = leafLet.typeLibrary.DisplayableObject.extend(leafLet.internalPrivateClass.Feature());
