/*global*/
emp.editors = emp.editors || {};

emp.editors.MilStdCircularRangeFan = function(args) {
  this.animation = undefined;
  this.radius = [];
  this.center = undefined;
  this.addRadius = undefined;
  emp.editors.EditorBase.call(this, args);
};

emp.editors.MilStdCircularRangeFan.prototype = Object.create(emp.editors.EditorBase.prototype);
emp.editors.MilStdCircularRangeFan.prototype.constructor = emp.editors.MilStdCircularRangeFan;

/**
 * Adds the control points to the map for an edit or a draw.
 */
emp.editors.MilStdCircularRangeFan.prototype.addControlPoints = function() {

  var controlPoint,
    transaction,
    items = [],
    vertex,
    addPoint,
    newPoint,
    radiusVertex,
    distance,
    x, y;

  // We have an issue in that GEO_CIRCLE uses GeoJSON Point, and all
  // MIL-STD-2525 symbols use LineString, even though it is a single point.
  // So we store the x/y values so we can use them univerally throughout the
  // function.
  if (this.featureCopy.data.type === 'Point') {
    x = this.featureCopy.data.coordinates[0];
    y = this.featureCopy.data.coordinates[1];
  } else if (this.featureCopy.data.type === 'LineString') {
    x = this.featureCopy.data.coordinates[0][0];
    y = this.featureCopy.data.coordinates[0][1];
  }

  // Create a feature on the map for the center of the circle.
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
  // the center point is a control point and not the radius.
  vertex = new emp.editors.Vertex(controlPoint, "add");
  this.vertices.push(vertex);
  this.center = vertex;
  items.push(controlPoint);

  // Create a radius control point.
  if (this.featureCopy.properties.modifiers.distance && this.featureCopy.properties.modifiers.distance.length > 0) {
    // if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE) {
    //   distance = this.featureCopy.properties.radius;
    // } else if (this.featureCopy.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
    for (var index = 0; index < this.featureCopy.properties.modifiers.distance.length; index++) {
      distance = this.featureCopy.properties.modifiers.distance[index];
      // project out the radius right above the center point of the circle.
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
          iconUrl: emp.ui.images.radius,
          iconXOffset: 10,
          iconYOffset: 10,
          xUnits: "pixels",
          yUnits: "pixels",
          altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
        }
      });

      items.push(addPoint);
      radiusVertex = new emp.editors.Vertex(addPoint, "vertex");
      //this.radius.push(radiusVertex);
      this.vertices.push(radiusVertex);
    } //for
  }

  //create an add type vertex control point that allows for the adding of new circles. There a max of 3 circles for
  //this circular range fan.
  //distance = this.featureCopy.properties.modifiers.distance[index];
  // project out the add control point 1.25 of the distance from the last radius to the center, and
  // right above the center point of the circle.
  if (!distance)
  {
    // no circles present. use a default distance
    distance = 5000;
  }

if (this.featureCopy.properties.modifiers.distance && this.featureCopy.properties.modifiers.distance.length < 3)
{
  newPoint = emp.geoLibrary.geodesic_coordinate({
    x: x,
    y: y
  }, distance + distance*0.2, 0);
  addPoint = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    data: {
      coordinates: [newPoint.x, newPoint.y],
      type: 'Point'
    },
    properties: {
      iconUrl: emp.ui.images.addPoint  ,
      iconXOffset: 10,
      iconYOffset: 10,
      xUnits: "pixels",
      yUnits: "pixels",
      altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
    }
  });

  items.push(addPoint);
  radiusVertex = new emp.editors.Vertex(addPoint, "add");
  radiusVertex.distance = distance;
  this.addRadius = radiusVertex;
  this.vertices.push(radiusVertex);
}





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
emp.editors.MilStdCircularRangeFan.prototype.startMoveControlPoint = function(featureId, pointer) {

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
    maxRadiusDistance,
  //  isRadius = false,
    radiusVertex,
    x, y;

  // We have an issue in that GEO_CIRCLE uses GeoJSON Point, and all
  // MIL-STD-2525 symbols use LineString, even though it is a single point.
  // So we store the x/y values so we can use them univerally throughout the
  // function.
  if (this.featureCopy.data.type === 'Point') {
    x = this.featureCopy.data.coordinates[0];
    y = this.featureCopy.data.coordinates[1];
  } else if (this.featureCopy.data.type === 'LineString') {
    x = this.featureCopy.data.coordinates[0][0];
    y = this.featureCopy.data.coordinates[0][1];
  }

  currentVertex = this.vertices.find(featureId);
  currentFeature = currentVertex.feature;

  // If the control point being moved is a radius control point,
  // calculate the new radius.  Calculate the new position of where
  // we want the control point to be.
  // for (index = 0; index < this.radius.length; index++) {
  //   if (featureId === this.radius[index].feature.featureId) {
  //     isRadius = true;
  //     break;
  //   }
  // }

  if (featureId !== this.center.feature.featureId) {

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
    if (this.addRadius && this.addRadius.feature.featureId === featureId)
    {
      this.featureCopy.properties.modifiers.distance.push(distance);
      this.vertices.promoteVertex(currentVertex.feature.featureId);
      // Change the icon to be that of a vertex.
      currentFeature.properties.iconUrl = emp.ui.images.radius;
      //this.radius.push(currentVertex);
      this.addRadius =  undefined;
      // add add vertex again
      if (this.featureCopy.properties.modifiers.distance && this.featureCopy.properties.modifiers.distance.length < 3)
      {
        this.featureCopy.properties.modifiers.distance.max = function() { return  Math.max.apply(Math, this); }; //attach max funct
        maxRadiusDistance =  this.featureCopy.properties.modifiers.distance.max();
        if (!maxRadiusDistance)
        {
          // no circles present. use a default distance
          maxRadiusDistance = 5000;
        }
        var newPoint = emp.geoLibrary.geodesic_coordinate({
          x: x,
          y: y
        }, maxRadiusDistance + maxRadiusDistance*0.2, 0);
        var addPoint = new emp.typeLibrary.Feature({
          overlayId: "vertices",
          featureId: emp3.api.createGUID(),
          format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
          data: {
            coordinates: [newPoint.x, newPoint.y],
            type: 'Point'
          },
          properties: {
            iconUrl: emp.ui.images.addPoint  ,
            iconXOffset: 10,
            iconYOffset: 10,
            xUnits: "pixels",
            yUnits: "pixels",
            altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
          }
        });

        items.push(addPoint);
        radiusVertex = new emp.editors.Vertex(addPoint, "add");
        radiusVertex.distance = maxRadiusDistance;
        this.addRadius = radiusVertex;
        this.vertices.push(radiusVertex);
      }
    }
    else
    {
      index = this.vertices.getIndex(featureId);
      this.featureCopy.properties.modifiers.distance[index] = distance;
      if (this.addRadius)
      {
        this.featureCopy.properties.modifiers.distance.max = function() { return  Math.max.apply(Math, this); }; //attach max funct
        maxRadiusDistance =  this.featureCopy.properties.modifiers.distance.max();
        if (!maxRadiusDistance)
        {
          // no circles present. use a default distance
          maxRadiusDistance = 5000;
        }
        //distance =   maxRadiusDistance;
        newRadiusPosition = emp.geoLibrary.geodesic_coordinate({
          x: this.center.feature.data.coordinates[0],
          y: this.center.feature.data.coordinates[1]
        }, maxRadiusDistance +  maxRadiusDistance*0.2, 0);
        this.addRadius.feature.data.coordinates = [newRadiusPosition.x, newRadiusPosition.y];
        items.push(this.addRadius.feature);
      }

    }

  } else {
    // If we are updating the center point, we need to move the center vertex
    // to a new location and we need to update the vertex of the radius location.
      this.featureCopy.data.type = "LineString";
      this.featureCopy.data.coordinates = [
        [pointer.lon, pointer.lat]
      ];


    // First update the control point with new pointer info.
    currentFeature.data.coordinates = [pointer.lon, pointer.lat];

    // retrieve our distance from the existing circle.  We will use this to Calculate
    // the position of the new radius vertex.
    for (index = 0; index < this.featureCopy.properties.modifiers.distance.length; index++) {
      distance = this.featureCopy.properties.modifiers.distance[index];
      newRadiusPosition = emp.geoLibrary.geodesic_coordinate({
        x: pointer.lon,
        y: pointer.lat
      }, distance, 0);
      var vertex = this.vertices.getVertexByIndex(index);
      var feature = vertex.feature;
      feature.data.coordinates = [newRadiusPosition.x, newRadiusPosition.y];
      items.push(feature);
    } //for

    if (this.addRadius)
    {
      this.featureCopy.properties.modifiers.distance.max = function() { return  Math.max.apply(Math, this); }; //attach max funct
      maxRadiusDistance =  this.featureCopy.properties.modifiers.distance.max();
      if (!maxRadiusDistance)
      {
        // no circles present. use a default distance
        maxRadiusDistance = 5000;
      }
      distance =   maxRadiusDistance;
      newRadiusPosition = emp.geoLibrary.geodesic_coordinate({
        x: pointer.lon,
        y: pointer.lat
      }, distance + distance*0.2, 0);
      this.addRadius.feature.data.coordinates = [newRadiusPosition.x, newRadiusPosition.y];
      items.push(this.addRadius.feature);
    }
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
 * Occurs when the map is clicked after the draw has started.
 */
emp.editors.MilStdCircularRangeFan.prototype.drawDoubleClick = function(pointer) {
  var coordinateUpdate,
    updateData,
    items = [],
    updateTransaction,
    index,
    newCoordinates,
    i, currentVertex, previousVertex, NextVertex;

  if (pointer.target.toLowerCase() === "feature" && this.vertices.vertexLength > 1) {
    // check if control point was clicked
    currentVertex = this.vertices.find(pointer.featureId);
    if (currentVertex && currentVertex.type === "vertex") {
      index = this.vertices.getIndex(pointer.featureId);
      //remove distance from modifiers
      this.featureCopy.properties.modifiers.distance.splice(index,1);
      items.push(currentVertex.feature);
      this.vertices.remove(currentVertex.feature.featureId);

      var removeTransaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.FEATURE_REMOVE,
        mapInstanceId: this.mapInstance.mapInstanceId,
        transactionId: null,
        sender: this.mapInstance.mapInstanceId,
        originChannel: cmapi.channel.names.MAP_FEATURE_UNPLOT,
        source: emp.api.cmapi.SOURCE,
        messageOriginator: this.mapInstance.mapInstanceId,
        originalMessageType: cmapi.channel.names.MAP_FEATURE_UNPLOT,
        items: items
      });

      //remove selected vertex and 2 add verteces from engine.
      removeTransaction.run();

      items = [];

      // insert  add vertex again
      if (!this.addRadius && this.featureCopy.properties.modifiers.distance && this.featureCopy.properties.modifiers.distance.length < 3)
      {
        this.featureCopy.properties.modifiers.distance.max = function() { return  Math.max.apply(Math, this); }; //attach max funct
        maxRadiusDistance =  this.featureCopy.properties.modifiers.distance.max();
        if (!maxRadiusDistance)
        {
          // no circles present. use a default distance
          maxRadiusDistance = 5000;
        }
        var newPoint = emp.geoLibrary.geodesic_coordinate({
          x: this.center.feature.data.coordinates[0],
          y: this.center.feature.data.coordinates[1]
        }, maxRadiusDistance + maxRadiusDistance*0.2, 0);
        var addPoint = new emp.typeLibrary.Feature({
          overlayId: "vertices",
          featureId: emp3.api.createGUID(),
          format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
          data: {
            coordinates: [newPoint.x, newPoint.y],
            type: 'Point'
          },
          properties: {
            iconUrl: emp.ui.images.addPoint  ,
            iconXOffset: 10,
            iconYOffset: 10,
            xUnits: "pixels",
            yUnits: "pixels",
            altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
          }
        });

        items.push(addPoint);
        radiusVertex = new emp.editors.Vertex(addPoint, "add");
        radiusVertex.distance = maxRadiusDistance;
        this.addRadius = radiusVertex;
        this.vertices.push(radiusVertex);
      }
      else if (this.addRadius)
      {
        //reposition ad control point
        this.featureCopy.properties.modifiers.distance.max = function() { return  Math.max.apply(Math, this); }; //attach max funct
        maxRadiusDistance =  this.featureCopy.properties.modifiers.distance.max();
        if (!maxRadiusDistance)
        {
          // no circles present. use a default distance
          maxRadiusDistance = 5000;
        }
        //distance =   maxRadiusDistance;
        newRadiusPosition = emp.geoLibrary.geodesic_coordinate({
          x: this.center.feature.data.coordinates[0],
          y: this.center.feature.data.coordinates[1]
        }, maxRadiusDistance +  maxRadiusDistance*0.2, 0);
        this.addRadius.feature.data.coordinates = [newRadiusPosition.x, newRadiusPosition.y];
        items.push(this.addRadius.feature);
      }

      // update feature copy
    //  this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();
      // update line
      items.push(this.featureCopy);

      updateTransaction = new emp.typeLibrary.Transaction({
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

      updateTransaction.run();


      // return updateData
      // Create the return object.  This will tell you which index was added,
      // the locations of the new indices, and the type of change it was.
      //
      // The coordinates will be formatted slightly different it is a GEO_MIL_SYMBOL.
      // We need to first account for that.
      newCoordinates = [];

      for (i = 0; i < this.featureCopy.data.coordinates.length; i++) {
        newCoordinates.push({
          lat: this.featureCopy.data.coordinates[i][1],
          lon: this.featureCopy.data.coordinates[i][0]
        });
      }


      //index = this.vertices.vertexLength - 1;

      coordinateUpdate = {
        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
        indices: [index],//currentVertexIndex is the vertex that was removed
        coordinates: newCoordinates
      };

      updateData = {};
      updateData.coordinateUpdate = coordinateUpdate;
      updateData.properties = this.featureCopy.properties;

    }//   if (currentVertex && currentVertex.type === "vertex")
  }// if (pointer.target.toLowerCase() === "feature" && this.vertices.vertexLength > 3) {


  return updateData;
};

/**
 * Moves control point passed in to the new location provided.
 * Also updates the control point and the feature with the change.
 */
emp.editors.MilStdCircularRangeFan.prototype.moveControlPoint = function(featureId, pointer) {
  // startMoveControlPoint does everything we need to do.
  return this.startMoveControlPoint(featureId, pointer);
};

/**
 * Moves control point passed in to the new location provided.
 * Also updates the control point and the feature with the change.
 */
emp.editors.MilStdCircularRangeFan.prototype.endMoveControlPoint = function(featureId, pointer) {
  // startMoveControlPoint does everything we need to do.
  return this.startMoveControlPoint(featureId, pointer);
};

/**
 * Moves the entire feature, offsetting from the starting position.
 */
emp.editors.MilStdCircularRangeFan.prototype.moveFeature = function() {
  // do not do anything here.  We do not want to let users move the feature.
};
