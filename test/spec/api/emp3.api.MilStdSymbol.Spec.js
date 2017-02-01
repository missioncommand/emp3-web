describe('emp3.api.MilStdSymbol', function () {
  it('extends emp3.api.Feature', function() {
    var symbol = new emp3.api.MilStdSymbol();
    symbol.should.be.an.instanceof(emp3.api.Feature);
  });

  describe('constructor', function () {
    it('handles no parameters', function() {
      var point = new emp3.api.MilStdSymbol();
      point.position.latitude.should.equal(0);
      point.position.longitude.should.equal(0);
      point.position.altitude.should.equal(0);
    });

    it('handles null', function() {
      var point = new emp3.api.MilStdSymbol(null);
      point.position.latitude.should.equal(0);
      point.position.longitude.should.equal(0);
      point.position.altitude.should.equal(0);
    });

    it('handles undefined', function() {
      var point = new emp3.api.MilStdSymbol(undefined);
      point.position.latitude.should.equal(0);
      point.position.longitude.should.equal(0);
      point.position.altitude.should.equal(0);
    });

    it('handles arrays', function() {
      var point = new emp3.api.MilStdSymbol(['array', 'of', 'things']);
      point.position.latitude.should.equal(0);
      point.position.longitude.should.equal(0);
      point.position.altitude.should.equal(0);
    });

    it('handles strings', function() {
      var point = new emp3.api.MilStdSymbol('string');
      point.position.latitude.should.equal(0);
      point.position.longitude.should.equal(0);
      point.position.altitude.should.equal(0);
    });

    it('handles numbers', function() {
      var point = new emp3.api.MilStdSymbol(15);
      point.position.latitude.should.equal(0);
      point.position.longitude.should.equal(0);
      point.position.altitude.should.equal(0);
    });

    it('handles missing arguments', function() {
      var args = {position: {latitude: 5, longitude: 12}};
      var point = new emp3.api.MilStdSymbol(args);
      point.position.latitude.should.equal(args.position.latitude);
      point.position.longitude.should.equal(args.position.longitude);
      //point.position.altitude.should.equal(0);
    });

    it.skip('handles corrupt arguments for single point features', function() {
      var args = {position: {latitude: -17.1, longitude: 'cow'}};
      var point = new emp3.api.MilStdSymbol(args);
      point.position.latitude.should.equal(args.position.latitude);
      point.position.longitude.should.equal(0);
      point.position.altitude.should.equal(0);
    });

    it.skip('handles corrupt arguments for multi-point features', function() {
      var args = {position: {latitude: -17.1, longitude: 'cow'}};
      var point = new emp3.api.MilStdSymbol(args);
      point.position.latitude.should.equal(args.position.latitude);
      point.position.longitude.should.equal(0);
      point.position.altitude.should.equal(0);
    });

    it.skip('handles valid parameters for single point features', function() {
      var args = {symbolCode: '', position: {latitude: -47.6, longitude: 18.0, altitude: 1200}};
      var point = new emp3.api.MilStdSymbol(args);
      point.position.latitude.should.equal(args.position.latitude);
      point.position.longitude.should.equal(args.position.longitude);
      point.position.altitude.should.equal(args.position.altitude);
    });

    it.skip('handles valid parameters for multi-point features', function() {
      var args = {symbolCode: '', position: {latitude: -47.6, longitude: 18.0, altitude: 1200}};
      var point = new emp3.api.MilStdSymbol(args);
      point.position.latitude.should.equal(args.position.latitude);
      point.position.longitude.should.equal(args.position.longitude);
      point.position.altitude.should.equal(args.position.altitude);
    });
  });

  describe('featureType', function() {
    it('is GEO_MIL_SYMBOL', function() {
      var symbol = new emp3.api.MilStdSymbol();
      symbol.featureType.should.equal(emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL);
    });
  });
});
