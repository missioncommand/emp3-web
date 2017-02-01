describe('emp3.api.environment.browser', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('constructor', function() {
    it('creates a environment object for a browser', function() {
      var env = emp3.api.environment.browser;
      env.should.exist;
      env.name.should.equal('Browser');
      env.should.have.property('createInstance');
      env.should.have.property('pubSub');
    });
  });

  describe('pubSub', function() {
    describe('publish', function() {
      it('publishes messages to the emp.environment.browser.mediator and returns true if mediator is successful', function() {
        var args = {
          channel: 'stub.channel',
          message: {},
          dest: '1234-5678-9ABC-DEF0'
        };

        var publishStub = sandbox.stub(emp.environment.browser.mediator, 'publish').returns({
          success: true,
          message: 'stubbed message'
        });

        emp3.api.environment.browser.pubSub.publish(args);

        publishStub.should.have.been.calledWithMatch({
          channel: args.channel,
          dest: args.dest,
          message: args.message,
          sender: sinon.match({
            id: sinon.match.string
          })
        });
      });

      it('publishes messages to the emp.environment.browser.mediator and throws an error if the mediator is not successful', function() {
        var args = {
          channel: 'stub.channel',
          message: {},
          dest: '1234-5678-9ABC-DEF0'
        };

        var errorMessage = 'stubbed error message';
        var publishStub = sandbox.stub(emp.environment.browser.mediator, 'publish').returns({
          success: false,
          message: errorMessage
        });

        var publish = function() {
          emp3.api.environment.browser.pubSub.publish(args);
        };

        publish.should.throw(errorMessage);
        publishStub.should.have.been.calledWithMatch({
          channel: args.channel,
          dest: args.dest,
          message: args.message,
          sender: sinon.match({
            id: sinon.match.string
          })
        });
      });
    });
  });

});
