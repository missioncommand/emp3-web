///////////////////////////////////////////////////////////////////////////////
// MapModel.js
//
// Copyright (c) 2012-2015 General Dynamics Inc.
// The Government has the right to use, modify, reproduce,
// release, perform, display ,or disclose this computer
// software or computer software documentation without restriction.
//
///////////////////////////////////////////////////////////////////////////////

 function MapModel ()
 {
        this.airspaceOpacity= null;
        this.coordPref= null;
                
        //the feature dictionary contains airspaces.
        this.featureDictionaryAirspace= null;
        
        //the feature dictionary contains dafif airports.
        this.featureDictionaryDafifAirport= null;
        
        //the feature dictionary contains dafif routes.
        this.featureDictionaryDafifRoute= null;
        
        //the feature dictionary contains dafif suas.
        this.featureDictionaryDafifSUAS= null;
        
        //the feature dictionary contains dds weather.
        this.featureDictionaryDDSWeather= null;
        
        //the feature dictionary contains graphics.
        this.featureDictionaryGraphic= null;
        
        //the feature dictionary contains intel.
       this.featureDictionaryIntel= null;
        
        //the following is an array of dictionaries for the different types of track points
        this.featureDictionaryTrack= null;
        
        //history only exists for reported track points
        this.featureHistoryDictionary= null; 
        
        //the feature dictionary contains weatherReport.
        this.featureDictionaryWeather= null;
        
        //the feature dictionary contains weather warnings and advisory.
        this.featureDictionaryWWA= null;
        
        //the feature dictionary contains generic polygons.
        this.featureDictionaryGenericPolygons= null;
        
        //an array of stores which holds the different track points
        this.trackPoints= null;
    
        this.mapLocZoom= null;
        
        //Used for track icons
        this.icn_size= null;
        this.ICN_FONT_SIZE= 11;
        this.TRK_TXT_CLR= '#FFFFFF'; //red '#FF0000', orange  #FF8C00', off-white '#B8B8B8',
        
        this.FRIENDLY_COLOR= '#80E0FF';
        this.HOSTILE_COLOR= '#FF0000';
        this.NEUTRAL_COLOR= '#AAFFAA';
        this.UNKNOWN_COLOR= '#FFFF00';
        
        this.BLANK_MAP_IMAGE = 'js/app/resources/images/1x1.png';
        
        //The following are used to define what should be updated when _redrawMap is called.  These values are 
        //also used to define if a track or airspace should set to a flashing state in association with a boundary conflict.
        this.AIRSPACE_LAYER = 0;
        this.TRACK_LAYER = 1;
        
//         var  __construct = function() {
            //Dictionary used to keep track of the features (items which are displayed on the map).
            this.featureDictionaryAirspace = new EmpDictionary();
            
            this.featureDictionaryDafifAirport = new EmpDictionary();
            this.featureDictionaryDafifRoute = new EmpDictionary();
            this.featureDictionaryDafifSUAS = new EmpDictionary();
            
            this.featureDictionaryDDSWeather = new EmpDictionary();
            this.featureDictionaryGraphic = new EmpDictionary();
            this.featureDictionaryIntel = new EmpDictionary();
            
            this.featureDictionaryTrack = [];
            this.featureDictionaryTrack[CONSTANTS.REPORTED_TRACK] = new EmpDictionary();
            this.featureDictionaryTrack[CONSTANTS.NOW_PREDICTION] = new EmpDictionary();
            this.featureDictionaryTrack[CONSTANTS.FUTURE_PREDICTION] = new EmpDictionary();
            this.featureDictionaryTrack[CONSTANTS.GROUND_TRACK] = new EmpDictionary();
                        
            //this dictionary keeps the track history features.
            this.featureHistoryDictionary = new EmpDictionary();
            
            //this dictionary keeps the weather features.
            this.featureDictionaryWeather = new EmpDictionary();
            
            //this dictionary keeps the weather warning and advisory features.
            this.featureDictionaryWWA = new EmpDictionary();
            
            //this dictionary keeps the generic polygon features.
            this.featureDictionaryGenericPolygons = new EmpDictionary();
            
           /// this.mapLocZoom = systemPreferencesModel.get('map');
           this.airspaceOpacity = 1;
//        }();
        
        //This routine returns the correct track color to use, for a given symbolCode.
        this.determineColor= function(symbolCode) {
            
            var upperCaseSymbol = symbolCode.toUpperCase();
            
            if(upperCaseSymbol.substring(1,2) === 'F') {
                return this.FRIENDLY_COLOR;
            }
            else if(upperCaseSymbol.substring(1,2) === 'H') {
                return this.HOSTILE_COLOR;
            }
            else if(upperCaseSymbol.substring(1,2) === 'N') {
                return this.NEUTRAL_COLOR;
            }
            else if(upperCaseSymbol.substring(1,2) === 'U') {
                return this.UNKNOWN_COLOR;
            }
            else {
                console.info('determineColor: Unknown symbol code');
                return this.UNKNOWN_COLOR;
            }
        };
        
        this.getFeaturedictionaryairspace = function()
        {
            return this.featureDictionaryAirspace;
        }
        
        
        //This routine returns the value which is associated with the given dictionary and key.
        this.getFeatureFromDictionary= function(dictionary, key) {
            
            //The return from the dictionary is an object which contains the 
            //key and the value.
            var feature = dictionary.getItem(key);
            
            if(feature) {
                return feature.value;
            }
            else {
                return feature;
            }
        };
        
        this.destroy= function() 
        {
            
            try {
            
                if(this.featureDictionaryAirspace) {
                    
                    this.featureDictionaryAirspace.removeAll();
                    this.featureDictionaryAirspace = null;
                }
                
                if(this.featureDictionaryDafifAirport) {
                    
                    this.featureDictionaryDafifAirport.removeAll();
                    this.featureDictionaryDafifAirport = null;
                }
                
                if(this.featureDictionaryDafifRoute) {
                    
                    this.featureDictionaryDafifRoute.removeAll();
                    this.featureDictionaryDafifRoute = null;
                }
                
                if(this.featureDictionaryDafifSUAS) {
                    
                    this.featureDictionaryDafifSUAS.removeAll();
                    this.featureDictionaryDafifSUAS = null;
                }
                
                if(this.featureDictionaryDDSWeather) {
                    
                    this.featureDictionaryDDSWeather.removeAll();
                    this.featureDictionaryDDSWeather = null;
                }
                
                if(this.featureDictionaryGraphic) {
                    
                    this.featureDictionaryGraphic.removeAll();
                    this.featureDictionaryGraphic = null;
                }
                
                if(this.featureDictionaryIntel) {
                    
                    this.featureDictionaryIntel.removeAll();
                    this.featureDictionaryIntel = null;
                }
                
                if(this.featureDictionaryTrack[CONSTANTS.REPORTED_TRACK]) {
                    
                    //this.featureDictionaryTrack[CONSTANTS.REPORTED_TRACK].clear();
                    this.featureDictionaryTrack[CONSTANTS.REPORTED_TRACK] = null;
                }
                
                if(this.featureDictionaryTrack[CONSTANTS.NOW_PREDICTION]) {
                    
                    //this.featureDictionaryTrack[CONSTANTS.NOW_PREDICTION].clear();
                    this.featureDictionaryTrack[CONSTANTS.NOW_PREDICTION] = null;
                }
                
                if(this.featureDictionaryTrack[CONSTANTS.FUTURE_PREDICTION]) {
                    
                    //this.featureDictionaryTrack[CONSTANTS.FUTURE_PREDICTION].clear();
                    this.featureDictionaryTrack[CONSTANTS.FUTURE_PREDICTION] = null;
                }
                
                if(this.featureDictionaryTrack[CONSTANTS.GROUND_TRACK]) {
                    
                    //this.featureDictionaryTrack[CONSTANTS.GROUND_TRACK].clear();
                    this.featureDictionaryTrack[CONSTANTS.GROUND_TRACK] = null;
                }
                
                if(this.featureHistoryDictionary) {
                    
                    this.featureHistoryDictionary.removeAll();
                    this.featureHistoryDictionary = null;
                }
                
                if(this.featureDictionaryWeather) {
                    
                    this.featureDictionaryWeather.removeAll();
                    this.featureDictionaryWeather = null;
                }
                
                if(this.featureDictionaryWWA) {
                    
                    this.featureDictionaryWWA.removeAll();
                    this.featureDictionaryWWA = null;
                }
                
                if(this.featureDictionaryGenericPolygons) {
                    
                    this.featureDictionaryGenericPolygons.removeAll();
                    this.featureDictionaryGenericPolygons = null;
                }
            }
            catch(error) {
                console.log('MapModel.destroy: ' + error);
            }
        };
    };
    