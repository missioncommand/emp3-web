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
 * @classdesc Generated when an update occurs on an {@link emp3.api.Overlay}.
 * @extends emp3.api.events.Event
 *
 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {emp3.api.Overlay} args.target - The overlay on which this event was triggered.
 */
emp3.api.events.OverlayUpdatedEvent = function(args) {
  args = args || {};
  args.type = emp3.api.enums.EventType.OVERLAY_CHANGE;
  emp3.api.events.Event.call(this, args);

  /**
   * An enumeration value of emp3.api.enums.EventType.OVERLAY_CHANGE specifying the type of event.
   * @const
   * @default emp3.api.enums.EventType.OVERLAY_CHANGE
   * @type {emp3.api.enums.EventType.OVERLAY_CHANGE}
   * @name emp3.api.events.OverlayUpdatedEvent#type
   */
  this.type;
  /**
   * The enumeration value that identifies the specific action/option associated with the event.
   * @type {Event.enum}
   * @name emp3.api.events.OverlayUpdatedEvent#event
   */
  this.event;
  /**
   * The overlay on which this event was triggered.
   * @type {emp3.api.Overlay}
   * @name emp3.api.events.OverlayUpdatedEvent#target
   */
  this.target;
};

// Extend emp3.api.events.Event
emp3.api.events.OverlayUpdatedEvent.prototype = Object.create(emp3.api.events.Event.prototype);