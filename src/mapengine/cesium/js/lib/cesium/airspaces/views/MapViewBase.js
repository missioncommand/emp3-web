///////////////////////////////////////////////////////////////////////////////
// MapViewBase.js
//
// Copyright (c) 2014-2015 General Dynamics Inc.
// The Government has the right to use, modify, reproduce,
// release, perform, display ,or disclose this computer
// software or computer software documentation without restriction.
//
///////////////////////////////////////////////////////////////////////////////
function MapViewBase(mapView, mapModel)
{
    //MAP_IMAGES= 'js/app/resources/images/map/',
    //MAP_IMAGES=  empCesium.relativeBaseURL + "js/lib/cesium/editors/images/",
    this.MAP_IMAGES = CESIUM_BASE_URL + "editors/images/";
//    MAP_IMAGES= baseURLEmpCesium + 'images/editors/',
    // defines the number of degrees between points.
    this.CYLNDER_STEP = (360 / 30);
    this.ORBIT_STEP = (180 / 15);
    this.STARTING_ENDCAP = 0;
    this.TRUE_ORBIT = 1;
    this.ENDING_ENDCAP = 2;
    this.NO_ENDCAP = 3;
    this.BOTH_ENDCAP = 4;
    this.MAX_DISTANCE_IN_METERS_BETWEEN_AGL_POINTS = 50;
    this.count = null;
    this.mapView = mapView;
    this.mapModel = mapModel;
    this.requests = null;
    this.workerHandle = null;
    this.workers = null;
//    var __construct= function (mapView, mapModel) {
    ////this.scene = mapView.getScene();
    this.scene = mapView.getScene();

    this.count = 0;
//    }(mapView, mapModel);

    this.getMapImages = function ()
    {
        return this.MAP_IMAGES;
    };
    this.addMultiPointGraphic = function (graphic)
    {

        var multiPointObj = null;
        var retDeferred = null;

        try
        {

            retDeferred = Cesium.when.defer();////new Deferred();

            setTimeout(emp.$.proxy(function ()
            {
                //setTimeout(lang.hitch(this, function () {

                multiPointObj = JSON.parse(graphic.multiPoint);
                //multiPointObj = dojo.fromJson(graphic.multiPoint);

                dataSource.load(multiPointObj, '').then(emp.$.proxy(function ()
                {
                    //dataSource.load(multiPointObj, '').then(lang.hitch(this, function () {

                    var feature = null;
                    var visualizers = null;

                    try
                    {
                    }
                    catch (error)
                    {

                        console.log('MapViewBase._addMultiPointGraphic, Inner' + error);
                    }

                    retDeferred.resolve(feature);
                }, this));
            }, this));
        }
        catch (error)
        {

            console.log('MapViewBase._addMultiPointGraphic: ' + error);
        }

        return retDeferred;
    };

    this.addPointFeatureToCollection = function (collection, id, iconURL, point, scale, pixelOffset, altitudeInMeters)
    {

        var billBoard = null;

        try
        {

            billBoard = collection.add({
                id: id,
                image: iconURL,
                position: Cesium.Cartesian3.fromDegrees(point.Longitude, point.Latitude, altitudeInMeters),
                pixelOffset: pixelOffset,
                scale: scale
            });
        }
        catch (error)
        {
            console.log('MapViewBase._addPointFeatureToCollection: ' + error);
        }

        return billBoard;
    };
    this.calculatePixelOffset = function (symbolInformation)
    {

        var pixelOffset = null;
        var x = null;
        var y = null;

        try
        {

            x = (symbolInformation.width / 2) - symbolInformation.hotspot.x;
            y = (symbolInformation.height / 2) - symbolInformation.hotspot.y;
            pixelOffset = new Cesium.Cartesian2(x, y);
        }
        catch (error)
        {
            console.log('MapViewBase._calculatePixelOffset: ' + error);
        }

        return pixelOffset;
    };
    this.convertColor = function (rgbaFillColor)
    {

        var retColor = EmpCesiumConstants.propertyDefaults.FILL_COLOR;
        try
        {
            if (rgbaFillColor)
            {
                if (rgbaFillColor.a && rgbaFillColor.a < .5)
                {
                    retColor = new Cesium.Color(rgbaFillColor.r, rgbaFillColor.g, rgbaFillColor.b, rgbaFillColor.a);
                }
                else
                {
                    retColor = new Cesium.Color(rgbaFillColor.r, rgbaFillColor.g, rgbaFillColor.b, .3);
                }
            }
        }
        catch (ex)
        {
            retColor = EmpCesiumConstants.propertyDefaults.FILL_COLOR;
        }
//        switch (color) {
//
//            case COLOR.AQUA.Id:
//                retColor = Cesium.Color.AQUA;
//                break;
//
//            case COLOR.BLACK.Id:
//                retColor = Cesium.Color.BLACK;
//                break;
//
//            case COLOR.BLUE.Id:
//                retColor = Cesium.Color.BLUE;
//                break;
//
//            case COLOR.FUCHSIA.Id:
//                retColor = Cesium.Color.FUSCHIA;
//                break;
//
//            case COLOR.GRAY.Id:
//                retColor = Cesium.Color.GRAY;
//                break;
//
//            case COLOR.GREEN.Id:
//                retColor = Cesium.Color.GREEN;
//                break;
//
//            case COLOR.LIME.Id:
//                retColor = Cesium.Color.LIME;
//                break;
//
//            case COLOR.MAROON.Id:
//                retColor = Cesium.Color.MAROON;
//                break;
//
//            case COLOR.NAVY.Id:
//                retColor = Cesium.Color.NAVY;
//                break;
//
//            case COLOR.OLIVE.Id:
//                retColor = Cesium.Color.OLIVE;
//                break;
//
//            case COLOR.PURPLE.Id:
//                retColor = Cesium.Color.PURPLE;
//                break;
//
//            case COLOR.RED.Id:
//                retColor = Cesium.Color.RED;
//                break;
//
//            case COLOR.SILVER.Id:
//                retColor = Cesium.Color.SILVER;
//                break;
//
//            case COLOR.TEAL.Id:
//                retColor = Cesium.Color.TEAL;
//                break;
//
//            case COLOR.YELLOW.Id:
//                retColor = Cesium.Color.YELLOW;
//                break;
//
//            default:
//                console.info('MapViewBase._convertColor: Unknown color ' + color + ' defaulting to red.');
//                retColor = Cesium.Color.RED;
//                break;
//        }

        return retColor;
    };
    this.createFeature = function (primitive, pickable, appearance)
    {

        var feature = null;
        var i = null;
        var tmpAppearance = null;

        try
        {

            if (appearance)
            {
                tmpAppearance = appearance;
            }
            else
            {
                tmpAppearance = new Cesium.PerInstanceColorAppearance({
                    closed: true,
                    translucent: true
                });
            }

            if (emp.$.isArray(primitive))
            {

                feature = new Cesium.Primitive({
                    geometryInstances: primitive,
                    allowPicking: pickable,
                    interleave: true,
                    appearance: tmpAppearance,
                    releaseGeometryInstances: false
                });
            }
            else
            {

                if (primitive.length !== 0)
                {

                    feature = new Cesium.Primitive({
                        geometryInstances: [primitive],
                        allowPicking: pickable,
                        interleave: true,
                        appearance: tmpAppearance,
                        releaseGeometryInstances: false
                    });
                }
            }
        }
        catch (error)
        {

            console.log('MapViewBase._createFeature: ' + error);
        }

        return feature;
    };

    this.createAltitudeInformationObject = function (bottomAGL, topAGL, altitudeLower, altitudeUpper, maxTerrainAltitude, minTerrainAltitude)
    {

        var retObj = {};

        //add the properties to the object
        retObj.bottomAGL = bottomAGL;
        retObj.topAGL = topAGL;
        retObj.altitudeLower = altitudeLower;
        retObj.altitudeUpper = altitudeUpper;
        retObj.maxTerrainAltitude = maxTerrainAltitude;
        retObj.minTerrainAltitude = minTerrainAltitude;

        return retObj;
    };
    // Generates a circle shape
    this.createGenericCircle = function (point, altitudeInMeters, radiusInMeters, cesiumColor)
    {

        var appearance = null;
        var circleGeometry = null;
        var feature = null;
        var primitive = null;

        try
        {

            appearance = new Cesium.PerInstanceColorAppearance({
                flat: true,
                renderState: {
                    lineWidth: Math.min(2.0, this.scene.maximumAliasedLineWidth)
                }
            });

            circleGeometry = new Cesium.CircleOutlineGeometry({
                center: Cesium.Cartesian3.fromDegrees(point.Location.Longitude, point.Location.Latitude),
                height: altitudeInMeters,
                radius: radiusInMeters
            });

            primitive = new Cesium.GeometryInstance({
                geometry: circleGeometry,
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(cesiumColor)
                }
            });

            feature = this.createFeature(primitive, false, appearance);
        }
        catch (error)
        {

            console.log('MapViewBase.createGenericCircle: ' + error);
        }

        return feature;
    },
            this.createGenericLine = function (points, color, followSurface)
            {

                var altitudeInMeters = null;
                var appearance = null;
                var i = null;
                var feature = null;
                var geom = null;
                var linePoints = null;
                var primitive = null;

                try
                {

                    if (points.length < 2)
                    {
                        console.log('MapViewBase.createGenericLine: A line requires at least 2 points');
                        return null;
                    }

                    linePoints = [];

                    appearance = new Cesium.PolylineColorAppearance();

                    for (i = 0; i < points.length; i++)
                    {

                        //altitudeInMeters = lengthUtils.convertFromTo(points[i].AMSL, ALTITUDE_UNITS.FT.Value, 1);
                        altitudeInMeters = points[i].AMSL;

                        linePoints.push(Cesium.Cartesian3.fromDegrees(points[i].Location.Longitude,
                                points[i].Location.Latitude, altitudeInMeters));
                    }

                    primitive = new Cesium.GeometryInstance({
                        geometry: new Cesium.PolylineGeometry({
                            positions: linePoints,
                            width: 2.0,
                            vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
                            followSurface: followSurface
                        }),
                        attributes: {
                            color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
                        }
                    });

                    feature = this.createFeature(primitive, false, appearance);
                }
                catch (error)
                {
                    console.log('MapViewBase.createGenericLine: ' + error);
                }

                return feature;
            },
            this.deleteElementFromScene = function (feature)
            {

                try
                {

                    this.scene.primitives.remove(feature);
                }
                catch (error)
                {
                    console.log('MapViewBase.deleteElementFromScene: ' + error);
                }
            },
            this.determineAdequateTerrainDetailToRenderAGL = function (pointList)
            {

                var cartographic = null;
                var i = null;
                var j = null;
                var terrainTile = null;

                try
                {

                    //aceve4do
                    // return {levelOfDetail:11,maxDistance: 3000, maxTriangles: 1000};

                    //Optimization only check the first point in the list.
//                        for (i = 0; i < pointList.length; i++) {
//
//                            cartographic = Cesium.Cartographic.fromDegrees(pointList[i].Longitude, pointList[i].Latitude);
//                            terrainTile = this.mapView.scene.globe.getTerrainTileAtLocation(cartographic);
//
//                            if (terrainTile) {
//
//                                for (j = 0; j < config.tessellationConfig.length; j++) {
//
//                                    if (config.tessellationConfig[j].levelOfDetail <= terrainTile.level) {
//
//                                        return config.tessellationConfig[j];
//                                    }
//                                }
//                            }
//                        }

                    return null;
                }
                catch (error)
                {
                    console.log('MapViewBase.determineAdequateTerrainDetailToRenderAGL: ' + error);
                }
            },
            this.determineWhichPointsAreAGLRenderable = function (pointList)
            {

                var cartographic = null;
                var i = null;
                var j = null;
                var retArray = null;
                var terrainTile = null;

                try
                {

                    retArray = [];

                    //Optimization only check the first point in the list.
                    for (i = 0; i < pointList.length; i++)
                    {

                        cartographic = Cesium.Cartographic.fromDegrees(pointList[i].Longitude, pointList[i].Latitude);
                        terrainTile = this.mapView.scene.globe.getTerrainTileAtLocation(cartographic);

                        if (terrainTile)
                        {

                            for (j = 0; j < config.tessellationConfig.length; j++)
                            {

                                if (config.tessellationConfig[j].levelOfDetail <= terrainTile.level)
                                {

                                    retArray.push(i);
                                    break;
                                }
                            }
                        }
                    }

                    return retArray;
                }
                catch (error)
                {
                    console.log('MapViewBase.determineWhichPointsAreAGLRenderable: ' + error);
                }
            },
            this.generateAGLPoligon = function (geometryCollection, pointList, heightList, altitude, shapeColor, skeleton)
            {

                var i = null;
                var j = null;
                var positions = null;
                var tmpPointList = null;
                var colorGeometryInstanceAttribute = Cesium.ColorGeometryInstanceAttribute.fromColor(shapeColor);

                try
                {

                    j = 0;
                    tmpPointList = [];

                    for (i = 0; i < (pointList.length - 1); i = i + 2)
                    {

                        tmpPointList.push(pointList[i]);
                        tmpPointList.push(pointList[i + 1]);
                        tmpPointList.push((heightList[j++] + altitude));
                    }

                    for (i = 0; i < tmpPointList.length; i = i + 9)
                    {

                        positions = Cesium.Cartesian3.fromDegreesArrayHeights([tmpPointList[i], tmpPointList[i + 1],
                            tmpPointList[i + 2], tmpPointList[i + 3], tmpPointList[i + 4], tmpPointList[i + 5],
                            tmpPointList[i + 6], tmpPointList[i + 7], tmpPointList[i + 8]]);

                        if (skeleton)
                        {

                            geometryCollection.push(new Cesium.GeometryInstance({
                                geometry: Cesium.PolygonOutlineGeometry.fromPositions({
                                    positions: positions,
                                    vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
                                    perPositionHeight: true
                                }),
                                attributes: {
                                    color: colorGeometryInstanceAttribute,
                                    show: new Cesium.ShowGeometryInstanceAttribute(true)
                                }
                                //id: 'polygonGeometryId'
                            }));
                        }
                        else
                        {

                            geometryCollection.push(new Cesium.GeometryInstance({
                                geometry: Cesium.PolygonGeometry.fromPositions({
                                    positions: positions,
                                    vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
                                    perPositionHeight: true
                                }),
                                attributes: {
                                    color: colorGeometryInstanceAttribute,
                                    show: new Cesium.ShowGeometryInstanceAttribute(true)
                                }
                                //id: 'polygonGeometryId'
                            }));
                        }
                    }
                }
                catch (error)
                {

                    console.log('MapViewBase._generateAGLPoligon: ' + error);
                }
            };
    this.generateAMSLPoligon = function (geometryCollection, pointList, altitude, shapeColor, skeleton)
    {

        try
        {
            var colorGeometryInstanceAttribute = Cesium.ColorGeometryInstanceAttribute.fromColor(shapeColor);
            if (skeleton)
            {

                geometryCollection.push(new Cesium.GeometryInstance({
                    geometry: Cesium.PolygonOutlineGeometry.fromPositions({
                        height: altitude,
                        perPositionHeight: false,
                        positions: pointList
                    }),
                    attributes: {
                        color: colorGeometryInstanceAttribute,
                        show: new Cesium.ShowGeometryInstanceAttribute(true)
                    }
                    //id: 'polygonOutlineGeometryId'
                }));
            }
            else
            {

                geometryCollection.push(new Cesium.GeometryInstance({
                    geometry: Cesium.PolygonGeometry.fromPositions({
                        height: altitude,
                        perPositionHeight: false,
                        positions: pointList
                    }),
                    attributes: {
                        color: colorGeometryInstanceAttribute,
                        show: new Cesium.ShowGeometryInstanceAttribute(true)
                    }
                    //id: 'polygonGeometryId'

                }));
            }
        }
        catch (error)
        {

            console.log('MapViewBase._generateAMSLPoligon: ' + error);
        }
    };
    this.generateWall = function (geometryCollection, pointList, wallMaxHeightList, wallMinHeightList, shapeColor,
            bottomAGL, topAGL, wallHeights, lowerAlt, upperAlt, skeleton)
    {

        var i = null;
        var tmpMaximumHeights = null;
        var tmpMinimumHeights = null;
        var colorGeometryInstanceAttribute = Cesium.ColorGeometryInstanceAttribute.fromColor(shapeColor);

        try
        {

            if (((bottomAGL === false) && (topAGL === false)) || !wallHeights)
            {

                tmpMaximumHeights = wallMaxHeightList;
                tmpMinimumHeights = wallMinHeightList;
            }
            else
            {

                tmpMaximumHeights = [];
                tmpMinimumHeights = [];

                for (i = 0; i < wallHeights.length; i++)
                {

                    if (bottomAGL === true)
                    {

                        tmpMinimumHeights.push((wallHeights[i] + lowerAlt));
                    }
                    else
                    {
                        tmpMinimumHeights.push(lowerAlt);
                    }

                    if (topAGL === true)
                    {

                        tmpMaximumHeights.push((wallHeights[i] + upperAlt));
                    }
                    else
                    {
                        tmpMaximumHeights.push(upperAlt);
                    }
                }
            }

            if (skeleton)
            {

                geometryCollection.push(new Cesium.GeometryInstance({
                    geometry: new Cesium.WallOutlineGeometry({
                        positions: pointList,
                        maximumHeights: tmpMaximumHeights,
                        minimumHeights: tmpMinimumHeights,
                        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
                    }),
                    attributes: {
                        color: colorGeometryInstanceAttribute,
                        show: new Cesium.ShowGeometryInstanceAttribute(true)
                    }
                    //id: 'wallOutlineGeometryId'
                }));
            }
            else
            {

                geometryCollection.push(new Cesium.GeometryInstance({
                    geometry: new Cesium.WallGeometry({
                        positions: pointList,
                        maximumHeights: tmpMaximumHeights,
                        minimumHeights: tmpMinimumHeights,
                        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
                    }),
                    attributes: {
                        color: colorGeometryInstanceAttribute,
                        show: new Cesium.ShowGeometryInstanceAttribute(true)
                    }
                    // id: 'wallGeometryId'
                }));
            }
        }
        catch (error)
        {

            console.log('MapViewBase._generateWall: ' + error);
        }
    };
    this.generateLeg = function (geometryCollection1, geometryCollection2, point0, point1, altitudeInformation, width,
            endcap, shapeColor, skeleton, boundaryAlert, preShow, postShow, overrideTessellationConfiguration)
    {

        var bearing = null;
        var deferred = null;
        var degrees = null;
        var point = null;
        var pointList = null;
        var tessellateDefer = null;
        var tessellationConfiguration = null;
        var that = null;
        var wallLowerOffset = null;
        var wallMinHeightList = null;
        var wallMaxHeightList = null;
        var wallPointList = null;
        var wallUpperOffset = null;

        try
        {
            pointList = [];
            wallMinHeightList = [];
            wallMaxHeightList = [];

            deferred = Cesium.when.defer();//////new Deferred();

            if ((altitudeInformation.bottomAGL === true) || (altitudeInformation.topAGL === true))
            {

                tessellationConfiguration = overrideTessellationConfiguration;

                if (tessellationConfiguration)
                {

                    wallLowerOffset = altitudeInformation.altitudeLower;
                    wallUpperOffset = altitudeInformation.altitudeUpper;
                }
                else
                {

                    wallLowerOffset = altitudeInformation.minTerrainAltitude + altitudeInformation.altitudeLower;
                    wallUpperOffset = altitudeInformation.maxTerrainAltitude + altitudeInformation.altitudeUpper;
                }
            }
            else
            {

                wallLowerOffset = altitudeInformation.altitudeLower;
                wallUpperOffset = altitudeInformation.altitudeUpper;
            }

            //bearing = mapUtils.bearingBetween(point0, point1);
            var latLon0 = new LatLon(point0.Latitude, point0.Longitude);
            var latLon1 = new LatLon(point1.Latitude, point1.Longitude);
            bearing = latLon0.bearingTo(latLon1);

            if ((endcap === this.STARTING_ENDCAP) || (endcap === this.BOTH_ENDCAP))
            {

                //point = mapUtils.destinationPoint(point0, (bearing + 90), width);
                point = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": point0.Latitude, "x": point0.Longitude}, width, (bearing + 90));


                pointList.push(point.Longitude);
                pointList.push(point.Latitude);

                wallMinHeightList.push(wallLowerOffset);
                wallMaxHeightList.push(wallUpperOffset);

                //point = mapUtils.destinationPoint(point0, (bearing - 90), width);
                point = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": point0.Latitude, "x": point0.Longitude}, width, (bearing - 90));

                pointList.push(point.Longitude);
                pointList.push(point.Latitude);

                wallMinHeightList.push(wallLowerOffset);
                wallMaxHeightList.push(wallUpperOffset);
            }
            else
            {

                for (degrees = 90; degrees <= 270; degrees = degrees + this.ORBIT_STEP)
                {

                    //point = mapUtils.destinationPoint(point0, (bearing + degrees), width);
                    point = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": point0.Latitude, "x": point0.Longitude}, width, (bearing + degrees));

                    pointList.push(point.Longitude);
                    pointList.push(point.Latitude);

                    wallMinHeightList.push(wallLowerOffset);
                    wallMaxHeightList.push(wallUpperOffset);
                }
            }

            if ((endcap === this.ENDING_ENDCAP) || (endcap === this.BOTH_ENDCAP))
            {

                //point = mapUtils.destinationPoint(point1, (bearing + 270), width);
                point = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": point1.Latitude, "x": point1.Longitude}, width, (bearing + 270));

                pointList.push(point.Longitude);
                pointList.push(point.Latitude);

                wallMinHeightList.push(wallLowerOffset);
                wallMaxHeightList.push(wallUpperOffset);

                //point = mapUtils.destinationPoint(point1, (bearing + 90), width);
                point = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": point1.Latitude, "x": point1.Longitude}, width, (bearing + 90));

                pointList.push(point.Longitude);
                pointList.push(point.Latitude);

                wallMinHeightList.push(wallLowerOffset);
                wallMaxHeightList.push(wallUpperOffset);
            }
            else
            {

                for (degrees = 270; degrees <= 450; degrees = degrees + this.ORBIT_STEP)
                {

                    //point = mapUtils.destinationPoint(point1, (bearing + degrees), width);
                    point = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": point1.Latitude, "x": point1.Longitude}, width, (bearing + degrees));

                    pointList.push(point.Longitude);
                    pointList.push(point.Latitude);

                    wallMinHeightList.push(wallLowerOffset);
                    wallMaxHeightList.push(wallUpperOffset);
                }
            }

            //need to finish off the leg and the wall
            //point = mapUtils.destinationPoint(point0, (bearing + 90), width);
            point = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": point0.Latitude, "x": point0.Longitude}, width, (bearing + 90));
            wallMinHeightList.push(wallLowerOffset);
            wallMaxHeightList.push(wallUpperOffset);

            pointList.push(point.Longitude);
            pointList.push(point.Latitude);

            //wallPointList = emp.$.extend(true, {}, pointList );
            wallPointList = emp.helpers.copyObject(pointList);
            //wallPointList = lang.clone(pointList);

            wallPointList = Cesium.Cartesian3.fromDegreesArray(wallPointList);

            if (tessellationConfiguration)
            {

                that = this;

                tessellateDefer = this.mapView.tessellate.tessellateAirspace(pointList, tessellationConfiguration);
                tessellateDefer.then(function (values)
                {

                    try
                    {

                        pointList = Cesium.Cartesian3.fromDegreesArray(pointList);
                        wallPointList = Cesium.Cartesian3.fromDegreesArray(values.wallPoints);

                        that._generateShape(geometryCollection1, geometryCollection2, pointList, values.pointList,
                                wallPointList, wallMaxHeightList, wallMinHeightList, shapeColor, altitudeInformation,
                                values.positionHeights, values.wallHeights, wallLowerOffset, wallUpperOffset, skeleton,
                                boundaryAlert, preShow, postShow);

                        deferred.resolve();

                    }
                    catch (error)
                    {
                        console.log('MapViewBase._generateLeg, rejecting promise: ' + error);
                        deferred.reject('MapViewBase._generateLeg, Inner: ' + error);
                    }
                }, function (err)
                {
                    console.log('MapViewBase._generateLeg, errback promise: ' + err);
                    deferred.reject(err);
                });
            }
            else
            {

                try
                {
                    pointList = Cesium.Cartesian3.fromDegreesArray(pointList);

                    this.generateShape(geometryCollection1, geometryCollection2, pointList, null,
                            wallPointList, wallMaxHeightList, wallMinHeightList, shapeColor, altitudeInformation,
                            null, null, wallLowerOffset, wallUpperOffset, skeleton, boundaryAlert, preShow, postShow);

                    deferred.resolve();
                }
                catch (error)
                {
                    console.log('MapViewBase._generateLeg, rejecting promise ' + error);
                    deferred.reject('MapViewBase._generateLeg, Inner: ' + error);
                }
            }

            return deferred.promise;
        }
        catch (error)
        {
            console.log('MapViewBase._generateLeg: ' + error);

            if (deferred)
            {
                deferred.reject('MapViewBase._generateLeg: ' + error);
            }
        }
    };
    this.generatePointFeature = function (iconURL, point, scale, pixelOffset, altitudeInMeters)
    {

        var feature = null;

        try
        {

            feature = new Cesium.BillboardCollection();
            feature.add({
                image: iconURL,
                position: Cesium.Cartesian3.fromDegrees(point.Longitude, point.Latitude, altitudeInMeters),
                pixelOffset: pixelOffset,
                scale: scale
            });
        }
        catch (error)
        {
            console.log('MapViewBase._generatePointFeature: ' + error);
        }

        return feature;
    };
    this.generatePoligonalShape = function (geometryCollection1, geometryCollection2, pointList, altitudeInformation,
            shapeColor, skeleton, boundaryAlert, preShow, postShow)
    {

        var deferred = null;
        var i = null;
        var polygonPointList = null;
        var tessellateDefer = null;
        var tessellationConfiguration = null;
        var that = null;
        var wallLowerOffset = null;
        var wallMaxHeightList = null;
        var wallMinHeightList = null;
        var wallPointList = null;
        var wallUpperOffset = null;

        try
        {

            polygonPointList = [];
            wallMaxHeightList = [];
            wallMinHeightList = [];

            deferred = Cesium.when.defer(); /////new Deferred();

            if ((altitudeInformation.bottomAGL === true) || (altitudeInformation.topAGL === true))
            {

                // acevedo hardcoding a tessellationConfig object inside the determineAdequateTerrainDetailToRenderAGL
                tessellationConfiguration = this.determineAdequateTerrainDetailToRenderAGL(pointList);
                //tessellationConfiguration = 11;


                if (tessellationConfiguration)
                {

                    wallLowerOffset = altitudeInformation.altitudeLower;
                    wallUpperOffset = altitudeInformation.altitudeUpper;
                }
                else
                {

                    wallLowerOffset = altitudeInformation.minTerrainAltitude + altitudeInformation.altitudeLower;
                    wallUpperOffset = altitudeInformation.maxTerrainAltitude + altitudeInformation.altitudeUpper;
                }
            }
            else
            {

                wallLowerOffset = altitudeInformation.altitudeLower;
                wallUpperOffset = altitudeInformation.altitudeUpper;
            }

            for (i = 0; i < pointList.length; i++)
            {
                polygonPointList.push(pointList[i].Longitude);
                polygonPointList.push(pointList[i].Latitude);
            }

            for (i = 0; i < polygonPointList.length; i++)
            {

                if ((i % 2) === 1)
                {

                    wallMaxHeightList.push(wallUpperOffset);
                    wallMinHeightList.push(wallLowerOffset);
                }
            }

            //Need to finish off wall
            wallMinHeightList.push(wallLowerOffset);
            wallMaxHeightList.push(wallUpperOffset);

            polygonPointList.push(polygonPointList[0]);
            polygonPointList.push(polygonPointList[1]);

            //wallPointList = emp.$.extend(true, {}, polygonPointList );
            wallPointList = emp.helpers.copyObject(polygonPointList);
            //wallPointList = lang.clone(polygonPointList);

            if (tessellationConfiguration)
            {

                that = this;

                tessellateDefer = this.mapView.tessellate.tessellateAirspace(polygonPointList, tessellationConfiguration);
                tessellateDefer.then(function (values)
                {

                    try
                    {

                        polygonPointList = Cesium.Cartesian3.fromDegreesArray(polygonPointList);
                        wallPointList = Cesium.Cartesian3.fromDegreesArray(values.wallPoints);

                        that._generateShape(geometryCollection1, geometryCollection2, polygonPointList, values.pointList,
                                wallPointList, wallMaxHeightList, wallMinHeightList, shapeColor, altitudeInformation,
                                values.positionHeights, values.wallHeights, wallLowerOffset, wallUpperOffset, skeleton,
                                boundaryAlert, preShow, postShow);

                        deferred.resolve();

                        console.info('MapViewBase._generatePoligonalShape, deferred resolved');
                    }
                    catch (error)
                    {
                        console.log('MapViewBase._generatePoligonalShape, rejecting promise: ' + error);
                        deferred.reject('MapViewBase._generatePoligonalShape, Inner: ' + error);
                    }
                }, function (err)
                {
                    console.log('MapViewBase._generatePoligonalShape, errback promise: ' + err);
                    deferred.reject(err);
                });
            }
            else
            {

                try
                {
                    polygonPointList = Cesium.Cartesian3.fromDegreesArray(polygonPointList);
                    wallPointList = Cesium.Cartesian3.fromDegreesArray(wallPointList);

                    this.generateShape(geometryCollection1, geometryCollection2, polygonPointList, null,
                            wallPointList, wallMaxHeightList, wallMinHeightList, shapeColor, altitudeInformation,
                            null, null, wallLowerOffset, wallUpperOffset, skeleton, boundaryAlert, preShow, postShow);

                    deferred.resolve();
                }
                catch (error)
                {
                    console.log('MapViewBase._generatePoligonalShape, rejecting promise ' + error);
                    deferred.reject('MapViewBase._generatePoligonalShape, Inner: ' + error);
                }
            }

            return deferred.promise;
        }
        catch (error)
        {
            console.log('MapViewBase._generatePoligonalShape: ' + error);

            if (deferred)
            {
                deferred.reject('MapViewBase._generatePoligonalShape: ' + error);
            }
        }
    };
    this.generateAMSLWallShape = function (pointList, altitudeLower, altitudeUpper, shapeColor, skeleton)
    {

        var appearance = null;
        var cesiumPointList = null;
        var count = null;
        var feature = null;
        var geometryCollection = null;
        var i = null;
        var polygonPointList = null;
        var polylinePointList = null;
        var prop = null;
        var uniqueLocs = null;
        var wallMaxHeightList = null;
        var wallMinHeightList = null;
        var colorGeometryInstanceAttribute = Cesium.ColorGeometryInstanceAttribute.fromColor(shapeColor);

        try
        {

            count = 0;
            feature = {};
            geometryCollection = [];
            polygonPointList = [];
            polylinePointList = [];
            uniqueLocs = {};
            wallMaxHeightList = [];
            wallMinHeightList = [];

            for (i = 0; i < pointList.length; i++)
            {

                polygonPointList.push(pointList[i].Longitude);
                polygonPointList.push(pointList[i].Latitude);
            }

            for (i = 0; i < polygonPointList.length; i++)
            {

                polylinePointList.push(polygonPointList[i]);

                if ((i % 2) === 1)
                {

                    if (i !== 0)
                    {
                        uniqueLocs[polygonPointList[i - 1] + ' ' + polygonPointList[i]] = true;
                    }

                    polylinePointList.push(altitudeUpper);

                    wallMaxHeightList.push(altitudeUpper);
                    wallMinHeightList.push(altitudeLower);
                }
            }

            for (prop in uniqueLocs)
            {
                count++;

            }

            if (count < 2)
            {

                console.info('MapViewBase._generateAMSWallShape: Not enough unique points to generate a wall:');
                return;
            }

            cesiumPointList = Cesium.Cartesian3.fromDegreesArray(polygonPointList);
            polylinePointList = Cesium.Cartesian3.fromDegreesArrayHeights(polylinePointList);

            if (skeleton)
            {

                appearance = new Cesium.PerInstanceColorAppearance({
                    flat: true,
                    renderState: {
                        lineWidth: Math.min(2.0, this.scene.maximumAliasedLineWidth)
                    }
                });

                this.generateWall(geometryCollection, cesiumPointList, wallMaxHeightList, wallMinHeightList, shapeColor,
                        false, false, null, null, null, skeleton);

                feature.wall = this.createFeature(geometryCollection, true, appearance);
            }
            else
            {

                feature.line = this.createFeature(new Cesium.GeometryInstance({
                    geometry: new Cesium.PolylineGeometry({
                        positions: polylinePointList,
                        vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
                        width: 2.0
                    }),
                    attributes: {
                        color: colorGeometryInstanceAttribute
                    }
                }), true, new Cesium.PolylineColorAppearance());


                feature.wall = this.generateWall(geometryCollection, cesiumPointList, wallMaxHeightList, wallMinHeightList,
                        colorGeometryInstanceAttribute, false, false, null, null, null, skeleton);

                feature.wall = this.createFeature(geometryCollection, true, appearance);
            }

            return feature;
        }
        catch (error)
        {
            console.log('MapViewBase._generateAMSLWallShape: ' + error);
        }
    };
    this.generateShape = function (geometryCollection1, geometryCollection2, shapePointList, aglPointList, wallPointList,
            wallMaxHeightList, wallMinHeightList, shapeColor, altitudeInformation, positionHeights, wallHeights, wallLowerOffset,
            wallUpperOffset, skeleton, boundaryAlert, preShow, postShow)
    {

        try
        {

            if (skeleton)
            {

                if ((altitudeInformation.bottomAGL === true) || (altitudeInformation.topAGL === true))
                {
                    this.generateWall(geometryCollection1, wallPointList, wallMaxHeightList, wallMinHeightList,
                            shapeColor, altitudeInformation.bottomAGL, altitudeInformation.topAGL,
                            wallHeights, wallLowerOffset, wallUpperOffset, skeleton);
                }
                else
                {
                    this.generateWall(geometryCollection1, shapePointList, wallMaxHeightList, wallMinHeightList,
                            shapeColor, altitudeInformation.bottomAGL, altitudeInformation.topAGL,
                            wallHeights, wallLowerOffset, wallUpperOffset, skeleton);
                }

//                        The following lines are useful for debugging.  They draw a 3D wireframe shape rather than just the outline
//                        if(altitudeInformation.bottomAGL === true) {
//                            this.generateAGLPoligon(geometryCollection1, aglPointList, positionHeights, wallLowerOffset, 
//                                    shapeColor, skeleton);
//                        }
//                        else {
//                            this.generateAMSLPoligon(geometryCollection1, shapePointList, wallLowerOffset, shapeColor, 
//                                    skeleton);
//                        }
//                        
//                        if(altitudeInformation.topAGL === true) {
//                            this.generateAGLPoligon(geometryCollection1, aglPointList, positionHeights, wallUpperOffset, 
//                                    shapeColor, skeleton);
//                        }
//                        else {
//                            this.generateAMSLPoligon(geometryCollection1, shapePointList, wallUpperOffset, shapeColor, 
//                                    skeleton);
//                        }
            }
            else
            {
                //acevedo - add outline to primitive polygon. edit start
                var shapeColorOutline = COLOR.AQUA;
                if ((altitudeInformation.bottomAGL === true) || (altitudeInformation.topAGL === true))
                {
                    this.generateWall(geometryCollection1, wallPointList, wallMaxHeightList, wallMinHeightList,
                            shapeColorOutline, altitudeInformation.bottomAGL, altitudeInformation.topAGL,
                            wallHeights, wallLowerOffset, wallUpperOffset, skeleton);
                }
                else
                {
                    this.generateWall(geometryCollection1, shapePointList, wallMaxHeightList, wallMinHeightList,
                            shapeColorOutline, altitudeInformation.bottomAGL, altitudeInformation.topAGL,
                            wallHeights, wallLowerOffset, wallUpperOffset, skeleton);
                }
                // acevedo edit end

                if ((boundaryAlert && (boundaryAlert === true)) || (preShow && (preShow === true)) ||
                        (postShow && (postShow === true)))
                {

                    if ((altitudeInformation.bottomAGL === true) && aglPointList)
                    {
                        this.generateAGLPoligon(geometryCollection1, aglPointList, positionHeights, wallLowerOffset,
                                shapeColor, skeleton);
                    }
                    else
                    {
                        this.generateAMSLPoligon(geometryCollection1, shapePointList, wallLowerOffset, shapeColor,
                                skeleton);
                    }

                    if ((altitudeInformation.topAGL === true) && aglPointList)
                    {
                        this.generateAGLPoligon(geometryCollection2, aglPointList, positionHeights,
                                wallUpperOffset, shapeColor, skeleton);
                    }
                    else
                    {
                        this.generateAMSLPoligon(geometryCollection2, shapePointList, wallUpperOffset, shapeColor,
                                skeleton);
                    }

                    if ((altitudeInformation.bottomAGL === true) || (altitudeInformation.topAGL === true))
                    {
                        this.generateWall(geometryCollection1, wallPointList, wallMaxHeightList, wallMinHeightList,
                                shapeColor, altitudeInformation.bottomAGL, altitudeInformation.topAGL,
                                wallHeights, wallLowerOffset, wallUpperOffset, skeleton);
                    }
                    else
                    {
                        this.generateWall(geometryCollection1, shapePointList, wallMaxHeightList, wallMinHeightList,
                                shapeColor, altitudeInformation.bottomAGL, altitudeInformation.topAGL,
                                wallHeights, wallLowerOffset, wallUpperOffset, skeleton);
                    }
                }
                else
                {

                    if ((altitudeInformation.bottomAGL === true) && aglPointList)
                    {
                        this.generateAGLPoligon(geometryCollection1, aglPointList, positionHeights, wallLowerOffset,
                                shapeColor, skeleton);
                    }
                    else
                    {
                        this.generateAMSLPoligon(geometryCollection1, shapePointList, wallLowerOffset, shapeColor,
                                skeleton);
                    }

                    if ((altitudeInformation.topAGL === true) && aglPointList)
                    {
                        this.generateAGLPoligon(geometryCollection1, aglPointList, positionHeights, wallUpperOffset,
                                shapeColor, skeleton);
                    }
                    else
                    {
                        this.generateAMSLPoligon(geometryCollection1, shapePointList, wallUpperOffset, shapeColor,
                                skeleton);
                    }

                    if (((altitudeInformation.bottomAGL === true) || (altitudeInformation.topAGL === true)) && aglPointList)
                    {
                        this.generateWall(geometryCollection1, wallPointList, wallMaxHeightList, wallMinHeightList,
                                shapeColor, altitudeInformation.bottomAGL, altitudeInformation.topAGL,
                                wallHeights, wallLowerOffset, wallUpperOffset, skeleton);
                    }
                    else
                    {
                        this.generateWall(geometryCollection1, shapePointList, wallMaxHeightList, wallMinHeightList,
                                shapeColor, altitudeInformation.bottomAGL, altitudeInformation.topAGL,
                                wallHeights, wallLowerOffset, wallUpperOffset, skeleton);
                    }
                }
            }

        }
        catch (error)
        {
            console.log('MapViewBase._generateShape: ' + error);
        }
    };
    this.hideShowElement = function (feature, show /* true shows the element, false hides the feature */)
    {

        try
        {

            if (feature)
            {
                feature.show = show;
            }
        }
        catch (error)
        {
            console.log('MapViewBase.hideElement: ' + error);
        }
    };
    // The following shows or hides elements on the screen. Similiar to
    // enabling or disabling a layer in openLayers. It is
    // called when the user enables or disables "TAIS Data" elements
    // from the layer controller
    this.showHideCollection = function (collection, value)
    {

        var i = null;
        var screenElement = null;

        try
        {

            if (collection === undefined)
            {
                return;
            }

            for (i = 0; i < collection.length; i++)
            {

                screenElement = collection.get(i);

                if (screenElement)
                {

                    if (screenElement.hasOwnProperty('_show'))
                    {

                        screenElement.show = value;
                    }
                    else
                    {

                        this.showCollection(screenElement, value);
                    }
                }
            }
        }
        catch (error)
        {
            console.log('MapViewBase.showHideCollection: ' + error);
        }
    };
}
;
     