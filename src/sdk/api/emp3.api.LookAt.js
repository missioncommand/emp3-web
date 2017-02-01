if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}
/**
 * @extends {cmapi.IGeoLookAt}
 *
 * This class defines a virtual camera which will focus on a location. The locations position is described with latitude,
 * longitude, and altitude. The camera will be placed according to three parameters: range, tilt, and heading.
 * @class
 * @param {Object} [args] Parameters are provided as members of the arg object and may contain any properties listed
 * here or inherited from {@link cmapi.IGeoLookAt}.
 * @param {boolean} [args.animate] Animate the transition to the point or go directly there
 *
 * @example <caption>View the Eiffel Tower from the East from half a kilometer</caption>
 * var eiffelTower = new emp3.api.LookAt({
 *  latitude: 48.8584,
 *  longitude: 2.2945,
 *  altitude: 300,
 *  heading: 90,
 *  tilt: 15,
 *  range: 500
 * });
 *
 * map.setLookAt({
 *  lookAt: eiffelTower,
 *  onSuccess: function() {
 *
 *  }
 * });
 */
emp3.api.LookAt = function (args) {
  args = args || {};

  cmapi.inherit(new cmapi.IGeoLookAt(args), this);

  if (typeof args.latitude !== 'undefined' && typeof args.latitude !== 'number') {
    throw new TypeError('Invalid argument: expected latitude to be a number');
  } else if (args.latitude > 90.0 || args.latitude < -90.0) {
    throw new Error('Invalid argument: expected latitude to be between 90.0 and -90.0');
  }

  if (typeof args.longitude !== 'undefined' && typeof args.longitude !== 'number') {
    throw new TypeError('Invalid argument: expected longitude to be a number');
  } else if (args.longitude > 180.0 || args.longitude < -180.0) {
    throw new Error('Invalid argument: expected longitude to be between 180.0 and -180.0');
  }

  if (typeof args.altitude !== 'undefined' && typeof args.altitude !== 'number') {
    throw new TypeError('Invalid argument: expected altitude to be a number');
  }
  if (typeof args.range !== 'undefined' && typeof args.range !== 'number') {
    throw new TypeError('Invalid argument: expected range to be a number');
  }
  if (typeof args.heading !== 'undefined' && typeof args.heading !== 'number') {
    throw new TypeError('Invalid argument: expected heading to be a number');
  }
  if (typeof args.tilt !== 'undefined') {
    if (typeof args.tilt !== 'number') {
      throw new TypeError('Invalid argument: expected tilt to be a number');
    } else if (args.tilt < 0.0 || args.tilt > 180.0) {
      throw new Error('Invalid argument: valid tilt values are between 0.0 and 180.0');
    }
  }

  if (typeof args.altitudeMode !== 'undefined') {
    var validMode = false;
    for (var mode in cmapi.enums.altitudeMode) {
      if (cmapi.enums.altitudeMode.hasOwnProperty(mode)){
        if (args.altitudeMode === cmapi.enums.altitudeMode[mode]) {
          validMode = true;
          break;
        }
      }
    }
    if (!validMode) {
      throw new Error('Invalid Argument: altitudeMode is not valid');
    }
  } else {
    // if no value is set for altitudeMode set value to absolute.
    args.altitudeMode = cmapi.enums.altitudeMode.ABSOLUTE;
  }

  this.patchProps(args);
};

/**
 * This method causes any changes done to the LookAt settings to be applied to any map or object that it may be
 * associated with.
 */
emp3.api.LookAt.prototype.apply = function() {

  if (this.tilt < 0.0 || this.tilt > 180.0) {
    throw new Error('Invalid tilt value: expected tilt to be between 0.0 and 180.0');
  }

  if (this.latitude > 90.0 || this.latitude < -90.0) {
    throw new Error('Invalid latitude: expected latitude to be between 90.0 and -90.0');
  }

  if (this.longitude > 180 || this.longitude < -180.0) {
    throw new Error('Invalid longitude: expected longitude to be between 180.0 and -180.0');
  }

  var maps = emp3.api.LookAtManager.getMapsForLookAt({lookAt:this});

  for (var mapIt in maps) {
    var map = emp3.api.MessageHandler.getInstance().lookupMap(maps[mapIt]);
    if (map.getLookAt().geoId === this.geoId) {
      var cmd = {
          cmd: emp3.api.enums.channel.lookAtLocation,
          lookAt: this
      };

      emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
        mapId: map.geoId,
        source: this,
        method: "LookAt.apply",
        args: this
      });
    }
  }
};

/**
 * This method copies all settings from the LookAt object provided.
 * This will exclude geoId
 *
 * @param {emp3.api.LookAt} lookAt
 */
emp3.api.LookAt.prototype.copySettingsFrom = function(lookAt) {
  if (!lookAt) {
   throw new Error('Missing Argument: lookAt');
  }

  if (!(lookAt instanceof emp3.api.LookAt)) {
    throw new TypeError('Invalid Argument: Expected emp3.api.LookAt');
  }

  for (var prop in lookAt) {
    if (lookAt.hasOwnProperty(prop) && prop !== 'geoId') {
      this[prop] = lookAt[prop];
    }
  }
};
