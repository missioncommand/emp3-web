emp.editors = emp.editors || {};

/**
 * Controls the vertices on the map for a MIL-STD-2525 symbol
 * with a two points and is an arrow.  Arrows points need to be
 * reversed as they are drawing so the arrowhead stays where the user
 * is clicking.
 *
 * @param {Object} args All parmaters are members of the args object.
 * @param {string} args.feature The feature of the item we are editing.
 * @param {string} args.mapInstanceId The id of the mapInstance to which the
 * editing is occurring.
 */
emp.editors.MilStdTwoPointArrow = function(args) {
  emp.editors.EditorBase.call(this, args);
};


emp.editors.MilStdTwoPointArrow.prototype = Object.create(emp.editors.EditorBase.prototype);
emp.editors.MilStdTwoPointArrow.prototype.constructor = emp.editors.MilStdTwoPointArrow;

/**
 * Occurs when the map is clicked for the frist time after the draw has started.
 * This will just place a point on the map.
 */
emp.editors.MilStdTwoPointArrow.prototype.drawStart = function(pointer) {
  var items = [],
    transaction,
    updateData,
    controlPoint,
    vertex;

  // create the feature, don't populate the coordinate, we will populate later
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

  vertex = new emp.editors.Vertex(controlPoint, "vertex");
  this.vertices.push(vertex);

  // create the feature, don't populate the coordinate, we will populate later
  this.featureCopy = new emp.typeLibrary.Feature({
    overlayId: this.featureCopy.overlayId,
    featureId: this.featureCopy.featureId,
    format: this.featureCopy.format,
    data: {
      type: "LineString",
      coordinates: this.vertices.getVerticesAsLineString(),
      symbolCode: this.featureCopy.symbolCode
    },
    properties: this.featureCopy.properties
  });

  items.push(controlPoint);

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

  return updateData;
};

/**
 * Occurs when the map is clicked for the frist time after the draw has started.
 * This will just place a point on the map.
 */
emp.editors.MilStdTwoPointArrow.prototype.drawClick = function(pointer) {
  var controlPoint,
    vertex,
    items = [],
    transaction,
    updateData;

  if (this.vertices.vertexLength < 2) {
    // create the feature, don't populate the coordinate, we will populate later
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

    vertex = new emp.editors.Vertex(controlPoint, "vertex");
    this.vertices.insert(this.vertices.head.feature.featureId, vertex);

    this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();

    items.push(this.featureCopy);
    items.push(controlPoint);

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

    updateData = this.getUpdateData();
  }

  return updateData;

};
