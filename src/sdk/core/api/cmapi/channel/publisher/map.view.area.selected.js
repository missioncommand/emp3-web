/*global emp, cmapi */
// Register a channel publisher for map.view.clicked
cmapi.channel.publisher[cmapi.channel.names.MAP_VIEW_AREA_SELECTED] = {

  // args will have a transaction property
  process: function(transaction) {
    try {
      var pointer = transaction.items[0],
        payload,
        bounds;

      if ((pointer.bounds !== undefined) && (pointer.bounds !== null)) {
        bounds = {
          northEast: {
            lat: pointer.bounds.north,
            lon: pointer.bounds.east
          },
          southWest: {
            lat: pointer.bounds.south,
            lon: pointer.bounds.west
          }
        };
      }

      payload = {
        button: pointer.button,
        keys: pointer.keys,
        bounds: bounds,
        zoom: pointer.zoom,
        scale: pointer.scale
      };

      emp.environment.get().pubSub.publish({
        message: payload,
        sender: {
          id: transaction.mapInstanceId
        },
        channel: cmapi.channel.names.MAP_VIEW_AREA_SELECTED
      });
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_VIEW_AREA_SELECTED + " failed due to an error.",
        jsError: e
      });
    }

  }

};
