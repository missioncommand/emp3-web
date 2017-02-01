describe('emp3.api.events.VisibilityEvent', function() {
  var featureEvent, overlayEvent, feature, overlay, parentOverlay, map;
  beforeEach(function() {
    map = new emp3.api.Map({
      container: "containerId",
      engine: {
        "mapEngineId": 'leafletMapEngine',
        "engineBasePath": "/emp3/leaflet/"          
      },
      environment: "browser"
    });
    feature = new emp3.api.MilStdSymbol();
    overlay = new emp3.api.Overlay();
    parentOverlay = new emp3.api.Overlay();

    featureEvent = new emp3.api.events.VisibilityEvent({
      event: emp3.api.enums.VisibilityStateEnum.VISIBLE,
      target: feature,
      parent: overlay,
      map: map
    });

    overlayEvent = new emp3.api.events.VisibilityEvent({
      event: emp3.api.enums.VisibilityStateEnum.VISIBLE_ANCESTOR_HIDDEN,
      target: overlay,
      parent: parentOverlay,
      map: map
    });
  });

  it('inherits from emp3.api.events.Event', function() {
    featureEvent.should.be.an.instanceof(emp3.api.events.Event);
  });

  describe('targetIsFeature', function() {
    it('returns true if the target is a feature', function() {
      featureEvent.targetIsFeature().should.be.true;
    });

    it('returns false if the target is not a feature', function() {
      overlayEvent.targetIsFeature().should.be.false;
    });
  });

  describe('targetIsOverlay', function() {
    it('returns true if the target is an overlay', function() {
      overlayEvent.targetIsOverlay().should.be.true;
    });

    it('returns false if the target is not a overlay', function() {
      featureEvent.targetIsOverlay().should.be.false;
    });
  });

  describe('getVisibilityState', function() {
    it('returns the new visibility state of the target', function() {
      featureEvent.event.should.equal(emp3.api.enums.VisibilityStateEnum.VISIBLE);
      overlayEvent.event.should.equal(emp3.api.enums.VisibilityStateEnum.VISIBLE_ANCESTOR_HIDDEN);
    });
  });

  describe('getMapEventOccurredOn', function() {
    it('returns the map the event occurred on', function() {
      featureEvent.map.should.equal(map);
      overlayEvent.map.should.equal(map);
    });
  });

  describe('getParent', function() {
    it('returns the container the target visibility was changed under', function() {
      featureEvent.parent.should.equal(overlay);
      //overlayEvent.getParent().should.equal(parentOverlay);
    });
  });
});
