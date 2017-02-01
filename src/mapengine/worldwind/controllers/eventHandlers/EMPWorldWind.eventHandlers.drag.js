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
   * @this EMPWorldWind.map
   */
  began: function (/*event*/) {
    //window.console.debug(event);
  },
  /**
   *
   * @param {WWDragEvent} event
   * @this EMPWorldWind.map
   */
  changed: function (/*event*/) {
    //window.console.debug(event);
  },
  /**
   *
   * @param {WWDragEvent} event
   * @this EMPWorldWind.map
   */
  ended: function (/*event*/) {
    //window.console.debug(event);
  }
};
