describe('emp3.api.Map', function () {
  var sandbox,
      engine = {
        "mapEngineId": 'leafletMapEngine',
        "engineBasePath": "../emp3/leaflet/"
      },
      containerId = '';

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('extends emp3.api.Container', function () {
    var map = new emp3.api.Map({
      container: containerId,
      engine: engine
    });
    map.should.be.an.instanceof(emp3.api.Container);
  });

  describe('constructor', function () {
    it('sends a message to MessageHandler:spawnMap with valid arguments', function (done) {
      var successCallback = function () {
      };
      var errorCallback = function () {
      };

      // Create the necessary stubs
      var spawnMapStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'spawnMap', function () {
        spawnMapStub.should.have.been.calledOnce; // TODO check what is passed to the function
        done();
      });

      new emp3.api.Map({
        engine: engine,
        container: "fakeid",
        onSuccess: successCallback,
        onError: errorCallback
      });
    });
  });

  describe('addOverlay', function () {
    it('uses addOverlays', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var args = {
        overlays: [
          new emp3.api.Overlay(),
          new emp3.api.Overlay()
        ],
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var addOverlaysSpy = sandbox.spy(map, 'addOverlays');
      map.addOverlays(args);
      addOverlaysSpy.should.have.been.called;
    });
  });

  describe('addOverlays', function () {
    it('sends a message to the MessageHandler to add an array of overlays', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var args = {
        overlays: [
          new emp3.api.Overlay(),
          new emp3.api.Overlay()
        ],
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      map.addOverlays(args);

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.createOverlay,
        onSuccess: args.onSuccess,
        onError: args.onError,
        overlays: args.overlays
      }, {
        method: 'Map.addOverlays',
        source: map,
        args: args
      });
    });
  });

  describe('getAllOverlays', function () {
    it('sends a message to the MessageHandler to retrieve all overlays for this map', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');

      map.getAllOverlays(args);

      sendMessageStub.should.have.been.calledWith({
        cmd: 'map.get',
        onSuccess: args.onSuccess,
        onError: args.onError,
        select: ['overlayId', 'name', 'properties', 'parentId'],
        types: ['overlay'],
        recursive: true
      }, {
        mapId: map.geoId,
        source: map,
        method: 'Map.getOverlays',
        args: args
      });
    });

    it('sends a message to the MessageHandler to retrieve all overlays of a specific parent overlay', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var args = {
        overlayId: '1234-5678-9ABC-DEF0',
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');

      map.getAllOverlays(args);

      sendMessageStub.should.have.been.calledWith({
        cmd: 'map.get',
        onSuccess: args.onSuccess,
        onError: args.onError,
        select: ['overlayId', 'name', 'properties', 'parentId'],
        types: ['overlay'],
        recursive: true
      }, {
        mapId: map.geoId,
        source: map,
        method: 'Map.getOverlays',
        args: args
      });
    });
  });

  describe('getMidDistanceThreshold', function () {
    it('has the default mid distance threshold', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      map.getMidDistanceThreshold().should.equal(emp3.api.enums.defaultMidDistanceThreshold);
    });

    it('has the new mid distance threshold after set', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      map.setMidDistanceThreshold(50);
      map.getMidDistanceThreshold().should.equal(50);
    });
  });

  describe('getFarDistanceThreshold', function () {
    it('has the default far distance threshold', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      map.getFarDistanceThreshold().should.equal(emp3.api.enums.defaultFarDistanceThreshold);
    });

    it('has the new far distance threshold after set', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      map.setFarDistanceThreshold(2000000);
      map.getFarDistanceThreshold().should.equal(2000000);
    });
  });

  describe('getIconSize', function () {
    it('has the default icon size', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      map.getIconSize().should.equal(emp3.api.enums.defaultIconSize);
    });

    it('has the new icon size after set', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      map.setIconSize(emp3.api.enums.IconSizeEnum.LARGE);
      map.getIconSize().should.equal(emp3.api.enums.IconSizeEnum.LARGE);
    });
  });

  describe('getMilStdLabels', function () {
    it('has the default mil std label', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      map.getMilStdLabels().should.equal(emp3.api.enums.defaultMilStdLabelSetting);
    });

    it('has the mil std label after set', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      map.setMilStdLabels(emp3.api.enums.MilStdLabelSettingEnum.REQUIRED_LABELS);
      map.getMilStdLabels().should.equal(emp3.api.enums.MilStdLabelSettingEnum.REQUIRED_LABELS);
    });
  });

  describe('setMidDistanceThreshold', function () {
    it('can set the mid distance threshold', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      map.setMidDistanceThreshold(50);
      map.getMidDistanceThreshold().should.equal(50);
    });

    it('errors on range higher than far threshold', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      function setThreshold() {
        map.setMidDistanceThreshold(20000000);
      }

      setThreshold.should.throw(Error);
    });

    it('errors on bad input', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      function setThreshold() {
        map.setMidDistanceThreshold("meatball");
      }

      setThreshold.should.throw(Error);

    });
  });

  describe('setFarDistanceThreshold', function () {
    it('can set the far distance threshold', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      map.setFarDistanceThreshold(2000000);
      map.getFarDistanceThreshold().should.equal(2000000);
    });

    it('errors on range lower than mid threshold', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      function setThreshold() {
        map.setFarDistanceThreshold(5);
      }

      setThreshold.should.throw(Error);
    });

    it('errors on bad input', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      function setThreshold() {
        map.setFarDistanceThreshold("tungsten");
      }

      setThreshold.should.throw(Error);
    });

  });

  describe('setIconSize', function () {
    it('can set the icon size', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      map.setIconSize(emp3.api.enums.IconSizeEnum.LARGE);
      map.getIconSize().should.equal(emp3.api.enums.IconSizeEnum.LARGE);
    });

    it('errors on bad input', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      function setSize() {
        map.setIconSize(50);
      }

      setSize.should.throw(Error);
    });
  });

  describe('setMilStdLabels', function () {
    it('can set the mil std labels', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      map.setMilStdLabels(emp3.api.enums.MilStdLabelSettingEnum.REQUIRED_LABELS);
      map.getMilStdLabels().should.equal(emp3.api.enums.MilStdLabelSettingEnum.REQUIRED_LABELS);
    });

    it('errors on bad input', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      function setLabels() {
        map.setMilStdLabels("multitool");
      }

      setLabels.should.throw(Error);
    });
  });

  describe('removeOverlay', function () {
    it('sends a message to the MessageHandler to remove an overlay', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var args = {
        overlay: new emp3.api.Overlay(),
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var removeOverlaysSpy = sandbox.spy(map, 'removeOverlays');
      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');

      map.removeOverlay(args);

      removeOverlaysSpy.should.have.been.calledWithMatch({
        overlays: [args.overlay],
        onSuccess: args.onSuccess,
        onError: args.onError
      });

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: 'map.overlay.remove',
        overlays: [args.overlay],
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        mapId: map.geoId,
        source: map,
        method: 'Map.removeOverlays',
        args: sinon.match.object
      });
    });
  });

  describe('removeOverlays', function () {
    it('sends a message to the MessageHandler to remove an array of overlays', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var args = {
        overlays: [
          new emp3.api.Overlay(),
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

      map.removeOverlays(args);

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: 'map.overlay.remove',
        overlays: args.overlays,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        source: map,
        method: 'Map.removeOverlays',
        args: args
      });
    });
  });

  describe('addMapService', function () {
    it('sends a message to the MessageHandler to add a map service to the map', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var args = {
        mapService: new emp3.api.MapService(),
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      map.addMapService(args);

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.plotUrl,
        mapService: args.mapService,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        mapId: map.geoId,
        source: map,
        method: 'Map.addMapService',
        args: args
      });
    });
  });

  describe('cancelDraw', function () {
    it('cancels a drawTransaction', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;
      map.drawTransaction = new emp3.api.Transaction({
        id: "drawTransaction",
        mapId: map.geoId,
        geoId: "geoDrawTransaction"
      });

      var cancelStub = sandbox.stub(map.drawTransaction, 'cancel');

      map.cancelDraw();

      cancelStub.should.have.been.called;
    });
  });

  describe('completeDraw', function () {
    it('sends message to the MessageHandler to complete a draw', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;
      map.drawTransaction = new emp3.api.Transaction({
        id: "drawTransaction",
        mapId: map.geoId,
        geoId: "geoDrawTransaction"
      });

      var completeStub = sandbox.stub(map.drawTransaction, 'complete');

      map.completeDraw();

      completeStub.should.have.been.called;
    });
  });

  describe('drawFeature', function () {
    it('sends a message to the MessageHandler to draw', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var args = {
        feature: new emp3.api.Point(),
        onDrawError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      map.drawFeature(args);

      sendMessageStub.should.have.been.calledWith({
        cmd: emp3.api.enums.channel.draw,
        feature: args.feature,
        onError: args.onDrawError,
        startCallback: "",
        updateCallback: "",
        completeCallback: "",
        cancelCallback: ""
      }, {
        mapId: map.geoId,
        source: map,
        method: 'Map.drawFeature',
        args: args
      });
    });
  });

  describe('getMapServices', function () {
    it('sends a message to the MessageHandler to retrieve all map services on the map', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      map.getMapServices(args);

      sendMessageStub.should.have.been.calledWith({
        cmd: emp3.api.enums.channel.get,
        types: ["feature"],
        select: ["name", "description", "featureId", "url", "format", "params"],
        recursive: true,
        filter: [{
          property: "overlayId",
          term: emp3.api.enums.defaultOverlayId.WMS
        }],
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        mapId: map.geoId,
        source: map,
        method: 'Map.getMapServices',
        args: args
      });
    });
  });

  describe('getVisibility', function () {
    it('sends a message to the MessageHandler to get the visibility of a feature or overlay', function () {

      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var args = {
        target: new emp3.api.Overlay({name: "fubu", geoId: "fubu"}),
        parent: new emp3.api.Overlay({name: "fila", geoId: "fila"}),
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      map.getVisibility(args);

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.getVisibility,
        target: args.target,
        parent: args.parent,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        mapId: map.geoId,
        source: map,
        method: 'Map.getVisibility',
        args: args
      });

    });
  });

  describe('removeMapService', function () {
    it('sends a message to the MessageHandler to remove a map service from the map', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var args = {
        mapService: new emp3.api.MapService(),
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      map.removeMapService(args);

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.unplotFeature,
        features: [args.mapService],
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        mapId: map.geoId,
        source: map,
        method: 'Map.removeMapService',
        args: args
      });
    });
  });

  describe('setCamera', function () {
    it('sends message to the MessageHandler to set the camera for the map', function () {
      var cameraArgs = {
        latitude: 45.3,
        longitude: -23.103,
        altitude: 5000000,
        heading: 0,
        roll: 45,
        tilt: 51.8,
        range: 20000,
        altitudeMode: 'CLAMP_TO_GROUND'
      };

      var camera = new emp3.api.Camera(cameraArgs);
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      var setCameraStub = sandbox.stub(emp3.api.CameraManager, 'setCameraForMap');

      var setCameraArgs = {
        camera: camera,
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      map.setCamera(setCameraArgs);

      setCameraStub.should.have.been.calledWith({
        map: map.geoId,
        camera: camera
      });

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.centerOnLocation,
        camera: camera,
        onSuccess: setCameraArgs.onSuccess,
        onError: setCameraArgs.onError
      }, {
        mapId: map.geoId,
        source: map,
        method: 'Map.setCamera',
        args: setCameraArgs
      });
    });
  });

  describe('getCamera', function () {
    it.skip('retrieves the current camera from the map', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var getCameraStub = sandbox.stub(emp3.api.CameraManager, 'getCamera');
      var camera = map.getCamera();

      getCameraStub.should.have.been.calledWith({
        mapId: map.geoId
      });

      expect(camera).to.exist;
      camera.tilt.should.equal(0);
      camera.roll.should.equal(0);
      camera.heading.should.equal(0);
      camera.altitudeMode.should.equal('CLAMP_TO_GROUND');
      camera.latitude.should.equal(0);
      camera.longitude.should.equal(0);
      camera.altitude.should.equal(0);
    });
  });

  describe('setBounds', function () {
    it('sends a message to the MessageHandler to change the extent for the  map', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var args = {
        north: 81.2906,
        south: 61.001,
        east: 166.7886,
        west: 146.238,
        animate: true,
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      var messageHandlerStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      map.setBounds(args);

      messageHandlerStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.centerOnBounds,
        north: args.north,
        south: args.south,
        east: args.east,
        west: args.west,
        animate: args.animate,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        mapId: map.geoId,
        source: map,
        method: 'Map.setBounds',
        args: args
      });
    });
  });

  describe('setVisibility', function () {
    var map;
    var messageHandlerStub;
    beforeEach(function () {
      map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;
      messageHandlerStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
    });

    describe('setVisibility(target, parent, visibilityAction)', function () {
      it('sends a message to the MessageHandler to show an overlay', function () {
        var args = {
          target: new emp3.api.Overlay(),
          parent: '0FED-CBA9-8765-4321',
          action: emp3.api.enums.VisibilityActionEnum.SHOW_ALL,
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };

        sandbox.stub(emp3.api, 'isOverlay').returns(true);
        map.setVisibility(args);

        messageHandlerStub.should.have.been.calledWithMatch({
          cmd: 'map.overlay.show',
          overlays: [
            args.target.geoId
          ],
          parent: args.parent,
          onSuccess: args.onSuccess,
          onError: args.onError
        }, {
          mapId: map.geoId,
          source: map,
          method: 'Map.setVisibility',
          args: args
        });
      });

      it('sends a message to the MessageHandler to hide an overlay', function () {
        var args = {
          target: new emp3.api.Overlay(),
          parent: '0FED-CBA9-8765-4321',
          action: emp3.api.enums.VisibilityActionEnum.HIDE_ALL,
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };

        sandbox.stub(emp3.api, 'isOverlay').returns(true);
        map.setVisibility(args);

        messageHandlerStub.should.have.been.calledWithMatch({
          cmd: 'map.overlay.hide',
          overlays: [
            args.target.geoId
          ],
          parent: args.parent,
          onSuccess: args.onSuccess,
          onError: args.onError
        }, {
          mapId: map.geoId,
          source: map,
          method: 'Map.setVisibility',
          args: args
        });
      });

      it('sends a message to the MessageHandler to show a feature', function () {
        var args = {
          target: new emp3.api.Circle(),
          parent: '0FED-CBA9-8765-4321',
          action: emp3.api.enums.VisibilityActionEnum.SHOW_ALL,
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };

        map.setVisibility(args);

        messageHandlerStub.should.have.been.calledWithMatch({
          cmd: 'map.feature.show',
          features: [args.target.geoId],
          parent: args.parent,
          onSuccess: args.onSuccess,
          onError: args.onError
        }, {
          mapId: map.geoId,
          source: map,
          method: 'Map.setVisibility',
          args: args
        });
      });

      it('sends a message to the MessageHandler to hide a feature', function () {
        var args = {
          target: new emp3.api.Circle(),
          parent: '0FED-CBA9-8765-4321',
          action: emp3.api.enums.VisibilityActionEnum.HIDE_ALL,
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };

        sandbox.stub(emp3.api, 'isOverlay').returns(false);
        map.setVisibility(args);

        messageHandlerStub.should.have.been.calledWithMatch({
          cmd: 'map.feature.hide',
          features: [
            args.target.geoId
          ],
          parent: args.parent,
          onSuccess: args.onSuccess,
          onError: args.onError
        }, {
          mapId: map.geoId,
          source: map,
          method: 'Map.setVisibility',
          args: args
        });
      });
    }); // End setVisibility(target, parent, action)

    describe('setVisibility([targets], visibilityAction)', function () {
      it('sends a command to the MessageHandler to show an array of overlays', function () {
        var args = {
          target: [
            new emp3.api.Overlay(),
            new emp3.api.Overlay(),
            new emp3.api.Overlay(),
            new emp3.api.Overlay()
          ],
          action: emp3.api.enums.VisibilityActionEnum.SHOW_ALL,
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };

        map.setVisibility(args);
        messageHandlerStub.should.have.been.calledWithMatch({
          cmd: 'map.overlay.show',
          overlays: _.map(args.target, function (overlay) {
            return overlay.geoId;
          }),
          onSuccess: args.onSuccess,
          onError: args.onError
        }, {
          mapId: map.geoId,
          method: 'Map.setVisibility',
          source: map,
          args: args
        });
      });

      it('sends a command to the MessageHandler to hide an array of overlays', function () {
        var args = {
          target: [
            new emp3.api.Overlay(),
            new emp3.api.Overlay(),
            new emp3.api.Overlay(),
            new emp3.api.Overlay()
          ],
          action: emp3.api.enums.VisibilityActionEnum.HIDE_ALL,
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };

        map.setVisibility(args);
        messageHandlerStub.should.have.been.calledWithMatch({
          cmd: 'map.overlay.hide',
          overlays: _.map(args.target, function (overlay) {
            return overlay.geoId;
          }),
          onSuccess: args.onSuccess,
          onError: args.onError
        }, {
          mapId: map.geoId,
          method: 'Map.setVisibility',
          source: map,
          args: args
        });
      });

      it('sends a command to the MessageHandler to show an array of features', function () {
        var args = {
          target: [
            new emp3.api.Square(),
            new emp3.api.Rectangle(),
            new emp3.api.Circle(),
            new emp3.api.Ellipse()
          ],
          action: emp3.api.enums.VisibilityActionEnum.SHOW_ALL,
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };

        map.setVisibility(args);
        messageHandlerStub.should.have.been.calledWithMatch({
          cmd: 'map.feature.show',
          features: _.map(args.target, function (overlay) {
            return overlay.geoId;
          }),
          onSuccess: args.onSuccess,
          onError: args.onError
        }, {
          mapId: map.geoId,
          method: 'Map.setVisibility',
          source: map,
          args: args
        });
      });

      it('sends a command to the MessageHandler to hide an array of features', function () {
        var args = {
          target: [
            new emp3.api.Square(),
            new emp3.api.Rectangle(),
            new emp3.api.Circle(),
            new emp3.api.Ellipse()
          ],
          action: emp3.api.enums.VisibilityActionEnum.HIDE_ALL,
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };

        map.setVisibility(args);
        messageHandlerStub.should.have.been.calledWithMatch({
          cmd: 'map.feature.hide',
          features: _.map(args.target, function (overlay) {
            return overlay.geoId;
          }),
          onSuccess: args.onSuccess,
          onError: args.onError
        }, {
          method: 'Map.setVisibility',
          source: map,
          args: args
        });
      });

      it('sends a message to show an array of mixed overlays and features', function () {
        var args = {
          action: emp3.api.enums.VisibilityActionEnum.SHOW_ALL,
          target: [
            new emp3.api.Overlay(),
            new emp3.api.MilStdSymbol(),
            new emp3.api.Overlay(),
            new emp3.api.MilStdSymbol()
          ],
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };

        map.setVisibility(args);

        messageHandlerStub.should.have.been.calledTwice;
        messageHandlerStub.firstCall.should.have.been.calledWithMatch({
          cmd: emp3.api.enums.channel.showFeature,
          features: [args.target[1].geoId, args.target[3].geoId]
        }, {
          method: 'Map.setVisibility',
          source: map,
          args: args
        });

        messageHandlerStub.secondCall.should.have.been.calledWithMatch({
          cmd: emp3.api.enums.channel.showOverlay,
          overlays: [args.target[0].geoId, args.target[2].geoId],
          onSuccess: args.onSuccess,
          onError: args.onError
        }, {
          method: 'Map.setVisibility',
          source: map,
          args: args
        });
      });

      it('sends a message to hide an array of mixed overlays and features', function () {
        var args = {
          action: emp3.api.enums.VisibilityActionEnum.HIDE_ALL,
          target: [
            new emp3.api.Overlay(),
            new emp3.api.MilStdSymbol(),
            new emp3.api.Overlay(),
            new emp3.api.MilStdSymbol()
          ],
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };

        map.setVisibility(args);

        messageHandlerStub.should.have.been.calledTwice;
        messageHandlerStub.firstCall.should.have.been.calledWithMatch({
          cmd: emp3.api.enums.channel.hideFeature,
          features: [args.target[1].geoId, args.target[3].geoId]
        }, {
          method: 'Map.setVisibility',
          source: map,
          args: args
        });

        messageHandlerStub.secondCall.should.have.been.calledWithMatch({
          cmd: emp3.api.enums.channel.hideOverlay,
          overlays: [args.target[0].geoId, args.target[2].geoId],
          onSuccess: args.onSuccess,
          onError: args.onError
        }, {
          method: 'Map.setVisibility',
          source: map,
          args: args
        });
      });

      it('handles an empty array', function () {
        var args = {
          action: emp3.api.enums.VisibilityActionEnum.HIDE_ALL,
          target: [],
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };
        map.setVisibility(args);
        messageHandlerStub.should.not.have.been.called;
      });
    }); // End setVisibility([targets], visibilityAction)

    describe('setVisibility(target, visibilityAction)', function () {
      it('sends a message to show a single overlay', function () {
        var args = {
          action: emp3.api.enums.VisibilityActionEnum.SHOW_ALL,
          target: new emp3.api.Overlay(),
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };

        map.setVisibility(args);

        messageHandlerStub.should.have.been.calledWithMatch({
          cmd: 'map.overlay.show',
          overlays: [args.target.geoId],
          onSuccess: args.onSuccess,
          onError: args.onError
        }, {
          method: 'Map.setVisibility',
          mapId: map.geoId,
          source: map,
          args: args
        });
      });

      it('sends a message to hide a single overlay', function () {
        var args = {
          action: emp3.api.enums.VisibilityActionEnum.HIDE_ALL,
          target: new emp3.api.Overlay(),
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };

        map.setVisibility(args);

        messageHandlerStub.should.have.been.calledWithMatch({
          cmd: 'map.overlay.hide',
          overlays: [args.target.geoId],
          onSuccess: args.onSuccess,
          onError: args.onError
        }, {
          method: 'Map.setVisibility',
          mapId: map.geoId,
          source: map,
          args: args
        });
      });

      it('sends a message to show a single feature', function () {
        var args = {
          action: emp3.api.enums.VisibilityActionEnum.SHOW_ALL,
          target: new emp3.api.Square(),
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };

        map.setVisibility(args);

        messageHandlerStub.should.have.been.calledWithMatch({
          cmd: 'map.feature.show',
          features: [args.target.geoId],
          onSuccess: args.onSuccess,
          onError: args.onError
        }, {
          method: 'Map.setVisibility',
          mapId: map.geoId,
          source: map,
          args: args
        });
      });

      it('sends a message to hide a single feature', function () {
        var args = {
          action: emp3.api.enums.VisibilityActionEnum.HIDE_ALL,
          target: new emp3.api.Square(),
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };

        map.setVisibility(args);

        messageHandlerStub.should.have.been.calledWithMatch({
          cmd: 'map.feature.hide',
          features: [args.target.geoId],
          onSuccess: args.onSuccess,
          onError: args.onError
        }, {
          method: 'Map.setVisibility',
          mapId: map.geoId,
          source: map,
          args: args
        });
      });

      it('handles an invalid id');

    }); // End setVisibility(target, visibilityAction)

  }); // End setVisibility

  describe('purge', function () {
    it('sends a message to the MessageHandler to remove the map', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      }),
        messageHandlerStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage'),
        args = {
          onSuccess: sandbox.spy(),
          onError: sandbox.spy()
        };

      map.purge(args);
      messageHandlerStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.mapShutdown,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        map: map,
        source: map,
        method: 'Map.shutdown',
        args: args
      });
    });
  }); // End purge

  describe('setLookAt', function () {
    it('throws an error if LookAt is missing', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      var setLookAt = function () {
        map.setLookAt();
      };
      setLookAt.should.throw(/Missing argument/i);
    });

    it('sends a message to the MessageHandler to set the LookAt for the map', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      var lookAt = new emp3.api.LookAt({
        range: 5000,
        latitude: 40,
        longitude: 43,
        altitude: 3200,
        tilt: 24
      });

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      var args = {
        lookAt: lookAt,
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      map.setLookAt(args);

      sendMessageStub.should.have.been.calledWith({
        cmd: emp3.api.enums.channel.lookAtLocation,
        lookAt: lookAt,
        animate: sinon.match.boolean,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        mapId: map.geoId,
        source: map,
        method: 'Map.setLookAt',
        args: args
      });
    });
  });

  describe('getLookAt', function () {
    it('returns a default LookAt if none have been set', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      expect(map.getLookAt()).to.exist;
    });

    it('returns the proper LookAt after one has been set', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      var leaningTower = new emp3.api.LookAt({ // Leaning Tower of Pisa uppermost balcony
        latitude: 43.7230,
        longitude: 10.3966,
        altitude: 55.7784,
        range: 30,
        tilt: 45
      });

      map.setLookAt({lookAt: leaningTower});
      map.getLookAt().should.eql(leaningTower);
    });
  });

  describe('readyCheck', function () {
    it('throws an error if the map status is not `ready`', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });

      var readyCheck = function () {
        map.readyCheck();
      };

      for (var status in map.status = emp3.api.enums.MapStateEnum) {
        if (emp3.api.enums.MapStateEnum.hasOwnProperty(status)) {
          if (emp3.api.enums.MapStateEnum[status] === emp3.api.enums.MapStateEnum.MAP_READY) {
            continue;
          }

          map.status = emp3.api.enums.MapStateEnum[status];
          readyCheck = function () {
            map.readyCheck();
          };
          readyCheck.should.throw(/Map is not ready/);
        }
      }
    });

    it('should not throw if the map status is `ready', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var readyCheck = function () {
        map.readyCheck();
      };

      readyCheck.should.not.throw();
    });

    it('runs before functions that go outside of the map itself', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_NEW;

      var getAllFeatures = function () {
        map.getAllFeatures();
      };

      getAllFeatures.should.throw(/Map is not ready/);
    });
  });

  describe('getChildren', function () {
    it('sends a message to the MessageHandler to get the children of the map', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;
      map.geoId = '1234-5678-9ABC-DEF0';

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');

      var args = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy()
      };

      map.getChildren(args);

      sendMessageStub.should.have.been.calledWith({
        cmd: emp3.api.enums.channel.get,
        types: sinon.match.array,
        select: sinon.match.array,
        recursive: false,
        onSuccess: args.onSuccess,
        onError: args.onError
      }, {
        mapId: map.geoId,
        method: 'Map.getChildren',
        source: map,
        args: args
      });
    });
  });

  describe('getParents', function () {
    it('returns nothing', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      expect(map.getParents()).to.not.exist;
    });
  });

  describe('containerToGeo', function () {
    it('returns a GeoPosition object', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var args = {
        x: 400,
        y: 300
      };

      sandbox.stub(emp.instanceManager, 'getInstance').returns({
        engine: {
          view: {
            getLatLonFromXY: sandbox.stub().returns({lat: -1, lon: -1, x: args.x, y: args.y})
          }
        }
      });

      map.containerToGeo(args).should.be.an.instanceof(emp3.api.GeoPosition);
    });
  });

  describe('geoToContainer', function () {
    it('expects a GeoPosition object as input', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      sandbox.stub(emp.instanceManager, 'getInstance').returns({
        engine: {
          view: {
            getLatLonFromXY: sandbox.stub().returns({lat: -1, lon: -1, x: 0, y: 0}),
            getXYFromLatLon: sandbox.stub().returns({lat: -1, lon: -1, x: 0, y: 0})
          }
        }
      });

      var geoPosition = new emp3.api.GeoPosition({
        latitude: 0,
        longitude: 0
      });

      var withGeoPosition = function () {
        map.geoToContainer(geoPosition);
      };

      withGeoPosition.should.not.throw();

      var geoPositionEquivalent = {
        latitude: 0,
        longitude: 0
      };
      var withGeoPositionEquivalent = function () {
        map.geoToContainer(geoPositionEquivalent);
      };

      withGeoPositionEquivalent.should.not.throw();

      var badInput = {x: 0, y: 0};
      var withBadInput = function () {
        map.geoToContainer(badInput);
      };

      withBadInput.should.throw();
    });
  });

  describe('getInstanceVisibility', function() {
    it('takes two features', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var parent = new emp3.api.MilStdSymbol({geoId: '1234'}),
        child = new emp3.api.MilStdSymbol({geoId: '4321'});

      var getInstanceVisibility = function() {
        map.getInstanceVisibility(parent, child);
      };

      getInstanceVisibility.should.not.throw();
    });

    it('takes two overlays', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var parent = new emp3.api.Overlay({geoId: '1234'}),
        child = new emp3.api.Overlay({geoId: '4321'});

      var getInstanceVisibility = function() {
        map.getInstanceVisibility(parent, child);
      };

      getInstanceVisibility.should.not.throw();
    });

    it('takes an overlay parent and a child feature', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var parent = new emp3.api.Overlay({geoId: '1234'}),
        child = new emp3.api.MilStdSymbol({geoId: '4321'});

      var getInstanceVisibility = function() {
        map.getInstanceVisibility(parent, child);
      };

      getInstanceVisibility.should.not.throw();
    });

    it('rejects a feature parent and and overlay child', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var parent = new emp3.api.MilStdSymbol({geoId: '1234'}),
        child = new emp3.api.Overlay({geoId: '4321'});

      var getInstanceVisibility = function() {
        map.getInstanceVisibility(parent, child);
      };

      getInstanceVisibility.should.throw(/Invalid argument/);
    });

    it('returns a emp3.api.enums.VisibilityStateEnum', function() {
      var map = new emp3.api.Map({
        geoId: 'testMap',
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var parent = new emp3.api.Overlay({geoId: '1234'}),
        child = new emp3.api.MilStdSymbol({geoId: '4321'});

      var coreOverlay = new emp.classLibrary.EmpOverlay({
        coreId: '1234'
      });
      coreOverlay.options.visibleOnMap[map.geoId] = true;
      emp.storage._storage.set(coreOverlay);

      var coreFeature = new emp.classLibrary.EmpFeature({
        coreId: '4321'
      });
      coreFeature.options.visibleOnMap[map.geoId] = true;
      emp.storage._storage.set(coreFeature);

      coreFeature.options.parentObjects['1234'] = coreOverlay;
      coreOverlay.options.childObjects['4321'] = coreFeature;

      map.getInstanceVisibility(parent, child).should.be.oneOf(_.toArray(emp3.api.enums.VisibilityStateEnum));

      emp.storage._storage.store = {};
    });
  });

  describe('setMotionLockMode', function() {
    it('sends a lock mode enum to the map', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');
      var args = {mode: emp3.api.enums.MapMotionLockEnum.SMART_MOTION};
      map.setMotionLockMode(args);

      var cmd = {
        cmd: emp3.api.enums.channel.lockView,
        lock: args.mode
      };

      var message = {
        mapId: map.geoId,
        source: map,
        method: 'Map.setMotionLockMode',
        args: args
      };

      sendMessageStub.should.have.been.calledWith(cmd, message);
    });
  });

  describe('selectFeatures', function() {
    it('sends message to the MessageHandler to select multiple items', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;
      var feature = new emp3.api.Point();
      var args = {
        features: [feature]
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');

      map.selectFeatures({
        features: [feature]
      });

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.featureSelectedBatch,
        features: args.features
      }, {
        mapId: map.geoId,
        source: map,
        method: 'Map.selectFeatures',
        args: args
      });
    });

    it ('fails if no features are passed in', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var selectFeatures = function () {
        map.selectFeatures();
      };
      selectFeatures.should.throw(/Missing argument/i);
    });
  });

  describe('selectFeature', function() {
    it('calls Map.selectFeatures', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;
      var feature = new emp3.api.Point();
      var args = {
        feature: feature
      };

      var selectFeatures = sandbox.stub(map, 'selectFeatures');

      map.selectFeature(args);

      selectFeatures.should.have.been.calledWithMatch({
        features: [args.feature]
      });
    });

    it ('fails if no features are passed in', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var selectFeature = function () {
        map.selectFeature();
      };
      selectFeature.should.throw(/Missing argument/i);
    });
  });

  describe('deselectFeature', function() {
    it('calls Map.deselectFeatures', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;
      var feature = new emp3.api.Point();
      var args = {
        feature: feature
      };

      var deselectFeatures = sandbox.stub(map, 'deselectFeatures');

      map.deselectFeature(args);

      deselectFeatures.should.have.been.calledWithMatch({
        features: [args.feature]
      });
    });

    it ('fails if no features are passed in', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var deselectFeature = function () {
        map.deselectFeature();
      };
      deselectFeature.should.throw(/Missing argument/i);
    });
  });

  describe('deselectFeatures', function() {
    it('sends message to the MessageHandler to deselect multiple items', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;
      var feature = new emp3.api.Point();
      var args = {
        features: [feature]
      };

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');

      map.deselectFeatures({
        features: [feature]
      });

      sendMessageStub.should.have.been.calledWithMatch({
        cmd: emp3.api.enums.channel.featureDeselectedBatch,
        features: args.features
      }, {
        mapId: map.geoId,
        source: map,
        method: 'Map.deselectFeatures',
        args: args
      });
    });

    it ('fails if no features are passed in', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var deselectFeatures = function () {
        map.deselectFeatures();
      };
      deselectFeatures.should.throw(/Missing argument/i);
    });
  });

  describe('isSelected', function() {
    it('determines if feature is selected', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var isSelectedStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'isSelected', function(){ return false; });

      map.isSelected({
        feature: {
          geoId: 'lala'
        }
      }).should.equal(false);

      isSelectedStub.should.have.been.calledOnce;
    });

    it('fails if no feature is passed in', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      function isSelected() {
        map.isSelected({});
      }
      isSelected.should.throw(Error);

    });
  });

  describe('getSelected', function() {
    it('retrieves selected features', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var getSelectedStub = sandbox.stub(emp3.api.MessageHandler.getInstance(),
        'getSelected',
        function(){
          return [{geoId: 'feature1'}, {'geoId': 'feature2'}];
        });

      map.getSelected({
        feature: {
          geoId: 'lala'
        }
      }).should.eql([{geoId: 'feature1'}, {'geoId': 'feature2'}]);

      getSelectedStub.should.have.been.calledOnce;
    });
  });

  describe('clearSelected', function() {
    it('sends a message to MessageHandler to deselect all features', function() {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');

      map.clearSelected();

      sendMessageStub.should.have.been.calledWithMatch({
          cmd: emp3.api.enums.channel.featureDeselected,
          mapId: map.geoId
        }, {
          mapId: map.geoId,
          source: map,
          method: "Map.clearSelected",
          args: {}
        });
    });
  });

  describe('setSelectionStyle', function() {
    it('sends a message to MessageHandler to modify the selction style', function() {

      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      var args = {
        color: 'FFFF0000',
        scale: 1.5
      };
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;

      var sendMessageStub = sandbox.stub(emp3.api.MessageHandler.getInstance(), 'sendMessage');

      map.setSelectionStyle(args);

      sendMessageStub.should.have.been.calledWithMatch({
          cmd: emp3.api.enums.channel.config,
          color: 'FFFF0000',
          scale: 1.5
        }, {
          mapId: map.geoId,
          source: map,
          method: "Map.setSelectionStyle",
          args: args
        });
    });
  });
});
