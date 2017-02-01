describe('emp3.api.Feature', function () {
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('extends emp3.api.Container', function () {
    var feature = new emp3.api.Feature();
    feature.should.be.an.instanceof(emp3.api.Container);
  });

  describe('constructor', function () {
    it('validates coordinates passed in', function () {
      var invalidPosition = function () {
        new emp3.api.Feature({
          position: {
            latitude: -200,
            longitude: 500
          }
        });
      };

      invalidPosition.should.throw();

      var invalidPositions = function () {
        new emp3.api.Feature({
          positions: [{
            latitude: -200,
            longitude: 500
          }, {
            latitude: -500,
            longitude: 200
          }]
        });
      };

      invalidPositions.should.throw();

      var validPosition = function () {
        new emp3.api.Feature({
          position: {
            latitude: 4.1234,
            longitude: -15.23488
          }
        });
      };

      validPosition.should.not.throw();

      var validPositions = function () {
        new emp3.api.Feature({
          positions: [{
            latitude: -12,
            longitude: -23
          }, {
            latitude: -12,
            longitude: -22
          }, {
            latitude: -11,
            longitude: -28
          }]
        });
      };

      validPositions.should.not.throw();

    });
  });

  describe('addFeature', function () {
    it('calls the addFeatures method', function () {
      var feature = new emp3.api.Feature();
      var addFeaturesStub = sandbox.stub(feature, 'addFeatures');
      feature.addFeature({feature: new emp3.api.Feature()});
      addFeaturesStub.should.have.been.calledWithMatch({features: sinon.match.array});
    });
  });

  describe('addFeatures', function () {
    it('sends a message to the MessageHandler to plot new features with the current feature as the parent', function () {
      var feature = new emp3.api.Feature();
      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');

      var features = [new emp3.api.Feature(), new emp3.api.Feature()];
      var args = {
        features: features,
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      feature.addFeatures(args);

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.plotFeature,
        parentId: feature.geoId,
        features: features,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        method: 'Feature.addFeatures',
        source: feature,
        args: args
      });
    });
  });

  describe('apply', function () {
    it('calls the message handler apply method with itself as the argument', function () {
      var feature = new emp3.api.Feature();
      feature.stubProp = 'stub';

      var applyStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'apply');
      feature.apply();
      applyStub.should.have.been.calledWith(feature);
    });
  });

  describe.skip('getChildFeatures', function () {
    it('sends a message to the MessageHandler to retrieve all immediate child features', function () {
      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      var feature = new emp3.api.Feature();
      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };
      feature.getChildFeatures(args);
      sendMessageStub.should.have.been.calledWith({
        cmd: emp3.api.enums.channel.get,
        recursive: false,
        types: ['feature'],
        select: sinon.match.array,
        filter: [{
          property: 'parentId',
          term: feature.geoId
        }],
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        method: 'Feature.getChildFeatures',
        source: feature,
        args: args
      });
    });
  });

  describe('removeFeature', function () {
    it('calls the removeFeatures method', function () {
      var feature = new emp3.api.Feature();
      var featureToRemove = new emp3.api.Feature();
      var removeFeaturesStub = sandbox.stub(feature, 'removeFeatures');

      feature.removeFeature({feature: featureToRemove});
      removeFeaturesStub.should.have.been.calledWithMatch({features: [featureToRemove]});
    });
  });

  describe('removeFeatures', function () {
    it('sends a message to the MessageHandler to remove child features', function () {
      var feature = new emp3.api.Feature();
      var childFeatures = [
        new emp3.api.Feature(),
        new emp3.api.Feature()
      ];
      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      var args = {
        features: childFeatures,
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      feature.removeFeatures(args);
      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.unplotFeatureBatch,
        parentId: feature.geoId,
        features: childFeatures,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        method: 'Feature.removeFeatures',
        source: feature,
        args: args
      });
    });
  });

  describe.skip('clearContainer', function () {
    it('sends a message to the message handler to clear the container', function () {
      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      var feature = new emp3.api.Feature();

      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      feature.clearContainer(args);
      sendMessageStub.should.have.been.called;
    });
  });

  describe.skip('getParentFeatures', function () {
    it('sends a message to the messageHandler to retrieve the parent features');
  });

  describe.skip('getParentOverlays', function () {
    it('sends a message to the messageHandler to retrieve the parent overlays');
  });

  describe('getChildren', function () {
    it('sends a message to the message handler to retrieve all children', function () {
      var feature = new emp3.api.Feature();
      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');

      feature.getChildren(args);

      sendMessageStub.should.have.been.calledWith({
        cmd: emp3.api.enums.channel.get,
        types: ['feature'],
        select: ['parentId', 'overlayId', 'name', 'properties'],
        filter: [
          {
            property: 'parentId',
            term: feature.geoId
          }
        ],
        recursive: false,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        method: 'Feature.getChildren',
        source: feature,
        args: args
      });
    });
  });

  describe('getParents', function () {
    it('sends a message to the MessageHandler to retrieve all parents for the feature', function () {
      var feature = new emp3.api.Feature();

      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      feature.getParents(args);

      sendMessageStub.should.have.been.calledWith({
        cmd: emp3.api.enums.channel.get,
        types: ['overlay', 'feature'],
        select: ['overlayId', 'featureId', 'name', 'properties', 'parentId'],
        filter: [
          {
            property: 'childId',
            term: feature.geoId
          }
        ],
        recursive: false,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        method: 'Feature.getParents',
        source: feature,
        args: args
      });
    });
  });

  describe('getParentFeatures', function () {
    it('sends a message to the MessageHandler to retrieve all parent features for the feature', function () {
      var feature = new emp3.api.Feature();

      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      feature.getParentFeatures(args);

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.get,
        types: ['feature'],
        select: ['featureId', 'name', 'properties', 'parentId'],
        filter: [
          {
            property: 'childId',
            term: feature.geoId
          }
        ],
        recursive: false,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        method: 'Feature.getParentFeatures',
        source: feature,
        args: args
      });
    });
  });

  describe('getParentOverlays', function () {
    it('sends a message to the MessageHandler to retrieve all parent overlays for the feature', function () {
      var feature = new emp3.api.Feature();

      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      feature.getParentOverlays(args);

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.get,
        types: ['overlay'],
        select: ['overlayId', 'name', 'properties', 'parentId'],
        filter: [
          {
            property: 'childId',
            term: feature.geoId
          }
        ],
        recursive: false,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        method: 'Feature.getParentOverlays',
        source: feature,
        args: args
      });
    });
  });

  describe('inherited cmapi properties', function () {
    describe('labelStyle', function () {
      describe('setter', function () {
        it('sets the label style for the feature', function () {
          var feature = new emp3.api.Feature();

          var labelStyle = new cmapi.IGeoLabelStyle({
            scale: 1,
            color: new cmapi.IGeoColor({red: 200, green: 21, blue: 89, alpha: 0.3}),
            justification: 'left'
          });

          feature.labelStyle = labelStyle;
          feature.labelStyle.should.eql(labelStyle);
        });
      });
    });
  });

});
