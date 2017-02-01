///////////////////////////////////////////////////////////////////////////////
// TriangulatePolygon.js
//
// Copyright (c) 2015 General Dynamics Inc.
// The Government has the right to use, modify, reproduce,
// release, perform, display ,or disclose this computer
// software or computer software documentation without restriction.
//
///////////////////////////////////////////////////////////////////////////////
    
         

//        var Worker = declare('workers.tessellate.TriangulatePolygon', null, {
      function TriangulatePolygon ()
      {   
          
          this.LONGITUDE = 0;
         this.LATITUDE = 1;
         this.EARTH_RADIUS = 6371;
         this.EPSILON = .00001;
        
         this.allBaseLines = new Array();
      
            var   __construct = function() {
                on(self, "message", lang.hitch(this, this.onMessage));
            }();
            
            onMessage=function(e) {
                
                var results = null;
                
                try {
                    
                    results = this.triangulate(e.data);
                    postMessage(results);
                }
                catch(err) {
                    postMessage({message: true, result: 'TriangulatePolygon Failed: ' + err});
                }
            };
            
            triangulate= function(data) {
                
                var graph = null;
                var i = null;
                var messages = null;
                var points = null;
                var retObj = null;
                var subDividedTriangles = null;
                var tmptriangles = null;
                var tmpwallPoints= null;
                var triangles = null;
                var wallPoints = null;
                
                try {
                    messages = [];
                    points = [];
                    subDividedTriangles = [];
                    tmptriangles = [];
                    tmpwallPoints= [];
                    
                    retObj = {input : {requestId : data.requestId}};
                    
                    retObj.step = '1.) Preparing data';
                    for(i = 0; i < (data.points.length -1); i = (i + 2)) {
                        points.push([data.points[i], data.points[i + 1]]);
                    }
                    
                    retObj.step = '2.) Calling earcut';
                    triangles = earcut([points]);
                    
                    retObj.step = '3.) Subdividing Triangles';
                    
                    retObj.tessellationConfiguration = data.tessellationConfiguration;
                    this.subdivideTriangleList(data.tessellationConfiguration, triangles, subDividedTriangles, messages);
                    
                    while((data.tessellationConfiguration.maxTriangles * 3) < subDividedTriangles.length) {
                        
                        //Increase maxDistance by a factor of 3 and try again
                        data.tessellationConfiguration.maxDistance = data.tessellationConfiguration.maxDistance * 3;
                        retObj.tessellationConfiguration = data.tessellationConfiguration;
                        
//                        console.log('MaxDistance = ' + data.tessellationConfiguration.maxDistance);
                        
                        subDividedTriangles = [];
                        this.subdivideTriangleList(data.tessellationConfiguration, triangles, subDividedTriangles, messages);
                    }
                    
                    for (i = 0; i < subDividedTriangles.length; i++) {
    
                        tmptriangles.push({
                            Longitude : subDividedTriangles[i][LONGITUDE],
                            Latitude : subDividedTriangles[i][LATITUDE]
                        });
                    }
                    retObj.triangles = tmptriangles;
                    
                    retObj.step = '4.) Generate wallPoint list';
                    retObj.messages = messages;
                    
                    wallPoints = this.genateWallPoints(points, subDividedTriangles, messages);
                    for (i = 0; i < wallPoints.length; i++) {
                        
                        tmpwallPoints.push({
                            Longitude : wallPoints[i][LONGITUDE],
                            Latitude : wallPoints[i][LATITUDE]
                        });
                    }
                    retObj.wallPoints = tmpwallPoints;
                    retObj.step = '5.) Completed Successful';
                }
                catch(error) {
                    messages.push('TriangulatePolygon.triangulate, step = ' + retObj.step + ': ' + error);
                    retObj.error = error;
                }
                
                return retObj;
            };
            
            this.genateWallPoints = function(points, subDividedTriangles, messages) {
                
                var bearing = null;
                var graph = [];
                var i = null;
                var j = null;
                var tmpBearing = null;
                var wallPoints = [];
                
                //create a graph out of subdividedTriangles
                for(i = 0; i < subDividedTriangles.length; i++) {
                    
                    graph.push(subDividedTriangles[i]);
                }
                
                graph.sort(function(a, b) {
                    
                    if(a[LONGITUDE] < b[LONGITUDE]) {
                        return -1;
                    }
                    else if((a[LONGITUDE] === b[LONGITUDE]) && (a[LATITUDE] < b[LATITUDE])) {
                        return -1;
                    }
                    else if((a[LONGITUDE] === b[LONGITUDE]) && (a[LATITUDE] === b[LATITUDE])) {
                        return 0;
                    }
                    else if((a[LONGITUDE] === b[LONGITUDE]) && (a[LATITUDE] > b[LATITUDE])) {
                        return 1;
                    }
                    else if(a[LONGITUDE] > b[LONGITUDE]) {
                        return 1;
                    }
                });
                
                //remove duplicate points
                i = 0;
                while(i < graph.length -1) {
                    
                    if((Math.abs(graph[i][LONGITUDE] - graph[i + 1][LONGITUDE]) < EPSILON) && 
                            (Math.abs(graph[i][LATITUDE] - graph[i + 1][LATITUDE]) < EPSILON)) {
                        
                        graph.splice((i + 1), 1);
                    }
                    
                    i++;
                }
                
//                messages.push('number of points = ' + points.length);
                for(i = 0; i < points.length -1; i++) {
                    
                    bearing = this.bearingBetween(points[i], points[i + 1], messages);
                    
                    var start = this.findGraphPointIndex(points[i], graph);
                    var end = this.findGraphPointIndex(points[i + 1], graph);
                    
//                    messages.push('working points number = ' + i + ', long = ' + points[i][LONGITUDE] + ', lat = ' + points[i][LATITUDE]);
//                    messages.push('working points number = ' + i + 1 + ', long = ' + points[i + 1 ][LONGITUDE] + ', lat = ' + points[i + 1][LATITUDE]);
//                    messages.push('start = ' + start);
//                    messages.push('end = ' + end);
//                    messages.push('bearing = ' + bearing);
//                    messages.push('start end bearing = ' + this.bearingBetween(graph[start], graph[end]));
                    
                    if((start !== null) && (end !== null)) {
                        
                        wallPoints.push(graph[start]);
                        
                        if(start < end) {
                            
                            wallPoints.push(graph[start]);
                            
//                            messages.push('ascending');
                            
                            for(j = (start + 1); j < end; j++) {
                                
                                tmpBearing = this.bearingBetween(points[i], graph[j], messages);
//                                messages.push('tmpBearing = ' + tmpBearing);
                                if(Math.abs(bearing - tmpBearing) < EPSILON) {
                                    
                                    wallPoints.push(graph[j]);
                                }
                            }
                            
                            wallPoints.push(graph[end]);
                        }
                        else {
                            
                            wallPoints.push(graph[start]);
//                            bearing = this.bearingBetween(points[i], points[i + 1]);
                            
//                            messages.push('descending');
                            
                            for(j = (start - 1); j > end; j--) {
                                
                                tmpBearing = this.bearingBetween(points[i], graph[j], messages);
//                                messages.push('tmpBearing = ' + tmpBearing);
                                if(Math.abs(bearing - tmpBearing) < EPSILON) {
                                    
                                    wallPoints.push(graph[j]);
                                }
                            }
                            
                            wallPoints.push(graph[end]);
                        }
                    }
                    
                    messages.push('wallPoints.length = ' + wallPoints.length);
                }
                
                return wallPoints;
            };
            
            this.findGraphPointIndex = function(point, graph) {
                
                var i = null;
                
                for(i = 0; i < graph.length; i++) {
                    
                    if((Math.abs(point[LONGITUDE] - graph[i][LONGITUDE]) < EPSILON) && 
                            (Math.abs(point[LATITUDE] - graph[i][LATITUDE]) < EPSILON))
                        
                        return i;
                }
            };
                
            this.findGraphPointIndex2 = function(point, graph, comparator, messages) {
                
                var comparRet = null;
                var left = null;
                var middle = null;
                var midPoint = null;
                var right = null;
                
                try {
                    
                    left = 0;
                    right = graph.length -1;
                    
                    middle = left + Math.floor((right - left) / 2);
                    midPoint = graph[middle];
                    comparRet = comparator(point, midPoint);
                    while(comparRet !== 0) {
                        
                        if(comparRet < 0) {
                            
                            left = middle;
//                            right = middle;
                            middle = left + Math.floor((right - left) / 2);
                            
                            midPoint = graph[middle];
                            comparRet = comparator(point, midPoint);
                        }
                        else {
                            
//                            left = middle;
                            right = middle;
                            middle = left + Math.floor((right - left) / 2);
                            
                            midPoint = graph[middle];
                            comparRet = comparator(point, midPoint);
                        }
                    }
                }
                catch(error) {
                    messages.push('TriangulatePolygon._findGraphPointIndex: = ' + error);
                }
            },
            
            _subdivideTriangleList= function(tessellationConfiguration, inList, outList, messages) {
                
                var bearing = null;
                
                var distance01 = null;
                var distance02 = null;
                var distance12 = null;
                
                var halfPoint01 = null;
                var halfPoint12 = null;
                var halfPoint02 = null;
                
                var inListClone = null;
                
                var point0 = null;
                var point1 = null;
                var point2 = null;
                
                try {
                
                    //inListClone = emp.$.extend(true, {}, inList );
                    inListClone = emp.helpers.copyObject(inList);
                     //inListClone = lang.clone(inList);
                    
                    while(0 < inListClone.length) {
                        
                        //If number of triangles too large bail out.
                        if((tessellationConfiguration.maxTriangles * 3) < outList.length) {
                            
                            return;
                        }
                        
                        // read three points which make up a triangle
                        point0 = inListClone.pop();
                        if (!point0) {
                            return;
                        }

                        point1 = inListClone.pop();
                        if (!point1) {
                            
                            return;
                        }

                        point2 = inListClone.pop();
                        if (!point2) {

                            return;
                        }
                        
                        distance01 = this.distanceBetween(point0, point1, messages) / 2;
                        distance02 = this.distanceBetween(point0, point2, messages) / 2;
                        distance12 = this.distanceBetween(point1, point2, messages) / 2;

                        if ((tessellationConfiguration.maxDistance < distance01) || 
                                (tessellationConfiguration.maxDistance < distance12) || 
                                (tessellationConfiguration.maxDistance < distance02)) {//} &&
//                                (tessellationConfiguration.minDistance < distance01) && 
//                                (tessellationConfiguration.minDistance < distance12) && 
//                                (tessellationConfiguration.minDistance < distance02)) {
                            
                            //break the triangle into 4 triangles and push them on the array
                            bearing = this.bearingBetween(point0, point1);
                            halfPoint01 = this.destinationPoint(point0, bearing, distance01);
                            
                            bearing = this.bearingBetween(point0, point2);
                            halfPoint02 = this.destinationPoint(point0, bearing, distance02);
                            
                            bearing = this.bearingBetween(point1, point2);
                            halfPoint12 = this.destinationPoint(point1, bearing, distance12);

                            //first triangle
                            inListClone.push(point0);
                            inListClone.push(halfPoint01);
                            inListClone.push(halfPoint02);
                            
                            //second triangle
                            inListClone.push(halfPoint01);
                            inListClone.push(point1);
                            inListClone.push(halfPoint12);
                            
                            //third triangle
                            inListClone.push(halfPoint02);
                            inListClone.push(halfPoint12);
                            inListClone.push(point2);
                            
                            //four triangle
                            inListClone.push(halfPoint01);
                            inListClone.push(halfPoint12);
                            inListClone.push(halfPoint02);
                        }
                        else {
                            
                            //triangle is should be written to the outList
                            outList.push(point0);
                            outList.push(point1);
                            outList.push(point2);
                        }
                    }
                }
                catch(error) {
                    messages.push('TriangulatePolygon._subdivideTriangleList:' + error);
                }
            };
            
            convertToDegrees= function(radians) {
                
                return radians / (Math.PI/180);
            },

            convertToRadians= function(degrees) {
                
                return degrees * (Math.PI/180);
            },

            /* returns meters between the 2 points */
            distanceBetween= function(point1, point2, messages) {
                
                var a = null;
                var c = null;
                var d = null;
                var deltaLambda = null;
                var deltaTheta = null;
                var lambda1 = null;
                var lambda2 = null;
                var theta1 = null;
                var theta2 = null;
                
                try {
                
                    theta1 = this.convertToRadians(point1[LATITUDE]);
                    lambda1 = this.convertToRadians(point1[LONGITUDE]);
                    theta2 = this.convertToRadians(point2[LATITUDE]);
                    lambda2 = this.convertToRadians(point2[LONGITUDE]);
                    
                    deltaTheta = theta2 - theta1;
                    deltaLambda = lambda2 - lambda1;

                    a = Math.sin(deltaTheta / 2) * Math.sin(deltaTheta / 2) +
                            Math.cos(theta1) * Math.cos(theta2) *
                            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
                    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    d = EARTH_RADIUS * c * 1000;
                }
                catch(error) {
                    messages.push('TriangulatePolygon.distanceBetween: ' + error);
                }

                return d;
            },

            /**
             * Returns the (initial) bearing from point1, point2 to destination point.
             */
            bearingBetween= function(point1, point2) {
                
                var deltaLambda = null;
                var result = null;
                var theta = null;
                var theta1 = null;
                var theta2 = null;
                var x = null;
                var y = null;
                
                try {
                
                    theta1 = this.convertToRadians(point1[LATITUDE]);
                    theta2 = this.convertToRadians(point2[LATITUDE]);
                    deltaLambda = this.convertToRadians(point2[LONGITUDE] - point1[LONGITUDE]);

                    // see http://mathforum.org/library/drmath/view/55417.html
                    y = Math.sin(deltaLambda) * Math.cos(theta2);
                    x = Math.cos(theta1) * Math.sin(theta2) - Math.sin(theta1) * Math.cos(theta2) * Math.cos(deltaLambda);
                    theta = Math.atan2(y, x);
                    
                    result = (this.convertToDegrees(theta) + 360) % 360;
                }
                catch(error) {
                    messages.push('TriangulatePolygon.bearingBetween: ' + error);
                }

                return result;
            },

            /**
             * Returns the destination point from point having travelled the given distance on the
             * given initial bearing (bearing normally varies around path followed).
             *
             */
            destinationPoint= function(point, brng, dist) {
                
                // see http://williams.best.vwh.net/avform.htm#LL
                var delta = null;
                var lambda1 = null;
                var lambda2 = null;
                var result = null;
                var theta = null;
                var theta1 = null;
                var theta2 = null;
                var tmpDist = null;
                
                try {

                    tmpDist = dist / 1000; //convert between meters and kilometers
                    theta = this.convertToRadians(brng);
                    delta = tmpDist / EARTH_RADIUS; // angular distance in radians

                    theta1 = this.convertToRadians(point[LATITUDE]);
                    lambda1 = this.convertToRadians(point[LONGITUDE]);

                    theta2 = Math.asin(Math.sin(theta1) * Math.cos(delta) + Math.cos(theta1) * Math.sin(delta) * Math.cos(theta));
                    lambda2 = lambda1 + Math.atan2(Math.sin(theta) * Math.sin(delta) * Math.cos(theta1), Math.cos(delta) - Math.sin(theta1) * Math.sin(theta2));
                    lambda2 = (lambda2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // normalise to -180..+180�

                    result =  [this.convertToDegrees(lambda2), this.convertToDegrees(theta2)];
                }
                catch(error) {
                  console.log('TriangulatePolygon.destinationPoint: ' + error);
                }
                
                return result;
            };
        };
        