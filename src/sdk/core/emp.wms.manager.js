var emp = window.emp || {};

/**
 * @namespace
 */
emp.wms = emp.wms || {};

/**
 * Self instantiating singleton for emp.wms.manager
 */
emp.wms.manager = (function() {
  // Object returned to emp.wms.manager namespace for other components to interface with
  // Function closure gives this object private access to all function level variables
  var publicInterface,
    instanceData = {};

  publicInterface = {
    /**
     * @param {string} mapInstanceId
     * @returns {undefined|string}
     */
    getWmsOverlayId: function(mapInstanceId) {
      if (instanceData.hasOwnProperty(mapInstanceId)) {
        return instanceData[mapInstanceId].wmsOverlayId;
      }
      return undefined;
    },
    /**
     * Checks if the given ID belongs to a root WMS layer
     * @memberof emp.wms.manager
     * @param {string} id
     * @returns {boolean}
     */
    isRootWMS: function(id) {
      for (var instance in instanceData) {
        if (instanceData.hasOwnProperty(instance)) {
          if (instanceData[instance].wmsOverlayId === id) {
            return true;
          }
        }
      }
      return false;
    },
    /**
     *
     * @param args
     */
    newMapInstance: function(args) {
      var oData,
        wmsOverlay,
        overlayTransaction,
        wmsOverlayId = emp.helpers.id.newGUID();

      wmsOverlay = new emp.typeLibrary.Overlay({
        name: "WMS Map Layers",
        overlayId: wmsOverlayId
      });

      oData = {
        instanceId: args.mapInstanceId,
        wmsOverlayId: wmsOverlayId,
        overlay: wmsOverlay
      };
      instanceData[args.mapInstanceId] = oData;

      overlayTransaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.OVERLAY_ADD,
        mapInstanceId: args.mapInstanceId,
        source: emp.core.sources.CORE,
        items: [wmsOverlay]
      });

      overlayTransaction.queue();
    },
    /**
     * Deletes a WMS instance from the emp.wms store
     * @param {object} args
     * @param {string} args.mapInstanceId
     */
    removeMapInstance: function(args) {
      if (instanceData.hasOwnProperty(args.mapInstanceId)) {
        delete instanceData[args.mapInstanceId];
      }
    }
  };

  return publicInterface;
}());
