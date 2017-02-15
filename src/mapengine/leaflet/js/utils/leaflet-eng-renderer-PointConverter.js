/* global leafLet, L, emp, armyc2, sec */

leafLet.utils = leafLet.utils || {};
leafLet.utils.renderer = leafLet.utils.renderer || {};

leafLet.utils.renderer.PointConverter = function(leafletMap, pixelWidth, pixelHeight, mapBounds, empMapBounds) {
    var privateInterface = {
        pixelWidth: 0,
        pixelHeight: 0,
        mapBounds: undefined,
        empMapBounds: undefined,
        normalize: true,
        leafletMap: undefined,
        containeIDL: false,
        rendererPointConverter: function(leafletMap, pixelWidth, pixelHeight, mapBounds, empMapBounds) {
            privateInterface.leafletMap = leafletMap;
            privateInterface.pixelWidth = Number(pixelWidth);
            privateInterface.pixelHeight = Number(pixelHeight);
            privateInterface.mapBounds = leafletMap.getBounds();
            privateInterface.empMapBounds = new leafLet.typeLibrary.EmpBoundary(privateInterface.mapBounds);
            privateInterface.containeIDL = empMapBounds.containsIDL();
        }
    };

    var publicInterface = {
        set_normalize: function(value) {
            privateInterface.normalize = value;
        },
        /*
        This method translates a pixel x/y postion to a lat/lng coordinate.
        The Lat/Lng is normalized.
        */
        PixelsToGeo: function(pixel) {
            var leafletPoint = new L.Point(pixel.getX(), pixel.getY());
            var point2D = new armyc2.c2sd.graphics2d.Point2D();
            var latlng = privateInterface.leafletMap.containerPointToLatLng(leafletPoint).wrap();
            
            //console.log("PixeltoGeo: x:" + pixel.getX() + " y:" + pixel.getY() + " => " + latlng.lat + "/" + latlng.lng);
            
            point2D.setLocation(latlng.lng, latlng.lat);
            
            return point2D;
        },
        /*
        This method translates a lat/lng coordinate to a pixel x/y position.
        The lat/lng is normalized then updated based on the map bounding box.
        The Leaflet map can have a bounding box with an West value < -180 or
        an East value > 180 when the IDL is in the viewing area.
        The longitude width of the viewing area is < 180 deg.
        */
        GeoToPixels: function(coord) {
            var point;
            var inBoundingBox;
            var tempLng;
            var coordLatLng = new L.LatLng(coord.y, coord.x);
            var leafletLatLng = coordLatLng.wrap();
            var leafletPoint = new L.Point(0,0);
            var point2D = new armyc2.c2sd.graphics2d.Point2D();
            
            //inBoundingBox = privateInterface.empMapBounds.containsCoordiante(leafletLatLng);
            
            if (privateInterface.containeIDL) {
                // The IDL is in the viewing area.
                // Find the middle of the outside lng degrees.
                tempLng = (privateInterface.empMapBounds.getWest() - privateInterface.empMapBounds.getEast()) / 2.0;
                tempLng += privateInterface.empMapBounds.getEast();
                if (privateInterface.mapBounds.getEast() > 180.0) {
                    // The IDL is on the right of the map.
                    if (leafletLatLng.lng < tempLng) {
                        // The coordinate is on the right side of the globe
                        leafletLatLng.lng += 360.0;
                    }
                } else {
                    // West < -180
                    // The IDL is on the left of the map.
                    if (leafletLatLng.lng > tempLng) {
                        // The coordinate is on the left side of the globe.
                        leafletLatLng.lng -= 360.0;
                    }
                }
            } else {
                // the IDL is NOT in the viewing area.
                inBoundingBox = privateInterface.empMapBounds.containsCoordiante(leafletLatLng);

                if (!inBoundingBox) {
                    // The coordinate is NOT in the viewing area.
                    // We need to find on which side of the globe the coordiante is on.
                    // Find the half of the outside lng.
                    tempLng = (privateInterface.empMapBounds.getWest() + 180.0);
                    tempLng += (180.0 - privateInterface.empMapBounds.getEast());
                    tempLng = tempLng / 2.0;
                    
                    if ((privateInterface.empMapBounds.getWest() - tempLng) >= -180.0) {
                        tempLng = privateInterface.empMapBounds.getWest() - tempLng;
                        if (leafletLatLng.lng < tempLng) {
                            // The coordinate is not in the viewing area and is on the right side of the globe.
                            leafletLatLng.lng += 360.0;
                        }
                    } else {
                        tempLng = privateInterface.empMapBounds.getEast() + tempLng;
                        if (leafletLatLng.lng > tempLng) {
                            // The coordinate is not in the viewing area and is on the left side of the globe.
                            leafletLatLng.lng -= 360.0;
                        }
                    }
                 }
            }
            // Get the pixel coordainte of the lat/lng coordinate.
            point = privateInterface.leafletMap.latLngToContainerPoint(leafletLatLng);
            
            //console.log("GeoToPixel IDL:" + privateInterface.containeIDL + " InBBox:" + inBoundingBox + " Moved:" + (leafletLatLng.lng != coord.x) + " lat/Lng:" + coord.y + "/" + coord.x + ((leafletLatLng.lng != coord.x)? "(" + leafletLatLng.lat + "/" + leafletLatLng.lng + ")": "") + " =>  x:" + point.x + " y:" + point.y);
            point2D.setLocation(point.x, point.y);
            
            return point2D;
        }
    };

    privateInterface.rendererPointConverter(leafletMap, pixelWidth, pixelHeight, mapBounds, empMapBounds);
    
    return publicInterface;
};
