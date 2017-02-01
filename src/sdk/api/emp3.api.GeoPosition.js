if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}
/**
 * @class
 * @extends {cmapi.IGeoPosition}
 * @classdesc This class represents a {@link cmapi.IGeoPosition}
 * @param {Object} [args] Parameters are provided as members of the arg object and may contain any properties listed
 * here or inherited from {@link cmapi.IGeoPosition}.
 */
emp3.api.GeoPosition = function (args) {
  args = args || {};
  cmapi.inherit(new cmapi.IGeoPosition(), this);

  if (typeof args.latitude !== 'number') {
    args.latitude = new cmapi.IGeoPosition().latitude;
  } else if (args.latitude > 90.0 || args.latitude < -90.0) {
    throw new Error('Invalid latitude: latitude must be between 90.0 and -90.0');
  }

  if (typeof args.longitude !== 'number') {
    args.longitude = new cmapi.IGeoPosition().longitude;
  } else if (args.longitude > 180.0 || args.longitude < -180.0) {
    throw new Error('Invalid longitude: longitude must be between 180.0 and -90.0');
  }

  if (typeof args.altitude !== 'number') {
    args.altitude = new cmapi.IGeoPosition().altitude;
  }

  this.patchProps(args);
};
