if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

/**
 * @class
 * @extends {emp3.api.MapService}
 * @classdesc This class defines the interface to a Web Map Tile Service (WMTS).
 * A WMTS Service may be set up on a server.  WMTS Service may provide a one or
 * more layers that may be added to the map.  To add a WMTS Service onto the map you
 * must know the layer id of the layer from the WMTS Service.  A list of layers
 * and layer ids can be provided by the WMTS service by a call to its
 * GetCapabilities method. Unlike WMS, WMTS does not allow a singleton
 * request that merges multiple layers in a single call.  To add more than
 * one layer, you must add multiple WMTS services.
 * <p>
 * The map will manage which tiles should be requested for display on the
 * screen at any given
 * time.
 * <p>
 * The WMTS will default the version to 1.0.0, the tile format to the image/png
 * mime type, and the setting the style id to 'default'.  You may override these
 * defaults with your own.
 *
 *
 * @param {Object} args Arguments members are provided as part of the args object
 * @param {String} args.url The url of the WMTS map service
 * @param {String} args.layer The id of the layer from the WMTS service
 * @param {String} [args.name] A name for display to the user.
 * @param {String} [args.description] A short description of what the service
 * is showing.  For use to display to the user.
 * @param {String} [args.version='1.0.0'] A string specifying the version of the
 * WMTS service being used.
 * @param {String} [args.tileFormat='image/png'] A mime type specifying the image
 * format of the response of the service.
 * @param {String} [args.style='default'] The style id for the layer.  this
 * should match one of the styles returned in the GetCapabilities response.
 * @param {Object} [args.sampleDimensions] A JSON object that contains key value pairs
 * of parameters that can be set for the service.  These parameters map be unique to a WMTS service
 * and are defined in the GetCapabilities response.  Sample properties are
 * 'elevation' and 'time'.
 * @param {boolean} [args.useProxy = false] Specifies if the the map uses its
 * configured web proxy.  This will be needed if the service is on a different
 * domain than the map.
 *
 * @example
 *
 * var wmts = new emp3.api.WMTS({
 *   url: 'http://mymapserve/wmts',
 *   name: 'JOGA FT DRUM',
 *   description: '1:250K Map of Fort Drum',
 *   layer: '1',
 *  });
 *
 *  map.addMapService({
 *    mapService: wmts,
 *    onSuccess: function() {
 *      // callbacks or notification of complete
 *    }
 *  });
 */
emp3.api.WMTS = function(args) {


  if (typeof args === 'undefined' || args === null || typeof args !== 'object') {
    args = {
      version: '1.0.0',
      tileFormat: 'image/png',
      style: 'default'
    };
  } else {
    if (typeof args.version === 'undefined' || typeof args.version !== 'string') {
      args.version = '1.0.0';
    }
    if (typeof args.tileFormat === 'undefined' || typeof args.tileFormat !== 'string') {
      args.tileFormat = 'image/png';
    }
    if (typeof args.style === 'undefined' || typeof args.style !== 'string') {
      args.style = 'default';
    }
  }

  emp3.api.MapService.call(this, args);

  /**
   * @default wmts
   * @name emp3.api.WMTS#format
   * @const
   * @type {string}
   */
  Object.defineProperty(this, 'format', {
    enumerable: true,
    writable: false,
    value: 'wmts'
  });

  var _version = args.version;
  /**
   * @name emp3.api.WMTS#version
   * @type {string}
   */
  Object.defineProperty(this, "version", {
    enumerable: true,
    get: function () {
      return _version;
    },
    set: function (value) {
      _version = value;
    }
  });

  var _style = args.style;
  /**
   * @name emp3.api.WMTS#style
   * @type {string}
   */
  Object.defineProperty(this, "style", {
    enumerable: true,
    get: function () {
      return _style;
    },
    set: function (value) {
      _style = value;
    }
  });

  var _tileFormat = args.tileFormat;
  /**
   * @name emp3.api.WMTS#tileFormat
   * @type {string}
   */
  Object.defineProperty(this, "tileFormat", {
    enumerable: true,
    get: function () {
      return _tileFormat;
    },
    set: function (value) {
      _tileFormat = value;
    }
  });

  var _layer = args.layer;
  /**
   * @name emp3.api.WMTS#layer
   * @type {string}
   */
  Object.defineProperty(this, "layer", {
    enumerable: true,
    get: function () {
      return _layer;
    },
    set: function (value) {
      _layer = value;
    }
  });

  var _sampleDimensions = args.sampleDimensions;
  /**
   * @name emp3.api.WMTS#version
   * @type {object}
   */
  Object.defineProperty(this, "sampleDimensions", {
    enumerable: true,
    get: function () {
      return _sampleDimensions;
    },
    set: function (value) {
      _sampleDimensions = value;
    }
  });
};

// Extend emp3.api.MapService
emp3.api.WMS.prototype = new emp3.api.MapService({
  type: "wmts",
  format: "wmts",
  url: ""
});
