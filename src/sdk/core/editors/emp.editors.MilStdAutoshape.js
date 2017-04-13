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
  emp.editors.EditorBase.call(this, args);

  var symbolDef = emp.util.getSymbolDef(args.feature);

  // holds the map that this editor was made for.
  this.mapInstance = args.mapInstance;

  // get the draw category of the symbol
  this.drawCategory = symbolDef.drawCategory;

  // determine the number of points in the symbol.
  this.numPoints = symbolDef.minPoints;
  this.numPoints = symbolDef.maxPoints;

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
        iconUrl: emp.ui.images.editPoint,
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
        iconUrl: emp.ui.images.editPoint,
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
        iconUrl: emp.ui.images.editPoint,
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
    transaction;

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
      break;
    case 3:
      items = this.calculateThreePointShape(width, height, pointer.lon, pointer.lat);
      break;
    case 4:
      items = this.calculateFourPointShape(width, height, pointer.lon, pointer.lat);
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
};

/**
 * Occurs after the draw has started and user is moving mouse.
 * Animation should occur here.
 */
emp.editors.MilStdAutoshape.prototype.drawMove = function( /*pointer*/ ) {
  //
};
