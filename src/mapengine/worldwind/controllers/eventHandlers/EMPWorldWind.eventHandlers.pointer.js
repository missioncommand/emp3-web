var EMPWorldWind = EMPWorldWind || {};
EMPWorldWind.eventHandlers = EMPWorldWind.eventHandlers || {};

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events}
 * @typedef {object} PointerEvent
 */

/**
 * Pointer events are currently aliases for their mouseevent counterparts
 *
 * @namespace
 * @borrows EMPWorldWind.eventHandlers.mouse.mousedown as pointerdown
 * @borrows EMPWorldWind.eventHandlers.mouse.mouseup as pointerup
 * @borrows EMPWorldWind.eventHandlers.mouse.mousemove as pointermove
 */
EMPWorldWind.eventHandlers.pointer = {
  /**
   * Wrapper for mousedown
   * @see EMPWorldWind.eventHandlers.mouse.mousedown
   * @this EMPWorldWind.map
   */
  pointerdown: EMPWorldWind.eventHandlers.mouse.mousedown,
  /**
   * @see EMPWorldWind.eventHandlers.mouse.mouseup
   * @this EMPWorldWind.map
   */
  pointerup: EMPWorldWind.eventHandlers.mouse.mouseup,
  /**
   * @see EMPWorldWind.eventHandlers.mouse.mousemove
   * @this EMPWorldWind.map
   */
  pointermove: EMPWorldWind.eventHandlers.mouse.mousemove
};