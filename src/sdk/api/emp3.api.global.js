if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}
/**
 * @namespace
 * @memberof emp3.api
 * @desc Contains global settings properties and utility functions for EMP.

 * @property {Object} configuration Contains configuration properties for EMP.
 * @property {String} configuration.urlProxy Specifies the location of a proxy for outgoing
 * requests of the map.  The proxy will be used for WMS, fetching images,
 * and other map service related requests.
 */
emp3.api.global = emp3.api.global || {

    version: "2.4.0_dev",
    /**
     * @name emp3.api.global#configuration
     */
    configuration: (function() {
      var _urlProxy = "../urlproxy.jsp";

      /**
       * @name emp3.api.global.configuration#urlProxy
       * @type {string}
       */
      Object.defineProperty(this, "urlProxy", {
        enumerable: true,
        get: function() {
          return _urlProxy;
        },
        set: function(value) {
          if (typeof value === "string") {
            _urlProxy = value;
          } else {
            throw new Error("Invalid value type, property urlProxy must be a string");
          }
        }
      });
      return this;
    }())
  };

/**
 * Searches globally for an {@link emp3.api.Overlay}
 *
 * @param {object} args
 * @param {string} args.uuid Id of the feature to search for
 * @param {global~findOverlaySuccess} args.onSuccess Success callback to be invoked on a successful query.
 * @param {ErrorCallback} [args.onError] The error callback will fire only if there was an error performing the query.
 *
 * @example
 * emp3.api.global.findOverlay({
 *   uuid: '71d6f802-16cb47c0-b08806e9-29ae1a3e',
 *   onSuccess: function(cbArgs) {
 *     if (cbArgs.overlay) {
 *       window.console.debug('Overlay found', cbArgs.overlay.name);
 *     }
 *   }
 * });
 */
emp3.api.global.findOverlay = function(args) {
  var message = {},
    callInfo = {};

  message.cmd = emp3.api.enums.channel.get;
  message.filter = [{
    property: "overlayId",
    term: args.uuid
  }];
  message.types = ["overlay"];
  message.select = ["overlayId", "name", "description", "properties"];
  message.recursive = false;
  message.onSuccess = args.onSuccess;
  message.onError = args.onError;

  callInfo.source = "global";
  callInfo.method = "global.findOverlay";
  callInfo.args = args;

  emp3.api.MessageHandler.getInstance().sendMessage(message, callInfo);
};

/**
 * Searches globally for a {@link emp3.api.Feature}
 * @param {object} args
 * @param {string} args.uuid Id of the feature to search for
 * @param {global~findOverlaySuccess} args.onSuccess Success callback to be invoked on a successful query
 * @param {ErrorCallback} [args.onError] The error callback will fire only if there was an error performing the query.
 *
 * @example
 * emp3.api.global.findFeature({
 *   uuid: '71d6f802-16cb47c0-b08806e9-29ae1a3e',
 *   onSuccess: function(cbArgs) {
 *     if (cbArgs.feature) {
 *       window.console.log('Feature found', cbArgs.feature.name);
 *     }
 *   }
 * });
 */
emp3.api.global.findFeature = function(args) {
  var message = {},
    callInfo = {};

  message.cmd = emp3.api.enums.channel.get;
  message.filter = [{
    property: "featureId",
    term: args.uuid
  }];
  message.types = ["feature"];
  message.select = ["featureId", "name", "description", "properties"];
  message.recursive = false;
  message.onSuccess = args.onSuccess;
  message.onError = args.onError;

  callInfo.source = "global";
  callInfo.method = "global.findFeature";
  callInfo.args = args;

  emp3.api.MessageHandler.getInstance().sendMessage(message, callInfo);
};

/**
 * Finds a container on any instantiated map. It will not find Map objects.
 *
 * @param {object} args
 * @param {string} args.uuid Id of the container to search for
 * @param {global~findContainerSuccess} args.onSuccess The success callback will fire even if no container with the
 *     given uuid is found.
 * @param {ErrorCallback} [args.onError] The error callback will fire only if there was an error performing the query.
 *
 * @example
 * emp3.api.global.findContainer({
 *   uuid: '3404301c-6d8c4695-be359d80-cf7b5003',
 *   onSuccess: function(cbArgs) {
 *     if (cbArgs.container) {
 *       window.console.debug(instanceof cbArgs === emp3.api.Overlay ? 'Overlay found' : 'Feature Found');
 *     }
 *   }
 * });
 */
emp3.api.global.findContainer = function(args) {
  args = args || {};
  if (!args.onSuccess) {
    throw new Error('Missing argument: onSuccess');
  }

  if (!args.uuid) {
    throw new Error('Missing argument: uuid');
  } else if (typeof args.uuid !== 'string') {
    throw new TypeError('Invalid type: expected uuid to be a string');
  }

  var message = {
    cmd: emp3.api.enums.channel.get,
    types: ['feature', 'overlay'],
    select: ['featureId', 'overlayId', 'name', 'description', 'properties'],
    filter: [{
      property: 'featureId',
      term: args.uuid
    }, {
      property: 'overlayId',
      term: args.uuid
    }],
    recursive: false,
    onSuccess: args.onSuccess,
    onError: args.onError
  };

  var callInfo = {
    source: 'global',
    method: 'global.findContainer',
    args: args
  };

  emp3.api.MessageHandler.getInstance().sendMessage(message, callInfo);
};

//======================================================================================================================
// Callbacks
//======================================================================================================================
/**
 * This callback will container an {@link emp3.api.Overlay} in the overlay property if one has been found.
 *
 * @callback global~findOverlaySuccess
 * @param {object} cbArgs
 * @param {undefined|emp3.api.Overlay} cbArgs.overlay
 */

/**
 * This callback will container an {@link emp3.api.Feature} in the feature property if one has been found.
 *
 * @callback global~findFeatureSuccess
 * @param {object} cbArgs
 * @param {undefined|emp3.api.Feature} cbArgs.feature
 */

/**
 * This callback will contain either an {@link emp3.api.Overlay} or {@link emp3.api.Feature} in the container property
 * of the callback object.
 *
 * @callback global~findContainerSuccess
 * @param {object} cbArgs
 * @param {undefined|emp3.api.Feature|emp3.api.Overlay} cbArgs.container
 */
