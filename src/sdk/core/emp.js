/**
 * This namespace encapsulates all the classes, functions, and constants defined for the Extensible Mapping Platform.
 * @namespace
 */
var emp = window.emp || {};

/**
 * Setting of whether or not to allow tv4 to run validation on {@link emp.typeLibrary.base} classes
 * @type {boolean}
 */
emp.validate = true;

/**
 * @namespace
 */
emp.core = {
  sources: {
    CONDUCTOR: "conductor",
    CONFIG: "config",
    ERROR: "error",
    EVENTING: "eventing",
    INTENT: "intent",
    MAP: "map",
    QUEUE: "queue",
    STORAGE: "storage",
    LIBRARY: "library",
    HOST: "EMP",
    EMP: "EMP",
    CORE: "core"
  }
};

emp.core.editor = {
  status: {
    IDDLE: "iddle", // do not acept external updates to edited feature
    ACTIVE: "active" // acept external updates to edited feature
  }
};
/**
 * @namespace
 */
emp.settings = emp.settings || {
  iconSize: 1.2,
  labelSize: 0.9,
  iconSizeOption: 24
};
