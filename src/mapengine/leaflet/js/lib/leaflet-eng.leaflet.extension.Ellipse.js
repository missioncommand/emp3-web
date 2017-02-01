/* global L, leafLet, emp, armyc2 */

leafLet.internalPrivateClass.EllipseObject = function() {
    var publicInterface = {
        initialize: function (args) {
            var options = {
                oMap: args.leafletMap,
                semiMajor: args.semiMajor,
                semiMinor: args.semiMinor,
                azimuth: args.azimuth,
                centerLatLng: args.centerLatLng,
                isSelected: args.isSelected,
                selectAttributes: args.selectAttributes,
                oCoordList: [],
                properties: args.properties,
                oFeature: args.oFeature
            };

            L.Util.setOptions(this, options);

            this._generatePolygon();

            L.Polygon.prototype.initialize.call(this, this.options.oCoordList, this.options.properties);
        },
        isSelected: function() {
            return this.options.isSelected;
        },
        _generatePolygon: function() {
            var x, newX;
            var y, newY;
            var tempLatLng;
            var angle;
            var angleTan;
            var angleTan2;
            var xyPoint, newPoint;
            var oLatLngList = [];
            var q1PointList = [];
            var q2PointList = [];
            var q3PointList = [];
            var q4PointList = [];
            var coordList = this.options.oCoordList;
            var leafletMap = this.options.oMap;
            var centerPoint = leafletMap.latLngToLayerPoint(this.options.centerLatLng);
            var northCoord = this.options.centerLatLng.destinationPoint(0, this.options.semiMinor);
            var eastCoord = this.options.centerLatLng.destinationPoint(90, this.options.semiMajor);
            var northPoint = leafletMap.latLngToLayerPoint(northCoord);
            var eastPoint = leafletMap.latLngToLayerPoint(eastCoord);
            var semiMajorPx = centerPoint.distanceTo(eastPoint);
            var semiMinorPx = centerPoint.distanceTo(northPoint);
            var nPtePtDist = northPoint.distanceTo(eastPoint);
            var semiMajorPx2 = semiMajorPx * semiMajorPx;
            var semiMinorPx2 = semiMinorPx * semiMinorPx;
            var majorMinor = semiMajorPx * semiMinorPx;
            var azimuth = this.options.azimuth;
            var cosAzimuth = Math.cos(azimuth.toRad());
            var sinAzimuth = Math.sin(azimuth.toRad());
            var deltaRadian = (90.0 / nPtePtDist).toRad();
            var maxRadian = Math.PI / 2.0;

            x = semiMajorPx;
            y = 0;

            // Create 1st quadrant point and rotate it.
            xyPoint = new L.point(((x * cosAzimuth) - (y * sinAzimuth)), ((y * cosAzimuth) + (x * sinAzimuth)), true);
            newPoint = centerPoint.add(xyPoint);
            q1PointList.push(newPoint);

            // Create 4th quadrant point and rotate it.
            xyPoint = new L.point(((x * cosAzimuth * -1) - (y * sinAzimuth * -1)), ((y * cosAzimuth * -1) + (x * sinAzimuth * -1)), true);
            newPoint = centerPoint.add(xyPoint);
            q4PointList.push(newPoint);

            for (angle = deltaRadian; angle < maxRadian; angle += deltaRadian) {
                angleTan = Math.tan(angle);
                angleTan2 = angleTan * angleTan;
                x = majorMinor / (Math.sqrt(semiMinorPx2 + (semiMajorPx2 * angleTan2)));
                y = x * angleTan;
                // Create 1st quadrant point and rotate it.
                xyPoint = new L.point(((x * cosAzimuth) - (y * sinAzimuth)), ((y * cosAzimuth) + (x * sinAzimuth)), true);
                newPoint = centerPoint.add(xyPoint);
                q1PointList.push(newPoint);

                // Create 2nd quadrant point and rotate it.
                xyPoint = new L.point(((x * cosAzimuth * -1) - (y * sinAzimuth)), ((y * cosAzimuth) + (x * sinAzimuth * -1)), true);
                newPoint = centerPoint.add(xyPoint);
                q2PointList.push(newPoint);

                // Create 3rd quadrant point and rotate it.
                xyPoint = new L.point(((x * cosAzimuth) - (y * sinAzimuth * -1)), ((y * cosAzimuth * -1) + (x * sinAzimuth)), true);
                newPoint = centerPoint.add(xyPoint);
                q3PointList.push(newPoint);

                // Create 4th quadrant point and rotate it.
                xyPoint = new L.point(((x * cosAzimuth * -1) - (y * sinAzimuth * -1)), ((y * cosAzimuth * -1) + (x * sinAzimuth * -1)), true);
                newPoint = centerPoint.add(xyPoint);
                q4PointList.push(newPoint);
            }

            for (x = 0; x < q1PointList.length; x++) {
                tempLatLng = leafletMap.layerPointToLatLng(q1PointList[x]);
                if (tempLatLng) {
                    coordList.push(tempLatLng);
                }
            }

            for (x = q2PointList.length - 1; x >= 0; x--) {
                tempLatLng = leafletMap.layerPointToLatLng(q2PointList[x]);
                if (tempLatLng) {
                    coordList.push(tempLatLng);
                }
            }

            for (x = 0; x < q4PointList.length; x++) {
                tempLatLng = leafletMap.layerPointToLatLng(q4PointList[x]);
                if (tempLatLng) {
                    coordList.push(tempLatLng);
                }
            }

            for (x = q3PointList.length - 1; x >= 0; x--) {
                tempLatLng = leafletMap.layerPointToLatLng(q3PointList[x]);
                if (tempLatLng) {
                    coordList.push(tempLatLng);
                }
            }
        }
    };

    return publicInterface;
};

leafLet.EllipseObject = L.Polygon.extend(leafLet.internalPrivateClass.EllipseObject());
