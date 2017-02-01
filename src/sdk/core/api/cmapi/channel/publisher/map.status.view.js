// Register a channel publisher for map.status.view
cmapi.channel.publisher[cmapi.channel.names.MAP_STATUS_VIEW] = {

  /**
   *
   * @param {emp.typeLibrary.Transaction} transaction
   */
  process: function(transaction) {
    try {
      var view = transaction.items[0],
          lookAt = transaction.items[1],
          payload = {};

      if (transaction.intent !== emp.intents.control.VIEW_CHANGE) {
        // Don't add a transaction ID when its a view change
        // event.
        //payload.messageId = view.transactionId;
      }
      if (transaction.hasOwnProperty('sender')) {
        payload.requester = transaction.sender;
      }

      if (typeof view.bounds === "object") {
        payload.bounds = {
          southWest: {
            lat: view.bounds.south,
            lon: view.bounds.west
          },
          northEast: {
            lat: view.bounds.north,
            lon: view.bounds.east
          }
        };
      }

      if (typeof view.location === "object") {
        payload.center = {
          lat: view.location.lat,
          lon: view.location.lon
        };
      }

      payload.altitude = view.altitude;
      payload.heading = view.heading;
      payload.tilt = view.tilt;
      payload.roll = view.roll;
      payload.range = view.range;
      payload.animate = view.animate;

      payload.lookAt = lookAt;

      emp.environment.get().pubSub.publish({
        message: payload,
        sender: {
          id: transaction.mapInstanceId
        },
        channel: cmapi.channel.names.MAP_STATUS_VIEW
      });
    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_STATUS_VIEW + " failed due to an error.",
        jsError: e
      });
    }

  }

};
