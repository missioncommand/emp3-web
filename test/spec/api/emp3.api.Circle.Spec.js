describe('emp3.api.Circle', function () {
  it('extends emp3.api.Feature', function() {
    var circle = new emp3.api.Circle();
    circle.should.be.an.instanceof(emp3.api.Feature);
  });

  describe('constructor', function () {
    var defaultCircle;
    var defaultPosition;

    beforeEach(function() {
      defaultCircle = new cmapi.IGeoCircle();
      defaultPosition = new cmapi.IGeoPosition();
    });

    it ('only accepts valid coordinates', function() {
      var invalidCircle = function() {
        new emp3.api.circle({
          position: {
            latitude: 92.0,
            longitude: 0
          }});
      };

      invalidCircle.should.throw();
    });

    it('handles no parameters', function () {
      var circle = new emp3.api.Circle();
      circle.should.exist;
      expect(circle.radius).to.equal(defaultCircle.radius);
      expect(circle.position).to.have.property('latitude', defaultPosition.latitude);
      expect(circle.position).to.have.property('longitude', defaultPosition.longitude);
      expect(circle.position).to.have.property('altitude', defaultPosition.altitude);
    });

    it('handles null', function () {
      var circle = new emp3.api.Circle(null);
      circle.should.exist;
      expect(circle.radius).to.equal(defaultCircle.radius);
      expect(circle.position).to.have.property('latitude', defaultPosition.latitude);
      expect(circle.position).to.have.property('longitude', defaultPosition.longitude);
      expect(circle.position).to.have.property('altitude', defaultPosition.altitude);
    });

    it('handles undefined', function () {
      var circle = new emp3.api.Circle(undefined);
      circle.should.exist;
      expect(circle.radius).to.equal(defaultCircle.radius);
      expect(circle.position).to.have.property('latitude', defaultPosition.latitude);
      expect(circle.position).to.have.property('longitude', defaultPosition.longitude);
      expect(circle.position).to.have.property('altitude', defaultPosition.altitude);
    });

    it('handles arrays', function () {
      var circle = new emp3.api.Circle(['arrays', 'of', 'things']);
      circle.should.exist;
      expect(circle.radius).to.equal(defaultCircle.radius);
      expect(circle.radius).to.equal(defaultCircle.radius);
      expect(circle.position).to.have.property('latitude', defaultPosition.latitude);
      expect(circle.position).to.have.property('longitude', defaultPosition.longitude);
      expect(circle.position).to.have.property('altitude', defaultPosition.altitude);
    });

    it('handles strings', function () {
      var circle = new emp3.api.Circle('strings');
      circle.should.exist;
      expect(circle.radius).to.equal(defaultCircle.radius);
      expect(circle.position).to.have.property('latitude', defaultPosition.latitude);
      expect(circle.position).to.have.property('longitude', defaultPosition.longitude);
      expect(circle.position).to.have.property('altitude', defaultPosition.altitude);
    });

    it('handles numbers', function () {
      var circle = new emp3.api.Circle(42);
      circle.should.exist;
      expect(circle.radius).to.equal(defaultCircle.radius);
      expect(circle.position).to.have.property('latitude', defaultPosition.latitude);
      expect(circle.position).to.have.property('longitude', defaultPosition.longitude);
      expect(circle.position).to.have.property('altitude', defaultPosition.altitude);
    });

    it('handles missing arguments', function () {
      var args = {
        radius: 10
      };
      var circle = new emp3.api.Circle(args);
      circle.should.exist;
      expect(circle.radius).to.equal(args.radius);
      expect(circle.position).to.have.property('latitude', defaultPosition.latitude);
      expect(circle.position).to.have.property('longitude', defaultPosition.longitude);
      expect(circle.position).to.have.property('altitude', defaultPosition.altitude);

      args = {
        position: {
          latitude: 50
        },
        radius: 30
      };
      circle = new emp3.api.Circle(args);
      expect(circle.radius).to.equal(args.radius);
      expect(circle.position).to.have.property('latitude', args.position.latitude);
      expect(circle.position).to.have.property('longitude', defaultPosition.longitude);
      expect(circle.position).to.have.property('altitude', defaultPosition.altitude);
    });

    it('handles corrupt arguments', function () {
      var circle;
      var args;

      args = {position: undefined};
      circle = new emp3.api.Circle(args);
      expect(circle.radius).to.equal(defaultCircle.radius);
      circle.position.latitude.should.equal(defaultPosition.latitude);
      expect(circle.position).to.have.property('latitude', defaultPosition.latitude);
      expect(circle.position).to.have.property('longitude', defaultPosition.longitude);
      expect(circle.position).to.have.property('altitude', defaultPosition.altitude);

      circle = new emp3.api.Circle({position: null});

      console.log(JSON.stringify(circle));
      console.log(JSON.stringify(circle.position));
      expect(circle.radius).to.equal(defaultCircle.radius);
      expect(circle.position).to.have.property('latitude', defaultPosition.latitude);
      expect(circle.position).to.have.property('longitude', defaultPosition.longitude);
      expect(circle.position).to.have.property('altitude', defaultPosition.altitude);

      args = {
        position: {
          latitude: '40',
          lon: 'a'
        }
      };
      circle = new emp3.api.Circle(args);
      expect(circle.radius).to.equal(defaultCircle.radius);
      expect(circle.position).to.have.property('latitude', defaultPosition.latitude);
      expect(circle.position).to.have.property('longitude', defaultPosition.longitude);
      expect(circle.position).to.have.property('altitude', defaultPosition.altitude);

      args = {
        position: {
          latitude: 30,
          longitude: ''
        },
        radius: 25
      };
      circle = new emp3.api.Circle(args);
      expect(circle.radius).to.equal(args.radius);
      expect(circle.position).to.have.property('latitude', args.position.latitude);
      expect(circle.position).to.have.property('longitude', defaultPosition.longitude);
      expect(circle.position).to.have.property('altitude', defaultPosition.altitude);

      args = {
        position: {
          latitude: -15.3,
          longitude: 40,
          altitude: 'below sea level'
        },
        radius: '30'
      };
      circle = new emp3.api.Circle(args);
      expect(circle.radius).to.equal(defaultCircle.radius);
      expect(circle.position).to.have.property('latitude', args.position.latitude);
      expect(circle.position).to.have.property('longitude', args.position.longitude);
      expect(circle.position).to.have.property('altitude', defaultPosition.altitude);

      args = {
        position: {
          latitude: 310,
          longitude: -82.17
        },
        radius: null
      };
      circle = new emp3.api.Circle(args);
      expect(circle.radius).to.equal(defaultCircle.radius);
      expect(circle.position).to.have.property('latitude', args.position.latitude);
      expect(circle.position).to.have.property('longitude', args.position.longitude);
      expect(circle.position).to.have.property('altitude', defaultPosition.altitude);

      args = {
        radius: undefined
      };
      circle = new emp3.api.Circle(args);
      expect(circle.radius).to.equal(defaultCircle.radius);
      expect(circle.position).to.have.property('latitude', defaultPosition.latitude);
      expect(circle.position).to.have.property('longitude', defaultPosition.longitude);
      expect(circle.position).to.have.property('altitude', defaultPosition.altitude);
    });

    it('handles valid parameters', function () {
      var args = {
        position: {
          latitude: 30.1,
          longitude: 53.5,
          altitude: 0
        },
        radius: 510
      };

      var circle = new emp3.api.Circle(args);
      circle.should.exist;
      expect(circle.radius).to.equal(args.radius);
      expect(circle.position).to.have.property('latitude', args.position.latitude);
      expect(circle.position).to.have.property('longitude', args.position.longitude);
      expect(circle.position).to.have.property('altitude', args.position.altitude);

    });

    it('handles geoRectangle');
  });

  describe('featureType', function() {
    it('is GEO_CIRCLE', function() {
      var circle = new emp3.api.Circle();
      circle.featureType.should.equal(emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE);
    });
  });
});
