/**
 * @ignore
 * @class emp3.api.ResponseBroker.plotFeatureTransactionComplete
 */
function PlotFeatureTransactionCompleteBroker() {}
// Extend emp3.api.ResponseBroker
PlotFeatureTransactionCompleteBroker.prototype = Object.create(emp3.api.ResponseBroker.prototype);

/**
 * @inheritDoc
 */
PlotFeatureTransactionCompleteBroker.prototype.process = function(callbacks, details, failures) {
  var features = [],
    createdFeatures = details.features,
    i,
    hashId,
    quickHash = [];

  // send only the successful items back from the transaction.
  for (i = 0; i < createdFeatures.length; i += 1) {

    // In order for us to return an entire feature in the onSuccess callback,
    // we need to keep track of which features actually passed.  We'll keep
    // a quick hash for easy lookup.  That hash will be deleted on function complete.
    // Then we loop through our data in the messageCallbackHash.  If it isn't found
    // in our 'quickHash' we do not return it in the onSuccess.
    quickHash[createdFeatures[i].featureId] = createdFeatures[i];
  }

  // call onSuccessCallback.  We need to decide which of the features were successful in returning.
  // Check the 'quickHash' for each feature.
  for (i = 0; i < callbacks.data.features.length; i += 1) {
    hashId = callbacks.data.features[i].geoId;

    if (quickHash[hashId]) {
      // If we want to sent what the map sent us replace the following lines.
      //features.push(quickHash[hashId]);
      features.push(callbacks.data.features[i]);
    }
  }

  if (typeof callbacks.onSuccess === 'function') {

    // Feature.update uses same channel as Overlay.addFeatures, but has
    // different onSuccess callback signature.
    if (callbacks.callInfo.method === 'Feature.update' ||
      callbacks.callInfo.method === 'Feature.setGeometry' ||
      callbacks.callInfo.method === 'Feature.setProperties' ||
      callbacks.callInfo.method === 'Feature.updateProperties') {

      try {
        callbacks.onSuccess({
          feature: features[0],
          failures: failures
        });
      } catch (e) {
        console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
      }
    } else {
      try {
        callbacks.onSuccess({
          features: features,
          failures: failures
        });
      } catch (e) {
        console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
      }
    }
  }
};

//======================================================================================================================
var channels = [
  emp3.api.enums.channel.plotFeature,
  emp3.api.enums.channel.plotFeatureBatch
];

// Register with the broker factory
emp3.api.ResponseBrokerFactory.registerBroker(channels, new PlotFeatureTransactionCompleteBroker());
