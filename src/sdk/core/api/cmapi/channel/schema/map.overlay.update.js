cmapi.channel.schema[cmapi.channel.names.MAP_OVERLAY_UPDATE] = {
  "$schema":"http://json-schema.org/draft-04/schema#",
  "title":"map.overlay.update",
  "description":"Update an existing overlay.",
  "properties":{
    "name":{
      "description":"The new name of the overlay. Note that overlay names do not have to be unique and are intended for display purposes only.",
      "type":"string",
      "default":"N/A"
    },
    "overlayId":{
      "description":"The unique ID of the overlay being updated. If no overlayId is included, default overlay with ID equal to sending widget’s ID is assumed. If an overlay with the given ID already exists, this message will update that overlay. If an overlay with the given ID does not exist, an error is generated.  Note that overlay IDs MUST be unique even across multiple parent overlays.",
      "type":"string",
      "default":"sending widget's ID"
    },
    "parentId":{
      "description":"The ID of the parent overlay that is associated with this overlay.  If no ID is provided, the overlay will keep its existing parentage.  If a parentId is provided, the parentage of the overlay will be changed to the new parentId.  If an overlay with an ID of parentId does not exist, a new overlay will be created and the parentage of the overlay identified by overlayId will be changed to the newly created parent overlay.",
      "type":"string",
      "default":"N/A"
    },
    "properties":{
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
    
  ]  
};
