// Register a channel publisher for map.status.about
cmapi.channel.publisher[cmapi.channel.names.MAP_STATUS_ABOUT] = {

  // args will have a transaction property
  process: function(transaction) {
    try {
      var payload = {};
      var oaformats = [],
        mapInstance = emp.instanceManager.getInstance(transaction.mapInstanceId);

      //payload.messageId = oData.transactionId;
      payload.version = emp.version;

      if (mapInstance.engine.capabilities.mapType.type2D) {
        payload.type = "2D";
      } else if (mapInstance.engine.capabilities.mapType.type3D) {
        payload.type = "3D";
      } else {
        payload.type = "unknown";
      }

      payload.widgetName = emp.environment.get().name;
      payload.instanceName = emp.environment.get().properties.widgetName;
      payload.universalName = emp.environment.get().properties.universalName;
      payload.extensions = [];

      if (mapInstance.engine.implementation) {
        if (mapInstance.engine.implementation.displayName) {
          payload.extensions.push({
            engineName: mapInstance.engine.implementation.displayName
          });
        }
        if (mapInstance.engine.implementation.version) {
          payload.extensions.push({
            sprint: mapInstance.engine.implementation.version
          });
        }
      }

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

      payload.extensions.push({
        formats: oaformats
      });

      emp.environment.get().pubSub.publish({
        message: payload,
        sender: {
          id: transaction.mapInstanceId
        },
        channel: cmapi.channel.names.MAP_STATUS_ABOUT
      });
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_FEATURE_CLICKED + " failed due to an error.",
        jsError: e
      });
    }

  }

};
