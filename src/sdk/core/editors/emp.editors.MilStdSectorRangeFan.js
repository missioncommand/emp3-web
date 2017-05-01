emp.editors = emp.editors || {};

/**
 * Provides the instructions for editing a sector range fan to the editingManager.
 * Provides and shows the control points and how the shape should change
 * when the control points move.
 */
emp.editors.MilStdSectorRangeFan = function(args) {

  this.center = undefined;
  this.prevDistance = 0;
  emp.editors.EditorBase.call(this, args);

  /**
   * Retrieves all the stored distances in vertices, and returns
   * them in the format needed for the renderer.
   */
  this.getDistances = function() {
    var distances = [];
    var currentVertex;

    currentVertex = this.vertices.head;
    while (currentVertex !== null) {
      if (currentVertex.distance) {
        distances.push(currentVertex.distance);
      }
      currentVertex = currentVertex.next;
    }

    return distances;
  };

  /**
   * Retrieves all the stored azimuths in vertices, and returns
   * them in the format needed for the renderer.
   */
  this.getAzimuths = function() {
    var azimuths = [];
    var currentVertex;

    currentVertex = this.vertices.head;
    while (currentVertex !== null) {
      if (currentVertex.leftAzimuth) {
        azimuths.push(currentVertex.leftAzimuth);
        currentVertex = currentVertex.next;
        azimuths.push(currentVertex.rightAzimuth);
      }
      currentVertex = currentVertex.next;
    }

    return azimuths;
  };

};

emp.editors.MilStdSectorRangeFan.prototype = Object.create(emp.editors.EditorBase.prototype);
emp.editors.MilStdSectorRangeFan.prototype.constructor = emp.editors.MilStdSectorRangeFan;

/**
 * Adds the control points to the map for an edit or a draw.
 */
emp.editors.MilStdSectorRangeFan.prototype.addControlPoints = function() {

  var centerPoint,
    transaction,
    items = [],
    centerVertex,
    x, y, i,
    distance,
    prevDistance = 0, // The distance before the current distance when iterating through our distances.
    distanceLength,
    //azimuthLength,
    leftAzimuth,
    leftAzimuthPosition,
    leftAzimuthPoint,
    leftAzimuthVertex,
    rightAzimuth,
    rightAzimuthPosition,
    rightAzimuthPoint,
    rightAzimuthVertex,
    distancePoint,
    distanceVertex,
    midAzimuth;

  // retrieve the center coordinate.
  x = this.featureCopy.data.coordinates[0][0];
  y = this.featureCopy.data.coordinates[0][1];

  // Create a feature on the map for the center of the sector.  This is
  // the center vertex.
  centerPoint = new emp.typeLibrary.Feature({
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
  centerVertex = new emp.editors.Vertex(centerPoint, "vertex");
  this.vertices.push(centerVertex);
  this.center = centerVertex;
  items.push(centerPoint);

  // Make sure we have the necessary properties to edit.  Otherwise skip
  // adding those vertices.
  if (this.featureCopy.properties && this.featureCopy.properties.modifiers &&
    this.featureCopy.properties.modifiers.distance &&
    this.featureCopy.properties.modifiers.azimuth) {

    distanceLength = this.featureCopy.properties.modifiers.distance.length;
    //azimuthLength = this.featureCopy.properties.modifiers.azimuth.length;

    for (i = 0; i < distanceLength; i++) {

      distance = this.featureCopy.properties.modifiers.distance[i];
      leftAzimuth = this.featureCopy.properties.modifiers.azimuth[i * 2];
      rightAzimuth = this.featureCopy.properties.modifiers.azimuth[(i * 2) + 1];
      midAzimuth = leftAzimuth + ((rightAzimuth - leftAzimuth) / 2);

      distancePoint = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, distance, midAzimuth);

      console.log("%s, %s, %s", distance, prevDistance, prevDistance + ((distance - prevDistance) / 2));

      rightAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, prevDistance + ((distance - prevDistance) / 2), rightAzimuth);

      leftAzimuthPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, prevDistance + ((distance - prevDistance) / 2), leftAzimuth);
      prevDistance = distance;

      // Create a feature on the map for the center of the sector.  This is
      // the center vertex.
      distancePoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: [distancePoint.x, distancePoint.y],
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
      items.push(distancePoint);
      distanceVertex = new emp.editors.Vertex(distancePoint, "add");
      this.vertices.push(distanceVertex);

      leftAzimuthPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: [leftAzimuthPosition.x, leftAzimuthPosition.y],
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

      items.push(leftAzimuthPoint);
      leftAzimuthVertex = new emp.editors.Vertex(leftAzimuthPoint, "add");
      this.vertices.push(leftAzimuthVertex);

      // Create a feature on the map for the center of the sector.  This is
      // the center vertex.
      rightAzimuthPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: [rightAzimuthPosition.x, rightAzimuthPosition.y],
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
      items.push(rightAzimuthPoint);
      rightAzimuthVertex = new emp.editors.Vertex(rightAzimuthPoint, "add");
      this.vertices.push(rightAzimuthVertex);
    }
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
 * Indicates the drawing has started and the first click has
 * been made.  Respond accordingly.
 *
 * In the case of the line, we just track the first point. nothing.
 * occurs until the mouse is moved.
 */
emp.editors.MilStdSectorRangeFan.prototype.drawStart = function(pointer) {
  var coordinateUpdate,
    updateData = {},
    centerPoint,
    vertex,
    items = [],
    transaction;

  // Create the center vertex.
  centerPoint = new emp.typeLibrary.Feature({
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

  vertex = new emp.editors.Vertex(centerPoint, "vertex");
  this.vertices.push(vertex);
  items.push(centerPoint);

  this.center = vertex;

  // Update the feature, only internally -- we don't want events sent out
  // from this as we do not have enough info to create the symbol yet.
  this.featureCopy = new emp.typeLibrary.Feature({
    overlayId: this.featureCopy.overlayId,
    featureId: this.featureCopy.featureId,
    format: this.featureCopy.format,
    data: {
      type: "LineString",
      coordinates: [
        [
          [pointer.lon, pointer.lat]
        ]
      ],
      symbolCode: this.featureCopy.symbolCode
    },
    properties: this.featureCopy.properties
  });

  if (!this.featureCopy.properties) {
    this.featureCopy.properties = {};
  }

  if (!this.featureCopy.properties.modifiers) {
    this.featureCopy.properties.modifiers = {};
  }

  // Place the vertex that you clicked on the map.
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

  // Create the return object.  This will tell you which index was changed,
  // the locations of the new indeces, and the type of change it was.
  coordinateUpdate = {
    type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
    indices: [0],
    coordinates: this.vertices.getVerticesAsLineString()
  };

  updateData.coordinateUpdate = coordinateUpdate;
  updateData.properties = this.featureCopy.properties;

  return updateData;

};


/**
 * Occurs when the map is clicked after the draw has started.  In the
 * case of the sector range fan, each click is a new ring.  A new ring
 * means a new item in the distance modifier of the MIL-STD-2525 symbol,
 * as well as 2 new azimuth properties.  For each click we may need to rearrange
 * the rings to accomodate the new position.
 */
emp.editors.MilStdSectorRangeFan.prototype.drawClick = function(pointer) {
  var coordinateUpdate,
    updateData = {},
    distancePoint,
    distanceVertex,
    currentVertex,
    distance,
    prevDistance = 0, // The distance before the current distance when iterating through our distances.
    azimuth,
    leftAzimuth,
    rightAzimuth,
    leftAzimuthCoordinate,
    rightAzimuthCoordinate,
    leftAzimuthPoint,
    rightAzimuthPoint,
    leftAzimuthVertex,
    rightAzimuthVertex,
    items = [],
    newCoordinates,
    i,
    updateTransaction;

  // second and third points and fourth points are very different.  For second point, we draw a line
  // just to show marking.

  // Verify this point is different than the center point. Otherwise ignore.
  if (this.vertices.head.feature.data.coordinates[0] !== pointer.lon ||
    this.vertices.head.feature.data.coordinates[1] !== pointer.lat) {

    // create a point where the user clicked.  This will be the sector location.
    distancePoint = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [pointer.lon, pointer.lat],
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

    // get the distance of the new point from the center.
    distance = emp.geoLibrary.measureDistance(pointer.lat,
      pointer.lon,
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

    distanceVertex = new emp.editors.Vertex(distancePoint, "add");
    distanceVertex.distance = distance;

    // insert the distance point in the vertices where it belongs.  The vertices
    // will be from lowest to highest. So we will have to find the sector distance that
    // is less than the current calculated distance.  If a distance is less than the
    // current calculated distance, skip it.
    currentVertex = this.center;

    while (currentVertex !== null) {
      if (distance < currentVertex.distance) {
        break;
      }
      currentVertex = currentVertex.next;
    }

    if (currentVertex === null) {
      this.vertices.append(this.vertices.tail.feature.featureId, distanceVertex);
    }
    else {
      this.vertices.insert(currentVertex.feature.featureId, distanceVertex);
    }

    // calculate the left and right azimuth positions.
    //
    // First get the angle at which the point was clicked.
    azimuth = emp.geoLibrary.GetAzimuth({
      x: this.center.feature.data.coordinates[0],
      y: this.center.feature.data.coordinates[1]
    }, {
      x: pointer.lon,
      y: pointer.lat
    });

    leftAzimuth = azimuth - 45;
    rightAzimuth = azimuth + 45;

    console.log("%s, %s, %s", distance, this.prevDistance, this.prevDistance + ((distance - this.prevDistance) / 2));

    // get the coordinates of the left and right azimuth anchors.
    leftAzimuthCoordinate = emp.geoLibrary.geodesic_coordinate({
      x: this.center.feature.data.coordinates[0],
      y: this.center.feature.data.coordinates[1]
    }, this.prevDistance + ((distance - this.prevDistance) / 2), leftAzimuth);
    rightAzimuthCoordinate = emp.geoLibrary.geodesic_coordinate({
      x: this.center.feature.data.coordinates[0],
      y: this.center.feature.data.coordinates[1]
    }, this.prevDistance + ((distance - this.prevDistance) / 2), rightAzimuth);
    this.prevDistance = distance;

    // create two new azimuths of 45 degreese left and right of the current point at
    // the same distance the user clicked.
    leftAzimuthPoint = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [leftAzimuthCoordinate.x, leftAzimuthCoordinate.y],
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

    rightAzimuthPoint = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [rightAzimuthCoordinate.x, rightAzimuthCoordinate.y],
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

    leftAzimuthVertex = new emp.editors.Vertex(leftAzimuthPoint, "add");
    leftAzimuthVertex.leftAzimuth = leftAzimuth;
    rightAzimuthVertex = new emp.editors.Vertex(rightAzimuthPoint, "add");
    rightAzimuthVertex.rightAzimuth = rightAzimuth;

    // insert the azimuths at the same location as where the distance was located.
    this.vertices.append(distanceVertex.feature.featureId, leftAzimuthVertex);
    this.vertices.append(leftAzimuthVertex.feature.featureId, rightAzimuthVertex);

    items.push(leftAzimuthPoint);
    items.push(rightAzimuthPoint);
    items.push(distancePoint);

    // update feature copy
    this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();
    this.featureCopy.properties.modifiers.distance = this.getDistances();
    this.featureCopy.properties.modifiers.azimuth = this.getAzimuths();

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

    coordinateUpdate = {
      type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
      indices: [],
      coordinates: newCoordinates
    };

    updateData.coordinateUpdate = coordinateUpdate;
    updateData.properties = this.featureCopy.properties;
  }

  return updateData;
};

/**
 * Occurs after the draw has started and user is moving mouse.
 * Animation should occur here.
 */
emp.editors.MilStdPolygon.prototype.drawMove = function() {

};
