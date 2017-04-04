/*global*/
emp.editors = emp.editors || {};

emp.editors.Ellipse = function(args) {
  this.animation = undefined;
  this.radius = undefined;
  this.center = undefined;
  emp.editors.EditorBase.call(this, args);
};

emp.editors.Ellipse.prototype = Object.create(emp.editors.EditorBase.prototype);
emp.editors.Ellipse.prototype.constructor = emp.editors.Ellipse;

/**
 * Adds the control points to the map for an edit or a draw.
 */
emp.editors.Ellipse.prototype.addControlPoints = function() {

  var controlPoint,
    transaction,
    items = [],
    vertex,
    addPoint,
    newPoint,
    radiusVertex,
    distance,
    x, y;


  x = this.featureCopy.data.coordinates[0];
  y = this.featureCopy.data.coordinates[1];


  // Create a feature on the map for the center of the ellipse.
  controlPoint = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    data: {
      coordinates: [x, y],
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

  // Create a vertex.  This is so the editingManager knows that
  // the center point is a control point and not the radius.
  vertex = new emp.editors.Vertex(controlPoint, "vertex");
  this.vertices.push(vertex);
  this.center = vertex;
  items.push(controlPoint);

  // Create a radius control point.
  distance = this.featureCopy.properties.radius;


  // project out the radius right above the center point of the ellipse.
  newPoint = emp.geoLibrary.geodesic_coordinate({
    x: x,
    y: y
  }, distance, 0);

  // create a feature for each of these coordinates.  This
  // will be our radius control point that is displayed by the map.
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

};

/**
 * Begins the movement of a control point.  
 */
emp.editors.Ellipse.prototype.startMoveControlPoint = function(featureId, pointer) {

  var currentFeature,
    currentVertex,
    items = [],
    distance,
    index,
    coordinateUpdate,
    updateData = {},
    type = emp.typeLibrary.CoordinateUpdateType.UPDATE,
    newCoordinates,
    newRadiusPosition,
    x, y;


  x = this.featureCopy.data.coordinates[0];
  y = this.featureCopy.data.coordinates[1];


  currentVertex = this.vertices.find(featureId);
  currentFeature = currentVertex.feature;

  // If the control point being moved is the radius control point,
  // calculate the new radius.  Calculate the new position of where
  // we want the control point to be.
  if (featureId === this.radius.feature.featureId){

    // measure the distance between the mouse location and the center.  This
    // will be the new radius.
    distance = emp.geoLibrary.measureDistance(pointer.lat,
      pointer.lon,
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    // retrieve the new radius vertex.   It will sit directly above our center point.
    newRadiusPosition = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, distance, 0);
    // First update the control point with new pointer info.
    currentFeature.data.coordinates = [newRadiusPosition.x, newRadiusPosition.y];


    this.featureCopy.properties.radius = distance;

  } else {
    // If we are updating the center point, we need to move the center vertex
    // to a new location and we need to update the vertex of the radius location.
    if (this.featureCopy.data.type === 'Point') {
      this.featureCopy.data.coordinates = [pointer.lon, pointer.lat];
    } else if (this.featureCopy.data.type === 'LineString') {
      this.featureCopy.data.coordinates = [[pointer.lon, pointer.lat]];
    }

    // First update the control point with new pointer info.
    currentFeature.data.coordinates = [pointer.lon, pointer.lat];

    // retrieve our distance from the existing ellipse.  We will use this to Calculate
    // the position of the new radius vertex.
    distance = this.featureCopy.properties.radius;


    // retrieve the new radius vertex.   It will sit directly above our center point.
    newRadiusPosition = emp.geoLibrary.geodesic_coordinate({
      x: pointer.lon,
      y: pointer.lat
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
  newCoordinates.push({
    lat: y,
    lon: x
  });

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
emp.editors.Ellipse.prototype.moveControlPoint = function(featureId, pointer) {
  // startMoveControlPoint does everything we need to do.
  return this.startMoveControlPoint(featureId, pointer);
};

/**
 * Moves control point passed in to the new location provided.
 * Also updates the control point and the feature with the change.
 */
emp.editors.Ellipse.prototype.endMoveControlPoint = function(featureId, pointer) {
  // startMoveControlPoint does everything we need to do.
  return this.startMoveControlPoint(featureId, pointer);
};

/**
 * Moves the entire feature, offsetting from the starting position.
 */
emp.editors.Ellipse.prototype.moveFeature = function() {
  // do not do anything here.  We do not want to let users move the feature.
};
