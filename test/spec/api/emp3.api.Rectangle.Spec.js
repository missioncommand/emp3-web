describe('emp3.api.Rectangle', function () {
  it('extends emp3.api.Feature', function() {
    var rect = new emp3.api.Rectangle();
    rect.should.be.an.instanceof(emp3.api.Feature);
  });

  describe('constructor', function () {

    var defaultRect;
    var defaultPosition;
    beforeEach(function() {
      defaultRect = new cmapi.IGeoRectangle();
      defaultPosition = new cmapi.IGeoPosition();
    });

    it('handles no parameters', function () {
      var rectangle = new emp3.api.Rectangle();
      rectangle.width.should.equal(defaultRect.width);
      rectangle.height.should.equal(defaultRect.height);
      rectangle.position.latitude.should.equal(defaultPosition.latitude);
      rectangle.position.longitude.should.equal(defaultPosition.longitude);
      rectangle.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles null', function() {
      var rectangle = new emp3.api.Rectangle(null);
      rectangle.width.should.equal(defaultRect.width);
      rectangle.height.should.equal(defaultRect.height);
      rectangle.position.latitude.should.equal(defaultPosition.latitude);
      rectangle.position.longitude.should.equal(defaultPosition.longitude);
      rectangle.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles undefined', function() {
      var rectangle = new emp3.api.Rectangle(undefined);
      rectangle.width.should.equal(defaultRect.width);
      rectangle.height.should.equal(defaultRect.height);
      rectangle.position.latitude.should.equal(defaultPosition.latitude);
      rectangle.position.longitude.should.equal(defaultPosition.longitude);
      rectangle.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles arrays', function() {
      var rectangle = new emp3.api.Rectangle(['arrays', 'of', 'things']);
      rectangle.width.should.equal(defaultRect.width);
      rectangle.height.should.equal(defaultRect.height);
      rectangle.position.latitude.should.equal(defaultPosition.latitude);
      rectangle.position.longitude.should.equal(defaultPosition.longitude);
      rectangle.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles strings', function() {
      var rectangle = new emp3.api.Rectangle('strings');
      rectangle.width.should.equal(defaultRect.width);
      rectangle.height.should.equal(defaultRect.height);
      rectangle.position.latitude.should.equal(defaultPosition.latitude);
      rectangle.position.longitude.should.equal(defaultPosition.longitude);
      rectangle.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles numbers', function() {
      var rectangle = new emp3.api.Rectangle(42);
      rectangle.width.should.equal(defaultRect.width);
      rectangle.height.should.equal(defaultRect.height);
      rectangle.position.latitude.should.equal(defaultPosition.latitude);
      rectangle.position.longitude.should.equal(defaultPosition.longitude);
      rectangle.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles missing arguments', function() {
      var args = {
        width: 17
      };
      var rectangle = new emp3.api.Rectangle(args);
      rectangle.width.should.equal(args.width);
      rectangle.height.should.equal(defaultRect.height);
      rectangle.position.latitude.should.equal(defaultPosition.latitude);
      rectangle.position.longitude.should.equal(defaultPosition.longitude);
      rectangle.position.altitude.should.equal(defaultPosition.altitude);

      args = {
        height: 750
      };
      rectangle = new emp3.api.Rectangle(args);
      rectangle.width.should.equal(defaultRect.width);
      rectangle.height.should.equal(args.height);
      rectangle.position.latitude.should.equal(defaultPosition.latitude);
      rectangle.position.longitude.should.equal(defaultPosition.longitude);
      rectangle.position.altitude.should.equal(defaultPosition.altitude);

      args = {
        position: {
          latitude: -32.7,
          longitude: -2
        }
      };
      rectangle = new emp3.api.Rectangle(args);
      rectangle.width.should.equal(defaultRect.width);
      rectangle.height.should.equal(defaultRect.height);
      rectangle.position.latitude.should.equal(args.position.latitude);
      rectangle.position.longitude.should.equal(args.position.longitude);
      rectangle.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles corrupt arguments', function () {
      var rectangle;
      var args;

      args = {position: undefined};
      rectangle = new emp3.api.Rectangle(args);
      rectangle.width.should.equal(defaultRect.width);
      rectangle.height.should.equal(defaultRect.height);
      rectangle.position.latitude.should.equal(defaultPosition.latitude);
      rectangle.position.longitude.should.equal(defaultPosition.longitude);
      rectangle.position.altitude.should.equal(defaultPosition.altitude);

      args = {
        position: {
          latitude: '40',
          longitude: 'a'
        },
        height: '12',
        width: 'n/a'
      };
      rectangle = new emp3.api.Rectangle(args);
      rectangle.width.should.equal(defaultRect.width);
      rectangle.height.should.equal(defaultRect.height);
      rectangle.position.latitude.should.equal(defaultPosition.latitude);
      rectangle.position.longitude.should.equal(defaultPosition.longitude);
      rectangle.position.altitude.should.equal(defaultPosition.altitude);

      args = {
        height: null,
        width: undefined
      };
      rectangle = new emp3.api.Rectangle(args);
      rectangle.width.should.equal(defaultRect.width);
      rectangle.height.should.equal(defaultRect.height);
      rectangle.position.latitude.should.equal(defaultPosition.latitude);
      rectangle.position.longitude.should.equal(defaultPosition.longitude);
      rectangle.position.altitude.should.equal(defaultPosition.altitude);
    });

    it('handles valid parameters', function () {
      var rectangle;
      var args;

      args = {
        height: 316,
        width: 71
      };
      rectangle = new emp3.api.Rectangle(args);
      rectangle.width.should.equal(args.width);
      rectangle.height.should.equal(args.height);
      rectangle.position.latitude.should.equal(defaultPosition.latitude);
      rectangle.position.longitude.should.equal(defaultPosition.longitude);
      rectangle.position.altitude.should.equal(defaultPosition.altitude);

      args = {
        position: {
          latitude: 31,
          longitude: 42
        },
        width: 505,
        height: 400
      };
      rectangle = new emp3.api.Rectangle(args);
      rectangle.width.should.equal(args.width);
      rectangle.height.should.equal(args.height);
      rectangle.position.latitude.should.equal(args.position.latitude);
      rectangle.position.longitude.should.equal(args.position.longitude);
    });

    it('handles geoRectangle');
  });

  describe('featureType', function() {
    it('is GEO_RECTANGLE', function() {
      var rectangle = new emp3.api.Rectangle();
      rectangle.featureType.should.equal(emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE);
    });
  });
});
