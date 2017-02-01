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
 * @classdesc Generated when a {@link emp3.api.Map} view changes.
 * @extends emp3.api.events.Event

 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {emp3.api.enums.MapViewEventEnum} args.event - The enumeration value that identifies the map view's
 * state associated with this event.
 * @param {emp3.api.Map} args.target - The map on which this event was triggered.
 */
emp3.api.events.MapViewChangeEvent = function(args) {
  args = args || {};
  args.type = emp3.api.enums.EventType.MAP_VIEW_CHANGE;
  emp3.api.events.Event.call(this, args);
  /** @private */
  var _bounds = this.target.getBounds(),
      /** @private */
      _lookAt = this.target.getLookAt(),
      /** @private */
      _camera = this.target.getCamera();

  /**
   * An enumeration value of emp3.api.enums.EventType.MAP_VIEW_CHANGE specifying the type of event.
   * @const
   * @default emp3.api.enums.EventType.MAP_VIEW_CHANGE
   * @type {emp3.api.enums.EventType.MAP_VIEW_CHANGE}
   * @name emp3.api.events.MapViewChangeEvent#type
   */
  this.type;
  /**
   * The enumeration value that identifies the map view's state associated with this event.
   * @type {emp3.api.enums.MapViewEventEnum}
   * @name emp3.api.events.MapViewChangeEvent#event
   */
  this.event;
  /**
   * The map on which this event was triggered.
   * @type {emp3.api.Map}
   * @name emp3.api.events.MapViewChangeEvent#target
   */
  this.target;
  /**
   * The map's bounds after the event.
   * @type {Bounds}
   * @name emp3.api.events.MapViewChangeEvent#bounds
   */
  Object.defineProperty(this, "bounds", {
    enumerable: true,
    get: function () {
      return _bounds;
    }
  });
  /**
   * The updated lookAt object after the event.
   * @type {emp3.api.LookAt}
   * @name emp3.api.events.MapViewChangeEvent#lookAt
   */
  Object.defineProperty(this, "lookAt", {
    enumerable: true,
    get: function () {
      return _lookAt;
    }
  });
  /**
   * The updated camera object after the event.
   * @type {emp3.api.Camera}
   * @name emp3.api.events.MapViewChangeEvent#camera
   */
  Object.defineProperty(this, "camera", {
    enumerable: true,
    get: function () {
      return _camera;
    }
  });
};

// Extend emp3.api.events.Event
emp3.api.events.MapViewChangeEvent.prototype = Object.create(emp3.api.events.Event.prototype);
