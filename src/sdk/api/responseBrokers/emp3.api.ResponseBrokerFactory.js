if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

/**
 * @classdesc ResponseBroker Factory
 * @ignore
 */
emp3.api.ResponseBrokerFactory = (function () {
  /**
   * ResponseBroker hash
   * @private
   */
  var _responseBrokers = {};

  return {
    /**
     * @memberof emp3.api.ResponseBrokerFactory
     *
     * Returns the broker based on the origin channel of the message
     * @param {string} channel
     * @returns {emp3.api.ResponseBroker}
     */
    getBroker: function (channel) {
      if (_responseBrokers[channel]) {
        return _responseBrokers[channel];
      }
    },
    /**
     * @memberof emp3.api.ResponseBrokerFactory
     *
     * Registers a response broker to handle an array of CMAPI channels
     * @param {string|string[]} channels
     * @param {emp3.api.ResponseBroker} broker
     */
    registerBroker: function (channels, broker) {
      if (Array.isArray(channels)) {
        for (var channel in channels) {
          if (channels.hasOwnProperty(channel)) {
            _responseBrokers[channels[channel]] = broker;
          }
        }
      } else {
        _responseBrokers[channels] = broker;
      }
    }
  };
})();
