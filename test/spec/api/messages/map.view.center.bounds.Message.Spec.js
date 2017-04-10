describe('map.view.center.bounds', function() {
  it('creates a payload to center the view based on a bounds object with a range', function() {
    var message = {
      cmd: emp3.api.enums.channel.centerOnBounds,
      north: 55,
      south: 35,
      east: 35,
      west: 55,
      range: 50000,
      animate: true
    };

    var callInfo = {};

    var transactionId = emp3.api.createGUID();
    var centerOnBounds = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    centerOnBounds.channel.should.equal(emp3.api.enums.channel.centerOnBounds);
    centerOnBounds.payload.should.have.property('bounds');
    centerOnBounds.payload.bounds.should.have.deep.property('northEast.lat', 55);
    centerOnBounds.payload.bounds.should.have.deep.property('southWest.lat', 35);
    centerOnBounds.payload.bounds.should.have.deep.property('northEast.lon', 35);
    centerOnBounds.payload.bounds.should.have.deep.property('southWest.lon', 55);
    centerOnBounds.payload.should.have.property('animate', message.animate);
    centerOnBounds.payload.should.have.property('zoom', message.range);
  });

  it('creates a payload to center the view based on a bounds object without a range', function() {
    var message = {
      cmd: emp3.api.enums.channel.centerOnBounds,
      north: 55,
      south: 35,
      east: 35,
      west: 55,
      animate: false
    };

    var callInfo = {};

    var transactionId = emp3.api.createGUID();
    var centerOnBounds = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

    centerOnBounds.channel.should.equal(emp3.api.enums.channel.centerOnBounds);
    centerOnBounds.payload.should.have.property('bounds');
    centerOnBounds.payload.bounds.should.have.deep.property('northEast.lat', 55);
    centerOnBounds.payload.bounds.should.have.deep.property('southWest.lat', 35);
    centerOnBounds.payload.bounds.should.have.deep.property('northEast.lon', 35);
    centerOnBounds.payload.bounds.should.have.deep.property('southWest.lon', 55);
    centerOnBounds.payload.should.have.property('animate', message.animate);
    centerOnBounds.payload.should.have.property('zoom', "auto");
  });
});
