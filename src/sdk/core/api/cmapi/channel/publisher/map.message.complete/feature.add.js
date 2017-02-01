/* global cmapi */

// Register a message completion builder for FEATURE_ADD
cmapi.map.message.complete.builder[emp.intents.control.FEATURE_ADD] = {
  build: function (oTransaction) {
    var oFeature,
      oDetail,
      iIndex,
      oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction),
      oFeatures = oTransaction.items,
      empParent,
      oDetails = {
        features: []
      };

    for (iIndex = 0; iIndex < oFeatures.length; iIndex++) {
      oFeature = oFeatures[iIndex];
      switch (oTransaction.originChannel) {
        case cmapi.channel.names.MAP_FEATURE_PLOT:
        case cmapi.channel.names.MAP_FEATURE_PLOT_BATCH:
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
          break;
        case cmapi.channel.names.MAP_FEATURE_PLOT_URL:
          // If the feature being added is a map service populate necessary properties
          oDetail = {
            overlayId: oFeature.overlayId,
            parentId: oFeature.parentId,
            featureId: oFeature.featureId,
            name: oFeature.name,
            format: oFeature.format,
            url: oFeature.url,
            params: oFeature.params
          };
          break;
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
