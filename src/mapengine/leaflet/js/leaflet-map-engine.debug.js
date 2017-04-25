/*globals emp, L */
/* global L, leafLet, cmapi */

var emp = emp || {};

emp.util.milstdColorFix = function (feature) {
    var oProperties;
    var oModifiers;

    if (feature.hasOwnProperty('format') && (feature.format === emp.typeLibrary.featureFormatType.MILSTD)) {
        oProperties = feature.properties;
        if (oProperties && oProperties.hasOwnProperty('modifiers')) {
            oModifiers = oProperties.modifiers;
            if (oModifiers.hasOwnProperty('lineColor')) {
                oProperties.lineColor = oModifiers.lineColor;
            }
            if (oModifiers.hasOwnProperty('lineWidth')) {
                oProperties.lineWidth = oModifiers.lineWidth;
            }
            if (oModifiers.hasOwnProperty('fillColor')) {
                oProperties.fillColor = oModifiers.fillColor;
            }
        }
    }
};

emp.engineDefs = emp.engineDefs || {};
emp.engineDefs.leafletMapEngine = function (args) {

    // engineInterface is the public object returned to caller
    var engineInterface = emp.map.createEngineTemplate();
    var bounds;
    var selectedGeoColor = new cmapi.IGeoColor({
        red: 0xF0,
        green: 0xF0,
        blue: 0
    });

    var instanceInterface = {
        bIsV2Core: (args.isV2Core === true) || false,
        empMapInstance: args.mapInstance,
        leafletInstance: undefined,
        bUseProxy: args.useProxy,
        useProxyForDefault: args.useProxyForDefault,
        renderingOptimization: {
          enabled: args.renderingOptimization,
          midDistanceThreshold: args.midDistanceThreshold,
          farDistanceThreshold: {
            value: args.farDistanceThreshold,
            RED: 'red',
            BLUE: 'blue',
            GREEN: 'green',
            YELLOW: 'yellow',
            getSVG: function (attributes) {
              return '<svg preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" version="1.1">' +
                       '<circle cx="' + attributes.x + '" cy="' + attributes.y + '" r="' + attributes.radius + '"' +
                       ' fill="' + attributes.color + '" stroke="' + attributes.color + '" stroke-width="1"/>' +
                     '</svg>';
            }
          },
          // This is set to undefined instead of null to account for the case when the map starts at a very low altitude
          // and a mil symbol icon plot occurs without any other event first. If this is already 'null' the zoneChanged
          // boolean in the refreshZone() will not change to true which is needed if the afformentioned plot mil std icon
          // is to be put on the render list in the scheduler.
          viewInZone: undefined,
          zoneChanged: false,
          renderList: {},
          removeFromRenderList: function (key) {
            delete this.renderList[key];
          },
          addToRenderList: function (key, value) {
            return this.renderList[key] = value;
          },
          isOnRenderList: function (key) {
            return this.renderList.hasOwnProperty(key);
          },
          isRenderListEmpty: function () {
            return Object.keys(this.renderList).length === 0;
          },
          getRenderList: function () {
            return this.renderList;
          },
          refreshZone: function () {
            var view = instanceInterface.getView();

            this.zoneChanged = false;
            if (view.altitude >= this.farDistanceThreshold.value) {
              // Mil-std single point icons are shown as an ellipses colored with the corresponding affiliation and
              // labels are turned off.
              if (this.viewInZone !== "farDistanceZone") {
                this.zoneChanged = true;
                this.viewInZone = "farDistanceZone";
              }
            } else if (view.altitude >= this.midDistanceThreshold) {
              // Mil-std single point icons are displayed in normal fashion and labels are turned off.
              if (this.viewInZone !== "midDistanceZone") {
                this.zoneChanged = true;
                this.viewInZone = "midDistanceZone";
              }
            } else {
              // Mil-std single point icons are displayed in normal fashion and the current label setting state is used.
              if (this.viewInZone !== null) {
                this.zoneChanged = true;
                this.viewInZone = null;
              }
            }
          }
        },
        engineParameters: args,
        selectAttributes: {
            color: 'F0F000',
            opacity: 1.0,
            width: 5
        },
        selectLabelStyle: new cmapi.IGeoLabelStyle({
            color: selectedGeoColor,
            size: 12,
            fontFamily: 'Arial'
        }),
        defaultLabelStyle: new cmapi.IGeoLabelStyle({
            color: new cmapi.IGeoColor({
                red: 0,
                green: 0,
                blue: 0
            }),
            fontFamily: 'Arial'
        }),
        defaultStrokeStyle: {
            color: '000000',
            opacity: 1.0,
            width: 3
        },
        sContentCoreId: emp.helpers.id.newGUID(),
        overlays: {},
        tacticalGraphics: {},
        dMaxLabelScale: 10000000,
        rangeToScaleMultiplier: 10.0 / 3.0,
        zoomScaleMap: [
            500000000,
            250000000,
            150000000,
            70000000,
            35000000,
            15000000,
            10000000,
            4000000,
            2000000,
            1000000,
            500000,
            250000,
            150000,
            70000,
            35000,
            15000,
            8000,
            4000,
            2000,
            1000,
            500,
            250,
            125
        ],
        rootOverlayId: undefined,
        rootOverlay: undefined,
        mapEngObjectList: {},
        bInDrawMode: false,
        bInEditMode: false,
        oSelectionManager: undefined,
        oLabelList: [],
        iMilStdIconSize: 24,
        oLayerControl: undefined,
        hTGRenderingTimer: undefined,
        oGraphicsInViewingArea: [],
        oCurrentEditor: undefined,
        oEditTransaction: undefined,
        oTransactionList: {},
        lockState: undefined,
        smartLockPanning: {
          up: false,
          down: false,
          left: false,
          right: false
        },
        setLockState: function (lockState) {
            instanceInterface.lockState = lockState;
        },
        getLockState: function () {
            return instanceInterface.lockState;
        },
        getLeafletMap: function () {
            return instanceInterface.leafletInstance;
        },
        getProxyURL: function () {
            return instanceInterface.engineParameters.empProxyURL;
        },
        getBasePath: function () {
            return instanceInterface.engineParameters.engineBasePath;
        },
        addEmpObject: function (oEmpObject) {
            instanceInterface.mapEngObjectList[oEmpObject.getCoreId()] = oEmpObject;
        },
        removeEmpObject: function (oEmpObject) {
            if (instanceInterface.mapEngObjectList[oEmpObject.getCoreId()] !== undefined) {
                delete instanceInterface.mapEngObjectList[oEmpObject.getCoreId()];
            }
        },
        storeTransaction: function (oTransaction) {
            if (instanceInterface.oTransactionList[oTransaction.transactionId] === undefined) {
                instanceInterface.oTransactionList[oTransaction.transactionId] = oTransaction;
            }
        },
        findTransaction: function (oTranID) {
            return instanceInterface.oTransactionList[oTranID];
        },
        findTransactionByIntent: function (sIntent) {
            var sTranID;
            var oTransaction;
            var aRetList = [];
            var aKeyList = emp.helpers.associativeArray.getKeys(instanceInterface.oTransactionList);

            for (var iIndex = 0; iIndex < aKeyList.length; iIndex++) {
                sTranID = aKeyList[iIndex];
                oTransaction = instanceInterface.oTransactionList[sTranID];

                if (oTransaction.intent === sIntent) {
                    aRetList.push(oTransaction);
                }
            }

            return aRetList;
        },
        removeTransaction: function (oTranID) {
            if (instanceInterface.oTransactionList.hasOwnProperty(oTranID)) {
                delete instanceInterface.oTransactionList[oTranID];
            }
        },
        getEmpObject: function (sCoreId) {
            if (!sCoreId) {
                return rootOverlay;
            }

            return instanceInterface.mapEngObjectList[sCoreId];
        },
        handleFeatureClicked: function (oEvent) {
            var oPointerData = instanceInterface.getView();
            var button = oEvent.originalEvent.button;
            var sSelectedID;

            if ((button === 0) &&
                    !oEvent.originalEvent.altKey &&
                    !oEvent.originalEvent.shiftkey) {
                if (emp.util.config.getAutoSelect()) {
                    if (oEvent.target instanceof leafLet.typeLibrary.Feature) {
                        // Its a feature selection click.

                        if (oEvent.layer && oEvent.layer.options && oEvent.layer.options.sSubItemID) {
                            sSelectedID = oEvent.layer.options.sSubItemID;
                        }

                        if (instanceInterface.oSelectionManager.isSelected(oEvent.target, sSelectedID)) {
                            if (!oEvent.originalEvent.ctrlKey) {
                                // Its a single selection.
                                // We must deselected everything that is selected.
                                instanceInterface.oSelectionManager.deselectAllFeatures();
                            } else {
                                instanceInterface.oSelectionManager.deselectFeature(oEvent.target, sSelectedID);
                            }
                        } else {
                            if (!oEvent.originalEvent.ctrlKey) {
                                // Its a single selection.
                                // We must deselected everything that is selected.
                                instanceInterface.oSelectionManager.deselectAllFeatures();
                            }

                            instanceInterface.oSelectionManager.selectFeature(oEvent.target, sSelectedID);
                        }
                        instanceInterface.oSelectionManager.generateEvent();
                    }
                }

                if (!oEvent.originalEvent.ctrlKey) {
                    if ((oEvent.target instanceof leafLet.typeLibrary.Feature) ||
                            (oEvent.target instanceof L.MarkerCluster)) {
                        oPointerData.popupInfo = {
                            title: oEvent.target.getPopupHeading(oEvent.layer),
                            content: oEvent.target.getPopupText(oEvent.layer)
                        };
                    }
                }
            }

            oPointerData.overlayId = oEvent.target.getOverlayId();
            oPointerData.parentId = oEvent.target.getParentId();
            oPointerData.featureId = oEvent.target.getFeatureId();
            oPointerData.target = "feature";
            instanceInterface.generatePointerEvent(oEvent, oPointerData);
        },
        // Translate a map scale into a zoom level
        getLevel: function (scale) {
            var len = instanceInterface.zoomScaleMap.length,
                    i,
                    level = 0;
            if (scale > instanceInterface.zoomScaleMap[0]) {
                level = 0;
            } else if (scale < instanceInterface.zoomScaleMap[len - 1]) {
                level = len - 1;
            } else {
                for (i = 0; i < len - 1; i++) {
                    if (scale <= instanceInterface.zoomScaleMap[i] && scale > instanceInterface.zoomScaleMap[i + 1]) {
                        level = i;
                        break;
                    } else if (scale < instanceInterface.zoomScaleMap[i] && scale >= instanceInterface.zoomScaleMap[i + 1]) {
                        level = i + 1;
                        break;
                    }
                }
            }
            return level;
        },
        // Translate a zoom level into a map scale
        getScale: function (level) {
            var len = instanceInterface.zoomScaleMap.length,
                    i,
                    scale = instanceInterface.zoomScaleMap[0];
            if (level < 0) {
                scale = instanceInterface.zoomScaleMap[0];
            } else if (level > len - 1) {
                scale = instanceInterface.zoomScaleMap[len - 1];
            } else {
                scale = instanceInterface.zoomScaleMap[level];
            }
            return scale;
        },
        viewToLookAt: function(view) {
            var lookAt = {};

            if (view) {
                lookAt.latitude = view.lat;
                lookAt.longitude = view.lon;
                lookAt.altitude = 0;
                lookAt.tilt = 0;
                lookAt.heading = 0;
                lookAt.range = view.range;
                lookAt.altitudeMode = view.altitudeMode || emp.constant.featureAltitudeModeType.CLAMP_TO_GROUND;
            }

            return lookAt;
        },
        getView: function (oData) {
            var view = oData || {},
                    bounds = instanceInterface.leafletInstance.getBounds(),
                    center = instanceInterface.leafletInstance.getCenter().wrap(),
                    level = instanceInterface.leafletInstance.getZoom();

            leafLet.utils.convertViewBound(bounds, view);

            view.lat = center.lat;
            view.lon = center.lng;

            view.bounds = {
                north: view.north,
                south: view.south,
                east: view.east,
                west: view.west
            };
            view.location = {
                lon: view.lon,
                lat: view.lat
            };
            view.mgrs = emp.geoLibrary.ddToMGRS(view.lat, view.lon);
            // Translate the map zoom level to a map scale
            view.scale = instanceInterface.getScale(level);
            // Convert map scale to camera range
            view.range = view.scale / instanceInterface.rangeToScaleMultiplier;
            view.altitude = view.range;
            view.roll = 0;
            view.tilt = 0;
            view.heading = 0;

            view.altitude = view.range;
            view.tilt = 0;
            view.roll = 0;
            view.heading = 0;

            return view;
        },
        lastMouseDown: false,
        lastMouseUp: false,

        generatePointerEvent: function (oEvent, oData) {
            var button = (oEvent.originalEvent ? oEvent.originalEvent.button : 0),
                pointer = oData || instanceInterface.getView(),
                oLL = oEvent.latlng.wrap();

            pointer.lat = oLL.lat;
            pointer.lon = oLL.lng;
            pointer.elevation = oData.range;

            switch (button) {
                case 0:
                    pointer.button = "left";
                    break;
                case 1:
                    pointer.button = "middle";
                    break;
                case 2:
                    pointer.button = "right";
                    break;
            }

            switch (oEvent.type) {
                case 'click':
                case 'contextmenu':
                    pointer.type = emp.typeLibrary.Pointer.EventType.SINGLE_CLICK;
                    break;
                case 'dblclick':
                    pointer.type = emp.typeLibrary.Pointer.EventType.DBL_CLICK;
                    break;
                case 'mousedown':
                    if (this.lastMouseDown) {
                      return;
                    }
                    this.lastMouseDown = true;
                    this.lastMouseUp = false;
                    pointer.type = emp.typeLibrary.Pointer.EventType.MOUSEDOWN;
                    break;
                case 'mouseup':
                    if (this.lastMouseUp) {
                      return;
                    }
                    this.lastMouseDown = false;
                    this.lastMouseUp = true;
                    pointer.type = emp.typeLibrary.Pointer.EventType.MOUSEUP;
                    break;
                case 'mousemove':
                    pointer.type = emp.typeLibrary.Pointer.EventType.MOVE;
                    break;
            }

            if (oEvent.hasOwnProperty('containerPoint')) {
                pointer.clientX = oEvent.containerPoint.x; // .originalEvent.clientX;
                pointer.clientY = oEvent.containerPoint.y; // .originalEvent.clientY;
            } else {
                var oPoint = instanceInterface.leafletInstance.latLngToContainerPoint(oEvent.latlng);
                pointer.clientX = oPoint.x;
                pointer.clientY = oPoint.y;
            }
            pointer.screenX = oEvent.originalEvent.pageX; //screenX;
            pointer.screenY = oEvent.originalEvent.pageY; //screenY;

            if (!pointer.hasOwnProperty('target')) {
                pointer.target = "globe";
            }

            pointer.altKey = oEvent.originalEvent.altKey;
            pointer.ctrlKey = oEvent.originalEvent.ctrlKey;
            pointer.shiftKey = oEvent.originalEvent.shiftkey;
            pointer.keys = [];
            if (pointer.altKey) {
                pointer.keys.push("alt");
            }
            if (pointer.ctrlKey) {
                pointer.keys.push("ctrl");
            }
            if (pointer.shiftKey) {
                pointer.keys.push("shift");
            }
            if (pointer.keys.length < 1) {
                pointer.keys.push("none");
            }

            instanceInterface.empMapInstance.eventing.Pointer(pointer);
        },
        addMapLayer: function (oMap) {
            if (!instanceInterface.leafletInstance.hasLayer(oMap)) {
                instanceInterface.leafletInstance.addLayer(oMap);
            }
        },
        removeMapLayer: function (oMap) {
            if (instanceInterface.leafletInstance.hasLayer(oMap)) {
                instanceInterface.leafletInstance.removeLayer(oMap);
            }
        },
        scheduleRendering: function () {
          var sCoreID,
              i,
              renderList;

          if (instanceInterface.hTGRenderingTimer) {
            clearTimeout(instanceInterface.hTGRenderingTimer);
            instanceInterface.hTGRenderingTimer = undefined;
          }

          instanceInterface.oGraphicsInViewingArea = [];
          var oMapBounds = instanceInterface.leafletInstance.getBounds();
          var oEmpMapBounds = new leafLet.typeLibrary.EmpBoundary(oMapBounds.getSouthWest(), oMapBounds.getNorthEast());
          var oFeatureBounds = undefined;

          for (sCoreID in instanceInterface.mapEngObjectList) {
            if (!instanceInterface.mapEngObjectList.hasOwnProperty(sCoreID)) {
              continue;
            }
            var oEmpObject = instanceInterface.mapEngObjectList[sCoreID];
            if (oEmpObject.getObjectType() === leafLet.typeLibrary.objectType.FEATURE) {
              // Put it on the list only if it's visible
              if (oEmpObject.isVisible()) {
                try {
                  oFeatureBounds = oEmpObject.getFeatureBounds();
                  if (oEmpObject.isMilStd()) {
                    if (oEmpObject.isMultiPointTG()) {
                      // EMP feature object is a TG. Put it on the list only if it's within the bounds.
                      if (oFeatureBounds && oFeatureBounds.intersects(oEmpMapBounds)) {
                        instanceInterface.oGraphicsInViewingArea.push(oEmpObject);
                      }
                    } else {
                      // EMP feature object is a single point icon. Check to see if the view has entered a new zone. If
                      // it has we want to add the feature to the list. If it hasn't then there is no need to redraw and
                      // all that needs to occur is a potential update of the positions.
                      if (instanceInterface.renderingOptimization.zoneChanged &&
                         !instanceInterface.renderingOptimization.isOnRenderList(sCoreID)) {
                          instanceInterface.renderingOptimization.addToRenderList(sCoreID, oEmpObject);
                          instanceInterface.oGraphicsInViewingArea.push(oEmpObject);
                      } else {
                        oEmpObject.updateCoordinates(oMapBounds);
                      }
                    }
                  } else if (oEmpObject.isAirspace() || oEmpObject.isAOI() || oEmpObject.isGeoEllipse()) {
                    // Put it on the list only if it's within the bounds.
                    if (oFeatureBounds && oFeatureBounds.intersects(oEmpMapBounds)) {
                      instanceInterface.oGraphicsInViewingArea.push(oEmpObject);
                    }
                  } else {
                    oEmpObject.updateCoordinates(oMapBounds);
                  }
                } catch (Ex) {
                }
              }
            }
          }
          // Need to check the renderList hash to see if there are any pending items available to re-render.
          // This condition and course of actions must occur because an event which causes a re-render scheduling can
          // generate after the onZoomEnd event and potentially cause the previous rendering execution to abort.
          if (!instanceInterface.renderingOptimization.zoneChanged &&
              !instanceInterface.renderingOptimization.isRenderListEmpty()) {
            renderList = instanceInterface.renderingOptimization.getRenderList();
            for (i in renderList) {
              instanceInterface.oGraphicsInViewingArea.push(renderList[i]);
            }
          }
          if (instanceInterface.oGraphicsInViewingArea.length > 0) {
            instanceInterface.hTGRenderingTimer = setTimeout(instanceInterface.RerenderingTimerHdlr, 500);
          }
        },
        RerenderingTimerHdlr: function () {
          var iIndex = 0,
              currentGraphic,
              removedGraphicId;

          while (instanceInterface.oGraphicsInViewingArea.length > 0) {
            if (iIndex === 100) {
              instanceInterface.hTGRenderingTimer = setTimeout(instanceInterface.RerenderingTimerHdlr, 100);
              return;
            }

            if (instanceInterface.oGraphicsInViewingArea[0].isInEditMode()) {
              instanceInterface.oCurrentEditor.render();
            } else {
              instanceInterface.oGraphicsInViewingArea[0].render();
            }
            currentGraphic = instanceInterface.oGraphicsInViewingArea.splice(0, 1);
            removedGraphicId = currentGraphic[0].options.featureId;
            if (instanceInterface.renderingOptimization.isOnRenderList(removedGraphicId)) {
              instanceInterface.renderingOptimization.removeFromRenderList(removedGraphicId);
            }
            iIndex++;
          }
        },
        processViewSetTrans: function () {
            var oTrans;
            var aViewSetTransList = instanceInterface.findTransactionByIntent(emp.intents.control.VIEW_SET);

            for (var iIndex = 0; iIndex < aViewSetTransList.length; iIndex++) {
                oTrans = aViewSetTransList[iIndex];
                instanceInterface.getView(oTrans.items[0]);
                instanceInterface.removeTransaction(oTrans.transactionId);
                oTrans.run();
            }
        },
        mapResizeFn: function () {
            instanceInterface.getLeafletMap()._onResize();
        },
        isV2Core: function () {
            return instanceInterface.bIsV2Core;
        },
        setLookAt: function(lookAt) {
            var range;
            var tilt;
            var oMap = instanceInterface.getLeafletMap();
            var level = oMap.getZoom();

            if (lookAt) {
                // We project the range on to the vertical so the camera is at the correct altitude but looking down.
                range = lookAt.altitude + (lookAt.range * Math.cos(lookAt.tilt));

                if (range < instanceInterface.zoomScaleMap[instanceInterface.zoomScaleMap.length - 1]) {
                    range = instanceInterface.zoomScaleMap[instanceInterface.zoomScaleMap.length - 1];
                }

                // Leaflet is a 2D map, so we do not need to deal with the altitude.

                try {
                    oMap.setView(new L.LatLng(lookAt.latitude, lookAt.longitude), level, {animate: false});
                    if (range && !isNaN(range)) {
                        level = instanceInterface.getLevel(range * instanceInterface.rangeToScaleMultiplier);
                        oMap.setZoom(level, {animate: false});
                    }

                    return true;
                } catch (err) {
                }
            }
            return false;
        }
    };

    engineInterface.initialize.succeed = function () {
        var oLayerList = [];
        var oLayerEntry;
        var oControl;
        var oLeafletContent;
        var sCoreId = instanceInterface.sContentCoreId;
        var myElement = document.getElementById(instanceInterface.engineParameters.container);

        window.addResizeListener(myElement, instanceInterface.mapResizeFn);

        if (bounds !== undefined) {
            instanceInterface.leafletInstance.fitBounds(bounds);
        }

        instanceInterface.oSelectionManager = new leafLet.SelectionManager({
            mapInstance: instanceInterface.empMapInstance
        });
        instanceInterface.rootOverlayId = emp.helpers.id.newGUID();
        instanceInterface.mapEngObjectList = {};

        oLeafletContent = new emp.typeLibrary.Static({
            name: 'Leaflet Content',
            featureId: sCoreId,
            overlayId: emp.storage.getRootGuid(instanceInterface.empMapInstance.mapInstanceId),
            visible: true,
            coreId: sCoreId,
            coreParent: emp.storage.getRootGuid(instanceInterface.empMapInstance.mapInstanceId)
        });
        oLayerList.push(oLeafletContent);
        oControl = new L.Control.Scale({
            position: 'bottomright',
            maxWidth: 200,
            imperial: false,
            metric: true,
            objectType: leafLet.typeLibrary.objectType.LL_CONTROL,
            coreId: emp.helpers.id.newGUID()
        });

        oLayerEntry = new emp.typeLibrary.Static({
            name: 'Scale Bar',
            featureId: oControl.getCoreId(),
            overlayId: sCoreId,
            visible: true,
            coreId: oControl.getCoreId(),
            coreParent: sCoreId
        });
        oLayerList.push(oLayerEntry);

        instanceInterface.addEmpObject(oControl);
        instanceInterface.leafletInstance.addControl(oControl);

        if (instanceInterface.engineParameters.tileLayer.path
                && !emp.helpers.isEmptyString(instanceInterface.engineParameters.tileLayer.path)) {
            var oMainMap;

            if (instanceInterface.engineParameters.tileLayer.path.indexOf("{x}") !== -1) {
                // The initial map must be a Tile Server and not a WMS server.
                instanceInterface.engineParameters.tileLayer.properties.instanceInterface = instanceInterface;
                oMainMap = L.tileLayer(instanceInterface.engineParameters.tileLayer.path,
                        instanceInterface.engineParameters.tileLayer.properties);

                oLayerEntry = new emp.typeLibrary.Static({
                    name: 'Default Map',
                    featureId: oMainMap.getCoreId(),
                    overlayId: sCoreId,
                    visible: true,
                    coreId: oMainMap.getCoreId(),
                    coreParent: sCoreId
                });
                oLayerList.push(oLayerEntry);

                instanceInterface.addEmpObject(oMainMap);
                instanceInterface.addMapLayer(oMainMap);
            }
        }

        if (oLayerList.length > 0) {
            instanceInterface.empMapInstance.eventing.StaticContent(oLayerList);
        }

        instanceInterface.rootOverlay = new leafLet.typeLibrary.Overlay({
            item: {
                coreId: instanceInterface.rootOverlayId,
                name: "root Overlay",
                visible: true,
                properties: {}
            },
            instanceInterface: instanceInterface
        });

        instanceInterface.addEmpObject(instanceInterface.rootOverlay);
        instanceInterface.leafletInstance.addLayer(instanceInterface.rootOverlay);

        setupEventListeners();
        /*
         instanceInterface.oLabelList.push("V");
         instanceInterface.oLabelList.push("L");
         instanceInterface.oLabelList.push("S");
         instanceInterface.oLabelList.push("AA");
         instanceInterface.oLabelList.push("AB");
         instanceInterface.oLabelList.push("AC");
         instanceInterface.oLabelList.push("H");
         instanceInterface.oLabelList.push("M");
         instanceInterface.oLabelList.push("T");
         instanceInterface.oLabelList.push("T1");
         instanceInterface.oLabelList.push("CN");
         instanceInterface.oLabelList.push("C");
         instanceInterface.oLabelList.push("F");
         instanceInterface.oLabelList.push("G");
         instanceInterface.oLabelList.push("H1");
         instanceInterface.oLabelList.push("H2");
         instanceInterface.oLabelList.push("J");
         instanceInterface.oLabelList.push("K");
         instanceInterface.oLabelList.push("N");
         instanceInterface.oLabelList.push("P");
         instanceInterface.oLabelList.push("W");
         instanceInterface.oLabelList.push("W1");
         instanceInterface.oLabelList.push("X");
         instanceInterface.oLabelList.push("Y");
         instanceInterface.oLabelList.push("Z");
         */
        instanceInterface.iMilStdIconSize = 24;

        checkMapWidth();
        if (instanceInterface.renderingOptimization.enabled) {
            instanceInterface.renderingOptimization.refreshZone();
        }
        instanceInterface.setLockState(emp3.api.enums.MapMotionLockEnum.UNLOCKED);
        //notify application that the map is ready to recieve data
        instanceInterface.empMapInstance.eventing.StatusChange({status: emp.map.states.READY});
    };

    engineInterface.initialize.fail = function (args) {
        instanceInterface.empMapInstance.eventing.StatusChange({
            status: emp.map.states.MAP_INSTANCE_INIT_FAILED
        });
    };

    function checkMapWidth() {
        var oMapBounds;
        var center;
        var angularWidth;
        var iZoom;

        oMapBounds = instanceInterface.leafletInstance.getBounds();
        center = instanceInterface.leafletInstance.getCenter();
        angularWidth = Math.abs(oMapBounds.getEast() - oMapBounds.getWest());

        //console.log("Deg Wide : " + angularWidth);
        // We must make sure we don't zoom out beyond 180 deg width. The render has problems rendering
        // graphics when the BBox is wider than 180.
        if (angularWidth >= 180.0) {
            iZoom = instanceInterface.leafletInstance.getZoom() + 1;
            instanceInterface.leafletInstance.setView(center, iZoom, {animate: false});
        }
    }

    function checkMapCenter() {
        // Leaflet allows the map to be moved out of view north or south.
        // This code is here to stop this from happening.
        var oMapBounds,
                oNorthWest,
                oTopLeft,
                oSouthEast,
                oBottomRight,
                $Container,
                iContainerHeight;

        oMapBounds = instanceInterface.leafletInstance.getBounds();

        oNorthWest = new L.LatLng(oMapBounds.getNorth(), oMapBounds.getWest());
        oTopLeft = instanceInterface.leafletInstance.latLngToContainerPoint(oNorthWest);

        if (oTopLeft.y > 10) {
            //console.log("TopLeft X:" + oTopLeft.x + " Y:" + oTopLeft.y);
            oTopLeft.x = 0;
            instanceInterface.leafletInstance.panBy(oTopLeft, {animate: false});
        } else {
            $Container = $(instanceInterface.leafletInstance.getContainer());
            iContainerHeight = $Container.height();
            oSouthEast = new L.LatLng(oMapBounds.getSouth(), oMapBounds.getEast());
            oBottomRight = instanceInterface.leafletInstance.latLngToContainerPoint(oSouthEast);

            if (oBottomRight.y < iContainerHeight) {
                //console.log("BottomRight X:" + oBottomRight.x + " Y:" + oBottomRight.y);
                oBottomRight.x = 0;
                oBottomRight.y = oBottomRight.y - iContainerHeight;
                instanceInterface.leafletInstance.panBy(oBottomRight, {animate: false});
            }
        }
    }

    function setupEventListeners() {
      var timeout;

      function onMouseMove(event) {
        var originalEvent = event.originalEvent,
            element = originalEvent.srcElement || originalEvent.currentTarget,
            elementBounds = element.getBoundingClientRect(),
            smartLockBuffer = 0.05,
            offsetX,
            offsetY,
            step = parseFloat((instanceInterface.getView().altitude / (L.CRS.Earth.R)).toFixed(25)),
            smartLockAutoPan = function() {
              var geographicMapCenter = instanceInterface.leafletInstance.getCenter(),
                  panToLat = geographicMapCenter.lat,
                  panToLng = geographicMapCenter.lng,
                  horizontalOffset = 0,
                  verticalOffset = 0;

              if (instanceInterface.smartLockPanning.up) {
                panToLat = geographicMapCenter.lat + step;
                verticalOffset = panToLat - geographicMapCenter.lat;
              } else if (instanceInterface.smartLockPanning.down) {
                panToLat = geographicMapCenter.lat + (-step);
                verticalOffset = panToLat - geographicMapCenter.lat + (step * .02);
              }
              if (instanceInterface.smartLockPanning.left) {
                panToLng = geographicMapCenter.lng + (-step);
                horizontalOffset = panToLng - geographicMapCenter.lng;
              } else if (instanceInterface.smartLockPanning.right) {
                panToLng = geographicMapCenter.lng + step;
                horizontalOffset = panToLng - geographicMapCenter.lng - (step * .20);
              }
              if (horizontalOffset !== 0 || verticalOffset !== 0) {
                event.latlng.lng = event.latlng.lng + horizontalOffset;
                event.latlng.lat = event.latlng.lat + verticalOffset;
                instanceInterface.leafletInstance.panTo(L.latLng(panToLat, panToLng));
                instanceInterface.generatePointerEvent(event, instanceInterface.getView());
                clearTimeout(timeout);
                timeout = setTimeout(smartLockAutoPan, 225);
              }
            };

        event.latlng.lng = leafLet.utils.normilizeLongitude(event.latlng.lng);
        event.mgrs = emp.geoLibrary.ddToMGRS(event.latlng.lat, event.latlng.lng);
        instanceInterface.smartLockPanning.left = false;
        instanceInterface.smartLockPanning.right = false;
        instanceInterface.smartLockPanning.up = false;
        instanceInterface.smartLockPanning.down = false;
        instanceInterface.generatePointerEvent(event, instanceInterface.getView());
        // Smart Motion lock functionality is implemented below. If other future requirements reagrding mouse move
        // in combination with buttons arise
        switch (instanceInterface.getLockState()) {
          case emp3.api.enums.MapMotionLockEnum.SMART_MOTION:
            offsetX = originalEvent.clientX - elementBounds.left;
            offsetY = originalEvent.clientY - elementBounds.top;
            instanceInterface.smartLockPanning.left = offsetX < elementBounds.width * smartLockBuffer;
            instanceInterface.smartLockPanning.right = offsetX > elementBounds.width - (elementBounds.width * smartLockBuffer);
            instanceInterface.smartLockPanning.up = offsetY < elementBounds.height * smartLockBuffer;
            instanceInterface.smartLockPanning.down = offsetY > elementBounds.height - (elementBounds.height * smartLockBuffer);
            smartLockAutoPan();
            break;
          default:
            break;
        }
      }

      function onMoveEnd(event) {
        var center,
            view,
            lookAt,
            lockState = instanceInterface.getLockState();

        if (lockState !== emp3.api.enums.MapMotionLockEnum.NO_MOTION) {
          checkMapCenter();
          center = instanceInterface.leafletInstance.getCenter();
          if ((center.lng < -180.0) || (center.lng > 180.0)) {
            instanceInterface.leafletInstance.setView(center.wrap());
            return;
          }
          if (instanceInterface.renderingOptimization.enabled) {
            instanceInterface.renderingOptimization.refreshZone();
          }
          view = instanceInterface.getView();
          lookAt = instanceInterface.viewToLookAt(view);
          instanceInterface.scheduleRendering(view);
          instanceInterface.empMapInstance.eventing.ViewChange(view, lookAt);
          instanceInterface.processViewSetTrans();
        }
      }

      function onMapClick(event) {
        var button = event.originalEvent.button;

        if ((button !== 0) ||
          event.originalEvent.altKey || !event.originalEvent.ctrlKey ||
          event.originalEvent.shiftKey) {
          instanceInterface.oSelectionManager.deselectAllFeatures();
          instanceInterface.oSelectionManager.generateEvent();
        }

        instanceInterface.generatePointerEvent(event, instanceInterface.getView());
        event.originalEvent.preventDefault();
      }

      function onZoomEnd(event) {
        checkMapWidth();
      }

      function onMouseUpDown(event) {
        instanceInterface.generatePointerEvent(event, instanceInterface.getView());
        event.originalEvent.preventDefault();
      }

      instanceInterface.leafletInstance.on('mousemove', onMouseMove);
      instanceInterface.leafletInstance.on('moveend', onMoveEnd);
      instanceInterface.leafletInstance.on('mousedown', onMouseUpDown);
      instanceInterface.leafletInstance.on('mouseup', onMouseUpDown);
      instanceInterface.leafletInstance.on('contextmenu', onMapClick);
      instanceInterface.leafletInstance.on('click', onMapClick);
      instanceInterface.leafletInstance.on('zoomend', onZoomEnd);
    }
    /*
     // The plugin to do the screen capture requires that leaflet be
     // set L_PREFER_CANVAS = true; which causes all L.Path
     // derived types to fail to generate events.
     // Therefore the current version will not support screenshots.

     engineInterface.capture.screenshot = function (transaction) {

     transaction.pause();
     //var box2d = map.getBounds();

     function doImage(err, canvas) {

     transaction.items[0].dataUrl = canvas.toDataURL();
     transaction.run();

     }
     leafletImage(instanceInterface.leafletInstance, doImage);
     };
     */

    //engineInterface.status = {};
    engineInterface.status.get = function (transaction) {
        var status = new emp.typeLibrary.Status({
            intent: transaction.intent,
            status: getStatus()
        });
        //console.log("get status");
        transaction.items[0] = status;

        return true;
    };

    engineInterface.status.reset = function () {
        //console.log("reset status");
    };

    engineInterface.state.destroy = function () {
        var oEmpObject;
        var myElement = document.getElementById(instanceInterface.engineParameters.container);

        window.removeResizeListener(myElement, instanceInterface.mapResizeFn);

        var sKeys = emp.helpers.associativeArray.getKeys(instanceInterface.mapEngObjectList);

        for (var iIndex = 0; iIndex < sKeys.length; iIndex++) {
            oEmpObject = instanceInterface.mapEngObjectList[sKeys[iIndex]];
            if (oEmpObject) {
                switch (oEmpObject.getObjectType()) {
                    case leafLet.typeLibrary.objectType.LL_CONTROL:
                        if (oEmpObject._map) {
                            instanceInterface.getLeafletMap().removeControl(oEmpObject);
                        }
                        break;
                    case leafLet.typeLibrary.objectType.LL_DEFAULT_MAP:
                        instanceInterface.removeMapLayer(oEmpObject);
                        break;
                    default:
                        oEmpObject.destroy();
                        break;
                }
                instanceInterface.removeEmpObject(oEmpObject);
            }
        }

        instanceInterface.leafletInstance.remove();
        instanceInterface.leafletInstance = undefined;
        instanceInterface.oSelectionManager.destroy();
        instanceInterface.oSelectionManager = undefined;
        instanceInterface.oLabelList = [];
        instanceInterface.oLayerControl = undefined;
        instanceInterface.oGraphicsInViewingArea = [];
        instanceInterface.mapEngObjectList = undefined;
        instanceInterface.rootOverlayId = undefined;
        instanceInterface.rootOverlay = undefined;
    };

    engineInterface.visibility.set = function (transaction) {
        var oaItems = transaction.items;

        for (var iIndex = 0; iIndex < oaItems.length; iIndex++) {
            var item = oaItems[iIndex];

            if (item.coreId === instanceInterface.sContentCoreId) {
                // The leaflet content does not really exist.
                continue;
            }
            try {
                var oObject = instanceInterface.mapEngObjectList[item.coreId];

                if (oObject !== undefined) {
                    switch (oObject.getObjectType()) {
                        case leafLet.typeLibrary.objectType.LL_CONTROL:
                            if (item.visible) {
                                if (!oObject._map) {
                                    instanceInterface.getLeafletMap().addControl(oObject);
                                }
                            } else {
                                if (oObject._map) {
                                    instanceInterface.getLeafletMap().removeControl(oObject);
                                }
                            }
                            break;
                        case leafLet.typeLibrary.objectType.LL_DEFAULT_MAP:
                            if (item.visible) {
                                instanceInterface.addMapLayer(oObject);
                            } else {
                                instanceInterface.removeMapLayer(oObject);
                            }
                            break;
                        default:
                            oObject.setVisibility(item);
                            break;
                    }
                } else {
                    transaction.fail(new emp.typeLibrary.Error({
                        coreId: item.coreId,
                        level: emp.typeLibrary.Error.level.MAJOR,
                        message: "Object " + item.coreId + " does not exists."
                    }));
                    iIndex--;
                    continue;
                }
            } catch (Ex) {
                transaction.fail(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: Ex.name + ": " + Ex.message,
                    jsError: Ex
                }));
                iIndex--;
            }
        }
    };

    engineInterface.overlay.add = function (transaction) {
        var oaItems = transaction.items;

        for (var iIndex = 0; iIndex < oaItems.length; iIndex++) {
            var item = oaItems[iIndex];

            try {
                var oNewOverlay = new leafLet.typeLibrary.Overlay({
                    item: item,
                    instanceInterface: instanceInterface
                });

                if (oNewOverlay.getParentCoreId() === undefined) {
                    // The parent is the root overlay.
                    instanceInterface.rootOverlay.addChildObject(oNewOverlay);
                } else if (instanceInterface.mapEngObjectList.hasOwnProperty(oNewOverlay.getParentCoreId())) {
                    // The parent exists.
                    var oParentOverlay = instanceInterface.mapEngObjectList[oNewOverlay.getParentCoreId()];

                    oParentOverlay.addChildObject(oNewOverlay);
                } else {
                    // A map engine does not have to create a parent overlay if it does not exists.
                    // The parent does not exists.
                    transaction.fail(new emp.typeLibrary.Error({
                        coreId: item.coreId,
                        level: emp.typeLibrary.Error.level.MAJOR,
                        message: "Parent overlay " + item.parentId + " does not exists."
                    }));
                    iIndex--;
                    continue;
                }

                instanceInterface.addEmpObject(oNewOverlay);

                if (oNewOverlay.isClusterActive()) {
                    oNewOverlay.activateCluster();
                } else if (oNewOverlay.hasClusterDef()) {
                    oNewOverlay.clusterActivate();
                }
            } catch (Ex) {
                transaction.fail(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: Ex.name + ": " + Ex.message,
                    jsError: Ex
                }));
                iIndex--;
            }
        }
    };

    engineInterface.overlay.remove = function (transaction) {
        var oaItems = transaction.items;

        for (var iIndex = 0; iIndex < oaItems.length; iIndex++) {
            var item = oaItems[iIndex];
            try {
                if (instanceInterface.mapEngObjectList.hasOwnProperty(item.coreId)) {
                    // The overlay exists.
                    var oParentOverlay;
                    var oOverlay = instanceInterface.mapEngObjectList[item.coreId];

                    if (item.parentCoreId === undefined) {
                        // The parent is the root.
                        oParentOverlay = instanceInterface.rootOverlay;
                    } else {
                        oParentOverlay = instanceInterface.mapEngObjectList[item.parentCoreId];
                    }

                    oParentOverlay.removeChildObject(oOverlay);
                    oOverlay.destroy();
                } else {
                    transaction.fail(new emp.typeLibrary.Error({
                        coreId: item.coreId,
                        level: emp.typeLibrary.Error.level.MAJOR,
                        message: "Overlay " + item.overlayId + " does not exists."
                    }));
                    iIndex--;
                }
            } catch (Ex) {
                transaction.fail(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: Ex.name + ": " + Ex.message,
                    jsError: Ex
                }));
                iIndex--;
            }
        }
    };

    engineInterface.overlay.update = function (transaction) {
        var oaItems = transaction.items;
        var oOverlay;
        var oItem;

        for (var iIndex = 0; iIndex < oaItems.length; iIndex++) {
            oItem = oaItems[iIndex];
            try {
                oOverlay = instanceInterface.getEmpObject(oItem.coreId);

                if (oOverlay) {
                    // The overlay exists.
                    if (oItem.hasOwnProperty('parentId') &&
                            (oItem.parentId !== oOverlay.getParentId())) {
                        // Its being re-parented.
                        var oParentOverlay = oOverlay.getParentObject();
                        var oNewParent;

                        if (!oParentOverlay) {
                            transaction.fail(new emp.typeLibrary.Error({
                                coreId: oItem.coreId,
                                level: emp.typeLibrary.Error.level.MAJOR,
                                message: "Current Parent Overlay " + oOverlay.getParentId() + " not found."
                            }));
                            iIndex--;
                            continue;
                        }

                        if (oItem.parentId) {
                            oNewParent = instanceInterface.getEmpObject(oItem.parentId);
                        } else {
                            // If parentId is present but equal null
                            // its being moved to the root.
                            oNewParent = instanceInterface.rootOverlay;
                        }

                        if (!oNewParent) {
                            transaction.fail(new emp.typeLibrary.Error({
                                coreId: oItem.coreId,
                                level: emp.typeLibrary.Error.level.MAJOR,
                                message: "New Parent Overlay " + oItem.parentId + " not found."
                            }));
                            iIndex--;
                            continue;
                        }

                        oParentOverlay.removeChildObject(oOverlay);
                        oNewParent.addChildObject(oOverlay);
                    }

                    if (oItem.hasOwnProperty('name') &&
                            (oItem.name !== oOverlay.getName())) {
                        oOverlay.setName(oItem.name);
                    }
                } else {
                    transaction.fail(new emp.typeLibrary.Error({
                        coreId: oItem.coreId,
                        level: emp.typeLibrary.Error.level.MAJOR,
                        message: "Overlay " + oItem.overlayId + " does not exists."
                    }));
                    iIndex--;
                }
            } catch (Ex) {
                transaction.fail(new emp.typeLibrary.Error({
                    coreId: oItem.coreId,
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: Ex.name + ": " + Ex.message,
                    jsError: Ex
                }));
                iIndex--;
            }
        }
    };

    engineInterface.overlay.clear = function (transaction) {
        var i,
                len = transaction.items.length,
                items = transaction.items,
                item,
                overlay;

        for (i = 0; i < len; i++) {
            try {
                item = items[i];
                if (instanceInterface.mapEngObjectList.hasOwnProperty(item.coreId)) {
                    overlay = instanceInterface.mapEngObjectList[item.coreId];
                    overlay.clearChildren();
                }
            } catch (err) {
                transaction.fail([new emp.typeLibrary.Error({
                        coreId: item.coreId,
                        message: "An error occurred while attempting to clear an overlay with the id " + item.coreId + " : ",
                        level: emp.typeLibrary.Error.level.MINOR,
                        jsError: err
                    })]);
                i--;
            }
        }
    };

    engineInterface.overlay.style = function (transaction) {
        var oaItems = transaction.items;
        var oOverlay;
        var oItem;

        for (var iIndex = 0; iIndex < oaItems.length; iIndex++) {
            oItem = oaItems[iIndex];
            try {
                oOverlay = instanceInterface.getEmpObject(oItem.coreId);

                if (oOverlay) {
                    oOverlay.setStyle(oItem.type, oItem.properties);
                } else {
                    transaction.fail(new emp.typeLibrary.Error({
                        coreId: oItem.coreId,
                        level: emp.typeLibrary.Error.level.MAJOR,
                        message: "Overlay " + oItem.overlayId + " does not exists."
                    }));
                    iIndex--;
                }
            } catch (Ex) {
                transaction.fail(new emp.typeLibrary.Error({
                    coreId: oItem.coreId,
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: Ex.name + ": " + Ex.message,
                    jsError: Ex
                }));
                iIndex--;
            }
        }
    };

    engineInterface.overlay.cluster.set = function (transaction) {
        var oOverlay;
        var oItem = transaction.items[0];

        if (oItem === undefined) {
            transaction.fail([{
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: "Overlay Cluster Set transaction with no data."
                }]);
            return;
        }

        oOverlay = instanceInterface.mapEngObjectList[oItem.getCoreId()];

        if (!oOverlay) {
            transaction.fail([{
                    coreId: oItem.getCoreId(),
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: "Overlay Cluster Set transaction overlay not found."
                }]);
            return;
        }

        oOverlay.clusterSet(oItem);
    };

    engineInterface.overlay.cluster.activate = function (transaction) {
        var oOverlay;
        var oItem = transaction.items[0];

        if (oItem === undefined) {
            transaction.fail([{
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: "Overlay Cluster Activate transaction with no data."
                }]);
            return;
        }

        oOverlay = instanceInterface.mapEngObjectList[oItem.getCoreId()];

        if (!oOverlay) {
            transaction.fail([{
                    coreId: oItem.getCoreId(),
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: "Overlay Cluster Activate transaction overlay not found."
                }]);
            return;
        }

        oOverlay.clusterActivate();
    };

    engineInterface.overlay.cluster.deactivate = function (transaction) {
        var oOverlay;
        var oItem = transaction.items[0];

        if (oItem === undefined) {
            transaction.fail([{
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: "Overlay Cluster Deactivate transaction with no data."
                }]);
            return;
        }

        oOverlay = instanceInterface.mapEngObjectList[oItem.getCoreId()];

        if (!oOverlay) {
            transaction.fail([{
                    coreId: oItem.getCoreId(),
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: "Overlay Cluster Deactivate transaction overlay not found."
                }]);
            return;
        }

        oOverlay.clusterDeactivate();
    };

    engineInterface.overlay.cluster.remove = function (transaction) {
        var oOverlay;
        var oItem = transaction.items[0];

        if (oItem === undefined) {
            transaction.fail([{
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: "Overlay Cluster Remove transaction with no data."
                }]);
            return;
        }

        oOverlay = instanceInterface.mapEngObjectList[oItem.getCoreId()];

        if (!oOverlay) {
            transaction.fail([{
                    coreId: oItem.getCoreId(),
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: "Overlay Cluster Remove transaction overlay not found."
                }]);
            return;
        }

        oOverlay.clusterRemove();
    };

    engineInterface.view.set = function (transaction) {
      var item = transaction.items[0],
          oMap = instanceInterface.getLeafletMap(),
          level = oMap.getZoom(),
          bZoom = ((item.zoom === true) ? true : ((typeof (item.zoom) === 'number') && (item.zoom > 0)) ? true : false),
          southWest,
          northEast,
          bounds,
          oEmpObject,
          oEmpBounds,
          oCenter,
          meters = 16093;

      try {
        if (instanceInterface.getLockState() === emp3.api.enums.MapMotionLockEnum.NO_MOTION) {
          throw new Error("The current lock state is set to 'NO_MOTION'.");
        } else {
          if (item.location) {
            oMap.setView(new L.LatLng(item.location.lat, item.location.lon), level, {animate: false});
            if (item.range && !isNaN(item.range)) {
              level = instanceInterface.getLevel(item.range * instanceInterface.rangeToScaleMultiplier);
              oMap.setZoom(level, {animate: false});
            }
          } else if (item.bounds) {
            southWest = L.latLng(item.bounds.south, item.bounds.west);
            northEast = L.latLng(item.bounds.north, item.bounds.east);
            bounds = L.latLngBounds(southWest, northEast);
            oMap.fitBounds(bounds);
            if (item.range && !isNaN(item.range)) {
              level = instanceInterface.getLevel(item.range * instanceInterface.rangeToScaleMultiplier);
              oMap.setZoom(level, {animate: false});
            }
          } else if (item.featureId || item.overlayId) {
            oEmpObject = instanceInterface.mapEngObjectList[item.coreId];
            if (oEmpObject !== undefined) {
              if (oEmpObject.getObjectType() === leafLet.typeLibrary.objectType.OVERLAY) {
                // We need to check to see if it has features in it.
                if (!oEmpObject.hasFeatures()) {
                  transaction.fail(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    level: emp.typeLibrary.Error.level.MINOR,
                    message: "Overlay " + oEmpObject.options.name + " is empty."
                  }));
                  return;
                }
              }
              oEmpBounds = oEmpObject.getFeatureBounds();
              if (oEmpBounds) {
                if (bZoom) {
                  if (oEmpBounds.getCenterWidth() < meters) {
                    oEmpBounds.setCenterWidth(meters);
                  }
                  oMap.fitBounds(new L.LatLngBounds(oEmpBounds.getSouthWest(), oEmpBounds.getNorthEast()), {animate: false});
                } else {
                  oCenter = oEmpBounds.getCenter();
                  oMap.setView(new L.LatLng(oCenter.lat, oCenter.lng), level, {animate: false});
                }
              }
            }
          } else if (item.range) {
            level = instanceInterface.getLevel(item.range * instanceInterface.rangeToScaleMultiplier);
            oMap.setZoom(level, {animate: false});
          }
          instanceInterface.getView(transaction.items[0]);
        }
      } catch (err) {
        transaction.fail([new emp.typeLibrary.Error({
          coreId: transaction.items[0].coreId,
          message: "An error occurred while attempting to set the map view: ",
          level: emp.typeLibrary.Error.level.MINOR,
          jsError: err
        })]);
      }
    };

    engineInterface.view.get = function (transaction) {
        var failList = [];

        try {
            instanceInterface.getView(transaction.items[0]);
        } catch (err) {
            failList.push(new emp.typeLibrary.Error({
                coreId: transaction.items[0].coreId,
                message: "An error occurred while getting the maps view: ",
                level: emp.typeLibrary.Error.level.MINOR,
                jsError: err
            }));
            transaction.fail(failList);
        }
        return true;
    };

    engineInterface.feature.add = function (transaction) {
        var oaItems = transaction.items;

        for (var iIndex = 0; iIndex < oaItems.length; iIndex++) {
            var item = oaItems[iIndex];

            try {
                var oNewFeature;

                if (instanceInterface.mapEngObjectList.hasOwnProperty(item.coreId)) {
                    // Its an update
                    oNewFeature = instanceInterface.mapEngObjectList[item.coreId];

                    oNewFeature.updateFeature(item);

                    if (oNewFeature.isInEditMode()) {
                        instanceInterface.oCurrentEditor.render();
                    }
                } else {
                    switch (item.format) {
                        case emp.typeLibrary.featureFormatType.MILSTD:
                            if (instanceInterface.isV2Core()) {
                                emp.util.milstdColorFix(item);
                            }
                            oNewFeature = new leafLet.typeLibrary.MilStdFeature({
                                item: item,
                                instanceInterface: instanceInterface
                            });
                            break;
                        case emp.typeLibrary.featureFormatType.KML:
                            oNewFeature = new leafLet.typeLibrary.KMLFeature({
                                item: item,
                                instanceInterface: instanceInterface
                            });
                            break;
                        case emp.typeLibrary.featureFormatType.GEOJSON:
                        case emp.typeLibrary.featureFormatType.GEO_POINT:
                        case emp.typeLibrary.featureFormatType.GEO_PATH:
                        case emp.typeLibrary.featureFormatType.GEO_POLYGON:
                            if (leafLet.utils.geoJson.isAOI(item)) {
                                oNewFeature = new leafLet.typeLibrary.AOIFeature({
                                    item: item,
                                    instanceInterface: instanceInterface
                                });
                            } else {
                                oNewFeature = new leafLet.typeLibrary.GeoJsonFeature({
                                    item: item,
                                    instanceInterface: instanceInterface
                                });
                            }
                            break;
                        case emp.typeLibrary.featureFormatType.AIRSPACE:
                            oNewFeature = leafLet.utils.airspace.createAirspace({
                                item: item,
                                instanceInterface: instanceInterface
                            });
                            break;
                        case emp.typeLibrary.featureFormatType.IMAGE:
                            oNewFeature = new leafLet.typeLibrary.ImageFeature({
                                item: item,
                                instanceInterface: instanceInterface
                            });
                            break;
                        case emp.typeLibrary.featureFormatType.GEO_TEXT:
                            oNewFeature = new leafLet.typeLibrary.GeoTextFeature({
                                item: item,
                                instanceInterface: instanceInterface
                            });
                            break;
                        case emp.typeLibrary.featureFormatType.GEO_RECTANGLE:
                            oNewFeature = new leafLet.typeLibrary.GeoRectangleFeature({
                                item: item,
                                instanceInterface: instanceInterface
                            });
                            break;
                        case emp.typeLibrary.featureFormatType.GEO_SQUARE:
                            oNewFeature = new leafLet.typeLibrary.GeoSquareFeature({
                                item: item,
                                instanceInterface: instanceInterface
                            });
                            break;
                        case emp.typeLibrary.featureFormatType.GEO_CIRCLE:
                            oNewFeature = new leafLet.typeLibrary.GeoCircleFeature({
                                item: item,
                                instanceInterface: instanceInterface
                            });
                            break;
                        case emp.typeLibrary.featureFormatType.GEO_ELLIPSE:
                            oNewFeature = new leafLet.typeLibrary.GeoEllipseFeature({
                                item: item,
                                instanceInterface: instanceInterface
                            });
                            break;
                        default:
                            throw new Error(item.format + " features are not yet supported.");
                            //break;
                    }

                    if (instanceInterface.mapEngObjectList.hasOwnProperty(oNewFeature.getParentCoreId())) {
                        // The parent exists.
                        var oParentOverlay = instanceInterface.mapEngObjectList[oNewFeature.getParentCoreId()];

                        oParentOverlay.addChildObject(oNewFeature);
                    } else {
                        // A map engine no longer has to create the parent overlay if it does not exists.
                        // The parent does not exists.
                        transaction.fail(new emp.typeLibrary.Error({
                            coreId: item.coreId,
                            level: emp.typeLibrary.Error.level.MAJOR,
                            message: "Parent " + item.parentId + " does not exists."
                        }));
                        iIndex--;
                        continue;
                    }

                    instanceInterface.addEmpObject(oNewFeature);

                    if (item.zoom && !instanceInterface.bInDrawMode && !instanceInterface.bInEditMode) {
                        var oEmpBounds = oNewFeature.getFeatureBounds();

                        if (oEmpBounds.getCenterWidth() < 16093) {
                            oEmpBounds.setCenterWidth(16093);
                        }
                        instanceInterface.leafletInstance.fitBounds(new L.LatLngBounds(oEmpBounds.getSouthWest(), oEmpBounds.getNorthEast()));
                    }
                }
            } catch (Ex) {
                transaction.fail(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: Ex.name + ": " + Ex.message,
                    jsError: Ex
                }));
                iIndex--;
            }
        }
    };

    engineInterface.feature.remove = function (transaction) {
        var oaItems = transaction.items;

        for (var iIndex = 0; iIndex < oaItems.length; iIndex++) {
            var item = oaItems[iIndex];
            try {
                if (instanceInterface.mapEngObjectList.hasOwnProperty(item.coreId)) {
                    // The feature exists.
                    var oParentOverlay;
                    var oFeature = instanceInterface.mapEngObjectList[item.coreId];

                    if (oFeature.isInEditMode()) {
                        instanceInterface.oCurrentEditor.cancelEdit();
                        instanceInterface.oCurrentEditor.destroy();
                        instanceInterface.bInEditMode = false;
                        instanceInterface.oCurrentEditor = undefined;
                        instanceInterface.oEditTransaction.run();
                        instanceInterface.oEditTransaction = undefined;
                    }

                    if (item.parentCoreId === undefined) {
                        // The parent is the root.
                        oParentOverlay = instanceInterface.rootOverlay;
                    } else {
                        oParentOverlay = instanceInterface.mapEngObjectList[item.parentCoreId];
                    }

                    if (oParentOverlay) {
                        oParentOverlay.removeChildObject(oFeature);
                        oFeature.destroy();
                    } else {
                        transaction.fail(new emp.typeLibrary.Error({
                            coreId: item.coreId,
                            level: emp.typeLibrary.Error.level.MAJOR,
                            message: "Parent of feature " + item.featureId + " was not found."
                        }));
                        iIndex--;
                    }
                } else {
                    transaction.fail(new emp.typeLibrary.Error({
                        coreId: item.coreId,
                        level: emp.typeLibrary.Error.level.MAJOR,
                        message: "Feature " + item.featureId + " does not exists."
                    }));
                    iIndex--;
                }
            } catch (Ex) {
                transaction.fail(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: Ex.name + ": " + Ex.message,
                    jsError: Ex
                }));
                iIndex--;
            }
        }
    };

    engineInterface.feature.update = function (transaction) {
        var oaItems = transaction.items;

        for (var iIndex = 0; iIndex < oaItems.length; iIndex++) {
            var item = oaItems[iIndex];

            try {
                var oFeature;

                if (instanceInterface.mapEngObjectList.hasOwnProperty(item.coreId)) {
                    // Its an update
                    oFeature = instanceInterface.mapEngObjectList[item.coreId];

                    if (item.name) {
                        // The Name is changing.
                        oFeature.updateFeature(item);

                        if (oFeature.isInEditMode()) {
                            instanceInterface.oCurrentEditor.render();
                        }
                    }

                    if (item.destCoreParent !== undefined) {
                        // Its being re-parented.
                        var oOldParent = instanceInterface.mapEngObjectList[item.parentCoreId];
                        var oNewParent = instanceInterface.mapEngObjectList[item.destCoreParent];

                        oOldParent.removeChildObject(oFeature);
                        oNewParent.addChildObject(oFeature);
                    }
                } else {
                    transaction.fail(new emp.typeLibrary.Error({
                        coreId: item.coreId,
                        level: emp.typeLibrary.Error.level.MAJOR,
                        message: "feature " + item.featureId + " does not exists."
                    }));
                    iIndex--;
                    continue;
                }
            } catch (Ex) {
                transaction.fail(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: Ex.name + ": " + Ex.message,
                    jsError: Ex
                }));
                iIndex--;
            }
        }
    };

    engineInterface.draw.begin = function (transaction) {
        var oDrawItem = transaction.items[0];
        var oOriginalFeature = oDrawItem.originFeature;
        var oFeature;

        if (oOriginalFeature) {
            oFeature = instanceInterface.mapEngObjectList[oOriginalFeature.coreId];
        }

        switch (oDrawItem.type.toLowerCase()) {
            case "point":
            //case emp.typeLibrary.featureFormatType.GEO_POINT:
                instanceInterface.oCurrentEditor = new leafLet.editor.GeoJson({
                    geoJsonType: 'Point',
                    transaction: transaction,
                    EmpDrawEditItem: oDrawItem,
                    feature: oFeature,
                    instanceInterface: instanceInterface
                });
                break;
            case "line":
            case emp.typeLibrary.featureFormatType.GEO_PATH:
                instanceInterface.oCurrentEditor = new leafLet.editor.GeoJson({
                    geoJsonType: 'LineString',
                    transaction: transaction,
                    EmpDrawEditItem: oDrawItem,
                    feature: oFeature,
                    instanceInterface: instanceInterface
                });
                break;
            case "polygon":
            //case emp.typeLibrary.featureFormatType.GEO_POLYGON:
                instanceInterface.oCurrentEditor = new leafLet.editor.GeoJson({
                    geoJsonType: 'Polygon',
                    transaction: transaction,
                    EmpDrawEditItem: oDrawItem,
                    feature: oFeature,
                    instanceInterface: instanceInterface
                });
                break;
            case "airspace":
                instanceInterface.oCurrentEditor = leafLet.utils.airspace.createEditor(instanceInterface,
                        transaction, oDrawItem, oFeature);
                break;
            case "milstd":
                instanceInterface.oCurrentEditor = leafLet.utils.milstd.createEditor(instanceInterface,
                        transaction, oDrawItem, oFeature);
                break;
            default:
                break;
        }

        if (instanceInterface.oCurrentEditor) {
            transaction.pause();
            instanceInterface.bInDrawMode = true;
            instanceInterface.oEditTransaction = transaction;
        }
    };

    engineInterface.draw.end = function (transaction) {
        if (instanceInterface.oEditTransaction.transactionId === transaction.items[0].transactionId) {
            instanceInterface.oCurrentEditor.endEdit();
            instanceInterface.oCurrentEditor.destroy();
            instanceInterface.bInDrawMode = false;
            instanceInterface.oCurrentEditor = undefined;
            instanceInterface.oEditTransaction.run();
            instanceInterface.oEditTransaction = undefined;
        }
    };

    engineInterface.draw.cancel = function (transaction) {
        if (instanceInterface.oEditTransaction.transactionId === transaction.items[0].transactionId) {
            instanceInterface.oCurrentEditor.cancelEdit();
            instanceInterface.oCurrentEditor.destroy();
            instanceInterface.bInDrawMode = false;
            instanceInterface.oCurrentEditor = undefined;
            instanceInterface.oEditTransaction.run();
            instanceInterface.oEditTransaction = undefined;
        }
    };

    engineInterface.edit.begin = function (transaction) {
        var oEditItem = transaction.items[0];
        var oFeature;

        oFeature = instanceInterface.mapEngObjectList[oEditItem.coreId];

        if (oFeature === undefined) {
            transaction.fail([{
                    coreId: oEditItem.coreId,
                    message: "Feature not found.",
                    level: emp.typeLibrary.Error.level.MAJOR
                }]);
        } else if (!oFeature.isEditable()) {
            transaction.fail([{
                    coreId: oEditItem.coreId,
                    message: "This feature can not be edited.",
                    level: emp.typeLibrary.Error.level.MAJOR
                }]);
        } else {
            switch (oFeature.getFormat()) {
                case emp.typeLibrary.featureFormatType.GEOJSON:
                case emp.typeLibrary.featureFormatType.GEO_POINT:
                case emp.typeLibrary.featureFormatType.GEO_PATH:
                case emp.typeLibrary.featureFormatType.GEO_POLYGON:
                    if (emp.helpers.isAOI(oFeature.options)) {
                        instanceInterface.oCurrentEditor = new leafLet.editor.AOI({
                            transaction: transaction,
                            EmpDrawEditItem: oEditItem,
                            feature: oFeature,
                            instanceInterface: instanceInterface
                        });
                    } else {
                        instanceInterface.oCurrentEditor = new leafLet.editor.GeoJson({
                            transaction: transaction,
                            EmpDrawEditItem: oEditItem,
                            feature: oFeature,
                            instanceInterface: instanceInterface
                        });
                    }
                    break;
                case emp.typeLibrary.featureFormatType.KML:
                    instanceInterface.oCurrentEditor = new leafLet.editor.KML({
                        transaction: transaction,
                        EmpDrawEditItem: oEditItem,
                        feature: oFeature,
                        instanceInterface: instanceInterface
                    });
                    break;
                case emp.typeLibrary.featureFormatType.MILSTD:
                    instanceInterface.oCurrentEditor = leafLet.utils.milstd.createEditor(instanceInterface,
                            transaction, oEditItem, oFeature);
                    break;
                case emp.typeLibrary.featureFormatType.AIRSPACE:
                    instanceInterface.oCurrentEditor = leafLet.utils.airspace.createEditor(instanceInterface,
                            transaction, oEditItem, oFeature);
                    break;
/*
                case emp.typeLibrary.featureFormatType.GEO_POINT:
                    instanceInterface.oCurrentEditor = new leafLet.editor.GeoPoint({
                        transaction: transaction,
                        EmpDrawEditItem: oEditItem,
                        feature: oFeature,
                        instanceInterface: instanceInterface
                    });
                    break;
*/
                default:
                    break;
            }
        }

        if (instanceInterface.oCurrentEditor) {
            transaction.pause();
            instanceInterface.bInEditMode = true;
            instanceInterface.oEditTransaction = transaction;
            instanceInterface.oSelectionManager.deselectAllFeatures();
            instanceInterface.oSelectionManager.selectFeature(oFeature);
            instanceInterface.oSelectionManager.generateEvent();
        }
    };

    engineInterface.edit.end = function (transaction) {
        if (instanceInterface.oEditTransaction.transactionId === transaction.items[0].transactionId) {
            instanceInterface.oCurrentEditor.endEdit();
            instanceInterface.oCurrentEditor.destroy();
            instanceInterface.bInEditMode = false;
            instanceInterface.oCurrentEditor = undefined;
            instanceInterface.oEditTransaction.run();
            instanceInterface.oEditTransaction = undefined;
        }
    };

    engineInterface.edit.cancel = function (transaction) {
        if (instanceInterface.oEditTransaction.transactionId === transaction.items[0].transactionId) {
            instanceInterface.oCurrentEditor.cancelEdit();
            instanceInterface.oCurrentEditor.destroy();
            instanceInterface.bInEditMode = false;
            instanceInterface.oCurrentEditor = undefined;
            instanceInterface.oEditTransaction.run();
            instanceInterface.oEditTransaction = undefined;
        }
    };

    engineInterface.selection.set = function (transaction) {
        var oaItems = transaction.items;

        for (var iIndex = 0; iIndex < oaItems.length; iIndex++) {
            var item = oaItems[iIndex];

            try {
                var oFeature;

                if (instanceInterface.mapEngObjectList.hasOwnProperty(item.coreId)) {
                    oFeature = instanceInterface.mapEngObjectList[item.coreId];

                    if (item.select) {
                        instanceInterface.oSelectionManager.selectFeature(oFeature, item.selectedId);
                    } else {
                        instanceInterface.oSelectionManager.deselectFeature(oFeature, item.selectedId);
                    }
                } else {
                    transaction.fail(new emp.typeLibrary.Error({
                        coreId: item.coreId,
                        level: emp.typeLibrary.Error.level.MAJOR,
                        message: "feature " + item.featureId + " does not exists."
                    }));
                    iIndex--;
                    continue;
                }
            } catch (Ex) {
                transaction.fail(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: Ex.name + ": " + Ex.message,
                    jsError: Ex
                }));
                iIndex--;
            }
        }
        instanceInterface.oSelectionManager.resetEventData();
    };

    engineInterface.navigation.enable = function (transaction) {
        var enabled;

        try {
          if (transaction && transaction.items) {
            enabled = transaction.items[0];
            if (enabled.lock !== instanceInterface.getLockState()) {
              instanceInterface.setLockState(enabled.lock);
              switch (instanceInterface.getLockState()) {
                case emp3.api.enums.MapMotionLockEnum.NO_MOTION:
                  instanceInterface.leafletInstance.dragging.disable();
                  instanceInterface.leafletInstance.doubleClickZoom.disable();
                  instanceInterface.leafletInstance.scrollWheelZoom.disable();
                  instanceInterface.leafletInstance.keyboard.disable();
                  if (instanceInterface.leafletInstance.zoomControl) {
                    instanceInterface.leafletInstance.zoomControl.remove(instanceInterface.leafletInstance);
                  }
                  break;
                case emp3.api.enums.MapMotionLockEnum.NO_PAN:
                  instanceInterface.leafletInstance.dragging.disable();
                  instanceInterface.leafletInstance.doubleClickZoom.enable();
                  instanceInterface.leafletInstance.scrollWheelZoom.enable();
                  instanceInterface.leafletInstance.keyboard.disable();
                  if (instanceInterface.leafletInstance.zoomControl) {
                    instanceInterface.leafletInstance.zoomControl.addTo(instanceInterface.leafletInstance);
                  }
                  break;
                case emp3.api.enums.MapMotionLockEnum.NO_ZOOM:
                  instanceInterface.leafletInstance.dragging.enable();
                  instanceInterface.leafletInstance.doubleClickZoom.disable();
                  instanceInterface.leafletInstance.scrollWheelZoom.disable();
                  instanceInterface.leafletInstance.keyboard.enable();
                  if (instanceInterface.leafletInstance.zoomControl) {
                    instanceInterface.leafletInstance.zoomControl.remove(instanceInterface.leafletInstance);
                  }
                  break;
                case emp3.api.enums.MapMotionLockEnum.NO_ZOOM_NO_PAN:
                  instanceInterface.leafletInstance.dragging.disable();
                  instanceInterface.leafletInstance.doubleClickZoom.disable();
                  instanceInterface.leafletInstance.scrollWheelZoom.disable();
                  instanceInterface.leafletInstance.keyboard.disable();
                  if (instanceInterface.leafletInstance.zoomControl) {
                    instanceInterface.leafletInstance.zoomControl.remove(instanceInterface.leafletInstance);
                  }
                  break;
                case emp3.api.enums.MapMotionLockEnum.SMART_MOTION:
                  instanceInterface.leafletInstance.dragging.disable();
                  instanceInterface.leafletInstance.doubleClickZoom.disable();
                  instanceInterface.leafletInstance.scrollWheelZoom.disable();
                  instanceInterface.leafletInstance.keyboard.disable();
                  if (instanceInterface.leafletInstance.zoomControl) {
                    instanceInterface.leafletInstance.zoomControl.remove(instanceInterface.leafletInstance);
                  }
                  break;
                case emp3.api.enums.MapMotionLockEnum.UNLOCKED:
                  instanceInterface.leafletInstance.dragging.enable();
                  instanceInterface.leafletInstance.doubleClickZoom.enable();
                  instanceInterface.leafletInstance.scrollWheelZoom.enable();
                  instanceInterface.leafletInstance.keyboard.enable();
                  if (instanceInterface.leafletInstance.zoomControl) {
                    instanceInterface.leafletInstance.zoomControl.addTo(instanceInterface.leafletInstance);
                  }
                  break;
                default:
                  throw new Error("MapMotionLockEnum is not valid.");
                  break;
              }
            }
            transaction.run();
          }
        } catch (Ex) {
          new emp.typeLibrary.Error({
            level: emp.typeLibrary.Error.level.MAJOR,
            message: Ex.name + ": " + Ex.message,
            jsError: Ex
          });
        }
    };

    engineInterface.settings.mil2525.icon.size.set = function (transaction) {
        var oEmpObject;
        var sCoreId;

        instanceInterface.iMilStdIconSize = transaction.items[0];

        try {
            for (sCoreId in instanceInterface.mapEngObjectList) {
                if (!instanceInterface.mapEngObjectList.hasOwnProperty(sCoreId)) {
                    continue;
                }
                oEmpObject = instanceInterface.mapEngObjectList[sCoreId];

                if ((oEmpObject.getObjectType() === leafLet.typeLibrary.objectType.FEATURE) &&
                        (oEmpObject.getFormat() === emp.typeLibrary.featureFormatType.MILSTD) &&
                        !oEmpObject.isMultiPointTG()) {
                    oEmpObject.updateIconSize();
                }
            }
        } catch (Ex) {
            new emp.typeLibrary.Error({
                level: emp.typeLibrary.Error.level.MAJOR,
                message: Ex.name + ": " + Ex.message,
                jsError: Ex
            });
        }
    };

    engineInterface.settings.mil2525.icon.labels.set = function (transaction) {
        var oEmpObject;
        var sCoreId;

        try {
            var sTemp = JSON.stringify(transaction.items[0]);
            instanceInterface.oLabelList = JSON.parse(sTemp);

            for (sCoreId in instanceInterface.mapEngObjectList) {
                if (!instanceInterface.mapEngObjectList.hasOwnProperty(sCoreId)) {
                    continue;
                }
                oEmpObject = instanceInterface.mapEngObjectList[sCoreId];

                if ((oEmpObject instanceof leafLet.typeLibrary.MilStdFeature) && !oEmpObject.isMultiPointTG()) {
                    oEmpObject.updateFeature({bUpdateGraphic: true});
                }
            }
        } catch (Ex) {
            new emp.typeLibrary.Error({
                level: emp.typeLibrary.Error.level.MAJOR,
                message: Ex.name + ": " + Ex.message,
                jsError: Ex
            });
        }
    };

    engineInterface.wms.add = function (transaction) {
        var oaItems = transaction.items;

        for (var iIndex = 0; iIndex < oaItems.length; iIndex++) {
            var item = oaItems[iIndex];

            try {
                var oNewWMS;

                if (instanceInterface.isV2Core()) {
                    item.useProxy = emp.util.config.getUseProxySetting();
                }

                if (instanceInterface.mapEngObjectList.hasOwnProperty(item.coreId)) {
                    // Its an update
                    oNewWMS = instanceInterface.mapEngObjectList[item.coreId];

                    oNewWMS.updateWMS(item);
                } else {
                    oNewWMS = new leafLet.typeLibrary.WMS({
                        item: item,
                        instanceInterface: instanceInterface
                    });

                    if (instanceInterface.mapEngObjectList.hasOwnProperty(oNewWMS.getParentCoreId())) {
                        // The parent exists.
                        var oParentOverlay = instanceInterface.mapEngObjectList[oNewWMS.getParentCoreId()];

                        oParentOverlay.addChildObject(oNewWMS);
                    } else {
                        // The parent does not exists.
                        item.createParent();
                        if (instanceInterface.mapEngObjectList.hasOwnProperty(oNewWMS.getParentCoreId())) {
                            // The parent exists.
                            var oParentOverlay = instanceInterface.mapEngObjectList[oNewWMS.getParentCoreId()];

                            oParentOverlay.addChildObject(oNewWMS);
                        } else {
                            transaction.fail(new emp.typeLibrary.Error({
                                coreId: item.coreId,
                                level: emp.typeLibrary.Error.level.MAJOR,
                                message: "Parent " + oNewWMS.getParentCoreId() + " does not exists."
                            }));
                            iIndex--;
                            continue;
                        }
                    }

                    instanceInterface.addEmpObject(oNewWMS);
                }
            } catch (Ex) {
                transaction.fail(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: Ex.name + ": " + Ex.message,
                    jsError: Ex
                }));
                iIndex--;
            }
        }
    };

    engineInterface.wms.remove = function (transaction) {
        var oaItems = transaction.items;

        for (var iIndex = 0; iIndex < oaItems.length; iIndex++) {
            var item = oaItems[iIndex];
            try {
                if (instanceInterface.mapEngObjectList.hasOwnProperty(item.coreId)) {
                    // The feature exists.
                    var oParentOverlay;
                    var oFeature = instanceInterface.mapEngObjectList[item.coreId];

                    if (item.parentCoreId === undefined) {
                        // The parent is the root.
                        oParentOverlay = instanceInterface.rootOverlay;
                    } else {
                        oParentOverlay = instanceInterface.mapEngObjectList[item.parentCoreId];
                    }

                    oParentOverlay.removeChildObject(oFeature);
                    oFeature.destroy();
                } else {
                    transaction.fail(new emp.typeLibrary.Error({
                        coreId: item.coreId,
                        level: emp.typeLibrary.Error.level.MAJOR,
                        message: "WMS " + item.id + " does not exists."
                    }));
                    iIndex--;
                }
            } catch (Ex) {
                transaction.fail(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    level: emp.typeLibrary.Error.level.MAJOR,
                    message: Ex.name + ": " + Ex.message,
                    jsError: Ex
                }));
                iIndex--;
            }
        }
    };

    engineInterface.view.getLatLonFromXY = function (transaction) {
        var item;
        var oLatLng;
        var oPoint;

        for (var i = 0; i < transaction.items.length; i += 1) {
            item = transaction.items[i];

            oPoint = new L.Point(item.x, item.y);
            oLatLng = instanceInterface.leafletInstance.containerPointToLatLng(oPoint);

            if (oLatLng) {
                item.lat = oLatLng.lat;
                item.lon = oLatLng.lng;
            }
        }
    };

    engineInterface.view.getXYFromLatLon = function (transaction) {
        var item;
        var oLatLng;
        var oPoint;

        for (var i = 0; i < transaction.items.length; i += 1) {
            item = transaction.items[i];

            oLatLng = new L.LatLng(item.lat, item.lon);

            oPoint = instanceInterface.leafletInstance.latLngToContainerPoint(oLatLng);

            if (oPoint) {
                item.x = oPoint.x;
                item.y = oPoint.y;
            }
        }
    };

    engineInterface.lookAt.set = function(transaction) {
      var iIndex;

      try {
        if (instanceInterface.getLockState() === emp3.api.enums.MapMotionLockEnum.NO_MOTION) {
          throw new Error("The current lock state is set to \"NO_MOTION\".");
        } else {
          for (iIndex = 0; iIndex < transaction.items.length; iIndex += 1) {
            if (instanceInterface.setLookAt(transaction.items[iIndex])) {
              iIndex++;
            } else {
              transaction.fail([{
                coreId: transaction.items[iIndex].coreId,
                level: emp.typeLibrary.Error.level.MAJOR,
                message: "Fail to set LookAt."
              }]);
            }
          }
        }
      } catch (err) {
        transaction.fail([new emp.typeLibrary.Error({
          coreId: transaction.items[0].coreId,
          message: "An error occurred while attempting to set the lookAt object: ",
          level: emp.typeLibrary.Error.level.MAJOR,
          jsError: err
        })]);
      }
    };

    engineInterface.map.config = function (transaction) {
      var iIndex,
          prop,
          previousRenderSettings = {
            enabled: instanceInterface.renderingOptimization.enabled,
            midDistanceThreshold: instanceInterface.renderingOptimization.midDistanceThreshold,
            farDistanceThreshold: instanceInterface.renderingOptimization.farDistanceThreshold.value
          },
          newConfig;

      for (iIndex = 0; iIndex < transaction.items.length; iIndex += 1) {
        newConfig = transaction.items[0];
        try {
          for (prop in newConfig) {
            switch (prop) {
              case "renderingOptimization":
                if (typeof newConfig[prop] !== 'boolean') {
                  throw new Error("'renderingOptimization' property must be of Boolean type.");
                }
                instanceInterface.renderingOptimization.enabled = newConfig[prop];
                break;
              case "midDistanceThreshold":
                if (typeof newConfig[prop] !== 'number') {
                  throw new Error("'midDistanceThreshold' property must be of Number type.");
                }
                instanceInterface.renderingOptimization.midDistanceThreshold = newConfig[prop];
                break;
              case "farDistanceThreshold":
                if (typeof newConfig[prop] !== 'number') {
                  throw new Error("'farDistanceThreshold' property must be of Number type.");
                }
                instanceInterface.renderingOptimization.farDistanceThreshold.value = newConfig[prop];
                break;
              case "brightness":
                break;
            }
          }
          if (previousRenderSettings.enabled) {
            // In both of these cases a change has occurred from the previous state of the configuration attributes which
            // must trigger a re-render of the graphics. If previous attributes haven't changed then no re-render should
            // occur.
            if (!instanceInterface.renderingOptimization.enabled) {
              instanceInterface.renderingOptimization.viewInZone = undefined;
              instanceInterface.renderingOptimization.zoneChanged = true;
              instanceInterface.scheduleRendering();
              instanceInterface.renderingOptimization.zoneChanged = false;
            } else if (previousRenderSettings.midDistanceThreshold !== instanceInterface.renderingOptimization.midDistanceThreshold ||
                       previousRenderSettings.farDistanceThreshold !== instanceInterface.renderingOptimization.farDistanceThreshold.value) {
              instanceInterface.renderingOptimization.refreshZone();
              instanceInterface.scheduleRendering();
              instanceInterface.renderingOptimization.zoneChanged = false;
            }
          } else {
            // If the previous enabled state is false and set to true a re-render must occur. Although the far and mid
            // distance threshold values can change, a re-render is only necessary when the enabled property is set to
            // true.
            if (instanceInterface.renderingOptimization.enabled) {
              instanceInterface.renderingOptimization.refreshZone();
              instanceInterface.scheduleRendering();
              instanceInterface.renderingOptimization.zoneChanged = false;
            }
          }
          transaction.run();
        } catch (e) {
          transaction.fail(new emp.typeLibrary.Error({
            coreId: newConfig.coreId,
            level: emp.typeLibrary.Error.level.MAJOR,
            message: e.name + ": " + e.message,
            jsError: e
          }));
          iIndex--;
        }
      }
    };

    engineInterface.implementation.displayName = "Leaflet Map Engine";
    engineInterface.implementation.version = "34.0";

    var sGenericHelpText =
            "<table style='width:100%;padding-top: 10px; border:1px solid #4a4a4a;' >" +
            "<thead>" +
            "<tr style='border:1px solid #4a4a4a;'>" +
            "<th style='border:1px solid #4a4a4a; padding:5px; collapse:collapse;width:40%'>Action</th>" +
            "<th style='border:1px solid #4a4a4a; padding:5px; collapse:collapse;width:25%'>Ctrl Point</th>" +
            "<th style='border:1px solid #4a4a4a; padding:5px; collapse:collapse;width:35%'>Mouse/ Key</th>" +
            "</tr>" +
            "</thead>" +
            "<tbody>" +
            "<tr style='border:0px;'>" +
            "<td colspan='3' style='padding: 0px;'>" +
            "<div style='overflow:auto; width:100%;'>" +
            "<table style='border:1px solid #4a4a4a; collapse:collapse;width:100%;' >" +
            "<tr>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; width:40%' >Drag laterally to alter the Lat/Long of vertex</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; width:25%;color:blue;vertical-align:middle;text-align:center'>Blue</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; width:35%'>Mouse left button drag</td>" +
            "</tr>" +
            "<tr>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; ' >Drag to alter width</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; color:lightgrey;vertical-align:middle;text-align:center'>Grey</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; '>Mouse left button drag</td>" +
            "</tr>" +
            "<tr>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; ' >Drag to alter radius</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; color:grey;vertical-align:middle;text-align:center'>Dark Grey</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; '>Mouse left button drag</td>" +
            "</tr>" +
            "<tr>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; ' >Drag to alter angle</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; color:yellow;vertical-align:middle;text-align:center;vertical-align:middle;text-align:center'>Yellow</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; '>Mouse left button drag</td>" +
            "</tr>" +
            "<tr>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; ' >Drag laterally to alter shape's side Lat/Long</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; color:cyan;vertical-align:middle;text-align:center'>Cyan</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; '>Mouse left button drag</td>" +
            "</tr>" +
            "<tr>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; ' >Add new vertex</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; vertical-align:middle;text-align:center'></td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; '>left click at location</td>" +
            "</tr>" +
            "<tr>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; ' >Remove selected vertex</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; color:blue;vertical-align:middle;text-align:center'>blue</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; '>Double left click</td>" +
            "</tr>" +
            "<tr>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; ' >Drag laterally to alter shape's position</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; '></td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px; '>Mouse left button drag on feature</td>" +
            "</tr>" +
            "<tr>" +
            "<td style='border:1px solid #4a4a4a;padding:5px;' >Complete the edit session</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px;vertical-align:middle;text-align:center'></td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px;'>Click the Finish button</td>" +
            "</tr>" +
            "<tr>" +
            "<td style='border:1px solid #4a4a4a;padding:5px;' >Cancel the edit session</td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px;vertical-align:middle;text-align:center'></td>" +
            "<td style='border:1px solid #4a4a4a;padding:5px;'>Click the Cancel button</td>" +
            "</tr>" +
            "</table>" +
            "</div>" +
            "</td>" +
            "</tr>" +
            "</tbody>" +
            "</table>";

    engineInterface.implementation.help.edit = sGenericHelpText;

    engineInterface.implementation.help.draw = sGenericHelpText;

    engineInterface.capabilities.projection.flat = false;
    engineInterface.capabilities.mapType.type2D = true;
    //engineInterface.capabilities.mapType.type2_5D = false;
    //engineInterface.capabilities.mapType.type3D = false;
    engineInterface.capabilities.formats.GEOJSON_BASIC.plot = true;
    engineInterface.capabilities.formats.GEOJSON_BASIC.draw = true;
    engineInterface.capabilities.formats.GEOJSON_BASIC.edit = true;
    engineInterface.capabilities.formats.GEOJSON_FULL.plot = true;
    //engineInterface.capabilities.formats.GEOJSON_FULL.draw = false;
    //engineInterface.capabilities.formats.GEOJSON_FULL.edit = false;
    engineInterface.capabilities.formats.WMS.version_1_1 = true;
    engineInterface.capabilities.formats.WMS.version_1_3 = true;
    //engineInterface.capabilities.formats.WMS.elevationData = false;

    engineInterface.capabilities.formats.KML_BASIC.plot = true;
    //engineInterface.capabilities.formats.KML_BASIC.draw = false;
    engineInterface.capabilities.formats.KML_BASIC.edit = true;

    engineInterface.capabilities.formats.KML_COMPLEX.plot = true;
    //engineInterface.capabilities.formats.KML_COMPLEX.draw = false;
    //engineInterface.capabilities.formats.KML_COMPLEX.edit = false;

    engineInterface.capabilities.formats.IMAGE.plot = true;
    //engineInterface.capabilities.formats.IMAGE.edit = false;

    engineInterface.capabilities.formats.MILSTD.version2525B.plot = true;
    engineInterface.capabilities.formats.MILSTD.version2525B.draw = true;
    engineInterface.capabilities.formats.MILSTD.version2525B.edit = true;

    engineInterface.capabilities.formats.MILSTD.version2525C.plot = true;
    engineInterface.capabilities.formats.MILSTD.version2525C.draw = true;
    engineInterface.capabilities.formats.MILSTD.version2525C.edit = true;

    engineInterface.capabilities.formats.AIRSPACE.plot = true;
    engineInterface.capabilities.formats.AIRSPACE.draw = true;
    engineInterface.capabilities.formats.AIRSPACE.edit = true;

    engineInterface.capabilities.formats.AOI.plot = true;
    engineInterface.capabilities.formats.AOI.draw = false;
    engineInterface.capabilities.formats.AOI.edit = true;

    engineInterface.capabilities.formats.ArcGIS = false;
    engineInterface.capabilities.overlayClustering = true;

    engineInterface.capabilities.settings.milstd.iconSize = true;
    engineInterface.capabilities.settings.milstd.labelOption = true;

    engineInterface.capabilities.settings.iconSize = false;
    // return the engineInterface object as a new engineTemplate instance

    try {
        var center;
        var level = 0;
        var southWest = L.latLng(-90.0, -180.0);
        var northEast = L.latLng(90.0, 180.0);
        var maxBounds = L.latLngBounds(southWest, northEast);

        if (args.initialExtent !== undefined) {
            if (args.initialExtent.hasOwnProperty('centerLat')) {
                center = new L.LatLng(args.initialExtent.centerLat, args.initialExtent.centerLon);

                if (args.initialExtent.hasOwnProperty('range')) {
                    level = instanceInterface.getLevel(args.initialExtent.range * instanceInterface.rangeToScaleMultiplier);
                } else if (args.initialExtent.hasOwnProperty('scale')) {
                    level = instanceInterface.getLevel(args.initialExtent.scale);
                }
            } else {
                center = new L.LatLng(0, 0);
                var southWest = L.latLng(args.initialExtent.south, args.initialExtent.west),
                    northEast = L.latLng(args.initialExtent.north, args.initialExtent.east);

                bounds = L.latLngBounds(southWest, northEast);
            }
        } else {
            center = new L.LatLng(0, 0);
        }
        // L is the global ref to Leaflet
        instanceInterface.leafletInstance = L.map(args.container, {
            worldCopyJump: false,
            zoomControl: true,
            //zoomAnimation: false,
            minZoom: 1,
            center: center,
            zoom: level,
            //maxBounds : maxBounds,
            boxZoom: false,
            trackResize: false,
            attributionControl: false,
            doubleClickZoom: false,
            scrollWheelZoom: true
        });

        if ((instanceInterface.leafletInstance === undefined) || (instanceInterface.leafletInstance === null)) {
            throw "Leaflet creation failed.";
        }
        // Place the zoom control on the right side of the map to remain consistent with other engines.
        instanceInterface.leafletInstance.zoomControl.setPosition('topright');
        instanceInterface.leafletInstance.whenReady(function () {
            setTimeout(engineInterface.initialize.succeed, 100);
        });
        //emp.map.engineDirect = {name: "leaflet", ref: instanceInterface.leafletInstance};
        $('.leaflet-container').css('cursor', 'pointer');
    } catch (err) {
        setTimeout(engineInterface.initialize.fail, 0);
    }
    return engineInterface;
};
