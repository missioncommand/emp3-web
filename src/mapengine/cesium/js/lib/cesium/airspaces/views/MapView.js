///////////////////////////////////////////////////////////////////////////////
// MapView
//
// Copyright (c) 2014-2015 General Dynamics Inc.
// The Government has the right to use, modify, reproduce,
// release, perform, display ,or disclose this computer
// software or computer software documentation without restriction.
//
///////////////////////////////////////////////////////////////////////////////

function MapView(empCesium, mapModel)
{
    this.centerCoord = null;
    this.clickList = null;
    this.clickPending = null;
    this.extents = null;
    this.extentsDrift = null;
    this.initLayer = null;
    this.mapEventHandler = null;
    this.mapCntrl = null;
    this.mapDomId = null;
    this.mapModel = null;
    this.origLayers = null;
    this.scale = null;
    this.scaleLine = null;
    this.scaleLineDiv = null;
    this.supplementalEventHandlers = null;
    this.tessellate = null;
    this.viewer = null;
    this.wmsImagery = null;

    this.EXTENTS_PERCENT = 0.10;
    this.LAT_LONG_RECTANGLE = 0.5;
    this.ONE_MINUTE = 60 * 1000;
    this.METERS_PER_INCH = 0.0254;
    this.SCALE_LINE_LENGTH = 50;
    this.SINGLE_DOUBLE_CLICK = 300;

    //// constructor = function(mapDomId, mapModel) {
//        var __construct = function(empCesium, mapModel) {
    this.scene = empCesium.scene;
    this.empCesium = empCesium;
//            var cesiumProxy = null;
//            var creditDisplay = null;
//            var initialized = null;
//            var locationSaverInterval = null;
//            var mode = null;
//            var origCursorStyle = null;
//            var rightDown = false;
//            var sceneModePicker = null;
//            var terrainLink = null;
//            var terrainProviderConfig = null;
//            var widgetConfig = null;
//
    //try {
//
//                this.mapDomId = mapDomId;
    this.mapModel = mapModel;
    this.tessellate = new Tessellate(this);
//
    this.clickList = [];
    this.initialized = false;
    this.origCursorStyle = [];
    this.origLayers = [];
    this.supplementalEventHandlers = [];
//                this.wmsImagery = {};
//
//                //defines the sample level =
//             ///   CONSTANTS.TERRAIN_LEVEL = config.tessellationConfig[0].levelOfDetail;
//                //When the level of terrain is greater than this level agl airspaces will be rendered as agl.
//             ////   CONSTANTS.AGL_RENDER_TERRAIN_LEVEL = config.tessellationConfig[0].levelOfDetail;
//
//                //-
//                widgetConfig = {};
//
//                //set the initial scene
//            /////    widgetConfig.sceneMode = systemPreferencesModel.map.sceneMode;
//
//                if (config.proxyConfig.hasOwnProperty('url')) {
//
//                    cesiumProxy = new Cesium.DefaultProxy(config.proxyConfig.url);
//                }
//
//                //Assembling Terrain provider information, first take the configuration information which is defined in the
//                //index.html file
//        ////        terrainProviderConfig = lang.clone(config.terrainConfig);
//
//       ////         terrainLink = linkStore.query({LinkType= LINK_TYPE.TERRAIN.Value});
//
//                //Determine the terrain url
////                if (0 < terrainLink.length) {
////                    terrainProviderConfig.url = terrainLink[0].SchemeAndAuthority;
////                }
////                //If the terrain link is not present use what is in the index.html file.
////                else if (config.terrainConfig) {
////                    terrainProviderConfig.url = config.terrainConfig.url;
////                }
//                
////                //determine if we need to use a proxy to obtain  terrain
////                if(mapUtils.useProxy(terrainProviderConfig.url) === true) {
////                    
////                    if (cesiumProxy) {
////
////                        terrainProviderConfig.proxy = cesiumProxy;
////                    }
////                }
////                
//                widgetConfig.terrainProvider = new AtomTerrainProvider(terrainProviderConfig, CONSTANTS, mapUtils, topic);
//
//                this.initLayer = new Cesium.TileMapServiceImageryProvider({
//                    url : require.toUrl(CESIUM_BASE_URL + '/Assets/Textures/NaturalEarthII')
//                });
//
//                widgetConfig.imageryProvider = this.initLayer;
//
//                this.viewer = new Cesium.CesiumWidget(this.mapDomId, widgetConfig);
    this.viewer = empCesium.viewer;
//                this.scene = this.viewer.scene;
//                
//                //set the natural view layer to the bottom
//                this.initLayer = this.scene.globe.imageryLayers.get(0);
//                this.scene.globe.imageryLayers.lowerToBottom(this.initLayer);
//
//                // removes the cesium credit in the lower left hand side
//                creditDisplay = this.scene.frameState.creditDisplay;
//                creditDisplay.removeDefaultCredit(creditDisplay._defaultImageCredits[0]);
//                
//                //The following saves the current location prior to switching scenes (i.e. 3d -> 2D)
//                sceneModePicker = new Cesium.SceneModePicker('sceneButton', this.scene, 0);
//
//                this.scene.morphStart.addEventListener(lang.hitch(this, function() {
//
//                    this.saveMapLocation();
//                }));
//
//                this.scene.morphComplete.addEventListener(lang.hitch(this, function() {
//
//                    setTimeout(lang.hitch(this, function() {
//
//                        this.gotoLocation(systemPreferencesModel.map.location);
//                    }), CONSTANTS.CESIUM_QUIESCE_TIME);
//                }));
//                //acevedo - depth testing is making the primitives to plot under the terran.
    this.scene.globe.depthTestAgainstTerrain = false;
    // I can statt handling the depth test for all the shapes rendered on the map.
    // this.scene.globe.depthTestAgainstTerrain = false;
//
//                //get reference to the scaleLine div
//                this.scaleLineDiv = dom.byId('scaleLine');
//                this.scaleLine = document.createElement("canvas");
//                this.scaleLineDiv.appendChild(this.scaleLine);
//
    //Register click handlers
    this.mapEventHandler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);

    

//                this.mapEventHandler.setInputAction(emp.$.proxy( this.handleLeftMouseClick, this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
//                this.mapEventHandler.setInputAction(emp.$.proxy( this.handleLeftDoubleMouseClick, this), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
//                this.mapEventHandler.setInputAction(emp.$.proxy( this.handleLeftDownMouse, this), Cesium.ScreenSpaceEventType.LEFT_DOWN);
//                this.mapEventHandler.setInputAction(emp.$.proxy( this.handleLeftUpMouse, this), Cesium.ScreenSpaceEventType.LEFT_UP);
//                this.mapEventHandler.setInputAction(emp.$.proxy( this.handleMouseMove, this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
//                this.mapEventHandler.setInputAction(emp.$.proxy( this.handleRightMouseClick, this), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
//                this.mapEventHandler.setInputAction(emp.$.proxy( this.handleRightDownMouse, this), Cesium.ScreenSpaceEventType.RIGHT_DOWN);
//                this.mapEventHandler.setInputAction(emp.$.proxy( this.handleRightUpMouse, this), Cesium.ScreenSpaceEventType.RIGHT_UP);
    //////this.mapEventHandler.setInputAction(emp.$.proxy( this.modifyScale, this), Cesium.ScreenSpaceEventType.WHEEL);

//                this.mapEventHandler.setInputAction(lang.hitch(this, this.handleLeftMouseClick), Cesium.ScreenSpaceEventType.LEFT_CLICK);
//                this.mapEventHandler.setInputAction(lang.hitch(this, this.handleLeftDoubleMouseClick), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
//                this.mapEventHandler.setInputAction(lang.hitch(this, this.handleLeftDownMouse), Cesium.ScreenSpaceEventType.LEFT_DOWN);
//                this.mapEventHandler.setInputAction(lang.hitch(this, this.handleLeftUpMouse), Cesium.ScreenSpaceEventType.LEFT_UP);
//                this.mapEventHandler.setInputAction(lang.hitch(this, this.handleMouseMove), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
//                this.mapEventHandler.setInputAction(lang.hitch(this, this.handleRightMouseClick), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
//                this.mapEventHandler.setInputAction(lang.hitch(this, this.handleRightDownMouse), Cesium.ScreenSpaceEventType.RIGHT_DOWN);
//                this.mapEventHandler.setInputAction(lang.hitch(this, this.handleRightUpMouse), Cesium.ScreenSpaceEventType.RIGHT_UP);
//                this.mapEventHandler.setInputAction(lang.hitch(this, this.modifyScale), Cesium.ScreenSpaceEventType.WHEEL);
//
//                //Interval location saver
//                this.locationSaverInterval = setInterval(lang.hitch(this, this.saveMapLocation), this.ONE_MINUTE);
//
//                //register for hotkey clicks:
//                document.addEventListener('keydown', lang.hitch(this, this.hotKeys), false);
//

    //  }
    //   catch(error) {
    //       console.log('MapView.constructor: ' + error);
    //  }
//        }(empCesium, mapModel);

    this.getEmpCesium = function ()
    {
        return this.empCesium;
    };

    //A polite way to say monkey patching
    this.addAdditionalCesiumFunctions = function ()
    {

        try
        {

            this.scene.globe.getTerrainTileAtLocation = function (cartographic)
            {

                var children = null;
                var i = null;
                var levelZeroTiles = null;
                var tile = null;

                try
                {

                    if (!Cesium.defined(cartographic))
                    {
                        throw new Cesium.DeveloperError('cartographic is required');
                    }

                    levelZeroTiles = this.surface._levelZeroTiles;
                    if (!Cesium.defined(levelZeroTiles))
                    {
                        return null;
                    }

                    for (i = 0; i < levelZeroTiles.length; ++i)
                    {
                        tile = levelZeroTiles[i];

                        if (Cesium.Rectangle.contains(tile.rectangle, cartographic))
                        {
                            break;
                        }
                    }

                    if (Cesium.defined(tile) && Cesium.Rectangle.contains(tile.rectangle, cartographic))
                    {

                        while (tile.renderable)
                        {

                            children = tile.children;
                            length = children.length;

                            for (i = 0; i < length; ++i)
                            {
                                tile = children[i];
                                if (Cesium.Rectangle.contains(tile.rectangle, cartographic))
                                {
                                    break;
                                }
                            }
                        }

                        while (Cesium.defined(tile) && (!Cesium.defined(tile.data) || !Cesium.defined(tile.data.pickTerrain)))
                        {
                            tile = tile.parent;
                        }

                        return tile;
                    }

                    return null;
                }
                catch (error)
                {
                    console.log('MapView.getTerrainTileAtLocation: ' + error);
                }
            };

            this.scene.globe.getOptimizedHeight = function (cartographic)
            {

                var cartesian = null;
                var children = null;
                var ellipsoid = null;
                var i = null;
                var intersection = null;
                var levelZeroTiles = null;
                var ray = null;
                var tile = null;

                try
                {

                    if (!Cesium.defined(cartographic))
                    {
                        throw new Cesium.DeveloperError('cartographic is required');
                    }

                    if (!tile)
                    {
                        tile = this.getTerrainTileAtLocation(cartographic);

                        return tile.data.terrainData.interpolateHeight(
                                tile.rectangle,
                                cartographic.longitude,
                                cartographic.latitude);
                    }
                }
                catch (error)
                {
                    console.log('MapView.getOptimizedHeight: ' + error);
                }
            };
        }
        catch (error)
        {
            console.log('MapView._addAdditionalCesiumFunctions: ' + error);
        }
    };

    this.addSupplementalEventHandler = function (context, action, mouseEvent)
    {

        try
        {

            if (mouseEvent === MOUSE_EVENT_TYPE.LEFT_CLICK.Value)
            {

                this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.LEFT_CLICK] = {context: context, action: action};
            }
            else if (mouseEvent === MOUSE_EVENT_TYPE.LEFT_DOUBLE_CLICK.Value)
            {
                this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK] = {context: context, action: action};
            }
            else if (mouseEvent === MOUSE_EVENT_TYPE.LEFT_DOWN.Value)
            {
                this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.LEFT_DOWN] = {context: context, action: action};
            }
            else if (mouseEvent === MOUSE_EVENT_TYPE.LEFT_UP.Value)
            {
                this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.LEFT_UP] = {context: context, action: action};
            }
            else if (mouseEvent === MOUSE_EVENT_TYPE.MOUSE_MOVE.Value)
            {
                this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.MOUSE_MOVE] = {context: context, action: action};
            }
            else if (mouseEvent === MOUSE_EVENT_TYPE.RIGHT_CLICK.Value)
            {
                this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.RIGHT_CLICK] = {context: context, action: action};
            }
        }
        catch (error)
        {
            console.log('MapView.addSupplementalEventHandler: ' + error);
        }
    };

    this.areImageryLayersEnabled = function ()
    {

        var i = null;
        var layers = null;

        try
        {

            layers = mapLayerStore.data;

            for (i = 0; i < layers.length; i++)
            {

                if (this.wmsImagery[layers[i].name].show === true)
                {
                    return true;
                }
            }
        }
        catch (error)
        {
            console.log('MapView.areLayersEnabled: ' + error);
        }

        return false;
    };

    this.changeMouseStyleToCrosshair = function ()
    {

        try
        {
//
//                this.origCursorStyle.push(dom.byId(this.mapDomId).style.cursor);
//
//                dom.byId(this.mapDomId).style.cursor = 'crosshair';
        }
        catch (error)
        {
            console.log('MapView._changeMouseStyleToCrosshair: ' + error);
        }
    };

    this.changeMouseStyleToAuto = function ()
    {

        try
        {

            dom.byId(this.mapDomId).style.cursor = 'auto';
        }
        catch (error)
        {
            console.log('MapView._changeMouseStyleToAuto: ' + error);
        }
    };

    this.determineLayerDifferences = function (oldLayers, requestedLayers)
    {

        var addList = null;
        var deleteList = null;
        var i = null;
        var j = null;
        var layerFound = null;


        try
        {
            addList = [];
            deleteList = [];

            for (i = 0; i < oldLayers.length; i++)
            {

                layerFound = false;

                for (j = 0; j < requestedLayers.length; j++)
                {

                    if ((oldLayers[i].name === requestedLayers[j].name) &&
                            (oldLayers[i].opacity === requestedLayers[j].opacity) &&
                            (oldLayers[i].minScale === requestedLayers[j].minScale) &&
                            (oldLayers[i].maxScale === requestedLayers[j].maxScale))
                    {

                        layerFound = true;
                    }
                }

                if (layerFound !== true)
                {
                    deleteList.push(oldLayers[i]);
                }
            }

            for (i = 0; i < requestedLayers.length; i++)
            {

                layerFound = false;

                for (j = 0; j < oldLayers.length; j++)
                {

                    if ((requestedLayers[i].name === oldLayers[j].name) &&
                            (requestedLayers[i].opacity === oldLayers[j].opacity) &&
                            (requestedLayers[i].minScale === oldLayers[j].minScale) &&
                            (requestedLayers[i].maxScale === oldLayers[j].maxScale))
                    {

                        layerFound = true;
                    }
                }

                if (layerFound !== true)
                {
                    addList.push(requestedLayers[i]);
                }
            }
        }
        catch (error)
        {
            console.log('MapView._determineLayerDifferences: ' + error);
        }

        return {deletes: deleteList, adds: addList};
    };

    this.determinePixelsPerInch = function ()
    {

        try
        {

            //There is no good way to calculate this at the current time.  When a good reliable way is identified this
            // code should be changed.  A good approximation is 96 for non-apple products.
            return 96;
        }
        catch (error)
        {
            console.log('MapView._determinePixelsPerInch: ' + error);
        }
    };

    this.generateExtents = function ()
    {

        var canvas = null;
        var center = null;
        var centerHeight = null;
        var centerSouth = null;
        var centerWest = null;
        var centerWidth = null;
        var deltaLat = null;
        var deltaLong = null;

        var driftLatLow = null;
        var driftLatHigh = null;

        var locCenterAirspacePoint = null;
        var locSouthAirspacePoint = null;
        var locWestAirspacePoint = null;

        try
        {

            //determine the current view extents
            canvas = this.scene.canvas;
            centerHeight = Math.round(canvas.height / 2);
            centerWidth = Math.round(canvas.width / 2);

            center = new Cesium.Cartesian2(centerWidth, centerHeight);
            centerWest = new Cesium.Cartesian2(0, centerHeight);
            centerSouth = new Cesium.Cartesian2(centerWidth, canvas.height);

            locCenterAirspacePoint = this.getLocationFromPosition(center);
            locWestAirspacePoint = this.getLocationFromPosition(centerWest);
            locSouthAirspacePoint = this.getLocationFromPosition(centerSouth);

            if (locWestAirspacePoint && locSouthAirspacePoint)
            {
                deltaLat = Math.abs(locSouthAirspacePoint.Latitude - locCenterAirspacePoint.Latitude);
            }
            else if (locWestAirspacePoint)
            {
                deltaLong = Math.abs(locWestAirspacePoint.Longitude - locCenterAirspacePoint.Longitude);
                deltaLat = deltaLong;
            }
            else if (locSouthAirspacePoint)
            {
                deltaLat = Math.abs(locSouthAirspacePoint.Latitude - locCenterAirspacePoint.Latitude);
                deltaLong = deltaLat;
            }
            else
            {
                //set the values to the default viewing area.
                deltaLat = this.LAT_LONG_RECTANGLE;
            }

            //If the extents are within EXTENTS_PERCENT of the drift extents return the extents.  Otherwise recalculate the extents.
            // The problem compounds overtime.
            if (this.extentsDrift)
            {

                driftLatLow = this.extentsDrift.deltaLat * (1 - this.EXTENTS_PERCENT);
                driftLatHigh = this.extentsDrift.deltaLat * (1 + this.EXTENTS_PERCENT);

                if ((driftLatLow <= deltaLat) && (deltaLat <= driftLatHigh))
                {

                    this.extentsDrift = {deltaLong: deltaLat, deltaLat: deltaLat};
                }
                else
                {

                    //reset extents
                    this.extentsDrift = {deltaLong: deltaLat, deltaLat: deltaLat};
                    this.extents = {deltaLong: deltaLat, deltaLat: deltaLat};
                }
            }
            else
            {

                this.extents = {deltaLong: deltaLat, deltaLat: deltaLat};
                this.extentsDrift = {deltaLong: deltaLat, deltaLat: deltaLat};
            }

            return this.extents;
        }
        catch (error)
        {
            console.log('MapView._generateExtents: ' + error);
        }
    };

    this.generateScaleLine = function (distance, text)
    {

        var ctx = null;

        try
        {

            if (this.scaleLine)
            {
                ctx = this.scaleLine.getContext("2d");

                //set the background
                ctx.fillStyle = "black";
                ctx.fill();

                //this clears out the canvas
                ctx.clearRect(0, 0, this.scaleLine.width, this.scaleLine.height);

                //draw the scaleline
                ctx.fillRect(5, 12, this.SCALE_LINE_LENGTH, 1);

                //draw the left tick on the scaleline
                ctx.fillRect(5, 8, 1, 10);

                //draw the right tick on the scaleline
                ctx.fillRect(55, 8, 1, 10);

                //populate the text
                ctx.fillText(distance + ' ' + text, 60, 17);

                domClass.toggle(this.scaleLineDiv, 'dijitHidden', false);
            }
        }
        catch (error)
        {
            console.log('MapView._generateScaleLine: ' + error);
        }
    };

    this.getDomId = function ()
    {
        try
        {

            return this.mapDomId;
        }
        catch (error)
        {
            console.log('MapView.getDomId: ' + error);
        }
    };

    /* Use at your own risk numbers are very different than sample terrain */
    this.getAltitudeFromPosition = function (position)
    {

        var alt = null;
        var pos = null;
        var positionCartographic = null;
        var ray = null;

        try
        {

            ray = this.viewer.camera.getPickRay(position);
            pos = this.scene.globe.pick(ray, this.scene);

            if (Cesium.defined(pos))
            {

                positionCartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(pos);
                return positionCartographic.height.toFixed(2);
            }
        }
        catch (error)
        {
            console.log('MapView.getAltitudeFromPosition: ' + error);
        }
    };

    //Given a key sequence determine the action
    this.getFlagForKeyCode = function getFlagForKeyCode(key)
    {

        //make sure the alt key is pressed
        if (key.altKey)
        {

            switch (key.keyCode)
            {
                case config.zoomIn.charCodeAt(0):
                    return 'moveForward';
                case config.zoomOut.charCodeAt(0):
                    return 'moveBackward';
                case config.rotateLeft.charCodeAt(0):
                    return 'rotateLeft';
                case config.rotateRight.charCodeAt(0):
                    return 'rotateRight';
                case config.rotateUp.charCodeAt(0):
                    return 'rotateUp';
                case config.rotateDown.charCodeAt(0):
                    return 'rotateDown';
                case config.pan.charCodeAt(0):
                    return 'pan';
                case config.unPan.charCodeAt(0):
                    return 'unPan';
            }

            return null;
        }
    };

    this.getLocationFromPosition = function (position)
    {

        var cartesian = null;
        var cartographic = null;
        var airspacePoint = null;

        try
        {

            cartesian = this.scene.camera.pickEllipsoid(position, this.scene.globe.ellipsoid);

            if (cartesian)
            {

                cartographic = this.scene.globe.ellipsoid.cartesianToCartographic(cartesian);

                if (cartographic)
                {

                    //loc = {};
                    airspacePoint = new AirspacePoint();
                    airspacePoint.Latitude = parseFloat(Cesium.Math.toDegrees(cartographic.latitude).toFixed(5));
                    airspacePoint.Longitude = parseFloat(Cesium.Math.toDegrees(cartographic.longitude).toFixed(5));
                    airspacePoint.Altitude = parseFloat(cartographic.altitude).toFixed(5);
                }
            }
        }
        catch (error)
        {
            console.log('MapView.getLocationFromPosition: ' + error);
        }

        return airspacePoint;
    };

    this.getLocationOnClick = function (defer)
    {

        try
        {

            if (this.clickList.length === 0)
            {

                this.changeMouseStyleToCrosshair();
            }

            this.clickList.push(defer);
        }
        catch (error)
        {
            console.log('MapView.getLocationOnClick: ' + error);
        }
    };

    this.getMapEventHandler = function ()
    {

        try
        {

            return this.mapEventHandler;
        }
        catch (error)
        {
            console.log('MapView.getMapEventHandler: ' + error);
        }
    };

    /*
     * Rough approximation of scale.
     */
    this.getScale = function ()
    {

        try
        {

            //If the scale is currently not defined, define it...
            if (!this.scale)
            {

                this.modifyScale();
            }

            return this.scale;
        }
        catch (error)
        {
            console.log('MapView.getScale: ' + error);
        }
    };

    this.getScene = function ()
    {

        try
        {

            return this.scene;
        }
        catch (error)
        {
            console.log('MapView.getScene: ' + error);
        }
    },
            this.gotoArea = function (location)
            {

                var rectangle = null;

                try
                {

                    rectangle = Cesium.Rectangle.fromDegrees(location.West, location.South, location.East, location.North);

                    this.viewer.camera.viewRectangle(rectangle);

                    this.modifyLocationAndScale();
                }
                catch (error)
                {
                    console.log('MapView.gotoArea: ' + error);
                }
            };

    this.gotoLocation = function (location)
    {

        var east = null;
        var extents = null;
        var north = null;
        var rectangle = null;
        var south = null;
        var west = null;

        try
        {

            if (location.hasOwnProperty('extents'))
            {
                extents = location.extents;
            }
            else
            {
                //get the map extents
                extents = this.generateExtents();
            }

            east = location.Longitude + extents.deltaLong;
            north = location.Latitude + extents.deltaLat;
            south = location.Latitude - extents.deltaLat;
            west = location.Longitude - extents.deltaLong;

            rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);

            this.viewer.camera.viewRectangle(rectangle);

            this.modifyLocationAndScale();
        }
        catch (error)
        {
            console.log('MapView.gotoLocation: ' + error);
        }
    };

    this.handleLeftMouseClick = function (movement)
    {

        var i = null;
        var airspacePoint = null;
        var exclusiveRet = null;
        var sceneElements = null;
        var supplement = null;

        try
        {

            supplement = this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.LEFT_CLICK];

            if (supplement)
            {

                exclusiveRet = supplement.action.call(supplement.context, movement);
            }

            if (!exclusiveRet)
            {

                if (0 < this.clickList.length)
                {

                    //resolve all outstanding location requests
                    airspacePoint = this.getLocationFromPosition(movement.position);

                    if (airspacePoint)
                    {

                        for (i = 0; i < this.clickList.length; i++)
                        {
                            this.clickList[i].resolve(airspacePoint);
                        }

                        //Set the cursor back to what it was prior to the click
                        //// acevedo todo about cursor
                        //// dom.byId(this.mapDomId).style.cursor = this.origCursorStyle.pop();

                        this.clickList = [];
                    }
                }
                else
                {

                    if (!this.clickPending)
                    {

                        this.clickPending = setTimeout(emp.$.proxy(function ()
                        {
                            //this.clickPending = setTimeout(lang.hitch(this, function() {

                            //Get primitives which we are over
                            //acevedo commented out the following
//                                sceneElements = this.mouseOverSceneElement(movement, false);
//
//                                if(0 < sceneElements.length) {
//
//                                   //// this.mapCntrl.openPopupPanel(sceneElements[0], movement.position);
//                                }

                            this.clickPending = null;
                        }, this), this.SINGLE_DOUBLE_CLICK);
                    }
                }
            }
        }
        catch (error)
        {
            console.log('MapView._handleLeftMouseClick' + error);
        }
    }.bind(this);

    this.handleLeftDoubleMouseClick = function (movement)
    {

        var exclusiveRet = null;
        var sceneElements = null;
        var supplement = null;

        try
        {

            if (this.clickPending)
            {

                clearTimeout(this.clickPending);
                this.clickPending = null;
            }

            supplement = this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK];

            if (supplement)
            {

                exclusiveRet = supplement.action.call(supplement.context, movement);
            }

            if (!exclusiveRet)
            {

//                    //Get primitives which we are over
//                    sceneElements = this.mouseOverSceneElement(movement, false);
//
//                    if(0 < sceneElements.length) {
//                        ////this.mapCntrl.openDetailPanel(sceneElements[0]);
//                    }
            }
        }
        catch (error)
        {
            console.log('MapView._handleLeftDoubleMouseClick' + error);
        }
    }.bind(this);

    this.handleLeftDownMouse = function (movement)
    {

        var supplement = null;

        try
        {
            supplement = this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.LEFT_DOWN];

            if (supplement)
            {

                supplement.action.call(supplement.context, movement);
            }
        }
        catch (error)
        {
            console.log('MapView._handleLeftDownMouse' + error);
        }
    }.bind(this);

    this.handleLeftUpMouse = function (movement)
    {

        var supplement = null;

        try
        {
            supplement = this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.LEFT_UP];

            if (supplement)
            {

                supplement.action.call(supplement.context, movement);
            }
        }
        catch (error)
        {
            console.log('MapView._handleLeftUpMouse' + error);
        }
    }.bind(this);

    this.handleMouseMove = function (movement)
    {

        var rightMouseDown = false;
        var supplement = null;

        try
        {

            if (!this.mousePositionTimer)
            {

                rightMouseDown = this.rightDown;

                this.mousePositionTimer = setTimeout(emp.$.proxy(function ()
                {
                    //this.mousePositionTimer = setTimeout(lang.hitch(this, function() {

                    try
                    {

                        supplement = this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.MOUSE_MOVE];

                        if (supplement)
                        {

                            supplement.action.call(supplement.context, movement);
                        }

                        //Update mouse position/location
                        this.updateMousePostion(movement);

                        //update the scaleLime
                        if (rightMouseDown)
                        {

                            this.modifyScale();
                        }

                        this.mousePositionTimer = null;
                    }
                    catch (error)
                    {
                        console.log('MapView._handleMouseMove.Inner' + error);
                    }
                }, this), 200);
            }
        }
        catch (error)
        {
            console.log('MapView._handleMouseMove' + error);
        }
    }.bind(this);

    this.handleRightDownMouse = function (movement)
    {

        try
        {
            this.rightDown = true;
        }
        catch (error)
        {
            console.log('MapView._handleRightDownMouse' + error);
        }
    }.bind(this);

    this.handleRightMouseClick = function (movement)
    {

        var sceneElements = null;
        try
        {

            //Get primitives which we are over
            sceneElements = this.mouseOverSceneElement(movement, true); //Should be true down the road

            this.mapCntrl.openRightMouseMenu(sceneElements, movement.position);
        }
        catch (error)
        {
            console.log('MapView._handleRightMouseClick' + error);
        }
    }.bind(this);

    this.handleRightUpMouse = function (movement)
    {

        try
        {
            this.rightDown = false;
        }
        catch (error)
        {
            console.log('MapView._handleRightUpMouse' + error);
        }
    }.bind(this);

    this.hotKeys = function (e)
    {

        var cameraHeight = null;
        var defaultRotateAmount = null;
        var flagName = null;
        var moveRate = null;

        try
        {
            cameraHeight = this.scene.globe.ellipsoid.cartesianToCartographic(this.viewer.camera.position).height;
            defaultRotateAmount = this.viewer.camera.defaultRotateAmount * 5;
            moveRate = cameraHeight / 100.0;

            flagName = this.getFlagForKeyCode(e);

            if (flagName)
            {

                if (flagName === 'moveForward')
                {

                    cameraHeight = this.scene.globe.ellipsoid.cartesianToCartographic(this.viewer.camera.position).height;
                    moveRate = cameraHeight / 100.0;

                    this.viewer.camera.moveForward(moveRate);
                }
                else if (flagName === 'moveBackward')
                {

                    cameraHeight = this.scene.globe.ellipsoid.cartesianToCartographic(this.viewer.camera.position).height;
                    moveRate = cameraHeight / 100.0;

                    this.viewer.camera.moveBackward(moveRate);
                }
                else if (flagName === 'rotateLeft')
                {
                    this.viewer.camera.rotateLeft(defaultRotateAmount);
                }
                else if (flagName === 'rotateRight')
                {
                    this.viewer.camera.rotateRight(defaultRotateAmount);
                }
                else if (flagName === 'rotateUp')
                {
                    this.viewer.camera.rotateUp(defaultRotateAmount);
                }
                else if (flagName === 'rotateDown')
                {
                    this.viewer.camera.rotateDown(defaultRotateAmount);
                }
                else if (flagName === 'pan')
                {

                    defaultRotateAmount = this.viewer.camera.defaultRotateAmount * 10;

                    this.viewer.camera.setView({position: this.viewer.camera.position,
                        heading: this.viewer.camera.heading,
                        pitch: (this.viewer.camera.pitch + defaultRotateAmount),
                        roll: this.viewer.camera.roll
                    });
                }
                else if (flagName === 'unPan')
                {

                    defaultRotateAmount = this.viewer.camera.defaultRotateAmount * 10;

                    this.viewer.camera.setView({position: this.viewer.camera.position,
                        heading: this.viewer.camera.heading,
                        pitch: (this.viewer.camera.pitch - defaultRotateAmount),
                        roll: this.viewer.camera.roll
                    });
                }

                this.modifyScale();
            }
        }
        catch (error)
        {
            console.log('MapView._hotKeys: ' + error);
        }
    };

    this.imageryLayerAdd = function (imageryProvider)
    {

        var layer = null;

        try
        {

            layer = this.viewer.imageryLayers.addImageryProvider(imageryProvider);
        }
        catch (error)
        {
            console.log('MapView.imageryLayerAdd: ' + error);
        }

        return layer;
    };

    this.imageryLayerRemove = function (layer)
    {

        try
        {

            this.viewer.imageryLayers.remove(layer);
        }
        catch (error)
        {
            console.log('MapView.imageryLayerRemove: ' + error);
        }
    };

    this.mapUpdateLayers = function ()
    {

        var diffs = null;
        var i = null;
        var imageryProvider = null;
        var isVisible = null;
        var j = null;
        var layerIndex = null;
        var layers = null;
        var maxScale = null;
        var minScale = null;
        var proxy = null;
        var scale = null;

        try
        {
            //get the layers from the mapLayerStore
            layers = mapLayerStore.data;

            scale = this.getScale();

            //create proxy
            proxy = new Cesium.DefaultProxy(config.proxyConfig.url);

            //make the natural view layer visible so there are no issues with single time imagery
            this.initLayer.show = true;

            //determine what needs to be added or removed
            diffs = this.determineLayerDifferences(this.origLayers, layers);

            //delete imagery provider which are no longer required.
            for (i = 0; i < diffs.deletes.length; i++)
            {

                console.info('MapView.mapUpdateLayers: Removing layer ' + diffs.deletes[i].name);
                this.viewer.imageryLayers.remove(this.wmsImagery[diffs.deletes[i].name]);
                delete this.wmsImagery[diffs.deletes[i].name];
            }

            //add any new layers
            for (i = 0; i < layers.length; i++)
            {

                for (j = 0; j < diffs.adds.length; j++)
                {

                    if (layers[i].name === diffs.adds[j].name)
                    {

                        if (mapUtils.useProxy(layers[i].url) === true)
                        {

                            imageryProvider = new Cesium.WebMapServiceImageryProvider({
                                url: layers[i].url,
                                layers: [layers[i].name],
                                proxy: proxy,
                                parameters: {
                                    transparent: layers[i].transparentLayer,
                                    format: (layers[i].transparentLayer) ? 'image/png' : 'image/jpeg' // As per TIGRs
                                            // recommendation to use jpeg over png.  JPEG images aren't transparent
                                }
                            });
                        }
                        else
                        {

                            imageryProvider = new Cesium.WebMapServiceImageryProvider({
                                url: layers[i].url,
                                layers: [layers[i].name],
                                parameters: {
                                    transparent: layers[i].transparentLayer,
                                    format: (layers[i].transparentLayer) ? 'image/png' : 'image/jpeg' // As per TIGRs
                                            // recommendation to use jpeg over png.  JPEG images aren't transparent
                                }
                            });
                        }

                        //make the lowest user defined layer visible all the time.
                        if (i === 0)
                        {
                            maxScale = mapLayerUtils.MAP_SCALE_CONFIGURATION[(mapLayerUtils.MAP_SCALE_CONFIGURATION.length - 1)].scale;
                            minScale = mapLayerUtils.MAP_SCALE_CONFIGURATION[0].scale;
                        }
                        else
                        {
                            maxScale = mapLayerUtils.getScale(layers[i].minScale);
                            minScale = mapLayerUtils.getScale(layers[i].maxScale);
                        }

                        isVisible = false;
                        if ((maxScale <= scale) && (scale <= minScale))
                        {

                            console.info('MapView.mapUpdateLayers: Adding and turning on layer visiblity: ' + layers[i].name +
                                    ', scale = ' + scale + ', minScale = ' + layers[i].maxScale + ', maxScale = ' +
                                    layers[i].minScale);

                            isVisible = true;
                        }

                        this.wmsImagery[layers[i].name] = this.scene.globe.imageryLayers.addImageryProvider(imageryProvider, i);

                        //this reduces memory
                        if (layers[i].opacity === 100)
                        {
                            this.wmsImagery[layers[i].name].hasAlphaChannel = false;
                        }
                        else
                        {
                            this.wmsImagery[layers[i].name].hasAlphaChannel = true;
                            this.wmsImagery[layers[i].name].alpha = layers[i].opacity;
                        }
                        this.wmsImagery[layers[i].name].show = isVisible;
                        this.wmsImagery[layers[i].name].maxScale = maxScale;
                        this.wmsImagery[layers[i].name].minScale = minScale;
                    }
                }
            }

            //adjust layers if the order has changed.
            for (i = 0; i < layers.length; i++)
            {

                layerIndex = this.scene.globe.imageryLayers.indexOf(this.wmsImagery[layers[i].name]);

                if (layerIndex < i)
                {

                    //Need to raise layer up
                    for (j = i; layerIndex < j; j--)
                    {
                        this.scene.globe.imageryLayers.raise(this.wmsImagery[layers[i].name]);
                    }
                }
                else if (i < layerIndex)
                {

                    //Need to move layer down
                    //Need to move layer up
                    for (j = i; j < layerIndex; j++)
                    {
                        this.scene.globe.imageryLayers.lower(this.wmsImagery[layers[i].name]);
                    }
                }
            }

            //If there is a user defined any layer turn of the visibility of the default natural view layer.
            if (0 < layers.length)
            {
                this.initLayer.show = false;
            }

            this.origLayers = layers;
        }
        catch (error)
        {
            console.log('MapView.mapUpdateLayers: ' + error);
        }
    };

    this.modifyLocationAndScale = function ()
    {

        var canvas = null;
        var centerHeight = null;
        var centerOfScreen = null;
        var centerWidth = null;

        try
        {

            canvas = this.scene.canvas;
            centerHeight = Math.round(canvas.height / 2);
            centerWidth = Math.round(canvas.width / 2);
            centerOfScreen = new Cesium.Cartesian2(centerWidth, centerHeight);

            this.updateMousePostion({endPosition: centerOfScreen});
            this.modifyScale();
        }
        catch (error)
        {
            console.log('MapView._modifyLocationAndScale' + error);
        }
    };

    this.modifyScale = function ()
    {

        var canvas = null;
        var centerHeight = null;
        var centerLeft = null;
        var centerRight = null;
        var centerWidth = null;
        var distance = null;
        var locLeft = null;
        var locRight = null;
        var meters = null;
        var scale = null;
        var text = null;
        var wms = null;

        setTimeout(emp.$.proxy(this, function ()
        {

            try
            {

                canvas = this.scene.canvas;
                centerHeight = Math.round(canvas.height / 2);
                centerWidth = Math.round(canvas.width / 2);

                centerLeft = new Cesium.Cartesian2((centerWidth - (this.SCALE_LINE_LENGTH / 2)), centerHeight);
                centerRight = new Cesium.Cartesian2((centerWidth + (this.SCALE_LINE_LENGTH / 2)), centerHeight);

                locLeft = this.getLocationFromPosition(centerLeft);
                locRight = this.getLocationFromPosition(centerRight);

                if (locLeft && locRight)
                {

                    //meters = mapUtils.distanceBetween(locLeft, locRight);
                    var latLon0 = new LatLon(locLeft.Latitude, locLeft.Longitude);
                    var latLon1 = new LatLon(locRight.Latitude, locRight.Longitude);
                    meters = Math.round(latLon0.distanceTo(latLon1));

                    //if((systemPreferencesModel.widthPref === WIDTH_UNITS.KM.Value) ||
                    //        (systemPreferencesModel.widthPref === WIDTH_UNITS.M.Value)) {

//                            distance = lengthUtils.convertFromSI(meters, WIDTH_UNITS.KM.Value, 2);
                    distance = meters;
                    //text = WIDTH_UNITS.KM.Sdsc;
                    //}
                    //else if((systemPreferencesModel.widthPref === WIDTH_UNITS.FT.Value) ||
                    //        (systemPreferencesModel.widthPref === WIDTH_UNITS.SM.Value)) {

                    //distance = lengthUtils.convertFromSI(meters, WIDTH_UNITS.SM.Value, 2);
                    //   distance = meters;
                    //   text = WIDTH_UNITS.SM.Sdsc;
                    // }
                    //else if(systemPreferencesModel.widthPref === WIDTH_UNITS.NM.Value) {

//                            distance = lengthUtils.convertFromSI(meters, WIDTH_UNITS.NM.Value, 2);
                    //      distance = meters;
                    //       text = WIDTH_UNITS.NM.Sdsc;
                    // }

                    //deal with the level of percision
//                        if(distance > 100) {
//
//                            distance = number.round(distance, 0);
//                        }
//                        else if((distance > 25) && (distance < 100)) {
//
//                            distance = number.round(distance, 1);
//                        }

                    this.generateScaleLine(distance, text);

                    this.scale = meters / (this.SCALE_LINE_LENGTH / this.determinePixelsPerInch() * this.METERS_PER_INCH);
                    //console.info('scale = ' + this.scale);

                    //show or hide imagery layers
                    //  this.showHideImageryLayers();

                    ///////// topic.publish(CONSTANTS.MAP_SCALE_CHANGE);
                }
                else
                {
                    //domClass.toggle(this.scaleLineDiv,'dijitHidden', true);
                }
            }
            catch (error)
            {
                console.log('MapView._modifyScale' + error);
            }
        }), 200);
    };

    this.mouseOverSceneElement = function (movement, multiple)
    {

        var i = null;
        var pickedObjects = null;
        var retList = null;

        try
        {

            retList = [];

            if (multiple)
            {
                if (movement.hasOwnProperty('endPosition'))
                {
                    pickedObjects = this.scene.drillPick(movement.endPosition);
                }
                else if (movement.hasOwnProperty('position'))
                {
                    pickedObjects = this.scene.drillPick(movement.position);
                }
            }
            else
            {
                if (movement.hasOwnProperty('endPosition'))
                {
                    pickedObjects = [this.scene.pick(movement.endPosition)];
                }
                else if (movement.hasOwnProperty('position'))
                {
                    pickedObjects = [this.scene.pick(movement.position)];
                }
            }

            for (i = 0; i < pickedObjects.length; i++)
            {

                if (pickedObjects[i] === undefined)
                {
                    continue;
                }

                //old format used by tracks and airspaces
                if (pickedObjects[i].hasOwnProperty('collection') && pickedObjects[i].collection.hasOwnProperty('data') &&
                        pickedObjects[i].collection.data.hasOwnProperty('Id'))
                {

                    retList.push(pickedObjects[i].collection);
                } //old format used by airspaces
                else if (pickedObjects[i].hasOwnProperty('collection') && pickedObjects[i].collection.hasOwnProperty('id') &&
                        pickedObjects[i].collection.id.hasOwnProperty('data'))
                {

                    retList.push(pickedObjects[i].collection);
                } //old format used by ACPs
                else if (pickedObjects[i].hasOwnProperty('primitive') && pickedObjects[i].primitive.hasOwnProperty('data') &&
                        pickedObjects[i].primitive.data.hasOwnProperty('Id'))
                {

                    retList.push(pickedObjects[i].primitive);
                }// new preferred
                else if (pickedObjects[i].hasOwnProperty('primitive') && pickedObjects[i].primitive.id)
                {

                    retList.push(pickedObjects[i].primitive);
                }
            }
        }
        catch (error)
        {
            console.log('MapView.mouseOverSceneElement: ' + error);
        }

        return retList;
    };

    this.removeSupplementalEventHandler = function (mouseEvent)
    {

        try
        {

            if (mouseEvent === MOUSE_EVENT_TYPE.LEFT_CLICK.Value)
            {

                this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.LEFT_CLICK] = null;
            }
            else if (mouseEvent === MOUSE_EVENT_TYPE.LEFT_DOUBLE_CLICK.Value)
            {
                this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK] = null;
            }
            else if (mouseEvent === MOUSE_EVENT_TYPE.LEFT_DOWN.Value)
            {
                this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.LEFT_DOWN] = null;
            }
            else if (mouseEvent === MOUSE_EVENT_TYPE.LEFT_UP.Value)
            {
                this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.LEFT_UP] = null;
            }
            else if (mouseEvent === MOUSE_EVENT_TYPE.MOUSE_MOVE.Value)
            {
                this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.MOUSE_MOVE] = null;
            }
            else if (mouseEvent === MOUSE_EVENT_TYPE.RIGHT_CLICK.Value)
            {
                this.supplementalEventHandlers[Cesium.ScreenSpaceEventType.RIGHT_CLICK] = null;
            }
        }
        catch (error)
        {
            console.log('MapView.removeSupplementalEventHandler: ' + error);
        }
    };

    this.saveMapLocation = function ()
    {

        var cameraPositionCartographic = null;
        var map = null;

        try
        {

            cameraPositionCartographic = this.scene.camera.positionCartographic;

            if (cameraPositionCartographic)
            {

                map = {};
                map.location = {};
                map.location.Longitude = Cesium.Math.toDegrees(cameraPositionCartographic.longitude);
                map.location.Latitude = Cesium.Math.toDegrees(cameraPositionCartographic.latitude);
                map.location.extents = this.generateExtents();
                map.sceneMode = this.scene.mode;

                systemPreferencesModel.set('map', map);

                //console.info('MapView._saveMapLocation: Lat ' + map.location.Latitude + ', Lng ' + map.location.Longitude);
            }
        }
        catch (error)
        {
            console.log('MapView._saveMapLocation: ' + error);
        }
    };

    this.setMapCntrl = function (mapCntrl)
    {

        try
        {

            this.mapCntrl = mapCntrl;
        }
        catch (error)
        {
            console.log('MapView.setMapCntrl: ' + error);
        }
    },
            this.setMapMode = function (mode)
            {

                try
                {

                    this.mode = mode;
                }
                catch (error)
                {
                    console.log('MapView.setMapMode: ' + error);
                }
            },
            this.showHideImageryLayers = function ()
            {

                var layer = null;
                try
                {

                    for (var prop in this.wmsImagery)
                    {

                        layer = this.wmsImagery[prop];

                        if ((layer.maxScale <= this.scale) && (this.scale <= layer.minScale) && (layer.show !== true))
                        {

                            layer.show = true;
                            console.info('MapView._showHideImageryLayers: Turning on layer visiblity: ' + prop + ', scale = ' + this.scale + ', minScale = ' + layer.maxScale + ', maxScale = ' + layer.minScale);
                        }
                        else if ((layer.maxScale <= this.scale) && (this.scale <= layer.minScale) && (layer.show === true))
                        {
                            //do nothing
                        }
                        else if (((this.scale < layer.maxScale) || (layer.minScale < this.scale)) && (layer.show === false))
                        {
                            //do nothing
                        }
                        else
                        {

                            layer.show = false;
                            console.info('MapView._showHideImageryLayers: Turning off layer visiblity: ' + prop + ', scale = ' + this.scale + ', minScale = ' + layer.maxScale + ', maxScale = ' + layer.minScale);
                        }
                    }
                }
                catch (error)
                {
                    console.log('MapView._showHideImageryLayers: ' + error);
                }
            };

    this.updateMousePostion = function (movement)
    {

        var alt = null;
        var altString = null;
        var airspacePoint = null;
        var locString = null;
        var tile = null;

        try
        {

            airspacePoint = this.getLocationFromPosition(movement.endPosition);

            if (airspacePoint)
            {
                var latLon = new LatLon(airspacePoint.Latitude, airspacePoint.Longitude);
//                    locString = latLon.toString("dms",3);
                locString = latLon._lat + " , " + latLon._lon;
//                    locString = coordinateUtils.convertLatLongToCoordString(systemPreferencesModel.coordPref,
                // {
                //    lat : loc.Latitude,
                //    lon : loc.Longitude
                // },
                // true);
            }

            //altitude does not exist in 2D, and is not accurate in columbus view
            if (this.scene.mode === Cesium.SceneMode.SCENE3D)
            {

                alt = this.getAltitudeFromPosition(movement.endPosition);

                if (!isNaN(alt))
                {

//                        altString = 'Altitude: ' + lengthUtils.convertFromSI(alt, systemPreferencesModel.altitudePref, 0) + ' ' +
//                            ALTITUDE_UNITS.getEnumByValue(systemPreferencesModel.altitudePref).Sdsc + ' (approx.)';
//                          altString = 'Altitude: ' + alt + ' ' +
//                            ALTITUDE_UNITS.getEnumByValue(systemPreferencesModel.altitudePref).Sdsc + ' (approx.)';
                    altString = 'Altitude: ' + alt + 'Meters (approx.)';
                }
            }

            if (altString && locString)
            {

                /// mouseLoc.innerHTML = altString + '<br>' + locString;
            }
            else if (locString)
            {
                ////mouseLoc.innerHTML = locString;
            }
            else if (altString)
            {
                //// mouseLoc.innerHTML = altString;
            }
        }
        catch (error)
        {
            console.log('MapView._updateMousePostion: ' + error);
        }
    };

    this.destroy = function ()
    {

        try
        {
            if (this.mapEventHandler)
            {
                this.mapEventHandler.destroy();
                this.mapEventHandler = undefined;
            }
            if (this.mousePositionTimer)
            {

                clearTimeout(this.mousePositionTimer);
                this.mousePositionTimer = null;
            }

            if (this.locationSaverInterval)
            {

                clearInterval(this.locationSaverInterval);
                this.locationSaverInterval = null;
            }

            if (this.scene)
            {

                //remove all the primitives
                this.scene.primitives.removeAll();
                this.scene = null;
            }

            if (this.viewer)
            {

                this.viewer.destroy();
                this.viewer = null;
            }

            if (this.tessellate)
            {
                this.tessellate.destroy();
                this.tessellate = null;
            }
        }
        catch (error)
        {
            console.log('MapView.destroy: ' + error);
        }
    };

    this.addAdditionalCesiumFunctions();
    
    this.mapEventHandler.setInputAction(this.handleLeftMouseClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.mapEventHandler.setInputAction(this.handleLeftDoubleMouseClick, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    this.mapEventHandler.setInputAction(this.handleLeftDownMouse, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    this.mapEventHandler.setInputAction(this.handleLeftUpMouse, Cesium.ScreenSpaceEventType.LEFT_UP);
    this.mapEventHandler.setInputAction(this.handleMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.mapEventHandler.setInputAction(this.handleRightMouseClick, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    this.mapEventHandler.setInputAction(this.handleRightDownMouse, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
    this.mapEventHandler.setInputAction(this.handleRightUpMouse, Cesium.ScreenSpaceEventType.RIGHT_UP);
}
;
