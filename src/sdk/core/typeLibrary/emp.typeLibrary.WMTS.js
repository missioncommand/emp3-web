var emp = window.emp || {};
emp.typeLibrary = emp.typeLibrary || {};

/**
 * @class
 * @description This class defines a WMTS service. A map implementation should never create
 * an instance of this class.
 */
emp.typeLibrary.WMTS = function(args) {

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
   * @type {object}
   * @description This field contains the service parameters to use for the WMS request.
   */
  this.params = args.params || {};


  if (!this.params.hasOwnProperty('format')) {
    this.params.format = escape("image/png");
  }
  else if (typeof(this.params.format) !== "string") {
    this.params.format = "image/png";
  }

  if (!this.params.hasOwnProperty('version')) {
    this.params.version = "1.0.0";
  } else if (typeof(this.params.version) !== "string") {
    this.params.version = "1.0.0";
  }

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
   * the WMS service is to be created under.
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
   * @description This field contains the unescaped URL of the WMS service.
   */
  this.url = args.url;

  /**
   * @field
   * @type Boolean
   * @description This property indicates if the request for the WMTS are issued
   * via the proxy (if true,) or not (if false).
   */
  this.useProxy = args.useProxy;

  // OverlayId is optional.  If no overlayId is provided for the WMS service
  // It will be added to root

  /**
   * @private
   */
  this.version = this.params.version || args.version || "";
  // capabilities will only be provided for wms adds where no default layers are provided


  /**
   * @private
   */
  this.format = this.params.format ||  args.format || "image/png";

  this.layer = this.params.layer || args.layer;

  this.style = this.params.style || args.style;

  this.sampleDimensions = this.params.sampleDimensions || args.sampleDimensions;

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
  this.type = "wmts";

  /**
   * @private
   */
  this.intent = args.intent || "wmts.add";


  /**
   * @private
   */
  this.source = args.source;


};
