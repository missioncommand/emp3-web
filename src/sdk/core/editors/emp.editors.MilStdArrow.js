/*global LatLon*/
emp.editors = emp.editors || {};

emp.editors.MilStdArrow = function(args) {
  this.animation = undefined;
  emp.editors.Path.call(this, args);

  this.calculateAddPoints = function() {

  };
};

emp.editors.MilStdArrow.prototype = Object.create(emp.editors.Path.prototype);
emp.editors.MilStdArrow.prototype.constructor = emp.editors.MilStdArrow;

/**
 * Occurs when the map is clicked after the draw has started.
 */
emp.editors.MilStdArrow.prototype.drawClick = function(pointer) {
  var coordinateUpdate,
    updateData = {},
    controlPoint,
    vertex,
    addVertex,
    items = [],
    newCoordinates,
    index,
    updateTransaction,
    midpoint,
    addPoint;


  // Verify this point is different than the last point. Otherwise ignore.
  if (this.vertices.tail.feature.data.coordinates[0] !== pointer.lon ||
    this.vertices.tail.feature.data.coordinates[1] !== pointer.lat) {

    // create a midPoint vertex.
    // find the mid point between this point and the next point.
    var pt1 = new LatLon(this.vertices.head.feature.data.coordinates[1], this.vertices.head.feature.data.coordinates[0]);
    var pt2 = new LatLon(pointer.lat, pointer.lon);

    // Get the mid point between this vertex and the next vertex.
    var pt3 = pt1.midpointTo(pt2);
    midpoint = [pt3.lon(), pt3.lat()];

    // create a feature for each of these coordinates.  This
    // will be our 'add point'
    addPoint = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: midpoint,
        type: 'Point'
      },
      properties: {
        iconUrl: emp.ui.images.addPoint,
        iconXOffset: 6,
        iconYOffset: 6,
        xUnits: "pixels",
        yUnits: "pixels",
        altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
      }
    });

    // create new vertex.
    controlPoint = new emp.typeLibrary.Feature({
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

    addVertex = new emp.editors.Vertex(addPoint, "add");
    vertex = new emp.editors.Vertex(controlPoint, "vertex");

    // For an arrow, we want to put the vertices in backwards.
    this.vertices.insert(this.vertices.head.feature.featureId, addVertex);
    this.vertices.insert(this.vertices.head.feature.featureId, vertex);

    items.push(addPoint);
    items.push(controlPoint);

    // update feature copy
    this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();

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
    newCoordinates = [];
    for (var i = 0; i < this.featureCopy.data.coordinates.length; i++) {
      newCoordinates.push({
        lat: this.featureCopy.data.coordinates[i][1],
        lon: this.featureCopy.data.coordinates[i][0]
      });
    }

    index = this.vertices.length - 1;

    coordinateUpdate = {
      type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
      indices: [index],
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
emp.editors.MilStdArrow.prototype.drawMove = function() {

};
