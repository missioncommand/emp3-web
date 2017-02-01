/* global L, leafLet, emp, cmapi */

leafLet.internalPrivateClass.GeoRectangleFeature = function () {
    var publicInterface = {
        initialize: function (args) {
            var options = {
            };
            L.Util.setOptions(this, options);
            leafLet.typeLibrary.Feature.prototype.initialize.call(this, args);
        },
        _createFeature: function (args) {
            var oLeafletFeature = undefined;
            var distance;
            var newLatLng;
            var oLatLon = leafLet.utils.geoJson.convertCoordinatesToLatLng(args.data)[0];
            var oLatLngList = [];
            var angleOffset;
            var azimuth = ((args.properties && args.properties.azimuth) ? args.properties.azimuth: 0);
            var height = ((args.properties && args.properties.height) ? args.properties.height / 2: undefined);
            var width = ((args.properties && args.properties.width) ? args.properties.width / 2: undefined);
            var oProperties;

            if ((oLatLon === undefined) || (height === undefined) || (width === undefined)) {
                return undefined;
            }

            oProperties = this._getPolygonProperties(args);

            distance = Math.sqrt((height * height) + (width * width));
            // The width and height are reversed to get the angle from the vertical axis.
            angleOffset = Math.atan2(width, height).toDeg();

            newLatLng = oLatLon.destinationPoint(azimuth + angleOffset, distance);
            oLatLngList.push(newLatLng);

            newLatLng = oLatLon.destinationPoint(azimuth + 180.0 - angleOffset, distance);
            oLatLngList.push(newLatLng);

            newLatLng = oLatLon.destinationPoint(azimuth + 180.0 + angleOffset, distance);
            oLatLngList.push(newLatLng);

            newLatLng = oLatLon.destinationPoint(azimuth + 360.0 - angleOffset, distance);
            oLatLngList.push(newLatLng);

            oLeafletFeature =  new L.polygon(oLatLngList, oProperties);

            return oLeafletFeature;
        },
        _updateFeature: function (oArgs) {
            return this._createFeature(oArgs);
        },
        render: function () {
            this.updateFeature(this.options);
        },
        setFeatureStyleProperties: function (sType, oProperties) {
        }
    };
    return publicInterface;
};

leafLet.typeLibrary.GeoRectangleFeature = leafLet.typeLibrary.Feature.extend(leafLet.internalPrivateClass.GeoRectangleFeature());
