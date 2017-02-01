describe('emp.storage.searchEngine', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('execute', function() {
    it('returns an array', function() {
      var mapInstanceId = '1234-5678-9ABC-DEF0';
      var criteria = {};
      var query = new emp.storage.searchEngine(mapInstanceId, criteria);

      query.execute().should.be.an.array;
    });

    it('looks for overlays', function() {
      var mapInstanceId = '1234-5678-9ABC-DEF0';
      var overlayId = 'DEF0-1234-5678-9ABC';
      var criteria = {
        types: ['overlay'],
        filter: [{
          property: 'overlayId',
          term: overlayId
        }]
      };
      var findOverlayStub = sandbox.stub(emp.storage, 'findOverlay');
      var query = new emp.storage.searchEngine(mapInstanceId, criteria);

      query.execute();
      findOverlayStub.should.have.been.calledWith(overlayId);
    });

    it('looks for features', function() {
      var mapInstanceId = '1234-5678-9ABC-DEF0';
      var featureId = 'DEF0-1234-5678-9ABC';
      var criteria = {
        types: ['feature'],
        filter: [{
          property: 'featureId',
          term: featureId
        }]
      };
      var findFeatureStub = sandbox.stub(emp.storage, 'findFeature');
      var query = new emp.storage.searchEngine(mapInstanceId, criteria);

      query.execute();
      findFeatureStub.should.have.been.calledWith(undefined, featureId);
    });

    it('searches for parents objects when a childId property is specified', function() {
      var mapInstanceId = '1234-5678-9ABC-DEF0';
      var featureId = 'DEF0-1234-5678-9ABC';
      var criteria = {
        types: ['overlay', 'feature'],
        filter: [{
          property: 'childId',
          term: featureId
        }]
      };

      sandbox.stub(emp.storage.get, 'id')
        .withArgs({id: featureId}).returns({
          options: {
            coreId: featureId,
            getCoreId: function() { return featureId; },
            parentObjects: {
              options: {
                coreId: 'parentId'
              }
            }
          }
        })
        .withArgs({id: 'parentId'}).returns({
          options: {
            coreId: 'parentId'
          }
        });

      var query = new emp.storage.searchEngine(mapInstanceId, criteria);

      var results = query.execute();
      results.should.have.length(1);
    });
  });
});
