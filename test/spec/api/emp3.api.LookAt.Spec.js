describe('emp3.api.LookAt', function() {
  var sandbox,
      engine = {
        "mapEngineId": 'leafletMapEngine',
        "engineBasePath": "/emp3/leaflet/"
      },
      containerId = "";

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('constructor', function() {
    it('throws an error for invalid arguments', function() {
      var invalidRange = function() {
        new emp3.api.LookAt({range: 'n/a'});
      };
      invalidRange.should.throw(/Invalid argument/i);

      var invalidAltitudeMode = function() {
        new emp3.api.LookAt({altitudeMode: 'none'});
      };
      invalidAltitudeMode.should.throw(/Invalid argument/i);

      var invalidTilt = function() {
        new emp3.api.LookAt({tilt: null});
      };
      invalidTilt.should.throw(/Invalid argument/i);

      var invalidHeading = function() {
        new emp3.api.LookAt({heading: 'north'});
      };
      invalidHeading.should.throw(/Invalid argument/i);

      var invalidLatitude = function() {
        new emp3.api.LookAt({latitude: '50 degrees'});
      };
      invalidLatitude.should.throw(/Invalid argument/i);

      var invalidLongitude = function() {
        new emp3.api.LookAt({longitude: '50 degrees'});
      };
      invalidLongitude.should.throw(/Invalid argument/i);

      var invalidAltitude = function() {
        new emp3.api.LookAt({altitude: '50 degrees'});
      };
      invalidAltitude.should.throw(/Invalid argument/i);

      var invalidLatitudeValue = function() {
        new emp3.api.LookAt({latitude: 91});
      };
      invalidLatitudeValue.should.throw();

      var invalidLongitudeValue = function() {
        new emp3.api.LookAt({longitude: -191});
      };
      invalidLongitudeValue.should.throw();

    });

    it('sets default values', function() {
      var lookAt = new emp3.api.LookAt();
      var baseGeoLookAt = new cmapi.IGeoLookAt();

      lookAt.tilt.should.equal(baseGeoLookAt.tilt);
      lookAt.heading.should.equal(baseGeoLookAt.heading);
      lookAt.range.should.equal(baseGeoLookAt.range);
      lookAt.altitudeMode.should.equal(cmapi.enums.altitudeMode.ABSOLUTE);
      lookAt.latitude.should.equal(baseGeoLookAt.latitude);
      lookAt.longitude.should.equal(baseGeoLookAt.longitude);
      lookAt.altitude.should.equal(baseGeoLookAt.altitude);
    });

    it('uses all valid parameters', function() {
      var args = {
        range: 9000,
        heading: 15,
        tilt: 61,
        altitudeMode: cmapi.enums.altitudeMode.ABSOLUTE,
        latitude: 5,
        longitude: -2,
        altitude: 500
      };
      var lookAt = new emp3.api.LookAt(args);

      lookAt.tilt.should.equal(args.tilt);
      lookAt.heading.should.equal(args.heading);
      lookAt.range.should.equal(args.range);
      lookAt.altitudeMode.should.equal(args.altitudeMode);
      lookAt.latitude.should.equal(args.latitude);
      lookAt.longitude.should.equal(args.longitude);
      lookAt.altitude.should.equal(args.altitude);
    });

    it('only accepts tilts between 0.0 and 180.0', function() {
      var tooLow = function() {
        new emp3.api.LookAt({tilt: -5});
      };
      tooLow.should.throw();

      var tooHigh = function() {
        new emp3.api.LookAt({tilt: 181});
      };
      tooHigh.should.throw();
    });
  });

  describe('copySettingsFrom', function() {
    it('copies all settings from a second LookAt object', function() {
      var primary = new emp3.api.LookAt({
        name: 'primary',
        latitude: 15,
        longitude: -23,
        altitude: 2300,
        tilt: 65.3,
        heading: 90,
        range: 10101
      });

      var copy = new emp3.api.LookAt();
      copy.copySettingsFrom(primary);

      copy.name.should.equal(primary.name);
      copy.latitude.should.equal(primary.latitude);
      copy.longitude.should.equal(primary.longitude);
      copy.altitude.should.equal(primary.altitude);
      copy.heading.should.equal(primary.heading);
      copy.range.should.equal(primary.range);
      copy.tilt.should.equal(primary.tilt);
    });
  });

  describe('apply', function() {
    it('sends an apply message to the MessageHandler for each map that has it set as the map\'s LookAt', function() {
      var map1 = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map1.geoId = '1234-5678-9ABC-DEF0';

      var map2 = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map2.geoId = '0FED-CBA9-8765-4321';

      var lookAt = new emp3.api.LookAt();

      map1.setLookAt({lookAt: lookAt});
      map2.setLookAt({lookAt: lookAt});

      lookAt.tilt = 15;
      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      sandbox.stub(emp3.api.MessageHandler.getInstance(), 'lookupMap')
        .withArgs(map1.geoId).returns(map1)
        .withArgs(map2.geoId).returns(map2);

      lookAt.apply();

      sendMessageStub.should.have.been.calledTwice;
    });

    it('validates the tilt angle before sending it to the MessageHandler', function() {
      var lookAt = new emp3.api.LookAt();
      lookAt.tilt = -1.32;
      var apply = function() {
        lookAt.apply();
      };

      apply.should.throw();
    });

    it('validates the lookAt coordinates', function() {
      var lookAt = new emp3.api.LookAt({
        latitude: 88.5,
        longitude: 0.1
      });

      var apply = function() {
        lookAt.apply();
      };

      lookAt.latitude = 91;
      apply.should.throw();
      lookAt.latitude = 88;

      lookAt.longitude = 191;
      apply.should.throw();
    });
  });
});
