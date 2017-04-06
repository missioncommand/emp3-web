var EMPWorldWind = EMPWorldWind || {};
EMPWorldWind.editors = EMPWorldWind.editors || {};

/**
 * @classdesc The EditorController handles all drawing, editing, and updating of features
 * @class
 */
EMPWorldWind.editors.EditorController = (function() {
    /**
     * @param {emp.typeLibrary.Feature} feature
     * @param {object} modifiers
     * @param {SelectionStyle} selectionStyle
     * @returns {WorldWind.Placemark}
     * @private
     */
    function _constructSinglePointMilStdSymbol(feature, modifiers, selectionStyle) {
        var placemark, attributes, highlightAttributes, position, imageInfo, imageCenter, imageBounds, imageOffset,
            selectedImage, symbolCode, selectedModifiers,
            eyeDistanceScaling = false;

        attributes = new WorldWind.PlacemarkAttributes();

        // TODO pass in leaderline settings by feature or via config object
        // Leaderline settings
        attributes.drawLeaderLine = true;
        attributes.leaderLineAttributes.outlineColor = WorldWind.Color.RED;

        if (feature.singlePointAltitudeRangeMode === EMPWorldWind.constants.SinglePointAltitudeRangeMode.HIGHEST_RANGE) {
            // Optimization
            attributes.imageScale = 1;
            attributes.imageSource = EMPWorldWind.utils.selectHighAltitudeRangeImage(feature.symbolCode);
            highlightAttributes = new WorldWind.PlacemarkAttributes();
            highlightAttributes.imageColor = WorldWind.Color.WHITE;
            highlightAttributes.imageSource = attributes.imageSource;
        } else {

            if ((this.singlePointAltitudeRangeMode === EMPWorldWind.constants.SinglePointAltitudeRangeMode.MID_RANGE) && feature.symbolCode) {
                // do not display country code
                symbolCode = feature.symbolCode.substr(0, 12) + "--" + feature.symbolCode.substr(14);
            } else {
                // display country code
                symbolCode = feature.symbolCode;
            }
            // Render
            imageInfo = armyc2.c2sd.renderer.MilStdIconRenderer.Render(symbolCode, modifiers);
            imageCenter = imageInfo.getCenterPoint();
            imageBounds = imageInfo.getImageBounds();

            // Calculate offset
            imageOffset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, imageCenter.x / imageBounds.width,
                WorldWind.OFFSET_FRACTION, 1 - (imageCenter.y / imageBounds.height)
            );

            attributes.imageScale = 1;
            attributes.imageOffset = imageOffset;
            attributes.imageSource = imageInfo.toDataUrl();

            // Highlight attributes
            highlightAttributes = new WorldWind.PlacemarkAttributes(attributes);
            highlightAttributes.imageColor = WorldWind.Color.WHITE;
            highlightAttributes.imageOffset = imageOffset;
            highlightAttributes.imageScale = this.state.selectionStyle.scale;

            // Note that this is done statically, if the selection style changes a bulk update to every feature will need to be done
            selectedModifiers = Object.assign({}, modifiers);
            selectedModifiers.LINECOLOR = selectionStyle.lineColor;
            selectedModifiers.FILLCOLOR = selectionStyle.fillColor;
            selectedImage = armyc2.c2sd.renderer.MilStdIconRenderer.Render(feature.symbolCode, selectedModifiers).toDataUrl();
            highlightAttributes.imageSource = selectedImage;
        }

        position = new WorldWind.Position(
            feature.data.coordinates[1],
            feature.data.coordinates[0],
            EMPWorldWind.utils.defined(feature.data.coordinates[2]) ? feature.data.coordinates[2] : 0);

        placemark = new WorldWind.Placemark(position, eyeDistanceScaling);
        placemark.alwaysOnTop = true;
        placemark.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
        placemark.attributes = new WorldWind.PlacemarkAttributes(attributes);
        placemark.highlightAttributes = new WorldWind.PlacemarkAttributes(highlightAttributes);

        return placemark;
    }

    /**
     *
     * @param {emp.typeLibrary.Feature} feature
     * @param {object} modifiers
     * @param {SelectionStyle} selectionStyle
     * @returns {WorldWind.SurfaceShape[]}
     * @private
     */
    function _constructMultiPointMilStdFeature(feature, modifiers) {
        var bbox, bounds, scale, featureCoords,
            i, data = {},
            positions = "",
            shapes = [];

        // Generate position string
        featureCoords = feature.data.coordinates.join().split(",");
        for (i = 0; i < featureCoords.length; i += 2) {
            positions += featureCoords[i] + "," + featureCoords[i + 1] + " ";
        }
        positions = positions.trim();

        // Convert bounds to bbox
        bounds = this.getBounds();
        bbox = bounds.west + "," + bounds.south + "," + bounds.east + "," + bounds.north;

        // Calculate the approximate scale
        scale = EMPWorldWind.utils.boundsWidth(bounds) >> 2;

        data.batch = [];
        data.scale = scale;
        // if (this.isSkyWithinMapVisibleArea())
        //    {
        //     data.bbox = null; //"-180,-90,180,90"; //max rectangle;
        // }
        //  else
        //  {
        data.bbox = bbox;
        //     }
        data.format = EMPWorldWind.constants.MultiPointRenderType.GEOJSON;
        data.pixelHeight = this.worldWindow.canvas.clientHeight;
        data.pixelWidth = this.worldWindow.canvas.clientWidth;
        //data.altMode = WorldWind.CLAMP_TO_GROUND;
        //data.pixelHeight = this.canvas.height;
        //data.pixelWidth = this.canvas.width;
        //data.altMode = "clampToGround";
        // data.converter = this.cesiumConverter;
        //data.symstd = standard;
        data.fontInfo = EMPWorldWind.utils.getFontInfo("arial", 10, "bold");
        //sceneInfo.canvasClientWidth = this.canvas.width;
        //sceneInfo.canvasClientHeight = this.canvas.height;
        //sceneInfo.drawingBufferWidth = this.viewer.scene.drawingBufferWidth;
        //sceneInfo.drawingBufferHeight = this.viewer.scene.drawingBufferHeight;
        data.worldWindow = {};
        //data.worldWindow.drawContext  = this.worldWindow.drawContext;
        data.worldWindow.globe = this.worldWindow.globe;
        //data.cameraInfo = cameraInfo;
        //data.sceneInfo.mapProjectionEllipsoid = this.ellipsoid;
        //data.cameraInfo = this.saveCamera(this.viewer.camera);
        //data.sceneInfo.frameState = {};
        //data.sceneInfo.frameState.mode = this.viewer.scene.frameState.mode;
        //data.sceneInfo.frameState.morphTime = this.viewer.scene.frameState.morphTime;

        modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.GeoJSONFormat] = 1; // 0 for string geojson, 1 for object geojson
        var batchObject = {};
        batchObject.id = feature.coreId;
        batchObject.name = feature.name;
        batchObject.description = unescape(feature.description);
        batchObject.symbolID = feature.symbolCode;
        batchObject.scale = scale; //scale;
        batchObject.bbox = data.bbox;
        batchObject.modifiers = modifiers;
        batchObject.format = EMPWorldWind.constants.MultiPointRenderType.GEOJSON;
        batchObject.symstd = 1; //TODO remove this harcoding of synstd    1;//1=2525C, 0=2525Bch2
        batchObject.fontInfo = EMPWorldWind.utils.getFontInfo("arial", 10, "bold");
        batchObject.altMode = WorldWind.CLAMP_TO_GROUND;
        batchObject.points = positions;
        data.batch[0] = batchObject;
        //call sec renderer worker
        this.secRendererWorker.A.postMessage(data);
        //return empty shapes for now. The worker will add the shapes to the feature in a asynchronous way.
        return shapes;
        }

        /**
         * Requires access to the current scope ie .bind .call .apply
         *
         * @param {emp.typeLibrary.Feature} feature
         */
        function processModifiers(feature) {
            var modifiers, enhancedModifiers, override, lowRangeMode;
            if (feature.data.type === "Point") {
                modifiers = EMPWorldWind.utils.milstd.updateModifierLabels(
                    feature.properties,
                    feature.name,
                    this.state.labelStyles, // Single-point shows symbols based on settings
                    this.state.pixelSize);
            } else {
                modifiers = EMPWorldWind.utils.milstd.updateModifierLabels(
                    feature.properties,
                    feature.name,
                    EMPWorldWind.constants.AllLabels, // Multi-point always shows symbols
                    this.state.pixelSize);
            }

            lowRangeMode = feature.singlePointAltitudeRangeMode === EMPWorldWind.constants.SinglePointAltitudeRangeMode.LOW_RANGE;
            modifiers = EMPWorldWind.utils.milstd.convertModifierStringTo2525(modifiers, ((this.state.labelStyles.CN === true) && lowRangeMode));
            //modifiers = EMPWorldWind.utils.milstd.convertModifierStringTo2525(modifiers, true);

            enhancedModifiers = EMPWorldWind.utils.milstd.checkForRequiredModifiers(feature);

            for (override in enhancedModifiers) {
                if (enhancedModifiers.hasOwnProperty(override)) {
                    modifiers[override] = enhancedModifiers[override];
                }
            }

            return modifiers;
        }

        /**
         * Requires access to the current scope.
         * ie .bind .call .apply
         *
         * @param {emp.typeLibrary.Feature} feature
         * @param {SelectionStyle} selectionStyle
         * @returns {WorldWind.SurfaceShape[]}
         */
        function constructMilStdSymbol(feature, selectionStyle) {
            var modifiers, shapes = [];

            // Process the modifiers
            modifiers = processModifiers.call(this, feature);

            if (feature.data.type === "Point") {
                shapes.push(_constructSinglePointMilStdSymbol.call(this, feature, modifiers, selectionStyle));
            } else if (feature.data.type === "LineString") {
                // Requires access to the WorldWindow navigator, bind to the current scope
                shapes = shapes.concat(_constructMultiPointMilStdFeature.call(this, feature, modifiers, selectionStyle));
            } else {
                // TODO alert the user more gracefully that the type is unhandled
                window.console.error("Unhandled feature type: " + feature.data.type + " in EMPWorldWind");
            }

        return shapes;
    }

    /**
     * Async function
     * @param {emp.typeLibrary.Feature} feature
     * @param {PlotFeatureCB} callback
     * @this EMPWorldWind.Map
     */
    function asyncPlotKMLFeature(feature, callback) {
        var url, kmlFilePromise, kmlLayer, wwFeature,
            rc = {
                success: false
            };

        // Convert the kml string to a data url
        url = "data:text/xml," + encodeURIComponent(feature.data);

        // Build the KML file promise
        kmlFilePromise = new WorldWind.KmlFile(url);
        kmlFilePromise
            .then(function(kmlFile) {
                // Construct the KML layer to hold the document
                kmlLayer = new WorldWind.RenderableLayer(feature.coreId);

                // Add the KML layer to the map
                kmlLayer.addRenderable(kmlFile);
                this.worldWindow.addLayer(kmlLayer);

                // Use the standard data holder to keep track of the layer
                wwFeature = new EMPWorldWind.data.EmpFeature(feature);
                wwFeature.addShapes(kmlLayer); // This isn't a WW primitive but use it as if it was

                // Record the layer so we can remove/modify it later
                this.layers[feature.coreId] = kmlLayer;

                // Configure the callback args
                rc.success = true;
                rc.feature = wwFeature;

                // Fire the callback
                callback(rc);
            }.bind(this));
    }

    return {
        /**
         * Creates a new EMPWorldWind feature and associated WorldWind features from an EMP feature and adds it to the map
         *
         * @param {emp.typeLibrary.Feature} empFeature
         * @param {PlotFeatureCB} callback Callback to be invoked on completion
         * @this EMPWorldWind.Map
         */
        plotFeature: function(empFeature, callback) {
            var wwFeature, layer, buildShapes, shapes;

            var rc = {
                message: "",
                success: true,
                feature: undefined
            };

            switch (empFeature.format) {
                case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
                    buildShapes = EMPWorldWind.editors.primitiveBuilders.constructAirControlMeasure;
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
                    buildShapes = EMPWorldWind.editors.primitiveBuilders.constructSurfaceCircle;
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
                    buildShapes = EMPWorldWind.editors.primitiveBuilders.constructSurfaceEllipse;
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
                    buildShapes = constructMilStdSymbol.bind(this);
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
                    buildShapes = EMPWorldWind.editors.primitiveBuilders.constructSurfacePolyline;
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
                    buildShapes = EMPWorldWind.editors.primitiveBuilders.constructPlacemark;
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
                    buildShapes = EMPWorldWind.editors.primitiveBuilders.constructSurfacePolygon;
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
                case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
                    buildShapes = EMPWorldWind.editors.primitiveBuilders.constructSurfaceRectangle;
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
                    buildShapes = EMPWorldWind.editors.primitiveBuilders.constructText;
                    break;
                case emp3.api.enums.FeatureTypeEnum.KML:
                    // KML is not supported as native primitives in WorldWind
                    // TODO KML selection, not sure how to support it or represent it
                    return asyncPlotKMLFeature.call(this, empFeature, callback);
                default:
                    rc.success = false;
                    rc.message = "Missing feature constructor for format: " + empFeature.format;
            }

            // Check if we have a builder for standard primitives
            if (!rc.success) {
                callback(rc);
                return;
            }
            // construct the feature
            wwFeature = new EMPWorldWind.data.EmpFeature(empFeature);
            wwFeature.singlePointAltitudeRangeMode = EMPWorldWind.utils.getSinglePointAltitudeRangeMode(this.worldWindow.navigator.range, this.singlePointAltitudeRanges);
            empFeature.singlePointAltitudeRangeMode = wwFeature.singlePointAltitudeRangeMode;
            empFeature.range = this.worldWindow.navigator.range;
            // Add the feature to the layer
            layer = this.getLayer(empFeature.parentCoreId);
            // Build the primitives
            // next call is  asynchronized for the case of mil std multipoints so shapes is initially an empty aray. (SEC renderer worker)
            shapes = buildShapes(empFeature, this.state.selectionStyle);
            wwFeature.addShapes(shapes);
            layer.addFeature(wwFeature);
            // Configure the callback params
            rc.feature = wwFeature;
            rc.success = true;
            // Fire the callback
            callback(rc);
        },
        /**
         * Updates a WorldWind Renderable object on the map and returns the updated objects in the response
         * @param {EMPWorldWind.data.EmpFeature} wwFeature
         * @param {emp.typeLibrary.Feature} empFeature
         * @param {PlotFeatureCB} callback
         * @this EMPWorldWind.Map
         */
        updateFeature: function(wwFeature, empFeature, callback) {
            var layer,
                rc = {
                    success: true,
                    message: "",
                    feature: wwFeature
                };

            // Remove existing primitives from the map
            if (empFeature.format !== emp3.api.enums.FeatureTypeEnum.KML) {
                layer = this.getLayer(empFeature.parentCoreId);
                empFeature.singlePointAltitudeRangeMode = wwFeature.singlePointAltitudeRangeMode;
                layer.removeFeature(wwFeature);
            } else {
                // Handle KML
                this.worldWindow.removeLayer(this.layers[empFeature.coreId]);
            }

            // Clear the primitives from the feature
            wwFeature.clearShapes();

            switch (empFeature.format) {
                case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
                    wwFeature.singlePointAltitudeRangeMode = EMPWorldWind.utils.getSinglePointAltitudeRangeMode(this.worldWindow.navigator.range, this.singlePointAltitudeRanges);
                    empFeature.singlePointAltitudeRangeMode = wwFeature.singlePointAltitudeRangeMode;
                    wwFeature.addShapes(constructMilStdSymbol.call(this, empFeature, this.state.selectionStyle));
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
                    wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructAirControlMeasure(empFeature, this.state.labelStyles));
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
                    wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructSurfaceCircle(empFeature, this.state.labelStyles));
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
                    wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructSurfaceEllipse(empFeature, this.state.labelStyles));
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
                    wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructSurfacePolyline(empFeature, this.state.labelStyles));
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
                    wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructPlacemark(empFeature, this.state.labelStyles));
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
                    wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructSurfacePolygon(empFeature, this.state.labelStyles));
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
                case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
                    wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructSurfaceRectangle(empFeature, this.state.labelStyles));
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
                    wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructText(empFeature, this.state.labelStyles));
                    break;
                case emp3.api.enums.FeatureTypeEnum.KML:
                    // KML is not supported as native primitives in WorldWind
                    return asyncPlotKMLFeature.call(this, empFeature, callback);
                default:
                    rc.success = false;
                    rc.message = "Missing feature constructor for format: " + empFeature.format;
            }

            // Redraw the new shapes
            if (rc.success) {
                // tag empFeature with current range.
                empFeature.range = this.worldWindow.navigator.range;
                // Update the empFeature stored in the wwFeature
                wwFeature.feature = empFeature;
                wwFeature.selected = this.isFeatureSelected(wwFeature.id);

                // Update the layer
                layer.addFeature(wwFeature);

                // Setup the return
                rc.feature = wwFeature;
            }
            callback(rc);
        },
        /**
         *
         * @param {EMPWorldWind.data.EmpFeature} wwFeature
         * @this EMPWorldWind.Map
         */
        updateFeatureLabelStyle: function(wwFeature) {
            var shapes,
                empLayer = this.getLayer(wwFeature.feature.parentCoreId);

            switch (wwFeature.feature.format) {
                case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
                    empLayer.removeFeature(wwFeature);
                    wwFeature.clearShapes();
                    shapes = constructMilStdSymbol.call(this, wwFeature.feature, this.state.selectionStyle);
                    wwFeature.addShapes(shapes);
                    empLayer.addFeature(wwFeature);
                    break;
                case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
                case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
                case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
                case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
                case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
                case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
                case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
                case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
                case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
                default:
                    // do nothing
            }
        }
    };
})();
