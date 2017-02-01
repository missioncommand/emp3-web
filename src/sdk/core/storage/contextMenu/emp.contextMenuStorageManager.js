emp.contextMenuStorageManager = (function () {
  var oContextMenuStorage = {
    globalMenus: {},
//        mapInstanceMenus: {}
    mapInstanceMenus: undefined
  };

  var getMapMenuStorage = function () {
    return oContextMenuStorage.mapInstanceMenus; //[mapInstanceId];
  };

  var getMenuListfn = function (mapInstanceId, eType) {
    var mapMenuStorage;
    var oMenuCollection = undefined;

    switch (eType) {
      case emp.typeLibrary.Menu.Type.MAP_GLOBAL:
        mapMenuStorage = getMapMenuStorage(mapInstanceId);
        if (mapMenuStorage) {
          oMenuCollection = mapMenuStorage.mapMenus;
        }
        break;
      case emp.typeLibrary.Menu.Type.OVERLAY_GLOBAL:
        mapMenuStorage = getMapMenuStorage(mapInstanceId);
        if (mapMenuStorage) {
          oMenuCollection = mapMenuStorage.mapOverlayMenus;
        }
        break;
      case emp.typeLibrary.Menu.Type.FEATURE_GLOBAL:
        mapMenuStorage = getMapMenuStorage(mapInstanceId);
        if (mapMenuStorage) {
          oMenuCollection = mapMenuStorage.mapFeatureMenus;
        }
        break;
      case emp.typeLibrary.Menu.Type.OBJECT_INSTANCE:
      case emp.typeLibrary.Menu.Type.SUBMENU:
        oMenuCollection = oContextMenuStorage.globalMenus;
        break;
    }

    return oMenuCollection;
  };

  var publicInterface = {
    newMapInstance: function () {
      /*
       if (!oContextMenuStorage.mapInstanceMenus.hasOwnProperty(mapInstanceId))
       {
       oContextMenuStorage.mapInstanceMenus[mapInstanceId] = {
       mapMenus: {},
       mapFeatureMenus: {},
       mapOverlayMenus: {}
       };
       }
       return oContextMenuStorage.mapInstanceMenus[mapInstanceId];
       */
      if (oContextMenuStorage.mapInstanceMenus === undefined) {
        oContextMenuStorage.mapInstanceMenus = {
          mapMenus: {},
          mapFeatureMenus: {},
          mapOverlayMenus: {}
        };
      }
      return oContextMenuStorage.mapInstanceMenus;
    },
    removeMapInstance: function () {
      /*
       if (oContextMenuStorage.mapInstanceMenus.hasOwnProperty(mapInstanceId))
       {
       delete oContextMenuStorage.mapInstanceMenus[mapInstanceId];
       }
       */
    },
    add: function (oTransaction) {
      var iItemIndex;
      var oItem;
      var oItems = oTransaction.items;
      var oMenuCollection = {};
      var mapInstanceId = oTransaction.mapInstanceId;

      if (oTransaction.items && oTransaction.originChannel === "map.menu.create") {
        for (iItemIndex = 0; iItemIndex < oItems.length;) {
          oItem = oItems[iItemIndex];
          oMenuCollection = getMenuListfn(mapInstanceId, oItem.menuType);

          if (!oMenuCollection) {
            // We must fail the creation.
            oTransaction.fail([{
              coreId: oItem.coreId,
              level: emp.typeLibrary.Error.level.MAJOR,
              message: "Invalid menu type."
            }]);
          }
          else {
            // Check to see if the menu already exist in the collection.
            if (oMenuCollection[oItem.menuId]) {
              // We must fail the creation.
              oTransaction.fail([{
                coreId: oItem.coreId,
                level: emp.typeLibrary.Error.level.MAJOR,
                message: "A menu with the same ID already exists."
              }]);
            } else {
              // create new store, which will also create our items...
              oMenuCollection[oItem.menuId] = new emp.ui.menu.context.model.menu(oItem);
              iItemIndex++;
            }
          }
        }
      }
    },
    remove: function (oTransaction) {
      var oItem;
      var iIndex;
      var sMenuId;
      var oMapInstanceMenus;
      var oItems = oTransaction.items;
      var mapInstanceId = oTransaction.mapInstanceId;

      if (oTransaction.items && oTransaction.originChannel === "map.menu.remove") {
        for (iIndex = 0; iIndex < oItems.length;) {
          oItem = oItems[iIndex];
          sMenuId = oItem.menuId;

          if (oContextMenuStorage.globalMenus.hasOwnProperty(sMenuId)) {
            delete oContextMenuStorage.globalMenus[sMenuId];
            iIndex++;
          }
          else {
            oMapInstanceMenus = getMapMenuStorage(mapInstanceId);

            if (oMapInstanceMenus) {
              if (oMapInstanceMenus.mapMenus.hasOwnProperty(sMenuId)) {
                delete oMapInstanceMenus.mapMenus[sMenuId];
                iIndex++;
              } else if (oMapInstanceMenus.mapOverlayMenus.hasOwnProperty(sMenuId)) {
                delete oMapInstanceMenus.mapOverlayMenus[sMenuId];
                iIndex++;
              } else if (oMapInstanceMenus.mapFeatureMenus.hasOwnProperty(sMenuId)) {
                delete oMapInstanceMenus.mapFeatureMenus[sMenuId];
                iIndex++;
              }
              else {
                oTransaction.fail([{
                  coreId: oItem.coreId,
                  level: emp.typeLibrary.Error.level.MAJOR,
                  message: "Menu not found in map instance."
                }]);
              }
            }
            else {
              oTransaction.fail([{
                coreId: oItem.coreId,
                level: emp.typeLibrary.Error.level.MAJOR,
                message: "Map instance not found, menu not deleted."
              }]);
            }
          }
        }
      }
    },
    active: function (oTransaction) {
      var iIndex;
      var iMenuItemIndex;
      var oItem;
      var sMenuItemId;
      var aMenuItems;
      var bVisibility = false;
      var oItems = oTransaction.items;
      var oMapInstanceMenus;
      var mapInstanceId = oTransaction.mapInstanceId;

      var findMenuItem = function (oMenuCollection, sMenuItemId) {
        var iIndex;
        var aMenuIdList;
        var oMenu;

        // We need to find the menu Item in the collection of menus.
        if (!emp.helpers.associativeArray.isEmpty(oMenuCollection)) {
          aMenuIdList = emp.helpers.associativeArray.getKeys(oMenuCollection);

          for (iIndex = 0; iIndex < aMenuIdList.length; iIndex++) {
            oMenu = oMenuCollection[aMenuIdList[iIndex]];

            if (oMenu.items.hasOwnProperty(sMenuItemId)) {
              // We found an instance of the menu item. Place it on the list.
              aMenuItems.push(oMenu.items[sMenuItemId]);
            }
          }
        }
      };

      oMapInstanceMenus = getMapMenuStorage(mapInstanceId);

      for (iIndex = 0; iIndex < oItems.length;) {
        aMenuItems = [];
        oItem = oItems[iIndex];
        sMenuItemId = oItem.menuItemId;
        bVisibility = oItem.visible;

        // Find all the menu items with the same Id.
        findMenuItem(oContextMenuStorage.globalMenus, sMenuItemId);
        findMenuItem(oMapInstanceMenus.mapMenus, sMenuItemId);
        findMenuItem(oMapInstanceMenus.mapOverlayMenus, sMenuItemId);
        findMenuItem(oMapInstanceMenus.mapFeatureMenus, sMenuItemId);

        if (aMenuItems.length === 0) {
          oTransaction.fail([{
            coreId: oItem.coreId,
            level: emp.typeLibrary.Error.level.MAJOR,
            message: "Menu item not found."
          }]);
        }
        else {
          // We found at least 1.
          // Set the visibility of all of them.
          for (iMenuItemIndex = 0; iMenuItemIndex < aMenuItems.length; iMenuItemIndex++) {
            aMenuItems[iMenuItemIndex].visible = bVisibility;
          }
          iIndex++;
        }
      }
    },
    getFeatureMenuIdList: function (mapInstanceId, oFeature) {
      var rObject = {
        feature: [],
        overlay: [],
        parent: []
      };

      if (!emp.helpers.isEmptyString(oFeature.getMenuId())) {
        rObject.feature.push(oFeature.getMenuId());
      }
      return rObject;
    },
    getMenuList: function (mapInstanceId, eType) {
      return getMenuListfn(mapInstanceId, eType);
    }
  };

  return publicInterface;
}());
