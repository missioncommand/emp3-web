emp.editors = emp.editors || {};

/**
 * Controls the vertices on the map during an edit or draw and the animation
 * of those graphics.
 *
 * @param {Object} args All parmaters are members of the args object.
 * @param {string} args.feature The feature of the item we are editing.
 * @param {string} args.mapInstanceId The id of the mapInstance to which the
 * editing is occurring.
 */
emp.editors.EditorBase = function(args) {

  // A linked list of the control points.  These are the existing points that
  // control the vertices of the symbol and control adding points to the symbol.
  this.vertices = new emp.editors.Vertices();

  // make a copy of feature as we do not want to change the feature passed in.
  this.featureCopy = emp.helpers.copyObject(args.feature);

  // Retrieve the mapInstance used for this feature.
  this.mapInstance = args.mapInstance;

};


/**
 * Adds the control points to the map for an edit or a draw.
 */
emp.editors.EditorBase.prototype.addControlPoints = function() {


};

emp.editors.EditorBase.prototype.removeControlPoints = function() {
  // do nothing
  var transaction;
  var items;
  var vertices = this.vertices.getFeatures();
  items = vertices;

  transaction = new emp.typeLibrary.Transaction({
    intent: emp.intents.control.CMAPI_GENERIC_FEATURE_REMOVE,
    mapInstanceId: this.mapInstance.mapInstanceId,
    transactionId: null,
    sender: this.mapInstance.mapInstanceId,
    originChannel: cmapi.channel.names.MAP_FEATURE_UNPLOT,
    source: emp.api.cmapi.SOURCE,
    messageOriginator: this.mapInstance.mapInstanceId,
    originalMessageType: cmapi.channel.names.MAP_FEATURE_UNPLOT,
    items: items
  });

  this.vertices.clear();

  // Hide the control points
  transaction.run();
};

/**
 * Determine if the featureId is a controlPoint or if it is a feature.
 * This is useful for determining if a featureDrag event should be staticContent
 * out or not.
 */
emp.editors.EditorBase.prototype.isControlPoint = function(featureId) {
  var result = false;

  if (this.vertices.find(featureId)) {
    result = true;
  }

  return result;
};

/**
 * Return true if the featureId passed in is the feature that is
 * being edited.
 */
emp.editors.EditorBase.prototype.isFeature = function(featureId) {
  var result = false;

  if (this.featureCopy.featureId === featureId) {
    result = true;
  }

  return result;
};

/**
 * Moves control point passed in to the new location provided.
 * Also updates the control point and the feature with the change.
 */
emp.editors.EditorBase.prototype.moveControlPoint = function(featureId, pointer) {
  var index,
    newCoordinates,
    coordinateUpdate,
    updateData;

  // for the base implementation, just move the control point.

  // Grab the actual feature associated with this control point featureId.
  var newFeature = this.vertices.findFeature(featureId);
  newFeature.data.coordinates = [pointer.lon, pointer.lat];

  // Update the position of the control point.
  var transaction = new emp.typeLibrary.Transaction({
    intent: emp.intents.control.FEATURE_ADD,
    mapInstanceId: this.mapInstance.mapInstanceId,
    transactionId: null,
    sender: this.mapInstance.mapInstanceId,
    originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
    source: emp.api.cmapi.SOURCE,
    messageOriginator: this.mapInstance.mapInstanceId,
    originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
    items: [newFeature]
  });
  transaction.run();

  // Now send back the information to the editingManager that will
  // help with generating some events.
  index = this.vertices.getIndex(featureId);
  newCoordinates = [];

  for (var i = 0; i < this.featureCopy.data.coordinates.length; i++) {
    newCoordinates.push({
      lat: this.featureCopy.data.coordinates[i][1],
      lon: this.featureCopy.data.coordinates[i][0]
    });
  }

  coordinateUpdate = {
      type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
      indices: [index],
      coordinates: newCoordinates
  };

  updateData.coordinateUpdate = coordinateUpdate;
  updateData.properties = this.featureCopy.properties;

  return updateData;

};

/**
 * Starts the move of an add point. Turns the add point into a vertex and creates
 * a new add point
 */
emp.editors.EditorBase.prototype.startMoveControlPoint = function(featureId, pointer) {

  var index,
    newCoordinates,
    coordinateUpdate,
    updateData;

  // for the base implementation, just move the control point.

  // Grab the actual feature associated with this control point featureId.
  var newFeature = this.vertices.findFeature(featureId);
  newFeature.data.coordinates = [pointer.lon, pointer.lat];

  // Update the position of the control point.
  var transaction = new emp.typeLibrary.Transaction({
    intent: emp.intents.control.FEATURE_ADD,
    mapInstanceId: this.mapInstance.mapInstanceId,
    transactionId: null,
    sender: this.mapInstance.mapInstanceId,
    originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
    source: emp.api.cmapi.SOURCE,
    messageOriginator: this.mapInstance.mapInstanceId,
    originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
    items: [newFeature]
  });
  transaction.run();

  // Now send back the information to the editingManager that will
  // help with generating some events.
  index = this.vertices.getIndex(featureId);
  newCoordinates = [];

  for (var i = 0; i < this.featureCopy.data.coordinates.length; i++) {
    newCoordinates.push({
      lat: this.featureCopy.data.coordinates[i][1],
      lon: this.featureCopy.data.coordinates[i][0]
    });
  }

  coordinateUpdate = {
      type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
      indices: [index],
      coordinates: newCoordinates
  };

  updateData.coordinateUpdate = coordinateUpdate;
  updateData.properties = this.featureCopy.properties;

  return updateData;
};

/**
 * To be called when ending the movement of a control point.
 */
emp.editors.EditorBase.prototype.endMoveControlPoint = function(featureId, pointer) {
  var index,
    newCoordinates,
    coordinateUpdate,
    updateData;

  // for the base implementation, just move the control point.

  // Grab the actual feature associated with this control point featureId.
  var newFeature = this.vertices.findFeature(featureId);
  newFeature.data.coordinates = [pointer.lon, pointer.lat];

  // Update the position of the control point.
  var transaction = new emp.typeLibrary.Transaction({
    intent: emp.intents.control.FEATURE_ADD,
    mapInstanceId: this.mapInstance.mapInstanceId,
    transactionId: null,
    sender: this.mapInstance.mapInstanceId,
    originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
    source: emp.api.cmapi.SOURCE,
    messageOriginator: this.mapInstance.mapInstanceId,
    originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
    items: [newFeature]
  });
  transaction.run();

  // Now send back the information to the editingManager that will
  // help with generating some events.
  index = this.vertices.getIndex(featureId);
  newCoordinates = [];

  for (var i = 0; i < this.featureCopy.data.coordinates.length; i++) {
    newCoordinates.push({
      lat: this.featureCopy.data.coordinates[i][1],
      lon: this.featureCopy.data.coordinates[i][0]
    });
  }

  coordinateUpdate = {
      type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
      indices: [index],
      coordinates: newCoordinates
  };

  updateData.coordinateUpdate = coordinateUpdate;
  updateData.properties = this.featureCopy.properties;

  return updateData;
};

/**
 * Moves the entire feature, offsetting from the starting position.
 */
emp.editors.EditorBase.prototype.moveFeature = function(startX, startY, pointer) {
  var transaction,
    item;

  // Get the original feature, change it's coordinates.
  //var deltaX,
  //  deltaY;

  //deltaX = pointer.clientX - startX;
  //deltaY = pointer.clientY - startY;

  if (this.featureCopy.data.type === 'Point') {
    this.featureCopy.data.coordinates = [pointer.lon, pointer.lat];

    item = new emp.typeLibrary.Feature({
      overlayId: this.featureCopy.overlayId,
      featureId: this.featureCopy.featureId,
      format: this.featureCopy.format,
      data: this.featureCopy.data,
      properties: this.featureCopy.properties
    });

    transaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.FEATURE_ADD,
      mapInstanceId: this.mapInstance.mapInstanceId,
      transactionId: null,
      sender: this.mapInstance.mapInstanceId,
      originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
      source: emp.api.cmapi.SOURCE,
      messageOriginator: this.mapInstance.mapInstanceId,
      originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
      items: [item]
    });

    transaction.run();
  } //else if (featureCopy.data.type === 'LineString') {

  //} else if (featureCopy.data.type === 'Polygon') {

  //  }

};
