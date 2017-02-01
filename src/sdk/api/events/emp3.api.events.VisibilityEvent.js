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
 * @classdesc Generated when an {@link emp3.api.Overlay} or {@link emp3.api.Feature}
 * visibility is altered on a specific map.
 * @extends emp3.api.events.Event
 *
 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {emp3.api.enums.VisibilityStateEnum} args.event - The enumeration value that identifies the visibility state associated with this event.
 * @param {emp3.api.Overlay|emp3.api.Feature} args.target - The container object this event was generated on.
 * @param {emp3.api.Map|emp3.api.Overlay|emp3.api.Feature} args.parent - The parent container that contains the target container.
 * @param {emp3.api.Map} args.map - The map on which the visibility event was triggered.
 */
emp3.api.events.VisibilityEvent = function(args) {
  args = args || {};
  args.type = emp3.api.enums.EventType.VISIBILITY;
  emp3.api.events.Event.call(this, args);
  /** @private */
  var _map = args.map,
      /** @private */
      _parent = args.parent;

  /**
   * An enumeration value of emp3.api.enums.EventType.VISIBILITY specifying the type of event.
   * @const
   * @default emp3.api.enums.EventType.VISIBILITY
   * @type {emp3.api.enums.EventType.VISIBILITY}
   * @name emp3.api.events.VisibilityEvent#type
   */
  this.type;
  /**
   * The enumeration value that identifies the visibility state associated with this event.
   * @type {emp3.api.enums.VisibilityStateEnum}
   * @name emp3.api.events.VisibilityEvent#event
   */
  this.event;
  /**
   * The container object this event was generated on.
   * @type {emp3.api.Overlay|emp3.api.Feature}
   * @name emp3.api.events.VisibilityEvent#target
   */
  this.target;
  /**
   * The parent container that contains the target container.
   * @type {emp3.api.Map|emp3.api.Overlay|emp3.api.Feature}
   * @name emp3.api.events.VisibilityEvent#parent
   */
  Object.defineProperty(this, "parent", {
    enumerable: true,
    get: function () {
      return _parent;
    }
  });
  /**
   * The map on which the visibility event was triggered.
   * @type {emp3.api.Map}
   * @name emp3.api.events.VisibilityEvent#map
   */
  Object.defineProperty(this, "map", {
    enumerable: true,
    get: function () {
      return _map;
    }
  });
};

// Extend emp3.api.events.Event
emp3.api.events.VisibilityEvent.prototype = Object.create(emp3.api.events.Event.prototype);

/**
 * Returns true if the target container is a {@link emp3.api.Feature}.
 * @returns {boolean}
 */
emp3.api.events.VisibilityEvent.prototype.targetIsFeature = function() {
  return emp3.api.isFeature(this.target);
};

/**
 * Returns true if the target container is an {@link emp3.api.Overlay}.
 * @returns {boolean}
 */
emp3.api.events.VisibilityEvent.prototype.targetIsOverlay = function() {
  return emp3.api.isOverlay(this.target);
};