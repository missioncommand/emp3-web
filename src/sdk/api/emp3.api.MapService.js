if (!window.emp3) {
  window.emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

/**
 * @interface
 * @classdesc This interface class defines the interface to all Map Services.
 * Map Services provide the backgrounds for the map.  Typically they are web
 * mapping services such as WMS, WMTS, etc, but they could be static data like
 * KML and KML links.  See {@link emp3.api.WMS}, {@link emp3.api.WMTS}, {@link emp3.api.KMLLayer}
 * for implementations of this interface.
 *
 * @param {object} [args] An optional object containing any mixture of the properties.  Any properties in the args
 * object that are not known properties will be ignored
 *
 * @see {@link emp3.api.KMLLayer}
 * @see {@link emp3.api.WMS}
 * @see {@link emp3.api.WMTS}
 */
emp3.api.MapService = function(args) {
  if (typeof args === 'undefined' || args === null || typeof args !== 'object') {
    args = {
      name: 'untitled map service',
      description: '',
      geoId: cmapi.randomUUID(),
      url: ''
    };
  } else {
    if (typeof args.name === 'undefined' || typeof args.name !== 'string') {
      args.name = 'untitled map service';
    }
    if (typeof args.description === 'undefined' || typeof args.description !== 'string') {
      args.description = '';
    }
    if (typeof args.geoId === 'undefined' || (typeof args.geoId !== 'string' && typeof args.geoId !== 'number')) {
      args.geoId = cmapi.randomUUID();
    }
    if (typeof args.url === 'undefined' || typeof args.url !== 'string') {
      args.url = undefined;
    }
  }

  var _description = args.description;
  /**
   * Description of the service
   * @name emp3.api.MapService#description
   * @type {string}
   */
  Object.defineProperty(this, "description", {
    enumerable: true,
    get: function () {
      return _description;
    },
    set: function (value) {
      _description = value;
    }
  });

  var _geoId = args.geoId;
  /**
   * Unique identifier for the service
   * @name emp3.api.MapService#geoId
   * @type {string}
   */
  Object.defineProperty(this, "geoId", {
    enumerable: true,
    get: function () {
      return _geoId;
    },
    set: function (value) {
      _geoId = value;
    }
  });

  var _name = args.name;
  /**
   * Name of the service
   * @name emp3.api.MapService#name
   * @type {string}
   */
  Object.defineProperty(this, "name", {
    enumerable: true,
    get: function () {
      return _name;
    },
    set: function (value) {
      _name = value;
    }
  });

  var _url = args.url;
  /**
   * URL for the service data location
   * @name emp3.api.MapService#url
   * @type {string}
   */
  Object.defineProperty(this, "url", {
    enumerable: true,
    get: function () {
      return _url;
    },
    set: function (value) {
      _url = value;
    }
  });

  var _useProxy = args.useProxy;
  /**
   * Have the map use its configured web proxy.  This will be needed if the service is on a different domain than the map.
   * @name emp3.api.MapService#useProxy
   * @type {boolean}
   */
  Object.defineProperty(this, "useProxy", {
    enumerable: false,
    get: function () {
      return _useProxy;
    },
    set: function (value) {
      _useProxy = value;
    }
  });
};
//======================================================================================================================
/**
 * @callback emp3.api.MapService~setVisibleCallback
 */

/**
 * @callback emp3.api.MapService~removeCallback
 */
//======================================================================================================================
/**
 * Removes this layer from the map
 * @param {object} args
 * @param {emp3.api.MapService~removeCallback} [args.onSuccess]
 * @param {ErrorCallback} [args.onError]
 */
emp3.api.MapService.prototype.remove = function(args) {
  if (!this.geoId || this.geoId.length < 1) {
    throw new Error("This layer does not have an ID. Has it been added " +
      "to the map yet?");
  }
  args = args || {};
  var cmd = {
    cmd: emp3.api.enums.channel.unplotFeature,
    feature: this,
    onSuccess: args.onSuccess,
    onError: args.onError
  };
  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    source: this,
    method: "MapService.remove",
    args: args
  });
  this.overlay = undefined;
};

/**
 * Sets the Service and all associated layers hidden or shown
 * @param {object} args
 * @param {boolean} args.visible
 * @param {emp3.api.MapService~setVisibleCallback} [args.onSuccess]
 * @param {ErrorCallback} [args.onError]
 */
emp3.api.MapService.prototype.setVisible = function(args) {
  args = args || {};
  if (!this.geoId || this.geoId.length < 1) {
    throw new Error("This layer does not have an ID. Has it been added to the map yet?");
  }
  var visible = true;
  if (typeof args.visible == 'boolean') {
    visible = args.visible;
    //this.properties.visible = args.visible;
  }
  // Format the request
  var cmd = {
    cmd: visible ? emp3.api.enums.channel.showFeature : emp3.api.enums.channel.hideFeature,
    layer: this,
    visible: visible,
    onSuccess: args.onSuccess,
    onError: args.onError
  };
  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    source: this,
    method: "Layer.setVisible",
    args: args
  });
};
