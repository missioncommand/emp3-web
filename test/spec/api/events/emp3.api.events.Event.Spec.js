describe('emp3.api.events.Event', function() {
  describe('constructor', function() {
    it('constructs a container with event and target properties', function() {
      var event = new emp3.api.events.Event({
        event: emp3.api.enums.FeatureEventEnum.FEATURE_DESELECTED,
        target: new emp3.api.Feature()
      });

      event.should.have.property('event');
      event.should.have.property('target');
    });
  });
});