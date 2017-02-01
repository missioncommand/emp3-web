/* globals emp */
/**
 * @class
 * @description The class represents a view change request or a view change event.
 * A map implementation should never create an instance of this class.
 * @param  {emp.typeLibrary.View.ParameterType} args Used to popular the view object
 */
emp.typeLibrary.View = function (args) {
    this.globalType = emp.typeLibrary.types.VIEW;
    this.transactionId = args.transactionId;
    this.sender = args.sender;
    this.requester = args.sender; // SHIM cmapi
    this.channel = args.channel;
    /* View by Id */
    this.overlayId = args.overlayId;
    this.featureId = args.featureId;
    this.parentId = args.parentId;
    /* Id logic */
    if (this.featureId && !this.overlayId) {
        this.overlayId = args.sender;
    }

    /* Camera */
    this.altitudeMode = args.altitudeMode || emp.constant.featureAltitudeModeType.CLAMP_TO_GROUND;
    this.range = (typeof (args.range) === "number") ? args.range : (typeof (args.zoom)) === "number" ? args.zoom : undefined; // this is mental
    this.altitude = (typeof (args.altitude) === "number") ? args.altitude : (typeof (args.zoom)) === "number" ? args.zoom : undefined; // this is mental
    this.scale = args.scale;
    this.zoom = args.zoom || false;
    this.tilt = args.tilt;
    this.roll = args.roll; // TODO is this the same as pan?
    this.heading = args.heading;
    this.animate = args.animate;


    /* Positional */
    this.location = args.location || args.center;

    //this.center = args.location || args.center; // SHIM cmapi
    this.bounds = args.bounds;
    if (this.bounds !== undefined &&
        this.bounds !== null &&
        args.bounds.southWest !== undefined &&
        args.bounds.southWest !== null &&
        args.bounds.northEast !== undefined &&
        args.bounds.northEast !== null) {
        //		this.bounds = args.bounds;
        this.bounds.west = args.bounds.southWest.lon;
        this.bounds.east = args.bounds.northEast.lon;
        this.bounds.south = args.bounds.southWest.lat;
        this.bounds.north = args.bounds.northEast.lat;
    }
    this.types = args.types;
    this.screenshot = args.screenshot;
/*
    this.schema = {
        "title": "EMP-View Schema",
        "type": "object",
        "properties": {
            "location": {
                "type": ["object", "null"],
                "properties": {
                    "lat": {
                        "type": "number",
                        "maximum": 90,
                        "minimum": -90
                    },
                    "lon": {
                        "type": "number",
                        "maximum": 180,
                        "minimum": -180
                    }
                }

            },
            "range": {
                "type": ["number", "null"]
            },
            "zoom": {
                "type": ["number", "string", "boolean", "null"]
            },
            // @todo Min? Max?
            "tilt": {
                "type": ["number", "null"]
            },
            // @todo Min? Max?
            "pan": {
                "type": ["number", "null"]
            },
            // @todo Min? Max?
            "heading": {
                "type": ["number", "null"],
                "maximum": 360,
                "minimum": -360
            }, // @todo Mills?
            "bounds": {
                "type": ["object", "null"],
                "properties": {
                    "north": {
                        "type": ["number", "null"],
                        "maximum": 90,
                        "minimum": -90
                    },
                    "south": {
                        "type": ["number", "null"],
                        "maximum": 90,
                        "minimum": -90
                    },
                    "east": {
                        "type": ["number", "null"],
                        "maximum": 180,
                        "minimum": -180
                    },
                    "west": {
                        "type": ["number", "null"],
                        "maximum": 180,
                        "minimum": -180
                    }
                }
            },
            "transactionId": {
                "type": ["string", "null"]
            }
        }

    };
    if (this.channel === "map.view.center.bounds") {
        this.schema.properties.bounds.type = "object";
        this.schema.required = ["bounds"];
    } else if (this.channel === "map.view.center.location") {
        this.schema.required = ["location"];
    } else if (this.channel === "map.view.center.feature") {
        this.schema.properties.featureId = {};
        this.schema.properties.featureId.type = "string";
        this.schema.required = ["featureId"];
    } else if (this.channel === "map.view.center.overlay") {
        this.schema.properties.overlayId = {};
        this.schema.properties.overlayId.type = "string";
        this.schema.required = ["overlayId"];
    }

    this.validate();
*/
    this.coreId = args.coreId;

    this.prepForExecution = function(){
        if ((this.coreId === undefined) || (this.coreId === null))
        {
            if ((this.featureId !== undefined) && (this.featureId !== null))
            {
                var oFeature = emp.storage.findFeature(this.overlayId, this.featureId);
                if (oFeature !== undefined)
                {
                    this.coreId = oFeature.getCoreId();
                }
                else
                {
                    this.coreId = emp.helpers.id.newGUID();
                }
            }
            else if ((this.overlayId !== undefined) && (this.overlayId !== null))
            {
                var oOverlay = emp.storage.findOverlay(args.overlayId);
                if (oOverlay !== undefined)
                {
                    this.coreId = oOverlay.getCoreId();
                }
                else
                {
                    this.coreId = emp.helpers.id.newGUID();
                }
            }
            else
            {
                this.coreId = emp.helpers.id.newGUID();
            }
        }
    };
};
emp.typeLibrary.View.prototype.validate = emp.typeLibrary.base.validate;


/**
 * @typedef {object} emp.typeLibrary.View.ParameterType
 * @property {string=} intent - The intent defines how the item is to be handled. The intents
 * for the View are: VIEW_SET and VIEW_GET
 * @property {(string|array)=} intentParams - For the VIEW_SET intent there are no intentParams.
 * For the VIEW_GET intent, the intent params is set to "view"
 * @property {string=} overlayId - The overlayId is the id for the overlay to be centered on.
 * @property {string=} featureId - The featureId is the id for the feature to be centered on.
 * @property {number=} range - The distance at which the view point should be placed.
 * @property {emp.typeLibrary.LatLonCoordinates=} location - The location is a point on the map for the camera to go to.
 * @property {number=} tilt - The tilt is the camera's angle on the x-axis.
 * @property {number=} pan - The pan is the camera's angle on the z-axis.
 * @property {number=} heading - The heading is the camera's angle on the z-axis.
 * @property {emp.typeLibrary.BoundingBoxType=} bounds - The bounds are the bounding box area points for the camera to center on.
 * @property {emp.typeLibrary.LookAt.LookAtParams} lookAt
 **/
