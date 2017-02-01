describe('emp.environment.browser.mediator', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('publish', function() {
    it('invokes all callbacks for the channel specified in the message', function() {
      var message = {
        channel: 'stub.channel',
        message: { },
        dest: {
          id: '1234-5678-9ABC-DEF0'
        },
        sender: {
          id: '0FED-CBA9-8765-4321'
        }
      };

      var callback = sandbox.spy();
      var callback2 = sandbox.spy();
      emp.environment.browser.mediator.subscribe({
        channel: message.channel,
        callback: callback,
        senderId: '1234-5678-9ABC-DEF0'
      });
      emp.environment.browser.mediator.subscribe({
        channel: message.channel,
        callback: callback2,
        senderId: '1234-5678-9ABC-DEF0'
      });

      emp.environment.browser.mediator.publish(message);

      callback.should.have.been.calledWithMatch(message.sender, message.message, message.channel);
      callback2.should.have.been.calledWithMatch(message.sender, message.message, message.channel);
    });
  });


});
