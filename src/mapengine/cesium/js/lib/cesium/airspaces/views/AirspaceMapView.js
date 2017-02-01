///////////////////////////////////////////////////////////////////////////////
// AirspaceMapView.js
//
// Copyright (c) 2014-2015 General Dynamics Inc.
// The Government has the right to use, modify, reproduce,
// release, perform, display ,or disclose this computer
// software or computer software documentation without restriction.
//
///////////////////////////////////////////////////////////////////////////////
 //AirspaceMapView = function({extends: MapViewBase})
  function AirspaceMapView (mapView, mapModel)
 {
    MapViewBase.call(this, mapView, mapModel);
    this.ACP_PAD= 500;
    // defines the number of degrees between points.
    this.CYLINDER_STEP= (360 / 30);
    this.ORBIT_STEP= (180 / 15);
    this.LINE_WIDTH= 1000.0;

//      var  __construct = function() {
//
//         MapViewBase.call(this, mapView, mapModel);
//      }(mapView, mapModel);

    this.addCylinder= function (cylinder, shapeColor, skeleton, boundaryAlert, preShow, postShow)
    {

        var altitudeInformation = null;
        var deferred = null;
        var degrees = null;
        var geometryCollection1 = null;
        var geometryCollection2 = null;
        var leg = null;
        var lonLat = null;
        var airspacePoint = null;
        var pointList = null;
        var retObj = {};

        try
        {

            geometryCollection1 = [];
            geometryCollection2 = [];
            pointList = [];

            leg = cylinder.AirspaceLegs[0];
            lonLat = cylinder.AirspacePoints[0];

            deferred = Cesium.when.defer();  ////// new Deferred();
            altitudeInformation = this.calculateAltitudeInformation(cylinder, leg);

            for (degrees = 0; degrees <= 360; degrees = degrees + this.CYLINDER_STEP)
            {

                //// point = mapUtils.destinationPoint(lonLat, degrees, leg.Radius);
                airspacePoint = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": lonLat.Latitude, "x": lonLat.Longitude}, leg.Radius, degrees);


                pointList.push(airspacePoint);
            }

            this.generatePoligonalShape(geometryCollection1, geometryCollection2, pointList, altitudeInformation,
                    shapeColor, skeleton, boundaryAlert, preShow, postShow).then(emp.$.proxy(function (results)
            {
                //shapeColor, skeleton, boundaryAlert, preShow, postShow).then(lang.hitch(this, function (results) {

                try
                {

                    //render the shape
                    retObj = this.renderShape(skeleton, geometryCollection1, geometryCollection2, shapeColor, boundaryAlert,
                            preShow, postShow);

                    //resolve the deferred
                    deferred.resolve(retObj);
                }
                catch (error)
                {
                    console.log('AirspaceMapView.addCylinder: ' + error);
                    deferred.reject('AirspaceMapView.addCylinder, Inner: ' + error);
                }
            }
//                        , // acevedo - jquery proxy can not handle more than 1 fucntion
//                        function (err) {
//                            console.log('AirspaceMapView.addCylinder: errBack ' + err);
//                            deferred.reject(err);
//                        }
            , this));

            return deferred.promise;
        }
        catch (error)
        {
            console.log('AirspaceMapView.addCylinder: ' + error);
        }
    };
    this.addLine= function (line, shapeColor, skeleton, boundaryAlert, preShow, postShow)
    {

        var alertColorGrid = null;
        var altitudeInformation = null;
        var airspacePoints = null;
        var appearance = null;
        var deferred = null;
        var endcap = null;
        var feature = null;
        var geometryCollection1 = null;
        var geometryCollection2 = null;
        var i = null;
        var leg = null;
        var p0 = null;
        var p1 = null;
        var promiseArray = null;
        var retObj = {};
        var tessellationConfiguration = null;

        try
        {

            airspacePoints = line.AirspacePoints;
            leg = line.AirspaceLegs[0];
            geometryCollection1 = [];
            geometryCollection2 = [];
            promiseArray = [];

            deferred = Cesium.when.defer(); //// new Deferred();

            altitudeInformation = this.calculateAltitudeInformation(line, leg);
            tessellationConfiguration = this.determineAdequateTerrainDetailToRenderAGL(airspacePoints);

            for (i = 0; i < airspacePoints.length - 1; i++)
            {

                p0 = airspacePoints[i];
                p1 = airspacePoints[i + 1];

                if ((i === 0) && (airspacePoints.length === 2))
                {
                    endcap = this.BOTH_ENDCAP;
                }
                else if (i === 0)
                {
                    endcap = this.STARTING_ENDCAP;
                }
                else if (i === line.AirspacePoints.length - 2)
                {
                    endcap = this.ENDING_ENDCAP;
                }
                else
                {
                    endcap = this.TRUE_ORBIT;
                }

                promiseArray.push(this.generateLeg(geometryCollection1, geometryCollection2, p0, p1, altitudeInformation,
                        this.LINE_WIDTH, endcap, shapeColor, skeleton, boundaryAlert, preShow, postShow,
                        tessellationConfiguration));
            }

            Cesium.when.all(promiseArray).then(emp.$.proxy(function (results)
            {
                //all(promiseArray).then(lang.hitch(this, function (results) {

                try
                {

                    //render the shape
                    retObj = this.renderShape(skeleton, geometryCollection1, geometryCollection2, shapeColor, boundaryAlert,
                            preShow, postShow);

                    //resolve the deferred
                    deferred.resolve(retObj);
                }
                catch (error)
                {
                    console.log('AirspaceMapView._addLine: ' + error);
                    deferred.reject('AirspaceMapView._addLine, Inner: ' + error);
                }
            }
//                        , function (err) {
//                            console.log('AirspaceMapView._addLine: errBack ' + err);
//                            deferred.reject(err);
//                        }
            , this));

            return deferred.promise;
        }
        catch (error)
        {
            console.log('AirspaceMapView._addLine: ' + error);
        }
    };
   this.addOrbit= function (orbit, shapeColor, skeleton, boundaryAlert, preShow, postShow)
    {

        var alertColorGrid = null;
        var altitudeInformation = null;
        var appearance = null;
        var bearing = null;
        var deferred = null;
        var feature = null;
        var geometryCollection1 = null;
        var geometryCollection2 = null;
        var leg = null;
        var p0 = null;
        var p1 = null;
        var promiseArray = null;
        var retObj = null;
        var tessellationConfiguration = null;
        var width = null;

        try
        {

            leg = orbit.AirspaceLegs[0];
            geometryCollection1 = [];
            geometryCollection2 = [];
            promiseArray = [];
            width = (leg.WidthLeft / 2);

            deferred = Cesium.when.defer();/////new Deferred();
            altitudeInformation = this.calculateAltitudeInformation(orbit, leg);
            tessellationConfiguration = this.determineAdequateTerrainDetailToRenderAGL(orbit.AirspacePoints);

            //bearing = mapUtils.bearingBetween(orbit.AirspacePoints[0], orbit.AirspacePoints[1]);
            var latLon0 = new LatLon(orbit.AirspacePoints[0].Latitude, orbit.AirspacePoints[0].Longitude);
            var latLon1 = new LatLon(orbit.AirspacePoints[1].Latitude, orbit.AirspacePoints[1].Longitude);
            bearing = latLon0.bearingTo(latLon1);

            if (leg.AirspaceTurnType === AIRSPACE_TURN_TYPE.LEFT.Value)
            {

                //p0 = mapUtils.destinationPoint(orbit.AirspacePoints[0], (bearing - 90), width);
                //p1 = mapUtils.destinationPoint(orbit.AirspacePoints[1], (bearing - 90), width);
                p0 = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": orbit.AirspacePoints[0].Latitude, "x": orbit.AirspacePoints[0].Longitude}, width, (bearing - 90));
                p1 = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": orbit.AirspacePoints[1].Latitude, "x": orbit.AirspacePoints[1].Longitude}, width, (bearing - 90));
            }
            else if (leg.AirspaceTurnType === AIRSPACE_TURN_TYPE.RIGHT.Value)
            {

                //p0 = mapUtils.destinationPoint(orbit.AirspacePoints[0], (bearing + 90), width);
                //p1 = mapUtils.destinationPoint(orbit.AirspacePoints[1], (bearing + 90), width);
                p0 = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": orbit.AirspacePoints[0].Latitude, "x": orbit.AirspacePoints[0].Longitude}, width, (bearing + 90));
                p1 = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": orbit.AirspacePoints[1].Latitude, "x": orbit.AirspacePoints[1].Longitude}, width, (bearing + 90));

            }
            else
            {
                p0 = orbit.AirspacePoints[0];
                p1 = orbit.AirspacePoints[1];
            }

            //In reality there are not multiple legs like lines, tracks and routes, but consistency is a virtue.
            promiseArray.push(this.generateLeg(geometryCollection1, geometryCollection2, p0, p1, altitudeInformation,
                    width, this.TRUE_ORBIT, shapeColor, skeleton, boundaryAlert, preShow, postShow, tessellationConfiguration));

            Cesium.when.all(promiseArray).then(emp.$.proxy(function (results)
            {
                // all(promiseArray).then(lang.hitch(this, function (results) {

                try
                {

                    //render the shape
                    retObj = this.renderShape(skeleton, geometryCollection1, geometryCollection2, shapeColor, boundaryAlert,
                            preShow, postShow);

                    //resolve the deferred
                    deferred.resolve(retObj);
                }
                catch (error)
                {
                    console.log('AirspaceMapView._addOrbit: ' + error);
                    deferred.reject('AirspaceMapView._addOrbit, Inner: ' + error);
                }
            }
//                        , function (err) {
//                            console.log('AirspaceMapView._addOrbit: errBack ' + err);
//                            deferred.reject(err);
//                        }
            , this));

            return deferred.promise;
        }
        catch (error)
        {
            console.log('AirspaceMapView._addOrbit: ' + error);
        }
    };
    // Generates a Point shape
    this.addPoint= function (point, skeleton)
    {

        var feature = null;
        var iconURL = null;
        var maxTerrainAltitude = null;
        var pixelOffset = null;

        try
        {

            if (point.AirspacePoints[0] === undefined)
            {
                return feature;
            }

            //maxTerrainAltitude = lengthUtils.convertToSI(point.MaxTerrainAltitude, ALTITUDE_UNITS.FT.Value, 0) + this.ACP_PAD;
            maxTerrainAltitude += +this.ACP_PAD;

            // images are 35 pixels - scale is .5 which makes them really 17 by 17
            pixelOffset = new Cesium.Cartesian2(8, 8);

            if (point.Color === COLOR.BLACK.Id)
            {
                iconURL = this.MAP_IMAGES + 'acp_black.png';
            }
            else if (point.Color === COLOR.BLUE.Id)
            {
                iconURL = this.MAP_IMAGES + 'acp_blue.png';
            }
            else if (point.Color === COLOR.GREEN.Id)
            {
                iconURL = this.MAP_IMAGES + 'acp_green.png';
            }
            else if (point.Color === COLOR.RED.Id)
            {
                iconURL = this.MAP_IMAGES + 'acp_red.png';
            }
            else if (point.Color === COLOR.YELLOW.Id)
            {
                iconURL = this.MAP_IMAGES + 'acp_yellow.png';
            }
            else if (point.Color === COLOR.FUCHSIA.Id)
            {
                iconURL = this.MAP_IMAGES + 'acp_fuchsia.png';
            }
            else if (point.Color === COLOR.MAROON.Id)
            {
                iconURL = this.MAP_IMAGES + 'acp_maroon.png';
            }
            else if (point.Color === COLOR.AQUA.Id)
            {
                iconURL = this.MAP_IMAGES + 'acp_aqua.png';
            }
            else if (point.Color === COLOR.OLIVE.Id)
            {
                iconURL = this.MAP_IMAGES + 'acp_olive.png';
            }
            else if (point.Color === COLOR.NAVY.Id)
            {
                iconURL = this.MAP_IMAGES + 'acp_navy.png';
            }
            else if (point.Color === COLOR.SILVER.Id)
            {
                iconURL = this.MAP_IMAGES + 'acp_silver.png';
            }
            else if (point.Color === COLOR.LIME.Id)
            {
                iconURL = this.MAP_IMAGES + 'acp_lime.png';
            }
            else if (point.Color === COLOR.PURPLE.Id)
            {
                iconURL = this.MAP_IMAGES + 'acp_purple.png';
            }
            else if (point.Color === COLOR.GRAY.Id)
            {
                iconURL = this.MAP_IMAGES + 'acp_gray.png';
            }
            else if (point.Color === COLOR.TEAL.Id)
            {
                iconURL = this.MAP_IMAGES + 'acp_teal.png';
            }
            else
            {
                //default to gray
                iconURL = this.MAP_IMAGES + 'acp_gray.png';
            }

            console.log('AirspaceMapView._addPoint, Terrain = ' + maxTerrainAltitude);
            feature = this.generatePointFeature(iconURL, point.AirspacePoints[0], 0.5, pixelOffset, maxTerrainAltitude);
        }
        catch (error)
        {
            console.log('AirspaceMapView._addPoint: ' + error);
        }

        return feature;
    };
    // Generates a polyarc shape
   this.addPolyarc= function (polyarc, shapeColor, skeleton, boundaryAlert, preShow, postShow)
    {

        var alertColorGrid = null;
        var altitudeInformation = null;
        var appearance = null;
        var azimuthLeft = null;
        var azimuthRight = null;
        var deferred = null;
        var degrees = null;
        var geometryCollection1 = null;
        var geometryCollection2 = null;
        var i = null;
        var leg = null;
        var point = null;
        var points = null;
        var pointList = null;
        var radius = null;
        var retObj = {};
        var tmpPoint = null;
        var width = null;

        try
        {
            geometryCollection1 = [];
            geometryCollection2 = [];
            pointList = [];

            deferred = Cesium.when.defer(); //////new Deferred();

            leg = polyarc.AirspaceLegs[0];
            point = polyarc.AirspacePoints[0];
            points = polyarc.AirspacePoints;
            altitudeInformation = this.calculateAltitudeInformation(polyarc, leg);

            // determine distance between first and second point
            radius = leg.Radius;

            // determine left azimuth
            azimuthLeft = leg.AzimuthLeft;

            // determine right azimuth
            azimuthRight = leg.AzimuthRight;

            if (azimuthRight < azimuthLeft)
            {
                azimuthRight = azimuthRight + 360;
            }

            for (degrees = azimuthRight; azimuthLeft < degrees; degrees = degrees - this.CYLINDER_STEP)
            {

                //tmpPoint = mapUtils.destinationPoint(point, degrees, radius);
                tmpPoint = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": point.Latitude, "x": point.Longitude}, radius, degrees);
                pointList.push(tmpPoint);
            }

            for (i = 1; i < points.length; i++)
            {

                pointList.push(points[i]);
            }

            //close the shape
            //tmpPoint = mapUtils.destinationPoint(point, azimuthRight, radius);
            tmpPoint = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": point.Latitude, "x": point.Longitude}, radius, azimuthRight);
            pointList.push(tmpPoint);

            this.generatePoligonalShape(geometryCollection1, geometryCollection2, pointList, altitudeInformation,
                    shapeColor, skeleton, boundaryAlert, preShow, postShow).then(emp.$.proxy(function (results)
            {
                //shapeColor, skeleton, boundaryAlert, preShow, postShow).then(lang.hitch(this, function (results) {

                try
                {

                    //render the shape
                    retObj = this.renderShape(skeleton, geometryCollection1, geometryCollection2, shapeColor, boundaryAlert,
                            preShow, postShow);

                    //resolve the deferred
                    deferred.resolve(retObj);
                }
                catch (error)
                {
                    console.log('AirspaceMapView._addPolyarc: ' + error);
                    deferred.reject('AirspaceMapView._addPolyarc, Inner: ' + error);
                }
            }
//                        , function (err) {
//                            console.log('AirspaceMapView._addPolyarc: errBack ' + err);
//                            deferred.reject(err);
//                        }
            , this));

            return deferred.promise;
        }
        catch (error)
        {
            console.log('AirspaceMapView._addPolyarc: ' + error);
        }
    };
    this.addPolygon= function (polygon, shapeColor, skeleton, boundaryAlert, preShow, postShow)
    {

        var alertColorGrid = null;
        var altitudeInformation = null;
        var appearance = null;
        var deferred = null;
        var geometryCollection1 = null;
        var geometryCollection2 = null;
        var i = null;
        var leg = null;
        var point = null;
        var pointList = null;
        var points = null;
        var retObj = {};

        try
        {

            geometryCollection1 = [];
            geometryCollection2 = [];
            pointList = [];

            leg = polygon.AirspaceLegs[0];
            points = polygon.AirspacePoints;

            deferred = Cesium.when.defer(); //////////new Deferred();

            altitudeInformation = this.calculateAltitudeInformation(polygon, leg);

            for (i = 0; i < points.length; i++)
            {

                point = points[i];

                pointList.push(point);
            }

            //close the polygon if needed
            if ((point.Longitude !== points[0].Longitude) && (point.Latitude) !== points[0].Latitude)
            {
                pointList.push(points[0]);
            }

            this.generatePoligonalShape(geometryCollection1, geometryCollection2, pointList, altitudeInformation,
                    shapeColor, skeleton, boundaryAlert, preShow, postShow).then(emp.$.proxy(function (results)
            {
                // shapeColor, skeleton, boundaryAlert, preShow, postShow).then(lang.hitch(this, function (results) {

                try
                {

                    //render the shape
                    retObj = this.renderShape(skeleton, geometryCollection1, geometryCollection2, shapeColor, boundaryAlert,
                            preShow, postShow);

                    //resolve the deferred
                    deferred.resolve(retObj);
                }
                catch (error)
                {
                    console.log('AirspaceMapView._addPolygon: ' + error);
                    deferred.reject('AirspaceMapView._addPolygon, Inner: ' + error);
                }
            }
//                        , function (err) {
//                            console.log('AirspaceMapView._addPolygon: errBack ' + err);
//                            deferred.reject(err);
//                        }
            , this));

            return deferred.promise;
        }
        catch (error)
        {
            console.log('AirspaceMapView._addPolygon: ' + error);
        }
    };
    // Generates a radarc shape
    this.addRadarc= function (radarc, shapeColor, skeleton, boundaryAlert, preShow, postShow)
    {

        var alertColorGrid = null;
        var altitudeInformation = null;
        var appearance = null;
        var azimuthLeft = null;
        var azimuthRight = null;
        var deferred = null;
        var degrees = null;
        var feature = null;
        var geometryCollection1 = null;
        var geometryCollection2 = null;
        var leg = null;
        var point = null;
        var pointList = null;
        var radiusInner = null;
        var radiusOuter = null;
        var retObj = {};
        var tmpPoint = null;
        var width = null;

        try
        {

            geometryCollection1 = [];
            geometryCollection2 = [];
            pointList = [];

            leg = radarc.AirspaceLegs[0];
            point = radarc.AirspacePoints[0];

            deferred = Cesium.when.defer();//////new Deferred();

            altitudeInformation = this.calculateAltitudeInformation(radarc, leg);

            // determine distance between first and second point
            radiusInner = leg.Radius;

            // determine distance between first and third point
            radiusOuter = leg.OuterRadius;

            // determine left azimuth
            azimuthLeft = leg.AzimuthLeft;

            // determine right azimuth
            azimuthRight = leg.AzimuthRight;

            if (azimuthRight < azimuthLeft)
            {
                azimuthRight = azimuthRight + 360;
            }

            for (degrees = azimuthLeft; degrees < azimuthRight; degrees = degrees + this.CYLINDER_STEP)
            {

                //tmpPoint = mapUtils.destinationPoint(point, degrees, radiusInner);
                tmpPoint = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": point.Latitude, "x": point.Longitude}, radiusInner, degrees);

                pointList.push(tmpPoint);
            }

            //tmpPoint = mapUtils.destinationPoint(point, azimuthRight, radiusInner);
            tmpPoint = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": point.Latitude, "x": point.Longitude}, radiusInner, azimuthRight);
            pointList.push(tmpPoint);

            //tmpPoint = mapUtils.destinationPoint(point, azimuthRight, radiusOuter);
            tmpPoint = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": point.Latitude, "x": point.Longitude}, radiusOuter, azimuthRight);
            pointList.push(tmpPoint);

            for (degrees = azimuthRight; azimuthLeft < degrees; degrees = degrees - this.CYLINDER_STEP)
            {

                //tmpPoint = mapUtils.destinationPoint(point, degrees, radiusOuter);
                tmpPoint = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": point.Latitude, "x": point.Longitude}, radiusOuter, degrees);
                pointList.push(tmpPoint);
            }

            //tmpPoint = mapUtils.destinationPoint(point, azimuthLeft, radiusOuter);
            tmpPoint = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": point.Latitude, "x": point.Longitude}, radiusOuter, azimuthLeft);
            pointList.push(tmpPoint);

            //tmpPoint = mapUtils.destinationPoint(point, azimuthLeft, radiusInner);
            tmpPoint = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": point.Latitude, "x": point.Longitude}, radiusInner, azimuthLeft);
            pointList.push(tmpPoint);

            this.generatePoligonalShape(geometryCollection1, geometryCollection2, pointList, altitudeInformation,
                    shapeColor, skeleton, boundaryAlert, preShow, postShow).then(emp.$.proxy(function (results)
            {
                //shapeColor, skeleton, boundaryAlert, preShow, postShow).then(lang.hitch(this, function (results) {

                try
                {

                    //render the shape
                    retObj = this.renderShape(skeleton, geometryCollection1, geometryCollection2, shapeColor, boundaryAlert,
                            preShow, postShow);

                    //resolve the deferred
                    deferred.resolve(retObj);
                }
                catch (error)
                {
                    console.log('AirspaceMapView._addRadarc: ' + error);
                    deferred.reject('AirspaceMapView._addRadarc, Inner: ' + error);
                }
            }
//                        , function (err) {
//                            console.log('AirspaceMapView._addRadarc: errBack ' + err);
//                            deferred.reject(err);
//                        }
            , this));

            return deferred.promise;
        }
        catch (error)
        {
            console.log('AirspaceMapView._addRadarc: ' + error);
        }
    };
    this.addRoute= function (route, shapeColor, skeleton, boundaryAlert, preShow, postShow)
    {

        var alertColorGrid = null;
        var altitudeInformation = null;
        var appearance = null;
        var deferred = null;
        var endcap = null;
        var feature = null;
        var geometryCollection1 = null;
        var geometryCollection2 = null;
        var i = null;
        var leg = null;
        var p0 = null;
        var p1 = null;
        var promiseArray = null;
        var retObj = null;
        var tessellationConfiguration = null;
        var width = null;

        try
        {

            leg = route.AirspaceLegs[0];
            geometryCollection1 = [];
            geometryCollection2 = [];
            promiseArray = [];
            width = (leg.WidthLeft / 2);

            deferred = Cesium.when.defer();////new Deferred();

            altitudeInformation = this.calculateAltitudeInformation(route, leg);
            tessellationConfiguration = this.determineAdequateTerrainDetailToRenderAGL(route.AirspacePoints);

            for (i = 0; i < route.AirspacePoints.length - 1; i++)
            {

                p0 = route.AirspacePoints[i];
                p1 = route.AirspacePoints[i + 1];

                if ((i === 0) && (route.AirspacePoints.length === 2))
                {
                    endcap = this.BOTH_ENDCAP;
                }
                else if (i === 0)
                {
                    endcap = this.STARTING_ENDCAP;
                }
                else if (i === route.AirspacePoints.length - 2)
                {
                    endcap = this.ENDING_ENDCAP;
                }
                else
                {
                    endcap = this.TRUE_ORBIT;
                }

                promiseArray.push(this.generateLeg(geometryCollection1, geometryCollection2, p0, p1, altitudeInformation,
                        width, endcap, shapeColor, skeleton, boundaryAlert, preShow, postShow, tessellationConfiguration));
            }

            Cesium.when.all(promiseArray).then(emp.$.proxy(function (results)
            {
                //all(promiseArray).then(lang.hitch(this, function (results) {

                try
                {

                    //render the shape
                    retObj = this.renderShape(skeleton, geometryCollection1, geometryCollection2, shapeColor, boundaryAlert,
                            preShow, postShow);

                    //resolve the deferred
                    deferred.resolve(retObj);
                }
                catch (error)
                {
                    console.log('AirspaceMapView._addRoute: ' + error);
                    deferred.reject('AirspaceMapView._addRoute, Inner: ' + error);
                }
            }
//                        , function (err) {
//                            console.log('AirspaceMapView._addRoute: errBack ' + err);
//                            deferred.reject(err);
//                        }
            , this));

            return deferred.promise;
        }
        catch (error)
        {
            console.log('AirspaceMapView._addRoute: ' + error);
        }
    };
    this.addTrack= function (track, shapeColor, skeleton, boundaryAlert, preShow, postShow)
    {

        var alertColorGrid = null;
        var altitudeInformation = null;
        var appearance = null;
        var bearing = null;
        var centerOffset = null;
        var deferred = null;
        var endcap = null;
        var feature = null;
        var geometryCollection1 = null;
        var geometryCollection2 = null;
        var i = null;
        var leg = null;
        var p0 = null;
        var p1 = null;
        var promiseArray = null;
        var retObj = null;
        var tessellationConfiguration = null;
        var width = null;

        try
        {

            geometryCollection1 = [];
            geometryCollection2 = [];
            leg = track.AirspaceLegs;
            promiseArray = [];

            deferred = Cesium.when.defer(); ////new Deferred();
            tessellationConfiguration = this.determineAdequateTerrainDetailToRenderAGL(track.AirspacePoints);

            for (i = 0; i < track.AirspacePoints.length - 1; i++)
            {

                altitudeInformation = this.calculateAltitudeInformation(track, leg[i]);

                width = (track.AirspaceLegs[i].WidthLeft + track.AirspaceLegs[i].WidthRight) / 2;
                centerOffset = (track.AirspaceLegs[i].WidthRight - track.AirspaceLegs[i].WidthLeft) / 2;

//                            bearing = mapUtils.bearingBetween(track.AirspacePoints[i], track.AirspacePoints[i + 1]);
//                            p0 = mapUtils.destinationPoint(track.AirspacePoints[i], (bearing + 90), centerOffset);
//                            p1 = mapUtils.destinationPoint(track.AirspacePoints[i + 1], (bearing + 90), centerOffset);

                var latLon0 = new LatLon(track.AirspacePoints[i].Latitude, track.AirspacePoints[i].Longitude);
                var latLon1 = new LatLon(track.AirspacePoints[i + 1].Latitude, track.AirspacePoints[i + 1].Longitude);
                bearing = latLon0.bearingTo(latLon1);
                p0 = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": latLon0._lat, "x": latLon0._lon}, centerOffset, bearing + 90);
                p1 = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": latLon1._lat, "x": latLon1._lon}, centerOffset, bearing + 90);


                ////p0 = new AirspacePoint();
                ////p0.Latitude = latLon0._lat;
                ////p0.Longitude = latLon0._lon;

                ///p1 = new AirspacePoint();
                ////p1.Latitude = latLon1._lat;
                ////p1.Longitude = latLon1._lon;

                //p0 = {Longitude: latLon0._lon, Latitude: latLon0._lat};
                //p1 = {Longitude: latLon1._lon, Latitude: latLon1._lat};

                if ((i === 0) && (track.AirspacePoints.length === 2))
                {
                    endcap = this.BOTH_ENDCAP;
                }
                else if (i === 0)
                {
                    endcap = this.STARTING_ENDCAP;
                }
                else if (i === track.AirspacePoints.length - 2)
                {
                    endcap = this.ENDING_ENDCAP;
                }
                else
                {
                    endcap = this.TRUE_ORBIT;
                }

                promiseArray.push(this.generateLeg(geometryCollection1, geometryCollection2, p0, p1, altitudeInformation,
                        width, endcap, shapeColor, skeleton, boundaryAlert, preShow, postShow, tessellationConfiguration));
            }

            Cesium.when.all(promiseArray).then(emp.$.proxy(function (results)
            {
                //all(promiseArray).then(lang.hitch(this, function (results) {

                try
                {

                    //render the shape
                    retObj = this.renderShape(skeleton, geometryCollection1, geometryCollection2, shapeColor, boundaryAlert,
                            preShow, postShow);

                    //resolve the deferred
                    deferred.resolve(retObj);
                }
                catch (error)
                {
                    console.log('AirspaceMapView._addTrack: ' + error);
                    deferred.reject('AirspaceMapView._addTrack, Inner: ' + error);
                }
            }
//                        , function (err) {
//                            console.log('AirspaceMapView._addTrack: errBack ' + err);
//                            deferred.reject(err);
//                        }
            , this));

            return deferred.promise;
        }
        catch (error)
        {
            console.log('AirspaceMapView._addTrack: ' + error);
        }
    };
    this.calculateAltitudeInformation= function (shape, leg)
    {

        var altitudeLower = null;
        var altitudeUpper = null;
        var bottomAGL = null;
        var maxTerrainAltitude = null;
        var minTerrainAltitude = null;
        var topAGL = null;

        try
        {

            if (leg.AltitudeRange.LowerAltitudeType === ALTITUDE_TYPE.FL.Value)
            {
                //altitudeLower = lengthUtils.convertToSI(leg.AltitudeRange.LowerAltitude, ALTITUDE_UNITS.FT.Value, 0) * 100;
                // acevedo - altitudes from emp are already in meters so no need for conversion.. Just multiply by the 100.
                //altitudeLower = lengthUtils.convertToSI(leg.AltitudeRange.LowerAltitude, ALTITUDE_UNITS.FT.Value, 0) * 100;
                altitudeLower = leg.AltitudeRange.LowerAltitude * 100;
                bottomAGL = false;
            }
            else
            {
                //altitudeLower = lengthUtils.convertToSI(leg.AltitudeRange.LowerAltitude, ALTITUDE_UNITS.FT.Value, 0);
                altitudeLower = leg.AltitudeRange.LowerAltitude;
                if (leg.AltitudeRange.LowerAltitudeType === ALTITUDE_TYPE.AGL.Value)
                {
                    bottomAGL = true;
                }
                else
                {
                    bottomAGL = false;
                }
            }

            if (leg.AltitudeRange.UpperAltitudeType === ALTITUDE_TYPE.FL.Value)
            {
                //altitudeUpper = lengthUtils.convertToSI(leg.AltitudeRange.UpperAltitude, ALTITUDE_UNITS.FT.Value, 0) * 100;
                altitudeUpper = leg.AltitudeRange.UpperAltitude * 100;
                topAGL = false;
            }
            else
            {
                //altitudeUpper = lengthUtils.convertToSI(leg.AltitudeRange.UpperAltitude, ALTITUDE_UNITS.FT.Value, 0);
                altitudeUpper = leg.AltitudeRange.UpperAltitude;
                if (leg.AltitudeRange.UpperAltitudeType === ALTITUDE_TYPE.AGL.Value)
                {
                    topAGL = true;
                }
                else
                {
                    topAGL = false;
                }
            }

            if (bottomAGL || topAGL)
            {
                //maxTerrainAltitude = lengthUtils.convertToSI(shape.MaxTerrainAltitude, ALTITUDE_UNITS.FT.Value, 0);
                //minTerrainAltitude = lengthUtils.convertToSI(shape.MinTerrainAltitude, ALTITUDE_UNITS.FT.Value, 0);
                maxTerrainAltitude = shape.MaxTerrainAltitude;
                minTerrainAltitude = shape.MinTerrainAltitude;
            }

            return this.createAltitudeInformationObject(bottomAGL, topAGL, altitudeLower, altitudeUpper, maxTerrainAltitude, minTerrainAltitude);
        }
        catch (error)
        {
            console.log('AirspaceMapView._calculateAltitudeInformation: ' + error);
        }
    };
    this.createShape= function (id, airspace, opacity, skeleton, boundaryAlert, preShow, postShow)
    {

        var airspaceColor = null;
        var airspaceShapeType = null;
        var color = null;
        var deferred = null;
        var feature = null;
        var primitiveCollection = null;

        try
        {

            color = this.convertColor(airspace.Color);
            airspaceShapeType = airspace.AirspaceShapeType;
            //color = Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(airspaceColor.red, airspaceColor.green,
            //        airspaceColor.blue, opacity));
            //color = Cesium.ColorGeometryInstanceAttribute.fromColor(color);

            deferred = Cesium.when.defer(); //////new Deferred();

            if (airspaceShapeType === AIRSPACE_SHAPE_TYPE.CYLINDER.Value)
            {

                feature = this.addCylinder(airspace, color, skeleton, boundaryAlert, preShow, postShow);
            }
            else if (airspaceShapeType === AIRSPACE_SHAPE_TYPE.RADARC.Value)
            {

                feature = this.addRadarc(airspace, color, skeleton, boundaryAlert, preShow, postShow);
            }
            else if (airspaceShapeType === AIRSPACE_SHAPE_TYPE.POLYARC.Value)
            {

                feature = this.addPolyarc(airspace, color, skeleton, boundaryAlert, preShow, postShow);
            }
            else if (airspaceShapeType === AIRSPACE_SHAPE_TYPE.LINE.Value)
            {

                feature = this.addLine(airspace, color, skeleton, boundaryAlert, preShow, postShow);
            }
            else if (airspaceShapeType === AIRSPACE_SHAPE_TYPE.ORBIT.Value)
            {

                feature = this.addOrbit(airspace, color, skeleton, boundaryAlert, preShow, postShow);
            }
            else if (airspaceShapeType === AIRSPACE_SHAPE_TYPE.POINT.Value)
            {

                feature = this.addPoint(airspace, skeleton);
            }
            else if (airspaceShapeType === AIRSPACE_SHAPE_TYPE.POLYGON.Value)
            {

                feature = this.addPolygon(airspace, color, skeleton, boundaryAlert, preShow, postShow);
            }
            else if (airspaceShapeType === AIRSPACE_SHAPE_TYPE.ROUTE.Value)
            {

                feature = this.addRoute(airspace, color, skeleton, boundaryAlert, preShow, postShow);
            }
            else if (airspaceShapeType === AIRSPACE_SHAPE_TYPE.TRACK.Value)
            {

                feature = this.addTrack(airspace, color, skeleton, boundaryAlert, preShow, postShow);
            }
            else
            {
                console.info('Unknown shape: ' + airspaceShapeType);
            }

            if (!feature)
            {
                return null;
            }
            else
            {
                //append emp feature information
                feature.name = airspace.empArg.name;
                feature.description = airspace.empArg.properties.description;
                feature.overlayId = airspace.empArg.overlayId;
                feature.featureId = airspace.empArg.featureId;
                feature.parentId = airspace.empArg.parentId;
                feature.coreId = airspace.empArg.coreId;
                feature.parentCoreId = airspace.empArg.parentCoreId;
                feature.parentType = airspace.parenttType;


            }

            Cesium.when(feature, emp.$.proxy(function (airspaceGeometry)
            {
                //when(feature, lang.hitch(thempArgis, function (airspaceGeometry) {

                try
                {
                    if (airspaceGeometry)
                    {
                        airspaceGeometry.name = feature.name;
                        airspaceGeometry.description = feature.description;
                        airspaceGeometry.overlayId = feature.overlayId;
                        airspaceGeometry.featureId = feature.featureId;
                        airspaceGeometry.parentId = feature.parentId;
                        airspaceGeometry.coreId = feature.coreId;
                        airspaceGeometry.parentCoreId = feature.parentCoreId;
                        airspaceGeometry.parentType = feature.parentType;
                        airspaceGeometry._editMode = true;
                        var empLayer = this.mapView.getEmpCesium().getLayer(feature.parentCoreId);

                        if (empLayer)
                        {
                            if (airspaceGeometry.wallAndTop && airspaceGeometry.bottom)
                            {
                                airspaceGeometry.bottom.id = id + "_1";
                                airspaceGeometry.wallAndTop.id = id;

                                //this.scene.primitives.add(airspaceGeometry.bottom);
                                //this.scene.primitives.add(airspaceGeometry.wallAndTop);
                                airspaceGeometry.bottom.featureType = EmpCesiumConstants.featureType.PRIMITIVE;
                                airspaceGeometry.wallAndTop.featureType = EmpCesiumConstants.featureType.PRIMITIVE;
                                primitiveCollection = new Cesium.PrimitiveCollection();
                                primitiveCollection.name = feature.name;
                                primitiveCollection.description = feature.description;
                                primitiveCollection.overlayId = feature.overlayId;
                                primitiveCollection.featureId = feature.featureId;
                                primitiveCollection.parentId = feature.parentId;
                                primitiveCollection.coreId = feature.coreId;
                                primitiveCollection.parentCoreId = feature.parentCoreId;
                                primitiveCollection.parentType = feature.parentType;
                                primitiveCollection.featureType = EmpCesiumConstants.featureType.PRIMITIVE_COLLECTION;
                                primitiveCollection._editMode = true;
                                primitiveCollection.add(airspaceGeometry.bottom);
                                primitiveCollection.add(airspaceGeometry.wallAndTop);
                                if (feature.coreParent && feature.parentType === 'feature' && empLayer.isFeaturePresentById(feature.coreParent))
                                {
                                    // has a parent feature
                                    var parentPrimitive = empLayer.getFeature(feature.coreParent);
                                    empLayer.addFeatureChild(parentPrimitive, primitiveCollection);
                                }
                                else
                                {
                                  empLayer.addFeature(primitiveCollection);
                                }
                                //primitiveCollection.show = airspace.visible;
                                //empLayer.addFeature(primitiveCollection);
                                //empLayer.addFeature(airspaceGeometry.bottom);
                                //empLayer.addFeature(airspaceGeometry.wallAndTop);

                            }
                            else
                            {
                                airspaceGeometry.featureType = EmpCesiumConstants.featureType.PRIMITIVE;
                                airspaceGeometry.id = id;
                                airspaceGeometry.show = airspace.visible;
                                empLayer.addFeature(airspaceGeometry);
                                //this.mapView.getEmpcesium().viewer.dataSourceDisplay.update(Cesium.JulianDate.fromDate(new Date()));
                                // setting visibilty to false at the primitive level is breaking the map. I need to set the visibility inside the geometry instance attribute.
//                                //airspaceGeometry.show = airspace.visible;
//                                for (var geoIntancesIndex =0;geoIntancesIndex < airspaceGeometry.geometryInstances.length;geoIntancesIndex++)
//                                {
//                                    var geoIntance = airspaceGeometry.geometryInstances[geoIntancesIndex];
//                                    if (geoIntance.attributes)
//                                    {
//                                        geoIntance.attributes.show = new Cesium.ShowGeometryInstanceAttribute(airspace.visible);
//                                    }
//                                }
                                //this.scene.primitives.add(airspaceGeometry);
                            }
                        }
                        else
                        {

                        }
                    }
                    else
                    {
                        console.info('AirspaceMapView._createShape: No airspaceGeometry created');
                    }
                }
                catch (error)
                {
                    console.log('AirspaceMapView._createShape: ' + error);

                    deferred.reject('AirspaceMapView._createShape: ' + error);
                }

                deferred.resolve(airspaceGeometry);
            }, this));

            return deferred.promise;
        }
        catch (error)
        {
            console.log('AirspaceMapView._createShape: error: ' + error);
        }
    };
    this.deleteAirspace= function (feature)
    {

        try
        {

            if (feature.wallAndTop && feature.bottom)
            {

                this.scene.primitives.remove(feature.bottom);
                this.scene.primitives.remove(feature.wallAndTop);
            }
            else
            {
                this.scene.primitives.remove(feature);
            }
        }
        catch (error)
        {
            console.log('AirspaceMapView.deleteAirspace: ' + error);
        }
    };
    this.renderShape= function (skeleton, geometryCollection1, geometryCollection2, shapeColor, boundaryAlert, preShow, postShow)
    {

        var alertColorGrid = null;
        var appearance = null;
        var retObj = null;

        var material = new Cesium.Material.fromType("Color", {outlineWidth: Math.min(2.0, this.scene.maximumAliasedLineWidth),
            outlineColor: Cesium.Color.BLACK});
        material.uniforms.color = shapeColor;
        shapeColor = Cesium.ColorGeometryInstanceAttribute.fromColor(shapeColor);


        try
        {

            if (skeleton)
            {

                //appearance = new Cesium.MaterialAppearance({
                appearance = new Cesium.PerInstanceColorAppearance({
                    flat: true,
                    renderState: {
                        lineWidth: Math.min(2.0, this.scene.maximumAliasedLineWidth)
                    }
                    //material: material
                });

                retObj = this.createFeature(geometryCollection1, true, appearance);
            }
            else
            {

                if (geometryCollection2.length === 0)
                {
                    //acevedo modification  starts
                    // create a new instance of appearance and set the material
                    // that contains the color assigned to the shape
                    appearance = new Cesium.MaterialAppearance({
                        //flat: true,
                        //renderState: {
                        //    lineWidth: Math.min(2.0, this.scene.maximumAliasedLineWidth)
                        //},
                        material: material,
                        translucent: true,
                        closed: true,
                        flat: true,
                        renderState: {
                            lineWidth: Math.min(2.0, this.scene.maximumAliasedLineWidth),
                            lineColor: Cesium.Color.BLACK
                        },
                        faceForward: false
                    });
                    //acevedo modification ends
                    retObj = this.createFeature(geometryCollection1, true, appearance);
                }
                else
                {

                    retObj = {};

                    if (preShow && (preShow === true))
                    {

                        //Yellow Grid
                        alertColorGrid = Cesium.Color.YELLOW;
                    }
                    else if (postShow && (postShow === true))
                    {

                        alertColorGrid = Cesium.Color.RED;
                    }
                    else
                    {
                        alertColorGrid = Cesium.Color.fromBytes(shapeColor.value[0], shapeColor.value[1], shapeColor.value[2],
                                shapeColor.value[3]);
                    }

                    if (preShow && (preShow === true))
                    {
                        appearance = new Cesium.MaterialAppearance({
                            material: Cesium.Material.fromType('Grid', {
                                color: alertColorGrid
                            })
                        });
                    }
                    else if (postShow && (postShow === true))
                    {
                        appearance = new Cesium.MaterialAppearance({
                            material: Cesium.Material.fromType('Grid', {
                                color: alertColorGrid
                            })
                        });
                    }
                    else if (boundaryAlert && (boundaryAlert === true))
                    {
                        appearance = new Cesium.MaterialAppearance({
                            material: Cesium.Material.fromType('Grid', {
                                color: alertColorGrid
                            })
                        });
                    }

                    retObj.bottom = this.createFeature(geometryCollection2, true, appearance);

                    appearance = null;
                    retObj.wallAndTop = this.createFeature(geometryCollection1, true, appearance);
                }
            }

            return retObj;
        }
        catch (error)
        {
            console.log('AirspaceMapView._renderShape: error: ' + error);
        }
    };
};
