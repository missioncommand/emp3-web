describe('emp3.api.Camera', function() {
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
    it('uses default values if no arguments are specified', function() {
      var camera = new emp3.api.Camera();
      var baseGeoCamera = new cmapi.IGeoCamera();

      camera.latitude.should.equal(baseGeoCamera.latitude);
      camera.longitude.should.equal(baseGeoCamera.longitude);
      camera.altitude.should.equal(baseGeoCamera.altitude);
      camera.altitudeMode.should.equal(cmapi.enums.altitudeMode.ABSOLUTE);
      camera.roll.should.equal(baseGeoCamera.roll);
      camera.tilt.should.equal(baseGeoCamera.tilt);
      camera.heading.should.equal(baseGeoCamera.heading);
    });

    it('properly uses given valid values', function() {
      var args = {
        latitude: -23.23,
        longitude: -8.1234,
        altitude: 5000,
        roll: 34,
        tilt: 23,
        heading: 88,
        altitudeMode: cmapi.enums.altitudeMode.ABSOLUTE
      };
      var camera = new emp3.api.Camera(args);
      camera.latitude.should.equal(args.latitude);
      camera.longitude.should.equal(args.longitude);
      camera.altitude.should.equal(args.altitude);
      camera.altitudeMode.should.equal(args.altitudeMode);
      camera.roll.should.equal(args.roll);
      camera.tilt.should.equal(args.tilt);
      camera.heading.should.equal(args.heading);
    });

    it('validates the position is a valid geographic coordinate', function() {
      var invalidCamera = function() {
        new emp3.api.Camera({
          latitude: 91,
          longitude: 0
        });
      };

      invalidCamera.should.throw();
    });
  });

  describe('apply', function() {
    it('sends a message to the message handler for each map using this camera', function() {
      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      var lookupMapStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'lookupMap');
      var camera = new emp3.api.Camera();

      var map1 = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map1.geoId = '1234-5678-9ABC-DEF0';
      var map2 = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map2.geoId = 'DEF0-1234-5678-9ABC';
      var map3 = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map3.geoId = '9ABC-DEF0-1234-5678';

      lookupMapStub.withArgs(map1.geoId).returns(map1);
      lookupMapStub.withArgs(map2.geoId).returns(map2);
      lookupMapStub.withArgs(map3.geoId).returns(map3);

      sandbox.stub(map1, 'getCamera').returns(camera);
      sandbox.stub(map2, 'getCamera').returns(camera);
      sandbox.stub(map3, 'getCamera').returns(camera);

      emp3.api.CameraManager.setCameraForMap({camera: camera, map: map1});
      emp3.api.CameraManager.setCameraForMap({camera: camera, map: map2});
      emp3.api.CameraManager.setCameraForMap({camera: camera, map: map3});

      camera.latitude = 5;
      camera.apply();
      sendMessageStub.should.have.been.called.threeTimes;
    });

    it('validates the new camera position', function() {
      var camera = new emp3.api.Camera({
        latitude: 90.0,
        longitude: 0
      });

      camera.latitude = 91.0;
      var apply = function() {
        camera.apply();
      };

      apply.should.throw();
    });
  });

  describe('copySettingsFrom', function() {
    it('copies all properties from another camera', function() {
      var primaryCamera = new emp3.api.Camera();
      var copyCamera = new emp3.api.Camera({
        latitude: 80,
        longitude: 70,
        tilt: 15
      });

      primaryCamera.copySettingsFrom(copyCamera);
      primaryCamera.name.should.equal(copyCamera.name);
      primaryCamera.latitude.should.equal(copyCamera.latitude);
      primaryCamera.longitude.should.equal(copyCamera.longitude);
      primaryCamera.altitude.should.equal(copyCamera.altitude);
      primaryCamera.tilt.should.equal(copyCamera.tilt);
      primaryCamera.roll.should.equal(copyCamera.roll);
      primaryCamera.heading.should.equal(copyCamera.heading);
    });

    it('throws an error if a camera is not set as the input', function() {
      var camera = new emp3.api.Camera();
      var copySettingsFrom = function() {
        camera.copySettingsFrom({latitude: 5});
      };

      copySettingsFrom.should.throw(/Invalid argument/i);
    });
  });
});
