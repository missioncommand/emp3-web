/*globals emp, jQuery */



emp.api.core._featureHash = [];
emp.api.core._overlayHash = [];
emp.api.core.scaleMultiplier = 10.5;


emp.api.core.transactionQueue = (function() {
  var oWaitTimer;
  var iWaittime = 5000;
  var tranQueue = [];
  var oOutstandingTransaction = null;

  function transactionWaitTimeout() {
    if (oOutstandingTransaction) {
      // We have waited for the transaction to complete.
      emp.typeLibrary.Error({
        level: emp.typeLibrary.Error.level.MINOR,
        message: "V1 " + oOutstandingTransaction.intent + " transaction with " +
          (oOutstandingTransaction.items.length + oOutstandingTransaction.failures.length) +
          " items timed out (" + (iWaittime / 1000) + " sec). V1 queue released."
      });
      oOutstandingTransaction = null;
    }
  }

  function runQueue() {
    if ((tranQueue.length > 0) &&
      (oOutstandingTransaction === null)) {
      // get the oldest item in the queue
      var transaction = tranQueue.shift();

      switch (transaction.intent) {
        case emp.intents.control.DRAW_BEGIN:
          // draws just let thru.
          break;
        case emp.intents.control.EDIT_BEGIN:
          // edit just let thru.
          // But we need to get the original feature.
          transaction.items[0].originFeature = emp.storage.get.id({
            id: transaction.items[0].coreId
          });
          break;
        default:
          oOutstandingTransaction = transaction;
          // Start the wait timer.
          oWaitTimer = setTimeout(transactionWaitTimeout, iWaittime);
          break;
      }
      // queue the transaction in the main transaction Q.
      emp.transactionQueue.add(transaction);
    }
    // repeat with break in between code execution to avoid locking thread
    // with back to back calls in a loop
    setTimeout(runQueue, 50);
  }

  var publicInterface = {
    add: function(transaction) {
      tranQueue.push(transaction);
    },
    transCompleteHandler: function(oTransaction) {
      if (oOutstandingTransaction) {
        if (oTransaction.transactionId === oOutstandingTransaction.transactionId) {
          clearTimeout(oWaitTimer);
          oOutstandingTransaction = null;
        }
      }
    }
  };

  runQueue();
  return publicInterface;
}());


/**
 * Listen to adds, updates, deletes and update our featureHash.  This handles
 * events from publisher for things like map removes which the core-api would
 * not receive.
 * @param  {transaction} args The transaction that occurred.
 */
emp.api.core.updateHash = function(args) {
  var i,
    id;

  // Make sure we have a transaction.
  if (args) {
    // Make sure there are items in the transaction
    if (args.items && args.items.length > 0) {
      // Loop through the transaction and depending on what the transaction is
      // update the hash table appropriately
      for (i = 0; i < args.items.length; i += 1) {

        // If it's a feature remove transaction, just call removeFeature to update
        // the hash tables.
        if (args.intent === emp.intents.control.FEATURE_REMOVE) {
          // translate the id to remove any special characters that were added in.
          id = emp.api.core.recurseStrFixOutbound(args.items[i].featureId);
          emp.api.core.removeFeature(id);
          // if it's a overly remove transaction call the removeOverlay to update the
          // overlay hash table.
        } else if (args.intent === emp.intents.control.OVERLAY_REMOVE) {
          // translate the id to remove any special characters that were added in.
          id = emp.api.core.recurseStrFixOutbound(args.items[i].overlayId);
          emp.api.core.removeOverlay(id);
        }

      }
    }
  }

};

/**
 * Checks to see if the item is a known feature.
 * @param  {string}  id The id of the feature you are checking
 * @return {Boolean}    true if the id belongs to feature, false if it is an overlay.
 */

emp.api.core.isFeature = function(id) {
  if (emp.api.core._featureHash[id]) {
    return true;
  } else {
    return false;
  }
};

/**
 * Checks to see if the item is a known overlay
 * @param  {string}  id The id of the overlay being checked.
 * @return {Boolean}    true if the id is an overlay, false if it is not.
 */

emp.api.core.isOverlay = function(id) {
  if (emp.api.core._overlayHash[id]) {
    return true;
  } else {
    return false;
  }
};

/**
 * Retrieves the overlayId that a feature belongs to.
 *
 * @param  {string} id The id of the feature being inquired
 * @return {string}    The overlay id that the feature is on.
 */

emp.api.core.getOverlayId = function(id) {
  if (emp.api.core._featureHash[id]) {
    return emp.api.core._featureHash[id].overlayId;
  } else {
    return undefined;
  }
};

emp.api.core.removeFeature = function(id) {
  if (emp.api.core._featureHash[id]) {
    delete emp.api.core._featureHash[id];
  }

};

emp.api.core.removeOverlay = function(id) {

  var i;

  if (emp.api.core._overlayHash[id]) {
    for (i = 0; i < emp.api.core._overlayHash[id].length; i += 1) {
      emp.api.core.removeFeature(emp.api.core._overlayHash[id][i]);
    }
    delete emp.api.core._overlayHash[id];
  }
};

emp.api.core.addOverlay = function(id) {
  if (!emp.api.core._overlayHash[id]) {
    emp.api.core._overlayHash[id] = [];
  }
};

/**
 * Checks to see if an id is an overlay or a feature
 * and then appopriately adds the information to the typeLibraryArguments
 * and the hash tables.
 * @param {object} typeLibraryArgs
 * @param {string} overlayId
 */
emp.api.core.addParent = function(typeLibraryArgs, overlayId) {

  // First find out if it is a feature by looking it up
  // in our feature hash.  If it is there, then it is a feature.
  if (emp.api.core.isFeature(overlayId)) {
    typeLibraryArgs.parentId = overlayId;
    typeLibraryArgs.overlayId = emp.api.core.getOverlayId(overlayId);
    emp.api.core._featureHash[typeLibraryArgs.featureId] = {
      overlayId: typeLibraryArgs.overlayId,
      parentId: typeLibraryArgs.parentId
    };


    // If it's not a feature it is an overlay or the overlay doesn't exist.
    // Either way set the overlayId. Then if it's not in the overlay hash, add it in.
  } else {
    typeLibraryArgs.overlayId = overlayId;
    emp.api.core._featureHash[typeLibraryArgs.featureId] = {
      overlayId: typeLibraryArgs.overlayId
    };

    // if the overlay does not already exist, add it to the _overlayHash, as it will
    // be created by the map.  If it already exists, add the children ids to the overlay.
    if (!emp.api.core.isOverlay(overlayId)) {
      emp.api.core._overlayHash[overlayId] = [typeLibraryArgs.featureId];
    } else {
      emp.api.core._overlayHash[overlayId].push(typeLibraryArgs.featureId);
    }
  }
};

emp.api.core.translateToFeature = function(sender, oArgs) {
  /*
      oArgs = {
          overlayId: args[1],
          parentId: args[2],
          name: args[0],
          properties: {
              readOnly: readOnly,
              description: args[4],
              iconUrl: args[5]
          }
   */
  /*
      var sPayload = "";
      
          sPayload = '"' + oArgs.name + '",';
          sPayload += '"' + oArgs.overlayId + '",';
          sPayload += '"sourceId",';
          sPayload += '"' + oArgs.parentId + '",';
          sPayload += '0.0,';
          sPayload += '0.0,';
          sPayload += '0.0,';
          sPayload += '"' + escape("") + '",';
          sPayload += '"img/empty.png",';
          sPayload += '"clampToGround"';
          var modifiersObject = {};
          modifiersObject.modifiers = {xOffset: "0", yOffset: "0"};
          var modString = JSON.stringify(modifiersObject);
          modString = escape(modString);
          sPayload += ',"' + modString + '"';

          emp.api.core.addPoint(sender, sPayload);
  */
  var payloads = [];
  var sKML = "";

  sKML += '<Folder id="' + oArgs.overlayId + '">';
  sKML += '<name>' + oArgs.name + '</name>';
  sKML += '<Placemark></Placemark></Folder>';

  var typeLibraryArgs = {
    name: oArgs.name,
    featureId: oArgs.overlayId,
    format: 'kml',
    feature: sKML,
    v1type: emp.api.core.DataType.POINT
  };

  typeLibraryArgs.properties = {};
  typeLibraryArgs.properties.readOnly = true;
  typeLibraryArgs.properties.description = "";
  typeLibraryArgs.properties.altitudeMode = "clampToGround";
  typeLibraryArgs.properties.modifiers = {};

  payloads.push(typeLibraryArgs);

  emp.api.core.addParent(typeLibraryArgs, oArgs.parentId);
  emp.api.core.recurseStrFixInbound(payloads);
  emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_ADD, payloads);
};

emp.api.core.addEffort = function(sender, payload) {
  var typeLibraryArgs,
    args,
    readOnly,
    payloads = [];
  // Split string into values and remove double qoutes
  args = emp.api.core.splitArgs(payload);
  // Decode any uri encoded strings for json transmission
  emp.api.core.decodeParameters(args);

  // args[3] is the editable flag.
  // readonly is the opposite of of editable, reverse if set.
  // otherwise set it to true.
  if (args[3] === 'true') {
    readOnly = false;
  } else {
    readOnly = true;
  }

  typeLibraryArgs = {
    overlayId: args[1],
    parentId: args[2],
    name: args[0],
    properties: {
      readOnly: readOnly,
      description: args[4],
      iconUrl: args[5]
    }
  };

  if (typeLibraryArgs.parentId && emp.api.core.isFeature(typeLibraryArgs.parentId)) {
    emp.api.core.translateToFeature(sender, typeLibraryArgs);
  } else {
    emp.api.core.addOverlay(typeLibraryArgs.overlayId);

    payloads.push(typeLibraryArgs);
    emp.api.core.recurseStrFixInbound(payloads);

    emp.api.core.createTransaction(sender.id, "Overlay", emp.intents.control.OVERLAY_ADD, payloads);
  }
};

emp.api.core.translateToRemoveGraphic = function(sender, oArgs) {
  var sPayload = "";

  sPayload += '"' + oArgs.overlayId + '",';
  sPayload += '"unused",';
  sPayload += '"' + emp.api.core._featureHash[oArgs.overlayId].parentId + '",';

  emp.api.core.removeGraphic(sender, sPayload);
};

emp.api.core.removeEffort = function(sender, payload) {

  var args,
    typeLibraryArgs,
    payloads = [];

  payload = payload.replace(/\"/g, '');
  args = payload.split(',');
  emp.api.core.decodeParameters(args);

  typeLibraryArgs = {
    overlayId: args[0]
  };

  if (typeLibraryArgs.overlayId && emp.api.core.isFeature(typeLibraryArgs.overlayId)) {
    emp.api.core.translateToRemoveGraphic(sender, typeLibraryArgs);
  } else {
    emp.api.core.removeOverlay(typeLibraryArgs.overlayId);

    payloads.push(typeLibraryArgs);
    emp.api.core.recurseStrFixInbound(payloads);

    emp.api.core.createTransaction(sender.id, "Overlay", emp.intents.control.OVERLAY_REMOVE, payloads);
  }
};

emp.api.core.addPoint = function(sender, payload) {
  var args,
    modifiers,
    kml,
    typeLibraryArgs,
    payloads = [];


  // CoreAPI -
  // addPoint: function (name, id, sourceId, overlayId, lat, lon, altitude, description, iconURL, altitudeMode, modifiers)                    
  payload = payload.replace(/\"/g, '');
  args = payload.split(',');
  emp.api.core.decodeParameters(args);
  modifiers = {};

  // Modifiers may not come over in message
  if (args.length === 11) {
    modifiers = JSON.parse(args[10]).modifiers;
    if (modifiers.hasOwnProperty('xOffset')) {
      if (typeof modifiers.xOffset === 'string') {
        modifiers.xOffset = parseInt(modifiers.xOffset);
      }
    }
    if (modifiers.hasOwnProperty('yOffset')) {
      if (typeof modifiers.yOffset === 'string') {
        modifiers.yOffset = parseInt(modifiers.yOffset);
      }
    }
  }

  kml = emp.api.core.getPointKml({
    name: args[0],
    lat: args[4],
    lon: args[5],
    iconUrl: args[8],
    modifiers: modifiers
  });

  typeLibraryArgs = {
    name: args[0],
    featureId: args[1],
    format: 'kml',
    feature: kml,
    v1type: emp.api.core.DataType.POINT
  };

  // If any of these properties are defined add the properties field.
  if (typeof args[7] !== 'undefined' || typeof args[8] !== 'undefined' || typeof args[9] !== 'undefined' ||
    typeof args[10] !== 'undefined') {

    typeLibraryArgs.properties = {};

    // check to see if a description is present
    if (typeof args[7] !== 'undefined') {
      typeLibraryArgs.properties.description = args[7];
    }

    if (typeof args[8] !== 'undefined') {
      typeLibraryArgs.properties.iconUrl = args[8];
    }

    if (typeof args[9] !== 'undefined') {
      typeLibraryArgs.properties.altitudeMode = args[9];
    }

    if (typeof args[10] !== 'undefined') {
      emp.api.core.addCoreModifiersToProperties(modifiers, typeLibraryArgs.properties);
    }

  }

  payloads.push(typeLibraryArgs);

  emp.api.core.addParent(typeLibraryArgs, args[3]);
  emp.api.core.recurseStrFixInbound(payloads);
  emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_ADD, payloads);
};

emp.api.core.addPointBatch = function(sender, payload) {
  // CoreAPI -
  // addPointBatch: function (batch) 
  // 
  // batch:
  // {
  //      name:"Helicopter 1", 
  //      id:"e8403351-8478-41cb-994e-0c98ba1e896b", 
  //      sourceId:"fakeId", 
  //      overlayId:"overlay id from addOverlay", 
  //      lat:37.6543, 
  //      lon:44.5876, 
  //      altitude:1000, 
  //      description: "emp.api.core is a great description!",
  //      url: "http://cdn1.iconfinder.com/data/icons/mapicons/icons/helicopter.png", 
  //      altitudeMode:CoreMapAPI.ALTITUDE_RELATIVE_TO_GROUND, 
  //      visibility:true, 
  //      modifiers:null
  //  }

  var batch,
    i,
    typeLibraryArgs,
    payloads = [];

  payload = emp.api.core.formatJSON(payload);
  batch = JSON.parse(payload);

  for (i = 0; i < batch.length; i += 1) {
    typeLibraryArgs = {};

    if (batch[i].name) {
      typeLibraryArgs.name = batch[i].name;
    }

    if (batch[i].id) {
      typeLibraryArgs.featureId = batch[i].id;
    }


    typeLibraryArgs.format = 'kml';
    typeLibraryArgs.v1type = emp.api.core.DataType.POINT;

    typeLibraryArgs.feature = emp.api.core.getPointKml({
      name: batch[i].name,
      lat: batch[i].lat,
      lon: batch[i].lon,
      altitude: batch[i].altitude,
      iconUrl: batch[i].url
    });


    if (batch[i].description || batch[i].url || batch[i].altitudeMode) {
      typeLibraryArgs.properties = {};

      if (batch[i].description) {
        typeLibraryArgs.properties.description = batch[i].description;
      }

      if (batch[i].url) {
        typeLibraryArgs.properties.iconUrl = batch[i].url;
      }

      if (batch[i].altitudeMode) {
        typeLibraryArgs.properties.altitudeMode = batch[i].altitudeMode;
      }

      if (batch[i].modifiers) {
        emp.api.core.addCoreModifiersToProperties(batch[i].modifiers, typeLibraryArgs.properties);
      }

      if (batch[i].overlayId) {
        emp.api.core.addParent(typeLibraryArgs, batch[i].overlayId);
        payloads.push(typeLibraryArgs);
      }
    }
  }

  if (payloads.length > 0) {
    emp.api.core.recurseStrFixInbound(payloads);
    emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_ADD, payloads);
  }

};

emp.api.core.addMilStdPoint = function(sender, payload) {
  // addMilStdPoint: function (name, id, sourceId, overlayId, symbolCode, lat, lon, altitude, description, altitudeMode, modifiers)

  var args,
    modifiers,
    typeLibraryArgs,
    payloads = [];


  payload = payload.replace(/\"/g, '');
  args = payload.split(',');
  emp.api.core.decodeParameters(args);

  modifiers = null;
  // Modifiers may not come over in message
  if (args.length === 11) {
    modifiers = args[10];
  }

  typeLibraryArgs = emp.api.core.createMilStdPointParams({
    id: args[1],
    name: args[0],
    symbolCode: args[4],
    lat: args[5],
    lon: args[6],
    altitude: args[7],
    description: args[8],
    altitudeMode: args[9],
    modifiers: modifiers
  });

  if (armyc2.c2sd.renderer.utilities.SymbolDefTable.isMultiPoint(typeLibraryArgs.data.symbolCode, 0)) {
    typeLibraryArgs.v1type = emp.api.core.DataType.MIL_STD_MULTI_POINT;
  } else {
    typeLibraryArgs.v1type = emp.api.core.DataType.MIL_STD_SYMBOL;
  }

  payloads.push(typeLibraryArgs);

  // map the featureId to an overlayId so we can retrieve it later for
  // setVisibility
  emp.api.core.addParent(typeLibraryArgs, args[3]);
  emp.api.core.recurseStrFixInbound(payloads);
  emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_ADD, payloads);


};

emp.api.core.addMilStdPointBatch = function(sender, payload) {

  var typeLibraryArgs,
    batch,
    i,
    payloads = [];

  payload = emp.api.core.formatJSON(payload);
  batch = JSON.parse(payload);

  for (i = 0; i < batch.length; i += 1) {

    typeLibraryArgs = emp.api.core.createMilStdPointParams({
      id: batch[i].id,
      name: decodeURIComponent(batch[i].name),
      symbolCode: batch[i].symbolCode,
      description: decodeURIComponent(batch[i].description),
      lat: batch[i].lat,
      lon: batch[i].lon,
      altitude: batch[i].altitude,
      altitudeMode: batch[i].altitudeMode,
      modifiers: decodeURIComponent(batch[i].modifiers)
    });

    if (armyc2.c2sd.renderer.utilities.SymbolDefTable.isMultiPoint(typeLibraryArgs.data.symbolCode, 0)) {
      typeLibraryArgs.v1type = emp.api.core.DataType.MIL_STD_MULTI_POINT;
    } else {
      typeLibraryArgs.v1type = emp.api.core.DataType.MIL_STD_SYMBOL;
    }

    if (batch[i].overlayId) {
      emp.api.core.addParent(typeLibraryArgs, batch[i].overlayId);
      payloads.push(typeLibraryArgs);
    }
  }

  if (payloads.length > 0) {
    emp.api.core.recurseStrFixInbound(payloads);
    emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_ADD, payloads);
  }
};

emp.api.core.addMilStdSymbol = function(sender, payload) {

  var args,
    args2,
    typeLibraryArgs,
    payloads = [];

  args = payload.split('\",\"');


  if (args.length === 7) {
    args2 = args[6].split(',');

    // if (args2[2] === 'false') {
    //   visible = false;
    // }

  } else {
    args2 = args[7].split(',');
    args2.splice(0, 0, args[6]);
    // visible = true;
    // if (args2[2] === 'false') {
    //   visible = false;
    // }
  }

  emp.api.core.decodeParameters(args);
  emp.api.core.decodeParameters(args2);

  // args2 [0] = description
  // args2 [1] = modifiers
  // args2 [2] = visibility
  // args2 [3] = altitudeMode
  // addMilStdMultiPoint: function (name, id, sourceId, overlayId, symbolCode, coordinates, description, modifiers, visibility, altitudeMode) {

  typeLibraryArgs = emp.api.core.createMilStdMultiPointParams({
    name: args[0].replace(/\"/g, ''),
    id: args[1],
    symbolCode: args[4],
    coordinates: args[5],
    description: args2[0],
    modifiers: ((args2[1] === "null") ? null : args2[1]),
    altitudeMode: args2[3]
  });

  if (armyc2.c2sd.renderer.utilities.SymbolDefTable.isMultiPoint(typeLibraryArgs.data.symbolCode, 0)) {
    typeLibraryArgs.v1type = emp.api.core.DataType.MIL_STD_MULTI_POINT;
  } else {
    typeLibraryArgs.v1type = emp.api.core.DataType.MIL_STD_SYMBOL;
  }

  emp.api.core.addParent(typeLibraryArgs, args[3]);
  payloads.push(typeLibraryArgs);
  emp.api.core.recurseStrFixInbound(payloads);
  emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_ADD, payloads);

};

emp.api.core.addMilStdMultiPointBatch = function(sender, payload) {
  var batch,
    i,
    typeLibraryArgs,
    payloads = [],
    len;

  payload = emp.api.core.formatJSON(payload);
  batch = JSON.parse(payload);
  len = batch.length;
  for (i = 0; i < len; i += 1) {

    typeLibraryArgs = emp.api.core.createMilStdMultiPointParams({
      id: batch[i].id,
      name: decodeURIComponent(batch[i].name),
      symbolCode: batch[i].symbolCode,
      description: decodeURIComponent(batch[i].description),
      coordinates: batch[i].coordinates,
      altitudeMode: batch[i].altitudeMode,
      modifiers: decodeURIComponent(batch[i].modifiers)
    });

    if (armyc2.c2sd.renderer.utilities.SymbolDefTable.isMultiPoint(typeLibraryArgs.data.symbolCode, 0)) {
      typeLibraryArgs.v1type = emp.api.core.DataType.MIL_STD_MULTI_POINT;
    } else {
      typeLibraryArgs.v1type = emp.api.core.DataType.MIL_STD_SYMBOL;
    }

    if (batch[i].overlayId) {
      emp.api.core.addParent(typeLibraryArgs, batch[i].overlayId);
    }
    payloads.push(typeLibraryArgs);
  }

  if (payloads.length > 0) {
    emp.api.core.recurseStrFixInbound(payloads);
    emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_ADD, payloads);
  }
};

emp.api.core.add3DShape = function(sender, payload) {
  var args,
    overlayId,
    altitudeMode,
    attributes,
    typeLibraryArgs,
    payloads = [];

  // CoreAPI
  // add3DShape: function (name, id, sourceId, overlayId, shapeType, description, altitudeMode, coordinates, color, attributes)

  args = payload.split('\",\"');
  emp.api.core.decodeParameters(args);

  attributes = args[9];
  while (attributes[attributes.length - 1] === '"') {
    attributes = attributes.substr(0, attributes.length - 1);
  }
  attributes = JSON.parse(attributes);

  altitudeMode = args[6].replace(/\"/g, '');
  if (altitudeMode === '') {
    altitudeMode = emp.typeLibrary.featureAltitudeModeType.RELATIVE_TO_GROUND;
  }

  for (var iIndex = 0; iIndex < attributes.attributes.length; iIndex++) {
    if (attributes.attributes[iIndex].altitudeMode === undefined) {
      attributes.attributes[iIndex].altitudeMode = altitudeMode;
    }
  }

  overlayId = args[3].replace(/\"/g, '');
  if ((overlayId === undefined) || (overlayId === null)) {
    overlayId = args[2].replace(/\"/g, '');
  }

  typeLibraryArgs = emp.api.core.createMilStdMultiPointParams({
    name: args[0].replace(/\"/g, ''),
    id: args[1].replace(/\"/g, ''),
    format: 'airspace',
    symbolCode: args[4].replace(/\"/g, ''),
    coordinates: args[7].replace(/\"/g, ''),
    properties: {
      lineColor: args[8].replace(/\"/g, ''),
      fillColor: args[8].replace(/\"/g, ''),
      attributes: attributes.attributes
    },
    v1type: emp.api.core.DataType.AIRSPACE
  });

  emp.api.core.addParent(typeLibraryArgs, overlayId);
  payloads.push(typeLibraryArgs);
  emp.api.core.recurseStrFixInbound(payloads);
  emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_ADD, payloads);
};

emp.api.core.addLine = function(sender, payload) {
  // addLine: function (name, id, sourceId, overlayId, coordinates, description, lineColor, lineThickness, altitudeMode, extrude, modifiers) {
  var args,
    args2,
    extrude,
    kml,
    typeLibraryArgs,
    payloads = [];

  payload = emp.api.core.formatJSON(payload);
  args = payload.split('\",\"');
  args2 = args[6].split(',');
  emp.api.core.decodeParameters(args);
  emp.api.core.decodeParameters(args2);

  extrude = false;
  if (args2[2] === 'true') {
    extrude = true;
  }

  kml = emp.api.core.getLineKml({
    name: args[0],
    coordinates: args[4],
    extrude: extrude
  });

  typeLibraryArgs = {
    name: args[0].replace(/\"/g, ''),
    featureId: args[1],
    format: 'kml',
    feature: kml,
    properties: {
      lineColor: args2[0],
      lineWidth: parseInt(args2[1]),
      altitudeMode: args2[2]
    },
    v1type: emp.api.core.DataType.LINE
  };

  payloads.push(typeLibraryArgs);

  emp.api.core.addParent(typeLibraryArgs, args[3]);
  emp.api.core.recurseStrFixInbound(payloads);
  emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_ADD, payloads);
};

emp.api.core.addPolygon = function(sender, payload) {
  var args,
    args2,
    extrude,
    kml,
    typeLibraryArgs,
    payloads = [];

  // CoreAPI - 
  //addPolygon: function (name, id, sourceId, overlayId, coordinates, description, fillColor, lineColor, lineThickness, altitudeMode, extrude, modifiers) 

  args = payload.split('\",\"');
  args2 = args[7].split(',');

  emp.api.core.decodeParameters(args);
  emp.api.core.decodeParameters(args2);

  extrude = false;
  if (args2[3] === 'true') {
    extrude = true;
  }

  kml = emp.api.core.getPolygonKml({
    name: args[0],
    coordinates: args[4],
    extrude: extrude
  });

  typeLibraryArgs = {
    name: args[0].replace(/\"/g, ''),
    featureId: args[1],
    format: 'kml',
    feature: kml,
    properties: {
      description: args[5],
      fillColor: args[6],
      lineColor: args2[0],
      lineWidth: parseInt(args2[1]),
      altitudeMode: args2[2]
    },
    v1type: emp.api.core.DataType.POLYGON
  };

  payloads.push(typeLibraryArgs);

  emp.api.core.addParent(typeLibraryArgs, args[3]);
  emp.api.core.recurseStrFixInbound(payloads);
  emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_ADD, payloads);
};

emp.api.core.addKmlStringToOverlay = function(sender, payload) {
  var args,
    typeLibraryArgs,
    payloads = [];

  payload = payload.replace(/\"/g, '');
  args = payload.split(',');

  // addKmlStringToOverlay: function (kmlString, name, id, overlayId, referenceLat, referenceLon, iconUrl)
  // 
  // we won't need args 4 and 5, they are lat/lon and were used to locate the kml,
  // that is no longer done, as the data explorer locates the item now.
  // we also won't need args[6] was iconUrl which is not currently supported by data explorer.
  typeLibraryArgs = {
    name: args[1],
    featureId: args[2],
    format: 'kml',
    feature: decodeURIComponent(args[0]),
    v1type: emp.api.core.DataType.UNKNOWN
  };


  payloads.push(typeLibraryArgs);

  emp.api.core.addParent(typeLibraryArgs, args[3]);
  emp.api.core.recurseStrFixInbound(payloads);
  emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_ADD, payloads);

};

emp.api.core.setVisibilityBatch = function(sender, payload) {
  var batch,
    i,
    typeLibraryArgs,
    payloads = [],
    payloads2 = [],
    overlayId;

  // We need to drop the first and last ' character.
  payload = payload.substr(1);
  payload = payload.substr(0, payload.length - 1);
  payload = unescape(payload);

  // setVisibilityBatch: function (batch)
  // [{id:graphicIdHere,visibility:true},{id:anotherGraphicIdHere,visibility:false}]
  //payload = payload.replace(/\"/g, '');
  batch = JSON.parse(payload);

  // loop through batch and seperate payloads into hide or show.
  for (i = 0; i < batch.length; i += 1) {

    // Check to make sure we can get an overlay that
    // is associated with emp.api.core id.  emp.api.core is one of the rare functions
    // that requires only a feature id.
    overlayId = emp.api.core.getOverlayId(batch[i].id);


    // If it does have an overlayId, we then need to check
    // to see if it has a parentId as well (that means the item is a feature
    // and that feature Id needs to be included)
    if (overlayId) {
      typeLibraryArgs = {
        featureId: batch[i].id
      };

      if (emp.api.core._featureHash[batch[i].id].parentId) {
        typeLibraryArgs.parentId = emp.api.core._featureHash[batch[i].id].parentId;
      }

      if (batch[i].visibility) {
        payloads.push(typeLibraryArgs);
      } else {
        payloads2.push(typeLibraryArgs);
      }
    }
  }

  // if there is any shows send the show message, if there are any hides send the
  // hide message.  There may be the case where both can be sent.
  if (payloads.length > 0) {
    emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.VISIBILITY_SET, payloads);
  }

  if (payloads2.length > 0) {
    emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.VISIBILITY_SET, payloads);
  }
};

emp.api.core.removeGraphic = function(sender, payload) {
  var args,
    typeLibraryArgs,
    payloads = [];

  // removeGraphic: function (id, sourceId, overlayId)
  payload = payload.replace(/\"/g, '');
  args = payload.split(',');
  emp.api.core.decodeParameters(args);

  typeLibraryArgs = {
    featureId: args[0]
  };

  if (emp.api.core._featureHash[args[2]]) {
    typeLibraryArgs.overlayId = emp.api.core._featureHash[args[2]].overlayId;
    typeLibraryArgs.parentId = args[2];
  } else {
    typeLibraryArgs.overlayId = args[2];
  }

  payloads.push(typeLibraryArgs);
  emp.api.core.recurseStrFixInbound(payloads);
  emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_REMOVE, payloads);
};

emp.api.core.removeGraphicBatch = function(sender, payload) {
  var typeLibraryArgs,
    i,
    payloads = [],
    batch;

  // removeGraphicBatch: function (graphicInfos) 
  // [{id:12345,sourceId:4t56ew,overlayId:4hgjks8sjr85j}]

  // We need to drop the first and last " character.
  payload = payload.substr(1);
  payload = payload.substr(0, payload.length - 1);
  payload = unescape(payload);
  //payload = emp.api.core.formatJSON(payload);
  batch = JSON.parse(payload);

  for (i = 0; i < batch.graphics.length; i += 1) {

    // determine if overlayId is a feature or an overlay.
    typeLibraryArgs = {
      featureId: batch.graphics[i].id
    };

    if (emp.api.core._featureHash[batch.graphics[i].overlayId]) {
      typeLibraryArgs.overlayId = emp.api.core._featureHash[batch.graphics[i].overlayId].overlayId;
      typeLibraryArgs.parentId = batch.graphics[i].overlayId;
    } else {
      typeLibraryArgs.overlayId = batch.graphics[i].overlayId;
    }

    payloads.push(typeLibraryArgs);
  }
  emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_REMOVE, payloads);
};

emp.api.core.removeWMS = function(sender, payload) {
  var typeLibraryArgs,
    payloads = [];


  payload = payload.replace(/\"/g, '');

  typeLibraryArgs = {
    overlayId: emp.wms.manager.getWmsOverlayId(),
    id: payload,
    coreId: payload
  };

  //emp.api.core.addParent(typeLibraryArgs, emp.wms.manager.getWmsOverlayId());
  payloads.push(typeLibraryArgs);
  emp.api.core.createTransaction(sender.id, "WMS", emp.intents.control.WMS_REMOVE, payloads);
};

emp.api.core.removeUrl = function(sender, payload) {
  var typeLibraryArgs,
    payloads = [];


  payload = payload.replace(/\"/g, '');

  typeLibraryArgs = {
    coreId: payload,
    overlayId: emp.api.core.getOverlayId(payload),
    featureId: payload
  };

  //emp.api.core.addParent(typeLibraryArgs, emp.api.core.getOverlayId(payload));
  payloads.push(typeLibraryArgs);
  emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.WMS_REMOVE, payloads);
};

emp.api.core.addKml = function(sender, payload) {
  var args,
    typeLibraryArgs,
    payloads = [],
    mapInstance = emp.instanceManager.getInstance(sender.id);
  // addKml: function (url, name)

  payload = payload.replace(/\"/g, '');
  args = payload.split(',');

  typeLibraryArgs = {
    coreId: args[0],
    featureId: args[0],
    name: args[1],
    url: args[0],
    format: 'kml',
    v1type: emp.api.core.DataType.UNKNOWN
  };

  emp.api.core.addParent(typeLibraryArgs, mapInstance.engines.getDefaultLayerOverlayID());
  payloads.push(typeLibraryArgs);
  emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_ADD, payloads);
};

emp.api.core.addImageOverlay = function(sender, payload) {
  var args,
    typeLibraryArgs,
    payloads = [];

  //addImageOverlay: function (url, left, bottom, right, top) 
  payload = payload.replace(/\"/g, '');
  args = payload.split(',');

  typeLibraryArgs = {
    featureId: args[0],
    name: 'Image',
    format: 'image',
    url: args[0],
    params: {
      left: args[1],
      bottom: args[2],
      right: args[3],
      top: args[4]
    },
    v1type: emp.api.core.DataType.UNKNOWN
  };

  emp.api.core.addParent(typeLibraryArgs, emp.wms.manager.getWmsOverlayId());
  payloads.push(typeLibraryArgs);
  emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_ADD, payloads);
};

emp.api.core.addKmlFromString = function(sender, payload) {

  var args,
    typeLibraryArgs,
    payloads = [];

  // addKmlFromString: function (kmlString, name, id)
  payload = payload.replace(/\"/g, '');
  args = payload.split(',');

  typeLibraryArgs = {
    featureId: args[2],
    name: args[1],
    feature: args[0],
    format: 'kml',
    v1type: emp.api.core.DataType.UNKNOWN
  };

  payloads.push(typeLibraryArgs);
  emp.api.core.createTransaction(sender.id, "Feature", emp.intents.control.FEATURE_ADD, payloads);
};

var iWMSCount = 1;
emp.api.core.addWms = function(sender, payload) {
  // addWms: function (url)
  var typeLibraryArgs,
    payloads = [];

  payload = payload.replace(/\"/g, '');

  typeLibraryArgs = {
    id: payload,
    coreId: payload,
    name: 'V1 WMS Service ' + iWMSCount,
    url: payload,
    format: 'wms',
    v1type: emp.api.core.DataType.UNKNOWN
  };

  iWMSCount++;

  emp.api.core.addParent(typeLibraryArgs, emp.wms.manager.getWmsOverlayId());
  payloads.push(typeLibraryArgs);
  emp.api.core.createTransaction(sender.id, "WMS", emp.intents.control.WMS_ADD, payloads);
};

emp.api.core.editFeature = function(sender, payload) {
  // editGraphic: function (editCompleteCallback, id, sourceId, overlayId)
  var args,
    typeLibraryArgs,
    payloads = [];

  payload = payload.replace(/\"/g, '');
  args = payload.split(',');
  emp.api.core.decodeParameters(args);

  typeLibraryArgs = {
    featureId: args[0]
  };

  if (emp.api.core._featureHash[args[2]]) {
    typeLibraryArgs.overlayId = emp.api.core._featureHash[args[2]].overlayId;
    typeLibraryArgs.parentId = args[2];
  } else {
    typeLibraryArgs.overlayId = args[2];
  }

  payloads.push(typeLibraryArgs);

  emp.api.core.recurseStrFixInbound(payloads);

  emp.api.core.createTransaction(sender.id, "Edit", emp.intents.control.EDIT_BEGIN, payloads);
};

emp.api.core.gotoLocation = function(sender, payload) {
  var args,
    typeLibraryArgs,
    payloads = [];

  // goToLocationWithRange: function (lat, lon, range)
  // 
  payload = payload.replace(/\"/g, '');
  args = payload.split(',');

  typeLibraryArgs = {
    location: {
      lat: parseFloat(args[0]),
      lon: parseFloat(args[1])
    }
  };

  if (args[2]) {
    typeLibraryArgs.zoom = parseFloat(args[2]);
  }

  payloads.push(typeLibraryArgs);
  emp.api.core.createTransaction(sender.id, "View", emp.intents.control.VIEW_SET, payloads);
};

emp.api.core.goToLocationWithScale = function(sender, payload) {
  var args,
    typeLibraryArgs,
    payloads = [];
  // goToLocationWithScale: function (lat, lon, scale)
  payload = payload.replace(/\"/g, '');
  args = payload.split(',');

  typeLibraryArgs = {
    location: {
      lat: parseFloat(args[0]),
      lon: parseFloat(args[1])
    }
  };

  if (args[2]) {
    typeLibraryArgs.zoom = parseFloat(args[2]) * emp.api.core.scaleMultiplier;
  }

  payloads.push(typeLibraryArgs);
  emp.api.core.createTransaction(sender.id, "View", emp.intents.control.VIEW_SET, payloads);
};

emp.api.core.setScale = function(sender, payload) {
  var typeLibraryArgs,
    payloads = [];

  payload = payload.replace(/\"/g, '');

  typeLibraryArgs = {
    range: parseFloat(payload) * emp.api.core.scaleMultiplier
  };

  payloads.push(typeLibraryArgs);
  emp.api.core.createTransaction(sender.id, "View", emp.intents.control.VIEW_SET, payloads);
};

emp.api.core.setView = function(sender, payload) {
  var typeLibraryArgs,
    payloads = [];

  // setView: function (view)
  // view = {
  //      latitude,
  //      longitude
  //      altitude,
  //      altitudeMode,
  //      heading,
  //      tilt
  // }
  payload = JSON.parse(payload);

  typeLibraryArgs = {
    location: {
      lat: payload.latitude,
      lon: payload.longitude
    },
    range: payload.altitude,
    tilt: payload.tilt,
    heading: payload.heading
  };

  // to do: set altitudeMode, heading, and tilt
  payloads.push(typeLibraryArgs);

  emp.api.core.createTransaction(sender.id, "View", emp.intents.control.VIEW_SET, payloads);
};

emp.api.core.goToLocationById = function(sender, payload) {
  var typeLibraryArgs,
    payloads = [];

  // goToLocationById: function (id)
  payload = payload.replace(/\"/g, '');

  typeLibraryArgs = {
    featureId: payload,
    overlayId: emp.api.core.getOverlayId(payload)
  };

  payloads.push(typeLibraryArgs);
  emp.api.core.recurseStrFixInbound(payloads);
  emp.api.core.createTransaction(sender.id, "View", emp.intents.control.VIEW_SET, payloads);
};

emp.api.core.drawPolygon = function(sender, payload) {
  var payloads = [],
    args,
    typeLibraryArgs;

  payload = payload.replace(/\"/g, '');
  args = payload.split(',');

  typeLibraryArgs = {
    name: args[0],
    featureId: args[1],
    v1type: emp.api.core.DataType.POLYGON,
    type: 'polygon'
  };

  emp.api.core.addParent(typeLibraryArgs, args[3]);
  payloads.push(typeLibraryArgs);
  emp.api.core.recurseStrFixInbound(payloads);
  emp.api.core.createTransaction(sender.id, "Draw", emp.intents.control.DRAW_BEGIN, payloads);
};

emp.api.core.drawLine = function(sender, payload) {
  var args,
    typeLibraryArgs,
    payloads = [];

  payload = payload.replace(/\"/g, '');
  args = payload.split(',');

  typeLibraryArgs = {
    name: args[0],
    featureId: args[1],
    v1type: emp.api.core.DataType.LINE,
    type: 'line'
  };

  emp.api.core.addParent(typeLibraryArgs, args[3]);
  payloads.push(typeLibraryArgs);
  emp.api.core.recurseStrFixInbound(payloads);
  emp.api.core.createTransaction(sender.id, "Draw", emp.intents.control.DRAW_BEGIN, payloads);
};

emp.api.core.drawMil2525Symbol = function(sender, payload) {
  var args,
    sType = emp.api.core.DataType.UNKNOWN,
    typeLibraryArgs,
    payloads = [];

  // drawMilStdMultipoint: function (drawCompleteCallback, name, id, sourceId, overlayId, symbolCode, modifiers, autoPopulate) {
  payload = payload.replace(/\"/g, '');
  args = payload.split(',');
  // var autoPopulate = false;
  // if (args.length === 7 && args[6] === 'true') {
  //   autoPopulate = true;
  // }

  if (emp.helpers.isAirspaceSymbol(args[4])) {
    sType = emp.api.core.DataType.AIRSPACE;
  } else if (armyc2.c2sd.renderer.utilities.SymbolDefTable.isMultiPoint(args[4], 0)) {
    sType = emp.api.core.DataType.MIL_STD_MULTI_POINT;
  } else {
    sType = emp.api.core.DataType.MIL_STD_SYMBOL;
  }


  typeLibraryArgs = {
    name: args[0],
    featureId: args[1],
    symbolCode: args[4],
    v1type: sType,
    type: 'milstd'
  };

  emp.api.core.addParent(typeLibraryArgs, args[3]);

  // Check to see if modifiers were added in.  If so, modify the modifiers
  // so they can be sent over.
  if (args[5]) {
    typeLibraryArgs.properties = {};
    typeLibraryArgs.properties.modifiers = emp.api.core.createModifiers(args[5]);
  }

  payloads.push(typeLibraryArgs);
  emp.api.core.recurseStrFixInbound(payloads);
  emp.api.core.createTransaction(sender.id, "Draw", emp.intents.control.DRAW_BEGIN, payloads);
};

/**
 * Formats a JSON string to have quotes around all property names, and replaces nulls
 * and undefines with empty strings.
 *
 * @param  {string} input A string that represents a JSON object.
 * @return {string}       The formated string.
 */

emp.api.core.formatJSON = function(input) {
  // Add double qoutes around property names
  var exp = /\,\s*([a-zA-Z0-9]*)\s*\:/g;
  // Add Double qoutes around first property name
  var exp2 = /\{\s*([a-zA-Z0-9]*)\s*\:/g;
  // check for null and undefined properties and add double qoutes
  var exp3 = /\:\s*(undefined|null)\s*\,/g;


  input = input.replace(exp, function(match, capture) {
    return ', "' + capture + '" : ';
  });
  input = input.replace(exp2, function(match, capture) {
    return '{ "' + capture + '" : ';
  });
  input = input.replace(exp3, function(match, capture) {
    return ': "' + capture + '" ,';
  });
  return input;
};

/**
 * Takes a coreMapAPI symbology modifiers object and returns
 * a CMW-A modifiers object.
 * @param  {object} oldModifiers The coreMapAPI modifiers object
 * @return {object} a new CMW-A modifiers object.
 */

emp.api.core.createModifiers = function(oldModifiers) {
  var modifiers = {};
  if (oldModifiers !== undefined && oldModifiers !== null) {

    while (oldModifiers[oldModifiers.length - 1] === '"') {
      oldModifiers = oldModifiers.substr(0, oldModifiers.length - 1);
    }

    //console.log("Modifier: " + oldModifiers);
    oldModifiers = JSON.parse(oldModifiers);

    if (oldModifiers) {
      modifiers = oldModifiers.modifiers;
    } else {
      modifiers = undefined;
    }


  } else {
    modifiers = undefined;
  }

  return modifiers;
};

/**
 * Takes in an array of parameters and runs decodeURIComponent
 * on each of the items if it is a string.  Returns the decoded
 * array.
 *
 * @param  {array} array An array of items.
 * @return {array} The array with any strings that were encoded decoded
 */

emp.api.core.decodeParameters = function(array) {
  var i;

  for (i = 0; i < array.length; i++) {
    if (jQuery.type(array[i] === 'string')) {
      array[i] = decodeURIComponent(array[i]);

      // remove any extra quotes.
      //array[i] = array[i].replace(/\"/g, '');

      // just in case an 'undefined' got in there, convert
      // that back into a real undefined.
      if (array[i] === 'undefined' || array[i] === '\"undefined\"') {
        array[i] = undefined;
      }
    }

  }
};

emp.api.core.strFix = function(args) {
  var sPattern1 = /\./g;

  if (sPattern1.test(args)) {
    args = 'FIX_DONE' + args.replace(sPattern1, '-A_PERIOD-');
  }
  return args;
};

emp.api.core.strDeFix = function(args) {
  var sPattern1 = /^FIX\x5FDONE/;
  var sPattern2 = /\x2DA\x5FPERIOD\x2D/g;

  if (sPattern1.test(args)) {
    args = args.replace(sPattern1, '');

    if (sPattern2.test(args)) {
      args = args.replace(sPattern2, '.');
    }
  }

  return args;
};

/**
 * Due to CMAPI inconsistances we are going to vary painfully scan
 * every payload in and out to make sure all Id's are fixed and unfixed.
 *
 */

emp.api.core.recurseStrFixInbound = function(args) {
  /*
      // inbound - cmapi-payload... 
      var e;
      //all payloads are arrays... might as well as start there...
      if (typeof (args) === 'array') {
          //cycle array
          for (e = 0; e < args.length; e = e + 1) {
              // is args[e] an object
              if (typeof (args[e]) === 'object') {
                  // now we are getting some where... 
                  for (var i in args[e]) {
                      //check to make sure it's a string not another array or object
                      if (typeof (args[e][i]) === 'string') {

                          if (i === 'overlayId' || i === 'featureId' || i === 'parentId') {
                              args[e][i] = emp.api.core.strFix(args[e][i]);
                          }

                      } else if (typeof (args[i]) === 'array' || typeof (args[e][i]) === 'object') {
                          // le sigh...
                          args[e][i] = emp.api.core.recurseStrFixInbound(args[e][i]);
                      }
                  }
              } else if (typeof (args[e]) === 'array') {
                  // what has the world come too... 
                  args[e] = emp.api.core.recurseStrFixInbound(args);
              }
          }

      } else if (typeof (args) === 'object') {

          for (e in args) {

              if (typeof (args[e]) === 'string') {

                  if (e === 'overlayId' || e === 'featureId' || e === 'parentId') {
                      args[e] = emp.api.core.strFix(args[e]);
                  }
                  if (e === 'property' && args[e] === 'overlayId') {
                      args.term = emp.api.core.strFix(args.term);
                  } else if (e === 'property' && args[e] === 'featureId') {
                      args.term = emp.api.core.strFix(args.term);
                  } else if (e === 'property' && args[e] === 'parentId') {
                      args.term = emp.api.core.strFix(args.term);
                  }

              } else if (typeof (args[e]) === 'object' || typeof (args[e] === 'array')) {

                  args[e] = emp.api.core.recurseStrFixInbound(args[e]);
              }
          }

      } else {
          // strings or numbers...
          return args;
      }
  */
  return args;
};

emp.api.core.recurseStrFixOutbound = function(args) {
  /*
      var e;
      //all payloads are arrays... might as well as start there...
      if (typeof (args) === 'array') {
          //cycle array
          for (e = 0; e < args.length; e = e + 1) {
              // is args[e] an object
              if (typeof (args[e]) === 'object') {
                  // now we are getting some where... 
                  for (var i in args[e]) {
                      //check to make sure it's a string not another array or object
                      if (typeof (args[e][i]) === 'string') {

                          if (i === 'overlayId' || i === 'featureId' || i === 'parentId') {
                              args[e][i] = emp.api.core.strDeFix(args[e][i]);
                          }

                      } else if (typeof (args[i]) === 'array' || typeof (args[e][i]) === 'object') {
                          // le sigh...
                          args[e][i] = emp.api.core.recurseStrFixOutbound(args[e][i]);
                      }
                  }
              } else if (typeof (args[e]) === 'array') {
                  // what has the world come too... 
                  args[e] = emp.api.core.recurseStrFixOutbound(args);
              }
          }

      } else if (typeof (args) === 'object') {

          for (e in args) {

              if (typeof (args[e]) === 'string') {

                  if (e === 'overlayId' || e === 'featureId' || e === 'parentId') {
                      args[e] = emp.api.core.strDeFix(args[e]);
                  }

              } else if (typeof (args[e]) === 'object' || typeof (args[e] === 'array')) {

                  args[e] = emp.api.core.recurseStrFixOutbound(args[e]);
              }
          }

      } else if (typeof (args) === 'string') {
          args = emp.api.core.strDeFix(args);
      }
  */
  return args;
};



/**
 * Takes modifiers from coreMapAPI and populates the properties
 * object of the Type Library.
 *
 * @param {object} oldModifiers A coreMapAPI modifiers object
 * @param {object} properties A EMP TypeLibrary properties object.
 * @return {object} The new properties object.  emp.api.core function also modifies the original
 * properties object.
 */

emp.api.core.addCoreModifiersToProperties = function(oldModifiers, properties) {

  //xOffset, yOffset, xUnits, and yUnits
  if (oldModifiers.xOffset !== undefined) {
    properties.xOffset = oldModifiers.xOffset;
  }

  if (oldModifiers.yOffset !== undefined) {
    properties.yOffset = oldModifiers.yOffset;
  }

  if (oldModifiers.xUnits) {
    properties.xUnits = oldModifiers.xUnits;
  }

  if (oldModifiers.yUnits) {
    properties.yUnits = oldModifiers.yUnits;
  }

  return properties;

};

emp.api.core.createMilStdPointParams = function(args) {
  var modifiers,
    typeLibraryArgs = {
      name: args.name,
      featureId: args.id,
      data: {
        type: "Point",
        coordinates: [args.lon, args.lat],
        symbolCode: args.symbolCode
      },
      format: 'milstd',
      type: emp.api.core.DataType.MIL_STD_SYMBOL
    };

  // if there is an altitude, add it on to the end of the coordinates.
  if (args.altitude) {
    typeLibraryArgs.data.coordinates.push(args.altitude);
  }

  if (args.modifiers || args.description) {

    typeLibraryArgs.properties = {};

    // If there are modifiers, abstract them, unescape and parse them.
    if (args.modifiers) {

      modifiers = emp.api.core.createModifiers(args.modifiers);

      if (modifiers) {
        typeLibraryArgs.properties.modifiers = modifiers;
      }

      if (modifiers.fillColor) {
        var sColor = modifiers.fillColor.substr(2);
        typeLibraryArgs.properties.fillColor = sColor;
        sColor = modifiers.fillColor.substr(0, 2);
        typeLibraryArgs.properties.fillOpacity = parseInt("0x" + sColor) / 255;
      }
    }

    if (args.description) {
      typeLibraryArgs.properties.description = args.description;
    }

  }

  return typeLibraryArgs;

};

emp.api.core.createMilStdMultiPointParams = function(args) {
  var coordinates = [],
    coordinatesStringArray,
    coordinateComponents,
    coordinate,
    typeLibraryArgs = {
      name: args.name,
      featureId: args.id,
      overlayId: args.overlayId,
      data: {
        symbolCode: args.symbolCode
      },
      format: args.format || 'milstd',
      properties: args.properties || {},
      type: emp.api.core.DataType.MIL_STD_MULTI_POINT
    };

  if (args.description || args.modifiers) {

    if (args.description) {
      typeLibraryArgs.properties.description = args.description;
    }

    // If there are modifiers, abstract them, unescape and parse them.
    if (args.modifiers) {
      typeLibraryArgs.properties.modifiers = emp.api.core.createModifiers(args.modifiers);
    }
  }

  // Create the geojson string used for the mil-std symbol.
  if (args.coordinates) {

    // Separate the coordinates into individual coordinates
    coordinatesStringArray = args.coordinates.split(' ');

    // loop through each coordinate to create an array of arrays.  emp.api.core is the
    // standard format for linestring in geojson.
    for (var iIndex = 0; iIndex < coordinatesStringArray.length; iIndex++) {
      coordinateComponents = coordinatesStringArray[iIndex].split(',');

      if (coordinateComponents.length >= 2) {
        coordinate = new Array();

        // add the lon and lat components.
        coordinate.push(parseFloat(coordinateComponents[0]));
        coordinate.push(parseFloat(coordinateComponents[1]));

        // if there is an altitude component add it.
        if (coordinateComponents >= 3) {
          coordinate.push(parseFloat(coordinateComponents[2]));
        }

        coordinates.push(coordinate);
      }
    }

    if (coordinates.length === 1) {
      typeLibraryArgs.data.coordinates = coordinate;
      typeLibraryArgs.data.type = "Point";
    } else {
      typeLibraryArgs.data.coordinates = coordinates;
      typeLibraryArgs.data.type = "LineString";
    }
  }
  return typeLibraryArgs;
};

/**
 * Create a KML Point.
 *
 * @param {string} args.name            The name given to the kml
 * @param  {number} args.latitude       The latitude of the point
 * @param  {number} args.longitude      The longitude of the point
 * @param {number} args.altitude        The altitude of the point
 * @param {string} args.iconUrl      The icon that should show for this point
 *
 * @return {string}                The kml that makes up emp.api.core object.
 */

emp.api.core.getPointKml = function(args) {
  var hotSpotX = 32,
    hotSpotY = 1,
    xUnits = 'pixels',
    yUnits = 'pixels',
    iconUrl = 'http://maps.google.com/mapfiles/kml/paddle/wht-blank.png',
    kmlString;

  if (args.hasOwnProperty('modifiers')) {
    if (args.modifiers.hasOwnProperty('xOffset')) {
      hotSpotX = args.modifiers.xOffset;
    }
    if (args.modifiers.hasOwnProperty('yOffset')) {
      hotSpotY = args.modifiers.yOffset;
    }
  }

  kmlString = '<Placemark>' +
    '<name>' + args.name + '</name>' +
    '<Style>' + '<IconStyle>' +
    '<Icon>';

  if (args.iconUrl) {
    kmlString += '<href>' + args.iconUrl + '</href>';
  } else {
    kmlString += '<href>' + iconUrl + '</href>';
  }

  kmlString += '</Icon>';

  kmlString += '<hotSpot x="' + hotSpotX + '" y="' + hotSpotY + '" xunits="' + xUnits + '" yunits="' + yUnits + '"/>';

  kmlString += '</IconStyle>' +
    '</Style>' +
    '<Point>' +
    '<coordinates>' + args.lon + ',' + args.lat;

  if (args.altitude !== undefined) {
    kmlString += ',' + args.altitude;
  }

  kmlString += '</coordinates>' +
    '</Point>' +
    '</Placemark>';

  return kmlString;
};

/**
 * Create a KML LineString.
 *
 * @param {object} args Contains the parameter for emp.api.core function
 * @param {string} args.name            The name given to the kml
 * @param  {number} args.coordinate     A KML formated coordinate string.
 *
 * @return {string}                The kml that makes up emp.api.core object.
 */

emp.api.core.getLineKml = function(args) {
  var kmlString;

  kmlString = '<Placemark>' +
    '<name>' + args.name + '</name>' +
    '<LineString>' +
    '<coordinates>' + args.coordinates + '</coordinates>' +
    '</LineString>' +
    '</Placemark>';

  return kmlString;
};

/**
 * Create a KML Polygon
 * @param  {object} args Contains the parameters for emp.api.core function
 * @return {string} The kml that makes up emp.api.core object.
 */

emp.api.core.getPolygonKml = function(args) {

  var kmlString,
    firstCoordinate;

  firstCoordinate = args.coordinates.substr(0, args.coordinates.indexOf(' '));

  kmlString = '<Placemark>' +
    '<name>' + args.name + '</name>' +

    '<Polygon>' +
    '<outerBoundaryIs>' +
    '<LinearRing>' +
    '<coordinates>' + args.coordinates + ' ' + firstCoordinate + '</coordinates>' +
    '</LinearRing>' +
    '</outerBoundaryIs>' +
    '</Polygon>' +
    '</Placemark>';

  return kmlString;
};


emp.api.core.handleMessage = function(sender, msg) {
  var functionName,
    payload;

  functionName = msg.substring(0, msg.indexOf('('));
  payload = msg.substring(msg.indexOf('(') + 1, msg.lastIndexOf(')'));
  sender = JSON.parse(sender);


  emp.api.core._callbackHash[functionName](sender, payload);

};

emp.api.core.splitArgs = function(payload) {
  var args = payload.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g),
    len = args.length,
    i;

  for (i = 0; i < len; i++) {
    args[i] = args[i].replace(/\"/g, "");
  }
  return args;
};

/**
 * Creates a transaction for each request to the core library.  Core library
 * only comes in through one channel, so there was no way to identify based
 * on the channel what type to convert to.   Instead, we convert each payload
 * into a cmw-a payload, and submit it to the cmw-a fixture to generate the
 * correct object from the type library.  emp.api.core will then send to the queue
 * @param  {string} channel  The channel name that would be used for an
 * equivalent cmw-a request.
 * @param  {string} senderId The id of the widget that sent the request.
 * @param  {array} payloads An array of payload objects that correspond to the
 * correct format of the channel
 */
emp.api.core.createTransaction = function(senderId, sGlobalType, sIntent, payloads) {
  var transaction,
    i,
    oItems = [],
    oItem,
    sTransID = emp.helpers.id.newGUID();


  for (i = 0; i < payloads.length; i += 1) {
    //payloads[i].transactionId = sTransID;
    //payloads[i].sender = senderId;

    payloads[i].intent = sIntent;
    //payloads[i].source = emp.api.core.SOURCE;
    oItem = new emp.typeLibrary[sGlobalType](payloads[i]);

    switch (sIntent) {
      case emp.intents.control.DRAW_BEGIN:
      case emp.intents.control.FEATURE_ADD:
        oItem.v1Type = payloads[i].v1type;
        break;
    }
    oItems.push(oItem);
  }

  transaction = new emp.typeLibrary.Transaction({
    intent: sIntent,
    transactionId: sTransID,
    sender: senderId,
    source: emp.api.core.SOURCE,
    items: oItems
  });

  emp.api.core.transactionQueue.add(transaction);
};

emp.api.core._callbackHash = {
  addMilStdPointBatch: emp.api.core.addMilStdPointBatch,
  addMilStdPoint: emp.api.core.addMilStdPoint,
  addMilStdMultiPointBatch: emp.api.core.addMilStdMultiPointBatch,
  addMilStdSymbol: emp.api.core.addMilStdSymbol,
  addEffort: emp.api.core.addEffort,
  removeEffort: emp.api.core.removeEffort,
  addKmlStringToOverlay: emp.api.core.addKmlStringToOverlay,
  addPoint: emp.api.core.addPoint,
  addPointBatch: emp.api.core.addPointBatch,
  addLine: emp.api.core.addLine,
  add3DShape: emp.api.core.add3DShape,
  addPolygon: emp.api.core.addPolygon,
  addImageOverlay: emp.api.core.addImageOverlay,
  removeImageOverlay: emp.api.core.removeUrl,
  removeKml: emp.api.core.removeUrl,
  removeWms: emp.api.core.removeWMS,
  goToLocationWithRange: emp.api.core.gotoLocation,
  goToLocation: emp.api.core.gotoLocation,
  goToLocationWithScale: emp.api.core.goToLocationWithScale,
  setScale: emp.api.core.setScale,
  addKml: emp.api.core.addKml,
  addKmlFromString: emp.api.core.addKmlFromString,
  addWms: emp.api.core.addWms,
  setVisibilityBatch: emp.api.core.setVisibilityBatch,
  goToLocationById: emp.api.core.goToLocationById,
  editFeature: emp.api.core.editFeature,
  drawPolygon: emp.api.core.drawPolygon,
  drawLine: emp.api.core.drawLine,
  drawMil2525Symbol: emp.api.core.drawMil2525Symbol,
  removeGraphicBatch: emp.api.core.removeGraphicBatch,
  removeGraphic: emp.api.core.removeGraphic,
  setView: emp.api.core.setView
};
