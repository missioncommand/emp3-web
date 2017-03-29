var emp = window.emp || {};
emp.typeLibrary = emp.typeLibrary || {};

/**
 * @memberOf emp.typeLibrary
 * @class
 * @description This class is an documents an error. When an instance is created use the new operator.
 * @param {emp.typeLibrary.Error.ParameterType} args - The arguments needed to create an error object
 * @param {string} [args.message]
 * @param {emp.typeLibrary.Error.level} [args.level = emp.typeLibrary.Error.level.INFO]
 * @param {string} [args.coreId]
 * @param {object} [args.jsError]
 */
emp.typeLibrary.Error = function(args) {

  var returnValue;

  /*
   *  var schema = {
   *    "title": "error-schema",
   *    "type": "object",
   *    "properties": {
   *      "message": {
   *        "type": "string"
   *      }
   *    },
   *    "required": ["message"]
   *  };
   */

  returnValue = {
    date: new Date(),
    message: args.message || "",
    level: args.level || 0,
    coreId: args.coreId || "",
    jsError: args.jsError || {}
  };

  emp.errorHandler.log(returnValue);
  return returnValue;
};

/**
 * @memberOf emp.typeLibrary.Error
 * @enum
 * @readonly
 */
emp.typeLibrary.Error.level = {
  /**
   * @constant
   * @type number
   * @description This value indicates an informative messages.
   */
  INFO: 0,
  /**
   * @constant
   * @type number
   * @description This value indicates a minor error has occurred.
   */
  MINOR: 1,
  /**
   * @constant
   * @type number
   * @description This value indicates a major error has occurred.
   */
  MAJOR: 2,
  /**
   * @constant
   * @type number
   * @description This value indicates a catastrophic error has occurred. The
   * system may behave erratically or not at all.
   */
  CATASTROPHIC: 3
};

/**
 * @typedef emp.typeLibrary.Error.ParameterType
 * @property {string} [coreId] The primary key of the object the error pertains to.
 * @property {emp.typeLibrary.Error.level} level The severity level of the error.
 * @property {string} message - error message
 * @property {object} [jsError] - optional javascript exception object
 */
