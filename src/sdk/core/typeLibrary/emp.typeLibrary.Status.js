var emp = window.emp || {};
emp.typeLibrary = emp.typeLibrary || {};

/**
 * @memberOf emp.typeLibrary
 * @class
 * @description This class represent a map status change. A map implementation
 * should never create an instance of this class.
 * @param {emp.typeLibrary.Status.ParameterType} args - The arguments needed to create a status object
 */
emp.typeLibrary.Status = function(args) {
  this.coreId = emp.helpers.id.newGUID();
  this.globalType = emp.typeLibrary.types.STATUS;
  this.intent = args.intent;
  this.transactionId = args.transactionId;
  this.sender = args.sender;
  this.requester = args.sender;
  this.intentParams = args.intentParams;
  this.overlay = args.overlay;
  this.feature = args.feature;
  this.layer = args.layer;
  this.status = args.status;
  this.formats = args.formats;
  this.about = args.about;
  this.types = args.types;
  this.filter = args.filter;
  this.select = args.select;
  this.version = args.version;
  this.coordinateSystem = args.coordinateSystem;
  this.displayedCoordinateSystem = args.displayedCoordinateSystem;
  this.widgetName = args.widgetName;
  this.universalName = args.universalName;
  this.instanceName = args.instanceName;
  this.extensions = args.extensions;
  this.type = args.type;
  this.recursive = args.recursive || false;
  this.schema = {
    "title": "EMP-Status Schema",
    "type": "object",

    "properties": {
      "overlay": {
        "type": ["array", "null"],
        "items": {
          "type": "string"
        }
      },
      "feature": {
        "type": ["array", "null"],
        "items": {
          "type": "string"
        }
      },
      "transactionId": {
        "type": ["string", "null"]
      },
      "coordinateSystem": {
        "type": ["string", "null"]
      },
      "format": {
        "type": ["array", "null"]
      },
      "about": {
        "type": ["string", "null"]
      },
      "filter": {
        "type": ["array", "null"]
      },
      "types": {
        "type": ["array", "null"],
        "items": {
          "type": "string"
        }
      },
      "select": {
        "type": ["array", "null"]

      },
      "recursive": {
        "type": ["boolean", "null"]
      }
    }

  };

  this.validate();
};

emp.typeLibrary.Status.prototype.validate = emp.typeLibrary.base.validate;


/**
 * @typedef emp.typeLibrary.Status.ParameterType
 * @property {emp.map.states} status The new state of the map.
 */