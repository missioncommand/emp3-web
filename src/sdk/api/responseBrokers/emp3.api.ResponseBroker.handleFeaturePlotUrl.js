function HandleFeaturePlotUrlBroker() { }
HandleFeaturePlotUrlBroker.prototype = Object.create(emp3.api.ResponseBroker.prototype);

/**
 * @inheritDoc
 */
HandleFeaturePlotUrlBroker.prototype.process = function (callbacks, details, failures) {
  var mapService = callbacks.data.mapService;

  try {
    callbacks.onSuccess({
      mapService: mapService,
      failures: failures
    });
  } catch (e) {
    console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
  }
};
//======================================================================================================================
emp3.api.ResponseBrokerFactory.registerBroker(emp3.api.enums.channel.plotUrl, new HandleFeaturePlotUrlBroker());
