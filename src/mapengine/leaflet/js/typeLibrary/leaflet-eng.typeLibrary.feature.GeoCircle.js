/* global L, leafLet, emp, cmapi */

leafLet.internalPrivateClass.GeoCircleFeature = function () {
    var publicInterface = {
        initialize: function (args) {
            var options = {
            };
            L.Util.setOptions(this, options);
            leafLet.typeLibrary.Feature.prototype.initialize.call(this, args);
        },
        _createFeature: function (args) {
            var oLeafletFeature = undefined;
            var oLatLon = leafLet.utils.geoJson.convertCoordinatesToLatLng(args.data)[0];
            var radius = ((args.properties && args.properties.radius) ? args.properties.radius: undefined);
            var oProperties;

            if ((oLatLon === undefined) || (radius === undefined)) {
                return undefined;
            }

            oProperties = this._getPolygonProperties(args);

            oLeafletFeature =  new L.circle(oLatLon, radius, oProperties);

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

leafLet.typeLibrary.GeoCircleFeature = leafLet.typeLibrary.Feature.extend(leafLet.internalPrivateClass.GeoCircleFeature());
