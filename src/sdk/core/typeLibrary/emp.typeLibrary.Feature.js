var emp = window.emp || {};
emp.typeLibrary = emp.typeLibrary || {};

/**
 * @memberof emp.typeLibrary
 * @class
 * @description This class represent a feature within EMP.
 */
emp.typeLibrary.Feature = function (args) {
  /**
   * @field
   * @type string
   * @description This field any parameter required by the intent.
   */
  this.intentParams = args.intentParams; //No

  /**
   * @field
   * @type string
   * @description This field shall contain the feature identifier of the feature.
   */
  this.featureId = emp.helpers.id.get.setId(args.featureId);

  /**
   * @field
   * @type string
   * @description This field shall contain the unique identifier of the overlay
   * which contains the feature.
   */
  this.overlayId = emp.helpers.id.get.setId(args.overlayId) || args.sender;

  /**
   * @field
   * @type string | undefined
   * @description This field, if present, along with the overlayId identify the parent
   * feature of the feature.
   */
  this.parentId = emp.helpers.id.get.setId(args.parentId);

  /**
   * @field
   * @type string=
   * @description This field is only applicable of feature updates. If present
   * it indicates that the feature is moving to a new parent. It contains
   * the unique identifier of the new overlay.
   */

  this.destOverlayId = emp.helpers.id.get.setId(args.newOverlayId);

  /**
   * @field
   * @type string=
   * @description This field is only applicable of feature updates. If present
   * it indicates that the feature is moving to a new parent. It contains
   * the feature identifier of the new parent feature.
   */
  this.destParentId = emp.helpers.id.get.setId(args.newParentId);

  /**
   * @field
   * @type emp3.api.enums.FeatureTypeEnum
   * @description This field applies for feature adds in which it identifies the
   * type of feature being added.
   */
  this.format = (this.intent !== "feature.update") ? args.format || "kml" : null;

  /**
   * @field
   * @type emp.typeLibrary.types
   * @description This field identifies the class to all internal and external components.
   * It is provided so it can be used in place of the instanceof operator.
   * @see {@link emp.typeLibrary.types}
   */
  this.globalType = emp.typeLibrary.types.FEATURE;

  /**
   * @field
   * @description the content of this field will depend on the format field. (see {@link emp.typeLibrary.featureFormatType})
   */
  this.data = {};
  if (args.data) {
    this.data = emp.helpers.copyObject(args.data);
  }
  else if (args.feature) {
    this.data = emp.helpers.copyObject(args.feature);
  }

  /**
   * @field
   * @type boolean
   * @description This field indicates if the map implementation should zoom to
   * the feature once it is added to the map.
   */
  this.zoom = args.zoom || false;

  /**
   * @field
   * @type string=
   * @description This field, if present, provides the menu identifier for a
   * feature specific menu.
   */
  this.menuId = args.menuId || "";

  /**
   * @field
   * @type string=
   * @description This field only applies to features of type === "url", if present,
   * it provides the actual unescaped URL the implementation is to use to access the feature.
   */
  this.url = args.url;

  /**
   * @field
   * @type string=
   * @description This field, if present,
   * it provides any parameters needed to render the feature. I.E. the bounding box for an image.
   */
  this.params = args.params || {};

  /**
   * @field
   * @type boolean
   * @description This field indicates if the feature is to be made visible on the map.
   * The implementation must NOT assume that all features added are to be made
   * visible.
   */
  this.visible = (args.visible !== false);

  /**
   * @field
   * @type boolean
   * @description This field indicates if the feature is to be displayed as visible.
   * The visibile indicator may be different if the parent has been made none visible.
   * visible.
   */
  this.visibilitySetting = args.visibilitySetting || this.visible;

  /**
   * @field
   * @type string=
   * @description This field provides a readable description of the feature. The map implementation
   * may choose to display this description on the map.
   */
  this.description = (args.description ? unescape(args.description) : "");

  /**
   * @private
   */
  this.selected = args.selected || false;

  /**
   * @field
   * @type string
   * @description This field is present for MilStd and airspace features.
   */
  this.symbolCode = this.data.symbolCode;

  /**
   * @field
   * @type string
   * @description This field provides the default color for the feature.
   */
  this.color = "993366ff";

  /**
   * @field
   * @type string
   * @description This field is only present for backward compatibility. New map engines
   * should access this.data.coordinates.
   */
  this.coordinates = this.data.coordinates;

  /**
   * @field
   * @type emp.typeLibrary.Feature.propertiesType
   * @description This field contains the properties needed to render the feature.
   */
  this.properties = (args.properties ? emp.helpers.copyObject(args.properties) : {});

  if (this.properties.modifiers) {
    this.properties.modifiers = (function (args) {
      return JSON.parse((typeof args.properties.modifiers === "string") ? unescape(args.properties.modifiers) : JSON.stringify(args.properties.modifiers));
    })(this);
  }

  /* This is to support disabling a feature on map and in tree,
   *  needs to be set to false by default
   *  so map engine and tree have a consistent property to work with
   */
  if (!this.properties.hasOwnProperty('disabled')) {
    this.properties.disabled = false;
  } else {
    this.properties.disabled = (this.properties.disabled === true);
  }

  /**
   * @field
   * @type boolean=
   * @description This field indicates that the feature is to be invisible on the map.
   */
  this.disabled = this.properties.disabled;

  // fix for CMWA 1.2.  readOnly is passed as a channel item.  Pushing it back into
  // properties where engines are looking for it.
  if ((this.properties.readOnly !== true) && (this.properties.readOnly !== false)) {
    if ((this.readOnly === true) || (this.readOnly === false)) {
      this.properties.readOnly = this.readOnly;
    }
    else {
      this.properties.readOnly = false;
    }
  }

  // Check if the iconUrl is a relative path and make an absolute path as some engine GE, WW need an absoplut path to load icons
  if (this.properties.hasOwnProperty("iconUrl")) {
    // strip off all white space so regular expression in relToAbs does not fail.
    this.properties.iconUrl = this.properties.iconUrl.trim();
    this.properties.iconUrl = emp.helpers.relToAbs(this.properties.iconUrl);
  }

  /**
   * @field
   * @type boolean
   * @description This field indicates if the feature is to be readOnly or not.
   * Read only feature can not be placed in edit mode.
   */
  this.readOnly = this.properties.readOnly;

  /**
   * @private
   */
  this.complete = args.complete;

  /**
   * @private
   */
  this.updateEventType = args.updateEventType;

  /**
   * @private
   */
  this.updates = args.updates;

  // overlay the updates...
  // NOTE: This has to go above the support logic because the support logic handles
  // some specific cases that can come though on updates.

  // check the parent disabled state. parent state overrules children disabled state for the case of parent.disabled == true.
  if (this.overlayId !== undefined && this.overlayId !== null && this.parentId !== undefined && this.parentId !== null) {
    var tempCoreParentId = this.overlayId + "." + this.parentId;
    var tempParent = emp.storage.get.id({
      id: tempCoreParentId
    });

    if (tempParent) {
      this.disabled = (tempParent && tempParent.disabled !== undefined && tempParent.disabled !== null) ? this.disabled || tempParent.disabled : this.disabled;
    }
  }

  /**
   * @field
   * @type string
   * @description This field provides the feature with a readable name. The map
   * implementation may choose to display this value along with the feature.
   */
  this.name = args.name;

  /*
   Schema
   */

  /**
   * @private
   */
  this.schema = {
    "title": "EMP-Feature Schema",
    "type": "object",
    "properties": {
      "featureId": {
        "type": "string"
      },
      "name": {
        "type": ["string", "null"]
      },
      "data": {
        "type": ["object", "string"]
      },
      "format": {
        "type": ["string", "null"],
        "enum": [null, "geojson", "kml", "image", emp3.api.enums.FeatureTypeEnum.GEO_POINT, emp3.api.enums.FeatureTypeEnum.GEO_PATH,
          emp3.api.enums.FeatureTypeEnum.GEO_POLYGON, emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL, emp3.api.enums.FeatureTypeEnum.GEO_ACM,
          emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE, emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE, emp3.api.enums.FeatureTypeEnum.GEO_SQUARE,
          emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE, emp3.api.enums.FeatureTypeEnum.GEO_TEXT]
      },
      "overlayId": {
        "type": "string"
      }, // revisit : should be GUID
      "zoom": {
        "type": "boolean"
      },
      "properties": {
        "type": ["object", "null"],
        "properties": {
          "altitudeMode": {
            "type": ["string", "null"],
            "enum": [null, emp.typeLibrary.featureAltitudeModeType.CLAMP_TO_GROUND,
              emp.typeLibrary.featureAltitudeModeType.RELATIVE_TO_GROUND,
              emp.typeLibrary.featureAltitudeModeType.ABSOLUTE]
          }
        }
      },
      "menuId": {
        "type": "string"
      },
      "params": {
        "type": "object"
      },
      "visible": {
        "type": "boolean"
      },
      "disable": {
        "type": "boolean"
      }
    },
    "required": ["featureId", "data", "format", "overlayId"]
  };

  if ((this.url !== undefined) & (this.url !== null) && (this.url !== "")) {
    this.schema.properties.url = {};
    this.schema.properties.url.type = "string";
    this.schema.required = ["featureId", "url", "format", "overlayId"];
    this.schema.properties.format["enum"] = ["kml", "geojson", "image", "arc"];
  }
  
  /**
   * @description Create a parent overlay for a feature if it doesn't exist
   *
   * @returns {transaction} transaction - the transaction containing the new overlay to be added
   * @returns {array} transaction.items - the item to be added to the map. In this case, a {@link Overlay}
   */
  this.createParent = function () {
    var transaction,
      payload;

    if ((this.parentId !== undefined) && (this.parentId !== null)) {
      // We can not create a feature as parent.
      return;
    }

    payload = {
      name: "Overlay " + this.overlayId,
      overlayId: this.overlayId
    };

    transaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.OVERLAY_ADD,
      originChannel: "map.overlay.create",
      sender: this.sender,
      items: function () {
        var r = [];
        r.push(new emp.typeLibrary.Overlay(payload));
        return r;
      }
    });
    transaction.run();

  };

  /**
   * @description Create the destination parent overlay for a feature if it doesn't exist
   *
   */
  this.createDestinationParent = function () {
    var transaction,
      payload;

    payload = {
      name: "Overlay " + this.destOverlayId,
      overlayId: this.destOverlayId,
      parentId: ""
    };

    transaction = new emp.typeLibrary.Transaction({
      length: 1,
      intent: "overlay.add",
      transactionId: this.transactionId + ".parent",
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
   * @field
   * @type string
   * @description This field provides the features primary key.
   */
  this.coreId = args.coreId;


  /**
   * @field
   * @type string
   * @description This field provides the features parent primary key.
   */
  this.coreParent = args.coreParent;

  this.parentCoreId = args.parentCoreId;

  /**
   * @field
   * @type string
   * @description This field applies only to an update operation. It provides the features new primary key for a move operation.
   */
  this.destCoreId = undefined;

  /**
   * @field
   * @type string
   * @description This field applies only to an update operation. It provides the new primary key of the new parent for a move operation.
   */
  this.destCoreParent = undefined;

  // We will call validate from the handlers.
  //this.validate();

  /**
   * @private
   */
  this.currentlyInEditMode = false;

  /**
   * @private
   */
  this.setEditMode = function (bValue) {
    this.currentlyInEditMode = bValue;
  };

  /**
   * @private
   */
  this.isInEditMode = function () {
    return this.currentlyInEditMode;
  };

  /**
   * @method
   * @description This function return a structure of the feature field without theoverhead of functions and private fields.
   */
  this.getFeatureStructure = function () {
    return {
      overlayId: this.overlayId,
      parentId: this.parentId,
      featureId: this.featureId,
      name: this.name,
      description: this.description,
      format: this.format,
      data: emp.helpers.copyObject(this.data),
      menuId: this.menuId,
      url: this.url,
      params: this.params,
      visible: this.visible,
      readOnly: this.properties.readOnly,
      properties: emp.helpers.copyObject(this.properties)
    };
  };
  this.getObjectData = function () {
    return this.getFeatureStructure();
  };

  /**
   * @method
   * @description This function copies the fields from one struction (oFromFeature) to this feature.
   * @param {emp.typeLibrary.Feature} oFromFeature This parameter must be an object with feature field values.
   */
  this.copyFromFeature = function (oFromFeature) {
    if (oFromFeature.hasOwnProperty("name")) {
      this.name = oFromFeature.name;
    }

    if (oFromFeature.hasOwnProperty("data")) {
      this.symbolCode = undefined;
      this.coordinates = {};

      this.data = emp.helpers.copyObject(oFromFeature.data);

      if (this.data.hasOwnProperty("symbolCode")) {
        this.symbolCode = oFromFeature.data.symbolCode;
      }

      if (this.data.hasOwnProperty("coordinates")) {
        this.coordinates = oFromFeature.data.coordinates;
      }
    }

    if (oFromFeature.hasOwnProperty("properties")) {
      this.properties = emp.helpers.copyObject(oFromFeature.properties);
    }

    if (oFromFeature.hasOwnProperty("menuId") && (oFromFeature.menuId !== "")) {
      this.menuId = oFromFeature.menuId;
    }

    if (oFromFeature.hasOwnProperty("url")) {
      this.url = oFromFeature.url;
    }

    //if (oFromFeature.hasOwnProperty("visible"))
    //{
    //    this.visible = oFromFeature.visible;
    //}

    if (oFromFeature.hasOwnProperty("description")) {
      this.description = oFromFeature.description;
    }

    if (oFromFeature.hasOwnProperty("disabled")) {
      this.disabled = oFromFeature.disabled;
    }

    if (oFromFeature.hasOwnProperty("readOnly")) {
      this.readOnly = oFromFeature.readOnly;
      this.properties.readOnly = oFromFeature.readOnly;
    }
  };

  /**
   * @method
   * @description This function creates an un-referenced standalone copy of this feature.
   */
  this.createDuplicate = function () {
    var oNewFeature;
    var sCoreId = this.coreId;
    var sCoreParent = this.coreParent;
    var sParentCoreId = this.parentCoreId;
    var oNodes = this.nodes;
    var oParentNodes = this.parentNodes;
    var oChildNodes = this.childNodes;

    this.nodes = {};
    this.parentNodes = {};
    this.childNodes = {};

    var stringFeature = JSON.stringify(this);
    var objectFeature = JSON.parse(stringFeature);

    this.nodes = oNodes;
    this.parentNodes = oParentNodes;
    this.childNodes = oChildNodes;

    oNewFeature = new emp.typeLibrary.Feature(objectFeature);

    oNewFeature.coreId = sCoreId;
    oNewFeature.coreParent = sCoreParent;
    oNewFeature.parentCoreId = sParentCoreId;

    return oNewFeature;
  };

  /**
   * @method
   * @private
   * @description This function is used to apply an update to the feature.
   */
  this.applyUpdate = function (args) {
    this.destOverlayId = undefined;
    this.destParentId = undefined;

    if (args.hasOwnProperty("newOverlayId")) {
      this.destOverlayId = args.newOverlayId;
    }

    if (args.hasOwnProperty("newParentId")) {
      this.destParentId = args.newParentId;
    }

    if (this.destOverlayId || this.destParentId) {
      var oParent;

      if (this.destParentId) {
        oParent = emp.storage.findFeature(this.destOverlayId, this.destParentId);
      }
      else {
        oParent = emp.storage.findOverlay(this.destOverlayId);
      }

      this.destCoreParent = (oParent ? oParent.coreId : undefined);
    }

    this.copyFromFeature(args);

    // check the parent disabled state for the case of a feature move (destCoreParent present). parent state overrules children disabled state
    // for the case of parent.disabled == true.
    if (this.destCoreParent && this.destCoreParent !== null && this.destCoreParent !== undefined) {
      var tempParent = emp.storage.get.id({
        id: this.destCoreParent
      });

      if (tempParent) {
        this.disabled = (tempParent && tempParent.disabled !== undefined && tempParent.disabled !== null) ? this.disabled || tempParent.disabled : this.disabled;
      }
    }
  };


  this.prepForExecution = function () {
    this.coreId = this.featureId;

    if (this.coreParent === undefined) {
      if (this.parentId) {
        // The parent is a feature
        var oParent = emp.storage.findFeature(this.overlayId, this.parentId);
        if (oParent === undefined) {
          this.coreParent = undefined;
        }
        else {
          this.coreParent = oParent.getCoreId();
        }
      } else {
        // The parent is an overlay.
        this.coreParent = this.overlayId;
      }
    }

    if (this.parentCoreId === undefined) {
      var oParentOverlay = emp.storage.findOverlay(this.overlayId);
      if (oParentOverlay) {
        this.parentCoreId = oParentOverlay.getRootCoreId();
      }
    }
  };
};

emp.typeLibrary.Feature.prototype.validate = emp.typeLibrary.base.validate;

/**
 * Generates a data object in the correct format dependant on the Feature.format and the supplied updates
 * Pass is an args object args = {feature: [instance of emp.typeLibrary.Feature], updates: [update object for edits here]}
 * This is a stateless utility function that does not access instance properties of a Feature instance so it should be declared on the prototype,
 * not as a property of "this." in the emp.typeLibrary.Feature definition.
 * methods defined on the prototype are less expensive as they are only create once and used by every instance, whereas
 * those declared in the Feature instance "this" will be created each time a Feature is instantiated
 *
 * @param {object} args
 * @param {emp.typeLibrary.Feature} args.feature
 * @param {Array} args.updates
 */
emp.typeLibrary.Feature.prototype.generateData = function (args) {
  var len,
    i,
    geoJsonCoords = [],
    data = {},
    format = args.feature.format || "geojson";

  /**
   * Converts a JQuery xml object to an xml string
   * @param {node} xmlObj
   */
  function getXmlString(xmlObj) {
    var output = "";

    emp.util.each(xmlObj.childNodes, function (node) {
      if (node.nodeType !== emp.util.enums.DOMNodeTypes.Text) {
        output += "<" + node.nodeName;

        emp.util.each(node.attributes, function (attrib) {
          output += " " + attrib.name + "=";
          output += "\"" + attrib.value + "\"";
        });

        output += ">";
      }

      if (node.childNodes.length > 0) {
        output += getXmlString(node);
      } else {
        output += node.nodeValue;
      }

      if (node.nodeType !== emp.util.enums.DOMNodeTypes.Text) {
        output += "</" + node.nodeName + ">";
      }
    });
    return output;
  }

  function buildGeoJsonPoint(oNewCoordinates) {
    var geoJsonCoords;

    if ((oNewCoordinates[0].alt === undefined) ||
      (oNewCoordinates[0].alt === null)) {
      geoJsonCoords = [oNewCoordinates[0].lon, oNewCoordinates[0].lat];
    }
    else {
      geoJsonCoords = [oNewCoordinates[0].lon, oNewCoordinates[0].lat, oNewCoordinates[0].alt];
    }
    return {
      "type": "Point",
      "coordinates": geoJsonCoords
    };
  }

  function buildGeoJsonLineString(oNewCoordinates) {
    var geoJsonCoords = [];
    var iLength = oNewCoordinates.length;

    for (var iIndex = 0; iIndex < iLength; iIndex++) {
      if ((oNewCoordinates[iIndex].alt === undefined) ||
        (oNewCoordinates[iIndex].alt === null)) {
        geoJsonCoords.push([oNewCoordinates[iIndex].lon, oNewCoordinates[iIndex].lat]);
      }
      else {
        geoJsonCoords.push([oNewCoordinates[iIndex].lon, oNewCoordinates[iIndex].lat, oNewCoordinates[iIndex].alt]);
      }
    }
    return {
      "type": "LineString",
      "coordinates": geoJsonCoords
    };
  }

  function buildGeoJsonPolygon(oNewCoordinates) {
    var geoJsonCoords = [];
    var iLength = oNewCoordinates.length;

    for (var iIndex = 0; iIndex < iLength; iIndex++) {
      if ((oNewCoordinates[iIndex].alt === undefined) ||
        (oNewCoordinates[iIndex].alt === null)) {
        geoJsonCoords.push([oNewCoordinates[iIndex].lon, oNewCoordinates[iIndex].lat]);
      }
      else {
        geoJsonCoords.push([oNewCoordinates[iIndex].lon, oNewCoordinates[iIndex].lat, oNewCoordinates[iIndex].alt]);
      }
    }
    return {
      "type": "Polygon",
      "coordinates": [geoJsonCoords]
    };
  }

  function buildGeoJsonFeature(oFeatureData, oNewCoordinates) {
    var oData = emp.helpers.copyObject(oFeatureData);
    var oGeometryData;

    switch (oData.geometry.type.toLowerCase()) {
      case 'point':
        oGeometryData = buildGeoJsonPoint(oNewCoordinates);
        break;
      case 'linestring':
        oGeometryData = buildGeoJsonLineString(oNewCoordinates);
        break;
      case 'polygon':
        oGeometryData = buildGeoJsonPolygon(oNewCoordinates);
        break;
      default:
        // Else leave it the same.
        oGeometryData = oData.geometry;
        break;
    }

    oData.geometry = oGeometryData;

    return oData;
  }

  switch (format) {
    case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
    case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
      len = args.updates.coordinates.length;
      i = 0;
      geoJsonCoords = [];
      if (len === 1) {
        if ((args.updates.coordinates[0].alt === undefined) ||
          (args.updates.coordinates[0].alt === null)) {
          geoJsonCoords = [args.updates.coordinates[0].lon, args.updates.coordinates[0].lat];
        }
        else {
          geoJsonCoords = [args.updates.coordinates[0].lon, args.updates.coordinates[0].lat, args.updates.coordinates[0].alt];
        }
        data = {
          "type": "Point",
          "coordinates": geoJsonCoords
        };
      } else {
        for (i = 0; i < len; i++) {
          if ((args.updates.coordinates[i].alt === undefined) ||
            (args.updates.coordinates[i].alt === null)) {
            geoJsonCoords.push([args.updates.coordinates[i].lon, args.updates.coordinates[i].lat]);
          }
          else {
            geoJsonCoords.push([args.updates.coordinates[i].lon, args.updates.coordinates[i].lat, args.updates.coordinates[i].alt]);
          }
        }
        data = {
          "type": "LineString",
          "coordinates": geoJsonCoords
        };
      }
      data.symbolCode = args.feature.symbolCode;
      break;
    case emp.typeLibrary.featureFormatType.KML:
      var coords = args.updates.coordinates;
      var coordString = "";
      len = coords.length;
      var kmlString = "";
      for (i = 0; i < len; i++) {
        coordString += coords[i].lon + "," + coords[i].lat;
        if (coords[i].hasOwnProperty("alt")) {
          coordString += "," + coords[i].alt;
        }
        if (i < len - 1) {
          coordString += " ";
        }
      }
      var kmlDoc = emp.util.parseXML(args.feature.data);
      emp.util.each(kmlDoc.getElementsByTagName("coordinates"), function (coord) {
        coord.childNodes[0].nodeValue = coordString;
      });

      kmlString = getXmlString(kmlDoc);
      data = kmlString;

      break;
    case emp.typeLibrary.featureFormatType.GEOJSON:
    case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
    case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
    case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
    case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
    case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
    case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
    case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
    case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
      len = args.updates.coordinates.length;

      switch (args.feature.data.type.toLowerCase()) {
        case "point":
          if ((args.updates.coordinates[0].alt === undefined) ||
            (args.updates.coordinates[0].alt === null)) {
            geoJsonCoords = [args.updates.coordinates[0].lon, args.updates.coordinates[0].lat];
          }
          else {
            geoJsonCoords = [args.updates.coordinates[0].lon, args.updates.coordinates[0].lat, args.updates.coordinates[0].alt];
          }
          data = {
            "type": "Point",
            "coordinates": geoJsonCoords
          };
          break;
        case "linestring":
          for (i = 0; i < len; i++) {
            if ((args.updates.coordinates[i].alt === undefined) ||
              (args.updates.coordinates[i].alt === null)) {
              geoJsonCoords.push([args.updates.coordinates[i].lon, args.updates.coordinates[i].lat]);
            }
            else {
              geoJsonCoords.push([args.updates.coordinates[i].lon, args.updates.coordinates[i].lat, args.updates.coordinates[i].alt]);
            }
          }
          data = {
            "type": "LineString",
            "coordinates": geoJsonCoords
          };
          break;
        case "polygon":
          for (i = 0; i < len; i++) {
            if ((args.updates.coordinates[i].alt === undefined) ||
              (args.updates.coordinates[i].alt === null)) {
              geoJsonCoords.push([args.updates.coordinates[i].lon, args.updates.coordinates[i].lat]);
            }
            else {
              geoJsonCoords.push([args.updates.coordinates[i].lon, args.updates.coordinates[i].lat, args.updates.coordinates[i].alt]);
            }
          }
          data = {
            "type": "Polygon",
            "coordinates": [geoJsonCoords]
          };
          break;
        case "feature":
          data = buildGeoJsonFeature(args.feature.data, args.updates.coordinates);
          break;
      }
      break;
    default:
      /*
       unknown format, just return the existing data object untouched
       Need to identify a longer term solution for this case.  Formats could be something like czml,
       or other custom data format the core does not understand, but a map engine does

       */
      data = args.feature.data;
      break;
  }

  return data;
};

/**
 * @memberOf emp.typeLibrary.Feature
 * @typedef {object} emp.typeLibrary.Feature.modifiersType
 * @description This type defines the possible 2525 modifiers that can be applied to a symbol.
 * @property {string=} hostile This property if present contains 'ENY'.
 * @property {string=} offsetIndicator A graphic modifier for units, equipment, and
 * installations used when placing an object away from its actual location.
 * @property {string=} dateTimeGroup1 A text modifier for units, equipment, and installations that displays DTG format:
 * DDHHMMSSZMONYYYY or “O/O” for on order.
 * @property {string=} dateTimeGroup2 A text modifier for units, equipment, and installations that displays DTG format:
 * DDHHMMSSZMONYYYY or “O/O” for on order.
 * @property {string=} location A text modifier for units, equipment, and installations that displays a symbol’s
 * location in degrees, minutes, and seconds (or in UTM or other applicable display
 * format).
 * @property {string=} uniqueDesignation1 A text modifier for units, equipment, and installations that uniquely identifies a
 * particular symbol or track number. Identifies acquisitions number when used
 * with SIGINT symbology.
 * @property {string=} uniqueDesignation2 A text modifier for units, equipment, and installations that uniquely identifies a
 * particular symbol or track number. Identifies acquisitions number when used
 * with SIGINT symbology.
 * @property {string=} equipmentType A text modifier for equipment that indicates types of equipment.
 * @property {string=} iffSif A text modifier displaying IFF/SIF Identification modes and codes.
 * @property {string=} higherFormation A text modifier for units that indicates number or title of higher echelon
 * command (corps are designated by Roman numerals).
 * @property {string=} signatureEquipment A text modifier for hostile equipment; “!” indicates detectable electronic
 * signatures.
 * @property {string=} combatEffectiveness A text modifier for units and installations that indicates unit effectiveness or
 * installation capability.
 * @property {string=} evaluationRating A text modifier for units, equipment, and installations that consists of a one letter
 * reliability rating and a one-number credibility rating:
 * Reliability Ratings: A-completely reliable, B-usually reliable, C-fairly reliable,
 * D-not usually reliable, E-unreliable, F-reliability cannot be judged.
 * Credibility Ratings: 1-confirmed by other sources,
 * 2-probably true, 3-possibly true, 4-doubtfully true,
 * 5-improbable, 6-truth cannot be judged.
 * @property {string=} additionalInfo1 A text modifier for units, equipment, and installations; content is implementation
 * specific.
 * @property {string=} additionalInfo2 A text modifier for units, equipment, and installations; content is implementation
 * specific.
 * @property {string=} additionalInfo3 A text modifier for units, equipment, and installations; content is implementation
 * specific.
 * @property {string=} staffComments A text modifier for units, equipment and installations; content is implementation
 * specific.
 * @property {string=} reinforcedOrReduced A text modifier in a unit symbol that displays (+) for reinforced, (-) for reduced,
 * (+) reinforced and reduced.
 * @property {string=} specialC2Headquarters A text modifier for units; indicator is contained inside the frame (see figures 2
 * and 3); contains the name of the special C2 Headquarters.
 * @property {emp.typeLibrary.featureMilStdVersionType=} standard This property indicate the MilStd 2525 version. The default value is 2525B.
 * @property {number=} size This property provides the size of the icon to be rendered. The default value is 32.
 * @property {number=} quantity A text modifier in an equipment symbol that identifies the number of items
 * present.
 * @property {number=} speed A text modifier for units and equipment that displays velocity as set forth in
 * MIL-STD-6040.
 * @property {number=} directionOfMovement A graphic modifier for units and equipment that identifies the direction of
 * movement or intended movement of an object.
 * @property {number[]} [altitudeDepth] A text modifier for units, equipment, and installations, that displays either
 * altitude flight level, depth for submerged objects; or height of equipment or
 * structures on the ground.
 * @property {number[]} [distance] A numeric modifier that displays a minimum,
 * maximum, or a specific distance (range, radius,
 * width, length, etc.), in meters.
 * @property {number[]} [azimuth] A numeric modifier that displays an angle
 * measured from true north to any other line in degrees.
 */

/**
 * @memberOf emp.typeLibrary.Feature
 * @typedef {object} emp.typeLibrary.Feature.attributeType
 * @property {number=} width This property provide the width of the airspace. This property applies to routes.
 * @property {number=} leftWidth This property provides the distance by which the
 * left side of the track segment is extended. This property applies to track segments.
 * @property {number=} rightWidth This property provides the distance by which the
 * right side of the track segment is extended. This property applies to track segments.
 * @property {number=} radius This property provide the outer radius of the airspace.
 * This property applies to Cylinder, RadArc, and PolyArc airspaces.
 * @property {number=} innerRadius This property provides the inner radius value for a RadArc airspace.
 * @property {number=} minAlt This property provides the altitude of the lower edge of the airspace.
 * @property {number=} maxAlt This property provides the altitude of the highest edge of the airspace.
 * @property {string=} fillColor This property provide the fill color the airspace must be rendered in in ARGB format.
 * @property {string=} lineColor This property provide the line color the airspace must be rendered in in ARGB format.
 * @property {emp.typeLibrary.featureAltitudeModeType=} altitudeMode This property provide the altitude mode the altitude must be rendered with.
 * @property {emp.typeLibrary.orbitTurnType=} turn This property provide the turn parameter of the orbit airspace.
 * @property {number=} leftAzimuth This property provides the left azimuth value for RadArc and PolyArc airspaces.
 * @property {number=} rightAzimuth This property provides the right azimuth value for RadArc and PolyArc airspaces.
 * @property {emp.typeLibrary.featureAltitudeModeType=} altitudeMode This property
 * indicates the altitude mode for the airspace or airspace segment.  If the minimumAltitudeMode
 * is also present this property applies to the maxAlt only.
 * @property {emp.typeLibrary.featureAltitudeModeType=} minimumAltitudeMode This property, if present,
 * indicates the altitude mode applied to the minAlt of the airspace or airspace segment.
 */

/**
 * @memberOf emp.typeLibrary.Feature
 * @typedef {object} emp.typeLibrary.Feature.propertiesType
 * @property {boolean} readOnly This property indicates if the feature can be placed into edit mode. The default value is false.
 * @property {string=} description This property contains a readable description of the feature.
 * @property {emp.typeLibrary.featureAltitudeModeType=} altitudeMode This property provide the altitude mode the altitude must be rendered with.
 * @property {emp.typeLibrary.Feature.modifiersType=} modifiers This property is applicable to
 * MilStd features only. It contains the symbol modifiers to be applied to the feature when rendering.
 * The map implementation must provide a default value for any required modifier that is not present.
 * @property {emp.typeLibrary.Feature.attributeType[]} [attributes] This property is applicable
 * to airspace features. It contains an array of attributes that must be applied when rendering the airspace.
 * For Track airspaces there can be more than one set of attributes in the array, one for each segment.
 * However if there are more segments than there are attribute sets, then the map implementation must
 * reuse the last existing set for the remainder of the segments. Extra attribute sets are ignored.
 * The map implementation must provide default values for any required attribute that is not present.
 */
