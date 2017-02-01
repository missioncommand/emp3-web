cmapi.channel.schema[cmapi.channel.names.MAP_VIEW_ZOOM] = { 
  "$schema":"http://json-schema.org/draft-04/schema#",
  "title":"map.view.zoom",
  "description":"Zoom the map to a particular range",
  "type":"object",
  "properties":{
    "range":{
      "description":"The distance in meters from the map (note that most 2-D map renderers do not support infinite zoom and the range will be translated into the nearest supported zoom level).",
      "type":"number",
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
    "range"
  ]  
};