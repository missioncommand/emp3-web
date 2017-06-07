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

  this.getUpdateData = function() {
    var newCoordinates = [],
      i,
      index,
      length,
      coordinates,
      coordinateUpdate,
      updateData = {};

    // Normalize the coordinates so we can handle them the same.
    if (this.featureCopy.data.type === 'Point') {
      length = 1;
      coordinates = [this.featureCopy.data.coordinates];
    } else if (this.featureCopy.data.type === 'LineString') {
      length = this.featureCopy.data.coordinates.length;
      coordinates = this.featureCopy.data.coordinates;
    } else if (this.featureCopy.data.type === 'Polygon') {
      length = this.featureCopy.data.coordinates[0].length;
      coordinates = this.featureCopy.data.coordinates[0];
    }

    // Reformat the coordinates so that they are in the proper format.
    for (i = 0; i < length; i++) {
      newCoordinates.push({
        lat: coordinates[i][1],
        lon: coordinates[i][0]
      });
    }

    // By default we will say the index that is changed is the last one in the list.
    index = this.vertices.vertexLength - 1;

    // prepare the coordinate update parameter with the list.
    coordinateUpdate = {
      type: emp.typeLibrary.CoordinateUpdateType.ADD,
      indices: [index],
      coordinates: newCoordinates
    };

    updateData.coordinateUpdate = coordinateUpdate;
    updateData.properties = this.featureCopy.properties;

    return updateData;
  };

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
    items = [],
    vertex;

  // Normalize the coordinates so we can handle them the same.
  if (this.featureCopy.data.type === 'Point') {
    length = 1;
    coordinates = [this.featureCopy.data.coordinates];
  } else if (this.featureCopy.data.type === 'LineString') {
    length = this.featureCopy.data.coordinates.length;
    coordinates = this.featureCopy.data.coordinates;
  } else if (this.featureCopy.data.type === 'Polygon') {
    length = this.featureCopy.data.coordinates[0].length;
    coordinates = this.featureCopy.data.coordinates[0];
  }

  // Create a feature on the map for each vertex.
  for (i = 0; i < length; i++) {

    // create a feature for each of these coordinates.
    // This feature will be added to the map as a control point.
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
        iconXOffset: 10,
        iconYOffset: 10,
        xUnits: "pixels",
        yUnits: "pixels",
        altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
      }
    });

    // create a vertex entry for each feature.  These are all control points.
    vertex = new emp.editors.Vertex(controlPoint, "vertex");
    this.vertices.push(vertex);
    items.push(controlPoint);
  }

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
};

/**
 * Removes control points added by the addControlPoints method from
 * the map.  This usually occurs at the end of and edit in response
 * to a cancel or a complete.
 */
emp.editors.EditorBase.prototype.removeControlPoints = function() {
  // do nothing
  var transaction;
  var items;
  var vertices = this.vertices.getFeatures();
  items = vertices;

  transaction = new emp.typeLibrary.Transaction({
    intent: emp.intents.control.FEATURE_REMOVE,
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
 * Determine if the featureId is a control point or if it is a feature.  control
 * points are the points that alter a feature during an edit.   Control points
 * are added during the initial addControlPoints call.
 * <p>
 * This is useful for determining if a featureDrag event should occur.
 *
 * @return boolean Returns true if the feature passed in is a control point.
 *
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
 *
 * @return Returns true only if the featureId that is passed in is the
 * feature that is beging edited.
 */
emp.editors.EditorBase.prototype.isFeature = function(featureId) {
  var result = false;

  if (this.featureCopy.featureId === featureId) {
    result = true;
  }

  return result;
};

/**
 * @typedef {Object} CoreEditUpdateData An object that attempts to describe
 * the change that occurred when a control point moved during an edit.
 *
 * @property {coordinateUpdate} coordinateUpdate - Contains the information
 * about the index of the coordinate that was modified, the type of modification,
 * and the new coordinates.
 * @property {properties} properties - Contains the new properties object that
 * may contain additional important changes that may modify the symbol.
 */

/**
 * Occurs first when the control point is moved.  This method is called prior
 * to moveControlPoint.  It allows us to initialize the
 * behavior of what happens prior to the move.
 *
 * @return {CoreEditUpdataData} Contains information about the changes that
 * occurred during the movement of a control point.
 */
emp.editors.EditorBase.prototype.startMoveControlPoint = function(featureId, pointer) {

  var index,
    newCoordinates,
    coordinateUpdate,
    updateData = {},
    items = [],
    coordinates;

  // for the base implementation, just move the control point.

  // Grab the actual feature associated with this control point featureId.
  var newFeature = this.vertices.findFeature(featureId);

  // assign the control point the new coordinates.
  newFeature.data.coordinates = [pointer.lon, pointer.lat];

  // make it one of the items that needs to be updated.
  items.push(newFeature);

  // update the actual feature that is being edited.
  // Normalize the coordinates so we can handle them the same.
  if (this.featureCopy.data.type === 'Point') {
    this.featureCopy.data.coordinates = [pointer.lon, pointer.lat];
  } else if (this.featureCopy.data.type === 'LineString') {
    this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();
  } else if (this.featureCopy.data.type === 'Polygon') {
    this.featureCopy.data.coordinates = this.vertices.getVerticesAsPolygon();
  }

  items.push(this.featureCopy);

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
    items: items
  });

  transaction.run();

  // Now send back the information to the editingManager that will
  // help with generating some events.
  index = this.vertices.getIndex(featureId);
  newCoordinates = [];

  // Normalize the coordinates so we can handle them the same.
  if (this.featureCopy.data.type === 'Point') {
    coordinates = [this.featureCopy.data.coordinates];
  } else if (this.featureCopy.data.type === 'LineString') {
    length = this.featureCopy.data.coordinates.length;
    coordinates = this.featureCopy.data.coordinates;
  } else if (this.featureCopy.data.type === 'Polygon') {
    length = this.featureCopy.data.coordinates[0].length;
    coordinates = this.featureCopy.data.coordinates[0];
  }

  for (var i = 0; i < coordinates.length; i++) {
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
 * Moves control point passed in to the new location provided.
 * Also updates the control point and the feature with the change.
 *
 * @return {CoreEditUpdataData} Contains information about the changes that
 * occurred during the movement of a control point.
 */
emp.editors.EditorBase.prototype.moveControlPoint = function(featureId, pointer) {
  return this.startMoveControlPoint(featureId, pointer);
};


/**
 * Occurs after the control point has finished being moved.
 *
 * @return {CoreEditUpdataData} Contains information about the changes that
 * occurred during the movement of a control point.
 */
emp.editors.EditorBase.prototype.endMoveControlPoint = function(featureId, pointer) {
  return this.startMoveControlPoint(featureId, pointer);
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

/**
 * Occurs when the map is clicked for the frist time after the draw has started.
 */
emp.editors.EditorBase.prototype.drawStart = function(/*pointer*/) {
  // do nothing
};

/**
 * Occurs when the map is clicked after the draw has started.
 */
emp.editors.EditorBase.prototype.drawClick = function(/*pointer*/) {
  // do nothing
};

/**
 * Occurs after the draw has started and user is moving mouse.
 * Animation should occur here.
 */
emp.editors.EditorBase.prototype.drawMove = function(/*pointer*/) {

};

/**
 * Occurs when the a control  is double clicked after the draw has started.
 */
emp.editors.EditorBase.prototype.drawDoubleClick = function(/*pointer*/) {

    // var coordinateUpdate,
    //   updateData,
    //   items = [],
    //   updateTransaction,
    //   index,
    //   newCoordinates,
    //   i, currentVertex, previousVertex, NextVertex;
    //
    // if (pointer.target.toLowerCase() === "feature" && this.vertices.vertexLength > 3) {
    //   // check if control point was clicked
    //   currentVertex = this.vertices.find(pointer.featureId);
    //   if (currentVertex && currentVertex.type === "vertex") {
    //     index = this.vertices.getIndex(pointer.featureId);
    //     if (this.vertices.head.feature.featureId === currentVertex.feature.featureId)
    //     {
    //       //it is update vertex head
    //       items.push(this.vertices.tail.feature);
    //       previousVertex = this.vertices.tail.before;
    //       NextVertex = currentVertex.next.next;
    //     }
    //     else if (this.vertices.tail.before.feature.featureId === currentVertex.feature.featureId)
    //     {
    //       //it is the last update vertex
    //       items.push(currentVertex.before.feature);
    //       previousVertex = currentVertex.before.before;
    //       NextVertex = this.vertices.head;
    //     }
    //     else
    //     {
    //       // update vertex in between first and last.
    //       items.push(currentVertex.before.feature);
    //       previousVertex = currentVertex.before.before;
    //       NextVertex = currentVertex.next.next;
    //     }
    //
    //     items.push(currentVertex.next.feature);
    //     items.push(currentVertex.feature);
    //
    //     //removes selected update vertex and the 2 add vertex close to it for a total of 3 verteces.
    //     var beforeVertexFeatureId = (currentVertex.before !== null)?currentVertex.before.feature.featureId:this.vertices.tail.feature.featureId;
    //     var nextVertexFeatureId = currentVertex.next.feature.featureId; //(currentVertex.next !== null)?currentVertex.next.feature.featureId:undefined;
    //     this.vertices.remove(beforeVertexFeatureId);
    //     this.vertices.remove(nextVertexFeatureId);
    //     this.vertices.remove(currentVertex.feature.featureId);
    //
    //     var removeTransaction = new emp.typeLibrary.Transaction({
    //       intent: emp.intents.control.FEATURE_REMOVE,
    //       mapInstanceId: this.mapInstance.mapInstanceId,
    //       transactionId: null,
    //       sender: this.mapInstance.mapInstanceId,
    //       originChannel: cmapi.channel.names.MAP_FEATURE_UNPLOT,
    //       source: emp.api.cmapi.SOURCE,
    //       messageOriginator: this.mapInstance.mapInstanceId,
    //       originalMessageType: cmapi.channel.names.MAP_FEATURE_UNPLOT,
    //       items: items
    //     });
    //
    //     //remove selected vertex and 2 add verteces from engine.
    //     removeTransaction.run();
    //
    //     items = [];
    //     //find the mid point between this point and the next point.
    //     var pt1 = new LatLon(previousVertex.feature.data.coordinates[1],
    //       previousVertex.feature.data.coordinates[0]);
    //     var pt2 = new LatLon(NextVertex.feature.data.coordinates[1], NextVertex.feature.data.coordinates[0]);
    //
    //     //Get the mid point between this vertex and the first vertex.
    //     var pt3 = pt1.midpointTo(pt2);
    //     var midpoint = [pt3.lon(), pt3.lat()];
    //     //     // create a feature
    //     var addPoint = new emp.typeLibrary.Feature({
    //       overlayId: "vertices",
    //       featureId: emp3.api.createGUID(),
    //       format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    //       data: {
    //         coordinates: midpoint,
    //         type: 'Point'
    //       },
    //       properties: {
    //         iconUrl: emp.ui.images.addPoint,
    //         iconXOffset: 6,
    //         iconYOffset: 6,
    //         xUnits: "pixels",
    //         yUnits: "pixels",
    //         altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
    //       }
    //     });
    //     //create new vertex.
    //     var addVertex = new emp.editors.Vertex(addPoint, "add");
    //     this.vertices.append(previousVertex.feature.featureId, addVertex);
    //     items.push(addPoint);
    //     // update feature copy
    //     this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();
    //     // update line
    //     items.push(this.featureCopy);
    //
    //     updateTransaction = new emp.typeLibrary.Transaction({
    //       intent: emp.intents.control.FEATURE_ADD,
    //       mapInstanceId: this.mapInstance.mapInstanceId,
    //       transactionId: null,
    //       sender: this.mapInstance.mapInstanceId,
    //       originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
    //       source: emp.api.cmapi.SOURCE,
    //       messageOriginator: this.mapInstance.mapInstanceId,
    //       originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
    //       items: items
    //     });
    //
    //     updateTransaction.run();
    //
    //
    //     // return updateData
    //     // Create the return object.  This will tell you which index was added,
    //     // the locations of the new indices, and the type of change it was.
    //     //
    //     // The coordinates will be formatted slightly different it is a GEO_MIL_SYMBOL.
    //     // We need to first account for that.
    //     newCoordinates = [];
    //
    //     for (i = 0; i < this.featureCopy.data.coordinates.length; i++) {
    //       newCoordinates.push({
    //         lat: this.featureCopy.data.coordinates[i][1],
    //         lon: this.featureCopy.data.coordinates[i][0]
    //       });
    //     }
    //
    //
    //     //index = this.vertices.vertexLength - 1;
    //
    //     coordinateUpdate = {
    //       type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
    //       indices: [index],//currentVertexIndex is the vertex that was removed
    //       coordinates: newCoordinates
    //     };
    //
    //     updateData = {};
    //     updateData.coordinateUpdate = coordinateUpdate;
    //     updateData.properties = this.featureCopy.properties;
    //
    //   }//   if (currentVertex && currentVertex.type === "vertex")
    // }// if (pointer.target.toLowerCase() === "feature" && this.vertices.vertexLength > 3) {
    //
    //
    // return updateData;
  };
