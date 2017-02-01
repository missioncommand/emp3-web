if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

/**
 * @interface
 * @augments cmapi.IGeoContainer
 * @classdesc This interface defines the method for all containers.
 */
emp3.api.Container = function (args) {
  cmapi.inherit(new cmapi.IGeoContainer(), this);

  this.patchProps(args);
};

/**
 * Adds an event listener to the container for a specific type. Not all container implementations support the same
 * types.
 *
 * Callbacks will need to support additional breakdown of types depending on which general
 * {@link emp3.api.enums.EventType} is being handled.
 *
 * Map supported events:
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.CONTAINER}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.MAP_CURSOR_MOVE}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.MAP_FEATURE_ADDED}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.MAP_FEATURE_UPDATED}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.MAP_FEATURE_REMOVED}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.MAP_INTERACTION}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.MAP_FREEHAND_DRAW_EVENT}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.MAP_STATE_CHANGE}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.MAP_VIEW_CHANGE}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.VISIBILITY}
 *
 * Overlay supported events:
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.CONTAINER}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.OVERLAY_CHANGE}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.VISIBILITY}
 *
 * Feature supported events:
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.CONTAINER}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.FEATURE_DRAW}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.FEATURE_EDIT}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.FEATURE_EVENT}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.FEATURE_INTERACTION}
 * - {@link emp3.api.enums.EventType|emp3.api.enums.EventType.VISIBILITY}
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {emp3.api.enums.EventType} args.eventType The event to attach to.  The callback will be called when this event occurs.
 * @param {function} args.callback Function to call when an event is received from the container.
 * @returns {function} The listener function that was installed.  This is used for removing the event listener.
 *
 * @example <caption>Adding a container event to a map</caption>
 * var added = map.addEventListener({
 *    eventType: emp3.api.enums.EventType.CONTAINER
 *    callback: myListener
 * });
 *
 * function myListener(event e) {
 *     // e is an OverlayAddedEvent in this case.
 *     console.log(e.overlay.name);
 * }
 *
 * @example <caption>Adding an overlay change event listener to an overlay</caption>
 * overlay.addEventListener({
 *   event: emp3.api.enums.EventType.CONTAINER
 *   callback: function(event) {
 *     // do something with the event
 *   }
 *  });
 *
 * @example <caption>Adding a feature interaction event listener to a feature</caption>
 * feature.addEventListener({
 *   event: emp3.api.EventType.FEATURE_INTERACTION
 *   callback: function(event) {
 *     switch (event.type) {
 *       case emp3.api.enums.UserInteractionEventEnum.LONG_PRESS:
 *         // handle long press
 *         break;
 *       default:
 *         // do nothing
 *     }
 *   }
 * });
 */
emp3.api.Container.prototype.addEventListener = function (args) {
  args = args || {};

  if (!args.callback) {
    throw new Error("Missing argument: callback");
  }

  if (!args.eventType) {
    throw new Error("Missing argument: eventType");
  }

  emp3.api.MessageHandler.getInstance().addEventListener({
    id: this.geoId,
    event: args.eventType,
    callback: args.callback
  });

  return args.callback;
};

/**
 * Removes an event listener from the container.  Event listeners must be removed
 * before destroying map instances to prevent a memory leak.
 *
 * @param {Object} args Parameters are provided as members of the args object.
 * @param {emp3.api.enums.EventType} args.eventType The event to remove.
 * @param {function} args.callback Function to remove, this will be returned from the initial call to addEventListener
 *
 * @example <caption>Adding a container event listener to a map</caption>
 * var map = new emp3.api.Map(...);
 *
 * var added = map.addEventListener({
 *   event: emp3.api.enums.EventType.CONTAINER,
 *   callback: function() {
 *     // do something;
 *   }
 * });
 *
 * map.removeEventListener({
 *   event: emp3.api.enums.EventType.CONTAINER,
 *   callback: added
 * });
 * */
emp3.api.Container.prototype.removeEventListener = function (args) {
  args = args || {};

  if (!args.eventType) {
    throw new Error("Missing argument: eventType");
  }

  if (!args.callback) {
    throw new Error("Missing argument: callback");
  }

  emp3.api.MessageHandler.getInstance().removeEventListener({
    id: this.geoId,
    event: args.eventType,
    callback: args.callback
  });

  return args.callback;
};


/**
 * This method removes all children from this container.
 */
emp3.api.Container.prototype.clearContainer = function () {
  throw new Error('clearContainer has not been implemented by this class');
};

/**
 * This method returns a list of parents of this container.
 */
emp3.api.Container.prototype.getParents = function () {
  throw new Error('getParents has not been implemented by this class');
};

/**
 * This method returns a list of parents of this container.
 */
emp3.api.Container.prototype.getChildren = function () {
  throw new Error('getChildren has not been implemented by this class');
};

/**
 * This method checks if the container has children.
 * This is a synchronous function.
 *
 * @returns {boolean}
 */
emp3.api.Container.prototype.hasChildren = function () {
  return emp3.api.MessageHandler.getInstance().hasChildren(this);
};
