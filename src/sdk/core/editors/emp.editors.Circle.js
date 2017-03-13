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

  if (featureId === this.radius.feature.featureId){
    // if the radius moves, then we need to update the radius value on the
    // original feature.
    //
    distance = emp.geoLibrary.measureDistance(this.radius.feature.data.coordinates[1],
      this.radius.feature.data.coordinates[0],
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    // Add the radius control point.
    if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE) {
      this.featureCopy.properties.radius = distance;
    } else if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
      this.featureCopy.properties.distance[0] = distance;
    }
  } else {
    this.featureCopy.data.coordinates = [pointer.lon, pointer.lat];

    // Add the radius control point.
    if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE) {
      distance = this.featureCopy.properties.radius;
    } else if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
      distance = this.featureCopy.properties.distance[0];
    }

    newRadiusPosition = emp.geoLibrary.geodesic_coordinate({
      x: this.featureCopy.data.coordinates[0],
      y: this.featureCopy.data.coordinates[1]
    }, distance, 0);

    this.radius.feature.data.coordinates = [newRadiusPosition.x, newRadiusPosition.y];

    items.push(this.radius.feature);
  }

  items.push(this.featureCopy);

  // Add our updated feature onto the items we will be updating in our
  // transaction.
  items.push(currentFeature);

  /*
  if (currentVertex.before !== null) {
    animationCoordinates.push(currentVertex.before.before.feature.data.coordinates);
  }
  animationCoordinates.push(currentFeature.data.coordinates);
  if (currentVertex.next !== null) {
    animationCoordinates.push(currentVertex.next.next.feature.data.coordinates);
  }

  // create a line going from the previous point, to the current point
  // to the next point.  This will be the animation.
  this.animation = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_PATH,
    data: {
      coordinates: animationCoordinates,
      type: 'LineString'
    },
    properties: {
      lineColor: "FFFFFF00"
    }
  });

  items.push(this.animation);
  */

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
  /*
  var currentFeature,
    currentVertex,
    back,
    front,
    backFeature,
    frontFeature,
    nextFrontVertexFeature,
    nextBackVertexFeature,
    items =[],
    pt1,
    pt2,
    pt3,
    midpoint,
    newCoordinates,
    coordinateUpdate,
    updateData = {},
    animationCoordinates = [],
    index;
    */

  return this.startMoveControlPoint(featureId, pointer);

  /*
  // First update the control point with new pointer info.
  currentVertex = this.vertices.find(featureId);
  currentFeature = currentVertex.feature;
  currentFeature.data.coordinates = [pointer.lon, pointer.lat];
  // the updated feature to the list of items to be updated.
  items.push(currentFeature);

  // now that this point moved, we need to update the points directly to the leaflet
  // and right of this feature.
  back = currentVertex.before;
  front = currentVertex.next;

  // Make sure that we are not moving the head.  If we are, skip.
  if (back !== null) {
    backFeature = back.feature;
    nextBackVertexFeature = back.before.feature;

    // get the new location of the backFeature, the feature in before the current feature
    pt1 = new LatLon(nextBackVertexFeature.data.coordinates[1], nextBackVertexFeature.data.coordinates[0]);
    pt2 = new LatLon(currentFeature.data.coordinates[1], currentFeature.data.coordinates[0]);

    // Get the mid point between this vertex and the next vertex.
    pt3 = pt1.midpointTo(pt2);
    midpoint = [pt3.lon(), pt3.lat()];

    backFeature.data.coordinates = midpoint;

    items.push(backFeature);

  }

  // Make sure that we are not moving the tail.  If we are skip.
  if (front !== null) {
    frontFeature = front.feature;
    nextFrontVertexFeature = front.next.feature;
    // get the new location of the frontFeature. the feature after the current feature.
    pt1 = new LatLon(currentFeature.data.coordinates[1], currentFeature.data.coordinates[0]);
    pt2 = new LatLon(nextFrontVertexFeature.data.coordinates[1], nextFrontVertexFeature.data.coordinates[0]);

    // Get the mid point between this vertex and the next vertex.
    pt3 = pt1.midpointTo(pt2);
    midpoint = [pt3.lon(), pt3.lat()];

    frontFeature.data.coordinates = midpoint;

    items.push(frontFeature);
  }

  // copy the coordinates into our object, so we can eventually complete
  // the edit.
  this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();

  if (currentVertex.before !== null) {
    animationCoordinates.push(currentVertex.before.before.feature.data.coordinates);
  }
  animationCoordinates.push(currentFeature.data.coordinates);
  if (currentVertex.next !== null) {
    animationCoordinates.push(currentVertex.next.next.feature.data.coordinates);
  }
  this.animation.data.coordinates = animationCoordinates;

  items.push(this.animation);

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

  // Create the return object.  This will tell you which index was changed,
  // the locations of the new indeces, and the type of change it was.
  newCoordinates = [];
  for (var i = 0; i < this.featureCopy.data.coordinates.length; i++) {
    newCoordinates.push({
      lat: this.featureCopy.data.coordinates[i][1],
      lon: this.featureCopy.data.coordinates[i][0]
    });
  }

  index = this.vertices.getIndex(featureId);

  coordinateUpdate = {
      type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
      indices: [index], //TODO: Get the correct index.
      coordinates: newCoordinates
  };

  updateData.coordinateUpdate = coordinateUpdate;
  updateData.properties = this.featureCopy.properties;

  return updateData;
  */
};

/**
 * Moves control point passed in to the new location provided.
 * Also updates the control point and the feature with the change.
 */
emp.editors.Circle.prototype.endMoveControlPoint = function(featureId, pointer) {
  return this.startMoveControlPoint(featureId, pointer);

  /*
  var items =[],
    newCoordinates,
    coordinateUpdate,
    updateData = {},
    index,
    addTransaction,
    removeTransaction,
    currentVertex,
    currentFeature,
    back,
    front,
    backFeature,
    nextBackVertexFeature,
    frontFeature,
    nextFrontVertexFeature,
    pt1,
    pt2,
    pt3,
    midpoint;

  // First update the control point with new pointer info.
  currentVertex = this.vertices.find(featureId);
  currentFeature = currentVertex.feature;
  currentFeature.data.coordinates = [pointer.lon, pointer.lat];

  // copy the coordinates into our object, so we can eventually complete
  // the edit.
  this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();
  items.push(this.featureCopy);

  // now that this point moved, we need to update the points directly to the leaflet
  // and right of this feature.
  back = currentVertex.before;
  front = currentVertex.next;

  // Make sure that we are not moving the head.  If we are, skip.
  if (back !== null) {
    backFeature = back.feature;
    nextBackVertexFeature = back.before.feature;

    // get the new location of the backFeature, the feature in before the current feature
    pt1 = new LatLon(nextBackVertexFeature.data.coordinates[1], nextBackVertexFeature.data.coordinates[0]);
    pt2 = new LatLon(currentFeature.data.coordinates[1], currentFeature.data.coordinates[0]);

    // Get the mid point between this vertex and the next vertex.
    pt3 = pt1.midpointTo(pt2);
    midpoint = [pt3.lon(), pt3.lat()];

    backFeature.data.coordinates = midpoint;

    items.push(backFeature);

  }

  // Make sure that we are not moving the tail.  If we are skip.
  if (front !== null) {
    frontFeature = front.feature;
    nextFrontVertexFeature = front.next.feature;
    // get the new location of the frontFeature. the feature after the current feature.
    pt1 = new LatLon(currentFeature.data.coordinates[1], currentFeature.data.coordinates[0]);
    pt2 = new LatLon(nextFrontVertexFeature.data.coordinates[1], nextFrontVertexFeature.data.coordinates[0]);

    // Get the mid point between this vertex and the next vertex.
    pt3 = pt1.midpointTo(pt2);
    midpoint = [pt3.lon(), pt3.lat()];

    frontFeature.data.coordinates = midpoint;

    items.push(frontFeature);
  }

  addTransaction = new emp.typeLibrary.Transaction({
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

  // Remove the line animation.
  removeTransaction = new emp.typeLibrary.Transaction({
    intent: emp.intents.control.CMAPI_GENERIC_FEATURE_REMOVE,
    mapInstanceId: this.mapInstance.mapInstanceId,
    transactionId: null,
    sender: this.mapInstance.mapInstanceId,
    originChannel: cmapi.channel.names.MAP_FEATURE_UNPLOT,
    source: emp.api.cmapi.SOURCE,
    messageOriginator: this.mapInstance.mapInstanceId,
    originalMessageType: cmapi.channel.names.MAP_FEATURE_UNPLOT,
    items: [this.animation]
  });

  addTransaction.run();
  removeTransaction.run();

  // reset the animated path.
  this.animation = undefined;

  // Create the return object.  This will tell you which index was changed,
  // the locations of the new indeces, and the type of change it was.
  newCoordinates = [];
  for (var i = 0; i < this.featureCopy.data.coordinates.length; i++) {
    newCoordinates.push({
      lat: this.featureCopy.data.coordinates[i][1],
      lon: this.featureCopy.data.coordinates[i][0]
    });
  }

  index = this.vertices.getIndex(featureId);

  coordinateUpdate = {
      type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
      indices: [index], //TODO: Get the correct index.
      coordinates: newCoordinates
  };

  updateData.coordinateUpdate = coordinateUpdate;
  updateData.properties = this.featureCopy.properties;



  return updateData;
  */
};

/**
 * Moves the entire feature, offsetting from the starting position.
 */
emp.editors.Circle.prototype.moveFeature = function() {

};
