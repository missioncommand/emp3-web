describe('emp3.api.CameraManager', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    emp3.api.CameraManager.init();
  });

  afterEach(function() {
    sandbox.restore();
    emp3.api.CameraManager.init();
  });

  describe('setCameraForMap', function() {
    it('only accepts camera objects in the camera argument', function() {
      var args = {
        map: '1234-5678-9ABC-DEF0',
        camera: {}
      };

      var setCameraForMap = function() {
        emp3.api.CameraManager.setCameraForMap(args);
      };
      setCameraForMap.should.throw(/Invalid argument/);
    });

    it('expects both map and camera arguments', function() {
      var setCameraForMapWithNoArgs = function() {
        emp3.api.CameraManager.setCameraForMap();
      };
      setCameraForMapWithNoArgs.should.throw();

      var setCameraForMapWithOnlyMap = function() {
        emp3.api.CameraManager.setCameraForMap({map: '1234-5678-9ABC-DEF0'});
      };
      setCameraForMapWithOnlyMap.should.throw();

      var setCameraForMapWithOnlyCamera = function() {
        emp3.api.CameraManager.setCameraForMap({camera: new emp3.api.Camera()});
      };
      setCameraForMapWithOnlyCamera.should.throw();
    });

    it('stores a camera', function() {
      var args = {
        map: '1234-5678-9ABC-DEF0',
        camera: new emp3.api.Camera()
      };

      var setCameraForMap = function() {
        emp3.api.CameraManager.setCameraForMap(args);
      };
      setCameraForMap.should.not.throw();
    });
  });

  describe('getCameraForMap', function() {
    it ('returns the active camera associated with a map', function() {
      var mapId = '1234-5678-9ABC-DEF0';
      var camera = new emp3.api.Camera();

      emp3.api.CameraManager.setCameraForMap({camera: camera, map: mapId});
      emp3.api.CameraManager.getCameraForMap({map: mapId}).should.eql(camera);
    });

    it ('should return the last camera set as the current camera', function() {
      var mapId = '1234-5678-9ABC-DEF0';
      var camera1 = new emp3.api.Camera();
      var camera2 = new emp3.api.Camera();

      emp3.api.CameraManager.setCameraForMap({camera: camera1, map: mapId});
      emp3.api.CameraManager.setCameraForMap({camera: camera2, map: mapId});

      emp3.api.CameraManager.getCameraForMap({map: mapId}).should.eql(camera2);
    });
  });

  describe('getMapsForCamera', function() {
    it('can search by camera Id', function() {
      var getMapsForCamera = function() {
        emp3.api.CameraManager.getMapsForCamera({camera: '1234-5678-9ABC-DEF0'});
      };
      getMapsForCamera.should.not.throw();
    });

    it('can search by camera object', function() {
      var getMapsForCamera = function() {
        emp3.api.CameraManager.getMapsForCamera({camera: new emp3.api.Camera()});
      };
      getMapsForCamera.should.not.throw();
    });

    it('should return an empty array if no map is found', function() {
      emp3.api.CameraManager.getMapsForCamera({camera: '1234-5678-9ABC-DEF0'}).should.have.length(0);
    });

    it('should return an array of map IDs for maps associated with the camera', function() {
      var camera = new emp3.api.Camera();
      var map1 = '1234-5678-9ABC-DEF0';
      var map2 = 'DEF0-1234-5678-9ABC';
      var map3 = '9ABC-DEF0-1234-5678';
      emp3.api.CameraManager.setCameraForMap({camera: camera, map: map1});
      emp3.api.CameraManager.setCameraForMap({camera: camera, map: map2});
      emp3.api.CameraManager.setCameraForMap({camera: camera, map: map3});

      var maps = emp3.api.CameraManager.getMapsForCamera({camera: camera});
      maps.should.have.length(3);
      maps.should.include(map1);
      maps.should.include(map2);
      maps.should.include(map3);
    });
  });

  describe('removeCameraForMap', function() {
    it('removes an associated camera from the hash', function() {
      var camera = new emp3.api.Camera();
      var map1 = '1234-5678-9ABC-DEF0';
      var map2 = 'DEF0-1234-5678-9ABC';
      var map3 = '9ABC-DEF0-1234-5678';
      emp3.api.CameraManager.setCameraForMap({camera: camera, map: map1});
      emp3.api.CameraManager.setCameraForMap({camera: camera, map: map2});
      emp3.api.CameraManager.setCameraForMap({camera: camera, map: map3});

      var maps = emp3.api.CameraManager.getMapsForCamera({camera: camera});
      maps.should.have.length(3);
      maps.should.include(map1);
      maps.should.include(map2);
      maps.should.include(map3);

      emp3.api.CameraManager.removeCameraForMap({map: map1});
      maps = emp3.api.CameraManager.getMapsForCamera({camera: camera});
      maps.should.have.length(2);
      maps.should.include(map2);
      maps.should.include(map3);
    });
  });
});
