var emp = window.emp || {};
emp.typeLibrary = emp.typeLibrary || {};

/**
 * @class
 * @description This class defines a KML link or KML data that is added to the map
 * as a map background. A map implementation should never create
 * an instance of this class.
 */
emp.typeLibrary.KmlLayer = function(args) {

  /**
   * @field
   * @type {string}
   * @description This field contains a readable name used to identify the service on the layers window.
   */
  this.name = args.name || "";


  /**
   * @field
   * @type {string}
   * @description This field contains the transaction ID the operation came under.
   */
  this.transactionId = args.transactionId;

  /**
   * @field
   * @type {string}
   * @description This field contains the message ID the operation came under.
   */
  this.messageId = args.messageId;

  /**
   * @field
   * @type {string}
   * @description This field contains the unique identifier of the instance.
   */
  this.id = args.id;

  /**
   * @field
   * @type {string=}
   * @description This optional field contains the unique identifier of the overlay
   * the KML service is to be created under.  By default this is the map layer
   * parent.
   */
  this.overlayId = emp.helpers.id.get.setId(args.overlayId) || emp.constant.parentIds.MAP_LAYER_PARENT;

  /**
   * @field
   * @type {string}
   * @description This field contains the primary key of the instance.
   */
  this.coreId = (function(args) {
    if ((args.coreId !== undefined) && (args.coreId !== null)) {
      return args.coreId;
    }

    return args.id;
  })(args);

  /**
   * @field
   * @type {string}
   * @description This field contains the primary key of the parent object.
   */
  this.coreParent = args.coreParent || (function(args) {
      if (emp.helpers.id.get.isId(args.overlayId)) {
        return args.overlayId;
      }
      else if (emp.hasOwnProperty('storage')) {
        return emp.storage.getRootGuid();
      }

      return undefined;
    })(this);

  this.parentCoreId = args.parentCoreId || this.coreParent;

  /**
   * @field
   * @type {string}
   * @description This field contains the unescaped URL of a KML or KMZ file.
   */
  this.url = args.url;

  /**
   * @field
   * @type Boolean
   * @description This property indicates if the request for the KML file is issued
   * via the proxy (if true,) or not (if false).
   */
  this.useProxy = args.useProxy;


  /**
   * @private
   */
  this.version = args.version || "2.2";
  // capabilities will only be provided for wms adds where no default layers are provided


  this.kmlData = args.kmlData || args.kmlData;

  /**
   * @field
   * @type {boolean}
   * @description This field indicates if the WMS as a whole should be made visible (TRUE) or hidden (FALSE).
   * The map implementation must create the WMS service with the indicated visibility.
   */
  this.visible = args.visible;

  /**
   * @private
   */
  this.type = "kml";

  /**
   * @private
   */
  this.intent = args.intent || "kmllayer.add";


  /**
   * @private
   */
  this.source = args.source;


};
