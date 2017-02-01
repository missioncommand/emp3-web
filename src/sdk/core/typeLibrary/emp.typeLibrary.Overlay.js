/* global emp */

/**
  * @classdesc This class represents an overlay in the EMP system.
 * @memberof emp.typeLibrary
 * @class
 *
 * @param {object} args
 * @param {string} args.transactionId
 * @param {string} [args.intent]
 * @param {string} args.name
 * @param {string} args.description
 * @param {string} [args.sender]
 * @param {string} args.coreParent
 * @param {string} args.coreId
 * @param {string} args.overlayId
 * @param {string} args.parentId
 * @param {boolean} [args.visible=false]
 * @param {boolean} args.readOnly
 * @param {object} [args.properties]
 * @param args.permissions
 * @param {boolean} args.hidden
 */
emp.typeLibrary.Overlay = function (args) {
    /**
     * @field
     * @type string
     * @description This field indicates the operation indicated in the transaction.
     */
    this.intent = args.intent || "false";

    /**
     * @field
     * @type string
     * @description This field provides the transaction ID the request came in under.
     */
    this.transactionId = args.transactionId; /* REMOVED Auto Gen */

    /**
     * @field
     * @type emp.typeLibrary.types
     * @description This field identifies the class to all internal and external components.
     * It is provided so it can be used in place of the instanceof operator.
     * @see {@link emp.typeLibrary.types}
     */
    this.globalType = emp.typeLibrary.types.OVERLAY;

    /**
     * @private
     */
    this.tName = args.name;

    /**
     * @private
     */
    this.sender = args.sender || emp.helpers.id.newGUID();

    /**
     * @field
     * @type string
     * @description This field provides a readable name for the overlay.
     * If it is not provided one will be assigned.
     */
    this.name = (function (args) {
            if (args.tName !== undefined && args.tName !== null) {
                    return args.tName;
            } else {
                    if (args.intent !== "overlay.update") {
                            var r = "Overlay " + args.sender;
                            return r;
                    }
            }
    }(this));

    /**
     * @field
     * @type string
     * @description This field provides a readable description for the overlay.
     */
    this.description = args.description || "No Description";

    /**
     * @private
     */
    this.type = "overlay";

    /**
     * @private
     */
    this.disabled = false;
    /* EMP-184 */
    // this doesn't work if args.overlayId is 'set' to false... 

    /**
     * @field
     * @type string
     * @description This field provides the unique identifier for the overlay.
     */
    this.overlayId = args.overlayId || args.sender;

    /**
     * @field
     * @type string
     * @description This field is the primary key for the overlay in the system.
     */
    this.coreId = this.overlayId;

    /**
     * @field
     * @type string
     * @description This field, if present, indicates the ID of its parent overlay.
     * The map implementation must place this overlay as a child of the parent.
     */
    this.parentId = emp.helpers.id.get.setId(args.parentId);
    this.coreParent = args.coreParent || this.parentId;

    /**
     * @field
     * @type boolean
     * @description This field indicates the visibility state of the overlay.
     * The map implementation must create the overlay even if it is not visible.
     */
    this.visible = (args.visible !== false);

    this.properties = args.properties || {};

    if (this.properties.hasOwnProperty('readOnly'))
    {
        this.properties.readOnly = (this.properties.readOnly !== false);
    }
    else
    {
        this.properties.readOnly = (args.readOnly === true) || false;
    }

    /** Denotes a special layer that should not be returned in a general search */
    this.hidden = args.hidden || false;

    /**
     * @private
     */
    this.schema = {
            "title": "EMP-Overlay Schema",
            "type": "object",
            "properties": {
                    "overlayId": {
                            "type": "string"
                    },
                    "name": {
                            "type": ["string", "null"]
                    },
                    "parentId": {
                            "type": ["string", "null"]
                    },
                    "iconUrl": {
                            "type": "string"
                    },
                    "description": {
                            "type": "string"
                    },
                    "permissions": {
                            "type": "boolean"
                    },
                    "visible": {
                            "type": "boolean"
                    },
                    "properties": {
                            "type": "object"
                    },
                    "transactionId": {
                            "type": ["string", "null"]
                    }
            },
      "required": ["overlayId"]
    };
    
    this.validate();

    /**
     * @description Created a parent overlay for a overlay if it doesn't exist.
     * This method must be called by the map implementation if the parent
     * overlay indicated does not exists. The core will issue an overlay.add
     * transaction which should create the overlay. Once this method returns
     * the parent overlay should exists. But the map implementation must check
     * for the parent in case the creation failed. In which case the overlay add
     * must be failed.
     */
    this.createParent = function () {
            var transaction,
                    payload;

            payload = {
                    name: "Overlay " + this.sender,
                    overlayId: this.parentId
            };

            transaction = new emp.typeLibrary.Transaction({
                    intent: emp.intents.control.OVERLAY_ADD,
                    originChannel: "map.overlay.create",
                    sender: this.sender,
                    transactionType: "overlay",
                    type: "transaction",
                    items: function () {
                            var r = [];
                            r.push(new emp.typeLibrary.Overlay(payload));
                            return r;
                    }
            });
            transaction.run();
    };
    
    /**
     * @method
     * @description This function return a structure of the overlay field without the overhead of functions and private fields.
     */
    this.getObjectData = function()
    {
        return {
                overlayId: this.overlayId,
                parentId: this.parentId,
                name: this.name,
                description: this.description,
                disabled: this.disabled,
                readOnly: this.readOnly,
                visible: this.visible,
                iconUrl: this.iconUrl,
                properties: emp.helpers.copyObject(this.properties)
            };
    };
    
    this.createDuplicate = function()
    {
        var oNewOverlay;
        var stringFeature = JSON.stringify(this);
        var objectFeature = JSON.parse(stringFeature);
        
        oNewOverlay = new emp.typeLibrary.Overlay(objectFeature);
        
        return oNewOverlay;
    };


    this.prepForExecution = function() {
        // We don't need to do anything.
    };
};


emp.typeLibrary.Overlay.prototype.validate = emp.typeLibrary.base.validate;
/*
emp.typeLibrary.Overlay.prototype.visibility = emp.typeLibrary.base.visibility;
emp.typeLibrary.Overlay.prototype.locate = emp.typeLibrary.base.locate;
emp.typeLibrary.Overlay.prototype.hasChildren = emp.typeLibrary.base.hasChildren;
emp.typeLibrary.Overlay.prototype.hasParents = emp.typeLibrary.base.hasParents;
emp.typeLibrary.Overlay.prototype.removeChild = emp.typeLibrary.base.removeChild;
emp.typeLibrary.Overlay.prototype.addParent = emp.typeLibrary.base.addParent;
emp.typeLibrary.Overlay.prototype.addChild = emp.typeLibrary.base.addChild;
emp.typeLibrary.Overlay.prototype.getChildrenCoreIds = emp.typeLibrary.base.getChildrenCoreIds;
emp.typeLibrary.Overlay.prototype.getParentCoreIds = emp.typeLibrary.base.getParentCoreIds;
emp.typeLibrary.Overlay.prototype.childrenCount = emp.typeLibrary.base.childrenCount;
emp.typeLibrary.Overlay.prototype.parentCount = emp.typeLibrary.base.parentCount;
emp.typeLibrary.Overlay.prototype.getChild = emp.typeLibrary.base.getChild;
emp.typeLibrary.Overlay.prototype.getParent = emp.typeLibrary.base.getParent;
emp.typeLibrary.Overlay.prototype.isMultiParentRequired = emp.typeLibrary.base.isMultiParentRequired;
emp.typeLibrary.Overlay.prototype.hasChildNodes = emp.typeLibrary.base.hasChildNodes;
emp.typeLibrary.Overlay.prototype.getChildNodesCoreIds = emp.typeLibrary.base.getChildNodesCoreIds;
emp.typeLibrary.Overlay.prototype.removeFromAllParent = emp.typeLibrary.base.removeFromAllParent;
emp.typeLibrary.Overlay.prototype.getVisibilityWithParent = emp.typeLibrary.base.getVisibilityWithParent;
emp.typeLibrary.Overlay.prototype.setVisibilityWithParent = emp.typeLibrary.base.setVisibilityWithParent;
emp.typeLibrary.Overlay.prototype.getRootParent = emp.typeLibrary.base.getRootParent;
emp.typeLibrary.Overlay.prototype.getVisibilityCount = emp.typeLibrary.base.getVisibilityCount;
emp.typeLibrary.Overlay.prototype.getRootCoreId = emp.typeLibrary.base.getRootCoreId;
emp.typeLibrary.Overlay.prototype.addAffectedChildren = emp.typeLibrary.base.addAffectedChildren;
emp.typeLibrary.Overlay.prototype.isVisible = emp.typeLibrary.base.isVisible;
emp.typeLibrary.Overlay.prototype.isUnderParent = emp.typeLibrary.base.isUnderParent;
emp.typeLibrary.Overlay.prototype.addToOverlayFeatureList = emp.typeLibrary.base.addToOverlayFeatureList;
emp.typeLibrary.Overlay.prototype.removeFromOverlayFeatureList = emp.typeLibrary.base.removeFromOverlayFeatureList;
emp.typeLibrary.Overlay.prototype.removeAllChildrenFromOverlayFeatureList = emp.typeLibrary.base.removeAllChildrenFromOverlayFeatureList;
emp.typeLibrary.Overlay.prototype.addAllChildrenToOverlayFeatureList = emp.typeLibrary.base.addAllChildrenToOverlayFeatureList;
emp.typeLibrary.Overlay.prototype.isVisibilityAffected = emp.typeLibrary.base.isVisibilityAffected;
emp.typeLibrary.Overlay.prototype.getVisibilitySettingWithParent = emp.typeLibrary.base.getVisibilitySettingWithParent;
*/

/**
 * @class
 * @description This class is used in the overlay.style call to set the style
 * of all the feature contained in the overlay.
 */
emp.typeLibrary.OverlayStyle = function (args) {
    
    /**
     * @field
     * @type string
     * @description This field is the primary key for the overlay the style applies to.
     */
    this.coreId = args.overlayId;
    
    /**
     * @field
     * @type string
     * @description This field provides the unique identifier of the overlay the style is to be applied to.
     */
    this.overlayId = args.overlayId;
    
    /**
     * @private
     */
    this.type = args.type || "all";
    /**
     * @field
     * @type object
     * @description This field provides the style properties to be applied.
     */
    this.properties = args.properties;
    
    /**
     * @private
     */
    this.iconUrl = args.iconUrl;
    
    /**
     * @private
     */
    this.schema = {
        "title": "EMP-Overlay-Style Schema",
        "type": "object",
        "properties": {
            "overlayId": {
                "type": "string"
            },
            "type": {
                "type": "string",
                "enum": [
                    "point",
                    "line",
                    "polygon",
                    "multigeometry",
                    "all"
                ]
            },
            "properties": {
                "type": ["object", "null"]
            }

        },
        "required": ["overlayId"]
    };
    this.validate();
};
emp.typeLibrary.OverlayStyle.prototype.validate = emp.typeLibrary.base.validate;

emp.typeLibrary.OverlayStyleType = {
    POINT: 'point',
    LINE: 'line',
    POLYGON: 'polygon',
    MULTIGEOMETRY: 'multigeometry'
};


/**
 * @class
 * @description This class is used in the overlay.cluster.set call to define a cluster
 * for an overlay
 */
emp.typeLibrary.Overlay.Cluster = function (args)
{
/*
{
  threshold: integer (optional), 
  distance: integer (optional), 
  clusterStyle: object (optional){
    label: string (optional), 
    title: string (optional), 
    summary: string (optional), 
    description: string (optional), 
    pointStyle: object (optional){
      color: object (optional){
        r: integer (required), 
        g: integer (required), 
        b: integer (required), 
        a: number (required)
      }, 
      radius: integer | string (optional)
    }, 
    iconStyle: object (optional){
      url: string (required)
    }
  }, 
  overlayId: string (optional)
}*/
    this.coreId = undefined;
    this.oClusterStyle = undefined;
    
    if (args instanceof emp.typeLibrary.Overlay.Cluster)
    {
        this.overlayId = args.getOverlayId();
        this.iThreshold = args.getThreshold();
        this.iDistance = args.getDistance();
        this.oClusterStyle = args.getClusterStyle();

        if (this.oClusterStyle)
        {
            this.oClusterStyle = new emp.typeLibrary.Overlay.Cluster.Style(this.oClusterStyle);
        }
    }
    else
    {
        this.overlayId = args.overlayId;
        this.iThreshold = args.threshold || 2;
        this.iDistance = args.distance || 50;

        if (args.clusterStyle)
        {
            this.oClusterStyle = new emp.typeLibrary.Overlay.Cluster.Style(args.clusterStyle);
        }
    }
    
    this.globalType = emp.typeLibrary.types.OVERLAY_CLUSTER;
    
    this.getCoreId = function()
    {
        return this.coreId;
    };
    
    this.getOverlayId = function()
    {
        return this.overlayId;
    };
    
    this.getThreshold = function()
    {
        return this.iThreshold;
    };
    
    this.getDistance = function()
    {
        return this.iDistance;
    };

    this.getClusterStyle = function()
    {
        return this.oClusterStyle;
    };
    
    this.prepForExecution = function()
    {
        var oOveraly = emp.storage.findOverlay(this.overlayId);

        if (oOveraly)
        {
            this.coreId = oOveraly.coreId;
        }
    };
};

emp.typeLibrary.Overlay.Cluster.Style = function (oCS)
{
    this.oPointStyle = undefined;
    this.oIconStyle = undefined;

    if (oCS instanceof emp.typeLibrary.Overlay.Cluster.Style)
    {
        this.sLabel = oCS.getLabel();
        this.sTitle = oCS.getTitle();
        this.sSummary = oCS.getSummary();
        this.sDescription = oCS.getDescription();
        this.oPointStyle = oCS.getPointStyle();
        this.oIconStyle = oCS.getIconStyle();

        if (this.oPointStyle)
        {
            this.oPointStyle = new emp.typeLibrary.Overlay.Cluster.Style.PointStyle(this.oPointStyle);
        }

        if (this.oIconStyle)
        {
            this.oIconStyle = new emp.typeLibrary.Overlay.Cluster.Style.IconStyle(this.oIconStyle);
        }
    }
    else
    {
        this.sLabel = oCS.label;
        this.sTitle = oCS.title;
        this.sSummary = oCS.summary;
        this.sDescription = oCS.description;
        this.oPointStyle = undefined;
        this.oIconStyle = undefined;

        if (oCS.pointStyle)
        {
            this.oPointStyle = new emp.typeLibrary.Overlay.Cluster.Style.PointStyle(oCS.pointStyle);
        }

        if (oCS.iconStyle)
        {
            this.oIconStyle = new emp.typeLibrary.Overlay.Cluster.Style.IconStyle(oCS.iconStyle);
        }
    }

    this.getLabel = function()
    {
        return this.sLabel;
    };
    
    this.getTitle = function()
    {
        return this.sTitle;
    };
    
    this.getSummary = function()
    {
        return this.sSummary;
    };
    
    this.getDescription = function()
    {
        return this.sDescription;
    };
    
    this.getPointStyle = function()
    {
        return this.oPointStyle;
    };
    
    this.getIconStyle = function()
    {
        return this.oIconStyle;
    };
};

emp.typeLibrary.Overlay.Cluster.Style.PointStyle = function (oPS)
{
    if (oPS instanceof emp.typeLibrary.Overlay.Cluster.Style.PointStyle)
    {
        this.iRadius = oPS.getRadius();
        this.oColor = oPS.getColor();
    
        if (this.oColor)
        {
            this.oColor = new emp.typeLibrary.Overlay.Cluster.Style.PointStyle.Color(this.oColor);
        }
    }
    else
    {
        this.iRadius = oPS.radius || 6;
        this.oColor = undefined;
    
        if (oPS.color)
        {
            this.oColor = new emp.typeLibrary.Overlay.Cluster.Style.PointStyle.Color(oPS.color);
        }
    }

    this.getColor = function()
    {
        return this.oColor;
    };
    
    this.getRadius = function()
    {
        return this.iRadius;
    };
    
    this.createIcon = function(sText)
    {
        var iRadius = this.getRadius();
        var oColor = "#" + this.oColor.getHexColor();

        return emp.helpers.createCircleCanvas({
                iRadius: iRadius,
                dOpacity: this.oColor.getAlpha(),
                sFillColor: oColor,
                sTextColor: "black",
                sText: sText
            });
    };
};

emp.typeLibrary.Overlay.Cluster.Style.PointStyle.Color = function (oColor)
{
    if (oColor instanceof emp.typeLibrary.Overlay.Cluster.Style.PointStyle.Color)
    {
        this.iRed = oColor.getRed();
        this.iGreen = oColor.getGreen();
        this.iBlue = oColor.getBlue();
        this.dAlpha = oColor.getAlpha();
    }
    else
    {
        this.iRed = 0;
        this.iGreen = 0;
        this.iBlue = 0;
        this.dAlpha = 1.0;
    
        if (typeof (oColor.r) === 'number')
        {
            this.iRed = Math.round(Math.abs(oColor.r)) % 256;
        }
        else if (typeof (oColor.r) === 'string')
        {
            this.iRed = Math.round(Math.abs(parseInt(oColor.r))) % 256;
        }

        if (typeof (oColor.g) === 'number')
        {
            this.iGreen = Math.round(Math.abs(oColor.g)) % 256;
        }
        else if (typeof (oColor.g) === 'string')
        {
            this.iGreen = Math.round(Math.abs(parseInt(oColor.g))) % 256;
        }

        if (typeof (oColor.b) === 'number')
        {
            this.iBlue = Math.round(Math.abs(oColor.b)) % 256;
        }
        else if (typeof (oColor.b) === 'string')
        {
            this.iBlue = Math.round(Math.abs(parseInt(oColor.b))) % 256;
        }

        if (typeof (oColor.a) === 'number')
        {
            this.dAlpha = Math.round(Math.abs(oColor.a) * 10.0) / 10.0;
        }
        else if (typeof (oColor.a) === 'string')
        {
            this.dAlpha = Math.round(Math.abs(parseFloat(oColor.a)) * 10.0) / 10.0;
        }
    }

    this.getRed = function()
    {
        return this.iRed;
    };
    
    this.getGreen = function()
    {
        return this.iGreen;
    };
    
    this.getBlue = function()
    {
        return this.iBlue;
    };
    
    this.getAlpha = function()
    {
        return this.dAlpha;
    };
    
    this.getHexColor = function()
    {
        var sColor = "";
        var sByte = this.iRed.toString(16);

        if (sByte.length === 1)
        {
            sByte = "0" + sByte;
        }

        sColor += sByte;

        sByte = this.iGreen.toString(16);

        if (sByte.length === 1)
        {
            sByte = "0" + sByte;
        }

        sColor += sByte;

        sByte = this.iBlue.toString(16);

        if (sByte.length === 1)
        {
            sByte = "0" + sByte;
        }

        sColor += sByte;

        return sColor;
    };
    
    this.getFullHexColor = function()
    {
        var sColor = this.getHexColor();

        var sByte = Math.round(this.dAlpha * 255).toString(16);

        if (sByte.length === 1)
        {
            sByte = "0" + sByte;
        }

        sColor = sByte + sColor;

        return sColor;
    };
};

emp.typeLibrary.Overlay.Cluster.Style.IconStyle = function (oIS)
{
    if (oIS instanceof emp.typeLibrary.Overlay.Cluster.Style.IconStyle)
    {
        this.sUrl = oIS.getURL();
    }
    else
    {
        this.sUrl = oIS.url;
    }
    
    this.getURL = function()
    {
        return this.sUrl;
    };
};
