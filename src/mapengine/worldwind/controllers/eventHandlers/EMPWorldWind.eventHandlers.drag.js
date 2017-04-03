var EMPWorldWind = EMPWorldWind || {};
EMPWorldWind.eventHandlers = EMPWorldWind.eventHandlers || {};
/**
 * @typedef {object} WWDragEvent
 */


/**
 * The event handlers listed here are not standard DOM drag event handlers. They represent notification functions
 * to alert the core to different drag states.
 *
 * @see WorldWind.DragRecognizer
 *
 * @namespace
 */
EMPWorldWind.eventHandlers.drag = {
  /**
   *
   * @param {WWDragEvent} event
   * @this EMPWorldWind.Map
   */
  began: function (/*event*/) {
    //window.console.debug(event);
  },
  /**
   *
   * @param {WWDragEvent} event
   * @this EMPWorldWind.Map
   */
  changed: function (/*event*/) {
    //window.console.debug(event);
  },
  /**
   *
   * @param {WWDragEvent} event
   * @this EMPWorldWind.Map
   */
  ended: function (/*event*/) {
    //window.console.debug(event);
  }
};
