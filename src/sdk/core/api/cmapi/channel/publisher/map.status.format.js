// Register a channel publisher for map.status.format
cmapi.channel.publisher[cmapi.channel.names.MAP_STATUS_FORMAT] = {

  // args will have a transaction property
  process: function(transaction) {
    try {
      var payload = {};
      var oaformats = [],
        mapInstance = emp.instanceManager.getInstance(transaction.mapInstanceId);

      //payload.messageId = oData.transactionId;

      if (mapInstance.engine.capabilities.formats.GEOJSON_BASIC.plot ||
        mapInstance.engine.capabilities.formats.GEOJSON_FULL) {
        oaformats.push("geojson");
      }

      if (mapInstance.engine.capabilities.formats.WMS.version_1_1 ||
        mapInstance.engine.capabilities.formats.WMS.version_1_3) {
        oaformats.push("wms");
      }

      if (mapInstance.engine.capabilities.formats.KML_BASIC ||
        mapInstance.engine.capabilities.formats.KML_COMPLEX) {
        oaformats.push("kml");
      }

      if (mapInstance.engine.capabilities.formats.IMAGE.plot) {
        oaformats.push("image");
      }

      if (mapInstance.engine.capabilities.formats.MILSTD.version2525B.plot ||
        mapInstance.engine.capabilities.formats.MILSTD.version2525C.plot) {
        oaformats.push("milstd");
      }

      if (mapInstance.engine.capabilities.formats.AIRSPACE.plot) {
        oaformats.push("airspace");
      }

      if (mapInstance.engine.capabilities.formats.AOI.plot) {
        oaformats.push("aoi");
      }

      if (mapInstance.engine.capabilities.formats.ArcGIS) {
        oaformats.push("arc");
      }

      payload.formats = oaformats;

      emp.environment.get().pubSub.publish({
        message: payload,
        sender: {
          id: transaction.mapInstanceId
        },
        channel: cmapi.channel.names.MAP_STATUS_FORMAT
      });
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_FEATURE_CLICKED + " failed due to an error.",
        jsError: e
      });
    }

  }

};
