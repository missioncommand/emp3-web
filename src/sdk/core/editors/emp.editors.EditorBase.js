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
emp.editors.EditorBase.prototype.moveControlPoint = function() {


};

/**
 * Starts the move of an add point. Turns the add point into a vertex and creates
 * a new add point
 */
emp.editors.EditorBase.prototype.startMoveControlPoint = function(featureId, pointer) {

  // If this is an add point we are moving, we need to add new vertices.
  var newFeature = this.vertices.findFeature(featureId);
  newFeature.data.coordinates = [pointer.lon, pointer.lat];

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
