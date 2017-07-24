emp.classLibrary.privateClass = function() {
  var publicInterface = {
    /**
     * @memberof emp.classLibrary.EmpWMS#
     * @param {object} args
     */
    initialize: function(args) {
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
        sampleDimensions: args.sampleDimensions,
        tileMatrixSet: args.tileMatrixSet,
        url: args.url,
        useProxy: args.useProxy
      };

      args.coreObjectType = emp.typeLibrary.types.WMTS;

      emp.classLibrary.Util.setOptions(this, options);
      emp.classLibrary.EmpMapService.prototype.initialize.call(this, args);
    },

    /**
     *
     */
    getObjectData: function(mapInstanceId, coreParentId) {
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
        visible: this.isVisibleOnMap(mapInstanceId),
        tileMatrixSet: this.options.params.tileMatrixSet
      };

      if (this.options.sampleDimensions) {
        oObj.sampleDimensions = emp.helpers.copyObject(this.options.sampleDimensions);
      }

      return new emp.typeLibrary.WMTS(oObj);
    },

    /**
     * @memberof emp.classLibrary.EmpWMS#
     */
    update: function (args) {
      if (args.hasOwnProperty('params')) {
        // if (args.params.hasOwnProperty('transparent')) {
        //   if (typeof (args.params.transparent) === "boolean") {
        //     this.options.transparent = args.params.transparent;
        //   }
        //   else if (typeof (args.params.transparent) === "string") {
        //     this.options.transparent = (this.params.transparent.toUpperCase() !== "FALSE");
        //   }
        // }

        if (args.params.hasOwnProperty('format') && (typeof (args.params.format) === "string")) {
          this.options.format = args.params.format;
        }

        if (args.params.hasOwnProperty('version') && (typeof (args.params.version) === "string")) {
          this.options.version = args.params.version;
        }
      }

      if (args.hasOwnProperty('url')) {
        this.options.url = args.url;
      }

      if (args.hasOwnProperty('name')) {
        this.setName(args.name);
      }

      if (emp.helpers.isEmptyString(this.getName())) {
        this.setName('WMTS: ' + this.options.url);
      }

      if ((args.layer !== undefined) && (args.layer !== null)) {
        this.options.layer = emp.helpers.copyObject(args.layer);
        //this.options.activeLayers = emp.helpers.copyObject(args.layers);
      }

     if (args.hasOwnProperty('tileMatrixSet')) {
        this.options.tileMatrixSet =  args.tileMatrixSet;
      }
    },


    compareProperty: function(mapInstanceId, sProperty, Value) {
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
