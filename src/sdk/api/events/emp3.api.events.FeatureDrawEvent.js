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
 * @classdesc Generated during the process of drawing a {@link emp3.api.Feature}.
 * @extends emp3.api.events.Event
 *
 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {emp3.api.enums.FeatureDrawEventEnum} args.event - The enumeration value that identifies the draw state
 * associated with this event.
 * @param {emp3.api.Feature} args.target - The feature object being drawn that this event was generated on.
 * @param {emp3.api.Map} args.map - The map on which this draw event was triggered.
 * @param {Object[]} args.updateList - The list of objects that identifies what was updated in the feature. This only
 * applies when the event enumeration value is of type emp3.api.enums.FeatureDrawEventEnum.DRAW_UPDATE.
 */
emp3.api.events.FeatureDrawEvent = function (args) {
  args = args || {};
  args.type = emp3.api.enums.EventType.FEATURE_DRAW;
  emp3.api.events.Event.call(this, args);
  /** @private */
  var _updateList = args.updateList,
      /** @private */
      _map = args.map;

  /**
   * An enumeration value of emp3.api.enums.EventType.FEATURE_DRAW specifying the type of event.
   * @const
   * @default emp3.api.enums.EventType.FEATURE_DRAW
   * @type {emp3.api.enums.EventType.FEATURE_DRAW}
   * @name emp3.api.events.FeatureDrawEvent#type
   */
  this.type;
  /**
   * The enumeration value that identifies the draw state associated with this event.
   * @type {emp3.api.enums.FeatureDrawEventEnum}
   * @name emp3.api.events.FeatureDrawEvent#event
   */
  this.event;
  /**
   * The feature object being drawn that this event was generated on.
   * @type {emp3.api.Feature}
   * @name emp3.api.events.FeatureDrawEvent#target
   */
  this.target;
  /**
   * The map on which this draw event was triggered.
   * @type {emp3.api.Map}
   * @name emp3.api.events.FeatureDrawEvent#map
   */
  Object.defineProperty(this, "map", {
    enumerable: true,
    get: function () {
      return _map;
    }
  });
  /**
   * The list of objects that identifies what was updated in the feature. This property is only populated
   * when the event enumeration value of this event is of type emp3.api.enums.FeatureDrawEventEnum.DRAW_UPDATE.
   * @type {Object[]}
   * @name emp3.api.events.FeatureDrawEvent#updateList
   */
  Object.defineProperty(this, "updateList", {
    enumerable: true,
    get: function () {
      return _updateList;
    }
  });
};

// Extend emp3.api.events.Event
emp3.api.events.FeatureDrawEvent.prototype = Object.create(emp3.api.events.Event.prototype);