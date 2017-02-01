///////////////////////////////////////////////////////////////////////////////
// AirspaceDrawHandler.js
//
// Copyright (c) 2014-2015 General Dynamics Inc.
// The Government has the right to use, modify, reproduce,
// release, perform, display ,or disclose this computer
// software or computer software documentation without restriction.
//
///////////////////////////////////////////////////////////////////////////////

function AirspaceDrawHandler(mapView, mapModel, airspaceMapView, airspaceMapCntrl)
{
//    return declare('app.map.handler.AirspaceDrawHandler', null, {
    this.airspace = null;
    this.airspaceMapCntrl = airspaceMapCntrl;
    this.airspaceMapView = airspaceMapView;
    this.bearing = null;
    this.deferred = null;
    this.dragPoint = null;
    this.drawHelp = null;
    this.feature = null;
    this.handleCollection = null;
    this.labelCollection = null;
    this.legUpdater = null;
    this.mapModel = mapModel;
    this.mapView = mapView;
    this.origAirspace = null;
    this.pixelOffset = null;
    this.pointUpdater = null;
    this.scene = null;
    this.shapePromise = null;
    this.statefulWatchers = null;
    this.NEW_AIRSPACE_OPACITY = 1.00;
    this.VERTICAL_PAD = 50;
    this.BLUE_HANDLE = '/blueHandle32.png';
    this.ORANGE_HANDLE = '/orangeHandle32.png';
    this.PURPLE_HANDLE = '/purpleHandle32.png';
    this.RED_HANDLE = '/redHandle32.png';
    //constructor= function(mapView, mapModel, airspaceMapView, airspaceMapCntrl) {
//    var __construct= function (mapView, mapModel, airspaceMapView, airspaceMapCntrl)
//    {
//
//        this.MapView = mapView;
//        this.MapModel = mapModel;
//
//        this.airspaceMapView = airspaceMapView;
//        this.AirspaceMapCntrl = airspaceMapCntrl;

    this.scene = this.mapView.getScene();
    this.handleCollection = new Cesium.BillboardCollection();
    this.labelCollection = new Cesium.LabelCollection();
    this.pixelOffset = new Cesium.Cartesian2(0, 0);

    this.scene.primitives.add(this.handleCollection);
    this.scene.primitives.add(this.labelCollection);

    this.drawHelp = undefined;
    //this.drawHelp = dom.byId('drawHelp');
//    }(mapView, mapModel, airspaceMapView, airspaceMapCntrl);
    this.addArcDragHandles = function (billboardList, cartographic)
    {

        var bearingCenter = null;
        var dragHandleInner = null;
        var dragHandleLeft = null;
        var dragHandleOuter = null;
        var dragHandlRight = null;
        var id = null;
        var locInner = null;
        var locLeft = null;
        var locOuter = null;
        var locRight = null;

        try
        {

            //Right Handle
            //locRight = mapUtils.destinationPoint(this.airspace.AirspacePoints[0], this.airspace.AirspaceLegs[0].AzimuthRight,
            //        this.airspace.AirspaceLegs[0].Radius);
            locRight = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": this.airspace.AirspacePoints[0].Latitude, "x": this.airspace.AirspacePoints[0].Longitude}, this.airspace.AirspaceLegs[0].Radius, this.airspace.AirspaceLegs[0].AzimuthRight);

            cartographic.push(Cesium.Cartographic.fromDegrees(Number(locRight.Longitude), Number(locRight.Latitude)));

            //Left handle
            //locLeft = mapUtils.destinationPoint(this.airspace.AirspacePoints[0], this.airspace.AirspaceLegs[0].AzimuthLeft,
            //        this.airspace.AirspaceLegs[0].Radius);
            locLeft = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": this.airspace.AirspacePoints[0].Latitude, "x": this.airspace.AirspacePoints[0].Longitude}, this.airspace.AirspaceLegs[0].Radius, this.airspace.AirspaceLegs[0].AzimuthLeft);


            cartographic.push(Cesium.Cartographic.fromDegrees(Number(locLeft.Longitude), Number(locLeft.Latitude)));

            bearingCenter = this.calculateAngleMidpoint();

            //Inner handle
            //locInner = mapUtils.destinationPoint(this.airspace.AirspacePoints[0], bearingCenter,
            //        this.airspace.AirspaceLegs[0].Radius);
            locInner = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": this.airspace.AirspacePoints[0].Latitude, "x": this.airspace.AirspacePoints[0].Longitude}, this.airspace.AirspaceLegs[0].Radius, bearingCenter);


            cartographic.push(Cesium.Cartographic.fromDegrees(Number(locInner.Longitude), Number(locInner.Latitude)));

            if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.RADARC.Value)
            {

                //Outer handle
                //locOuter = mapUtils.destinationPoint(this.airspace.AirspacePoints[0], bearingCenter,
                //        this.airspace.AirspaceLegs[0].OuterRadius);
                locOuter = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": this.airspace.AirspacePoints[0].Latitude, "x": this.airspace.AirspacePoints[0].Longitude}, this.airspace.AirspaceLegs[0].OuterRadius, bearingCenter);

                cartographic.push(Cesium.Cartographic.fromDegrees(Number(locOuter.Longitude), Number(locOuter.Latitude)));
            }

            id = {
                image: this.PURPLE_HANDLE,
                loc: locRight,
                data: {
                    DragHandle: true,
                    Index: billboardList.length,
                    Right: true,
                    type: 'dragRight.' + this.airspace.Id
                }
            };
            billboardList.push(id);

            id = {
                image: this.PURPLE_HANDLE,
                loc: locLeft,
                data: {
                    DragHandle: true,
                    Index: billboardList.length,
                    Left: true,
                    type: 'dragLeft.' + this.airspace.Id
                }
            };
            billboardList.push(id);

            id = {
                image: this.PURPLE_HANDLE,
                loc: locInner,
                data: {
                    DragHandle: true,
                    Index: billboardList.length,
                    Inner: true,
                    type: 'dragInner.' + this.airspace.Id
                }
            };
            billboardList.push(id);

            if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.RADARC.Value)
            {

                id = {
                    image: this.PURPLE_HANDLE,
                    loc: locOuter,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length,
                        Outer: true,
                        type: 'dragOuter.' + this.airspace.Id
                    }
                };
                billboardList.push(id);
            }
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._addArcDragHandles: ' + error);
        }
    };

    this.addDragHandles = function (billboardList, cartographic)
    {

        var dragHandle = null;
        var i = null;
        var loc = null;
        var textHeight = null;

        try
        {

            if ((this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.CYLINDER.Value) ||
                    (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.ROUTE.Value))
            {

                this.addSingleWidthDragHandles(billboardList, cartographic);
            }
            else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.ORBIT.Value)
            {

                this.addOrbitDragHandles(billboardList, cartographic);
            }
            else if ((this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.RADARC.Value) ||
                    (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POLYARC.Value))
            {

                this.addArcDragHandles(billboardList, cartographic);
            }
            else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.TRACK.Value)
            {

                this.addDualWidthDragHandles(billboardList, cartographic);
            }
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._addDragHandles: ' + error);
        }
    };
    this.addDualWidthDragHandles = function (billboardList, cartographic)
    {

        var bearing = null;
        var dragHandleLeft = null;
        var dragHandlRight = null;
        var id = null;
        var locLeft = null;
        var locRight = null;

        try
        {
            for (var index = 0; index < this.airspace.AirspaceLegs.length; index++)
            {
                //Right handle
                //bearing = mapUtils.bearingBetween(this.airspace.AirspacePoints[0], this.airspace.AirspacePoints[1]);
                var latLon0 = new LatLon(this.airspace.AirspacePoints[index].Latitude, this.airspace.AirspacePoints[index].Longitude);
                var latLon1 = new LatLon(this.airspace.AirspacePoints[index + 1].Latitude, this.airspace.AirspacePoints[index + 1].Longitude);
                bearing = latLon0.bearingTo(latLon1);
                bearing = bearing + 90;

                //locRight = mapUtils.destinationPoint(this.airspace.AirspacePoints[0], bearing,
                //        this.airspace.AirspaceLegs[0].WidthRight);
                locRight = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": this.airspace.AirspacePoints[index].Latitude, "x": this.airspace.AirspacePoints[index].Longitude}, this.airspace.AirspaceLegs[index].WidthRight, bearing);


                cartographic.push(Cesium.Cartographic.fromDegrees(Number(locRight.Longitude), Number(locRight.Latitude)));

                id = {
                    image: this.PURPLE_HANDLE,
                    loc: locRight,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length,
                        RadiusWidth: true,
                        Right: true,
                        type: 'dragRight.' + this.airspace.Id,
                        legIndex: index
                    }
                };
                billboardList.push(id);

                //Left handle
                //bearing = mapUtils.bearingBetween(this.airspace.AirspacePoints[0], this.airspace.AirspacePoints[1]);
                var latLon0 = new LatLon(this.airspace.AirspacePoints[index].Latitude, this.airspace.AirspacePoints[index].Longitude);
                var latLon1 = new LatLon(this.airspace.AirspacePoints[index + 1].Latitude, this.airspace.AirspacePoints[index + 1].Longitude);
                bearing = latLon0.bearingTo(latLon1);
                bearing = bearing + 270;

                //locLeft = mapUtils.destinationPoint(this.airspace.AirspacePoints[0], bearing,
                //        this.airspace.AirspaceLegs[0].WidthLeft);
                locLeft = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": this.airspace.AirspacePoints[index].Latitude, "x": this.airspace.AirspacePoints[index].Longitude}, this.airspace.AirspaceLegs[index].WidthLeft, bearing);

                cartographic.push(Cesium.Cartographic.fromDegrees(Number(locLeft.Longitude), Number(locLeft.Latitude)));

                id = {
                    image: this.PURPLE_HANDLE,
                    loc: locLeft,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length,
                        RadiusWidth: true,
                        Left: true,
                        type: 'dragLeft.' + this.airspace.Id,
                        legIndex: index
                    }
                };
                billboardList.push(id);
            }//for
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._addDualWidthDragHandles: ' + error);
        }
    };

    this.addDualAltitudeDragHandles = function (billboardList, cartographic)
    {

        var bearing = null;
        var dragHandleUp = null;
        var dragHandlDown = null;
        var idUp = null;
        var idDown;
        var locUp = null;
        var locDown = null;
        var pointUp;
        var pointDown;
        var latLon0;
        var latLon1;
        var latLonMid;
        var latLonQuarter;
        try
        {
            //Right handle
            //bearing = mapUtils.bearingBetween(this.airspace.AirspacePoints[0], this.airspace.AirspacePoints[1]);
            //if (this.airspace.AirspacePoints.length > 1)
            if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POLYGON.Value)
            {
                latLon0 = new LatLon(this.airspace.AirspacePoints[0].Latitude, this.airspace.AirspacePoints[0].Longitude);
                latLon1 = new LatLon(this.airspace.AirspacePoints[1].Latitude, this.airspace.AirspacePoints[1].Longitude);
                latLonMid = latLon0.midpointTo(latLon1);
                latLonQuarter = latLon0.midpointTo(latLonMid);
                pointUp = {Latitude: latLonQuarter._lat, Longitude: latLonQuarter._lon, altitude: this.airspace.AirspaceLegs[0].AltitudeRange.UpperAltitude};
                pointDown = {Latitude: latLonQuarter._lat, Longitude: latLonQuarter._lon, altitude: this.airspace.AirspaceLegs[0].AltitudeRange.LowerAltitude};
                cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointUp.Longitude), Number(pointUp.Latitude), Number(pointUp.altitude)));
                cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointDown.Longitude), Number(pointDown.Latitude), Number(pointDown.altitude)));

                idUp = {
                    image: this.RED_HANDLE,
                    loc: pointUp,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length + 1,
                        RadiusWidth: false,
                        Right: false,
                        Up: true,
                        type: 'dragUp.' + this.airspace.Id,
                        legIndex: 0
                    }
                };

                idDown = {
                    image: this.RED_HANDLE,
                    loc: pointDown,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length + 2,
                        RadiusWidth: false,
                        Right: false,
                        Down: true,
                        type: 'dragDown.' + this.airspace.Id,
                        legIndex: 0
                    }
                };

                billboardList.push(idUp);
                billboardList.push(idDown);
            }
            else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.CYLINDER.Value)
            {
                var radius = this.airspace.AirspaceLegs[0].Radius;
                //set control points to the right side 
                latLon0 = new LatLon(this.airspace.AirspacePoints[0].Latitude, this.airspace.AirspacePoints[0].Longitude);
                var pointRightBorder = emp.geoLibrary.geodesic_coordinate({"y": latLon0._lat, "x": latLon0._lon}, radius, 90);
                pointUp = {Latitude: pointRightBorder.y, Longitude: pointRightBorder.x, altitude: this.airspace.AirspaceLegs[0].AltitudeRange.UpperAltitude};
                pointDown = {Latitude: pointRightBorder.y, Longitude: pointRightBorder.x, altitude: this.airspace.AirspaceLegs[0].AltitudeRange.LowerAltitude};
                cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointUp.Longitude), Number(pointUp.Latitude), Number(pointUp.altitude)));
                cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointDown.Longitude), Number(pointDown.Latitude), Number(pointDown.altitude)));

                idUp = {
                    image: this.RED_HANDLE,
                    loc: pointUp,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length + 1,
                        RadiusWidth: false,
                        Right: false,
                        Up: true,
                        type: 'dragUp.' + this.airspace.Id,
                        legIndex: 0
                    }
                };

                idDown = {
                    image: this.RED_HANDLE,
                    loc: pointDown,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length + 2,
                        RadiusWidth: false,
                        Right: false,
                        Down: true,
                        type: 'dragDown.' + this.airspace.Id,
                        legIndex: 0
                    }
                };

                billboardList.push(idUp);
                billboardList.push(idDown);
            }
            else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.TRACK.Value)
            {
                for (var index = 0; index < this.airspace.AirspaceLegs.length; index++)
                {
                    var widthRight = this.airspace.AirspaceLegs[index].WidthRight;
                    latLon0 = new LatLon(this.airspace.AirspacePoints[index].Latitude, this.airspace.AirspacePoints[index].Longitude);
                    latLon1 = new LatLon(this.airspace.AirspacePoints[index + 1].Latitude, this.airspace.AirspacePoints[index + 1].Longitude);
                    bearing = latLon0.bearingTo(latLon1);
                    bearing += 90;
                    latLonMid = latLon0.midpointTo(latLon1);
                    var pointRightSide = emp.geoLibrary.geodesic_coordinate({"y": latLonMid._lat, "x": latLonMid._lon}, widthRight, bearing);
                    //latLonQuarter = latLon0.midpointTo(latLonMid);
                    pointUp = {Latitude: pointRightSide.y, Longitude: pointRightSide.x, altitude: this.airspace.AirspaceLegs[index].AltitudeRange.UpperAltitude};
                    pointDown = {Latitude: pointRightSide.y, Longitude: pointRightSide.x, altitude: this.airspace.AirspaceLegs[index].AltitudeRange.LowerAltitude};
                    cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointUp.Longitude), Number(pointUp.Latitude), Number(pointUp.altitude)));
                    cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointDown.Longitude), Number(pointDown.Latitude), Number(pointDown.altitude)));

                    idUp = {
                        image: this.RED_HANDLE,
                        loc: pointUp,
                        data: {
                            DragHandle: true,
                            Index: billboardList.length + 1,
                            RadiusWidth: false,
                            Right: false,
                            Up: true,
                            type: 'dragUp.' + this.airspace.Id,
                            legIndex: index
                        }
                    };

                    idDown = {
                        image: this.RED_HANDLE,
                        loc: pointDown,
                        data: {
                            DragHandle: true,
                            Index: billboardList.length + 2,
                            RadiusWidth: false,
                            Right: false,
                            Down: true,
                            type: 'dragDown.' + this.airspace.Id,
                            legIndex: index
                        }
                    };

                    billboardList.push(idUp);
                    billboardList.push(idDown);
                }
            }
            else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.ORBIT.Value)
            {
                latLon0 = new LatLon(this.airspace.AirspacePoints[0].Latitude, this.airspace.AirspacePoints[0].Longitude);
                latLon1 = new LatLon(this.airspace.AirspacePoints[1].Latitude, this.airspace.AirspacePoints[1].Longitude);
                latLonMid = latLon0.midpointTo(latLon1);
                latLonQuarter = latLon0.midpointTo(latLonMid);
                pointUp = {Latitude: latLonQuarter._lat, Longitude: latLonQuarter._lon, altitude: this.airspace.AirspaceLegs[index].AltitudeRange.UpperAltitude};
                pointDown = {Latitude: latLonQuarter._lat, Longitude: latLonQuarter._lon, altitude: this.airspace.AirspaceLegs[0].AltitudeRange.LowerAltitude};
                cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointUp.Longitude), Number(pointUp.Latitude), Number(pointUp.altitude)));
                cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointDown.Longitude), Number(pointDown.Latitude), Number(pointDown.altitude)));

                idUp = {
                    image: this.RED_HANDLE,
                    loc: pointUp,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length + 1,
                        RadiusWidth: false,
                        Right: false,
                        Up: true,
                        type: 'dragUp.' + this.airspace.Id,
                        legIndex: 0
                    }
                };

                idDown = {
                    image: this.RED_HANDLE,
                    loc: pointDown,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length + 2,
                        RadiusWidth: false,
                        Right: false,
                        Down: true,
                        type: 'dragDown.' + this.airspace.Id,
                        legIndex: 0
                    }
                };

                billboardList.push(idUp);
                billboardList.push(idDown);

            }
            else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.ROUTE.Value)
            {
                for (var index = 0; index < this.airspace.AirspaceLegs.length; index++)
                {
                    var widthRight = this.airspace.AirspaceLegs[index].WidthRight;
                    latLon0 = new LatLon(this.airspace.AirspacePoints[index].Latitude, this.airspace.AirspacePoints[index].Longitude);
                    latLon1 = new LatLon(this.airspace.AirspacePoints[index + 1].Latitude, this.airspace.AirspacePoints[index + 1].Longitude);
                    bearing = latLon0.bearingTo(latLon1);
                    bearing += 90;
                    latLonMid = latLon0.midpointTo(latLon1);
                    var pointRightSide = emp.geoLibrary.geodesic_coordinate({"y": latLonMid._lat, "x": latLonMid._lon}, widthRight, bearing);
                    //latLonQuarter = latLon0.midpointTo(latLonMid);
                    pointUp = {Latitude: pointRightSide.y, Longitude: pointRightSide.x, altitude: this.airspace.AirspaceLegs[index].AltitudeRange.UpperAltitude};
                    pointDown = {Latitude: pointRightSide.y, Longitude: pointRightSide.x, altitude: this.airspace.AirspaceLegs[index].AltitudeRange.LowerAltitude};
                    cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointUp.Longitude), Number(pointUp.Latitude), Number(pointUp.altitude)));
                    cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointDown.Longitude), Number(pointDown.Latitude), Number(pointDown.altitude)));

                    idUp = {
                        image: this.RED_HANDLE,
                        loc: pointUp,
                        data: {
                            DragHandle: true,
                            Index: billboardList.length + 1,
                            RadiusWidth: false,
                            Right: false,
                            Up: true,
                            type: 'dragUp.' + this.airspace.Id,
                            legIndex: index
                        }
                    };

                    idDown = {
                        image: this.RED_HANDLE,
                        loc: pointDown,
                        data: {
                            DragHandle: true,
                            Index: billboardList.length + 2,
                            RadiusWidth: false,
                            Right: false,
                            Down: true,
                            type: 'dragDown.' + this.airspace.Id,
                            legIndex: index
                        }
                    };

                    billboardList.push(idUp);
                    billboardList.push(idDown);
                }
            }
            else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POLYARC.Value)
            {
                var radius = this.airspace.AirspaceLegs[0].Radius;
                //set control points to the right side 
                latLon0 = new LatLon(this.airspace.AirspacePoints[0].Latitude, this.airspace.AirspacePoints[0].Longitude);
                var pointRightBorder = emp.geoLibrary.geodesic_coordinate({"y": latLon0._lat, "x": latLon0._lon}, radius, 90);
                pointUp = {Latitude: pointRightBorder.y, Longitude: pointRightBorder.x, altitude: this.airspace.AirspaceLegs[0].AltitudeRange.UpperAltitude};
                pointDown = {Latitude: pointRightBorder.y, Longitude: pointRightBorder.x, altitude: this.airspace.AirspaceLegs[0].AltitudeRange.LowerAltitude};
                cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointUp.Longitude), Number(pointUp.Latitude), Number(pointUp.altitude)));
                cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointDown.Longitude), Number(pointDown.Latitude), Number(pointDown.altitude)));

                idUp = {
                    image: this.RED_HANDLE,
                    loc: pointUp,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length + 1,
                        RadiusWidth: false,
                        Right: false,
                        Up: true,
                        type: 'dragUp.' + this.airspace.Id,
                        legIndex: 0
                    }
                };

                idDown = {
                    image: this.RED_HANDLE,
                    loc: pointDown,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length + 2,
                        RadiusWidth: false,
                        Right: false,
                        Down: true,
                        type: 'dragDown.' + this.airspace.Id,
                        legIndex: 0
                    }
                };

                billboardList.push(idUp);
                billboardList.push(idDown);
            }
            else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.LINE.Value)
            {
                latLon0 = new LatLon(this.airspace.AirspacePoints[0].Latitude, this.airspace.AirspacePoints[0].Longitude);
                latLon1 = new LatLon(this.airspace.AirspacePoints[1].Latitude, this.airspace.AirspacePoints[1].Longitude);
                latLonMid = latLon0.midpointTo(latLon1);
                latLonQuarter = latLon0.midpointTo(latLonMid);
                pointUp = {Latitude: latLonQuarter._lat, Longitude: latLonQuarter._lon, altitude: this.airspace.AirspaceLegs[0].AltitudeRange.UpperAltitude};
                pointDown = {Latitude: latLonQuarter._lat, Longitude: latLonQuarter._lon, altitude: this.airspace.AirspaceLegs[0].AltitudeRange.LowerAltitude};
                cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointUp.Longitude), Number(pointUp.Latitude), Number(pointUp.altitude)));
                cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointDown.Longitude), Number(pointDown.Latitude), Number(pointDown.altitude)));

                idUp = {
                    image: this.RED_HANDLE,
                    loc: pointUp,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length + 1,
                        RadiusWidth: false,
                        Right: false,
                        Up: true,
                        type: 'dragUp.' + this.airspace.Id,
                        legIndex: 0
                    }
                };

                idDown = {
                    image: this.RED_HANDLE,
                    loc: pointDown,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length + 2,
                        RadiusWidth: false,
                        Right: false,
                        Down: true,
                        type: 'dragDown.' + this.airspace.Id,
                        legIndex: 0
                    }
                };

                billboardList.push(idUp);
                billboardList.push(idDown);
            }
            else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.RADARC.Value)
            {
                var radius = this.airspace.AirspaceLegs[0].Radius;
                //set control points to the right side 
                latLon0 = new LatLon(this.airspace.AirspacePoints[0].Latitude, this.airspace.AirspacePoints[0].Longitude);
                var pointRightBorder = emp.geoLibrary.geodesic_coordinate({"y": latLon0._lat, "x": latLon0._lon}, radius, 90);
                pointUp = {Latitude: pointRightBorder.y, Longitude: pointRightBorder.x, altitude: this.airspace.AirspaceLegs[0].AltitudeRange.UpperAltitude};
                pointDown = {Latitude: pointRightBorder.y, Longitude: pointRightBorder.x, altitude: this.airspace.AirspaceLegs[0].AltitudeRange.LowerAltitude};
                cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointUp.Longitude), Number(pointUp.Latitude), Number(pointUp.altitude)));
                cartographic.push(Cesium.Cartographic.fromDegrees(Number(pointDown.Longitude), Number(pointDown.Latitude), Number(pointDown.altitude)));

                idUp = {
                    image: this.RED_HANDLE,
                    loc: pointUp,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length + 1,
                        RadiusWidth: false,
                        Right: false,
                        Up: true,
                        type: 'dragUp.' + this.airspace.Id,
                        legIndex: 0
                    }
                };

                idDown = {
                    image: this.RED_HANDLE,
                    loc: pointDown,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length + 2,
                        RadiusWidth: false,
                        Right: false,
                        Down: true,
                        type: 'dragDown.' + this.airspace.Id,
                        legIndex: 0
                    }
                };

                billboardList.push(idUp);
                billboardList.push(idDown);
            }



            //cartographic.push(Cesium.Cartographic.fromDegrees(midPointUp.Longitude, midPointUp.Latitude, midPointUp.altitude));
            //cartographic.push(Cesium.Cartographic.fromDegrees(midPointDown.Longitude, midPointDown.Latitude, midPointDown.altitude));
            ///bearing = latLon0.bearingTo(latLon1);
            // bearing = bearing + 90;

            //locRight = mapUtils.destinationPoint(this.airspace.AirspacePoints[0], bearing,
            //        this.airspace.AirspaceLegs[0].WidthRight);
            //locUp = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": this.airspace.AirspacePoints[0].Latitude, "x": this.airspace.AirspacePoints[0].Longitude}, this.airspace.AirspaceLegs[0].WidthRight, bearing);





        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._addDualAltitudeDragHandles: ' + error);
        }
    };
    this.addHandles = function ()
    {

        var billboard = null;
        var billboardList = null;
        var cartographic = null;
        var cartographicHeightInFeet = null;
        var dragHandle = null;
        var i = null;
        var label = null;
        var loc = null;
        var textHeight = null;

        try
        {

            if (this.mode === CONSTANTS.MAP_DRAW_MODE)
            {
                return;
            }

            billboardList = [];
            cartographic = [];

            //remove any existing drag handles and labels
            this.handleCollection.removeAll();
            this.labelCollection.removeAll();

            this.addPointHandles(billboardList, cartographic);

            this.addDragHandles(billboardList, cartographic);

            this.addNewPointHandles(billboardList, cartographic);

            this.addDualAltitudeDragHandles(billboardList, cartographic);

            // get the terrain height at the various locations
            // disable terrain sampling. The sampling is setting all the altitudes to 0 when there is no terrain provider :(.
            //// Cesium.when(Cesium.sampleTerrain(this.MapView.getViewer().terrainProvider, CONSTANTS.TERRAIN_LEVEL,
            ////          cartographic), emp.$.proxy(function () {
            //cartographic), lang.hitch(this, function() {
            try
            {

                //Safety check incase airspace is saved before promise is resolved.  Once saved the airspace is null.
                if (this.airspace)
                {

                    for (i = 0; i < billboardList.length; i++)
                    {

                        billboardList[i].data.ignore = {rightClick: true, leftClick: true, doubleClick: true};

                        this.airspaceMapView.addPointFeatureToCollection(this.handleCollection,
                                billboardList[i], this.airspaceMapView.getMapImages() + billboardList[i].image,
                                billboardList[i].loc, 1.0, this.pixelOffset, (cartographic[i].height + this.VERTICAL_PAD));

//                                cartographicHeightInFeet = lengthUtils.convertFromSI(cartographic[i].height, ALTITUDE_UNITS.FT.Value);

//                            if ((this.airspace.MaxTerrainAltitude === null) ||
//                                    (this.airspace.MaxTerrainAltitude < cartographic[i].height)) {
//
//                                this.airspace.MaxTerrainAltitude = cartographic[i].height;
//                            }

//                            if ((this.airspace.MinTerrainAltitude === null) ||
//                                    (cartographic[i].height < this.airspace.MinTerrainAltitude)) {
//
//                                this.airspace.MinTerrainAltitude = cartographic[i].height;
//                            }
                    }

                    if ((this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POINT.Value) ||
                            (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.CYLINDER.Value) ||
                            (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.RADARC.Value))
                    {
                    }
                    else
                    {

                        for (i = 0; i < this.airspace.AirspacePoints.length; i++)
                        {

                            textHeight = this.determineAltitude(cartographic[i].height, i);
                            textHeight = textHeight + this.VERTICAL_PAD;

                            this.labelCollection.add({
                                font: '20px Helvetica',
                                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                                pixelOffset: this.pixelOffset,
                                position: Cesium.Cartesian3.fromDegrees(this.airspace.AirspacePoints[i].Longitude,
                                        this.airspace.AirspacePoints[i].Latitude, textHeight),
                                text: 'P' + (i + 1),
                                verticalOrigin: Cesium.VerticalOrigin.TOP
                            });
                        }
                    }
                }
            }
            catch (error)
            {
                console.log('AirspaceDrawHandler._addHandles, Inner: ' + error);
            }
            // }, this));
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._addHandles: ' + error);
        }
    };

    this.addNewPointHandles = function (billboardList, cartographic)
    {

        var i = null;
        var id = null;
        var newPointHandle = null;
        var midPoint = null;

        try
        {

            if (this.mode === CONSTANTS.MAP_DRAW_MODE)
            {
                return;
            }

            //Not all shapes can have points added
            if ((this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.CYLINDER.Value) ||
                    (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.ORBIT.Value) ||
                    (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.RADARC.Value))
            {

                return;
            }

            for (i = 0; i < this.airspace.AirspacePoints.length - 1; i++)
            {

                // midPoint = mapUtils.calculateMidPoint(this.airspace.AirspacePoints[i],
                //          this.airspace.AirspacePoints[i+1]);
                var latLon0 = new LatLon(this.airspace.AirspacePoints[i].Latitude, this.airspace.AirspacePoints[i].Longitude);
                var latLon1 = new LatLon(this.airspace.AirspacePoints[i + 1].Latitude, this.airspace.AirspacePoints[i + 1].Longitude);
                var latLonMid = latLon0.midpointTo(latLon1);
                midPoint = {Latitude: latLonMid._lat, Longitude: latLonMid._lon};
                cartographic.push(Cesium.Cartographic.fromDegrees(midPoint.Longitude, midPoint.Latitude));

                id = {
                    data: {
                        Index: billboardList.length,
                        newPointHandle: true,
                        newPointIndex: i,
                        type: 'newPoint.' + this.airspace.Id + '.' + i
                    },
                    image: this.ORANGE_HANDLE,
                    loc: midPoint
                };
                billboardList.push(id);
            }
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._addNewPointHandles: ' + error);
        }
    };

    this.addOrbitDragHandles = function (billboardList, cartographic)
    {

        var bearing = null;
        var dragHandle = null;
        var i = null;
        var id = null;
        var leg = null;
        var loc = null;

        try
        {

            leg = this.airspace.AirspaceLegs[0];

            //Add the width handles
            if (leg.AirspaceTurnType === AIRSPACE_TURN_TYPE.LEFT.Value)
            {

                //bearing = mapUtils.bearingBetween(this.airspace.AirspacePoints[0], this.airspace.AirspacePoints[1]);
                var latLon0 = new LatLon(this.airspace.AirspacePoints[0].Latitude, this.airspace.AirspacePoints[0].Longitude);
                var latLon1 = new LatLon(this.airspace.AirspacePoints[1].Latitude, this.airspace.AirspacePoints[1].Longitude);
                bearing = latLon0.bearingTo(latLon1);
                bearing = bearing + 270;

                //loc = mapUtils.destinationPoint(this.airspace.AirspacePoints[0], bearing,
                //        this.airspace.AirspaceLegs[0].WidthLeft);
                loc = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": this.airspace.AirspacePoints[0].Latitude, "x": this.airspace.AirspacePoints[0].Longitude}, this.airspace.AirspaceLegs[0].WidthLeft, bearing);
            }
            else if (leg.AirspaceTurnType === AIRSPACE_TURN_TYPE.RIGHT.Value)
            {

                //bearing = mapUtils.bearingBetween(this.airspace.AirspacePoints[0], this.airspace.AirspacePoints[1]);
                var latLon0 = new LatLon(this.airspace.AirspacePoints[0].Latitude, this.airspace.AirspacePoints[0].Longitude);
                var latLon1 = new LatLon(this.airspace.AirspacePoints[1].Latitude, this.airspace.AirspacePoints[1].Longitude);
                bearing = latLon0.bearingTo(latLon1);
                bearing = bearing + 90;

                //loc = mapUtils.destinationPoint(this.airspace.AirspacePoints[0], bearing,
                //        this.airspace.AirspaceLegs[0].WidthLeft);
                loc = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": this.airspace.AirspacePoints[0].Latitude, "x": this.airspace.AirspacePoints[0].Longitude}, this.airspace.AirspaceLegs[0].WidthLeft, bearing);
            }
            else if (leg.AirspaceTurnType === AIRSPACE_TURN_TYPE.CENTER.Value)
            {

                // bearing = mapUtils.bearingBetween(this.airspace.AirspacePoints[0], this.airspace.AirspacePoints[1]);
                var latLon0 = new LatLon(this.airspace.AirspacePoints[0].Latitude, this.airspace.AirspacePoints[0].Longitude);
                var latLon1 = new LatLon(this.airspace.AirspacePoints[1].Latitude, this.airspace.AirspacePoints[1].Longitude);
                bearing = latLon0.bearingTo(latLon1);
                bearing = bearing + 90;

                //loc = mapUtils.destinationPoint(this.airspace.AirspacePoints[0], bearing,
                //        (this.airspace.AirspaceLegs[0].WidthLeft / 2));
                loc = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": this.airspace.AirspacePoints[0].Latitude, "x": this.airspace.AirspacePoints[0].Longitude}, this.airspace.AirspaceLegs[0].WidthLeft, bearing);
            }

            cartographic.push(Cesium.Cartographic.fromDegrees(Number(loc.Longitude), Number(loc.Latitude)));

            id = {
                image: this.PURPLE_HANDLE,
                loc: loc,
                data: {
                    DragHandle: true,
                    Index: billboardList.length,
                    RadiusWidth: true,
                    type: 'drag.' + this.airspace.Id
                }
            };
            billboardList.push(id);
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._addOrbitDragHandles: ' + error);
        }
    };

    this.addPointHandles = function (billboardList, cartographic)
    {

        var i = null;
        var id = null;
        var loc = null;

        try
        {

            for (i = 0; i < this.airspace.AirspacePoints.length; i++)
            {

                loc = this.airspace.AirspacePoints[i];
                cartographic.push(Cesium.Cartographic.fromDegrees(Number(loc.Longitude), Number(loc.Latitude)));

                id = {
                    image: this.BLUE_HANDLE,
                    loc: loc,
                    data: {
                        DragHandle: true,
                        Index: billboardList.length,
                        Point: i,
                        type: 'point.' + this.airspace.Id + '.' + i
                    }
                };
                billboardList.push(id);
            }
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._addPointHandles: ' + error);
        }
    };

    this.addSingleWidthDragHandles = function (billboardList, cartographic)
    {

        var bearing = null;
        var dragHandle = null;
        var i = null;
        var id = null;
        var loc = null;

        try
        {

            //Add the width handles
            if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.CYLINDER.Value)
            {

                //loc = mapUtils.destinationPoint(this.airspace.AirspacePoints[0], 90, this.airspace.AirspaceLegs[0].Radius);
                loc = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": this.airspace.AirspacePoints[0].Latitude, "x": this.airspace.AirspacePoints[0].Longitude}, this.airspace.AirspaceLegs[0].Radius, 90);
            }
            else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.ROUTE.Value)
            {

                //bearing = mapUtils.bearingBetween(this.airspace.AirspacePoints[0], this.airspace.AirspacePoints[1]);
                var latLon0 = new LatLon(this.airspace.AirspacePoints[0].Latitude, this.airspace.AirspacePoints[0].Longitude);
                var latLon1 = new LatLon(this.airspace.AirspacePoints[1].Latitude, this.airspace.AirspacePoints[1].Longitude);
                bearing = latLon0.bearingTo(latLon1);
                bearing = bearing + 90;

                //loc = mapUtils.destinationPoint(this.airspace.AirspacePoints[0], bearing,
                //        (this.airspace.AirspaceLegs[0].WidthLeft / 2));
                loc = cesiumEngine.geoLibrary.geodesic_destinationPointTais({"y": this.airspace.AirspacePoints[0].Latitude, "x": this.airspace.AirspacePoints[0].Longitude}, this.airspace.AirspaceLegs[0].WidthLeft, bearing);
            }

            cartographic.push(Cesium.Cartographic.fromDegrees(Number(loc.Longitude), Number(loc.Latitude)));

            id = {
                image: this.PURPLE_HANDLE,
                loc: loc,
                data: {
                    DragHandle: true,
                    Index: billboardList.length,
                    RadiusWidth: true,
                    type: 'drag.' + this.airspace.Id
                }
            };
            billboardList.push(id);
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._addSingleWidthDragHandles: ' + error);
        }
    };
    this.airspaceAddEventListeners = function ()
    {

        try
        {

            if (this.mode === CONSTANTS.MAP_DRAW_MODE)
            {

                this.mapView.addSupplementalEventHandler(this, this.leftClickDraw, MOUSE_EVENT_TYPE.LEFT_CLICK.Value);
                this.mapView.addSupplementalEventHandler(this, this.leftDoubleClickDraw,
                        MOUSE_EVENT_TYPE.LEFT_DOUBLE_CLICK.Value);
            }
            else if (this.mode === CONSTANTS.MAP_EDIT_MODE)
            {

                this.mapView.addSupplementalEventHandler(this, this.leftDownEdit, MOUSE_EVENT_TYPE.LEFT_DOWN.Value);
                this.mapView.addSupplementalEventHandler(this, this.leftUpEdit, MOUSE_EVENT_TYPE.LEFT_UP.Value);
                this.mapView.addSupplementalEventHandler(this, this.mouseMoveEdit, MOUSE_EVENT_TYPE.MOUSE_MOVE.Value);
            }
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._airspaceAddEventListeners: ' + error);
        }
    };

    this.airspaceRemoveEventListeners = function ()
    {

        try
        {

            this.mapView.removeSupplementalEventHandler(MOUSE_EVENT_TYPE.LEFT_CLICK.Value);
            this.mapView.removeSupplementalEventHandler(MOUSE_EVENT_TYPE.LEFT_DOUBLE_CLICK.Value);
            this.mapView.removeSupplementalEventHandler(MOUSE_EVENT_TYPE.LEFT_DOWN.Value);
            this.mapView.removeSupplementalEventHandler(MOUSE_EVENT_TYPE.LEFT_UP.Value);
            this.mapView.removeSupplementalEventHandler(MOUSE_EVENT_TYPE.MOUSE_MOVE.Value);
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._airspaceRemoveEventListeners: ' + error);
        }
    };
    /*
     * When an airspace is drawn, the AirspaceDrawHandler is passed an airspace which contains an array of undefined points.
     * The array length is equal to the minimum number of points (for the particular airspaceshapetype) needed to render the
     * airspace.  Once the array no longer contains any undefined points it is a valid shape and can be rendered.
     */
    this.airspaceRenderable = function ()
    {

        var i = null;
        var retValue = null;

        try
        {

            retValue = true;

            //only create shape if none of the airspacePoints are undefined.
            for (i = 0; i < this.airspace.AirspacePoints.length; i++)
            {

                if (this.airspace.AirspacePoints[i] === undefined)
                {
                    retValue = false;
                }
            }

            return retValue;
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._airspaceRenderable: ' + error);
        }
    };
    /*
     * Used by radarc and polyarc to calculates the midpoint between the left and right azimuth.  This defines the angle
     * between the center point and the inner and outer radius draghandles.
     */
    this.calculateAngleMidpoint = function ()
    {

        var bearingCenter = null;

        try
        {

            if (this.airspace.AirspaceLegs[0].AzimuthRight < this.airspace.AirspaceLegs[0].AzimuthLeft)
            {

                bearingCenter = ((this.airspace.AirspaceLegs[0].AzimuthRight + 360 -
                        this.airspace.AirspaceLegs[0].AzimuthLeft) / 2);
                bearingCenter = bearingCenter + this.airspace.AirspaceLegs[0].AzimuthLeft;
            }
            else
            {
                bearingCenter = ((this.airspace.AirspaceLegs[0].AzimuthLeft + this.airspace.AirspaceLegs[0].AzimuthRight) / 2);
            }

            return bearingCenter;
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._calculateAngleMidpoint: ' + error);
        }
    };
    /*
     * Cancels the watching of the stateful object
     */
    this.cancelWatchers = function ()
    {

        try
        {

            if (this.statefulWatchers)
            {

                this.statefulWatchers.cancelSubscriptions();

                this.statefulWatchers = null;
            }
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._cancelWatchers: ' + error);
        }
    };
    /*
     * This function creates an airspacepoint given a screen location.
     */
    this.createAirspacePointFromEvent = function (movement)
    {

        var airspacePoint = null;

        try
        {

            airspacePoint = this.mapView.getLocationFromPosition(movement.position);

//                if(airspacePoint) {
//                    airspacePoint = new AirspacePoint();
//                    
//                    airspacePoint.setLatitude(Number(loc.Latitude));
//                    airspacePoint.setLongitude(Number(loc.Longitude));
//                }
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._createAirspacePointFromEvent: ' + error);
        }

        return airspacePoint;
    };

    this.createShape = function ()
    {
        try
        {

            //If the shape is not minimumly populated return.
            if (!this.airspaceRenderable())
            {
                return;
            }
            this.shapePromise = this.airspaceMapView.createShape('id_airspace_editing', this.airspace, this.NEW_AIRSPACE_OPACITY, true, false);
            Cesium.when(this.shapePromise, emp.$.proxy(function (retFeature)
            {
                //when(this.shapePromise, lang.hitch(this, function(retFeature) {

                try
                {

                    if (this.feature && this.airspace)
                    {
                        //this.scene.primitives.remove(this.feature);
                        //this.scene.primitives.add(this.feature);
                    }

                    this.feature = retFeature;
                    this.addHandles();

                    this.shapePromise = null;
                }
                catch (error)
                {

                    console.log('AirspaceDrawHandler._createShape Inner: ' + error + ' airspaceName: ' + this.airspace.Name +
                            ', airspaceId:' + this.airspace.Id);
                }
            }, this));
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._createShape: ' + error);
        }
    };
    /*
     * This function looks at the stateful airspace and if anything changes, it calls the appropriate function.
     */
    this.createWatchers = function ()
    {

        try
        {

//                if (this.statefulWatchers) {
//
//                    this.statefulWatchers.cancelSubscriptions();
//                }
//                else {
//
//                    this.statefulWatchers = new SubscriptionMgr();
//                }
//
//                this.statefulWatchers.addSubscription(this.airspace.watch('AirspaceLegs', lang.hitch(this,
//                        this.deriveLegs, this.airspace)));
//
//                this.statefulWatchers.addSubscription(this.airspace.watch('AirspacePoints', lang.hitch(this,
//                        this.derivePoints, this.airspace)));
//
//                this.statefulWatchers.addSubscription(this.airspace.watch('Color', lang.hitch(this,
//                        this.createShape, this.airspace)));
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._createWatchers: ' + error);
        }
    },
            /*
             * Routine which is used to cleanup
             */
            this.cleanup = function (resolveDefer)
            {

                try
                {
                    //remove the listeners and watchers
                    this.airspaceRemoveEventListeners();
                    //// this.cancelWatchers();

                    //Change the cursor to a auto
                    ///////           this.MapView._changeMouseStyleToAuto();

                    //remove elements from the screen
                    this.handleCollection.removeAll();
                    this.labelCollection.removeAll();

                    //remove the drawing help text
//                if(this.drawHelp) {
//
//                    this.drawHelp.innerHTML = '';
//                    domClass.toggle(this.drawHelp, 'dijitHidden', true);
//                }

                    //Publish out airspace under edit event.  This tells the map to NOT update the glass.
                    ////   topic.publish(CONSTANTS.AIRSPACE_UNDER_EDIT, null);

                    if (this.feature)
                    {
                        this.scene.primitives.remove(this.feature);

                        this.feature = null;
                    }

                    if (this.airspace)
                    {
                        this.setAirspace(null);
                    }

                    if (this.mode)
                    {
                        this.mode = null;
                    }

//                if(this.origAirspace) {
//
//                    this.origAirspace = airspaceStore.get(this.origAirspace.Id);
//
//                    if(this.origAirspace) {
//
//                        this.AirspaceMapCntrl.addAirspace(this.origAirspace);
//                        this.origAirspace = null;
//                    }
//                }

                    //resolve the defer
                    if (resolveDefer)
                    {
                        this.deferred.resolve();
                    }
                }
                catch (error)
                {
                    console.log('AirspaceDrawHandler._cleanup: ' + error);
                }
            };
    /*
     * This function determines if the airspacePoints are fully populated.  Some airspace shapes can have a maximum number
     * of points.  For example cylinder, point, radarc and orbit.
     */
    this.completedShape = function ()
    {

        var retValue = null;

        try
        {

            retValue = false;

            if ((this.airspace.AirspacePoints.length === 1) &&
                    ((this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POINT.Value) ||
                            (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.CYLINDER.Value) ||
                            (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.RADARC.Value)))
            {

                retValue = true;
            }
            else if ((this.airspace.AirspacePoints.length === 2) &&
                    (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.ORBIT.Value))
            {

                retValue = true;
            }

            return retValue;
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._completedShape: ' + error);
        }
    };
    /*
     * This function derives the points
     */
    this.deriveLegs = function (name, oldValue, value)
    {

        try
        {

            if (!this.legUpdater)
            {

                this.legUpdater = setTimeout(emp.$.proxy(function ()
                {
                    //this.legUpdater = setTimeout(lang.hitch(this, function() {

                    if (airspaceUtils.validateLegs(this.airspace))
                    {
                        this.createShape();
                    }

                    this.legUpdater = null;
                }, this), 500);// acevedo ojo here 
            }
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._deriveLegs: ' + error);
        }
    };
    /*
     * This function derives the points
     */
    this.derivePoints = function (name, oldValue, value)
    {

        try
        {

            if (!this.pointUpdater)
            {

                this.pointUpdater = setTimeout(emp.$.proxy(function ()
                {

                    if (airspaceUtils.validatePoints(this.airspace))
                    {
                        this.createShape();
                    }

                    this.pointUpdater = null;
                }, this), 500);
            }
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._derivePoints: ' + error);
        }
    };
    /*
     * Recalculate the airspace MinTerrainAltitude and MaxTerrainAltitude based upon the points which define the airspace.
     */
    this.determineAirspaceTerrainAltitude = function ()
    {

        var billboard = null;
        var cartographic = null;
        var cartographicHeightInFeet = null;
        var i = null;
        var tmpMaxTerrainAltitude = null;
        var tmpMinTerrainAltitude = null;

        try
        {

            for (i = 0; i < this.handleCollection.length; i++)
            {

                billboard = this.handleCollection.get(i);
                cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(billboard.position);
//                    cartographicHeightInFeet = lengthUtils.convertFromSI(cartographic.height, ALTITUDE_UNITS.FT.Value);

                if ((tmpMinTerrainAltitude === null) || (cartographic.height < tmpMinTerrainAltitude))
                {
                    tmpMinTerrainAltitude = cartographic.height;
                }

                if ((tmpMaxTerrainAltitude === null) || (tmpMaxTerrainAltitude < cartographic.height))
                {
                    tmpMaxTerrainAltitude = cartographic.height;
                }

                this.airspace.MaxTerrainAltitude = tmpMaxTerrainAltitude;
                this.airspace.MinTerrainAltitude = tmpMinTerrainAltitude;

//                    console.info('_determineAirspaceTerrainAltitude, Setting this.airspace.MaxTerrainAltitude to ' + this.airspace.MaxTerrainAltitude);
//                    console.info('_determineAirspaceTerrainAltitude, Setting this.airspace.MinTerrainAltitude to ' + this.airspace.MinTerrainAltitude);
            }
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._determineAirspaceTerrainAltitude: ' + error);
        }
    };
    /*
     * Determines the altitude for label elements
     */
    this.determineAltitude = function (terrainHeight, index)
    {

        var airspaceLeg = null;
        var retValue = null;
        var tmpIndex = null;
        try
        {

            if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.TRACK.Value)
            {

                if (index === 0)
                {
                    tmpIndex = 0;
                }
                else
                {
                    tmpIndex = index - 1;
                }
            }
            else
            {
                tmpIndex = 0;
            }

            airspaceLeg = this.airspace.AirspaceLegs[tmpIndex];
//                retValue = lengthUtils.convertToSI(airspaceLeg.AltitudeRange.UpperAltitude, ALTITUDE_UNITS.FT.Value, 0);
            retValue = airspaceLeg.AltitudeRange.UpperAltitude;

            if (airspaceLeg.AltitudeRange.UpperAltitudeType === ALTITUDE_TYPE.AGL.Value)
            {

                retValue = retValue + terrainHeight;
            }
            else if (airspaceLeg.AltitudeRange.UpperAltitudeType === ALTITUDE_TYPE.AMSL.Value)
            {
            }
            else if (airspaceLeg.AltitudeRange.UpperAltitudeType === ALTITUDE_TYPE.FL.Value)
            {

                retValue = retValue * 100;
//                    retValue = lengthUtils.convertToSI(retValue, ALTITUDE_UNITS.FT.Value, 0);
                //retValue = 
            }

            return retValue;
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._determineAltitude: ' + error);
        }
    };
    /*
     * Handles the editing of an airspace where the airspaceshapetype is of type point
     */
    this.editAirspacePoint = function (loc)
    {

        var airspacePointList = null;

        try
        {

            this.cancelWatchers();

            airspacePointList = emp.helpers.copyObject(this.airspace.AirspacePoints); ///not good with JOII :(
            //airspacePointList = $.extend(true, {}, this.airspace.AirspacePoints );// jquery deep copy
            //airspacePointList = lang.clone(this.airspace.AirspacePoints);

            //update the lat long and and the airspacePoint list
            airspacePointList[this.dragPoint.id.data.Point].Latitude = Number(loc.Latitude);
            airspacePointList[this.dragPoint.id.data.Point].Longitude = Number(loc.Longitude);
            //this.airspace.set('AirspacePoints', airspacePointList);
            this.airspace.AirspacePoints = airspacePointList;
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._editAirspacePoint: ' + error);
        }
        finally
        {
            this.createWatchers();
        }
    };
    /*
     * Handles the editing of an airspace where the airspaceshapetype is of type radarc
     */
    this.editArc = function (loc)
    {

        var airspaceLegList = null;
        var airspacePointList = null;

        try
        {

            this.cancelWatchers();
            //airspaceLegList = $.extend(true, {}, this.airspace.AirspaceLegs );
            airspaceLegList = emp.helpers.copyObject(this.airspace.AirspaceLegs);
            //airspacePointList = $.extend(true, {}, this.airspace.AirspacePoints );
            airspacePointList = emp.helpers.copyObject(this.airspace.AirspacePoints);
            //airspaceLegList = lang.clone(this.airspace.AirspaceLegs);
            //airspacePointList = lang.clone(this.airspace.AirspacePoints);

            if (this.dragPoint.id.data.hasOwnProperty('Inner'))
            {

                //airspaceLegList[0].Radius = Math.round(mapUtils.distanceBetween(airspacePointList[0], loc));
                var latLon0 = new LatLon(airspacePointList[0].Latitude, airspacePointList[0].Longitude);
                var latLon1 = new LatLon(loc.Latitude, loc.Longitude);
                airspaceLegList[0].Radius = Math.round(latLon0.distanceTo(latLon1));

            }
            else if (this.dragPoint.id.data.hasOwnProperty('Outer'))
            {

                //airspaceLegList[0].OuterRadius = Math.round(mapUtils.distanceBetween(airspacePointList[0], loc));
                var latLon0 = new LatLon(airspacePointList[0].Latitude, airspacePointList[0].Longitude);
                var latLon1 = new LatLon(loc.Latitude, loc.Longitude);
                airspaceLegList[0].OuterRadius = Math.round(latLon0.distanceTo(latLon1));
            }
            else if (this.dragPoint.id.data.hasOwnProperty('Left'))
            {

                //airspaceLegList[0].AzimuthLeft = mapUtils.bearingBetween(airspacePointList[0], loc);
                var latLon0 = new LatLon(airspacePointList[0].Latitude, airspacePointList[0].Longitude);
                var latLon1 = new LatLon(loc.Latitude, loc.Longitude);
                airspaceLegList[0].AzimuthLeft = latLon0.bearingTo(latLon1);
            }
            else if (this.dragPoint.id.data.hasOwnProperty('Right'))
            {

                //airspaceLegList[0].AzimuthRight = mapUtils.bearingBetween(airspacePointList[0], loc);
                var latLon0 = new LatLon(airspacePointList[0].Latitude, airspacePointList[0].Longitude);
                var latLon1 = new LatLon(loc.Latitude, loc.Longitude);
                airspaceLegList[0].AzimuthRight = latLon0.bearingTo(latLon1);
            }

            //this.airspace.set('AirspaceLegs', airspaceLegList);
            //this.airspace.set('AirspacePoints', airspacePointList);
            this.airspace.AirspaceLegs = airspaceLegList;
            this.airspace.AirspacePoints = airspacePointList;
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._editAarc: ' + error);
        }
        finally
        {

            this.createWatchers();
        }
    };
    /*
     * Handles the editing of an airspace where the airspaceshapetype is of type cylinder, track, orbit, route
     */
    this.editWidth = function (loc)
    {

        var airspaceLegList = null;
        var i = null;
        var leg = null;
        var widthLeft = null;
        var widthRight = null;

        try
        {

            this.cancelWatchers();

            //clone the existing legs
            //airspaceLegList = $.extend(true, {}, this.airspace.AirspaceLegs );
            airspaceLegList = emp.helpers.copyObject(this.airspace.AirspaceLegs);
            //airspaceLegList = lang.clone(this.airspace.AirspaceLegs);

            leg = airspaceLegList[0];

            if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.CYLINDER.Value)
            {

                //calculate the new radius
                //leg.Radius = mapUtils.distanceBetween(this.airspace.AirspacePoints[0], loc);
                var latLon0 = new LatLon(this.airspace.AirspacePoints[0].Latitude, this.airspace.AirspacePoints[0].Longitude);
                var latLon1 = new LatLon(loc.Latitude, loc.Longitude);

                leg.Radius = latLon0.distanceTo(latLon1);
            }
            else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.ROUTE.Value)
            {

                //calculate the new width
                //leg.WidthLeft = (2 * mapUtils.distanceBetween(this.airspace.AirspacePoints[0], loc));
                var latLon0 = new LatLon(this.airspace.AirspacePoints[0].Latitude, this.airspace.AirspacePoints[0].Longitude);
                var latLon1 = new LatLon(loc.Latitude, loc.Longitude);
                leg.WidthLeft = latLon0.distanceTo(latLon1);
            }
            else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.ORBIT.Value)
            {

                if (leg.AirspaceTurnType === AIRSPACE_TURN_TYPE.LEFT.Value)
                {

                    //calculate the new width
                    //airspaceLegList[0].WidthLeft = mapUtils.distanceBetween(this.airspace.AirspacePoints[0], loc);
                    var latLon0 = new LatLon(this.airspace.AirspacePoints[0].Latitude, this.airspace.AirspacePoints[0].Longitude);
                    var latLon1 = new LatLon(loc.Latitude, loc.Longitude);
                    airspaceLegList[0].WidthLeft = latLon0.distanceTo(latLon1);
                }
                else if (leg.AirspaceTurnType === AIRSPACE_TURN_TYPE.RIGHT.Value)
                {

                    //calculate the new width
                    //leg.WidthLeft = mapUtils.distanceBetween(this.airspace.AirspacePoints[0], loc);
                    var latLon0 = new LatLon(this.airspace.AirspacePoints[0].Latitude, this.airspace.AirspacePoints[0].Longitude);
                    var latLon1 = new LatLon(loc.Latitude, loc.Longitude);
                    leg.WidthLeft = latLon0.distanceTo(latLon1);
                }
                else if (airspaceLegList[0].AirspaceTurnType === AIRSPACE_TURN_TYPE.CENTER.Value)
                {

                    //calculate the new width
                    //leg.WidthLeft = (2 * mapUtils.distanceBetween(this.airspace.AirspacePoints[0], loc));
                    var latLon0 = new LatLon(this.airspace.AirspacePoints[0].Latitude, this.airspace.AirspacePoints[0].Longitude);
                    var latLon1 = new LatLon(loc.Latitude, loc.Longitude);
                    leg.WidthLeft = latLon0.distanceTo(latLon1);
                }
            }
            else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.TRACK.Value)
            {

                //calculate the new width
                if (this.dragPoint.id.data.hasOwnProperty('Left'))
                {
                      var legIndex = this.dragPoint.id.data.legIndex;
                    //widthLeft = mapUtils.distanceBetween(this.airspace.AirspacePoints[0], loc);
                    var latLon0 = new LatLon(this.airspace.AirspacePoints[legIndex].Latitude, this.airspace.AirspacePoints[legIndex].Longitude);
                    var latLon1 = new LatLon(loc.Latitude, loc.Longitude);
                    widthLeft = latLon0.distanceTo(latLon1);
                    airspaceLegList[legIndex].WidthLeft = widthLeft;
                    if (this.airspace.empArg.isSymmetricWidth)
                    {
                        airspaceLegList[legIndex].WidthRight = widthLeft;
                    }
                }
                else if (this.dragPoint.id.data.hasOwnProperty('Right'))
                {
                    var legIndex = this.dragPoint.id.data.legIndex;
                    //widthRight = mapUtils.distanceBetween(this.airspace.AirspacePoints[0], loc);
                    var latLon0 = new LatLon(this.airspace.AirspacePoints[legIndex].Latitude, this.airspace.AirspacePoints[legIndex].Longitude);
                    var latLon1 = new LatLon(loc.Latitude, loc.Longitude);
                    widthRight = latLon0.distanceTo(latLon1);
                    airspaceLegList[legIndex].WidthRight = widthRight;
                    if (this.airspace.empArg.isSymmetricWidth)
                    {
                        airspaceLegList[legIndex].WidthLeft = widthRight;
                    }
                }
                 //this.dragPoint.position = Cesium.Cartesian3.fromDegrees( loc.Longitude,  loc.Latitude
                   //                         ,  0);

                // TAIS decided to set the same width for all segments of tracks??? why? I commente out
                // below code and modified the editor to set each segment width independently.
                //update all the legs
//                for (i = 0; i < airspaceLegList.length; i++)
//                {
//
//                    if (widthLeft)
//                    {
//                        airspaceLegList[i].WidthLeft = widthLeft;
//                    }
//                    else if (widthRight)
//                    {
//                        airspaceLegList[i].WidthRight = widthRight;
//                    }
//                }
            }

            //this.airspace.set('AirspaceLegs', airspaceLegList);
            this.airspace.AirspaceLegs = airspaceLegList;
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._editRadarc: ' + error);
        }
        finally
        {
            this.createWatchers();
        }
    };

    this.generateToolTip = function ()
    {

        var retStr = null;

        try
        {
            retStr = '';

            if (this.mode === CONSTANTS.MAP_DRAW_MODE)
            {

                if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.CYLINDER.Value)
                {
                    retStr = retStr + 'Click on the map to draw the cylinder center point.';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.LINE.Value)
                {
                    retStr = retStr + 'Click on the map to draw shape points.  Double click to end shape creation.';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.ORBIT.Value)
                {
                    retStr = retStr + 'Click on the map to draw your first point.  Clicking a second time will complete the shape.';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POINT.Value)
                {
                    retStr = retStr + 'Click on the map to draw your point.';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POLYGON.Value)
                {
                    retStr = retStr + 'Click on the map to draw shape points.  Double click to end shape creation.';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POLYARC.Value)
                {
                    retStr = retStr + 'Click on the map to draw shape points.  Double click to end shape creation.';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.RADARC.Value)
                {
                    retStr = retStr + 'Click on the map to draw the radarc center point.';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.ROUTE.Value)
                {
                    retStr = retStr + 'Click on the map to draw shape points.  Double click to end shape creation.';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.TRACK.Value)
                {
                    retStr = retStr + 'Click on the map to draw shape points.  Double click to end shape creation.';
                }
            }
            else if (this.mode === CONSTANTS.MAP_EDIT_MODE)
            {

                if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.CYLINDER.Value)
                {

                    retStr = retStr + 'Orange handles change airspace points.  Purple handles allow you to change the width ' +
                            'or radius of a shape';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.LINE.Value)
                {

                    retStr = retStr + 'Orange handles change airspace points.  Blue handles allow you to create a new point.';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.ORBIT.Value)
                {

                    retStr = retStr + 'Orange handles change airspace points.  Purple handles allow you to change the width ' +
                            'or radius of a shape';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POINT.Value)
                {

                    retStr = retStr + 'Orange handles change airspace points.';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POLYGON.Value)
                {

                    retStr = retStr + 'Orange handles change airspace points.  Blue handles allow you to create a new point.';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POLYARC.Value)
                {

                    retStr = retStr + 'Orange handles change airspace points.  Blue handles allow you to create a new point.' +
                            '  Purple handles allow you to change the width or radius of a shape';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.RADARC.Value)
                {
                    retStr = retStr + 'Orange handles change airspace points.  Purple handles allow you to change the width ' +
                            'or radius of a shape';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.ROUTE.Value)
                {

                    retStr = retStr + 'Orange handles change airspace points.  Blue handles allow you to create a new point.' +
                            '  Purple handles allow you to change the width or radius of a shape';
                }
                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.TRACK.Value)
                {

                    retStr = retStr + 'Orange handles change airspace points.  Blue handles allow you to create a new point.' +
                            '  Purple handles allow you to change the width or radius of a shape';
                }
            }

            return retStr;
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._generateToolTip: ' + error);
        }
    };
    /*
     * The intialize method which is called from the panel
     */
    this.initialize = function (mode, event)
    {

        try
        {
            this.mode = mode;
//                this.deferred = event.deferred;
            this.deferred = Cesium.when.defer();//////new Deferred();
            this.setAirspace(event.payload);
            this.airspaceAddEventListeners();

            this.createWatchers();

            //Change the cursor to a crosshair if in edit mode
            if (this.mode === CONSTANTS.MAP_DRAW_MODE)
            {
                this.mapView._changeMouseStyleToCrosshair();
            }

            if (this.drawHelp)
            {

                this.drawHelp.innerHTML = this.generateToolTip();
                domClass.toggle(this.drawHelp, 'dijitHidden', false);
            }

            if (this.mode === CONSTANTS.MAP_EDIT_MODE)
            {

                //this.origAirspace = airspaceStore.get(event.payload.Id);

                //if(this.origAirspace) {

                //    console.info('*** Deleted Airspace: ' + event.payload.Id);
                //    this.AirspaceMapCntrl.deleteAirspace(this.origAirspace);
                //}
                // else {
                //    console.info('*** OrigAirspace Airspace did not exist: ' + event.payload.Id);
                //}

                this.handleCollection.removeAll();
                this.labelCollection.removeAll();

                this.createShape();
                if (this.airspace.callbacks && this.airspace.callbacks.onDrawStart)
                {
                    this.airspace.callbacks.onDrawStart(this.airspace);
                }
            }

            this.deferred.then(function ()
            {
            }, emp.$.proxy(function (value)
            {

                if (this.deferred.isCanceled())
                {

                    this.cleanup(false);
                }
                else
                {

                    console.log('AirspaceDrawHandler.initialize: Current deferred has not been canceled');
                }
            }, this));
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler.initialize: ' + error);
        }
        return  this.deferred;
    };
    /*
     * Handles the initial drawing of an airspace
     */
    this.leftClickDraw = function (movement)
    {

        var airspaceLegs = null;
        var airspacePoint = null;
        var airspacePoints = null;
        var cartographic = null;
        var cartographicHeightInFeet = null;
        var i = null;
        var id = null;
        //var loc = null;

        try
        {
            cartographic = [];

            airspacePoint = this.createAirspacePointFromEvent(movement);

            this.populateAirspace(airspacePoint);

            cartographic.push(Cesium.Cartographic.fromDegrees(Number(airspacePoint.Longitude), Number(airspacePoint.Latitude)));

            //get the height of the terrain.
            //Cesium.when(Cesium.sampleTerrain(this.MapView.getViewer().terrainProvider, CONSTANTS.TERRAIN_LEVEL, cartographic),
            //         emp.$.proxy(function () {

            try
            {

                //Safety check incase airspace is saved before promise is resolved.  Once saved the airspace is null.
                if (this.airspace)
                {

                    id = {
                        //image: this.ORANGE_HANDLE,
                        image: this.BLUE_HANDLE,
                        loc: airspacePoint,
                        data: {
                            ignore: {rightClick: true, leftClick: true, doubleClick: true},
                            type: 'point.' + this.airspace.Id
                        }
                    };

                    //draw the billboard on the terrain
                    this.airspaceMapView.addPointFeatureToCollection(this.handleCollection,
                            id, this.airspaceMapView.getMapImages() + this.BLUE_HANDLE, airspacePoint, 1.0, this.pixelOffset,
                            (cartographic[0].height + this.VERTICAL_PAD));

//                            cartographicHeightInFeet = lengthUtils.convertFromSI(cartographic[0].height, ALTITUDE_UNITS.FT.Value);

                    //If the height is higher or lower than the airspace terrain altitude values, update the airspace terrain
                    //altitude
//                                if ((this.airspace.MaxTerrainAltitude === null) ||
//                                        (this.airspace.MaxTerrainAltitude < cartographic[0].height)) {
//
//                                    this.airspace.MaxTerrainAltitude = cartographic[0].height;
//
//                                    //console.info('leftClickDraw, Setting this.airspace.MaxTerrainAltitude to ' + this.airspace.MaxTerrainAltitude);
//                                }
//
//                                if ((this.airspace.MinTerrainAltitude === null) ||
//                                        (cartographic[0].height < this.airspace.MinTerrainAltitude)) {
//
//                                    this.airspace.MinTerrainAltitude = cartographic[0].height;
//
//                                    //console.info('leftClickDraw, Setting this.airspace.MaxTerrainAltitude to ' + this.airspace.MaxTerrainAltitude);
//                                }

                    if (this.airspaceRenderable())
                    {

                        if (this.completedShape())
                        {
                            if (this.airspace.callbacks && this.airspace.callbacks.onDrawComplete)
                            {
                                this.initialize(6, {deferred: null, payload: this.airspace})
                                this.airspace.callbacks.onDrawComplete(this.airspace);
                            }
                            else
                            {
                                this.cleanup(true);
                            }

                            return;
                        }

                        this.createShape();
                    }
                }
            }
            catch (error)
            {
                console.log('AirspaceDrawHandler.leftClickDraw, Inner: ' + error);
            }
            //     }, this));

            return true;
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler.leftClickDraw: ' + error);
        }
    };
    /*
     * Identifies the airspace point under edit.
     */
    this.leftDownEdit = function (event)
    {

        var i = null;
        var screenElements = null;

        try
        {

            if (!this.dragPoint)
            {

                //figure out which drag handle was selected
                screenElements = this.mapView.mouseOverSceneElement(event, true);

                for (i = 0; i < screenElements.length; i++)
                {

                    if (screenElements[i].id && screenElements[i].id.data)
                    {

                        if ((screenElements[i].id.data.hasOwnProperty('DragHandle') ||
                                screenElements[i].id.data.hasOwnProperty('newPointHandle')))
                        {

                            //the following line stops the globe from moving/rotating
                            this.scene.screenSpaceCameraController.enableRotate = false;
                            this.scene.screenSpaceCameraController.enableTranslate = false;

                            //set the dragpoint
                            this.dragPoint = screenElements[i];
                        }
                    }
                }
            }
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler.leftDownEdit: ' + error);
        }

        return false;
    };
    /*
     * Called when the editing of a point has been completed.  This function gets the terrain height and updates draghandle.
     * It also makes the necessary changes to the airspace and redraws the airspace on the screen.
     */
    this.leftUpEdit = function (event)
    {

        var airspaceLeg = null;
        var airspaceLegList = null;
        var airspacePoint = null;
        var airspacePointList = null;
        var cartographic = null;
        var i = null;
        var airspacePoint = null;
        var loc = null;

        try
        {

            cartographic = [];
            loc = this.mapView.getLocationFromPosition(event.position);

            if (loc)
            {
                cartographic.push(Cesium.Cartographic.fromDegrees(Number(loc.Longitude), Number(loc.Latitude), loc.Altitude));
            }

            //get the height of the terrain
            //Cesium.when(Cesium.sampleTerrain(this.MapView.getViewer().terrainProvider, CONSTANTS.TERRAIN_LEVEL, cartographic),
            //        emp.$.proxy(function () {

            try
            {

                //Safety check incase airspace is saved before promise is resolved.  Once saved the airspace and 
                //dragpoints are null.
                if (this.dragPoint && this.airspace)
                {

                    if ((this.dragPoint.id.data.hasOwnProperty('DragHandle')) && (this.dragPoint.id.data.hasOwnProperty('Up') || this.dragPoint.id.data.hasOwnProperty('Down')))
                    {
                        //dragpoint is a billboard for altitude set the dragpoint to the current location
//                            var ray = this.scene.camera.getPickRay(event.position);
//                            if (ray !== null)
//                            {
//                                var rayPositionCartesian = this.scene.globe.pick(ray, this.scene);
//                                var rayCartographic = this.scene.globe.ellipsoid.cartesianToCartographic(rayPositionCartesian);
//                                var oldAltitudePositionCarto = Cesium.Cartographic.fromDegrees(this.dragPoint.id.loc.Longitude, this.dragPoint.id.loc.Latitude, this.dragPoint.id.loc.altitude);
//                                var oldAltitudePositionCartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oldAltitudePositionCarto);
//                                var surfaceNormalOldAltitudePositionCartesian = this.MapView.getEmpCesium().ellipsoid.geodeticSurfaceNormal(oldAltitudePositionCartesian);
//                                var OldAltitudePositionSurfaceCartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(new Cesium.Cartographic(oldAltitudePositionCarto.longitude, oldAltitudePositionCarto.latitude, 0));
//
//                                var planeNormal = Cesium.Cartesian3.subtract(this.scene.camera.position, oldAltitudePositionCartesian, new Cesium.Cartesian3());
//                                planeNormal = Cesium.Cartesian3.normalize(planeNormal, planeNormal);
//                                var plane = Cesium.Plane.fromPointNormal(oldAltitudePositionCartesian, planeNormal);
//                                //var plane = Cesium.Plane.fromPointNormal(surfaceNormalOldAltitudePositionCartesian, OldAltitudePositionSurfaceCartesian ); //Too high the altitude :(. tangent to old altitude control point position
//                                //var plane = Cesium.Plane.fromPointNormal(OldAltitudePositionSurfaceCartesian, surfaceNormalOldAltitudePositionCartesian);// tangent to origin
//                                //var newAltitudePositionCartesian = new Cesium.Cartesian3();
//                                var newAltitudePositionCartesian = Cesium.IntersectionTests.rayPlane(ray, plane);
//                                var newAltitudePositionCartographic = this.MapView.getEmpCesium().ellipsoid.cartesianToCartographic(newAltitudePositionCartesian);
//                                var newAltitude = newAltitudePositionCartographic.height;
//                                //var pixelSize =  this.scene.camera.frustum.getPixelDimensions(this.scene.drawingBufferWidth, this.scene.drawingBufferHeight, 1.0, new Cesium.Cartesian2());
//                                //newAltitude = newAltitude*pixelSize.y;
//                                //var referenceCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(referencePosition);
//                                if (this.dragPoint.id.data.hasOwnProperty('Up'))
//                                {
//                                    this.airspace.MaxTerrainAltitude = newAltitude;
//                                    this.airspace.AirspaceLegs[0].AltitudeRange.UpperAltitude = this.airspace.MaxTerrainAltitude;
//                                }
//                                else if (this.dragPoint.id.data.hasOwnProperty('Down'))
//                                {
//                                    this.airspace.MinTerrainAltitude = newAltitude;
//                                    this.airspace.AirspaceLegs[0].AltitudeRange.LowerAltitude = this.airspace.MinTerrainAltitude;
//                                }
//                            }
                        //redraw the shape
                        this.createShape();
                        this.dragPoint = null;
                    }
                    else if (loc && this.dragPoint.id.data.hasOwnProperty('DragHandle'))
                    {

                        //dragpoint is a billboard set the dragpoint to the current location
                        this.dragPoint.position = Cesium.Cartesian3.fromDegrees(loc.Longitude, loc.Latitude,
                                cartographic[0].height);

                        //this.determineAirspaceTerrainAltitude();

                        if (this.dragPoint.id.data.hasOwnProperty('Point'))
                        {

                            this.editAirspacePoint(loc);
                        }
                        else if (this.dragPoint.id.data.hasOwnProperty('RadiusWidth'))
                        {

                            this.editWidth(loc);
                        }
                        //The following defines the intended behavior based upon the dragPoint properties
                        else if ((this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.RADARC.Value) ||
                                (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POLYARC.Value))
                        {

                            this.editArc(loc);
                        }

                        //redraw the shape
                        this.createShape();

                        this.dragPoint = null;
                    }
                    else if (loc && this.dragPoint.id.data.hasOwnProperty('newPointHandle'))
                    {

                        try
                        {
                            this.cancelWatchers();
                            //airspacePointList = $.extend(true, {}, this.airspace.AirspacePoints );
                            airspacePointList = emp.helpers.copyObject(this.airspace.AirspacePoints);
                            //airspacePointList = lang.clone(this.airspace.AirspacePoints);
                            airspacePoint = new AirspacePoint();
                            airspacePoint.Longitude = Number(loc.Longitude);
                            airspacePoint.Latitude = Number(loc.Latitude);
                            airspacePointList.splice((this.dragPoint.id.data.newPointIndex + 1), 0, airspacePoint);
                            //this.airspace.set('AirspacePoints', airspacePointList);
                            this.airspace.AirspacePoints = airspacePointList;

                            //if the airspace is a track we will need to add an additional leg
                            if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.TRACK.Value)
                            {

                                //airspaceLegList = $.extend(true, {}, this.airspace.AirspaceLegs );
                                airspaceLegList = emp.helpers.copyObject(this.airspace.AirspaceLegs);
                                //airspaceLegList = lang.clone(this.airspace.AirspaceLegs);
                                //airspaceLeg = $.extend(true, {}, this.airspace.AirspaceLegs[this.dragPoint.id.data.newPointIndex] );
                                airspaceLeg = emp.helpers.copyObject(this.airspace.AirspaceLegs[this.dragPoint.id.data.newPointIndex]);
                                //airspaceLeg = lang.clone(this.airspace.AirspaceLegs[this.dragPoint.id.data.newPointIndex]);
                                airspaceLegList.splice((this.dragPoint.id.data.newPointIndex + 1), 0, airspaceLeg);
                                //this.airspace.set('AirspaceLegs', airspaceLegList);
                                this.airspace.AirspaceLegs = airspaceLegList;
                            }

                            //redraw the shape
                            this.createShape();

                            this.dragPoint = null;
                        }
                        catch (error)
                        {
                            console.log('AirspaceDrawHandler.leftUpEdit, Inner newPointHandle ' + error);
                        }
                        finally
                        {
                            this.createWatchers();
                        }
                    }
                    if (this.airspace.callbacks && this.airspace.callbacks.onDrawUpdate)
                    {
                        this.airspace.callbacks.onDrawUpdate(this.airspace);
                    }
                }
            }
            catch (error)
            {
                console.log('AirspaceDrawHandler.leftUpEdit, Inner ' + error);
            }
            //         }, this));
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler.leftUpEdit: ' + error);
        }
        finally
        {
            this.scene.screenSpaceCameraController.enableRotate = true;
            this.scene.screenSpaceCameraController.enableTranslate = true;
        }

        return false;
    };
    // by acevedo - handle the case when the feature is in edit mode and the client sends an update
    featureUpdate = function (updatedAirspace)
    {

        var airspaceLeg = null;
        var airspaceLegList = null;
        var airspacePoint = null;
        var airspacePointList = null;
        var cartographic = null;
        var i = null;
        var airspacePoint = null;
        var loc = null;
        var pointCountChanged = false

        try
        {

            if (updatedAirspace)
            {
//                if (this.airspace.AirspacePoints.length !== this.airspace.updatedAirspace.length)
//                {
//                    pointCountChanged = true;
//                }
                this.airspace = updatedAirspace;
                //redraw the shape
                this.createShape();
            }


        }
        catch (error)
        {
            console.log('AirspaceDrawHandler.leftUpEdit, Inner newPointHandle ' + error);
        }
        finally
        {
//            if (pointCountChanged)
//            {
//                this.createWatchers();
//            }
        }



        return false;
    };
    /*
     * Called to indicate that an airspace with a non fixed number of points is now completed.
     */
    this.leftDoubleClickDraw = function (event)
    {

        var airspaceLegList = null;
        var airspacePointList = null;

        try
        {

//                this.cancelWatchers();
//
//                //Need to remove the last point.  The reason for this is we get two left clocks and then the double click event
//                airspacePointList = lang.clone(this.airspace.AirspacePoints);
//                airspacePointList.splice((airspacePointList.length - 1), 1);
//                //this.airspace.set('AirspacePoints', airspacePointList);
//                 this.airspace.AirspacePoints = airspacePointList;
//
//                //If the airspace is a track need to remove the last leg
//                if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.TRACK.Value) {
//
//                    airspaceLegList = lang.clone(this.airspace.AirspaceLegs);
//                    airspaceLegList.splice((airspaceLegList.length - 1), 1);
//                    //this.airspace.set('AirspaceLegs', airspaceLegList);
//                    this.airspace.AirspaceLegs = airspaceLegList;
//                }
//                if ( this.airspace.callbacks  &&  this.airspace.callbacks.onDrawComplete)
//                {
            //                   this.airspace.callbacks.onDrawComplete();
//                }
//                else
//                {
//                    this.cleanup(true);  
//                }

            return true;
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler.leftDoubleClickDraw: ' + error);
        }
    };
    //ACEVEDO added this function
    this.finishDraw = function ()
    {

        var airspaceLegList = null;
        var airspacePointList = null;

        try
        {
            this.cancelWatchers();
            if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.LINE || this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POLYARC ||
                    this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POLYGON)
            {
                //Need to remove the last point.  The reason for this is we get two left clocks and then the double click event
                //airspacePointList = $.extend(true, {}, this.airspace.AirspacePoints );
                airspacePointList = emp.helpers.copyObject(this.airspace.AirspacePoints);
                //airspacePointList = lang.clone(this.airspace.AirspacePoints);
                airspacePointList.splice((airspacePointList.length - 1), 1);
                //this.airspace.set('AirspacePoints', airspacePointList);
                this.airspace.AirspacePoints = airspacePointList;
            }

            //If the airspace is a track need to remove the last leg
            if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.TRACK.Value)
            {
                //airspaceLegList = $.extend(true, {}, this.airspace.AirspaceLegs );	
                airspaceLegList = emp.helpers.copyObject(this.airspace.AirspaceLegs);
                //airspaceLegList = lang.clone(this.airspace.AirspaceLegs);
                airspaceLegList.splice((airspaceLegList.length - 1), 1);
                //this.airspace.set('AirspaceLegs', airspaceLegList);
                this.airspace.AirspaceLegs = airspaceLegList;
            }

            //todo - what about routes?????

            this.cleanup(true);

            return true;
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler.leftDoubleClickDraw: ' + error);
        }
    };
    //ACEVEDO added this function
    finishDrawCompletedShape = function ()
    {

        var airspaceLegList = null;
        var airspacePointList = null;

        try
        {
            this.cancelWatchers();
            this.cleanup(true);
            return true;
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler.leftDoubleClickDraw: ' + error);
        }
    };
    /*
     * Called when the mouse is moved.  If an airspace is under edit, this function will update the dragpoint location
     * periodically.
     */
    this.mouseMoveEdit = function (event)
    {

        var cartographic = null;
        var airspacePoint = null;

        try
        {

            cartographic = [];

            if (this.dragPoint)
            {


                // get the height at the terrain
                // Cesium.when(Cesium.sampleTerrain(this.MapView.getViewer().terrainProvider, CONSTANTS.TERRAIN_LEVEL, cartographic),
                //           emp.$.proxy(function () {

                try
                {

                    //Safety check incase airspace is saved before promise is resolved.  Once saved the airspace and 
                    //dragpoints are null.
                    if (this.dragPoint && this.airspace)
                    {
                        // dragpoint is a billboard collection.
                        if ((this.dragPoint.id.data.hasOwnProperty('DragHandle')) && (this.dragPoint.id.data.hasOwnProperty('Up') || this.dragPoint.id.data.hasOwnProperty('Down')))
                        {
                            //dragpoint is a billboard for altitude set the dragpoint to the current location
                            var ray = this.scene.camera.getPickRay(event.endPosition);
                            if (ray !== null)
                            {
                                //var rayPositionCartesian = this.scene.globe.pick(ray, this.scene);
                                //var rayCartographic = this.scene.globe.ellipsoid.cartesianToCartographic(rayPositionCartesian);
                                var oldAltitudePositionCarto = Cesium.Cartographic.fromDegrees(this.dragPoint.id.loc.Longitude, this.dragPoint.id.loc.Latitude, this.dragPoint.id.loc.altitude);
                                var oldAltitudePositionCartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(oldAltitudePositionCarto);
                                //var surfaceNormalOldAltitudePositionCartesian = this.MapView.getEmpCesium().ellipsoid.geodeticSurfaceNormal(oldAltitudePositionCartesian);
                                //var OldAltitudePositionSurfaceCartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(new Cesium.Cartographic(oldAltitudePositionCarto.longitude, oldAltitudePositionCarto.latitude, 0));
                                var planeNormal = Cesium.Cartesian3.subtract(this.scene.camera.position, oldAltitudePositionCartesian, new Cesium.Cartesian3());
                                planeNormal = Cesium.Cartesian3.normalize(planeNormal, planeNormal);
                                var plane = Cesium.Plane.fromPointNormal(oldAltitudePositionCartesian, planeNormal);
                                var newAltitudePositionCartesian = Cesium.IntersectionTests.rayPlane(ray, plane);
                                var newAltitudePositionCartographic = this.mapView.getEmpCesium().ellipsoid.cartesianToCartographic(newAltitudePositionCartesian);
                                var newAltitude = newAltitudePositionCartographic.height;
                                if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POLYGON.Value)
                                {
                                    if (this.dragPoint.id.data.hasOwnProperty('Up'))
                                    {
                                        //this.airspace.MaxTerrainAltitude = newAltitude;
                                        this.airspace.AirspaceLegs[0].AltitudeRange.UpperAltitude = newAltitude;
                                    }
                                    else if (this.dragPoint.id.data.hasOwnProperty('Down'))
                                    {
                                        //this.airspace.MinTerrainAltitude = newAltitude;
                                        this.airspace.AirspaceLegs[0].AltitudeRange.LowerAltitude = newAltitude;
                                    }
                                    this.dragPoint.position = Cesium.Cartesian3.fromDegrees(this.dragPoint.id.loc.Longitude, this.dragPoint.id.loc.Latitude
                                            , newAltitude);
                                }
                                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.CYLINDER.Value)
                                {
                                    if (this.dragPoint.id.data.hasOwnProperty('Up'))
                                    {
                                        //this.airspace.MaxTerrainAltitude = newAltitude;
                                        this.airspace.AirspaceLegs[0].AltitudeRange.UpperAltitude = newAltitude;
                                    }
                                    else if (this.dragPoint.id.data.hasOwnProperty('Down'))
                                    {
                                        //this.airspace.MinTerrainAltitude = newAltitude;
                                        this.airspace.AirspaceLegs[0].AltitudeRange.LowerAltitude = newAltitude;
                                    }
                                    this.dragPoint.position = Cesium.Cartesian3.fromDegrees(this.dragPoint.id.loc.Longitude, this.dragPoint.id.loc.Latitude
                                            , newAltitude);
                                }
                                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.TRACK.Value)
                                {
                                    var legIndex = this.dragPoint._id.data.legIndex;
                                    if (this.dragPoint.id.data.hasOwnProperty('Up'))
                                    {
                                        //this.airspace.MaxTerrainAltitude = newAltitude;

                                        this.airspace.AirspaceLegs[legIndex ].AltitudeRange.UpperAltitude = newAltitude; //this.airspace.MaxTerrainAltitude;
                                    }
                                    else if (this.dragPoint.id.data.hasOwnProperty('Down'))
                                    {
                                        // this.airspace.MinTerrainAltitude = newAltitude;
                                        this.airspace.AirspaceLegs[legIndex].AltitudeRange.LowerAltitude = newAltitude; // this.airspace.MinTerrainAltitude;
                                    }
                                    this.dragPoint.position = Cesium.Cartesian3.fromDegrees(this.dragPoint.id.loc.Longitude, this.dragPoint.id.loc.Latitude
                                            , newAltitude);

                                }
                                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.ORBIT.Value)
                                {
                                    if (this.dragPoint.id.data.hasOwnProperty('Up'))
                                    {
                                        //this.airspace.MaxTerrainAltitude = newAltitude;
                                        this.airspace.AirspaceLegs[0].AltitudeRange.UpperAltitude = newAltitude;
                                    }
                                    else if (this.dragPoint.id.data.hasOwnProperty('Down'))
                                    {
                                        // this.airspace.MinTerrainAltitude = newAltitude;
                                        this.airspace.AirspaceLegs[0].AltitudeRange.LowerAltitude = newAltitude;
                                    }
                                    this.dragPoint.position = Cesium.Cartesian3.fromDegrees(this.dragPoint.id.loc.Longitude, this.dragPoint.id.loc.Latitude
                                            , newAltitude);
                                }
                                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.ROUTE.Value)
                                {
                                    var legIndex = this.dragPoint._id.data.legIndex;
                                    if (this.dragPoint.id.data.hasOwnProperty('Up'))
                                    {
                                        //this.airspace.MaxTerrainAltitude = newAltitude;

                                        this.airspace.AirspaceLegs[legIndex ].AltitudeRange.UpperAltitude = newAltitude; //this.airspace.MaxTerrainAltitude;
                                    }
                                    else if (this.dragPoint.id.data.hasOwnProperty('Down'))
                                    {
                                        // this.airspace.MinTerrainAltitude = newAltitude;
                                        this.airspace.AirspaceLegs[legIndex].AltitudeRange.LowerAltitude = newAltitude; // this.airspace.MinTerrainAltitude;
                                    }
                                    this.dragPoint.position = Cesium.Cartesian3.fromDegrees(this.dragPoint.id.loc.Longitude, this.dragPoint.id.loc.Latitude
                                            , newAltitude);
                                }
                                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.POLYARC.Value)
                                {
                                    if (this.dragPoint.id.data.hasOwnProperty('Up'))
                                    {
                                        //this.airspace.MaxTerrainAltitude = newAltitude;
                                        this.airspace.AirspaceLegs[0].AltitudeRange.UpperAltitude = tnewAltitude;
                                    }
                                    else if (this.dragPoint.id.data.hasOwnProperty('Down'))
                                    {
                                        //this.airspace.MinTerrainAltitude = newAltitude;
                                        this.airspace.AirspaceLegs[0].AltitudeRange.LowerAltitude = newAltitude;
                                    }
                                    this.dragPoint.position = Cesium.Cartesian3.fromDegrees(this.dragPoint.id.loc.Longitude, this.dragPoint.id.loc.Latitude
                                            , newAltitude);
                                }
                                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.LINE.Value)
                                {
                                    if (this.dragPoint.id.data.hasOwnProperty('Up'))
                                    {
                                        //this.airspace.MaxTerrainAltitude = newAltitude;
                                        this.airspace.AirspaceLegs[0].AltitudeRange.UpperAltitude = newAltitude;
                                    }
                                    else if (this.dragPoint.id.data.hasOwnProperty('Down'))
                                    {
                                        //this.airspace.MinTerrainAltitude = newAltitude;
                                        this.airspace.AirspaceLegs[0].AltitudeRange.LowerAltitude = newAltitude;
                                    }
                                    this.dragPoint.position = Cesium.Cartesian3.fromDegrees(this.dragPoint.id.loc.Longitude, this.dragPoint.id.loc.Latitude
                                            , newAltitude);
                                }
                                else if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.RADARC.Value)
                                {
                                    if (this.dragPoint.id.data.hasOwnProperty('Up'))
                                    {
                                        //this.airspace.MaxTerrainAltitude = newAltitude;
                                        this.airspace.AirspaceLegs[0].AltitudeRange.UpperAltitude = newAltitude;
                                    }
                                    else if (this.dragPoint.id.data.hasOwnProperty('Down'))
                                    {
                                        //this.airspace.MinTerrainAltitude = newAltitude;
                                        this.airspace.AirspaceLegs[0].AltitudeRange.LowerAltitude = newAltitude;
                                    }
                                    this.dragPoint.position = Cesium.Cartesian3.fromDegrees(this.dragPoint.id.loc.Longitude, this.dragPoint.id.loc.Latitude
                                            , newAltitude);
                                }
                            }// ray not null
                        }
                        else
                        {
                            airspacePoint = this.mapView.getLocationFromPosition(event.endPosition);
                            if (airspacePoint)
                            {
                                cartographic.push(Cesium.Cartographic.fromDegrees(Number(airspacePoint.Longitude), Number(airspacePoint.Latitude), 0));
                                //cartographic.push(Cesium.Cartographic.fromDegrees(Number(airspacePoint.Longitude), Number(airspacePoint.Latitude), Number(airspacePoint.Altitude)));
                                this.dragPoint.position = Cesium.Cartesian3.fromDegrees(airspacePoint.Longitude, airspacePoint.Latitude, (cartographic[0].height + this.VERTICAL_PAD));
                            }
                        }

                        /// this.determineAirspaceTerrainAltitude();
                    }
                }
                catch (error)
                {
                    console.log('AirspaceDrawHandler.mouseMoveEdit, Inner: ' + error);
                }
                //            }, this));
            }
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler.mouseMoveEdit: ' + error);
        }
    };
    /*
     *
     */
    this.populateAirspace = function (airspacePoint)
    {

        var airspacePointList = null;
        var airspaceLeg = null;
        var airspaceLegList = null;
        var i = null;
        var replaceUndefined = false;

        try
        {

            this.cancelWatchers();
            //airspacePointList = $.extend(true, {}, this.airspace.AirspacePoints );
            airspacePointList = emp.helpers.copyObject(this.airspace.AirspacePoints);
            //airspacePointList = lang.clone(this.airspace.AirspacePoints);

            //See if any airspacePoints are undefined, if so replace the first one we come across.
            for (i = 0; i < airspacePointList.length; i++)
            {

                if (airspacePointList[i] === undefined)
                {

                    airspacePointList[i] = airspacePoint;
                    replaceUndefined = true;
                    break;
                }
            }

            //If no undefined airspace exist, add the point to the list.
            if (!replaceUndefined)
            {
                airspacePointList.push(airspacePoint);
            }

            if (this.airspace.AirspaceShapeType === AIRSPACE_SHAPE_TYPE.TRACK.Value)
            {

                if (this.airspace.AirspaceLegs.length < (airspacePointList.length - 1))
                {

                    //tracks have multiple legs
                    //airspaceLegList = $.extend(true, {}, this.airspace.AirspaceLegs );
                    airspaceLegList = emp.helpers.copyObject(this.airspace.AirspaceLegs);
                    //airspaceLegList = lang.clone(this.airspace.AirspaceLegs);
                    //airspaceLegList.push( $.extend(true, {}, this.airspace.AirspaceLegs ));
                    airspaceLegList.push(emp.helpers.copyObject(this.airspace.AirspaceLegs[0]));
                    //airspaceLegList.push(lang.clone(this.airspace.AirspaceLegs[0]));
                    //this.airspace.set('AirspaceLegs', airspaceLegList);
                    this.airspace.AirspaceLegs = airspaceLegList;
                }
            }

            //set the updated AirspacePoints in the airspace
            //this.airspace.set('AirspacePoints', airspacePointList);
            this.airspace.AirspacePoints = airspacePointList;
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler._populateAirspace: ' + error);
        }
        finally
        {

            this.createWatchers();
        }
    };
    /*
     * set the airspace attribute.
     */
    this.setAirspace = function (airspace)
    {

        try
        {
            this.airspace = airspace;
        }
        catch (error)
        {
            console.log('AirspaceDrawHandler.setAirspace: ' + error);
        }
    };
}
;
