emp.editors = emp.editors || {};

emp.editors.Point = function(args) {

  emp.editors.EditorBase.call(this, args);
};

emp.editors.Point.prototype = Object.create(emp.editors.EditorBase.prototype);
emp.editors.Point.prototype.constructor = emp.editors.Point;

/**
 * Adds the control points to the map for an edit or a draw.
 */
emp.editors.Point.prototype.addControlPoints = function() {
  // do nothing.
};

emp.editors.Point.prototype.removeControlPoints = function() {
  // do nothing
};

/**
 * Determine if the featureId is a controlPoint or if it is a feature.
 * This is useful for determining if a featureDrag event should be staticContent
 * out or not.
 */
emp.editors.Point.prototype.isControlPoint = function() {
  // there is no control points, never return true.
  return false;
};

/**
 * Occurs first when the control point is moved.  This method is called prior
 * to move control point.  It is a move, but allows us to initialize the
 * behavior of what happens prior to the move.
 */
emp.editors.Point.prototype.startMoveControlPoint = function() {
  // there is no control point, override default impl.  do not use.
};

/**
 * Moves control point passed in to the new location provided.
 * Also updates the control point and the feature with the change.
 */
emp.editors.Point.prototype.moveControlPoint = function() {

  // do nothing, there are no control points.
};

/**
 * Occurs after the control point has finished being moved.
 */
emp.editors.Point.prototype.endMoveControlPoint = function() {
  // there is no control point, override default impl.  do not use.
};



/**
 * Moves the entire feature, offsetting from the starting position.
 */
emp.editors.Point.prototype.moveFeature = function(startX, startY, pointer) {
  var transaction,
    item,
    updateData = {},
    coordinateUpdate,
    oldCoordinates,
    newCoordinates,
    altitude;

  // We need to notify the caller of the changes we are making.  These
  // changes will be sent as an update.

  // we need to see if we need to preserve the altitude of the feature.
  oldCoordinates = this.featureCopy.data.coordinates;

  if (oldCoordinates.length > 2) {
    altitude = oldCoordinates[2];
    this.featureCopy.data.coordinates = [pointer.lon, pointer.lat, altitude];
    newCoordinates = [{
      lat: pointer.lat,
      lon: pointer.lon,
      alt: altitude
    }];
  } else {
    this.featureCopy.data.coordinates = [pointer.lon, pointer.lat];
    newCoordinates = [{
      lat: pointer.lat,
      lon: pointer.lon
    }];
  }

  // Update the feature, only internally -- we don't want events sent out
  // from this.
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

  // Create the return object.  This will tell you which index was changed,
  // the locations of the new indeces, and the type of change it was.
  coordinateUpdate = {
      type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
      indices: [0],
      coordinates: newCoordinates
  };

  updateData.coordinateUpdate = coordinateUpdate;
  updateData.properties = this.featureCopy.properties;

  return updateData;
};

/**
 * Indicates the drawing has started and the first click has
 * been made.  Respond accordingly.
 *
 * In the case of the point, the point is added to the map.
 */
emp.editors.Point.prototype.drawStart = function(pointer) {
  var transaction;

  // Update the feature, only internally -- we don't want events sent out
  // from this.
  this.featureCopy = new emp.typeLibrary.Feature({
      overlayId: this.featureCopy.overlayId,
      featureId: this.featureCopy.featureId,
      format: this.featureCopy.format,
      data: {
        type: "Point",
        coordinates: [pointer.lon, pointer.lat]
      },
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
      items: [this.featureCopy]
  });

  transaction.run();
};

/**
 * Occurs when the map is clicked after the draw has started.
 */
emp.editors.Point.prototype.drawClick = function() {
  // do nothing
};

/**
 * Occurs after the draw has started and user is moving mouse.
 * Animation should occur here.
 */
emp.editors.Point.prototype.drawMove = function() {

};
