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
 * @ignore
 * @class
 * @classdesc Base class for all event classes.
 *
 * @param {Object} args - Parameters are provided as members of the args object.
 * @param {Event.enum} args.event - The enumeration value that identifies the specific action/option associated with the event.
 * @param {emp3.api.Container} args.target - The container object the event was generated on.
 */
emp3.api.events.Event = function(args) {
  args = args || {};
  /** @private */
  var _event = args.event,
      /** @private */
      _target = args.target,
      /** @private */
      _type = args.type;

  /**
   * An enumeration value specifying the type of event. The type is determined by the instantiated sub-classed
   * event.
   * @const
   * @type {emp3.api.enums.EventType}
   * @name emp3.api.events.Event#type
   */
  Object.defineProperty(this, "type", {
    enumerable: true,
    get: function () {
      return _type; // Determined by the sub-classed event
    }
  });
  /**
   * The enumeration value that identifies the specific action/option associated with the event.
   * @type {Event.enum}
   * @name emp3.api.events.Event#event
   */
  // Although this property is inherited in all subclasses, the documentation will be as well. This means that some subclasses
  // which should display more defined types than what is mentioned in this base class will not unless this property
  // is included in the subclass. Even though functionally it is not required to be included in the subclass.
  Object.defineProperty(this, "event", {
    enumerable: true,
    get: function () {
      return _event;
    }
  });
  /**
   * The container object the event was generated on.
   * @type {emp3.api.Container}
   * @name emp3.api.events.Event#target
   */
  // Although this property is inherited in all subclasses, the documentation will be as well. This means that some subclasses
  // which should display more defined types than what is mentioned in this base class will not unless this property
  // is included in the subclass. Even though functionally it is not required to be included in the subclass.
  Object.defineProperty(this, "target", {
    enumerable: true,
    get: function () {
      return _target;
    }
  });
};
