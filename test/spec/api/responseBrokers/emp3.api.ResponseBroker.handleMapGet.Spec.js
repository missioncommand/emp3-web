describe('emp3.api.ResponseBroker.handleMapGet', function () {
  var sandbox,
    broker,
    engine = {
      "mapEngineId": 'leafletMapEngine',
      "engineBasePath": "/emp3/leaflet/"
    },
    containerId = "containerId";

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    broker = emp3.api.ResponseBrokerFactory.getBroker(emp3.api.enums.channel.get);

    sandbox.stub(emp3.api.MessageHandler, 'getInstance').returns({
      spawnMap: sandbox.spy()
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('logs an error if the originating method is not handled', function () {
    var map = new emp3.api.Map({
      engine: engine,
      container: containerId
    });

    map.status = emp3.api.enums.MapStateEnum.MAP_READY;
    map.geoId = '1234-5678-9ABC-DEF0';

    var callbacks = {
      onSuccess: sandbox.spy(),
      onError: sandbox.spy(),
      callInfo: {
        method: 'Map.unhandledMethod'
      },
      source: map,
      args: {}
    };

    var details = {
      successes: {
        overlay: [],
        feature: []
      }
    };

    var failures = {};

    sandbox.stub(emp.wms.manager, 'getWmsOverlayId').returns('rootLayer');
    sandbox.stub(emp.instanceManager, 'getInstance').returns({
      engines: {
        getDefaultLayerOverlayID: sandbox.stub().returns('wmsLayer')
      }
    });

    var errorSpy = sandbox.stub(window.console, 'error');
    broker.process(callbacks, details, failures);

    callbacks.onSuccess.should.not.have.been.called;
    callbacks.onError.should.not.have.been.called;

    errorSpy.should.have.been.calledWith(sinon.match(/Originating method .+ was not handled/));
  });

  describe('Feature.getChildren', function () {
    it('runs the onSuccess callback for Feature.getChildren calls when no errors are present', function () {
      var successSpy = sandbox.spy();
      var errorSpy = sandbox.spy();

      var callbacks = {
        callInfo: {
          method: 'Feature.getChildren'
        },
        source: 'mocha',
        args: {},
        onSuccess: successSpy,
        onError: errorSpy
      };

      var details = {
        successes: {
          feature: [
            {
              name: 'acm',
              featureId: '2341',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_ACM},
              data: {symbolCode: 'S--------------'}
            }, {
              name: 'circle',
              featureId: '1234',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE}
            }, {
              name: 'ellipse',
              featureId: '3412',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE}
            }, {
              name: 'symbol',
              featureId: '2415',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL},
              data: {symbolCode: 'S--------------'}
            }, {
              name: 'path',
              featureId: '4123',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_PATH}
            }, {
              name: 'point',
              featureId: '1324',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_POINT}
            }, {
              name: 'polygon',
              featureId: '3421',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_POLYGON}
            }, {
              name: 'rectangle',
              featureId: '1342',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE}
            }, {
              name: 'square',
              featureId: '2413',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_SQUARE}
            }, {
              name: 'text',
              featureId: '1423',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_TEXT}
            }
          ]
        }
      };

      var failures = [];

      sandbox.stub(emp3.api, 'convertGeoJsonToCMAPIPositions').returns({latitude: 0, longitude: 0});
      sandbox.stub(emp3.api, 'convertCMAPIPropertiesToFeature');

      var broker = emp3.api.ResponseBrokerFactory.getBroker(emp3.api.enums.channel.get);
      broker.process(callbacks, details, failures);

      successSpy.should.have.been.calledWithMatch({
        features: sinon.match.array
      });

      errorSpy.should.not.have.been.called;
      var features = successSpy.firstCall.args[0].features;
      for (var feature in features) {
        features[feature].should.have.property('name', details.successes.feature[feature].name);
        features[feature].should.have.property('geoId', details.successes.feature[feature].featureId);
        features[feature].should.have.property('featureType', details.successes.feature[feature].properties.featureType);
      }
    });
  });

  describe('Feature.getParents', function () {
    it('runs the onSuccess callback for Feature.getParents calls when no errors are present', function () {
      var successSpy = sandbox.spy();
      var errorSpy = sandbox.spy();

      var callbacks = {
        callInfo: {
          method: 'Feature.getParents'
        },
        source: 'mocha',
        args: {},
        onSuccess: successSpy,
        onError: errorSpy
      };

      var details = {
        successes: {
          feature: [
            {
              name: 'acm',
              featureId: '2341',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_ACM},
              data: {symbolCode: 'S--------------'}
            }, {
              name: 'circle',
              featureId: '1234',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE}
            }
          ],
          overlay: [
            {
              name: 'parentOverlay',
              overlayId: '5678-1234-DEF0-9ABC'
            }
          ]
        }
      };

      var failures = [];

      sandbox.stub(emp3.api, 'convertGeoJsonToCMAPIPositions').returns({latitude: 0, longitude: 0});
      sandbox.stub(emp3.api, 'convertCMAPIPropertiesToFeature');

      broker.process(callbacks, details, failures);

      successSpy.should.have.been.calledWithMatch({
        features: sinon.match.array,
        overlays: sinon.match.array
      });

      errorSpy.should.not.have.been.called;
      var features = successSpy.firstCall.args[0].features;
      for (var feature in features) {
        features[feature].should.have.property('name', details.successes.feature[feature].name);
        features[feature].should.have.property('geoId', details.successes.feature[feature].featureId);
        features[feature].should.have.property('featureType', details.successes.feature[feature].properties.featureType);
      }

      var overlays = successSpy.firstCall.args[0].overlays;
      overlays.should.have.length(1);
      overlays[0].name.should.equal(details.successes.overlay[0].name);
    });
  });

  describe('Features.getParentFeatures', function () {
    it('runs the onSuccess callback for Feature.getParentFeatures calls when no errors are present', function () {
      var successSpy = sandbox.spy();
      var errorSpy = sandbox.spy();

      var callbacks = {
        callInfo: {
          method: 'Feature.getParentFeatures'
        },
        source: 'mocha',
        args: {},
        onSuccess: successSpy,
        onError: errorSpy
      };

      var details = {
        successes: {
          feature: [
            {
              name: 'acm',
              featureId: '2341',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_ACM},
              data: {symbolCode: 'S--------------'}
            }, {
              name: 'circle',
              featureId: '1234',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE}
            }
          ],
          overlay: [
            {
              name: 'parentOverlay',
              overlayId: '5678-1234-DEF0-9ABC'
            }
          ]
        }
      };

      var failures = [];

      sandbox.stub(emp3.api, 'convertGeoJsonToCMAPIPositions').returns({latitude: 0, longitude: 0});
      sandbox.stub(emp3.api, 'convertCMAPIPropertiesToFeature');

      broker.process(callbacks, details, failures);

      successSpy.should.have.been.calledWith({
        features: sinon.match.array
      });

      errorSpy.should.not.have.been.called;
      var features = successSpy.firstCall.args[0].features;
      for (var feature in features) {
        features[feature].should.have.property('name', details.successes.feature[feature].name);
        features[feature].should.have.property('geoId', details.successes.feature[feature].featureId);
        features[feature].should.have.property('featureType', details.successes.feature[feature].properties.featureType);
      }
    });
  });

  describe('Features.getParentOverlays', function () {
    it('runs the onSuccess callback for Feature.getParentOverlays calls when no errors are present', function () {
      var successSpy = sandbox.spy();
      var errorSpy = sandbox.spy();

      var callbacks = {
        callInfo: {
          method: 'Feature.getParentOverlays'
        },
        source: 'mocha',
        args: {},
        onSuccess: successSpy,
        onError: errorSpy
      };

      var details = {
        successes: {
          feature: [
            {
              name: 'acm',
              featureId: '2341',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_ACM},
              data: {symbolCode: 'S--------------'}
            }, {
              name: 'circle',
              featureId: '1234',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE}
            }
          ],
          overlay: [
            {
              name: 'parentOverlay',
              overlayId: '5678-1234-DEF0-9ABC'
            }
          ]
        }
      };

      var failures = [];

      sandbox.stub(emp3.api, 'convertGeoJsonToCMAPIPositions').returns({latitude: 0, longitude: 0});
      sandbox.stub(emp3.api, 'convertCMAPIPropertiesToFeature');

      broker.process(callbacks, details, failures);

      successSpy.should.have.been.calledWith({
        overlays: sinon.match.array
      });

      errorSpy.should.not.have.been.called;
      var overlays = successSpy.firstCall.args[0].overlays;
      overlays.should.have.length(1);
      overlays[0].name.should.equal(details.successes.overlay[0].name);
    });
  });
  describe('Overlay.getFeatures', function () {
    it('runs the onSuccess callback for Overlay.getFeatures calls when no errors are present', function () {
      var successSpy = sandbox.spy();
      var errorSpy = sandbox.spy();

      var callbacks = {
        callInfo: {
          method: 'Overlay.getFeatures'
        },
        source: 'mocha',
        args: {},
        onSuccess: successSpy,
        onError: errorSpy
      };

      var details = {
        successes: {
          feature: [
            {
              name: 'acm',
              featureId: '2341',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_ACM},
              data: {symbolCode: 'S--------------'}
            }, {
              name: 'circle',
              featureId: '1234',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE}
            }, {
              name: 'ellipse',
              featureId: '3412',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE}
            }, {
              name: 'symbol',
              featureId: '2415',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL},
              data: {symbolCode: 'S--------------'}
            }, {
              name: 'path',
              featureId: '4123',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_PATH}
            }, {
              name: 'point',
              featureId: '1324',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_POINT}
            }, {
              name: 'polygon',
              featureId: '3421',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_POLYGON}
            }, {
              name: 'rectangle',
              featureId: '1342',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE}
            }, {
              name: 'square',
              featureId: '2413',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_SQUARE}
            }, {
              name: 'text',
              featureId: '1423',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_TEXT}
            }
          ]
        }
      };

      var failures = [];

      sandbox.stub(emp3.api, 'convertGeoJsonToCMAPIPositions').returns({latitude: 0, longitude: 0});
      sandbox.stub(emp3.api, 'convertCMAPIPropertiesToFeature');

      broker.process(callbacks, details, failures);

      successSpy.should.have.been.calledWithMatch({
        features: sinon.match.array
      });

      errorSpy.should.not.have.been.called;
      var features = successSpy.firstCall.args[0].features;
      for (var feature in features) {
        features[feature].should.have.property('name', details.successes.feature[feature].name);
        features[feature].should.have.property('geoId', details.successes.feature[feature].featureId);
        features[feature].should.have.property('featureType', details.successes.feature[feature].properties.featureType);
      }
    });

  });

  describe('Overlay.getChildren', function () {
    it('runs the onSuccess callback for Overlay.getChildren calls when no errors are present', function () {
      var successSpy = sandbox.spy();
      var errorSpy = sandbox.spy();

      var callbacks = {
        callInfo: {
          method: 'Overlay.getChildren'
        },
        source: 'Mocha',
        args: {},
        onSuccess: successSpy,
        onError: errorSpy
      };

      var details = {
        successes: {
          feature: [
            {
              name: 'acm',
              featureId: '2341',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_ACM},
              data: {symbolCode: 'S--------------'}
            }, {
              name: 'circle',
              featureId: '1234',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE}
            }
          ],
          overlay: [
            {
              name: 'overlay 1',
              featureId: 'overlayId'
            }
          ]
        }
      };

      var failures = [];

      sandbox.stub(emp.wms.manager, 'getWmsOverlayId').returns('rootLayer');
      sandbox.stub(emp.instanceManager, 'getInstance').returns({
        engines: {
          getDefaultLayerOverlayID: sandbox.stub().returns('wmsLayer')
        }
      });
      sandbox.stub(emp3.api, 'convertGeoJsonToCMAPIPositions').returns({latitude: 0, longitude: 0});
      sandbox.stub(emp3.api, 'convertCMAPIPropertiesToFeature');

      broker.process(callbacks, details, failures);

      successSpy.should.have.been.calledWith({
        overlays: sinon.match.array,
        features: sinon.match.array
      });

      successSpy.firstCall.args[0].overlays.should.have.length(1);
      successSpy.firstCall.args[0].features.should.have.length(2);
      errorSpy.should.not.have.been.called;
    });
  });

  describe('Map.getChildren', function () {
    it('returns all overlays that are direct children of the map', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;
      map.geoId = '1234-5678-9ABC-DEF0';

      var callbacks = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy(),
        callInfo: {
          method: 'Map.getChildren'
        },
        source: map,
        args: {}
      };

      var details = {
        successes: {
          overlay: [],
          feature: []
        }
      };

      var failures = {};

      sandbox.stub(emp.wms.manager, 'getWmsOverlayId').returns('rootLayer');
      sandbox.stub(emp.instanceManager, 'getInstance').returns({
        engines: {
          getDefaultLayerOverlayID: sandbox.stub().returns('wmsLayer')
        }
      });

      broker.process(callbacks, details, failures);

      callbacks.onSuccess.should.have.been.called;
      callbacks.onError.should.not.have.been.called;
    });
  });

  describe('global.findOverlay', function () {
    it('returns a single overlay', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;
      map.geoId = '1234-5678-9ABC-DEF0';

      var callbacks = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy(),
        callInfo: {
          method: 'global.findOverlay'
        },
        source: 'global',
        args: {}
      };

      var details = {
        successes: {
          overlay: ['overlay1', 'overlay2']
        }
      };

      var failures = {};

      broker.process(callbacks, details, failures);

      callbacks.onSuccess.should.have.been.calledWithMatch({
        overlay: sinon.match.object
      });
      callbacks.onError.should.not.have.been.called;

    });
  });

  describe('global.findFeature', function () {
    it('returns a single feature', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;
      map.geoId = '1234-5678-9ABC-DEF0';

      var callbacks = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy(),
        callInfo: {
          method: 'global.findFeature'
        },
        source: 'global',
        args: {}
      };

      var details = {
        successes: {
          feature: [
            {
              name: 'circle',
              featureId: '1234',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE}
            },
            {
              name: 'circle',
              featureId: '5678',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE}
            }
          ]
        }
      };

      var failures = {};

      sandbox.stub(emp3.api, 'convertGeoJsonToCMAPIPositions').returns({latitude: 0, longitude: 0});
      sandbox.stub(emp3.api, 'convertCMAPIPropertiesToFeature');

      broker.process(callbacks, details, failures);

      callbacks.onSuccess.should.have.been.calledWithMatch({
        feature: sinon.match.object
      });
      callbacks.onError.should.not.have.been.called;

    });
  });

  describe('global.findContainer', function () {
    it('returns a feature in the container if the found object was a feature', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;
      map.geoId = '1234-5678-9ABC-DEF0';

      var callbacks = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy(),
        callInfo: {
          method: 'global.findContainer'
        },
        source: 'global',
        args: {}
      };

      var details = {
        successes: {
          feature: [
            {
              name: 'circle',
              featureId: '1234',
              properties: {featureType: emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE}
            }
          ]
        }
      };

      var failures = {};

      sandbox.stub(emp3.api, 'convertGeoJsonToCMAPIPositions').returns({latitude: 0, longitude: 0});
      sandbox.stub(emp3.api, 'convertCMAPIPropertiesToFeature');

      broker.process(callbacks, details, failures);

      callbacks.onSuccess.should.have.been.calledWithMatch({
        container: sinon.match.object
      });
      callbacks.onError.should.not.have.been.called;
    });

    it('returns an overlay in the container if the found object was an overlay', function () {
      var map = new emp3.api.Map({
        engine: engine,
        container: containerId
      });
      map.status = emp3.api.enums.MapStateEnum.MAP_READY;
      map.geoId = '1234-5678-9ABC-DEF0';

      var callbacks = {
        onSuccess: sandbox.spy(),
        onError: sandbox.spy(),
        callInfo: {
          method: 'global.findContainer'
        },
        source: 'global',
        args: {}
      };

      var details = {
        successes: {
          overlay: ['overlay1']
        }
      };

      var failures = {};

      broker.process(callbacks, details, failures);

      callbacks.onSuccess.should.have.been.calledWithMatch({
        container: sinon.match.object
      });
      callbacks.onError.should.not.have.been.called;
    });
  });
});
