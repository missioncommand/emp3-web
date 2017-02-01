
/* global emp, Cesium, NaN, LatLon */

/**
 * @description This static method creates a Cesium Cartographic coordiante from
 * an emp LatLon coordinate.
 * @param {LatLon} oLatLon
 * @returns {Cesium.Cartographic}
 */
Cesium.Cartographic.fromEmpLatLon = function (oLatLon)
{
    return new Cesium.Cartographic(oLatLon._lon.toRad(), oLatLon._lat.toRad(), 0);
};

/**
 * @description This static method  returns a cartesian 
 * representation of the cartographic.
 * @param  none
 * @returns {Cesium.Cartesian}
 */
Cesium.Cartographic.prototype.toCartesian = function ()
{
    return Cesium.Ellipsoid.WGS84.cartographicToCartesian(this);
}; 

/**
 * @description This method converts the Cesium cartographic coordinate to an
 * emp LatLon coordinate object.
 * @returns {LatLon}
 */
Cesium.Cartographic.prototype.toEmpLatLon = function ()
{
    return new LatLon(this.latitude.toDeg(), this.longitude.toDeg());
};

/**
 * @description This method returns the bearing from this coordiante to oCoord.
 * @param {Cesium.Cartographic} oCoord
 * @returns {Number} The bearing to oCoord in degrees.
 */
Cesium.Cartographic.prototype.bearingTo = function (oCoord)
{
    var oThis = this.toEmpLatLon();
    var oThat = oCoord.toEmpLatLon();
    
    return oThis.bearingTo(oThat);
};


/**
 * @description This method returns the bearing from this coordiante to oCoord.
 * @param {Cesium.Cartographic} oCoord
 * @returns {Number} The bearing to oCoord in degrees.
 */
Cesium.Cartographic.prototype.getAzimuth = function (oCoord)
{
    var oThis = this.toEmpLatLon();
    var oThat = oCoord.toEmpLatLon();
    var azimuthDegrees = emp.geoLibrary.GetAzimuth({x: oThis._lon, y: oThis._lat}, {x: oThat._lon, y: oThat._lat});
    //var azimuthRadians = empCesium.Math.toRadians(azimuthDegrees);
    return azimuthDegrees;
};

/**
 * @description This method returns a Cesium Cartographic coordinate located at
 * a bearing of brng and a distance of dist from this coordinate.
 * @param {Number} brng A bearing from north in degrees.
 * @param {Number} dist A distance in meters.
 * @returns {Cesium.Cartographic} The coordiante of a point at the specified bearing and distance.
 */
Cesium.Cartographic.prototype.destinationPoint = function (brng, dist)
{
    var oThis = this.toEmpLatLon();
    var oDestination = oThis.destinationPoint(brng, dist / 1000);

    return Cesium.Cartographic.fromEmpLatLon(oDestination);
};

/**
 * @description This method returns a Cesium Cartographic coordinate located at
 * a bearing of brng and a distance of dist from this coordinate.
 * @param {Number} brng A bearing from north in degrees.
 * @param {Number} dist A distance in meters.
 * @returns {Cesium.Cartographic} The coordiante of a point at the specified bearing and distance.
 */
Cesium.Cartographic.prototype.midpointTo = function (cartographic)
{
    var oThis = this.toEmpLatLon();
    var oDestination =  cartographic.toEmpLatLon();
    var midPoint = oThis.midpointTo(oDestination);
    return Cesium.Cartographic.fromEmpLatLon(midPoint);
};

/**
 * @description This method moves this coordinate to a point at a specific bearing and distance.
 * @param {Number} brng A bearing from north in degrees.
 * @param {Number} dist A distance in meters.
 */
Cesium.Cartographic.prototype.moveCoordinate = function (brng, dist)
{
    var oThis = this.toEmpLatLon();
    var oDestination = oThis.destinationPoint(brng, dist / 1000);

    this.latitude = oDestination._lat.toRad();
    this.longitude = oDestination._lon.toRad();
};

/**
 * @description This method returns the distance betwwen this coordiante and OCoord.
 * @param {Cesium.Cartographic} oCoord A cartographic coordinate.
 * @returns {Number} The distance between the to coordinates in meters.
 */
Cesium.Cartographic.prototype.distanceTo = function (oCoord)
{ 
    if (this.equals(oCoord))
        {
            // the distanceTo freezes the browser if both coordinates are the same location.
           return 0; 
        }
         
    var oThis = this.toEmpLatLon();
    var oThat = oCoord.toEmpLatLon();

    return oThis.distanceTo(oThat); 
};

/**
 * @description This methos calculates the intersection coordiante of a line that
 * extends from this coordiante at a bearing of dBrng1 with a line originating at
 * oCoord2 extending at a bearing of dBrng2.
 * @param {type} dBrng1 The Bearing in dregrees.
 * @param {type} oCoord2 The cartographic coordinate of the second point
 * @param {type} dBrng2 The bearing of line 2.
 * @returns {Cesium.Cartographic| undefined} The coordinate at which the lines 
 * intersect or undefined if they do not intersect.
 */
Cesium.Cartographic.prototype.intersectLines = function (dBrng1, oCoord2, dBrng2)
{
    var oThis = this.toEmpLatLon();
    var oThat = oCoord2.toEmpLatLon();
    var oResult = undefined;

    try {
        oResult = LatLon.intersection(oThis, dBrng1, oThat, dBrng2);
    } catch (error) {
    }

    if (oResult)
    {
        return new Cesium.Cartographic(oResult._lon, oResult._lat);
    }
    
    return oResult;
};
