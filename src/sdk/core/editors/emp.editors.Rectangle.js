/*global*/
emp.editors = emp.editors || {};

emp.editors.Rectangle = function(args) {
  this.animation = undefined;
  this.witdh = undefined;
  this.height = undefined;
  this.azimuth = undefined;
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
    azimuthPoint,
    widthVertex,
    heightVertex,
    azimuthVertex,
    widthFeature,
    heightFeature,
    azimuthFeature;

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

    // get the width, height, and azimuth for our calculations.
    if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE) {
      width = this.featureCopy.properties.width;
      height = this.featureCopy.properties.height;
      azimuth = this.featureCopy.properties.azimuth;
    } else if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
      width = this.featureCopy.properties.distance[0];
      height = this.featureCopy.properties.distance[1];
      azimuth = this.featureCopy.properties.azimuth[0];
    }

    // get the position of the point that controls the width of the feature.
    widthPoint = emp.geoLibrary.geodesic_coordinate({
      x: this.featureCopy.data.coordinates[0],
      y: this.featureCopy.data.coordinates[1]
    }, width / 2, 90 + azimuth);

    // get the position of the point that controls the height of the feature.
    heightPoint = emp.geoLibrary.geodesic_coordinate({
      x: this.featureCopy.data.coordinates[0],
      y: this.featureCopy.data.coordinates[1]
    }, height / 2, azimuth);

    azimuthPoint = emp.geoLibrary.geodesic_coordinate({
      x: this.featureCopy.data.coordinates[0],
      y: this.featureCopy.data.coordinates[1]
    }, width / 2, -90 + azimuth);

    // create a feature for each of these points.  This
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
        iconXOffset: 12,
        iconYOffset: 12,
        xUnits: "pixels",
        yUnits: "pixels",
        altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
      }
    });

    items.push(widthFeature);
    items.push(heightFeature);
    items.push(azimuthFeature);

    widthVertex = new emp.editors.Vertex(widthFeature, "add");
    heightVertex = new emp.editors.Vertex(heightFeature, "add");
    azimuthVertex = new emp.editors.Vertex(azimuthFeature, "add");

    this.width = widthVertex;
    this.height = heightVertex;
    this.azimuth = azimuthVertex;

    this.vertices.push(widthVertex);
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
    newAzimuthPosition,
    azimuth,
    o,a,h,
    newAzimuth,
    delta;

  currentVertex = this.vertices.find(featureId);

  // First update the control point with new pointer info.
  currentFeature = currentVertex.feature;


  if (featureId === this.width.feature.featureId){
    // if the radius moves, then we need to update the radius value on the
    // original feature.
    currentFeature.data.coordinates = [pointer.lon, pointer.lat];
    widthDistance = emp.geoLibrary.measureDistance(this.width.feature.data.coordinates[1],
      this.width.feature.data.coordinates[0],
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE) {
      this.featureCopy.properties.width = widthDistance * 2;
    } else if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
      this.featureCopy.properties.distance[0] = widthDistance * 2;
    }

    azimuth = this.featureCopy.properties.azimuth;
    newWidthPosition = emp.geoLibrary.geodesic_coordinate({
      x: this.featureCopy.data.coordinates[0],
      y: this.featureCopy.data.coordinates[1]
    }, widthDistance, 90 + azimuth);

    newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
      x: this.featureCopy.data.coordinates[0],
      y: this.featureCopy.data.coordinates[1]
    }, widthDistance, -90 + azimuth);

    currentFeature.data.coordinates = [newWidthPosition.x, newWidthPosition.y];
    this.azimuth.feature.data.coordinates = [newAzimuthPosition.x, newAzimuthPosition.y];

    items.push(this.azimuth.feature);
  } else if (featureId === this.height.feature.featureId) {
    currentFeature.data.coordinates = [pointer.lon, pointer.lat];
    heightDistance = emp.geoLibrary.measureDistance(this.height.feature.data.coordinates[1],
      this.height.feature.data.coordinates[0],
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE) {
      this.featureCopy.properties.height = heightDistance * 2;
    } else if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
      this.featureCopy.properties.distance[1] = heightDistance * 2;
    }

    azimuth = this.featureCopy.properties.azimuth;
    newHeightPosition = emp.geoLibrary.geodesic_coordinate({
      x: this.featureCopy.data.coordinates[0],
      y: this.featureCopy.data.coordinates[1]
    }, heightDistance, azimuth);

    currentFeature.data.coordinates = [newHeightPosition.x, newHeightPosition.y];
  } else if (featureId === this.azimuth.feature.featureId) {
    // the rotation vertex was dragged.
    // get the new azimuth from the center to the current mouse position.  that
    // will determine the new vertex.

    //  asin(o/h) will return the angle in radians of a right sided triangle.
    o = pointer.lat - this.featureCopy.data.coordinates[1];
    a = pointer.lon - this.featureCopy.data.coordinates[0];
    h = Math.sqrt(o*o + a*a);

    // get the angle but convert to radians.
    newAzimuth = (Math.asin(o/h) * 180 / Math.PI);

    // get the old azimuth.  normalize the value.
    azimuth = this.featureCopy.properties.azimuth;
    if (azimuth > 180) {
      azimuth = azimuth - 360;
    } else if (azimuth < -180) {
      azimuth = azimuth + 360;
    }

    // determine the quadrant to correctly calculate the azimuth.
    if (pointer.lat >= this.featureCopy.data.coordinates[1] &&
        pointer.lon >= this.featureCopy.data.coordinates[0]) {
      newAzimuth = 90 - newAzimuth;
    } else if (pointer.lat >= this.featureCopy.data.coordinates[1] &&
        pointer.lon < this.featureCopy.data.coordinates[0]) {
      newAzimuth = -90 + newAzimuth;
    } else if (pointer.lat <= this.featureCopy.data.coordinates[1] &&
        pointer.lon <= this.featureCopy.data.coordinates[0]) {
      newAzimuth = -90 + newAzimuth;
    } else if (pointer.lat < this.featureCopy.data.coordinates[1] &&
        pointer.lon > this.featureCopy.data.coordinates[0]) {
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
        x: this.featureCopy.data.coordinates[0],
        y: this.featureCopy.data.coordinates[1]
      }, widthDistance, 90 + newAzimuth);

    newHeightPosition = emp.geoLibrary.geodesic_coordinate({
        x: this.featureCopy.data.coordinates[0],
        y: this.featureCopy.data.coordinates[1]
      }, heightDistance, newAzimuth);

    newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
        x: this.featureCopy.data.coordinates[0],
        y: this.featureCopy.data.coordinates[1]
      }, widthDistance, -90 + newAzimuth);

    this.width.feature.data.coordinates = [newWidthPosition.x, newWidthPosition.y];
    this.height.feature.data.coordinates = [newHeightPosition.x, newHeightPosition.y];
    this.azimuth.feature.data.coordinates = [newAzimuthPosition.x, newAzimuthPosition.y];

    items.push(this.width.feature);
    items.push(this.height.feature);
    items.push(this.azimuth.feature);

  } else {

    currentFeature.data.coordinates = [pointer.lon, pointer.lat];
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
    }, widthDistance / 2, 90 + azimuth);

    newHeightPosition = emp.geoLibrary.geodesic_coordinate({
      x: this.featureCopy.data.coordinates[0],
      y: this.featureCopy.data.coordinates[1]
    }, heightDistance / 2, azimuth);

    newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
      x: this.featureCopy.data.coordinates[0],
      y: this.featureCopy.data.coordinates[1]
    }, widthDistance / 2, -90 + azimuth);


    this.width.feature.data.coordinates = [newWidthPosition.x, newWidthPosition.y];
    this.height.feature.data.coordinates = [newHeightPosition.x, newHeightPosition.y];
    this.azimuth.feature.data.coordinates = [newAzimuthPosition.x, newAzimuthPosition.y];

    items.push(this.width.feature);
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
