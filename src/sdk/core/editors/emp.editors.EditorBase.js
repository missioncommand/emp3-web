emp.editors = {} || emp.editors;

/**
 * Controls the vertices on the map during an edit or draw and the animation
 * of those graphics.
 *
 * @param {Object} args All parmaters are members of the args object.
 * @param {string} args.feature The featureId of the item we are editing.
 * @param {string} args.mapInstanceId The id of the mapInstance to which the
 * editing is occurring.
 */
emp.editors.EditorBase = function(args) {

  this.controlPoints = [];

  // make a copy of feature as we do not want to change the feature passed in.
  this.featureCopy = emp.helpers.copyObject(args.feature);

  // Retrieve the mapInstance used for this feature.
  this.mapInstance = args.mapInstance;

};


/**
 * Adds the control points to the map for an edit or a draw.
 */
emp.editors.EditorBase.prototype.addControlPoints = function() {
  var i,
    controlPoint,
    transaction,
    length,
    coordinates,
    controlPointFeatureId;

  // normalize the geojson coordinates so we only have
  // to write one for loop.
  if (this.featureCopy.data.type === 'LineString') {
    length = this.featureCopy.data.coordinates.length;
    coordinates = this.featureCopy.data.coordinates;
  } else if (this.featureCopy.data.type === 'Polygon') {
    length = this.featureCopy.data.coordinates[0].length;
    coordinates = this.featureCopy.data.coordinates[0];
  } else if (this.featureCopy.data.type === 'Point') {
    length = 1;
    coordinates = [this.featureCopy.data.coordinates];
  }

  // default implementation: add a control point at every vertex.
  for (i = 0; i < length; i++) {

    controlPointFeatureId = emp3.api.createGUID();
    // create a feature for each of these coordinates.
    controlPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: controlPointFeatureId,
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: coordinates[i],
          type: 'Point'
        }
    });

    this.controlPoints[controlPointFeatureId] = controlPoint;
  }

  transaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.FEATURE_ADD,
      mapInstanceId: this.mapInstance.mapInstanceId,
      transactionId: null,
      sender: this.mapInstance.mapInstanceId,
      originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
      source: emp.api.cmapi.SOURCE,
      messageOriginator: this.mapInstance.mapInstanceId,
      originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
      items: this.controlPoints
  });

  transaction.run();

};


emp.editors.EditorBase.prototype.removeControlPoints = function() {
  var transaction;

  transaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.CMAPI_GENERIC_FEATURE_REMOVE,
      mapInstanceId: this.mapInstance.mapInstanceId,
      transactionId: null,
      sender: this.mapInstance.mapInstanceId,
      originChannel: cmapi.channel.names.MAP_FEATURE_UNPLOT,
      source: emp.api.cmapi.SOURCE,
      messageOriginator: this.mapInstance.mapInstanceId,
      originalMessageType: cmapi.channel.names.MAP_FEATURE_UNPLOT,
      items: this.controlPoints
  });

  transaction.run();

  this.controlPoints = [];

};

/**
 * Determine if the featureId is a controlPoint or if it is a feature.
 * This is useful for determining if a featureDrag event should be staticContent
 * out or not.
 */
emp.editors.EditorBase.prototype.isControlPoint = function(featureId) {
  var result = false;

  if (this.controlPoints[featureId]) {
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
emp.editors.EditorBase.prototype.moveControlPoint = function(featureId, x, y, pointer) {

  var controlPoint,
    transaction;

  controlPoint = this.controlPoints[featureId];
  controlPoint.data.coordinates = [pointer.lon, pointer.lat];

  transaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.FEATURE_ADD,
      mapInstanceId: this.mapInstance.mapInstanceId,
      transactionId: null,
      sender: this.mapInstance.mapInstanceId,
      originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
      source: emp.api.cmapi.SOURCE,
      messageOriginator: this.mapInstance.mapInstanceId,
      originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
      items: [controlPoint]
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
