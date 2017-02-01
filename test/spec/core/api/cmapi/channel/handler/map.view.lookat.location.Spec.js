describe('cmapi2.channel.handler[MAP_VIEW_LOOKAT_LOCATION]#map.view.lookat.location', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('process', function() {
    it('constructs and queues a new transaction to set a LookAt for a location on the map', function() {
      var args = {
        sender: {
          id: 'sender'
        },
        message: {
          payload: {
            range: 5000,
            heading: 45,
            tilt: 30,
            latitude: 15,
            longitude: 14,
            altitude: 2500
          }
        }
      };
      var transactionQueueAdd = sandbox.stub(emp.transactionQueue, 'add');
      cmapi.channel.handler[cmapi.channel.names.MAP_VIEW_LOOKAT_LOCATION].process(args);

      transactionQueueAdd.should.have.been.calledWithMatch({
        intent: emp.intents.control.LOOKAT_SET,
        originChannel: cmapi.channel.names.MAP_VIEW_LOOKAT_LOCATION,
        items: sinon.match.array
      });

      transactionQueueAdd.firstCall.args[0].items[0].should.be.an.instanceOf(emp.typeLibrary.LookAt);
      transactionQueueAdd.firstCall.args[0].items[0].should.have.property('range', args.message.payload.range);
      transactionQueueAdd.firstCall.args[0].items[0].should.have.property('tilt', args.message.payload.tilt);
      transactionQueueAdd.firstCall.args[0].items[0].should.have.property('heading', args.message.payload.heading);
      transactionQueueAdd.firstCall.args[0].items[0].should.have.property('latitude', args.message.payload.latitude);
      transactionQueueAdd.firstCall.args[0].items[0].should.have.property('longitude', args.message.payload.longitude);
      transactionQueueAdd.firstCall.args[0].items[0].should.have.property('altitude', args.message.payload.altitude);
      transactionQueueAdd.firstCall.args[0].items[0].should.have.property('altitudeMode', emp.constant.featureAltitudeModeType.CLAMP_TO_GROUND);
    });
  });
});
