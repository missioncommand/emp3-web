///////////////////////////////////////////////////////////////////////////////
// MouseHandler.js
//
// Copyright (c) 2014-2015 General Dynamics Inc.
// The Government has the right to use, modify, reproduce,
// release, perform, display ,or disclose this computer
// software or computer software documentation without restriction.
//
///////////////////////////////////////////////////////////////////////////////


      function MouseHandler(mapView, mapModel,  mapViewList, mapCntrl)
      {
       //   return declare('app.controllers.map.handler.MouseHandler', [SubscriptionMgr], {
        
        this.mapCntrl = mapCntrl;
        this.mapModel = mapModel;
        this.mapViewList = mapViewList;
        this.mapView = mapView;
        this.mode = null;
        
        //constructor= function(mapView, mapModel, mapViewList, mapCntrl) {
//        var    __construct= function(mapView, mapModel,  mapViewList, mapCntrl) {
//                
//            
//            this.mapView = mapView;
//            this.mapModel = mapModel;
//            this.mapViewList = mapViewList;
//            this.mapCntrl = mapCntrl;
//            
            this.mouseHandlerList = [];
            this.mouseHandlerList[TAIS_DATA_TYPE.AIRSPACE.Value] = new AirspaceDrawHandler(this.mapView, this.mapModel,
                    mapViewList[TAIS_DATA_TYPE.AIRSPACE.Value], this.mapCntrl.getMapCntrl(TAIS_DATA_TYPE.AIRSPACE));
          //  this.MouseHandlerList[TAIS_DATA_TYPE.GEN_POLY.Value] = new GenericPolygonDrawHandler(this.MapView, this.MapModel,
             //       mapViewList[TAIS_DATA_TYPE.GEN_POLY.Value], this.MapCntrl.getMapCntrl(TAIS_DATA_TYPE.GEN_POLY));
            
//        }(mapView, mapModel,  mapViewList, mapCntrl);
        
        this.registerForDrawEvent= function() {
            
//            try {
//            
//                //receives an event telling us to put the map in draw mode.
//                this.addSubscription(topic.subscribe(CONSTANTS.MAP_DRAW_MODE, emp.$.proxy(function(evt) {
//                     //this.addSubscription(topic.subscribe(CONSTANTS.MAP_DRAW_MODE, lang.hitch(this, function(evt) {
//
//                    var ctrl = null;
//                    
//                    ctrl = this.MouseHandlerList[evt.type];
//                    
//                    if(ctrl) {
//                        
//                        ctrl.initialize(CONSTANTS.MAP_DRAW_MODE, evt);
//                    }
//                }, this)));
//            }
//            catch(error) {
//                console.log('MouseHandler._registerForDrawEvent= ' + error);
//            }
        };
        
        this.registerForEditEvent= function() {
            
            try {
                
//                //receives an event telling us to put the map in edit mode.
//                this.addSubscription(topic.subscribe(CONSTANTS.MAP_EDIT_MODE, emp.$.proxy(function(evt) {
//                     //this.addSubscription(topic.subscribe(CONSTANTS.MAP_EDIT_MODE, lang.hitch(this, function(evt) {
//
//                    var ctrl = null;
//                    
//                    ctrl = this.MouseHandlerList[evt.type];
//                    
//                    if(ctrl) {
//                        
//                        ctrl.initialize(CONSTANTS.MAP_EDIT_MODE, evt);
//                    }
//                }, this)));
            }
            catch(error) {
                console.log('MouseHandler._registerForDrawEvent: ' + error);
            }
        };
        
        this.registerForDrawEvent();
         this.registerForEditEvent();
    };
