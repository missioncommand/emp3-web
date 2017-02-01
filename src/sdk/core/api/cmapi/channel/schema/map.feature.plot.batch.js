cmapi.channel.schema["map.feature.plot.batch"] = {
  "$schema":"http://json-schema.org/draft-04/schema#",
  "title":"map.feature.plot.batch",
  "description":"Plots a batch of feature data on the map.",
  "type":"object",
  "properties":{
    "features":{
      "description":"An array of map.feature.plot payloads minus the messageId property.  See map.feature.plot for the object format and schema",
      "type":"Array"
    },
    "overlayId":{
      "description":"The default overlayId to be applied to all feature objects in the features array that don’t include an overlayId. I.e., similar behavior to CSS.  See map.feature.plot for more details",
      "type":"string",
      "default":""
    },
    "format":{
      "description":"The default format to be applied to all feature objects in the features array that don’t include a format value. I.e., similar behavior to CSS.  See map.feature.plot for definition of format property.",
      "type":"string",
      "default":""
    },
    "zoom":{
      "description":"Whether the map should zoom to the newly loaded feature data.  See map.feature.plot for definition of format property.",
      "type":"boolean",
      "default":""
    },
    "readOnly":{
      "description":"The default value for readOnly to be applied to all feature objects in the features array that don’t include a readOnly value. I.e., similar behavior to CSS.  See map.feature.plot for definition of readOnly property.",
      "type":"boolean",
      "default":""
    },
    "messageId":{
      "description":"A globally unique ID that identifies this particular message batch.  If the messageId property is populated, maps that support the user manipulation extension MUST use this messageId in the map.message.complete, map.message.progress, and map.message.cancel messages as defined in the User Manipulation extension to indicate progress and either completion or cancellation (as appropriate) of the message batch.",
      "type":"string",
      "extension":"User Manipulation - Message Complete"
    },
    "menuId":{
      "description":"The default format to be applied to all feature objects in the features array that don’t include a menuId value. I.e., similar behaviour to CSS.  See map.feature.plot for definition of menuId property.",
      "type":"string",
      "extension":"User Manipulation - Context Menus"
    }    
  },
  "required":[
    "features"
  ]  
};
