/* globals emp */
/**
 * @memberOf emp.typeLibrary
 * @class
 * @desc This class contains the details of the selection operation or selection event.
 * A map implementation should never create an instance of the class.
 * @param  {emp.typeLibrary.Selection.ParameterType} args - Arguments to populate Selection.
 */
emp.typeLibrary.Selection = function (args) {

    /**
     * @field
     * @type {string=}
     * @description This field contains the primary key of the feature.
     */
    this.coreId = args.coreId;

    /**
     * @private
     */
    this.type = args.type;
    /**
     * @private
     */
    this.globalType = emp.typeLibrary.types.SELECTION;

    /**
     * @field
     * @type {string}
     * @description The identifier of the features overlay.
     */
    this.overlayId = args.overlayId;

    /**
     * @field
     * @type {string}
     * @description The identifier of the features.
     */
    this.featureId = args.featureId;

    /**
     * @field
     * @type {string}
     * @description The features parent Id parameter.
     */
    this.parentId = args.parentId;

    /**
     * @field
     * @type {string}
     * @description If the selection event refers to a sub component, this field contains the sub component's identifier.
     */
    this.selectedId = args.selectedId;

    /**
     * @field
     * @type {string}
     * @description This field contains the name of the feature affected.
     */
    this.selectedName = args.selectedName;


    /**
     * @field
     * @type {boolean}
     * @description This field contains the indicator. True to select the feature and false
     * to unselect the feature.
     */
    this.select = args.select;

    /**
     * @field
     * @type {string=}
     * @description If this instance is part of a selection operation, this field contains the
     * transaction ID of the transaction it came in under.
     */
    this.transactionId = args.transactionId;

    /**
     * @private
     */
    this.sender = args.sender;

    /**
     * @private
     */
    this.originChannel = args.originChannel;
    //    this.selection = args.selection || false;

    /**
     * @private
     */
    this.schema = {
        "title": "EMP-Selection Schema",
        "type": "object",
        "properties": {
            "featureId": {
                "type": ["string", "null"]
            },
            "overlayId": {
                "type": ["string", "null"]
            },
            "parentId": {
                "type": ["string", "null"]
            },
            "selectedId": {
                "type": ["string", "null"]
            },
            "selectedName": {
                "type": ["string", "null"]
            },
            "transactionId": {
                "type": ["string", "null"]
            }
        }
    };
    this.validate();

    this.prepForExecution = function(){
        var oStorageItem;
        
        if (this.coreId !== undefined)
        {
            // They gave us the coreId return it.
            oStorageItem = emp.storage.get.id({id: this.coreId});
            
            if (oStorageItem)
            {
                switch(oStorageItem.getCoreObjectType()) {
                    case emp.typeLibrary.types.FEATURE:
                        this.featureId = oStorageItem.getFeatureId();
                        break;
                    case emp.typeLibrary.types.WMS:
                        this.featureId = oStorageItem.getId();
                        break;
                }
            }
        }
        else if (this.overlayId && this.featureId)
        {
            // Else find the feature.
            oStorageItem = emp.storage.findFeature(this.overlayId, this.featureId);
        }
        
        // If the item is in storage return its coreId.
        if (oStorageItem === undefined)
        {
            this.coreId = emp.helpers.id.newGUID();
        }
        else
        {
            this.coreId = oStorageItem.getCoreId();
        }
    };
};

emp.typeLibrary.Selection.prototype.validate = emp.typeLibrary.base.validate;

emp.typeLibrary.Selection._NOSELECT = "...EMP_CORE-NO-SELECT";

/**
 * @typedef emp.typeLibrary.Selection.ParameterType
 * @description The coreId or overlay, feature, parent Ids must be provided.
 * @property {string=} coreId - The coreId of the feature. It will be used to populate the
 * overlayId, featureId and parentId.
 * @property {string=} featureId - The feature identifier.
 * @property {string=} overlayId - The overlay ID of the feature.
 * @property {string=} parentId  - The parent ID of the feature
 * @property {string=} selectedId - If the feature affected is a sub feature, this should contain the sub feature identifier.
 * @property {string=} selectedName - The name of the selection
 * @property {string=} transactionId - If this instance is part of a selection operation, this field contains the
 * @property {boolean} select - If this instance is part of a selection operation, this value indicates if the feature is to be selected (TRUE)
 * or unselected (FALSE).
 */
