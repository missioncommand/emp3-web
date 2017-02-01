cmapi.channel.schema[cmapi.channel.names.MAP_VIEW_CENTER_OVERLAY] = { 
  "$schema":"http://json-schema.org/draft-04/schema#",
  "title":"map.view.center.location",
  "description":"Center the map on a particular location. The map may also be zoomed as close as possible to the location or to a given range",
  "type":"object",
  "properties":{
    "location":{
      "description":"Location to be centered in map.",
      "default":"N/A",
      "type":"object",
      "properties":{
        "lat":{
          "type":"number",
          "description":"The latitude value of the point",
          "minimum":"-90",
          "maximum":"90"
        },
        "lon":{
          "type":"number",
          "description":"The longitude value of the point",
          "minimum":"-180",
          "maximum":"180"
        }        
      },
      "required":[
        "lat",
        "lon"
      ]      
    },
    "zoom":{
      "description":"If auto, map will adjust to zoom as close as possible to the given location in the user's viewable area. If a number, map will zoom to specified range in meters. If no zoom attribute is included, no zoom is performed.",
      "type":[
        "string",
        "number"
      ],
      "default":"N/A"
    },
    "messageId":{
      "description":"A globally unique ID that identifies this particular message. If the messageId property is populated, maps that support the user manipulation extension MUST use this messageId in the map.message.complete, map.message.progress, and map.message.cancel messages as defined in the User Manipulation extension to indicate progress and either completion or cancellation (as appropriate) of this message request.",
      "type":"string",
      "status":"new",
      "extension":"User Manipulation - Message Complete"
    }    
  },
  "required":[
    "location"
  ]  
};
