cmapi.channel.schema[cmapi.channel.names.MAP_STATUS_INITIALIZATION] = { 
  "$schema":"http://json-schema.org/draft-04/schema#",
  "title":"map.status.initialization",
  "description":"To receive notification of map events including the readiness, initialization and teardown of the map.",
  "type":"object",
  "properties":{
    "status":{
      "description":"Indicates the current state of the map.  This can be one of the following options: init, ready, teardown. 1.init - means the map has been launched but is not ready to begin accepting commands. 2.ready -  means the map is ready to begin accepting commands.  A map will be ready once it has finished loading. 3.teardown - indicates the user has closed the map and it is no longer available to use. 4.mapswapinprogress - A map swap process has started. A 'ready' status is issued when the process completes.",
      "enum":[
        "init",
        "ready",
        "teardown",
        "mapswapinprogress"
      ]      
    }    
  },
  "required":[
    "status"
  ]  
};
