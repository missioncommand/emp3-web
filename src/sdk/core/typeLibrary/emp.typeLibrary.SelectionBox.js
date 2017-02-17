/* globals emp */

/**
 * @memberOf emp.typeLibrary
 *
 * @class
 * @description This class is used to represent a SelectionBox event.
 * A map implementation should never create an instance of the class.
 * @param {emp.typeLibrary.SelectionBox.ParameterType} args This argument contains all the data needed to create the class instance.
 */
emp.typeLibrary.SelectionBox = function (args) {
    /**
     * @private
     */
    this.globalType = emp.typeLibrary.types.SELECTION_BOX;
        
    /**
     * @field
     * @type {emp.typeLibrary.BoundingBoxType}
     * @description This field contains the dragstart/dragend coordinates when the event occurred.
     */
    this.bounds = args.bounds || null;

    /**
     * @field
     * @type {emp.typeLibrary.Pointer.ButtonType}
     * @description This field identifies the mouse button that generated or was active when the event was generated.
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
     * @description This field contains the map scale when the event occurred.
     */
    this.scale = args.scale || null;

    /**
     * @field
     * @type {number}
     * @description This field contains the map zoom when the event occurred.
     */
    this.zoom = args.zoom || null;

    /**
     * @private
     */
    this.schema = {
        "title": "map-selection-box-event-schema",
        "type": "object",
        "properties": {
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
            "scale": {
                "type": ["number", "null"],
                "minimum": 0
            },
            "zoom": {
                "type": ["number", "null"],
                "minimum": 0
            }
        }
    };
    this.validate();

    // after validation attempt to construct a valid CoreId
    /**
     * @private
     */
    this.coreId = emp.helpers.id.newGUID();

};
emp.typeLibrary.SelectionBox.prototype.validate = emp.typeLibrary.base.validate;

/**
 * @typedef emp.typeLibrary.SelectionBox.ParameterType
 * @property {emp.typeLibrary.BoundingBoxType} [bounds] This field contains the dragstart/dragend coordinates when the event occurred.
 * @property {emp.typeLibrary.Pointer.ButtonType} [button] This field identifies the button that generated or was active when the event was generated.
 * @property {emp.typeLibrary.Pointer.KeyType[]} [keys] This field identifies the keys that were pressed when the event occurred.
 * @property {number} [scale] This field contains the map scale when the event occurred.
 * @property {number} [zoom] This field contains the map zoom when the event occurred.
 */
