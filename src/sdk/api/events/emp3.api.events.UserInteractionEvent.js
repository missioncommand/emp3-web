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
 * @classdesc Base class for user interaction events on a {@link emp3.api.Map} or {@link emp3.api.Feature}.
 * @extends emp3.api.events.Event
 *
 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {emp3.api.enums.UserInteractionEventEnum} args.event - The enumeration value that identifies the type of mouse
 * input associated with this event.
 * @param {emp3.api.Container} args.target - The container object this event was generated on.
 * @param {ScreenCoord} args.point - The x,y coordinate of the screen location where this event occurred.
 * @param {emp3.api.GeoPosition} args.position - The geographic coordinate of the location where this event occurred.
 * @param {emp3.api.enums.UserInteractionMouseButtonEventEnum} args.button - The enumeration value that identifies the
 * mouse button associated with this event.
 * @param {emp3.api.enums.UserInteractionKeyEventEnum[]} args.keys - The enumeration values that identify the keyboard
 * buttons associated with this event.
 */
emp3.api.events.UserInteractionEvent = function(args) {
  args = args || {};
  emp3.api.events.Event.call(this, args);
  /** @private */
  var _keys = args.keys,
      /** @private */
      _button = args.button,
      /** @private */
      _position= args.position,
      /** @private */
      _point= args.point;

  /**
   * An enumeration value specifying the type of event. The type is determined by the type of interaction
   * and subsequent instantiated sub-classed event.
   * @const
   * @type {emp3.api.enums.EventType}
   * @name emp3.api.events.UserInteractionEvent#type
   */
  this.type;
  /**
   * The enumeration value that identifies the type of mouse input associated with this event.
   * @type {emp3.api.enums.UserInteractionEventEnum}
   * @name emp3.api.events.UserInteractionEvent#event
   */
  this.event;
  /**
   * The container object the event was generated on.
   * @type {emp3.api.Container}
   * @name emp3.api.events.UserInteractionEvent#target
   */
  this.target;

  /**
   * The x,y coordinate of the screen location where this event occurred.
   * @type {ScreenCoord}
   * @name emp3.api.events.UserInteractionEvent#point
   */
  Object.defineProperty(this, "point", {
    enumerable: true,
    get: function () {
      return _point;
    }
  });
  /**
   * The geographic coordinate of the location where this event occurred.
   * @type {emp3.api.GeoPosition}
   * @name emp3.api.events.UserInteractionEvent#position
   */
  Object.defineProperty(this, "position", {
    enumerable: true,
    get: function () {
      return _position;
    }
  });
  /**
   * The enumeration value that identifies the mouse button associated with this event.
   * @type {emp3.api.enums.UserInteractionMouseButtonEventEnum}
   * @name emp3.api.events.UserInteractionEvent#button
   */
  Object.defineProperty(this, "button", {
    enumerable: true,
    get: function () {
      return _button;
    }
  });
  /**
   * The enumeration values that identify the keyboard buttons associated with this event.
   * @type {emp3.api.enums.UserInteractionKeyEventEnum[]}
   * @name emp3.api.events.UserInteractionEvent#keys
   */
  Object.defineProperty(this, "keys", {
    enumerable: true,
    get: function () {
      return _keys;
    }
  });
};

// Extend emp3.api.events.Event
emp3.api.events.UserInteractionEvent.prototype = Object.create(emp3.api.events.Event.prototype);

/**
 * @typedef {object} ScreenCoord
 * @property {number} x
 * @property {number} y
 */