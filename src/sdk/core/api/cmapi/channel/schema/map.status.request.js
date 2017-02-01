cmapi.channel.mapStatusRequest = {
    requestTypes: {
      STATUS_REQUEST_ABOUT: "about",
      STATUS_REQUEST_FORMAT: "format",
      STATUS_REQUEST_VIEW: "view",
      STATUS_REQUEST_SELECTED: "selected",
      STATUS_REQUEST_SCREENSHOT: "screenshot",
      STATUS_REQUEST_INIT: "initialization",
      STATUS_REQUEST_COORD_SYSTEM: "coordinatesystem"
    }
};

cmapi.channel.schema[cmapi.channel.names.MAP_STATUS_REQUEST] = { 
  "$schema":"http://json-schema.org/draft-04/schema#",
  "title":"map.status.request",
  "description":"Request current status from the map. Map will send out requested map.status.xyz messages in response.",
  "type":"object",
  "properties":{
    "types":{
      "description":"An array of status types being requested. Map widgets MUST support status types of 'about', 'format', 'selected', 'view', and 'initialization' and MUST respond with the applicable status message (e.g., map.status.about, map.status.format, map.status.selected, map.status.view, and/or map.status.initialization). If the types attribute is not included, all status messages MUST be generated.",
      "type":"array",
      "items":{
        "enum":[
          "view",
          "format",
          "selected",
          "about",
          "initialization"
        ]        
      }      
    }    
  },
  "required":[
    
  ]  
};
