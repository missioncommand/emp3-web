cmapi.channel.schema[cmapi.channel.names.MAP_FEATURE_UNPLOT_BATCH] = {
  "$schema":"http://json-schema.org/draft-04/schema#",
  "title":"map.feature.unplot.batch",
  "description":"Remove collection of features from the map.",
  "type":"object",
  "properties":{
    "payloads":{
      "description":"An array of map.feature.unplot payloads minus the messageId.  See map.feature.unplot for the object format and schema",
      "type":"Array"
    },
    "overlayId":{
      "description":"when included at the array level, this value will be applied to all map.feature.unplot objects in the features array that don't include an overlayID. I.e., similar behavior to CSS.  See map.feature.unplot for definition of this property",
      "type":"string",
      "default":""
    },
    "messageId":{
      "description":"A globally unique ID that identifies this particular message batch.  If the messageId property is populated, maps that support the user manipulation extension MUST use this messageId in the map.message.complete, map.message.progress, and map.message.cancel messages as defined in the User Manipulation extension to indicate progress and either completion or cancellation (as appropriate) of the message batch.",
      "type":"string",
      "extension":"User Manipulation - Message Complete"
    }    
  },
  "required":[
    "payloads"
  ]  
};
