///////////////////////////////////////////////////////////////////////////////
// MapViewCntrl.js
//
// Copyright (c) 2014-2015 General Dynamics Inc.
// The Government has the right to use, modify, reproduce,
// release, perform, display ,or disclose this computer
// software or computer software documentation without restriction.
//
///////////////////////////////////////////////////////////////////////////////


    //return declare('app.map.controllers.MapViewCntrl', [SubscriptionMgr],{
        //return declare('js-lib.cesium.airspaces.controllers.MapViewCntrl', [],{
           function MapViewCntrl (map, mapModel)  
          {

        this.map = map;
        this.mapModel = mapModel;
        this.mapLocZoomTimer = null;

        this.UPDATE_MAPLOCZOOM= 100;
        this.UPDATE_DELAY= 50;

        this.OPERATION_ADD= 0;
        this. OPERATION_DELETE=1;

       // constructor= function(map, mapModel) {
//       var __construct= function(map, mapModel) {
//             
//
//            var prop = null;
//
//            this.mapModel = mapModel;
//
//            //create map reference
//            this.map = map;
//            
////            //Register for map layer changes
////            this.registerForMapLayerChanges();
////            
////            //Register for map location
////            this.registerForMapLocation();
////            
////            //Register for coordinate preference changes
////            this.registerForCoordPrefChange();
////            
////            //Register for go to location go to area
////            this.registerForGoToArea();
////            this.registerForGoToLocation();
//        }(map, mapModel);
        
        this.registerForCoordPrefChange= function() {

            //create a handler hitch needed so that when the _onCoordPrefChange is called the method
            //has the correct this context.
//            this.addSubscription(systemPreferencesModel.watch('coordPref', lang.hitch(this, this.onCoordPrefChange)));
//
//            //get the current value
//            var currentPref = systemPreferencesModel.get('coordPref');
//            this.onCoordPrefChange('coordPref', '_' + currentPref, currentPref);
        };
        
        //Register for go to area
        this.registerForGoToArea= function() {
            
            //the following subscribes for addPolygons
//            this.addSubscription(topic.subscribe(CONSTANTS.GO_TO_AREA, lang.hitch(this.map, this.map.gotoArea)));
        };
        
        //Register for go to location
        this.registerForGoToLocation= function() {
            
            //the following subscribes goto location
//            this.addSubscription(topic.subscribe(CONSTANTS.GO_TO_LOCATION, lang.hitch(this.map, this.map.gotoLocation)));
        };
        
        this.registerForMapLayerChanges= function() {
//
//            this.addSubscription(topic.subscribe(CONSTANTS.MAP_LAYERS_UPDATED, lang.hitch(this, function() {
//                this.map.mapUpdateLayers();
//            })));
        };
        
        this.registerForMapLocation= function() {

//            //receives an event telling us get the current map location.
//            this.addSubscription(topic.subscribe(CONSTANTS.GET_MAP_LOCATION, lang.hitch(this, function(obj) {
//
//                //gets and publishes the current map location
//               this.map.getLocationOnClick(obj.deferred);
//            })));
        };

        this.onCoordPrefChange= function(name, oldValue, value) {

//            this.mapModel.coordPref = value;
        };

        //Cleanup routine
        this.destroy = function() {
            
            try {
                
                //this.cancelSubscriptions();
            }
            catch(error) {
                console.log('MapViewCntrl.destroy= ' + error);
            }
        };
    };
