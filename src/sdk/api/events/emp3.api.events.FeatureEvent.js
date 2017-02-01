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
 *
 * @class
 * @classdesc Generated when a {@link emp3.api.Feature} selection state changes.
 * @extends {emp3.api.events.Event}
 *
 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {emp3.api.enums.FeatureEventEnum} args.event - The enumeration value that identifies the selection state
 * associated with this event.
 * @param {emp3.api.Feature} args.target - The feature object this event was generated on.
 */
emp3.api.events.FeatureEvent = function (args) {
  args = args || {};
  args.type = emp3.api.enums.EventType.FEATURE_EVENT;
  emp3.api.events.Event.call(this, args);

  /**
   * An enumeration value of emp3.api.enums.EventType.FEATURE_EVENT specifying the type of event.
   * @const
   * @default emp3.api.enums.EventType.FEATURE_EVENT
   * @type {emp3.api.enums.EventType.FEATURE_EVENT}
   * @name emp3.api.events.FeatureEvent#type
   */
  this.type;
  /**
   * The enumeration value that identifies the selected state associated with this event.
   * @type {emp3.api.enums.FeatureEventEnum}
   * @name emp3.api.events.FeatureEventEnum#event
   */
  this.event;
  /**
   * The feature object being edited that this event was generated on.
   * @type {emp3.api.Feature}
   * @name emp3.api.events.FeatureEvent#target
   */
  this.target;
};

// Extend emp3.api.events.Event
emp3.api.events.FeatureEvent.prototype = Object.create(emp3.api.events.Event.prototype);
