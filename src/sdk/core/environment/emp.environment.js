/*global emp */

/**
 *
 * @namespace
 * @desc This namespace encapsulates function used to access the environment.
 */
emp.environment = (function() {
  var environmentList = [],
    isReady = false,
    readyCallbacks = [],
    shutdownCallbacks = [],
    proxyEnvironment = null,
    readyCount = 0;



  function dispatchReady() {
    isReady = true;
    var i, len;
    len = readyCallbacks.length;
    for (i = 0; i < len; i++) {
      try {
        readyCallbacks[i]();
      }
      catch (Error) {
        emp.typeLibrary.Error({
          level: emp.typeLibrary.Error.level.MAJOR,
          message: "Environment ready callback function generated and exception. ",
          jsError: Error
        });
      }
    }
    readyCallbacks = [];
  }

  function checkReady() {
    readyCount++;
    if (readyCount >= environmentList.length) {
      dispatchReady();
    }
  }

  function checkShutdown() {
    readyCount--;
    if (readyCount <= 0) {
      dispatchShutdown();
    }
  }


  function dispatchShutdown() {
    var i, len = shutdownCallbacks.length;
    for (i = 0; i < len; i++) {
      try {
        shutdownCallbacks[i]();
      }
      catch (Error) {
        emp.typeLibrary.Error({
          level: emp.typeLibrary.Error.level.MAJOR,
          meesage: "Environment shutdown callback function generated and exception. ",
          jsError: Error
        });
      }
    }
    shutdownCallbacks = [];
  }


  function subscribeAll(args) {
    var i, len = environmentList.length;
    for (i = 0; i < len; i++) {
      environmentList[i].pubSub.subscribe(args);
    }
  }

  function publishAll(args) {
    var i, len = environmentList.length;
    for (i = 0; i < len; i++) {
      // Filter out mouse move events for all envronments except browser for performance reasons
      if (args.channel !== cmapi.channel.names.MAP_VIEW_MOUSEMOVE || environmentList[i] === emp.environment.browser) {
        environmentList[i].pubSub.publish(args);
      }
    }
  }



  var publicInterface = {
    /**
     * @memberOf emp.environment
     * @method
     * @public
     * @description This function is called to set the environment instance.
     * @param {environmentInterface} environment This parameter must be an
     * environment instance based on {@link environmentInterface}.
     */
    set: function(args) {
      var i, env;

      environmentList = args.environments;
      for (i = 0; i < environmentList.length; i++) {
        env = environmentList[i];
        if (typeof env !== "string" && env.hasOwnProperty && env.hasOwnProperty("init")) {
          environmentList[i].init({
            initcallback: checkReady,
            shutdowncallback: checkShutdown,
            mapInstanceId: args.mapInstanceId,
            messageId: args.messageId,
            iwcHost: args.iwcHost
          });
        }
      }

    },
    /**
     * @method
     * @memberOf emp.environment
     * @public
     * @description This function is called to retrieve the environment instance.
     * @return {environmentInterface} This function returns a reference to
     * the environment instance.
     */
    get: function() {
      if (proxyEnvironment === null) {
        proxyEnvironment = emp.createEnvironmentTemplate();
        proxyEnvironment.pubSub.publish = publishAll;
        proxyEnvironment.pubSub.subscribe = subscribeAll;
      }
      return proxyEnvironment;
    },
    /**
     * @method
     * @memberOf emp.environment
     * @public
     * @description This function is called to set the ready and shutdown callbacks.
     * @param {function=} readyCB This parameter, if provided, must be a
     * function that takes no arguments.  It is called by the environment
     * when its ready to process request.
     * @param {function=} shutdownCB This parameter, if provided, must be a
     * function that takes no arguments.  It is called by the environment
     * before the environment is shutdown.
     */
    setCallbacks: function(readyCB, shutdownCB) {

      if (readyCB && (typeof readyCB !== 'function')) {
        throw emp.typeLibrary.Error({
          level: emp.typeLibrary.Error.level.MAJOR,
          message: "Ready callback parameter is not a function."
        });
      }

      if (shutdownCB && (typeof shutdownCB !== 'function')) {
        throw emp.typeLibrary.Error({
          level: emp.typeLibrary.Error.level.MAJOR,
          message: "Shutdown callback parameter is not a function."
        });
      }

      if (isReady === true) {
        readyCB();
      }
      else {
        readyCallbacks.push(readyCB);
      }

      if (shutdownCB) {
        shutdownCallbacks.push(shutdownCB);
      }
    }
  };
  return publicInterface;
}());

/**
 * @memberOf emp.environment
 * @public
 * @typedef {object} toolInfoType
 * @description This type defines the structure provided in onSuccess callback
 * of the getToolInfo environment call.
 * @property {string} toolName This property is the name provided in the call.
 * @property {object} toolhandle This property contains the structure
 * that must be provided to launchTool call.
 */


/**
 * @memberOf emp.environment
 * @public
 * @typedef {object} toolErrorType
 * @description This type defines the structure provided in onError callback
 * of the environment calls.
 * @property {string} message This property contains the error message.
 * @property {string} statusCode This property contains the error status code.
 */
