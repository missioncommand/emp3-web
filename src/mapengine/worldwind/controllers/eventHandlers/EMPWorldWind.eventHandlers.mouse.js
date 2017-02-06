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
  click: function (event) {
    var i,
      len, obj,
      coords = EMPWorldWind.utils.getEventCoordinates.call(this, event);

    coords.type = emp.typeLibrary.Pointer.EventType.SINGLE_CLICK;

    var pickList = this.worldWind.pick(this.worldWind.canvasCoordinates(event.clientX, event.clientY));
    len = pickList.objects.length;
    for (i = 0; i < len; i++) {
      obj = pickList.objects[i];
      if (obj.isTerrain) {
        continue;
      }
      // TODO properly select features on click
      // coords.featureId = obj.userObject.userProperties.featureId;
    }

    this.empMapInstance.eventing.Pointer(coords);
  },
  /**
   *
   * @param {MouseEvent} event
   * @this EMPWorldWind.map
   */
  dblclick: function (event) {
    var coords = EMPWorldWind.utils.getEventCoordinates.call(this, event);
    coords.type = emp.typeLibrary.Pointer.EventType.DBL_CLICK;
    this.empMapInstance.eventing.Pointer(coords);
  },
  /**
   * @param {MouseEvent} event
   * @this EMPWorldWind.map
   */
  mousedown: function (event) {
    var coords = EMPWorldWind.utils.getEventCoordinates.call(this, event);

    coords.type = emp.typeLibrary.Pointer.EventType.MOUSEDOWN;
    this.empMapInstance.eventing.Pointer(coords);
  },
  /**
   * @param {MouseEvent} event
   * @this EMPWorldWind.map
   */
  mouseup: function (event) {
    var coords = EMPWorldWind.utils.getEventCoordinates.call(this, event);
    coords.type = emp.typeLibrary.Pointer.EventType.MOUSEUP;

    if (this.state.dragging) {
      this.state.dragging = false;
      EMPWorldWind.eventHandlers.notifyViewChange.call(this, emp3.api.enums.CameraEventEnum.CAMERA_MOTION_STOPPED);
    }

    this.empMapInstance.eventing.Pointer(coords);
  },
  /**
   *
   * @param {WheelEvent} event
   * @this EMPWorldWind.map
   */
  wheel: function (event) {
    if (event.wheelDeltaY < 0 && this.worldWind.navigator.range > EMPWorldWind.constants.view.MAX_HEIGHT) {
      this.worldWind.navigator.range = EMPWorldWind.constants.view.MAX_HEIGHT;
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
  },
  /**
   * @param {MouseEvent} event
   * @this EMPWorldWind.map
   */
  mousemove: function (event) {
    var coords = EMPWorldWind.utils.getEventCoordinates.call(this, event);
    coords.type = emp.typeLibrary.Pointer.EventType.MOVE;
    if (coords.lat !== undefined) {
      this.empMapInstance.eventing.Pointer(coords);
    }

    switch (event.buttons) {
      case 1: // Left button, we're moving the map
      case 2: // Right button, we're tilting/rotating the map
        switch (this.state.lockState) {
          case emp3.api.enums.MapMotionLockEnum.NO_MOTION:
          case emp3.api.enums.MapMotionLockEnum.NO_PAN:
          case emp3.api.enums.MapMotionLockEnum.NO_ZOOM_NO_PAN:
            event.preventDefault();
            break;
          case emp3.api.enums.MapMotionLockEnum.SMART_MOTION: // TODO check for special locations
          case emp3.api.enums.MapMotionLockEnum.UNLOCKED:
          default:
            EMPWorldWind.eventHandlers.notifyViewChange.call(this);
        }
        break;
      case 4: // Wheel/middle button
      case 8: // 4th button (back)
      case 16: // 5th button (forward)
      default:
      // No actions
    }

    this.state.lastMousePosition = event;
  }
};
