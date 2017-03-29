var emp = window.emp || {};
emp.typeLibrary = emp.typeLibrary || {};

/**
 * @class
 * @description The class represents a view change request or a view change event.
 * A map implementation should never create an instance of this class.
 * @param  {emp.typeLibrary.LookAt.ParameterType} args Used to populate the view object
 * @param args.channel
 * @param args.transactionId
 */

emp.typeLibrary.LookAt = function(args) {
  this.globalType = emp.typeLibrary.types.VIEW;
  this.transactionId = args.transactionId;
  this.sender = args.sender;
  this.requester = args.sender;
  this.channel = args.channel;
  /* View by Id */
  this.overlayId = args.overlayId;

  this.range = args.range ? args.range : 100000;

  this.latitude = args.latitude ? args.latitude : 0;
  this.longitude = args.longitude ? args.longitude : 0;
  this.altitude = args.altitude ? args.altitude : 0;

  this.tilt = args.tilt ? args.tilt : 0;
  this.heading = args.heading ? args.heading : 0;
  this.animate = args.animate ? args.animate : false;

  this.altitudeMode = args.altitudeMode ? args.altitudeMode : emp.constant.featureAltitudeModeType.CLAMP_TO_GROUND;

  this.coreId = args.coreId;
};

emp.typeLibrary.LookAt.prototype.validate = emp.typeLibrary.base.validate;

/**
 * @typedef {object} emp.typeLibrary.LookAt.ParameterType
 *
 * @property {string} overlayId - The overlayId is the id for the overlay to be centered on.
 * @property {number} [range=100000] - The distance at which the view point should be placed.
 * @property {number} [tilt=0] - The tilt is the camera's angle on the x-axis.
 * @property {number} [heading=0] - The heading is the camera's angle on the z-axis.
 * @property {number} [latitude=0] - Latitude of the LookAt
 * @property {number} [longitude=0] - Longitude of the LookAt
 * @property {number} [altitude=0] - Altitude of the LookAt
 * @property {emp.constant.featureAltitudeModeType} [altitudeMode=emp.constant.featureAltitudeModeType.CLAMP_TO_GROUND]
 * @property {boolean} [animate = false] - Animate the map when moving to the location
 */