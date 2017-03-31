/* global armyc2 */

var emp = window.emp || {};
emp.typeLibrary = emp.typeLibrary || {};

/**
 * @memberOf emp.typeLibrary
 * @class
 * @desc Used to indicate a draw operation to the map engine. A map engine implementation should never create
 * an instance of this class.
 */
emp.typeLibrary.Draw = function (args) {
    /**
     * @field
     * @type string
     * @description This field contains the transaction ID the draw operation is submitted under.
     */
    this.transactionId = args.transactionId;

    /**
     * @field
     * @type emp.typeLibrary.types
     * @description This field identifies the class to all internal and external components.
     * It is provided so it can be used in place of the instanceof operator.
     * @see {@link emp.typeLibrary.types}
     */
    this.globalType = emp.typeLibrary.types.DRAW;

    /**
     * @field
     * @type string
     * @description This field identifies the operation that is to be performed.
     */
    this.intent = args.intent;

    /**
     * @field
     * @type string
     * @description This field shall contain the feature identifier of the feature
     * the operation is to be performed on.
     */
    this.featureId = args.featureId;

    /**
     * @field
     * @type string
     * @description This field, if present, shall contain a user readable name to assign to the
     * drawn feature.
     */
    this.name = args.name;

    /**
     * @field
     * @type string
     * @description This field contains a menuId to be applied tothe feature drawn,
     */
    this.menuId = args.menuId;

    /**
     * @field
     * @type emp.typeLibrary.Draw.Types
     * @description This field will identify the type of feature that is to be drawn.
     * @see {@link emp.typeLibrary.Draw.Types} For a list of valid types.
     */
    this.type = args.type;

    /**
     * @field
     * @type emp.typeLibrary.Feature.properties
     * @description This field will contain any values required to draw the feature. However
     * the map engine must provide default values for any and all required properties that
     * are not provided.
     * @see {@link emp.typeLibrary.Feature.properties} For a description of all properties and the features they apply to.
     */
    this.properties = args.properties || {};


    /**
     * @field
     * @type string
     * @description This field should contain the symbol code for drawing a MilStd graphic or the 3D airspace.
     */
    this.symbolCode = args.symbolCode;


    /**
     * Contains a geojson object containing the starting coordinates of a draw.   This will
     * allow a user to continue drawing from a preset number of points.
     * @type GeoJSON
     */
    this.coordinates = args.coordinates;

    /**
     * @field
     * @description This field is a structure object containing the coordinates for the feature.
     * It shall contains two fields, type - which indicates the type of geojson coordinates provided.
     * And coordinates which shall contain the coordinates in GEOJSON format as defined in the type field.
     */
    this.data = args.data || {};

    /* EMP-188 start */
    // CMAPI Shim.

    /* EMP-188 end */
    /**
     * @field
     * @private
     * @description This field is populated by the update method.
     *
     */
    this.updates = args.updates;

    /**
     * @private
     */
    this.source = args.source;

    /**
     * @private
     */
    this.sender = args.sender;
    /**
     * @private
     */
    this.autoPopulate = args.autoPopulate;

    if ((this.properties.altitudeMode === undefined) ||
            (this.properties.altitudeMode === null))
    {

        // The client has not provided an altitudeMode.
        switch (this.type)
        {
            case "point":
            case "line":
            case "polygon":
            case "path":
            case "rectangle":
            case "square":
            case "circle":
            case "ellipse":
            case "text":
                this.properties.altitudeMode = emp.typeLibrary.featureAltitudeModeType.CLAMP_TO_GROUND;
                break;
            case "milstd":

                var iStdVersion = emp.typeLibrary.featureMilStdVersionType.convertToNumeric(this.properties.standard);
                this.properties.altitudeMode = emp.typeLibrary.featureAltitudeModeType.CLAMP_TO_GROUND;

                if (!armyc2.c2sd.renderer.utilities.SymbolDefTable.isMultiPoint(this.symbolCode, iStdVersion))
                {
                    this.properties.altitudeMode = emp.typeLibrary.featureAltitudeModeType.RELATIVE_TO_GROUND;
                }
                break;
            case "airspace":
                this.properties.altitudeMode = emp.typeLibrary.featureAltitudeModeType.RELATIVE_TO_GROUND;
                break;
        }
    }

    /**
     * @private
     */
    this.schema = {
        "title": "EMP-Draw Schema",
        "type": "object",
        "properties": {
            "featureId": {
                "type": "string"
            },
            "name": {
                "type": ["string", "null"]
            },
            "type": {
                "type": "string"
            },
            "properties": {
                "type": ["object", "null"]
            },
            "transactionId": {
                "type": ["string", "null"]
            }
        },
        "required": ["featureId", "type"]
    };

    this.validate();


    /**
     * @public
     * @method
     * @description Method called by the map engine to generate an update event.
     * @param {object} args This object must contain all items needed to generate an update event.
     * @param {string=} args.name This field contains the name of the feature.
     * @param {emp.typeLibrary.CoordinateUpdate} args.updates This object contains the coordinates of the feature.
     * @param {emp.typeLibrary.Feature.properties} args.properties This object contains the updated properties for the feature.
     * @param {emp.typeLibrary.UpdateEventType} args.updateEventType This parameter identifies the update.
     * @param {emp.typeLibrary.Feature} args.plotFeature This parameter is the newly drawn feature.
     */
    this.update = function (args) {

        var t = this,
                o,
                feature,
                sTranID = emp.helpers.id.newGUID(),
                format = "geojson";
        /*
         we don't want to create transactions for create menu initiated draws
         so filter on the source
         */
        this.updates = args.updates;

        if (emp.api.checkApiSource(this.source) === true){

            // when we create a typeLibrary feature, set the format
            // to geojson for any v2 messages.  If it is a v3 message, the type
            // will be the format.
            if (args.properties && args.properties.v3) {
                if (args.properties.v3) {
                  format = this.type;
                }
            }
            feature = new emp.typeLibrary.Feature({
                featureId: t.featureId,
                name: args.name || t.name,
                updates: args.updates,
                properties: args.properties,
                // set to false so the final update can be sent from the end function
                // this had to be done due to engines not having the plotFeature object populated
                // until the end is called.  In the end event the final update with complete set
                // to true is dispatched so it has access to the final plotFeature and can send
                // the entire feature
                complete: ((args.updateEventType === emp.typeLibrary.UpdateEventType.COMPLETE)? true: false),
                updateEventType: args.updateEventType,
                format: format,
                data: t.data
            });

            feature.transactionId = t.transactionId;

            if (t.v1Type !== undefined)
            {
                // This is for V1 draw request.
                feature.v1Type = t.v1Type;
            }
            if (args.plotFeature && args.plotFeature.format)
            {
                feature.format = args.plotFeature.format;
            }
            if (args.plotFeature && args.plotFeature.data)
            {
                feature.data = args.plotFeature.data;
            }

            feature.type = this.type;

            if ((feature.data.coordinates === null) ||
                    (feature.data.coordinates === undefined))
            {
                feature.data.coordinates = [];
            }

            o = new emp.typeLibrary.Transaction({
                transactionId: sTranID,
                sender: "USER",
                intent: emp.intents.control.DRAW_UPDATE,
                mapInstanceId: args.mapInstanceId,
                intentParams: "",
                items: [feature]
            });
            o.run();
        }
    };

    /**
     * @private
     */
    this.end = function () {
      // Intentionally empty
    };

    /**
     * @field
     * @description This field is the primary key of the feature.
     */
    this.coreId = emp.helpers.id.newGUID();

    // when we create a typeLibrary feature, set the format
    // to geojson for any v2 messages.  If it is a v3 message, the type
    // will be the format.
    var format = "geojson";
    if (this.properties && this.properties.v3) {
        if (this.properties.v3) {
          format = this.type;
        }
    }
    this.plotFeature = new emp.typeLibrary.Feature({
        intent: emp.intents.control.FEATURE_ADD,
        source: emp.core.sources.MAP,
        featureId: this.featureId,
        name: this.name,
        sender: this.sender,
        properties: this.properties,
        format: format,
        originChannel: "map.feature.plot"
    });

    this.originFeature = undefined;

    this.prepForExecution = function()
    {
        var oFeature = emp.storage.findFeature(this.overlayId, this.featureId);

        if (oFeature !== undefined)
        {
            // If the feature exists we need to save a copy
            // in case of a cancel which the map engines will delete the feature
            // we need to re-plot it.
            this.originFeature = oFeature.getObjectData(null, null);
            this.coreId = oFeature.getCoreId();
        }
    };

    this.cancel = function() {
        // do nothing.  In v2 we used to issue a feature plot, but we no longer need to do this.
    };
};
emp.typeLibrary.Draw.prototype.validate = emp.typeLibrary.base.validate;

/**
 * @memberOf emp.typeLibrary.Draw
 * @typedef {object} emp.typeLibrary.Draw.Types
 * @description This type defines the possible values identifying the opbject to be drawn.
 */
emp.typeLibrary.Draw.Types = {
    /**
     * @public
     * @constant
     * @type string
     * @description This value indicates that a single point GeoJSON feature is to be drawn.
     */
    POINT: 'point',
    /**
     * @public
     * @constant
     * @type string
     * @description This value indicates that a GeoJSON line is to be drawn.
     */
    LINE: 'line',
    /**
     * @public
     * @constant
     * @type string
     * @description This value indicates that a GeoJSON polygon is to be drawn.
     */
    POLYGON: 'polygon',
    /**
     * @public
     * @constant
     * @type string
     * @description This value indicates that a line is to be drawn.
     */
    PATH: 'path',

    /**
     * @public
     * @constant
     * @type string
     * @description This value indicates that a circle is to be drawn.
     */
    CIRCLE: 'circle',

    /**
     * @public
     * @constant
     * @type string
     * @description This value indicates that an ellipse is to be drawn.
     */
    ELLIPSE: 'ellipse',

    /**
     * @public
     * @constant
     * @type string
     * @description This value indicates that a rectangle is to be drawn.
     */
    RECTANGLE: 'rectangle',

    /**
     * @public
     * @constant
     * @type string
     * @description This value indicates that a square is to be drawn.
     */
    SQUARE: 'square',

    /**
     * @public
     * @constant
     * @type string
     * @description This value indicates that a freehand text is to be drawn.
     */
    TEXT: 'text',

    /**
     * @public
     * @constant
     * @type string
     * @description This value indicates that a MIL-STD feature is to be drawn.
     */
    MILSTD: 'milstd',
    /**
     * @public
     * @constant
     * @type string
     * @description This value indicates that an airspace is to be drawn.
     */
    AIRSPACE: 'airspace'
};
