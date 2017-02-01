function OverlayTransactionCompleteBroker() {
}
// extend emp3.api.ResponseBroker
OverlayTransactionCompleteBroker.prototype = Object.create(emp3.api.ResponseBroker.prototype);

/**
 * @inheritDoc
 */
OverlayTransactionCompleteBroker.prototype.process = function (callbacks, details, failures) {
  try {
    callbacks.onSuccess({
      failures: failures
    });
  } catch (err) {
    console.error("onSuccess function generated an exception." + "\n  name:" + err.name + "\n  message:" + err.message + "\n  stack:" + err.stack);
  }
};

//======================================================================================================================
var channels = [
  emp3.api.enums.channel.showOverlay,
  emp3.api.enums.channel.hideOverlay,
  emp3.api.enums.channel.clearFeatures,
  emp3.api.enums.channel.centerOnOverlay,
  emp3.api.enums.channel.updateOverlay,
  emp3.api.enums.channel.overlayClusterSet,
  emp3.api.enums.channel.overlayClusterActivate,
  emp3.api.enums.channel.overlayClusterDeactivate,
  emp3.api.enums.channel.overlayClusterRemove
];

// Register with the broker factory
emp3.api.ResponseBrokerFactory.registerBroker(channels, new OverlayTransactionCompleteBroker());
