describe('cmapi2.visibility.get', function() {
  it('creates a visibilityGet payload', function() {

    var parent = new emp3.api.Overlay();
    var child = new emp3.api.Circle();

    var message = {
      cmd: emp3.api.enums.channel.getVisibility,
      parent: parent,
      target: child
    };

    var callInfo = {};

    var transactionId = emp3.api.createGUID();
    var visibilityGetPayload = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    visibilityGetPayload.channel.should.equal(emp3.api.enums.channel.getVisibility);
    visibilityGetPayload.payload.targetId.should.equal(child.geoId);
    visibilityGetPayload.payload.parentId.should.equal(parent.geoId);
  });
});
