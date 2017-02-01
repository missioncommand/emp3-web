/* global cmapi */

// Register a message completion builder for FEATURE_REMOVE
cmapi.map.message.complete.builder[emp.intents.control.FEATURE_REMOVE] = {
  build: function (oTransaction) {
    var oFeature,
      oDetail,
      empParent,
      iIndex;

    var oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction);
    var oFeatures = oTransaction.items;
    var oDetails = {
      features: []
    };

    for (iIndex = 0; iIndex < oFeatures.length; iIndex++) {
      oFeature = oFeatures[iIndex];
      oDetail = {
        overlayId: oFeature.overlayId,
        parentId: oFeature.parentId,
        featureId: oFeature.featureId,
        name: oFeature.name,
        format: oFeature.format,
        feature: oFeature.data,
        properties: oFeature.properties,
        menuId: oFeature.menuId
      };
      // If the feature being removed is a map service populate necessary properties
      if (oFeature.url) {
        oDetail.url = oFeature.url;
        oDetail.params = oFeature.params;
        delete oDetail.feature;
        delete oDetail.properties;
        delete oDetail.menuId;
      }
      // Check for a parentId. If it exists it means the immediate parent is a feature.
      // Otherwise, it must be an overlay.
      if (oFeature.parentId) {
        // parentInfo added to pass relevant parent information
        // for the purposes of re-building overlay or feature
        // objects for the client
        empParent = emp.storage.get.id({id: oFeature.parentId}).options;
        oDetail.parentInfo = {
          featureId: empParent.featureId,
          name: empParent.name,
          format: empParent.format,
          feature: empParent.data,
          properties: emp.helpers.copyObject(empParent.properties),
          menuId: empParent.menuId
        };
      } else {
        empParent = emp.storage.get.id({id: oFeature.overlayId}).options;
        oDetail.parentInfo = {
          name: empParent.name,
          overlayId: empParent.overlayId,
          properties: emp.helpers.copyObject(empParent.properties),
          menuId: empParent.menuId,
          description: empParent.description
        };
      }
      oDetails.features.push(oDetail);
    }
    oMsgCompletion.details = oDetails;

    return oMsgCompletion;
  }
};
