cmapi.channel.schema[cmapi.channel.names.MAP_FEATURE_PLOT] = { 
  "$schema":"http://json-schema.org/draft-04/schema#",
  "title":"map.feature.plot",
  "description":"Plots feature data on the map.",
  "type":"object",
  "properties":{
    "overlayId":{
      "description":"The ID of the overlay this feature should be loaded into. If an overlay with this ID already exists, the new feature is merged into existing overlay; otherwise, a new overlay is created. If no overlayId is included, default overlay with ID equal to sending widget's ID is used. If an overlay exists, it will retain its status (whether visible or hidden). If an overlay is created, it will be made visible.",
      "type":"string",
      "default":"sending widget's ID"
    },
    "featureId":{
      "description":"Unique identifier for the given feature data. Note that feature IDs MUST be unique within a given overlay. Reusing a feature ID will be considered a reload, with the original feature data being removed and replaced by the new feature data.",
      "type":"string",
      "default":"N/A"
    },
    "name":{
      "description":"Name for the given feature data. Note that feature names do not have to be unique and are intended for display purposes only.",
      "type":"string",
      "default":"N/A"
    },
    "format":{
      "description":"Data format of the given feature. All map implementations MUST support kml and geojson.  If no format is specified, the format defaults to kml. A list of formats supported by a particular map implementation may be obtained by querying the map using the map.status channel (see map.status).",
      "type":"string",
      "default":"kml"
    },
    "feature":{
      "description":"Feature data to be loaded into the map.   See Appendix A for additional information on required KML support, Appendix B for information on required GeoJSON, and Appendix C for information on Area of Interest (AOI) support.",
      "type":[
        "object",
        "string"
      ],
      "additionalProperties":true,
      "default":"N/A"
    },
    "zoom":{
      "description":"true if map should zoom to newly loaded feature data, false if not. Default is false.",
      "type":"boolean",
      "default":false
    },
    "readOnly":{
      "description":"Valid values are true or false. If true, then the end user MUST NOT be able to edit the feature from the map’s user interface, if false the end user MAY edit the feature from the map’s user interface. Default value is true.   If an edit takes place, the map SHOULD dispatch a map.feature.plot with the updated feature to ensure other widgets are aware that a change took place.",
      "type":"boolean",
      "default":true
    },
    "properties":{
      "additionalProperties":true,
      "description":"A free form object that can contain any additional JSON objects or elements to send with this message. This allows for extending this channel's message without inadvertently corrupting the CMAPI specified payload of the message.",
      "type":"object",
      "status":"new"
    },
    "messageId":{
      "description":"A globally unique ID that identifies this particular message. If the messageId property is populated, maps that support the user manipulation extension MUST use this messageId in the map.message.complete, map.message.progress, and map.message.cancel messages as defined in the User Manipulation extension to indicate progress and either completion or cancellation (as appropriate) of this message request.",
      "type":"string",
      "status":"new",
      "extension":"User Manipulation - Message Complete"
    },
    "menuId":{
      "description":"The id of a context menu. If populated, the context menu MUST have already been pre-registered via the map.menu.create channel. If populated, the context menu associated with this id will appear when the feature is 'right-clicked', allowing the user to invoke actions on the feature which will be handled by the widget which originally registered the context menu. If no menuId is assigned, the feature will not have a context menu associated when right-clicked.",
      "type":"string",
      "status":"new",
      "extension":"User Manipulation - Context Menus"
    }
  },
  "required":[
    "featureId",
    "feature"
  ]
};
