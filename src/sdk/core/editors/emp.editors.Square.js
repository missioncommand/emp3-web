/*global*/
emp.editors = emp.editors || {};

emp.editors.Square = function(args) {
  this.width = undefined; // store the Vertex object for the width point
  this.azimuth = undefined; // stores the Vertex object for the azimuth rotation point.
  this.center = undefined; // stores the center Vertex.

  // inherit from the base class.
  emp.editors.EditorBase.call(this, args);
};

emp.editors.Square.prototype = Object.create(emp.editors.EditorBase.prototype);
emp.editors.Square.prototype.constructor = emp.editors.Square;

/**
 * Adds the control points to the map for an edit or a draw.
 */
emp.editors.Square.prototype.addControlPoints = function() {

  var controlPoint,
    transaction,
    items = [],
    vertex,
    width,
    azimuth,
    widthPoint,
    azimuthPoint,
    widthVertex,
    azimuthVertex,
    widthFeature,
    azimuthFeature,
    x, y;

  // We have an issue in that GEO_SQUARE uses GeoJSON Point
  x = this.featureCopy.data.coordinates[0];
  y = this.featureCopy.data.coordinates[1];


  // Create a feature on the map for the center of the square.  This is
  // the center vertex.
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
      iconXOffset: 10,
      iconYOffset: 10,
      xUnits: "pixels",
      yUnits: "pixels",
      altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
    }
  });

  // Create a vertex for our one and only control point.  The Vertices object
  // lets the editing manager know if the Vertex is a control point or not
  // so it is necessary.
  vertex = new emp.editors.Vertex(controlPoint, "vertex");
  this.vertices.push(vertex);
  this.center = vertex;
  items.push(controlPoint);

  // get the width, height, and azimuth for our calculations.
  width = this.featureCopy.properties.width;
  azimuth = this.featureCopy.properties.azimuth;

  // get the position of the point that controls the width of the feature.
  widthPoint = emp.geoLibrary.geodesic_coordinate({
    x: x,
    y: y
  }, width / 2, azimuth);


  // place the azimuth point to the left of the width point.   No reason
  // why, it just looks nice there.
  azimuthPoint = emp.geoLibrary.geodesic_coordinate({
    x: x,
    y: y
  }, width / 2, -90 + azimuth);

  // create a feature for each of these points.  This
  // will be our 'add points' in the Vertices.   We keep
  // a reference to these Vertex objects in our code.
  widthFeature = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    data: {
      coordinates: [widthPoint.x, widthPoint.y],
      type: 'Point'
    },
    properties: {
      iconUrl: emp.ui.images.distancePoint,
      iconXOffset: 10,
      iconYOffset: 10,
      xUnits: "pixels",
      yUnits: "pixels",
      altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
    }
  });

  azimuthFeature = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    data: {
      coordinates: [azimuthPoint.x, azimuthPoint.y],
      type: 'Point'
    },
    properties: {
      iconUrl: emp.ui.images.rotationPoint,
      iconXOffset: 10,
      iconYOffset: 10,
      xUnits: "pixels",
      yUnits: "pixels",
      altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
    }
  });

  items.push(widthFeature);
  items.push(azimuthFeature);

  // add these new Vertex objects into our Vertices collection.
  // Remember Vertices allows editingManager to tell the difference
  // between control points and special points.
  widthVertex = new emp.editors.Vertex(widthFeature, "add");
  azimuthVertex = new emp.editors.Vertex(azimuthFeature, "add");

  this.width = widthVertex;
  this.azimuth = azimuthVertex;

  this.vertices.push(widthVertex);
  this.vertices.push(azimuthVertex);


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
 * Occurs first when one of the control points is dragged.
 */
emp.editors.Square.prototype.startMoveControlPoint = function(featureId, pointer) {

  var currentFeature,
    currentVertex,
    items = [],
    widthDistance,
    index,
    coordinateUpdate,
    updateData = {},
    type = emp.typeLibrary.CoordinateUpdateType.UPDATE,
    newCoordinates,
    newWidthPosition,
    newAzimuthPosition,
    azimuth,
    o,a,h,
    newAzimuth,
    delta,
    distance,
    x, y;

  // Normal GEO_SQUARE will use GeoJSON type "Point",
  x = this.featureCopy.data.coordinates[0];
  y = this.featureCopy.data.coordinates[1];


  // Find the vertex in our vertices collection and retrieve the feature.
  currentVertex = this.vertices.find(featureId);
  currentFeature = currentVertex.feature;

  // get the old azimuth.
  azimuth = this.featureCopy.properties.azimuth;

  // Determine which control point was moved and react appropriately.
  // Because this is a square we only want to display and update the height control point
  if (featureId === this.width.feature.featureId) {

    // calculate the new width.
    currentFeature.data.coordinates = [pointer.lon, pointer.lat];
    widthDistance = emp.geoLibrary.measureDistance(this.width.feature.data.coordinates[1],
      this.width.feature.data.coordinates[0],
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    // store the new height in the feature.
    this.featureCopy.properties.width = widthDistance * 2;


    // Calculate the position of the new height control point.
    newWidthPosition = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, widthDistance, azimuth);

    // Update the control point position.
    currentFeature.data.coordinates = [newWidthPosition.x, newWidthPosition.y];

    newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, widthDistance, -90 + azimuth);

    // update the control points.
    this.azimuth.feature.data.coordinates = [newAzimuthPosition.x, newAzimuthPosition.y];

    items.push(this.azimuth.feature);
  } else if (featureId === this.azimuth.feature.featureId) {
    // the rotation vertex was dragged.
    // get the new azimuth from the center to the current mouse position.  that
    // will determine the new vertex.

    //  asin(o/h) will return the angle in radians of a right sided triangle.
    o = pointer.lat - y;
    a = pointer.lon - x;
    h = Math.sqrt(o*o + a*a);

    // get the angle but convert to radians.
    newAzimuth = (Math.asin(o/h) * 180 / Math.PI);

    if (azimuth > 180) {
      azimuth = azimuth - 360;
    } else if (azimuth < -180) {
      azimuth = azimuth + 360;
    }

    // determine the quadrant to correctly calculate the azimuth.
    if (pointer.lat >= y &&
        pointer.lon >= x) {
      newAzimuth = 90 - newAzimuth;
    } else if (pointer.lat >= y &&
        pointer.lon < x) {
      newAzimuth = -90 + newAzimuth;
    } else if (pointer.lat <= y &&
        pointer.lon <= x) {
      newAzimuth = -90 + newAzimuth;
    } else if (pointer.lat < y &&
        pointer.lon > x) {
      newAzimuth = 90 - newAzimuth;
    }

    // compare the old azimuth to the new azimuth and get the delta.   Add the
    // delta to the old azimuth to get your new azimuth.  We need to add 90 because
    // the rotation point is 90 degrees added to azimuth.
    delta = (newAzimuth - azimuth + 90);

    newAzimuth = azimuth + delta;

    // update our copy of the feature with the new azimuth parameter.
    this.featureCopy.properties.azimuth = newAzimuth;


    // adjust the vertices of the width, height, and rotation vertices.
    widthDistance = emp.geoLibrary.measureDistance(this.width.feature.data.coordinates[1],
      this.width.feature.data.coordinates[0],
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    newWidthPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, widthDistance, newAzimuth);

    newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, widthDistance, -90 + newAzimuth);

    this.width.feature.data.coordinates = [newWidthPosition.x, newWidthPosition.y];
    this.azimuth.feature.data.coordinates = [newAzimuthPosition.x, newAzimuthPosition.y];

    items.push(this.width.feature);
    items.push(this.azimuth.feature);
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

    // retrieve our distance from the existing circle.  We will use this to Calculate
    // the position of the new radius vertex.
    distance = this.featureCopy.properties.width;

    // retrieve the new radius vertex.   It will sit directly above our center point.
    newWidthPosition = emp.geoLibrary.geodesic_coordinate({
      x: pointer.lon,
      y: pointer.lat
    }, distance / 2, azimuth);
    // retrieve the new radius vertex.   It will sit directly above our center point.
    newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
      x: pointer.lon,
      y: pointer.lat
    }, distance / 2, -90 + azimuth);

    this.width.feature.data.coordinates = [newWidthPosition.x, newWidthPosition.y];
    this.azimuth.feature.data.coordinates = [newAzimuthPosition.x, newAzimuthPosition.y];

    items.push(this.width.feature);
    items.push(this.azimuth.feature);
  }

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
emp.editors.Square.prototype.moveControlPoint = function(featureId, pointer) {

  return this.startMoveControlPoint(featureId, pointer);

};

/**
 * Moves control point passed in to the new location provided.
 * Also updates the control point and the feature with the change.
 */
emp.editors.Square.prototype.endMoveControlPoint = function(featureId, pointer) {
  return this.startMoveControlPoint(featureId, pointer);
};

/**
 * Moves the entire feature, offsetting from the starting position.
 */
emp.editors.Square.prototype.moveFeature = function() {

};

/**
 * Occurs when the map is clicked for the frist time after the draw has started.
 */
emp.editors.Square.prototype.drawStart = function(pointer) {
  var bounds,
    mapHeight,
    height,
    azimuthPoint,
    widthPoint,
    items = [],
    widthFeature,
    azimuthFeature,
    centerFeature,
    widthVertex,
    azimuthVertex,
    centerVertex,
    updateData;

  // determine the current map size
  bounds = this.mapInstance.status.getViewBounds();
  mapHeight = emp.geoLibrary.measureDistance(
    bounds.south,
    bounds.west,
    bounds.north,
    bounds.west, "meters");

  height = mapHeight / 8;

  // project out the radius right above the center point of the circle.
  widthPoint = emp.geoLibrary.geodesic_coordinate({
    x: pointer.lon,
    y: pointer.lat
  }, height / 2, 0);

  // project out the radius right above the center point of the circle.
  azimuthPoint = emp.geoLibrary.geodesic_coordinate({
    x: pointer.lon,
    y: pointer.lat
  }, height / 2, -90);

  this.featureCopy = new emp.typeLibrary.Feature({
    overlayId: this.featureCopy.overlayId,
    featureId: this.featureCopy.featureId,
    format: this.featureCopy.format,
    properties: this.featureCopy.properties
  });

  this.featureCopy.data.type = "Point";
  this.featureCopy.data.coordinates = [pointer.lon, pointer.lat];
  this.featureCopy.properties.width = height;

  // create center of the feature from the point that was clicked.
  centerFeature = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    data: {
      coordinates: [pointer.lon, pointer.lat],
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

  // create a feature for each of these coordinates.  This
  // will be our radius control point that is displayed by the map.
  widthFeature = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    data: {
      coordinates: [widthPoint.x, widthPoint.y],
      type: 'Point'
    },
    properties: {
      iconUrl: emp.ui.images.distancePoint,
      iconXOffset: 10,
      iconYOffset: 10,
      xUnits: "pixels",
      yUnits: "pixels",
      altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
    }
  });

  // create a feature for each of these coordinates.  This
  // will be our radius control point that is displayed by the map.
  azimuthFeature = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    data: {
      coordinates: [azimuthPoint.x, azimuthPoint.y],
      type: 'Point'
    },
    properties: {
      iconUrl: emp.ui.images.rotationPoint,
      iconXOffset: 10,
      iconYOffset: 10,
      xUnits: "pixels",
      yUnits: "pixels",
      altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
    }
  });

  centerVertex = new emp.editors.Vertex(centerFeature, "vertex");
  widthVertex = new emp.editors.Vertex(widthFeature, "add");
  azimuthVertex = new emp.editors.Vertex(azimuthFeature, "add");

  this.width = widthVertex;
  this.azimuth = azimuthVertex;
  this.center = centerVertex;

  this.vertices.push(this.center);
  this.vertices.push(this.width);
  this.vertices.push(this.azimuth);

  items.push(centerFeature);
  items.push(azimuthFeature);
  items.push(widthFeature);
  items.push(this.featureCopy);

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

  updateData = this.getUpdateData();

  return updateData;
};
