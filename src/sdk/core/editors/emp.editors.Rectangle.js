/*global*/
emp.editors = emp.editors || {};

emp.editors.Rectangle = function(args) {
  this.animation = undefined;
  this.witdh = undefined;
  this.height = undefined;
  this.center = undefined;
  emp.editors.EditorBase.call(this, args);

  this.calculateAddPoints = function() {

  };
};

emp.editors.Rectangle.prototype = Object.create(emp.editors.EditorBase.prototype);
emp.editors.Rectangle.prototype.constructor = emp.editors.Rectangle;

/**
 * Adds the control points to the map for an edit or a draw.
 */
emp.editors.Rectangle.prototype.addControlPoints = function() {

  var controlPoint,
    transaction,
    items = [],
    vertex,
    width,
    height,
    azimuth,
    widthPoint,
    heightPoint,
    widthVertex,
    heightVertex,
    widthFeature,
    heightFeature;

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
    if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE) {
      width = this.featureCopy.properties.width;
      height = this.featureCopy.properties.height;
      azimuth = this.featureCopy.properties.azimuth;
    } else if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
      width = this.featureCopy.properties.distance[0];
      height = this.featureCopy.properties.distance[1];
      azimuth = this.featureCopy.properties.azimuth[0];
    }

    widthPoint = emp.geoLibrary.geodesic_coordinate({
      x: this.featureCopy.data.coordinates[0],
      y: this.featureCopy.data.coordinates[1]
    }, width / 2, 90 + azimuth);

    heightPoint = emp.geoLibrary.geodesic_coordinate({
      x: this.featureCopy.data.coordinates[0],
      y: this.featureCopy.data.coordinates[1]
    }, height / 2, azimuth);

    // create a feature for each of these coordinates.  This
    // will be our 'add point'
    widthFeature = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [widthPoint.x, widthPoint.y],
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

    heightFeature = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [heightPoint.x, heightPoint.y],
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

    items.push(widthFeature);
    items.push(heightFeature);

    widthVertex = new emp.editors.Vertex(widthFeature, "add");
    heightVertex = new emp.editors.Vertex(heightFeature, "add");

    this.width = widthVertex;
    this.height = heightVertex;

    this.vertices.push(widthVertex);
    this.vertices.push(heightVertex);


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

emp.editors.Rectangle.prototype.startMoveControlPoint = function(featureId, pointer) {

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
    azimuth;

  currentVertex = this.vertices.find(featureId);

  // First update the control point with new pointer info.
  currentFeature = currentVertex.feature;
  currentFeature.data.coordinates = [pointer.lon, pointer.lat];

  if (featureId === this.width.feature.featureId){
    // if the radius moves, then we need to update the radius value on the
    // original feature.
    //
    widthDistance = emp.geoLibrary.measureDistance(this.width.feature.data.coordinates[1],
      this.width.feature.data.coordinates[0],
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    // Add the radius control point.
    if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE) {
      this.featureCopy.properties.width = widthDistance * 2;
    } else if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
      this.featureCopy.properties.distance[0] = widthDistance * 2;
    }
  } else if (featureId === this.height.feature.featureId) {
    heightDistance = emp.geoLibrary.measureDistance(this.height.feature.data.coordinates[1],
      this.height.feature.data.coordinates[0],
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    // Add the radius control point.
    if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE) {
      this.featureCopy.properties.height = heightDistance * 2;
    } else if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
      this.featureCopy.properties.distance[1] = heightDistance * 2;
    }
  } else {
    this.featureCopy.data.coordinates = [pointer.lon, pointer.lat];

    // Add the radius control point.
    if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE) {
      widthDistance = this.featureCopy.properties.width;
      heightDistance = this.featureCopy.properties.height;
      azimuth = this.featureCopy.properties.azimuth;
    } else if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
      widthDistance = this.featureCopy.properties.distance[0];
      heightDistance = this.featureCopy.properties.distance[1];
      azimuth = this.featureCopy.properties.azimuth[0];
    }

    newWidthPosition = emp.geoLibrary.geodesic_coordinate({
      x: this.featureCopy.data.coordinates[0],
      y: this.featureCopy.data.coordinates[1]
    }, widthDistance, 90 + azimuth);

    newHeightPosition = emp.geoLibrary.geodesic_coordinate({
      x: this.featureCopy.data.coordinates[0],
      y: this.featureCopy.data.coordinates[1]
    }, heightDistance, azimuth);

    this.width.feature.data.coordinates = [newWidthPosition.x, newWidthPosition.y];
    this.height.feature.data.coordinates = [newHeightPosition.x, newHeightPosition.y];

    items.push(this.width.feature);
    items.push(this.height.feature);
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
    lat: this.featureCopy.data.coordinates[1],
    lon: this.featureCopy.data.coordinates[0]
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
emp.editors.Rectangle.prototype.moveControlPoint = function(featureId, pointer) {

  return this.startMoveControlPoint(featureId, pointer);

};

/**
 * Moves control point passed in to the new location provided.
 * Also updates the control point and the feature with the change.
 */
emp.editors.Rectangle.prototype.endMoveControlPoint = function(featureId, pointer) {
  return this.startMoveControlPoint(featureId, pointer);
};

/**
 * Moves the entire feature, offsetting from the starting position.
 */
emp.editors.Rectangle.prototype.moveFeature = function() {

};
