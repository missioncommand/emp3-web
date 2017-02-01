if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}
/**
 * @ignore
 * @constructor
 * @param {object} args
 * @param {string} args.id
 * @param {string} args.mapId
 * @param {string} args.geoId
 */
emp3.api.Transaction = function (args) {
  args = args || {};
  if (!args.id) {
    throw new Error("Missing parameter: id has not been set");
  }

  this.id = args.id;
  this.mapId = args.mapId;
  this.geoId = args.geoId;
};

/**
 * Cancels the transaction
 */
emp3.api.Transaction.prototype.cancel = function () {
  var cmd;

  cmd = {
    cmd: emp3.api.enums.channel.cancel,
    transaction: this
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.mapId,
    source: this,
    method: "Transaction.cancel",
    args: {}
  });
};

/**
 * Completes the transaction
 */
emp3.api.Transaction.prototype.complete = function () {
  var cmd;

  cmd = {
    cmd: emp3.api.enums.channel.transactionComplete,
    transaction: this
  };

  emp3.api.MessageHandler.getInstance().sendMessage(cmd, {
    mapId: this.mapId,
    source: this,
    method: "Transaction.complete",
    args: {}
  });
};
