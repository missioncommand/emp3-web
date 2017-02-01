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
 * @classdesc Generated during the process of editing a {@link emp3.api.Feature}.
 * @extends emp3.api.events.Event
 *
 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {emp3.api.enums.FeatureEditEventEnum} args.event - The enumeration value that identifies the edit state
 * associated with this event.
 * @param {emp3.api.Feature} args.target - The feature object being edited that this event was generated on.
 * @param {emp3.api.Map} args.map - The map on which this edit event was triggered.
 * @param {Object[]} args.updateList - The list of objects that identifies what was updated in the feature. This only
 * applies when the event enumeration value is of type emp3.api.enums.FeatureEditEventEnum.EDIT_UPDATE.
 */
emp3.api.events.FeatureEditEvent = function (args) {
  args = args || {};
  args.type = emp3.api.enums.EventType.FEATURE_EDIT;
  emp3.api.events.Event.call(this, args);
  /** @private */
  var _updateList = args.updateList,
      /** @private */
      _map = args.map;

  /**
   * An enumeration value of emp3.api.enums.EventType.FEATURE_EDIT specifying the type of event.
   * @const
   * @default emp3.api.enums.EventType.FEATURE_EDIT
   * @type {emp3.api.enums.EventType.FEATURE_EDIT}
   * @name emp3.api.events.FeatureEditEvent#type
   */
  this.type;
  /**
   * The enumeration value that identifies the edit state associated with this event.
   * @type {emp3.api.enums.FeatureEditEventEnum}
   * @name emp3.api.events.FeatureEditEvent#event
   */
  this.event;
  /**
   * The feature object being edited that this event was generated on.
   * @type {emp3.api.Feature}
   * @name emp3.api.events.FeatureEditEvent#target
   */
  this.target;
  /**
   * The map on which this edit event was triggered.
   * @type {emp3.api.Map}
   * @name emp3.api.events.FeatureEditEvent#map
   */
  Object.defineProperty(this, "map", {
    enumerable: true,
    get: function () {
      return _map;
    }
  });
  /**
   * The list of objects that identifies what was updated in the feature. This property is only populated
   * when the event enumeration value of this event is of type emp3.api.enums.FeatureEditEventEnum.EDIT_UPDATE.
   * @type {Object[]}
   * @name emp3.api.events.FeatureEditEvent#updateList
   */
  Object.defineProperty(this, "updateList", {
    enumerable: true,
    get: function () {
      return _updateList;
    }
  });
};

// Extend emp3.api.events.Event
emp3.api.events.FeatureEditEvent.prototype = Object.create(emp3.api.events.Event.prototype);