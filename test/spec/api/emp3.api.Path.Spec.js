describe('emp3.api.Path', function () {
  it('extends emp3.api.Feature', function() {
    var path = new emp3.api.Path();
    path.should.be.an.instanceof(emp3.api.Feature);
  });

  describe('constructor', function () {
    it('handles no parameters', function () {
      var path = new emp3.api.Path();
      path.positions.should.eql([]);
    });

    it('handles null', function () {
      var path = new emp3.api.Path(null);
      path.positions.should.eql([]);
    });

    it('handles undefined', function () {
      var path = new emp3.api.Path(undefined);
      path.positions.should.eql([]);
    });

    it('handles arrays', function () {
      var path = new emp3.api.Path(['arrays', 'of', 'things']);
      path.positions.should.eql([]);
    });

    it('handles strings', function () {
      var path = new emp3.api.Path('strings');
      path.positions.should.eql([]);
    });

    it('handles numbers', function () {
      var path = new emp3.api.Path(42);
      path.positions.should.eql([]);
    });

    it.skip('handles missing arguments', function () {
      var args;
      var path;

      args = {
        positions: [
          {longitude: -3},
          {latitude: 40, longitude: -3}
        ]
      };
      path = new emp3.api.Path(args);
      path.positions.should.eql([]);
    });

    it('handles corrupt arguments', function () {
      var path;
      var args;

      args = {center: undefined};
      path = new emp3.api.Path(args);
      path.positions.should.eql([]);

      args = {
        positions: [
          {latitude: 40, longitude: 'a'},
          {latitude: '40', longitude: '15'}
        ]
      };
      path = new emp3.api.Path(args);
      path.positions.should.eql([]);
    });

    it('handles valid parameters', function () {
      var args = {
        positions: [
          {latitude: 5, longitude: -10.3},
          {latitude: 4, longitude: -10.3},
          {latitude: 6, longitude: 5.8},
          {latitude: 8, longitude: -0.3},
          {latitude: 6, longitude: 10.3},
          {latitude: 1, longitude: 8.3}
        ]
      };
      var path = new emp3.api.Path(args);
      path.should.exist;
      path.positions.length.should.equal(args.positions.length);
      path.positions.should.eql(args.positions);
    });

    it('handles IGeoPositionGroup');
  });

  describe('apply', function () {
    it('works', function() {
      var args = {
        positions: [
          {latitude: 40, longitude: 40},
          {latitude: 41, longitude: 41},
          {latitude: 40, longitude: 42}
        ],
        id: 'path1',
        name: 'path1'
      };

      var path = new emp3.api.Path(args);

      path.name = "path3";
      path.positions = [
        {latitude: 40, longitude: 40},
        {latitude: 41, longitude: 41},
        {latitude: 40, longitude: 43}
      ];

      expect(function() {
        path.apply();
      }).to.not.throw();
    });
  });

  describe('featureType', function() {
    it('is GEO_PATH', function() {
      var path = new emp3.api.Path();
      path.featureType.should.equal(emp3.api.enums.FeatureTypeEnum.GEO_PATH);
    });
  });
});
