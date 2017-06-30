/*global*/
emp.editors = emp.editors || {};

emp.editors.Ellipse = function(args) {
  this.animation = undefined;
  this.semiMinor = undefined;
  this.semiMajor = undefined;
  this.azimuth = undefined;
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
    azimuth,
    semiMajor,
    semiMinor,
    semiMinorPoint,
    semiMajorPoint,
    azimuthPoint,
    azimuthFeature,
    addFeature,
    addFeature2,
    azimuthVertex,
    featureVertex,
    featureVertex2,
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
      iconXOffset: 10,
      iconYOffset: 10,
      xUnits: "pixels",
      yUnits: "pixels",
      altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
    }
  });

  // Create a vertex.  This is so the editingManager knows that
  // the center point is a control point .
  vertex = new emp.editors.Vertex(controlPoint, "vertex");
  this.vertices.push(vertex);
  this.center = vertex;
  items.push(controlPoint);

  // Creates control points.
  semiMinor = this.featureCopy.properties.semiMinor;
  semiMajor = this.featureCopy.properties.semiMajor;
  azimuth = this.featureCopy.properties.azimuth;


  semiMinorPoint = emp.geoLibrary.geodesic_coordinate({
    x: x,
    y: y
  }, semiMinor, 0 + azimuth);
  semiMajorPoint = emp.geoLibrary.geodesic_coordinate({
    x: x,
    y: y
  }, semiMajor, 90 + azimuth);
  azimuthPoint = emp.geoLibrary.geodesic_coordinate({
    x: x,
    y: y
  }, semiMajor, -90 + azimuth);

  // create a feature for each of these coordinates.

  addFeature = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    data: {
      coordinates: [semiMajorPoint.x, semiMajorPoint.y],
      type: 'Point'
    },
    properties: {
      iconUrl: emp.ui.images.distancePoint,
      title: "addFeature",
      iconXOffset: 10,
      iconYOffset: 10,
      xUnits: "pixels",
      yUnits: "pixels",
      altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
    }
  });


  addFeature2 = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    data: {
      coordinates: [semiMinorPoint.x, semiMinorPoint.y],
      type: 'Point'
    },
    properties: {
      iconUrl: emp.ui.images.distancePoint,
      title: "addFeature2",
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



  items.push(addFeature);
  items.push(addFeature2);
  items.push(azimuthFeature);


  featureVertex = new emp.editors.Vertex(addFeature, "add");
  featureVertex2 = new emp.editors.Vertex(addFeature2, "add");
  azimuthVertex = new emp.editors.Vertex(azimuthFeature, "add");


  this.semiMajor = featureVertex;
  this.semiMinor = featureVertex2;
  this.azimuth = azimuthVertex;


  this.vertices.push(featureVertex);
  this.vertices.push(featureVertex2);
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
 * Begins the movement of a control point.
 */
emp.editors.Ellipse.prototype.startMoveControlPoint = function(featureId, pointer) {

  var currentFeature,
    azimuth,
    items = [],
    semiMajor,
    semiMinor,
    newSemiMajorPosition,
    newSemiMinorPosition,
    index,
    coordinateUpdate,
    updateData = {},
    type = emp.typeLibrary.CoordinateUpdateType.UPDATE,
  //  moveAzimuth = false,
    newCoordinates,
    tempAzimuth,
    distance,
    newAzimuthPosition,
    delta,
    newAzimuth,
    newFeaturePosition,
    semiMinorPoint,
    semiMajorPoint,
    azimuthPoint,
    o, a, h, x, y;


  x = this.featureCopy.data.coordinates[0];
  y = this.featureCopy.data.coordinates[1];


  azimuth = this.featureCopy.properties.azimuth;

  // Calculate the new position of where
  // we want the control point to be.
  if (featureId === this.semiMajor.feature.featureId){
    currentFeature = this.semiMajor.feature;

    // measure the distance between the mouse location and the center.  This
    // will be the new semiMajor.
    distance = emp.geoLibrary.measureDistance(pointer.lat,
      pointer.lon,
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    //ensure that semiMajor is always greater than semiMinor
    if(distance < this.featureCopy.properties.semiMinor){
      // do not allow semimajor to be smaller than semiMinor
      distance =  this.featureCopy.properties.semiMinor + 1;
    }
    else
    {
      this.featureCopy.properties.semiMajor = distance;
    }




      newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, distance, -90 + azimuth);

      this.azimuth.feature.data.coordinates = [newAzimuthPosition.x, newAzimuthPosition.y];

      items.push(this.azimuth.feature);

      tempAzimuth = azimuth + 90;

    // retrieve the new semiMajor vertex.
    newFeaturePosition = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, distance, tempAzimuth);

    // First update the control point with new pointer info.
    currentFeature.data.coordinates = [newFeaturePosition.x, newFeaturePosition.y];
    items.push(currentFeature);


  }else if (featureId === this.semiMinor.feature.featureId){

    currentFeature = this.semiMinor.feature;

    // measure the distance between the mouse location and the center.  This
    // will be the new semiMinor.
    distance = emp.geoLibrary.measureDistance(pointer.lat,
      pointer.lon,
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

        //ensure that semiMajor is always greater than semiMinor
    if(distance > this.featureCopy.properties.semiMajor){
      distance = this.featureCopy.properties.semiMajor - 1;

   }else{
      this.featureCopy.properties.semiMinor = distance;
    }

    // retrieve the new semiMinor vertex.
    newFeaturePosition = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, distance, azimuth);

    // First update the control point with new pointer info.
    currentFeature.data.coordinates = [newFeaturePosition.x, newFeaturePosition.y];
    items.push(currentFeature);

  }else if (featureId === this.azimuth.feature.featureId){
    currentFeature = this.azimuth.feature;

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


    // adjust the vertices
    semiMajor = emp.geoLibrary.measureDistance(this.semiMajor.feature.data.coordinates[1],
      this.semiMajor.feature.data.coordinates[0],
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    semiMinor = emp.geoLibrary.measureDistance(this.semiMinor.feature.data.coordinates[1],
      this.semiMinor.feature.data.coordinates[0],
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    newSemiMajorPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, semiMajor, 90 + newAzimuth);

    newSemiMinorPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, semiMinor, newAzimuth);

    newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, semiMajor, -90 + newAzimuth);

    this.semiMajor.feature.data.coordinates = [newSemiMajorPosition.x, newSemiMajorPosition.y];
    this.semiMinor.feature.data.coordinates = [newSemiMinorPosition.x, newSemiMinorPosition.y];
    this.azimuth.feature.data.coordinates = [newAzimuthPosition.x, newAzimuthPosition.y];

    items.push(this.semiMajor.feature);
    items.push(this.semiMinor.feature);
    items.push(this.azimuth.feature);
  }else{
    currentFeature = this.vertices.find(featureId).feature;

    currentFeature.data.coordinates = [pointer.lon, pointer.lat];

    this.featureCopy.data.coordinates = [pointer.lon, pointer.lat];


    // Get the properties for width, height and azimuth.
    semiMajor = this.featureCopy.properties.semiMajor;
    semiMinor = this.featureCopy.properties.semiMinor;
    azimuth = this.featureCopy.properties.azimuth;


    // Calculate the new positions of the control points.
    semiMinorPoint = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, semiMinor, 0 + azimuth);
    semiMajorPoint = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, semiMajor, 90 + azimuth);
    azimuthPoint = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, semiMajor, -90 + azimuth);

    // update the control point positions.
    this.semiMajor.feature.data.coordinates = [semiMajorPoint.x, semiMajorPoint.y];
    this.semiMinor.feature.data.coordinates = [semiMinorPoint.x, semiMinorPoint.y];
    this.azimuth.feature.data.coordinates = [azimuthPoint.x, azimuthPoint.y];

    items.push(this.semiMajor.feature);
    items.push(this.semiMinor.feature);
    items.push(this.azimuth.feature);
      items.push(currentFeature);
  }

  // make sure the symbol is updated with its new properties.
  items.push(this.featureCopy);

  // Add our updated feature onto the items we will be updating in our
  // transaction.
  //items.push(currentFeature);


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

emp.editors.Ellipse.prototype.drawStart = function(pointer) {
  var bounds,
    mapHeight,
    mapWidth,
    height,
    width,
    semiMajorPoint,
    semiMinorPoint,
    azimuthPoint,
    items = [],
    semiMajorFeature,
    semiMinorFeature,
    azimuthFeature,
    centerFeature,
    semiMajorVertex,
    semiMinorVertex,
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
  mapWidth = emp.geoLibrary.measureDistance(
    bounds.south,
    bounds.west,
    bounds.south,
    bounds.east, "meters");
  height = mapHeight / 8;
  width = mapWidth / 8;

  // project out the radius right above the center point of the circle.
  semiMajorPoint = emp.geoLibrary.geodesic_coordinate({
    x: pointer.lon,
    y: pointer.lat
  }, width, 90);

  // project out the radius right above the center point of the circle.
  azimuthPoint = emp.geoLibrary.geodesic_coordinate({
    x: pointer.lon,
    y: pointer.lat
  }, width, -90);

  // project out the radius right above the center point of the circle.
  semiMinorPoint = emp.geoLibrary.geodesic_coordinate({
    x: pointer.lon,
    y: pointer.lat
  }, height, 0);

  // not quite sure why, but we have to instantiate the feature again.
  // for some reason, the coreParent is not set if we do not.  Haven't
  // figured out why yet.
  this.featureCopy = new emp.typeLibrary.Feature({
    overlayId: this.featureCopy.overlayId,
    featureId: this.featureCopy.featureId,
    format: this.featureCopy.format,
    properties: this.featureCopy.properties
  });

  this.featureCopy.data.type = "Point";
  this.featureCopy.data.coordinates = [pointer.lon, pointer.lat];
  this.featureCopy.properties.semiMinor = height;
  this.featureCopy.properties.semiMajor = width;
  this.featureCopy.properties.azimuth = 0;


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
  semiMinorFeature = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    data: {
      coordinates: [semiMinorPoint.x, semiMinorPoint.y],
      type: 'Point'
    },
    properties: {
      iconUrl: emp.ui.images.distancePoint,
      title: "addFeature2",
      iconXOffset: 10,
      iconYOffset: 10,
      xUnits: "pixels",
      yUnits: "pixels",
      altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
    }
  });

  // create a feature for each of these coordinates.  This
  // will be our radius control point that is displayed by the map.
  semiMajorFeature = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    data: {
      coordinates: [semiMajorPoint.x, semiMajorPoint.y],
      type: 'Point'
    },
    properties: {
      iconUrl: emp.ui.images.distancePoint,
      title: "addFeature",
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
  semiMinorVertex = new emp.editors.Vertex(semiMinorFeature, "add");
  semiMajorVertex = new emp.editors.Vertex(semiMajorFeature, "add");
  azimuthVertex = new emp.editors.Vertex(azimuthFeature, "add");

  this.semiMinor = semiMinorVertex;
  this.semiMajor = semiMajorVertex;
  this.azimuth = azimuthVertex;
  this.center = centerVertex;

  this.vertices.push(this.center);
  this.vertices.push(semiMajorVertex);
  this.vertices.push(semiMinorVertex);
  this.vertices.push(azimuthVertex);

  items.push(centerFeature);
  items.push(semiMajorFeature);
  items.push(azimuthFeature);
  items.push(semiMinorFeature);
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
