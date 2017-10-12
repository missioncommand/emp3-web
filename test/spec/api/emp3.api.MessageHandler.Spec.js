describe('emp3.api.MessageHandler', function() {
  var sandbox,
    engine = {
      "mapEngineId": 'leafletMapEngine',
      "engineBasePath": "/emp3/leaflet/"
    },
    containerId = "containerId";

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    emp3.api.MessageHandler.destroyInstance();
    sandbox.restore();
  });

  describe('getInstance', function() {
    it('returns the MessageHandler singleton', function() {
      var handler = emp3.api.MessageHandler.getInstance();
      handler.should.exist;
      handler.should.have.property('sendMessage');
      handler.should.have.property('spawnMap');
      handler.should.have.property('publish');
    });
  });

  describe('sendMessage', function() {
    it('will not publish a message if no map engine is running', function() {
      var cmd = {
        cmd: emp3.api.enums.channel.plotFeature,
        overlayId: '1234-5678-9ABC',
        features: [new emp3.api.Circle()],
        onSuccess: function() {
        },
        onError: function() {
        }
      };
      var message = {
        source: this,
        method: 'Overlay.addFeatures',
        args: {}
      };

      sandbox.stub(emp3.api.MessageHandler.getInstance(), 'isAMapReady').returns(false);
      var sendMessage = function() {
        emp3.api.MessageHandler.getInstance().sendMessage(cmd, message);
      };

      sendMessage.should.throw('There is no map engine available to publish messages to');
    });

    it('will publish a message if a map engine is running', function() {
      var cmd = {
        cmd: emp3.api.enums.channel.plotFeature,
        overlayId: '1234-5678-9ABC',
        features: [new emp3.api.Circle()],
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };
      var message = {
        source: this,
        method: 'Overlay.addFeatures',
        args: {}
      };

      // Stub the necessary pieces
      sandbox.stub(emp3.api.MessageHandler.getInstance(), 'isAMapReady').returns(true);
      var publishStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'publish');

      expect(function() {
        emp3.api.MessageHandler.getInstance().sendMessage(cmd, message);
      })
        .to.not.throw();
      publishStub.should.have.been.calledWith(cmd, message);
    });
  });

  describe('publish', function() {
    it('uses the correct channel handler to send messages to the environment');
  });

  describe('addEventListener', function() {
    it('adds an event listener to the eventListeners hashMap', function() {
      var callback = sandbox.spy();
      var args = {
        id: '1234-5678-9ABC-DEF0',
        event: 'Map.centerOnLocation',
        callback: callback
      };

      emp3.api.MessageHandler.getInstance().addEventListener(args);
      emp3.api.MessageHandler.getInstance().getEventListeners()[args.id][args.event][0]();

      callback.should.have.been.calledOnce;
    });
  });

  describe('getEventListeners', function() {
    it('retrieves the list of callbacks for events', function() {
      var callback1 = sandbox.spy();
      var callback2 = sandbox.spy();
      var callback3 = sandbox.spy();
      var callback4 = sandbox.spy();

      var args1 = {
        id: '1234-5678-9ABC-DEF0',
        event: 'Map.centerOnLocation',
        callback: callback1
      };

      var args2 = {
        id: '1234-5678-9ABC-DEF0',
        event: 'Map.zoomOut',
        callback: callback2
      };

      var args3 = {
        id: 'DEF0-1234-5678-9ABC',
        event: 'Map.centerOnLocation',
        callback: callback3
      };

      var args4 = {
        id: 'DEF0-1234-5678-9ABC',
        event: 'Map.centerOnLocation',
        callback: callback4
      };

      // Add the listeners
      emp3.api.MessageHandler.getInstance().addEventListener(args1);
      emp3.api.MessageHandler.getInstance().addEventListener(args2);
      emp3.api.MessageHandler.getInstance().addEventListener(args3);
      emp3.api.MessageHandler.getInstance().addEventListener(args4);

      // Retrieve and invoke the callbacks
      emp3.api.MessageHandler.getInstance().getEventListeners()[args1.id][args1.event][0]();
      emp3.api.MessageHandler.getInstance().getEventListeners()[args1.id][args2.event][0]();
      emp3.api.MessageHandler.getInstance().getEventListeners()[args3.id][args3.event][0]();
      emp3.api.MessageHandler.getInstance().getEventListeners()[args3.id][args3.event][0]();
      emp3.api.MessageHandler.getInstance().getEventListeners()[args3.id][args3.event][1]();

      // Check the spies for having been called
      callback1.should.have.been.calledOnce;
      callback2.should.have.been.calledOnce;
      callback3.should.have.been.calledTwice;
      callback4.should.have.been.calledOnce;
    });
  });

  describe('handleGetVisibilityTransactionComplete', function() {
    it('runs success callback for Map.getVisibility calls when no errors are present', function() {

      var onSuccess = sandbox.spy();
      var callbacks = {
        onSuccess: onSuccess,
        callInfo: "callInfo",
        source: "source",
        args: {
          parent: "parent",
          target: "target"
        },
        visible: 0
      };

      var details = {
        target: "targetObj",
        parent: "parentObj",
        visible: emp3.api.enums.VisibilityStateEnum.HIDDEN
      };
      var failures = {};

      emp3.api.MessageHandler.getInstance().handleGetVisibilityTransactionComplete(callbacks, details, failures);

      onSuccess.should.have.been.calledWithMatch({
        failures: failures,
        parent: callbacks.args.parent,
        target: callbacks.args.target,
        visible: callbacks.visible
      });
    });
  });

  describe('handleCenterOnLocationTransactionComplete', function() {

    it('calls onSuccess when Camera is set using Map.setCamera', function() {
      var successSpy = sandbox.spy();
      var errorSpy = sandbox.spy();

      var callbacks = {
        callInfo: {
          method: 'Map.setCamera',
          args: {
            camera: {
              geoId: "geoId",
              name: "name"
            }
          }
        },
        source: 'mocha',
        args: {},
        onSuccess: successSpy,
        onError: errorSpy
      };

      var details = {
        center: {
          lat: 40,
          lon: 40
        },
        range: 50000,
        tilt: 50,
        roll: 50,
        heading: 50
      };

      var failures = "boo";

      emp3.api.MessageHandler.getInstance().handleCenterOnLocationTransactionComplete(callbacks, details, failures);

      successSpy.should.have.been.calledWithMatch({
        camera: {
          geoId: callbacks.callInfo.args.camera.geoId,
          name: callbacks.callInfo.args.camera.name,
          latitude: details.center.lat,
          longitude: details.center.lon,
          altitude: details.range,
          tilt: details.tilt,
          roll: details.roll,
          heading: details.heading
        }
      });
    });
  });

  describe('handleFeatureAdd', function() {
    it('calls handleFeatureEvent', function() {
      sandbox.stub(emp3.api.MessageHandler.getInstance(), 'handleFeatureEvent');

      var sender = {};
      var message = {};

      var handleFeatureAdd = function() {
        emp3.api.MessageHandler.getInstance().handleFeatureAdd(sender, message);
      };
      handleFeatureAdd.should.not.throw(/any error/);
    });
  });

  describe('handleFeatureUpdate', function() {

    it('calls handleFeatureEvent', function() {
      sandbox.stub(emp3.api.MessageHandler.getInstance(), 'handleFeatureEvent');

      var sender = {};
      var message = {};

      var handleFeatureAdd = function() {
        emp3.api.MessageHandler.getInstance().handleFeatureUpdate(sender, message);
      };
      handleFeatureAdd.should.not.throw(/any error/);
    });
  });

  describe('handleFeatureRemove', function() {

    it('calls handleFeatureEvent', function() {
      sandbox.stub(emp3.api.MessageHandler.getInstance(), 'handleFeatureEvent');

      var sender = {};
      var message = {};

      var handleFeatureAdd = function() {
        emp3.api.MessageHandler.getInstance().handleFeatureRemove(sender, message);
      };
      handleFeatureAdd.should.not.throw(/any error/);
    });
  });

  describe('handleFeatureEvent', function() {
    var sender = {
        id: "map1"
      },
      message = {
        features: [{
          name: "point1",
          geoId: "point1",
          //properties: {
          //  featureType: emp3.api.enums.FeatureTypeEnum.GEO_POINT
          //},
          feature: {
            coordinates: [40, 40],
            type: "Point"
          }
        }]
      };

    it('can create feature add events', function() {
      message.properties = {
          featureType:emp3.api.enums.FeatureTypeEnum.GEO_POINT
      };

      var eventType = emp3.api.enums.EventType.MAP_FEATURE_ADDED,
        messageHandler = emp3.api.MessageHandler.getInstance(),
        callback = sandbox.spy(),
        addEventListenerArgs = {
          id: sender.id,
          event: emp3.api.enums.EventType.MAP_FEATURE_ADDED,
          callback: callback
        };

      // setup eventListener.
      emp3.api.MessageHandler.getInstance().addEventListener(addEventListenerArgs);

      messageHandler.handleFeatureEvent(eventType, sender, message);

      callback.should.have.been.calledWithMatch({
        type: emp3.api.enums.EventType.MAP_FEATURE_ADDED
      });

    });

    it('can create feature update events', function() {
      message.properties = {
          featureType:emp3.api.enums.FeatureTypeEnum.GEO_POINT
      };
      var eventType = emp3.api.enums.EventType.MAP_FEATURE_UPDATED,
        messageHandler = emp3.api.MessageHandler.getInstance(),
        callback = sandbox.spy(),
        addEventListenerArgs = {
          id: sender.id,
          event: emp3.api.enums.EventType.MAP_FEATURE_UPDATED,
          callback: callback
        };

      // setup eventListener.
      emp3.api.MessageHandler.getInstance().addEventListener(addEventListenerArgs);

      messageHandler.handleFeatureEvent(eventType, sender, message);

      callback.should.have.been.calledWithMatch({
        type: emp3.api.enums.EventType.MAP_FEATURE_UPDATED
      });
    });

    it('can create feature removed events', function() {
      message.properties = {
          featureType:emp3.api.enums.FeatureTypeEnum.GEO_POINT
      };
      var eventType = emp3.api.enums.EventType.MAP_FEATURE_REMOVED,
        messageHandler = emp3.api.MessageHandler.getInstance(),
        callback = sandbox.spy(),
        addEventListenerArgs = {
          id: sender.id,
          event: emp3.api.enums.EventType.MAP_FEATURE_REMOVED,
          callback: callback
        };

      // setup eventListener.
      emp3.api.MessageHandler.getInstance().addEventListener(addEventListenerArgs);

      messageHandler.handleFeatureEvent(eventType, sender, message);

      callback.should.have.been.calledWithMatch({
        type: emp3.api.enums.EventType.MAP_FEATURE_REMOVED
      });
    });
  });

  describe('get', function() {
    it('sends a payload to to the validator with a `get` command for overlays or features', function() {
      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var callInfo = {
        args: args,
        method: 'Map.getOverlays',
        source: {}
      };

      var message = {
        onSuccess: args.onSuccess,
        onError: args.onError,
        recursive: true,
        select: [],
        types: [],
        filter: {}
      };

      var transactionId = '1234-5678-9ABC-DEF0';

      var validateStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'validate');
      emp3.api.MessageHandler.getInstance().get(callInfo, message, transactionId);

      validateStub.should.have.been.calledWithMatch('map.get', {
          types: sinon.match.array,
          recursive: message.recursive,
          select: message.select,
          filter: message.filter,
          messageId: transactionId
        },
        callInfo);
    });
  });

  describe('validate', function() {
    it('sends validated messages to the environment pubSub `publish` method', function() {
      var channel = 'map.get';
      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };
      var message = {
        onSuccess: args.onSuccess,
        onError: args.onError,
        recursive: true,
        select: [],
        types: [],
        filter: {}
      };

      var callInfo = {
        args: {
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        },
        method: 'Map.getOverlays',
        source: {}
      };

      var environmentPublisherStub = sandbox.stub(emp3.api.environment.browser.pubSub, 'publish');
      emp3.api.MessageHandler.getInstance().validate(channel, message, callInfo);

      environmentPublisherStub.should.have.been.calledWith({
        channel: channel,
        message: message
      });
    });

    it('should split the message into chunks of 500 if the message channel is plotFeatureBatch, unplotFeatureBatch, featureSelectedBatch, or  featureDeselectedBatch', function() {

      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };
      var message = {
        onSuccess: args.onSuccess,
        onError: args.onError,
        features: []
      };

      for (var i = 0; i < 1001; i++) {
        message.features.push('i\'m a feature');
      }

      var callInfo = {
        args: {
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        },
        method: 'Map.getOverlays',
        source: {}
      };

      var channels = [
        emp3.api.enums.channel.plotFeatureBatch,
        emp3.api.enums.channel.unplotFeatureBatch,
        emp3.api.enums.channel.featureSelectedBatch,
        emp3.api.enums.channel.featureDeselectedBatch
      ];

      var environmentPublisherStub = sandbox.stub(emp3.api.environment.browser.pubSub, 'publish');

      for (var chanIdx in channels) {
        var channel = channels[chanIdx];
        emp3.api.MessageHandler.getInstance().validate(channel, message, callInfo);

        environmentPublisherStub.should.have.been.calledWith({
          channel: channel,
          message: sinon.match.object
        });

        var publishedFeatures = environmentPublisherStub.firstCall.args[0].message.features;
        publishedFeatures.should.have.length(500);
      }
    });
  });

  describe('clearFeatures', function() {
    it('passes a clearFeatures payload to the validate function', function() {
      var messageHandler = emp3.api.MessageHandler.getInstance();
      var validateStub = sandbox.stub(messageHandler, 'validate');
      var callInfo = {
        method: 'Test.clearContainer',
        source: this,
        args: {
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        }
      };
      var message = {
        overlay: new emp3.api.Overlay()
      };
      var transactionId = '1234-5678-9ABC-DEF0';

      messageHandler.clearFeatures(callInfo, message, transactionId);

      validateStub.should.have.been.calledWith(emp3.api.enums.channel.clearFeatures, {
        overlayId: message.overlay.geoId,
        messageId: transactionId
      }, callInfo);
    });
  });

  describe('manageSelection', function() {
    it('adds features into the selectionHash', function() {
      var sender = {
        id: 'map1'
      };

      var msg = {
        details: {
          features: {
            featureId: 'feature1',
            name: 'feature1',
            feature: {
              coordinates: [40, 40],
              type: 'Point'
            },
            properties: {
              featureType: 'point'
            }
          }
        }
      };

      var messageHandler = emp3.api.MessageHandler.getInstance();
      expect(function() {
        messageHandler.manageSelection(sender, msg);
      }).to.not.throw();

    });
  });

  describe('manageDeselection', function() {
    it('calls removeSelection to remove items out of selectionHash', function() {

      var sender = {
        id: 'map1'
      };

      var msg = {
        details: {
          features: [{
            featureId: 'feature1',
            name: 'feature1',
            feature: {
              coordinates: [40, 40],
              type: 'Point'
            },
            properties: {
              featureType: 'point'
            }
          }]
        }
      };

      var messageHandler = emp3.api.MessageHandler.getInstance();
      var removeSelectionStub = sandbox.stub(messageHandler, 'removeSelection');


      // unfortunately cannot test the validate function is called.  the selectionHash
      // must be populated, but it is a private variable.
      messageHandler.manageSelection(sender, msg);
      messageHandler.isSelected('map1', 'feature1').should.equal(true);
      messageHandler.manageDeselection(sender, msg);

      removeSelectionStub.should.have.been.calledWithMatch('map1', ['feature1']);
    });
  });

  describe('removeSelection', function() {
    it('removes items out of the selectionHash', function() {
      var sender = {
        id: 'map1'
      };

      var msg = {
        details: {
          features: [{
            featureId: 'feature1',
            name: 'feature1',
            feature: {
              coordinates: [40, 40],
              type: 'Point'
            },
            properties: {
              featureType: 'point'
            }
          }]
        }
      };

      var messageHandler = emp3.api.MessageHandler.getInstance();

      messageHandler.manageSelection(sender, msg);
      messageHandler.isSelected('map1', 'feature1').should.equal(true);
      messageHandler.removeSelection('map1', ['feature1']);
      messageHandler.isSelected('map1', 'feature1').should.equal(false);
    });
  });

  describe('isSelected', function() {
    it('finds a feature selected', function() {
      var sender = {
        id: 'map1'
      };

      var msg = {
        details: {
          features: [{
            featureId: 'feature1',
            name: 'feature1',
            feature: {
              coordinates: [40, 40],
              type: 'Point'
            },
            properties: {
              featureType: 'point'
            }
          }]
        }
      };

      var messageHandler = emp3.api.MessageHandler.getInstance();
      messageHandler.manageSelection(sender, msg);
      messageHandler.isSelected('map1', 'feature1').should.equal(true);
      messageHandler.manageDeselection(sender, msg);
      messageHandler.isSelected('map1', 'feature1').should.equal(false);
    });

    it('finds a feature unselected', function() {
      var messageHandler = emp3.api.MessageHandler.getInstance();
      messageHandler.isSelected('map1', 'feature1').should.equal(false);
    });
  });
});
