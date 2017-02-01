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
        args.name = 'WMTS: ' + args.url;
      }

      var options = {
        format: args.format || "image/png",
        version: args.version || "1.0.0",
        layer: args.layer,
        style: args.style || "default",
        sampleDimensions: args.sampleDimensions
      };

      args.coreObjectType = emp.typeLibrary.types.WMTS;

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
        format: this.options.params.format,
        version: this.options.params.version,
        layer: this.options.params.layer,
        style: this.options.params.style,
        visible: this.isVisibleOnMap(mapInstanceId)
      };

      if (this.options.sampleDimensions) {
        oObj.sampleDimensions = emp.helpers.copyObject(this.options.sampleDimensions);
      }

      return new emp.typeLibrary.WMTS(oObj);
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
          case 'params':
            bRet = emp.classLibrary.EmpMapService.prototype.compareProperty.call(this, mapInstanceId, sProperty, Value);
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
emp.classLibrary.EmpWMTS = emp.classLibrary.EmpMapService.extend(emp.classLibrary.privateClass());
