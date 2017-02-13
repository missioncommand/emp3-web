/* global emp, Cesium, DrawHelper, EmpCesium, armyc2, sec, cesiumEngine */

var emp = emp || {};

emp.util.milstdColorFix = function (feature)
{
    var oProperties;
    var oModifiers;

    if (feature.hasOwnProperty('format') && (feature.format === emp.typeLibrary.featureFormatType.MILSTD))
    {
        oProperties = feature.properties;
        if (oProperties && oProperties.hasOwnProperty('modifiers'))
        {
            oModifiers = oProperties.modifiers;
            if (oModifiers.hasOwnProperty('lineColor'))
            {
                oProperties.lineColor = oModifiers.lineColor;
            }
            if (oModifiers.hasOwnProperty('lineWidth'))
            {
                oProperties.lineWidth = oModifiers.lineWidth;
            }
            if (oModifiers.hasOwnProperty('fillColor'))
            {
                oProperties.fillColor = oModifiers.fillColor;
            }
        }
    }
};

emp.engineDefs = emp.engineDefs || {};
emp.engineDefs.cesiumMapEngine = function (args)
{
    // Place private methods and properties here.  Closure provided by returning the engineInterface object makes all
    // the private methods and properties available to the methods defined in engineInterface
    var empMapInstance = args.mapInstance,
            empCesium,
            mapEngineExposed;

    //var bIsV2Core = (args.isV2Core === true) || false;

//    function isV2Core()
//    {
//        return bIsV2Core;
//    }



//END PRIVATE Methods

    var engineInterface = emp.map.createEngineTemplate(),
            mapEngineExposed = engineInterface;
    //engineInterface.implementation.help.edit = sGenericHelpText;
    //engineInterface.implementation.help.draw = sGenericHelpText;
    engineInterface.implementation.displayName = "Cesium Map Engine";
    engineInterface.implementation.version = "BC 15.0.8";
    engineInterface.capabilities.mapType.type3D = true;
    engineInterface.capabilities.mapType.type2_5D = true;
    engineInterface.capabilities.mapType.type3D = true;
    engineInterface.capabilities.formats.GEOJSON_BASIC.plot = true;
    engineInterface.capabilities.formats.GEOJSON_BASIC.draw = true;
    engineInterface.capabilities.formats.GEOJSON_BASIC.edit = true;
    engineInterface.capabilities.formats.GEOJSON_FULL.plot = true;
    engineInterface.capabilities.formats.GEOJSON_FULL.edit = true;
    engineInterface.capabilities.formats.WMS.version_1_1 = true;
    engineInterface.capabilities.formats.WMS.version_1_3 = true;
    engineInterface.capabilities.formats.WMS.elevationData = true;
    engineInterface.capabilities.formats.WMTS.version_1_0_0 = true;
    engineInterface.capabilities.formats.KML_BASIC.plot = true;
    engineInterface.capabilities.formats.KML_BASIC.draw = true;
    engineInterface.capabilities.formats.KML_BASIC.edit = true;
    engineInterface.capabilities.formats.KML_COMPLEX.plot = true;
    engineInterface.capabilities.formats.IMAGE.plot = true;
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
    engineInterface.capabilities.formats.AOI.draw = true;
    engineInterface.capabilities.formats.AOI.edit = true;
    engineInterface.capabilities.settings.milstd.iconSize = true;
    engineInterface.capabilities.settings.milstd.labelOption = true;
    engineInterface.requirements.wmsCapabilities = true;
    engineInterface.capabilities.projection.flat = false;
    engineInterface.initialize.succeed = function (empCesiumInstanceInitialized)
    {
        // Add initialization code here
        try
        {
            empCesium = empCesiumInstanceInitialized;
            //empCesium.empMapInstance = empMapInstance;
            empCesium.mapEngineExposed = mapEngineExposed;
            emp.map.engineDirect = {name: "cesium", ref: empCesium};
            empCesium.dynamicOverlayHash = {}; // For Cesium dynamic data (czml)
            var transaction = new emp.typeLibrary.Transaction({
                intent: emp.intents.control.PROJECTION_ENABLE_FLAT,
                items: [false]
            });
            transaction.run();
            //initializeDataExplorerContentFolders(); // maybe later we can add a layer folder in the tree for non WMS imageries
            //initSuccess();
            //notify application that the map is ready to receive data
            empMapInstance.eventing.StatusChange({
                status: emp.map.states.READY
            });
            emp.imagesUrls = {};
            emp.imagesUrls.whtBlank = "http://maps.google.com/mapfiles/kml/paddle/wht-blank.png";
            // This is a batch call that will control the speed of how fast
            // the map should refresh graphics.
//            empCesium.refreshBatch = new empCesium.Batch({
//                callback: addSymbolMulti,
//                empCesium: empCesium
//            });
        }
        catch (ex)
        {
            console.log("Error initializing cesium ", ex);
        }
    };
    engineInterface.initialize.fail = function (args)
    {
        empMapInstance.eventing.StatusChange({
            status: emp.map.states.MAP_INSTANCE_INIT_FAILED
        });
    };
    engineInterface.configuration = {
        BURST_SOFT_LIMIT: 450,
        BURST_HARD_LIMIT: 500,
        PULSE_SOFT_LIMIT: 250,
        PULSE_HARD_LIMIT: 300
    };
    engineInterface.capture.screenshot = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        console.log("screenshot");
         for (var i = 0; i < transaction.items.length; i += 1)
        {
            var item = transaction.items[i];
            if (empCesium.defined(item))
            {
                empCesium.viewer.render();
                item.dataUrl = empCesium.viewer.canvas.toDataURL("image/png");
            }
        }
    };

//    // Change the style of selected items , and change the size of
//    // selected icons. You do not have to set both values when calling setSelectionStyle.
//    // You can change the color, the scale, or both.
//    engineInterface.selectionStyle = function (transaction)
//    {
//        for (var i = 0; i < transaction.items.length; i += 1)
//        {
//            var item = transaction.items[i];
//            //empCesium.setSelectionStyle(item); // item.color, item.scale
//        }
//    };

    engineInterface.status.get = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var status = new emp.typeLibrary.Status({
            intent: transaction.intent,
            status: getStatus()
        });

        transaction.items[0] = status;
        return true;
    };
    engineInterface.status.reset = function ()
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        console.log("reset status");
    };
    engineInterface.state.destroy = function ()
    {
        if (empCesium)
        {
            empCesium.oEventHandler.destroy();
            empCesium.oEventHandler = undefined;
            empCesium.destroy();
            empCesium = undefined;
            console.log("destroy status");
        }
        //emp.$('#' + empMapInstance.container.get()).html("");
    };
    engineInterface.visibility.set = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        failList = [];
        //try to traverse the items and remove overlays
        for (var i = 0; i < transaction.items.length; i += 1)
        {
            var item = transaction.items[i];
            if (item.coreId === empCesium.cesiumContentCoreId)
            {
                // The cesium content does not really exist.
                continue;
            }
            if (item.overlayId && !item.coreId && item.globalType === "overlay")
            {
                try
                {
                    var layer = empCesium.getLayer(item.coreId);
                    if (layer)
                    {
                        //dynamic layer
                        layer.showLayer(item.visible);
                    }
                }
                catch (err)
                {
                    result.success = false;
                    result.message = "Could not change visibility of overlay.";
                    result.jsError = err;
                }
            }
            else if (item.coreId)
            {
                var layer = empCesium.getLayer(item.coreId);
                if (layer)
                {
                    if ((item.format === 'image' && item.globalType === "feature") ||
                            ((layer.globalType === EmpCesiumConstants.layerType.ARCGIS_93_REST_LAYER) || (layer.globalType === EmpCesiumConstants.layerType.BING_LAYER) ||
                                    (layer.globalType === EmpCesiumConstants.layerType.IMAGE_LAYER) || (layer.globalType === EmpCesiumConstants.layerType.OSM_LAYER) ||
                                    (layer.globalType === EmpCesiumConstants.layerType.TMS_LAYER)))
                    {
                        //A special type of feature handled as a image layer in Cesium
                        //or  layer from the Cesium content Folder (static content)
                        // excluding wms services
                        empCesium.enableLayer(layer, item.visible);
                    }
                    else if (item.parentCoreId && item.globalType === "wms")
                    {
                        if (empCesium.isV2Core)
                        {
                            item.useProxy = emp.util.config.getUseProxySetting();
                        }
                        empCesium.setWmsVisibility(item);
                    }
                }//layer
                else
                {
                    try
                    {
                        var layer = empCesium.getLayer(item.parentCoreId);
                        if (layer)
                        {
                            layer.showFeature(item.coreId, item.visible);
                        }
                    }
                    catch (err)
                    {
                        result.success = false;
                        result.message = "Could not change visibility of the feature.";
                        result.jsError = err;
                    }
                }
            }// else if (item.coreId )
        }//for

        if (!result.success)
        {
            //push an error to the fail list
            failList.push(new emp.typeLibrary.Error({
                coreId: item.coreId,
                message: result.message,
                level: emp.typeLibrary.Error.level.MINOR,
                jsError: result.jsError
            }));
        }

        transaction.fail(failList);
    };
    engineInterface.overlay.add = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var item,
                result,
                failList = [];

        empCesium.entityCollection.suspendEvents();
        for (var i = 0; i < transaction.items.length; i += 1)
        {
            item = transaction.items[i];
            if (item.overlayId !== undefined)
            {
                var layer = empCesium.getLayer(item.overlayId);
                if (layer)
                {
                    result = {
                        success: false,
                        message: "An overlay with this id (" + item.overlayId + ") already exists"
                    };
                }
                else
                {
                    try
                    {
                        var overlay = empCesium.addNewOverlayLayer(item.name, item.overlayId, null);
                        if (overlay && empCesium.defined(item.parentCoreId))
                        {
                            var parentOverlay = empCesium.getLayer(item.parentCoreId);
                            if (empCesium.defined(parentOverlay))
                            {
                                parentOverlay.addSubLayer(overlay);
                            }
                        }
                        empCesium.rootOverlayId = item.overlayId;
                        result = {
                            success: true,
                            message: "New layer added to vega/cesium map"
                        };
                    }
                    catch (e)
                    {
                        console.log(e);
                        result = {
                            success: false,
                            message: "Failed to add layer to vega/cesium map."
                        };
                    }
                }
            }
            else
            {
                result = {
                    success: false,
                    message: "arguments sent to function is undefined."
                };
            }
        }
        empCesium.entityCollection.resumeEvents();
        if (!result.success)
        {
            failList.push(new emp.typeLibrary.Error({
                coreId: item.coreId,
                message: result.message,
                level: emp.typeLibrary.Error.level.MINOR
            }));
        }
        transaction.fail(failList);
        return result;
    };
    engineInterface.overlay.remove = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var result = {},
                failList = [];

        empCesium.entityCollection.suspendEvents();
        for (var i = 0; i < transaction.items.length; i += 1)
        {
            var item = transaction.items[i];
            result = empCesium.removeFolder(item.overlayId);
            if (!result.success)
            {
                //push an error to the fail list
                failList.push(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    message: result.message,
                    level: emp.typeLibrary.Error.level.MINOR,
                    jsError: result.jsError
                }));
            }
        }
        empCesium.entityCollection.resumeEvents();
        transaction.fail(failList);
        return result;
    };
    engineInterface.overlay.update = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var result = {
            success: true,
            jsError: "",
            message: ""
        },
        failList = [],
                item;

        empCesium.entityCollection.suspendEvents();
        for (var i = 0; i < transaction.items.length; i += 1)
        {
            item = transaction.items[i];
            try
            {
                result = empCesium.updateOverlay(item);
            }
            catch (err)
            {
                result.success = false;
                result.jsError = err;
                result.message = "Could not update the overlay.";
            }
            finally
            {
                if (!result.success)
                {
                    //push an error to the fail list
                    failList.push(new emp.typeLibrary.Error({
                        coreId: item.coreId,
                        message: result.message,
                        level: emp.typeLibrary.Error.level.MINOR,
                        jsError: result.jsError
                    }));
                }
            }
        }
        empCesium.entityCollection.resumeEvents();
        return result;
    };
    engineInterface.overlay.clear = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var result = {
            success: true,
            jsError: "",
            message: ""
        },
        failList = [],
                item;

        empCesium.entityCollection.suspendEvents();
        for (var i = 0; i < transaction.items.length; i += 1)
        {
            item = transaction.items[i];
            try
            {
                result = empCesium.clearFolder(item.overlayId);
            }
            catch (err)
            {
                result.success = false;
                result.jsError = err;
                result.message = "Could not clear the overlay.";
            }
            finally
            {
                if (!result.success)
                {
                    //push an error to the fail list
                    failList.push(new emp.typeLibrary.Error({
                        coreId: item.coreId,
                        message: result.message,
                        level: emp.typeLibrary.Error.level.MINOR,
                        jsError: result.jsError
                    }));
                }
            }
        }
        empCesium.entityCollection.resumeEvents();
    };
    engineInterface.view.set = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        this.cameraStoppedMoving = false;
        var result = {
            success: true,
            jsError: "",
            message: ""
        },
        failList = [];

        transaction.pause();
        empCesium.viewTransaction = transaction;

        //try to traverse the items and zoom to range
        for (var i = 0; i < transaction.items.length; i += 1)
        {
            var item = transaction.items[i];
            try
            {
                if (item.location)
                {
                    result = empCesium.goToLocationWithRange(item);
                }
                else if (item.bounds)
                {
                    result = empCesium.zoomToBounds(item);
                }
                else if (item.overlayId || item.coreId)
                {
                    result = empCesium.goToLocationById(item);
                }
                else if (item.range || (item.zoom !== false))
                {
                    result = empCesium.zoomToRange(item);
                }
                else
                {
                    item.range = "auto";
                    result = empCesium.zoomToRange(item);
                }
            }
            catch (err)
            {
                result.success = false;
                result.jsError = err;
                result.message = "Could not set the view.";
            }
            finally
            {
                if (result)
                {
                    if (!result.success)
                    {
                        failList.push(new emp.typeLibrary.Error({
                            coreId: item.coreId,
                            message: result.message,
                            level: emp.typeLibrary.Error.level.MINOR,
                            jsError: result.jsError
                        }));
                    }
                    else
                    {
                        if (!item.animate)
                        {
                            //empCesium.formatView(item);
                            //transaction.run();
                            //empCesium.viewTransaction = undefined;
                        }
                    }
                }
            }
        }
        if (failList.length > 0)
        {
            transaction.fail(failList);
            transaction.run();
            empCesium.viewTransaction = null;
        }
        // transaction.run(); run empCesium.viewTransaction inside the empCesium.viewer.camera.moveStart.addEventListener
    };
    engineInterface.view.get = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var failList = [],
                item,
                newItem;

        //try to traverse the items and zoom to range
        for (var i = 0; i < transaction.items.length; i += 1)
        {
            item = transaction.items[i];
            newItem = empCesium.formatView(item);
            if (newItem.success)
            {
                transaction.items[i] = newItem.item;
            }
            else
            {
                failList.push(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    message: newItem.message,
                    level: emp.typeLibrary.Error.level.MINOR,
                    jsError: newItem.jsError
                }));
            }
        }
        transaction.fail(failList);
        return true;
    };


    engineInterface.view.getLatLonFromXY = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var failList = [],
                item,
                cartesian,
                cartographic;

        for (var i = 0; i < transaction.items.length; i += 1)
        {
            item = transaction.items[i];
            cartesian = empCesium.viewer.camera.pickEllipsoid(new empCesium.Cartesian2(item.x, item.y), empCesium.scene.globe.ellipsoid);
            if (cartesian)
            {
                cartographic = empCesium.Cartographic.fromCartesian(cartesian);
                //cartographic.longitude = empCesium.CesiumMath.convertLongitudeRange(cartographic.longitude)
                item.lat = cartographic.latitude.toDeg();
                item.lon = cartographic.longitude.toDeg();
            }
            else
            {
                item.invalid = true;
                failList.push(new emp.typeLibrary.Error({
                    message: " Conversion from x y  to lat lon failed",
                    level: emp.typeLibrary.Error.level.MINOR,
                    jsError: "undefined cartesian"
                }));
            }
        }
        //transaction.fail(failList);
        return transaction;
    };

    engineInterface.view.getXYFromLatLon = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var failList = [],
                item,
                cartesian3,
                cartesian2,
                cartographic,
                isValidGeoLocation = false;
        ;

        //try to traverse the items and zoom to range
        for (var i = 0; i < transaction.items.length; i += 1)
        {
            item = transaction.items[i];
            isValidGeoLocation = cesiumEngine.utils.valid_coords(item.lat, item.lon);
            //The x,y returned are related to the start of the canvas
            cartographic = empCesium.Cartographic.fromDegrees(item.lon, item.lat, 0);
            cartesian3 = empCesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);
            if (cartesian3 && isValidGeoLocation)
            {
                cartesian2 = empCesium.SceneTransforms.wgs84ToWindowCoordinates(empCesium.scene, cartesian3);
                item.x = cartesian2.x;
                item.y = cartesian2.y;
            }
            else
            {
                item.invalid = true;
                failList.push(new emp.typeLibrary.Error({
                    message: " Conversion from lat lon to x y failed",
                    level: emp.typeLibrary.Error.level.MINOR,
                    jsError: "undefined cartesian"
                }));
            }
        }
        //transaction.fail(failList);
        return transaction;
    };

    if (engineInterface.lookAt)
    {
        /**
         * Causes Cesium to update the viewer camera to use a LookAt
         *
         * @param {emp.typeLibrary.Transaction} transaction
         */
        engineInterface.lookAt.set = function (transaction)
        {
            empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
            var result = {
                success: true,
                jsError: "",
                message: ""
            },
            failList = [];

            transaction.pause();
            empCesium.viewTransaction = transaction;

            for (var i = 0; i < transaction.items.length; i += 1)
            {
                var item = transaction.items[i];
                try
                {
                    empCesium.lookAtLocation(item);
                }
                catch (err)
                {
                    result.success = false;
                    result.jsError = err;
                    result.message = "Could not set the lookAt.";
                }
                finally
                {
                    if (result)
                    {
                        if (!result.success)
                        {
                            failList.push(new emp.typeLibrary.Error({
                                coreId: item.coreId,
                                message: result.message,
                                level: emp.typeLibrary.Error.level.MINOR,
                                jsError: result.jsError
                            }));
                        }
                    }
                }
            }
            if (failList.length > 0)
            {
                transaction.fail(failList);
                empCesium.viewTransaction = null;
            }
            transaction.run();
        };
    }
    ;



    engineInterface.kmllayer.add = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var result = {}, standard = 1,
                failList = [];

        try
        {
           if (!(empCesium.mapMotionLockEnum === emp3.api.enums.MapMotionLockEnum.NO_MOTION))
            {
                empCesium.entityCollection.suspendEvents();
            }
            for (var i = 0; i < transaction.items.length; i += 1)
            {
                var item = transaction.items[i];
                result = empCesium.addKmlLayer(item);
            }
            if (!(empCesium.mapMotionLockEnum === emp3.api.enums.MapMotionLockEnum.NO_MOTION))
            {
                empCesium.entityCollection.resumeEvents();
            }
        }
        catch (e)
        {
            result.success = false;
            result.jsError = e;
            result.message = "Could not render  kmllayer.add.";
        }
        finally
        {
            if (result)
            {
                if (!result.success)
                {
                    failList.push(new emp.typeLibrary.Error({
                        coreId: item.coreId,
                        message: result.message,
                        level: emp.typeLibrary.Error.level.MINOR,
                        jsError: result.jsError
                    }));
                    transaction.fail(failList);
                }
            }
        }
        if (failList.length > 0)
        {
            transaction.fail(failList);
        }
        transaction.run();
    };

    engineInterface.kmllayer.remove = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var result = {},
                failList = [];

        //try to traverse the items and remove features
        // empCesium.entityCollection.suspendEvents();
        for (var i = 0; i < transaction.items.length; i += 1)
        {
            var item = transaction.items[i];
            if (item.coreId === empCesium.drawData.id)
            {
                engineInterface.edit.cancel(empCesium.drawData.transaction);
            }
            result = empCesium.removeGraphic(item);
            empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
            if (!result.success)
            {
                //push an error to the fail list
                failList.push(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    message: result.message,
                    level: emp.typeLibrary.Error.level.MINOR,
                    jsError: result.jsError
                }));
            }
        }

    };

    engineInterface.feature.add = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var result = {}, standard = 1,
                failList = [];

        //try to traverse the items and add features
        try
        {
            if (!(empCesium.mapMotionLockEnum === emp3.api.enums.MapMotionLockEnum.NO_MOTION))
            {
                empCesium.entityCollection.suspendEvents();
            }
            for (var i = 0; i < transaction.items.length; i += 1)
            {
                var item = transaction.items[i];
//                var feature = empCesium.getFeature(item.coreId);
//                if (empCesium.defined(feature))
//                {
//                    var cartographics = cesiumEngine.utils.convertGeoJsonCoordToCartographicList (item.data);
//                    var featureExtent = empCesium.Rectangle.fromCartographicArray(cartographics) ;
//                    if (cartographics.length === 1)
//                    {
//                        if (!empCesium.Rectangle.contains(empCesium.getExtent(), cartographics[0]))
//                        {
//                            continue
//                        }
//                    }
//                    else if (!empCesium.Rectangle.intersection(empCesium.getExtent(), featureExtent))
//                    {
//                        continue;
//                    }
//                }
                //if there is a parentId, use that. Otherwise, use the overlayId.
//                if (!emp.util.isEmptyString(item.parentId) &&  !empCesium.isLayer(item.parentId) )
//                {
//                    //v2
//                    item.parentType = "feature";
//                }
                if ((!emp.util.isEmptyString(item.coreParent) &&  !empCesium.isLayer(item.coreParent)) && (!emp.util.isEmptyString(item.overlayId) && item.overlayId !== item.coreParent  ) )
                {
                    item.parentType = "feature";
                }
                else
                {
                    item.parentType = "overlay";
                }
                //filter on the feature type
                if (item.url)
                { //is a url
                    //transaction needs to be passed in case an asynchronous call needs to be made
                    result = empCesium.addUrl(item, {
                        transaction: transaction,
                        item: i
                    });
                }
                else if (item.symbolCode)
                { //is a symbol
                    if (item.format === emp.typeLibrary.featureFormatType.MILSTD)
                    {
                        if (empCesium.isV2Core)
                        {
                            emp.util.milstdColorFix(item);
                        }
                        //validate and try to fix modifier values
                        if (item.properties)
                        {
                            item.properties.modifiers = (empCesium.defined(item.properties.modifiers) ? item.properties.modifiers : {});
                        }
                        else
                        {
                            item.properties = {};
                            item.properties.modifiers = {};
                        }
                        cesiumEngine.utils.validateStringModifierValues(item.properties.modifiers);
                        if (!cesiumEngine.utils.isSymbolStandardSpecified(item.properties.modifiers))
                        {
                            //fix absence of string standard in modifiers
                            item.properties.modifiers.standard = (empCesium.isV2Core) ? emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B : emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C;
                        }
                        //standard = cesiumEngine.utils.checkSymbolStandard(item.properties.modifiers);
                        if (cesiumEngine.utils.is3dSymbol(item))
                        {
                            //check if the feature was already present as a 2D multipoint.
                            var is2DMultiPointPresent = empCesium.isMultiPointPresent(item.coreId);
                            if (is2DMultiPointPresent)
                            {
                                empCesium.removeGraphic(item);
                            }
                            // transform to an airspace
                            var airspaceItem = cesiumEngine.utils.transformMilStdTransactionItemToAirspace3D(item);
                            result = empCesium.addAirspace(airspaceItem);
                            if (result.success)
                            {
                                // add label if airspace was rendered successfully.
                                var itemForLabel = emp.helpers.copyObject(item);
                                itemForLabel.extrudedHeight = airspaceItem.properties.attributes[0][cesiumEngine.utils.AirspaceParameterEnumType.AIRSPACE_MAX_ALTITUDE];
                                itemForLabel.multiPointRenderType = EmpCesiumConstants.MultiPointRenderType.SVG_LABEL_ONLY;
                                itemForLabel.coreId = item.coreId + "_label";
                                result = empCesium.addMilStd(itemForLabel);
                            }
                        }
                        else
                        {
                            //check if the feature was already present as a 3D multipoint.
                            var isAirspacePresent = empCesium.isAirspacePresent(item.coreId);
                            if (isAirspacePresent)
                            {
                                //remove airspace and label from map and airspace hash.
                                empCesium.removeGraphic(item);
                            }
                            item.multiPointRenderType = EmpCesiumConstants.MultiPointRenderType.SVG;
                            result = empCesium.addMilStd(item);
                        }
                    }
                    else if (item.format === "airspace")
                    {
                        result = empCesium.addAirspace(item);
                        if (!result.success)
                        {
                            //push an error to the fail list
                            failList.push(new emp.typeLibrary.Error({
                                coreId: item.coreId,
                                message: result.message,
                                level: emp.typeLibrary.Error.level.MINOR,
                                jsError: result.jsError
                            }));
                        }
                    }
                    else
                    {
                        console.log("This is some kind of weird symbol");
                        result = {
                            success: false,
                            jsError: "This is some kind of weird symbol",
                            message: "This is some kind of weird symbol"
                        };
                    }
                }
                else
                { //is a feature kml or geojson
                    result = empCesium.addFeature(item);
                }
                if (!result.success)
                {
                    //push an error to the fail list
                    failList.push(new emp.typeLibrary.Error({
                        coreId: item.coreId,
                        message: result.message,
                        level: emp.typeLibrary.Error.level.MINOR,
                        jsError: result.jsError
                    }));
                }
                else
                {
                    //if zoom was set, zoom to it on the map
                    if (item.zoom)
                    {
                        if (item.url)
                        {
                            var layer = empCesium.getLayer(item.overlayId);
                            var feature = layer.getFeature(item.coreId);
                            if (feature && feature.featureType === EmpCesiumConstants.featureType.DATA_SOURCE)
                            {
                                empCesium.flyTo({
                                    destination: feature,
                                    range: item.range,
                                    orientation: {heading: 0.0, pitch: empCesium.Math.toRadians(-75), roll: 0.0}
                                });
                            }
                        }
                        else
                        {
                            engineInterface.view.set(item.locate());
                        }
                    }
                }
            }
        }
        catch (ex)
        {
            result = {
                success: false,
                jsError: ex,
                message: "function: engineInterface.feature.add"
            };
            failList.push(new emp.typeLibrary.Error({
                coreId: item.coreId,
                message: result.message,
                level: emp.typeLibrary.Error.level.MINOR,
                jsError: result.jsError
            }));
        }
       if (!(empCesium.mapMotionLockEnum === emp3.api.enums.MapMotionLockEnum.NO_MOTION))
        {
            empCesium.entityCollection.resumeEvents();
        }
        transaction.fail(failList);
    };
    engineInterface.feature.remove = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var result = {},
                failList = [];

        //try to traverse the items and remove features
        // empCesium.entityCollection.suspendEvents();
        for (var i = 0; i < transaction.items.length; i += 1)
        {
            var item = transaction.items[i];
            if (item.coreId === empCesium.drawData.id)
            {
                engineInterface.edit.cancel(empCesium.drawData.transaction);
            }
            result = empCesium.removeGraphic(item);
            empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
            if (!result.success)
            {
                //push an error to the fail list
                failList.push(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    message: result.message,
                    level: emp.typeLibrary.Error.level.MINOR,
                    jsError: result.jsError
                }));
            }
        }
        //empCesium.entityCollection.resumeEvents();
        //empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        transaction.fail(failList);
        return true;
    };
    engineInterface.feature.update = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var failList = [];

        try
        {
            //try to traverse the items
            empCesium.entityCollection.suspendEvents();
            for (var i = 0; i < transaction.items.length; i += 1)
            {
                var item = transaction.items[i];
                //var overlayId = item.parentCoreId; // parentCoreId is always referencing the current parent the fetaureToMove belongs to.
                //var overlayId = empCesium.rootOverlayId;
                var layer;

                if (emp.util.isEmptyString(item.parentId))
                {
                    layer = empCesium.getLayer(item.parentCoreId);
                }
                else
                {
                    layer = empCesium.getLayer(item.overlayId);
                    if (layer === undefined)
                    {
                        layer = empCesium.getLayer(item.parentCoreId);
                    }
                }
                if (layer)
                {
                    var featureToMove = empCesium.getFeature(item.coreId);
                    if (featureToMove && !emp.util.isEmptyString(item.destParentId))
                    {
                        // the new parent is a feature
                        var newParentLayer = empCesium.getLayer(item.destOverlayId);
                        if (newParentLayer)
                        {
                            var newParentFeature = newParentLayer.getFeature(item.destCoreParent); // destCoreParent references the case of new feature parent
                            if (newParentFeature)
                            {
                                layer.deallocateFeatureChild(featureToMove.parent, featureToMove);
                                if (layer.id !== newParentLayer.id)
                                {
                                    //var parentOfFeatureToMove = featureToMove.parent;
                                    layer.deallocateFeature(featureToMove);
                                    newParentLayer.allocateFeature(featureToMove);
                                }
                                newParentLayer.allocateFeatureChild(newParentFeature, featureToMove);
                                // todo when allocating set the new overlay ID for each feature.....
                            }
                        }
                    }
                    else if (featureToMove && item.destCoreParent)
                    {
                        // the new parent is an overlay
                        var newParentLayer = empCesium.getLayer(item.destCoreParent);
                        if (newParentLayer)
                        {
                            layer.deallocateFeatureChild(featureToMove.parent, featureToMove);
                            if (layer.id !== newParentLayer.id)
                            {
                                layer.deallocateFeature(featureToMove);
                                newParentLayer.allocateFeature(featureToMove);
                            }
                            // todo when allocatng set the new overlay ID for each feature.....
                        }
                    }
                    else
                    {
                        failList.push(new emp.typeLibrary.Error({
                            coreId: item.coreId,
                            message: "engineInterface.feature.update(): destination parent not found in map.",
                            level: emp.typeLibrary.Error.level.MAJOR
                        }));
                    }
                }
                else
                {
                    failList.push(new emp.typeLibrary.Error({
                        coreId: item.coreId,
                        message: "engineInterface.feature.update(): Layer not found in map.",
                        level: emp.typeLibrary.Error.level.MAJOR
                    }));
                }
            }
        }
        catch (ex)
        {
            failList.push(new emp.typeLibrary.Error({
                coreId: item.coreId,
                message: "engineInterface.feature.update():" + ex,
                level: emp.typeLibrary.Error.level.MAJOR
            }));
        }
        transaction.fail(failList);
        empCesium.entityCollection.resumeEvents();
        return true;
    };
    engineInterface.addCompleteDrawing = function ()
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var result = {
            success: true,
            jsError: "",
            message: ""
        },
        geojsonCoordinates, updates,
                transaction;

        try
        {
            if (empCesium.drawData.transaction)
            {
                transaction = empCesium.drawData.transaction;
                empCesium.drawData.isDrawing = false;
                var properties = {};
                properties.readOnly = false;
                if (empCesium.drawData.geometryType === "Point")
                {
                    geojsonCoordinates = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({"type": "Point", "coordinates": empCesium.drawData.coordinates});
                    if (empCesium.drawData.item.plotFeature.format === "milstd" ||
                            empCesium.drawData.item.plotFeature.format === "symbol")
                    {
                        transaction.items[0].plotFeature.format = "milstd";
                    }
                    else if ((transaction.items[0].plotFeature.format !== emp3.api.enums.FeatureTypeEnum.GEO_TEXT) &&
                            (transaction.items[0].plotFeature.format !== emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE) &&
                            (transaction.items[0].plotFeature.format !== emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE) &&
                            (transaction.items[0].plotFeature.format !== emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE) &&
                            (transaction.items[0].plotFeature.format !== emp3.api.enums.FeatureTypeEnum.GEO_SQUARE))
                    {
                        transaction.items[0].plotFeature.format = "geojson";
                    }
                    transaction.items[0].plotFeature.data.coordinates = geojsonCoordinates; // geojson coordinate format her to do
                    transaction.items[0].plotFeature.coordinates = transaction.items[0].plotFeature.data.coordinates;
                    transaction.items[0].plotFeature.data.type = "Point";
                    transaction.items[0].plotFeature.properties = empCesium.drawData.properties;
                }
                else if (empCesium.drawData.geometryType === "LineString")
                {
                    if (empCesium.drawData.item.plotFeature.format === "milstd" ||
                            empCesium.drawData.item.plotFeature.format === "symbol")
                    {
                        transaction.items[0].plotFeature.format = "milstd";
                        geojsonCoordinates = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({"type": "milstd", "coordinates": empCesium.drawData.coordinates});
                    }
                    else
                    {
                        transaction.items[0].plotFeature.format = "geojson";
                        geojsonCoordinates = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({"type": "LineString", "coordinates": empCesium.drawData.coordinates});
                    }
                    transaction.items[0].plotFeature.data.coordinates = geojsonCoordinates; // geojson coordinate format her to do
                    transaction.items[0].plotFeature.coordinates = transaction.items[0].plotFeature.data.coordinates;
                    transaction.items[0].plotFeature.data.type = "LineString";
                    if (transaction.items[0].plotFeature && transaction.items[0].plotFeature.properties && transaction.items[0].plotFeature.properties.modifiers && transaction.items[0].plotFeature.properties.modifiers.standard)
                    {
                        empCesium.drawData.properties.modifiers.standard = transaction.items[0].plotFeature.properties.modifiers.standard;
                    }
                    transaction.items[0].plotFeature.properties = empCesium.drawData.properties;
                }
                else if (empCesium.drawData.geometryType === "Polygon")
                {
                    if (empCesium.drawData.item.plotFeature.format === emp.typeLibrary.featureFormatType.MILSTD ||
                            empCesium.drawData.item.plotFeature.format === "milstd" ||
                            empCesium.drawData.item.plotFeature.format === "symbol")
                    {
                        transaction.items[0].plotFeature.format = emp.typeLibrary.featureFormatType.MILSTD;
                        geojsonCoordinates = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({"type": "Polygon", "coordinates": empCesium.drawData.coordinates});
                    }
                    else
                    {
                        transaction.items[0].plotFeature.format = "geojson";
                        geojsonCoordinates = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({"type": "Polygon", "coordinates": empCesium.drawData.coordinates});
                    }
                    transaction.items[0].plotFeature.data.coordinates = geojsonCoordinates;
                    transaction.items[0].plotFeature.coordinates = transaction.items[0].plotFeature.data.coordinates;
                    transaction.items[0].plotFeature.data.type = "Polygon";
                    transaction.items[0].plotFeature.properties = empCesium.drawData.properties;
                }
                else if (empCesium.drawData.isAirspace)
                {
                    transaction.items[0].plotFeature.format = "airspace";
                    if (empCesium.drawData.coordinates.length === 1)
                    {
                        geojsonCoordinates = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({"type": "Point", "coordinates": empCesium.drawData.coordinates});
                        transaction.items[0].plotFeature.data.type = "Point";
                    }
                    if (empCesium.drawData.coordinates.length > 1)
                    {
                        geojsonCoordinates = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({"type": "LineString", "coordinates": empCesium.drawData.coordinates});
                        transaction.items[0].plotFeature.data.type = "LineString";
                    }
                    transaction.items[0].plotFeature.data.coordinates = geojsonCoordinates; // geojson coordinate format her to do
                    transaction.items[0].plotFeature.coordinates = transaction.items[0].plotFeature.data.coordinates;
                    transaction.items[0].plotFeature.data.symbolCode = empCesium.drawData.airspace.SymbolCode;
                    transaction.items[0].plotFeature.properties = empCesium.drawData.properties;
                }
                // var convertedToEmpPrimitive = undefined;
                // if (cesiumEngine.utils.isEmpPrimitive(empCesium.drawData.drawType))
                // {
                //     convertedToEmpPrimitive = cesiumEngine.utils.convertMilStandardItemToEmpPrimitiveItem(item, empCesium.drawData.drawType);
                //
                // }
                if (transaction.items[0].plotFeature.format === emp.typeLibrary.featureFormatType.MILSTD)
                {
                    if (cesiumEngine.utils.isEmpPrimitive(empCesium.drawData.properties.featureType))
                    {
                        var indices = cesiumEngine.utils.fillArrayWithNumbers(empCesium.drawData.coordinates.length);
                        updates = new emp.typeLibrary.CoordinateUpdate({
                            type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                            indices: indices
                        });
                        updates.convertFromGeoJson({type: empCesium.drawData.geometryType, coordinates: geojsonCoordinates});
                        transaction.items[0].plotFeature.format = empCesium.drawData.properties.featureType;
                    }
                    else
                    {
                        updates = {
                            type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                            indices: [],
                            coordinates: cesiumEngine.utils.convertCartographicArrayToArrayOfObjectsInDegrees({"type": empCesium.drawData.geometryType, "coordinates": empCesium.drawData.coordinates})
                        };
                    }

                }
                else
                {
                    indices = cesiumEngine.utils.fillArrayWithNumbers(empCesium.drawData.coordinates.length);
                    updates = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: indices
                    });
                    updates.convertFromGeoJson({type: empCesium.drawData.geometryType, coordinates: geojsonCoordinates});

//                    var updates = {
//                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
//                        indices: [],
//                        coordinates: geojsonCoordinates
//                    };
                }
                transaction.items[0].update({
                    name: transaction.items[0].name,
                    properties: (cesiumEngine.utils.isEmpPrimitive(empCesium.drawData.properties.featureType)) ? cesiumEngine.utils.convertMilStandardPropertiesToEmpPrimitiveProperties(empCesium.drawData.properties, empCesium.drawData.properties.featureType) : empCesium.drawData.properties,
                    updateEventType: emp.typeLibrary.UpdateEventType.COMPLETE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                    updates: updates,
                    plotFeature: transaction.items[0].plotFeature
                });
                empMapInstance.eventing.DrawEnd({
                    transaction: transaction
                });
                empCesium.currentDrawingId = null;
                transaction.run();
                if (empCesium.defined(empCesium.drawHelper) && empCesium.drawHelper !== null)
                {
                    empCesium.drawHelper.stopDrawing();
                    empCesium.drawHelper.destroy();
                    empCesium.drawHelper = null;
                }
                if (empCesium.drawData.isAirspace)
                {
                    empCesium.airspaceDrawHandler.finishDraw();
                }
            }
            empCesium.drawData.transaction = undefined;
        }
        catch (err)
        {
            result.success = false;
            result.jsError = err;
            result.message = "Could not draw feature";
        }
        return result;
    };
    engineInterface.draw.begin = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var result = {
            success: false,
            message: "",
            jsError: ""
        },
        failList = [];

        //try to traverse the items and remove features
        for (var i = 0; i < transaction.items.length; i += 1)
        {
            var item = transaction.items[i];
            empCesium.editorController.stopDraw();
            //store the transaction to use when drawing is finished
            empCesium.drawData = {};
            empCesium.drawData.transaction = transaction;
            result = empCesium.editorController.drawFeature(item);
            if (!result.success)
            {
                //push an error to the fail list
                failList.push(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    message: result.message,
                    level: emp.typeLibrary.Error.level.MINOR,
                    jsError: result.jsError
                }));
            }
        }
        if (failList.length > 0)
        {
            transaction.fail(failList);
            return true;
        }
        else
        {
            //pause the transaction
            transaction.pause();
            //publish the start event
            empMapInstance.eventing.DrawStart({
                transaction: transaction
            });
        }
    };
    engineInterface.draw.end = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var failList = [],
                result = {
                    success: true,
                    message: "",
                    jsError: ""
                };

        try
        {
            if (empCesium.drawData && empCesium.drawData.transaction && !empCesium.defined(empCesium.drawData.coordinates))
            {
                // nothing was drawn. Cancel draw operation
                engineInterface.draw.cancel(empCesium.drawData.transaction);
            }
            else if (empCesium.drawData && empCesium.drawData.transaction && empCesium.defined(empCesium.drawData.coordinates) && (empCesium.drawData.coordinates  instanceof Array && empCesium.drawData.coordinates.length === 0))
            {
                // nothing was drawn. Cancel draw operation
                engineInterface.draw.cancel(empCesium.drawData.transaction);
            }
            else
            {
                result = empCesium.editorController.stopDraw();
                if (!result.success)
                {
                    failList.push(new emp.typeLibrary.Error({
                        coreId: transaction.coreId,
                        message: result.message,
                        level: result.level || emp.typeLibrary.Error.level.MINOR,
                        jsError: result.jsError
                    }));
                }
            }
        }
        catch (err)
        {
            failList.push(new emp.typeLibrary.Error({
                coreId: transaction.coreId,
                message: "An error occured when attempting to stop the drawing.",
                level: emp.typeLibrary.Error.level.MINOR,
                jsError: err
            }));
        }
        transaction.fail(failList);
        return true;
    };
    engineInterface.draw.cancel = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var failList = [], //the failList for this transaction
                initFailList = [], //the failList for the initial draw transaction
                result = {
                    success: true,
                    message: "",
                    jsError: ""
                };

        try
        {
            result = empCesium.editorController.cancelDrawFeature();
            //reset the drawData and run the old transaction
            //these need to be here incase a complete needs
            //to call the cancelEdit function directly without
            //a transaction.
            //publish the drawing end event
            initFailList.push(new emp.typeLibrary.Error({
                coreId: empCesium.drawData.transaction.items[0].coreId,
                message: "The drawing was cancelled.",
                level: emp.typeLibrary.Error.level.INFO
            }));
            empCesium.drawData.transaction.fail(initFailList);
            empMapInstance.eventing.DrawEnd({
                transaction: empCesium.drawData.transaction
            });
            //run the transaction and clear the original drawData object
            empCesium.drawData.transaction.run();
            empCesium.drawData = {
                isDrawing: false
            };
            if (!result.success)
            {
                failList.push(new emp.typeLibrary.Error({
                    coreId: transaction.coreId,
                    message: result.message,
                    level: result.level || emp.typeLibrary.Error.level.INFO,
                    jsError: result.jsError
                }));
            }
        }
        catch (err)
        {
            failList.push(new emp.typeLibrary.Error({
                coreId: transaction.coreId,
                message: "Failed to cancel drawing.",
                level: emp.typeLibrary.Error.level.MINOR,
                jsError: err
            }));
        }
        transaction.fail(failList);
        return true;
    };
    engineInterface.edit.begin = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var result = {},
                failList = [];

        for (var i = 0; i < transaction.items.length; i += 1)
        {
            var item = transaction.items[i];
            empCesium.editorController.stopDraw();
            empCesium.editorFeatureDraggingEnable = (empCesium.defined(item.moveable)) ? item.moveable : true; // default is true
            //store the transaction to use when editing is finished
            empCesium.drawData = {};
            empCesium.drawData.transaction = transaction;
            empCesium.drawData.originFeature = transaction.items[i].originFeature;
            empCesium.drawData.item = item;
            result = empCesium.editorController.editFeature(item);
            //remove starburst when editing, but make sure the original eyeoffet is stored iside the feature for the case that the edited feature
            // is in decluttered state. When removing the starburst and one of the decluttered is the one in edit mode the starburst must keep the
            // decluttered eyeoffset only for the edited feature but store in the feature the original eyeoffset in case the edit is cancelled and the feature can go back to its original position and eyeoffet.
            empCesium.starBurst.undoStarBurst();

            if (!result.success)
            {
                //push an error to the fail list
                failList.push(new emp.typeLibrary.Error({
                    coreId: item.coreId,
                    message: result.message,
                    level: emp.typeLibrary.Error.level.MINOR,
                    jsError: result.jsError
                }));
            }
        }
        if (failList.length > 0)
        {
            transaction.fail(failList);
            return true;
        }
        else
        {
            //pause the transaction
            transaction.pause();
            //publish the start event
            empMapInstance.eventing.EditStart({
                transaction: transaction,
                featureId: transaction.items[0].featureId,
                overlayId: transaction.items[0].overlayId,
                parentId: transaction.items[0].parentId
            });
        }
    };
    engineInterface.edit.end = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var failList = [],
                result = {
                    success: true,
                    message: "",
                    jsError: ""
                };

        try
        {
            result = empCesium.editorController.stopEditFeature();
            if (!result.success)
            {
                failList.push(new emp.typeLibrary.Error({
                    coreId: transaction.coreId,
                    message: result.message,
                    level: result.level || emp.typeLibrary.Error.level.MINOR,
                    jsError: result.jsError
                }));
            }
        }
        catch (err)
        {
            failList.push(new emp.typeLibrary.Error({
                coreId: transaction.coreId,
                message: "Failed to stop editing.",
                level: emp.typeLibrary.Error.level.MINOR,
                jsError: err
            }));
        }
        if (failList.length > 0)
        {
            // something went wrong when trying to end an edit operation.
            // cancel the edit operation so the engine don't get stuck in edit mode.
            if (empCesium.drawData && empCesium.drawData.transaction)
            {
                engineInterface.edit.cancel(empCesium.drawData.transaction);
            }
        }
        empCesium.drawData = {};
        transaction.fail(failList);
        return true;
    };
    engineInterface.edit.cancel = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var failList = [], //the failList for this transaction
                initFailList = [], //the failList for the initial edit transaction
                result = {
                    success: true,
                    message: "",
                    jsError: ""
                };

        try
        {
            result = empCesium.editorController.cancelEditFeature();
            //publish the drawing end event
            initFailList.push(new emp.typeLibrary.Error({
                coreId: empCesium.drawData.transaction.items[0].coreId,
                message: "The editing was cancelled.",
                level: emp.typeLibrary.Error.level.INFO
            }));
            empMapInstance.eventing.EditEnd({
                transaction: empCesium.drawData.transaction,
                failures: initFailList
            });
            //run the transaction and clear the original drawData object
            empCesium.drawData.transaction.run();
            empCesium.drawData = {};
            if (!result.success)
            {
                failList.push(new emp.typeLibrary.Error({
                    coreId: transaction.coreId,
                    message: result.message,
                    level: result.level || emp.typeLibrary.Error.level.MINOR,
                    jsError: result.jsError
                }));
            }
        }
        catch (err)
        {
            failList.push(new emp.typeLibrary.Error({
                coreId: transaction.coreId,
                message: "Failed to cancel editing.",
                level: emp.typeLibrary.Error.level.MINOR,
                jsError: err
            }));
        }
        transaction.fail(failList);
        return true;
    };
    engineInterface.selection.set = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var result = {
            success: true,
            jsError: "",
            message: ""
        },
        selectionArgs = {},
                item,
                i,
                failList = [];

        //try to traverse the items and select them
        for (i = 0; i < transaction.items.length; i += 1)
        {
            selectionArgs = {};
            item = transaction.items[i];
            selectionArgs.featureId = item.coreId;
            selectionArgs.sendEvent = false;
            selectionArgs.isApiInitiatedSelection = true;
            /* This try is used to catch any unexpected errors that
             could occur in the manageSelect(). There are many Google
             Earth API specific calls which could fail if invalid
             values are provided to them. However this try is placed
             inside of the loop that traverses the items inside of
             the transaction object because we want it to go through all
             items even if it fails on some. Also, this try is used to
             catch the edit state error that could be thrown from
             manageSelect() if the client tries to select during this
             period. */
            try
            {
                if (item.select)
                {
                    if (!empCesium.isFeatureSelected(selectionArgs.coreId || selectionArgs.featureId))
                    {
                        empCesium.manageSelect(selectionArgs);
                    }
                }
                else
                {
                    if (empCesium.isFeatureSelected(selectionArgs.coreId || selectionArgs.featureId))
                    {
                        empCesium.manageDeselect(selectionArgs);
                    }
                }
            }
            catch (err)
            {
                result.success = false;
                result.jsError = err;
                result.message = err.message || "Could not select the feature/sub-item.";
            }
            finally
            {
                if (!result.success)
                {
                    failList.push(new emp.typeLibrary.Error({
                        level: emp.typeLibrary.Error.level.MINOR,
                        jsError: result.jsError
                    }));
                }
            }
        }
        transaction.fail(failList);
        return true;
    };
    engineInterface.wms.add = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        for (var i = 0; i < transaction.items.length; i++)
        {
            if (empCesium.isV2Core)
            {
                transaction.items[i].useProxy = emp.util.config.getUseProxySetting();
            }
            empCesium.addWmsToMap(transaction.items[i]);
        }
//        if (!empCesium.defaultImageryEmpLayer && transaction.items.length > 0)
//        {
//            // select first wms as the default wms service
//            var item = transaction.items[0];
//            var layer = empCesium.getLayer(item.coreId);
//            empCesium.enableLayer(layer, true);
//            empCesium.defaultImageryEmpLayer = layer;
//        }
        return true;
    };
    engineInterface.wms.remove = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var failList = [];

        try
        {
            for (var i = 0; i < transaction.items.length; i++)
            {
                empCesium.removeWmsFromMap(transaction.items[i]);
            }
        }
        catch (e)
        {
            failList.push(new emp.typeLibrary.Error({
                coreId: transaction.coreId,
                message: "Failed to cancel editing.",
                level: emp.typeLibrary.Error.level.MINOR,
                jsError: err
            }));
        }
        transaction.fail(failList);
        return true;
    };
    engineInterface.wms.visibility.set = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        for (var i = 0; i < transaction.items.length; i++)
        {
            if (empCesium.isV2Core)
            {
                transaction.items[i].useProxy = emp.util.config.getUseProxySetting();
            }
            empCesium.setWmsVisibility(transaction.items[i]);
        }
        return true;
    };

    engineInterface.wmts.add = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        for (var i = 0; i < transaction.items.length; i++)
        {
            if (empCesium.isV2Core)
            {
                transaction.items[i].useProxy = emp.util.config.getUseProxySetting();
            }
            empCesium.addWmtsToMap(transaction.items[i]);
        }
//        if (!empCesium.defaultImageryEmpLayer && transaction.items.length > 0)
//        {
//            // select first wms as the default wms service
//            var item = transaction.items[0];
//            var layer = empCesium.getLayer(item.coreId);
//            empCesium.enableLayer(layer, true);
//            empCesium.defaultImageryEmpLayer = layer;
//        }
        return true;
    };
    engineInterface.wmts.remove = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var failList = [];

        try
        {
            for (var i = 0; i < transaction.items.length; i++)
            {
                empCesium.removeWmtsFromMap(transaction.items[i]);
            }
        }
        catch (e)
        {
            failList.push(new emp.typeLibrary.Error({
                coreId: transaction.coreId,
                message: "Failed to cancel editing.",
                level: emp.typeLibrary.Error.level.MINOR,
                jsError: err
            }));
        }
        transaction.fail(failList);
        return true;
    };
//    engineInterface.wmts.visibility.set = function (transaction)
//    {
//        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
//        for (var i = 0; i < transaction.items.length; i++)
//        {
//            if (empCesium.isV2Core)
//            {
//                transaction.items[i].useProxy = emp.util.config.getUseProxySetting();
//            }
//            empCesium.setWmtsVisibility(transaction.items[i]);
//        }
//        return true;
//    };
    engineInterface.projection.enable.flat = function (oTransaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        if (oTransaction && oTransaction.items && oTransaction.items.length > 0)
        {
            oTransaction.pause();
            var enable = oTransaction.items[0];
            empCesium.projectionEnableFlat(enable);
        }
    };
    engineInterface.settings.mil2525.icon.labels.set = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var iconLabelArray,
                newIconLabelSettings = [],
                singlePointKey, drawCountryCodeChanged = false,
                i;

        try
        {
            //empCesium.entityCollection.suspendEvents();
            // Check to make sure the transaction is good.
            if (transaction && transaction.items)
            {
                // Retrieve the array of labels that are turned on from the
                // transaction.
                iconLabelArray = transaction.items[0];
                if (iconLabelArray && iconLabelArray.length <= 6)
                {
                    empCesium.iconLabelOption = "none";
                }
                else if (iconLabelArray && iconLabelArray.length <= 12)
                {
                    empCesium.iconLabelOption = "common";
                }
                else if (iconLabelArray && iconLabelArray.length > 12)
                {
                    empCesium.iconLabelOption = "all";
                }
                // Loop through the array of labels, and store in an
                // array.  Index it by the value of the label, so we can
                // do an easy lookup later.  Just set the value to true
                // so it equals something.
                for (i = 0; i < iconLabelArray.length; i += 1)
                {
                    newIconLabelSettings[iconLabelArray[i]] = true;
                }

                if (newIconLabelSettings && newIconLabelSettings.hasOwnProperty("CC"))
                {
                    drawCountryCodeChanged = empCesium.drawCountryCode === false;
                    empCesium.drawCountryCode = true;
                    armyc2.c2sd.renderer.utilities.RendererSettings.setDrawCountryCode(empCesium.drawCountryCode);
                }
                else
                {
                    drawCountryCodeChanged = empCesium.drawCountryCode === true;
                    empCesium.drawCountryCode = false;
                    armyc2.c2sd.renderer.utilities.RendererSettings.setDrawCountryCode(empCesium.drawCountryCode);
                }

                // Assign the class level variable.
                empCesium.iconLabels = newIconLabelSettings;
                //check altitude range mode before calling the throttlering. If icon label option is none
                //and the range mode is mid or high then there is no need to render because teh icons are already with no labels.
                if (empCesium.iconLabelOption === "none" && (empCesium.singlePointAltitudeRangeMode === EmpCesiumConstants.SinglePointAltitudeRangeMode.MID_RANGE ||
                        empCesium.singlePointAltitudeRangeMode === EmpCesiumConstants.SinglePointAltitudeRangeMode.HIGHEST_RANGE) && empCesium.enableRenderingOptimization && !drawCountryCodeChanged)
                {
                    // do nothing. single points already with no labels and CC enabling not changed
                    //console.log(empCesium.iconLabelOption);
                    // console.log(empCesium.singlePointAltitudeRangeMode);
                }
                else if ((empCesium.iconLabelOption === "common" || empCesium.iconLabelOption === "all") &&
                        (empCesium.singlePointAltitudeRangeMode === EmpCesiumConstants.SinglePointAltitudeRangeMode.MID_RANGE ||
                                empCesium.singlePointAltitudeRangeMode === EmpCesiumConstants.SinglePointAltitudeRangeMode.HIGHEST_RANGE) && empCesium.enableRenderingOptimization && !drawCountryCodeChanged)
                {
                    // do nothing. single points are at a range with no labels and CC enabling not changed
                    //console.log(empCesium.iconLabelOption);
                    //console.log(empCesium.singlePointAltitudeRangeMode);
                }
                else
                {
                    // Redraw all the symbols affected.
                    for (singlePointKey in empCesium.singlePointCollection)
                    {
                        if (!empCesium.isSinglePointIdOnHoldPresent(singlePointKey))
                        {
                            //empCesium.throttleMil2525IconLabelSet(empCesium.getSinglePoint(singlePointKey));
                            empCesium.throttleMil2525IconLabelSet(singlePointKey);
                        }
                    }
                }
                transaction.run();
            }
        }
        catch (e)
        {
        }
        //empCesium.entityCollection.resumeEvents();
    };
    engineInterface.settings.mil2525.icon.size.set = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var iconPixelSizeArray, singlePointKey;

        //empCesium.entityCollection.suspendEvents();
        try
        {
            // Make sure the transaction is good first.
            if (transaction && transaction.items)
            {
                // Retrieve the icon size from the transaction.
                // This will always come in an array.
                iconPixelSizeArray = transaction.items;
                // Make sure there is at least one item in the array.
                if (iconPixelSizeArray.length > 0)
                {
                    empCesium.iconPixelSize = iconPixelSizeArray[0];
                    // Now we need to change the size of all the exiting graphics.
                    // Redraw all the symbols affected.
                    for (singlePointKey in empCesium.singlePointCollection)
                    {
                        if (!empCesium.isSinglePointIdOnHoldPresent(singlePointKey))
                        {
                            empCesium.throttleMil2525IconSizeSet(singlePointKey);
                        }
                    }
                }
                transaction.run();
            }
        }
        catch (e)
        {
        }
        //empCesium.entityCollection.resumeEvents();
    };



//    engineInterface.backgroundBrightness  = function (transaction)
//    {
//        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
//
//        try
//        {
//            // Make sure the transaction is good first.
//            if (transaction && transaction.items)
//            {
//
//               empCesium.setBackgroundBrightness(50);
//                transaction.run();
//            }
//        }
//        catch (e)
//        {
//        }
//        //empCesium.entityCollection.resumeEvents();
//    };



    engineInterface.navigation = engineInterface.navigation || {};
    engineInterface.navigation.enable = function (transaction)
    {
        empCesium.cesiumRenderOptimizer.boundNotifyRepaintRequired();
        var enabled;

        if (transaction && transaction.items)
        {
            enabled = transaction.items[0];
            switch (enabled.lock)
            {
                case emp3.api.enums.MapMotionLockEnum.NO_MOTION:
                    empCesium.scene.screenSpaceCameraController.enableRotate = false;
                    empCesium.scene.screenSpaceCameraController.enableTranslate = false;
                    empCesium.scene.screenSpaceCameraController.enableZoom = false;
                    empCesium.scene.screenSpaceCameraController.enableTilt = false;
                    empCesium.scene.screenSpaceCameraController.enableLook = false;
                    empCesium.mapMotionLockEnum = emp3.api.enums.MapMotionLockEnum.NO_MOTION;
                    empCesium.viewer.cesiumNavigation.setNavigationLocked(true);
                    break;
                case emp3.api.enums.MapMotionLockEnum.UNLOCKED:
                    empCesium.scene.screenSpaceCameraController.enableRotate = true;
                    empCesium.scene.screenSpaceCameraController.enableTranslate = true;
                    empCesium.scene.screenSpaceCameraController.enableZoom = true;
                    empCesium.scene.screenSpaceCameraController.enableTilt = true;
                    empCesium.scene.screenSpaceCameraController.enableLook = true;
                    empCesium.mapMotionLockEnum = emp3.api.enums.MapMotionLockEnum.UNLOCKED;
                    empCesium.viewer.cesiumNavigation.setNavigationLocked(false);
                    break;
                case emp3.api.enums.MapMotionLockEnum.NO_PAN:
                    break;
                case emp3.api.enums.MapMotionLockEnum.NO_ZOOM:
                    break;
                case emp3.api.enums.MapMotionLockEnum.NO_ZOOM_NO_PAN:
                    break;
                case emp3.api.enums.MapMotionLockEnum.SMART_MOTION:
                    break;
                default:
                    // Default to enabling mouse navigation to avoid an error state where user cannot interact with the map
                    empCesium.scene.screenSpaceCameraController.enableRotate = true;
                    empCesium.scene.screenSpaceCameraController.enableTranslate = true;
                    empCesium.scene.screenSpaceCameraController.enableZoom = true;
                    empCesium.scene.screenSpaceCameraController.enableTilt = true;
                    empCesium.scene.screenSpaceCameraController.enableLook = true;
                    empCesium.mapMotionLockEnum = emp3.api.enums.MapMotionLockEnum.UNLOCKED;
                    empCesium.viewer.cesiumNavigation.setNavigationLocked(false);
                    break;

                }//switch
            }//  if (transaction && transaction.items)
    };


    if (engineInterface.map)
    {
        engineInterface.map.config = function (transaction)
        {
            var bRangeChanged = false,
                    bSelectionStyleChanged = false;
            try
            {
                if (transaction && transaction.items)
                {
                    // Retrieve the array of labels that are turned on from the
                    // transaction.
                    var config = transaction.items[0];
                    if (empCesium.defined(config.renderingOptimization) && (config.renderingOptimization !== empCesium.enableRenderingOptimization))
                    {
                        bRangeChanged = true;
                        empCesium.enableRenderingOptimization = config.renderingOptimization;
                    }
                    if (empCesium.defined(config.midDistanceThreshold) && (config.midDistanceThreshold !== empCesium.singlePointAltitudeRanges.mid))
                    {
                        bRangeChanged = true;
                        empCesium.singlePointAltitudeRanges.mid = config.midDistanceThreshold;
                    }
                    if (empCesium.defined(config.farDistanceThreshold) && (config.farDistanceThreshold !== empCesium.singlePointAltitudeRanges.high))
                    {
                        bRangeChanged = true;
                        empCesium.singlePointAltitudeRanges.high = config.farDistanceThreshold;
                        //empCesium.singlePointAltitudeRangeMode = cesiumEngine.utils.getSinglePointAltitudeRangeMode(empCesium.cameraAltitude, empCesium.singlePointAltitudeRanges);
                        //empCesium.processOnRangeChangeSinglePoints();
                    }
                    if (bRangeChanged)
                    {
                        empCesium.singlePointAltitudeRangeMode = cesiumEngine.utils.getSinglePointAltitudeRangeMode(empCesium.cameraAltitude, empCesium.singlePointAltitudeRanges);
                        empCesium.processOnRangeChangeSinglePoints();
                    }
                    if (empCesium.defined(config.selectionColor))
                    {
                        var selectionColorHex = config.selectionColor;
                        // add opacity FF to hex if not present
                        selectionColorHex = (selectionColorHex.length === 6) ? "FF" + selectionColorHex.toUpperCase() : selectionColorHex.toUpperCase();
                        bSelectionStyleChanged = (empCesium.selectionColorHex.toUpperCase() !== selectionColorHex.toUpperCase()) ? true : bSelectionStyleChanged;
                        empCesium.selectionColorHex = selectionColorHex;
                        var rgbaSelectionColor = cesiumEngine.utils.hexToRGB(empCesium.selectionColorHex);
                        empCesium.selectionColor = new empCesium.Color(rgbaSelectionColor.r, rgbaSelectionColor.g, rgbaSelectionColor.b, rgbaSelectionColor.a);
                    }
                    if (empCesium.defined(config.selectionScale))
                    {
                        var scale = parseFloat(config.selectionScale);
                        bSelectionStyleChanged = (empCesium.selectionScale !== parseFloat(scale)) ? true : bSelectionStyleChanged;
                        empCesium.selectionScale = scale;
                    }

                    if (bSelectionStyleChanged)
                    {
                         empCesium.updateSelections();
                    }

                    if (empCesium.defined(config.brightness))
                    {
                        empCesium.setBackgroundBrightness(config.brightness);
                    }



                    transaction.run();
                }
            }
            catch (e)
            {
            }
        };
    }

    // return the engineInterface object as a new engineTemplate instance
    return engineInterface;
};
