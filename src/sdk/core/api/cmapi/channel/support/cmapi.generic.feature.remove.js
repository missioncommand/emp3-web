cmapi.channel.support.genericFeatureRemove = function(oTransaction) {
  var oItem;
  var oFeature;
  var itemInStorage;
  var oaItems = oTransaction.items;
  var mapServiceItems = [];
  var featureItems = [];


  for (var iIndex = 0; iIndex < oaItems.length; iIndex++) {
    oItem = oaItems[iIndex];

    itemInStorage = emp.storage.findFeature(oItem.overlayId, oItem.featureId);

    if (itemInStorage === undefined) {
      // The object is not in storage.
      // Pass it as a feature and let the engine fail it.
      oFeature = new emp.typeLibrary.Feature({
        overlayId: oItem.overlayId,
        parentId: oItem.parentId,
        featureId: oItem.featureId
      });
      featureItems.push(oFeature);
    }
    else {
      switch (itemInStorage.getCoreObjectType()) {
        case emp.typeLibrary.types.WMS:
          // A WMS service does not have a parentId.
          oFeature = new emp.typeLibrary.WMS({
            overlayId: oItem.overlayId,
            id: oItem.featureId
          });
          mapServiceItems.push(oFeature);
          break;
        case emp.typeLibrary.types.WMTS:
          // A WMS service does not have a parentId.
          oFeature = new emp.typeLibrary.WMTS({
            overlayId: oItem.overlayId,
            id: oItem.featureId
          });
          mapServiceItems.push(oFeature);
          break;
        case emp.typeLibrary.types.KML:
          // A WMS service does not have a parentId.
          oFeature = new emp.typeLibrary.KmlLayer({
            overlayId: oItem.overlayId,
            id: oItem.featureId
          });
          mapServiceItems.push(oFeature);
          break;
        case emp.typeLibrary.types.FEATURE:
        default:
          oFeature = new emp.typeLibrary.Feature({
            overlayId: oItem.overlayId,
            parentId: oItem.parentId,
            featureId: oItem.featureId
          });
          featureItems.push(oFeature);
          break;
      }
    }
  }

  if (featureItems.length > 0) {
    var featureTransaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.FEATURE_REMOVE,
      mapInstanceId: oTransaction.mapInstanceId,
      transactionId: oTransaction.transactionId,
      sender: oTransaction.sender,
      originChannel: oTransaction.originChannel,
      source: oTransaction.source,
      originalMessage: oTransaction.originalMessage,
      messageOriginator: oTransaction.messageOriginator,
      originalMessageType: oTransaction.originalMessageType,
      items: featureItems
    });

    setTimeout(function() {
      featureTransaction.run();
    }, 0);
  }

  if (mapServiceItems.length > 0) {
    var mapServiceTransaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.MAP_SERVICE_REMOVE,
      mapInstanceId: oTransaction.mapInstanceId,
      transactionId: oTransaction.transactionId,
      sender: oTransaction.sender,
      originChannel: oTransaction.originChannel,
      source: oTransaction.source,
      originalMessage: oTransaction.originalMessage,
      messageOriginator: oTransaction.messageOriginator,
      originalMessageType: oTransaction.originalMessageType,
      items: mapServiceItems
    });
    setTimeout(function() {
      mapServiceTransaction.run();
    }, 0);
  }
};
