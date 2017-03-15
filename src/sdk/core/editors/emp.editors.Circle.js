/*global*/
emp.editors = emp.editors || {};

emp.editors.Circle = function(args) {
  this.animation = undefined;
  this.radius = undefined;
  this.center = undefined;
  emp.editors.EditorBase.call(this, args);

  this.calculateAddPoints = function() {

  };
};

emp.editors.Circle.prototype = Object.create(emp.editors.EditorBase.prototype);
emp.editors.Circle.prototype.constructor = emp.editors.Circle;

/**
 * Adds the control points to the map for an edit or a draw.
 */
emp.editors.Circle.prototype.addControlPoints = function() {

  var controlPoint,
    transaction,
    items = [],
    vertex,
    addPoint,
    newPoint,
    radiusVertex,
    distance;

  // All features entering into this method should be a LineString
  // otherwise this will not work.
  if (this.featureCopy.data.type === 'Point') {

    // Create a feature on the map for the center of the circle.
    controlPoint = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: this.featureCopy.data.coordinates,
        type: 'Point'
      },
      properties: {
        iconUrl: emp.ui.images.editPoint,
        iconXOffset: 12,
        iconYOffset: 12,
        xUnits: "pixels",
        yUnits: "pixels",
        altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
      }
    });

    vertex = new emp.editors.Vertex(controlPoint, "vertex");
    this.vertices.push(vertex);
    this.center = vertex;
    items.push(controlPoint);

    // Add the radius control point.
    if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE) {
      distance = this.featureCopy.properties.radius;
    } else if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
      distance = this.featureCopy.properties.distance[0];
    }

    newPoint = emp.geoLibrary.geodesic_coordinate({
      x: this.featureCopy.data.coordinates[0],
      y: this.featureCopy.data.coordinates[1]
    }, distance, 0);

    // create a feature for each of these coordinates.  This
    // will be our 'add point'
    addPoint = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [newPoint.x, newPoint.y],
        type: 'Point'
      },
      properties: {
        iconUrl: emp.ui.images.addPoint,
        iconXOffset: 8,
        iconYOffset: 8,
        xUnits: "pixels",
        yUnits: "pixels",
        altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
      }
    });

    items.push(addPoint);
    radiusVertex = new emp.editors.Vertex(addPoint, "add");
    this.radius = radiusVertex;
    this.vertices.push(radiusVertex);

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
      items: items
    });
    transaction.run();
  }
};

emp.editors.Circle.prototype.startMoveControlPoint = function(featureId, pointer) {

  var currentFeature,
    currentVertex,
    items = [],
    distance,
    index,
    coordinateUpdate,
    updateData = {},
    type = emp.typeLibrary.CoordinateUpdateType.UPDATE,
    newCoordinates,
    newRadiusPosition;

  currentVertex = this.vertices.find(featureId);

  // First update the control point with new pointer info.
  currentFeature = currentVertex.feature;
  currentFeature.data.coordinates = [pointer.lon, pointer.lat];

  // If the control point being moved is the radius control point,
  // calculate the new radius.  Calculate the new position of where
  // we want the control point to be.
  if (featureId === this.radius.feature.featureId){
    // measure the distance between the mouse location and the center.  This
    // will be the new radius.
    distance = emp.geoLibrary.measureDistance(this.radius.feature.data.coordinates[1],
      this.radius.feature.data.coordinates[0],
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    // Depending on if this is a GEO_CIRCLE or a GEO_MIL_SYMBOL, set different properties on
    // our feature.
    if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE) {
      this.featureCopy.properties.radius = distance;
    } else if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
      this.featureCopy.properties.distance[0] = distance;
    }
  } else {
    // If we are updating the center point, we need to move the center vertex
    // to a new location and we need to update the vertex of the radius location.
    this.featureCopy.data.coordinates = [pointer.lon, pointer.lat];

    // retrieve our distance from the existing circle.  We will use this to Calculate
    // the position of the new radius vertex.
    if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE) {
      distance = this.featureCopy.properties.radius;
    } else if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
      distance = this.featureCopy.properties.distance[0];
    }

    // retrieve the new radius vertex.   It will sit directly above our center point.
    newRadiusPosition = emp.geoLibrary.geodesic_coordinate({
      x: this.featureCopy.data.coordinates[0],
      y: this.featureCopy.data.coordinates[1]
    }, distance, 0);
    this.radius.feature.data.coordinates = [newRadiusPosition.x, newRadiusPosition.y];

    items.push(this.radius.feature);
  }

  // make sure the symbol is updated with its new properties.
  items.push(this.featureCopy);

  // Add our updated feature onto the items we will be updating in our
  // transaction.
  items.push(currentFeature);

  var transaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.FEATURE_ADD,
      mapInstanceId: this.mapInstance.mapInstanceId,
      transactionId: null,
      sender: this.mapInstance.mapInstanceId,
      originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
      source: emp.api.cmapi.SOURCE,
      messageOriginator: this.mapInstance.mapInstanceId,
      originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
      items: items
  });

  transaction.run();

  // Now send back the information to the editingManager that will
  // help with generating some events.
  index = this.vertices.getIndex(featureId);
  newCoordinates = [];

  for (var i = 0; i < this.featureCopy.data.coordinates.length; i++) {
    newCoordinates.push({
      lat: this.featureCopy.data.coordinates[1],
      lon: this.featureCopy.data.coordinates[0]
    });
  }

  coordinateUpdate = {
      type: type,
      indices: [index],
      coordinates: newCoordinates
  };

  updateData.coordinateUpdate = coordinateUpdate;
  updateData.properties = this.featureCopy.properties;

  return updateData;

};

/**
 * Moves control point passed in to the new location provided.
 * Also updates the control point and the feature with the change.
 */
emp.editors.Circle.prototype.moveControlPoint = function(featureId, pointer) {
  // startMoveControlPoint does everything we need to do.
  return this.startMoveControlPoint(featureId, pointer);
};

/**
 * Moves control point passed in to the new location provided.
 * Also updates the control point and the feature with the change.
 */
emp.editors.Circle.prototype.endMoveControlPoint = function(featureId, pointer) {
  // startMoveControlPoint does everything we need to do.
  return this.startMoveControlPoint(featureId, pointer);
};

/**
 * Moves the entire feature, offsetting from the starting position.
 */
emp.editors.Circle.prototype.moveFeature = function() {
  // do not do anything here.  We do not want to let users move the feature.
};
