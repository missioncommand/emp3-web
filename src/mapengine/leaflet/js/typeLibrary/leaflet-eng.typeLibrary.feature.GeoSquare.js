/* global L, leafLet, emp, cmapi */

leafLet.internalPrivateClass.GeoSquareFeature = function () {
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
            var width = ((args.properties && args.properties.width) ? args.properties.width / 2: undefined);
            var oProperties;

            if ((oLatLon === undefined) || (width === undefined)) {
                return undefined;
            }

            oProperties = this._getPolygonProperties(args);

            distance = Math.sqrt(2 * (width * width));

            angleOffset = 45;

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

leafLet.typeLibrary.GeoSquareFeature = leafLet.typeLibrary.Feature.extend(leafLet.internalPrivateClass.GeoSquareFeature());
