/* global leafLet, L, emp, armyc2, sec */

leafLet.utils = leafLet.utils || {};
leafLet.utils.renderer = leafLet.utils.renderer || {};

leafLet.utils.renderer.PointConverter = function(leafletMap, pixelWidth, pixelHeight, mapBounds, empMapBounds) {
    var privateInterface = {
        pixelWidth: 0,
        pixelHeight: 0,
        mapBounds: undefined,
        empMapBounds: undefined,
        mapCenter: undefined,
        leafletLatLng: new L.LatLng(0,0),
        leafletPoint: new L.Point(0,0),
        point2D: new armyc2.c2sd.graphics2d.Point2D (),
        normalize: true,
        leafletMap: undefined,
        containeIDL: false,
        rendererPointConverter: function(leafletMap, pixelWidth, pixelHeight, mapBounds, empMapBounds) {
            privateInterface.leafletMap = leafletMap;
            privateInterface.pixelWidth = Number(pixelWidth);
            privateInterface.pixelHeight = Number(pixelHeight);
            privateInterface.mapBounds = mapBounds;
            privateInterface.empMapBounds = empMapBounds;
            privateInterface.mapCenter = leafletMap.getCenter();
            privateInterface.containeIDL = empMapBounds.containsIDL();
        }
    };

    var publicInterface = {
        set_normalize: function(value) {
            privateInterface.normalize = value;
        },
        PixelsToGeo: function(pixel) {
            privateInterface.leafletPoint.x = pixel.getX();
            privateInterface.leafletPoint.y = pixel.getY();
            var latlng = privateInterface.leafletMap.layerPointToLatLng(privateInterface.leafletPoint).wrap();
            
            console.log("PixeltoGeo: x:" + pixel.getX() + " y:" + pixel.getY() + " => " + latlng.lat + "/" + latlng.lng);
            
            privateInterface.point2D.setLocation(latlng.lng, latlng.lat);
            
            return privateInterface.point2D;
        },
        GeoToPixels: function(coord) {
            var point;
            var inBoundingBox = false;
            var tempLng;
            
            privateInterface.leafletLatLng.lat = coord.y;
            privateInterface.leafletLatLng.lng = coord.x;
            
            inBoundingBox = privateInterface.empMapBounds.containsCoordiante(privateInterface.leafletLatLng);
            
            if (privateInterface.containeIDL) {
                // Find the half of the outside lng.
                tempLng = (privateInterface.empMapBounds.getWest() - privateInterface.empMapBounds.getEast()) / 2.0;
                tempLng += privateInterface.empMapBounds.getEast();
                if (privateInterface.mapBounds.getEast() > 180) {
                    // The IDL is on the right.
                    if (privateInterface.leafletLatLng.lng < tempLng) {
                        privateInterface.leafletLatLng.lng += 360;
                    }
                } else {
                    // The IDL is on the left.
                    if (privateInterface.leafletLatLng.lng > tempLng) {
                        privateInterface.leafletLatLng.lng -= 360;
                    }
                }
            } else {
                //inBoundingBox = privateInterface.empMapBounds.containsCoordiante(privateInterface.leafletLatLng);

                if (!inBoundingBox) {
                    // Find the half of the outside lng.
                    tempLng = (privateInterface.empMapBounds.getWest() + 180.0);
                    tempLng += (180.0 - privateInterface.empMapBounds.getEast());
                    tempLng = tempLng / 2.0;
                    
                    if ((privateInterface.empMapBounds.getWest() - tempLng) >= -180) {
                        tempLng = privateInterface.empMapBounds.getWest() - tempLng;
                        if (privateInterface.leafletLatLng.lng < tempLng) {
                            privateInterface.leafletLatLng.lng += 360;
                        }
                    } else {
                        tempLng = privateInterface.empMapBounds.getEast() + tempLng;
                        if ((privateInterface.empMapBounds.getEast() > privateInterface.leafletLatLng.lng) ||
                                (privateInterface.leafletLatLng.lng > tempLng)) {
                            privateInterface.leafletLatLng.lng -= 360;
                        }
                    }
                }
            }
            
            point = privateInterface.leafletMap.latLngToLayerPoint(privateInterface.leafletLatLng);
            
            console.log("GeoToPixel IDL:" + privateInterface.containeIDL + " InBBox:" + inBoundingBox + " Moved:" + (privateInterface.leafletLatLng.lng != coord.x) + " lat/Lng:" + coord.y + "/" + coord.x + "=>  x:" + point.x + " y:" + point.y);
            privateInterface.point2D.setLocation(point.x, point.y);
            
            return privateInterface.point2D;
        }
    };

    privateInterface.rendererPointConverter(leafletMap, pixelWidth, pixelHeight, mapBounds, empMapBounds);
    
    return publicInterface;
};
