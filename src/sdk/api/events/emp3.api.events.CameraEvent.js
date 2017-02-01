if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}
if (!window.emp3.api.events) {
  emp3.api.events = {};
}

/**
 * @class
 * @classdesc Generated when a {@link emp3.api.Camera} is associated with a {@link emp3.api.Map} and the map's view changes.
 * @extends emp3.api.events.Event
 *
 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {emp3.api.enums.CameraEventEnum} args.event - The enumeration value that identifies the camera state associated
 * with this event.
 * @param {emp3.api.Camera} args.target - The camera object this event was generated on.
 */
emp3.api.events.CameraEvent = function(args) {
  args = args || {};
  args.type = emp3.api.enums.EventType.CAMERA_EVENT;
  emp3.api.events.Event.call(this, args);

  /**
   * An enumeration value of emp3.api.enums.EventType.CAMERA_EVENT specifying the type of event.
   * @const
   * @default emp3.api.enums.EventType.CAMERA_EVENT
   * @type {emp3.api.enums.EventType.CAMERA_EVENT}
   * @name emp3.api.events.CameraEvent#type
   */
  this.type;
  /**
   * The enumeration value that identifies the camera state associated with this event.
   * @type {emp3.api.enums.CameraEventEnum}
   * @name emp3.api.events.CameraEvent#event
   */
  this.event;
  /**
   * The camera object this event was generated on.
   * @type {emp3.api.Camera}
   * @name emp3.api.events.CameraEvent#target
   */
  this.target;
};

// Extend emp3.api.events.Event
emp3.api.events.CameraEvent.prototype = Object.create(emp3.api.events.Event.prototype);