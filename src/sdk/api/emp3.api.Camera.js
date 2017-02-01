if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

/**
 * If args.camera is set, the constructor creates the Camera with the Camera encapsulated within.
 * @class
 * @augments cmapi.IGeoCamera
 * @classdesc This class provides the Camera functionality. It encapsulates a GeoCamera.
 *
 * @param {Object} [args] Parameters are provided as members of the arg object and may contain any properties listed
 * here or inherited from {@link cmapi.IGeoCamera}.
 *
 * @example
 * var cam = new emp3.api.Camera({
 *  latitude: 37.5,
 *  longitude: 18.2,
 *  altitude: 1000,
 *  heading: 47
 * });
 */
emp3.api.Camera = function (args) {
  cmapi.inherit(new cmapi.IGeoCamera(args), this);

  args = args || {};

  if (typeof args.latitude !== 'undefined' && typeof args.latitude !== 'number') {
    throw new TypeError('Invalid argument: expected latitude to be a number');
  } else if (args.latitude > 90.0 || args.latitude < -90.0) {
    throw new Error('Invalid latitude: latitude must be between 90.0 and -90.0');
  }

  if (typeof args.longitude !== 'undefined' && typeof args.longitude !== 'number') {
    throw new TypeError('Invalid argument: expected longitude to be a number');
  } else if (args.longitude > 180.0 || args.longitude < -180.0) {
    throw new Error('Invalid longitude: longitude must be between 180.0 and -180.0');
  }

  if (typeof args.altitude !== 'undefined' && typeof args.altitude !== 'number') {
    throw new TypeError('Invalid argument: expected altitude to be a number');
  }
  if (typeof args.roll !== 'undefined' && typeof args.roll !== 'number') {
    throw new TypeError('Invalid argument: expected roll to be a number');
  }
  if (typeof args.heading !== 'undefined' && typeof args.heading !== 'number') {
    throw new TypeError('Invalid argument: expected heading to be a number');
  }
  if (typeof args.tilt !== 'undefined' && typeof args.tilt !== 'number') {
    throw new TypeError('Invalid argument: expected tilt to be a number');
  }
  if (typeof args.altitudeMode !== 'undefined') {
    var validMode = false;
    for (var mode in cmapi.enums.altitudeMode) {
      if (args.altitudeMode === cmapi.enums.altitudeMode[mode]) {
        validMode = true;
        break;
      }
    }
    if (!validMode) {
      throw new Error('Invalid Argument: altitudeMode is not valid');
    }
  } else {
    // set altitudeMode to absolute if not set.
    args.altitudeMode = cmapi.enums.altitudeMode.ABSOLUTE;
  }

  this.patchProps(args);
};

/**
 * This method adds an event listener to the camera.
 * @param {object} args
 * @param {function} args.callback
 * @param args.eventType
 */
emp3.api.Camera.prototype.addCameraEventListener = function (args) {
  args = args || {};

  if (!args.callback) {
    throw new Error("Missing argument: callback");
  }

  if (typeof args.eventType === 'undefined') {
    throw new Error("Missing argument: eventType");
  }

  emp3.api.MessageHandler.getInstance().addEventListener({
    id: this.geoId,
    event: args.eventType,
    callback: args.callback
  });

  return args.callback;
};

/**
 * This method must be used to remove the registration from the system
 * @param {object} args
 * @param {function} args.callback
 * @param args.eventType
 */
emp3.api.Camera.prototype.removeEventListener = function (args) {
  args = args || {};

  if (typeof args.eventType === 'undefined') {
    throw new Error("Missing argument: eventType");
  }

  if (!args.callback) {
    throw new Error("Missing argument: callback");
  }

  emp3.api.MessageHandler.getInstance().removeEventListener({
    id: this.geoId,
    event: args.eventType,
    callback: args.callback
  });

  return args.callback;
};

/**
 * This method causes any changes done with the camera settings to be applied to any maps using the camera.
 */
emp3.api.Camera.prototype.apply = function () {
  if (this.latitude > 90.0 || this.latitude < -90.0) {
    throw new Error('Invalid latitude: latitude must be between 90.0 and -90.0');
  }
  if (this.longitude > 180.0 || this.longitude < -180.0) {
    throw new Error('Invalid longitude: longitude must be between 180.0 and -180.0');
  }

  var maps = emp3.api.CameraManager.getMapsForCamera({camera: this});

  for (var mapIt in maps) {
    var map = emp3.api.MessageHandler.getInstance().lookupMap(maps[mapIt]);
    if (map.getCamera().geoId === this.geoId) {
      var cmd = {
        cmd: emp3.api.enums.channel.centerOnLocation,
        camera: this
      };

      emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
        mapId: map.geoId,
        source: this,
        method: "Camera.apply",
        args: this
      });
    }
  }
};

/**
 * This method copies all settings from the camera object provided
 * This will exclude geoId
 *
 * @param {emp3.api.Camera} camera
 */
emp3.api.Camera.prototype.copySettingsFrom = function (camera) {
  if (typeof camera === 'undefined') {
    throw new Error('Missing argument: camera');
  }
  if (!(camera instanceof emp3.api.Camera)) {
    throw new TypeError('Invalid argument: camera is not of type emp3.api.Camera');
  }

  for (var prop in camera) {
    if (camera.hasOwnProperty(prop) && prop !== 'geoId') {
      this[prop] = camera[prop];
    }
  }
};
