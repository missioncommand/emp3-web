
/* global emp */

/**
 * @memberof emp.typeLibrary
 * @class
 * @description This class represent a lock on a particular item.  Locking
 * an item means it cannot be moved or interacted with.
 */
emp.typeLibrary.Lock = function (args) {
    /**
     * @field
     * @type number
     * @description This property contains a boolean indicating if we want
     * to lock or unlock something.
     */
    this.lock = args.lock;
    
};
