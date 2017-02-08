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
        PixelsToGeo: function(pixel) {
            var leafletPoint = new L.Point(pixel.getX(), pixel.getY());
            var point2D = new armyc2.c2sd.graphics2d.Point2D ();
            //var latlng = privateInterface.leafletMap.layerPointToLatLng(leafletPoint).wrap();
            var latlng = privateInterface.leafletMap.containerPointToLatLng(leafletPoint).wrap();
            
            //console.log("PixeltoGeo: x:" + pixel.getX() + " y:" + pixel.getY() + " => " + latlng.lat + "/" + latlng.lng);
            
            point2D.setLocation(latlng.lng, latlng.lat);
            
            return point2D;
        },
        GeoToPixels: function(coord) {
            var point;
            var inBoundingBox;
            var tempLng;
            var coordLatLng = new L.LatLng(coord.y, coord.x);
            var leafletLatLng = coordLatLng.wrap();
            var leafletPoint = new L.Point(0,0);
            var point2D = new armyc2.c2sd.graphics2d.Point2D ();
            
            inBoundingBox = privateInterface.empMapBounds.containsCoordiante(leafletLatLng);
            
            if (privateInterface.containeIDL) {
                // Find the half of the outside lng.
                tempLng = (privateInterface.empMapBounds.getWest() - privateInterface.empMapBounds.getEast()) / 2.0;
                tempLng += privateInterface.empMapBounds.getEast();
                if (privateInterface.mapBounds.getEast() > 180.0) {
                    // The IDL is on the right.
                    if (leafletLatLng.lng < tempLng) {
                        leafletLatLng.lng += 360.0;
                    }
                } else {
                    // The IDL is on the left.
                    if (leafletLatLng.lng > tempLng) {
                        leafletLatLng.lng -= 360.0;
                    }
                }
            } else {
                //inBoundingBox = privateInterface.empMapBounds.containsCoordiante(privateInterface.leafletLatLng);

                if (!inBoundingBox) {
                    // Find the half of the outside lng.
                    tempLng = (privateInterface.empMapBounds.getWest() + 180.0);
                    tempLng += (180.0 - privateInterface.empMapBounds.getEast());
                    tempLng = tempLng / 2.0;
                    
                    if ((privateInterface.empMapBounds.getWest() - tempLng) >= -180.0) {
                        tempLng = privateInterface.empMapBounds.getWest() - tempLng;
                        if (leafletLatLng.lng < tempLng) {
                            leafletLatLng.lng += 360.0;
                        }
                    } else {
                        tempLng = privateInterface.empMapBounds.getEast() + tempLng;
                        if (leafletLatLng.lng > tempLng) {
                            leafletLatLng.lng -= 360.0;
                        }
                    }
                 }
            }
            
            //point = privateInterface.leafletMap.latLngToLayerPoint(leafletLatLng);
            point = privateInterface.leafletMap.latLngToContainerPoint(leafletLatLng);
            
            //console.log("GeoToPixel IDL:" + privateInterface.containeIDL + " InBBox:" + inBoundingBox + " Moved:" + (leafletLatLng.lng != coord.x) + " lat/Lng:" + coord.y + "/" + coord.x + ((leafletLatLng.lng != coord.x)? "(" + leafletLatLng.lat + "/" + leafletLatLng.lng + ")": "") + " =>  x:" + point.x + " y:" + point.y);
            point2D.setLocation(point.x, point.y);
            
            return point2D;
        }
    };

    privateInterface.rendererPointConverter(leafletMap, pixelWidth, pixelHeight, mapBounds, empMapBounds);
    
    return publicInterface;
};
