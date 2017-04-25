describe('emp3.api.Overlay', function () {
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('extends emp.api.Container', function () {
    var overlay = new emp3.api.Overlay();
    overlay.should.be.an.instanceof(emp3.api.Container);
  });

  describe('constructor', function () {
    it('constructs an overlay', function () {
      var overlay = new emp3.api.Overlay();
      overlay.should.exist;
      overlay.should.have.property('name');
      overlay.should.have.property('geoId');
    });
  });

  describe('addFeature', function () {
    it('should send a message to the MessageHandler to add a feature', function () {
      var overlay = new emp3.api.Overlay();
      var addFeaturesSpy = sinon.spy(overlay, 'addFeatures');
      var args = {
        feature: new emp3.api.Circle({name: 'circle'}),
        onSuccess: function () {
        },
        onError: function () {
        }
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      overlay.addFeature(args);

      addFeaturesSpy.should.have.been.calledOnce;
      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.plotFeature,
        overlayId: sinon.match.string,
        features: [args.feature],
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        source: sinon.match.object,
        method: 'Overlay.addFeatures',
        args: sinon.match.object
      });
    });
  });

  describe('addFeatures', function () {
    it('should send a message to the MessageHandler to add a list of features', function () {
      var overlay = new emp3.api.Overlay();
      var args = {
        features: [
          new emp3.api.Circle({name: 'circle1'}),
          new emp3.api.Square({name: 'circle2'})
        ],
        onSuccess: function () {
        },
        onError: function () {
        }
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      overlay.addFeatures(args);

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.plotFeature,
        overlayId: sinon.match.string,
        features: args.features,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        source: sinon.match.object,
        method: 'Overlay.addFeatures',
        args: args
      });
    });
  });

  describe('addOverlay', function () {
    it('should use addOverlays', function () {
      var overlay = new emp3.api.Overlay();
      var args = {
        overlay: new emp3.api.Overlay(),
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var addOverlays = sandbox.stub(overlay, 'addOverlays');
      overlay.addOverlay(args);
      addOverlays.should.have.been.calledWithMatch({
        overlays: [args.overlay],
        onSuccess: args.onSuccess,
        onError: args.onError
      });
    });

    it('should send a message to the MessageHandler to add an overlay', function () {
      var overlay = new emp3.api.Overlay();
      var args = {
        overlay: new emp3.api.Overlay(),
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      overlay.addOverlay(args);

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.createOverlay,
        overlays: [args.overlay],
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        source: sinon.match.object,
        method: 'Overlay.addOverlays',
        args: args
      });
    });
  });

  describe('addOverlays', function () {
    it('should send a message to the MessageHandler to add an array of overlays', function () {
      var overlay = new emp3.api.Overlay();
      var args = {
        overlays: [
          new emp3.api.Overlay(),
          new emp3.api.Overlay(),
          new emp3.api.Overlay()
        ],
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      overlay.addOverlays(args);

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.createOverlay,
        overlays: args.overlays,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        source: sinon.match.object,
        method: 'Overlay.addOverlays',
        args: args
      });
    });
  });

  describe('update', function () {
    it('sends a message to the MessageHandler to apply updates to the overlay', function () {
      var overlay = new emp3.api.Overlay({name: 'test overlay'});
      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');

      overlay.name = 'example overlay';
      overlay.update(args);

      sendMessageStub.should.have.been.calledWith({
        cmd: emp3.api.enums.channel.updateOverlay,
        overlay: overlay,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        method: 'Overlay.update',
        source: overlay,
        args: args
      });

    });
  });

  describe('getChildren', function () {
    it('sends a message to the messageHandler to retrieve all children of the overlay', function () {
      var overlay = new emp3.api.Overlay();

      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      overlay.getChildren(args);

      sendMessageStub.should.have.been.calledWith({
        cmd: emp3.api.enums.channel.get,
        types: ['overlay', 'feature'],
        select: ['overlayId', 'featureId', 'name', 'properties', 'parentId'],
        filter: [
          {
            property: 'parentId',
            term: overlay.geoId
          }
        ],
        recursive: false,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        method: 'Overlay.getChildren',
        source: overlay,
        args: args
      });
    });
  });

  describe('getFeatures', function () {
    it('sends a message to the MessageHandler to retrieve all child features of the overlay', function () {
      var overlay = new emp3.api.Overlay();
      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      overlay.getFeatures(args);

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.get,
        recursive: false,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        method: 'Overlay.getFeatures',
        source: overlay,
        args: args
      });
    });
  });

  describe('getOverlays', function () {
    it('sends a message to the MessageHandler to return all child overlays', function () {
      var overlay = new emp3.api.Overlay();
      var args = {
        onSuccess: function () {
        },
        onError: function () {
        }
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      overlay.getOverlays(args);

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.get,
        types: ['overlay'],
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        source: sinon.match.object,
        method: 'Overlay.getOverlays',
        args: args
      });
    });
  });

  describe('removeFeature', function () {
    it('throws an error if feature is not of type emp3.api.Feature', function () {
      var overlay = new emp3.api.Overlay(/Invalid argument/);

      var removeFeature = function () {
        overlay.removeFeature({feature: {geoId: '1234-5678-9ABC-DEF0'}});
      };
      removeFeature.should.throw();
    });

    it('uses removeFeatures', function () {
      var overlay = new emp3.api.Overlay();
      var args = {
        feature: new emp3.api.Circle(),
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var removeFeaturesStub = sandbox.stub(overlay, 'removeFeatures');
      overlay.removeFeature(args);
      removeFeaturesStub.should.have.been.calledWithMatch({
        features: [args.feature],
        onSuccess: args.onSuccess,
        onError: args.onError
      });
    });
  });

  describe('removeFeatures', function () {
    it('throws an error if features is not an array', function () {
      var overlay = new emp3.api.Overlay();
      var args = {
        features: new emp3.api.Square(),
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var removeFeatures = function () {
        overlay.removeFeatures(args);
      };
      removeFeatures.should.throw(/Invalid argument/);
    });

    it('sends a message to the MessageHandler to remove an array of child features', function () {
      var overlay = new emp3.api.Overlay();
      var args = {
        features: [
          new emp3.api.Circle(),
          new emp3.api.Square(),
          new emp3.api.Ellipse()
        ],
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      overlay.removeFeatures(args);
      sendMessageStub.should.have.been.calledWith({
        cmd: emp3.api.enums.channel.unplotFeatureBatch,
        features: args.features,
        overlayId: overlay.geoId,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        method: 'Overlay.removeFeatures',
        source: overlay,
        args: args
      });
    });
  });

  describe('removeOverlay', function () {
    it('throws an error if overlay is not of type emp3.api.Overlay', function () {
      var overlay = new emp3.api.Overlay();
      var removeOverlay = function () {
        overlay.removeOverlay({overlay: '1234-5678-9ABC-DEF0'});
      };

      removeOverlay.should.throw(/Invalid argument/);
    });

    it('should send a message to the MessageHandler to remove an overlay', function () {
      var overlay = new emp3.api.Overlay();
      var args = {
        overlay: new emp3.api.Overlay(),
        onSuccess: function () {
        },
        onError: function () {
        }
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      overlay.removeOverlay(args);

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.removeOverlay,
        overlays: [args.overlay],
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        source: sinon.match.object,
        method: 'Overlay.removeOverlays',
        args: sinon.match.object
      });
    });
  });

  describe('removeOverlays', function () {
    it('should send a message to the MessageHandler to remove an array of overlays', function () {
      var overlay = new emp3.api.Overlay();

      var args = {
        overlays: [
          new emp3.api.Overlay(),
          new emp3.api.Overlay(),
          new emp3.api.Overlay()
        ],
        onSuccess: function () {
        },
        onError: function () {
        }
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      overlay.removeOverlays(args);

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.removeOverlay,
        overlays: args.overlays,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        source: sinon.match.object,
        method: 'Overlay.removeOverlays',
        args: args
      });
    });

    it('will throw an error if something other than an array is passed', function () {
      var overlay = new emp3.api.Overlay();

      var removeOverlays = function () {
        overlay.removeOverlays({
          overlays: new emp3.api.Overlay(),
          onSuccess: function () {
          },
          onError: function () {
          }
        });
      };

      removeOverlays.should.throw(/Invalid argument/);
    });
  });

  describe('clearContainer', function () {
    it('sends a message to the MessageHandler to clear features and overlays', function () {
      var overlay = new emp3.api.Overlay();
      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      overlay.clearContainer(args);

      sendMessageStub.should.have.been.calledWith({
        cmd: emp3.api.enums.channel.clearFeatures,
        overlay: overlay,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        method: 'Overlay.clearContainer',
        source: overlay,
        args: args
      });
    });
  });

  describe('getParents', function () {
    it('sends a message to the MessageHandler to retrieve all parents for the overlay', function () {
      var overlay = new emp3.api.Overlay();

      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      overlay.getParents(args);

      sendMessageStub.should.have.been.calledWith({
        cmd: emp3.api.enums.channel.get,
        types: ['overlay'],
        select: ["overlayId", "name", "properties", "parentId"],
        filter: [
          {
            property: 'childId',
            term: overlay.geoId
          }
        ],
        recursive: false,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        method: 'Overlay.getParents',
        source: overlay,
        args: args
      });
    });
  });
});
