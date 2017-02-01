describe('emp3.api.Point', function () {
  it('extends emp3.api.Feature', function() {
    var point = new emp3.api.Point();
    point.should.be.an.instanceof(emp3.api.Feature);
  });

  describe('constructor', function () {
    it('handles no parameters', function() {
      var point = new emp3.api.Point();
      point.position.latitude.should.equal(0);
      point.position.longitude.should.equal(0);
      point.position.altitude.should.equal(0);
    });

    it('handles null', function() {
      var point = new emp3.api.Point(null);
      point.position.latitude.should.equal(0);
      point.position.longitude.should.equal(0);
      point.position.altitude.should.equal(0);
    });

    it('handles undefined', function() {
      var point = new emp3.api.Point(undefined);
      point.position.latitude.should.equal(0);
      point.position.longitude.should.equal(0);
      point.position.altitude.should.equal(0);
    });

    it('handles arrays', function() {
      var point = new emp3.api.Point(['array', 'of', 'things']);
      point.position.latitude.should.equal(0);
      point.position.longitude.should.equal(0);
      point.position.altitude.should.equal(0);
    });

    it('handles strings', function() {
      var point = new emp3.api.Point('string');
      point.position.latitude.should.equal(0);
      point.position.longitude.should.equal(0);
      point.position.altitude.should.equal(0);
    });

    it('handles numbers', function() {
      var point = new emp3.api.Point(15);
      point.position.latitude.should.equal(0);
      point.position.longitude.should.equal(0);
      point.position.altitude.should.equal(0);
    });

    it('handles missing arguments', function() {
      var args = {position: {latitude: 5, longitude: 12}};
      var point = new emp3.api.Point(args);
      point.position.latitude.should.equal(args.position.latitude);
      point.position.longitude.should.equal(args.position.longitude);
      //point.position.altitude.should.equal(0);
    });

    it('handles corrupt arguments', function() {
      var args = {position: {latitude: '-17.1', longitude: 'cow'}};
      var point = new emp3.api.Point(args);
      point.position.latitude.should.equal(args.position.latitude);
      point.position.longitude.should.equal(0);
      point.position.altitude.should.equal(0);
    });

    it('handles valid parameters', function() {
      var args = {position: {latitude: -47.6, longitude: 18.0, altitude: 1200}};
      var point = new emp3.api.Point(args);
      point.position.latitude.should.equal(args.position.latitude);
      point.position.longitude.should.equal(args.position.longitude);
      point.position.altitude.should.equal(args.position.altitude);
    });
  });

  describe('featureType', function() {
    it('is GEO_POINT', function() {
      var point = new emp3.api.Point();
      point.featureType.should.equal(emp3.api.enums.FeatureTypeEnum.GEO_POINT);
    });
  });
});
