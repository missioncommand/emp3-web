describe('emp.storage.get', function() {
  var sandbox;
  beforeEach(function() {
    emp.storage.init();
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    emp.storage.init();
    sandbox.restore();
  });

  describe('methods defined under emp.storage.get', function() {
    describe('byIds', function() {
      it('returns a feature if given a valid feature ID and parent overlay ID by calling emp.storage.findFeature', function() {
        var findFeature = sandbox.spy(emp.storage, 'findFeature');
        var findOverlay = sandbox.spy(emp.storage, 'findOverlay');

        var coreId = '1234-5678-9ABC-DEF0';
        var obj = {
          id: coreId,
          getCoreId: function() {
            return coreId;
          }
        };

        emp.storage.storeObject(obj);

        var args = {
          featureId: coreId,
          overlayId: '0FED-CBA9-8765-4321'
        };

        var storeObj = emp.storage.get.byIds(args);

        findFeature.should.have.been.calledWith(args.overlayId, args.featureId);
        findOverlay.should.not.have.been.called;
        storeObj.should.eql(obj);

        emp.storage.deleteObject({getCoreId: function() { return coreId; }});
      });

      it('returns an overlay if given a valid overlay ID by calling emp.storage.findFeature', function() {
        var findFeature = sandbox.spy(emp.storage, 'findFeature');
        var findOverlay = sandbox.spy(emp.storage, 'findOverlay');

        var coreId = '1234-5678-9ABC-DEF0';
        var obj = {
          id: coreId,
          getCoreId: function() {
            return coreId;
          }
        };
        emp.storage.storeObject(obj);

        var args = {
          overlayId: coreId
        };

        var storeObj = emp.storage.get.byIds(args);

        findFeature.should.not.have.been.called;
        findOverlay.should.have.been.calledWith(args.overlayId);
        storeObj.should.eql(obj);
      });
    });
  });

  describe('methods defined under emp.storage', function() {
    describe('storeObject', function() {
      it ('adds a core emp object to the store', function() {
        var coreObj = new emp.classLibrary.EmpFeature({featureId: '1234-5678-9ABC-DEF0'});

        emp.storage.storeObject(coreObj);
        emp.storage._storage.store.should.contain.keys(coreObj.getCoreId());
      });
    });

    describe('findObject', function() {
      it('queries the store for an object by coreId', function() {
        var coreObj = new emp.classLibrary.EmpFeature({featureId: '5678-1234-9ABC-DEF0A'});

        emp.storage.storeObject(coreObj);
        emp.storage.findObject(coreObj.getCoreId()).should.eql(coreObj);
      });
    });

    describe('deleteObject', function() {
      it('removes a core object from the store', function() {
        var coreObj = new emp.classLibrary.EmpFeature({featureId: '9ABC-1234-5678-DEF0'});

        emp.storage.storeObject(coreObj);
        emp.storage._storage.store.should.contain.keys(coreObj.getCoreId());

        emp.storage.deleteObject(coreObj);
        emp.storage._storage.store.should.not.have.keys(coreObj.getCoreId());
      });
    });
  });
});
