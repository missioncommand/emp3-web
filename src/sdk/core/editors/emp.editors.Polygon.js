/*global LatLon*/
emp.editors = emp.editors || {};

/**
 * Provides the instructions for editing a polygon to the editingManager.
 * Provides and shows the control points and how the shape should removeTransaction
 * when the control points move.
 */
emp.editors.Polygon = function(args) {
  this.animation = undefined;
  emp.editors.EditorBase.call(this, args);

};

emp.editors.Polygon.prototype = Object.create(emp.editors.EditorBase.prototype);
emp.editors.Polygon.prototype.constructor = emp.editors.Polygon;

/**
 * Adds the control points to the map for an edit or a draw.
 */
emp.editors.Polygon.prototype.addControlPoints = function() {

  var i,
    controlPoint,
    transaction,
    length,
    coordinates,
    midpoint,
    items = [],
    vertex,
    addPoint,
    pt1,
    pt2,
    pt3;

  // All features entering into this method should be a Polygon
  // otherwise this will not work.
  if (this.featureCopy.data.type === 'Polygon') {
    length = this.featureCopy.data.coordinates[0].length;
    coordinates = this.featureCopy.data.coordinates;

    // Create a feature on the map for each vertex.
    for (i = 0; i < length; i++) {

      // create a feature for each of these coordinates.
      controlPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: coordinates[0][i],
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
      items.push(controlPoint);

      // If there is another point to add, we need to add an "add" controlPoint
      if (i < length - 1) {

        // find the mid point between this point and the next point.
        pt1 = new LatLon(coordinates[0][i][1], coordinates[0][i][0]);
        pt2 = new LatLon(coordinates[0][i + 1][1], coordinates[0][i + 1][0]);

        // Get the mid point between this vertex and the next vertex.
        pt3 = pt1.midpointTo(pt2);
        midpoint = [pt3.lon(), pt3.lat()];


      }
      else if (i === length - 1) {
        // find the mid point between this point and the next point.
        pt1 = new LatLon(coordinates[0][i][1], coordinates[0][i][0]);
        pt2 = new LatLon(coordinates[0][0][1], coordinates[0][0][0]);

        // Get the mid point between this vertex and the next vertex.
        pt3 = pt1.midpointTo(pt2);
        midpoint = [pt3.lon(), pt3.lat()];
      }

      // create a feature for each of these coordinates.  This
      // will be our 'add point'
      addPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: midpoint,
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
      vertex = new emp.editors.Vertex(addPoint, "add");
      this.vertices.push(vertex);
    }

    // copy the coordinates into our object, so we can eventually complete
    // the edit.
    this.featureCopy.data.coordinates = [this.vertices.getVerticesAsLineString()];

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
  } // end if

};

/**
 * Begins moving the one of the control points.  Determines if the item
 * is a vertex or an add control point.  If it is an add point, it will create
 * a new vertex and 2 new add control points.
 */
emp.editors.Polygon.prototype.startMoveControlPoint = function(featureId, pointer) {

  var currentFeature,
    currentVertex,
    items = [],
    front,
    back,
    backFeature,
    frontFeature,
    newBackFeature,
    newFrontFeature,
    pt1,
    pt2,
    pt3,
    midpoint,
    index,
    coordinateUpdate,
    updateData = {},
    type = emp.typeLibrary.CoordinateUpdateType.UPDATE,
    newCoordinates,
    animationCoordinates = [];

  currentVertex = this.vertices.find(featureId);

  if (currentVertex) {
    // First update the control point with new pointer info.
    currentFeature = currentVertex.feature;
    currentFeature.data.coordinates = [pointer.lon, pointer.lat];

    // If this is an add point we are moving, we need to create new vertices.
    if (currentVertex.type === 'add') {

      type = emp.typeLibrary.CoordinateUpdateType.ADD;
      currentVertex.type = 'vertex';

      currentFeature = currentVertex.feature;

      // Change the icon to be that of a vertex.
      currentFeature.properties.iconUrl = emp.ui.images.editPoint;

      backFeature = currentVertex.before.feature;

      pt1 = new LatLon(backFeature.data.coordinates[1], backFeature.data.coordinates[0]);
      pt2 = new LatLon(currentFeature.data.coordinates[1], currentFeature.data.coordinates[0]);

      // Get the mid point between this vertex and the next vertex.
      pt3 = pt1.midpointTo(pt2);
      midpoint = [pt3.lon(), pt3.lat()];

      newBackFeature = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: midpoint,
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


      // based on the index of the item being moved, determine how to
      // add the front vertices.   If it is the last point
      // we need to add the front vertex at the end with between the first and last point.
      if (currentVertex.next === null) {
        // get the midpoint between current point and next point.
        frontFeature = this.vertices.head.feature;
      }
      else {
        // get the midpoint between current point and next point.
        frontFeature = currentVertex.next.feature;
      }

      pt1 = new LatLon(currentFeature.data.coordinates[1], currentFeature.data.coordinates[0]);
      pt2 = new LatLon(frontFeature.data.coordinates[1], frontFeature.data.coordinates[0]);

      // Get the mid point between this vertex and the next vertex.
      pt3 = pt1.midpointTo(pt2);
      midpoint = [pt3.lon(), pt3.lat()];

      newFrontFeature = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: midpoint,
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

      // update vertices with new items.
      front = new emp.editors.Vertex(newFrontFeature, "add");
      back = new emp.editors.Vertex(newBackFeature, "add");
      this.vertices.insert(currentFeature.featureId, back);
      this.vertices.append(currentFeature.featureId, front);

      // Add the new features of items we want to send to the map.
      items.push(newFrontFeature);
      items.push(newBackFeature);


    } // end if (currentVertex.type === add);

    // Add our updated feature onto the items we will be updating in our
    // transaction.
    items.push(currentFeature);

  } //end if (currentVertex)

  // Now we need to create a line animation that shows the editing.
  //
  // if this is the first point we need to create the animation starting
  // from the last point in the polygon to the first point.
  // this is the first point.
  if (currentVertex.before === null) {
    animationCoordinates.push(this.vertices.tail.before.feature.data.coordinates);
  }
  else {
    animationCoordinates.push(currentVertex.before.before.feature.data.coordinates);
  }

  // this is the second point in the line animation.
  animationCoordinates.push(currentFeature.data.coordinates);

  // this is the third point in the line animation.
  //
  // if this is the last vertex, than the last point of the animation is the
  // first point of the polygon.
  if (currentVertex.next.next === null) {
    animationCoordinates.push(this.vertices.head.feature.data.coordinates);
  }
  else {
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

  for (var i = 0; i < this.featureCopy.data.coordinates[0].length; i++) {
    newCoordinates.push({
      lat: this.featureCopy.data.coordinates[0][i][1],
      lon: this.featureCopy.data.coordinates[0][i][0]
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
emp.editors.Polygon.prototype.moveControlPoint = function(featureId, pointer) {
  var currentFeature,
    currentVertex,
    back,
    front,
    backFeature,
    frontFeature,
    nextFrontVertexFeature,
    nextBackVertexFeature,
    items = [],
    pt1,
    pt2,
    pt3,
    midpoint,
    newCoordinates,
    coordinateUpdate,
    updateData = {},
    animationCoordinates = [],
    index,
    i;

  // First update the control point with new pointer info.
  currentVertex = this.vertices.find(featureId);
  currentFeature = currentVertex.feature;
  currentFeature.data.coordinates = [pointer.lon, pointer.lat];
  // the updated feature to the list of items to be updated.
  items.push(currentFeature);

  // now that this point moved, we need to update the points directly to the left
  // and right of this feature.
  back = currentVertex.before;
  front = currentVertex.next;

  // Check to see if we are moving the head.  If we are then we will need
  // to move the add points in between the first and last vertices of the polygon.
  if (back === null) {
    backFeature = this.vertices.tail.feature;
    nextBackVertexFeature = this.vertices.tail.before.feature;
  }
  else {
    backFeature = back.feature;
    nextBackVertexFeature = back.before.feature;
  }

  // get the new location of the backFeature, the feature in before the current feature
  pt1 = new LatLon(nextBackVertexFeature.data.coordinates[1], nextBackVertexFeature.data.coordinates[0]);
  pt2 = new LatLon(currentFeature.data.coordinates[1], currentFeature.data.coordinates[0]);

  // Get the mid point between this vertex and the next vertex.
  pt3 = pt1.midpointTo(pt2);
  midpoint = [pt3.lon(), pt3.lat()];

  backFeature.data.coordinates = midpoint;

  items.push(backFeature);


  // Check to see if we are moving the last vertex.  If we are then we will need
  // to move the addpoint at the end of the vertices between the first and last points..
  if (front.next === null) {
    frontFeature = front.feature;
    nextFrontVertexFeature = this.vertices.head.feature;
  }
  else {
    frontFeature = front.feature;
    nextFrontVertexFeature = front.next.feature;
  }

  // get the new location of the frontFeature. the feature after the current feature.
  pt1 = new LatLon(currentFeature.data.coordinates[1], currentFeature.data.coordinates[0]);
  pt2 = new LatLon(nextFrontVertexFeature.data.coordinates[1], nextFrontVertexFeature.data.coordinates[0]);

  // Get the mid point between this vertex and the next vertex.
  pt3 = pt1.midpointTo(pt2);
  midpoint = [pt3.lon(), pt3.lat()];

  frontFeature.data.coordinates = midpoint;

  items.push(frontFeature);


  // copy the coordinates into our object, so we can eventually complete
  // the edit.
  this.featureCopy.data.coordinates = [this.vertices.getVerticesAsLineString()];

  // Create the points for the animation of the line.
  //
  // This is the first point
  //
  // If the vertex we are moving is the first point of the polygon, then
  // the first point on the animation is the last point of the polygon
  if (currentVertex.before === null) {
    animationCoordinates.push(this.vertices.tail.before.feature.data.coordinates);
  }
  else {
    animationCoordinates.push(currentVertex.before.before.feature.data.coordinates);
  }

  // this is the second point.
  animationCoordinates.push(currentFeature.data.coordinates);

  // this is the thrid animation point
  //
  // if the vertex we are moving is the last point of the polygon, the third
  // animation point will be the first point of the polygon.
  if (currentVertex.next.next === null) {
    animationCoordinates.push(this.vertices.head.feature.data.coordinates);
  }
  else {
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

  // return updateData
  // Create the return object.  This will tell you which index was added,
  // the locations of the new indices, and the type of change it was.
  newCoordinates = [];

  for (i = 0; i < this.featureCopy.data.coordinates[0].length; i++) {
    newCoordinates.push({
      lat: this.featureCopy.data.coordinates[0][i][1],
      lon: this.featureCopy.data.coordinates[0][i][0]
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
};

/**
 * Moves control point passed in to the new location provided.
 * Also updates the control point and the feature with the change.
 */
emp.editors.Polygon.prototype.endMoveControlPoint = function(featureId, pointer) {
  var items = [],
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
  items.push(currentFeature);

  // copy the coordinates into our object, so we can eventually complete
  // the edit.
  this.featureCopy.data.coordinates = [this.vertices.getVerticesAsLineString()];
  var copy = emp.helpers.copyObject(this.featureCopy);
  items.push(copy);

  // now that this point moved, we need to update the add points directly to the left
  // and right of this feature.
  back = currentVertex.before;
  front = currentVertex.next;

  // Check to see if we are moving the head.  If we are then we will need
  // to move the add points in between the first and last vertices of the polygon.
  if (back === null) {
    backFeature = this.vertices.tail.feature;
    nextBackVertexFeature = this.vertices.tail.before.feature;
  }
  else {
    backFeature = back.feature;
    nextBackVertexFeature = back.before.feature;
  }

  // get the new location of the backFeature, the feature in before the current feature
  pt1 = new LatLon(nextBackVertexFeature.data.coordinates[1], nextBackVertexFeature.data.coordinates[0]);
  pt2 = new LatLon(currentFeature.data.coordinates[1], currentFeature.data.coordinates[0]);

  // Get the mid point between this vertex and the next vertex.
  pt3 = pt1.midpointTo(pt2);
  midpoint = [pt3.lon(), pt3.lat()];

  backFeature.data.coordinates = midpoint;

  items.push(backFeature);

  // Check to see if we are moving the tail.  If we are then we will need
  // to move the addpoint at the end of the vertices between the first and last points..
  if (front.next === null) {
    frontFeature = front.feature;
    nextFrontVertexFeature = this.vertices.head.feature;
  }
  else {
    frontFeature = front.feature;
    nextFrontVertexFeature = front.next.feature;
  }

  // get the new location of the frontFeature. the feature after the current feature.
  pt1 = new LatLon(currentFeature.data.coordinates[1], currentFeature.data.coordinates[0]);
  pt2 = new LatLon(nextFrontVertexFeature.data.coordinates[1], nextFrontVertexFeature.data.coordinates[0]);

  // Get the mid point between this vertex and the next vertex.
  pt3 = pt1.midpointTo(pt2);
  midpoint = [pt3.lon(), pt3.lat()];

  frontFeature.data.coordinates = midpoint;

  items.push(frontFeature);

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

  // reset the animated polygon.
  this.animation = undefined;

  // Create the return object.  This will tell you which index was changed,
  // the locations of the new indeces, and the type of change it was.
  newCoordinates = [];
  for (var i = 0; i < this.featureCopy.data.coordinates[0].length; i++) {
    newCoordinates.push({
      lat: this.featureCopy.data.coordinates[0][i][1],
      lon: this.featureCopy.data.coordinates[0][i][0]
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
};

/**
 * Moves the entire feature, offsetting from the starting position.
 */
emp.editors.Polygon.prototype.moveFeature = function() {

};

/**
 * Indicates the drawing has started and the first click has
 * been made.  Respond accordingly.
 *
 * In the case of the line, we just track the first point. nothing.
 * occurs until the mouse is moved.
 */
emp.editors.Polygon.prototype.drawStart = function(pointer) {
  var coordinateUpdate,
    updateData = {},
    controlPoint,
    vertex,
    items = [],
    transaction;

  // Create a vertex.
  controlPoint = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    data: {
      coordinates: [pointer.lon, pointer.lat],
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
  items.push(controlPoint);

  // Update the feature, only internally -- we don't want events sent out
  // from this.
  this.featureCopy = new emp.typeLibrary.Feature({
    overlayId: this.featureCopy.overlayId,
    featureId: this.featureCopy.featureId,
    format: this.featureCopy.format,
    data: {
      type: "Polygon",
      coordinates: [
        [
          [pointer.lon, pointer.lat]
        ]
      ]
    },
    properties: this.featureCopy.properties
  });


  // Place the vertex that you clicked on the map.
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


  // Create the return object.  This will tell you which index was changed,
  // the locations of the new indeces, and the type of change it was.
  coordinateUpdate = {
    type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
    indices: [0],
    coordinates: this.vertices.getVerticesAsLineString()
  };

  updateData.coordinateUpdate = coordinateUpdate;
  updateData.properties = this.featureCopy.properties;

  return updateData;

};

/**
 * Occurs when the map is clicked after the draw has started.
 */
emp.editors.Polygon.prototype.drawClick = function(pointer) {
  var coordinateUpdate,
    updateData = {},
    controlPoint,
    vertex,
    addVertex,
    addVertex2,
    items = [],
    newCoordinates,
    index,
    updateTransaction,
    midpoint,
    midpoint2,
    addPoint,
    addPoint2,
    pt1, pt2, pt3, i;

  // second and third points and fourth points are very different.  For second point, we draw a line
  // just to show marking.

  // Verify this point is different than the last point. Otherwise ignore.
  if (this.vertices.tail.feature.data.coordinates[0] !== pointer.lon ||
    this.vertices.tail.feature.data.coordinates[1] !== pointer.lat) {

    if (this.vertices.vertexLength === 1) {

      // create a midPoint vertex.
      // find the mid point between this point and the next point.
      pt1 = new LatLon(this.vertices.tail.feature.data.coordinates[1], this.vertices.tail.feature.data.coordinates[0]);
      pt2 = new LatLon(pointer.lat, pointer.lon);

      // Get the mid point between this vertex and the next vertex.
      pt3 = pt1.midpointTo(pt2);
      midpoint = [pt3.lon(), pt3.lat()];

      // create a feature for each of these coordinates.  This
      // will be our 'add point'
      addPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: midpoint,
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

      // create new vertex.
      controlPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: [pointer.lon, pointer.lat],
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

      addVertex = new emp.editors.Vertex(addPoint, "add");
      vertex = new emp.editors.Vertex(controlPoint, "vertex");
      this.vertices.push(addVertex);
      this.vertices.push(vertex);
      items.push(addPoint);
      items.push(controlPoint);
    }
    else if (this.vertices.vertexLength === 2) {
      // there is currently only 2 points in the polygon--not enough points.
      // now that we clicked again we will have enough, but we need to generate
      // the "add point" that we didn't have before.

      // create a midPoint vertex.
      // find the mid point between this point and the next point.
      pt1 = new LatLon(this.vertices.tail.feature.data.coordinates[1], this.vertices.tail.feature.data.coordinates[0]);
      pt2 = new LatLon(pointer.lat, pointer.lon);

      // Get the mid point between this vertex and the next vertex.
      pt3 = pt1.midpointTo(pt2);
      midpoint = [pt3.lon(), pt3.lat()];

      // create a midPoint vertex.
      // find the mid point between this point and the next point.
      pt1 = new LatLon(pointer.lat, pointer.lon);
      pt2 = new LatLon(this.vertices.head.feature.data.coordinates[1], this.vertices.head.feature.data.coordinates[0]);

      // Get the mid point between this vertex and the first vertex.
      pt3 = pt1.midpointTo(pt2);
      midpoint2 = [pt3.lon(), pt3.lat()];

      // create a feature for each of these coordinates.  This
      // will be our 'add point'
      addPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: midpoint,
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

      // create a feature for each of these coordinates.  This
      // will be our 'add point'
      addPoint2 = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: midpoint2,
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

      // create new vertex.
      controlPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: [pointer.lon, pointer.lat],
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

      addVertex = new emp.editors.Vertex(addPoint, "add");
      addVertex2 = new emp.editors.Vertex(addPoint2, "add");
      vertex = new emp.editors.Vertex(controlPoint, "vertex");

      // these vertices need to be added in this order.  Otherwise,
      // the vertices get screwed up.  For polygons it is always vertex, add, vertex add.
      // it always needs to end on a vertex.
      this.vertices.push(addVertex);
      this.vertices.push(vertex);
      this.vertices.push(addVertex2);
      items.push(addPoint);
      items.push(controlPoint);
      items.push(addPoint2);
    }
    else {
      // there is more than 3 points in the polygon.  In this case we need to addPoint
      // change the last addPoint, add the new vertex, and then add a new addPoint.

      // get the updated midpoint vertex position.
      // find the mid point between this point and the next point.
      pt1 = new LatLon(this.vertices.tail.before.feature.data.coordinates[1],
        this.vertices.tail.before.feature.data.coordinates[0]);
      pt2 = new LatLon(pointer.lat, pointer.lon);

      // Get the mid point between this vertex and the first vertex.
      pt3 = pt1.midpointTo(pt2);
      midpoint = [pt3.lon(), pt3.lat()];

      // create a midPoint vertex.
      // find the mid point between this point and the next point.
      pt1 = new LatLon(pointer.lat, pointer.lon);
      pt2 = new LatLon(this.vertices.head.feature.data.coordinates[1], this.vertices.head.feature.data.coordinates[0]);

      // Get the mid point between this vertex and the next vertex.
      pt3 = pt1.midpointTo(pt2);
      midpoint2 = [pt3.lon(), pt3.lat()];

      // create a feature for each of these coordinates.  This
      // will be our 'add point'
      addPoint = this.vertices.tail.feature;
      addPoint.data.coordinates = midpoint;

      // create a feature for each of these coordinates.  This
      // will be our 'add point'
      addPoint2 = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: midpoint2,
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

      // create new vertex.
      controlPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: [pointer.lon, pointer.lat],
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

      // create two new vertices that are going to be added to the map.
      addVertex = new emp.editors.Vertex(addPoint2, "add");
      vertex = new emp.editors.Vertex(controlPoint, "vertex");

      // these vertices need to be added in this order.  Otherwise,
      // the vertices get screwed up.  For polygons it is always vertex, add, vertex add.
      // it always needs to end on a vertex.
      this.vertices.push(vertex);
      this.vertices.push(addVertex);
      items.push(addPoint);
      items.push(controlPoint);
      items.push(addPoint2);

    }

    // update feature copy
    this.featureCopy.data.coordinates = this.vertices.getVerticesAsPolygon();


    // update line
    items.push(this.featureCopy);

    updateTransaction = new emp.typeLibrary.Transaction({
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

    updateTransaction.run();


    // return updateData
    // Create the return object.  This will tell you which index was added,
    // the locations of the new indices, and the type of change it was.

    newCoordinates = [];

    for (i = 0; i < this.featureCopy.data.coordinates[0].length; i++) {
      newCoordinates.push({
        lat: this.featureCopy.data.coordinates[0][i][1],
        lon: this.featureCopy.data.coordinates[0][i][0]
      });
    }

    index = this.vertices.vertexLength - 1;

    coordinateUpdate = {
      type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
      indices: [index],
      coordinates: newCoordinates
    };

    updateData.coordinateUpdate = coordinateUpdate;
    updateData.properties = this.featureCopy.properties;

  }

  return updateData;
};

/**
 * Occurs after the draw has started and user is moving mouse.
 * Animation should occur here.
 */
emp.editors.Polygon.prototype.drawMove = function() {

};
