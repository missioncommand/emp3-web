
/* global cmapi */

var emp = window.emp || {};
emp.mapGridLines = emp.mapGridLines || {};

emp.mapGridLines.privateClass = function() {
    var MAIN_GRID_TYPE_LABEL = "MAIN.gridtype.label";

    var publicInterface = {
        initialize: function() {
            var oOptions;
            
            oOptions = {
                metersPerPixel: 0,
                boundsPixelWidth: 0,
                boundsPixelHeight: 0,
                strokeStyleHash: new emp.utilities.Hash(),
                labelStyleHash: new emp.utilities.Hash()
            };
            
            emp.classLibrary.Util.setOptions(this, oOptions);
            
            loadStyles();
        },
        getBoundsPixelWidth: function() {
            return this.options.boundsPixelWidth;
        },
        getBoundsPixelHeight: function() {
            return this.options.boundsPixelHeight;
        },
        getMetersPerPixel: function() {
            return this.options.metersPerPixel;
        },
        loadStyles: function() {
            var color;
            var outlineColor;
            var labelStyle;

            // Main Grid Label
            color = new cmapi.IGeoColor({
                alpha: 1.0,
                red: 200,
                green: 200,
                blue: 200
            });
            outlineColor = new cmapi.IGeoColor({
                alpha: 1.0,
                red: 0,
                green: 0,
                blue: 0
            });
            labelStyle = cmapi.IGeoLabelStyle({
                color: color,
                outlineColor: outlineColor,
                size: 8.0,
                justification: cmapi.enums.justification.CENTER,
                fontFamily: "Ariel",
                typeface: cmapi.enums.typeface.BOLD
            });
            this.addLabelStyle(MAIN_GRID_TYPE_LABEL, labelStyle);
        },
        addLabelStyle: function(styleType, labelStyle) {
            this.options.labelStyleHash.setItem(styleType, labelStyle);
        },
        containsLabelStyle: function(styleType) {
            return this.options.labelStyleHash.hasItem(styleType);
        },
        getLabelStyle: function(styleType) {
            if (this.options.labelStyleHash.hasItem(styleType)) {
                return this.options.labelStyleHash.getItem(styleType);
            }
            
            return null;
        },
        addStrokeStyle: function(styleType, strokeStyle) {
            this.options.strokeStyleHash.setItem(styleType, strokeStyle);
        },
        containsStrokeStyle: function(styleType) {
            return this.options.strokeStyleHash.hasItem(styleType);
        },
        getStrokeStyle: function(styleType) {
            if (this.options.strokeStyleHash.hasItem(styleType)) {
                return this.options.strokeStyleHash.getItem(styleType);
            }
            
            return null;
        },
        setLastUpdated: function() {
            var now = new Date();
            
            this.options.lastUpdated = now.getTime();
        },
        addFeature: function(feature) {
            this.option.featureList.push(feature);
            this.setLastUpdated();
        },
        clearFeatureList: function() {
            this.option.featureList = [];
            this.setLastUpdated();
        },
        shutdownGenerator: function() {
        },
        processViewChange: function(mapExtent) {
        },
        mapViewChange: function(mapEngine, viewData) {
            var viewWidthInMeters;
            var westPoint;
            var eastPoint;
            var centerWest;
            var centerEast;
            var northPoint;
            var southPoint;
            var centerNorth;
            var centerSouth;
            var southWest;
            var northEast;
            var bBox;

            if ((viewData === undefined) || (viewData === null)) {
                this.clearFeatureList();
                return;
            }
            southWest = new LatLon(viewData.bounds.south, viewData.bounds.west);
            northEast = new LatLon(viewData.bounds.north, viewData.bounds.east);
            bBox = new emp.classLibrary.MapExtent(southWest, northEast);
            centerWest = bBox.getCenterWest();
            centerEast = bBox.getCenterEast();
            
            westPoint = mapEngine.getXYFromLatLon(centerWest);
            eastPoint = mapEngine.getXYFromLatLon(centerEast);
            
            if ((null !== westPoint) && (null !== eastPoint)) {
                // Using Pythagoras to compute the pixel distance ( for width and height) of the bounding box.
                var deltaX = eastPoint.x - westPoint.x;
                var deltaY = eastPoint.y - westPoint.y;
                var deltaXe2 = deltaX * deltaX;
                var deltaYe2 = deltaY * deltaY;
                var pixelDistance = Math.round(Math.sqrt(deltaXe2 + deltaYe2));

                this.options.boundsPixelWidth = pixelDistance;

                // Calculate the north south pixelsHeight.
                centerNorth = bBox.getCenterNorth();
                centerSouth = bBox.getCenterSouth();

                northPoint = mapEngine.getXYFromLatLon(centerNorth);
                southPoint = mapEngine.getXYFromLatLon(centerSouth);

                if ((null !== northPoint) && (null !== southPoint)) {
                    deltaX = northPoint.x - southPoint.x;
                    deltaY = northPoint.y - southPoint.y;
                    deltaXe2 = deltaX * deltaX;
                    deltaYe2 = deltaY * deltaY;
                    this.options.boundsPixelHeight = Math.round(Math.sqrt(deltaXe2 + deltaYe2));

                    if (pixelDistance > 0.0) {
                        viewWidthInMeters = centerWest.distanceTo(centerEast) * 1000.0;
                        this.options.metersPerPixel = viewWidthInMeters / pixelDistance;

                        this.processViewChange(bBox);
                    }
                }
            }
        },
        getCharacterPixelWidth: function(featureType) {
            var labelStyle = this.getLabelStyle(featureType);

            if (null === labelStyle) {
                return 0;
            }

            return emp.utilities.FontUtilities.fontPointsToPixels(labelStyle.getSize());
        },
        displayGridLabel: function(label, mapBounds) {
            var labelPos;
            var charMetersWidth = getCharacterPixelWidth(MAIN_GRID_TYPE_LABEL) * this.getMetersPerPixel();
            
            labelPos = new emp.classLibrary.Coordinate(mapBounds.getNorth(), mapBounds.centerLongitude());
            labelPos = labelPos.destinationPoint(180.0, charMetersWidth / 1000.0);

            addFeature(createLabelFeature(labelPos, label, MAIN_GRID_TYPE_LABEL));
        },

        /**
         * This method creates a Text feature at the position indicated. Once the Text feature is created
         * it sets the label style. Then it calls the setLabelAttribute method so the caller can set the labels properties.
         * @param position          The emp.classLibrary.Coordinate to place the label.
         * @param text              The text to display on the map.
         * @param gridObjectType    A caller defined string to identify the type of label.
         * @return The IFeature interface of the Text feature created.
         */
        createLabelFeature: function(position, text, gridObjectType) {
            var featureProperties;
            var featureData = {
                    type: 'Point',
                    coordinates: ''
                };
            var labelFeature = new emp.typeLibrary.Feature({
                format: emp3.api.enums.FeatureTypeEnum.GEO_TEXT,
                name: text
            });

            emp.util.geoJson.convertCoordinateArrayToGeoJson(featureData, [position]);
            labelFeature.data = featureData;
            
            featureProperties = {
                altitudeMode: emp3.api.convertAltitudeMode(cmapi.enums.altitudeMode.CLAMP_TO_GROUND),
                azimuth: 0.0
            };
            
            labelFeature.properties = featureProperties;
            
            if (this.containsLabelStyle(gridObjectType)) {
                featureProperties.labelStyle = this.getLabelStyle(gridObjectType);
            }
            setLabelAttributes(labelFeature, gridObjectType);

            return labelFeature;
        },
        /**
         * This method creates a path feature with the positions list provided, then set the path attributes.
         * Then it calls the setPathAttributes to allow the sub class to set the path's properties.
         * @param positionList      An array of emp.classLibrary.Coordinate.
         * @param gridObjectType    A caller defined string to identify the type of path.
         * @return The IFeature interface of the path created.
         */
        createPathFeature: function (positionList, gridObjectType) {
            var featureProperties;
            var featureData = {
                    type: 'lineString',
                    coordinates: ''
                };
            var pathFeature = new emp.typeLibrary.Feature({
                format: emp3.api.enums.FeatureTypeEnum.GEO_PATH
            });

            emp.util.geoJson.convertCoordinateArrayToGeoJson(featureData, positionList);
            pathFeature.data = featureData;
            
            featureProperties = {
                altitudeMode: emp3.api.convertAltitudeMode(cmapi.enums.altitudeMode.CLAMP_TO_GROUND)
            };
            
            pathFeature.properties = featureProperties;

            if (this.containsStrokeStyle(gridObjectType)) {
                featureProperties.strokeStyle = this.getStrokeStyle(gridObjectType);
            }
            setPathAttributes(pathFeature, gridObjectType);

            return pathFeature;
        },

        /**
         * The sub class must override this method to set the properties of the path. If the grid object type
         * was not created by the sub class it must call the parent method.
         * @param path              The path feature created by the sub class.
         * @param gridObjectType    The object type provided by the sub class.
         */
        setPathAttributes: function(path, gridObjectType) {
        },

        /**
         * The sub class must override this method to set the properties of the label it creates. If the
         * object class is not created by the sub class it must call the parents method.
         * @param label             The Text feature created by the sub class.
         * @param gridObjectType    The object type indicated by the sub class.
         */
        setLabelAttributes: function(label, gridObjectType) {
        }
    };
    return publicInterface;
};

emp.mapGridLines.BaseGridLineGenerator = emp.classLibrary.AbstractGridLineGenerator.extend(emp.mapGridLines.privateClass());
