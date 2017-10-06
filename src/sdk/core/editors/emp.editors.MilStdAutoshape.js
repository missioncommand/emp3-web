/*global LatLon*/
emp.editors = emp.editors || {};

/**
 * Controls the vertices on the map for a MIL-STD-2525 symbol
 * with a finite number of points during an edit or draw and the animation.
 *
 * @param {Object} args All parmaters are members of the args object.
 * @param {string} args.feature The feature of the item we are editing.
 * @param {string} args.mapInstanceId The id of the mapInstance to which the
 * editing is occurring.
 */
emp.editors.MilStdAutoshape = function(args) {


  var symbolDef = emp.util.getSymbolDef(args.feature);

  // holds the map that this editor was made for.
  this.mapInstance = args.mapInstance;

  // get the draw category of the symbol
  this.drawCategory = symbolDef.drawCategory;

  // determine the number of points in the symbol.
  this.numPoints = symbolDef.minPoints;
  this.numPoints = symbolDef.maxPoints;

  emp.editors.EditorBase.call(this, args);

  /**
   * Calculates sample points for a 2-point MIL-STD-2525 shape.
   */
  this.calculateTwoPointShape = function(width, height, x, y) {
    var controlPoint1,
      controlPoint2,
      vertex1,
      vertex2,
      left,
      items = [];

    // create the feature, don't populate the coordinate, we will populate later
    this.featureCopy = new emp.typeLibrary.Feature({
      overlayId: this.featureCopy.overlayId,
      featureId: this.featureCopy.featureId,
      format: this.featureCopy.format,
      data: {
        type: "LineString",
        coordinates: [],
        symbolCode: this.featureCopy.symbolCode
      },
      properties: this.featureCopy.properties
    });

    // initialize control points, just set the coordinates later:
    controlPoint1 = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [],
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

    // initialize control points, just set the coordinates later:
    controlPoint2 = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [],
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

    left = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, width / 2, 0);

    controlPoint1.data.coordinates = [x, y];
    controlPoint2.data.coordinates = [left.x, left.y];

    items.push(controlPoint1);
    items.push(controlPoint2);
    items.push(this.featureCopy);

    vertex1 = new emp.editors.Vertex(controlPoint1, "vertex");
    vertex2 = new emp.editors.Vertex(controlPoint2, "vertex");

    this.vertices.push(vertex1);
    this.vertices.push(vertex2);

    return items;
  };

  /**
   * Calculates sample points for a 3-point MIL-STD-2525 shape.
   */
  this.calculateThreePointShape = function(width, height, x, y) {
    var controlPoint1,
      controlPoint2,
      controlPoint3,
      vertex1,
      vertex2,
      vertex3,
      bottom,
      top,
      topLeft,
      topRight,
      items = [];

    // create the feature, don't populate the coordinate, we will populate later
    this.featureCopy = new emp.typeLibrary.Feature({
      overlayId: this.featureCopy.overlayId,
      featureId: this.featureCopy.featureId,
      format: this.featureCopy.format,
      data: {
        type: "LineString",
        coordinates: [],
        symbolCode: this.featureCopy.symbolCode
      },
      properties: this.featureCopy.properties
    });

    // initialize control points, just set the coordinates later:
    controlPoint1 = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [],
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

    // initialize control points, just set the coordinates later:
    controlPoint2 = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [],
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

    // initialize control points, just set the coordinates later:
    controlPoint3 = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [],
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

    top = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, height / 2, 0);
    bottom = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, height / 2, 180);
    topLeft = emp.geoLibrary.geodesic_coordinate({
      x: top.x,
      y: top.y
    }, width / 2, -90);
    topRight = emp.geoLibrary.geodesic_coordinate({
      x: top.x,
      y: top.y
    }, width / 2, 90);

    controlPoint1.data.coordinates = [topLeft.x, topLeft.y];
    controlPoint2.data.coordinates = [topRight.x, topRight.y];
    controlPoint3.data.coordinates = [bottom.x, bottom.y];

    items.push(controlPoint1);
    items.push(controlPoint2);
    items.push(controlPoint3);
    items.push(this.featureCopy);

    vertex1 = new emp.editors.Vertex(controlPoint1, "vertex");
    vertex2 = new emp.editors.Vertex(controlPoint2, "vertex");
    vertex3 = new emp.editors.Vertex(controlPoint3, "vertex");

    this.vertices.push(vertex1);
    this.vertices.push(vertex2);
    this.vertices.push(vertex3);

    return items;
  };

  /**
   * Calculates sample points for a 4-point MIL-STD-2525 shape.
   */
  this.calculateFourPointShape = function(width, height, x, y) {
    var controlPoint1,
      controlPoint2,
      controlPoint3,
      controlPoint4,
      vertex1,
      vertex2,
      vertex3,
      vertex4,
      top,
      bottom,
      topLeft,
      topRight,
      bottomLeft,
      bottomRight,
      items = [];

    // create the feature, don't populate the coordinate, we will populate later
    this.featureCopy = new emp.typeLibrary.Feature({
      overlayId: this.featureCopy.overlayId,
      featureId: this.featureCopy.featureId,
      format: this.featureCopy.format,
      data: {
        type: "LineString",
        coordinates: [],
        symbolCode: this.featureCopy.symbolCode
      },
      properties: this.featureCopy.properties
    });

    // initialize control points, just set the coordinates later:
    controlPoint1 = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [],
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

    // initialize control points, just set the coordinates later:
    controlPoint2 = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [],
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

    // initialize control points, just set the coordinates later:
    controlPoint3 = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [],
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

    // initialize control points, just set the coordinates later:
    controlPoint4 = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [],
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

    top = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, height / 2, 0);
    bottom = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, height / 2, 180);
    topLeft = emp.geoLibrary.geodesic_coordinate({
      x: top.x,
      y: top.y
    }, width / 2, -90);
    topRight = emp.geoLibrary.geodesic_coordinate({
      x: top.x,
      y: top.y
    }, width / 2, 90);
    bottomLeft = emp.geoLibrary.geodesic_coordinate({
      x: bottom.x,
      y: bottom.y
    }, width / 2, -90);
    bottomRight = emp.geoLibrary.geodesic_coordinate({
      x: bottom.x,
      y: bottom.y
    }, width / 2, 90);

    controlPoint1.data.coordinates = [topLeft.x, topLeft.y];
    controlPoint2.data.coordinates = [topRight.x, topRight.y];
    controlPoint3.data.coordinates = [bottomRight.x, bottomRight.y];
    controlPoint4.data.coordinates = [bottomLeft.x, bottomLeft.y];

    items.push(controlPoint1);
    items.push(controlPoint2);
    items.push(controlPoint3);
    items.push(controlPoint4);
    items.push(this.featureCopy);

    vertex1 = new emp.editors.Vertex(controlPoint1, "vertex");
    vertex2 = new emp.editors.Vertex(controlPoint2, "vertex");
    vertex3 = new emp.editors.Vertex(controlPoint3, "vertex");
    vertex4 = new emp.editors.Vertex(controlPoint4, "vertex");

    this.vertices.push(vertex1);
    this.vertices.push(vertex2);
    this.vertices.push(vertex3);
    this.vertices.push(vertex4);

    return items;
  };
};

emp.editors.MilStdAutoshape.prototype = Object.create(emp.editors.EditorBase.prototype);
emp.editors.MilStdAutoshape.prototype.constructor = emp.editors.MilStdAutoshape;

/**
 * Occurs when the map is clicked for the frist time after the draw has started.
 */
emp.editors.MilStdAutoshape.prototype.drawStart = function(pointer) {
  var bounds,
    mapHeight,
    mapWidth,
    width,
    height,
    items = [],
    transaction,
    updateData,
    indices;

  // determine the current map size
  bounds = this.mapInstance.status.getViewBounds();
  mapWidth = emp.geoLibrary.measureDistance(
    bounds.south,
    bounds.west,
    bounds.south,
    bounds.east, "meters");
  mapHeight = emp.geoLibrary.measureDistance(
    bounds.south,
    bounds.west,
    bounds.north,
    bounds.west, "meters");

  width = mapWidth / 8;
  height = mapHeight / 8;

  // create the feature, don't populate the coordinate, we will populate later
  this.featureCopy = new emp.typeLibrary.Feature({
    overlayId: this.featureCopy.overlayId,
    featureId: this.featureCopy.featureId,
    format: this.featureCopy.format,
    data: {
      type: "LineString",
      coordinates: [],
      symbolCode: this.featureCopy.symbolCode
    },
    properties: this.featureCopy.properties
  });

  // create vertices for the symbol.
  switch (this.numPoints) {
    case 2:
      items = this.calculateTwoPointShape(width, height, pointer.lon, pointer.lat);
      indices = [0, 1];
      break;
    case 3:
      items = this.calculateThreePointShape(width, height, pointer.lon, pointer.lat);
      indices = [0, 1, 2];
      break;
    case 4:
      items = this.calculateFourPointShape(width, height, pointer.lon, pointer.lat);
      indices = [0, 1, 2, 3];
      break;
  }

  // update feature copy with the new coordinates.
  this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();

  // Add the feature, along with all of its control points.
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

  // return updateData
  // Create the return object.  This will tell you which index was added,
  // the locations of the new indices, and the type of change it was.
  updateData = this.getUpdateData();

  if (updateData) {
    // override the default indices passed back, as this editor adds all
    // the points at once.
    updateData.coordinateUpdate.indices = indices;
  }

  return updateData;
};

/**
 * Occurs after the draw has started and user is moving mouse.
 * Animation should occur here.
 */
emp.editors.MilStdAutoshape.prototype.drawMove = function( /*pointer*/ ) {
  //
};


/**
 * Occurs first when the control point is moved.  This method is called prior
 * to moveControlPoint.  It allows us to initialize the
 * behavior of what happens prior to the move.
 *
 * @return {CoreEditUpdataData} Contains information about the changes that
 * occurred during the movement of a control point.
 */
emp.editors.MilStdAutoshape.prototype.startMoveControlPoint = function(featureId, pointer) {

  var index,
    newCoordinates,
    coordinateUpdate,
    updateData = {},
    items = [],
    oldPt0, oldPt1, oldPt2, oldCenterPt, oldBearing, distCenterToPt2,
    newDistCenterToPt2, bearing, deltaBearing, pt0, pt1, pt2, pt3, distPt0ToPt2, distPt1ToPt3,
    featureForPt2, featureForPt3, newCenterPt, //zeta, featureForPt1, distPt0ToPt1, distPt0ToPt2, distPt1ToPt2,oldBearingPt0ToPt2 , oldBearingPt1ToPt2
    coordinates;

  // Grab the actual feature associated with this control point featureId.
  var newFeature = this.vertices.findFeature(featureId);
  index = this.vertices.getIndex(featureId);
  if (this.featureCopy.data.coordinates.length === 3 && this.drawCategory === 15) {
    //block task or similar graphic
    if (index === 0) {
      oldPt0 = new LatLon(this.featureCopy.data.coordinates[0][1], this.featureCopy.data.coordinates[0][0]);
      oldPt1 = new LatLon(this.featureCopy.data.coordinates[1][1], this.featureCopy.data.coordinates[1][0]);
      oldPt2 = new LatLon(this.featureCopy.data.coordinates[2][1], this.featureCopy.data.coordinates[2][0]);
      oldCenterPt = oldPt0.midpointTo(oldPt1);
      oldBearing = oldCenterPt.bearingTo(oldPt1);
      distCenterToPt2 = oldCenterPt.distanceTo(oldPt2);
      pt0 = new LatLon(pointer.lat, pointer.lon);
      newCenterPt = pt0.midpointTo(oldPt1);
      bearing = newCenterPt.bearingTo(oldPt1);
      deltaBearing = oldBearing - bearing;
      deltaBearing = 90;

      pt2 = newCenterPt.destinationPoint(bearing + deltaBearing, distCenterToPt2);

      newFeature.data.coordinates = [pointer.lon, pointer.lat];
      items.push(newFeature);
      featureForPt2 = this.vertices.getVertexByIndex(2).feature;
      featureForPt2.data.coordinates = [pt2.lon(), pt2.lat()];
      items.push(featureForPt2);

    } else if (index === 1) {
      oldPt0 = new LatLon(this.featureCopy.data.coordinates[0][1], this.featureCopy.data.coordinates[0][0]);
      oldPt1 = new LatLon(this.featureCopy.data.coordinates[1][1], this.featureCopy.data.coordinates[1][0]);
      oldPt2 = new LatLon(this.featureCopy.data.coordinates[2][1], this.featureCopy.data.coordinates[2][0]);
      oldCenterPt = oldPt0.midpointTo(oldPt1);
      distCenterToPt2 = oldCenterPt.distanceTo(oldPt2);
      pt1 = new LatLon(pointer.lat, pointer.lon);
      newCenterPt = pt1.midpointTo(oldPt0);
      bearing = newCenterPt.bearingTo(pt1);
      deltaBearing = 90;
      pt2 = newCenterPt.destinationPoint(bearing + deltaBearing, distCenterToPt2);

      newFeature.data.coordinates = [pointer.lon, pointer.lat];
      items.push(newFeature);
      featureForPt2 = this.vertices.getVertexByIndex(2).feature;
      featureForPt2.data.coordinates = [pt2.lon(), pt2.lat()];
      items.push(featureForPt2);

    } else if (index === 2) {
      oldPt0 = new LatLon(this.featureCopy.data.coordinates[0][1], this.featureCopy.data.coordinates[0][0]);
      oldPt1 = new LatLon(this.featureCopy.data.coordinates[1][1], this.featureCopy.data.coordinates[1][0]);
      oldPt2 = new LatLon(this.featureCopy.data.coordinates[2][1], this.featureCopy.data.coordinates[2][0]);
      oldCenterPt = oldPt0.midpointTo(oldPt1);
      bearing = oldCenterPt.bearingTo(oldPt1);
      pt2 = new LatLon(pointer.lat, pointer.lon);
      newDistCenterToPt2 = oldCenterPt.distanceTo(pt2);

      pt2 = oldCenterPt.destinationPoint(bearing + 90, newDistCenterToPt2);
      newFeature.data.coordinates = [pt2.lon(), pt2.lat()];

      items.push(newFeature);

    }

  } else if (this.featureCopy.coordinates.length === 4 && this.drawCategory === 15) {
    //bridge or gap  or similar graphic
    if (index === 0) {
      oldPt0 = new LatLon(this.featureCopy.data.coordinates[0][1], this.featureCopy.data.coordinates[0][0]);
      oldPt1 = new LatLon(this.featureCopy.data.coordinates[1][1], this.featureCopy.data.coordinates[1][0]);
      oldPt2 = new LatLon(this.featureCopy.data.coordinates[2][1], this.featureCopy.data.coordinates[2][0]);
      //oldPt3  = new LatLon(this.featureCopy.data.coordinates[3][1], this.featureCopy.data.coordinates[3][0]);

      oldCenterPt = oldPt0.midpointTo(oldPt1);
      oldBearing = oldCenterPt.bearingTo(oldPt1);
      distPt0ToPt2 = oldPt0.distanceTo(oldPt2);
      //oldBearingPt0ToPt2 = oldPt0.bearingTo(oldPt2);
      pt0 = new LatLon(pointer.lat, pointer.lon);
      newCenterPt = pt0.midpointTo(oldPt1);
      bearing = newCenterPt.bearingTo(oldPt1);
      deltaBearing = oldBearing - bearing;
      deltaBearing = 90;

      pt2 = pt0.destinationPoint(bearing + deltaBearing, distPt0ToPt2);
      pt3 = oldPt1.destinationPoint(bearing + deltaBearing, distPt0ToPt2);

      newFeature.data.coordinates = [pointer.lon, pointer.lat];
      items.push(newFeature);
      featureForPt2 = this.vertices.getVertexByIndex(2).feature;
      featureForPt2.data.coordinates = [pt2.lon(), pt2.lat()];
      featureForPt3 = this.vertices.getVertexByIndex(3).feature;
      featureForPt3.data.coordinates = [pt3.lon(), pt3.lat()];
      items.push(featureForPt2);
      items.push(featureForPt3);

    } else if (index === 1) {
      oldPt0 = new LatLon(this.featureCopy.data.coordinates[0][1], this.featureCopy.data.coordinates[0][0]);
      oldPt1 = new LatLon(this.featureCopy.data.coordinates[1][1], this.featureCopy.data.coordinates[1][0]);
      oldPt2 = new LatLon(this.featureCopy.data.coordinates[2][1], this.featureCopy.data.coordinates[2][0]);
      oldCenterPt = oldPt0.midpointTo(oldPt1);
      distPt0ToPt2 = oldPt0.distanceTo(oldPt2);
      pt1 = new LatLon(pointer.lat, pointer.lon);
      newCenterPt = pt1.midpointTo(oldPt0);
      bearing = newCenterPt.bearingTo(pt1);
      deltaBearing = 90;

      pt2 = oldPt0.destinationPoint(bearing + deltaBearing, distPt0ToPt2);
      pt3 = pt1.destinationPoint(bearing + deltaBearing, distPt0ToPt2);

      newFeature.data.coordinates = [pointer.lon, pointer.lat];
      items.push(newFeature);
      featureForPt2 = this.vertices.getVertexByIndex(2).feature;
      featureForPt2.data.coordinates = [pt2.lon(), pt2.lat()];
      featureForPt3 = this.vertices.getVertexByIndex(3).feature;
      featureForPt3.data.coordinates = [pt3.lon(), pt3.lat()];
      items.push(featureForPt2);
      items.push(featureForPt3);

    } else if (index === 2) {
      oldPt0 = new LatLon(this.featureCopy.data.coordinates[0][1], this.featureCopy.data.coordinates[0][0]);
      oldPt1 = new LatLon(this.featureCopy.data.coordinates[1][1], this.featureCopy.data.coordinates[1][0]);
      oldPt2 = new LatLon(this.featureCopy.data.coordinates[2][1], this.featureCopy.data.coordinates[2][0]);
      oldCenterPt = oldPt0.midpointTo(oldPt1);
      bearing = oldCenterPt.bearingTo(oldPt1);
      pt2 = new LatLon(pointer.lat, pointer.lon);
      distPt0ToPt2 = oldPt0.distanceTo(pt2);

      pt2 = oldPt0.destinationPoint(bearing + 90, distPt0ToPt2);
      pt3 = oldPt1.destinationPoint(bearing + 90, distPt0ToPt2);
      newFeature.data.coordinates = [pt2.lon(), pt2.lat()];
      featureForPt3 = this.vertices.getVertexByIndex(3).feature;
      featureForPt3.data.coordinates = [pt3.lon(), pt3.lat()];

      items.push(newFeature);
      items.push(featureForPt3);

    } else if (index === 3) {
      oldPt0 = new LatLon(this.featureCopy.data.coordinates[0][1], this.featureCopy.data.coordinates[0][0]);
      oldPt1 = new LatLon(this.featureCopy.data.coordinates[1][1], this.featureCopy.data.coordinates[1][0]);
      oldCenterPt = oldPt0.midpointTo(oldPt1);
      bearing = oldCenterPt.bearingTo(oldPt1);
      pt3 = new LatLon(pointer.lat, pointer.lon);
      distPt1ToPt3 = oldPt1.distanceTo(pt3);

      pt2 = oldPt0.destinationPoint(bearing + 90, distPt1ToPt3);
      pt3 = oldPt1.destinationPoint(bearing + 90, distPt1ToPt3);
      newFeature.data.coordinates = [pt3.lon(), pt3.lat()];
      featureForPt2 = this.vertices.getVertexByIndex(2).feature;
      featureForPt2.data.coordinates = [pt2.lon(), pt2.lat()];

      items.push(newFeature);
      items.push(featureForPt2);
    }
  } else {
    // assign the control point the new coordinates.
    newFeature.data.coordinates = [pointer.lon, pointer.lat];

    // make it one of the items that needs to be updated.
    items.push(newFeature);

  }

  // update the actual feature that is being edited.
  // Normalize the coordinates so we can handle them the same.
  if (this.featureCopy.data.type === 'LineString') {
    this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();
  } else if (this.featureCopy.data.type === 'Polygon') {
    this.featureCopy.data.coordinates = this.vertices.getVerticesAsPolygon();
  }

  items.push(this.featureCopy);

  // Update the position of the control point.
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

  // Normalize the coordinates so we can handle them the same.
  if (this.featureCopy.data.type === 'LineString') {
    length = this.featureCopy.data.coordinates.length;
    coordinates = this.featureCopy.data.coordinates;
  } else if (this.featureCopy.data.type === 'Polygon') {
    length = this.featureCopy.data.coordinates[0].length;
    coordinates = this.featureCopy.data.coordinates[0];
  }

  for (var i = 0; i < coordinates.length; i++) {
    newCoordinates.push({
      lat: coordinates[i][1],
      lon: coordinates[i][0]
    });
  }

  coordinateUpdate = {
    type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
    indices: [index],
    coordinates: newCoordinates
  };

  updateData.coordinateUpdate = coordinateUpdate;
  updateData.properties = this.featureCopy.properties;

  return updateData;
};
