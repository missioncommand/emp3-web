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
EMPWorldWind.eventHandlers.mouse = (function() {
  var throttleTime = 50; // 50ms
  var _throttleWrapper = EMPWorldWind.eventHandlers.throttle;

  /**
   * Sends a message to EMP Pointer eventing handler
   */
  var _notifyEMPPointing = _throttleWrapper(function(event) {
    var coords = EMPWorldWind.utils.getEventCoordinates.call(this, event);
    coords.type = emp.typeLibrary.Pointer.EventType.MOVE;

    if (coords.lat !== undefined) {
      this.empMapInstance.eventing.Pointer(coords);
    }
  }, throttleTime);

  /**
   * Sends a message to EMP that the view has changed
   */
  var _notifyEMPViewChanged = _throttleWrapper(function(state) {
    EMPWorldWind.eventHandlers.notifyViewChange.call(this, state);
  }, throttleTime);

  return {
    /**
     * @param {MouseEvent} event
     * @this EMPWorldWind.Map
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
     * @this EMPWorldWind.Map
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
     * @this EMPWorldWind.Map
     */
    wheel: function(event) {
      // Handle different browser wheel values
      var deltaY = event.wheelDeltaY /* Chrome */ || -event.deltaY /* Firefox */ || 0;

      if (deltaY < 0 && this.worldWindow.navigator.range > EMPWorldWind.constants.view.MAX_HEIGHT) {
        this.worldWindow.navigator.range = EMPWorldWind.constants.view.MAX_HEIGHT;
        event.preventDefault();
      }

      var preventDefaultLockStates = [
        emp3.api.enums.MapMotionLockEnum.NO_MOTION,
        emp3.api.enums.MapMotionLockEnum.NO_ZOOM_NO_PAN,
        emp3.api.enums.MapMotionLockEnum.NO_ZOOM
      ];

      if (preventDefaultLockStates.includes(this.state.lockState)) {
        event.preventDefault();
      }

      EMPWorldWind.eventHandlers.notifyViewChange.call(this);
    },
    /**
     * Wrapper for mousedown
     * @see EMPWorldWind.eventHandlers.mouse.mousedown
     * @this EMPWorldWind.Map
     */
    mousedown: function(event) {
      var mousedownEvent = EMPWorldWind.utils.getEventCoordinates.call(this, event);

      mousedownEvent.type = emp.typeLibrary.Pointer.EventType.MOUSEDOWN;
      EMPWorldWind.eventHandlers.extractFeatureFromEvent.call(this, event, mousedownEvent);

      this.empMapInstance.eventing.Pointer(mousedownEvent);
    },
    /**
     * @see EMPWorldWind.eventHandlers.mouse.mouseup
     * @this EMPWorldWind.Map
     */
    mouseup: function(event) {
      var mouseupEvent = EMPWorldWind.utils.getEventCoordinates.call(this, event);
      mouseupEvent.type = emp.typeLibrary.Pointer.EventType.MOUSEUP;

      if (this.state.dragging) {
        this.state.dragging = false;
        EMPWorldWind.eventHandlers.notifyViewChange.call(this, emp3.api.enums.CameraEventEnum.CAMERA_MOTION_STOPPED);
      }

      this.state.autoPanning = EMPWorldWind.constants.NO_PANNING;
      this.empMapInstance.eventing.Pointer(mouseupEvent);
    },
    /**
     * @see EMPWorldWind.eventHandlers.mouse.mousemove
     * @this EMPWorldWind.Map
     */
    mousemove: function(event) {

      /**
       * Returns true if the location and buttons pressed are identical
       * @returns boolean
       * @private
       */
      var _filterDuplicateMouseEvents = function(event) {
        return event.clientX === this.state.lastInteractionEvent.clientX &&
          event.clientY === this.state.lastInteractionEvent.clientY &&
          event.buttons === this.state.lastInteractionEvent.buttons;
      }.bind(this);

      /**
       * Detects the location for auto-panning in smartMotion mode
       * @private
       */
      var _handleSmartMotion = function() {
        var smartAreaBuffer = 0.05,
          element = event.srcElement || event.originalTarget,
          elementBounds = element.getBoundingClientRect(),
          pan = {
            up: false,
            down: false,
            left: false,
            right: false
          };

        // Pan left or right
        pan.left = event.offsetX < elementBounds.width * smartAreaBuffer;
        pan.right = event.offsetX > elementBounds.width - (elementBounds.width * smartAreaBuffer);

        // Pan up or down
        pan.up = event.offsetY < elementBounds.height * smartAreaBuffer;
        pan.down = event.offsetY > elementBounds.height - (elementBounds.height * smartAreaBuffer);

        if (pan.up || pan.down || pan.left || pan.right) {
          this.spinGlobe(pan);
        } else {
          this.spinGlobe(false);
        }
      }.bind(this);

      /**
       * Checks if the event needs to be cancelled based on the lock state
       * @private
       */
      var _checkForPreventDefault = function() {
        var preventDefault = [
          emp3.api.enums.MapMotionLockEnum.NO_MOTION,
          emp3.api.enums.MapMotionLockEnum.NO_PAN,
          emp3.api.enums.MapMotionLockEnum.NO_ZOOM_NO_PAN,
          emp3.api.enums.MapMotionLockEnum.SMART_MOTION
        ];

        if (preventDefault.includes(this.state.lockState)) {
          event.preventDefault();
        }
      }.bind(this);

      // Some browsers pass mouse and pointer events events separately, only handle the first one through
      if (this.state.lastInteractionEvent && _filterDuplicateMouseEvents(event)) {
        return;
      }

      // Check if we prevent default
      _checkForPreventDefault();

      // If we are in a smartMotion state handle it
      if (this.state.lockState === emp3.api.enums.MapMotionLockEnum.SMART_MOTION) {
        _handleSmartMotion();
      }

      // Store the event
      this.state.lastInteractionEvent = event;

      // Update EMP (throttled)
      _notifyEMPPointing.call(this, event);

      // If right or left mouse or both notify the view must have changed
      if (event.buttons !== 0 && event.buttons < 3) {
        this.state.dragging = true;
        _notifyEMPViewChanged.call(this, emp3.api.enums.CameraEventEnum.CAMERA_IN_MOTION);
      } else {
        this.state.dragging = false;
      }
    }
  };
}());
