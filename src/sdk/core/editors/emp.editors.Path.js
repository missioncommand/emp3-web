emp.editors.Path = function(args) {

  emp.editors.EditorBase.call(this, args);
};

emp.editors.Point.prototype = Object.create(emp.editors.EditorBase.prototype);
emp.editors.Point.prototype.constructor = emp.editors.Point;

/**
 * Adds the control points to the map for an edit or a draw.
 */
emp.editors.Point.prototype.addControlPoints = function() {
  var i,
    controlPoint,
    transaction,
    length,
    coordinates,
    controlPointFeatureId,
    midpoint;

  // All features entering into this method should be a LineString
  // otherwise this will not work.
  if (this.featureCopy.data.type === 'LineString') {
    length = this.featureCopy.data.coordinates.length;
    coordinates = this.featureCopy.data.coordinates;

    // Create a feature on the map for each vertex.
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
    }

    // Create mid point graphic for each point in between to add new points.
    this.controlPoints[controlPointFeatureId] = controlPoint;
    for (i = 0; i < (length - 1); i++) {
      controlPointFeatureId = emp3.api.createGUID();

      var pt1 = new LatLon(coordinates[i].latitude, coordinates[i].longitude);
      var pt2 = new LatLon(coordinates[i + 1].latitude, coordinates[i + 1].longitude);

      // Get the mid point between this vertex and the next vertex.
      var pt3 = pt1.midpointTo(pt2);
      midPoint = [pt3.lon, pt3.lat];

      // create a feature for each of these coordinates.
      controlPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: controlPointFeatureId,
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: midPoint,
          type: 'Point'
        }
      });
    }

    // Create a line graphic to replace the line that exists.  We do this for the
    // sake of MIL-STD symbols which may take a long time to draw.

    // run the transaction and add all the symbols on the map.
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
  } // end if

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
 * Moves control point passed in to the new location provided.
 * Also updates the control point and the feature with the change.
 */
emp.editors.Point.prototype.moveControlPoint = function() {

    // do nothing, there are no control points.
  },

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
    }
    else {
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
