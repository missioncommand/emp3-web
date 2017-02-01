describe('emp3.api.global', function () {
  var sandbox;
      
  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('findOverlay', function () {
    it('sends a message to the MessageHandler to search for an overlay', function () {

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');

      var args = {
        uuid: '1234-5678-9ABC-DEF0',
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };
      emp3.api.global.findOverlay(args);

      var message = {
        cmd: emp3.api.enums.channel.get,
        types: ['overlay'],
        select: ['overlayId', 'name', 'description', 'properties'],
        filter: [{
          property: 'overlayId',
          term: args.uuid
        }],
        recursive: false,
        onSuccess: args.onSuccess,
        onError: args.onError
      };

      var callInfo = {
        source: 'global',
        method: 'global.findOverlay',
        args: args
      };

      sendMessageStub.should.have.been.calledWith(message, callInfo);
    });
  });

  describe('findFeature', function () {
    it('sends a message to the MessageHandler to search for a feature', function () {

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');

      var args = {
        uuid: '1234-5678-9ABC-DEF0',
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };
      emp3.api.global.findFeature(args);

      var message = {
        cmd: emp3.api.enums.channel.get,
        types: ['feature'],
        select: ['featureId', 'name', 'description', 'properties'],
        filter: [{
          property: 'featureId',
          term: args.uuid
        }],
        recursive: false,
        onSuccess: args.onSuccess,
        onError: args.onError
      };

      var callInfo = {
        source: 'global',
        method: 'global.findFeature',
        args: args
      };

      sendMessageStub.should.have.been.calledWith(message, callInfo);
    });
  });

  describe('findContainer', function () {
    it('sends a message to the MessageHandler to search for a container', function () {
      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');

      var args = {
        uuid: '1234-5678-9ABC-DEF0',
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };
      emp3.api.global.findContainer(args);

      var message = {
        cmd: emp3.api.enums.channel.get,
        types: ['feature', 'overlay'],
        select: ['featureId', 'overlayId', 'name', 'description', 'properties'],
        filter: [{
          property: 'featureId',
          term: args.uuid
        }, {
          property: 'overlayId',
          term: args.uuid
        }],
        recursive: false,
        onSuccess: args.onSuccess,
        onError: args.onError
      };

      var callInfo = {
        source: 'global',
        method: 'global.findContainer',
        args: args
      };

      sendMessageStub.should.have.been.calledWith(message, callInfo);
    });
  });
});
