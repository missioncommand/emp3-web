if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

emp3.api.MessageFactory = (function () {
  /**
   * Message hash
   * @private
   */
  var _messageHash = {};

  return {
    /**
     * @memberof emp3.api.MessageFactory
     *
     * Generates a payload
     * @param message
     * @param callInfo
     * @param transactionId
     */
    constructPayload: function (message, callInfo, transactionId) {
      if (_messageHash[message.cmd]) {
        return new _messageHash[message.cmd](message, callInfo, transactionId);
      }
    },
    /**
     * @memberof emp3.api.MessageFactory
     *
     * @param {string|string[]} channels
     * @param {function} message Constructor
     */
    registerMessage: function (channels, message) {
      if (Array.isArray(channels)) {
        for (var channel in channels) {
          if (channels.hasOwnProperty(channel)) {
            _messageHash[channels[channel]] = message;
          }
        }
      } else {
        _messageHash[channels] = message;
      }
    }
  };
})();
