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
 * @classdesc Generated during various phases of a freehand draw operation.
 * @extends emp3.api.events.Event
 *
 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {emp3.api.enums.MapFreehandEventEnum} args.event - The enumeration value identifying the phase of freehand
 * draw mode that is associated with this event.
 * @param {emp3.api.Map} args.target - The map on which this event was triggered.
 * @param {cmapi.IGeoPositionGroup} args.positionGroup - The ordered list of positions from the free hand drawing operation.
 * @param {cmapi.IGeoStrokeStyle} args.style - The style used during the free hand drawing operation.
 */
emp3.api.events.MapFreehandEvent = function(args) {
  args = args || {};
  args.type = emp3.api.enums.EventType.MAP_FREEHAND_DRAW_EVENT;
  emp3.api.events.Event.call(this, args);
  /** @private */
  var _style = args.style,
      /** @private */
      _positionGroup = args.positionGroup;

  /**
   * An enumeration value of emp3.api.enums.EventType.MAP_FREEHAND_DRAW_EVENT specifying the type of event.
   * @const
   * @default emp3.api.enums.EventType.MAP_FREEHAND_DRAW_EVENT
   * @type {emp3.api.enums.EventType.MAP_FREEHAND_DRAW_EVENT}
   * @name emp3.api.events.MapFreehandEvent#type
   */
  this.type;
  /**
   * The enumeration value identifying the phase of freehand draw mode that is associated with this event.
   * @type {emp3.api.enums.MapFreehandEventEnum}
   * @name emp3.api.events.MapFreehandEvent#event
   */
  this.event;
  /**
   * The map on which this event was triggered.
   * @type {emp3.api.Map}
   * @name emp3.api.events.MapFreehandEvent#target
   */
  this.target;
  /**
   * The ordered list of positions from the free hand drawing operation.
   * @type {cmapi.IGeoPositionGroup}
   * @name emp3.api.events.MapFreehandEvent#positionGroup
   */
  Object.defineProperty(this, "positionGroup", {
    enumerable: true,
    get: function () {
      return _positionGroup;
    }
  });
  /**
   * The style used during the free hand drawing operation.
   * @type {cmapi.IGeoStrokeStyle}
   * @name emp3.api.events.MapFreehandEvent#style
   */
  Object.defineProperty(this, "style", {
    enumerable: true,
    get: function () {
      return _style;
    }
  });
};

// Extend emp3.api.events.Event
emp3.api.events.MapFreehandEvent.prototype = Object.create(emp3.api.events.Event.prototype);