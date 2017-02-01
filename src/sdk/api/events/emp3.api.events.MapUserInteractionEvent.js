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
 * @classdesc Generated when the user interacts with a {@link emp3.api.Map}.
 * @extends emp3.api.events.UserInteractionEvent
 *
 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {emp3.api.enums.UserInteractionEventEnum} args.event - The enumeration value that identifies the type of mouse
 * input associated with this event.
 * @param {emp3.api.Map} args.target - The map on which this event was triggered.
 * @param {ScreenCoord} args.point - The x,y coordinate of the screen location where this event occurred.
 * @param {emp3.api.GeoPosition} args.position - The geographic coordinate of the location where this event occurred.
 * @param {emp3.api.enums.UserInteractionMouseButtonEventEnum} args.button - The enumeration value that identifies the
 * mouse button associated with this event.
 * @param {emp3.api.enums.UserInteractionKeyEventEnum[]} args.keys - The enumeration values that identify the keyboard
 * buttons associated with this event.
 */
emp3.api.events.MapUserInteractionEvent = function(args) {
  args = args || {};
  args.type = emp3.api.enums.EventType.MAP_INTERACTION;
  emp3.api.events.UserInteractionEvent.call(this, args);

  /**
   * An enumeration value of emp3.api.enums.EventType.MAP_INTERACTION specifying the type of event.
   * @const
   * @default emp3.api.enums.EventType.MAP_INTERACTION
   * @type {emp3.api.enums.EventType.MAP_INTERACTION}
   * @name emp3.api.events.MapUserInteractionEvent#type
   */
  this.type;
  /**
   * The enumeration value that identifies the type of mouse input associated with this event.
   * @type {emp3.api.enums.UserInteractionEventEnum}
   * @name emp3.api.events.MapUserInteractionEvent#event
   */
  this.event;
  /**
   * The map on which this event was triggered.
   * @type {emp3.api.Map}
   * @name emp3.api.events.MapUserInteractionEvent#target
   */
  this.target;
  /**
   * The x,y coordinate of the screen location where this event occurred.
   * @type {ScreenCoord}
   * @name emp3.api.events.MapUserInteractionEvent#point
   */
  this.point;
  /**
   * The geographic coordinate of the location where this event occurred.
   * @type {emp3.api.GeoPosition}
   * @name emp3.api.events.MapUserInteractionEvent#position
   */
  this.position;
  /**
   * The enumeration value that identifies the mouse button associated with this event.
   * @type {emp3.api.enums.UserInteractionMouseButtonEventEnum}
   * @name emp3.api.events.MapUserInteractionEvent#button
   */
  this.button;
  /**
   * The enumeration values that identify the keyboard buttons associated with this event.
   * @type {emp3.api.enums.UserInteractionKeyEventEnum[]}
   * @name emp3.api.events.MapUserInteractionEvent#keys
   */
  this.keys;
};

// Extend emp3.api.events.UserInteractionEvent
emp3.api.events.MapUserInteractionEvent.prototype = Object.create(emp3.api.events.UserInteractionEvent.prototype);