describe('emp3.api.LookAtManager', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    emp3.api.LookAtManager.init();
  });

  afterEach(function() {
    sandbox.restore();
    emp3.api.LookAtManager.init();
  });

  describe('setLookAtForMap', function() {
    it('only accepts LookAt objects in the lookAt argument', function() {
      var args = {
        map: '1234-5678-9ABC-DEF0',
        lookAt: {}
      };

      var setLookAtForMap = function() {
        emp3.api.LookAtManager.setLookAtForMap(args);
      };
      setLookAtForMap.should.throw(/Invalid argument/i);
    });

    it('expects both map and lookAt arguments', function() {
      var setLookAtForMapWithNoArgs = function() {
        emp3.api.LookAtManager.setLookAtForMap();
      };
      setLookAtForMapWithNoArgs.should.throw();

      var setLookAtForMapWithOnlyMap = function() {
        emp3.api.LookAtManager.setLookAtForMap({map: '1234-5678-9ABC-DEF0'});
      };
      setLookAtForMapWithOnlyMap.should.throw();

      var setLookAtForMapWithOnlyLookAt = function() {
        emp3.api.LookAtManager.setLookAtForMap({lookAt: new emp3.api.LookAt()});
      };
      setLookAtForMapWithOnlyLookAt.should.throw();
    });

    it('stores a LookAt', function() {
      var args = {
        map: '1234-5678-9ABC-DEF0',
        lookAt: new emp3.api.LookAt()
      };

      var setLookAtForMap = function() {
        emp3.api.LookAtManager.setLookAtForMap(args);
      };
      setLookAtForMap.should.not.throw();
    });
  });

  describe('getLookAtForMap', function() {
    it ('returns the active LookAt associated with a map', function() {
      var mapId = '1234-5678-9ABC-DEF0';
      var lookAt = new emp3.api.LookAt();

      emp3.api.LookAtManager.setLookAtForMap({lookAt: lookAt, map: mapId});
      emp3.api.LookAtManager.getLookAtForMap({map: mapId}).should.eql(lookAt);
    });

    it ('should return the last LookAt set as the current LookAt', function() {
      var mapId = '1234-5678-9ABC-DEF0';
      var lookAt1 = new emp3.api.LookAt();
      var lookAt2 = new emp3.api.LookAt();

      emp3.api.LookAtManager.setLookAtForMap({lookAt: lookAt1, map: mapId});
      emp3.api.LookAtManager.setLookAtForMap({lookAt: lookAt2, map: mapId});

      emp3.api.LookAtManager.getLookAtForMap({map: mapId}).should.eql(lookAt2);
    });
  });

  describe('getMapsForLookAt', function() {
    it('can search by LookAt Id', function() {
      var getMapsForLookAt = function() {
        emp3.api.LookAtManager.getMapsForLookAt({lookAt: '1234-5678-9ABC-DEF0'});
      };
      getMapsForLookAt.should.not.throw();
    });

    it('can search by LookAt object', function() {
      var getMapsForLookAt = function() {
        emp3.api.LookAtManager.getMapsForLookAt({lookAt: new emp3.api.LookAt()});
      };
      getMapsForLookAt.should.not.throw();
    });

    it('should return an empty array if no map is found', function() {
      emp3.api.LookAtManager.getMapsForLookAt({lookAt: '1234-5678-9ABC-DEF0'}).should.have.length(0);
    });

    it('should return an array of map IDs for maps associated with the LookAt', function() {
      var lookAt = new emp3.api.LookAt();
      var map1 = '1234-5678-9ABC-DEF0';
      var map2 = 'DEF0-1234-5678-9ABC';
      var map3 = '9ABC-DEF0-1234-5678';
      emp3.api.LookAtManager.setLookAtForMap({lookAt: lookAt, map: map1});
      emp3.api.LookAtManager.setLookAtForMap({lookAt: lookAt, map: map2});
      emp3.api.LookAtManager.setLookAtForMap({lookAt: lookAt, map: map3});

      var maps = emp3.api.LookAtManager.getMapsForLookAt({lookAt: lookAt});
      maps.should.have.length(3);
      maps.should.include(map1);
      maps.should.include(map2);
      maps.should.include(map3);
    });
  });

  describe('removeLookAtForMap', function() {
    it('removes an associated LookAt from the hash', function() {
      var lookAt = new emp3.api.LookAt();
      var map1 = '1234-5678-9ABC-DEF0';
      var map2 = 'DEF0-1234-5678-9ABC';
      var map3 = '9ABC-DEF0-1234-5678';
      emp3.api.LookAtManager.setLookAtForMap({lookAt: lookAt, map: map1});
      emp3.api.LookAtManager.setLookAtForMap({lookAt: lookAt, map: map2});
      emp3.api.LookAtManager.setLookAtForMap({lookAt: lookAt, map: map3});

      var maps = emp3.api.LookAtManager.getMapsForLookAt({lookAt: lookAt});
      maps.should.have.length(3);
      maps.should.include(map1);
      maps.should.include(map2);
      maps.should.include(map3);

      emp3.api.LookAtManager.removeLookAtForMap({map: map1});
      maps = emp3.api.LookAtManager.getMapsForLookAt({lookAt: lookAt});
      maps.should.have.length(2);
      maps.should.include(map2);
      maps.should.include(map3);
    });
  });
});
