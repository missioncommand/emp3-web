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
      iconXOffset: 12,
      iconYOffset: 12,
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
      iconUrl: emp.ui.images.addPoint,
      title: "addFeature",
      iconXOffset: 8,
      iconYOffset: 8,
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
      iconUrl: emp.ui.images.addPoint,
      title: "addFeature2",
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
    moveAzimuth = false,
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

    if(currentFeature.properties.title === "addFeature"){
      moveAzimuth = true;
    }

    // measure the distance between the mouse location and the center.  This
    // will be the new semiMajor.
    distance = emp.geoLibrary.measureDistance(pointer.lat,
      pointer.lon,
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    //ensure that semiMajor is always greater than semiMinor
    if(distance < this.featureCopy.properties.semiMinor){
      this.featureCopy.properties.semiMajor = this.featureCopy.properties.semiMinor;
      this.featureCopy.properties.semiMinor = distance;
      if(this.featureCopy.properties.azimuth < 90){
        this.featureCopy.properties.azimuth = this.featureCopy.properties.azimuth + 90;
      }else{
        this.featureCopy.properties.azimuth = this.featureCopy.properties.azimuth - 90;
      }
      this.semiMajor.feature = this.semiMinor.feature;
      this.semiMinor.feature = currentFeature;


    }else{
      this.featureCopy.properties.semiMajor = distance;
    }

    

    if(moveAzimuth){
      newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, distance, -90 + azimuth);

      this.azimuth.feature.data.coordinates = [newAzimuthPosition.x, newAzimuthPosition.y];

      items.push(this.azimuth.feature);

      tempAzimuth = 90 + azimuth;
    }else{
      tempAzimuth = azimuth - 90;
    }

    // retrieve the new semiMajor vertex.   
    newFeaturePosition = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, distance, tempAzimuth);

    // First update the control point with new pointer info.
    currentFeature.data.coordinates = [newFeaturePosition.x, newFeaturePosition.y];
    

  }else if (featureId === this.semiMinor.feature.featureId){

    currentFeature = this.semiMinor.feature;

    if(currentFeature.properties.title === "addFeature"){
      moveAzimuth = true;
    }

    // measure the distance between the mouse location and the center.  This
    // will be the new semiMinor.
    distance = emp.geoLibrary.measureDistance(pointer.lat,
      pointer.lon,
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

        //ensure that semiMajor is always greater than semiMinor
    if(distance > this.featureCopy.properties.semiMajor){
      this.featureCopy.properties.semiMinor = this.featureCopy.properties.semiMajor;
      this.featureCopy.properties.semiMajor = distance;

      if(this.featureCopy.properties.azimuth < 90){
        this.featureCopy.properties.azimuth = this.featureCopy.properties.azimuth + 90;
      }else{
        this.featureCopy.properties.azimuth = this.featureCopy.properties.azimuth - 90;
      }

      this.semiMinor.feature = this.semiMajor.feature;
      this.semiMajor.feature = currentFeature;


   }else{
      this.featureCopy.properties.semiMinor = distance;
    }


    if(moveAzimuth){
      newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, distance, -180 + azimuth);

      this.azimuth.feature.data.coordinates = [newAzimuthPosition.x, newAzimuthPosition.y];

      items.push(this.azimuth.feature);

      tempAzimuth = azimuth;
    }else{
      tempAzimuth = azimuth;
    }

    // retrieve the new semiMinor vertex. 
    newFeaturePosition = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, distance, tempAzimuth);

    // First update the control point with new pointer info.
    currentFeature.data.coordinates = [newFeaturePosition.x, newFeaturePosition.y];

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
