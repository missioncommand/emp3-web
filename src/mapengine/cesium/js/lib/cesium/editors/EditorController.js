/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global emp */

/**
 * Allows the user to put the map into a "draw mode" to draw a line.
 * After calling this function, the next click events will begin creating
 * a line.  After the user double-clicks the map then goes back into
 * the regular viewing mode, and a line is added onto the overlay.
 */
function EditorController(empCesium)
{
    this.drawLine = function (item)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        overlay = empCesium.getLayer(item.overlayId),
                id = item.coreId;
        empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, overlay, "drawing_" + id);
        //empCesium.drawData.id = id;
        //empCesium.drawData.item = item;
        //empCesium.drawData.overlayId = item.overlayId;

        empCesium.drawData.geometryType = "LineString";
        // empCesium.drawData.properties = item.properties;
        //empCesium.drawData.coordinates = item.coordinates;

        var callbacks = {};
        callbacks.dragHandlers = {};
        callbacks.onDrawEnd = function (data)
        {
            empCesium.drawData.coordinates = data.positions;
            empCesium.mapEngineExposed.addCompleteDrawing();
        };
        callbacks.onDrawUpdate = function (data)
        {
            empCesium.drawData.coordinates = data.positions;
            var oCoordinates = data.positions;
            var oGeoJsonCoord = {
                type: empCesium.drawData.geometryType,
                coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: empCesium.drawData.geometryType, coordinates: oCoordinates})
            };
            var format = emp.typeLibrary.featureFormatType.GEOJSON; // deafult format
            if (empCesium.drawData.item.plotFeature && empCesium.drawData.item.plotFeature.format)
            {
                format = empCesium.drawData.item.plotFeature.format;
            }
            var oProperties = emp.helpers.copyObject(empCesium.drawData.properties);
            var oModifiers = oProperties.modifiers;
            //var oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers);
            var oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                indices: data.indices
            });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oCoordinates;
            empCesium.drawData.properties = oProperties;
            if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
            {
                empCesium.drawData.properties.modifiers = {};
            }
            if (empCesium.drawData.isDrawing)
            {
                oGeoJsonCoord.symbolCode = empCesium.drawData.item.symbolCode;
                empCesium.drawData.item.update({
                    name: empCesium.drawData.item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                    plotFeature: new emp.typeLibrary.Feature({
                        featureId: empCesium.drawData.item.featureId,
                        coreId: empCesium.drawData.item.coreId,
                        overlayId: empCesium.drawData.item.overlayId,
                        parentId: empCesium.drawData.item.parentId,
                        format: format,
                        data: oGeoJsonCoord,
                        menuId: empCesium.drawData.item.menuId,
                        name: empCesium.drawData.item.name,
                        properties: oProperties
                    })
                });
            }
            else
            {
                item.update({
                    name: empCesium.drawData.item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
        };
        callbacks.onDrawStart = function (data)
        {
            empCesium.drawData.coordinates = data.positions;
            var oGeoJsonCoord = {
                type: empCesium.drawData.geometryType,
                coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: empCesium.drawData.geometryType, coordinates: data.positions})
            },
            oProperties = emp.helpers.copyObject(empCesium.drawData.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: data.indices
                    });
            var format = emp.typeLibrary.featureFormatType.GEOJSON; // deafult format
            if (empCesium.drawData.item.plotFeature && empCesium.drawData.item.plotFeature.format)
            {
                format = empCesium.drawData.item.plotFeature.format;
            }

            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            item.update({
                name: item.name,
                updates: oUpdateData,
                properties: oProperties,
                updateEventType: emp.typeLibrary.UpdateEventType.START,
                mapInstanceId: empCesium.empMapInstance.mapInstanceId
            });
        };
        callbacks.dragHandlers.onDrag = function (data)
        {
            empCesium.drawData.coordinates = data.positions;
        };
        callbacks.dragHandlers.onDragEnd = function (data)
        {
            empCesium.drawData.coordinates = data.positions;
        };
        empCesium.drawHelper.startDrawingPolyline({
            callbacks: callbacks,
            id: "drawing_" + item.coreId,
            coreId: item.coreId,
            featureId: item.featureId,
            overlayId: item.overlayId
        });
        return result;
    };
    /**
     * Allows the user to put the map into a "draw mode" to draw a polygon.
     * After calling this function, the next click events will begin creating
     * a polygon.  After the user double-clicks the map then goes back into
     * the regular viewing mode, and a polygon is added onto the overlay.
     */
    this.drawPolygon = function (item)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        overlay = empCesium.getLayer(item.overlayId),
                id = item.coreId;
        empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, overlay, "drawing_" + id);
        //empCesium.drawData.id = id;
        //empCesium.drawData.overlayId = item.overlayId;
        // empCesium.drawData.properties = item.properties;
        if (item.type && (item.type === "milstd" || item.type === "symbol"))
        {
            empCesium.drawData.geometryType = "LineString";
        }
        else
        {
            empCesium.drawData.geometryType = "Polygon";
        }
        empCesium.drawData.properties = item.properties;
        var callbacks = {};
        callbacks.dragHandlers = {};
        callbacks.onDrawEnd = function (data)
        {
            empCesium.drawData.coordinates = data.positions;
            empCesium.mapEngineExposed.addCompleteDrawing();
        };
        callbacks.onDrawUpdate = function (data)
        {
            empCesium.drawData.coordinates = data.positions;
            var oCoordinates = data.positions;
            var oGeoJsonCoord = {
                type: empCesium.drawData.geometryType,
                coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: empCesium.drawData.geometryType, coordinates: oCoordinates})
            };
            var format = emp.typeLibrary.featureFormatType.GEOJSON; // deafult format
            if (empCesium.drawData.item.plotFeature && empCesium.drawData.item.plotFeature.format)
            {
                format = empCesium.drawData.item.plotFeature.format;
            }
            var oProperties = emp.helpers.copyObject(empCesium.drawData.properties);
            var oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers);
            var oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                indices: data.indices
            });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oCoordinates;
            empCesium.drawData.properties = oProperties;
            if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
            {
                empCesium.drawData.properties.modifiers = {};
            }
            if (empCesium.drawData.isDrawing)
            {
                oGeoJsonCoord.symbolCode = empCesium.drawData.item.symbolCode;
                empCesium.drawData.item.update({
                    name: empCesium.drawData.item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                    plotFeature: new emp.typeLibrary.Feature({
                        featureId: empCesium.drawData.item.featureId,
                        coreId: empCesium.drawData.item.coreId,
                        overlayId: empCesium.drawData.item.overlayId,
                        parentId: empCesium.drawData.item.parentId,
                        format: format,
                        data: oGeoJsonCoord,
                        menuId: empCesium.drawData.item.menuId,
                        name: empCesium.drawData.item.name,
                        properties: oProperties
                    })
                });
            }
            else
            {
                item.update({
                    name: empCesium.drawData.item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
        };
        callbacks.onDrawStart = function (data)
        {
            empCesium.drawData.coordinates = data.positions;
            empCesium.drawData.coordinates = data.positions;
            var oGeoJsonCoord = {
                type: empCesium.drawData.geometryType,
                coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: empCesium.drawData.geometryType, coordinates: data.positions})
            },
            oProperties = emp.helpers.copyObject(empCesium.drawData.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: data.indices
                    });
            var format = emp.typeLibrary.featureFormatType.GEOJSON; // deafult format
            if (empCesium.drawData.item.plotFeature && empCesium.drawData.item.plotFeature.format)
            {
                format = empCesium.drawData.item.plotFeature.format;
            }

            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            item.update({
                name: item.name,
                updates: oUpdateData,
                properties: oProperties,
                updateEventType: emp.typeLibrary.UpdateEventType.START,
                mapInstanceId: empCesium.empMapInstance.mapInstanceId
            });
        };
        callbacks.dragHandlers.onDrag = function (data)
        {
            empCesium.drawData.coordinates = data.positions;
        };
        callbacks.dragHandlers.onDragEnd = function (data)
        {
            empCesium.drawData.coordinates = data.positions;
        };
        empCesium.drawHelper.startDrawingPolygon({
            callbacks: callbacks,
            id: "drawing_" + item.coreId,
            coreId: item.coreId,
            featureId: item.featureId,
            overlayId: item.overlayId
        });
        return result;
    };
    /**
     * Allows the user to put the map into a "draw mode" to draw a line.
     * After calling this function, the next click events will begin creating
     * a line.  After the user double-clicks the map then goes back into
     * the regular viewing mode, and a line is added onto the overlay.
     */
    this.drawCategoryRectangleParameteredAutoShape = function (item)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        overlay = empCesium.getLayer(item.overlayId),
                id = item.coreId,
                transaction = empCesium.drawData.transaction;
        if (empCesium.drawHelper)
        {
            empCesium.drawHelper.destroy();
            empCesium.drawHelper = undefined;
        }
        empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, overlay, "drawing_" + item.coreId || item.id);
        //empCesium.drawData.id = id;
        //empCesium.drawData.overlayId = item.overlayId;
        empCesium.drawData.geometryType = "Point";
        // empCesium.drawData.properties = {};
        var callbacks = {};
        callbacks.dragHandlers = {};
        empCesium.drawData.properties = item.properties;
        callbacks.onDrawEnd = function (data)
        {
            var oProperties = data.properties,
                    oCoordinates = data.positions,
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(data.properties.modifiers),
                    oGeoJsonCoord = {
                        type: 'Point',
                        coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "Point", coordinates: data.positions})
                    };
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oCoordinates;
            empCesium.drawData.properties = oProperties;
            if (empCesium.drawData.isDrawing)
            {
                if (cesiumEngine.utils.isEmpPrimitive(item.type))
                {
                    var oConvertedProperties = cesiumEngine.utils.convertMilStandardPropertiesToEmpPrimitiveProperties(oProperties, item.type);
                    var convertedToEmpPrimitiveItem = emp.helpers.copyObject(item);
                    item.plotFeature.properties = oConvertedProperties;
                }
                else
                {
                    item.plotFeature.properties = data.properties;
                }
                empCesium.mapEngineExposed.addCompleteDrawing();
            }
            else
            {
                empCesium.drawData.coordinates = oCoordinates;
                if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
                {
                    empCesium.drawData.properties.modifiers = {};
                }
                empCesium.drawData.properties.modifiers.azimuth = oModifiers.azimuth;
                empCesium.drawData.properties.modifiers.distance = oModifiers.distance;
                empCesium.editorController.stopEditFeature();
                var oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                    type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                    indices: data.indices
                });
                oUpdateData.convertFromGeoJson(oGeoJsonCoord);
                if (cesiumEngine.utils.isEmpPrimitive(item.originFeature.format))
                {
                    var oConvertedProperties = cesiumEngine.utils.convertMilStandardPropertiesToEmpPrimitiveProperties(oProperties, item.originFeature.format);
                    var convertedToEmpPrimitiveItem = emp.helpers.copyObject(item);
                    convertedToEmpPrimitiveItem.update = item.update;
                    convertedToEmpPrimitiveItem.properties = oConvertedProperties;
                    convertedToEmpPrimitiveItem.symbolCode = undefined;
                    if (empCesium.defined(convertedToEmpPrimitiveItem.originFeature))
                    {
                        convertedToEmpPrimitiveItem.originFeature.data.symbolCode = undefined;
                    }
                    convertedToEmpPrimitiveItem.update({
                        name: convertedToEmpPrimitiveItem.name,
                        updates: oUpdateData,
                        properties: oConvertedProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
                else
                {
                    item.update({
                        name: item.name,
                        updates: oUpdateData,
                        properties: oProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.COMPLETE,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
                if (empCesium.drawData.editingFeature)
                {
                    var milstdObject = empCesium.multiPointCollection[empCesium.drawData.editingFeature.id];
                    milstdObject.coordinates = oGeoJsonCoord.coordinates;
                    milstdObject.properties = oProperties;
                    milstdObject.data.coordinates = oGeoJsonCoord.coordinates;
                    empCesium.addSymbolMulti([milstdObject]);
                    empCesium.drawData.editingFeature.rectangle.show = new empCesium.ConstantProperty(true);
                }
                new empCesium.empMapInstance.eventing.EditEnd({
                    transaction: empCesium.drawData.transaction
                });
                transaction.run();
            }
        };
        callbacks.onDrawUpdate = function (data)
        {
            var oCoordinates = data.positions,
                    oGeoJsonCoord = {
                        type: 'Point',
                        coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "Point", coordinates: data.positions})
                    },
            oProperties = emp.helpers.copyObject(data.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: data.indices
                    });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oCoordinates;
            empCesium.drawData.properties = oProperties;
            if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
            {
                empCesium.drawData.properties.modifiers = {};
            }
            empCesium.drawData.properties.modifiers.azimuth = oModifiers.azimuth;
            empCesium.drawData.properties.modifiers.distance = oModifiers.distance;
            if (empCesium.drawData.isDrawing)
            {
                if (cesiumEngine.utils.isEmpPrimitive(item.type))
                {
                    var oConvertedProperties = cesiumEngine.utils.convertMilStandardPropertiesToEmpPrimitiveProperties(oProperties, item.type);
                    var convertedToEmpPrimitiveItem = emp.helpers.copyObject(item);
                    oGeoJsonCoord.symbolCode = convertedToEmpPrimitiveItem.symbolCode;
                    item.update({
                        name: convertedToEmpPrimitiveItem.name,
                        updates: oUpdateData,
                        properties: oConvertedProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                        plotFeature: new emp.typeLibrary.Feature({
                            featureId: convertedToEmpPrimitiveItem.featureId,
                            overlayId: convertedToEmpPrimitiveItem.overlayId,
                            parentId: convertedToEmpPrimitiveItem.parentId,
                            coreId: empCesium.drawData.item.coreId,
                            format: convertedToEmpPrimitiveItem.format,
                            data: oGeoJsonCoord,
                            menuId: convertedToEmpPrimitiveItem.menuId,
                            name: convertedToEmpPrimitiveItem.name,
                            properties: oConvertedProperties
                        })
                    });
                }
                else
                {
                    oGeoJsonCoord.symbolCode = item.symbolCode;
                    item.update({
                        name: item.name,
                        updates: oUpdateData,
                        properties: oProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                        plotFeature: new emp.typeLibrary.Feature({
                            featureId: item.featureId,
                            overlayId: item.overlayId,
                            parentId: item.parentId,
                            coreId: empCesium.drawData.item.coreId,
                            format: emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL,
                            data: oGeoJsonCoord,
                            menuId: item.menuId,
                            name: item.name,
                            properties: oProperties
                        })
                    });
                }
            }
            else
            {
                if (cesiumEngine.utils.isEmpPrimitive(item.originFeature.format))
                {
                    var oConvertedProperties = cesiumEngine.utils.convertMilStandardPropertiesToEmpPrimitiveProperties(oProperties, item.originFeature.format);
                    var convertedToEmpPrimitiveItem = emp.helpers.copyObject(item);
                    convertedToEmpPrimitiveItem.update = item.update;
                    convertedToEmpPrimitiveItem.properties = oConvertedProperties;
                    convertedToEmpPrimitiveItem.symbolCode = undefined;
                    if (empCesium.defined(convertedToEmpPrimitiveItem.originFeature))
                    {
                        convertedToEmpPrimitiveItem.originFeature.data.symbolCode = undefined;
                    }
                    convertedToEmpPrimitiveItem.update({
                        name: convertedToEmpPrimitiveItem.name,
                        updates: oUpdateData,
                        properties: oConvertedProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
                else
                {
                    item.update({
                        name: item.name,
                        updates: oUpdateData,
                        properties: oProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
            }
        };
        callbacks.onDrawStart = function (data)
        {
            var oGeoJsonCoord = {
                type: 'Point',
                coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "LineString", coordinates: data.positions})
            },
            oProperties = emp.helpers.copyObject(data.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: data.indices
                    });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            if (empCesium.drawData.isDrawing)
            {
                if (cesiumEngine.utils.isEmpPrimitive(item.type))
                {
                    var oConvertedProperties = cesiumEngine.utils.convertMilStandardPropertiesToEmpPrimitiveProperties(oProperties, item.type);
                    var convertedToEmpPrimitiveItem = emp.helpers.copyObject(item);
                    item.update({
                        name: convertedToEmpPrimitiveItem.name,
                        updates: oUpdateData,
                        properties: oConvertedProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.START,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
                else
                {
                    item.update({
                        name: item.name,
                        updates: oUpdateData,
                        properties: oProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.START,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
            }
            else
            {
                if (cesiumEngine.utils.isEmpPrimitive(item.originFeature.format))
                {
                    var oConvertedProperties = cesiumEngine.utils.convertMilStandardPropertiesToEmpPrimitiveProperties(oProperties, item.originFeature.format);
                    var convertedToEmpPrimitiveItem = emp.helpers.copyObject(item);
                    convertedToEmpPrimitiveItem.update = item.update;
                    convertedToEmpPrimitiveItem.properties = oConvertedProperties;
                    convertedToEmpPrimitiveItem.symbolCode = undefined;
                    if (empCesium.defined(convertedToEmpPrimitiveItem.originFeature))
                    {
                        convertedToEmpPrimitiveItem.originFeature.data.symbolCode = undefined;
                    }
                    convertedToEmpPrimitiveItem.update({
                        name: convertedToEmpPrimitiveItem.name,
                        updates: oUpdateData,
                        properties: oConvertedProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.START,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
                else
                {
                    item.update({
                        name: item.name,
                        updates: oUpdateData,
                        properties: oProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.START,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
            }
        };
        if (empCesium.drawData.editingFeature && empCesium.drawData.editingFeature.rectangle)
        {
            empCesium.drawData.editingFeature.rectangle.show = new empCesium.ConstantProperty(false);
        }
        else if (empCesium.drawData.editingFeature && empCesium.drawData.editingFeature.ellipse)
        {
            empCesium.drawData.editingFeature.ellipse.show = new empCesium.ConstantProperty(false);
        }
        callbacks.dragHandlers.onDrag = function (update)
        {
            empCesium.drawData.coordinates = update.positions;
            empCesium.drawData.properties.modifiers.azimuth = [Cesium.Math.toDegrees(update.azimuth)];
            empCesium.drawData.properties.modifiers.distance = [update.height, update.width];
            //empCesium.drawData.properties.modifiers.distance = [update.width, update.height];
        };
        callbacks.dragHandlers.onDragEnd = function (update)
        {
            empCesium.drawData.coordinates = update.positions;
            empCesium.drawData.properties.modifiers.azimuth = [Cesium.Math.toDegrees(update.azimuth)];
            empCesium.drawData.properties.modifiers.distance = [update.height, update.width];
            //empCesium.drawData.properties.modifiers.distance = [update.width, update.height];
        };
        empCesium.drawHelper.startDrawingCategoryRectangleParameteredAutoShape({
            callbacks: callbacks,
            id: "drawing_id" + (item.id || item.coreId),
            item: item,
            coreId: item.coreId,
            featureId: item.featureId,
            overlayId: item.overlayId
        });
        return result;
    };
    /**
     * Allows the user to put the map into a "draw mode" to draw a line.
     * After calling this function, the next click events will begin creating
     * a line.  After the user double-clicks the map then goes back into
     * the regular viewing mode, and a line is added onto the overlay.
     */
    this.drawCategoryTwoPointRectangleParameteredAutoShape = function (item)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        overlay = empCesium.getLayer(item.overlayId),
                id = item.coreId,
                transaction = empCesium.drawData.transaction;
        if (empCesium.drawHelper)
        {
            empCesium.drawHelper.destroy();
            empCesium.drawHelper = undefined;
        }
        empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, overlay, "drawing_" + item.coreId || item.id);
        var callbacks = {};
        callbacks.dragHandlers = {};
        empCesium.drawData.geometryType = "LineString";
        callbacks.onDrawEnd = function (data)
        {
            var oProperties = data.properties,
                    oCoordinates = data.positions,
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(data.properties.modifiers),
                    oGeoJsonCoord = {
                        type: 'LineString',
                        coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "LineString", coordinates: data.positions})
                    };
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oCoordinates;
            empCesium.drawData.properties = oProperties;
            if (empCesium.drawData.isDrawing)
            {
                item.plotFeature.properties = data.properties;
                empCesium.mapEngineExposed.addCompleteDrawing();
            }
            else
            {
                empCesium.drawData.coordinates = oCoordinates;
                if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
                {
                    empCesium.drawData.properties.modifiers = {};
                }
                empCesium.drawData.properties.modifiers.distance = oModifiers.distance;
                empCesium.editorController.stopEditFeature()
                var oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                    type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                    indices: data.indices
                });
                oUpdateData.convertFromGeoJson(oGeoJsonCoord);
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.COMPLETE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
                if (empCesium.drawData.editingFeature)
                {
                    var milstdObject = empCesium.multiPointCollection[empCesium.drawData.editingFeature.id];
                    milstdObject.coordinates = oGeoJsonCoord.coordinates;
                    milstdObject.properties = oProperties;
                    milstdObject.data.coordinates = oGeoJsonCoord.coordinates;
                    empCesium.addSymbolMulti([milstdObject]);
                    empCesium.drawData.editingFeature.rectangle.show = new empCesium.ConstantProperty(true);
                }
                new empCesium.empMapInstance.eventing.EditEnd({
                    transaction: empCesium.drawData.transaction
                });
                transaction.run();
            }
        };
        callbacks.onDrawUpdate = function (data)
        {
            var oCoordinates = data.positions,
                    oGeoJsonCoord = {
                        type: 'LineString',
                        coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "LineString", coordinates: data.data})
                    },
            oProperties = emp.helpers.copyObject(data.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: data.indices
                    });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oCoordinates;
            if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
            {
                empCesium.drawData.properties.modifiers = {};
            }
            empCesium.drawData.properties = oProperties;
            empCesium.drawData.properties.modifiers.distance = oModifiers.distance;
            if (empCesium.drawData.isDrawing)
            {
                oGeoJsonCoord.symbolCode = item.symbolCode;
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                    plotFeature: new emp.typeLibrary.Feature({
                        featureId: item.featureId,
                        overlayId: item.overlayId,
                        parentId: item.parentId,
                        coreId: empCesium.drawData.item.coreId,
                        format: emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL,
                        data: oGeoJsonCoord,
                        menuId: item.menuId,
                        name: item.name,
                        properties: oProperties
                    })
                });
            }
            else
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
        };
        callbacks.onDrawStart = function (data)
        {
            var oGeoJsonCoord = {
                type: 'LineString',
                coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "LineString", coordinates: data.positions})
            },
            oProperties = emp.helpers.copyObject(data.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: data.indices
                    }),
                    oCoordinates = data.positions;
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oCoordinates;
            empCesium.drawData.properties = oProperties;
            if (empCesium.drawData.isDrawing)
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.START,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
            else
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.START,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
        };
        if (empCesium.drawData.editingFeature)
        {
            empCesium.drawData.editingFeature.rectangle.show = new empCesium.ConstantProperty(false);
        }
//        callbacks.dragHandlers.onDrag = function (update)
//        {
//            empCesium.drawData.coordinates = update.positions;
//            empCesium.drawData.properties.modifiers.azimuth = [Cesium.Math.toDegrees(update.azimuth)];
//            empCesium.drawData.properties.modifiers.distance = [update.width, update.height];
//        };
//        callbacks.dragHandlers.onDragEnd = function (update)
//        {
//            empCesium.drawData.coordinates = update.positions;
//            empCesium.drawData.properties.modifiers.azimuth = [Cesium.Math.toDegrees(update.azimuth)];
//            empCesium.drawData.properties.modifiers.distance = [update.width, update.height];
//        };
        empCesium.drawHelper.startDrawingCategoryTwoPointRectangleParameteredAutoShape({
            callbacks: callbacks,
            id: "drawing_id" + (item.id || item.coreId),
            coreId: item.coreId,
            featureId: item.featureId,
            overlayId: item.overlayId,
            item: item
        });
        return result;
    };
    this.drawCategoryTwoPointLine = function (item)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        overlay = empCesium.getLayer(item.overlayId),
                id = item.coreId,
                transaction = empCesium.drawData.transaction;
        if (empCesium.drawHelper)
        {
            empCesium.drawHelper.destroy();
            empCesium.drawHelper = undefined;
        }
        empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, overlay, "drawing_" + item.coreId || item.id);
        if (empCesium.drawData.symbolDef.maxPoints === 1)
        {
            empCesium.drawData.geometryType = "Point";
        }
        else
        {
            empCesium.drawData.geometryType = "LineString";
        }
        var callbacks = {};
        callbacks.dragHandlers = {};
        //empCesium.drawData.properties = item.properties;
        callbacks.onDrawEnd = function (data)
        {
            var oProperties = data.properties,
                    oCoordinates,
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(data.properties.modifiers),
                    geojsonDegrees = [],
                    oGeoJsonCoord;
            if (empCesium.drawData.drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE)
            {
                // the editor is sending a coordinates but for this draw category only the first coordinate is used First coordinate represents the center of circle.
                if (data.positions.length > 0)
                {
                    //The utility is expecting an array.
                    oCoordinates = data.positions[0];
                    geojsonDegrees = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "LineString", coordinates: [data.positions[0]]});
                }
            }
            else
            {
                oCoordinates = data.positions;
                geojsonDegrees = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "LineString", coordinates: oCoordinates});
            }
            oGeoJsonCoord = {
                type: 'LineString',
                coordinates: geojsonDegrees
            };
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oCoordinates;
            empCesium.drawData.properties = oProperties;
            if (empCesium.drawData.isDrawing)
            {
                if (cesiumEngine.utils.isEmpPrimitive(item.type))
                {
                    var oConvertedProperties = cesiumEngine.utils.convertMilStandardPropertiesToEmpPrimitiveProperties(oProperties, item.type);
                    var convertedToEmpPrimitiveItem = emp.helpers.copyObject(item);
                    item.plotFeature.properties = oConvertedProperties;
                }
                else
                {
                    item.plotFeature.properties = data.properties;
                }
                empCesium.mapEngineExposed.addCompleteDrawing();
            }
            else
            {
                empCesium.drawData.coordinates = oCoordinates;
                if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
                {
                    empCesium.drawData.properties.modifiers = {};
                }
                empCesium.editorController.stopEditFeature();
                var oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                    type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                    indices: data.indices
                });
                oUpdateData.convertFromGeoJson(oGeoJsonCoord);
                if (cesiumEngine.utils.isEmpPrimitive(item.originFeature.format))
                {
                    var oConvertedProperties = cesiumEngine.utils.convertMilStandardPropertiesToEmpPrimitiveProperties(oProperties, item.format);
                    var convertedToEmpPrimitiveItem = emp.helpers.copyObject(item);
                    convertedToEmpPrimitiveItem.update({
                        name: convertedToEmpPrimitiveItem.name,
                        updates: oUpdateData,
                        properties: oConvertedProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.COMPLETE,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
                else
                {
                    item.update({
                        name: item.name,
                        updates: oUpdateData,
                        properties: oProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.COMPLETE,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
                if (empCesium.drawData.editingFeature)
                {
                    var milstdObject = empCesium.multiPointCollection[empCesium.drawData.editingFeature.id];
                    milstdObject.coordinates = oGeoJsonCoord.coordinates;
                    milstdObject.properties = oProperties;
                    milstdObject.data.coordinates = oGeoJsonCoord.coordinates;
                    empCesium.addSymbolMulti([milstdObject]);
                    empCesium.drawData.editingFeature.rectangle.show = new empCesium.ConstantProperty(true);
                }
                transaction.run();
            }
        };
        callbacks.onDrawUpdate = function (data)
        {
            var oCoordinates,
                    geojsonDegrees = [],
                    oProperties,
                    oModifiers,
                    oUpdateData,
                    oGeoJsonCoord;
            if (empCesium.drawData.drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE)
            {
                // the editor is sending a coordinates but for this draw category only the first coordinate is used First coordinate represents the center of circle.
                if (data.positions.length > 0)
                {
                    //The utility is expecting an array.
                    oCoordinates = data.positions[0];
                    geojsonDegrees = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "LineString", coordinates: [data.positions[0]]});
                }
            }
            else
            {
                oCoordinates = data.positions;
                geojsonDegrees = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "LineString", coordinates: oCoordinates});
            }

            oGeoJsonCoord = {
                type: 'LineString',
                coordinates: geojsonDegrees //     [data.coordinate.longitude.toDeg(), data.coordinate.latitude.toDeg()]
            },
            oProperties = emp.helpers.copyObject(data.properties);
            oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers);
            oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                indices: data.indices
            });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oCoordinates;
            if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
            {
                empCesium.drawData.properties.modifiers = {};
            }
            empCesium.drawData.properties = oProperties;
            if (empCesium.drawData.isDrawing)
            {
                if (cesiumEngine.utils.isEmpPrimitive(item.type))
                {
                    var oConvertedProperties = cesiumEngine.utils.convertMilStandardPropertiesToEmpPrimitiveProperties(oProperties, item.type);
                    var convertedToEmpPrimitiveItem = emp.helpers.copyObject(item);
                    oGeoJsonCoord.symbolCode = undefined;
                    item.update({
                        name: convertedToEmpPrimitiveItem.name,
                        updates: oUpdateData,
                        properties: oConvertedProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                        plotFeature: new emp.typeLibrary.Feature({
                            featureId: convertedToEmpPrimitiveItem.featureId,
                            overlayId: convertedToEmpPrimitiveItem.overlayId,
                            parentId: convertedToEmpPrimitiveItem.parentId,
                            coreId: empCesium.drawData.item.coreId,
                            format: convertedToEmpPrimitiveItem.format,
                            data: oGeoJsonCoord,
                            menuId: convertedToEmpPrimitiveItem.menuId,
                            name: convertedToEmpPrimitiveItem.name
                        })
                    });
                }
                else
                {
                    oGeoJsonCoord.symbolCode = item.symbolCode;
                    item.update({
                        name: item.name,
                        updates: oUpdateData,
                        properties: oConvertedProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                        plotFeature: new emp.typeLibrary.Feature({
                            featureId: item.featureId,
                            overlayId: item.overlayId,
                            parentId: item.parentId,
                            coreId: empCesium.drawData.item.coreId,
                            format: item.format,
                            data: oGeoJsonCoord,
                            menuId: item.menuId,
                            name: item.name
                        })
                    });
                }
            }
            else
            {
                if (cesiumEngine.utils.isEmpPrimitive(item.originFeature.format))
                {
                    var oConvertedProperties = cesiumEngine.utils.convertMilStandardPropertiesToEmpPrimitiveProperties(oProperties, item.originFeature.format);
                    var convertedToEmpPrimitiveItem = emp.helpers.copyObject(item);
                    convertedToEmpPrimitiveItem.update = item.update;
                    convertedToEmpPrimitiveItem.properties = oConvertedProperties;
                    convertedToEmpPrimitiveItem.symbolCode = undefined;
                    if (empCesium.defined(convertedToEmpPrimitiveItem.originFeature))
                    {
                        convertedToEmpPrimitiveItem.originFeature.data.symbolCode = undefined;
                    }
                    convertedToEmpPrimitiveItem.update({
                        name: convertedToEmpPrimitiveItem.name,
                        updates: oUpdateData,
                        properties: oConvertedProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
                else
                {
                    item.update({
                        name: item.name,
                        updates: oUpdateData,
                        properties: oProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
            }
        };
        callbacks.onDrawStart = function (data)
        {
            var oCoordinates,
                    geojsonDegrees,
                    oGeoJsonCoord,
                    oProperties,
                    oUpdateData,
                    oModifiers;
            if (empCesium.drawData.drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE)
            {
                // the editor is sending a coordinates but for this draw category only the first coordinate is used First coordinate represents the center of circle.
                if (data.positions.length > 0)
                {
                    //The utility is expecting an array.
                    oCoordinates = [data.positions[0]];
                    geojsonDegrees = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "LineString", coordinates: oCoordinates});
                }
            }
            else
            {
                oCoordinates = data.positions;
                geojsonDegrees = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "LineString", coordinates: oCoordinates});
            }

            oGeoJsonCoord = {
                type: 'LineString',
                coordinates: geojsonDegrees
            },
            oProperties = emp.helpers.copyObject(data.properties);
            oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers);
            oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                indices: data.indices
            });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            if (empCesium.drawData.isDrawing)
            {
                if (cesiumEngine.utils.isEmpPrimitive(item.format))
                {
                    var oConvertedProperties = cesiumEngine.utils.convertMilStandardPropertiesToEmpPrimitiveProperties(oProperties, item.format);
                    var convertedToEmpPrimitiveItem = emp.helpers.copyObject(item);
                    convertedToEmpPrimitiveItem.update({
                        name: convertedToEmpPrimitiveItem.name,
                        updates: oUpdateData,
                        properties: oConvertedProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.START,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
                else
                {
                    item.update({
                        name: item.name,
                        updates: oUpdateData,
                        properties: oProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.START,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
            }
            else
            {
                if (cesiumEngine.utils.isEmpPrimitive(item.originFeature.format))
                {
                    var oConvertedProperties = cesiumEngine.utils.convertMilStandardPropertiesToEmpPrimitiveProperties(oProperties, item.originFeature.format);
                    var convertedToEmpPrimitiveItem = emp.helpers.copyObject(item);
                    item.update({
                        name: convertedToEmpPrimitiveItem.name,
                        updates: oUpdateData,
                        properties: oConvertedProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.START,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
                else
                {
                    item.update({
                        name: item.name,
                        updates: oUpdateData,
                        properties: oProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.START,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
            }
        };
        if (empCesium.drawData.editingFeature)
        {
            empCesium.drawData.editingFeature.rectangle.show = new empCesium.ConstantProperty(false);
        }
        callbacks.dragHandlers.onDrag = function (data)
        {
            empCesium.drawData.coordinates = data.positions;
        };
        callbacks.dragHandlers.onDragEnd = function (data)
        {
            empCesium.drawData.coordinates = data.positions;
        };
        empCesium.drawHelper.drawCategoryTwoPointLine({
            callbacks: callbacks,
            id: "drawing_id" + (item.id || item.coreId),
            item: item,
            coreId: item.coreId,
            featureId: item.featureId,
            overlayId: item.overlayId
        });
        return result;
    };
    /**
     * Allows the user to put the map into a "draw mode" to draw a line.
     * After calling this function, the next click events will begin creating
     * a line.  After the user double-clicks the map then goes back into
     * the regular viewing mode, and a line is added onto the overlay.
     */
    this.drawCategorySuperAutoShape = function (item)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        overlay = empCesium.getLayer(item.overlayId),
                id = item.coreId;
        if (empCesium.drawHelper)
        {
            empCesium.drawHelper.destroy();
            empCesium.drawHelper = undefined;
        }
        empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, overlay, "drawing_" + item.coreId || item.id);
        //empCesium.drawData.id = id;
        //empCesium.drawData.overlayId = item.overlayId;
        empCesium.drawData.geometryType = "LineString";
        //empCesium.drawData.properties = {};
        var callbacks = {};
        callbacks.dragHandlers = {};
        empCesium.drawData.properties = item.properties;
        callbacks.onDrawEnd = function (data)
        {
            var oProperties = data.properties,
                    oCoordinates = data.positions,
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(data.properties.modifiers);
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oCoordinates;
            empCesium.drawData.properties = oProperties;
            if (empCesium.drawData.isDrawing)
            {
                item.plotFeature.properties = data.properties;
                empCesium.mapEngineExposed.addCompleteDrawing();
            }
            else
            {
                empCesium.drawData.coordinates = oCoordinates;
                if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
                {
                    empCesium.drawData.properties.modifiers = {};
                }
                empCesium.editorController.stopEditFeature();
            }
        };
        callbacks.onDrawUpdate = function (data)
        {
            var oCoordinates = emp.helpers.copyObject(data.positions),
                    oGeoJsonCoord = {
                        type: 'LineString',
                        coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "LineString", coordinates: oCoordinates}) //     [data.coordinate.longitude.toDeg(), data.coordinate.latitude.toDeg()]
                    },
            oProperties = emp.helpers.copyObject(data.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: data.indices
                    });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oCoordinates;
            empCesium.drawData.properties = oProperties;
            if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
            {
                empCesium.drawData.properties.modifiers = {};
            }
            empCesium.drawData.properties = oProperties;
            if (empCesium.drawData.isDrawing)
            {
                oGeoJsonCoord.symbolCode = item.symbolCode;
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                    plotFeature: new emp.typeLibrary.Feature({
                        featureId: item.featureId,
                        overlayId: item.overlayId,
                        parentId: item.parentId,
                        coreId: empCesium.drawData.item.coreId,
                        format: emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL,
                        data: oGeoJsonCoord,
                        menuId: item.menuId,
                        name: item.name,
                        properties: oProperties
                    })
                });
            }
            else
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
        };
        callbacks.onDrawStart = function (data)
        {
            var oCoordinates = emp.helpers.copyObject(data.positions);
            var oGeoJsonCoord = {
                type: 'LineString',
                coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "LineString", coordinates: data.positions})
            },
            oProperties = emp.helpers.copyObject(data.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: data.indices
                    });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oCoordinates;
            empCesium.drawData.properties = oProperties;
            if (empCesium.drawData.isDrawing)
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.START,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
            else
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.START,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
        };
        if (empCesium.drawData.editingFeature)
        {
            empCesium.drawData.editingFeature.rectangle.show = new empCesium.ConstantProperty(false);
        }
//        callbacks.dragHandlers.onDrag = function (update)
//        {
//
//            empCesium.drawData.coordinates = update.positions;
//        };
//        callbacks.dragHandlers.onDragEnd = function (update)
//        {
//
//            empCesium.drawData.coordinates = update.positions;
//            empCesium.drawData.properties.modifiers.azimuth = [Cesium.Math.toDegrees(update.azimuth)];
//            empCesium.drawData.properties.modifiers.distance = [update.width, update.height];
//        };
        empCesium.drawHelper.startDrawingSuperAutoShape({
            callbacks: callbacks,
            id: "drawing_id" + (item.id || item.coreId),
            item: item,
            coreId: item.coreId,
            featureId: item.featureId,
            overlayId: item.overlayId
        });
        return result;
    };
    this.drawCategoryMultiPointLine = function (item)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        overlay = empCesium.getLayer(item.overlayId),
                id = item.coreId;
        if (empCesium.drawHelper)
        {
            empCesium.drawHelper.destroy();
            empCesium.drawHelper = undefined;
        }
        empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, overlay, "drawing_" + item.coreId || item.id);
        //empCesium.drawData.id = id;
        //empCesium.drawData.overlayId = item.overlayId;
        empCesium.drawData.geometryType = "LineString";
        //empCesium.drawData.properties = {};
        var callbacks = {};
        callbacks.dragHandlers = {};
        empCesium.drawData.properties = item.properties;
        callbacks.onDrawEnd = function (data)
        {
            var oProperties = data.properties,
                    oCoordinates = data.positions,
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(data.properties.modifiers);
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oCoordinates;
            empCesium.drawData.properties = oProperties;
            if (empCesium.drawData.isDrawing)
            {
                item.plotFeature.properties = data.properties;
                empCesium.mapEngineExposed.addCompleteDrawing();
            }
            else
            {
                empCesium.drawData.coordinates = oCoordinates;
                if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
                {
                    empCesium.drawData.properties.modifiers = {};
                }
                empCesium.editorController.stopEditFeature()
            }
        };
        callbacks.onDrawUpdate = function (data)
        {
            var oCoordinates = data.positions,
                    oGeoJsonCoord = {
                        type: 'LineString',
                        coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "LineString", coordinates: data.positions}) //     [data.coordinate.longitude.toDeg(), data.coordinate.latitude.toDeg()]
                    },
            oProperties = emp.helpers.copyObject(data.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: data.indices
                    });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oCoordinates;
            if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
            {
                empCesium.drawData.properties.modifiers = {};
            }
            empCesium.drawData.properties = oProperties;
            if (empCesium.drawData.isDrawing)
            {
                oGeoJsonCoord.symbolCode = item.symbolCode;
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                    plotFeature: new emp.typeLibrary.Feature({
                        featureId: item.featureId,
                        overlayId: item.overlayId,
                        parentId: item.parentId,
                        coreId: empCesium.drawData.item.coreId,
                        format: emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL,
                        data: oGeoJsonCoord,
                        menuId: item.menuId,
                        name: item.name,
                        properties: oProperties
                    })
                });
            }
            else
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
        };
        callbacks.onDrawStart = function (data)
        {
            var oGeoJsonCoord = {
                type: 'LineString',
                coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: "LineString", coordinates: data.positions})
            },
            oProperties = emp.helpers.copyObject(data.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: data.indices
                    });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            if (empCesium.drawData.isDrawing)
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.START,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
            else
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.START,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
        };
        if (empCesium.drawData.editingFeature)
        {
            empCesium.drawData.editingFeature.rectangle.show = new empCesium.ConstantProperty(false);
        }
        callbacks.dragHandlers.onDrag = function (data)
        {
            empCesium.drawData.coordinates = data.positions;
        };
        callbacks.dragHandlers.onDragEnd = function (data)
        {
            empCesium.drawData.coordinates = update.positions;
            empCesium.drawData.properties.modifiers.azimuth = [Cesium.Math.toDegrees(update.azimuth)];
            empCesium.drawData.properties.modifiers.distance = [update.width, update.height];
        };
        empCesium.drawHelper.drawCategoryMultiPointLine({
            callbacks: callbacks,
            id: "drawing_id" + (item.id || item.coreId),
            item: item,
            coreId: item.coreId,
            featureId: item.featureId,
            overlayId: item.overlayId
        });
        return result;
    };
    /**
     * This function handles the drawing and edititng of sector range fans.
     *
     * @param {Object} item This object can be an emp.typeLibrary.Draw or emp.typeLibrary.Edit object.
     */
    this.drawCategorySectorAutoShape = function (item)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        overlay = empCesium.getLayer(item.overlayId),
                id = item.coreId,
                oFeature;
        if (empCesium.drawHelper)
        {
            console.log("drawHelper was active .....................");
            empCesium.drawHelper.destroy();
            empCesium.drawHelper = undefined;
        }
        empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, overlay, "drawing_" + item.coreId);
        //empCesium.drawData.id = id;
        // e//mpCesium.drawData.overlayId = item.overlayId;
        empCesium.drawData.geometryType = "Point";
        // empCesium.drawData.properties = {};
        var callbacks = {};
        callbacks.dragHandlers = {};
        empCesium.drawData.properties = item.properties;
        callbacks.onDrawEnd = function (data)
        {
            var oPositions = [data.positions],
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(data.properties.modifiers);
            data.properties.modifiers = oModifiers;
            if (empCesium.drawData.isDrawing)
            {
                item.plotFeature.properties = data.properties;
                empCesium.drawData.coordinates = oPositions;
                empCesium.mapEngineExposed.addCompleteDrawing();
            }
            else
            {
                empCesium.drawData.coordinates = oPositions;
                if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
                {
                    empCesium.drawData.properties.modifiers = {};
                }
                empCesium.drawData.properties.modifiers.azimuth = oModifiers.azimuth;
                empCesium.drawData.properties.modifiers.distance = oModifiers.distance;
                empCesium.editorController.stopEditFeature();
            }
        };
        callbacks.onDrawUpdate = function (data)
        {
            var oPositions = [data.positions],
                    oGeoJsonCoord = {
                        type: 'Point',
                        coordinates: [data.positions.longitude.toDeg(), data.positions.latitude.toDeg()]
                    },
            oProperties = emp.helpers.copyObject(data.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: data.indices
                    });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oPositions;
            if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
            {
                empCesium.drawData.properties.modifiers = {};
            }
            empCesium.drawData.properties.modifiers.azimuth = oModifiers.azimuth;
            empCesium.drawData.properties.modifiers.distance = oModifiers.distance;
            if (empCesium.drawData.isDrawing)
            {
                oGeoJsonCoord.symbolCode = item.symbolCode;
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                    plotFeature: new emp.typeLibrary.Feature({
                        featureId: item.featureId,
                        overlayId: item.overlayId,
                        parentId: item.parentId,
                        coreId: empCesium.drawData.item.coreId,
                        format: emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL,
                        data: oGeoJsonCoord,
                        menuId: item.menuId,
                        name: item.name,
                        properties: oProperties
                    })
                });
            }
            else
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
        };
        callbacks.onDrawStart = function (data)
        {
            var oGeoJsonCoord = {
                type: 'Point',
                coordinates: (data.positions ? [data.positions.longitude.toDeg(), data.positions.latitude.toDeg()] : [])
            },
            oProperties = emp.helpers.copyObject(data.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: data.indices
                    });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            if (empCesium.drawData.isDrawing)
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.START,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
            else
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.START,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
        };
        if (empCesium.drawData.editingFeature)
        {
            empCesium.drawData.editingFeature.rectangle.show = new empCesium.ConstantProperty(false);
        }
        if (item.hasOwnProperty('originFeature') && item.originFeature)
        {
            oFeature = empCesium.getMultiPoint(item.originFeature.coreId);
            if (oFeature)
            {
                var override;
                var oModifiers = oFeature.properties.modifiers;
                var checkResult = cesiumEngine.utils.checkForRequiredModifiers(oFeature);
                // If some modifiers are missing as reported by the checkForRequiredModifiers,
                // override the current modifiers so they render with the missing parameters.
                // this will have the effect of making items grow or shrink as you zoom in
                // and out.  This was intentionally requested by developer of content management
                // widget.
                for (override in checkResult)
                {
                    oModifiers[override] = checkResult[override];
                }
            }
        }
        empCesium.drawHelper.startDrawingCategorySectorAutoShape({
            callbacks: callbacks,
            id: "drawing_id" + (item.id || item.coreId),
            coreId: item.coreId,
            featureId: item.featureId,
            overlayId: item.overlayId,
            item: (oFeature ? oFeature : item)
        });
        return result;
    }
    ;
    /**
     * This function handles the drawing and edititng of circular range fans.
     *
     * @param {Object} item This object can be an emp.typeLibrary.Draw or emp.typeLibrary.Edit object.
     */
    this.drawCategoryCircularRange = function (item)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        transaction,
                oFeature,
                overlay = empCesium.getLayer(item.overlayId),
                id = item.coreId;
        transaction = empCesium.drawData.transaction;
        if (empCesium.drawHelper)
        {
            empCesium.drawHelper.destroy();
            empCesium.drawHelper = undefined;
        }
        empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, overlay, "drawing_" + item.coreId);
        //empCesium.drawData.id = id;
        //empCesium.drawData.overlayId = item.overlayId;
        empCesium.drawData.geometryType = "Point";
        //empCesium.drawData.properties = {};
        var callbacks = {};
        callbacks.dragHandlers = {};
        empCesium.drawData.properties = item.properties;
        callbacks.onDrawEnd = function (data)
        {
            var oPositions = [data.positions],
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(data.properties.modifiers);
            data.properties.modifiers = oModifiers;
            if (empCesium.drawData.isDrawing)
            {
                item.plotFeature.properties = data.properties;
                empCesium.drawData.coordinates = oPositions;
                empCesium.mapEngineExposed.addCompleteDrawing();
            }
            else
            {
                empCesium.drawData.coordinates = oPositions;
                if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
                {
                    empCesium.drawData.properties.modifiers = {};
                }
                empCesium.drawData.properties.modifiers.distance = oModifiers.distance;
                empCesium.editorController.stopEditFeature()
            }
        };
        callbacks.onDrawUpdate = function (data)
        {
            var oPositions = [data.positions],
                    oGeoJsonCoord = {
                        type: 'Point',
                        coordinates: [data.positions.longitude.toDeg(), data.positions.latitude.toDeg()]
                    },
            oProperties = emp.helpers.copyObject(data.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdate,
                        indices: data.indices
                    });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oPositions;
            if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
            {
                empCesium.drawData.properties.modifiers = {};
            }
            empCesium.drawData.properties.modifiers.distance = oModifiers.distance;
            if (empCesium.drawData.isDrawing)
            {
                oGeoJsonCoord.symbolCode = item.symbolCode;
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                    plotFeature: new emp.typeLibrary.Feature({
                        featureId: item.featureId,
                        overlayId: item.overlayId,
                        parentId: item.parentId,
                        coreId: empCesium.drawData.item.coreId,
                        format: emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL,
                        data: oGeoJsonCoord,
                        menuId: item.menuId,
                        name: item.name,
                        properties: oProperties
                    })
                });
            }
            else
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
        };
        callbacks.onDrawStart = function (data)
        {
            var oGeoJsonCoord = {
                type: 'Point',
                coordinates: (data.positions ? [data.positions.longitude.toDeg(), data.positions.latitude.toDeg()] : [])
            },
            oProperties = emp.helpers.copyObject(data.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: data.indices
                    });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            if (empCesium.drawData.isDrawing)
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.START,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
            else
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.START,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
        };
        if (empCesium.drawData.editingFeature)
        {
            empCesium.drawData.editingFeature.rectangle.show = new empCesium.ConstantProperty(false);
        }
        if (item.hasOwnProperty('originFeature') && item.originFeature)
        {
            oFeature = empCesium.getMultiPoint(item.originFeature.coreId);
            if (oFeature)
            {
                var override;
                var oModifiers = oFeature.properties.modifiers;
                var checkResult = cesiumEngine.utils.checkForRequiredModifiers(oFeature);
                // If some modifiers are missing as reported by the checkForRequiredModifiers,
                // override the current modifiers so they render with the missing parameters.
                // this will have the effect of making items grow or shrink as you zoom in
                // and out.  This was intentionally requested by developer of content management
                // widget.
                for (override in checkResult)
                {
                    oModifiers[override] = checkResult[override];
                }
            }
        }
        empCesium.drawHelper.dcCircularRangeEditor({
            callbacks: callbacks,
            id: "drawing_id" + (item.id || item.coreId),
            coreId: item.coreId,
            featureId: item.featureId,
            overlayId: item.overlayId,
            item: (oFeature ? oFeature : item)
        });
        return result;
    }
    ;
    /**
     * This function handles the drawing and edititng of routes.
     *
     * @param {Object} item This object can be an emp.typeLibrary.Draw or emp.typeLibrary.Edit object.
     */
    this.drawCategoryRoute = function (item)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        oFeature,
                overlay = empCesium.getLayer(item.overlayId),
                id = item.coreId;
        if (empCesium.drawHelper)
        {
            empCesium.drawHelper.destroy();
            empCesium.drawHelper = undefined;
        }
        empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, overlay, "drawing_" + item.coreId);
        //empCesium.drawData.id = id;
        // empCesium.drawData.overlayId = item.overlayId;
        empCesium.drawData.geometryType = "LineString";
        // empCesium.drawData.properties = {};
        var callbacks = {};
        callbacks.dragHandlers = {};
        empCesium.drawData.properties = item.properties;
        callbacks.onDrawEnd = function (data)
        {
            var oPositions = data.positions,
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(data.properties.modifiers);
            data.properties.modifiers = oModifiers;
            if (empCesium.drawData.isDrawing)
            {
                item.plotFeature.properties = data.properties;
                empCesium.drawData.coordinates = oPositions;
                empCesium.mapEngineExposed.addCompleteDrawing();
            }
            else
            {
                empCesium.drawData.coordinates = oPositions;
                if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
                {
                    empCesium.drawData.properties.modifiers = {};
                }
                empCesium.drawData.properties.modifiers.distance = oModifiers.distance;
                empCesium.editorController.stopEditFeature();
            }
        };
        callbacks.onDrawUpdate = function (data)
        {
            var oPositions = data.positions,
                    oGeoJsonCoord = cesiumEngine.utils.convertCartographicCoordList2GeoJson(oPositions),
                    oProperties = emp.helpers.copyObject(data.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdate, ///////data.type,
                        indices: data.indices
                    });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oPositions;
            if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
            {
                empCesium.drawData.properties.modifiers = {};
            }
            if (empCesium.drawData.isDrawing)
            {
                oGeoJsonCoord.symbolCode = item.symbolCode;
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                    plotFeature: new emp.typeLibrary.Feature({
                        featureId: item.featureId,
                        overlayId: item.overlayId,
                        parentId: item.parentId,
                        coreId: empCesium.drawData.item.coreId,
                        format: emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL,
                        data: oGeoJsonCoord,
                        menuId: item.menuId,
                        name: item.name,
                        properties: oProperties
                    })
                });
            }
            else
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
        };
        callbacks.onDrawStart = function (data)
        {
            var oGeoJsonCoord = cesiumEngine.utils.convertCartographicCoordList2GeoJson(data.positions),
                    oProperties = emp.helpers.copyObject(data.properties),
                    oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: data.indices
                    });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oGeoJsonCoord.symbolCode = item.symbolCode;
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = data.positions;
            if (empCesium.drawData.isDrawing)
            {
                oGeoJsonCoord.symbolCode = item.symbolCode;
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.START,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                    plotFeature: new emp.typeLibrary.Feature({
                        featureId: item.featureId,
                        overlayId: item.overlayId,
                        parentId: item.parentId,
                        coreId: empCesium.drawData.item.coreId,
                        format: emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL,
                        data: oGeoJsonCoord,
                        menuId: item.menuId,
                        name: item.name,
                        properties: oProperties
                    })
                });
//                item.update({
//                    name: item.name,
//                    updates: oUpdateData,
//                    properties: oProperties,
//                    updateEventType: emp.typeLibrary.UpdateEventType.START,
//                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
//                });
            }
            else
            {
                item.update({
                    name: item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.START,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }
        };
        if (empCesium.drawData.editingFeature)
        {
            empCesium.drawData.editingFeature.rectangle.show = new empCesium.ConstantProperty(false);
        }
        if (item.hasOwnProperty('originFeature') && item.originFeature)
        {
            oFeature = empCesium.getMultiPoint(item.originFeature.coreId);
            if (oFeature)
            {
                var override;
                var oModifiers = oFeature.properties.modifiers;
                var checkResult = cesiumEngine.utils.checkForRequiredModifiers(oFeature);
                // If some modifiers are missing as reported by the checkForRequiredModifiers,
                // override the current modifiers so they render with the missing parameters.
                // this will have the effect of making items grow or shrink as you zoom in
                // and out.  This was intentionally requested by developer of content management
                // widget.
                for (override in checkResult)
                {
                    oModifiers[override] = checkResult[override];
                }
            }
        }
        empCesium.drawHelper.dcRouteEditor({
            callbacks: callbacks,
            id: "drawing_id" + (item.id || item.coreId),
            coreId: item.coreId,
            featureId: item.featureId,
            overlayId: item.overlayId,
            item: (oFeature ? oFeature : item)
        });
        return result;
    }
    ;
    /**
     * Allows the user to put the map into a "dragging mode" to drop a point.
     * After calling this function, the next click event will drop the point.
     * At that time the map then goes back into
     * the regular viewing mode, and a point is added onto the overlay.
     */
    this.drawPoint = function (item)
    {
        var callbacks = {},
                result = {
                    success: true,
                    message: "",
                    jsError: ""
                },
        overlay = empCesium.getLayer(item.overlayId),
                id = item.coreId,
                cartographics;
        empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, overlay, "drawing_" + id);
        //empCesium.drawData.id = id;
        //empCesium.drawData.overlayId = item.overlayId;
        empCesium.drawData.geometryType = "Point";
        if (item.coordinates && cesiumEngine.utils.isGeojsonCoordinateValid(item.coordinates))
        {
            //Tacapps way to start a draw operation with an initial coordinates
            // coordinates are in geojson
            cartographics = cesiumEngine.utils.convertCoordsDegreesToCartographicArray(item.coordinates);
        }
        else if (item.coordinates && cesiumEngine.utils.isGeojsonCoordinateValid({type: "Point", coordinates: item.coordinates}))
        {
            cartographics = cesiumEngine.utils.convertCoordsDegreesToCartographicArray({type: "Point", coordinates: item.coordinates});
        }
        empCesium.drawData.coordinates = cartographics;
        callbacks.dragHandlers = {};
        callbacks.onDrawStart = function (data)
        {
            empCesium.drawData.coordinates = data.positions;
            var oGeoJsonCoord = {
                type: empCesium.drawData.geometryType,
                coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: empCesium.drawData.geometryType, coordinates: data.positions})
            },
            oProperties = emp.helpers.copyObject(empCesium.drawData.properties),
                    oModifiers = oProperties.modifiers,
                    //oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers),
                    oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: data.indices
                    });
            var format = emp.typeLibrary.featureFormatType.GEOJSON; // deafult format
            if (empCesium.drawData.item && empCesium.drawData.item.plotFeature && empCesium.drawData.item.plotFeature.format)
            {
                format = empCesium.drawData.item.plotFeature.format;
            }

            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            item.update({
                name: item.name,
                updates: oUpdateData,
                properties: oProperties,
                updateEventType: emp.typeLibrary.UpdateEventType.START,
                mapInstanceId: empCesium.empMapInstance.mapInstanceId
            });
        };
        callbacks.onDrawComplete = function (data)
        {
            empCesium.drawHelper.finishDrawing(); // ojo why calling this here .. is alrady called insid ethe addCompleteDrawing??
            empCesium.drawData.coordinates = data.positions;
            empCesium.mapEngineExposed.addCompleteDrawing();
        };
        callbacks.dragHandlers.onDrag = function (data)
        {
            empCesium.drawData.coordinates = data.positions;
        };
        callbacks.dragHandlers.onDragEnd = function (data)// same as onDrawUpdate
        {
            empCesium.drawData.coordinates = data.positions;
            var oCoordinates = data.positions;
            var oGeoJsonCoord = {
                type: empCesium.drawData.geometryType,
                coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: empCesium.drawData.geometryType, coordinates: oCoordinates})
            };
            var format = emp.typeLibrary.featureFormatType.GEOJSON; // deafult format
            if (empCesium.drawData.item && empCesium.drawData.item.plotFeature && empCesium.drawData.item.plotFeature.format)
            {
                format = empCesium.drawData.item.plotFeature.format;
            }
            var oProperties = emp.helpers.copyObject(empCesium.drawData.properties);
            //var oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers);
            var oModifiers = oProperties.modifiers;
            var oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                indices: data.indices
            });
            oUpdateData.convertFromGeoJson(oGeoJsonCoord);
            oProperties.modifiers = oModifiers;
            empCesium.drawData.coordinates = oCoordinates;
            empCesium.drawData.properties = oProperties;
            if (!empCesium.drawData.properties.hasOwnProperty('modifiers'))
            {
                empCesium.drawData.properties.modifiers = {};
            }
            if (empCesium.drawData.isDrawing)
            {
                oGeoJsonCoord.symbolCode = empCesium.drawData.item.symbolCode;
                empCesium.drawData.item.update({
                    name: empCesium.drawData.item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                    plotFeature: new emp.typeLibrary.Feature({
                        featureId: empCesium.drawData.item.featureId,
                        coreId: empCesium.drawData.item.coreId,
                        overlayId: empCesium.drawData.item.overlayId,
                        parentId: empCesium.drawData.item.parentId,
                        format: format,
                        data: oGeoJsonCoord,
                        menuId: empCesium.drawData.item.menuId,
                        name: empCesium.drawData.item.name,
                        properties: oProperties
                    })
                });
            }
            else
            {
                item.update({
                    name: empCesium.drawData.item.name,
                    updates: oUpdateData,
                    properties: oProperties,
                    updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
            }

        };
        empCesium.drawHelper.startDrawingMarker({
            callbacks: callbacks,
            id: "drawing_" + item.coreId,
            coreId: item.coreId,
            featureId: item.featureId,
            overlayId: item.overlayId,
            iconUrl: empCesium.drawData.image,
            //shiftX: empCesium.drawData.shiftX,
            //shiftY: empCesium.drawData.shiftY,
            pixelOffset: empCesium.drawData.pixelOffset,
            scale: empCesium.drawData.scale,
            scaleByDistance: empCesium.drawData.scaleByDistance,
            alignedAxis: empCesium.drawData.alignedAxis,
            width: empCesium.drawData.width,
            height: empCesium.drawData.height,
            verticalOrigin: empCesium.drawData.verticalOrigin
        });
        return result;
    };
    /**
     * Draws a symbol on the map
     *
     * @param idObject
     * @param item
     */
    this.drawSymbol = function (item)
    {
        var result = null,
                isMultiPoint;
        // Indicate that this symbol is MIL-STD at this point
        empCesium.drawData.item.plotFeature.format = "milstd";
        empCesium.drawData.standard = 1;
        // Look at what we are drawing.  This 3D map engine does not have the
        // ability at this time to do the drawing and editing of 3D symbols.
        // If this is a 3D track graphic, prevent the drawing.
        if (item && item.symbolCode && empCesium.is3dAirspace(item.symbolCode))
        {
            result = null;
        }
        else
        {
            //check if the symbol is a multi point
            if (item.properties)
            {
                empCesium.drawData.standard = cesiumEngine.utils.convertSymbolStandardToRendererFormat(item.properties.modifiers, empCesium.isV2Core);
            }
            isMultiPoint = armyc2.c2sd.renderer.utilities.SymbolDefTable.isMultiPoint(item.symbolCode, empCesium.drawData.standard);
            // If it's a multipoint we need to handle it slightly different.
            if (isMultiPoint)
            {
                result = this.drawMultiPointSymbol(item);
            }
            else
            {
                //the symbol must be a single point
                result = this.drawSinglePointSymbol(item);
            }
        }
        return result;
    };
    this.drawAirspace = function (item)
    {
        var result = null,
                airspace,
                defer;
        // Indicate that this symbol is MIL-STD at this point
        empCesium.drawData.item.plotFeature.format = "milstd";
        // Look at what we are drawing.  This 3D map engine does not have the
        // ability at this time to do the drawing and editing of 3D symbols.
        // If this is a 3D track graphic, prevent the drawing.
        if (item && item.symbolCode && empCesium.is3dAirspace(item.symbolCode))
        {
            airspace = cesiumEngine.utils.convertEmpToTaisAirspace(item);
            empCesium.drawData.isAirspace = true;
            empCesium.drawData.airspace = airspace;
            airspace.callbacks = {};
            airspace.callbacks.onDrawComplete = function ()
            {
                this.stopDraw();
            };
            empCesium.airspaceDrawHandler = empCesium.mouseHandler.mouseHandlerList[TAIS_DATA_TYPE.AIRSPACE.Value];
            defer = empCesium.airspaceDrawHandler.initialize(5, {payload: airspace}); //CONSTANTS.MAP_DRAW_MODE = 5
            result = {
                success: true,
                message: "",
                jsError: ""};
        }
        return result;
    };
    this.editAirspace = function (item)
    {
        var result = null,
                airspace,
                callbacks = {};
        // Indicate that this symbol is MIL-STD at this point
        // empCesium.drawData.item.plotFeature.format = "milstd";

        // Look at what we are drawing.  This 3D map engine does not have the
        // ability at this time to do the drawing and editing of 3D symbols.
        // If this is a 3D track graphic, prevent the drawing.
        if (item && item.symbolCode && empCesium.is3dAirspace(item.symbolCode))
        {
            airspace = cesiumEngine.utils.convertEmpToTaisAirspace(item);
            empCesium.drawData.airspace = airspace;
            empCesium.drawData.isAirspace = true;
            callbacks.onDrawComplete = function (airspaceEdited)
            {
                empCesium.transferTaisAirspaceToDrawData(airspaceEdited, empCesium.drawData);
                if (empCesium.drawData.isDrawing)
                {
                    empCesium.mapEngineExposed.addCompleteDrawing();
                }
                else
                {
                    this.stopEditFeature();
                }
            };
            callbacks.onDrawUpdate = function (airspaceEdited)
            {
                empCesium.transferTaisAirspaceToDrawData(airspaceEdited, empCesium.drawData);
                var oPositions = empCesium.drawData.coordinates; // cartographic array
                oPositions = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: empCesium.drawData.geometryType, coordinates: oPositions});
                var oGeoJsonCoord = {
                    type: empCesium.drawData.geometryType,
                    coordinates: (oPositions ? oPositions : [])
                };
                var oProperties = emp.helpers.copyObject(empCesium.drawData.properties);
                var oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                    type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                    indices: empCesium.defined(airspaceEdited.indices) ? airspaceEdited.indices : []
                });
                oUpdateData.convertFromGeoJson(oGeoJsonCoord);
                if (empCesium.drawData.isDrawing)
                {
                    oGeoJsonCoord.symbolCode = empCesium.drawData.properties.symbolCode;
                    empCesium.drawData.item.update({
                        name: empCesium.drawData.name,
                        updates: oUpdateData,
                        properties: oProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId,
                        plotFeature: new emp.typeLibrary.Feature({
                            featureId: empCesium.drawData.featureId,
                            overlayId: empCesium.drawData.overlayId,
                            parentId: empCesium.drawData.parentId,
                            coreId: empCesium.drawData.item.coreId,
                            format: emp3.api.enums.FeatureTypeEnum.GEO_ACM,
                            data: oGeoJsonCoord,
                            menuId: empCesium.drawData.item.menuId,
                            name: empCesium.drawData.name,
                            properties: oProperties
                        })
                    });
                }
                else
                {
                    empCesium.drawData.item.update({
                        name: empCesium.drawData.name,
                        updates: oUpdateData,
                        properties: oProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
            };
            callbacks.onDrawStart = function (airspaceEdited)
            {
                empCesium.transferTaisAirspaceToDrawData(airspaceEdited, empCesium.drawData);
                var oPositions = empCesium.drawData.coordinates; // cartographic array
                oPositions = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: empCesium.drawData.geometryType, coordinates: oPositions});
                var oGeoJsonCoord = {
                    type: empCesium.drawData.geometryType,
                    coordinates: (oPositions ? oPositions : [])
                };
                var oProperties = emp.helpers.copyObject(empCesium.drawData.properties);
                var oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                    type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                    indices: []
                });
                oUpdateData.convertFromGeoJson(oGeoJsonCoord);
                if (empCesium.drawData.isDrawing)
                {
                    empCesium.drawData.item.update({
                        name: empCesium.drawData.name,
                        updates: oUpdateData,
                        properties: oProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.START,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
                else
                {
                    empCesium.drawData.item.update({
                        name: empCesium.drawData.name,
                        updates: oUpdateData,
                        properties: oProperties,
                        updateEventType: emp.typeLibrary.UpdateEventType.START,
                        mapInstanceId: empCesium.empMapInstance.mapInstanceId
                    });
                }
            };
            airspace.callbacks = callbacks;
            empCesium.airspaceDrawHandler = empCesium.mouseHandler.mouseHandlerList[ TAIS_DATA_TYPE.AIRSPACE.Value];
            empCesium.airspaceDrawHandler.initialize(6, {deferred: null, payload: airspace});
            result = {
                success: true,
                message: "",
                jsError: ""};
        }
        return result;
    };
    /**
     * @desc Draws a multi point symbol
     * @param item
     * @param idObject
     */
    this.drawMultiPointSymbol = function (item)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        sd,
                basicSymbolId,
                standard = 0,
                override,
                checkResult,
                cartographics;
        try
        {
            // load the symbol definition table which contains
            // all the "how-to" drawing information about the symbol
            // like how many points it takes to render the graphic
            basicSymbolId = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(item.symbolCode);
            if (item.plotFeature.properties)
            {
                // Rertrieve which standard to use.  '2525b' or '2525c'
                standard = cesiumEngine.utils.convertSymbolStandardToRendererFormat(item.plotFeature.properties.modifiers, empCesium.isV2Core);
            }
            // Retrieve metadata information about the MIL-STD-2525 info about what
            // we are trying to draw.  We are interested in minimum number and max number
            // of points allowed by this symbol.
            sd = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(basicSymbolId, standard);
            empCesium.drawData.symbolDef = sd;
            //set the rest of the empCesium.drawData properties, may be modified later
            empCesium.drawData.standard = standard;
            empCesium.drawData.isEditing = false;
            empCesium.drawData.isDrawing = true;
            empCesium.drawData.drawType = item.symbolCode;
            empCesium.drawData.symbolCode = item.symbolCode;
            //empCesium.drawData.minPoints = sd.minPoints;
            //empCesium.drawData.maxPoints = sd.maxPoints;
            empCesium.drawData.drawCategory = sd.drawCategory; //needed to check for routes
            empCesium.drawData.drawFeatureId = "draw_" + item.coreId;
            if (item.coordinates && cesiumEngine.utils.isGeojsonCoordinateValid(item.coordinates))
            {
                //Tacapps way to start a draw operation with an initial coordinates
                // coordinates are in geojson
                cartographics = cesiumEngine.utils.convertCoordsDegreesToCartographicArray(item.coordinates);
            }
            empCesium.drawData.coordinates = cartographics;
            // Check if the symbol has the required modifiers.
            item.plotFeature.symbolCode = item.symbolCode;
            item.plotFeature.format = "milstd";
            item.plotFeature.data.symbolCode = item.symbolCode;
            item.symbolDefTable = sd;
            // Check if the symbol has the required modifiers.
            var viewDistanceMeters = empCesium.leftToRightViewDistanceMeters();
            checkResult = cesiumEngine.utils.checkForRequiredModifiers(item, viewDistanceMeters);
            // If some modifiers are missing as reported by the checkForRequiredModifiers,
            // override the current modifiers so they render with the missing parameters.
            // this will have the effect of making items grow or shrink as you zoom in
            // and out.  This was intentionally requested by developer of content management
            // widget.
            var override;
            for (override in checkResult)
            {
                item.properties.modifiers[override] = checkResult[override];
            }
            item.plotFeature.properties.modifiers = (item.properties.modifiers) ? item.properties.modifiers : {};
            empCesium.drawData.properties = item.properties;
            // Build the line that will used to display the vertices on the screen.

            switch (empCesium.drawData.drawCategory)
            {
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_LINE:
                    result = this.drawLine(item);
                    break;
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_POLYGON:
                    result = this.drawPolygon(item);
                    break;
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_3D_AIRSPACE:
                    //result = drawLine(item);
                    break;
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_RANGEFAN_AUTOSHAPE:
                    result = this.drawCategoryCircularRange(item);
                    break;
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_DONOTDRAW:
                    //result = drawLine(item);
                    break;
//                    case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_POINT:
//                        //result = drawLine(item);
//                        break;
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE:
                    result = this.drawCategoryRectangleParameteredAutoShape(item);
                    break;
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_ROUTE:
                    result = this.drawCategoryRoute(item);
                    break;
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_SECTOR_PARAMETERED_AUTOSHAPE:
                    result = this.drawCategorySectorAutoShape(item);
                    break;
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_SUPERAUTOSHAPE:
                    if (empCesium.drawData.symbolDef.minPoints === 3)
                    {
                        result = this.drawCategorySuperAutoShape(item);
                    }
                    if (empCesium.drawData.symbolDef.minPoints === 4)
                    {
                        result = this.drawCategoryMultiPointLine(item);
                    }
                    break;
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_TWOPOINTARROW:
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_TWOPOINTLINE:
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_ARROW:
                    result = this.drawCategoryTwoPointLine(item);
                    break;
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_AUTOSHAPE:
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE:
                    if (empCesium.drawData.symbolDef.minPoints === 3)
                    {
                        result = this.drawCategoryMultiPointLine(item);
                    }
                    else if (empCesium.drawData.symbolDef.minPoints === 4)
                    {
                        result = this.drawCategoryMultiPointLine(item);
                    }
                    else if (empCesium.drawData.symbolDef.maxPoints === 1)
                    {
                        result = this.drawCategoryTwoPointLine(item);
                    }
                    else
                    {
                        //result = drawCategoryTwoPointLine(item);
                        result = this.drawLine(item);
                    }
                    break;
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_TWO_POINT_RECT_PARAMETERED_AUTOSHAPE:
                    result = this.drawCategoryTwoPointRectangleParameteredAutoShape(item);
                    break;
                case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_UNKNOWN:
                    result = this.drawLine(item);
                    break;
            }
        }
        catch (err)
        {
            result = {
                success: false,
                message: "",
                jsError: err};
        }
        return result;
    };
    /**
     * Draws a single point symbol
     *
     * @param item
     */
    this.drawSinglePointSymbol = function (item)
    {
        var result = null;
        //try to add the symbol and make it draggable
        try
        {
            // item.coordinates = [0, 0, 0];
            item.plotFeature.symbolCode = item.symbolCode;
            item.plotFeature.format = "milstd";
            item.plotFeature.data.symbolCode = item.symbolCode;
            item.plotFeature.data.type = "Point";
            empCesium.drawData.drawCategory = armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_POINT;
            // Check to see if the symbol exists already and we are drawing on top of it.
            // if it is we want to drag that symbol, otherwise, create a new symbol.
            if (empCesium.isMilStdSinglepoint(item.coreId))
            {
                result = this.editFeature(item);
            }
            else
            {
                // This is a new symbol we are drawing.  Place it on the map first.
                var billboards = empCesium.getSinglePointBillboardPrimitive([item]);
                //empCesium.drawData.shiftX = billboards[0].pixelOffset.x;
                //empCesium.drawData.shiftY = billboards[0].pixelOffset.y;
                empCesium.drawData.pixelOffset = new empCesium.Cartesian2(billboards[0].pixelOffset.x, billboards[0].pixelOffset.y);
//                if (billboards[0].verticalOrigin)
//                {
                empCesium.drawData.verticalOrigin = empCesium.VerticalOrigin.CENTER;
//                }
//                else
//                {
//                     empCesium.drawData.verticalOrigin = empCesium.VerticalOrigin.CENTER;// defaulting to center
//                }
                //empCesium.drawData.shiftX = billboards[0].pixelOffset._value.x;
                //empCesium.drawData.shiftY = billboards[0].pixelOffset._value.y;
//                empCesium.drawData.scale = billboards[0].scale;
                //empCesium.drawData.scale = billboards[0].scale.getValue();
//                empCesium.drawData.alignedAxis = billboards[0].alignedAxis;
//                empCesium.drawData.scaleByDistance = {"near": billboards[0].scaleByDistance.near, "nearValue": billboards[0].scaleByDistance.nearValue, "far": billboards[0].scaleByDistance.far, "farValue": billboards[0].scaleByDistance.farValue};
                //empCesium.drawData.scaleByDistance = {"near": billboards[0].scaleByDistance.getValue().near, "nearValue": billboards[0].scaleByDistance.getValue().nearValue, "far": billboards[0].scaleByDistance.getValue().far, "farValue": billboards[0].scaleByDistance.getValue().farValue};
                //empCesium.drawData.image = billboards[0].image._value;
                empCesium.drawData.image = billboards[0].image;
                empCesium.drawData.properties = item.properties;
                result = this.drawPoint(item);
            }
            empCesium.drawData.isDrawing = true;
        }
        catch (err)
        {
            result = {};
            result.success = false;
            result.message = "Drawing the single point symbol failed.";
            result.jsError = err;
        }
        return result;
    };
    /*
     *
     * @param {type} item
     * @returns {undefined}
     */
    this.drawFeature = function (item)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        overlayId = item.overlayId;
        try
        {
            empCesium.drawData.item = item;
            empCesium.drawData.isDrawing = true;
            empCesium.drawData.isEditing = false;
            if (overlayId === null || overlayId === "" || overlayId === undefined)
            {
                overlayId = empCesium.drawingOverlayId;
            }
            if (Cesium.defined(empCesium.drawHelper) && empCesium.drawHelper !== null)
            {
                // case of autoshape  editing
                empCesium.drawHelper.stopDrawing();
                empCesium.drawHelper.destroy();
                empCesium.drawHelper = null;
            }

            // check if the feature already exists. If exists set the coordinates into the drawdayta object, and hide the existing feature
            if (empCesium.defined(item.originFeature))
            {
                empCesium.drawData.coordinates = cesiumEngine.utils.convertCoordsDegreesToCartographicArray(item.originFeature.data);
                item.coordinates = item.originFeature.data.coordinates;
                if (!item.coreId)
                {
                    // core not sending the coreId when in draw mode of existing graphic. Use the id of the originFeature.
                    item.coreId = item.originFeature.coreId;
                }
                var feature = empCesium.getFeature(item.coreId);
                empCesium.showFeature(feature.id, false);
            }
            //if there is a parentId, use that. Otherwise, use the overlayId.
            switch (item.type)
            {
                case 'point':
                    //var pinBuilder = new empCesium.PinBuilder();
                    //empCesium.drawData.image = pinBuilder.fromColor(Cesium.Color.YELLOW, 16);
                    empCesium.drawData.image = emp.utilities.getDefaultIcon().iconUrl;
                    empCesium.drawData.width = emp.utilities.getDefaultIcon().offset.width;
                    empCesium.drawData.width = emp.utilities.getDefaultIcon().offset.height;
                    //empCesium.drawData.shiftX = emp.utilities.getDefaultIcon().offset.x;
                    //empCesium.drawData.shiftY = emp.utilities.getDefaultIcon().offset.y;
                    empCesium.drawData.pixelOffset = new empCesium.Cartesian2(emp.utilities.getDefaultIcon().offset.x, emp.utilities.getDefaultIcon().offset.y);
                    empCesium.drawData.alignedAxis = empCesium.Cartesian3.ZERO;
                    empCesium.drawData.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                    //empCesium.drawData._verticalOrigin = empCesium.VerticalOrigin.CENTER;
                    empCesium.drawData.properties = item.properties;
                    result = this.drawPoint(item);
                    break;
                case 'text':

                    empCesium.drawData.isLabel = true;
                    empCesium.drawData.labelText = item.name;
                    empCesium.drawData.labelPixelOffset = undefined;
                    empCesium.drawData.labelFont = undefined;
                    empCesium.drawData.labelStyle = undefined;


                    if (empCesium.defined(item.plotFeature.color))
                    {
                        var rgbaFillColor = cesiumEngine.utils.hexToRGB(item.plotFeature.color);
                        empCesium.drawData.labelFillColor = new empCesium.Color(rgbaFillColor.r, rgbaFillColor.g, rgbaFillColor.b, rgbaFillColor.a);
                    }
                    else
                    {
                        empCesium.drawData.labelFillColor = EmpCesiumConstants.propertyDefaults.FILL_COLOR;
                    }
                    //empCesium.drawData.labelOutLineColor = (empCesium.defined(feature.label.outLineColor)) ? feature.label.outLineColor.getValue() : undefined;
                    //empCesium.drawData.labelOutLineWidth = (empCesium.defined(feature.label.outLineWidth)) ? feature.label.outLineWidth.getValue() : undefined;
                    empCesium.drawData.labelHorizontalOrigin = Cesium.HorizontalOrigin.LEFT;
                    //empCesium.drawData.labelVerticalOrigin = (empCesium.defined(feature.label.verticalOriginOrigin)) ? feature.label.verticalOriginOrigin.getValue() : empCesium.VerticalOrigin.CENTER;
                    empCesium.drawData.labelScale = 1;
                    //empCesium.drawData.labelTranslucencyByDistance = (empCesium.defined(feature.label.translucencyByDistance)) ? feature.label.translucencyByDistance.getValue() : undefined;
                    empCesium.drawData.properties = item.plotFeature.properties;
                    //empCesium.drawData._verticalOrigin = empCesium.VerticalOrigin.CENTER;
                    result = this.drawPoint(item);
                    break;
                case 'line':
                case 'path':
                    empCesium.drawData.properties = item.properties;
                    result = this.drawLine(item);
                    break;
                case 'polygon':
                    empCesium.drawData.properties = item.properties;
                    result = this.drawPolygon(item);
                    break;
                case 'milstd': //may be symbol?
                    if (item && item.symbolCode && empCesium.is3dAirspace(item.symbolCode))
                    {
                        this.drawAirspace(item);
                    }
                    else
                    {
                        result = this.drawSymbol(item);
                    }
                    break;
                case 'airspace':
                    result = this.drawAirspace(item);
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
                case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
                case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
                case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
                    var empPrimitiveItemToMilStandardItem = cesiumEngine.utils.convertEmpPrimitiveItemToMilStandardItem(item, item.type);
                    result = this.drawSymbol(empPrimitiveItemToMilStandardItem);
                    break;
                case  emp3.api.enums.FeatureTypeEnum.GEO_TEXT :
                    //empCesium.drawData.shiftY = emp.utilities.getDefaultIcon().offset.y;
//                    empCesium.drawData.pixelOffset = new empCesium.Cartesian2(emp.utilities.getDefaultIcon().offset.x, emp.utilities.getDefaultIcon().offset.y);
//                    empCesium.drawData.alignedAxis = empCesium.Cartesian3.ZERO;
//                    empCesium.drawData.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
//                    //empCesium.drawData._verticalOrigin = empCesium.VerticalOrigin.CENTER;
//                    empCesium.drawData.properties = item.properties;
//                    result = this.drawPoint(item);
                    break;
                default:
                    //this is temporary fix for drawing symbols since the type is not populated
                    if (item.symbolCode !== null && item.symbolCode !== undefined)
                    {
                        result = this.drawSymbol(item);
                    }
                    else
                    {
                        console.log("Attempting to draw something not handled in Cesium  engine!");
                    }
                    //end temporary symbol fix
                    break;
            }
        }
        catch (err)
        {
            result.success = false;
            result.jsError = err;
            result.message = "Could not begin draw event.";
            return result;
        }
        return result;
    };
    this.stopDraw = function ()
    {
        var transaction,
                result = {
                    success: true,
                    message: "",
                    jsError: ""
                };
        if (empCesium.drawData && empCesium.drawData.transaction && empCesium.defined(empCesium.drawData.coordinates)) //&& (empCesium.drawData.geometryType === "Point"  ||  (empCesium.drawData.geometryType !== "Point" && empCesium.drawData.coordinates.length > 0 )))
        {
            try
            {
                transaction = empCesium.drawData.transaction;
                if (empCesium.drawData.isAirspace && empCesium.drawData.airspace)
                {
                    empCesium.transferTaisAirspaceToDrawData(empCesium.drawData.airspace, empCesium.drawData);
                }
                empCesium.mapEngineExposed.addCompleteDrawing();
                if (empCesium.defined(empCesium.drawData.item.originFeature))
                {
                    empCesium.drawData.coordinates = cesiumEngine.utils.convertCoordsDegreesToCartographicArray(empCesium.drawData.item.originFeature.data);
                    var feature = empCesium.getFeature(empCesium.drawData.item.coreId);
                    empCesium.showFeature(feature.id, true);
                }
                empCesium.drawData = {
                    isDrawing: false
                };
            }
            catch (err)
            {
                result.success = false;
                result.jsError = err;
                result.message = "Failed to stop edit.";
            }
        }
        else
        {
            result.success = false;
            result.message = "There is no currently stored drawing transaction to complete.";
        }
        return result;
    };
    this.cancelDrawFeature = function ()
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        };
        if (empCesium.drawData && empCesium.drawData.transaction)
        {
            try
            {
                if (Cesium.defined(empCesium.drawHelper) && empCesium.drawHelper !== null)
                {
                    empCesium.drawHelper.stopDrawing();
                    empCesium.drawHelper.destroy();
                    empCesium.drawHelper = null;
                }
                else if (empCesium.drawData.isAirspace)
                {
                    empCesium.airspaceDrawHandler.finishDraw();
                }
                if (empCesium.defined(empCesium.drawData.item.originFeature))
                {
                   ///// empCesium.drawData.coordinates = cesiumEngine.utils.convertCoordsDegreesToCartographicArray(empCesium.drawData.item.originFeature.data);

                    var feature = empCesium.getFeature(empCesium.drawData.item.coreId);
                    empCesium.showFeature(feature.id, true);
                }
            }
            catch (err)
            {
                result.success = false;
                result.jsError = err;
                result.message = "Failed to cancel drawing.";
            }
        }
        else
        {
            result.success = false;
            result.message = "There is no currently stored drawing transaction to cancel.";
        }
        return result;
    };
    this.editFeature = function (item)
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        callbacks = {},
                featurePrimitiveEditable,
                isBillboardCollection = false,
                bIsEditorAvailable = false;
        try
        {
            if (Cesium.defined(empCesium.drawHelper) && empCesium.drawHelper !== null)
            {
                // case of autoshape  editing
                empCesium.drawHelper.stopDrawing();
                empCesium.drawHelper.destroy();
                empCesium.drawHelper = null;
            }
            // Clear all selected features and then select the feature
            // to be edited.
//            clearSelectedFeatures();
//            manageSelect({
//                featureId: item.coreId,
//                sendEvent: true,
//                bypassEditCheck: true
//            });
            var layer = empCesium.getLayer(item.originFeature.parentCoreId); // parentCoreId not found. found under originFeature ojo
            if (!layer)
            {
                result.success = false;
                result.message = "Failed to edit feature. layer not found";
                result.jsError = "";
                return result;
            }
            var feature = layer.getFeature(item.coreId);
            if (!feature)
            {
                result.success = false;
                result.message = "Failed to edit feature. Feature not found";
                result.jsError = "";
                return result;
            }
            else
            {
                var isBillboardCollection = (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION) ? true : false;
                empCesium.drawData.editingFeature = feature;
                empCesium.drawData.geometryType = empCesium.drawData.originFeature.data.type;
                if (empCesium.defined(empCesium.drawData.editingFeature.properties) && empCesium.defined(empCesium.drawData.editingFeature.properties.modifiers))
                {
                    empCesium.drawData.standard = cesiumEngine.utils.checkSymbolStandard(empCesium.drawData.editingFeature.properties.modifiers);
                }
                else if (empCesium.defined(empCesium.drawData.originFeature.properties) && empCesium.defined(empCesium.drawData.originFeature.properties.modifiers))
                {
                    empCesium.drawData.standard = cesiumEngine.utils.checkSymbolStandard(empCesium.drawData.originFeature.properties.modifiers);
                }
                else
                {
                    empCesium.drawData.standard = cesiumEngine.utils.RendererSettings.Symbology_2525C; //1
                }
                var isAirspace = empCesium.isAirspacePresent(item.coreId);
                if (isAirspace)
                {
                    var airspaceObject = empCesium.getAirspace(item.coreId);
                    empCesium.drawData.isDrawing = false;
                    empCesium.drawData.isEditing = true;
                    empCesium.drawData.id = item.coreId;
                    empCesium.drawData.featureId = item.featureId;
                    empCesium.drawData.parentId = item.parentId;
                    empCesium.drawData.overlayId = layer.id; //root or parentCoreId in emp3
                    empCesium.drawData.name = item.originFeature.name;
                    empCesium.drawData.menuId = item.menuId;
                    empCesium.drawData.properties = item.originFeature.properties;
                    empCesium.drawData.editingFeature.show = false;
                    var airspaceLabelPresent = empCesium.isMultiPointPresent(feature.id + "_label");
                    if (airspaceLabelPresent)
                    {
                        var airspaceLabel = layer.getFeature(feature.id + "_label");
                        if (airspaceLabel)
                        {
                            airspaceLabel.show = false;
                        }
                    }
                    empCesium.drawData.item = item;
                    result = this.editAirspace(airspaceObject);
                    bIsEditorAvailable = true;
                }
                else if (feature.billboard || isBillboardCollection)
                {
                    empCesium.drawData.geometryType = "Point";
                    empCesium.drawData.isDrawing = false;
                    empCesium.drawData.isEditing = true;
                    empCesium.drawData.id = item.coreId;
                    empCesium.drawData.overlayId = item.overlayId;
                    empCesium.drawData.properties = item.originFeature.properties;
                    callbacks.dragHandlers = {};
                    callbacks.onDrawStart = function (data)
                    {
                        empCesium.drawData.coordinates = data.positions;
                        var oGeoJsonCoord = {
                            type: empCesium.drawData.geometryType,
                            coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: empCesium.drawData.geometryType, coordinates: data.positions})
                        };
                        var oProperties = emp.helpers.copyObject(empCesium.drawData.properties);
                        var oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                            type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                            indices: data.indices
                        });
                        oUpdateData.convertFromGeoJson(oGeoJsonCoord);
                        if (oProperties && oProperties.hasOwnProperty('modifiers'))
                        {
                            var oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers);
                            oProperties.modifiers = oModifiers;
                        }

                        item.update({
                            name: empCesium.drawData.name,
                            updates: oUpdateData,
                            properties: oProperties,
                            updateEventType: emp.typeLibrary.UpdateEventType.START,
                            mapInstanceId: empCesium.empMapInstance.mapInstanceId
                        });
                    };
                    callbacks.onDrawComplete = function (data)
                    {
                        empCesium.drawData.coordinates = data.positions;
                        empCesium.editorController.stopEditFeature();
                        empCesium.drawData = {};
                    };
                    callbacks.dragHandlers.onDrag = function (data)
                    {
                        empCesium.drawData.coordinates = data.positions;
                    };
                    callbacks.dragHandlers.onDragEnd = function (data)
                    {
                        empCesium.drawData.coordinates = data.positions;
                        var format = undefined;
                        if (empCesium.drawData.originFeature && empCesium.drawData.originFeature.format)
                        {
                            format = empCesium.drawData.originFeature.format;
                        }
                        var oPositions = empCesium.drawData.coordinates; // cartographic array
                        oPositions = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: empCesium.drawData.geometryType, coordinates: oPositions});
                        var oGeoJsonCoord = {
                            type: empCesium.drawData.geometryType,
                            coordinates: (oPositions ? oPositions : [])
                        };
                        var oProperties = emp.helpers.copyObject(empCesium.drawData.properties);
                        var oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                            type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                            indices: data.indices
                        });
                        oUpdateData.convertFromGeoJson(oGeoJsonCoord);
                        empCesium.drawData.item.update({
                            name: empCesium.drawData.name,
                            updates: oUpdateData,
                            properties: oProperties,
                            updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                            mapInstanceId: empCesium.empMapInstance.mapInstanceId
                        });
                    };
                    var iconUrl;
                    var cartesian;
                    var scale;
                    var pixelOffset;
                    var alignedAxis;
                    var scaleByDistance;
                    var verticalOrigin;
                    var horizontalOrigin;
                    var eyeOffset;
                    var heightReference = empCesium.HeightReference.CLAMP_TO_GROUND;
                    if (feature.billboard)
                    {
                        feature.billboard.show = new empCesium.ConstantProperty(false);
                        if (feature.label)
                        {
                            feature.label.show = new empCesium.ConstantProperty(false);
                        }
                        if (feature.polyline)
                        {
                            feature.polyline.show = new empCesium.ConstantProperty(false);
                        }
                        feature.show = new empCesium.ConstantProperty(false); // entity
                        if (feature.billboard.scale)
                        {
                            scale = feature.billboard.scale._value;
                            //scale = feature.billboard.scale._value * .5;// the primitive billboard scale used in editor  is half of the entity billboard. Bug in sdk???
                        }
                        else
                        {
                            scale = 1;
                            //scale = .5;
                            //scale = cesiumEngine.utils.getSymbolIconCurrentScale(empCesium.iconPixelSize);
                            //scale = cesiumEngine.utils.getSymbolIconCurrentScale((empCesium.iconPixelSize * 0.50) + empCesium.iconPixelSize);
                        }
                        if (empCesium.defined(feature.billboard.alignedAxis))
                        {
                            alignedAxis = feature.billboard.alignedAxis.getValue();
                        }
                        if (empCesium.defined(feature.billboard.pixelOffset))
                        {
                            pixelOffset = feature.billboard.pixelOffset.getValue();
                        }
                        if (empCesium.defined(feature.billboard.verticalOrigin))
                        {
                            verticalOrigin = feature.billboard.verticalOrigin.getValue();
                        }
                        if (empCesium.defined(feature.billboard.horizontalOrigin))
                        {
                            horizontalOrigin = feature.billboard.horizontalOrigin.getValue();
                        }
                        if (empCesium.defined(feature.billboard.eyeOffset))
                        {
                            eyeOffset = feature.billboard.eyeOffset.getValue();
                        }
                        if (empCesium.defined(feature.billboard.scaleByDistance))
                        {
                            scaleByDistance = feature.billboard.scaleByDistance.getValue(); //{far: feature.scaleByDistance.getValue().far, farValue: feature.scaleByDistance.getValue().farValue, near: feature.scaleByDistance.getValue().near, nearValue: feature.scaleByDistance.getValue().nearValue};

                        }
                    }
                    else if (isBillboardCollection)
                    {
                        feature._billboards[0].show = false;
                        if (feature.scale)
                        {
                            scale = feature.scale;
                        }
                        else
                        {
                            scale = cesiumEngine.utils.getSymbolIconCurrentScale((empCesium.iconPixelSize * 0.50) + empCesium.iconPixelSize);
                        }
                        if (empCesium.defined(feature._billboards[0]._alignedAxis))
                        {
                            alignedAxis = feature._billboards[0]._alignedAxis;
                        }

                        if (empCesium.defined(feature._billboards[0]._pixelOffset))
                        {
                            pixelOffset = feature._billboards[0]._pixelOffset;
                        }

                        if (empCesium.defined(feature._billboards[0]._verticalOrigin))
                        {
                            verticalOrigin = feature._billboards[0]._verticalOrigin;
                        }

                        if (empCesium.defined(feature._billboards[0]._horizontalOrigin))
                        {
                            horizontalOrigin = feature._billboards[0]._horizontalOrigin;
                        }
                        if (empCesium.defined(feature._billboards[0]._eyeOffset))
                        {
                            eyeOffset = feature._billboards[0]._eyeOffset;

                        }

                        if (empCesium.defined(feature.scaleByDistance))
                        {
                            scaleByDistance = feature.scaleByDistance; //{far: feature.scaleByDistance.far, farValue: feature.scaleByDistance.farValue, near: feature.scaleByDistance.near, nearValue: feature.scaleByDistance.nearValue};
                        }
                    }
                    empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, layer, "editing_" + item.coreId);
                    if (feature.billboard)
                    {
                        iconUrl = feature.billboard.image._value;
                        cartesian = feature.position.getValue(empCesium.viewer.clock.currentTime);
                        heightReference = (empCesium.defined(feature.billboard.heightReference)) ? feature.billboard.heightReference : empCesium.HeightReference.CLAMP_TO_GROUND;

                    }
                    else if (isBillboardCollection)
                    {
                        //**** important - the image in the billboard changes from a canvas to the idetifier (using cached image in texture of collection) , so
                        // when the identifier is sent to the editor it fails to find the id in the texture of the billboard collection inside the editor and it defalts 
                        // to the default emp icon. The fix is to re render to obtain the canvas **** importnt

                        iconUrl = empCesium.getSinglePointBillboardPrimitive([item.originFeature])[0].image;
//                        if (feature._billboards[0]._image)
//                        {
//                            iconUrl = feature._billboards[0]._image; // undefined why??
//                        }
//                        else
//                        {
//                            iconUrl = feature.image;
//                        }
                        cartesian = feature._billboards[0]._position;
                        heightReference = (empCesium.defined(feature._billboards[0].heightReference)) ? feature._billboards[0].heightReference : empCesium.HeightReference.CLAMP_TO_GROUND;
                    }
                    if (feature.isDecluttered)
                    {
                        var endPoint = empCesium.Matrix4.multiplyByPoint(empCesium.viewer.camera.viewMatrix, cartesian, new empCesium.Cartesian3());
                        empCesium.Cartesian3.add(eyeOffset, endPoint, endPoint);
                        empCesium.Matrix4.multiplyByPoint(empCesium.viewer.camera.inverseViewMatrix, endPoint, endPoint);
                        cartesian = endPoint;
                        eyeOffset = undefined;
                    }
                    //if (empCesium.isUrlNotAccessible(feature.billboard.image._value))
                    //{
                    //    iconUrl = emp.utilities.getDefaultIcon().iconUrl;
                    //}
                    empCesium.drawData.coordinates = empCesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);

                    empCesium.drawHelper.startDrawingMarker({
                        callbacks: callbacks,
                        id: "drawing_" + item.coreId,
                        coreId: item.coreId,
                        featureId: item.featureId,
                        overlayId: item.overlayId,
                        heightReference: heightReference,
                        iconUrl: iconUrl,
                        scale: scale,
                        alignedAxis: alignedAxis,
                        scaleByDistance: scaleByDistance,
                        pixelOffset: pixelOffset,
                        eyeOffset: eyeOffset,
                        verticalOrigin: verticalOrigin,
                        horizontalOrigin: horizontalOrigin,
                        position: empCesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian) ///feature.position._value._value || feature.position._value// kml has _value within value_??? OJO due to default icon???, geojson does not.
                    });
                    bIsEditorAvailable = true;
                }
                else if (feature.polyline)
                {
                    empCesium.drawData.isDrawing = false;
                    empCesium.drawData.isEditing = true;
                    empCesium.drawData.geometryType = "LineString";
                    feature.polyline.show = new empCesium.ConstantProperty(false);
                    empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, layer, "editing_" + item.coreId);
                    featurePrimitiveEditable = new DrawHelper.PolylinePrimitive({
                        positions: feature.polyline.positions._value,
                        width: 5, // feature.polyline.width,
                        geodesic: true,
                        id: "drawing_polyshape_id",
                        coreId: item.coreId,
                        featureId: item.featureId,
                        overlayId: item.overlayId
                    });
                    bIsEditorAvailable = true;
                }
                else if (feature.corridor)
                {
                    empCesium.drawData.isDrawing = false;
                    empCesium.drawData.isEditing = true;
                    empCesium.drawData.geometryType = "LineString";
                    feature.corridor.show = new empCesium.ConstantProperty(false);
                    empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, layer, "editing_" + item.coreId);
                    featurePrimitiveEditable = new DrawHelper.PolylinePrimitive({
                        positions: feature.corridor.positions._value,
                        width: 5, // feature.polyline.width,
                        geodesic: true,
                        id: "drawing_polyshape_id",
                        coreId: item.coreId,
                        featureId: item.featureId,
                        overlayId: item.overlayId
                    });
                    bIsEditorAvailable = true;
                }
                else if (feature.polygon)
                {
                    empCesium.drawData.isDrawing = false;
                    empCesium.drawData.isEditing = true;
                    empCesium.drawData.geometryType = "Polygon";
                    feature.polygon.show = new empCesium.ConstantProperty(false);
                    empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, layer, "editing_");
                    featurePrimitiveEditable = new DrawHelper.PolygonPrimitive({
                        positions: feature.polygon.hierarchy._value.positions,
                        //material: empCesium.Material.fromType('Color'),
                        //material: empCesium.Material.fromType('Checkerboard'),
                        geodesic: true,
                        id: "drawing_polyshape_id",
                        coreId: item.coreId,
                        featureId: item.featureId,
                        overlayId: item.overlayId
                    });
                    bIsEditorAvailable = true;
                }
                else if (feature.rectangle)
                {
                    empCesium.drawData.isDrawing = false;
                    empCesium.drawData.isEditing = true;
                    var multiPointObject = empCesium.getMultiPoint(feature.id);
                    if (multiPointObject)
                    {
                        // load the symbol definition table which contains
                        // all the "how-to" drawing information about the symbol
                        // like how many points it takes to render the graphic
                        var basicSymbolId = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(multiPointObject.symbolCode);
                        var standard;
                        if (multiPointObject.properties)
                        {
                            // Rertrieve which standard to use.  '2525b' or '2525c'
                            standard = cesiumEngine.utils.checkSymbolStandard(multiPointObject.properties.modifiers);
                        }
                        if (cesiumEngine.utils.isEmpPrimitive(item.originFeature.format))
                        {
                            item = cesiumEngine.utils.convertEmpPrimitiveItemToMilStandardItem(item, item.originFeature.format); // convert if only if it is a emp primitive
                        }
                        // ***** Important: next handle case where the origin feature does not contain the default modifiers values thta were added by the engine when doing a plot.
                        item.originFeature.properties = multiPointObject.properties;
                        item.properties = multiPointObject.properties;
                        // Retrieve metadata information about the MIL-STD-2525 info about what
                        // we are trying to draw.  We are interested in minimum number and max number
                        // of points allowed by this symbol.
                        var sd = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(basicSymbolId, standard);
                        empCesium.drawData.symbolDef = sd;
                        empCesium.drawData.symbolCode = multiPointObject.symbolCode;
                        empCesium.drawData.standard = standard;
                        //empCesium.drawData.minPoints = sd.minPoints;
                        //empCesium.drawData.maxPoints = sd.maxPoints;
                        empCesium.drawData.drawCategory = sd.drawCategory; //needed to check for routes
                        empCesium.drawData.properties = item.originFeature.properties;
                        empCesium.drawData.id = multiPointObject.id;
                        item.symbolDefTable = sd;
                        var coordCartesianArray = cesiumEngine.utils.convertCoordsDegreesToCartesianArray(multiPointObject);
                        switch (empCesium.drawData.drawCategory)
                        {
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_LINE:
                                empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, layer, "editing_" + item.coreId);
                                featurePrimitiveEditable = new DrawHelper.PolylinePrimitive({
                                    positions: coordCartesianArray,
                                    width: 5, //feature.polyline.width,
                                    geodesic: true,
                                    id: "drawing_polyshape_id",
                                    coreId: item.coreId,
                                    featureId: item.featureId,
                                    overlayId: item.overlayId
                                });
                                if (feature.featureType === EmpCesiumConstants.featureType.ENTITY)
                                {
                                    feature.rectangle.show = new empCesium.ConstantProperty(false);
                                }
                                else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                                {
                                    feature.show = false;
                                }
                                bIsEditorAvailable = true;
                                break;
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_POLYGON:
                                empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, layer, "editing_" + item.coreId);
                                featurePrimitiveEditable = new DrawHelper.PolygonPrimitive({
                                    positions: coordCartesianArray,
                                    //material: empCesium.Material.fromType('Color'),
                                    //material: empCesium.Material.fromType('Checkerboard'),
                                    geodesic: true,
                                    id: "drawing_polyshape_id",
                                    coreId: item.coreId,
                                    featureId: item.featureId,
                                    overlayId: item.overlayId
                                });
                                if (feature.featureType === EmpCesiumConstants.featureType.ENTITY)
                                {
                                    feature.rectangle.show = new empCesium.ConstantProperty(false);
                                }
                                else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                                {
                                    feature.show = false;
                                }
                                bIsEditorAvailable = true;
                                break;
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_3D_AIRSPACE:
                                //result = drawLine(item);
                                break;
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_RANGEFAN_AUTOSHAPE:
                                result = this.drawCategoryCircularRange(item);
                                if (feature.featureType === EmpCesiumConstants.featureType.ENTITY)
                                {
                                    feature.rectangle.show = new empCesium.ConstantProperty(false);
                                }
                                else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                                {
                                    feature.show = false;
                                }
                                bIsEditorAvailable = true;
                                //isAutoShape = true;
                                break;
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_DONOTDRAW:
                                //result = drawLine(item);
                                break;
//                    case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_POINT:
//                        //result = drawLine(item);
//                        break;
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE:
                                // empCesium.drawData.geometryType = "Point";
                                result = this.drawCategoryRectangleParameteredAutoShape(item);
                                if (feature.featureType === EmpCesiumConstants.featureType.ENTITY)
                                {
                                    feature.rectangle.show = new empCesium.ConstantProperty(false);
                                }
                                else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                                {
                                    feature.show = false;
                                }
                                bIsEditorAvailable = true;
                                //isAutoShape = true;
                                break;
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_ROUTE:
                                result = this.drawCategoryRoute(item);
                                if (feature.featureType === EmpCesiumConstants.featureType.ENTITY)
                                {
                                    feature.rectangle.show = new empCesium.ConstantProperty(false);
                                }
                                else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                                {
                                    feature.show = false;
                                }
                                bIsEditorAvailable = true;
                                break;
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_SECTOR_PARAMETERED_AUTOSHAPE:
                                result = this.drawCategorySectorAutoShape(item);
                                if (feature.featureType === EmpCesiumConstants.featureType.ENTITY)
                                {
                                    feature.rectangle.show = new empCesium.ConstantProperty(false);
                                }
                                else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                                {
                                    feature.show = false;
                                }
                                bIsEditorAvailable = true;
                                break;
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_SUPERAUTOSHAPE:
                                if (empCesium.drawData.symbolDef.minPoints === 3)
                                {
                                    result = this.drawCategorySuperAutoShape(item);
                                }
                                if (empCesium.drawData.symbolDef.minPoints === 4)
                                {
                                    result = this.drawCategoryMultiPointLine(item);
                                }
                                if (feature.featureType === EmpCesiumConstants.featureType.ENTITY)
                                {
                                    feature.rectangle.show = new empCesium.ConstantProperty(false);
                                }
                                else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                                {
                                    feature.show = false;
                                }
                                bIsEditorAvailable = true;
                                break;
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_TWOPOINTARROW:
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_TWOPOINTLINE:
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_AUTOSHAPE:
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_ARROW:
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE:
                                if (empCesium.drawData.symbolDef.minPoints === 3)
                                {
                                    result = this.drawCategoryMultiPointLine(item);
                                }
                                else if (empCesium.drawData.symbolDef.minPoints === 4)
                                {
                                    result = this.drawCategoryMultiPointLine(item);
                                }
                                else
                                {
                                    result = this.drawCategoryTwoPointLine(item);
                                }
                                if (feature.featureType === EmpCesiumConstants.featureType.ENTITY)
                                {
                                    feature.rectangle.show = new empCesium.ConstantProperty(false);
                                }
                                else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                                {
                                    feature.show = false;
                                }
                                bIsEditorAvailable = true;
                                break;
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_TWO_POINT_RECT_PARAMETERED_AUTOSHAPE:
                                result = this.drawCategoryTwoPointRectangleParameteredAutoShape(item);
                                if (feature.featureType === EmpCesiumConstants.featureType.ENTITY)
                                {
                                    feature.rectangle.show = new empCesium.ConstantProperty(false);
                                }
                                else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                                {
                                    feature.show = false;
                                }
                                bIsEditorAvailable = true;
                                break;
                            case armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_UNKNOWN:
                                result = this.drawLine(item);
                                if (feature.featureType === EmpCesiumConstants.featureType.ENTITY)
                                {
                                    feature.rectangle.show = new empCesium.ConstantProperty(false);
                                }
                                else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                                {
                                    feature.show = false;
                                }
                                bIsEditorAvailable = true;
                                break;
                        }
                    }
                    else
                    {
                        result.success = false;
                        result.message = "Failed to edit feature.  multiPointObject not found in collection";
                        // result.jsError = err;
                        return result;
                    }
                }
                else if (feature.ellipse)
                {
                    var convertedEmpPrimitiveItemToMilStandardItem;
                    empCesium.drawData.isDrawing = false;
                    empCesium.drawData.isEditing = true;
                    // load the symbol definition table which co586ntains
                    // all the "how-to" drawing information about the symbol
                    // like how many points it takes to render the graphic
                    // Rertrieve which standard to use.  '2525b' or '2525c'
                    standard = '2525c';
                    if (cesiumEngine.utils.isEmpPrimitive(item.originFeature.format))
                    {
                        item.properties = item.originFeature.properties;
                        convertedEmpPrimitiveItemToMilStandardItem = cesiumEngine.utils.convertEmpPrimitiveItemToMilStandardItem(item, item.originFeature.format); // convert if only if it is a emp primitive
                        convertedEmpPrimitiveItemToMilStandardItem.originFeature.properties = convertedEmpPrimitiveItemToMilStandardItem.properties;
                        // convertedEmpPrimitiveItemToMilStandardItem.update = item.update;
                        convertedEmpPrimitiveItemToMilStandardItem.originFeature.data.symbolCode = convertedEmpPrimitiveItemToMilStandardItem.symbolCode;
//                        convertedEmpPrimitiveItemToMilStandardItem.originFeature.properties =  convertedEmpPrimitiveItemToMilStandardItem.properties;
                    }
                    var basicSymbolId = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(convertedEmpPrimitiveItemToMilStandardItem.symbolCode);
                    // ***** Important: next handle case where the origin feature does not contain the default modifiers values thta were added by the engine when doing a plot.
                    //item.originFeature.properties = multiPointObject.properties;
                    // item.properties = multiPointObject.properties;
                    // Retrieve metadata information about the MIL-STD-2525 info about what
                    // we are trying to draw.  We are interested in minimum number and max number
                    // of points allowed by this symbol.
                    var sd = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(basicSymbolId, standard);
                    empCesium.drawData.symbolDef = sd;
                    empCesium.drawData.symbolCode = item.symbolCode;
                    empCesium.drawData.standard = standard;
                    //empCesium.drawData.minPoints = sd.minPoints;
                    //empCesium.drawData.maxPoints = sd.maxPoints;
                    empCesium.drawData.drawCategory = sd.drawCategory;
                    empCesium.drawData.properties = convertedEmpPrimitiveItemToMilStandardItem.properties;
                    empCesium.drawData.id = convertedEmpPrimitiveItemToMilStandardItem.coreId;
                    convertedEmpPrimitiveItemToMilStandardItem.symbolDefTable = sd;
                    convertedEmpPrimitiveItemToMilStandardItem.type = "Point";
                    // var coordCartesianArray = cesiumEngine.utils.convertCoordsDegreesToCartesianArray(convertedEmpPrimitiveItemToMilStandardItem);
                    empCesium.drawData.geometryType = "Point";
                    empCesium.drawData.originFeature = convertedEmpPrimitiveItemToMilStandardItem.originFeature;
                    result = this.drawCategoryRectangleParameteredAutoShape(convertedEmpPrimitiveItemToMilStandardItem);
                    if (feature.featureType === EmpCesiumConstants.featureType.ENTITY)
                    {
                        feature.ellipse.show = new empCesium.ConstantProperty(false);
                    }
                    else if (feature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                    {
                        feature.show = false;
                    }
                    bIsEditorAvailable = true;
                    //isAutoShape = true;
                }
                else if (feature.label)
                {
                    empCesium.drawData.geometryType = "Point";
                    empCesium.drawData.isDrawing = false;
                    empCesium.drawData.isEditing = true;
                    empCesium.drawData.id = item.coreId;
                    empCesium.drawData.overlayId = item.overlayId;
                    empCesium.drawData.isLabel = true;
                    empCesium.drawData.labelText = (empCesium.defined(feature.label.text)) ? feature.label.text.getValue() : undefined;
                    empCesium.drawData.labelPixelOffset = (empCesium.defined(feature.label.pixelOffset)) ? feature.label.pixelOffset.getValue() : undefined;
                    empCesium.drawData.labelFont = (empCesium.defined(feature.label.font)) ? feature.label.font.getValue() : undefined;
                    empCesium.drawData.labelStyle = (empCesium.defined(feature.label.style)) ? feature.label.style.getValue() : undefined;
                    empCesium.drawData.LabelFillColor = (empCesium.defined(feature.label.fillColor)) ? feature.label.fillColor.getValue() : undefined;
                    empCesium.drawData.labelOutLineColor = (empCesium.defined(feature.label.outLineColor)) ? feature.label.outLineColor.getValue() : undefined;
                    empCesium.drawData.labelOutLineWidth = (empCesium.defined(feature.label.outLineWidth)) ? feature.label.outLineWidth.getValue() : undefined;
                    empCesium.drawData.labelHorizontalOrigin = (empCesium.defined(feature.label.horizontalOrigin)) ? feature.label.horizontalOrigin.getValue() : undefined;
                    empCesium.drawData.labelVerticalOrigin = (empCesium.defined(feature.label.verticalOriginOrigin)) ? feature.label.verticalOriginOrigin.getValue() : empCesium.VerticalOrigin.CENTER;
                    empCesium.drawData.labelScale = (empCesium.defined(feature.label.scale)) ? feature.label.scale.getValue() : undefined;
                    empCesium.drawData.labelTranslucencyByDistance = (empCesium.defined(feature.label.translucencyByDistance)) ? feature.label.translucencyByDistance.getValue() : undefined;
                    empCesium.drawData.properties = item.originFeature.properties;
                    callbacks.dragHandlers = {};
                    callbacks.onDrawStart = function (data)
                    {
                        empCesium.drawData.coordinates = data.positions;
                        var oGeoJsonCoord = {
                            type: empCesium.drawData.geometryType,
                            coordinates: cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: empCesium.drawData.geometryType, coordinates: data.positions})
                        };
                        var oProperties = emp.helpers.copyObject(empCesium.drawData.properties);
                        var oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                            type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                            indices: data.indices
                        });
                        oUpdateData.convertFromGeoJson(oGeoJsonCoord);
                        if (oProperties && oProperties.hasOwnProperty('modifiers'))
                        {
                            var oModifiers = emp.typeLibrary.utils.milstd.convertModifiersToStrings(oProperties.modifiers);
                            oProperties.modifiers = oModifiers;
                        }

                        item.update({
                            name: empCesium.drawData.name,
                            updates: oUpdateData,
                            properties: oProperties,
                            updateEventType: emp.typeLibrary.UpdateEventType.START,
                            mapInstanceId: empCesium.empMapInstance.mapInstanceId
                        });
                    };
                    callbacks.onDrawComplete = function (data)
                    {
                        empCesium.drawData.coordinates = data.positions;
                        empCesium.editorController.stopEditFeature()
                        empCesium.drawData = {};
                    };
                    callbacks.dragHandlers.onDrag = function (data)
                    {
                        empCesium.drawData.coordinates = data.positions;
                    };
                    callbacks.dragHandlers.onDragEnd = function (data)
                    {
                        empCesium.drawData.coordinates = data.positions;
                        var format = undefined;
                        if (empCesium.drawData.originFeature && empCesium.drawData.originFeature.format)
                        {
                            format = empCesium.drawData.originFeature.format;
                        }
                        var oPositions = empCesium.drawData.coordinates; // cartographic array
                        oPositions = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: empCesium.drawData.geometryType, coordinates: oPositions});
                        var oGeoJsonCoord = {
                            type: empCesium.drawData.geometryType,
                            coordinates: (oPositions ? oPositions : [])
                        };
                        var oProperties = emp.helpers.copyObject(empCesium.drawData.properties);
                        var oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                            type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                            indices: data.indices
                        });
                        oUpdateData.convertFromGeoJson(oGeoJsonCoord);
                        empCesium.drawData.item.update({
                            name: empCesium.drawData.name,
                            updates: oUpdateData,
                            properties: oProperties,
                            updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                            mapInstanceId: empCesium.empMapInstance.mapInstanceId
                        });
                    };
                    var iconUrl;
                    var cartesian;
                    var scale;
                    var pixelOffset;
                    var alignedAxis;
                    var scaleByDistance;
                    var verticalOrigin;
                    var horizontalOrigin;
                    var eyeOffset;
                    if (feature.label)
                    {
                        feature.label.show = new empCesium.ConstantProperty(false);
                    }
                    if (feature.polyline)
                    {
                        feature.polyline.show = new empCesium.ConstantProperty(false);
                    }
                    if (feature.corridor)
                    {
                        feature.corridor.show = new empCesium.ConstantProperty(false);
                    }
                    feature.show = new empCesium.ConstantProperty(false); // entity
                    if (feature.label.scale)
                    {
                        scale = feature.label.scale._value;
                    }
                    else
                    {
                        scale = cesiumEngine.utils.getSymbolIconCurrentScale(empCesium.iconPixelSize)
                    }
//                        if (empCesium.defined(feature.billboard.alignedAxis))
//                        {
//                            alignedAxis = feature.billboard.alignedAxis.getValue();
//                        }
                    if (empCesium.defined(feature.label.pixelOffset))
                    {
                        pixelOffset = feature.label.pixelOffset;
                    }
//                        if (empCesium.defined(feature.label.verticalOrigin))
//                        {
//                            verticalOrigin = feature.label.verticalOrigin.getValue();
//                        }
//                        if (empCesium.defined(feature.label.horizontalOrigin))
//                        {
//                            horizontalOrigin = feature.label.horizontalOrigin.getValue();
//                        }
//                        if (empCesium.defined(feature.label.eyeOffset))
//                        {
//                            eyeOffset = feature.label.eyeOffset.getValue();
//                        }
//                        if (empCesium.defined(feature.billboard.scaleByDistance))
//                        {
//                            scaleByDistance = feature.billboard.scaleByDistance.getValue();//{far: feature.scaleByDistance.getValue().far, farValue: feature.scaleByDistance.getValue().farValue, near: feature.scaleByDistance.getValue().near, nearValue: feature.scaleByDistance.getValue().nearValue};
//
//                        }


                    empCesium.drawHelper = new DrawHelper(empCesium.viewer, empCesium, layer, "editing_" + item.coreId);
                    iconUrl = empCesium.relativeBaseURL + "js/lib/cesium/editors/images/blueHandle24.png";
                    cartesian = feature.position.getValue(empCesium.viewer.clock.currentTime);
                    empCesium.drawData.coordinates = empCesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
                    empCesium.drawHelper.startDrawingMarker({
                        callbacks: callbacks,
                        id: "drawing_" + item.coreId,
                        coreId: item.coreId,
                        featureId: item.featureId,
                        overlayId: item.overlayId,
                        iconUrl: iconUrl,
                        scale: scale,
                        alignedAxis: alignedAxis,
                        scaleByDistance: scaleByDistance,
                        pixelOffset: pixelOffset,
                        eyeOffset: eyeOffset,
                        verticalOrigin: verticalOrigin,
                        horizontalOrigin: horizontalOrigin,
                        position: empCesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian) ///feature.position._value._value || feature.position._value// kml has _value within value_??? OJO due to default icon???, geojson does not.
                    });
                    bIsEditorAvailable = true;
                }
                if (featurePrimitiveEditable)
                {
                    empCesium.primitives.add(featurePrimitiveEditable);
                    featurePrimitiveEditable.setEditable();
                    featurePrimitiveEditable.addListener('onEditStart', function (data)
                    {
                        var format = undefined;
                        if (empCesium.drawData.originFeature && empCesium.drawData.originFeature.format)
                        {
                            format = empCesium.drawData.originFeature.format;
                        }
                        empCesium.drawData.coordinates = data.positions;
                        var oPositions = empCesium.drawData.coordinates; // cartographic array
                        oPositions = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: empCesium.drawData.geometryType, coordinates: oPositions});
                        var oGeoJsonCoord = {
                            type: empCesium.drawData.geometryType,
                            coordinates: (oPositions ? oPositions : [])
                        };
                        var oProperties = emp.helpers.copyObject(empCesium.drawData.properties);
                        var oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                            type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                            indices: data.indices
                        });
                        oUpdateData.convertFromGeoJson(oGeoJsonCoord);
                        empCesium.drawData.item.update({
                            name: empCesium.drawData.name,
                            updates: oUpdateData,
                            properties: oProperties,
                            updateEventType: emp.typeLibrary.UpdateEventType.START,
                            mapInstanceId: empCesium.empMapInstance.mapInstanceId
                        });
                    });
                    featurePrimitiveEditable.addListener('onEdited', function (data)
                    {
                        var format = undefined;
                        if (empCesium.drawData.originFeature && empCesium.drawData.originFeature.format)
                        {
                            format = empCesium.drawData.originFeature.format;
                        }
                        empCesium.drawData.coordinates = data.positions;
                        var oPositions = empCesium.drawData.coordinates; // cartographic array
                        oPositions = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({type: empCesium.drawData.geometryType, coordinates: oPositions});
                        var oGeoJsonCoord = {
                            type: empCesium.drawData.geometryType,
                            coordinates: (oPositions ? oPositions : [])
                        };
                        var oProperties = emp.helpers.copyObject(empCesium.drawData.properties);
                        var oUpdateData = new emp.typeLibrary.CoordinateUpdate({
                            type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                            indices: data.indices
                        });
                        oUpdateData.convertFromGeoJson(oGeoJsonCoord);
                        empCesium.drawData.item.update({
                            name: empCesium.drawData.name,
                            updates: oUpdateData,
                            properties: oProperties,
                            updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
                            mapInstanceId: empCesium.empMapInstance.mapInstanceId
                        });
                    });
                    featurePrimitiveEditable.addListener('onEditEnd', function (event)
                    {
                        empCesium.drawData.coordinates = event.positions;
                        this.stopEditFeature();
                        empCesium.drawData = {};
                    }.bind(this));
                    featurePrimitiveEditable.setEditMode(true);
                    empCesium.drawData.primitive = featurePrimitiveEditable;
                }
                if (!bIsEditorAvailable)
                {
                    // do nothing. The shape is already in draw mode
                    result.success = false;
                    result.message = "Failed to edit feature. Editor does not support the edit of this feature.";
                    result.jsError = "";
                    return result;
                }
            }
        }
        catch (err)
        {
            result.success = false;
            result.message = "Failed to edit feature";
            result.jsError = err;
            if (Cesium.defined(empCesium.drawHelper) && empCesium.drawHelper !== null)
            {
                empCesium.drawHelper.stopDrawing();
                empCesium.drawHelper.destroy();
                empCesium.drawHelper = null;
            }
            //todo - handle airspaces, and multipoints to make sure the edit mode shapes are removed from the map.
            if (empCesium.drawData.editingFeature.billboard)
                empCesium.drawData.editingFeature.billboard.show = new empCesium.ConstantProperty(true);
            if (empCesium.drawData.editingFeature.polyline)
                empCesium.drawData.editingFeature.polyline.show = new empCesium.ConstantProperty(true);
            if (empCesium.drawData.editingFeature.corridor)
                empCesium.drawData.editingFeature.corridor.show = new empCesium.ConstantProperty(true);
            if (empCesium.drawData.editingFeature.rectangle)
            {
                if (empCesium.drawData.editingFeature.featureType === EmpCesiumConstants.featureType.ENTITY)
                {
                    empCesium.drawData.editingFeature.rectangle.show = new empCesium.ConstantProperty(true);
                }
                else if (empCesium.drawData.editingFeature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                {
                    empCesium.drawData.editingFeature.show = true;
                }
            }
            if (empCesium.drawData.editingFeature.polygon)
                empCesium.drawData.editingFeature.polygon.show = new empCesium.ConstantProperty(true);
        }

        return result;
    };
    this.stopEditFeature = function ()
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        },
        hashedAirspaceCopy,
                positionsEmpLatLonObjectArray = undefined,
                transaction,
                eventType;
        try
        {
            if (!empCesium.drawData)
            {
                result.success = false;
                result.message = "Error ending feature edit";
                result.jsError = "";
                return result;
            }
            transaction = empCesium.drawData.transaction;
            eventType = "update";
            //process airspace
            if (empCesium.drawData.isAirspace && empCesium.drawData.airspace)
            {
                var hashedAirspace = empCesium.getAirspace(empCesium.drawData.airspace.Id);
                hashedAirspaceCopy = emp.helpers.copyObject(hashedAirspace);
                if (empCesium.drawData.properties)
                {
                    hashedAirspaceCopy.properties = emp.helpers.copyObject(empCesium.drawData.properties);
                }

                empCesium.storeAirspace(hashedAirspaceCopy);
                empCesium.transferTaisAirspaceToDrawData(empCesium.drawData.airspace, empCesium.drawData);
            }
            if (empCesium.drawData.geometryType === "Point" && empCesium.drawData.coordinates)
            {
                positionsEmpLatLonObjectArray = cesiumEngine.utils.convertCartographicArrayToArrayOfObjectsInDegrees({"type": "Point", "coordinates": empCesium.drawData.coordinates});
            }
            else if (empCesium.drawData.geometryType === "LineString" && empCesium.drawData.coordinates)
            {
                positionsEmpLatLonObjectArray = cesiumEngine.utils.convertCartographicArrayToArrayOfObjectsInDegrees({"type": "LineString", "coordinates": empCesium.drawData.coordinates});
            }
            else if (empCesium.drawData.geometryType === "Polygon" && empCesium.drawData.coordinates)
            {
                positionsEmpLatLonObjectArray = cesiumEngine.utils.convertCartographicArrayToArrayOfObjectsInDegrees({"type": "Polygon", "coordinates": empCesium.drawData.coordinates});
            }
            else
            {
                result.success = false;
                result.message = "Error ending feature edit. geometryType not supported ";
                result.jsError = "";
                return result;
            }
            if (positionsEmpLatLonObjectArray)
            {
                // there are modifications
                //var indexArray = [];
                //for (var index = 0; index < positionsEmpLatLonObjectArray.length; index++)
                // {
                //      indexArray.push(index);
                //   }
                var updates = {
                    type: eventType,
                    indices: [],
                    coordinates: positionsEmpLatLonObjectArray
                };
                if (empCesium.drawData.isAirspace && empCesium.drawData.airspace && empCesium.drawData.airspace.empArg && empCesium.drawData.airspace.empArg.originalFeatureItem)
                {
                    //originalFeatureItem is undefined when the shape edited is not a mil std 3D.
                    //transform back to mil std 3d  transformAirspace3DDrawDataToMilStd3DDrawData
                    empCesium.drawData = cesiumEngine.utils.transformAirspace3DDrawDataToMilStd3DDrawData(empCesium.drawData);
                }
                transaction.items[0].update({
                    name: transaction.items[0].originFeature.name,
                    properties: (cesiumEngine.utils.isEmpPrimitive(empCesium.drawData.originFeature.format)) ? cesiumEngine.utils.convertMilStandardPropertiesToEmpPrimitiveProperties(empCesium.drawData.properties, empCesium.drawData.originFeature.format) : empCesium.drawData.properties,
                    updateEventType: emp.typeLibrary.UpdateEventType.COMPLETE,
                    updates: updates,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
                //publish the edit end event
                new empCesium.empMapInstance.eventing.EditEnd({
                    transaction: transaction
                });
                transaction.run();
                var isBillboardCollection = (empCesium.drawData.editingFeature.featureType === EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION) ? true : false;
                if (empCesium.drawData.primitive && empCesium.primitives.contains(empCesium.drawData.primitive))
                {
                    empCesium.drawData.primitive.setEditMode(false);
                    empCesium.primitives.remove(empCesium.drawData.primitive);
                    empCesium.drawData.primitive = undefined;
                    empCesium.drawHelper.destroy();
                    empCesium.drawHelper = undefined;
                }
                if (empCesium.drawData.editingFeature.billboard || isBillboardCollection)
                {
                    empCesium.drawHelper.stopDrawing();
                    if (empCesium.drawData.coordinates instanceof Array && empCesium.drawData.coordinates.length > 0)
                    {
                        empCesium.drawData.editingFeature.position = new empCesium.ConstantPositionProperty(empCesium.Ellipsoid.WGS84.cartographicToCartesian(empCesium.drawData.coordinates[0]), empCesium.ReferenceFrame.FIXED);
                    }
                    else if (empCesium.drawData.coordinates && empCesium.drawData.editingFeature.position)
                    {
                        empCesium.drawData.editingFeature.position = new empCesium.ConstantPositionProperty(empCesium.Ellipsoid.WGS84.cartographicToCartesian(empCesium.drawData.coordinates), empCesium.ReferenceFrame.FIXED);
                    }

                    if (empCesium.drawData.coordinates && isBillboardCollection)
                    {
                        empCesium.drawData.editingFeature._billboards[0].position = empCesium.Ellipsoid.WGS84.cartographicToCartesian(empCesium.drawData.coordinates);
                        empCesium.drawData.editingFeature.coordinates = [empCesium.drawData.coordinates.longitude.toDeg(), empCesium.drawData.coordinates.latitude.toDeg(), empCesium.drawData.coordinates.height];
                        var isSinglePointPresent = empCesium.isSinglePointPresent(empCesium.drawData.id);
                        if (isSinglePointPresent)
                        {
                            //update hashed single point object with new position
                            var singlePointObject = empCesium.getSinglePoint(empCesium.drawData.id);
                            singlePointObject.coordinates = empCesium.drawData.editingFeature.coordinates;
                        }
                    }

                    if (isBillboardCollection)
                    {
                        if (empCesium.defined(empCesium.drawData.clutteredEyeOffset))
                        {
                            empCesium.drawData.editingFeature.get(0).eyeOffset = empCesium.drawData.clutteredEyeOffset;
                        }
                        empCesium.drawData.editingFeature._billboards[0].show = true;
                    }
                    else
                    {
                        //entity billboard
                        if (empCesium.defined(empCesium.drawData.clutteredEyeOffset))
                        {
                            empCesium.drawData.editingFeature.billboard.eyeOffset = empCesium.drawData.clutteredEyeOffset;
                        }
                        empCesium.drawData.editingFeature.show = new empCesium.ConstantProperty(true);
                        empCesium.drawData.editingFeature.billboard.show = new empCesium.ConstantProperty(true);
                        //empCesium.drawData.editingFeature.billboard.show = new empCesium.ConstantProperty(true); todo - pedestal disabled for the moment
                    }

                    if (empCesium.drawData.editingFeature.label)
                    {
                        empCesium.drawData.editingFeature.label.show = new empCesium.ConstantProperty(true);
                    }
                    if (empCesium.drawData.editingFeature.polyline)
                    {
                        //pedestal
                        var groundPosition = undefined;
                        var position = undefined;
                        if (empCesium.drawData.coordinates instanceof Array)
                        {
                            groundPosition = empCesium.Ellipsoid.WGS84.cartographicToCartesian(new empCesium.Cartographic(empCesium.drawData.coordinates[0].longitude, empCesium.drawData.coordinates[0].latitude, 0));
                            position = empCesium.Ellipsoid.WGS84.cartographicToCartesian(empCesium.drawData.coordinates[0]);
                        }
                        else
                        {
                            groundPosition = empCesium.Ellipsoid.WGS84.cartographicToCartesian(new empCesium.Cartographic(empCesium.drawData.coordinates.longitude, empCesium.drawData.coordinates.latitude, 0));
                            position = empCesium.Ellipsoid.WGS84.cartographicToCartesian(empCesium.drawData.coordinates);
                        }
                        var positions = new empCesium.PositionPropertyArray([new empCesium.ConstantPositionProperty(groundPosition), new empCesium.ConstantPositionProperty(position)]);
                        empCesium.drawData.editingFeature.polyline.positions = positions;
                        empCesium.drawData.editingFeature.polyline.show = new empCesium.ConstantProperty(true);
                    }
                }
                else if (empCesium.drawData.editingFeature.polyline)
                {
                    empCesium.drawData.editingFeature.polyline.positions.setValue(Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(empCesium.drawData.coordinates));
                    empCesium.drawData.editingFeature.polyline.show = new empCesium.ConstantProperty(true);
                }
                else if (empCesium.drawData.editingFeature.corridor)
                {
                    empCesium.drawData.editingFeature.corridor.positions.setValue(Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(empCesium.drawData.coordinates));
                    empCesium.drawData.editingFeature.corridor.show = new empCesium.ConstantProperty(true);
                }
                else if (empCesium.drawData.editingFeature.polygon)
                {
                    empCesium.drawData.editingFeature.polygon.hierarchy._value.positions = empCesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(empCesium.drawData.coordinates);
                    empCesium.drawData.editingFeature.polygon.show = new empCesium.ConstantProperty(true);
                }
                else if ((empCesium.drawData.editingFeature.rectangle && empCesium.drawData.originFeature.format === "milstd") ||
                        cesiumEngine.utils.isEmpPrimitive(empCesium.drawData.originFeature.format))
                {
                    var geojsonDegrees = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({"type": empCesium.drawData.geometryType, "coordinates": empCesium.drawData.coordinates});
//                    if (empCesium.drawData.originFeature.format === emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE || empCesium.drawData.originFeature.format === emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE)
//                    {
//                        // editing 
//                        if (empCesium.drawData.originFeature.format === emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE)
//                        {
//                            empCesium.drawData.editingFeature.ellipse.semiMajorAxis = empCesium.drawData.properties.modifiers.distance[1];
//                            empCesium.drawData.editingFeature.ellipse.semiMinorAxis = empCesium.drawData.properties.modifiers.distance[0];
//                            empCesium.drawData.editingFeature.ellipse.rotation = -empCesium.drawData.properties.modifiers.azimuth[0].toRad();
//                        }
//                        else
//                        {
//                            empCesium.drawData.editingFeature.ellipse.semiMajorAxis = empCesium.drawData.properties.modifiers.distance[1];
//                            empCesium.drawData.editingFeature.ellipse.semiMinorAxis = empCesium.drawData.properties.modifiers.distance[0];
//                        }
//                        if (empCesium.drawData.coordinates instanceof Array && empCesium.drawData.coordinates.length > 0)
//                        {
//                            empCesium.drawData.editingFeature.position = new empCesium.ConstantPositionProperty(empCesium.Ellipsoid.WGS84.cartographicToCartesian(empCesium.drawData.coordinates[0]), empCesium.ReferenceFrame.FIXED);
//                        }
//                        else if (empCesium.drawData.coordinates && empCesium.drawData.editingFeature.position)
//                        {
//                            empCesium.drawData.editingFeature.position = new empCesium.ConstantPositionProperty(empCesium.Ellipsoid.WGS84.cartographicToCartesian(empCesium.drawData.coordinates), empCesium.ReferenceFrame.FIXED);
//                        }
//                        //entity billboard
//                        empCesium.drawData.editingFeature.ellipse.show = new empCesium.ConstantProperty(true);
//                    }
//                    else
//                    {
                        var milstdObject = empCesium.multiPointCollection[empCesium.drawData.editingFeature.id];
                        milstdObject.coordinates = geojsonDegrees;
                        milstdObject.data.coordinates = geojsonDegrees;
                        if (empCesium.drawData.properties)
                        {
                            empCesium.drawData.properties.modifiers.standard = milstdObject.properties.modifiers.standard;
                            milstdObject.properties = emp.helpers.copyObject(empCesium.drawData.properties);
                        }
                        empCesium.addSymbolMulti([milstdObject]); // to solve refresh issue
                   // }


                    if ( (empCesium.drawData.editingFeature.featureType === EmpCesiumConstants.featureType.ENTITY) && empCesium.defined(empCesium.drawData.editingFeature.rectangle) )
                    {
                        empCesium.drawData.editingFeature.rectangle.show = true; //new empCesium.ConstantProperty(true);
                    }
                    else if (empCesium.drawData.editingFeature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                    {
                        empCesium.drawData.editingFeature.show = true;
                    }
                }
                else if (empCesium.drawData.editingFeature.rectangle)
                {
                    //to do @@
                    // empCesium.drawData.editingFeature.rectangle.hierarchy._value.positions = empCesium.drawData.coordinates;
                    // empCesium.drawData.editingFeature.rectangle.show = new empCesium.ConstantProperty(true);
                }
                else if (empCesium.drawData.isAirspace)
                {
                    var layer = empCesium.getLayer(empCesium.drawData.overlayId);
                    if (layer)
                    {
                        //var hashedAirspace = empCesium.getAirspace(empCesium.drawData.airspace.Id);
                        //var hashedAirspaceCopy = emp.helpers.copyObject(hashedAirspace);

                        layer.removeFeature(empCesium.drawData.editingFeature);
                        empCesium.mapCntrl.getMapCntrl(TAIS_DATA_TYPE.AIRSPACE).addAirspace(empCesium.drawData.airspace);
                        // update hsh airspace hash
                        var geojsonDegrees = cesiumEngine.utils.convertCartographicCoordinatesToGeojsonDegrees({"type": empCesium.drawData.geometryType, "coordinates": empCesium.drawData.coordinates});
                        hashedAirspaceCopy.coordinates = geojsonDegrees;
                        if (hashedAirspaceCopy.data)
                        {
                            hashedAirspaceCopy.data.coordinates = geojsonDegrees;
                        }
                        empCesium.storeAirspace(hashedAirspaceCopy);
                        var airspaceLabelPresent = empCesium.isMultiPointPresent(empCesium.drawData.airspace.Id + "_label");
                        if (airspaceLabelPresent)
                        {
                            var airspaceLabel = layer.getFeature(empCesium.drawData.airspace.Id + "_label");
                            if (airspaceLabel && empCesium.drawData.airspace && empCesium.drawData.airspace.AirspaceLegs && empCesium.drawData.airspace.AirspaceLegs.length > 0 && empCesium.drawData.airspace.AirspaceLegs[0].AltitudeRange)
                            {
                                //apdate label
                                var extrudedHeight = 0;
                                for (var index = 0; index < empCesium.drawData.airspace.AirspaceLegs.length; index++)
                                {
                                    //get highest altitude from all legs
                                    if (empCesium.drawData.airspace.AirspaceLegs[index].AltitudeRange)
                                    {
                                        if (empCesium.drawData.airspace.AirspaceLegs[index].AltitudeRange.UpperAltitude > extrudedHeight)
                                        {
                                            extrudedHeight = empCesium.drawData.airspace.AirspaceLegs[index].AltitudeRange.UpperAltitude;
                                        }
                                    }
                                }
                                airspaceLabel.rectangle.height = extrudedHeight + 1;
                                var multipointLabel = empCesium.multiPointCollection[airspaceLabel.id];
                                multipointLabel.extrudedHeight = extrudedHeight;
                                multipointLabel.coordinates = emp.helpers.copyObject(hashedAirspaceCopy.coordinates);
                                multipointLabel.data.coordinates = emp.helpers.copyObject(hashedAirspaceCopy.coordinates);
                                multipointLabel.properties = emp.helpers.copyObject(empCesium.drawData.properties);
                                empCesium.addSymbolMulti([multipointLabel]);
                            }
                            if (airspaceLabel)
                            {
                                airspaceLabel.show = true;
                            }

                        }

                        empCesium.airspaceDrawHandler.finishDraw();
                    }
                }
                if (empCesium.drawData.editingFeature.label)
                {
                    empCesium.drawHelper.stopDrawing();
                    if (empCesium.drawData.coordinates instanceof Array && empCesium.drawData.coordinates.length > 0)
                    {
                        empCesium.drawData.editingFeature.position = new empCesium.ConstantPositionProperty(empCesium.Ellipsoid.WGS84.cartographicToCartesian(empCesium.drawData.coordinates[0]), empCesium.ReferenceFrame.FIXED);
                    }
                    else if (empCesium.drawData.coordinates && empCesium.drawData.editingFeature.position)
                    {
                        empCesium.drawData.editingFeature.position = new empCesium.ConstantPositionProperty(empCesium.Ellipsoid.WGS84.cartographicToCartesian(empCesium.drawData.coordinates), empCesium.ReferenceFrame.FIXED);
                    }
                    //entity billboard
                    empCesium.drawData.editingFeature.show = new empCesium.ConstantProperty(true);
                    empCesium.drawData.editingFeature.label.show = new empCesium.ConstantProperty(true);
                    if (empCesium.drawData.editingFeature.polyline)
                    {
                        //pedestal
                        var groundPosition = undefined;
                        var position = undefined;
                        if (empCesium.drawData.coordinates instanceof Array)
                        {
                            groundPosition = empCesium.Ellipsoid.WGS84.cartographicToCartesian(new empCesium.Cartographic(empCesium.drawData.coordinates[0].longitude, empCesium.drawData.coordinates[0].latitude, 0));
                            position = empCesium.Ellipsoid.WGS84.cartographicToCartesian(empCesium.drawData.coordinates[0]);
                        }
                        else
                        {
                            groundPosition = empCesium.Ellipsoid.WGS84.cartographicToCartesian(new empCesium.Cartographic(empCesium.drawData.coordinates.longitude, empCesium.drawData.coordinates.latitude, 0));
                            position = empCesium.Ellipsoid.WGS84.cartographicToCartesian(empCesium.drawData.coordinates);
                        }
                        var positions = new empCesium.PositionPropertyArray([new empCesium.ConstantPositionProperty(groundPosition), new empCesium.ConstantPositionProperty(position)]);
                        empCesium.drawData.editingFeature.polyline.positions = positions;
                        empCesium.drawData.editingFeature.polyline.show = new empCesium.ConstantProperty(true);
                    }
                }
                if (Cesium.defined(empCesium.drawHelper))
                {
                    // case of autoshape  editing
                    empCesium.drawHelper.stopDrawing();
                    empCesium.drawHelper.destroy();
                    empCesium.drawHelper = null;
                }
            }
            else
            {
                // feature was not edited. The editor only populates the draedata.coordinates when there is a change.
                var updates = {
                    type: eventType,
                    indices: [],
                    coordinates: []
                };
                transaction.items[0].update({
                    name: transaction.items[0].originFeature.name,
                    properties: empCesium.drawData.properties,
                    complete: true,
                    updates: updates,
                    mapInstanceId: empCesium.empMapInstance.mapInstanceId
                });
                //publish the edit  end event
                new empCesium.empMapInstance.eventing.EditEnd({
                    transaction: transaction
                });
                transaction.run();
                if (empCesium.primitives.contains(empCesium.drawData.primitive))
                {
                    empCesium.drawData.primitive.setEditMode(false);
                    empCesium.primitives.remove(empCesium.drawData.primitive);
                    empCesium.drawData.primitive = undefined;
                    empCesium.drawHelper.stopDrawing();
                    empCesium.drawHelper.destroy();
                    empCesium.drawHelper = undefined;
                }
                if (empCesium.drawData.editingFeature.billboard)
                {
                    empCesium.drawData.editingFeature.billboard.show = new empCesium.ConstantProperty(true);
                }
                else if (empCesium.drawData.editingFeature.polyline)
                {
                    empCesium.drawData.editingFeature.polyline.show = new empCesium.ConstantProperty(true);
                }
                else if (empCesium.drawData.editingFeature.corridor)
                {
                    empCesium.drawData.editingFeature.corridor.show = new empCesium.ConstantProperty(true);
                }
                else if (empCesium.drawData.editingFeature.polygon)
                {
                    empCesium.drawData.editingFeature.polygon.show = new empCesium.ConstantProperty(true);
                }
                empCesium.drawData.editingFeature = undefined;
                empCesium.drawData.primitive = undefined;
            }
            empCesium.drawData.transaction = undefined;
        }
        catch (ex)
        {
            result.success = false;
            result.message = "Error ending feature edit";
            result.jsError = ex;
        }
        return result;
    };
    this.cancelEditFeature = function ()
    {
        var result = {
            success: true,
            message: "",
            jsError: ""
        };
        try
        {
            if (!empCesium.drawData)
            {
                result.success = false;
                result.message = "Error ending feature edit. empCesium.drawData is undefined";
                return result;
            }
            if (empCesium.drawData.isAirspace && empCesium.drawData.airspace)
            {
                empCesium.transferTaisAirspaceToDrawData(empCesium.drawData.airspace, empCesium.drawData);
                empCesium.airspaceDrawHandler.finishDraw();
                empCesium.drawData.editingFeature.show = true;
                var airspaceLabelPresent = empCesium.isMultiPointPresent(empCesium.drawData.airspace.Id + "_label");
                if (airspaceLabelPresent)
                {
                    var airspaceLabel = empCesium.getFeature(empCesium.drawData.airspace.Id + "_label");
                    if (airspaceLabel)
                    {
                        airspaceLabel.show = true;
                    }
                }
            }
            else if (empCesium.drawData.primitive && empCesium.primitives.contains(empCesium.drawData.primitive))
            {
                //polyline or polygon
                empCesium.drawData.primitive.setEditMode(false);
                empCesium.primitives.remove(empCesium.drawData.primitive);
                empCesium.drawData.primitive = undefined;
                if (empCesium.drawData.editingFeature.billboard)
                {
                    empCesium.drawHelper.stopDrawing();
                    empCesium.drawHelper.destroy();
                    empCesium.drawHelper = undefined;
                    empCesium.drawData.editingFeature.billboard.show = new empCesium.ConstantProperty(true);
                }
                if (empCesium.drawData.editingFeature.polyline)
                {
                    empCesium.drawData.editingFeature.polyline.show = new empCesium.ConstantProperty(true);
                }
                if (empCesium.drawData.editingFeature.corridor)
                {
                    empCesium.drawData.editingFeature.corridor.show = new empCesium.ConstantProperty(true);
                }
                if (empCesium.drawData.editingFeature.polygon)
                {
                    empCesium.drawData.editingFeature.polygon.show = new empCesium.ConstantProperty(true);
                }
                if (empCesium.drawData.editingFeature.rectangle)
                {
                    if (empCesium.drawData.editingFeature.featureType === EmpCesiumConstants.featureType.ENTITY)
                    {
                        empCesium.drawData.editingFeature.rectangle.show = new empCesium.ConstantProperty(true);
                    }
                    else if (empCesium.drawData.editingFeature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                    {
                        empCesium.drawData.editingFeature.show = true;
                    }
                }
            }
            else if (empCesium.drawData.editingFeature.rectangle)
            {
                //multipoint
                empCesium.drawHelper.stopDrawing();
                empCesium.drawHelper.destroy();
                empCesium.drawHelper = undefined;
                if (empCesium.drawData.editingFeature.featureType === EmpCesiumConstants.featureType.ENTITY)
                {
                    empCesium.drawData.editingFeature.rectangle.show = true;
                    empCesium.viewer.dataSourceDisplay.update(empCesium.JulianDate.fromDate(new Date()));
                }
                else if (empCesium.drawData.editingFeature.featureType === EmpCesiumConstants.featureType.PRIMITIVE)
                {
                    empCesium.drawData.editingFeature.show = true;
                    empCesium.viewer.dataSourceDisplay.update(empCesium.JulianDate.fromDate(new Date()));
                }
            }
            else if (empCesium.drawData.editingFeature.billboard)
            {
                empCesium.drawHelper.stopDrawing();
                empCesium.drawHelper.destroy();
                if (empCesium.defined(empCesium.drawData.clutteredEyeOffset))
                {
                    empCesium.drawData.editingFeature.billboard.eyeOffset = empCesium.drawData.clutteredEyeOffset;
                }
                empCesium.drawData.editingFeature.billboard.show = new empCesium.ConstantProperty(true);
                if (empCesium.drawData.editingFeature.label)
                {
                    empCesium.drawData.editingFeature.label.show = new empCesium.ConstantProperty(true);
                }
                if (empCesium.drawData.editingFeature.polyline)
                {
                    empCesium.drawData.editingFeature.polyline.show = new empCesium.ConstantProperty(true);
                }
            }
            else if (empCesium.drawData.editingFeature.featureType === EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION)
            {
                empCesium.drawHelper.stopDrawing();
                empCesium.drawHelper.destroy();
                if (empCesium.drawData.editingFeature.length > 0)
                {
                    if (!empCesium.defined(empCesium.drawData.editingFeature.get(0)._image))
                    {
                        // sometimes te image is lost. Use the backup from the primitive collection.
                        empCesium.drawData.editingFeature.get(0)._image = empCesium.drawData.editingFeature.image;
                    }
                    if (empCesium.defined(empCesium.drawData.clutteredEyeOffset))
                    {
                        empCesium.drawData.editingFeature.get(0).eyeOffset = empCesium.drawData.clutteredEyeOffset;
                    }

                    var singlePointObject = empCesium.getSinglePoint(empCesium.drawData.id);
                    // get last position from hashed single point. Sometimes the position is getting altered when cancelling the editing and I haven't found the reason why. Getting
                    // the position fro the hashed object should avoid the altering from happeing when cancellng.
                    empCesium.drawData.editingFeature.get(0).position = Cesium.Cartesian3.fromDegrees(singlePointObject.coordinates[0], singlePointObject.coordinates[1], singlePointObject.coordinates[2]);
                    empCesium.drawData.editingFeature.get(0).show = true;
                }
//                if (empCesium.drawData.editingFeature.label)
//                {
//                    empCesium.drawData.editingFeature.label.show = new empCesium.ConstantProperty(true);
//                }
//                if (empCesium.drawData.editingFeature.polyline)
//                {
//                    empCesium.drawData.editingFeature.polyline.show = new empCesium.ConstantProperty(true);
//                }
            }
            else if (empCesium.drawData.editingFeature.label)
            {
                empCesium.drawHelper.stopDrawing();
                empCesium.drawHelper.destroy();
                if (empCesium.drawData.editingFeature.label)
                {
                    empCesium.drawData.editingFeature.label.show = new empCesium.ConstantProperty(true);
                }
                if (empCesium.drawData.editingFeature.polyline)
                {
                    empCesium.drawData.editingFeature.polyline.show = new empCesium.ConstantProperty(true);
                }
            }
            else if (empCesium.drawData.editingFeature.ellipse)
            {
                empCesium.drawHelper.stopDrawing();
                empCesium.drawHelper.destroy();
                empCesium.drawData.editingFeature.ellipse.show = new empCesium.ConstantProperty(true);
            }
        }
        catch (ex)
        {
            result.success = false;
            result.message = "Error ending feature edit";
            result.jsError = ex;
        }

        return result;
    };
}
