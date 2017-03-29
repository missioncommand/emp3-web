var emp = window.emp || {};
emp.typeLibrary = emp.typeLibrary || {};

/**
 * @memberof emp.typeLibrary
 * @class
 * @param {object} args
 * @param {emp3.api.enums.MapMotionLockEnum} args.lock
 *
 * @description This class represent a lock on a particular item.  Locking
 * an item means it cannot be moved or interacted with.
 */
emp.typeLibrary.Lock = function(args) {
  /**
   * @type emp3.api.enums.MapMotionLockEnum
   * @description This property contains a boolean indicating if we want to lock or unlock
   */
  this.lock = args.lock;
};
