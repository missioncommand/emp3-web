/* global Storage, localStorage */
var emp = window.emp || {};

/**
 * @private
 * @namespace
 */
emp.prefs = (function() {

  /**
   *
   * @param args
   * @returns {*}
   */
  function getPref(args) {
    var value = null,
      raw;
    try {
      if (typeof Storage !== "undefined") {

        raw = localStorage[args.key];
        if (raw !== undefined && raw !== null) {
          value = JSON.parse(raw);
        }
      }
    } catch (err) {
      emp.typeLibrary.Error({
        jsError: err,
        level: emp.typeLibrary.Error.MINOR,
        message: "emp.prefs was unable to retrieve the value of: '" + args.key + "'. Please see the jsError for more details"
      });
    }

    return value;
  }

  /**
   * @protected
   * @memberOf emp.prefs
   * @param  {object} args
   * @return {void}
   */
  function savePref(args) {
    var success = false;
    try {
      if (typeof Storage !== "undefined") {

        localStorage[args.key] = JSON.stringify(args.value);
        success = true;
      }
    } catch (err) {
      emp.typeLibrary.Error({
        jsError: err,
        level: emp.typeLibrary.Error.MINOR,
        message: "emp.prefs was unable to save the value of: '" + args.key + "'. Please see the jsError for more details"
      });
    }
    return success;
  }

  /**
   * @memberOf emp.prefs
   * @protected
   * @param  {void} args
   * @return {void}
   */
  function clearPref(args) {
    try {
      if (typeof Storage !== "undefined") {

        delete localStorage[args.key];
      }
    } catch (err) {
      emp.typeLibrary.Error({
        jsError: err,
        level: emp.typeLibrary.Error.MINOR,
        message: "emp.prefs was unable to clear the value of: '" + args.key + "'. Please see the jsError for more details"
      });
    }
  }

  var publicInterface = {
    /**
     * @memberOf emp.prefs
     * @public
     * @namespace  engine
     * @type {Object}
     */
    engine: {
      /**
       * @memberOf emp.prefs.engine
       * @param {string} engine
       */
      set: function(engine) {
        savePref({
          key: "engine",
          value: engine
        });
      },
      /**
       * @memberOf emp.prefs.engine
       * @return {object}
       */
      get: function() {
        return getPref({
          key: "engine"
        });
      },
      /**
       * @memberOf emp.prefs.engine
       * @return {void}
       */
      clear: function() {
        clearPref({
          key: "engine"
        });
        alert("Your default map engine selection has been cleared.  You will be asked to choose an engine the next time the map is restarted");
      }
    }

  };
  return publicInterface;

}());
