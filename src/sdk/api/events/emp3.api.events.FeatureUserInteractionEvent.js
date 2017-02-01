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
 * @classdesc Generated when the user interacts with a {@link emp3.api.Feature} on a {@link emp3.api.Map}.
 * @extends emp3.api.events.UserInteractionEvent
 *
 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {emp3.api.enums.UserInteractionEventEnum} args.event - The enumeration value that identifies the type of mouse
 * input associated with this event.
 * @param {emp3.api.Feature[]} args.target - The feature(s) on which this event was triggered.
 * @param {ScreenCoord} args.point - The x,y coordinate of the screen location where this event occurred.
 * @param {emp3.api.GeoPosition} args.position - The geographic coordinate of the location where this event occurred.
 * @param {emp3.api.Map} args.map - The map on which this event was triggered.
 * @param {emp3.api.enums.UserInteractionMouseButtonEventEnum} args.button - The enumeration value that identifies the
 * mouse button associated with this event.
 * @param {emp3.api.enums.UserInteractionKeyEventEnum[]} args.keys - The enumeration values that identify the keyboard
 * buttons associated with this event.
 */
emp3.api.events.FeatureUserInteractionEvent = function (args) {
  args = args || {};
  args.type = emp3.api.enums.EventType.FEATURE_INTERACTION;
  emp3.api.events.UserInteractionEvent.call(this, args);
  /** @private */
  var _map = args.map;

  /**
   * An enumeration value of emp3.api.enums.EventType.FEATURE_INTERACTION specifying the type of event.
   * @const
   * @default emp3.api.enums.EventType.FEATURE_INTERACTION
   * @type {emp3.api.enums.EventType.FEATURE_INTERACTION}
   * @name emp3.api.events.FeatureUserInteractionEvent#type
   */
  this.type;
  /**
   * The enumeration value that identifies the type of mouse input associated with this event.
   * @type {emp3.api.enums.UserInteractionEventEnum}
   * @name emp3.api.events.FeatureUserInteractionEvent#event
   */
  this.event;
  /**
   * The feature(s) on which this event was triggered.
   * @type {emp3.api.Feature[]}
   * @name emp3.api.events.FeatureUserInteractionEvent#target
   */
  this.target;
  /**
   * The x,y coordinate of the screen location where this event occurred.
   * @type {ScreenCoord}
   * @name emp3.api.events.FeatureUserInteractionEvent#point
   */
  this.point;
  /**
   * The geographic coordinate of the location where this event occurred.
   * @type {emp3.api.GeoPosition}
   * @name emp3.api.events.FeatureUserInteractionEvent#position
   */
  this.position;
  /**
   * The enumeration value that identifies the mouse button associated with this event.
   * @type {emp3.api.enums.UserInteractionMouseButtonEventEnum}
   * @name emp3.api.events.FeatureUserInteractionEvent#button
   */
  this.button;
  /**
   * The enumeration values that identify the keyboard buttons associated with this event.
   * @type {emp3.api.enums.UserInteractionKeyEventEnum[]}
   * @name emp3.api.events.FeatureUserInteractionEvent#keys
   */
  this.keys;
  /**
   * The map on which this event was triggered.
   * @type {emp3.api.Map}
   * @name emp3.api.events.FeatureUserInteractionEvent#map
   */
  Object.defineProperty(this, "map", {
    enumerable: true,
    get: function () {
      return _map;
    }
  });
};

// Extend emp3.api.events.UserInteractionEvent
emp3.api.events.FeatureUserInteractionEvent.prototype = Object.create(emp3.api.events.UserInteractionEvent.prototype);