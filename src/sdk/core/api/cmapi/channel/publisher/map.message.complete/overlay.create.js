/* global cmapi */

// Register a message completion builder for OVERLAY_ADD
cmapi.map.message.complete.builder[emp.intents.control.OVERLAY_ADD] = {
  build: function (oTransaction) {
    var oOverlay,
      oDetail,
      oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction),
      oOverlays = oTransaction.items,
      instanceRootId = emp.storage.getRootGuid(oTransaction.mapInstanceId),
      i,
      empParentOverlayProperties,
      empParentOverlay;

    if (oOverlays.length === 1) {
      oOverlay = oOverlays[0];
      // Check to make sure a parent id exists and that it is not equal to the map instance
      // root id
      if (oOverlay.parentId && instanceRootId && instanceRootId !== oOverlay.parentId) {
        empParentOverlay = emp.storage.get.id({id: oOverlay.parentId}).options;
        empParentOverlayProperties = emp.helpers.copyObject(empParentOverlay.properties);
      }
      oDetail = {
        name: oOverlay.name,
        overlayId: oOverlay.overlayId,
        parentId: oOverlay.parentId,
        properties: oOverlay.properties,
        description: oOverlay.description
      };
      // parentInfo added to pass relevant parent information
      // for the purposes of re-building overlay objects for the client
      if (empParentOverlay) {
        oDetail.parentInfo = {
          name: empParentOverlay.name,
          overlayId: empParentOverlay.overlayId,
          properties: empParentOverlayProperties,
          menuId: empParentOverlay.menuId,
          description: empParentOverlay.description
        };
      }
      oMsgCompletion.details = oDetail;
    } else {
      // This may be breaking CMAPI standard since overlay_add does not have a batch form
      oMsgCompletion.details = [];

      for (i = 0; i < oOverlays.length; i++) {
        oOverlay = oOverlays[i];
        // Check to make sure a parent id exists and that it is not equal to the map instance
        // root id
        if (oOverlay.parentId && instanceRootId && instanceRootId !== oOverlay.parentId) {
          empParentOverlay = emp.storage.get.id({id: oOverlay.parentId}).options;
          empParentOverlayProperties = emp.helpers.copyObject(empParentOverlay.properties);
        }
        oDetail = {
          name: oOverlay.name,
          overlayId: oOverlay.overlayId,
          parentId: oOverlay.parentId,
          properties: oOverlay.properties,
          description: oOverlay.description
        };
        // parentInfo added to pass relevant parent information
        // for the purposes of re-building overlay objects for the client
        if (empParentOverlay) {
          oDetail.parentInfo = {
            name: empParentOverlay.name,
            overlayId: empParentOverlay.overlayId,
            properties: empParentOverlayProperties,
            menuId: empParentOverlay.menuId,
            description: empParentOverlay.description
          };
        }
        oMsgCompletion.details.push(oDetail);
      }
    }

    return oMsgCompletion;
  }
};
