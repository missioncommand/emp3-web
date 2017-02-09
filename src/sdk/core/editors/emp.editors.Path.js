/*global LatLon*/
emp.editors = emp.editors || {};

emp.editors.Path = function(args) {
  this.path = undefined;
  emp.editors.EditorBase.call(this, args);
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
          iconUrl: emp.ui.images.editPoint
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
            iconUrl: emp.ui.images.addPoint
          }
        });

        items.push(addPoint);
        vertex = new emp.editors.Vertex(addPoint, "add");
        this.vertices.push(vertex);
      }
    }

    // Create a line graphic to replace the line that exists.  We do this for the
    // sake of MIL-STD symbols which may take a long time to draw.
    // create a feature for each of these coordinates.  This
    // will be our 'add point'
    this.path = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_PATH,
      data: {
        coordinates: this.vertices.getVerticesAsLineString(),
        type: 'LineString'
      }
    });

    items.push(this.path);

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

emp.editors.Path.prototype.removeControlPoints = function() {
  // do nothing

};

/**
 * Determine if the featureId is a controlPoint or if it is a feature.
 * This is useful for determining if a featureDrag event should be staticContent
 * out or not.
 */
emp.editors.Path.prototype.isControlPoint = function(featureId) {

  var result = false;

  // Return true if we found the id.
  if (this.vertices.find(featureId)) {
    result = true;
  }

  return result;
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
    midpoint;

  currentVertex = this.vertices.find(featureId);

  if (currentVertex) {
    // First update the control point with new pointer info.
    currentFeature = currentVertex.feature;
    currentFeature.data.coordinates = [pointer.lon, pointer.lat];

    // If this is an add point we are moving, we need to create new vertices.
    if (currentVertex.type === 'add') {
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
          iconUrl: emp.ui.images.addPoint
        }
      });

      // get the midpoint between current point and next point.
      frontFeature = currentVertex.next.feature;

      pt1 = new LatLon(currentFeature.data.coordinates[1], currentFeature.data.coordinates[0]);
      pt2 = new LatLon(frontFeature.data.coordinates[1], frontFeature.data.coordinates[0][0]);

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
          iconUrl: emp.ui.images.addPoint
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

  // update the line with the current vertices.
  // Create a line graphic to replace the line that exists.  We do this for the
  // sake of MIL-STD symbols which may take a long time to draw.
  // create a feature for each of these coordinates.  This
  // will be our 'add point'
  this.path.data.coordinates = this.vertices.getVerticesAsLineString();

  items.push(this.path);



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
    items =[],
    pt1,
    pt2,
    pt3,
    midpoint,
    newCoordinates,
    coordinateUpdate,
    updateData = {};

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

  // update the line with the current vertices.
  this.path.data.coordinates = this.vertices.getVerticesAsLineString();

  items.push(this.path);

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
  newCoordinates = [{
    lat: pointer.lat,
    lon: pointer.lon
  }];

  coordinateUpdate = {
      type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
      indices: [0], //TODO: Get the correct index.
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
