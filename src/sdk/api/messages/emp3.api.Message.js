(function() {
  "use strict";

  if (!window.emp3) {
    emp3 = {};
  }
  if (!window.emp3.api) {
    emp3.api = {};
  }

  /**
   * @ignore
   * @constructor
   * @param {emp3.api.enums.channel} channel
   * @param {string} [transactionId]
   */
  emp3.api.Message = function(channel, transactionId) {
    /** @member {string} */
    this.channel = channel;

    /** @member {string} */
    this.transactionId = transactionId || emp3.api.createGUID();

    /** @member {object|Array} */
    this.payload = {};
  };

  /**
   * Returns a transaction object only if the message specifically requires it
   * @returns {emp3.api.Transaction|undefined}
   */
  emp3.api.Message.prototype.transaction = function() {
  };

  /**
   * Serializes the message payload
   * Note:For any subclasses which override this for a custom serialization the channel field must be injected into
   * the payload manually.
   * @returns {string} Serialized representation of the message payload
   */
  emp3.api.Message.prototype.serialize = function() {
    this.payload.channel = this.channel;
    return JSON.stringify(this.payload);
  };
}());
