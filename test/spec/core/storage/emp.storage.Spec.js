describe('emp.storage', function() {
  var sandbox;
  beforeEach(function() {
    emp.storage.init();
    emp.storage._storage.store = {};
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    emp.storage.init();
    sandbox.restore();
  });

  describe('getRootGuid', function() {
    it('returns the root storage ID of a child storage instance', function() {
      var args = {
        mapInstanceId: '1234-5678-9ABC-DEF0'
      };

      emp.storage.newMapInstance(args);
      var rootGUID = emp.storage.getRootGuid(args.mapInstanceId);
      rootGUID.should.exist;
      rootGUID.should.equal(args.mapInstanceId);
    });

    it('returns undefined if instances does not contain the specified instance ID', function() {
      var args = {
        mapInstanceId: '1234-5678-9ABC-DEF0'
      };

      emp.storage.newMapInstance(args);
      var instance = '0FED-CBA9-8765-4321';
      var rootGUID = emp.storage.getRootGuid(instance);
      expect(rootGUID).to.be.undefined;
    });
  });

  describe('isRoot', function() {
    it('returns the rootGUID if the given instance is the root storage instance', function() {
      var args = {
        mapInstanceId: '1234-5678-9ABC-DEF0'
      };

      emp.storage.newMapInstance(args);
      emp.storage.isRoot(args.mapInstanceId).should.equal(args.mapInstanceId);
    });

    it('returns false if the given instance is not the root storage instance', function() {
      var args = {
        mapInstanceId: '1234-5678-9ABC-DEF0'
      };
      emp.storage.newMapInstance(args);
      emp.storage.isRoot('0FED-CBA9-8765-4321').should.be.false;
    });
  });

});
