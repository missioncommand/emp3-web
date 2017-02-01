/* global L, leafLet, emp, cmapi */

leafLet.internalPrivateClass.GeoEllipseFeature = function () {
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
            var semiMajor = ((args.properties && args.properties.semiMajor) ? args.properties.semiMajor: undefined);
            var semiMinor = ((args.properties && args.properties.semiMinor) ? args.properties.semiMinor: undefined);
            var oProperties;

            if ((oLatLon === undefined) || (semiMajor === undefined) || (semiMinor === undefined)) {
                return undefined;
            }

            oProperties = this._getPolygonProperties(args);

            oLeafletFeature =  new leafLet.EllipseObject({
                leafletMap: this.getEngineInstanceInterface().leafletInstance,
                isSelected: this.isSelected(),
                selectAttributes: this.getEngineInstanceInterface().selectAttributes,
                oFeature: this,
                properties: this._getPolygonProperties(args),
                centerLatLng: oLatLon,
                semiMinor: semiMinor,
                semiMajor: semiMajor,
                azimuth: ((args.properties && args.properties.azimuth) ? args.properties.azimuth: 0)
            });

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

leafLet.typeLibrary.GeoEllipseFeature = leafLet.typeLibrary.Feature.extend(leafLet.internalPrivateClass.GeoEllipseFeature());
