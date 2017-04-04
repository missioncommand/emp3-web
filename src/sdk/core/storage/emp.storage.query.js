/* globals emp */

/**
 * Used to query for various items in the storage engine.
 * @public
 *
 * @param  {emp.typeLibrary.Transaction} oTransaction
 */
emp.storage.query = function(oTransaction) {
  var iIndex;
  var oTypes = ((oTransaction.items[0].types instanceof Array) ? oTransaction.items[0].types : [emp.typeLibrary.types.FEATURE]);
  var oFilters = oTransaction.items[0].filter || [];
  var oSearchEngine;
  var oResultSet;
  var mapInstanceId = oTransaction.mapInstanceId;

  oTransaction.items[0].filter = oFilters;
  oTransaction.items[0].types = oTypes;

  oSearchEngine = new emp.storage.searchEngine(mapInstanceId, oTransaction.items[0]);
  oResultSet = oSearchEngine.execute();

  oTypes = oTransaction.items[0].types;

  // Make sure that the type field is an array.
  for (iIndex = 0; iIndex < oTypes.length; iIndex++) {
    if (!(oTransaction.items[0][oTypes[iIndex]] instanceof Array)) {
      oTransaction.items[0][oTypes[iIndex]] = [];
    }
  }

  for (iIndex = 0; iIndex < oResultSet.length; iIndex++) {
    switch (oResultSet[iIndex].getCoreObjectType()) {
      case emp.typeLibrary.types.FEATURE:
      case emp.typeLibrary.types.OVERLAY:
        oTransaction.items[0][oResultSet[iIndex].getCoreObjectType()].push(oResultSet[iIndex].getObjectData(mapInstanceId, undefined));
        break;
      case emp.typeLibrary.types.WMS:
      case emp.typeLibrary.types.WMTS:
      case emp.typeLibrary.types.KML:
        oTransaction.items[0][emp.typeLibrary.types.FEATURE].push(oResultSet[iIndex].getObjectData(mapInstanceId, undefined));
        break;
    }
  }

  return oResultSet;
};

/**
 *
 * @param oTypes
 * @param oFilters
 * @private
 */
emp.storage._checkForRoot = function(oTypes, oFilters) {
  var bAddRootStartingPoint = true;

  // if its not an array just return.
  if ((oFilters === undefined) || (oFilters === null) && !(oFilters instanceof Array))
    return;

  // Loop thru the filters looking for Id.
  for (var iIndex = 0; iIndex < oFilters.length; iIndex++) {
    switch (oFilters[iIndex].property) {
      case 'overlayId':
      case 'parentId':
      case 'featureId':
        // We found one.
        // Set the starting point so we don't add a filter.
        bAddRootStartingPoint = false;
        break;
    }
  }
  // If we did not find a starting point add a filter with the root
  // if and only if overlay is one of the types.
  if (bAddRootStartingPoint) {
    bAddRootStartingPoint = false;
    for (iIndex = 0; iIndex < oTypes.length; iIndex++) {
      if (oTypes[iIndex] === "overlay") {
        bAddRootStartingPoint = true;
        break;
      }
    }
    if (bAddRootStartingPoint) {
      // Add the root parent
      oFilters.push({
        term: undefined,
        property: "parentId"
      });
    }
  }
};
