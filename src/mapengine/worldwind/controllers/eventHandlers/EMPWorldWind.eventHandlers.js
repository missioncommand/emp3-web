var EMPWorldWind = EMPWorldWind || {};
EMPWorldWind.eventHandlers = EMPWorldWind.eventHandlers || {};

/**
 * Throttles a function to a restrict the number of calls to it to prevent the engine from locking up under heavy use
 * @param {function} fn callback to throttle
 * @param {number} [threshold=20]
 * @param {context} scope
 * @returns {Function}
 */
EMPWorldWind.eventHandlers.throttle = function (fn, threshold, scope) {
  threshold = threshold || 20; // 20 ms throttle
  var last, deferTimer;

  return function () {
    var context = scope || this;

    var now = +new Date,
      args = arguments;
    if (last && now < last + threshold) {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
};

/**
 * Notifies the map the view has been updated
 *
 * NOTE: The altitude, latitude, and longitude for the returned view may not be accurate as they are still based on
 * the navigator which is based on the lookAt location.
 *
 * @param {emp3.api.enums.CameraEventType} [viewEventType]
 * @this EMPWorldWind.map
 */
EMPWorldWind.eventHandlers.notifyViewChange = function(viewEventType) {
  var view = {
    range: this.worldWind.navigator.range,
    tilt: this.worldWind.navigator.tilt,
    roll: this.worldWind.navigator.roll,
    heading: this.worldWind.navigator.heading,
    altitude: this.worldWind.navigator.range, // TODO this is not correct, just an approximation until camera support
    location: {
      lat: this.worldWind.navigator.lookAtLocation.latitude,
      lon: this.worldWind.navigator.lookAtLocation.longitude
    },
    bounds: EMPWorldWind.eventHandlers.getBounds.call(this)
  };

  var lookAt = {
    range: this.worldWind.navigator.range,
    tilt: this.worldWind.navigator.tilt,
    heading: this.worldWind.navigator.heading,
    altitude: this.worldWind.navigator.lookAtLocation.altitude || 0,
    latitude: this.worldWind.navigator.lookAtLocation.latitude,
    longitude: this.worldWind.navigator.lookAtLocation.longitude
  };

  this.empMapInstance.eventing.ViewChange(view, lookAt, viewEventType);

  // TODO Throttle this call
  //EMPWorldWind.eventHandlers.checkIfRenderRequired.call(this);
};

/**
 * Notify the that a re-render of the MilStd graphics is required based off of a delta from the last time the renderer
 * was called. This may trigger based on altitude delta or distance delta.
 */
EMPWorldWind.eventHandlers.checkIfRenderRequired = function() {
  // TODO see if this approach can be tuned to be more accurate
  var altitudeDeltaMin = this.state.lastRender.altitude - this.state.lastRender.altitude * 0.3;
  var altitudeDeltaMax = this.state.lastRender.altitude + this.state.lastRender.altitude * 0.3;

  var reRender = this.worldWind.navigator.range < altitudeDeltaMin || this.worldWind.navigator.range > altitudeDeltaMax;

  if (reRender) {
    // Update the last render location
    this.state.lastRender.location = new WorldWind.Location(
      this.worldWind.navigator.lookAtLocation.latitude,
      this.worldWind.navigator.lookAtLocation.longitude);

    this.state.lastRender.altitude = this.worldWind.navigator.range;

    // TODO trigger re-render
    // this.refresh();
  }
};

/**
 *
 * @param mouseEvent
 * @param empEventingArgs
 */
EMPWorldWind.eventHandlers.extractFeatureFromEvent = function(mouseEvent, empEventingArgs) {
  var obj, len,
    pickList = this.worldWind.pick(this.worldWind.canvasCoordinates(mouseEvent.clientX, mouseEvent.clientY));

  len = pickList.objects.length;
  for (var i = 0; i < len; i++) {
    obj = pickList.objects[i];
    if (!obj.isTerrain) {
      if (obj.userObject.userProperties && obj.userObject.userProperties.id) {
        empEventingArgs.coreId = obj.userObject.userProperties.id;
        empEventingArgs.target = "feature";
        break;
      }
    }
  }
};

/**
 * Current bounds of the worldWindow
 * @returns {Bounds}
 */
EMPWorldWind.eventHandlers.getBounds = function() {
  var northPick, southPick, eastPick, westPick,
    canvasBounds = this.worldWind.canvas.getBoundingClientRect(),
    leftOffset = canvasBounds.left,
    topOffset = canvasBounds.top,
    middleX = Math.floor(this.worldWind.viewport.width / 2),
    middleY = Math.floor(this.worldWind.viewport.height / 2);

  northPick = this.worldWind.pick(new WorldWind.Vec2(leftOffset + middleX, topOffset)).terrainObject();
  if (northPick) {
    northPick = northPick.position.latitude;
  } else {
    northPick = 90; // TODO estimate northBound from lookAtLocation
  }

  southPick = this.worldWind.pick(new WorldWind.Vec2(leftOffset + middleX, topOffset + this.worldWind.viewport.height)).terrainObject();
  if (southPick) {
    southPick = southPick.position.latitude;
  } else {
    southPick = -90; // TODO estimate southBound from lookAtLocation
  }

  eastPick = this.worldWind.pick(new WorldWind.Vec2(leftOffset + this.worldWind.viewport.width, topOffset + middleY)).terrainObject();
  if (eastPick) {
    eastPick = eastPick.position.longitude;
  } else {
    eastPick = 90; // TODO estimate eastBound from lookAtLocation
  }

  westPick = this.worldWind.pick(new WorldWind.Vec2(leftOffset, topOffset + middleY)).terrainObject();
  if (westPick) {
    westPick = westPick.position.longitude;
  } else {
    westPick = 90; // TODO estimate westBound from lookAtLocation
  }

  return {
    north: northPick,
    south: southPick,
    east: eastPick,
    west: westPick
  };
};
