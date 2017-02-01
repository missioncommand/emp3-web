emp.classLibrary.privateClass = function () {
  var publicInterface = {
    /**
     * @memberof emp.classLibrary.EmpOverlay#
     * @param {object} args
     */
    initialize: function (args) {
      /**
       * @memberof emp.classLibrary.EmpOverlay#
       */
      var options = {
        overlayId: emp.helpers.id.get.setId(args.overlayId),
        parentId: emp.helpers.id.get.setId(args.parentId),
        menuId: emp.helpers.id.get.setId(args.menuId) || "",
        hidden:  args.hidden || false,
        /**
         * @private
         * @description This property  contains a list of all features under the overlay
         * keyed by the feature Id which MUST be unique in all cases.
         */
        featureList: {},
        cluster: undefined
      };
      emp.classLibrary.Util.setOptions(this, options);

      args.coreObjectType = emp.typeLibrary.types.OVERLAY;
      emp.classLibrary.EmpRenderableObject.prototype.initialize.call(this, args);

      if (this.options.properties.hasOwnProperty('cluster')) {
        this.options.cluster = new emp.typeLibrary.Overlay.Cluster(this.options.properties.cluster);

        if (!this.options.properties.hasOwnProperty('clusterActive')) {
          this.options.properties.clusterActive = false;
        } else {
          this.options.properties.clusterActive = (this.options.properties.clusterActive !== false);
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpOverlay#
     */
    destroy: function () {
    },
    /**
     * @memberof emp.classLibrary.EmpOverlay#
     */
    getOverlayId: function () {
      return this.options.overlayId;
    },
    /**
     * @memberof emp.classLibrary.EmpOverlay#
     */
    getParentId: function () {
      return this.options.parentId;
    },
    /**
     * @memberof emp.classLibrary.EmpOverlay#
     * @deprecated
     */
    getMenuId: function () {
      return this.options.menuId;
    },
    /**
     * @memberof emp.classLibrary.EmpOverlay#
     * @deprecated
     */
    setMenuId: function (sValue) {
      this.options.menuId = (!emp.helpers.isEmptyString(sValue) ? sValue : "");
    },
    /**
     * @memberof emp.classLibrary.EmpOverlay#
     */
    isOnFeatureList: function (oFeature) {
      return this.options.featureList.hasOwnProperty(oFeature.getCoreId());
    },
    /**
     * @memberof emp.classLibrary.EmpOverlay#
     */
    addToFeatureList: function (oFeature) {
      if (!this.isOnFeatureList(oFeature)) {
        this.options.featureList[oFeature.getCoreId()] = oFeature;
      }
    },
    /**
     * @memberof emp.classLibrary.EmpOverlay#
     */
    removeFromFeatureList: function (oFeature) {
      if (this.isOnFeatureList(oFeature)) {
        delete this.options.featureList[oFeature.getCoreId()];
      }
    },
    /**
     * @memberof emp.classLibrary.EmpOverlay#
     */
    getFeatureList: function () {
      return this.options.featureList;
    },
    /**
     * @memberof emp.classLibrary.EmpOverlay#
     */
    getObjectData: function (mapInstanceId, parentCoreId) {
      return new emp.typeLibrary.Overlay({
        coreId: this.getCoreId(),
        coreParent: parentCoreId,
        overlayId: this.getOverlayId(),
        parentId: parentCoreId,
        name: this.getName(),
        description: this.getDescription(),
        readOnly: this.isReadOnly(),
        globalType: emp.typeLibrary.types.OVERLAY,
        properties: emp.helpers.copyObject(this.options.properties),
        visible: this.isVisibleOnMap(mapInstanceId)
      });
    },
    /**
     * @memberof emp.classLibrary.EmpOverlay#
     */
    updateOverlay: function (oNewOverlayData) {
      var sProperty;
      var oProperties = oNewOverlayData.properties || {};

      this.setName(oNewOverlayData.name);
      this.setDescription(oNewOverlayData.description);

      for (sProperty in oProperties) {
        if (!oProperties.hasOwnProperty(sProperty)) {
          continue;
        }
        switch (sProperty.toLowerCase()) {
          case 'readonly':
            this.options.properties[sProperty] = (oProperties[sProperty] === true);
            break;
          case 'cluster':
          case 'clusteractive':
            // A cluster must be set at creation time or with the set cluster.
            break;
          default:
            this.options.properties[sProperty] = oProperties[sProperty];
            break;
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpOverlay#
     */
    compareProperty: function (mapInstanceId, sProperty, Value) {
      var bRet = false;

      if (!emp.util.isEmptyString(sProperty)) {
        switch (sProperty.toLowerCase()) {
          case 'name':
          case 'description':
          case 'readonly':
          case 'visible':
            bRet = emp.classLibrary.EmpRenderableObject.prototype.compareProperty.call(this, mapInstanceId, sProperty, Value);
            break;
          case 'menuid':
            bRet = this.compareValues(this.getMenuId(), Value);
            break;
          case 'overlayid':
            bRet = this.compareValues(this.getOverlayId(), Value);
            break;
        }
      }
      return bRet;
    }
    /*
     * TODO => Add function need to deal with adding, activating, deactivating and removing the cluster.
     */
  };

  return publicInterface;
};

/**
 * @constructor
 * @extends emp.classLibrary.EmpRenderableObject
 */
emp.classLibrary.EmpOverlay = emp.classLibrary.EmpRenderableObject.extend(emp.classLibrary.privateClass());
