if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}
/**
 * @ignore
 * @classdesc The response broker handles messages returned from the core. Specific CMAPI channels must have their own
 * specific sub-classed broker described for each channel.  The same broker may be used to support multiple channels
 * but each channel may have only one response broker.
 */
emp3.api.ResponseBroker = function() {};

/**
 * @abstract
 * @param callbacks
 * @param details
 * @param failures
 */
emp3.api.ResponseBroker.prototype.process = function(callbacks, details, failures) {
  window.console.log(callbacks, details, failures);
  throw new Error('Process has not been implemented by this broker');
};
