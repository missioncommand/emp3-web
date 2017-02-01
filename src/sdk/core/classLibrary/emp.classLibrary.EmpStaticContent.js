emp.classLibrary.privateClass = function () {
  var publicInterface = {
    /**
     * @memberof emp.classLibrary.EmpStaticContent#
     * @param {object} args
     */
    initialize: function (args) {
      /**
       * @memberof emp.classLibrary.EmpStaticContent#
       */
      var options = {
        overlayId: emp.helpers.id.get.setId(args.overlayId),
        parentId: emp.helpers.id.get.setId(args.parentId),
        featureId: emp.helpers.id.get.setId(args.featureId)
      };
      emp.classLibrary.Util.setOptions(this, options);

      emp.classLibrary.EmpRenderableObject.prototype.initialize.call(this, args);
    },
    /**
     * @memberof emp.classLibrary.EmpStaticContent#
     */
    destroy: function () {
    },
    /**
     * @memberof emp.classLibrary.EmpStaticContent#
     */
    getOverlayId: function () {
      return this.options.overlayId;
    },
    /**
     * @memberof emp.classLibrary.EmpStaticContent#
     */
    getParentId: function () {
      return this.options.parentId;
    },
    /**
     * @memberof emp.classLibrary.EmpStaticContent#
     */
    getFeatureId: function () {
      return this.options.featureId;
    },
    /**
     * @memberof emp.classLibrary.EmpStaticContent#
     */
    getObjectData: function (mapInstanceId, parentCoreId) {
      return new emp.typeLibrary.Static({
        coreId: this.getCoreId(),
        coreParent: parentCoreId,
        parentCoreId: parentCoreId,
        name: this.getName(),
        overlayId: this.getOverlayId(),
        parentId: this.getParentId(),
        featureId: this.getFeatureId(),
        visible: this.isVisibleOnMap(mapInstanceId)
      });
    }
  };

  return publicInterface;
};

/**
 * @constructor
 * @extends emp.classLibrary.EmpRenderableObject
 */
emp.classLibrary.EmpStaticContent = emp.classLibrary.EmpRenderableObject.extend(emp.classLibrary.privateClass());
