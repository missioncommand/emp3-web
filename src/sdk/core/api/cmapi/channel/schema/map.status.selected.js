cmapi.channel.schema[cmapi.channel.names.MAP_STATUS_SELECTED] = { 
  "$schema":"http://json-schema.org/draft-04/schema#",
  "title":"map.status.selected",
  "description":"Send out the list of currently selected features.",
  "type":"object",
  "properties":{
    "overlayId":{
      "type":"string",
      "default":" ",
      "description":"The ID of the overlay which contains the selected objects."
    },
    "selectedFeatures":{
      "description":"An array of features from the identified overlay that are currently selected.",
      "type":"array",
      "default":" ",
      "properties":{
        "selectedFeature":{
          "description":"Individual selected feature object",
          "type":"object",
          "properties":{
            "featureId":{
              "type":"string",
              "description":"The ID of the feature that contains the selected object."
            },
            "selectedId":{
              "type":"string",
              "description":"The ID of the actual selected object (may be a sub-feature contained within the aggregate feature data with the given featureId)."
            },
            "selectedName":{
              "type":"string",
              "description":"The name of the selected object."
            }            
          },
          "required":[
            "featureId"
          ]          
        }        
      }      
    }    
  },
  "required":[
    "overlayId",
    "selectedFeatures"
  ]  
};
