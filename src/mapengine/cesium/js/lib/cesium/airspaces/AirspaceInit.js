///////////////////////////////////////////////////////////////////////////////
// MapInit.js
//
// Copyright (c) 2014-2015 General Dynamics Inc.
// The Government has the right to use, modify, reproduce,
// release, perform, display ,or disclose this computer
// software or computer software documentation without restriction.
//
///////////////////////////////////////////////////////////////////////////////


     var AirspaceInit = function()
     {      
       // var airspaceInit = declare('airspaces.AirspaceInit', [], {

            this.airspaceMapView = null;
            this.initDeferred= null;
            this.mapView= null;
            this.mapViewList= null;
            this.mapModel= null;
            this.mapCntrl = null;
            this.mapViewCntrl= null;
            this.mouseHandler= null;
            this.toolTip = null;
            this.trackMapView = null;
            
              var  __construct = function() {
               //MapView =  mapView;
               //////// this.addSubscription(topic.subscribe(CONSTANTS.MAP_INIT, lang.hitch(this, this.initialize)));
               //this.initialize({});
                
                //Changing the line above with the lines below will allow a developer to bring up the application
                //without starting the map.  This is useful if you want to run the application without having access
                //to a WMS.  This is now deemed Kritsana mode :);  
//                this.addSubscription(topic.subscribe(CONSTANTS.MAP_INIT, lang.hitch(this, function(evt) {
//                    
//                    this.initDeferred = new Deferred();
//                    evt.callback(this.initDeferred.promise);
//                    this.initDeferred.resolve();
//                    this.initDeferred = null;
//                })));
            };

            this.initialize= function(empCesium) {
                var userBrowser = null;
                var dafif = null;
                var dds = null;
                var i = null;
                var isBrowserSupported = null;
                var textMessage = null;
                
                try {
                    isBrowserSupported = true;

                 /////   this.initDeferred = new Deferred();
                  ////  evt.callback(this.initDeferred.promise);
                    this.mapViewList = [];
                    
                    this.mapModel = new MapModel();
                     this.mapView = new MapView(empCesium, this.mapModel);
                    
                   //// this.MapView = new MapView('mapDiv', this.MapModel);
                    this.mapViewList[TAIS_DATA_TYPE.AIRSPACE.Value] = new AirspaceMapView(this.mapView, this.mapModel);
                    
                  ////  dafif = new DafifMapView(this.MapView);
//                    this.MapViewList[TAIS_DATA_TYPE.DAFIF_AIRPORT.Value] = dafif;
//                    this.MapViewList[TAIS_DATA_TYPE.DAFIF_ROUTE.Value] = dafif;
//                    this.MapViewList[TAIS_DATA_TYPE.DAFIF_SUAS.Value] = dafif;
                    
//                    dds = new DdsMapView(this.MapView);
//                    this.MapViewList[TAIS_DATA_TYPE.GRAPHIC.Value] = dds;
//                    this.MapViewList[TAIS_DATA_TYPE.SIGACT.Value] = dds;
//                    this.MapViewList[TAIS_DATA_TYPE.ENEMY_SIT.Value] = dds;
//                    this.MapViewList[TAIS_DATA_TYPE.IND_WARN.Value] = dds;
//                    this.MapViewList[TAIS_DATA_TYPE.DDS_WEATHER.Value] = dds;
//                    
//                    this.MapViewList[TAIS_DATA_TYPE.GEN_POLY.Value] = new GenericPolygonMapView(this.MapView);
                    
//                    this.MapViewList[TAIS_DATA_TYPE.TRACK.Value] = new TrackMapView(this.MapView);
//                    this.MapViewList[TAIS_DATA_TYPE.WEATHER.Value] = new WeatherMapView(this.MapView);
                    
                    //this.MapViewCntrl = new MapViewCntrl(this.MapView, this.MapModel);
                     this.mapViewCntrl = new MapViewCntrl(this.mapView,  this.mapModel);
//                    this.MapCntrl = new MapCntrl(this.MapView, this.MapModel, this.MapViewList);
                     this.mapCntrl = new MapCntrl(this.mapView, this.mapModel, this.mapViewList);
                     
                     
//                    this.MouseHandler = new MouseHandler(this.MapView, this.MapModel, this.MapViewList, this.MapCntrl);

                    this.mouseHandler = new MouseHandler(this.mapView, this.mapModel, this.mapViewList, this.mapCntrl);
                    this.mapView.setMapCntrl(this.mapCntrl);
                    
                    //goto the last known location
          ////          setTimeout(lang.hitch(this, function() {
                        
                        //Need to give Cesium sometime to load before going to location
                  ////      this.MapView.gotoLocation(systemPreferencesModel.map.location);
              ////      }), CONSTANTS.CESIUM_QUIESCE_TIME);
                    
                 //   this.initDeferred.resolve();
               //     this.initDeferred = null;
                    
              ///      unload.addOnUnload(window, lang.hitch(this, this.destroy));
                    
                    //check browser version and see if supported.
//                    userBrowser = window.navigator.userAgent;
//                    for(i = 0; i < config.nonSupportedBrowserList.length; i++) {
//                        
//                        if(userBrowser.contains(config.nonSupportedBrowserList[i])) {
//                            
//                            isBrowserSupported = false;
//                        }
//                    }
                    
//                    if(isBrowserSupported === false) {
//                        
//                        textMessage = "You browser is not currently supported.  To get the best\nexperience we recomment that you use:\n\n";
//                        
//                        for(i = 0; i < config.supportedBrowserList.length; i++) {
//                        
//                            textMessage = textMessage + config.supportedBrowserList[i] + "\n";
//                        }
//                        
//                        textMessage = textMessage + '\nI understand this browser may be not be compatible.';
//                        
//                        taisAlert(textMessage);
//                    }
 //acevedo
                    //this.mapCntrl.TAIS_DATA_TYPE = TAIS_DATA_TYPE;
                    
                    empCesium.mapCntrl = this.mapCntrl ;
                    empCesium.mouseHandler = this.mouseHandler;
                }
                catch(error) {
                    console.log('MapInit.initialize: ' + error);
                }
            };
            
            this.getMapcntrl = function()
            {
                return this.mapCntrl;
            }
            
            this.destroy= function() {
                
                var i = null;
                var valueList = null;
                
                try {
                    
                    if (this.mapCntrl) {

                        this.mapCntrl.destroy();
                        this.mapCntrl = null;
                    }

                    if (this.mapViewCntrl) {

                        this.mapViewCntrl.destroy();
                        this.mapViewCntrl = null;
                    }

                    if(this.mapModel) {
                        
                        this.mapModel.destroy();
                        this.mapModel = null;
                    }
                    
                    if (this.mapView) {

                        this.mapView.destroy();
                        this.mapView = null;
                    }
                    
                    //this.cancelSubscriptions();
                }
                catch (error) {
                    console.log('MapInit.destroy: ' + error);
                }
            };
        };

   
