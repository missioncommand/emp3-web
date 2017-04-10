/*global LatLon*/
emp.editors = emp.editors || {};

emp.editors.AxisOfAdvance = function(args) {
  //this.animation = undefined;
  this.arrowDistance = undefined; // contains the orthogonal distance from the
                                  // arrow head base edge to the line between
                                  // the first and second points.
  this.arrowDepth = undefined; // contains the distance of the orthogonal
                              // projection of the arrow head base edge to the
                              // line between the first and second points.
  emp.editors.EditorBase.call(this, args);

  this.calculateArrowDistance = function () {
    var firstPoint,
      secondPoint,
      lastPoint,
      v1Magnitude,
      v3Magnitude,
      part1,
      v1x, v1y, v2x, v2y, v3x, v3y,
      angle,
      projectedPosition,
      distance;
    // calculate the distance between the last point orthognal projection onto
    // the vector created
    // by the first and second point.  We need to maintain and store this distance.

    firstPoint = this.vertices.head.feature;
    secondPoint = this.vertices.head.next.next.feature;
    lastPoint = this.vertices.tail.feature;
    // calculate the distance for the first and second point. This is the magnitude
    // of the vector.
    v1Magnitude = emp.geoLibrary.measureDistance(
      firstPoint.data.coordinates[1],
      firstPoint.data.coordinates[0],
      secondPoint.data.coordinates[1],
      secondPoint.data.coordinates[0], "meters");
    v1x = emp.geoLibrary.measureDistance(
      firstPoint.data.coordinates[1],
      firstPoint.data.coordinates[0],
      firstPoint.data.coordinates[1],
      secondPoint.data.coordinates[0], "meters");
    v1y = emp.geoLibrary.measureDistance(
      firstPoint.data.coordinates[1],
      firstPoint.data.coordinates[0],
      secondPoint.data.coordinates[1],
      firstPoint.data.coordinates[0], "meters");
    v2x = emp.geoLibrary.measureDistance(
      firstPoint.data.coordinates[1],
      firstPoint.data.coordinates[0],
      firstPoint.data.coordinates[1],
      lastPoint.data.coordinates[0], "meters");
    v2y = emp.geoLibrary.measureDistance(
      firstPoint.data.coordinates[1],
      firstPoint.data.coordinates[0],
      lastPoint.data.coordinates[1],
      firstPoint.data.coordinates[0], "meters");

    // calculate the angle of the vector between the first and second point.
    angle = (Math.asin(v1y/v1Magnitude) * 180 / Math.PI);

    if (angle > 180) {
      angle = angle - 360;
    } else if (angle < -180) {
      angle = angle + 360;
    }

    if (secondPoint.data.coordinates[1] >= firstPoint.data.coordinates[1] &&
        secondPoint.data.coordinates[0] >= firstPoint.data.coordinates[0]) {
      angle = 90 - angle;
    } else if (secondPoint.data.coordinates[1] >= firstPoint.data.coordinates[1] &&
        secondPoint.data.coordinates[0] < firstPoint.data.coordinates[0]) {
      angle = angle - 90;
    } else if (secondPoint.data.coordinates[1] <= firstPoint.data.coordinates[1] &&
        secondPoint.data.coordinates[0] <= firstPoint.data.coordinates[0]) {
      angle = -90 - angle;
    } else if (secondPoint.data.coordinates[1] < firstPoint.data.coordinates[1] &&
        secondPoint.data.coordinates[0] > firstPoint.data.coordinates[0]) {
      angle = angle + 90;
    }

    // calculate the projected vector from the first and last point onto the
    // the vector from the first and second point.  This will give us the
    // point to calculate the new last point.
    // orthogonal projection onto a line
    // ([v1 v2] * [s1 s2] / [s1 s2] * [s1 s2]) * [s1 s2]
    part1 = ((v1x * v2x) + (v1y * v2y)) / ((v1x * v1x) + (v1y * v1y));
    v3x = part1 * v1x;
    v3y = part1 * v1y;
    v3Magnitude = Math.sqrt((v3x * v3x) + (v3y * v3y));

    // calculate the lat/lon of this projected point.
    projectedPosition = emp.geoLibrary.geodesic_coordinate({
      x: firstPoint.data.coordinates[0],
      y: firstPoint.data.coordinates[1]
    }, v3Magnitude, angle);

    // get the distance between the projected point and the
    // last point.
    distance = emp.geoLibrary.measureDistance(
      projectedPosition.y,
      projectedPosition.x,
      lastPoint.data.coordinates[1],
      lastPoint.data.coordinates[0], "meters");

    this.arrowDistance = distance;
    this.arrowDepth = v3Magnitude;
  };

  /**
   * Calculates the new position of the arrowhead point (the last point)
   * based on the arrowDistance and arrowDepth properties.
   */
  this.calculateArrowHeadPosition = function() {
    // First calculate the angle at which we the first and second points are
    // at.
    var firstPoint,
      secondPoint,
      angle,
      v1Magnitude,
      v1y,
      newAngle;

    firstPoint = this.featureCopy.data.coordinates[0];
    secondPoint = this.featureCopy.data.coordinates[1];
    v1Magnitude = emp.geoLibrary.measureDistance(
      firstPoint[1],
      firstPoint[0],
      secondPoint[1],
      secondPoint[0], "meters");
    v1y = emp.geoLibrary.measureDistance(
      firstPoint[1],
      firstPoint[0],
      secondPoint[1],
      firstPoint[0], "meters");

    angle = (Math.asin(v1y/v1Magnitude) * 180 / Math.PI);

    if (angle > 180) {
      angle = angle - 360;
    } else if (angle < -180) {
      angle = angle + 360;
    }
    // determine the quadrant to correctly calculate the azimuth.
    if (secondPoint[1] >= firstPoint[1] &&
        secondPoint[0] >= firstPoint[0]) {
      angle = 90 - angle;
    } else if (secondPoint[1] >= firstPoint[1] &&
        secondPoint[0] < firstPoint[0]) {
      angle = angle - 90;
    } else if (secondPoint[1] <= firstPoint[1] &&
        secondPoint[0] <= firstPoint[0]) {
      angle = -90 - angle;
    } else if (secondPoint[1] < firstPoint[1] &&
        secondPoint[0] > firstPoint[0]) {
      angle = angle + 90;
    }
    newAngle = angle - 90;

    // Calculate the projected point on the line where we should begin
    var arrowDepthPosition = emp.geoLibrary.geodesic_coordinate({
      x: firstPoint[0],
      y: firstPoint[1]
    }, this.arrowDepth, angle);

    var arrowPosition = emp.geoLibrary.geodesic_coordinate({
      x: arrowDepthPosition.x,
      y: arrowDepthPosition.y
    }, this.arrowDistance, newAngle);

    this.vertices.tail.feature.data.coordinates = [arrowPosition.x, arrowPosition.y];
    this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();
  };
};

emp.editors.AxisOfAdvance.prototype = Object.create(emp.editors.EditorBase.prototype);
emp.editors.AxisOfAdvance.prototype.constructor = emp.editors.AxisOfAdvance;

/**
 * Adds the control points to the map for an edit or a draw.
 */
emp.editors.AxisOfAdvance.prototype.addControlPoints = function() {
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

      if (i !== (length - 1)) {
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
      }
      else {
        // If it is the last point this is the width point.  Make it look
        // slightly different.
        controlPoint = new emp.typeLibrary.Feature({
          overlayId: "vertices",
          featureId: emp3.api.createGUID(),
          format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
          data: {
            coordinates: coordinates[i],
            type: 'Point'
          },
          properties: {
            iconUrl: emp.ui.images.rotationPoint,
            iconXOffset: 12,
            iconYOffset: 12,
            xUnits: "pixels",
            yUnits: "pixels",
            altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
          }
        });
      }

      vertex = new emp.editors.Vertex(controlPoint, "vertex");
      this.vertices.push(vertex);
      items.push(controlPoint);

      // If there is another point to add, we need to add an "add" controlPoint
      if (i < length - 2) {

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

    // calculate the arrowDepth and arrowDistance.

    transaction.run();

    this.calculateArrowDistance();
  } // end if

  this.calculateEndPoint = function() {

  };
};


emp.editors.AxisOfAdvance.prototype.startMoveControlPoint = function(featureId, pointer) {

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
    newCoordinates;

  currentVertex = this.vertices.find(featureId);
  // Get the position of this vertex if it exists.
  index = this.vertices.getIndex(featureId);

  if (currentVertex) {
    // Get the feature that is associated with this vertex.
    currentFeature = currentVertex.feature;

    if (index === 0 || index === 1) {
      // First update the control point with new pointer info.
      currentFeature.data.coordinates = [pointer.lon, pointer.lat];

      // calculate the distance between the last point orthognal projection onto
      // the vector created
      // by the first and second point.  We need to maintain and store this distance.
      this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();
      this.calculateArrowHeadPosition();
      // Make sure the last vertex is updated as it will have moved after the
      // arrowhead was calculated.
      items.push(this.vertices.tail.feature);
    } else {
      currentFeature.data.coordinates = [pointer.lon, pointer.lat];
    }

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

    // update the feature so it can animate.
    this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();

    // Add the vertex along with the copy of the feature so they can animate.
    items.push(currentFeature);
    items.push(this.featureCopy);

  } //end if (currentVertex)

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
emp.editors.AxisOfAdvance.prototype.moveControlPoint = function(featureId, pointer) {
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
    index;

  // Get the feature that is associated with this vertex.
  currentVertex = this.vertices.find(featureId);
  currentFeature = currentVertex.feature;
  items.push(this.featureCopy);
  items.push(currentFeature);

  // Get the position of this vertex.
  index = this.vertices.getIndex(featureId);

  // if this is the last point in the feature, we do not want it to go past
  // certain boundaries.
  if (index === 0 || index === 1) {
    // First update the control point with new pointer info.
    currentFeature.data.coordinates = [pointer.lon, pointer.lat];

    // calculate the distance between the last point orthognal projection onto
    // the vector created
    // by the first and second point.  We need to maintain and store this distance.
    this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();
    this.calculateArrowHeadPosition();
    // Make sure the last vertex is updated as it will have moved after the
    // arrowhead was calculated.
    items.push(this.vertices.tail.feature);
  } else {
    currentFeature.data.coordinates = [pointer.lon, pointer.lat];
  }

  // now that this point moved, we need to update the points directly to the left
  // and right of this feature.
  back = currentVertex.before;
  front = currentVertex.next;

  // Check to make sure we do not need to move any of the add vertices.
  //
  // You will not have to move add vertices if you are at the head, the tail.
  // This is because those points do not have add points prior (for head) or
  // after (for tail) them.
  //
  // If this is the first point, we do not have to worry about the point in
  // front of it, because there is none.
  if (back !== null && front !== null) {
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
  if (front !== null && front.next !== null) {
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
emp.editors.AxisOfAdvance.prototype.endMoveControlPoint = function(featureId, pointer) {
  var updateData;
  var index;

  // Get the position of this vertex.
  index = this.vertices.getIndex(featureId);

  // peform the move like normal,
  updateData = this.moveControlPoint(featureId, pointer);

  // if this is the last point in the feature, we need to get the new WIDTH
  // and height of the arrow.
  if (index === this.vertices.vertexLength - 1) {
    this.calculateArrowDistance();
  }

  return updateData;
};
