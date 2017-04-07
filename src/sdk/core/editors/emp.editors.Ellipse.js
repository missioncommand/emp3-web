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
    semiMajorFeature,
    semiMinorFeature,
    semiMajorVertex,
    semiMinorVertex,
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


  items.push(semiMinorFeature);
  items.push(semiMajorFeature);

  semiMajorVertex = new emp.editors.Vertex(semiMajorFeature, "add");
  semiMinorVertex = new emp.editors.Vertex(semiMinorFeature, "add");

  this.semiMajor = semiMajorVertex;
  this.semiMinor = semiMinorVertex;

  this.vertices.push(semiMajorVertex);
  this.vertices.push(semiMinorVertex);


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
    semiMajor,
    semiMinor,
    azimuth = 90,
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

  // Calculate the new position of where
  // we want the control point to be.
  if (featureId === this.semiMajor.feature.featureId){
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
      azimuth = 0;

      // retrieve the new semiMajor vertex.   
      newSemiMinorPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, semiMinor, 90);

      //update the alternate feature
      alternateFeature.data.coordinates = [newSemiMinorPosition.x, newSemiMinorPosition.y];
    }

    // retrieve the new semiMajor vertex.   
    newSemiMajorPosition = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, semiMajor, azimuth);
    // First update the control point with new pointer info.
    currentFeature.data.coordinates = [newSemiMajorPosition.x, newSemiMajorPosition.y];


    this.featureCopy.properties.semiMajor = semiMajor;

  }else if (featureId === this.semiMinor.feature.featureId){
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
      azimuth = 90;

      // retrieve the new semiMajor vertex.   
      newSemiMajorPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, semiMajor);

      //update the alternate feature
      alternateFeature.data.coordinates = [newSemiMajorPosition.x, newSemiMajorPosition.y];
    }

    // retrieve the new semiMinor vertex. 
    newSemiMinorPosition = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, semiMinor, azimuth);
    // First update the control point with new pointer info.
    currentFeature.data.coordinates = [newSemiMinorPosition.x, newSemiMinorPosition.y];


    this.featureCopy.properties.semiMinor = semiMinor;

  }

  // make sure the symbol is updated with its new properties.
  items.push(this.featureCopy);

  // Add our updated feature onto the items we will be updating in our
  // transaction.
  items.push(currentFeature);
  items.push(alternateFeature);

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
