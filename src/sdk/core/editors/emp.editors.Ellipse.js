/*global*/
emp.editors = emp.editors || {};

emp.editors.Ellipse = function(args) {
  this.animation = undefined;
  this.semiMinor = undefined;
  this.semiMajor = undefined;
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
    semiMajor,
    semiMinor,
    semiMinorPoint,
    semiMajorPoint,
    azimuthPoint,
    semiMajorFeature,
    semiMinorFeature,
    azimuthFeature,
    semiMajorVertex,
    semiMinorVertex,
    azimuthVertex,
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


  semiMinorPoint = emp.geoLibrary.geodesic_coordinate({
    x: x,
    y: y
  }, semiMinor, 0);
  semiMajorPoint = emp.geoLibrary.geodesic_coordinate({
    x: x,
    y: y
  }, semiMajor, 90);
  azimuthPoint = emp.geoLibrary.geodesic_coordinate({
    x: x,
    y: y
  }, semiMajor, -90);

  // create a feature for each of these coordinates.

  semiMinorFeature = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    name: "semiMinor",
    data: {
      coordinates: [semiMinorPoint.x, semiMinorPoint.y],
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


  semiMajorFeature = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    name: "semiMajor",
    data: {
      coordinates: [semiMajorPoint.x, semiMajorPoint.y],
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
    name: "azimuth",
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



  items.push(semiMinorFeature);
  items.push(semiMajorFeature);
  items.push(azimuthFeature);


  semiMajorVertex = new emp.editors.Vertex(semiMajorFeature, "add");
  semiMinorVertex = new emp.editors.Vertex(semiMinorFeature, "add");
  azimuthVertex = new emp.editors.Vertex(azimuthFeature, "add");


  this.semiMajor = semiMajorVertex;
  this.semiMinor = semiMinorVertex;
  this.azimuth = azimuthVertex;


  this.vertices.push(semiMajorVertex);
  this.vertices.push(semiMinorVertex);
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
    currentVertex,
    azimuth,
    pointAzimuth,
    items = [],
    semiMajor,
    semiMinor,
    azimuth,
    newSemiMajorPosition,
    newSemiMinorPosition,
    alternateVertex,
    alternateFeature,
    index,
    coordinateUpdate,
    updateData = {},
    type = emp.typeLibrary.CoordinateUpdateType.UPDATE,
    newCoordinates,
    x, y;

 
  x = this.featureCopy.data.coordinates[0];
  y = this.featureCopy.data.coordinates[1];


  currentVertex = this.vertices.find(featureId);
  currentFeature = currentVertex.feature;

  azimuth = this.featureCopy.properties.azimuth;

  // Calculate the new position of where
  // we want the control point to be.
  if (featureId === this.semiMajor.feature.featureId){
    pointAzimuth = 90;
    //set the alternate so we can update that too
    alternateVertex = this.vertices.find(this.semiMinor.feature.featureId);
    alternateFeature = alternateVertex.feature;

    // measure the distance between the mouse location and the center.  This
    // will be the new semiMajor.
    semiMajor = emp.geoLibrary.measureDistance(pointer.lat,
      pointer.lon,
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    //ensure that semiMajor is always greater than semiMinor
    if(semiMajor < this.featureCopy.properties.semiMinor){
      semiMinor = semiMajor;
      semiMajor = this.featureCopy.properties.semiMinor;
      this.featureCopy.properties.semiMinor = semiMinor;
      pointAzimuth = 0;

      // retrieve the new semiMajor vertex.   
      newSemiMinorPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, semiMinor, 90);

      //update the alternate feature
      alternateFeature.data.coordinates = [newSemiMinorPosition.x, newSemiMinorPosition.y];
    }else{
      alternateFeature = null;
    }

    // retrieve the new semiMajor vertex.   
    newSemiMajorPosition = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, semiMajor, pointAzimuth);

    if(alternateFeature){
      newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, semiMinor, -90);
    }else{
      newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, semiMajor, -90);
    }
    // First update the control point with new pointer info.
    currentFeature.data.coordinates = [newSemiMajorPosition.x, newSemiMajorPosition.y];
    this.azimuth.feature.data.coordinates = [newAzimuthPosition.x, newAzimuthPosition.y];
    this.featureCopy.properties.semiMajor = semiMajor;
    items.push(this.azimuth.feature);

  }else if (featureId === this.semiMinor.feature.featureId){
    pointAzimuth = 0;
    //set the alternate so we can update that too
    alternateVertex = this.vertices.find(this.semiMajor.feature.featureId);
    alternateFeature = alternateVertex.feature;

    // measure the distance between the mouse location and the center.  This
    // will be the new semiMinor.
    semiMinor = emp.geoLibrary.measureDistance(pointer.lat,
      pointer.lon,
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

        //ensure that semiMajor is always greater than semiMinor
    if(semiMinor > this.featureCopy.properties.semiMajor){
      semiMajor = semiMinor;
      semiMinor = this.featureCopy.properties.semiMajor;
      this.featureCopy.properties.semiMajor = semiMajor;
      pointAzimuth = 90;

      // retrieve the new semiMajor vertex.   
      newSemiMajorPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, semiMajor);

      //update the alternate feature
      alternateFeature.data.coordinates = [newSemiMajorPosition.x, newSemiMajorPosition.y];
    }else{
      alternateFeature = null;
    }

    // retrieve the new semiMinor vertex. 
    newSemiMinorPosition = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, semiMinor, pointAzimuth);

    if(alternateFeature){
      newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, semiMinor, -90);
    }else{
      newAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, semiMajor, -90);
    }
    // First update the control point with new pointer info.
    currentFeature.data.coordinates = [newSemiMinorPosition.x, newSemiMinorPosition.y];
    this.azimuth.feature.data.coordinates = [newAzimuthPosition.x, newAzimuthPosition.y];
    this.featureCopy.properties.semiMinor = semiMinor;
    items.push(this.azimuth.feature);

  }else if (featureId === this.azimuth.feature.featureId){
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
  }

  // make sure the symbol is updated with its new properties.
  items.push(this.featureCopy);

  // Add our updated feature onto the items we will be updating in our
  // transaction.
  items.push(currentFeature);
  if(alternateFeature){
    items.push(alternateFeature);
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
