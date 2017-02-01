describe('emp3.api.events.FeatureEvent', function() {
  var event, feature;
  beforeEach(function() {
    feature = new emp3.api.Rectangle();
    event = new emp3.api.events.FeatureEvent({
      event: emp3.api.enums.FeatureEventEnum.FEATURE_SELECTED,
      target: feature
    });
  });

  it('inherits from emp3.api.events.Event', function() {
    event.should.be.an.instanceof(emp3.api.events.Event);
  });
});
