emp.classLibrary.privateClass = function () {
  return {
    /**
     * @memberof emp.classLibrary.EmpObject#
     * @param {object} args
     */
    initialize: function (args) {
      /**
       * @memberof emp.classLibrary.EmpObject#
       */
      var options = {
        coreObjectType: args.coreObjectType || args.globalType,
        coreId: args.coreId || emp.helpers.id.newGUID()
      };
      emp.classLibrary.Util.setOptions(this, options);
    },
    /**
     * @memberof emp.classLibrary.EmpObject#
     */
    destroy: function () {
    },
    /**
     * @memberof emp.classLibrary.EmpObject#
     * @returns {emp.typeLibrary.types}
     */
    getCoreObjectType: function () {
      return this.options.coreObjectType;
    },
    /**
     * @memberof emp.classLibrary.EmpObject#
     * @returns {string} coreId of the object
     */
    getCoreId: function () {
      return this.options.coreId;
    },
    /**
     * @memberof emp.classLibrary.EmpObject#
     */
    prepForExecution: function () {
    }
  };
};

/**
 * @constructor
 */
emp.classLibrary.EmpObject = emp.classLibrary.Class.extend(emp.classLibrary.privateClass());
