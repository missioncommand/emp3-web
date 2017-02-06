/* global leafLet, L, emp, armyc2, sec */

leafLet.utils = leafLet.utils || {};
leafLet.utils.milstd = leafLet.utils.milstd || {};

leafLet.utils.milstd.rendererPointConverter = function(leafletMap, pixelWidth, pixelHeight, geoTop, geoLeft, geoBottom, geoRight) {
    var privateInterface = {
        scale: 0,
        pixelWidth: 0,
        pixelHeight: 0,
        geoTop: 0,
        geoLeft: 0,
        geoBottom: 0,
        geoRight: 0,
        pixelMultiplierX: 0,
        pixelMultiplierY: 0,
        normalize: true,
        leafletMap: null;
        rendererPointConverter: function(leafletMap, pixelWidth, pixelHeight, geoTop, geoLeft, geoBottom, geoRight) {
            var distanceInDegrees;
            var distanceInMeters;
            var scale;
            
            privateInterface.leafletMap = leafletMap;
            privateInterface.pixelWidth = Number(pixelWidth);
            privateInterface.pixelHeight = Number(pixelHeight);
            privateInterface.geoTop = Number(geoTop);
            privateInterface.geoLeft = Number(geoLeft);
            privateInterface.geoBottom = Number(geoBottom);
            privateInterface.geoRight = Number(geoRight);
            privateInterface.pixelMultiplierX = (privateInterface.geoRight - privateInterface.geoLeft) / (privateInterface.pixelWidth);
            privateInterface.pixelMultiplierY = (privateInterface.geoTop - privateInterface.geoBottom) / (privateInterface.pixelHeight);

            if ((privateInterface.geoRight - privateInterface.geoLeft) < -180) {
                privateInterface.pixelMultiplierX = (privateInterface.geoRight - privateInterface.geoLeft + 360) / (privateInterface.pixelWidth);
            }

            if ((privateInterface.geoRight - privateInterface.geoLeft) > 180) {
                privateInterface.pixelMultiplierX = (360 - (privateInterface.geoRight - privateInterface.geoLeft)) / (privateInterface.pixelWidth);
            }

            if (privateInterface.geoTop < privateInterface.geoBottom) {
                privateInterface.pixelMultiplierY = -Math.abs(privateInterface.pixelMultiplierY);
            } else {
                privateInterface.pixelMultiplierY = Math.abs(privateInterface.pixelMultiplierY);
            }
                
            distanceInDegrees = Math.abs(privateInterface.geoRight - privateInterface.geoLeft);
            
            if(Math.abs(privateInterface.geoRight - privateInterface.geoLeft) > 180) {
                distanceInDegrees=Math.abs(distanceInDegrees-360);
            }
            
    	    distanceInMeters = (distanceInDegrees / 360) * (40.075 * 1000000);
            scale = (privateInterface.pixelWidth / distanceInMeters) * (1.0 / 96.0) * (1.0 / 39.37);
            privateInterface.scale = 1.0 / scale;
        };
    };

    var publicInterface = {
        set_normalize: function(value) {
            privateInterface.normalize = value;
        },
        PixelsToGeo: function(pixel) {
            var coords =  new armyc2.c2sd.graphics2d.Point2D ();
/*            
            var x = ((pixel.getX () * privateInterface.pixelMultiplierX) + privateInterface.geoLeft);
            var y = (privateInterface.geoTop - (pixel.getY () * privateInterface.pixelMultiplierY));
            
            if (x > 180) {
                x -= 360;
            }
            
            if (x < -180) {
                x += 360;
            }
            
            coords.setLocation(x, y);
   */
            var point = new L.Point(pixel.getX(), pixel.getY());
            var latlng = privateInterface.leafletMap.containerPointToLatLng(point).wrap();
            
            coords.setLocation(latlng.lng, latlng.lat);
            
            return coords;
        },
        GeoToPixels: function(coord) {
            var pixel =  new armyc2.c2sd.graphics2d.Point2D ();
/*
            var x = 0;
            var y = 0;
            var calcValue = coord.getX() - privateInterface.geoLeft;
            
            if (privateInterface.normalize) {
                if (calcValue < -180) {
                    calcValue += 360;
                } else if (calcValue > 180) {
                    calcValue -= 360;
                }
            }
            x = (calcValue / privateInterface.pixelMultiplierX);

            y = ((privateInterface.geoTop - coord.getY ()) / privateInterface.pixelMultiplierY);

            pixel.setLocation(x, y);
*/
            var latlng = new L.LatLng(coord.y, coord.x).wrap();
            var point = privateInterface.leafletMap.latLngToContainerPoint(latlng);
            
            pixel.setLocation(point.x, point.);
            
            return pixel;
        }
    };

    privateInterface.rendererPointConverter(pixelWidth, pixelHeight, geoTop, geoLeft, geoBottom, geoRight);
    
    return publicInterface;
};
