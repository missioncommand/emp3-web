function CreateOverlayTransactionCompleteBroker() { }
CreateOverlayTransactionCompleteBroker.prototype = Object.create(emp3.api.ResponseBroker.prototype);

/**
 * @inheritDoc
 */
CreateOverlayTransactionCompleteBroker.prototype.process = function (callbacks, details, failures) {
  try {
    callbacks.onSuccess({
      overlays: callbacks.data.overlays,
      failures: failures
    });
  } catch (e) {
    console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
  }
};
//======================================================================================================================
emp3.api.ResponseBrokerFactory.registerBroker(emp3.api.enums.channel.createOverlay, new CreateOverlayTransactionCompleteBroker());
