cmapi.channel.schema[cmapi.channel.names.MAP_STATUS_FORMAT] = { 
  "$schema":"http://json-schema.org/draft-04/schema#",
  "title":"map.status.format",
  "description":"Send out the list of data formats that the map widget supports; in other words, this map implementation supports the following feature data formats.",
  "type":"object",
  "properties":{
    "formats":{
      "description":"An array of the formats that this map supports. Note that for this version of the Common Map Widget API, all map implementations MUST support 'kml', 'geojson' and 'wms'.  Additional map formats MAY be supported.",
      "type":"array",
      "uniqueItems":true,
      "default":[
        "kml"
      ],
      "items":{
        "anyOf":[
          "kml",
          "geojson",
          "wms"
        ]        
      }      
    }    
  },
  "required":[
    "formats"
  ]  
};
