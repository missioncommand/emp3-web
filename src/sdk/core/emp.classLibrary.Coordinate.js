
/* global NaN, LatLon */

emp.classLibrary.privateClass = function() {
    var publicInterface = {
        initialize: function (lat, lon, alt) {
            var latitude;
            var longitude;
            var altitude;
            var oLatLon;
            var oOptions;
            
            if (lat instanceof LatLon) {
                latitude = lat._lat;
                longitude = lat._lon;
            } else {
                if ((typeof (lat) === 'number') && !isNaN(lat)) {
                    latitude = lat;
                } else if (!emp.util.isEmptyString(lat)) {
                    latitude = parseFloat(lat);
                } else {
                    throw new Error('Invalid Latitude value: (' + lat + ')');
                }

                if ((typeof (lon) === 'number') && !isNaN(lon)) {
                    longitude = lon;
                } else if (!emp.util.isEmptyString(lon)) {
                    longitude = parseFloat(lon);
                } else {
                    throw new Error('Invalid Longitude value: (' + lon + ')');
                }
            }
            
            oLatLon = new LatLon(latitude, longitude);

            if ((typeof (alt) === 'number') && !isNaN(alt)) {
                altitude = alt;
            } else if (!emp.util.isEmptyString(alt)) {
                altitude = parseFloat(alt);
            }
            
            oOptions = {
                oLatLon: oLatLon,
                altitude: altitude
            };
            emp.classLibrary.Util.setOptions(this, oOptions);
        },
        /**
         * @description This function return the latitude of the coordinate.
         */
        getLatitude: function() {
            return this.options.oLatLon._lat;
        },
        /**
         * @description This function return the longitude of the coordinate.
         */
        getLongitude: function() {
            return this.options.oLatLon._lon;
        },
        /**
         * @description This function return the altitude of the coordinate.
         */
        getAltitude: function() {
            return this.options.altitude;
        },
        /**
         * @description This function return the LatLon coordinate.
         */
        getLatLon: function() {
            return this.options.oLatLon;
        },
        /**
         * Returns the distance from this point to the supplied point, in km
         * (using Haversine formula)
         *
         * from: Haversine formula - R. W. Sinnott, "Virtues of the Haversine",
         *       Sky and Telescope, vol 68, no 2, 1984
         *
         * @param   {LatLon | emp.classLibrary.Coordinate} point Latitude/longitude of destination point
         * @param   {Number} [precision=4] no of significant digits to use for returned value
         * @returns {Number} Distance in km between this point and destination point
         */
        distanceTo: function (point, precision) {
            if (point instanceof emp.classLibrary.Coordinate) {
                return this.options.oLatLon.distanceTo(point.getLatLon(), precision);
            }
            return this.options.oLatLon.distanceTo(point, precision);
        },
        /**
         * Returns the (initial) bearing from this point to the supplied point, in degrees
         *   see http://williams.best.vwh.net/avform.htm#Crs
         *
         * @param {LatLon | emp.classLibrary.Coordinate} point Latitude/longitude of destination point
         * @returns {Number} Initial bearing in degrees from North
         */
        bearingTo: function (point) {
            if (point instanceof emp.classLibrary.Coordinate) {
                return this.options.oLatLon.bearingTo(point.getLatLon());
            }
            return this.options.oLatLon.bearingTo(point);
        },
        /**
         * Returns final bearing arriving at supplied destination point from this point; the final bearing
         * will differ from the initial bearing by varying degrees according to distance and latitude
         *
         * @param {LatLon | emp.classLibrary.Coordinate} point Latitude/longitude of destination point
         * @returns {Number} Final bearing in degrees from North
         */
        finalBearingTo: function (point) {
            if (point instanceof emp.classLibrary.Coordinate) {
                return this.options.oLatLon.finalBearingTo(point.getLatLon());
            }
            return this.options.oLatLon.finalBearingTo(point);
        },
        /**
         * Returns the midpoint between this point and the supplied point.
         *   see http://mathforum.org/library/drmath/view/51822.html for derivation
         *
         * @param   {LatLon | emp.classLibrary.Coordinate} point Latitude/longitude of destination point
         * @returns {emp.classLibrary.Coordinate} Midpoint between this point and the supplied point
         */
        midpointTo: function (point) {
            var latLon;
            
            if (point instanceof emp.classLibrary.Coordinate) {
                latLon = this.options.oLatLon.finalBearingTo(point.getLatLon());
            } else {
                latLon = this.options.oLatLon.finalBearingTo(point);
            }
            return new emp.classLibrary.Coordinate(latLon._lat, latLon._lon);
        },
        /**
         * Returns the destination point from this point having travelled the given distance (in km) on the
         * given initial bearing (bearing may vary before destination is reached)
         *
         *   see http://williams.best.vwh.net/avform.htm#LL
         *
         * @param   {Number} brng Initial bearing in degrees
         * @param   {Number} dist Distance in km
         * @returns {emp.classLibrary.Coordinate} Destination point
         */
        destinationPoint: function (brng, dist) {
            var latLon = this.options.oLatLon.destinationPoint(brng, dist);
            return new emp.classLibrary.Coordinate(latLon._lat, latLon._lon);
        },
        /**
         * Returns the distance from this point to the supplied point, in km, travelling along a rhumb line
         *
         *   see http://williams.best.vwh.net/avform.htm#Rhumb
         *
         * @param   {LatLon | emp.classLibrary.Coordinate} point Latitude/longitude of destination point
         * @returns {Number} Distance in km between this point and destination point
         */
        rhumbDistanceTo: function (point) {
            if (point instanceof emp.classLibrary.Coordinate) {
                return this.options.oLatLon.rhumbDistanceTo(point.getLatLon());
            }
            return this.options.oLatLon.rhumbDistanceTo(point);
        },
        /**
         * Returns the bearing from this point to the supplied point along a rhumb line, in degrees
         *
         * @param   {LatLon | emp.classLibrary.Coordinate} point Latitude/longitude of destination point
         * @returns {Number} Bearing in degrees from North
         */
        rhumbBearingTo: function (point) {
            if (point instanceof emp.classLibrary.Coordinate) {
                return this.options.oLatLon.rhumbBearingTo(point.getLatLon());
            }
            return this.options.oLatLon.rhumbBearingTo(point);
        },
        /**
         * Returns the destination point from this point having travelled the given distance (in km) on the
         * given bearing along a rhumb line
         *
         * @param   {Number} brng Bearing in degrees from North
         * @param   {Number} dist Distance in km
         * @returns {emp.classLibrary.Coordinate} Destination point
         */
        rhumbDestinationPoint: function (brng, dist) {
            var latLon = this.options.oLatLon.rhumbDestinationPoint(brng, dist);
            return new emp.classLibrary.Coordinate(latLon._lat, latLon._lon);
        },
        toString: function() {
            var sStr = "";
            
            if (isNaN(this.options.oLatLon._lat)) {
                sStr += "-";
            } else {
                sStr += this.options.oLatLon._lat;
            }
            sStr += ",";

            if (isNaN(this.options.oLatLon._lon)) {
                sStr += "-";
            } else {
                sStr += this.options.oLatLon._lon;
            }

            if (!isNaN(this.options.altitude)) {
                sStr += "," + this.options.altitude;
            }
        }
    };
    
    return publicInterface;
};

emp.classLibrary.Coordinate = emp.classLibrary.Class.extend(emp.classLibrary.privateClass());
