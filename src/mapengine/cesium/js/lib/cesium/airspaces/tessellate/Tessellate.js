///////////////////////////////////////////////////////////////////////////////
// Tessellate.js
//
// Copyright (c) 2015 General Dynamics Inc.
// The Government has the right to use, modify, reproduce,
// release, perform, display ,or disclose this computer
// software or computer software documentation without restriction.
//
///////////////////////////////////////////////////////////////////////////////

function Tessellate(mapView)
{
//    return declare('app.map.tessellate.Tessellate', null, {


    this.count = null;
    this.mapView = null;
    this.requests = null;
    this.workerHandle = null;
    this.workers = null;

    this.NUM_WORKERS = 3;

    var __construct = function (mapView)
    {

        var i = null;

        try
        {

            this.mapView = mapView;

            this.requests = {};// acevedo - ojo 
            /// this.requests = new Dictionary(); dojo dependency
            this.count = 0;
            this.workers = [];
            this.workerHandle = [];

//                for (i = 0; i < this.NUM_WORKERS; i++) {// acevedo workerUtils missing.
//
//                    this.workers[i] = workerUtils.startworker('workers/tessellate/TriangulatePolygon', null,
//                            [ 'lib/earcut/earcut.js' ]);
//
//                    this.workerHandle[i] = on(this.workers[i], 'message', emp.$.proxy(this.tessellateComplete, this));
//                     //this.workerHandle[i] = on(this.workers[i], 'message', lang.hitch(this, this.tessellateComplete));
//                }
        }
        catch (error)
        {
            console.warn('Tessellate.constructor: ' + error);
        }
    }(mapView);

    tessellateAirspace = function (pointList, tessellationConfig)
    {

        var deferred = null;
        var i = null;
        var workerNum = null;

        try
        {

            deferred = Cesium.when.defer();/////new Deferred();

            workerNum = (++this.count) % this.NUM_WORKERS;

            this.requests.add(String(this.count), deferred);

            this.workers[workerNum].postMessage({
                points: pointList,
                requestId: this.count,
                tessellationConfiguration: tessellationConfig
            });

            return deferred.promise;
        }
        catch (error)
        {
            console.warn('Tessellate._tessellateAirspace: ' + error);

            if (deferred)
            {
                deferred.reject('Tessellate._tessellateAirspace: ' + error);
            }
        }
    };

    _tessellateComplete = function (response)
    {

        var cartographic = null;
        var deferred = null;
        var i = null;
        var height = null;
        var pendingRequest = null;
        var pointList = null;
        var retObj = null;
        var tessellatedPoint = null;
        var tmpHeightList = null;
        var tmpPointList = null;
        var wallHeights = null;
        var wallPoints = null;

        try
        {

            tmpHeightList = [];
            tmpPointList = [];
            wallHeights = [];
            wallPoints = [];

            if (response.data.type === 'console')
            {
                return;
            }

            pendingRequest = this.requests.item(response.data.input.requestId);

            if (pendingRequest)
            {

                deferred = pendingRequest;

                this.requests.remove(response.data.input.requestId);

                if (!deferred.isCanceled())
                {

                    if (response.data.error)
                    {
                        throw response.data.error.message;
                    }

                    console.info('MaxDistance in tesselation = ' + response.data.tessellationConfiguration.maxDistance);

                    if (response.data.triangles)
                    {

                        tessellatedPoint = response.data.triangles;

                        for (i = 0; i < tessellatedPoint.length; i++)
                        {

                            cartographic = Cesium.Cartographic.fromDegrees(tessellatedPoint[i].Longitude,
                                    tessellatedPoint[i].Latitude);

                            tmpPointList.push(tessellatedPoint[i].Longitude);
                            tmpPointList.push(tessellatedPoint[i].Latitude);

                            height = this.mapView.scene.globe.getOptimizedHeight(cartographic);
                            tmpHeightList.push(height);
                        }
                    }

                    if (response.data.wallPoints)
                    {

                        tessellatedPoint = response.data.wallPoints;

                        for (i = 0; i < tessellatedPoint.length; i++)
                        {

                            cartographic = Cesium.Cartographic.fromDegrees(tessellatedPoint[i].Longitude,
                                    tessellatedPoint[i].Latitude);

                            wallPoints.push(tessellatedPoint[i].Longitude);
                            wallPoints.push(tessellatedPoint[i].Latitude);

                            height = this.mapView.scene.globe.getOptimizedHeight(cartographic);
                            wallHeights.push(height);
                        }
                    }

                    //set the response to null so it can be garbage collected easily.
                    response = null;

                    retObj = {
                        pointList: tmpPointList,
                        positionHeights: tmpHeightList,
                        wallHeights: wallHeights,
                        wallPoints: wallPoints
                    };

//                        if(tmpPointList) {
//                            console.info('Tessellate._tessellateComplete pointList length (point is a lat and a long) = ' + (tmpPointList.length /2) + ' number of triangles = ' + (tmpPointList.length /6));
//                        }
//                        
//                        if(tmpHeightList) {
//                            console.info('Tessellate._tessellateComplete positionHeights length = ' + tmpHeightList.length);
//                        }
//                        
//                        if(wallHeights) {
//                            console.info('Tessellate._tessellateComplete wallHeights length = ' + wallHeights.length);
//                        }
//                        
//                        if(wallPoints) {
//                            console.info('Tessellate._tessellateComplete wallPoints length = ' + wallPoints.length);
//                        }

                    //console.info('Tessellate._tessellateComplete complete');
                    deferred.resolve(retObj);
                }
            }
        }
        catch (error)
        {
            console.warn('Tessellate._tessellateComplete, Inner: ' + error);

            if (deferred)
            {
                deferred.reject('Tessellate._tessellateComplete, Inner: ' + error);
            }
        }
    };

    this.destroy = function ()
    {

        var i = null;

        try
        {
            if (this.workers)
            {
                for (i = 0; i < this.workers.length; i++)
                {

                    workerUtils.destroyWorker(this.workers[i]);
                }
            }

            if (this.workerHandle)
            {
                for (i = 0; i < this.workerHandle.length; i++)
                {

                    this.workerHandle[i].remove();
                }
            }

            this.workers = [];
            this.workerHandle = [];
        }
        catch (error)
        {
            console.warn('Tessellate.destroy: ' + error);
        }
    };
}
;

