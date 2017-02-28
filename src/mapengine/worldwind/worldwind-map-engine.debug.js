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
  /** @type EMPWorldWind.map# */
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
   * @param {EMPWorldWind.map} empWorldWindInstance
   */
  engineInterface.initialize.succeed = function(empWorldWindInstance) {
    // Add initialization code here
    try {
      empWorldWind = empWorldWindInstance;
      //empWorldWind.empMapInstance = empMapInstance;
      empWorldWind.mapEngineExposed = mapEngineExposed;
      emp.map.engineDirect = {name: "worldwind", ref: empWorldWind};

      // Notify application that the map is ready to receive data
      empMapInstance.eventing.StatusChange({
        status: emp.map.states.READY
      });
    }
    catch (err) {
      window.console.error("Error initializing World Wind ", err);
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
        } else if (transaction.items[0].bounds) {
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
          case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
            // TODO compute bounding box diagonal distance
            break;
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
          default:
            altitude = undefined; // Remain at the current altitude
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

    // Set initial transaction return values, to be overwritten if the moved is animated
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
  engineInterface.overlay.add = function(transaction) {
    var item,
      result,
      length = transaction.items.length,
      failList = [];

    for (var i = 0; i < length; i += 1) {
      item = transaction.items[i];
      if (item.overlayId !== undefined) {
        var layer = empWorldWind.getLayer(item.overlayId);
        if (layer) {
          result = {
            success: false,
            message: "An overlay with this id (" + item.overlayId + ") already exists"
          };
        } else {
          try {
            var renderableLayer = new WorldWind.RenderableLayer(item.name),
              overlay = empWorldWind.addLayer(item.name, item.overlayId, null, EMPWorldWind.constants.LayerType.OVERLAY_LAYER, renderableLayer);

            var parentOverlay = empWorldWind.getLayer(item.parentCoreId);
            if (EMPWorldWind.utils.defined(parentOverlay)) {
              parentOverlay.addSubLayer(overlay);
            }

            empWorldWind.rootOverlayId = item.overlayId;
            result = {
              success: true,
              message: "New layer added to worldwind map"
            };
          } catch (e) {
            result = {
              success: false,
              message: "Failed to add layer to worldwind map."
            };
          }
        }
      } else {
        result = {
          success: false,
          message: "arguments sent to function are undefined."
        };
      }
    }

    if (!result.success) {
      failList.push(new emp.typeLibrary.Error({
        coreId: item.coreId,
        message: result.message,
        level: emp.typeLibrary.Error.level.MINOR
      }));
    }
    transaction.fail(failList);
    return result;
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.overlay.remove = function(transaction) {
    var result = {},
      failList = [];

    for (var i = 0; i < transaction.items.length; i += 1) {
      var item = transaction.items[i];
      result = empWorldWind.removeLayer(item.overlayId);
      if (!result.success) {
        failList.push(new emp.typeLibrary.Error({
          coreId: item.coreId,
          message: result.message,
          level: emp.typeLibrary.Error.level.MINOR,
          jsError: result.jsError
        }));
      }
    }
    transaction.fail(failList);
    return result;
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.wms.add = function(transaction) {
    var i, item,
      itemCount = transaction.items.length;
    for (i = 0; i < itemCount; i++) {
      item = transaction.items[i];
      if (empWorldWind.isV2Core) {
        item.useProxy = emp.util.config.getUseProxySetting();
      }
      empWorldWind.addWmsToMap(item);
    }
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.wms.remove = function(transaction) {
    var i, item,
      itemCount = transaction.items.length;
    for (i = 0; i < itemCount; i++) {
      item = transaction.items[i];
      empWorldWind.removeWmsFromMap(item);
    }
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.feature.add = function(transaction) {
    var i, item, result,
      itemCount = transaction.items.length;

    for (i = 0; i < itemCount; i++) {
      item = transaction.items[i];

      result = empWorldWind.plotFeature(item);
      if (!result.success) {
        result.feature = item;
        transaction.fail(new emp.typeLibrary.Error(result));
      }
    }
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.feature.remove = function(transaction) {
    var i,
      itemCount = transaction.items.length;

    for (i = 0; i < itemCount; i++) {
      empWorldWind.unplotFeature(transaction.items[i]);
    }
    empWorldWind.refresh();
  };

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
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
    var terrainObject = empWorldWind.worldWind.pickTerrain(pickPoint).terrainObject();
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
    var config = transaction.items[0];
    if (typeof config.brightness === "number") {
      empWorldWind.setContrast(config.brightness);
    }
  };

  /**
   *
   * @param transaction
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
   * @todo Need to get content of WorldWind renderer
   * @param {emp.typeLibrary.Transaction} transaction
   */
  engineInterface.capture.screenshot = function(transaction) {
    return transaction.items[0].dataUrl = empWorldWind.screenshot();
  };

  // return the engineInterface object as a new engineTemplate instance
  return engineInterface;
};