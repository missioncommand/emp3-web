emp.classLibrary.privateClass = function () {
  var publicInterface = {
    /**
     * @memberof emp.classLibrary.ObjectRelationship#
     * @param {object} args
     */
    initialize: function (args) {
      /**
       * @memberof emp.classLibrary.ObjectRelationship#
       * The visibilitySetting property contains an associative array keyed by
       * mapInstanceId where each value is a boolean value indicating if
       * the visibility setting of the object under the specified parent
       * on the specific map instance.
       *
       * The visibleUnderParent property contains an associative array keyed by
       * mapInstanceId where each value is a boolean value indicating if the
       * child is visible or not due to the parent's visibility.
       */
      var options = {
        parentStorageEntry: args.parentStorageEntry,
        childStorageEntry: args.childStorageEntry,
        visibilitySetting: {},
        visibleUnderParent: {}
      };
      emp.classLibrary.Util.setOptions(this, options);
    },
    /**
     * @memberof emp.classLibrary.ObjectRelationship#
     */
    destroy: function () {
    },
    /**
     * @memberof emp.classLibrary.ObjectRelationship#
     */
    getParent: function () {
      return this.options.parentStorageEntry;
    },
    /**
     * @memberof emp.classLibrary.ObjectRelationship#
     */
    getChild: function () {
      return this.options.childStorageEntry;
    },
    /**
     * @memberof emp.classLibrary.ObjectRelationship#
     */
    getParentCoreId: function () {
      return this.options.parentStorageEntry.getCoreId();
    },
    /**
     * @memberof emp.classLibrary.ObjectRelationship#
     */
    getChildCoreId: function () {
      return this.options.childStorageEntry.getCoreId();
    },
    /**
     * @memberof emp.classLibrary.ObjectRelationship#
     */
    getVisibilitySettingOnMap: function (mapInstanceId) {
      return ((typeof this.options.visibilitySetting[mapInstanceId] === 'boolean') ? this.options.visibilitySetting[mapInstanceId] : false);
    },
    /**
     * @memberof emp.classLibrary.ObjectRelationship#
     */
    getVisibleUnderParentOnMap: function (mapInstanceId) {
      return ((typeof this.options.visibleUnderParent[mapInstanceId] === 'boolean') ? this.options.visibleUnderParent[mapInstanceId] : false);
    },
    /**
     * @memberof emp.classLibrary.ObjectRelationship#
     */
    getVisibilityWithParent: function (mapInstanceId) {
      return this.getVisibilitySettingOnMap(mapInstanceId) && this.getVisibleUnderParentOnMap(mapInstanceId);
    },
    /**
     * @memberof emp.classLibrary.ObjectRelationship#
     */
    isOnMap: function (mapInstanceId) {
      return this.options.visibilitySetting.hasOwnProperty(mapInstanceId);
    },
    /**
     * @memberof emp.classLibrary.ObjectRelationship#
     */
    setVisibilitySettingOnMap: function (mapInstanceId, bVisibility) {
      this.options.visibilitySetting[mapInstanceId] = bVisibility;
    },
    /**
     * @memberof emp.classLibrary.ObjectRelationship#
     */
    setVisibleUnderParentOnMap: function (mapInstanceId, bVisibility) {
      this.options.visibleUnderParent[mapInstanceId] = bVisibility;
    },
    /**
     * @memberof emp.classLibrary.ObjectRelationship#
     */
    removeMapInstance: function (mapInstanceId) {
      if (this.options.visibilitySetting.hasOwnProperty(mapInstanceId)) {
        delete this.options.visibilitySetting[mapInstanceId];
        delete this.options.visibleUnderParent[mapInstanceId];
      }
    },
    /**
     * @memberof emp.classLibrary.ObjectRelationship#
     */
    getMapInstanceList: function () {
      return emp.helpers.associativeArray.getKeys(this.options.visibilitySetting);
    }
  };

  return publicInterface;
};

/**
 * @constructor
 */
emp.classLibrary.ObjectRelationship = emp.classLibrary.Class.extend(emp.classLibrary.privateClass());
