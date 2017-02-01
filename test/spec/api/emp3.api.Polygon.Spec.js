describe('emp3.api.Polygon', function () {
  it('extends emp3.api.Feature', function() {
    var polygon = new emp3.api.Polygon();
    polygon.should.be.an.instanceof(emp3.api.Feature);
  });

  describe('constructor', function () {
    it('handles no parameters', function() {
      var polygon = new emp3.api.Polygon();
      expect(polygon).to.exist;
      polygon.positions.should.eql([]);
    });

    it('handles null', function() {
      var polygon = new emp3.api.Polygon(null);
      polygon.should.exist;
      polygon.positions.should.eql([]);
    });

    it('handles undefined', function() {
      var polygon = new emp3.api.Polygon(undefined);
      polygon.should.exist;
      polygon.positions.should.eql([]);
    });

    it('handles arrays', function() {
      var polygon = new emp3.api.Polygon(['array', 'of', 'things]']);
      polygon.should.exist;
      polygon.positions.should.eql([]);
    });

    it('handles strings', function() {
      var polygon = new emp3.api.Polygon('polygon');
      polygon.should.exist;
      polygon.positions.should.eql([]);
    });

    it('handles numbers', function() {
      var polygon = new emp3.api.Polygon(99);
      polygon.should.exist;
      polygon.positions.should.eql([]);
    });

    it.skip('handles missing arguments', function() {
      var args = {
        positions: [
          {latitude: 0}
        ]
      };
      var polygon = new emp3.api.Polygon(args);
      polygon.should.exist;
      polygon.positions.should.eql([]);
    });

    it.skip('handles corrupt arguments', function() {
      var polygon;
      var args = {
        positions: [
          'string',
          {object:'value'}
        ]
      };
      polygon = new emp3.api.Polygon(args);
      polygon.should.exist;
      polygon.positions.should.eql([]);

      args = {
        positions: null
      };
      polygon = new emp3.api.Polygon(args);
      polygon.should.exist;
      polygon.positions.should.eql([]);

      args = {
        positions: undefined
      };
      polygon = new emp3.api.Polygon(args);
      polygon.should.exist;
      polygon.positions.should.eql([]);
    });

    it('handles valid parameters', function() {
      var args = {
        positions: [
          {latitude: -13.8, longitude: 17},
          {latitude: -23.8, longitude: 27},
          {latitude: -33.8, longitude: 37},
          {latitude: -43.8, longitude: 47},
          {latitude: -53.8, longitude: 57},
          {latitude: -63.8, longitude: 67}
        ]
      };
      var polygon = new emp3.api.Polygon(args);
      polygon.should.exist;
      polygon.positions.should.eql(args.positions);
    });
  });

  describe('featureType', function() {
    it('is GEO_POLYGON', function() {
      var polygon = new emp3.api.Polygon();
      polygon.featureType.should.equal(emp3.api.enums.FeatureTypeEnum.GEO_POLYGON);
    });
  });
});
