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
 * @classdesc Generated when a {@link emp3.api.Feature} has been removed from a {@link emp3.api.Map}.
 * @extends emp3.api.events.Event
 *
 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {emp3.api.Map} args.target - The map on which this event was triggered.
 * @param {emp3.api.Feature[]} args.features - The features that were removed from the map.
 */
emp3.api.events.MapFeatureRemovedEvent = function(args) {
  args = args || {};
  args.type = emp3.api.enums.EventType.MAP_FEATURE_REMOVED;
  emp3.api.events.Event.call(this, args);
  /** @private */
  var _features = args.features;

  /**
   * An enumeration value of emp3.api.enums.EventType.MAP_FEATURE_REMOVED specifying the type of event.
   * @const
   * @default emp3.api.enums.EventType.MAP_FEATURE_REMOVED
   * @type {emp3.api.enums.EventType.MAP_FEATURE_REMOVED}
   * @name emp3.api.events.MapFeatureRemovedEvent#type
   */
  this.type;
  /**
   * The enumeration value that identifies the specific action/option associated with the event.
   * @type {Event.enum}
   * @name emp3.api.events.MapFeatureRemovedEvent#event
   */
  this.event;
  /**
   * The map on which this event was triggered.
   * @type {emp3.api.Map}
   * @name emp3.api.events.MapFeatureRemovedEvent#target
   */
  this.target;
  /**
   * The features that were added to the map.
   * @type {emp3.api.Feature[]}
   * @name emp3.api.events.MapFeatureRemovedEvent#features
   */
  Object.defineProperty(this, "features", {
    enumerable: true,
    get: function () {
      return _features;
    }
  });
};

// Extend emp3.api.events.Event
emp3.api.events.MapFeatureRemovedEvent.prototype = Object.create(emp3.api.events.Event.prototype);
