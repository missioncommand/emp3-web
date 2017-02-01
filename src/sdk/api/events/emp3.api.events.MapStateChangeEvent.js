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
 * @classdesc Generated when a {@link emp3.api.Map} changes state.
 * @extends emp3.api.events.Event

 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {emp3.api.Map} args.target - The map on which this event was triggered.
 * @param {emp3.api.enums.MapEventEnum} args.event - The enumeration value indicating the state of
 * the map has changed.
 * @param {emp3.api.enums.MapStateEnum} args.previousState - The state of the map prior to this event.
 */
emp3.api.events.MapStateChangeEvent = function (args) {
  args = args || {};
  args.type = emp3.api.enums.EventType.MAP_STATE_CHANGE;
  emp3.api.events.Event.call(this, args);
  /** @private */
  var _previousState = args.previousState;

  /**
   * An enumeration value of emp3.api.enums.EventType.MAP_STATE_CHANGE specifying the type of event.
   * @const
   * @default emp3.api.enums.EventType.MAP_STATE_CHANGE
   * @type {emp3.api.enums.EventType.MAP_STATE_CHANGE}
   * @name emp3.api.events.MapStateChangeEvent#type
   */
  this.type;
  /**
   * The enumeration value of emp3.api.enums.MapEventEnum.STATE_CHANGE indicating the state of the map
   * has changed.
   * @type {emp3.api.enums.MapEventEnum.STATE_CHANGE}
   * @name emp3.api.events.MapStateChangeEvent#event
   */
  this.event;
  /**
   * The map on which this event was triggered.
   * @type {emp3.api.Map}
   * @name emp3.api.events.MapStateChangeEvent#target
   */
  this.target;
  /**
   * The state of the map at the time this event was generated.
   * @type {emp3.api.enums.MapStateEnum}
   * @name emp3.api.events.MapStateChangeEvent#newState
   */
  Object.defineProperty(this, "newState", {
    enumerable: true,
    get: function () {
      return this.target.getState();
    }
  });
  /**
   * The state of the map prior to this event.
   * @type {emp3.api.enums.MapStateEnum}
   * @name emp3.api.events.MapStateChangeEvent#previousState
   */
  Object.defineProperty(this, "previousState", {
    enumerable: true,
    get: function () {
      return _previousState;
    }
  });
};

// Extend emp3.api.events.Event
emp3.api.events.MapStateChangeEvent.prototype = Object.create(emp3.api.events.Event.prototype);