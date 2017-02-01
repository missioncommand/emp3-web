describe('emp3.api.events.ContainerEvent', function () {
  var map, feature, overlay, engine, containerId;
  beforeEach(function () {
    feature = new emp3.api.MilStdSymbol();
    overlay = new emp3.api.Overlay();
    engine = {
      "mapEngineId": 'leafletMapEngine',
      "engineBasePath": "/emp3/leaflet/"
    };
    containerId = "containerId";
    map = new emp3.api.Map({
      engine: engine,
      container: containerId
    });
  });

  it('inherits from emp3.api.events.Event', function () {
    var event = new emp3.api.events.ContainerEvent({
      event: emp3.api.enums.ContainerEventEnum.OBJECT_ADDED,
      target: feature,
      affectedChildren: []
    });
    event.should.be.an.instanceof(emp3.api.events.Event);
  });

  describe('getAffectedChildren', function () {
    it('returns an array of children', function () {
      var event = new emp3.api.events.ContainerEvent({
        event: emp3.api.enums.ContainerEventEnum.OBJECT_ADDED,
        target: feature,
        affectedChildren: [new emp3.api.Feature()]
      });

      event.affectedChildren.should.be.an.instanceof(Array);
      event.affectedChildren.should.have.length(1);
    });
  });

  describe('targetIsFeature', function () {
    it('returns true if the event target is a feature', function () {
      var featureEvent = new emp3.api.events.ContainerEvent({
        event: emp3.api.enums.ContainerEventEnum.OBJECT_ADDED,
        target: feature,
        affectedChildren: []
      });
      featureEvent.targetIsFeature().should.be.true;
    });

    it('returns false if the event target is not a feature', function () {
      var overlayEvent = new emp3.api.events.ContainerEvent({
        event: emp3.api.enums.ContainerEventEnum.OBJECT_ADDED,
        target: overlay,
        affectedChildren: []
      });

      var mapEvent = new emp3.api.events.ContainerEvent({
        event: emp3.api.enums.ContainerEventEnum.OBJECT_ADDED,
        target: map,
        affectedChildren: []
      });

      overlayEvent.targetIsFeature().should.be.false;
      mapEvent.targetIsFeature().should.be.false;
    });
  });

  describe('targetIsMap', function () {
    it('returns true if the event target is a map', function () {
      var mapEvent = new emp3.api.events.ContainerEvent({
        event: emp3.api.enums.ContainerEventEnum.OBJECT_ADDED,
        target: map,
        affectedChildren: []
      });

      mapEvent.targetIsMap().should.be.true;
    });

    it('returns false if the event target is not a map', function () {
      var featureEvent = new emp3.api.events.ContainerEvent({
        event: emp3.api.enums.ContainerEventEnum.OBJECT_ADDED,
        target: feature,
        affectedChildren: []
      });

      var overlayEvent = new emp3.api.events.ContainerEvent({
        event: emp3.api.enums.ContainerEventEnum.OBJECT_ADDED,
        target: overlay,
        affectedChildren: []
      });

      featureEvent.targetIsMap().should.be.false;
      overlayEvent.targetIsMap().should.be.false;
    });
  });

  describe('targetIsOverlay', function () {
    it('returns true if the event target is an overlay', function () {
      var overlayEvent = new emp3.api.events.ContainerEvent({
        event: emp3.api.enums.ContainerEventEnum.OBJECT_ADDED,
        target: overlay,
        affectedChildren: []
      });

      overlayEvent.targetIsOverlay().should.be.true;
    });

    it('returns false if the event target is not an overlay', function () {
      var featureEvent = new emp3.api.events.ContainerEvent({
        event: emp3.api.enums.ContainerEventEnum.OBJECT_ADDED,
        target: feature,
        affectedChildren: []
      });
      var mapEvent = new emp3.api.events.ContainerEvent({
        event: emp3.api.enums.ContainerEventEnum.OBJECT_ADDED,
        target: map,
        affectedChildren: []
      });

      featureEvent.targetIsOverlay().should.be.false;
      mapEvent.targetIsOverlay().should.be.false;
    });
  });
});
