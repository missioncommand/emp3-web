     //   'use strict';

        //return declare('app.map.controllers.MapCntrl', [SubscriptionMgr], {
            function MapCntrl (map, mapModel, mapViewList)
            {
            this.mapCntrlList =  [];
            this.mapView = map;
            this.mapModel = mapModel;
            this.mapViewList = mapViewList;
            this.ToolTip = null;
//
//            //constructor: function(mapView, mapModel, mapViewList){
//                var  __construct = function(map, mapModel, mapViewList){
//                this.mapView = map;
//                this.mapViewList = mapViewList;
//
//                var dafif = null;
//                var dds = null;
//
//                try {
//
//                    this.mapCntrlList = [];
//
//                    this.mapModel = mapModel;

//                    this.ToolTip = new TooltipDialog({
//                        id: 'ToolTip',
//                        onMouseLeave: function(){
//                            popup.close(this.ToolTip);
//                        }
//                    });

//                    this.MapCntrlList[TAIS_DATA_TYPE.GEN_POLY.Value] = new GenericPolygonMapCntrl(this.MapView, this.MapModel,
//                            this.MapViewList[TAIS_DATA_TYPE.GEN_POLY.Value]);
                    ///this.MapCntrlList[TAIS_DATA_TYPE.AIRSPACE.Value] = new AirspaceMapCntrl(this.MapView, this.MapModel,
                      this.mapCntrlList[TAIS_DATA_TYPE.AIRSPACE.Value] = new AirspaceMapCntrl(this.mapView,this.mapModel,
                            this.mapViewList[TAIS_DATA_TYPE.AIRSPACE.Value]);

//                    dafif = new DafifMapCntrl(this.MapView, this.MapModel, this.MapViewList[TAIS_DATA_TYPE.DAFIF_AIRPORT.Value]);
//                    this.MapCntrlList[TAIS_DATA_TYPE.DAFIF_AIRPORT.Value] = dafif;
//                    this.MapCntrlList[TAIS_DATA_TYPE.DAFIF_ROUTE.Value] = dafif;
//                    this.MapCntrlList[TAIS_DATA_TYPE.DAFIF_SUAS.Value] = dafif;
//
//                    dds = new DdsMapCntrl(this.MapView, this.MapModel, this.MapViewList[TAIS_DATA_TYPE.GRAPHIC.Value]);
//                    this.MapCntrlList[TAIS_DATA_TYPE.GRAPHIC.Value] = dds;
//                    this.MapCntrlList[TAIS_DATA_TYPE.SIGACT.Value] = dds;
//                    this.MapCntrlList[TAIS_DATA_TYPE.ENEMY_SIT.Value] = dds;
//                    this.MapCntrlList[TAIS_DATA_TYPE.IN.log.Value] = dds;
//                    this.MapCntrlList[TAIS_DATA_TYPE.DDS_WEATHER.Value] = dds;

//                    this.MapCntrlList[TAIS_DATA_TYPE.TRACK.Value] = new TrackMapCntrl(this.MapView, this.MapModel,
//                            this.MapViewList[TAIS_DATA_TYPE.TRACK.Value]);

//                    this.MapCntrlList[TAIS_DATA_TYPE.WEATHER.Value] = new WeatherMapCntrl(this.MapView, this.MapModel,
////                            this.MapViewList[TAIS_DATA_TYPE.WEATHER.Value]);
//                }
//                catch(error) {
//                    console.log('MapCntrl.constructor: ' + error);
//                }
//            }(map, mapModel, mapViewList);

            /* This adjusts the position, which relative to the div to a screen relative position */
            this.adjustPosition = function(position) {

                var div = null;
                var rect = null;
                var retPosition = null;

                try {

                    //div = dom.byId("mapDiv");
                   // rect = div.getBoundingClientRect();
                    retPosition = emp.helpers.copyObject(position);

                   // retPosition.x = position.x + rect.left;
                   // retPosition.y  = position.y + rect.top;

                    return retPosition;
                }
                catch(error) {
                    console.log('MapCntrl._adjustPosition: ' + error);
                }
            };

            this.getMapCntrl = function(type) {

                try {
                    return this.mapCntrlList[type.Value];

                }
                catch(error) {
                    console.log('MapCntrl.getMapCntrl: ' + error);
                }
            };

//            openDetailPanel: function(screenElement) {
//
//                try {
//
//                    if(screenElement.data && (screenElement.data.type !== null)) {
//
//                        if(screenElement.data.type === TAIS_DATA_TYPE.TRACK.Value) {
//
//                            topic.publish(CONSTANTS.OPEN_TRACK_CTRL, {mode: CONSTANTS.MODE_DETAIL, Id : screenElement.data.Id});
//                        }
//                    }
//
//                    if(screenElement.id && screenElement.id.data && (screenElement.id.data.type !== null)) {
//
//                        if(screenElement.id.data.type === TAIS_DATA_TYPE.AIRSPACE.Value) {
//
//                            topic.publish(CONSTANTS.ACM_SLCT, {
//                                Id : screenElement.id.data.Id
//                            });
//                        }
//                    }
//                }
//                catch(error) {
//                    console.log('MapCntrl._onOpenDetailPanel: ' + error);
//                }
//            },

            this.openPopupPanel = function(screenElement, position) {

                var ctrl = null;
                var innerHTML = null;
                var adjustPosition = null;

                try {

                    adjustPosition = this.adjustPosition(position);

                    if(screenElement.data && (screenElement.data.type !== null)) {
                        ctrl = this.MapCntrlList[screenElement.data.type];

                        if(ctrl) {

                            this.toolTip.set('innerHTML', ctrl.generateToolTip(screenElement));

                            popup.open({
                                popup: this.ToolTip,
                                x: adjustPosition.x,
                                y: adjustPosition.y
                            });
                        }
                    }
                    //preferred method going forward
                    else if(screenElement.id.data && (screenElement.id.data.type !== null)) {
                        ctrl = this.mapCntrlList[screenElement.id.data.type];

                        if(ctrl) {

                            this.ToolTip.set('innerHTML', ctrl.generateToolTip(screenElement));

                            popup.open({
                                popup: this.ToolTip,
                                x: adjustPosition.x,
                                y: adjustPosition.y
                            });
                        }
                    }
                }
                catch(error) {
                    console.log('MapCntrl._onOpenPopupPanel: ' + error);
                }
            };

            this.openRightMouseMenu = function(screenElementList, position) {

                var adjustPosition = null;
                var count = null;
                var ctrl = null;
                var div = null;
                var i = null;
                var idList = null;
                var menu = null;
                var prop = null;
                var rect = null;
                var singleElement = false;
                var tmpPosition = null;

                try {

                    adjustPosition = this.adjustPosition(position);

                    idList = [];

                    //Some screen objects which are made up by MapViewBase_generateWallShape are really 2 screen elements.
                    // The polyline and the wall.  We want to treat these as a single entity.
                    for(i = 0; i < screenElementList.length; i++) {

                        if(screenElementList[i] !== undefined) {

                            if(screenElementList[i].data && (screenElementList[i].data.Id !== null)) {

                                idList[screenElementList[i].data.Id] = screenElementList[i].data;
                            }
                            else if(screenElementList[i].id.data && (screenElementList[i].id.data.Id !== null)) {

                                idList[screenElementList[i].id.data.Id] = screenElementList[i].id.data;
                            }
                        }
                    }

                    count = 0;
                    for(prop in idList) {
                        count++;
                    }

                    if(count === 1) {
                        singleElement = true;
                    }

                    for(prop in idList) {

                        ctrl = this.MapCntrlList[idList[prop].type];

                        if(ctrl) {
                            
//                            if(!menu) {
//                                menu = new Menu();
//                            }
//
//                            ctrl.openRightMouseMenu(menu, singleElement, idList[prop]);
                        }
                    }

//                    if (menu) {
//
//                        // This makes the popup visible.
//                        menu.startup();
//
//                        //set where the popup should open up
//                        menu._scheduleOpen(dom.byId(this.MapView.getDomId()), null, adjustPosition);
//                    }
                }
                catch(error) {
                    console.log('MapCntrl.openRightMouseMenu: ' + error);
                }
            };

            this.destroy = function() {

                var i = null;

                try {

                    if(this.mapCntrlList) {

                        for(i = 0; i < this.mapCntrlList.length; i++) {

                            if (!this.mapCntrlList[i].isDestroyed())
                            {
                                this.mapCntrlList[i].destroy();
                            }
                        }
                        this.mapCntrlList = null;
                    }

                    //this.cancelSubscriptions();
                }
                catch(error) {
                    console.log('MapCntrl.destroy: ' + error);
                    new emp.typeLibrary.Error({
                        message: 'MapCntrl.destroy: ' + error.message,
                        level: emp.typeLibrary.Error.level.MINOR,
                        jsError: error
                    });
                }
            };
        };


