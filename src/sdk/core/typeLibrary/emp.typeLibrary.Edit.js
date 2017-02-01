/* globals emp */


/* global emp */

/**
 * @memberOf emp.typeLibrary
 * @class
 * @desc Used to indicate an Edit operation to the map engine. A map engine implementation should never create
 * an instance of this class.
 */
emp.typeLibrary.Edit = function (args) {

    /**
     * @field
     * @type string
     * @description This field contains the transaction ID the edit operation is submitted under.
     */
    this.transactionId = args.transactionId;
    
    /**
     * @field
     * @type emp.typeLibrary.types
     * @description This field identifies the class to all internal and external components.
     * It is provided so it can be used in place of the instanceof operator.
     * @see {@link emp.typeLibrary.types}
     */
    this.globalType = emp.typeLibrary.types.EDIT;
    
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
     * @description This field shall contain the unique identifier of the overlay
     * which contains the feature the operation pertains to.
     */
    this.overlayId = args.overlayId;
    
    /**
     * @field
     * @type string | undefined
     * @description This field, if present, along with the overlayId identify the parent
     * feature of the feature to be edited.
     */
    this.parentId = args.parentId;
    /**
     * @field
     * @private
     * @description This field is populated by the update method.
     * 
     */
    this.updates = args.updates;
    
    /**
     * @field
     * @type string
     * @description This field shall contain a user readable name to assign to the
     * feature.
     */
    this.name = args.name;
    
    /**
     * @field
     * @type emp.typeLibrary.featureFormatType
     * @description This field identifies the format of feature.
     */
    this.type = args.type;

    /**
     * @private
     */
    this.sender = args.sender;

    /**
     * @private
     */
    this.complete = args.complete || false;
    
    /**
     * @field
     * @type string
     * @description This field is only present for backward compatibility. New map engines
     * should access this.data.symbolCode.
     */
    this.symbolCode = args.symbolCode;
    
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
     * @description This field is a structure object containing the coordinates for the feature.
     * It shall contains two fields, type - which indicates the type of geojson coordinates provided.
     * And coordinates which shall contain the coordinates in GEOJSON format as defined in the type field.
     */
    this.data = this.data || {};
    
    /**
     * @field
     * @type string
     * @description This optional field is present if the type indicated is milstd or airspace.
     * It contains the symbol code of the feature that is to be drawn.
     */
    this.data.symbolCode = this.data.symbolCode || {};

    /**
     * @public
     * @method
     * @description Method called by the map engine to generate an update event.
     * @param {object} args This object must contain all items needed to generate an update event.
     * @param {string=} args.name This field contains the name of the feature.
     * @param {emp.typeLibrary.CoordinateUpdate} args.updates This object contains the coordinates of the feature.
     * @param {emp.typeLibrary.Feature.properties} args.properties This object contains the updated properties for the feature.
     * @param {emp.typeLibrary.UpdateEventType} args.updateEventType This parameter identifies the update.
     */
    this.update = function (args) {
        var t = this,
        o,
        data,
        v1Type;
        var oStorageEntry = emp.storage.get.id({id: this.originFeature.coreId});
        var oFeature = oStorageEntry.getObjectData(args.mapInstanceId, emp.storage.getRootGuid(args.mapInstanceId));
        
        oFeature.overlayId = this.overlayId;
        oFeature.parentId = this.parentId;
        
        v1Type = oStorageEntry.v1Type;
    
        if(args.properties)
        {
            for (var sProp in args.properties)
            {
                if (args.properties.hasOwnProperty(sProp))
                {
                    if (sProp !== 'readOnly')
                    {
                        oFeature.properties[sProp] = emp.helpers.copyObject(args.properties[sProp]);
                    }
                }
            }
        }

        if (!args.hasOwnProperty("updateEventType") ||
                (args.updateEventType !== emp.typeLibrary.UpdateEventType.START))
        {
            data = oFeature.generateData({feature: oFeature, updates: args.updates});
            oFeature.data = data;
            
            if (args.hasOwnProperty('plotFeature')
                    && (oFeature.format === emp.typeLibrary.featureFormatType.GEOJSON))
            {
                // Now check if its a GeoJSON feature.
                if (oFeature.data.type.toLowerCase() === 'feature')
                {
                    if (oFeature.data.hasOwnProperty('properties') &&
                            oFeature.data.properties.hasOwnProperty('aoi') )
                    {
                        if (args.plotFeature.data.hasOwnProperty('properties')
                                && args.plotFeature.data.properties.hasOwnProperty('aoi'))
                        {
                            oFeature.data.properties.aoi = args.plotFeature.data.properties.aoi;
                        }
                    }
                }
            }
            
            // coordinates property needs to be updated in order for any cancelling of a 
            // subsequent edit operation to revert back to the last edit result instead
            // of the original coordinate positioning.
            oFeature.coordinates = "";
            for (var i = 0; i < args.updates.coordinates.length; i++) {
                oFeature.coordinates += args.updates.coordinates[i].lon.toString() + "," +
                        args.updates.coordinates[i].lat.toString();
                if (args.updates.coordinates[i].hasOwnProperty("alt"))
                {
                    oFeature.coordinates += "," + args.updates.coordinates[i].alt.toString();
                }
                oFeature.coordinates += " ";
            }
            oFeature.coordinates = oFeature.coordinates.trim();
        }

        if ((args.complete === true) || (args.updateEventType === emp.typeLibrary.UpdateEventType.COMPLETE)){
            oFeature.complete = true;
            args.complete = true;
        }
        
        oFeature.updateEventType = args.updateEventType;
        oFeature.updates = args.updates;
        oFeature.transactionId = t.transactionId;
        
        if (v1Type !== undefined)
        {
            // This is for V1 draw request.
            oFeature.v1Type = t.originFeature.v1Type;
        }

        o = new emp.typeLibrary.Transaction({
            sender: "USER", 
            intent: emp.intents.control.EDIT_UPDATE,
            mapInstanceId: args.mapInstanceId,
            intentParams: "",
            items: [oFeature]
        });

        o.run();
        
        this.updatedFeature = oFeature;
    };


    /**
     * @private
     */
    this.schema = {
         "title": "EMP-Edit Schema",
        "type": "object",
        "properties": {
             "featureId": {
                "type": "string"
            },
            "overlayId":{
                "type": ["string", "null"]
            },
            "parentId":{
                "type":["string","null"]
            },
            "transactionId":{
                "type":["string", "null"]
            }
        },
        "required":[]
    };
    //this.validate();

    /**
     * @field
     * @description This field is the primary key of the feature.
     */
    this.coreId = args.coreId;

    // In the event of a cancel a map engine must revert the feature back
    // to its original version. So here we create a duplicated of the
    // feature as it is before editing.
    this.originFeature;

    this.end = function (args) {
        var oFeature = this.updatedFeature;
        var oStorageEntry = emp.storage.findFeature(null, oFeature.featureId);
        var oParent = oStorageEntry.getParentByIndex(0);
        
        switch (oParent.getCoreObjectType())
        {
            case emp.typeLibrary.types.OVERLAY:
                oFeature.overlayId = oParent.getOverlayId();
                break;
            case emp.typeLibrary.types.FEATURE:
                oFeature.parentId = oParent.getFeatureId();
                
                while (oParent.getCoreObjectType() !== emp.typeLibrary.types.OVERLAY)
                {
                    oParent = oParent.getParentByIndex(0);
                }
                oFeature.overlayId = oParent.getOverlayId();
                break;
        }

        var e = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.FEATURE_OUTBOUND_PLOT,
            mapInstanceId: args.mapInstanceId,
            source: emp.core.sources.MAP,
            items:[oFeature]
        });
        e.run();
    };

    this.cancel = function(args) {

        var oOutBoundTrans = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.FEATURE_OUTBOUND_PLOT,
            mapInstanceId: args.mapInstanceId,
            source: emp.core.sources.MAP,
            items:[this.originFeature]
        });
        // This transaction will cause the plot to go to the map.
        var oNewTran = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.MI_FEATURE_ADD,
            mapInstanceId: args.mapInstanceId,
            source: emp.core.sources.MAP,
            sender: this.sender,
            items: [this.originFeature]
        });

        setTimeout(function(){
            oNewTran.run();
            oOutBoundTrans.run();
        }, 0);
    };
    
    this.prepForExecution = function(){
        var oFeature;
        
        if (emp.helpers.isEmptyString(this.coreId))
        {
            // It's not set.
            oFeature = emp.storage.findFeature(this.overlayId, this.featureId);

            if (oFeature === undefined)
            {
                // Attempting to edit a feature that does not exist. The system will fail this
                this.coreId = emp.helpers.id.newGUID();
                return;
            }

            this.coreId = oFeature.getCoreId();
        }
    };
};

emp.typeLibrary.Edit.prototype.validate = emp.typeLibrary.base.validate;


