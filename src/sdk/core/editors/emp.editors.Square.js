/*global*/
emp.editors = emp.editors || {};

emp.editors.Square = function(args) {
  this.width = undefined; // store the Vertex object for the width point
  this.height = undefined; // stores the Vertex object for the height point.
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
    height,
    azimuth,
    widthPoint,
    heightPoint,
    azimuthPoint,
    widthVertex,
    heightVertex,
    azimuthVertex,
    widthFeature,
    heightFeature,
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
  height = this.featureCopy.properties.height || this.featureCopy.properties.width;
  azimuth = this.featureCopy.properties.azimuth;


  // get the position of the point that controls the width of the feature.
  widthPoint = emp.geoLibrary.geodesic_coordinate({
    x: x,
    y: y
  }, width / 2, 90 + azimuth);

  // get the position of the point that controls the height of the feature.
  heightPoint = emp.geoLibrary.geodesic_coordinate({
    x: x,
    y: y
  }, height / 2, azimuth);

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

  heightFeature = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    data: {
      coordinates: [heightPoint.x, heightPoint.y],
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

  items.push(heightFeature);
  items.push(azimuthFeature);

  // add these new Vertex objects into our Vertices collection.
  // Remember Vertices allows editingManager to tell the difference
  // between control points and special points.
  widthVertex = new emp.editors.Vertex(widthFeature, "add");
  heightVertex = new emp.editors.Vertex(heightFeature, "add");
  azimuthVertex = new emp.editors.Vertex(azimuthFeature, "add");

  this.width = widthVertex;
  this.height = heightVertex;
  this.azimuth = azimuthVertex;

  this.vertices.push(heightVertex);
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
    heightDistance,
    index,
    coordinateUpdate,
    updateData = {},
    type = emp.typeLibrary.CoordinateUpdateType.UPDATE,
    newCoordinates,
    newWidthPosition,
    newHeightPosition,
    newAzimuthPosition,
    azimuth,
    o,a,h,
    newAzimuth,
    delta,
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
  if (featureId === this.height.feature.featureId) {
    // if the height moves, then we need to update the height control point.
    // We also will need to change the height property on the feature we are editing.

    // calculate the new height.
    currentFeature.data.coordinates = [pointer.lon, pointer.lat];
    heightDistance = emp.geoLibrary.measureDistance(this.height.feature.data.coordinates[1],
      this.height.feature.data.coordinates[0],
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    // store the new height in the feature.
    this.featureCopy.properties.height = heightDistance * 2;


    // Calculate the position of the new height control point.
    newHeightPosition = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, heightDistance, azimuth);

    // Update the control point position.
    currentFeature.data.coordinates = [newHeightPosition.x, newHeightPosition.y];

    // because this is a square we need the width to be the same as well
    widthDistance = heightDistance;
    // since we are measuring the distance between the edget and center we multiply
    // the width by 2.  L
    this.featureCopy.properties.width = widthDistance * 2;


    // Get the positions of where the new control points will be.
    newWidthPosition = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, widthDistance, 90 + azimuth);

    newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, widthDistance, -90 + azimuth);

    // update the control points.
    this.width.feature.data.coordinates = [newWidthPosition.x, newWidthPosition.y];
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

    heightDistance = emp.geoLibrary.measureDistance(this.height.feature.data.coordinates[1],
      this.height.feature.data.coordinates[0],
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    newWidthPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, widthDistance, 90 + newAzimuth);

    newHeightPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, heightDistance, newAzimuth);

    newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, widthDistance, -90 + newAzimuth);

    this.width.feature.data.coordinates = [newWidthPosition.x, newWidthPosition.y];
    this.height.feature.data.coordinates = [newHeightPosition.x, newHeightPosition.y];
    this.azimuth.feature.data.coordinates = [newAzimuthPosition.x, newAzimuthPosition.y];

    //items.push(this.width.feature);
    items.push(this.height.feature);
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
