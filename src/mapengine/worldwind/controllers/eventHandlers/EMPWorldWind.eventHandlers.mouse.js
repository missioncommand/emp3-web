var EMPWorldWind = EMPWorldWind || {};
EMPWorldWind.eventHandlers = EMPWorldWind.eventHandlers || {};

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent}
 * @typedef {Object} MouseEvent
 */


/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent}
 * @typedef {Object} WheelEvent
 */

/**
 * Mouse event handlers
 */
EMPWorldWind.eventHandlers.mouse = {
  /**
   * @param {MouseEvent} event
   * @this EMPWorldWind.map
   */
  click: function(event) {
    var clickEvent = EMPWorldWind.utils.getEventCoordinates.call(this, event);
    clickEvent.type = emp.typeLibrary.Pointer.EventType.SINGLE_CLICK;

    EMPWorldWind.eventHandlers.extractFeatureFromEvent.call(this, event, clickEvent);
    this.empMapInstance.eventing.Pointer(clickEvent);
  },
  /**
   *
   * @param {MouseEvent} event
   * @this EMPWorldWind.map
   */
  dblclick: function(event) {
    var dblClickEvent = EMPWorldWind.utils.getEventCoordinates.call(this, event);
    dblClickEvent.type = emp.typeLibrary.Pointer.EventType.DBL_CLICK;

    EMPWorldWind.eventHandlers.extractFeatureFromEvent.call(this, event, dblClickEvent);

    this.empMapInstance.eventing.Pointer(dblClickEvent);
  },
  /**
   *
   * @param {WheelEvent} event
   * @this EMPWorldWind.map
   */
  wheel: function(event) {
    if (event.wheelDeltaY < 0 && this.worldWindow.navigator.range > EMPWorldWind.constants.view.MAX_HEIGHT) {
      this.worldWindow.navigator.range = EMPWorldWind.constants.view.MAX_HEIGHT;
      event.preventDefault();
    }

    switch (this.state.lockState) {
      case emp3.api.enums.MapMotionLockEnum.NO_MOTION:
      case emp3.api.enums.MapMotionLockEnum.NO_ZOOM_NO_PAN:
      case emp3.api.enums.MapMotionLockEnum.NO_ZOOM:
        event.preventDefault();
        break;
      default:
      // business as usual
    }
    EMPWorldWind.eventHandlers.notifyViewChange.call(this);
  }
};
