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
 */
EMPWorldWind.eventHandlers.pointer = {
  /**
   * Wrapper for mousedown
   * @see EMPWorldWind.eventHandlers.mouse.mousedown
   * @this EMPWorldWind.Map
   */
  pointerdown: EMPWorldWind.eventHandlers.mouse.mousedown,
  /**
   * @see EMPWorldWind.eventHandlers.mouse.mouseup
   * @this EMPWorldWind.Map
   */
  pointerup: EMPWorldWind.eventHandlers.mouse.mouseup,
  /**
   * @see EMPWorldWind.eventHandlers.mouse.mousemove
   * @this EMPWorldWind.Map
   */
  pointermove: EMPWorldWind.eventHandlers.mouse.mousemove
};