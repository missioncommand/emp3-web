var EMPWorldWind = EMPWorldWind || {};
EMPWorldWind.eventHandlers = EMPWorldWind.eventHandlers || {};

/**
 * Throttles a function to a restrict the number of calls to it to prevent the engine from locking up under heavy use
 * @param {function} fn callback to throttle
 * @param {number} [threshold=20]
 * @param {context} scope
 * @returns {Function}
 */
EMPWorldWind.eventHandlers.throttle = function(fn, threshold, scope) {
  threshold = threshold || 20; // 20 ms throttle
  var last, deferTimer;

  return function() {
    var context = scope || this;

    var now = +new Date,
      args = arguments;
    if (last && now < last + threshold) {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function() {
        last = now;
        fn.apply(context, args);
      }, threshold);
    }
    else {
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
 * @this EMPWorldWind.Map
 */
EMPWorldWind.eventHandlers.notifyViewChange = function(viewEventType) {
  var view = {
    range: this.worldWindow.navigator.range,
    tilt: this.worldWindow.navigator.tilt,
    roll: this.worldWindow.navigator.roll,
    heading: this.worldWindow.navigator.heading,
    altitude: this.worldWindow.navigator.range, // TODO this is not correct, just an approximation until camera support
    location: {
      lat: this.worldWindow.navigator.lookAtLocation.latitude,
      lon: this.worldWindow.navigator.lookAtLocation.longitude
    },
    bounds: this.getBounds()
  };

  var lookAt = {
    range: this.worldWindow.navigator.range,
    tilt: this.worldWindow.navigator.tilt,
    heading: this.worldWindow.navigator.heading,
    altitude: this.worldWindow.navigator.lookAtLocation.altitude || 0,
    latitude: this.worldWindow.navigator.lookAtLocation.latitude,
    longitude: this.worldWindow.navigator.lookAtLocation.longitude
  };

  //optimization . isMapMoving uses an epsilon to reduce the calls to triggerRenderUpdate function.
  if (this.isMapMoving()) {
    this.empMapInstance.eventing.ViewChange(view, lookAt, viewEventType);
    this.singlePointAltitudeRangeMode = EMPWorldWind.utils.getSinglePointAltitudeRangeMode(this.worldWindow.navigator.range, this.singlePointAltitudeRanges);
    this.bounds = this.getBounds();
    // this.shapesInViewArea = this.pickShapesInViewRegion();
    EMPWorldWind.eventHandlers.triggerRenderUpdate.call(this);
    this.lastNavigator.range = this.worldWindow.navigator.range;
    this.lastNavigator.tilt = this.worldWindow.navigator.tilt;
    this.lastNavigator.roll = this.worldWindow.navigator.roll;
    this.lastNavigator.heading = this.worldWindow.navigator.heading;
    this.lastNavigator.lookAtLocation = emp.helpers.copyObject(this.worldWindow.navigator.lookAtLocation);
  }


};

/**
 * Notify the that a re-render of the MilStd graphics is required based off of a delta from the last time the renderer
 * was called. This may trigger based on altitude delta or distance delta.
 * @this EMPWorldWind.Map
 */
EMPWorldWind.eventHandlers.triggerRenderUpdate = function() {
  var featuresToRedraw = [];
  this.state.lastRender.bounds = this.getBounds();
  this.state.lastRender.altitude = this.worldWindow.navigator.range;

  /**
   * @param feature
   * @this EMPWorldWind.Map
   * @private
   */
  function _handleMidOrLowRange(feature) {
    feature.isHighAltitudeRangeImage = false;
    feature.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
    feature.feature.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
    feature.singlePointAltitudeRangeChanged = false;
  }

  /**
   * @param feature
   * @this EMPWorldWind.Map
   * @private
   */
  function _handleHighRange(feature) {
    feature.isHighAltitudeRangeImage = true;
    //  dot image based on affiliation
    feature.shapes[0].attributes._imageSource = EMPWorldWind.utils.selectHighAltitudeRangeImage(feature.feature.symbolCode);
    feature.shapes[0].highlightAttributes._imageSource = feature.shapes[0].attributes._imageSource;
    feature.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
    feature.feature.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
    feature.singlePointAltitudeRangeChanged = false;
  }

  /**
   * @param feature
   * @this EMPWorldWind.Map
   * @private
   */
  function _handleMultiPoint(features) {
    //if (this.isMilStdMultiPointShapeInViewRegion(feature.feature) && (!EMPWorldWind.Math.equalsEpsilon(feature.feature.range, this.lastNavigator.range, EMPWorldWind.Math.EPSILON3) ||
      //feature.feature.wasClipped)) {
      // optimization - update feature only if inside view region and  (range outside range epsilon or was clipped)
      EMPWorldWind.editors.EditorController.redrawMilStdSymbols.call(this,features);
    //}
  }

  /**
   * @param feature
   * @this EMPWorldWind.Map
   * @private
   */
  function _handleSinglePoint(feature) {
    var callRenderer = false;
    feature.singlePointAltitudeRangeChanged = feature.singlePointAltitudeRangeMode !== this.singlePointAltitudeRangeMode;

    if (feature.singlePointAltitudeRangeChanged) {
      if ((this.singlePointAltitudeRangeMode === EMPWorldWind.constants.SinglePointAltitudeRangeMode.LOW_RANGE) && (this.iconLabelOption !== 'none') ||
        this.singlePointAltitudeRangeMode === EMPWorldWind.constants.SinglePointAltitudeRangeMode.MID_RANGE) {
        callRenderer = true;
        _handleMidOrLowRange.call(this, feature);
      } else if (this.singlePointAltitudeRangeMode === EMPWorldWind.constants.SinglePointAltitudeRangeMode.HIGHEST_RANGE) {
        _handleHighRange.call(this, feature);
      }
    }

    // Redraw if necessary
    if (callRenderer) {
      this.plotFeature(feature);
    }
  }

  emp.util.each(Object.keys(this.features), function(featureId) {
    var feature = this.features[featureId];

    if (feature.feature.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL &&
      feature.feature.data.type === "LineString") {
        if (this.isMilStdMultiPointShapeInViewRegion(feature.feature) && (!EMPWorldWind.Math.equalsEpsilon(feature.feature.range, this.lastNavigator.range, EMPWorldWind.Math.EPSILON3) ||
          feature.feature.wasClipped))
          {
            featuresToRedraw.push(feature.feature);
          //  _handleMultiPoint.call(this, [feature]);
          }
    } else if (feature.feature.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL &&
      feature.feature.data.type === "Point") {
      // Optimization required
      _handleSinglePoint.call(this, feature);
    }
  }.bind(this));

  if (featuresToRedraw.length > 0)
  {
     _handleMultiPoint.call(this, featuresToRedraw);
  }

  this.worldWindow.redraw();
};

/**
 *
 * @param mouseEvent
 * @param empEventingArgs
 */
EMPWorldWind.eventHandlers.extractFeatureFromEvent = function(mouseEvent, empEventingArgs) {
  var obj, i,
    pickList = this.worldWindow.pick(this.worldWindow.canvasCoordinates(mouseEvent.clientX, mouseEvent.clientY)),
    len = pickList.objects.length;

  // Reverse down the list of features to get the topmost first (useful when editing)
  for (i = len - 1; i >= 0; i--) {
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
