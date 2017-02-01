/*global emp */

/**
 * Map Move is generated for Map driven Pointer event
 *
 * @class
 * @description This class is used to represent a pointer event.
 * A map implementation should never create an instance of the class.
 * @param {emp.typeLibrary.Pointer.ParameterType} args This argument contains all the data needed to create the class instance.
 */
emp.typeLibrary.Pointer = function (args) {
    /**
     * @private
     */
    this.globalType = emp.typeLibrary.types.POINTER;
    /**
     * @private
     */
    this.coreId = (function (args) {
        var oStorageItem;
        var oTemp;

        if (args.coreId)
        {
            // They gave us the coreId return it.
            oStorageItem = emp.storage.get.id({id: args.coreId});

            if (oStorageItem)
            {
                oTemp = oStorageItem.getObjectData(null,null);
                args.overlayId = oTemp.overlayId;
                args.featureId = oTemp.featureId || oTemp.id;
                args.parentId = oTemp.parentId;
                return oStorageItem.getCoreId();
            }
        }
        else if (args.overlayId && args.featureId)
        {
            // Else find the feature.
            oStorageItem = emp.storage.findFeature(args.overlayId, args.featureId);
        }

        // If the item is in storage return its coreId.
        if (oStorageItem === undefined)
        {
            return emp.helpers.id.newGUID();
        }
        return oStorageItem.getCoreId();
    }(args));

    /**
     * @field
     * @type number
     * @description This field indicates the latitude coordinate of the location
     * the pointer event occurred. It may be undefined if the event occurred off
     * the globe.
     */
    this.lat = args.lat;

    /**
     * @field
     * @type number
     * @description This field indicates the longitude coordinate of the location
     * the pointer event occurred. It may be undefined if the event occurred off
     * the globe.
     */
    this.lon = args.lon;

    /**
     * @field
     * @type {emp.typeLibrary.Pointer.EventType}
     * @description This field identifies the type of event that occurred.
     */
    this.type = args.type;

    /**
     * @field
     * @type {string}
     * @description This field provides the coordinates in MGRS format.
     */
    this.mgrs = args.mgrs;
    /**
     * @field
     * @type {emp.typeLibrary.Pointer.popupInfoType}
     * @description This field provides the object to be used by the feature popup window in the case the click target was a feature.
     */
    this.popupInfo = args.popupInfo || {title: "", content: ""};

    /**
     * @field
     * @type {emp.typeLibrary.Pointer.ButtonType}
     * @description This field identifies the button that generated or was active when the event was generated.
     */
    this.button = args.button;

    /**
     * @field
     * @type {emp.typeLibrary.Pointer.KeyType[]}
     * @description This field identifies the keys that were pressed when the event occurred.
     */
    this.keys = (args.keys? (((args.keys instanceof Array) && (args.keys.length > 0))? args.keys: ["none"]): ["none"]);

    /**
     * @field
     * @type {number}
     * @description This field indicates the client window x coordinate of the pointer device when the event occurred.
     */
    this.clientX = args.clientX || null;

    /**
     * @field
     * @type {number}
     * @description This field indicates the client window y coordinate of the pointer device when the event occurred.
     */
    this.clientY = args.clientY || null;

    /**
     * @field
     * @type {number}
     * @description This field indicates the screen x coordinate of the pointer device when the event occurred.
     */
    this.screenX = args.screenX || null;

    /**
     * @field
     * @type {number}
     * @description This field indicates the screen y coordinate of the pointer device when the event occurred.
     */
    this.screenY = args.screenY || null;
    /* EMP-238 EMP-205 Start */

    /**
     * @field
     * @type {number}
     * @description This field indicates the terrain elevation at the coordinates of the location
     * the pointer event occurred. It may be undefined if the event occurred off
     * the globe.
     */
    this.elevation = args.elevation || null;
    /* EMP-238 EMP-205 End*/

    /**
     * @field
     * @type {string}
     * @description If the event occurred over a feature, this field indicates the feature's identifier.
     */
    this.featureId = args.featureId;

    /**
     * @field
     * @type {string}
     * @description If the event occurred over a feature, this field indicates the feature's overlay ID.
     */
    this.overlayId = args.overlayId;

    /**
     * @field
     * @type {string}
     * @description If the event occurred over a feature, this field indicates the feature's parent ID.
     */
    this.parentId = args.parentId;

    /* EMP-198 start */
    this.target = args.target || "globe";
    /* EMP-198 end */
    /**
     * @private
     */
    this.menuId = args.menuId;
    /**
     * @private
     */
    this.menuItemId = args.menuItemId;

    /**
     * @field
     * @type {number}
     * @description This field contains the map scale when the event occurred.
     */
    this.scale = args.scale || null;

    /**
     * @field
     * @type {number}
     * @description This field contains the map range when the event occurred.
     */
    this.range = args.range || null;

    /**
     * @field
     * @type {emp.typeLibrary.BoundingBoxType}
     * @description This field contains the map view area coordinates when the event occurred.
     */
    this.bounds = args.bounds || null;

    /**
     * @private
     */
    this.schema = {
        "title": "map-pointer-event-schema",
        "type": "object",
        "properties": {
            "type": {
                "type": ["string", "null"]
                /*, Come back to this
				"enum": ["single", "double","mouseUp","mouseDown"]*/
            },
            "lat": {
                "type": ["number", "null"],
                "minimum": -90,
                "maximum": 90
            },
            "lon": {
                "type": ["number", "null"],
                "minimum": -180,
                "maximum": 180
            },
            "elevation": {
                "type": ["number", "null"]
            },
            "mgrs": {
                "type": ["string", "null"]
            },
            "button": {
                "type": ["string", "null"],
                "anyOf": [{
                    "format": "left"
                }, {
                    "format": "middle"
                }, {
                    "format": "right"
                }]
            },
            "keys": {
                "type": ["array", "null"],
                "items": {
                    "enum": ["alt", "ctrl", "shift", "none", "null"]
                }
            },
            "clientX": {
                "type": ["number", "null"]
            },
            "clientY": {
                "type": ["number", "null"]
            },
            "screenX": {
                "type": ["number", "null"]
            },
            "screenY": {
                "type": ["number", "null"]
            },
            "target": {
                "type": "string",
                "enum": ["globe", "feature", "overlay", "point", "water", "land", "sky", "space"]
            },
            "height": {
                "type": ["number", "null"],
                "minimum": 0
            },
            "width": {
                "type": ["number", "null"],
                "minimum": 0
            },
            "zoom": {
                "type": ["number", "null"],
                "minimum": 0
            },
            "scale": {
                "type": ["number", "null"],
                "minimum": 0
            },
            "bounds": {
                "type": ["object", "null"],
                "east": {
                    "type": ["number", "null"],
                    "minimum": -180,
                    "maximum": 180
                },
                "north": {
                    "type": ["number", "null"],
                    "minimum": -90,
                    "maximum": 90
                },
                "west": {
                    "type": ["number", "null"],
                    "minimum": -180,
                    "maximum": 180
                },
                "south": {
                    "type": ["number", "null"],
                    "minimum": -90,
                    "maximum": 90
                }
            }
        }
    };
    this.validate();
};
emp.typeLibrary.Pointer.prototype.validate = emp.typeLibrary.base.validate;

/**
 * @enum
 * @readonly
 * @description This enumeration encapsulates the valid value for Pointer type field.
 */
emp.typeLibrary.Pointer.EventType = {
    /**
     * @constant
     * @type string
     * @description This type indicates that the mouse pointer has moved.
     */
    MOVE: "move",
    /**
     * @constant
     * @type string
     * @description This type indicates that a mouse button as been released.
     */
    MOUSEUP: "mouseUp",
    /**
     * @constant
     * @type string
     * @description This type indicates that a mouse button as been pressed.
     */
    MOUSEDOWN: "mouseDown",
    /**
     * @constant
     * @type string
     * @description This type indicates that a mouse button as clicked once.
     */
    SINGLE_CLICK: "single",
    /**
     * @constant
     * @type string
     * @description This type indicates that a mouse button as clicked more than once.
     */
    DBL_CLICK: "double",
    DRAG: "drag",
    DRAG_COMPLETE: "dragComplete"
};

/**
 * @enum
 * @readonly
 * @description This enumeration encapsulates the valid value for Pointer button field.
 */
emp.typeLibrary.Pointer.ButtonType = {
    /**
     * @constant
     * @type string
     * @description This type indicates that the event involves the left button of the pointer device..
     */
    LEFT_BUTTON: "left",
    /**
     * @constant
     * @type string
     * @description This type indicates that the event involves the middle button of the pointer device..
     */
    MIDDLE_BUTTON: "middle",
    /**
     * @constant
     * @type string
     * @description This type indicates that the event involves the right button of the pointer device..
     */
    RIGHT_BUTTON: "right"
};

/**
 * @enum
 * @readonly
 * @description This enumeration encapsulates the valid value for Pointer key field.
 */
emp.typeLibrary.Pointer.KeyType = {
    /**
     * @constant
     * @type string
     * @description This value indicates that the alt key was pressed when the event occurred.
     */
    ALT_KEY: "alt",
    /**
     * @constant
     * @type string
     * @description This value indicates that the control key was pressed when the event occurred.
     */
    CTRL_KEY: "ctrl",
    /**
     * @constant
     * @type string
     * @description This value indicates that the shift key was pressed when the event occurred.
     */
    SHIFT_KEY: "shift",
    /**
     * @constant
     * @type string
     * @description This value indicates that no keys were pressed when the event occurred.
     */
    NO_KEY: "none"
};
/**
 * @typedef {object} emp.typeLibrary.Pointer.popupInfoType
 * @property {string} [title] The text title that will show for the feature popup window
 * @property {string} [content] The string representing HTML content to be displayed in the popup window
*/

/**
 * @typedef {object} emp.typeLibrary.Pointer.ParameterType
 * @property {number} [lat] This field indicates the latitude coordinate of the location
 * the pointer event occurred. It may be undefined if the event occurred off
 * the globe.
 * @property {number} [lon] This field indicates the longitude coordinate of the location
 * the pointer event occurred. It may be undefined if the event occurred off
 * the globe.
 * @property {number} [elevation] This field indicates the terrain elevation at the coordinates of the location
 * the pointer event occurred. It may be undefined if the event occurred off
 * the globe.
 * @property {!emp.typeLibrary.Pointer.EventType} type This field identifies the type of event that occurred.
 * @property {string} [mgrs] This field provides the coordinates in MGRS format.
 * @property {emp.typeLibrary.Pointer.ButtonType} [button] This field identifies the button that generated or was active when the event was generated.
 * @property {emp.typeLibrary.Pointer.KeyType[]} [keys] This field identifies the keys that were pressed when the event occurred.
 * @property {number} [clientX] This field indicates the x coordinate, relative to the top left of the client window, of the pointer device when the event occurred.
 * @property {number} [clientY] This field indicates the y coordinate, relative to the top left of the client window, of the pointer device when the event occurred.
 * @property {number} [screenX] This field indicates the x coordinate, relative to the top left of the screen, of the pointer device when the event occurred.
 * @property {number} [screenY] This field indicates the y coordinate, relative to the top left of the screen, of the pointer device when the event occurred.
 * @property {string} [coreId] If the event occurred over a feature, this field indicates the feature's coreId. It is used to populate the overlay, feature and parent Ids.
 * @property {string} [featureId] If the event occurred over a feature, this field indicates the feature's identifier.
 * @property {string} [overlayId] If the event occurred over a feature, this field indicates the feature's overlay ID.
 * @property {string} [parentId] If the event occurred over a feature, this field indicates the feature's parent ID.
 * @property {number} [scale] This field contains the map scale when the event occurred.
 * @property {number} [range] This field contains the map range when the event occurred.
 * @property {emp.typeLibrary.BoundingBoxType} [bounds] This field contains the map view area coordinates when the event occurred.
 */
