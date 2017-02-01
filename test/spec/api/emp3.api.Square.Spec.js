describe('emp3.api.Square', function () {
  it('extends emp3.api.Feature', function() {
    var square = new emp3.api.Square();
    square.should.be.an.instanceof(emp3.api.Feature);
  });

  describe('constructor', function () {
    var defaultRect;
    var defaultPosition;

    beforeEach(function() {
      defaultRect = new cmapi.IGeoSquare();
      defaultPosition = new cmapi.IGeoPosition();
    });

    it('handles no parameters', function () {
      var square = new emp3.api.Square();
      square.width.should.equal(defaultRect.width);
      square.position.latitude.should.equal(defaultPosition.latitude);
      square.position.longitude.should.equal(defaultPosition.longitude);
      square.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles null', function() {
      var square = new emp3.api.Square(null);
      square.width.should.equal(defaultRect.width);
      square.position.latitude.should.equal(defaultPosition.latitude);
      square.position.longitude.should.equal(defaultPosition.longitude);
      square.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles undefined', function() {
      var square = new emp3.api.Square(undefined);
      square.width.should.equal(defaultRect.width);
      square.position.latitude.should.equal(defaultPosition.latitude);
      square.position.longitude.should.equal(defaultPosition.longitude);
      square.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles arrays', function() {
      var square = new emp3.api.Square(['arrays', 'of', 'things']);
      square.width.should.equal(defaultRect.width);
      square.position.latitude.should.equal(defaultPosition.latitude);
      square.position.longitude.should.equal(defaultPosition.longitude);
      square.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles strings', function() {
      var square = new emp3.api.Square('strings');
      square.width.should.equal(defaultRect.width);
      square.position.latitude.should.equal(defaultPosition.latitude);
      square.position.longitude.should.equal(defaultPosition.longitude);
      square.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles numbers', function() {
      var square = new emp3.api.Square(42);
      square.width.should.equal(defaultRect.width);
      square.position.latitude.should.equal(defaultPosition.latitude);
      square.position.longitude.should.equal(defaultPosition.longitude);
      square.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles missing arguments', function() {
      var args = {
        width: 17
      };
      var square = new emp3.api.Square(args);
      square.width.should.equal(args.width);
      square.position.latitude.should.equal(defaultPosition.latitude);
      square.position.longitude.should.equal(defaultPosition.longitude);
      square.position.altitude.should.equal(defaultPosition.altitude);

      args = {
        height: 750
      };
      square = new emp3.api.Square(args);
      square.width.should.equal(defaultRect.width);
      square.position.latitude.should.equal(defaultPosition.latitude);
      square.position.longitude.should.equal(defaultPosition.longitude);
      square.position.altitude.should.equal(defaultPosition.altitude);

      args = {
        position: {
          latitude: -32.7,
          longitude: -2
        }
      };
      square = new emp3.api.Square(args);
      square.width.should.equal(defaultRect.width);
      square.position.latitude.should.equal(args.position.latitude);
      square.position.longitude.should.equal(args.position.longitude);
      square.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles corrupt arguments', function () {
      var square;
      var args;

      args = {position: undefined};
      square = new emp3.api.Square(args);
      square.width.should.equal(defaultRect.width);
      square.position.latitude.should.equal(defaultPosition.latitude);
      square.position.longitude.should.equal(defaultPosition.longitude);
      square.position.altitude.should.equal(defaultPosition.altitude);

      args = {
        position: {
          latitude: '40',
          longitude: 'a'
        },
        width: 'n/a'
      };
      square = new emp3.api.Square(args);
      square.width.should.equal(defaultRect.width);
      square.position.latitude.should.equal(defaultPosition.latitude);
      square.position.longitude.should.equal(defaultPosition.longitude);
      square.position.altitude.should.equal(defaultPosition.altitude);

      args = {
        width: undefined
      };
      square = new emp3.api.Square(args);
      square.width.should.equal(defaultRect.width);
      square.position.latitude.should.equal(defaultPosition.latitude);
      square.position.longitude.should.equal(defaultPosition.longitude);
      square.position.altitude.should.equal(defaultPosition.altitude);

      args = {
        width: null
      };
      square = new emp3.api.Square(args);
      square.width.should.equal(defaultRect.width);
      square.position.latitude.should.equal(defaultPosition.latitude);
      square.position.longitude.should.equal(defaultPosition.longitude);
      square.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles valid parameters', function () {
      var square;
      var args;

      args = {
        width: 71
      };
      square = new emp3.api.Square(args);
      square.width.should.equal(args.width);
      square.position.latitude.should.equal(defaultPosition.latitude);
      square.position.longitude.should.equal(defaultPosition.longitude);
      square.position.altitude.should.equal(defaultPosition.altitude);

      args = {
        position: {
          latitude: 31,
          longitude: 42
        },
        width: 505
      };
      square = new emp3.api.Square(args);
      square.width.should.equal(args.width);
      square.position.latitude.should.equal(args.position.latitude);
      square.position.longitude.should.equal(args.position.longitude);
    });

    it('handles geoSquare');
  });

  describe('featureType', function() {
    it('is GEO_SQUARE', function() {
      var square = new emp3.api.Square();
      square.featureType.should.equal(emp3.api.enums.FeatureTypeEnum.GEO_SQUARE);
    });
  });
});
