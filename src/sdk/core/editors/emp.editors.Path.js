/*global LatLon*/
emp.editors = emp.editors || {};

emp.editors.Path = function(args) {

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
    controlPointFeatureId,
    midpoint,
    items = [];

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
        },
        properties: {
          iconUrl: "http://localhost:3000/src/sdk/assets/images/blueHandle32.png"
        }
      });

      this.controlPoints[controlPointFeatureId] = controlPoint;
      items.push(controlPoint);
    }

    // Create mid point graphic for each point in between to add new points.

    for (i = 0; i < (length - 1); i++) {
      controlPointFeatureId = emp3.api.createGUID();

      var pt1 = new LatLon(coordinates[i][1], coordinates[i][0]);
      var pt2 = new LatLon(coordinates[i + 1][1], coordinates[i + 1][0]);

      // Get the mid point between this vertex and the next vertex.
      var pt3 = pt1.midpointTo(pt2);
      midpoint = [pt3.lon(), pt3.lat()];

      // create a feature for each of these coordinates.
      controlPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: controlPointFeatureId,
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: midpoint,
          type: 'Point'
        },
        properties: {
          iconUrl: "http://localhost:3000/src/sdk/assets/images/orangeHandle16.png"
        }
      });

      this.addPoints[controlPointFeatureId] = controlPoint;
      items.push(controlPoint);
    } // end for

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
emp.editors.Path.prototype.isControlPoint = function() {
  // there is no control points, never return true.
  return false;
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
      currentFeature.properties.iconUrl = "http://localhost:3000/src/sdk/assets/images/blueHandle32.png";

      // get the midpoint between current point and previous point.
      backFeature = currentVertex.before.feature;

      pt1 = new LatLon(backFeature.data.coordinates[0][1], backFeature.data.coordinates[0][0]);
      pt2 = new LatLon(currentFeature.data.coordinates[0][1], currentFeature.data.coordinates[0][0]);

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
          iconUrl: "http://localhost:3000/src/sdk/assets/images/orangeHandle16.png"
        }
      });

      // get the midpoint between current point and next point.
      frontFeature = currentFeature.next.feature;

      pt1 = new LatLon(currentFeature.data.coordinates[0][1], currentFeature.data.coordinates[0][0]);
      pt2 = new LatLon(frontFeature.data.coordinates[0][1], frontFeature.data.coordinates[0][0]);

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
          iconUrl: "http://localhost:3000/src/sdk/assets/images/orangeHandle16.png"
        }
      });

      // update vertices with new items.
      front = new emp.editors.Vertex(newFrontFeature, "add");
      back = new emp.editors.Vertex(newBackFeature, "add");
      this.vertices.insert(currentFeature.featureId, front);
      this.vertices.append(currentFeature.featureId, back);

      // Add the new features of items we want to send to the map.
      items.push(newFrontFeature);
      items.push(newBackFeature);

    } // end if (currentVertex.type === add);

    // Add our updated feature onto the items we will be updating in our
    // transaction.
    items.push(currentFeature);

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
    items =[],
    pt1,
    pt2,
    pt3,
    midpoint;

  // First update the control point with new pointer info.
  currentVertex = this.vertices.find(featureId);
  currentFeature = currentVertex.feature;
  currentFeature.data.coordinates = [pointer.lon, pointer.lat];
  // the updated feature to the list of items to be updated.
  items.push(currentFeature);

  // now that this point moved, we need to update the points directly to the leaflet
  // and right of this feature.
  back = currentVertex.behind;
  front = currentVertex.next;

  // Make sure that we are not moving the head.  If we are, skip.
  if (back !== null) {
    backFeature = back.feature;

    // get the new location of the backFeature
    pt1 = new LatLon(backFeature.data.coordinates[0][1], backFeature.data.coordinates[0][0]);
    pt2 = new LatLon(currentFeature.data.coordinates[0][1], currentFeature.data.coordinates[0][0]);

    // Get the mid point between this vertex and the next vertex.
    pt3 = pt1.midpointTo(pt2);
    midpoint = [pt3.lon(), pt3.lat()];

    backFeature.midpoint.data.coordinates = midpoint;

    items.push(backFeature);

  }

  // Make sure that we are not moving the tail.  If we are skip.
  if (front !== null) {
    frontFeature = front.feature;
    // get the new location of the frontFeature.
    pt1 = new LatLon(currentFeature.data.coordinates[0][1], currentFeature.data.coordinates[0][0]);
    pt2 = new LatLon(frontFeature.data.coordinates[0][1], frontFeature.data.coordinates[0][0]);

    // Get the mid point between this vertex and the next vertex.
    pt3 = pt1.midpointTo(pt2);
    midpoint = [pt3.lon(), pt3.lat()];

    frontFeature.midpoint.data.coordinates = midpoint;

    items.push(frontFeature);
  }

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
 * Moves the entire feature, offsetting from the starting position.
 */
emp.editors.Path.prototype.moveFeature = function() {

};
