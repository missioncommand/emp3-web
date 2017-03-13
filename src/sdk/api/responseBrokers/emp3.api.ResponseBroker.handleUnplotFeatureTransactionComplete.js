function CreateUnplotFeatureTransactionCompleteBroker() {}
CreateUnplotFeatureTransactionCompleteBroker.prototype = Object.create(emp3.api.ResponseBroker.prototype);

/**
 * @inheritDoc
 */
CreateUnplotFeatureTransactionCompleteBroker.prototype.process = function(callbacks, details, failures) {
    try {
        switch (callbacks.callInfo.method) {
            case "Map.removeMapService":
                try {
                    callbacks.onSuccess({
                        mapService: callbacks.data.features[0],
                        failures: failures
                    });
                } catch (e) {
                    console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
                }
                break;
            default:
                // raise feature added event.
                var features = [],
                    successes = details.features,
                    i;

                // send only the successful items back from the transaction.
                // This should only ever contain one item.
                for (i = 0; i < successes.length; i += 1) {
                    features.push(successes[i]);
                }

                if (callbacks.callInfo.method === "Overlay.removeFeatures" ||
                    callbacks.callInfo.method === "Feature.removeFeature" ||
                    callbacks.callInfo.method === "Feature.removeFeatures" ||
                    callbacks.callInfo.method === "Feature.clearContainer") {
                    try {
                        callbacks.onSuccess({
                            features: features,
                            failures: failures
                        });
                    } catch (e) {
                        console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
                    }
                }
                break;
        }
    } catch (e) {
        console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
    }
};
//======================================================================================================================


var channels = [
    emp3.api.enums.channel.unplotFeature,
    emp3.api.enums.channel.unplotFeatureBatch
];

// Register with the broker factory
emp3.api.ResponseBrokerFactory.registerBroker(channels, new CreateUnplotFeatureTransactionCompleteBroker());
