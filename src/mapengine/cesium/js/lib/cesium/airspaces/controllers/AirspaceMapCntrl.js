///////////////////////////////////////////////////////////////////////////////
// AirspaceMapCntrl.js
//
// Copyright (c) 2015 General Dynamics Inc.
// The Government has the right to use, modify, reproduce,
// release, perform, display ,or disclose this computer
// software or computer software documentation without restriction.
//
///////////////////////////////////////////////////////////////////////////////


//       function(declare, config, lang, topic, when, Queue, AIRSPACE_SHAPE_TYPE) {


//    function(declare, config, lang, topic, when, Queue) {

//   'use strict';

function  AirspaceMapCntrl(map, mapModel, airspaceMapView)
{

    this.aglAirspaceList =  [];
    this.aglQueue = null;
    this.aglRendererTimer = null;
    this.airspaceObserveHandle = null;
    this.airspaceUnderEdit = null;
    this.conflictObserveHandle = null;
    this.airspaceMapView = airspaceMapView;
    this.mapView = map;
    this.mapModel = mapModel;
    this.statefulWatchers = null;
    this.workingDefer = null;
    this.visibilityAirspaceResults = null;
    this.AGL_RENDER_DELAY = 2000;
    this.PRE_DIFF_TIME = null;
    this.POST_DIFF_TIME = null;

    //constructor: function(mapView, mapModel, airspaceMapView) {
//    var __constructor = function (map, mapModel, airspaceMapView)
//    {
//
//        // this.mapModel = mapModel;
//        //this.mapModel = {airspaceOpacity: 1.0};
//        this.mapModel = mapModel;
//
//        //create map reference
//        this.mapView = map;
//
//        this.airspaceMapView = airspaceMapView;
//
//        try
//        {
//
//            //this.PRE_DIFF_TIME = config.preShowAirspace * 60 * 1000;
//            // this.POST_DIFF_TIME = config.postShowAirspace * 60 * 1000;
//
//            //Initialize aglAirspaceList
//            this.aglAirspaceList = [];
//
////                //Initialize aglQueue which airspaces are added to when the are tessellated or un-tessellated.
////                this.aglQueue = new Queue();
////
////                //Register for airspace opacity changing
////                this.registerForAirspaceOpacityChange();
////
////                //RegisterForAirspaceChanges
////                this.registerForAirspaceChanges();
////
////                //Register for airspace under edit event
////                this.registerForAirspaceUnderEdit();
////
////                //Register for boundary alerts
////                this.registerForBoundaryAlerts();
////
////                //Register for enabling/disabling of airspaces
////                this.registerForEnableDisableOfAirspaces();
////
////                //Register for scale changes (zoom in or out)
////                this.registerForScaleChange();
////
////                //Register for terrain updates
////                this.registerForTerrainUpdates();
//        }
//        catch (error)
//        {
//            console.log('AirspaceMapCntrl.constructor: ' + error);
//        }
//    }(map, mapModel, airspaceMapView);

    this.registerForAirspaceOpacityChange = function ()
    {

        //create a handler hitch needed so that when the _onPrefChange is called the method
        //has the correct this context.
        this.addSubscription(systemPreferencesModel.watch('airspaceOpacity', emp.$.proxy(this.onAirspaceOpacityPrefChange, this)));
        //this.addSubscription(systemPreferencesModel.watch('airspaceOpacity', lang.hitch(this, this.onAirspaceOpacityPrefChange)));

        //get the current value
        var currentPref = systemPreferencesModel.get('airspaceOpacity');
        this.onAirspaceOpacityPrefChange('airspaceOpacity', '_' + currentPref, currentPref);
    };
            this.onAirspaceOpacityPrefChange = function (name, oldValue, value)
            {

                this.mapModel.airspaceOpacity = value;

                this.updateAirspaceOpacity();
            };

    //Handles changes to an airspace.  Airspaces are enabled or disabled via the visibility controller.
    this.registerForAirspaceChanges = function ()
    {
        //Handling changes to the store
        this.visibilityAirspaceResults = visCntlr.store[VISIBILITY_STORES.AIRSPACES.Value].query();

        // now listen for any visibility changes
        this.addSubscription(this.visibilityAirspaceResults.observe(emp.$.proxy(this.updateAirspaceVisibility, this), true));
        //this.addSubscription(this.visibilityAirspaceResults.observe(lang.hitch(this, this.updateAirspaceVisibility), true));

        //add the initial query list to the screen
        this.addToQueue(queueUtils.PRIORITY_HIGH, this.visibilityAirspaceResults, this.addAirspaceVisibility, this);

        // now listen for any airspace store changes
        this.airspaceObserveHandle = airspaceStore.observe(emp.$.proxy(this.updateAirspaceStore, this));
        //this.airspaceObserveHandle = airspaceStore.observe(lang.hitch(this, this.updateAirspaceStore));

        //Conflict processing may change the airspace conflict properties (AirspaceConflicts, WeatherConflicts) but it does not
        // what is displayed on the map.  We want to turn the observer off to alleviate processing.
        this.addSubscription(topic.subscribe(CONSTANTS.CONFLICT_IN_PROCESS, emp.$.proxy(function ()
        {
            //this.addSubscription(topic.subscribe(CONSTANTS.CONFLICT_IN_PROCESS, lang.hitch(this, function() {

            this.airspaceObserveHandle.remove();
        }, this)));

        //Turn on observer now that conflict processing has completed.
        this.addSubscription(topic.subscribe(CONSTANTS.CONFLICT_DONE_PROCESSING, emp.$.proxy(function ()
        {
            //this.addSubscription(topic.subscribe(CONSTANTS.CONFLICT_DONE_PROCESSING, lang.hitch(this, function() {

            //Handling changes to the store
            console.info('AirspaceMapCntrl.registerForAirspaceChanges: CONFLICT_DONE_PROCESSING Turning On airspace observer:');

            // now listen for any changes once working
            this.airspaceObserveHandle = airspaceStore.observe(lang.hitch(this, this.updateAirspaceStore));
        }, this)));
    };

    this.registerForAirspaceUnderEdit = function ()
    {

        this.addSubscription(topic.subscribe(CONSTANTS.AIRSPACE_UNDER_EDIT, emp.$.proxy(function (evt)
        {
            //this.addSubscription(topic.subscribe(CONSTANTS.AIRSPACE_UNDER_EDIT, lang.hitch(this, function(evt) {

            this.airspaceUnderEdit = evt;
        }, this)));
    };

    this.registerForBoundaryAlerts = function ()
    {

        var initResults = null;

        try
        {

            //Handling changes to the store
            initResults = conflictStore.query({ConflictType: CONFLICT_TYPE.AIRSPACETOTRACKICONFLICT.Value});

            // now listen for any changes
            this.conflictObserveHandle = conflictStore.observe(emp.$.proxy(this.updateHandleConflict, this));
            //this.conflictObserveHandle = conflictStore.observe(lang.hitch(this, this.updateHandleConflict));

            //add the initial query list to the screen
            this.addToQueue(queueUtils.PRIORITY_LOW, initResults, this.handleConflict, this);

            //Conflict processing may change the airspace conflict properties (AirspaceConflicts, WeatherConflicts) but it does not
            // what is displayed on the map.  We want to turn the observer off to alleviate processing.
            this.addSubscription(topic.subscribe(CONSTANTS.CONFLICT_IN_PROCESS, emp.$.proxy(function ()
            {
                //this.addSubscription(topic.subscribe(CONSTANTS.CONFLICT_IN_PROCESS, lang.hitch(this, function() {

                this.conflictObserveHandle.remove();
            }, this)));

            //Turn on observer now that conflict processing has completed.
            this.addSubscription(topic.subscribe(CONSTANTS.CONFLICT_DONE_PROCESSING, emp.$.proxy(function ()
            {
                //this.addSubscription(topic.subscribe(CONSTANTS.CONFLICT_DONE_PROCESSING, lang.hitch(this, function() {

                //Handling changes to the store
                console.info('AirspaceMapCntrl.registerForBoundaryAlerts: CONFLICT_DONE_PROCESSING Turning On boundary conflict observer:');

                //Handling changes to the store
                initResults = conflictStore.query({ConflictType: CONFLICT_TYPE.AIRSPACETOTRACKICONFLICT.Value});

                // now listen for any changes once working
                this.conflictObserveHandle = conflictStore.observe(lang.hitch(this, this.updateHandleConflict));

                //add the initial query list to the screen
                this.addToQueue(queueUtils.PRIORITY_LOW, initResults, this.handleConflict, this);
            }, this)));
        }
        catch (error)
        {

            console.info('AirspaceMapCntrl.registerForBoundaryAlerts: ' + error);
        }
    };

    this.registerForScaleChange = function ()
    {

        try
        {

            this.addSubscription(topic.subscribe(CONSTANTS.MAP_SCALE_CHANGE, emp.$.proxy(this.rerenderAGL, this)));
            //this.addSubscription(topic.subscribe(CONSTANTS.MAP_SCALE_CHANGE, lang.hitch(this, this.rerenderAGL)));
        }
        catch (error)
        {

            console.info('AirspaceMapCntrl.registerForScaleChange: ' + error);
        }
    };

    this.registerForTerrainUpdates = function ()
    {

        this.addSubscription(topic.subscribe(CONSTANTS.AGL_TERRAIN_RERENDER_AGL_SHAPES, emp.$.proxy(this.rerenderAGL, this)));
        //this.addSubscription(topic.subscribe(CONSTANTS.AGL_TERRAIN_RERENDER_AGL_SHAPES, lang.hitch(this, this.rerenderAGL)));
    };

    this.airspaceVisibility = function (item)
    {

        var wrapper = null;

        if (item.operation === this.OPERATION_ADD)
        {

            this.addAirspaceVisibility(item.obj);
        }
        else if (item.operation === this.OPERATION_DELETE)
        {

            this.deleteAirspaceVisibility(item.obj);
        }
    };

    // Adds an airspace
    this.addAirspace = function (airspace)
    {

        var airspaceShapeType = null;
        var boundaryAlert = null;
        var conflictList = null;
        var defer = null;
        var feature = null;
        var i = null;
        var id = null;
        var prePost = null;
        var tmpConflict = null;

        try
        {

            conflictList = [];

            //If airspaces are turned off in the layer/data controller return.
//                if(systemPreferencesModel.layers.airspaces === false) {
//                    return;
//                }

            if (airspace === undefined)
            {
                return;
            }

            //feature = this.mapModel.getFeatureFromDictionary(this.mapModel.featureDictionaryAirspace, airspace.Id);

//                if(feature) {
//
//                    console.info('AirspaceMapCntrl.addAirspace: Attempted to add an airspace which is already being displayed.');
//                    return;
//                }

            //get the track airspace boundary alerts (conflicts) list
            // boundaryAlert = conflicts.conflictType[conflicts.AIRSPACE_AIRTRACK][conflicts.AIRSPACE].entry(airspace.Id);

//                if(boundaryAlert) {
//
//                    for(i = 0; i < boundaryAlert.value.length; i++) {
//
//                        tmpConflict = conflictStore.get(boundaryAlert.value[i]);
//
//                        if(tmpConflict) {
//                            conflictList.push(tmpConflict);
//                        }
//                    }
//
//                    //there are conflicts, determine if we should render the airspace as having boundary alerts
//                    boundaryAlert = airspaceUtils.isAirspaceInConflictWithTrack(airspace, conflictList, true);
//                }
//                else {
//
//                    boundaryAlert = false;
//                }

            // prePost = this.determinePrePostShow(airspace);
            //acevedo
            //prePost = {preShow : false, postShow : false};
            prePost = {preShow: false, postShow: false};
            boundaryAlert = {};// todo

            //generate the id
//                id = this.generateAirspaceId(airspace);
            id = airspace.Id;
            //next line of code takes care of adding tghe airspace to the emp layer.
            defer = this.airspaceMapView.createShape(id, airspace, this.mapModel.airspaceOpacity, false, boundaryAlert,
                    prePost.preShow, prePost.postShow);

            Cesium.when(defer, emp.$.proxy(function (retFeature)
            {
                //when(defer, lang.hitch(this, function(retFeature) {

                var middleAirspacePoint = null;
                var pointList = null;

                try
                {

                    if (retFeature)
                    {

                        // add the feature to the airspaceDictionary
                        this.mapModel.getFeaturedictionaryairspace().addItem(airspace.Id, retFeature);
                    }

                    //determine if airspace is an agl airspace if so add it to the agl list
                    // acevedo  - airspaceUtils missing. Assume all airspaces are above ground level.
                    // if(airspaceUtils.isAirspaceAGL(airspace)) {
                    if (true)
                    {

                        //determine points to look at
                        pointList = airspace.AirspacePoints;

                        //add the airspace to the agl list
                        this.aglAirspaceList[airspace.Id] = {
                            level: null,
                            points: pointList
                        };
                    }
                }
                catch (error)
                {

                    console.log('AirspaceMapCntrl.addAirspace Inner: ' + error + ' airspaceName: ' + airspace.Name +
                            ', airspaceId:' + airspace.Id);
                }
            }, this));

            return defer;
        }
        catch (error)
        {

            console.log('AirspaceMapCntrl.addAirspace: ' + error + ' airspaceName: ' + airspace.Name +
                    ', airspaceId:' + airspace.Id);
        }
    };

    //Adds features (airspaces) to the map.
    this.addAirspaceVisibility = function (object)
    {

        var tmpObject = null;

        if (object.Id)
        {
            tmpObject = object;
        }
        else
        {
            tmpObject = {Id: object};
        }

        //only add the item if it has not been added to the feature dictionary.
        var feature = this.mapModel.getFeatureFromDictionary(this.mapModel.getFeaturedictionaryairspace(), tmpObject.Id);

        //if feature already exists return.
        if (feature)
        {
            return;
        }

        var airspace = airspaceStore.get(tmpObject.Id);

        if (!airspace)
        {
            return;
        }

        this.addAirspace(airspace);
    };
            this.addToAGLQueue = function (airspaceId)
            {

                try
                {

                    if (airspaceId)
                    {

                        //If the airspaceId is already in the queue do not re-add it.
                        if (!this.aglQueue.contains(airspaceId))
                        {
                            this.aglQueue.enqueue(airspaceId);
                        }
                    }

                    if (!this.workingDefer)
                    {

                        try
                        {

                            var renderInfo = null;
                            var tmpAirspaceId = this.aglQueue.dequeue();

                            if (tmpAirspaceId)
                            {

                                //get the airspace out of the store
                                var airspace = airspaceStore.get(tmpAirspaceId);

                                if (airspace)
                                {

                                    renderInfo = this.aglAirspaceList[tmpAirspaceId];

                                    this.workingDefer = this.updateAirspace(airspace);

                                    console.info('AirspaceMapCntrl.addToAGLQueue, updating airspace:' + airspace.Name +
                                            ', number of points = ' + airspace.AirspacePoints.length);

                                    if (this.workingDefer)
                                    {

                                        Cesium.when(this.workingDefer, emp.$.proxy(function ()
                                        {
                                            //when(this.workingDefer, lang.hitch(this, function() {

                                            var levelOfDetail = null;
                                            var renderedInfo = null;

                                            renderedInfo = this.aglAirspaceList[airspace.Id];
                                            levelOfDetail = this.AirspaceMapView.determineAdequateTerrainDetailToRenderAGL(renderedInfo.points);

                                            //update the renderInfo level
                                            if (levelOfDetail)
                                            {

                                                renderInfo.level = levelOfDetail.levelOfDetail;
                                            }
                                            else
                                            {
                                                renderInfo.level = null;
                                            }

                                            this.aglAirspaceList[tmpAirspaceId] = renderInfo;

                                            //working remaining airspaces when time is available
                                            setTimeout(lang.hitch(this, function ()
                                            {

                                                this.workingDefer = null;
                                                this.addToAGLQueue(null);

                                            }), 500);
                                        }, this));
                                    }
                                }
                            }
                        }
                        catch (error)
                        {
                            console.log('AirspaceMapCntrl.addToAGLQueue, Inner: ' + error);
                        }
                    }
                }
                catch (error)
                {
                    console.log('AirspaceMapCntrl.addToAGLQueue: ' + error);
                }
            };
            // Deletes an airspace
            this.deleteAirspace = function (airspace)
            {

                var feature = null;

                try
                {

                    // pull airspace feature out of dictionary
                    feature = this.mapModel.getFeatureFromDictionary(this.mapModel.getFeaturedictionaryairspace(), airspace.Id);

                    if (feature)
                    {

                        this.AirspaceMapView.deleteAirspace(feature);

                        // remove it from the dictionary
                        this.mapModel.getFeaturedictionaryairspace().removeItem(airspace.Id);
                    }

                    //delete the airspace from the agl list
                    delete this.aglAirspaceList[airspace.Id];
                }
                catch (error)
                {

                    console.log('AirspaceMapCntrl.deleteAirspace: ' + error);
                }
            };
            //Deletes features (airspaces) from the map.
            this.deleteAirspaceVisibility = function (object)
            {

                this.deleteAirspace(object);
            };

    this.determinePrePostShow = function (airspace)
    {

        var i = null;
        var postShowEndTime = null;
        var preShowStartTime = null;
        var retObj = null;
        var startTime = null;
        var stopTime = null;
        var tmpHeadTime = null;

        try
        {

            //initialize return object
            retObj = {preShow: false, postShow: false};

            //if the airspace is not in the approved state fast fail
            if (airspace.AirspaceState !== AIRSPACE_STATE.APPROVED.Value)
            {
                return retObj;
            }

            //If pre and post show are not enabled fast fail.
            if ((systemPreferencesModel.airspacePreShow === false) && (systemPreferencesModel.airspacePostShow === false))
            {

                return retObj;
            }

            //console.info(' direction = ' + timeModel.direction + ', mode = ' + timeModel.mode);

            if (timeModel.mode === PLAY_MODE.TIME_FILTERED.Value)
            {

                return retObj;
            }

            tmpHeadTime = Date.parse(timeModel.headTime);

            for (i = 0; i < airspace.ActiveTimes.length; i++)
            {

                if (systemPreferencesModel.airspacePreShow === true)
                {

                    startTime = Date.parse(airspace.ActiveTimes[i].StartTime);
                    preShowStartTime = startTime - this.PRE_DIFF_TIME;

                    if (timeModel.direction === PLAY_DIRECTION.FORWARD.Value)
                    {

                        if ((preShowStartTime <= tmpHeadTime) && (tmpHeadTime < startTime))
                        {
                            retObj.preShow = true;
                        }
                    }
                    else
                    {

                        if ((preShowStartTime < tmpHeadTime) && (tmpHeadTime <= startTime))
                        {
                            retObj.preShow = true;
                        }
                    }
                }

                if (systemPreferencesModel.airspacePostShow === true)
                {

                    stopTime = Date.parse(airspace.ActiveTimes[i].EndTime);
                    postShowEndTime = stopTime + this.PRE_DIFF_TIME;

                    if (timeModel.direction === PLAY_DIRECTION.FORWARD.Value)
                    {

                        if ((stopTime <= tmpHeadTime) && (tmpHeadTime < postShowEndTime))
                        {
                            retObj.postShow = true;
                        }
                    }
                    else
                    {

                        if ((stopTime < tmpHeadTime) && (tmpHeadTime <= postShowEndTime))
                        {
                            retObj.postShow = true;
                        }
                    }
                }
            }

//                console.info('AirspaceMapCntrl.determinePrePostShow, returning: ' + retObj.preShow + ', ' + retObj.postShow);
        }
        catch (error)
        {

            console.log('AirspaceMapCntrl.determinePrePostShow: ' + error);
        }

        return retObj;
    };
            this.generateAirspaceId = function (airspace)
            {

                var airspaceShape = null;
                var airspaceState = null;
                var airspaceType = null;
                var airspaceUsage = null;
                var centroid = null;
                var id = null;

                try
                {

                    id = {};
                    id.data = {};

                    // set attributes on feature data
                    id.data.type = TAIS_DATA_TYPE.AIRSPACE.Value;

                    id.data.Id = airspace.Id;
                    id.data.MapName = this.mapName;
                    id.data.Name = airspace.Name;

                    // initialize
                    id.data.Originator = '';
                    id.data.State = '';
                    id.data.AirspaceType = '';
                    id.data.Usage = '';

                    // As per the enitity team the originator is the ancestryInfo.source. Assumption is
                    // that the ancestryInfo is in time order.
                    if (airspace.AncestryInfo && (airspace.AncestryInfo.length >= 1) && (airspace.AncestryInfo[0].Source))
                    {
                        id.data.Originator = airspace.AncestryInfo[0].Source;
                    }

                    id.data.AirspaceShape = airspace.AirspaceShapeType;

                    airspaceState = AIRSPACE_STATE.getEnumByValue(airspace.AirspaceState);
                    if (airspaceState.Dsc)
                    {
                        id.data.State = airspaceState.Dsc;
                    }

                    id.data.AirspaceType = '';
                    if (!isNaN(airspace.AirspaceTypeUsage.AirspaceType))
                    {

                        airspaceType = AIRSPACE_TYPE.getEnumByValue(airspace.AirspaceTypeUsage.AirspaceType);
                        if ((airspaceType) && (airspaceType.Abbr))
                        {
                            id.data.AirspaceType = airspaceType.Abbr;
                        }
                    }

                    id.data.Usage = '';
                    if (!isNaN(airspace.AirspaceTypeUsage.AirspaceUsage))
                    {

                        airspaceUsage = AIRSPACE_USAGE.getEnumByValue(airspace.AirspaceTypeUsage.AirspaceUsage);
                        if (airspaceUsage !== AIRSPACE_USAGE.NONE)
                        {
                            id.data.Usage = airspaceUsage.Abbr;
                        }
                        else if (!!airspace.AirspaceTypeUsage.UserDefinedUsage)
                        {
                            id.data.Usage = airspace.AirspaceTypeUsage.UserDefinedUsage;
                        }
                    }
                }
                catch (error)
                {

                    console.log('AirspaceMapCntrl.generateAirspaceId: ' + error);
                }

                return id;
            };
            this.generateToolTip = function (feature)
            {

                var htmlStr = null;

                try
                {

                    if (feature.id.data.Shape === AIRSPACE_SHAPE_TYPE.POINT.Value)
                    {

                        htmlStr = '<div>' + '<span class="mediumFontBold">Name</span>' + '<span>' +
                                feature.id.data.Name + '</span>';
                    }
                    else
                    {

                        htmlStr = '<div style="background-color: white; padding: 5px; border-radius: 5px;">' +
                                '<span class="mediumFontBold">Name</span>' + '<span>' +
                                feature.id.data.Name + '</span>' + '<br>' +
                                '<span class="smallFontBold">Originator</span>' +
                                '<span class="smallFont">' + feature.id.data.Originator + '</span>' +
                                '<br>' + '<span class="smallFontBold">State</span>' +
                                '<span class="smallFont">' + feature.id.data.State + '</span>' +
                                '<br>' + '<span class="smallFontBold">Type</span>' +
                                '<span class="smallFont">' + feature.id.data.AirspaceType + '</span>' +
                                '<br>' + '<span class="smallFontBold">Usage</span>' +
                                '<span class="smallFont">' + feature.id.data.Usage + '</span>';
                    }

                    if (feature.id.data.Point)
                    {

                        var tmpLatLng = {lat: feature.id.data.Lat, lon: feature.id.data.Lng};
                        var tmpCoords = coordinateUtils.convertLatLongToCoordString(systemPreferencesModel.coordPref,
                                tmpLatLng, false);

                        htmlStr = htmlStr + '<br>' + '<span class="smallFontBold">Coords</span>' +
                                '<span class="smallFont">' + tmpCoords + '</span>';
                    }

                    htmlStr = htmlStr + '<br>' + '</div>';
                }
                catch (error)
                {
                    console.log('AirspaceMapCntrl.generateToolTip: ' + error);
                }

                return htmlStr;
            };
            this.handleConflict = function (item)
            {

                var airspace = null;
                var boundaryAlert = null;
                var conflictList = null;
                var i = null;
                var inConflict = null;
                var screenElement = null;
                var tmpConflict = null;

                try
                {

                    conflictList = [];

                    airspace = airspaceStore.get(item.obj.AirspaceId);

                    if (airspace)
                    {

                        //get the existing track conflicts for the airspace
                        boundaryAlert = conflicts.conflictType[conflicts.AIRSPACE_AIRTRACK][conflicts.AIRSPACE].entry(airspace.Id);

                        for (i = 0; i < boundaryAlert.value.length; i++)
                        {

                            tmpConflict = conflictStore.get(boundaryAlert.value[i]);

                            if (tmpConflict)
                            {
                                conflictList.push(tmpConflict);
                            }
                        }

                        inConflict = airspaceUtils.isAirspaceInConflictWithTrack(airspace, conflictList, true);

                        screenElement = this.mapModel.getFeatureFromDictionary(this.mapModel.getFeaturedictionaryairspace(), airspace.Id);

                        if (screenElement)
                        {

                            //If the airspace is viewed as conflict, and the airspace is no longer in conflict, update the airspace.
                            if (screenElement.bottom && (inConflict === false))
                            {

                                //update the airspace on the screen
                                this.updateAirspace(airspace);
                            }
                            //If the airspace is NOT viewed as conflict, and the airspace is in conflict, update the airspace.
                            else if (!screenElement.bottom && (inConflict === true))
                            {

                                //update the airspace on the screen
                                this.updateAirspace(airspace);
                            }
                        }
                    }
                }
                catch (error)
                {
                    console.log('AirspaceMapCntrl.handleConflict: ' + error);
                }
            };
            this.onLayerChange = function (name, oldValue, value)
            {

                var airspaceList = null;
                var i = null;

                try
                {

                    //If the airspace layer value did change
                    if (oldValue.airspaces !== value.airspaces)
                    {

                        airspaceList = airspaceStore.query();

                        for (i = 0; i < airspaceList.length; i++)
                        {

                            if (systemPreferencesModel.layers.airspaces === true)
                            {

                                queueUtils.addElementToQueue(queueUtils.PRIORITY_HIGH, airspaceList[i], this.addAirspace, this);
                            }
                            else
                            {
                                queueUtils.addElementToQueue(queueUtils.PRIORITY_HIGH, airspaceList[i], this.deleteAirspace, this);
                            }
                        }
                    }
                }
                catch (error)
                {
                    console.log('AirspaceMapCntrl.onLayerChange: ' + error);
                }
            };
            this.openRightMouseMenu = function (parentMenu, singleElement, screenElement)
            {

                var airspace = null;
                var i = null;
                var menu = null;
                var popupMenuItem = null;
                var tmpLat = null;
                var tmpLong = null;
                var hasEditPermission = permissionCntrl.hasPermission(PERMISSION.EDIT_AIRSPACE.Value);

                try
                {

                    if (singleElement)
                    {

                        menu = parentMenu;
                    }
                    else
                    {

                        menu = new Menu();

                        popupMenuItem = new PopupMenuItem({
                            label: screenElement.Name,
                            popup: menu});

                        parentMenu.addChild(popupMenuItem);
                    }

                    airspace = airspaceStore.get(screenElement.Id);

                    menu.addChild(new MenuItem({
                        label: 'Details',
                        onClick: emp.$.proxy(function ()
                        {
                            //onClick : lang.hitch(this, function() {
                            topic.publish(CONSTANTS.ACM_SLCT, {
                                Id: screenElement.Id
                            });
                        }, this)
                    }));

                    if (airspace)
                    {

                        if (hasEditPermission && (airspace.ASISContained === false))
                        {

                            menu.addChild(new MenuItem({
                                label: 'Edit',
                                onClick: emp.$.proxy(function ()
                                {
                                    //onClick : lang.hitch(this, function() {

                                    topic.publish(CONSTANTS.INITIATE_EDIT_AIRSPACE, {
                                        Id: screenElement.Id
                                    });
                                }, this)
                            }));
                        }

                        if ((airspace.AirspaceShapeType !== AIRSPACE_SHAPE_TYPE.POINT.Value) &&
                                (airspace.AirspaceState === AIRSPACE_STATE.DRAFT.Value || hasEditPermission))
                        {

                            //adds or remove groups from airspaces
                            airspaceUtils.generateAirspaceGroupMenus(menu, [screenElement.Id]);
                        }

                        if (permissionCntrl.hasPermission(PERMISSION.SEND_MESSAGE.Value))
                        {

                            // Shows sub-menus for sending an airspace
                            airspaceUtils.generateAirspaceSendMenu(menu, [screenElement.Id]);
                        }
                    }

                    if (permissionCntrl.hasPermission(PERMISSION.EDIT_AIRSPACE_CONTAINER.Value))
                    {

                        // Shows sub-menus for with adding/removing Airspaces and ACPs to/from containers
                        airspaceUtils.generateMenus(menu, [screenElement.Id]);
                    }

                    menu.addChild(new MenuItem({
                        label: 'Hide',
                        onClick: emp.$.proxy(function ()
                        {
                            //onClick : lang.hitch(this, function() {
                            topic.publish(CONSTANTS.MAKE_ITEM_INVISIBLE, {type: VISIBILITY_STORES.AIRSPACES.Value, id: screenElement.Id});
                        }, this)
                    }));

                    if (airspace && (airspace.ASISContained === false))
                    {

                        //special processing for airspaces which are contained in an ASIS container
                        menu.addChild(new MenuItem({
                            label: 'Duplicate',
                            onClick: emp.$.proxy(function ()
                            {
                                //onClick : lang.hitch(this, function() {
                                topic.publish(CONSTANTS.COPY_AIRSPACE, {
                                    Id: screenElement.Id,
                                    OpenInEdit: true
                                });
                            }, this)
                        }));

                        if (airspace.AirspaceState === AIRSPACE_STATE.DRAFT.Value || hasEditPermission)
                        {

                            menu.addChild(new MenuSeparator());

                            menu.addChild(new MenuItem({
                                label: 'Delete',
                                onClick: emp.$.proxy(this.deleteItems, this)  // acevedo ojo
                                        //onClick: lang.hitch(this, this.deleteItems, screenElement.Id)  
                            }));
                        }
                    }
                }
                catch (error)
                {
                    console.log('AirspaceMapCntrl.openRightMouseMenu: ' + error);
                }
            };
            this.registerForEnableDisableOfAirspaces = function ()
            {

                this.addSubscription(systemPreferencesModel.watch('layers', emp.$.proxy(this.onLayerChange, this)));
                //this.addSubscription(systemPreferencesModel.watch('layers', lang.hitch(this, this.onLayerChange)));
            };

    this.rerenderAGL = function ()
    {

        try
        {

            if (!this.aglRendererTimer)
            {

                this.aglRendererTimer = setTimeout(emp.$.proxy(function ()
                {
                    //this.aglRendererTimer = setTimeout(lang.hitch(this, function() {

                    var airspace = null;
                    var levelOfDetail = null;
                    var renderedInfo = null;

                    try
                    {

                        //look at airspaces in the agl list and determine if they need to be rerendered
                        for (var airspaceId in this.aglAirspaceList)
                        {

                            renderedInfo = this.aglAirspaceList[airspaceId];

                            if (renderedInfo.level === null)
                            {

                                //the airspace can be tessellated
                                levelOfDetail = this.AirspaceMapView.determineAdequateTerrainDetailToRenderAGL(renderedInfo.points);

                                if (levelOfDetail)
                                {

                                    //addToAglQueue
                                    this.addToAGLQueue(airspaceId);
                                }
                            }
                            else
                            {

                                //the airspace can be untessellated
                                levelOfDetail = this.AirspaceMapView.determineAdequateTerrainDetailToRenderAGL(renderedInfo.points);

                                if (!levelOfDetail)
                                {

                                    this.addToAGLQueue(airspaceId);
                                }
                            }
                        }
                    }
                    catch (error)
                    {
                        console.log('AirspaceMapCntrl.rerenderAGL: ' + error);
                    }

                    this.aglRendererTimer = null;
                }, this), this.AGL_RENDER_DELAY);
            }
        }
        catch (error)
        {
            console.log('AirspaceMapCntrl.rerenderAGL: ' + error);
        }
    };

    // Routine which is called from MapCntrl to update the airspace opacity.
    this.updateAirspaceOpacity = function ()
    {

        try
        {

            var airspaceList = null;
            var i = null;

            airspaceList = airspaceStore.query();

            for (i = 0; i < airspaceList.length; i++)
            {

                queueUtils.addElementToQueue(queueUtils.PRIORITY_HIGH, airspaceList[i], this.updateAirspace, this);
            }
        }
        catch (error)
        {
            console.log('AirspaceMapCntrl.updateAirspaceOpacity: ' + error);
        }
    };

    // Updates an airspace
    this.updateAirspace = function (airspace)
    {

        var feature = null;
        try
        {

            // pull airspace feature out of dictionary
            feature = this.mapModel.getFeatureFromDictionary(this.mapModel.getFeaturedictionaryairspace(), airspace.Id);

            if (feature)
            {

                this.mapModel.getFeaturedictionaryairspace().removeItem(airspace.Id);

                //delete the airspace from the agl list
                delete this.aglAirspaceList[airspace.Id];
            }

            // add it back
            return this.addAirspace(airspace).then(emp.$.proxy(function ()
            {
                //return this.addAirspace(airspace).then(lang.hitch(this, function() {

                if (feature)
                {
                    this.AirspaceMapView.deleteAirspace(feature);
                }
            }, this));
        }
        catch (error)
        {

            console.log('AirspaceMapCntrl.updateAirspace: ' + error);
        }
    };

    //Called to update an airspace
    this.updateAirspaceStore = function (object, removedFrom, insertedInto)
    {

        //This should only handle updates to a airspace.  Adds and deletes
        //are dealt with by the visibility controller.
        // update existing object
        if ((removedFrom !== -1) && (insertedInto !== -1))
        {

            this.updateAirspace(object);
        }
    };

    //Adds or removes features (airspaces) to/from the map.
    this.updateAirspaceVisibility = function (object, removedFrom, insertedInto)
    {

        var airspace = null;
        var feature = null;
        var wrapper = null;

        try
        {
            //add airspace
            if ((insertedInto > -1) && (removedFrom === -1))
            {

                wrapper = {};
                wrapper.operation = this.OPERATION_ADD;
                wrapper.obj = object;
            }
            //delete airspace
            else if ((insertedInto === -1) && (removedFrom > -1))
            {

                wrapper = {};
                wrapper.operation = this.OPERATION_DELETE;
                wrapper.obj = object;
            }

            if (wrapper)
            {

                queueUtils.addElementToQueue(queueUtils.PRIORITY_HIGH, wrapper, this.airspaceVisibility, this);
            }
        }
        catch (error)
        {
            console.log('AirspaceMapCntrl.updateAirspaceVisibility: ' + error);
        }
    };

    this.updateHandleConflict = function (object, removedFrom, insertedInto)
    {

        var wrapper = null;

        try
        {

            //add conflict
            if ((insertedInto > -1) && (removedFrom === -1))
            {

                wrapper = {};
                wrapper.operation = this.OPERATION_ADD;
                wrapper.obj = object;
            }
            //delete conflict
            else if ((insertedInto === -1) && (removedFrom > -1))
            {

                wrapper = {};
                wrapper.operation = this.OPERATION_DELETE;
                wrapper.obj = object;
            }

            if (wrapper)
            {

                queueUtils.addElementToQueue(queueUtils.PRIORITY_MEDIUM, wrapper, this.handleConflict, this);
            }
        }
        catch (error)
        {
            console.log('AirspaceMapCntrl.updateHandleConflict: ' + error);
        }
    };

    this.deleteItems = function (selectedId)
    {

        var dialog = new ConfirmationDialog({
            message: 'Delete airspace?',
            buttonLabelMapping: {save: 'Delete', cancel: 'Cancel'}
        });

        Cesium.when(dialog.getPromise(), function (action)
        {
            if (action === 'Delete')
            {
                topic.publish(CONSTANTS.DELETE_AIRSPACE, {Id: selectedId});

            }
        });

        dialog.show();
    };

    //Cleanup routine
    this.isDestroyed = function ()
    {
        return (this.bDestroyed === true);
    };
    
    this.destroy = function ()
    {

        try
        {
            this.bDestroyed = true;
            //cleanup stateful watchers
            //if (this.statefulWatchers) {
            //    this.statefulWatchers.cancelSubscriptions();
            //}

            //cleanup airspace observer
            if (this.airspaceObserveHandle)
            {
                this.airspaceObserveHandle.remove();
            }

            if (this.conflictObserveHandle)
            {
                this.conflictObserveHandle.remove();
            }

            //this.cancelSubscriptions();
        }
        catch (error)
        {
            console.log('AirspaceMapCntrl.destroy: ' + error);
        }
    };
};
