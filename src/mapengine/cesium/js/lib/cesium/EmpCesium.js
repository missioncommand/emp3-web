
/* global Cesium, cesiumEngine, EmpCesiumConstants, emp */
var emp3 = emp3 || {};
emp3.api = emp3.api || {};
emp3.api.enums = emp3.api.enums || {};
emp3.api.enums.FeatureTypeEnum = emp3.api.enums.FeatureTypeEnum || {};

function EmpCesium()
{
    this.isV2Core = false;
    this.canvas = undefined;
    this.ellipsoid = undefined;
    this.scene = undefined;
    this.primitives = undefined;
    this.cb = undefined;
    this.proxyUrl = undefined;
    this.terrainProxyUrl = undefined;
    this.terrainURL = undefined;
    this.terrainProvider = null;
    this.terrainProviderType = undefined,
            this.transitioner = undefined;
    this.imageryLayerCollection = undefined;
    this.entityCollection = undefined;
    /* Max extent altitude in km */
    this.MAX_EXTENT_ALTITUDE = 6000;
    /* The ratio used to estimate a camera "height" in 2D mode */
    this.ALTITUDE_2D_RATIO = 6;
    var is2d = false;
    this.ellipsoid = undefined;
    this.viewer = undefined;
    this.globe = undefined;
    this.lastClockTickTime = undefined;
    //this.lastClockTickTime = new this.JulianDate();
    this.empLayers = {};
    this.empSelections = {};
    this.multiPointCollection = {};
    this.singlePointCollection = {};
    this.singlePointCount = 0;
    this.singlePointCollectionIdOnHold = {};
    this.singlePointsIdOnHoldCount = 0;
    this.airspaceCollection = {};
    this.drawHelper = undefined;
    this.lastCamera = undefined;
    this.lastPosition = undefined;
    // Timer for suppressing map move events until 300 ms expiration occurs
    // contains a geEngine.Batch object to control the rate of refreshing MIL-STD-2525 tactical
    // graphics multipoint objects.  Without this, the screen locks until all the tactical graphics are
    // refreshed.
    this.moveEndTimerId = null;
    this.refreshBatch;
    //this.refreshSinglePointOnHoldBatch;
    // contains a geEngine.Batch object to control the rate of redrawing single point MIL-STD-2525
    // single point graphics when a user changes the label or size settings.  Without this, the
    // browser would lock until all the symbols are redrawn.
    this.refreshLabelsSizeBatch;
    this.airspaceMapCntrl = undefined;
    this.airspaceDrawHandler = undefined;
    this.mapCntrl = undefined;
    this.mouseHandler = undefined;
    this.scale = undefined;
    this.scaleTimeout = undefined;
    this.prevScale = undefined;
    this.cameraAltitude = 1000000;
    this.airspaceInit = undefined;
    this.maxAltitudeLabelVisible = 6200000;
    this.multipointRedrawEpsilon = undefined;
    this.currentExtent = undefined;
    this.urlAddressesNotAccessible = undefined;
    this.cesiumRenderOptimizer = undefined;
    this.moveEndTimerId = undefined;
    this.oEventHandler = undefined;
    // Used to determine which MIL-STD-2525 labels should be
    // drawn for single point symbols.
    this.iconLabels = [];
    this.iconLabelOption = "common";
    // Constant; the default pixel size of all the MIL-STD-2552 imagery
    this.multiPointRenderType = EmpCesiumConstants.MultiPointRenderType.SVG;
    this.iconPixelSize = 32;
    this.lastMouseClick = new Date().getTime();
    this.oMouseMoveEventData = undefined;
    this.dynamicOverlayHash = {}; // For Cesium dynamic data (czml)
    this.empLabelSize = 0.9;
    this.showLabels = true;
    this.drawingOverlayId = "drawingToolOverlay-1";
    this.hMouseMoveTimer = null;
    this.viewTransaction;
    this.currentDrawingId;
    this.scaleMultiplier = .0025;
    this.empMapInstance;
    this.debugExtent = undefined;
    // this.extentRectangle = undefined;
    this.extentEntity = undefined;
    this.editorController;
    this.mapEngineExposed = undefined;
    this.baseURL = undefined;
    this.relativeBaseURL = undefined;
    this.rootOverlayId = undefined;
    this.cameraStoppedMoving = true;
    this.removeCameraMoveStartListener = undefined;
    this.removeCameraMoveEndListener = undefined;
    this.cesiumContentCoreId = undefined;
    this.cesiumContent = undefined;
    this.cesiumContentLayerList = undefined;
    this.autoSelect = true; // false is the default in V2.
    this.pinBuilder = new this.PinBuilder();
    this.highScaleImage = {};
    this.highScaleImage.highScaleImageRed = '<svg preserveAspectRatio="none" width="25px" height="30px"   xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="translate(0,0)  "><circle  cx="12" cy="12"  r="3" fill="red" stroke="red" stroke-width="1"  /></g></svg>';
    this.highScaleImage.highScaleImageBlue = '<svg preserveAspectRatio="none" width="25px" height="30px"   xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="translate(0,0)  "><circle cx="12" cy="12"  r="3" fill="blue" stroke="blue" stroke-width="1"  /></g></svg>';
    this.highScaleImage.highScaleImageGreen = '<svg preserveAspectRatio="none" width="25px" height="30px"   xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="translate(0,0)  "><circle  cx="12" cy="12" r="3" fill="green" stroke="green" stroke-width="1"  /></g></svg>';
    this.highScaleImage.highScaleImageYellow = '<svg preserveAspectRatio="none" width="25px" height="30px"   xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="translate(0,0)  "><circle  cx="12" cy="12" r="3" fill="yellow" stroke="yellow" stroke-width="1"  /></g></svg>';
    this.highScaleImage.blankMultipoint = '<svg preserveAspectRatio="none" width="2px" height="2px"   xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="translate(0,0)  "><circle  cx="12" cy="12" r="3" fill="black" stroke="black" stroke-width="1"  /></g></svg>';
    this.highScaleImage.blankMultipointBase64 = 'data:image/svg+xml;base64,' + window.btoa(this.highScaleImage.blankMultipoint);
    this.isHighRate = false;
    this.throttleAddSymbolSinglePrimitive;
    this.throttleSymbolSingleOnHold;
    this.throttleMil2525IconLabelSet;
    this.throttleAddMultiPointEntity;
    this.isSkyVisible = undefined;
    this.starBurst = undefined;
    this.singlePointAltitudeRanges = {};
    this.singlePointAltitudeRanges.mid = 600000;
    this.singlePointAltitudeRanges.high = 1200000;
    this.singlePointAltitudeRangeMode = EmpCesiumConstants.SinglePointAltitudeRangeMode.LOW_RANGE;
    this.viewerCesiumNavigationMixinOptions;
    this.enableRenderingOptimization = false;
    this.editorFeatureDraggingEnable = false;
    this.selectionColor = EmpCesiumConstants.selectionProperties.COLOR;// YELLOW BY DEFAULT
    this.selectionColorHex = EmpCesiumConstants.selectionProperties.COLOR_HEX;// YELLOW BY DEFAULT
    this.selectionScale = 1;// 1 BY DEFAULT / only applies to single points.
    this.secRendererWorker = {};
    this.secRendererWorker.A = undefined;
    this.secRendererWorker.B = undefined;
    //this.secRendererWorker.Selection = undefined;
    //this.secRendererWorker.DeSelection = undefined;
    this.mapMotionLockEnum = emp3.api.enums.MapMotionLockEnum.UNLOCKED;
    this.freeHandPositions = undefined;
    this.backgroundBrightnessAlpha = 0;
    this.stiBrightnessWhite;
    this.stiBrightnessBlack;
    //this.secRendererWorker.C = undefined;
    this.secRendererWorker.lastSelected = EmpCesiumConstants.RendererWorker.B;
    this.enableClusterIcon = true;
    this.currentMultiPointEditorRenderGraphicFuction;
    this.bMartMapMoving = false;
    this.bSmartMapMovingRightZone = false;
    this.bSmartMapMovingLeftZone = false;
    this.bSmartMapMovingTopZone = false;
    this.bSmartMapMovingBottomZone = false;
    this.bSmartMapMovingTopRightZone = false;
    this.bSmartMapMovingBottomRightZone = false;
    this.bSmartMapMovingTopLeftZone = false;
    this.bSmartMapMovingBottomLeftZone = false;
    this.startMousePosition = undefined;
    this.mousePosition = undefined;
    // this.cesiumConverter;
    this.drawData = {
        transaction: null,
        drawingCoordinates: '',
        minPoints: 0,
        maxPoints: 0,
        id: '',
        name: '',
        coordLen: 0,
        altitude: 0,
        drawType: '',
        drawCategory: null,
        controlPointX: null,
        controlPointY: null,
        startPointX: null,
        startPointY: null,
        properties: {},
        isDrawing: false,
        isEditing: false,
        isDragging: false
    };
    this.initialize = function initialize(viewer)
    {
        this.multipointRedrawEpsilon = this.Math.EPSILON9; // more sensitive
        this.lastClockTickTime = new this.JulianDate();
        this.urlAddressesNotAccessible = {};
        this.ellipsoid = this.Ellipsoid.WGS84;
        this.scene = viewer.scene;
        this.scene.rethrowRenderErrors = true; // useful to continually get the renderer errors by the render error listener;
        this.viewer = viewer;
        this.primitives = this.scene.primitives; //27
        this.canvas = this.scene.canvas;
        this.viewer._cesiumWidget._canvas.oncontextmenu = function (e)
        {
            //disable default browser context menu and use emp context menu
            e.preventDefault();
            return false;
        }.bind(this);
        this.globe = new this.Globe(this.ellipsoid);
        this.scene.globe = this.globe; //27 rp
        this.imageryLayerCollection = this.scene.imageryLayers;
        this.entityCollection = this.viewer.entities;
        this.airspaceInit = new AirspaceInit();
        this.airspaceInit.initialize(this); // this represents the empCesium
        this.mapCntrl = this.airspaceInit.getMapcntrl();
        this.currExtent = this.getExtent();
        if (this.currExtent)
        {
            this.prevExtent = this.currExtent.clone();
        }
        //this.prevScale = this.getScale();
        this.lastCamera = this.cloneCamera(this.viewer.scene.camera);
        this.lastPosition = this.viewer.scene.camera.position.clone();
        //TAIS airspaces
        this.MapViewList = [];
        this.scene.skyBox = new this.SkyBox({
            sources: {
                positiveX: this.getDefaultSkyBoxUrl('px'),
                negativeX: this.getDefaultSkyBoxUrl('mx'),
                positiveY: this.getDefaultSkyBoxUrl('py'),
                negativeY: this.getDefaultSkyBoxUrl('my'),
                positiveZ: this.getDefaultSkyBoxUrl('pz'),
                negativeZ: this.getDefaultSkyBoxUrl('mz')
            }
        });
        this.scene.skyAtmosphere = new this.SkyAtmosphere();
        //this.scene.sun = new this.Sun();
        if (is2d)
        {
            this.do2DView();
        }
        document.oncontextmenu = function ()
        {
            return false;
        };
        /* The first time initializeFrame runs, it doesn't quite get everything right
         * (camera controller doesn't have its mode set). We're gonna run it here so that
         * the second time it runs, everything is good. */
        this.scene.initializeFrame();
        // setup and start rendering Cesium
        this.scene.render();
        this.cesiumRenderOptimizer = new CesiumRenderOptimizer(this);
        //initialize events listeners
        this.addEventListener("left");
        this.addEventListener("middle");
        this.addEventListener("right");
        this.addEventListener("mousemove");
        this.editorController = new EditorController(this);
        //initlaize current EmpCesium state
        this.currExtent = this.getExtent();
        this.prevExtent = this.currExtent.clone();
        this.prevScale = this.getScale();
        this.lastCamera = this.cloneCamera(this.viewer.scene.camera);
        this.lastPosition = this.viewer.scene.camera.position.clone();
        this.calculateScale();
        this.cameraAltitude = this.calculateCameraAltitude();

        // initialize refresh batch callback
        this.refreshBatch = new this.Batch({
            callback: this.addSymbolMulti,
            empCesium: this,
            isDiscardContentEnabled: true,
            isMultipoint: true
        });
//                // initialize refresh batch callback
//                this.refreshSinglePointOnHoldBatch = new this.Batch({
//                    callback: this.addSymbolSinglePrimitive,
//                    empCesium: this,
//                    isDiscardContentEnabled: false,
//                    isMultipoint: false
//                });

        this.removeCameraMoveStartListener = this.viewer.camera.moveStart.addEventListener(function ()
        {
            // the camera started to move
            this.viewChange(this.currentExtent, emp3.api.enums.MapViewEventEnum.VIEW_IN_MOTION);
            this.cameraStoppedMoving = false;
            this.starBurst.undoStarBurst();
        }.bind(this));

        this.removeCameraMoveEndListener = this.viewer.camera.moveEnd.addEventListener(function ()
        {
            // the camera stopped moving
            this.cameraStoppedMoving = true;
            this.FlyToComplete();
            this.viewChange(this.currentExtent, emp3.api.enums.MapViewEventEnum.VIEW_MOTION_STOPPED);

            if ((this.drawData.isEditing === true || this.drawData.isDrawing === true) && this.defined(this.currentMultiPointEditorRenderGraphicFuction))
            {
                this.currentMultiPointEditorRenderGraphicFuction();
            }


            if (this.entityCollection.values && this.entityCollection.values.length > 0)
            {
                for (var index = 0; index < this.entityCollection.values.length; index++)
                {
                    var entity = this.entityCollection.values[index];
                    if (entity.billboard)
                    {
                        entity.billboard.eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(this.viewer.camera.positionCartographic.height, this.cameraAltitude);
                    }
                }
                // if (this.getScale() <= 1000 && this.Math.toDegrees(Math.abs(this.scene.camera.pitch)) > 15)
                //  {
                //console.log("redrawGraphics started");
                if (this.Math.toDegrees(Math.abs(this.scene.camera.pitch)) > 35)
                {
                    this.redrawGraphics();
                }
                //console.log("redrawGraphics ended");
                // }
            }
            this.singlePointAltitudeRangeMode = cesiumEngine.utils.getSinglePointAltitudeRangeMode(this.cameraAltitude, this.singlePointAltitudeRanges);
            this.processOnRangeChangeSinglePoints();


            //process on hold single point primitives
            this.processOnHoldSinglePoints();
            /*
             if (this.viewTransaction)
             {
             for (var i = 0; i < this.viewTransaction.items.length; i += 1)
             {
             var item = this.viewTransaction.items[i];
             this.formatView(item);
             }
             this.viewTransaction.run();
             this.viewTransaction = undefined;
             }
             */
        }.bind(this));

//         window.onbeforeunload = function()
//            {
//                this.destroy();
//                return ;
//            }.bind(this);


        if (this.debugExtent)
        {
            this.viewer.entities.add({
                name: 'IDL',
                polyline: {
                    positions: Cesium.Cartesian3.fromDegreesArray([-179.9, 80,
                        -179.9, -80]),
                    width: 2,
                    material: Cesium.Color.WHITE
                }
            });

            var extentRectangle = this.viewer.scene.camera.computeViewRectangle(this.viewer.scene.globe.ellipsoid);
            this.extentEntity = this.viewer.entities.add({
                rectangle: {
                    coordinates: extentRectangle,
                    material: Cesium.Color.RED.withAlpha(0.5),
                    outline: true,
                    outlineColor: Cesium.Color.RED
                }
            });
        }
        // if (this.enableRenderingOptimization) // let initialize the throttling classes even when optimization is off.
        // the idea is to allow the optimization to get activated on demand by the engine based on heavy load or by the api.
        // {
        this.throttleAddSymbolSinglePrimitive = this.SinglePointRateLimit(this.addSymbolSinglePrimitive, 20);
        this.throttleMil2525IconLabelSet = this.SinglePointRateLimit(this.updateSymbolLabels, 20);
        this.throttleMil2525IconSizeSet = this.SinglePointRateLimit(this.updateSymbolIconSize, 20);
        this.throttleSymbolSingleOnHold = this.SinglePointRateLimit(this.addSymbolSinglePrimitive, 20);
        this.throttleAddMultiPointEntity = this.MultiPointRateLimit(this.addSymbolMulti, 1);
        // }

        this.starBurst = new StarBurst(this);
        //this.cesiumConverter = new CesiumConverter(this.viewer);

        //limit zoom out
        this.viewer.scene.screenSpaceCameraController.maximumZoomDistance = 35198626.121174397;

        //this.secRendererWorker.A = new Worker('../renderer/MPWorker.js');
        //this.secRendererWorker.A = new Worker( '../../vendor/ mil-sym/MPWorker.js');
        this.secRendererWorker.A = new Worker(this.relativeBaseURL + 'js/lib/renderer/MPCWorker.js');

        this.secRendererWorker.A.onerror = function (error)
        {
            //logs error to console
            armyc2.c2sd.renderer.utilities.ErrorLogger.LogException("MPWorker A", "postMessage", error);
        };
        this.secRendererWorker.A.onmessage = function (e)
        {
//             if (this.isMapMoving())
//             {
//                 return;
//             }
            //console.log("on message A");
            var batchCall = false;
            var rendererData = [];
            if (e.data.id)//not a batch call
            {
                rendererData.push = e.data.result;
            }
            else
            {
                batchCall = true;
                rendererData = e.data.result;
            }
            if (rendererData && rendererData !== null && typeof rendererData === 'string')
            {
                console.log("Render error: " + rendererData);
                return;
            }
//            if (e.data.format === "ERROR")
//            {
//                console.log("Render error: " + rendererData);
//                return;
//            }

            for (var index = 0; index < rendererData.length; index++)
            {
                if (!this.defined(rendererData[index]))
                {
                    console.log("Render error: renderer data is undefined");
                    return;
                }
                if (typeof rendererData[index] === 'string')
                {
                    console.log("Render error: " + rendererData[index]);
                    return;
                }
                var multiPointObject = this.getMultiPoint(rendererData[index].id);
                if (this.defined(multiPointObject))
                {
                    if (rendererData[index] && rendererData[index] !== null && typeof rendererData[index] === 'string')
                    {
                        console.log("Render error: " + rendererData[index] + "\n data sent: " + multiPointObject.name + " (" + multiPointObject.symbolCode + ") Extents: " + multiPointObject.dataSentToSecRendererWorker.bbox + "\n      Coord string:" + multiPointObject.dataSentToSecRendererWorker.points + "  canvas.width = " + multiPointObject.dataSentToSecRendererWorker.pixelWidth + "  canvas.height = " + multiPointObject.dataSentToSecRendererWorker.pixelHeight + "  modifiers = " + JSON.stringify(multiPointObject.dataSentToSecRendererWorker.modifiers) + "scale =" + multiPointObject.dataSentToSecRendererWorker.scale);
                        result.success = false;
                        result.message = rendererData[index];
                        result.jsError = "function: addSymbolMulti(args)  -  EmpCesiumConstants.MultiPointRenderType.SVG";
                        return;
                    }
                    else if (rendererData[index] && rendererData[index] !== null && (!this.defined(rendererData[index].west) || !this.defined(rendererData[index].south) || !this.defined(rendererData[index].east) || !this.defined(rendererData[index].north)))
                    {
                        console.log("Render returning  undefined west south east north " + multiPointObject.name + " (" + multiPointObject.symbolCode + ") Extents: " + multiPointObject.dataSentToSecRendererWorker.bbox + "\n      Coord string:" + multiPointObject.dataSentToSecRendererWorker.points + "  canvas.width = " + multiPointObject.dataSentToSecRendererWorker.pixelWidth + "  canvas.height = " + multiPointObject.dataSentToSecRendererWorker.pixelHeight + "  modifiers = " + JSON.stringify(multiPointObject.dataSentToSecRendererWorker.modifiers) + "scale =" + multiPointObject.dataSentToSecRendererWorker.scale);
                        // result.success = false;
                        //result.message = rendererData;
                        //result.jsError = "function: addSymbolMulti(args)  -  EmpCesiumConstants.MultiPointRenderType.SVG";
//                        rendererData[index].geoBR = {};
//                        rendererData[index].geoBR.x = 0;
//                        rendererData[index].geoBR.y = 0;
//                        rendererData[index].geoTL = {};
//                        rendererData[index].geoTL.x = 0;
//                        rendererData[index].geoTL.y = 0;
                        rendererData[index].west = {};
                        rendererData[index].west.x = 0;
                        rendererData[index].west.y = 0;
                        rendererData[index].south = {};
                        rendererData[index].south.x = 0;
                        rendererData[index].south.y = 0;
                        rendererData[index].east = {};
                        rendererData[index].east.x = 0;
                        rendererData[index].east.y = 0;
                        rendererData[index].north = {};
                        rendererData[index].north.x = 0;
                        rendererData[index].north.y = 0;
                        // rendererData[index].svg = 'data:image/svg+xml,' + this.highScaleImage.blankMultipoint;
                    }

                    if (rendererData[index] && rendererData[index] !== null && typeof rendererData[index] !== 'string')
                    {

                        if (Math.abs(rendererData[index].north.y) > 90 || Math.abs(rendererData[index].south.y > 90))
                        {
                            // console.log("Render error: bad bound returned by renderer " + rendererData[index] + "\n data sent: " + multiPointObject.name + " (" + multiPointObject.symbolCode + ") Extents: " + multiPointObject.dataSentToSecRendererWorker.bbox + "\n      Coord string:" + multiPointObject.dataSentToSecRendererWorker.points + "  canvas.width = " + multiPointObject.dataSentToSecRendererWorker.pixelWidth + "  canvas.height = " + multiPointObject.dataSentToSecRendererWorker.pixelHeight + "  modifiers = " + JSON.stringify(multiPointObject.dataSentToSecRendererWorker.modifiers) + "scale =" + multiPointObject.dataSentToSecRendererWorker.scale);
                            result.success = false;
                            result.message = 'bad bound returned by renderer.. latitudes bigger than 90 degrees';
                            result.jsError = "function: secRendererWorker.A.onmessage(args) - bad bound.. latitudes bigger than 90 degrees";
                            return;
                        }

                        if (Math.abs(rendererData[index].west.x) > 180 || Math.abs(rendererData[index].east.x > 180))
                        {
                            //console.log("Render error: bad bound returned by renderer " + rendererData[index] + "\n data sent: " + multiPointObject.name + " (" + multiPointObject.symbolCode + ") Extents: " + multiPointObject.dataSentToSecRendererWorker.bbox + "\n      Coord string:" + multiPointObject.dataSentToSecRendererWorker.points + "  canvas.width = " + multiPointObject.dataSentToSecRendererWorker.pixelWidth + "  canvas.height = " + multiPointObject.dataSentToSecRendererWorker.pixelHeight + "  modifiers = " + JSON.stringify(multiPointObject.dataSentToSecRendererWorker.modifiers) + "scale =" + multiPointObject.dataSentToSecRendererWorker.scale);
                            result.success = false;
                            result.message = 'bad bound returned by renderer.. longitutes bigger than 180 degrees';
                            result.jsError = "function: secRendererWorker.A.onmessage(args) - bad bound.. longitutes bigger than 180 degrees";
                            return;
                        }
                        // console.log("bounds from renderer: w s e n" + rendererData[index].west.x + " " + rendererData[index].south.y + rendererData[index].east.x + " " + rendererData[index].north.y );

                        var addCanvasToOverlayParams = {
                            symbolCode: multiPointObject.symbolCode,
                            parentCoreId: multiPointObject.parentCoreId,
                            overlayId: multiPointObject.overlayId,
                            id: multiPointObject.coreId || multiPointObject.id,
                            data: rendererData[index],
                            properties: multiPointObject.properties,
                            name: multiPointObject.name,
                            description: multiPointObject.description || multiPointObject.properties.description,
                            visible: multiPointObject.visible,
                            feature: multiPointObject,
                            extrudedHeight: multiPointObject.extrudedHeight
                        };
                        result = this.addCanvasToOverlay(addCanvasToOverlayParams);
                        if (rendererData[index].hasOwnProperty("wasClipped"))
                        {
                            multiPointObject.wasClipped = rendererData[index].wasClipped;
                            multiPointObject.forceRedraw = rendererData[index].forceRedraw;
                        }
                        else
                        {
                            multiPointObject.wasClipped = false;
                            multiPointObject.forceRedraw = false;
                        }
                    }
                    rendererData[index] = undefined;
                    // console.log("on message A finish");
                    // this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                    //this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                }//  if (this.defined(multiPointObject))
            }// for loop
            this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        }.bind(this);


        this.secRendererWorker.B = new Worker(this.relativeBaseURL + 'js/lib/renderer/MPCWorker.js');
//        // this.secRendererWorker.A = new Worker( '../../vendor/ mil-sym/MPWorker.js');
        this.secRendererWorker.B.onerror = function (error)
        {
            //logs error to console
            armyc2.c2sd.renderer.utilities.ErrorLogger.LogException("MPWorker B", "postMessage", error);
        };
        this.secRendererWorker.B.onmessage = function (e)
        {
//             if (this.isMapMoving())
//             {
//                 return;
//             }
            //console.log("on message A");
            var batchCall = false;
            var rendererData = [];
            if (e.data.id)//not a batch call
            {
                rendererData.push = e.data.result;
            }
            else
            {
                batchCall = true;
                rendererData = e.data.result;
            }
            if (e.data.format === "ERROR")
            {
                console.log("Render error: " + rendererData);
                return;
            }

            if (rendererData && rendererData !== null && typeof rendererData === 'string')
            {
                console.log("Render error: " + rendererData);
                return;
            }

            for (var index = 0; index < rendererData.length; index++)
            {
                if (!this.defined(rendererData[index]))
                {
                    console.log("Render error: renderer data is undefined");
                    return;
                }
                if (typeof rendererDataValue === 'string')
                {
                    console.log("Render error: " + rendererData);
                    return;
                }
                var multiPointObject = this.getMultiPoint(rendererData[index].id);
                if (this.defined(multiPointObject))
                {
                    if (rendererData[index] && rendererData[index] !== null && typeof rendererData[index] === 'string')
                    {
                        console.log("Render error: " + rendererData[index] + "\n data sent: " + multiPointObject.name + " (" + multiPointObject.symbolCode + ") Extents: " + multiPointObject.dataSentToSecRendererWorker.bbox + "\n      Coord string:" + multiPointObject.dataSentToSecRendererWorker.points + "  canvas.width = " + multiPointObject.dataSentToSecRendererWorker.pixelWidth + "  canvas.height = " + multiPointObject.dataSentToSecRendererWorker.pixelHeight + "  modifiers = " + JSON.stringify(multiPointObject.dataSentToSecRendererWorker.modifiers) + "scale =" + multiPointObject.dataSentToSecRendererWorker.scale);
                        result.success = false;
                        result.message = rendererData[index];
                        result.jsError = "function: addSymbolMulti(args)  -  EmpCesiumConstants.MultiPointRenderType.SVG";
                        return;
                    }
                    else if (rendererData[index] && rendererData[index] !== null && (!this.defined(rendererData[index].west) || !this.defined(rendererData[index].south) || !this.defined(rendererData[index].east) || !this.defined(rendererData[index].north)))
                    {
                        console.log("Render returning  undefined west south east north " + multiPointObject.name + " (" + multiPointObject.symbolCode + ") Extents: " + multiPointObject.dataSentToSecRendererWorker.bbox + "\n      Coord string:" + multiPointObject.dataSentToSecRendererWorker.points + "  canvas.width = " + multiPointObject.dataSentToSecRendererWorker.pixelWidth + "  canvas.height = " + multiPointObject.dataSentToSecRendererWorker.pixelHeight + "  modifiers = " + JSON.stringify(multiPointObject.dataSentToSecRendererWorker.modifiers) + "scale =" + multiPointObject.dataSentToSecRendererWorker.scale);
                        // result.success = false;
                        //result.message = rendererData;
                        //result.jsError = "function: addSymbolMulti(args)  -  EmpCesiumConstants.MultiPointRenderType.SVG";
//                        rendererData[index].geoBR = {};
//                        rendererData[index].geoBR.x = 0;
//                        rendererData[index].geoBR.y = 0;
//                        rendererData[index].geoTL = {};
//                        rendererData[index].geoTL.x = 0;
//                        rendererData[index].geoTL.y = 0;

                        rendererData[index].west = {};
                        rendererData[index].west.x = 0;
                        rendererData[index].west.y = 0;
                        rendererData[index].south = {};
                        rendererData[index].south.x = 0;
                        rendererData[index].south.y = 0;
                        rendererData[index].east = {};
                        rendererData[index].east.x = 0;
                        rendererData[index].east.y = 0;
                        rendererData[index].north = {};
                        rendererData[index].north.x = 0;
                        rendererData[index].north.y = 0;
                        // rendererData[index].svg = 'data:image/svg+xml,' + this.highScaleImage.blankMultipoint;
                    }
                    if (rendererData[index] && rendererData[index] !== null && typeof rendererData[index] !== 'string')
                    {

                        if (Math.abs(rendererData[index].north.y) > 90 || Math.abs(rendererData[index].south.y > 90))
                        {
                            //console.log("Render error:  bad bound returned by renderer" + rendererData[index] + "\n data sent: " + multiPointObject.name + " (" + multiPointObject.symbolCode + ") Extents: " + multiPointObject.dataSentToSecRendererWorker.bbox + "\n      Coord string:" + multiPointObject.dataSentToSecRendererWorker.points + "  canvas.width = " + multiPointObject.dataSentToSecRendererWorker.pixelWidth + "  canvas.height = " + multiPointObject.dataSentToSecRendererWorker.pixelHeight + "  modifiers = " + JSON.stringify(multiPointObject.dataSentToSecRendererWorker.modifiers) + "scale =" + multiPointObject.dataSentToSecRendererWorker.scale);
                            result.success = false;
                            result.message = 'bad bound returned by renderer.. latitudes bigger than 90 degrees';
                            result.jsError = "function: secRendererWorker.A.onmessage(args) - bad bound.. latitudes bigger than 90 degrees";
                            return;
                        }

                        if (Math.abs(rendererData[index].west.x) > 180 || Math.abs(rendererData[index].east.x > 180))
                        {
                            //console.log("Render error: bad bound returned by renderer " + rendererData[index] + "\n data sent: " + multiPointObject.name + " (" + multiPointObject.symbolCode + ") Extents: " + multiPointObject.dataSentToSecRendererWorker.bbox + "\n      Coord string:" + multiPointObject.dataSentToSecRendererWorker.points + "  canvas.width = " + multiPointObject.dataSentToSecRendererWorker.pixelWidth + "  canvas.height = " + multiPointObject.dataSentToSecRendererWorker.pixelHeight + "  modifiers = " + JSON.stringify(multiPointObject.dataSentToSecRendererWorker.modifiers) + "scale =" + multiPointObject.dataSentToSecRendererWorker.scale);
                            result.success = false;
                            result.message = 'bad bound returned by renderer.. longitutes bigger than 180 degrees';
                            result.jsError = "function: secRendererWorker.A.onmessage(args) - bad bound.. longitutes bigger than 180 degrees";
                            return;
                        }

                        // console.log("bounds from renderer: w s e n" + rendererData[index].west.x + " " + rendererData[index].south.y + rendererData[index].east.x + " " + rendererData[index].north.y );
                        var addCanvasToOverlayParams = {
                            symbolCode: multiPointObject.symbolCode,
                            parentCoreId: multiPointObject.parentCoreId,
                            overlayId: multiPointObject.overlayId,
                            id: multiPointObject.coreId || multiPointObject.id,
                            data: rendererData[index],
                            properties: multiPointObject.properties,
                            name: multiPointObject.name,
                            description: multiPointObject.description || multiPointObject.properties.description,
                            visible: multiPointObject.visible,
                            feature: multiPointObject,
                            extrudedHeight: multiPointObject.extrudedHeight
                        };
                        result = this.addCanvasToOverlay(addCanvasToOverlayParams);
                        if (rendererData[index].hasOwnProperty("wasClipped"))
                        {
                            multiPointObject.wasClipped = rendererData[index].wasClipped;
                            multiPointObject.forceRedraw = rendererData[index].forceRedraw;
                        }
                        else
                        {
                            multiPointObject.wasClipped = false;
                            multiPointObject.forceRedraw = false;
                        }
                    }
                    rendererData[index] = undefined;
                    // console.log("on message A finish");
                    // this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                    //this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                }//  if (this.defined(multiPointObject))
            }// for loop
            this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        }.bind(this);
//
//        this.secRendererWorker.Selection = new Worker(this.relativeBaseURL + 'js/lib/renderer/MPCWorker.js');
//        // this.secRendererWorker.A = new Worker( '../../vendor/ mil-sym/MPWorker.js');
//        this.secRendererWorker.Selection.onerror = function (error)
//        {
//            //logs error to console
//            armyc2.c2sd.renderer.utilities.ErrorLogger.LogException("MPWorker Selection", "postMessage", error);
//        };
//        this.secRendererWorker.Selection.onmessage = function (e)
//        {
////             if (this.isMapMoving())
////             {
////                 return;
////             }
//            //console.log("on message A");
//            var batchCall = false;
//            var rendererData = [];
//            if (e.data.id)//not a batch call
//            {
//                rendererData.push = e.data.result;
//            }
//            else
//            {
//                batchCall = true;
//                rendererData = e.data.result;
//            }
//            if (rendererData && rendererData !== null && typeof rendererData === 'string')
//            {
//                console.log("Render error: " + rendererData);
//                return;
//            }
////            if (e.data.format === "ERROR")
////            {
////                console.log("Render error: " + rendererData);
////                return;
////            }
//
//            for (var index = 0; index < rendererData.length; index++)
//            {
//                var multiPointObject = this.getMultiPoint(rendererData[index].id);
//                var layer;
//                if (this.defined(multiPointObject))
//                {
//                    if (multiPointObject.parentCoreId)
//                    {
//                        layer = this.getLayer(multiPointObject.parentCoreId);
//                        if (layer === undefined)
//                        {
//                            layer = this.getLayer(multiPointObject.overlayId);   // this.getFeature(args.parentCoreId);
//                        }
//                        if (layer === undefined)
//                        {
//                            result.success = false;
//                            result.message = " - This feature selection  is not specifying a parent layer: ";
//                            continue;
//                        }
//                    }
//                    var feature = layer.getFeature(rendererData[index].id);
//                    if (rendererData[index] && rendererData[index] !== null && typeof rendererData[index] === 'string')
//                    {
//                        console.log("Render error: " + rendererData[index] + "\n data sent: " + multiPointObject.name + " (" + multiPointObject.symbolCode + ") Extents: " + multiPointObject.dataSentToSecRendererWorker.bbox + "\n      Coord string:" + multiPointObject.dataSentToSecRendererWorker.points + "  canvas.width = " + multiPointObject.dataSentToSecRendererWorker.pixelWidth + "  canvas.height = " + multiPointObject.dataSentToSecRendererWorker.pixelHeight + "  modifiers = " + JSON.stringify(multiPointObject.dataSentToSecRendererWorker.modifiers) + "scale =" + multiPointObject.dataSentToSecRendererWorker.scale);
//                        result.success = false;
//                        result.message = rendererData[index];
//                        result.jsError = "function: addSymbolMulti(args)  -  EmpCesiumConstants.MultiPointRenderType.SVG";
//                        continue;
//                    }
//                    else if (rendererData[index] && rendererData[index] !== null && (!this.defined(rendererData[index].west) || !this.defined(rendererData[index].south) || !this.defined(rendererData[index].east) || !this.defined(rendererData[index].north)))
//                    {
//                        console.log("Render returning  undefined west south east north " + multiPointObject.name + " (" + multiPointObject.symbolCode + ") Extents: " + multiPointObject.dataSentToSecRendererWorker.bbox + "\n      Coord string:" + multiPointObject.dataSentToSecRendererWorker.points + "  canvas.width = " + multiPointObject.dataSentToSecRendererWorker.pixelWidth + "  canvas.height = " + multiPointObject.dataSentToSecRendererWorker.pixelHeight + "  modifiers = " + JSON.stringify(multiPointObject.dataSentToSecRendererWorker.modifiers) + "scale =" + multiPointObject.dataSentToSecRendererWorker.scale);
//                        rendererData[index].west = {};
//                        rendererData[index].west.x = 0;
//                        rendererData[index].west.y = 0;
//                        rendererData[index].south = {};
//                        rendererData[index].south.x = 0;
//                        rendererData[index].south.y = 0;
//                        rendererData[index].east = {};
//                        rendererData[index].east.x = 0;
//                        rendererData[index].east.y = 0;
//                        rendererData[index].north = {};
//                        rendererData[index].north.x = 0;
//                        rendererData[index].north.y = 0;
//                        continue;
//                        // rendererData[index].svg = 'data:image/svg+xml,' + this.highScaleImage.blankMultipoint;
//                    }
//                    if (rendererData[index] && rendererData[index] !== null && typeof rendererData[index] !== 'string')
//                    {
//                        if (feature.rectangle)
//                        {
//                            var rectangle = this.Rectangle.fromDegrees(rendererData[index].west.x, rendererData[index].south.y, rendererData[index].east.x, rendererData[index].north.y);
//                            if (rectangle.south.y > rectangle.north.y)
//                            {
//                                continue;
//                            }
//                            if ((Math.abs(rectangle.south.y) > this.Math.PI_OVER_TWO) || (Math.abs(rectangle.north.y) > this.Math.PI_OVER_TWO))
//                            {
//                                continue;
//                            }
//                            feature.rectangle.coordinates = rectangle;
//                            if (feature.rectangle.material)
//                            {
//                                feature.rectangle.material.image = rendererData[index].svg;
//                                //feature.rectangle.material.image = (this.defined(textureFromCanvas)) ? textureFromCanvas : feature.rectangle.material.image;
//                                this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
//                            }
//                        }
//                    }
//                    rendererData[index] = undefined;
//                    // console.log("on message A finish");
//                    // this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
//                    //this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
//                }//  if (this.defined(multiPointObject))
//            }// for loop
//            this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
//        }.bind(this);
//
//        this.secRendererWorker.DeSelection = new Worker(this.relativeBaseURL + 'js/lib/renderer/MPCWorker.js');
//        this.secRendererWorker.DeSelection.onerror = function (error)
//        {
//            //logs error to console
//            armyc2.c2sd.renderer.utilities.ErrorLogger.LogException("MPWorker DeSelection", "postMessage", error);
//        };
//        this.secRendererWorker.DeSelection.onmessage = function (e)
//        {
////             if (this.isMapMoving())
////             {
////                 return;
////             }
//            //console.log("on message A");
//            var batchCall = false;
//            var rendererData = [];
//            if (e.data.id)//not a batch call
//            {
//                rendererData.push = e.data.result;
//            }
//            else
//            {
//                batchCall = true;
//                rendererData = e.data.result;
//            }
//            if (rendererData && rendererData !== null && typeof rendererData === 'string')
//            {
//                console.log("Render error: " + rendererData);
//                return;
//            }
////            if (e.data.format === "ERROR")
////            {
////                console.log("Render error: " + rendererData);
////                return;
////            }
//
//            for (var index = 0; index < rendererData.length; index++)
//            {
//                var multiPointObject = this.getMultiPoint(rendererData[index].id);
//                var layer;
//                if (this.defined(multiPointObject))
//                {
//                    if (multiPointObject.parentCoreId)
//                    {
//                        layer = this.getLayer(multiPointObject.parentCoreId);
//                        if (layer === undefined)
//                        {
//                            layer = this.getLayer(multiPointObject.overlayId);   // this.getFeature(args.parentCoreId);
//                        }
//                        if (layer === undefined)
//                        {
//                            result.success = false;
//                            result.message = " - This feature selection  is not specifying a parent layer: ";
//                            continue;
//                        }
//                    }
//                    var feature = layer.getFeature(rendererData[index].id);
//                    if (rendererData[index] && rendererData[index] !== null && typeof rendererData[index] === 'string')
//                    {
//                        console.log("Render error: " + rendererData[index] + "\n data sent: " + multiPointObject.name + " (" + multiPointObject.symbolCode + ") Extents: " + multiPointObject.dataSentToSecRendererWorker.bbox + "\n      Coord string:" + multiPointObject.dataSentToSecRendererWorker.points + "  canvas.width = " + multiPointObject.dataSentToSecRendererWorker.pixelWidth + "  canvas.height = " + multiPointObject.dataSentToSecRendererWorker.pixelHeight + "  modifiers = " + JSON.stringify(multiPointObject.dataSentToSecRendererWorker.modifiers) + "scale =" + multiPointObject.dataSentToSecRendererWorker.scale);
//                        result.success = false;
//                        result.message = rendererData[index];
//                        result.jsError = "function: addSymbolMulti(args)  -  EmpCesiumConstants.MultiPointRenderType.SVG";
//                        continue;
//                    }
//                    else if (rendererData[index] && rendererData[index] !== null && (!this.defined(rendererData[index].west) || !this.defined(rendererData[index].south) || !this.defined(rendererData[index].east) || !this.defined(rendererData[index].north)))
//                    {
//                        console.log("Render returning  undefined west south east north " + multiPointObject.name + " (" + multiPointObject.symbolCode + ") Extents: " + multiPointObject.dataSentToSecRendererWorker.bbox + "\n      Coord string:" + multiPointObject.dataSentToSecRendererWorker.points + "  canvas.width = " + multiPointObject.dataSentToSecRendererWorker.pixelWidth + "  canvas.height = " + multiPointObject.dataSentToSecRendererWorker.pixelHeight + "  modifiers = " + JSON.stringify(multiPointObject.dataSentToSecRendererWorker.modifiers) + "scale =" + multiPointObject.dataSentToSecRendererWorker.scale);
//                        rendererData[index].west = {};
//                        rendererData[index].west.x = 0;
//                        rendererData[index].west.y = 0;
//                        rendererData[index].south = {};
//                        rendererData[index].south.x = 0;
//                        rendererData[index].south.y = 0;
//                        rendererData[index].east = {};
//                        rendererData[index].east.x = 0;
//                        rendererData[index].east.y = 0;
//                        rendererData[index].north = {};
//                        rendererData[index].north.x = 0;
//                        rendererData[index].north.y = 0;
//                        continue;
//                        // rendererData[index].svg = 'data:image/svg+xml,' + this.highScaleImage.blankMultipoint;
//                    }
//                    if (rendererData[index] && rendererData[index] !== null && typeof rendererData[index] !== 'string')
//                    {
//                        if (feature.rectangle)
//                        {
//                            var rectangle = this.Rectangle.fromDegrees(rendererData[index].west.x, rendererData[index].south.y, rendererData[index].east.x, rendererData[index].north.y);
//                            //var rectangle = this.Rectangle.fromDegrees(rendererData.geoTL.x, rendererData.geoBR.y, rendererData.geoBR.x, rendererData.geoTL.y);
//                            if (rectangle.south.y > rectangle.north.y)
//                            {
//                                continue;
//                            }
//                            if ((Math.abs(rectangle.south.y) > this.Math.PI_OVER_TWO) || (Math.abs(rectangle.north.y) > this.Math.PI_OVER_TWO))
//                            {
//                                continue;
//                            }
//                            feature.rectangle.coordinates = rectangle;
//                            if (feature.rectangle.material)
//                            {
//                                feature.rectangle.material.image = rendererData[index].svg;
//                                //feature.rectangle.material.image = (this.defined(textureFromCanvas)) ? textureFromCanvas : feature.rectangle.material.image;
//                                //this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
//                            }
//                        }
//                    }
//                    rendererData[index] = undefined;
//                    // console.log("on message A finish");
//                    // this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
//                    //this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
//                }//  if (this.defined(multiPointObject))
//            }// for loop
//            this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
//        }.bind(this);


    };


    this.processOnRangeChangeSinglePoints = function ()
    {
        var singlePointKey;
        if (!this.enableRenderingOptimization)
        {
            return;
        }

        for (singlePointKey in this.singlePointCollection)
        {
            // if (!this.isSinglePointIdOnHoldPresent(singlePointKey))
            //{
            //empCesium.throttleMil2525IconLabelSet(empCesium.getSinglePoint(singlePointKey));
            var singlePointObject = this.getSinglePoint(singlePointKey);
//                 if (singlePointObject.singlePointAltitudeRangeMode !== this.singlePointAltitudeRangeMode ||
//                        (singlePointObject.isClusterIcon && singlePointObject.singlePointAltitudeRangeMode !==   EmpCesiumConstants.SinglePointAltitudeRangeMode.HIGHEST_RANGE ) ||
//                          (!singlePointObject.isClusterIcon && singlePointObject.singlePointAltitudeRangeMode ===   EmpCesiumConstants.SinglePointAltitudeRangeMode.LOW_RANGE && !singlePointObject.showLabels ) ||
//                          (!singlePointObject.isClusterIcon && singlePointObject.singlePointAltitudeRangeMode ===   EmpCesiumConstants.SinglePointAltitudeRangeMode.MID_RANGE && singlePointObject.showLabels ))
//                {
            if (singlePointObject.singlePointAltitudeRangeMode !== this.singlePointAltitudeRangeMode)
            {
                //this.throttleAddSymbolSinglePrimitive(singlePointObject);
                this.removeSinglePointIdOnHold(singlePointKey);
                singlePointObject.isOnUpdateDelayHold = false;
                singlePointObject.isNewAddThrotled = false;
                singlePointObject.singlePointAltitudeRangeChanged = true;
                this.throttleSymbolSingleOnHold(singlePointObject);
                // this.addSymbolSinglePrimitive(singlePointObject);
            }
        }
    };

    this.processOnHoldSinglePoints = function ()
    {
        if (!this.enableRenderingOptimization)
        {
            return;
        }

        var singlePointObjects = [];
        var SinglePointsIdOnHold = this.getSinglePointsIdOnHold();
        for (var singlePointId in SinglePointsIdOnHold)
        {
            var singlePointObject = this.getSinglePoint(singlePointId);
            var within = this.Rectangle.contains(this.getExtent(), this.Cartographic.fromDegrees(singlePointObject.coordinates[0], singlePointObject.coordinates[1], singlePointObject.coordinates[2]));
            if (within && !this.isSkyWithinMapVisibleArea() && singlePointObject.isOnOutsideViewableAreaHold)
            {
                this.removeSinglePointIdOnHold(singlePointId);
                this.throttleSymbolSingleOnHold(singlePointObject);
                //singlePointObjects.push({args: singlePointObject});
            }
        }
//            if (!this.cameraStoppedMoving)
//            {
//                break;
//            }
//        if (singlePointObjects.length > 0)
//        {
//
////            this.refreshSinglePointOnHoldBatch.executeBatch({
////                array: singlePointObjects,
////                index: 0,
////                consumptionTime: 100,
////                timeToWait: 50
////            });
//        }
    };


    this.processOnDelayHoldSinglePoints = function ()
    {
        if (!this.enableRenderingOptimization)
        {
            return;
        }
        var singlePointsIdOnHoldCount = this.getSinglePointsIdOnHoldCount(),
                delay = 0;

//            if (singlePointsIdOnHoldCount > 500 && singlePointsIdOnHoldCount <=2000)
//            {
//                 delay = 100;
//            }
//            else  if (singlePointsIdOnHoldCount > 2000 && singlePointsIdOnHoldCount <=5000)
//            {
//                 delay = 200;
//            }
        delay = 0.02 * singlePointsIdOnHoldCount;
        if (delay === 0)
        {
            return; // nothing to process
        }
        if (!this.defined(this.hProcessOnDelayHoldSinglePointsTimer))
        {
            this.hProcessOnDelayHoldSinglePointsTimer = setTimeout(function ()
            {
                this.hProcessOnDelayHoldSinglePointsTimer = undefined;

                var singlePointObjects = [];
                var SinglePointsIdOnHold = this.getSinglePointsIdOnHold();
                //console.log(this.getSinglePointsIdOnHoldCount());
                for (var singlePointId in SinglePointsIdOnHold)
                {
                    var singlePointObject = this.getSinglePoint(singlePointId);
                    var within = this.Rectangle.contains(this.getExtent(), this.Cartographic.fromDegrees(singlePointObject.coordinates[0], singlePointObject.coordinates[1], singlePointObject.coordinates[2]));
                    if (within && !this.isSkyWithinMapVisibleArea() && singlePointObject && singlePointObject.isOnUpdateDelayHold && Math.abs(new Date().getTime() - singlePointObject.lastUpdateTime) > ((this.getSinglePointsIdOnHoldCount() > 100) ? 5000 : 20))
                    {
                        this.removeSinglePointIdOnHold(singlePointId);
                        this.throttleSymbolSingleOnHold(singlePointObject);
                        //singlePointObjects.push({args: singlePointObject});
                    }
                }
//            if (!this.cameraStoppedMoving)
//            {
//                break;
//            }
//                if (singlePointObjects.length > 0)
//                {
//                    this.refreshSinglePointOnHoldBatch.executeBatch({
//                        array: singlePointObjects,
//                        index: 0,
//                        consumptionTime: 100,
//                        timeToWait: 50
//                    });
//                }
            }.bind(this), 50);
        }
    };

    this.FlyToComplete = function ()
    {
        this.currentExtent = undefined;
        this.getExtent();

        if (this.viewTransaction)
        {
            for (var i = 0; i < this.viewTransaction.items.length; i += 1)
            {
                var item = this.viewTransaction.items[i];
                this.formatView(item);
            }
            this.viewTransaction.run();
            this.viewTransaction = undefined;
        }
    };

    this.isMouseWithinCanvas = function (args)
    {
        var isWithin = false;
        if (args.endPosition !== null && args.endPosition !== undefined)
        {
            isWithin = (0 <= args.endPosition.x && args.endPosition.x <= this.canvas.width) && (0 <= args.endPosition.y && args.endPosition.y <= this.canvas.height);
        }
        else if (args.position !== null && args.position !== undefined)
        {
            isWithin = (0 <= args.position.x && args.position.x <= this.canvas.width) && (0 <= args.position.y && args.position.y <= this.canvas.height);
        }
//        if (isWithin)
//        {
//            console.log(args.domEvent.originalTarget.localName);
//        }
        if (isWithin && args.domEvent && args.domEvent.target && args.domEvent.target.localName !== "canvas")
        {
            isWithin = false;// is withinn but mouse event is occurring over another object (another div tag, compass, pop up window, etc.
            //send false so the event is not  propagated to core.
        }
        return isWithin;
    };

    this.isMouseWithinSmartMoveDetectionZone = function (args)
    {
        var isWithin = false,
                isXWithin = false,
                isYWithin = false,
                zoneWidthInPixels = 100,
                position = args.endPosition || args.position;

        if (this.defined(position))
        {
            this.bSmartMapMovingRightZone = ((position.x >= (this.canvas.width - zoneWidthInPixels)) && position.x <= this.canvas.width); //&& (args.endPosition.y >= this.canvas.height - 20 && args.endPosition.y <= this.canvas.height) ||
            this.bSmartMapMovingLeftZone = (position.x >= 0 && position.x <= zoneWidthInPixels); // && (args.endPosition.y >= this.canvas.height - 20 && args.endPosition.y <= this.canvas.height) ;
            this.bSmartMapMovingTopZone = (position.y >= 0 && position.y <= zoneWidthInPixels);
            this.bSmartMapMovingBottomZone = ((position.y >= (this.canvas.height - zoneWidthInPixels)) && position.y <= this.canvas.height);
            if (this.bSmartMapMovingRightZone && this.bSmartMapMovingTopZone)
            {
                this.bSmartMapMovingTopRightZone = true;
                this.bSmartMapMovingRightZone = this.bSmartMapMovingTopZone = false;
            }
            if (this.bSmartMapMovingRightZone && this.bSmartMapMovingBottomZone)
            {
                this.bSmartMapMovingBottomRightZone = true;
                this.bSmartMapMovingRightZone = this.bSmartMapMovingBottomZone = false;
            }
            if (this.bSmartMapMovingLeftZone && this.bSmartMapMovingTopZone)
            {
                this.bSmartMapMovingTopLeftZone = true;
                this.bSmartMapMovingLeftZone = this.bSmartMapMovingTopZone = false;
            }
            if (this.bSmartMapMovingLeftZone && this.bSmartMapMovingBottomZone)
            {
                this.bSmartMapMovingBottomLeftZone = true;
                this.bSmartMapMovingLeftZone = this.bSmartMapMovingBottomZone = false;
            }
        }

        this.bMartMapMoving = this.bSmartMapMovingRightZone || this.bSmartMapMovingLeftZone || this.bSmartMapMovingTopZone || this.bSmartMapMovingBottomZone ||
                this.bSmartMapMovingTopRightZone || this.bSmartMapMovingBottomRightZone || this.bSmartMapMovingTopLeftZone || this.bSmartMapMovingBottomLeftZone;
//        if (isWithin)
//        {
//            console.log(args.domEvent.originalTarget.localName);
//        }
        if (this.bMartMapMoving && args.domEvent && args.domEvent.target && args.domEvent.target.localName !== "canvas")
        {
            this.bMartMapMoving = false;// is withinn but mouse event is occurring over another object (another div tag, compass, pop up window, etc.
            this.bSmartMapMovingLeftZone = false;
            this.bSmartMapMovingTopZone = false;
            this.bSmartMapMovingBottomZone = false;
            this.bSmartMapMovingTopRightZone = false;
            this.bSmartMapMovingBottomRightZone = false;
            this.bSmartMapMovingTopLeftZone = false;
            this.bSmartMapMovingBottomLeftZone = false;
            //send false so the event is not  propagated to core.
        }
        return  this.bMartMapMoving;
    };

    this.getDefaultSkyBoxUrl = function (suffix)
    {
        return this.buildModuleUrl('Assets/Textures/SkyBox/tycho2t3_80_' + suffix + '.jpg');
    };
    this.handleMouseDown = function (event)
    {
        if (!this.empMapInstance)
        {
            //map instance not ready. ignore events
            return;
        }
        var eventData = this.populateEvent(event),
                lastMouseDownX,
                lastMouseDownY;
        eventData.type = "mouseDown";
        lastMouseDownX = event.position.x;
        lastMouseDownY = event.position.y;
        try
        {
            this.empMapInstance.eventing.Pointer(eventData);
        }
        catch (err)
        {
            this.empMapInstance.eventing.Error({
                level: emp.typeLibrary.Error.level.MAJOR,
                message: err.name + ": " + err.message
            });
        }
    };

    this.handleLeftClick = function (event)
    {
        if (!this.empMapInstance)
        {
            //map instance not ready. ignore events
            return;
        }
        var selectionArgs;
        // If featureId is populated it means that an entity was clicked on
        if (event.coreId)
        {
            selectionArgs = {
                featureId: event.featureId,
                coreId: event.coreId,
                overlayId: event.overlayId,
                sendEvent: true,
                featureIds: event.featureIds
            };
            // If the ctrl key is being held down, then we select the
            // cliked entity in addition to any other entities
            // selected. If it is not being held down, clear out the
            // selected placemarks, and just select the clicked placemark.
            if (event.ctrlKey)
            {
                // Check to see if the clicked entity is already
                // selected. If it is, then deselection of the entity
                // occurs. Otherwise, select it.
                if (this.isFeatureSelected(selectionArgs.coreId))
                {
                    this.manageDeselect(selectionArgs);
                }
                else
                {
                    this.manageSelect(selectionArgs);
                }
            }
            else
            {
                this.clearSelectedFeatures();
                this.manageSelect(selectionArgs);
            }
        }
        else
        {
            this.clearSelectedFeatures();
        }
    };

    this.clickPostHandler = function (event)
    {
        if (!this.empMapInstance)
        {
            //map instance not ready. ignore events
            return;
        }
        var eventData;
        if (this.drawData && !this.drawData.isDrawing && !this.drawData.isEditing)
        {
            switch (event.button)
            {
                case "left":
                case "right":
                    try
                    {
                        this.handleLeftClick(event);
                    }
                    catch (e)
                    {
                        emp.errorHandler.log({
                            level: emp.typeLibrary.Error.level.MAJOR,
                            message: "An unhandled exception occurred in cesiumMapEngine.handleClick()"
                        });
                    }
                    break;
                case "middle":
                    break;
                default:
                    break;
            }
        }
        eventData = this.populateEvent(event);
//        if (event.domEvent)
//        {
//            eventData.screenX = event.domEvent.clientX;
//            eventData.screenY = event.domEvent.clientY;
//        }
        eventData.type = "single";
        try
        {
            if (!event.ctrlKey)
            {
                // do not send pointer(do not call popup) when using the control key
                this.empMapInstance.eventing.Pointer(eventData);
            }
        }
        catch (err)
        {
            this.empMapInstance.eventing.Error({
                level: emp.typeLibrary.Error.level.MAJOR,
                message: err.name + ": " + err.message
            });
        }
    }

    this.handleClick = function (event)
    {
        if (!this.empMapInstance)
        {
            //map instance not ready. ignore events
            return;
        }
        var now = new Date().getTime();
        if ((now - this.lastMouseClick) > 300)
        {
            this.clickPostHandler(event);
            this.lastMouseClick = now;
        }
    }

    this.handleDblClick = function (event)
    {
        if (!this.empMapInstance)
        {
            //map instance not ready. ignore events
            return;
        }
        var eventData;
        eventData = this.populateEvent(event);
        eventData.type = "double";
        try
        {
            this.empMapInstance.eventing.Pointer(eventData);
        }
        catch (err)
        {
            this.empMapInstance.eventing.Error({
                level: emp.typeLibrary.Error.level.MAJOR,
                message: err.name + ": " + err.message
            });
        }
    }

    this.handleMouseUp = function (event)
    {
        if (!this.empMapInstance)
        {
            //map instance not ready. ignore events
            return;
        }
        var eventData;
        eventData = this.populateEvent(event);
        eventData.type = "mouseUp";
        try
        {
            this.empMapInstance.eventing.Pointer(eventData);
        }
        catch (err)
        {
            this.empMapInstance.eventing.Error({
                level: emp.typeLibrary.Error.level.MAJOR,
                message: err.name + ": " + err.message
            });
        }
    };
    this.handleMove = function (event)
    {
        if (!this.empMapInstance)
        {
            //map instance not ready. ignore events
            return;
        }
        // Parse the new data into the structure.
        this.oMouseMoveEventData = this.populateEvent(event);
        this.oMouseMoveEventData.type = "move";
        var delay = 100;
        //if (this.mapLocked)
        if (this.mapMotionLockEnum === emp3.api.enums.MapMotionLockEnum.NO_MOTION)
        {
            this.empMapInstance.eventing.Pointer(this.oMouseMoveEventData);
            //delay = 50;
        }
        else
        {
            // Check to see it the timer is running.
            if (this.hMouseMoveTimer === null)
            {
                //Its not running so start it.
                this.hMouseMoveTimer = setTimeout(function ()
                {
                    //Upon firing generate the event with the lattest data.
                    this.hMouseMoveTimer = null;
                    try
                    {
                        this.empMapInstance.eventing.Pointer(this.oMouseMoveEventData);
                    }
                    catch (err)
                    {
                        this.empMapInstance.eventing.Error({
                            level: emp.typeLibrary.Error.level.MAJOR,
                            message: err.name + ": " + err.message
                        });
                    }
                }.bind(this), delay);
            }
        }
    };
    this.populateEvent = function (event)
    {
        if (!this.empMapInstance)
        {
            //map instance not ready. ignore events
            return;
        }
        var eventData = {};
        eventData.lat = event.latitude;
        eventData.lon = event.longitude;
        eventData.mgrs = emp.geoLibrary.ddToMGRS(eventData.lat, eventData.lon);
        //TODO: need elevation for eventData
        eventData.altitude = event.altitude ? event.altitude : 0;
        eventData.button = event.button;
        eventData.clientX = event.position.x;
        eventData.clientY = event.position.y;
        eventData.screenX = (event.domEvent) ? event.domEvent.clientX : event.screenX;
        eventData.screenY = (event.domEvent) ? event.domEvent.clientY : event.screenY;
        if (event.feature !== null && event.feature !== undefined)
        {
            eventData.target = "feature";
            eventData.coreId = event.coreId;
            if (!event.featureId && event.feature.parentFeature && event.feature.parentFeature.featureId)
            {
                eventData.featureId = event.feature.parentFeature.featureId; // not the same as the coreId
            }
            if (!event.parentId && event.feature.parentFeature && event.feature.parentFeature.id)
            {
                eventData.parentId = event.feature.parentFeature.id;
            }
            eventData.overlayId = event.overlayId;
            if (this.drawData && !this.drawData.isDrawing && !this.drawData.isEditing)
            {
                eventData.popupInfo = {title: event.feature.name};
                if (event.feature.description !== null && event.feature.description !== undefined && event.feature.description._value !== undefined)
                {
                    eventData.popupInfo.content = event.feature.description.getValue();
                }
                else if (event.feature.description !== null && event.feature.description !== undefined)
                {
                    eventData.popupInfo.content = event.feature.description;
                }
            }
        }
        else
        {
            eventData.target = "globe";
        }
        eventData.altKey = event.altKey;
        eventData.ctrlKey = event.ctrlKey;
        eventData.shiftKey = event.shiftKey;
        eventData.keys = [];
        if (eventData.altKey)
        {
            eventData.keys.push("alt");
        }
        if (eventData.ctrlKey)
        {
            eventData.keys.push("ctrl");
        }
        if (eventData.shiftKey)
        {
            eventData.keys.push("shift");
        }
        if (eventData.keys.length < 1)
        {
            eventData.keys.push("none");
        }
        eventData.hitGlobe = event.didHitGlobe;
        eventData.bounds = event.bounds;
        eventData.elevation = event.altitude ? event.altitude : 0;
        return eventData;
    };

    this.prePopulateEvent = function (evt, findFeatures)
    {
        var featureIds = [],
                evts = [];
        if (!this.empMapInstance)
        {
            //map instance not ready. ignore events
            return;
        }
        var cX = evt.position.x,
                cY = evt.position.y,
                lonlat = this.getLonLatFromPixel({
                    x: cX,
                    y: cY
                });
        if (Math.abs(lonlat.latitude) < this.Math.PI_OVER_TWO && Math.abs(lonlat.longitude) < this.Math.PI)
        {
            evt.latitude = this.Math.toDegrees(lonlat.latitude);
            evt.longitude = this.Math.toDegrees(lonlat.longitude);
            evt.didHitGlobe = true;
        }
        else
        {
            evt.latitude = undefined;
            evt.longitude = undefined;
            evt.didHitGlobe = false;
        }
        var currExtent = this.getExtent();
        evt.bounds = new Object();
        evt.bounds.east = this.Math.toDegrees(currExtent.east - (currExtent.east > this.Math.PI ? this.Math.PI * 2 : 0));
        evt.bounds.north = this.Math.toDegrees(currExtent.north);
        evt.bounds.south = this.Math.toDegrees(currExtent.south);
        evt.bounds.west = this.Math.toDegrees(currExtent.west + (currExtent.west < -Cesium.Math.PI ? this.Math.PI * 2 : 0));
        if (findFeatures)
        {
            var features = this.pickFeatures(cX, cY);
            if (features.length)
            {
                for (var x = 0; x < features.length; x++)
                {
                    var feature, tempEvt;
                    if (features[x] !== undefined && features[x] !== "")
                    {
                        if (features[x].id)
                        {
                            feature = features[x];
                        }
                        else if (!features[x].id && Number.isNaN(features[x]) || (typeof (features[x]) === 'string'))
                        {
                            // is it an id?
                            feature = this.getFeature(features[x]);
                        }
                        else
                        {
                            continue;
                        }
                        if (!feature)
                        {
                            break;
                        }
                        tempEvt = {};
                        tempEvt.feature = feature; //provide the top feature
                        if (this.drawData && this.drawData.editingFeature && evt.feature.coreId)
                        {
                            // This case is used when clicking on the feature that is currently being edited.
                            // If evt.feature.coreId is populated it means that the currently edited feature
                            // has been clicked on. The evt.feature.coreId pertains to the actual
                            // feature. The evt.feature.id field is populated with a "drawing + coreId" drawing id.
                            tempEvt.coreId = tempEvt.feature.coreId;
                            // We need to point to the actual feature instead of the temp drawing feature
                            // or else two identical feature click events will issue from the core.
                            tempEvt.feature = this.getFeature(tempEvt.coreId);
                        }
                        else if (feature.parentFeature && feature.parentFeature.featureType && feature.parentFeature.featureType === EmpCesiumConstants.featureType.COMPOUND_ENTITY)
                        {
                            // the core does not know about the id assigned to the children features (KML, geojson). Use
                            // the parent id
                            tempEvt.coreId = feature.parentFeature.id;
                        }
                        else
                        {
                            tempEvt.coreId = tempEvt.feature.id;
                        }
                        tempEvt.featureId = feature.featureId;
                        tempEvt.overlayId = feature.overlayId;
                        featureIds.push(tempEvt.coreId);
                        evts.push(tempEvt);
                    }
                }//for
                if (evts && evts.length > 0)
                {
                    // set top feature only
                    evt.coreId = evts[0].coreId;
                    evt.feature = evts[0].feature;
                    evt.featureId = evts[0].featureId;
                    evt.overlayId = evts[0].overlayId;
                }
                evt.featureIds = featureIds;
            }
        }
    };
    this.addEventListener = function (event)
    {
        var handler;
        if (!this.oEventHandler)
        {
            handler = new this.ScreenSpaceEventHandler(this.scene.canvas);
            this.oEventHandler = handler;
        }
        else
        {
            handler = this.oEventHandler;
        }
        // The callbackData variable declared in each callback function is needed
        // because the event object that Cesium passes back to the event callback
        // function persists instead of sending a new object back when events are fired.
        // This means that modifiactions to this event object will persist as well which
        // leads to problems when checking for certain properties in click code.
        switch (event)
        {
            case "right":
                // rightClick
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleClick(callbackData);
                        delete callbackData;
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_CLICK);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            shiftKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_CLICK, this.KeyboardEventModifier.SHIFT);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            ctrlKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_CLICK, this.KeyboardEventModifier.CTRL);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            altKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_CLICK, this.KeyboardEventModifier.ALT);
                // rightDoubleClick
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleDblClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_DOUBLE_CLICK);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            shiftKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleDblClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_DOUBLE_CLICK, this.KeyboardEventModifier.SHIFT);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            ctrlKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleDblClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_DOUBLE_CLICK, this.KeyboardEventModifier.CTRL);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            altKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleDblClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_DOUBLE_CLICK, this.KeyboardEventModifier.ALT);
                // rightDown
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleMouseDown(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_DOWN);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            shiftKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleMouseDown(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_DOWN, this.KeyboardEventModifier.SHIFT);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            ctrlKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleMouseDown(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_DOWN, this.KeyboardEventModifier.CTRL);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            altKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleMouseDown(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_DOWN, this.KeyboardEventModifier.ALT);
                // rightUp
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleMouseUp(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_UP);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            shiftKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleMouseUp(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_UP, this.KeyboardEventModifier.SHIFT);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            ctrlKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleMouseUp(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_UP, this.KeyboardEventModifier.CTRL);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "right",
                            altKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleMouseUp(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.RIGHT_UP, this.KeyboardEventModifier.ALT);
                break;
            case "left":
                // leftClick
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "left",
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleClick(callbackData);

                        if (this.extentEntity)
                        {
                            this.viewer.entities.remove(this.extentEntity);
                            var rectangle = this.viewer.scene.camera.computeViewRectangle(this.viewer.scene.globe.ellipsoid);
                            this.extentEntity = this.viewer.entities.add({
                                rectangle: {
                                    coordinates: rectangle,
                                    material: Cesium.Color.RED.withAlpha(0.5),
                                    outline: true,
                                    outlineColor: Cesium.Color.RED
                                }
                            });
                        }
                        if (!this.drawData.isEditing && !this.drawData.isDrawing)
                        {
                            // anable starburst when not in edit or draw modes
                            this.starBurst.startStarBurst(event.position);
                        }
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_CLICK);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "left",
                            shiftKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_CLICK, this.KeyboardEventModifier.SHIFT);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "left",
                            ctrlKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_CLICK, this.KeyboardEventModifier.CTRL);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "left",
                            altKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_CLICK, this.KeyboardEventModifier.ALT);
                // leftDoubleClick
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        if (this.viewer)
                        {
                            this.viewer.trackedEntity = undefined;
                        }
                        var callbackData = {
                            button: "left",
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleDblClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        if (this.viewer)
                        {
                            this.viewer.trackedEntity = undefined;
                        }
                        var callbackData = {
                            button: "left",
                            shiftKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleDblClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_DOUBLE_CLICK, this.KeyboardEventModifier.SHIFT);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        if (this.viewer)
                        {
                            this.viewer.trackedEntity = undefined;
                        }
                        var callbackData = {
                            button: "left",
                            ctrlKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleDblClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_DOUBLE_CLICK, this.KeyboardEventModifier.CTRL);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        if (this.viewer)
                        {
                            this.viewer.trackedEntity = undefined;
                        }
                        var callbackData = {
                            button: "left",
                            altKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleDblClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_DOUBLE_CLICK, this.KeyboardEventModifier.ALT);
                // leftDown
                handler.setInputAction(function (event)
                {
                    this.mousePosition = this.startMousePosition = event.endPosition || event.position;
                    if (this.isMouseWithinCanvas(event))
                    {

                        if (this.mapMotionLockEnum === emp3.api.enums.MapMotionLockEnum.SMART_MOTION && this.isMouseWithinSmartMoveDetectionZone(event))
                        {
                            this.scene.screenSpaceCameraController.enableRotate = true;
                            this.scene.screenSpaceCameraController.enableTranslate = true;
                            this.scene.screenSpaceCameraController.enableZoom = true;
                            this.scene.screenSpaceCameraController.enableTilt = true;
                            this.scene.screenSpaceCameraController.enableLook = true;
                            //this.mapMotionLockEnum = emp3.api.enums.MapMotionLockEnum.UNLOCKED;
                            this.viewer.cesiumNavigation.setNavigationLocked(false);
                            //this.bMartMapMoving = true;
                        }


                        var callbackData = {
                            button: "left",
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleMouseDown(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_DOWN);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "left",
                            shiftKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleMouseDown(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_DOWN, this.KeyboardEventModifier.SHIFT);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "left",
                            ctrlKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleMouseDown(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_DOWN, this.KeyboardEventModifier.CTRL);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "left",
                            altKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleMouseDown(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_DOWN, this.KeyboardEventModifier.ALT);
                // leftUp
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        if (this.mapMotionLockEnum === emp3.api.enums.MapMotionLockEnum.SMART_MOTION)
                        {
                            this.scene.screenSpaceCameraController.enableRotate = false;
                            this.scene.screenSpaceCameraController.enableTranslate = false;
                            this.scene.screenSpaceCameraController.enableZoom = false;
                            this.scene.screenSpaceCameraController.enableTilt = false;
                            this.scene.screenSpaceCameraController.enableLook = false;
                            //empCesium.mapMotionLockEnum = emp3.api.enums.MapMotionLockEnum.UNLOCKED;
                            this.viewer.cesiumNavigation.setNavigationLocked(true);
                            this.bMartMapMoving = false;
                            this.bSmartMapMovingRightZone = false;
                            this.bSmartMapMovingLeftZone = false;
                            this.bSmartMapMovingTopZone = false;
                            this.bSmartMapMovingBottomZone = false;
                            this.bSmartMapMovingTopRightZone = false;
                            this.bSmartMapMovingBottomRightZone = false;
                            this.bSmartMapMovingTopLeftZone = false;
                            this.bSmartMapMovingBottomLeftZone = false;
                        }

                        var callbackData = {
                            button: "left",
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleMouseUp(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_UP);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "left",
                            shiftKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleMouseUp(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_UP, this.KeyboardEventModifier.SHIFT);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "left",
                            ctrlKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleMouseUp(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_UP, this.KeyboardEventModifier.CTRL);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "left",
                            altKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleMouseUp(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.LEFT_UP, this.KeyboardEventModifier.ALT);
                break;
            case "middle":
                // middleClick
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "middle",
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_CLICK);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "middle",
                            shiftKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_CLICK, this.KeyboardEventModifier.SHIFT);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "middle",
                            ctrlKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_CLICK, this.KeyboardEventModifier.CTRL);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "middle",
                            altKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_CLICK, this.KeyboardEventModifier.ALT);
                // middleDoubleClick
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "middle",
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleDblClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_DOUBLE_CLICK);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "middle",
                            shiftKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleDblClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_DOUBLE_CLICK, this.KeyboardEventModifier.SHIFT);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "middle",
                            ctrlKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleDblClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_DOUBLE_CLICK, this.KeyboardEventModifier.CTRL);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "middle",
                            altKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleDblClick(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_DOUBLE_CLICK, this.KeyboardEventModifier.ALT);
                // middleDown
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "middle",
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleMouseDown(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_DOWN);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "middle",
                            shiftKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleMouseDown(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_DOWN, this.KeyboardEventModifier.SHIFT);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "middle",
                            ctrlKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleMouseDown(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_DOWN, this.KeyboardEventModifier.CTRL);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "middle",
                            altKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleMouseDown(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_DOWN, this.KeyboardEventModifier.ALT);
                // middleUp
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "middle",
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleMouseUp(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_UP);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "middle",
                            shiftKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleMouseUp(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_UP, this.KeyboardEventModifier.SHIFT);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        if (this.isMouseWithinCanvas(event))
                        {
                            var callbackData = {
                                button: "middle",
                                ctrlKey: true,
                                position: {
                                    x: event.position.x,
                                    y: event.position.y
                                },
                                domEvent: event.domEvent
                            };
                            this.prePopulateEvent(callbackData, true);
                            this.handleMouseUp(callbackData);
                            this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                        }
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_UP, this.KeyboardEventModifier.CTRL);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "middle",
                            altKey: true,
                            position: {
                                x: event.position.x,
                                y: event.position.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, true);
                        this.handleMouseUp(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MIDDLE_UP, this.KeyboardEventModifier.ALT);
                handler.setInputAction(function (event)
                {
                    this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                }.bind(this), this.ScreenSpaceEventType.WHEEL);
                break;
            case "mousemove":
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {

                        this.mousePosition = event.endPosition || event.position;
//                        if (this.mapMotionLockEnum === emp3.api.enums.MapMotionLockEnum.SMART_MOTION && this.isMouseWithinSmartMoveDetectionZone(event))
//                        {
//                            var width = this.canvas.width;
//                            var height = this.canvas.height;
//                            var mousePosition = event.endPosition || event.position;
//
//                            // Coordinate (0.0, 0.0) will be where the mouse was clicked.
//                            var x = (mousePosition.x - startMousePosition.x) / width;
//                            var y = -(mousePosition.y - startMousePosition.y) / height;
//
//                        }
//                        if (this.mapMotionLockEnum === emp3.api.enums.MapMotionLockEnum.SMART_MOTION && this.isMouseWithinSmartMoveDetectionZone(event))
//                        {
//                            this.scene.screenSpaceCameraController.enableTranslate = true;
//                            this.scene.screenSpaceCameraController.enableZoom = true;
//                            this.scene.screenSpaceCameraController.enableTilt = true;
//                            this.scene.screenSpaceCameraController.enableLook = true;
//                            //this.mapMotionLockEnum = emp3.api.enums.MapMotionLockEnum.UNLOCKED;
//                            //empCesium.viewer.cesiumNavigation.setNavigationLocked(true);
//                        }
//                        else if (this.mapMotionLockEnum === emp3.api.enums.MapMotionLockEnum.SMART_MOTION && !this.isMouseWithinSmartMoveDetectionZone(event))
//                        {
//                            this.scene.screenSpaceCameraController.enableTranslate = false;
//                            this.scene.screenSpaceCameraController.enableZoom = false;
//                            this.scene.screenSpaceCameraController.enableTilt = false;
//                            this.scene.screenSpaceCameraController.enableLook = false;
//                            //empCesium.mapMotionLockEnum = emp3.api.enums.MapMotionLockEnum.UNLOCKED;
//                            //empCesium.viewer.cesiumNavigation.setNavigationLocked(true);
//                        }

                        var callbackData = {
                            button: "mousemove",
                            position: {
                                x: event.endPosition.x,
                                y: event.endPosition.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleMove(callbackData);
                        if (!this.drawData.isEditing && !this.drawData.isDrawing)
                        {
                            this.starBurst.updateStarBurst(event.endPosition);
                        }
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MOUSE_MOVE);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "mousemove",
                            shiftKey: true,
                            position: {
                                x: event.endPosition.x,
                                y: event.endPosition.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleMove(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MOUSE_MOVE, this.KeyboardEventModifier.SHIFT);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "mousemove",
                            ctrlKey: true,
                            position: {
                                x: event.endPosition.x,
                                y: event.endPosition.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleMove(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MOUSE_MOVE, this.KeyboardEventModifier.CTRL);
                handler.setInputAction(function (event)
                {
                    if (this.isMouseWithinCanvas(event))
                    {
                        var callbackData = {
                            button: "mousemove",
                            altKey: true,
                            position: {
                                x: event.endPosition.x,
                                y: event.endPosition.y
                            },
                            domEvent: event.domEvent
                        };
                        this.prePopulateEvent(callbackData, false);
                        this.handleMove(callbackData);
                        this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    }
                }.bind(this), this.ScreenSpaceEventType.MOUSE_MOVE, this.KeyboardEventModifier.ALT);
                break;
            default:
                break;
        }
    };
    this.storeUrlNotAccessible = function (url)
    {
        urlAddressesNotAccessible[url ] = url;
    };
    this.isUrlNotAccessible = function (url)
    {
        if (urlAddressesNotAccessible.hasOwnProperty(url))
        {
            return true;
        }
        else
        {
            return false;
        }
    };
    this.removeGraphic = function (item)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        }, feature;

        try
        {
            //var id = item.coreId;
            var layer;

//            // If we are running of a V2 core we need to see if the feature is
//            // multi-parent required. And if it is, the parent overlay is in parentCoreId.
//            if (this.isV2Core)
//            {
//                layer = this.getLayer(item.overlayId);
//            }
//            else
//            {
//                layer = this.getLayer(item.parentCoreId);
//            }

            feature = this.getFeature(item.coreId);
            if (feature)
            {
                // feature found. remove it without the need of a layer;
                this.removeFeature(item.coreId);
                var airspaceLabelPresent = this.isMultiPointPresent(item.coreId + "_label");
                if (airspaceLabelPresent)
                {
                    var airspaceLabel = this.getFeature(item.coreId + "_label");
                    this.removeFeature(airspaceLabel.id);
                }
            }
            else if (item.coreId)
            {
                //For Image/KML Layers
                var layer = this.getLayer(item.coreId);
                if (layer)
                {
                    this.removeLayer(layer);
                }
            }
            if (this.isFeatureSelected(item.coreId))
            {
                this.removeFeatureSelection(item.coreId);
            }

        }
        catch (err)
        {
            result.success = false;
            result.message = "Could not remove the graphic from the globe.";
            result.jsError = err;
        }
        return result;
    };
    /**
     Adds a kml string to an overlay.  The string can be any placemark or self contained
     item in kml--it doesn't need to be a document.
     @var {string} kmlString - A string of valid kml placemark or other object.
     @var {string} id - A unique id to refer to this kml
     @var {string} overlayId - The overlay to add the kml to.
     @var {boolean} zoom - If set to true the map will focus on the object
     after it has been added.
     @var {object} properties - Object may contain general properties or styling parameters
     **/
    this.addSingleKmlToOverlay = function (kmlString, id, parentCoreId, zoom, properties, args)
    {
        var result = {
            success: true
        },
        options = {},
                useProxy = false,
                layer;
        if (id === this.mapEngineExposed.currentDrawingId)
        {
            return result; // don't duplicate
        }

        if (args.parentCoreId)
        {
            layer = this.getLayer(args.parentCoreId);
            if (layer === undefined)
            {
                layer = this.getLayer(args.feature.overlayId);   // this.getFeature(args.parentCoreId);
            }
            if (layer === undefined)
            {
                result.success = false;
                result.message = "addGeojsonToOverlay - This feature is not specifying a parent layer: ";
                return result;
            }
        }
        else
        {
            result.success = false;
            result.message = "This feature is not specifying a parent layer: ";
            return result;
        }
        try
        {
            if (kmlString.indexOf('<kml') === -1)
            {
                kmlString = '<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2">' + kmlString + '</kml>';
            }
            var kml = emp.$.parseXML(kmlString);

            if (this.isV2Core)
            {
                useProxy = emp.util.config.getUseProxySetting();
            }
            else if (args.feature && args.feature.useProxy)
            {
                useProxy = args.feature.useProxy;
            }

            if (useProxy)
            {
                options = {camera: this.viewer.scene.camera, canvas: this.canvas, proxy: new this.DefaultProxy(this.proxyUrl)};
            }
            else
            {
                options = {camera: this.viewer.scene.camera, canvas: this.canvas};
            }

            if (args.properties && args.properties.altitudeMode && (cesiumEngine.utils.AltitudeModeEnumType.ALTITUDE_CLAMP_TO_GROUND === args.properties.altitudeMode))
            {
                //options.clampToGround = true;
            }
            var kmlDataSource = new this.KmlDataSource(options);

            kmlDataSource.load(kml).then(function ()
            {
                if (EmpCesiumConstants.USE_DATA_SOURCE)
                {
                    kmlDataSource.id = args.id;
                    kmlDataSource.featureId = args.featureId;
                    kmlDataSource.name = args.name;
                    kmlDataSource.description = args.description;
                    kmlDataSource.overlayId = args.overlayId;
                    kmlDataSource.featureType = EmpCesiumConstants.featureType.DATA_SOURCE;
                    kmlDataSource.properties = args.properties;
                    kmlDataSource.show = args.visible;
                    layer.addFeature(kmlDataSource);
                }
                else
                {
                    var entityArray = kmlDataSource.entities.values;
                    if (entityArray && entityArray.length > 0)
                    {
                        //trying to fix a bad image object coming from the kml data source
                        for (var indexEntities = 0; indexEntities < entityArray.length; indexEntities++)
                        {
                            var entity = entityArray[indexEntities];
                            if (entity.billboard)
                            {
                                var url = entity.billboard.image.getValue();
                                if (typeof url !== "string")
                                {
                                    // the KMLdatasourec assigned its own default icon as a canvas. This happens when thre is no icon tag or the URL is empty
                                    // The desired intention is to only display the icon name like a label with no icon.
                                    // set the icon to invisible
                                    entity.billboard = undefined;

                                }
                                else
                                {
                                    //encode any presence of '&' in the URL (EMS widget issue)
                                    url = url.replace(/&/g, "%26");
                                    entity.billboard.image = url;
                                }

                                if (args.feature.properties.iconUrl && args.feature.properties.iconUrl.length > 0)
                                {
                                    if (useProxy)
                                    {
                                        entity.billboard.image = new this.ConstantProperty(this.getProxyUrl() + "?url=" + args.feature.properties.iconUrl);
                                    }
                                    else
                                    {
                                        entity.billboard.image = new this.ConstantProperty(args.feature.properties.iconUrl);
                                    }
                                }
//                                else
//                                {
//                                    //use default emp icon. Local icon not requiring proxy.
//                                    entity.billboard.image = emp.utilities.getDefaultIcon().iconUrl;
//                                }
//                                entity.billboard.image = url;
//                                var defaultIconName = emp.utilities.getDefaultIcon().iconUrl.split("/");
//                                if (defaultIconName && defaultIconName.length > 0)
//                                {
//                                    defaultIconName = defaultIconName[defaultIconName.length - 1];
//
//                                    if (((typeof url === "string") && (url.indexOf(defaultIconName) > -1)))
//                                    {
//                                        // set width height offset aligned axis  vertical origin  of default icon
//                                        entity.billboard.width = emp.utilities.getDefaultIcon().offset.width;
//                                        entity.billboard.height = emp.utilities.getDefaultIcon().offset.height;
//                                        if (!this.defined(entity.billboard.pixelOffset))
//                                        {
//                                            entity.billboard.pixelOffset = new this.Cartesian2(emp.utilities.getDefaultIcon().offset.x, emp.utilities.getDefaultIcon().offset.y);
//                                        }
//                                        if (!this.defined(entity.billboard.alignedAxis))
//                                        {
//                                            entity.billboard.alignedAxis = this.Cartesian3.ZERO;
//                                        }
//                                        if (!this.defined(entity.billboard.verticalOrigin))
//                                        {
//                                            entity.billboard.verticalOrigin = this.VerticalOrigin.BOTTOM;
//                                        }
//                                        if (!this.defined(entity.billboard.horizontallOrigin))
//                                        {
//                                            entity.billboard.horizontallOrigin = this.HorizontalOrigin.CENTER;
//                                        }
//                                    }
//                                    else if (typeof url !== "string")
//                                    {
//                                        // the KMLdatasourec assigned its own default icon as a canvas. This happens when thre is no icon tag or the URL is empty
//                                        // The desired intention is to only display the icon name like a label with no icon.
//                                        // set the icon to invisible
//                                        entity.billboard = undefined;
//
//                                    }
                                // }
                            }
                        }
                        this.processEntities({layer: layer, entityArray: entityArray, data: args});
                        kmlDataSource = undefined;
                    }
                    else
                    {
                        // empty so it must be a bad KML. return a fail result
                        result = {success: false,
                            message: "addSingleKmlToOverlay : 0  entities came from the KMLDataSource. The KML couild be invalid "};
                    }
                }
            }.bind(this));
        }
        catch (e)
        {
            result = {success: false,
                message: "addSingleKmlToOverlay : " + e};
        }
        kmlDataSource = null;
        return result;
    };
    this.processPrimitives = function (args)
    {
        var len = args.primitiveArray.length;
        for (var index = 0; index < len; index++)
        {
            args.layer.addFeature(args.primitiveArray[index]);
        }
    };
    this.processFlashlight = function (args)
    {
        var entity = new this.Entity(),
                positions = [],
                coordinates = [];
        entity.featureType = EmpCesiumConstants.featureType.ENTITY;
        coordinates = args.data.data.coordinates;
        for (var index = 0; index < coordinates.length; index++)
        {
            var coordinate = coordinates[index];
            positions.push(Cesium.Ellipsoid.WGS84.cartographicToCartesian(Cesium.Cartographic.fromDegrees(coordinate[0], coordinate[1])));
        }
        entity.polyline = {"positions": positions, "width": 5, "material": this.Color.RED}; //followSurface : false
        var rgbaLineColor = undefined;
        if (args.data.properties.strokeColor)
        {
            rgbaLineColor = cesiumEngine.utils.hexToRGB(args.data.properties.strokeColor);
            entity.polyline.material = new this.Color(rgbaLineColor.r, rgbaLineColor.g, rgbaLineColor.b, rgbaLineColor.a);
        }
        else
        {
            entity.polyline.material = EmpCesiumConstants.propertyDefaults.LINE_COLOR;
        }
        if (args.data.properties.strokeWidth && !isNaN(args.data.properties.strokeWidth))
        {
            entity.polyline.width = args.data.properties.strokeWidth;
        }
        else
        {
            entity.polyline.width = EmpCesiumConstants.propertyDefaults.LINE_WIDTH;
        }
        if (args.layer.isFeaturePresentById(args.data.id))
        {
            var presentEntity = args.layer.getFeature(args.data.id);
            if (presentEntity.featureType === EmpCesiumConstants.featureType.ENTITY)
            {
                //update existing entity's geometries
                if (entity.polyline && presentEntity.polyline)
                {
                    presentEntity.polyline.positions = entity.polyline.positions;
                    presentEntity.polyline.material = entity.polyline.material;
                    presentEntity.polyline.width = entity.polyline.width;
                }
                else if (entity.polyline && !presentEntity.polyline)
                {
                    presentEntity.polyline = entity.polyline;
                }
                else if (!entity.polyline && presentEntity.polyline)
                {
                    presentEntity.polyline = undefined;
                }
            }
        }
        else if (!args.layer.isFeaturePresentById(args.data.id))
        {
            //single entity case with no compound parent entity
            entity._id = args.data.id;
            entity.featureType = EmpCesiumConstants.featureType.ENTITY;
            entity.featureId = args.data.featureId;
            entity.name = args.data.name;
            entity.description = args.data.properties.description;
            entity.overlayId = args.data.overlayId;
            entity.show = true;
            args.layer.addFeature(entity);
        }
    };
    this.addNewOverlayLayer = function (layerName, id, parentOverlayId)
    {
        //this.addTestInitializationPin();
        var layer = new EmpLayer(layerName, id, EmpCesiumConstants.layerType.OVERLAY_LAYER, this);
        this.addLayer(layer);
        return layer;
    };
    /**
     Gets the folder associated with this id.
     
     @param {string} id The id of the folder you are requesting.
     */
    this.getFolder = function (id)
    {
        var dataElement;
        dataElement = this.getLayer(id);
        return dataElement;
    };
    this.removeFolder = function (id)
    {
        var result = {success: true, message: "layer was successfully deleted"};
        if (id !== undefined)
        {
            var layer = this.getFolder(id);
            if (layer)
            {
                for (var featureKey in layer.featureKeys)
                {
                    this.removeFeatureSelection(featureKey);
                }
                //remove all features at overlay and subOverlays recursively. It also remove the subOverlays
                this.removeLayer(layer);
            }
        }
        else
        {
            result = {success: false, message: "Missing folder id parameter"};
        }

        return result;
    };
    /**
     Removes all graphics and folders within the folder provided.
     */
    this.clearFolder = function (id)
    {
        if (id !== undefined)
        {
            var layer = this.getLayer(id);
            if (layer)
            {
                for (var featureKey in layer.features)
                {
                    this.removeFeatureSelection(featureKey);
                }
                layer.removeFeatures();
                //clear all sub overlays
                if (layer.subLayersLength > 0)
                {
                    for (var subLayerId in layer.subLayers)
                    {
                        clearFolder(subLayerId);
                    }
                    this.layer.removeAllSubOverlays();
                }
                result = {
                    success: true,
                    message: "layer was successfully cleared"
                };
            }
        }
        else
        {
            result = {
                success: false,
                message: "Missing id parameter"
            };
        }
        return result;
    };
    /**
     * @desc Adds a single kml feature to an overlay.
     *
     * @param {object} args - The args object required to add kml to an overlay.
     * @param {string} args.id - The id of the kml object to be added.
     * @param {string} args.overlayId - The id of the overlay the kml is to be added to.
     * @param {string} args.kmlString - The kml string to be added to the overlay.
     * @param {object} args.properties - Properties to modify the kml to be added.
     * @param {@link Feature} args.feature - The original {@link Feature} passed in.
     *
     * @returns {object} result - The resulting object to be returned.
     * @returns {boolean} result.success - Describes if the kml was added or not.
     * @returns {string} result.message - Description of error that occurred.
     * @returns {object} result.jsError - Object returned from a caught javascript exception.
     */
    this.addKmlToOverlay = function (args)
    {
        var result = {
            success: true
        },
        kmlActuallyAdded = [];
        try
        {
            result = this.addSingleKmlToOverlay(args.data, args.id, args.parentCoreId, args.zoom, args.properties, args);
            if (result.success === true)
            {
                kmlActuallyAdded.push(args);
            }
        }
        catch (err)
        {
            // logMapError(err);
            result = {
                success: false,
                message: err.message
            };
        }
        // Add which data was actually added to the map
        // So we can keep track of what we need to add
        // to the data explorer.
        result.data = kmlActuallyAdded;
        return result;
    };
    this.addGeojsonToOverlay = function (args)
    {
        var result = {
            success: true
        },
        options = {}, useProxy = false,
                layer;
        try
        {
            if (args.feature && args.feature.useProxy)
            {
                useProxy = args.feature.useProxy;
            }


            options.stroke = EmpCesiumConstants.propertyDefaults.LINE_COLOR;
            options.fill = EmpCesiumConstants.propertyDefaults.FILL_COLOR;
            var geoJsonDataSource = new this.GeoJsonDataSource();
            if (args.properties && args.properties.altitudeMode && (cesiumEngine.utils.AltitudeModeEnumType.ALTITUDE_CLAMP_TO_GROUND === args.properties.altitudeMode))
            {
                //geoJsonDataSource.clampToGround = true;
                // options = {clampToGround: true};

            }
            if (args.parentCoreId)
            {
                layer = this.getLayer(args.parentCoreId);
                if (layer === undefined)
                {
                    layer = this.getLayer(args.feature.overlayId);   // this.getFeature(args.parentCoreId);
                }
                if (layer === undefined)
                {
                    result.success = false;
                    result.message = "addGeojsonToOverlay - This feature is not specifying a parent layer: ";
                    return result;
                }
            }
            else
            {
                result.success = false;
                result.message = "addGeojsonToOverlay - This feature is not specifying a parent layer: ";
                return result;
            }
            //if (!this.isNavigationEnabled())
            //{
            //    processFlashlight({layer: layer, data: args});
            //}
            //else
            //{
            geoJsonDataSource.overlayId = args.overlayId;
            //var options = {markerSymbol: 'emp-default-icon'};
            //var options = {};
            geoJsonDataSource.zoom = args.zoom;
            geoJsonDataSource.featureType = EmpCesiumConstants.featureType.DATA_SOURCE;
            geoJsonDataSource.load(args.data, options).then(function (geoJsonDataSource)
                    //geoJsonDataSource.load(args.data, options).then(function (geoJsonDataSource)
                    {
                        if (EmpCesiumConstants.USE_DATA_SOURCE)
                        {
                            geoJsonDataSource.id = args.id;
                            geoJsonDataSource.featureId = args.featureId;
                            geoJsonDataSource.name = args.name;
                            geoJsonDataSource.description = args.description;
                            geoJsonDataSource.overlayId = args.overlayId;
                            geoJsonDataSource.show = args.visible;
                            layer.addFeature(geoJsonDataSource);
                            var entities = geoJsonDataSource.entities.values;
                            for (var index = 0; index < entities.length; index++)
                            {
                                var entity = entities[index];
                                if (entity.label)
                                {
                                    var labelScale = 1;
                                    entity.label.scale = labelScale;
                                    entity.label._font.setValue('20px sans-serif');
                                    entity.label.translucencyByDistance = new this.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.0);
                                }
                            }
                            if (geoJsonDataSource.zoom)
                            {
                                this.flyTo({
                                    destination: geoJsonDataSource,
                                    range: args.range,
                                    orientation: {heading: 0.0, pitch: this.Math.toRadians(-75), roll: 0.0}
                                });
                            }
                        }
                        else
                        {
                            var entityArray = geoJsonDataSource.entities.values;
                            if (entityArray.length > 0)
                            {
                                for (var index = 0; index < entityArray.length; index++)
                                {
                                    var entity = entityArray[index];
                                    if (entity.billboard)
                                    {
                                        // the datasource is setting the verticalorigin to bottom...why?? the default is center.
                                        if (this.defined(args.overlayId) && args.overlayId === "vertices")
                                        {
                                            // the pixel offset sent by the core has 12, 12 but the default vertical and horizontal origins is center and therefore the
                                            // the control points are not centered at the position to edit.
                                            entity.billboard.verticalOrigin = this.VerticalOrigin.BOTTOM;
                                            entity.billboard.horizontalOrigin = this.HorizontalOrigin.RIGHT;
                                        }
                                        //use default emp icon
                                        //if (emp.util.config.getUseProxySetting())
                                        //{
                                        //    entity.billboard.image = this.getProxyUrl() + "?url=" + emp.utilities.getDefaultIcon().iconUrl;
                                        //}
                                        //else
                                        //{
                                        if (args.feature.properties && args.feature.properties.iconUrl && args.feature.properties.iconUrl.length > 0)
                                        {
                                            if (args.feature.properties.iconUrl.indexOf("data:image") > -1)
                                            {
                                                // no proxy needed for dataUrl
                                                entity.billboard.image = args.feature.properties.iconUrl;// Cesium.loadImage(base)
                                            }
                                            else if (useProxy)
                                            {
                                                entity.billboard.image = new this.ConstantProperty(this.getProxyUrl() + "?url=" + args.feature.properties.iconUrl);
                                            }
                                            else
                                            {
                                                entity.billboard.image = new this.ConstantProperty(args.feature.properties.iconUrl);
                                            }
                                        }
                                        else
                                        {
                                            entity.billboard.image = emp.utilities.getDefaultIcon().iconUrl;
                                        }


                                        if (!this.defined(entity.label))
                                        {
                                            var label = new this.LabelGraphics({"text": args.name});
                                            label.style = this.LabelStyle.FILL_AND_OUTLINE;
                                            label.outlineWidth = 3;
                                            label.text = args.name;

                                            if (args.properties && args.properties.labelStyle)
                                            {
                                                if (args.properties.labelStyle.color)
                                                {
                                                    //var rgbaFillColor = cesiumEngine.utils.hexToRGB(empPrimitiveItem.properties.fillColor);
//                label.fillColor =   this.Color.fromBytes(rgbaFillColor.r, rgbaFillColor.g, rgbaFillColor.b, rgbaFillColor.a);
                                                    label.fillColor = this.Color.fromBytes(args.properties.labelStyle.color.red, args.properties.labelStyle.color.green, args.properties.labelStyle.color.blue, args.properties.labelStyle.color.alpha * 255);
                                                }
                                                if (args.properties.labelStyle.outlineColor)
                                                {
                                                    //var rgbaOutlineColor = cesiumEngine.utils.hexToRGB(empPrimitiveItem.properties.lineColor);
                                                    label.outlineColor = this.Color.fromBytes(args.properties.labelStyle.outlineColor.red, args.properties.labelStyle.outlineColor.green, args.properties.labelStyle.outlineColor.blue, args.properties.labelStyle.outlineColor.alpha * 255);
                                                }

                                                if (args.properties.labelStyle.scale)
                                                {
                                                    label.scale = args.properties.labelStyle.scale;
                                                }

                                                if (args.properties.labelStyle.family && args.properties.labelStyle.size)
                                                {
                                                    label.font = args.properties.labelStyle.size + "px " + args.properties.labelStyle.family;
                                                }
                                                else if (args.properties.labelStyle.family && !args.properties.labelStyle.size)
                                                {
                                                    label.font = "24px " + args.properties.labelStyle.family;
                                                }
                                                else if (!args.properties.labelStyle.family && args.properties.labelStyle.size)
                                                {
                                                    label.font = args.properties.labelStyle.size + "px sans-serif";
                                                }
                                                else
                                                {
                                                    label.font = "24px sans-serif";
                                                }

                                                if (args.properties.labelStyle.justification)
                                                {
                                                    switch (args.properties.labelStyle.justification)
                                                    {
                                                        case "left":
                                                            label.horizontalOrigin = this.HorizontalOrigin.RIGHT;// meaning between emp and Cesium is different. right side of label next to the position that looks like left justified.
                                                            break;
                                                        case "center":
                                                            label.horizontalOrigin = this.HorizontalOrigin.CENTER;
                                                            break;
                                                        case "right":
                                                            label.horizontalOrigin = this.HorizontalOrigin.LEFT;// left  side of label next to the position that looks like right  justified.
                                                            break;
                                                        default:
                                                            label.horizontalOrigin = this.HorizontalOrigin.LEFT;
                                                            break;
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                label.horizontalOrigin = this.HorizontalOrigin.LEFT;
                                            }
                                            label.verticalOrigin = this.VerticalOrigin.BOTTOM;
                                            label.pixelOffset = new this.Cartesian2(10, 10);
                                            entity.label = label;
                                        }
                                        // }

                                    }
                                }
                                this.processEntities({layer: layer, entityArray: entityArray, data: args});
                                if (geoJsonDataSource.zoom)
                                {
                                    this.flyTo({
                                        destination: geoJsonDataSource,
                                        range: args.range,
                                        orientation: {heading: 0.0, pitch: this.Math.toRadians(-75), roll: 0.0}
                                    });
                                }
                            }
                            else
                            {
                                // empty so it must be a bad KML. return a fail result
                                result = {success: false,
                                    message: "addGeojsonToOverlay : 0  entities came from the GeojsonDataSource. The geojson couild be invalid "};
                            }
                            geoJsonDataSource = undefined;
                        }
                    }.bind(this));
            //}
        }
        catch (err)
        {
            result = {
                success: false,
                message: err.message
            };
        }
        geoJsonDataSource = null;
        // Add which data was actually added to the map
        // So we can keep track of what we need to add
        // to the data explorer.
        // result.data = kmlActuallyAdded;
        return result;
    };
    this.addMultiPointGeojsonToOverlay = function (args)
    {
        var result = {
            success: true
        },
        options = {},
                layer;
        try
        {
            options.stroke = EmpCesiumConstants.propertyDefaults.LINE_COLOR;
            options.fill = EmpCesiumConstants.propertyDefaults.FILL_COLOR;
            var geoJsonDataSource = new this.GeoJsonDataSource();
            if (args.properties && args.properties.altitudeMode && (cesiumEngine.utils.AltitudeModeEnumType.ALTITUDE_CLAMP_TO_GROUND === args.properties.altitudeMode))
            {
                //options = {clampToGround: true};
            }
            if (args.parentCoreId)
            {
                layer = this.getLayer(args.parentCoreId);
                if (layer === undefined)
                {
                    layer = this.getLayer(args.overlayId);   // this.getFeature(args.parentCoreId);
                }
                if (layer === undefined)
                {
                    result.success = false;
                    result.message = "addGeojsonToOverlay - This feature is not specifying a parent layer: ";
                    return result;
                }
            }
            else
            {
                result.success = false;
                result.message = "addGeojsonToOverlay - This feature is not specifying a parent layer: ";
                return result;
            }
            geoJsonDataSource.overlayId = layer.id;
            geoJsonDataSource.load(args.data, options).then(function ()
            {
                geoJsonDataSource.id = args.id;
                geoJsonDataSource.featureId = args.featureId;
                geoJsonDataSource.symbolCode = args.symbolCode;
                geoJsonDataSource.name = args.name;
                geoJsonDataSource.description = args.description;
                geoJsonDataSource.overlayId = args.overlayId;
                geoJsonDataSource.featureType = EmpCesiumConstants.featureType.DATA_SOURCE;
                layer.addFeature(geoJsonDataSource);
            }.bind(this));
        }
        catch (err)
        {
            /// logMapError(err);
            result = {
                success: false,
                message: err.message
            };
        }
        // Add which data was actually added to the map
        // So we can keep track of what we need to add
        // to the data explorer.
        // result.data = kmlActuallyAdded;
        return result;
    };
    this.addDataUrlToOverlay = function (args)
    {
        var result = {
            success: true
        },
        layer;
        try
        {
            if (args.parentCoreId)
            {
                layer = this.getLayer(args.parentCoreId);
                if (layer === undefined)
                {
                    layer = this.getLayer(args.overlayId);   // this.getFeature(args.parentCoreId);
                }
                if (layer === undefined)
                {
                    result.success = false;
                    result.message = "addDataUrlToOverlay - This feature is not specifying a parent layer: ";
                    return result;
                }
            }

            if (layer)
            {
                var material = new this.ImageMaterialProperty();
                material.image = new this.ConstantProperty(args.data.dataURL);
                var options = {coordinates: this.Rectangle.fromDegrees(args.data.geoTL.x, args.data.geoBR.y, args.data.geoBR.x, args.data.geoTL.y),
                    fill: true,
                    show: true,
                    material: material
                };
                var rectangle = new this.RectangleGraphics(options);
                try
                {
                    // check if rectangle is valid before rendering on the map. The map crashes if the rectangle is invalid.
                    if (!this.defined(this.Rectangle.validate(new this.Rectangle(rectangle.coordinates.getValue().west, rectangle.coordinates.getValue().south, rectangle.coordinates.getValue().east, rectangle.coordinates.getValue().north))))
                    {
                        result = {
                            success: false,
                            message: "coordinates of layer image are not valid"
                        };
                        return result;
                    }

                }
                catch (err)
                {
                    result = {
                        success: false,
                        message: err.message
                    };
                    return result;
                }
                var entity = new this.Entity();
                entity.featureType = EmpCesiumConstants.featureType.ENTITY;
                entity.overlayId = layer.id;
                entity._id = args.id;
                entity.featureId = args.featureId;
                entity.symbolCode = args.symbolCode;
                entity.rectangle = rectangle;
                entity.show = true;
                this.processEntities({layer: layer, entityArray: [entity], data: args});
            }
            else
            {
                result.success = false;
                result.message = "addDataUrlToOverlay - This feature is not specifying a parent layer: ";
                return result;
            }
        }
        catch (err)
        {
            result = {
                success: false,
                message: err.message
            };
        }
        // Add which data was actually added to the map
        // So we can keep track of what we need to add
        // to the data explorer.
        result.data = args.data;
        return result;
    };
//
//

    this.addCanvasToOverlay = function (args)
    {
        var result = {
            success: true
        },
        layer,
                oRectangle,
                material,
                entity,
                multiPointRectanglePrimitive,
                options,
                textureFromCanvas,
                image, isZeroBound,
                id;
        try
        {
            isZeroBound = false;
            if (args.parentCoreId)
            {
                layer = this.getLayer(args.parentCoreId);
                if (layer === undefined)
                {
                    layer = this.getLayer(args.overlayId);   // this.getFeature(args.parentCoreId);
                }
                if (layer === undefined)
                {
                    result.success = false;
                    result.message = "addDataUrlToOverlay - This feature is not specifying a parent layer: ";
                    return result;
                }
            }

            if (layer)
            {
                // if (args.data.geoTL.x === 0 && args.data.geoBR.y === 0 && args.data.geoBR.x === 0 && args.data.geoTL.y === 0)
                if (Cesium.defined(args.data.west) && Cesium.defined(args.data.south) && Cesium.defined(args.data.east) && Cesium.defined(args.data.north))
                {
                    if (args.data.west.x === 0 || args.data.south.y === 0 || args.data.east.x === 0 || args.data.north.y === 0)
                    {
                        isZeroBound = true;
                        var cartoArray = cesiumEngine.utils.convertCoordsDegreesToCartographicArray({type: args.feature.data.type, coordinates: args.feature.data.coordinates});
                        if (cartoArray.length === 1)
                        {
                            cartoArray.push(new this.Cartographic(cartoArray[0].longitude + 0.00174533, cartoArray[0].latitude + 0.00174533));
                            cartoArray.push(new this.Cartographic(cartoArray[0].longitude - 0.00174533, cartoArray[0].latitude - 0.00174533));
                        }
                        oRectangle = this.Rectangle.fromCartographicArray(cartoArray);
                        //oRectangle = this.Rectangle.fromDegrees(args.feature.data.coordinates[0][0], args.feature.data.coordinates[0][1], args.feature.data.coordinates[0][0] + .3, args.feature.data.coordinates[0][1] + .3);
                        args.data.wasClipped = true;
                        args.data.forceRedraw = true;
                    }
                    else
                    {
                        oRectangle = this.Rectangle.fromDegrees(args.data.west.x, args.data.south.y, args.data.east.x, args.data.north.y);
                        //oRectangle = this.Rectangle.fromDegrees(args.data.geoTL.x, args.data.geoBR.y, args.data.geoBR.x, args.data.geoTL.y);
                        args.data.forceRedraw = false;
                    }
                }
                else
                {
                    var cartoArray = cesiumEngine.utils.convertCoordsDegreesToCartographicArray({type: args.feature.data.type, coordinates: args.feature.data.coordinates});
                    oRectangle = this.Rectangle.fromCartographicArray(cartoArray);
                    //oRectangle = this.Rectangle.fromDegrees(args.feature.data.coordinates[0][0], args.feature.data.coordinates[0][1], args.feature.data.coordinates[0][0] + .3, args.feature.data.coordinates[0][1] + .3);
                    args.data.wasClipped = true;
                    args.data.forceRedraw = true;
                }

                this.Rectangle.validate(oRectangle);// throws is not valid
                if (!this.defined(oRectangle))
                {
                    result.success = false;
                    result.message = "multipoint rectangle is invalid. Ignoring the rendering for graphic having a symbol code = " + args.symbolCode;
                    console.log(result.message);
                    return result;

                }
                if (isNaN(parseFloat(oRectangle.west)) || isNaN(parseFloat(oRectangle.south)) || isNaN(parseFloat(oRectangle.east)) || isNaN(parseFloat(oRectangle.north)))
                {
                    result.success = false;
                    result.message = "multipoint rectangle is invalid. Ignoring the rendering for graphic having a symbol code = " + args.symbolCode;
                    console.log(result.message);
                    return result;

                }
                if (oRectangle.south > oRectangle.north)
                {
                    result.success = false;
                    result.message = "multipoint rectangle is invalid. south can not be bigger than north. Ignoring the rendering for graphic having a symbol code = " + args.symbolCode;
                    console.log(result.message);
                    return result;

                }
                if ((Math.abs(oRectangle.south) > this.Math.PI_OVER_TWO) || (Math.abs(oRectangle.north) > this.Math.PI_OVER_TWO))
                {
                    result.success = false;
                    result.message = "multipoint rectangle is invalid. north and south can not be bigger than abs 90. Ignoring the rendering for graphic having a symbol code = " + args.symbolCode;
                    console.log(result.message);
                    return result;
                }

                //console.log("bounds from rectangle: w s e n" + Cesium.Math.toDegrees(oRectangle.west) + " " + Cesium.Math.toDegrees(oRectangle.south) + Cesium.Math.toDegrees(oRectangle.east) + " " + Cesium.Math.toDegrees(oRectangle.north) );

//                if ((Math.abs(args.data.south.y > 90)) ||  (Math.abs(oRectangle.args.data.north.y)  > 90))
//                {
//                    throw "multipoint rectangle is invalid. north and south can not be bigger than abs 90. Ignoring the rendering for graphic having a symbol code = " + args.symbolCode;
//                }
//                if (this.Math.equalsEpsilon(oRectangle.west, oRectangle.east, this.Math.EPSILON9) || this.Math.equalsEpsilon(oRectangle.north, oRectangle.south, this.Math.EPSILON9))
//                {
//                    throw "multipoint rectangle is invalid. north === south or west === east Ignoring the rendering for graphic having a symbol code = " + args.symbolCode;
//                }

//                if (cesiumEngine.utils.is3dSymbol(args))
//                {
//                    //represent the labels of the multipoint 3D as a canvas that goes on top of the 3D shape (airspace)
//                    oRectangle.height = args.extrudedHeight + 25;
//                    oRectangle.extrudedHeight =   args.extrudedHeight + 30;
//                    oRectangle.vertexFormat  = this.EllipsoidSurfaceAppearance.VERTEX_FORMAT;
//                }

//var textureFromCanvas   = this.viewer.scene._context.createTexture2D({
//                                source : args.data.image,
//                                pixelFormat : Cesium.PixelFormat.RGBA
//                        });

//                textureFromCanvas = new Cesium.Texture({
//                    context: this.viewer.scene._context,
//                    source: args.data.svg,
//                    //source: args.data.image,
//                    //pixelFormat : imageryProvider.hasAlphaChannel ? PixelFormat.RGBA : PixelFormat.RGB
//                    pixelFormat: Cesium.PixelFormat.RGBA
//                });

                if (layer.isFeaturePresentById(args.id))
                {
                    entity = layer.getFeature(args.id);
                    if (isZeroBound)
                    {
                        args.data.wasClipped = true;
                        //entity.rectangle.material.image = this.highScaleImage.blankMultipointBase64;
                    }
                    else
                    {
                        entity.rectangle.material.image = args.data.svg; //.replace(/&#35;/g,'%23');
                    }
                    //if (!args.data.forceRedraw)
                    //{
                    //entity.oRectangle = oRectangle;
                    entity.rectangle.coordinates = oRectangle,
                            //entity.rectangle.material.image = (this.defined(textureFromCanvas)) ? textureFromCanvas : entity.rectangle.material.image;
                            entity.name = args.name;
                    entity.description = args.description;
                    entity.symbolCode = args.symbolCode;
                    entity.properties = args.properties;

                    if (!isNaN(args.extrudedHeight))
                            // if (cesiumEngine.utils.is3dSymbol(args))
                            {
                                //material.alpha = 0.5;

                                entity.rectangle.height = args.extrudedHeight + 1;


                            }
//                        if (this.defined(args.properties.azimuth))
//                        {
//                            entity.rectangle.rotation = args.properties.azimuth;// positive is clockwise
//                            entity.rectangle.sRotation = args.properties.azimuth;// positive is clockwise
//                        }
                    entity.show = args.visible;
                    // }
                    //       this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                    // }
                    //      this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                }
                else
                {
//                    if (args.data.svg && args.data.svg.indexOf("base64") < 0)// when the svg has no graphics  it does not send in base 64.
//                    {
//                        args.data.wasClipped = true;
//                        material.image = this.highScaleImage.blankMultipoint;
//                    }
                    //new entity rectangle
                    // image = new Image();
                    //image.src = args.data.svg;
                    material = new this.ImageMaterialProperty();
                    if (isZeroBound)
                    {
                        material.image = this.highScaleImage.blankMultipointBase64;  //.replace(/&#35;/g,'%23'); //.replace(/#/g,'%23').replace(/%/g,'%25');
                    }
                    else
                    {
                        material.image = args.data.svg; //.replace(/&#35;/g,'%23'); //.replace(/#/g,'%23').replace(/%/g,'%25');
                    }
                    //material.image = args.data.svg; //.replace(/&#35;/g,'%23'); //.replace(/#/g,'%23').replace(/%/g,'%25');
                    //material.image = textureFromCanvas;
                    material.transparent = true;

                    // primitive options
//                    options = {
//                        rectangle: oRectangle,
//                        ellipsoid: this.Ellipsoid.WGS84,
//                        asynchronous: false,
//                        show: true,
//                        id: args.id,
//                        material: material
//                    };
                    entity = new this.Entity({
                        id: args.id,
                        selectable: true,
                        show: args.visible
                    });
                    entity.oRectangle = oRectangle;
//                    var getLatestRectangleCallbackProperty = new Cesium.CallbackProperty(function getRectangle(time, result)
//                    {
//                        return Cesium.Rectangle.clone(entity.oRectangle, result);
//                    }, false);

                    if (!isNaN(args.extrudedHeight))
                            // if (cesiumEngine.utils.is3dSymbol(args))
                            {
                                //material.alpha = 0.5;
                                material.faceForward = true;
                                material.closed = true;
                                entity.rectangle = {
                                    //coordinates: getLatestRectangleCallbackProperty,
                                    coordinates: oRectangle,
                                    material: material,
                                    height: args.extrudedHeight + 1,
                                    //extrudedHeight: args.extrudedHeight + 2,
                                    vertexFormat: this.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                                    closeBottom: false,
                                    closeTop: false
                                };
                            }
                    else
                    {
                        entity.rectangle = {
                            //coordinates: getLatestRectangleCallbackProperty,
                            coordinates: oRectangle,
                            material: material,
                            vertexFormat: this.EllipsoidSurfaceAppearance.VERTEX_FORMAT
                        };
                    }

                    entity.overlayId = layer.id;
                    entity.id = args.id;
                    entity.featureId = args.featureId;
                    entity.name = args.name;
                    entity.description = args.properties.description;
                    entity.symbolCode = args.symbolCode;
                    entity.properties = args.properties;
                    entity.featureType = EmpCesiumConstants.featureType.ENTITY;
                    entity.show = args.visible;
//                                        if (this.debugExtent)
//                                            {
//                                                this.processEntities({layer: layer, entityArray: [entity], data: args});
//                                                args.id = "debugRect";
//                                                this.processEntities({layer: layer, entityArray: [args.debugRectangleEntity], data: args});
//                                            } else
                    // {
                    this.processEntities({layer: layer, entityArray: [entity], data: args});
                    //              this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                    // }
                }
            }
            else
            {
                result.success = false;
                result.message = "addDataUrlToOverlay - This feature is not specifying a parent layer: ";
                return result;
            }
        }
        catch (err)
        {
            console.log("invalid rectangle in addCanvasToOverlay. Error:  " + err);
            result = {
                success: false,
                message: err.message
            };
        }
        // Add which data was actually added to the map
        // So we can keep track of what we need to add
        // to the data explorer.
        result.data = args.data;
        return result;
    };





//    this.addCanvasToOverlay = function (args)
//    {
//        var result = {
//            success: true
//        },
//        layer,
//                oRectangle,
//                material,
//                multiPointRectangle,
//                primitive,
//                options;
//        try
//        {
//            if (args.parentCoreId)
//            {
//                layer = this.getLayer(args.parentCoreId);
//            }
//            else
//            {
//                result.success = false;
//                result.message = "addDataUrlToOverlay - This feature is not specifying a parent layer: ";
//                return result;
//            }
//            if (layer)
//            {
//                oRectangle = this.Rectangle.fromDegrees(args.data.geoTL.x, args.data.geoBR.y, args.data.geoBR.x, args.data.geoTL.y);
//                if (layer.isPrimitive(args.id))
//                {
//                    primitive = layer.getFeature(args.id);
//                    primitive._appearance.material.uniforms.image = args.data.image;
//                    primitive.geometryInstances.geometry._rectangle = oRectangle;
//                }
//                else
//                {
//                    // ----PRIMITIVE BEGIN----
//                    // primitive material
//                    material = this.Material.fromType('Image', {
//                        image: args.data.image
//                    });
//                    // primitive options
//                    options = {
//                        rectangle: oRectangle,
//                        ellipsoid: this.Ellipsoid.WGS84
//                       // asynchronous: false,
//                        //show: true,
//                       // id: args.id,
//                        //material: material
//                       // vertexFormat:this.EllipsoidSurfaceAppearance.VERTEX_FORMAT
//                        //vertexFormat: this.MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat
//                    };
//                    // primitive instantiation
//                    multiPointRectangle = new this.RectangleGeometry(options);
//                    multiPointRectangle.featureType = EmpCesiumConstants.featureType.PRIMITIVE;
//                    multiPointRectangle.overlayId = layer.id;
//                    multiPointRectangle.id = args.id;
//                    multiPointRectangle.featureId = args.featureId;
//                    multiPointRectangle.name = args.name;
//                    multiPointRectangle.description = args.properties.description;
//                    multiPointRectangle.symbolCode = args.symbolCode;
//                    multiPointRectangle.properties = args.properties;
//
//                    primitive = new this.Primitive({
//                            geometryInstances: new this.GeometryInstance({
//                             geometry: multiPointRectangle
//                         }),
//                         appearance: new this.MaterialAppearance({
//                             material: material,
//                             materialSipport: this.MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat
//                         }),
//                         allowPicking: true,
//                         //interleave: true,
//                         releaseGeometryInstances: false
//                    });
//
//                    primitive.featureType = EmpCesiumConstants.featureType.PRIMITIVE;
//                    primitive.overlayId = layer.id;
//                    primitive.id = args.id;
//                    primitive.featureId = args.featureId;
//                    primitive.name = args.name;
//                    primitive.description = args.properties.description;
//                    primitive.symbolCode = args.symbolCode;
//                    primitive.properties = args.properties;
//                    // primitive add
//                    this.processPrimitives({layer: layer, primitiveArray: [primitive]});
//                    // ----PRIMITIVE END----
//
////                    // ----ENTITY BEGIN----
////                    // entity material
////                    multiPointMaterial = new this.ImageMaterialProperty();
////                    multiPointMaterial.image = args.data.image;
////                    // this.RectangleGraphics options
////                    options = {
////                        coordinates: oRectangle,
////                        show: true,
////                        material: multiPointMaterial
////                    };
////                    // this.RectangleGraphics instantiation
////                    multiPointRectangle = new this.RectangleGraphics(options);
////                    // entity options
////                    options = {
////                        id: args.id,
////                        show: true,
////                        rectangle: multiPointRectangle
////                    };
////                    // entity instantiation
////                    entity = new this.Entity(options);
////                    entity.featureType = EmpCesiumConstants.featureType.ENTITY;
////                    entity.overlayId = layer.id;
////                    entity.symbolCode = args.feature.symbolCode;
////                    // entity add
////                    processEntities({layer: layer, entityArray: [entity], data: args});
////                    // ----ENTITY END----
//                }
//            }
//            else
//            {
//                result.success = false;
//                result.message = "addDataUrlToOverlay - This feature is not specifying a parent layer: ";
//                return result;
//            }
//        }
//        catch (err)
//        {
//            result = {
//                success: false,
//                message: err.message
//            };
//        }
//        // Add which data was actually added to the map
//        // So we can keep track of what we need to add
//        // to the data explorer.
//        result.data = args.data;
//        return result;
//    };


    /**
     * @desc Adds a feature of feature type to the map
     *
     * @param {Feature} args - a {@link Feature} where the type is "feature"
     * @param {Object} idObject - The id object containg the featureId and parentId.
     * @param {String} idObject.featureId - The modified feature id to be used on the map.
     * @param {String} idObject.parentId - The modifed parent id to be used on the map.
     * Could be a parent feature or overlay.
     * @param {String}  idObject.parentType - Will be "feature" or "overlay."
     * @returns {object} result - The resulting object.
     * @returns {boolean} result.success - Whether the function succeeded or not.
     * @returns {string} result.message - The description of why the function failed.
     * @returns {object} result.jsError - A caught javascript exception.
     */
    this.addFeature = function (item)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        layer;

        if (this.isV2Core)
        {
            // If we are running of a V2 core we need to see if the feature is
            // multi-parent required. And if it is, the parent overlay is in parentCoreId.
            if (args.hasOwnProperty('properties') &&
                    args.properties.hasOwnProperty('multiParentRequired') &&
                    (args.properties.multiParentRequired === true))
            {
                layer = this.getLayer(item.parentCoreId);
            }
            else if (args.parentType === "feature")
            {
                layer = this.getLayer(item.overlayId);
            }
            else
            {
                layer = this.getLayer(item.parentCoreId);
            }
        }
        else if (item.parentCoreId)
        {
            //if (item.parentType === 'overlay')
            //{
            layer = this.getLayer(item.parentCoreId);
            if (!layer)
            {
                // overlay do not exist in current session of map. Add a new overlay. Next call is synchronized.
                item.createParent();
            }
            //}
        }
        else
        {
            result.success = false;
            result.message = "This feature is not specifying a parent layer: ";
            return result;
        }

        if (item.format === emp.typeLibrary.featureFormatType.KML)
        {
            if (!this.dynamicOverlayHash[item.parentId])
            { // If not already added as CZML
                result = this.addKmlToOverlay({
                    overlayId: item.overlayId,
                    parentCoreId: item.parentCoreId,
                    featureId: item.featureId,
                    parentType: item.parentType,
                    id: item.coreId,
                    data: item.data,
                    properties: item.properties,
                    feature: item,
                    zoom: item.zoom,
                    name: item.name,
                    description: item.description,
                    visible: item.visible
                });
            }
        }
        else if (item.format === emp.typeLibrary.featureFormatType.GEOJSON ||
                item.format === emp3.api.enums.FeatureTypeEnum.GEO_POINT ||
                item.format === emp3.api.enums.FeatureTypeEnum.GEO_POLYGON ||
                item.format === emp3.api.enums.FeatureTypeEnum.GEO_PATH)
        {
            if (emp.typeLibrary.utils.milstd.AOI.isAOI(item))
            {
                var item = emp.helpers.copyObject(item);
                item.data.symbolCode = emp.typeLibrary.utils.milstd.AOI.getAOISymbolCode(item.data.properties.aoi.type);
                item.symbolCode = emp.typeLibrary.utils.milstd.AOI.getAOISymbolCode(item.data.properties.aoi.type);
                item.properties.modifiers = emp.typeLibrary.utils.milstd.AOI.getModifiers(item);
                this.addSymbolMulti([item]);
            }
            else
            {
                result = this.addGeojsonToOverlay({
                    overlayId: item.overlayId,
                    parentType: item.parentType,
                    parentCoreId: item.parentCoreId,
                    featureId: item.featureId,
                    id: item.coreId,
                    data: item.data,
                    properties: item.properties,
                    feature: item,
                    zoom: item.zoom,
                    name: item.name,
                    description: item.description,
                    visible: item.visible
                });
            }
        }
        else if (item.format === emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE ||
                item.format === emp3.api.enums.FeatureTypeEnum.GEO_SQUARE)
        {
            //new primitives. call renderer
            var empPrimitiveItem = cesiumEngine.utils.convertEmpPrimitiveItemToMilStandardItem(item, item.format);

            empPrimitiveItem.multiPointRenderType = EmpCesiumConstants.MultiPointRenderType.SVG;
            this.addSymbolMulti([empPrimitiveItem]);
        }
        else if (item.format === emp3.api.enums.FeatureTypeEnum.GEO_TEXT)
        {
            // text or labels
            var empPrimitiveItem = emp.helpers.copyObject(item);
            var label = new this.LabelGraphics();
            label.style = this.LabelStyle.FILL_AND_OUTLINE;
            label.outlineWidth = 3;
            label.text = empPrimitiveItem.name;

            if (empPrimitiveItem.properties && empPrimitiveItem.properties.labelStyle)
            {
                if (empPrimitiveItem.properties.labelStyle.color)
                {
                    //var rgbaFillColor = cesiumEngine.utils.hexToRGB(empPrimitiveItem.properties.fillColor);
//                label.fillColor =   this.Color.fromBytes(rgbaFillColor.r, rgbaFillColor.g, rgbaFillColor.b, rgbaFillColor.a);
                    label.fillColor = this.Color.fromBytes(empPrimitiveItem.properties.labelStyle.color.red, empPrimitiveItem.properties.labelStyle.color.green, empPrimitiveItem.properties.labelStyle.color.blue, empPrimitiveItem.properties.labelStyle.color.alpha * 255);
                }
                if (empPrimitiveItem.properties.labelStyle.outlineColor)
                {
                    //var rgbaOutlineColor = cesiumEngine.utils.hexToRGB(empPrimitiveItem.properties.lineColor);
                    label.outlineColor = this.Color.fromBytes(empPrimitiveItem.properties.labelStyle.outlineColor.red, empPrimitiveItem.properties.labelStyle.outlineColor.green, empPrimitiveItem.properties.labelStyle.outlineColor.blue, empPrimitiveItem.properties.labelStyle.outlineColor.alpha * 255);
                }

                if (empPrimitiveItem.properties.labelStyle.scale)
                {
                    label.scale = empPrimitiveItem.properties.labelStyle.scale;
                }

//                if (empPrimitiveItem.properties && empPrimitiveItem.properties.labelStyle.family && empPrimitiveItem.properties && empPrimitiveItem.properties.labelStyle.size)
//                {
//                    label.font = empPrimitiveItem.properties.labelStyle.size + "px " + empPrimitiveItem.properties.labelStyle.family;
//                }

                if (empPrimitiveItem.properties.labelStyle.family && empPrimitiveItem.properties.labelStyle.size)
                {
                    label.font = empPrimitiveItem.properties.labelStyle.size + "px " + empPrimitiveItem.properties.labelStyle.family;
                }
                else if (empPrimitiveItem.properties.labelStyle.family && !empPrimitiveItem.properties.labelStyle.size)
                {
                    label.font = "24px " + empPrimitiveItem.properties.labelStyle.family;
                }
                else if (!empPrimitiveItem.properties.labelStyle.family && empPrimitiveItem.properties.labelStyle.size)
                {
                    label.font = empPrimitiveItem.properties.labelStyle.size + "px sans-serif";
                }
                else
                {
                    label.font = "24px sans-serif";
                }

                if (empPrimitiveItem.properties.labelStyle.justification)
                {
                    switch (empPrimitiveItem.properties.labelStyle.justification)
                    {
                        case "left":
                            label.horizontalOrigin = this.HorizontalOrigin.RIGHT;// meaning between emp and Cesium is different. right side of label next to the position that looks like left justified.
                            break;
                        case "center":
                            label.horizontalOrigin = this.HorizontalOrigin.CENTER;
                            break;
                        case "right":
                            label.horizontalOrigin = this.HorizontalOrigin.LEFT;// left  side of label next to the position that looks like right  justified.
                            break;
                    }
                }
            }
            //azimuth not suported for labels in Cesium. Workaround would be to set the text in a canvas and assign it to the billboard.
//              if (empPrimitiveItem.properties && empPrimitiveItem.properties.azimuth)
//            {
//                var rgbaOutlineColor = cesiumEngine.utils.hexToRGB(empPrimitiveItem.properties.lineColor);
//                label.outlineColor = new this.Color(rgbaOutlineColor.r, rgbaOutlineColor.g, rgbaOutlineColor.b, rgbaOutlineColor.a);
//            }
            var cartesian = this.Cartesian3.fromDegrees(empPrimitiveItem.coordinates[0], empPrimitiveItem.coordinates[1]);
            var entity = new this.Entity();
            entity.featureType = EmpCesiumConstants.featureType.ENTITY;
            entity.overlayId = layer.id;
            entity._id = empPrimitiveItem.coreId || empPrimitiveItem.id;
            entity.featureId = empPrimitiveItem.featureId;
            entity.label = label;
            entity.position = cartesian;
            entity.show = (this.defined(empPrimitiveItem.visible)) ? empPrimitiveItem.visible : true;
            empPrimitiveItem.feature = {};
            empPrimitiveItem.feature.format = empPrimitiveItem.format;
            empPrimitiveItem.feature.coreParent = empPrimitiveItem.coreParent;
            empPrimitiveItem.id = empPrimitiveItem.coreId;
            this.processEntities({layer: layer, entityArray: [entity], data: empPrimitiveItem});
        }
        else if (item.format === emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE ||
                item.format === emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE)
        {
            // text or labels
            var empPrimitiveItem = emp.helpers.copyObject(item);
            var ellipse = new this.EllipseGraphics();
            ellipse.outline = true;
            //ellipse.style = this.LabelStyle.FILL_AND_OUTLINE;
            if (empPrimitiveItem.properties && empPrimitiveItem.properties.lineWidth)
            {
                empPrimitiveItem.properties.lineWidth = parseFloat(empPrimitiveItem.properties.lineWidth);
                ellipse.outlineWidth = empPrimitiveItem.properties.lineWidth;
            }
            else
            {
                ellipse.outlineWidth = 3;
            }
            if (item.format === emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE)
            {
                ellipse.semiMajorAxis = empPrimitiveItem.properties.semiMajor;
                ellipse.semiMinorAxis = empPrimitiveItem.properties.semiMinor;
            }
            else
            {
                ellipse.semiMajorAxis = empPrimitiveItem.properties.radius;
                ellipse.semiMinorAxis = empPrimitiveItem.properties.radius;
            }
            if (empPrimitiveItem.properties.fillColor)
            {
                ellipse.fill = true;
            }
            else
            {
                ellipse.fill = false;
            }

            var cartesian = this.Cartesian3.fromDegrees(empPrimitiveItem.coordinates[0], empPrimitiveItem.coordinates[1]);
            var entity = new this.Entity();
            entity.featureType = EmpCesiumConstants.featureType.ENTITY;
            entity.overlayId = layer.id;
            entity._id = empPrimitiveItem.coreId || empPrimitiveItem.id;
            entity.featureId = empPrimitiveItem.featureId;
            entity.ellipse = ellipse;
            entity.position = cartesian;
            entity.show = (this.defined(empPrimitiveItem.visible)) ? empPrimitiveItem.visible : true;
            empPrimitiveItem.feature = {};
            empPrimitiveItem.feature.format = empPrimitiveItem.format;
            empPrimitiveItem.feature.coreParent = empPrimitiveItem.coreParent;
            empPrimitiveItem.id = empPrimitiveItem.coreId;
            this.processEntities({layer: layer, entityArray: [entity], data: empPrimitiveItem});
        }
        else if (item.format === "czml")
        {
            this.dynamicOverlayHash[item.parentCoreId] = hashFromCzmlIds(item.data);
        }
        else
        {
            result.success = false;
            result.message = "This feature format is not supported: " + item.format;
        }
        return result;
    };
    this.hashFromCzmlIds = function (czml)
    {
        var ret = {};
        if (czml.id)
        { // If czml was a single packet, instead of an array
            ret[czml.id] = "";
        }
        else
        {
            for (var i in czml)
            {
                var packet = czml[i];
                if (packet.id)
                {
                    ret[packet.id] = "";
                }
            }
        }

        return ret;
    };
    /**
     * @desc Adds a feature of milstd type to the map
     *
     * @param {Feature} args - a {@link Feature}
     * @param {Object} idObject - The id object containg the featureId and parentId.
     * @param {String} idObject.featureId - The modified feature id to be used on the map.
     * @param {String} idObject.parentId - The modifed parent id to be used on the map.
     * Could be a parent feature or overlay.
     * @returns {object} result - The resulting object.
     * @returns {boolean} result.success - Whether the function succeeded or not.
     * @returns {string} result.message - The description of why the function failed.
     * @returns {object} result.jsError - A caught javascript exception.
     */
    this.addMilStd = function (args)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        isMultiPoint,
                isSinglePointPresent = false,
                oProperties,
                standard = cesiumEngine.utils.RendererSettings.Symbology_2525C;// defaulting to c spec numeric format
        //
        if (!cesiumEngine.utils.isValidMilStdMultiPointCoords(args.data.geometry || args.data))
        {
            result = {
                success: false,
                message: "coordinates not valid",
                jsError: ""
            };
            return result;
        }
        //
        //check if symbol is single or multi point

        if (args.properties && args.properties.modifiers)
        {
            if (!cesiumEngine.utils.isSymbolStandardSpecified(args.properties.modifiers))
            {
                //fix absence of string standard in modifiers
                args.properties.modifiers.standard = (this.isV2Core) ? emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B : emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C;
            }
            //convert standard  to renderer format
            standard = cesiumEngine.utils.checkSymbolStandard(args.properties.modifiers);

            //convert standard  to renderer format
            //standard = cesiumEngine.utils.convertSymbolStandardToRendererFormat({"standard": standard});
        }
        //var basicSymbolId = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(args.symbolCode);
        //var sd = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(basicSymbolId, standard);
        // isMultiPoint = (sd.minPoints === 0 && sd.maxPoints ===1);
        isMultiPoint = armyc2.c2sd.renderer.utilities.SymbolDefTable.isMultiPoint(args.symbolCode, standard);

        if (isMultiPoint)
        {
            isMultiPointPresent = this.isMultiPointPresent(args.coreId || args.id);
            if (isMultiPointPresent || !this.enableRenderingOptimization)
            {
                result = this.addSymbolMulti([args]); //was addmil2525symbolbatch in old baseline
            }
            else
            {
                //throttle only the new adds.
                // I need to add the multipoint to the hash before rendering on the map  so  I can detect when the multipoint has been deleted
                // inside the throttling for new multipoint adds.
                oProperties = emp.helpers.copyObject(args.properties || {});
                if (!cesiumEngine.utils.isSymbolStandardSpecified(args.properties.modifiers))
                {
                    args.properties.modifiers.standard = (this.isV2Core) ? emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B : emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C;
                }
                //convert standard  to renderer format
                standard = cesiumEngine.utils.checkSymbolStandard(args.properties.modifiers);


                this.storeMultiPoint({
                    symbolCode: args.symbolCode,
                    standard: standard,
                    name: args.name,
                    id: args.coreId || args.id,
                    parentCoreId: args.parentCoreId,
                    overlayId: args.overlayId,
                    description: args.description || args.properties.description,
                    coordinates: args.coordinates,
                    properties: oProperties,
                    altitudeMode: args.properties.altitudeMode,
                    visible: args.visible,
                    type: args.data.type,
                    data: args.data,
                    renderingCameraAltitude: this.cameraAltitude,
                    renderingCameraScale: this.getScale(),
                    multiPointRenderType: args.multiPointRenderType,
                    extrudedHeight: args.extrudedHeight
                });
                // I needed to add the multipoint to the hash so  I can detect
                this.throttleAddMultiPointEntity(args); //was addmil2525symbolbatch in old baseline
            }
        }
        else
        {
            isSinglePointPresent = this.isSinglePointPresent(args.coreId || args.id);
            if (isSinglePointPresent || !this.enableRenderingOptimization)
            {
                result = this.addSymbolSinglePrimitive(args);
            }
            else
            {
                //throttle only the new adds.
                if (this.getSinglePointsIdOnHoldCount() > 500)
                {
                    args.id = args.coreId || args.id;
                    args.isOnOutsideViewableAreaHold = false;
                    args.isClusterIcon = false;
                    args.lastUpdateTime = new Date().getTime();
                    args.isNewAddThrotled = true;
                    this.storeSinglePoint(args);
                    //this.storeSinglePointIdOnHold(args.coreId || args.id);
                    this.throttleAddSymbolSinglePrimitive(args);
                }
                else
                {
                    result = this.addSymbolSinglePrimitive(args);
                }
            }

            //result = this.addSymbolSingle(args);
        }

        return result;
    };
    /**
     * @desc Adds a mil std 2525 single point symbol
     *
     * @param {Feature} args - a {@link Feature}
     * @param {Object} idObject - The id object containg the featureId and parentId.
     * @param {String} idObject.featureId - The modified feature id to be used on the map.
     * @param {String} idObject.parentId - The modifed parent id to be used on the map.
     * Could be a parent feature or overlay.
     * @returns {object} result - The resulting object.
     * @returns {boolean} result.success - Whether the function succeeded or not.
     * @returns {string} result.message - The description of why the function failed.
     * @returns {object} result.jsError - A caught javascript exception.
     */
//    this.addSymbolSingle = function (args)
//    {
//        var latitude,
//                longitude,
//                altitude,
//                item = {},
//                kmls,
//                layer,
//                billboards,
//                pedestalPolyline,
//                result = {
//                    success: true,
//                    message: "",
//                    jsError: ""
//                };
//        //add single point to singlePointCollection
//        //TODO: delete this in remove function
//        this.storeSinglePoint({
//            symbolCode: args.symbolCode,
//            name: args.name,
//            id: args.coreId,
//            overlayId: args.parentCoreId,
//            description: args.description || args.properties.description,
//            properties: args.properties,
//            visible: args.visible
//        });
//        latitude = parseFloat(args.coordinates[1]);
//        longitude = parseFloat(args.coordinates[0]);
//        if (args.coordinates.length > 2)
//        {
//            altitude = parseFloat(args.coordinates[2]);
//        }
//        item.id = args.coreId;
//        item.lat = latitude;
//        item.lon = longitude;
//        item.altitude = altitude;
//        item.overlayId = args.parentCoreId;
//        item.name = args.name;
//        item.symbolCode = args.symbolCode;
//        item.description = args.description || args.properties.description;
//        item.properties = args.properties;
//        if (this.multiPointRenderType === EmpCesiumConstants.MultiPointRenderType.CANVAS)
//        {
//            if (item.overlayId)
//            {
//                layer = this.getLayer(item.overlayId);
//            }
//            if (layer)
//            {
//                if (this.isFeatureSelected(item.id))
//                {
//                    item.properties.lineColor = 'FF' + EmpCesiumConstants.selectionProperties.COLOR_HEX;
//                }
//                if (layer.isFeaturePresentById(item.id))
//                {
//                    var presentEntity = layer.getFeature(item.id);
//                    billboards = this.getSinglePointBillboard([item], presentEntity.billboard);
//                    presentEntity.featureId = args.featureId;
//                    presentEntity.name = args.name;
//                    presentEntity.description = new this.ConstantProperty(args.description || args.properties.description);
//                    presentEntity.properties = args.properties;
//                    presentEntity.symbolCode = args.symbolCode;
//                    presentEntity.billboard.image = billboards[0].image;
//                    presentEntity.position = this.Cartesian3.fromDegrees(item.lon, item.lat, item.altitude);
//                    //pedestal
//                    var groundPosition = this.Cartesian3.fromDegrees(item.lon, item.lat);
//                    var position = this.Cartesian3.fromDegrees(item.lon, item.lat, item.altitude);
//                    var positions = new this.PositionPropertyArray([new this.ConstantPositionProperty(groundPosition), new this.ConstantPositionProperty(position)]);
//                    presentEntity.polyline.positions = positions;
//                    billboards[0] = undefined;
//                }
//                else
//                {
//                    billboards = this.getSinglePointBillboard([item]);
//                    var entity = new this.Entity();
//                    entity._id = item.id;
//                    entity.featureType = EmpCesiumConstants.featureType.ENTITY;
//                    entity.featureId = args.featureId;
//                    entity.name = args.name;
//                    entity.description = args.description || args.properties.description;
//                    entity.overlayId = item.overlayId;
//                    entity.properties = args.properties;
//                    entity.symbolCode = args.symbolCode;
//                    entity.coordinates = [longitude, latitude];
//                    entity.altitude = altitude;
//                    // track billboard in texture atlas by assigning emp metadata
//                    billboards[0].id = entity._id;
//                    billboards[0].name = entity.name;
//                    billboards[0].isDynamic = true;
//                    entity.billboard = billboards[0];
//                    entity.position = this.Cartesian3.fromDegrees(item.lon, item.lat, item.altitude);
//                    entity.show = true;
//                    entity.overlayId = layer.id;
//                    //add pedestal
//                    var groundPosition = this.Cartesian3.fromDegrees(item.lon, item.lat);
//                    var position = this.Cartesian3.fromDegrees(item.lon, item.lat, item.altitude);
//                    var options = {positions: [groundPosition, position], followSurface: false, material: this.Color.ROYALBLUE};
//                    pedestalPolyline = new this.PolylineGraphics(options);
//                    pedestalPolyline.isPedestal = true;
//                    entity.polyline = pedestalPolyline;
//                    layer.addFeature(entity);
//                }
//                return result;
//            }
//            else
//            {
//                result.success = false;
//                result.message = "This feature is not specifying a parent layer: ";
//                return result;
//            }
//        }
//        else
//        {
//            kmls = getSinglePointKml([item], this.showLabels, empLabelSize, iconPixelSize);
//            //should be single kml
//            return addKmlToOverlay({
//                overlayId: args.parentCoreId,
//                id: args.coreId,
//                data: (kmls instanceof Array) ? kmls[0] : kmls,
//                properties: args.properties,
//                symbolCode: args.symbolCode,
//                coordinates: [longitude, latitude],
//                altitude: altitude,
//                name: args.name,
//                description: args.description || args.properties.description,
//                feature: args
//            });
//        }
//    };


    /**
     * @desc Adds a mil std 2525 single point symbol
     *
     * @param {Feature} args - a {@link Feature}
     * @param {Object} idObject - The id object containg the featureId and parentId.
     * @param {String} idObject.featureId - The modified feature id to be used on the map.
     * @param {String} idObject.parentId - The modifed parent id to be used on the map.
     * Could be a parent feature or overlay.
     * @returns {object} result - The resulting object.
     * @returns {boolean} result.success - Whether the function succeeded or not.
     * @returns {string} result.message - The description of why the function failed.
     * @returns {object} result.jsError - A caught javascript exception.
     */
    this.addSymbolSinglePrimitive = function (args)
    {
        var latitude,
                longitude,
                altitude = 0,
                item = {},
                kmls,
                layer,
                billboards,
                billboardCollection,
                newBillboardCollection,
                pedestalPolyline,
                billboard,
                basicSymbolID,
                selectionProperties,
                within,
                isSinglePointPresent = false,
                isSkyVisible = false,
                highScaleImage,
                callRenderer = false,
                azimuth = 0,
                callClusterIcon = false;
        result = {
            success: true,
            message: "",
            jsError: ""
        };

        //add single point to singlePointCollection
        //TODO: delete this in remove function
//                this.storeSinglePoint({
//                    symbolCode: args.symbolCode,
//                    name: args.name,
//                    id: args.coreId,
//                    overlayId: args.overlayId,
//                    parentId: args.parentId,
//                    parentCoreId: args.parentCoreId,
//                    description: args.description || args.properties.description,
//                    properties: args.properties,
//                    visible: args.visible
//                });
        //singlePointAltitudeRangeMode = cesiumEngine.utils.getSinglePointAltitudeRangeMode(this.cameraAltitude, this.singlePointAltitudeRanges);
        latitude = parseFloat(args.coordinates[1]);
        longitude = parseFloat(args.coordinates[0]);
        if (args.coordinates.length > 2)
        {
            altitude = parseFloat(args.coordinates[2]);
        }
        else
        {
            // add a zero altitude. The api tester is not sending an array with altitude if not specified. This needs to get fix in the tester.
            args.coordinates[2] = altitude;
        }

        isSinglePointPresent = this.isSinglePointPresent(args.coreId || args.id);
        if (isSinglePointPresent)
        {
            item = this.getSinglePoint(args.coreId || args.id);
        }
        else
        {
            item.isOnOutsideViewableAreaHold = false;
            item.isClusterIcon = false;
            item.isNewAddThrotled = false;
            item.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
            item.singlePointAltitudeRangeChanged = false;
        }
        item.id = args.coreId || args.id;
        item.symbolCode = args.symbolCode;
        item.overlayId = args.overlayId;
        item.parentId = args.parentId;
        item.parentCoreId = args.parentCoreId;
        item.name = args.name;
        item.description = args.description || args.properties.description;
        item.properties = args.properties;
        item.visible = args.visible;
        item.coordinates = args.coordinates;

        //item.isSinglePointRendered =  isSinglePointPresent;

        within = this.Rectangle.contains(this.getExtent(), this.Cartographic.fromDegrees(longitude, latitude, altitude));
        isSkyVisible = this.isSkyWithinMapVisibleArea();
        var afiliationLetter = item.symbolCode.substring(1, 2);
        var highScaleImage;

        switch (afiliationLetter.toLowerCase())
        {
            case "h":
                highScaleImage = this.highScaleImage.highScaleImageRed;
                break;
            case "f":
                highScaleImage = this.highScaleImage.highScaleImageBlue;
                break;
            case "n":
                highScaleImage = this.highScaleImage.highScaleImageGreen;
                break;
            case "u":
                highScaleImage = this.highScaleImage.highScaleImageYellow;
                break;
            default:
                highScaleImage = this.highScaleImage.highScaleImageYellow;
                break;


        }

        if (!within && isSinglePointPresent && !item.isNewAddThrotled && !item.singlePointAltitudeRangeChanged && this.enableRenderingOptimization)// isSkyVisible or > 8.0e6
                //if ((!within || isSkyVisible) && isSinglePointPresent && !item.isNewAddThrotled && !item.singlePointAltitudeRangeChanged && this.enableRenderingOptimization)// isSkyVisible or > 8.0e6
                        //if ((!within || this.isSkyWithinMapVisibleArea())  )// isSkyVisible or > 8.0e6
                        {
                            // the single point must be already rendered on map to allow holding of updates.
                            item.isOnOutsideViewableAreaHold = true;
                            this.storeSinglePoint(item);
                            this.storeSinglePointIdOnHold(item.id);
                            return  result;
                        }
                else if (isSinglePointPresent && !item.isOnUpdateDelayHold && !item.isNewAddThrotled && !item.singlePointAltitudeRangeChanged && this.enableRenderingOptimization)// this.defined(item.lastUpdateTime) &&  Math.abs(new Date().getTime() - item.lastUpdateTime) < 20000)
                {
                    // throttle the new updates to existing points.
                    item.isOnOutsideViewableAreaHold = false;
                    item.isOnUpdateDelayHold = true;
                    item.lastUpdateTime = new Date().getTime();
                    this.storeSinglePoint(item);
                    this.storeSinglePointIdOnHold(item.id);
                    ///this.cesiumRenderOptimizer.boundNotifyRepaintRequired();
                    return  result;
                }
                else if (this.isSinglePointIdOnHoldPresent(item.id) && this.enableRenderingOptimization)
                {
                    // If this is a new update and there was already an update on delay hold for the same point then  this update will not get on delay hold.
                    // The throttle will detect that the point is not on the SinglePointIdOnHold hash and skip it.
                    this.removeSinglePointIdOnHold(item.id);
                }

                item.isOnOutsideViewableAreaHold = false;
                item.isOnUpdateDelayHold = false;
                item.isNewAddThrotled = false;
                item.lastUpdateTime = new Date().getTime();
                this.storeSinglePoint(item);

                if (this.multiPointRenderType === EmpCesiumConstants.MultiPointRenderType.SVG)
                {
                    if (item.overlayId)
                    {
                        // If we are running of a V2 core we need to see if the feature is
                        // multi-parent required. And if it is, the parent overlay is in parentCoreId.
                        if (this.isV2Core)
                        {
                            if (args.hasOwnProperty('properties') &&
                                    args.properties.hasOwnProperty('multiParentRequired') &&
                                    (args.properties.multiParentRequired === true))
                            {
                                layer = this.getLayer(item.parentCoreId);
                            }
                            else if (args.parentType === "feature")
                            {
                                layer = this.getLayer(item.overlayId);
                            }
                            else
                            {
                                layer = this.getLayer(item.parentCoreId);
                            }
                        }
                        else
                        {
                            layer = this.getLayer(item.parentCoreId);
                        }
                    }
                    if (layer)
                    {
                        if (layer.isFeaturePresentById(item.id))
                        {
                            //If the feature is already selected the highlight color should be maintained.
                            if (this.isFeatureSelected(item.id))
                            {
                                //This is a copied piece of the selection code which is needed in order to
                                //maintain the selection highlight style. It may be possible to refactor in order
                                //to use selectFeature() in the future
                                callRenderer = true;
                                selectionProperties = {};
                                selectionProperties[item.id] = {
                                    id: item.id,
                                    symbolCode: item.symbolCode,
                                    name: item.name,
                                    properties: emp.helpers.copyObject(item.properties)
                                };
                                this.storeFeatureSelection(selectionProperties[item.id].id, selectionProperties);
                                var itemSelected = emp.helpers.copyObject(item);
                                basicSymbolID = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(selectionProperties[item.id].symbolCode);
                                switch (basicSymbolID)
                                {
                                    case "S*U*WDMG--*****":
                                    case "S*U*WDMM--*****":
                                    case "S*U*WDM---*****":
                                    case "S*U*ND----*****":
                                    case "S*U*X-----*****":
                                        itemSelected.properties.fillColor = this.selectionColorHex;
                                        //selectionProperties[item.id].properties.fillColor = 'FF' + EmpCesiumConstants.selectionProperties.COLOR_HEX;
                                        break;
                                    default:
                                        itemSelected.properties.lineColor = this.selectionColorHex;
                                        //selectionProperties[item.id].properties.lineColor = 'FF' + EmpCesiumConstants.selectionProperties.COLOR_HEX;
                                        break;
                                }
                            }

                            billboardCollection = layer.getFeature(item.id);
                            //check if only the coordinates changed. If only the coordinates there is no need to call the renderer.
                            if ((billboardCollection._billboards[0].name !== args.name) && (this.iconLabelOption !== 'none'))
                            {
                                callRenderer = true;
                            }
                            else if (billboardCollection._billboards[0].properties.fillColor !== item.properties.fillColor)
                            {
                                callRenderer = true;
                            }
                            else if (billboardCollection._billboards[0].properties.lineColor !== item.properties.lineColor)
                            {
                                callRenderer = true;
                            }
                            else if (billboardCollection.symbolCode !== item.symbolCode)
                            {
                                callRenderer = true;
                            }
                            else if (this.defined(args.iconSizeChanged) && args.iconSizeChanged && this.enableRenderingOptimization)
                            {
                                callRenderer = true;
                            }
                            else if (!cesiumEngine.utils.jsonEqual(billboardCollection._billboards[0].properties.modifiers, item.properties.modifiers) && (this.iconLabelOption !== 'none'))
                            {
                                // modifiers changed
                                callRenderer = true;
                            }

                            if (item.singlePointAltitudeRangeChanged && (this.singlePointAltitudeRangeMode === EmpCesiumConstants.SinglePointAltitudeRangeMode.LOW_RANGE) && this.enableRenderingOptimization && (this.iconLabelOption !== 'none'))
                            {
                                callRenderer = true;
                                item.isClusterIcon = false;
                                item.showLabels = true;
                                item.singlePointAltitudeRangeChanged = false;
                                // item.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
                            }
//                    else if (this.defined(item.isClusterIcon) && !item.isClusterIcon && this.singlePointAltitudeRangeMode === EmpCesiumConstants.SinglePointAltitudeRangeMode.LOW_RANGE)
//                    {
//                        callRenderer = item.singlePointAltitudeRangeChanged;
//                        item.singlePointAltitudeRangeChanged =  false;
//                        item.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
//                        item.isClusterIcon = false;
//                        item.showLabels = true;
//                    }
                            else if (item.singlePointAltitudeRangeChanged && this.singlePointAltitudeRangeMode === EmpCesiumConstants.SinglePointAltitudeRangeMode.MID_RANGE && this.enableRenderingOptimization)
                            {
                                if (!this.enableClusterIcon && (item.singlePointAltitudeRangeMode === EmpCesiumConstants.SinglePointAltitudeRangeMode.LOW_RANGE) && (this.iconLabelOption !== 'none'))
                                {
                                    callRenderer = true;
                                }
                                else if (this.enableClusterIcon)
                                {
                                    callRenderer = true;
                                }
                                //callRenderer = true;
                                item.isClusterIcon = false;
                                item.singlePointAltitudeRangeChanged = false;
                                item.showLabels = false;
                                // item.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;

                            }
//                    else if (this.defined(item.isClusterIcon) && !item.isClusterIcon && this.singlePointAltitudeRangeMode === EmpCesiumConstants.SinglePointAltitudeRangeMode.MID_RANGE)
//                    {
//                        callRenderer = item.singlePointAltitudeRangeChanged;
//                        item.singlePointAltitudeRangeChanged =  false;
//                         item.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
//                        item.isClusterIcon = false;
//                        item.showLabels = false;
//                    }
                            else if (item.singlePointAltitudeRangeChanged && this.singlePointAltitudeRangeMode === EmpCesiumConstants.SinglePointAltitudeRangeMode.HIGHEST_RANGE && this.enableRenderingOptimization)
                            {
                                if (!this.enableClusterIcon && (item.singlePointAltitudeRangeMode === EmpCesiumConstants.SinglePointAltitudeRangeMode.LOW_RANGE) && (this.iconLabelOption !== 'none'))
                                {
                                    callRenderer = true;
                                }
                                else if (this.enableClusterIcon)
                                {
                                    callRenderer = false;
                                }
//                                if (this.enableClusterIcon)
//                                {
//                                    callRenderer = false;
//                                }
                                item.isClusterIcon = this.enableClusterIcon;
                                callClusterIcon = this.enableClusterIcon;
                                item.singlePointAltitudeRangeChanged = false;
                                item.showLabels = false;
                                // item.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
                            }
                            if (billboardCollection.updateCount > 20)
                            {
                                callRenderer = true;
                            }
                            item.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
                            item.singlePointAltitudeRangeChanged = false;



                            if (callRenderer)
                            {
                                billboard = selectionProperties !== undefined ? this.getSinglePointBillboardPrimitive([itemSelected])[0] : this.getSinglePointBillboardPrimitive([item])[0];
                                billboardCollection.updateCount += 1;

                            }
                            else if (callClusterIcon)
                            {
                                var image = (this.isFeatureSelected(item.id)) ? this.highScaleImage.highScaleImageYellow : highScaleImage;
                                image = 'data:image/svg+xml,' + image;
                                billboard = {
                                    color: Cesium.Color.WHITE,
                                    image: image,
                                    pixelOffset: new Cesium.Cartesian2(0, 0),
                                    eyeOffset: this.Cartesian3.ZERO,
                                    position: this.Cartesian3.fromDegrees(longitude, latitude, altitude),
                                    verticalOrigin: this.VerticalOrigin.CENTER,
                                    //scaleByDistance: new this.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.0),
                                    //heightReference: this.HeightReference.NONE
                                    heightReference: (this.defined(args.properties.altitudeMode)) ? cesiumEngine.utils.convertEmpAltitudeTypeToCesium(args.properties.altitudeMode) : this.HeightReference.CLAMP_TO_GROUND
                                };
                            }
                            else
                            {
                                // no changes to image
                                billboard = billboardCollection._billboards[0];
                            }
                            // billboardCollection.featureId = args.featureId;
                            // billboardCollection.name = args.name;
                            // billboardCollection.description = new this.ConstantProperty(args.description || args.properties.description);
                            //  billboardCollection.properties = args.properties;
                            // billboardCollection.symbolCode = args.symbolCode;
                            billboard.id = billboardCollection.id;
                            billboard.name = args.name;
                            billboard.description = args.description || args.properties.description;
                            billboard.isDynamic = true;
                            //newCarto =  new this.Cartographic.fromDegrees(longitude, latitude, altitude);
                            billboard.position = this.Cartesian3.fromDegrees(longitude, latitude, altitude);
                            billboard.properties = args.properties;
                            billboard.show = (this.drawData.id === billboard.id) ? false : args.visible;
                            billboard.overlayId = layer.id;
                            //billboard.heightReference = (this.defined(args.properties.altitudeMode) )?cesiumEngine.utils.convertEmpAltitudeTypeToCesium(args.properties.altitudeMode):this.heightReference.NONE;//absolute
                            if (billboardCollection.updateCount > 20)
                            {
                                //layer.removeFeature(billboardCollection);  // do not remove via the layer because it will also delete the children.
                                //remove the collection from the scene.primitives instead
                                newBillboardCollection = new this.BillboardCollection();
//                        if (billboardCollection.childrenFeatureKeys)
//                        {
//                            newBillboardCollection.childrenFeatureKeys = billboardCollection.childrenFeatureKeys;
//                        }
                                //this.viewer.scene.primitives.remove(billboardCollection);
                                newBillboardCollection.featureType = EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION;
                                newBillboardCollection.id = item.id;
                                newBillboardCollection.featureId = args.featureId;
                                newBillboardCollection.name = args.name;
                                newBillboardCollection.description = args.description || args.properties.description;
                                newBillboardCollection.overlayId = layer.id;
                                newBillboardCollection.properties = args.properties;
                                newBillboardCollection.symbolCode = args.symbolCode;
                                newBillboardCollection.coordinates = [longitude, latitude, altitude];
                                newBillboardCollection.altitude = altitude;
                                if (callRenderer || callClusterIcon)
                                {
                                    newBillboardCollection.image = billboard.image;
                                }
                                else
                                {
                                    newBillboardCollection.image = billboardCollection.image;
                                }
                                billboard = newBillboardCollection.add(billboard);
                                billboard.name = newBillboardCollection.name;
                                billboard.description = args.description || args.properties.description;
                                billboard.image = newBillboardCollection.image;// image is stripped out after assigning billboard to collection
                                billboard.isDynamic = true;
                                billboard.symbolCode = args.symbolCode;
                                billboard.properties = args.properties;
                                if (this.defined(item.properties) && this.defined(item.properties.heading) && this.isV2Core)
                                {
                                    azimuth = this.Math.toRadians(item.properties.heading);
                                    billboard.rotation = -azimuth;
                                }
                                else if (this.defined(item.properties) && this.defined(item.properties.modifiers) && this.defined(item.properties.modifiers.azimuth) && Array.isArray(item.properties.modifiers.azimuth) && item.properties.modifiers.azimuth.length > 0)
                                {
                                    azimuth = this.Math.toRadians(item.properties.modifiers.azimuth[0]);
                                    billboard.rotation = -azimuth;
                                }
                                billboard.heightReference = (this.defined(args.properties.altitudeMode)) ? cesiumEngine.utils.convertEmpAltitudeTypeToCesium(args.properties.altitudeMode) : this.HeightReference.CLAMP_TO_GROUND;
                                layer.updateFeature(newBillboardCollection);// call sets the old collection to undefined after removing it from the map.
                                //this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                                //this.viewer.scene.primitives.add(billboardCollection);
                                newBillboardCollection.updateCount = 0;
                            }
                            else
                            {
                                billboardCollection.name = args.name;
                                billboardCollection.description = args.description || args.properties.description;
                                billboardCollection.overlayId = layer.id;
                                billboardCollection.properties = args.properties;
                                billboardCollection.symbolCode = args.symbolCode;
                                billboardCollection.coordinates = [longitude, latitude, altitude];
                                billboardCollection.altitude = altitude;
                                billboardCollection.image = billboard.image;
                                if (callClusterIcon || callRenderer)
                                {
                                    billboardCollection._billboards[0].image = billboard.image;
                                    billboardCollection._billboards[0].pixelOffset = billboard.pixelOffset;
                                    billboardCollection._billboards[0].alignedAxis = billboard.alignedAxis;
                                    billboardCollection._billboards[0].scaleByDistance = (callClusterIcon) ? undefined : billboard.scaleByDistance;
                                }
                                if (this.defined(item.properties) && this.defined(item.properties.heading) && this.isV2Core)
                                {
                                    azimuth = this.Math.toRadians(item.properties.heading);
                                    billboardCollection._billboards[0].rotation = -azimuth;
                                }
                                else if (this.defined(item.properties) && this.defined(item.properties.modifiers) && this.defined(item.properties.modifiers.azimuth) && Array.isArray(item.properties.modifiers.azimuth) && item.properties.modifiers.azimuth.length > 0)
                                {
                                    azimuth = this.Math.toRadians(item.properties.modifiers.azimuth[0]);
                                    billboardCollection._billboards[0].rotation = -azimuth;
                                }
                                billboardCollection._billboards[0].name = args.name;
                                billboardCollection._billboards[0].description = args.description || args.properties.description;
                                billboardCollection._billboards[0].isDynamic = true;
                                billboardCollection._billboards[0].position = this.Cartesian3.fromDegrees(longitude, latitude, altitude);
                                billboardCollection._billboards[0].properties = args.properties;
                                billboardCollection._billboards[0].symbolCode = args.symbolCode;
                                billboardCollection._billboards[0].show = (this.drawData.id === billboard.id) ? false : args.visible;
                                billboardCollection._billboards[0].overlayId = layer.id;
                                billboardCollection._billboards[0].heightReference = (this.defined(args.properties.altitudeMode)) ? cesiumEngine.utils.convertEmpAltitudeTypeToCesium(args.properties.altitudeMode) : this.HeightReference.CLAMP_TO_GROUND;
                            }
                            if (callClusterIcon || callRenderer)
                            {
                                this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                            }

                        }
                        else //  if (layer.isFeaturePresentById(item.id))
                        {
                            //if ((!within || isSkyVisible))
                            if ((item.singlePointAltitudeRangeMode === EmpCesiumConstants.SinglePointAltitudeRangeMode.HIGHEST_RANGE) && this.enableRenderingOptimization && this.enableClusterIcon)
                            {
                                //first time rendering the icon. If not within the extent or the sky is visible let plot a cluster icon
                                // instead of calling the renderer

                                //billboard = this.getSinglePointBillboardPrimitive([item])[0];
                                //var img = billboard.image;
                                // billboard = {};
                                billboard = {
                                    color: Cesium.Color.WHITE,
                                    image: 'data:image/svg+xml,' + highScaleImage,
                                    pixelOffset: new Cesium.Cartesian2(0, 0),
                                    eyeOffset: this.Cartesian3.ZERO,
                                    position: this.Cartesian3.fromDegrees(longitude, latitude, altitude),
                                    verticalOrigin: this.VerticalOrigin.CENTER,
                                    //scaleByDistance: new this.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.0),
                                    //heightReference: this.HeightReference.NONE
                                    heightReference: (this.defined(args.properties.altitudeMode)) ? cesiumEngine.utils.convertEmpAltitudeTypeToCesium(args.properties.altitudeMode) : this.HeightReference.CLAMP_TO_GROUND
                                };

//                        billboard.image = emp.utilities.getDefaultIcon().iconUrl;
//                        billboard.width = emp.utilities.getDefaultIcon().offset.width;
//                        billboard.height = emp.utilities.getDefaultIcon().offset.height;
//                         billboard.show = args.visible;
//                         billboard.pixelOffset = new this.Cartesian2(0, 0);
//                         //billboard.eyeOffset = 0; //cesiumEngine.utils.getEyeOffsetControlPoint(this.viewer.camera.positionCartographic.height, this.cameraAltitude);
//                         billboard.horizontalOrigin = this.HorizontalOrigin.CENTER;
//                         billboard.alignedAxis = this.Cartesian3.ZERO;
//                         //billboard.scaleByDistance = new this.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.0);
//                         billboard.isDynamic = true;
//                         billboard.scale =  1.0;
                                //add to onHold hash
                                // item.isOnOutsideViewableAreaHold = true;
                                item.isClusterIcon = this.enableClusterIcon;
                                //////////this.storeSinglePointIdOnHold(item.id);
                            }
                            else
                            {
                                billboard = this.getSinglePointBillboardPrimitive([item])[0];
                                item.isClusterIcon = false;
                            }

                            item.singlePointAltitudeRangeChanged = false;

                            newBillboardCollection = new this.BillboardCollection();
                            newBillboardCollection.id = item.id;
                            newBillboardCollection.featureType = EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION;
                            newBillboardCollection.featureId = args.featureId;
                            newBillboardCollection.name = args.name;
                            newBillboardCollection.description = args.description || args.properties.description;
                            newBillboardCollection.overlayId = layer.id;
                            newBillboardCollection.properties = args.properties;
                            newBillboardCollection.symbolCode = args.symbolCode;
                            newBillboardCollection.coordinates = [longitude, latitude, altitude];
                            newBillboardCollection.altitude = altitude;
                            newBillboardCollection.image = billboard.image;
                            newBillboardCollection.verticalOrigin = billboard.verticalOrigin;
                            if (this.defined(item.properties) && this.defined(item.properties.heading) && this.isV2Core)
                            {
                                azimuth = this.Math.toRadians(item.properties.heading);
                                billboard.rotation = -azimuth;
                            }
                            else if (this.defined(item.properties) && this.defined(item.properties.modifiers) && this.defined(item.properties.modifiers.azimuth) && Array.isArray(item.properties.modifiers.azimuth) && item.properties.modifiers.azimuth.length > 0)
                            {
                                azimuth = this.Math.toRadians(item.properties.modifiers.azimuth[0]);
                                billboard.rotation = -azimuth;
                            }
//                    newBillboardCollection.scale = billboard.scale;
//                    newBillboardCollection.alignedAxis = billboard.alignedAxis;
//                    newBillboardCollection.pixelOffset = billboard.pixelOffset;
//                    newBillboardCollection.scaleByDistance = billboard.scaleByDistance;
                            // track billboard in texture atlas by assigning emp metadata
                            billboard.id = newBillboardCollection.id;
                            billboard.name = newBillboardCollection.name;
                            billboard.description = newBillboardCollection.description;
                            billboard.isDynamic = true;
                            billboard.position = this.Cartesian3.fromDegrees(longitude, latitude, altitude);
                            billboard.show = (this.drawData.id === billboard.id) ? false : args.visible;
                            billboard.overlayId = layer.id;
                            billboard = newBillboardCollection.add(billboard);
                            newBillboardCollection.updateCount = 0;
                            //billboard.verticalOrigin = newBillboardCollection.verticalOrigin;
                            // billboard.image = newBillboardCollection.image;
                            billboard.isDynamic = true;
                            billboard.id = newBillboardCollection.id;
                            billboard.name = newBillboardCollection.name;
                            billboard.description = newBillboardCollection.description;
                            billboard.symbolCode = newBillboardCollection.symbolCode;
                            billboard.properties = newBillboardCollection.properties;
                            billboard.isDynamic = true;
                            billboard.overlayId = layer.id;
                            billboard.heightReference = (this.defined(args.properties.altitudeMode)) ? cesiumEngine.utils.convertEmpAltitudeTypeToCesium(args.properties.altitudeMode) : this.HeightReference.CLAMP_TO_GROUND;

//                    billboard.scale = newBillboardCollection.scale;
//                    billboard.alignedAxis = newBillboardCollection.alignedAxis;
//                    billboard.pixelOffset = newBillboardCollection.pixelOffset;
//                    billboard.scaleByDistance = newBillboardCollection.scaleByDistance;
                            if (args.coreParent && args.parentType === 'feature' && layer.isFeaturePresentById(args.coreParent))
                            {
                                // has a parent feature
                                var parentPrimitive = layer.getFeature(args.coreParent);
                                layer.addFeatureChild(parentPrimitive, newBillboardCollection);
                            }
                            else
                            {
                                layer.addFeature(newBillboardCollection);
                            }
                            //this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                        }
                        return result;
                    }
                    else
                    {
                        result.success = false;
                        result.message = "This feature is not specifying a parent layer: ";
                        return result;
                    }
                }
                else
                {
                    kmls = getSinglePointKml([item], this.showLabels, empLabelSize, iconPixelSize);
                    //should be single kml
                    return addKmlToOverlay({
                        overlayId: args.parentCoreId,
                        id: args.coreId,
                        data: (kmls instanceof Array) ? kmls[0] : kmls,
                        properties: args.properties,
                        symbolCode: args.symbolCode,
                        coordinates: [longitude, latitude],
                        altitude: altitude,
                        name: args.name,
                        description: args.description || args.properties.description,
                        feature: args
                    });
                }
            }.bind(this);


    this.SinglePointRateLimit = function (fn, delay, context)
    {
        var queue = [], timer = null;
        //context.newAddRateLimitQueue = queue;

        function processQueue()
        {
            var index = 0;
            // if (item)

            //if (queue.length > 10)
            // {
            while (index < 100)
            {
                var item = queue.shift();
                if (item && item.context.isSinglePointPresent(item.arguments[0].id || item.arguments[0].coreId || item.arguments[0]))
                {
                    //var singlePoint = item.context.getSinglePoint(item.arguments[0].id || item.arguments[0].coreId || item.arguments[0]);
                    if (item.context.isSinglePointIdOnHoldPresent((item.arguments[0].id || item.arguments[0].coreId || item.arguments[0])))
                            // if ((this.empCesium.defined(singlePoint) && this.empCesium.defined(singlePoint.isOnOutsideViewableAreaHold) && !singlePoint.isOnOutsideViewableAreaHold) && (this.empCesium.defined(singlePoint.isOnUpdateDelayHold) && !singlePoint.isOnUpdateDelayHold))
                            {
                                // do not call the renderer while the point is on hold.
                                index++;
                                continue;
                            }
                    fn.apply(item.context, item.arguments);
                }
                if (queue.length === 0)
                {
                    break;
                }
                index = index + 1;
            }
            if (index > 0 && item)
            {
                item.context.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
            }
            if (queue.length === 0)
                clearInterval(timer), timer = null;
        }

        return function limited()
        {
            queue.push({
                context: context || this,
                arguments: [].slice.call(arguments)
            });
            if (!timer)
            {
                processQueue();  // start immediately on the first invocation
//                if (queue.length > 20)
//                {
//                    processQueue();
//                }
//                else
//                {
                timer = setInterval(processQueue, delay);
                //}
                //timer = setInterval(processQueue, (queue.length > 20) ? delay * 2 : delay);

            }
        };

    };


    this.MultiPointRateLimit = function (fn, delay, context)
    {
        var queue = [], timer = null;
        //context.newAddRateLimitQueue = queue;

        function processQueue()
        {
            var index = 0;
            var items = [];
            while (index < 200)
            {
                var item = queue.shift();
                if (item && item.context.isMultiPointPresent(item.arguments[0].id || item.arguments[0].coreId))
                {
                    // condition checks the case when the multi point was deleted while this request was in this queue.
                    items.push(item.arguments[0]);
                }
                if (queue.length === 0)
                {
                    break;
                }
                index = index + 1;
            }
            if (items.length > 0)
            {
                fn.apply(item.context, [items]);
            }
            if (items.length > 0)
            {
                // item.context.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
            }
            if (queue.length === 0)
                clearInterval(timer), timer = null;
        }

        return function limited()
        {
            queue.push({
                context: context || this,
                arguments: [].slice.call(arguments)
            });
            if (!timer)
            {
                processQueue();  // start immediately on the first invocation
//                if (queue.length > 20)
//                {
//                    processQueue();
//                }
//                else
//                {
                timer = setInterval(processQueue, delay);
                //}
                //timer = setInterval(processQueue, (queue.length > 20) ? delay * 2 : delay);

            }
        };

    };
    /**
     * @desc Retrieves the KML for a single point symbol.
     *
     * @param {object} batch - The batch symbol.
     * @param {boolean} showLabels - Whether the symbol labels should be shown.
     * @param {type} labelScale - The label scale.
     * @param {type} iconPixelSize - The icon pixel size.
     * @returns {object} kmls - An array of kml objects for each of the symbols passed in.
     */
    this.getSinglePointKml = function (batch, showLabels, labelScale, iconPixelSize)
    {
        var len,
                i,
                urls = [],
                batchUrls = {},
                symbolUrl,
                offsets,
                kml = [],
                hotSpotX = 0,
                hotSpotY = 0,
                height,
                width,
                iconScale = 1,
                placemark,
                index,
                newSymbolCode,
                heading = "";
        len = batch.length;
        batchUrls.iconURLs = [];
        for (i = 0; i < len; i += 1)
        {
            symbolUrl = cesiumEngine.utils.generateSymbolURL(batch[i].symbolCode, batch[i].properties, batch[i].name, showLabels, iconPixelSize);
            urls.push(symbolUrl);
            // Strip off protocal, server and port #
            index = symbolUrl.local.lastIndexOf("/");
            if (index !== -1)
            {
                newSymbolCode = symbolUrl.local.slice(index + 1);
            }
            else
            {
                newSymbolCode = symbolUrl.local;
            }
            batchUrls.iconURLs.push(newSymbolCode);
        }
        batchUrls = JSON.stringify(batchUrls);
        offsets = sec.web.renderer.SECWebRenderer.getSinglePointInfoBatch(batchUrls);
        offsets = JSON.parse(offsets);
        for (i = 0; i < len; i += 1)
        {
            // pass in the offsets for this graphic.
            hotSpotX = offsets.singlepoints[i].x;
            hotSpotY = offsets.singlepoints[i].y;
            height = offsets.singlepoints[i].iconheight;
            width = offsets.singlepoints[i].iconwidth;
            if (width <= 32 && height <= 32)
            {
                iconScale = 1.0;
            }
            else if (width === 32 && height > 32)
            {
                iconScale = 1.0;
            }
            else if (height >= 32 && width < 32)
            {
                iconScale = Math.round((height / 32) * 100) / 100;
            }
            else if (width >= 32 && height < 32)
            {
                iconScale = Math.round((width / 32) * 100) / 100;
            }
            else if (width >= iconPixelSize && height >= 32)
            {
                iconScale = Math.round((height / 32) * 100) / 100;
            }
            if (showLabels === false)
            {
                labelScale = 0;
            }
            if (batch[i].altitude === undefined || batch[i].altitude === null || isNaN(batch[i].altitude))
            {
                batch[i].altitude = 0;
            }
            if (batch[i].properties)
            {
                if (!batch[i].properties.description)
                {
                    batch[i].properties.description = "";
                }
                if (batch[i].properties.modifiers)
                {
                    if (batch[i].properties.modifiers.heading !== undefined && batch[i].properties.modifiers.heading !== null)
                    {
                        if (batch[i].properties.modifiers.heading > 360 || batch[i].properties.modifiers.heading < -360 || batch[i].properties.modifiers.heading === 0)
                        {
                            heading = "<heading>" + 360 + "</heading>";
                        }
                        else
                        {
                            heading = "<heading>" + batch[i].properties.modifiers.heading + "</heading>";
                        }
                    }
                }
            }
            placemark = "<kml>" +
                    "<Folder id=\"" + batch[i].id + "\">" +
                    "<Placemark>" +
                    "<description><![CDATA[" + batch[i].description + "]]></description>" +
                    "<Style>" +
                    "<IconStyle>" +
                    "<scale>" + iconScale + "</scale>" +
                    "<Icon>" +
                    "<href><![CDATA[" + urls[i].local + "]]></href>" +
                    "</Icon>" +
                    "<hotSpot x=\"" + hotSpotX + "\" y=\"" + hotSpotY + "\" xunits=\"pixels\" yunits=\"insetPixels\"/>" +
                    heading +
                    "</IconStyle>" +
                    "<LabelStyle>" +
                    "<scale>" + labelScale + "</scale>" +
                    "</LabelStyle>" +
                    "</Style>" +
                    "<Point>" +
                    "<extrude>1</extrude>" +
                    //"<altitudeMode>" + batch[i].properties.altitudeMode + "</altitudeMode>" +
                    "<coordinates>" + batch[i].lon + "," + batch[i].lat + "," + batch[i].altitude + "</coordinates>" +
                    "</Point>" +
                    "</Placemark>" +
                    "</Folder>" +
                    "</kml>";
            kml.push(placemark);
        }

        return kml;
    };
    this.getSinglePointBillboard = function (batch, billboard)
    {
        var len,
                i,
                billboards = [],
                iconScale = 1,
                billboard = billboard,
                modifiedModifiers,
                standard = cesiumEngine.utils.RendererSettings.Symbology_2525C, // defaulting to C numeric
                heading = 0.0;
        len = batch.length;
        for (i = 0; i < len; i += 1)
        {
            if (batch[i].altitude === undefined || batch[i].altitude === null || isNaN(batch[i].altitude))
            {
                batch[i].altitude = 0;
            }
            if (batch[i].properties)
            {
                if (!batch[i].properties.description)
                {
                    batch[i].properties.description = "";
                }
                if (batch[i].properties.heading !== undefined && batch[i].properties.heading !== null)
                {
                    heading = this.Math.toRadians(batch[i].properties.heading);
                }
                else if (batch[i].properties.modifiers && batch[i].properties.modifiers.heading !== undefined && batch[i].properties.modifiers.heading !== null)
                {
                    heading = this.Math.toRadians(batch[i].properties.modifiers.heading);
                }
                if (!batch[i].properties.modifiers)
                {
                    batch[i].properties.modifiers = {};
                }
                if (batch[i].properties.modifiers)
                {
                    if (!cesiumEngine.utils.isSymbolStandardSpecified(batch[i].properties.modifiers))
                    {
                        //fix absence of string standard i modifiers
                        batch[i].properties.modifiers.standard = (this.isV2Core) ? emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B : emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C;
                    }
                    //convert standard  to renderer format
                    standard = cesiumEngine.utils.checkSymbolStandard(batch[i].properties.modifiers);

                    modifiedModifiers = emp.typeLibrary.utils.milstd.updateModifierLabels(batch[i].properties, batch[i].name, this.iconLabels, this.iconPixelSize);
                    modifiedModifiers = emp.typeLibrary.utils.milstd.convertModifierStringTo2525(modifiedModifiers, this.showLabels);
                    modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.SymbologyStandard] = standard;
                    modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.PixelSize] = (this.iconPixelSize * 0.50) + this.iconPixelSize;
                    if (batch[i].properties.fillColor)
                    {
                        if (batch[i].properties.fillColor.length === 8)
                        { //KML Color format
                            var fillColorOpacity = cesiumEngine.utils.colorABGRToObjectRGBAndAlpha(batch[i].properties.fillColor, true);
                            modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor] = fillColorOpacity.color;
                            if (modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor].indexOf("#") < 0)
                            {
                                modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor] = "#" + modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor]
                            }
                            modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.Alpha] = fillColorOpacity.opacity;
                            delete modifiedModifiers["fillColor"];
                        }
                        else
                        {
                            //modifiedModifiers["fillColor"] = batch[i].properties.fillColor;
                            modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor] = batch[i].properties.fillColor;
                            if (modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor].indexOf("#") < 0)
                            {
                                modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor] = "#" + modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor]
                            }
                            delete modifiedModifiers["fillColor"];
                        }
                    }
                    if (batch[i].properties.lineColor)
                    {
                        if (batch[i].properties.lineColor.length === 8)
                        { //KML Color format
                            var lineColorOpacity = cesiumEngine.utils.colorABGRToObjectRGBAndAlpha(batch[i].properties.lineColor, true);
                            modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = lineColorOpacity.color;
                            if (modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor].indexOf("#") < 0)
                            {
                                modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = "#" + modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor]
                            }
                            modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.Alpha] = lineColorOpacity.opacity;
                            delete modifiedModifiers["lineColor"];
                        }
                        else
                        {
                            modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = batch[i].properties.lineColor;
                            if (modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor].indexOf("#") < 0)
                            {
                                modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = "#" + modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor]
                            }
                            delete modifiedModifiers["lineColor"];
                        }
                    }
                    if (batch[i].properties.lineWidth)
                    {
                        modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineWidth] = batch[i].properties.lineWidth;
                    }
                }
            }
            var imageInfo = armyc2.c2sd.renderer.MilStdIconRenderer.Render(batch[i].symbolCode, modifiedModifiers);
//            iconScale = cesiumEngine.utils.getSymbolIconCurrentScale(this.iconPixelSize);
            billboard = billboard || new this.BillboardGraphics();
            billboard.image = imageInfo.getImage();
            //billboard.image = new this.ConstantProperty(imageInfo.getImage());
            billboard.show = true;
            var imageCenterX = imageInfo._bounds.width / 2;
            var imageCenterY = imageInfo._bounds.height / 2;
            var centerX = imageInfo.getCenterPoint().x;
            var centerY = imageInfo.getCenterPoint().y;
            centerX = imageCenterX - centerX;
            if (centerX > imageCenterX)
            {
                centerX = centerX * -1;
            }
            centerY = imageCenterY - centerY;
            billboard.pixelOffset = new this.Cartesian2(centerX, centerY);
//            billboard.scale = iconScale;
//            billboard.alignedAxis = this.Cartesian3.ZERO;
//            billboard.scaleByDistance = new this.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.0);
            billboard.rotation = heading;
            billboards.push(billboard);
        }

        return billboards;
    };


    this.getSinglePointBillboardPrimitive = function (batch)
    {
        var len,
                i,
                billboards = [],
                modifiedModifiers,
                standard = cesiumEngine.utils.RendererSettings.Symbology_2525C, // defaulting to C numeric
                heading = 0.0;

        len = batch.length;
        for (i = 0; i < len; i += 1)
        {
            if (batch[i].altitude === undefined || batch[i].altitude === null || isNaN(batch[i].altitude))
            {
                batch[i].altitude = 0;
            }
            if (batch[i].properties)
            {
                if (!batch[i].properties.description)
                {
                    batch[i].properties.description = "";
                }
                if (batch[i].properties.heading !== undefined && batch[i].properties.heading !== null)
                {
                    heading = this.Math.toRadians(batch[i].properties.heading);
                }
                else if (batch[i].properties.modifiers && batch[i].properties.modifiers.heading !== undefined && batch[i].properties.modifiers.heading !== null)
                {
                    heading = this.Math.toRadians(batch[i].properties.modifiers.heading);
                }
                if (!batch[i].properties.modifiers)
                {
                    batch[i].properties.modifiers = {};
                }
                if (batch[i].properties.modifiers)
                {
                    //standard = cesiumEngine.utils.checkSymbolStandard(batch[i].properties.modifiers);
                    if (!cesiumEngine.utils.isSymbolStandardSpecified(batch[i].properties.modifiers))
                    {
                        //fix absence of string standard i modifiers
                        batch[i].properties.modifiers.standard = (this.isV2Core) ? emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B : emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C;
                    }
                    standard = cesiumEngine.utils.checkSymbolStandard(batch[i].properties.modifiers);
                    //set icon size here
                    //modifiedModifiers[emp.typeLibrary.utils.milstd.StringModifiers.SIZE] = this.iconPixelSize;
                    modifiedModifiers = emp.typeLibrary.utils.milstd.updateModifierLabels(batch[i].properties, batch[i].name, this.iconLabels, this.iconPixelSize);
                    if (this.enableRenderingOptimization)
                    {
                        modifiedModifiers = emp.typeLibrary.utils.milstd.convertModifierStringTo2525(modifiedModifiers, (this.showLabels && this.singlePointAltitudeRangeMode === EmpCesiumConstants.SinglePointAltitudeRangeMode.LOW_RANGE));
                    }
                    else
                    {
                        modifiedModifiers = emp.typeLibrary.utils.milstd.convertModifierStringTo2525(modifiedModifiers, (this.showLabels));
                    }
                    // convert altitude X numeric array if present to a string. Sending a numeric array is breaking the rendering of the symbol
                    if (this.defined(modifiedModifiers.X) && Array.isArray(modifiedModifiers.X))
                    {
                        modifiedModifiers.X = modifiedModifiers.X.join();
                    }
                    modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.SymbologyStandard] = standard;
                    //modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.PixelSize] = (this.iconPixelSize * 0.50) + this.iconPixelSize;
                    modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.PixelSize] = (this.iconPixelSize * 0.50) + this.iconPixelSize;
                    if (this.defined(batch[i].selected) && batch[i].selected === true)
                    {
                        // scale applied to selction of single point. the scale is really a multiplier
                        modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.PixelSize] = modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.PixelSize] * this.selectionScale;
                    }
//                    else
//                    {
//                        modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.PixelSize] = (this.iconPixelSize * 0.50) + this.iconPixelSize;
//                    }

                    if (batch[i].properties.fillColor || batch[i].properties.modifiers.fillColor)
                    {
                        var fillColor = batch[i].properties.fillColor || batch[i].properties.modifiers.fillColor;
                        if (fillColor.length === 8)
                        { //KML Color format
                            //var fillColorOpacity = cesiumEngine.utils.colorABGRToObjectRGBAndAlpha(fillColor, true);
                            //modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor] = fillColorOpacity.color;
                            if (modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor].indexOf("#") < 0)
                            {
                                modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor] = "#" + modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor]
                            }
                            // the renderer is now taking 8 char colors next is not needed ...modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.Alpha] = fillColorOpacity.opacity;
                            delete modifiedModifiers["fillColor"];
                        }
                        else
                        {
                            //modifiedModifiers["fillColor"] = batch[i].properties.fillColor;
                            modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor] = fillColor;
                            if (modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor].indexOf("#") < 0)
                            {
                                modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor] = "#" + modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor]
                            }
                            delete modifiedModifiers["fillColor"];
                        }
                    }
                    if (batch[i].properties.lineColor || batch[i].properties.modifiers.lineColor)
                    {
                        var lineColor = batch[i].properties.lineColor || batch[i].properties.modifiers.lineColor;
                        if (lineColor.length === 8)
                        { //KML Color format
                            //var lineColorOpacity = cesiumEngine.utils.colorABGRToObjectRGBAndAlpha(lineColor, true);
                            //modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = lineColorOpacity.color;
                            if (modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor].indexOf("#") < 0)
                            {
                                modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = "#" + modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor]
                            }
                            //modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.Alpha] = lineColorOpacity.opacity;
                            delete modifiedModifiers["lineColor"];
                        }
                        else
                        {
                            modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = batch[i].properties.lineColor;
                            if (modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor].indexOf("#") < 0)
                            {
                                modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = "#" + modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor]
                            }
                            delete modifiedModifiers["lineColor"];
                        }
                    }
                    if (batch[i].properties.lineWidth || batch[i].properties.modifiers.lineWidth)
                    {
                        var lineWidth = batch[i].properties.lineWidth || batch[i].properties.modifiers.lineWidth;
                        modifiedModifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineWidth] = lineWidth;
                    }
                }
            }

            var symbolCode;
            if ((this.singlePointAltitudeRangeMode === EmpCesiumConstants.SinglePointAltitudeRangeMode.MID_RANGE ||
                    this.singlePointAltitudeRangeMode === EmpCesiumConstants.SinglePointAltitudeRangeMode.HIGHEST_RANGE) && batch[i].symbolCode && batch[i].symbolCode.length === 15)
            {
                // do not display country code
                symbolCode = batch[i].symbolCode.substr(0, 12) + "--" + batch[i].symbolCode.substr(14);
            }
            else
            {
                // display country code
                symbolCode = batch[i].symbolCode;
            }

            var imageInfo = armyc2.c2sd.renderer.MilStdIconRenderer.Render(batch[i].symbolCode, modifiedModifiers);
            // svg disabled  var imageInfo = armyc2.c2sd.renderer.MilStdSVGRenderer.Render(batch[i].symbolCode, modifiedModifiers);
//            iconScale = cesiumEngine.utils.getSymbolIconCurrentScale(this.iconPixelSize);
            var billboard = {};// primitive
            //billboard = billboard || {};// primitive
            billboard.image = imageInfo.getImage();
            // not used var svg = 'data:image/svg+xml;base64,' + window.btoa(imageInfo.getSVG()); works with base64
            //svg disabled    var svg = 'data:image/svg+xml,' + imageInfo.getSVG().replace(/#/g, '%23');
            //console.log(svg);
            // svg disabled  billboard.image = svg;
            //billboard.image = new this.ConstantProperty(imageInfo.getImage());
            //billboard.show = true;
            var imageCenterX = imageInfo._bounds.width / 2;
            var imageCenterY = imageInfo._bounds.height / 2;
            var centerX = imageInfo.getCenterPoint().x;
            var centerY = imageInfo.getCenterPoint().y;
            centerX = imageCenterX - centerX;
            if (centerX > imageCenterX)
            {
                centerX = centerX * -1;
            }
            centerY = imageCenterY - centerY;
            billboard.pixelOffset = new this.Cartesian2(centerX, centerY);
            //billboard.eyeOffset = this.Cartesian3.ZERO; //cesiumEngine.utils.getEyeOffsetControlPoint(this.viewer.camera.positionCartographic.height, this.cameraAltitude);
            //billboard.horizontalOrigin = this.HorizontalOrigin.CENTER;
//            if (centerY < -10 )
//            {
//                billboard.verticalOrigin = this.VerticalOrigin.BOTTOM;
//            }
//            else
//            {
            // billboard.verticalOrigin = this.VerticalOrigin.CENTER;
//            }
            //billboard.alignedAxis = (batch[i].properties.alignedAxis) ? batch[i].properties.alignedAxis : this.Cartesian3.ZERO;
            //billboard.scale = (batch[i].properties.scale) ? batch[i].properties.scale : 1.0;
//            billboard.scale = iconScale;
//            billboard.alignedAxis = this.Cartesian3.ZERO;
            //billboard.scaleByDistance = new this.NearFarScalar(7.0e6, 0.0, 8.0e6, 0.0);
            //billboard.translucencyByDistance = new Cesium.NearFarScalar(4.0e6, 1.0, 9.0e6, 0.0);
            //billboard.pixelOffsetScaleByDistance = new Cesium.NearFarScalar(1.5e2, 0.0, 8.0e6, 0.0);
            if (cesiumEngine.utils.isMilStandardSinglePointDirectional(batch[i].symbolCode))
            {
                billboard.alignedAxis = this.Cartesian3.UNIT_Z;
            }
            else
            {
                billboard.alignedAxis = this.Cartesian3.ZERO;
            }
            billboard.rotation = -heading;// clockwise
            billboards.push(billboard);
            imageInfo = undefined;
        }

        return billboards;
    };
    /**
     * @desc Goes to a location with range set.
     *
     * @param {View} item - A {@link View} object
     * @returns {object} result - The resulting object.
     * @returns {string} result.message - A description of why the function failed.
     * @returns {object} result.jsError - A caught javascript exception.
     * @returns {string} result.error - A description of the error that occurred
     */
    this.goToLocationWithRange = function (item)
    {
        var result = {
            success: true,
            jsError: "",
            message: ""
        },
        range = 200,
                cartesian3Destination,
                duration = 0,
                orientation = {};
        try
        {
            if (cesiumEngine.geoLibrary.validateLatLon(item.location.lat, item.location.lon))
            {
                if (item.range && item.range !== null && !isNaN(range))
                {
                    range = item.range;
                }
                else
                {
                    // Get camera altitude.
                    range = this.viewer.camera.positionCartographic.height;
                }
                cartesian3Destination = this.Ellipsoid.WGS84.cartographicToCartesian(Cesium.Cartographic.fromDegrees(item.location.lon, item.location.lat, range));

                if (!isNaN(item.tilt))
                {
                    orientation.pitch = item.tilt.toRad() - this.Math.PI_OVER_TWO;// -90 is facing on top of terrain
                }
                else
                {
                    orientation.pitch = this.Math.toRadians(-90);
                }

                if (!isNaN(item.heading))
                {
                    orientation.heading = -item.heading.toRad();
                }
                else
                {
                    orientation.heading = this.Math.toRadians(0);
                }
                if (!isNaN(item.roll))
                {
                    orientation.roll = -item.roll.toRad();
                }
                else
                {
                    orientation.roll = 0;
                }

                if (this.lastPosition && this.lastPosition.equalsEpsilon(cartesian3Destination, this.Math.EPSILON5) && this.viewTransaction)
                {
                    if (cesiumEngine.utils.getAnglesDifference(this.viewer.scene.camera.heading, orientation.heading) < this.Math.EPSILON5 &&
                            cesiumEngine.utils.getAnglesDifference(this.viewer.scene.camera.pitch, orientation.pitch) < this.Math.EPSILON5 &&
                            cesiumEngine.utils.getAnglesDifference(this.viewer.scene.camera.roll, orientation.roll) < this.Math.EPSILON5)
                    {
                        // zoom to extent provided is the same as the current  extent so
                        // the map moved end event is never triggered to run the viewTransaction. Run the transaction here
                        //run transaction
                        //this.viewTransaction.run();
                        //this.viewTransaction = undefined;
                        this.FlyToComplete();
                        return;
                    }
                }

                if (this.defined(item.animate))
                {
                    duration = (item.animate === true) ? 1 : 0;
                }






                this.flyTo({
                    destination: cartesian3Destination,
                    orientation: orientation,
                    duration: duration
                });
            }
            else
            {
                result.success = false,
                        result.message = "Invalid lat/lon";
                return result;
            }
        }
        catch (err)
        {
            result.success = false;
            result.jsError = err;
            result.message = "Could not go to location with range.";
            return result;
        }
        //if (!this.viewTransaction)
        //{
        return result;
        //}
    };
    /**
     * @desc Zooms to a range.
     *
     * @param {View} item - A {@link View} object
     * @returns {object} result - The resulting object.
     * @returns {string} result.message - A description of why the function failed.
     * @returns {object} result.jsError - A caught javascript exception.
     * @returns {string} result.error - A description of the error that occurred
     */
    this.zoomToRange = function (item)
    {
        var result = {
            success: true,
            jsError: "",
            message: ""
        },
        cameraPosition,
                cartesian3Destination,
                duration = 0;
        try
        {
            if (item.range && item.range !== "auto" && !isNaN(item.range))
            {
                cameraPosition = this.viewer.camera.position;
                cartesian3Destination = new this.Cartesian3(cameraPosition.x, cameraPosition.y, item.range);
                if (this.lastPosition && this.lastPosition.equalsEpsilon(cartesian3Destination, this.Math.EPSILON5) && this.viewTransaction)
                {
                    // zoom to extent provided is the same as the current  extent so
                    // the map moved end event is never truggered to run the viewTransaction. Run the transaction here
                    //run transaction
                    //this.viewTransaction.run();
                    //this.viewTransaction = undefined;
                    this.FlyToComplete();
                    return;
                }

                if (this.defined(item.animate))
                {
                    duration = (item.animate === true) ? 1 : 0;
                }

                //this.flyTo({
                //    destination: new this.Cartesian3(cameraPosition.x, cameraPosition.y, item.range),
                //    duration: duration
                //});
                this.flyToAltitude(item.range, duration);
            }
        }
        catch (err)
        {
            result.success = false;
            result.jsError = err;
            result.message = err.message;
            return result;
        }
        //if (!this.viewTransaction)
        //{
        return result;
        //}
    };
    /**
     * @desc Zooms to a set of bounds.
     *
     * @param {View} item - A {@link View} object
     * @returns {object} result - The resulting object.
     * @returns {string} result.message - A description of why the function failed.
     * @returns {object} result.jsError - A caught javascript exception.
     * @returns {string} result.error - A description of the error that occurred
     */
    this.zoomToBounds = function (item)
    {
        var result = {
            success: true,
            jsError: "",
            message: ""
        };
        try
        {
            this.zoomToExtent(item);
        }
        catch (err)
        {
            result.success = false;
            result.jsError = err;
            result.message = "Could not zoom to bounds";
            return result;
        }
        //if (!this.viewTransaction)
        //{
        return result;
        //}
    };

    this.goToCenterOfOverlay = function (item)
    {
        var layer = this.getLayer(item.overlayId),
                coordinateGroup = [],
                features,
                subLayer,
                index,
                indexSubLayerFeatures, duration = 1;
        if (layer)
        {
            features = layer.getFeatures();
            for (index = 0; index < features.length; index++)
            {
                if (features[index] && features[index].featureType === EmpCesiumConstants.featureType.ENTITY)
                {
                    coordinateGroup = coordinateGroup.concat(this.getEntityCartographicArray(features[index]));
                }
                else if (features[index] && features[index].featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                {
                    coordinateGroup = coordinateGroup.concat(this.getPrimitiveCartographicArray(features[index]));
                }
                else if (features[index] && features[index].featureType === EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION)
                {
                    if (this.defined(features[index]._billboards) && Array.isArray(features[index]._billboards))
                    {
                        //it is a mil standard single point
                        coordinateGroup = coordinateGroup.concat([this.ellipsoid.cartesianToCartographic(features[index]._billboards[0].position)]);
                    }
                }
                else if (features[index] && features[index].featureType === EmpCesiumConstants.featureType.DATA_SOURCE)
                {
                    for (var dataSourceEntityIndex = 0; dataSourceEntityIndex < features[index].entities.values.length; dataSourceEntityIndex++)
                    {
                        var entity = features[index].entities.values[dataSourceEntityIndex];
                        coordinateGroup = coordinateGroup.concat(this.getEntityCartographicArray(entity));
                    }
                }
            }
            if (layer.isSubLayerPresent())
            {
                var layers = layer.getSubLayers();
                for (index = 0; index < layers.length; index++)
                {
                    subLayer = layers[index];
                    features = subLayer.getFeatures();
                    for (indexSubLayerFeatures = 0; indexSubLayerFeatures < features.length; indexSubLayerFeatures++)
                    {
                        coordinateGroup = coordinateGroup.concat(this.getEntityCartographicArray(features[indexSubLayerFeatures]));
                        if (features[indexSubLayerFeatures].featureType === EmpCesiumConstants.featureType.ENTITY)
                        {
                            coordinateGroup = coordinateGroup.concat(this.getEntityCartographicArray(features[indexSubLayerFeatures]));
                        }
                        else if (features[indexSubLayerFeatures].featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                        {
                            coordinateGroup = coordinateGroup.concat(this.getPrimitiveCartographicArray(features[indexSubLayerFeatures]));
                        }
                        else if (features[indexSubLayerFeatures] && features[indexSubLayerFeatures].featureType === EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION)
                        {
                            if (this.defined(features[indexSubLayerFeatures]._billboards) && Array.isArray(features[indexSubLayerFeatures]._billboards))
                            {
                                //it is a mil standard single point
                                coordinateGroup = coordinateGroup.concat([this.ellipsoid.cartesianToCartographic((features[indexSubLayerFeatures]._billboards[0]))]);
                            }
                        }
                    }
                }
            }

            if (this.defined(item.animate))
            {
                duration = (item.animate === true) ? 1 : 0;
            }
            if (coordinateGroup.length > 1)
            {
                this.flyTo({
                    destination: cesiumEngine.utils.getRectangleWithBufferFromCartographicArray(coordinateGroup),
                    range: item.range,
                    duration: duration
                });
                return {
                    success: true,
                    message: ""
                };
            }
            else if (coordinateGroup.length === 1 && features.length === 1 && features[0].featureType === EmpCesiumConstants.featureType.ENTITY)
            {
                // just 1 entity with a bilboard
                this.flyTo({
                    destination: features[0],
                    range: item.range,
                    duration: duration
                });
                return {
                    success: true,
                    message: ""
                };
            }
            else if (coordinateGroup.length === 1)
            {
                coordinateGroup[0].height = (coordinateGroup[0].height >= 0) ? coordinateGroup[0].height + 10000 : 10000;
                var cartesian = this.Ellipsoid.WGS84.cartographicToCartesian(coordinateGroup[0]);

                this.flyTo({
                    destination: cartesian,
                    range: item.range,
                    duration: duration
                });
                return {
                    success: true,
                    message: ""
                };
            }
        }
        return {
            success: false,
            message: "goToCenterOfOverlay - layer (overlay) not found in globe"
        };
    };
    this.goToLocationById = function (item)
    {
        var result = {
            success: true,
            jsError: "",
            message: ""
        },
        layer,
                overlay,
                feature,
                cartographics = [],
                index,
                features,
                standard = cesiumEngine.utils.RendererSettings.Symbology_2525C, // defaults to C in numeric format
                boundingSphere,
                duration = 1;// keep animation as default for the case of go to feature
        try
        {
            if (item.coreId)
            {
                feature = this.getFeature(item.coreId);

                if (this.defined(item.animate))
                {
                    duration = (item.animate === true) ? 1 : 0;
                }

                if (feature && feature.featureType === EmpCesiumConstants.featureType.ENTITY)
                {
                    var rectangle;
                    if (this.isMultiPointPresent(item.coreId)) ///isMilStdMultipoint duplicate function??????
                    {
                        var multiPointObject = this.getMultiPoint(item.coreId);
                        var basicSymbolId = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(multiPointObject.symbolCode);
                        if (multiPointObject.properties)
                        {
                            // Rertrieve which standard to use.  '2525b' or '2525c'
                            //standard = cesiumEngine.utils.checkSymbolStandard(multiPointObject.properties.modifiers);
                            if (!cesiumEngine.utils.isSymbolStandardSpecified(multiPointObject.properties.modifiers))
                            {
                                //fix absence of string standard in modifiers
                                multiPointObject.properties.modifiers.standard = (this.isV2Core) ? emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B : emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C;
                            }
                            standard = cesiumEngine.utils.checkSymbolStandard(multiPointObject.properties.modifiers);
                        }
                        var sd = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(basicSymbolId, standard);

                        cartographics = cesiumEngine.utils.convertCoordsDegreesToCartographicArray(multiPointObject);
                        if (cartographics.length === 1 && sd.drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE)
                        {
                            //rectangle = feature.rectangle.coordinates._callback(Cesium.JulianDate.fromDate(new Date()));
                            var dLength = multiPointObject.properties.modifiers[emp.typeLibrary.utils.milstd.StringModifiers.AM_DISTANCE][0]; //meters
                            cartographics.push(cartographics[0].destinationPoint(0, dLength));
                            cartographics.push(cartographics[0].destinationPoint(90, dLength));
                            cartographics.push(cartographics[0].destinationPoint(-90, dLength));
                            cartographics.push(cartographics[0].destinationPoint(180, dLength));
                        }
                        if (cartographics.length === 1 && sd.drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE)
                        {
                            //rectangle = feature.rectangle.coordinates._callback(Cesium.JulianDate.fromDate(new Date()));
                            var dLength1 = multiPointObject.properties.modifiers[emp.typeLibrary.utils.milstd.StringModifiers.AM_DISTANCE][0]; //meters
                            var dLength2 = multiPointObject.properties.modifiers[emp.typeLibrary.utils.milstd.StringModifiers.AM_DISTANCE][1]; //meters
                            var dLength = Math.max(dLength1, dLength2);
                            cartographics.push(cartographics[0].destinationPoint(0, dLength));
                            cartographics.push(cartographics[0].destinationPoint(90, dLength));
                            cartographics.push(cartographics[0].destinationPoint(-90, dLength));
                            cartographics.push(cartographics[0].destinationPoint(180, dLength));
                        }
                        else if (cartographics.length === 1 && (sd.drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_RANGEFAN_AUTOSHAPE || sd.drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_SECTOR_PARAMETERED_AUTOSHAPE))
                        {
                            //rectangle = feature.rectangle.coordinates._callback(Cesium.JulianDate.fromDate(new Date()));
                            var len = multiPointObject.properties.modifiers[emp.typeLibrary.utils.milstd.StringModifiers.AM_DISTANCE].length;
                            var dLength = multiPointObject.properties.modifiers[emp.typeLibrary.utils.milstd.StringModifiers.AM_DISTANCE][len - 1]; //meters
                            cartographics.push(cartographics[0].destinationPoint(0, dLength));
                            cartographics.push(cartographics[0].destinationPoint(90, dLength));
                            cartographics.push(cartographics[0].destinationPoint(-90, dLength));
                            cartographics.push(cartographics[0].destinationPoint(180, dLength));
                        }
                        else if (cartographics.length > 1 && sd.drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_AUTOSHAPE)
                        {
                            //rectangle = feature.rectangle.coordinates._callback(Cesium.JulianDate.fromDate(new Date()));
                            var dLength = cartographics[0].distanceTo(cartographics[1]); //meters
                            var bearing = cartographics[0].bearingTo(cartographics[1]);
                            cartographics.push(cartographics[0].destinationPoint(bearing + 90, dLength));
                            cartographics.push(cartographics[0].destinationPoint(bearing - 90, dLength));
                            cartographics.push(cartographics[0].destinationPoint(bearing + 180, dLength));
                        }

                    }
                    else
                    {
                        cartographics = this.getEntityCartographicArray(feature);
                    }


                    if (cartographics.length > 1)
                    {
                        var maxHeight = 0;
                        for (var index = 0; index < cartographics.length; index++)
                        {
                            maxHeight = (cartographics[index].height > maxHeight) ? cartographics[index].height : maxHeight;
                        }
                        if (item.range && item.range < maxHeight)
                        {
                            item.range = maxHeight;
                        }
                        else if (!this.defined(item.range))
                        {
                            item.range = maxHeight;
                        }
                        if (item.range === 0)
                        {
                            item.range = 10000;
                        }

                        this.flyTo({
                            destination: cesiumEngine.utils.getRectangleWithBufferFromCartographicArray(cartographics),
                            range: item.range,
                            duration: duration
                        });
                        this.viewer.selectedEntity = feature;
                    }
//                    else if (this.defined(rectangle))
//                    {
//                        this.flyTo({
//                            destination: cesiumEngine.utils.getRectangleWithBufferFromRectangle(rectangle),
//                            duration: duration,
//                            range: item.range
//                        });
//                    }
                    else
                    {
                        this.flyTo({
                            destination: feature,
                            duration: duration,
                            range: item.range
                        });
                    }
                }
                else if (feature && feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                {
                    if (feature._boundingSphereWC && feature._boundingSphereWC.length > 0)
                    {
                        boundingSphere = feature._boundingSphereWC[0];
                    }

                    if (boundingSphere)
                    {
                        this.flyToBoundingSphere({
                            boundingSphere: boundingSphere,
                            duration: duration
                        });
                    }
                    else
                    {
                        this.flyToPrimitive({destination: feature, duration: duration});
                    }
                }
                else if (feature && feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION)
                {
                    if (this.isSinglePointPresent(feature.id))
                    {
                        this.flyToPrimitive({destination: feature, duration: duration});
                    }
                }
                else if (feature && feature.featureType === EmpCesiumConstants.featureType.DATA_SOURCE)
                {
                    this.flyTo({
                        destination: feature,
                        range: item.range,
                        duration: duration,
                        orientation: {heading: 0.0, pitch: this.Math.toRadians(-75), roll: 0.0}
                    });
                }
                else if (feature && feature.featureType === EmpCesiumConstants.featureType.COMPOUND_ENTITY)
                {
                    if (feature.childrenFeatureKeys !== undefined)
                    {
                        features = this.getFeatureChildren(feature.id);
                    }
                    for (index = 0; index < features.length; index++)
                    {
                        cartographics = cartographics.concat(this.getEntityCartographicArray(features[index]));
                    }

                    if (cartographics.length > 0)
                    {
                        this.flyTo({
                            destination: cesiumEngine.utils.getRectangleWithBufferFromCartographicArray(cartographics
                                    ),
                            duration: duration,
                            range: item.range
                        });
                    }
                }
                else if (item.overlayId)
                {
                    overlay = this.getLayer(item.overlayId);

                    if (overlay)
                    {
                        result = this.goToCenterOfOverlay(item);
                    }
                    else
                    {
                        result.success = false;
                        result.message = "Could not find overlay";
                        return result;
                    }
                }
            }
            else if (item.overlayId)
            {
                overlay = this.getLayer(item.coreId);
                if (overlay)
                {
                    result = this.goToCenterOfOverlay(item);
                }
                else
                {
                    result.success = false;
                    result.message = "Could not find overlay";
                    return result;
                }
            }
            else
            {
                result.success = false;
                result.message = "No usable id was passed in. Could not go to a location by id";
                return result;
            }
        }
        catch (err)
        {
            result.success = false;
            result.jsError = err;
            result.message = "Could not go to a location by id.";
            return result;
        }

        //if (!this.viewTransaction) {
        return result;
        //}
    };

    /**
     * @desc Sets the current viewers camera lookAt then restores the default camera movement
     *
     * @param {object} item describing the position of the location and parameters of the camera to view the object.
     * @param {number} item.latitude Latitude of the location to center the view on
     * @param {number} item.longitude Longitude of the location to center the view on
     * @param {number} item.altitude Altitude of the location to center the view on
     * @param {number} item.heading Heading the camera faces the location from
     * @param {number} item.tilt Tilt of the camera to face the location from
     * @param {number} item.range Range of the camera from the location
     * @returns {{success: boolean, jsError: Error, message: string}}
     */
    this.lookAtLocation = function (item)
    {
        var result = {
            success: true,
            jsError: undefined,
            message: ""
        }, pitch = -this.Math.PI_OVER_TWO,
                roll = 0, heading = 0;

        try
        {
            if (cesiumEngine.geoLibrary.validateLatLon(item.latitude, item.longitude))
            {
                // Configure the lookAt parameters
                var center = Cesium.Cartesian3.fromDegrees(item.longitude, item.latitude, item.altitude);
                if (!isNaN(item.heading))
                {
                    heading = -item.heading.toRad();
                }
                else
                {
                    heading = this.Math.toRadians(0);
                }
//                if (!isNaN(item.roll))
//                {
//                    roll = -item.roll.toRad();
//                }
//                else
//                {
//                    roll = 0;
//                }
                if (!isNaN(item.tilt))
                {
                    pitch = item.tilt.toRad() - this.Math.PI_OVER_TWO;// -90 is facing on top of terrain
                }
                else
                {
                    pitch = this.Math.toRadians(-90);
                }
                var range = item.range;

                // This will set the camera and keep the camera pointed at the location, translating movements to the camera will always face this
                this.viewer.camera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range));

                // Restore the camera movement so normal movement will remain in effect
//                this.viewer.camera.setView({
//                    orientation: {
//                        heading: heading,
//                        pitch: pitch,
//                        roll: 0.0
//                    }
//                });
                this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
            }
            else
            {
                result.success = false;
                result.message = "Invalid Latitude/Longitude";
            }
        }
        catch (err)
        {
            result.success = false;
            result.jsError = err;
            result.message = "Could not look at location";
        }
        return result;
    };

    /**
     * @desc Formats a view to match {@link View} item requirements.
     *
     * @param {object} item - The initial view object requireing updating.
     *
     * @return {object} item - A View object containing the following
     * @return {object} item.bounds - The current bounds object of the view.
     * @return {object} item.location - The current location object of the view.
     * @return {string} item.range - The current range of the view.
     * @return {string} item.tilt - The current tilt of the view.
     * @return {string} item.roll - The current roll of the view.
     * @return {string} item.heading - The current heading of the view.
     */
    this.formatView = function (item)
    {
        var result = {
            success: true,
            jsError: "",
            message: ""
        },
        extent,
                center;
        try
        {
            extent = this.getExtent();
            center = this.getCenter();
            item.bounds = {
                north: extent.north.toDeg(),
                south: extent.south.toDeg(),
                east: extent.east.toDeg(),
                west: extent.west.toDeg()
            };
            item.location = {
                lon: center.longitude.toDeg(),
                lat: center.latitude.toDeg()
            };
            item.range = Math.round(this.getCameraAltitude());
            item.altitude = Math.round(this.getCameraAltitude());// of camera
            if (!isNaN(this.viewer.scene.camera.pitch))
            {
                item.tilt = this.viewer.scene.camera.pitch.toDeg() + 90;
                item.tilt = cesiumEngine.utils.normalizeAngleInDegrees(item.tilt);
                /// item.tilt = item.tilt.toRad();
                // item.tilt =  this.Math.zeroToTwoPi( item.tilt);
                // item.tilt = item.tilt.toDeg();
            }
            if (!isNaN(this.viewer.scene.camera.roll))
            {
                item.roll = -this.viewer.scene.camera.roll.toDeg();
                //  item.roll = this.Math.zeroToTwoPi(item.roll.toRad()).toDeg();
                item.roll = cesiumEngine.utils.normalizeAngleInDegrees(item.roll);
            }
            if (!isNaN(this.viewer.scene.camera.heading))
            {
                item.heading = -this.viewer.scene.camera.heading.toDeg();
                item.heading = cesiumEngine.utils.normalizeAngleInDegrees(item.heading);
                // item.heading = this.Math.zeroToTwoPi(item.heading.toRad()).toDeg();
            }
            item.mgrs = emp.geoLibrary.ddToMGRS(item.location.lat, item.location.lon);
            item.scale = this.getScale();
            result.item = item;
        }
        catch (err)
        {
            result.success = false;
            result.jsError = err;
            result.message = "Could not get/format the view.";
        }

        return result;
    };
    this.addUrl = function (item, data)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        };
        item.id = item.coreId || item.feature.id;
        switch (item.format)
        {
            case "kml":
                result = this.addKmlFromUrl(item);
                break;
            case "geojson":
                result = this.addGeojsonFromUrl(item);
                break;
            case "image":
                result = this.addImageFromUrl(item, data);
                break;
            default:
                result.success = false;
                result.message = "This format of URL is not supported: " + item.format;
                break;
        }
        return result;
    };
    this.addImageFromUrl = function (args, data)
    {
        var result = {
            success: true,
            jsError: "",
            message: ""
        },
        id = args.coreId,
                visible = args.visible,
                layer = this.getLayer(id);
        if (layer)
        {
            this.removeLayer(layer);
        }
        var options = {};
        // TileMapService tile provider
        var sti = new this.SingleTileImageryProvider({
            url: args.url,
            rectangle: new this.Rectangle(
                    this.Math.toRadians(args.params.left),
                    this.Math.toRadians(args.params.bottom),
                    this.Math.toRadians(args.params.right),
                    this.Math.toRadians(args.params.top))
        });
        layer = new EmpLayer(args.name, id, EmpCesiumConstants.layerType.IMAGE_LAYER, this);
        //layer = new EmpLayer(args.name, cesiumEngine.utils.createGUID(), EmpCesiumConstants.layerType.IMAGE_LAYER, empCesium);
        layer.providers = [];
        layer.providers.push({layerName: args.name, provider: sti, imageryLayer: undefined, enable: false});
        layer.enabled = true;
        this.addLayer(layer);
        this.enableLayer(layer, true);
        return result;
    };

    this.setBackgroundBrightness = function (alpha)
    {
        if (this.defined(alpha))
        {
            alpha = (alpha > 100) ? 100 : alpha;
            alpha = (alpha < 0) ? 0 : alpha;
            alpha = alpha / 100;
            if (alpha > .5)
            {
                this.stiBrightnessWhite.alpha = Math.abs(alpha * 2 - 1);
                this.stiBrightnessBlack.alpha = 0;
            }
            else if (alpha < .5)
            {
                this.stiBrightnessWhite.alpha = 0;
                this.stiBrightnessBlack.alpha = Math.abs(alpha * 2 - 1);
            }
            else
            {
                // it is .5
                this.stiBrightnessWhite.alpha = 0;
                this.stiBrightnessBlack.alpha = 0;
            }
        }

    };

    this.addGeojsonFromUrl = function (args)
    {
        var proxy = new this.DefaultProxy(this.proxyUrl),
                geoJsonDataSource = new this.GeoJsonDataSource(args.name),
                layer,
                url,
                options = {},
                useProxy = false;
        result = {
            success: true,
            jsError: "",
            message: ""
        };

        layer = this.getLayer(args.overlayId);
        if (layer === undefined)
        {
            layer = this.getLayer(args.parentCoreId);   // this.getFeature(args.parentCoreId);
        }

        if (layer === undefined)
        {
            result.success = false;
            result.message = "This feature is not specifying a parent layer: ";
            return result;
        }
        options.stroke = EmpCesiumConstants.propertyDefaults.LINE_COLOR;
        options.fill = EmpCesiumConstants.propertyDefaults.FILL_COLOR;
        if (args.properties && args.properties.altitudeMode && (cesiumEngine.utils.AltitudeModeEnumType.ALTITUDE_CLAMP_TO_GROUND === args.properties.altitudeMode))
        {
            //options = {clampToGround: true};
        }
        geoJsonDataSource.zoom = args.zoom;
        url = args.url;

        if (this.isV2Core)
        {
            useProxy = emp.util.config.getUseProxySetting();
        }
        else if (args && args.useProxy)
        {
            useProxy = args.useProxy;
        }
        if (useProxy)
        {
            url = this.getProxyUrl() + "?url=" + args.url;
        }
        geoJsonDataSource.load(args.url, options).then(function (geoJsonDataSource)
        {
            geoJsonDataSource.id = args.coreId;
            geoJsonDataSource.featureId = args.featureId;
            geoJsonDataSource.name = args.name;
            geoJsonDataSource.description = args.description;
            geoJsonDataSource.overlayId = args.overlayId;
            geoJsonDataSource.featureType = EmpCesiumConstants.featureType.DATA_SOURCE;
            layer.addFeature(geoJsonDataSource);
            var entities = geoJsonDataSource.entities.values;
            for (var index = 0; index < entities.length; index++)
            {
                var entity = entities[index];
                if (entity.label)
                {
                    var labelScale = 1;
                    entity.label.scale = labelScale;
                    entity.label._font.setValue('20px sans-serif');
                    entity.label.translucencyByDistance = new this.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.0);
                }
                if (entity.billboard)
                {
                    //use default emp icon
//                    if (emp.util.config.getUseProxySetting())
//                    {
//                        entity.billboard.image = this.getProxyUrl() + "?url=" + emp.utilities.getDefaultIcon().iconUrl;
//                    }
//                    else
//                    {
                    entity.billboard.image = emp.utilities.getDefaultIcon().iconUrl;
                    //}
                }

            }
            if (geoJsonDataSource.zoom)
            {
                this.flyTo({
                    destination: geoJsonDataSource,
                    range: args.range,
                    orientation: {heading: 0.0, pitch: this.Math.toRadians(-75), roll: 0.0}
                });
            }
        }.bind(this));
        return result;
    };
    this.addKmlFromUrl = function (args)
    {
        //var proxy = new this.DefaultProxy(this.proxyUrl),
        var options = {}, useProxy = false;

        if (this.isV2Core)
        {
            useProxy = emp.util.config.getUseProxySetting();
        }
        else if (args && args.useProxy)
        {
            useProxy = args.useProxy;
        }

        if (useProxy)
        {
            options = {camera: this.viewer.scene.camera, canvas: this.canvas, proxy: new this.DefaultProxy(this.proxyUrl)};
        }
        else
        {
            options = {camera: this.viewer.scene.camera, canvas: this.canvas};
        }
        if (args.properties && args.properties.altitudeMode && (cesiumEngine.utils.AltitudeModeEnumType.ALTITUDE_CLAMP_TO_GROUND === args.properties.altitudeMode))
        {
            //options.clampToGround = true;
        }
        var kmlDataSource = new this.KmlDataSource(options),
                layer,
                result = {
                    success: true,
                    jsError: "",
                    message: ""
                };
        if (args.parentCoreId)
        {
            layer = this.getLayer(args.parentCoreId);
            if (layer === undefined)
            {
                layer = this.getLayer(args.feature.overlayId);   // this.getFeature(args.parentCoreId);
            }
            if (layer === undefined)
            {
                result.success = false;
                result.message = "addGeojsonToOverlay - This feature is not specifying a parent layer: ";
                return result;
            }
        }
        else
        {
            result.success = false;
            result.message = "This feature is not specifying a parent layer: ";
            return result;
        }
        kmlDataSource.zoom = args.zoom;
        kmlDataSource.load(args.url).then(function (kmlDataSource)
        {
            var entityArray = kmlDataSource.entities.values;
            if (entityArray && entityArray.length > 0)
            {
                //trying to fix a bad image object coming from the kml data source
                for (var indexEntities = 0; indexEntities < entityArray.length; indexEntities++)
                {
                    var entity = entityArray[indexEntities];
                    if (entity.billboard)
                    {

                        var url = entity.billboard.image.getValue();
                        if (typeof url !== "string")
                        {
                            // the KMLdatasourec assigned its own default icon as a canvas. This happens when thre is no icon tag or the URL is empty
                            // The desired intention is to only display the icon name like a label with no icon.
                            // set the icon to invisible
                            entity.billboard = undefined;

                        }
                        else
                        {
                            //encode any presence of '&' in the URL (EMS widget issue)
                            url = url.replace(/&/g, "%26");
                            entity.billboard.image = url;
                        }
//                        if (typeof url === "string")
//                        {
//                            //encode any presence of '&' in the URL (EMS widget issue)
//                            url = url.replace("&", "%26");
//                            entity.billboard.image = url;
//                        }
//                        var defaultIconName = emp.utilities.getDefaultIcon().iconUrl.split("/");
//                        if (defaultIconName && defaultIconName.length > 0)
//                        {
//                            defaultIconName = defaultIconName[defaultIconName.length - 1];
//
//                            if (((typeof url === "string") && (url.indexOf(defaultIconName) > -1)))
//                            {
//                                // set width height offset aligned axis  vertical origin  of default icon
//                                entity.billboard.width = emp.utilities.getDefaultIcon().offset.width;
//                                entity.billboard.height = emp.utilities.getDefaultIcon().offset.height;
//                                if (!this.defined(entity.billboard.pixelOffset))
//                                {
//                                    entity.billboard.pixelOffset = new this.Cartesian2(emp.utilities.getDefaultIcon().offset.x, emp.utilities.getDefaultIcon().offset.y);
//                                }
//                                if (!this.defined(entity.billboard.alignedAxis))
//                                {
//                                    entity.billboard.alignedAxis = this.Cartesian3.ZERO;
//                                }
//                                if (!this.defined(entity.billboard.verticalOrigin))
//                                {
//                                    entity.billboard.verticalOrigin = this.VerticalOrigin.BOTTOM;
//                                }
//                                if (!this.defined(entity.billboard.horizontallOrigin))
//                                {
//                                    entity.billboard.horizontallOrigin = this.HorizontalOrigin.CENTER;
//                                }
//                            }
//                            else if (typeof url !== "string")
//                            {
//                                // the KMLdatasourec assigned its own default icon as a canvas. This happens when thre is no icon tag or the URL is empty
//                                // The desire intention is to only display the icon name like a label with no icon.
//                                // set the icon to invisible
//                                entity.billboard = undefined;
//
//                            }
                        // }
                    }
//                    if (entity.label)
//                    {
//                        var labelScale = 1;
//                        entity.label.scale = labelScale;
//                        entity.label._font.setValue('20px sans-serif');
//                        entity.label.translucencyByDistance = new this.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.0);
//                    }
                }
                this.processEntities({layer: layer, entityArray: entityArray, data: args});
            }
            // todo -  clicking a feature billboard from tis data source returns a guid id and billboard with no tatype tagging.....
            // process the entities using the processEntiries function, but thwhat about the id of the entities? the datasource assigns a guid but
            // the core does not have any notin of the guid.

            if (kmlDataSource.zoom)
            {
                this.flyTo({
                    destination: kmlDataSource,
                    range: args.range,
                    orientation: {heading: 0.0, pitch: this.Math.toRadians(-75), roll: 0.0}
                });
            }
            kmlDataSource = undefined;
        }.bind(this));
        return result;
    };



    this.addKmlLayer = function (args)
    {
        //var proxy = new this.DefaultProxy(this.proxyUrl),
        var options = {}, kmlString, kml;

        if (args.useProxy)
        {
            options = {camera: this.viewer.scene.camera, canvas: this.canvas, proxy: new this.DefaultProxy(this.proxyUrl)};//ojo hack for the moment...take out later
        }
        else
        {
            options = {camera: this.viewer.scene.camera, canvas: this.canvas};
        }
        if (args.properties && args.properties.altitudeMode && (cesiumEngine.utils.AltitudeModeEnumType.ALTITUDE_CLAMP_TO_GROUND === args.properties.altitudeMode))
        {
            //options.clampToGround = true;
        }
        var kmlDataSource = new this.KmlDataSource(options),
                layer,
                result = {
                    success: true,
                    jsError: "",
                    message: ""
                };
        if (args.parentCoreId)
        {
            layer = this.getLayer(args.parentCoreId);
            if (layer === undefined)
            {
                layer = this.getLayer(args.feature.overlayId);   // this.getFeature(args.parentCoreId);
            }
            if (layer === undefined)
            {
                result.success = false;
                result.message = "addGeojsonToOverlay - This feature is not specifying a parent layer: ";
                return result;
            }
        }
        else
        {
            result.success = false;
            result.message = "This feature is not specifying a parent layer: ";
            return result;
        }
        if (this.defined(args.url))
        {
            kmlDataSource.load(args.url).then(function (kmlDataSource)
            {
                kmlDataSource.id = args.id;
                kmlDataSource.featureId = args.featureId;
                kmlDataSource.name = args.name;
                kmlDataSource.description = args.description;
                kmlDataSource.overlayId = args.overlayId;
                kmlDataSource.featureType = EmpCesiumConstants.featureType.DATA_SOURCE;
                kmlDataSource.properties = args.properties;
                kmlDataSource.show = args.visible;
                layer.addFeature(kmlDataSource);
            }.bind(this));
        }
        else if (args.kmlData)
        {
            kmlString = args.kmlData;

            if (kmlString.indexOf('<kml') === -1)
            {
                kmlString = '<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2">' + kmlString + '</kml>';
            }
            kml = emp.$.parseXML(kmlString);

            kmlDataSource.zoom = args.zoom;
            kmlDataSource.load(kml).then(function (kmlDataSource)
            {
                kmlDataSource.id = args.id;
                kmlDataSource.featureId = args.featureId;
                kmlDataSource.name = args.name;
                kmlDataSource.description = args.description;
                kmlDataSource.overlayId = args.overlayId;
                kmlDataSource.featureType = EmpCesiumConstants.featureType.DATA_SOURCE;
                kmlDataSource.properties = args.properties;
                kmlDataSource.show = args.visible;
                layer.addFeature(kmlDataSource);
            }.bind(this));
        }
        else
        {
            result.success = false;
            result.jsError = "empCesium/addKmlLayer() - KML layer has no URL or KML data defined";
        }
        kmlDataSource = undefined;
        return result;
    };

    this.addWmsToMap = function (item)
    {
        try
        {
            var layer = this.getLayer(item.coreId);
            if (layer)
            {
                this.removeLayer(layer);
            }
            var options = {};
            layer = new EmpLayer(item.name, item.coreId, EmpCesiumConstants.layerType.WMS_LAYER, this); //empCesium);
            layer.providers = [];
            layer.url = item.url;
            var sLayers = "";
            if (this.isV2Core && item.activeLayers)
            {
                sLayers = item.activeLayers.join();
            }
            else if (!this.isV2Core && item.layers)
            {
                sLayers = item.layers.join();
            }


            //var layerStr = item.activeLayers[index];
            var cesiumWMSImageryProvider = new this.WebMapServiceImageryProvider({
                url: item.url,
                credit: 'wms service description goes here,',
                parameters: {
                    transparent: item.params.transparent,
                    format: item.params.format,
                    width: 512,
                    height: 512,
                    version: item.params.version,
                    //maximunLevel: 19
                    crs: 'CRS:84'
                },
                layers: sLayers, // 'C:\Imagery\Raster\_World_MODIS_20041231\BlueMarble.jp2',
                //layers: 'C:%5CImagery%5CRaster%5C_World_MODIS_20041231%5CBlueMarble.jp2'
                /// good so far  layers: 'C:\\Imagery\\Raster\\_World_MODIS_20041231\\BlueMarble.jp2'
                proxy: (item.useProxy) ? new this.DefaultProxy(this.getProxyUrl()) : undefined
                        //layers: 'US_CA_Fort_Irwin_NTC_DG_20120630,US_CountyBoundaries,US_Fort_Irwin_2_DG_20090117,US_Fort_Irwin_3_DG_20090425,US_Fort_Irwin_4_DG_20080505,US_Fort_Irwin_CIB1_TOPO,US_Fort_Irwin_CIB5_TOPO,US_Fort_Irwin_DG_20080514,US_Fort_Irwin_Ntc_Ms_DG_20120630,US_FortIrwin_NTC_Buckeye_20090501,TigrImageryCoverage,Auto_BestQuality'
            });
            layer.providers.push({layerName: sLayers, provider: cesiumWMSImageryProvider, imageryLayer: undefined, enable: false});
            // }
            options = {isCors: "true", isBase: true, singleTile: false}; // @todo add iscors annnd use proxy to config tool WMS grid.
            layer.options = options;
            this.addLayer(layer);
            this.imageryEmpLayers.push(layer);
            this.imageryEmpLayersOptions.push(options);
            this.enableLayer(layer, true);
            // this.dropDown.options.add(new Option(item.name));
            // set default imagery if any
//            if ((typeof layer !== 'undefined') && this.defaultImageryUrl && this.defaultImageryUrl === layer.url)
//            {
//                // set first wms layer as the default if any
////                if (this.containsImageryLayer(this.imageryEmpLayer))
////                {
////                    this.enableLayer(this.imageryEmpLayer, false);
////                }
//                if (this.defaultImageryEmpLayer)
//                {
//                    // a service already selected in the manifest as the default but now we need to
//                    // disable it initially and pick the selected default wms service.
//                    this.enableLayer(this.defaultImageryEmpLayer, false);
//                }
//                this.enableLayer(layer, true);
//                this.defaultImageryEmpLayer = layer;
//                // this.dropDown.selectedIndex = this.dropDown.length - 1;
//            }
        }
        catch (err)
        {
            console.error("Adding WMS to Cesium failed! ", err);
        }
    };

    this.removeWmsFromMap = function (item)
    {
        try
        {
            var id = item.coreId;
            var layer = this.getLayer(id);
            if (layer)
            {
                this.removeLayer(layer);
            }
        }
        catch (err)
        {
            console.error("Removing WMS from Cesium failed! ", err);
        }
    };
    this.setWmsVisibility = function (item)
    {
        var newProviders = [];
        try
        {
            var id = item.coreId;
            var layer = this.getLayer(id);
            // Layer enabled is the current limagery selected from  the drop down.
            if (layer)
                    // if (layer && layer.enabled)
                    {
                        var providers = layer.providers;
                        if (providers && providers.length > 0)
                        {
                            for (var providerIndex = 0; providerIndex < providers.length; providerIndex++)
                            {
                                //remove provider and respective  imageryLayer layer
                                this.imageryLayerCollection.remove(providers[providerIndex].imageryLayer, true);
                                providers[providerIndex].imageryLayer = undefined;
                            }
                        }
                        layer.providers = [];

                        // for (var index = 0; index < item.activeLayers.length; index++)
                        // {
                        var sLayers = "";
                        if (this.isV2Core && item.activeLayers)
                        {
                            sLayers = item.activeLayers.join();
                        }
                        else if (!this.isV2Core && item.layers)
                        {
                            sLayers = item.layers.join();
                        }
                        //var layerStr = item.activeLayers[index];
                        var cesiumWMSImageryProvider = new this.WebMapServiceImageryProvider({
                            url: item.url,
                            credit: 'wms service description goes here,',
                            parameters: {
                                transparent: item.params.transparent,
                                format: item.params.format,
                                width: 512,
                                height: 512,
                                version: item.params.version,
                                //maximunLevel: 19
                                crs: 'CRS:84'
                            },
                            layers: sLayers, // 'C:\Imagery\Raster\_World_MODIS_20041231\BlueMarble.jp2',
                            //layers: 'C:%5CImagery%5CRaster%5C_World_MODIS_20041231%5CBlueMarble.jp2'
                            /// good so far  layers: 'C:\\Imagery\\Raster\\_World_MODIS_20041231\\BlueMarble.jp2'
                            // proxy: new this.DefaultProxy(this.getProxyUrl())
                            proxy: (item.useProxy) ? new this.DefaultProxy(this.getProxyUrl()) : undefined
                                    //layers: 'US_CA_Fort_Irwin_NTC_DG_20120630,US_CountyBoundaries,US_Fort_Irwin_2_DG_20090117,US_Fort_Irwin_3_DG_20090425,US_Fort_Irwin_4_DG_20080505,US_Fort_Irwin_CIB1_TOPO,US_Fort_Irwin_CIB5_TOPO,US_Fort_Irwin_DG_20080514,US_Fort_Irwin_Ntc_Ms_DG_20120630,US_FortIrwin_NTC_Buckeye_20090501,TigrImageryCoverage,Auto_BestQuality'
                        });
                        layer.providers.push({layerName: sLayers, provider: cesiumWMSImageryProvider, imageryLayer: undefined, enable: false});
                        // }
                        (item.activeLayers.length > 0) ? this.enableLayer(layer, true) : this.enableLayer(layer, false);




//                if (item.visibleLayers)
//                {
//                    //reset all the layer providers to disabled
//                    for (var index = 0; index < item.visibleLayers.length; index++)
//                    {
//                        var layerStr = item.visibleLayers[index];
//                        // imageries[layerStr].enable = false;
//                        for (var providerIndex = 0; providerIndex < layer.providers.length; providerIndex++)
//                        {
//                            if (providers[providerIndex].layerName === layerStr)
//                            {
//                                providers[providerIndex].imageryLayer.show = false;
//                                break;
//                            }
//                        }
//                    }
//                }

//                if (item.activeLayers)
//                {
//                    for (var index = 0; index < item.activeLayers.length; index++)
//                    {
//                        var layerStr = item.activeLayers[index];
//                        for (var providerIndex = 0; providerIndex < layer.providers.length; providerIndex++)
//                        {
//                            if (providers[providerIndex].layerName === layerStr)
//                            {
//                                providers[providerIndex].imageryLayer.readyToShow = true;
//                            }
//                        }
//                    }
//                }//  if (item.activeLayers)
//
//                for (var providerIndex = 0; providerIndex < layer.providers.length; providerIndex++)
//                {
//                        providers[providerIndex].imageryLayer.show = providers[providerIndex].imageryLayer.readyToShow;
//                }
//                if (item.activeLayers)
//                {
//                    for (var index = 0; index < item.activeLayers.length; index++)
//                    {
//                        var layerStr = item.activeLayers[index];
//                        for (var providerIndex = 0; providerIndex < layer.providers.length; providerIndex++)
//                        {
//                            if (providers[providerIndex].layerName === layerStr)
//                            {
//                                providers[providerIndex].imageryLayer.show = true;
//                                break;
//                            }
//                        }
//                        for (var providerIndex = 0; providerIndex < layer.providers.length; providerIndex++)
//                        {
//                            if (providers[providerIndex].layerName === layerStr)
//                            {
//                                providers[providerIndex].imageryLayer.show = true;
//                                break;
//                            }
//                        }
//                    }
//                }//  if (item.activeLayers)
                    }// if (layer && layer.enabled)
        }
        catch (err)
        {
            console.error("Setting WMS visibility in Cesium failed! ", err);
        }
    };

    this.addWmtsToMap = function (item)
    {
        try
        {
            var layer = this.getLayer(item.coreId), useProxy = false;
            if (layer)
            {
                this.removeLayer(layer);
            }
            var options = {};
            layer = new EmpLayer(item.name, item.coreId, EmpCesiumConstants.layerType.WMTS_LAYER, this); //empCesium);
            layer.providers = [];
            layer.url = item.url;
            layer.globalType = EmpCesiumConstants.layerType.WMTS_LAYER;
            var sLayers = "";
            if (this.isV2Core && item.activeLayers)
            {
                sLayers = item.activeLayers.join();
            }
            else if (!this.isV2Core && item.layers)
            {
                sLayers = item.layers.join();
            }

            if (this.isV2Core)
            {
                useProxy = emp.util.config.getUseProxySetting();
            }
            else if (item && item.useProxy)
            {
                useProxy = item.useProxy;
            }

            var webMapTileServiceImageryProvider = new this.WebMapTileServiceImageryProvider({
                url: layer.url,
                style: 'default',
                format: 'image/jpeg',
                tileMatrixSetID: 'default028mm',
                // tileMatrixLabels : ['default028mm:0', 'default028mm:1', 'default028mm:2' ...],
                maximumLevel: 19,
                //credit : new Cesium.Credit('U. S. Geological Survey')
                layer: sLayers,
                proxy: (useProxy) ? new this.DefaultProxy(this.proxyUrl) : undefined
            });
            layer.providers.push({layerName: item.name, provider: webMapTileServiceImageryProvider, imageryLayer: undefined, enable: false});
            //}
            //imageryEmpLayers[imageryEmpLayersIndex] = layer;
            //imageryEmpLayersOptions[imageryEmpLayersIndex] = {isCors: ("true" === imageryJsonObject.disableProxy.toLowerCase()), isBase: true};
            // layer.options = imageryEmpLayersOptions[imageryEmpLayersIndex];
            //imageryEmpLayersOptions[imageryEmpLayersIndex].singleTile = false;
            //dropDown.options.add(new Option(imageryJsonObject.name));
            this.addLayer(layer);
            this.imageryEmpLayers.push(layer);
            //this.imageryEmpLayersOptions.push(options);
            this.enableLayer(layer, true);
        }
        catch (err)
        {
            console.error("Adding WMTS to Cesium failed! ", err);
        }
    };

    this.removeWmtsFromMap = function (item)
    {
        try
        {
            var id = item.coreId;
            var layer = this.getLayer(id);
            if (layer)
            {
                this.removeLayer(layer);
            }
        }
        catch (err)
        {
            console.error("Removing WMS from Cesium failed! ", err);
        }
    };
    this.setWmtsVisibility = function (item)
    {
        var newProviders = [];
        try
        {
            var id = item.coreId;
            var layer = this.getLayer(id);
            // Layer enabled is the current limagery selected from  the drop down.
            if (layer)
                    // if (layer && layer.enabled)
                    {
                        var providers = layer.providers;
                        if (providers && providers.length > 0)
                        {
                            for (var providerIndex = 0; providerIndex < providers.length; providerIndex++)
                            {
                                //remove provider and respective  imageryLayer layer
                                this.imageryLayerCollection.remove(providers[providerIndex].imageryLayer, true);
                                providers[providerIndex].imageryLayer = undefined;
                            }
                        }
                        layer.providers = [];

                        // for (var index = 0; index < item.activeLayers.length; index++)
                        // {
                        var sLayers = "";
                        if (this.isV2Core && item.activeLayers)
                        {
                            sLayers = item.activeLayers.join();
                        }
                        else if (!this.isV2Core && item.layers)
                        {
                            sLayers = item.layers.join();
                        }
                        //var layerStr = item.activeLayers[index];
                        var webMapTileServiceImageryProvider = new this.WebMapTileServiceImageryProvider({
                            url: layer.url,
                            style: 'default',
                            format: 'image/jpeg',
                            tileMatrixSetID: 'default028mm',
                            // tileMatrixLabels : ['default028mm:0', 'default028mm:1', 'default028mm:2' ...],
                            maximumLevel: 19,
                            //credit : new Cesium.Credit('U. S. Geological Survey')
                            layer: sLayers
                                    //proxy: ("false" === imageryJsonObject.disableProxy.toLowerCase()) ? new empCesium.DefaultProxy(proxyUrl) : undefined
                        });
                        layer.providers.push({layerName: sLayers, provider: webMapTileServiceImageryProvider, imageryLayer: undefined, enable: false});
                        // }
                        (item.activeLayers.length > 0) ? this.enableLayer(layer, true) : this.enableLayer(layer, false);




//                if (item.visibleLayers)
//                {
//                    //reset all the layer providers to disabled
//                    for (var index = 0; index < item.visibleLayers.length; index++)
//                    {
//                        var layerStr = item.visibleLayers[index];
//                        // imageries[layerStr].enable = false;
//                        for (var providerIndex = 0; providerIndex < layer.providers.length; providerIndex++)
//                        {
//                            if (providers[providerIndex].layerName === layerStr)
//                            {
//                                providers[providerIndex].imageryLayer.show = false;
//                                break;
//                            }
//                        }
//                    }
//                }

//                if (item.activeLayers)
//                {
//                    for (var index = 0; index < item.activeLayers.length; index++)
//                    {
//                        var layerStr = item.activeLayers[index];
//                        for (var providerIndex = 0; providerIndex < layer.providers.length; providerIndex++)
//                        {
//                            if (providers[providerIndex].layerName === layerStr)
//                            {
//                                providers[providerIndex].imageryLayer.readyToShow = true;
//                            }
//                        }
//                    }
//                }//  if (item.activeLayers)
//
//                for (var providerIndex = 0; providerIndex < layer.providers.length; providerIndex++)
//                {
//                        providers[providerIndex].imageryLayer.show = providers[providerIndex].imageryLayer.readyToShow;
//                }
//                if (item.activeLayers)
//                {
//                    for (var index = 0; index < item.activeLayers.length; index++)
//                    {
//                        var layerStr = item.activeLayers[index];
//                        for (var providerIndex = 0; providerIndex < layer.providers.length; providerIndex++)
//                        {
//                            if (providers[providerIndex].layerName === layerStr)
//                            {
//                                providers[providerIndex].imageryLayer.show = true;
//                                break;
//                            }
//                        }
//                        for (var providerIndex = 0; providerIndex < layer.providers.length; providerIndex++)
//                        {
//                            if (providers[providerIndex].layerName === layerStr)
//                            {
//                                providers[providerIndex].imageryLayer.show = true;
//                                break;
//                            }
//                        }
//                    }
//                }//  if (item.activeLayers)
                    }// if (layer && layer.enabled)
        }
        catch (err)
        {
            console.error("Setting WMTS visibility in Cesium failed! ", err);
        }
    };


    this.updateOverlay = function (item)
    {
        var result = {
            success: true,
            jsError: "",
            message: ""
        },
        failList = [];
        try
        {
            if (item)
            {
                var overlayId = item.coreId;
                var layer = this.getLayer(overlayId);
                if (layer)
                {
                    layer.name = item.name;
                    layer.description = item.description;
                    if (item.parentId !== undefined && item.parentId !== layer.parentId)
                    {
                        // move overlay
                        var newParentLayer = this.getLayer(item.parentId);
                        if (newParentLayer)
                        {
                            layer.parentId = newParentLayer.id;
                        }
                        else
                        {
                            // layer/folder to move to  does not exist.
                            failList.push(new emp.typeLibrary.Error({
                                coreId: item.coreId,
                                message: "updateOverlay(): The target destination " + item.parentId + ", does not exist. Overlay cannot be move.",
                                level: emp.typeLibrary.Error.level.MAJOR
                            }));
                        }
                    }
                    else if (item.parentId === undefined && layer.parentId !== undefined)
                    {
                        // move back to root
                        layer.parentId = undefined;
                    }
                }
                else
                {
                    // Folder does not exist error out.
                    failList.push(new emp.typeLibrary.Error({
                        coreId: item.coreId,
                        message: "updateOverlay():  This overlay, " + item.overlayId + ", does not exist. Overlay cannot be updated.",
                        level: emp.typeLibrary.Error.level.MAJOR
                    }));
                }
            }
        }
        catch (err)
        {
            //push an error to the fail list
            failList.push(new emp.typeLibrary.Error({
                coreId: item.coreId,
                message: "An unhandled exception occurred updating overlay, " + item.overlayId,
                level: emp.typeLibrary.Error.level.MINOR,
                jsError: err
            }));
        }
        if (failList.length > 0)
        {
            result.success = (failList.length > 0) ? false : true;
        }
        return result;
    };
    /**
     *
     * Determines if the given id is registered as a MIL-STD-2525 "singlepoint" graphic.  A "singlepoint"
     * is any graphic that is drawn using a KMLPoint and uses the mil-sym-service.
     *
     * @param  {String}  id Feature ID of the feature.
     * @return {Boolean}    True if the feature is a single point 2525 symbol.
     */
    this.isMilStdSinglepoint = function (id)
    {
        var result;
        if (this.singlePointCollection[id])
        {
            result = true;
        }
        else
        {
            result = false;
        }

        return result;
    };
    /**
     * Determines if the given id is registered as a MIL-STD-2525 "multipoint" graphic.  A "multipoint"
     * graphic doesn't necessarily have more than one coordinate, it is a category of symbols
     * defined by us that are not represented by the mil-sym-service and are drawn with an image.
     *
     * @param  {String}  id Feature ID of the feature.
     * @return {Boolean}    True if the feature is a multi point 2525 symbol.
     */
    this.isMilStdMultipoint = function (id)
    {
        var result;
        if (this.multiPointCollection[id])
        {
            result = true;
        }
        else
        {
            result = false;
        }

        return result;
    };
    /**
     * Checks the symbol code of a Symbol and determines if this is a 3D airspace
     * (TAIS style) or if it is a normal MIL-STD-2525 graphic.
     * @param  {string} symbolCode A 15 character symbolID.
     * @return {boolean} True if the symbol is an airspace, false if it is not
     */
    this.is3dAirspace = function (symbolCode)
    {
        var returnValue = false;
        if (symbolCode === "CYLINDER-------" ||
                symbolCode === "RADARC---------" ||
                symbolCode === "CURTAIN--------" ||
                symbolCode === "ROUTE----------" ||
                symbolCode === "TRACK----------" ||
                symbolCode === "ORBIT----------" ||
                symbolCode === "POLYARC--------" ||
                symbolCode === "POLYGON--------")
        {
            returnValue = true;
        }
        else
        {
            returnValue = false;
        }

        return returnValue;
    };
    /**
     * Adds a 3D airspace to the map.  Airspaces can be one of the following: cylinder, track,
     * radarc, orbit, polyarc, route, polygon, line
     *
     * @param {Feature} feature - a {@link Feature} where the type is "feature"
     *
     * @returns {KMLFolder} The KMLFolder created for the feature.  null if it fails.
     */
    this.addAirspace = function (args)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        shapeType,
                coordinates,
                attributes,
                color,
                description,
                isValidCoordinates = true,
                layer,
                i;
        try
        {
            if (args.properties && args.properties.attributes &&
                    args.data && args.data.symbolCode)
            {
                attributes = args.properties.attributes;
                // Set the color of the airspace.
                if (args.properties.fillColor)
                {
                    color = args.properties.fillColor;
                }
                // Set the balloon/tooltip for the airspace.
                if (args.properties.description)
                {
                    description = args.properties.description;
                }
                // Get the type of symbol that is supposed to be drawn.
                shapeType = args.data.symbolCode;
                // convert coordinates to string as expected by other
                // airspace creating functions

                isValidCoordinates = cesiumEngine.utils.isGeojsonCoordinateValid(args.data);
                if (!isValidCoordinates)
                {
                    result.success = false;
                    result.jsError = "invalid coordinates. Values must be numeric and within valid lat and long ranges.:";
                    return result;
                }

                coordinates = cesiumEngine.utils.convertMilStdMultiPointCoordsToString(args.data);
                // Because the attributes being passed into the map could
                // be v1 format, in order for the 3D graphics to be rendered
                // these attributes must be reformatted to the correct spec.
                for (i = 0; i < attributes.length; i = i + 1)
                {
                    switch (shapeType.toUpperCase())
                    {
                        // If this is an orbit, we may have to adjust the coordinates
                        // based on the attributes.
                        case "ORBIT----------":
                        case "ROUTE----------":
                            if (this.defined(attributes[i].radius1) && !isNaN(attributes[i].radius1))
                            {
                                attributes[i].width = attributes[i].radius1;
                            }
                            else if (!this.defined(attributes[i].width) || isNaN(attributes[i].width))
                            {
                                attributes[i].width = 5000; //default
                            }
                            break;
                        case "CYLINDER-------":
                            if (this.defined(attributes[i].radius1) && !isNaN(attributes[i].radius1))
                            {
                                attributes[i].radius = attributes[i].radius1;
                            }
                            else if (attributes[i].radius === undefined || attributes[i].radius === null || isNaN(attributes[i].radius))
                            {
                                attributes[i].radius = 5000;//default
                            }
                            break;
                        case "POLYARC--------":
                            if (attributes[i].radius1 !== undefined && attributes[i].radius1 !== null && !isNaN(attributes[i].radius1))
                            {
                                attributes[i].radius = attributes[i].radius1;
                            }
                            else if (attributes[i].radius === undefined || attributes[i].radius === null || isNaN(attributes[i].radius))
                            {
                                attributes[i].radius = 5000;//default
                            }
                            if (attributes[i].leftAzimuth === undefined || attributes[i].leftAzimuth === null || isNaN(attributes[i].leftAzimuth))
                            {
                                attributes[i].leftAzimuth = 45;//default
                            }
                            if (attributes[i].rightAzimuth === undefined || attributes[i].rightAzimuth === null || isNaN(attributes[i].rightAzimuth))
                            {
                                attributes[i].rightAzimuth = 90;//default
                            }
                            break;
                        case "RADARC---------":
                            if (attributes[i].radius1 !== undefined && attributes[i].radius1 !== null && !isNaN(attributes[i].radius1))
                            {
                                attributes[i].innerRadius = attributes[i].radius1;
                            }
                            else if (attributes[i].innerRadius !== undefined && attributes[i].innerRadius !== null && !isNaN(attributes[i].innerRadius))
                            {
                                attributes[i].innerRadius = 5000;//default
                            }
                            if (attributes[i].radius2 !== undefined && attributes[i].radius2 !== null && !isNaN(attributes[i].radius2))
                            {
                                attributes[i].radius = attributes[i].radius2;
                            }
                            else if (attributes[i].radius === undefined || attributes[i].radius === null || isNaN(attributes[i].radius))
                            {
                                attributes[i].radius = 5000;//default
                            }
                            if (attributes[i].leftAzimuth === undefined || attributes[i].leftAzimuth === null || isNaN(attributes[i].leftAzimuth))
                            {
                                attributes[i].leftAzimuth = 45;//default
                            }
                            if (attributes[i].rightAzimuth === undefined || attributes[i].rightAzimuth === null || isNaN(attributes[i].rightAzimuth))
                            {
                                attributes[i].rightAzimuth = 90;//default
                            }
                            break;
                        case "TRACK----------":
                            if (attributes[i].radius1 !== undefined && attributes[i].radius1 !== null && !isNaN(attributes[i].radius1))
                            {
                                attributes[i].leftWidth = attributes[i].radius1;
                            }
                            else if (attributes[i].radius1 === undefined || attributes[i].radius1 === null || isNaN(attributes[i].radius1))
                            {
                                attributes[i].leftWidth = (this.defined(attributes[i].leftWidth)) ? attributes[i].leftWidth : 5000;
                            }
                            if (attributes[i].radius2 !== undefined && attributes[i].radius2 !== null && !isNaN(attributes[i].radius2))
                            {
                                attributes[i].rightWidth = attributes[i].radius2;
                            }
                            else if (attributes[i].radius2 === undefined || attributes[i].radius2 === null || isNaN(attributes[i].radius2))
                            {
                                attributes[i].rightWidth = (this.defined(attributes[i].rightWidth)) ? attributes[i].rightWidth : 5000;
                            }
                            break;
                        default:
                            break;
                    }
                    if (attributes[i].minAlt === undefined || attributes[i].minAlt === null || isNaN(attributes[i].minAlt))
                    {
                        attributes[i].minAlt = 5000;
                    }
                    if (attributes[i].maxAlt === undefined || attributes[i].maxAlt === null || isNaN(attributes[i].maxAlt))
                    {
                        attributes[i].maxAlt = 10000;
                    }
                }
                if (args.parentCoreId)
                {
                    layer = this.getLayer(args.parentCoreId);
                }
                if (layer === undefined)
                {
                    layer = this.getLayer(args.overlayId);   // this.getFeature(args.parentCoreId);
                }

                if (layer === undefined)
                {
                    result.success = false;
                    result.message = "This feature is not specifying a parent layer: ";
                    return result;
                }

                if (cesiumEngine.utils.getEmpToTaisAirspaceShapeTypeValue(args.symbolCode) < 0)
                {
                    result.success = false;
                    result.message = "The symbol code does not represent a vallid air control messure ";
                    return result;
                }
                var airspace = cesiumEngine.utils.convertEmpToTaisAirspace(args);
                airspace.empArg = args;
                this.storeAirspace(args);
                if (layer.isFeaturePresentById(args.coreId))
                {
                    if (this.drawData && this.drawData.isAirspace && this.drawData.isEditing)
                    {
                        this.airspaceDrawHandler.featureUpdate(airspace);
                        this.transferTaisAirspaceToDrawData(airspace, this.drawData);
                    }
                    else
                    {
                        this.mapCntrl.getMapCntrl(TAIS_DATA_TYPE.AIRSPACE).addAirspace(airspace);
                    }
                }
                else
                {
                    this.mapCntrl.getMapCntrl(TAIS_DATA_TYPE.AIRSPACE).addAirspace(airspace);
                }
                if (this.isFeatureSelected(airspace.empArg.coreId))
                {
                    var feature = this.getFeature(airspace.empArg.coreId);
                    this.selectFeature(feature);
                }
            }
        }
        catch (err)
        {
            // In the event of the unexpected return null.
            result.success = false;
            result.jsError = err;
        }
        return result;
    };
    /**
     Clears all selection placemarks from the map
     **/
    this.clearSelectedFeatures = function ()
    {
        var selectedFeatures = this.getSelections(),
                selectionArgs = {},
                i;

        for (i in selectedFeatures)
        {
            selectionArgs.coreId = i;
            selectionArgs.sendEvent = true;
            this.manageDeselect(selectionArgs);
        }
    };
    this.manageDeselect = function (args)
    {
        var eventData = [],
                feature, featureDeselected,
                i,
                featuresToDeselect = [];

        var isApiInitiatedSelection = this.defined(args.isApiInitiatedSelection) ? args.isApiInitiatedSelection : false;

        if (this.autoSelect && !isApiInitiatedSelection)
        {
            return;
        }

        this.entityCollection.suspendEvents();
        // If we are editing we should not be deselecting. Optionally, you can
        // bypass this with args.bypassEditCheck.
        if (this.drawData && this.drawData.isEditing && !args.bypassEditCheck)
        {
            emp.errorHandler.log({
                level: emp.typeLibrary.Error.level.MAJOR,
                message: "ge-map-engine.manageDeselect: Deselection functionality disabled when in an editing state."
            });
            return;
        }
        else
        {
            feature = this.getFeature(args.coreId || args.featureId);
//            if (feature.childrenFeatureKeys) {
//                for (i in feature.childrenFeatureKeys) {
//                    featuresToDeselect.push(this.getFeature(feature.childrenFeatureKeys[i]));
//                }
//            } else {
            if (feature)
            {
                if (feature.featureType === EmpCesiumConstants.featureType.COMPOUND_ENTITY)
                {
                    featureDeselected = feature;
                    for (var entityChildrenIndex = 0; entityChildrenIndex < featureDeselected._children.length; entityChildrenIndex++)
                    {
                        var entityChildren = featureDeselected._children[entityChildrenIndex];
                        featuresToDeselect.push(entityChildren);
                    }
                }
                else if (feature.id && typeof feature.id === "string" && feature.id.indexOf("label") > -1)
                {
                    // airspace label selected. deselect the airspace too
                    var aispaceId = feature.id.replace("_label", "");
                    var airspacePresent = this.isAirspacePresent(aispaceId);
                    if (airspacePresent)
                    {
                        featureDeselected = this.getFeature(aispaceId);
                        featuresToDeselect.push(featureDeselected);
                    }
                }
                else
                {
                    featureDeselected = feature;
                    featuresToDeselect.push(featureDeselected);
//                    var airspaceLabelPresent = this.isMultiPointPresent(feature.id + "_label");
//                    if (airspaceLabelPresent)
//                    {
//                        var airspaceLabel = this.getFeature(feature.id + "_label");
//                        featuresToDeselect.push(airspaceLabel);
//                    }

                }


                //}
                try
                {
                    for (i = 0; i < featuresToDeselect.length; i = i + 1)
                    {
                        this.deselectFeature(featuresToDeselect[i]);
                    }
                    eventData.push({
                        coreId: featureDeselected.coreId,
                        featureId: featureDeselected.featureId,
                        overlayId: featureDeselected.overlayId,
                        selectedId: "",
                        select: false
                    });
                }
                catch (err)
                {
                    emp.errorHandler.log({
                        level: emp.typeLibrary.Error.level.MAJOR,
                        message: "ge-map-engine.manageDeselect: There was an error deselecting item/sub item."
                    });
                    console.log(err);
                    this.selectFeature(feature);
                    return;
                }
                this.removeFeatureSelection(featureDeselected.id);
                if (args.sendEvent && (eventData.length > 0))
                {
                    this.empMapInstance.eventing.SelectionChange(eventData);
                }
            }
        }
        this.entityCollection.resumeEvents();
    };
    this.deselectFeature = function (feature)
    {
        var deselectProperties = this.getFeatureSelection(feature.id),
                i,
                multipoint,
                singlePoint,
                showlabelsAtCurrentCameraAltitude = true,
                rendererData,
                textureFromCanvas,
                billboard = undefined;

//        if ((this.cameraAltitude > this.maxAltitudeLabelVisible) || this.isSkyWithinMapVisibleArea()) {
//            showlabelsAtCurrentCameraAltitude = false;
//        }
        for (i in deselectProperties)
        {
            if (feature.billboard || feature.rectangle)
            {
                if (deselectProperties[i].symbolCode)
                {
                    if (feature.billboard)
                    {
                        feature.billboard = this.getSinglePointBillboard([deselectProperties[i]])[0];
                    }
                    if (feature.rectangle)
                    {
                        multipoint = this.getMultiPoint(deselectProperties[i].id);
                        deselectProperties[i].coordinates = cesiumEngine.utils.convertMilStdMultiPointCoordsToString({type: multipoint.data.type, coordinates: multipoint.coordinates});
                        deselectProperties[i].extent = this.getExtent();
                        deselectProperties[i].extent = deselectProperties[i].extent.west.toDeg() + "," + deselectProperties[i].extent.south.toDeg() + "," + deselectProperties[i].extent.east.toDeg() + "," + deselectProperties[i].extent.north.toDeg();
                        deselectProperties[i].standard = multipoint.standard;
                        //Get the old properties from the selected feature in order to return to original style.
                        //This will also get any updates or edits while the multipoint was selected
                        deselectProperties[i].properties = emp.helpers.copyObject(multipoint.properties);
                        deselectProperties[i].properties.modifiers = emp.typeLibrary.utils.milstd.convertModifierStringTo2525(deselectProperties[i].properties.modifiers, this.showLabels && showlabelsAtCurrentCameraAltitude);
                        var basicSymbolId = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(deselectProperties[i].symbolCode);
                        var symbolDefTable = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(basicSymbolId, deselectProperties[i].standard);
                        if (symbolDefTable.drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE)
                        {
                            // reverse order of AM from [width, height] to [height, width] to be compatible to renderer.
//                            if (deselectProperties[i].properties.modifiers.AM)
//                            {
//                                deselectProperties[i].properties.modifiers.AM.reverse();
//                            }
                        }
//                        var data = {};
//                        data.batch = [];
//                        data.scale = this.getScale();
//                        data.bbox = deselectProperties[i].extent;
//                        data.format = EmpCesiumConstants.MultiPointRenderType.SVG;
//                        data.pixelHeight = this.canvas.height;
//                        data.pixelWidth = this.canvas.width;
//                        //data.altMode = "clampToGround";
//                        data.fontInfo = cesiumEngine.utils.getFontInfo("arial", 10, "bold");
//                        var sceneInfo = {};
//                        var cameraInfo = {};
//                        sceneInfo.canvasClientWidth = this.canvas.width;
//                        sceneInfo.canvasClientHeight = this.canvas.height;
//                        sceneInfo.drawingBufferWidth = this.viewer.scene.drawingBufferWidth;
//                        sceneInfo.drawingBufferHeight = this.viewer.scene.drawingBufferHeight;
//                        data.sceneInfo = sceneInfo;
//                        data.cameraInfo = cameraInfo;
//                        data.sceneInfo.mapProjectionEllipsoid = this.ellipsoid;
//                        data.cameraInfo = this.saveCamera(this.viewer.camera);
//                        data.sceneInfo.frameState = {};
//                        data.sceneInfo.frameState.mode = this.viewer.scene.frameState.mode;
//                        data.sceneInfo.frameState.morphTime = this.viewer.scene.frameState.morphTime;
//
//                        var batchObject = {};
//                        batchObject.id = deselectProperties[i].id;
//                        batchObject.name = deselectProperties[i].name;
//                        batchObject.description = unescape(deselectProperties.description);
//                        batchObject.symbolID = deselectProperties[i].symbolCode;
//                        batchObject.scale = this.getScale();
//                        ;
//                        batchObject.bbox = deselectProperties[i].extent;
//                        batchObject.modifiers = deselectProperties[i].properties.modifiers;
//                        batchObject.modifiers.SVGFORMAT = 1;// for % notation  / 1 for base64 encoding.
//                        batchObject.format = EmpCesiumConstants.MultiPointRenderType.SVG;
//                        batchObject.pixelHeight = this.canvas.height;
//                        batchObject.pixelWidth = this.canvas.width;
//                        batchObject.symstd = deselectProperties[i].standard; //1;//1=2525C, 0=2525Bch2
//                        batchObject.fontInfo = cesiumEngine.utils.getFontInfo("arial", 10, "bold");
//                        batchObject.extrudedHeight = multipoint.extrudedHeight;
//                        batchObject.altMode = deselectProperties[i].coordinates, "clampToGround";
//                        batchObject.points = deselectProperties[i].coordinates;
//                        data.batch.push(batchObject);
//                        var multiPointObject = this.getMultiPoint(batchObject.id);
//                        multiPointObject.dataSentToSecRendererWorker = batchObject;
//                        this.secRendererWorker.DeSelection.postMessage(data);
                        //rendererData = sec.web.renderer.SECWebRenderer.RenderSymbol(deselectProperties[i].id, deselectProperties[i].name, unescape(deselectProperties[i].description), deselectProperties[i].symbolCode, deselectProperties[i].coordinates, "clampToGround", this.getScale(), deselectProperties[i].extent, deselectProperties[i].properties.modifiers, multipoint.multiPointRenderType, deselectProperties[i].standard, this.getConverter(this.viewer.scene));

                        rendererData = sec.web.renderer.SECWebRenderer.RenderSymbol2D(deselectProperties[i].id, deselectProperties[i].name, unescape(deselectProperties[i].description), deselectProperties[i].symbolCode, deselectProperties[i].coordinates, this.canvas.width, this.canvas.height, deselectProperties[i].extent, deselectProperties[i].properties.modifiers, multipoint.multiPointRenderType, deselectProperties[i].standard);
                        switch (feature.featureType)
                        {
                            case EmpCesiumConstants.featureType.ENTITY:
////                                textureFromCanvas = new Cesium.Texture({
////                                    context: this.viewer.scene._context,
////                                    source: rendererData.image,
////                                    //pixelFormat : imageryProvider.hasAlphaChannel ? PixelFormat.RGBA : PixelFormat.RGB
////                                    pixelFormat: Cesium.PixelFormat.RGBA
////                                });
                                if (feature.rectangle)
                                {
                                    var rectangle = this.Rectangle.fromDegrees(rendererData.west.x, rendererData.south.y, rendererData.east.x, rendererData.north.y);
                                    //var rectangle = this.Rectangle.fromDegrees(rendererData.geoTL.x, rendererData.geoBR.y, rendererData.geoBR.x, rendererData.geoTL.y);
                                    feature.rectangle.coordinates = rectangle;
                                    if (feature.rectangle.material)
                                    {
                                        feature.rectangle.material.image = rendererData.svg;
                                        //feature.rectangle.material.image = (this.defined(textureFromCanvas)) ? textureFromCanvas : feature.rectangle.material.image;
                                        //this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                                    }
                                }
//                                //feature.rectangle.material.image.setValue(textureFromCanvas);
                                break;
                            case EmpCesiumConstants.featureType.PRIMITIVE:
                                if (feature.material)
                                {
                                    feature.material.uniforms.image = rendererData.image;
                                }
                                else if (feature._appearance && feature._appearance.material)
                                {
                                    feature._appearance.material.uniforms.image = rendererData.image;
                                }
                                //feature.material.uniforms.image = rendererData.image;
                                feature.rectangle = this.Rectangle.fromDegrees(rendererData.west.x, rendererData.south.y, rendererData.east.x, rendererData.north.y);
                                //feature.rectangle = this.Rectangle.fromDegrees(rendererData.geoTL.x, rendererData.geoBR.y, rendererData.geoBR.x, rendererData.geoTL.y);
                                break;
                            default:
                        }
                        //this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                    }
                }
                else if (feature.billboard)
                {
                    feature.billboard.color = deselectProperties[i].pointColor;
                    feature.billboard.scale = deselectProperties[i].pointScale;
                }
            }
            if (feature.polyline && !feature.polyline.isPedestal)
            {
                feature.polyline.width.setValue(deselectProperties[i].polylineWidth);
                feature.polyline.material = deselectProperties[i].polylineMaterial;
            }
            if (feature.label)
            {
                feature.label.scale = deselectProperties[i].labelScale;
                feature.label.fillColor = deselectProperties[i].labelFillColor;
            }
            if (feature.corridor)
            {
                feature.corridor.width.setValue(deselectProperties[i].corridorWidth);
                feature.corridor.material = deselectProperties[i].corridorMaterial;
                feature.corridor.outlineColor = deselectProperties[i].corridorOutlineColor;
                feature.corridor.outlineWidth = deselectProperties[i].corridorOutlineWidth;

            }
            if (feature.polygon)
            {
                feature.polygon.outlineColor.setValue(deselectProperties[i].polygonOutlineColor);
                feature.polygon.material = deselectProperties[i].polygonMaterial;
            }
            if (feature.ellipse)
            {
                feature.ellipse.outlineColor.setValue(deselectProperties[i].ellipseOutlineColor);
                if (feature.ellipse.material)
                {
                    feature.ellipse.material = deselectProperties[i].ellipseMaterial;
                }

            }
            if (this.isAirspacePresent(feature.id))
            {
                if (feature._appearance)
                {
                    feature._appearance.material.uniforms.color = deselectProperties[i].polygonOutlineColor;
                }
            }
            if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION)
            {
                if (deselectProperties[i].symbolCode)
                {
                    if (this.isSinglePointPresent(feature.id))
                    {
                        singlePoint = this.getSinglePoint(deselectProperties[i].id);
                        deselectProperties[i].selected = false;
                        deselectProperties[i].properties = emp.helpers.copyObject(singlePoint.properties);
                        billboard = this.getSinglePointBillboardPrimitive([deselectProperties[i]])[0];
                        if (singlePoint.isClusterIcon)
                        {

                            var afiliationLetter = singlePoint.symbolCode.substring(1, 2);
                            var highScaleImage;

                            switch (afiliationLetter.toLowerCase())
                            {
                                case "h":
                                    highScaleImage = this.highScaleImage.highScaleImageRed;
                                    break;
                                case "f":
                                    highScaleImage = this.highScaleImage.highScaleImageBlue;
                                    break;
                                case "n":
                                    highScaleImage = this.highScaleImage.highScaleImageGreen;
                                    break;
                                case "u":
                                    highScaleImage = this.highScaleImage.highScaleImageYellow;
                                    break;
                                default:
                                    highScaleImage = this.highScaleImage.highScaleImageYellow;
                                    break;
                            }
                            billboard.image = 'data:image/svg+xml,' + highScaleImage;
                        }

                        var billboardCollection = feature;
                        billboardCollection.pixelOffset = billboard.pixelOffset;
                        billboardCollection.scale = billboard.scale;
                        billboardCollection.alignedAxis = billboard.alignedAxis;
                        billboardCollection.scaleByDistance = billboard.scaleByDistance;
                        billboardCollection.image = billboard.image;
                        billboardCollection.get(0).image = billboard.image;
                        billboardCollection.updateCount = billboardCollection.updateCount + 1;
                        this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                    }
                }

            }
        }//for (i in deselectProperties)
    };
    /*
     * @desc Manages selection for the item passed in.
     *
     * @param {object} args - The object containing item information for the selection operation.
     * @property {object} args.overlayId (optional) - (feature in overlay) The id of the overlay which contains features and their sub-items.
     * If this property is being populated from a Google Earth event object, it would
     * correspond to the parent KML folder which encompasses the parent KML folder of
     * the KML placemark to be selected (the parent object of the parent object of
     * of the KML placemark to be selected)
     * @property {object} args.parentId (optional) - (feature in feature) The id of the parent feature which contains features and their sub-items.
     * If this property is being populated from a Google Earth event object, it would
     * correspond to the parent KML folder which encompasses the parent KML folder of
     * the KML placemark to be selected (the parent object of the parent object of
     * of the KML placemark to be selected)
     * @property {object} args.featureId (required) - The id of the feature to be selected.
     * If this property is being populated from a Google Earth event object, it would
     * correspond to a KML Folder encompassing the KML placemark to be selected (the parent object
     * of the KML placemark to be selected)
     * @property {object} args.selectedId (optional) - The id of the sub-item within a feature to be selected.
     * If this property is being populated from a Google Earth event object, it would
     * correspond to the KML placemark to be selected inside of a KML folder (the child object of
     * the KML folder)
     * @return {object} result - contains a success and message property indicating
     * whether the execution of the function succeeded or failed
     * @property {boolean} result.success - indicates whether the function succeeded or not
     * @property {string} result.message - message explaining why the function failed
     */
    this.manageSelect = function (args)
    {
        var eventData = [],
                featuresToSelect = [],
                deselectProperties = {},
                feature, featureSelected, isClusterIcon = false,
                result,
                i;

        var isApiInitiatedSelection = this.defined(args.isApiInitiatedSelection) ? args.isApiInitiatedSelection : false;
        if (this.autoSelect && !isApiInitiatedSelection)
        {
            return;
        }
        this.entityCollection.suspendEvents();
        // If we are editing we should not be selecting. Optionally, you can
        // bypass this with args.bypassEditCheck. This is for the case where
        // we need to re-highlight a symbol after it has been edited.
        if (this.drawData && (this.drawData.isEditing || this.drawData.isDrawing) && !args.bypassEditCheck)
        {
            emp.errorHandler.log({
                level: emp.typeLibrary.Error.level.MAJOR,
                message: "ge-map-engine.manageSelect: Selection functionality disabled when in an editing state."
            });
            return;
        }
//        else
//        {
        if (!this.defined(args.featureIds))
        {
            // featureIds is set when autoselect is false (mouse clicks in v2). so in v3 create an empty  array
            args.featureIds = [];
            if (args.featureId)
            {
                args.featureIds.push(args.featureId);
            }
        }

        for (var index = 0; index < args.featureIds.length; index++)
        {
            var id = args.featureIds[index];
            //var layer = this.getLayer(args.overlayId);
            feature = this.getFeature(id);
            if (!this.defined(feature))
            {
                continue;
            }
            //feature = this.getFeature(args.coreId || args.featureId);
            if (feature && this.isSinglePointPresent(feature.id))
            {
//                if (this.getSinglePoint(feature.id).isClusterIcon)
//                {
//                    isClusterIcon = true;
//                }
            }
            //entity = this.entityCollection.getById(args.featureId);
//            if (feature.childrenFeatureKeys) {
//                for (i in feature.childrenFeatureKeys) {
//                    if (this.getFeature(feature.childrenFeatureKeys[i]))
//                    {
//                        featuresToSelect.push(this.getFeature(feature.childrenFeatureKeys[i]));
//                    }
//                }
//            } else {
            if (feature && isClusterIcon)
            {
                continue;
            }

            if (feature.id && typeof feature.id === "string" && feature.id.indexOf("label") > -1)
            {
                // airspace label selected. select the airspace too
                var aispaceId = feature.id.replace("_label", "");
                var airspacePresent = this.isAirspacePresent(aispaceId);
                if (airspacePresent)
                {
                    featureSelected = this.getFeature(aispaceId);
                }
            }
            else
            {
                featureSelected = feature;
//                    var airspaceLabelPresent = this.isMultiPointPresent(feature.id + "_label");
//                    if (airspaceLabelPresent)
//                    {
//                        var airspaceLabel = this.getFeature(empCesium.drawData.airspace.Id + "_label");
//                        featuresToSelect.push(airspaceLabel);
//                    }
            }
            if (index === 0) // just select top feature and ignore the rest. The rest of the features are needed to be sent in the event data.
            {
                if (featureSelected.featureType === EmpCesiumConstants.featureType.COMPOUND_ENTITY)
                {
                    for (var entityChildrenIndex = 0; entityChildrenIndex < featureSelected._children.length; entityChildrenIndex++)
                    {
                        var entityChildren = featureSelected._children[entityChildrenIndex];
                        featuresToSelect.push(entityChildren);
                    }
                }
                else
                {
                    featuresToSelect.push(featureSelected);
                }
            }
            //send
            eventData.push({
                coreId: featureSelected.coreId || featureSelected._id || featureSelected.id,
                featureId: featureSelected.featureId,
                overlayId: featureSelected.overlayId,
                //  selectedId: "",
                select: true
            });

        }//for
        try
        {
            // highlight the entity.
            for (i = 0; i < featuresToSelect.length; i = i + 1)
            {
                result = this.selectFeature(featuresToSelect[i]);
                if (result)
                {
                    deselectProperties[featuresToSelect[i].id] = result;
                    if (Object.getOwnPropertyNames(deselectProperties).length > 0)
                    {
                        this.storeFeatureSelection(featuresToSelect[i].id, deselectProperties);
                    }
                }
            }
        }
        catch (err)
        {
            // Log the error.
            emp.errorHandler.log({
                level: emp.typeLibrary.Error.level.MAJOR,
                message: "ge-map-engine.manageSelect: There was an error selecting item/sub item.",
                jsError: err
            });
            this.deselectFeature(featureSelected);
            return;
        }
//                if (Object.getOwnPropertyNames(deselectProperties).length > 0)
//                {
//                    this.storeFeatureSelection(featureSelected.id, deselectProperties);
//                }
        // }
        // }//else
        // Send out the event for the feature and sub-items that
        // have been selected.
        if (args.sendEvent && (eventData.length > 0))
        {
            this.empMapInstance.eventing.SelectionChange(eventData);
        }

        this.entityCollection.resumeEvents();
    };
    this.selectFeature = function (feature)
    {
        var selectionProperties = {
            id: feature.id,
            overlayId: feature.overlayId
        },
        showlabelsAtCurrentCameraAltitude = true,
                rendererData,
                multipoint,
                textureFromCanvas,
                isClusterIcon = false,
                highScaleSelectedImage = this.highScaleImage.highScaleImageYellow,
                billboard = undefined;

        // Copying the properties object just in case this entity
        // is referenced later during a transaction pause.
        selectionProperties.properties = emp.$.extend(true, {}, feature.properties);
//        if ((this.cameraAltitude > this.maxAltitudeLabelVisible) || this.isSkyWithinMapVisibleArea) {
//            showlabelsAtCurrentCameraAltitude = false;
//        }
        switch (feature.featureType)
        {
            case EmpCesiumConstants.featureType.ENTITY:
                if (feature.billboard)
                {
                    if (feature.symbolCode)
                    {
                        // Create a yellow MIL-STD-2525 single point.
//                        if (feature.billboard)
//                        {
//                            selectionProperties.symbolCode = feature.symbolCode;
//                            selectionProperties.lat = feature.coordinates[0];
//                            selectionProperties.lon = feature.coordinates[1];
//                            selectionProperties.name = feature.name;
//                            //selectionProperties.scale = feature.billboard.scale;
//                            selectionProperties.properties = emp.helpers.copyObject(feature.properties);
//                            var basicSymbolID = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(selectionProperties.symbolCode);
//                            switch (basicSymbolID)
//                            {
//                                case "S*U*WDMG--*****":
//                                case "S*U*WDMM--*****":
//                                case "S*U*WDM---*****":
//                                case "S*U*ND----*****":
//                                case "S*U*X-----*****":
//                                    selectionProperties.properties.fillColor = 'FF' + this.selectionColorHex;
//                                    //selectionProperties.properties.fillColor = 'FF' + EmpCesiumConstants.selectionProperties.COLOR_HEX;
//                                    break;
//                                default:
//                                    selectionProperties.properties.lineColor = 'FF' + this.selectionColorHex;
//                                    // selectionProperties.properties.lineColor = 'FF' + EmpCesiumConstants.selectionProperties.COLOR_HEX;
//                                    break;
//                            }
//                            feature.billboard = this.getSinglePointBillboard([selectionProperties])[0];
//                            //feature.billboard.scale = this.selectionScale;
//                            delete selectionProperties.properties.lineColor;
//                            delete selectionProperties.properties.fillColor;
//                            if (feature.properties.modifiers)
//                            {
//                                delete feature.properties.modifiers.LINECOLOR;
//                                delete feature.properties.modifiers.FILLCOLOR;
//                            }
//                            else
//                            {
//                                feature.properties.modifiers = {};
//                            }
//                        }
//                        if (rendererData !== undefined && rendererData !== null)
//                        {
//                            feature.rectangle.material.image = rendererData.image;
//                            //feature.rectangle.material.image.setValue(rendererData.image);
//                        }
//                        this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                    }
                    else
                    {
                        if (feature.billboard.color)
                        {
                            selectionProperties.pointColor = feature.billboard.color.getValue();
                        }
                        else
                        {
                            selectionProperties.pointColor = undefined;
                        }
                        if (!this.defined(feature.billboard.scale))
                        {
                            feature.billboard.scale = 1;
                        }
                        selectionProperties.pointScale = feature.billboard.scale.getValue();
                        feature.billboard.color = this.selectionColor;
                        //feature.billboard.color = EmpCesiumConstants.selectionProperties.COLOR;

                        //changing the scale is affecting the calculations in the starburst.  OJO
                        feature.billboard.scale = feature.billboard.scale.getValue() * this.selectionScale;
                    }
                }
                if (feature.polyline && !feature.polyline.isPedestal)
                {
                    selectionProperties.polylineMaterial = feature.polyline.material;
                    selectionProperties.polylineWidth = feature.polyline.width.getValue();

                    if (feature.polyline.material)
                    {
                        feature.polyline.material = new this.PolylineOutlineMaterialProperty({
                            color: feature.polyline.material.color,
                            outlineColor: this.selectionColor,
                            //outlineColor: EmpCesiumConstants.selectionProperties.COLOR,
                            outlineWidth: EmpCesiumConstants.selectionProperties.WIDTH
                        });
                    }




                }
                if (feature.label)
                {
                    if (feature.label.fillColor)
                    {
                        selectionProperties.labelFillColor = feature.label.fillColor.getValue();
                    }
                    else
                    {
                        selectionProperties.labelFillColor = undefined;
                    }
                    if (this.defined(feature.label.scale))
                    {
                        selectionProperties.labelScale = feature.label.scale.getValue();
                    }
                    else
                    {
                        feature.label.scale = 1;
                        selectionProperties.labelScale = 1;
                    }
                    feature.label.fillColor = this.selectionColor;
                    //feature.label.fillColor = EmpCesiumConstants.selectionProperties.COLOR;
                    //changing the scale is affecting the calculations in the starburst.
                    //feature.label.scale = feature.label.scale.getValue() + EmpCesiumConstants.selectionProperties.SCALE;
                }
                if (feature.corridor)
                {
                    selectionProperties.corridorMaterial = feature.corridor.material;
                    selectionProperties.corridorWidth = feature.corridor.width.getValue();
                    selectionProperties.corridorOutlineColor = feature.corridor.outlineColor;
                    selectionProperties.corridorOutlineWidth = feature.corridor.outlineWidth;
                    feature.corridor.material = new this.ColorMaterialProperty(this.selectionColor);
                    //feature.corridor.material = new this.ColorMaterialProperty(EmpCesiumConstants.selectionProperties.COLOR);
                    feature.corridor.outlineColor = this.selectionColor;
                    //feature.corridor.outlineColor = EmpCesiumConstants.selectionProperties.COLOR;
                    feature.corridor.outlineWidth = EmpCesiumConstants.selectionProperties.WIDTH;
                }
                if (feature.polygon)
                {
                    selectionProperties.polygonOutlineColor = feature.polygon.outlineColor.getValue();
                    if (feature.polygon.material)
                    {
                        selectionProperties.polygonMaterial = feature.polygon.material;
                        feature.polygon.material = this.selectionColor.withAlpha(0.35);
                    }
                    // feature.polygon.material = this.selectionColor.withAlpha(0.35);
                    //feature.polygon.material = EmpCesiumConstants.selectionProperties.COLOR.withAlpha(0.35);
                    feature.polygon.outlineColor.setValue(this.selectionColor);
                    //feature.polygon.outlineColor.setValue(EmpCesiumConstants.selectionProperties.COLOR);
                }
                if (feature.ellipse)
                {
                    selectionProperties.ellipseOutlineColor = feature.ellipse.outlineColor.getValue();
                    if (feature.ellipse.material)
                    {
                        selectionProperties.ellipseMaterial = feature.ellipse.material;
                        feature.ellipse.material = this.selectionColor.withAlpha(0.35);
                    }
                    //feature.ellipse.material = this.selectionColor.withAlpha(0.35);
                    // feature.polygon.material = this.selectionColor.withAlpha(0.35);
                    //feature.polygon.material = EmpCesiumConstants.selectionProperties.COLOR.withAlpha(0.35);
                    feature.ellipse.outlineColor.setValue(this.selectionColor);
                    //feature.polygon.outlineColor.setValue(EmpCesiumConstants.selectionProperties.COLOR);
                }
                if (this.isMultiPointPresent(feature.id))
                {
                    multipoint = this.getMultiPoint(feature.id);
                    selectionProperties = {
                        symbolCode: multipoint.symbolCode,
                        standard: multipoint.standard,
                        name: multipoint.name,
                        id: multipoint.id,
                        overlayId: multipoint.overlayId,
                        altitude: multipoint.altitude,
                        description: multipoint.description
                    };
                    selectionProperties.properties = emp.helpers.copyObject(multipoint.properties);
                    selectionProperties.properties.modifiers = emp.typeLibrary.utils.milstd.convertModifierStringTo2525(selectionProperties.properties.modifiers, this.showLabels && showlabelsAtCurrentCameraAltitude);
                    selectionProperties.properties.modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = this.selectionColorHex;
                    //selectionProperties.properties.modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = EmpCesiumConstants.selectionProperties.COLOR_HEX;

//                     if ( selectionProperties.properties.modifiers.hasOwnProperty(emp.typeLibrary.utils.milstd.Modifiers.UNIQUE_DESIGNATOR_1) &&
//                            this.defined(selectionProperties.properties.modifiers[emp.typeLibrary.utils.milstd.Modifiers.UNIQUE_DESIGNATOR_1]) )
//                    {
//                        if ((selectionProperties.properties.modifiers[emp.typeLibrary.utils.milstd.Modifiers.UNIQUE_DESIGNATOR_1].toLowerCase()  === "road") ||
//                                (selectionProperties.properties.modifiers[emp.typeLibrary.utils.milstd.Modifiers.UNIQUE_DESIGNATOR_1].toLowerCase()  === "route"))
//                        {
                    selectionProperties.coordinates = cesiumEngine.utils.convertMilStdMultiPointCoordsToString({type: multipoint.data.type, coordinates: multipoint.coordinates});
                    selectionProperties.extent = this.getExtent();
                    selectionProperties.extent = selectionProperties.extent.west.toDeg() + "," + selectionProperties.extent.south.toDeg() + "," + selectionProperties.extent.east.toDeg() + "," + selectionProperties.extent.north.toDeg();

                    if (selectionProperties.properties.modifiers.hasOwnProperty(emp.typeLibrary.utils.milstd.Modifiers.ADDITIONAL_INFO_1) &&
                            this.defined(selectionProperties.properties.modifiers[emp.typeLibrary.utils.milstd.Modifiers.ADDITIONAL_INFO_1]))
                    {
                        var selectedAdditionalInfo = "";
                        var segmentColorArray = selectionProperties.properties.modifiers[emp.typeLibrary.utils.milstd.Modifiers.ADDITIONAL_INFO_1].split(",");
                        if (segmentColorArray.length > 0)
                        {
                            for (var index = 0; index < segmentColorArray.length; index++)
                            {
                                var segmentColor = segmentColorArray[index].split(":");
                                if (index !== segmentColorArray.length - 1)
                                {
                                    selectedAdditionalInfo = segmentColor[0] + ":" + this.selectionColorHex + ",";
                                    //selectedAdditionalInfo = segmentColor[0] + ":" + EmpCesiumConstants.selectionProperties.COLOR_HEX + ",";
                                }
                            }
                            // content of modifier represents segment colors. set all colors to selected color ..yellow
                            selectionProperties.properties.modifiers[emp.typeLibrary.utils.milstd.Modifiers.ADDITIONAL_INFO_1] = selectedAdditionalInfo;
                        }
                    }
                    var basicSymbolId = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(selectionProperties.symbolCode);
                    var symbolDefTable = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(basicSymbolId, selectionProperties.standard);
                    if (symbolDefTable.drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE)
                    {
                        // reverse order of AM from [width, height] to [height, width] to be compatible to renderer.
//                        if (selectionProperties.properties.modifiers.AM)
//                        {
//                            selectionProperties.properties.modifiers.AM.reverse();
//                        }
                    }
//                    var data = {};
//                    data.batch = [];
//                    data.scale = this.getScale();
//                    data.bbox = selectionProperties.extent;
//                    data.format = EmpCesiumConstants.MultiPointRenderType.SVG;
//                    data.pixelHeight = this.canvas.height;
//                    data.pixelWidth = this.canvas.width;
//                    //data.altMode = "clampToGround";
//                    data.fontInfo = cesiumEngine.utils.getFontInfo("arial", 10, "bold");
//                    var sceneInfo = {};
//                    var cameraInfo = {};
//                    sceneInfo.canvasClientWidth = this.canvas.width;
//                    sceneInfo.canvasClientHeight = this.canvas.height;
//                    sceneInfo.drawingBufferWidth = this.viewer.scene.drawingBufferWidth;
//                    sceneInfo.drawingBufferHeight = this.viewer.scene.drawingBufferHeight;
//                    data.sceneInfo = sceneInfo;
//                    data.cameraInfo = cameraInfo;
//                    data.sceneInfo.mapProjectionEllipsoid = this.ellipsoid;
//                    data.cameraInfo = this.saveCamera(this.viewer.camera);
//                    data.sceneInfo.frameState = {};
//                    data.sceneInfo.frameState.mode = this.viewer.scene.frameState.mode;
//                    data.sceneInfo.frameState.morphTime = this.viewer.scene.frameState.morphTime;
//
//                    var batchObject = {};
//                    batchObject.id = selectionProperties.id;
//                    batchObject.name = selectionProperties.name;
//                    batchObject.description = unescape(selectionProperties.description);
//                    batchObject.symbolID = selectionProperties.symbolCode;
//                    batchObject.scale = this.getScale();
//                    ;
//                    batchObject.bbox = selectionProperties.extent;
//                    batchObject.modifiers = selectionProperties.properties.modifiers;
//                    batchObject.modifiers.SVGFORMAT = 1;// for % notation  / 1 for base64 encoding.
//                    batchObject.format = EmpCesiumConstants.MultiPointRenderType.SVG;
//                    batchObject.pixelHeight = this.canvas.height;
//                    batchObject.pixelWidth = this.canvas.width;
//                    batchObject.symstd = selectionProperties.standard; //1;//1=2525C, 0=2525Bch2
//                    batchObject.fontInfo = cesiumEngine.utils.getFontInfo("arial", 10, "bold");
//                    batchObject.extrudedHeight = multipoint.extrudedHeight;
//                    batchObject.altMode = selectionProperties.coordinates, "clampToGround";
//                    batchObject.points = selectionProperties.coordinates;
//                    data.batch.push(batchObject);
//                    var multiPointObject = this.getMultiPoint(batchObject.id);
//                    multiPointObject.dataSentToSecRendererWorker = batchObject;
//                    this.secRendererWorker.Selection.postMessage(data);
//                    rendererData = sec.web.renderer.SECWebRenderer.RenderSymbol(selectionProperties.id, selectionProperties.name, unescape(selectionProperties.description), selectionProperties.symbolCode, selectionProperties.coordinates, "clampToGround", this.getScale(), selectionProperties.extent, selectionProperties.properties.modifiers, EmpCesiumConstants.MultiPointRenderType.SVG, selectionProperties.standard, this.getConverter(this.viewer.scene));
//
                    rendererData = sec.web.renderer.SECWebRenderer.RenderSymbol2D(selectionProperties.id, selectionProperties.name, unescape(selectionProperties.description), selectionProperties.symbolCode, selectionProperties.coordinates, this.canvas.width, this.canvas.height, selectionProperties.extent, selectionProperties.properties.modifiers, EmpCesiumConstants.MultiPointRenderType.SVG, selectionProperties.standard);
                    if (rendererData !== undefined && rendererData !== null)
                    {
////                        textureFromCanvas = new Cesium.Texture({
////                            context: this.viewer.scene._context,
////                            source: rendererData.image,
////                            //pixelFormat : imageryProvider.hasAlphaChannel ? PixelFormat.RGBA : PixelFormat.RGB
////                            pixelFormat: Cesium.PixelFormat.RGBA
////                        });
//                        // if (feature.rectangle)
//                        // {
//                        //     var rectangle = this.Rectangle.fromDegrees(rendererData.west.x,rendererData.south.y,rendererData.east.x, rendererData.north.y) ;
//                        //var rectangle = this.Rectangle.fromDegrees(rendererData.geoTL.x, rendererData.geoBR.y, rendererData.geoBR.x, rendererData.geoTL.y);
//                        //     feature.rectangle.coordinates = rectangle;
////                            //this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
////                        }
                        if (feature.rectangle)
                        {
                            var rectangle = this.Rectangle.fromDegrees(rendererData.west.x, rendererData.south.y, rendererData.east.x, rendererData.north.y);
                            feature.rectangle.coordinates = rectangle;
                            if (feature.rectangle.material)
                            {
                                feature.rectangle.material.image = rendererData.svg;
                                //feature.rectangle.material.image = (this.defined(textureFromCanvas)) ? textureFromCanvas : feature.rectangle.material.image;
                                this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                            }
                        }

                        // feature.rectangle = this.Rectangle.fromDegrees(rendererData.geoTL.x, rendererData.geoBR.y, rendererData.geoBR.x, rendererData.geoTL.y);
                        //}
                    }
                }
                break;

            case EmpCesiumConstants.featureType.PRIMITIVE:
                if (this.isMultiPointPresent(feature.id))
                {
                    multipoint = this.getMultiPoint(feature.id);
                    selectionProperties = {
                        symbolCode: multipoint.symbolCode,
                        standard: multipoint.standard,
                        name: multipoint.name,
                        id: multipoint.id,
                        overlayId: multipoint.overlayId,
                        altitude: multipoint.altitude,
                        description: multipoint.description
                    };
                    selectionProperties.properties = emp.helpers.copyObject(multipoint.properties);
                    selectionProperties.properties.modifiers = emp.typeLibrary.utils.milstd.convertModifierStringTo2525(selectionProperties.properties.modifiers, this.showLabels && showlabelsAtCurrentCameraAltitude);
                    selectionProperties.properties.modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = this.selectionColorHex;
                    //selectionProperties.properties.modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = EmpCesiumConstants.selectionProperties.COLOR_HEX;
                    selectionProperties.coordinates = cesiumEngine.utils.convertMilStdMultiPointCoordsToString({type: multipoint.data.type, coordinates: multipoint.coordinates});
                    selectionProperties.extent = this.getExtent();
                    selectionProperties.extent = selectionProperties.extent.west.toDeg() + "," + selectionProperties.extent.south.toDeg() + "," + selectionProperties.extent.east.toDeg() + "," + selectionProperties.extent.north.toDeg();
                    rendererData = sec.web.renderer.SECWebRenderer.RenderSymbol(selectionProperties.id, selectionProperties.name, unescape(selectionProperties.description), selectionProperties.symbolCode, selectionProperties.coordinates, "clampToGround", this.getScale(), selectionProperties.extent, selectionProperties.properties.modifiers, EmpCesiumConstants.MultiPointRenderType.SVG, selectionProperties.standard);

                    //rendererData = sec.web.renderer.SECWebRenderer.RenderSymbol2D(selectionProperties.id, selectionProperties.name, unescape(selectionProperties.description), selectionProperties.symbolCode, selectionProperties.coordinates, this.canvas.width, this.canvas.height, selectionProperties.extent, selectionProperties.properties.modifiers, EmpCesiumConstants.MultiPointRenderType.SVG, selectionProperties.standard);
                    if (rendererData !== undefined && rendererData !== null)
                    {
                        if (feature.material)
                        {
                            feature.material.uniforms.image = rendererData.image;
                        }
                        else if (feature._appearance && feature._appearance.material)
                        {
                            feature._appearance.material.uniforms.image = rendererData.image;
                        }
                        feature.rectangle = this.Rectangle.fromDegrees(rendererData.geoTL.x, rendererData.geoBR.y, rendererData.geoBR.x, rendererData.geoTL.y);
                    }
                }
                else if (this.isAirspacePresent(feature.id))
                {
                    if (feature._appearance)
                    {
                        selectionProperties.polygonOutlineColor = feature._appearance.material.uniforms.color;
                        var material = new this.Material.fromType("Color");
                        material.uniforms.color = this.selectionColor.withAlpha(0.3);
                        //material.uniforms.color = EmpCesiumConstants.selectionProperties.COLOR.withAlpha(0.3);
                        feature._appearance.material.uniforms.color = material.uniforms.color;
                    }
                    else if (feature.appearance)
                    {
                        selectionProperties.polygonOutlineColor = feature.appearance.material.uniforms.color;
                        var material = new this.Material.fromType("Color");
                        material.uniforms.color = this.selectionColor.withAlpha(0.3);
                        //material.uniforms.color = EmpCesiumConstants.selectionProperties.COLOR.withAlpha(0.3);
                        feature.appearance.material.uniforms.color = material.uniforms.color;
                    }
                }
                break;
            case EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION:
//                if (this.isMultiPointPresent(feature.id))
//                {
//                    multipoint = this.getMultiPoint(feature.id);
//                    selectionProperties = {
//                        symbolCode: multipoint.symbolCode,
//                        name: multipoint.name,
//                        id: multipoint.id,
//                        overlayId: multipoint.overlayId,
//                        altitude: multipoint.altitude,
//                        description: multipoint.description,
//                    };
//                    selectionProperties.properties = emp.helpers.copyObject(multipoint.properties);
//                    selectionProperties.properties.modifiers = emp.typeLibrary.utils.milstd.convertModifierStringTo2525(selectionProperties.properties.modifiers, this.showLabels && showlabelsAtCurrentCameraAltitude);
//                    selectionProperties.properties.modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = EmpCesiumConstants.selectionProperties.COLOR_HEX;
//                    selectionProperties.properties.modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineWidth] = multipoint.properties.modifiers["LINEWIDTH"];
//                    if (multipoint.properties.modifiers.ICONCOLOR)
//                    {
//                        //KEEP THE orginal fill color whern selecting. the convertStringsToModifiers strips out the styles form the modifiers.
//                        selectionProperties.properties.modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor] = multipoint.properties.modifiers.ICONCOLOR;
//                    }
//                    selectionProperties.coordinates = cesiumEngine.utils.convertMilStdMultiPointCoordsToString({
//                        type: multipoint.data.type,
//                        coordinates: multipoint.coordinates
//                    });
//                    selectionProperties.extent = this.getExtent();
//                    selectionProperties.extent = selectionProperties.extent.west.toDeg() + "," + selectionProperties.extent.south.toDeg() + "," + selectionProperties.extent.east.toDeg() + "," + selectionProperties.extent.north.toDeg();
//                    rendererData = sec.web.renderer.SECWebRenderer.RenderSymbol2D(
//                            selectionProperties.id, selectionProperties.name, unescape(selectionProperties.description),
//                            selectionProperties.symbolCode, selectionProperties.coordinates, this.canvas.width,
//                            this.canvas.height, selectionProperties.extent, selectionProperties.properties.modifiers,
//                            EmpCesiumConstants.MultiPointRenderType.CANVAS);
//                    //store original  line color
//                    selectionProperties.properties.modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = multipoint.properties.modifiers["LINECOLOR"];
//                    selectionProperties.properties.modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineWidth] = multipoint.properties.modifiers["LINEWIDTH"];
//                    if (rendererData !== undefined && rendererData !== null)
//                    {
//                        if (feature.material)
//                        {
//                            feature.material.uniforms.image = rendererData.image;
//                        }
//                        else if (feature._appearance && feature._appearance.material)
//                        {
//                            feature._appearance.material.uniforms.image = rendererData.image;
//                        }
//                        feature.rectangle = this.Rectangle.fromDegrees(rendererData.geoTL.x, rendererData.geoBR.y, rendererData.geoBR.x, rendererData.geoTL.y);
//                    }
//                    selectionProperties.properties.modifiers = feature.properties.modifiers;
//                }
                //else if (this.isSinglePointPresent(feature.id))
                if (this.isSinglePointPresent(feature.id))
                {
                    if (this.getSinglePoint(feature.id).isClusterIcon)
                    {
                        isClusterIcon = true;
                    }

                    if (feature.symbolCode)
                    {
                        // Create a yellow MIL-STD-2525 single point.
                        selectionProperties.symbolCode = feature.symbolCode;
                        selectionProperties.lon = feature.coordinates[0];
                        selectionProperties.lat = feature.coordinates[1];
                        selectionProperties.altitude = feature.coordinates[2];
                        selectionProperties.name = feature.name;
                        selectionProperties.selected = true;
                        selectionProperties.properties = emp.helpers.copyObject(feature.properties);
                        selectionProperties.properties.scale = feature.get(0).scale;
                        var basicSymbolID = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(selectionProperties.symbolCode);
                        switch (basicSymbolID)
                        {
                            case "S*U*WDMG--*****":
                            case "S*U*WDMM--*****":
                            case "S*U*WDM---*****":
                            case "S*U*ND----*****":
                            case "S*U*X-----*****":
                                selectionProperties.properties.fillColor = this.selectionColorHex;
                                //selectionProperties.properties.fillColor = 'FF' + EmpCesiumConstants.selectionProperties.COLOR_HEX;
                                break;
                            default:
                                selectionProperties.properties.lineColor = this.selectionColorHex;
                                //selectionProperties.properties.lineColor = 'FF' + EmpCesiumConstants.selectionProperties.COLOR_HEX;
                                break;
                        }

                        billboard = this.getSinglePointBillboardPrimitive([selectionProperties])[0];
                        if (isClusterIcon)
                        {
                            billboard.image = 'data:image/svg+xml,' + highScaleSelectedImage;
                        }
//                        feature.get(0).image = billboard.image;
//                        feature.get(0).pixelOffset = billboard.pixelOffset;
//                        feature.get(0).scale = billboard.scale;
//                        feature.get(0).alignedAxis = billboard.alignedAxis;
//                        feature.get(0).scaleByDistance = billboard.scaleByDistance;
//                        feature.get(0).rotation = feature.get(0).rotation;
                        billboard.rotation = feature.get(0).rotation;
                        billboard.position = this.Cartesian3.fromDegrees(selectionProperties.lon, selectionProperties.lat, selectionProperties.altitude);
                        //feature.updateCount += 1;
                        //save unselected style colors after calling the renderer
                        selectionProperties.properties.lineColor = feature.properties.lineColor;
                        selectionProperties.properties.fillColor = feature.properties.fillColor;
                        if (feature.properties.modifiers)
                        {
                            delete feature.properties.modifiers.LINECOLOR;
                            delete feature.properties.modifiers.FILLCOLOR;
                        }
                        else
                        {
                            feature.properties.modifiers = {};
                        }


                        var billboardCollection = feature;
                        billboardCollection.pixelOffset = billboard.pixelOffset;
                        billboardCollection.scale = billboard.scale;
                        billboardCollection.alignedAxis = billboard.alignedAxis;
                        billboardCollection.scaleByDistance = billboard.scaleByDistance;
                        billboardCollection.image = billboard.image;
                        billboardCollection.get(0).image = billboard.image;
                        billboardCollection.get(0).pixelOffset = billboard.pixelOffset;
                        // scale already sent to renderer ...  setting scale here shift the pivot point     billboardCollection.get(0).scale = (!this.defined(billboardCollection.get(0).scale) || billboardCollection.get(0).scale === 0)?this.selectionScale:billboardCollection.get(0).scale * this.selectionScale;
                        billboardCollection.updateCount = billboardCollection.updateCount + 1;
                        this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));

                    }
                }
                break;
            default:
                break;
        }
        return selectionProperties;
    };



    this.getConverter = function (scene)
    {
        var converter = null;
        try
        {
            converter =
            {
                normalize: false,
                //required interface
                /**
                 * 
                 * @param {type} coord must accept type armyc2.c2sd.graphics2d.Point2D
                 * @returns {armyc2.c2sd.graphics2d.Point2D} must return type armyc2.c2sd.graphics2d.Point2D
                 */
                GeoToPixels: function (coord)
                {
                    var position = Cesium.Cartesian3.fromDegrees(coord.x, coord.y);
                    var result = new Cesium.Cartesian2(0, 0);
                    var cart3 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, position, result);
                    //you need to return armyc2.c2sd.graphics2d.Point2D
                    var pt2d = new armyc2.c2sd.graphics2d.Point2D(result.x, result.y);
                    return pt2d;
                },
                //required interface
                /**
                 * 
                 * @param {type} pixel  must accept type armyc2.c2sd.graphics2d.Point2D
                 * @returns {undefined} must return type armyc2.c2sd.graphics2d.Point2D
                 */
                PixelsToGeo: function (pixel)
                {
                    var position = scene.camera.pickEllipsoid(pixel);
                    var cartographicPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
                    var longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
                    var latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
                    //you need to return armyc2.c2sd.graphics2d.Point2D
                    var pt2d = new armyc2.c2sd.graphics2d.Point2D(longitude, latitude);
                    if (pt2d.x > 600 || pt2d.x < -600)
                        var foo = 1;
                    return pt2d;
                },
                //required interface takes a boolean
                /**
                 * 
                 * @param {type} accepts a boolean
                 * @returns {undefined}
                 */
                set_normalize: function (n)
                {
                    this.normalize = n;
                }
            };
        }
        catch (err)
        {
            throw err;
        }
        return converter;
    };
//    this.updateSymbolIconSize = function ()
//    {
//        var feature,
//                singlePointKey;
//        try
//        {
//            for (singlePointKey in this.singlePointCollection)
//            {
//                if (this.singlePointCollection[singlePointKey] !== undefined)
//                {
//                    var feature = this.getFeature(singlePointKey);
//                    if (feature.length > 0)
//                    {
//                        feature.coreId = feature.id;
//                        feature.parentCoreId = feature.overlayId;
//                        feature.iconSizeChanged = true;
//                        this.addSymbolSinglePrimitive(feature);
//                    }
//                }
//            }
//        }
//        catch (e)
//        {
//
//        }
//    };

    this.updateSymbolIconSize = function (singlePointKey)
    {
        try
        {
            // for (singlePointKey in this.singlePointCollection)
            //{
            var layer,
                    billboardCollection,
                    singlePointBatch,
                    singlePointKey,
                    billboards,
                    newBillboardCollection,
                    newBillboard,
                    billboard;

            if (this.defined(this.singlePointCollection[singlePointKey]))
            {
                singlePointBatch = emp.helpers.copyObject(this.singlePointCollection[singlePointKey]);
                billboardCollection = this.getFeature(singlePointKey); // feature is a billboard collection
                if (billboardCollection && billboardCollection.length > 0)
                {
                    if (billboardCollection.overlayId)
                    {
                        layer = this.getLayer(billboardCollection.overlayId);
                    }
                    if (layer)
                    {
                        if (this.isFeatureSelected(billboardCollection.id))
                        {
                            singlePointBatch.properties.lineColor = this.selectionColorHex;
                            //singlePointBatch.properties.lineColor = 'FF' + EmpCesiumConstants.selectionProperties.COLOR_HEX;
                        }
                        if (layer.isFeaturePresentById(billboardCollection.id))
                        {
                            billboard = billboardCollection._billboards[0];
                            billboards = this.getSinglePointBillboardPrimitive([singlePointBatch]);
                            newBillboard = billboards[0];
                            billboard.image = newBillboard.image;
                            billboardCollection.pixelOffset = newBillboard.pixelOffset;
                            billboard.pixelOffset = billboardCollection.pixelOffset;
                            billboardCollection.updateCount += 1;

//                                billboard.id = billboardCollection.id;
//                                billboard.name = billboardCollection.name;
//                                billboard.description = billboardCollection.description;
//                                billboard.isDynamic = true;
//                                billboard.position = billboardCollection.get(0).position;
//                                billboard.properties = billboardCollection.properties;
//                                billboard.show = true;
//                                billboard.overlayId = billboardCollection.overlayId;
                            //billboard.scale = billboardCollection.scale;

//                                newBillboardCollection = new this.BillboardCollection();
//                                newBillboardCollection.featureType = EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION;
//                                newBillboardCollection.id = billboardCollection.id;
//                                newBillboardCollection.featureId = billboardCollection.featureId;
//                                newBillboardCollection.name = billboardCollection.name;
//                                newBillboardCollection.description = billboardCollection.description;
//                                newBillboardCollection.properties = billboardCollection.properties;
//                                newBillboardCollection.overlayId = billboardCollection.overlayId;
//                                newBillboardCollection.properties = billboardCollection.properties;
//                                newBillboardCollection.symbolCode = billboardCollection.symbolCode;
//                                newBillboardCollection.coordinates = billboardCollection.coordinates;
//                                newBillboardCollection.altitude = billboardCollection.altitude;
//                                newBillboardCollection.image = billboard.image;
//                                billboard = newBillboardCollection.add(billboard);
//
//                                billboard.name = newBillboardCollection.name;
//                                billboard.description = newBillboardCollection.description;
//                                billboard.isDynamic = true;
//                                billboard.position = newBillboardCollection.get(0).position;
//                                billboard.properties = newBillboardCollection.properties;
//                                billboard.show = true;
//                                billboard.overlayId = newBillboardCollection.overlayId;
//
//                                billboard.image = newBillboardCollection.image;// adding billboard to collection is setting image to undefined :(
//                                layer.removeFeature(billboardCollection);
//                                layer.addFeature(newBillboardCollection);
                            //this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                        }
                    }// if (layer)
                }// if (billboardCollection && billboardCollection.length > 0)
            }// if (this.singlePointCollection[singlePointKey] !== undefined)
            //}// for (singlePointKey in this.singlePointCollection)
        }
        catch (e)
        {

        }
    };

    this.updateSymbolLabels = function (singlePointKey)
    {
        try
        {
            var layer,
                    billboardCollection,
                    singlePointBatch,
                    singlePointKey,
                    billboards,
                    newBillboardCollection,
                    newBillboard,
                    billboard;

            if (this.singlePointCollection[singlePointKey] !== undefined)
            {
                singlePointBatch = emp.helpers.copyObject(this.singlePointCollection[singlePointKey]);
                billboardCollection = this.getFeature(singlePointKey); // feature is a billboard collection
                if (billboardCollection && billboardCollection.length > 0)
                {
                    if (this.isFeatureSelected(billboardCollection.id))
                    {
                        singlePointBatch.properties.lineColor = this.selectionColorHex;
                        //singlePointBatch.properties.lineColor = 'FF' + EmpCesiumConstants.selectionProperties.COLOR_HEX;
                    }
                    if (this.isFeaturePresent(billboardCollection.id))
                    {
                        billboard = billboardCollection._billboards[0];
                        billboards = this.getSinglePointBillboardPrimitive([singlePointBatch]);
                        newBillboard = billboards[0];
                        billboard.image = newBillboard.image;
                        billboardCollection.pixelOffset = newBillboard.pixelOffset;
                        billboard.pixelOffset = billboardCollection.pixelOffset;
                        billboardCollection.updateCount += 1;

//                                billboard.id = billboardCollection.id;
//                                billboard.name = billboardCollection.name;
//                                billboard.description = billboardCollection.description;
//                                billboard.isDynamic = true;
//                                billboard.position = billboardCollection.get(0).position;
//                                billboard.properties = billboardCollection.properties;
//                                billboard.show = true;
//                                billboard.overlayId = billboardCollection.overlayId;
                        //billboard.scale = billboardCollection.scale;

//                                newBillboardCollection = new this.BillboardCollection();
//                                newBillboardCollection.featureType = EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION;
//                                newBillboardCollection.id = billboardCollection.id;
//                                newBillboardCollection.featureId = billboardCollection.featureId;
//                                newBillboardCollection.name = billboardCollection.name;
//                                newBillboardCollection.description = billboardCollection.description;
//                                newBillboardCollection.properties = billboardCollection.properties;
//                                newBillboardCollection.overlayId = billboardCollection.overlayId;
//                                newBillboardCollection.properties = billboardCollection.properties;
//                                newBillboardCollection.symbolCode = billboardCollection.symbolCode;
//                                newBillboardCollection.coordinates = billboardCollection.coordinates;
//                                newBillboardCollection.altitude = billboardCollection.altitude;
//                                newBillboardCollection.image = billboard.image;
//                                billboard = newBillboardCollection.add(billboard);
//
//                                billboard.name = newBillboardCollection.name;
//                                billboard.description = newBillboardCollection.description;
//                                billboard.isDynamic = true;
//                                billboard.position = newBillboardCollection.get(0).position;
//                                billboard.properties = newBillboardCollection.properties;
//                                billboard.show = true;
//                                billboard.overlayId = newBillboardCollection.overlayId;
//
//                                billboard.image = newBillboardCollection.image;// adding billboard to collection is setting image to undefined :(
//                                layer.removeFeature(billboardCollection);
//                                layer.addFeature(newBillboardCollection);
                        //this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                    }

                }// if (billboardCollection && billboardCollection.length > 0)
            }// if (this.singlePointCollection[singlePointKey] !== undefined)
            //}// for (singlePointKey in this.singlePointCollection)
        }
        catch (e)
        {

        }
    };


    this.updateSelections = function ()
    {
        var id;
        try
        {
            var selections = this.getSelections();
            for (id in selections)
            {
                var feature = this.getFeature(id);
                if (this.defined(feature))
                {
                    var selectionArgs = {
                        featureId: feature.featureId,
                        coreId: feature.id,
                        overlayId: feature.overlayId,
                        sendEvent: false,
                        isApiInitiatedSelection: true
                    };
                    this.manageDeselect(selectionArgs);
                    this.manageSelect(selectionArgs);
                }
            }
        }
        catch (e)
        {

        }
    };

    /**
     * @desc Adds a mil std 2525 multi point symbol
     *
     * @param {Feature} args - a {@link Feature}
     * @param {Object} idObject - The id object containg the featureId and parentId.
     * @param {String} idObject.featureId - The modified feature id to be used on the map.
     * @param {String} idObject.parentId - The modifed parent id to be used on the map.
     * Could be a parent feature or overlay.
     * @returns {object} result - The resulting object.
     * @returns {boolean} result.success - Whether the function succeeded or not.
     * @returns {string} result.message - The description of why the function failed.
     * @returns {object} result.jsError - A caught javascript exception.
     */
    this.addSymbolMulti = function (args)
    {
        var scale = this.getScale(),
                oExtent,
                sExtent,
                altitudeMode,
                mods = {},
                modstring,
                standard = cesiumEngine.utils.RendererSettings.Symbology_2525C,
                checkResult,
                override,
                renderingCameraAltitude,
                renderingCameraScale,
                showlabelsAtCurrentCameraAltitude = true,
                oProperties,
                isMultiPointPresent = false,
                data = {},
                result = {
                    success: true,
                    message: "",
                    jsError: ""
                };

        try
        {
            if (!this.defined(scale))
            {
                scale = 500000;
            }
//            if (scale > 1000000)
//            {
//                scale = 500000;
//            }
            oExtent = this.getExtent();
            sExtent = oExtent.west.toDeg() + "," + oExtent.south.toDeg() + "," + oExtent.east.toDeg() + "," + oExtent.north.toDeg();
            data.batch = [];
            data.scale = scale;
            // if (this.isSkyWithinMapVisibleArea())
            //    {
            //     data.bbox = null; //"-180,-90,180,90"; //max rectangle;
            // }
            //  else
            //  {
            data.bbox = sExtent;
            //     }
            data.format = EmpCesiumConstants.MultiPointRenderType.SVG;
            data.pixelHeight = this.canvas.height;
            data.pixelWidth = this.canvas.width;
            //data.altMode = "clampToGround";
            // data.converter = this.cesiumConverter;
            //data.symstd = standard;
            data.fontInfo = cesiumEngine.utils.getFontInfo("arial", 10, "bold");
            var sceneInfo = {};
            var cameraInfo = {};
            sceneInfo.canvasClientWidth = this.canvas.width;
            sceneInfo.canvasClientHeight = this.canvas.height;
            sceneInfo.drawingBufferWidth = this.viewer.scene.drawingBufferWidth;
            sceneInfo.drawingBufferHeight = this.viewer.scene.drawingBufferHeight;
            data.sceneInfo = sceneInfo;
            data.cameraInfo = cameraInfo;
            data.sceneInfo.mapProjectionEllipsoid = this.ellipsoid;
            data.cameraInfo = this.saveCamera(this.viewer.camera);
            data.sceneInfo.frameState = {};
            data.sceneInfo.frameState.mode = this.viewer.scene.frameState.mode;
            data.sceneInfo.frameState.morphTime = this.viewer.scene.frameState.morphTime;
            //cartographics.push(new this.Cartographic(oExtent.west, oExtent.south, 0));
            //cartographics.push(new this.Cartographic(oExtent.east, oExtent.north, 0));
            //cartographics = cesiumEngine.utils.convertCartographicsToCoordinatesRange(cartographics);
            // oExtent = this.Rectangle.fromCartographicArray(cartographics);
            for (var index = 0; index < args.length; index++)
            {
                oProperties = emp.helpers.copyObject(args[index].properties || {});
                //standard = cesiumEngine.utils.checkSymbolStandard(args.properties.modifiers);
                if (!cesiumEngine.utils.isSymbolStandardSpecified(args[index].properties.modifiers))
                {
                    //fix absence of string standard in modifiers
                    args[index].properties.modifiers.standard = (this.isV2Core) ? emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B : emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C;
                }
                standard = cesiumEngine.utils.checkSymbolStandard(args[index].properties.modifiers);
                var intent;
                if (!this.isMultiPointPresent(args[index].coreId || args[index].id) && args[index].intent === "redraw")
                {
                    console.log("ignore redraws when multipoint already deleted");
                    continue; // ignore redraw when multipoint was already deleted.
                }
                // console.log("intent = " + args[index].intent );
                this.storeMultiPoint({
                    symbolCode: args[index].symbolCode,
                    standard: standard,
                    name: args[index].name,
                    id: args[index].coreId || args[index].id,
                    parentCoreId: args[index].parentCoreId,
                    overlayId: args[index].overlayId,
                    description: args[index].description || args[index].properties.description,
                    coordinates: args[index].coordinates,
                    properties: oProperties,
                    altitudeMode: args[index].properties.altitudeMode,
                    visible: args[index].visible,
                    type: args[index].data.type,
                    data: args[index].data,
                    renderingCameraAltitude: this.cameraAltitude,
                    renderingCameraScale: scale,
                    multiPointRenderType: args[index].multiPointRenderType,
                    extrudedHeight: args[index].extrudedHeight,
                    intent: args[index].intent
                });


                if (oProperties)
                {
                    // default this to an empty object so that it
                    // is ready to be set.
                    mods.modifiers = {};
                    if (oProperties.modifiers)
                    {
                        mods.modifiers = emp.helpers.copyObject(oProperties.modifiers);
                    }
                    if (oProperties.fillColor)
                    {
                        mods.modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.FillColor] = oProperties.fillColor;
                    }
                    if (oProperties.lineColor)
                    {
                        mods.modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = oProperties.lineColor;
                    }
                    else if (!armyc2.c2sd.renderer.utilities.SymbolUtilities.hasValidAffiliation(args[index].symbolCode))
                    {
                        mods.modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = EmpCesiumConstants.propertyDefaults.LINE_COLOR_HEX;
                    }
                    if (oProperties.lineWidth)
                    {
                        mods.modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineWidth] = oProperties.lineWidth;
                    }
                    else
                    {
                        mods.modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineWidth] = EmpCesiumConstants.propertyDefaults.LINE_WIDTH;
                    }
                    if (oProperties.azimuth && Array.isArray(oProperties.azimuth))
                    {
                        mods.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH] = oProperties.azimuth;
                    }
                    else if (oProperties.azimuth && !isNaN(parseFloat(oProperties.azimuth)))
                    {
                        mods.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH] = [parseFloat(oProperties.azimuth)];
                        //make sure the azimuth is a number in tge object sent by the api
                    }
                    else
                    {
                        mods.modifiers[mil.symbology.renderer.modifierLookup.AZIMUTH] = [0];
                    }

                    /////mil.symbology.renderer.modifierLookup.AZIMUTH
                }
                else
                {
                    mods.modifiers = {};
                }
                // convert the map view into distance in meters from left to right.
                // We use this calculation to determine how many meters the map currently
                // shows on screen.  When we draw the symbol, some symbols require a width.
                // If we hardcode the width, it is either too small or too large.  By
                // figuring out the current map width in meters we can create a new
                // symbol that is proportional to the current view.
                var viewDistanceMeters = this.leftToRightViewDistanceMeters();
                // Check if the symbol has the required modifiers.
                checkResult = cesiumEngine.utils.checkForRequiredModifiers(args[index], viewDistanceMeters);
                // If some modifiers are missing as reported by the checkForRequiredModifiers,
                // override the current modifiers so they render with the missing parameters.
                // this will have the effect of making items grow or shrink as you zoom in
                // and out.  This was intentionally requested by developer of content management
                // widget.
                for (override in checkResult)
                {
                    mods.modifiers[override] = checkResult[override];
                }
                oProperties.modifiers = emp.helpers.copyObject(mods.modifiers);
                //if (args.visible === true)
                //{
//                standard = cesiumEngine.utils.checkSymbolStandard(modstring);
                args[index].coordinates = cesiumEngine.utils.convertMilStdMultiPointCoordsToString(args[index].data.geometry || args[index].data);
                var controlPoints = args[index].coordinates;
//                if (!(this.scene.mode === this.SceneMode.SCENE2D) && this.isSkyWithinMapVisibleArea)
//                {
//                    // far out from the planet. Calculate the bounds of the shape instead of the view.
//                    // make sure the multipoint is within the bounds sent to the renderer
//                    var cartographics = cesiumEngine.utils.convertCoordsDegreesToCartographicArray(args.data);
//                    oExtent = this.getMultipointExtent(cartographics, mods.modifiers, scale, this.scaleMultiplier);
//                    if (oExtent.width.toDeg() < 3)
//                    {
//                        // small enough to use the extent of the feature
//                        sExtent = oExtent.west.toDeg() + "," + oExtent.south.toDeg() + "," + oExtent.east.toDeg() + "," + oExtent.north.toDeg();
//                    }
//                    else
//                    {
//                        // to big to use the extent of the feature. The feature would not look sharp. use the extent of teh current view.
//                        //var cartographics = cesiumEngine.utils.convertCoordsDegreesToCartographicArray(args.data);
//                        oExtent = this.getExtent();
//                        //cartographics.push(new this.Cartographic(oExtent.west, oExtent.south, 0));
//                        //cartographics.push(new this.Cartographic(oExtent.east, oExtent.north, 0));
//                        //cartographics = cesiumEngine.utils.convertCartographicsToCoordinatesRange(cartographics);
//                        //oExtent = this.Rectangle.fromCartographicArray(cartographics);
//                        sExtent = oExtent.west.toDeg() + "," + oExtent.south.toDeg() + "," + oExtent.east.toDeg() + "," + oExtent.north.toDeg();
//                    }
//                }
                // else
                // {
                //var cartographics = [];
                // cartographics = cesiumEngine.utils.convertCoordsDegreesToCartographicArray(args.data);

                // }
                if (this.isFeatureSelected(args[index].coreId || args[index].id))
                {
                    mods.modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.LineColor] = EmpCesiumConstants.selectionProperties.COLOR_HEX;
                }
                if (oProperties.altitudeMode === undefined || oProperties.altitudeMode === null)
                {
                    altitudeMode = "clampToGround";
                }
                else
                {
                    altitudeMode = oProperties.altitudeMode;
                }
                if (sec.web.renderer.utilities.JavaRendererUtilities.is3dSymbol(args[index].symbolCode, mods.modifiers) && (altitudeMode === "clampToGround"))
                {
                    altitudeMode = "relativeToGround";
                }
//            if ((this.cameraAltitude > this.maxAltitudeLabelVisible) || this.isSkyWithinMapVisibleArea)
//            {
//                showlabelsAtCurrentCameraAltitude = false;
//            }
                mods.modifiers = emp.typeLibrary.utils.milstd.convertModifierStringTo2525(mods.modifiers, this.showLabels && showlabelsAtCurrentCameraAltitude);
                if (this.isFeatureSelected(args[index].coreId || args[index].id))
                {
                    if (mods.modifiers.hasOwnProperty(emp.typeLibrary.utils.milstd.Modifiers.ADDITIONAL_INFO_1) &&
                            this.defined(mods.modifiers[emp.typeLibrary.utils.milstd.Modifiers.ADDITIONAL_INFO_1]))
                    {
                        var segmentColorArray = mods.modifiers[emp.typeLibrary.utils.milstd.Modifiers.ADDITIONAL_INFO_1].split(":");
                        if (segmentColorArray.length > 1)
                        {
                            // content of modifier represents segment colors. reset to empty string so we can high light segments
                            mods.modifiers[emp.typeLibrary.utils.milstd.Modifiers.ADDITIONAL_INFO_1] = "";
//                        var cartographics = cesiumEngine.utils.convertCoordsDegreesToCartographicArray(args.data);
//                        oExtent = this.getExtent();
//                        cartographics.push(new this.Cartographic(oExtent.west, oExtent.south, 0));
//                        cartographics.push(new this.Cartographic(oExtent.east, oExtent.north, 0));
//                        cartographics = cesiumEngine.utils.convertCartographicsToCoordinatesRange(cartographics);
//                        oExtent = this.Rectangle.fromCartographicArray(cartographics);
//                        sExtent = oExtent.west.toDeg() + "," + oExtent.south.toDeg() + "," + oExtent.east.toDeg() + "," + oExtent.north.toDeg();
                        }
                    }
                }
                var basicSymbolId = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(args[index].symbolCode);
                var symbolDefTable = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(basicSymbolId, standard);
//            if (symbolDefTable.drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE)
//            {
//                // reverse order of AM from [width, height] to [height, width] to be compatible to renderer.
//                if (mods.modifiers.AM)
//                {
//                    mods.modifiers.AM.reverse();
//                }
//            }
                var batchObject = {};
                batchObject.id = args[index].coreId || args[index].id;
                batchObject.name = args[index].name;
                batchObject.description = unescape(args[index].description);
                batchObject.symbolID = args[index].symbolCode;
                batchObject.scale = scale;
//                if (this.isSkyWithinMapVisibleArea())
//                {
//                    batchObject.bbox = "-180,-90,180,90"; //max rectangle;
//                }
//                else
//                {
                batchObject.bbox = data.bbox;
                //}

                batchObject.modifiers = mods.modifiers;
                batchObject.modifiers.SVGFORMAT = 1;// for % notation  / 1 for base64 encoding.
                batchObject.format = args[index].multiPointRenderType;
                batchObject.pixelHeight = this.canvas.height;
                batchObject.pixelWidth = this.canvas.width;
                batchObject.symstd = standard; //1;//1=2525C, 0=2525Bch2
                batchObject.fontInfo = cesiumEngine.utils.getFontInfo("arial", 10, "bold");
                batchObject.extrudedHeight = args[index].extrudedHeight;
                // if (batchObject.format === EmpCesiumConstants.MultiPointRenderType.SVG_LABEL_ONLY)
                //{
                batchObject.altMode = altitudeMode;
                // }
                //   else
                //   {
                //       batchObject.altMode = "clampToGround";
                //   }
                //batchObject.multiPointRenderType = args[index].multiPointRenderType;
                batchObject.points = controlPoints;
                data.batch[index] = batchObject;
                var multiPointObject = this.getMultiPoint(batchObject.id);
                multiPointObject.dataSentToSecRendererWorker = batchObject;
            }//for loop


            //
            // altitudeMode = "clampToGround";
            if (data.batch.length > 0)
                    // if (false)
                    {
                        // use worker
                        if (this.secRendererWorker.lastSelected === EmpCesiumConstants.RendererWorker.B)
                        {
                            this.secRendererWorker.A.postMessage(data);
                            this.secRendererWorker.lastSelected = EmpCesiumConstants.RendererWorker.A;
                        }
                        else
                        {
                            this.secRendererWorker.B.postMessage(data);
                            this.secRendererWorker.lastSelected = EmpCesiumConstants.RendererWorker.B;
                        }
                    }
            else if (data.batch.length === 1)
                    //else 
                    {
                        var rendererData = sec.web.renderer.SECWebRenderer.RenderSymbol(data.batch[0].id, data.batch[0].name, unescape(data.batch[0].description), data.batch[0].symbolID, data.batch[0].points, data.batch[0].altMode, data.batch[0].scale, data.batch[0].bbox, data.batch[0].modifiers, data.batch[0].format, data.batch[0].symstd);
                        if (rendererData && rendererData !== null && typeof rendererData === 'string')
                        {
                            console.log("Render error " + data.batch[0].name + " (" + data.batch[0].symbolID + ") Extents: " + data.batch[0].bbox + "\n      Coord string:" + data.batch[0].points + "  canvas.width = " + this.canvas.width + "  canvas.height = " + this.canvas.height + "  modifiers = " + JSON.stringify(data.batch[0].modifiers) + "scale =" + data.batch[0].scale);
                            result.success = false;
                            result.message = rendererData;
                            result.jsError = "function: addSymbolMulti(args)  -  EmpCesiumConstants.MultiPointRenderType.SVG";
                        }
                        else if (rendererData)
                        {
                            var addCanvasToOverlayParams = {
                                symbolCode: args[0].symbolCode,
                                parentCoreId: args[0].parentCoreId,
                                overlayId: args[0].overlayId,
                                id: args[0].coreId || args[0].id,
                                data: rendererData,
                                properties: args[0].properties,
                                name: args[0].name,
                                description: args[0].description || args[0].properties.description,
                                visible: args[0].visible,
                                feature: args[0],
                                extrudedHeight: args[0].extrudedHeight
                            };
                            result = this.addCanvasToOverlay(addCanvasToOverlayParams);
                            if (rendererData.hasOwnProperty("wasClipped"))
                            {
                                this.multiPointCollection[args[0].coreId || args[0].id].wasClipped = rendererData.wasClipped;
                                this.multiPointCollection[args[0].coreId || args[0].id].forceRedraw = rendererData.forceRedraw;
                            }
                            else
                            {
                                this.multiPointCollection[args[0].coreId || args[0].id].wasClipped = false;
                                this.multiPointCollection[args[0].coreId || args[0].id].forceRedraw = false;
                            }
                            this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                        }
                        rendererData = null;
                    }
        }
        catch (err)
        {
            result.success = false;
            result.message = "Adding the Mil Std symbol threw exception";
            result.jsError = err;
            console.log(err);
        }

        return result;
    }.bind(this);


    this.saveCamera = function (camera)
    {
        var save = {};
        save.position = {x: camera.position.x, y: camera.position.y, z: camera.position.z};
        save.heading = camera.heading;
        save.picth = camera.pitch;
        save.roll = camera.roll;
        save.transform = [];//Cesium.Matrix4.clone(camera.transform, camera.transform);

        save.transform[0] = camera.transform[0];
        save.transform[1] = camera.transform[1];
        save.transform[2] = camera.transform[2];
        save.transform[3] = camera.transform[3];
        save.transform[4] = camera.transform[4];
        save.transform[5] = camera.transform[5];
        save.transform[6] = camera.transform[6];
        save.transform[7] = camera.transform[7];
        save.transform[8] = camera.transform[8];
        save.transform[9] = camera.transform[9];
        save.transform[10] = camera.transform[10];
        save.transform[11] = camera.transform[11];
        save.transform[12] = camera.transform[12];
        save.transform[13] = camera.transform[13];
        save.transform[14] = camera.transform[14];
        save.transform[15] = camera.transform[15];

        return save;

    }





    this.leftToRightViewDistanceMeters = function ()
    {
        var rectangle = this.getExtent();
        var centerCartographic = this.Rectangle.center(rectangle);
        var width = this.Rectangle.computeWidth(rectangle); //  Cesium.Math.toDegrees(width);
        width = this.Math.toDegrees(width);
        width = width * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude));
        return width;
    };



    this.processEntities = function (args)
    {
        var isRenderableEntity = false,
                len = args.entityArray.length;
        for (var index = 0; index < len; index++)
        {
            isRenderableEntity = false;
            var entity = args.entityArray[index];
            entity.featureType = EmpCesiumConstants.featureType.ENTITY;
            if (entity.billboard !== undefined)
            {
// Do not use proxy for the case of canvas
//                if (entity.billboard.image && entity.billboard.image.getValue() && typeof (entity.billboard.image.getValue()) === "string")
//                {
//                    //use proxy to get images. There must be a flag to disable the use of proxies to improve performance.
//                    // For now set the proxy as the default mode.
//                    if (emp.util.config.getUseProxySetting())
//                    {
//                        if (entity.billboard.image._value.indexOf(this.getProxyUrl()) === -1 && entity.billboard.image._value.indexOf("data:image") === -1)
//                        {
//                            entity.billboard.image = this.getProxyUrl() + "?url=" + entity.billboard.image._value;
//                            //entity.billboard.image = new this.ConstantProperty(this.getProxyUrl() + "?url=" + entity.billboard.image._value);
//                        }
////                        else {
////                            entity.billboard.image = new this.ConstantProperty(entity.billboard.image._value);
////                        }
//                    }
//                }
                isRenderableEntity = true;
                var rgbaFillColor = undefined;
                switch (args.data.properties.iconSize)
                {
                    case  "verySmall":
                        entity.billboard.scale = .5;
                        break;
                    case  "small":
                        entity.billboard.scale = .75;
                        break;
                    case  "medium":
                        entity.billboard.scale = 1;
                        break;
                    case  "large":
                        entity.billboard.scale = 1.5;
                        break;
                    case  "extraLarge":
                        entity.billboard.scale = 1.75;
                        break;
                    default:
                        entity.billboard.scale = 1;
                        break;
                }
                //entity.billboard.scale = 1; //ojo with this scale value.
                if (this.isFeatureSelected(entity.id || args.data.id))
                {
                    var selectionProperties = this.getFeatureSelection(entity.id || args.data.id);
                    selectionProperties[  args.data.id].pointColor = entity.billboard.color.getValue();
                    selectionProperties[  args.data.id].pointScale = entity.billboard.scale.getValue();
                    entity.billboard.color = this.selectionColor;
                    //entity.billboard.color = EmpCesiumConstants.selectionProperties.COLOR;
                    entity.billboard.scale = entity.billboard.scale.getValue() + EmpCesiumConstants.selectionProperties.SCALE;
                }
                else if (args.data.properties.fillColor)
                {
                    rgbaFillColor = cesiumEngine.utils.hexToRGB(args.data.properties.fillColor);
                    entity.billboard.color = new this.Color(rgbaFillColor.r, rgbaFillColor.g, rgbaFillColor.b, rgbaFillColor.a);
                }
                else if (!this.defined(entity.billboard.color))
                {
                    entity.billboard.color = EmpCesiumConstants.propertyDefaults.FILL_COLOR;
                }
//                if (args.data.properties.iconUrl && args.data.properties.iconUrl.length > 0)
//                {
//                    if (emp.util.config.getUseProxySetting())
//                    {
//                        entity.billboard.image = new this.ConstantProperty(this.getProxyUrl() + "?url=" + args.data.properties.iconUrl);
//                    }
//                    else
//                    {
//                        entity.billboard.image = new this.ConstantProperty(args.data.properties.iconUrl);
//                    }
//
//                }
                if ((args.data.properties.xUnits && args.data.properties.xUnits === "pixels") && (args.data.properties.yUnits && args.data.properties.yUnits === "pixels"))
                {
                    if (!isNaN(args.data.properties.iconXOffset) && !isNaN(args.data.properties.iconYOffset))
                    {
                        entity.billboard.pixelOffset = new this.Cartesian2(args.data.properties.iconXOffset, args.data.properties.iconYOffset);
                    }
                }
                if (!isNaN(args.data.properties.heading))
                {
                    entity.billboard.rotation = this.Math.toRadians(args.data.properties.heading);
                }
                if (args.data.properties.altitudeMode)
                {
//next is not part of the entitty api. not working.
// workaround would be to replace billboard with new wbillboard and position
// //Cesium.Ellipsoid.WGS84.cartesianToCartographic( position)
                    entity.billboard.heightReference = cesiumEngine.utils.convertEmpAltitudeTypeToCesium(args.data.properties.altitudeMode);
//                    if (args.data.properties.altitudeMode === cesiumEngine.utils.AltitudeModeEnumType.ALTITUDE_CLAMP_TO_GROUND )
//                    {
//                        entity.billboard.height = 0;
//                    }
                }
                entity.billboard.alignedAxis = this.Cartesian3.ZERO;
                entity.billboard.eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(this.viewer.camera.positionCartographic.height, this.cameraAltitude);
                //;  //cesiumEngine.utils.getEyeOffsetControlPoint(this.viewer.camera.positionCartographic.height,  this.cameraAltitude);
                // entity.billboard.scaleByDistance = new this.NearFarScalar(2414016, 1.0, 16093000, 0.1);
                //ojo @@ need to add the verticalOrigin... center of bottom.
            }
            if (entity.point !== undefined)
            {
                isRenderableEntity = true;
                var rgbaFillColor = undefined;
                entity.point.pixelSize = 1;
                if (this.isFeatureSelected(entity.id || args.data.id))
                {
                    var selectionProperties = this.getFeatureSelection(entity.id || args.data.id);
                    selectionProperties[  args.data.id].pointColor = entity.point.color.getValue();
                    entity.point.color = this.selectionColor;
                    // entity.point.color = EmpCesiumConstants.selectionProperties.COLOR;
                    entity.point.pixelSize = entity.point.pixelSize.getValue() + EmpCesiumConstants.selectionProperties.SCALE;
                }
                else if (args.data.properties.fillColor)
                {
                    rgbaFillColor = cesiumEngine.utils.hexToRGB(args.data.properties.fillColor);
                    entity.point.color = new this.Color(rgbaFillColor.r, rgbaFillColor.g, rgbaFillColor.b, rgbaFillColor.a);
                }
                else if (!this.defined(entity.point.color))
                {
                    entity.point.color = EmpCesiumConstants.propertyDefaults.FILL_COLOR;
                }
                if (args.data.properties.altitudeMode)
                {
                    entity.point.heightReference = cesiumEngine.utils.convertEmpAltitudeTypeToCesium(args.data.properties.altitudeMode);
                }
                //;  //cesiumEngine.utils.getEyeOffsetControlPoint(this.viewer.camera.positionCartographic.height,  this.cameraAltitude);
                entity.point.scaleByDistance = new this.NearFarScalar(2414016, 1.0, 16093000, 0.1);
                //ojo @@ need to add the verticalOrigin... center of bottom.
            }
            if (entity.path !== undefined)
            {
                isRenderableEntity = true;
            }
            if (entity.label !== undefined)
            {
                isRenderableEntity = true;
                var labelScale = 1;
                if (!this.defined(entity.label.scale))
                {
                    entity.label.scale = labelScale;
                }

                if (!this.defined(entity.label.font))
                {
                    entity.label.font = '20px sans-serif';
                }

                entity.label.translucencyByDistance = new this.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.0);
                if (!entity.label.fillColor)
                {
                    entity.label.fillColor = EmpCesiumConstants.propertyDefaults.LINE_COLOR;
                }
                if (entity.billboard && entity.billboard.pixelOffset && entity.label.pixelOffset)
                {
// avoid icon label overlap
                    entity.label.pixelOffset._value.x += entity.billboard.pixelOffset._value.x;
                    entity.label.pixelOffset._value.y += entity.billboard.pixelOffset._value.y;
                }
                else if (entity.billboard && entity.billboard.pixelOffset && !this.defined(entity.label.pixelOffset))
                {
                    // avoid icon label overlap
                    if (!this.defined(entity.label.pixelOffset))
                    {
                        entity.label.pixelOffset = this.Cartesian2.ZERO;
                    }
                    entity.label.pixelOffset._value.x += entity.billboard.pixelOffset._value.x;
                    entity.label.pixelOffset._value.y += entity.billboard.pixelOffset._value.y;
                }
                else if (!this.defined(entity.billboard) && !entity.label.horizontalOrigin)
                {
                    entity.label.horizontalOrigin = Cesium.HorizontalOrigin.LEFT;// default to left side of label next to position.
                }
                if (this.isFeatureSelected(entity.id || args.data.id))
                {
                    var selectionProperties = this.getFeatureSelection(entity.id || args.data.id);
                    selectionProperties[  args.data.id].labelFillColor = entity.label.fillColor.getValue();
                    selectionProperties[  args.data.id].labelScale = entity.label.scale.getValue();
                    entity.label.color = this.selectionColor;
                    //entity.label.color = EmpCesiumConstants.selectionProperties.COLOR;
                    entity.label.scale = entity.label.scale.getValue() + EmpCesiumConstants.selectionProperties.SCALE;
                }
                else if (args.data.properties.fillColor)
                {
                    rgbaFillColor = cesiumEngine.utils.hexToRGB(args.data.properties.fillColor);
                    entity.label.fillColor = this.Color.fromBytes(rgbaFillColor.r, rgbaFillColor.g, rgbaFillColor.b, rgbaFillColor.a);
                }
                else if (!this.defined(entity.label.fillColor))
                {
                    entity.label.fillColor = EmpCesiumConstants.propertyDefaults.FILL_COLOR;
                }
                if (args.data.properties.altitudeMode)
                {
                    entity.label.heightReference = cesiumEngine.utils.convertEmpAltitudeTypeToCesium(args.data.properties.altitudeMode);
                }
            }
            if (entity.polyline !== undefined)
            {
                isRenderableEntity = true;
                var rgbaLineColor = undefined;
                if (!this.defined(entity.polyline.material))
                {
                    entity.polyline.material = new this.PolylineOutlineMaterialProperty();
                }
                if (this.isFeatureSelected(args.data.id))
                {
                    var selectionProperties = this.getFeatureSelection(entity.id || args.data.id);
                    selectionProperties[  args.data.id].polylineMaterial = entity.polyline.material;
                    selectionProperties[  args.data.id].polylineWidth = entity.polyline.width.getValue();
                    entity.polyline.material.color = entity.polyline.material.color.getValue();
                    entity.polyline.material.outlineColor = this.selectionColor;
                    //entity.polyline.material.outlineColor = EmpCesiumConstants.selectionProperties.COLOR;
                    entity.polyline.material.outlineWidth = EmpCesiumConstants.selectionProperties.WIDTH;
                }
                else if (args.data.properties.lineColor)
                {
                    rgbaLineColor = cesiumEngine.utils.hexToRGB(args.data.properties.lineColor);
                    entity.polyline.material.color = new this.Color(rgbaLineColor.r, rgbaLineColor.g, rgbaLineColor.b, rgbaLineColor.a);
                }
                else if (!this.defined(entity.polyline.material.color))
                {
                    entity.polyline.material.color = EmpCesiumConstants.propertyDefaults.LINE_COLOR;
                }
                if ((args.data.properties.lineWidth && !isNaN(args.data.properties.lineWidth)) || !entity.polyline.width)
                {
                    entity.polyline.width = args.data.properties.lineWidth || EmpCesiumConstants.propertyDefaults.LINE_WIDTH;
                }
                else
                if (entity.polyline.width.getValue() < 3)
                {
                    entity.polyline.width = EmpCesiumConstants.propertyDefaults.LINE_WIDTH;
                }
            }
            if (entity.corridor !== undefined)
            {
                isRenderableEntity = true;
                var rgbaLineColor = undefined;
                entity.corridor.height = 0;// disable clamping for now. with clamping the corridor is barely visible.  bug in Cesium sdk
                entity.corridor.cornerType = this.CornerType.MITERED;
                if (!this.defined(entity.corridor.material))
                {
                    entity.corridor.material = new this.ColorMaterialProperty();
                }
                if (!this.defined(entity.corridor.material.color))
                {
                    entity.corridor.material.color = EmpCesiumConstants.propertyDefaults.LINE_COLOR;
                }
                if ((args.data.properties.lineWidth && !isNaN(args.data.properties.lineWidth)) || !entity.corridor.width)
                {
                    entity.corridor.width = args.data.properties.lineWidth || EmpCesiumConstants.propertyDefaults.LINE_WIDTH * 200;
                }
                else if (entity.corridor.width.getValue() < 3)
                {
                    entity.corridor.width = EmpCesiumConstants.propertyDefaults.LINE_WIDTH;
                }
                if (this.isFeatureSelected(args.data.id))
                {
                    var selectionProperties = this.getFeatureSelection(entity.id || args.data.id);
                    selectionProperties[  args.data.id].corridorMaterial = entity.corridor.material;
                    selectionProperties[  args.data.id].corridorWidth = entity.corridor.width.getValue();
                    selectionProperties[  args.data.id].corridorOutlineColor = entity.corridor.outlineColor;
                    selectionProperties[  args.data.id].corridorOutlineWidth = entity.corridor.outlineWidth;
                    entity.corridor.material.color = entity.corridor.material.color.getValue();
                    entity.corridor.outline = true;
                    entity.corridor.outlineColor = this.selectionColor;
                    //entity.corridor.outlineColor = EmpCesiumConstants.selectionProperties.COLOR;
                    entity.corridor.outlineWidth = EmpCesiumConstants.selectionProperties.WIDTH;
                }
                else if (args.data.properties.lineColor)
                {
                    rgbaLineColor = cesiumEngine.utils.hexToRGB(args.data.properties.lineColor);
                    entity.corridor.material.color = new this.Color(rgbaLineColor.r, rgbaLineColor.g, rgbaLineColor.b, rgbaLineColor.a);
                    entity.corridor.outline = true;
                    entity.corridor.outlineColor = new this.Color(rgbaLineColor.r, rgbaLineColor.g, rgbaLineColor.b, rgbaLineColor.a);
                    entity.corridor.outlineWidth = EmpCesiumConstants.propertyDefaults.LINE_WIDTH;
                }
                else
                {
                    entity.corridor.outline = true;
                    entity.corridor.outlineColor = EmpCesiumConstants.propertyDefaults.LINE_COLOR;
                    entity.corridor.outlineWidth = EmpCesiumConstants.propertyDefaults.LINE_WIDTH;
                }
            }
            if (entity.polygon !== undefined)
            {
                isRenderableEntity = true;
                var rgbaFillColor = undefined;

                var rgbaLineColor = undefined;

                if (args.data.properties.lineColor)
                {
                    rgbaLineColor = cesiumEngine.utils.hexToRGB(args.data.properties.lineColor);
                    entity.polygon.outline = new this.ConstantProperty(true);
                    entity.polygon.outlineColor = new this.Color(rgbaLineColor.r, rgbaLineColor.g, rgbaLineColor.b, rgbaLineColor.a);
                }
                else if (!this.defined(entity.polygon.outlineColor))
                {
                    entity.polygon.outline = new this.ConstantProperty(true);
                    entity.polygon.outlineColor = EmpCesiumConstants.propertyDefaults.LINE_COLOR;
                }
                if (args.data.properties.lineWidth && !isNaN(args.data.properties.lineWidth))
                {
                    entity.polygon.outlineWidth = args.data.properties.lineWidth;
                }
                else if ((entity.polygon.outlineWidth && entity.polygon.outlineWidth.getValue() < 7) || !this.defined(entity.polygon.outlineWidth))
                {
                    // 1 is the default from the data sources, but use our default instead
                    entity.polygon.outlineWidth = EmpCesiumConstants.propertyDefaults.LINE_WIDTH;
                }
                if (args.data.properties.fillColor)
                {
                    entity.polygon.fill = true;
                    rgbaFillColor = cesiumEngine.utils.hexToRGB(args.data.properties.fillColor);
                    entity.polygon.material = new this.Color(rgbaFillColor.r, rgbaFillColor.g, rgbaFillColor.b, rgbaFillColor.a);
                }
                else if (!this.defined(entity.polygon.material))
                {
                    entity.polygon.material = EmpCesiumConstants.propertyDefaults.FILL_COLOR;
                    entity.polygon.fill = true;
                }
                if (this.isFeatureSelected(args.data.id))
                {
                    var selectionProperties = this.getFeatureSelection(args.data.id);
                    selectionProperties[  args.data.id].polygonMaterial = entity.polygon.material;
                    selectionProperties[  args.data.id].polygonOutlineColor = entity.polygon.outlineColor.getValue();
                    entity.polygon.fill = true;
                    entity.polygon.outline = new this.ConstantProperty(true);
                    entity.polygon.material = this.selectionColor.withAlpha(0.35);
                    //entity.polygon.material = EmpCesiumConstants.selectionProperties.COLOR.withAlpha(0.35);
                    entity.polygon.outlineColor.setValue(this.selectionColor);
                }

                if (args.data.properties.altitudeMode)
                {
                    //entity.polygon.heightReference = cesiumEngine.utils.convertEmpAltitudeTypeToCesium(args.data.properties.altitudeMode);
                }
                if (args.data.properties.altitudeMode && args.data.properties.altitudeMode === cesiumEngine.utils.AltitudeModeEnumType.ALTITUDE_CLAMP_TO_GROUND)
                {
                    //entity.polygon.height = undefined;
                }

            }
            if (entity.ellipse !== undefined)
            {
                isRenderableEntity = true;
                var rgbaFillColor = undefined;

                var rgbaLineColor = undefined;

                if (args.data.properties.lineColor)
                {
                    rgbaLineColor = cesiumEngine.utils.hexToRGB(args.data.properties.lineColor);
                    entity.ellipse.outline = new this.ConstantProperty(true);
                    entity.ellipse.outlineColor = new this.Color(rgbaLineColor.r, rgbaLineColor.g, rgbaLineColor.b, rgbaLineColor.a);
                }
                else if (!this.defined(entity.ellipse.outlineColor))
                {
                    entity.ellipse.outline = new this.ConstantProperty(true);
                    entity.ellipse.outlineColor = EmpCesiumConstants.propertyDefaults.LINE_COLOR;
                }
                if (args.data.properties.fillColor)
                {
                    entity.ellipse.fill = true;
                    rgbaFillColor = cesiumEngine.utils.hexToRGB(args.data.properties.fillColor);
                    entity.ellipse.material = new this.Color(rgbaFillColor.r, rgbaFillColor.g, rgbaFillColor.b, rgbaFillColor.a);
                }
                else
                {
                    entity.ellipse.fill = false;
                    entity.ellipse.material = undefined;
                }
                if (this.isFeatureSelected(args.data.id))
                {
                    var selectionProperties = this.getFeatureSelection(args.data.id);
                    selectionProperties[  args.data.id].ellipseMaterial = entity.ellipse.material;
                    selectionProperties[  args.data.id].ellipseOutlineColor = entity.ellipse.outlineColor.getValue();
                    if (entity.ellipse.material)
                    {
                        entity.ellipse.material = this.selectionColor.withAlpha(0.35);
                    }
                    //entity.ellipse.fill = false;
                    entity.ellipse.outline = new this.ConstantProperty(true);

                    //entity.polygon.material = EmpCesiumConstants.selectionProperties.COLOR.withAlpha(0.35);
                    entity.ellipse.outlineColor.setValue(this.selectionColor);
                }
                else
                //else if (!this.defined(entity.ellipse.material))
                //{
                //entity.ellipse.material = EmpCesiumConstants.propertyDefaults.FILL_COLOR;
                //entity.ellipse.fill = true;
                // }
                if (args.data.properties.lineWidth && !isNaN(args.data.properties.lineWidth))
                {
                    entity.ellipse.outlineWidth = args.data.properties.lineWidth;
                }
                else if (entity.ellipse.outlineWidth.getValue() < 7)
                {
                    // 1 is the default from the data sources, but use our default instead
                    entity.ellipse.outlineWidth = EmpCesiumConstants.propertyDefaults.LINE_WIDTH;
                }
                if (args.data.properties.altitudeMode)
                {
                    //entity.polygon.heightReference = cesiumEngine.utils.convertEmpAltitudeTypeToCesium(args.data.properties.altitudeMode);
                }
                if (args.data.properties.altitudeMode && args.data.properties.altitudeMode === cesiumEngine.utils.AltitudeModeEnumType.ALTITUDE_CLAMP_TO_GROUND)
                {
                    //entity.polygon.height = undefined;
                }
                if (this.defined(args.data.properties.azimuth) && !isNaN(parseFloat(args.data.properties.azimuth)))
                {
                    entity.ellipse.rotation = -parseFloat(args.data.properties.azimuth).toRad();// positive is clockwise, negative is counter . API requires  counter so the negative sign is added.
                }


            }
            if (entity.rectangle !== undefined)
            {
                isRenderableEntity = true;
                if (args.data.properties.altitudeMode)
                {
                    ////entity.rectangle.heightReference = cesiumEngine.utils.convertEmpAltitudeTypeToCesium(args.data.properties.altitudeMode);
                }
//                if (this.defined(args.data.properties.azimuth))
//                {
//                    entity.rectangle.rotation = args.data.properties.azimuth;// positive is clockwise
//                    entity.rectangle.sRotation = args.data.properties.azimuth;// positive is clockwise
//                }
            }
            if (args.data.feature && args.data.feature.format === 'geojson' && len > 1 && index === 0)
            {
// add a parent entity (like a folder in KML) as a  COMPOUND_ENTITY when the geojson
// contains more then 1 entity. In KML the adding of te folder  is done automatically by the KML datasource
                isRenderableEntity = false;
                entity = new this.Entity();
                args.entityArray.unshift(entity);
                len = len + 1;
            }
            if (!isRenderableEntity && !args.layer.isFeaturePresentById(args.data.id) && entity.parent === undefined)
            {
//its a new parent
                entity._id = args.data.id;
                entity.featureType = EmpCesiumConstants.featureType.COMPOUND_ENTITY;
                entity.featureId = args.data.featureId;
                entity.name = args.data.name;
                entity.description = (this.defined(args.data.properties.description)) ? args.data.properties.description : entity.description;
                entity.overlayId = args.data.overlayId;
                entity.properties = args.data.properties;
                entity.parentCoreId = args.data.parentCoreId;
                entity.show = args.data.visible;
                if (args.data.parentId && args.data.parentType === 'feature' && args.layer.isFeaturePresentById(args.data.parentId))
                {
                    // has a parent feature
                    var parentEntity = args.layer.getFeature(args.data.parentId);
                    args.layer.addFeatureChild(parentEntity, entity);
                }
                else
                {
                    args.layer.addFeature(entity);
                }
            }
            else if (!isRenderableEntity && args.layer.isFeaturePresentById(args.data.id) && entity.parent === undefined)
            {
//its the parent and it is present
                var presentEntity = args.layer.getFeature(args.data.id);
                presentEntity.featureId = args.data.featureId;
                presentEntity.name = args.data.name;
                presentEntity.description = (this.defined(args.data.properties.description)) ? args.data.properties.description : entity.description;
                presentEntity.overlayId = args.data.overlayId;
                presentEntity.properties = args.data.properties;
                presentEntity.parentType = args.data.parentType;
                presentEntity.parentCoreId = args.data.parentCoreId;
                presentEntity.show = args.data.visible;
            }
            else if (args.layer.isFeaturePresentById(args.data.id) && isRenderableEntity)
            {
                var presentEntity = args.layer.getFeature(args.data.id);
                presentEntity.description = args.data.properties.description;
                presentEntity.name = args.data.name;
                presentEntity.overlayId = args.data.overlayId;
                presentEntity.properties = args.data.properties;
                presentEntity.show = args.data.visible;
                if (presentEntity.featureType === EmpCesiumConstants.featureType.ENTITY)
                {
                    //update existing entity's geometries
                    presentEntity.description = (this.defined(args.data.properties.description)) ? args.data.properties.description : entity.description;
                    if (entity.polygon && presentEntity.polygon)
                    {
                        presentEntity.polygon.hierarchy = entity.polygon.hierarchy;
                        presentEntity.polygon.material = entity.polygon.material;
                        presentEntity.polygon.outline = entity.polygon.outline;
                        presentEntity.polygon.outlineColor = entity.polygon.outlineColor;
                    }
                    else if (entity.polygon && !presentEntity.polygon)
                    {
                        presentEntity.polygon = entity.polygon;
                    }
                    else if (!entity.polygon && presentEntity.polygon)
                    {
                        presentEntity.polygon = undefined;
                    }
                    if (entity.ellipse && presentEntity.ellipse)
                    {
                        presentEntity.ellipse.material = entity.ellipse.material;
                        presentEntity.ellipse.fill = entity.ellipse.fill;
                        presentEntity.ellipse.rotation = entity.ellipse.rotation;
                        presentEntity.ellipse.outline = entity.ellipse.outline;
                        presentEntity.ellipse.outlineWidth = entity.ellipse.outlineWidth;
                        presentEntity.ellipse.outlineColor = entity.ellipse.outlineColor;
                        presentEntity.ellipse.semiMajorAxis = entity.ellipse.semiMajorAxis;
                        presentEntity.ellipse.semiMinorAxis = entity.ellipse.semiMinorAxis;
                    }
                    else if (entity.ellipse && !presentEntity.ellipse)
                    {
                        presentEntity.ellipse = entity.ellipse;
                    }
                    else if (!entity.ellipse && presentEntity.ellipse)
                    {
                        presentEntity.polygon = undefined;
                    }
                    if (entity.polyline && presentEntity.polyline)
                    {
                        // if (this.mapLocked)
                        if (this.mapMotionLockEnum === emp3.api.enums.MapMotionLockEnum.NO_MOTION && presentEntity.overlayId === "vertices")
                        {
                            this.freeHandPositions = entity.polyline.positions.getValue();
                            presentEntity.polyline.positions = new this.CallbackProperty(function (time, result)
                            {
                                if (this.freeHandPositions.length > 1)
                                {
                                    return this.freeHandPositions;
                                }
                            }.bind(this), false);
                            this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                        }
                        else
                        {
                            presentEntity.polyline.positions = entity.polyline.positions;
                            presentEntity.polyline.material = entity.polyline.material;
                            presentEntity.polyline.width = entity.polyline.width;
                        }
                    }
                    else if (entity.polyline && !presentEntity.polyline)
                    {
                        presentEntity.polyline = entity.polyline;
                    }
                    else if (!entity.polyline && presentEntity.polyline)
                    {
                        presentEntity.polyline = undefined;
                    }
                    if (entity.corridor && presentEntity.corridor)
                    {
                        presentEntity.corridor.positions = entity.corridor.positions;
                        presentEntity.corridor.material = entity.corridor.material;
                        presentEntity.corridor.width = entity.corridor.width;
                        presentEntity.corridor.outline = entity.corridor.outline;
                        presentEntity.corridor.outlineColor = entity.corridor.outlineColor;
                        presentEntity.corridor.outlineWidth = entity.corridor.outlineWidth;
                        presentEntity.corridor.heightReference = entity.point.heightReference;
                    }
                    else if (entity.corridor && !presentEntity.corridor)
                    {
                        presentEntity.corridor = entity.corridor;
                    }
                    else if (!entity.corridor && presentEntity.corridor)
                    {
                        presentEntity.corridor = undefined;
                    }
                    if (entity.billboard && presentEntity.billboard)
                    {
                        presentEntity.billboard.color = entity.billboard.color;
                        presentEntity.billboard.scale = entity.billboard.scale;
                        presentEntity.billboard.pixelOffset = entity.billboard.pixelOffset;
                        presentEntity.billboard.eyeOffset = entity.billboard.eyeOffset;
                        presentEntity.billboard.image = entity.billboard.image;
                        presentEntity.billboard.rotation = entity.billboard.rotation;
                        presentEntity.billboard.heightReference = entity.billboard.heightReference;

                    }
                    else if (entity.billboard && !presentEntity.billboard)
                    {
                        presentEntity.billboard = entity.billboard;
                    }
                    else if (!entity.billboard && presentEntity.billboard)
                    {
                        presentEntity.billboard = undefined;
                    }
                    if (entity.point && presentEntity.point)
                    {
                        presentEntity.point.color = entity.point.color;
                        presentEntity.point.pixelSize = entity.point.pixelSize;
                        presentEntity.point.outlineColor = entity.point.outlineColor;
                        presentEntity.point.outlineWidth = entity.point.outlineWidth;
                        presentEntity.point.heightReference = entity.point.heightReference;
                    }
                    else if (entity.point && !presentEntity.point)
                    {
                        presentEntity.point = entity.point;
                    }
                    else if (!entity.point && presentEntity.point)
                    {
                        presentEntity.point = undefined;
                    }
                    if (entity.position && presentEntity.position)
                    {
                        presentEntity.position = entity.position;
                    }
                    if (entity.label && presentEntity.label)
                    {
                        presentEntity.label.fillColor = entity.label.fillColor;
                        presentEntity.label.outlineColor = entity.label.outlineColor;
                        presentEntity.label.scale = entity.label.scale;
                        presentEntity.label.font = entity.label.font;
                        presentEntity.label.horizontalOrigin = entity.label.horizontalOrigin;
                    }
                    else if (entity.label && !presentEntity.label)
                    {
                        presentEntity.label = entity.label;
                    }
                    else if (!entity.label && presentEntity.label)
                    {
                        presentEntity.label = undefined;
                    }
                    if (entity.rectangle && presentEntity.rectangle)
                    {
                        if (Cesium.defined(entity.rectangle.coordinates))
                        {
                            // presentEntity.rectangle.coordinates = entity.rectangle.coordinates._callback();
                            presentEntity.rectangle.coordinates = entity.rectangle.coordinates;
                            //// presentEntity.rectangle.heightReference = entity.rectangle.heightReference;
                        }
                        if (Cesium.defined(entity.rectangle.material.image))
                        {
                            presentEntity.rectangle.material = entity.rectangle.material;
                        }
//                        if (this.defined(entity.rectangle.rotation))
//                        {
//                            presentEntity.rectangle.rotation = entity.rectangle.rotation;// positive is clockwise
//                            presentEntity.rectangle.sRotation = entity.rectangle.rotation;// positive is clockwise
//                        }

                        //this.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                    }
                    else if (entity.rectangle && !presentEntity.rectangle)
                    {
                        presentEntity.rectangle = entity.rectangle;
                    }
                    else if (!entity.rectangle && presentEntity.rectangle)
                    {
                        presentEntity.rectangle = undefined;
                    }
                }
                else if (presentEntity.featureType === EmpCesiumConstants.featureType.COMPOUND_ENTITY)
                {
// presentEntity is a parent coumpound entity
                    if (!entity._id)
                    {
                        entity._id = args.data.id + "_" + index;
                    }
                    if (entity._id === args.data.id)
                    {
                        // case when a child entity has same id as the parent (2 placemarks with same id in EMS widget)
                        // modify the id and add to parent
                        entity._id = args.data.id + "_" + index;
                    }
                    if (!args.layer.isFeatureChildPresent(presentEntity, entity))
                    {
                        entity.show = args.data.visible;
                        args.layer.addFeatureChild(presentEntity, entity);
                    }
                    else
                    {
                        var presentChildEntity = args.layer.getFeature(entity._id);
                        presentChildEntity.polygon = entity.polygon;
                        presentChildEntity.polyline = entity.polyline;
                        presentChildEntity.corridor = entity.corridor;
                        presentChildEntity.label = entity.label;
                        presentChildEntity.billboard = entity.billboard;
                        presentChildEntity.point = entity.point;
                        presentChildEntity.position = entity.position;
                        presentChildEntity.description = entity.description;
                    }
                }
            }
            else if (!args.layer.isFeaturePresentById(args.data.id) && isRenderableEntity)
            {
//single entity case with no compound parent entity
                entity._id = args.data.id || args.data.coreId;
                entity.featureType = EmpCesiumConstants.featureType.ENTITY;
                entity.featureId = args.data.featureId;
                entity.name = args.data.name;
                entity.description = (this.defined(args.data.properties.description)) ? args.data.properties.description : entity.description;
                entity.description = args.data.properties.description;
                entity.overlayId = args.data.overlayId;
                entity.properties = args.data.properties;
                entity.show = args.data.visible;
                if (args.data.parentId && args.data.parentType === 'feature' && args.layer.isFeaturePresentById(args.data.parentId))
                {
// has a parent feature
                    var parentEntity = args.layer.getFeature(args.data.parentId);
                    args.layer.addFeatureChild(parentEntity, entity);
                }
                else if (args.data.feature && args.data.feature.coreParent && args.data.parentType === 'feature' && args.layer.isFeaturePresentById(args.data.feature.coreParent))
                {
// has a parent feature
                    var parentEntity = args.layer.getFeature(args.data.feature.coreParent);
                    args.layer.addFeatureChild(parentEntity, entity);
                }
                else
                {
                    if (entity.show === false && entity.billboard)
                    {
                        entity.reRenderBillboardRequired = true;
                    }
                    args.layer.addFeature(entity);
                }
            }
        }
    };



    this.addTestInitializationPin = function ()
    {
        // workaround to avoid the surpassing the textureAtllas memory limit under heavy load. If one billboard with canvas is added to the map
        //that seams to allow the texturaAtlas or context to completely initialize. If I plot all mil std without first adding a billboard then the map shows all the billboards imagews distorted
        // (bigger size than it is supposed to).
        if (!this.getFeature("temp_pin_id"))
        {
            var pinBuilder = new this.PinBuilder();
            var tempPinCanvas = pinBuilder.fromColor(Cesium.Color.YELLOW, 16);
            var billboardPin = new this.BillboardGraphics();
            billboardPin.width = .001;
            billboardPin.height = .001;
            billboardPin.image = new this.ConstantProperty(tempPinCanvas);
            var entityPin = new this.Entity();
            entityPin.billboard = billboardPin;
            entityPin.position = this.Cartesian3.fromDegrees(-90, 0);
            entityPin.show = true;
            entityPin.id = "temp_pin_id";
            this.scene.initializeFrame();
            this.entityCollection.suspendEvents();
            this.entityCollection.add(entityPin);
            this.entityCollection.resumeEvents();
            this.scene.render();
        }
    };




    this.processMoveEnd = function (pExtent, currExtent, zoomChanged, evt)
    {
        pExtent = pExtent || {};
        currExtent = currExtent || {};
        var center = this.getCenter();
        var view = {};
        view.bounds = {
            north: this.Math.toDegrees(currExtent.north),
            south: this.Math.toDegrees(currExtent.south),
            east: this.Math.toDegrees(currExtent.east),
            west: this.Math.toDegrees(currExtent.west)
        };
        view.location = {
            lon: this.Math.toDegrees(center.longitude),
            lat: this.Math.toDegrees(center.latitude)
        };
        view.range = Math.round(this.getCameraAltitude());// and this will be ??
        view.altitude = Math.round(this.getCameraAltitude());// of camera
        if (!isNaN(this.viewer.scene.camera.pitch))
        {
            view.tilt = this.viewer.scene.camera.pitch.toDeg() + 90;
            view.tilt = cesiumEngine.utils.normalizeAngleInDegrees(view.tilt);
            //view.tilt = view.tilt.toRad();
            //view.tilt =  this.Math.zeroToTwoPi( view.tilt);
            //view.tilt = view.tilt.toDeg();
        }
        if (!isNaN(this.viewer.scene.camera.roll))
        {
            view.roll = -this.viewer.scene.camera.roll.toDeg();
            //view.roll = this.Math.zeroToTwoPi(view.roll.toRad()).toDeg();
            view.roll = cesiumEngine.utils.normalizeAngleInDegrees(view.roll);
        }
        if (!isNaN(this.viewer.scene.camera.heading))
        {
            view.heading = -this.viewer.scene.camera.heading.toDeg();
            //view.heading = this.Math.zeroToTwoPi(view.heading.toRad()).toDeg();
            view.heading = cesiumEngine.utils.normalizeAngleInDegrees(view.heading);
        }
        view.scale = this.getScale(); //scale is the pixel to meter ratio of the current view extent.

        //var windowPosition = new Cesium.Cartesian2(this.viewer.container.clientWidth / 2, this.viewer.container.clientHeight / 2);
        //var pickRay = this.viewer.scene.camera.getPickRay(windowPosition);
        // var pickPosition = this.viewer.scene.globe.pick(pickRay, this.viewer.scene);
        var cameraPositionCartographic = this.viewer.camera.positionCartographic;

        var lookAt = {};
        try
        {
            //var pickPositionCartographic = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
            lookAt.latitude = this.Math.toDegrees(cameraPositionCartographic.latitude);
            lookAt.longitude = this.Math.toDegrees(cameraPositionCartographic.longitude);
            lookAt.altitude = 0.0; // Always revert to ground intercept, ignoring any altitude or altitudeMode
        }
        catch (err)
        {
            // The camera is looking somewhere such that the view-ray does not intersect with the globe
            lookAt.latitude = Number.NaN;
            lookAt.longitude = Number.NaN;
            lookAt.altitude = Number.NaN;
        }
        finally
        {
            lookAt.heading = view.heading;
            lookAt.tilt = view.tilt;
            lookAt.range = view.altitude; // / Math.cos((90 + lookAt.tilt) * (Math.PI / 180));
        }

        this.empMapInstance.eventing.ViewChange(view, lookAt);
    };
    this.moveEnd = function (prevExtent, currExtent, zoomChanged, event)
    {
        if (this.moveEndTimerId)
        {
            clearTimeout(this.moveEndTimerId);
        }
        var that = this;
        this.moveEndTimerId = setTimeout(function ()
        {
            that.processMoveEnd(prevExtent, currExtent, zoomChanged, event);
        }, 250, prevExtent, currExtent, zoomChanged, event);
    };


    this.processViewChange = function (currExtent, mapViewEventEnum)
    {
        currExtent = currExtent || {};
        var center = this.getCenter();
        var view = {};
        view.bounds = {
            north: this.Math.toDegrees(currExtent.north),
            south: this.Math.toDegrees(currExtent.south),
            east: this.Math.toDegrees(currExtent.east),
            west: this.Math.toDegrees(currExtent.west)
        };
        view.location = {
            lon: this.Math.toDegrees(center.longitude),
            lat: this.Math.toDegrees(center.latitude)
        };
        view.range = Math.round(this.getCameraAltitude());// and this will be ??
        view.altitude = Math.round(this.getCameraAltitude());// of camera
        if (!isNaN(this.viewer.scene.camera.pitch))
        {
            view.tilt = this.viewer.scene.camera.pitch.toDeg() + 90;
            view.tilt = cesiumEngine.utils.normalizeAngleInDegrees(view.tilt);
            //view.tilt = view.tilt.toRad();
            //view.tilt =  this.Math.zeroToTwoPi( view.tilt);
            //view.tilt = view.tilt.toDeg();
        }
        if (!isNaN(this.viewer.scene.camera.roll))
        {
            view.roll = -this.viewer.scene.camera.roll.toDeg();
            //view.roll = this.Math.zeroToTwoPi(view.roll.toRad()).toDeg();
            view.roll = cesiumEngine.utils.normalizeAngleInDegrees(view.roll);
        }
        if (!isNaN(this.viewer.scene.camera.heading))
        {
            view.heading = -this.viewer.scene.camera.heading.toDeg();
            //view.heading = this.Math.zeroToTwoPi(view.heading.toRad()).toDeg();
            view.heading = cesiumEngine.utils.normalizeAngleInDegrees(view.heading);
        }
        view.scale = this.getScale(); //scale is the pixel to meter ratio of the current view extent.

        //var windowPosition = new Cesium.Cartesian2(this.viewer.container.clientWidth / 2, this.viewer.container.clientHeight / 2);
        //var pickRay = this.viewer.scene.camera.getPickRay(windowPosition);
        // var pickPosition = this.viewer.scene.globe.pick(pickRay, this.viewer.scene);
        var cameraPositionCartographic = this.viewer.camera.positionCartographic;

        var lookAt = {};
        try
        {
            //var pickPositionCartographic = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
            lookAt.latitude = this.Math.toDegrees(cameraPositionCartographic.latitude);
            lookAt.longitude = this.Math.toDegrees(cameraPositionCartographic.longitude);
            lookAt.altitude = 0.0; // Always revert to ground intercept, ignoring any altitude or altitudeMode
        }
        catch (err)
        {
            // The camera is looking somewhere such that the view-ray does not intersect with the globe
            lookAt.latitude = Number.NaN;
            lookAt.longitude = Number.NaN;
            lookAt.altitude = Number.NaN;
        }
        finally
        {
            lookAt.heading = view.heading;
            lookAt.tilt = view.tilt;
            lookAt.range = view.altitude; // / Math.cos((90 + lookAt.tilt) * (Math.PI / 180));
        }

        this.empMapInstance.eventing.ViewChange(view, lookAt, mapViewEventEnum);
    };


    this.viewChange = function (currExtent, mapViewEventEnum)
    {
        if (this.moveEndTimerId)
        {
            //clearTimeout(this.moveEndTimerId);
        }
        this.moveEndTimerId = setTimeout(function ()
        {
            this.processViewChange(currExtent, mapViewEventEnum);
            clearTimeout(this.moveEndTimerId);
        }.bind(this), 250, currExtent, mapViewEventEnum);
    };


    this.getFeature = function (featureId)
    {
        for (var layerId in this.empLayers)
        {
            var layer = this.getLayer(layerId);
            if (layer && layer.isFeaturePresentById(featureId))
            {
                return  layer.getFeature(featureId);
            }
        }
//        if (featureId === undefined || featureId === "")
//        {
//            return undefined;
//        }
//        var index = 0,
//                primitive,
//                primitiveInCollection;
//        if (this.entityCollection.getById(featureId))
//        {
//            return this.entityCollection.getById(featureId);
//        }
//        else if (this.primitives)
//        {
//            for (index = 0; index < this.primitives.length; index++)
//            {
//                primitive = this.primitives.get(index);
//                if (primitive instanceof this.BillboardCollection)
//                {
//                    if (primitive.id === featureId)
//                    {
//                        return primitive; //return the collection
//                    }
//                    primitiveInCollection = this.getPrimitive(featureId, primitive);
//                    if (primitiveInCollection)
//                    {
//                        return primitiveInCollection;
//                    }
//                }
//                else if (primitive.id && primitive.id === featureId)
//                {
//                    return primitive;
//                }
//            }
//        }

        return undefined;
    };

    // no layer required to remove a feature
    this.removeFeature = function (featureId)
    {
        var removed = false;

        for (var layerId in this.empLayers)
        {
            var layer = this.getLayer(layerId);
            if (layer && layer.isFeaturePresentById(featureId))
            {
                layer.removeFeatureById(featureId);
                removed = true;
                break;
            }
        }
        return  removed;
    };


    // no layer required to find  a feature
    this.isFeaturePresent = function (featureId)
    {
        var found = false;

        for (var layerId in this.empLayers)
        {
            var layer = this.getLayer(layerId);
            if (layer && layer.isFeaturePresentById(featureId))
            {
                found = true;
                break;
            }
        }
        return  found;
    };


    this.showFeature = function (featureId, visibility)
    {
        for (var layerId in this.empLayers)
        {
            var layer = this.getLayer(layerId);
            if (layer && layer.isFeaturePresentById(featureId))
            {
                layer.showFeature(featureId, visibility);
            }
        }
    };


    this.getFeatureChildren = function (featureId)
    {
        for (var layerId in this.empLayers)
        {
            var layer = this.getLayer(layerId);
            if (layer && layer.isFeaturePresentById(featureId))
            {
                return layer.getFeatureChildrenEntityArray(layer.getFeature(featureId));
            }
        }
        return [];
    };


    this.getPrimitive = function (featureId, billboardCollection)
    {
        var index = 0,
                primitive,
                primitiveInCollection;
        if (featureId === undefined || featureId === "")
        {
            return undefined;
        }
        if (!billboardCollection instanceof this.BillboardCollection)
        {
            return undefined;
        }
        if (billboardCollection)
        {
            for (index = 0; index < billboardCollection.length; index++)
            {
                primitive = billboardCollection.get(index);
                if (primitive instanceof this.BillboardCollection)
                {
                    primitiveInCollection = this.getPrimitive(featureId, primitive);
                    if (primitiveInCollection)
                    {
                        return primitiveInCollection;
                    }
                }
                else if (primitive.id && primitive.id === featureId)
                {
                    return primitive;
                }
                else if (primitive.id && primitive.id.id && primitive.id.id === featureId)
                {
                    return primitive;
                }
            }
        }

        return undefined;
    };
    this.transferTaisAirspaceToDrawData = function (airspace, drawData)
    {
        if (!Cesium.defined(drawData.properties))
        {
            // case of new draw
            drawData.properties = {};
            drawData.properties.symbolCode = airspace.SymbolCode;
            drawData.properties.fillColor = "FFAAFFAA";
            drawData.properties.lineColor = "FFAAAAAA";
            drawData.properties.description = "This an airspace feature generated by a draw request.";
            drawData.properties.lineWidth = 2;
            drawData.properties.altitudeMode = "relativeToGround";
            drawData.properties.disabled = false;
            drawData.properties.readOnly = false;
            drawData.properties.menuId = "";
            drawData.properties.status = "add";
            drawData.properties.format = "airspace";
            drawData.properties.attributes = [];
            drawData.properties.attributes.push({});
        }
        else if (!Cesium.defined(drawData.properties.attributes))
        {
            // case of new draw
            drawData.properties.attributes = [];
            drawData.properties.attributes.push({});
        }
        drawData.properties.attributes[0].minAlt = airspace.MinTerrainAltitude;
        drawData.properties.attributes[0].maxAlt = airspace.MaxTerrainAltitude;
        drawData.coordinates = cesiumEngine.utils.convertTaisCoordsDegreesToCartographicArray(airspace.AirspacePoints);
        this.transferTaisAirspaceLegsToDrawData(drawData, airspace.AirspaceLegs, airspace.AirspaceShapeType);
        drawData.geometryType = cesiumEngine.utils.getMilStandardGeometryTypeFromAirspaceSymbolCode(airspace.SymbolCode);
        drawData.airspace = airspace; // keep latest airspace object  from editors in draData
    };
    this.transferTaisAirspaceLegsToDrawData = function (drawData, legs, airspaceTaisShapeTypeValue)
    {
        var empTurnType = "right",
                empMinimumAltitudeMode = "relativeToGround",
                empAltitudeMode = "relativeToGround";
        for (var index = 0; index < legs.length; index++)
        {
            if (index > drawData.properties.attributes.length - 1)
            {
                drawData.properties.attributes.push({});
            }
            empTurnType = cesiumEngine.utils.convertTaisTurnTypeToEmp(legs[index].AirspaceTurnType);
            empMinimumAltitudeMode = cesiumEngine.utils.convertTaisAltitudeTypeToEmp(legs[index].AltitudeRange.LowerAltitudeType);
            empAltitudeMode = cesiumEngine.utils.convertTaisAltitudeTypeToEmp(legs[index].AltitudeRange.UpperAltitudeType);
            switch (airspaceTaisShapeTypeValue)
            {
                case 0: // cylinnder
                    drawData.properties.attributes[index].minAlt = legs[index].AltitudeRange.LowerAltitude;
                    drawData.properties.attributes[index].maxAlt = legs[index].AltitudeRange.UpperAltitude;
                    drawData.properties.attributes[index].radius = legs[index].Radius;
                    drawData.properties.attributes[index].turn = empTurnType;
                    drawData.properties.attributes[index].minimumAltitudeMode = empMinimumAltitudeMode;
                    drawData.properties.attributes[index].altitudeMode = empAltitudeMode;
                    break;
                case 2:// ORBIT
                case 7:// ROUTE
                    drawData.properties.attributes[index].minAlt = legs[index].AltitudeRange.LowerAltitude;
                    drawData.properties.attributes[index].maxAlt = legs[index].AltitudeRange.UpperAltitude;
                    drawData.properties.attributes[index].width = legs[index].WidthLeft;
                    drawData.properties.attributes[index].turn = empTurnType;
                    drawData.properties.attributes[index].minimumAltitudeMode = empMinimumAltitudeMode;
                    drawData.properties.attributes[index].altitudeMode = empAltitudeMode;
                    break;
                case 4:// POLYARC
                    drawData.properties.attributes[index].minAlt = legs[index].AltitudeRange.LowerAltitude;
                    drawData.properties.attributes[index].maxAlt = legs[index].AltitudeRange.UpperAltitude;
                    drawData.properties.attributes[index].radius = legs[index].Radius;
                    drawData.properties.attributes[index].leftAzimuth = legs[index].AzimuthLeft;
                    drawData.properties.attributes[index].rightAzimuth = legs[index].AzimuthRight;
                    drawData.properties.attributes[index].turn = empTurnType;
                    drawData.properties.attributes[index].minimumAltitudeMode = empMinimumAltitudeMode;
                    drawData.properties.attributes[index].altitudeMode = empAltitudeMode;
                    break;
                case 1: // CURTAIN
                case 5: // POLYGON
                    drawData.properties.attributes[index].minAlt = legs[index].AltitudeRange.LowerAltitude;
                    drawData.properties.attributes[index].maxAlt = legs[index].AltitudeRange.UpperAltitude;
                    drawData.properties.attributes[index].turn = empTurnType;
                    drawData.properties.attributes[index].minimumAltitudeMode = empMinimumAltitudeMode;
                    drawData.properties.attributes[index].altitudeMode = empAltitudeMode;
                    break;
                case 6:// radarc
                    drawData.properties.attributes[index].minAlt = legs[index].AltitudeRange.LowerAltitude;
                    drawData.properties.attributes[index].maxAlt = legs[index].AltitudeRange.UpperAltitude;
                    drawData.properties.attributes[index].radius = legs[index].OuterRadius;
                    drawData.properties.attributes[index].innerRadius = legs[index].Radius;
                    drawData.properties.attributes[index].leftAzimuth = legs[index].AzimuthLeft;
                    drawData.properties.attributes[index].rightAzimuth = legs[index].AzimuthRight;
                    drawData.properties.attributes[index].turn = empTurnType;
                    drawData.properties.attributes[index].minimumAltitudeMode = empMinimumAltitudeMode;
                    drawData.properties.attributes[index].altitudeMode = empAltitudeMode;
                    break;
                case 8:// track
                    drawData.properties.attributes[index].minAlt = legs[index].AltitudeRange.LowerAltitude;
                    drawData.properties.attributes[index].maxAlt = legs[index].AltitudeRange.UpperAltitude;
                    drawData.properties.attributes[index].leftWidth = legs[index].WidthLeft;
                    drawData.properties.attributes[index].rightWidth = legs[index].WidthRight;
                    drawData.properties.attributes[index].turn = empTurnType;
                    drawData.properties.attributes[index].minimumAltitudeMode = empMinimumAltitudeMode;
                    drawData.properties.attributes[index].altitudeMode = empAltitudeMode;
            }
        }
        if (drawData.properties.attributes.length > legs.length && (airspaceTaisShapeTypeValue == 7 || airspaceTaisShapeTypeValue == 8))
        {
            // case when legs were removed from tracks or routes
            drawData.properties.attributes.splice(legs.length - 1, drawData.properties.attributes.length - legs.length)
        }
    };
    this.pickFeatures = function (x, y)
    {
        var objects = this.scene.drillPick({
            x: x,
            y: y
        }), //27
                //todo verify objects returned
                features = [];
        for (var i = 0; i < objects.length; i++)
        {
            if (objects[i].primitive.id)
            {
                var feat = objects[i].primitive.id;
                /* Check whether we already added this feature */
                var contains = false;
                for (var j = 0; j < features.length; j++)
                {
                    if (features[j].id === feat.id && features[j].overlayId === feat.overlay)
                    {
                        contains = true;
                        break;
                    }
                }
                /* Add */
                if (!contains)
                {
                    features.push(feat);
                }
            }
            else if (objects[i].id)
            {
                var feat = objects[i].id;
                var pickedFeature;
                if (feat.id && typeof feat.id === "string" && feat.id.indexOf("label") > -1)
                {
                    // airspace label selected. select the airspace instead
                    var aispaceId = feat.id.replace("_label", "");
                    var airspacePresent = this.isAirspacePresent(aispaceId);
                    if (airspacePresent)
                    {
                        pickedFeature = this.getFeature(aispaceId);
                    }
                }
                else
                {
                    pickedFeature = feat;
                }
                /* Check whether we already added this feature */
                var contains = false;
                for (var j = 0; j < features.length; j++)
                {
                    if (features[j].id === pickedFeature.id && features[j].overlayId === pickedFeature.overlay)
                    {
                        contains = true;
                        break;
                    }
                }
                /* Add */
                if (!contains)
                {
                    features.push(pickedFeature);
                }
            }
        }

        return features;
    };
    this.cancelTerrain = function ()
    {
        this.terrainProvider = new this.EllipsoidTerrainProvider({
            tilingScheme: new this.GeographicTilingScheme({
                ellipsoid: this.ellipsoid
            })
        }); //b27 not verified
        this.cb.terrainProvider = this.terrainProvider;
    };
    this.onResize = function ()
    {
        var width = this.div.offsetWidth,
                height = this.div.offsetHeight;
        this.canvas.width = width;
        this.canvas.height = height;
        //todo: verify
        this.scene.camera.frustum.aspectRatio = width / height; //b27
    };
    this.setupResize = function ()
    {
        /* Deal with resizing window */
        this.onResize();
    };
    this.getMovementThreshold = function (zoomLevel)
    {
        if (zoomLevel >= 10000000)
            return 1000;
        else if (zoomLevel >= 7000000)
            return 50;
        else if (zoomLevel >= 6500000)
            return 10;
        else
            return .05;
    };
    this.cloneCamera = function (camera)
    {
        if (camera)
        {
            return {
                position: camera.position.clone(),
                direction: camera.direction.clone(),
                up: camera.up.clone(),
                right: camera.right.clone(),
                transform: camera.transform.clone(),
                positionCartographic: camera.positionCartographic,
                frustum: camera.frustum.clone()
            };
        }
        else
        {
            return undefined;
        }
    };
    this.isMoveSignificant = function ()
    {
        if (this.lastCamera === null)
        {
            //this.lastCamera = this.scene.camera.clone();// deprecated the cloning of camera in 1.10
            this.lastCamera = this.cloneCamera(this.scene.camera);
        }
        var lastCamera = this.lastCamera;
        var retVal = true;
        if (this.lastPosition && this.lastSignificantMove)
        {
            var diffX = Math.abs(this.lastPosition.x - this.lastSignificantMove.x);
            var diffY = Math.abs(this.lastPosition.y - this.lastSignificantMove.y);
            var diffZ = Math.abs(this.lastPosition.z - this.lastSignificantMove.z);
            var threshold = this.getMovementThreshold(Cesium.Cartesian3.magnitude(this.lastPosition));
            if (diffX < threshold && diffY < threshold && diffZ < threshold)
                retVal = false;
            if (diffX === 0 && diffY === 0 && diffZ === 0)
                this.wasMoving = false;
        }
        this.lastSignificantMove = this.lastPosition;
        return retVal;
    };
    this.reportMovement = function ()
    {
        if (this.wasMoving)
        {
            if (!(this.moveCount >= 0) || this.moveCount > 15)
            {
                this.events.triggerEvent("moveend", {
                    "zoomChanged": this.wasZooming
                });
                for (var x = 0; x < this.layers.length; x++)
                {
                    this.layers[x].events.triggerEvent("moveend", {
                        "zoomChanged": this.wasZooming
                    });
                }
                this.wasMoving = false;
                this.wasZooming = false;
                this.moveCount = 0;
            }
            this.moveCount++;
        }
        /* Note movement if above a certain threshhold */
        var newPos = this.scene.camera.position;
        var oldPos = this.lastPosition;
        var newFrustum = this.scene.camera.frustum;
        var oldFrustum = this.lastFrustum;
        if ((!newPos.equals(oldPos)) || ((this.scene.mode === this.SceneMode.SCENE2D && this.scene.camera.frustum) && (!newFrustum.equals(oldFrustum))))
        {
            this.wasMoving = true;
            if (!oldPos || Math.abs(Cesium.Cartesian3.magnitude(newPos) - this.Cartesian3.magnitude(oldPos)) > 100 ||
                    ((this.scene.mode === this.SceneMode.SCENE2D && this.scene.camera.frustum) &&
                            (!oldFrustum || (Math.abs(Math.abs(newFrustum.right - newFrustum.left) - Math.abs(oldFrustum.right - oldFrustum.left)) > 100))))
            {
                this.wasZooming = true;
            }
        }
        if (newPos.x !== null && newPos.y !== null && newPos.z !== null)
            this.lastPosition = new this.Cartesian3(newPos.x, newPos.y, newPos.z);
        this.lastFrustum = newFrustum && newFrustum.clone();
    };
    this.constrainZAxis = function ()
    {
        this.scene.camera.constrainedAxis = this.Cartesian3.UNIT_Z; //b27
    };
    this.getLayer = function (id)
    {
        if (this.empLayers.hasOwnProperty(id))
        {
            return this.empLayers[id];
        }
        else
        {
            return undefined;
        }
    };
    this.isLayer = function (id)
    {
        if (this.empLayers.hasOwnProperty(id))
        {
            return true;
        }
        else
        {
            return false;
        }
    };
//    this.removeImageryServiceFromDropDown = function (layer)
//    {
//        if ((layer.globalType === EmpCesiumConstants.layerType.ARCGIS_93_REST_LAYER) || (layer.globalType === EmpCesiumConstants.layerType.BING_LAYER) ||
//                (layer.globalType === EmpCesiumConstants.layerType.IMAGE_LAYER) || (layer.globalType === EmpCesiumConstants.layerType.OSM_LAYER) ||
//                (layer.globalType === EmpCesiumConstants.layerType.TMS_LAYER) || (layer.globalType === EmpCesiumConstants.layerType.WMS_LAYER)
//                 || (layer.globalType === EmpCesiumConstants.layerType.WMTS_LAYER))
//        {
//            // The disabling of  layer does not remove the imagery service from dropdown. Remove from drop down is next
//            var dropDown = this.dropDown;
//            if (dropDown)
//            {
//                for (var optionIndex = 0; optionIndex < dropDown.length; optionIndex++)
//                {
//                    //using layer serrvice name as dropdown value.
//                    if (dropDown.options[optionIndex].value === layer.name)
//                    {
//                        if (dropDown.selectedIndex === optionIndex)
//                        {
//                            dropDown.selectedIndex = 0;
//                        }
//                        dropDown.remove(optionIndex);
//                        dropDown.onchange();
//                        break;
//                    }
//                }
//            }
//        }
//    };
    this.enableLayer = function (layer, enable)
    {
        var providers;
        if (this.layerExists(layer))
        {
            layer.enabled = enable;
            for (var id in layer.subLayers)
            {
                if (layer.subLayers.hasOwnProperty(id))
                {
                    var subLayer = layer.getSubLayer(id);
                    if (subLayer)
                    {
                        enableLayer(subLayer, enable);
                    }
                }
            }
            //acevedo todo - need to implement enable or disable of layer's  features.
            //remove imagery providers is any assigned to this layer.
            if ((layer.globalType === EmpCesiumConstants.layerType.ARCGIS_93_REST_LAYER) || (layer.globalType === EmpCesiumConstants.layerType.BING_LAYER) ||
                    (layer.globalType === EmpCesiumConstants.layerType.IMAGE_LAYER) || (layer.globalType === EmpCesiumConstants.layerType.OSM_LAYER) ||
                    (layer.globalType === EmpCesiumConstants.layerType.TMS_LAYER) || (layer.globalType === EmpCesiumConstants.layerType.WMS_LAYER)
                    || (layer.globalType === EmpCesiumConstants.layerType.WMTS_LAYER))
            {
                providers = layer.providers;
                for (var providerIndex = 0; providerIndex < providers.length; providerIndex++)
                {
                    if (!enable && providers[providerIndex].imageryLayer && this.imageryLayerCollection.contains(providers[providerIndex].imageryLayer))
                    {
                        this.imageryLayerCollection.remove(providers[providerIndex].imageryLayer, true);
                        providers[providerIndex].imageryLayer = undefined;
                    }
                    else if (enable && !this.imageryLayerCollection.contains(providers[providerIndex].imageryLayer))
                    {
                        if (layer.globalType === EmpCesiumConstants.layerType.IMAGE_LAYER)
                        {
                            // image on top of rest of existing layers.
                            // todo : Will emp3 handle image layer hierarchy based on order list as shown in tree?? Like the one with highest index
                            // showing at top of all layers? answer - Cesium is handling it already.
                            if (layer.isTopLayer)
                            {
                                // brightness layer is a layer that is on top.
                                var imageryLayer = this.imageryLayerCollection.addImageryProvider(providers[providerIndex].provider);
                            }
                            else
                            {
                                //render layer behind the brightness black and white layers
                                var imageryLayer = this.imageryLayerCollection.addImageryProvider(providers[providerIndex].provider, this.imageryLayerCollection.length - 2);
                            }
                            providers[providerIndex].imageryLayer = imageryLayer;
                        }
                        else
                        {
                            // providerIndex + 1 because index 0 is already occupied by the default background layer (natural earth)
                            //var imageryLayer = this.imageryLayerCollection.addImageryProvider(providers[providerIndex].provider, this.imageryLayerCollection.length);
                            var imageryLayer = this.imageryLayerCollection.addImageryProvider(providers[providerIndex].provider, this.imageryLayerCollection.length - 2);
                            providers[providerIndex].imageryLayer = imageryLayer;
                        }
                    }
                }
            }
        }
    };
    this.layerExists = function (layer)
    {
        if (this.empLayers.hasOwnProperty(layer.id))
        {
            return true;
        }
        else
        {
            return false;
        }
    };
    this.isNavigationEnabled = function ()
    {
        if (this.viewer)
        {
            return this.viewer.scene.screenSpaceCameraController.enableRotate &&
                    this.viewer.scene.screenSpaceCameraController.enableTranslate &&
                    this.viewer.scene.screenSpaceCameraController.enableZoom &&
                    this.viewer.scene.screenSpaceCameraController.enableTilt &&
                    this.viewer.scene.screenSpaceCameraController.enableLook;
        }
        else
        {
            //default
            return true;
        }
    };
    this.addLayer = function (layer)
    {
        if (layer instanceof EmpLayer)
        {
            this.empLayers[layer.id] = layer;
        }
    };
    this.getCesiumProxyObj = function (url)
    {
        return new this.DefaultProxy(this.proxyUrl);
    };
    this.setProxyUrl = function (url)
    {
        this.proxyUrl = url;
    };
    this.getProxyUrl = function ()
    {
        return this.proxyUrl;
    };
    this.raiseImageryLayer = function (layer)
    {
        // acevedo todo -  function  needs redesign.....
        if (layer instanceof EmpLayer && layer.globalType === EmpCesiumConstants.layerType.WMS_LAYER)
        {
            this.imageryLayerCollection.raise(layer.imageryLayer);
        }
    };
    this.lowerImageryLayer = function (layer)
    {
        // acevedo todo -  function  needs redesign.....
        if (layer instanceof EmpLayer && layer.globalType === EmpCesiumConstants.layerType.WMS_LAYER)
        {
            this.imageryLayerCollection.lower(layer.imageryLayer);
        }
    };
    this.containsImageryLayer = function (layer)
    {
        // acevedo todo -  function  needs redesign.....
        ///if (layer instanceof EmpLayer && layer.globalType === EmpCesiumConstants.layerType.WMS_LAYER)
        //{
        if (layer && layer.providers && layer.providers.length > 0)
        {
            return this.imageryLayerCollection.contains(layer.providers[0].imageryLayer);
        }
        else
        {
            return false;
        }
        //}
    };
    this.lowerImageryLayerToBottom = function (layer)
    {
        // acevedo todo -  function  needs redesign.....
        ///if (layer instanceof EmpLayer && layer.globalType === EmpCesiumConstants.layerType.WMS_LAYER)
        //{
        if (this.containsImageryLayer(layer.imageryLayer))
        {
            this.imageryLayerCollection.lowerToBottom(layer.imageryLayer);
        }
        //}
    };
    this.raiseImageryLayerToTop = function (layer)
    {
        // acevedo todo -  function  needs redesign.....
        ///if (layer instanceof EmpLayer && layer.globalType === EmpCesiumConstants.layerType.WMS_LAYER)
        //{
        if (this.containsImageryLayer(layer.imageryLayer))
        {
            this.imageryLayerCollection.raiseToTop(layer.imageryLayer);
        }
        //}
    };
    this.indexOfImageryLayer = function (layer, providerIndex)
    {
        // acevedo todo -  function  needs redesign.....
        ///if (layer instanceof EmpLayer && layer.globalType === EmpCesiumConstants.layerType.WMS_LAYER)
        //{
        if (layer.providers && layer.providers.length > 0)
        {
            return this.imageryLayerCollection.indexOfLayer(layer.providers[providerIndex].imageryLayer);
        }
        else
        {
            return -1;
        }
        //}
    };
    this.removeLayer = function (layer)
    {
        for (var id in layer.subLayers)
        {
            if (layer.subLayers.hasOwnProperty(id))
            {
                var subLayer = layer.getSubLayer(id);
                if (subLayer)
                {
                    subLayer.clearLayer();
                    delete this.empLayers[subLayer.id];
                }
            }
        }
        layer.clearLayer();
        delete this.empLayers[layer.id];
    };
    this.setTerrainEnabled = function (enable)
    {
        if (enable)
        {
            this.terrainProvider = new this.ArcGisImageServerTerrainProvider({
                url: this.terrainURL,
                proxy: new this.DefaultProxy(this.terrainProxyUrl)
            });
        }
        else
        {
            this.terrainProvider = new this.EllipsoidTerrainProvider({
                tilingScheme: new this.GeographicTilingScheme({
                    ellipsoid: this.ellipsoid
                })
            });
        }
        this.cb.terrainProvider = this.terrainProvider;
    };
    this.getLonLatFromPixel = function (pos)
    {
        var pointCartographic = new this.Cartographic();
        if (pos)
        {
            var ellipsoid = this.ellipsoid;
            var center = {
                x: this.canvas.width / 2,
                y: this.canvas.height / 2
            };
            try
            {
                /* Get the height of the center of the screen to base calculation on */
                for (var pass = 0; pass < 2; pass++)
                {
                    var cartesian = this.scene.camera.pickEllipsoid(new this.Cartesian2(center.x, center.y), ellipsoid);
                    var point = new this.Cartographic();
                    ellipsoid.cartesianToCartographic(cartesian, point);
                    point.radians = true;
                    var radius = 6378137;
                    var height = point.height;
                    if (height)
                    {
                        radius += height;
                    }
                    ellipsoid = new this.Ellipsoid(radius, radius, radius * 0.9966471);
                }
            }
            catch (developerError)
            {
                /* Center of map isn't pointed at earth */
            }
            var p;
            try
            {
                p = this.scene.camera.pickEllipsoid(new this.Cartesian2(pos.x, pos.y), ellipsoid);
            }
            catch (developerError)
            {
                /* Requested point isn't over map */
                p = false;
            }
            if (p)
            {
                this.ellipsoid.cartesianToCartographic(p, pointCartographic);
                if (!pointCartographic)
                    pointCartographic = {
                        latitude: -1000,
                        longitude: -1000
                    };
                return pointCartographic;
            }
        }
        else
        {
            throw new Error("Position is required");
        }
        pointCartographic = new this.Cartographic(-1000, -1000);
        return pointCartographic;
    };
    this.getLonLatFromViewPortPx = function (viewPortPx)
    {
        return this.getLonLatFromPixel(viewPortPx);
    };

    this.getExtent = function ()
    {
        var rect;
        if (this.currentExtent && (!isNaN(parseFloat(this.currentExtent.west)) && !isNaN(parseFloat(this.currentExtent.south)) && !isNaN(parseFloat(this.currentExtent.east)) && !isNaN(parseFloat(this.currentExtent.north))))
        {
            return this.currentExtent;
        }
        rect = this.scene.camera.computeViewRectangle(this.scene.globe.ellipsoid);
        if (!rect)
        {
            rect = this.getExtentApproximation();
        }
        else if (rect.equals(this.Rectangle.MAX_VALUE))
        {
            // sec renderer throw errors when using max value for rectangle.
            // Get an approximation that is going to be smaller
            rect = this.getExtentApproximation();
        }

        this.currentExtent = rect;
        return  this.currentExtent;
    };



    this.getSmartMoveExtent = function ()
    {
        var rect;
        if (this.currentSmartMoveExtent && (!isNaN(parseFloat(this.currentSmartMoveExtent.west)) && !isNaN(parseFloat(this.currentSmartMoveExtent.south)) && !isNaN(parseFloat(this.currentSmartMoveExtent.east)) && !isNaN(parseFloat(this.currentSmartMoveExtent.north))))
        {
            return this.currentSmartMoveExtent;
        }
        rect = this.scene.camera.computeViewRectangle(this.scene.globe.ellipsoid);
        if (!rect)
        {
            rect = this.getExtentApproximation();
        }
        else if (rect.equals(this.Rectangle.MAX_VALUE))
        {
            // sec renderer throw errors when using max value for rectangle.
            // Get an approximation that is going to be smaller
            rect = this.getExtentApproximation();
        }

        this.currentExtent = rect;
        return  this.currentExtent;
    };

    this.getExtentApproximation = function ()
    {
        var west,
                east,
                north,
                south,
                westRad,
                eastRad,
                northRad,
                southRad,
                c2,
                leftTop,
                rightDown,
                maxX,
                minX,
                maxY,
                minY;

        c2 = new this.Cartesian2(0, 0);
        leftTop = this.scene.camera.pickEllipsoid(c2, this.scene.globe.ellipsoid);

        if (leftTop !== undefined)
        {
            c2 = new this.Cartesian2(this.scene.canvas.width, this.scene.canvas.height, 0);
            rightDown = this.scene.camera.pickEllipsoid(c2, this.scene.globe.ellipsoid);
        }

        if (leftTop !== undefined && rightDown !== undefined)
        {
            leftTop = this.scene.globe.ellipsoid.cartesianToCartographic(leftTop);
            rightDown = this.scene.globe.ellipsoid.cartesianToCartographic(rightDown);
            west = leftTop.longitude;
            east = rightDown.longitude;
            north = leftTop.latitude;
            south = rightDown.latitude;
            northRad = north;
            southRad = south;
            westRad = west;
            eastRad = east;

            if (north < south)
            {
                var oCLLCenter = this.scene.camera.positionCartographic; //this.scene.globe.ellipsoid.cartesianToCartographic(oCartesianCenter);
                var oCenterLat = oCLLCenter.latitude.toDeg();
                var oCenterLon = oCLLCenter.longitude.toDeg();
                north = Math.floor(oCenterLat + 60.0); // 60 deg North of center.
                if (north > 90.0)
                {
                    north = 90.0;
                }
                northRad = north.toRad();
                south = Math.floor(oCenterLat - 60.0); // 60 deg south of center.
                if (south < -90.0)
                {
                    south = -90.0;
                }
                southRad = south.toRad();
                west = ((Math.floor((oCenterLon - 60)) % 360) - 180); // 60 deg west of center.
                westRad = west.toRad();
                east = ((Math.floor((oCenterLon + 60)) % 360) - 180); // 60 deg east of center.
                eastRad = east.toRad();

                if (north < south)
                {
                    console.log("Camera cal extend incorrect.");
                }
            }
        }
        else
        {
            var oCLLCenter = this.scene.camera.positionCartographic;
            var oCenterLat = oCLLCenter.latitude.toDeg();
            var oCenterLon = oCLLCenter.longitude.toDeg();

            north = (oCenterLat + 60.0);
            north = (north > 90.0) ? 90.0 : north;
            northRad = north.toRad();

            south = (oCenterLat - 60.0);
            south = (south < -90.0) ? -90.0 : south;
            southRad = south.toRad();

            west = ((oCenterLon + 120.0) % 360) - 180.0;
            westRad = west.toRad();

            east = ((oCenterLon + 240.0) % 360) - 180.0;
            eastRad = east.toRad();

            if (north < south)
            {
                console.log("Camera cal extend incorrect.");
            }
        }
        this.currentExtent = new this.Rectangle(westRad, southRad, eastRad, northRad);
        return this.currentExtent;
    };


    this.isSkyWithinMapVisibleArea = function ()
    {
        if (this.defined(this.isSkyVisible))
        {
            return this.isSkyVisible;
        }
        var isSkyVisible = false,
                c2 = new this.Cartesian2(0, 0),
                leftTop;
        leftTop = this.scene.camera.pickEllipsoid(c2, this.scene.globe.ellipsoid);
        c2 = new this.Cartesian2(this.scene.canvas.width, this.scene.canvas.height, 0);
        var rightDown = this.scene.camera.pickEllipsoid(c2, this.scene.globe.ellipsoid);
        if (leftTop !== undefined && rightDown !== undefined)
        {
            isSkyVisible = false;
        }
        else
        {
            isSkyVisible = true;
        }
        this.isSkyVisible = isSkyVisible;
        return isSkyVisible;
    };
    this.pan = function (dx, dy, options)
    {
        //todo: need to set height in set positionCartographic to hieght in meters
        this.scene.camera.setPositionCartographic(new this.Cartographic(dx, dy)); //b27
    };
    this.zoomIn = function ()
    {
        this.scene.camera.zoomIn(); //b27
    };
    this.zoomOut = function ()
    {
        this.scene.camera.zoomOut(); //b27
    };
    /*
     *  This replaces the scene's (private var) camera.
     *  It's only use (as of this) is just to pull out of following a dynamic feature because the
     *  camera is in such a complicated state that it's easier to just rip it out and
     *  recreate it.
     */
    this.resetView = function ()
    {
        /* Set up variables */
        var scene = this.scene;
        delete scene._camera;
        scene._camera = new this.Camera(this.canvas);
        this.constrainZAxis();
        scene._screenSpaceCameraController = new this.ScreenSpaceCameraController(this.canvas, scene.getCamera().controller);
    };
    /* Get the camera's current view information */
    this.getCameraView = function ()
    {
        /* Get bounds */
        var bounds = this.getExtent();
        /* 3D Mode */
        if (this.scene.mode === this.SceneMode.SCENE3D)
        {
            /* Save camera */
            var camera = this.scene.camera;
            var view = {
                position: camera._positionWC.clone(),
                orientation: {
                    right: camera._rightWC.clone(),
                    up: camera._upWC.clone()
                },
                direction: camera._directionWC.clone(),
                bounds: bounds
            };
            return view;
            /* 2D Mode */
        }
        else
        {
            /* Just return bounds */
            return {
                bounds: bounds
            };
        }
    };
    /* Rotate the earth so that the axis between the poles is vertical */
    this.correctOrientation = function ()
    {
        var camera = this.scene.camera; //b27

        camera.right = camera.direction.cross(Cesium.Cartesian3.UNIT_Z).normalize();
        camera.up = camera.right.cross(camera.direction);
    };
    /* Point the camera toward the earth */
    this.pointTowardEarth = function ()
    {
        var camera = this.scene.camera; //b27

        camera.direction = camera.position.negate().normalize();
    };
    this.zoomToMaxExtent = function (options)
    {
        /* For 2D mode, just show the whole map */
        if (this.scene.mode === this.SceneMode.SCENE2D)
        {
            this.scene.camera.viewRectangle(Cesium.Rectangle.MAX_VALUE, this.ellipsoid);
        }
        else
        {
            this.pointTowardEarth();
            this.correctOrientation();
            /* Raise to max extent altitude */
            this.flyToAltitude(this.MAX_EXTENT_ALTITUDE * 1000, 500);
        }
    };
    /* Sets the camera altitude, given in meters */
    this.setCameraAltitude = function (altitude)
    {
        var camera = this.scene.camera;
        if (this.scene.mode === this.SceneMode.SCENE3D)
        {
            var camPos = this.getCameraPosition();
            camPos.height = altitude;
            var camPos1 = new this.Cartographic();
            this.ellipsoid.cartesianToCartographic(camera.position, camPos1);
            /* Little trick to try to get the right height when holding middle-click.
             * Seems the camera.position/camera._position values trade places being
             * way off. */
            var camPos2 = new this.Cartographic();
            this.ellipsoid.cartesianToCartographic(camera.position, camPos2);
            if (camPos1.height < 0)
            {
                this.ellipsoid.cartographicToCartesian(camPos, camera.position);
            }
            else
            {
                this.ellipsoid.cartographicToCartesian(camPos, camera.position);
            }
        }
        else
        {
            if (altitude > 40000000)
            {
                this.zoomToMaxExtent();
                return;
            }
            var ratio = camera.frustum.right / camera.frustum.top;
            var right = altitude / 2;
            var top = right / ratio;
            //todo check this b27
            camera.frustum.right = right;
            camera.frustum.left = -right;
            camera.frustum.top = top;
            camera.frustum.bottom = -top;
        }
    };
    /* Directly set the camera's position (takes a this.Cartographic) */
    this.setCameraPosition = function (position)
    {
        var camera = this.scene.camera;
        if (this.scene.mode === this.SceneMode.SCENE3D)
        {
            camera.position = position;
        }
        else
        {
            var projection = this.scene.frameState.scene2D.projection;
            camera.position = projection.project(position);
            this.setCameraAltitude(position.height);
        }
    };
    this.getCameraPosition = function ()
    {
        var camera = this.scene.camera,
                camPos = new this.Cartographic();
        this.ellipsoid.cartesianToCartographic(camera.position, camPos);
        /* Little trick to try to get the right height when holding middle-click.
         * Seems the camera.position/camera._position values trade places being
         * way off. */
        var camPos2 = new this.Cartographic();
        this.ellipsoid.cartesianToCartographic(camera.position, camPos2);
        if (camPos.height < 0)
            camPos = camPos2;
        return camPos;
    };
    /* Returns the current camera altitude */
    this.getCameraAltitude = function ()
    {
        var camera = this.scene.camera; //27

        if (this.scene.mode === this.SceneMode.SCENE3D)
        {
            var camPos = this.getCameraPosition();
            return camPos.height;
        }
        else
        {
            return camera.frustum.right - camera.frustum.left;
        }
    };
    /* Raise camera by given number of meters */
    this.raiseCameraBy = function (distance)
    {
        this.setCameraAltitude(this.getCameraAltitude() + distance);
    };
    this.zoomToExtent = function (item)
    {
        var west,
                east,
                north,
                south,
                extent,
                duration = 0;
        // If we're trying to zoom to a point, add a tiny bit to the
        // right just so we don't divide by zero later
        if (item.bounds.west === item.bounds.east && item.bounds.north === item.bounds.south)
        {
            item.bounds.east += 0.000001;
        }
        west = this.Math.toRadians(item.bounds.west);
        south = this.Math.toRadians(item.bounds.south);
        east = this.Math.toRadians(item.bounds.east);
        north = this.Math.toRadians(item.bounds.north);
        extent = new this.Rectangle(west, south, east, north);
        //prevent graphics from not showing completely in the specifIed view or extent
        //extent = cesiumEngine.utils.getRectangleWithBufferFromRectangle (extent);

        if (this.currentExtent && this.viewTransaction && this.Math.equalsEpsilon(this.currentExtent.west, extent.west, this.Math.EPSILON7) &&
                this.Math.equalsEpsilon(this.currentExtent.south, extent.south, this.Math.EPSILON7) &&
                this.Math.equalsEpsilon(this.currentExtent.east, extent.east, this.Math.EPSILON7) &&
                this.Math.equalsEpsilon(this.currentExtent.north, extent.north, this.Math.EPSILON7))
        {
            // zoom to extent provided is the same as the current  extent so
            // the map moved end event is never truggered to run the viewTransaction. Run the transaction here
            //run transaction
            //this.viewTransaction.run();
            //this.viewTransaction = undefined;
            this.FlyToComplete();
            return;
        }

        if (this.defined(item.animate))
        {
            duration = (item.animate === true) ? 1 : 0;
        }

        this.currentExtent = extent;
        var oThis = this;
        var oTrans = this.viewTransaction;
        // We set this to undefined to stop the camera moveEnd handler from processing the event.
        this.viewTransaction = undefined;
        this.scene.camera.flyTo({
            destination: extent,
            duration: duration,
            complete: function ()
            {
                oThis.viewTransaction = oTrans;
                if (item.range && !isNaN(item.range))
                {
                    // There is a range set so we need to set to the range now.
                    oThis.flyToAltitude(item.range, duration);
                }
                else
                {
                    oThis.FlyToComplete();
                }
            }
        });

    };
    this.moveTo = function (lonlat, zoom, duration)
    {
        if (!(duration >= 0))
        {
            duration = undefined;
        }
        var alt;
        if (zoom > -4)
        {
            alt = this.zLevelToAltitude(zoom);
        }
        else
        {
            alt = this.getCameraAltitude();
        }
        var destination = this.Cartographic.fromDegrees(lonlat.lon || lonlat.longitude, lonlat.lat || lonlat.latitude, alt);
        this.flyTo(destination, duration);
    };
    this.flyToAltitude = function (altitude, duration)
    {
        //var center = this.getCenter();
        var camPos = this.viewer.camera.positionCartographic;
        var destination = this.Cartesian3.fromRadians(camPos.longitude, camPos.latitude, altitude);

        this.flyTo({
            destination: destination,
            duration: duration
        });
    };
    this.flyTo = function (args)
    {
        var range;
        var duration = 0;

        if (this.defined(args.duration) && !isNaN(args.duration))
        {
            duration = args.duration;
        }
        range = args.range === "auto" ? undefined : args.range;
        if (args.range !== "auto" && !Cesium.defined(args.range))
        {
            range = 10000;
        }
        if (args.destination && args.destination.featureType && args.destination.featureType === EmpCesiumConstants.featureType.DATA_SOURCE)
        {
            //destination is a dataSource
            this.viewer.flyTo(args.destination, {
                duration: duration
            });
        }
        else if (args.destination && args.destination.featureType && args.destination.featureType === EmpCesiumConstants.featureType.ENTITY)
        {
            //destination is an entity
            if (args.destination.position)
            {
                var cartographic = this.ellipsoid.cartesianToCartographic(args.destination.position.getValue());
                if (cartographic)
                {
                    range = (cartographic.height >= 0) ? cartographic.height + 10000 : 10000;
                }
            }
            this.viewer.flyTo(args.destination, {
                duration: duration,
                offset: new this.HeadingPitchRange(Cesium.Math.toRadians(0), this.Math.toRadians(-90), range)
            });
        }
        else
        {
            var oThis = this;
            //destination is an extent or cartesian3
            this.viewer.camera.flyTo({
                destination: args.destination,
                orientation: args.orientation,
                //offset: (this.defined(args.orientation))?undefined:new this.HeadingPitchRange(Cesium.Math.toRadians(90), this.Math.toRadians(-30), range),
                duration: duration,
                complete: function ()
                {
                    oThis.FlyToComplete();
                }
            });
        }
    };
    this.flyToBoundingSphere = function (args)
    {
        var oThis = this;
        var duration = args.duration || 1,
                options = {};
        options.duration = duration;
        options.complete = function ()
        {
            oThis.FlyToComplete();
        };
        this.viewer.camera.flyToBoundingSphere(args.boundingSphere, options);
    };
    this.flyToPrimitive = function (args)
    {
        var oThis = this;
        var duration = args.duration || 1,
                cartographics,
                rectangle,
                cartographics = this.getPrimitiveCartographicArray(args.destination);
        if (cartographics)
        {
            if (cartographics.length > 1)
            {
                rectangle = this.Rectangle.fromCartographicArray(cartographics);
//            rectangle.west = this.Math.toRadians(Cesium.Math.toDegrees(rectangle.west) - EmpCesiumConstants.extentBufferDegrees);
//            rectangle.south = this.Math.toRadians(Cesium.Math.toDegrees(rectangle.south) - EmpCesiumConstants.extentBufferDegrees);
//            rectangle.north = this.Math.toRadians(Cesium.Math.toDegrees(rectangle.north) + EmpCesiumConstants.extentBufferDegrees);
//            rectangle.east = this.Math.toRadians(Cesium.Math.toDegrees(rectangle.east) + EmpCesiumConstants.extentBufferDegrees);
                this.viewer.camera.flyTo({
                    destination: rectangle,
                    duration: duration,
                    orientation: {heading: 0.0, pitch: this.Math.toRadians(-90), roll: 0.0},
                    complete: function ()
                    {
                        oThis.FlyToComplete();
                    }
                });
            }
            else if (cartographics.length === 1)
            {
                cartographics[0].height = (cartographics[0].height >= 0) ? cartographics[0].height + 10000 : 10000;
                var cartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographics[0]);
                this.viewer.camera.flyTo({
                    destination: cartesian,
                    duration: duration,
                    //orientation: {heading: 0.0, pitch: this.Math.toRadians(-80), roll: 0.0}
                    complete: function ()
                    {
                        oThis.FlyToComplete();
                    }
                });
            }
        }
    };
    this.getZoom = function ()
    {
        var alt = this.getCameraAltitude();
        return Math.round(Math.log(6000000 / alt) / Math.log(2));
    };
    this.getExactZoom = function ()
    {
        var alt = this.getCameraAltitude();
        return Math.log(6000000 / alt) / Math.log(2);
    };
    this.zLevelToAltitude = function (zoom)
    {
        return 6000000 / (Math.pow(2, zoom));
    };
    this.getResolution = function ()
    {
        var xpix = this.canvas.width / 2,
                ypix = this.canvas.height / 2;
        try
        {
            var coord1 = new this.Cartographic();
            this.ellipsoid.cartesianToCartographic(this.scene.camera.pickEllipsoid(new this.Cartesian2(xpix, ypix), this.ellipsoid), coord1); //27
            var coord2 = new this.Cartographic();
            this.ellipsoid.cartesianToCartographic(this.scene.camera.pickEllipsoid(new this.Cartesian2(xpix + 1, ypix + 1), this.ellipsoid), coord2); //27
        }
        catch (e)
        {
            return null;
        }
        /* Defaults to avoid exceptions */
        coord1 = coord1 || {
            latitude: 0,
            longitude: 0
        };
        coord2 = coord2 || {
            latitude: 1,
            longitude: 1
        };
        var dx = this.Math.toDegrees(coord2.longitude) - this.Math.toDegrees(coord1.longitude);
        var dy = this.Math.toDegrees(coord2.latitude) - this.Math.toDegrees(coord1.latitude);
        return Math.sqrt((dx * dx) + (dy * dy));
    };
    this.getScale = function ()
    {
        if (!this.scale)
        {
            this.calculateScale();
        }
        return this.scale;
    };
    this.setScale = function (scale)
    {
        this.scale = scale;
    };

    this.distances = [
        .1, .15, .25, .5, .75,
        1, 2, 3, 4, 5,
        10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
        100, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 600, 625, 650, 675, 700, 725, 750, 775, 800, 825, 850, 875, 900, 925, 950, 975,
        1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000, 3250, 3500, 3750, 4000, 4250, 4500, 4750, 5000, 5250, 5500, 5750, 6000, 6250, 6500, 6750, 7000, 7250, 7500, 7750, 8000, 8250, 8500, 8750, 9000, 9250, 9500, 9750,
        10000, 12500, 15000, 17500, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000, 95000,
        100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 375000, 400000, 425000, 450000, 475000, 500000, 525000, 550000, 575000, 600000, 625000, 650000, 675000, 700000, 725000, 750000, 800000, 825000, 850000, 875000, 900000, 925000, 950000, 975000,
        1000000, 1250000, 1500000, 1750000, 2000000, 2250000, 2500000, 2750000, 3000000, 3250000, 3750000, 4000000, 4250000, 4500000, 4750000, 5000000, 5250000, 5500000, 5750000, 6000000, 6250000, 6500000, 6750000, 7000000, 7250000, 7500000, 7750000, 8000000, 8250000, 8500000, 8750000, 9000000,
        9250000, 9500000, 9750000,
        10000000, 12500000, 15000000, 17500000, 20000000, 22500000, 25000000, 27500000, 30000000, 32500000, 35000000, 37500000, 40000000, 42500000, 45000000, 47500000, 50000000];

    this.calculateScale = function ()
    {
        // setTimeout($.proxy(function ()
        //{
        var pixelDistance;
        if (this.scene.mode === this.SceneMode.SCENE2D)
        {
            this.scale = this.calculateCameraAltitude();
        }
        else
        {
            // Find the distance between two pixels at the bottom center of the screen.
            var width = this.canvas.clientWidth;
            var height = this.canvas.clientHeight;
            var left = this.scene.camera.getPickRay(new this.Cartesian2((width / 2) | 0, height - 1));
            var right = this.scene.camera.getPickRay(new this.Cartesian2(1 + (width / 2) | 0, height - 1));
            var globe = this.scene.globe;
            var leftPosition = globe.pick(left, this.scene);
            var rightPosition = globe.pick(right, this.scene);
            if (!Cesium.defined(leftPosition) || !Cesium.defined(rightPosition))
            {
                this.scale = 500000;
                return;
            }
            var leftCartographic = new this.Cartographic();
            leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPosition);
            var rightCartographic = new this.Cartographic();
            rightCartographic = globe.ellipsoid.cartesianToCartographic(rightPosition);
            var geodesic = new this.EllipsoidGeodesic(leftCartographic, rightCartographic);
            geodesic.setEndPoints(leftCartographic, rightCartographic);
            var pixelDistance = geodesic.surfaceDistance;
            // Find the first distance that makes the scale bar less than 100 pixels.
            var maxBarWidth = 100;
            var distance = maxBarWidth * pixelDistance;
//                for (var i = this.distances.length - 1; !this.defined(distance) && i >= 0; --i)
//                {
//                    if (this.distances[i] / pixelDistance < maxBarWidth)
//                    {
//                        distance = this.distances[i];
//                    }
//                }
//                if (!this.defined(distance))
//                {
//                    this.distance = 50000000;
//                }
            this.scale = distance;
        }
        // }, this), 0);
    };
    this.getViewPortPxFromLayerPx = function (layerPx)
    {
        return layerPx;
    };
    this.getLayerPxFromViewPortPx = function (viewPortPx)
    {
        return viewPortPx;
    };
    this.addPopup = function (popup, exclusive)
    {
        if (exclusive)
        {
            //remove all other popups from screen
            for (var i = this.popups.length - 1; i >= 0; --i)
            {
                this.removePopup(this.popups[i]);
            }
        }
        popup.map = this;
        popup.panMapIfOutOfView = false;
        this.popups.push(popup);
        var popupDiv = popup.draw();
        if (popupDiv)
        {
            popupDiv.style.zIndex = this.Z_INDEX_BASE['Popup'] + this.popups.length;
            this.viewPortDiv.appendChild(popupDiv);
        }
    };
    /**
     * Override OpenLayers.Map.getCachedCenter to return center of cesium layer.
     */
    this.getCachedCenter = function ()
    {
        return this.getCenter();
    };
    this.getCenter = function ()
    {
        return   this.viewer.camera.positionCartographic;
//        if (!this.defined(centerCartographic))
//        {
//
//
//        var windowPosition = new this.Cartesian2(this.viewer.container.clientWidth / 2, this.viewer.container.clientHeight / 2);
//        var pickRay = this.viewer.scene.camera.getPickRay(windowPosition);
//        var pickPosition = this.viewer.scene.globe.pick(pickRay, this.viewer.scene);
//        if (!this.defined(pickPosition))
//        {
//                return this.getLonLatFromPixel({
//                x: this.canvas.width / 2,
//                y: this.canvas.height / 2
//            });
//        }
//        else
//        {
//            return this.viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
//        }
        //var pickPositionCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
        //console.log(pickPositionCartographic.longitude * (180/Math.PI));
        //console.log(pickPositionCartographic.latitude * (180/Math.PI));

    };


    this.activateNavigation = function ()
    {
        /* Test whether the controller has been disabled */
        if (!this.scene.screenSpaceCameraController.enableInputs)
        {
            this.scene.screenSpaceCameraController.enableInputs = true;
        }
    };
    this.deactivateNavigation = function ()
    {
        if (this.scene)
        {
            this.scene.screenSpaceCameraController.enableInputs = false;
        }
    };
    this.do2DView = function ()
    {
        this.scene.morphTo2D(1000); //27
        this.cb.affectedByLighting = false;
    };
    this.doColumbusView = function ()
    {
        this.scene.morphToColumbusView(1000); //27
    };
    this.do3DView = function ()
    {
        this.scene.morphTo3D(1000); //27
        this.deactivateNavigation();
        this.activateNavigation();
    };
    this.isFeatureSelected = function (id)
    {
        if (this.empSelections.hasOwnProperty(id))
        {
            return true;
        }

        return false;
    };
    this.getFeatureSelection = function (id)
    {
        if (this.isFeatureSelected(id))
        {
            return this.empSelections[id];
        }

        return null;
    };
    this.storeFeatureSelection = function (id, deselectProperties)
    {
        this.empSelections[id] = deselectProperties;
    };
    this.removeFeatureSelection = function (id)
    {
        if (this.empSelections.hasOwnProperty(id))
        {
            delete this.empSelections[id];
            return true;
        }

        return false;
    };
    this.getSelections = function ()
    {
        return this.empSelections;
    };
    this.isMultiPointPresent = function (id)
    {
        if (this.multiPointCollection.hasOwnProperty(id))
        {
            return true;
        }

        return false;
    };
    this.getMultiPoint = function (id)
    {
        if (this.isMultiPointPresent(id))
        {
            return this.multiPointCollection[id];
        }

        return null;
    };
    this.storeMultiPoint = function (multiPoint)
    {
        this.multiPointCollection[multiPoint.id] = multiPoint;
    };
    this.removeMultiPoint = function (id)
    {
        if (this.multiPointCollection.hasOwnProperty(id))
        {
            delete this.multiPointCollection[id];
            return true;
        }

        return false;
    };
    this.isAirspacePresent = function (id)
    {
        if (this.airspaceCollection.hasOwnProperty(id))
        {
            return true;
        }

        return false;
    };
    this.getAirspace = function (id)
    {
        if (this.isAirspacePresent(id))
        {
            return this.airspaceCollection[id];
        }

        return null;
    };
    this.storeAirspace = function (airspace)
    {
        this.airspaceCollection[airspace.id || airspace.coreId ] = airspace;
    };
    this.removeAirspace = function (id)
    {
        if (this.airspaceCollection.hasOwnProperty(id))
        {
            delete this.airspaceCollection[id];
            return true;
        }

        return false;
    };
    this.getSinglePoints = function ()
    {
        return this.singlePointCollection;
    };
    this.isSinglePointPresent = function (id)
    {
        if (this.singlePointCollection.hasOwnProperty(id))
        {
            return true;
        }

        return false;
    };
    this.getSinglePoint = function (id)
    {
        if (this.isSinglePointPresent(id))
        {
            return this.singlePointCollection[id];
        }

        return null;
    };
    this.storeSinglePoint = function (singlePoint)
    {
        this.singlePointCollection[singlePoint.id] = singlePoint;
        this.singlePointCount += 1;
    };
    this.removeSinglePoint = function (id)
    {
        if (this.isSinglePointPresent(id))
        {
            delete this.singlePointCollection[id];
            this.singlePointCount -= 1;
            return true;
        }

        return false;
    };
    this.getSinglePoints = function ()
    {
        return this.singlePointCollection;
    };

    this.getSinglePointCount = function ()
    {
        return this.singlePointCount;
//        if (this.defined(this.singlePointCollection))
//        {
//            return Object.keys(this.singlePointCollection).length;
//        }
//        else
//        {
//            return 0;
//        }
    };

    this.isSinglePointIdOnHoldPresent = function (id)
    {
        if (this.singlePointCollectionIdOnHold.hasOwnProperty(id))
        {
            return true;
        }

        return false;
    };

    this.getSinglePointIdOnHold = function (id)
    {
        if (this.isSinglePointIdOnHoldPresent(id))
        {
            return this.singlePointCollectionOnHold[id];
        }

        return null;
    };
    this.storeSinglePointIdOnHold = function (singlePointId)
    {
        this.singlePointCollectionIdOnHold[singlePointId] = singlePointId;
        this.singlePointsIdOnHoldCount += 1;
    };
    this.removeSinglePointIdOnHold = function (id)
    {
        if (this.isSinglePointIdOnHoldPresent(id))
        {
            delete this.singlePointCollectionIdOnHold[id];
            this.singlePointsIdOnHoldCount -= 1;
            return true;
        }

        return false;
    };
    this.getSinglePointsIdOnHold = function ()
    {
        return this.singlePointCollectionIdOnHold;
    };

    this.getSinglePointsIdOnHoldCount = function ()
    {
        return  this.singlePointsIdOnHoldCount;
//        if (this.defined(this.singlePointCollectionIdOnHold))
//        {
//            return Object.keys(this.singlePointCollectionIdOnHold).length;
//        }
//        else
//        {
//            return 0;
//        }
    };


    this.projectionEnableFlat = function (enable)
    {
        if (enable && enable === true)
        {
            this.scene.morphTo2D();
        }
        else
        {
            this.scene.morphTo3D();
        }
    };
    this.getTimeStamp = function ()
    {
        return this.getTimestamp();
    };
    this.isMapMoving = function ()
    {
        var camera = this.viewer.camera,
                isMoving = false,
                currentCameraAltitude;
        try
        {
            if ((!Cesium.Math.equalsEpsilon(camera._position.x, this.lastCamera.position.x, this.multipointRedrawEpsilon)) ||
                    (!Cesium.Math.equalsEpsilon(camera.direction.y, this.lastCamera.direction.y, this.multipointRedrawEpsilon)) ||
                    (!Cesium.Math.equalsEpsilon(camera.up.x, this.lastCamera.up.x, this.multipointRedrawEpsilon)) ||
                    (!Cesium.Math.equalsEpsilon(camera.right.y, this.lastCamera.right.y, this.multipointRedrawEpsilon)) ||
                    (!Cesium.Math.equalsEpsilon(camera.positionCartographic.height, this.lastCamera.positionCartographic.height, this.multipointRedrawEpsilon)) ||
                    (!Cesium.Math.equalsEpsilon(camera.frustum.far, this.lastCamera.frustum.far, this.multipointRedrawEpsilon)))
            {
                isMoving = true;
                currentCameraAltitude = this.calculateCameraAltitude();
                if (!Cesium.Math.equalsEpsilon(this.cameraAltitude, currentCameraAltitude, this.multipointRedrawEpsilon))
                {
                    // altitude changed. calculate new  scale
                    this.calculateScale();
                    this.cameraAltitude = currentCameraAltitude;
                    //this.singlePointAltitudeRangeMode = cesiumEngine.utils.getSinglePointAltitudeRangeMode(this.cameraAltitude, this.singlePointAltitudeRanges);
                }
                this.lastCamera = this.cloneCamera(camera);
            }
        }
        catch (e)
        {
            console.log("isMapMoving error: " + e);
        }

        return isMoving;
    }.bind(this);
    this.calculateCameraAltitude = function ()
    {
        var altitude;
        if (this.scene.mode === this.SceneMode.SCENE3D)
        {
            altitude = this.scene.globe.ellipsoid.cartesianToCartographic(this.scene.camera.position).height;
        }
        else if (this.scene.mode === this.SceneMode.SCENE2D)
        {
            altitude = (this.scene.camera.frustum.right - this.scene.camera.frustum.left) * 0.5;
        }
        else if (this.scene.mode === this.SceneMode.COLUMBUS_VIEW)
        {
            altitude = this.scene.camera.position.z;
        }
        else
        {
            //assume mode is COLUMBUS_VIEW so we can always get an altitude not matter the mode. The mode is not getting set when switching modes...bug in sdk???
            altitude = this.scene.camera.position.z;
        }

        return altitude;
    };
    // parameter booelan showingOnly = true to include in the count only the features showing on the map,
    //  false to include in the count  the features that are not showing on the map.
    this.getMultipointCountWithinCurrentFrustrum = function (showingOnly)
    {
        var scale = this.getScale(),
                multipointKey,
                multipoint,
                mapExtent,
                bbox1,
                within,
                withinCount = 0;
        try
        {
            if (scale <= 50000000 || (this.prevScale < 50000000 && scale > 5000000))
            {
                mapExtent = this.getExtent();
                bbox1 = mapExtent;
                for (multipointKey in this.multiPointCollection)
                {
                    if (this.multiPointCollection[multipointKey] !== undefined)
                    {
                        try
                        {
                            multipoint = this.multiPointCollection[multipointKey];
                            var feature = this.entityCollection.getById(multipointKey);
                            if (feature !== null && feature !== undefined && feature.show === true)
                            {
                                within = this.checkWithin(feature, bbox1);
                                if (within === true && showingOnly && feature.show)
                                {
                                    withinCount++;
                                }
                                else if (within === true && !showingOnly)
                                {
                                    withinCount++;
                                }
                            }
                        }
                        catch (err)
                        {
                            new emp.typeLibrary.Error({
                                level: emp.typeLibrary.Error.level.MAJOR,
                                message: err.name + ": " + err.message,
                                jsError: err
                            });
                        }
                    }
                }
            }
        }
        catch (e)
        {

        }
        this.prevScale = scale;
        return withinCount;
    };
    /**
     * @desc Checks if coordinates are within the bounding box.
     * @param {object} coordinates - Coordinates of a feature on the map.
     * @param {object} bbox - The current bounding box of map.
     * @returns {boolean} within - Whether the coordinates are within the bbox or not.
     */
    this.checkWithin = function (feature, bbox1)
    {
        var within = false,
                coordinates = "",
                coords,
                lat,
                lon,
                childrenLen,
                layer,
                bbox1Degrees,
                bbox2;
        layer = this.getLayer(feature.overlayId);
        if (layer)
        {
            childrenLen = layer.featureChildrenLength(feature);
            bbox1Degrees = {
                "left": this.Math.toDegrees(bbox1.west),
                "bottom": this.Math.toDegrees(bbox1.south),
                "right": this.Math.toDegrees(bbox1.east),
                "top": this.Math.toDegrees(bbox1.north)
            };
            if (feature.polyline)
            {
                var positionsCartesians = feature.polyline.positions._value;
                for (var index = 0; index < positionsCartesians.length; index++)
                {
                    var positionCartesian = positionsCartesians[index];
                    if (positionCartesian instanceof this.Cartesian3)
                    {
                        var positionCartographic = this.Ellipsoid.WGS84.cartesianToCartographic(positionCartesian);
                        if (coordinates.length === 0)
                        {
                            coordinates = "" + this.Math.toDegrees(positionCartographic.longitude) + "," + this.Math.toDegrees(positionCartographic.latitude);
                        }
                        else
                        {
                            coordinates += " " + this.Math.toDegrees(positionCartographic.longitude) + "," + this.Math.toDegrees(positionCartographic.latitude);
                        }
                    }
                }
            }
            if (feature.billboard)
            {

            }
            if (feature.polygon)
            {
                var positionsCartesians = feature.polygon.hierarchy._value.positions;
                for (var index = 0; index < positionsCartesians.length; index++)
                {
                    var positionCartesian = positionsCartesians[index];
                    if (positionCartesian instanceof this.Cartesian3)
                    {
                        var positionCartographic = this.Ellipsoid.WGS84.cartesianToCartographic(positionCartesian);
                        if (coordinates.length === 0)
                        {
                            coordinates = "" + this.Math.toDegrees(positionCartographic.longitude) + "," + this.Math.toDegrees(positionCartographic.latitude);
                        }
                        else
                        {
                            coordinates += " " + this.Math.toDegrees(positionCartographic.longitude) + "," + this.Math.toDegrees(positionCartographic.latitude);
                        }
                    }
                }
            }
            if (feature.position)
            {
                var positionCartesian = feature.position._value;
                if (positionCartesian instanceof this.Cartesian3)
                {
                    var positionCartographic = this.Ellipsoid.WGS84.cartesianToCartographic(positionCartesian);
                    if (coordinates.length === 0)
                    {
                        coordinates = "" + this.Math.toDegrees(positionCartographic.longitude) + "," + this.Math.toDegrees(positionCartographic.latitude);
                    }
                    else
                    {
                        coordinates += " " + this.Math.toDegrees(positionCartographic.longitude) + "," + this.Math.toDegrees(positionCartographic.latitude);
                    }
                }
            }
            if (feature.rectangle)
            {
                var rectangleCordinates = feature.rectangle.coordinates ? feature.rectangle.coordinates : feature.rectangle;
                var northWestCoordinateCartographic = new this.Cartographic(rectangleCordinates.west, rectangleCordinates.north);
                var southEastCoordinateCartographic = new this.Cartographic(rectangleCordinates.east, rectangleCordinates.south);
                if (coordinates.length === 0)
                {
                    coordinates = "" + this.Math.toDegrees(northWestCoordinateCartographic.longitude) + "," + this.Math.toDegrees(northWestCoordinateCartographic.latitude);
                }
                else
                {
                    coordinates += " " + this.Math.toDegrees(northWestCoordinateCartographic.longitude) + "," + this.Math.toDegrees(northWestCoordinateCartographic.latitude);
                }
                coordinates += " " + this.Math.toDegrees(southEastCoordinateCartographic.longitude) + "," + this.Math.toDegrees(southEastCoordinateCartographic.latitude);
            }
            coords = coordinates.split(" ");
            if (coords.length > 1)
            {
                bbox2 = new cesiumEngine.geoLibrary.BoundingBox(coordinates);
                if (cesiumEngine.geoLibrary.doesBoundingBoxIntersect(bbox1Degrees, bbox2) ||
                        cesiumEngine.geoLibrary.doesBoundingBoxIntersect(bbox2, bbox1Degrees))
                {
                    within = true;
                }
                if (!within && bbox2.bottom && bbox2.top && bbox2.left && bbox2.right)
                {
                    if (cesiumEngine.geoLibrary.checkLineIntersectsBox(bbox1Degrees, bbox2.left, bbox2.top, bbox2.right, bbox2.bottom) ||
                            cesiumEngine.geoLibrary.checkLineIntersectsBox(bbox1Degrees, bbox2.left, bbox2.bottom, bbox2.right, bbox2.top))
                    {
                        within = true;
                    }
                }
            }
            else if (coordinates.length > 0)
            {
                coords = coordinates.split(",");
                lat = parseFloat(coords[1]);
                lon = parseFloat(coords[0]);
                within = cesiumEngine.geoLibrary.pointInBbox(bbox1Degrees, lon, lat);
            }
            else if (childrenLen > 0)
            {

            }
        }

        return within;
    };
    this.checkMultipointIntersecting = function (feature, bbox1)
    {
        var isIntersecting = false;
        //var rectangle = feature.rectangle.coordinates._callback(Cesium.JulianDate.fromDate(new Date()));
        var rectangle = feature.rectangle.coordinates.getValue();
        if (!this.defined(rectangle))
        {
            var cartographics = cesiumEngine.utils.convertCoordsDegreesToCartographicArray({type: this.multiPointCollection[feature.id].type, coordinates: this.multiPointCollection[feature.id].coordinates});
            rectangle = this.Rectangle.fromCartographicArray(cartographics);
        }
        else if (rectangle.west === 0 || rectangle.south === 0 || rectangle.east === 0 || rectangle.north === 0)
        {
            var cartographics = cesiumEngine.utils.convertCoordsDegreesToCartographicArray({type: this.multiPointCollection[feature.id].type, coordinates: this.multiPointCollection[feature.id].coordinates});
            rectangle = this.Rectangle.fromCartographicArray(cartographics);
        }
        if (this.Rectangle.intersection(bbox1, rectangle))
        {
            // if there is an intresection then the function return a rectangle. No intersection return undefined.
            isIntersecting = true;
        }
        else
        {
            // completely within so it is not intersecting?
            //rectangle = cesiumEngine.utils.getRectangleWithBufferFromRectangle(rectangle);
            var rectangleTopWestCarto = new this.Cartographic(rectangle.west, rectangle.north, 0);
            var rectangleBottomEastCarto = new this.Cartographic(rectangle.east, rectangle.south, 0);
            if (this.Rectangle.contains(bbox1, rectangleTopWestCarto) || this.Rectangle.contains(bbox1, rectangleBottomEastCarto))
            {
                isIntersecting = true;
            }
        }
        return isIntersecting;
    };



    this.checkMultipointClipped = function (feature, bbox1)
    {
        var isClipped = false;
        if (feature.rectangle)
        {
            if (!Cesium.Rectangle.contains(bbox1, this.Rectangle.northeast(feature.rectangle)) ||
                    !Cesium.Rectangle.contains(bbox1, this.Rectangle.northwest(feature.rectangle)) ||
                    !Cesium.Rectangle.contains(bbox1, this.Rectangle.southeast(feature.rectangle)) ||
                    !Cesium.Rectangle.contains(bbox1, this.Rectangle.southwest(feature.rectangle)))
            {
                isClipped = true;
            }
        }

        return isClipped;
    };
    /**
     * @desc Checks if coordinates are within the bounding box.
     * @param {object} coordinates - Coordinates of a feature on the map.
     * @param {object} bbox - The current bounding box of map.
     * @returns {boolean} within - Whether the coordinates are within the bbox or not.
     */
    this.getEntityCartographicArray = function (entity)
    {
        var coordCartographics = [],
                childrenLen,
                layer;
        if (!entity)
        {
            return coordCartographics;
        }
        if (entity.polyline)
        {
            var positionsCartesians = entity.polyline.positions._value;
            for (var index = 0; index < positionsCartesians.length; index++)
            {
                var positionCartesian = positionsCartesians[index];
                if (positionCartesian instanceof this.Cartesian3)
                {
                    var positionCartographic = this.Ellipsoid.WGS84.cartesianToCartographic(positionCartesian);
                    coordCartographics.push(positionCartographic);
                }
            }
        }
        if (entity.billboard)
        {

        }
        if (entity.polygon)
        {
            var positionsCartesians = entity.polygon.hierarchy._value.positions;
            for (var index = 0; index < positionsCartesians.length; index++)
            {
                var positionCartesian = positionsCartesians[index];
                if (positionCartesian instanceof this.Cartesian3)
                {
                    var positionCartographic = this.Ellipsoid.WGS84.cartesianToCartographic(positionCartesian);
                    coordCartographics.push(positionCartographic);
                }
            }
        }
        if (entity.position)
        {
            var positionCartesian = entity.position.getValue(new this.JulianDate());
            if (positionCartesian instanceof this.Cartesian3)
            {
                var positionCartographic = this.Ellipsoid.WGS84.cartesianToCartographic(positionCartesian);
                coordCartographics.push(positionCartographic);
            }
        }
        if (entity.rectangle)
        {
            //var rectangleCordinates = entity.rectangle.coordinates._callback();
            var rectangleCordinates = entity.rectangle.coordinates.getValue();
            var northWestCoordinateCartographic = new this.Cartographic(rectangleCordinates.west, rectangleCordinates.north);
            var southEastCoordinateCartographic = new this.Cartographic(rectangleCordinates.east, rectangleCordinates.south);
            coordCartographics.push(northWestCoordinateCartographic);
            coordCartographics.push(southEastCoordinateCartographic);
        }
        layer = this.getLayer(entity.overlayId);
        if (layer)
        {
            childrenLen = layer.featureChildrenLength(entity);
            if (childrenLen > 0)
            {
                var childrenEntities = layer.getFeatureChildrenEntityArray(entity);
                for (var index = 0; index < childrenLen; index++)
                {
                    var entityChild = childrenEntities[index];
                    var coordCartographicsofChildren = this.getEntityCartographicArray(entityChild);
                    if (coordCartographicsofChildren.length > 0)
                    {
                        coordCartographics = coordCartographics.concat(coordCartographicsofChildren);
                    }
                }
            }
        }

        return coordCartographics;
    };
    this.getPrimitiveCartographicArray = function (feature)
    {
        var cartographics = [],
                cartesians = [],
                index = 0,
                carto,
                cartoSW,
                cartoNE;
        if (feature.geometryInstances && feature.geometryInstances.length > 0 && feature.geometryInstances[0].geometry)
        {
            for (index = 0; index < feature.geometryInstances.length; index++)
            {
                if (feature.geometryInstances[index].geometry._polygonHierarchy)
                {
                    cartesians = cartesians.concat(feature.geometryInstances[index].geometry._polygonHierarchy.positions);
                }
                else if (feature.geometryInstances[index].geometry._positions)
                {
                    cartesians = cartesians.concat(feature.geometryInstances[index].geometry._positions);
                }
            }
            cartographics = this.Ellipsoid.WGS84.cartesianArrayToCartographicArray(cartesians);
        }
        else if (feature.rectangle)
        {
            cartoSW = new this.Cartographic(feature.rectangle.west, feature.rectangle.south, 0);
            cartoNE = new this.Cartographic(feature.rectangle.east, feature.rectangle.north, 0);
            cartographics.push(cartoSW);
            cartographics.push(cartoNE);
        }
        else if (feature && feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION)
        {
            if (this.isSinglePointPresent(feature.id))
            {
                // singlepoint mil standard
                if (feature.altitude && feature.altitude > 0)
                {
                    carto = new this.Cartographic.fromDegrees(feature.coordinates[0], feature.coordinates[1], feature.altitude);
                }
                else
                {
                    carto = new this.Cartographic.fromDegrees(feature.coordinates[0], feature.coordinates[1], 500);
                }
                cartographics.push(carto);
            }
        }
        //todo get coordinates from other shape primitives. This function only considers polygons like in airspaces from tais
        return cartographics;
    };

    /**
     * Allows a developer to call a function multiple times without locking
     * up the web browser.
     * @param  {object} args Contains the parameters to create a Batch object.
     * @param {function} args.callback The function to call as it iterates over an array.
     * This function will be called for each item in an array.
     * @param {object} args.ge The google earth object.  This is needed so that the Batch
     * can perform a google earth operation.
     */
    this.Batch = (function (batch)
    {
        this.callback = batch.callback;
        this.array = [];
        this.empCesium = batch.empCesium;
        this.timeout = 0;
        this.transaction = undefined;
        /**
         * A private call to the callback.  This will not make any attempt
         * to cancel a previous call to call back.  The public function executeBatch
         * will check if a call to this function has already been made and attempt
         * to cancel it.
         * @param  {object} args The object that contains the parameters for this function
         */
        this.privateExecuteBatch = function (batch)
        {
            var that = this,
                    startTime = new Date().getTime(),
                    currentTime = new Date().getTime(),
                    index = batch.index,
                    batchSizeLImit = 40;
            // this.empCesium.entityCollection.suspendEvents();
            while (((currentTime - startTime) < batch.consumptionTime) && (index < batch.array.length))
            {
                if (this.empCesium.isMapMoving())
                {
                    // skip the redraw of multipoints is map is moving;
                    index = batch.array.length;
                    break;
                }
                // assign the array passed in as the array we should be working on.
                this.array = batch.array;
//                if (!this.empCesium.isMultiPointPresent(this.array[index].args.id))
//                {
//                    index++;
//                    break;
//                }
                //this.callback(this.array[index].args);
                // index++;
                var subArray = this.array.slice(index); //from index to end of array
                if (subArray.length >= batchSizeLImit)
                {
                    var subArrayFilteredOutDeleted = [];
                    subArray = subArray.slice(0, batchSizeLImit);
                    for (var subIndex = 0; subIndex < batchSizeLImit; subIndex++)
                    {
                        if (subArray[subIndex] && this.empCesium.isMultiPointPresent(subArray[subIndex].id))
                        {
                            subArray[subIndex].intent = "redraw";
                            subArrayFilteredOutDeleted.push(subArray[subIndex]);// remove already deleted multipoint. no need to refresh.
                        }
                    }
                    // move to the next item in the array.
                    index += batchSizeLImit;
                    subArray = subArrayFilteredOutDeleted;
                }
                else
                {
                    //this.callback(subArray);
                    var len = subArray.length;
                    var subArrayFilteredOutDeleted = [];
                    for (var subIndex = 0; subIndex < len; subIndex++)
                    {

                        if (subArray[subIndex] && this.empCesium.isMultiPointPresent(subArray[subIndex].id))
                        {
                            subArray[subIndex].intent = "redraw";
                            subArrayFilteredOutDeleted.push(subArray[subIndex]);// remove already deleted multipoint. no need to refresh.
                        }
                    }
                    // move to the next items in the array.
                    index += len;
                    subArray = subArrayFilteredOutDeleted;
                }
                this.callback(subArray);
                currentTime = new Date().getTime();
            }
            //this.empCesium.entityCollection.resumeEvents();
            this.empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
            this.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
            if (index < batch.array.length)
            {
                this.timeout = setTimeout(function ()
                {
                    that.privateExecuteBatch({
                        array: batch.array,
                        index: index,
                        consumptionTime: batch.consumptionTime,
                        timeToWait: batch.timeToWait,
                        transaction: batch.transaction
                    });
                }, batch.timeToWait);
            }
            else
            {
                if (batch.transaction)
                {
                    batch.transaction.run();
                }
            }
        };
    });
    /**
     * Executes the callback once for each time of an array passed in.  The execution
     * of the callback is split over the processing time passed in and breaks for the allotted
     * amount of time specified in the paramters.  This will help prevent javascript lockups for
     * a browser.  If the call is executed more than once, it will cancel further calls to the
     * callback on the previous call.
     *
     * @param  {object} args The object that contains the parameters for this function
     * @param {array} args.array Each item in the array will be used as a parameter for a single
     * call to the Batch object's callback.
     * @param {number} [args.index] The starting index that should be sent into the Batch's callback.
     * @param {number} args.consumptionTime the estimated amount of time that this function will use
     * to call the Batch object's callback function.  This is estimated, if the callback takes longer
     * @param {number} args.timeToWait The amount of time to wait between the Batch's initial run
     * of the callback over the array (taking up the entire consumptionTime) and the
     * next time the Batch's runs the callback on the rest of the array.
     * @param {Transaction} [args.transaction] If you need to pause a transaction and later run
     * after the Batch has been processed.
     */
    this.Batch.prototype.executeBatch = function (batch)
    {
        var that = this,
                startTime = new Date().getTime(), // Get the time of this call
                currentTime = new Date().getTime(), // Use this time to determine how much time has lapsed.
                index = batch.index || 0, // Determine where the index that we should start at.
                batchSizeLImit = 40;

        // If this function is called it should cancel any ongoing
        // calls that it is making.  This will prevent that.
        //this.empCesium.entityCollection.suspendEvents();
        if (this.timeout)
        {
            clearTimeout(this.timeout);
            if (this.transaction)
            {
                this.transaction.run();
            }
        }
        // assign the array passed in as the array we should be working on.
        this.array = batch.array;
        // if a transaction was passed in, pause it.
        if (batch.transaction)
        {
            this.transaction = batch.transaction;
            batch.transaction.pause();
        }
        // Do the work until all the time has ellpased or we processed
        // all the elements in the array, continually
        // calling our callback function set in the constructor.
        // Each iteration we will pass in the next item of the array.
        while (((currentTime - startTime) < batch.consumptionTime) && (index < batch.array.length))
        {
            if (this.empCesium.isMapMoving())
            {
                // skip the redraw of multipoints is map is moving;
                index = batch.array.length;
                break;
            }
            // Run the callback with the next item in the array.
//            if (!this.empCesium.isMultiPointPresent(this.array[index].args.id))
//            {
//                index++;
//                break;
//            }
            var subArray = this.array.slice(index); //from index to end of array
            if (subArray.length >= batchSizeLImit)
            {
                subArray = subArray.slice(0, batchSizeLImit);
                var subArrayFilteredOutDeleted = [];
                for (var subIndex = 0; subIndex < batchSizeLImit; subIndex++)
                {
                    if (subArray[subIndex] && this.empCesium.isMultiPointPresent(subArray[subIndex].id))
                    {
                        subArray[subIndex].intent = "redraw";
                        subArrayFilteredOutDeleted.push(subArray[subIndex]);// remove already deleted multipoint. no need to refresh.
                    }
                }
                // move to the next item in the array.
                index += batchSizeLImit;
                subArray = subArrayFilteredOutDeleted;
            }
            else
            {
                //this.callback(subArray);
                var len = subArray.length;
                var subArrayFilteredOutDeleted = [];
                for (var subIndex = 0; subIndex < len; subIndex++)
                {
                    if (subArray[subIndex] && this.empCesium.isMultiPointPresent(subArray[subIndex].id))
                    {
                        subArray[subIndex].intent = "redraw";
                        subArrayFilteredOutDeleted.push(subArray[subIndex]);// remove already deleted multipoint. no need to refresh.
                    }
                }
                // move to the next items in the array.
                index += len;
                subArray = subArrayFilteredOutDeleted;
            }
            this.callback(subArray);
            ////this.callback(this.array[index].args);
            // update the current time so in the next loop
            // we know ho much time has passed.
            currentTime = new Date().getTime();
        }

        // this.empCesium.entityCollection.resumeEvents();
        this.empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        this.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        // If the time has ellapsed but there are more items
        // left to process in the array, set a timeout
        // and finish in a little bit.  This temporarily give
        // control back to the browser and can sometimes prevent
        // timeouts.
        if (index < batch.array.length)
        {
            // Save this timer in case execute gets called
            // again.  If it does we will clear the time preventing
            // the rest of the items from being processed and
            // start from the beginning.
            this.timeout = setTimeout(function ()
            {
                that.privateExecuteBatch({
                    array: batch.array,
                    index: index,
                    consumptionTime: batch.consumptionTime,
                    timeToWait: batch.timeToWait,
                    transaction: batch.transaction
                });
            }, batch.timeToWait);
        }
        else
        {
            // if we are finished processing the items call run
            // on the transaction.
            if (batch.transaction)
            {
                batch.transaction.run();
            }
        }

    };
    this.isDestroyed = function ()
    {
        return false;
    };
    this.destroy = function ()
    {
        try
        {
            if (this.airspaceInit)
            {
                this.airspaceInit.destroy();
                this.airspaceInit = undefined;
            }
            if (this.primitives)
            {
                this.primitives = null;
            }
            if (this.globe && this.globe.viewer && this.globe.viewer.dataSources)
            {
                this.globe.viewer.dataSources.removeAll(true);
                this.globe.viewer.dataSources.destroy();
            }
            if (this.imageryLayerCollection)
            {
                this.imageryLayerCollection.removeAll();
                this.imageryLayerCollection = null;
            }
            if (this.terrainRemoveCallback)
            {
                this.terrainRemoveCallback();
            }
            this.terrainProvider = null;

            if (this.removeCameraMoveStartListener)
            {
                this.removeCameraMoveStartListener();
            }
            this.removeCameraMoveStartListener = null;

            if (this.removeCameraMoveEndListener)
            {
                this.removeCameraMoveEndListener();
            }
            this.removeCameraMoveEndListener = null;


            if (this.entityCollection)
            {
                this.entityCollection.removeAll();
                this.entityCollection = null;
            }
            if (!this.viewer.isDestroyed())
            {
                try
                {
                    this.viewer.destroy();
                }
                catch (e)
                {
                    new emp.typeLibrary.Error({
                        level: emp.typeLibrary.Error.level.MAJOR,
                        message: "An error was generated while destroying the viewer. " + e.name + ": " + e.message,
                        jsError: e
                    });
                }
            }
            if (this.airspaceInit)
            {
                this.airspaceInit.destroy();
                this.airspaceInit = undefined;
            }
            if (this.viewer && this.viewer.navigation)
            {
                this.viewer.navigation.destroy();
                if (window.define && window.define.amd)
                {
                    window.define.amd = undefined;
                }
                if (window.define)
                {
                    window.define = undefined;
                }
            }
            // destroy workers
            this.secRendererWorker.A.terminate();
            this.secRendererWorker.B.terminate();
            this.secRendererWorker.Selection.terminate();
            this.secRendererWorker.DeSelection.terminate();
            //window.empCesium = null;
            this.globe = null;
            this.empLayers = null;
            this.empSelections = null;
            this.multiPointCollection = null;
            this.singlePointCollection = null;
            if (this.drawHelper)
            {
                this.drawHelper.destroy();
            }
            this.lastCamera = null;
            this.refreshBatch = null;
            this.refreshLabelsSizeBatch = null;
            this.viewer = undefined;
            //window.onbeforeunload =  undefined;
        }
        catch (e)
        {
            new emp.typeLibrary.Error({
                level: emp.typeLibrary.Error.level.MAJOR,
                message: "An error was generated while destroying Cesium resources allocated to webgl. " + e.name + ": " + e.message,
                jsError: e
            });
        }
    };
//    this.getMultipointExtent = function (cartographicArray, mods, scale, scaleMultiplier)
//    {
//        var distance,
//                rectangle,
//                coordDegreesRight,
//                coordDegreesLeft,
//                coordDegreesTop,
//                coordDegreesBottom,
//                renderingCameraAltitude =  this.cameraAltitude ;
//        if (cartographicArray.length === 1)
//        {
//            distance = 10000;
//            if (mods.distance && mods.distance.length > 1)
//            {
//                for (var index = 0; index < mods.distance.length; index++)
//                {
//                    if (distance < mods.distance[index])
//                    {
//                        distance = mods.distance[index];
//                    }
//                }
//            }
//            distance = distance * renderScaleFactorAssigned;
//            distance = (distance > 10000) ? distance : 10000;
//            coordDegreesRight = emp.geoLibrary.geodesic_coordinate({
//                "y": this.Math.toDegrees(cartographicArray[0].latitude),
//                "x": this.Math.toDegrees(cartographicArray[0].longitude)
//            }, distance * 3, 0);
//            coordDegreesLeft = emp.geoLibrary.geodesic_coordinate({
//                "y": this.Math.toDegrees(cartographicArray[0].latitude),
//                "x": this.Math.toDegrees(cartographicArray[0].longitude)
//            }, distance * 3, 180);
//            coordDegreesTop = emp.geoLibrary.geodesic_coordinate({
//                "y": this.Math.toDegrees(cartographicArray[0].latitude),
//                "x": this.Math.toDegrees(cartographicArray[0].longitude)
//            }, distance * 3, 90);
//            coordDegreesBottom = emp.geoLibrary.geodesic_coordinate({
//                "y": this.Math.toDegrees(cartographicArray[0].latitude),
//                "x": this.Math.toDegrees(cartographicArray[0].longitude)
//            }, distance * 3, -90);
//            cartographicArray.push(new this.Cartographic(Cesium.Math.toRadians(coordDegreesRight.x), this.Math.toRadians(coordDegreesRight.y)));
//            cartographicArray.push(new this.Cartographic(Cesium.Math.toRadians(coordDegreesLeft.x), this.Math.toRadians(coordDegreesLeft.y)));
//            cartographicArray.push(new this.Cartographic(Cesium.Math.toRadians(coordDegreesTop.x), this.Math.toRadians(coordDegreesTop.y)));
//            cartographicArray.push(new this.Cartographic(Cesium.Math.toRadians(coordDegreesBottom.x), this.Math.toRadians(coordDegreesBottom.y)));
//            cartographicArray = cesiumEngine.utils.convertCartographicsToCoordinatesRange(cartographicArray);
//            rectangle = this.Rectangle.fromCartographicArray(cartographicArray);
//        }
//        else if (cartographicArray.length > 1)
//        {
//            cartographicArray = cesiumEngine.utils.convertCartographicsToCoordinatesRange(cartographicArray);
//            rectangle = this.Rectangle.fromCartographicArray(cartographicArray);
//        }
//
//        return rectangle;
//    };
    this.redrawGraphics = function ()
    {
        var scale = this.getScale(),
                multipointKey,
                multipoint,
                mapExtent,
                batch = [],
                args = {},
                isIntersecting = false,
                wasMultipointClipped = false,
                alreadyRedrawn = false,
                redrawAgain = false,
                isSkyVisible = false;
        try
        {
            if (scale <= 50000000 || (this.prevScale < 50000000 && scale > 5000000))
            {
                this.currentExtent = undefined;
                mapExtent = this.getExtent();
                isSkyVisible = this.isSkyWithinMapVisibleArea();
                // Redraw the graphics
                for (multipointKey in this.multiPointCollection)
                {
                    if (this.multiPointCollection[multipointKey] !== undefined)
                    {
                        try
                        {
                            multipoint = this.multiPointCollection[multipointKey];
//                            var layer = this.getLayer(multipoint.parentCoreId);
//                            if (!this.defined(layer))
//                            {
//                                continue;
//                            }
                            var feature = this.getFeature(multipointKey);
                            //var feature = this.getLayer(multipoint.parentCoreId).getFeature(multipointKey);
                            if (feature !== null && feature !== undefined && feature.show === true)
                            {
                                // the multipoint was rendered clipped last time. If the multi is intersecting the current bounds then
                                // the multi must get redrawn again.
                                wasMultipointClipped = multipoint.wasClipped;
                                //wasMultipointClipped = true;
                                alreadyRedrawn = false;
                                if (isSkyVisible)
                                {
                                    isIntersecting = this.checkMultipointIntersecting(feature, mapExtent);
                                }
                                else
                                {
                                    isIntersecting = this.checkMultipointIntersecting(feature, cesiumEngine.utils.getRectangleWithBufferFromRectangle(mapExtent));
                                }

                                if (isIntersecting)
                                {
                                    var epsilon = this.Math.EPSILON3;// good for low scales
                                    if (scale >= 50000 && scale <= 100000)
                                    {
                                        epsilon = this.Math.EPSILON2;
                                    }
                                    else if (scale > 100000 && scale <= 200000)
                                    {
                                        epsilon = this.Math.EPSILON2;
                                    }
                                    else if (scale > 200000 && scale <= 300000)
                                    {
                                        epsilon = this.Math.EPSILON2;
                                    }
                                    else if (scale > 300000 && scale <= 400000)
                                    {
                                        epsilon = this.Math.EPSILON2;
                                    }
                                    else if (scale > 400000 && scale < 500000)
                                    {
                                        epsilon = this.Math.EPSILON2;
                                    }
                                    else if (scale >= 500000)
                                    {
                                        epsilon = this.Math.EPSILON1;
                                    }

                                    alreadyRedrawn = this.Math.equalsEpsilon(multipoint.renderingCameraScale, scale, epsilon);
                                    redrawAgain = multipoint.forceRedraw || !alreadyRedrawn || (wasMultipointClipped);// do not redraw if already redrawn and very close to the terrain

//                                    if (scale <= 1000)
//                                    {
//                                        redrawAgain = true;
//                                    }// when going below 50 in scale the renderer is sending back black canvases.

                                    // alreadyRedrawn = Math.abs( multipoint.renderingCameraAltitude - this.cameraAltitude) <  1000;
                                    //                                    if (!isSkyVisible)
                                    //                                    {
                                    //                                        isMultipointClipped = this.checkMultipointClipped(feature, mapExtent);
                                    //                                    }
                                    //redrawAgain = (!alreadyRedrawn || wasMultipointClipped);
                                    // redrawAgain = (!alreadyRedrawn || wasMultipointClipped || this.getScale() < 500); wasMultipointClipped is truue all the time.
                                }
                                else
                                {
                                    redrawAgain = false;
                                }

                                if (redrawAgain)
                                {
                                    args = {
                                        name: multipoint.name,
                                        id: multipoint.id,
                                        parentCoreId: multipoint.parentCoreId,
                                        overlayId: multipoint.overlayId,
                                        description: multipoint.description,
                                        coordinates: multipoint.coordinates,
                                        symbolCode: multipoint.symbolCode,
                                        properties: multipoint.properties,
                                        visible: multipoint.visible,
                                        altitudeMode: multipoint.altitudeMode,
                                        data: multipoint.data,
                                        multiPointRenderType: multipoint.multiPointRenderType,
                                        extrudedHeight: multipoint.extrudedHeight
                                    };
                                    args.bounds = {"west": this.Math.toDegrees(mapExtent.west),
                                        "south": this.Math.toDegrees(mapExtent.south),
                                        "east": this.Math.toDegrees(mapExtent.east),
                                        "north": this.Math.toDegrees(mapExtent.north)};
                                    batch.push(args);
                                }
                            }
                            else if (multipoint !== null && multipoint !== undefined)
                            {
                                multipoint.show = true; // was renderOnVisible
                            }
                        }
                        catch (err)
                        {
                            console.log(err);
                        }
                    }
                    if (this.isMapMoving())
                    {
                        // stop the redrawing if the map moved.
                        //return;
                    }
                }
                if (batch.length !== 0)
                {
                    this.refreshBatch.executeBatch({
                        array: batch,
                        index: 0,
                        consumptionTime: 250,
                        timeToWait: 1
                    });
                }
                this.prevScale = scale;
            }
        }
        catch (e)
        {
            console.log("redrawGraphics error = " + e);
        }
    }.bind(this);
//    this.moveEnd = function ()
//    {
//        if (moveEndTimerId)
//        {
//            clearTimeout(moveEndTimerId);
//        }
//        moveEndTimerId = setTimeout(function ()
//        {
//            this.updateRenderState(true);
//            this.prevExtent = this.prevExtent || {};
//            this.currentExtent = this.currentExtent || {};
//            var center = this.getCenter();
//            var view = {};
//            view.bounds = {
//                north: this.Math.toDegrees(this.currentExtent.north),
//                south: this.Math.toDegrees(this.currentExtent.south),
//                east: this.Math.toDegrees(this.currentExtent.east),
//                west: this.Math.toDegrees(this.currentExtent.west)
//            };
//            view.location = {
//                lon: this.Math.toDegrees(center.longitude),
//                lat: this.Math.toDegrees(center.latitude)
//            };
//            view.range = this.getCameraAltitude();
//            new empMapInstance.eventing.ViewChange(view);
//        }, 250);
//    }

    return this;
}
;
var CesiumRenderOptimizer = function (empCesium)
{

    /**
     * Gets or sets whether to output info to the console when starting and stopping rendering loop.
     * @type {Boolean}
     */
    this.verboseRendering = false;
    this.hProcessSmartMoveTimer = undefined;
    /**
     * Gets or sets whether the viewer has stopped rendering since startup or last set to false.
     * @type {Boolean}
     */
    this.stoppedRendering = false;
    this.lastClockTime = new empCesium.JulianDate(0, 0.0);
    this.lastCameraViewMatrix = new empCesium.Matrix4();
    this.lastCameraMoveTime = 0;
    this.removePreRenderListener = undefined;
    this.removePostRenderListener = undefined;
    this._wheelEvent = undefined;
    this.originalLoadWithXhr = empCesium.loadWithXhr.load;
//    this.canvas.addEventListener('touchstart', this.boundNotifyRepaintRequired, false);
//    this.canvas.addEventListener('touchend', this.boundNotifyRepaintRequired, false);
//    this.canvas.addEventListener('touchmove', this.boundNotifyRepaintRequired, false);
    // Detect available wheel event

    /**
     * Notifies the viewer that a repaint is required.
     */
    this.notifyRepaintRequired = function ()
    {
        if (empCesium.viewer)
        {
            if (empCesium.verboseRendering && !empCesium.viewer._cesiumWidget.useDefaultRenderLoop)
            {
                //if (this.verboseRendering && !this.viewer.useDefaultRenderLoop) {
                console.log('starting rendering @ ' + empCesium.getTimestamp());
            }
            //empCesium.viewer._cesiumWidget._renderLoopRunning = true;
            // this.viewer._cesiumWidget.useDefaultRenderLoop = false;
            //empCesium.viewer._cesiumWidget.useDefaultRenderLoop = true;
            empCesium.lastCameraMoveTime = empCesium.getTimestamp();
        }
    };
    this.boundNotifyRepaintRequired = this.notifyRepaintRequired.bind(this);
//    if ('onwheel' in this.canvas) {
//        // spec event type
//        this._wheelEvent = 'wheel';
//    } else if (Cesium.defined(document.onmousewheel)) {
//        // legacy event type
//        this._wheelEvent = 'mousewheel';
//    } else {
//        // older Firefox
//        this._wheelEvent = 'DOMMouseScroll';
//    }
//    this.canvas.addEventListener(this.wheelEvent, this.boundNotifyRepaintRequired, false);


    // Hacky way to force a repaint when an async load request completes
    var that = this;
//    empCesium.loadWithXhr.load = function (url, responseType, method, data, headers, deferred, overrideMimeType, preferText, timeout)
//    {
//        //deferred.promise.always(that.boundNotifyRepaintRequired);
//        //that.originalLoadWithXhr(url, responseType, method, data, headers, deferred, overrideMimeType, preferText, timeout);
//    };
    // Hacky way to force a repaint when a web worker sends something back.
//    this._originalScheduleTask = empCesium.TaskProcessor.prototype.scheduleTask;
//    empCesium.TaskProcessor.prototype.scheduleTask = function (parameters, transferableObjects)
//    {
//        var result = that._originalScheduleTask.call(this, parameters, transferableObjects);
//        if (!empCesium.defined(this._originalWorkerMessageSinkRepaint))
//        {
//            this._originalWorkerMessageSinkRepaint = this._worker.onmessage;
//            var taskProcessor = this;
//            this._worker.onmessage = function (event)
//            {
//                taskProcessor._originalWorkerMessageSinkRepaint(event);
//                if (that.isDestroyed())
//                {
//                    taskProcessor._worker.onmessage = taskProcessor._originalWorkerMessageSinkRepaint;
//                    taskProcessor._originalWorkerMessageSinkRepaint = undefined;
//                }
//                else
//                {
//                    that.boundNotifyRepaintRequired();
//                    //empCesium.entityCollection.resumeEvents();
//                    // empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
//                }
//            };
//        }
//
//        return result;
//    };
    this.preRenderListener = function (scene)
    {
        try
        {
            //console.log("inside preRenderListener" );
            var position = empCesium.viewer.scene.camera.position,
                    cartographic;
            if (empCesium.bMartMapMoving)
            {
                var width = empCesium.canvas.width;
                var height = empCesium.canvas.height;

                // Coordinate (0.0, 0.0) will be where the mouse was clicked.
                //var x = (empCesium.mousePosition.x - empCesium.startMousePosition.x) / width;
                //var y = -(empCesium.mousePosition.y - empCesium.startMousePosition.y) / height;
//                var x = empCesium.mousePosition.x;
//                var y = empCesium.mousePosition.y;

                // var lookFactor = 0.05;
                //empCesium.viewer.camera.lookRight(x * lookFactor);
                //empCesium.viewer.camera.lookUp(y * lookFactor);
//                cartographic = empCesium.getLonLatFromPixel({
//                    x: x,
//                    y: y
//                });

                if (!empCesium.defined(this.hProcessSmartMoveTimer))
                {
                    this.hProcessSmartMoveTimer = setTimeout(function ()
                    {
                        var cameraPositionCartographic = empCesium.scene.camera.positionCartographic,
                         height = cameraPositionCartographic.height,
                          latDegDelta = 0,
                          longDegDelta = 0,
                          bSkyVisible =  empCesium.isSkyWithinMapVisibleArea();
                        
                          this.hProcessSmartMoveTimer = undefined;
                          
                        if (bSkyVisible)
                        {
                             latDegDelta=  1;
                             longDegDelta = 4;
                        }
                        else
                        {
                             latDegDelta = 1.5;
                             longDegDelta = 2;
                        }
                        if (empCesium.bSmartMapMovingRightZone)
                        {
                            empCesium.viewer.scene.camera.rotateRight(empCesium.Math.toRadians(longDegDelta*.1));
                        }
                        else if (empCesium.bSmartMapMovingLeftZone)
                        {
                            empCesium.viewer.scene.camera.rotateLeft(empCesium.Math.toRadians(longDegDelta*.1));
                        }
                        else if (empCesium.bSmartMapMovingTopZone)
                        {
                            empCesium.viewer.scene.camera.rotateDown(empCesium.Math.toRadians(longDegDelta*.1));
                        }
                        else if (empCesium.bSmartMapMovingBottomZone)
                        {
                            empCesium.viewer.scene.camera.rotateUp(empCesium.Math.toRadians(longDegDelta*.1));
                        }
                        else if (empCesium.bSmartMapMovingTopRightZone)
                        {

                            var lat = cameraPositionCartographic.latitude + empCesium.Math.toRadians(latDegDelta);
                            var lon = cameraPositionCartographic.longitude + empCesium.Math.toRadians(longDegDelta );
                            empCesium.viewer.camera.flyTo({
                                destination: empCesium.Cartesian3.fromRadians(lon, lat, height),
                                duration: (bSkyVisible)?.2:1.4});
                        }
                        else if (empCesium.bSmartMapMovingBottomRightZone)
                        {
                            var cameraPositionCartographic = empCesium.scene.camera.positionCartographic;
                            var height = cameraPositionCartographic.height;
                            var lat = cameraPositionCartographic.latitude - empCesium.Math.toRadians(latDegDelta);
                            var lon = cameraPositionCartographic.longitude + empCesium.Math.toRadians(longDegDelta );
                            empCesium.viewer.camera.flyTo({
                                destination: empCesium.Cartesian3.fromRadians(lon, lat, height),
                                duration: (bSkyVisible)?.2:1.4});
                        }
                        else if (empCesium.bSmartMapMovingTopLeftZone)
                        {
                            var cameraPositionCartographic = empCesium.scene.camera.positionCartographic;
                            var height = cameraPositionCartographic.height;
                            var lat = cameraPositionCartographic.latitude + empCesium.Math.toRadians(latDegDelta);
                            var lon = cameraPositionCartographic.longitude - empCesium.Math.toRadians(longDegDelta );
                            empCesium.viewer.camera.flyTo({
                                destination: empCesium.Cartesian3.fromRadians(lon, lat, height),
                                duration: (bSkyVisible)?.2:1.4});
                        }
                        else if (empCesium.bSmartMapMovingBottomLeftZone)
                        {
                            var cameraPositionCartographic = empCesium.scene.camera.positionCartographic;
                            var height = cameraPositionCartographic.height;
                            var lat = cameraPositionCartographic.latitude - empCesium.Math.toRadians(latDegDelta);
                            var lon = cameraPositionCartographic.longitude - empCesium.Math.toRadians(longDegDelta );
                            empCesium.viewer.camera.flyTo({
                                destination: Cesium.Cartesian3.fromRadians(lon, lat, height),
                                duration: (bSkyVisible)?.2:1.4});
                        }

                    }.bind(this), 100);
                }
//                    empCesium.camera.flyTo({
//                        destination: Cesium.Cartesian3.fromDegrees(-122.19, 46.25, 5000.0),
//                        orientation: {
//                            heading: Cesium.Math.toRadians(175.0),
//                            pitch: Cesium.Math.toRadians(-35.0),
//                            roll: 0.0
//                        }});

                //empCesium.viewer.camera.twistRight(Cesium.Math.toRadians(10.0));
                //empCesium.viewer.camera.rotate(new Cesium.Cartesian3(0, 0, 0), Cesium.Math.toRadians(10.0));
            }
            //var orientation =
            if (empCesium.isMapMoving())
            {
                empCesium.currentExtent = undefined; // force a recalculation of extent in next call to empCesium.getExtent()
                empCesium.getExtent(); // this call calcultaes the current extent
                empCesium.isSkyVisible = undefined;
                // when camera is at the horizon or near the terrain do not redraw the multipoints.
                //if (empCesium.scene.camera.getMagnitude() < 25000000 && empCesium.Math.toDegrees(Math.abs(empCesium.scene.camera.pitch)) > 30)
                //{
                //empCesium.entityCollection.suspendEvents();
                // if (empCesium.Math.toDegrees(Math.abs(empCesium.scene.camera.pitch)) > 15)
                if (empCesium.getScale() > 1000 && empCesium.Math.toDegrees(Math.abs(empCesium.scene.camera.pitch)) > 15)
                {
                    //redraw at higher scales where the momentary dissapearing when redrawing won't be so pronounced. At lower scales
                    // do the redraw after the map stop moving so the disappearing won't be too noticeable.
                    //    empCesium.redrawGraphics();
                }
                //empCesium.entityCollection.resumeEvents();
                empCesium.lastPosition = position.clone();
                //}
                empCesium.viewChange(empCesium.currentExtent, emp3.api.enums.MapViewEventEnum.VIEW_IN_MOTION);
                empCesium.prevExtent = empCesium.currentExtent;
            }
            empCesium.processOnDelayHoldSinglePoints();
        }
        catch (e)
        {
            console.log("preRenderListener : " + e);
        }
        //console.log("prerender called");
    };
    this.removePreRenderListener = empCesium.viewer.scene.preRender.addEventListener(this.preRenderListener.bind(this));
    this.postRenderListener = function (cesium, date)
    {
        //console.log("inside postRenderListener" );
        // We can safely stop rendering when:
        //  - the camera position hasn't changed in over a second,
        //  - there are no tiles waiting to load, and
        //  - the clock is not animating
        //  - there are no tweens in progress
        //  - there is no  viewTransaction
        try
        {
            var now = empCesium.getTimestamp();
            var scene = empCesium.scene;
            if (!empCesium.Matrix4.equalsEpsilon(empCesium.lastCameraViewMatrix, scene.camera.viewMatrix, 1e-5))
            {
                this.lastCameraMoveTime = now;
            }
            //var cameraMovedInLastSecond = now - empCesium.lastCameraMoveTime < 1000;
            //var surface = scene.globe._surface;
            //var tilesWaiting = !surface._tileProvider.ready || surface._tileLoadQueue.length > 0 || surface._debug.tilesWaitingForChildren > 0;
            // if (!cameraMovedInLastSecond && !tilesWaiting && empCesium.scene.tweens.length === 0 && !Cesium.defined(this.viewTransaction) && !Cesium.defined(empCesium.drawHelper) && empCesium.getSinglePointsIdOnHoldCount() === 0)
            //{
            //  go to sleep mode is the editors are not active, nothing is on hold,
            //if (!cameraMovedInLastSecond && !tilesWaiting && !empCesium.viewer.clock.shouldAnimate && empCesium.scene.tweens.length === 0) {
            // if (this.verboseRendering)
            //  {
            //       console.log('stopping rendering @ ' + empCesium.getTimestamp());
            //   }
            //empCesium.viewer._cesiumWidget.useDefaultRenderLoop = false;
            //this.stoppedRendering = true;
            //}
            // empCesium.Matrix4.clone(scene.camera.viewMatrix, this.lastCameraViewMatrix);
        }
        catch (e)
        {
            console.log("postRenderListener : " + e);
        }
    };

    this.removeRenderErrorListener = empCesium.viewer.scene.renderError.addEventListener(this.preRenderListener.bind(this));
    this.renderErrorListener = function (cesium, date)
    {
        //reactivate the renderer after the rendferer error is caught by  this listener.
        console.log("++++++++++++++++   renderer recativated ++++++++++++ after a renderer error was raised");
        empCesium.viewer._cesiumWidget._renderLoopRunning = true;
    };


    this.removePostRenderListener = empCesium.viewer.scene.postRender.addEventListener(this.postRenderListener.bind(this));
//    this.PostRenderListener.bind(this);

    this.isDestroyed = function ()
    {
        return false;
    };
    this.destroy = function ()
    {
        if (defined(this.removePostRenderListener))
        {
            this.removePostRenderListener();
            this.removePostRenderListener = undefined;
        }
        if (defined(this.removePreRenderListener))
        {
            this.removePreRenderListener();
            this.removePreRenderListener = undefined;
        }
        if (defined(this.removeRenderErrorListener))
        {
            this.removeRenderErrorListener();
            this.removeRenderErrorListener = undefined;
        }

        empCesium.viewer.canvas.removeEventListener('touchstart', empCesium.boundNotifyRepaintRequired, false);
        empCesium.viewer.canvas.removeEventListener('touchend', empCesium.boundNotifyRepaintRequired, false);
        empCesium.viewer.canvas.removeEventListener('touchmove', empCesium.boundNotifyRepaintRequired, false);
        empCesium.viewer.canvas.removeEventListener(this.wheelEvent, this.boundNotifyRepaintRequired, false);
        //empCesium.loadWithXhr.load = this.originalLoadWithXhr;
        //empCesium.TaskProcessor.prototype.scheduleTask = this.originalScheduleTask;
    };
};
// This class is basically an entity wrapper. This wrapper
// is only storing the entity id. This class includes functions to
// access and manipulate the feature hierachy.
var EmpFeature = function ()
{
    //hold custum data related to EMP
    this.id = undefined;
};
var EmpLayer = function (name, id, type, empCesium)
{
    this.subLayers = {};
    this.featureKeys = {};
    this.name = name || undefined;
    this.description = undefined;
    this.id = id || undefined;
    this.visibility = true;
    this.parentId = undefined;
    this.empCesium = empCesium || undefined;
    this.globalType = type || "vector"; // vector, wms
    this.enabled = true; // true by default
    this.isTopLayer = false;
    this.addFeature = function (feature)
    {
        if (!this.isFeaturePresent(feature))
        {
            if (feature.id && feature.id !== null)
            {
                if (feature.featureType === EmpCesiumConstants.featureType.ENTITY)
                {
                    var entity = this.empCesium.entityCollection.add(feature);
                    this.featureKeys[feature.id] = {
                        "id": feature.id,
                        "type": EmpCesiumConstants.featureType.ENTITY,
                        "feature": entity
                    };
                }
                else if (feature.featureType === EmpCesiumConstants.featureType.COMPOUND_ENTITY)
                {
                    var entity = this.empCesium.entityCollection.add(feature);
                    this.featureKeys[feature.id] = {
                        "id": feature.id,
                        "type": EmpCesiumConstants.featureType.COMPOUND_ENTITY,
                        "feature": entity
                    };
                }
                else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                {
                    var primitive = this.empCesium.viewer.scene.primitives.add(feature);
                    this.featureKeys[feature.id] = {
                        "id": feature.id,
                        "type": EmpCesiumConstants.featureType.PRIMITIVE,
                        "feature": primitive
                    };
                }
                else if (feature.featureType === EmpCesiumConstants.featureType.GROUND_PRIMITIVE)
                {
                    var primitive = this.empCesium.viewer.scene.groundPrimitives.add(feature);
                    this.featureKeys[feature.id] = {
                        "id": feature.id,
                        "type": EmpCesiumConstants.featureType.GROUND_PRIMITIVE,
                        "feature": primitive
                    };
                }
                else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION)
                {
                    var primitive = this.empCesium.viewer.scene.primitives.add(feature);
                    primitive.featureType = feature.featureType;
                    primitive.featureId = feature.featureId;
                    primitive.name = feature.name;
                    primitive.description = feature.description;
                    primitive.overlayId = feature.overlayId;
                    primitive.properties = feature.properties;
                    primitive.symbolCode = feature.symbolCode;
                    primitive.coordinates = feature.coordinates;
                    primitive.altitude = feature.altitude;
                    this.featureKeys[feature.id] = {
                        "id": feature.id,
                        "type": EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION,
                        "feature": primitive
                    };
                }
                else if (feature.featureType === EmpCesiumConstants.featureType.DATA_SOURCE)
                {
                    var dataSource = this.empCesium.viewer.dataSources.add(feature);
                    this.featureKeys[feature.id] = {
                        "id": feature.id,
                        "type": EmpCesiumConstants.featureType.DATA_SOURCE,
                        "feature": feature
                    };
                }
                feature.overlayId = this.id;
            }
        }
        else
        {
            //feature already present in map. First remove existing one and then add as new one. The updateFeature
            // does not remove the emp objects from engine hashes like entity, airpsace, multipoint hashes.
            this.updateFeature(feature);
        }
    };
    this.addFeatures = function (features)
    {
        for (var index = 0; index < features.length; index++)
        {
            var feature = features[index];
            this.addFeature(feature);
        }
    };
    this.addFeatureChild = function (entity, childEntity)
    {
        if (this.isFeaturePresent(entity))
        {
            if (!this.isFeatureChildPresent(entity, childEntity))
            {
                if (!this.isFeaturePresent(childEntity))
                {
                    childEntity.parentFeature = entity;
                    childEntity.overlayId = this.id;
                    this.addFeature(childEntity);
                    if (entity.childrenFeatureKeys === undefined)
                    {
                        entity.childrenFeatureKeys = {};
                    }
                    entity.childrenFeatureKeys[childEntity.id] = childEntity.id;
                }
            }
        }
    };
    this.allocateFeatureChild = function (entity, childEntity)
    {
        if (this.isFeaturePresent(entity))
        {
            if (!this.isFeatureChildPresent(entity, childEntity))
            {
                if (this.isFeaturePresent(childEntity)) // must be present in layer
                {
                    childEntity.parentFeature = entity;
                    childEntity.overlayId = this.id;
                    if (entity.childrenFeatureKeys === undefined)
                    {
                        entity.childrenFeatureKeys = {};
                    }
                    entity.childrenFeatureKeys[childEntity.id] = childEntity.id;
                }
            }
        }
    };
    this.isFeatureChildPresent = function (parentEntity, childEntity)
    {
        if (parentEntity && childEntity)
        {
            if (parentEntity.childrenFeatureKeys)
            {
                return (childEntity.id in parentEntity.childrenFeatureKeys) ? true : false;
            }
            else
            {
                return false;
            }
        }
    };
    this.addSubLayer = function (subLayer)
    {
        if (!this.isSubLayerPresent(subLayer.id))
        {
            subLayer.parentId = this.id;
            this.subLayers[subLayer.id] = subLayer;
        }
    };
    this.isLayerEmpty = function ()
    {
        return (this.featuresLength() + this.subOverlaysLength() <= 0) ? true : false;
    };
    this.getFeature = function (id)
    {
        //var feature = undefined;
        if (this.isFeaturePresentById(id))
        {
            var empFeature = this.featureKeys[id];
            return empFeature.feature;
        }
//            if (empFeature.type === EmpCesiumConstants.featureType.ENTITY || empFeature.type === EmpCesiumConstants.featureType.COMPOUND_ENTITY)
//            {
//                feature = this.empCesium.entityCollection.getById(id);
//            }
//            else if (empFeature.type === EmpCesiumConstants.featureType.PRIMITIVE)
//            {
//                var length = this.empCesium.viewer.scene.primitives.length;
//                for (var index = 0; index < length; ++index)
//                {
//                    var p = this.empCesium.viewer.scene.primitives.get(index);
//                    if (p.id === id)
//                    {
//                        feature = p;
//                        break;
//                    }
//                }
//            }
//            else if (empFeature.type === EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION)
//            {
//                var length = this.empCesium.viewer.scene.primitives.length;
//                for (var index = 0; index < length; ++index)
//                {
//                    var p = this.empCesium.viewer.scene.primitives.get(index);
//                    if (p.id === id)
//                    {
//                        feature = p;
//                        break;
//                    }
//                }
//            }
//            else if (empFeature.type === EmpCesiumConstants.featureType.DATA_SOURCE)
//            {
//                var length = this.empCesium.viewer.dataSources.length;
//                for (var index = 0; index < length; ++index)
//                {
//                    var dataSource = this.empCesium.viewer.dataSources.get(index);
//                    if (dataSource.id === id)
//                    {
//                        feature = dataSource;
//                        break;
//                    }
//                }
//            }
//        }
//
//        return feature;
    };
    this.isPrimitive = function (id)
    {
        var isPrimitive = false;
        if (this.isFeaturePresentById(id))
        {
            var empFeature = this.featureKeys[id];
            if (empFeature.type === EmpCesiumConstants.featureType.PRIMITIVE || empFeature.type === EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION)
            {
                isPrimitive = true;
            }
        }

        return isPrimitive;
    };
    this.isDataSource = function (id)
    {
        var isDataSource = false;
        if (this.isFeaturePresentById(id))
        {
            var empFeature = this.featureKeys[id];
            if (empFeature.type === EmpCesiumConstants.featureType.DATA_SOURCE)
            {
                isDataSource = true;
            }
        }

        return isDataSource;
    };
    this.getFeatures = function ()
    {
        var features = [];
        for (var id in this.featureKeys)
        {
            if (id && this.featureKeys.hasOwnProperty(id))
            {
                features.push(this.getFeature(id));
            }
        }

        return features;
    };
    this.getSubLayer = function (id)
    {
        var subLayer = undefined;
        if (this.isSubLayerPresent(id))
        {
            subLayer = this.subLayers[id];
        }

        return subLayer;
    };
    this.getSubLayers = function (id)
    {
        var layers = [];
        for (var id in this.subLayers)
        {
            if (this.subLayers.hasOwnProperty(id))
            {
                layers.push(this.getSubLayer(id));
            }
        }

        return layers;
    };
    this.removeFeatures = function ()
    {
        for (var id in this.featureKeys)
        {
            if (this.featureKeys.hasOwnProperty(id))
            {
                var entity = this.getFeature(id);
                this.removeFeature(entity);
            }
        }
    };
    this.showFeatures = function (visibility)
    {
        for (var id in this.featureKeys)
        {
            if (this.featureKeys.hasOwnProperty(id))
            {
                var entity = this.getFeature(id);
                if (entity)
                {
                    this.showFeature(entity.id, visibility);
                }
            }
        }
    };
    this.showFeature = function (id, visibility)
    {
        var feature = this.getFeature(id);
        if (!feature)
        {
            return;
        }
        if (feature.featureType === EmpCesiumConstants.featureType.ENTITY)
        {
            feature.show = visibility;
            if (feature.billboard !== undefined)
            {
                if (feature.reRenderBillboardRequired && visibility)
                {
                    //when the overlay or parent if hidden the billboard is added to the entity collection with show = false but the loadImage is never called
                    // in the Cesium sdk. Here I'm removing and then re adding the entity when the show visibility is set to true for the for the first  time.
                    // This fixes the isue for kml and geojson points.
                    feature.reRenderBillboardRequired = undefined;
                    feature.show = visibility;
                    feature.billboard.show = visibility;
                    this.updateFeature(feature); // the update removes and then adds the feature to the entity or primitive collection. The children are not remove and readded.
                }
                feature.billboard.show = new this.ConstantProperty(visibility);
            }
            if (feature.path !== undefined)
            {
                feature.path.show = new this.ConstantProperty(visibility);
            }
            if (feature.polyline !== undefined)
            {
                if (!this.empCesium.defined(feature.polyline.show))
                {
                    feature.polyline.show = new this.ConstantProperty(visibility);
                }
                else
                {
                    feature.polyline.show = visibility;
                }
//                //use following workaround to hide entities
//                if (visibility)
//                {
//                    feature.availability = undefined;
//                }
//                else
//                {
//                    feature.availability = new this.empCesium.TimeIntervalCollection();
//                }
            }
            if (feature.polygon !== undefined)
            {
                if (!this.empCesium.defined(feature.polygon.show))
                {
                    feature.polygon.show = new this.ConstantProperty(visibility);
                }
                else
                {
                    feature.polygon.show = visibility;
                }
            }
            if (feature.label !== undefined)
            {
                if (!this.empCesium.defined(feature.label.show))
                {
                    feature.label.show = new this.ConstantProperty(visibility);
                }
                else
                {
                    feature.label.show = visibility;
                }
            }
            if (feature.ellipse !== undefined)
            {
                if (!this.empCesium.defined(feature.ellipse.show))
                {
                    feature.ellipse.show = new this.ConstantProperty(visibility);
                }
                else
                {
                    feature.ellipse.show = visibility;
                }
            }
            if (feature.rectangle !== undefined)
            {
                if (!this.empCesium.defined(feature.rectangle.show))
                {
                    feature.rectangle.show = new this.ConstantProperty(visibility);
                }
                else
                {
                    feature.rectangle.show = visibility;
                }
                if (this.empCesium.isMultiPointPresent(id))
                {
                    var oMultiPoint = this.empCesium.getMultiPoint(id);
                    if (oMultiPoint)
                    {
                        oMultiPoint.visible = new this.ConstantProperty(visibility);
                    }
                }
            }
            if (feature.childrenFeatureKeys !== undefined)
            {
                for (var childrenFeatureId in feature.childrenFeatureKeys)
                {
                    if (feature.childrenFeatureKeys.hasOwnProperty(childrenFeatureId))
                    {
                        var childrenEntity = this.getFeature(childrenFeatureId);
                        if (childrenEntity)
                        {
                            this.showFeature(childrenEntity.id, visibility);
                        }
                    }
                }
            }
        }
        else if (feature.featureType === EmpCesiumConstants.featureType.COMPOUND_ENTITY)
        {
            feature.show = new this.ConstantProperty(visibility);
            if (feature.childrenFeatureKeys !== undefined)
            {
                for (var childrenFeatureId in feature.childrenFeatureKeys)
                {
                    if (feature.childrenFeatureKeys.hasOwnProperty(childrenFeatureId))
                    {
                        var childrenEntity = this.getFeature(childrenFeatureId);
                        if (childrenEntity)
                        {
                            this.showFeature(childrenEntity.id, visibility);
                        }
                    }
                }
            }
        }
        else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
        {
            feature.show = visibility;
            //primitive could represent a 3D multipoint that uses labels (entity.rectangle... with canvas)
            var airspaceLabelPresent = this.empCesium.isMultiPointPresent(id + "_label");
            if (airspaceLabelPresent)
            {
                var airspaceLabel = this.getFeature(id + "_label");
                if (airspaceLabel)
                {
                    airspaceLabel.show = visibility;    //new this.empCesium.ConstantProperty(visibility);
                }
            }
        }
        else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION)
        {
            if (feature.length > 0)
            {
                feature.get(0).show = visibility;
            }
            if (this.empCesium.isAirspacePresent(id))
            {
                var oAirspace = this.empCesium.getAirspace(id);
                if (oAirspace)
                {
                    oAirspace.visible = visibility;
                }
            }
            else if (this.empCesium.isSinglePointPresent(id))
            {
                var oSinglePoint = this.empCesium.getSinglePoint(id);
                if (oSinglePoint)
                {
                    oSinglePoint.visible = visibility;
                }
            }
        }
    };
    this.removeSubLayers = function ()
    {
        for (var id in this.subLayers)
        {
            if (this.subLayers.hasOwnProperty(id))
            {
                var subLayer = this.getSubLayer(id);
                if (subLayer)
                {
                    //this.removeImageryServiceFromDropDown(this);
                    subLayer.removeFeatures();
                    subLayer.removeSubLayers();
                    delete this.subLayers[id];
                }
            }
        }
    };
    this.showSubLayers = function (visibility)
    {
        for (var id in this.subLayers)
        {
            if (this.subLayers.hasOwnProperty(id))
            {
                var subLayer = this.getSubLayer(id);
                if (subLayer)
                {
                    subLayer.visibility = visibility;
                    subLayer.showFeatures(visibility);
                    subLayer.showSubLayers(visibility);
                }
            }
        }
    };
    this.clearLayer = function ()
    {
        if ((this.globalType === EmpCesiumConstants.layerType.ARCGIS_93_REST_LAYER) || (this.globalType === EmpCesiumConstants.layerType.BING_LAYER) ||
                (this.globalType === EmpCesiumConstants.layerType.IMAGE_LAYER) || (this.globalType === EmpCesiumConstants.layerType.OSM_LAYER) ||
                (this.globalType === EmpCesiumConstants.layerType.TMS_LAYER) || (this.globalType === EmpCesiumConstants.layerType.WMS_LAYER)
                || (this.globalType === EmpCesiumConstants.layerType.WMTS_LAYER))
        {
            //first remove any imagery providers from Cesium imagery collection  if any...
            this.empCesium.enableLayer(this, false);
            // The disabling of  layer does not remove the imagery service from dropdown. Remove from drop down is next
            //this.empCesium.removeImageryServiceFromDropDown(this);
        }
        this.removeFeatures();
        this.removeSubLayers();
    };
    this.showLayer = function (isVisible)
    {
        this.showFeatures(isVisible);
        this.showSubLayers(isVisible);
    };
    this.removeFeature = function (feature)
    {
        if (this.isFeaturePresent(feature))
        {
            if (feature.childrenFeatureKeys !== undefined)
            {
                for (var id in feature.childrenFeatureKeys)
                {
                    if (feature.childrenFeatureKeys.hasOwnProperty(id))
                    {
                        var childrenEntity = this.getFeature(id);
                        if (childrenEntity)
                        {
                            this.removeFeature(childrenEntity);
                        }
                    }
                }
            }
            if (this.empCesium.defined(feature.parentFeature))
            {
                this.deallocateFeatureChild(feature.parentFeature, feature);
            }
            if (this.isPrimitive(feature.id))
            {
                this.empCesium.viewer.scene.primitives.remove(feature);
                delete this.featureKeys[feature.id];
                this.empCesium.removeAirspace(feature.id);
                this.empCesium.removeSinglePoint(feature.id);
                this.empCesium.removeSinglePointIdOnHold(feature.id);
                feature = undefined;
            }
            else if (this.isDataSource(feature.id))
            {
                this.empCesium.viewer.dataSources.remove(feature);
                delete this.featureKeys[feature.id];
                feature = undefined;
            }
            else
            {
                //entity
                this.empCesium.entityCollection.removeById(feature.id);
                //this.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                delete this.featureKeys[feature.id];
                this.empCesium.removeSinglePoint(feature.id);
                this.empCesium.removeMultiPoint(feature.id);
                feature = undefined;
            }
        }
    };

    //feature already present in map. First remove existing one and then add as new one. The updateFeature
    // does not remove the emp objects from engine hashes like entity, airpsace, multipoint hashes. The addFeature from the emp engine api
    //takes care of the case of an update. The updateFeature is used for internal removal and then readding the feature to map with same id. The
    // presence of teh feature in the layeers , and any child entities ( ojo - would a replace erase any children feature association to updated feature?) under the updated feature is manteined (v2)..
    this.updateFeature = function (feature)
    {
        //feature already present in map. First remove existing one and then add as new one
        if (feature.id && feature.id !== null)
        {
            if (feature.featureType === EmpCesiumConstants.featureType.ENTITY)
            {
                var entity = this.getFeature(feature.id); // entity is the current geometry rendered on map
                // keep chindren association to parent when updating
                feature.childrenFeatureKeys = entity.childrenFeatureKeys;
                feature.parentFeature = entity.parentFeature;
                this.empCesium.entityCollection.remove(entity);
                entity = undefined;
                this.empCesium.entityCollection.add(feature);
                this.featureKeys[feature.id].feature = feature;
            }
            else if (feature.featureType === EmpCesiumConstants.featureType.COMPOUND_ENTITY)
            {
                var entity = this.getFeature(feature.id); // entity is the current geometry rendered on map
                this.empCesium.entityCollection.remove(entity);
                this.empCesium.entityCollection.add(feature);
                this.featureKeys[primitive.id].feature = feature;
            }
            else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE || feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION)
            {
                // OJO: airspaces can swa from primitive to primitive collection based on the altitude mode.
                var primitive = this.getFeature(feature.id); // primitive is the current geometry render on map
                // keep chindren association to parent and vice versa when updating
                feature.childrenFeatureKeys = primitive.childrenFeatureKeys;
                feature.parentFeature = primitive.parentFeature;
                this.featureKeys[primitive.id].feature = feature;
                this.empCesium.viewer.scene.primitives.remove(primitive); // removing the current geometry
                primitive = undefined;
                this.empCesium.viewer.scene.primitives.add(feature); // feature represents the updated geometry.
            }
            else if (feature.featureType === EmpCesiumConstants.featureType.DATA_SOURCE)
            {
                var dataSource = this.getFeature(feature.id);
                this.empCesium.viewer.dataSources.remove(dataSource);
                this.empCesium.viewer.dataSources.add(feature);
                this.featureKeys[primitive.id].feature = feature;
            }
            feature.overlayId = this.id;
        }
    };
    // remove feature recursevely from layer but keep feature in the Cesium entityCollection
    // this function is used for the moving of features.
    this.deallocateFeature = function (entity)
    {
        if (this.isFeaturePresent(entity))
        {
            if (entity.childrenFeatureKeys !== undefined)
            {
                for (var id in entity.childrenFeatureKeys)
                {
                    if (entity.childrenFeatureKeys.hasOwnProperty(id))
                    {
                        var childrenEntity = this.getFeature(id);
                        if (childrenEntity)
                        {
                            this.deallocateFeature(childrenEntity);
                        }
                    }
                }
            }
            entity.overlayId = undefined;
            delete this.featureKeys[entity.id];
        }
    };
    // add feature recursevely to layer. the feature must  already be part of the Cesium entityCollection
    // this function is used for the moving of features.
    this.allocateFeature = function (feature)
    {
        if (!this.isFeaturePresent(feature))
        {
            if (feature.featureType === EmpCesiumConstants.featureType.ENTITY)
            {
                this.featureKeys[feature.id] = {
                    "id": feature.id,
                    "type": EmpCesiumConstants.featureType.ENTITY
                };
            }
            else if (feature.featureType === EmpCesiumConstants.featureType.COMPOUND_ENTITY)
            {
                this.featureKeys[feature.id] = {
                    "id": feature.id,
                    "type": EmpCesiumConstants.featureType.COMPOUND_ENTITY
                };
            }
            else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
            {
                this.featureKeys[feature.id] = {
                    "id": feature.id,
                    "type": EmpCesiumConstants.featureType.PRIMITIVE
                };
            }
            else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION)
            {
                this.featureKeys[feature.id] = {
                    "id": feature.id,
                    "type": EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION
                };
            }
            else if (feature.featureType === EmpCesiumConstants.featureType.DATA_SOURCE)
            {
                this.featureKeys[feature.id] = {
                    "id": feature.id,
                    "type": EmpCesiumConstants.featureType.DATA_SOURCE
                };
            }
            var featureChildrenLength = this.featureChildrenLength(feature);
            if (featureChildrenLength > 0)
            {
                var childrenFeatures = this.getFeatureChildrenEntityArray(feature);
                for (var index = 0; index < featureChildrenLength; index++)
                {
                    var childrenFeature = childrenFeatures[index];
                    this.allocateFeature(childrenFeature);
                }
            }
            feature.overlayId = this.id;
        }
    };
    this.clearFeature = function (entity)
    {
        if (this.isFeaturePresent(entity))
        {
            if (entity.childrenFeatureKeys !== undefined)
            {
                for (var id in entity.childrenFeatureKeys)
                {
                    if (entity.childrenFeatureKeys.hasOwnProperty(id))
                    {
                        var childrenEntity = this.getFeature(id);
                        if (childrenEntity)
                        {
                            this.removeFeature(childrenEntity);
                        }
                    }
                }
                entity.childrenFeatureKeys = undefined;
            }
        }
    };
    this.removeFeatureChild = function (parentEntity, childEntity)
    {
        if (this.isFeaturePresent(parentEntity) && this.isFeaturePresent(childEntity))
        {
            if (parentEntity.childrenFeatureKeys !== undefined)
            {
                if (this.isFeatureChildPresent(parentEntity, childEntity))
                {
                    this.removeFeature(childEntity);
                    delete parentEntity.childrenFeatureKeys[childEntity.id];
                }
            }
        }
    };
    this.deallocateFeatureChild = function (parentEntity, childEntity)
    {
        if (this.isFeaturePresent(parentEntity) && this.isFeaturePresent(childEntity))
        {
            if (parentEntity.childrenFeatureKeys !== undefined)
            {
                if (this.isFeatureChildPresent(parentEntity, childEntity))
                {
                    //this.removeFeature(childEntity);
                    delete parentEntity.childrenFeatureKeys[childEntity.id];
                    childEntity.parentFeature = undefined;
                    childEntity.overlayId = undefined;
                }
            }
        }
    };
    this.getFeatureChildrenEntityArray = function (entity)
    {
        var featureChildrenEntityArray = [];
        if (this.isFeaturePresent(entity))
        {
            if (entity.childrenFeatureKeys !== undefined)
            {
                for (var id in entity.childrenFeatureKeys)
                {
                    if (entity.childrenFeatureKeys.hasOwnProperty(id))
                    {
                        var childrenEntity = this.getFeature(id);
                        if (childrenEntity)
                        {
                            featureChildrenEntityArray.push(childrenEntity);
                        }
                    }
                }
            }
        }

        return featureChildrenEntityArray;
    };
    this.removeFeatureById = function (id)
    {
        if (this.isFeaturePresentById(id))
        {
            var entity = this.getFeature(id);
            this.removeFeature(entity);
        }
    };
    this.removeSubLayer = function (subOverlay)
    {
        if (this.isSubLayerPresent(subOverlay.id))
        {
            this.subLayer.removeFeatures();
            subLayer.removeSubLayers();
            delete this.SubLayers[subLayer.id];
        }
    };
    this.removeSubLayerById = function (id)
    {
        if (this.isSubLayerPresent(id))
        {
            var subLayer = this.getLayer(id);
            this.removeSubLayer(subLayer);
        }
    };
    this.featuresLength = function ()
    {
        return Object.keys(this.featureKeys).length;
    };
    this.featureChildrenLength = function (entity)
    {
        var length = 0;
        if (entity.childrenFeatureKeys)
        {
            length = Object.keys(entity.childrenFeatureKeys).length;
        }

        return length;
    };
    this.subLayersLength = function ()
    {
        return Object.keys(this.subLayers).length;
    };
    this.isFeaturePresentById = function (id)
    {
        if (id)
            return (id in this.featureKeys) ? true : false;
    };
    this.isFeaturePresent = function (entity)
    {
        if (entity && entity.id)
        {
            return (entity.id in this.featureKeys) ? true : false;
        }
        else
        {
            return false;
        }
    };
    this.isSubLayerPresent = function (id)
    {
        if (id)
            return (id in this.subLayers) ? true : false;
    };
};//EmpLayer



var StarBurst = function (empCesium)
{

// Add labels clustered at the same location
//    var numBillboards = 30;
//    for (var i = 0; i < numBillboards; ++i)
//    {
//        var position = empCesium.Cartesian3.fromDegrees(-75.59777, 40.03883);
//        empCesium.viewer.entities.add({
//            position: position,
//            billboard: {
//                image: '../images/facility.gif',
//                scale: 2.5
//            },
//            label: {
//                text: 'Label' + i,
//                show: false
//            }
//        });
//    }

    var scene = empCesium.viewer.scene;
    var camera = scene.camera;
    //var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

//    handler.setInputAction(function (movement)
//    {
//        // Star burst on left mouse click.
//        starBurst(movement.position);
//    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//    handler.setInputAction(function (movement)
//    {
//        // Remove the star burst when the mouse exits the circle or show the label of the billboard the mouse is hovering over.
//        updateStarBurst(movement.endPosition);
//    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

//    camera.moveStart.addEventListener(function ()
//    {
//        // Reset the star burst on camera move because the lines from the center
//        // because the line end points rely on the screen space positions of the billboards.
//        undoStarBurst();
//    });

// State saved across mouse click and move events
    var starBurstState = {
        enabled: false,
        pickedEntities: undefined,
        billboardEyeOffsets: undefined,
        labelEyeOffsets: undefined,
        linePrimitive: undefined,
        radius: undefined,
        center: undefined,
        pixelPadding: 10.0,
        angleStart: 0.0,
        angleEnd: Cesium.Math.PI,
        maxDimension: undefined
    };

    offsetBillboard = function (entity, entityPosition, angle, magnitude, lines, billboardEyeOffsets, labelEyeOffsets)
    {
        var x = magnitude * Math.cos(angle);
        var y = magnitude * Math.sin(angle);

        var offset = new Cesium.Cartesian2(x, y);

        var drawingBufferWidth = scene.drawingBufferWidth;
        var drawingBufferHeight = scene.drawingBufferHeight;

        var diff = Cesium.Cartesian3.subtract(entityPosition, camera.positionWC, new Cesium.Cartesian3());
        var distance = Cesium.Cartesian3.dot(camera.directionWC, diff);

        var dimensions = camera.frustum.getPixelDimensions(drawingBufferWidth, drawingBufferHeight, distance, new Cesium.Cartesian2());
        Cesium.Cartesian2.multiplyByScalar(offset, Cesium.Cartesian2.maximumComponent(dimensions), offset);

        var labelOffset;
        var billboardOffset;
        var eyeOffset = new Cesium.Cartesian3(offset.x, offset.y, 0.0);
        if (entity.billboard)
        {
            //entity
            billboardOffset = entity.billboard.eyeOffset;
            entity.billboard.eyeOffset = eyeOffset;
            entity.isDecluttered = true;

            if (Cesium.defined(entity.label))
            {
                labelOffset = entity.label.eyeOffset;
                entity.label.eyeOffset = new Cesium.Cartesian3(offset.x, offset.y, -10.0);
                entity.label.show = false;
            }
        }
        else
        {
            //billboardCollection..mil std single points
            billboardOffset = entity.primitive._billboardCollection.get(0).eyeOffset; // the offset is not correct for primitives???
            billboardOffset = empCesium.Cartesian3.ZERO;// defaulting to this default because this is the value assigned for single points..no eye offset
            entity.primitive._billboardCollection.get(0).eyeOffset = eyeOffset;
            entity.primitive._billboardCollection.isDecluttered = true;
        }

        var endPoint = Cesium.Matrix4.multiplyByPoint(camera.viewMatrix, entityPosition, new Cesium.Cartesian3());
        Cesium.Cartesian3.add(eyeOffset, endPoint, endPoint);
        Cesium.Matrix4.multiplyByPoint(camera.inverseViewMatrix, endPoint, endPoint);
        lines.push(endPoint);

        billboardEyeOffsets.push(billboardOffset);
        labelEyeOffsets.push(labelOffset);
    };

    this.startStarBurst = function (mousePosition)
    {
        if (Cesium.defined(starBurstState.pickedEntities))
        {
            return;
        }

        var pickedObjects = scene.drillPick(mousePosition);
        if (!Cesium.defined(pickedObjects) || pickedObjects.length < 2)
        {
            return;
        }

        var billboardEntities = [];
        var length = pickedObjects.length;
        var i;

        for (i = 0; i < length; ++i)
        {
            var pickedObject = pickedObjects[i];
            if (pickedObject.primitive instanceof Cesium.Billboard)
            {
                billboardEntities.push(pickedObject);
            }
        }

        if (billboardEntities.length < 2)
        {
            return;
        }

        var pickedEntities = starBurstState.pickedEntities = [];
        var billboardEyeOffsets = starBurstState.billboardEyeOffsets = [];
        var labelEyeOffsets = starBurstState.labelEyeOffsets = [];
        var lines = [];
        starBurstState.maxDimension = Number.NEGATIVE_INFINITY;

        var angleStart = starBurstState.angleStart;
        var angleEnd = starBurstState.angleEnd;

        var angle = angleStart;
        var angleIncrease;
        var magnitude;
        var magIncrease;
        var maxDimension;

        // Drill pick gets all of the entities under the mouse pointer.
        // Find the billboards and set their pixel offsets in a circle pattern.
        length = billboardEntities.length;
        i = 0;
        while (i < length)
        {
            var object = billboardEntities[i];
            if (pickedEntities.length === 0)
            {
                starBurstState.center = Cesium.Cartesian3.clone(object.primitive.position);
                // starBurstState.center = empCesium.viewer.scene.camera.pickEllipsoid(mousePosition, empCesium.ellipsoid);
            }

            if (!Cesium.defined(angleIncrease))
            {
                var width = object.primitive.width;
                var height = object.primitive.height;
                maxDimension = Math.max(width, height) * object.primitive.scale + starBurstState.pixelPadding;
                magnitude = maxDimension + maxDimension * 0.5;
                magIncrease = magnitude;
                angleIncrease = maxDimension / magnitude;
            }
            if (object.id instanceof empCesium.Entity)
            {
                offsetBillboard(object.id, object.primitive.position, angle, magnitude, lines, billboardEyeOffsets, labelEyeOffsets);
            }
            else
            {
                offsetBillboard(object, object.primitive.position, angle, magnitude, lines, billboardEyeOffsets, labelEyeOffsets);
            }
            pickedEntities.push(object);

            var reflectedAngle = angleEnd - angle;
            if (i + 1 < length && reflectedAngle - angleIncrease * 0.5 > angle + angleIncrease * 0.5)
            {
                object = billboardEntities[++i];
                if (object.id instanceof Cesium.Entity)
                {
                    offsetBillboard(object.id, object.primitive.position, reflectedAngle, magnitude, lines, billboardEyeOffsets, labelEyeOffsets);
                }
                else
                {
                    offsetBillboard(object, object.primitive.position, reflectedAngle, magnitude, lines, billboardEyeOffsets, labelEyeOffsets);
                }

                pickedEntities.push(object);
            }

            angle += angleIncrease;
            if (reflectedAngle - angleIncrease * 0.5 < angle + angleIncrease * 0.5)
            {
                magnitude += magIncrease;
                angle = angleStart;
                angleIncrease = maxDimension / magnitude;
            }

            ++i;
        }

        // Add lines from the pick center out to the translated billboard.
        var instances = [];
        length = lines.length;
        for (i = 0; i < length; ++i)
        {
            var pickedEntity = pickedEntities[i];
            starBurstState.maxDimension = Math.max(pickedEntity.primitive.width, pickedEntity.primitive.height, starBurstState.maxDimension);

            instances.push(new Cesium.GeometryInstance({
                geometry: new Cesium.SimplePolylineGeometry({
                    positions: [starBurstState.center, lines[i]],
                    followSurface: false,
                    granularity: Cesium.Math.PI_OVER_FOUR
                }),
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.WHITE)
                }
            }));
        }

        starBurstState.linePrimitive = scene.primitives.add(new Cesium.Primitive({
            geometryInstances: instances,
            appearance: new Cesium.PerInstanceColorAppearance({
                flat: true,
                translucent: false
            }),
            asynchronous: false
        }));

        empCesium.viewer.selectedEntity = undefined;
        starBurstState.radius = magnitude + magIncrease;
    };

    this.updateStarBurst = function (mousePosition)
    {
        if (!Cesium.defined(starBurstState.pickedEntities))
        {
            return;
        }

        if (!starBurstState.enabled)
        {
            // For some reason we get a mousemove event on click, so
            // do not show a label on the first event.
            starBurstState.enabled = true;
            return;
        }

        // Remove the star burst if the mouse exits the screen space circle.
        // If the mouse is inside the circle, show the label of the billboard the mouse is hovering over.
        var screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, starBurstState.center);
        var fromCenter = Cesium.Cartesian2.subtract(mousePosition, screenPosition, new Cesium.Cartesian2());
        var radius = starBurstState.radius;

        if (Cesium.Cartesian2.magnitudeSquared(fromCenter) > radius * radius || fromCenter.y > 3.0 * (starBurstState.maxDimension + starBurstState.pixelPadding))
        {
            this.undoStarBurst();
        }
        else
        {
            showLabels(mousePosition);
        }
    };

    this.undoStarBurst = function ()
    {
        var pickedEntities = starBurstState.pickedEntities;
        if (!Cesium.defined(pickedEntities))
        {
            return;
        }

        var billboardEyeOffsets = starBurstState.billboardEyeOffsets;
        var labelEyeOffsets = starBurstState.labelEyeOffsets;

        // Reset billboard and label pixel offsets.
        // Hide overlapping labels.
        for (var i = 0; i < pickedEntities.length; ++i)
        {
            if (pickedEntities[i].id instanceof  Cesium.Entity)
            {
                //entity
                var entity = pickedEntities[i].id;
                entity.isDecluttered = false;
                // billboardOffset = entity.billboard.eyeOffset;
                // do not change eyeoffset back to original if the feature is in edit mode, but keep the original eyeoffset
                // in the drawData object in case the usetr cancels the edit operation.
                if (empCesium.drawData.id === entity.id)
                {
                    empCesium.drawData.clutteredEyeOffset = billboardEyeOffsets[i];
                }
                else
                {
                    entity.billboard.eyeOffset = billboardEyeOffsets[i];
                }
                if (Cesium.defined(entity.label))
                {
                    entity.label.eyeOffset = labelEyeOffsets[i];
                    entity.label.show = true;
                }
            }
            else
            {
                //billboardCollection..mil std single points
                var primitive = pickedEntities[i].primitive;
                if (Cesium.defined(primitive._billboardCollection) && primitive._billboardCollection.length > 0)
                {
                    primitive._billboardCollection.isDecluttered = false;
                    if (empCesium.drawData.id === primitive._billboardCollection.id)
                    {
                        empCesium.drawData.clutteredEyeOffset = billboardEyeOffsets[i];
                    }
                    else
                    {
                        primitive._billboardCollection.get(0).eyeOffset = billboardEyeOffsets[i];
                    }

                }
            }

        }

        // Remove lines from the scene.
        // Free resources and reset state.
        scene.primitives.remove(starBurstState.linePrimitive);
        starBurstState.linePrimitive = undefined;
        starBurstState.pickedEntities = undefined;
        starBurstState.billboardEyeOffsets = undefined;
        starBurstState.labelEyeOffsets = undefined;
        starBurstState.radius = undefined;
        starBurstState.enabled = false;
    };

    var currentObject;

    showLabels = function (mousePosition)
    {
        var pickedObjects = scene.drillPick(mousePosition);
        var pickedObject;

        if (Cesium.defined(pickedObjects))
        {
            var length = pickedObjects.length;
            for (var i = 0; i < length; ++i)
            {
                if (pickedObjects[i].primitive instanceof Cesium.Billboard)
                {
                    pickedObject = pickedObjects[i];
                    break;
                }
            }
        }

        if (pickedObject !== currentObject)
        {
            if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id.label))
            {
                if (Cesium.defined(currentObject))
                {
                    currentObject.id.label.show = false;
                }

                currentObject = pickedObject;
                pickedObject.id.label.show = true;
            }
            else if (Cesium.defined(currentObject))
            {
                currentObject.id.label.show = false;
                currentObject = undefined;
            }
        }
    };
};//StarBurst
