/* global console, window */
/* eslint-disable no-console */

var emp = window.emp || {};

/**
 * Error Handler
 *
 * @namespace  errorHandler
 * @memberOf emp
 */
emp.errorHandler = (function() {
  /**
   * Level of Debug.
   * 0 = Normal Operation. No console output
   * 1 = Widget Developer Output. Generally centered around TypeLibrary Errors or Transaction failures.
   * 2 = Map Engine Developer Output. All the above plus minor or recoverable errors, anonymous error from the engine
   * 3 = CPCE Developer. All Errors get written to console and evented out
   *
   * @type {number}
   */
  var debugLevel = 3;
  var logJSONArray = [];

  // Avoid console errors in browsers that lack a console.
  (function() {
    var method,
      placeholder = function() {
      },
      methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
      ],
      len = methods.length,
      console = (window.console = window.console || {});

    while (len--) {
      method = methods[len];

      // Only substitute undefined methods with the placeholder function.
      if (!console[method]) {
        console[method] = placeholder;
      }
    }
  }());

  function enumerateError(error) {
    var ecopy = {
      name: error.name,
      message: error.message
    };
    if (error.fileName) {
      ecopy.file = error.fileName;
    }
    if (error.lineNumber) {
      ecopy.line = error.lineNumber;
    }
    if (error.columnNumber) {
      ecopy.column = error.columnNumber;
    }
    if (error.stack) {
      ecopy.stack = error.stack;
    }

    return ecopy;
  }

  var publicInterface = {
    /**
     * For entering errors that are correctly reported.
     * @memberof emp.errorHandler
     * @public
     * @param  {object} args
     * @param {string} args.message
     * @param {number} [args.level]
     * @param {object} args.jsError JavaScript error object
     */
    log: function(args) {
      /**
       * Level of error
       * @enum {number}
       * 0 = Info
       * 1 = Minor
       * 2 = Major
       * 3 = Catastrophic
       */

      var jsError = {},
        success = true,
        environment,
        msgLog = {},
        jsErrorStr = "";

      if (typeof args.level === 'undefined') {
        args.level = emp.typeLibrary.Error.level.MAJOR;

      } else if (args.level !== emp.typeLibrary.Error.level.CATASTROPHIC && args.level !== emp.typeLibrary.Error.level.MAJOR && args.level !== emp.typeLibrary.Error.level.MINOR && args.level !== emp.typeLibrary.Error.level.INFO) {
        args.level = emp.typeLibrary.Error.level.MAJOR;

      }
      if (emp.util.isEmptyString(args.message)) {

        args.message = "No Message Provided";
      }
      if (args.hasOwnProperty("jsError")) {
        jsError = enumerateError(args.jsError);
        msgLog.jsError = jsError;

        try {
          jsErrorStr = JSON.stringify(jsError);
          //jsErrorStr = encodeURIComponent(jsErrorStr);
        } catch (e) {
          jsErrorStr = "Unable to parse script error";
          console.error(e);
        }
      }
      if (jsErrorStr === "{}") {
        jsErrorStr = "";
      }
      msgLog.jsErrorStr = jsErrorStr;

      msgLog.message = args.message;

      jsErrorStr = jsErrorStr.replace(/\\n/g, '\n');
      jsErrorStr = jsErrorStr.replace(/,/g, ',\n');
      jsErrorStr = jsErrorStr.replace('"stack":', '"stack":\n');

      switch (args.level) {

        case emp.typeLibrary.Error.level.CATASTROPHIC:
          msgLog.level = "CATASTROPHIC";
          console.error(args.message + "\n" + jsErrorStr);
          break;
        case emp.typeLibrary.Error.level.MAJOR:
          msgLog.level = "MAJOR";
          console.error(args.message + "\n" + jsErrorStr);
          break;
        case emp.typeLibrary.Error.level.MINOR:
          console.warn(args.message + "\n" + jsErrorStr);
          msgLog.level = "MINOR";
          break;
        case emp.typeLibrary.Error.level.INFO:
          console.log(args.message + "\n" + jsErrorStr);
          msgLog.level = "INFO";
          break;
        default:
          break;
      }
      logJSONArray.unshift(msgLog);

      if (logJSONArray.length > 100) {
        console.log("Log JSON Array has reached its max length. The oldest error has been removed.");
        logJSONArray.pop();
      }

      try {
        environment = emp.environment.get();
        if (environment !== undefined && environment !== null && environment.hasOwnProperty("pubSub")) {
          environment.pubSub.publish({
            message: {
              message: args.message,
              error: jsError
            },
            channel: "emp.error"
          });
        }
      } catch (e) {
        console.error(e);
        success = false;
      }

      return success;
    },
    /**
     * Set debug level
     * @method
     * @public
     * @memberOf emp.errorHandler
     * @param {string} args
     */
    set: function(args) {
      debugLevel = args;
    },
    /**
     * Gets the debug level
     * @returns {number}
     */
    get: function() {
      return debugLevel;
    },
    /**
     * getMessages
     * @method
     * @public
     * @memberOf  emp.errorHandler
     */
    getMessages: function() {
      return logJSONArray;
    },
    /**
     * clearLog
     * @method
     * @public
     * @memberOf  emp.errorHandler
     */
    clearLog: function() {
      logJSONArray = [];
    },
    /**
     * exportLog
     * @method
     * @public
     * @memberOf  emp.errorHandler
     */
    exportLog: function() {
      var jsonOutputStr = JSON.stringify(logJSONArray);

      function dataUrl(txtData) {
        return "data:x-application/text," + escape(txtData);
      }

      window.open(dataUrl(jsonOutputStr), true, "height=1,width=1");
    }
  };
  return publicInterface;
}());
/* eslint-enable no-console */
