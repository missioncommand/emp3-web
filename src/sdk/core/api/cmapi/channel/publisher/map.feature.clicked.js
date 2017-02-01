// Register a channel publisher for map.status.MAP_FEATURE_CLICKED
cmapi.channel.publisher[cmapi.channel.names.MAP_FEATURE_CLICKED] = {

  // args will have a transaction property
  process: function(transaction) {
    try {
      var oPointer = transaction.items[0];
      var oFeature = emp.storage.findFeature(oPointer.overlayId, oPointer.featureId);
      var feature;

      var payload = {
        overlayId: oPointer.overlayId,
        featureId: oPointer.featureId,
        button: oPointer.button,
        type: oPointer.type,
        mgrs: oPointer.mgrs,
        keys: oPointer.keys,
        clientX: oPointer.clientX,
        clientY: oPointer.clientY,
        screenX: oPointer.screenX,
        screenY: oPointer.screenY,
        width: oPointer.width,
        height: oPointer.height,
        zoom: oPointer.range,
        scale: oPointer.scale
      };

      if (oFeature !== undefined) {
        // If the feature exists we need to retrieve additional
        // properties so the api can create it on the receiving end.
        feature = oFeature.getObjectData(null, null);

        if (feature) {
          payload.properties = feature.properties;
          payload.format = feature.format;
          payload.feature = feature.data;
          payload.name = feature.name;
          payload.menuId = feature.menuId;
        }
      }

      if (!emp.util.isEmptyString(oPointer.parentId)) {
        payload.parentId = oPointer.parentId;
      }

      if ((oPointer.bounds !== undefined) &&
        (oPointer.bounds !== null)) {
        payload.bounds = {
          northEast: {
            lat: oPointer.bounds.north,
            lon: oPointer.bounds.east
          },
          southWest: {
            lat: oPointer.bounds.south,
            lon: oPointer.bounds.west
          }
        };
      }

      emp.environment.get().pubSub.publish({
        message: payload,
        sender: {
          id: transaction.mapInstanceId
        },
        channel: cmapi.channel.names.MAP_FEATURE_CLICKED
      });
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_FEATURE_CLICKED + " failed due to an error.",
        jsError: e
      });
    }
  }
};
