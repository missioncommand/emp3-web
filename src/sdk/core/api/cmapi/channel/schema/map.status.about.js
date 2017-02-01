cmapi.channel.schema[cmapi.channel.names.MAP_STATUS_ABOUT] = { 
  "$schema":"http://json-schema.org/draft-04/schema#",
  "title":"map.status.about",
  "description":"Send out static information about the map implementation",
  "type":"object",
  "properties":{
    "version":{
      "type":"string",
      "default":" ",
      "description":"A comma delimited list of the version numbers of the Common Map Widget API that this map widget supports."
    },
    "type":{
      "enum":[
        "2-D",
        "3-D",
        "other"
      ],
      "default":" ",
      "description":"The type of map in the map widget.  Allowable values are 2-D, 3-D, or other."
    },
    "widgetName":{
      "type":"string",
      "default":" ",
      "description":"The registered name of the map widget which is consistent across all version of OWF and cannot change during a user's session. "
    },
    "instanceName":{
      "type":"string",
      "default":"N/A",
      "description":"The name of the widget on the users dashboard.  This name can be changed by the end user and by the widget developer in code so this name may change during a user's session.  "
    },
    "universalName":{
      "type":"string",
      "default":"N/A",
      "description":"The universal name of the map widget set in the widget registration.  This is not available in all versions of OWF."
    },
    "extensions":{
      "description":"An array of optional extensions that the widget supports.  Allowable values are intents, clustering, and userManipulation.  If no extensions are supported, then an empty array SHALL be sent.",
      "type":[
        "array",
        "enum"
      ],
      "default":"N/A",
      "uniqueItems":true,
      "items":{
        "anyOf":[
          "intents",
          "clustering",
          "userManipulation",
          "selected",
          null
        ]        
      }      
    }    
  },
  "required":[
    "version",
    "type",
    "widgetName",
    "extensions"
  ]  
};