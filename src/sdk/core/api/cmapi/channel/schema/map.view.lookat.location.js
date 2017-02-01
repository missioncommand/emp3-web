cmapi.channel.schema[cmapi.channel.names.MAP_VIEW_LOOKAT_LOCATION] = {
  "$schema":"http://json-schema.org/draft-04/schema#",
  "title":"map.view.lookat.location",
  "description":"Centers the camera on a particular location.",
  "type":"object",
  "properties":{
    "latitude":{
      "type":"number",
      "description":"The latitude value of the location",
      "minimum":"-90",
      "maximum":"90",
      "default": "0"
    },
    "longitude":{
      "type":"number",
      "description":"The longitude value of the location",
      "minimum":"-180",
      "maximum":"180",
      "default": "0"
    },
    "altitude": {
      "type":"number",
      "description":"The altitude value of the location",
      "default": "0"
    },
    "heading":{
      "type": "number",
      "description": "Direction (that is, North, South, East, West), in degrees. Default=0(North)",
      "minimum":"0",
      "maximum":"360",
      "default":"0"
    },
    "tilt":{
      "type": "number",
      "description": "Angle between the direction of the LookAt position and the normal to the surface of the Earth. A value of -90 indicates viewing directly down from above while 0 looks directly  at the horizon",
      "minimum": "-90",
      "maximum": "90",
      "default":"-90"
    },
    "range":{
      "description":"Distance in meters from the location specified",
      "type":"number",
      "default":"N/A"
    },
    "altitudeMode":{
      "description":"Specifies how the <altitude> specified for the LookAt point is interpreted.",
      "type":"string",
      "default":"clampToGround"
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
