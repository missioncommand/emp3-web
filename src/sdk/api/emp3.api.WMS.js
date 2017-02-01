if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

/**
 * @class
 * @extends {emp3.api.MapService}
 * @classdesc This class defines the interface to WMS.
 *
 * A WMS object allows someone to add a service as a map background to the map.
 * The WMS and its content is not 'selectable', it serves a way to supplement the
 * existing map with additional background images.  Once the WMS has been added
 * to the map you can control whether the WMS is visible or hidden.
 * <p>
 * To add or remove layers from the map, re-add the WMS using emp3.api.Map.addMapService
 * with updated layer parameters.
 *
 * @param {Object} args Arguments object
 * @param {String} args.layers A comma separated list of layer names that you
 * want displayed for this service. The layer names can be retrieved by making a
 * call to the WMS service GetCapabilities call.
 * @param {String} [args.version='1.3'] WMS version
 * @param {String} [args.tileFormat='image/png'] Image format
 * @param {boolean} [args.transparent=false] Whether the layers will be transparent or not
 *
 * @example <caption>Creating a WMS service and adding it to a map</caption>
 *
 * var noaaWMS = new emp3.api.WMS({
 *   url: 'http://idpgis.ncep.noaa.gov/arcgis/services/NWS_Observations/radar_base_reflectivity/MapServer/WMSServer',
 *   name: 'NOAA Conus Base Reflectivity',
 *   description: 'NWS Doppler Radar base reflectivity for CONUS.',
 *   layers: '1,2,3',
 *   version: '1.3'
 *  });
 *
 * map.addMapService({
 *   mapService: noaaWMS,
 *   onSuccess: function() {
 *     // callbacks or notification of complete
 *   }
 * });
 *
 * @example <caption>Updating the WMS service with additional layers. </caption>
 *
 * var wms = new emp3.api.WMS({
 *   name: 'Dark Earth',
 *   geoId: 'darkEarth1',
 *   url: 'http://worldwind25.arc.nasa.gov/wms',
 *   layers: 'earthatnight'
 * });
 *
 * map1.addMapService({
 *   mapService: wms
 * });
 * .
 * . // do some other stuff
 * .
 * .
 * wms.layers = 'earthatnight,FAAChart';  // update the layer parameters with the new addition of FAAChart layer.
 * map1.addMapService({
 *   mapService: wms
 * });
 */
emp3.api.WMS = function(args) {

  if (typeof args === 'undefined' || args === null || typeof args !== 'object') {
    args = {
      version: '1.3',
      transparent: false,
      layers: [],
      tileFormat: 'image/png'
    };
  } else {
    if (typeof args.version === 'undefined' || typeof args.version !== 'string') {
      args.version = '1.3';
    }
    if (typeof args.transparent === 'undefined' || typeof args.version !== 'boolean') {
      args.transparent = false;
    }
    if (typeof args.tileFormat === 'undefined' || typeof args.tileFormat !== 'string') {
      args.tileFormat = 'image/png';
    }
    if (typeof args.layers === 'undefined' || !Array.isArray(args.layers)) {
      if (typeof args.layers === 'string') {
        args.layers = args.layers.split(',');
      } else {
        args.layers = [];
      }
    }
  }

  emp3.api.MapService.call(this, args);

  /**
   * @default wms
   * @name emp3.api.WMS#format
   * @const
   * @type {string}
   */
  Object.defineProperty(this, 'format', {
    enumerable: true,
    writable: false,
    value: 'wms'
  });

  var _version = args.version;
  /**
   * @name emp3.api.WMS#version
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

  var _layers = args.layers;
  /**
   * A comma delimited string of layers
   * @name emp3.api.WMS#layers
   * @type {string}
   */
  Object.defineProperty(this, "layers", {
    enumerable: true,
    get: function () {
      return _layers;
    },
    set: function (value) {
      _layers = value;
    }
  });

  var _tileFormat = args.tileFormat;
  /**
   * @name emp3.api.WMS#tileFormat
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

  var _transparent = args.transparent;
  /**
   * @name emp3.api.WMS#transparent
   * @type {boolean}
   */
  Object.defineProperty(this, "transparent", {
    enumerable: true,
    get: function () {
      return _transparent;
    },
    set: function (value) {
      _transparent = value;
    }
  });
};

// Extend emp3.api.MapService
emp3.api.WMS.prototype = new emp3.api.MapService({
  type: "wms",
  format: "wms",
  url: ""
});
