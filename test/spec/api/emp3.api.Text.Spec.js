describe('emp3.api.Text', function () {
  it('extends emp3.api.Feature', function() {
    var text = new emp3.api.Text();
    text.should.be.an.instanceof(emp3.api.Feature);
  });

  describe('constructor', function () {
    it('handles no parameters', function () {
      var text = new emp3.api.Text();
      text.position.latitude.should.equal(0);
      text.position.longitude.should.equal(0);
      text.position.altitude.should.equal(0);
    });

    it('handles invalid parameters', function () {
      var text;
      text = new emp3.api.Text(null);
      text.position.latitude.should.equal(0);
      text.position.longitude.should.equal(0);
      text.position.altitude.should.equal(0);

      text = new emp3.api.Text({invalid: 'param'});
      text.position.latitude.should.equal(0);
      text.position.longitude.should.equal(0);
      text.position.altitude.should.equal(0);

      text = new emp3.api.Text(['array', 'of', 'things']);
      text.position.latitude.should.equal(0);
      text.position.longitude.should.equal(0);
      text.position.altitude.should.equal(0);

      text = new emp3.api.Text(42);
      text.position.latitude.should.equal(0);
      text.position.longitude.should.equal(0);
      text.position.altitude.should.equal(0);
    });

    it('handles correct parameters', function () {
      var args = {
        name: 'EMP text primitive',
        position: {
          latitude: 56.3,
          longitude: -12,
          altitude: 500
        }
      };
      var text = new emp3.api.Text(args);
      text.name.should.equal(args.name);
      text.position.latitude.should.equal(args.position.latitude);
      text.position.longitude.should.equal(args.position.longitude);
      text.position.altitude.should.equal(args.position.altitude);
    });
  });

  describe('featureType', function() {
    it('is GEO_TEXT', function() {
      var text = new emp3.api.Text();
      text.featureType.should.equal(emp3.api.enums.FeatureTypeEnum.GEO_TEXT);
    });
  });
});
