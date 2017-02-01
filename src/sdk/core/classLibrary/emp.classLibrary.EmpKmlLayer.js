emp.classLibrary.privateClass = function () {
  var publicInterface = {
    /**
     * @memberof emp.classLibrary.EmpWMS#
     * @param {object} args
     */
    initialize: function (args) {
      /**
       * @memberof emp.classLibrary.EmpWMS#
       */
      if (emp.helpers.isEmptyString(args.name)) {
        args.name = 'KML: ' + args.url;
      }

      var options = {
        version: args.version || "2.2",
        kmlData: args.kmlData
      };

      args.coreObjectType = emp.typeLibrary.types.KML;

      emp.classLibrary.Util.setOptions(this, options);
      emp.classLibrary.EmpMapService.prototype.initialize.call(this, args);
    },

    /**
     *
     */
    getObjectData: function (mapInstanceId, coreParentId) {
      var oParent = this.getParentByIndex(0);

      var oObj = {
        coreId: this.getCoreId(),
        coreParent: coreParentId,
        parentCoreId: emp.storage.getRootGuid(mapInstanceId),
        id: this.options.id,
        overlayId: (oParent ? oParent.getOverlayId() : undefined),
        name: this.options.name,
        url: this.options.url,
        useProxy: this.options.useProxy,
        version: this.options.version,
        kmlData: this.options.kmlData,
        visible: this.isVisibleOnMap(mapInstanceId)
      };

      return new emp.typeLibrary.KmlLayer(oObj);
    },

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
          case 'url':
          case 'useProxy':
          case 'id':
            bRet = emp.classLibrary.EmpMapService.prototype.compareProperty.call(this, mapInstanceId, sProperty, Value);
            break;
          case 'kmlData':
            bRet = this.compareValues(this.options.kmlData, Value);
            break;
        }
      }

      return bRet;
    }
  };


  return publicInterface;
};

/**
 * @constructor
 * @extends emp.classLibrary.EmpRenderableObject
 */
emp.classLibrary.EmpKmlLayer = emp.classLibrary.EmpMapService.extend(emp.classLibrary.privateClass());
