describe('emp3.api.GeoPosition', function () {
  describe('constructor', function () {
    it('handles no parameters', function () {
      var geoPosition = new emp3.api.GeoPosition();
      geoPosition.should.exist;
    });

    it('handles null', function () {
      var geoPosition = new emp3.api.GeoPosition(null);
      geoPosition.should.exist;
    });

    it('handles undefined', function () {
      var geoPosition = new emp3.api.GeoPosition(undefined);
      geoPosition.should.exist;
    });

    it('handles arrays', function () {
      var geoPosition = new emp3.api.GeoPosition(['array', 'of', 'things']);
      geoPosition.should.exist;
    });

    it('handles strings', function () {
      var geoPosition = new emp3.api.GeoPosition('string');
      geoPosition.should.exist;
    });

    it('handles numbers', function () {
      var geoPosition = new emp3.api.GeoPosition(15);
      geoPosition.should.exist;
    });

    it('handles missing arguments', function () {
      var args = {};
      var geoPosition = new emp3.api.GeoPosition(args);
      geoPosition.should.exist;
      args = {
        latitude: 15
      };
      geoPosition = new emp3.api.GeoPosition(args);
      geoPosition.should.exist;
    });

    it('handles invalid arguments', function () {
      var invalidLat = function () {
        new emp3.api.GeoPosition({
          latitude: -91,
          longitude: 0
        });
      };

      invalidLat.should.throw();

      var invalidLon = function () {
        new emp3.api.GeoPosition({
          latitude: 0,
          longitude: 182
        });
      };

      invalidLon.should.throw();

    });

    it('handles valid parameters', function () {
      var args = {
        latitude: 57.8,
        longitude: -35.1234,
        altitude: 5000
      };
      var geoPosition = new emp3.api.GeoPosition(args);
      geoPosition.latitude.should.equal(args.latitude);
      geoPosition.longitude.should.equal(args.longitude);
      geoPosition.altitude.should.equal(args.altitude);
    });
  });
});
