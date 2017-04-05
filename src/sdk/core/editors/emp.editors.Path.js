/*global LatLon*/
emp.editors = emp.editors || {};

emp.editors.Path = function(args) {
  this.animation = undefined;
  emp.editors.EditorBase.call(this, args);

  this.calculateAddPoints = function() {

  };
};

emp.editors.Path.prototype = Object.create(emp.editors.EditorBase.prototype);
emp.editors.Path.prototype.constructor = emp.editors.Path;

/**
 * Adds the control points to the map for an edit or a draw.
 */
emp.editors.Path.prototype.addControlPoints = function() {

  var i,
    controlPoint,
    transaction,
    length,
    coordinates,
    midpoint,
    items = [],
    vertex,
    addPoint;

  // All features entering into this method should be a LineString
  // otherwise this will not work.
  if (this.featureCopy.data.type === 'LineString') {
    length = this.featureCopy.data.coordinates.length;
    coordinates = this.featureCopy.data.coordinates;

    // Create a feature on the map for each vertex.
    for (i = 0; i < length; i++) {

      // create a feature for each of these coordinates.
      controlPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: coordinates[i],
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
        var pt1 = new LatLon(coordinates[i][1], coordinates[i][0]);
        var pt2 = new LatLon(coordinates[i + 1][1], coordinates[i + 1][0]);

        // Get the mid point between this vertex and the next vertex.
        var pt3 = pt1.midpointTo(pt2);
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

        items.push(addPoint);
        vertex = new emp.editors.Vertex(addPoint, "add");
        this.vertices.push(vertex);
      }
    }

    // copy the coordinates into our object, so we can eventually complete
    // the edit.
    this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();

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

emp.editors.Path.prototype.startMoveControlPoint = function(featureId, pointer) {

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

      // get the midpoint between current point and previous point.
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

      // get the midpoint between current point and next point.
      frontFeature = currentVertex.next.feature;

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

  // copy the coordinates into our object, so we can eventually complete
  // the edit.
  //this.featureCopy.data.coordinates =  this.vertices.getVerticesAsLineString();

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
      lat: this.featureCopy.data.coordinates[i][1],
      lon: this.featureCopy.data.coordinates[i][0]
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
emp.editors.Path.prototype.moveControlPoint = function(featureId, pointer) {
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
    index;

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
emp.editors.Path.prototype.endMoveControlPoint = function(featureId, pointer) {
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
emp.editors.Path.prototype.moveFeature = function() {

};

/**
 * Indicates the drawing has started and the first click has
 * been made.  Respond accordingly.
 *
 * In the case of the line, we just track the first point. nothing.
 * occurs until the mouse is moved.
 */
emp.editors.Path.prototype.drawStart = function(pointer) {
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
      type: "LineString",
      coordinates: [
        [pointer.lon, pointer.lat]
      ],
      symbolCode: (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_POINT) ? undefined : this.featureCopy.symbolCode
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
emp.editors.Path.prototype.drawClick = function(pointer) {
  var coordinateUpdate,
    updateData = {},
    controlPoint,
    vertex,
    addVertex,
    items = [],
    newCoordinates,
    index,
    updateTransaction,
    midpoint,
    addPoint;

  // Verify this point is different than the last point. Otherwise ignore.
  if (this.vertices.tail.feature.data.coordinates[0] !== pointer.lon ||
    this.vertices.tail.feature.data.coordinates[1] !== pointer.lat) {

    // create a midPoint vertex.
    // find the mid point between this point and the next point.
    var pt1 = new LatLon(this.vertices.tail.feature.data.coordinates[1], this.vertices.tail.feature.data.coordinates[0]);
    var pt2 = new LatLon(pointer.lat, pointer.lon);

    // Get the mid point between this vertex and the next vertex.
    var pt3 = pt1.midpointTo(pt2);
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

    // update feature copy
    this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();

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
    for (var i = 0; i < this.featureCopy.data.coordinates.length; i++) {
      newCoordinates.push({
        lat: this.featureCopy.data.coordinates[i][1],
        lon: this.featureCopy.data.coordinates[i][0]
      });
    }

    index = this.vertices.length - 1;

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
emp.editors.Path.prototype.drawMove = function() {

};
