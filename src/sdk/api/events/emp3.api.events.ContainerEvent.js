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
 * @classdesc Generated when an action occurs on a {@link emp3.api.Container}.
 * @extends emp3.api.events.Event
 * 
 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {emp3.api.enums.ContainerEventEnum} args.event - The enumeration value that identifies the container action associated with this event.
 * @param {emp3.api.Container} args.target - The container object this event was generated on.
 * @param {emp3.api.Overlay[]|emp3.api.Feature[]} args.affectedChildren - The list of affected child container objects that
 * the {@link emp3.api.enums.ContainerEventEnum} action refers to.
 */
emp3.api.events.ContainerEvent = function(args) {
  args = args || {};
  args.type = emp3.api.enums.EventType.CONTAINER;
  emp3.api.events.Event.call(this, args);
  /** @private */
  var _affectedChildren = args.affectedChildren;

  /**
   * An enumeration value of emp3.api.enums.EventType.CONTAINER specifying the type of event.
   * @const
   * @default emp3.api.enums.EventType.CONTAINER
   * @type {emp3.api.enums.EventType.CONTAINER}
   * @name emp3.api.events.ContainerEvent#type
   */
  this.type;
  /**
   * The enumeration value that identifies the container action associated with this event.
   * @type {emp3.api.enums.ContainerEventEnum}
   * @name emp3.api.events.ContainerEvent#event
   */
  this.event;
  /**
   * The container object this event was generated on.
   * @type {emp3.api.Container}
   * @name emp3.api.events.ContainerEvent#target
   */
  this.target;
  /**
   * The list of affected child container objects.
   * @type {emp3.api.Overlay[]|emp3.api.Feature[]}
   * @name emp3.api.events.ContainerEvent#affectedChildren
   */
  Object.defineProperty(this, "affectedChildren", {
    enumerable: true,
    get: function () {
      return _affectedChildren;
    }
  });
};

// Extend emp3.api.events.Event
emp3.api.events.ContainerEvent.prototype = Object.create(emp3.api.events.Event.prototype);

/**
 * Returns true if the target container is a {@link emp3.api.Feature}
 * @returns {boolean}
 */
emp3.api.events.ContainerEvent.prototype.targetIsFeature = function() {
  return emp3.api.isFeature(this.target);
};

/**
 * Returns true if the target container is an {@link emp3.api.Overlay}
 * @returns {boolean}
 */
emp3.api.events.ContainerEvent.prototype.targetIsOverlay = function() {
  return emp3.api.isOverlay(this.target);
};

/**
 * Returns true if the target container is a {@link emp3.api.Map}
 * @returns {boolean}
 */
emp3.api.events.ContainerEvent.prototype.targetIsMap = function() {
  return (this.target instanceof emp3.api.Map);
};
