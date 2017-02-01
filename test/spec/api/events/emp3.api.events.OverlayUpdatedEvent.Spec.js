describe('emp3.api.events.OverlayChangedEvent', function() {
  var event, overlay;
  beforeEach(function() {
    overlay = new emp3.api.Overlay();
    event = new emp3.api.events.OverlayUpdatedEvent({
      target: overlay
    });
  });

  it('inherits from emp3.api.events.Event', function() {
    event.should.be.an.instanceof(emp3.api.events.Event);
  });

  describe('getOverlay', function() {
    it('returns the overlay the event occurred on', function() {
      event.target.should.eql(overlay);
    });
  });
});