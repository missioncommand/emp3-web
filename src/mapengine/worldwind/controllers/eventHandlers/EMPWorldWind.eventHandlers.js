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
        range: this.worldWind.navigator.range,
        tilt: this.worldWind.navigator.tilt,
        roll: this.worldWind.navigator.roll,
        heading: this.worldWind.navigator.heading,
        altitude: this.worldWind.navigator.range, // TODO this is not correct, just an approximation until camera support
        location: {
            lat: this.worldWind.navigator.lookAtLocation.latitude,
            lon: this.worldWind.navigator.lookAtLocation.longitude
        },
        bounds: this.getBounds()
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
    this.singlePointAltitudeRangeMode = EMPWorldWind.utils.getSinglePointAltitudeRangeMode(this.worldWind.navigator.range, this.singlePointAltitudeRanges);
    EMPWorldWind.eventHandlers.triggerRenderUpdate.call(this);
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
    this.state.lastRender.altitude = this.worldWind.navigator.range;

    emp.util.each(Object.keys(this.features), function (featureId)
    {
        var feature = this.features[featureId];

        // TODO check if the symbol is visible first
        if (feature.feature.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL &&
                feature.feature.data.type === "LineString")
        {
            this.plotFeature(feature.feature);
        }
        else if (feature.feature.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL &&
                feature.feature.data.type === "Point")
        {
            //optimizayion
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
                feature.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
                feature.feature.singlePointAltitudeRangeMode = this.singlePointAltitudeRangeMode;
                feature.singlePointAltitudeRangeChanged = false;
            }
            if (callRenderer)
            {
                this.plotFeature(feature.feature);
            }


        }
    }.bind(this));
    this.worldWind.redraw();
};

/**
 *
 * @param mouseEvent
 * @param empEventingArgs
 */
EMPWorldWind.eventHandlers.extractFeatureFromEvent = function (mouseEvent, empEventingArgs)
{
    var obj, len,
            pickList = this.worldWind.pick(this.worldWind.canvasCoordinates(mouseEvent.clientX, mouseEvent.clientY));

    len = pickList.objects.length;
    for (var i = 0; i < len; i++)
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
