describe('emp3.api.Container', function() {
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('addEventListener', function() {
    it('expects an eventType', function() {
      var container = new emp3.api.Container();

      var addEventListener = function() {
        container.addEventListener({callback: sandbox.spy()});
      };
      addEventListener.should.throw();
    });

    it('expects a callback function', function() {
      var container = new emp3.api.Container();
      var addEventListener = function() {
        container.addEventListener({eventType: 'theHappening'});
      };
      addEventListener.should.throw();
    });

    it('sends a message to the message handler with the event type and the callback and returns the callback', function() {
      var addEventListenerStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'addEventListener');
      var container = new emp3.api.Container();
      var args = {
        callback: sandbox.spy(),
        eventType: 'theHappening'
      };
      var rc = container.addEventListener(args);
      rc.should.equal(args.callback);
      addEventListenerStub.should.have.been.calledWith({
        id: container.geoId,
        event: args.eventType,
        callback: args.callback
      });
    });
  });

  describe('removeEventListener', function() {
    it('expects the eventType', function() {
      var container = new emp3.api.Container();
      var removeEventListener = function() {
        container.removeEventListener();
      };
      removeEventListener.should.throw();
    });

    it('exepcts the callback to be removed', function() {
      var container = new emp3.api.Container();
      var removeEventListener = function() {
        container.removeEventListener({
          eventType: 'theHappening'
        });
      };
      removeEventListener.should.throw();
    });

    it('will send a message to the message handler to remove a MessageHandler', function() {
      var removeEventListenerStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'removeEventListener');
      var container = new emp3.api.Container();
      var args = {
        eventType: 'theHappening',
        callback: sandbox.spy()
      };

      container.removeEventListener(args);
      removeEventListenerStub.should.have.been.calledWith({
        id: container.geoId,
        event: args.eventType,
        callback: args.callback
      });
    });
  });
});
