cmapi.channel.schema[cmapi.channel.names.MAP_STATUS_VIEW] = { 
  "$schema":"http://json-schema.org/draft-04/schema#",
  "title":"map.status.view",
  "description":"Send out the current status of the map view",
  "type":"object",
  "properties":{
    "bounds":{
      "description":"Bounding box of area visible on map.",
      "type":"object",
      "default":" ",
      "properties":{
        "southWest":{
          "description":"Bottom right of the bounds",
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
        "northEast":{
          "description":"Top left of the bounds",
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
        }        
      },
      "required":[
        "southWest",
        "northEast"
      ]      
    },
    "center":{
      "type":"object",
      "default":" ",
      "description":"The current center of the map",
      "properties":{
        "lat":{
          "type":"number",
          "description":"The latitude of the location that was clicked",
          "minimum":"-90",
          "maximum":"90"
        },
        "lon":{
          "type":"number",
          "description":"The longitude of the location that was clicked",
          "minimum":"-180",
          "maximum":"180"
        }        
      },
      "required":[
        "lat",
        "lon"
      ]      
    },
    "range":{
      "description":"The current distance, in meters, map is zoomed out",
      "type":"number"
    },
    "requester":{
      "description":"ID of client that requested this status message be sent (if any).  If no requester, message is being sent due to a map view change",
      "type":"string",
      "status":"updated"
    }    
  },
  "required":[
    "bounds",
    "center",
    "range"
  ]  
};
