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
  },
  /**
   * Wrapper for mousedown
   * @see EMPWorldWind.eventHandlers.mouse.mousedown
   * @this EMPWorldWind.map
   */
  mousedown: function(event) {
    var mousedownEvent = EMPWorldWind.utils.getEventCoordinates.call(this, event);

    mousedownEvent.type = emp.typeLibrary.Pointer.EventType.MOUSEDOWN;
    EMPWorldWind.eventHandlers.extractFeatureFromEvent.call(this, event, mousedownEvent);

    this.empMapInstance.eventing.Pointer(mousedownEvent);
  },
  /**
   * @see EMPWorldWind.eventHandlers.mouse.mouseup
   * @this EMPWorldWind.map
   */
  mouseup: function(event) {
    var mouseupEvent = EMPWorldWind.utils.getEventCoordinates.call(this, event);
    mouseupEvent.type = emp.typeLibrary.Pointer.EventType.MOUSEUP;
    // TODO see if features are needed on mouseup
    // EMPWorldWind.eventHandlers.extractFeatureFromEvent.call(this, event, mouseupEvent);

    if (this.state.dragging) {
      this.state.dragging = false;
      EMPWorldWind.eventHandlers.notifyViewChange.call(this, emp3.api.enums.CameraEventEnum.CAMERA_MOTION_STOPPED);
    }

    this.state.autoPanning = EMPWorldWind.constants.NO_PANNING;
    this.empMapInstance.eventing.Pointer(mouseupEvent);
  },
  /**
   * @see EMPWorldWind.eventHandlers.mouse.mousemove
   * @this EMPWorldWind.map
   */
  mousemove: function(event) {
    var coords = EMPWorldWind.utils.getEventCoordinates.call(this, event);
    coords.type = emp.typeLibrary.Pointer.EventType.MOVE;

    if (coords.lat !== undefined) {
      this.empMapInstance.eventing.Pointer(coords);
    }

    var element, elementBounds,
      smartAreaBuffer = 0.05,
      pan = {
        up: false,
        down: false,
        left: false,
        right: false
      };

    switch (event.buttons) {
      case 1: // Left button, we're moving the map
      case 2: // Right button, we're tilting/rotating the map
        switch (this.state.lockState) {
          case emp3.api.enums.MapMotionLockEnum.NO_MOTION:
          case emp3.api.enums.MapMotionLockEnum.NO_PAN:
          case emp3.api.enums.MapMotionLockEnum.NO_ZOOM_NO_PAN:
            this.state.dragging = true;
            event.preventDefault();
            break;
          case emp3.api.enums.MapMotionLockEnum.SMART_MOTION:
            event.preventDefault();

            element = event.srcElement || event.originalTarget;
            elementBounds = element.getBoundingClientRect();

            // Pan left or right
            pan.left = event.offsetX < elementBounds.width * smartAreaBuffer;
            pan.right = event.offsetX > elementBounds.width - (elementBounds.width * smartAreaBuffer);

            // Pan up or down
            pan.up = event.offsetY < elementBounds.height * smartAreaBuffer;
            pan.down = event.offsetY > elementBounds.height - (elementBounds.height * smartAreaBuffer);

            if (pan.up || pan.down || pan.left || pan.right) {
              this.state.autoPanning = pan;
              this.spinGlobe();
            } else {
              this.state.autoPanning = EMPWorldWind.constants.NO_PANNING;
            }
            break;
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

    this.state.lastInteractionEvent = event;
  }
};
