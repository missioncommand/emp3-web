

/* global Cesium, emp, sec, EmpCesium, CESIUM_BASE_URL, Function, cesiumEngine */

/**
 * Created by thomas on 9/01/14.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * (c) www.geocento.com
 * www.metaaps.com
 *
 */

var DrawHelper = (function ()
{

    // static variables
    var ellipsoid = Cesium.Ellipsoid.WGS84;
    var defaultBillboard;
    var dragBillboard;
    var dragHalfBillboard;
    var dragHalfBillboard;
    var vertixControlPoint;
    var azimuthControlPoint;
    var radiusControlPoint;
    var widthControlPoint;
    var lengthControlPoint;
    var newControlPoint;
    // constructor
    function _(viewer, empCesium, layer, id)
    {
        this._scene = viewer.scene;
        this._scene.screenSpaceCameraController.inertiaSpin = 0;
        this._scene.screenSpaceCameraController.inertiaTranslate = 0.0;
        this._tooltip = createTooltip(viewer.container);
        this._surfaces = [];
        this.layer = layer;
        this.id = id; //"editing_" + coreId
        this.empCesium = empCesium;
        this.lastCameraHeight = 0;
        this.pinBuilder = new Cesium.PinBuilder();
        this.handler = undefined;
        this.initialiseHandlers();
        this.enhancePrimitives();
        this.cameraHeight = 0;
        defaultBillboard = {
            iconUrl: empCesium.relativeBaseURL + "js/lib/cesium/editors/images/blueHandle24.png",
            shiftX: 0,
            shiftY: 0
        };
        dragBillboard = {
            iconUrl: empCesium.relativeBaseURL + "js/lib/cesium/editors/images/blueHandle24.png",
            shiftX: 0,
            shiftY: 0
        };
        dragHalfBillboard = {
            iconUrl: empCesium.relativeBaseURL + "js/lib/cesium/editors/images/orangeHandle16.png",
            shiftX: 0,
            shiftY: 0
        };
        vertixControlPoint = {
            iconUrl: this.empCesium.relativeBaseURL + "js/lib/cesium/editors/images/blueHandle24.png",
            shiftX: 0,
            shiftY: 0
        };
        azimuthControlPoint = {
            iconUrl: this.empCesium.relativeBaseURL + "js/lib/cesium/editors/images/yellowHandle24.png",
            shiftX: 0,
            shiftY: 0
        };
        radiusControlPoint = {
            iconUrl: this.empCesium.relativeBaseURL + "js/lib/cesium/editors/images/purpleHandle24.png",
            shiftX: 0,
            shiftY: 0
        };
        widthControlPoint = {
            iconUrl: this.empCesium.relativeBaseURL + "js/lib/cesium/editors/images/grayHandle24.png",
            shiftX: 0,
            shiftY: 0
        };
        lengthControlPoint = {
            iconUrl: this.empCesium.relativeBaseURL + "js/lib/cesium/editors/images/limeHandle24.png",
            shiftX: 0,
            shiftY: 0
        };
//         lengthControlPoint = {
//            iconUrl: emp.helpers.createCircleCanvas({
//                iRadius: 11,
//                dOpacity: 0.8,
//                sStrokeColor: "#000088", // Dark grey
//                sFillColor: "#AAAAAA", // Light grey
//                iLineWidth: 2
//            }).toDataURL(),
//            shiftX: 0,
//            shiftY: 0
//        };
        newControlPoint = {
            iconUrl: this.empCesium.relativeBaseURL + "js/lib/cesium/editors/images/orangeHandle16.png",
            shiftX: 0,
            shiftY: 0
        };

//        this.removeCameraMoveEndListener = viewer.camera.moveEnd.addEventListener(function ()
//        {
//            if (this.currentMultiPointEditorRenderGraphicFuction)
//            {
//                this.currentMultiPointEditorRenderGraphicFuction();
//            }
//
//        }.bind(this));
    }

    _.prototype.initialiseHandlers = function ()
    {
        var scene = this._scene;
        var _self = this;
        // scene events
        this.handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        function callPrimitiveCallback(name, position)
        {
            if (_self._handlersMuted === true)
                return;
            var pickedObject = scene.pick(position);
            if (pickedObject && pickedObject.primitive && pickedObject.primitive[name])
            {
                pickedObject.primitive[name](position);
            }
        }
        this.handler.setInputAction(
                function (movement)
                {
                    callPrimitiveCallback('leftClick', movement.position);
                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction(
                function (movement)
                {
                    callPrimitiveCallback('leftDoubleClick', movement.position);
                }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        var mouseOutObject;
        this.handler.setInputAction(
                function (movement)
                {
                    if (_self._handlersMuted === true)
                        return;
                    var pickedObject = scene.pick(movement.endPosition);
                    if (mouseOutObject && (!pickedObject || mouseOutObject !== pickedObject.primitive))
                    {
                        !(mouseOutObject.isDestroyed && mouseOutObject.isDestroyed()) && mouseOutObject.mouseOut(movement.endPosition);
                        mouseOutObject = undefined;
                    }
                    if (pickedObject && pickedObject.primitive)
                    {
                        pickedObject = pickedObject.primitive;
                        if (pickedObject.mouseOut)
                        {
                            mouseOutObject = pickedObject;
                        }
                        if (pickedObject.mouseMove)
                        {
                            pickedObject.mouseMove(movement.endPosition);
                        }
                    }
                    if (!Cesium.Math.equalsEpsilon(_self.empCesium.viewer.camera.positionCartographic.height, _self.lastCameraHeight, Cesium.Math.EPSILON5))
                    {
                        // refresh control point z-index when camera height changes
                        if (_self._editedSurface && _self._editedSurface._editMarkers && _self._editedSurface._editMarkers._orderedBillboards)
                        {
                            for (var markerIndex = 0; markerIndex < _self._editedSurface._editMarkers._orderedBillboards.length; ++markerIndex)
                            {
                                _self._editedSurface._editMarkers._orderedBillboards[markerIndex].eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(_self.empCesium.viewer.camera.positionCartographic.height, _self.lastCameraHeight);
                            }
                        }
                        if (_self._editedSurface && _self._editedSurface._markers && _self._editedSurface._markers._orderedBillboards)
                        {
                            for (var markerIndex = 0; markerIndex < _self._editedSurface._markers._orderedBillboards.length; ++markerIndex)
                            {
                                _self._editedSurface._markers._orderedBillboards[markerIndex].eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(_self.empCesium.viewer.camera.positionCartographic.height, _self.lastCameraHeight);
                            }
                        }
                        if (_self._editedSurface && _self._editedSurface._markers)
                        {
                            _self._editedSurface._markers.setOnTop();
                        }
                        if (_self._editedSurface && _self._editedSurface._editMarkers)
                        {
                            _self._editedSurface._editMarkers.setOnTop();
                        }

                        _self.lastCameraHeight = _self.empCesium.viewer.camera.positionCartographic.height;
                    }
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.setInputAction(
                function (movement)
                {
                    callPrimitiveCallback('leftUp', movement.position);
                }, Cesium.ScreenSpaceEventType.LEFT_UP);
        this.handler.setInputAction(
                function (movement)
                {
                    callPrimitiveCallback('leftDown', movement.position);
                }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    }; //initialiseHandlers

    _.prototype.setListener = function (primitive, type, callback)
    {
        primitive[type] = callback;
    };
    _.prototype.destroy = function ()
    {
        if (this.handler && !this.handler.isDestroyed())
        {
            this.handler.destroy();
        }
        this.empCesium.currentMultiPointEditorRenderGraphicFuction =  undefined;
//        if (this.removeCameraMoveEndListener)
//        {
//            this.removeCameraMoveEndListener();
//        }
        this._scene.screenSpaceCameraController.inertiaSpin = 0.9;
        this._scene.screenSpaceCameraController.inertiaTranslate = 0.9;
        this._scene.screenSpaceCameraController.enableRotate = true;
        this._scene.screenSpaceCameraController.enableTranslate = true;
        this._scene.screenSpaceCameraController.enableZoom = true;
        this._scene.screenSpaceCameraController.enableTilt = true;
        this._scene.screenSpaceCameraController.enableLook = true;
    };
    _.prototype.muteHandlers = function (muted)
    {
        this._handlersMuted = (muted ? true : false);
    };
    // register event handling for an editable shape
    // shape should implement setEditMode and setHighlighted
    _.prototype.registerEditableShape = function (surface)
    {
        var _self = this;
        // handlers for interactions
        // highlight polygon when mouse is entering
        setListener(surface, 'mouseMove', function (position)
        {
            surface.setHighlighted(true);
            if (!surface._editMode)
            {
                //_self._tooltip.showAt(position, "Click to edit this shape");
            }
        });
        // hide the highlighting when mouse is leaving the polygon
        setListener(surface, 'mouseOut', function (position)
        {
            surface.setHighlighted(false);
            // _self._tooltip.setVisible(false);
        });
        setListener(surface, 'leftClick', function (position)
        {
            surface.setEditMode(true); ////acevedo here it detects the left click to star t editing
        });
    };
    _.prototype.startDrawing = function (cleanUp)
    {
        // undo any current edit of shapes
        this.disableAllEditMode();
        // check for cleanUp first
        if (this.editCleanUp)
        {
            this.editCleanUp();
        }
        this.editCleanUp = cleanUp;
        this.muteHandlers(true);
    };
    _.prototype.stopDrawing = function ()
    {
        // check for cleanUp first
        if (this.editCleanUp)
        {
            var positions = this.editCleanUp();
            this.editCleanUp = undefined;
        }
        this.muteHandlers(false);
        this.destroy();
        return positions;
    };
    //acevedo
    _.prototype.finishDrawing = function ()
    {
        // check for cleanUp first
        if (this.editCleanUp)
        {
            var positions = this.editCleanUp();
            this.editCleanUp = undefined;
        }
        this.muteHandlers(false);
//        if (positions && positions.length > 1)
//        {
//            // removing last position added while clicking the finish button on the editor toolbar
//            positions.splice(positions.length - 1, 1);
//        }
        return positions;
    };
    // make sure only one shape is highlighted at a time
    _.prototype.disableAllHighlights = function ()
    {
        this.setHighlighted(undefined);
    };
    _.prototype.setHighlighted = function (surface)
    {
        if (this._highlightedSurface && !this._highlightedSurface.isDestroyed() && this._highlightedSurface !== surface)
        {
            this._highlightedSurface.setHighlighted(false);
        }
        this._highlightedSurface = surface;
    };
    _.prototype.disableAllEditMode = function ()
    {
        this.setEdited(undefined);
    };
    _.prototype.setEdited = function (surface)
    {
        if (this._editedSurface && this._editedSurface.isDestroyed && !this._editedSurface.isDestroyed())
        {
            this._editedSurface.setEditMode(false);
        }
        this._editedSurface = surface;
    };
    var material = Cesium.Material.fromType(Cesium.Material.ColorType);
    material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5);
    var defaultShapeOptions = {
        ellipsoid: Cesium.Ellipsoid.WGS84,
        textureRotationAngle: 0.0,
        height: 0.0,
        asynchronous: true,
        show: true,
        debugShowBoundingVolume: false
    };
    var defaultSurfaceOptions = copyOptions(defaultShapeOptions, {
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround: false
        }),
        material: material,
        granularity: Math.PI / 180.0
    });
    var defaultPolygonOptions = copyOptions(defaultShapeOptions, {});
    var defaultExtentOptions = copyOptions(defaultShapeOptions, {});
    var defaultCircleOptions = copyOptions(defaultShapeOptions, {});
    var defaultEllipseOptions = copyOptions(defaultSurfaceOptions, {rotation: 0});
    var defaultPolylineOptions = copyOptions(defaultShapeOptions, {
        width: 5,
        geodesic: true,
        granularity: 10000,
        appearance: new Cesium.PolylineMaterialAppearance({
            aboveGround: false
        }),
        material: material
    });
//    Cesium.Polygon.prototype.setStrokeStyle = setStrokeStyle;
//    
//    Cesium.Polygon.prototype.drawOutline = drawOutline;
//

    var ChangeablePrimitive = (function ()
    {
        function _()
        {
        }

        _.prototype.initialiseOptions = function (options)
        {

            fillOptions(this, options);
            this._ellipsoid = undefined;
            this._granularity = undefined;
            this._height = undefined;
            this._textureRotationAngle = undefined;
            this._id = undefined;
            // set the flags to initiate a first drawing
            this._createPrimitive = true;
            this._primitive = undefined;
            this._outlinePolygon = undefined;
        }

        _.prototype.setAttribute = function (name, value)
        {
            this[name] = value;
            this._createPrimitive = true;
        };
        _.prototype.getAttribute = function (name)
        {
            return this[name];
        };
        /**
         * @private
         */
        _.prototype.update = function (context, frameState, commandList)
        {

            if (!Cesium.defined(this.ellipsoid))
            {
                throw new Cesium.DeveloperError('this.ellipsoid must be defined.');
            }

            if (!Cesium.defined(this.appearance))
            {
                throw new Cesium.DeveloperError('this.material must be defined.');
            }

            if (this.granularity < 0.0)
            {
                throw new Cesium.DeveloperError('this.granularity and scene2D/scene3D overrides must be greater than zero.');
            }

            if (!this.show)
            {
                return;
            }

            if (!this._createPrimitive && (!Cesium.defined(this._primitive)))
            {
                // No positions/hierarchy to draw
                return;
            }

            if (this._createPrimitive ||
                    (this._ellipsoid !== this.ellipsoid) ||
                    (this._granularity !== this.granularity) ||
                    (this._height !== this.height) ||
                    (this._textureRotationAngle !== this.textureRotationAngle) ||
                    (this._id !== this.id))
            {

                var geometry = this.getGeometry();
                if (!geometry)
                {
                    return;
                }

                this._createPrimitive = false;
                this._ellipsoid = this.ellipsoid;
                this._granularity = this.granularity;
                this._height = this.height;
                this._textureRotationAngle = this.textureRotationAngle;
                this._id = this.id;
                this._primitive = this._primitive && this._primitive.destroy();
                this._primitive = new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geometry,
                        id: this.id,
                        pickPrimitive: this
                    }),
                    appearance: this.appearance,
                    asynchronous: this.asynchronous
                });
                this._outlinePolygon = this._outlinePolygon && this._outlinePolygon.destroy();
                if (this.strokeColor && this.getOutlineGeometry)
                {
                    // create the highlighting frame
                    this._outlinePolygon = new Cesium.Primitive({
                        geometryInstances: new Cesium.GeometryInstance({
                            geometry: this.getOutlineGeometry(),
                            attributes: {
                                color: Cesium.ColorGeometryInstanceAttribute.fromColor(this.strokeColor)
                            }
                        }),
                        appearance: new Cesium.PerInstanceColorAppearance({
                            flat: true,
                            renderState: {
                                depthTest: {
                                    enabled: true
                                },
                                lineWidth: Math.min(this.strokeWidth || 4.0, context._aliasedLineWidthRange[1])
                            }
                        })
                    });
                }
            }
            var primitive = this._primitive;
            primitive.appearance.material = this.material;
            primitive.featureId = this.featureId;
            primitive.coreId = this.coreId;
            primitive.overlayId = this.overlayId;
            primitive.debugShowBoundingVolume = this.debugShowBoundingVolume;
            primitive.update(context, frameState, commandList);
            this._outlinePolygon && this._outlinePolygon.update(context, frameState, commandList);
        };
        _.prototype.isDestroyed = function ()
        {
            return false;
        };
        _.prototype.destroy = function ()
        {
            this._primitive = this._primitive && this._primitive.destroy();
            return Cesium.destroyObject(this);
        };
        _.prototype.setStrokeStyle = function (strokeColor, strokeWidth)
        {
            if (!this.strokeColor || !this.strokeColor.equals(strokeColor) || this.strokeWidth !== strokeWidth)
            {
                this._createPrimitive = true;
                this.strokeColor = strokeColor;
                this.strokeWidth = strokeWidth;
            }
        };

        return _;
    })();
    _.ExtentPrimitive = (function ()
    {
        function _(options)
        {

            if (!Cesium.defined(options.extent))
            {
                throw new Cesium.DeveloperError('Extent is required');
            }

            options = copyOptions(options, defaultSurfaceOptions);
            this.initialiseOptions(options);
            this.setExtent(options.extent);
        }

        _.prototype = new ChangeablePrimitive();
        _.prototype.setExtent = function (extent)
        {
            this.setAttribute('extent', extent);
        };
        _.prototype.getExtent = function ()
        {
            return this.getAttribute('extent');
        };
        _.prototype.getGeometry = function ()
        {

            if (!Cesium.defined(this.extent))
            {
                return;
            }

            return new Cesium.RectangleGeometry({
                rectangle: this.extent,
                height: this.height,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity
            });
        };
        _.prototype.getOutlineGeometry = function ()
        {
            return new Cesium.RectangleOutlineGeometry({
                rectangle: this.extent
            });
        };

        return _;
    })();
    _.PolygonPrimitive = (function ()
    {

        function _(options)
        {

            options = copyOptions(options, defaultSurfaceOptions);
            this.initialiseOptions(options);
            this.isPolygon = true;
        }
        ;
        _.prototype = new ChangeablePrimitive();
        _.prototype.setPositions = function (positions)
        {
            this.setAttribute('positions', positions);
        };
        _.prototype.getPositions = function ()
        {
            return this.getAttribute('positions');
        };
        _.prototype.getGeometry = function ()
        {

            if (!Cesium.defined(this.positions) || this.positions.length < 3)
            {
                return;
            }

            return Cesium.PolygonGeometry.fromPositions({
                positions: this.positions,
                height: this.height,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity
            });
        };
        _.prototype.getOutlineGeometry = function ()
        {
            return Cesium.PolygonOutlineGeometry.fromPositions({
                positions: this.getPositions()
            });
        };

        return _;
    })();
    _.RectanglePrimitive = (function ()
    {

        function _(options)
        {

            options = copyOptions(options, defaultSurfaceOptions);
            this.initialiseOptions(options);
            this.isRectangle = true;
        }

        _.prototype = new ChangeablePrimitive();
        _.prototype.setPositions = function (positions)
        {
            this.setAttribute('positions', positions);
        };
        _.prototype.getPositions = function ()
        {
            return this.getAttribute('positions');
        };
        _.prototype.getGeometry = function ()
        {

            if (!Cesium.defined(this.positions) || this.positions.length < 3)
            {
                return;
            }

            return Cesium.PolygonGeometry.fromPositions({
                positions: this.positions,
                height: this.height,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity
            });
        };
        _.prototype.getOutlineGeometry = function ()
        {
            return Cesium.PolygonOutlineGeometry.fromPositions({
                positions: this.getPositions()
            });
        };
        return _;
    })();
    _.CirclePrimitive = (function ()
    {

        function _(options)
        {

            if (!(Cesium.defined(options.center) && Cesium.defined(options.radius)))
            {
                throw new Cesium.DeveloperError('Center and radius are required');
            }

            options = copyOptions(options, defaultSurfaceOptions);
            this.initialiseOptions(options);
            this.setRadius(options.radius);
        }

        _.prototype = new ChangeablePrimitive();
        _.prototype.setCenter = function (center)
        {
            this.setAttribute('center', center);
        };
        _.prototype.setRadius = function (radius)
        {
            this.setAttribute('radius', Math.max(0.1, radius));
        };
        _.prototype.getCenter = function ()
        {
            return this.getAttribute('center');
        };
        _.prototype.getRadius = function ()
        {
            return this.getAttribute('radius');
        };
        _.prototype.getGeometry = function ()
        {

            if (!(Cesium.defined(this.center) && Cesium.defined(this.radius)))
            {
                return;
            }

            return new Cesium.CircleGeometry({
                center: this.center,
                radius: this.radius,
                height: this.height,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity
            });
        };
        _.prototype.getOutlineGeometry = function ()
        {
            return new Cesium.CircleOutlineGeometry({
                center: this.getCenter(),
                radius: this.getRadius()
            });
        };
        return _;
    })();
    _.EllipsePrimitive = (function ()
    {
        function _(options)
        {

            if (!(Cesium.defined(options.center) && Cesium.defined(options.semiMajorAxis) && Cesium.defined(options.semiMinorAxis)))
            {
                throw new Cesium.DeveloperError('Center and semi major and semi minor axis are required');
            }

            options = copyOptions(options, defaultEllipseOptions);
            this.initialiseOptions(options);
        }

        _.prototype = new ChangeablePrimitive();
        _.prototype.setCenter = function (center)
        {
            this.setAttribute('center', center);
        };
        _.prototype.setSemiMajorAxis = function (semiMajorAxis)
        {
            if (semiMajorAxis < this.getSemiMinorAxis())
                return;
            this.setAttribute('semiMajorAxis', semiMajorAxis);
        };
        _.prototype.setSemiMinorAxis = function (semiMinorAxis)
        {
            if (semiMinorAxis > this.getSemiMajorAxis())
                return;
            this.setAttribute('semiMinorAxis', semiMinorAxis);
        };
        _.prototype.setRotation = function (rotation)
        {
            return this.setAttribute('rotation', rotation);
        };
        _.prototype.getCenter = function ()
        {
            return this.getAttribute('center');
        };
        _.prototype.getSemiMajorAxis = function ()
        {
            return this.getAttribute('semiMajorAxis');
        };
        _.prototype.getSemiMinorAxis = function ()
        {
            return this.getAttribute('semiMinorAxis');
        };
        _.prototype.getRotation = function ()
        {
            return this.getAttribute('rotation');
        };
        _.prototype.getGeometry = function ()
        {

            if (!(Cesium.defined(this.center) && Cesium.defined(this.semiMajorAxis) && Cesium.defined(this.semiMinorAxis)))
            {
                return;
            }

            return new Cesium.EllipseGeometry({
                ellipsoid: this.ellipsoid,
                center: this.center,
                semiMajorAxis: this.semiMajorAxis,
                semiMinorAxis: this.semiMinorAxis,
                rotation: this.rotation,
                height: this.height,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                granularity: this.granularity
            });
        };
        _.prototype.getOutlineGeometry = function ()
        {
            return new Cesium.EllipseOutlineGeometry({
                center: this.getCenter(),
                semiMajorAxis: this.getSemiMajorAxis(),
                semiMinorAxis: this.getSemiMinorAxis(),
                rotation: this.getRotation()
            });
        };
        return _;
    })();
    _.PolylinePrimitive = (function ()
    {

        function _(options)
        {
            options = copyOptions(options, defaultPolylineOptions);
            this.initialiseOptions(options);
        }

        _.prototype = new ChangeablePrimitive();
        _.prototype.setPositions = function (positions)
        {
            this.setAttribute('positions', positions);
        };
        _.prototype.setWidth = function (width)
        {
            this.setAttribute('width', width);
        };
        _.prototype.setGeodesic = function (geodesic)
        {
            this.setAttribute('geodesic', geodesic);
        };
        _.prototype.getPositions = function ()
        {
            return this.getAttribute('positions');
        };
        _.prototype.getWidth = function ()
        {
            return this.getAttribute('width');
        };
        _.prototype.getGeodesic = function (geodesic)
        {
            return this.getAttribute('geodesic');
        };
        _.prototype.getGeometry = function ()
        {

            if (!Cesium.defined(this.positions) || this.positions.length < 2)
            {
                return;
            }

            return new Cesium.PolylineGeometry({
                positions: this.positions,
                height: this.height,
                width: this.width < 1 ? 1 : this.width,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                ellipsoid: this.ellipsoid
            });
        };
        return _;
    })();
    //////WWW
    _.prototype.createBillboardGroup = function (points, options, callbacks)
    {
        var markers = new _.BillboardGroup(this, options);
        markers.addBillboards(points, callbacks);
        return markers;
    };
    _.BillboardGroup = function (drawHelper, options)
    {

        this._drawHelper = drawHelper;
        this._scene = drawHelper._scene;
        this._options = copyOptions(options, defaultBillboard);
        // create one common billboard collection for all billboards
        var b = new Cesium.BillboardCollection();
        this._scene.primitives.add(b);
        this._billboards = b;
        // keep an ordered list of billboards
        this._orderedBillboards = [];
    };
    // eyeOffsetCallback = function ()
    // {

    //   };

    _.BillboardGroup.prototype.createBillboard = function (position, callbacks, category)
    {

        var billboard = this._billboards.add({
            show: true,
            position: position,
            pixelOffset: new Cesium.Cartesian2(this._options.shiftX, this._options.shiftY),
            //eyeOffset: new Cesium.Cartesian3(0.0, 2000.0, 0.0),
            eyeOffset: cesiumEngine.utils.getEyeOffsetControlPoint(this._drawHelper.empCesium.viewer.camera.positionCartographic.height, this._drawHelper.lastCameraHeight),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            alignedAxis: (this._options.aligned) ? this._options.alignedAxis : Cesium.Cartesian3.ZERO,
            scale: (this._options.scale) ? this._options.scale : 1.0,
            //scaleByDistance: (this._options.scaleByDistance) ? new Cesium.NearFarScalar(this._options.scaleByDistance.near, this._options.scaleByDistance.nearValue, this._options.scaleByDistance.far, this._options.scaleByDistance.farValue) : undefined,
            image: this._options.iconUrl,
            color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
            id: "drawing_id"
        });
        this._drawHelper.lastCameraHeight = this._drawHelper.empCesium.viewer.camera.positionCartographic.height;
        // if editable
        if (callbacks)
        {
            billboard.category = category;
            var _self = this;
            var screenSpaceCameraController = this._scene.screenSpaceCameraController;
            function enableRotation(enable)
            {
                if (enable)
                {
                    var delayUnlockingMapTimeOut = setTimeout(function ()
                    {
                        screenSpaceCameraController.enableRotate = true;
                        //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                        // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                        screenSpaceCameraController.enableTranslate = true;
                        screenSpaceCameraController.enableZoom = true;
                        screenSpaceCameraController.enableTilt = true;
                        screenSpaceCameraController.enableLook = true;
                    }.bind(this), 70);
                }
                else
                {
                    screenSpaceCameraController.enableRotate = enable;
                    //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                    // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                    screenSpaceCameraController.enableTranslate = enable;
                    screenSpaceCameraController.enableZoom = true;
                    screenSpaceCameraController.enableTilt = true;
                    screenSpaceCameraController.enableLook = true;
                }


            }
            function getIndex()
            {
                // find index
                for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] !== billboard; ++i)
                    ;
                return i;
            }
            ;
            if (callbacks.dragHandlers)
            {
                var _self = this;
                setListener(billboard, 'leftDown', function (position)
                {
                    // TODO - start the drag handlers here
                    // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                    function onDrag(position)
                    {
                        billboard.position = position;
                        // billboard.eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(this._drawHelper.empCesium);
                        // find index
                        for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] !== billboard; ++i)
                            ; // acevedo not needed. Using getIndex() in next line.
                        callbacks.dragHandlers.onDrag && callbacks.dragHandlers.onDrag({position: Cesium.Ellipsoid.WGS84.cartesianToCartographic(position), index: getIndex()});
                    }
                    function onDragEnd(position)
                    {
                        handler.destroy();
                        enableRotation(true);
                        callbacks.dragHandlers.onDragEnd && callbacks.dragHandlers.onDragEnd({position: Cesium.Ellipsoid.WGS84.cartesianToCartographic(position), index: getIndex()});
                        // _self._drawHelper._tooltip.setVisible(false);
                    }

                    var handler = new Cesium.ScreenSpaceEventHandler(_self._scene.canvas);
                    handler.setInputAction(function (movement)
                    {
                        var cartesian = _self._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                        if (cartesian)
                        {
                            onDrag(cartesian);
                        }
                        else
                        {
                            onDragEnd(cartesian);
                        }
                    }.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    handler.setInputAction(function (movement)
                    {
                        onDragEnd(_self._scene.camera.pickEllipsoid(movement.position, ellipsoid));
                    }, Cesium.ScreenSpaceEventType.LEFT_UP);
                    enableRotation(false);
                    callbacks.dragHandlers.onDragStart && callbacks.dragHandlers.onDragStart({position: Cesium.Ellipsoid.WGS84.cartesianToCartographic(_self._scene.camera.pickEllipsoid(position, ellipsoid)), index: getIndex()});
                });
            }
            if (callbacks.onDoubleClick)
            {
                setListener(billboard, 'leftDoubleClick', function (position)
                {
                    callbacks.onDoubleClick(getIndex());
                });
            }
            if (callbacks.onClick)
            {
                setListener(billboard, 'leftClick', function (position)
                {
                    callbacks.onClick(getIndex());
                });
            }
            if (callbacks.tooltip)
            {
                setListener(billboard, 'mouseMove', function (position)
                {
                    // _self._drawHelper._tooltip.showAt(position, callbacks.tooltip());
                });
                setListener(billboard, 'mouseOut', function (position)
                {
                    // _self._drawHelper._tooltip.setVisible(false);
                });
            }
        }

        return billboard;
    };
    _.BillboardGroup.prototype.createEditableBillboard = function ()
    {
        var billboard = this._billboards.add({
            show: true,
            position: Cesium.Ellipsoid.WGS84.cartographicToCartesian(this._options.position),
            // pixelOffset: new Cesium.Cartesian2(this._options.shiftX, this._options.shiftY),
            pixelOffset: (Cesium.defined(this._options.pixelOffset)) ? new Cesium.Cartesian2(this._options.pixelOffset.x, this._options.pixelOffset.y) : new Cesium.Cartesian2(0, 0),
            eyeOffset: (Cesium.defined(this._options.eyeOffset)) ? new Cesium.Cartesian3(this._options.eyeOffset.x, this._options.eyeOffset.y, this._options.eyeOffset.z) : new Cesium.Cartesian3(0.0, 0.0, 0.0),
            horizontalOrigin: (Cesium.defined(this._options.horizontalOrigin)) ? this._options.horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: (Cesium.defined(this._options.verticalOrigin)) ? this._options.verticalOrigin : Cesium.VerticalOrigin.CENTER,
            scale: (Cesium.defined(this._options.scale)) ? this._options.scale : 1.0,
            image: this._options.iconUrl,
            color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
            alignedAxis: (Cesium.defined(this._options.alignedAxis)) ? new Cesium.Cartesian3(this._options.alignedAxis.x, this._options.alignedAxis.y, this._options.alignedAxis.z) : Cesium.Cartesian3.ZERO, // default alignedAxis is aligned to the screen up vector
            scaleByDistance: (Cesium.defined(this._options.scaleByDistance)) ? new Cesium.NearFarScalar(this._options.scaleByDistance.near, this._options.scaleByDistance.nearValue, this._options.scaleByDistance.far, this._options.scaleByDistance.farValue) : undefined,
            id: this._options.id,
            heightReference: (Cesium.defined(this._options.heightReference)) ? this._options.heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
        }),
                self_options = this._options;
        billboard.coreId = this._options.coreId;
        billboard.featureId = this._options.featureId;
        billboard.overlayId = this._options.overlayId;
        billboard._editMode = true;
        // if editable
        if (self_options.callbacks)
        {
            var _self = this;
            var screenSpaceCameraController = this._scene.screenSpaceCameraController;
            function enableRotation(enable)
            {
//                screenSpaceCameraController.enableRotate = enable;
//	              screenSpaceCameraController.enableTranslate = enable;
//	              screenSpaceCameraController.enableZoom =true;
//	              screenSpaceCameraController.enableTilt = true;
//          screenSpaceCameraController.enableLook = true;

                if (enable)
                {
                    this.delayUnlockingMapTimeOut = setTimeout(function ()
                    {
                        screenSpaceCameraController.enableRotate = true;
                        //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                        // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                        screenSpaceCameraController.enableTranslate = true;
                        screenSpaceCameraController.enableZoom = true;
                        screenSpaceCameraController.enableTilt = true;
                        screenSpaceCameraController.enableLook = true;
                    }.bind(this), 70);
                }
                else
                {
                    screenSpaceCameraController.enableRotate = enable;
                    //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                    // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                    screenSpaceCameraController.enableTranslate = enable;
                    screenSpaceCameraController.enableZoom = true;
                    screenSpaceCameraController.enableTilt = true;
                    screenSpaceCameraController.enableLook = true;
                }

                //screenSpaceCameraController.inertiaSpin =   enable? 0.9:0;
                //screenSpaceCameraController.inertiaTranslate =   enable? 0.9:0;
            }
            function getIndex()
            {
                // find index
                for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] !== billboard; ++i)
                    ;
                return i;
            }
            if (self_options.callbacks.dragHandlers)
            {
                var _self = this;
                setListener(billboard, 'leftDown', function (position)
                {
                    // TODO - start the drag handlers here
                    // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                    function onDrag(position)
                    {
                        billboard.position = position;
                        // find index
                        for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] !== billboard; ++i)
                            ; // acevedo not needed. Using getIndex() in next line.
                        self_options.callbacks.dragHandlers.onDrag && self_options.callbacks.dragHandlers.onDrag({positions: [Cesium.Ellipsoid.WGS84.cartesianToCartographic(position)], indices: getIndex()});
                    }
                    function onDragEnd(position)
                    {
                        handler.destroy();
                        enableRotation(true);
                        self_options.callbacks.dragHandlers.onDragEnd && self_options.callbacks.dragHandlers.onDragEnd({positions: [Cesium.Ellipsoid.WGS84.cartesianToCartographic(position)], indices: getIndex()});
                    }

                    var handler = new Cesium.ScreenSpaceEventHandler(_self._scene.canvas);
                    handler.setInputAction(function (movement)
                    {
                        var cartesian = _self._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                        if (cartesian)
                        {
                            onDrag(cartesian);
                        }
                        else
                        {
                            onDragEnd(cartesian);
                        }
                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    handler.setInputAction(function (movement)
                    {
                        onDragEnd(_self._scene.camera.pickEllipsoid(movement.position, ellipsoid));
                    }, Cesium.ScreenSpaceEventType.LEFT_UP);
                    enableRotation(false);
                    self_options.callbacks.dragHandlers.onDragStart && self_options.callbacks.dragHandlers.onDragStart({positions: Cesium.Ellipsoid.WGS84.cartesianToCartographic(_self._scene.camera.pickEllipsoid(position, ellipsoid)), indices: getIndex()});
                });
            }
            if (self_options.callbacks.onDoubleClick)
            {
                setListener(billboard, 'leftDoubleClick', function (position)
                {
                    self_options.callbacks.onDoubleClick(getIndex());
                });
            }
            if (self_options.callbacks.onClick)
            {
                setListener(billboard, 'leftClick', function (position)
                {
                    self_options.callbacks.onClick(getIndex());
                });
            }
            if (self_options.callbacks.tooltip)
            {
                setListener(billboard, 'mouseMove', function (position)
                {
                    //  _self._drawHelper._tooltip.showAt(position, self_options.callbacks.tooltip());
                });
                setListener(billboard, 'mouseOut', function (position)
                {
                    // _self._drawHelper._tooltip.setVisible(false);
                });
            }
        }

        return billboard;
    };
    _.BillboardGroup.prototype.insertBillboard = function (index, position, callbacks, category)
    {
        this._orderedBillboards.splice(index, 0, this.createBillboard(position, callbacks, category));
    };
    _.BillboardGroup.prototype.addBillboard = function (position, callbacks, category)
    {
        this._orderedBillboards.push(this.createBillboard(position, callbacks, category));
    };
    _.BillboardGroup.prototype.addEditableBillboard = function ()
    {
        this._orderedBillboards.push(this.createEditableBillboard());
    };
    _.BillboardGroup.prototype.addBillboards = function (positions, callbacks)
    {
        var index = 0;
        for (; index < positions.length; index++)
        {
            this.addBillboard(positions[index], callbacks, "vertex");
        }
    };
    _.BillboardGroup.prototype.updateBillboardsPositions = function (positions)
    {
        var index = 0;
        for (; index < positions.length; index++)
        {
            this.getBillboard(index).position = positions[index];
        }
    };
    _.BillboardGroup.prototype.countBillboards = function ()
    {
        return this._orderedBillboards.length;
    };
    _.BillboardGroup.prototype.getBillboard = function (index)
    {
        return this._orderedBillboards[index];
    };
    _.BillboardGroup.prototype.removeBillboard = function (index)
    {
        this._billboards.remove(this.getBillboard(index));
        this._orderedBillboards.splice(index, 1);
    };
    _.BillboardGroup.prototype.remove = function ()
    {
        this._billboards = this._billboards && this._billboards.removeAll() && this._billboards.destroy();
    };
    _.BillboardGroup.prototype.setOnTop = function ()
    {
        this._scene.primitives.raiseToTop(this._billboards);
    };
    _.BillboardGroup.prototype.addControlPoint = function (oArgs)
    {
        this._orderedBillboards.push(this.createControlPoint(oArgs));
    };
    _.BillboardGroup.prototype.findControlPoint = function (sCategory, sCPDataField, Value)
    {
        var oEntry;
        var oCP = undefined;
        var iSize = this._orderedBillboards.length;
        for (var iIndex = 0; iIndex < iSize; iIndex++)
        {
            oEntry = this._orderedBillboards[iIndex];
            if (oEntry
                    && (oEntry.category === sCategory)
                    && oEntry.hasOwnProperty("cpData")
                    && oEntry.cpData
                    && oEntry.cpData.hasOwnProperty(sCPDataField)
                    && (oEntry.cpData[sCPDataField] === Value))
            {
                oCP = oEntry;
                break;
            }
        }

        return oCP;
    };
    /**
     * This method creates a control point.
     * 
     * @param {Object} oArgs The parameter to the method is an object containg the following.
     * @param {Cesium.Cartesian} oArgs.position The position of the control point.
     * @param {Object} oArgs.callbacks The callback structure containg the event callbacks.
     * @param {string} oArgs.cpType The type of control point.
     * @param {Object} oArgs.cpData Any data releated to the control point.
     * @returns {Billboard}
     */
    _.BillboardGroup.prototype.createControlPoint = function (oArgs)
    {
        var oCPOptions = defaultBillboard;
        var position = oArgs.position;
        var callbacks = oArgs.callbacks;
        var category = oArgs.cpType;
        switch (category.toLowerCase())
        {
            case 'vertex':
                oCPOptions = vertixControlPoint;
                break;
            case 'azimuth':
                oCPOptions = azimuthControlPoint;
                break;
            case 'radius':
                oCPOptions = radiusControlPoint;
                break;
            case 'width':
                oCPOptions = widthControlPoint;
                break;
            case 'length':
                oCPOptions = lengthControlPoint;
                break;
            case 'new':
                oCPOptions = newControlPoint;
                break;
        }
        //this._options = copyOptions(oCPOptions, defaultBillboard);

        var billboard = this._billboards.add({
            show: true,
            position: position,
            pixelOffset: new Cesium.Cartesian2(oCPOptions.shiftX, oCPOptions.shiftY),
            //eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            alignedAxis: (this._options.alignedAxis) ? this._options.alignedAxis : Cesium.Cartesian3.ZERO,
            scale: 1, //(this._options.scale) ? this._options.scale : 2.0,
            //scaleByDistance: (this._options.scaleByDistance) ? new Cesium.NearFarScalar(this._options.scaleByDistance.near, this._options.scaleByDistance.nearValue, this._options.scaleByDistance.far, this._options.scaleByDistance.farValue) : undefined,
            image: oCPOptions.iconUrl,
            color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
            id: emp.helpers.id.newGUID() //"drawing_id"
        });
        if (callbacks)
        {
            billboard.category = category;
            billboard.cpData = oArgs.cpData;
            var _self = this;
            var screenSpaceCameraController = this._scene.screenSpaceCameraController;
            function enableRotation(enable)
            {
                if (enable)
                {
                    this.delayUnlockingMapTimeOut = setTimeout(function ()
                    {
                        screenSpaceCameraController.enableRotate = true;
                        //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                        // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                        screenSpaceCameraController.enableTranslate = true;
                        screenSpaceCameraController.enableZoom = true;
                        screenSpaceCameraController.enableTilt = true;
                        screenSpaceCameraController.enableLook = true;
                    }.bind(this), 70);
                }
                else
                {
                    screenSpaceCameraController.enableRotate = enable;
                    //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                    // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                    screenSpaceCameraController.enableTranslate = enable;
                    screenSpaceCameraController.enableZoom = true;
                    screenSpaceCameraController.enableTilt = true;
                    screenSpaceCameraController.enableLook = true;
                }
                ///screenSpaceCameraController.inertiaSpin =  enable? 0.9:0;
                // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
            }
            function getIndex()
            {
                // find index
                for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] !== billboard; ++i)
                    ;
                return i;
            }
            ;
            if (callbacks.dragHandlers)
            {
                var _self = this;
                setListener(billboard, 'leftDown', function (position)
                {
                    // TODO - start the drag handlers here
                    // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                    function onDrag(position)
                    {
                        billboard.position = position;
                        // find index
                        for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] !== billboard; ++i)
                            ; // acevedo not needed. Using getIndex() in next line.
                        callbacks.dragHandlers.onDrag && callbacks.dragHandlers.onDrag({position: Cesium.Ellipsoid.WGS84.cartesianToCartographic(position), index: getIndex()});
                    }
                    function onDragEnd(position)
                    {
                        handler.destroy();
                        handler = undefined;
                        enableRotation(true);
                        callbacks.dragHandlers.onDragEnd && callbacks.dragHandlers.onDragEnd({position: Cesium.Ellipsoid.WGS84.cartesianToCartographic(position), index: getIndex()});
                        // _self._drawHelper._tooltip.setVisible(false);
                    }

                    var handler = new Cesium.ScreenSpaceEventHandler(_self._scene.canvas);
                    handler.setInputAction(function (movement)
                    {
                        var cartesian = _self._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                        if (cartesian)
                        {
                            onDrag(cartesian);
                        }
                        else
                        {
                            onDragEnd(cartesian);
                        }
                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    handler.setInputAction(function (movement)
                    {
                        onDragEnd(_self._scene.camera.pickEllipsoid(movement.position, ellipsoid));
                    }, Cesium.ScreenSpaceEventType.LEFT_UP);
                    enableRotation(false);
                    callbacks.dragHandlers.onDragStart && callbacks.dragHandlers.onDragStart({position: Cesium.Ellipsoid.WGS84.cartesianToCartographic(_self._scene.camera.pickEllipsoid(position, ellipsoid)), index: getIndex()});
                });
            }
            if (callbacks.onDoubleClick)
            {
                setListener(billboard, 'leftDoubleClick', function (position)
                {
                    callbacks.onDoubleClick(getIndex(), position);
                });
            }
            if (callbacks.onClick)
            {
                setListener(billboard, 'leftClick', function (position)
                {
                    callbacks.onClick(getIndex(), position);
                });
            }
            if (callbacks.tooltip)
            {
                setListener(billboard, 'mouseMove', function (position)
                {
                    // _self._drawHelper._tooltip.showAt(position, callbacks.tooltip());
                });
                setListener(billboard, 'mouseOut', function (position)
                {
                    // _self._drawHelper._tooltip.setVisible(false);
                });
            }
        }

        return billboard;
    };
    _.prototype.startDrawingMarker = function (options)
    {

        var options = copyOptions(options, defaultBillboard);
        var dragging = false;
        //var height = 0;

        this.startDrawing(
                function ()
                {
                    var position = undefined;
                    if (markers.getBillboard(0))
                    {
                        position = markers.getBillboard(0).position;
                        position = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
                        position.height = parseFloat(position.height.toFixed(4));
                    }
                    if (markers)
                        markers.remove();
                    if (Cesium.defined(labels) && !labels.isDestroyed())
                    {
                        this.empCesium.viewer.scene.primitives.remove(labels);
                        //labels = labels && labels.removeAll() && labels.destroy();
                        labels = undefined;
                        label = undefined;
                    }

                    if (mouseHandler)
                        mouseHandler.destroy();
                    //tooltip.setVisible(false);
                    return [position];
                }
        );
        var _self = this;
        var scene = this._scene;
        var primitives = scene.primitives;
        var tooltip = this._tooltip;
        var labels = this.empCesium.viewer.scene.primitives.add(new Cesium.LabelCollection());
        var label;
//        if (options.position)
//        {
//            height = options.position.height;
//        }
        var markers = new _.BillboardGroup(this, options);
        if (options.position)
        {
            markers.addEditableBillboard();
            if (this.empCesium.drawData.isLabel)
            {
                label = labels.add({
                    position: Cesium.Ellipsoid.WGS84.cartographicToCartesian(options.position),
                    text: this.empCesium.drawData.labelText,
                    pixelOffset: this.empCesium.drawData.labelPixelOffset,
                    font: this.empCesium.drawData.labelFont,
                    style: this.empCesium.drawData.labelStyle,
                    fillColor: this.empCesium.drawData.labelFillColor,
                    outLineColor: this.empCesium.drawData.labelOutLineColor,
                    outLineWidth: this.empCesium.drawData.labelOutLineWidth,
                    horizontalOrigin: this.empCesium.drawData.labelHorizontalOrigin,
                    verticalOrigin: this.empCesium.drawData.labelVerticalOrigin,
                    scale: this.empCesium.drawData.labelScale,
                    translucencyByDistance: this.empCesium.drawData.labelTranslucencyByDistance
                });
            }
            options.position.height = parseFloat(options.position.height.toFixed(4));
            options.callbacks.onDrawStart({positions: options.position, indices: []});
            //options.callbacks.dragHandlers.onDrag({positions: options.position, indexes: []});
        }
        else if (this.empCesium.drawData.coordinates && this.empCesium.drawData.coordinates.length === 1)
        {
            this.empCesium.drawData.coordinates[0].height = parseFloat(this.empCesium.drawData.coordinates[0].height.toFixed(4));
            markers._options.position = this.empCesium.drawData.coordinates[0];
            markers.addEditableBillboard();
            if (this.empCesium.drawData.isLabel)
            {
                label = labels.add({
                    position: Cesium.Ellipsoid.WGS84.cartographicToCartesian(markers._options.position),
                    text: this.empCesium.drawData.labelText,
                    pixelOffset: this.empCesium.drawData.labelPixelOffset,
                    font: this.empCesium.drawData.labelFont,
                    style: this.empCesium.drawData.labelStyle,
                    fillColor: this.empCesium.drawData.labelFillColor,
                    outLineColor: this.empCesium.drawData.labelOutLineColor,
                    outLineWidth: this.empCesium.drawData.labelOutLineWidth,
                    horizontalOrigin: this.empCesium.drawData.labelHorizontalOrigin,
                    verticalOrigin: this.empCesium.drawData.labelVerticalOrigin,
                    scale: this.empCesium.drawData.labelScale,
                    translucencyByDistance: this.empCesium.drawData.labelTranslucencyByDistance
                });
            }
            //markers.addBillboard(Cesium.Ellipsoid.WGS84.cartographicToCartesian(this.empCesium.drawData.coordinates[0]), options.callbacks, "vertex");
            options.callbacks.onDrawStart({positions: this.empCesium.drawData.coordinates[0], indices: []});
            //options.callbacks.dragHandlers.onDrag({positions: this.empCesium.drawData.coordinates[0], indices: []});
        }

        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        // Now wait for start
        mouseHandler.setInputAction(function (movement)
        {
            if (Cesium.defined(movement.position))
            {
//                var pickedObject = scene.pick(movement.position);
//                if (Cesium.defined(pickedObject) && (pickedObject.id === "draw_marker_id"))
//                {
//                    //markers.getBillboard(0).
//                    dragging = true;
//                    markers.getBillboard(0).enableRotation(false);
//                    tooltip.setVisible(false);
//                }
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian && markers.countBillboards() === 0)
                {
                    markers._options.position = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
                    markers.addEditableBillboard();
                    if (this.empCesium.drawData.isLabel)
                    {
                        label = labels.add({
                            position: cartesian,
                            text: this.empCesium.drawData.labelText,
                            pixelOffset: this.empCesium.drawData.labelPixelOffset,
                            font: this.empCesium.drawData.labelFont,
                            style: this.empCesium.drawData.labelStyle,
                            fillColor: this.empCesium.drawData.labelFillColor,
                            outLineColor: this.empCesium.drawData.labelOutLineColor,
                            outLineWidth: this.empCesium.drawData.labelOutLineWidth,
                            horizontalOrigin: this.empCesium.drawData.labelHorizontalOrigin,
                            verticalOrigin: this.empCesium.drawData.labelVerticalOrigin,
                            scale: this.empCesium.drawData.labelScale,
                            translucencyByDistance: this.empCesium.drawData.labelTranslucencyByDistance
                        });
                    }
                    //markers.addBillboard(cartesian, options.callbacks, "vertex");
                    ////_self.stopDrawing();
                    var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
                    cartographic.height = parseFloat(cartographic.height.toFixed(4));
                    options.callbacks.onDrawStart({positions: cartographic, indices: []});
                    //options.callbacks.dragHandlers.onDrag({positions: Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian), indices: []});
                    // tooltip.showAt(movement.position, "<p>Position is: </p>" + getDisplayLatLngString(ellipsoid.cartesianToCartographic(cartesian)));
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        mouseHandler.setInputAction(function (movement)
        {
            if (Cesium.defined(movement.position))
            {
                var pickedObject = scene.pick(movement.position);
                var isDrawingBillboardPicked = false;
                if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.id) && (pickedObject.id === options.id || pickedObject.id === "drawing_id"))
                {
                    //primitive case
                    isDrawingBillboardPicked = true;
                }
                else if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.id.id) && typeof (pickedObject.id.id) === "string" && pickedObject.id.id === "drawing_id")
                {
                    // entity case ?
                    isDrawingBillboardPicked = true;
                }
                if (isDrawingBillboardPicked)
                {
                    //markers.getBillboard(0).
                    dragging = true;
                    scene.screenSpaceCameraController.enableRotate = false;
                    //scene.screenSpaceCameraController.inertiaSpin =  0;
                    //scene.screenSpaceCameraController.inertiaTranslate = 0;
                    scene.screenSpaceCameraController.enableTranslate = false;
                    scene.screenSpaceCameraController.enableZoom = true;
                    scene.screenSpaceCameraController.enableTilt = true;
                    scene.screenSpaceCameraController.enableLook = true;


                    //markers.getBillboard(0).enableRotation(false);
                    //tooltip.setVisible(true);
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOWN);
//         mouseHandler.setInputAction(function(movement) {
//            dragging = false;
//             scene.screenSpaceCameraController.enableRotate =  true;
//        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        mouseHandler.setInputAction(function (movement)
        {

            //var position = movement.endPosition;
            // if (position !== null)
            // {
            //var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);  

            //var cartesian = this.empCesium.viewer.scene.globe.pick(ray, this.empCesium.viewer.scene);
//                if (cartesian && markers.countBillboards() === 0)
//                {
//                    //tooltip.showAt(position, "<p>Click to add your marker. Position is: </p>" + getDisplayLatLngString(ellipsoid.cartesianToCartographic(cartesian)));
//                }
            // if (markers.countBillboards() > 0)
            // {
            //var carto = ellipsoid.cartesianToCartographic(cartesian);

            if (movement.endPosition && markers.getBillboard(0) && dragging)
            {
                //carto.latitude  = height;
                var ray = this.empCesium.viewer.camera.getPickRay(movement.endPosition);
                var currentMarkerPositionCarto = this.empCesium.ellipsoid.cartesianToCartographic(markers.getBillboard(0).position);
                var currentMarkerPositionCartesian = markers.getBillboard(0).position;
                var surfaceNormal = scene.globe.ellipsoid.geodeticSurfaceNormal(currentMarkerPositionCartesian);
                var planeNormal = this.empCesium.Cartesian3.subtract(scene.camera.position, currentMarkerPositionCartesian, new this.empCesium.Cartesian3());
                planeNormal = this.empCesium.Cartesian3.normalize(planeNormal, planeNormal);
                var plane = this.empCesium.Plane.fromPointNormal(currentMarkerPositionCartesian, planeNormal);
                var newCartesian = this.empCesium.IntersectionTests.rayPlane(ray, plane);
                if (newCartesian)
                {
                    var newCartographic = this.empCesium.viewer.scene.globe.ellipsoid.cartesianToCartographic(newCartesian);
                    if (!newCartographic)
                    {
                        //invalid cartesian... pointing to sky
                        return;
                    }
                    if (newCartographic.height < 0)
                    {
                        newCartographic.height = 0;
                        newCartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(newCartographic);
                    }
                    newCartographic.height = parseFloat(newCartographic.height.toFixed(4));
                    //an altitude no specified or undefined assume it is clamped to ground.
                    if ((this.empCesium.viewer.camera.pitch >= this.empCesium.Math.toRadians(-20)) && (this.empCesium.defined(this.empCesium.drawData.properties.altitudeMode) && (this.empCesium.drawData.properties.altitudeMode !== cesiumEngine.utils.AltitudeModeEnumType.ALTITUDE_CLAMP_TO_GROUND)))
                    {
                        // it is not a clampedToGround so let the user update the altitude. 
                        //tilted to 20 degrees or less so the background of the icon is the sky. Allow the updating of the altitude only at this pitch
                        markers.getBillboard(0).position = newCartesian;
                        if (this.empCesium.drawData.isLabel && Cesium.defined(label))
                        {
                            label.position = newCartesian;
                        }
                    }
                    else
                    {
                        // keep same altitude when the camera pitch is bigger than 10 degrees.
                        var height = Cesium.Ellipsoid.WGS84.cartesianToCartographic(markers.getBillboard(0).position).height;
                        if (!isNaN(height) && height >= 0)
                        {
                            height = parseFloat(height.toFixed(4));
                            newCartographic.height = height;
                            newCartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(newCartographic);
                            markers.getBillboard(0).position = newCartesian;
                            if (this.empCesium.drawData.isLabel && Cesium.defined(label))
                            {
                                label.position = newCartesian;
                            }
                        }
                        else
                        {
                            newCartographic.height = 0;
                            newCartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(newCartographic);
                            markers.getBillboard(0).position = newCartesian;
                            if (this.empCesium.drawData.isLabel && Cesium.defined(label))
                            {
                                label.position = newCartesian;
                            }
                        }
                    }
                    //                        currentMarkerPositionLL.height = carto.height;
                    //                        cartesian = this.empCesium.ellipsoid.cartographicToCartesian(currentMarkerPositionLL);

                    options.callbacks.dragHandlers.onDrag({positions: newCartographic, indices: [0]});
                     this.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                    
                }
                //tooltip.showAt(position, "<p>Position is: </p>" + getDisplayLatLngString(ellipsoid.cartesianToCartographic(cartesian)));
            }
//                   else if (markers.getBillboard(0) && dragging)
//                    {
//                        carto.height = height;//height stays the same when dragging to the sides.
//                        cartesian = this.empCesium.ellipsoid.cartographicToCartesian(carto);
//                        markers.getBillboard(0).position = cartesian;
//                        options.callbacks.dragHandlers.onDrag(0, [carto]);
//                        //tooltip.showAt(position, "<p>Position is: </p>" + getDisplayLatLngString(ellipsoid.cartesianToCartographic(cartesian)));
//                    }
            // }
            //  }
            //else
            //{
            //tooltip.showAt(position, "<p>Click on the globe to add your marker.</p>");
            //}
//            }
        }.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        mouseHandler.setInputAction(function (movement)
        {
            if (dragging && markers.getBillboard(0))
            {
                var carto = ellipsoid.cartesianToCartographic(markers.getBillboard(0).position);
                carto.height = parseFloat(carto.height.toFixed(4));
                scene.screenSpaceCameraController.enableRotate = true;
                scene.screenSpaceCameraController.enableTranslate = true;
                scene.screenSpaceCameraController.enableZoom = true;
                scene.screenSpaceCameraController.enableTilt = true;
                scene.screenSpaceCameraController.enableLook = true;
                // scene.screenSpaceCameraController.inertiaSpin =   0.9;
                //scene.screenSpaceCameraController.inertiaTranslate =   0.9;
                var delayUnlockingMapTimeOut = setTimeout(function ()
                {
                    scene.screenSpaceCameraController.enableRotate = true;
                    //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                    // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                    scene.screenSpaceCameraController.enableTranslate = true;
                    scene.screenSpaceCameraController.enableZoom = true;
                    scene.screenSpaceCameraController.enableTilt = true;
                    scene.screenSpaceCameraController.enableLook = true;
                }.bind(this), 70);
                //tooltip.setVisible(true);
                options.callbacks.dragHandlers.onDragEnd({positions: carto, indexes: []});
            }
            dragging = false;
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_UP);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.position;
            if (Cesium.defined(position))
            {
                var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                var carto = ellipsoid.cartesianToCartographic(cartesian);
                carto.height = parseFloat(carto.height.toFixed(4));
                //carto.height = height;
                //cartesian = ellipsoid.cartographicToCartesian(carto);
                if (markers.getBillboard(0))
                {
                    var delayUnlockingMapTimeOut = setTimeout(function ()
                    {
                        scene.screenSpaceCameraController.enableRotate = true;
                        //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                        // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                        scene.screenSpaceCameraController.enableTranslate = true;
                        scene.screenSpaceCameraController.enableZoom = true;
                        scene.screenSpaceCameraController.enableTilt = true;
                        scene.screenSpaceCameraController.enableLook = true;
                    }.bind(this), 70);
                    //scene.screenSpaceCameraController.inertiaSpin =   0.9;
                    //scene.screenSpaceCameraController.inertiaTranslate =   0.9;
                    options.callbacks.onDrawComplete({positions: carto, indexes: []});
                }
            }
            dragging = false;
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        if (options.hasOwnProperty('callbacks') && options.callbacks.hasOwnProperty('onDrawStart'))
        {
            if (typeof (options.callbacks.onDrawStart) === 'function')
            {
                //options.callbacks.onDrawStart((options.position ? options.position : []));
                if (Cesium.defined(options.position))
                {
                    options.position.height = parseFloat(options.position.height.toFixed(4));
                }
                options.callbacks.onDrawStart({positions: options.position, indices: []});
            }
        }
    };
    _.prototype.startDrawingPolygon = function (options)
    {
        var options = copyOptions(options, defaultSurfaceOptions);
        this.startDrawingPolyshape(true, options);
    };
//     _.prototype.startDrawingcategoryRectangleParameteredAutoShape = function (options) {
//        var options = copyOptions(options, defaultSurfaceOptions);
//        this.startDrawingPolyshape(true, options);
//    }

    _.prototype.startDrawingPolyline = function (options)
    {
        var options = copyOptions(options, defaultPolylineOptions);
        this.startDrawingPolyshape(false, options);
    };
    _.prototype.startDrawingPolyshape = function (isPolygon, options)
    {
        this.startDrawing(function ()
        {
            if (oRenderedGraphic)
            {
                _self.empCesium.viewer.entities.remove(oRenderedGraphic);
            }
            primitives.remove(poly);
            if (markers)
                markers.remove();
            if (mouseHandler)
                mouseHandler.destroy();
            // tooltip.setVisible(false);
            if (positions && positions.length > 1)
            {
                // removing last position added while clicking the finish button on the editor toolbar
                positions.splice(positions.length - 1, 1);
                return  Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions);
            }
        });
        var _self = this;
        var scene = this._scene;
        var primitives = scene.primitives;
        var tooltip = this._tooltip;
        var dragging = false;
        var beforeDraggingCartesian = undefined;
        var minPoints = isPolygon ? 3 : 2;
        var poly;
        var oRectangle;
        var oModifiers;
        var oRenderedGraphic;
        var oDrawItem = this.empCesium.drawData;
        var oProperties;
        if (oDrawItem.properties)
        {
            oProperties = emp.helpers.copyObject(oDrawItem.properties);
        }
        else
        {
            oProperties = {};
        }

        var isMilStd = false;
        if (oProperties.modifiers)
        {
            isMilStd = true;
            oModifiers = oProperties.modifiers || {};
            var viewDistanceMeters = this.empCesium.leftToRightViewDistanceMeters();
            // Check if the symbol has the required modifiers.
            var checkResult = cesiumEngine.utils.checkForRequiredModifiers(oDrawItem.item, viewDistanceMeters);
            // If some modifiers are missing as reported by the checkForRequiredModifiers,
            // override the current modifiers so they render with the missing parameters.
            // this will have the effect of making items grow or shrink as you zoom in
            // and out.  This was intentionally requested by developer of content management
            // widget.
            for (override in checkResult)
            {
                oModifiers[override] = checkResult[override];
            }
            oProperties.modifiers = emp.helpers.copyObject(oModifiers);
            //oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
            oModifiers = emp.typeLibrary.utils.milstd.convertModifierStringTo2525(oModifiers, this.empCesium.showLabels);
        }

        if (isPolygon)
        {
            poly = new DrawHelper.PolygonPrimitive(options);
        }
        else
        {
            poly = new DrawHelper.PolylinePrimitive(options);
        }
        poly.asynchronous = false;
        poly.show = true;
        poly.featureType = EmpCesiumConstants.featureType.PRIMITIVE;
        this.empCesium.primitives.add(poly);
        ////this.layer.addFeature(poly);  
        //primitives.add(poly);

        var positions = [];   //cartesian array
        var cartographics = this.empCesium.drawData.coordinates;
        var markers = new _.BillboardGroup(this, defaultBillboard), indices;
        if (cartographics && cartographics.length > 0)
        {
            // initial line
            positions = this.empCesium.ellipsoid.cartographicArrayToCartesianArray(cartographics);
            // positions.push(cartesian.clone());
            for (var index = 0; index < positions.length; index++)
            {
                markers.addBillboard(positions[index], "vertex");
            }
            if (!Cesium.Math.equalsEpsilon(this.empCesium.viewer.camera.positionCartographic.height, this.lastCameraHeight, Cesium.Math.EPSILON5))
            {
                for (var markerIndex = 0; markerIndex < markers._orderedBillboards.length; ++markerIndex)
                {
                    markers._orderedBillboards[markerIndex].eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(this.empCesium.viewer.camera.positionCartographic.height, this.lastCameraHeight);
                }
            }
            this.lastCameraHeight = this.empCesium.viewer.camera.positionCartographic.height;
            markers.setOnTop();
            //}
            if (positions.length > 0)
            {
                indices = cesiumEngine.utils.fillArrayWithNumbers(positions.length);
                options.callbacks.onDrawStart({positions: Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions), indices: indices});
                //options.callbacks.onDrawUpdate({positions: Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions), indices: indices});
            }
            if (positions.length >= minPoints)
            {
                poly.positions = positions;
                poly._createPrimitive = true;
                if (isMilStd)
                {
                    renderMilStdGraphic();
                }
                //options.callbacks.onDrawUpdate(Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions));
            }
//            else
//            {
//                options.callbacks.onDrawUpdate(Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions));
//            }

        }

        var renderMilStdGraphic = function ()
        {
            //setTimeout($.proxy(function ()
            //{
            var oRenderModifiers = emp.helpers.copyObject(oModifiers);
            var oExtent = this.empCesium.getExtent();
            var sExtents = oExtent.west.toDeg() + "," + oExtent.south.toDeg() + "," + oExtent.east.toDeg() + "," + oExtent.north.toDeg();
            var sCoordinates = cesiumEngine.utils.convertCartographicsToSECRendererCoordsString(Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions));
            //var centerCartographic = oCoordVerticalOneCLL.midpointTo(oCoordverticalTwoCLL);
            //var azimuth = centerCartographic.getAzimuth(oCoordVerticalOneCLL);
            var oMaterial;
            var oRenderData;
            var cartographics = Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions);
            //azimuth = azimuth.toRad();

            //azimuth = Cesium.Math.PI_OVER_TWO - azimuth;

            //oRenderModifiers[emp.typeLibrary.utils.milstd.StringModifiers.LINE_COLOR] = EmpCesiumConstants.selectionProperties.COLOR_HEX;
            //oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dWidth]; // asigne back to oModifiers@@
            //oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = [azimuth.toDeg()]; // asigne back to oModifiers@@

            //oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, "clampToGround", this.empCesium.getScale(), sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType. CANVAS_LABEL_ONLY, _self.empCesium.drawData.standard);
            oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol2D(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.item.symbolCode, sCoordinates, this.empCesium.canvas.width, this.empCesium.canvas.height, sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS_LABEL_ONLY, _self.empCesium.drawData.standard);
            if (oRenderData && (typeof (oRenderData) === 'string'))
            {
                new emp.typeLibrary.Error({
                    level: emp.typeLibrary.Error.level.CATASTROPHIC,
                    message: "RenderSymbol2D return: " + oRenderData
                });
                return;
            }
            oMaterial = new _self.empCesium.ImageMaterialProperty();
            oMaterial.image = oRenderData.image;
            oMaterial.transparent = true;
            if (!Cesium.defined(oRenderData.west) || !Cesium.defined(oRenderData.south) || !Cesium.defined(oRenderData.east) || !Cesium.defined(oRenderData.north))
            {
                oRectangle = Cesium.Rectangle.fromCartographicArray(cartographics);
            }
            else
            {
                oRectangle = Cesium.Rectangle.fromDegrees(oRenderData.west.x, oRenderData.south.y, oRenderData.east.x, oRenderData.north.y);
            }

            if (oRenderedGraphic)
            {
                oRenderedGraphic.rectangle.material.image = oRenderData.image;
                _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
            }
            else
            {
                oRenderedGraphic = new _self.empCesium.Entity({
                    id: oDrawItem.drawFeatureId,
                    selectable: true,
                    show: true,
                    rectangle: {
                        coordinates: getLatestRectangleCallbackProperty,
                        material: oMaterial
                    }
                });
                oRenderedGraphic.featureId = oDrawItem.drawFeatureId;
                oRenderedGraphic.coreId = oDrawItem.coreId;
                oRenderedGraphic.overlayId = oDrawItem.overlayId;
                oRenderedGraphic.symbolCode = oDrawItem.symbolCode;
                oRenderedGraphic._editMode = true;
                oRenderedGraphic.featureType = EmpCesiumConstants.featureType.ENTITY;
                oRenderedGraphic = _self.empCesium.viewer.entities.add(oRenderedGraphic);
            }
            _self.muteHandlers(false);
        }.bind(this);
        _self.empCesium.currentMultiPointEditorRenderGraphicFuction = renderMilStdGraphic;

        

        var getLatestRectangleCallbackProperty = new Cesium.CallbackProperty(function getRectangle(time, result)
        {
            return Cesium.Rectangle.clone(oRectangle, result);
        }, false);

        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        // Now wait for start
        mouseHandler.setInputAction(function (movement)
        {
            var indices = [];
            if (Cesium.defined(movement.position))
            {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian)
                {
                    // first click
                    //if (positions.length == 0) {
                    if (this.empCesium.drawData.symbolDef && positions.length >= this.empCesium.drawData.symbolDef.maxPoints)
                    {
                        return;
                    }
                    positions.push(cartesian.clone());
                    markers.addBillboard(positions[positions.length - 1], "vertex");
                    if (!Cesium.Math.equalsEpsilon(this.empCesium.viewer.camera.positionCartographic.height, this.lastCameraHeight, Cesium.Math.EPSILON5))
                    {
                        for (var markerIndex = 0; markerIndex < markers._orderedBillboards.length; ++markerIndex)
                        {
                            markers._orderedBillboards[markerIndex].eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(this.empCesium.viewer.camera.positionCartographic.height, this.lastCameraHeight);
                        }
                    }
                    this.lastCameraHeight = this.empCesium.viewer.camera.positionCartographic.height;
                    markers.setOnTop();

                    if (this.empCesium.drawData.symbolDef && positions.length === this.empCesium.drawData.symbolDef.maxPoints)
                    {
                        if (typeof options.callbacks.onDrawEnd === 'function')
                        {
                            options.callbacks.onDrawEnd({positions: Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions), indices: []});
                        }
                        _self.stopDrawing();
                    }
                    else if (positions.length === 1)
                    {
                        options.callbacks.onDrawStart({positions: Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions), indices: []});
                        //options.callbacks.onDrawUpdate({positions: Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions), indices: []});

                    }
                    else if (positions.length >= minPoints)
                    {
                        poly.positions = positions;
                        poly._createPrimitive = true;
                        indices = cesiumEngine.utils.fillArrayWithNumbers(positions.length);
                        if (isMilStd)
                        {
                            renderMilStdGraphic();
                        }
                        this.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                        options.callbacks.onDrawUpdate({positions: Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions), indices: indices});
                    }
                    else
                    {
                        indices = cesiumEngine.utils.fillArrayWithNumbers(positions.length);
                        options.callbacks.onDrawUpdate({positions: Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions), indices: indices});
                    }
                    // add new point to polygon
                    // this one will move with the mouse
                    //positions.push(cartesian);
                    // add marker at the new position
                    //markers.addBillboard(cartesian, "vertex");
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        mouseHandler.setInputAction(function (movement)
        {
            if (Cesium.defined(movement.position))
            {
                var pickedObject = scene.pick(movement.position);
                var isDrawingPolyShapePicked = false;
                if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.id.id) && (pickedObject.id.id === options.id || pickedObject.id.id === "drawing_polyshape_id"))
                {
                    //primitive case
                    isDrawingPolyShapePicked = true;
                }
                else if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.id.id) && typeof (pickedObject.id.id) === "string" && pickedObject.id.id === "drawing_polyshape_id")
                {
                    // entity case ?
                    isDrawingPolyShapePicked = true;
                }
                if (isDrawingPolyShapePicked)
                {
                    //markers.getBillboard(0).
                    dragging = this.empCesium.editorFeatureDraggingEnable;
                    beforeDraggingCartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                    scene.screenSpaceCameraController.enableRotate = false;
                    scene.screenSpaceCameraController.enableTranslate = false;
                    scene.screenSpaceCameraController.enableZoom = true;
                    scene.screenSpaceCameraController.enableTilt = true;
                    scene.screenSpaceCameraController.enableLook = true;
                    //scene.screenSpaceCameraController.inertiaSpin =  0;
                    // scene.screenSpaceCameraController.inertiaTranslate =  0;
                    //markers.getBillboard(0).enableRotation(false);
                    // tooltip.setVisible(true);
                }
                markers.setOnTop();
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOWN);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.endPosition, indices;
            if (Cesium.defined(position))
            {
                if (positions.length === 0)
                {
                    // tooltip.showAt(position, "<p>Click to add first point</p>");
                }
                else
                {
                    // tooltip.setVisible(false);
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian && dragging)
                    {
                        var deltaX = beforeDraggingCartesian.x - cartesian.x;
                        var deltaY = beforeDraggingCartesian.y - cartesian.y;
                        for (var index = 0; index < poly.positions.length; index++)
                        {
                            var position = poly.positions[index];
                            position.x = position.x + deltaX;
                            position.y = position.y + deltaY;
                        }
                        indices = cesiumEngine.utils.fillArrayWithNumbers(positions.length);
                        var cartographics = Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(poly.positions);
                        for (var index = 0; index < cartographics.length; index++)
                        {
                            cartographics[index].height = (cartographics[index].height < 0) ? 0 : cartographics[index].height;
                        }
                        if (isMilStd)
                        {
                            renderMilStdGraphic();
                        }
                        this.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                        options.callbacks.dragHandlers.onDrag({positions: cartographics, indices: indices});
                        // tooltip.showAt(position, "<p>Position is: </p>" + getDisplayLatLngString(ellipsoid.cartesianToCartographic(cartesian)));

                    }
                    else if (cartesian)
                    {
//                        positions.pop();
//                        // make sure it is slightly different
//                        cartesian.y += (1 + Math.random());
//                        positions.push(cartesian);
//                        if (positions.length >= minPoints) {
//                            poly.positions = positions;
//                            poly._createPrimitive = true;
//                            options.callbacks.onDrawUpdate(Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(poly.positions));
//                        }
//                        // update marker
//                        markers.getBillboard(positions.length - 1).position = cartesian;
//
//                        // show tooltip
//                        tooltip.showAt(position, "<p>Click to add new point (" + positions.length + ")</p>" + (positions.length > minPoints ? "<p>Double click to finish drawing</p>" : ""));
                    }
                }
            }
            for (var markerIndex = 0; markerIndex < markers._orderedBillboards.length; ++markerIndex)
            {
                markers._orderedBillboards[markerIndex].eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(this.empCesium.viewer.camera.positionCartographic.height, this.lastCameraHeight);
            }
            this.lastCameraHeight = this.empCesium.viewer.camera.positionCartographic.height;
            markers.setOnTop();
        }.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        mouseHandler.setInputAction(function (movement)
        {
            if (dragging)
            {
                var delayUnlockingMapTimeOut = setTimeout(function ()
                {
                    scene.screenSpaceCameraController.enableRotate = true;
                    //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                    // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                    scene.screenSpaceCameraController.enableTranslate = true;
                    scene.screenSpaceCameraController.enableZoom = true;
                    scene.screenSpaceCameraController.enableTilt = true;
                    scene.screenSpaceCameraController.enableLook = true;
                }.bind(this), 70);
                //tooltip.setVisible(true);
                //options.callbacks.dragHandlers.onDragEnd(0, cartesian);
            }
            dragging = false;
            markers.setOnTop();
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_UP);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.position;
            if (Cesium.defined(position))
            {
                if (positions.length < minPoints + 2)
                {
                    return;
                }
                else
                {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian)
                    {
                        _self.stopDrawing();
                        if (typeof options.callbacks.onDrawEnd === 'function')
                        {
                            // remove overlapping ones
                            var index = positions.length - 1;
                            // TODO - calculate some epsilon based on the zoom level
                            var epsilon = Cesium.Math.EPSILON3;
                            for (; index > 0 && positions[index].equalsEpsilon(positions[index - 1], epsilon); index--)
                            {
                            }
                            options.callbacks.onDrawEnd({positions: Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions.splice(0, index + 1)), indices: []});
                        }
                    }
                }
                markers.setOnTop();
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    };
    _.prototype.startDrawingSuperAutoShape = function (options)
    {
        var options = copyOptions(options, defaultSurfaceOptions);
        options.scale = 4.0;
        var _self = this;
        var scene = this._scene;
        var primitives = this._scene.primitives;
        var dragging = false;
        var beforeDraggingCartesian = undefined;
        var tooltip = this._tooltip;
        var firstPoint;
        var azimuth = 0;
        var markers;
        var isDrawingRectangleShapePicked = false;
        var dWidth = 5000;
        var centerPosition;
        var markerCallbacks = {};
        var oRenderedGraphic;
        var oRectangle;
        var oCoordVerticalOneCLL;
        var oCoordverticalTwoCLL;
        var oCoordHorizontalCLL;
        var oDrawItem = options.item;
        var oProperties = oDrawItem.properties || {};
        var oModifiers = oProperties.modifiers || {};
        var dSectorDistance;
        markerCallbacks.dragHandlers = {};
        oDrawItem.properties = oProperties;
        oDrawItem.id = options.id;
        var renderGraphic = function ()
        {
            //setTimeout($.proxy(function ()
            //{
            try
            {
                var oRenderModifiers = emp.helpers.copyObject(oModifiers);
                var oExtent = this.empCesium.getExtent();
                var sExtents = oExtent.west.toDeg() + "," + oExtent.south.toDeg() + "," + oExtent.east.toDeg() + "," + oExtent.north.toDeg();
                var sCoordinates = cesiumEngine.utils.convertCartographicsToSECRendererCoordsString([oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL]);
                var centerCartographic = oCoordVerticalOneCLL.midpointTo(oCoordverticalTwoCLL);
                var azimuth = centerCartographic.getAzimuth(oCoordVerticalOneCLL);
                var oMaterial;
                var oRenderData;
                var cartographics = [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL];
                azimuth = azimuth.toRad();

                //azimuth = Cesium.Math.PI_OVER_TWO - azimuth;

                oRenderModifiers[emp.typeLibrary.utils.milstd.StringModifiers.LINE_COLOR] = EmpCesiumConstants.selectionProperties.COLOR_HEX;
                //oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dWidth]; // asigne back to oModifiers@@
                //oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = [azimuth.toDeg()]; // asigne back to oModifiers@@

                //oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, "clampToGround", this.empCesium.getScale(), sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
                oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol2D(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, this.empCesium.canvas.width, this.empCesium.canvas.height, sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
                if (oRenderData && (typeof (oRenderData) === 'string'))
                {
                    new emp.typeLibrary.Error({
                        level: emp.typeLibrary.Error.level.CATASTROPHIC,
                        message: "RenderSymbol2D return: " + oRenderData
                    });
                    return;
                }
                oMaterial = new _self.empCesium.ImageMaterialProperty();
                oMaterial.image = oRenderData.image;
                oMaterial.transparent = true;

                // oRectangle = Cesium.Rectangle.fromDegrees(oRenderData.west.x, oRenderData.south.y, oRenderData.east.x, oRenderData.north.y);
                if (!Cesium.defined(oRenderData.west) || !Cesium.defined(oRenderData.south) || !Cesium.defined(oRenderData.east) || !Cesium.defined(oRenderData.north))
                {
                    oRectangle = Cesium.Rectangle.fromCartographicArray(cartographics);
                }
                else
                {
                    oRectangle = Cesium.Rectangle.fromDegrees(oRenderData.west.x, oRenderData.south.y, oRenderData.east.x, oRenderData.north.y);
                }

                if (oRenderedGraphic)
                {
                    oRenderedGraphic.rectangle.material.image = oRenderData.image;
                    _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                }
                else
                {
                    oRenderedGraphic = new _self.empCesium.Entity({
                        id: oDrawItem.id,
                        selectable: true,
                        show: true,
                        rectangle: {
                            coordinates: getLatestRectangleCallbackProperty,
                            material: oMaterial
                        }
                    });
                    oRenderedGraphic.featureId = oDrawItem.featureId;
                    oRenderedGraphic.coreId = oDrawItem.coreId;
                    oRenderedGraphic.overlayId = oDrawItem.overlayId;
                    oRenderedGraphic.symbolCode = oDrawItem.symbolCode;
                    oRenderedGraphic._editMode = true;
                    oRenderedGraphic.featureType = EmpCesiumConstants.featureType.ENTITY;
                    oRenderedGraphic = _self.empCesium.viewer.entities.add(oRenderedGraphic);
                }
                _self.muteHandlers(false);
            }
            catch (e)
            {
                console.log("startDrawingSuperAutoShape - renderGraphic() error: " + e);
            }
        }.bind(this);
        
          _self.empCesium.currentMultiPointEditorRenderGraphicFuction = renderGraphic;
          
          
        var getLatestRectangleCallbackProperty = new Cesium.CallbackProperty(function getRectangle(time, result)
        {
            return Cesium.Rectangle.clone(oRectangle, result);
        }, false);
        this.startDrawing(
                function ()
                {
                    if (oRenderedGraphic)
                    {
                        _self.empCesium.viewer.entities.remove(oRenderedGraphic);
                    }
                    if (markers)
                    {
                        markers.remove();
                    }
                    mouseHandler.destroy();
                    //tooltip.setVisible(false);
                }
        );
        markerCallbacks.drawEnd = function (positions)
        {
            console.log("1976 markerCallbacks.drawEnd used ");
            options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL], properties: oProperties, indices: []});
        };
        markerCallbacks.drawUpdate = function (positions)
        {
            //ojo index????
            console.log("1982 markerCallbacks.drawUpdate used ");
            options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL], properties: oProperties, indices: []});
        };
        markerCallbacks.onDrawStart = function (positions)
        {
            console.log("1987 markerCallbacks.onDrawStart used ");
            options.callbacks.onDrawStart({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL], properties: oProperties, indices: []});
        };
        markerCallbacks.dragHandlers.onDrag = function (data)// (index, position)
        {
            var value;
            if (data.index === 0)
            {
                var oldCenterCartographic = oCoordVerticalOneCLL.midpointTo(oCoordverticalTwoCLL);
                var oldBearing = oCoordverticalTwoCLL.bearingTo(oCoordVerticalOneCLL);// degrees
                var horizontalDist = oldCenterCartographic.distanceTo(oCoordHorizontalCLL);
                var oldBearingTwoToThree = oCoordverticalTwoCLL.bearingTo(oCoordHorizontalCLL);// degrees
                var previousHeight = oCoordVerticalOneCLL.height;
                oCoordVerticalOneCLL = data.position;
                oCoordVerticalOneCLL.height = previousHeight;
                var newCenterCartographic = oCoordVerticalOneCLL.midpointTo(oCoordverticalTwoCLL);
                var newBearing = oCoordverticalTwoCLL.bearingTo(oCoordVerticalOneCLL);// degrees
                var deltaBearing = oldBearing - newBearing;
                var distOneToTwo = oCoordVerticalOneCLL.distanceTo(oCoordverticalTwoCLL);
                var distTwoToThree = Math.hypot(distOneToTwo / 2, horizontalDist);
                previousHeight = oCoordVerticalOneCLL.height;
                oCoordHorizontalCLL = oCoordverticalTwoCLL.destinationPoint(oldBearingTwoToThree - deltaBearing, distTwoToThree);
                oCoordHorizontalCLL.height = previousHeight;
            }
            else if (data.index === 1)
            {
                var oldCenterCartographic = oCoordVerticalOneCLL.midpointTo(oCoordverticalTwoCLL);
                var oldBearing = oCoordVerticalOneCLL.bearingTo(oCoordverticalTwoCLL);// degrees
                var horizontalDist = oldCenterCartographic.distanceTo(oCoordHorizontalCLL);
                var oldBearingOneToThree = oCoordVerticalOneCLL.bearingTo(oCoordHorizontalCLL);// degrees
                var previousHeight = oCoordverticalTwoCLL.height;
                oCoordverticalTwoCLL = data.position;

                oCoordverticalTwoCLL.height = previousHeight;
                var newCenterCartographic = oCoordVerticalOneCLL.midpointTo(oCoordverticalTwoCLL);
                var newBearing = oCoordVerticalOneCLL.bearingTo(oCoordverticalTwoCLL);// degrees
                var deltaBearing = oldBearing - newBearing;
                var distOneToTwo = oCoordVerticalOneCLL.distanceTo(oCoordverticalTwoCLL);
                var distOneToThree = Math.hypot(distOneToTwo / 2, horizontalDist);
                previousHeight = oCoordHorizontalCLL.height;
                oCoordHorizontalCLL = oCoordVerticalOneCLL.destinationPoint(oldBearingOneToThree - deltaBearing, distOneToThree);
                oCoordHorizontalCLL.height = previousHeight;
            }
            else if (data.index === 2)
            {
                //width or top control point
                var oNewCoordHorizontalCLL = data.position;
                var centerCartographic = oCoordVerticalOneCLL.midpointTo(oCoordverticalTwoCLL);
                var bearing = centerCartographic.bearingTo(oCoordHorizontalCLL); // degrees
                var zeta = centerCartographic.bearingTo(oNewCoordHorizontalCLL); // degrees
                var zeta = 90 - zeta;
                zeta = zeta.toRad();
                var dist = centerCartographic.distanceTo(oNewCoordHorizontalCLL);
                var dAdyacentDistance = Math.abs(dist * Math.cos(zeta));
                if (oNewCoordHorizontalCLL.longitude <= centerCartographic.longitude && oCoordHorizontalCLL.longitude >= centerCartographic.longitude)
                {
                    // detect when the direction control point (block task) crosses the top of the T. When crossing the
                    // bearing changes sign (bearing from true north)
                    bearing += 180;
                }
                else if (oNewCoordHorizontalCLL.longitude >= centerCartographic.longitude && oCoordHorizontalCLL.longitude <= centerCartographic.longitude)
                {
                    // detect when the direction control point (block task) crosses the top of the T. When crossing the
                    // bearing changes sign (bearing from true north)
                    bearing += 180;
                }
                var previousHeight = oCoordverticalTwoCLL.height;
                oCoordHorizontalCLL = centerCartographic.destinationPoint(bearing, dist);
                oCoordHorizontalCLL.height = previousHeight;
            }
            renderGraphic();
            updateMarkers();
            //  LatLon.prototype.midpointTo = function (point)
            //var westPoint = value.west;
            //var eastPoint = value.east;
            options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL], properties: oProperties, indices: [data.index]});
        };
        markerCallbacks.dragHandlers.onDragEnd = function (data)
        {
            options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL], properties: oProperties, indices: [data.index]});
        };
        function updateMarkers()
        {
            var centerCartographic;
            var width, height;
            //var corners = getExtentCorners(oRenderedGraphic.rectangle);
            // create if they do not yet exist
            if (!Cesium.defined(markers))
            {
                if (oCoordVerticalOneCLL && oCoordverticalTwoCLL && oCoordHorizontalCLL)
                {
                    markers = new _.BillboardGroup(_self, defaultBillboard);
                    markers.addBillboard(oCoordVerticalOneCLL.toCartesian(), markerCallbacks, "right"); // index == 0
                    markers.addBillboard(oCoordverticalTwoCLL.toCartesian(), markerCallbacks, "left"); // index == 1
                    markers.addBillboard(oCoordHorizontalCLL.toCartesian(), markerCallbacks, "width"); // index== 2
                    _self._editedSurface = {};
                    _self._editedSurface._editMarkers = markers;
                    ////_editedSurface._editMarkers._orderedBillboards
                }
                //dWidth = height;// confusing but the height of a reactanglew is interpreseted as the width in the mil std spc.
                //oRenderedGraphic.centerCartographic = centerCartographic;
            }
            else
            {
                if (oCoordVerticalOneCLL && oCoordverticalTwoCLL && oCoordHorizontalCLL)
                {
                    var cpCoodinates = [oCoordVerticalOneCLL.toCartesian(), oCoordverticalTwoCLL.toCartesian(), oCoordHorizontalCLL.toCartesian()];
                    markers.updateBillboardsPositions(cpCoodinates);
                }
            }
            for (var markerIndex = 0; markerIndex < markers._orderedBillboards.length; ++markerIndex)
            {
                markers._orderedBillboards[markerIndex].eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(_self.empCesium.viewer.camera.positionCartographic.height, _self.lastCameraHeight);
            }
            _self.lastCameraHeight = _self.empCesium.viewer.camera.positionCartographic.height;
            markers.setOnTop();
            _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        }
        ;
        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        mouseHandler.setInputAction(function (movement)
        {
            if (Cesium.defined(movement.position))
            {
                var pickedObject = scene.pick(movement.position);
                var isDrawingRectangleShapePicked = false;
                if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.primitive) && Cesium.defined(pickedObject.primitive.id) && (pickedObject.primitive.id === options.id))
                {
                    //primitive case
                    isDrawingRectangleShapePicked = true;
                }
                else if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.id.id) && typeof (pickedObject.id.id) === "string" && pickedObject.id.id === options.id)
                {
                    // entity case ?
                    isDrawingRectangleShapePicked = true;
                }
                if (isDrawingRectangleShapePicked)
                {
                    //markers.getBillboard(0).
                    dragging = this.empCesium.editorFeatureDraggingEnable;
                    beforeDraggingCartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                    scene.screenSpaceCameraController.enableRotate = false;
                    scene.screenSpaceCameraController.enableTranslate = false;
                    scene.screenSpaceCameraController.enableZoom = true;
                    scene.screenSpaceCameraController.enableTilt = true;
                    scene.screenSpaceCameraController.enableLook = true;
                    //scene.screenSpaceCameraController.inertiaSpin =  0;
                    //scene.screenSpaceCameraController.inertiaTranslate =  0;
                    //markers.getBillboard(0).enableRotation(false);
                    //tooltip.setVisible(false);
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOWN);
        // Now wait for start
        mouseHandler.setInputAction(function (movement)
        {
            var indices;
            if (Cesium.defined(movement.position))
            {
                var oMousePos = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                var pickedObject = scene.pick(movement.position);
                if (pickedObject && (pickedObject.primitive instanceof Cesium.Billboard))
                {
                    // If the Dblclick happened over a Billboard or the collection ignore it.
                    return;
                }

                if (oMousePos)
                {
                    oMousePos = oMousePos.clone();
                    if (!oRenderedGraphic)
                    {
                        // create the rectangle
                        var currentExtent = this.empCesium.getExtent();
                        var centerCartographic = Cesium.Rectangle.center(currentExtent);
                        var widthCurrentView = currentExtent.height; //radians
                        oMousePos = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oMousePos);
                        widthCurrentView = Cesium.Math.toDegrees(widthCurrentView); //degrees
                        widthCurrentView = widthCurrentView * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude)); // meters
                        dSectorDistance = Math.round(widthCurrentView / 4.0);
                        oCoordVerticalOneCLL = oMousePos.destinationPoint(0, dSectorDistance / 2);
                        oCoordverticalTwoCLL = oMousePos.destinationPoint(180, dSectorDistance / 2);
                        oCoordHorizontalCLL = oMousePos.destinationPoint(90, dSectorDistance);

                        oCoordVerticalOneCLL.height = (oCoordVerticalOneCLL.height < 0) ? 0 : oCoordVerticalOneCLL.height;
                        oCoordverticalTwoCLL.height = (oCoordverticalTwoCLL.height < 0) ? 0 : oCoordverticalTwoCLL.height;
                        oCoordHorizontalCLL.height = (oCoordHorizontalCLL.height < 0) ? 0 : oCoordHorizontalCLL.height;

                        renderGraphic();
                        updateMarkers();
                        //tooltip.setVisible(false);
                        indices = cesiumEngine.utils.fillArrayWithNumbers(3);
                        options.callbacks.onDrawStart({
                            positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL],
                            properties: oProperties,
                            indices: indices
                        });
                        options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL], properties: oProperties, indices: indices});
                    }
                    if (typeof options.callbacks.onDrawUpdate === 'function')
                    {
                        //options.callbacks.dragHandlers.drawUpdate({positions: [extent.centerCartesian], width: extent.widthMeters, height: extent.heightMeters, azimuth: extent.rotation});
                        //options.callbacks.onDrawUpdate({positions: [extent.centerCartesian], width: extent.widthMeters, height: extent.heightMeters, azimuth: extent.rotation});
                        options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL], properties: oProperties, indices: []});
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.endPosition, indices;
            if (Cesium.defined(position))
            {
                if (!oRenderedGraphic)
                {
                    return;
                    //tooltip.setVisible(true);
                    //tooltip.showAt(position, "<p>Click to start drawing rectangle</p>");
                }
                else
                {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian && dragging)
                    {
                        var deltaCartesian = new Cesium.Cartesian3();
                        deltaCartesian = Cesium.Cartesian3.subtract(beforeDraggingCartesian, cartesian, deltaCartesian);
                        var deltaX = deltaCartesian.x;
                        var deltaY = deltaCartesian.y;
                        var deltaZ = deltaCartesian.z;
                        var oCoordVerticalOneCXY = oCoordVerticalOneCLL.toCartesian();
                        oCoordVerticalOneCXY.x -= deltaX;
                        oCoordVerticalOneCXY.y -= deltaY;
                        oCoordVerticalOneCXY.z -= deltaZ;
                        var previousHeight = oCoordVerticalOneCLL.height;
                        oCoordVerticalOneCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCoordVerticalOneCXY);
                        oCoordVerticalOneCLL.height = previousHeight;
                        var oCoordverticalTwoCXY = oCoordverticalTwoCLL.toCartesian();
                        oCoordverticalTwoCXY.x -= deltaX;
                        oCoordverticalTwoCXY.y -= deltaY;
                        oCoordverticalTwoCXY.z -= deltaZ;
                        previousHeight = oCoordverticalTwoCLL.height;
                        oCoordverticalTwoCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCoordverticalTwoCXY);
                        oCoordverticalTwoCLL.height = previousHeight;
                        var oCoordHorizontalCXY = oCoordHorizontalCLL.toCartesian();
                        oCoordHorizontalCXY.x -= deltaX;
                        oCoordHorizontalCXY.y -= deltaY;
                        oCoordHorizontalCXY.z -= deltaZ;
                        previousHeight = oCoordHorizontalCLL.height;
                        oCoordHorizontalCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCoordHorizontalCXY);
                        oCoordHorizontalCLL.height = previousHeight;
                        renderGraphic();
                        updateMarkers();
                        beforeDraggingCartesian = cartesian;
                        indices = cesiumEngine.utils.fillArrayWithNumbers(3);
                        if (typeof options.callbacks.onDrawUpdate === 'function')
                        {
                            options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL], properties: oProperties, indices: indices});
                        }
                        //tooltip.setVisible(false);
                    }
                    else if (cartesian && !dragging)
                    {
                        // tooltip.setVisible(false);
                        //tooltip.showAt(position, "<p>Drag control points to change rectangle extent</p><p>Click again to finish drawing</p>");
                    }
                    _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.position;
            if (Cesium.defined(position))
            {
                if (!oRenderedGraphic)
                {
                    return;
                }
                else
                {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian)
                    {
                        _self.stopDrawing();
                        if (typeof options.callbacks.onDrawEnd === 'function')
                        {
                            options.callbacks.onDrawEnd({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL], properties: oProperties, indices: []});
                        }
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        mouseHandler.setInputAction(function (movement)
        {
            if (dragging)
            {
                var delayUnlockingMapTimeOut = setTimeout(function ()
                {
                    scene.screenSpaceCameraController.enableRotate = true;
                    //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                    // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                    scene.screenSpaceCameraController.enableTranslate = true;
                    scene.screenSpaceCameraController.enableZoom = true;
                    scene.screenSpaceCameraController.enableTilt = true;
                    scene.screenSpaceCameraController.enableLook = true;
                }.bind(this), 70);
            }
            dragging = false;
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_UP);

        if (this.empCesium.defined(options.item.originFeature))
                // if (options.item.hasOwnProperty('originFeature'))
                        // if (options.item.hasOwnProperty('originFeature') && (options.item.originFeature instanceof emp.typeLibrary.Feature))
                        {
                            // editing existing
                            oDrawItem.symbolCode = oDrawItem.originFeature.data.symbolCode;
                            var cartographics = cesiumEngine.utils.convertGeoJsonCoordToCartographicList(oDrawItem.originFeature.data);
                            oCoordVerticalOneCLL = cartographics[0];
                            oCoordverticalTwoCLL = cartographics[1];
                            oCoordHorizontalCLL = cartographics[2];
                            //oCoordVerticalOneCLL = new Cesium.Cartographic(oDrawItem.originFeature.data.coordinates[0][0].toRad(), oDrawItem.originFeature.data.coordinates[0][1].toRad(), 0);
                            //oCoordverticalTwoCLL = new Cesium.Cartographic(oDrawItem.originFeature.data.coordinates[1][0].toRad(), oDrawItem.originFeature.data.coordinates[1][1].toRad(), 0);
                            //oCoordHorizontalCLL = new Cesium.Cartographic(oDrawItem.originFeature.data.coordinates[2][0].toRad(), oDrawItem.originFeature.data.coordinates[2][1].toRad(), 0);
                            oProperties = emp.helpers.copyObject(oDrawItem.originFeature.properties);
                            oModifiers = oProperties.modifiers || {};
                            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                            oProperties.modifiers = oModifiers;
                            renderGraphic();
                            updateMarkers();
                            options.callbacks.onDrawStart({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL], properties: oProperties, indices: []});
                            // options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL], properties: oProperties, indices: []});

                        }
                else if (this.empCesium.drawData.coordinates && this.empCesium.drawData.coordinates.length === 3)
                {
                    // new draw with 3 coordinates required included
                    var cartographics = this.empCesium.drawData.coordinates, indices;
                    oCoordVerticalOneCLL = cartographics[0];
                    oCoordverticalTwoCLL = cartographics[1];
                    oCoordHorizontalCLL = cartographics[2];
                    oProperties = emp.helpers.copyObject(oDrawItem.properties);
                    oModifiers = oProperties.modifiers || {};
                    oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                    oProperties.modifiers = oModifiers;
                    renderGraphic();
                    updateMarkers();
                    indices = cesiumEngine.utils.fillArrayWithNumbers(3);
                    options.callbacks.onDrawStart({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL], properties: oProperties, indices: indices});
                    //options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL], properties: oProperties, indices: indices});

                }
                else if (this.empCesium.drawData.coordinates && this.empCesium.drawData.coordinates.length === 1)
                {
                    // new draw with just one location of block task  included
                    // create the super auto shape
                    var currentExtent = this.empCesium.getExtent();
                    var centerCartographic = Cesium.Rectangle.center(currentExtent);
                    var widthCurrentView = currentExtent.height; //radians
                    var clickedPosition = this.empCesium.drawData.coordinates[0];
                    widthCurrentView = Cesium.Math.toDegrees(widthCurrentView); //degrees
                    widthCurrentView = widthCurrentView * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude)); // meters
                    dSectorDistance = Math.round(widthCurrentView / 4.0);
                    oCoordVerticalOneCLL = clickedPosition.destinationPoint(0, dSectorDistance / 2);
                    oCoordverticalTwoCLL = clickedPosition.destinationPoint(180, dSectorDistance / 2);
                    oCoordHorizontalCLL = clickedPosition.destinationPoint(90, dSectorDistance);
                    renderGraphic();
                    updateMarkers();
                    indices = cesiumEngine.utils.fillArrayWithNumbers(3);
                    //tooltip.setVisible(false);
                    options.callbacks.onDrawStart({
                        positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL],
                        properties: oProperties,
                        indices: indices
                    });
                    // options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalCLL], properties: oProperties, indices: indices});

                }
                else
                {
                    //waiting for the user to pick location of feature.
                    oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                    oProperties.modifiers = oModifiers;
                }




                this.muteHandlers(false);
            };

    _.prototype.startDrawingCategoryTwoPointRectangleParameteredAutoShape = function (options)
    {
        var options = copyOptions(options, defaultSurfaceOptions);
        options.scale = 4.0;
        var _self = this;
        var scene = this._scene;
        var primitives = this._scene.primitives;
        var dragging = false;
        var beforeDraggingCartesian = undefined;
        var tooltip = this._tooltip;
        var firstPoint;
        var azimuth = 0;
        var markers;
        var isDrawingRectangleShapePicked = false;
        var dWidth = 5000;
        var centerPosition;
        var markerCallbacks = {};
        var oRenderedGraphic;
        var oRectangle;
        var oCoordRightCLL;
        var oCoordLeftCLL;
        var oDrawItem = options.item;
        var oProperties = oDrawItem.properties || {};
        var oModifiers = oProperties.modifiers || {};
        var dSectorDistance;
        markerCallbacks.dragHandlers = {};
        oDrawItem.properties = oProperties;
        oDrawItem.id = options.id;
        var renderGraphic = function ()
        {
            var oRenderModifiers = emp.helpers.copyObject(oModifiers);
            var oExtent = this.empCesium.getExtent();
            var sExtents = oExtent.west.toDeg() + "," + oExtent.south.toDeg() + "," + oExtent.east.toDeg() + "," + oExtent.north.toDeg();
            var sCoordinates = cesiumEngine.utils.convertCartographicsToSECRendererCoordsString([oCoordRightCLL, oCoordLeftCLL]); //    oSensorCLL.longitude.toDeg().toString() + "," + oSensorCLL.latitude.toDeg().toString();
            var azimuth = oCoordLeftCLL.getAzimuth(oCoordRightCLL);
            var oMaterial;
            var oRenderData;
            var cartographics = [oCoordRightCLL, oCoordLeftCLL];
            azimuth = azimuth.toRad();
            //azimuth = Cesium.Math.PI_OVER_TWO - azimuth;

            oRenderModifiers[emp.typeLibrary.utils.milstd.StringModifiers.LINE_COLOR] = EmpCesiumConstants.selectionProperties.COLOR_HEX;
            oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dWidth]; // asigne back to oModifiers@@
            //oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = [azimuth.toDeg()]; // asigne back to oModifiers@@

            //oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, "clampToGround", this.empCesium.getScale(), sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
            oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol2D(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, this.empCesium.canvas.width, this.empCesium.canvas.height, sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
            if (oRenderData && (typeof (oRenderData) === 'string'))
            {
                new emp.typeLibrary.Error({
                    level: emp.typeLibrary.Error.level.CATASTROPHIC,
                    message: "RenderSymbol2D return: " + oRenderData
                });
                return;
            }
            oMaterial = new _self.empCesium.ImageMaterialProperty();
            oMaterial.image = oRenderData.image;
            oMaterial.transparent = true;
            if (!Cesium.defined(oRenderData.west) || !Cesium.defined(oRenderData.south) || !Cesium.defined(oRenderData.east) || !Cesium.defined(oRenderData.north))
            {
                oRectangle = Cesium.Rectangle.fromCartographicArray(cartographics);
            }
            else
            {
                oRectangle = Cesium.Rectangle.fromDegrees(oRenderData.west.x, oRenderData.south.y, oRenderData.east.x, oRenderData.north.y);
            }
            if (oRenderedGraphic)
            {
                oRenderedGraphic.rectangle.material.image = oRenderData.image;
                _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
            }
            else
            {
                oRenderedGraphic = new _self.empCesium.Entity({
                    id: oDrawItem.id,
                    selectable: true,
                    show: true,
                    rectangle: {
                        coordinates: getLatestRectangleCallbackProperty,
                        material: oMaterial
                    }
                });
                oRenderedGraphic.featureId = oDrawItem.featureId;
                oRenderedGraphic.coreId = oDrawItem.coreId;
                oRenderedGraphic.overlayId = oDrawItem.overlayId;
                oRenderedGraphic.symbolCode = oDrawItem.symbolCode;
                oRenderedGraphic._editMode = true;
                oRenderedGraphic.featureType = EmpCesiumConstants.featureType.ENTITY;
                oRenderedGraphic = _self.empCesium.viewer.entities.add(oRenderedGraphic);
            }
            // update modifiers that will go back via the call backs.
            oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            _self.muteHandlers(false);
        }.bind(this);
        
          _self.empCesium.currentMultiPointEditorRenderGraphicFuction = renderGraphic;
          
          
        var getLatestRectangleCallbackProperty = new Cesium.CallbackProperty(function getRectangle(time, result)
        {
            return Cesium.Rectangle.clone(oRectangle, result);
        }, false);
        this.startDrawing(
                function ()
                {
                    if (Cesium.defined(oRenderedGraphic))
                    {
                        _self.empCesium.viewer.entities.remove(oRenderedGraphic);
                    }
                    if (markers)
                    {
                        markers.remove();
                    }
                    mouseHandler.destroy();
                    //tooltip.setVisible(false);
                }
        );
        markerCallbacks.drawEnd = function (positions)
        {
            console.log("2964  markerCallbacks.drawEnd");
            options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});
        };
        markerCallbacks.drawUpdate = function (positions)
        {
            console.log("2969  markerCallbacks.drawUpdate");
            options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});
        };
        markerCallbacks.onDrawStart = function (positions)
        {
            console.log("2974  markerCallbacks.onDrawStart");
            options.callbacks.onDrawStart({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});
        };
        markerCallbacks.dragHandlers.onDrag = function (data)
        {
            var value;
            if (data.index === 0)
            {
                //right control point
                oCoordRightCLL = data.position;
                //oCoordRightCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);

            }
            else if (data.index === 1)
            {
                //left control point
                oCoordLeftCLL = data.position;
                //oCoordLeftCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
            }
            else if (data.index === 2)
            {
                //width or top control point
                var widthCLL = data.position;
                //var widthCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
                var centerCartographic = oCoordLeftCLL.midpointTo(oCoordRightCLL);
                var zeta = centerCartographic.bearingTo(widthCLL); // degrees
                zeta = Cesium.Math.toRadians(zeta);
                var dist = centerCartographic.distanceTo(widthCLL);
                dWidth = Math.abs(dist * Math.cos(zeta)) * 2;
            }
            renderGraphic();
            updateMarkers();
            //  LatLon.prototype.midpointTo = function (point)
            //var westPoint = value.west;
            //var eastPoint = value.east;
            options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: [data.index]});
        };
        markerCallbacks.dragHandlers.onDragEnd = function (data)
        {
            options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: [data.index]});
        };
        function updateMarkers()
        {
            var centerCartographic;
            var width, height;
            //var corners = getExtentCorners(oRenderedGraphic.rectangle);
            // create if they do not yet exist
            if (!Cesium.defined(markers))
            {
                markers = new _.BillboardGroup(_self, defaultBillboard);
                _self._editedSurface = {};
                _self._editedSurface._editMarkers = markers;
                centerCartographic = oCoordLeftCLL.midpointTo(oCoordRightCLL);
                var angle = oCoordLeftCLL.getAzimuth(oCoordRightCLL);
                angle = angle.toRad() - Cesium.Math.PI_OVER_TWO;
                var oCoordTopCLL = centerCartographic.destinationPoint(angle.toDeg(), dWidth / 2);
                if (oCoordRightCLL && oCoordLeftCLL && oCoordTopCLL)
                {
                    markers.addControlPoint({position: oCoordRightCLL.toCartesian(), callbacks: markerCallbacks, cpType: "vertex"}); // index == 0
                    markers.addControlPoint({position: oCoordLeftCLL.toCartesian(), callbacks: markerCallbacks, cpType: "vertex"}); // index == 1
                    markers.addControlPoint({position: oCoordTopCLL.toCartesian(), callbacks: markerCallbacks, cpType: "width"}); // index== 2
                }
                //dWidth = height;// confusing but the height of a reactanglew is interpreseted as the width in the mil std spc.
                //oRenderedGraphic.centerCartographic = centerCartographic;
            }
            else
            {
                //centerCartographic = Cesium.Rectangle.center(oRenderedGraphic.rectangle);
                centerCartographic = oCoordLeftCLL.midpointTo(oCoordRightCLL);
                var angle = oCoordLeftCLL.getAzimuth(oCoordRightCLL);
                angle = angle.toRad() - Cesium.Math.PI_OVER_TWO;
                //var width =  extent.rectangle.width;// radians
//                width = Cesium.Rectangle.computeWidth(oRenderedGraphic.rectangle); //  Cesium.Math.toDegrees(width);
//                width = Cesium.Math.toDegrees(width);
//                width = width * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude));
                //width = emp.geoLibrary.METERS_PER_DEG*width;
                //var height =  extent.rectangle.width;// radians
//                height = Cesium.Rectangle.computeHeight(oRenderedGraphic.rectangle); //  Cesium.Math.toDegrees(width);
//                height = Cesium.Math.toDegrees(height);
//                height = height * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude));
                //oRenderedGraphic.widthMeters = width;
                //oRenderedGraphic.heightMeters = height;
                //oRenderedGraphic.centerCartographic = centerCartographic; //Cesium.Ellipsoid.WGS84.cartographicToCartesian(centerCartographic);
                //      oCoordRightCLL = centerCartographic.destinationPoint(90,width / 2 );
                //        oCoordLeftCLL =  centerCartographic.destinationPoint(-90,width / 2 );
                var oCoordTopCLL = centerCartographic.destinationPoint(angle.toDeg(), dWidth / 2);
                //dWidth = height;// confusing but the height of a reactanglew is interpreseted as the width in the mil std spc.
                if (oCoordRightCLL && oCoordLeftCLL && oCoordTopCLL)
                {
                    var cpCoodinates = [oCoordRightCLL.toCartesian(), oCoordLeftCLL.toCartesian(), oCoordTopCLL.toCartesian()];
                    markers.updateBillboardsPositions(cpCoodinates);
                }

            }
            for (var markerIndex = 0; markerIndex < markers._orderedBillboards.length; ++markerIndex)
            {
                markers._orderedBillboards[markerIndex].eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(_self.empCesium.viewer.camera.positionCartographic.height, _self.lastCameraHeight);
            }
            _self.lastCameraHeight = _self.empCesium.viewer.camera.positionCartographic.height;
            markers.setOnTop();
            _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        }
        ;
        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        mouseHandler.setInputAction(function (movement)
        {
            if (Cesium.defined(movement.position))
            {
                var pickedObject = scene.pick(movement.position);
                var isDrawingRectangleShapePicked = false;
                if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.primitive) && Cesium.defined(pickedObject.primitive.id) && (pickedObject.primitive.id === options.id))
                {
                    //primitive case
                    isDrawingRectangleShapePicked = true;
                }
                else if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.id.id) && typeof (pickedObject.id.id) === "string" && pickedObject.id.id === options.id)
                {
                    // entity case ?
                    isDrawingRectangleShapePicked = true;
                }
                if (isDrawingRectangleShapePicked)
                {
                    //markers.getBillboard(0).
                    dragging = this.empCesium.editorFeatureDraggingEnable;
                    beforeDraggingCartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                    scene.screenSpaceCameraController.enableRotate = false;
                    scene.screenSpaceCameraController.enableTranslate = true;
                    scene.screenSpaceCameraController.enableZoom = true;
                    scene.screenSpaceCameraController.enableTilt = true;
                    scene.screenSpaceCameraController.enableLook = true;
                    //scene.screenSpaceCameraController.inertiaSpin =  0;
                    //scene.screenSpaceCameraController.inertiaTranslate =  0;
                    //markers.getBillboard(0).enableRotation(false);
                    // tooltip.setVisible(false);
                }
//                else
//                {
//                    dragging = false;
//                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOWN);
        // Now wait for start
        mouseHandler.setInputAction(function (movement)
        {
            if (Cesium.defined(movement.position))
            {
                var oMousePos = scene.camera.pickEllipsoid(movement.position, ellipsoid), indices,
                        pickedObject = scene.pick(movement.position);
                if (pickedObject && (pickedObject.primitive instanceof Cesium.Billboard))
                {
                    // If the Dblclick happened over a Billboard or the collection ignore it.
                    return;
                }

                if (oMousePos)
                {
                    oMousePos = oMousePos.clone();
                    if (!Cesium.defined(oRenderedGraphic))
                    {
                        // create the rectangle
                        var currentExtent = this.empCesium.getExtent();
                        var centerCartographic = Cesium.Rectangle.center(currentExtent);
                        var widthCurrentView = currentExtent.height; //radians
                        oMousePos = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oMousePos);
                        widthCurrentView = Cesium.Math.toDegrees(widthCurrentView); //degrees
                        widthCurrentView = widthCurrentView * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude)); // meters
                        dSectorDistance = Math.round(widthCurrentView / 4.0);
                        oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [];
                        oCoordRightCLL = oMousePos.destinationPoint(90, dSectorDistance / 2);
                        oCoordLeftCLL = oMousePos.destinationPoint(-90, dSectorDistance / 2);
                        dWidth = dSectorDistance / 2;
                        renderGraphic();
                        updateMarkers();
                        // tooltip.setVisible(false);
                        indices = cesiumEngine.utils.fillArrayWithNumbers(2);
                        options.callbacks.onDrawStart({
                            positions: [oCoordRightCLL, oCoordLeftCLL],
                            properties: oProperties,
                            indices: indices
                        });
                    }
                    if (typeof options.callbacks.onDrawUpdate === 'function')
                    {
                        //options.callbacks.dragHandlers.drawUpdate({positions: [extent.centerCartesian], width: extent.widthMeters, height: extent.heightMeters, azimuth: extent.rotation});
                        //options.callbacks.onDrawUpdate({positions: [extent.centerCartesian], width: extent.widthMeters, height: extent.heightMeters, azimuth: extent.rotation});
                        options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.endPosition, indices;
            if (Cesium.defined(position))
            {
                if (!Cesium.defined(oRenderedGraphic))
                {
                    // tooltip.setVisible(true);
                    // tooltip.showAt(position, "<p>Click to start drawing rectangle</p>");
                }
                else
                {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian && dragging)
                    {
                        var deltaCartesian = new Cesium.Cartesian3();
                        deltaCartesian = Cesium.Cartesian3.subtract(beforeDraggingCartesian, cartesian, deltaCartesian);
                        var deltaX = deltaCartesian.x;
                        var deltaY = deltaCartesian.y;
                        var deltaZ = deltaCartesian.z;
                        var oCoordRightCXY = oCoordRightCLL.toCartesian();
                        oCoordRightCXY.x -= deltaX;
                        oCoordRightCXY.y -= deltaY;
                        oCoordRightCXY.z -= deltaZ;
                        var previousHeight = oCoordRightCLL.height;
                        oCoordRightCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCoordRightCXY);
                        oCoordRightCLL.height = previousHeight;
                        var oCoordLeftCXY = oCoordLeftCLL.toCartesian();
                        oCoordLeftCXY.x -= deltaX;
                        oCoordLeftCXY.y -= deltaY;
                        oCoordLeftCXY.z -= deltaZ;
                        previousHeight = oCoordLeftCLL.height;
                        oCoordLeftCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCoordLeftCXY);
                        oCoordLeftCLL.height = previousHeight;
                        oCoordRightCLL.height = (oCoordRightCLL.height < 0) ? 0 : oCoordRightCLL.height;
                        oCoordLeftCLL.height = (oCoordLeftCLL.height < 0) ? 0 : oCoordLeftCLL.height;

                        renderGraphic();
                        updateMarkers();
                        beforeDraggingCartesian = cartesian;

                        if (typeof options.callbacks.onDrawUpdate === 'function')
                        {
                            indices = cesiumEngine.utils.fillArrayWithNumbers(2);
                            options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: indices});
                        }
                        // tooltip.setVisible(false);
                    }
                    else if (cartesian && !dragging)
                    {
                        // tooltip.setVisible(false);
                        // tooltip.showAt(position, "<p>Drag control points to change rectangle extent</p><p>Click again to finish drawing</p>");
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.position;
            if (Cesium.defined(position))
            {
                if (!oRenderedGraphic)
                {
                    return;
                }
                else
                {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian)
                    {
                        _self.stopDrawing();
                        if (typeof options.callbacks.onDrawEnd === 'function')
                        {
                            options.callbacks.onDrawEnd({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});
                        }
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        mouseHandler.setInputAction(function (movement)
        {
            if (dragging)
            {
                var delayUnlockingMapTimeOut = setTimeout(function ()
                {
                    scene.screenSpaceCameraController.enableRotate = true;
                    //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                    // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                    scene.screenSpaceCameraController.enableTranslate = true;
                    scene.screenSpaceCameraController.enableZoom = true;
                    scene.screenSpaceCameraController.enableTilt = true;
                    scene.screenSpaceCameraController.enableLook = true;
                }.bind(this), 70);
            }
            dragging = false;
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_UP);

        //  if (options.item.hasOwnProperty('originFeature'))
        if (this.empCesium.defined(options.item.originFeature))
                // if (options.item.hasOwnProperty('originFeature') && (options.item.originFeature instanceof emp.typeLibrary.Feature))
                {
                    // editing existing
                    oDrawItem.symbolCode = oDrawItem.originFeature.data.symbolCode;
                    var cartographics = cesiumEngine.utils.convertGeoJsonCoordToCartographicList(oDrawItem.originFeature.data);
                    oCoordRightCLL = cartographics[0]; // new Cesium.Cartographic(oDrawItem.originFeature.data.coordinates[0][0].toRad(), oDrawItem.originFeature.data.coordinates[0][1].toRad(), 0);
                    oCoordLeftCLL = cartographics[1]; //new Cesium.Cartographic(oDrawItem.originFeature.data.coordinates[1][0].toRad(), oDrawItem.originFeature.data.coordinates[1][1].toRad(), 0);
                    oProperties = emp.helpers.copyObject(oDrawItem.originFeature.properties);
                    oModifiers = oProperties.modifiers || {};
                    oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                    oProperties.modifiers = oModifiers;
                    if (oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] && (oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] instanceof Array) && oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE].length > 0)
                    {
                        dWidth = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][0];
                    }
                    else if (oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] && !(oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] instanceof Array))
                    {
                        dWidth = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
                    }
                    if (dWidth === undefined || isNaN(parseFloat(dWidth)))
                    {
                        // to prevent invalid bounds for the rectangle that breaks the map.
                        // there must be validation before calliong the editors. todo
                        dWidth = oCoordRightCLL.distanceTo(oCoordLeftCLL);
                        oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dWidth];
                    }
                    renderGraphic();
                    updateMarkers();

                    options.callbacks.onDrawStart({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});
                    //options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});


                }
        else if (this.empCesium.drawData.coordinates && this.empCesium.drawData.coordinates.length === 1)
        {
            centerCartographic = this.empCesium.drawData.coordinates[0]; // new Cesium.Cartographic(oDrawItem.originFeature.data.coordinates[0][0].toRad(), oDrawItem.originFeature.data.coordinates[0][1].toRad(), 0);
            // new draw with 2 coordinates required included
            var currentExtent = this.empCesium.getExtent(), indices;
            //var centerCartographic = Cesium.Rectangle.center(currentExtent);
            var widthCurrentView = currentExtent.height; //radians
            oProperties = emp.helpers.copyObject(oDrawItem.properties);
            oModifiers = oProperties.modifiers || {};
            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
            oProperties.modifiers = oModifiers;
            if (oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] && (oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] instanceof Array) && oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE].length > 0)
            {
                dWidth = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][0];
            }
            else if (oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] && (oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] instanceof Array))
            {
                dWidth = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            }
            widthCurrentView = Cesium.Math.toDegrees(widthCurrentView); //degrees
            widthCurrentView = widthCurrentView * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude)); // meters
            dSectorDistance = Math.round(widthCurrentView / 4.0);
            if (dWidth === undefined || isNaN(parseFloat(dWidth)))
            {
                // to prevent invalid bounds for the rectangle that breaks the map.
                // there must be validation before calliong the editors. todo
                dWidth = dSectorDistance / 2;
                oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dWidth];
            }
            else
            {
                dSectorDistance = dWidth * 2;
            }
            oCoordRightCLL = centerCartographic.destinationPoint(90, dSectorDistance / 2);
            oCoordLeftCLL = centerCartographic.destinationPoint(-90, dSectorDistance / 2);
            renderGraphic();
            updateMarkers();

            // tooltip.setVisible(false);
            indices = cesiumEngine.utils.fillArrayWithNumbers(2);
            options.callbacks.onDrawStart({
                positions: [oCoordRightCLL, oCoordLeftCLL],
                properties: oProperties,
                indices: indices
            });
            //options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: indices});


        }
        else if (this.empCesium.drawData.coordinates && this.empCesium.drawData.coordinates.length === 2)
        {
            oCoordRightCLL = this.empCesium.drawData.coordinates[0]; // new Cesium.Cartographic(oDrawItem.originFeature.data.coordinates[0][0].toRad(), oDrawItem.originFeature.data.coordinates[0][1].toRad(), 0);
            oCoordLeftCLL = this.empCesium.drawData.coordinates[1]; //new Cesium.Cartographic(oDrawItem.originFeature.data.coordinates[1][0].toRad(), oDrawItem.originFeature.data.coordinates[1][1].toRad(), 0);
            // new draw with 2 coordinates required included
            var currentExtent = this.empCesium.getExtent(), indices;
            //var centerCartographic = Cesium.Rectangle.center(currentExtent);
            var widthCurrentView = currentExtent.height; //radians
            oProperties = emp.helpers.copyObject(oDrawItem.properties);
            oModifiers = oProperties.modifiers || {};
            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
            oProperties.modifiers = oModifiers;
            if (oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] && (oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] instanceof Array) && oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE].length > 0)
            {
                dWidth = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][0];
            }
            else if (oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] && (oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] instanceof Array))
            {
                dWidth = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            }
            var centerCartographic = oCoordLeftCLL.midpointTo(oCoordRightCLL);
            //oMousePos = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oMousePos);
            widthCurrentView = Cesium.Math.toDegrees(widthCurrentView); //degrees
            widthCurrentView = widthCurrentView * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude)); // meters
            dSectorDistance = Math.round(widthCurrentView / 4.0);
            if (dWidth === undefined || isNaN(parseFloat(dWidth)))
            {
                // to prevent invalid bounds for the rectangle that breaks the map.
                // there must be validation before calliong the editors. todo
                dWidth = oCoordRightCLL.distanceTo(oCoordLeftCLL);
                oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dWidth];
            }
            renderGraphic();
            updateMarkers();

            // tooltip.setVisible(false);
            indices = cesiumEngine.utils.fillArrayWithNumbers(2);
            options.callbacks.onDrawStart({
                positions: [oCoordRightCLL, oCoordLeftCLL],
                properties: oProperties,
                indices: indices
            });
            //options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: indices});
        }
        else
        {
            oProperties = emp.helpers.copyObject(oDrawItem.properties);
            oModifiers = oProperties.modifiers || {};
            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
            oProperties.modifiers = oModifiers;
        }




        this.muteHandlers(false);
    };
    _.prototype.drawCategoryTwoPointLine = function (options)
    {
        var options = copyOptions(options, defaultSurfaceOptions);
        options.scale = 4.0;
        var _self = this;
        var scene = this._scene;
        var primitives = this._scene.primitives;
        var dragging = false;
        var beforeDraggingCartesian = undefined;
        var tooltip = this._tooltip;
        var firstPoint;
        var azimuth = 0;
        var markers;
        var isDrawingRectangleShapePicked = false;
        var centerPosition;
        var markerCallbacks = {};
        var oRenderedGraphic;
        var oRectangle;
        var oCoordRightCLL;
        var oCoordLeftCLL;
        var dLength;
        var oDrawItem = options.item;
        var oProperties = oDrawItem.properties || {};
        var oModifiers = oProperties.modifiers || {};
        var dSectorDistance;
        markerCallbacks.dragHandlers = {};
        oDrawItem.properties = oProperties;
        oDrawItem.id = options.id;
        var renderGraphic = function ()
        {
            var oRenderModifiers = emp.helpers.copyObject(oModifiers);
            var oExtent = this.empCesium.getExtent();
            var sExtents = oExtent.west.toDeg() + "," + oExtent.south.toDeg() + "," + oExtent.east.toDeg() + "," + oExtent.north.toDeg();
            var sCoordinates;
            var oMaterial;
            var oRenderData;
            var cartographics;
            if (this.empCesium.drawData.drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE)
            {
                // just one coordinate representing the center of circle
                sCoordinates = cesiumEngine.utils.convertCartographicsToSECRendererCoordsString([oCoordRightCLL]);
                cartographics = [oCoordRightCLL];
            }
//            else if (oDrawItem.symbolDefTable.symbolID === "G*G*PF----****X" || oDrawItem.symbolDefTable.symbolID === "G*G*OLKA--****X" || 
//                    oDrawItem.symbolDefTable.symbolID === "G*G*OLKGM-****X" ||  oDrawItem.symbolDefTable.symbolID === "G*G*OLKGS-****X"  )
//            {
//                //revert coordintes
//                sCoordinates = cesiumEngine.utils.convertCartographicsToSECRendererCoordsString([oCoordLeftCLL, oCoordRightCLL]);
//                cartographics = [oCoordLeftCLL, oCoordRightCLL];
//            }
            else
            {
                sCoordinates = cesiumEngine.utils.convertCartographicsToSECRendererCoordsString([oCoordRightCLL, oCoordLeftCLL]);

            }



            //var azimuth = oCoordLeftCLL.getAzimuth(oCoordRightCLL);
            dLength = oCoordRightCLL.distanceTo(oCoordLeftCLL);
            azimuth = azimuth.toRad();
            //azimuth = Cesium.Math.PI_OVER_TWO - azimuth;

            oRenderModifiers[emp.typeLibrary.utils.milstd.StringModifiers.LINE_COLOR] = EmpCesiumConstants.selectionProperties.COLOR_HEX;
            if (oDrawItem.symbolDefTable.drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE)
            {
                if (oDrawItem.symbolCode === "PBS_SQUARE-----")
                {
                    // length of one side of square.
                    oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dLength * 2];
                }
                else
                {
                    oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dLength];
                }
            }
            
            //oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, "clampToGround", this.empCesium.getScale(), sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
               oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol2D(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, this.empCesium.canvas.width, this.empCesium.canvas.height, sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
            delete oRenderModifiers[emp.typeLibrary.utils.milstd.StringModifiers.LINE_COLOR];
            if (oRenderData && (typeof (oRenderData) === 'string'))
            {
                new emp.typeLibrary.Error({
                    level: emp.typeLibrary.Error.level.CATASTROPHIC,
                    message: "RenderSymbol2D return: " + oRenderData
                });
                return;
            }
            oMaterial = new _self.empCesium.ImageMaterialProperty();
            oMaterial.image = oRenderData.image;
            oMaterial.transparent = true;
            if (!Cesium.defined(oRenderData.west) || !Cesium.defined(oRenderData.south) || !Cesium.defined(oRenderData.east) || !Cesium.defined(oRenderData.north))
            {
                oRectangle = Cesium.Rectangle.fromCartographicArray(cartographics);
            }
            else
            {
                oRectangle = Cesium.Rectangle.fromDegrees(oRenderData.west.x, oRenderData.south.y, oRenderData.east.x, oRenderData.north.y);
            }
            if (oRenderedGraphic)
            {
                oRenderedGraphic.rectangle.material.image = oRenderData.image;
                _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
            }
            else
            {
                oRenderedGraphic = new _self.empCesium.Entity({
                    id: oDrawItem.id,
                    selectable: true,
                    show: true,
                    rectangle: {
                        coordinates: getLatestRectangleCallbackProperty,
                        material: oMaterial
                    }
                });
                oRenderedGraphic.featureId = oDrawItem.featureId;
                oRenderedGraphic.coreId = oDrawItem.coreId;
                oRenderedGraphic.overlayId = oDrawItem.overlayId;
                oRenderedGraphic.symbolCode = oDrawItem.symbolCode;
                oRenderedGraphic._editMode = true;
                oRenderedGraphic.featureType = EmpCesiumConstants.featureType.ENTITY;
                oRenderedGraphic = _self.empCesium.viewer.entities.add(oRenderedGraphic);
            }
            // update modifiers that will go back via the call backs.
            if (oDrawItem.symbolDefTable.drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE)
            {
                oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            }
            _self.muteHandlers(false);
        }.bind(this);
        
          _self.empCesium.currentMultiPointEditorRenderGraphicFuction = renderGraphic;
          
          
        var getLatestRectangleCallbackProperty = new Cesium.CallbackProperty(function getRectangle(time, result)
        {
            return Cesium.Rectangle.clone(oRectangle, result);
        }, false);
        this.startDrawing(
                function ()
                {
                    if (Cesium.defined(oRenderedGraphic))
                    {
                        _self.empCesium.viewer.entities.remove(oRenderedGraphic);
                    }
                    if (markers)
                    {
                        markers.remove();
                    }
                    mouseHandler.destroy();
                    //tooltip.setVisible(false);
                }
        );
        markerCallbacks.drawEnd = function (positions)
        {
            if (oDrawItem.symbolCode === "PBS_SQUARE-----")
            {
                options.callbacks.onDrawUpdate({positions: [oCoordRightCLL], properties: oProperties, indices: []});
            }
            else
            {
                options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});
            }
        };
        markerCallbacks.drawUpdate = function (positions)
        {
            if (oDrawItem.symbolCode === "PBS_SQUARE-----")
            {
                options.callbacks.onDrawUpdate({positions: [oCoordRightCLL], properties: oProperties, indices: []});
            }
            else
            {
                options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});
            }
        };
        markerCallbacks.onDrawStart = function (positions)
        {
            if (oDrawItem.symbolCode === "PBS_SQUARE-----")
            {
                options.callbacks.onDrawStart({positions: [oCoordRightCLL], properties: oProperties, indices: []});
                //options.callbacks.onDrawUpdate({positions: [oCoordRightCLL], properties: oProperties, indices: []});
            }
            else
            {
                options.callbacks.onDrawStart({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});
                //options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});
            }
        };
        markerCallbacks.dragHandlers.onDrag = function (data)
        {
            var value;
            if (data.index === 0)
            {
                //right control point
                oCoordRightCLL = data.position;
                //oCoordRightCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);

            }
            else if (data.index === 1)
            {
                //left control point
                oCoordLeftCLL = data.position;
                //oCoordLeftCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
            }
            else if (data.index === 2)
            {
                //width or top control point
                var widthCLL = data.position;
                //var widthCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
                var centerCartographic = oCoordLeftCLL.midpointTo(oCoordRightCLL);
                var zeta = centerCartographic.bearingTo(widthCLL); // degrees
                zeta = Cesium.Math.toRadians(zeta);
                var dist = centerCartographic.distanceTo(widthCLL);
            }
            renderGraphic();
            updateMarkers();
            //  LatLon.prototype.midpointTo = function (point)
            //var westPoint = value.west;
            //var eastPoint = value.east;
            if (oDrawItem.symbolCode === "PBS_SQUARE-----")
            {
                options.callbacks.onDrawUpdate({positions: [oCoordRightCLL], properties: oProperties, indices: [data.index]});
            }
            else
            {
                options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: [data.index]});
            }
        };
        markerCallbacks.dragHandlers.onDragEnd = function (data)
        {
            if (oDrawItem.symbolCode === "PBS_SQUARE-----")
            {
                options.callbacks.onDrawUpdate({positions: [oCoordRightCLL], properties: oProperties, indices: [data.index]});
            }
            else
            {
                options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: [data.index]});
            }

        };

        var updateMarkers = function ()
        {
            var centerCartographic;
            var width, height;
            //var corners = getExtentCorners(oRenderedGraphic.rectangle);
            // create if they do not yet exist
            if (!Cesium.defined(markers))
            {
                markers = new _.BillboardGroup(_self, defaultBillboard);
                _self._editedSurface = {};
                _self._editedSurface._editMarkers = markers;
                centerCartographic = oCoordLeftCLL.midpointTo(oCoordRightCLL);
                var angle = oCoordLeftCLL.getAzimuth(oCoordRightCLL);
                angle = angle.toRad() - Cesium.Math.PI_OVER_TWO;
//                var oCoordTopCLL = centerCartographic.destinationPoint(angle.toDeg(),dWidth/2 );
//               if (oCoordRightCLL && oCoordLeftCLL && oCoordTopCLL)
                if (oCoordRightCLL && oCoordLeftCLL)
                {
                    markers.addControlPoint({position: oCoordRightCLL.toCartesian(), callbacks: markerCallbacks, cpType: "vertex"});// index == 0
                    if (Cesium.defined(this.empCesium.drawData.symbolDef) && this.empCesium.drawData.symbolDef.maxPoints === 1)
                    {
                        markers.addControlPoint({position: oCoordLeftCLL.toCartesian(), callbacks: markerCallbacks, cpType: "width"}); // index == 1
                    }
                    else
                    {
                        markers.addControlPoint({position: oCoordLeftCLL.toCartesian(), callbacks: markerCallbacks, cpType: "vertex"}); // index == 1
                    }
//                    markers.addBillboard(oCoordTopCLL.toCartesian(), markerCallbacks, "width"); // index== 2
                }
                //dWidth = height;// confusing but the height of a reactanglew is interpreseted as the width in the mil std spc.
                //oRenderedGraphic.centerCartographic = centerCartographic;
            }
            else
            {
                //centerCartographic = Cesium.Rectangle.center(oRenderedGraphic.rectangle);
                centerCartographic = oCoordLeftCLL.midpointTo(oCoordRightCLL);
//                var angle = oCoordLeftCLL.getAzimuth(oCoordRightCLL);
//                angle =   angle.toRad() - Cesium.Math.PI_OVER_TWO;

                //var width =  extent.rectangle.width;// radians
//                width = Cesium.Rectangle.computeWidth(oRenderedGraphic.rectangle); //  Cesium.Math.toDegrees(width);
//                width = Cesium.Math.toDegrees(width);
//                width = width * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude));
                //width = emp.geoLibrary.METERS_PER_DEG*width;
                //var height =  extent.rectangle.width;// radians
//                height = Cesium.Rectangle.computeHeight(oRenderedGraphic.rectangle); //  Cesium.Math.toDegrees(width);
//                height = Cesium.Math.toDegrees(height);
//                height = height * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude));
                //oRenderedGraphic.widthMeters = width;
                //oRenderedGraphic.heightMeters = height;
                //oRenderedGraphic.centerCartographic = centerCartographic; //Cesium.Ellipsoid.WGS84.cartographicToCartesian(centerCartographic);
                //      oCoordRightCLL = centerCartographic.destinationPoint(90,width / 2 );
                //        oCoordLeftCLL =  centerCartographic.destinationPoint(-90,width / 2 );
//                var oCoordTopCLL = centerCartographic.destinationPoint(angle.toDeg(),dWidth/2 );
                //dWidth = height;// confusing but the height of a reactanglew is interpreseted as the width in the mil std spc.
                if (oCoordRightCLL && oCoordLeftCLL)
//                if (oCoordRightCLL && oCoordLeftCLL && oCoordTopCLL)
                {
//                    var cpCoodinates = [oCoordRightCLL.toCartesian(), oCoordLeftCLL.toCartesian(), oCoordTopCLL.toCartesian()];
                    var cpCoodinates = [oCoordRightCLL.toCartesian(), oCoordLeftCLL.toCartesian()];
                    markers.updateBillboardsPositions(cpCoodinates);
                }

            }
            for (var markerIndex = 0; markerIndex < markers._orderedBillboards.length; ++markerIndex)
            {
                markers._orderedBillboards[markerIndex].eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(_self.empCesium.viewer.camera.positionCartographic.height, _self.lastCameraHeight);
            }
            _self.lastCameraHeight = _self.empCesium.viewer.camera.positionCartographic.height;
            markers.setOnTop();
            _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        }.bind(this);
        ;
        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        mouseHandler.setInputAction(function (movement)
        {
            if (Cesium.defined(movement.position))
            {
                var pickedObject = scene.pick(movement.position);
                var isDrawingRectangleShapePicked = false;
                if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.primitive) && Cesium.defined(pickedObject.primitive.id) && (pickedObject.primitive.id === options.id))
                {
                    //primitive case
                    isDrawingRectangleShapePicked = true;
                }
                else if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.id.id) && typeof (pickedObject.id.id) === "string" && pickedObject.id.id === options.id)
                {
                    // entity case ?
                    isDrawingRectangleShapePicked = true;
                }
                if (isDrawingRectangleShapePicked)
                {
                    //markers.getBillboard(0).
                    dragging = this.empCesium.editorFeatureDraggingEnable;
                    beforeDraggingCartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                    scene.screenSpaceCameraController.enableRotate = false;
                    scene.screenSpaceCameraController.enableTranslate = false;
                    scene.screenSpaceCameraController.enableZoom = true;
                    scene.screenSpaceCameraController.enableTilt = true;
                    scene.screenSpaceCameraController.enableLook = true;
                    //scene.screenSpaceCameraController.inertiaSpin =  0;
                    //scene.screenSpaceCameraController.inertiaTranslate =  0;
                    //markers.getBillboard(0).enableRotation(false);
                    // tooltip.setVisible(false);
                }
//                else
//                {
//                    dragging = false;
//                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOWN);
        // Now wait for start
        mouseHandler.setInputAction(function (movement)
        {
            if (Cesium.defined(movement.position))
            {
                var oMousePos = scene.camera.pickEllipsoid(movement.position, ellipsoid), indices;
                var pickedObject = scene.pick(movement.position);
                if (pickedObject && (pickedObject.primitive instanceof Cesium.Billboard))
                {
                    // If the Dblclick happened over a Billboard or the collection ignore it.
                    return;
                }

                if (oMousePos)
                {
                    oMousePos = oMousePos.clone();
                    if (!Cesium.defined(oRenderedGraphic))
                    {
                        // create the rectangle
                        var currentExtent = this.empCesium.getExtent();
                        var centerCartographic = Cesium.Rectangle.center(currentExtent);
                        var widthCurrentView = currentExtent.height; //radians
                        oMousePos = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oMousePos);
                        widthCurrentView = Cesium.Math.toDegrees(widthCurrentView); //degrees
                        widthCurrentView = widthCurrentView * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude)); // meters
                        dSectorDistance = Math.round(widthCurrentView / 4.0);
                        oCoordRightCLL = oMousePos.destinationPoint(90, dSectorDistance / 2);
                        oCoordLeftCLL = oMousePos.destinationPoint(-90, dSectorDistance / 2);
                        renderGraphic();
                        updateMarkers();
                        // tooltip.setVisible(false);
                        indices = cesiumEngine.utils.fillArrayWithNumbers(2);
                        if (oDrawItem.symbolCode === "PBS_SQUARE-----")
                        {
                            options.callbacks.onDrawStart({
                                positions: [oCoordRightCLL],
                                properties: oProperties,
                                indices: indices
                            });
                        }
                        else
                        {
                            options.callbacks.onDrawStart({
                                positions: [oCoordRightCLL, oCoordLeftCLL],
                                properties: oProperties,
                                indices: indices
                            });
                        }
                    }
                    if (typeof options.callbacks.onDrawUpdate === 'function')
                    {
                        //options.callbacks.dragHandlers.drawUpdate({positions: [extent.centerCartesian], width: extent.widthMeters, height: extent.heightMeters, azimuth: extent.rotation});
                        //options.callbacks.onDrawUpdate({positions: [extent.centerCartesian], width: extent.widthMeters, height: extent.heightMeters, azimuth: extent.rotation});
                        if (oDrawItem.symbolCode === "PBS_SQUARE-----")
                        {
                            options.callbacks.onDrawUpdate({positions: [oCoordRightCLL], properties: oProperties, indices: []});
                        }
                        else
                        {
//                            switch (oDrawItem.symbolDefTable.symbolID)
//                            {
//                                case "G*G*PF----****X":
//                                case "G*G*OLKA--****X":
//                                case "G*G*OLKGM-****X":
//                                case "G*G*OLKGS-****X":
//                                    options.callbacks.onDrawUpdate({positions: [oCoordLeftCLL, oCoordRightCLL], properties: oProperties, indices: []});
//                                    break;
//                                default:
                            options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});
                            // }
                            //options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});
                        }
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.endPosition, indices;
            if (!Cesium.defined(position))
            {
                if (!Cesium.defined(oRenderedGraphic))
                {
                    //tooltip.setVisible(true);
                    //tooltip.showAt(position, "<p>Click to start drawing rectangle</p>");
                }
                else
                {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian && dragging)
                    {
                        var deltaCartesian = new Cesium.Cartesian3();
                        deltaCartesian = Cesium.Cartesian3.subtract(beforeDraggingCartesian, cartesian, deltaCartesian);
                        var deltaX = deltaCartesian.x;
                        var deltaY = deltaCartesian.y;
                        var deltaZ = deltaCartesian.z;
                        var oCoordRightCXY = oCoordRightCLL.toCartesian();
                        oCoordRightCXY.x -= deltaX;
                        oCoordRightCXY.y -= deltaY;
                        oCoordRightCXY.z -= deltaZ;
                        var previousHeight = oCoordRightCLL.height;
                        oCoordRightCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCoordRightCXY);
                        oCoordRightCLL.height = previousHeight;
                        var oCoordLeftCXY = oCoordLeftCLL.toCartesian();
                        oCoordLeftCXY.x -= deltaX;
                        oCoordLeftCXY.y -= deltaY;
                        oCoordLeftCXY.z -= deltaZ;
                        previousHeight = oCoordLeftCLL.height;
                        oCoordLeftCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCoordLeftCXY);
                        oCoordLeftCLL.height = previousHeight;
                        oCoordRightCLL.height = (oCoordRightCLL.height < 0) ? 0 : oCoordRightCLL.height;
                        oCoordLeftCLL.height = (oCoordLeftCLL.height < 0) ? 0 : oCoordLeftCLL.height;


                        renderGraphic();
                        updateMarkers();
                        beforeDraggingCartesian = cartesian;
                        indices = cesiumEngine.utils.fillArrayWithNumbers(2);
                        if (typeof options.callbacks.onDrawUpdate === 'function')
                        {
                            if (oDrawItem.symbolCode === "PBS_SQUARE-----")
                            {
                                options.callbacks.onDrawUpdate({positions: [oCoordRightCLL], properties: oProperties, indices: indices});
                            }
                            else
                            {
                                options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: indices});
                            }

                        }
                        //tooltip.setVisible(false);
                    }
                    else if (cartesian && !dragging)
                    {
                        //tooltip.setVisible(false);
                        // tooltip.showAt(position, "<p>Drag control points to change rectangle extent</p><p>Click again to finish drawing</p>");
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.position;
            if (Cesium.defined(position))
            {
                if (!oRenderedGraphic)
                {
                    return;
                }
                else
                {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian)
                    {
                        _self.stopDrawing();
                        if (typeof options.callbacks.onDrawEnd === 'function')
                        {
                            if (oDrawItem.symbolCode === "PBS_SQUARE-----")
                            {
                                options.callbacks.onDrawEnd({positions: [oCoordRightCLL], properties: oProperties, indices: []});
                            }
                            else
                            {
                                options.callbacks.onDrawEnd({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});
                            }

                        }
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        mouseHandler.setInputAction(function (movement)
        {
            if (dragging)
            {
                var delayUnlockingMapTimeOut = setTimeout(function ()
                {
                    scene.screenSpaceCameraController.enableRotate = true;
                    //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                    // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                    scene.screenSpaceCameraController.enableTranslate = true;
                    scene.screenSpaceCameraController.enableZoom = true;
                    scene.screenSpaceCameraController.enableTilt = true;
                    scene.screenSpaceCameraController.enableLook = true;
                }.bind(this), 70);
            }
            dragging = false;
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_UP);

        if (this.empCesium.defined(options.item.originFeature))
                //if (options.item.hasOwnProperty('originFeature'))
                        //if (options.item.hasOwnProperty('originFeature') && (options.item.originFeature instanceof emp.typeLibrary.Feature))
                        {
                            // editing existing
                            //var radius = 0; ;
                            oDrawItem.symbolCode = oDrawItem.originFeature.data.symbolCode;
                            var cartographics = cesiumEngine.utils.convertGeoJsonCoordToCartographicList(oDrawItem.originFeature.data);
                            //oCoordRightCLL = cartographics[0];
                            // oCoordLeftCLL =  oCoordRightCLL.destinationPoint(90,  oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE]);
                            oProperties = emp.helpers.copyObject(oDrawItem.originFeature.properties);
                            oModifiers = oProperties.modifiers || {};
                            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                            oProperties.modifiers = oModifiers;
                            oCoordRightCLL = cartographics[0];
                            if (cartographics.length > 1)
                            {
                                oCoordLeftCLL = cartographics[1];
                            }
                            else
                            {
                                dLength = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][0]; //meters
                                if (oDrawItem.symbolCode === "PBS_SQUARE-----")
                                {
                                    dLength = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][0] / 2; //meters
                                }
                                oCoordLeftCLL = oCoordRightCLL.destinationPoint(90, dLength); // distance in meters
                            }
                            //make sure coordinate is above the terrain
                            oCoordRightCLL = new this.empCesium.Cartographic(oCoordRightCLL.longitude, oCoordRightCLL.latitude, 0);
                            oCoordLeftCLL = new this.empCesium.Cartographic(oCoordLeftCLL.longitude, oCoordLeftCLL.latitude, 0);
                            renderGraphic();
                            updateMarkers();
                            if (oDrawItem.symbolCode === "PBS_SQUARE-----")
                            {
                                options.callbacks.onDrawStart({positions: [oCoordRightCLL], properties: oProperties, indices: []});
                                //options.callbacks.onDrawUpdate({positions: [oCoordRightCLL], properties: oProperties, indices: []});
                            }
                            else
                            {
                                options.callbacks.onDrawStart({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});
                                //options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: []});
                            }

                        }
                else if (this.empCesium.drawData.coordinates && this.empCesium.drawData.coordinates.length === 1)
                {
                    var currentExtent = this.empCesium.getExtent(), indices;
                    var centerCartographic = Cesium.Rectangle.center(currentExtent);
                    var widthCurrentView = currentExtent.height; //radians
                    var centerCartographic = this.empCesium.drawData.coordinates[0];  //= Cesium.Ellipsoid.WGS84.cartesianToCartographic(oMousePos);
                    widthCurrentView = Cesium.Math.toDegrees(widthCurrentView); //degrees
                    widthCurrentView = widthCurrentView * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude)); // meters
                    dSectorDistance = Math.round(widthCurrentView / 4.0);
                    oCoordRightCLL = centerCartographic.destinationPoint(90, dSectorDistance / 2);
//             if (this.empCesium.drawData.drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE)
//            {
//                
//            }
                    oCoordLeftCLL = centerCartographic.destinationPoint(-90, dSectorDistance / 2);
                    dLength = oCoordRightCLL.distanceTo(oCoordLeftCLL);
                    oProperties = emp.helpers.copyObject(oDrawItem.properties);
                    oModifiers = oProperties.modifiers || {};
                    oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                    oProperties.modifiers = oModifiers;
                    renderGraphic();
                    updateMarkers();
                    // tooltip.setVisible(false);
                    indices = cesiumEngine.utils.fillArrayWithNumbers(2);

                    if (oDrawItem.symbolCode === "PBS_SQUARE-----")
                    {
                        options.callbacks.onDrawStart({positions: [oCoordRightCLL], properties: oProperties, indices: indices});
                        //options.callbacks.onDrawUpdate({positions: [oCoordRightCLL], properties: oProperties, indices: indices});
                    }
                    else
                    {
                        options.callbacks.onDrawStart({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: indices});
                        //options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: indices});
                    }

                }
                else if (this.empCesium.drawData.coordinates && this.empCesium.drawData.coordinates.length === 2)
                {
                    var currentExtent = this.empCesium.getExtent(), indices;
                    //var centerCartographic = Cesium.Rectangle.center(currentExtent);
                    //var widthCurrentView = currentExtent.height; //radians
//            oMousePos = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oMousePos);
//            widthCurrentView = Cesium.Math.toDegrees(widthCurrentView); //degrees
//            widthCurrentView = widthCurrentView * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude)); // meters
//            dSectorDistance = Math.round(widthCurrentView / 4.0);
                    oCoordRightCLL = this.empCesium.drawData.coordinates[0];
                    oCoordLeftCLL = this.empCesium.drawData.coordinates[1];
                    dLength = oCoordRightCLL.distanceTo(oCoordLeftCLL);
                    oProperties = emp.helpers.copyObject(oDrawItem.properties);
                    oModifiers = oProperties.modifiers || {};
                    oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                    oProperties.modifiers = oModifiers;
                    renderGraphic();
                    updateMarkers();
                    // tooltip.setVisible(false);
                    indices = cesiumEngine.utils.fillArrayWithNumbers(2);

                    if (oDrawItem.symbolCode === "PBS_SQUARE-----")
                    {
                        options.callbacks.onDrawStart({positions: [oCoordRightCLL], properties: oProperties, indices: indices});
                        //options.callbacks.onDrawUpdate({positions: [oCoordRightCLL], properties: oProperties, indices: indices});
                    }
                    else
                    {
                        options.callbacks.onDrawStart({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: indices});
                        //options.callbacks.onDrawUpdate({positions: [oCoordRightCLL, oCoordLeftCLL], properties: oProperties, indices: indices});
                    }
                }
                else
                {
                    oProperties = emp.helpers.copyObject(oDrawItem.properties);
                    oModifiers = oProperties.modifiers || {};
                    oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                    oProperties.modifiers = oModifiers;
                }
                this.muteHandlers(false);
            };
    _.prototype.drawCategoryMultiPointLine = function (options)
    {
        var options = copyOptions(options, defaultSurfaceOptions);
        options.scale = 4.0;
        var _self = this;
        var scene = this._scene;
        var primitives = this._scene.primitives;
        var dragging = false;
        var beforeDraggingCartesian = undefined;
        var tooltip = this._tooltip;
        var firstPoint;
        var azimuth = 0;
        var markers;
        var isDrawingRectangleShapePicked = false;
        var dWidth = 5000;
        var centerPosition;
        var markerCallbacks = {};
        var oRenderedGraphic;
        var oRectangle;
        var oCoordVerticalOneCLL;
        var oCoordverticalTwoCLL;
        var oCoordHorizontalOneCLL;
        var oDrawItem = options.item;
        var sCoordinates;
        var oProperties = oDrawItem.properties || {};
        var oModifiers = oProperties.modifiers || {};
        var dSectorDistance;
        markerCallbacks.dragHandlers = {};
        oDrawItem.properties = oProperties;
        oDrawItem.id = options.id;
        if (_self.empCesium.drawData.standard === 1)
        {
            var oCoordVerticalThreeCLL;
        }
        var renderGraphic = function ()
        {
            var oRenderModifiers = emp.helpers.copyObject(oModifiers);
            var oExtent = this.empCesium.getExtent();
            var sExtents = oExtent.west.toDeg() + "," + oExtent.south.toDeg() + "," + oExtent.east.toDeg() + "," + oExtent.north.toDeg();
            var oMaterial;
            var oRenderData;
            var cartographics;
            if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
            {
                if (_self.empCesium.drawData.symbolDef.symbolID === "G*M*NM----****X")
                {
                    //minimum safe distance requires the concentric ciscles to be sorted by distance from center.
                    var cartographicsSorted = cesiumEngine.utils.orderCartographicArrayByDistance(oCoordVerticalOneCLL, [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL]);
                    sCoordinates = cesiumEngine.utils.convertCartographicsToSECRendererCoordsString([cartographicsSorted[0], cartographicsSorted[1], cartographicsSorted[2], cartographicsSorted[3]]);
                    cartographics = [cartographicsSorted[0], cartographicsSorted[1], cartographicsSorted[2], cartographicsSorted[3]];
                }
                else
                {
                    sCoordinates = cesiumEngine.utils.convertCartographicsToSECRendererCoordsString([oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL]);
                    cartographics = [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL];
                }
            }
            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
            {
                sCoordinates = cesiumEngine.utils.convertCartographicsToSECRendererCoordsString([oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL]);
                cartographics = [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL];
            }
            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 0)
            {
                sCoordinates = cesiumEngine.utils.convertCartographicsToSECRendererCoordsString([oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL]);
                cartographics = [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL];
            }
            else
            {
                sCoordinates = cesiumEngine.utils.convertCartographicsToSECRendererCoordsString([oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL]);
                cartographics = [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL];
            }
            var centerCartographic = oCoordVerticalOneCLL.midpointTo(oCoordverticalTwoCLL);
            var azimuth = centerCartographic.getAzimuth(oCoordVerticalOneCLL);
            azimuth = azimuth.toRad();
            //azimuth = Cesium.Math.PI_OVER_TWO - azimuth;

            oRenderModifiers[emp.typeLibrary.utils.milstd.StringModifiers.LINE_COLOR] = EmpCesiumConstants.selectionProperties.COLOR_HEX;
            //oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dWidth]; // asigne back to oModifiers@@
            //oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = [azimuth.toDeg()]; // asigne back to oModifiers@@
            //oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, "clampToGround", this.empCesium.getScale(), sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
            oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol2D(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, this.empCesium.canvas.width, this.empCesium.canvas.height, sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
            if (oRenderData && (typeof (oRenderData) === 'string'))
            {
                new emp.typeLibrary.Error({
                    level: emp.typeLibrary.Error.level.CATASTROPHIC,
                    message: "RenderSymbol2D return: " + oRenderData
                });
                return;
            }
            oMaterial = new _self.empCesium.ImageMaterialProperty();
            oMaterial.image = oRenderData.image;
            oMaterial.transparent = true;
            if (!Cesium.defined(oRenderData.west) || !Cesium.defined(oRenderData.south) || !Cesium.defined(oRenderData.east) || !Cesium.defined(oRenderData.north))
            {
                oRectangle = Cesium.Rectangle.fromCartographicArray(cartographics);
            }
            else
            {
                oRectangle = Cesium.Rectangle.fromDegrees(oRenderData.west.x, oRenderData.south.y, oRenderData.east.x, oRenderData.north.y);
            }
            if (oRenderedGraphic)
            {
                oRenderedGraphic.rectangle.material.image = oRenderData.image;
                _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
            }
            else
            {
                oRenderedGraphic = new _self.empCesium.Entity({
                    id: oDrawItem.id,
                    selectable: true,
                    show: true,
                    rectangle: {
                        coordinates: getLatestRectangleCallbackProperty,
                        material: oMaterial
                    }
                });
                oRenderedGraphic.featureId = oDrawItem.featureId;
                oRenderedGraphic.coreId = oDrawItem.coreId;
                oRenderedGraphic.overlayId = oDrawItem.overlayId;
                oRenderedGraphic.symbolCode = oDrawItem.symbolCode;
                oRenderedGraphic._editMode = true;
                oRenderedGraphic.featureType = EmpCesiumConstants.featureType.ENTITY;
                oRenderedGraphic = _self.empCesium.viewer.entities.add(oRenderedGraphic);
            }
            // update modifiers that will go back via the call backs.
            _self.muteHandlers(false);
        }.bind(this);
        
          _self.empCesium.currentMultiPointEditorRenderGraphicFuction = renderGraphic;

        var getLatestRectangleCallbackProperty = new Cesium.CallbackProperty(function getRectangle(time, result)
        {
            return Cesium.Rectangle.clone(oRectangle, result);
        }, false);

        this.startDrawing(function ()
        {
            if (Cesium.defined(oRenderedGraphic))
            {
                _self.empCesium.viewer.entities.remove(oRenderedGraphic);
            }
            if (markers)
            {
                markers.remove();
            }
            mouseHandler.destroy();
            //tooltip.setVisible(false);
        });
        markerCallbacks.drawEnd = function (positions)
        {
            if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
            {
                if (_self.empCesium.drawData.symbolDef.symbolID === "G*M*NM----****X")
                {
                    //minimum safe distance requires the concentric ciscles to be sorted by distance from center.
                    var cartographicsSorted = cesiumEngine.utils.orderCartographicArrayByDistance(oCoordVerticalOneCLL, [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL]);
                    options.callbacks.onDrawUpdate({positions: [cartographicsSorted[0], cartographicsSorted[1], cartographicsSorted[2], cartographicsSorted[3]], properties: oProperties, indices: []});
                }
                else
                {
                    options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
                }
            }
            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
            {
                options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
            }
            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 0)
            {
                options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});
            }
            else
                    //else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 3 && _self.empCesium.drawData.symbolDef.minPoints === 3)
                    {
                        options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});
                    }
        };
        markerCallbacks.drawUpdate = function (positions)
        {
            if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
            {
                if (_self.empCesium.drawData.symbolDef.symbolID === "G*M*NM----****X")
                {
                    //minimum safe distance requires the concentric ciscles to be sorted by distance from center.
                    var cartographicsSorted = cesiumEngine.utils.orderCartographicArrayByDistance(oCoordVerticalOneCLL, [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL]);
                    options.callbacks.onDrawUpdate({positions: [cartographicsSorted[0], cartographicsSorted[1], cartographicsSorted[2], cartographicsSorted[3]], properties: oProperties, indices: []});
                }
                else
                {
                    options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
                }
            }
            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
            {
                options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
            }
            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 0)
            {
                options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});
            }
            else
                    //else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 3 && _self.empCesium.drawData.symbolDef.minPoints === 3)
                    {
                        options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});
                    }
        };
        markerCallbacks.onDrawStart = function (positions)
        {
            if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
            {
                if (_self.empCesium.drawData.symbolDef.symbolID === "G*M*NM----****X")
                {
                    //minimum safe distance requires the concentric ciscles to be sorted by distance from center.
                    var cartographicsSorted = cesiumEngine.utils.orderCartographicArrayByDistance(oCoordVerticalOneCLL, [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL]);
                    options.callbacks.onDrawStart({positions: [cartographicsSorted[0], cartographicsSorted[1], cartographicsSorted[2], cartographicsSorted[3]], properties: oProperties, indices: []});
                    //options.callbacks.onDrawUpdate({positions: [cartographicsSorted[0], cartographicsSorted[1], cartographicsSorted[2], cartographicsSorted[3]], properties: oProperties, indices: []});

                }
                else
                {
                    options.callbacks.onDrawStart({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
                    //options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});

                }
            }
            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
            {
                options.callbacks.onDrawStart({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
                //options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
            }
            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 0)
            {
                options.callbacks.onDrawStart({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});
                //options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});

            }
            else
                    //else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 3 && _self.empCesium.drawData.symbolDef.minPoints === 3)
                    {
                        options.callbacks.onDrawStart({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});
                        //options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});

                    }
        };
        markerCallbacks.dragHandlers.onDrag = function (data)
        {
            var value;
            if (data.index === 0)
            {
                oCoordVerticalOneCLL = data.position;
            }
            else if (data.index === 1)
            {
                oCoordverticalTwoCLL = data.position;
            }
            else if (data.index === 2)
            {
                oCoordHorizontalOneCLL = data.position;
            }
            else if (data.index === 3)
            {
                oCoordVerticalThreeCLL = data.position;
            }
            renderGraphic();
            updateMarkers();
            if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
            {
                if (_self.empCesium.drawData.symbolDef.symbolID === "G*M*NM----****X")
                {
                    //minimum safe distance requires the concentric ciscles to be sorted by distance from center.
                    var cartographicsSorted = cesiumEngine.utils.orderCartographicArrayByDistance(oCoordVerticalOneCLL, [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL]);
                    options.callbacks.onDrawUpdate({positions: [cartographicsSorted[0], cartographicsSorted[1], cartographicsSorted[2], cartographicsSorted[3]], properties: oProperties, indices: [data.index]});
                }
                else
                {
                    options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: [data.index]});
                }
            }
            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
            {
                options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: [data.index]});
            }
            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 0)
            {
                options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: [data.index]});
            }
            else
                    //else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 3 && _self.empCesium.drawData.symbolDef.minPoints === 3)
                    {
                        options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: [data.index]});
                    }
        };
        markerCallbacks.dragHandlers.onDragEnd = function (data)
        {
            if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
            {
                if (_self.empCesium.drawData.symbolDef.symbolID === "G*M*NM----****X")
                {
                    //minimum safe distance requires the concentric ciscles to be sorted by distance from center.
                    var cartographicsSorted = cesiumEngine.utils.orderCartographicArrayByDistance(oCoordVerticalOneCLL, [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL]);
                    options.callbacks.onDrawUpdate({positions: [cartographicsSorted[0], cartographicsSorted[1], cartographicsSorted[2], cartographicsSorted[3]], properties: oProperties, indices: [data.index]});
                }
                else
                {
                    options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties});
                }
            }
            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
            {
                options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: [data.index]});
            }
            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 0)
            {
                options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: [data.index]});
            }
            else
                    // else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 3 && _self.empCesium.drawData.symbolDef.minPoints === 3)
                    {
                        options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: [data.index]});
                    }
        };
        function updateMarkers()
        {
            var centerCartographic;
            var width, height;
            //var corners = getExtentCorners(oRenderedGraphic.rectangle);
            // create if they do not yet exist
            if (!Cesium.defined(markers))
            {
                if (oCoordVerticalOneCLL && oCoordverticalTwoCLL && oCoordHorizontalOneCLL)
                {
                    markers = new _.BillboardGroup(_self, defaultBillboard);
                    markers.addBillboard(oCoordVerticalOneCLL.toCartesian(), markerCallbacks, "right"); // index == 0
                    markers.addBillboard(oCoordverticalTwoCLL.toCartesian(), markerCallbacks, "left"); // index == 1
                    markers.addBillboard(oCoordHorizontalOneCLL.toCartesian(), markerCallbacks, "width"); // index== 3
                    if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
                    {
                        markers.addBillboard(oCoordVerticalThreeCLL.toCartesian(), markerCallbacks, "widthTwo"); // index== 2
                    }
                    else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
                    {
                        markers.addBillboard(oCoordVerticalThreeCLL.toCartesian(), markerCallbacks, "widthTwo"); // index== 2
                    }




                    _self._editedSurface = {};
                    _self._editedSurface._editMarkers = markers;
                    ////_editedSurface._editMarkers._orderedBillboards
                }
                //dWidth = height;// confusing but the height of a reactanglew is interpreseted as the width in the mil std spc.
                //oRenderedGraphic.centerCartographic = centerCartographic;
            }
            else
            {
                var cpCoodinates;
                if (oCoordVerticalOneCLL && oCoordverticalTwoCLL && oCoordHorizontalOneCLL)
                {
                    if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
                    {
                        cpCoodinates = [oCoordVerticalOneCLL.toCartesian(), oCoordverticalTwoCLL.toCartesian(), oCoordHorizontalOneCLL.toCartesian(), oCoordVerticalThreeCLL.toCartesian()];
                    }
                    else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
                    {
                        cpCoodinates = [oCoordVerticalOneCLL.toCartesian(), oCoordverticalTwoCLL.toCartesian(), oCoordHorizontalOneCLL.toCartesian(), oCoordVerticalThreeCLL.toCartesian()];
                    }
                    else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 0)
                    {
                        cpCoodinates = [oCoordVerticalOneCLL.toCartesian(), oCoordverticalTwoCLL.toCartesian(), oCoordHorizontalOneCLL.toCartesian()];
                    }
                    else
                            // else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 3 && _self.empCesium.drawData.symbolDef.minPoints === 3)
                            {
                                cpCoodinates = [oCoordVerticalOneCLL.toCartesian(), oCoordverticalTwoCLL.toCartesian(), oCoordHorizontalOneCLL.toCartesian()];
                            }
                    markers.updateBillboardsPositions(cpCoodinates);
                }
            }
            for (var markerIndex = 0; markerIndex < markers._orderedBillboards.length; ++markerIndex)
            {
                markers._orderedBillboards[markerIndex].eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(_self.empCesium.viewer.camera.positionCartographic.height, _self.lastCameraHeight);
            }
            _self.lastCameraHeight = _self.empCesium.viewer.camera.positionCartographic.height;
            markers.setOnTop();
            _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        }
        ;
        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        mouseHandler.setInputAction(function (movement)
        {
            if (Cesium.defined(movement.position))
            {
                var pickedObject = scene.pick(movement.position);
                var isDrawingRectangleShapePicked = false;
                if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.primitive) && Cesium.defined(pickedObject.primitive.id) && (pickedObject.primitive.id === options.id))
                {
                    //primitive case
                    isDrawingRectangleShapePicked = true;
                }
                else if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.id.id) && typeof (pickedObject.id.id) === "string" && pickedObject.id.id === options.id)
                {
                    // entity case ?
                    isDrawingRectangleShapePicked = true;
                }
                if (isDrawingRectangleShapePicked)
                {
                    //markers.getBillboard(0).
                    dragging = this.empCesium.editorFeatureDraggingEnable;
                    beforeDraggingCartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                    scene.screenSpaceCameraController.enableRotate = false;
                    scene.screenSpaceCameraController.enableTranslate = false;
                    scene.screenSpaceCameraController.enableZoom = true;
                    scene.screenSpaceCameraController.enableTilt = true;
                    scene.screenSpaceCameraController.enableLook = true;
                    //scene.screenSpaceCameraController.inertiaSpin =  0;
                    // scene.screenSpaceCameraController.inertiaTranslate =  0;
                    //markers.getBillboard(0).enableRotation(false);
                    //tooltip.setVisible(false);
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOWN);
        // Now wait for start
        mouseHandler.setInputAction(function (movement)
        {
            if (Cesium.defined(movement.position))
            {
                var oMousePos = scene.camera.pickEllipsoid(movement.position, ellipsoid), indices;
                var pickedObject = scene.pick(movement.position);
                if (pickedObject && (pickedObject.primitive instanceof Cesium.Billboard))
                {
                    // If the Dblclick happened over a Billboard or the collection ignore it.
                    return;
                }
                if (oMousePos)
                {
                    oMousePos = oMousePos.clone();
                    if (!Cesium.defined(oRenderedGraphic))
                    {
                        // create the rectangle
                        var currentExtent = this.empCesium.getExtent();
                        var centerCartographic = Cesium.Rectangle.center(currentExtent);
                        var widthCurrentView = currentExtent.height; //radians
                        oMousePos = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oMousePos);
                        widthCurrentView = Cesium.Math.toDegrees(widthCurrentView); //degrees
                        widthCurrentView = widthCurrentView * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude)); // meters
                        dSectorDistance = Math.round(widthCurrentView / 4.0);
                        oCoordVerticalOneCLL = oMousePos.destinationPoint(0, dSectorDistance / 2);
                        oCoordverticalTwoCLL = oMousePos.destinationPoint(180, dSectorDistance / 2);
                        oCoordHorizontalOneCLL = oMousePos.destinationPoint(90, dSectorDistance);
                        if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
                        {
                            oCoordverticalTwoCLL = oMousePos.destinationPoint(30, dSectorDistance / 2);
                            oCoordVerticalOneCLL = oMousePos.destinationPoint(180, dSectorDistance / 2);
                            oCoordVerticalThreeCLL = oMousePos.destinationPoint(120, dSectorDistance);
                            oCoordHorizontalOneCLL = oMousePos.destinationPoint(50, dSectorDistance / 1.5);
                            if (_self.empCesium.drawData.symbolDef.symbolID === "G*G*OAS---****X")
                            {
                                oCoordVerticalOneCLL = oMousePos.destinationPoint(14, dSectorDistance / 2);
                                oCoordverticalTwoCLL = oMousePos.destinationPoint(179, dSectorDistance / 2);
                                oCoordHorizontalOneCLL = oMousePos.destinationPoint(35, dSectorDistance / 1.5);
                                oCoordVerticalThreeCLL = oMousePos.destinationPoint(160, dSectorDistance / 1.5);
                            }
                        }
                        else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
                        {
                            oCoordverticalTwoCLL = oMousePos.destinationPoint(30, dSectorDistance / 2);
                            oCoordVerticalOneCLL = oMousePos.destinationPoint(180, dSectorDistance / 2);
                            oCoordVerticalThreeCLL = oMousePos.destinationPoint(120, dSectorDistance);
                            oCoordHorizontalOneCLL = oMousePos.destinationPoint(50, dSectorDistance / 1.5);
                        }
                        renderGraphic();
                        updateMarkers();
                        //tooltip.setVisible(false);

                        if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
                        {
                            indices = cesiumEngine.utils.fillArrayWithNumbers(4);
                            options.callbacks.onDrawStart({
                                positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL],
                                properties: oProperties,
                                indices: indices
                            });
                        }
                        else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
                        {
                            indices = cesiumEngine.utils.fillArrayWithNumbers(4);
                            options.callbacks.onDrawStart({
                                positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL],
                                properties: oProperties,
                                indices: []
                            });
                        }
                        else
                        {
                            indices = cesiumEngine.utils.fillArrayWithNumbers(3);
                            options.callbacks.onDrawStart({
                                positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL],
                                properties: oProperties,
                                indices: []
                            });
                        }
                    }
                    if (typeof options.callbacks.onDrawUpdate === 'function')
                    {
                        //options.callbacks.dragHandlers.drawUpdate({positions: [extent.centerCartesian], width: extent.widthMeters, height: extent.heightMeters, azimuth: extent.rotation});
                        //options.callbacks.onDrawUpdate({positions: [extent.centerCartesian], width: extent.widthMeters, height: extent.heightMeters, azimuth: extent.rotation});
                        if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
                        {
                            if (_self.empCesium.drawData.symbolDef.symbolID === "G*M*NM----****X")
                            {
                                //minimum safe distance requires the concentric ciscles to be sorted by distance from center.
                                var cartographicsSorted = cesiumEngine.utils.orderCartographicArrayByDistance(oCoordVerticalOneCLL, [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL]);
                                options.callbacks.onDrawUpdate({positions: [cartographicsSorted[0], cartographicsSorted[1], cartographicsSorted[2], cartographicsSorted[3]], properties: oProperties, indices: []});
                            }
                            else
                            {
                                options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
                            }
                        }
                        else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
                        {
                            options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
                        }
                        else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 0)
                        {
                            options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});
                        }
                        else
                        {
                            options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});
                        }
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.endPosition;
            if (Cesium.defined(position))
            {
                if (!Cesium.defined(oRenderedGraphic))
                {
                    //tooltip.setVisible(true);
                    //tooltip.showAt(position, "<p>Click to start drawing rectangle</p>");
                }
                else
                {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian && dragging)
                    {
                        var deltaCartesian = new Cesium.Cartesian3(), indices;
                        deltaCartesian = Cesium.Cartesian3.subtract(beforeDraggingCartesian, cartesian, deltaCartesian);
                        var deltaX = deltaCartesian.x;
                        var deltaY = deltaCartesian.y;
                        var deltaZ = deltaCartesian.z;
                        var oCoordVerticalOneCXY = oCoordVerticalOneCLL.toCartesian();
                        oCoordVerticalOneCXY.x -= deltaX;
                        oCoordVerticalOneCXY.y -= deltaY;
                        oCoordVerticalOneCXY.z -= deltaZ;
                        var previousHeight = oCoordVerticalOneCLL.height;
                        oCoordVerticalOneCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCoordVerticalOneCXY);
                        oCoordVerticalOneCLL.height = previousHeight;
                        var oCoordverticalTwoCXY = oCoordverticalTwoCLL.toCartesian();
                        oCoordverticalTwoCXY.x -= deltaX;
                        oCoordverticalTwoCXY.y -= deltaY;
                        oCoordverticalTwoCXY.z -= deltaZ;
                        previousHeight = oCoordverticalTwoCLL.height;
                        oCoordverticalTwoCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCoordverticalTwoCXY);
                        oCoordverticalTwoCLL.height = previousHeight;
                        var oCoordHorizontalOneCXY = oCoordHorizontalOneCLL.toCartesian();
                        oCoordHorizontalOneCXY.x -= deltaX;
                        oCoordHorizontalOneCXY.y -= deltaY;
                        oCoordHorizontalOneCXY.z -= deltaZ;
                        previousHeight = oCoordHorizontalOneCLL.height;
                        oCoordHorizontalOneCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCoordHorizontalOneCXY);
                        oCoordHorizontalOneCLL.height = previousHeight;
                        if (_self.empCesium.drawData.standard === 1)
                        {
                            var oCoordVerticalThreeCXY = oCoordVerticalThreeCLL.toCartesian();
                            oCoordVerticalThreeCXY.x -= deltaX;
                            oCoordVerticalThreeCXY.y -= deltaY;
                            oCoordVerticalThreeCXY.z -= deltaZ;
                            previousHeight = oCoordVerticalThreeCLL.height;
                            oCoordVerticalThreeCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCoordVerticalThreeCXY);
                            oCoordVerticalThreeCLL.height = previousHeight;
                            oCoordVerticalThreeCLL.height = (oCoordVerticalThreeCLL.height < 0) ? 0 : oCoordVerticalThreeCLL.height;
                        }

                        oCoordVerticalOneCLL.height = (oCoordVerticalOneCLL.height < 0) ? 0 : oCoordVerticalOneCLL.height;
                        oCoordverticalTwoCLL.height = (oCoordverticalTwoCLL.height < 0) ? 0 : oCoordverticalTwoCLL.height;
                        oCoordHorizontalOneCLL.height = (oCoordHorizontalOneCLL.height < 0) ? 0 : oCoordHorizontalOneCLL.height;

                        renderGraphic();
                        updateMarkers();
                        beforeDraggingCartesian = cartesian;
                        if (typeof options.callbacks.onDrawUpdate === 'function')
                        {
                            if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
                            {
                                if (_self.empCesium.drawData.symbolDef.symbolID === "G*M*NM----****X")
                                {
                                    indices = cesiumEngine.utils.fillArrayWithNumbers(4);
                                    //minimum safe distance requires the concentric ciscles to be sorted by distance from center.
                                    var cartographicsSorted = cesiumEngine.utils.orderCartographicArrayByDistance(oCoordVerticalOneCLL, [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL]);
                                    options.callbacks.onDrawUpdate({positions: [cartographicsSorted[0], cartographicsSorted[1], cartographicsSorted[2], cartographicsSorted[3]], properties: oProperties, indices: indices});
                                }
                                else
                                {
                                    indices = cesiumEngine.utils.fillArrayWithNumbers(4);
                                    options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: indices});
                                }
                            }
                            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
                            {
                                indices = cesiumEngine.utils.fillArrayWithNumbers(4);
                                options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: indices});
                            }
                            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 0)
                            {
                                indices = cesiumEngine.utils.fillArrayWithNumbers(3);
                                options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: indices});
                            }
                            else
                                    // else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 3 && _self.empCesium.drawData.symbolDef.minPoints === 3)
                                    {
                                        indices = cesiumEngine.utils.fillArrayWithNumbers(3);
                                        options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: indices});
                                    }
                        }
                        //tooltip.setVisible(false);
                    }
                    else if (cartesian && !dragging)
                    {
                        // tooltip.setVisible(false);
                        //tooltip.showAt(position, "<p>Drag control points to change rectangle extent</p><p>Click again to finish drawing</p>");
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.position;
            if (Cesium.defined(position))
            {
                if (!Cesium.defined(oRenderedGraphic))
                {
                    return;
                }
                else
                {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (Cesium.defined(cartesian))
                    {
                        _self.stopDrawing();
                        if (typeof options.callbacks.onDrawEnd === 'function')
                        {
                            if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
                            {
                                if (_self.empCesium.drawData.symbolDef.symbolID === "G*M*NM----****X")
                                {
                                    //minimum safe distance requires the concentric ciscles to be sorted by distance from center.
                                    var cartographicsSorted = cesiumEngine.utils.orderCartographicArrayByDistance(oCoordVerticalOneCLL, [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL]);
                                    options.callbacks.onDrawEnd({positions: [cartographicsSorted[0], cartographicsSorted[1], cartographicsSorted[2], cartographicsSorted[3]], properties: oProperties, indices: []});
                                }
                                else
                                {
                                    options.callbacks.onDrawEnd({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
                                }
                            }
                            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
                            {
                                options.callbacks.onDrawEnd({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
                            }
                            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 0)
                            {
                                options.callbacks.onDrawEnd({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});
                            }
                            else
                                    // else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 3 && _self.empCesium.drawData.symbolDef.minPoints === 3)
                                    {
                                        options.callbacks.onDrawEnd({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});
                                    }
                        }
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        mouseHandler.setInputAction(function (movement)
        {
            if (dragging)
            {
                var delayUnlockingMapTimeOut = setTimeout(function ()
                {
                    scene.screenSpaceCameraController.enableRotate = true;
                    //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                    // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                    scene.screenSpaceCameraController.enableTranslate = true;
                    scene.screenSpaceCameraController.enableZoom = true;
                    scene.screenSpaceCameraController.enableTilt = true;
                    scene.screenSpaceCameraController.enableLook = true;
                }.bind(this), 70);
            }
            dragging = false;
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_UP);

        if (this.empCesium.defined(options.item.originFeature))
                //if (options.item.hasOwnProperty('originFeature'))
                        //if (options.item.hasOwnProperty('originFeature') && (options.item.originFeature instanceof emp.typeLibrary.Feature))
                        {
                            // editing existing
                            oDrawItem.symbolCode = oDrawItem.originFeature.data.symbolCode;
                            var cartographics = cesiumEngine.utils.convertGeoJsonCoordToCartographicList(oDrawItem.originFeature.data);
                            oCoordVerticalOneCLL = cartographics[0];
                            oCoordverticalTwoCLL = cartographics[1];
                            oCoordHorizontalOneCLL = cartographics[2];
                            if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
                            {
                                oCoordVerticalThreeCLL = cartographics[3];
                            }
                            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
                            {
                                oCoordVerticalThreeCLL = cartographics[3];
                            }
//            oCoordVerticalOneCLL = new Cesium.Cartographic(oDrawItem.originFeature.data.coordinates[0][0].toRad(), oDrawItem.originFeature.data.coordinates[0][1].toRad(), 0);
//            oCoordverticalTwoCLL = new Cesium.Cartographic(oDrawItem.originFeature.data.coordinates[1][0].toRad(), oDrawItem.originFeature.data.coordinates[1][1].toRad(), 0);
//            oCoordVerticalThreeCLL = new Cesium.Cartographic(oDrawItem.originFeature.data.coordinates[2][0].toRad(), oDrawItem.originFeature.data.coordinates[2][1].toRad(), 0);
//            oCoordHorizontalOneCLL = new Cesium.Cartographic(oDrawItem.originFeature.data.coordinates[3][0].toRad(), oDrawItem.originFeature.data.coordinates[2][1].toRad(), 0);
                            oProperties = emp.helpers.copyObject(oDrawItem.originFeature.properties);
                            oModifiers = oProperties.modifiers || {};
                            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                            oProperties.modifiers = oModifiers;
                            renderGraphic();
                            updateMarkers();
                            if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
                            {
                                if (_self.empCesium.drawData.symbolDef.symbolID === "G*M*NM----****X")
                                {
                                    //minimum safe distance requires the concentric ciscles to be sorted by distance from center.
                                    var cartographicsSorted = cesiumEngine.utils.orderCartographicArrayByDistance(oCoordVerticalOneCLL, [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL]);
                                    options.callbacks.onDrawStart({positions: [cartographicsSorted[0], cartographicsSorted[1], cartographicsSorted[2], cartographicsSorted[3]], properties: oProperties, indices: []});
                                    //options.callbacks.onDrawUpdate({positions: [cartographicsSorted[0], cartographicsSorted[1], cartographicsSorted[2], cartographicsSorted[3]], properties: oProperties, indices: []});
                                }
                                else
                                {
                                    options.callbacks.onDrawStart({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
                                    // options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
                                }
                            }
                            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
                            {
                                options.callbacks.onDrawStart({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
                                //options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
                            }
                            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 0)
                            {
                                options.callbacks.onDrawStart({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});
                                //options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});

                            }
//            else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 3 && _self.empCesium.drawData.symbolDef.minPoints === 3)
                            else
                            {
                                options.callbacks.onDrawStart({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});
                                //options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: []});
                            }
                        }
                else if (this.empCesium.drawData.coordinates && this.empCesium.drawData.coordinates.length === 1)
                {
                    oProperties = emp.helpers.copyObject(oDrawItem.properties);
                    oModifiers = oProperties.modifiers || {};
                    oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                    oProperties.modifiers = oModifiers;

                    var currentExtent = this.empCesium.getExtent(), indices;
                    var centerCartographic = Cesium.Rectangle.center(currentExtent);
                    var widthCurrentView = currentExtent.height; //radians
                    var locationCartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(this.empCesium.drawData.coordinates[0]);
                    widthCurrentView = Cesium.Math.toDegrees(widthCurrentView); //degrees
                    widthCurrentView = widthCurrentView * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude)); // meters
                    dSectorDistance = Math.round(widthCurrentView / 4.0);
                    oCoordVerticalOneCLL = locationCartographic.destinationPoint(0, dSectorDistance / 2);
                    oCoordverticalTwoCLL = locationCartographic.destinationPoint(180, dSectorDistance / 2);
                    oCoordHorizontalOneCLL = locationCartographic.destinationPoint(90, dSectorDistance);
                    if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
                    {
                        oCoordverticalTwoCLL = locationCartographic.destinationPoint(30, dSectorDistance / 2);
                        oCoordVerticalOneCLL = locationCartographic.destinationPoint(180, dSectorDistance / 2);
                        oCoordVerticalThreeCLL = locationCartographic.destinationPoint(120, dSectorDistance);
                        oCoordHorizontalOneCLL = locationCartographic.destinationPoint(50, dSectorDistance / 1.5);
                        if (_self.empCesium.drawData.symbolDef.symbolID === "G*G*OAS---****X")
                        {
                            oCoordVerticalOneCLL = locationCartographic.destinationPoint(14, dSectorDistance / 2);
                            oCoordverticalTwoCLL = locationCartographic.destinationPoint(179, dSectorDistance / 2);
                            oCoordHorizontalOneCLL = locationCartographic.destinationPoint(35, dSectorDistance / 1.5);
                            oCoordVerticalThreeCLL = locationCartographic.destinationPoint(160, dSectorDistance / 1.5);
                        }
                    }
                    else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
                    {
                        oCoordverticalTwoCLL = locationCartographic.destinationPoint(30, dSectorDistance / 2);
                        oCoordVerticalOneCLL = locationCartographic.destinationPoint(180, dSectorDistance / 2);
                        oCoordVerticalThreeCLL = locationCartographic.destinationPoint(120, dSectorDistance);
                        oCoordHorizontalOneCLL = locationCartographic.destinationPoint(50, dSectorDistance / 1.5);
                    }
                    renderGraphic();
                    updateMarkers();
                    //tooltip.setVisible(false);

                    if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
                    {
                        indices = cesiumEngine.utils.fillArrayWithNumbers(4);
                        options.callbacks.onDrawStart({
                            positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL],
                            properties: oProperties,
                            indices: indices
                        });
                        //options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});
                    }
                    else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
                    {
                        indices = cesiumEngine.utils.fillArrayWithNumbers(4);
                        options.callbacks.onDrawStart({
                            positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL],
                            properties: oProperties,
                            indices: indices
                        });
                        // options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: indices});
                    }
                    else
                    {
                        indices = cesiumEngine.utils.fillArrayWithNumbers(3);
                        options.callbacks.onDrawStart({
                            positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL],
                            properties: oProperties,
                            indices: indices
                        });
                        //options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL], properties: oProperties, indices: indices});
                    }

                }
                else if (this.empCesium.drawData.coordinates && this.empCesium.drawData.coordinates.length === 3)
                {
                    oProperties = emp.helpers.copyObject(oDrawItem.properties);
                    oModifiers = oProperties.modifiers || {};
                    oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                    oProperties.modifiers = oModifiers;

                    oCoordVerticalOneCLL = this.empCesium.drawData.coordinates[0];
                    oCoordverticalTwoCLL = this.empCesium.drawData.coordinates[1];
                    oCoordHorizontalOneCLL = this.empCesium.drawData.coordinates[2];

                    renderGraphic();
                    updateMarkers();
                    //tooltip.setVisible(false);

                    if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
                    {
                        options.callbacks.onDrawStart({
                            positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL],
                            properties: oProperties,
                            indices: []
                        });
                        //options.callbacks.onDrawUpdate({positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL], properties: oProperties, indices: []});

                    }
                    else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
                    {
                        options.callbacks.onDrawStart({
                            positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL],
                            properties: oProperties,
                            indices: []
                        });
//                options.callbacks.onDrawUpdate({
//                    positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL],
//                    properties: oProperties,
//                    indices: []
//                });
                    }
                    else
                    {
                        options.callbacks.onDrawStart({
                            positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL],
                            properties: oProperties,
                            indices: []
                        });
//                options.callbacks.onDrawUpdate({
//                    positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL],
//                    properties: oProperties,
//                    indices: []
//                });
                    }
                }
                else if (this.empCesium.drawData.coordinates && this.empCesium.drawData.coordinates.length === 4)
                {
                    oProperties = emp.helpers.copyObject(oDrawItem.properties);
                    oModifiers = oProperties.modifiers || {};
                    oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                    oProperties.modifiers = oModifiers;

                    oCoordVerticalOneCLL = this.empCesium.drawData.coordinates[0];
                    oCoordverticalTwoCLL = this.empCesium.drawData.coordinates[1];
                    oCoordHorizontalOneCLL = this.empCesium.drawData.coordinates[2];
                    oCoordVerticalThreeCLL = this.empCesium.drawData.coordinates[3];

                    renderGraphic();
                    updateMarkers();
                    //tooltip.setVisible(false);

                    if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 4)
                    {
                        options.callbacks.onDrawStart({
                            positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL],
                            properties: oProperties
                        });
//                options.callbacks.onDrawUpdate({
//                    positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL],
//                    properties: oProperties
//                });
                    }
                    else if (_self.empCesium.drawData.symbolDef && _self.empCesium.drawData.symbolDef.maxPoints === 4 && _self.empCesium.drawData.symbolDef.minPoints === 3 && _self.empCesium.drawData.standard === 1)
                    {
                        options.callbacks.onDrawStart({
                            positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL],
                            properties: oProperties
                        });
//                options.callbacks.onDrawUpdate({
//                    positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL, oCoordVerticalThreeCLL],
//                    properties: oProperties
//                });
                    }
                    else
                    {
                        options.callbacks.onDrawStart({
                            positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL],
                            properties: oProperties,
                            indices: []
                        });
//                options.callbacks.onDrawUpdate({
//                    positions: [oCoordVerticalOneCLL, oCoordverticalTwoCLL, oCoordHorizontalOneCLL],
//                    properties: oProperties,
//                    indices: []
//                });
                    }
                }
                else
                {
                    oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                    oProperties.modifiers = oModifiers;
                }
                this.muteHandlers(false);
            };
    _.prototype.startDrawingCategoryRectangleParameteredAutoShape = function (options)
    {
        var options = copyOptions(options, defaultSurfaceOptions);
        options.scale = 4.0;
        var _self = this;
        var scene = this._scene;
        var primitives = this._scene.primitives;
        var dragging = false;
        var beforeDraggingCartesian = undefined;
        var tooltip = this._tooltip;
        var firstPoint;
        var azimuth = 0;
        var markers;
        var isDrawingRectangleShapePicked = false;
        var dLength = 5000;
        var dWidth = 2500;
        var dAzimuth = 0;
        var oRenderedGraphic;
        var oRectangle;
        var oEllipse;
        var oCoordCenterCLL;
        var oCoordAzimuthCLL;
        var oCoordWidthCLL;
        var oCoordLengthCLL;
        var markerCallbacks = {};
        var oRenderedGraphic;
        var oDrawItem = options.item;
        var oProperties = oDrawItem.properties || {};
        var oModifiers = oProperties.modifiers || {};
        oProperties.modifiers = oModifiers;
        markerCallbacks.dragHandlers = {};
        oDrawItem.properties = oProperties;
        oDrawItem.id = options.id;
        
        var renderGraphicEllipse = function ()
        {
            var oRenderModifiers = emp.helpers.copyObject(oModifiers);
            var oExtent = this.empCesium.getExtent();
            var sExtents = oExtent.west.toDeg() + "," + oExtent.south.toDeg() + "," + oExtent.east.toDeg() + "," + oExtent.north.toDeg();
            var sCoordinates = cesiumEngine.utils.convertCartographicsToSECRendererCoordsString([oCoordCenterCLL]); //    oSensorCLL.longitude.toDeg().toString() + "," + oSensorCLL.latitude.toDeg().toString();
            var oMaterial;
            var oRenderData;
            var cartographics = [oCoordCenterCLL];
            dAzimuth = oCoordCenterCLL.bearingTo(oCoordAzimuthCLL);
            ///azimuth = azimuth.toRad();
            dAzimuth = dAzimuth.toRad() - Cesium.Math.PI_OVER_TWO;
            //azimuth = Cesium.Math.PI_OVER_TWO - azimuth;

            oRenderModifiers[emp.typeLibrary.utils.milstd.StringModifiers.LINE_COLOR] = EmpCesiumConstants.selectionProperties.COLOR_HEX;
            if (oDrawItem.symbolCode === "PBS_ELLIPSE----")
            {
                oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dWidth / 2, dLength / 2];
            }
            else if (oDrawItem.symbolCode === "PBS_CIRCLE-----")
            {
                oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dLength / 2,dLength / 2];
                dAzimuth = 0;
            }
            else
            {
                oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dLength, dWidth]; // renderer likes this order
            }

            if (_self.empCesium.drawData.standard === 0)
            {
                oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = [dAzimuth.toMilsFromRad()]; //b  standard is in mils
            }
            else
            {
                oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = [dAzimuth.toDeg()]; // c standard is in degrees
            }
            
            if (oRenderedGraphic)
            {
                //oRenderedGraphic.position = getLatestPositionEllipseCallbackProperty;
                oRenderedGraphic.ellipse.rotation = -dAzimuth;
                oRenderedGraphic.ellipse.semiMajorAxis =  (oDrawItem.symbolCode === "PBS_ELLIPSE----")?dLength / 2:dLength / 2;
                oRenderedGraphic.ellipse.semiMinorAxis =  (oDrawItem.symbolCode === "PBS_ELLIPSE----")?dWidth / 2:dLength / 2;
                _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
            }
            else
            {
                oEllipse=   new _self.empCesium.EllipseGraphics();
                 
                //center: oCoordCenterCLL.toCartesian();
                oEllipse.semiMajorAxis =  (oDrawItem.symbolCode === "PBS_ELLIPSE----")?dLength / 2:dLength / 2;
                oEllipse.semiMinorAxis =  (oDrawItem.symbolCode === "PBS_ELLIPSE----")?dWidth / 2:dLength / 2;
                oEllipse.rotation = -dAzimuth;
                oEllipse.fill = false;
                oEllipse.outline = true;
                //oRenderedGraphic.height: 0,
                //oRenderedGraphic.vertexFormat = Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                //stRotation: Cesium.textureRotationAngle,
                //oEllipse.granularity = 10000;
                
                oRenderedGraphic = new _self.empCesium.Entity();
                oRenderedGraphic.featureType = EmpCesiumConstants.featureType.ENTITY;
                oRenderedGraphic.ellipse = oEllipse;
                oRenderedGraphic.position =  getLatestPositionEllipseCallbackProperty;
                
               oRenderedGraphic = _self.empCesium.viewer.entities.add(oRenderedGraphic);
            
                oRenderedGraphic.featureId = oDrawItem.featureId;
                oRenderedGraphic.coreId = oDrawItem.coreId;
                oRenderedGraphic.overlayId = oDrawItem.overlayId;
                oRenderedGraphic.symbolCode = oDrawItem.symbolCode;
                oRenderedGraphic._editMode = true;
                oRenderedGraphic.featureType = EmpCesiumConstants.featureType.ENTITY;
            }
            // update modifiers that will go back via the call backs.
            oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH];
            _self.muteHandlers(false);
        }.bind(this);
        
         var getLatestPositionEllipseCallbackProperty = new Cesium.CallbackProperty(function getRectangle(time, result)
        {
            return oCoordCenterCLL.toCartesian();
        }, false);
        
        var renderGraphic = function ()
        {
//              if ((oDrawItem.symbolCode === "PBS_ELLIPSE----") || (oDrawItem.symbolCode === "PBS_CIRCLE-----"))
//            {
//               renderGraphicEllipse();
//               return;
//            }
            
            var oRenderModifiers = emp.helpers.copyObject(oModifiers);
            var oExtent = this.empCesium.getExtent();
            var sExtents = oExtent.west.toDeg() + "," + oExtent.south.toDeg() + "," + oExtent.east.toDeg() + "," + oExtent.north.toDeg();
            var sCoordinates = cesiumEngine.utils.convertCartographicsToSECRendererCoordsString([oCoordCenterCLL]); //    oSensorCLL.longitude.toDeg().toString() + "," + oSensorCLL.latitude.toDeg().toString();
            var oMaterial;
            var oRenderData;
            var cartographics = [oCoordCenterCLL];
            dAzimuth = oCoordCenterCLL.bearingTo(oCoordAzimuthCLL);
            ///azimuth = azimuth.toRad();
            dAzimuth = dAzimuth.toRad() - Cesium.Math.PI_OVER_TWO;
            //azimuth = Cesium.Math.PI_OVER_TWO - azimuth;

            oRenderModifiers[emp.typeLibrary.utils.milstd.StringModifiers.LINE_COLOR] = EmpCesiumConstants.selectionProperties.COLOR_HEX;
            if (oDrawItem.symbolCode === "PBS_ELLIPSE----")
            {
                oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dWidth / 2, dLength / 2];
            }
            else
            {
                oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dLength, dWidth]; // renderer likes this order
            }

            if (_self.empCesium.drawData.standard === 0)
            {
                oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = [dAzimuth.toMilsFromRad()]; //b  standard is in mils
            }
            else
            {
                oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = [dAzimuth.toDeg()]; // c standard is in degrees
            }
            //oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, "clampToGround", this.empCesium.getScale(), sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
            oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol2D(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, this.empCesium.canvas.width, this.empCesium.canvas.height, sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
            //oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dWidth, dLength];// this is the correct order to send back to clients
            if (oRenderData && (typeof (oRenderData) === 'string'))
            {
                new emp.typeLibrary.Error({
                    level: emp.typeLibrary.Error.level.CATASTROPHIC,
                    message: "RenderSymbol2D return: " + oRenderData
                });
                return;
            }

            oMaterial = new _self.empCesium.ImageMaterialProperty();
            oMaterial.image = oRenderData.image;
            oMaterial.transparent = true;
            if (!Cesium.defined(oRenderData.west) || !Cesium.defined(oRenderData.south) || !Cesium.defined(oRenderData.east) || !Cesium.defined(oRenderData.north))
            {
                oRectangle = Cesium.Rectangle.fromCartographicArray(cartographics);
            }
            else
            {
                oRectangle = Cesium.Rectangle.fromDegrees(oRenderData.west.x, oRenderData.south.y, oRenderData.east.x, oRenderData.north.y);
            }
            if (oRenderedGraphic)
            {
                oRenderedGraphic.rectangle.material.image = oRenderData.image;
                _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
            }
            else
            {
                oRenderedGraphic = new _self.empCesium.Entity({
                    id: oDrawItem.id,
                    selectable: true,
                    show: true,
                    rectangle: {
                        coordinates: getLatestRectangleCallbackProperty,
                        material: oMaterial
                    }
                });
                oRenderedGraphic.featureId = oDrawItem.featureId;
                oRenderedGraphic.coreId = oDrawItem.coreId;
                oRenderedGraphic.overlayId = oDrawItem.overlayId;
                oRenderedGraphic.symbolCode = oDrawItem.symbolCode;
                oRenderedGraphic._editMode = true;
                oRenderedGraphic.featureType = EmpCesiumConstants.featureType.ENTITY;
                oRenderedGraphic = _self.empCesium.viewer.entities.add(oRenderedGraphic);
            }
            // update modifiers that will go back via the call backs.
            oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH];
            _self.muteHandlers(false);
        }.bind(this);

        _self.empCesium.currentMultiPointEditorRenderGraphicFuction = renderGraphic;
        
        var getLatestRectangleCallbackProperty = new Cesium.CallbackProperty(function getRectangle(time, result)
        {
            return Cesium.Rectangle.clone(oRectangle, result);
        }, false);
        this.startDrawing(
                function ()
                {
                    if (Cesium.defined(oRenderedGraphic))
                    {
                        _self.empCesium.viewer.entities.remove(oRenderedGraphic);
                    }
                    if (markers)
                    {
                        markers.remove();
                    }
                    mouseHandler.destroy();
                    //  tooltip.setVisible(false);
                }
        );
        markerCallbacks.drawEnd = function (positions)
        {
            options.callbacks.onDrawUpdate({positions: [oCoordCenterCLL], properties: oProperties, indices: []});
        };
        markerCallbacks.drawUpdate = function (positions)
        {
            options.callbacks.onDrawUpdate({positions: [oCoordCenterCLL], properties: oProperties, indices: []});
        };
        markerCallbacks.onDrawStart = function (positions)
        {
            options.callbacks.onDrawStart({positions: [oCoordCenterCLL], properties: oProperties, indices: []});
            //options.callbacks.onDrawUpdate({positions: [oCoordCenterCLL], properties: oProperties, indices: []});
        };
        markerCallbacks.dragHandlers.onDrag = function (data)
        {
            var value;
            var cartesian = data.position.toCartesian();
            // tooltip.setVisible(false);
            if (data.index === 0)
            {
                //center control point
                //oCoordCenterCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);

                if (cartesian)
                {
                    var deltaCartesian = new Cesium.Cartesian3();
                    deltaCartesian = Cesium.Cartesian3.subtract(oCoordCenterCLL.toCartesian(), cartesian, deltaCartesian);
                    var deltaX = deltaCartesian.x;
                    var deltaY = deltaCartesian.y;
                    var deltaZ = deltaCartesian.z;
                    var oCoordCenterCXY = oCoordCenterCLL.toCartesian();
                    oCoordCenterCXY.x -= deltaX;
                    oCoordCenterCXY.y -= deltaY;
                    oCoordCenterCXY.z -= deltaZ;
                    var previousHeight = oCoordCenterCLL.height;
                    oCoordCenterCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCoordCenterCXY);
                    oCoordCenterCLL.height = previousHeight;
                    var oCoordLengthCXY = oCoordLengthCLL.toCartesian();
                    oCoordLengthCXY.x -= deltaX;
                    oCoordLengthCXY.y -= deltaY;
                    oCoordLengthCXY.z -= deltaZ;
                    previousHeight = oCoordLengthCLL.height;
                    oCoordLengthCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCoordLengthCXY);
                    oCoordLengthCLL.height = previousHeight;
                    var oCoordWidthCXY = oCoordWidthCLL.toCartesian();
                    oCoordWidthCXY.x -= deltaX;
                    oCoordWidthCXY.y -= deltaY;
                    oCoordWidthCXY.z -= deltaZ;
                    previousHeight = oCoordWidthCLL.height;
                    oCoordWidthCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCoordWidthCXY);
                    oCoordWidthCLL.height = previousHeight;
                    var oCoordAzimuthCXY = oCoordAzimuthCLL.toCartesian();
                    oCoordAzimuthCXY.x -= deltaX;
                    oCoordAzimuthCXY.y -= deltaY;
                    oCoordAzimuthCXY.z -= deltaZ;
                    previousHeight = oCoordAzimuthCLL.height;
                    oCoordAzimuthCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCoordAzimuthCXY);
                    oCoordAzimuthCLL.height = previousHeight;
                    oCoordAzimuthCLL.height = (oCoordAzimuthCLL.height < 0) ? 0 : oCoordAzimuthCLL.height;
                    oCoordLengthCLL.height = (oCoordLengthCLL.height < 0) ? 0 : oCoordLengthCLL.height;
                    oCoordWidthCLL.height = (oCoordWidthCLL.height < 0) ? 0 : oCoordWidthCLL.height;
                    //renderGraphic();
                    //updateMarkers();
                    //beforeDraggingCartesian = cartesian;
//                            if (typeof options.callbacks.onDrawUpdate == 'function') {
//                                options.callbacks.onDrawUpdate({coordinates: [oCoordCenterCLL], properties: oProperties});
//                            }
//                            tooltip.setVisible(false);
                }
//                        else if (cartesian && !dragging)
//                        {
//                            tooltip.setVisible(false);
//                            tooltip.showAt(position, "<p>Drag control points to change rectangle extent</p><p>Click again to finish drawing</p>");
//                        }
            }
            else if (data.index === 1)
            {
                //length on left control point
                var newoCoordLengthCLL = data.position;
                //var newoCoordLengthCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
                //var zeta = oCoordCenterCLL.getAzimuth(oCoordLengthCLL);// degrees clokwise positive values ex -82 4th cuadrant
                var zeta = oCoordCenterCLL.bearingTo(newoCoordLengthCLL); // degrees clokwise positive values ex +272
                var dist = oCoordCenterCLL.distanceTo(newoCoordLengthCLL);
                dLength = dist * 2;
                 if  (oDrawItem.symbolCode === "PBS_CIRCLE-----")
                {
                   dWidth =  dLength ;
                }
                //dLength = Math.abs(dist * Math.cos(90 + zeta)) * 2;
                zeta = oCoordCenterCLL.bearingTo(oCoordAzimuthCLL);
                var previousHeight = oCoordLengthCLL.height;
                oCoordLengthCLL = oCoordCenterCLL.destinationPoint(zeta + 180, dLength / 2);
                oCoordLengthCLL.height = previousHeight;
                previousHeight = oCoordAzimuthCLL.height;
                oCoordAzimuthCLL = oCoordCenterCLL.destinationPoint(zeta, dLength / 2);
                oCoordAzimuthCLL.height = previousHeight;
                oCoordAzimuthCLL.height = (oCoordAzimuthCLL.height < 0) ? 0 : oCoordAzimuthCLL.height;
                oCoordLengthCLL.height = (oCoordLengthCLL.height < 0) ? 0 : oCoordLengthCLL.height;
            }
            else if (data.index === 2)
            {
                //width or top control point
                var newoCoordWidthCLL = data.position;
                //var  newoCoordWidthCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
                //var centerCartographic = oCoordLengthCLL.midpointTo(oCoordAzimuthCLL);
                var zeta = oCoordCenterCLL.bearingTo(oCoordAzimuthCLL); // degrees
                //zeta = zeta.toRad();
                var dist = oCoordCenterCLL.distanceTo(newoCoordWidthCLL);
                dWidth = dist * 2;
                if  (oDrawItem.symbolCode === "PBS_CIRCLE-----")
                {
                    dLength = dWidth;
                }
                //dWidth = Math.abs(dist * Math.cos(zeta)) * 2;
                var previousHeight = oCoordWidthCLL.height;
                oCoordWidthCLL = oCoordCenterCLL.destinationPoint(zeta - 90, dWidth / 2);
                oCoordWidthCLL.height = previousHeight;
                oCoordWidthCLL.height = (oCoordWidthCLL.height < 0) ? 0 : oCoordWidthCLL.height;
            }
            else if (data.index === 3)
            {
                //azimuth on right control point
                var oNewCoordAzimuthCLL = data.position;
                var oNewCoordAzimuthCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
                var zeta = oCoordCenterCLL.bearingTo(oNewCoordAzimuthCLL); // degrees
                var previousHeight = oCoordAzimuthCLL.height;
                oCoordAzimuthCLL = oCoordCenterCLL.destinationPoint(zeta, dLength / 2);
                oCoordAzimuthCLL.heigt = previousHeight;
                previousHeight = oCoordLengthCLL.height;
                oCoordLengthCLL = oCoordCenterCLL.destinationPoint(180 + zeta, dLength / 2);
                oCoordLengthCLL.height = previousHeight;
                previousHeight = oCoordWidthCLL.height;
                oCoordWidthCLL = oCoordCenterCLL.destinationPoint(zeta - 90, dWidth / 2);
                oCoordWidthCLL.height = previousHeight;
                oCoordAzimuthCLL.height = (oCoordAzimuthCLL.height < 0) ? 0 : oCoordAzimuthCLL.height;
                oCoordLengthCLL.height = (oCoordLengthCLL.height < 0) ? 0 : oCoordLengthCLL.height;
                oCoordWidthCLL.height = (oCoordWidthCLL.height < 0) ? 0 : oCoordWidthCLL.height;
            }
            renderGraphic();
            updateMarkers();
            //  LatLon.prototype.midpointTo = function (point)
            //var westPoint = value.west;
            //var eastPoint = value.east;
            options.callbacks.onDrawUpdate({positions: [oCoordCenterCLL], properties: oProperties, indices: [data.index]});
        };
        markerCallbacks.dragHandlers.onDragEnd = function (data)
        {
            options.callbacks.onDrawUpdate({positions: [oCoordCenterCLL], properties: oProperties, indices: [data.index]});
        };
        function updateMarkers()
        {
            var centerCartographic;
            var width, height;
            //var corners = getExtentCorners(oRenderedGraphic.rectangle);
            // create if they do not yet exist
            if (!Cesium.defined(markers))
            {
                markers = new _.BillboardGroup(_self, defaultBillboard);
                _self._editedSurface = {};
                _self._editedSurface._editMarkers = markers;
                //centerCartographic = oCoordLengthCLL.midpointTo(oCoordAzimuthCLL);
                //var angle = oCoordLengthCLL.getAzimuth(oCoordAzimuthCLL);
                //angle =   angle.toRad() - Cesium.Math.PI_OVER_TWO; 
                //var oCoordTopCLL = centerCartographic.destinationPoint(angle.toDeg(),dWidth/2 );
                if (oCoordCenterCLL && oCoordLengthCLL && oCoordWidthCLL && oCoordAzimuthCLL)  
                {
                    markers.addControlPoint({position: oCoordCenterCLL.toCartesian(), callbacks: markerCallbacks, cpType: "vertex"}); // index == 0
                    markers.addControlPoint({position: oCoordLengthCLL.toCartesian(), callbacks: markerCallbacks, cpType: "length"}); // index == 1
                    markers.addControlPoint({position: oCoordWidthCLL.toCartesian(), callbacks: markerCallbacks, cpType: "width"}); // index== 2
                    markers.addControlPoint({position: oCoordAzimuthCLL.toCartesian(), callbacks: markerCallbacks, cpType: "azimuth"}); // index== 3
                    if (oDrawItem.symbolCode === "PBS_CIRCLE-----")
                    {
                        // hide the azimuth and width control points
                        markers._orderedBillboards[1].show = false;
                        markers._orderedBillboards[3].show = false;
                    }
                }
                //dWidth = height;// confusing but the height of a reactanglew is interpreseted as the width in the mil std spc.
                //oRenderedGraphic.centerCartographic = centerCartographic;
            }
            else
            {
                //centerCartographic = Cesium.Rectangle.center(oRenderedGraphic.rectangle);
                //centerCartographic = oCoordLeftCLL.midpointTo(oCoordRightCLL);
                //var angle = oCoordCenterCLL.getAzimuth(oCoordAzimuthCLL);
                //angle =   angle.toRad() - Cesium.Math.PI_OVER_TWO;
                //var oCoordTopCLL = centerCartographic.destinationPoint(angle.toDeg(),dWidth/2 );
                //dWidth = height;// confusing but the height of a reactanglew is interpreseted as the width in the mil std spc.
                if (oCoordCenterCLL && oCoordLengthCLL && oCoordWidthCLL && oCoordAzimuthCLL)
                {
                    var cpCoodinates = [oCoordCenterCLL.toCartesian(), oCoordLengthCLL.toCartesian(), oCoordWidthCLL.toCartesian(), oCoordAzimuthCLL.toCartesian()];
                    markers.updateBillboardsPositions(cpCoodinates);
                }

            }
            for (var markerIndex = 0; markerIndex < markers._orderedBillboards.length; ++markerIndex)
            {
                markers._orderedBillboards[markerIndex].eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(_self.empCesium.viewer.camera.positionCartographic.height, _self.lastCameraHeight);
            }
            _self.lastCameraHeight = _self.empCesium.viewer.camera.positionCartographic.height;
            markers.setOnTop();
            _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        }
        ;
        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        mouseHandler.setInputAction(function (movement)
        {
            if (Cesium.defined(movement.position))
            {
                var pickedObject = scene.pick(movement.position);
                var isDrawingRectangleShapePicked = false;
                if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.primitive) && Cesium.defined(pickedObject.primitive.id) && (pickedObject.primitive.id === options.id))
                {
                    //primitive case
                    isDrawingRectangleShapePicked = true;
                }
                else if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.id.id) && typeof (pickedObject.id.id) === "string" && pickedObject.id.id === options.id)
                {
                    // entity case ?
                    isDrawingRectangleShapePicked = true;
                }
                if (isDrawingRectangleShapePicked)
                {
                    //markers.getBillboard(0).
                    dragging = this.empCesium.editorFeatureDraggingEnable;
                    beforeDraggingCartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                    scene.screenSpaceCameraController.enableRotate = false;
                    scene.screenSpaceCameraController.enableTranslate = false;
                    scene.screenSpaceCameraController.enableZoom = true;
                    scene.screenSpaceCameraController.enableTilt = true;
                    scene.screenSpaceCameraController.enableLook = true;
                    //scene.screenSpaceCameraController.inertiaSpin =  0;
                    // scene.screenSpaceCameraController.inertiaTranslate =  0;
                    //markers.getBillboard(0).enableRotation(false);
                    //  tooltip.setVisible(false);
                }
//                else
//                {
//                    dragging = false;
//                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOWN);
        // Now wait for start
        mouseHandler.setInputAction(function (movement)
        {
            if (Cesium.defined(movement.position))
            {
                var oMousePos = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                var pickedObject = scene.pick(movement.position);
                if (pickedObject && (pickedObject.primitive instanceof Cesium.Billboard))
                {
                    // If the Dblclick happened over a Billboard or the collection ignore it.
                    return;
                }

                if (oMousePos)
                {
                    oMousePos = oMousePos.clone();
                    if (!Cesium.defined(oRenderedGraphic))
                    {
                        // create the rectangle
                        var currentExtent = this.empCesium.getExtent();
                        var centerCartographic = Cesium.Rectangle.center(currentExtent);
                        dLength = currentExtent.height; //radians
                        oCoordCenterCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oMousePos);
                        dLength = Cesium.Math.toDegrees(dLength); //degrees
                        dLength = dLength * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(oCoordCenterCLL.latitude)); // meters
                        dLength = Math.round(dLength / 4.0);
                        dWidth = dLength / 2;
                        oCoordAzimuthCLL = oCoordCenterCLL.destinationPoint(90, dLength / 2);
                        oCoordLengthCLL = oCoordCenterCLL.destinationPoint(-90, dLength / 2);
                        oCoordWidthCLL = oCoordCenterCLL.destinationPoint(0, dWidth / 2);

                        if (!Cesium.defined(oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH]) ||
                                (Cesium.defined(oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH]) && Array.isArray(oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH]) &&
                                        oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH].length !== 1))
                        {
                            dAzimuth = oCoordCenterCLL.bearingTo(oCoordAzimuthCLL);
                            oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = [dAzimuth];
                        }
                        else
                        {
                            dAzimuth = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH][0];
                            if (oModifiers.SYMSTD === cesiumEngine.utils.RendererSettings.Symbology_2525Bch2_USAS_13_14)
                            {
                                dAzimuth = dAzimuth.toDegFromMils() + 90; // editor uses degrees not mils
                            }
                            else
                            {
                                dAzimuth = dAzimuth + 90;
                            }
                        }

                        if (!Cesium.defined(oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE]) ||
                                (Cesium.defined(oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE]) && Array.isArray(oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE]) &&
                                        oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE].length !== 2))
                        {
                            oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dWidth, dLength];
                        }
                        else
                        {
                            if (oDrawItem.symbolCode === "PBS_ELLIPSE----")
                            {
                                dLength = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][1] * 2;
                                dWidth = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][0] * 2;
                            }
                            else
                            {
                                dLength = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][0];
                                dWidth = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][1];
                            }
                            oCoordAzimuthCLL = oCoordCenterCLL.destinationPoint(dAzimuth, dLength / 2);
                            oCoordLengthCLL = oCoordCenterCLL.destinationPoint(180 + dAzimuth, dLength / 2);
                            oCoordWidthCLL = oCoordCenterCLL.destinationPoint(dAzimuth - 90, dWidth / 2);
                        }

                        renderGraphic();
                        updateMarkers();
                        // tooltip.setVisible(false);

                        options.callbacks.onDrawStart({
                            positions: [oCoordCenterCLL],
                            properties: oProperties,
                            indices: [0]
                        });
                    }
                    if (typeof options.callbacks.onDrawUpdate === 'function')
                    {
                        //options.callbacks.dragHandlers.drawUpdate({positions: [extent.centerCartesian], width: extent.widthMeters, height: extent.heightMeters, azimuth: extent.rotation});
                        //options.callbacks.onDrawUpdate({positions: [extent.centerCartesian], width: extent.widthMeters, height: extent.heightMeters, azimuth: extent.rotation});
                        options.callbacks.onDrawUpdate({positions: [oCoordCenterCLL], properties: oProperties, indices: []});
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.endPosition;
            if (Cesium.defined(position))
            {
                if (!Cesium.defined(oRenderedGraphic))
                {
                    // tooltip.setVisible(false);
                    // tooltip.showAt(position, "<p>Click to start drawing rectangle</p>");
                }
                else
                {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian && dragging)
                    {
                    }
                    else if (cartesian && !dragging)
                    {
                        // tooltip.setVisible(false);
                        // tooltip.showAt(position, "<p>Drag control points to change rectangle extent</p><p>Click again to finish drawing</p>");
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.position;
            if (Cesium.defined(position))
            {
                if (!oRenderedGraphic)
                {
                    return;
                }
                else
                {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian)
                    {
                        _self.stopDrawing();
                        if (typeof options.callbacks.onDrawEnd === 'function')
                        {
                            options.callbacks.onDrawEnd({positions: [oCoordCenterCLL], properties: oProperties, indices: []});
                        }
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        mouseHandler.setInputAction(function (movement)
        {
            if (dragging)
            {
                var delayUnlockingMapTimeOut = setTimeout(function ()
                {
                    scene.screenSpaceCameraController.enableRotate = true;
                    //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                    // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                    scene.screenSpaceCameraController.enableTranslate = true;
                    scene.screenSpaceCameraController.enableZoom = true;
                    scene.screenSpaceCameraController.enableTilt = true;
                    scene.screenSpaceCameraController.enableLook = true;
                }.bind(this), 70);
            }
            dragging = false;
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_UP);

        if (this.empCesium.defined(options.item.originFeature))
                //if (options.item.hasOwnProperty('originFeature'))
                        // if (options.item.hasOwnProperty('originFeature') && (options.item.originFeature instanceof emp.typeLibrary.Feature))
                        {
                            // editing existing
                            oDrawItem.symbolCode = oDrawItem.originFeature.data.symbolCode;
                            var cartographics = cesiumEngine.utils.convertGeoJsonCoordToCartographicList(oDrawItem.originFeature.data);
                            oCoordCenterCLL = cartographics[0];
                            //oCoordCenterCLL = new Cesium.Cartographic(oDrawItem.originFeature.data.coordinates[0].toRad(), oDrawItem.originFeature.data.coordinates[1].toRad(), 0);
                            oProperties = emp.helpers.copyObject(oDrawItem.originFeature.properties);
                            oModifiers = oProperties.modifiers || {};
                            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                            oProperties.modifiers = oModifiers;
                            if (oDrawItem.symbolCode === "PBS_ELLIPSE----")
                            {
                                dLength = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][1] * 2;
                                dWidth = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][0] * 2;
                            }
                             else  if (oDrawItem.symbolCode === "PBS_CIRCLE-----")
                            {
                                dLength = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][0] * 2;
                                dWidth = dLength;
                            }
                            else
                            {
                                dLength = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][0];
                                dWidth = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][1];
                            }
                            dAzimuth = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH][0];
                            if (oModifiers.SYMSTD === cesiumEngine.utils.RendererSettings.Symbology_2525Bch2_USAS_13_14)
                            {
                                dAzimuth = dAzimuth.toDegFromMils() + 90; // editor uses degrees not mils
                            }
                            else
                            {
                                dAzimuth = dAzimuth + 90;
                            }
                            if (oDrawItem.symbolCode === "PBS_CIRCLE-----")
                            {
                                dAzimuth = 0;
                            }
                            
                            oCoordAzimuthCLL = oCoordCenterCLL.destinationPoint(dAzimuth, dLength / 2);
                            oCoordLengthCLL = oCoordCenterCLL.destinationPoint(180 + dAzimuth, dLength / 2);
                            oCoordWidthCLL = oCoordCenterCLL.destinationPoint(dAzimuth - 90, dWidth / 2);
                            renderGraphic();
                            updateMarkers();
                            options.callbacks.onDrawStart({positions: [oCoordCenterCLL], properties: oProperties, indices: [0]});
                            //options.callbacks.onDrawUpdate({positions: [oCoordCenterCLL], properties: oProperties, indices: [0]});
                        }
                else if (this.empCesium.drawData.coordinates && this.empCesium.drawData.coordinates.length === 1)
                {
                    // new draw with coordinate  included.
                    oProperties = emp.helpers.copyObject(oDrawItem.properties);
                    oModifiers = oProperties.modifiers || {};
                    oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                    oProperties.modifiers = oModifiers;
                    var currentExtent = this.empCesium.getExtent();
                    var centerCartographic = Cesium.Rectangle.center(currentExtent);
                    dLength = currentExtent.height; //radians
                    oCoordCenterCLL = this.empCesium.drawData.coordinates[0];
                    dLength = Cesium.Math.toDegrees(dLength); //degrees
                    dLength = dLength * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(oCoordCenterCLL.latitude)); // meters
                    dLength = Math.round(dLength / 4.0);
                    dWidth = dLength / 2;
                    oCoordAzimuthCLL = oCoordCenterCLL.destinationPoint(90, dLength / 2);
                    oCoordLengthCLL = oCoordCenterCLL.destinationPoint(-90, dLength / 2);
                    oCoordWidthCLL = oCoordCenterCLL.destinationPoint(0, dWidth / 2);
                    if (!Cesium.defined(oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH]) ||
                            (Cesium.defined(oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH]) && Array.isArray(oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH]) &&
                                    oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH].length !== 1))
                    {
                        dAzimuth = oCoordCenterCLL.bearingTo(oCoordAzimuthCLL);
                        oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = [dAzimuth];
                    }
                    else
                    {
                        dAzimuth = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH][0];
                        if (oModifiers.SYMSTD === cesiumEngine.utils.RendererSettings.Symbology_2525Bch2_USAS_13_14)
                        {
                            dAzimuth = dAzimuth.toDegFromMils() + 90; // editor uses degrees not mils
                        }
                        else
                        {
                            dAzimuth = dAzimuth + 90;
                        }
                        oCoordAzimuthCLL = oCoordCenterCLL.destinationPoint(dAzimuth, dLength / 2);
                    }

                    if (!Cesium.defined(oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE]) ||
                            (Cesium.defined(oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE]) && Array.isArray(oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE]) &&
                                    oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE].length !== 2))
                    {
                        oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dWidth, dLength];
                    }
                    else
                    {
                        if (oDrawItem.symbolCode === "PBS_ELLIPSE----")
                        {
                            dLength = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][1] * 2;
                            dWidth = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][0] * 2;
                        }
                        else
                        {
                            dLength = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][0];
                            dWidth = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE][1];
                        }
                        oCoordLengthCLL = oCoordCenterCLL.destinationPoint(180 + dAzimuth, dLength / 2);
                        oCoordWidthCLL = oCoordCenterCLL.destinationPoint(dAzimuth - 90, dWidth / 2);
                    }

                    //oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dWidth, dLength];
                    //dAzimuth = oCoordCenterCLL.bearingTo(oCoordAzimuthCLL);
                    //oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = [dAzimuth];
                    renderGraphic();
                    updateMarkers();
                    // tooltip.setVisible(false);
                    options.callbacks.onDrawStart({
                        positions: [oCoordCenterCLL],
                        properties: oProperties,
                        indices: []
                    });
//            options.callbacks.onDrawUpdate({
//                positions: [oCoordCenterCLL],
//                properties: oProperties,
//                indices: []
//            });
                }
                else
                {
                    oProperties = emp.helpers.copyObject(oDrawItem.properties);
                    oModifiers = oProperties.modifiers || {};
                    oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
                    oProperties.modifiers = oModifiers;
                }




                this.muteHandlers(false);
            };
    function getExtentCorners(value)
    {
        return ellipsoid.cartographicArrayToCartesianArray([Cesium.Rectangle.northwest(value), Cesium.Rectangle.northeast(value), Cesium.Rectangle.southeast(value), Cesium.Rectangle.southwest(value)]);
    }

    _.prototype.startDrawingExtent = function (options)
    {

        var options = copyOptions(options, defaultSurfaceOptions);
        this.startDrawing(
                function ()
                {
                    if (Cesium.defined(extent))
                    {
                        primitives.remove(extent);
                    }
                    if (markers)
                    {
                        markers.remove();
                    }
                    mouseHandler.destroy();
                    // tooltip.setVisible(false);
                }
        );
        var _self = this;
        var scene = this._scene;
        var primitives = this._scene.primitives;
        var tooltip = this._tooltip;
        var firstPoint;
        var extent;
        var markers;
        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        function updateExtent(value)
        {
            if (!Cesium.defined(extent))
            {
                extent = new Cesium.RectanglePrimitive();
                extent.asynchronous = false;
                primitives.add(extent);
            }
            extent.rectangle = value;
            // update the markers
            var corners = getExtentCorners(value);
            // create if they do not yet exist
            if (!Cesium.defined(markers))
            {
                markers = new _.BillboardGroup(_self, defaultBillboard);
                markers.addBillboards(corners);
            }
            else
            {
                markers.updateBillboardsPositions(corners);
            }
        }

        // Now wait for start
        mouseHandler.setInputAction(function (movement)
        {
            if (Cesium.defined(movement.position))
            {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian)
                {
                    if (!Cesium.defined(extent))
                    {
                        // create the rectangle
                        firstPoint = ellipsoid.cartesianToCartographic(cartesian);
                        var value = getExtent(firstPoint, firstPoint);
                        updateExtent(value);
                    }
                    else
                    {
                        _self.stopDrawing();
                        if (typeof options.callback === 'function')
                        {
                            options.callback(getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian)));
                        }
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOWN);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.endPosition;
            if (Cesium.defined(position))
            {
                if (!Cesium.defined(extent))
                {
                    //tooltip.showAt(position, "<p>Click to start drawing rectangle</p>");
                }
                else
                {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian)
                    {
                        var value = getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian));
                        updateExtent(value);
                        //tooltip.showAt(position, "<p>Drag to change rectangle extent</p><p>Click again to finish drawing</p>");
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };

    _.prototype.startDrawingCircle = function (options)
    {

        var options = copyOptions(options, defaultSurfaceOptions);
        this.startDrawing(
                function cleanUp()
                {
                    if (Cesium.defined(circle))
                    {
                        primitives.remove(circle);
                    }
                    if (markers)
                    {
                        markers.remove();
                    }
                    mouseHandler.destroy();
                    // tooltip.setVisible(false);
                }
        );
        var _self = this;
        var scene = this._scene;
        var primitives = this._scene.primitives;
        var tooltip = this._tooltip;
        var circle;
        var markers;
        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        // Now wait for start
        mouseHandler.setInputAction(function (movement)
        {
            if (Cesium.defined(movement.position))
            {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian)
                {
                    if (!Cesium.defined(circle))
                    {
                        // create the circle
                        circle = new _.CirclePrimitive({
                            center: cartesian,
                            radius: 0,
                            asynchronous: false,
                            material: options.material
                        });
                        primitives.add(circle);
                        markers = new _.BillboardGroup(_self, defaultBillboard);
                        markers.addBillboards([cartesian]);
                    }
                    else
                    {
                        if (typeof options.callback === 'function')
                        {
                            options.callback(circle.getCenter(), circle.getRadius());
                        }
                        _self.stopDrawing();
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOWN);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.endPosition;
            if (Cesium.defined(position))
            {
                if (!Cesium.defined(circle))
                {
                    // tooltip.showAt(position, "<p>Click to start drawing the circle</p>");
                }
                else
                {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian)
                    {
                        circle.setRadius(Cesium.Cartesian3.distance(circle.getCenter(), cartesian));
                        markers.updateBillboardsPositions(cartesian);
                        // tooltip.showAt(position, "<p>Move mouse to change circle radius</p><p>Click again to finish drawing</p>");
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };

    _.prototype.enhancePrimitives = function ()
    {

        var drawHelper = this;
        var hasFirstAndLastVerticeEqual = false;
        var oRectangle;
        var oModifiers;
        var oRenderedGraphic;
        var oDrawItem = this.empCesium.drawData;
        var oProperties = oDrawItem.properties || {};
        var isMilStd = false;
        if (oProperties.modifiers)
        {
            isMilStd = true;
            oModifiers = oProperties.modifiers || {};
            var viewDistanceMeters = this.empCesium.leftToRightViewDistanceMeters();
            // Check if the symbol has the required modifiers.
            var checkResult = cesiumEngine.utils.checkForRequiredModifiers(oDrawItem.item, viewDistanceMeters);
            // If some modifiers are missing as reported by the checkForRequiredModifiers,
            // override the current modifiers so they render with the missing parameters.
            // this will have the effect of making items grow or shrink as you zoom in
            // and out.  This was intentionally requested by developer of content management
            // widget.
            for (override in checkResult)
            {
                oModifiers[override] = checkResult[override];
            }
            oProperties.modifiers = emp.helpers.copyObject(oModifiers);
            //oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
            oModifiers = emp.typeLibrary.utils.milstd.convertModifierStringTo2525(oModifiers, this.empCesium.showLabels);
        }
        Cesium.Billboard.prototype.setEditable = function ()
        {

            if (this._editable)
            {
                return;
            }

            this._editable = true;
            var billboard = this;
            var _self = this;
            var screenSpaceCameraController = drawHelper._scene.screenSpaceCameraController;
            function enableRotation(enable)
            {
//                drawHelper._scene.screenSpaceCameraController.enableRotate = enable;
//	               scene.screenSpaceCameraController.enableTranslate = enable;
//	               scene.screenSpaceCameraController.enableZoom =true;
//	               scene.screenSpaceCameraController.enableTilt = true;
//           scene.screenSpaceCameraController.enableLook = true;
                //drawHelper._scene.screenSpaceCameraController.inertiaSpin =   enable? 0.9:0;
                // drawHelper._scene.screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;

                if (enable)
                {
                    this.delayUnlockingMapTimeOut = setTimeout(function ()
                    {
                        screenSpaceCameraController.enableRotate = true;
                        //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                        // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                        screenSpaceCameraController.enableTranslate = true;
                        screenSpaceCameraController.enableZoom = true;
                        screenSpaceCameraController.enableTilt = true;
                        screenSpaceCameraController.enableLook = true;
                    }.bind(this), 70);
                }
                else
                {
                    screenSpaceCameraController.enableRotate = enable;
                    //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                    // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                    screenSpaceCameraController.enableTranslate = enable;
                    screenSpaceCameraController.enableZoom = true;
                    screenSpaceCameraController.enableTilt = true;
                    screenSpaceCameraController.enableLook = true;
                }
            }

            setListener(billboard, 'leftDown', function (position)
            {
                // TODO - start the drag handlers here
                // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                function onDrag(position)
                {
                    billboard.position = position;
                    _self.executeListeners({name: 'drag', positions: position});
                }
                function onDragEnd(position)
                {
                    handler.destroy();
                    enableRotation(true);
                    _self.executeListeners({name: 'dragEnd', positions: position});
                }

                var handler = new Cesium.ScreenSpaceEventHandler(drawHelper._scene.canvas);
                handler.setInputAction(function (movement)
                {
                    var cartesian = drawHelper._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                    if (cartesian)
                    {
                        onDrag(cartesian);
                    }
                    else
                    {
                        onDragEnd(cartesian);
                    }
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                handler.setInputAction(function (movement)
                {
                    onDragEnd(drawHelper._scene.camera.pickEllipsoid(movement.position, ellipsoid));
                }, Cesium.ScreenSpaceEventType.LEFT_UP);
                enableRotation(false);
            });
            enhanceWithListeners(billboard);
        };

        function setHighlighted(highlighted)
        {

            var scene = drawHelper._scene;
            // if no change
            // if already highlighted, the outline polygon will be available
            if (this._highlighted && this._highlighted === highlighted)
            {
                return;
            }
            // disable if already in edit mode
            if (this._editMode === true)
            {
                return;
            }
            this._highlighted = highlighted;
            // highlight by creating an outline polygon matching the polygon points
            if (highlighted)
            {
                // make sure all other shapes are not highlighted
                drawHelper.setHighlighted(this);
                this._strokeColor = this.strokeColor;
                this.setStrokeStyle(Cesium.Color.fromCssColorString('white'), this.strokeWidth);
            }
            else
            {
                if (this._strokeColor)
                {
                    this.setStrokeStyle(this._strokeColor, this.strokeWidth);
                }
                else
                {
                    this.setStrokeStyle(undefined, undefined);
                }
            }
        }


        var renderMilStdGraphic = function ()
        {
            if (!Cesium.defined(this._editedSurface) || !isMilStd)
            {
                //issue: the map stop moving listener is calling this function when drawing a marker.
                // capture condition when drawing or edting a billboard (marker)  where the this._editedSurface is always undefined. this._editedSurface is
                // set for polyshapes. this section of code (_.prototype.enhancePrimitives )  is comon to marker, and polyshape graphics but only polyshape graphics for mil statndard multipoints
                // need to call the renderMilStdGraphic function
                return;
            }
            //setTimeout($.proxy(function ()
            //{
            var oRenderModifiers = emp.helpers.copyObject(oModifiers);
            var oExtent = this.empCesium.getExtent();
            var sExtents = oExtent.west.toDeg() + "," + oExtent.south.toDeg() + "," + oExtent.east.toDeg() + "," + oExtent.north.toDeg();
            var sCoordinates = cesiumEngine.utils.convertCartographicsToSECRendererCoordsString(Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(this._editedSurface.positions));
            //var centerCartographic = oCoordVerticalOneCLL.midpointTo(oCoordverticalTwoCLL);
            //var azimuth = centerCartographic.getAzimuth(oCoordVerticalOneCLL);
            var oMaterial;
            var oRenderData;
            var cartographics = Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(this._editedSurface.positions);
            //azimuth = azimuth.toRad();

            //azimuth = Cesium.Math.PI_OVER_TWO - azimuth;

            //oRenderModifiers[emp.typeLibrary.utils.milstd.StringModifiers.LINE_COLOR] = EmpCesiumConstants.selectionProperties.COLOR_HEX;
            //oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [dWidth]; // asigne back to oModifiers@@
            //oRenderModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = [azimuth.toDeg()]; // asigne back to oModifiers@@

            //oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, "clampToGround", this.empCesium.getScale(), sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS_LABEL_ONLY, this.empCesium.drawData.standard);
            oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol2D(oDrawItem.id, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, this.empCesium.canvas.width, this.empCesium.canvas.height, sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS_LABEL_ONLY, this.empCesium.drawData.standard);
            if (oRenderData && (typeof (oRenderData) === 'string'))
            {
                new emp.typeLibrary.Error({
                    level: emp.typeLibrary.Error.level.CATASTROPHIC,
                    message: "RenderSymbol2D return: " + oRenderData
                });
                return;
            }
            oMaterial = new this.empCesium.ImageMaterialProperty();
            oMaterial.image = oRenderData.image;
            oMaterial.transparent = true;
            if (!Cesium.defined(oRenderData.west) || !Cesium.defined(oRenderData.south) || !Cesium.defined(oRenderData.east) || !Cesium.defined(oRenderData.north))
            {
                oRectangle = Cesium.Rectangle.fromCartographicArray(cartographics);
            }
            else
            {
                oRectangle = Cesium.Rectangle.fromDegrees(oRenderData.west.x, oRenderData.south.y, oRenderData.east.x, oRenderData.north.y);
            }

            if (oRenderedGraphic)
            {
                oRenderedGraphic.rectangle.material.image = oRenderData.image;
                this.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
            }
            else
            {
                oRenderedGraphic = new this.empCesium.Entity({
                    id: oDrawItem.drawFeatureId,
                    selectable: true,
                    show: true,
                    rectangle: {
                        coordinates: getLatestRectangleCallbackProperty,
                        material: oMaterial
                    }
                });
                oRenderedGraphic.featureId = oDrawItem.drawFeatureId;
                oRenderedGraphic.coreId = oDrawItem.coreId;
                oRenderedGraphic.overlayId = oDrawItem.overlayId;
                oRenderedGraphic.symbolCode = oDrawItem.symbolCode;
                oRenderedGraphic._editMode = true;
                oRenderedGraphic.featureType = EmpCesiumConstants.featureType.ENTITY;
                oRenderedGraphic = this.empCesium.viewer.entities.add(oRenderedGraphic);
            }
            this.muteHandlers(false);
        }.bind(this);
        
        this.empCesium.currentMultiPointEditorRenderGraphicFuction = renderMilStdGraphic;


        var getLatestRectangleCallbackProperty = new Cesium.CallbackProperty(function getRectangle(time, result)
        {
            return Cesium.Rectangle.clone(oRectangle, result);
        }, false);

        function setEditMode(editMode)
        {
            // if no change
            if (this._editMode === editMode)
            {
                return;
            }
            // make sure all other shapes are not in edit mode before starting the editing of this shape
            drawHelper.disableAllHighlights();
            // display markers
            if (editMode)
            {
                drawHelper.setEdited(this);
                var scene = drawHelper._scene;
                var _self = this;
                // create the markers and handlers for the editing
                if (!Cesium.defined(this._markers))
                {
                    var markers = new _.BillboardGroup(drawHelper, dragBillboard);
                    var editMarkers = new _.BillboardGroup(drawHelper, dragHalfBillboard);
                    // function for updating the edit markers around a certain point
                    function updateHalfMarkers(data)
                    {
                        // update the half markers before and after the index
                        var editIndex = data.index - 1 < 0 ? data.positions.length - 1 : data.index - 1;
                        if (editIndex < editMarkers.countBillboards())
                        {
                            editMarkers.getBillboard(editIndex).position = calculateHalfMarkerPosition(editIndex);
                        }
                        editIndex = data.index;
                        if (editIndex < editMarkers.countBillboards())
                        {
                            editMarkers.getBillboard(editIndex).position = calculateHalfMarkerPosition(editIndex);
                        }
                    }
                    function onEditStart()
                    {
                        if (hasFirstAndLastVerticeEqual)
                        {
                            var clonedPositions = [];
                            //clone array and then append  first  position into last position in cloned array
                            for (var indexCartesian = 0; indexCartesian < _self.positions.length; indexCartesian++)
                            {
                                clonedPositions.push(_self.positions[indexCartesian].clone());
                            }
                            if (_self.positions.length > 0)
                            {
                                clonedPositions.push(_self.positions[0].clone());
                            }
                            _self.executeListeners({name: 'onEditStart', positions: Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(clonedPositions)});

                        }
                        else
                        {
                            _self.executeListeners({name: 'onEditStart', positions: Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(_self.positions)});
                            //_self.executeListeners({name: 'onEdited', positions: Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(_self.positions)});

                        }
                    }
                    function onEdited(data)
                    {
                        if (isMilStd)
                        {
                            renderMilStdGraphic();
                        }
                        if (hasFirstAndLastVerticeEqual)
                        {
                            var clonedPositions = [];
                            //clone array and then append  first  position into last position in cloned array
                            for (var indexCartesian = 0; indexCartesian < _self.positions.length; indexCartesian++)
                            {
                                clonedPositions.push(_self.positions[indexCartesian].clone());
                            }
                            if (_self.positions.length > 0)
                            {
                                clonedPositions.push(_self.positions[0].clone());
                            }
                            _self.executeListeners({name: 'onEdited', positions: Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(clonedPositions), indices: data.indices});
                        }
                        else
                        {
                            _self.executeListeners({name: 'onEdited', positions: Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(_self.positions), indices: data.indices});
                        }

                    }
                    //acevedo -  access onEditEnd calback to notify the engine the editor is ending.
                    function onEditEnd()
                    {
                        if (hasFirstAndLastVerticeEqual)
                        {
                            var clonedPositions = [];
                            //clone array and then append  first  position into last position in cloned array
                            for (var indexCartesian = 0; indexCartesian < _self.positions.length; indexCartesian++)
                            {
                                clonedPositions.push(_self.positions[indexCartesian].clone());
                            }
                            if (_self.positions.length > 0)
                            {
                                clonedPositions.push(_self.positions[0].clone());
                            }
                            _self.executeListeners({name: 'onEditEnd', positions: Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(clonedPositions)});
                        }
                        else
                        {
                            _self.executeListeners({name: 'onEditEnd', positions: Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(_self.positions)});
                        }
                    }
                    var handleMarkerChanges = {
                        dragHandlers: {
                            onDrag: function (data)
                            {
                                _self.positions[data.index] = Cesium.Ellipsoid.WGS84.cartographicToCartesian(data.position);
                                //_self.positions[index] = position;
                                updateHalfMarkers({positions: _self.positions, index: data.index});
                                _self._createPrimitive = true;
                                onEdited({positions: _self.positions, indices: [data.index]});
                            },
                            onDragEnd: function (data)
                            {
                                _self._createPrimitive = true;
                                onEdited({positions: _self.positions, indices: [data.index]});
                            }
                        },
                        onDoubleClick: function (index)
                        {
                            if (_self.positions.length < 4 && _self.isPolygon)
                            {
                                // do not allow the removal of a vertex for a polygon when the vertex count is less than 4
                                return;
                            }
                            else if (_self.positions.length < 3 && !_self.isPolygon)
                            {
                                // do not allow the removal of a vertex for a polyline when the vertex count is less than 3
                                return;
                            }
                            // remove the point and the corresponding markers
                            var isLastPosition = ((_self.positions.length - 1) === index) ? true : false;
                            _self.positions.splice(index, 1);
                            _self._createPrimitive = true;
                            markers.removeBillboard(index);
                            if (!_self.isPolygon && isLastPosition)
                            {
                                //it is a line and removing the last position and its correponding edit marker.
                                editMarkers.removeBillboard(index - 1);
                                _self.isRemovingPosition = true;
                                // no need to update half marker because it was remove.
                            }
                            else
                            {
                                editMarkers.removeBillboard(index);
                                updateHalfMarkers({positions: _self.positions, index: index});
                                _self.isRemovingPosition = true;
                            }

                            onEdited({positions: _self.positions, indices: [index]});
                        },
                        tooltip: function ()
                        {
                            if (_self.positions.length > 3)
                            {
                                return "Double click to remove this point";
                            }
                        }
                    };

                    //verify if first coordinate is the same as the last coordinate. If the same remove the last one and keep the first.
                    if (_self.positions.length > 3)
                    {
                        if ((Cesium.Math.equalsEpsilon(_self.positions[0].x, _self.positions[_self.positions.length - 1].x, Cesium.Math.EPSILON7))
                                && (Cesium.Math.equalsEpsilon(_self.positions[0].y, _self.positions[_self.positions.length - 1].y, Cesium.Math.EPSILON7))
                                && (Cesium.Math.equalsEpsilon(_self.positions[0].z, _self.positions[_self.positions.length - 1].z, Cesium.Math.EPSILON7)))
                        {
                            _self.positions.pop();
                            hasFirstAndLastVerticeEqual = true;
                        }
                    }
                    // add billboards and keep an ordered list of them for the polygon edges
                    markers.addBillboards(_self.positions, handleMarkerChanges);
                    this._markers = markers;
                    function calculateHalfMarkerPosition(index)
                    {
                        var positions = _self.positions;
                        return ellipsoid.cartographicToCartesian(
                                new Cesium.EllipsoidGeodesic(ellipsoid.cartesianToCartographic(positions[index]),
                                        ellipsoid.cartesianToCartographic(positions[index < positions.length - 1 ? index + 1 : 0])).
                                interpolateUsingFraction(0.5)
                                );
                    }

//                    function calculateMarkerPosition(index) {
//                        var positions = _self.positions;
//                        return ellipsoid.cartographicToCartesian(
//                                new Cesium.EllipsoidGeodesic(ellipsoid.cartesianToCartographic(positions[index]),
//                                        ellipsoid.cartesianToCartographic(new Cesium.Cartesian3(positions[index].x + .00001,positions[index].y + .00001,positions[index].z + .00001))).
//                                interpolateUsingFraction(0.5)
//                                );
//                    }

                    function calculateMarkerPosition(index)
                    {
                        var positions = _self.positions;
                        return ellipsoid.cartographicToCartesian(
                                new Cesium.EllipsoidGeodesic(ellipsoid.cartesianToCartographic(positions[index]),
                                        ellipsoid.cartesianToCartographic(positions[index])).
                                interpolateUsingFraction(0.5)
                                );
                    }

                    var halfPositions = [];
                    var index = 0;
                    var length = _self.positions.length + (this.isPolygon ? 0 : -1);
                    for (; index < length; index++)
                    {
                        halfPositions.push(calculateHalfMarkerPosition(index));
                    }
                    var handleEditMarkerChanges = {
                        dragHandlers: {
                            onDragStart: function (data)
                            {
                                // add a new position to the polygon but not a new marker yet
                                this.index = data.index + 1;
                                _self.positions.splice(this.index, 0, Cesium.Ellipsoid.WGS84.cartographicToCartesian(data.position));
                                _self._createPrimitive = true;
                            },
                            onDrag: function (data)
                            {
                                _self.positions[this.index] = Cesium.Ellipsoid.WGS84.cartographicToCartesian(data.position);
                                _self._createPrimitive = true;
                                if (isMilStd)
                                {
                                    renderMilStdGraphic();
                                }
                            },
                            onDragEnd: function (data)
                            {
                                // create new sets of makers for editing
                                markers.insertBillboard(this.index, Cesium.Ellipsoid.WGS84.cartographicToCartesian(data.position), handleMarkerChanges, "vertex");
                                editMarkers.getBillboard(this.index - 1).position = calculateHalfMarkerPosition(this.index - 1);
                                editMarkers.insertBillboard(this.index, calculateHalfMarkerPosition(this.index), handleEditMarkerChanges, "vertex");
                                _self._createPrimitive = true;
                                onEdited({positions: _self.positions, indices: [this.index]});
                            }
                        },
                        tooltip: function ()
                        {
                            return "Drag to create a new point";
                        }
                    };
                    editMarkers.addBillboards(halfPositions, handleEditMarkerChanges);
                    this._editMarkers = editMarkers;
                    this._dragging = false;
                    this._beforeDraggingCartesian = undefined;
                    // add a handler for clicking in the globe
                    this._globeClickhandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
//                        this._globeClickhandler.setInputAction(
//                            function (movement) {
//                                var pickedObject = scene.pick(movement.position);
//                                if(!(pickedObject && pickedObject.primitive)) {
//                                    _self.setEditMode(false);
//                                }
//                            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    //acevedo - use double click to stop editing
                    this._globeClickhandler.setInputAction(
                            function (movement)
                            {
                                //var pickedObject = scene.pick(movement.position);
                                //if (Cesium.defined(pickedObject) && (pickedObject.primitive === _self) && !(_self.isDestroyed()))
                                //{
                                if (!_self.isRemovingPosition)
                                {
                                    onEditEnd();
                                }
                                else
                                {
                                    _self.isRemovingPosition = false;
                                }
                                // _self.setEditMode(false); the listener in the editor controller is already calling setEditMode(false).
                                //}
                            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                    this._globeClickhandler.setInputAction(function (movement)
                    {
                        if (Cesium.defined(movement.position))
                        {
                            var pickedObject = scene.pick(movement.position);
                            var isDrawingPolyShapePicked = false;
                            if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.primitive) && pickedObject.primitive.id === "drawing_polyshape_id")
                            {
                                //primitive case
                                isDrawingPolyShapePicked = true;
                            }
                            else if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.id.id) && typeof (pickedObject.id.id) === "string" && pickedObject.id.id === "drawing_polyshape_id")
                            {
                                // entity case ?
                                isDrawingPolyShapePicked = true;
                            }
                            if (isDrawingPolyShapePicked)
                            {
                                //markers.getBillboard(0).
                                this._dragging = drawHelper.empCesium.editorFeatureDraggingEnable;
                                this._beforeDraggingCartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                                scene.screenSpaceCameraController.enableRotate = false;
                                scene.screenSpaceCameraController.enableTranslate = false;
                                scene.screenSpaceCameraController.enableZoom = true;
                                scene.screenSpaceCameraController.enableTilt = true;
                                scene.screenSpaceCameraController.enableLook = true;
                                //scene.screenSpaceCameraController.inertiaSpin = 0;
                                //scene.screenSpaceCameraController.inertiaTranslate =  0;
                                //markers.getBillboard(0).enableRotation(false);
                                //// tooltip.setVisible(true);
                            }
                        }
                    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
                    this._globeClickhandler.setInputAction(function (movement)
                    {
                        var position = movement.endPosition;
                        markers.setOnTop();
                        editMarkers.setOnTop();
                        if (Cesium.defined(position))
                        {
                            if (_self.positions.length === 0)
                            {
                                //// tooltip.showAt(position, "<p>Click to add first point</p>");
                            }
                            else
                            {
                                var newPosition = scene.camera.pickEllipsoid(position, ellipsoid);
                                if (newPosition && this._dragging)
                                {
//                                    var deltaX = this._beforeDraggingCartesian.x - newPosition.x;
//                                    var deltaY = this._beforeDraggingCartesian.y - newPosition.y;
//                                    var deltaZ = this._beforeDraggingCartesian.z - newPosition.z;
                                    var deltaCartesian = new Cesium.Cartesian3();
                                    deltaCartesian = Cesium.Cartesian3.subtract(this._beforeDraggingCartesian, newPosition, deltaCartesian);
                                    var deltaX = deltaCartesian.x;
                                    var deltaY = deltaCartesian.y;
                                    var deltaZ = deltaCartesian.z;
                                    for (var index = 0; index < _self.positions.length; index++)
                                    {
                                        var polyShapePosition = _self.positions[index];
                                        polyShapePosition.x -= deltaX;
                                        polyShapePosition.y -= deltaY;
                                        polyShapePosition.z -= deltaZ;
                                        if (index < markers.countBillboards())
                                        {
                                            markers.getBillboard(index).position = calculateMarkerPosition(index);
                                        }

                                    }
                                    _self.setAttribute("positions", _self.positions);
                                    //markers.updateBillboardsPositions( _self.positions);
                                    for (var index = 0; index < _self.positions.length; index++)
                                    {
                                        updateHalfMarkers({positions: _self.positions, index: index});
                                    }
                                    this._beforeDraggingCartesian = newPosition;
                                    var indices = cesiumEngine.utils.fillArrayWithNumbers(_self.positions.length);
                                    onEdited({positions: _self.positions, indices: indices});
                                    //options.callbacks.dragHandlers.onDrag(0, _self.positions);
                                    // tooltip.showAt(position, "<p>Position is: </p>" + getDisplayLatLngString(ellipsoid.cartesianToCartographic(cartesian)));
                                }
//                                else if (cartesian)
//                                {
//                                    positions.pop();
//                                    // make sure it is slightly different
//                                    cartesian.y += (1 + Math.random());
//                                    positions.push(cartesian);
//                                    if (positions.length >= minPoints) {
//                                        poly.positions = positions;
//                                        poly._createPrimitive = true;
//                                    }
//                                    // update marker
//                                    markers.getBillboard(positions.length - 1).position = cartesian;
//                                    options.callbacks.onDrawUpdate(poly.positions);
//                                    // show tooltip
//                                    tooltip.showAt(position, "<p>Click to add new point (" + positions.length + ")</p>" + (positions.length > minPoints ? "<p>Double click to finish drawing</p>" : ""));
//                                }
                            }
                        }
                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    this._globeClickhandler.setInputAction(function (movement)
                    {
                        if (this._dragging)
                        {
                            var delayUnlockingMapTimeOut = setTimeout(function ()
                            {
                                scene.screenSpaceCameraController.enableRotate = true;
                                //screenSpaceCameraController.inertiaSpin = enable? 0.9:0;
                                // screenSpaceCameraController.inertiaTranslate =  enable? 0.9:0;
                                scene.screenSpaceCameraController.enableTranslate = true;
                                scene.screenSpaceCameraController.enableZoom = true;
                                scene.screenSpaceCameraController.enableTilt = true;
                                scene.screenSpaceCameraController.enableLook = true;
                            }.bind(this), 70);
                            //// tooltip.setVisible(true);
                            //options.callbacks.dragHandlers.onDragEnd(0, cartesian);
                        }
                        this._dragging = false;
                    }, Cesium.ScreenSpaceEventType.LEFT_UP);
                    // set on top of the polygon
                    markers.setOnTop();
                    editMarkers.setOnTop();
                }
                this._editMode = true;
                if (isMilStd)
                {
                    renderMilStdGraphic();
                    _self.show = true;
                }
                onEditStart();
            }
            else
            {
                if (Cesium.defined(this._markers))
                {
                    this._markers.remove();
                    this._editMarkers.remove();
                    this._markers = undefined;
                    this._editMarkers = undefined;
                    this._globeClickhandler.destroy();
                }
                if (oRenderedGraphic)
                {
                    drawHelper.empCesium.viewer.entities.remove(oRenderedGraphic);
                    if (oRenderedGraphic.rectangle)
                    {
                        if (oRenderedGraphic.rectangle.material)
                        {
                            oRenderedGraphic.rectangle.material.image = undefined;
                        }
                        oRenderedGraphic.rectangle = undefined;
                    }
                    oRenderedGraphic = undefined;
                }
                this._editMode = false;
            }

        }

        DrawHelper.PolylinePrimitive.prototype.setEditable = function ()
        {

            if (this.setEditMode)
            {
                return;
            }
            var polyline = this;
            polyline.isPolygon = false;
            polyline.asynchronous = false;
            drawHelper.registerEditableShape(polyline);
            polyline.setEditMode = setEditMode;
            var originalWidth = this.width;
            polyline.setHighlighted = function (highlighted)
            {
                // disable if already in edit mode
                if (this._editMode === true)
                {
                    return;
                }
                if (highlighted)
                {
                    drawHelper.setHighlighted(this);
                    this.setWidth(originalWidth * 2);
                }
                else
                {
                    this.setWidth(originalWidth);
                }
            };

            polyline.getExtent = function ()
            {
                return Cesium.Extent.fromCartographicArray(ellipsoid.cartesianArrayToCartographicArray(this.positions));
            };

            enhanceWithListeners(polyline);
            polyline.setEditMode(false);
        };

        DrawHelper.PolygonPrimitive.prototype.setEditable = function ()
        {

            var polygon = this;
            polygon.asynchronous = false;
            var scene = drawHelper._scene;
            drawHelper.registerEditableShape(polygon);
            polygon.setEditMode = setEditMode;
            polygon.setHighlighted = setHighlighted;
            enhanceWithListeners(polygon);
            polygon.setEditMode(false);
        };

        DrawHelper.ExtentPrimitive.prototype.setEditable = function ()
        {

            if (this.setEditMode)
            {
                return;
            }

            var extent = this;
            var scene = drawHelper._scene;
            drawHelper.registerEditableShape(extent);
            extent.asynchronous = false;
            extent.setEditMode = function (editMode)
            {
                // if no change
                if (this._editMode === editMode)
                {
                    return;
                }
                drawHelper.disableAllHighlights();
                // display markers
                if (editMode)
                {
                    // make sure all other shapes are not in edit mode before starting the editing of this shape
                    drawHelper.setEdited(this);
                    // create the markers and handlers for the editing
                    if (!Cesium.defined(this._markers))
                    {
                        var markers = new _.BillboardGroup(drawHelper, dragBillboard);
                        function onEdited()
                        {
                            extent.executeListeners({name: 'onEdited', extent: extent.extent});
                        }
                        var handleMarkerChanges = {
                            dragHandlers: {
                                onDrag: function (index, position)
                                {
                                    var corner = markers.getBillboard((index + 2) % 4).position;
                                    extent.setExtent(getExtent(ellipsoid.cartesianToCartographic(corner), ellipsoid.cartesianToCartographic(position)));
                                    markers.updateBillboardsPositions(getExtentCorners(extent.extent));
                                },
                                onDragEnd: function (index, position)
                                {
                                    onEdited();
                                }
                            },
                            tooltip: function ()
                            {
                                return "Drag to change the corners of this extent";
                            }
                        };
                        markers.addBillboards(getExtentCorners(extent.extent), handleMarkerChanges);
                        this._markers = markers;
                        // add a handler for clicking in the globe
                        this._globeClickhandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                        this._globeClickhandler.setInputAction(
                                function (movement)
                                {
                                    var pickedObject = scene.pick(movement.position);
                                    // disable edit if pickedobject is different or not an object
                                    if (!(pickedObject && !pickedObject.isDestroyed() && pickedObject.primitive))
                                    {
                                        extent.setEditMode(false);
                                    }
                                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                        // set on top of the polygon
                        markers.setOnTop();
                    }
                    this._editMode = true;
                }
                else
                {
                    if (Cesium.defined(this._markers))
                    {
                        this._markers.remove();
                        this._markers = undefined;
                        this._globeClickhandler.destroy();
                    }
                    this._editMode = false;
                }
            };

            extent.setHighlighted = setHighlighted;
            enhanceWithListeners(extent);
            extent.setEditMode(false);
        };

        _.EllipsePrimitive.prototype.setEditable = function ()
        {

            if (this.setEditMode)
            {
                return;
            }

            var ellipse = this;
            var scene = drawHelper._scene;
            ellipse.asynchronous = false;
            drawHelper.registerEditableShape(ellipse);
            ellipse.setEditMode = function (editMode)
            {
                // if no change
                if (this._editMode === editMode)
                {
                    return;
                }
                drawHelper.disableAllHighlights();
                // display markers
                if (editMode)
                {
                    // make sure all other shapes are not in edit mode before starting the editing of this shape
                    drawHelper.setEdited(this);
                    var _self = this;
                    // create the markers and handlers for the editing
                    if (!Cesium.defined(this._markers))
                    {
                        var markers = new _.BillboardGroup(drawHelper, dragBillboard);
                        function getMarkerPositions()
                        {
                            return Cesium.Shapes.computeEllipseBoundary(ellipsoid, ellipse.getCenter(), ellipse.getSemiMajorAxis(), ellipse.getSemiMinorAxis(), ellipse.getRotation() + Math.PI / 2, Math.PI / 2.0).splice(0, 4);
                        }
                        function onEdited()
                        {
                            ellipse.executeListeners({name: 'onEdited', center: ellipse.getCenter(), semiMajorAxis: ellipse.getSemiMajorAxis(), semiMinorAxis: ellipse.getSemiMinorAxis(), rotation: 0});
                        }
                        var handleMarkerChanges = {
                            dragHandlers: {
                                onDrag: function (index, position)
                                {
                                    var distance = Cesium.Cartesian3.distance(ellipse.getCenter(), position);
                                    if (index % 2 === 0)
                                    {
                                        ellipse.setSemiMajorAxis(distance);
                                    }
                                    else
                                    {
                                        ellipse.setSemiMinorAxis(distance);
                                    }
                                    markers.updateBillboardsPositions(getMarkerPositions());
                                },
                                onDragEnd: function (index, position)
                                {
                                    onEdited();
                                }
                            },
                            tooltip: function ()
                            {
                                return "Drag to change the excentricity and radius";
                            }
                        };
                        markers.addBillboards(getMarkerPositions(), handleMarkerChanges);
                        this._markers = markers;
                        // add a handler for clicking in the globe
                        this._globeClickhandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                        this._globeClickhandler.setInputAction(
                                function (movement)
                                {
                                    var pickedObject = scene.pick(movement.position);
                                    if (!(pickedObject && pickedObject.primitive))
                                    {
                                        _self.setEditMode(false);
                                    }
                                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                        // set on top of the polygon
                        markers.setOnTop();
                    }
                    this._editMode = true;
                }
                else
                {
                    if (Cesium.defined(this._markers))
                    {
                        this._markers.remove();
                        this._markers = undefined;
                        this._globeClickhandler.destroy();
                    }
                    this._editMode = false;
                }
            };

            ellipse.setHighlighted = setHighlighted;
            enhanceWithListeners(ellipse);
            ellipse.setEditMode(false);
        };

        _.CirclePrimitive.prototype.getCircleCartesianCoordinates = function (granularity)
        {
            var geometry = Cesium.CircleOutlineGeometry.createGeometry(new Cesium.CircleOutlineGeometry({ellipsoid: ellipsoid, center: this.getCenter(), radius: this.getRadius(), granularity: granularity}));
            var count = 0, value, values = [];
            for (; count < geometry.attributes.position.values.length; count += 3)
            {
                value = geometry.attributes.position.values;
                values.push(new Cesium.Cartesian3(value[count], value[count + 1], value[count + 2]));
            }
            return values;
        };
        _.CirclePrimitive.prototype.setEditable = function ()
        {

            if (this.setEditMode)
            {
                return;
            }

            var circle = this;
            var scene = drawHelper._scene;
            circle.asynchronous = false;
            drawHelper.registerEditableShape(circle);
            circle.setEditMode = function (editMode)
            {
                // if no change
                if (this._editMode === editMode)
                {
                    return;
                }
                drawHelper.disableAllHighlights();
                // display markers
                if (editMode)
                {
                    // make sure all other shapes are not in edit mode before starting the editing of this shape
                    drawHelper.setEdited(this);
                    var _self = this;
                    // create the markers and handlers for the editing
                    if (!Cesium.defined(this._markers))
                    {
                        var markers = new _.BillboardGroup(drawHelper, dragBillboard);
                        function getMarkerPositions()
                        {
                            return _self.getCircleCartesianCoordinates(Cesium.Math.PI_OVER_TWO);
                        }
                        function onEdited()
                        {
                            circle.executeListeners({name: 'onEdited', center: circle.getCenter(), radius: circle.getRadius()});
                        }
                        var handleMarkerChanges = {
                            dragHandlers: {
                                onDrag: function (index, position)
                                {
                                    circle.setRadius(Cesium.Cartesian3.distance(circle.getCenter(), position));
                                    markers.updateBillboardsPositions(getMarkerPositions());
                                },
                                onDragEnd: function (index, position)
                                {
                                    onEdited();
                                }
                            },
                            tooltip: function ()
                            {
                                return "Drag to change the radius";
                            }
                        };
                        markers.addBillboards(getMarkerPositions(), handleMarkerChanges);
                        this._markers = markers;
                        // add a handler for clicking in the globe
                        this._globeClickhandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                        this._globeClickhandler.setInputAction(
                                function (movement)
                                {
                                    var pickedObject = scene.pick(movement.position);
                                    if (!(pickedObject && pickedObject.primitive))
                                    {
                                        _self.setEditMode(false);
                                    }
                                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                        // set on top of the polygon
                        markers.setOnTop();
                    }
                    this._editMode = true;
                }
                else
                {
                    if (Cesium.defined(this._markers))
                    {
                        this._markers.remove();
                        this._markers = undefined;
                        this._globeClickhandler.destroy();
                    }
                    this._editMode = false;
                }
            };

            circle.setHighlighted = setHighlighted;
            enhanceWithListeners(circle);
            circle.setEditMode(false);
        };

    };

    _.DrawHelperWidget = (function ()
    {

        // constructor
        function _(drawHelper, options)
        {

            // container must be specified
            if (!(Cesium.defined(options.container)))
            {
                throw new Cesium.DeveloperError('Container is required');
            }
            var drawOptions = {
//                markerIcon: CESIUM_BASE_URL + "editors/drawHelper/img/glyphicons_242_google_maps.png",
//                polylineIcon: CESIUM_BASE_URL + "editors/drawHelper/img/glyphicons_097_vector_path_line.png",
//                polygonIcon: CESIUM_BASE_URL + "editors/drawHelper/img/glyphicons_096_vector_path_polygon.png",
//                circleIcon: CESIUM_BASE_URL + "editors/drawHelper/img/glyphicons_095_vector_path_circle.png",
//                extentIcon: CESIUM_BASE_URL + "editors/drawHelper/img/glyphicons_094_vector_path_square.png",
//                clearIcon: CESIUM_BASE_URL + "editors/drawHelper/img/glyphicons_067_cleaning.png",
                polylineDrawingOptions: defaultPolylineOptions,
                polygonDrawingOptions: defaultPolygonOptions,
                extentDrawingOptions: defaultExtentOptions,
                circleDrawingOptions: defaultCircleOptions
            };
            fillOptions(options, drawOptions);
            var _self = this;
            var toolbar = document.createElement('DIV');
            toolbar.className = "toolbar";
            options.container.appendChild(toolbar);
            function addIcon(id, url, title, callback)
            {
                var div = document.createElement('DIV');
                div.className = 'button';
                div.title = title;
                toolbar.appendChild(div);
                div.onclick = callback;
                var span = document.createElement('SPAN');
                div.appendChild(span);
                var image = document.createElement('IMG');
                image.src = url;
                span.appendChild(image);
                return div;
            }

            var scene = drawHelper._scene;
            addIcon('marker', options.markerIcon, 'Click to start drawing a 2D marker', function ()
            {
                drawHelper.startDrawingMarker({
                    callback: function (position)
                    {
                        _self.executeListeners({name: 'markerCreated', position: position});
                    }
                });
            });

            addIcon('polyline', options.polylineIcon, 'Click to start drawing a 2D polyline', function ()
            {
                drawHelper.startDrawingPolyline({
                    callback: function (positions)
                    {
                        _self.executeListeners({name: 'polylineCreated', positions: positions});
                    }
                });
            });

            addIcon('polygon', options.polygonIcon, 'Click to start drawing a 2D polygon', function ()
            {
                drawHelper.startDrawingPolygon({
                    callback: function (positions)
                    {
                        _self.executeListeners({name: 'polygonCreated', positions: positions});
                    }
                });
            });

            addIcon('extent', options.extentIcon, 'Click to start drawing an Extent', function ()
            {
                drawHelper.startDrawingExtent({
                    callback: function (extent)
                    {
                        _self.executeListeners({name: 'extentCreated', extent: extent});
                    }
                });
            });

            addIcon('circle', options.circleIcon, 'Click to start drawing a Circle', function ()
            {
                drawHelper.startDrawingCircle({
                    callback: function (center, radius)
                    {
                        _self.executeListeners({name: 'circleCreated', center: center, radius: radius});
                    }
                });
            });

            // add a clear button at the end
            // add a divider first
            var div = document.createElement('DIV');
            div.className = 'divider';
            toolbar.appendChild(div);
            addIcon('clear', options.clearIcon, 'Remove all primitives', function ()
            {
                scene.primitives.removeAll();
            });
            enhanceWithListeners(this);
        }

        return _;
    })();
    _.prototype.addToolbar = function (container, options)
    {
        options = copyOptions(options, {container: container});
        return new _.DrawHelperWidget(this, options);
    };

    function getExtent(mn, mx)
    {
        var e = new Cesium.Rectangle();
        // Re-order so west < east and south < north
        e.west = Math.min(mn.longitude, mx.longitude);
        e.east = Math.max(mn.longitude, mx.longitude);
        e.south = Math.min(mn.latitude, mx.latitude);
        e.north = Math.max(mn.latitude, mx.latitude);
        // Check for approx equal (shouldn't require abs due to re-order)
        var epsilon = Cesium.Math.EPSILON7;
        if ((e.east - e.west) < epsilon)
        {
            e.east += epsilon * 2.0;
        }

        if ((e.north - e.south) < epsilon)
        {
            e.north += epsilon * 2.0;
        }

        return e;
    }
    ;
    function createTooltip(frameDiv)
    {

        var tooltip = function (frameDiv)
        {

            var div = document.createElement('DIV');
            div.className = "twipsy right";
            var arrow = document.createElement('DIV');
            arrow.className = "twipsy-arrow";
            div.appendChild(arrow);
            var title = document.createElement('DIV');
            title.className = "twipsy-inner";
            div.appendChild(title);
            this._div = div;
            this._title = title;
            // add to frame div and display coordinates
            frameDiv.appendChild(div);
        };

        tooltip.prototype.setVisible = function (visible)
        {
            this._div.style.display = visible ? 'block' : 'none';
        };

        tooltip.prototype.showAt = function (position, message)
        {
            if (position && message)
            {
                this.setVisible(true);
                this._title.innerHTML = message;
                this._div.style.left = position.x + 10 + "px";
                this._div.style.top = (position.y - this._div.clientHeight / 2) + "px";
            }
        };

        return new tooltip(frameDiv);
    }

    function getDisplayLatLngString(cartographic, precision)
    {
        return Cesium.Math.toDegrees(cartographic.longitude).toFixed(precision || 3) + ", " + Cesium.Math.toDegrees(cartographic.latitude).toFixed(precision || 3) + ", " + cartographic.height.toFixed(precision || 3);
    }

    function clone(from, to)
    {
        if ((from === null) || (typeof (from) !== "object"))
            return from;
        if ((from.constructor !== Object) && (from.constructor !== Array))
            return from;
        if ((from.constructor === Date) || (from.constructor === RegExp) || (from.constructor === Function) ||
                (from.constructor === String) || (from.constructor === Number) || (from.constructor === Boolean))
            return new from.constructor(from);
        to = to || new from.constructor();
        for (var name in from)
        {
            to[name] = (typeof (to[name]) === "undefined") ? clone(from[name], null) : to[name];
        }

        return to;
    }

    function fillOptions(options, defaultOptions)
    {
        options = options || {};
        var option;
        for (option in defaultOptions)
        {
            if (options[option] === undefined)
            {
                options[option] = clone(defaultOptions[option]);
            }
        }
    }

    // shallow copy
    function copyOptions(options, defaultOptions)
    {
        var newOptions = clone(options), option;
        for (option in defaultOptions)
        {
            if (newOptions[option] === undefined)
            {
                newOptions[option] = clone(defaultOptions[option]);
            }
        }
        return newOptions;
    }

    function setListener(primitive, type, callback)
    {
        primitive[type] = callback;
    }

    function enhanceWithListeners(element)
    {

        element._listeners = {};
        element.addListener = function (name, callback)
        {
            this._listeners[name] = (this._listeners[name] || []);
            this._listeners[name].push(callback);
            return this._listeners[name].length;
        };
        element.executeListeners = function (event, defaultCallback)
        {
            if (this._listeners[event.name] && this._listeners[event.name].length > 0)
            {
                var index = 0;
                for (; index < this._listeners[event.name].length; index++)
                {
                    this._listeners[event.name][index](event);
                }
            }
            else
            {
                if (defaultCallback)
                {
                    defaultCallback(event);
                }
            }
        };
    }

    _.prototype.startDrawingCategorySectorAutoShape = function (options)
    {
        var _self = this;
        var scene = this._scene;
        var tooltip = this._tooltip;
        var oRenderedGraphic;
        var oRectangle;
        var oSensorCLL;
        var oDrawItem = options.item;
        var oProperties = oDrawItem.properties || {};
        var oModifiers = oProperties.modifiers || {};
        var oSensorCPCallbacks = {};
        var oRangeCPCallbacks = {};
        var oAzimuthCPCallbacks = {};
        var dSectorDistance;
        var markers;
        var iResentRangeAdded = [];
        var iResentAzimuthAdded = [];
        var iRangeAddTS = 0;
        oDrawItem.properties = oProperties;
        //oDrawItem.id = options.id;

        var hasMinRange = function ()
        {
            var bMinRange = false;
            var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            var aAzimuthList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH];
            // We need to see if there is a min range.
            // Its a range with no azimuths.
            // So if the # of azimuth < 2 * the # of ranges, then
            // there is a min range.
            if (aAzimuthList.length < (aRangeList.length * 2))
            {
                bMinRange = true;
            }

            return bMinRange;
        };
        var getRangeCPAzimuth = function (iIndex)
        {
            var dAzimuth = 0.0;
            //var bMinRange = hasMinRange();
            var aAzimuthList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH];
            var iAzimuthIndex;
            var dLeftAzimuth;
            var dRightAzimuth;
            if (hasMinRange() && (iIndex > 0))
            {
                iIndex--;
            }
            iAzimuthIndex = iIndex * 2;
            dLeftAzimuth = aAzimuthList[iAzimuthIndex];
            dRightAzimuth = aAzimuthList[iAzimuthIndex + 1];
            dAzimuth = dLeftAzimuth + ((dRightAzimuth - dLeftAzimuth) / 2.0);
            if (dLeftAzimuth > dRightAzimuth)
            {
                dAzimuth += 180.0;
            }

            dAzimuth = (dAzimuth + 360.0) % 360;
            return dAzimuth;
        };
        var getRangeCP = function (iIndex)
        {
            return markers.findControlPoint("radius", "iRangeIndex", iIndex);
        };
        var getAzimuthCP = function (iIndex)
        {
            return markers.findControlPoint("azimuth", "iAzimuthIndex", iIndex);
        };
        var renderGraphic = function ()
        {
            var oRenderModifiers = emp.helpers.copyObject(oModifiers);
            var oExtent = this.empCesium.getExtent();
            var sExtents = oExtent.west.toDeg() + "," + oExtent.south.toDeg() + "," + oExtent.east.toDeg() + "," + oExtent.north.toDeg();
            var sCoordinates = oSensorCLL.longitude.toDeg().toString() + "," + oSensorCLL.latitude.toDeg().toString();
            var oMaterial;
            var oRenderData;
            var cartographics = [oSensorCLL];
            oRenderModifiers[emp.typeLibrary.utils.milstd.StringModifiers.LINE_COLOR] = EmpCesiumConstants.selectionProperties.COLOR_HEX;
            //oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, "clampToGround", this.empCesium.getScale(), sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
            oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol2D(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, this.empCesium.canvas.width, this.empCesium.canvas.height, sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
            if (oRenderData && (typeof (oRenderData) === 'string'))
            {
                new emp.typeLibrary.Error({
                    level: emp.typeLibrary.Error.level.CATASTROPHIC,
                    message: "RenderSymbol2D return: " + oRenderData
                });
                return;
            }
            oMaterial = new _self.empCesium.ImageMaterialProperty();
            oMaterial.image = oRenderData.image;
            oMaterial.transparent = true;
            if (!Cesium.defined(oRenderData.west) || !Cesium.defined(oRenderData.south) || !Cesium.defined(oRenderData.east) || !Cesium.defined(oRenderData.north))
            {
                oRectangle = Cesium.Rectangle.fromCartographicArray(cartographics);
            }
            else
            {
                oRectangle = Cesium.Rectangle.fromDegrees(oRenderData.west.x, oRenderData.south.y, oRenderData.east.x, oRenderData.north.y);
            }
            if (oRenderedGraphic)
            {
                oRenderedGraphic.rectangle.material.image = oRenderData.image;
                _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
            }
            else
            {
                oRenderedGraphic = new _self.empCesium.Entity({
                    id: options.id,
                    selectable: true,
                    show: true,
                    rectangle: {
                        coordinates: getLatestRectangleCallbackProperty,
                        material: oMaterial
                    }
                });
                oRenderedGraphic.featureId = oDrawItem.featureId;
                oRenderedGraphic.coreId = oDrawItem.coreId;
                oRenderedGraphic.overlayId = oDrawItem.overlayId;
                oRenderedGraphic.symbolCode = oDrawItem.symbolCode;
                oRenderedGraphic._editMode = true;
                oRenderedGraphic.featureType = EmpCesiumConstants.featureType.ENTITY;
                oRenderedGraphic = _self.empCesium.viewer.entities.add(oRenderedGraphic);
            }
            //_self.muteHandlers(false);
            markers.setOnTop();
        }.bind(this);
        
          _self.empCesium.currentMultiPointEditorRenderGraphicFuction = renderGraphic;
          
          
        var getLatestRectangleCallbackProperty = new Cesium.CallbackProperty(function getRectangle(time, result)
        {
            return Cesium.Rectangle.clone(oRectangle, result);
        }, false);
        oSensorCPCallbacks = {
            oPrevCLL: oSensorCLL,
            dragHandlers: {
                onDragStart: function (data)
                {
                    oSensorCPCallbacks.oPrevCLL = data.position;
                    //oSensorCPCallbacks.oPrevCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCartesianPos);
                },
                onDrag: function (data)
                {
                    var oCP;
                    var oCLLCoord;
                    oSensorCLL = data.position;
                    //oSensorCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCartesianPos);
                    var dDist = oSensorCPCallbacks.oPrevCLL.distanceTo(oSensorCLL);
                    var dBrng = oSensorCPCallbacks.oPrevCLL.bearingTo(oSensorCLL);
                    // Convert to latlon
                    // Get the distance and bearing to the new position.
                    if (oRenderedGraphic)
                    {
                        //var oRect = oRenderedGraphic.rectangle;
                        var oRect = oRectangle;
                        var oSouthWest = new Cesium.Cartographic(oRect.west, oRect.south, 0);
                        var oNorthEast = new Cesium.Cartographic(oRect.east, oRect.north, 0);
                        oSouthWest.moveCoordinate(dBrng, dDist);
                        oNorthEast.moveCoordinate(dBrng, dDist);
//                        oRenderedGraphic.rectangle = new Cesium.Rectangle(oSouthWest.longitude, oSouthWest.latitude, oNorthEast.longitude, oNorthEast.latitude);
                        oRectangle = new Cesium.Rectangle(oSouthWest.longitude, oSouthWest.latitude, oNorthEast.longitude, oNorthEast.latitude);
                    }

                    for (var iIndex = 1; iIndex < markers.countBillboards(); iIndex++)
                    {
                        oCP = markers.getBillboard(iIndex);
                        oCLLCoord = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCP.position);
                        oCLLCoord.moveCoordinate(dBrng, dDist);
                        oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                    }
                    oSensorCPCallbacks.oPrevCLL = oSensorCLL;
                    _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                },
                onDragEnd: function (data)
                {
                    oSensorCLL = data.position;
                    //oSensorCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCartesianPos);
                    //renderGraphic();
                    //addControlPoints();
                    options.callbacks.onDrawUpdate({positions: oSensorCLL, properties: oProperties, indices: [0]});
                }
            }
        };
        oRangeCPCallbacks = {
            hRenderTimer: undefined,
            oPrevCLL: undefined,
            dragHandlers: {
                onDragStart: function (data)
                {
                    //oRangeCPCallbacks.oPrevCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCartesianPos);
                    oRangeCPCallbacks.oPrevCLL = data.position; //Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCartesianPos);
                },
                onDrag: function (data)
                {
                    if (oRangeCPCallbacks.hRenderTimer)
                    {
                        clearTimeout(oRangeCPCallbacks.hRenderTimer);
                        oRangeCPCallbacks.hRenderTimer = undefined;
                    }
                    var iRangeIndex;
                    var dPrevDist = 0.0;
                    var dNextDist = Number.MAX_VALUE;
                    var dAzimuthDist;
                    var dRangeCPAzimuth;
                    var iAzimuthIndex;
                    var oCP = markers.getBillboard(data.index);
                    var oCLLCoord = data.position;
                    //var oCLLCoord = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCartesianPos);
                    var dMouseDist = Math.round(oSensorCLL.distanceTo(oCLLCoord));
                    var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
                    var aAzimuthList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH];
                    var bHasMinRange = hasMinRange();
                    if (!oCP)
                    {
                        return;
                    }

                    iRangeIndex = oCP.cpData.iRangeIndex;
                    dRangeCPAzimuth = getRangeCPAzimuth(iRangeIndex);
                    // Get the previous range if its not the first.
                    if (iRangeIndex > 0)
                    {
                        dPrevDist = aRangeList[iRangeIndex - 1];
                    }
                    // Get the next range if its not the last.
                    if (iRangeIndex < (aRangeList.length - 1))
                    {
                        dNextDist = aRangeList[iRangeIndex + 1];
                    }

                    if ((dMouseDist <= dPrevDist) || (dMouseDist >= dNextDist))
                    {
                        // The range can only be moved between the previous and next range.
                        oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oRangeCPCallbacks.oPrevCLL);
                        return;
                    }

                    aRangeList[iRangeIndex] = dMouseDist;
                    oCLLCoord = oSensorCLL.destinationPoint(dRangeCPAzimuth, dMouseDist);
                    oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                    oRangeCPCallbacks.oPrevCLL = oCLLCoord;
                    if (bHasMinRange)
                    {
                        // The min range does not have azimuth so we only move the 
                        // azimuth of the next range.
                        if (iRangeIndex === 0)
                        {
                            iAzimuthIndex = 0;
                            iRangeIndex = 1;
                            dPrevDist = dMouseDist;
                            if (iRangeIndex < aRangeList.length)
                            {
                                dNextDist = aRangeList[iRangeIndex];
                                dAzimuthDist = Math.floor(dPrevDist + ((dNextDist - dPrevDist) / 2));
                            }
                            else
                            {
                                dAzimuthDist = Math.floor(dPrevDist / 2);
                            }

                            oCP = getAzimuthCP(iAzimuthIndex);
                            oCLLCoord = oSensorCLL.destinationPoint(aAzimuthList[iAzimuthIndex], dAzimuthDist);
                            oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                            iAzimuthIndex++;
                            oCP = getAzimuthCP(iAzimuthIndex);
                            oCLLCoord = oSensorCLL.destinationPoint(aAzimuthList[iAzimuthIndex], dAzimuthDist);
                            oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                        }
                        else
                        {
                            iAzimuthIndex = (iRangeIndex - 1) * 2;
                            dAzimuthDist = Math.floor(dPrevDist + ((dMouseDist - dPrevDist) / 2));
                            // The Current range azimuth
                            oCP = getAzimuthCP(iAzimuthIndex);
                            oCLLCoord = oSensorCLL.destinationPoint(aAzimuthList[iAzimuthIndex], dAzimuthDist);
                            oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                            iAzimuthIndex++;
                            oCP = getAzimuthCP(iAzimuthIndex);
                            oCLLCoord = oSensorCLL.destinationPoint(aAzimuthList[iAzimuthIndex], dAzimuthDist);
                            oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                            iRangeIndex++;
                            if (iRangeIndex < aRangeList.length)
                            {
                                // The next ranges azimuth.
                                iAzimuthIndex++;
                                dAzimuthDist = Math.floor(dMouseDist + ((dNextDist - dMouseDist) / 2));
                                // The Current range azimuth
                                oCP = getAzimuthCP(iAzimuthIndex);
                                oCLLCoord = oSensorCLL.destinationPoint(aAzimuthList[iAzimuthIndex], dAzimuthDist);
                                oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                                iAzimuthIndex++;
                                oCP = getAzimuthCP(iAzimuthIndex);
                                oCLLCoord = oSensorCLL.destinationPoint(aAzimuthList[iAzimuthIndex], dAzimuthDist);
                                oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                            }
                        }
                    }
                    else
                    {
                        iAzimuthIndex = iRangeIndex * 2;
                        dAzimuthDist = Math.floor(dPrevDist + ((dMouseDist - dPrevDist) / 2));
                        // The Current range azimuth
                        oCP = getAzimuthCP(iAzimuthIndex);
                        oCLLCoord = oSensorCLL.destinationPoint(aAzimuthList[iAzimuthIndex], dAzimuthDist);
                        oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                        iAzimuthIndex++;
                        oCP = getAzimuthCP(iAzimuthIndex);
                        oCLLCoord = oSensorCLL.destinationPoint(aAzimuthList[iAzimuthIndex], dAzimuthDist);
                        oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                        iRangeIndex++;
                        if (iRangeIndex < aRangeList.length)
                        {
                            // The next ranges azimuth.
                            iAzimuthIndex++;
                            dAzimuthDist = Math.floor(dMouseDist + ((dNextDist - dMouseDist) / 2));
                            // The Current range azimuth
                            oCP = getAzimuthCP(iAzimuthIndex);
                            oCLLCoord = oSensorCLL.destinationPoint(aAzimuthList[iAzimuthIndex], dAzimuthDist);
                            oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                            iAzimuthIndex++;
                            oCP = getAzimuthCP(iAzimuthIndex);
                            oCLLCoord = oSensorCLL.destinationPoint(aAzimuthList[iAzimuthIndex], dAzimuthDist);
                            oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                        }
                    }

                    oRangeCPCallbacks.hRenderTimer = setTimeout(function ()
                    {
                        oRangeCPCallbacks.hRenderTimer = undefined;
                        renderGraphic();
                    }, 0);
                },
                onDragEnd: function (data)
                {
                    options.callbacks.onDrawUpdate({positions: oSensorCLL, properties: oProperties, indices: []});
                }
            },
            onDoubleClick: function (iIndex, position)
            {
                if (oRangeCPCallbacks.hRenderTimer)
                {
                    clearTimeout(oRangeCPCallbacks.hRenderTimer);
                    oRangeCPCallbacks.hRenderTimer = undefined;
                }

                var iAzimuthIndex;
                var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
                var aAzimuthList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH];
                var oCP = markers.getBillboard(iIndex);
                if ((aRangeList.length === 1) || !oCP)
                {
                    // There must be at least 1 range.
                    return;
                }

                var iRangeIndex = oCP.cpData.iRangeIndex;
                if (hasMinRange())
                {
                    if (aRangeList.length === 2)
                    {
                        // If there is a min range there must be at least 2 range.
                        return;
                    }
                    // If the index is 0 the User is deleteing the min range.
                    // therefore there are no azimuth to remove.
                    // If the index > 0 then the is azimuth to remove.
                    if (iRangeIndex !== 0)
                    {
                        iAzimuthIndex = (iRangeIndex - 1) * 2;
                    }
                }
                else
                {
                    iAzimuthIndex = iRangeIndex * 2;
                }

                if (iAzimuthIndex)
                {
                    // We do 2 to remove the left and right azimuth.
                    aAzimuthList.splice(iAzimuthIndex, 2);
                }

                aRangeList.splice(iRangeIndex, 1);
                oRangeCPCallbacks.hRenderTimer = setTimeout(function ()
                {
                    _self.muteHandlers(true);
                    oRangeCPCallbacks.hRenderTimer = undefined;
                    renderGraphic();
                    addControlPoints();
                    _self.muteHandlers(false);
                }, 0);
            }
        };
        oAzimuthCPCallbacks = {
            hRenderTimer: undefined,
            dragHandlers: {
                onDragStart: function (data)
                {
                },
                onDrag: function (data)
                {
                    if (oAzimuthCPCallbacks.hRenderTimer)
                    {
                        clearTimeout(oAzimuthCPCallbacks.hRenderTimer);
                        oAzimuthCPCallbacks.hRenderTimer = undefined;
                    }
                    var aAzimuthList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH];
                    var oCP = markers.getBillboard(data.index);
                    var oCLLCoord = data.position;
                    //var oCLLCoord = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCartesianPos);
                    var dMouseAzimuth = oSensorCLL.bearingTo(oCLLCoord);
                    if (!oCP)
                    {
                        return;
                    }

                    aAzimuthList[oCP.cpData.iAzimuthIndex] = dMouseAzimuth;
                    oCLLCoord = oSensorCLL.destinationPoint(dMouseAzimuth, oCP.cpData.dAzimuthDist);
                    oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                    oCP = getRangeCP(oCP.cpData.iRangeIndex);
                    if (oCP)
                    {
                        var dRangeCPAzimuth = getRangeCPAzimuth(oCP.cpData.iRangeIndex);
                        var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
                        oCLLCoord = oSensorCLL.destinationPoint(dRangeCPAzimuth, aRangeList[oCP.cpData.iRangeIndex]);
                        oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                    }
                    oAzimuthCPCallbacks.hRenderTimer = setTimeout(function ()
                    {
                        oAzimuthCPCallbacks.hRenderTimer = undefined;
                        renderGraphic();
                    }, 0);
                    _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                },
                onDragEnd: function (data)
                {
                    options.callbacks.onDrawUpdate({positions: oSensorCLL, properties: oProperties, indices: []});
                }
            },
            onDoubleClick: function (iIndex, position)
            {
                // The user is deleting an azimuth.
                // This would create a min range.
                // Therefore its only allowed if there is no min range
                // AND the azimuth being removed is one of the first 2.
                var iAzimuthIndex;
                var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
                var aAzimuthList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH];
                var oCP = markers.getBillboard(iIndex);
                var pickedObject = scene.pick(position);
                if (!pickedObject || (pickedObject.primitive !== oCP))
                {
                    // Make sure its CP on the top.
                    return;
                }

                if (hasMinRange())
                {
                    // If it already has a min range we can't delete any more azimuths.
                    return;
                }
                if ((aRangeList.length === 1) || !oCP)
                {
                    // If there is only 1 range it can't be made a min range.
                    return;
                }

                var iRangeIndex = oCP.cpData.iRangeIndex;
                if (iRangeIndex !== 0)
                {
                    // Only the azimuth of the first range can be removed.
                    return;
                }

                if (oAzimuthCPCallbacks.hRenderTimer)
                {
                    clearTimeout(oAzimuthCPCallbacks.hRenderTimer);
                    oAzimuthCPCallbacks.hRenderTimer = undefined;
                }

                iAzimuthIndex = iRangeIndex * 2;
                // We do it 2 to remove the left and right azimuth.
                aAzimuthList.splice(iAzimuthIndex, 2);
                oAzimuthCPCallbacks.hRenderTimer = setTimeout(function ()
                {
                    _self.muteHandlers(true);
                    oAzimuthCPCallbacks.hRenderTimer = undefined;
                    renderGraphic();
                    addControlPoints();
                    _self.muteHandlers(false);
                }, 0);
            }
        };
        this.startDrawing(
                function ()
                {
                    if (oRenderedGraphic)
                    {
                        _self.empCesium.viewer.entities.remove(oRenderedGraphic);
                    }
                    if (markers)
                    {
                        markers.remove();
                    }
                    if (mouseHandler)
                    {
                        mouseHandler.destroy();
                    }
                    // tooltip.setVisible(false);
                    _self.muteHandlers(true);
                }
        );
        markers = new _.BillboardGroup(this, defaultBillboard);
        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        var addNewRange = function (dRange)
        {
            var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            var aAzimuthList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH];
            var iSize = aRangeList.length;
            var bMinRange = hasMinRange();
            var iLeftAzimuthIndex;
            var dLeftAzimuth;
            var dRightAzimuth;
            var aNewRanges = [];
            var aNewAzimuths = [];
            for (var iIndex = 0; iIndex < iSize; iIndex++)
            {
                if (dRange < aRangeList[iIndex])
                {
                    dLeftAzimuth = 315.0;
                    dRightAzimuth = 45.0;
                    aRangeList.splice(iIndex, 0, dRange);
                    aNewRanges.push(iIndex);
                    iRangeAddTS = Date.now();
                    if (bMinRange)
                    {
                        if (iIndex === 0)
                        {
                            if (aAzimuthList.length > 0)
                            {
                                dLeftAzimuth = aAzimuthList[0];
                                dRightAzimuth = aAzimuthList[1];
                            }
                            iLeftAzimuthIndex = 0;
                            aAzimuthList.splice(0, 0, dLeftAzimuth);
                            aAzimuthList.splice(1, 0, dRightAzimuth);
                            aNewAzimuths.push(0);
                            aNewAzimuths.push(1);
                        }
                        else
                        {
                            iLeftAzimuthIndex = ((iIndex - 1) * 2);
                            if (iLeftAzimuthIndex > 0)
                            {
                                dLeftAzimuth = aAzimuthList[iLeftAzimuthIndex - 2];
                                dRightAzimuth = aAzimuthList[iLeftAzimuthIndex - 1];
                            }
                            aAzimuthList.splice(iLeftAzimuthIndex, 0, dLeftAzimuth);
                            aAzimuthList.splice(iLeftAzimuthIndex + 1, 0, dRightAzimuth);
                            aNewAzimuths.push(iLeftAzimuthIndex);
                            aNewAzimuths.push(iLeftAzimuthIndex + 1);
                        }
                    }
                    else
                    {
                        iLeftAzimuthIndex = (iIndex * 2);
                        if (iLeftAzimuthIndex === 0)
                        {
                            dLeftAzimuth = aAzimuthList[0];
                            dRightAzimuth = aAzimuthList[1];
                        }
                        else
                        {
                            dLeftAzimuth = aAzimuthList[iLeftAzimuthIndex - 2];
                            dRightAzimuth = aAzimuthList[iLeftAzimuthIndex - 1];
                        }
                        aAzimuthList.splice(iLeftAzimuthIndex, 0, dLeftAzimuth);
                        aAzimuthList.splice(iLeftAzimuthIndex + 1, 0, dRightAzimuth);
                        aNewAzimuths.push(iLeftAzimuthIndex);
                        aNewAzimuths.push(iLeftAzimuthIndex + 1);
                    }
                    break;
                }
            }

            if (iIndex === iSize)
            {
                aNewRanges.push(iIndex);
                iRangeAddTS = Date.now();
                aRangeList.push(dRange);
                iLeftAzimuthIndex = aAzimuthList.length;
                if (iLeftAzimuthIndex === 0)
                {
                    aAzimuthList.push(315.0);
                    aAzimuthList.push(45.0);
                }
                else
                {
                    aAzimuthList.push(aAzimuthList[iLeftAzimuthIndex - 2]);
                    aAzimuthList.push(aAzimuthList[iLeftAzimuthIndex - 1]);
                }
                aNewAzimuths.push(iLeftAzimuthIndex);
                aNewAzimuths.push(iLeftAzimuthIndex + 1);
            }
            _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));

            return {
                newRanges: aNewRanges,
                newAzimuth: aNewAzimuths
            };
        };
        var removeAllCP = function ()
        {
            if (markers)
            {
                while (markers.countBillboards() > 0)
                {
                    markers.removeBillboard(0);
                }
            }
        };
        var addControlPoints = function ()
        {
            var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            var aAzimuthList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH];
            var iSize = aRangeList.length;
            var bMinRange = hasMinRange();
            var iLeftAzimuthIndex = 0;
            var oCartesianCoord;
            var oCPCLLCoord;
            var dAzimuthDist;
            removeAllCP();
            // Add Sensor CP.
            oCartesianCoord = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oSensorCLL);
            markers.addControlPoint({
                position: oCartesianCoord,
                callbacks: oSensorCPCallbacks,
                cpType: "vertex"
            });
            for (var iIndex = 0; iIndex < iSize; iIndex++)
            {
                oCPCLLCoord = oSensorCLL.destinationPoint(0, aRangeList[iIndex]);
                oCartesianCoord = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCPCLLCoord);
                markers.addControlPoint({
                    position: oCartesianCoord,
                    callbacks: oRangeCPCallbacks,
                    cpType: "radius",
                    cpData: {
                        iRangeIndex: iIndex
                    }
                });
                if (!(bMinRange && (iIndex === 0)))
                {
                    // Calculate the distance of the azimuth CP.
                    if (iIndex === 0)
                    {
                        dAzimuthDist = aRangeList[iIndex] / 2;
                    }
                    else
                    {
                        dAzimuthDist = aRangeList[iIndex - 1];
                        dAzimuthDist = dAzimuthDist + ((aRangeList[iIndex] - dAzimuthDist) / 2);
                    }

                    // Place the left azimuth CP.
                    oCPCLLCoord = oSensorCLL.destinationPoint(aAzimuthList[iLeftAzimuthIndex], dAzimuthDist);
                    oCartesianCoord = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCPCLLCoord);
                    markers.addControlPoint({
                        position: oCartesianCoord,
                        callbacks: oAzimuthCPCallbacks,
                        cpType: "azimuth",
                        cpData: {
                            dAzimuthDist: dAzimuthDist,
                            iRangeIndex: iIndex,
                            iAzimuthIndex: iLeftAzimuthIndex
                        }
                    });
                    iLeftAzimuthIndex++;
                    // Place the right azimuth CP.
                    oCPCLLCoord = oSensorCLL.destinationPoint(aAzimuthList[iLeftAzimuthIndex], dAzimuthDist);
                    oCartesianCoord = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCPCLLCoord);
                    markers.addControlPoint({
                        position: oCartesianCoord,
                        callbacks: oAzimuthCPCallbacks,
                        cpType: "azimuth",
                        cpData: {
                            dAzimuthDist: dAzimuthDist,
                            iRangeIndex: iIndex,
                            iAzimuthIndex: iLeftAzimuthIndex
                        }
                    });
                    iLeftAzimuthIndex++;
                }
            }
            for (var markerIndex = 0; markerIndex < markers._orderedBillboards.length; ++markerIndex)
            {
                markers._orderedBillboards[markerIndex].eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(_self.empCesium.viewer.camera.positionCartographic.height, _self.lastCameraHeight);
            }
            _self.lastCameraHeight = _self.empCesium.viewer.camera.positionCartographic.height;
            markers.setOnTop();
            _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        };
        // Now wait for start
        mouseHandler.setInputAction(function (movement)
        {
            var firstClick = false;
            if (Cesium.defined(movement.position))
            {
                var oMousePos = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                var pickedObject = scene.pick(movement.position);
                if (pickedObject && (pickedObject.primitive instanceof Cesium.Billboard))
                {
                    // If the Dblclick happened over a Billboard or the collection ignore it.
                    return;
                }
                if (oMousePos)
                {
                    oMousePos = oMousePos.clone();
                    // first click
                    if (!oSensorCLL)
                    {
                        firstClick = true;
                        var currentExtent = this.empCesium.getExtent();
                        var centerCartographic = Cesium.Rectangle.center(currentExtent);
                        var widthCurrentView = currentExtent.height; //radians

                        // Sensor position.
                        oSensorCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oMousePos);
                        widthCurrentView = Cesium.Math.toDegrees(widthCurrentView); //degrees
                        widthCurrentView = widthCurrentView * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude)); // meters
                        dSectorDistance = Math.round(widthCurrentView / 4.0);
                        oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [];
                        oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = [];
                    }
                    else
                    {
                        var oNewRangePosCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oMousePos);
                        dSectorDistance = oSensorCLL.distanceTo(oNewRangePosCLL);
                    }

                    var oNewData = addNewRange(dSectorDistance);
                    if (oNewData.newRanges instanceof Array)
                    {
                        for (var iIndex = 0; iIndex < oNewData.newRanges.length; iIndex++)
                        {
                            iResentRangeAdded.push(oNewData.newRanges[iIndex]);
                        }
                    }

                    if (oNewData.newAzimuth instanceof Array)
                    {
                        for (var iIndex = 0; iIndex < oNewData.newAzimuth.length; iIndex++)
                        {
                            iResentAzimuthAdded.push(oNewData.newAzimuth[iIndex]);
                        }
                    }
                    options.callbacks.onDrawUpdate({positions: oSensorCLL, properties: oProperties, indices: (firstClick) ? [0] : []});
                    renderGraphic();
                    addControlPoints();
                    // tooltip.setVisible(false);
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.endPosition;
            if (Cesium.defined(position))
            {
                if (!oSensorCLL)
                {
                    // tooltip.showAt(position, "<p>Click to add first point</p>");
                }
            }
            iResentRangeAdded = [];
            iResentAzimuthAdded = [];
            iRangeAddTS = 0;
            _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        }.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        mouseHandler.setInputAction(function (movement)
        {
            var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            var position = movement.position;
            if (Cesium.defined(position))
            {
                var pickedObject = scene.pick(movement.position);
                if (pickedObject && (pickedObject.primitive instanceof Cesium.Billboard))
                {
                    // If the Dblclick happened over a Billboard or the collection ignore it.
                    return;
                }
                if (!oSensorCLL || (aRangeList.length === 0))
                {
                    return;
                }
                else
                {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian)
                    {
                        var iDeltaTS = Date.now() - iRangeAddTS;
                        if (iDeltaTS <= 500)
                        {
                            var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
                            var aAzimuthList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH];
                            iResentRangeAdded.sort(function (a, b)
                            {
                                return b - a;
                            });
                            iResentAzimuthAdded.sort(function (a, b)
                            {
                                return b - a;
                            });
                            for (var iIndex = 0; iIndex < iResentRangeAdded.length; iIndex++)
                            {
                                aRangeList.splice(iResentRangeAdded[iIndex], 1);
                            }
                            for (var iIndex = 0; iIndex < iResentAzimuthAdded.length; iIndex++)
                            {
                                aAzimuthList.splice(iResentAzimuthAdded[iIndex], 1);
                            }
                            iRangeAddTS = 0;
                        }

                        //_self.stopDrawing();
                        if (typeof (options.callbacks.onDrawEnd) === 'function')
                        {
                            options.callbacks.onDrawEnd({
                                positions: oSensorCLL,
                                properties: oProperties,
                                indices: []
                            });
                        }
                        _self.muteHandlers(true);
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        var oCoordList = cesiumEngine.utils.convertGeoJsonCoordToCartographicList(oDrawItem.data);
        if (oCoordList && (oCoordList.length > 0))
        {
            oSensorCLL = oCoordList[0];
            oDrawItem.symbolCode = oDrawItem.data.symbolCode;
            oProperties = emp.helpers.copyObject(oDrawItem.properties);
            oModifiers = oProperties.modifiers || {};
            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
            oProperties.modifiers = oModifiers;
            var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            var aAzimuthList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH];
            if (aRangeList.length === 0)
            {
                aRangeList.push(2000);
            }

            var iRequiredAzimuths = (aRangeList.length * 2);
            if (aRangeList.length > 1)
            {
                iRequiredAzimuths -= 2;
            }

            while (aAzimuthList.length < iRequiredAzimuths)
            {
                aAzimuthList.push(315.0);
                aAzimuthList.push(45.0);
            }
            renderGraphic();
            addControlPoints();
        }
        else if (this.empCesium.drawData.coordinates && this.empCesium.drawData.coordinates.length === 1)
        {
            oProperties = emp.helpers.copyObject(oDrawItem.properties);
            oModifiers = oProperties.modifiers || {};
            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
            oProperties.modifiers = oModifiers;


            var currentExtent = this.empCesium.getExtent();
            var centerCartographic = Cesium.Rectangle.center(currentExtent);
            var widthCurrentView = currentExtent.height; //radians

            // Sensor position.
            oSensorCLL = this.empCesium.drawData.coordinates[0];
            var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            var aAzimuthList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH];
            if (aRangeList.length === 0)
            {
                aRangeList.push(2000);
            }

            var iRequiredAzimuths = (aRangeList.length * 2);
            if (aRangeList.length > 1)
            {
                iRequiredAzimuths -= 2;
            }

            while (aAzimuthList.length < iRequiredAzimuths)
            {
                aAzimuthList.push(315.0);
                aAzimuthList.push(45.0);
            }

            renderGraphic();
            addControlPoints();



//            widthCurrentView = Cesium.Math.toDegrees(widthCurrentView); //degrees
//            widthCurrentView = widthCurrentView * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude)); // meters
//            dSectorDistance = Math.round(widthCurrentView / 4.0);
//            oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [];
//            oModifiers[emp.typeLibrary.utils.milstd.Modifiers.AZIMUTH] = [];
//
//
//            var oNewData = addNewRange(dSectorDistance);
//            if (oNewData.newRanges instanceof Array)
//            {
//                for (var iIndex = 0; iIndex < oNewData.newRanges.length; iIndex++)
//                {
//                    iResentRangeAdded.push(oNewData.newRanges[iIndex]);
//                }
//            }
//
//            if (oNewData.newAzimuth instanceof Array)
//            {
//                for (var iIndex = 0; iIndex < oNewData.newAzimuth.length; iIndex++)
//                {
//                    iResentAzimuthAdded.push(oNewData.newAzimuth[iIndex]);
//                }
//            }
            options.callbacks.onDrawUpdate({positions: oSensorCLL, properties: oProperties, indices: []});

        }
        else
        {
            oProperties = emp.helpers.copyObject(oDrawItem.properties);
            oModifiers = oProperties.modifiers || {};
            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
            oProperties.modifiers = oModifiers;
        }

        this.muteHandlers(false);
        options.callbacks.onDrawStart({
            positions: oSensorCLL,
            properties: oProperties,
            indices: []
        });
        //options.callbacks.onDrawUpdate({positions: oSensorCLL, properties: oProperties, indices: []});
    };
    _.prototype.dcCircularRangeEditor = function (options)
    {
        var _self = this;
        var scene = this._scene;
        var tooltip = this._tooltip;
        var oRenderedGraphic;
        var oRectangle;
        var oSensorCLL;
        var oDrawItem = options.item;
        var oProperties = oDrawItem.properties || {};
        var oModifiers = oProperties.modifiers || {};
        var oSensorCPCallbacks = {};
        var oRangeCPCallbacks = {};
        var dSectorDistance;
        var markers;
        var iResentRangeAdded = [];
        var iRangeAddTS = 0;
        oDrawItem.properties = oProperties;
        //oDrawItem.id = options.id;

        var getRangeCP = function (iIndex)
        {
            return markers.findControlPoint("radius", "iRangeIndex", iIndex);
        };
        var renderGraphic = function ()
        {
            var oRenderModifiers = emp.helpers.copyObject(oModifiers);
            var oExtent = this.empCesium.getExtent();
            var sExtents = oExtent.west.toDeg() + "," + oExtent.south.toDeg() + "," + oExtent.east.toDeg() + "," + oExtent.north.toDeg();
            var sCoordinates = oSensorCLL.longitude.toDeg().toString() + "," + oSensorCLL.latitude.toDeg().toString();
            var oMaterial;
            var oRenderData;
            var cartographics = [oSensorCLL];
            oRenderModifiers[emp.typeLibrary.utils.milstd.StringModifiers.LINE_COLOR] = EmpCesiumConstants.selectionProperties.COLOR_HEX;
            //oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, "clampToGround", this.empCesium.getScale(), sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
            oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol2D(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, this.empCesium.canvas.width, this.empCesium.canvas.height, sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
            if (oRenderData && (typeof (oRenderData) === 'string'))
            {
                new emp.typeLibrary.Error({
                    level: emp.typeLibrary.Error.level.CATASTROPHIC,
                    message: "RenderSymbol2D return: " + oRenderData
                });
                return;
            }
            oMaterial = new _self.empCesium.ImageMaterialProperty();
            oMaterial.image = oRenderData.image;
            oMaterial.transparent = true;
            if (!Cesium.defined(oRenderData.west) || !Cesium.defined(oRenderData.south) || !Cesium.defined(oRenderData.east) || !Cesium.defined(oRenderData.north))
            {
                oRectangle = Cesium.Rectangle.fromCartographicArray(cartographics);
            }
            else
            {
                oRectangle = Cesium.Rectangle.fromDegrees(oRenderData.west.x, oRenderData.south.y, oRenderData.east.x, oRenderData.north.y);
            }
            if (oRenderedGraphic)
            {
                oRenderedGraphic.rectangle.material.image = oRenderData.image;
                _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
            }
            else
            {
                oRenderedGraphic = new _self.empCesium.Entity({
                    id: options.id,
                    selectable: true,
                    show: true,
                    rectangle: {
                        coordinates: getLatestRectangleCallbackProperty,
                        material: oMaterial
                    }
                });
                oRenderedGraphic.featureId = oDrawItem.featureId;
                oRenderedGraphic.coreId = oDrawItem.coreId;
                oRenderedGraphic.overlayId = oDrawItem.overlayId;
                oRenderedGraphic.symbolCode = oDrawItem.symbolCode;
                oRenderedGraphic._editMode = true;
                oRenderedGraphic.featureType = EmpCesiumConstants.featureType.ENTITY;
                oRenderedGraphic = _self.empCesium.viewer.entities.add(oRenderedGraphic);
            }
            for (var markerIndex = 0; markerIndex < markers._orderedBillboards.length; ++markerIndex)
            {
                markers._orderedBillboards[markerIndex].eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(_self.empCesium.viewer.camera.positionCartographic.height, _self.lastCameraHeight);
            }
            _self.lastCameraHeight = _self.empCesium.viewer.camera.positionCartographic.height;
            markers.setOnTop();
        }.bind(this);
        
        _self.empCesium.currentMultiPointEditorRenderGraphicFuction = renderGraphic;


        var getLatestRectangleCallbackProperty = new Cesium.CallbackProperty(function getRectangle(time, result)
        {
            return Cesium.Rectangle.clone(oRectangle, result);
        }, false);
        oSensorCPCallbacks = {
            oPrevCLL: oSensorCLL,
            dragHandlers: {
                onDragStart: function (data)
                {
                    oSensorCPCallbacks.oPrevCLL = data.position;
                    //oSensorCPCallbacks.oPrevCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCartesianPos);
                },
                onDrag: function (data)
                {
                    var oCP;
                    var oCLLCoord;
                    oSensorCLL = data.position;
                    //oSensorCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCartesianPos);
                    var dDist = oSensorCPCallbacks.oPrevCLL.distanceTo(oSensorCLL);
                    var dBrng = oSensorCPCallbacks.oPrevCLL.bearingTo(oSensorCLL);
                    // Convert to latlon
                    // Get the distance and bearing to the new position.
                    if (oRenderedGraphic)
                    {
                        var oRect = oRectangle;
                        //var oRect = oRenderedGraphic.rectangle;
                        var oSouthWest = new Cesium.Cartographic(oRect.west, oRect.south, 0);
                        var oNorthEast = new Cesium.Cartographic(oRect.east, oRect.north, 0);
                        oSouthWest.moveCoordinate(dBrng, dDist);
                        oNorthEast.moveCoordinate(dBrng, dDist);
//                       oRenderedGraphic.rectangle = new Cesium.Rectangle(oSouthWest.longitude, oSouthWest.latitude, oNorthEast.longitude, oNorthEast.latitude);
                        oRectangle = new Cesium.Rectangle(oSouthWest.longitude, oSouthWest.latitude, oNorthEast.longitude, oNorthEast.latitude);
                    }

                    for (var iIndex = 1; iIndex < markers.countBillboards(); iIndex++)
                    {
                        oCP = markers.getBillboard(iIndex);
                        oCLLCoord = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCP.position);
                        oCLLCoord.moveCoordinate(dBrng, dDist);
                        oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                    }
                    oSensorCPCallbacks.oPrevCLL = oSensorCLL;
                    _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                },
                onDragEnd: function (data)
                {
                    oSensorCLL = data.position;
                    //oSensorCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCartesianPos);
                    oSensorCPCallbacks.oPrevCLL = oSensorCLL;
                    options.callbacks.onDrawUpdate({positions: oSensorCLL, properties: oProperties, indices: [data.index]});
                }
            }
        };
        oRangeCPCallbacks = {
            hRenderTimer: undefined,
            oPrevCLL: undefined,
            dragHandlers: {
                onDragStart: function (data)
                {
                    oRangeCPCallbacks.oPrevCLL = data.position;
                    //oRangeCPCallbacks.oPrevCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCartesianPos);
                },
                onDrag: function (data)
                {
                    if (oRangeCPCallbacks.hRenderTimer)
                    {
                        clearTimeout(oRangeCPCallbacks.hRenderTimer);
                        oRangeCPCallbacks.hRenderTimer = undefined;
                    }
                    var iRangeIndex;
                    var dPrevDist = 0.0;
                    var dNextDist = Number.MAX_VALUE;
                    var oCP = markers.getBillboard(data.index);
                    var oCLLCoord = data.position;
                    //var oCLLCoord = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oCartesianPos);
                    var dMouseDist = Math.round(oSensorCLL.distanceTo(oCLLCoord));
                    var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
                    if (!oCP)
                    {
                        return;
                    }

                    iRangeIndex = oCP.cpData.iRangeIndex;
                    // Get the previous range if its not the first.
                    if (iRangeIndex > 0)
                    {
                        dPrevDist = aRangeList[iRangeIndex - 1];
                    }
                    // Get the next range if its not the last.
                    if (iRangeIndex < (aRangeList.length - 1))
                    {
                        dNextDist = aRangeList[iRangeIndex + 1];
                    }

                    if ((dMouseDist <= dPrevDist) || (dMouseDist >= dNextDist))
                    {
                        // The range can only be moved between the previous and next range.
                        oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oRangeCPCallbacks.oPrevCLL);
                        return;
                    }

                    aRangeList[iRangeIndex] = dMouseDist;
                    oCLLCoord = oSensorCLL.destinationPoint(0.0, dMouseDist);
                    oCP.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCLLCoord);
                    oRangeCPCallbacks.oPrevCLL = oCLLCoord;
                    oRangeCPCallbacks.hRenderTimer = setTimeout(function ()
                    {
                        oRangeCPCallbacks.hRenderTimer = undefined;
                        renderGraphic();
                    }, 0);
                    _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                },
                onDragEnd: function (data)
                {
                    options.callbacks.onDrawUpdate({positions: oSensorCLL, properties: oProperties, indices: [data.index]});
                }
            },
            onDoubleClick: function (iIndex, position)
            {
                if (oRangeCPCallbacks.hRenderTimer)
                {
                    clearTimeout(oRangeCPCallbacks.hRenderTimer);
                    oRangeCPCallbacks.hRenderTimer = undefined;
                }

                var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
                var oCP = markers.getBillboard(iIndex);
                if ((aRangeList.length === 1) || !oCP)
                {
                    // There must be at least 1 range.
                    return;
                }

                var iRangeIndex = oCP.cpData.iRangeIndex;
                aRangeList.splice(iRangeIndex, 1);
                oRangeCPCallbacks.hRenderTimer = setTimeout(function ()
                {
                    _self.muteHandlers(true);
                    oRangeCPCallbacks.hRenderTimer = undefined;
                    renderGraphic();
                    addControlPoints();
                    _self.muteHandlers(false);
                }, 0);
            }
        };
        this.startDrawing(
                function ()
                {
                    _self.muteHandlers(true);
                    // tooltip.setVisible(false);
                    removeAllCP();
                    if (mouseHandler)
                    {
                        mouseHandler.destroy();
                        mouseHandler = undefined;
                    }

                    if (oRenderedGraphic)
                    {
                        _self.empCesium.viewer.entities.remove(oRenderedGraphic);
                        if (oRenderedGraphic.rectangle)
                        {
                            if (oRenderedGraphic.rectangle.material)
                            {
                                oRenderedGraphic.rectangle.material.image = undefined;
                            }
                            oRenderedGraphic.rectangle = undefined;
                        }
                        oRenderedGraphic = undefined;
                    }
                }
        );
        markers = new _.BillboardGroup(this, defaultBillboard);
        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        var addNewRange = function (dRange)
        {
            var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            var iSize = aRangeList.length;
            var aNewRanges = [];
            for (var iIndex = 0; iIndex < iSize; iIndex++)
            {
                if (dRange < aRangeList[iIndex])
                {
                    aRangeList.splice(iIndex, 0, dRange);
                    aNewRanges.push(iIndex);
                    iRangeAddTS = Date.now();
                    break;
                }
            }

            if (iIndex === iSize)
            {
                aNewRanges.push(iIndex);
                iRangeAddTS = Date.now();
                aRangeList.push(dRange);
            }

            return {
                newRanges: aNewRanges
            };
        };
        var removeAllCP = function ()
        {
            if (markers)
            {
                while (markers.countBillboards() > 0)
                {
                    markers.removeBillboard(0);
                }
            }
        };
        var addControlPoints = function ()
        {
            var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            var iSize = aRangeList.length;
            var oCartesianCoord;
            var oCPCLLCoord;
            removeAllCP();
            // Add Sensor CP.
            oCartesianCoord = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oSensorCLL);
            markers.addControlPoint({
                position: oCartesianCoord,
                callbacks: oSensorCPCallbacks,
                cpType: "vertex"
            });
            for (var iIndex = 0; iIndex < iSize; iIndex++)
            {
                oCPCLLCoord = oSensorCLL.destinationPoint(0, aRangeList[iIndex]);
                oCartesianCoord = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCPCLLCoord);
                markers.addControlPoint({
                    position: oCartesianCoord,
                    callbacks: oRangeCPCallbacks,
                    cpType: "radius",
                    cpData: {
                        iRangeIndex: iIndex
                    }
                });
            }
            for (var markerIndex = 0; markerIndex < markers._orderedBillboards.length; ++markerIndex)
            {
                markers._orderedBillboards[markerIndex].eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(_self.empCesium.viewer.camera.positionCartographic.height, _self.lastCameraHeight);
            }
            _self.lastCameraHeight = _self.empCesium.viewer.camera.positionCartographic.height;
            markers.setOnTop();
            _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        };
        // Now wait for start
        mouseHandler.setInputAction(function (movement)
        {
            var firstClick = false;
            if (Cesium.defined(movement.position))
            {
                var oMousePos = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                var pickedObject = scene.pick(movement.position);
                if (pickedObject && (pickedObject.primitive instanceof Cesium.Billboard))
                {
                    // If the Dblclick happened over a Billboard or the collection ignore it.
                    return;
                }
                if (oMousePos)
                {
                    oMousePos = oMousePos.clone();
                    // first click
                    if (!oSensorCLL)
                    {
                        firstClick = true;
                        var currentExtent = this.empCesium.getExtent();
                        var centerCartographic = Cesium.Rectangle.center(currentExtent);
                        var widthCurrentView = currentExtent.height; //radians

                        // Sensor position.
                        oSensorCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oMousePos);
                        widthCurrentView = Cesium.Math.toDegrees(widthCurrentView); //degrees
                        widthCurrentView = widthCurrentView * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude)); // meters
                        dSectorDistance = Math.round(widthCurrentView / 4.0);
                        oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE] = [];
                    }
                    else
                    {
                        var oNewRangePosCLL = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oMousePos);
                        dSectorDistance = oSensorCLL.distanceTo(oNewRangePosCLL);
                    }

                    if (oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE].length > 2)
                    {
                        // Max of 3 ranges.
                        return;
                    }

                    var oNewData = addNewRange(dSectorDistance);
                    if (oNewData.newRanges instanceof Array)
                    {
                        for (var iIndex = 0; iIndex < oNewData.newRanges.length; iIndex++)
                        {
                            iResentRangeAdded.push(oNewData.newRanges[iIndex]);
                        }
                    }
                    options.callbacks.onDrawUpdate({positions: oSensorCLL, properties: oProperties, indices: (firstClick) ? [0] : []});
                    renderGraphic();
                    addControlPoints();
                    //tooltip.setVisible(false);
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.endPosition;
            if (Cesium.defined(position))
            {
                if (!oSensorCLL)
                {
                    //tooltip.showAt(position, "<p>Click to add first point</p>");
                }
            }
            iResentRangeAdded = [];
            iRangeAddTS = 0;
            _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        }.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        mouseHandler.setInputAction(function (movement)
        {
            var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            var position = movement.position;
            if (Cesium.defined(position))
            {
                var pickedObject = scene.pick(movement.position);
                if (pickedObject && (pickedObject.primitive instanceof Cesium.Billboard))
                {
                    // If the Dblclick happened over a Billboard or the collection ignore it.
                    return;
                }
                if (!oSensorCLL || (aRangeList.length === 0))
                {
                    return;
                }
                else
                {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian)
                    {
                        var iDeltaTS = Date.now() - iRangeAddTS;
                        if (iDeltaTS <= 500)
                        {
                            var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
                            iResentRangeAdded.sort(function (a, b)
                            {
                                return b - a;
                            });
                            for (var iIndex = 0; iIndex < iResentRangeAdded.length; iIndex++)
                            {
                                aRangeList.splice(iResentRangeAdded[iIndex], 1);
                            }
                            iRangeAddTS = 0;
                        }

                        //_self.stopDrawing();
                        if (typeof (options.callbacks.onDrawEnd) === 'function')
                        {
                            options.callbacks.onDrawEnd({
                                positions: oSensorCLL,
                                properties: oProperties,
                                indices: []
                            });
                        }
                        _self.muteHandlers(true);
                    }
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        var oCoordList = cesiumEngine.utils.convertGeoJsonCoordToCartographicList(oDrawItem.data);
        if (oCoordList && (oCoordList.length > 0))
        {
            oSensorCLL = oCoordList[0];
            oDrawItem.symbolCode = oDrawItem.data.symbolCode;
            oProperties = emp.helpers.copyObject(oDrawItem.properties);
            oModifiers = oProperties.modifiers || {};
            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
            oProperties.modifiers = oModifiers;
            var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            if (aRangeList.length === 0)
            {
                var currentExtent = this.empCesium.getExtent();
                var centerCartographic = Cesium.Rectangle.center(currentExtent);
                var widthCurrentView = currentExtent.height; //radians

                widthCurrentView = Cesium.Math.toDegrees(widthCurrentView); //degrees
                widthCurrentView = widthCurrentView * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude)); // meters
                dSectorDistance = Math.round(widthCurrentView / 4.0);
                aRangeList.push(dSectorDistance);
            }

            renderGraphic();
            addControlPoints();
            options.callbacks.onDrawStart({
                positions: oSensorCLL,
                properties: oProperties
            });
            // options.callbacks.onDrawUpdate({positions: oSensorCLL, properties: oProperties, indices: []});
        }
        else if (this.empCesium.drawData.coordinates && this.empCesium.drawData.coordinates.length === 1)
        {
            oProperties = emp.helpers.copyObject(oDrawItem.properties);
            oModifiers = oProperties.modifiers || {};
            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
            oProperties.modifiers = oModifiers;

            oSensorCLL = this.empCesium.drawData.coordinates[0];
            oDrawItem.symbolCode = this.empCesium.drawData.drawType;

            var aRangeList = oModifiers[emp.typeLibrary.utils.milstd.Modifiers.DISTANCE];
            if (aRangeList.length === 0)
            {
                var currentExtent = this.empCesium.getExtent();
                var centerCartographic = Cesium.Rectangle.center(currentExtent);
                var widthCurrentView = currentExtent.height; //radians

                widthCurrentView = Cesium.Math.toDegrees(widthCurrentView); //degrees
                widthCurrentView = widthCurrentView * emp.geoLibrary.getMetersPerDegAtLat(Cesium.Math.toDegrees(centerCartographic.latitude)); // meters
                dSectorDistance = Math.round(widthCurrentView / 4.0);
                aRangeList.push(dSectorDistance);
            }

            renderGraphic();
            addControlPoints();
            options.callbacks.onDrawStart({
                positions: oSensorCLL,
                properties: oProperties
            });
            //options.callbacks.onDrawUpdate({positions: oSensorCLL, properties: oProperties, indices: [0]});
        }
        else
        {
            oProperties = emp.helpers.copyObject(oDrawItem.properties);
            oModifiers = oProperties.modifiers || {};
            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
            oProperties.modifiers = oModifiers;
        }

        this.muteHandlers(false);

    };
    _.prototype.dcRouteEditor = function (options)
    {
        var _self = this;
        var scene = this._scene;
        var tooltip = this._tooltip;
        var oRenderedGraphic;
        var oRectangle;
        var oDrawItem = options.item;
        var oProperties = oDrawItem.properties || {};
        var oModifiers = oProperties.modifiers || {};
        var oCoordCPCallbacks = {};
        var oNewCPCallbacks = {};
        var markers;
        var iResentAdded = [];
        var iAddTS = 0;
        var hRenderTimer;
        var hAddEventTimer;
        var oAddIndexes = [];
        var oCoordList = cesiumEngine.utils.convertGeoJsonCoordToCartographicList(oDrawItem.data) || [];
        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        markers = new _.BillboardGroup(this, defaultBillboard);
        _self._editedSurface = {};
        _self._editedSurface._editMarkers = markers;
        oDrawItem.properties = oProperties;
        var renderGraphic = function ()
        {
            if (oCoordList.length < 3)
            {
                // We can't render with less than 3 points.
                return;
            }

            var oRenderModifiers = emp.helpers.copyObject(oModifiers);
            var oExtent = this.empCesium.getExtent();
            var sExtents = oExtent.west.toDeg() + "," + oExtent.south.toDeg() + "," + oExtent.east.toDeg() + "," + oExtent.north.toDeg();
            var sCoordinates = cesiumEngine.utils.convertCartographicCoordList2String(oCoordList);
            var oMaterial;
            var oRenderData;
            var cartographics = oCoordList;
            oRenderModifiers[emp.typeLibrary.utils.milstd.StringModifiers.LINE_COLOR] = EmpCesiumConstants.selectionProperties.COLOR_HEX;

            //oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, "clampToGround", this.empCesium.getScale(), sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
            oRenderData = sec.web.renderer.SECWebRenderer.RenderSymbol2D(oDrawItem.coreId, oDrawItem.name, "", oDrawItem.symbolCode, sCoordinates, this.empCesium.canvas.width, this.empCesium.canvas.height, sExtents, oRenderModifiers, EmpCesiumConstants.MultiPointRenderType.CANVAS, _self.empCesium.drawData.standard);
            if (oRenderData && (typeof (oRenderData) === 'string'))
            {
                new emp.typeLibrary.Error({
                    level: emp.typeLibrary.Error.level.CATASTROPHIC,
                    message: "RenderSymbol2D return: " + oRenderData
                });
                return;
            }
            oMaterial = new _self.empCesium.ImageMaterialProperty();
            oMaterial.image = oRenderData.image;
            oMaterial.transparent = true;
            if (!Cesium.defined(oRenderData.west) || !Cesium.defined(oRenderData.south) || !Cesium.defined(oRenderData.east) || !Cesium.defined(oRenderData.north))
            {
                oRectangle = Cesium.Rectangle.fromCartographicArray(cartographics);
            }
            else
            {
                oRectangle = Cesium.Rectangle.fromDegrees(oRenderData.west.x, oRenderData.south.y, oRenderData.east.x, oRenderData.north.y);
            }
            if (oRenderedGraphic)
            {
                oRenderedGraphic.rectangle.material.image = oRenderData.image;
                _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
            }
            else
            {
                oRenderedGraphic = new _self.empCesium.Entity({
                    id: options.id,
                    selectable: true,
                    show: true,
                    rectangle: {
                        coordinates: getLatestRectangleCallbackProperty,
                        material: oMaterial
                    }
                });
                oRenderedGraphic.featureId = oDrawItem.featureId;
                oRenderedGraphic.coreId = oDrawItem.coreId;
                oRenderedGraphic.overlayId = oDrawItem.overlayId;
                oRenderedGraphic.symbolCode = oDrawItem.symbolCode;
                oRenderedGraphic._editMode = true;
                oRenderedGraphic.featureType = EmpCesiumConstants.featureType.ENTITY;
                oRenderedGraphic = _self.empCesium.viewer.entities.add(oRenderedGraphic);
            }
            markers.setOnTop();
        }.bind(this);
        
        _self.empCesium.currentMultiPointEditorRenderGraphicFuction = renderGraphic;
        
        var getLatestRectangleCallbackProperty = new Cesium.CallbackProperty(function getRectangle(time, result)
        {
            return Cesium.Rectangle.clone(oRectangle, result);
        }, false);
        var reRenderTimerFn = function ()
        {
            hRenderTimer = undefined;
            renderGraphic();
        };
        var cancelRenderTimer = function ()
        {
            if (hRenderTimer)
            {
                clearTimeout(hRenderTimer);
                hRenderTimer = undefined;
            }
        };
        var startreRenderTimer = function (iMsec)
        {
            cancelRenderTimer();
            hRenderTimer = setTimeout(reRenderTimerFn, iMsec);
        };
        oCoordCPCallbacks = {
            dragHandlers: {
                onDragStart: function (data)
                {
                },
                onDrag: function (data)
                {
                    var iCoordIndex;
                    var oNewCoord;
                    var oCP;
                    cancelRenderTimer();
                    oCP = markers.getBillboard(data.index);
                    if (!oCP)
                    {
                        return;
                    }
                    oNewCoord = data.position;
                    iCoordIndex = oCP.cpData.iCoordIndex;

                    if (iCoordIndex === 0)
                    {
                        //recalculate last position in array after moving first position
                        if (oCoordList.length > 2)
                        {
                            var distanceFirstPositionToLastPosition = oCoordList[0].distanceTo(oCoordList[oCoordList.length - 1]);
                            var bearingNewFirstPositionToNextPosition = oNewCoord.bearingTo(oCoordList[1]);// degrees
                            var bearing = bearingNewFirstPositionToNextPosition - 35;
                            var newLastPosition = oNewCoord.destinationPoint(bearing, distanceFirstPositionToLastPosition);
                            oCP = markers.getBillboard(oCoordList.length - 1);
                            for (var index = 0; index < markers._orderedBillboards.length; index++)
                            {
                                var oCPLastPosition = markers.getBillboard(index);
                                if (oCPLastPosition.cpData.iCoordIndex === oCoordList.length - 1)
                                {
                                    oCPLastPosition.position = newLastPosition.toCartesian();
                                    break;
                                }
                            }
                            oCoordList[oCoordList.length - 1] = newLastPosition;
                        }
                        oCoordList[0] = oNewCoord;
                    }
                    else if (iCoordIndex === oCoordList.length - 1)
                    {

                        //restrict last position movement in array 
                        var distanceFirstPositionToLastPosition = oCoordList[0].distanceTo(oCoordList[oCoordList.length - 1]);
                        var distanceFirstPositionToNextPosition = oCoordList[0].distanceTo(oCoordList[1]);
                        var distanceFirstPositionToNewLastPosition = oCoordList[0].distanceTo(oNewCoord);
                        if (distanceFirstPositionToNewLastPosition > distanceFirstPositionToNextPosition * .75)
                        {
                            distanceFirstPositionToLastPosition = distanceFirstPositionToNextPosition * .75;
                        }
                        else
                        {
                            distanceFirstPositionToLastPosition = distanceFirstPositionToNewLastPosition;
                        }
                        //var bearingOldFirstPositionToLastPosition =  oCoordList[0].bearingTo(oCoordList[oCoordList.length - 1]);// degrees
                        var bearingFirstPositionToNextPosition = oCoordList[0].bearingTo(oCoordList[1]);// degrees
                        var bearing = bearingFirstPositionToNextPosition - 35;
                        var newLastPosition = oCoordList[0].destinationPoint(bearing, distanceFirstPositionToLastPosition);
                        oCoordList[oCoordList.length - 1] = newLastPosition;
                        oCP.position = newLastPosition.toCartesian();

                    }
                    else if (iCoordIndex === 1)
                    {
                        //recalculate last position in array after moving second position
                        var distanceFirstPositionToLastPosition = oCoordList[0].distanceTo(oCoordList[oCoordList.length - 1]);
                        var bearingFirstPositionToNewNextPosition = oCoordList[0].bearingTo(oNewCoord);// degrees
                        var bearing = bearingFirstPositionToNewNextPosition - 35;
                        var newLastPosition = oCoordList[0].destinationPoint(bearing, distanceFirstPositionToLastPosition);
                        //oCP = markers.getBillboard(oCoordList.length - 1);
                        for (var index = 0; index < markers._orderedBillboards.length; index++)
                        {
                            var oCPLastPosition = markers.getBillboard(index);
                            if (oCPLastPosition.cpData.iCoordIndex === oCoordList.length - 1)
                            {
                                oCPLastPosition.position = newLastPosition.toCartesian();
                                break;
                            }
                        }
                        oCoordList[oCoordList.length - 1] = newLastPosition;
                        oCoordList[iCoordIndex] = oNewCoord;
                    }
                    else
                    {
                        oCoordList[iCoordIndex] = oNewCoord;
                    }

                    addNewControlPoints();
                    startreRenderTimer(0);
                    _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                },
                onDragEnd: function (data)
                {
                    var iCoordIndex = 0;
                    var oCP;
                    var oNewCoordList;
                    var iIdx;
                    cancelRenderTimer();
                    oCP = markers.getBillboard(data.index);
                    if (oCP)
                    {
                        iCoordIndex = oCP.cpData.iCoordIndex;
                    }

                    oNewCoordList = [];
                    for (iIdx = 0; iIdx < oCoordList.length; iIdx++)
                    {
                        oNewCoordList.push(oCoordList[iIdx]);
                    }

                    options.callbacks.onDrawUpdate({
                        positions: oNewCoordList,
                        properties: oProperties,
                        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
                        indices: [iCoordIndex]
                    });
                    startreRenderTimer(0);
                }
            }
        };
        oNewCPCallbacks = {
            dragHandlers: {
                onDragStart: function (data)
                {
                },
                onDrag: function (data)
                {
                },
                onDragEnd: function (data)
                {
                    var iInsertIndex;
                    var oCP = markers.getBillboard(data.index);
                    if (!oCP)
                    {
                        return;
                    }

                    cancelRenderTimer();
                    iInsertIndex = oCP.cpData.iInsertIndex;
                    oCoordList.splice(iInsertIndex, 0, data.position);
                    oAddIndexes.push(iInsertIndex);
                    startAddEventTimer(0);
                    startreRenderTimer(0);
                    //recalculate and restrict last position (width control point location) movement in array 
                    var distanceFirstPositionToLastPosition = oCoordList[0].distanceTo(oCoordList[oCoordList.length - 1]);
                    var distanceFirstPositionToNextPosition = oCoordList[0].distanceTo(oCoordList[1]);
                    if (distanceFirstPositionToLastPosition > distanceFirstPositionToNextPosition * .75)
                    {
                        distanceFirstPositionToLastPosition = distanceFirstPositionToNextPosition * .75;
                    }
                    var bearingFirstPositionToNextPosition = oCoordList[0].bearingTo(oCoordList[1]);// degrees
                    var bearing = bearingFirstPositionToNextPosition - 35;
                    var newLastPosition = oCoordList[0].destinationPoint(bearing, distanceFirstPositionToLastPosition);
                    oCoordList[oCoordList.length - 1] = newLastPosition;
                    //startAddControlPointsTimer(10);
                    addControlPoints();
                }
            }
        };
        this.startDrawing(
                function ()
                {
                    _self.muteHandlers(true);
                    // tooltip.setVisible(false);
                    removeAllCP();
                    if (mouseHandler)
                    {
                        mouseHandler.destroy();
                        mouseHandler = undefined;
                    }

                    if (oRenderedGraphic)
                    {
                        _self.empCesium.viewer.entities.remove(oRenderedGraphic);
                        if (oRenderedGraphic.rectangle)
                        {
                            if (oRenderedGraphic.rectangle.material)
                            {
                                oRenderedGraphic.rectangle.material.image = undefined;
                            }
                            oRenderedGraphic.rectangle = undefined;
                        }
                        oRenderedGraphic = undefined;
                    }
                }
        );
        var removeAllCP = function ()
        {
            if (markers)
            {
                while (markers.countBillboards() > 0)
                {
                    markers.removeBillboard(0);
                }
            }
        };
        var removeNewCP = function ()
        {
            var oCP;
            var iIndex = 0;
            for (iIndex = 0; iIndex < markers.countBillboards(); )
            {
                oCP = markers.getBillboard(iIndex);
                if (oCP.category === 'new')
                {
                    markers.removeBillboard(iIndex);
                }
                else
                {
                    iIndex++;
                }
            }
        };
        var addNewControlPoints = function ()
        {
            var iIndex;
            var iPrevIndex = 0;
            var iLastIndex = oCoordList.length - 1;
            var oCartesianCoord;
            var oNewCoord;
            removeNewCP();
            if (oCoordList.length > 2)
            {
                for (iIndex = 1; iIndex < iLastIndex; iIndex++)
                {
                    oNewCoord = oCoordList[iPrevIndex].midpointTo(oCoordList[iIndex]);
                    oCartesianCoord = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oNewCoord);
                    markers.addControlPoint({
                        position: oCartesianCoord,
                        callbacks: oNewCPCallbacks,
                        cpType: "new",
                        cpData: {
                            iInsertIndex: iIndex
                        }
                    });
                    iPrevIndex = iIndex;
                }
            }
            for (var markerIndex = 0; markerIndex < markers._orderedBillboards.length; ++markerIndex)
            {
                markers._orderedBillboards[markerIndex].eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(_self.empCesium.viewer.camera.positionCartographic.height, _self.lastCameraHeight);
            }
            _self.lastCameraHeight = _self.empCesium.viewer.camera.positionCartographic.height;
            _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        };
        var addControlPoints = function ()
        {
            var iIndex;
            var oCartesianCoord;
            removeAllCP();
            // First Add the CP.
            for (iIndex = 0; iIndex < oCoordList.length; iIndex++)
            {
                oCartesianCoord = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oCoordList[iIndex]);
                markers.addControlPoint({
                    position: oCartesianCoord,
                    callbacks: oCoordCPCallbacks,
                    cpType: ((iIndex === oCoordList.length - 1) && (oCoordList.length > 1)) ? "width" : "vertex",
                    cpData: {
                        iCoordIndex: iIndex
                    }
                });
            }
            for (var markerIndex = 0; markerIndex < markers._orderedBillboards.length; ++markerIndex)
            {
                markers._orderedBillboards[markerIndex].eyeOffset = cesiumEngine.utils.getEyeOffsetControlPoint(_self.empCesium.viewer.camera.positionCartographic.height, _self.lastCameraHeight);
            }
            _self.lastCameraHeight = _self.empCesium.viewer.camera.positionCartographic.height;
            addNewControlPoints();
            markers.setOnTop();
            _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        };
        var startAddControlPointsTimer = function (iMSec)
        {
            setTimeout(addControlPoints, iMSec);
        };
        var addEventTimerFn = function ()
        {
            var iIdx;
            var oNewCoordList = [];
            for (iIdx = 0; iIdx < oCoordList.length; iIdx++)
            {
                oNewCoordList.push(oCoordList[iIdx]);
            }
            options.callbacks.onDrawUpdate({
                positions: oNewCoordList,
                properties: oProperties,
                type: emp.typeLibrary.CoordinateUpdateType.ADD,
                indices: oAddIndexes
            });
            oAddIndexes = [];
            iResentAdded = [];
            iAddTS = 0;
        };
        var startAddEventTimer = function (iMSec)
        {
            if (hAddEventTimer)
            {
                clearTimeout(hAddEventTimer);
                hAddEventTimer = undefined;
            }

            hAddEventTimer = setTimeout(addEventTimerFn, iMSec);
        };
        var stopAddEventTimer = function ()
        {
            if (hAddEventTimer)
            {
                clearTimeout(hAddEventTimer);
                hAddEventTimer = undefined;
            }
        };
        // Now wait for start
        mouseHandler.setInputAction(function (movement)
        {
            var oNewCoord;
            var iIndex;
            if (Cesium.defined(movement.position))
            {
                var oMousePos = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                var pickedObject = scene.pick(movement.position);
                if (pickedObject && (pickedObject.primitive instanceof Cesium.Billboard))
                {
                    // If the click happened over a Billboard or the collection ignore it.
                    return;
                }
                if (oMousePos)
                {
                    oNewCoord = Cesium.Ellipsoid.WGS84.cartesianToCartographic(oMousePos);
                    iIndex = oCoordList.length;
                    if (iIndex >= 3)
                    {
                        //recalculate last position in array
                        var distanceFirstPositionToLastPosition = oCoordList[0].distanceTo(oCoordList[oCoordList.length - 1]);
                        var distanceNewPositionToOldFirstPosition = oNewCoord.distanceTo(oCoordList[0]);
                        if (distanceNewPositionToOldFirstPosition < distanceFirstPositionToLastPosition)
                        {
                            distanceFirstPositionToLastPosition = distanceNewPositionToOldFirstPosition * .75;
                        }
                        else
                        {
                            distanceFirstPositionToLastPosition = distanceNewPositionToOldFirstPosition / 3;
                        }
                        var bearingOldFirstPositionToLastPosition = oCoordList[0].bearingTo(oCoordList[oCoordList.length - 1]);// degrees
                        var bearingNewFirstPositionToOldFirstPosition = oNewCoord.bearingTo(oCoordList[0]);// degrees
                        var bearing = bearingNewFirstPositionToOldFirstPosition - 35;
                        var newLastPosition = oNewCoord.destinationPoint(bearing, distanceFirstPositionToLastPosition);
                        oCoordList.splice(oCoordList.length - 1, 1, newLastPosition);
                        //var oldBearingFirstPositionToLastPosition = oCoordList[0].bearingTo(oCoordList[oCoordList.length - 1]);// degrees
                        // If there is already 3 or more, insert into the
                        // first position to obtain the desired effect of extending the arrow head to the clicked location.
                        // iIndex--;
                        oCoordList.splice(0, 0, oNewCoord);
                    }
                    else if (iIndex === 0)
                    {
//                        // auto  render a default  axis of advance
                        oCoordList.push(oNewCoord);
                    }
                    else if (iIndex === 1)
                    {
//                        // auto  render a default  axis of advance
                        oCoordList.splice(0, 0, oNewCoord);
                        var distanceFirstPositionToSecondPosition = oCoordList[0].distanceTo(oCoordList[1]);
                        var bearingFirstPositionToSecondPosition = oCoordList[0].bearingTo(oCoordList[1]);// degrees
                        var bearing = bearingFirstPositionToSecondPosition - 35;
                        var newLastPosition = oCoordList[0].destinationPoint(bearing, distanceFirstPositionToSecondPosition / 4);
                        oCoordList.push(newLastPosition);
                    }
                    iAddTS = Date.now();
                    iResentAdded.push(iIndex);
                    oAddIndexes.push(iIndex);
                    startAddEventTimer(500);
                    renderGraphic();
                    addControlPoints();
                    // tooltip.setVisible(false);
//console.log("Add Click index:" + iIndex + " Cnt:" + oCoordList.length);
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        mouseHandler.setInputAction(function (movement)
        {
            var position = movement.endPosition;
            if (Cesium.defined(position))
            {
                if (oCoordList.length === 0)
                {
                    //tooltip.showAt(position, "<p>Click to add first point</p>");
                }
                else if (oCoordList.length === 1)
                {
                    // tooltip.showAt(position, "<p>Click to add second point</p>");
                }
                else if (oCoordList.length === 2)
                {
                    //tooltip.showAt(position, "<p>Click to add the width point</p>");
                }
            }
            iResentAdded = [];
            iAddTS = 0;
            _self.empCesium.viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
        }.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        mouseHandler.setInputAction(function (movement)
        {
            var iIndex;
            var position = movement.position;
            if (Cesium.defined(position))
            {
                var pickedObject = scene.pick(movement.position);
                if (pickedObject && (pickedObject.primitive instanceof Cesium.Billboard))
                {
                    // If the Dblclick happened over a Billboard (CP).  See if we can delete it.
                    var oNewCoordList;
                    var iCoordIndex;
                    var oCP = pickedObject.primitive;
                    var iIdx;
                    if (oCoordList.length <= 3)
                    {
                        // If there is 3 or less coordiantes do not allow deletes.
                        return;
                    }

                    cancelRenderTimer();
                    if (!oCP)
                    {
                        return;
                    }

                    iCoordIndex = oCP.cpData.iCoordIndex;
                    if ((iCoordIndex === 0) || (iCoordIndex === (oCoordList.length - 1)))
                    {
                        // We don't allow the user to delete the first or the width point which is the last.
                        return;
                    }

                    iIdx = iResentAdded.indexOf(iCoordIndex);
                    if (iIdx === -1)
                    {
                        oCoordList.splice(iCoordIndex, 1);
                        oNewCoordList = [];
                        for (iIdx = 0; iIdx < oCoordList.length; iIdx++)
                        {
                            oNewCoordList.push(oCoordList[iIdx]);
                        }

                        options.callbacks.onDrawUpdate({
                            positions: oNewCoordList,
                            properties: oProperties,
                            type: emp.typeLibrary.CoordinateUpdateType.REMOVE,
                            indices: [iCoordIndex]
                        });
                        startreRenderTimer(0);
                        //recalculate and restrict last position (width control point location) movement in array 
                        var distanceFirstPositionToLastPosition = oCoordList[0].distanceTo(oCoordList[oCoordList.length - 1]);
                        var distanceFirstPositionToNextPosition = oCoordList[0].distanceTo(oCoordList[1]);
                        if (distanceFirstPositionToLastPosition > distanceFirstPositionToNextPosition * .75)
                        {
                            distanceFirstPositionToLastPosition = distanceFirstPositionToNextPosition * .75;
                        }
                        var bearingFirstPositionToNextPosition = oCoordList[0].bearingTo(oCoordList[1]);// degrees
                        var bearing = bearingFirstPositionToNextPosition - 35;
                        var newLastPosition = oCoordList[0].destinationPoint(bearing, distanceFirstPositionToLastPosition);
                        oCoordList[oCoordList.length - 1] = newLastPosition;
                        addControlPoints();
//console.log("CP Dbl Click index:" + iCoordIndex + " Cnt:" + oCoordList.length);
                        return;
                    }
//console.log("CP Dbl Click index on list:" + iCoordIndex + " Cnt:" + oCoordList.length);
                }

                if (hRenderTimer)
                {
                    // An operation scheduled a reRender. So we cancel it.
                    cancelRenderTimer();
                }

                var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                if (cartesian)
                {
                    var iDeltaTS = Date.now() - iAddTS;
                    if (iDeltaTS <= 500)
                    {
                        iResentAdded.sort(function (a, b)
                        {
                            return b - a;
                        });
                        for (iIndex = 0; iIndex < iResentAdded.length; iIndex++)
                        {
                            oCoordList.splice(iResentAdded[iIndex], 1);
                        }
                        iAddTS = 0;
                    }

                    if (oCoordList.length < 3)
                    {
                        // We need at least 3 points.
                        startreRenderTimer(0);
                        addControlPoints();
                        return;
                    }
//console.log("Exit DblClick Cnt:" + oCoordList.length);
                    stopAddEventTimer();
                    if (typeof (options.callbacks.onDrawEnd) === 'function')
                    {
                        options.callbacks.onDrawEnd({
                            positions: oCoordList,
                            properties: oProperties,
                            indices: []
                        });
                    }
                    _self.muteHandlers(true);
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        if (oCoordList && (oCoordList.length > 0))
        {
            oDrawItem.symbolCode = oDrawItem.data.symbolCode;
            oProperties = emp.helpers.copyObject(oDrawItem.properties);
            oModifiers = oProperties.modifiers || {};
            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
            oProperties.modifiers = oModifiers;
            renderGraphic();
            addControlPoints();
        }
        else if (this.empCesium.drawData.coordinates && this.empCesium.drawData.coordinates.length === 1)
        {
            oCoordList.splice(0, 0, this.empCesium.drawData.coordinates[0]);
            oProperties = emp.helpers.copyObject(oDrawItem.properties);
            oModifiers = oProperties.modifiers || {};
            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
            oProperties.modifiers = oModifiers;

            oDrawItem.symbolCode = this.empCesium.drawData.drawType;
            oProperties.modifiers = oModifiers;
            renderGraphic();
            addControlPoints();

        }
        else if (this.empCesium.drawData.coordinates && this.empCesium.drawData.coordinates.length >= 2)
        {
            oCoordList = this.empCesium.drawData.coordinates.slice(0); //clone array
            var distanceFirstPositionToSecondPosition = oCoordList[0].distanceTo(oCoordList[1]);
            var bearingFirstPositionToSecondPosition = oCoordList[0].bearingTo(oCoordList[1]);// degrees
            var bearing = bearingFirstPositionToSecondPosition - 35;
            var newLastPosition = oCoordList[0].destinationPoint(bearing, distanceFirstPositionToSecondPosition / 4);
            oCoordList.push(newLastPosition);

            oProperties = emp.helpers.copyObject(oDrawItem.properties);
            oModifiers = oProperties.modifiers || {};
            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
            oProperties.modifiers = oModifiers;

            oDrawItem.symbolCode = this.empCesium.drawData.drawType;
            oProperties.modifiers = oModifiers;
            renderGraphic();
            addControlPoints();
        }
        else
        {
            oModifiers = emp.typeLibrary.utils.milstd.convertStringsToModifiers(oModifiers);
            oProperties.modifiers = oModifiers;
        }

        this.muteHandlers(false);
        options.callbacks.onDrawStart({
            positions: oCoordList,
            properties: oProperties,
            indices: []
        });
//        options.callbacks.onDrawUpdate({
//            positions: oCoordList,
//            properties: oProperties,
//            type: emp.typeLibrary.CoordinateUpdateType.REMOVE,
//            indices: []
//        });
    };
    return _;
})();
