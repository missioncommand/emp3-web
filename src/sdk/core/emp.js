/**
 * This namespace encapsulates all the classes, functions, and constants defined for the Extensible Mapping Platform.
 * @namespace
 */
var emp = window.emp || {};
emp.version = "3.0.0 Beta 1";
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
/**
 * @namespace
 */
emp.settings = emp.settings || {
  iconSize: 1.2,
  labelSize: 0.9,
  iconSizeOption: 24
};
