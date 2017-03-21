var EMPWorldWind = EMPWorldWind || {};
EMPWorldWind.eventHandlers = EMPWorldWind.eventHandlers || {};

/**
 * Throttles a function to a restrict the number of calls to it to prevent the engine from locking up under heavy use
 * @param {function} fn callback to throttle
 * @param {number} [threshold=20]
 * @param {context} scope
 * @returns {Function}
 */
EMPWorldWind.eventHandlers.throttle = function (fn, threshold, scope)
{
    threshold = threshold || 20; // 20 ms throttle
    var last, deferTimer;

    return function ()
    {
        var context = scope || this;

        var now = +new Date,
                args = arguments;
        if (last && now < last + threshold)
        {
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function ()
            {
                last = now;
                fn.apply(context, args);
            }, threshold);
        }
        else
        {
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
EMPWorldWind.eventHandlers.notifyViewChange = function (viewEventType)
{
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

    if (this.isMapMoving())
    {
        this.empMapInstance.eventing.ViewChange(view, lookAt, viewEventType);
        this.singlePointAltitudeRangeMode = EMPWorldWind.utils.getSinglePointAltitudeRangeMode(this.worldWindow.navigator.range, this.singlePointAltitudeRanges);
        this.shapesInViewArea = this.pickShapesInViewRegion();
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
 * @this EMPWorldWind.map
 */
EMPWorldWind.eventHandlers.triggerRenderUpdate = function ()
{
    // TODO trigger this less often or on a timer
    this.state.lastRender.bounds = this.getBounds();
    this.state.lastRender.altitude = this.worldWindow.navigator.range;

    emp.util.each(Object.keys(this.features), function (featureId)
    {
        var feature = this.features[featureId];

        // TODO check if the symbol is visible first
        if (feature.feature.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL &&
                feature.feature.data.type === "LineString")
        {
            if (this.isShapeInViewRegion (feature.id))
            {
                this.plotFeature(feature);
            }
        }
        else if (feature.feature.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL &&
                feature.feature.data.type === "Point")
        {
            //optimization
            var callRenderer = false;
            feature.singlePointAltitudeRangeChanged = feature.singlePointAltitudeRangeMode !== this.singlePointAltitudeRangeMode;

            if (feature.singlePointAltitudeRangeChanged && (this.singlePointAltitudeRangeMode === EMPWorldWind.constants.SinglePointAltitudeRangeMode.LOW_RANGE) && (this.iconLabelOption !== 'none'))
            {
                callRenderer = true;
                feature.isHighAltitudeRangeImage = false;
                feature.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
                feature.feature.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
                feature.singlePointAltitudeRangeChanged = false;
            }
            else if (feature.singlePointAltitudeRangeChanged && this.singlePointAltitudeRangeMode === EMPWorldWind.constants.SinglePointAltitudeRangeMode.MID_RANGE)
            {
                callRenderer = true;
                feature.isHighAltitudeRangeImage = false;
                feature.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
                feature.feature.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
                feature.singlePointAltitudeRangeChanged = false;
            }
            else if (feature.singlePointAltitudeRangeChanged && this.singlePointAltitudeRangeMode === EMPWorldWind.constants.SinglePointAltitudeRangeMode.HIGHEST_RANGE)
            {
                feature.isHighAltitudeRangeImage = true;
                //  dot image based on affiliation
                feature.shapes[0].attributes._imageSource = EMPWorldWind.utils.selectHighAltitudeRangeImage(feature.feature.symbolCode);
                feature.shapes[0].highlightAttributes._imageSource = feature.shapes[0].attributes._imageSource;
                feature.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
                feature.feature.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
                feature.singlePointAltitudeRangeChanged = false;
            }
            if (callRenderer)
            {
                this.plotFeature(feature);
            }
        }
    }.bind(this));
    this.worldWindow.redraw();
};

/**
 *
 * @param mouseEvent
 * @param empEventingArgs
 */
EMPWorldWind.eventHandlers.extractFeatureFromEvent = function (mouseEvent, empEventingArgs)
{
    var obj, i,
            pickList = this.worldWindow.pick(this.worldWindow.canvasCoordinates(mouseEvent.clientX, mouseEvent.clientY)),
            len = pickList.objects.length;

    for (i = 0; i < len; i++)
    {
        obj = pickList.objects[i];
        if (!obj.isTerrain)
        {
            if (obj.userObject.userProperties && obj.userObject.userProperties.id)
            {
                empEventingArgs.coreId = obj.userObject.userProperties.id;
                empEventingArgs.target = "feature";
                break;
            }
        }
    }
};
