describe('emp.environment.browser', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('pubSub', function() {
    describe('publish', function() {
      it('publishes messages using the emp.environment.browser.mediator if not forwarding and the sender is specified', function() {
        var args = {
          channel: 'Map.getStatus',
          message: {
            cmd: 'map.get'
          },
          sender: {
            id: '1234-5678-9ABC-DEF0'
          }
        };

        var publishStub = sandbox.stub(emp.environment.browser.mediator, 'publish');
        emp.environment.browser.pubSub.publish(args);

        publishStub.should.have.been.calledWithMatch({
          channel: args.channel,
          message: args.message,
          sender: {
            id: args.sender.id,
            forwardMsg: true
          }
        });
      });

      it('forwards the message if forwarding is configured and the sender is not specified', function() {
        var args = {
          channel: 'Map.getStatus',
          message: {
            cmd: 'map.get'
          }
        };

        var publishSpy = sandbox.spy();
        var fakeWindow = {
          emp: {
            environment: {
              get: function() {
                return {
                  pubSub:{
                    publish: publishSpy
                  }
                };
              }
            }
          }
        };

        emp.environment.browser.pubSub.forwardPublishedMessages(fakeWindow);
        emp.environment.browser.pubSub.publish(args);

        publishSpy.should.have.been.calledWithMatch({
          channel: args.channel,
          message: args.message,
          sender: {
            forwardMsg: false
          }
        });
      });
    });

    describe('subscribe', function() {

    });

    describe('unsubscribe', function() {

    });

    describe('forwardSubscribeMessages', function() {

    });

    describe('stopForwardingSubscribe', function() {

    });

    describe('stopForwardingPublish', function() {

    });

    describe('forwardPublishedMessages', function() {

    });
  });
});
