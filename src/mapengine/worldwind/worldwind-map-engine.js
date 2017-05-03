var EMPWorldWind = window.EMPWorldWind || {};
var emp = window.emp || {};
emp.engineDefs = emp.engineDefs || {};


/**
 * @classdesc EMP3 WorldWind Map Engine Interface
 *
 * @class Instantiates a WorldWind map for EMP
 * @param args
 * @returns {engineInterface}
 */
emp.engineDefs.worldWindMapEngine = function(args) {

  var empMapInstance = args.mapInstance;
  /** @type EMPWorldWind.Map# */
  var empWorldWind;

  var engineInterface = emp.map.createEngineTemplate(),
    mapEngineExposed = engineInterface;

  engineInterface.implementation.displayName = "WorldWind Map Engine";
  engineInterface.implementation.version = "1.0.0";
  engineInterface.capabilities.mapType.type3D = true;
  engineInterface.capabilities.mapType.type2_5D = true;
  engineInterface.capabilities.mapType.type3D = true;
  engineInterface.capabilities.formats.GEOJSON_BASIC.plot = true;
  engineInterface.capabilities.formats.GEOJSON_BASIC.draw = true;
  engineInterface.capabilities.formats.GEOJSON_BASIC.edit = true;
  engineInterface.capabilities.formats.GEOJSON_FULL.plot = true;
  engineInterface.capabilities.formats.GEOJSON_FULL.edit = true;
  engineInterface.capabilities.formats.WMS.version_1_1 = true;
  engineInterface.capabilities.formats.WMS.version_1_3 = true;
  engineInterface.capabilities.formats.WMS.elevationData = true;
  engineInterface.capabilities.formats.KML_BASIC.plot = true;
  engineInterface.capabilities.formats.KML_BASIC.draw = true;
  engineInterface.capabilities.formats.KML_BASIC.edit = true;
  engineInterface.capabilities.formats.KML_COMPLEX.plot = true;
  engineInterface.capabilities.formats.IMAGE.plot = true;
  engineInterface.capabilities.formats.MILSTD.version2525B.plot = true;
  engineInterface.capabilities.formats.MILSTD.version2525B.draw = true;
  engineInterface.capabilities.formats.MILSTD.version2525B.edit = true;
  engineInterface.capabilities.formats.MILSTD.version2525C.plot = true;
  engineInterface.capabilities.formats.MILSTD.version2525C.draw = true;
  engineInterface.capabilities.formats.MILSTD.version2525C.edit = true;
  engineInterface.capabilities.formats.AIRSPACE.plot = true;
  engineInterface.capabilities.formats.AIRSPACE.draw = true;
  engineInterface.capabilities.formats.AIRSPACE.edit = true;
  engineInterface.capabilities.formats.AOI.plot = true;
  engineInterface.capabilities.formats.AOI.draw = true;
  engineInterface.capabilities.formats.AOI.edit = true;
  engineInterface.capabilities.settings.milstd.iconSize = true;
  engineInterface.capabilities.settings.milstd.labelOption = true;
  engineInterface.requirements.wmsCapabilities = true;
  engineInterface.capabilities.projection.flat = false;

  /**
   * Initialization
   * @param {EMPWorldWind.Map} empWorldWindInstance
   */
  engineInterface.initialize.succeed = function(empWorldWindInstance) {
    // Add initialization code here
    try {
      empWorldWind = empWorldWindInstance;
      empWorldWind.mapEngineExposed = mapEngineExposed;
      emp.map.engineDirect = {name: "worldwind", ref: empWorldWind};

      // Notify application that the map is ready to receive data
      empMapInstance.eventing.StatusChange({
        status: emp.map.states.READY
      });
    }
    catch (err) {
      window.console.error("Error initializing WorldWind ", err);
    }
  };

  /**
   * Indicates a failed loading
   */
  engineInterface.initialize.fail = function() {
    empMapInstance.eventing.StatusChange({
      status: emp.map.states.MAP_INSTANCE_INIT_FAILED
    });
  };

  /**
   * @todo drop this functionality into the map itself and expose a simpler call
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.view.set = function(transaction) {
    var args, altitude, bottomLeft, topRight, feature, bufferScale,
      t1, t2,
      toRad = Math.PI / 180.0; // save a few divisions later

    switch (transaction.items[0].globalType) {
      case "view":
        if (transaction.items[0].location) {
          // Set camera
          args = {
            latitude: transaction.items[0].location.lat,
            longitude: transaction.items[0].location.lon,
            altitude: transaction.items[0].altitude,
            tilt: transaction.items[0].tilt,
            roll: transaction.items[0].roll,
            heading: transaction.items[0].heading
          };
        }
        else if (transaction.items[0].bounds) {
          // Zoom to overlay

          // Express lat/lon as radians
          bottomLeft = {
            lat: transaction.items[0].bounds.west * toRad,
            lon: transaction.items[0].bounds.south * toRad
          };

          topRight = {
            lat: transaction.items[0].bounds.east * toRad,
            lon: transaction.items[0].bounds.north * toRad
          };

          t1 = Math.pow(Math.sin((topRight.lat - bottomLeft.lat) / 2), 2);
          t2 = Math.pow(Math.sin((topRight.lon - bottomLeft.lon) / 2), 2);

          // Haversine formula
          // TODO see if we can replace this with WorldWind functionality
          altitude = 2 * WorldWind.EARTH_RADIUS * Math.asin(Math.sqrt(t1 + Math.cos(topRight.lat) * Math.cos(bottomLeft.lat) * t2));

          args = {
            latitude: (transaction.items[0].bounds.north + transaction.items[0].bounds.south) / 2,
            longitude: (transaction.items[0].bounds.east + transaction.items[0].bounds.west) / 2,
            altitude: altitude,
            tilt: 0,
            roll: 0,
            heading: 0
          };
        }
        break;
      case "feature":
        bufferScale = 2.25; // Assume conic view from the camera
        feature = transaction.items[0];
        switch (feature.format) {
          case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
            altitude = feature.properties.radius * bufferScale;
            break;
          case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
            altitude = Math.max(feature.properties.semiMajor, feature.properties.semiMinor) * bufferScale;
            break;
          case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
            altitude = Math.max(feature.properties.width, feature.properties.height) * bufferScale;
            break;
          case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
            altitude = feature.properties.width * bufferScale;
            break;
          case emp3.api.enums.FeatureTypeEnum.GEO_ACM: // TODO compute bounding box diagonal distance
          default:
            altitude = 10000; // Default to 10000m
        }

        args = {
          latitude: transaction.items[0].coordinates[1],
          longitude: transaction.items[0].coordinates[0],
          altitude: altitude,
          tilt: 0,
          roll: 0,
          heading: 0
        };
        break;
      default:
        transaction.failures.push(transaction.items[0]);
    }

    // Check if we are animating
    if (transaction.items[0].animate === true) {
      transaction.pause();

      args.animate = true;
      args.animateCB = function() {

        // If we animated update the returned values
        transaction.items[0].location = {
          lat: empWorldWind.getCenter().latitude,
          lon: empWorldWind.getCenter().longitude
        };
        transaction.items[0].bounds = empWorldWind.getBounds();

        transaction.run();
        // Notify movement ended
        EMPWorldWind.eventHandlers.notifyViewChange.call(empWorldWind, emp3.api.enums.CameraEventEnum.CAMERA_MOTION_STOPPED);
      };
    }

    // Notify start of movement
    EMPWorldWind.eventHandlers.notifyViewChange.call(empWorldWind, emp3.api.enums.CameraEventEnum.CAMERA_IN_MOTION);
    empWorldWind.centerOnLocation(args);

    // Set initial transaction return values, to be overwritten if the move is animated
    transaction.items[0].location = {
      lat: empWorldWind.getCenter().latitude,
      lon: empWorldWind.getCenter().longitude
    };
    transaction.items[0].bounds = empWorldWind.getBounds();
  };

  /**
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.lookAt.set = function(transaction) {
    var args = {
      latitude: transaction.items[0].latitude,
      longitude: transaction.items[0].longitude,
      altitude: transaction.items[0].altitude,
      range: transaction.items[0].range,
      tilt: transaction.items[0].tilt,
      heading: transaction.items[0].heading
    };

    if (transaction.items[0].animate === true) {
      transaction.pause();

      args.animate = true;
      args.animateCB = function() {
        transaction.run();
        // Notify movement ended
        EMPWorldWind.eventHandlers.notifyViewChange.call(empWorldWind, emp3.api.enums.CameraEventEnum.CAMERA_MOTION_STOPPED);
      };
    }
    EMPWorldWind.eventHandlers.notifyViewChange.call(empWorldWind, emp3.api.enums.CameraEventEnum.CAMERA_IN_MOTION);

    empWorldWind.lookAt(args);
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.wms.add = function(transaction) {
    emp.util.each(transaction.items, function(wms) {
      empWorldWind.addWMS(wms);
    });
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.wms.remove = function(transaction) {
    emp.util.each(transaction.items, function(wms) {
      empWorldWind.removeWMS(wms);
    });
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.feature.add = function(transaction) {
    var feature,
      itemsCount = transaction.items.length;

    // Pause the transaction
    transaction.pause();

    while (itemsCount) {
      // Note pre-decrement
      feature = transaction.items[--itemsCount];

      empWorldWind.plotFeature(feature, function(featureCount, cbArgs) {
        if (!cbArgs.success) {
          transaction.fail(new emp.typeLibrary.Error({
            feature: cbArgs.feature
          }));
        }

        // All items have been processed
        if (featureCount === 0) {
          transaction.run();
        }
      }.bind(this, itemsCount));
    }
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.feature.remove = function(transaction) {
    var rc;

    emp.util.each(transaction.items, function(feature) {

      rc = empWorldWind.unplotFeature(feature);
      if (!rc.success) {
        transaction.fail(new emp.typeLibrary.Error({
          message: rc.message
        }));
      }
    });
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   * @deprecated
   */
  engineInterface.settings.mil2525.icon.labels.set = function(transaction) {
    empWorldWind.setLabelStyle(transaction.items[0]);
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.view.getLatLonFromXY = function(transaction) {
    var pickPoint = new WorldWind.Vec2(transaction.items[0].x, transaction.items[0].y);
    var terrainObject = empWorldWind.worldWindow.pickTerrain(pickPoint).terrainObject();
    transaction.items[0].lat = terrainObject ? terrainObject.position.latitude : undefined;
    transaction.items[0].lon = terrainObject ? terrainObject.position.longitude : undefined;
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.visibility.set = function(transaction) {
    emp.util.each(transaction.items, function(feature) {
      if (feature.featureId in empWorldWind.features) {
        empWorldWind.features[feature.featureId].setVisible(feature.visible);
      }
    });
    empWorldWind.refresh();
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.map.config = function(transaction) {
    var bRangeChanged;

    var configHandlers = {
      "brightness": function(value) {
        empWorldWind.setContrast(value);
      },
      "milStdIconLabels": function(value) {
        empWorldWind.setLabelStyle(value);
      },
      "renderingOptimization": function(value) {
        if (EMPWorldWind.utils.defined(value) && (value !== empWorldWind.enableRenderingOptimization)) {
          bRangeChanged = true;
          empWorldWind.enableRenderingOptimization = value;
        }
      },
      "midDistanceThreshold": function(value) {
        if (EMPWorldWind.utils.defined(value) && (value !== empWorldWind.singlePointAltitudeRanges.mid)) {
          bRangeChanged = true;
          empWorldWind.singlePointAltitudeRanges.mid = value;
        }
      },
      "farDistanceThreshold": function(value) {
        if (EMPWorldWind.utils.defined(value) && (value !== empWorldWind.singlePointAltitudeRanges.high)) {
          bRangeChanged = true;
          empWorldWind.singlePointAltitudeRanges.high = value;
          //empCesium.singlePointAltitudeRangeMode = cesiumEngine.utils.getSinglePointAltitudeRangeMode(empCesium.cameraAltitude, empCesium.singlePointAltitudeRanges);
          //empCesium.processOnRangeChangeSinglePoints();
        }
      },
      "selectionScale": function(value) {
        empWorldWind.setSelectionScale(value);
      },
      "selectionColor": function(value) {
        empWorldWind.setSelectionColor(value);
      },
      "iconSize": function(value) {
        empWorldWind.setIconSize(value);
      }
    };

    // Iterate through each transaction item, check for properties and apply them
    emp.util.each(transaction.items, function(config) {
      var prop, value;
      for (prop in config) {
        if (config.hasOwnProperty(prop)) {
          // Skip meta data fields
          if (prop === "messageId") {
            continue;
          }

          // Extract the value
          value = config[prop];

          // Check if there is a handler for the property
          if (configHandlers.hasOwnProperty(prop)) {
            // Apply the change
            configHandlers[prop](value);
          } else {
            transaction.fail(new emp.typeLibrary.Error({
              message: 'Config property ' + prop + ' is not supported by this engine'
            }));
          }

          if (bRangeChanged) {
            empWorldWind.singlePointAltitudeRangeMode = EMPWorldWind.utils.getSinglePointAltitudeRangeMode(empWorldWind.worldWindow.navigator.range, empWorldWind.singlePointAltitudeRanges);
            // force a render update when the altitude range changes
            empWorldWind.refresh();
          }
        }
      }
    });
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.navigation.enable = function(transaction) {
    empWorldWind.setLockState(transaction.items[0]);
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.selection.set = function(transaction) {
    var rc = empWorldWind.selectFeatures(transaction.items);
    transaction.failures = rc.failed;
  };

  /**
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.capture.screenshot = function(transaction) {
    return transaction.items[0].dataUrl = empWorldWind.screenshot();
  };

  /**
   * Destroys the current engine
   */
  engineInterface.state.destroy = function() {
    if (empWorldWind) {
      empWorldWind.shutdown();
      empWorldWind = undefined;
    }
  };

  /**
   * Creates a KML layer
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.kmllayer.add = function(transaction) {
    var items = transaction.items.length;

    /**
     * Resume the transaction once all items have been processed
     * @private
     */
    var _complete = function(args) {
      items--;

      if (!args.success) {
        transaction.failures.push(new emp.typeLibrary.Error({
          message: args.message,
          coreId: args.id
        }));
      }

      // There are other layers to add
      if (items > 0) {
        return;
      }

      transaction.run();
    };

    // Pause the transaction, KML is async in WorldWind
    transaction.pause();
    emp.util.each(transaction.items, function(kmlLayer) {
      empWorldWind.addKML(kmlLayer, _complete);
    });
  };

  /**
   * Remove a KML Layer
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.kmllayer.remove = function(transaction) {
    emp.util.each(transaction.items, function(kmlLayer) {
      empWorldWind.removeKML(kmlLayer);
    });
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.wmts.add = function(transaction) {
    var itemCount = transaction.items.length;

    // Pause the transaction, we have to manually get the capabilities
    transaction.pause();

    while (itemCount--) {
      empWorldWind.addWmtsToMap(transaction.items[itemCount], function(count, cbArgs) {
        if (!cbArgs.success) {
          transaction.fail(new emp.typeLibrary.Error(cbArgs));
        }

        if (count === 0) {
          transaction.run();
        }
      }.bind(this, itemCount));
    }
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.wmts.remove = function(transaction) {
    var failures = [];

    emp.util.each(transaction.items, function(wmts) {
      var rc = empWorldWind.removeWmtsFromMap(wmts);
      if (!rc.success) {
        failures.push(wmts);
      }
    });

    transaction.failures = failures;
  };

  // return the engineInterface object as a new engineTemplate instance
  return engineInterface;
};
