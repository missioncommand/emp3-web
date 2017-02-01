describe('cmapi.channel.publisher[CMAPI2_FEATURE_EVENT_UPDATE]#map.feature.event.update', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('process', function() {

    it('constructs a message to send over CMAPI', function() {
      var transaction = {
        mapInstanceId: "map1",
        intent: emp.intents.control.MI_FEATURE_UPDATE,
        items: [{
          featureId: "feature1",
          name: "feature1",
          data: {
            coordinates: [40, 40],
            type: "Point"
          },
          symbolCode: "SFGPUCI----K---"
        }]
      };

      // process calls the pubish call.  Make sure this gets called with proper
      // output.
      var environmentPublish = sandbox.stub(emp.environment.get().pubSub, 'publish');

      cmapi.channel.publisher[cmapi.channel.names.CMAPI2_FEATURE_EVENT_UPDATE].process(transaction);

      environmentPublish.should.have.been.calledWithMatch({
        message: {
          features: sinon.match([
            sinon.match({
              featureId: "feature1",
              name: "feature1",
              feature: {
                coordinates: [40, 40],
                type: "Point"
              },
              symbolCode: "SFGPUCI----K---"
            })
          ])
        },
        sender: {
          id: "map1"
        },
        channel: cmapi.channel.names.CMAPI2_FEATURE_EVENT_UPDATE
      });
    });
  });
});
