cmapi.channel.schema[cmapi.channel.names.MAP_ERROR] = { 
  "$schema":"http://json-schema.org/draft-04/schema#",
  "title":"map.error",
  "description":"Map Widget reports errors occurred when attempting to process any message.",
  "type":"object",
  "properties":{
    "sender":{
      "type":"string",
      "default":" ",
      "description":"Sender ID of message that caused error."
    },
    "type":{
      "type":"string",
      "default":" ",
      "description":"Type of message that caused error."
    },
    "msg":{
      "type":"object",
      "default":" ",
      "description":"The message that caused error."
    },
    "error":{
      "type":"string",
      "default":" ",
      "description":"A description of the error."
    }    
  },
  "required":[
    "sender",
    "type",
    "msg",
    "error"
  ]  
};
