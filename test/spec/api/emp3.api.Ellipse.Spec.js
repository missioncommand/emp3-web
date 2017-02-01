describe('emp3.api.Ellipse', function () {
  it('extends emp3.api.Feature', function() {
    var ellipse = new emp3.api.Ellipse();
    ellipse.should.be.an.instanceof(emp3.api.Feature);
  });

  describe('constructor', function () {
    var defaultEllipse;
    var defaultPosition;
    beforeEach(function() {
      defaultEllipse = new cmapi.IGeoEllipse();
      defaultPosition = new cmapi.IGeoPosition();
    });

    it('handles no parameters', function () {
      var ellipse = new emp3.api.Ellipse();
      ellipse.should.exist;
      ellipse.should.have.property('semiMajor', defaultEllipse.semiMajor);
      ellipse.should.have.property('semiMinor', defaultEllipse.semiMinor);
      expect(ellipse.position).to.have.property('latitude', defaultPosition.latitude);
      expect(ellipse.position).to.have.property('longitude', defaultPosition.longitude);
      expect(ellipse.position).to.have.property('altitude', defaultPosition.altitude);
    });

    it('handles null', function () {
      var ellipse = new emp3.api.Ellipse(null);
      ellipse.should.exist;
      ellipse.should.have.property('semiMajor', defaultEllipse.semiMajor);
      ellipse.should.have.property('semiMinor', defaultEllipse.semiMinor);
      expect(ellipse.position).to.have.property('latitude', defaultPosition.latitude);
      expect(ellipse.position).to.have.property('longitude', defaultPosition.longitude);
      expect(ellipse.position).to.have.property('altitude', defaultPosition.altitude);
    });

    it('handles undefined', function () {
      var ellipse = new emp3.api.Ellipse(undefined);
      ellipse.should.exist;
      ellipse.should.have.property('semiMajor', defaultEllipse.semiMajor);
      ellipse.should.have.property('semiMinor', defaultEllipse.semiMinor);
      expect(ellipse.position).to.have.property('latitude', defaultPosition.latitude);
      expect(ellipse.position).to.have.property('longitude', defaultPosition.longitude);
      expect(ellipse.position).to.have.property('altitude', defaultPosition.altitude);
    });

    it('handles arrays', function () {
      var ellipse = new emp3.api.Ellipse(['arrays', 'of', 'things']);
      ellipse.should.exist;
      ellipse.should.have.property('semiMajor', defaultEllipse.semiMajor);
      ellipse.should.have.property('semiMinor', defaultEllipse.semiMinor);
      expect(ellipse.position).to.have.property('latitude', defaultPosition.latitude);
      expect(ellipse.position).to.have.property('longitude', defaultPosition.longitude);
      expect(ellipse.position).to.have.property('altitude', defaultPosition.altitude);
    });

    it('handles strings', function () {
      var ellipse = new emp3.api.Ellipse('strings');
      ellipse.should.exist;
      ellipse.should.have.property('semiMajor', defaultEllipse.semiMajor);
      ellipse.should.have.property('semiMinor', defaultEllipse.semiMinor);
      expect(ellipse.position).to.have.property('latitude', defaultPosition.latitude);
      expect(ellipse.position).to.have.property('longitude', defaultPosition.longitude);
      expect(ellipse.position).to.have.property('altitude', defaultPosition.altitude);
    });

    it('handles numbers', function () {
      var ellipse = new emp3.api.Ellipse(42);
      ellipse.should.exist;
      ellipse.should.have.property('semiMajor', defaultEllipse.semiMajor);
      ellipse.should.have.property('semiMinor', defaultEllipse.semiMinor);
      expect(ellipse.position).to.have.property('latitude', defaultPosition.latitude);
      expect(ellipse.position).to.have.property('longitude', defaultPosition.longitude);
      expect(ellipse.position).to.have.property('altitude', defaultPosition.altitude);
    });

    it('handles missing arguments', function () {
      var args = {
        semiMajor: 1
      };
      var ellipse = new emp3.api.Ellipse(args);
      ellipse.should.exist;
      ellipse.should.have.property('semiMajor', args.semiMajor);
      ellipse.should.have.property('semiMinor', defaultEllipse.semiMinor);
      expect(ellipse.position).to.have.property('latitude', defaultPosition.latitude);
      expect(ellipse.position).to.have.property('longitude', defaultPosition.longitude);
      expect(ellipse.position).to.have.property('altitude', defaultPosition.altitude);

      args = {
        position: null
      };
      ellipse = new emp3.api.Ellipse({args: null});
      ellipse.should.exist;
      ellipse.should.have.property('semiMajor', defaultEllipse.semiMajor);
      ellipse.should.have.property('semiMinor', defaultEllipse.semiMinor);
      expect(ellipse.position).to.have.property('latitude', defaultPosition.latitude);
      expect(ellipse.position).to.have.property('longitude', defaultPosition.longitude);
      expect(ellipse.position).to.have.property('altitude', defaultPosition.altitude);

      args = {
        position: {latitude: 50.2, altitude: 89.3},
        semiMinor: 156
      };
      ellipse = new emp3.api.Ellipse(args);
      ellipse.should.have.property('semiMajor', defaultEllipse.semiMajor);
      ellipse.should.have.property('semiMinor', args.semiMinor);
      expect(ellipse.position).to.have.property('latitude', args.position.latitude);
      expect(ellipse.position).to.have.property('longitude', defaultPosition.longitude);
      expect(ellipse.position).to.have.property('altitude', args.position.altitude);
    });

    it('handles corrupt arguments', function () {
      var ellipse;
      var args;

      args = {position: undefined};
      ellipse = new emp3.api.Ellipse(args);
      ellipse.should.have.property('semiMajor', defaultEllipse.semiMajor);
      ellipse.should.have.property('semiMinor', defaultEllipse.semiMinor);
      expect(ellipse.position).to.have.property('latitude', defaultPosition.latitude);
      expect(ellipse.position).to.have.property('longitude', defaultPosition.longitude);
      expect(ellipse.position).to.have.property('altitude', defaultPosition.altitude);

      args = {
        semiMajor: '13',
        semiMinor: null
      };
      ellipse = new emp3.api.Ellipse(args);
      ellipse.should.have.property('semiMajor', defaultEllipse.semiMajor);
      ellipse.should.have.property('semiMinor', defaultEllipse.semiMinor);
      expect(ellipse.position).to.have.property('latitude', defaultPosition.latitude);
      expect(ellipse.position).to.have.property('longitude', defaultPosition.longitude);
      expect(ellipse.position).to.have.property('altitude', defaultPosition.altitude);

      args = {
        semiMajor: undefined,
        semiMinor: 'cow'
      };
      ellipse = new emp3.api.Ellipse(args);
      ellipse.should.have.property('semiMajor', defaultEllipse.semiMajor);
      ellipse.should.have.property('semiMinor', defaultEllipse.semiMinor);
      expect(ellipse.position).to.have.property('latitude', defaultPosition.latitude);
      expect(ellipse.position).to.have.property('longitude', defaultPosition.longitude);
      expect(ellipse.position).to.have.property('altitude', defaultPosition.altitude);


      args = {
        semiMajor: null,
        semiMinor: null
      };
      ellipse = new emp3.api.Ellipse(args);
      ellipse.should.have.property('semiMajor', defaultEllipse.semiMajor);
      ellipse.should.have.property('semiMinor', defaultEllipse.semiMinor);
      expect(ellipse.position).to.have.property('latitude', defaultPosition.latitude);
      expect(ellipse.position).to.have.property('longitude', defaultPosition.longitude);
      expect(ellipse.position).to.have.property('altitude', defaultPosition.altitude);
    });

    it('handles valid parameters', function () {
      var ellipse;
      var args;

      args = {
        position: {
          latitude: -71,
          longitude: 52.3
        },
        azimuth: 15.9,
        semiMajor: 87,
        semiMinor: 46.8
      };
      ellipse = new emp3.api.Ellipse(args);
      ellipse.should.exist;
      ellipse.should.have.property('semiMajor', args.semiMajor);
      ellipse.should.have.property('semiMinor', args.semiMinor);
      ellipse.should.have.property('azimuth', args.azimuth);
      expect(ellipse.position).to.have.property('latitude', args.position.latitude);
      expect(ellipse.position).to.have.property('longitude', args.position.longitude);
      expect(ellipse.position).to.have.property('altitude', args.position.altitude);
    });

    it('handles IGeoEllipse');
  });

  describe('featureType', function() {
    it('is GEO_ELLIPSE', function() {
      var ellipse = new emp3.api.Ellipse();
      ellipse.featureType.should.equal(emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE);
    });
  });
});
