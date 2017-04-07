if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}
if (!window.emp3.enums) {
  emp3.api.enums = {};
}

/**
 * Indicates if the view is currently in motion or if it
 * stopped.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.CameraEventEnum = {
  /**
   * The map is currently moving. The camera contains only the state of the
   * map while it was in motion, which may not be a reliable indication of
   * the current status of the camera.
   */
  CAMERA_IN_MOTION: 0,
  /**
   * The map is currently in a stable position.
   */
  CAMERA_MOTION_STOPPED: 1
};

/**
 * Indicates which operation occurred on a container.  Containers usually have
 * items added or removed.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.ContainerEventEnum = {
  /**
   * An object has been added to the container.
   */
  OBJECT_ADDED: 0,
  /**
   * An object has been removed from the container.
   */
  OBJECT_REMOVED: 1
};

/**
 * Specifies which phase a draw operation is in.  When a successful draw occurs
 * it will go through 3 phases in this order: start, update, complete.  A cancel
 * can occur in between any of the phases.  A cancel will end a draw without
 * committing the draw.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.FeatureDrawEventEnum = {
  /**
   * The draw operation was cancelled.
   */
  DRAW_CANCELLED: "cancel",
  /**
   * The draw operation has been completed.
   */
  DRAW_COMPLETE: "complete",
  /**
   * The draw operation has started.
   */
  DRAW_START: "start",
  /**
   * The user has modified the feature that was being drawn.
   */
  DRAW_UPDATE: "update"
};

/**
 * Specifies which phase an edit operation is in.  An edit will begin with the
 * start phase, at which point a complete, cancel, or update can occur.  An edit
 * can go through multiple updates.  A cancel indicates the feature should
 * return to the previous state it was in prior to the edit.   A complete
 * confirms the edit.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.FeatureEditEventEnum = {
  /**
   * The edit operation was cancelled.
   */
  EDIT_CANCELLED: "cancel",
  /**
   * The edit operation has been completed.
   */
  EDIT_COMPLETE: "complete",
  /**
   * The edit operation has started.
   */
  EDIT_START: "start",
  /**
   * The user has modified a property of the feature.  This can only occur
   * after an EDIT_START, but before a EDIT_COMPLETE or an EDIT_CANCEL.
   */
  EDIT_UPDATE: "update"
};

/**
 * Indicates how a feature was edited during the update phase of the edit.
 * During a feature edit, the feature can be modified in various ways.  coordinates
 * of the feature can be added, updated, or removed.  In addition to coordinates
 * some feature classes contain properties that can be modified that do affect
 * the appearance of the feature but may not necessarily be coordinates.  for
 * instance, a circle has a radius property.  The radius is a distance, by
 * changing that the whole circle changes.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.FeatureEditUpdateType = {
  /**
   * An attribute associated with air control measures has been changed.
   * ACM attributes examples are min alt, max alt, radius.  These are usually
   * only associated with AirControlMeasure features.
   */
  ACM_ATTRIBUTE_UPDATED: "acm",
  /**
   * A coordinate has been added to the feature during an edit operation.
   */
  COORDINATE_ADDED: "add",
  /**
   * A coordinate has been modified on a feature during an edit operation.
   */
  COORDINATE_MOVED: "update",
  /**
   * A coordinate has been removed from a feature during an edit operation.
   */
  COORDINATE_DELETED: "remove",

  /**
   * A property was modified on the feature.
   */
  FEATURE_PROPERTY_UPDATED: "property",

  /**
   * An attribute associated with the MIL-STD-2525 has been modified.  These
   * attributes control the position of the feature, but may not be associated
   * with a coordinate.  Examples of attributes are the azimuth symbol modifier
   * (AN) and the distance modifier (AM) of the MIL-STD-2525C
   */
  MILSTD_MODIFIER_UPDATED: "modifier",

  /**
   * The entire feature was moved to a new location.
   */
  POSITION_UPDATED: "moved"
};

/**
 * Indicates the selection state of a feature.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.FeatureEventEnum = {
  /**
   * Indicates a feature is deselected
   */
  FEATURE_DESELECTED: 0,
  /**
   * Indicates a feature is selected
   */
  FEATURE_SELECTED: 1
};

/**
 * Specifies a specific type of feature.
 * @readonly
 * @enum {string}
 */
emp3.api.enums.FeatureTypeEnum = {
  /**
   * An air control measure.
   */
  GEO_ACM: 'airspace',
  /**
   * A Circle
   */
  GEO_CIRCLE: 'circle',
  /**
   * An ellipse
   */
  GEO_ELLIPSE: 'ellipse',
  /**
   * A MIL-STD-2525 symbol.
   */
  GEO_MIL_SYMBOL: 'milstd',
  /**
   * A path
   */
  GEO_PATH: 'path',
  /**
   * A point
   */
  GEO_POINT: 'point',
  /**
   * Polygon
   */
  GEO_POLYGON: 'polygon',
  /**
   * A rectangle
   */
  GEO_RECTANGLE: 'rectangle',
  /**
   * A square
   */
  GEO_SQUARE: 'square',
  /**
   * Free text on the map.
   */
  GEO_TEXT: 'text',
  /**
   * KML
   */
  KML: 'kml',
  /**
   * GeoJSON
   */
  GEOJSON: 'geojson'
};

/**
 * @readonly
 * @enum {string}
 */
emp3.api.enums.IconSizeEnum = {
  /**
   * 1.8 x size original icon
   */
  LARGE: 'large',
  /**
   * 1.4 x size original
   */
  MEDIUM: 'medium',
  /**
   * original size
   */
  SMALL: 'small',
  /**
   * "Smallest size possible"
   */
  TINY: 'tiny'
};

/**
 * Indicates a state change occurred on the map.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.MapEventEnum = {
  STATE_CHANGE: 0
};

/**
 * Specifies one of the 5 phases of the freehand draw mode available for a map container. Lines can be drawn on the map when
 * a map container enters into freehand draw mode. Each line begin and end has a state where it begins by a mouse down
 * or press and ends with a mouse up or release.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.MapFreehandEventEnum = {
  /**
   * The map is in freehand draw mode.  The map will allow lines to be
   * drawn like a pen on top of it.
   */
  MAP_ENTERED_FREEHAND_DRAW_MODE: 0,
  /**
   * The map has exited freehand draw mode.  The map is now in normal
   * operation.
   */
  MAP_EXIT_FREEHAND_DRAW_MODE: 1,
  /**
   * The map is in freehand draw mode and the user has completed drawing a
   * line.
   */
  MAP_FREEHAND_LINE_DRAW_END: 2,
  /**
   * The map is already in freehand draw mode and the user has begun
   * to draw a line.
   */
  MAP_FREEHAND_LINE_DRAW_START: 3,
  /**
   * The map is already in freehand draw mode and the user has updated
   * the line.
   */
  MAP_FREEHAND_LINE_DRAW_UPDATE: 4
};

/**
 * Specifies the various user interface lock states of a map.  The map's screen
 * can be locked at various times to prevent user interaction.  The map can
 * prevent a zoom in or a pan, or prevent all motion altogether.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.MapMotionLockEnum = {
  /**
   * Prevents panning and zooming through both user interaction and map api
   * commands.
   */
  NO_MOTION: 0,
  /**
   * The user cannot pan the map but may zoom in and out.
   */
  NO_PAN: 1,
  /**
   * The user cannot zoom in or out but may pan the map.
   */
  NO_ZOOM: 2,
  /**
   * The map cannot zoom or pan through user interaction
   */
  NO_ZOOM_NO_PAN: 3,
  /**
   * Map cannot zoom, will pan if you get close to edges.
   */
  SMART_MOTION: 4,
  /**
   * The user can interact with the map.
   */
  UNLOCKED: 5
};


/**
 * Specifies the readiness state of the map.   A map indicating it is ready
 * may begin accepting commands to process (but may not necessarily be displaying
 * the map yet.)
 *
 * @readonly
 * @enum {number}
 */
emp3.api.enums.MapStateEnum = {
  // Should there be an INIT_FAIL enumeration value
  /**
   * Occurs before a MAP_READY.
   */
  INIT_IN_PROGRESS: 0,
  /**
   * The default state of map.  From here it will launch into INIT_IN_PROGRESS.
   */
  MAP_NEW: 1,

  /**
   * The map is ready to begin accepting api commands.
   */
  MAP_READY: 2,

  /**
   * The map is swapping to a new map engine.  Commands will be queued during
   * this phase.
   */
  MAP_SWAP_IN_PROGRESS: 3,

  /**
   * The map has completed shutting down and can no longer be used.
   */
  SHUTDOWN: 4,

  /**
   * The map has begun the process of shutting down.
   */
  SHUTDOWN_IN_PROGRESS: 5
};

/**
 * Indicates if the view is currently in motion or if it
 * stopped.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.MapViewEventEnum = {


  /**
   * The map is currently moving.  The view contains only the state of the
   * map while it was in motion, which may not be a reliable indication of
   * the current status of the camera.
   */
  VIEW_IN_MOTION: 'viewInMotion',
  /**
   * The map is currently in a stable position.
   */
  VIEW_MOTION_STOPPED: 'viewStopped'
};

/**
 * Specifies a state for which labels should show for MIL-STD-2525 symbols.
 * @readonly
 * @enum {string}
 */
emp3.api.enums.MilStdLabelSettingEnum = {
  /**
   * When the map renders a MIL-STD-2525 single point, it renders
   * all symbol modifiers found in the MIL-STD-2525 if available.
   */
  ALL_LABELS: "all",
  /**
   * When the map renders a MIL-STD-2525 single point, it renders only
   * unique designation, name, higher headquarters.
   */
  COMMON_LABELS: "common",
  /**
   * Labels required to be valid
   */
  REQUIRED_LABELS: "required"
};

/**
 * Specifies a state for device interaction.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.UserInteractionEventEnum = {
  /**
   * A click action occurred.
   */
  CLICKED: "single",
  /**
   * A double-click action occurred.
   */
  DOUBLE_CLICKED: "double",
  /**
   * For touch screens, a long press occurred.
   */
  LONG_PRESS: "press",
  /**
   * A mouse down action occurred.
   */
  MOUSE_DOWN: "mouseDown",
  /**
   * A mouse up action occurred.
   */
  MOUSE_UP: "mouseUp",
  /**
   * A mouse move action occurred.
   */
  MOUSE_MOVE: "move",

  /**
   * The map or a feature was dragged.
   */
  DRAG: "drag",

  /**
   * The drag was complete.
   */
  DRAG_COMPLETE: "dragComplete"
};

/**
 * Specifies the mouse button used for device interaction.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.UserInteractionMouseButtonEventEnum = {
  /**
   * Left mouse button interaction.
   */
  LEFT: 0,
  /**
   * Middle mouse button interaction.
   */
  MIDDLE: 1,
  /**
   * Right mouse button interaction.
   */
  RIGHT: 2
};

/**
 * Specifies the key used for device interaction.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.UserInteractionKeyEventEnum = {
  /**
   * Ctrl key interaction.
   */
  CTRL: 0,
  /**
   * Alt key interaction.
   */
  ALT: 1,
  /**
   * Shift key interaction.
   */
  SHIFT: 2
};

/**
 * Specifies a desired end state for changing the visibility of a container.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.VisibilityActionEnum = {
  /**
   * Hide everything underneath in a container, turning off visibility state
   * for anything beneath it.
   */
  HIDE_ALL: 0,
  /**
   * Show everything in a container, regardless of the visibility state of
   * its descendants visibility state.
   */
  SHOW_ALL: 1,
  /**
   * Hides everything under a container, but maintains the visibility state of
   * its descendants.
   */
  TOGGLE_OFF: 2,
  /**
   * Toggles the visibility state of a container, adhering to the saved visibility
   * state of its descendants prior to toggling off.  If it was off prior to
   * toggling off it will be off when toggled on.
   */
  TOGGLE_ON: 3
};

/**
 * Specifies the current visibility of any container.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.VisibilityStateEnum = {
  /**
   * The item is not visible.
   */
  HIDDEN: 0,
  /**
   * The item is visible.
   */
  VISIBLE: 1,
  /**
   * The items is not visible because one of its parents is not visible.
   */
  VISIBLE_ANCESTOR_HIDDEN: 2
};

/**
 * Specifies a WMS version number.
 * @readonly
 * @enum {number}
 */
emp3.api.enums.WMSVersionEnum = {
  /**
   * WMS version 1.1
   */
  VERSION_1_1: "1.1",
  /**
   * WMS version 1.1.1
   */
  VERSION_1_1_1: "1.1.1",
  /**
   * WMS version 1.3
   */
  VERSION_1_3: "1.3.0"
};

/**
 * Identifies a specific event type than can occur on the map.
 * @enum {string}
 */
emp3.api.enums.EventType = {
  /**
   * @desc Identifies a camera event type which any of the following types can subscribe to:
   * - {@link emp3.api.Map}
   * - {@link emp3.api.Camera}
   *
   * A subscription to this event type, will cause an event object of type:
   * - {@link emp3.api.events.CameraEvent}
   *
   * to generate in response to the {@link emp3.api.enums.CameraEventEnum} state change that occurred and passed to
   * the registered callback function(s) that pertain to the subscribed types.
   *
   * <u><i>Notes:</i></u>
   * If multiple camera objects exist on a map container, changing the view of the map container will generate a
   * {@link emp3.api.events.CameraEvent} to be passed to the registered callback function(s) for ONLY
   * the currently set camera object if it has subscribed to this event. In this case even if other camera objects on
   * the map container are subscribed to this event type, events will not be generated for them and their registered
   * callbacks will not be executed because only one camera can be set on a map container at a time.
   *
   * <u><i>Sample Scenarios:</i></u>
   * <ul style="list-style-type:circle"><li>If a map container is subscribed to this event type, changing the view
   *  of the map container with {@link emp3.api.Map#zoomTo|emp3.api.Map.zoomTo()}
   *  or {@link emp3.api.Map#setBounds|emp3.api.Map.setBounds()} will generate a {@link emp3.api.events.CameraEvent}'
   *  to be passed to the registered callback function(s) that pertain to the subscribed map container.</li>
   *  <li>If a camera object is subscribed to this event type, changing the view of the map container with
   *  {@link emp3.api.Map#zoomTo|emp3.api.Map.zoomTo()} or {@link emp3.api.Map#setBounds|emp3.api.Map.setBounds()}
   *  will generate a {@link emp3.api.events.CameraEvent} to be passed to the registered callback function(s) that
   *  pertain to the subscribed camera object if it is currently set on the map container.</li>
   * </ul>
   */
  CAMERA_EVENT: "emp3.api.events.CameraEvent",
  /**
   * @desc Identifies a container event type which any of the following types can subscribe to:
   * - {@link emp3.api.Map}
   * - {@link emp3.api.Overlay}
   * - {@link emp3.api.Feature}
   *
   * If a container subscribes to this event type, an event object of type:
   * - {@link emp3.api.events.ContainerEvent}
   *
   * will be generated in response to the {@link emp3.api.enums.ContainerEventEnum} action that occurred and passed to
   * the registered callback function(s) that pertain to the subscribed container types.
   *
   * <u><i>Sample Scenarios:</i></u>
   * <ul style="list-style-type:circle"><li>If a map container is subscribed to this event type, adding an overlay
   *  container with {@link emp3.api.Map#addOverlay|emp3.api.Map.addOverlay()},
   *  {@link emp3.api.Map#addOverlays|emp3.api.Map.addOverlays()},
   *  {@link emp3.api.Overlay#addOverlay|emp3.api.Overlay.addOverlay()}, or
   *  {@link emp3.api.Overlay#addOverlays|emp3.api.Overlay.addOverlays()}
   *  to the map container will generate a {@link emp3.api.events.ContainerEvent} to be passed to
   *  the registered callback function(s) that pertain to the subscribed map container.</li>
   *  <li>If a map container currently has an overlay added to it and is subscribed to this event type, removing an
   *  overlay container with {@link emp3.api.Map#removeOverlay|emp3.api.Map.removeOverlay()},
   *  {@link emp3.api.Map#removeOverlays|emp3.api.Map.removeOverlays()},
   *  {@link emp3.api.Overlay#removeOverlay|emp3.api.Overlay.removeOverlay()}, or
   *  {@link emp3.api.Overlay#removeOverlays|emp3.api.Overlay.removeOverlays()} from the map container will generate a
   *  {@link emp3.api.events.ContainerEvent} to be passed to the registered callback function(s) that pertain to the
   *  subscribed map container.</li>
   *  <li>If an overlay container is subscribed to this event type, adding an overlay container or a feature container
   *  to the overlay container with {@link emp3.api.Overlay#addOverlay|emp3.api.Overlay.addOverlay()},
   *  {@link emp3.api.Overlay#addOverlays|emp3.api.Overlay.addOverlays()},
   *  {@link emp3.api.Feature#addFeature|emp3.api.Feature.addFeature()}, or
   *  {@link emp3.api.Feature#addFeatures|emp3.api.Feature.addFeatures()} will generate a
   *  {@link emp3.api.events.ContainerEvent} to be passed to the registered callback function(s) that pertain to the
   *  subscribed overlay container.</li>
   *  <li>If a feature container is subscribed to this event type, adding a feature container to the feature container
   *  with {@link emp3.api.Feature#addFeature|emp3.api.Feature.addFeature()}, or
   *  {@link emp3.api.Feature#addFeatures|emp3.api.Feature.addFeatures()} will generate a
   *  {@link emp3.api.events.ContainerEvent} to be passed to the registered callback function(s) that pertain to the
   *  subscribed feature container.</li>
   * </ul>
   */
  CONTAINER: "emp3.api.events.ContainerEvent",
  /**
   * @desc Identifies a feature draw event type which any of the following container types can subscribe to:
   * - {@link emp3.api.Feature}
   *
   * If a feature container subscribes to this event type, an event object of type:
   * - {@link emp3.api.events.FeatureDrawEvent}
   *
   * will be generated in response to the various {@link emp3.api.enums.FeatureDrawEventEnum} phases that can occur and
   * passed to the registered callback function(s) that pertain to the subscribed feature container.
   *
   * <u><i>Sample Scenarios:</i></u>
   * <ul style="list-style-type:circle"><li>If a feature container is subscribed to this event type, performing a
   *  {@link emp3.api.Map#drawFeature|emp3.api.Map.drawFeature()}, as well as any phase encountered during a
   *  draw operation will generate a {@link emp3.api.events.FeatureDrawEvent} to be passed to the registered
   *  callback function(s) that pertain to the subscribed feature container.</li>
   * </ul>
   */
  FEATURE_DRAW: "emp3.api.events.FeatureDrawEvent",
  /**
   * @desc Identifies a feature edit event type which any of the following container types can subscribe to:
   * - {@link emp3.api.Feature}
   *
   * If a feature container subscribes to this event type, an event object of type:
   * - {@link emp3.api.events.FeatureEditEvent}
   *
   * will be generated in response to the various {@link emp3.api.enums.FeatureEditEventEnum} phases that can occur and
   * passed to the registered callback function(s) that pertain to the subscribed feature container.
   *
   * <u><i>Sample Scenarios:</i></u>
   * <ul style="list-style-type:circle"><li>If a feature container is subscribed to this event type, performing a
   *  {@link emp3.api.Map#editFeature|emp3.api.Map.editFeature()}, as well as any phase encountered during an
   *  edit operation will generate a {@link emp3.api.events.FeatureEditEvent} to be passed to the registered
   *  callback function(s) that pertain to the subscribed feature container.</li>
   * </ul>
   */
  FEATURE_EDIT: "emp3.api.events.FeatureEditEvent",
  /**
   * @desc Identifies a feature selection event type which any of the following container types can subscribe to:
   * - {@link emp3.api.Feature}
   *
   * If a feature container subscribes to this event type, an event object of type:
   * - {@link emp3.api.events.FeatureEvent}
   *
   * will be generated in response to the various {@link emp3.api.enums.FeatureEventEnum} actions that can occur
   * on the feature container and passed to the registered callback function(s) that pertain to the subscribed feature
   * container.
   *
   * <u><i>Sample Scenarios:</i></u>
   * <ul style="list-style-type:circle"><li>If a feature container is subscribed to this event type, performing a
   *  {@link emp3.api.Map#selectFeature|emp3.api.Map.selectFeature()},
   *  {@link emp3.api.Map#selectFeatures|emp3.api.Map.selectFeatures()},
   *  {@link emp3.api.Map#deselectFeature|emp3.api.Map.deselectFeature()},
   *  {@link emp3.api.Map#deselectFeatures|emp3.api.Map.deselectFeatures()} will generate a
   *  {@link emp3.api.events.FeatureEvent} to be passed to the registered callback function(s) that pertain to
   *  the subscribed feature container.</li>
   * </ul>
   */
  FEATURE_EVENT: "emp3.api.events.FeatureEvent",
  /**
   * @desc Identifies a feature interaction event type which any of the following container types can subscribe to:
   * - {@link emp3.api.Feature}
   *
   * If a feature container subscribes to this event type, an event object of type:
   * - {@link emp3.api.events.FeatureUserInteractionEvent}
   *
   * will be generated in response to the various {@link emp3.api.enums.UserInteractionEventEnum} actions that can occur
   * on the feature container and passed to the registered callback function(s) that pertain to the subscribed feature
   * container.
   *
   * <u><i>Notes:</i></u>
   *  All {@link emp3.api.enums.UserInteractionEventEnum} actions will cause a
   * {@link emp3.api.events.FeatureUserInteractionEvent} to generate with the exception of
   * {@link emp3.api.enums.UserInteractionEventEnum|emp3.api.enums.UserInteractionEventEnum.MOUSE_MOVE} which is only
   * relevant when subscribing to the {@link emp3.api.enums.EventType|emp3.api.enums.EventType.MAP_INTERACTION} event
   * type.
   */
  FEATURE_INTERACTION: "emp3.api.events.FeatureInteractionEvent",
  /**
   * @desc Identifies a look at event type which any of the following types can subscribe to:
   * - {@link emp3.api.Map}
   * - {@link emp3.api.LookAt}
   *
   * A subscription to this event type, will cause an event object of type:
   * - {@link emp3.api.events.LookAtEvent}
   *
   * to generate in response to the {@link emp3.api.enums.LookAtEventEnum} state that occurred and passed to
   * the registered callback function(s) that pertain to the subscribed types.
   *
   * <u><i>Notes:</i></u>
   * If multiple look at objects exist on a map container, changing the view of the map container will generate a
   * {@link emp3.api.events.LookAtEvent} to be passed to the registered callback function(s) for ONLY
   * the currently set look at object if it has subscribed to this event. In this case even if other look at objects on
   * the map container are subscribed to this event type, events will not be generated for them and their registered
   * callbacks will not be executed because only one look at can be set on a map container at a time.
   *
   * <u><i>Sample Scenarios:</i></u>
   * <ul style="list-style-type:circle"><li>If a map container is subscribed to this event type, changing the view
   *  of the map container will generate a {@link emp3.api.events.LookAtEvent} to be passed to the registered callback
   *  function(s) that pertain to the subscribed map container.</li>
   *  <li>If a look at object is subscribed to this event type, changing the view of the map container will generate a
   *  {@link emp3.api.events.LookAtEvent} to be passed to the registered callback function(s) that pertain to the
   *  subscribed look at object if it is currently set on the map container.</li>
   * </ul>
   */
  LOOKAT_EVENT: "emp3.api.events.LookAtEvent",
  /**
   * @desc Identifies a map cursor move event type which any of the following container types can subscribe to:
   * - {@link emp3.api.Map}
   *
   * If a map container subscribes to this event type, a standard JSON object will be generated in response to the
   * {@link emp3.api.enums.UserInteractionEventEnum|emp3.api.enums.UserInteractionEventEnum.MOUSE_MOVE} action that
   * can occur on the map container and passed to the registered callback function(s) that pertain to the subscribed
   * map container.
   *
   * <u><i>Notes:</i></u>
   * The {@link emp3.api.events.MapCursorMoveEvent} type is not currently generated for mouse move events. As mentioned,
   * a standard JSON object is used instead.
   */
  MAP_CURSOR_MOVE: "emp3.api.events.MapCursorMoveEvent",
  /**
   * @desc Identifies a map interaction event type which any of the following container types can subscribe to:
   * - {@link emp3.api.Map}
   *
   * If a map container subscribes to this event type, an event object of type:
   * - {@link emp3.api.events.MapFeatureAddedEvent}
   *
   * will be generated in response to a feature container being added to a map container and passed to the
   * registered callback function(s) that pertain to the subscribed map container.
   *
   * <u><i>Sample Scenarios:</i></u>
   * <ul style="list-style-type:circle"><li>If a map container is subscribed to this event type and an overlay container
   *  resides on it, performing a {@link emp3.api.Overlay#addFeature|emp3.api.Overlay.addFeature()}, or
   *  {@link emp3.api.Overlay#addFeatures|emp3.api.Overlay.addFeatures()} on the overlay container will generate a
   *  {@link emp3.api.events.MapFeatureAddedEvent} to be passed to the registered callback function(s) that pertain to
   *  the subscribed map container.</li>
   *  <li>If a map container is subscribed to this event having an overlay container residing on it as well as a feature
   *  container residing on the overlay container, performing a {@link emp3.api.Feature#addFeature|emp3.api.Feature.addFeature()},
   *  {@link emp3.api.Feature#addFeatures|emp3.api.Feature.addFeatures()} on the feature container will generate a
   *  {@link emp3.api.events.MapFeatureAddedEvent} to be passed to the registered callback function(s) that pertain to
   *  the subscribed map container.</li>
   * </ul>
   */
  MAP_FEATURE_ADDED: "emp3.api.events.MapFeatureAddedEvent",
  /**
   * @desc Identifies a map interaction event type which any of the following container types can subscribe to:
   * - {@link emp3.api.Map}
   *
   * If a map container subscribes to this event type, an event object of type:
   * - {@link emp3.api.events.MapFeatureUpdatedEvent}
   *
   * will be generated in response to a feature container being updated on a map container and passed to the
   * registered callback function(s) that pertain to the subscribed map container.
   *
   * <u><i>Sample Scenarios:</i></u>
   * <ul style="list-style-type:circle"><li>If a map container is subscribed to this event type, has an overlay container
   *  residing on it which has a feature container residing on it, performing a
   *  {@link emp3.api.Feature#apply|emp3.api.Feature.apply()} will generate a
   *  {@link emp3.api.events.MapFeatureUpdatedEvent} to be passed to the registered callback function(s) that
   *  pertain to the subscribed map container.</li>
   * </ul>
   */
  MAP_FEATURE_UPDATED: "emp3.api.events.MapFeatureUpdatedEvent",
  /**
   * @desc Identifies a map interaction event type which any of the following container types can subscribe to:
   * - {@link emp3.api.Map}
   *
   * If a map container subscribes to this event type, an event object of type:
   * - {@link emp3.api.events.MapFeatureRemovedEvent}
   *
   * will be generated in response to a feature container being removed from a map container and passed to the
   * registered callback function(s) that pertain to the subscribed map container.
   *
   * <u><i>Sample Scenarios:</i></u>
   * <ul style="list-style-type:circle"><li>If a map container is subscribed to this event type and an overlay container
   *  resides on it, performing a {@link emp3.api.Overlay#removeFeature|emp3.api.Overlay.removeFeature()}, or
   *  {@link emp3.api.Overlay#removeFeatures|emp3.api.Overlay.removeFeatures()} on the overlay container will generate a
   *  {@link emp3.api.events.MapFeatureRemovedEvent} to be passed to the registered callback function(s) that pertain to
   *  the subscribed map container.</li>
   * </ul>
   */
  MAP_FEATURE_REMOVED: "emp3.api.events.MapFeatureRemovedEvent",
  /**
   * @desc Identifies a map interaction event type which any of the following container types can subscribe to:
   * - {@link emp3.api.Map}
   *
   * If a map container subscribes to this event type, an event object of type:
   * - {@link emp3.api.events.MapUserInteractionEvent}
   *
   * will be generated in response to the various {@link emp3.api.enums.UserInteractionEventEnum} actions that can occur
   * on the map container and passed to the registered callback function(s) that pertain to the subscribed map container.
   *
   * <u><i>Notes:</i></u>
   * This event type pertains to the {@link emp3.api.enums.UserInteractionEventEnum} actions that occur specifically on
   * a map container. If these listed actions occur on a feature container residing on the map container and the feature
   * container has not subscribed to {@link emp3.api.events.FeatureInteractionEvent}, no callback(s) will execute.
   */
  MAP_INTERACTION: "emp3.api.events.MapInteractionEvent",
  /**
   * @desc Identifies a map free hand draw event type which any of the following container types can subscribe to:
   * - {@link emp3.api.Map}
   *
   * If a map container subscribes to this event type, an event object of type:
   * - {@link emp3.api.events.MapFreehandEvent}
   *
   * will be generated in response to the various {@link emp3.api.enums.MapFreehandEventEnum} phases that can occur and
   * passed to the registered callback function(s) that pertain to the subscribed map container.
   *
   * <u><i>Sample Scenarios:</i></u>
   * <ul style="list-style-type:circle"><li>If a map container is subscribed to this event type, performing a
   *  {@link emp3.api.Map#drawFreehand|emp3.api.Map.drawFreehand()}, or
   *  {@link emp3.api.Map#drawFreehandExit|emp3.api.Map.drawFreehandExit()} as well as any phase encountered during the
   *  free hand draw operation will generate a {@link emp3.api.events.MapFreehandEvent} to be passed to the registered
   *  callback function(s) that pertain to the subscribed map container.</li>
   * </ul>
   */
  MAP_FREEHAND_DRAW_EVENT: "emp3.api.events.MapFreehandDrawEvent",
  /**
   * @desc Identifies a map state change event type which any of the following container types can subscribe to:
   * - {@link emp3.api.Map}
   *
   * If a map container subscribes to this event type, an event object of type:
   * - {@link emp3.api.events.MapStateChangeEvent}
   *
   * will be generated in response to the {@link emp3.api.enums.MapStateEnum} state change that occurred and passed
   * to the registered callback function(s) that pertain to the subscribed map container.
   *
   * <u><i>Notes:</i></u>
   * The lifecycle of a map container consists of 6 stages represented by the {@link emp3.api.enums.MapStateEnum}
   * values.
   *
   * <u><i>Sample Scenarios:</i></u>
   * <ul style="list-style-type:circle"><li>If a map container is subscribed to this event type, performing a
   *  {@link emp3.api.Map#purge|emp3.api.Map.purge()}, or {@link emp3.api.Map#swapMapEngine|emp3.api.Map.swapMapEngine()}
   *  will generate {@link emp3.api.events.MapStateChangeEvent} for each state encountered during execution of these
   *  map container operations to be passed to the registered callback function(s) that pertain to the subscribed map
   *  container.</li>
   * </ul>
   */
  MAP_STATE_CHANGE: "emp3.api.events.MapStateChangeEvent",
  /**
   * @desc Identifies a map view change event type which any of the following container types can subscribe to:
   * - {@link emp3.api.Map}
   *
   * If a map container subscribes to this event type, an event object of type:
   * - {@link emp3.api.events.MapViewChangeEvent}
   *
   * will be generated in response to the {@link emp3.api.enums.MapViewEventEnum} state change that occurred and passed
   * to the registered callback function(s) that pertain to the subscribed map container.
   *
   * <u><i>Sample Scenarios:</i></u>
   * <ul style="list-style-type:circle"><li>If a map container is subscribed to this event type, moving the map
   *  container with any of its various view change functions eg. {@link emp3.api.Map#zoomTo|emp3.api.Map.zoomTo()}
   *  or {@link emp3.api.Map#setBounds|emp3.api.Map.setBounds()} will generate a
   *  {@link emp3.api.events.MapViewChangeEvent} to be passed to the registered callback function(s) that pertain to
   *  the subscribed map container.</li>
   * </ul>
   */
  MAP_VIEW_CHANGE: "emp3.api.events.MapViewChangeEvent",
  /**
   * @desc Identifies an overlay change event type which any of the following container types can subscribe to:
   * - {@link emp3.api.Overlay}
   *
   * If an overlay container subscribes to this event type, an event object of type:
   * - {@link emp3.api.events.OverlayUpdatedEvent}
   *
   * will be generated in response to the update that occurred on the to the registered callback function(s) that
   * pertain to the subscribed overlay container.
   *
   * <u><i>Sample Scenarios:</i></u>
   * <ul style="list-style-type:circle"><li>If an overlay container is subscribed to this event type, updating the
   *  description or the name on the overlay container with {@link emp3.api.Overlay#apply|emp3.api.Overlay.apply()}
   *  will generate a {@link emp3.api.events.OverlayUpdatedEvent} to be passed to the registered callback function(s)
   *  that pertain to the subscribed overlay container.</li>
   * </ul>
   */
  OVERLAY_CHANGE: "emp3.api.events.OverlayChangeEvent",
  /**
   * @desc Identifies a visibility event type which any of the following container types can subscribe to:
   * - {@link emp3.api.Map}
   * - {@link emp3.api.Overlay}
   * - {@link emp3.api.Feature}
   *
   * If a container subscribes to this event type, an event object of type:
   * - {@link emp3.api.events.VisibilityEvent}
   *
   * will be generated in response to the {@link emp3.api.enums.VisibilityStateEnum} state change that occurred and
   * passed to the registered callback function(s) that pertain to the subscribed container types.
   *
   * <u><i>Notes:</i></u>
   * Since multiple instances of a unique overlay container and its unique child containers can reside on multiple
   * unique map containers, there are two options available when subscribing to events of this type for overlay
   * containers or feature containers. The first is overlay/feature container specific while the second is map
   * container specific:
   *
   * 1) A unique overlay container or any of its unique child containers can subscribe directly to this event type in which
   * case any instance of the overlay container or its child containers having a visibility change occur while residing
   * on ANY map container will trigger the relevant callback(s) passed in during initial subscription to execute.
   * This provides the convenience of having the unique overlay container or child container subscribe once to this event
   * type regardless of the number of instances residing on unique map containers instead of these unique map containers
   * each requiring a subscription to this event type.
   *
   * 2) A unique map container can subscribe directly to this event type in order to execute the callback(s) passed in
   * during initial subscription when a visibility change occurs on ANY container residing on this unique map container.
   * This provides convenience from the map container perspective by requiring only one subscription to this event type
   * instead of requiring a subscription to this event type from every unique container residing on this map container.
   *
   * It should be noted that it is possible to subscribe to this event type on an overlay/feature container AND on the
   * map container that these overlay/feature containers reside on. If this occurs, both callbacks that pertain to the
   * subscribed overlay/feature and map containers will execute. These callbacks will receive duplicate
   * {@link emp3.api.events.VisibilityEvent} items.
   *
   * <u><i>Sample Scenarios:</i></u>
   * <ul style="list-style-type:circle"><li>If a map container is subscribed to this event type, has an overlay container
   *  added to it, and a feature container added to the overlay container, performing a
   *  {@link emp3.api.Map#setVisibility|emp3.api.Map.setVisibility()} on the overlay container or the feature container
   *  will generate a {@link emp3.api.events.VisibilityEvent} to be passed to the registered callback function(s) that
   *  pertain to the subscribed map container.</li>
   *  <li>If an overlay container is subscribed to this event type, has a feature container added to it that is also
   *  subscribed to this event type, and resides on any number of map containers, performing a
   *  {@link emp3.api.Map#setVisibility|emp3.api.Map.setVisibility()} on the overlay container or the feature container
   *  will generate a {@link emp3.api.events.VisibilityEvent} to be passed to the registered callback function(s) that
   *  pertain to the subscribed overlay container or feature container.</li>
   * </ul>
   */
  VISIBILITY: "emp3.api.events.VisibilityEvent"
};

/**
 *
 * @readonly
 * @enum {string}
 */
emp3.api.enums.messageCompletionStatus = {
  FAILURE: "failure",
  MIXED: "mixed",
  SUCCESS: "success",
  CANCELLED: "cancelled"
};

/**
 * @readonly
 * @enum {string}
 */
emp3.api.enums.channel = {
  mapShutdown: "map.shutdown",
  convert: "map.convert",
  swap: "map.swap",
  convertResponse: "map.convert.response",
  removeOverlay: "map.overlay.remove",
  createOverlay: "map.overlay.create",
  hideOverlay: "map.overlay.hide",
  showOverlay: "map.overlay.show",
  styleOverlay: "map.overlay.style",
  updateOverlay: "map.overlay.update",
  clearFeatures: "map.overlay.clear",
  overlayClusterSet: "map.overlay.cluster.set",
  overlayClusterActivate: "map.overlay.cluster.activate",
  overlayClusterDeactivate: "map.overlay.cluster.deactivate",
  overlayClusterRemove: "map.overlay.cluster.remove",
  plotFeature: "map.feature.plot",
  plotFeatureBatch: "map.feature.plot.batch",
  draw: "map.feature.draw",
  featureEdit: "map.feature.edit",
  plotUrl: "map.feature.plot.url",
  unplotFeature: "map.feature.unplot",
  unplotFeatureBatch: "map.feature.unplot.batch",
  hideFeature: "map.feature.hide",
  showFeature: "map.feature.show",
  updateFeature: "map.feature.update",
  featureSelected: "map.feature.selected",
  featureSelectedBatch: "map.feature.selected.batch",
  featureDeselected: "map.feature.deselected",
  featureDeselectedBatch: "map.feature.deselected.batch",
  featureClicked: "map.feature.clicked",
  featureMouseDown: "map.feature.mousedown",
  featureMouseUp: "map.feature.mouseup",
  get: "map.get",
  clearMap: "map.clear",
  statusScreenshot: "map.status.screenshot",
  menuCreate: "map.menu.create",
  menuClicked: "map.menu.clicked",
  menuRemove: "map.menu.remove",
  menuSetVisible: "map.menu.active",
  zoom: "map.view.zoom",
  centerOnOverlay: "map.view.center.overlay",
  centerOnFeature: "map.view.center.feature",
  centerOnLocation: "map.view.center.location",
  centerOnBounds: "map.view.center.bounds",
  lookAtLocation: "map.view.lookat.location",
  coordinateSystem: "map.view.coordinatesystem",
  lockView: "map.view.lock",
  clicked: "map.view.clicked",
  mouseup: "map.view.mouseup",
  mousedown: "map.view.mousedown",
  mousemove: "map.view.mousemove",
  statusRequest: "map.status.request",
  statusInitialization: "map.status.initialization",
  statusView: "map.status.view",
  statusFormat: "map.status.format",
  statusAbout: "map.status.about",
  statusCoordinateSystem: "map.status.coordinatesystem",
  statusSelected: "map.status.selected",
  error: "map.error",
  transactionComplete: "map.message.complete",
  cancel: "map.message.cancel",
  messageProgress: "map.message.progress",
  menuDrawingCreate: "map.menu.drawing.create",
  menuDrawingComplete: "map.menu.drawing.complete",
  menuDrawingRemove: "map.menu.drawing.remove",
  getVisibility: "cmapi2.visibility.get",
  config: "cmapi2.map.config",
  featureAddEvent: "cmapi2.map.feature.event.add",
  featureUpdateEvent: "cmapi2.map.feature.event.update",
  featureRemoveEvent: "cmapi2.map.feature.event.remove",
  freehandDrawStart: "cmapi2.map.freehand.start",
  freehandDrawExit: "cmapi2.map.freehand.stop",
  freehandLineDraw: "cmapi2.map.freehand.linedraw",
  drag: "cmapi2.map.view.drag",
  dragComplete: "cmapi2.map.view.dragComplete",
  featureDrag: "cmapi2.map.feature.drag",
  featureDragComplete: "cmapi2.map.feature.dragComplete"
};

/**
 * @deprecated
 * Predefined update Event Types generated by new map engines.
 * @private
 */
emp3.api.enums.updateEventType = {
  UPDATE: "update",
  COMPLETE: "complete",
  START: "start"
};

/**
 *
 * @type {string}
 */
emp3.api.enums.defaultMilStdLabelSetting = emp3.api.enums.MilStdLabelSettingEnum.COMMON_LABELS;
/**
 *
 * @type {number}
 */
emp3.api.enums.defaultMidDistanceThreshold = 20000;
/**
 *
 * @type {number}
 */
emp3.api.enums.defaultFarDistanceThreshold = 600000;
/**
 *
 * @type {string}
 */
emp3.api.enums.defaultIconSize = emp3.api.enums.IconSizeEnum.SMALL;

/**
 *
 * @type {{WMS: undefined, Layers: undefined}}
 */
emp3.api.enums.defaultOverlayId = {
  WMS: undefined,
  Layers: undefined
};
