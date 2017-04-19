var emp = window.emp || {};
emp.typeLibrary = emp.typeLibrary || {};

/**
 * @private
 * @memberOf emp.typeLibrary
 * @method
 * @constructor
 * @desc Constructs a Menu object.
 * @param {object} args - Object needed to create Menu Object
 *
 * @return {Menu}
 * @mixes emp.typeLibrary.base
 */
emp.typeLibrary.Menu = function(args) {
  // Need to check if this is a context menu or a create menu.
  this.intent = args.intent;
  this.coreId = emp.helpers.id.newGUID();

  if (args.menu) {
    //This is a create menu
    this.label = args.menu.label || "";
    this.menuId = args.menu.menuId || "";
    this.tooltip = args.menu.tooltip || "";
    this.items = args.menu.items || [];
    this.menuType = args.menu.menuType || null;
  } else {
    //This is a context menu
    this.items = args.menuItems || args.items;
    this.menuId = args.menuId;
    this.properties = args.properties;
    this.type = args.type;
    this.menuType = args.menuType || null;
    this.transactionId = args.transactionId;
    this.active = args.active;
    this.label = args.label;
    this.itemId = args.itemId;

  }

  /*
   if (args.hasOwnProperty("items")) {
   for (var i = 0; i < args.items.length; i = i + 1) {
   var item = new emp.typeLibrary.DrawMenu(args.items[i]);
   this.items.push(item);
   }
   }
   */
  this.schema = {
    "title": "EMP-Menu Schema",
    "type": "object",
    "properties": {
      "label": {
        "type": ["string", "null"]
      },
      "menuId": {
        "type": ["string", "null"]
      },
      "tooltip": {
        "type": ["string", "null"]
      },
      "items": {
        "type": ["array", "null"]
      },
      "type": {
        "type": ["string", "null"]
      },
      "menuType": {
        "type": ["string", "null"],
        "enum": [null,
          emp.typeLibrary.Menu.Type.MAP_GLOBAL,
          emp.typeLibrary.Menu.Type.OVERLAY_GLOBAL,
          emp.typeLibrary.Menu.Type.FEATURE_GLOBAL,
          emp.typeLibrary.Menu.Type.OBJECT_INSTANCE,
          emp.typeLibrary.Menu.Type.SUBMENU]
      },
      /** @todo enum */
      "properties": {
        "type": ["object", "null"],
        "properties": {
          "iconUrl": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "lineColor": {
            "type": "string"
          },
          "lineWidth": {
            "type": "string"
          },
          "fillColor": {
            "type": "string"
          }
        }
      },
      "active": {
        "type": ["boolean", "null"]
      },
      "itemLabel": {
        "type": ["string", "null"]
      },
      "transactionId": {
        "type": ["string", "null"]
      }
    }
  };
  switch (this.intent) {
    case "menu.draw.create":
      this.schema.required = [];
      break;
    case "menu.draw.remove":
      break;
    case "menu.draw.feature":
      break;
    case "menu.context.create":
      this.schema.required = ["menuId", "items"];
      this.schema.properties.menuId.type = "string";
      break;
    case "menu.context.remove":
      this.schema.required = ["menuId"];
      this.schema.properties.menuId.type = "string";
      break;
    case "menu.context.active":
      this.schema.required = ["menuId", "itemLabel", "active"];
      break;
    case "menu.context.clicked":
      this.schema.required = ["menuId", "itemId", "active"];
      break;
    default:
      break;
  }
  this.validate();
};

emp.typeLibrary.Menu.Type =
  {
    MAP_GLOBAL: 'mapglobal',          // Menu with items applicable to the map.
    OVERLAY_GLOBAL: 'overlayglobal',  // Menu with items applicable to all overlays.
    FEATURE_GLOBAL: 'featureglobal',  // Menu with items applicable to all features.
    OBJECT_INSTANCE: 'objectinstance',// Menu with items specifica to an
                                      // object instance. The object instance can
                                      // be a feature, overlay, or WMS service.
    SUBMENU: 'submenu'                // Menu that will be used as sub menu of
                                      // another menu.
  };

emp.typeLibrary.Menu.prototype.validate = emp.typeLibrary.base.validate;
