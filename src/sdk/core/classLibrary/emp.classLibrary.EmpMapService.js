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
      var options = {
        id: args.id,
        url: args.url,
        useProxy: args.useProxy,
        params: args.params,
        source: args.source
      };

      emp.classLibrary.Util.setOptions(this, options);

      emp.classLibrary.EmpRenderableObject.prototype.initialize.call(this, args);
    },

    /**
     *
     */
    compareProperty: function (mapInstanceId, sProperty, value) {
      var bRet = false;

      if (!emp.util.isEmptyString(sProperty)) {
        switch (sProperty.toLowerCase()) {
          case 'name':
          case 'description':
          case 'readonly':
          case 'visible':
            bRet = emp.classLibrary.EmpRenderableObject.prototype.compareProperty.call(this, mapInstanceId, sProperty, value);
            break;
          case 'url':
            bRet = this.compareValues(this.options.url, value);
            break;
          case 'useProxy':
            bRet = this.compareValues(this.options.useProxy, value);
            break;
          case 'id':
            bRet = this.compareValues(this.options.id, value);
            break;
          case 'params':
            bRet = this.compareValues(this.options.params, value);
            break;
        }
      }

      return bRet;
    },

    /**
     *
     */
    canMapEnginePlot: function (mapInstanceId) {
      return emp.helpers.canMapEnginePlotFeature(mapInstanceId, this);
    },

    getVersion: function () {
      return this.options.version;
    }

  };

  return publicInterface;
};

/**
 * @constructor
 * @extends emp.classLibrary.EmpRenderableObject
 */
emp.classLibrary.EmpMapService = emp.classLibrary.EmpRenderableObject.extend(emp.classLibrary.privateClass());
